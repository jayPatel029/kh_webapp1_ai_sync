# Plan: Dialysis Whole-Workflow Navigation (Pre → During → Post)

**Type:** Feature
**Status:** VERIFIED
**Approved:** Yes
**Worktree:** No
**Branch:** main

## Goal
Stitch P2 (Pre: P2-01→P2-12), P3 (During: P3-01→P3-10), P4 (Post: P4-01→P4-10) into one continuously navigable workflow. Add a top-level stage bar `Pre-Dialysis | During Dialysis | Post-Dialysis` visible on all dialysis routes, preserve `patientId/sessionId` across stages, and make `P2-12 Start Dialysis → P3-01 Treatment Dashboard` the canonical handoff (P3-10 Completion → P4-01 Blood Return).

## Context (from docs)
- Part 2: P2-01 Queue → P2-02 Summary → P2-03 Dashboard → P2-04 Verification → P2-05 Vitals → P2-06 Assessment → P2-07 Access → P2-08 Machine → P2-09 Water → P2-10 Infection → P2-11 Validation → P2-12 Start Confirmation (`POST /api/dt/sessions/:id/start` + `status draft/final`, `skips[]`, hard blocks 409/423, PIN `P2-12` per `2026-07-26-dt-predialysis-backend-guidenotes.md` + `Part2_Screens_P2-01_to_P2-12_FINAL_v2.md:2444`).
- Part 3: P3-01 Treatment Dashboard is the non-linear hub reached from P2-12; P3-02 Vitals, P3-03 Machine, P3-04 Symptoms, P3-05 Access Monitoring, P3-06 Medication, P3-07 Alarm, P3-08 Progress, P3-09 Incident, P3-10 Completion (`Part3:96,405,421`), `P3-10 Complete → P4-01` (`Part3:2307`).
- Part 4: P4-01 Blood Return & Termination (`Part4:416`), through P4-10 Session Complete.
- Current app: `/dialysis/patients` handles P2 via `location.state` (`DialysisPatients.jsx`), `/dialysis/during/:sessionId/:screenId` (`DuringDialysisPage.jsx`), `/dialysis/post/:sessionId/:screenId` (`PostDialysisPage.jsx`); `P2-03` branch was missing (fixed last turn), `P2-07..P2-12` now wired but no stage bar, `P2-12 onNext` currently goes to queue not to `P3-01`.

## Decisions
- Show stage bar on every dialysis route (not only inside `DialysisPatients`) —reuse existing `PageHeader` pattern, add 3 tabs: `Pre-Dialysis (/dialysis/patients or current session)`, `During (/dialysis/during/:sessionId/P3-01)`, `Post (/dialysis/post/:sessionId/P4-01)`. Disabled until session exists where required.
- Keep `patientId` from JWT/`localStorage` + selected queue row; `sessionId` from `startDialysis` response (`session_id`) or existing `dialysisSessionApis.js`.
- P2-12 success must create/confirm session then `navigate(/dialysis/during/<sessionId>/P3-01, {state:{patientId, sessionId}})`; During header `End Treatment` → `P3-10` → `Post P4-01` via same session.
- No placeholder inventing: numeric defaults remain empty/dynamic (prior `PostDialysisPage` static cleanup retained), stage bar labels only.

## Tasks
- [x] Task 1: Create `DialysisStageTabs.jsx` (pre/during/post bar, uses `useLocation`, `useNavigate`, `ROUTES`, `isRole` for Admin/Tech, disables During/Post when no `sessionId`) — max 80 LOC, reuses `component-library` `Button`.
- [x] Task 2: Wire into `DialysisLayout.jsx` (`<Outlet/>` above + `<DialysisStageTabs/>`) so bar appears on all `/dialysis/*` children.
- [x] Task 3: Change `StartDialysisConfirmationView.jsx` `handleStartDialysis` success path from `onNext` (queue) to `navigate(ROUTES.DIALYSIS_DURING + /${sessionId}/P3-01)` after `startDialysis` `200 {session_id}`; update `DialysisPatients.jsx` `isStartStep onNext` to do same (pass `sessionId`).
- [x] Task 4: Update `DuringDialysisPage.jsx` `Completion/onCompleted` and `PostDialysisPage.jsx` entry to read `sessionId`/`patientId` from route params + `location.state`; ensure `P3-10` → `P4-01` handoff via `DialysisStageTabs` or button.
- [x] Task 5: Extend `dialysisRoutes.jsx` guards so Admin (`Admin,PSadmin`) sees all 3 stages (already done for patients/during/post) + keep `Pre/During/Post` visible for Technician; verify `PageHeader dialysisNavItems` + `Sidebar` still show 6 tech tabs.

## Verification
- `npm run build` passes (existing `5 autoprefixer warnings` only).
- Headless (when not `--unshare-net`): hard-reload `/dialysis/patients` → `P2-03` → `P2-12 Start` → PIN attestation → auto lands `P3-01` with `sessionId` in URL, stage bar highlights `During`; `P3-10` → `P4-01` highlights `Post`; back/forward preserves `patientId/sessionId`; `P2-03` no longer bounces to `P2-01`.
- Fallback `curl --noproxy http://127.0.0.1:41782/dialysis/patients` → `200` + `grep export default src/pages/dialysis/DialysisPatients.jsx` present.

## Risks
- `startDialysis` mock `sessionId=1` in view must be replaced with real `patientId` context when wiring — keep empty if unavailable.
- `During`/`Post` drafts stored in `localStorage` per session — stage switch must not clear them.

## References
- `docs/dialysis_docs/P2-1,2/Part2_Screens_P2-01_to_P2-12_FINAL_v2.md`
- `docs/dialysis_docs/P3/Part3_Screens_P3-01_to_P3-10_FINAL_v4.md:96,405,421,2307`
- `docs/dialysis_docs/P4/Part4_Screens_P4-01_to_P4-10_FINAL_v4.md:416`
- `docs/dialysis_docs/2026-07-26-dt-predialysis-backend-guidenotes.md`
- `docs/BED_AND_DIALYSIS_API_SPEC.md`, `docs/dialysis_session_bed_inventory_guide.md`
