# Bed & Dialysis Backend API Specification (Detailed)

**Scope:** Detailed backend API requirements for bed management, appointment details, dialysis session lifecycle, and dialysis readings (pre-dialysis, during-dialysis, post-dialysis). This document complements `docs/API_REFERENCE.md` and provides full schemas, validation guidance, events/streaming and test cases for backend implementers.

**Last Updated:** 2026-04-12

---

## 1. High-level principles

- Use ISO 8601 UTC timestamps everywhere (e.g., "2026-04-12T14:30:00Z").
- Request/response envelope: { success: boolean, data: any, error_code?: string, message?: string }
- All JSON fields use snake_case (existing project convention).
- Authentication: Bearer token in Authorization header. Support RBAC roles: admin, clinician, nurse, technician.
- Audit: every state-changing endpoint must record actor_id, actor_role, and timestamp in audit log.
- Ids: use stable string ids (UUIDv4 or project-standard ids like `bed-1`, `patient-123`).

---

## 1.1 Multi-center topology, shifts & staff mapping

This system supports multiple dialysis centers (sites). Each center contains wards/rooms and bed clusters. The attached dashboard diagram demonstrates two centers side-by-side with beds, quarantine beds, shift/role overlays (DT = dialysis technician; DOCTOR1/DOCTOR2 label placeholders). Backend must represent centers and resources and allow queries and actions scoped to a center or global.

Key concepts
- center: geographic/facility unit (e.g., "Dialysis Center 1") with id, name, timezone, address and contact.
- ward: named area inside a center (ICU, Ward-A).
- bed: belongs to a ward and center; may include zone/room metadata.
- shift: scheduled time window (e.g., morning/afternoon/evening) for staff coverage; shifts are scoped to a center.
- staff: workers (doctor, nurse, dialysis_technician (DT), technician) with certifications and allowed actions.
- staff_assignment: maps staff->center->shift->date-range and indicates on_duty status.
- transfer: patient transfer between beds, possibly across centers.

Data model additions / changes
- Beds now include: center_id (string), ward_id (string), room_number?: string, zone?: string.
- Appointments now include: center_id (string) and preferred_shift_id?: string.
- DialysisSession now include: center_id (string) and assigned_shift_id?: string.

New endpoints (summary)
- Centers & structure
  - GET /api/centers
  - POST /api/centers
  - GET /api/centers/:centerId
  - GET /api/centers/:centerId/beds
  - GET /api/centers/:centerId/appointments

- Shifts & staff
  - GET /api/shifts
  - POST /api/shifts
  - GET /api/shifts/:shiftId
  - GET /api/shifts?center_id={centerId}
  - POST /api/staff/:staffId/assign-shift  (body: { center_id, shift_id, start_date, end_date })
  - GET /api/staff/:staffId/schedule?start=&end=

- Transfers & cross-center actions
  - POST /api/beds/transfer
    - Body: { from_bed_id, to_bed_id, patient_id, requested_by, reason, requested_at }
    - Workflow: create transfer record (PENDING) → optionally require approval → complete transfer (atomic: unassign origin, assign destination, update appointment/session).

Transfer validation rules (server-side)
- Destination bed must exist and either be EMPTY or flagged as available for transfer.
- Quarantine/infectious rules apply across centers: infectious patients may only be placed into QUARANTINE beds; mixing in a quarantine bed is disallowed regardless of center.
- Inter-center transfers require clinician approval (configurable). Emergency override permitted by authorized roles with audit logging.
- Transfers must be atomic (transactional) to prevent double-assignment.

Staff & shift rules
- Only staff assigned to a center+shift may be marked on_duty for that shift.
- Staff may be assigned to multiple centers or cover shifts across centers; assignments should include start_date/end_date and on_duty toggles.
- Shift change events should emit `SHIFT_CHANGE` events for UIs and downstream systems.

Events (additional)
- CENTER_EVENT: center-scoped alerts (mass alarm, outage)
- SHIFT_CHANGE: staff on-duty changes
- BED_TRANSFER: transfer lifecycle events (requested, approved, completed, failed)

