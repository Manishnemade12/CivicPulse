# 06.4 Admin pages (complaints moderation)

## Goal

Implement the admin UI that drives Phase 04 endpoints.

## Page

### `/admin/complaints`

Backend dependencies:

- `GET /api/admin/complaints`
- `POST /api/admin/complaints/{id}/status`

Auth:

- Admin-only (Phase 07.1).

UI requirements (v1):

- List complaints: title, status, createdAt
- For each complaint:
  - status dropdown (RAISED / IN_PROGRESS / RESOLVED)
  - comment input (optional)
  - submit button

Verification:

- After status update:
  - complaint status changes in DB
  - complaint_actions row exists
- If marked RESOLVED:
  - verify a `community_posts` row exists and appears in `/community`

## Docs links

- Phase 04.1: `../phase-04-admin-features/04-01-admin-list-complaints.md`
- Phase 04.2: `../phase-04-admin-features/04-02-admin-update-status.md`
- Phase 04.3: `../phase-04-admin-features/04-03-auto-post-on-resolve.md`
