# 07.1 Auth hardening + role guards

## Goal

Enforce access control consistently across APIs.

## Rules (minimum)

- Public:
  - `GET /actuator/health`
  - `GET /api/version`
  - `GET /api/community/feed`
- User-auth required:
  - Create community post
  - Comment
  - Like/unlike
- Admin-auth required:
  - `/api/admin/**`

## Schema mapping

- `users.role` is the authority source (`USER` / `ADMIN`).

## Acceptance criteria

- Non-admin cannot call admin endpoints
- Missing token returns 401
