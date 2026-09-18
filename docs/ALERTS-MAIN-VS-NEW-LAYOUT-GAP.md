# Alerts / Alarms Gap Report: `main` vs `feature/new_layout`

**Date:** 2026-09-18  
**Baseline:** `main` (commit `56e2f88` — ancestor of current branch)  
**Current:** `feature/new_layout` (HEAD)  
**Method:** Workflow-first comparison (Approach 1)  
**Scope:** Full alerts ecosystem (dashboard alerts, admin/doctor modals, ShowAlarms, app alerts, reading/dialysis alerts, approve/disapprove)

---

## 0) Important baseline note

`feature/new_layout` is **162 commits ahead** of `main`; `main` has **0** unique commits. This is not “main has more alerts code.” Current has *more files and APIs*, but several **logical workflows from main are missing, replaced, or half-wired** in the new skin. That mismatch is what feels like “alerts is less implemented.”

| Metric | `main` | Current |
|--------|--------|---------|
| Alert/alarm-named source files | ~16 | ~25+ |
| Admin inbox UX | Flat doctor/patient lists + **click → navigate by category** | Patient cards + **category modals** |
| Doctor alerts home | `DoctorContainer` inside `AdminDashboard` | Separate `/dashboard/doctor` |
| Category → destination routing | Present (`AdminContainer.actionFunc`) | **Absent** |

---

## 1) Ecosystem map

There are **two related domains**:

| Domain | Meaning | Primary surfaces |
|--------|---------|------------------|
| **Alerts** | Notifications / inbox items for admin & doctor (enrollment, Rx, lab, chat, reading thresholds, etc.) | Admin dashboard, Doctor dashboard, AlertModal, ApprovePrescriptionModal, app alerts, chat |
| **Alarms** | Patient-scheduled reminders (dialysis, health reading, diet, prescription) | `ShowAlarms`, Alarm/Edit/Doctor modals, `alarmsApis` |

Cross-links: creating a **Prescription** alarm also posts `/alerts/newPrescriptionAlarm`; approving Rx can go through either alarm `updateReason` or alert `approveAlert` / `approveOrDisapprovePrescription`.

Data sources (from `docs/ALERTS-FRONTEND-GUIDE.md`):

- Core: `/api/alerts/*`, `/api/sortAlerts/*`
- Reading: `/api/dailyAlerts/*` + `readingalerts` / `alertsread`
- App: `/api/app/appAlerts/insertAlert`
- DT inventory: `/api/dt/alerts*`
- Alarms: `/api/alarms/*`

---

## 2) Workflow comparison

Legend: **Same** · **Changed** · **Missing on current** · **Broken / incomplete on current** · **New on current (not on main)**

---

### W1 — Admin alerts inbox

#### On `main`
- Entry: `/` → `AdminDashboard` → `AdminContainer` (non-doctor).
- Fetch:
  - `GET /alerts/byType/patient`, `GET /alerts/byType/doctor`
  - Non-doctors also `getAlerts()` → `GET /sortAlerts/{userId}`
- Display: two columns — Doctor Alerts + Patient Alerts (`UserCard` per alert).
- On click (`actionFunc`):
  1. Persist `alarmId` / `labReportId` / `requisitionId` in `localStorage` when present
  2. Mark read via `PUT /alerts/updateIsRead` (handles `missedAlertId`)
  3. **Navigate by category**, e.g.:

| Category / condition | Destination |
|----------------------|-------------|
| New Enrollment / New Program | `/patient/{id}` |
| Doctor Message to Admin + chatId | `/adminChat/{id}` |
| New Prescription / Not Viewed / New Prescription Alarm | `/userPrescription/{id}/{prescriptionId}` |
| Prescription Disapproved | `/showAlarms` or `/ShowAlarms/{id}` |
| New Lab Report | `/UserLabReports/{id}` |
| New Feedback / Contact Us | `/contactus/{contactUsId}` |
| New Program Enrollment / Change In Program | `/userProgramSelection/{id}` |
| Delete Account / Delete patient Alert | `/patient/{id}` |

