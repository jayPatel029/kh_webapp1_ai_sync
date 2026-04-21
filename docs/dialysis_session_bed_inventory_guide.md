# Dialysis Sessions, Bed Management & Inventory Integration Guide

> **Scope**: This guide covers three tightly coupled modules — **Dialysis Sessions**, **Bed Management**, and **Inventory** — and explains exactly how they interact. All routes are under the `/api/dt/` prefix.

---

## 1. Module Relationship Overview

```
Appointment (tele_appointments)
       │
       │ appointment_id (optional link)
       ▼
Dialysis Session (dialysis_sessions)
   │          │
   │          │ bed_id
   │          ▼
   │       Bed (dt_dialysis_bed)
   │
   │ source_dialysis_appointment_id
   ▼
Inventory Transaction (dt_inventory_transaction)
       │
       ▼
Stock (dt_stock) ←→ Batch (dt_batch) ←→ Item (dt_item)
```

**Key linkage field**: When issuing inventory during or after a session, pass `reference_id = appointment_id` or `source_dialysis_appointment_id = appointment_id`. This creates an audit trail tying stock consumption to the exact patient appointment.

---

## 2. Dialysis Session Lifecycle

### 2.1 Start a Session
**POST** `/api/dt/dialysis/sessions/start`

> **Frontend helper**: `startDialysisSession(payload)` in `src/ApiCalls/dialysisSessionApis.js`

**Request Body:**
```json
{
  "patient_id": 42,
  "bed_id": 10,
  "appointment_id": 123
}
```

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `patient_id` | number | ✅ | Must exist in `tele_patient` table |
| `bed_id` | number | ✅ | Must exist in `dt_dialysis_bed` table |
| `appointment_id` | number | ❌ | Links session to a booked appointment |

**Success Response `200`:**
```json
{
  "success": true,
  "session_id": 1122,
  "message": "Session started successfully"
}
```

---

### 2.2 Submit Pre-Dialysis Readings
**POST** `/api/dt/dialysis/sessions/:sessionId/pre-readings`

> **Frontend helper**: `submitSessionPreReadings(sessionId, payload)`

**Request Body:**
```json
{
  "weight_kg": 72.5,
  "systolic_bp_mm_hg": 140,
  "diastolic_bp_mm_hg": 90,
  "labs": { "hemoglobin": 10.2, "creatinine": 8.5 },
  "access_assessment": "AV fistula - good thrill and bruit",
  "notes": "Patient reports mild fatigue"
}
```

**Backend behavior**: Updates `dialysis_sessions.pre_weight` and `dialysis_sessions.pre_bp` (stored as `"140/90"` string).

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Pre-readings updated successfully"
}
```

---

### 2.3 Ingest Real-Time Readings (During Session)
**POST** `/api/dt/dialysis/sessions/:sessionId/readings`

> **Frontend helper**: `submitSessionReadings(sessionId, payload)`

**Single Reading:**
```json
{
  "timestamp": "2024-04-22T09:45:00Z",
  "reading": {
    "blood_flow_rate_ml_min": 300,
    "dialysate_flow_rate_ml_min": 500,
    "arterial_pressure_mmhg": -120,
    "venous_pressure_mmhg": 140,
    "transmembrane_pressure_mmhg": 200,
    "temperature_c": 36.5,
    "conductivity_ms_cm": 14.2,
    "ultrafiltration_rate_ml_hr": 1200,
    "ultrafiltration_volume_ml": 800
  }
}
```

**Bulk Readings (more efficient):**
```json
{
  "readings": [
    { "timestamp": "2024-04-22T09:45:00Z", "blood_flow_rate_ml_min": 300 },
    { "timestamp": "2024-04-22T10:00:00Z", "blood_flow_rate_ml_min": 305 }
  ]
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "reading_id": 5001,
  "message": "Readings ingested successfully"
}
```

---

### 2.4 Fetch Session Readings
**GET** `/api/dt/dialysis/sessions/:sessionId/readings`

> **Frontend helper**: `getSessionReadings(sessionId)`

**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5001,
      "session_id": 1122,
      "timestamp": "2024-04-22T09:45:00Z",
      "reading_json": { "blood_flow_rate_ml_min": 300, "..." : "..." }
    }
  ]
}
```

