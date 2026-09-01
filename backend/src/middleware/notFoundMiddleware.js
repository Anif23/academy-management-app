const ApiError = require('../utils/ApiError');

function notFoundMiddleware(req, res, next) {
  next(ApiError.notFound(`No route found for ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

module.exports = notFoundMiddleware;
