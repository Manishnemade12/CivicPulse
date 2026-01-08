# 06.5 Auth pages (depends on chosen auth)

## Goal

Define frontend auth UI without guessing the backend auth implementation.

## Option A — Backend-issued JWT

Pages:

- `/register`
- `/login`

Storage:

- Store token in an httpOnly cookie (preferred) or localStorage (v1 only).

Required backend endpoints (to be defined in Phase 02/07 once you choose Option A):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`

## Option B — Supabase Auth

Pages:

- `/login` (via Supabase UI)

Backend:

- Frontend gets Supabase JWT
- Backend validates Supabase JWT for protected endpoints

## Acceptance criteria

- Protected pages cannot be accessed without auth.
- Admin page requires admin role.
