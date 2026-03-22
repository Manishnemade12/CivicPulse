// src/routes/reference.js
// GET /api/areas                →  list all areas (public)
// GET /api/complaint-categories →  list all categories (public)
const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/areas
 * Public. Returns areas sorted by city → zone → ward.
 */
router.get('/areas', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('id, city, zone, ward')
      .order('city', { ascending: true })
      .order('zone', { ascending: true })
      .order('ward', { ascending: true });

    if (error) throw error;
    return res.json(data || []);
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
    const { data, error } = await supabase
      .from('complaint_categories')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
