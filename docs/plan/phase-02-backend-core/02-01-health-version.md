# 02.1 Health + version endpoint (backend) + simple UI (frontend)

## Goal

Create a stable “is the system up?” contract.

## Backend

- Ensure `GET /actuator/health` works.
- Add `GET /api/version` returning:

```json
{ "name": "civicpulse-backend", "version": "0.0.1" }
```

## Frontend

- Add a small status card on home page that shows:
  - backend health
  - backend version

## Acceptance criteria

- `curl http://localhost:8081/actuator/health`
- `curl http://localhost:8081/api/version`
- Frontend displays both values.
