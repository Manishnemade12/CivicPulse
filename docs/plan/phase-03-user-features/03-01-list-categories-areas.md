# 03.1 List categories + areas (backend) + dropdowns (frontend)

## Goal

Before complaint creation UI, the frontend needs area/category lists.

## Backend APIs

- `GET /api/areas`
  - returns `{ id, city, zone, ward }[]`
- `GET /api/complaint-categories`
  - returns `{ id, name }[]`

## Frontend

- Add `/complaints/new` page with two dropdowns (area + category)
- Show loading/error states

## Acceptance criteria

- DB has seeded rows (Phase 01.3)
- Hitting both endpoints returns data
- New complaint page loads dropdowns correctly
