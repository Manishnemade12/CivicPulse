// src/routes/version.js
// GET /api/version  →  return app name and version (public)
const express = require('express');
const router  = express.Router();

const APP_NAME    = 'civicpulse-backend';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';

/**
 * GET /api/version
 * Public. Returns { name, version }.
 */
router.get('/version', (req, res) => {
  res.json({ name: APP_NAME, version: APP_VERSION });
});

module.exports = router;
