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

On a **fresh** local DB (new Docker volume), the container will auto-run:

- `docs/plan/phase-01-database/01-schema.sql`
- `docs/plan/phase-01-database/02-seed.sql`

If you already have an existing volume and want to re-apply from scratch:

```bash
cd "CivicPulse "
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d
```

2) Open `psql` inside the container

```bash
docker exec -it civicpulse-postgres psql -U civicpulse -d civicpulse
```

3) Run schema SQL

If you prefer manual apply (without resetting the volume), copy-paste:

- `docs/plan/phase-01-database/01-schema.sql`
- `docs/plan/phase-01-database/02-seed.sql`

4) Verify

```sql
\dt
select * from users limit 1;
```

## Output

- Tables exist in local DB.

## Acceptance criteria

- `\dt` shows: `users`, `areas`, `complaint_categories`, `complaints`, `complaint_actions`, `community_posts`, `comments`, `post_likes`.
