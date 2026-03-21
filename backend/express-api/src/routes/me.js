// src/routes/me.js
// GET /api/me  →  return the authenticated user's profile
const express = require('express');
const pool    = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { AppError }    = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/me
 * Auth: Required (Bearer JWT)
 * Returns: { id, name, email, role, createdAt }
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) throw AppError.notFound('User not found');

    return res.json({
      id:        user.id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
