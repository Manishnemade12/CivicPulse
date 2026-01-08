# 02.2 API Contracts (incremental, backend+frontend)

This file lists the API endpoints in the order we should implement them so frontend can be built and verified continuously.

## Conventions

- Base URL: `http://localhost:8081`
- JSON responses
- Auth: `Authorization: Bearer <token>` when enabled

---

## Step 1 — Version

### `GET /api/version`

Response:

```json
{ "name": "civicpulse-backend", "version": "0.0.1" }
```

Frontend check:

- Home page shows version.

---

## Step 2 — List areas

### `GET /api/areas`

Response:

```json
[
  { "id": "uuid", "city": "...", "zone": "...", "ward": "..." }
]
```

DB table: `areas`

Frontend check:

- New complaint page dropdown.

---

## Step 3 — List complaint categories

### `GET /api/complaint-categories`

Response:

```json
[
  { "id": "uuid", "name": "Roads" }
]
```

DB table: `complaint_categories`

Frontend check:

- New complaint page dropdown.

---

## Step 4 — Create complaint (anonymous)

### `POST /api/complaints`

Request:

```json
{
  "areaId": "uuid",
  "categoryId": "uuid",
  "anonymousUserHash": "string",
  "title": "string",
  "description": "string",
  "images": ["url1", "url2"]
}
```

Response:

```json
{ "id": "uuid" }
```

DB table: `complaints`

Frontend check:

- Submit complaint form.

---

## Step 5 — My complaints

### `GET /api/complaints/my?anonymousUserHash=...`

Response:

```json
[
  {
    "id": "uuid",
    "title": "...",
    "status": "RAISED",
    "createdAt": "..."
  }
]
```

DB table: `complaints`

Frontend check:

- My complaints list.

---

## Step 5b — Complaint detail

### `GET /api/complaints/{id}?anonymousUserHash=...`

Response:

```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "status": "RAISED",
  "images": ["..."],
  "createdAt": "...",
  "updatedAt": "..."
}
```

DB table: `complaints`

Frontend check:

- Complaint detail page (`/complaints/my/[id]`).

Privacy check:

- Wrong `anonymousUserHash` should not reveal complaint existence (prefer 404).

---

## Step 6 — Admin: list complaints

### `GET /api/admin/complaints`

Response:

```json
[
  {
    "id": "uuid",
    "title": "...",
    "status": "RAISED",
    "areaId": "uuid",
    "categoryId": "uuid"
  }
]
```

Auth: admin-only

Frontend check:

- Admin complaints page loads list.

---

## Step 7 — Admin: update status (and create action)

### `POST /api/admin/complaints/{id}/status`

Request:

```json
{ "status": "IN_PROGRESS", "comment": "optional" }
```

Effects:

- Update `complaints.status`
- Insert into `complaint_actions`
- If status becomes `RESOLVED`:
  - Create `community_posts` with type `RESOLVED_COMPLAINT`

DB tables: `complaints`, `complaint_actions`, `community_posts`

Frontend check:

- Admin page updates status and shows success.
- If status becomes `RESOLVED`, the new post appears in `/community`.

---

## Step 8 — Community feed

### `GET /api/community/feed`

Response:

```json
[
  {
    "id": "uuid",
    "type": "USER_POST",
    "title": "...",
    "content": "...",
    "createdAt": "..."
  }
]
```

DB table: `community_posts`

Frontend check:

- `/community` renders the feed from this endpoint.

---

## Step 9 — Community: create post

### `POST /api/community/posts`

Request:

```json
{ "title": "string", "content": "string", "mediaUrls": ["string"] }
```

Response:

```json
{ "id": "uuid" }
```

DB table: `community_posts`

Auth: user-auth required

Frontend check:

- `/community/new` submits successfully and redirects.

---

## Step 10 — Community: comments

### `GET /api/community/posts/{id}/comments`

### `POST /api/community/posts/{id}/comments`

Request:

```json
{ "comment": "string" }
```

DB table: `comments`

Auth: user-auth required for posting

Frontend check:

- `/community/[id]` shows comments and can add one.

---

## Step 11 — Community: likes

### `POST /api/community/posts/{id}/like`

### `DELETE /api/community/posts/{id}/like`

DB table: `post_likes`

Auth: user-auth required

Frontend check:

- `/community/[id]` like button toggles without duplicates.
