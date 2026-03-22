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
const supabase       = require('../config/supabase');
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

    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('id, user_id, type, title, content, media_urls, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) throw postsError;

    const postRows = posts || [];
    const postIds = postRows.map((p) => p.id);
    const authorIds = [...new Set(postRows.map((p) => p.user_id).filter(Boolean))];

    const [
      { data: authors, error: authorsError },
      { data: likesRows, error: likesError },
      { data: commentsRows, error: commentsError },
    ] = await Promise.all([
      authorIds.length > 0
        ? supabase.from('users').select('id, name').in('id', authorIds)
        : Promise.resolve({ data: [], error: null }),
      postIds.length > 0
        ? supabase.from('post_likes').select('post_id, user_id').in('post_id', postIds)
        : Promise.resolve({ data: [], error: null }),
      postIds.length > 0
        ? supabase.from('comments').select('post_id').in('post_id', postIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (authorsError) throw authorsError;
    if (likesError) throw likesError;
    if (commentsError) throw commentsError;

    const authorMap = new Map((authors || []).map((u) => [u.id, u.name]));
    const likeCountMap = new Map();
    const commentCountMap = new Map();

    for (const like of likesRows || []) {
      likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) || 0) + 1);
    }
    for (const comment of commentsRows || []) {
      commentCountMap.set(comment.post_id, (commentCountMap.get(comment.post_id) || 0) + 1);
    }

    // Batch liked-by-me check for the current user
    let likedSet = new Set();
    if (meId && postIds.length > 0) {
      const { data: likedRows, error: likedError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', meId)
        .in('post_id', postIds);

      if (likedError) throw likedError;
      likedSet = new Set((likedRows || []).map((row) => row.post_id));
    }

    return res.json(postRows.map((p) => ({
      id:           p.id,
      type:         p.type,
      title:        p.title,
      content:      p.content,
      mediaUrls:    p.media_urls || [],
      createdAt:    p.created_at,
      authorName:   authorMap.get(p.user_id) || 'Anonymous User',
      authorId:     p.user_id || null,
      likeCount:    likeCountMap.get(p.id) || 0,
      commentCount: commentCountMap.get(p.id) || 0,
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
    const { data, error } = await supabase
      .from('community_posts')
      .select('id, type, title, content, media_urls, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json((data || []).map((p) => ({
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

    const { error } = await supabase
      .from('community_posts')
      .insert({
        id,
        user_id: req.user.id,
        type: 'USER_POST',
        title: title || null,
        content,
        media_urls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null,
      });

    if (error) throw error;

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

    const { data: existing, error: existingError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .limit(1);
    if (existingError) throw existingError;
    if ((existing || []).length === 0) throw AppError.notFound('Post not found');

    const { error: updateError } = await supabase
      .from('community_posts')
      .update({ title: title || null, content, media_urls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null })
      .eq('id', id);

    if (updateError) throw updateError;

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
    const { data: deletedRows, error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id');

    if (deleteError) throw deleteError;
    if ((deletedRows || []).length === 0) throw AppError.notFound('Post not found');
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
    const { data: postCheck, error: postCheckError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .limit(1);
    if (postCheckError) throw postCheckError;
    if ((postCheck || []).length === 0) throw AppError.notFound('Post not found');

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, user_id, comment, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    return res.json((comments || []).map((c) => ({
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

    const { data: postCheck, error: postCheckError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .limit(1);
    if (postCheckError) throw postCheckError;
    if ((postCheck || []).length === 0) throw AppError.notFound('Post not found');

    const commentId = uuidv4();
    const { error: insertCommentError } = await supabase
      .from('comments')
      .insert({
        id: commentId,
        post_id: id,
        user_id: req.user.id,
        comment,
      });
    if (insertCommentError) throw insertCommentError;

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
    const { data: postCheck, error: postCheckError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', postId)
      .limit(1);
    if (postCheckError) throw postCheckError;
    if ((postCheck || []).length === 0) throw AppError.notFound('Post not found');

    // Ensure comment exists and belongs to this post
    const { data: commentCheck, error: commentCheckError } = await supabase
      .from('comments')
      .select('id, post_id, user_id')
      .eq('id', commentId)
      .limit(1);
    if (commentCheckError) throw commentCheckError;
    const commentRow = commentCheck && commentCheck[0];
    if (!commentRow) throw AppError.notFound('Comment not found');
    if (commentRow.post_id !== postId) throw AppError.notFound('Comment not found');

    const { data: deletedRows, error: deleteCommentError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', req.user.id)
      .select('id');
    if (deleteCommentError) throw deleteCommentError;
    if ((deletedRows || []).length === 0) {
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

    const { data: postCheck, error: postCheckError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .limit(1);
    if (postCheckError) throw postCheckError;
    if ((postCheck || []).length === 0) throw AppError.notFound('Post not found');

    // Idempotent: ignore if already liked (ON CONFLICT DO NOTHING)
    const { error: likeError } = await supabase
      .from('post_likes')
      .upsert(
        { id: uuidv4(), post_id: id, user_id: req.user.id },
        { onConflict: 'post_id,user_id', ignoreDuplicates: true }
      );

    if (likeError) throw likeError;

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

    const { data: postCheck, error: postCheckError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .limit(1);
    if (postCheckError) throw postCheckError;
    if ((postCheck || []).length === 0) throw AppError.notFound('Post not found');

    const { error: unlikeError } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', req.user.id);

    if (unlikeError) throw unlikeError;

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
