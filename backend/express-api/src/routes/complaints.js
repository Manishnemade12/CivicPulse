// src/routes/complaints.js
// Mirrors Spring's ComplaintController (anonymous complaint system)
//
// POST   /api/complaints               — create a complaint (public, anonymous)
// GET    /api/complaints/my            — list complaints by ?anonymousUserHash=
// GET    /api/complaints/:id           — get complaint detail by id + anonHash
// DELETE /api/complaints/:id           — delete complaint by id + anonHash
// GET    /api/public-complaints        — all complaints (admin/public list, no anonHash)
// GET    /api/public-complaints/:id    — single complaint detail (no anonHash)

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool   = require('../config/db');
const { validate, z } = require('../middleware/validate');
const { AppError }    = require('../middleware/errorHandler');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatArea(row) {
  // row has area_city, area_zone, area_ward
  let s = row.area_city || '';
  if (row.area_zone) s += ` — ${row.area_zone}`;
  if (row.area_ward) s += ` — ${row.area_ward}`;
  return s;
}

// ── Zod schemas ──────────────────────────────────────────────────────────────

const createComplaintSchema = z.object({
  areaId:            z.string().uuid(),
  categoryId:        z.string().uuid(),
  anonymousUserHash: z.string().min(10).max(255),
  title:             z.string().min(1).max(200),
  description:       z.string().min(1),
  images:            z.array(z.string().max(2048)).optional().nullable(),
});

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/complaints
 * Body: { areaId, categoryId, anonymousUserHash, title, description, images? }
 * Public. Creates a new anonymous complaint.
 */
router.post('/', validate(createComplaintSchema), async (req, res, next) => {
  try {
    const { areaId, categoryId, anonymousUserHash, title, description, images } = req.body;

    // Verify area exists
    const areaResult = await pool.query('SELECT id FROM areas WHERE id = $1', [areaId]);
    if (areaResult.rows.length === 0) throw AppError.notFound('Area not found');

    // Verify category exists
    const catResult = await pool.query('SELECT id FROM complaint_categories WHERE id = $1', [categoryId]);
    if (catResult.rows.length === 0) throw AppError.notFound('Category not found');

    const id = uuidv4();
    const imagesArr = images && images.length > 0 ? images : null;

    await pool.query(
      `INSERT INTO complaints (id, area_id, category_id, anonymous_user_hash, title, description, images, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'RAISED', NOW(), NOW())`,
      [id, areaId, categoryId, anonymousUserHash, title, description, imagesArr]
    );

    return res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/complaints/my?anonymousUserHash=<hash>
 * Public. Returns list of complaints for the given anonymous hash.
 */
router.get('/my', async (req, res, next) => {
  try {
    const anonHash = req.query.anonymousUserHash;
    if (!anonHash || anonHash.length < 10 || anonHash.length > 255) {
      throw AppError.badRequest('anonymousUserHash query param is required (10-255 chars)');
    }

    const result = await pool.query(
      `SELECT id, title, status, created_at, updated_at
       FROM complaints
       WHERE anonymous_user_hash = $1
       ORDER BY created_at DESC`,
      [anonHash]
    );

    return res.json(result.rows.map((c) => ({
      id:        c.id,
      title:     c.title,
      status:    c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/complaints/:id?anonymousUserHash=<hash>
 * Public. Returns complaint detail — only for the owner (matched by anonHash).
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const anonHash = req.query.anonymousUserHash;
    if (!anonHash || anonHash.length < 10 || anonHash.length > 255) {
      throw AppError.badRequest('anonymousUserHash query param is required (10-255 chars)');
    }

    const result = await pool.query(
      `SELECT id, title, description, status, images, created_at, updated_at
       FROM complaints
       WHERE id = $1 AND anonymous_user_hash = $2`,
      [id, anonHash]
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

/**
 * DELETE /api/complaints/:id?anonymousUserHash=<hash>
 * Public. Deletes a complaint — only if it belongs to the anonymous user.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const anonHash = req.query.anonymousUserHash;
    if (!anonHash || anonHash.length < 10 || anonHash.length > 255) {
      throw AppError.badRequest('anonymousUserHash query param is required (10-255 chars)');
    }

    // Defensive cleanup of complaint actions (mirrors Spring's complaintActionRepository.deleteByComplaintId)
    await pool.query('DELETE FROM complaint_actions WHERE complaint_id = $1', [id]);

    const result = await pool.query(
      'DELETE FROM complaints WHERE id = $1 AND anonymous_user_hash = $2',
      [id, anonHash]
    );
    if (result.rowCount === 0) throw AppError.notFound('Complaint not found');

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
