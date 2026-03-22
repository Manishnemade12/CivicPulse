# CivicPulse → Supabase Migration Guide

## Overview

This guide explains how to migrate CivicPulse from a local Docker PostgreSQL database to **Supabase**, a managed PostgreSQL platform with built-in authentication, real-time capabilities, and Row Level Security.

### Why Supabase?

✅ **Managed Database** - No Docker/local setup needed  
✅ **Automatic Backups** - Disaster recovery included  
✅ **Row Level Security (RLS)** - Data privacy enforced at database level  
✅ **RESTful API** - Direct database access for frontend (optional)  
✅ **Real-time Subscriptions** - LiveQuery support  
✅ **Scalable** - Auto-scaling, connection pooling  
✅ **Free Tier Available** - Perfect for development  

---

## Your Supabase Credentials

```
Project URL: https://jzilwqjjaeqfkmtarefe.supabase.co
Publishable Key: sb_publishable_qeShdeXQDhcmRPpOIjpI7Q_Oyqr2mnc
Secret Key: your-supabase-service-role-key
```

> ⚠️ **Keep these credentials secure!** Store in `.env` file, never commit to git.

---

## Step 1: Get Your Supabase Connection String

### Option A: Connection Pooler (Recommended for Node.js)

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`jzilwqjjaeqfkmtarefe`)
3. Go to **Settings** → **Database** → **Connection String**
4. Select **Connection pooler**
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

```sql
postgres://postgres:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Option B: Direct Connection (for local migrations)

```sql
postgres://postgres:[YOUR-PASSWORD]@aws-0-us-west-1.postgres.supabase.com:5432/postgres
```

> Connection Pooler is faster for serverless/microservices. Direct connection is better for migrations.

---

## Step 2: Create Environment File

Create `.env` in `/backend/express-api/`:

```dotenv
# Server
PORT=8081

# ============================================================================
# DATABASE - Supabase
# ============================================================================

# Get this from Supabase Dashboard > Settings > Database > Connection String
# Copy the Connection Pooler URL and replace [YOUR-PASSWORD]
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Supabase API endpoints
SUPABASE_URL=https://jzilwqjjaeqfkmtarefe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_qeShdeXQDhcmRPpOIjpI7Q_Oyqr2mnc
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ============================================================================
# AUTHENTICATION
# ============================================================================

JWT_SECRET=your-long-random-secret-min-32-chars-change-in-production
ADMIN_SECRET=your-admin-registration-secret

# ============================================================================
# APPLICATION
# ============================================================================

APP_VERSION=0.0.1
NODE_ENV=development

# ============================================================================
# CORS
# ============================================================================

CORS_ORIGIN=http://localhost:3000
```

---

## Step 3: Run Database Migration

### Option A: Supabase SQL Editor (Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open file: [docs/supabase-schema.sql](docs/supabase-schema.sql)
6. Copy **entire content** into the SQL editor
7. Click **Run** button

✅ All tables, enums, RLS policies, and seed data will be created automatically

### Option B: Using psql CLI (For Advanced Users)

```bash
# Get the Direct Connection string from Supabase
psql "postgres://postgres:[PASSWORD]@aws-0-us-west-1.postgres.supabase.com:5432/postgres" < docs/supabase-schema.sql
```

### Option C: Programmatic Migration (Node.js)

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const schema = fs.readFileSync('../../docs/supabase-schema.sql', 'utf8');
  try {
    await pool.query(schema);
    console.log('✅ Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
```

---

## Step 4: Update Backend Configuration

The backend is already configured to support Supabase. Just ensure:

1. **Database connection** - Backend will use `DATABASE_URL` if provided
2. **SSL enabled** - Supabase requires SSL, already configured in `src/config/db.js`
3. **Connection pooling** - Use the pooler endpoint for Node.js

File: [backend/express-api/src/config/db.js](backend/express-api/src/config/db.js)

✅ Already supports both local and Supabase connections

