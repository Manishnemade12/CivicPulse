// src/routes/reference.js
// GET /api/areas                →  list all areas (public)
// GET /api/complaint-categories →  list all categories (public)
const express = require('express');
const pool    = require('../config/db');

const router = express.Router();

/**
 * GET /api/areas
 * Public. Returns areas sorted by city → zone → ward.
 */
router.get('/areas', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, city, zone, ward FROM areas ORDER BY city ASC, zone ASC NULLS FIRST, ward ASC NULLS FIRST'
    );
    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/complaint-categories
 * Public. Returns categories sorted by name.
 */
router.get('/complaint-categories', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM complaint_categories ORDER BY name ASC'
    );
    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
