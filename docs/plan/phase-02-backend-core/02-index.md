# Phase 02 — Backend Core (Spring Boot)

## Outcome

A stable backend foundation with:

- DB connectivity (local + Supabase)
- Auth strategy decided (JWT or Supabase Auth)
- Minimal APIs that the frontend can call continuously during development

## Parallel development rule

Every backend chunk should be followed by a tiny frontend screen that calls it.

## Sub-tasks (small chunks)

1. 02.1 Health + version endpoint
2. 02.2 DB connectivity check endpoint
3. 02.3 Entities + repositories (start with 1 table)
4. 02.4 Auth v1 (choose one)
5. 02.5 API error handling + validation baseline

Notes:

- You can keep `ddl-auto=update` in dev while the schema is stabilizing.
- For production, move to Flyway migrations.
