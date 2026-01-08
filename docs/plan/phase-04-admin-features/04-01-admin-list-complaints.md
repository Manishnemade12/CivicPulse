# 04.1 Admin list complaints — system design + steps

## Goal

Allow authority/admin to see all complaints (area/category/status) to take action.

## Schema mapping

- Read: `complaints`
- Optional join (later): `areas`, `complaint_categories`

## Backend API

### `GET /api/admin/complaints?status=RAISED&areaId=...`

Response (v1 minimal):

```json
[
  {
    "id": "uuid",
    "title": "string",
    "status": "RAISED",
    "areaId": "uuid",
    "categoryId": "uuid",
    "createdAt": "timestamptz"
  }
]
```

Auth

- Admin-only.

Privacy

- Must NOT return `anonymous_user_hash` to the UI unless you have a strong need. Prefer not returning it.

## Frontend

Route: `/admin/complaints`

- Simple list with filter dropdown (status)

## Acceptance criteria

- Admin can see complaints and their statuses
- Anonymous hash is not leaked
