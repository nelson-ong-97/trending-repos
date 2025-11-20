import { Redis } from '@upstash/redis';
import './env'; // Load environment variables first

// Make Redis optional for development - will throw error when used if not configured
let redisInstance: Redis | null = null;

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  redisInstance = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });
}

export const redis = redisInstance || (() => {
  console.log("process.env.UPSTASH_REDIS_URL", process.env.UPSTASH_REDIS_URL);
  console.log("process.env.UPSTASH_REDIS_TOKEN", process.env.UPSTASH_REDIS_TOKEN);
  throw new Error('Redis is not configured. Please set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN environment variables.');
})() as Redis;

