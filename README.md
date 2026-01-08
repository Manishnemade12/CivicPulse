# CivicPulse

Standard full-stack layout (not microservices):

- `backend/api/` — Spring Boot backend API
- `frontend/web/` — Next.js frontend
- `infra/` — local infra (optional; Postgres via Docker Compose)
- `docs/` — documentation

See `docs/DEPENDENCIES.md` for full dependency details.

## Run the project (local)

This project runs as two servers:

- Backend (Spring Boot): `http://localhost:8081`
- Frontend (Next.js): `http://localhost:3001`

### 1) Start Postgres (optional)

If you're using local Postgres via Docker:

```bash
cd "CivicPulse "
docker compose -f infra/docker-compose.yml up -d
```

Notes:

- Postgres is exposed on host port **5433** (to avoid conflicts if you already have Postgres on 5432).

### 2) Run backend API

One-command option (starts Postgres + applies schema/seed + runs backend):

```bash
cd "CivicPulse "
./scripts/dev-backend.sh
```

Guide: `docs/plan/phase-00-setup/00-02-one-command-backend.md`

```bash
cd "CivicPulse /backend/api"
DB_PORT=5433 ./mvnw spring-boot:run
```

Verify backend:

```bash
curl http://localhost:8081/actuator/health
```

### 3) Run frontend

```bash
cd "CivicPulse /frontend/web"
npm install
npm run dev -- -p 3001
```

Open:

- http://localhost:3001

## Stop

- Stop backend/frontend: press `Ctrl + C` in their terminals.
- Stop Postgres:

```bash
cd "CivicPulse "
./scripts/stop-backend.sh
```

Or manually:

```bash
cd "CivicPulse "
docker compose -f infra/docker-compose.yml down
```
