# Phase 00 — Clarity & Setup (Foundation)

## Outcome

A stable developer environment + locked scope so database/API work doesn’t churn.

## Sub-tasks

1. 00.1 Feature lock + rules of privacy
2. 00.2 Local dev setup (backend + frontend + Postgres)
3. 00.3 Environments strategy (local vs Supabase vs AWS)

---

## 00.1 Feature lock + privacy rules

**Goal**

- Finalize feature boundaries and the privacy model (anonymous complaint flow vs public social hub).

**Decisions to lock**

- Complaint workflow:
  - Anonymous to authorities
  - User can track their own complaints
  - Status: `RAISED → IN_PROGRESS → RESOLVED`
- Social hub:
  - Non-anonymous content (user identity visible)
  - Posts, comments, likes
- Roles:
  - `USER`, `ADMIN` (authority)
- “Auto-post on resolve” rule:
  - When complaint is marked `RESOLVED`, a community post is created automatically

**Acceptance criteria**

- Documented in `project.md` / `projectdeatils.md` with no contradictions.
- One page “privacy rules” written (what must NEVER be returned by APIs).

---

## 00.2 Local dev setup

**Goal**

- Everyone can run the app locally.

**Inputs**

- See `docs/DEPENDENCIES.md`.

**Outputs**

- Backend reachable: `http://localhost:8081/actuator/health`
- Frontend reachable: `http://localhost:3001/`
- Postgres reachable through Docker on host port `5433`

**Acceptance criteria**

- Fresh clone → following README steps works.

---

## 00.3 Environment strategy

**Goal**

- Decide how dev/staging/prod connect to databases and how secrets are managed.

**Plan**

- Local: Docker Postgres + `.env` (not committed)
- Staging/Prod: Supabase Postgres or AWS RDS + platform-managed secrets

**Acceptance criteria**

- Backend configuration supports environment variables for DB credentials.
- No credentials committed to git.

## Database schema

The Postgres/Supabase schema is maintained in Phase 01:

- `../phase-01-database/01-schema.sql`
