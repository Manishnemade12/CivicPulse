# 01.3 Seed data (to unblock UI)

## Goal

Insert minimum seed data so backend and frontend screens can be tested without manual inserts every time.

## Seed data to add

- `areas`: 2–3 rows (city/zone/ward)
- `complaint_categories`: common categories (Roads, Water, Sanitation, Safety)
- `users`: 1 admin + 1 normal user (if you manage passwords via your backend auth)

## Steps (psql)

```sql
insert into complaint_categories(name)
values ('Roads'), ('Water'), ('Sanitation'), ('Safety')
on conflict do nothing;

insert into areas(city, zone, ward)
values ('YourCity', 'Zone-1', 'Ward-1'), ('YourCity', 'Zone-2', 'Ward-2');
```

## Acceptance criteria

- Categories + areas appear in DB.
- Backend endpoints (later) can list categories/areas successfully.
