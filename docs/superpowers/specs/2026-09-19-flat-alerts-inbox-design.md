# Flat Alerts Inbox Design (Admin + Doctor)

**Date:** 2026-09-19  
**Branch:** `fix/alerts-workflow-stabilization`  
**Status:** Awaiting user review  

## Goal

Show alerts on Admin and Doctor dashboards the **same way as `main`** (flat individual alert rows, two columns), while keeping the **current new-layout theme** (colors, typography, spacing). Do **not** copy main’s old SCSS/theme.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| List layout | **A** — Flat list of individual alerts (not patient cards) |
| Admin + Doctor | **A** — Same pattern for both; two columns Doctor Alerts / Patient Alerts |
| Click behavior | **A** — Mark read (when needed) → navigate to related page |
| Implementation approach | **2** — Shared `FlatAlertsInbox` component used by both dashboards |
| Theme | Current branch only (`#3F6B85`, `#00cccc`, Sora/design-system, existing dashboard CSS) |

## Out of scope

- Restoring main’s SCSS / gray page chrome / old card shadows as the visual system  
- Rebuilding `PatientAlertsByType` or ShowAlarms in this change  
- Chat alerts inside the dashboard inbox (remain excluded; chats stay under `/chats/*`)  
- Primary modal flows (AlertModal / ApprovePrescriptionModal) as the default click path on these dashboards  

## Main behavior to preserve

From `main` `AdminContainer`:

- Two columns: **Doctor Alerts** and **Patient Alerts**
- Each row is **one alert**: category, patient name, date, unread indicator (red dot when not opened)
- Row click: persist related ids → mark read → navigate by category
- Patient list filters out `Prescription Approved` and `New Prescription Alarm` (keep that filter)

## Current theme tokens to use

- Header underline / accents: `#00cccc`, title `#3F6B85`
- Page background / content from `adminDashboard.css` / `dashboard.css` + design-system variables
- Row: white surface, light border, hover state; unread dot in danger/red; no old main purple/cream look

## Architecture

```text
AdminDashboard / DoctorDashboard
  ├── stats header (existing new-layout)
  └── FlatAlertsInbox
        ├── column "Doctor Alerts"  → AlertRow[]
        └── column "Patient Alerts" → AlertRow[]
              └── onClick → openAlertDestination(alert, navigate)
                    └── fallback: userProfile(patientId) if no mapped destination
```

### New files

| File | Role |
|------|------|
| `src/components/dashboard/FlatAlertsInbox.jsx` | Two-column inbox shell + empty/loading states |
| `src/components/dashboard/AlertRow.jsx` | Single alert row (category, name, date, unread) |
| Optional small CSS module or classes in existing dashboard CSS | Row/column layout only |

### Modified files

| File | Change |
|------|--------|
| `src/pages/adminDashboard/AdminDashboard.jsx` | Stop rendering patient cards/category tabs/modals as primary UI; fetch + partition alerts; render `FlatAlertsInbox` |
| `src/pages/doctorDashboard/DoctorDashboard.jsx` | Same: flat inbox instead of patient-card category buttons |
| `src/helpers/alertNavigation.js` | Ensure click always navigates when possible: if `resolveAlertDestination` is null but `patientId` exists → `ROUTES.userProfile(patientId)` |
| `src/helpers/alertGrouping.js` | Reuse `partitionDashboardAlerts`, `isUnreadAlert`, `getPatientName`, `isChatAlert` |

### Data flow

**Admin**

1. Keep existing fetch (`getAlerts` / doctor sort when applicable).
2. Exclude chat alerts.
3. Partition with `partitionDashboardAlerts` (or type/category equivalent to main’s doctor vs patient lists).
4. Apply main patient filters: drop `Prescription Approved`, `New Prescription Alarm`.
5. Pass `doctorAlerts` + `patientAlerts` into `FlatAlertsInbox`.

**Doctor**

1. Keep `useDoctorDashboardData` (or equivalent sorted doctor feed).
2. Exclude chat alerts.
3. Partition the same way into doctor/patient columns (same UI as admin).
4. Same row click → `openAlertDestination`.

### Row content (parity with main UserCard)

- Left: avatar placeholder (initials or existing dummy avatar asset), **Category:** `{category\|\|type}`, **Name:** patient name  
- Right: date `DD-MM-YYYY`, unread red dot if not opened/read, chevron  
- Entire row clickable  

### Mobile

- Stack columns vertically: Doctor Alerts first, then Patient Alerts  
- Same row component  

### Empty / loading

- Loading: themed text or existing skeleton pattern  
- Empty column: “No alerts”  

## Click / navigation rules

1. Call existing `openAlertDestination(alert, navigate)` (mark read + route map).  
2. If that returns false and alert has a patient id → navigate to `ROUTES.userProfile(patientId)` after mark-read attempt.  
3. If still nowhere to go → no navigation (optional toast later; not required for v1).  

Reading/dialysis detail alerts that previously lived only in modals will follow the same navigate/fallback rules (profile or mapped page), per locked decision **A**.

## Success criteria

- Admin `/dashboard` and Doctor `/dashboard/doctor` show **flat two-column alert lists**, not patient action cards.  
- Visual style matches **new layout**, not main’s old skin.  
- Clicking a row marks read when appropriate and lands on the related page (or patient profile fallback).  
- Chat alerts do not appear in these columns.  
- Main patient-side filters for approved / new prescription alarm categories still applied on the patient column.

## Non-goals / deferred

- Full props-based modal refactor  
- Surfacing chat alerts back into the dashboard  
- Pixel-perfect clone of main’s spacing (theme wins when they conflict)
