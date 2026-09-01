const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokens');
const { ACCESS_COOKIE } = require('../utils/cookies');
const prisma = require('../config/prisma');

/**
 * Requires a valid access token. On success, req.user is set to a small,
 * trusted snapshot of the caller — controllers/services should re-fetch
 * anything beyond id/role/linked-profile ids from the database rather than
 * trusting stale token claims for business data.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    throw ApiError.unauthorized('You must be logged in to do that.', 'NO_TOKEN');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { employee: true, student: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('This account is no longer active.', 'ACCOUNT_INACTIVE');
  }

  req.user = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    employeeId: user.employee?.id ?? null,
    studentId: user.student?.id ?? null,
  };

  next();
});

module.exports = { requireAuth };
