const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { permissionsForRole } = require('./permissionsService');
const { signAccessToken, generateRefreshToken, hashRefreshToken } = require('../utils/tokens');

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: permissionsForRole(user.role),
    department: user.department || '',
    phone: user.phone || '',
    status: user.status,
    avatar: user.avatar || '',
    mustChangePassword: user.mustChangePassword,
    studentId: user.student?.id ?? null,
    employeeId: user.employee?.id ?? null,
  };
}

async function issueSession(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  return {
    accessToken,
    refreshToken,
    accessTokenMaxAgeMs: ACCESS_TOKEN_MAX_AGE_MS,
    refreshTokenMaxAgeMs: REFRESH_TOKEN_MAX_AGE_MS,
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: true, student: true },
  });

  // Deliberately identical error for "no such user" and "wrong password" —
  // distinguishing them lets an attacker enumerate valid emails.
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'ACTIVE') {
    throw ApiError.forbidden('This account has been deactivated. Contact an administrator.', 'ACCOUNT_INACTIVE');
  }

  const session = await issueSession(user);
  return { user: toPublicUser(user), session };
}

async function register({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  const session = await issueSession(user);
  return { user: toPublicUser(user), session };
}

async function refresh(refreshTokenValue) {
  if (!refreshTokenValue) {
    throw ApiError.unauthorized('No refresh token provided.', 'NO_REFRESH_TOKEN');
  }

  const tokenHash = hashRefreshToken(refreshTokenValue);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { employee: true, student: true } } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Your session has expired. Please log in again.', 'REFRESH_TOKEN_INVALID');
  }

  if (stored.user.status !== 'ACTIVE') {
    throw ApiError.forbidden('This account has been deactivated.', 'ACCOUNT_INACTIVE');
  }

  // Rotate: revoke the used token and issue a brand new pair. This limits
  // the blast radius if a refresh token is ever stolen — it's single-use.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const session = await issueSession(stored.user);

  return { user: toPublicUser(stored.user), session };
}

async function logout(refreshTokenValue) {
  if (!refreshTokenValue) return;
  const tokenHash = hashRefreshToken(refreshTokenValue);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employee: true, student: true },
  });
  if (!user) throw ApiError.notFound('User not found.');
  return toPublicUser(user);
}

async function updateProfile(userId, patch) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: patch,
    include: { employee: true, student: true },
  });
  return toPublicUser(user);
}

/**
 * Every password change — including the forced first-login change for
 * auto-created Student/Staff accounts — goes through here. Requires the
 * current password (even for a forced change, since the "current" one is
 * the temporary email-as-password the admin set), and always clears
 * mustChangePassword on success.
 */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found.');

  const matches = await comparePassword(currentPassword, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized('Your current password is incorrect.', 'INVALID_CURRENT_PASSWORD');
  }

  const passwordHash = await hashPassword(newPassword);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
    include: { employee: true, student: true },
  });

  // Changing your password invalidates every other active session — if a
  // device/token was compromised, this is the moment that matters most —
  // then issues a fresh session for this device so the user isn't logged
  // out by the very action of securing their account.
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  const session = await issueSession(updated);

  return { user: toPublicUser(updated), session };
}

module.exports = { login, register, refresh, logout, getCurrentUser, updateProfile, changePassword, toPublicUser };
