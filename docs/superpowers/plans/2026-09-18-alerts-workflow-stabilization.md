# Alerts Workflow Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the new-layout alerts/alarms ecosystem fully usable and stable by finishing half-wired flows and restoring main’s navigable inbox logic inside the current UI.

**Architecture:** Keep the current patient-card + category-modal skin. Add a shared alert-destination helper (ported from `main`’s `AdminContainer.actionFunc`, mapped to current `ROUTES`). Use it from Admin/Doctor dashboards and AlertModal rows. Fix ShowAlarms doctor review gating. Collapse duplicate/stub approve UIs onto the working admin approve path. Defer or delete orphan scaffolding (`AlertsPanel` / missing `PatientAlertsModal`) rather than building a third parallel dashboard.

**Tech Stack:** React (CRA/webpack), React Router, Redux permissions, existing `ApiCalls/*`, `helpers/alertGrouping.js`, component-library modals, Sonner toasts.

**Spec:** `docs/ALERTS-MAIN-VS-NEW-LAYOUT-GAP.md`

## Global Constraints

- Do **not** restore the old `AdminContainer` / `DoctorContainer` SCSS UI; extend current `AdminDashboard` / `DoctorDashboard` / modals.
- Prefer current route helpers in `src/routes/routeConstants.js` (`ROUTES.patientAlarms`, `ROUTES.patientPrescriptions`, `ROUTES.patientLabs`, `ROUTES.programDetail` / programs, `ROUTES.chatAdmin`, `ROUTES.userProfile`, `ROUTES.supportTicket`, `ROUTES.PATIENTS`).
- Prefer **props** for modal payloads; keep temporary `localStorage` only where existing modals still require it, then remove in a later task.
- Do **not** add new test files unless the user explicitly asks; verify with manual checklists and existing app flows.
- Do **not** create git commits unless the user explicitly asks to commit.
- Smallest change that restores behavior; no drive-by refactors outside listed files.
- YAGNI: do not implement a new `PatientAlertsModal` unless Tasks 1–5 prove AlertModal cannot cover navigable alerts.

---

## Product rule (locked)

**Hybrid inbox (stable):**

| Alert kind | Behavior |
|------------|----------|
| Prescription approve bucket | Keep modal (`ApprovePrescriptionModal` admin path) |
| Comments bucket | Keep comments modal |
| Dialysis / reading bucket | Keep `PatientDialysisAlertModal` / AlertModal reading UX |
| Navigable system alerts (enrollment, lab, program change, contact/feedback, chat message, Rx disapproved → alarms, delete account) | **Mark read + navigate** (main parity), using current routes |
| Patient card “view” | Navigate to `ROUTES.userProfile(patientId)` |

---

## File map

| File | Responsibility |
|------|----------------|
| `src/helpers/alertNavigation.js` | **Create** — resolve destination + mark-read + navigate |
| `src/pages/adminDashboard/AdminDashboard.jsx` | Wire `view` + navigable alerts; keep category modals |
| `src/pages/adminDashboard/components/AlertModal.jsx` | Per-row “Open” for navigable alerts; clean stubs |
| `src/pages/doctorDashboard/DoctorDashboard.jsx` | Restore category actions via `PatientAlertCard` |
| `src/pages/ShowAlarms/ShowAlarms.jsx` | Doctor review button visible; fix sort mutation |
| `src/components/modals/ApprovePrescriptionModal.jsx` | Wire real approve/disapprove APIs **or** re-export admin modal |
| `src/pages/PatientAlertsByType.jsx` | Use working approve modal; wire Alerts/Technician buttons |
| `src/pages/adminDashboard/components/PatientAlertCard.jsx` | Only if action API needs a new action type |
| `src/helpers/alertGrouping.js` | Optional: export helpers needed by navigation |
| Delete later: `EditAlarmModal copy.jsx`, orphan panel files | Cleanup task |

---

### Task 1: Shared alert navigation helper (main parity → current routes)

**Files:**
- Create: `src/helpers/alertNavigation.js`
- Reference: `docs/ALERTS-MAIN-VS-NEW-LAYOUT-GAP.md` §W1
- Reference: `main` `AdminContainer.actionFunc` category table
- Modify (export if useful): `src/helpers/alertGrouping.js` — only if you need shared blob/category helpers already there