DB additions (suggested)
- centers(id, name, timezone, address, contact)
- wards(id, center_id, name)
- shifts(id, center_id, name, start_time, end_time, recurrence_rule)
- staff(id, name, role, credentials_json, active)
- staff_assignments(id, staff_id, center_id, shift_id, start_date, end_date, on_duty)
- bed_transfers(id, from_bed_id, to_bed_id, patient_id, requested_by, approved_by, status, reason, created_at, completed_at)

Example: transfer request
```json
POST /api/beds/transfer
{
  "from_bed_id": "bed-2",
  "to_bed_id": "bed-21",
  "patient_id": "patient-789",
  "requested_by": "user-45",
  "reason": "Capacity balancing / clinic move",
  "requested_at": "2026-04-12T09:30:00Z"
}
```

Test additions
- Transfer tests: successful intra-center transfer, successful inter-center transfer with approval, failed transfer for quarantine mismatch, failed transfer to occupied bed.
- Shift/assignment tests: assign staff to shift, staff schedule retrieval, SHIFT_CHANGE event emission.

UI guidance (diagram mapping)
- Dashboard UIs will display centers side-by-side with per-center bed grids and quarantine boxes. Staff overlays (DT, doctors) are visual annotations; backend provides endpoints to fetch staff on-duty per center/shift to drive the overlay.

Refer to attached diagram (dashboard view) for expected UI layout: two centers, each with beds and quarantine beds, staff role annotations and appointment rows. Do not infer any real-person identities from the diagram—labels are placeholders for role mappings.

---

## 2. Key data models (schemas)

Note: `required` indicates server-side required attributes for creating or starting operations.

### 2.1 Bed
{
  id: string,
  bed_number: string,         // user-facing identifier
  bed_type: "NORMAL"|"QUARANTINE",
  status: "EMPTY"|"OCCUPIED"|"MAINTENANCE",
  patient_id?: string|null,
  assigned_since?: string|null, // ISO timestamp
  quarantine_reason?: string|null,
  quarantine_until?: string|null, // ISO timestamp
  notes?: string
}


### 2.3 Appointment
{
  id: string,
  appointment_code?: string,
  patient_id: string,
  clinician_id?: string,
  scheduled_start: string,  // ISO
  scheduled_end?: string,   // ISO
  status: "SCHEDULED"|"CHECKIN"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED",
  type?: string, // e.g., "in-center-dialysis", "teleconsult"
  bed_id?: string|null,
  dialysis_session_id?: string|null,
}

### 2.4 DialysisParameters (planned)
{
  blood_flow_rate_ml_min: number,     // ml/min (typical 200-500)
  dialysate_flow_rate_ml_min?: number,// ml/min (recommended 500-800)
  session_duration_minutes: number,
  ultrafiltration_target_ml?: number, // total target removal
  target_dry_weight_kg?: number,
  heparin_dose_units?: number,
  dialyzer_id?: string,
  dialyzer_surface_m2?: number,
  dialysate_sodium_mmol_l?: number,
  dialysate_bicarbonate_mmol_l?: number,
  dialysate_calcium_mmol_l?: number,
  dialysate_potassium_mmol_l?: number,
  dialysate_temperature_c?: number,
  notes?: string
  <!-- JUST example   -->
}

### 2.5 DialysisSession
{
  id: string,
  appointment_id?: string|null,
  patient_id: string,
  bed_id: string,
  machine_id?: string,
  clinician_id?: string,
  state: "SCHEDULED"|"PRECHECK"|"RUNNING"|"PAUSED"|"COMPLETED"|"ABORTED"|"CANCELLED",
  planned_parameters: DialysisParameters,
  actual_parameters?: object,
  started_at?: string,
  ended_at?: string,
  total_ultrafiltration_ml?: number,
  notes?: string
}

### 2.6 DialysisReading (single sample)
{
  timestamp: string, // ISO
  blood_flow_rate_ml_min?: number,
  dialysate_flow_rate_ml_min?: number,
  arterial_pressure_mm_hg?: number,
  venous_pressure_mm_hg?: number,
  transmembrane_pressure_mm_hg?: number,
  ultrafiltration_rate_ml_hr?: number,
  cumulative_ultrafiltration_ml?: number,
  dialysate_temperature_c?: number,
  dialysate_conductivity_ms_cm?: number,
  sodium_mmol_l?: number,    // optional if measured
  heparin_rate_units_hr?: number,
  heart_rate_bpm?: number,
  systolic_bp_mm_hg?: number,
  diastolic_bp_mm_hg?: number,
  spo2_percent?: number,
  weight_kg?: number,
  machine_alarm_code?: string|null,
  note?: string
}

