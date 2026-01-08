# 01.2 Apply schema on Supabase

## Goal

Create the same schema on Supabase Postgres.

## Inputs

- Supabase project created
- Supabase SQL editor access

## Steps

1) Open Supabase → SQL Editor

2) Paste and run:

- `docs/plan/phase-01-database/01-schema.sql`

3) Verify tables

- Table editor shows all expected tables.

## Notes (Supabase)

- Supabase supports `uuid-ossp`, but if you hit an extension permission error, switch to `pgcrypto`:

```sql
create extension if not exists "pgcrypto";
-- then use: gen_random_uuid() instead of uuid_generate_v4()
```

## Acceptance criteria

- Supabase has all tables + enums.
- Your backend can connect using Supabase connection details.
