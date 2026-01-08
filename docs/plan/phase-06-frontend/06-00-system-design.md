# Frontend System Design (Phase 06)

## Goal

Define a frontend architecture that can be developed in tiny verified steps in parallel with backend APIs.

## Assumptions

- Next.js App Router (`frontend/web/app`)
- Minimal dependencies (use `fetch` first)

## Proposed route map

- `/` — system status (backend health + version)
- `/complaints/new` — create complaint (anonymous)
- `/complaints/my` — list my complaints
- `/complaints/my/[id]` — complaint detail
- `/admin/complaints` — admin list + status update
- `/community` — feed
- `/community/new` — create post
- `/community/[id]` — post detail (comments + likes)

## API client

- Centralize base URL in env var:
  - `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8081`)

## State strategy (simple)

- Start with server components + `fetch`.
- Use client components only where needed (forms, interactions).

## Acceptance criteria

- Each route is introduced only after the backend endpoint exists.
- Each page has a simple verification checklist.
