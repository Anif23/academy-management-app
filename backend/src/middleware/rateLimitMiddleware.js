const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const ApiError = require('../utils/ApiError');
const redis = require('../config/redis');
const logger = require('../config/logger');

function tooManyRequestsHandler(req, res, next) {
  next(new ApiError(429, 'Too many requests. Please slow down and try again shortly.', 'RATE_LIMITED'));
}

/**
 * express-rate-limit's default store keeps counts in the process's own
 * memory. That's fine for a single instance, but once the app scales to
 * more than one backend instance behind a load balancer, each instance
 * would count independently — a client hitting different instances could
 * get roughly N× the intended limit, and a brute-forcer could dodge the
 * login limiter just by getting round-robined across instances.
 *
 * Backed by Redis, every instance shares the same counters. Without
 * REDIS_URL configured this returns undefined, and express-rate-limit
 * falls back to its built-in in-memory store — correct for local/single-
 * instance use, just not shared across instances.
 */
function redisStoreOrDefault(prefix) {
  const client = redis.getRawClient();
  if (!client) return undefined;
  return new RedisStore({
    prefix,
    sendCommand: (command, ...args) => client.call(command, ...args),
  });
}

// General API traffic — generous, just here to blunt abuse/scraping.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStoreOrDefault('rl:api:'),
  handler: tooManyRequestsHandler,
});

// Login is the highest-value target for brute-forcing, so it gets its own,
// much stricter limiter, keyed by IP + attempted email so one bad actor
// can't lock other users out by hammering a shared IP. Sharing this store
// across instances via Redis matters even more here than for `apiLimiter` —
// this is exactly the limiter an attacker is trying to dodge.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStoreOrDefault('rl:login:'),
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${req.body?.email || 'unknown'}`,
  handler: tooManyRequestsHandler,
});

if (!redis.getRawClient()) {
  logger.info('REDIS_URL not set — rate limiting is per-instance in-memory (fine for a single backend instance).');
}

module.exports = { apiLimiter, loginLimiter };