---

### 2.5 Update Session Parameters (Planned)
**PATCH** `/api/dt/dialysis/sessions/:sessionId/parameters`

> **Frontend helper**: `updateSessionParameters(sessionId, payload)`

```json
{
  "parameters": {
    "target_uf_volume_ml": 2000,
    "session_duration_hours": 4,
    "blood_flow_rate_ml_min": 300
  }
}
```

---

### 2.6 Session Lifecycle Control
**POST** `/api/dt/dialysis/sessions/:sessionId/actions`

> **Frontend helper**: `submitSessionAction(sessionId, payload)`

**Valid Actions:**
```json
{ "action": "pause",  "reason": "Needle repositioning" }
{ "action": "resume" }
{ "action": "stop",   "reason": "Session completed normally" }
{ "action": "abort",  "reason": "Patient requested early termination" }
```

| Action | Resulting State |
| :--- | :--- |
| `pause` | `PAUSED` |
| `resume` | `RUNNING` |
| `stop` | `COMPLETED` |
| `abort` | `ABORTED` |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Session status updated",
  "state": "COMPLETED"
}
```

---

## 3. Bed Management

### 3.1 Bed Data Model

```
dt_dialysis_bed:
  id, clinic_id, status (EMPTY|OCCUPIED|MAINTENANCE|QUARANTINE),
  patient_id (FK → tele_patient),
  bed_type (NORMAL|QUARANTINE), is_quarantine (0|1),
  quarantine_reason, quarantine_until,
  assigned_since
```

> **CRITICAL BUSINESS RULE**: Infectious patients (`is_infectious = 1` in `tele_patient`) **must** be assigned to QUARANTINE beds. Non-infectious patients **cannot** be assigned to QUARANTINE beds. This is enforced both on `assignBed` and `transferBed`.

---

### 3.2 Bed Endpoints

| Operation | Method | Endpoint | Frontend Helper |
| :--- | :--- | :--- | :--- |
| Get All Beds | `GET` | `/dt/beds/all` | `getAllBeds()` |
| Filter by Status | `GET` | `/dt/beds/status/:status` | `getBedsByStatus(status)` |
| Get Single Bed | `GET` | `/dt/beds/:bedId` | `getBedById(bedId)` |
| Assign Patient | `POST` | `/dt/beds/assign` | `assignPatientToBed(payload)` |
| Unassign Patient | `POST` | `/dt/beds/unassign` | `unassignPatientFromBed(payload)` |
| Quarantine Bed | `POST` | `/dt/beds/:bedId/quarantine` | `setQuarantineBed(bedId, payload)` |
| Update Status | `PUT` | `/dt/beds/:bedId/status` | `updateBedStatus(bedId, payload)` |
| Transfer Patient | `POST` | `/dt/beds/transfer` | `transferPatientBed(payload)` |
| Clinic Beds | `GET` | `/dt/clinics/:clinicId/beds` | `getClinicBeds(clinicId)` |

---

### 3.3 Assign Patient to Bed
**POST** `/api/dt/beds/assign`

```json
{
  "bed_id": 10,
  "patient_id": 42,
  "actor_id": 1
}
```

**Possible Errors:**
| Code | HTTP | Meaning |
| :--- | :--- | :--- |
| `ERR_BED_OCCUPIED` | 409 | Bed already has a patient |
| `ERR_BED_NOT_FOUND` | 404 | bed_id invalid |
| `ERR_PATIENT_NOT_FOUND` | 404 | patient_id invalid |
| `ERR_INFECTIOUS_QUARANTINE_MISMATCH` | 409 | Patient/bed quarantine incompatibility |

---

### 3.4 Quarantine a Bed
**POST** `/api/dt/beds/:bedId/quarantine`

```json
{
  "quarantine_status": true,
  "reason": "Hepatitis B positive patient",
  "estimated_duration": "2024-04-30"
}
```

> Setting `quarantine_status: false` removes the quarantine.

---

### 3.5 Transfer Patient Between Beds
**POST** `/api/dt/beds/transfer`

```json
{
  "from_bed_id": 10,
  "to_bed_id": 15,
  "patient_id": 42,
  "requested_by": 1,
  "approved_by": 2,
  "reason": "Equipment malfunction at bed 10"
}
```

> **Inter-clinic transfers** require `approved_by` (non-null). Without it, a `403 ERR_TRANSFER_APPROVAL_REQUIRED` is returned.

---

## 4. Inventory Integration with Sessions

### 4.1 Key Concept: Transaction Reference Linking

Every inventory transaction has a `source_dialysis_appointment_id` field. Use this to link inventory consumption to the dialysis appointment, creating a traceable supply chain:

```
Patient → Appointment → Session → Inventory Consumed
```

When calling `issueInventoryStock()` or `dispenseInventoryToPatient()`, always pass `reference_id: appointmentId` to ensure the audit trail is complete.

---

### 4.2 Issuing Consumables During a Session

**POST** `/api/dt/stock/issue`
> **Frontend helper**: `issueInventoryStock(payload)` in `inventoryApis.js`

```json
{
  "item_id": 55,
  "location_id": 3,
  "quantity": 2,
  "reason": "Dialysis tubing set for session #1122",
  "reference_id": 123
}
```

> `reference_id` = the `appointment_id`. The backend maps this to `source_dialysis_appointment_id` in `dt_inventory_transaction`.

**Backend flow (FEFO)**:
1. Fetches all valid batches (First-Expiry-First-Out).
2. Deducts stock from batches starting with the earliest expiry date.
3. Creates a `dt_inventory_transaction` record per batch consumed.
4. Automatically checks if remaining stock falls below `reorder_level` and **fires a LOW_STOCK alert** if so.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "item_id": 55,
    "location_id": 3,
    "quantity": 2,
    "consumed_batches": [
      { "transaction_id": 201, "batch_id": 12, "batch_number": "LOT-001", "quantity": 2, "expiry_date": "2024-12-31T00:00:00.000Z" }
    ]
  }
}
```

