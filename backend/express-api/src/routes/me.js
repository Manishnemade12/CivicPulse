// src/routes/me.js
// GET /api/me  →  return the authenticated user's profile
const express = require('express');
const supabase = require('../config/supabase');
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
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', req.user.id)
      .limit(1);

    if (error) throw error;
    const user = users && users[0];
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
