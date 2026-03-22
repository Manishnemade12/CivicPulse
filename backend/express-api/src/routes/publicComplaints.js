// src/routes/publicComplaints.js
// GET /api/public-complaints       — all complaints (public, no anonHash required)
// GET /api/public-complaints/:id   — single complaint detail (public)
// Mirrors the @GetMapping("/api/public-complaints") endpoints in ComplaintController

const express = require('express');
const supabase = require('../config/supabase');
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
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('id, title, status, created_at, area_id, category_id')
      .order('created_at', { ascending: false });

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
 * GET /api/public-complaints/:id
 * Public. Returns full complaint detail without requiring anonHash.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('complaints')
      .select('id, title, description, status, images, created_at, updated_at')
      .eq('id', id)
      .limit(1);

    if (error) throw error;
    const c = data && data[0];
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
