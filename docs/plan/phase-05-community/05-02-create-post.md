# 05.2 Create post — system design + steps

## Goal

Allow logged-in users to create normal community posts.

## Schema mapping

- Insert: `community_posts`
  - `user_id` (FK to users)
  - `type = USER_POST`
  - `title`, `content`, `media_urls`

## Backend API

### `POST /api/community/posts`

Request:

```json
{ "title": "string", "content": "string", "mediaUrls": ["string"] }
```

Response:

```json
{ "id": "uuid" }
```

Auth

- User must be authenticated (JWT/Supabase).

## Frontend

Route: `/community/new`

- Form: title, content, media URLs
- Submit then redirect to `/community`

## Acceptance criteria

- New post appears in feed
