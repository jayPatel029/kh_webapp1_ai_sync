## Plan: Dialysis module — implementable actions (Apr 25–27 session)

TL;DR
Extracted a prioritized, actionable set of tasks from the meeting notes so engineering, QA, product, and DevOps can execute. This plan is saved as `/memories/session/plan.md`.

**Steps**
1. Finalize database schema changes (high priority)
   - Update definitive SQL schema (`kh_schema_26-04-22.sql`) to remove legacy, non-prefixed tables while retaining `dialysis_readings`.
   - Add/verify columns on `dialysis_sessions`: make `appointment_id` the PK/FK to `tele_appointments.id`; add `pre_dialysis_notes`, `during_dialysis_notes`, `post_dialysis_notes`, `checklist_json`, `inventory_items_json` (JSON/JSONB depending on DB).
   - Deliverable: updated SQL file + migration script + schema change PR.

2. Backend controller and model changes (high priority)
   - Implement `dialysis_sessions` model changes in `models/tables.js` (or equivalent). Ensure `appointment_id` is used as unique identifier; adjust any insert/update logic.
   - Update `Dialysis.js` controller: use `appointment_id` as identifier (remove separate dialysis id), update `extractInsertedId` logic, enforce `assignBed` to allow only `WAITING` status, update `startSession` validations and messages.
   - Ensure `updateParameters` and `startSession` endpoints accept both snake_case and camelCase.
   - Deliverable: PR for `tables.js` & `Dialysis.js` with tests.

3. Tests & verification (high priority)
   - Finalize and publish `scratch/test_dialysis_sessions.js` (or `test_dialysis_sessions.js`) for QA; add automated integration tests that verify: session creation by `appointment_id`, JSON notes storage, checklist persistence, inventory recording, `assignBed`/`startSession` status rules.
   - Run and iterate until API tests pass and the `maria.item` missing-table error is resolved.

4. Deployment & staging validation (blocker until DB is synced)
   - Coordinate with DevOps: backup DB, apply schema migration in staging, deploy backend changes, run full API test-suite.
   - Deliverable: staging verification report; schedule production deployment window.

5. Frontend changes (medium priority)
   - Appointment UI (`/dialysis/appointments`): remove the `Treatment Duration` field from the create page; prompt clinic for default duration; auto-generate slots based on default.
   - Edit Appointment: allow adding more slots; fix slot-fetching bug in edit flow.
   - Billing PDF: add bill date; format patient details correctly; hide end time and duration when duration == 0; remove discount column when discount == 0%.
   - Guidelines & Checklists: add CSV import/export support for org-level guidelines and checklists.
   - Doctor role creation form: update the `Practicing At` flow to map → `Org` and then `Institute/Hospital/Clinic` → `Clinic`.
   - Deliverable: frontend PR(s) with UI screenshots and QA steps.

6. Documentation & communication (medium priority)
   - Convert Excalidraw whiteboard into an authoritative markdown doc (e.g., `DIALYSIS_SESSION_WORKFLOW.md`) covering Pre/During/Post phases, checklists, readings cadence, heparin rules, inventory tracking.
   - Publish a brief technical note that explains the `dialysis_sessions` data model changes and the `assignBed`/`startSession` contract for frontend and QA.

7. Dashboards & UX refinement (low/ongoing)
   - Schedule a short design session (Product + Frontend + UX) to refine the Technician, Manager, and Front Desk dashboards based on backend capabilities.

**Relevant files (where to change)**
- `hims-backend/models/tables.js` — update dialysis table definition and JSON fields (backend repo).
- `hims-backend/controllers/Dialysis.js` — apply session logic changes, `assignBed`/`startSession` (backend repo).
- `hims-backend/kh_schema_26-04-22.sql` — update definitive SQL schema (backend repo).
- `hims-backend/scratch/test_dialysis_sessions.js` — publish & extend for QA (backend repo).
- `src/pages/dialysis/appointments` — (frontend) remove treatment duration, default duration flow, slot UI.
- `src/components/billing/*` or wherever Bill PDF is generated — add bill date/formatting rules.
- `docs/DIALYSIS_MODAL_IMPLEMENTATION.md` (or new `docs/DIALYSIS_SESSION_WORKFLOW.md`) — formalize whiteboard.

**Verification**
1. Backend unit & integration tests pass; `scratch/test_dialysis_sessions.js` reproduces positive scenarios.
2. Staging deployment with schema migration applied; API tests pass and no "Table 'maria.item' doesn't exist" errors.
3. Frontend flows: appointment create/edit, slot management, and bill PDF generation validated by QA.
4. Documentation published and shared with frontend & QA.

**Decisions (recorded from meeting)**
- `dialysis_sessions` is identified by `appointment_id` (PK and FK to `tele_appointments.id`).
- Notes fields use JSON/JSONB for structured Q&A storage.
- `assignBed` should accept only `WAITING` appointments; `startSession` supports `WAITING`→active transition.

**Further considerations / risks**
1. DB engine differences: JSONB is Postgres-specific; for MySQL use `JSON`. Ensure migrations are compatible with the target DB.
2. Migration safety: must backup DB before removing legacy tables; some existing data may need migration/archival.
3. Frontend/back-end contract: share a swagger or short spec of JSON shapes for the notes/checklist to avoid mismatches.

---

## Extracted actionable todo list (status for each)
- [ ] Finalize & commit SQL schema changes (`kh_schema_26-04-22.sql`) — Owner: Backend / Himanshu — Status: Open (needs review by Jay Patel)
- [ ] Update `models/tables.js` to reflect `dialysis_sessions` structure — Owner: Backend / Himanshu — Status: Open (PR required)
- [ ] Update `controllers/Dialysis.js` (`assignBed`, `startSession`, identifier change) — Owner: Backend / Himanshu — Status: Open (review: Ashutosh)
- [ ] Publish & hand off `scratch/test_dialysis_sessions.js` to QA with run instructions — Owner: Backend / QA — Status: Open
- [ ] Coordinate staging deploy & run API tests (resolve `maria.item` errors) — Owner: DevOps — Status: Blocked (awaits schema PR)
- [ ] Remove `Treatment Duration` from Appointment page; implement default duration/slot creation — Owner: Frontend — Status: Open (ask clinic for default)
- [ ] Fix Edit Appointment slots fetching and allow adding slots — Owner: Frontend — Status: Open
- [ ] Bill PDF fixes (date, patient formatting, hide duration/end-time when 0, hide discount column when 0%) — Owner: Frontend/Billing — Status: Open
- [ ] Add CSV support for Guidelines & Checklists import/export — Owner: Frontend (+ backend if import needed) — Status: Open
- [ ] Update Doctor role creation form mapping — Owner: Frontend — Status: Open
- [ ] Convert Excalidraw workflow to `docs/DIALYSIS_SESSION_WORKFLOW.md` and circulate — Owner: Product/Tech Writer — Status: Open
- [ ] Schedule dashboard requirements session (Technician/Manager/Front Desk) — Owner: Product/Design — Status: Open

If you want, I can: 1) convert this plan into JIRA/GitHub issues with assignees and estimates; 2) reopen a repo scan to list exact frontend file paths to edit; or 3) draft the DB migration script template.

(Plan saved to `/memories/session/plan.md`.)