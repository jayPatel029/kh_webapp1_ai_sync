Code Report: Appointments, Billing, Clinic, and Consultation Pages
Overview
All four modules share a single reusable ComplexTable component (react-table based) wired to different column definition arrays. The columns, data, and action callbacks are the only things that change per module. Everything below can be mapped directly to any codebase as long as that codebase has:

A table primitive (equivalent of react-table or a custom table)
A modal primitive
Basic layout primitives (Box, Flex, SimpleGrid)
Form primitives (Input, Select, FormControl/Label, Button, Textarea)
1. The Universal Table: ComplexTable
Core Contract
jsx
<ComplexTable
  columnsData={arrayOfColumnDefs}   // react-table column objects
  tableData={arrayOfRowObjects}      // the actual data rows
  setTableDataComplex={stateSetter}  // parent state setter so table can do optimistic updates
  onRowClick={fn}                    // optional: called on row click (excluding button clicks)
  isLoading={bool}                   // optional: loading state
  doctorId={string}                  // optional: passed through for context
  onAppointmentStatusUpdate={fn}     // optional: socket payload forwarded to parent
  onPaymentStatusUpdate={fn}         // optional: socket payment broadcast forwarded to parent
/>
Internal Architecture
Responsibility	Mechanism
Data filtering	Local useMemo against filters state ({doctor, paymentStatus, appointmentDate})
Sorting + Pagination	react-table hooks: useGlobalFilter, useSortBy, usePagination
Initial page size	4 rows (configurable in initialState)
Row-level action injection	Before passing to react-table, each row is spread with onEdit, onDelete, handleDelete, onPrescriptionClick, book_appointments so column Cell renderers can call row.original.onEdit() etc.
Real-time updates	useSocket hook → subscribes to "appointment.status.updated" and "payment.status.updated" → calls setTableDataComplex with updated row
Row highlight rules	Emergency rows → pink; offline/pending-sync rows → orange; cancelled rows → faded grey
Column header extras	"Payment Receipt" and "Bill Invoice" headers get a small refresh IconButton that clears the in-memory bill cache
File-Preview Overlay (built into ComplexTable)
When any file URL (PDF, image, CSV) is opened inside the table:

Code
openFilePreview(urlOrFilename)
  → resolves to /uploads/<filename> if plain filename given
  → sets filePreviewUrl, filePreviewExt, isFilePreviewOpen = true
  → renders a fixed right-panel overlay (60-70% width, 100vh height)
       ├─ header bar: filename + Print / Download / Close buttons
       └─ content area:
            ├─ image  → <img> tag
            ├─ pdf/text → <iframe src={safeUrl}>
            └─ other  → <iframe> + "Open in new tab" link
Print logic:

Images → window.open a minimal HTML page, then window.print()
PDF/text → inject a hidden <iframe> and call iframe.contentWindow.print()
Receipt List Modal (built into ComplexTable)
When a row has multiple payment_receipt_urls:

Code
handleOpenReceiptList(rowObject)
  → fetchBillByAppointment(appointmentId)   // API GET /api/bills/byAppointment?appointment_id=X (cached in Map)
  → parseReceiptUrls(raw)                   // splits comma-separated string OR array
  → if 1 URL  → openFilePreview(url)
  → if >1 URLs → open ReceiptListModal
       ├─ classifies files: filename containing "refund" → Refund section
       └─ each file: Open (inline preview) + Open in new tab buttons
Invoice open:

Code
handleOpenInvoiceForRow(row)
  → fetchBillByAppointment(appointmentId)
  → get bill.bill_invoice ?? row.bill_invoice
  → openFilePreview(invoiceUrl) or show "No invoice available" info modal
Payment Action Column (built into ComplexTable)
Code
renderPaymentAction(cell)
  → value "Paid"           → green button (read-only)
  → value "Pending"        → red button  → click → opens PaymentReceiptModal
  → value "REFUND-PENDING" → red button  → click → opens PaymentReceiptModal
  → value "REFUNDED"       → gray button → click → opens PaymentReceiptModal
After payment confirmation, handlePaymentConfirm(receiptFileName, paymentStatus) updates the row optimistically and emits "payment.status.update" via socket.

2. Column Definitions (columnsData.js)
All raw column arrays are post-processed by applyDefaultCell(cols) which:

If a column already has a Cell, wraps it in a div with common flex/overflow styles
Otherwise adds a default Cell that calls formatDisplayValue(value) (shows "—" for null/empty)
Column Definition Shape
js
{
  Header: "DISPLAY NAME",       // string or JSX
  accessor: "data_field",       // key in the row object
  minWidth: 100,                // optional px
  width: 100,
  maxWidth: 150,
  disableSortBy: true,          // optional
  Cell: ({ value, row, column }) => JSX,   // optional custom renderer
}
All Available Column Sets
Export	Used by
columnsDataCheck	Basic patient list (id, name, gender, age, email, phone, past_appointments, lab_tests, book_appointments)
columnsDataComplex	Patient table with Edit + Delete + Emergency buttons injected into rows
appointmentcolumnsDataComplex	Appointment queue table
doctorcolumnsDataComplex	Doctor-view queue
columnsDataConsultation	Consultation/session table
billscolumnsDataComplex	Billing table
clinicColumnsData	Clinic management table
frontdeskColumnsData	Frontdesk user table
patientColumnsDataComplex	Patient management with emergency
3. Appointments Queue Page
Architecture
Code
AppointmentTablePage
  ├─ Reads global filters from GlobalFiltersContext
  │     { doctorId, fromDate, toDate, clinicId, roleContext }
  ├─ useAppointmentStatus(selectedDoctor, fromDate, toDate) custom hook
  │     → POST /api/appointment/getAppointmentsByDateRangeByDoctor
  │           payload: { doctor_id, from_date, to_date }
  │     → offline fallback: IndexedDB via getOfflineAppointmentsByDateRange()
  │     → formats response to canonical shape:
  │           { ...apt, created_date, name, doctor_name, phoneNumber,
  │             treatment_type, booking_time, payment_action, status, id }
  │     → applies any pending offline status overrides from localStorage['offlineStatusQueue']
  └─ ComplexTable with appointmentcolumnsDataComplex columns
Appointment Table Columns
Column	Accessor	Notes
DATE	created_date	Formatted DD-MM-YYYY
PATIENT	name	
DOCTOR	doctor_name	
AGE	age	
SEX	gender	
MOBILE NO.	phoneNumber	
APPOINTMENT TYPE	treatment_type	"in_clinic" → "In Clinic" else "Online"
APPOINTMENT TIME	booking_time	12-hour format via formatTime12Hour()
Prescription	prescription	"View PDF" button → row.original.onPrescriptionClick(row.original)
parameters	parameters	"Add" button, only enabled when status === "ARRIVED" → opens ParametersModal
Payment Receipt	payment_receipt	handled by ComplexTable's receipt opener
PAYMENT ACTION	payment_action	rendered by renderPaymentAction
Bill Invoice	bill_invoice	handled by ComplexTable's invoice opener
STATUS	status	Interactive button (see status flow)
ACTIONS	actions	Edit + Cancel buttons (see action rules)
Status Flow & Transitions
Code
BOOKED / PENDING  →  click  →  confirm dialog  →  API PUT updateApptStatus → ARRIVED
ARRIVED           →  (no transition from this column; transition happens elsewhere)
IN_PROGRESS       →  no transition
COMPLETED         →  disabled (green button)
CANCELLED         →  disabled (gray button)
MISSED            →  disabled (red button)
Offline mode: instead of API call, status queued in localStorage['offlineStatusQueue'] and a CustomEvent('offlineStatusUpdate') is dispatched.

Action Button Rules (ACTIONS column)
Status	Payment	Show Edit	Show Cancel
BOOKED/MISSED/ARRIVED/COMPLETED	any	✓	depends on payment
BOOKED/MISSED/ARRIVED	PAID or PENDING	✓	✓
CANCELLED	any	✗	✗
Cancel action flow:

