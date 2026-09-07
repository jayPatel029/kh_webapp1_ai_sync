# Kifayti WebApp — Whole-Codebase Setup Guide

This repository is a React single-page application for Kifayti Health. It
contains patient management, clinical readings, dialysis operations, user and
role management, alerts, chat, reports, clinic management, and shared UI
systems.

The repository contains the frontend only. No backend service, database
migration, Dockerfile, or compose file is present in this checkout. The
frontend must be configured against an already-running or reachable API.

## 1. Requirements

- Node.js and npm.
- Network access to the configured API server.
- An authenticated user account created by the existing backend.
- A browser with JavaScript and local storage enabled.

The `package.json` does not pin a Node.js version. Use the Node.js version
approved by the project environment or CI rather than assuming a version from
the source.

## 2. Install dependencies

From the repository root:

```bash
npm install
```

The application uses Create React App through `react-scripts`. Major runtime
areas include React 18, React Router 6, Redux Toolkit, Axios, Material UI,
Reactstrap, Tailwind CSS, charts, PDF tooling, CSV tooling, and Socket.IO.

## 3. Configure environment variables

Create a local `.env` file in the repository root. `.env` files are ignored by
Git and must not contain committed credentials.

The primary API setting is:

```dotenv
REACT_APP_API_SERVER_URL=https://your-api-host.example/api
```

If this variable is absent, the code uses the repository-defined fallback:

```text
https://api.kifaytihealth.com/api1/api
```

Restart the development server whenever an environment variable changes.

The shared HTTP client is configured in
[src/constants/constants.js](../src/constants/constants.js) and
[src/helpers/axios/axiosInstance.js](../src/helpers/axios/axiosInstance.js).
It:

- creates an Axios client with a 30-second timeout;
- reads the bearer token from `localStorage.token`;
- sends `Authorization: Bearer <token>` when a token exists;
- spaces requests to protect the API;
- normalizes errors;
- clears caches and redirects to `/doctorLogin` on HTTP 401.

### Environment configuration caveat

Most of the application uses `REACT_APP_API_SERVER_URL`. The dialysis queue
also contains a direct `import.meta.env.VITE_API_URL` lookup before falling
back to the shared API client. This repository is configured as a React
Scripts application, so `REACT_APP_API_SERVER_URL` is the authoritative
configuration for the main API client. If the dialysis queue cannot load
patients, inspect that direct lookup and its fallback path.

## 4. Start the application

```bash
npm start
```

Open the URL printed by React Scripts. The application entry graph is:

```text
src/index.js
  → src/App.js
  → src/routes/index.jsx
  → route modules and lazy-loaded pages
```

The application is wrapped by:

- Redux `Provider` using `src/app/store.js`;
- `AppErrorBoundary` for render errors;
- `AppLogout` for session/logout behavior;
- `BrowserRouter` for client-side routing;
- the shared application toaster.

## 5. Authentication and authorization

Use the existing login pages rather than manually writing tokens:

```text
/login
/doctorLogin
/forgotpassword
```

Protected routes require `localStorage.token`. `ProtectedRoute` calls the
backend role-identification endpoint, hydrates the Redux permission state, and
checks route permissions. Route modules can then apply a second role-name
guard.

Relevant files:

- [src/helpers/ProtectedRoute.jsx](../src/helpers/ProtectedRoute.jsx)
- [src/ApiCalls/authapis.js](../src/ApiCalls/authapis.js)
- [src/redux/permissionSlice.js](../src/redux/permissionSlice.js)
- [src/app/store.js](../src/app/store.js)
- [src/routes/index.jsx](../src/routes/index.jsx)

The Redux store currently contains:

```text
permission — role and route capability state
theme      — theme state
```

Permission bitfields are decoded by the permission slice. Admin and PSadmin
handling is applied by the route permission logic where configured.

## 6. Main application areas

| Area | Primary location | Purpose |
|---|---|---|
| Application shell | `src/App.js`, `src/layouts/` | Global providers, layout, errors, and navigation |
| Routing | `src/routes/` | Route constants, route trees, guards, and redirects |
| API layer | `src/ApiCalls/` | Axios-backed endpoint wrappers |
| Shared components | `src/components/` | Tables, charts, navigation, modals, patient UI, and utilities |
| Component library | `src/component-library/` | Reusable inputs, layout, navigation, feedback, and primitives |
| Design system | `src/design-system/`, `src/Styles/` | Tokens, CSS variables, and shared styling |
| State | `src/redux/`, `src/app/` | Redux store and slices |
| Hooks | `src/hooks/` | Reusable data fetching and feature behavior |
| Patient workflows | `src/pages/patient/`, `src/pages/userprofile2/` | Patient list, profile, and patient-scoped modules |
| Dialysis | `src/pages/dialysis/`, `src/pages/dialysisReadings/` | Dialysis operations and readings |
| Administration | `src/pages/adminDashboard/`, `src/pages/adminManagement/` | Admin dashboard, users, roles, and operational management |
| Clinical data | `src/pages/dailyReadings/`, `src/pages/labreports/`, `src/pages/UserLabReports/` | Readings, labs, imports, and reports |
| Communication | `src/pages/chat/`, `src/pages/chats/`, `src/pages/doctorChat/`, `src/pages/adminchat/` | Patient, doctor, admin, and global chat flows |
| Tests | `src/__tests__/` | Jest and Testing Library coverage |

## 7. Important route groups

Path constants are centralized in
[src/routes/routeConstants.js](../src/routes/routeConstants.js). Common entry
points include:

