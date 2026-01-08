# 03.2 Raise complaint (anonymous) — system design + steps

## Goal

Allow a citizen to submit a complaint without exposing their identity to authorities or public feed.

## Schema mapping

- Write: `complaints`
  - `area_id`, `category_id`, `anonymous_user_hash`, `title`, `description`, `images`, `status`

## Backend API (small)

### `POST /api/complaints`

Request:

```json
{
  "areaId": "uuid",
  "categoryId": "uuid",
  "anonymousUserHash": "string",
  "title": "string",
  "description": "string",
  "images": ["string"]
}
```

Response:

```json
{ "id": "uuid" }
```

Validation rules (v1)

- `areaId`, `categoryId` required
- `anonymousUserHash` required, 10–255 chars
- `title` required, max 200
- `description` required
- `images` optional (store as text[] URLs for now)

Privacy rule (critical)

- This endpoint must NOT accept or return user identity fields.

## Frontend (verify immediately)

Route: `/complaints/new`

- Inputs: area dropdown, category dropdown, title, description, images URLs (comma separated)
- Client-side: generate/store `anonymousUserHash` in browser localStorage (v1)
  - key: `cp_anon_hash`

Verify

- Submit → show created complaint id
- Check DB:

```sql
select id, status, anonymous_user_hash, title from complaints order by created_at desc limit 5;
```

## Acceptance criteria

- Complaint row inserted with status `RAISED`
- No user identity stored in `complaints`
- Frontend can submit and show success

## TODO (future)

- Replace localStorage hash with server-issued anonymous token if needed.
