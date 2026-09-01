const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, generateRefreshToken, hashRefreshToken } = require('../utils/tokens');

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || '',
    phone: user.phone || '',
    status: user.status,
    avatar: user.avatar || '',
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

module.exports = { login, register, refresh, logout, getCurrentUser, updateProfile, toPublicUser };
