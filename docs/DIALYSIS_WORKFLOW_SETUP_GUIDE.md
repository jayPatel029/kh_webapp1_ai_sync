# Dialysis Workflow Setup Guide

This guide sets up and verifies the implemented dialysis workflow in the
frontend:

```text
P2 Pre-Dialysis → P3 During Dialysis → P4 Post-Dialysis
```

There is currently no implemented P1 workflow in this repository. See the
[code-level workflow documentation](./DIALYSIS_WORKFLOW_CODE_DOCUMENTATION.md)
for the complete source mapping.

## 1. Prerequisites

- Node.js and npm installed.
- Repository dependencies installed with `npm install`.
- A reachable Kifayti Health API environment.
- A valid authenticated user account with a dialysis workflow role.
- Browser local storage enabled; the workflow uses it for session context and
  drafts.

The frontend package uses React Scripts. From the repository root:

```bash
npm install
npm start
```

Use the URL printed by React Scripts.

## 2. Configure the API server

The shared Axios client reads the API base URL from:

```text
REACT_APP_API_SERVER_URL
```

If it is not set, the frontend uses:

```text
https://api.kifaytihealth.com/api1/api
```

For a local or test environment, create a root `.env` file before starting:

```dotenv
REACT_APP_API_SERVER_URL=https://your-api-host.example/api
```

Restart `npm start` after changing `.env`.

The shared client automatically sends the browser token as:

```http
Authorization: Bearer <localStorage.token>
```

Establish the token through the application's existing login flow. Do not put
a bearer token in source code or commit it to `.env`.

Implementation references:

- [constants.js](../src/constants/constants.js)
- [axiosInstance.js](../src/helpers/axios/axiosInstance.js)

## 3. Start the frontend

From the repository root:

```bash
npm start
```

Sign in and open:

```text
/dialysis/patients
```

The current route configuration allows the patient workflow for Dialysis
Technician, Doctor, Medical Staff, Admin, and PSadmin. During and post-dialysis
routes additionally allow Nurse and Nephrologist.

Route configuration:

- [dialysisRoutes.jsx](../src/routes/dialysisRoutes.jsx)
- [DialysisLayout.jsx](../src/pages/dialysis/DialysisLayout.jsx)

## 4. Run the P2 pre-dialysis workflow

Open `/dialysis/patients` and select a hemodialysis patient from the queue.
The documented P2 order is:

```text
P2-01 Queue → P2-02 Patient Summary → P2-03 Dashboard → P2-04 Verification
→ P2-05 Vitals → P2-06 Assessment → P2-07 Vascular Access
→ P2-08 Machine Safety → P2-09 Water Safety → P2-10 Infection Control
→ P2-11 Safety Validation → P2-12 Start Dialysis Confirmation
```

Current implementation note: selecting a queue row currently passes
`patientId` without a `step`, and `DialysisPatients` defaults directly to
P2-04. P2-02 exists as a component but is not on the default queue-to-form
path. To open a specific P2 screen during development, use React Router state
such as:

```js
{
  patientId,
  sessionId,
  step: 'P2-05'
}
```

The P2 API wrappers are in
[preDialysisApis.js](../src/ApiCalls/preDialysisApis.js). The session-bound
endpoint patterns are:

| Screen | Endpoint |
|---|---|
| P2-04 | `POST /dt/sessions/:id/verification` and `POST /dt/sessions/:id/consumables` |
| P2-05 | `POST /dt/sessions/:id/vitals` |
| P2-06 | `POST /dt/sessions/:id/assessment` |
| P2-07 | `POST /dt/sessions/:id/vascular-access` |
| P2-08 | `POST /dt/sessions/:id/machine-safety/review` |
| P2-09 | `POST /dt/sessions/:id/water-safety/review` |
| P2-10 | `POST /dt/sessions/:id/infection-control` |
| P2-11 | `POST /dt/sessions/:id/validate` |
| P2-12 | `POST /dt/sessions/:id/start` |

## 5. Start the P3 session

P2-12 is the canonical handoff into treatment. After a successful start
response containing a session identifier, the frontend opens:

```text
/dialysis/during/{sessionId}/P3-01
```

The navigation state is:

```js
{
  patientId,
  sessionId
}
```

Do not replace `sessionId` with `patientId`; P3 and P4 APIs use the dialysis
session identifier for reads and writes.

