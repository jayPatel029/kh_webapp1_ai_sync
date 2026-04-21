# Dialysis Module – Frontend API Implementation Guide

This guide provides a comprehensive overview of the available API endpoints for the Dialysis module, including request/response structures, required headers, and implementation patterns.

---

## 1. Core Architecture & Conventions

### Base URL & Protocol
- **Base URL**: `http://localhost:3000/api` (Local) or `https://api.kifaytihealth.com/api1/api` (Production fallback).
- **Service Namespace**: `/dt/` (Dialysis Technology).
- **Content Type**: `application/json`.

### Idempotency (CRITICAL)
For all **POST** and **PUT** operations that mutate financial or scheduling state (Appointments, Payments, Cancellations), an `Idempotency-Key` header is **required**.
- **Header Name**: `Idempotency-Key`
- **Format**: UUID v4 or any unique string.
- **Utility**: Use the `withIdempotency` helper in `src/ApiCalls/clinicApis.js`.

### Standard Response Format
```json
{
  "success": true,
  "data": { ... } // Or an array [...]
}
```

---

## 2. API Map by Feature

### A. Clinic & Organization Management
*File: `src/ApiCalls/clinicApis.js`*

| Feature | Method | Endpoint | Payload Key Fields |
| :--- | :--- | :--- | :--- |
| **List Organizations** | `GET` | `/dt/organizations` | N/A |
| **Create Organization** | `POST` | `/dt/organizations` | `name`, `email`, `contact_number`, `address` |
| **List Clinics** | `GET` | `/dt/clinics` | N/A |
| **Create Clinic** | `POST` | `/dt/clinics` | `name`, `organization_id`, `clinic_type`, `facilities` |
| **Get Clinic Beds** | `GET` | `/dt/clinics/:id/beds` | N/A |

### B. Appointment Booking & Billing
*File: `src/ApiCalls/clinicApis.js`*

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Find Slots** | `GET` | `/dt/slots` | Fetch available 30min slots for a clinic & date range. |
| **Create Appointment** | `POST` | `/dt/appointments` | Book appointment + optional immediate payment. |
| **Add Payment** | `POST` | `/dt/appointments/:id/payments` | Record full/partial payment for existing appt. |
| **Cancel Appointment** | `POST` | `/dt/appointments/:id/cancel` | Cancel + record refund details if applicable. |
| **Get Invoice** | `GET` | `/dt/appointments/:id/invoice` | Fetch formatted billing data for PDF/Print. |

**Booking Payload Example:**
```json
{
  "clinicId": 101,
  "patientId": 505,
  "startUTC": "2024-04-22T08:00:00Z",
  "endUTC": "2024-04-22T12:00:00Z",
  "bookingType": "offline",
  "amountDue": 2500,
  "immediatePayment": {
    "amount": 1000,
    "method": "UPI",
    "receiptUrl": "http://..."
  }
}
```

### C. Inventory Management
*File: `src/ApiCalls/inventoryApis.js`*

| Feature | Method | Endpoint | Key Notes |
| :--- | :--- | :--- | :--- |
| **List Items** | `GET` | `/dt/items` | General dialysis disposables/medicines. |
| **Stock Status** | `GET` | `/dt/stock` | Filter by `location_id` or `item_id`. |
| **Issue Stock** | `POST` | `/dt/stock/issue` | General consumption (not session-linked). |
| **Dispense Patient** | `POST` | `/dt/dispense/patient` | Link consumption to a specific patient. |
| **Dialyzer Registry** | `GET` | `/dt/dialyzers` | Track usage counts for Multi-Use dialyzers. |

### D. Dialysis Session Tracking
*File: `src/ApiCalls/dialysisSessionApis.js`*

| Feature | Method | Endpoint | State / Lifecycle |
| :--- | :--- | :--- | :--- |
| **Start Session** | `POST` | `/dt/dialysis/sessions/start` | Transitions Appt -> Session (RUNNING). |
| **Pre-Readings** | `POST` | `/dt/sessions/:id/pre-readings` | Weight, BP, Pre-Lab results. |
| **Add Readings** | `POST` | `/dt/sessions/:id/readings` | Dialysate temp, arterial pressure, etc. |
| **Session Control** | `POST` | `/dt/sessions/:id/actions` | `pause`, `resume`, `stop`, `abort`. |

---

## 3. Data Integrity & Validation

### Date and Time
- Always send/receive dates in **ISO 8601 UTC** format (`YYYY-MM-DDTHH:mm:ssZ`).
- Use the `dayjs` library available in the project for conversions.

### Financials
- All amounts should be passed as **Numbers** (Integers or Decimals).
- Currency defaults to `INR` unless specified in metadata.

---

## 4. Implementation Checklist for Frontend

1. **Patient Fetching**: Use `getPatients()` from `src/ApiCalls/patientAPis.js` and filter those with "Dialysis" in ailments.
2. **Doctor Fetching**: Use `getDoctors()` from `src/ApiCalls/doctorApis.js`.
3. **Receipt Handling**: The `/upload` API (handled by `src/ApiCalls/dataUpload.js`) provides the URL. Provide this URL to the `receiptUrl` field in payments.
4. **PDF Generation**: Use `jsPDF` + `jspdf-autotable` on the client. Do NOT expect a PDF blob from the backend; expect the *data* to generate it.
5. **Loading States**: All API calls should be wrapped in `isLoading` state to provide visual feedback in the UI components (e.g., `Spin` or `Skeleton`).

---
