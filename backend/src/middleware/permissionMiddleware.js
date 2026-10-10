const ApiError = require('../utils/ApiError');
const { roleHasPermission } = require('../services/permissionsService');

/**
 * requirePermission('students:update') → 403s any caller whose role doesn't
 * carry that permission. Must run after requireAuth (needs req.user).
 *
 * This is the actual authorization boundary for the app — the frontend may
 * also hide UI for permissions a user lacks, but that's UX only, never
 * treated as security by the backend.
 */
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const allowed = permissions.some((permission) => roleHasPermission(req.user.role, permission));
    if (!allowed) {
      return next(ApiError.forbidden(`Your role (${req.user.role}) does not have permission to do that.`));
    }

    next();
  };
}

/**
 * Restricts a route to specific roles outright, for cases that aren't
 * naturally expressed as a single permission (e.g. "only admins can see
 * this whole section").
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}

module.exports = { requirePermission, requireRole };
