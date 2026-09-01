const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

/**
 * Refresh tokens are opaque random strings, not JWTs. Only a hash of the
 * token is stored server-side (in the refresh_tokens table), so a stolen
 * database dump can't be replayed as a valid session, and a single token
 * can be revoked on logout without needing a JWT blacklist.
 */
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { signAccessToken, verifyAccessToken, generateRefreshToken, hashRefreshToken };
