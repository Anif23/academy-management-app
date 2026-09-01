const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const env = require('../config/env');

function mapPrismaError(err) {
  // Defensive: if @prisma/client hasn't been generated yet (e.g. someone
  // forgot to run `prisma generate` after install), Prisma's error classes
  // may not exist. The error handler must never itself crash — that's the
  // app's last line of defense.
  const KnownRequestError = Prisma?.PrismaClientKnownRequestError;
  if (typeof KnownRequestError !== 'function') return null;

  if (err instanceof KnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return ApiError.conflict(`A record with this ${field} already exists.`, 'DUPLICATE_VALUE');
    }
    if (err.code === 'P2025') {
      return ApiError.notFound('The requested record was not found.', 'NOT_FOUND');
    }
    if (err.code === 'P2003') {
      return ApiError.badRequest('This action references a record that does not exist or is still in use.', 'INVALID_REFERENCE');
    }
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const prismaMapped = mapPrismaError(err);
  const apiError = prismaMapped || (err instanceof ApiError ? err : null);

  const statusCode = apiError?.statusCode || 500;
  const errorCode = apiError?.errorCode || 'INTERNAL_ERROR';
  const message = apiError?.message || 'Something went wrong. Please try again.';

  if (statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled server error');
  } else {
    logger.warn({ errorCode, path: req.path, method: req.method }, message);
  }

  const body = { success: false, message, errorCode };
  if (apiError?.details) body.details = apiError.details;
  // Stack traces and raw error internals never leave the server, even in
  // development — logs are the place for that, not API responses.
  if (!env.isProduction && statusCode >= 500) {
    body.debug = err.message;
  }

  res.status(statusCode).json(body);
}

module.exports = errorMiddleware;