### 2.7 SessionEvent
{
  id: string,
  session_id: string,
  event_type: string, // e.g., "ALARM", "PARAM_UPDATE", "STATE_CHANGE", "PRECHECK_FAIL"
  timestamp: string,
  severity: "info"|"warning"|"critical",
  code?: string,
  message?: string,
  actor_id?: string,
  metadata?: object
}

---

## 3. Beds - API endpoints (expanded)

### 3.1 GET /api/beds/all
- Returns list of `Bed` objects.
- Response: { success: true, data: [Bed] }

### 3.2 GET /api/beds/status/:status
- :status = EMPTY|OCCUPIED|QUARANTINE|MAINTENANCE

### 3.3 GET /api/beds/:bedId
- Returns single `Bed` with current assignment and recent assignment history (optionally).

### 3.4 POST /api/beds/assign
- Purpose: assign a patient to a bed (UI drag-drop or manual).
- Body:
{
  bed_id: string,           // required
  patient_id: string,       // required
  assignment_notes?: string,
  actor_id?: string         // must be set from auth if not provided
}
- Server validation rules (must implement):
  - Bed must exist.
  - Bed.status must be EMPTY (or if OCCUPIED with a transfer request, handle via transfer flow).
  - Fetch patient.is_infectious (required). If true, bed.bed_type must be QUARANTINE.
  - If bed.bed_type == QUARANTINE and bed.patient_id != null: existing patient's is_infectious must equal new patient's is_infectious.
  - Only authorized roles may assign beds (nurse/clinician/admin).
- Success: update bed.patient_id, bed.status -> OCCUPIED, assigned_since -> now, create BedAssignment audit record.
- Error responses (examples):
  - 400 { success: false, error_code: "BED_OCCUPIED", message: "Bed is already occupied" }
  - 409 { success: false, error_code: "QUARANTINE_MISMATCH", message: "Cannot mix infectious and non-infectious patients in a quarantine bed" }

### 3.5 POST /api/beds/unassign
- Body: { bed_id: string, patient_id?: string, actor_id?: string }
- Unassign only if bed.patient_id matches provided patient_id (or if not provided, unassign current occupant).
- Update bed.status -> EMPTY, patient_id -> null, assigned_since -> null, log audit.

### 3.6 POST /api/beds/:bedId/quarantine
- Mark/unmark quarantine on a bed.
- Body:
{ quarantine_status: boolean, reason?: string, estimated_duration?: string, actor_id?: string }
- When setting quarantine_status=true: bed_type->QUARANTINE. When false: revert to previous bed_type (developer to decide default).
- Validation: avoid clearing quarantine if occupied by infectious patient mismatch.

### 3.7 PUT /api/beds/:bedId/status
- Update status or notes only.
- Body: { status?: string, notes?: string }

### 3.8 POST /api/beds/assignments/date-range
- Body: { start_date: ISO, end_date: ISO }
- Returns assignment events in range for reporting.

---

## 4. Appointments & appointment detail fetching

### 4.1 Core endpoints

- GET /api/appointments/:appointmentId
  - Returns Appointment with linked bed_id and dialysis_session_id (if scheduled)
  - Include nested patient summary and clinician summary when requested: ?include=patient,clinician

- GET /api/appointments?patient_id=&date=&status=&limit=&offset=

- POST /api/appointments
  - Create appointment. Body must include patient_id, scheduled_start, scheduled_end, type.

- PUT /api/appointments/:appointmentId
  - Update scheduling, bed_id, status.

- DELETE /api/appointments/:appointmentId
  - Cancel appointment (flag status CANCELLED). Record cancellation reason and actor.

