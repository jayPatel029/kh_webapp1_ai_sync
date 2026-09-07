# Kifayti WebApp Deep Dive (Human-Focused)

## 1) Executive Summary

Kifayti is a **React + Redux Toolkit** healthcare operations web app with role-based access control and a broad feature surface across patient management, readings, prescriptions, alarms, chat, reports, settings, and master data workflows.

The codebase is in an active refactor phase where:
- route paths were modernized while preserving legacy URLs via redirect shims,
- table/modal UI duplication was reduced through unified wrappers,
- a design-system/component-library layer is being adopted incrementally.

This repository snapshot contains **370 files** (excluding `node_modules` and build outputs) with these major code concentrations:
- `src/pages/**`: route-level feature implementations
- `src/components/**`: reusable and workflow components
- `src/ApiCalls/**`: backend communication layer
- `src/routes/**`: centralized routing and guard composition

---

## 2) Runtime Architecture

## 2.1 Bootstrapping

1. `src/index.js`
   - Creates React root
   - Wraps app with Redux `Provider`
2. `src/App.js`
   - Injects global CSS
   - Wraps with `AppLogout` session wrapper
   - Mounts `BrowserRouter`
3. `src/routes/index.jsx`
   - Builds route tree with `useRoutes`
   - Lazy-loads pages
   - Applies auth + permission guard wrappers

## 2.2 Route and Access Model

The route stack uses layered checks:
- `ProtectedRoute` (`src/helpers/ProtectedRoute.jsx`)
  - validates token presence
  - fetches role/permissions via `identifyRole`
  - maps route names to permission bitfields
- `RoleGuard` (`src/routes/index.jsx`)
  - enforces allowed role names on selected routes

A major design choice here is **backward compatibility with legacy URLs** via `getLegacyRedirectRoutes()` in `src/routes/index.jsx`, translating old path shapes to current route constants in `src/routes/routeConstants.js`.

## 2.3 Layout System

`src/layouts/MainLayout.jsx` is the protected-layout shell:
- fixed sidebar + top navbar
- route-aware sidebar hiding for public/auth routes
- cross-tab synced sidebar collapse state using `localStorage` events

---

## 3) State Management and Security Model

## 3.1 Store Composition

`src/app/store.js` includes:
- `permission` slice (`src/redux/permissionSlice.js`)
- `theme` slice (`src/redux/themeSlice.js`)

## 3.2 Permission Encoding

`permissionSlice` decodes bit-packed permission fields into booleans (`view/edit/delete`) per domain.

Important behavior:
- route-level authorization is keyed by route name + permission map
- Admin/PSadmin are granted patient-route bypass logic in `ProtectedRoute`

Note for maintainers: there are repeated assignments near the tail of `setPermissions` for doctor reports/feedback that overwrite `canViewUserProgramSelection` aliases; this is a likely maintainability hotspot and should be reviewed before expanding permission scope.

## 3.3 API Transport

`src/helpers/axios/axiosInstance.js` configures axios and auto-attaches bearer token from `localStorage` in request interceptor.

---

## 4) Feature Domains and Their Code Locations

## 4.1 Patients and Profile-Centric Workflows

Primary routes and modules:
- `src/routes/patientRoutes.jsx`
- `src/pages/patient/**`
- `src/pages/userprofile2/**`
- patient sub-resources mounted under `/userProfile/:id/*`:
  - alarms, parameters, prescriptions, labs, diet, requisitions, chat

## 4.2 Readings (Daily + Dialysis)

Main route module:
- `src/routes/readingRoutes.jsx`

Main pages:
- `src/pages/dailyReadings/**`
- `src/pages/dialysisReadings/**`

Large analytical/chart components live in:
- `src/components/Linechart/**`
- `src/components/linechartlab/**`
- `src/components/linecomponent-sys-dys/**`

These include several very large files (1K–1.6K LOC) and represent high-risk refactor zones.

## 4.3 User/Admin/Roles Management

`src/routes/userRoutes.jsx` maps:
- admins, doctors, roles
- user program selection
- profile questions

Key pages:
- `src/pages/adminManagement/**`
- `src/pages/userProgramSelection/**`
- `src/pages/profileQuestion/**`

