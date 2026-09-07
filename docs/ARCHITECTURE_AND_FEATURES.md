# Architecture and Feature Guide

## Application boundaries

The frontend is a protected SPA. Route modules choose pages, pages coordinate
feature workflows, shared components render reusable interaction patterns, and
`src/ApiCalls/` owns backend communication. Keep business rules in hooks,
helpers, or API-facing services when they are shared by more than one screen;
do not duplicate them in page render branches.

## Routing and layout

`MainLayout` provides the authenticated shell with navigation and route-aware
layout behavior. Routes are lazy-loaded and wrapped with `Suspense`. A route may
be restricted by both a permission mapping and an explicit role list.

Use this route change sequence:

1. Add or update the path builder in `src/routes/routeConstants.js`.
2. Add the page to the appropriate route module.
3. Select a `ROUTE_NAMES` entry and verify its permission mapping.
4. Add a role restriction only when the product rule is role-specific.
5. Preserve or intentionally migrate any legacy redirect.
6. Update the sidebar configuration if the screen is navigable from the shell.

## State and data flow

Redux is currently intentionally small:

- `permission` — role, loaded state, and decoded capabilities.
- `theme` — runtime theme/token state.

Feature-local state remains in pages, hooks, and components. Axios is the shared
transport. It injects auth, serializes request pacing, handles cache invalidation
for mutations, and normalizes 401/error behavior. API modules may additionally
normalize their own success/error envelope; preserve the shape expected by the
caller before changing one.

## Feature map

### General operations

- Patients: CRUD/list, profile details, medical team, alarms, parameters,
  prescriptions, labs, diet, requisitions, and patient-scoped chat.
- Readings: daily readings, dialysis readings, imports, charts, and reporting.
- Administration: users, roles, programs, profile questions, language, ailments,
  settings, and audit logs.
- Communication: admin/doctor chat, global chats, support, alerts, and AI chat.
- Reports: doctor reports and KFRE flows.

### Dialysis-center operations

The dialysis route subtree includes dashboard, inventory, sessions, appointments,
patients, billing, during-dialysis, and post-dialysis views. Bed management is
implemented around `src/ApiCalls/bedManagementApis.js`,
`src/hooks/useBedManagement.js`, and components under
`src/components/BedManagement/`. Its documented safety rules include bed status,
assignment, quarantine, and infectious-patient validation.

The dialysis UI is organized as a workflow rather than an isolated screen:

```text
clinic / appointment / bed
        -> pre-dialysis verification and safety checks
        -> session start
        -> during-dialysis monitoring and events
        -> post-dialysis completion and handoff
        -> inventory, audit, alerts, and reporting
```

The workflow details and source links are in `DIALYSIS_WORKFLOW.md`.

## Shared UI architecture

The repository contains three layers that currently coexist:

1. `src/design-system/` and `src/Styles/` — tokens, variables, and semantic
   styling foundations.
2. `src/component-library/` — reusable primitives, inputs, layout, navigation,
   feedback, and modal components.
3. Feature-local CSS/SCSS and legacy utility usage — existing screens being
   migrated incrementally.

New shared UI should use the design-system tokens and component-library exports.
The unified table/list and modal documentation describes the intended migration
patterns; verify the actual component exports before copying an example.

## Cross-cutting rules

- Validate permissions at the route and API boundary; hiding a button is not
  authorization.
- Keep sensitive patient fields scoped to the authorized organization and role.
- Use the shared error helpers and notification policy rather than page-specific
  ad hoc error handling.
- Keep loading, empty, error, and retry states explicit for data-backed screens.
- Treat audit events, consent changes, clinical alerts, and inventory mutations
  as data-integrity paths requiring deliberate tests.

