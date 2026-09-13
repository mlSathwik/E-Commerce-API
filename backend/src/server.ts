import path from 'path';
import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { checkDatabaseConnection, initializeSeedData } from './services/db.service.js';

async function setupFrontend(app: express.Express) {
  const rootDir = process.cwd().endsWith('backend') ? path.resolve(process.cwd(), '..') : process.cwd();
  const frontendDir = path.resolve(rootDir, 'frontend');
  const distPath = path.resolve(frontendDir, 'dist');

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads') || req.originalUrl.startsWith('/images')) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    logger.info(`Serving static frontend from ${distPath}`);
    return;
  }

  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      configFile: path.resolve(frontendDir, 'vite.config.ts'),
      root: frontendDir,
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads') || req.originalUrl.startsWith('/images')) {
        return next();
      }
      try {
        const indexPath = path.resolve(frontendDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        }
        return next();
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    logger.info('Mounted Vite dev server middleware for frontend');
  } catch (viteError) {
    logger.warn('Vite dev middleware could not be loaded:', viteError);
  }
}

async function bootstrap() {
  try {
    // 1. Check PostgreSQL & initialize seed data
    await checkDatabaseConnection();
    await initializeSeedData();

    // 2. Initialize Express application
    const app = createApp();

    // 3. Mount frontend
    await setupFrontend(app);

    // 4. Start HTTP server
    const server = app.listen(3000, '0.0.0.0', () => {
      logger.info('====================================================');
      logger.info('🚀 ShopSphere REST API running on http://0.0.0.0:3000');
      logger.info('📡 Health check: http://localhost:3000/api/health');
      logger.info('📚 Swagger Documentation: http://localhost:3000/api/docs');
      logger.info(`🌐 Client allowed origin: ${env.CLIENT_URL}`);
      logger.info('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to bootstrap server:', error);
    process.exit(1);
  }
}

bootstrap();
