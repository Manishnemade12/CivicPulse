# 07.5 Deployment runbook (Supabase / AWS)

## Goal

Define how to run CivicPulse in production with Supabase Postgres or AWS RDS.

## Common requirements

- Set DB env vars:
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Use Flyway migrations (Phase 07.4)
- Set server port if needed: `server.port`

## Supabase (Postgres)

- Create Supabase project
- Apply `01-schema.sql` (or Flyway migrations)
- Use Supabase connection string values for env vars

## AWS (RDS Postgres)

- Create RDS Postgres instance
- Configure security group for your backend runtime
- Set env vars to RDS endpoint

## Acceptance criteria

- Backend starts and connects to production DB
- `/actuator/health` reports UP
