const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } = require('../utils/cookies');

const login = asyncHandler(async (req, res) => {
  const { user, session } = await authService.login(req.body);
  setAuthCookies(res, session);
  res.json({ success: true, data: user });
});

const register = asyncHandler(async (req, res) => {
  const { user, session } = await authService.register(req.body);
  setAuthCookies(res, session);
  res.status(201).json({ success: true, data: user });
});

const refresh = asyncHandler(async (req, res) => {
  const { user, session } = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
  setAuthCookies(res, session);
  res.json({ success: true, data: user });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: user, message: 'Profile updated successfully.' });
});

module.exports = { login, register, refresh, logout, me, updateMe };
