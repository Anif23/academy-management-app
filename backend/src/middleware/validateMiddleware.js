const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * validate({ body: schema, query: schema, params: schema }) — validates and
 * REPLACES req.body/query/params with the parsed (and coerced/defaulted)
 * result, so controllers always see clean, typed data.
 */
function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((e) => ({ path: e.path.join('.'), message: e.message }));
        return next(ApiError.badRequest(details[0]?.message || 'Invalid request data.', 'VALIDATION_ERROR', details));
      }
      next(err);
    }
  };
}

module.exports = validate;
