// src/middleware/requireAdmin.js
// Role guard — allows only ADMIN users (mirrors Spring's .hasRole("ADMIN"))
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  next();
}

module.exports = requireAdmin;
