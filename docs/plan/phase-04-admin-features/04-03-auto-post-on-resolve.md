# 04.3 Auto-post on resolve — system design + steps

## Goal

When admin marks a complaint as `RESOLVED`, automatically create a community post for transparency.

## Schema mapping

- Update: `complaints.status = RESOLVED`
- Insert: `complaint_actions`
- Insert: `community_posts`
  - `type = RESOLVED_COMPLAINT`
  - `content` should include a summary

## Backend behavior

When handling `POST /api/admin/complaints/{id}/status`:

- If new status is `RESOLVED`:
  - Create `community_posts` row
  - Suggested content template (v1):
    - Title: complaint title
    - Content: resolution comment + timestamps

Schema note (important)

- Current schema does not link a community post to a complaint via FK.
- For v1: embed the complaint id in content or title.
- Later: add `community_posts.complaint_id`.

## Frontend verification

- After resolving, open `/community` feed and confirm a new post exists with type `RESOLVED_COMPLAINT`.

## Acceptance criteria

- Resolving a complaint creates exactly one `community_posts` row
- Feed includes it
