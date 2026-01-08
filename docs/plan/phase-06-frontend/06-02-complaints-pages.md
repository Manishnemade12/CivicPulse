# 06.2 Complaints pages (anonymous flow)

## Goal

Implement complaints UI in small verified steps matching Phase 03 docs and Phase 02 contracts.

## Pages

### 1) `/complaints/new`

Backend dependencies:

- `GET /api/areas`
- `GET /api/complaint-categories`
- `POST /api/complaints`

UI requirements (v1):

- Dropdown: area
- Dropdown: category
- Input: title
- Textarea: description
- Optional images input (comma-separated URLs)

Anonymous hash:

- Store in browser localStorage as `cp_anon_hash`
- On first load, if missing, generate one (v1)
- Always send `anonymousUserHash` in request body

Verification:

- Submit once → show returned complaint id
- DB check:
  - complaint row exists
  - status is `RAISED`

---

### 2) `/complaints/my`

Backend dependencies:

- `GET /api/complaints/my?anonymousUserHash=...`

UI requirements (v1):

- List: title, status, createdAt/updatedAt
- Each item links to `/complaints/my/[id]`

Verification:

- After creating a complaint, it appears in list.

---

### 3) `/complaints/my/[id]`

Backend dependencies:

- `GET /api/complaints/{id}?anonymousUserHash=...`

UI requirements (v1):

- Show: title, description, status, createdAt, updatedAt

Privacy verification:

- Wrong hash should not reveal existence (prefer 404).

## Docs links

- Phase 03.2: `../phase-03-user-features/03-02-raise-complaint.md`
- Phase 03.3: `../phase-03-user-features/03-03-my-complaints.md`
- Phase 03.4: `../phase-03-user-features/03-04-complaint-detail.md`
