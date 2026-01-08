# 01.1 Apply schema locally (Docker Postgres)

## Goal

Load `01-schema.sql` into the local Docker Postgres so backend/frontend dev can start immediately.

## Inputs

- Docker running
- Container `civicpulse-postgres` running (from `infra/docker-compose.yml`)

## Steps

1) Start Postgres

```bash
cd "CivicPulse "
docker compose -f infra/docker-compose.yml up -d
```

2) Open `psql` inside the container

```bash
docker exec -it civicpulse-postgres psql -U civicpulse -d civicpulse
```

3) Run schema SQL

Option A (recommended): copy-paste the contents of `docs/plan/phase-01-database/01-schema.sql` into the `psql` session.

Option B: run it from file (requires file inside container). If you want this, we can add a helper script later.

4) Verify

```sql
\dt
select * from users limit 1;
```

## Output

- Tables exist in local DB.

## Acceptance criteria

- `\dt` shows: `users`, `areas`, `complaint_categories`, `complaints`, `complaint_actions`, `community_posts`, `comments`, `post_likes`.
