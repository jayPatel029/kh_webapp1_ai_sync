# Pre-Dialysis (Part 2) — Frontend Integration Notes

**Backend status:** [`2026-07-26-dt-predialysis-implementation-status.md`](./2026-07-26-dt-predialysis-implementation-status.md)  
**Base URL:** `/api/dt/...`  
**Auth:** every call needs `Authorization: Bearer <token>`

---

## What you must change

1. **Use the new Part 2 APIs** for P2-01 → P2-12 (list below). Do not invent local-only flow for steps that the server now gates.
2. **Do not use** legacy `POST /api/dt/dialysis/sessions/start` for the new Start Dialysis screen — use `POST /api/dt/sessions/:id/start`.
3. **Do not use** legacy `POST /api/dt/dialysis/sessions/:id/pre-readings` for P2-05 — use `POST /api/dt/sessions/:id/vitals`.
4. **Send JWT** on every Part 2 request. Wrong/missing role → `403 ERR_FORBIDDEN_ROLE`.
5. **Handle hard blocks** (`409` / `401` / `423`) — disable Continue / Start when the API rejects; show `message` / `error_code`.

---

## Role rules (hide or disable in UI)

| Action | Allowed role |
|--------|----------------|
| Proceed to pre-dialysis | Technician only |
| Print summary | Nephrologist only |
| Start dialysis (PIN) | Technician only |
| Unlock after PIN lockout | Nurse or Nephrologist |
| Consent admin stubs / threshold PUT | Nephrologist only |

Accepted role strings include: `Dialysis Technician`, `technician`, `nurse`, `nephrologist`, `doctor`, `clinician`.

---

## Consent (org-scoped) — all P2 patient screens

Every patient GET/write is gated by the logged-in user's `users.organization_id`.

| Case | API behavior | FE should |
|------|----------------|-----------|
| User has no `organization_id` | `403 ERR_USER_ORG_MISSING` | Show account-setup error; do not retry the patient |
| Org consent **Revoked** (Case A) | `403 ERR_CONSENT_REVOKED` — patient **dropped from** `GET /sessions/today` | Show `message` (includes org name). Do not open P2-02–P2-12 |
| Kifayti consent **Revoked** (Case B) | `200` with `anonymized: true` and PII fields nulled (`name`, `photo`, `phone`, etc.). Clinical payloads (labs/vitals/prescription) stay | Render anonymized banner; keep clinical cards |
| Missing consent row | Treated as **Active** | Normal render |

Queue rows for Case B also include `patient_display_name: null` and `photo: null`.

---

## Endpoints to wire

### Queue / summary / dashboard
| Screen | Method | Path |
|--------|--------|------|
| P2-01 | `GET` | `/api/dt/sessions/today` |
| P2-01 | `POST` | `/api/dt/sessions/:id/mark-emergency` |
| P2-02 | `GET` | `/api/dt/patients/:id` |
| P2-02 | `GET` | `/api/dt/patients/:id/prescriptions/latest` |
| P2-02 | `GET` | `/api/dt/patients/:id/vitals/latest` |
| P2-02 | `GET` | `/api/dt/patients/:id/labs/latest` |
| P2-02 | `GET` | `/api/dt/patients/:id/alerts` |
| P2-02 | `GET` | `/api/dt/patients/:id/notes` |
| P2-02 | `POST` | `/api/dt/patients/:id/proceed-predialysis` |
| P2-03 | `GET` | `/api/dt/sessions/:id/predialysis-status` |
| P2-03 | `POST` | `/api/dt/sessions/:id/print-summary` |

