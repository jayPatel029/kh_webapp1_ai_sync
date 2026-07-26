# Pre-Dialysis (Part 2) & /dt/ API Audit Report
Generated: 2026-07-26T17:27:36.428Z
Base URL: https://api.kifaytihealth.com/api1/api

- **[PASSED]** Authentication: Successfully obtained JWT token

## 1. Audit of Existing /dt/ Endpoints

- **[PASSED]** Health Endpoint (/health): Status 200
- **[PASSED]** GET /dt/clinics: Status 200
- **[PASSED]** GET /dt/beds/all: Status 200
- **[PASSED]** GET /dt/beds/status/AVAILABLE: Status 200
- **[PASSED]** GET /dt/appointments: Status 200
- **[PASSED]** GET /dt/shifts: Status 200
- **[FAILED]** GET /dt/inventory/stock: Status 404
- **[FAILED]** GET /dt/inventory/dialyzers: Status 404
- **[FAILED]** GET /dt/billing/bills: Status 404 (Route Not Found on server)

## 2. Audit of Part 2 Pre-Dialysis (P2-01 to P2-12) Endpoints

- **[FAILED]** P2-01: GET /api/dt/sessions/today: Status 403 — Access restricted to Technician, Nurse, or Nephrologist as required by this action
- **[FAILED]** P2-01: POST /api/dt/sessions/:id/mark-emergency: Status 403 — Access restricted to Technician, Nurse, or Nephrologist as required by this action
- **[FAILED]** P2-02: GET /api/dt/patients/:id: Status 403 — Access restricted to Technician, Nurse, or Nephrologist as required by this action
- **[FAILED]** P2-02: GET /api/dt/patients/:id/prescriptions/latest: Status 403
- **[FAILED]** P2-02: GET /api/dt/patients/:id/vitals/latest: Status 403
- **[FAILED]** P2-02: GET /api/dt/patients/:id/labs/latest: Status 403
- **[FAILED]** P2-02: GET /api/dt/patients/:id/alerts: Status 403
- **[FAILED]** P2-02: GET /api/dt/patients/:id/notes: Status 403
- **[FAILED]** P2-02: POST /api/dt/patients/:id/proceed-predialysis: Status 403
- **[FAILED]** P2-03: GET /api/dt/sessions/:id/predialysis-status: Status 403
- **[PASSED]** P2-03: POST /api/dt/sessions/:id/print-summary: Status 403 (Note: 403 expected if non-nephrologist role)
- **[FAILED]** P2-04: GET /api/dt/patients/:id/dialyzer-status: Status 403
- **[FAILED]** P2-08: GET /api/dt/machines/:id/qc/today: Status 403
- **[FAILED]** P2-08: GET /api/dt/machines/:id/self-test/today: Status 403
- **[FAILED]** P2-09: GET /api/dt/ro-plants/:id/shift-check/current: Status 403
- **[FAILED]** P2-09: GET /api/dt/ro-plants/:id/verification/today: Status 403

## 3. End-to-End Pre-Dialysis Workflow (P2-04 to P2-12)

- **[FAILED]** Step P2-04 (Verification): Status 403 — Access restricted to Technician, Nurse, or Nephrologist as required by this action
- **[FAILED]** Step P2-04 (Consumables): Status 403 — Access restricted to Technician, Nurse, or Nephrologist as required by this action
- **[FAILED]** Step P2-05 (Vitals): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Step P2-06 (Assessment): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Step P2-07 (Vascular Access): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Step P2-08 (Machine Safety Review): Status 403 — Access restricted to Technician, Nurse, or Nephrologist as required by this action
- **[FAILED]** Step P2-09 (Water Safety Review): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Step P2-10 (Infection Control): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Step P2-11 (Validate): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Step P2-12 (Start Dialysis): Status 503 — <html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
- **[FAILED]** Logout Digest: Status 503

## Summary
- **Passed**: 8
- **Failed**: 29