#### On current
- Entry: `/dashboard` → `AdminDashboard` (live page; does **not** use `useAdminDashboardData`).
- Fetch: `getAlerts()` / doctor path `getDoctorSortAlerts`; group with `groupAlertsByPatient`; chat alerts stripped (`!isChatAlert`).
- Display: patient cards + tabs (All / Approve Prescription / Comments / Alerts / Dialysis).
- On action (`handleAction`): open typed modal via `localStorage` (`alertAlerts` / `prescriptionAlerts`). **`type === "view"` is a no-op.**
- **No category → page navigation** anywhere under `src/pages/adminDashboard/`.

#### Verdict

| Aspect | Status |
|--------|--------|
| Fetch sorted alerts | **Same** intent (`/sortAlerts`) |
| Patient grouping + category tabs | **New** |
| Mark-read + navigate-by-category | **Missing on current** |
| Open reading/detail modal | **Changed** (modal-first; was doctor-side on main) |
| Chat alerts in admin list | **Changed** (moved/stripped; chats under `/chats/*`) |

#### Needs fix
1. **Restore or redesign destination routing** for enrollment, Rx, lab, program change, contact-us, disapproved Rx → ShowAlarms (main’s core admin workflow).
2. Decide whether card click (“view”) should open profile / deep-link — currently dead.
3. Unify with unused hook stack (`useDashboardData` / `BaseDashboard` / `AlertsPanel`) or delete orphans to avoid two incomplete dashboards.

---

### W2 — Doctor alerts inbox

#### On `main`
- Same `AdminDashboard`; if doctor → `DoctorContainer` (not the stub `/doctorDashboard`).
- Fetch: `GET /alerts/dailyAlerts` capability gate → `GET /sortAlerts/doctor/{id}`; filter out daily/dialysis rows if capability off.
- Per patient: buttons for general alerts (`AlertModal`), dialysis tech (`DialysisTechModal`), prescription approve (`ApprovePrescriptionModal`), comments.
- Closing AlertModal marks reading alerts read: `POST /dailyAlerts/updateisRead`.

#### On current
- Separate route `/dashboard/doctor` → `DoctorDashboard` + `useDoctorDashboardData`.
- Polling (~60s); uses `getDoctorSortAlerts` with admin `getAlerts` fallback.
- **Collapses categories** into one “Alerts” button; prescription/comment/dialysis counts forced to 0.
- Reuses admin `AlertModal` (Consult Doctor / Send Message still admin-oriented).
- Route allows **Dialysis Technician** onto doctor dashboard.

#### Verdict

| Aspect | Status |
|--------|--------|
| Sorted doctor alerts API | **Same** |
| Separate doctor route + new layout | **Changed** |
| Per-category actions (Rx / dialysis / comments) | **Missing / simplified away** |
| DailyAlerts capability filter | Verify — main had explicit gate; confirm current still filters |
| Stub `DoctorDashboard` on main | Replaced by real page (**improved** surface, thinner actions) |

#### Needs fix
1. Restore category affordances on doctor dashboard (or deep-link into admin-equivalent modals with props).
2. Revisit DT role on `/dashboard/doctor`.
3. Prefer props over `localStorage` for modal payloads.

---

### W3 — Doctor AlertModal (reading / important alerts)

#### On `main` and current (largely **Same** logic, relocated)
- File: `main` `adminDashboard/AlertModal.jsx` → current `adminDashboard/components/AlertModal.jsx`.
- Reads `localStorage.alertAlerts`.
- Actions: View Profile, Consult Doctor (`insertAlert`), Send Message, graph/table/image, mark read / delete on current.
- Still contains stub/dead pieces: typo `cosultDoctor` test push; unused `sendMessageDoctor` patterns.

#### Verdict
| Aspect | Status |
|--------|--------|
| Core modal behavior | **Same** (ported) |
| Delete alert API wiring | **New/expanded** on current |
| localStorage coupling | **Same** (fragile) |
| Thumbnail / unused icons | **Broken / incomplete** leftovers |

