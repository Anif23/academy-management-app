/**
 * Express doesn't forward rejected promises from async handlers to
 * next(err) automatically. Wrapping every controller in this avoids
 * repeating try/catch in every single one.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
