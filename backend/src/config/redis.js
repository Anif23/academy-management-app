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

// A dedicated connection for pub/sub — once a connection issues SUBSCRIBE it
// can't be used for normal commands, so this is created lazily and kept
// separate from `client`. Used to keep the permissions cache (and similar
// in-process caches) consistent across multiple backend instances: one
// instance changes a permission, every instance (including itself) reloads.
let subscriber = null;
function getSubscriber() {
  if (!env.redisUrl) return null;
  if (!subscriber) {
    subscriber = new Redis(env.redisUrl, { lazyConnect: true, retryStrategy: (times) => Math.min(times * 200, 2000) });
    subscriber.on('error', (err) => logger.warn({ err: err.message }, 'Redis pub/sub connection error'));
    subscriber.connect().catch((err) => logger.warn({ err: err.message }, 'Redis pub/sub unavailable at startup'));
  }
  return subscriber;
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
  /** Notify every backend instance subscribed to `channel` (no-op without Redis — fine for a single instance). */
  async publish(channel, message) {
    if (!redis.isEnabled()) return;
    try {
      await client.publish(channel, message);
    } catch {
      // no-op
    }
  },
  /** `handler` fires once per message, on every instance including the publisher. Returns an unsubscribe function. */
  subscribe(channel, handler) {
    const sub = getSubscriber();
    if (!sub) return () => {};
    sub.subscribe(channel).catch((err) => logger.warn({ err: err.message }, `Failed to subscribe to ${channel}`));
    const onMessage = (ch, message) => {
      if (ch === channel) handler(message);
    };
    sub.on('message', onMessage);
    return () => sub.off('message', onMessage);
  },
  /** The raw ioredis client, for libraries (e.g. rate-limit-redis) that need it directly. Null if Redis isn't configured. */
  getRawClient: () => client,
};

module.exports = redis;