---

### 4.3 Dispense to Patient (Patient-Specific Record)

**POST** `/api/dt/dispense/patient`
> **Frontend helper**: `dispenseInventoryToPatient(payload)` in `inventoryApis.js`

```json
{
  "patient_id": 42,
  "item_id": 60,
  "location_id": 3,
  "quantity": 1,
  "reason": "EPO injection for appointment #123",
  "reference_id": 123
}
```

> Use this when the consumed item is patient-specific (e.g., medications, EPO injections). Use `issueInventoryStock` for generic session supplies (tubing, needles).

---

### 4.4 Dialyzer Lifecycle (Multi-Use Tracking)

Multi-use dialyzers have a finite lifespan (`max_usage`). After each use, their `usage_count` increments. When `usage_count >= max_usage`, the status becomes `BLOCKED`.

**Register Dialyzer:**
**POST** `/api/dt/dialyzers`
```json
{
  "type": "MULTI_USE",
  "max_usage": 12,
  "item_id": 70,
  "notes": "High-flux dialyzer, patient-dedicated"
}
```

**Record Usage After Session:**
**POST** `/api/dt/dialyzers/:id/use`
```json
{
  "notes": "Session #1122 - Patient 42 - 2024-04-22"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "usage_count": 5,
    "max_usage": 12,
    "status": "ACTIVE"
  }
}
```

> **Frontend logic**: After calling `/use`, check if `status === "BLOCKED"`. If so, show a warning that the dialyzer must be replaced.

---

## 5. Recommended Frontend Workflow per Session

