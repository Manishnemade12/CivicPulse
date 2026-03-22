# CivicPulse Supabase Migration - Quick Start

## ✅ What's Been Done

Your project is fully configured for Supabase migration. Here's what has been prepared:

### 1. **Database Schema** (`docs/supabase-schema.sql`)
   - ✅ All 8 tables with proper structure
   - ✅ UUIDs using pgcrypto (Supabase-compatible)
   - ✅ Enums: user_role, complaint_status, complaint_action_type, community_post_type
   - ✅ Triggers for automatic `updated_at` timestamps
   - ✅ Row Level Security (RLS) policies for data privacy
   - ✅ Seed data: categories (Roads, Water, Sanitation, Safety) + sample areas
   - ✅ Performance indexes on all foreign keys and filter columns

### 2. **Backend Configuration**
   - ✅ Updated `.env.example` with Supabase variables
   - ✅ Updated `.env` with connection template
   - ✅ Modified `backend/express-api/src/config/db.js` to support both:
     - Supabase connection (via DATABASE_URL)
     - Local database (via individual parameters)
   - ✅ SSL automatically configured for Supabase
   - ✅ Connection pooling enabled

### 3. **Documentation**
   - ✅ `SUPABASE-MIGRATION.md` - Complete step-by-step guide
   - ✅ `SCHEMA-REFERENCE.md` - Full schema documentation with ERD
   - ✅ `setup-supabase.sh` - Automated setup script
   - ✅ This file - Quick reference

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Get Your Database Password

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **Settings** → **Database** → **Password**
3. Reset/copy your password (you'll need it immediately)

### Step 2: Update DATABASE_URL

Edit `backend/express-api/.env`:

```bash
// Find this line:
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres

// Replace YOUR_PASSWORD with your actual password
DATABASE_URL=postgres://postgres:actual-password-here@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 3: Run Database Migration

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy **entire content** from `docs/supabase-schema.sql`
5. Paste into the SQL editor
6. Click **Run** button

Expected output:
```
Query executed successfully
```

✅ All tables, indexes, RLS policies, and seed data created!

### Step 4: Start Backend

```bash
cd backend/express-api
npm install  # if not done
npm run dev
```

Look for:
```
[DB] Using DATABASE_URL for connection (Supabase or managed database)
[DB] Successfully connected to database
Server running on http://localhost:8081
```

### Step 5: Verify Installation

```bash
# Test connection
curl http://localhost:8081/api/health

# Check categories (should return 4)
curl http://localhost:8081/api/reference/categories

# Check areas (should return 3)
curl http://localhost:8081/api/reference/areas
```

---

## 📊 Your Supabase Credentials

```
Project URL: https://jzilwqjjaeqfkmtarefe.supabase.co
Publishable Key: sb_publishable_qeShdeXQDhcmRPpOIjpI7Q_Oyqr2mnc
Secret Key: your-supabase-service-role-key
```

> 🔒 **Security**: Never commit `.env` to git. Add to `.gitignore` if not already there.

---

## 📁 File Structure Created

```
CivicPulse/
├── docs/
│   ├── supabase-schema.sql          ← Run this in SQL Editor
│   ├── SUPABASE-MIGRATION.md         ← Full detailed guide
│   ├── SCHEMA-REFERENCE.md           ← Schema documentation
│   └── plan/
│       └── phase-01-database/
│           ├── 01-schema.sql         ← Old (reference only)
│           └── 02-seed.sql           ← Old (reference only)
│
├── backend/express-api/
│   ├── .env                          ← Update DATABASE_URL here
│   ├── .env.example                  ← Template
│   └── src/config/
│       └── db.js                     ← Supabase-ready
│
└── scripts/
    └── setup-supabase.sh             ← Automated setup
```

---

## 🔑 Key Configuration Files

### `.env` (Backend)
```dotenv
# Most important - UPDATE THIS
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@...

# Already set
SUPABASE_URL=https://jzilwqjjaeqfkmtarefe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
JWT_SECRET=civicpulse-dev-secret-...
ADMIN_SECRET=change-me-in-production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### `db.js` (Backend Database Connection)
```javascript
// Automatically chooses based on environment:
// 1. If DATABASE_URL exists → Use Supabase connection pooler
// 2. Otherwise → Use local PostgreSQL parameters
// Already configured, no changes needed!
```

---

## 📚 Database Architecture

### 8 Tables

1. **users** - User accounts (name, email, password, role)
2. **areas** - City zones (for geographic queries)
3. **complaint_categories** - Reference data (Roads, Water, Sanitation, Safety)
4. **complaints** - Anonymous complaints (no user_id, uses anonymous_user_hash)
5. **complaint_actions** - Admin audit trail
6. **community_posts** - User posts + resolved complaints feed
7. **comments** - Comments on posts
8. **post_likes** - Like tracking

### RLS Policies Enabled

- 🔒 Users only see their own account
- 🔒 Anonymous complaints are recorded anonymously
- 🔒 Admins only can update/modify complaints
- 🔒 Users can only edit their own posts/likes/comments
- 📖 Public read access to: areas, categories, complaints, posts, comments

---

## 🧪 Testing Checklist

- [ ] Backend connects successfully (`[DB] Successfully connected`)
- [ ] `/api/health` responds with 200
- [ ] `/api/reference/categories` returns 4 categories
- [ ] `/api/reference/areas` returns 3 areas
- [ ] Can create complaint via API
- [ ] Can view complaints via API
- [ ] Admin actions work via API

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| `ENOTFOUND` when connecting | Check DATABASE_URL spelling |
| `FATAL: password invalid` | Verify password is correct in DATABASE_URL |
| `Too many connections` | Using direct connection? Switch to pooler (port 6543) |
| `RLS policy violation` | Server-side operations need SERVICE_ROLE_KEY |
| Schema not created | Check SQL ran without errors in Supabase Dashboard |

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `SUPABASE-MIGRATION.md` | **READ THIS FIRST** - Complete step-by-step guide |
| `SCHEMA-REFERENCE.md` | Database schema with ERD and all table definitions |
| `supabase-schema.sql` | Actual SQL to run in Supabase Dashboard |
| `setup-supabase.sh` | Automated environment setup script |

---

## 🔄 What Happens Next

1. You set up DATABASE_URL in `.env` ✏️
2. You run the SQL migration in Supabase Dashboard 🗄️
3. Backend auto-connects to Supabase 🚀
4. Your frontend is ready to work with the database 🎯

---

## 📞 Need Help?

### For schema/RLS questions:
- See: `docs/SCHEMA-REFERENCE.md`

### For Supabase-specific setup:
- See: `docs/SUPABASE-MIGRATION.md`
- Visit: https://supabase.com/docs

### For backend configuration:
- Check: `backend/express-api/.env`
- See: `backend/express-api/src/config/db.js`

---

## ✨ You're All Set!

Your CivicPulse project is now Supabase-ready. Follow the 5 setup steps above and you'll be up and running in minutes.

**Status**: 🟢 Configuration Complete | Ready for Migration

---

**Last Updated**: March 22, 2026  
**Project**: CivicPulse  
**Database**: Supabase PostgreSQL  
**Version**: 1.0
