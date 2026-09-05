import { redisClient, isRedisAvailable } from '../config/redis.js';
import { logger } from '../utils/logger.js';

class CacheService {
  private memoryCache: Map<string, { value: string; expiry: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    try {
      if (isRedisAvailable && redisClient) {
        const data = await redisClient.get(key);
        return data ? (JSON.parse(data) as T) : null;
      }
    } catch (error) {
      logger.warn(`Redis get failed for key ${key}, falling back to memory`);
    }

    // Memory cache fallback
    const item = this.memoryCache.get(key);
    if (item) {
      if (Date.now() > item.expiry) {
        this.memoryCache.delete(key);
        return null;
      }
      return JSON.parse(item.value) as T;
    }
    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (isRedisAvailable && redisClient) {
        await redisClient.setex(key, ttlSeconds, serialized);
        return;
      }
    } catch (error) {
      logger.warn(`Redis set failed for key ${key}, falling back to memory`);
    }

    // Memory cache fallback
    this.memoryCache.set(key, {
      value: serialized,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    try {
      if (isRedisAvailable && redisClient) {
        await redisClient.del(key);
      }
    } catch (error) {
      logger.warn(`Redis del failed for key ${key}`);
    }
    this.memoryCache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      if (isRedisAvailable && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    } catch (error) {
      logger.warn(`Redis delPattern failed for pattern ${pattern}`);
    }

    // Clear matching memory keys
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();
