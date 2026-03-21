// src/routes/auth.js
// POST /api/auth/register  →  register a new user and return JWT
// POST /api/auth/login     →  login and return JWT
const express  = require('express');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool     = require('../config/db');
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
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      throw AppError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, 'USER', NOW())`,
      [id, name, normalizedEmail, passwordHash]
    );

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

    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = result.rows[0];

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
    const existing = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.role === 'ADMIN') {
        // Already an admin — just return a token (idempotent)
        const token = signToken({ id: row.id, email: normalizedEmail, role: 'ADMIN' });
        return res.json({ token, message: 'User was already an admin' });
      }
      // Exists as USER — upgrade to ADMIN
      await pool.query("UPDATE users SET role = 'ADMIN' WHERE id = $1", [row.id]);
      const token = signToken({ id: row.id, email: normalizedEmail, role: 'ADMIN' });
      return res.json({ token, message: 'Existing user upgraded to ADMIN' });
    }

    // Create new admin
    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, 'ADMIN', NOW())`,
      [id, name, normalizedEmail, passwordHash]
    );

    const token = signToken({ id, email: normalizedEmail, role: 'ADMIN' });
    return res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
