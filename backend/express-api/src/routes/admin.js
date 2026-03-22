// src/routes/admin.js
// Mirrors Spring's AdminComplaintController
//
// GET  /api/admin/complaints              — list complaints (filter by ?status=&areaId=)
// POST /api/admin/complaints/:id/status   — update complaint status + auto-post on RESOLVED

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
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

    let complaintsQuery = supabase
      .from('complaints')
      .select('id, title, status, created_at, area_id, category_id')
      .order('created_at', { ascending: false });

    if (status) complaintsQuery = complaintsQuery.eq('status', status);
    if (areaId) complaintsQuery = complaintsQuery.eq('area_id', areaId);

    const { data: complaints, error: complaintsError } = await complaintsQuery;
    if (complaintsError) throw complaintsError;

    const areaIds = [...new Set((complaints || []).map((c) => c.area_id).filter(Boolean))];
    const categoryIds = [...new Set((complaints || []).map((c) => c.category_id).filter(Boolean))];

    const [{ data: areas, error: areasError }, { data: categories, error: categoriesError }] = await Promise.all([
      areaIds.length > 0
        ? supabase.from('areas').select('id, city, zone, ward').in('id', areaIds)
        : Promise.resolve({ data: [], error: null }),
      categoryIds.length > 0
        ? supabase.from('complaint_categories').select('id, name').in('id', categoryIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (areasError) throw areasError;
    if (categoriesError) throw categoriesError;

    const areaMap = new Map((areas || []).map((a) => [a.id, a]));
    const categoryMap = new Map((categories || []).map((cat) => [cat.id, cat]));

    return res.json((complaints || []).map((c) => {
      const area = areaMap.get(c.area_id) || {};
      const category = categoryMap.get(c.category_id) || {};
      return {
      id:           c.id,
      title:        c.title,
      status:       c.status,
      areaId:       c.area_id,
      areaName:     formatArea({
        area_city: area.city,
        area_zone: area.zone,
        area_ward: area.ward,
      }),
      categoryId:   c.category_id,
      categoryName: category.name || null,
      createdAt:    c.created_at,
    };
    }));
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
  try {
    const { id } = req.params;
    const { status: newStatus, comment } = req.body;

    if (!VALID_STATUSES.includes(newStatus)) {
      throw AppError.badRequest('Invalid status value. Must be one of: RAISED, IN_PROGRESS, RESOLVED');
    }

    // Fetch complaint
    const { data: complaintRows, error: complaintError } = await supabase
      .from('complaints')
      .select('id, title, status')
      .eq('id', id)
      .limit(1);

    if (complaintError) throw complaintError;
    const complaint = complaintRows && complaintRows[0];
    if (!complaint) throw AppError.notFound('Complaint not found');

    const previousStatus = complaint.status;

    // Fetch admin user (to log action)
    const { data: adminRows, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('id', req.user.id)
      .limit(1);
    if (adminError) throw adminError;
    if ((adminRows || []).length === 0) throw AppError.notFound('Admin user not found');

    // 1. Update complaint status
    const { error: updateStatusError } = await supabase
      .from('complaints')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateStatusError) throw updateStatusError;

    // 2. Log complaint action
    const { error: actionInsertError } = await supabase
      .from('complaint_actions')
      .insert({
        id: uuidv4(),
        complaint_id: id,
        admin_id: req.user.id,
        action: 'STATUS_UPDATE',
        comment: comment || null,
      });
    if (actionInsertError) throw actionInsertError;

    // 3. Auto-post community post when resolving
    if (previousStatus !== 'RESOLVED' && newStatus === 'RESOLVED') {
      const suffix    = `: ${complaint.title}`;
      const prefix    = `Resolved [${complaint.id}]`;
      let   postTitle = `${prefix}${suffix}`;
      if (postTitle.length > 200) postTitle = postTitle.substring(0, 200);

      // De-duplicate: only create if this title doesn't already exist
      const { data: existingPosts, error: existsError } = await supabase
        .from('community_posts')
        .select('id')
        .eq('type', 'RESOLVED_COMPLAINT')
        .eq('title', postTitle)
        .limit(1);

      if (existsError) throw existsError;

      if ((existingPosts || []).length === 0) {
        const trimmedComment = comment ? comment.trim() : '';
        const postContent = [
          'Complaint resolved.',
          '',
          `ComplaintId: ${complaint.id}`,
          trimmedComment ? `Resolution note: ${trimmedComment}` : '',
        ].filter((line, i) => i < 3 || line !== '').join('\n');

        const { error: insertPostError } = await supabase
          .from('community_posts')
          .insert({
            id: uuidv4(),
            user_id: null,
            type: 'RESOLVED_COMPLAINT',
            title: postTitle,
            content: postContent,
            media_urls: null,
          });

        if (insertPostError) throw insertPostError;
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