### 4.2 Appointment detail fetching - extended
- GET /api/appointments/:id/details
  - Returns:
    - appointment metadata
    - patient summary (including is_infectious)
    - assigned bed summary
    - planned dialysis parameters (if in-center dialysis)
    - related dialysis_session (if exists) with latest session state and last reading timestamp
  - Use-case: dashboard shows appointment row with bed column, status and dialysis readiness indicator.

### 4.3 Appointment ↔ Bed assignment flows
- When assigning a bed from appointment page, call `POST /api/beds/assign` then update appointment.bed_id.
- Atomicity: backend should perform both update steps in a transaction (assign bed and set appointment.bed_id) or provide compensation on partial failure.

---

## 5. Dialysis sessions lifecycle & endpoints

### Session states
- SCHEDULED → PRECHECK → RUNNING → PAUSED → RUNNING → COMPLETED
- ABORTED/CANCELLED are terminal states.
- Only one RUNNING session per bed allowed; backend must enforce concurrency lock.

### 5.1 POST /api/dialysis/sessions/start
- Start new session or transition scheduled appointment to PRECHECK/RUNNING.
- Body:
{
  appointment_id?: string,
  patient_id: string,
  bed_id: string,
  clinician_id?: string,
  planned_parameters: DialysisParameters,
  actor_id?: string
}
- Validations:
  - bed must be assigned to patient or empty and then assigned as part of start.
  - patient.is_infectious checks vs bed.quarantine.
  - precheck required: if precheck fails, respond with 409 and details.

- Response on success: { success: true, data: DialysisSession }

### 5.2 POST /api/dialysis/sessions/:sessionId/pre-readings
- Purpose: record pre-dialysis vitals & labs.
- Body:
{
  session_id: string,
  patient_id: string,
  weight_kg: number,
  systolic_bp_mm_hg: number,
  diastolic_bp_mm_hg: number,
  heart_rate_bpm?: number,
  temperature_c?: number,
  spo2_percent?: number,
  labs?: { potassium_mmol_l?: number, sodium_mmol_l?: number, bicarbonate_mmol_l?: number, hemoglobin_g_dl?: number },
  access_assessment: { type: string, site_ok: boolean, clot_present?: boolean },
  notes?: string,
  actor_id?: string
}
- Server returns a set of precheck flags. If critical values present (e.g., K > threshold), return precheck_fail=true with guidance.

### 5.3 POST /api/dialysis/sessions/:sessionId/readings (ingest during-dialysis readings)
- Accepts a single reading or an array of readings.
- Body either { reading: DialysisReading } or { readings: [DialysisReading, ...] }
- Recommended: support batching for performance (e.g., send every 30s–1min or device-forwarding every 5s depending on device).
- Server responsibilities:
  - Validate session state == RUNNING or record even if PAUSED for audit.
  - Persist readings with timestamp and compute aggregates (e.g., cumulative UF).
  - Emit realtime events to subscribers (SSE/WS) for UI updates and alarms.
- Example success: { success: true, data: { saved: 10 } }

### 5.4 GET /api/dialysis/sessions/:sessionId/readings
- Query params: ?start=ISO&end=ISO&interval=string (e.g., "1m")
- Return list of readings and optionally pre-aggregated time-series for charting.

### 5.5 PATCH /api/dialysis/sessions/:sessionId/parameters
- Update planned/actual parameters mid-session.
- Body: partial DialysisParameters update + actor_id.
- Must log parameter change event and who made it.

### 5.6 POST /api/dialysis/sessions/:sessionId/actions
- Body: { action: "pause"|"resume"|"stop"|"abort", reason?: string, actor_id?: string }
- Requires authorization and will update session.state accordingly.

### 5.7 GET /api/dialysis/sessions/:sessionId
- Returns full session object with recent readings summary and events.

---

## 6. Pre-dialysis (Before) vs During-dialysis (During) - requirements

### 6.1 Pre-dialysis (Before) - what to collect and why
- Purpose: ensure patient safety and machine setup before starting.
- Required fields (min): weight_kg, systolic_bp_mm_hg, diastolic_bp_mm_hg, access_assessment, labs.k (if available), is_infectious status confirmation.
- Optional helpful fields: temperature_c, heart_rate_bpm, spo2_percent, interdialytic_weight_gain_kg, last_dialysis_summary.

