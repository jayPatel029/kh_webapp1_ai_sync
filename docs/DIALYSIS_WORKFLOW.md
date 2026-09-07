# Dialysis Workflow: Pre, During, and Post

## Scope

This document unifies the implementation notes and screen requirements for the
dialysis-center workflow. The screen specifications under
`docs/dialysis_docs/P2-1,2/`, `P3/`, and `P4/` remain the detailed clinical and
UX source documents. When a detailed specification and current code differ,
record the difference before changing behavior.

## End-to-end lifecycle

```text
Today's queue
  -> patient summary and consent/access checks
  -> verification, consumables, vitals, assessment, vascular access
  -> machine/water/infection safety reviews
  -> validation and start/unlock
  -> during-dialysis hub
       -> vitals and overdue escalation
       -> machine parameters, symptoms, access, medication, alarms
       -> progress, events, incidents
  -> end-treatment handoff
  -> post-dialysis termination, adequacy, sign-off, notifications, inventory
```

The code entry points are `src/pages/dialysis/` and the API modules
`preDialysisApis.js`, `dialysisSessionApis.js`, `dialysisTechnicianApis.js`,
and `postDialysisApis.js`. The route subtree is registered in
`src/routes/dialysisRoutes.jsx`.

## Stage responsibilities

### Part 2 — pre-dialysis

The P2 screen set is P2-01 through P2-12: queue, patient summary, dashboard,
verification, vitals, assessment, vascular access, machine safety, water safety,
infection control, validation, and start confirmation. The frontend integration
module covers queue/status reads and submission calls for these steps.

Important cross-screen rules documented for P2 include mandatory versus
non-mandatory field handling, skip logging and the daily staff digest, infection
status gates, organization-scoped ABDM consent behavior, configurable clinical
thresholds, UF-rate limits, role-gated edit information, and critical-symptom
nephrologist alerts.

### Part 3 — during-dialysis

P3 is a non-linear monitoring hub rather than a gated stepper. The code exposes
dashboard, intradialytic vitals, overdue-vital handling, machine parameters,
symptoms, vascular-access monitoring, medications, alarms, progress/events,
incidents, and end-treatment operations.

The overdue-vitals rule is a stateful escalation path: a due reading becomes
overdue, the technician can record or skip it according to policy, and critical
conditions can create a physician/nephrologist alert and audit event.

### Part 4 — post-dialysis

P4 covers termination, blood return, access-specific follow-up, adequacy
calculations (Kt/V, equilibrated Kt/V, and PCR), read-only carry-forward data,
machine readiness, sign-off identity, notifications, audit, and inventory
handoff. P3-10 is documented as a thin handoff gate rather than a duplicate
post-dialysis form.

## Session and bed invariants

- A session is associated with a patient and bed, and may be associated with an
  appointment.
- Session lifecycle values in the session API documentation include `RUNNING`,
  `PAUSED`, `COMPLETED`, and `ABORTED`; preserve backend status spelling.
- Bed assignment must respect bed status and quarantine/isolation constraints.
- Infectious-patient protection is enforced in the bed-management flow and must
  not be reduced to a visual warning.
- Inventory usage should remain linked to the session and transaction reference.
- Clinical, consent, identity, and safety actions require auditability.

## Consent and sensitive data

The requirements establish organization-scoped ABDM consent behavior. A revoked
consent can affect visibility and may require Kifayti-level anonymization rather
than deletion. The access decision applies across patient screens, not only at
the point where consent is changed. Any implementation must distinguish:

- organization access versus global/system access;
- anonymized data versus deleted data;
- role-based field visibility versus route visibility;
- audit records versus clinical records.

Do not implement a consent or anonymization change from a screen mockup alone;
verify the backend model, trigger, audit events, and every consuming screen.

## Offline and resilience behavior

The requirements call for encrypted offline drafts, but the current P3/P4 code
writes drafts directly to browser `localStorage`. Encryption at rest is therefore
an open implementation item, not a completed guarantee. Current draft/context
keys include `during-dialysis-draft:{sessionId}`,
`post-dialysis-draft:{sessionId}`, `lastDialysisSessionId`,
`lastDialysisPatientId`, and `lastDialysisPatientData`.

Treat these values as sensitive, scope them to the correct session/user, and do
not use real patient data in a shared browser profile. A failed sync must not
silently appear as a successful clinical submission.

## Current implementation boundaries

- No standalone P1 workflow is implemented; P1 image files are assets, not a
  source-level P1 module.
- P2-02 exists in the codebase but the default queue selection currently lands
  on P2-04; do not document the ideal P2 sequence as the current runtime path.
- P3/P4 preview values such as `demo` and `preview` are not real sessions and
  must not be treated as production saves.
- Frontend role gates are not backend authorization; API enforcement remains
  authoritative.

Relevant workflow tests include `dialysisRouteAccess.test.js`,
`p2SessionIdWiring.test.js`, `dialysisQueue.test.js`, the P2 screen tests,
P3 vitals/alarms/session tests, and P4 vitals/discharge/completion tests under
`src/__tests__/`.

## Implementation checkpoints

1. Confirm the session, patient, organization, bed, and role context.
2. Load current status and preserve server-owned state transitions.
3. Submit one screen's payload through the matching API wrapper.
4. Render normalized loading, validation, error, and retry states.
5. Record alerts/audit/inventory side effects where the contract requires them.
6. Verify the next transition and the browser-visible result.

## Detailed sources

- P2 requirements and change inventory:
  `dialysis_docs/P2-1,2/Part2_Change_Requirements_Document.md`.
- P2 screen specification:
  `dialysis_docs/P2-1,2/Part2_Screens_P2-01_to_P2-12_FINAL_v2.md`.
- P3 screen specification:
  `dialysis_docs/P3/Part3_Screens_P3-01_to_P3-10_FINAL_v4.md`.
- P4 screen specification:
  `dialysis_docs/P4/Part4_Screens_P4-01_to_P4-10_FINAL_v4.md`.
- Code-level workflow notes:
  `DIALYSIS_WORKFLOW_CODE_DOCUMENTATION.md`.
