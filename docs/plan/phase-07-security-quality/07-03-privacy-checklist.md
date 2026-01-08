# 07.3 Privacy checklist (anonymous complaints)

## Goal

Guarantee that complaint flows never expose user identity.

## Must be true

- Complaints table does NOT reference `users`
- Admin APIs do not return `anonymous_user_hash`
- “My complaints” endpoints require the correct anonymous hash
- Wrong hash returns 404 (preferred) or 403

## Manual tests

- Create complaint with hash A
- Call my-complaints with hash B → returns empty list
- Call complaint detail with hash B → 404

## Acceptance criteria

- No endpoint response contains email/name for complaint workflows
