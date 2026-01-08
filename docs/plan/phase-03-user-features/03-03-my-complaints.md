# 03.3 My complaints list — system design + steps

## Goal

Allow a citizen to view the complaints they submitted, without linking to `users`.

## Schema mapping

- Read: `complaints`
  - Filter by `anonymous_user_hash`

## Backend API

### `GET /api/complaints/my?anonymousUserHash=...`

Response:

```json
[
  {
    "id": "uuid",
    "title": "string",
    "status": "RAISED",
    "createdAt": "timestamptz",
    "updatedAt": "timestamptz"
  }
]
```

Notes

- This is v1 and uses query param for speed.
- Later we can move `anonymousUserHash` to a header or cookie.

## Frontend

Route: `/complaints/my`

- Read `cp_anon_hash` from localStorage
- Call endpoint
- Render list (title, status, date)

Verify

- After creating a complaint, it appears in list.

## Acceptance criteria

- Only complaints for the provided hash are returned
- No user identity is exposed