**Interfaces:**
- Consumes: `updateIsReadAlert` from `src/ApiCalls/alertsApis.js`; `ROUTES` from `src/routes/routeConstants.js`
- Produces:
  - `getAlertCategory(alert) → string` (normalize `category` / `type` / `type0` / `message`)
  - `resolveAlertDestination(alert) → { path: string, state?: object } | null`
  - `persistAlertLocalIds(alert) → void` (alarmId / labReportId / requisitionId)
  - `markAlertOpenedIfNeeded(alert) → Promise<void>`
  - `openAlertDestination(alert, navigate) → Promise<boolean>` — persist, mark read, navigate; returns true if navigated
  - `isNavigableSystemAlert(alert) → boolean`

- [ ] **Step 1: Create `src/helpers/alertNavigation.js`**

Implement destination mapping using **current** routes (not main’s old paths):

```javascript
import { updateIsReadAlert } from "../ApiCalls/alertsApis";
import { ROUTES } from "../routes/routeConstants";

const cat = (alert) =>
  String(alert?.category || alert?.type || alert?.type0 || alert?.message || "").trim();

export function getAlertCategory(alert) {
  return cat(alert);
}

export function persistAlertLocalIds(alert) {
  if (alert?.alarmId) localStorage.setItem("alarmId", String(alert.alarmId));
  if (alert?.labReportId) localStorage.setItem("labReportId", String(alert.labReportId));
  if (alert?.requisitionId) localStorage.setItem("requisitionId", String(alert.requisitionId));
}

export async function markAlertOpenedIfNeeded(alert) {
  const category = cat(alert);
  if (category.includes("New Program Enrollment")) return;

  const isClosed =
    alert?.isOpened === 0 ||
    alert?.isOpened === "0" ||
    alert?.isOpened === false;

  if (!isClosed) return;

  if (alert?.missedAlertId) {
    await updateIsReadAlert(alert.missedAlertId);
  }
  if (alert?.id != null) {
    await updateIsReadAlert(alert.id);
  }
}

/**
 * Port of main AdminContainer.actionFunc with current ROUTES.
 * Returns null when the alert should stay in a modal (readings / generic).
 */
export function resolveAlertDestination(alert) {
  if (!alert) return null;
  const category = cat(alert);
  const patientId = alert.patientId || alert.patient_id || alert.pid;

  if (
    patientId &&
    (category === "New Enrollment" || category === "New Program")
  ) {
    return { path: ROUTES.userProfile(patientId) };
  }

  if (
    patientId &&
    (category.includes("Doctor Message to Admin") || category.includes("Admin Chat"))
  ) {
    return { path: ROUTES.chatAdmin(patientId) };
  }

  if (
    patientId &&
    (category === "New Prescription" ||
      category === "Prescription Not Viewed" ||
      category === "New Prescription Alarm")
  ) {
    return { path: ROUTES.patientPrescriptions(patientId) };
  }

  if (patientId && category.replace(/\s+$/, "") === "Prescription Disapproved") {
    return { path: ROUTES.patientAlarms(patientId) };
  }

  if (
    patientId &&
    (category === "Delete patient Alert" ||
      category === "Account Deletion" ||
      category === "Delete Account")
  ) {
    return { path: ROUTES.userProfile(patientId) };
  }

  if (patientId && category === "New Lab Report") {
    return { path: ROUTES.patientLabs(patientId) };
  }

  if (category === "New Feedback" || category === "Contact Us") {
    return { path: ROUTES.supportTicket(alert.contactUsId) };
  }

  if (
    patientId &&
    (category.includes("New Program Enrollment") || category === "Change In Program")
  ) {
    // If programDetail is not patient-scoped in this app, use the patient program
    // selection path already used by patient nav tabs instead.
    return { path: ROUTES.programDetail(patientId) };
  }

  if (alert.redirect && String(alert.redirect).startsWith("/")) {
    return { path: String(alert.redirect) };
  }

  return null;
}

export function isNavigableSystemAlert(alert) {
  return resolveAlertDestination(alert) != null;
}

export async function openAlertDestination(alert, navigate) {
  const dest = resolveAlertDestination(alert);
  if (!dest?.path || typeof navigate !== "function") return false;

  persistAlertLocalIds(alert);
  try {
    await markAlertOpenedIfNeeded(alert);
  } catch (err) {
    console.error("markAlertOpenedIfNeeded failed", err);
  }
  navigate(dest.path, dest.state ? { state: dest.state } : undefined);
  return true;
}
```

