// src/routes/community.js
// Mirrors Spring's CommunityController (Social Hub)
//
// GET    /api/community/feed                              — top 50 posts (optional auth)
// GET    /api/community/me/posts                          — my posts (auth required)
// POST   /api/community/posts                             — create post (auth required)
// PUT    /api/community/posts/:id                         — update own post (auth required)
// DELETE /api/community/posts/:id                         — delete own post (auth required)
// GET    /api/community/posts/:id/comments                — list comments (public)
// POST   /api/community/posts/:id/comments                — add comment (auth required)
// DELETE /api/community/posts/:postId/comments/:commentId — delete own comment (auth required)
// POST   /api/community/posts/:id/like                    — like post (auth required, idempotent)
// DELETE /api/community/posts/:id/like                    — unlike post (auth required)

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool           = require('../config/db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate, z }               = require('../middleware/validate');
const { AppError }                  = require('../middleware/errorHandler');

const router = express.Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────

const createPostSchema = z.object({
  title:     z.string().max(200).optional().nullable(),
  content:   z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().max(2048)).optional().nullable(),
});

const updatePostSchema = z.object({
  title:     z.string().max(200).optional().nullable(),
  content:   z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().max(2048)).optional().nullable(),
});

const createCommentSchema = z.object({
  comment: z.string().min(1).max(1000),
});

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/community/feed
 * Optional auth. Returns top 50 posts with like/comment counts and likedByMe flag.
 */
router.get('/feed', optionalAuth, async (req, res, next) => {
  try {
    const meId = req.user ? req.user.id : null;

    const result = await pool.query(
      `SELECT
         p.id,
         p.type,
         p.title,
         p.content,
         p.media_urls,
         p.created_at,
         u.id   AS author_id,
         u.name AS author_name,
         (SELECT COUNT(*) FROM post_likes   pl WHERE pl.post_id = p.id)::int AS like_count,
         (SELECT COUNT(*) FROM comments      c  WHERE c.post_id  = p.id)::int AS comment_count
       FROM community_posts p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 50`
    );

    // Batch liked-by-me check for the current user
    let likedSet = new Set();
    if (meId && result.rows.length > 0) {
      const postIds = result.rows.map((r) => r.id);
      const likesResult = await pool.query(
        'SELECT post_id FROM post_likes WHERE user_id = $1 AND post_id = ANY($2::uuid[])',
        [meId, postIds]
      );
      likedSet = new Set(likesResult.rows.map((r) => r.post_id));
    }

    return res.json(result.rows.map((p) => ({
      id:           p.id,
      type:         p.type,
      title:        p.title,
      content:      p.content,
      mediaUrls:    p.media_urls || [],
      createdAt:    p.created_at,
      authorName:   p.author_name || 'Anonymous User',
      authorId:     p.author_id   || null,
      likeCount:    p.like_count,
      commentCount: p.comment_count,
      likedByMe:    likedSet.has(p.id),
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/community/me/posts
 * Auth required. Returns the authenticated user's posts.
 */
router.get('/me/posts', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, type, title, content, media_urls, created_at
       FROM community_posts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows.map((p) => ({
      id:        p.id,
      type:      p.type,
      title:     p.title,
      content:   p.content,
      mediaUrls: p.media_urls || [],
      createdAt: p.created_at,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/community/posts
 * Auth required. Creates a new community post of type USER_POST.
 */
router.post('/posts', requireAuth, validate(createPostSchema), async (req, res, next) => {
  try {
    const { title, content, mediaUrls } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO community_posts (id, user_id, type, title, content, media_urls, created_at)
       VALUES ($1, $2, 'USER_POST', $3, $4, $5, NOW())`,
      [id, req.user.id, title || null, content, mediaUrls && mediaUrls.length > 0 ? mediaUrls : null]
    );

    return res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/community/posts/:id
 * Auth required. Updates own post (must be USER_POST and belong to user).
 */
router.put('/posts/:id', requireAuth, validate(updatePostSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, mediaUrls } = req.body;

    const existing = await pool.query(
      'SELECT id FROM community_posts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (existing.rows.length === 0) throw AppError.notFound('Post not found');

    await pool.query(
      `UPDATE community_posts SET title = $1, content = $2, media_urls = $3 WHERE id = $4`,
      [title || null, content, mediaUrls && mediaUrls.length > 0 ? mediaUrls : null, id]
    );

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/community/posts/:id
 * Auth required. Deletes own post.
 */
router.delete('/posts/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM community_posts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rowCount === 0) throw AppError.notFound('Post not found');
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/community/posts/:id/comments
 * Public. Lists comments on a post (ordered oldest → newest).
 */
router.get('/posts/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 404 if post doesn't exist
    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) throw AppError.notFound('Post not found');

    const result = await pool.query(
      `SELECT id, user_id, comment, created_at
       FROM comments
       WHERE post_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    return res.json(result.rows.map((c) => ({
      id:        c.id,
      userId:    c.user_id,
      comment:   c.comment,
      createdAt: c.created_at,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/community/posts/:id/comments
 * Auth required. Adds a comment to a post.
 */
router.post('/posts/:id/comments', requireAuth, validate(createCommentSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) throw AppError.notFound('Post not found');

    const commentId = uuidv4();
    await pool.query(
      `INSERT INTO comments (id, post_id, user_id, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [commentId, id, req.user.id, comment]
    );

    return res.status(201).json({ id: commentId });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/community/posts/:postId/comments/:commentId
 * Auth required. Deletes own comment from a post.
 */
router.delete('/posts/:postId/comments/:commentId', requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    // Ensure post exists
    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) throw AppError.notFound('Post not found');

    // Ensure comment exists and belongs to this post
    const commentCheck = await pool.query(
      'SELECT id, post_id, user_id FROM comments WHERE id = $1',
      [commentId]
    );
    const commentRow = commentCheck.rows[0];
    if (!commentRow) throw AppError.notFound('Comment not found');
    if (commentRow.post_id !== postId) throw AppError.notFound('Comment not found');

    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2',
      [commentId, req.user.id]
    );
    if (result.rowCount === 0) {
      throw AppError.forbidden('Not allowed');
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/community/posts/:id/like
 * Auth required. Likes a post (idempotent — no error if already liked).
 */
router.post('/posts/:id/like', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) throw AppError.notFound('Post not found');

    // Idempotent: ignore if already liked (ON CONFLICT DO NOTHING)
    await pool.query(
      `INSERT INTO post_likes (id, post_id, user_id, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [uuidv4(), id, req.user.id]
    );

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/community/posts/:id/like
 * Auth required. Unlikes a post.
 */
router.delete('/posts/:id/like', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) throw AppError.notFound('Post not found');

    await pool.query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
