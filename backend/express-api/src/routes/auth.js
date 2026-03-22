// src/routes/auth.js
// POST /api/auth/register  →  register a new user and return JWT
// POST /api/auth/login     →  login and return JWT
const express  = require('express');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { signToken } = require('../config/jwt');
const { validate, z } = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email().max(150),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email:    z.string().email().max(150),
  password: z.string().min(6).max(200),
});

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Returns: { token }
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Check duplicate email
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1);

    if (existingError) throw existingError;
    if ((existing || []).length > 0) {
      throw AppError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id,
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: 'USER',
      });

    if (insertError) throw insertError;

    const token = signToken({ id, email: normalizedEmail, role: 'USER' });
    return res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token }
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, role')
      .eq('email', normalizedEmail)
      .limit(1);

    if (userError) throw userError;
    const user = users && users[0];

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      // Use same message to avoid user enumeration
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

// ── Admin registration (protected by ADMIN_SECRET) ──────────────────────────

const adminRegisterSchema = z.object({
  name:        z.string().min(1).max(100),
  email:       z.string().email().max(150),
  password:    z.string().min(6).max(200),
  adminSecret: z.string().min(1),
});

/**
 * POST /api/auth/admin/register
 * Body: { name, email, password, adminSecret }
 * Creates a new user with ADMIN role.
 * Protected by the ADMIN_SECRET environment variable — must match to succeed.
 * Set ADMIN_SECRET in your .env file.
 */
router.post('/admin/register', validate(adminRegisterSchema), async (req, res, next) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret) {
      return res.status(503).json({
        code: 'NOT_CONFIGURED',
        message: 'Admin registration is not enabled. Set ADMIN_SECRET in the server environment.',
      });
    }
    if (adminSecret !== expectedSecret) {
      // Use generic message to avoid leaking whether the secret is wrong vs missing
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Invalid admin secret.',
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check duplicate email
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', normalizedEmail)
      .limit(1);

    if (existingError) throw existingError;

    if ((existing || []).length > 0) {
      const row = existing[0];
      if (row.role === 'ADMIN') {
        // Already an admin — just return a token (idempotent)
        const token = signToken({ id: row.id, email: normalizedEmail, role: 'ADMIN' });
        return res.json({ token, message: 'User was already an admin' });
      }
      // Exists as USER — upgrade to ADMIN
      const { error: updateRoleError } = await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('id', row.id);

      if (updateRoleError) throw updateRoleError;
      const token = signToken({ id: row.id, email: normalizedEmail, role: 'ADMIN' });
      return res.json({ token, message: 'Existing user upgraded to ADMIN' });
    }

    // Create new admin
    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const { error: insertAdminError } = await supabase
      .from('users')
      .insert({
        id,
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: 'ADMIN',
      });

    if (insertAdminError) throw insertAdminError;

    const token = signToken({ id, email: normalizedEmail, role: 'ADMIN' });
    return res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
