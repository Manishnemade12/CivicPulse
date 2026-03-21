#!/usr/bin/env node
// scripts/seed-admin.js
// Creates an admin user in the database.
// Usage:
//   node scripts/seed-admin.js
//   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword node scripts/seed-admin.js
//
// All values can be set via environment variables or will fall back to safe defaults.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@civicpulse.local';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const NAME     = process.env.ADMIN_NAME     || 'CivicPulse Admin';

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME     || 'civicpulse',
  user:     process.env.DB_USER     || 'civicpulse',
  password: process.env.DB_PASSWORD || 'civicpulse',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to database.');

    // Check if admin already exists
    const existing = await client.query(
      "SELECT id, email, role FROM users WHERE email = $1",
      [EMAIL.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.role === 'ADMIN') {
        console.log(`✅ Admin already exists: ${EMAIL} (id: ${row.id})`);
        return;
      }
      // Exists but not admin — upgrade role
      await client.query(
        "UPDATE users SET role = 'ADMIN' WHERE id = $1",
        [row.id]
      );
      console.log(`✅ Upgraded existing user to ADMIN: ${EMAIL} (id: ${row.id})`);
      return;
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(PASSWORD, 12);
    const id = uuidv4();

    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, 'ADMIN', NOW())`,
      [id, NAME, EMAIL.toLowerCase(), passwordHash]
    );

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`   Email   : ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   Role    : ADMIN`);
    console.log(`   ID      : ${id}`);
    console.log('─────────────────────────────────────');
    console.log('Now login via: POST /api/auth/login');
    console.log('');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
