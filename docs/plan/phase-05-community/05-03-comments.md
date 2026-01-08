# 05.3 Comments — system design + steps

## Goal

Allow authenticated users to comment on community posts.

## Schema mapping

- Insert: `comments` (`post_id`, `user_id`, `comment`)
- Read: `comments` by `post_id`

## Backend APIs

### `GET /api/community/posts/{id}/comments`

### `POST /api/community/posts/{id}/comments`

Request:

```json
{ "comment": "string" }
```

Auth

- Auth required for posting.

## Frontend

- On feed, click a post → `/community/{id}` (or inline later)
- Show comments + add comment box

## Acceptance criteria

- Comment appears after submit
