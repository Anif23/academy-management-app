const redis = require('../config/redis');
const logger = require('../config/logger');

/**
 * Read-through cache for cheap-to-serve, expensive-to-recompute public data
 * (academy info, course listings, stats, testimonials/FAQs/announcements).
 * Falls back straight to `fetcher()` with no caching if Redis isn't
 * configured or is briefly down — correctness never depends on the cache.
 *
 * @param {string} key        Cache key, e.g. 'public:academy'
 * @param {number} ttlSeconds How long a cached value is served before refetching
 * @param {() => Promise<any>} fetcher Loads the real value on a cache miss
 */
async function cached(key, ttlSeconds, fetcher) {
  const hit = await redis.get(key);
  if (hit !== null) {
    try {
      return JSON.parse(hit);
    } catch (err) {
      logger.warn({ key, err: err.message }, 'Corrupt cache entry, refetching');
    }
  }
  const value = await fetcher();
  // Cache "no data yet" too (e.g. an empty announcements list) — still saves
  // a DB round trip, and a short TTL means it corrects itself quickly.
  await redis.set(key, JSON.stringify(value ?? null), ttlSeconds);
  return value;
}

/** Call after any write that would make one or more cached keys stale. */
async function invalidate(...keys) {
  await Promise.all(keys.map((key) => redis.del(key)));
}

module.exports = { cached, invalidate };