window.prompt() for cancellation reason (required)
GET /api/bills/byAppointment?appointment_id=X
Calculate refund: refundAmount = receivedAmount, pendingAmount = -refundAmount
PUT /api/bills/update/{billId} with refund payload (structured first, legacy as fallback)
POST /api/appointment/updateApptStatus { id, status: "CANCELLED", cancellation_reason }
POST /api/appointment/updatePaymentStatus { appointment_id, payment_action: "REFUND-PENDING" }
Generate refund bill PDF using generateBillPdf(), upload via uploadFile()
PUT /api/bills/update/{billId} to attach the refund invoice URL
AppointmentsView Component (Frontdesk Wrapper)
jsx
// Pure display component receiving all data as props
<AppointmentsView
  userRole="front_desk"    // "front_desk"|"doctor"|""
  userRic="owner"          // "owner" or other
  isAdmin={bool}
  doctors={[{id, doctor}]}
  selectedDoctor={string}
  setSelectedDoctor={fn}
  fromDate={string}        // "YYYY-MM-DD"
  toDate={string}
  onFromDateChange={fn}
  onToDateChange={fn}
  appointmentCounts={{ total, pending, completed }}
  customColumns={columnDefs}
  filterAppointments={fn}  // (appointments, searchQuery) => filtered[]
  appointments={[]}
  patientSearchQuery={string}
  onRowClick={fn}
  onEdit={fn}
/>
Layout:

Code
Filter bar (bg=white, p=10px, borderRadius=md, wrap, gap=4)
  ├─ Doctor Select (maxW=200px)  — shown for front_desk / owner / admin, not doctor
  ├─ From date Input (type=date, maxW=150px)
  ├─ To date Input  (type=date, maxW=150px)
  └─ Stats (ml=auto): Total | Pending | Completed counts

ComplexTable (only if appointments.length > 0, else empty state Text)
4. Billing Page
Architecture
Code
BillsPage
  ├─ Reads GlobalFiltersContext: { clinicId, doctorId, doctorIdsEffective, fromDate, toDate }
  ├─ useBills({ clinicId, doctorId, doctorIds, fromDate, toDate, searchQuery, autoFetch })
  │     → returns { bills, loading, error, stats }
  ├─ Local stats computation from billsData:
  │     totalRevenue  = sum of paid bills' total_amt
  │     paidBills     = count where payment_action==="paid" OR receipt present
  │     pendingBills  = count where payment_action==="pending"
  │     bookedBills   = count where payment_action==="booked"
  ├─ onStatsUpdate(billsStats) callback to parent/header
  └─ ComplexTable with billscolumnsDataComplex columns
Bills Table Columns
Column	Accessor	Notes
Appointment Date	appointment_date	DD-MM-YYYY
Patient Name	patient_name	
Consultation Type	consultation_type	"in_clinic" → "In Clinic"
Service	service	comma-separated list → one item per line
Unit Price	unit_price	comma-separated → one ₹X per line
Discount	discount	comma-separated → "-" if zero
Total Amount	total_amt	₹{value}
Received Amount	received_amt	
Pending Amount	pending_amt	
Payment Status	payment_action	raw text
Payment Receipt	payment_receipt_urls	handled by ComplexTable receipt opener
Bill Invoice	bill_invoice	handled by ComplexTable invoice opener
Payment Status Logic (paid/pending/receipt detection)
js
// A bill counts as "paid" if:
const receiptPresent = !!(bill.payment_receipt || bill.payment_receipt_urls || bill.payment_receipt_url)
const action = String(bill.payment_action || bill.payment_status || bill.appointment_status || "").toLowerCase()
const isPaid = receiptPresent || action === "paid"
PaymentReceiptModal
Opened when clicking a "Pending" payment action button:

Code
PaymentReceiptModal
  Props: { isOpen, onClose, onPaymentConfirm, patientName, appointmentId }

  On open:
    → GET /api/bills/byAppointment?appointment_id=X  (or offline IndexedDB fallback)
    → Loads bill summary: grossAmount, subtotal, discount, tax, net, receivedAmt, pendingAmt
    → Detects refund case: payment_action==="REFUND-PENDING" && pending_amt < 0

  UI:
    ├─ Bill summary display (amounts)
    ├─ additionalReceived input (how much is being paid now)
    ├─ File upload field for receipt image/PDF
    ├─ Confirm button → marks payment, uploads receipt file
    └─ "View Bill" toggle → renders Bill component inline
