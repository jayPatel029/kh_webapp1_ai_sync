# Dialysis Workflow — Code-Level Documentation

This document describes the dialysis workflow currently implemented in this
frontend, from the available pre-dialysis screens through treatment and
post-dialysis closure.

## Scope and terminology

The repository contains implementation and specifications for:

- **P2 — Pre-Dialysis:** P2-01 through P2-12.
- **P3 — During Dialysis:** P3-01 through P3-10.
- **P4 — Post-Dialysis:** P4-01 through P4-10.

No standalone P1 screen specification, route, or `P1-*` component was found in
the repository. The `P1-1.jpeg` and `P1-2.jpeg` files under the P2 document
folder are image assets, not an implemented P1 workflow. P1 is therefore an
open documentation/mapping gap, not a code module that can be documented
without inventing behavior.

## Runtime architecture

`src/routes/dialysisRoutes.jsx` defines the route tree. `DialysisLayout` wraps
all dialysis children and renders the stage switcher before the active child
route.

```text
/dialysis
├── /patients                         P2 queue and pre-dialysis workflow
├── /during/:sessionId/:screenId      P3 workflow
├── /during/:screenId                 P3 preview/legacy-compatible form
├── /post/:sessionId/:screenId        P4 workflow
└── /post/:screenId                   P4 preview/legacy-compatible form
```

Code references:

- [dialysisRoutes.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/routes/dialysisRoutes.jsx:20)
- [DialysisLayout.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/DialysisLayout.jsx:1)
- [DialysisStageTabs.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/DialysisStageTabs.jsx:6)

The route guards currently allow the following broad role sets:

- `/dialysis/patients`: Dialysis Technician, Doctor, Medical Staff, Admin,
  PSadmin.
- `/dialysis/during/*` and `/dialysis/post/*`: Dialysis Technician, Nurse,
  Nephrologist, Doctor, Medical Staff, Admin, PSadmin.

These are frontend route gates. They are not a substitute for authorization in
the API or backend data layer.

## Workflow state contract

The workflow carries two identifiers:

- `patientId` identifies the patient.
- `sessionId` identifies the dialysis treatment session.

P2 stores these values in React Router location state using the compatible keys
`patientId`, `sessionId`, `session_id`, and `dialysis_session_id` at different
handoffs. P3 and P4 read the canonical route form first and then support state,
query-string, and persisted-storage fallbacks.

For a real session, P3 persists `lastDialysisSessionId`,
`lastDialysisPatientId`, and patient data in browser storage so refresh and
stage navigation can recover context. A session equal to `demo` or `preview`
is treated as a non-persisted preview session and does not save to the API.

Relevant implementation:

- [DialysisPatients.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/DialysisPatients.jsx:80)
- [DuringDialysisPage.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/DuringDialysisPage.jsx:4280)
- [PostDialysisPage.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/PostDialysisPage.jsx:1)

## P2 — Pre-Dialysis

`DialysisPatients.jsx` is the P2 workflow container. It selects the active
screen from `location.state.step` and passes `patientId`, `sessionId`, and
back/next navigation callbacks to the screen component.

| Screen | Code entry point | Main data boundary |
|---|---|---|
| P2-01 Today's Patient Queue | `QueueView` in [DialysisPatients.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/DialysisPatients.jsx:326) | `GET /patient/getPatients`, filtered to hemodialysis patients |
| P2-02 Patient Summary | [PatientSummaryView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/PatientSummaryView.jsx:1) and `usePatientSummary` | `preDialysisApis.js` patient, prescription, vitals, labs, alerts, and notes reads |
| P2-03 Pre-Dialysis Dashboard | [PreDialysisDashboardView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/PreDialysisDashboardView.jsx:1) and `usePreDialysisDashboard` | Predialysis status, patient context, notes, and checklist state |
| P2-04 Patient Verification | [PatientVerificationView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/PatientVerificationView.jsx:143) and `usePatientVerification` | Verification and consumables submissions |
| P2-05 Vitals & Measurements | [VitalsMeasurementsView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/VitalsMeasurementsView.jsx:86) and `useVitalsMeasurements` | Vitals submission and threshold evaluation |
| P2-06 Patient Assessment | [PatientAssessmentView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/PatientAssessmentView.jsx:104) and `usePatientAssessment` | Assessment submission and validation |
| P2-07 Vascular Access | [VascularAccessAssessmentView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/VascularAccessAssessmentView.jsx:140) | Vascular-access review and submission |
| P2-08 Machine Safety | [MachineSafetyView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/MachineSafetyView.jsx:68) | Machine QC/self-test reads and safety review |
| P2-09 Water Safety | [WaterSafetyView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/WaterSafetyView.jsx:78) | RO plant checks and water-safety review |
| P2-10 Infection Control | [InfectionControlView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/InfectionControlView.jsx:66) | Infection-control submission |
| P2-11 Safety Validation | [SafetyValidationView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/SafetyValidationView.jsx:42) | Final checklist validation |
| P2-12 Start Dialysis Confirmation | [StartDialysisConfirmationView.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/StartDialysisConfirmationView.jsx:42) | Summary, PIN/unlock, and session start |

