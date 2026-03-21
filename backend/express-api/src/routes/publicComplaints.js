// src/routes/publicComplaints.js
// GET /api/public-complaints       — all complaints (public, no anonHash required)
// GET /api/public-complaints/:id   — single complaint detail (public)
// Mirrors the @GetMapping("/api/public-complaints") endpoints in ComplaintController

const express = require('express');
const pool    = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

function formatArea(row) {
  let s = row.area_city || '';
  if (row.area_zone) s += ` — ${row.area_zone}`;
  if (row.area_ward) s += ` — ${row.area_ward}`;
  return s;
}

/**
 * GET /api/public-complaints
 * Public. Returns all complaints ordered by created_at desc (summary list).
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.status,
         c.created_at,
         a.id    AS area_id,
         a.city  AS area_city,
         a.zone  AS area_zone,
         a.ward  AS area_ward,
         cat.id  AS category_id,
         cat.name AS category_name
       FROM complaints c
       JOIN areas a              ON a.id = c.area_id
       JOIN complaint_categories cat ON cat.id = c.category_id
       ORDER BY c.created_at DESC`
    );

    return res.json(result.rows.map((c) => ({
      id:           c.id,
      title:        c.title,
      status:       c.status,
      areaId:       c.area_id,
      areaName:     formatArea(c),
      categoryId:   c.category_id,
      categoryName: c.category_name,
      createdAt:    c.created_at,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/public-complaints/:id
 * Public. Returns full complaint detail without requiring anonHash.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, title, description, status, images, created_at, updated_at
       FROM complaints WHERE id = $1`,
      [id]
    );
    const c = result.rows[0];
    if (!c) throw AppError.notFound('Complaint not found');

    return res.json({
      id:          c.id,
      title:       c.title,
      description: c.description,
      status:      c.status,
      images:      c.images || [],
      createdAt:   c.created_at,
      updatedAt:   c.updated_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
