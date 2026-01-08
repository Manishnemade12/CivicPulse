# CivicPulse Delivery Plan

This folder contains the implementation plan broken into phases and small sub-tasks.

## How to use this plan

- Each phase has its own folder (`phase-00-*`, `phase-01-*`, ...)
- Each sub-task is a separate file with:
  - **Goal** (what we are trying to achieve)
  - **Scope** (what is included/excluded)
  - **Inputs** (what must exist before starting)
  - **Outputs** (what is produced)
  - **Acceptance criteria** (how to verify)
  - **Notes/Risks**

## Conventions

- Environment strategy:
  - **Local dev**: Docker Postgres (host port 5433) + Spring Boot + Next.js
  - **Production**: Supabase Postgres or AWS RDS
- Schema changes:
  - **Dev** can use JPA `ddl-auto=update` temporarily
  - **Production** should use migrations (Flyway) and `ddl-auto=validate`

## Phases

- Phase 00: Setup & clarity
- Phase 01: Database design (Supabase/Postgres)
- Phase 02: Backend core (Spring Boot)
- Phase 03: User features (anonymous complaints)
- Phase 04: Admin features (resolve + auto-post)
- Phase 05: Community (social hub)
- Phase 06: Frontend (Next.js)
- Phase 07: Security, privacy, quality, deployment

Start here:

- Phase 00 index: `phase-00-setup/00-index.md`

Then follow:

- Phase 01 index: `phase-01-database/01-index.md`
- Phase 02 index: `phase-02-backend-core/02-index.md`
- Phase 03 index: `phase-03-user-features/03-index.md`
- Phase 04 index: `phase-04-admin-features/04-index.md`
- Phase 05 index: `phase-05-community/05-index.md`
- Phase 06 index: `phase-06-frontend/06-index.md`
- Phase 07 index: `phase-07-security-quality/07-index.md`

## Cross-phase verification

- Traceability (schema → API → frontend): `TRACEABILITY.md`

## Parallel delivery pattern (recommended)

Repeat this loop:

1) Add **one backend API** (small, testable)
2) Add **one frontend screen** that calls it
3) Verify using `curl` + browser