The specified P2 sequence is:

```text
P2-01 → P2-02 → P2-03 → P2-04 → P2-05 → P2-06 →
P2-07 → P2-08 → P2-09 → P2-10 → P2-11 → P2-12
```

The current runtime has an important difference: selecting a queue row passes
only `patientId` and appointment state, and the container defaults a selected
patient directly to P2-04. `PatientSummaryView` is imported, but no active
render branch in `DialysisPatients` selects P2-02. P2-02 is therefore a code
entry point present in the repository but not part of the default queue-to-form
path. P2-03 is reachable when dashboard state or `step: 'P2-03'` is supplied.

P2-12 calls `startDialysis`; on success,
the returned session identifier is used to navigate to `/dialysis/during/:id/P3-01`.

P2 API wrappers are centralized in
[preDialysisApis.js](/home/arcticarc/Projects/kifayti-webapp1/src/ApiCalls/preDialysisApis.js:38).
The wrapper names are intentionally screen-labelled (`submitSessionVitals`,
`submitSessionAssessment`, `reviewMachineSafety`, `validateSafetyChecklist`,
and `startDialysis`) and all requests use the shared `axiosInstance`.

### P2 clinical configuration

[vitalsThresholds.js](/home/arcticarc/Projects/kifayti-webapp1/src/config/vitalsThresholds.js:9)
contains browser-configurable defaults for vital-sign and UF thresholds.
Values are read from `localStorage` and merged with defaults. The documented
defaults include systolic, diastolic, pulse, temperature, SpO₂, respiration,
and UF warning/critical limits.

## P2 → P3 handoff

The handoff is implemented in two places:

1. `StartDialysisConfirmationView` navigates directly after a successful start.
2. `DialysisPatients` supplies an `onNext(sessionId)` callback that performs
   the same navigation when the screen is rendered inside the P2 container.

The target is:

```text
/dialysis/during/{sessionId}/P3-01
```

The navigation state includes `{ patientId, sessionId }`. If no session ID is
available, the P2 container returns to the patient route rather than opening a
session-less live workflow.

## P3 — During Dialysis

All P3 screens are orchestrated by one route component,
[DuringDialysisPage.jsx](/home/arcticarc/Projects/kifayti-webapp1/src/pages/dialysis/DuringDialysisPage.jsx:4280).
The `SCREENS` array is the source for the stepper, active-screen state, and
screen labels.

| Screen | Rendered implementation | API surface |
|---|---|---|
| P3-01 Treatment Dashboard | `Dashboard` | Session, dashboard, and intradialytic vitals reads |
| P3-02 Live Vitals Monitoring | `VitalsForm` | `createIntradialyticVitals`, `getIntradialyticVitals` |
| P3-03 Machine Parameters | `P303MachineParameters` | Machine parameter reads/writes |
| P3-04 Symptoms & Complications | `SymptomForm` | Symptom create/read/update |
| P3-05 Vascular Access Monitoring | `VascularAccessMonitoringView` | Access monitoring create/read |
| P3-06 Medication Administration | `MedicationAdministrationView` | Medication, due-medication, and allergy reads; administration writes |
| P3-07 Alarm Management | `AlarmManagementView` | Alarm create/read/update |
| P3-08 Treatment Progress | `TreatmentProgressView` | Progress reads and treatment events |
| P3-09 Incident & Event Reporting | `IncidentReportingView` | Incident reads/writes |
| P3-10 Treatment Completion | `TreatmentCompletionView` | `endDuringDialysisTreatment` |

The P3 API functions are in
[dialysisSessionApis.js](/home/arcticarc/Projects/kifayti-webapp1/src/ApiCalls/dialysisSessionApis.js:163).
Navigation between screens uses `go(screenId)`, which updates the URL and
retains the session in route state. P3-10 is also reachable from the persistent
`End Treatment` action.

While P3 is active, the page polls the current technician's overdue-vitals
list every 60 seconds. The modal can navigate to P3-02, skip one overdue item,
or skip all returned items through the corresponding API wrappers.

## P3 → P4 handoff

P4 starts at P4-01 when the user navigates to:

```text
/dialysis/post/{sessionId}/P4-01
```

P4-01's Back action returns to `/dialysis/during/{sessionId}/P3-10`. P3 and P4
share the same session identifier; P4 reads the session, dashboard, and
intradialytic vitals before rendering post-treatment screens.

## P4 — Post-Dialysis

`PostDialysisPage` owns the P4 step state and renders the dedicated P4 screen
components. Each successful `go(nextScreen)` persists the current draft and,
for a real session, calls the screen-specific API before moving to the next
screen.