```text
/dashboard
/patients
/userProfile/:id
/readings/daily
/readings/dialysis
/users
/users/admins
/users/doctors
/users/roles
/settings
/reports
/alerts
/support
/clinic
/ai-chat
/dialysis/dashboard
/dialysis/patients
/dialysis/during/:sessionId/:screenId
/dialysis/post/:sessionId/:screenId
```

Legacy paths are redirected in `getLegacyRedirectRoutes()` in
[src/routes/index.jsx](../src/routes/index.jsx). Preserve those redirects when
changing route names unless external links have been migrated.

## 8. API integration model

API wrappers live under `src/ApiCalls/` and generally import the shared
`axiosInstance` and `server_url`. Common API families include:

- authentication and roles: `authapis.js`;
- patients and patient assignments: patient/admin/doctor API modules;
- clinic, organization, appointments, shifts, and billing:
  `clinicApis.js`;
- beds and isolation: `bedManagementApis.js`;
- daily and dialysis readings: readings and remaining API modules;
- alarms and alerts: `alarmsApis.js` and `alertsApis.js`;
- chat: `chatApis.js`;
- dialysis session workflow: `preDialysisApis.js`,
  `dialysisSessionApis.js`, and `postDialysisApis.js`;
- uploads and documents: `dataUpload.js` and related modules.

When adding or changing an API wrapper:

1. preserve the existing endpoint path and response envelope;
2. preserve bearer-token behavior through `axiosInstance`;
3. check all callers before renaming an exported function;
4. update the relevant test and documentation when the public behavior changes.

## 9. Dialysis workflow setup

The dialysis workflow is documented separately in:

- [Dialysis workflow setup guide](./DIALYSIS_WORKFLOW_SETUP_GUIDE.md)
- [Dialysis code-level documentation](./DIALYSIS_WORKFLOW_CODE_DOCUMENTATION.md)

The short version is:

```text
/dialysis/patients
  → P2-12 Start Dialysis
  → /dialysis/during/{sessionId}/P3-01
  → P3-10 Treatment Completion
  → /dialysis/post/{sessionId}/P4-01
  → P4-10 Session Complete
```

The `sessionId` must remain distinct from `patientId` throughout the workflow.

## 10. Styling and UI development

The codebase uses several styling layers:

- component-library primitives and composites;
- Material UI components;
- Reactstrap and third-party component styles;
- Tailwind utility classes;
- CSS, SCSS, and CSS modules/stylesheets;
- design tokens in `src/design-system/` and `src/Styles/`.

Tailwind scans:

```text
src/**/*.{html,js,jsx}
```

Before adding a new UI primitive, check
[src/component-library](../src/component-library) and
[docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## 11. Test and build commands

Run the test suite in non-watch mode:

```bash
npm test -- --watchAll=false
```

Run one test file:

```bash
npm test -- --watchAll=false src/__tests__/dialysisRouteAccess.test.js
```

Create a production build:

```bash
npm run build
```

The build output is written to `build/`, which is ignored by Git.

The available package scripts are:

```text
npm start      Start the development server
npm test       Run Jest through React Scripts
npm run build  Create a production bundle
npm run eject  Eject Create React App configuration; irreversible
```

Run the full suite and build after changes to routing, shared API behavior,
authentication, configuration, or application-wide components.

## 12. Production serving

This checkout has no production server configuration. `npm run build` creates
static assets that must be served by the deployment environment. Configure the
deployment platform to:

1. run the build with the intended `REACT_APP_API_SERVER_URL`;
2. serve the generated `build/` directory;
3. provide SPA fallback routing to `index.html` for direct client-route loads;
4. keep API credentials and user tokens out of the build and source repository.

The existing project summary contains an illustrative Docker/Nginx pattern,
but no Dockerfile is present in this repository. Treat that section as a
deployment example, not as a runnable repository command.

## 13. Common troubleshooting

| Symptom | Action |
|---|---|
| API requests use the wrong host | Set `REACT_APP_API_SERVER_URL`, restart `npm start`, and inspect the browser network tab. |
| Redirect to `/doctorLogin` | Check that `localStorage.token` exists and has not expired. |
| Redirect to `/login` after authentication | Confirm the backend role and the route's permission mapping. |
| Empty patient or clinical screens | Check API response status, response envelope, and authenticated role. |
| Stale patient/session data | Clear application storage for the test browser and sign in again. |
| Direct route returns a server 404 in production | Configure the host to fall back unknown frontend paths to `index.html`. |
| Tests fail after dependency changes | Remove and reinstall dependencies only if needed, then rerun the full suite. Do not delete lockfile changes without review. |
| Build fails on a changed page | Fix the first compiler error, then rerun `npm run build`; later errors may be cascading. |

## 14. Security and data handling

- Never commit `.env` files, access tokens, passwords, or API keys.
- Do not use production patient data for local development or screenshots.
- Browser local storage contains authentication and workflow state; use a
  dedicated development browser profile.
- Frontend role guards improve user experience but do not replace backend
  authorization.
- Review API payloads and logs before exposing patient identifiers in debug
  output.

## 15. Documentation map

Use these documents by task:

- [Codebase deep dive](./CODEBASE_DEEP_DIVE.md) — architecture and safe
  code-navigation contract.
- [API reference](./API_REFERENCE.md) — endpoint-oriented API documentation.
- [Architecture and features](./ARCHITECTURE_AND_FEATURES.md) — broader
  architecture and feature ownership.
- [Design system](./DESIGN_SYSTEM.md) — visual tokens and UI conventions.
- [Dialysis setup guide](./DIALYSIS_WORKFLOW_SETUP_GUIDE.md) — dialysis-only
  setup and verification.
- [Dialysis code documentation](./DIALYSIS_WORKFLOW_CODE_DOCUMENTATION.md) —
  source-level dialysis mapping.