Before finishing this task, confirm the patient program-selection URL from patient nav tabs and adjust the enrollment mapping if `ROUTES.programDetail` is wrong.

- [ ] **Step 2: Manually verify destination table**

| Sample category | Expected path pattern |
|-----------------|------------------------|
| `New Lab Report` + patientId `12` | `/userProfile/12/labs` |
| `Prescription Disapproved` + pid | `/userProfile/{id}/alarms` |
| `Doctor Message to Admin` + pid | `/userProfile/{id}/admin-chat` |
| reading alert with `dailyordia` only | `null` (modal) |

- [ ] **Step 3: Pause for commit only if user asks**

---

### Task 2: Wire AdminDashboard hybrid actions

**Files:**
- Modify: `src/pages/adminDashboard/AdminDashboard.jsx` (`handleAction`, imports)
- Modify if needed: `src/pages/adminDashboard/components/PatientAlertCard.jsx`

**Interfaces:**
- Consumes: `openAlertDestination`, `isNavigableSystemAlert` from Task 1
- Produces: working `view` + smarter `alert` action

- [ ] **Step 1: Update `handleAction` in `AdminDashboard.jsx`**

Replace the no-op view and blind modal-open for alerts with:

```javascript
import { openAlertDestination, isNavigableSystemAlert } from "../../helpers/alertNavigation";
import { ROUTES } from "../../routes/routeConstants";

const handleAction = async (patient, type) => {
  if (type === "view") {
    if (patient?.id) navigate(ROUTES.userProfile(patient.id));
    return;
  }

  setSelectedPatient(patient);

  if (type === "prescription") {
    localStorage.setItem(
      "prescriptionAlerts",
      JSON.stringify(patient.prescriptionAlerts || [])
    );
    setModals((prev) => ({ ...prev, prescription: true }));
    return;
  }

  if (type === "comment") {
    setModals((prev) => ({ ...prev, comment: true }));
    return;
  }

  if (type === "dialysis") {
    setModals((prev) => ({ ...prev, dialysis: true }));
    return;
  }

  if (type === "alert") {
    const alerts = patient.alertAlerts || [];
    const navigable = alerts.filter(isNavigableSystemAlert);
    const modalOnly = alerts.filter((a) => !isNavigableSystemAlert(a));

    if (navigable.length === 1 && modalOnly.length === 0) {
      await openAlertDestination(navigable[0], navigate);
      return;
    }

    localStorage.setItem("alertAlerts", JSON.stringify(alerts));
    setModals((prev) => ({ ...prev, alert: true }));
  }
};
```

- [ ] **Step 2: Manual verification checklist (Admin)**

1. Login as Admin.
2. Open `/dashboard`.
3. Click patient name/avatar (“view”) → lands on `/userProfile/{id}`.
4. Click Prescription → admin `ApprovePrescriptionModal` still opens and approve still hits API.
5. Click Alerts when patient has a lab/enrollment-style alert only → navigates to correct page and unread clears after refresh.
6. Click Alerts when patient has reading alerts → AlertModal still opens.

- [ ] **Step 3: Pause for commit only if user asks**

---

### Task 3: AlertModal per-row Open + stub cleanup

**Files:**
- Modify: `src/pages/adminDashboard/components/AlertModal.jsx`

**Interfaces:**
- Consumes: `openAlertDestination`, `isNavigableSystemAlert` from Task 1
- Produces: each navigable row can leave modal to destination; reading rows unchanged

- [ ] **Step 1: Add Open action on each alert row when navigable**

```javascript
import { isNavigableSystemAlert, openAlertDestination } from "../../../helpers/alertNavigation";

{isNavigableSystemAlert(alert) && (
  <button
    type="button"
    onClick={async () => {
      const ok = await openAlertDestination(alert, navigate);
      if (ok) closeModal();
    }}
  >
    Open
  </button>
)}
```

Keep existing graph/table/image controls for reading alerts.

- [ ] **Step 2: Remove or neutralize dead stubs**

- Remove or no-op the hardcoded test `postNotifsPushNotifs` path in `cosultDoctor` if it still fires dummy push.
- Leave Consult Doctor / Send Message using real `insertAlert`.
- Do not expand ThumbnailModal unless already rendered.

- [ ] **Step 3: Manual verification**

1. Open AlertModal with mixed alerts.
2. Reading row → graph/table still works; close still marks daily read if that path exists.
3. Navigable row → Open → correct page; modal closes.
4. Consult Doctor still creates app alert.

