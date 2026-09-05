import Redis from 'ioredis';
import { env } from './env.js';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts
      }
      return Math.min(times * 100, 1000);
    },
    enableOfflineQueue: false,
    connectTimeout: 2000,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('✅ Connected to Redis cache service');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    // Suppress repeated connection logs if redis server is offline
    if (process.env.NODE_ENV !== 'production') {
      // Quiet failover
    }
  });

  // Attempt initial connect asynchronously
  redisClient.connect().catch(() => {
    isRedisAvailable = false;
    console.log('ℹ️ Redis is offline or unavailable. Running in Direct Database mode.');
  });
} catch (error) {
  isRedisAvailable = false;
  console.log('ℹ️ Redis initialization skipped. Running in Direct Database mode.');
}

export { redisClient, isRedisAvailable };
export const getRedisStatus = () => isRedisAvailable;