| Screen | Component | Save/read operation |
|---|---|---|
| P4-01 Blood Return & Termination | `P401BloodReturnTermination` | `terminateSession` |
| P4-02 Vascular Access Hemostasis | `P402VascularAccessHemostasis` | `saveHemostasis` |
| P4-03 Post-Dialysis Vitals & Assessment | `P403PostDialysisVitals` | `savePostDialysisVitals` |
| P4-04 Treatment Outcome Summary | `P404TreatmentOutcomeSummary` | `getTreatmentOutcome`, `calculateKtV`, `saveTreatmentOutcome` |
| P4-05 Medication & Follow-up | `P405MedicationFollowUp` | `getSessionMedications`, `saveFollowUp` |
| P4-06 Machine Disinfection & Turnover | `P406MachineDisinfectionTurnover` | `getMachineReadinessSummary`, `saveMachineCleaning` |
| P4-07 Infection Control & Waste | `P407InfectionControlWaste` | `saveInfectionControlPost` |
| P4-08 Patient Discharge | `P408PatientDischarge` | `getDischargeReadiness`, `saveDischarge` |
| P4-09 Documentation & Sign-off | `P409DocumentationSignOff` | `saveSessionDocumentation`, sign-off APIs |
| P4-10 Session Complete | `P410SessionComplete` | `getCompleteSummary`, feedback save, `closeSession` |

The P4 request wrappers are centralized in
[postDialysisApis.js](/home/arcticarc/Projects/kifayti-webapp1/src/ApiCalls/postDialysisApis.js:4).
P4-10 invokes `onCompleted` when embedded; otherwise it navigates to
`/dialysis/sessions` after closure.

## Offline drafts and persistence

P3 drafts use `localStorage` keys in the form
`during-dialysis-draft:{sessionId}`. P4 drafts use the equivalent P4 draft key
inside `PostDialysisPage`. P3 also persists session and patient context for
refresh/stage-bar navigation.

The repository contains `src/cache/encryptedPageCache.js`, but the dialysis
workflow components shown above write directly to browser storage. This
documentation therefore does not claim that dialysis drafts are encrypted at
rest. The compliance requirements document identifies this as an unresolved
implementation item that needs a storage-layer decision.

## Tests covering the workflow

Relevant existing tests include:

- `src/__tests__/dialysisRouteAccess.test.js` — route role configuration.
- `src/__tests__/p2SessionIdWiring.test.js` — P2 session-ID resolution and
  bed-assignment response extraction.
- `src/__tests__/dialysisQueue.test.js` — queue behavior.
- `src/__tests__/preDialysisDashboard.test.js` — P2-03 data behavior.
- `src/__tests__/patientVerification.test.js` — P2-04 behavior.
- `src/__tests__/vitalsMeasurements.test.js` — P2-05 behavior.
- `src/__tests__/patientAssessment.test.js` — P2-06 behavior.
- `src/__tests__/p3Vitals.test.js`, `p3Alarms.test.js`, and
  `p3SessionIdFix.test.js` — P3 behavior and session handling.
- `src/__tests__/p212StartDialysisChecklist.test.js` — P2-12 checklist.
- `src/__tests__/p403PostDialysisVitals.test.js`, `p408PatientDischarge.test.js`,
  and `p410SessionComplete.test.js` — P4 behavior.

## Known implementation boundaries

1. **P1 is unmapped.** No source-level P1 workflow exists in this repository.
2. **Consent and anonymization are not implemented in this frontend mapping.**
   The Part 2 requirements document describes organization-scoped consent and
   Kifayti-level anonymization, but no corresponding frontend API/model was
   found during this documentation pass.
3. **Frontend role gates are not data authorization.** API enforcement must be
   treated as authoritative.
4. **Draft encryption is not evidenced by the workflow code.** Direct
   `localStorage` writes are visible in P3/P4 code.
5. **P2-02 is not on the default queue path.** The component exists, but queue
   selection currently falls through to P2-04.
6. **Some P3/P4 values are presentation defaults or preview fallbacks.** A
   real session should be opened from P2-12 so session-backed reads and writes
   are used.

## Source specifications

- [Part 2 screen specification](/home/arcticarc/Projects/kifayti-webapp1/docs/dialysis_docs/P2-1,2/Part2_Screens_P2-01_to_P2-12_FINAL_v2.md)
- [Part 2 change requirements](/home/arcticarc/Projects/kifayti-webapp1/docs/dialysis_docs/P2-1,2/Part2_Change_Requirements_Document.md)
- [Part 3 screen specification](/home/arcticarc/Projects/kifayti-webapp1/docs/dialysis_docs/P3/Part3_Screens_P3-01_to_P3-10_FINAL_v4.md)
- [Part 4 screen specification](/home/arcticarc/Projects/kifayti-webapp1/docs/dialysis_docs/P4/Part4_Screens_P4-01_to_P4-10_FINAL_v4.md)
- [Whole-workflow navigation plan](/home/arcticarc/Projects/kifayti-webapp1/docs/plans/2026-08-15-dialysis-workflow-pre-during-post.md)
