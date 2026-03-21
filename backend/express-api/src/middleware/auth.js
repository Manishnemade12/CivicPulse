// src/middleware/auth.js
// JWT authentication middleware
const { verifyToken } = require('../config/jwt');

class AppError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code   = code;
    this.status = status;
  }
}

/**
 * requireAuth — throws 401 if no valid Bearer token.
 * Attaches req.user = { id, email, role }
 */
function requireAuth(req, res, next) {
  try {
    const user = extractUser(req);
    if (!user) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid auth token' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid auth token' });
  }
}

/**
 * optionalAuth — attaches req.user if a valid token is present, continues otherwise.
 */
function optionalAuth(req, res, next) {
  try {
    req.user = extractUser(req) || null;
  } catch {
    req.user = null;
  }
  next();
}

function extractUser(req) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  if (!token) return null;
  const decoded = verifyToken(token);
  return {
    id:    decoded.sub,
    email: decoded.email,
    role:  decoded.role,
  };
}

module.exports = { requireAuth, optionalAuth, AppError };
