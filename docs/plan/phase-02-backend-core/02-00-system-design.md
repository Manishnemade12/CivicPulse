# Backend System Design (Phase 02)

## Goal

Define backend architecture, API conventions, and how it maps to the database schema (`phase-01-database/01-schema.sql`).

## Assumptions

- Single Spring Boot application in `backend/api`
- Postgres is the source of truth
- Anonymous complaints are supported by `complaints.anonymous_user_hash` (no FK to `users`)

## Proposed module/package structure

- `com.zosh.config`
  - security config, CORS, jackson, etc.
- `com.zosh.common`
  - error model, request context, constants
- `com.zosh.db.*`
  - entities + repositories
- `com.zosh.feature.*`
  - feature slices (complaints, admin, community)

## Data mapping (tables → entities)

- `users` → `UserEntity`
- `areas` → `AreaEntity`
- `complaint_categories` → `ComplaintCategoryEntity`
- `complaints` → `ComplaintEntity`
- `complaint_actions` → `ComplaintActionEntity`
- `community_posts` → `CommunityPostEntity`
- `comments` → `CommentEntity`
- `post_likes` → `PostLikeEntity`

## API design principles

- Prefix all REST endpoints with `/api`
- Use JSON only
- Use UUIDs as identifiers
- Use explicit DTOs (never return JPA entities directly)

## Error format (standard)

Return a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable summary",
    "details": []
  }
}
```

## Authentication options (choose one)

### Option A (backend-issued JWT)

- Backend owns login/register
- Store `password_hash` in `users`
- Use JWT for auth; roles from `users.role`

### Option B (Supabase Auth)

- Supabase handles identity
- Backend validates Supabase JWT and maps to `users` record

Decision note: schema currently includes `users.password_hash`, so Option A is immediately aligned.
