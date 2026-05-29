import { Redis } from '@upstash/redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface InMemoryBucket {
  count: number;
  resetAt: number;
}

const memBuckets = new Map<string, InMemoryBucket>();
let redisClient: Redis | null = null;
let redisConfigKey = '';

function memRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = memBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    memBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const configKey = `${url}:${token}`;
  if (!redisClient || redisConfigKey !== configKey) {
    redisClient = new Redis({ url, token });
    redisConfigKey = configKey;
  }

  return redisClient;
}

export async function checkRateLimit(
  userId: string,
  limit: number,
  windowMs: number,
  scope = 'gemini',
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const normalizedScope = scope.replace(/[^a-z0-9:_-]/gi, '_').slice(0, 64) || 'default';

  if (!redis) {
    return memRateLimit(`rate:${normalizedScope}:${userId}`, limit, windowMs);
  }

  const key = `rate:${normalizedScope}:${userId}`;
  const windowSec = Math.ceil(windowMs / 1000);
  const now = Date.now();

  try {
    const [count, , ttl] = await redis
      .pipeline()
      .incr(key)
      .expire(key, windowSec, 'NX')
      .ttl(key)
      .exec<[number, 0 | 1, number]>();

    const ttlSec = ttl > 0 ? ttl : windowSec;
    const resetAt = now + ttlSec * 1000;
    const remaining = Math.max(0, limit - count);

    return { allowed: count <= limit, remaining, resetAt };
  } catch (error) {
    console.warn('[rate-limit] Upstash failed, falling back to memory', error);
    return memRateLimit(`rate:${normalizedScope}:${userId}`, limit, windowMs);
  }
}