5. Clinic Page (Organization/Clinic Management)
Architecture
Code
ClinicList
  ├─ useClinicList() hook
  │     → GET /api/clinic/allClinicsWithFullData (fallback: /api/clinic/allClinics)
  │     → normalizeClinic(raw) maps both camelCase and snake_case shapes
  │     → GET /api/clinic-locks → merges isLocked flag into each clinic
  │     → normalizedClinic shape: { id, clinicName, clinicEmail, phone, whatsapp,
  │           address, upiDetails, bankDetails, clinicIconURL, createdAt,
  │           ownerName, gstin, pan, isActive, isBlocked, gmeetStatus, ... }
  ├─ getAuthAccounts() → loads Google OAuth accounts for GMeet status
  ├─ tableData = clinics.map(c => ({
  │     ...normalizedClinic,
  │     gmeetStatus,           // derived: "connected" if clinicEmail in googleAccounts
  │     onEdit: () => handleEditClinic(c),
  │     onDelete: () => handleUn_LockClinic(c),   // toggles lock/unlock
  │     onUnlock: () => handleUnlockClinic(c),
  │   }))
  └─ ComplexTable with columnsData = [...clinicColumnsData, gmeetExtraColumn]
Clinic Table Columns
Column	Accessor	Notes
Logo	clinicIconURL	<Avatar src={value}>
Clinic	clinicName	bold text
Email	clinicEmail	
Phone	phone	
WhatsApp	whatsapp	
Address	address	
UPI Details	upiDetails	
Bank Details	bankDetails	
Actions	actions	Edit (blue) + Lock/Unlock toggle (red/green)
GMeet	injected	"Connected"/"Not Connected" button + refresh icon
Lock/Unlock Logic
Code
handleUn_LockClinic(clinic)
  → isLocked = clinic.isLocked ?? clinic.locked ?? false
  → action = isLocked ? "unlock" : "lock"
  → window.confirm(...)
  → PUT or POST /api/{lock-clinic|unlock-clinic}/{clinicId}
       tries /api prefix, methods: PUT then POST
  → on success: toast + refreshClinics()
GMeet Status Check
Code
checkGmeetStatus(clinic)
  → if no clinicEmail: GET /api/clinic/allClinicsWithFullData?id=X
       (fallback: /api/clinic/clinicById?id=X)
  → compare clinicEmail against googleAccounts[].account_email
  → show toast: connected / not connected
  → open GoogleCalendarWidget modal with { email, clinicId }
AddClinicModal (Creation)
Code
Form fields:
  ├─ Clinic Logo (file upload → /api/upload → get objectUrl)
  ├─ Clinic Name (required)
  ├─ Email (required)
  ├─ Phone (required)
  ├─ WhatsApp
  ├─ Address (required)
  ├─ Payment Details:
  │     UPI ID, Account Holder, Account Number, Bank Name, IFSC Code
  └─ Bar Code + QR Code (file uploads)

Submit flow:
  1. POST /api/clinic/addClinic
        { clinic_name, address, upi_details, bank_details, whatsapp_no, phoneno, clinic_email }
  2. Upload files: POST /api/upload (multipart) → get objectUrl
  3. POST /api/clinic/uploadFiles { id: clinicId, clinic_icon, bar_code, qr_code }
  4. onClinicCreated(clinicId) callback → refreshClinics()
Field errors use humanizeApiError('/api/clinic/addClinic', serverMessage) to map API error messages to field names.

ClinicEditModal (Edit)
Code
On open:
  → GET /api/clinic/clinicById?id={clinic.id}
  → mapClinicToForm(clinicData) normalizes camelCase/snake_case
  → parseBankDetails(bankDetailsString) parses "BankName, Holder: X, Account No: Y, IFSC: Z"

Form fields: identical to AddClinicModal minus file upload (files shown as preview images)

Submit flow:
  1. PUT /api/clinic/{clinicId}
        { id, clinic_name, clinic_email, phoneno, whatsapp_no, address, upi_details, bank_details }
     bank_details rebuilt by buildBankDetailsString(bank) → "BankName, Holder: X, Account No: Y, IFSC: Z"
  2. Upload changed files: POST /api/upload → get URL
  3. POST /api/clinic/uploadFiles { id: clinicId, clinic_icon?, bar_code?, qr_code? }
  4. onClinicUpdated() callback
6. Consultation / Session Page
Architecture
Code
ConsultationsView  (pure display component receiving all data as props)
  Props:
    userRole, userRic, isAdmin
    doctors, selectedDoctor, setSelectedDoctor
    fromDate, toDate, onFromDateChange, onToDateChange
    appointmentCounts: { total, pending, completed }
    consultationsData: []
    filterConsultations: (data, searchQuery) => filtered[]
    patientSearchQuery: string

  Layout:
    Filter + Stats bar (bg=white, p=20px, borderRadius=md, boxShadow=sm, justify=space-between)
    ├─ LEFT: Doctor Select + From date + To date
    └─ RIGHT: Three stat counters with CountUp animation
         ├─ Total Consultations (green, video icon)
         ├─ Incomplete (orange)
         └─ Completed (purple)

    ComplexTable with columnsDataConsultation columns
    (or empty-state message if consultationsData.length === 0)
