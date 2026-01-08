# One command: run backend + DB (local)

## Goal

Run everything needed for backend development with **one command**:

- Local Postgres via Docker
- Phase-01 schema + seed
- Spring Boot backend API

## Command

From repo root:

```bash
./scripts/dev-backend.sh
```

Optional: reset the local DB volume (erases local DB data):

```bash
./scripts/dev-backend.sh --reset-db
```

## What it does

1) `docker compose -f infra/docker-compose.yml up -d`
2) Checks whether schema exists (looks for `public.users`)
   - If missing, it runs `docker compose down -v` and starts again so init SQL applies:
     - `docs/plan/phase-01-database/01-schema.sql`
     - `docs/plan/phase-01-database/02-seed.sql`
3) Runs backend:

```bash
cd backend/api
./mvnw spring-boot:run
```

## Verify

- Health: http://localhost:8081/actuator/health

## Stop

- Stop backend (Spring Boot): press `Ctrl+C` in the terminal running it.
- Stop Postgres (Docker):

```bash
./scripts/stop-backend.sh
```

## Notes

- Postgres host port is `5433` (see infra/docker-compose.yml).
- Backend reads DB config from env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
