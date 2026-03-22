#!/usr/bin/env node
// scripts/seed-admin.js
// Creates an admin user in the database.
// Usage:
//   node scripts/seed-admin.js
//   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword node scripts/seed-admin.js
//
// All values can be set via environment variables or will fall back to safe defaults.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabase = require('../src/config/supabase');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@civicpulse.local';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const NAME     = process.env.ADMIN_NAME     || 'CivicPulse Admin';

async function run() {
  try {
    console.log('🔌 Connected to Supabase.');

    // Check if admin already exists
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', EMAIL.toLowerCase())
      .limit(1);

    if (existingError) throw existingError;

    if ((existing || []).length > 0) {
      const row = existing[0];
      if (row.role === 'ADMIN') {
        console.log(`✅ Admin already exists: ${EMAIL} (id: ${row.id})`);
        return;
      }
      // Exists but not admin — upgrade role
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('id', row.id);

      if (updateError) throw updateError;
      console.log(`✅ Upgraded existing user to ADMIN: ${EMAIL} (id: ${row.id})`);
      return;
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(PASSWORD, 12);
    const id = uuidv4();

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id,
        name: NAME,
        email: EMAIL.toLowerCase(),
        password_hash: passwordHash,
        role: 'ADMIN',
      });

    if (insertError) throw insertError;

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
    // no-op
  }
}

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
