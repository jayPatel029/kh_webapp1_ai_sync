# Alerts Frontend Guide (API1)

This guide explains the **current** alerts functionality available in this server.

- Base URL: `/api`
- Auth: most endpoints require `Authorization: Bearer <token>`
- Main alert data sources:
  - `alerts` (core admin/doctor/patient alerts)
  - `readingalerts` + `alertsread` (daily/dialysis reading alerts for doctors)
  - `app_alerts` (app-specific doctor-to-patient alerts)
  - `inventory_alerts` (DT inventory alerts)

---

## 1) Which endpoints to use (quick recommendation)

- **Admin dashboard alerts**: use `GET /api/sortAlerts/:admin_id`
- **Doctor dashboard alerts**: use `GET /api/sortAlerts/doctor/:doctor_id`
- **Raw alert CRUD / actions**: use `/api/alerts/*`
- **Reading alert read-status updates**: use `/api/dailyAlerts/updateIsRead`
- **Mobile app doctor message alerts**: use `/api/app/appAlerts/insertAlert`
- **DT inventory alerts**: use `/api/dt/alerts*`

---

## 2) Core Alerts API (`/api/alerts`)

All endpoints below require token (`verifyToken`).

### Fetch

- `GET /api/alerts`
  - Returns all rows from `alerts` table (raw).
- `GET /api/alerts/byType/:type`
  - `:type` usually `doctor` or `patient`; scoped using logged-in admin assignment.
- `GET /api/alerts/byCategory`
  - Current implementation returns unread `"New Program Enrollment"` alerts.
- `GET /api/alerts/byId/:id`
  - Fetch one alert row by id.
- `GET /api/alerts/dailyAlerts`
  - Checks if current user can receive daily updates.

### Create

- `POST /api/alerts/doctorMessageToAdmin`
  - Body: `{ chatId, message, pid }`
- `POST /api/alerts/newEnrollment`
  - Body: `{ patientId }`
- `POST /api/alerts/newProgramEnrollment`
  - Body: `{ patientId, programName }`
- `POST /api/alerts/newPrescriptionAlarm`
  - Body: `{ alarmId }`
- `POST /api/alerts/prescriptionDisapprovedAlarm`
  - Body: `{ alarmId }`
- `POST /api/alerts/changeInProgram`
  - Body: `{ patientId, programName }`
- `POST /api/alerts/newLabReport`
  - Body: `{ labReportId, patient_id }`
- `POST /api/alerts/deleteAccount`
  - Body: `{ patientId }`
- `POST /api/alerts/prescriptionNotViewed`
  - Body: `{ alarmId, patientId }`
- `POST /api/alerts/newPrescription`
  - Internal helper-style flow exists; route is exposed.
- `POST /api/alerts/contactUs`
  - Body: `{ patientId }`

### Update / Review / Read

- `PUT /api/alerts/approveOrDisapprovePrescription`
  - Body: `{ alarmId, status, patientId }`
- `PUT /api/alerts/approveAlert`
  - Body: `{ id, alarmId }`
- `PUT /api/alerts/approveAllAlerts`
  - Body: `{ presId }`
- `PUT /api/alerts/disapproveAlert`
  - Body: `{ id, alarmId, reason }`
- `PUT /api/alerts/disapproveAllAlerts`
  - Body: `{ presId, reason }`
- `PUT /api/alerts/updateIsRead`
  - Body: `{ id }` (sets `isOpened=1`)
- `PUT /api/alerts/deletePatientAlert/:id`
  - Creates "Delete patient Alert" for patient id in path.

### Delete

- `DELETE /api/alerts/delete/:id`

---

## 3) Sorted Inbox APIs (`/api/sortAlerts`)

All endpoints below require token.

- `GET /api/sortAlerts/:admin_id`
  - Returns admin-friendly, transformed alert cards (name, type text, redirect, etc.).
- `GET /api/sortAlerts/superAdminAlerts/:admin_id`
  - Extra missed/escalation alerts for super admin flows.
