**Kifayti Health**

**Audit Log Management Documentation**

API Service: api1

Simple overview of how logging and audit trails work in the system

**1\. What is this document about?**

This document explains, in simple words, how audit logs and change logs are managed in the api1 backend. These logs help the team track who changed what, when it happened, and what the old and new values were. This is important for accountability, troubleshooting, and clinical/operational review.

**2\. Why do we keep audit logs?**

- To know who updated patient or doctor information
- To track deleted or added reports (lab reports, prescriptions, requisitions)
- To keep a history of dialysis bed and session actions
- To record inventory stock changes and related actions
- To support review through the web app Logs pages

**3\. Types of logs in api1**

There are two main styles of logging used in the system:

**A. Change logs (patient, doctor, report)**

These store before-and-after details when someone updates or deletes important records. They are mainly handled in Controllers/log.js.

**B. Action audit logs (dialysis & inventory)**

These store a named action (for example BED_ASSIGN or STOCK_ADD) plus extra details in JSON metadata. They are written into the audit_logs table.

**4\. Main log tables**

**4.1 patient_log**

Used when patient details are changed.

**Typical fields stored:**

- patient_id - which patient was changed
- patientName and number - patient identity helpers
- changed_field - which field was updated (for example name, address, ailments)
- old_value and new_value - previous and new values
- changed_by - who made the change
- changed_at - time of the change (auto-filled)

**4.2 doctor_log**

Used when doctor profile details are changed.

**Typical fields stored:**

- doctor_id, doctorName, doctorEmail
- changed_field
- old_value and new_value
- changed_by and changed_at

**4.3 report_log**

Used when reports are added or removed (lab reports, prescriptions, requisitions).

**Typical fields stored:**

- report_id and patient_id
- report - report reference/name
- type - for example Lab Report, Prescription, Requisition
- message - short note about what happened
- deletedBy - user who performed the action
- changed_at - time of the action

**4.4 audit_logs**

Used for operational actions, mainly dialysis bed/session events and inventory transactions.

**Typical fields stored:**

- action - short action code (example: BED_ASSIGN, STOCK_ISSUE)
- metadata - JSON details about the action (IDs, actor, quantities, notes, etc.)

**5\. How logging works (simple flow)**

- 1\. A user updates something in the app (patient, doctor, report, bed, stock, etc.).
- 2\. api1 compares old and new values, or records the action being performed.
- 3\. A log row is inserted into the correct table.
- 4\. Authorized users can later view these logs from the web app Logs pages.

**6\. Patient change logging**

When a patient profile is updated (for example name, phone number, date of birth, address, state, or pincode), api1 records each changed field in patient_log using the logChange() helper.

Ailment updates are also logged under the field name ailments, so the team can see how a patient's condition list changed.

**Helper function: logChange() in Controllers/log.js**

**Main usage: Controllers/Patient.js**

**7\. Doctor change logging**

When a doctor profile is updated, api1 checks which fields changed and writes one doctor_log entry per changed field using doclogChange().

**Helper function: doclogChange() in Controllers/log.js**

**Main usage: Controllers/doctors.js**

**8\. Report logging**

When lab reports, prescriptions, or requisitions are removed (and in some add cases), api1 writes to report_log using ReportLog() or direct inserts.

**Helper function: ReportLog() in Controllers/log.js**

**Main usage areas:**

- Controllers/LabReports.js
- Controllers/Prescription.js
- Controllers/Requisition.js

**9\. Dialysis audit actions**

Dialysis bed and session operations write rows into audit_logs with a clear action name and related metadata.

**Common dialysis actions:**

- BED_ASSIGN - patient assigned to a bed
- BED_UNASSIGN - patient removed from a bed
- BED_STATUS_UPDATE - bed status/notes updated
- BED_TRANSFER - patient moved from one bed to another
- DIALYSIS_SESSION_STATE_CHANGE - dialysis session state changed

**Main usage: Controllers/Dialysis.js**

**10\. Inventory audit actions**

Inventory and stock operations also write to audit_logs through an appendAudit() helper.

**Common inventory actions:**

- CREATE_ITEM / UPDATE_ITEM / SOFT_DELETE_ITEM
- STOCK_ADD / STOCK_ISSUE / STOCK_ADJUST / MOVE_STOCK
- CREATE_TRANSACTION_IN / CREATE_TRANSACTION_OUT / CREATE_TRANSACTION_ADJUST
- CREATE_LOCATION / UPDATE_LOCATION
- CREATE_DIALYZER / USE_DIALYZER
- DISPENSE_TO_PATIENT / DISPENSE_TO_DEPARTMENT
- CYCLE_COUNT_ADJUST / RECORD_CYCLE_COUNT
- PO_DELIVERY_RECV / RESOLVE_ALERT / CREATE_LAB_ITEM

**Main usage: Controllers/DtInventory.js**

**11\. APIs to read logs**

These endpoints return saved logs for display/export in the web app:

- GET /patient/patientLog - fetch all patient change logs (newest first)
- GET /doctor/doctorLogs - fetch all doctor change logs (newest first)
- GET /doctor/ReportLogs - fetch all report logs (newest first)

Patient/doctor/report fetch APIs are implemented in Controllers/log.js (downloadLog, DocdownloadLog, DownReportlog).

Note: dialysis and inventory audit_logs are mainly written for backend/history tracking; the current Logs UI focuses on patient and doctor change logs.

**12\. How users see logs in the web app**

In webapp1, there is an Audit Logs section with pages for Patient Logs and Doctor Logs. Users with permission can open these pages, review the list, and download/export the data (for example as CSV).

**Access control:**

Role permission can_vud_lo controls access to the Logs page. Admin role has full access (value 7).

**13\. Key files (for developers)**

- api1/Controllers/log.js - core logging helpers and read APIs
- api1/Models/tables.js - creates patient_log, doctor_log, and report_log tables
- api1/Controllers/Patient.js - writes patient_log
- api1/Controllers/doctors.js - writes doctor_log
- api1/Controllers/LabReports.js, Prescription.js, Requisition.js - write report_log
- api1/Controllers/Dialysis.js - writes dialysis actions to audit_logs
- api1/Controllers/DtInventory.js - writes inventory actions to audit_logs
- api1/Router/patient.js and Router/doctors.js - expose log fetch routes
- webapp1/src/pages/AuditLogs/\* - UI for viewing logs

**14\. Simple examples**

**Example 1 - Patient profile update**

If a care coordinator changes a patient's phone number from 9876543210 to 9123456789, patient_log stores: field = number, old_value = 9876543210, new_value = 9123456789, and who changed it.

**Example 2 - Bed assignment**

If staff assign bed 12 to patient 45 for appointment 101, audit_logs stores action = BED_ASSIGN with metadata containing bed_id, patient_id, appointment_id, and actor_id.

**Example 3 - Stock issue**

If inventory staff issue stock from a location, audit_logs stores action = STOCK_ISSUE with metadata about the item, quantity, location, and related transaction details.

**15\. Good practices**

- Do not delete historical log rows casually; they are meant for audit trail.
- Always record who performed the action (changed_by / actor_id / deletedBy).
- Keep action names consistent (uppercase codes like BED_ASSIGN).
- Prefer clear metadata so later readers can understand the full context.
- Restrict Logs page access to authorized roles only.

**End of document - Audit Log Management (api1)**