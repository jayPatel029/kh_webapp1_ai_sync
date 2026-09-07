# Kifayti WebApp Deep Dive (LLM-Focused System Map)

## Purpose

This document is a **machine-oriented repository contract** for LLM agents and code automation.
It encodes where logic lives, how to traverse dependencies safely, and how to scope edits in this codebase.

---

## 1) Repository Facts (Current Snapshot)

- Project: React SPA (CRA) with Redux Toolkit and React Router v6
- Indexed files: **370**
- Dominant code types:
  - `.jsx`: 190
  - `.js`: 63
  - `.md`: 27
  - `.css`: 24
- Domain density by heuristic kind:
  - `page`: 127
  - `component`: 86
  - `api`: 20
  - `design-system`: 43
  - `routing`: 7
  - `state`: 3
  - `helper`: 7

Authoritative machine catalogs:
- `docs/generated-file-catalog.json`
- `docs/generated-api-map.json`
- `docs/generated-pages-map.json`
- `docs/generated-components-map.json`

---

## 2) Entrypoint Graph

## 2.1 Boot Graph

`src/index.js` -> `src/App.js` -> `src/routes/index.jsx` -> route modules (`patientRoutes`, `userRoutes`, `readingRoutes`, `settingsRoutes`) -> lazy page modules.

## 2.2 Layout and Guard Graph

- `src/layouts/MainLayout.jsx` wraps all protected children.
- `src/helpers/ProtectedRoute.jsx` performs token + permission checks.
- `src/routes/index.jsx` adds `RoleGuard` for role-name constraints.

Interpretation: route access can fail at either guard layer.

---

## 3) Routing Contract

## 3.1 Single Source of Path Truth

- Paths + path builders: `src/routes/routeConstants.js`
- Route name identifiers: `ROUTE_NAMES` in same file

## 3.2 Route Assembly

- Root assembly: `src/routes/index.jsx`
- Subtrees:
  - `src/routes/patientRoutes.jsx`
  - `src/routes/userRoutes.jsx`
  - `src/routes/readingRoutes.jsx`
  - `src/routes/settingsRoutes.jsx`
  - `src/routes/medicalRoutes.jsx` (currently empty array)

## 3.3 Legacy Compatibility Layer

`getLegacyRedirectRoutes()` in `src/routes/index.jsx` maps old route forms to modern routes. Do not remove redirects unless migration and external links are confirmed complete.

---

## 4) Authorization/Permissions Contract

## 4.1 Token Requirement

Token expected in `localStorage` under key `token`; missing token redirects to `/doctorLogin`.

## 4.2 Permission Hydration

`identifyRole()` from `src/ApiCalls/authapis.js` is called in `ProtectedRoute` and dispatches `setPermissions`.

## 4.3 Bitfield Semantics

`src/redux/permissionSlice.js` decodes integer bit flags into view/edit/delete booleans.
Bit positions:
- view = bit 1
- edit = bit 2
- delete = bit 3

## 4.4 Route Permission Mapping

`permissionMap` in `ProtectedRoute` maps route name keys -> permission property names.
Admin/PSadmin bypass applies to patient-scoped permission key `patients`.

---

## 5) State Contract

Store file: `src/app/store.js`

Active slices:
- `permission`: access control and role capability state
- `theme`: runtime token/theme override state

Note: `MainLayout` references `state.auth?.user`, but `auth` slice is not present in `store.js` in this snapshot.
LLM edits must account for optional chaining and absent auth slice.

---

## 6) API Layer Contract

Directory: `src/ApiCalls/**`

The API layer uses Axios + bearer token header injection from `src/helpers/axios/axiosInstance.js`.

Detected exported API function families:
- auth: register/login/role-identify/user-role retrieval
- patients: list/detail/team/export checks
- readings: daily + dialysis CRUD and range updates
- alarms: insert/get/update/delete
- prescriptions: patient- and id-scoped retrieval + create/delete
- chat: session lookup/list/send/retrieve messages
- question/language/ailment/contactus CRUD flows

When editing API functions:
1. preserve endpoint paths and payload shape,
2. preserve existing response envelope assumptions in callers,
3. check dependent pages via symbol usage before renaming.

---

## 7) Feature Topology (Path-Based)

## 7.1 Route-Level Pages

- `src/pages/adminDashboard/**` admin dashboard and modal workflows
- `src/pages/adminManagement/**` admin/doctor/role management
- `src/pages/patient/**` patient CRUD/list/deletion flow
- `src/pages/userprofile2/**` profile and profile-modal flows
- `src/pages/dailyReadings/**` daily reading list/import/bulk
- `src/pages/dialysisReadings/**` dialysis reading list/import/bulk
- `src/pages/ShowAlarms/**` alarm listing and edit modals
- `src/pages/UserLabReports/**`, `Userprescription/**`, `UserDietDetails/**`, `UserRequisition/**`
- `src/pages/adminchat/**`, `doctorChat/**`, `AIChat/**`
- `src/pages/AuditLogs/**`, `language/**`, `changePassword/**`, `alimentMaster/**`

## 7.2 Shared Component Surface

- `src/components/**` core shared UI/workflow modules
- chart-heavy clusters:
  - `Linechart/**`
  - `linechartlab/**`
  - `linecomponent-sys-dys/**`

## 7.3 Design and Primitive Systems

- `src/component-library/**` primitives/composites
- `src/design-system/**` token and style foundations
- `src/Styles/**` tokens/variables bridge

---

## 8) High-Risk Files for Refactoring

Large and/or central files imply higher breakage probability:
- `src/components/linecomponent-sys-dys/LineChartComponentSys.jsx`
- `src/components/Linechart/Linechart_Dialysis/LineChartDialyisisSys.jsx`
- `src/components/Linechart/Linechart_Dialysis/LineChartDialysis.jsx`
- `src/components/Linechart/LineChartComponent.jsx`
- `src/components/linechartlab/LineChartComponentLab.jsx`
- `src/pages/adminManagement/DoctorManagement/index.jsx`

LLM strategy: prefer additive wrappers, narrow diffs, and behavior-preserving extraction over broad rewrites.

---

## 9) Safe Edit Playbooks for LLM Agents

## 9.1 Adding/Changing a Route

1. Add path constant in `src/routes/routeConstants.js`
2. Add lazy import + subtree entry in proper route module
3. Apply `guard(component, ROUTE_NAMES.X)` mapping
4. Ensure `permissionMap` contains matching routeName key
5. Add legacy redirect only if replacing an existing path

## 9.2 Adding a New Permissioned Screen

1. Extend backend role payload contract if needed
2. Add permission state mapping in `permissionSlice.setPermissions`
3. Add routeName -> permission key in `ProtectedRoute.permissionMap`
4. Update sidebar route config if navigable

## 9.3 Modifying API Contracts

1. Update the relevant file in `src/ApiCalls/`
2. Search usages across pages/components before signature changes
3. Preserve loading/error branching semantics in consuming UI
4. If changed endpoint affects role hydration, validate login/guard flow

---

## 10) Full-Repository Reference for Agents

For complete, per-file context (all 370 files), consume:

1. `docs/FILE_BY_FILE_REFERENCE.md` (human-readable exhaustive index)
2. `docs/generated-file-catalog.json` (machine-parsable metadata)

Recommended machine workflow:
- First load `generated-file-catalog.json`
- Filter by `kind` + path prefix
- Read only affected clusters before edits
- Run localized validation on touched route/page/API slices

This minimizes token usage while preserving high-confidence changes.
