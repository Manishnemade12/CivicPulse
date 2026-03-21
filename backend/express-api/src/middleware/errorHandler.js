// src/middleware/errorHandler.js
// Global Express error handler — mirrors Spring's GlobalExceptionHandler + ErrorResponse

/**
 * AppError — custom error class with HTTP status + machine-readable code.
 */
class AppError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name   = 'AppError';
    this.code   = code;
    this.status = status;
  }

  static notFound(message = 'Not found') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static conflict(message = 'Conflict') {
    return new AppError('CONFLICT', message, 409);
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST') {
    return new AppError(code, message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', message, 401);
  }
}

/**
 * Express global error handler — must be registered LAST with 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code:    err.code,
        message: err.message
      }
    });
  }

  // Unhandled errors
  console.error('[ERROR]', err);
  return res.status(500).json({
    error: {
      code:    'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}

module.exports = { AppError, errorHandler };
