const env = require('../config/env');

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    // 'lax' allows the cookie to be sent on top-level navigation while still
    // blocking it from being attached to cross-site requests initiated by
    // other sites (the practical CSRF defense for a cookie-based session).
    sameSite: 'lax',
    path: '/',
  };
}

function setAuthCookies(res, { accessToken, refreshToken, accessTokenMaxAgeMs, refreshTokenMaxAgeMs }) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...baseCookieOptions(), maxAge: accessTokenMaxAgeMs });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...baseCookieOptions(), maxAge: refreshTokenMaxAgeMs, path: '/api/auth' });
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, baseCookieOptions());
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOptions(), path: '/api/auth' });
}

module.exports = { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies, clearAuthCookies };
