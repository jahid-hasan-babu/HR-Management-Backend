import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("❌ Cache Redis error:", err.message);
});

// Cache TTL in seconds
const DEFAULT_TTL = 300; // 5 minutes

export const cache = {
  /**
   * Get cached data or fetch from source
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis error - fallback to fetch
    }

    const data = await fetchFn();

    // Cache in background
    redis.setex(key, ttl, JSON.stringify(data)).catch(() => {});

    return data;
  },

  /**
   * Invalidate cache by key
   */
  async invalidate(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch {
      // Ignore errors
    }
  },

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Ignore errors
    }
  },
};

export default cache;
