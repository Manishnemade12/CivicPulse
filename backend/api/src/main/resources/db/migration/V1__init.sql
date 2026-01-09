-- Flyway migration: initial CivicPulse schema

-- Enable UUID support (pgcrypto recommended for Supabase compatibility)
create extension if not exists "pgcrypto";

-- =========================
-- ENUM TYPES
-- =========================

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

-- =========================
-- USERS TABLE
-- =========================

create table users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  email varchar(150) unique not null,
  password_hash text not null,
  role user_role default 'USER',
  created_at timestamptz default now()
);

-- =========================
-- AREAS TABLE
-- =========================

create table areas (
  id uuid primary key default gen_random_uuid(),
  city varchar(100) not null,
  zone varchar(100),
  ward varchar(100),
  created_at timestamptz default now()
);

-- =========================
-- COMPLAINT CATEGORIES
-- =========================

create table complaint_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null
);

-- =========================
-- COMPLAINTS (ANONYMOUS)
-- =========================

create table complaints (
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

create index idx_complaints_area on complaints(area_id);
create index idx_complaints_status on complaints(status);
create index idx_complaints_user_hash on complaints(anonymous_user_hash);

-- =========================
-- COMPLAINT ACTIONS (ADMIN)
-- =========================

create table complaint_actions (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  admin_id uuid not null references users(id),
  action complaint_action_type not null,
  comment text,
  created_at timestamptz default now()
);

-- =========================
-- COMMUNITY POSTS
-- =========================

create table community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  type community_post_type not null,
  title varchar(200),
  content text not null,
  media_urls text[],
  created_at timestamptz default now()
);

create index idx_posts_type on community_posts(type);
create index idx_posts_user on community_posts(user_id);

-- =========================
-- COMMENTS
-- =========================

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references users(id),
  comment text not null,
  created_at timestamptz default now()
);

create index idx_comments_post on comments(post_id);

-- =========================
-- POST LIKES
-- =========================

create table post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references users(id),
  unique (post_id, user_id)
);