```
┌──────────────────────────────────────────────────┐
│  Patient checks in for appointment               │
│  → handleStatusUpdate(appt, 'ARRIVED')           │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Assign a Bed                                     │
│  → assignPatientToBed({ bed_id, patient_id })    │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Start Session                                    │
│  → startDialysisSession({ patient_id, bed_id,   │
│      appointment_id })                            │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Submit Pre-Readings                              │
│  → submitSessionPreReadings(sessionId, {...})    │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Issue Consumables from Inventory                 │
│  → issueInventoryStock({ item_id, location_id,  │
│      quantity, reference_id: appointmentId })    │
│  → useInventoryDialyzer(dialyzerId)              │
└──────────────────┬───────────────────────────────┘
                   │ (during session)
┌──────────────────▼───────────────────────────────┐
│  Stream Readings (real-time or periodic)          │
│  → submitSessionReadings(sessionId, readings)    │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Complete Session                                 │
│  → submitSessionAction(sessionId, {action:'stop'})│
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Unassign Bed                                     │
│  → unassignPatientFromBed({ bed_id })            │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│  Bed Cleaning Period                              │
│  → updateBedStatus(bedId, { status: 'MAINTENANCE'│
│      notes: 'Post-session cleaning' })           │
│  (after cleaning_time_minutes, set back to EMPTY)│
└──────────────────────────────────────────────────┘
```

---

## 6. Error Reference

| Error Code | HTTP | Module | Meaning |
| :--- | :--- | :--- | :--- |
| `ERR_BED_OCCUPIED` | 409 | Bed | Bed already has a patient |
| `ERR_BED_NOT_FOUND` | 404 | Bed | Invalid bed_id |
| `ERR_BED_MISMATCH` | 409 | Bed | Patient not on source bed (transfer) |
| `ERR_INFECTIOUS_QUARANTINE_MISMATCH` | 409 | Bed | Patient/bed type incompatibility |
| `ERR_TRANSFER_APPROVAL_REQUIRED` | 403 | Bed | Inter-clinic transfer needs `approved_by` |
| `ERR_STOCK_NOT_AVAILABLE` | 400 | Inventory | Insufficient stock for issue |
| `ERR_ITEM_NOT_FOUND` | 404 | Inventory | Invalid item_id |
| `ERR_INVALID_TRANSACTION` | 400 | Inventory | Malformed stock operation |
| `ERR_IDEMPOTENCY_KEY_REQUIRED` | 400 | Billing | Missing Idempotency-Key header |
| `APPT_CONFLICT` | 409 | Appointment | Time/capacity conflict detected |

---

## 7. Key Data Structures From the DB

### `dialysis_sessions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key |
| `appointment_id` | INT (nullable) | Links to `tele_appointments.id` |
| `patient_id` | INT | The patient |
| `bed_id` | INT | Assigned bed |
| `state` | VARCHAR | `RUNNING\|PAUSED\|COMPLETED\|ABORTED` |
| `started_at` | TIMESTAMP | Session start time |
| `pre_weight` | DECIMAL | Pre-session weight (kg) |
| `pre_bp` | VARCHAR | Pre-session BP (`"140/90"`) |
| `planned_parameters_json` | JSON | Target session parameters |

### `dt_dialysis_bed`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key |
| `clinic_id` | INT | Which clinic this bed belongs to |
| `status` | VARCHAR | `EMPTY\|OCCUPIED\|MAINTENANCE\|QUARANTINE` |
| `patient_id` | INT (nullable) | Currently assigned patient |
| `bed_type` | VARCHAR | `NORMAL\|QUARANTINE` |
| `is_quarantine` | BOOLEAN | Fine-grain quarantine flag |
| `assigned_since` | TIMESTAMP | When the current patient was assigned |

### `dt_inventory_transaction`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key |
| `item_id` | INT | FK to `dt_item` |
| `transaction_type` | VARCHAR | `IN\|OUT\|ADJUST\|MOVE` |
| `quantity` | DECIMAL | Units consumed |
| `source_dialysis_appointment_id` | INT (nullable) | **Links to appointment** |
| `from_location_id` | INT | Source location |
| `to_location_id` | INT | Destination location |
| `notes` | TEXT | Reason/notes |
