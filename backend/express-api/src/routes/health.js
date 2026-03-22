// src/routes/health.js
// GET /api/db/health  →  check DB connectivity (public)
const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/db/health
 * Public. Runs SELECT 1 on the pool to confirm DB is reachable.
 * Returns: { status: "ok" } or 503 on failure.
 */
router.get('/db/health', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    if (error) throw error;
    return res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('[DB Health] Failed:', err.message);
    return res.status(503).json({ status: 'error', database: 'unreachable', message: err.message });
  }
});

module.exports = router;
