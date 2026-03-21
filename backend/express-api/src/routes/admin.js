// src/routes/admin.js
// Mirrors Spring's AdminComplaintController
//
// GET  /api/admin/complaints              — list complaints (filter by ?status=&areaId=)
// POST /api/admin/complaints/:id/status   — update complaint status + auto-post on RESOLVED

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool       = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const requireAdmin    = require('../middleware/requireAdmin');
const { validate, z } = require('../middleware/validate');
const { AppError }    = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth + admin guard to all routes in this router
router.use(requireAuth, requireAdmin);

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['RAISED', 'IN_PROGRESS', 'RESOLVED'];

function formatArea(row) {
  let s = row.area_city || '';
  if (row.area_zone) s += ` — ${row.area_zone}`;
  if (row.area_ward) s += ` — ${row.area_ward}`;
  return s;
}

// ── Zod schemas ──────────────────────────────────────────────────────────────

const updateStatusSchema = z.object({
  status:  z.string().min(1),
  comment: z.string().max(500).optional().nullable(),
});

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/complaints?status=RAISED&areaId=<uuid>
 * Admin only. Returns complaints with optional status / area filters.
 */
router.get('/complaints', async (req, res, next) => {
  try {
    const { status, areaId } = req.query;

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      throw AppError.badRequest('Invalid status value. Must be one of: RAISED, IN_PROGRESS, RESOLVED');
    }

    // Build dynamic WHERE clause
    const conditions = [];
    const params     = [];
    let   idx        = 1;

    if (status) {
      conditions.push(`c.status = $${idx++}::complaint_status`);
      params.push(status);
    }
    if (areaId) {
      conditions.push(`c.area_id = $${idx++}`);
      params.push(areaId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.status,
         c.created_at,
         a.id   AS area_id,
         a.city AS area_city,
         a.zone AS area_zone,
         a.ward AS area_ward,
         cat.id   AS category_id,
         cat.name AS category_name
       FROM complaints c
       JOIN areas a                  ON a.id   = c.area_id
       JOIN complaint_categories cat ON cat.id = c.category_id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
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
 * POST /api/admin/complaints/:id/status
 * Admin only.
 * Body: { status, comment? }
 * Logic:
 *   1. Update complaint status
 *   2. Log a complaint_action (STATUS_UPDATE)
 *   3. If transition → RESOLVED: auto-create a RESOLVED_COMPLAINT community post (de-duped)
 */
router.post('/complaints/:id/status', validate(updateStatusSchema), async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status: newStatus, comment } = req.body;

    if (!VALID_STATUSES.includes(newStatus)) {
      throw AppError.badRequest('Invalid status value. Must be one of: RAISED, IN_PROGRESS, RESOLVED');
    }

    // Fetch complaint
    const complaintResult = await client.query(
      'SELECT id, title, status FROM complaints WHERE id = $1',
      [id]
    );
    const complaint = complaintResult.rows[0];
    if (!complaint) throw AppError.notFound('Complaint not found');

    const previousStatus = complaint.status;

    // Fetch admin user (to log action)
    const adminResult = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [req.user.id]
    );
    if (adminResult.rows.length === 0) throw AppError.notFound('Admin user not found');

    // 1. Update complaint status
    await client.query(
      `UPDATE complaints SET status = $1::complaint_status, updated_at = NOW() WHERE id = $2`,
      [newStatus, id]
    );

    // 2. Log complaint action
    await client.query(
      `INSERT INTO complaint_actions (id, complaint_id, admin_id, action, comment, created_at)
       VALUES ($1, $2, $3, 'STATUS_UPDATE', $4, NOW())`,
      [uuidv4(), id, req.user.id, comment || null]
    );

    // 3. Auto-post community post when resolving
    if (previousStatus !== 'RESOLVED' && newStatus === 'RESOLVED') {
      const suffix    = `: ${complaint.title}`;
      const prefix    = `Resolved [${complaint.id}]`;
      let   postTitle = `${prefix}${suffix}`;
      if (postTitle.length > 200) postTitle = postTitle.substring(0, 200);

      // De-duplicate: only create if this title doesn't already exist
      const existsResult = await client.query(
        `SELECT id FROM community_posts WHERE type = 'RESOLVED_COMPLAINT' AND title = $1`,
        [postTitle]
      );

      if (existsResult.rows.length === 0) {
        const trimmedComment = comment ? comment.trim() : '';
        const postContent = [
          'Complaint resolved.',
          '',
          `ComplaintId: ${complaint.id}`,
          trimmedComment ? `Resolution note: ${trimmedComment}` : '',
        ].filter((line, i) => i < 3 || line !== '').join('\n');

        await client.query(
          `INSERT INTO community_posts (id, user_id, type, title, content, media_urls, created_at)
           VALUES ($1, NULL, 'RESOLVED_COMPLAINT', $2, $3, NULL, NOW())`,
          [uuidv4(), postTitle, postContent]
        );
      }
    }

    await client.query('COMMIT');
    return res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