Consultation Table Columns
Column	Accessor	Notes
QUEUE NO	queue	minWidth 100px
PATIENT NAME	name	minWidth 200px
AGE	age	
SEX	gender	
MOBILE NO.	mobile_no	
TYPE	type	Shows "Online" text + video call button if meet_link exists; button opens link in new tab
BOOKED BY	frontdesk_email	
SERVICE	service	
STATUS	status	Color-coded non-interactive badge: BOOKED→yellow, IN_PROGRESS→blue, COMPLETED→green, ARRIVED→purple, other→orange
Video Call Button Logic
jsx
// In TYPE column Cell:
const isOnline = String(value || "").toLowerCase() === "online"
const hasMeetLink = !!(row.original.meet_link || row.original.meeting_link || row.original.meetLink || row.original.meetUrl)

if (isOnline || hasMeetLink) → show IconButton (MdVideoCall icon, blue, ghost)
  onClick → window.open(meetLink, "_blank", "noopener,noreferrer")
  isDisabled if !hasMeetLink
Status Badge Colors (Consultation)
Status Value (normalized uppercase)	Color
BOOKED	yellow
IN_PROGRESS	blue
COMPLETED	green
ARRIVED	purple
anything else	orange
Note: These are non-interactive <Button pointerEvents="none"> used purely for color display. This differs from the appointment STATUS column which is interactive (BOOKED → click → ARRIVED).

7. Cross-Cutting Patterns
Global Filters Context
All pages read from useGlobalFilters():

js
const { filters, lists, actions } = useGlobalFilters()
// filters: { clinicId, doctorId, doctorIdsEffective, fromDate, toDate, roleContext }
// lists: { doctors, clinics }
// actions: { setFromDate, setToDate, setClinicId, setDoctorId }
Pages do not manage their own clinic/doctor/date state — they delegate to this context.

Action Callbacks Pattern
The table data is pre-enriched with action callbacks before being passed to ComplexTable:

js
tableData = rawData.map(row => ({
  ...row,
  onEdit:   () => handleEdit(row),
  onDelete: () => handleDelete(row),
  onUnlock: () => handleUnlock(row),   // clinic-specific
}))
Column Cell renderers call row.original.onEdit() etc. This keeps business logic in the page component and column definitions generic.

Socket Integration
ComplexTable subscribes to:

"appointment.status.updated" → { appointment_id, status, updated_at }
"payment.status.updated" → { appointment_id, status, receipt, updated_at }
Both handlers call setTableDataComplex(prev => prev.map(item => item.id === payload.appointment_id ? {...item, ...updates} : item)).

Offline Support
All data pages follow this pattern:

Code
if (!navigator.onLine) → load from IndexedDB (utils/offlineDB.js)
else → normal API call
  → on API error and offline → retry from IndexedDB
Pending status changes are queued in localStorage['offlineStatusQueue'] as [{ appointmentId, status }] and applied as overrides on the next online fetch.

File Upload Pattern
Code
// Single consistent flow used by AddClinicModal, ClinicEditModal, PaymentReceiptModal:
const uploadFile = async (file) => {
  const fd = new FormData()
  fd.append("file", file)
  const res = await axiosInstance.post("/api/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    maxBodyLength: Infinity,
  })
  return res.data.objectUrl || res.data.url
}
Summary: What to Implement per Module
Module	Key Component	Column Export	Data Source	Actions
Appointments	AppointmentTablePage + AppointmentsView	appointmentcolumnsDataComplex	POST getAppointmentsByDateRangeByDoctor	Status toggle (BOOKED→ARRIVED), Edit, Cancel+Refund
Billing	BillsPage	billscolumnsDataComplex	useBills hook	View receipt, View invoice, Mark payment (PaymentReceiptModal)
Clinic/Org	ClinicList	clinicColumnsData + gmeet column	GET allClinicsWithFullData + GET clinic-locks	Add (AddClinicModal), Edit (ClinicEditModal), Lock/Unlock
Consultation	ConsultationsView	columnsDataConsultation	Passed as prop from parent	Video call link, status display only