#### Needs fix
- Pass alerts via props; remove test push; clean dead imports/state.

---

### W4 — Prescription approve / disapprove (alert-centric)

#### On `main`
- `ApprovePrescriptionModal` + `Modal` (reason) in admin dashboard doctor path.
- APIs: `approveAlert`, `approveAllAlerts`, `dissapproveAlert`, `dissapproveAllAlerts`.

#### On current
- **Working copy:** `adminDashboard/components/ApprovePrescriptionModal.jsx` (calls real APIs).
- **Broken parallel:** `components/modals/ApprovePrescriptionModal.jsx` has `// TODO: Implement approve prescription API call` — used by `PatientAlertsByType`.
- Admin card can open prescription modal via localStorage `prescriptionAlerts`.

#### Verdict
| Aspect | Status |
|--------|--------|
| Admin/doctor approve APIs | **Same** (working path) |
| Second ApprovePrescriptionModal | **Broken** |
| PatientAlertsByType using stub modal | **Broken** |

#### Needs fix
- Delete or wire the shared `components/modals` approve modal to the same APIs as admin dashboard.

---

### W5 — Patient ShowAlarms (alarms CRUD + doctor review)

#### On `main`
- Route: `showalarms/:pid`.
- List: `GET /alarms/byPatientId/{pid}`.
- Add: `AlarmModal` → `insertAlarm` (+ `newPrescriptionAlarm` for Prescription).
- Edit: `EditAlarmModal` (non-doctor).
- Delete: confirm + `DELETE /alarms/{id}` (inlined; `alarmsApis.deleteAlarm` unused).
- `DoctorAlarmModal` + `openDoctorModal` / `approveAlarm` **existed but were not hooked to list UI** (already incomplete on main).

#### On current
- Canonical route: `/userProfile/:id/alarms` (+ legacy redirects).
- UI redesigned (`PatientDetailLayout`, `UnifiedListTable`, `BaseAlarmModal`).
- Admin/staff: Add / Edit / Delete when `canManageAlarms` (`!isDoctor`).
- Doctor path: `onEdit` would call `openDoctorModal`, but **`actionButtons={canManageAlarms}`** hides edit for doctors → **DoctorAlarmModal unreachable**.
- SortDropdown can replace table data with transformed rows (shape mismatch risk).
- Dead: `approveAlarm` helper; `EditAlarmModal copy.jsx`; cache fetch commented out.

#### Verdict

| Aspect | Status |
|--------|--------|
| Admin add/edit/delete alarms | **Same** (restyled) |
| Shared BaseAlarmModal | **New** |
| Doctor approve/reject from list | **Broken** (was already dead on main; still dead — worse UX gate) |
| Route consistency | **Improved** (canonical + redirects) |
| Client sort correctness | **Broken / incomplete** |

#### Needs fix
1. For doctors, show an Approve/Review action that opens `DoctorAlarmModal` (do not require `canManageAlarms`).
2. Fix sort to sort source alarm objects, not display rows.
3. Remove `EditAlarmModal copy.jsx` and dead `approveAlarm`.

---

### W6 — App alerts (`insertAlert`)

#### On `main` and current
- `POST /app/appAlerts/insertAlert` via `appAlerts.js`.
- Categories used: `Consult Doctor`, `Send Message` (+ current also Dialysis Weight Variance from dialysis modals).

#### Verdict
| Aspect | Status |
|--------|--------|
| API + primary call sites | **Same** |
| Duplicate export `insertAlertAppApis` | **New** unused twin |
| Dialysis weight variance inserts | **New** |

#### Needs fix
- Deduplicate `insertAlert` / `insertAlertAppApis`.

---

### W7 — Chat / doctor-message-to-admin alerts

#### On `main`
- Admin click on “Doctor Message to Admin” → `/adminChat/{patientId}`.
- Send path: `createMessageAlert` → `POST /alerts/doctorMessageToAdmin` from admin chat (doctor role).

