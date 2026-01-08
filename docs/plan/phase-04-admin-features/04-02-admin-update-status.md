# 04.2 Admin update status + action log — system design + steps

## Goal

Allow admin to change complaint status and record the action.

## Schema mapping

- Write: `complaints.status`, `complaints.updated_at`
- Insert: `complaint_actions`
  - `complaint_id`, `admin_id`, `action`, `comment`

## Backend API

### `POST /api/admin/complaints/{id}/status`

Request:

```json
{ "status": "IN_PROGRESS", "comment": "optional" }
```

Effects:

- Update complaint status
- Insert complaint action:
  - `action = STATUS_UPDATE`
  - `comment` optional

Auth

- Admin-only.

## Frontend

- On admin list, add a status dropdown + submit button

## Acceptance criteria

- Status updates in DB
- `complaint_actions` row created
