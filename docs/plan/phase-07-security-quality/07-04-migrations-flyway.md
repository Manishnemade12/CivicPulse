# 07.4 Migrations (Flyway) for production

## Goal

Make schema changes safe and repeatable in production (Supabase/AWS).

## Plan

- Add `flyway-core` dependency
- Add migrations under:
  - `backend/api/src/main/resources/db/migration/`
  - `V1__init.sql` (start with current schema)
- Production config:
  - `spring.jpa.hibernate.ddl-auto=validate`

## Acceptance criteria

- App startup applies migrations (or validates already applied migrations)
- No destructive auto schema updates in production
