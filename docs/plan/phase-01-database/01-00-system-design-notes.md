# Database System Design Notes (Phase 01)

## Goal

Define how the database supports the product behavior, based strictly on the schema in `01-schema.sql`.

## Source of truth

- Schema: `01-schema.sql`

## Key domain rules (as implemented by schema)

- Users have roles: `USER` / `ADMIN`
- Complaints are anonymous by design:
  - complaint stores `anonymous_user_hash`
  - complaint does **not** reference `users(id)`
- Admin actions are recorded in `complaint_actions`
- Community feed is backed by `community_posts`
  - `type` distinguishes normal posts vs auto-posted resolved complaints

## Known gaps / design TODOs (explicit)

- Anonymous user mapping strategy is not stored as a table (only `anonymous_user_hash` exists).
  - Decide: store hash purely client-side vs server-issued token.
- Complaint ↔ community post relationship is not explicit.
  - Decide later: add `complaint_id` column to `community_posts` OR embed complaint id in `content`.
- Updated timestamps:
  - `complaints.updated_at` exists but schema doesn’t define triggers.
  - Decide later: add trigger or manage in application layer.
