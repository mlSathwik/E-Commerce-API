import { PrismaClient } from '@prisma/client';

let prisma: any;

declare global {
  var __prisma: any | undefined;
}

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.__prisma) {
      global.__prisma = new PrismaClient({
        log: ['error', 'warn'],
      });
    }
    prisma = global.__prisma;
  }
} catch (error) {
  // If prisma client was not generated yet or fails to initialize
  prisma = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === '$queryRaw') {
          return async () => {
            throw new Error('Prisma engine offline');
          };
        }
        if (prop === '$disconnect' || prop === '$connect') {
          return async () => {};
        }
        return undefined;
      },
    }
  );
}

export { prisma };
