-- ============================================================================
-- CivicPulse Supabase Schema (Consolidated)
-- ============================================================================
-- This file contains the complete database schema for CivicPulse on Supabase
-- Including: tables, enums, indexes, RLS policies, triggers, and seed data
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

create type user_role as enum ('USER', 'ADMIN');

create type complaint_status as enum (
  'RAISED',
  'IN_PROGRESS',
  'RESOLVED'
);

create type complaint_action_type as enum (
  'STATUS_UPDATE',
  'COMMENT'
);

create type community_post_type as enum (
  'USER_POST',
  'RESOLVED_COMPLAINT'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- =========================
-- USERS TABLE
-- =========================

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  email varchar(150) unique not null,
  password_hash text not null,
  role user_role default 'USER',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- AREAS TABLE
-- =========================

create table if not exists areas (
  id uuid primary key default gen_random_uuid(),
  city varchar(100) not null,
  zone varchar(100),
  ward varchar(100),
  created_at timestamptz default now()
);

-- =========================
-- COMPLAINT CATEGORIES TABLE
-- =========================

create table if not exists complaint_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  created_at timestamptz default now()
);

-- =========================
-- COMPLAINTS TABLE (ANONYMOUS)
-- =========================

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references areas(id) on delete restrict,
  category_id uuid not null references complaint_categories(id),
  anonymous_user_hash varchar(255) not null,
  title varchar(200) not null,
  description text not null,
  images text[],
  status complaint_status default 'RAISED',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- COMPLAINT ACTIONS TABLE (ADMIN AUDIT TRAIL)
-- =========================

create table if not exists complaint_actions (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  admin_id uuid not null references users(id),
  action complaint_action_type not null,
  comment text,
  created_at timestamptz default now()
);

-- =========================
-- COMMUNITY POSTS TABLE
-- =========================

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  type community_post_type not null,
  title varchar(200),
  content text not null,
  media_urls text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- COMMENTS TABLE
-- =========================

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references users(id),
  comment text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- POST LIKES TABLE
-- =========================

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references users(id),
  unique (post_id, user_id),
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_complaints_area on complaints(area_id);
create index if not exists idx_complaints_status on complaints(status);
create index if not exists idx_complaints_user_hash on complaints(anonymous_user_hash);
create index if not exists idx_complaints_created_at on complaints(created_at desc);

create index if not exists idx_complaint_actions_complaint on complaint_actions(complaint_id);
create index if not exists idx_complaint_actions_admin on complaint_actions(admin_id);
create index if not exists idx_complaint_actions_created_at on complaint_actions(created_at desc);

create index if not exists idx_posts_type on community_posts(type);
create index if not exists idx_posts_user on community_posts(user_id);
create index if not exists idx_posts_created_at on community_posts(created_at desc);

create index if not exists idx_comments_post on comments(post_id);
create index if not exists idx_comments_user on comments(user_id);
create index if not exists idx_comments_created_at on comments(created_at desc);