### Entry / checks
| Screen | Method | Path |
|--------|--------|------|
| P2-04 | `POST` | `/api/dt/sessions/:id/verification` |
| P2-04 | `GET` | `/api/dt/patients/:id/dialyzer-status` |
| P2-04 | `POST` | `/api/dt/sessions/:id/consumables` |
| P2-05 | `POST` | `/api/dt/sessions/:id/vitals` |
| P2-06 | `POST` | `/api/dt/sessions/:id/assessment` |
| P2-07 | `POST` | `/api/dt/sessions/:id/vascular-access` |
| P2-08 | `GET` | `/api/dt/machines/:id/qc/today` |
| P2-08 | `GET` | `/api/dt/machines/:id/self-test/today` |
| P2-08 | `POST` | `/api/dt/sessions/:id/machine-safety/review` |
| P2-09 | `GET` | `/api/dt/ro-plants/:id/shift-check/current` |
| P2-09 | `GET` | `/api/dt/ro-plants/:id/verification/today` |
| P2-09 | `POST` | `/api/dt/sessions/:id/water-safety/review` |
| P2-10 | `POST` | `/api/dt/sessions/:id/infection-control` |
| P2-11 | `POST` | `/api/dt/sessions/:id/validate` |
| P2-12 | `POST` | `/api/dt/sessions/:id/start` |
| P2-12 | `POST` | `/api/dt/sessions/:id/start/unlock` |

### Clinical thresholds (facility settings; no dedicated UI screen yet)
| Who | Method | Path |
|-----|--------|------|
| Any Part 2 role | `GET` | `/api/dt/clinics/:clinicId/clinical-thresholds` |
| Nephrologist | `PUT` | `/api/dt/clinics/:clinicId/clinical-thresholds` |

### Admin stubs (ops/test until Registration owns consent lifecycle)
| Who | Method | Path |
|-----|--------|------|
| Nephrologist | `PUT` | `/api/dt/admin/patient-consent` |
| Nephrologist | `POST` | `/api/dt/admin/patient-consent/kifayti-revoke` |

### Logout
| When | Method | Path |
|------|--------|------|
| User logs out | `POST` | `/api/dt/predialysis/logout-digest` |

---

## Request patterns that matter

- **Draft vs final:** send `status: "draft"` or `"final"` on write screens (omit → treated as final).
- **Non-Critical skips:** when leaving optional fields blank, send  
  `skips: [{ "field_name": "...", "reason": "optional" }]`.
- **Start dialysis body:** `{ "attestation": true, "pin": "****", "machine_id": "..." }`.
- **Machine / water review:** pass `machine_id` / `ro_plant_id` (and `shift_id` when needed) in body or query.

---

## Sample request bodies (POST)

All POSTs: `Content-Type: application/json` + `Authorization: Bearer <token>`.

### `POST /api/dt/sessions/:id/mark-emergency`
```json
{}
```
(`:id` = dialysis **session** id)

### `POST /api/dt/patients/:id/proceed-predialysis`
```json
{}
```

### `POST /api/dt/sessions/:id/print-summary`
```json
{}
```

### `POST /api/dt/predialysis/logout-digest`
```json
{}
```

### `POST /api/dt/sessions/:id/verification`
```json
{
  "status": "final",
  "identity_matched": true,
  "identity_name_match": true,
  "identity_dob_match": true,
  "identity_pid_match": true,
  "identity_phone_match": true,
  "wristband_scan_result": "matched",
  "prescription_valid": true,
  "hiv_status": "Negative",
  "hepatitis_status": "Negative",
  "hiv_skipped": false,
  "hepatitis_skipped": false,
  "notes": "optional note max 200"
}
```
If HIV/Hep is Pending and user skips:
```json
{
  "status": "final",
  "identity_matched": true,
  "prescription_valid": true,
  "hiv_status": "Pending",
  "hepatitis_status": "Pending",
  "hiv_skipped": true,
  "hepatitis_skipped": true
}
```

### `POST /api/dt/sessions/:id/consumables`
```json
{
  "dialyzer_type": "MULTI_USE",
  "dialyzer_id": "DLZ-1001",
  "reuse_action": "none",
  "old_dialyzer_discard_confirmed": false,
  "tubing_set_qty": 1,
  "needles_qty": 2
}
```
`reuse_action` values: `"none"` | `"confirmed_new"` | `"overridden"`  
If `confirmed_new`, set `"old_dialyzer_discard_confirmed": true`.  
If `overridden`, include `"override_reason": "..."`.

