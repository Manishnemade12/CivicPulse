# 01.5 Local Docker Postgres → Supabase migration (after development)

## Goal

Move from **local Docker Postgres** (dev) to **Supabase Postgres** (staging/prod) with minimal surprises.

This is a pragmatic v1 guide:

- Schema is applied via `docs/plan/phase-01-database/01-schema.sql`
- Data migration is optional and selective (areas/categories first)

## When to do this

- Backend APIs are stable enough (Phase 02+)
- You want a cloud DB for staging, demos, or production

## Inputs

- Local DB running via `infra/docker-compose.yml`
  - Host port is `5433` (container `5432`)
- Supabase project created
- Supabase DB credentials available (host/user/password/db/port)

## Part A — Schema on Supabase (recommended)

1) Open Supabase → **SQL Editor**

2) Run the same schema SQL:

- `docs/plan/phase-01-database/01-schema.sql`

3) If extension permissions fail

Supabase usually supports `uuid-ossp`, but if you see permission errors, use `pgcrypto` instead:

```sql
create extension if not exists "pgcrypto";
-- then use: gen_random_uuid() instead of uuid_generate_v4()
```

4) Verify

In Supabase Table editor or SQL:

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected tables include (at least):
- `areas`, `complaint_categories`, `complaints`, `complaint_actions`, `community_posts`, `comments`, `post_likes`, `users`

## Part B — Move data from local to Supabase (optional)

### What you should migrate first

- `areas`
- `complaint_categories`

These are safe “reference tables” that the UI depends on.

Avoid migrating volatile tables initially (unless you really need historical dev data):
- `complaints`, `complaint_actions`, `community_posts`, `comments`, `post_likes`, `users`

### Option 1 (simplest): re-seed instead of migrating

- Re-run your seed steps on Supabase
- This is usually fastest + cleanest

### Option 2: export/import with `pg_dump` + `psql`

If you want real data:

1) Export from local Docker Postgres

```bash
# Run on your host machine
pg_dump \
  --host localhost --port 5433 \
  --username civicpulse \
  --format=custom \
  --file civicpulse.dump \
  civicpulse
```

2) Restore to Supabase

Supabase connection strings vary. Prefer using **Supabase CLI** or a direct `pg_restore` if network access allows.

Example (generic Postgres):

```bash
pg_restore \
  --host <SUPABASE_HOST> --port <SUPABASE_PORT> \
  --username <SUPABASE_USER> \
  --dbname <SUPABASE_DB> \
  --clean --if-exists \
  civicpulse.dump
```

Notes:
- `--clean --if-exists` will DROP/replace objects; use only if you’re sure.
- If you already applied schema manually, restore **data only**:

```bash
pg_restore \
  --data-only \
  --host <SUPABASE_HOST> --port <SUPABASE_PORT> \
  --username <SUPABASE_USER> \
  --dbname <SUPABASE_DB> \
  civicpulse.dump
```

If you run into role/ownership issues during restore:
- Remove owner/privileges:
  - Use `pg_dump --no-owner --no-acl` (plain format) or
  - Use Supabase tooling

## Part C — Switch backend config to Supabase

Important clarification (common confusion)

- Supabase “3 keys/values” people mention are for **Supabase APIs / Auth**:
  - Project URL (e.g. `https://<project-ref>.supabase.co`)
  - `anon` (publishable) key (frontend-safe)
  - `service_role` key (server-only secret)
- Your Spring Boot backend in this plan connects via **JDBC directly to Postgres**.
  - For JDBC you do **NOT** use `anon` / `service_role` keys.
  - You use **Postgres connection credentials** (host, port, db name, user, password).

Where to find Supabase DB credentials

- Supabase Dashboard → **Project Settings** → **Database** → **Connection string / Connection parameters**
  - Use the values shown there for the env vars below.

Your backend reads DB config from env vars:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### Local dev values (Docker)

- `DB_HOST=localhost`
- `DB_PORT=5433`
- `DB_NAME=civicpulse`
- `DB_USER=civicpulse`
- `DB_PASSWORD=civicpulse`

### Supabase values

Set the env vars to your Supabase credentials (from Supabase project settings).

Example (typical)

```bash
DB_HOST="<your-supabase-db-host>" \
DB_PORT="5432" \
DB_NAME="postgres" \
DB_USER="postgres" \
DB_PASSWORD="<your-db-password>" \
./mvnw spring-boot:run
```

Notes:

- Some Supabase projects expose a **connection pooler** port (often `6543`). If your dashboard gives a pooler host/port, use that.
- `DB_NAME` is often `postgres` on Supabase (check your dashboard).

Important: for production-quality behavior (Phase 07), prefer:
- `spring.jpa.hibernate.ddl-auto=validate`
- Flyway migrations

## Part D — Verify after switching

Run these checks in order:

1) Backend boots and connects (no JDBC errors)
2) `GET /actuator/health` returns `UP`
3) `GET /api/version` returns expected JSON
4) Frontend pages that rely on reference data work:
   - `/complaints/new` loads areas + categories
   - `/community` loads feed

## Rollback plan

If anything goes wrong:
- Switch env vars back to local Docker Postgres
- Keep Supabase schema/data intact and retry later

## Common gotchas

- Port mismatch:
  - Local Docker uses host `5433` → container `5432`
- Extensions:
  - Prefer `pgcrypto` on Supabase if `uuid-ossp` is blocked
- Don’t rely on `ddl-auto=update` for production
  - Use migrations (Flyway) once stable
