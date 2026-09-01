const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

let client = null;

if (env.redisUrl) {
  client = new Redis(env.redisUrl, {
    // Don't crash the whole app if Redis is briefly unavailable — Redis here
    // is used for rate limiting and OTP-style temporary data, not for
    // anything the app can't function without.
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    lazyConnect: true,
  });

  client.on('error', (err) => {
    logger.warn({ err: err.message }, 'Redis connection error — continuing without cache');
  });

  client.connect().catch((err) => {
    logger.warn({ err: err.message }, 'Redis unavailable at startup — continuing without cache');
  });
}

/**
 * Safe wrapper so callers never need to check "is Redis configured/up" —
 * every operation just resolves to a no-op if Redis isn't available.
 */
const redis = {
  isEnabled: () => Boolean(client) && client.status === 'ready',
  async get(key) {
    if (!redis.isEnabled()) return null;
    try {
      return await client.get(key);
    } catch {
      return null;
    }
  },
  async set(key, value, ttlSeconds) {
    if (!redis.isEnabled()) return;
    try {
      if (ttlSeconds) await client.set(key, value, 'EX', ttlSeconds);
      else await client.set(key, value);
    } catch {
      // Swallow — caching is a performance optimization, not a dependency.
    }
  },
  async del(key) {
    if (!redis.isEnabled()) return;
    try {
      await client.del(key);
    } catch {
      // no-op
    }
  },
  async incr(key, ttlSeconds) {
    if (!redis.isEnabled()) return null;
    try {
      const count = await client.incr(key);
      if (count === 1 && ttlSeconds) await client.expire(key, ttlSeconds);
      return count;
    } catch {
      return null;
    }
  },
};

module.exports = redis;