- `GET /api/sortAlerts/doctor/:doctor_id`
  - Doctor-friendly transformed alert cards (includes reading alerts mix).
- `GET /api/sortAlerts/emails/sendEmails`
  - Triggers alert email sending flow.

Use this group when building dashboard/inbox UI, because it already formats alert display text and redirect paths.

---

## 4) Reading Alerts API (`/api/dailyAlerts`)

All endpoints below require token.

- `POST /api/dailyAlerts/AddDailyReadingsAlerts`
  - Body: `{ question_id, user_id, date, readings }`
  - Creates daily reading alert entries in `readingalerts` when thresholds are violated.
- `POST /api/dailyAlerts/AddDialysisReadingsAlerts`
  - Body: `{ question_id, user_id, date, readings }`
  - Creates dialysis reading alerts in `readingalerts`.
- `POST /api/dailyAlerts/updateIsRead`
  - Body: `{ email, alerts: [{ id, dailyordia }, ...] }`
  - Marks doctor reading alerts as read in `alertsread`.

---

## 5) App Alerts API (`/api/app`)

- `POST /api/app/appAlerts/insertAlert`
  - Body: `{ doctorEmail, patientId, category, mess }`
  - Categories currently used in code:
    - `Consult Doctor`
    - `Send Message`
  - Inserts into `app_alerts` and attempts push notification.
  - Note: route is mounted without `verifyToken` in current router.

---

## 6) DT Inventory Alerts API (`/api/dt`)

These endpoints are in DT inventory router and require token.

- `GET /api/dt/alerts`
  - Optional query params: `status`, `type`, `item_id` / `itemId`
- `GET /api/dt/alerts/:alertId`
- `POST /api/dt/alerts/:alertId/resolve`

Inventory alert object fields:

- `id`
- `item_id`
- `type` (currently generated as `LOW_STOCK` or `EXPIRY`)
- `message`
- `status` (`ACTIVE` / `RESOLVED`)
- `severity` (usually `WARN`, default fallback `INFO`)
- `created_at`, `updated_at`, `resolved_at`, `resolved_by`

---

## 7) Alert categories currently present in server logic

This is the practical list for frontend handling/filtering today.

### Core `alerts.category` values

- `Doctor Message to Admin -"..."`
- `New Enrollment`
- `New Program Enrollment`
- `Change In Program`
- `New Prescription Alarm`
- `Missed Prescription Alarm`
- `New Prescription`
- `Prescription Disapproved` (also appears once with trailing space in creation flow)
- `Prescription Approved`
- `New Lab Report`
- `Contact Us`
- `Delete Account`
- `Delete patient Alert`
- `Account Deletion` (from account-deletion app flow)
- `New Feedback` (feedback flow)
- `Patient has not answered medicine alarm for 3 or more days`
- `Patient has not answered dialysis alarm for 3 or more days`
- `Doctor has failed to approve/disapprove medicine alarm for 1-3 days`
- `Sub Admin alert: Doctor has failed to approve alarm for 4 days`
- `Super Admin alert: Doctor has failed to approve alarm for more than 4 days`
- `Dialysis Tech has failed to enter dialysis readings`
- `Dialysis Tech has failed to enter dialysis readings for ...`
- `Missed <original_category>` (cron-generated prefix category)

### `app_alerts.category`

- `Consult Doctor`
- `Send Message`

### `inventory_alerts.type`

- `LOW_STOCK`
- `EXPIRY`

---

## 8) Important frontend notes

- Prefer `/api/sortAlerts/*` for dashboard list rendering; raw `/api/alerts` is less normalized.
- Read-state handling is split:
  - `alerts` -> `PUT /api/alerts/updateIsRead`
  - `readingalerts` -> `POST /api/dailyAlerts/updateIsRead`
  - `inventory_alerts` -> `POST /api/dt/alerts/:alertId/resolve`
- Category strings are legacy and not fully normalized; use tolerant matching in UI where possible.
- Some categories are cron-generated/escalated and may appear even if frontend did not create them directly.

