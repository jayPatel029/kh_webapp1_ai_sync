# Post-Dialysis (Part 4) — Frontend Integration Notes

**Base URL:** `/api/dt/...`  
**Auth:** `Authorization: Bearer <token>`  
**Prerequisite:** Session must be `TERMINATING` (after Part 3 `POST .../end-treatment`).

Offline encryption / PIN sign-off UX are **FE-only**. Server accepts authenticated signoff payloads.

---

## Consent (Part 4 upgrade)

Deferred org/Kifayti revocation stays open through **P4-10 close**. Do not kick users mid P4-01–P4-09. After `POST .../close`, Part 2 consent rules apply again.

---

## Physician notification

Writes may return `physician_notification_contributed: true`.  
Critical items send immediately; Important/Notable batch on `POST .../notify-physician/send` or session close.

---

## Endpoints

| Screen | Method | Path |
|--------|--------|------|
| P4-01 | `POST` | `/sessions/:id/terminate` |
| P4-02 | `POST` | `/sessions/:id/hemostasis` |
| P4-03 | `POST` | `/sessions/:id/post-vitals` |
| P4-04 | `GET` | `/sessions/:id/outcome` |
| P4-04 | `POST` | `/sessions/:id/kt-v` |
| P4-04 | `POST` | `/sessions/:id/outcome` |
| P4-05 | `GET` | `/sessions/:id/medications` |
| P4-05 | `POST` | `/sessions/:id/followup` |
| P4-06 | `POST` | `/machines/:id/cleaning` |
| P4-06 | `GET` | `/machines/:id/readiness-summary` |
| P4-07 | `POST` | `/sessions/:id/infection-control-post` |
| P4-08 | `GET` | `/sessions/:id/discharge-readiness` |
| P4-08 | `POST` | `/sessions/:id/discharge` |
| P4-09 | `POST` | `/sessions/:id/documentation` |
| P4-09 | `POST` | `/sessions/:id/signoff` |
| P4-09 | `POST` | `/sessions/:id/notify-physician/send` |
| P4-10 | `GET` | `/sessions/:id/complete-summary` |
| P4-10 | `POST` | `/sessions/:id/patient-feedback` |
| P4-10 | `POST` | `/sessions/:id/close` (Technician) |

---

## Hard blocks / key rules

| Code | Meaning |
|------|---------|
| `ERR_SESSION_NOT_POST_DIALYSIS` | Need P3-10 first |
| `ERR_SESSION_CLOSED` | Already closed |
| `ERR_EARLY_TERMINATION_FIELDS` | Early terminate missing reason/time |
| `ERR_PRE_BUN_MISSING` | Cannot run Kt/V without pre-BUN |
| `ERR_DISCHARGE_NOT_READY` | P4-08 blocked until P4-03 Ready |
| `ERR_ADEQUACY_INPUTS` | Bad Kt/V inputs |

**P4-03** returns `discharge_readiness` — P4-08/P4-10 read it; do not re-collect vitals there.  
**P4-04** `GET outcome` includes `kt_v_assessment_available` — hide Calculate when false.  
**P4-09** call `signoff` once per role (`technician` / `nurse` / `physician`); third success sets `close_checklist_complete`.  
**P4-10** `close` → `CLOSED`, applies deferred consent, redirect to queue.

Success shape: `{ success: true, data }`. Error: `{ success: false, error_code, message }`.