---

### Task 4: Doctor dashboard category parity

**Files:**
- Modify: `src/pages/doctorDashboard/DoctorDashboard.jsx`
- Reuse: `src/pages/adminDashboard/components/PatientAlertCard.jsx`
- Reuse: admin modals under `adminDashboard/components/`
- Modify: `src/routes/index.jsx` (doctor dashboard role guard)

**Interfaces:**
- Consumes: same `handleAction` pattern as Task 2; existing doctor fetch / `groupAlertsByPatient`
- Produces: doctor sees prescription / comment / alert / dialysis buttons when counts > 0

- [ ] **Step 1: Stop forcing category counts to 0**

Keep `prescriptionCount`, `commentCount`, `alertCount`, `dialysisCount` from grouping output (same shape AdminDashboard uses).

- [ ] **Step 2: Reuse `PatientAlertCard` + AdminDashboard-style modals**

Copy modal state pattern from AdminDashboard. Prescription approve must use **admin** `ApprovePrescriptionModal.jsx`, not the stub under `components/modals/`.

- [ ] **Step 3: Restrict route roles**

Doctor dashboard guard: **Doctor only**. Dialysis Technician stays on `/dialysis/dashboard`.

- [ ] **Step 4: Manual verification (Doctor)**

1. Login as Doctor → `/dashboard/doctor`.
2. Patient with Rx approve alerts shows Prescription button → approve/disapprove works.
3. Patient with reading alerts opens AlertModal.
4. Navigable system alert Open/navigation works like admin.
5. Dialysis Technician visiting `/dashboard/doctor` is redirected or denied.

---

### Task 5: ShowAlarms — doctor review reachable + sort fix

**Files:**
- Modify: `src/pages/ShowAlarms/ShowAlarms.jsx`
- Check: `src/components/table/UnifiedListTable.jsx`
- Optional delete: `src/pages/ShowAlarms/EditAlarmModal copy.jsx`

**Interfaces:**
- Consumes: existing `openDoctorModal`, `DoctorAlarmModal`, `canManageAlarms`, `isDoctor`
- Produces: doctors can open review UI; sort does not destroy alarm objects

- [ ] **Step 1: Fix action visibility for doctors**

```javascript
const showRowActions = roleReady; // both doctor and staff see actions column
// Add Alarm button: still canManageAlarms only
// Delete: only when canManageAlarms
// Edit/Review: staff → EditAlarmModal; doctor → DoctorAlarmModal

actionButtons={showRowActions}
onEdit={(row) => { /* existing isDoctor branch */ }}
onDelete={canManageAlarms ? (row) => handleDeleteAlarm(row.id) : undefined}
```

If `UnifiedListTable` always shows delete when `onDelete` is passed, omit `onDelete` for doctors.

- [ ] **Step 2: Fix SortDropdown so it sorts source alarms**

Do not `setUserAlarmData(sortedData)` on transformed rows. Sort `userAlarmData` in place by real fields (`dateadded` / `type` — confirm against API payload).

```javascript
onSort={(sortKey) => {
  setUserAlarmData((prev) => {
    const next = [...prev];
    switch (sortKey) {
      case "date_desc":
        next.sort((a, b) => new Date(b.dateadded) - new Date(a.dateadded));
        break;
      case "date_asc":
        next.sort((a, b) => new Date(a.dateadded) - new Date(b.dateadded));
        break;
      case "type_asc":
        next.sort((a, b) => String(a.type).localeCompare(String(b.type)));
        break;
      case "type_desc":
        next.sort((a, b) => String(b.type).localeCompare(String(a.type)));
        break;
      default:
        break;
    }
    return next;
  });
}}
```

- [ ] **Step 3: Remove dead code**

- Delete unused `approveAlarm` if still unreferenced.
- Delete `src/pages/ShowAlarms/EditAlarmModal copy.jsx` if `rg "EditAlarmModal copy"` is empty.

- [ ] **Step 4: Manual verification**

1. Non-doctor staff → Add / Edit / Delete work.
2. Doctor → Review control visible → `DoctorAlarmModal` → approve/reject via `updateReason` → list refreshes.
3. Sort by date/type → rows reorder; edit still finds original alarm by id.
4. Doctor cannot Add Alarm / Delete.

---

### Task 6: Single working Approve Prescription path + `/alerts` page

