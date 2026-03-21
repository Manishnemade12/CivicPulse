// src/index.js
// CivicPulse Express.js API — entry point
// Mirrors Spring Boot's SecurityConfig route permissions:
//   - Public: /api/version, /api/areas, /api/complaint-categories, /api/public-complaints/**, /api/db/health, /api/auth/**
//   - Admin:  /api/admin/**
//   - Auth:   everything else

require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const { errorHandler } = require('./middleware/errorHandler');

// ── Routers ──────────────────────────────────────────────────────────────────
const authRouter             = require('./routes/auth');
const meRouter               = require('./routes/me');
const complaintsRouter       = require('./routes/complaints');
const publicComplaintsRouter = require('./routes/publicComplaints');
const communityRouter        = require('./routes/community');
const adminRouter            = require('./routes/admin');
const referenceRouter        = require('./routes/reference');
const versionRouter          = require('./routes/version');
const healthRouter           = require('./routes/health');

// ── App setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = parseInt(process.env.PORT || '8081', 10);

// Security headers
app.use(helmet());

// CORS — allow all origins in dev; tighten in production via CORS_ORIGIN env
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));

// ── Root health check ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ service: 'civicpulse-backend', status: 'running' });
});

// ── Mount routers ─────────────────────────────────────────────────────────────

// Public reference data
app.use('/api', referenceRouter);         // GET /api/areas, /api/complaint-categories
app.use('/api', versionRouter);           // GET /api/version
app.use('/api', healthRouter);            // GET /api/db/health

// Auth
app.use('/api/auth', authRouter);         // POST /api/auth/register, /api/auth/login

// Authenticated user
app.use('/api/me', meRouter);             // GET /api/me

// Complaints (anonymous + public)
app.use('/api/complaints', complaintsRouter);           // POST, GET my, GET /:id, DELETE /:id
app.use('/api/public-complaints', publicComplaintsRouter); // GET /, GET /:id

// Community / Social Hub
app.use('/api/community', communityRouter);

// Admin (auth + role guard applied inside router)
app.use('/api/admin', adminRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  CivicPulse Express API running on http://localhost:${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // export for testing
