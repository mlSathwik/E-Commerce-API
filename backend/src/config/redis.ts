// MOCKED — in-memory store for AI Studio container environment
const store = new Map<string, string>();

let redisClient: any = {
  get: async (key: string): Promise<string | null> => {
    return store.get(key) ?? null;
  },
  set: async (key: string, value: string): Promise<string> => {
    store.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: string): Promise<string> => {
    store.set(key, value);
    return 'OK';
  },
  del: async (...keys: string[]): Promise<number> => {
    let count = 0;
    for (const key of keys) {
      if (store.delete(key)) count++;
    }
    return count;
  },
  keys: async (pattern: string): Promise<string[]> => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(store.keys()).filter((k) => regex.test(k));
  },
  connect: async () => {},
  on: () => redisClient,
};

const isRedisAvailable = true;

export { redisClient, isRedisAvailable };
export const getRedisStatus = () => isRedisAvailable;
