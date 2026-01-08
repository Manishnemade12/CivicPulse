# 05.4 Likes — system design + steps

## Goal

Allow authenticated users to like/unlike a post.

## Schema mapping

- Insert/delete: `post_likes`
  - unique constraint `(post_id, user_id)` prevents duplicates

## Backend APIs

### `POST /api/community/posts/{id}/like`

### `DELETE /api/community/posts/{id}/like`

Auth

- Auth required.

Frontend

- Like button + count (count can be added later; v1 can just toggle)

## Acceptance criteria

- Like toggles without duplicates