Validation rules (examples):
- If potassium > 6.0 mmol/L: flag for clinician review; may delay start.
- If systolic_bp < 90 mmHg: require clinician override.
- If access_assessment.site_ok == false: require vascular access intervention.

Endpoint: `POST /api/dialysis/sessions/:sessionId/pre-readings`
- Response should include `precheck_result` object: { passed: boolean, warnings: [string], critical: [string] }

### 6.2 During-dialysis (Readings & parameters)
- Reading cadence: configurable. Devices may push every 5–60s; manual nurse entries may be every 15–30 min.
- Minimum recommended readings to store per sample:
  - timestamp
  - blood_flow_rate_ml_min
  - arterial_pressure_mm_hg
  - venous_pressure_mm_hg
  - ultrafiltration_rate_ml_hr
  - cumulative_ultrafiltration_ml
  - systolic/diastolic_bp_mm_hg
  - heart_rate_bpm
  - machine_alarm_code (if any)

- Alarms: if a reading breaches a configured safety threshold, backend should emit an `ALARM` SessionEvent to subscribers and optionally store an Escalation record.

- Units: clearly document units in API docs. Backend stores numeric values and the unit type is fixed by field name.

---

## 7. Real-time streaming & events

Two recommended patterns:

1) WebSocket or authenticated SSE for live UI updates:
- Endpoint: `GET /api/dialysis/sessions/:sessionId/stream` (SSE) or WS at `/ws/dialysis` with subscription message { action: "subscribe", session_id }
- Events:
  - `reading` { session_id, reading }
  - `event` { session_id, event }
  - `parameter_update` { session_id, parameter_change }
  - `state_change` { session_id, old_state, new_state }

2) Webhook notifications for external systems (EHR):
- Event types: SESSION_STARTED, READING_BATCH, SESSION_COMPLETED, BED_ASSIGNED
- Provide signing/secret for webhooks; include idempotency token for event processing.

Backend must support replay (e.g., supply last N readings on reconnect) and provide watermark/timestamps for resuming.

---

## 8. Validation rules, errors & codes

Common error codes and examples:
- ERR_BED_NOT_FOUND (404)
- ERR_BED_OCCUPIED (409)
- ERR_INFECTIOUS_QUARANTINE_MISMATCH (409)
- ERR_PATIENT_NOT_FOUND (404)
- ERR_SESSION_NOT_FOUND (404)
- ERR_PRECHECK_FAILED (409)
- ERR_PERMISSION_DENIED (403)
- ERR_INVALID_PARAMETERS (400)

Each error response should include `error_code` and a human `message` and optionally `details` with validation fields.

Example:
HTTP 409
{ "success": false, "error_code": "ERR_INFECTIOUS_QUARANTINE_MISMATCH", "message": "Cannot assign infectious patient to normal bed", "details": { "patient_id": "patient-123", "bed_id": "bed-1" } }

---

## 9. Authentication, RBAC & Audit logging

- Authentication: OAuth2 / JWT Bearer tokens.
- Roles & endpoint permissions (example):
  - assign/unassign bed: nurse, clinician, admin
  - start/stop session: clinician, technician (depending on policy)
  - update parameters: clinician, technician (logged)
  - edit bed core info: admin
- Audit entries: actor_id, actor_role, action, resource_id, before/after snapshots (for sensitive changes), timestamp.

---

## 10. Database suggestions (tables / essential columns)

- beds(id, bed_number, ward, bed_type, status, patient_id, assigned_since, quarantine_reason, quarantine_until, notes)
- patients(id, name, patient_code, is_infectious, dob, weight_kg, height_cm, created_at)
- appointments(id, patient_id, clinician_id, scheduled_start, scheduled_end, status, bed_id, dialysis_session_id, created_at)
- dialysis_sessions(id, appointment_id, patient_id, bed_id, state, planned_parameters_json, started_at, ended_at, total_uf_ml)
- dialysis_readings(id, session_id, timestamp, reading_json) // normalize certain columns for index/search
- session_events(id, session_id, event_type, code, message, metadata_json, actor_id, created_at)
- bed_assignments(id, bed_id, patient_id, assigned_at, unassigned_at, actor_id, notes)
- audit_logs(id, actor_id, action, resource_type, resource_id, previous_json, new_json, created_at)

