# 03.4 Complaint detail — system design + steps

## Goal

Show a single complaint’s details to the submitting citizen (by anonymous hash).

## Schema mapping

- Read: `complaints`

## Backend API

### `GET /api/complaints/{id}?anonymousUserHash=...`

Response:

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "RAISED",
  "images": ["string"],
  "createdAt": "timestamptz",
  "updatedAt": "timestamptz"
}
```

Authorization rule

- Only return if `complaints.anonymous_user_hash` matches provided `anonymousUserHash`.

## Frontend

Route: `/complaints/my/{id}`

- Read `cp_anon_hash` from localStorage
- Call endpoint
- Render details

## Acceptance criteria

- Wrong hash → 404 (or 403, but prefer 404 for privacy)
- Right hash → details returned