create index if not exists idx_post_likes_post on post_likes(post_id);
create index if not exists idx_post_likes_user on post_likes(user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for users table
drop trigger if exists trigger_users_updated_at on users;
create trigger trigger_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();

-- Trigger for complaints table
drop trigger if exists trigger_complaints_updated_at on complaints;
create trigger trigger_complaints_updated_at
  before update on complaints
  for each row
  execute function update_updated_at_column();

-- Trigger for community_posts table
drop trigger if exists trigger_community_posts_updated_at on community_posts;
create trigger trigger_community_posts_updated_at
  before update on community_posts
  for each row
  execute function update_updated_at_column();

-- Trigger for comments table
drop trigger if exists trigger_comments_updated_at on comments;
create trigger trigger_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table areas enable row level security;
alter table complaint_categories enable row level security;
alter table complaints enable row level security;
alter table complaint_actions enable row level security;
alter table community_posts enable row level security;
alter table comments enable row level security;
alter table post_likes enable row level security;

-- ========================
-- USERS RLS POLICIES
-- ========================
-- Users can view their own profile + all public user info (name)
create policy "users_select_own" on users
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "users_update_own" on users
  for update using (auth.uid() = id);

-- Admins can view all users (for management)
create policy "users_select_admin" on users
  for select using (
    exists(
      select 1 from users where id = auth.uid() and role = 'ADMIN'
    )
  );

-- ========================
-- AREAS RLS POLICIES
-- ========================
-- Everyone can read areas (reference data)
create policy "areas_select_all" on areas
  for select using (true);

-- ========================
-- COMPLAINT_CATEGORIES RLS POLICIES
-- ========================
-- Everyone can read categories (reference data)
create policy "complaint_categories_select_all" on complaint_categories
  for select using (true);

-- ========================
-- COMPLAINTS RLS POLICIES
-- ========================
-- Anyone can insert complaints (anonymous)
create policy "complaints_insert_all" on complaints
  for insert with check (true);

-- Anyone can view complaints (anonymous complaints are public)
create policy "complaints_select_all" on complaints
  for select using (true);

-- Only admins can update complaints
create policy "complaints_update_admin" on complaints
  for update using (
    exists(
      select 1 from users where id = auth.uid() and role = 'ADMIN'
    )
  );

-- ========================
-- COMPLAINT_ACTIONS RLS POLICIES
-- ========================
-- Anyone can view complaint actions (audit trail is public)
create policy "complaint_actions_select_all" on complaint_actions
  for select using (true);

-- Only admins can insert complaint actions
create policy "complaint_actions_insert_admin" on complaint_actions
  for insert with check (
    exists(
      select 1 from users where id = auth.uid() and role = 'ADMIN'
    )
  );

-- ========================
-- COMMUNITY_POSTS RLS POLICIES
-- ========================
-- Anyone can read community posts
create policy "community_posts_select_all" on community_posts
  for select using (true);

-- Authenticated users can insert posts
create policy "community_posts_insert_auth" on community_posts
  for insert with check (auth.uid() is not null and user_id = auth.uid());

-- Users can update their own posts
create policy "community_posts_update_own" on community_posts
  for update using (auth.uid() = user_id);

-- Users can delete their own posts
create policy "community_posts_delete_own" on community_posts
  for delete using (auth.uid() = user_id);

-- Admins can delete any post
create policy "community_posts_delete_admin" on community_posts
  for delete using (
    exists(
      select 1 from users where id = auth.uid() and role = 'ADMIN'
    )
  );

-- ========================
-- COMMENTS RLS POLICIES
-- ========================
-- Anyone can read comments
create policy "comments_select_all" on comments
  for select using (true);

-- Authenticated users can insert comments
create policy "comments_insert_auth" on comments
  for insert with check (auth.uid() is not null and user_id = auth.uid());

-- Users can update their own comments
create policy "comments_update_own" on comments
  for update using (auth.uid() = user_id);

-- Users can delete their own comments
create policy "comments_delete_own" on comments
  for delete using (auth.uid() = user_id);

-- ========================
-- POST_LIKES RLS POLICIES
-- ========================
-- Anyone can read likes
create policy "post_likes_select_all" on post_likes
  for select using (true);

-- Authenticated users can insert likes
create policy "post_likes_insert_auth" on post_likes
  for insert with check (auth.uid() is not null and user_id = auth.uid());

-- Users can delete their own likes
create policy "post_likes_delete_own" on post_likes
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Complaint Categories (reference data)
insert into complaint_categories (name) values
  ('Roads')
  on conflict do nothing;

insert into complaint_categories (name) values
  ('Water')
  on conflict do nothing;

insert into complaint_categories (name) values
  ('Sanitation')
  on conflict do nothing;

insert into complaint_categories (name) values
  ('Safety')
  on conflict do nothing;

-- Areas (reference data)
insert into areas (city, zone, ward) values
  ('YourCity', 'Zone-1', 'Ward-1')
  on conflict do nothing;

insert into areas (city, zone, ward) values
  ('YourCity', 'Zone-2', 'Ward-2')
  on conflict do nothing;

insert into areas (city, zone, ward) values
  ('YourCity', 'Zone-3', 'Ward-3')
  on conflict do nothing;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Migration notes:
-- 1. All tables are now Supabase-ready with pgcrypto UUIDs
-- 2. RLS policies enforce data access control
-- 3. Triggers automatically update timestamps
-- 4. Reference data (categories, areas) is pre-populated
-- 5. Use Supabase Dashboard or psql to run this script
-- ============================================================================
