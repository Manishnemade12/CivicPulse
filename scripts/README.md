# Scripts (CivicPulse)

This folder contains small helper scripts to run backend development locally with minimal commands.

## Prerequisites

- Docker + Docker Compose v2 (`docker compose`)
- Java 17+

## 1) Start DB + run backend (one command)

From repo root:

```bash
./scripts/dev-backend.sh
```

What happens:

1. Starts Postgres using `infra/docker-compose.yml`.
2. Waits until Postgres is ready.
3. Checks if the Phase-01 schema exists (looks for `public.users`).
   - If schema is missing, it recreates the Docker volume (`docker compose down -v` then `up -d`) so init scripts run:
     - `docs/plan/phase-01-database/01-schema.sql`
     - `docs/plan/phase-01-database/02-seed.sql`
4. Runs the Spring Boot backend via Maven Wrapper:
   - `backend/api/./mvnw spring-boot:run`

Optional: force a clean DB reset (ERASES local DB data):

```bash
./scripts/dev-backend.sh --reset-db
```

### Backend DB env vars

The script sets defaults suitable for local Docker Postgres:

- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `5433`)
- `DB_NAME` (default: `civicpulse`)
- `DB_USER` (default: `civicpulse`)
- `DB_PASSWORD` (default: `civicpulse`)

Override example:

```bash
DB_PORT=5433 DB_PASSWORD=civicpulse ./scripts/dev-backend.sh
```

## 2) Stop Postgres

From repo root:

```bash
./scripts/stop-backend.sh
```

Notes:

- This stops the Docker Postgres container but **keeps** the Docker volume (your local DB data stays).
- This does **not** stop the Spring Boot backend process. Stop that with `Ctrl+C` in the terminal where it is running.

## Troubleshooting

- If schema/seed didn’t apply: run `./scripts/dev-backend.sh --reset-db` once (fresh volume).
- If Docker is not running: start Docker Desktop/service and re-run.
- If the DB takes long to start: check `docker logs civicpulse-postgres --tail=200`.
