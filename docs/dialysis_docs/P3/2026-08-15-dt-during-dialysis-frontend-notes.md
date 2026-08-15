# During-Dialysis (Part 3) — Frontend Integration Notes

**Backend status:** [`2026-08-15-dt-during-dialysis-implementation-status.md`](./2026-08-15-dt-during-dialysis-implementation-status.md)  
**Base URL:** `/api/dt/...`  
**Auth:** every call needs `Authorization: Bearer <token>`

---

## What you must change

1. Wire **P3-01 → P3-10** to the endpoints below. Hub is **non-linear** — no step-gate between P3 screens; only P3-10 transitions session state.
2. Session must already be **started** (Part 2 `POST /sessions/:id/start` → `STARTED` / `RUNNING`).
3. **Do not** send post-dialysis vitals, disposition, or Kt/V on P3-10 — that is Part 4.
4. Offline encryption, left-rail nav, toasts/popups are **FE-only** — server returns data + `error_code` only.

---

## Role rules

| Action | Allowed |
|--------|---------|
| Most P3 reads/writes | Any Part 2 clinical role (Technician / Nurse / Nephrologist) |
| `POST .../end-treatment` | **Technician only** |

Wrong/missing role → `403 ERR_FORBIDDEN_ROLE`.

Technicians may only view **their own** overdue list (`GET /technicians/:id/overdue-vitals` where `:id` = JWT user).

---

## Consent mid-session (Part 3 upgrade)

| Situation | API behavior | FE should |
|-----------|--------------|-----------|
| Org/Kifayti consent revoked **while** session in progress | Part 3 APIs still succeed; dashboard may include `deferred_consent: true` | Do **not** kick user out mid-treatment; show deferred banner if useful |
| After successful P3-10 | Deferred Case A/B applied; later Part 2/4 access blocked or anonymized | Follow Part 2 consent rules on next open |
| New session start with org already revoked | Still blocked by Part 2 start gate | Same as Part 2 |

---

## Cross-cutting response shapes

Success: `{ success: true, data: {...}, message? }`  
Error: `{ success: false, error_code, message, details? }`

Adverse-event writes may include:

```json
{ "auto_incident_created": true, "incident_id": 123 }
```

Unresolved summary (dashboard + end-treatment):

```json
{
  "alarms": [ /* open */ ],
  "incidents": [ /* open/draft */ ],
  "symptoms": [ /* active */ ]
}
```

Use for amber banner only — server does **not** block end-treatment on unresolved items.

---

## Endpoints to wire

### P3-01 Dashboard
| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/dt/sessions/:id/dashboard` | `progress`, `uf`, latest machine, `unresolved`, `deferred_consent` |

### P3-02 Vitals + overdue
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/vitals-intradialytic` | Critical vital forces `notify_flag: true` in response |
| `GET` | `/api/dt/sessions/:id/vitals-intradialytic?range=2h` | |
| `GET` | `/api/dt/technicians/:id/overdue-vitals` | Due / overdue slots |
| `POST` | `/api/dt/overdue-vitals/:logId/skip` | Body: `{ reason? }` — permanent miss + nephrologist alert |
| `POST` | `/api/dt/overdue-vitals/skip-all` | `{ technician_id, log_ids[], reason? }` |

**Interval:** due every **30 min**. Overdue until **20 min** late → then server auto `Missed-Auto` (cron). Recording while overdue (before Missed-Auto) → `Recorded-Late` (no permanent skip alert).

### P3-03 Machine parameters
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/machine-parameters` | TMP flags: warn 61–299, critical ≥300 |
| `GET` | `/api/dt/sessions/:id/machine-parameters?range=2h` | Includes progress rollups |

### P3-04 Symptoms
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/symptoms` | Requires `symptom`, `severity`, `intervention` |
| `PATCH` | `/api/dt/sessions/:id/symptoms/:symptomId` | Status update |

Severe hypotension/syncope or fall → may return `auto_incident_created`.

### P3-05 Vascular access monitoring
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/vascular-access-monitoring` | Distinct from Part 2 `vascular-access` assessment |

Infiltration/extravasation / excessive bleeding / CVC complication tree → auto-incident.

### P3-06 Medications
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/medications` | Soft inventory deduct when SKU known |
| `GET` | `/api/dt/sessions/:id/medications/due` | From prescription + already given |
| `GET` | `/api/dt/patients/:id/allergies` | Read-only |

**Hard blocks:**

| Code | Meaning |
|------|---------|
| `ERR_MEDICATION_EXPIRED` | Expiry in the past |
| `ERR_ALLERGY_BLOCK` | Allergy match without `allergy_override.reason` |

Adverse reaction Yes → `auto_incident_created`.

### P3-07 Alarms
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/alarms` | **Action Taken** + **Resolution Status** required (`ERR_ALARM_ACTION_REQUIRED`) |
| `PATCH` | `/api/dt/sessions/:id/alarms/:alarmId` | Update resolution |

Unresolved or patient impact ≠ “No adverse effect” → auto-incident. Escalation contact FK when not Resolved (stub table).

### P3-08 Progress + events
| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/dt/sessions/:id/progress` | Elapsed / UF / blood volume; `kt_v` read-only or `"Not available"` |
| `POST` | `/api/dt/sessions/:id/events` | `{ event_type, ... }` → `treatment_event_log` |

### P3-09 Incidents
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/incidents` | Manual draft/report |
| `GET` | `/api/dt/sessions/:id/incidents` | List + overview counts |

### P3-10 End treatment (slim gate)
| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/dt/sessions/:id/end-treatment` | Technician; body: `confirmed: true` **or** `confirmed_by` |

Success:

```json
{
  "session_id": 1,
  "status": "terminating",
  "redirect_target": "P4-01",
  "unresolved": { "alarms": [], "incidents": [], "symptoms": [] }
}
```

Missing confirmation → `400 ERR_CONFIRMATION_REQUIRED`.

---

## Error codes (quick)

| Code | Typical cause |
|------|----------------|
| `ERR_FORBIDDEN_ROLE` | Wrong role / technician overdue peek |
| `ERR_CONFIRMATION_REQUIRED` | P3-10 checkbox not checked |
| `ERR_MEDICATION_EXPIRED` | Med expiry |
| `ERR_ALLERGY_BLOCK` | Allergy without override reason |
| `ERR_ALARM_ACTION_REQUIRED` | Alarm missing action/resolution |
| `ERR_INVALID_PARAMETERS` | Missing required fields |
| `NOT_FOUND` | Unknown session |
| Consent codes from Part 2 | After session end / non-deferred paths |

---

## Explicitly not backend

- Hub layout / screen chrome / monitoring interval UI picker (server defaults 30 min)  
- Toast / popup rendering  
- Offline encryption  
- Part 4 post-dialysis screens