Indexes: sessions by bed_id and state, readings by session_id+timestamp, assignments by bed_id, audit_logs by resource_id.

---

## 11. Example requests (axios)

Assign bed (example):

```javascript
const res = await axios.post('/api/beds/assign', {
  bed_id: 'bed-2',
  patient_id: 'patient-789',
  assignment_notes: 'Assigned from dashboard'
}, { headers: { Authorization: `Bearer ${token}` } });

if (!res.data.success) throw new Error(res.data.message);
```

Start session (example):

```javascript
const res = await axios.post('/api/dialysis/sessions/start', {
  appointment_id: 'appt-123',
  patient_id: 'patient-789',
  bed_id: 'bed-2',
  clinician_id: 'user-45',
  planned_parameters: {
    blood_flow_rate_ml_min: 300,
    session_duration_minutes: 240,
    ultrafiltration_target_ml: 2000
  }
}, { headers: { Authorization: `Bearer ${token}` } });
```

Send readings (batch):

```javascript
const readings = [ { timestamp: new Date().toISOString(), blood_flow_rate_ml_min: 300, systolic_bp_mm_hg: 120, diastolic_bp_mm_hg: 70 }, ... ];
const res = await axios.post('/api/dialysis/sessions/sess-1/readings', { readings }, { headers: { Authorization: `Bearer ${token}` } });
```

---

## 12. Test cases to implement on backend

- Bed assignment tests:
  - Assign non-infectious patient to NORMAL bed (success)
  - Assign infectious patient to NORMAL bed (fail)
  - Assign infectious patient to QUARANTINE bed (success)
  - Assign patient to occupied bed (fail)
- Appointment detail tests:
  - Fetch appointment with nested patient and dialysis plan
- Dialysis session tests:
  - Start session with valid pre-readings (success)
  - Start session when precheck fails (fail with ERR_PRECHECK_FAILED)
  - Ingest reading batch and validate cumulative UF calculation
  - Pause/resume/stop transitions and permission checks
- Realtime tests:
  - Subscribe to stream and receive reading events
  - Webhook delivery & signature verification

---

## 13. Operational considerations

- Backfill: allow bulk import of historical readings with `source_system` and `imported_at` metadata.
- Retention: high-frequency readings may be archived. Provide pre-aggregated hourly summaries for long-term charts.
- Throttling: limit per-session reading ingestion to a reasonable rate or require batching.
- Monitoring: track late/missing readings per session and generate alerts.
- Security: redact PHI in logs when necessary. Restrict webhook payloads and sign them.

---

## 14. Quick reference (endpoints summary)

- Beds: GET /api/beds/all, GET /api/beds/status/:status, GET /api/beds/:id, POST /api/beds/assign, POST /api/beds/unassign, POST /api/beds/:id/quarantine, PUT /api/beds/:id/status
- Appointments: GET /api/appointments/:id, GET /api/appointments, POST /api/appointments, PUT /api/appointments/:id, GET /api/appointments/:id/details
- Dialysis sessions: POST /api/dialysis/sessions/start, POST /api/dialysis/sessions/:id/pre-readings, POST /api/dialysis/sessions/:id/readings, GET /api/dialysis/sessions/:id/readings, PATCH /api/dialysis/sessions/:id/parameters, POST /api/dialysis/sessions/:id/actions, GET /api/dialysis/sessions/:id, GET /api/dialysis/sessions/:id/stream (SSE)

---

## 15. Next steps for backend implementers

1. Implement core DB tables and migrations for sessions and readings.
2. Implement bed assignment APIs with the quarantine validation logic.
3. Implement dialysis session lifecycle with precheck step and reading ingestion.
4. Implement streaming endpoint and webhook support.
5. Add unit/integration tests per section 12.

---

If you want, I can also:
- generate OpenAPI/Swagger spec from these schemas,
- add Postman/Insomnia collection examples,
- scaffold backend endpoint stubs in Node/Express for quick integration.

(Produced file: `docs/BED_AND_DIALYSIS_API_SPEC.md`)