### `POST /api/dt/sessions/:id/vitals`
```json
{
  "status": "final",
  "bp_systolic": 120,
  "bp_diastolic": 80,
  "pulse": 72,
  "temperature": 36.8,
  "spo2": 98,
  "weight_pre": 68.5,
  "edw": 66.0,
  "heparin_dose_units": 2000,
  "heparin_concentration": 5000,
  "saline_flush_ml": 100,
  "treatment_duration_hours": 4,
  "respiratory_rate": 16,
  "height_cm": 170,
  "pain_score": 0,
  "glucose": 110,
  "kt_v_assessment_flag": false,
  "notes": "",
  "skips": [
    { "field_name": "glucose", "reason": "meter unavailable" }
  ]
}
```
Critical required on final: `bp_systolic`, `bp_diastolic`, `pulse`, `temperature`, `spo2`, `weight_pre`, `edw`.  
Optional / skippable: `respiratory_rate`, `height_cm`, `pain_score`, `glucose`.

**Response extras:** `flags[]` (`field`, `severity: warning|critical`, `value`), `uf_rate_tier` (`null` | `"warning"` | `"critical"`).

Default bands (facility-overridable via thresholds API):
- Systolic: warning 90–100 / 160–180; critical `<90` / `>180`
- Diastolic: warning 50–55 / 100–110; critical `<50` / `>110`
- Pulse: warning 50–59 / 101–110; critical `<50` / `>110`
- Temp: warning 36.3–36.5 / 37.5–38; critical `<36.3` / `>38`
- SpO₂: warning 90–94; critical `<90`
- Respiration: warning 12–13 / 18–20; critical `<12` / `>20`
- UF rate: warning `≥10` mL/kg/hr (save allowed); critical `≥13` → `409 ERR_UF_RATE_CEILING`
- Other critical vitals on final → `409 ERR_VITAL_CRITICAL` (warning is amber, non-blocking)

### `GET /api/dt/clinics/:clinicId/clinical-thresholds`
Returns `{ clinic_id, thresholds }` merged with defaults.

### `PUT /api/dt/clinics/:clinicId/clinical-thresholds`
Nephrologist. Body = full or partial `thresholds` object (same shape as GET). Server merges with defaults.

### `PUT /api/dt/admin/patient-consent`
```json
{ "patient_id": 13, "organization_id": 7, "status": "Revoked" }
```
`status`: `"Active"` | `"Revoked"`.

### `POST /api/dt/admin/patient-consent/kifayti-revoke`
```json
{ "patient_id": 13 }
```
Irreversible PII wipe stub for Kifayti-level revoke (ops/test).

### `POST /api/dt/sessions/:id/assessment`
```json
{
  "status": "final",
  "section": "Subjective Assessment",
  "assessment": {
    "shortness_of_breath": "no",
    "chest_pain": "no",
    "bleeding_bruising": "no",
    "dizziness_giddiness": "no",
    "fever_chills": "no",
    "any_abnormal_finding": "no",
    "consciousness": "alert",
    "lung_sounds": "clear",
    "heart_sounds": "normal",
    "nausea_vomiting": "no",
    "cough": "no",
    "muscle_cramps": "no",
    "itching": "no",
    "headache": "no",
    "loss_of_appetite": "no",
    "general_appearance": "well",
    "edema": "none",
    "kps": "80"
  },
  "skips": [
    { "field_name": "itching", "reason": "" }
  ]
}
```
Critical fields must be present on final: `shortness_of_breath`, `chest_pain`, `bleeding_bruising`, `dizziness_giddiness`, `fever_chills`, `any_abnormal_finding`, `consciousness`, `lung_sounds`, `heart_sounds`.

A Critical **Yes** / `true` / `abnormal` also creates a **real-time** `dt_dialysis_alert` for the assigned nephrologist (not the daily digest). FE does not need a second call.

