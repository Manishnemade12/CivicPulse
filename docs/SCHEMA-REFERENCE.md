# CivicPulse Database Schema Reference

## Overview

Complete database schema documentation for CivicPulse on Supabase.

---

## Database Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                       CivicPulse Schema                         │
└─────────────────────────────────────────────────────────────────┘

                          ╔═══════════════╗
                          ║ USERS         ║
                          ╠═══════════════╣
                          ║ id (UUID)     ║ ◄─────┐
                          ║ name          ║       │
                          ║ email         ║       │
                          ║ password_hash ║       │
                          ║ role          ║       │
                          ║ created_at    ║       │
                          ║ updated_at    ║       │
                          ╚═══════════════╝       │
                                                  │
                    ╔═══════════════════════════════════════════╗
                    │                                           │
          ╔═════════════════════╗                   ╔═══════════════════╗
          ║ AREAS               ║                   ║ COMPLAINT_ACTIONS ║
          ╠═════════════════════╣                   ╠═══════════════════╣
          ║ id (UUID)           ║◄────┐            ║ id (UUID)         ║
          ║ city                ║     │            ║ complaint_id (FK) ║
          ║ zone                ║     │            ║ admin_id (FK)     ║ ──┘
          ║ ward                ║     │            ║ action            ║
          ║ created_at          ║     │            ║ comment           ║
          ╚═════════════════════╝     │            ║ created_at        ║
                                      │            ╚═══════════════════╝
          ╔═════════════════════════════════════════════╗
          │                                             │
      ╔═════════════════════╗        ╔════════════════════════╗
      ║ COMPLAINT_CATEGORIES║        ║ COMPLAINTS             ║
      ╠═════════════════════╣        ╠════════════════════════╣
      ║ id (UUID)           ║◄─┐     ║ id (UUID)              ║
      ║ name                ║  │     ║ area_id (FK)           ║
      ║ created_at          ║  │     ║ category_id (FK)       ║
      ╚═════════════════════╝  │     ║ anonymous_user_hash    ║
                               │     ║ title                  ║
                               │     ║ description            ║
                               │     ║ images                 ║
                               │     ║ status                 ║
                               │     ║ created_at             ║
                               └─────║ updated_at             ║
                                     ╚════════════════════════╝
                                              │
                                              │
                    ╔═══════════════════════════════════════════╗
                    │                                           │
          ╔═════════════════════╗              ╔═══════════════════════╗
          ║ COMMUNITY_POSTS     ║              ║ COMMENTS              ║
          ╠═════════════════════╣              ╠═══════════════════════╣
          ║ id (UUID)           ║◄──┐          ║ id (UUID)             ║
          ║ user_id (FK)        ║   │          ║ post_id (FK)          ║
          ║ type                ║   │          ║ user_id (FK)          ║
          ║ title               ║   │          ║ comment               ║
          ║ content             ║   │          ║ created_at            ║
          ║ media_urls          ║   │          ║ updated_at            ║
          ║ created_at          ║   │          ╚═══════════════════════╝
          ║ updated_at          ║   │
          ╚═════════════════════╝   │
                                    │
                    ╔═════════════════════════════╗
                    ║ POST_LIKES                  ║
                    ╠═════════════════════════════╣
                    ║ id (UUID)                   ║
                    ║ post_id (FK)                ║
                    ║ user_id (FK)                ║
                    ║ created_at                  ║
                    ║ Unique(post_id, user_id)    ║
                    ╚═════════════════════════════╝
```

---

## Enum Types

### `user_role`
- `USER` - Regular user
- `ADMIN` - Administrator with elevated permissions

### `complaint_status`
- `RAISED` - Complaint newly submitted
- `IN_PROGRESS` - Admin is working on it
- `RESOLVED` - Complaint resolved

### `complaint_action_type`
- `STATUS_UPDATE` - Status change by admin
- `COMMENT` - Admin comment on complaint

### `community_post_type`
- `USER_POST` - Regular user post
- `RESOLVED_COMPLAINT` - Auto-posted when complaint resolved

---

## Tables

### 1. `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Unique user identifier |
| `name` | varchar(100) | NOT NULL | User's display name |
| `email` | varchar(150) | UNIQUE, NOT NULL | User's email (unique) |
| `password_hash` | text | NOT NULL | Bcrypt hashed password |
| `role` | user_role | default: 'USER' | USER or ADMIN |
| `created_at` | timestamptz | default: now() | Account creation time |
| `updated_at` | timestamptz | default: now() | Last profile update |

**Indexes:**
- `users_pkey` (id)

**Triggers:**
- `trigger_users_updated_at` - Auto-updates `updated_at` on changes