---

## Step 5: Verify Migration

### Test 1: Backend Connection

```bash
cd backend/express-api/
npm install  # if needed
npm run dev
```

You should see:
```
[DB] Using DATABASE_URL for connection (Supabase or managed database)
[DB] Successfully connected to database
```

### Test 2: Check Tables Exist

```bash
# In backend/express-api/
node -e "
const pool = require('./src/config/db.js');
pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \"public\"', (err, res) => {
  if (err) console.error(err);
  else console.log('Tables:', res.rows.map(r => r.table_name));
  process.exit(0);
});
"
```

Expected output:
```
Tables: [
  'users',
  'areas',
  'complaint_categories',
  'complaints',
  'complaint_actions',
  'community_posts',
  'comments',
  'post_likes'
]
```

### Test 3: Check Seed Data

```bash
curl http://localhost:8081/api/reference/categories
curl http://localhost:8081/api/reference/areas
```

Should return the auto-populated categories and areas.

---

## Step 6: Configure Frontend (Optional)

If using Supabase's PostgREST API directly from frontend:

Update [frontend/web/lib/env.ts](frontend/web/lib/env.ts):

```typescript
export const SUPABASE_URL = 'https://jzilwqjjaeqfkmtarefe.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_qeShdeXQDhcmRPpOIjpI7Q_Oyqr2mnc';
```

Then install Supabase client:

```bash
cd frontend/web/
npm install @supabase/supabase-js
```

---

## Common Issues & Troubleshooting

### Issue: `SSL certificate problem`

**Solution**: SSL is already handled in `db.js`. Ensure `rejectUnauthorized: false` is set.

### Issue: `Connection refused`

**Solution**: 
- Check DATABASE_URL is correct
- Verify password is correct
- Use Connection Pooler endpoint (port 6543)

### Issue: `RLS policy violation`

**Solution**: 
- Ensure `auth.uid()` is set when using RLS-protected tables
- For server-side operations, use SERVICE_ROLE_KEY or disable RLS temporarily

### Issue: `Database is empty after migration`

**Solution**:
- Check if SQL ran without errors in Supabase Dashboard
- Verify schema file was completely copied
- Try running in small chunks if file is too large

### Issue: `Too many connections`

**Solution**: 
- Use Connection Pooler instead of Direct connection
- Ensure connection pool is properly closed in application

---

## Rolling Back (If Needed)

### Delete All Data (Keep Structure)

```sql
TRUNCATE TABLE post_likes CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE community_posts CASCADE;
TRUNCATE TABLE complaints CASCADE;
TRUNCATE TABLE complaint_actions CASCADE;
TRUNCATE TABLE users CASCADE;
-- areas and complaint_categories will have seed data re-inserted
```

### Delete Everything & Start Over

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run the migration
```

---

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] DATABASE_URL uses Connection Pooler (port 6543)
- [ ] JWT_SECRET is changed from default
- [ ] ADMIN_SECRET is set to a strong value
- [ ] SERVICE_ROLE_KEY is never exposed to frontend
- [ ] RLS policies are enabled on all tables
- [ ] Database backups are enabled in Supabase

---

## Next Steps

1. ✅ Database schema is migrated
2. ✅ Environment variables are configured
3. ✅ Backend connection is tested
4. 📋 Optional: Configure Real-time subscriptions
5. 📋 Optional: Set up Supabase Auth integration
6. 📋 Optional: Enable PostgREST API for frontend

---

## Useful Supabase Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Migrations Documentation](https://supabase.com/docs/reference/cli/concepts/migrations)

---

## Support

For issues related to:
- **CivicPulse Backend**: Check `backend/express-api/` README
- **Supabase**: Visit [Supabase Support](https://supabase.com/support)
- **PostgreSQL**: Check [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Last Updated**: March 22, 2026  
**Schema Version**: 1.0  
**Supabase Project**: jzilwqjjaeqfkmtarefe