### `POST /api/dt/sessions/:id/vascular-access`
AVF example:
```json
{
  "status": "final",
  "access_type": "AVF",
  "thrill_bruit": "present",
  "access_site_appearance": "normal",
  "signs_of_infection": "no",
  "bleeding_discharge": "no",
  "aneurysm": "no",
  "cannulation_zone": "adequate",
  "access_flow_ml_min": 600,
  "additional_observations": "",
  "skips": []
}
```
CVC example:
```json
{
  "status": "final",
  "access_type": "CVC",
  "dressing_intact": "yes",
  "tenderness_pain": "no",
  "exit_site_clean": "yes",
  "cvc_signs_of_infection": "no",
  "catheter_patent": "yes",
  "additional_observations": ""
}
```
`access_type`: `"AVF"` | `"AVG"` | `"CVC"`.

### `POST /api/dt/sessions/:id/machine-safety/review`
```json
{
  "machine_id": "HD-01"
}
```

### `POST /api/dt/sessions/:id/water-safety/review`
```json
{
  "ro_plant_id": "RO-1",
  "shift_id": 1
}
```

### `POST /api/dt/sessions/:id/infection-control`
```json
{
  "status": "final",
  "access_type": "AVF",
  "items": {
    "hand_hygiene": true,
    "aseptic_technique": true,
    "sharps_handling": true,
    "ppe": true,
    "work_area_clean": true,
    "dialysis_machine_disinfected": true,
    "ro_system_disinfection": "not_applicable",
    "dialyzer_reuse": "not_applicable",
    "biomedical_waste": true,
    "isolation_precautions": "not_applicable"
  },
  "scrub_the_hub_result": null,
  "notes": "",
  "skips": []
}
```
For CVC, set `"access_type": "CVC"` and `"scrub_the_hub_result": "yes"` (or equivalent truthy).  
Critical on final: `hand_hygiene`, `aseptic_technique`, `sharps_handling` (+ scrub-the-hub when CVC).

### `POST /api/dt/sessions/:id/validate`
```json
{
  "notes": "optional"
}
```

### `POST /api/dt/sessions/:id/start`
```json
{
  "attestation": true,
  "pin": "1234",
  "machine_id": "HD-01"
}
```

### `POST /api/dt/sessions/:id/start/unlock`
```json
{
  "technician_user_id": 42,
  "unlock_reason": "PIN lockout cleared by nurse"
}
```

### Useful GET query examples
```http
GET /api/dt/sessions/today?shift=1&status=WAITING&bed=B-02&search=123&page=1&pageSize=20
GET /api/dt/ro-plants/RO-1/shift-check/current?shift_id=1
```

---

## Errors to handle in UI

| Code | Meaning |
|------|---------|
| `401` | No / bad token, or wrong PIN |
| `403` | Wrong role, missing user org (`ERR_USER_ORG_MISSING`), or org consent revoked (`ERR_CONSENT_REVOKED`) |
| `409` | Safety / validation hard block (`ERR_VITAL_CRITICAL`, `ERR_UF_RATE_CEILING`, identity, access, infection, machine, water, incomplete steps, etc.) |
| `423` | Start locked after 3 bad PINs — need Nurse/Nephrologist unlock |

Always show API `message` (and optional `details` / `flags`).

---

## Known backend gaps (don’t assume green)

- **Machine QC / Self-test / RO water** tables are often empty until Part 5 writers populate them → review APIs will **block**. Show “not passed / check now”, not all-clear.
- **PIN** must exist as `users.dt_pin_hash` on the technician (admin/backend setup). If missing, start will fail PIN check.
- Dashboard steps come from `GET .../predialysis-status` — only mark a step done after a successful **final** save / review / validate.
- Staff with no `users.organization_id` cannot open any patient Part 2 screen until org is assigned.
- Daily digest is **not** sent on a zero-skip day.

---

## Out of scope for FE from this backend drop

- No new Figma/layout requirements from this API work.
- Offline draft encryption stays on-device; server only stores draft/final payloads after sync.
- Thresholds/Alarm Settings **panel** is not designed — use GET/PUT APIs if an admin UI is added later.
- Permanent ABDM consent CRUD / anonymization job belongs to Registration; the `/dt/admin/patient-consent*` routes are test stubs.
