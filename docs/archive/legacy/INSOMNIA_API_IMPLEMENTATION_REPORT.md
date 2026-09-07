# Insomnia YAML → Codebase Implementation Report

Generated on: 2026-03-14

## Global summary
- Insomnia endpoints (all methods): **274**
- Implemented endpoints discovered in `src/ApiCalls/*.js`: **283**
- Missing endpoints (in Insomnia but not found in `ApiCalls` by normalized match): **0**
- Extra endpoints (in code but not in Insomnia normalized set): **9**

> Normalization applied: parameter placeholders (`:id`, `${id}`) mapped to `{param}`, plus aliases (`app_apis→app`, `alarmsRouter→alarms`, `adminPatient→assignedAdmin`, `doctorPatient→assignedDoctor`, `doctors→doctor`, `chatRouter→chat`).

## Mutation-body validation (POST/PUT/PATCH)
- Checked mutation routes with Insomnia counterparts: **155**
- Potential body issues: **0**

- No body mismatches detected in parsed inline-object mutation calls.

## Missing endpoints (normalized)

- None

## Per-page/module report (`src/ApiCalls`)

| Module | Total Calls | Matched to Insomnia | GET | POST | PUT | PATCH | DELETE | Mutation body ok | Mutation warnings |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `GetComments.js` | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| `adminDashApis.js` | 9 | 9 | 7 | 2 | 0 | 0 | 0 | 2 | 0 |
| `adminPatientApis.js` | 3 | 3 | 1 | 1 | 0 | 0 | 1 | 1 | 0 |
| `ailmentApis.js` | 6 | 6 | 3 | 1 | 1 | 0 | 1 | 2 | 0 |
| `ailmentPatientApis.js` | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `alarmsApis.js` | 10 | 10 | 3 | 3 | 3 | 0 | 1 | 6 | 0 |
| `alertsApis.js` | 25 | 25 | 5 | 12 | 7 | 0 | 1 | 19 | 0 |
| `analyticsApis.js` | 5 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 |
| `appAlerts.js` | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| `appApis.js` | 45 | 43 | 2 | 43 | 0 | 0 | 0 | 42 | 0 |
| `authapis.js` | 23 | 23 | 14 | 5 | 2 | 0 | 2 | 7 | 0 |
| `chatApis.js` | 7 | 7 | 4 | 3 | 0 | 0 | 0 | 3 | 0 |
| `commentApi.js` | 4 | 4 | 0 | 4 | 0 | 0 | 0 | 4 | 0 |
| `contactus.js` | 4 | 4 | 2 | 1 | 0 | 0 | 1 | 1 | 0 |
| `dataUpload.js` | 2 | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 |
| `doctorAlert.js` | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `doctorApis.js` | 9 | 9 | 5 | 2 | 1 | 0 | 1 | 3 | 0 |
| `doctorPatientApis.js` | 3 | 3 | 1 | 1 | 0 | 0 | 1 | 1 | 0 |
| `languageApis.js` | 4 | 4 | 1 | 1 | 1 | 0 | 1 | 2 | 0 |
| `manageparameters.js` | 2 | 2 | 1 | 1 | 0 | 0 | 0 | 1 | 0 |
| `patientAPis.js` | 23 | 19 | 9 | 4 | 8 | 0 | 2 | 10 | 0 |
| `prescriptionApis.js` | 7 | 4 | 2 | 3 | 0 | 0 | 2 | 2 | 0 |
| `questionApis.js` | 8 | 8 | 5 | 1 | 1 | 0 | 1 | 2 | 0 |
| `readingsApis.js` | 13 | 13 | 4 | 5 | 2 | 0 | 2 | 7 | 0 |
| `remainingApis.js` | 80 | 80 | 38 | 32 | 4 | 0 | 6 | 36 | 0 |

## Notes
- `ok-pass-through` means the API function forwards a `payload` object directly; field-level validation then depends on caller payload shape.
- Some unmatched endpoints can be false positives due to non-literal URL construction or duplicate legacy/new route variants.