**RLS Policies:**
- Users can SELECT/UPDATE their own profile
- Admins can SELECT all users

---

### 2. `areas`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Unique area identifier |
| `city` | varchar(100) | NOT NULL | City name |
| `zone` | varchar(100) | nullable | Zone/district name |
| `ward` | varchar(100) | nullable | Ward/block name |
| `created_at` | timestamptz | default: now() | Record creation time |

**Indexes:**
- `areas_pkey` (id)

**RLS Policies:**
- Everyone can SELECT (reference data)

---

### 3. `complaint_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Category ID |
| `name` | varchar(100) | UNIQUE, NOT NULL | Category name (e.g., "Roads") |
| `created_at` | timestamptz | default: now() | Record creation time |

**Indexes:**
- `complaint_categories_pkey` (id)

**Seed Data:**
```
- Roads
- Water
- Sanitation
- Safety
```

**RLS Policies:**
- Everyone can SELECT (reference data)

---

### 4. `complaints`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Complaint ID |
| `area_id` | UUID | FK → areas(id), NOT NULL | Which area this complaint is about |
| `category_id` | UUID | FK → complaint_categories(id), NOT NULL | Category of complaint |
| `anonymous_user_hash` | varchar(255) | NOT NULL | Hash of anonymous user (for grouping) |
| `title` | varchar(200) | NOT NULL | Complaint title |
| `description` | text | NOT NULL | Detailed description |
| `images` | text[] | nullable | Array of image URLs |
| `status` | complaint_status | default: 'RAISED' | Current status |
| `created_at` | timestamptz | default: now() | When complaint was raised |
| `updated_at` | timestamptz | default: now() | Last update |

**Indexes:**
- `idx_complaints_area` (area_id)
- `idx_complaints_status` (status)
- `idx_complaints_user_hash` (anonymous_user_hash)
- `idx_complaints_created_at` (created_at DESC)

**Triggers:**
- `trigger_complaints_updated_at` - Auto-updates `updated_at` on changes

**RLS Policies:**
- Everyone can INSERT (anonymous complaints)
- Everyone can SELECT (all complaints are public)
- Only ADMIN can UPDATE

---

### 5. `complaint_actions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Action record ID |
| `complaint_id` | UUID | FK → complaints(id) CASCADE, NOT NULL | Which complaint |
| `admin_id` | UUID | FK → users(id), NOT NULL | Which admin took action |
| `action` | complaint_action_type | NOT NULL | Type of action performed |
| `comment` | text | nullable | Optional comment text |
| `created_at` | timestamptz | default: now() | When action was taken |

**Indexes:**
- `idx_complaint_actions_complaint` (complaint_id)
- `idx_complaint_actions_admin` (admin_id)
- `idx_complaint_actions_created_at` (created_at DESC)

**RLS Policies:**
- Everyone can SELECT (audit trail is public)
- Only ADMIN can INSERT

---

### 6. `community_posts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Post ID |
| `user_id` | UUID | FK → users(id) SET NULL, nullable | Author (NULL for auto-posts) |
| `type` | community_post_type | NOT NULL | USER_POST or RESOLVED_COMPLAINT |
| `title` | varchar(200) | nullable | Optional title |
| `content` | text | NOT NULL | Post content |
| `media_urls` | text[] | nullable | Array of media URLs |
| `created_at` | timestamptz | default: now() | When posted |
| `updated_at` | timestamptz | default: now() | Last edit |

**Indexes:**
- `idx_posts_type` (type)
- `idx_posts_user` (user_id)
- `idx_posts_created_at` (created_at DESC)

**Triggers:**
- `trigger_community_posts_updated_at` - Auto-updates `updated_at` on changes

**RLS Policies:**
- Everyone can SELECT
- Authenticated users can INSERT (own user_id required)
- Users can UPDATE/DELETE their own posts
- Admins can DELETE any post

---

### 7. `comments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Comment ID |
| `post_id` | UUID | FK → community_posts(id) CASCADE, NOT NULL | Which post |
| `user_id` | UUID | FK → users(id), NOT NULL | Who commented |
| `comment` | text | NOT NULL | Comment content |
| `created_at` | timestamptz | default: now() | When posted |
| `updated_at` | timestamptz | default: now() | Last edit |

**Indexes:**
- `idx_comments_post` (post_id)
- `idx_comments_user` (user_id)
- `idx_comments_created_at` (created_at DESC)

**Triggers:**
- `trigger_comments_updated_at` - Auto-updates `updated_at` on changes

**RLS Policies:**
- Everyone can SELECT
- Authenticated users can INSERT (own user_id required)
- Users can UPDATE/DELETE their own comments

---