#### On current
- Dashboard strips chat alerts (`isChatAlert` / `includeChats: false`).
- Chat lives under `/chats/*` (`UnifiedChatApp` still fires `createMessageAlert`).
- Admin **no longer** deep-links from inbox to chat by category.

#### Verdict
| Aspect | Status |
|--------|--------|
| Creating message alerts from chat | **Same** |
| Inbox → chat navigation | **Missing on current** |
| Grouping helpers for chats | **New** (`alertGrouping` + GlobalChatsPage) |

#### Needs fix
- Either surface chat alerts in dashboard with navigation, or document chats-only as intentional and remove dead chat branches from admin expectations.

---

### W8 — Reading / daily / dialysis reading alerts

#### On `main`
- Capability: `GET /alerts/dailyAlerts`.
- Mark read: `POST /dailyAlerts/updateisRead` from AlertModal / DialysisTechModal close.
- Mixed into doctor `sortAlerts/doctor` payload (`dailyordia`, graphs, etc.).

#### On current
- AlertModal / dialysis modals still handle reading-style payloads.
- `PatientDialysisAlertModal` **New** for dialysis-category bucket.
- Dialysis manager dashboard also shows technician / inventory alerts (**New** surface).
- `getPatientAlerts` (`GET /dt/patients/:id/alerts`) imported in summary/pre-dialysis hooks but **never called**; pre-dialysis injects **hardcoded stub alerts**.

#### Verdict
| Aspect | Status |
|--------|--------|
| Doctor reading alert modal | **Same** (ported) |
| Dialysis category modal on admin | **New** |
| DT patient alerts API usage | **Missing / stubbed** |
| Inventory alerts on dialysis dashboard | **New** |

#### Needs fix
- Call `getPatientAlerts` (or remove imports); remove hardcoded High K / Low Hb demo alerts from pre-dialysis normalizer.

---

### W9 — PatientAlertsByType (`/alerts`)

#### On `main`
- **Did not exist.**

#### On current
- Lists patients with type chips.
- Prescription → stub/wrong `ApprovePrescriptionModal`.
- **Alerts** and **Technician** buttons have **no `onClick`**.

#### Verdict
| Aspect | Status |
|--------|--------|
| Page existence | **New** |
| Completeness | **Broken / incomplete** |

#### Needs fix
- Wire buttons to same modals as AdminDashboard, or remove the page until ready.

---

### W10 — Orphan “new layout” dashboard scaffolding

| Piece | Status |
|-------|--------|
| `components/dashboard/AlertsPanel.jsx` | References missing `PatientAlertsModal` (import commented; JSX remnant); **no page importers** |
| `pages/dashboard/components/AlertPanel.jsx` | Parallel orphan |
| `pages/dashboard/BaseDashboard.jsx` + twin `useDashboardData` | Not driving live AdminDashboard |
| `helpers/alertsSorting.js` | Dead on both branches (`getAlertData` unused); superseded by server sort + `alertGrouping` |

#### Needs fix
- Finish PatientAlertsModal **or** delete AlertsPanel/AlertPanel/BaseDashboard dead stack.
- Archive or delete `alertsSorting.js` if confirmed unused.

---

### W11 — Side / create-alert flows

| Flow | `main` | Current | Verdict |
|------|--------|---------|---------|
| New requisition alert | `RequisitionModal` → `POST /alerts/newRequisition` | Still present via API helper | **Same** |
| New prescription alert from Rx modal | Commented out | Still mostly API-only | **Same** (incomplete) |
| Delete patient alert | `DeletedList` → `PUT /alerts/deletePatientAlert/:id` | Present | **Same** |
| Program selection `getAlertByCategory` | Present | Present | **Same** |
| Many `create*Alert` exports in `alertsApis` | Fewer / inline axios | Expanded wrappers | **New** wrappers; UI usage still sparse |

---

## 3) Same-as-main checklist (keep / preserve)

These behaviors exist on both sides and should stay working while fixing gaps:

- [x] `GET /sortAlerts/:id` and `GET /sortAlerts/doctor/:id` as inbox sources  
- [x] Prescription alarm create → `insertAlarm` + `newPrescriptionAlarm`  
- [x] Alarm update/delete APIs  
- [x] `approveAlert` / `disapproveAlert` / approve-all / disapprove-all (admin modal path)  
- [x] `insertAlert` for Consult Doctor / Send Message  
- [x] `createMessageAlert` from chat  
- [x] AlertModal reading graphs/tables/images pattern  
- [x] Program selection reading `byCategory` enrollment alerts  
- [x] Deleted patient alert update  

---

## 4) Priority gaps to fix

### P0 — Logical workflow regressions vs main

1. **Admin category → destination navigation** (enrollment, Rx, lab, program, contact, disapproved → alarms, chat). Current modal-only UX dropped this entirely.
2. **DoctorAlarmModal unreachable** for doctors on ShowAlarms (actions gated by `canManageAlarms`).
3. **Dual ApprovePrescriptionModal** — `/alerts` page uses TODO stub.

### P1 — Incomplete new-skin pieces

4. `PatientAlertsByType` Alerts/Technician buttons inert.  
5. `AlertsPanel` / missing `PatientAlertsModal` / unused BaseDashboard stack.  
6. Doctor dashboard category collapse vs main `DoctorContainer` richness.  
7. ShowAlarms sort state corruption risk.

### P2 — Cleanup / consistency

8. `getPatientAlerts` unused + pre-dialysis stub alerts.  
9. Remove `EditAlarmModal copy.jsx`, dead `approveAlarm`, unused `alertsSorting`.  
10. Replace `localStorage` modal handoff with props.  
11. Deduplicate `insertAlertAppApis`.  
12. Align Dialysis Technician routing (admin vs doctor vs dialysis dashboard).

---

## 5) Suggested fix order (workflow-first)

```text
1. Decide product rule for admin inbox:
   A) Restore main-style deep links (optionally + mark read), or
   B) Keep modal-first but add “Open related page” actions per alert type.

2. Fix ShowAlarms doctor review entry point.

3. Consolidate ApprovePrescriptionModal to one working component; fix /alerts page.

4. Either finish or delete AlertsPanel / PatientAlertsByType stubs.

5. Restore doctor category actions (or explicitly accept simplified doctor UX).

6. Cleanup orphans, stubs, localStorage, DT alert API wiring.
```

---

## 6) File inventory (high level)

### Present on both (evolved)

- `src/ApiCalls/alertsApis.js`, `alarmsApis.js`, `appAlerts.js`
- `src/pages/ShowAlarms/*` (Alarm/Edit/Doctor modals, consts)
- `src/helpers/alertsSorting.js` (dead both sides)
- Admin AlertModal (path moved under `components/`)

### Main-only (removed / replaced on current)

- `AdminContainer.jsx`, `DoctorContainer.jsx` (and related SCSS-era layout)
- Flat dual-list admin UX + `actionFunc` navigation
- Stub-only `doctorDashboard/DoctorDashboard.jsx` (replaced by real page)

### Current-only (not on main)

- `helpers/alertGrouping.js`
- `components/dashboard/AlertsPanel.jsx`, `AlertItem.jsx`
- `pages/dashboard/components/AlertPanel.jsx`, `BaseDashboard.jsx`
- `pages/PatientAlertsByType.jsx`
- `adminDashboard/components/PatientAlertCard.jsx`, `PatientDialysisAlertModal.jsx`
- `ShowAlarms/BaseAlarmModal.jsx`
- Expanded `doctorAlert.js` (`getDoctorSortAlerts`)
- Dialysis dashboard alert columns / inventory alerts integration

---

## 7) Bottom line

Current branch is **not missing the entire alerts feature set relative to `main`**. It **replaced** the admin inbox’s primary workflow (click alert → mark read → go to the right page) with a **patient/category modal** model, then left several new surfaces and the doctor alarm-review path **unfinished**. The highest-value work is restoring **destination routing (or equivalent)**, fixing **doctor ShowAlarms review**, and **collapsing duplicate/stub approve + alerts UIs** onto the one working implementation.