## 4.4 Settings and Masters

`src/routes/settingsRoutes.jsx` maps:
- language, password, parameters
- logs (aggregate/patient/doctor)
- ailment master

Pages:
- `src/pages/language/index.jsx`
- `src/pages/changePassword/ChangePassword.jsx`
- `src/pages/AuditLogs/**`
- `src/pages/alimentMaster/**`

## 4.5 Dashboards, Communication, and Support

- `src/pages/adminDashboard/**`
- `src/pages/doctorDashboard/**`
- `src/pages/adminchat/**`
- `src/pages/doctorChat/**`
- `src/pages/contactus/**`
- `src/pages/AIChat/AiChat.jsx`

---

## 5) API Layer (src/ApiCalls) at a Glance

Key modules and exported operations:

- `authapis.js`: register/login/role identification/user lookup/update/delete
- `patientAPis.js`: patient CRUD-ish accessors, team fetches, dialysis updates, export checks
- `readingsApis.js`: daily + dialysis readings CRUD and range updates
- `alarmsApis.js`: insert/get/update/delete alarm and reason updates
- `prescriptionApis.js`: prescription CRUD and patient-scoped retrieval
- `chatApis.js`: chat resolution, list retrieval, message send/read
- `questionApis.js`: profile question CRUD
- `languageApis.js`: language CRUD
- `ailmentApis.js`: ailment CRUD
- `contactus.js`: support thread CRUD-ish calls

Some API files still use patterns not captured by simple export scanning (default exports/object exports), so generated maps should be cross-checked with module contents before large-scale changes.

---

## 6) UI System and Styling Strategy

The project combines three styling approaches:
1. legacy/local CSS/SCSS per feature page,
2. Tailwind utility classes + token mapping,
3. custom component library and design-system primitives.

Key system directories:
- `src/component-library/**`
- `src/design-system/**`
- `src/Styles/**`

Refactor docs indicate active migration toward tokenized and unified UI patterns.

---

## 7) Build and Deployment

- Build system: CRA (`react-scripts`)
- Production artifacts: `build/**`
- Dockerized production path: multi-stage `Dockerfile` (Node build + Nginx serve)

Public runtime assets include PDF worker support:
- `public/pdfjs-worker/pdf.worker.min.js`

---

## 8) Repository Metrics and Hotspots

Observed from generated metadata:
- 370 files indexed
- 190 `.jsx`, 63 `.js`, 27 `.md`, 24 `.css`
- dominant categories: pages (127), components (86), API modules (20)

Largest source hotspots include:
- `src/components/linecomponent-sys-dys/LineChartComponentSys.jsx`
- `src/components/Linechart/Linechart_Dialysis/LineChartDialyisisSys.jsx`
- `src/components/Linechart/Linechart_Dialysis/LineChartDialysis.jsx`
- `src/components/Linechart/LineChartComponent.jsx`
- `src/components/linechartlab/LineChartComponentLab.jsx`

These files should be treated as high-impact files for change risk and regression likelihood.

---

## 9) Practical Onboarding Path

For engineers new to this codebase, a recommended reading order:

1. `src/index.js`, `src/App.js`
2. `src/routes/routeConstants.js`, `src/routes/index.jsx`
3. `src/helpers/ProtectedRoute.jsx`, `src/redux/permissionSlice.js`
4. `src/layouts/MainLayout.jsx`
5. One complete feature vertical, e.g. daily readings:
   - route module
   - page container
   - key table/chart components
   - matching `ApiCalls` module

---

## 10) Generated Companion Docs

Use these generated artifacts alongside this narrative deep dive:

- `docs/FILE_BY_FILE_REFERENCE.md` — exhaustive file index with kind, size, lines, and inferred purpose
- `docs/generated-file-catalog.json` — machine-readable full inventory + heuristics
- `docs/generated-api-map.json` — API export inventory
- `docs/generated-pages-map.json` — page-level file inventory + sizes
- `docs/generated-components-map.json` — component-level file inventory + sizes

These files allow both human maintainers and automation agents to reason about repository scope before making invasive changes.
