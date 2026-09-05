import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { checkDatabaseConnection, initializeSeedData } from './services/db.service.js';

async function bootstrap() {
  try {
    // 1. Check PostgreSQL & initialize seed data
    await checkDatabaseConnection();
    await initializeSeedData();

    // 2. Initialize Express application
    const app = createApp();

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info('====================================================');
      logger.info(`🚀 ShopSphere REST API running on port ${env.PORT}`);
      logger.info(`📡 Health check: http://localhost:${env.PORT}/api/health`);
      logger.info(`📚 Swagger Documentation: http://localhost:${env.PORT}/api/docs`);
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
