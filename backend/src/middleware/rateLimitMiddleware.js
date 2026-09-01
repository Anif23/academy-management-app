const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

function tooManyRequestsHandler(req, res, next) {
  next(new ApiError(429, 'Too many requests. Please slow down and try again shortly.', 'RATE_LIMITED'));
}

// General API traffic — generous, just here to blunt abuse/scraping.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});

// Login is the highest-value target for brute-forcing, so it gets its own,
// much stricter limiter, keyed by IP + attempted email so one bad actor
// can't lock other users out by hammering a shared IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${req.body?.email || 'unknown'}`,
  handler: tooManyRequestsHandler,
});

module.exports = { apiLimiter, loginLimiter };
