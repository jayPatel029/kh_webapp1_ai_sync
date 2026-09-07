# API and Data Contracts

## Transport contract

The frontend uses `src/helpers/axios/axiosInstance.js` with a base URL from
`REACT_APP_API_SERVER_URL` or the fallback in `src/constants/constants.js`.
Requests receive `Authorization: Bearer <token>` from `localStorage` when a
token exists. The client timeout is 30 seconds and requests are paced globally.

The response interceptor invalidates affected page caches after successful
`POST`, `PUT`, `PATCH`, and `DELETE` calls. A normalized 401 clears local session
state and redirects to `/doctorLogin` unless the current page is a login page.

## API module ownership

| Concern | Frontend module(s) |
| --- | --- |
| Auth and role hydration | `authapis.js` |
| Patients and teams | `patientAPis.js`, `adminPatientApis.js`, `doctorPatientApis.js`, `ailmentPatientApis.js` |
| Readings and uploads | `readingsApis.js`, `dataUpload.js` |
| Alarms and alerts | `alarmsApis.js`, `alertsApis.js`, `appAlerts.js`, `doctorAlert.js` |
| Prescriptions, labs, diet, requisitions | `prescriptionApis.js`, `remainingApis.js`, and feature-specific modules |
| Chat and support | `chatApis.js`, `contactus.js`, `commentApi.js`, `GetComments.js` |
| Admin/master data | `questionApis.js`, `languageApis.js`, `ailmentApis.js`, `manageparameters.js` |
| Clinic, beds, inventory | `clinicApis.js`, `bedManagementApis.js`, `inventoryApis.js` |
| Dialysis workflow | `preDialysisApis.js`, `dialysisSessionApis.js`, `dialysisTechnicianApis.js`, `postDialysisApis.js` |
| Analytics and reports | `analyticsApis.js`, `adminDashApis.js`, `doctorApis.js` |

`src/ApiCalls/index.js` is the export barrel. Before renaming or changing a
function signature, search all callers and preserve both the endpoint path and
the response envelope used by those callers.

## Response and error conventions

There are two conventions in active code:

- Some modules return `{ success, data, message, status }` and structured error
  fields such as `error_code` and `details`.
- Older modules return `{ success, data }`, with backend error data stored in
  `data`.

Do not normalize a whole module opportunistically. Make any envelope change
explicit and update all consumers and tests in the same change.

## Contract families

The detailed endpoint inventories are retained in `API_DOCS_FULL.md`,
`API_DOCS_LLM.md`, and `HIMS-Inventory-Backend-API-Documentation.md`. The
families that matter when navigating the frontend are:

- authentication, role identification, and user administration;
- patients, medical teams, profiles, and patient-scoped resources;
- daily/dialysis readings, graph data, imports, and reports;
- alarms, alerts, notifications, comments, and chat;
- clinic, bed, appointment, shift, and inventory operations;
- pre-dialysis (`/dt/...`), during-dialysis session telemetry, and post-dialysis;
- audit logs, configuration masters, and support.

## Dialysis and operations data

The operations specifications describe these connected records:

```text
clinic / organization
  -> appointment + staff/shift context
  -> bed assignment (including quarantine state)
  -> dialysis session
       -> pre-readings and safety checks
       -> intradialytic readings, parameters, symptoms, alarms, events
       -> post-treatment completion
  -> inventory transactions and audit records
```

The frontend session module currently exposes legacy session methods plus Part 3
during-dialysis methods. Examples include session start, pre-readings, telemetry,
session actions, intradialytic vitals, machine parameters, symptoms, vascular
access, medications, alarms, incidents, progress, and end-treatment.

## Contract safety checklist

Before changing an API call:

1. Read the backend/source specification and the current API wrapper.
2. Find every caller and record the fields it reads.
3. Preserve IDs, date/time formats, status names, and response envelopes.
4. Validate role, organization, consent, and patient-safety constraints at the
   backend boundary as well as in the UI.
5. Add or update the smallest behavioral test that catches a wrong payload,
   missing validation, or incorrect error path.
6. Exercise the real request path when credentials and the backend are available.

## Source references

- Bed and dialysis contracts: `BED_AND_DIALYSIS_API_SPEC.md` and
  `dialysis_session_bed_inventory_guide.md`.
- Bed quick reference and implementation guide: `API_REFERENCE.md` and
  `BED_MANAGEMENT_GUIDE.md`. Historical examples are in `archive/legacy/`.
- Alerts: `ALERTS-FRONTEND-GUIDE.md`.
- Pre-dialysis integration endpoints: `dialysis_docs/P2-1,2/`.
- During/post integration endpoints: `dialysis_docs/P3/` and `dialysis_docs/P4/`.
