# Kifayti WebApp — Codebase Deep Dive

## Purpose

This is the starting point for understanding the whole repository. It combines
the former human-focused and LLM-focused deep dives into one source-oriented
map. Paths below are implementation locations verified in the current checkout.

## Repository at a glance

Kifayti is a React single-page application using Create React App, React Router,
Redux Toolkit, Axios, Material UI, Reactstrap, Recharts, and a custom design
system. It supports general healthcare operations and a dialysis-center module.

This checkout contains the frontend only. It does not contain the backend
service, database migrations, Dockerfile, or compose file. The frontend must be
configured against a reachable API environment.

The application is organized around four layers:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Bootstrap | `src/index.js`, `src/App.js` | React root, Redux provider, router, global error handling, logout, toaster, and error boundary |
| Navigation | `src/routes/`, `src/layouts/` | Route constants, lazy page loading, layout composition, redirects, and access guards |
| Features | `src/pages/`, `src/components/`, `src/hooks/` | Screens, workflow components, charts, forms, tables, and feature state |
| Integration | `src/ApiCalls/`, `src/helpers/`, `src/cache/` | HTTP calls, auth headers, response handling, cache invalidation, notifications, and shared utilities |

## Runtime flow

```text
src/index.js
  -> Redux Provider + global error listeners
  -> src/App.js
  -> AppErrorBoundary + AppLogout + BrowserRouter
  -> src/routes/index.jsx
  -> MainLayout for protected routes
  -> ProtectedRoute + RoleGuard
  -> lazy-loaded route/page
  -> ApiCalls module -> axiosInstance -> configured API server
```

`src/constants/constants.js` defines the API base URL from
`REACT_APP_API_SERVER_URL`, with the repository's fallback server URL used when
the variable is absent. `src/helpers/axios/axiosInstance.js` attaches the
`localStorage` bearer token, applies request pacing, invalidates affected page
caches after mutations, normalizes errors, and redirects on unauthorized
responses.

Most code uses `REACT_APP_API_SERVER_URL`. A dialysis queue path also contains a
direct `import.meta.env.VITE_API_URL` lookup before falling back to the shared
client; inspect that path if the queue behaves differently from other API calls.

## Access model

Access is enforced in two layers:

1. `ProtectedRoute` checks for `localStorage.token`, loads role/permission data
   through `identifyRole`, dispatches `setPermissions`, and calls
   `canAccessRoute`.
2. `RoleGuard` in `src/routes/index.jsx` applies explicit role-name limits to
   routes that need them.

The permission state is in `src/redux/permissionSlice.js`; the active Redux
store currently contains `permission` and `theme` slices in
`src/app/store.js`. Do not assume an `auth` slice exists when changing layout
or page code.

## Primary navigation map

The single source of route paths is `src/routes/routeConstants.js`. Route trees
are composed in `src/routes/index.jsx` from:

- `patientRoutes.jsx` — patients and patient-scoped resources.
- `readingRoutes.jsx` — daily and dialysis readings/imports.
- `userRoutes.jsx` — admins, doctors, roles, programs, and profile questions.
- `settingsRoutes.jsx` — language, password, parameters, ailments, and logs.
- `medicalRoutes.jsx` — medical route extension point.
- `dialysisRoutes.jsx` — dialysis dashboard, inventory, sessions, appointments,
  patients, billing, during-dialysis, and post-dialysis pages.

Legacy URLs are intentionally redirected in `getLegacyRedirectRoutes()`.
Preserve those redirects unless external links and stored bookmarks have been
migrated and verified.

## Feature ownership

| Domain | Main implementation locations |
| --- | --- |
| Patients and profiles | `src/pages/patient/`, `src/pages/userprofile2/`, patient route helpers |
| Daily/dialysis readings | `src/pages/dailyReadings/`, `src/pages/dialysisReadings/`, chart clusters under `src/components/Linechart/`, `linechartlab/`, and `linecomponent-sys-dys/` |
| Administration | `src/pages/adminManagement/`, `src/pages/profileQuestion/`, `src/pages/language/`, `src/pages/alimentMaster/` |
| Communication | `src/pages/adminchat/`, `doctorChat/`, `chats/`, `AIChat/`, and `contactus/` |
| Reports and audit | `src/pages/doctorReport/`, `src/pages/kfre/`, `src/pages/AuditLogs/` |
| Dialysis operations | `src/pages/dialysis/`, `src/components/BedManagement/`, `src/ApiCalls/dialysisSessionApis.js`, `preDialysisApis.js`, `postDialysisApis.js`, and `dialysisTechnicianApis.js` |
| Shared UI | `src/component-library/`, `src/design-system/`, `src/Styles/`, and shared table/modal components |

## High-risk change zones

Chart components and central administration pages are large, shared, or both.
Read callers and page-level behavior before changing:

- `src/components/linecomponent-sys-dys/LineChartComponentSys.jsx`
- `src/components/Linechart/Linechart_Dialysis/LineChartDialyisisSys.jsx`
- `src/components/Linechart/Linechart_Dialysis/LineChartDialysis.jsx`
- `src/components/Linechart/LineChartComponent.jsx`
- `src/components/linechartlab/LineChartComponentLab.jsx`
- `src/pages/adminManagement/DoctorManagement/index.jsx`

Prefer a narrow, behavior-preserving change. Keep route constants, permission
names, API response envelopes, and legacy redirects stable unless the change
explicitly includes a migration.

## Efficient reading order

1. `package.json`, `src/index.js`, and `src/App.js`.
2. `src/routes/routeConstants.js` and `src/routes/index.jsx`.
3. `src/helpers/ProtectedRoute.jsx`, `src/helpers/permissions.js`, and
   `src/redux/permissionSlice.js`.
4. The route module and page for the feature being changed.
5. The matching `src/ApiCalls/` module and its tests.
6. The relevant canonical document below.

## Documentation source map

- Full endpoint detail: `API_DOCS_FULL.md`, `API_DOCS_LLM.md`, and
  `HIMS-Inventory-Backend-API-Documentation.md`.
- Screen-level dialysis requirements: `dialysis_docs/P2-1,2/`, `P3/`, and
  `P4/`.
- Existing workflow implementation notes:
  `DIALYSIS_WORKFLOW_CODE_DOCUMENTATION.md`.
- Historical file catalog and summaries are retained under `archive/legacy/`.