The stage bar can navigate between Pre-Dialysis, During Dialysis, and
Post-Dialysis. During and Post remain disabled until a session ID exists.

## 6. Run the P3 during-dialysis workflow

Open:

```text
/dialysis/during/{sessionId}/P3-01
```

The P3 stepper provides:

```text
P3-01 Dashboard
P3-02 Live Vitals
P3-03 Machine Parameters
P3-04 Symptoms & Complications
P3-05 Vascular Access Monitoring
P3-06 Medication Administration
P3-07 Alarm Management
P3-08 Treatment Progress
P3-09 Incident & Event Reporting
P3-10 Treatment Completion
```

The P3 container loads session details, the treatment dashboard, and
intradialytic vitals. It polls the current technician's overdue-vitals list
every 60 seconds.

P3 API wrappers are in
[dialysisSessionApis.js](../src/ApiCalls/dialysisSessionApis.js). A valid
session ID is required for production saves. `demo` and `preview` are
non-production preview values and do not represent a live session.

## 7. Run the P4 post-dialysis workflow

Open:

```text
/dialysis/post/{sessionId}/P4-01
```

The P4 order is:

```text
P4-01 Blood Return & Termination
P4-02 Vascular Access Hemostasis
P4-03 Post-Dialysis Vitals & Assessment
P4-04 Treatment Outcome Summary
P4-05 Medication & Follow-up
P4-06 Machine Disinfection & Turnover
P4-07 Infection Control & Waste
P4-08 Patient Discharge
P4-09 Documentation & Sign-off
P4-10 Session Complete
```

Each transition saves the current screen through the P4 API wrapper before
advancing for a real session. P4-10 closes the session and, when not embedded,
returns to `/dialysis/sessions`.

P4 API wrappers are in
[postDialysisApis.js](../src/ApiCalls/postDialysisApis.js).

## 8. Browser storage and draft recovery

The workflow currently stores drafts in unencrypted browser local storage:

```text
during-dialysis-draft:{sessionId}
post-dialysis-draft:{sessionId}
```

P3 also stores session and patient context:

```text
lastDialysisSessionId
lastDialysisPatientId
lastDialysisPatientData
```

Use a fresh browser profile or clear these keys when testing a different
patient/session. Do not use real patient data in a shared development browser.

The current workflow code does not prove encryption at rest. P3/P4 draft
writes are direct `localStorage` writes and require future storage-layer
integration.

## 9. Verify the setup

Run the existing test suite:

```bash
npm test -- --watchAll=false
```

Build the production bundle:

```bash
npm run build
```

Manual smoke path:

1. Open `/dialysis/patients`.
2. Select a hemodialysis patient.
3. Complete the P2 checklist through P2-12.
4. Confirm the successful start lands on `/dialysis/during/{sessionId}/P3-01`.
5. Move to P3-10 and then P4-01.
6. Complete P4-10 and confirm the session closes and returns to
   `/dialysis/sessions`.
7. Refresh during P3 and P4 and confirm the same session remains selected.

Relevant tests are listed in the
[code-level workflow documentation](./DIALYSIS_WORKFLOW_CODE_DOCUMENTATION.md#tests-covering-the-workflow).

## 10. Troubleshooting

| Symptom | Check |
|---|---|
| API calls go to the wrong host | Confirm `REACT_APP_API_SERVER_URL` and restart `npm start`. |
| Redirect to login | Check that `localStorage.token` exists and is valid. A 401 clears local caches and redirects to `/doctorLogin`. |
| During/Post buttons are disabled | Confirm a real `sessionId` exists in route state, URL, or persisted storage. |
| P3 shows “No active session” | Start from P2-12 or open the route with a valid session ID. |
| Wrong patient appears after refresh | Clear `lastDialysisSessionId`, `lastDialysisPatientId`, and `lastDialysisPatientData`; restart from P2. |
| P2-02 does not appear after queue selection | This is current behavior; queue selection defaults to P2-04. |
| Saves fail in P3/P4 | Confirm the session ID is not `demo`/`preview`, the API is reachable, and the account has the required role. |
| Production build fails | Run `npm install`, inspect the first compiler error, and rerun `npm run build`. |

## 11. Setup boundaries

- This guide configures the frontend only; it does not create or migrate the
  backend database.
- Backend authentication, authorization, consent enforcement, and API data
  validation remain backend responsibilities.
- No P1 implementation is available to configure.
- Do not use production patient data for local testing.
