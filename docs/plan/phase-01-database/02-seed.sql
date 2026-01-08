-- CivicPulse seed data (Phase 01)
-- Keep this minimal: reference tables for UI + dev experience.

-- Complaint categories
insert into complaint_categories(name)
values ('Roads'), ('Water'), ('Sanitation'), ('Safety')
on conflict do nothing;

-- Areas
insert into areas(city, zone, ward)
values
  ('YourCity', 'Zone-1', 'Ward-1'),
  ('YourCity', 'Zone-2', 'Ward-2'),
  ('YourCity', 'Zone-3', 'Ward-3');

-- Optional users
-- Prefer creating users through the backend once auth is implemented,
-- because password hashing rules belong to the application.
--
-- Example placeholder (DO NOT use plaintext in real environments):
-- insert into users(name, email, password_hash, role)
-- values ('Admin', 'admin@civicpulse.local', '<bcrypt-hash-here>', 'ADMIN');
