# 🔌 Bed Management APIs - Quick Reference

## API Endpoint Quick Reference

### 1. Get All Beds
```javascript
import { getAllBeds } from './ApiCalls';

const result = await getAllBeds();
// Returns: { success: true/false, data: [...beds] }
```

**Backend Endpoint:** `GET /api/beds/all`

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bed-1",
      "bed_number": "101",
      "status": "EMPTY",
      "bed_type": "NORMAL",
      "patient_id": null,
      "ward": "ICU",
      "assigned_since": null
    }
  ]
}
```

---

### 2. Get Beds by Status
```javascript
import { getBedsByStatus } from './ApiCalls';

const result = await getBedsByStatus('EMPTY');
// Returns: { success: true/false, data: [...beds] }
```

**Backend Endpoint:** `GET /api/beds/status/:status`

**Status Values:** `EMPTY` | `OCCUPIED` | `QUARANTINE`

---

### 3. Get Single Bed
```javascript
import { getBedById } from './ApiCalls';

const result = await getBedById('bed-1');
// Returns: { success: true/false, data: {...bed} }
```

**Backend Endpoint:** `GET /api/beds/:bedId`

---

### 4. Assign Patient to Bed ⭐ (WITH VALIDATION)
```javascript
import { assignPatientToBed } from './ApiCalls';

const result = await assignPatientToBed({
  bed_id: 'bed-1',
  patient_id: 'patient-123',
  assignment_notes: 'Routine assignment'
});
```

**Backend Endpoint:** `POST /api/beds/assign`

**Request Body:**
```json
{
  "bed_id": "bed-1",
  "patient_id": "patient-123",
  "assignment_notes": "Optional notes"
}
```

**Important Validations:**
- ✅ Check if bed is empty
- ✅ If patient is infectious → bed must be QUARANTINE type
- ✅ If bed is QUARANTINE → cannot have non-infectious with infectious

**Error Responses:**
```json
{
  "success": false,
  "data": "Cannot assign infectious patient to normal bed"
}
```

---

### 5. Unassign Patient from Bed
```javascript
import { unassignPatientFromBed } from './ApiCalls';

const result = await unassignPatientFromBed({
  bed_id: 'bed-1',
  patient_id: 'patient-123'
});
```

**Backend Endpoint:** `POST /api/beds/unassign`

---

### 6. Mark Bed as Quarantine
```javascript
import { setQuarantineBed } from './ApiCalls';

const result = await setQuarantineBed('bed-1', {
  reason: 'COVID-19 positive patient',
  quarantine_status: true,
  estimated_duration: '7 days'
});
```

**Backend Endpoint:** `POST /api/beds/:bedId/quarantine`

**Request Body:**
```json
{
  "reason": "Infection reason",
  "quarantine_status": true,
  "estimated_duration": "7 days"
}
```

---

### 7. Get Patient Details ⭐ (INCLUDES IS_INFECTIOUS)
```javascript
import { getPatientDetails } from './ApiCalls';

const result = await getPatientDetails('patient-123');
```

**Backend Endpoint:** `GET /api/patients/:patientId`

**Response Must Include:**
```json
{
  "success": true,
  "data": {
    "id": "patient-123",
    "name": "John Doe",
    "patient_code": "P-123",
    "is_infectious": false,  // ⭐ CRITICAL FIELD
    "patient_details": {
      "age": 65,
      "disease": "Chronic Kidney Disease"
    }
  }
}
```

---

### 8. Get Patient Isolation Status
```javascript
import { getPatientIsolationStatus } from './ApiCalls';

const result = await getPatientIsolationStatus('patient-123');
```

**Backend Endpoint:** `GET /api/patients/:patientId/isolation-status`

---

### 9. Update Bed Status
```javascript
import { updateBedStatus } from './ApiCalls';

const result = await updateBedStatus('bed-1', {
  status: 'MAINTENANCE',
  notes: 'Routine cleaning'
});
```

**Backend Endpoint:** `PUT /api/beds/:bedId/status`

---

### 10. Get Bed Assignments by Date Range
```javascript
import { getBedAssignmentsByDateRange } from './ApiCalls';

const result = await getBedAssignmentsByDateRange({
  start_date: '2026-04-12T00:00:00Z',
  end_date: '2026-04-19T23:59:59Z'
});
```

**Backend Endpoint:** `POST /api/beds/assignments/date-range`

---

## 🎯 Usage Pattern

All APIs follow this pattern:

```javascript
const result = await apiFunction(params);

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.data);
}
```

---

## 🛡️ Quarantine Validation Logic

### Key Fields for Validation

**Bed Object:**
- `bed_type`: `'NORMAL'` or `'QUARANTINE'`
- `status`: `'EMPTY'`, `'OCCUPIED'`, or `'QUARANTINE'`

**Patient Object:**
- `is_infectious`: `boolean` ← **CRITICAL**

### Validation Rules

```
IF patient.is_infectious == true
  THEN bed.bed_type MUST BE 'QUARANTINE'
  ELSE throw error: "Cannot assign infectious patient to normal bed"

