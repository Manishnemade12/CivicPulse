# Plan Traceability (Schema → API → Frontend)

## Goal

Ensure each feature is connected end-to-end:

- DB schema table(s)
- Backend endpoint(s)
- Frontend route(s)
- Owning phase docs

If something is missing in one column, it’s a blocker.

---

## Core system status

- DB: (none)
- Backend:
  - `GET /actuator/health`
  - `GET /api/version`
- Frontend:
  - `/` (status page)
- Docs:
  - Phase 02: `phase-02-backend-core/02-01-health-version.md`
  - Phase 06: `phase-06-frontend/06-01-app-routes-and-verification.md`

---

## Areas + categories (needed for complaint creation)

- DB:
  - `areas`
  - `complaint_categories`
- Backend:
  - `GET /api/areas`
  - `GET /api/complaint-categories`
- Frontend:
  - `/complaints/new` (dropdowns)
- Docs:
  - Phase 03: `phase-03-user-features/03-01-list-categories-areas.md`
  - Phase 06: `phase-06-frontend/06-02-complaints-pages.md`

---

## Anonymous complaints (create + list + detail)

- DB:
  - `complaints`
- Backend:
  - `POST /api/complaints`
  - `GET /api/complaints/my?anonymousUserHash=...`
  - `GET /api/complaints/{id}?anonymousUserHash=...`
- Frontend:
  - `/complaints/new` (create)
  - `/complaints/my` (list)
  - `/complaints/my/[id]` (detail)
- Docs:
  - Phase 03: `phase-03-user-features/03-02-raise-complaint.md`
  - Phase 03: `phase-03-user-features/03-03-my-complaints.md`
  - Phase 03: `phase-03-user-features/03-04-complaint-detail.md`
  - Phase 06: `phase-06-frontend/06-02-complaints-pages.md`

---

## Admin lifecycle (list + status update + action log)

- DB:
  - `complaints`
  - `complaint_actions`
- Backend:
  - `GET /api/admin/complaints`
  - `POST /api/admin/complaints/{id}/status`
- Frontend:
  - `/admin/complaints` (list + status update)
- Docs:
  - Phase 04: `phase-04-admin-features/04-01-admin-list-complaints.md`
  - Phase 04: `phase-04-admin-features/04-02-admin-update-status.md`
  - Phase 06: `phase-06-frontend/06-04-admin-pages.md`
  - Phase 07: `phase-07-security-quality/07-01-authz.md`

---

## Auto-post on resolve

- DB:
  - `community_posts`
- Backend:
  - Side-effect of `POST /api/admin/complaints/{id}/status` when status becomes `RESOLVED`
- Frontend:
  - `/community` (must show new post)
- Docs:
  - Phase 04: `phase-04-admin-features/04-03-auto-post-on-resolve.md`
  - Phase 05: `phase-05-community/05-01-feed.md`

---

## Community feed + posts + comments + likes

- DB:
  - `community_posts`
  - `comments`
  - `post_likes`
  - `users` (for author identity)
- Backend:
  - `GET /api/community/feed`
  - `POST /api/community/posts`
  - `GET /api/community/posts/{id}/comments`
  - `POST /api/community/posts/{id}/comments`
  - `POST /api/community/posts/{id}/like`
  - `DELETE /api/community/posts/{id}/like`
- Frontend:
  - `/community` (feed)
  - `/community/new` (create post)
  - `/community/[id]` (post detail + comments + like)
- Docs:
  - Phase 05: `phase-05-community/05-01-feed.md`
  - Phase 05: `phase-05-community/05-02-create-post.md`
  - Phase 05: `phase-05-community/05-03-comments.md`
  - Phase 05: `phase-05-community/05-04-likes.md`
  - Phase 06: `phase-06-frontend/06-03-community-pages.md`
  - Phase 07: `phase-07-security-quality/07-01-authz.md`

---

## Auth (only after decision)

- DB:
  - `users`
- Backend:
  - Option A (backend JWT): login/register endpoints (to be defined)
  - Option B (Supabase): validate Supabase JWT (to be defined)
- Frontend:
  - `/login`, `/register` (if Option A)
- Docs:
  - Phase 07: `phase-07-security-quality/07-01-authz.md`
  - Phase 06: `phase-06-frontend/06-05-auth-pages.md`