**Files:**
- Modify: `src/pages/PatientAlertsByType.jsx`
- Modify or retire: `src/components/modals/ApprovePrescriptionModal.jsx`
- Keep as source of truth: `src/pages/adminDashboard/components/ApprovePrescriptionModal.jsx`

**Interfaces:**
- Consumes: working admin approve modal + `approveAlert` / `dissapproveAlert` family
- Produces: `/alerts` chips all functional; no TODO fake success toast

**Preferred approach:** Point `PatientAlertsByType` at the admin approve modal (localStorage `prescriptionAlerts`), matching AdminDashboard.

- [ ] **Step 1: Find importers**

```bash
rg -n "components/modals/ApprovePrescriptionModal|adminDashboard/components/ApprovePrescriptionModal" src
```

Switch stub consumers to the admin modal when possible. Only rewrite the stub if its props API (`isOpen`, `patientId`) is widely required — then call real approve/disapprove APIs (do not use `deletePrescriptionByRoute` as fake disapprove unless product confirms).

- [ ] **Step 2: Wire PatientAlertsByType Alerts + Technician buttons**

- Alerts → same as AdminDashboard alert action (`alertAlerts` + AlertModal / navigation helper)
- Technician → `PatientDialysisAlertModal` with that patient’s dialysis alerts

Ensure grouping populates the same patient fields AdminDashboard uses (`groupAlertsByPatient`).

- [ ] **Step 3: Manual verification**

1. `/alerts` Prescription → approve/disapprove persists after refresh.
2. Alerts button opens modal or navigates.
3. Technician button opens dialysis modal.
4. Admin dashboard approve path unchanged.

---

### Task 7: Cleanup orphans + DT stub alerts

**Files:**
- `src/components/dashboard/AlertsPanel.jsx`
- `src/pages/dashboard/BaseDashboard.jsx`, `src/pages/dashboard/components/AlertPanel.jsx`
- `src/hooks/usePatientSummary.js`, `src/hooks/usePreDialysisDashboard.js`
- `src/ApiCalls/appAlerts.js`

- [ ] **Step 1: Orphan dashboard stack**

```bash
rg -n "AlertsPanel|BaseDashboard|PatientAlertsModal|from './AlertPanel'|from \"./AlertPanel\"" src
```

If zero runtime importers: remove broken `PatientAlertsModal` references or delete dead files. If BaseDashboard is routed: wire to AdminDashboard behavior or unroute it.

- [ ] **Step 2: Pre-dialysis / patient summary alerts**

Remove hardcoded demo High K / Low Hb / Fluid Overload injections. Either call `getPatientAlerts(patientId)` or remove the unused import and keep derived-only alerts without stubs.

- [ ] **Step 3: Deduplicate `insertAlertAppApis`**

If unused twin of `insertAlert`, alias or remove:

```javascript
export const insertAlertAppApis = insertAlert;
```

- [ ] **Step 4: Full smoke matrix**

| Role | Path | Expect |
|------|------|--------|
| Admin | `/dashboard` | view, Rx modal, alert navigate/modal, dialysis, comments |
| Doctor | `/dashboard/doctor` | category buttons + review |
| Doctor | patient alarms | DoctorAlarmModal |
| Staff | patient alarms | CRUD |
| Any | `/alerts` | all chips work |
| DT | dialysis dashboard | inventory/tech alerts still load |
| Pre-dialysis | patient summary | no fake lab alerts |

---

## Execution order

```text
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7
```

Tasks 4 and 5 can run in parallel after Task 3 if needed.

---

## Spec coverage (self-review)

| Gap report item | Task |
|-----------------|------|
| P0 Admin category → destination | 1, 2, 3 |
| P0 DoctorAlarmModal unreachable | 5 |
| P0 Dual ApprovePrescriptionModal / stub | 6 |
| P1 PatientAlertsByType inert buttons | 6 |
| P1 AlertsPanel / PatientAlertsModal orphan | 7 |
| P1 Doctor category collapse | 4 |
| P1 ShowAlarms sort corruption | 5 |
| P2 getPatientAlerts / stub alerts | 7 |
| P2 EditAlarmModal copy / dead approveAlarm | 5 |
| P2 localStorage → props | Partial; full props migration deferred |
| P2 insertAlert duplicate | 7 |
| P2 DT role on doctor dashboard | 4 |

**Deferred follow-up:** full removal of `localStorage` from all modals; new `PatientAlertsModal`; resurrecting dead `alertsSorting.getAlertData`.
