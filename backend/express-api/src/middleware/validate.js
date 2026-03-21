// src/middleware/validate.js
// Zod-based request body validation middleware (replaces Jakarta Bean Validation)
const { z } = require('zod');

/**
 * validate(schema) — returns Express middleware that validates req.body against a Zod schema.
 * On failure → 422 with list of field errors.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Validation failed',
          errors,
        }
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate, z };