IF bed.bed_type == 'QUARANTINE' AND bed.patient_id != null
  THEN existing_patient.is_infectious MUST EQUAL new_patient.is_infectious
  ELSE throw error: "Cannot mix infectious and non-infectious patients"

IF bed.status == 'OCCUPIED'
  THEN throw error: "Bed is already occupied"

IF bed.status == 'QUARANTINE'
  THEN only infectious patients allowed (unless empty)
```

---

## 💡 Common Use Cases

### Use Case 1: Assign Regular Patient to Empty Bed
```javascript
const result = await assignPatientToBed({
  bed_id: 'bed-1',
  patient_id: 'patient-123',
  assignment_notes: 'Routine admission'
});
// ✅ Success (non-infectious to normal bed)
```

### Use Case 2: Try to Assign Infectious Patient to Normal Bed
```javascript
const result = await assignPatientToBed({
  bed_id: 'bed-1',
  patient_id: 'infectious-patient-456',
  assignment_notes: 'COVID-19'
});
// ❌ Error: "Cannot assign infectious patient to normal bed"
```

### Use Case 3: Assign Infectious Patient to Quarantine Bed
```javascript
// First ensure bed is marked as quarantine
await setQuarantineBed('bed-2', {
  reason: 'COVID-19',
  quarantine_status: true,
  estimated_duration: '14 days'
});

// Then assign infectious patient
const result = await assignPatientToBed({
  bed_id: 'bed-2',
  patient_id: 'infectious-patient-456',
  assignment_notes: 'Quarantine isolation'
});
// ✅ Success (infectious to quarantine bed)
```

### Use Case 4: Transfer Patient Between Beds
```javascript
// Unassign from current bed
await unassignPatientFromBed({
  bed_id: 'bed-1',
  patient_id: 'patient-123'
});

// Assign to new bed
const result = await assignPatientToBed({
  bed_id: 'bed-3',
  patient_id: 'patient-123',
  assignment_notes: 'Patient transfer'
});
```

---

## 🧪 Test Before Implementation

```bash
# Run API tests
npm test -- bedManagementApis.test.js

# Expected Results:
✅ Test 1: Get All Beds
✅ Test 2: Get Beds by Status  
✅ Test 3: Get Bed by ID
✅ Test 4: Get Patient Details
✅ Test 5: Assign Patient
✅ Test 6: Unassign Patient
✅ Test 7: Quarantine Bed
✅ Test 8: Quarantine Validation (rejection test)
✅ Test 9: Update Bed Status
```

---

## ⚠️ Important Headers

All requests should include:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`  // If required
}
```

---

## 🔗 Related APIs

These APIs should work with bed management:

- `POST /api/teleconsultation/bookAppointment` - Book appointment with bed
- `GET /api/teleconsultation/getAllAppointmentsById` - Get appointments
- `GET /api/patients/:patientId` - Get patient info (must include is_infectious)

---

## 📊 Response Status Codes

```
200 OK      - Request successful
400 BAD REQUEST - Invalid input
404 NOT FOUND - Resource not found
409 CONFLICT - Invalid state (e.g., non-infectious in quarantine)
500 ERROR   - Server error
```

---

## 🔐 Security Checklist

- [ ] `is_infectious` field is populated for all patients
- [ ] Bed assignment validates quarantine rules
- [ ] API logs all bed assignment changes
- [ ] Only authorized users can assign beds
- [ ] Quarantine status is visible to all staff
- [ ] Error messages don't leak sensitive data

---

## 📝 Example Error Handling

```javascript
try {
  const result = await assignPatientToBed({
    bed_id: bedId,
    patient_id: patientId,
    assignment_notes: 'Transfer'
  });

  if (!result.success) {
    // Handle specific error
    if (result.data.includes('infectious')) {
      showWarning('This patient requires a quarantine bed');
    } else if (result.data.includes('occupied')) {
      showWarning('This bed is already occupied');
    } else {
      showError(result.data);
    }
    return;
  }

  showSuccess('Patient assigned successfully');
} catch (error) {
  showError('Network error: ' + error.message);
}
```

---

**Last Updated:** April 12, 2026
**Version:** 1.0
**Status:** Ready for Backend Implementation ✅
