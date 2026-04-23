## Plan: Universal Error Handling + Consistent Toast Feedback — IMPLEMENTED

All 10 steps completed. 22/22 tests passing. 0 lint/compile errors.

Make errors predictable end-to-end by centralizing (1) API error normalization, (2) global user feedback via one toast system, and (3) a top-level React error boundary to prevent “black screens”/red runtime crashes. Then migrate the highest-impact pages off `alert()` / unsafe `error.response.data...` patterns.

**Steps**
1. Define an app-wide error shape + message policy
   - Create a small “error model” (e.g., `ApiError`, `AppError`) and a single `getUserMessage(error)` that returns:
     - Generic copy by default
     - “Safe specifics” only for allowlisted cases (e.g., known validation failures)
2. Centralize Axios error normalization (transport layer)
   - Update `src/helpers/axios/axiosInstance.js` to add a response interceptor that converts any Axios error into your normalized `ApiError` (handles network/CORS/timeout where `error.response` is missing).
   - Ensure interceptor logic never throws inside `catch` paths (this is a current source of “handled error becomes unhandled crash”).
3. Standardize API wrappers to a single return contract
   - Refactor `src/ApiCalls/` modules to use a shared `safeRequest()` helper so every call returns the same shape (e.g., `{ ok: true, data }` or `{ ok: false, error: ApiError }`).
   - Use `src/ApiCalls/remainingApis.js` as the baseline style (it already uses safer optional chaining).
4. Make toast feedback truly global (UI layer)
   - Add a single app-level `<ToastContainer />` (move it out of page-level usage in `src/pages/doctorLogin/DoctorLogin.jsx`).
   - Put it in `src/index.js` or `src/App.js` so every route can toast without duplicating containers.
   - Add a small wrapper like `notifySuccess()`, `notifyError(apiError)` that always uses `getUserMessage()`.
5. Add a top-level ErrorBoundary to prevent blank screens
   - Create `AppErrorBoundary` that renders a friendly fallback UI using component library primitives:
     - `src/component-library/feedback/Alert.jsx`
     - `src/component-library/primitives/Button.jsx`
   - Wrap the route tree (around `useRoutes`) via `src/routes/index.jsx` or `src/App.js`.
   - Note: CRA dev “red overlay” can still appear in development, but the boundary prevents production blank screens and improves recovery UX.
6. Handle chunk-load / lazy import failures with “Reload” recovery
   - In the boundary, detect common chunk-load errors (e.g., “Loading chunk … failed”) and show a specific action: “Reload app”.
7. Catch truly global failures + show safe feedback
   - Add `window.addEventListener('unhandledrejection', ...)` and `window.addEventListener('error', ...)` in `src/index.js`:
     - Call `reportError()` (console for now)
     - Show a single generic toast (rate-limited) so users aren’t stuck silently
8. Migrate the highest-impact “bad UX” spots first (no alerts, no raw errors)
   - Start with:
     - `src/helpers/ProtectedRoute.jsx` (currently logs errors only)
     - `src/components/logout/Logout.jsx` (uses `alert()` + reload)
     - `src/pages/doctorLogin/DoctorLogin.jsx` (already has toastify—convert to the new wrappers)
   - Replace `alert()/confirm()` with toasts and, for confirmations, the existing modal primitive (from component-library).
9. Reduce “data structuring” crashes (defensive UI)
   - Add lightweight guards where lists/objects are assumed (e.g., `Array.isArray(...) ? ... : []`) in the UI, but prefer putting response-shape sanity checks in the API/service layer so pages don’t all re-implement it.
10. Add tests for the new foundation
   - Unit-test the error normalizer (network error, 400 validation, 500, unexpected shape).
   - Render-test the ErrorBoundary fallback (shows Alert + reload button) using Testing Library (already in `package.json`).

**Verification**
- Automated: `npm test` (add tests for normalizer + boundary)
- Manual checks:
  - Offline / API down: shows one friendly toast, app still usable
  - Force a render error in a page component: boundary fallback appears (no black screen)
  - Token expired / 401: consistent message + redirect/logout behavior (if included)

**Decisions**
- Notifications: standardize on `react-toastify` (already installed)
- User messaging: generic + safe specifics (no raw backend dumps)