### 8. `post_likes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default: gen_random_uuid() | Like record ID |
| `post_id` | UUID | FK → community_posts(id) CASCADE, NOT NULL | Which post |
| `user_id` | UUID | FK → users(id), NOT NULL | Who liked |
| `created_at` | timestamptz | default: now() | When liked |
| Constraint | unique(post_id, user_id) | - | One like per user per post |

**Indexes:**
- `idx_post_likes_post` (post_id)
- `idx_post_likes_user` (user_id)

**RLS Policies:**
- Everyone can SELECT
- Authenticated users can INSERT (own user_id required)
- Users can DELETE their own likes

---

## Row Level Security (RLS) Policies

| Table | Operation | Policy | Access |
|-------|-----------|--------|--------|
| `users` | SELECT | users_select_own | Own profile only |
| `users` | SELECT | users_select_admin | All (ADMIN only) |
| `users` | UPDATE | users_update_own | Own profile only |
| `areas` | SELECT | areas_select_all | Everyone |
| `complaint_categories` | SELECT | complaint_categories_select_all | Everyone |
| `complaints` | INSERT | complaints_insert_all | Everyone |
| `complaints` | SELECT | complaints_select_all | Everyone |
| `complaints` | UPDATE | complaints_update_admin | ADMIN only |
| `complaint_actions` | SELECT | complaint_actions_select_all | Everyone |
| `complaint_actions` | INSERT | complaint_actions_insert_admin | ADMIN only |
| `community_posts` | SELECT | community_posts_select_all | Everyone |
| `community_posts` | INSERT | community_posts_insert_auth | Authenticated users |
| `community_posts` | UPDATE | community_posts_update_own | Own posts only |
| `community_posts` | DELETE | community_posts_delete_own | Own posts only |
| `community_posts` | DELETE | community_posts_delete_admin | ADMIN only |
| `comments` | SELECT | comments_select_all | Everyone |
| `comments` | INSERT | comments_insert_auth | Authenticated users |
| `comments` | UPDATE | comments_update_own | Own comments only |
| `comments` | DELETE | comments_delete_own | Own comments only |
| `post_likes` | SELECT | post_likes_select_all | Everyone |
| `post_likes` | INSERT | post_likes_insert_auth | Authenticated users |
| `post_likes` | DELETE | post_likes_delete_own | Own likes only |

---

## Common Queries

### Get all complaints in an area with status
```sql
SELECT 
  c.id,
  c.title,
  c.status,
  a.city,
  a.zone,
  a.ward,
  cat.name as category
FROM complaints c
JOIN areas a ON c.area_id = a.id
JOIN complaint_categories cat ON c.category_id = cat.id
WHERE a.id = 'area-uuid'
  AND c.status = 'RAISED'
ORDER BY c.created_at DESC;
```

### Get user's posts with comment count
```sql
SELECT 
  p.id,
  p.title,
  p.content,
  COUNT(c.id) as comment_count,
  COUNT(l.id) as like_count,
  p.created_at
FROM community_posts p
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN post_likes l ON p.id = l.post_id
WHERE p.user_id = 'user-uuid'
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Get all admin actions on a complaint
```sql
SELECT 
  ca.id,
  u.name as admin_name,
  ca.action,
  ca.comment,
  ca.created_at
FROM complaint_actions ca
JOIN users u ON ca.admin_id = u.id
WHERE ca.complaint_id = 'complaint-uuid'
ORDER BY ca.created_at ASC;
```

---

## Data Migration Notes

### From Local to Supabase

1. **Users** - Migrate with password_hash intact
2. **Reference Data** (areas, categories) - Pre-seeded in schema
3. **Complaints** - Direct copy (anonymous by design, no user_id)
4. **Comments/Likes** - Link to migrated user IDs

### Anonymous User Hash

The `anonymous_user_hash` field is used to track anonymous complaints:
- Generated client-side (SHA-256 hash of device/IP)
- Stored in localStorage for persistence
- Used to retrieve "my complaints" without user account

---

## Performance Tuning

- ✅ Indexes on foreign keys (automatic via REFERENCES)
- ✅ Indexes on frequently filtered columns (status, area_id, type)
- ✅ Indexes on sorting columns (created_at DESC)
- ✅ Unique constraint on (post_id, user_id) for likes
- ⚡ RLS policies are row-level, may impact performance on large datasets

---

## Backup & Recovery

Supabase automatically:
- ✅ Daily backups (7-day retention on free tier)
- ✅ Point-in-time recovery available
- ✅ Replication for high availability

---

**Last Updated**: March 22, 2026  
**Schema Version**: 1.0  
**Database**: Supabase PostgreSQL
