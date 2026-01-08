# 06.1 App routes + verification map

## Goal

Define exact Next.js routes and what backend endpoint each route must call (no fake UI).

## Base URL

Use `NEXT_PUBLIC_API_BASE_URL` (example: `http://localhost:8081`).

## Route map (v1)

- `/`
  - Calls:
    - `GET /actuator/health`
    - `GET /api/version`
  - Shows: health status + version

- `/complaints/new`
  - Calls:
    - `GET /api/areas`
    - `GET /api/complaint-categories`
    - `POST /api/complaints`
  - Shows: form + submit success id

- `/complaints/my`
  - Calls:
    - `GET /api/complaints/my?anonymousUserHash=...`
  - Shows: list of complaints

- `/complaints/my/[id]`
  - Calls:
    - `GET /api/complaints/{id}?anonymousUserHash=...`
  - Shows: complaint detail

- `/admin/complaints`
  - Calls:
    - `GET /api/admin/complaints`
    - `POST /api/admin/complaints/{id}/status`
  - Shows: list + status update UI

- `/community`
  - Calls:
    - `GET /api/community/feed`
  - Shows: posts list

- `/community/new`
  - Calls:
    - `POST /api/community/posts`
  - Shows: create post form

- `/community/[id]`
  - Calls:
    - `GET /api/community/posts/{id}/comments`
    - `POST /api/community/posts/{id}/comments`
    - `POST /api/community/posts/{id}/like`
    - `DELETE /api/community/posts/{id}/like`
  - Shows: post detail (v1 can be “feed item + comments + like button”)

## Acceptance criteria

- Every route above renders data from a real backend call.
- No route is merged/added without updating Phase 02 API contracts + this file.
