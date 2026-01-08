# 06.3 Community pages (feed + create + comments + likes)

## Goal

Implement community UI pages aligned to Phase 05 docs.

## Pages

### 1) `/community` (feed)

Backend dependency:

- `GET /api/community/feed`

UI requirements (v1):

- Render list of posts (title + type + createdAt)
- Each item links to `/community/[id]`

Verification:

- Feed renders real response.

---

### 2) `/community/new` (create post)

Backend dependency:

- `POST /api/community/posts`

Auth:

- Must be authenticated once auth is implemented.

UI requirements (v1):

- Form: title, content, optional mediaUrls
- On success redirect to `/community`

Verification:

- Created post appears in feed.

---

### 3) `/community/[id]` (post detail + comments + like)

Backend dependencies:

- `GET /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/like`
- `DELETE /api/community/posts/{id}/like`

UI requirements (v1):

- Show a “post header” (for v1 you can re-fetch feed and pick the post client-side, or add a post-detail endpoint later)
- Comments list + comment form
- Like/unlike button

Verification:

- Posting a comment shows it in list.
- Like toggles (even if count is not shown yet).

## Docs links

- Phase 05.1: `../phase-05-community/05-01-feed.md`
- Phase 05.2: `../phase-05-community/05-02-create-post.md`
- Phase 05.3: `../phase-05-community/05-03-comments.md`
- Phase 05.4: `../phase-05-community/05-04-likes.md`
