# Part 2 Screen Specifications — P2-01 to P2-12
### Kifayti Health — Dialysis Center Management System (KidneyCare Dialysis Center)
### Pre-Dialysis Stage — FINAL, Build-Ready Edition

Cross-checked against the Kifayti Health Compliance Bible v1.1, the Revised Hemodialysis
Technician Safety Protocol, Module 2 Part 1/Part 2 reference docs, nine colored Figma
exports (P2-01 through P2-10, with P2-12 paired alongside P2-04), and confirmed product
decisions from you across three review rounds. This supersedes the prior
`..._AUDITED_CONSOLIDATED` document — that document's decision trail is preserved below
in each screen's **Decision Log**, so nothing is silently dropped.

**Scope discipline (unchanged):** pre-dialysis stage only, P2-01 through P2-12.
Dialysis-machine operation, RO/water quality management, and inventory management
**during** and **after** dialysis remain out of scope.

**What changed since the last round:** every screen from P2-01 through P2-10, plus P2-12,
now reflects the actual Figma design (exact field labels, layout, component structure) —
tagged `[FIGMA-DERIVED]`. P2-11 has no Figma export; it's built from the restored
Specification-file wireframe reskinned to match the design system established by the
other nine screens — tagged `[SYNTHESIZED — NOT FIGMA-CONFIRMED]`, the one screen still
carrying that caveat. All prior open items except two are now closed (see Decision Log
Index below); the two still open are deliberately deferred, not blockers.

---

# Shared Platform Conventions
*(Stated once here; each screen's own sections below reference this rather than
repeating it, to keep the document usable rather than padded.)*

**Shell navigation** `[FIGMA-DERIVED]` — present on every screen: left sidebar with
KidneyCare Dialysis Center logo, then Pre-Dialysis, During Dialysis, Post Dialysis,
Patients, Schedule, Reports, Alerts (unread-count badge), Messages, Inventory, Settings;
footer shows the logged-in technician's name, role, an online-status dot, and Log out.
Top bar: facility selector ("Main Center" dropdown — confirms multi-center support),
notification bell with unread badge, technician avatar/name/role.

**Accessibility** (applies to all screens unless a screen-specific note overrides):
WCAG 2.1 AA target; touch targets ≥44px; full keyboard navigation; status is always
conveyed by icon + text + color together, never color alone (consistent with the
green-check/amber-clock/gray-circle pattern used throughout the Figma exports); minimum
4.5:1 text contrast.

**Loading States:** skeleton placeholders shaped like the eventual content (card
skeletons, table-row skeletons).

**Error Handling:** inline field-level validation messages; non-blocking toast for
background sync failures; blocking modal reserved for safety-critical validation
failures (e.g., identity mismatch, infected-access-site warning).

**Offline Behavior:** technician-entry screens (P2-04 through P2-07, P2-10, P2-11)
support local draft-save with sync-on-reconnect, matching the visible "Save as Draft"
button on every one of these screens in the Figma exports. Upstream/read-only screens
(P2-08, P2-09) show last-synced data with a visible timestamp.
`[PROPOSED]` **★ COMPLIANCE ADDITION — Bible §4.D/DPDP Rule 6(a) and Bible §2.18:**
locally-drafted patient/session data on every one of these offline-capable screens is
encrypted at rest on-device, using the same encryption standard already applied to
P2-12's stored PIN (not a live-server-only control) — pending engineering confirmation
of the exact mechanism (e.g. platform keystore/keychain-backed encryption). This closes
the gap where only the PIN had an explicit at-rest encryption statement while offline
patient/clinical data did not.

**Audit logging & retention** — Bible §4.D / DPDP Rule 6(c) and §4.F / Rule 8(3): every
state-changing action on every screen below logs `user_id, role, patient_id, session_id,
timestamp (UTC + IST), action, and action-specific payload`, retained a minimum of
**1 year**. Stated once here; each screen's Audit Events section lists only its
screen-specific event names, not this boilerplate.

**Timestamps:** displayed in Asia/Kolkata (IST), per P2-03's own footer note "All times
are in Asia/Kolkata (IST)."

**★ COMPLIANCE ADDITION — Sensitive-field access scoping (Bible §5.8/HIPAA minimum-
necessary):** every screen in this document is already restricted to Technician, Nurse,
and Nephrologist roles only (no broader administrative role reaches P2-01 through
P2-12). This role scoping applies to **all** clinically sensitive data displayed on
these screens — lab results (P2-02), assessment findings (P2-06), vascular-access
findings (P2-07), and HIV/Hepatitis status (P2-04, per the existing Cross-Screen
Business Rule) alike — not just the HIV/Hepatitis fields called out individually
elsewhere in this document. Stated once here rather than repeated per field/screen.

**Standard field-range reference values** `[FIGMA-DERIVED]`, from P2-05's Quick
Reference panel: BP < 140/90 mmHg; Pulse 60–100 bpm; Temperature 36.0–37.5 °C; SpO₂ ≥ 95%;
Weight Gain target 1.0–3.0 kg; UF Goal as prescribed.

**Checklist failure state — "Action Required" banner** `[DESIGN SPECIFICATION — added
this round, not Figma-confirmed]`. P2-07, P2-08, P2-09, and P2-10 all share the same
banner pattern at the bottom of their checklist/assessment table (visible in every one
of the nine Figma exports, always in its green all-clear state). None of the four
exports show what happens when something fails. Since all four already share identical
green-state styling, they should share identical failure-state styling too — specified
once here rather than four times:

- **Row-level state:** a failing row's status control (the pill on P2-08/P2-09/P2-10,
  the selected option on P2-07's Findings column) switches from its green
  "OK"/"Yes"/"Present"/etc. styling to red, using the same red family already
  established elsewhere in this document (P2-02's High/Low lab flags, the Critical-tier
  vitals styling on P2-05). The row's "Details (if Abnormal)"/"Action" cell — currently
  shown as a muted placeholder in every all-clear export — becomes an active,
  required text-entry field the moment that row fails, and an "Action" button appears
  (label varies by screen: "Retry Test" for an instrument reading on P2-08/P2-09,
  "Escalate" for a clinical finding on P2-07/P2-10).
- **Banner-level state:** the green "Action Required... [screen] suitable/complete/
  compliant" banner switches to red, its checkmark icon becomes a warning icon, and its
  copy names the specific failed item(s) rather than a generic message — e.g. (P2-07)
  "Signs of Infection detected. Do not cannulate this access — escalate before
  proceeding," (P2-08) "2 checklist items failed: Blood Leak Detector, TMP Sensor.
  Resolve or escalate before proceeding," (P2-09) "Chlorine (Free) outside acceptable
  range. Resolve before this water source can be used," (P2-10) "Hand Hygiene not
  confirmed. Complete before proceeding."
- **Blocking behavior — superseded this round, see below:** any Critical-tier field
  failing/unresolved disables Save & Continue on that screen, no override, no skip —
  this part is unchanged. What *is* new: fields are now split into **Critical**
  (mandatory, hard-blocks, matches this bullet) and **Non-Critical** (non-mandatory,
  skippable-with-reason) — see the new "Non-Mandatory Field Skip Workflow" section
  immediately below, which fully replaces the previously-open nurse/nephrologist
  override question. There is no override path in the final design — a Non-Critical
  field is skippable by the technician alone (with or without a reason), and a
  Critical field is never skippable by anyone, including a nurse or nephrologist.
- Each screen's own Validation Rules/Decision Trees section below states only what's
  specific to that screen (which fields are Critical vs. Non-Critical, what the banner
  copy names); the shared mechanics above aren't repeated per screen.

---

# Cross-Screen Business Rule — Non-Mandatory Field Skip Workflow & Daily Staff Digest
*(New this round, replacing the previously-open override question — your direction,
applied verbatim across every checklist/assessment screen in this document.)*

## Why this exists
Every checklist/assessment field in Parts 2 (and, by the same rule, Parts 3–4 once this
pattern is carried forward) is now classified **Critical** or **Non-Critical** — see
each screen's own Mandatory Fields section for the specific split, and the
Critical/Non-Critical Field Classification reference table at the end of this section
for the full rationale. **Critical fields are mandatory and hard-block** — a technician
cannot proceed with a Critical field unresolved, under any circumstances, by anyone.
**Non-Critical fields are non-mandatory** — a technician may leave one blank and
proceed, but the system never lets this happen silently.

## The skip flow (per field, at the moment of Save & Continue)
1. Technician attempts to proceed with one or more Non-Critical fields left blank.
2. A warning popup lists every blank Non-Critical field by name and asks the technician
   to either go back and complete it, or confirm the skip.
3. If confirming the skip, an optional **Reason** text field is offered (0/200 chars)
   for each skipped field. The technician may enter a reason or leave it blank and
   click **Skip**.
4. Whether or not a reason was entered, the skip is logged — see Database Mapping below.
   This is never silent: every skip of every Non-Critical field, explained or not,
   creates a record.
5. Save & Continue proceeds normally once the popup is dismissed either way (Complete or
   Skip) — this does not block the technician's workflow, per your instruction that the
   technician should be able to continue.

## Backend logging
`[PROPOSED]` **New** `checklist_skip_log` (skip_id, technician_user_id, patient_id,
session_id, screen_id [e.g. "P2-06"], section [e.g. "Subjective Assessment"],
field_name, reason [nullable], skipped_at). One row per skipped field, not per skip
event — if a technician skips 3 fields in one popup confirmation, that's 3 rows.

## Daily digest to the doctor
Per your specification, collated **per technician/nurse, per calendar day**, not per
session:
- **Unexplained skips** (reason is null) across every session that staff member worked
  today → one single **Alert** to the doctor, listing that staff member's name, every
  affected patient, session time, and which checklist points were skipped in which
  section, across all their sessions that day.
- **Explained skips** (reason provided) across every session that staff member worked
  today → one single **Notification** to the doctor (explicitly not an Alert — a lower
  urgency, informational channel) with the same level of detail plus the reasons given.
- **Trigger:** whichever happens first — that staff member's logout, or 11:59:59 PM
  local time. A staff member who never logs out still gets their digest at the day
  boundary; one who logs out mid-afternoon gets it immediately rather than waiting
  until midnight.
- **Scope:** every technician and nurse in the center, independently — each staff
  member's Alert and Notification are separate messages to the doctor, never merged
  across staff members, even if sent at the same 11:59:59 PM boundary.
- `[PROPOSED]` **New** `staff_daily_digest` (digest_id, technician_user_id, digest_date,
  digest_type [Alert/Notification], generated_at [logout time or 11:59:59 PM],
  skip_ids [array, referencing checklist_skip_log], sent_to [doctor's user_id],
  sent_at).
- `[OPEN — confirm]` if a staff member has zero skips (fully clean day), does this
  suppress both messages entirely (no digest sent), which is the assumed default, or
  do you want a positive "0 skips today" confirmation sent as well? Not specified in
  your instructions; flagging rather than assuming.

## Audit Events
`checklist_field_skipped` (field_name, reason_provided: bool), `skip_popup_shown`,
`daily_digest_generated` (staff_id, type, item_count), `daily_digest_sent`.

## Critical/Non-Critical Field Classification — reference table
Applied per-screen in each screen's own Mandatory Fields section below. Summary
methodology: **Critical** = a nephrologist-recognized immediate threat to patient life,
or a named Safety Protocol emergency/Mandatory-Adverse-Event trigger. **Non-Critical** =
clinically relevant but not independently an acute, same-session threat. Full
field-by-field classification with sources is in each screen's Mandatory Fields
section; the underlying research (EXITA Study for CVC findings, Safety Protocol's own
Emergency Preparedness Standards and Mandatory Adverse Event Documentation lists for
symptom/vascular-access/machine items, CDC Core Interventions for infection-control
items) is not repeated per screen.

---

# Cross-Screen Business Rule — HIV / Hepatitis Status Gate
*(New this round, per your instructions. Applies primarily to P2-04, referenced from
P2-03; not a standalone screen.)*

- **Source:** patient table, populated by the doctor or technician elsewhere in the
  system (not entered fresh on these screens). If not yet recorded, the field state is
  **Pending**, not blank.
- **Display:** an HIV Status and a Hepatitis B/C Status field, each one of
  Negative / Positive / Pending, shown on P2-04 (Patient Verification) alongside the
  existing identity/prescription checklist, and summarized on P2-03's patient banner.
- **Mandatory-but-pending gate:** if either field is Pending when the technician attempts
  to proceed, a **blocking alert** fires: *"HIV / Hepatitis status not recorded — required
  before proceeding."* Two options: **Enter now** (opens a status-entry control for
  technician or doctor) or **Skip** — Skip is permitted, but logs an alert to the
  nephrologist and creates an audit-trail entry tagged `safety_field_skipped`.
- **Positive-status handling:** confirmed with you — the **hard rule** that a
  Positive patient may only be assigned to an isolation-designated machine/bed is
  enforced upstream, in the Schedule module (out of scope for this document), since
  bed/machine assignment has already happened by the time a patient reaches P2-01's
  queue. **Within this document's scope**, P2-04 still displays the status and, if a
  Positive patient is somehow found assigned to a non-isolation bed (e.g., status entered
  or changed after scheduling), shows a blocking alert requiring nurse/nephrologist
  override, with an audit entry.
- **[COMPLIANCE ADDITION]** Bible §5.8 (minimum necessary): HIV/Hepatitis status is
  sensitive health data — access restricted to Technician/Nurse/Nephrologist roles, not
  broader administrative roles.
- **API/DB:** `PROPOSED` — GET reads `hiv_status`, `hepatitis_status` from the shared
  `patient` table (owned by another module, read-only here); a
  `safety_field_skip_events` table (patient_id, field, skipped_by, timestamp,
  nephrologist_alerted) captures the skip path. Needs engineering confirmation.

---

# Cross-Screen Business Rule — ABDM Consent Revocation: PII Anonymization & Access Gate
*(New this round, per your instructions. Applies to every screen in this document that
displays patient-identifying information — confirmed instances: P2-01 (queue row),
P2-02 (Patient Summary banner), P2-03 (Dashboard banner), P2-04 (Verification banner),
P2-12 (Start Dialysis Confirmation banner) — and, by the same rule, any other screen in
this document whose patient header displays PII, since the header pattern is shared
platform-wide per Shared Platform Conventions.)*

## Trigger
The patient (or their nominee, per DPDP Rule 14) revokes ABDM consent for this facility
between registration and any point in the pre-dialysis workflow. This is distinct from,
and narrower than, the F2 right-to-deletion scope already recorded in the Decision Log
Index — F2 governs an explicit deletion *request*; this rule governs a consent
*revocation* event, which this document now treats as also triggering anonymization,
not merely a display-blocking flag.

## What gets anonymized
On a consent-revocation event for a patient, the following fields are irreversibly
anonymized/deleted wherever they appear across the patient's record (not just on these
screens — this is a data-layer effect these screens must reflect, not cause):
Name, Date of Birth, Address (all components except State), Photo, Phone Number, Email
ID, Emergency Contact details, ABHA number, Aadhaar number, PAN number, Below-Poverty-
Line card number (or any other government ID number), Credit Card / Debit Card
information, and UPI ID.
Longitudinal clinical/disease data (diagnoses, session history, lab results, vitals) is
**not** included in this anonymization set and is retained, consistent with F2.

## Role-differentiated access after anonymization
- **Technician:** view is **blocked entirely** for this patient across every screen in
  this document (P2-01 queue row through P2-12) the moment consent is revoked. The
  technician cannot open, search for, or select this patient going forward.
- **Doctor (Nephrologist):** retains access, but only to the **anonymized** record —
  every screen's patient banner/header displays the anonymized field set (e.g. an
  anonymized identifier in place of name/photo, State-only address) rather than the
  original PII, with clinical/disease data unaffected.
- **Nurse:** role not specified in your instruction — `[OPEN — confirm]` treated as
  following the Technician-block behavior by default (nurses are grouped with
  technicians for other access-control purposes in this document, e.g. the
  HIV/Hepatitis gate above), pending your confirmation this should instead follow the
  Doctor/anonymized-access path.

## Screen-level behavior (this document's scope)
- **P2-01 (Queue):** a consent-revoked patient's row is removed entirely from the
  Technician's queue view; for a Doctor viewing the queue (if applicable), the row shows
  the anonymized identifier instead of name/photo.
- **P2-02, P2-03, P2-04, P2-12 (patient banner screens):** Technician attempting to
  reach any of these for a consent-revoked patient is blocked with a message naming the
  reason ("Patient consent has been revoked. This record is no longer accessible to
  Technician role."); Doctor sees the same screen with the banner's PII fields replaced
  by the anonymized values.
- **P2-05 through P2-11:** inherit the same block/anonymize behavior via the shared
  patient-header pattern; no screen-specific exceptions.

## Audit Events
`consent_revocation_anonymization_applied` (patient_id, fields_anonymized[], triggered_at),
`consent_revoked_access_blocked` (patient_id, user_id, role, screen_id, attempted_at).

## API/DB
`[PROPOSED]` — anonymization itself is a data-layer operation owned by another module
(likely Registration/Patient Master, not this document); these screens' read APIs must
respect a `patient.consent_status` (Active/Revoked) flag and a
`patient.anonymized` (boolean) flag on every GET that returns patient PII, gating
render accordingly. Needs engineering confirmation of exactly where the anonymization
job itself runs.

## Still open
- Nurse role treatment (block vs. anonymized-access) — see above, not assumed.
- Whether "Doctor" here means Nephrologist only or also any MO role referenced
  elsewhere in the platform — this document only has a Nephrologist role defined; not
  assumed to extend further without confirmation.

---

# Cross-Screen Calculation — UF Goal Formula
*(New this round. Feeds P2-05's Auto-calculations, referenced from P2-04's prescription
display.)*

**Formula, with sources:**
> **UF Goal = (Pre-dialysis Weight − Estimated Dry Weight) + Patient-Specific Fluid
> Allowance**
>
> Patient-Specific Fluid Allowance = Heparin solution volume (custom dose if the doctor
> has prescribed one, else facility-standard dose) + facility-standard saline flush
> volume.

- Sourced from two converging references: a nephrology-nurse training formula
  (UFgoal = UFnet [pre-weight − dry-weight] + medications + saline flushing + backwash) ¹,
  and a hemodialysis-device clinical-trial protocol defining UF goal as starting weight
  minus target weight, plus prime/rinseback volume and fluid adjustments ². The numbers
  on your own P2-05 screen (68.5 kg pre-weight, 67.0 kg EDW → 1.5 kg net, but a 2.0 L UF
  Goal) match this additive structure — the ~0.5 L gap is exactly the kind of
  heparin+flush allowance both sources describe.
- **Heparin IU→mL conversion — confirmed this round.** Standard facility vial
  concentration: **5,000 Units per 1 mL** (your confirmed default). Conversion:
  **Volume (mL) = Ordered Dose (Units) ÷ Concentration (Units/mL)**. Worked example, as
  you gave it: an ordered dose of 2,500 Units ÷ 5,000 Units/mL = 0.5 mL. This
  concentration is a **facility-configurable value**, not hardcoded — if a center stocks
  a different vial strength, this ratio must be editable, but 5,000 Units/mL is the
  confirmed default. The prescription's IU dose is converted to mL via this formula at
  the moment the UF Goal is calculated, rather than requiring the technician to do the
  arithmetic or enter a volume directly.
- **Doctor-override behavior (confirmed):** if the prescription specifies a heparin dose
  different from the facility standard, the technician's UF Goal calculation uses the
  **prescribed custom value**, not the facility default. This makes the UF Goal
  calculation prescription-dependent, not a fixed constant — the formula must re-read the
  prescription's heparin field each time, not cache a facility-wide constant.
- **UF Rate validation:** UF Rate (mL/kg/hr) = UF Goal (mL) ÷ Treatment Duration (hr) ÷
  weight (kg) — the CMS/NKF-KDOQI-referenced definition ³. **No single international
  ceiling exists** — US KDOQI cites 13 mL/kg/hr (flagged as itself controversial by
  KDOQI's own 2016 Controversies Report) ⁴; Japan's JSDT guideline recommends ≤15 mL/kg/hr ⁵;
  broader literature shows risk rising continuously from ~10 mL/kg/hr ⁶. No Indian
  Society of Nephrology numeric threshold was found in available sources.
  **[COMPLIANCE ADDITION — recommend facility-configurable threshold**, defaulting to
  13 mL/kg/hr, **with Dr. Mohan Rajapurkar's sign-off** on the production value — this is
  a clinical-protocol decision, not a documentation one.**
- **Duration/rate escalation (per your description):** if the standard prescribed
  duration and the machine's standard flow rate cannot achieve the UF Goal without
  exceeding the safe UF-rate ceiling (fluid-overload scenario), this is Critical-tier
  per P2-05's Validation Rules — **hard block, no override**, resolved by the same
  "no override on Critical fields" principle established across this document (Shared
  Platform Conventions, Non-Mandatory Field Skip Workflow). This supersedes the earlier
  open question about hard-block-vs-soft-warning; Critical always hard-blocks now, with
  no separate decision needed for this specific scenario. Actually increasing the flow
  rate is a During-Dialysis-stage action, out of scope here.

**References:** ¹Nurse Germz, "Understanding UF Ultrafiltration Goals Formula"
(nursegermz.com) — training-center reference, cited for structure only, not authority.
²HemoCare™ Hemodialysis System study protocol, ClinicalTrials.gov NCT04087213.
³Ultrafiltration Rates and the QIP, *CJASN*, PMC4974895. ⁴Rocco et al., "Ultrafiltration
Rate Thresholds in Maintenance Hemodialysis: An NKF-KDOQI Controversies Report," *AJKD*
2016 (PubMed 27449697). ⁵Japanese Society for Dialysis Therapy 2013 guideline, cited via
PMC8518149. ⁶Flythe 2011; Movilli; DOPPS cohort data, cited via Oxford *Clinical Kidney
Journal* 2025 review (academic.oup.com/ckj) and kireportscommunity.org summary.

---

# Decision Log Index
*(All items resolved across this and prior rounds. Full detail lives in each screen's own
Decision Log; this index is for quick reference.)*

| # | Topic | Resolution |
|---|---|---|
| F1 | ABHA / registration data | Captured in a separate Registration module, already in the `patient` table — read-only reference here. |
| F2 | Right-to-deletion scope | Personal identifiers only (name, address minus state, phone, DOB, payment, insurance, emergency contact) deleted on request; longitudinal clinical/disease data retained. |
| F6 | Patient phone number on-screen | Confirmed necessary for Technician role — kept. |
| F7 | Clinician identity model | Simple free-text clinician name, no HPR linkage, for now. |
| F8 | Vitals/machine/water data source | Manually entered by technician, not device-fed. |
| F10 | Terminology | "Bed" (not "Station"), format `B-02 / HD-01` for Bed/Machine; button labels per-screen, see each screen below. |
| S4 | Allergies source | Patient table, populated by the (already-deployed) Telemedicine Prescription module — not entered on these screens. |
| S5 | UF Goal formula | Resolved — see Cross-Screen Calculation above. |
| S6 | RR/SpO2 mandatory? | Not mandatory. |
| S9/S10 | P2-07 access-type branching | Resolved — AVF/AVG vs. CVC branching now fully specified. |
| S12 | P2-08/P2-09 vs. Part 5 | **CLOSED.** Part 5 now exists; P2-08/P2-09 rewritten as read-only reviews of P5-02/P5-03/P5-04, resolving both S12 and the read-only/editable question. |
| O1/S17 | Double-verification workflow | Out of scope by decision — not captured in this build. |
| O2 | HIV/Hepatitis isolation assignment | Hard rule enforced upstream (Schedule module, out of scope); status display + skip-alert gate is in scope — see Cross-Screen Business Rule above. |
| — | P2-04 progress bar (7 steps vs. 9 elsewhere) | Confirmed intentional — left as-is. |
| — | P2-10/P2-11/P2-12 wireframe restoration | Confirmed. |
| — | P2-11 Figma | Not available — synthesized from restored wireframe + design system, tagged accordingly. |
| **Still open** | *(none from the original "deferred to Part 5" list — both closed this round)* | Part 5 (P5-01 to P5-10) is now complete; see that document for the full machine/RO ownership model. |
| C1 | Offline patient/session data encryption | **Closed, this round.** Encrypted at rest on-device, matching the P2-12 PIN standard — see Shared Platform Conventions, Offline Behavior. `[PROPOSED]` pending engineering confirmation of exact mechanism. |
| C2 | ABDM consent-revocation display/access | **Closed, this round.** Full PII anonymization + Technician block / Doctor anonymized-access — see new Cross-Screen Business Rule — ABDM Consent Revocation. Nurse role treatment still open (see that section). |
| C3 | Sensitive-field role scoping beyond HIV/Hepatitis | **Closed, this round.** One global note added (Shared Platform Conventions) confirming all sensitive fields inherit the existing Technician/Nurse/Nephrologist-only screen gating — no per-field engineering change needed since that gating already exists platform-wide. |
| C4 | ABHA display on these screens | **Confirmed, no change.** Intentionally not shown on P2-01–P2-12 (technician workflow doesn't need it); no edit made per your instruction. |

---

# P2-01 — Today's Patient Queue

## Decision Log (this screen)
F10 resolved: column is **Bed** (not "Station"); Bed values like B-02. KPI tiles, filters,
and legend now fully documented from the Figma export below.

## Screen Objective
Enable technicians to quickly identify and select the correct patient for today's
dialysis session, with an at-a-glance view of daily queue status.

## Clinical Rationale
Reduces patient identification errors and ensures the technician has the latest
treatment context before starting the pre-dialysis workflow.

## Users
Dialysis Technician (primary, edit); Nurse, Nephrologist (view).
**Updated this round:** the "Mark Emergency" action is a genuine data-modifying action,
confirmed available to technicians and other team members (exact role list beyond
Technician not specified by you — treating as Technician + Nurse pending further
confirmation, since Nephrologists are marked view-only everywhere else in this
document and this action doesn't fit that pattern). This supersedes the prior note
that "no data-modifying actions exist on this screen regardless of role."

## Navigation
Landing screen under "Pre-Dialysis" in the left sidebar. Selecting a patient (row click,
eye icon, or arrow icon) opens P2-02 Patient Summary.

## Wireframe
`[FIGMA-DERIVED]`
```
Top bar: [KidneyCare logo] ... [Main Center ▾] [🔔5] [⛶]
Page header: "Pre-Dialysis" (hamburger menu)
Title: "Today's Patient Queue"                    [Date picker: 26 May 2025] [Refresh]
KPI row: [28 Total Patients] [8 Completed] [14 In Progress] [6 Pending/Delayed]
Filter bar: [Search by name or ID] [All Shifts▾] [All Status▾] [All Beds▾] [Columns]
Table: # | Patient(photo+name+PID) | Shift/Time | Bed | Status(chip) | Priority(dot+label) | Actions(👁 → ⚡Mark Emergency)
Footer: "Showing 1 to 7 of 28 patients"                    [Pagination: 1 2 3 4 →]
Legend: Status Legend (Scheduled/Pending/In Progress/Completed, colored dots)
        Priority Legend (High/Medium/Low, colored dots)
Sidebar footer: [Rahul Singh, Technician, ● Online] [→ Log out]
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar (facility selector, notification bell + badge, fullscreen
toggle) → Page Title + hamburger → Toolbar (date picker, Refresh button) → KPI Summary
Row (4 stat cards) → Filter Bar (search, 3 dropdowns, Columns selector) → Data Table
(7 columns as above) → Pagination Footer → Legend Panel (Status Legend, Priority Legend)
→ Sidebar shell (see Shared Platform Conventions).

## Layout Grid
12-column responsive grid; sidebar fixed-width (≈220px); header/toolbar fixed, table
body scrollable.

## Field Definitions
`[FIGMA-DERIVED]`
| Field | Notes |
|---|---|
| Patient photo/avatar | thumbnail |
| Patient Name + PID | e.g. "Ramesh Kumar / PID: P10023" |
| Shift/Time | Morning 07:00 AM / Mid-day 11:00 AM / Evening 04:00 PM |
| Bed | e.g. B-02 |
| Status | Scheduled / Pending / In Progress / Completed |
| Priority | High / Medium / Low, colored dot |
| KPI tiles | Total Patients, Completed, In Progress, Pending/Delayed — aggregate counts |
| **[NEW]** Arrived flag | boolean — confirmed by reception/check-in, feeds the absent-slot backfill rule in Business Rules |
| **[NEW]** Paid flag | boolean — confirmed by billing, feeds the same backfill rule; a patient needs both Arrived and Paid to receive a backfilled slot |
| **[NEW]** Emergency flag | boolean, manually settable by technician/team member at any time — moves the patient to front-of-queue regardless of shift |

## Input Types
`[FIGMA-DERIVED]` Search box ("Search by name or ID"); 3 filter dropdowns (All Shifts,
All Status, All Beds); Columns selector (column visibility toggle); date picker; primary
Refresh button; row-level view (eye) and proceed (arrow) icon buttons. **[NEW, confirmed
this round]** row-level "Mark Emergency" action (⚡) — a data-modifying action available
to the technician (and per your general framing, team members), which is why the
"no data-modifying actions on this screen" note in Users above is now superseded — see
Users update.

## Mandatory Fields
N/A — this is a read-only listing screen; no data entry.

## Validation Rules
Only scheduled patients for the selected date display.

## Business Rules
**Confirmed by you this round.** Patients sorted by scheduled shift (Morning →
Mid-day → Evening), then within-shift by arrival/slot order — with **Emergency
patients always taking highest priority in the queue**, ahead of the normal
slot-time order, regardless of shift. **Absent-slot backfill:** if a scheduled
patient is absent, the next available patient who has both **arrived** and
**paid** (per system flags) is given the now-empty slot, rather than leaving it
idle. **Manual override, always available:** a technician or team member can
reassign any patient as Emergency at any time, which moves that patient to the
front of the queue immediately — this is a standing manual action, not a
one-time triage step. PID-ascending is no longer the tie-breaker; it's
superseded by this arrival/payment/emergency-status logic.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
above. A consent-revoked patient's row is removed from Technician queue view entirely;
Doctor view (if applicable) shows the anonymized identifier in place of name/photo.

## Clinical Rules
**Confirmed by you this round.** The Alerts card (P2-02) does have a severity concept —
Critical / Warning / Info — resolving the open question about whether severity exists
at all. Two important clarifications from your answer, both now reflected here rather
than assumed: (1) this Alerts card is **technician reference only**, and in Indian
practice technicians primarily act on **machine-derived** alerts, not lab-derived ones;
(2) lab-report-derived alerts are prescribed only monthly or every 15 days (per your
other, unprovided module), so they carry limited same-session urgency for a
technician, and the **doctor already receives lab-derived alerts separately** through
that other part of the system — this Part 2/3 Alerts card is not the doctor's
notification path for those. Given this, **no additional row-level Critical-alert
indicator is added to this screen's queue table** — the existing Priority dot remains
the only row-level signal, and a technician who needs alert detail opens P2-02 as
before. This resolves the open item without adding new UI.

## Auto-calculations
The four KPI tiles are calculated aggregate counts across today's scheduled sessions.
**Refresh trigger confirmed by you this round:** the queue refreshes automatically
whenever a dialysis session completes (in addition to the manual Refresh button and
the eye/arrow row actions) — not a fixed polling interval. This replaces the earlier
open "polling interval" question with an event-driven refresh instead.

## Decision Trees
Patient row selected → open P2-02 Patient Summary.

## API Requests
`[PROPOSED]` `GET /sessions/today?shift=&status=&bed=&search=&page=` — needs engineering
confirmation, including whether KPI counts are returned inline or via a separate
`GET /sessions/today/summary`. **[NEW]** `POST /sessions/{id}/mark-emergency` — sets
`is_emergency=true`, triggers immediate queue reorder and refresh.

## API Responses
`[PROPOSED]` Per-patient: photo URL, name, PID, shift/time, bed, status, priority; plus
KPI aggregate object; plus total-record count for pagination.

## Database Mapping
`[PROPOSED]` `patient` (read-only reference), `session_schedule` (bed/shift/status,
**arrived [bool], paid [bool], is_emergency [bool, technician-settable]** — owned
upstream by the Schedule module per the HIV/Hepatitis discussion above — this screen
reads bed/shift/status but now **writes** `is_emergency` directly, per the confirmed
Mark Emergency action).

## Audit Events
`patient_row_opened`, `queue_refreshed` (manual, event-driven-on-session-complete, or
polling), `queue_filtered`, `patient_marked_emergency` — see Shared Platform
Conventions for required fields and 1-year retention (applies to all events below,
this note not repeated per screen again).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Network failure on load/refresh → retry affordance + toast; per Shared Platform
Conventions.

## Empty States
No patients scheduled for the selected date/filters → empty-state illustration + message
(exact copy **[OPEN]**, not in Figma).

## Loading States
Skeleton table rows + skeleton KPI tiles while loading.

## Offline Behavior
Last-synced queue shown read-only, consistent with Shared Platform Conventions'
upstream-screen pattern (queue data originates from the Schedule module).

## Acceptance Criteria
Technician can locate and open the correct patient within 10 seconds using
search/filter/sort.

## Test Cases
Filter by shift/status/bed; search by name/ID; pagination; KPI counts match filtered
table contents; empty-date-range state; offline/last-synced display.

## Future AI Enhancements
Risk-based prioritization suggestions layered onto the Priority column.
**[COMPLIANCE ADDITION]** Bible §6.8 (by analogy): any AI-suggested priority must be
clearly labelled as algorithmic and must not silently override a clinician-set Priority
value.

---

# P2-02 — Patient Summary

## Decision Log (this screen)
F10 resolved: primary action button reads **"Proceed to Pre-Dialysis Dashboard"**
(not "Start Pre-Dialysis"). F6 resolved: phone number confirmed necessary, kept as-is.

## Screen Objective
Provide a concise clinical overview — prescription, vitals, labs, alerts, notes — before
the technician proceeds into the pre-dialysis workflow.

## Clinical Rationale
Gives the technician the full clinical context (not just identity) needed to safely
begin pre-dialysis, surfacing any standing alerts before work starts.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).
**Confirmed by you this round:** "Proceed to Pre-Dialysis Dashboard" is
**Technician-only** — Nurse and Nephrologist are explicitly restricted from this
action (code the restriction, per your instruction). "View Full Profile" is **open to
all three roles**. `[OPEN — residual]` "Edit Info" role-gating wasn't addressed in
your answer, which covered only the other two buttons — leaving this as still open
rather than guessing a default, since Edit Info is a data-modifying action and I'd
rather ask than assume it inherits either neighbor's rule.

## Navigation
Opened from P2-01 (row click). "← Back to Queue" returns to P2-01. "Proceed to
Pre-Dialysis Dashboard" advances to P2-03.

## Wireframe
`[FIGMA-DERIVED]`
```
Top bar: [← Back to Queue] ... [Main Center ▾] [🔔5]
Title: "Patient Summary"
Patient banner: [photo] Ramesh Kumar [PID:P10023] [Active Patient]
  58 Years, Male | 📞 +91 98765 43210 | First Dialysis: 12 Jan 2023 (2y 4m) | Regular Schedule: Mon,Wed,Fri
  Nephrologist: Dr. Neha Mehta | Primary Diagnosis: CKD - Stage 5D | Dialysis Type: Hemodialysis | Vascular Access: AV Fistula (Left)
Tab bar: [Overview*] [Medical] [Dialysis History] [Medications] [Allergies] [Documents] [Notes]
Row 1: [Current Prescription card]                | [Latest Vitals card (24 May 2025)]
Row 2: [Recent Labs card (22 May 2025)]            | [Alerts card]
Row 3: [Notes card, full width]
Footer: [Edit Info] [View Full Profile]              [Proceed to Pre-Dialysis Dashboard →]
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Back-to-Queue link → Patient Banner (photo, name, PID,
status badge, demographics, contact, First Dialysis date+duration, Regular Schedule,
Nephrologist, Primary Diagnosis, Dialysis Type, Vascular Access) → Tab Bar (7 tabs,
Overview active) → 2-column Card Grid (Prescription, Vitals / Labs, Alerts / Notes
full-width) → Footer Action Bar.

## Layout Grid
12-column responsive grid; header fixed, content scrollable.

## Field Definitions
`[FIGMA-DERIVED]`
| Card | Fields |
|---|---|
| Current Prescription | Dialyzer (Fresenius FX 80), Blood Flow Rate (350 mL/min), Dialysate Flow Rate (500 mL/min), Dialysis Time (4:00 hrs), Heparin (2000 IU bolus + 500 IU/hr), "Last Updated: [date] by [clinician]" |
| Latest Vitals (dated) | BP (138/82 mmHg), Pulse (78 bpm), Temperature (36.8°C), SpO₂ (98%), Weight (Pre) 68.5 kg, Weight (Post) — |
| Recent Labs (dated) | Hemoglobin 9.6 g/dL (Low), K+ 5.2 mEq/L (High), Urea 168 mg/dL (High), Creatinine 9.8 mg/dL (High), Albumin 3.6 g/dL (Low) |
| Alerts | High Potassium (22 May 2025), Low Hemoglobin (22 May 2025), Fluid Overload Risk (20 May 2025) — **each carries a severity: Critical / Warning / Info, confirmed this round.** These are technician-reference alerts, primarily lab-derived; in Indian practice technicians act mainly on machine-derived alerts (surfaced during the session itself, not here), and lab-derived alerts like these carry less same-session urgency since labs are only drawn monthly or every 15 days. The doctor receives lab-derived alerts through a separate module, not this card. |
| Notes | free-text entries with author + date, e.g. "Patient feels tired post dialysis. Monitor IDWG. — Added 22 May 2025 by Dr. Neha Mehta" |

## Input Types
Tab selector; "View All" links per card (Vitals, Labs, Alerts, Notes); three footer
action buttons. No direct data entry on this screen (Edit Info opens a separate flow,
out of this screen's scope).

## Mandatory Fields
N/A — read-only summary screen.

## Validation Rules
"Proceed to Pre-Dialysis Dashboard" disabled if no active prescription exists for today.

## Business Rules
Only the most recent prescription is shown on Overview; prior versions live under the
Dialysis History tab. Only the most recent vitals/labs entries shown, with "View All"
for history.
**★ COMPLIANCE ADDITION — resolved this round.** Bible §2.15/2.16: see Cross-Screen
Business Rule — ABDM Consent Revocation, above. If this patient's consent is revoked,
Technician access to this screen is blocked entirely; Doctor sees the same screen with
the patient banner's PII fields (name, photo, phone, etc.) replaced by anonymized
values, while prescription/vitals/labs content is unaffected.

## Clinical Rules
Out-of-range lab values shown with a colored flag (High/Low), consistent with the alert
styling used throughout the design system.

## Auto-calculations
None on this screen — Weight (Pre)/(Post) are direct entries from Vitals, not derived
here.

## Decision Trees
Tab selection → render corresponding tab content. Proceed button → open P2-03 for this
patient.

## API Requests
`[PROPOSED]` `GET /patients/{id}`, `GET /patients/{id}/prescriptions/latest`,
`GET /patients/{id}/vitals/latest`, `GET /patients/{id}/labs/latest`,
`GET /patients/{id}/alerts`, `GET /patients/{id}/notes`. Needs engineering confirmation.

## API Responses
`[PROPOSED]` Per the Field Definitions table above, one object per card. Not confirmed.

## Database Mapping
`[PROPOSED]` `patient`, `prescription`, `vitals`, `labs`, `alerts`, `notes` — plus a
clinician reference (free-text name per F7, not HPR-linked).

## Audit Events
`patient_summary_opened`, `tab_viewed` (per tab), `proceed_to_predialysis_clicked`,
`alerts_viewed`, `notes_viewed`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Missing/no active prescription → inline notice + Proceed disabled, per Validation Rules.

## Empty States
"Weight (Post): —" shown as a specific empty-value treatment (confirmed pattern from
Figma) rather than a full-card empty state; a full-card empty state (e.g., "No notes
added yet") is used on Notes when none exist (matches the P2-03/P2-06 pattern seen
elsewhere in the design system).

## Loading States
Skeleton summary cards.

## Offline Behavior
Cached patient summary available read-only.

## Acceptance Criteria
Technician can view current prescription, latest vitals, and any active alerts for the
selected patient without leaving this screen.

## Test Cases
Tab switching; "View All" links; missing-prescription blocked-proceed state; alert
display for out-of-range labs; audit-log completeness.

## Future AI Enhancements
AI-generated patient snapshot. **[COMPLIANCE ADDITION]** must be clearly labelled as
algorithmic; must not substitute for clinician-authored Notes/Prescription entries.

---

# P2-03 — Pre-Dialysis Dashboard

## Decision Log (this screen)
S1/S2 resolved by the Figma export — full field/component detail now available. Confirmed
9-step task list (Patient Verification, Vitals & Measurements, Patient Assessment,
Vascular Access Assessment, Machine Safety, Water Safety, Infection Control, Safety
Validation, Start Dialysis Confirmation) is the authoritative step list referenced by
P2-05 through P2-10's own progress bars; P2-04 intentionally uses a condensed 7-step bar
(see P2-04's Decision Log).

## Screen Objective
`[FIGMA-DERIVED]` "Ensure all safety checks and assessments are completed before
starting dialysis" (screen's own subtitle).

## Clinical Rationale
Per Module 2 Part 1 §1: "Prevent skipped safety checks" and "Automatically identify
abnormal values" — this dashboard is the single hub making pre-dialysis completeness and
safety status visible before the technician can proceed.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view). **Print Summary action
top-right — confirmed by you this round: Nephrologist-only** (your "doctor," matching
this document's role vocabulary). It should not just be
restricted but **hidden entirely** from Nurse and Technician screen views (not shown
greyed-out, actually absent from their rendered UI).

## Navigation
Reached from P2-02 ("Proceed to Pre-Dialysis Dashboard"). Each of the 9 task cards opens
its own screen (P2-04 through P2-12 in sequence); all return to this hub.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P2-03 – Pre-Dialysis Dashboard"    subtitle: "Ensure all safety checks..."
                                    [Main Center▾] [🔔5] [Rahul Singh, Technician ▾]
                                                                    [🖨 Print Summary]
Patient info bar: [photo] Ramesh Kumar [Active] | PID:P10023, 58y Male, 📞...
  Weight(Dry):68.5kg | Blood Group:O+  |  📅Last Dialysis 12 Jan 2023(2y4m)
  🩸Vascular Access: AV Fistula(Left)  |  📅Next Schedule: Today 26 May,07:00AM Shift1
  👤Nephrologist: Dr. Neha Mehta        |  💧Dialysis Type: Hemodialysis
  [View Full Profile →]                 |  Today's Assignment: Shift 07:00AM, Bed B-02/HD-01, Tech Rahul Singh
Left column: Pre-Dialysis Workflow (9-step numbered checklist, ✓/⏱/○ status icons)
  1 Patient Verification ✓   2 Vitals & Measurements ✓   3 Patient Assessment ✓
  4 Vascular Access Assessment ✓   5 Machine Safety ⏱   6 Water Safety ○
  7 Infection Control ○   8 Safety Validation ○   9 Start Dialysis Confirmation ○
  Overall Progress: [====------] 44%
  ℹ Complete all mandatory steps to enable Start Dialysis.
Middle column: Latest Vitals card (BP,Pulse,Temp,SpO2,Weight Pre,Resp Rate + Normal tags)
              Pre-Dialysis Summary card (Target UF Goal, Expected Treatment Time, BFR,
              DFR, Dialysate Temp, Na+, K+, Bicarbonate) [View Prescription →]
Right column: Alerts & Notifications (High Potassium, Low Hemoglobin, Fluid Overload Risk)
              Pending Tasks (Machine Safety Check, Water Quality Check,
                              Infection Control Checklist, Safety Validation)
              Notes ("No notes available." empty state)
Footer: "All times are in Asia/Kolkata (IST) | Data refreshed just now [↻]"
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header (title + subtitle + Print Summary) → Patient
Info Bar (2×4 detail grid + Today's Assignment card + View Full Profile link) →
3-column body: [Pre-Dialysis Workflow checklist + progress bar] ×
[Latest Vitals card + Pre-Dialysis Summary card] × [Alerts card + Pending Tasks card +
Notes card] → Footer (timezone note + refresh indicator).

## Layout Grid
12-column responsive; left column ≈4/12, middle ≈4/12, right ≈4/12 (approximate, per
visual proportions).

## Field Definitions
`[FIGMA-DERIVED]` — see wireframe above for the full field list per card; notably:
**Overall Progress** is a calculated percentage (see Auto-calculations); **Today's
Assignment** shows Shift/Time, Bed/Machine (B-02/HD-01 format), Attending Technician;
**Pending Tasks** list mirrors any task card not yet ✓.

## Input Types
Task cards are tap targets navigating to the corresponding sub-screen; Print Summary and
Refresh are buttons; "View Full Profile", "View Prescription", "View All", "Add Note"
are links.

## Mandatory Fields
N/A — this screen aggregates status, it doesn't collect data directly.

## Validation Rules
`[FIGMA-DERIVED]` "Complete all mandatory steps to enable Start Dialysis" — Start
Dialysis (step 9) is disabled until steps 1–8 are ✓.

## Business Rules
Task-card status (✓ complete / ⏱ in-progress / ○ not started) is derived from each
sub-screen's own completion state, not set directly here.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation. A
consent-revoked patient blocks Technician access to this Dashboard entirely; Doctor
view shows the anonymized patient banner, with task-card clinical content unaffected.

## Clinical Rules
Alerts card surfaces the same alert set as P2-02 (High Potassium, Low Hemoglobin, Fluid
Overload Risk) — confirmed as the same underlying alerts source, not a separate feed.

## Auto-calculations
**Overall Progress %** = (count of ✓ steps ÷ 9) × 100 — matches the 44% shown against
4-of-9 steps complete in the example.

## Decision Trees
All 9 steps ✓ → Start Dialysis (step 9 card) enabled. Any step incomplete → remains in
Pending Tasks list, Start Dialysis stays disabled.

## API Requests
`[PROPOSED]` `GET /sessions/{id}/predialysis-status` (aggregate status of all 9 steps),
`GET /sessions/{id}/vitals/latest`, `GET /sessions/{id}/prescription-summary`,
`GET /sessions/{id}/alerts`. Needs engineering confirmation.

## API Responses
`[PROPOSED]` Per-task: name, status, last-updated timestamp/by. Not confirmed.

## Database Mapping
`[PROPOSED]` `predialysis_session` (rollup), referencing the individual task tables
introduced under P2-04 through P2-11 below.

## Audit Events
`dashboard_opened`, `task_card_clicked` (with task name), `print_summary_clicked`,
`start_dialysis_attempted` (success/blocked + reason).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Sync failure → toast + last-known status shown with a stale-data indicator.

## Empty States
`[FIGMA-DERIVED]` Notes card: "No notes available." with an add-note affordance —
confirmed empty-state pattern.

## Loading States
Skeleton cards matching the 3-column layout above.

## Offline Behavior
Last-synced status shown; task-card navigation still works offline for
technician-entry screens per Shared Platform Conventions.

## Acceptance Criteria
Technician can determine overall pre-dialysis readiness in under 5 seconds from this
screen without opening any sub-task.

## Test Cases
Progress % recalculates correctly as steps complete; Start Dialysis stays disabled until
all 9 steps ✓; Pending Tasks list matches incomplete steps; Alerts card matches P2-02's
alert set for the same patient.

## Future AI Enhancements
Predictive flagging of likely-to-be-critical tasks based on patient history.
**[COMPLIANCE ADDITION]** subject to the same human-in-the-loop labelling requirement as
elsewhere in this document.

---

# P2-04 — Patient Verification

## Decision Log (this screen)
S3, S4 resolved. HIV/Hepatitis gate now fully designed this round — a new "2. Infection
Status Check" card (status pills + Enter Now/Skip + blocking modal alert), inserted
between Verification Method and Prescription, with Prescription renumbered "2."→"3." to
accommodate it. Tagged `[NEW — DESIGN SPECIFICATION]` throughout since it has no Figma
reference. Progress bar confirmed to intentionally show 7 steps (collapsing Machine/
Water/Infection into one "Safety Checks" step) — different from the 9-step bar used
elsewhere; left as designed, not a bug. **[ADDED THIS ROUND]** a new "4. Consumables
Confirmation" card — Dialyzer Single-Use/Multi-Use selection with per-patient reuse
tracking (researched against AAMI RD47's reuse-labeling standard and current Indian
practice), plus Tubing Set/Needles quantities for Part 6 inventory deduction. Also
tagged `[NEW — DESIGN SPECIFICATION]`, no Figma reference. **Confirmed by you this
round: both cards are needed and approved as designed.** Both are now build-ready and
should be included in the actual Figma screens going forward — no longer pending
sign-off.

## Screen Objective
`[FIGMA-DERIVED]` "Verify patient identity and prescription before proceeding" (screen's
own subtitle).

## Clinical Rationale
Per Safety Protocol §1.A: confirm identity via two distinct identifiers, match the
physician's prescription, verify informed consent, before any pre-dialysis clinical data
is collected.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Pre-Dialysis Home (P2-03) → Patient Verification (this screen, step 1 of 7 on this
screen's own condensed bar) → Vitals & Measurements (P2-05).

## Wireframe
`[FIGMA-DERIVED, with one new card added this round — marked below]`
```
Title: "P2-04 – Patient Verification"   subtitle: "Verify patient identity and
                                          prescription before proceeding."
Step bar (7 steps): 1 Patient Verification* 2 Vitals&Measurements 3 Assessment
                     4 Access Assessment 5 Safety Checks 6 Validation 7 Start Dialysis
Patient banner: Ramesh Kumar [Active Patient] | PID:P10023,58y,Blood Group:O+
                Weight(Dry):68.5kg | Today's Schedule:12Jan2023(2y4m) | Shift:Morning07:00
                Bed/Machine: B-02/HD-01
Left card "1. Verify Patient Identity" — "Confirm at least two identifiers."
  Full Name: Ramesh Kumar ✓ | DOB: 15 Aug 1966 ✓ | Patient ID: P10023 ✓
  Phone: +91 98765 43210 ✓
  [green banner] "Identity Verified Successfully — All mandatory identifiers matched."
Right card "Verification Method"
  ☑ Patient confirms details  ☑ ID Card  ☑ Wristband ⓘ
  "Wristband / Barcode Scan": [barcode image, "Scanned"] Wristband ID: P10023 ✓
[NEW — DESIGN SPECIFICATION, not Figma-confirmed] Below, full-width
"2. Infection Status Check" — "Confirm HIV and Hepatitis B/C status before assignment."
  HIV Status: [Pending — amber pill]      Hepatitis B/C Status: [Negative — green pill]
  ℹ "HIV status not yet recorded for this patient."
  [Enter Now]  [Skip — logs alert to nephrologist]
Below, full-width "3. Verify Prescription" — "Confirm prescription details for today's
dialysis." [Valid badge]  (renumbered from "2." to "3." to accommodate the new card)
  Physician: Dr. Neha Mehta | Prescription Date: 12 May 2025 | Dialysis Type: Hemodialysis
  Prescribed Duration: 4:00 hrs | Blood Flow Rate(BFR): 350 mL/min
  Dialysate Flow Rate(DFR): 500 mL/min | Dialysate Temperature: 36.5°C
  Ultrafiltration Goal: 2.0 L | Heparin: 2000 IU bolus + 500 IU/hr
  [AMENDED THIS ROUND — see note below] Dialysate Composition: Potassium: 2.0 mEq/L |
  Calcium: 3.0 mEq/L | Sodium: 138 mEq/L (Profile: None) | Bicarbonate: 32 mEq/L
  [blue banner] "Prescription is valid and matches today's schedule."
[NEW — DESIGN SPECIFICATION, added this round, not Figma-confirmed] Below, full-width
"4. Consumables Confirmation" — "Confirm consumables for today's session."
  Dialyzer: Fresenius FX 80 [Single-Use ● / Multi-Use ○]
  {IF Multi-Use selected:}
    This Patient's Dialyzer ID: [DLZ-P10023-003, read-only, system-assigned on first
      use] Reuse Count: [4 of 6 uses — green if below limit] Last Used: 24 May 2025
    {IF Reuse Count ≥ facility/doctor-set limit:}
      [red banner] "⚠ This dialyzer has reached its maximum approved reuse count (6).
      Please discard and begin a new dialyzer for this patient."
      (●) Confirm — starting a NEW dialyzer for this patient  [assigns new Dialyzer
        ID, resets count to 1, deducts 1 unit from inventory, logged to audit trail]
        [NEW] ☐ "I confirm the previous dialyzer (ID: DLZ-P10023-003, 6 reuses) has
          been physically discarded and this is a new, unused dialyzer." *mandatory,
          only shown on this branch — Confirm-New-Dialyzer is not complete without it*
      (○) Override — continue using this dialyzer beyond the approved limit
        Reason*[textarea, mandatory] — [logged to audit trail AND contributes a
        Critical item to the Consolidated Physician Notification]
  Tubing Set (Arterial + Venous): Quantity Used*[1][set▾]
  Fistula Needles (if AVF/AVG): Quantity Used[2][needle▾]
  Priming/Flush Saline: Quantity Used[to be confirmed at P4-01 blood return —
    pre-filled estimate here, corrected there]
Notes (Optional): [textarea, placeholder "Add any notes if required..."]
Footer: [Cancel]                                    [Continue to Next Step →]
```

## UI Component Tree
`[FIGMA-DERIVED, plus two new cards]` Top Bar → Page Header → 7-Step Progress Bar →
Patient Banner → 2-column row (Verify Patient Identity card + Verification Method card,
with nested Wristband/Barcode Scan sub-panel) → **[NEW] full-width Infection Status
Check card** (HIV Status pill, Hepatitis B/C Status pill, conditional info banner,
Enter Now / Skip buttons) → full-width Verify Prescription card → **[NEW] full-width
Consumables Confirmation card** (Dialyzer type + reuse tracking, Tubing Set,
Needles, Saline) → Notes textarea → Footer (Cancel, Continue to Next Step).

## Layout Grid
12-column responsive; identity/verification-method cards each ≈6/12; Infection Status
Check and prescription cards full-width.

## Field Definitions
`[FIGMA-DERIVED]` **Identity:** Full Name, Date of Birth, Patient ID, Phone Number (each
with a per-field ✓ match indicator). **Verification Method:** Patient confirms details
(checkbox), ID Card (checkbox), Wristband (checkbox, with info tooltip), Wristband/Barcode
Scan result + Wristband ID confirmation. **Prescription:** Physician, Prescription Date,
Dialysis Type, Prescribed Duration, Blood Flow Rate, Dialysate Flow Rate, Dialysate
Temperature, Ultrafiltration Goal, Heparin, **and — amended this round — Dialysate
Composition (Potassium, Calcium, Sodium including profile, Bicarbonate) as four
individual read-only values**.

**[CORRECTION — this round]** An earlier audit pass claimed this screen showed
dialysate as a single named "recipe" (e.g., "Standard Bicarbonate") rather than
individual values, and proposed expanding it. On re-checking the actual document
text to make the edit, **that field didn't exist on this screen at all** — the
"Standard Bicarbonate" label I was thinking of is on **P4-04**'s Prescribed-vs-
Delivered comparison table, not here. This is corrected: P2-04 previously had **no**
dialysate composition fields whatsoever (a bigger gap than originally described, not
a smaller one), and the four individual values above have now been added directly
against the Safety Protocol's own Treatment Prescription Verification list
("Dialysate Concentrations: Potassium, Calcium, Sodium (including profiles),
Bicarbonate"). The example values shown are illustrative, matching this document
set's established mockup-data convention (like "Ramesh Kumar" or "07:45 AM"
elsewhere) — not asserted as real clinical defaults.

**[NEW — DESIGN SPECIFICATION, not Figma-confirmed] Infection Status Check card:** HIV
Status and Hepatitis B/C Status, each rendered as a colored status pill — green
"Negative", red "Positive", amber "Pending" — matching the color conventions already
established elsewhere in this document (green/amber/red for OK/warning/critical states).
Placed as its own numbered card ("2. Infection Status Check"), between Verification
Method and Prescription, since it's conceptually a third verification step alongside
identity and prescription, not a sub-field of either. When either status is Pending:
- An inline info banner appears under the pills: "[Field] status not yet recorded for
  this patient." (amber, matching the Pending pill's color family).
- Two buttons appear: **Enter Now** (opens an inline input for the technician or doctor
  to record the result directly against the patient table) and **Skip** (allows
  Continue, but immediately fires the mandatory-gate alert below).
- When either status is Positive, the pill turns red and a warning banner replaces the
  info banner: "This patient requires isolation machine/bed assignment." (See
  Cross-Screen Business Rule — the hard assignment rule itself is enforced upstream in
  Scheduling; this banner is informational/defensive on this screen.)

## Input Types
Checkboxes (Verification Method); barcode/RFID scanner input (Wristband/Barcode Scan);
read-only display fields (Prescription); status pills + Enter Now/Skip buttons
(Infection Status Check); **[NEW]** Single-Use/Multi-Use toggle, read-only Dialyzer ID
+ Reuse Count display, Confirm-New-Dialyzer/Override radio choice + mandatory
discard-confirmation checkbox (Confirm-New-Dialyzer branch only) + mandatory Reason
on override, numeric Quantity Used fields (Tubing Set, Needles) — all new, Consumables
Confirmation card; free-text Notes (0/200 char, per the visible counter pattern used
elsewhere in this design system).

## Mandatory Fields
Patient Identity match, Prescription validity, (new) HIV/Hepatitis status
acknowledgment (Pending is allowed via the Skip path, but the gate itself is mandatory),
and **(new) Consumables Confirmation — Dialyzer type selection and Tubing
Set/Needles quantities are mandatory; if the reuse limit is reached, one of
Confirm-New-Dialyzer (plus its discard-confirmation checkbox) or Override+Reason is
mandatory** — must all resolve before Continue is enabled.

## Validation Rules
Identity mismatch → block, show error state (not shown in the "all matched" example,
but implied by the ✓ pattern). Prescription invalid/expired → block. HIV/Hepatitis
Pending and neither Enter Now nor Skip has been actioned → **blocks Continue outright**
(the technician cannot simply ignore the card and proceed) — clicking Continue while
Pending triggers a blocking modal alert: title "HIV / Hepatitis status required," body
explaining why, with the same Enter Now / Skip choice as the inline card. Skip is always
available (per your instruction that this must not become a hard block on care), but is
never silent — it always logs the nephrologist alert and audit entry specified in the
Cross-Screen Business Rule. **[NEW]** Multi-Use Dialyzer at/above its approved reuse
limit → blocks Continue until either (a) Confirm-New-Dialyzer **and** its
discard-confirmation checkbox are both actioned, or (b) Override+Reason is provided —
same never-silent principle as the HIV/Hepatitis gate. Confirm-New-Dialyzer alone,
without the discard-confirmation checkbox, does **not** count as resolved — this closes
the gap where a new Dialyzer ID could be assigned without the old one actually being
removed from circulation.

## Business Rules
`[SAFETY-PROTOCOL-DERIVED]` Two-identifier minimum per Safety Protocol §1.A — satisfied
here by 4 available identifiers (Name, DOB, PID, Phone) plus wristband scan.
**[NEW, research-derived — see AAMI RD47]** A reused dialyzer must be tracked per
patient with its number of previous uses, per the AAMI RD47 reprocessing standard's
own labeling requirement — this document's Dialyzer ID + Reuse Count fields directly
implement that. **The approved maximum reuse count is configurable per dialyzer model
by the doctor or organization**, via the `dialyzer_reuse_limit` table now defined and
owned under Part 6 (read here, not set here) — since Indian practice (per the *Indian
Journal of Nephrology*'s Dialyzer Reprocessing guideline) explicitly leaves this to
facility/doctor policy, not a fixed universal number. **Default value: 6** — based on a
nationwide Indian multi-center study finding ~90% of centers reuse dialyzers 4–6 times
before discarding; this is a sensible starting default, not a regulatory ceiling, and
is expected to be overridden per dialyzer model from the (out-of-scope this iteration)
doctor dashboard. Confirming a new dialyzer here: (a) requires the technician to
affirmatively check that the previous physical dialyzer was discarded — **[NEW]** this
is a distinct, mandatory confirmation, not inferred from assigning a new ID — (b)
assigns a new Dialyzer ID for this patient, (c) resets Reuse Count to 1, (d) deducts
one Single-Use-equivalent unit from Part 6 inventory (Part 6's "Auto Issue — New Unit"
transaction), (e) logs an audit event. Overriding past the limit: (a) requires a
mandatory reason, (b) logs an audit event, (c) contributes a **Critical** item to the
Consolidated Physician Notification (Part 4's Cross-Screen Business Rule) — per the
Indian Journal of Nephrology's own stated principle that "the dialysis doctor should
make the decision in case of any protocol deviation."
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation. A
consent-revoked patient blocks Technician access to this Verification screen entirely
(identity/prescription verification cannot proceed); Doctor sees the anonymized patient
banner, with the verification checklist itself unaffected.

## Clinical Rules
HIV/Hepatitis Positive → warning banner; hard isolation-assignment enforcement is
upstream (Schedule module), per the Cross-Screen Business Rule.

## Auto-calculations
None directly; this screen displays the UF Goal calculated per the Cross-Screen
Calculation above (read from the prescription, not recalculated here). **[NEW]** Reuse
Count is a simple increment (+1 each session this same Dialyzer ID is used), not a
complex calculation.

## Decision Trees
Identity fail OR Prescription invalid OR HIV/Hepatitis gate unresolved OR Consumables
Confirmation unresolved → block Continue. All resolved → Continue to P2-05.
```
Dialyzer type = Multi-Use
  ├── Reuse Count < approved limit → proceed normally, count will increment when
  │     this session completes
  └── Reuse Count ≥ approved limit → red warning
        ├── Confirm New Dialyzer → discard-confirmation checkbox required → new
        │     Dialyzer ID assigned, count reset, inventory deducted, both events
        │     audit logged
        └── Override → mandatory Reason → audit logged → Critical item added to
              Consolidated Physician Notification
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/verification` (identity fields matched, wristband_scan
result, prescription_valid, hiv_status, hepatitis_status, notes, verified_by,
verified_at). `[NEW]` `GET /patients/{id}/dialyzer-status` (current Dialyzer ID, reuse
count, approved limit for the prescribed dialyzer model, read from Part 6's
`dialyzer_reuse_limit`). `POST /sessions/{id}/consumables` (dialyzer_type, dialyzer_id,
reuse_action [confirmed_new/overridden/none], old_dialyzer_discard_confirmed [bool,
required when reuse_action=confirmed_new], override_reason, tubing_set_qty,
needles_qty). Needs engineering confirmation.

## API Responses
`[PROPOSED]` Echo of submitted verification state + pass/fail summary + dialyzer
status {id, reuse_count, limit, action_required: bool}.

## Database Mapping
`[PROPOSED]` `patient_verification` (session_id, identity fields, wristband_scan_result,
prescription_snapshot_id, hiv_status_ack, hepatitis_status_ack, notes, verified_by,
verified_at). `patient_dialyzer` (dialyzer_id, patient_id, dialyzer_model,
reuse_count, first_used_at, last_used_at, status: active/discarded,
**discard_confirmed_by, discard_confirmed_at** — new columns capturing the
discard-confirmation checkbox) — one row per physical dialyzer instance, incremented
each session. `dialyzer_reuse_limit` (dialyzer_model, max_reuse_count [default 6],
set_by, updated_at, source) — **owned and defined under Part 6** (see Part 6's P6-02),
read here, not set here.

## Audit Events
`verification_started`, `identity_verified`, `prescription_verified`,
`hiv_hepatitis_gate_resolved` (entered/skipped), **`dialyzer_reuse_confirmed_new`,
`old_dialyzer_discard_confirmed` (dialyzer_id, confirmed_by, timestamp — new, distinct
event from `dialyzer_reuse_confirmed_new`),
`dialyzer_reuse_limit_overridden` (with reason)**, `verification_completed`/`blocked`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Wristband-scan mismatch (scanned ID ≠ selected patient) → blocking error, distinct from
a generic sync error — this is a safety-relevant case.

## Empty States
N/A — all fields pre-populated from upstream records; no empty-entry state applies.

## Loading States
Skeleton cards while identity/prescription data loads.

## Offline Behavior
Local draft-save with sync-on-reconnect, per Shared Platform Conventions.

## Acceptance Criteria
Technician can complete identity + prescription verification, including the
HIV/Hepatitis gate, in well under a minute given all upstream data is already correct.

## Test Cases
Wristband-scan mismatch blocks progression; HIV/Hepatitis Pending triggers the
Enter-now/Skip alert and, on Skip, creates the nephrologist alert + audit entry;
prescription-invalid state blocks Continue. **Multi-Use dialyzer below its reuse
limit proceeds normally; at/above the limit correctly blocks until (Confirm-New +
discard-confirmation checkbox both actioned) or Override+Reason; Confirm-New without
the discard-confirmation checkbox correctly remains blocked; Confirm-New with the
checkbox correctly assigns a new Dialyzer ID, resets the count, deducts inventory, and
logs both `dialyzer_reuse_confirmed_new` and `old_dialyzer_discard_confirmed`;
Override correctly logs the reason and creates a Critical physician-notification item;
Single-Use dialyzer selection skips reuse tracking entirely; the reuse limit correctly
reads Part 6's `dialyzer_reuse_limit` value for the prescribed dialyzer model (default
6) rather than a hardcoded number.

## Future AI Enhancements
None specified in the Figma; consistent with the rest of this document, any future
addition would need the same human-in-the-loop labelling requirement.

---

# P2-05 — Vitals & Measurements

## Decision Log (this screen)
S5, S6 resolved. UF Goal formula (Cross-Screen Calculation above) now feeds this
screen's Auto-calculations. **[ADDENDUM]** A
Pre-Dialysis BUN field was added after this document's initial completion, to support
the Kt/V (dialysis adequacy) calculation specified in the Part 3 (During-Dialysis)
document — see P3-08/P3-10 for the full formula and rationale. This is a genuine
change to a document previously marked final, called out explicitly rather than
silently folded in. **Confirmed by you this round:** the Warning(amber)/Critical(red),
both-sides (low and high) two-tier threshold model matches your other dashboard's
existing pattern for doctors — the *model* is approved; the *exact numeric boundaries*
per vital still need Dr. Rajapurkar's sign-off (see Validation Rules), since "matches
our other dashboard" confirms the mechanism, not the specific numbers, which weren't
provided. **Also changed this round, explicitly flagged, not silent:** per your
Critical/Non-Critical classification instruction (item 13), SpO₂ is reclassified from
Non-Mandatory (the prior S6 resolution) to **Mandatory/Critical** — hypoxia is an
immediate-threat vital and shouldn't have been skippable. This overrides the earlier S6
decision for SpO₂ specifically; Respiratory Rate's Non-Mandatory status from S6 is
unchanged (Non-Critical, and explicitly marked optional in the Safety Protocol itself).

## Screen Objective
`[FIGMA-DERIVED]` "Record patient vital signs and pre-dialysis measurements" (screen's
own subtitle).

## Clinical Rationale
Establishes the patient's pre-treatment baseline and confirms the prescribed UF goal is
achievable, per Safety Protocol §1.B.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Patient Verification (P2-04) → Vitals & Measurements (this screen, step 2 of 9) →
Patient Assessment (P2-06).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P2-05 – Vitals & Measurements"  subtitle: "Record patient vital signs and
                                          pre-dialysis measurements."
Step bar (9 steps, step 2 active) — see P2-03's list.
"Record Vitals"                                    Measurement Time: 26 May 2025,06:42AM
Row1: Blood Pressure(mmHg)* [Systolic138][Diastolic82] "Normal(Target:<140/90)"
      Pulse(bpm)* [78] "Normal(60-100bpm)"
      Temperature(°C)* [36.8] "Normal(36.0-37.5°C)"
      Respiratory Rate(breaths/min) [18] "Normal(12-20/min)"
Row2: SpO2(%)* [98] "Normal(≥95%)"
      Weight(Pre)(kg)* [68.5] "Last Post Weight:67.0kg(24May2025)"
      Weight Gain(kg) [1.5] "Target:1.0-3.0kg"
      Height(cm) [170]
Row3: BMI(kg/m²) [23.7,auto-calculated,readonly]
      Pain Score(0-10) [slider, currently 2] "No Pain"---"Worst Pain"
      Glucose(mg/dL) [124] "Normal(70-140mg/dL)"
"Additional Measurements": UF Goal(L)[2.0] EDW(kg)[67.0]
      Pre-Dialysis MAP(mmHg)[100,auto-calculated] Notes[textarea,0/200]
[ADDENDUM — added after this document's original completion, to support the During-
 Dialysis stage's Kt/V calculation (see Part 3, P3-08/P3-10)]
"Kt/V Assessment (Monthly)": ☐ Kt/V Assessment Due/Taken This Session ⓘ
  (shown only if checked:) Pre-Dialysis BUN(mg/dL)*[textbox]
ℹ "All vital signs look within acceptable range. Click 'Save & Continue' to proceed."
Footer: [← Back]   [Save as Draft]   [Save & Continue →]
Right rail: Patient Summary card | Pre-Dialysis Alerts | Quick Reference | Previous Vitals(24May2025)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 9-Step Progress Bar → "Record Vitals" panel
(3 rows of input cards + Additional Measurements sub-panel) → Footer (Back, Save as
Draft, Save & Continue) → Right rail (Patient Summary, Pre-Dialysis Alerts, Quick
Reference, Previous Vitals).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12; input cards in a 4-per-row grid
within the main form.

## Field Definitions
`[FIGMA-DERIVED]`
| Field | Type | Mandatory | Range shown |
|---|---|---|---|
| Blood Pressure (Systolic/Diastolic) | Integer pair, mmHg | Yes | Target < 140/90 |
| Pulse | Integer, bpm | Yes | 60–100 |
| Temperature | Decimal, °C | Yes | 36.0–37.5 |
| Respiratory Rate | Integer, breaths/min | **No** (confirmed per S6, Non-Critical) | 12–20 |
| SpO₂ | Integer, % | **Yes — reclassified this round, Critical** (was No per S6; see Decision Log) | ≥ 95 |
| Weight (Pre) | Decimal, kg | Yes | shown against Last Post Weight |
| Weight Gain | Decimal, kg — **auto-calculated** = Weight(Pre) − Last Post Weight | Yes (derived) | Target 1.0–3.0 |
| Height | Decimal, cm | No | — |
| BMI | Decimal, kg/m² — **auto-calculated**, read-only | N/A | — |
| Pain Score | Slider 0–10 | No | — |
| Glucose | Integer, mg/dL | No | Normal 70–140 |
| UF Goal | Decimal, L — **auto-calculated** per Cross-Screen Calculation | Yes (derived) | — |
| EDW | Decimal, kg (from prescription) | Yes | — |
| Pre-Dialysis MAP | Integer, mmHg — **auto-calculated** = (Systolic + 2×Diastolic)/3 | N/A | — |
| Notes | Free text, 0/200 chars | No | — |
| **[ADDENDUM]** Kt/V Assessment Due/Taken This Session | Checkbox, off by default | No | Per RPA/KDOQI cadence, monthly not every session |
| **[ADDENDUM]** Pre-Dialysis BUN | Decimal, mg/dL | **Yes, but only if the Kt/V checkbox above is checked** | No normal-range tag shown here — interpreted downstream in the Kt/V calculation on P3-08/P3-10, not on this screen |

## Input Types
Numeric entry fields (most vitals); a 0–10 slider (Pain Score); read-only calculated
fields (BMI, UF Goal, MAP) shown with a distinct "Auto-calculated" label per the Figma;
free-text Notes with char counter. **[ADDENDUM]** checkbox (Kt/V Assessment) +
conditional numeric entry (Pre-Dialysis BUN), same conditional-reveal pattern already
used elsewhere in this document (e.g., P2-04's HIV/Hepatitis card).

## Mandatory Fields
**Critical (Mandatory):** BP, Pulse, Temperature, SpO₂ (reclassified this round — see
Decision Log), Weight (Pre), Weight Gain (derived), UF Goal (derived), EDW — kept as
Critical per your explicit instruction, overriding the Non-Critical classification the
research methodology would otherwise assign to Weight/Weight Gain specifically (see
Critical/Non-Critical Field Classification reference, Shared Platform Conventions, for
that methodology). **Non-Critical (Non-Mandatory, skippable-with-reason per the
Non-Mandatory Field Skip Workflow):** Respiratory Rate, Height, Pain Score, Glucose.

## Validation Rules
`[DESIGN SPECIFICATION — model confirmed by you this round, exact thresholds still
pending]` Two severity tiers, on both the low and high side of each vital's normal
range, matching the pattern already in use on your other doctor-facing dashboard:

- **Warning tier** (value outside the Normal range shown under each field, but not at a
  dangerous extreme): the field's range tag switches from its green "Normal (...)"
  styling to an amber tag reading "High (...)" or "Low (...)" — same visual pattern as
  the amber Low-Hemoglobin/High-Potassium tags already used on P2-02's Recent Labs card.
  The field's input border also switches from neutral gray to amber. This tier does
  **not** block Save & Continue — the technician can acknowledge and proceed, but the
  acknowledgment itself is logged (see Audit Events).
- **Critical tier** (a value at a clinically dangerous extreme — e.g., BP outside the
  Pre-Dialysis Complete Validation Matrix's "Critical BP" threshold): same red styling
  as the P2-07/08/09/10 failure-state pattern (see those screens below) — field border
  and range tag turn red, reading "Critical" rather than just "High"/"Low". This tier
  **blocks** Save & Continue until the value is corrected — **no override or
  acknowledgment path**, per the Non-Mandatory Field Skip Workflow's principle that a
  Critical/Mandatory field is never skippable or overridable by anyone, including a
  nurse or nephrologist. This supersedes the earlier "or nurse/nephrologist
  acknowledgment" language from a prior draft.
- The info banner at the bottom of the form (currently "All vital signs look within
  acceptable range...") switches from its neutral/informational styling to: amber with
  "N vital sign(s) outside normal range — review before continuing" (Warning tier
  present, none Critical), or red with "N vital sign(s) critical — resolve before
  continuing" (any Critical tier present) — the same red/amber banner-swap pattern used
  on the checklist screens.
- `[PROPOSED — needs Dr. Rajapurkar's final numeric sign-off]` Suggested Warning/
  Critical boundaries, both sides, derived from standard adult hemodialysis practice
  ranges (KDOQI-consistent) pending your dashboard's exact figures: BP Warning
  90–100/<60 or 145–160/90–100, Critical <90/<60 or >160/>100; Pulse Warning 50–59 or
  101–110, Critical <50 or >110; Temperature Warning 37.6–38.0 or 35.5–35.9, Critical
  ≥38.1 or <35.5; SpO₂ Warning 90–94%, Critical <90%. These are placeholders reflecting
  common practice, not your actual "other dashboard" numbers, which weren't provided —
  replace with your real figures before build.

## Business Rules
Weight Gain is derived, not independently entered (Weight(Pre) − Last Post Weight).
UF Goal is derived per the Cross-Screen Calculation, using this session's Weight(Pre),
EDW, and the prescription's heparin/saline allowance.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` UF rate must stay within the (facility-configurable, Medical
Advisor-approved) safe ceiling — see Cross-Screen Calculation; a breach is Critical-tier
and blocks Save & Continue until the prescription or weight values are corrected — no
override, per the Non-Mandatory Field Skip Workflow's principle above.

## Auto-calculations
BMI = Weight(kg) / Height(m)²; Weight Gain = Weight(Pre) − Last Post Weight; UF Goal per
Cross-Screen Calculation; Pre-Dialysis MAP = (Systolic + 2×Diastolic) / 3 (standard MAP
formula, consistent with the auto-calculated value 100 shown against 138/82 — (138+164)/3
≈ 100.7, rounds to 100 ✓, confirming this is the correct formula).

## Decision Trees
```
Each vital entered → compare against Normal range
  ├── Within Normal → green tag, no banner change
  ├── Warning tier → amber tag + amber field border; banner switches to amber summary;
  │     Save & Continue remains enabled after the technician has seen the banner
  └── Critical tier → red tag + red field border; banner switches to red summary;
        Save & Continue disabled until the value is corrected — no override
Non-Critical field left blank (Respiratory Rate, Height, Pain Score, Glucose) →
  Non-Mandatory Field Skip Workflow (Shared Platform Conventions) — warning popup,
  optional reason, logged either way
UF rate exceeds safe ceiling at standard duration/rate → Critical-tier banner,
  blocks Save & Continue until corrected — no override
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/vitals` (all fields above + recorded_by, recorded_at).

## API Responses
`[PROPOSED]` Echo + calculated fields (BMI, Weight Gain, UF Goal, MAP) + a `flags` array
(per-field: field name, severity [warning/critical], value, threshold breached).

## Database Mapping
`[PROPOSED]` `vitals_predialysis` (session_id, all fields above, recorded_by,
recorded_at). **[ADDENDUM]** two new columns: `kt_v_assessment_flag` (bool),
`pre_dialysis_bun` (decimal, nullable) — read by Part 3's `kt_v_assessment` table
(P3-10) at session end rather than duplicated there.

## Audit Events
`vitals_recorded`, `vital_warning_flagged` (per field, Warning tier), `vital_critical_flagged`
(per field, Critical tier), `uf_goal_calculated`, `uf_rate_warning_raised` (if
applicable), plus the shared `checklist_field_skipped` event (Non-Mandatory Field Skip
Workflow) for any of Respiratory Rate/Height/Pain Score/Glucose left blank.

## Accessibility
See Shared Platform Conventions. Warning/Critical field states must not rely on color
alone — pair the amber/red border with the text-tag change ("High"/"Critical") already
specified above, consistent with the rest of this document's color+icon+text convention.

## Error Handling
Out-of-physiological-range entry (e.g., implausible weight) → inline sanity-check error,
distinct from the clinical Warning/Critical styling above. A sanity-check error (e.g., a
negative weight) blocks entry entirely; a Warning/Critical clinical flag is a valid,
save-able value that simply needs review or escalation.

## Empty States
N/A — form screen, no empty-list state applies.

## Loading States
Skeleton form while Last Post Weight / prescription data loads.

## Offline Behavior
Local draft-save with sync-on-reconnect, per Shared Platform Conventions — matches the
visible "Save as Draft" button.

## Acceptance Criteria
Technician can record all vitals and see the UF Goal auto-calculate correctly within
the session.

## Test Cases
Weight Gain and UF Goal recalculate correctly as Weight(Pre) changes; MAP recalculates
correctly; custom heparin dose (per prescription) changes the UF Goal calculation
correctly; UF-rate-exceeds-ceiling warning fires correctly.

## Future AI Enhancements
None specified in the Figma for this screen.

---

# P2-06 — Patient Assessment

## Decision Log (this screen)
S7, S8 now reflected directly in the Figma-derived field list — the screen is
substantially richer than the original text spec suggested (three sub-sections:
Subjective, Objective, Functional Assessment). **Resolved this round, per your
instruction (item 13): all Critical fields are mandatory, including Any Abnormal
Finding; all Non-Critical fields are non-mandatory, skippable-with-reason under the
Non-Mandatory Field Skip Workflow (Shared Platform Conventions).** See Mandatory
Fields for the full field-by-field split.

## Screen Objective
`[FIGMA-DERIVED]` "Assess patient symptoms and clinical status before dialysis" (screen's
own subtitle).

## Clinical Rationale
Structured symptom and clinical-status review to catch changes since the patient's last
session, per Safety Protocol §1.C.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Vitals & Measurements (P2-05) → Patient Assessment (this screen, step 3 of 9) →
Vascular Access Assessment (P2-07).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P2-06 – Patient Assessment"   subtitle: "Assess patient symptoms and clinical
                                        status before dialysis."
Step bar (9 steps, step 3 active).
"Subjective Assessment" — "Ask patient and record their responses."
                                              Assessment Time: 26 May 2025, 06:48 AM
Row1: Shortness of Breath[No/Yes] Chest Pain[No/Yes] Nausea/Vomiting[No/Yes] Fever/Chills[No/Yes]
Row2: Cough[No/Yes] Dizziness/Giddiness[No/Yes] Muscle Cramps[No/Yes] Itching[No/Yes]
Row3: Headache[No/Yes] Bleeding/Bruising[No/Yes] Loss of Appetite[No/Yes]
      Any Other Symptoms?[textarea,0/200]
"Objective Assessment" — "Clinical observations by technician."
Row1: General Appearance[Alert▾] Consciousness[Oriented▾] Edema[Mild(1+)▾]
      Hydration Status[Euvolemic▾] Skin Condition[Normal▾]
Row2: JVP[Normal▾] Lung Sounds[Clear▾] Heart Sounds[Normal▾] Abdomen[Soft,Non-tender▾]
      Any Abnormal Finding?[No/Yes*, Yes selected]
"If Yes, Please Describe": [textarea: "Mild pitting edema on bilateral ankle." 47/300]
"Functional Assessment" — "Evaluate patient's functional status."
  Karnofsky Performance Status(KPS)[70▾] "Cares for self; unable to carry on normal
    activity or to do active work."
  Assistive Support Required: ☐Walker ☐Wheelchair ☑Others[None]
Footer: [← Back]  [Save as Draft]  [Save & Continue →]
Right rail: Patient Summary | Pre-Dialysis Alerts | Key Vitals(06:45AM) | Notes(0)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 9-Step Progress Bar → Subjective Assessment
panel (11 Yes/No symptom toggles + free-text "Any Other Symptoms?") → Objective
Assessment panel (9 dropdown clinical observations + Abnormal Finding Yes/No + conditional
describe textarea) → Functional Assessment panel (KPS dropdown + assistive-support
checkboxes) → Footer → Right rail (Patient Summary, Alerts, Key Vitals, Notes).

## Layout Grid
12-column responsive; 4-per-row field grid within each of the three assessment panels.

## Field Definitions
`[FIGMA-DERIVED]` **Subjective (Yes/No each):** Shortness of Breath, Chest Pain, Nausea/
Vomiting, Fever/Chills, Cough, Dizziness/Giddiness, Muscle Cramps, Itching, Headache,
Bleeding/Bruising, Loss of Appetite; plus free-text "Any Other Symptoms?" (0/200).
**Objective (dropdowns unless noted):** General Appearance, Consciousness, Edema,
Hydration Status, Skin Condition, JVP, Lung Sounds, Heart Sounds, Abdomen; Any Abnormal
Finding? (Yes/No) with conditional "If Yes, Please Describe" (0/300).
**Functional:** Karnofsky Performance Status (dropdown, 0–100 scale, with an inline
description of the selected score); Assistive Support Required (Walker/Wheelchair/Others
checkboxes, Others with a free-text qualifier).
**[GAP — still open]** "Allergies verified? (including labs review)" from the Safety
Protocol does not appear as a field on this screen at all in the Figma — confirms this
content now lives on P2-04/patient-table per S4's resolution (allergies sourced from the
Telemedicine Prescription module), not duplicated here. No further action needed; noted
so the resolution is traceable.

## Input Types
Yes/No toggle buttons (Subjective); dropdown selects (Objective); Yes/No + conditional
textarea (Abnormal Finding); dropdown + checkboxes (Functional).

## Mandatory Fields
**Critical (Mandatory):** Subjective — Shortness of Breath, Chest Pain, Bleeding/
Bruising, Dizziness/Giddiness, Fever/Chills (each an immediate-threat or named Safety
Protocol emergency indicator — see the Critical/Non-Critical Field Classification
reference in Shared Platform Conventions). Objective — Any Abnormal Finding? (already
the only asterisked field), Consciousness, Lung Sounds, Heart Sounds. **Non-Critical
(Non-Mandatory, skippable-with-reason):** Subjective — Nausea/Vomiting, Cough, Muscle
Cramps, Itching, Headache, Loss of Appetite. Objective — General Appearance, Edema,
Hydration Status, Skin Condition, JVP, Abdomen. Functional — Karnofsky Performance
Status, Assistive Support Required (both Non-Critical; this is planning/functional
data, not an acute safety signal).

## Validation Rules
`[WORKFLOW-DOC-DERIVED]` Any "Yes" subjective symptom, or "Yes" to Any Abnormal Finding,
makes the corresponding comment/describe field mandatory — matches the Figma's visible
conditional textarea behavior (only shown/required when "Yes" is selected) and the
Pre-Dialysis Complete Validation Matrix rule. Non-Critical fields left blank follow the
Non-Mandatory Field Skip Workflow (Shared Platform Conventions) — warning popup,
optional reason, logged either way, technician proceeds either way. Critical fields
cannot be left blank at all — Save & Continue is disabled until every Critical field
has a selection.

## Business Rules
None beyond the conditional-mandatory pattern above.

## Clinical Rules
`[RESOLVED — per your Non-Mandatory Field Skip Workflow instruction]` A high-severity
item (Chest Pain, Bleeding/Bruising, etc.) is now Critical/Mandatory (see Mandatory
Fields) — it can never be silently skipped, and a "Yes" answer requires a mandatory
comment. `[OPEN — narrower residual question]` your answer to this item confirmed the
*skip* workflow (what happens if a technician tries to leave a Critical field blank —
answer: they can't). It didn't separately confirm whether answering **"Yes" to a
Critical symptom** — a filled-in, documented finding, not a skip — should *also*
trigger a real-time Alert to a nurse/nephrologist beyond the mandatory comment, the way
P4's Consolidated Physician Notification does for post-dialysis findings. Currently
this screen only requires the comment; it does not push a real-time notification.
Flagging this distinction explicitly rather than assuming the daily digest mechanism
(built for skips) is meant to also cover same-session acute findings.

## Auto-calculations
None.

## Decision Trees
All Critical items answered (none blank), conditional comments provided where required,
any Non-Critical items either answered or skipped-with-popup-acknowledged → "Save &
Continue" proceeds. Critical field left blank → Save & Continue disabled. High-severity
"Yes" answer → mandatory comment required; real-time escalation beyond that is the
residual open question noted in Clinical Rules.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/assessment` (all Subjective/Objective/Functional
fields, recorded_by, recorded_at).

## API Responses
`[PROPOSED]` Echo + any flags raised.

## Database Mapping
`[PROPOSED]` `patient_assessment_predialysis` (session_id, all fields above, recorded_by,
recorded_at).

## Audit Events
`assessment_recorded`, `abnormal_symptom_flagged` (per item), plus the shared
`checklist_field_skipped` event (Non-Mandatory Field Skip Workflow) for any Non-Critical
field left blank.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Missing mandatory comment on a "Yes" answer → inline validation error.

## Empty States
N/A — form screen.

## Loading States
Skeleton form.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician completes all three assessment panels, with any abnormal finding properly
documented, before proceeding.

## Test Cases
"Yes" answer requires comment; KPS dropdown correctly displays its description text;
Assistive Support "Others" requires the qualifier text when checked.

## Future AI Enhancements
None specified in the Figma for this screen.

---

# P2-07 — Vascular Access Assessment

## Decision Log (this screen)
S9/S10/S11 fully resolved by the Figma export — the actual screen already implements
Access-Type branching (AV Fistula/AV Graft share one field set, CVC would render another),
confirming the design intent matched the earlier proposed fix. Field set below reflects
the real AVF/AVG panel exactly as built; CVC panel is inferred by symmetry since no CVC
example was captured in this export. **Confirmed by you this round**: the CVC table
(4 original rows + Tenderness/Pain, research-derived) and the right-rail CVC adaptations
are both approved as designed — this screen's CVC branch is now build-ready, no longer
pending sign-off.

## Screen Objective
`[FIGMA-DERIVED]` "Assess vascular access site for patency and safety before cannulation"
(screen's own subtitle).

## Clinical Rationale
Per Safety Protocol §1.C: inspect the access site before cannulation to detect infection,
malfunction, or other contraindications to use.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Patient Assessment (P2-06) → Vascular Access Assessment (this screen, step 4 of 9) →
Machine Safety (P2-08).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P2-07 – Vascular Access Assessment"  subtitle: "Assess vascular access site for
                                               patency and safety before cannulation."
Step bar (9 steps, step 4 active).
"Access Type": (○AV Fistula(AVF)*) (○AV Graft(AVG)) (○Central Venous Catheter(CVC))
                                             Assessment Time: 26 May 2025, 06:52 AM
"Access Assessment" — "Examine access site and function."
Table: Assessment Item | Findings | Details(if Abnormal)
  Thrill/Bruit ⓘ         | Present/Weak/Absent          | [describe location,intensity]
  Access Site Appearance ⓘ| Normal/Redness/Swelling/Other| [describe if abnormal]
  Signs of Infection ⓘ    | No/Yes                       | [e.g. redness,warmth,drainage]
  Bleeding/Discharge ⓘ    | No/Yes                       | [describe if yes]
  Aneurysm/Pseudoaneurysm ⓘ| No/Yes                      | [describe if yes]
  Cannulation Zone ⓘ      | Good/Limited/Poor            | [comments if any]
  Access Flow(if measurable)ⓘ| [650] mL/min "Adequate(≥500mL/min)" | —
"Additional Observations": [textarea: "Good thrill and bruit. No signs of infection.
                             Ready for cannulation." 63/300]
"Action Required" — "Based on assessment findings."
  [green] ✓ "Access suitable for use. Proceed to next step."
Footer: [← Back]  [Save as Draft]  [Save & Continue →]
Right rail: Patient Summary | Access Details(Edit) | Pre-Dialysis Alerts | Quick Reference
```
`[DESIGN SPECIFICATION — synthesized CVC branch, confirmed by you]`
```
"Access Assessment" (CVC branch) — same table shell as above, different rows:
Table: Assessment Item | Findings | Details(if Abnormal)
  Dressing Intact ⓘ           | Yes/No | [describe if abnormal]
  Tenderness/Pain at Exit Site ⓘ| No/Yes | [describe if yes]
  Exit Site Clean ⓘ            | Yes/No | [describe if abnormal]
  Signs of Infection/Erythema/Discharge ⓘ| No/Yes | [e.g. redness,warmth,drainage]
  Catheter Patent ⓘ            | Yes/No | [describe if abnormal]
Note (in place of Cannulation Success/Access Flow): "Cannulation and Access Flow do not
  apply to catheter access."
Right rail (CVC adaptations): Access Details reads "Right Internal Jugular" / "Date of
  Insertion" instead of "Left Forearm" / "Date Created"; Access Flow Goal card hidden.
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 9-Step Progress Bar → Access Type selector
(3-way radio) → Access Assessment table (7 rows: Thrill/Bruit, Access Site Appearance,
Signs of Infection, Bleeding/Discharge, Aneurysm/Pseudoaneurysm, Cannulation Zone, Access
Flow) → Additional Observations textarea → Action Required banner (dynamic, findings-
driven) → Footer → Right rail (Patient Summary, Access Details [Edit], Pre-Dialysis
Alerts, Quick Reference: Access Flow Goal, Minimum BFR, Recirculation Target).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **Access Type:** AV Fistula (AVF) / AV Graft (AVG) / Central Venous
Catheter (CVC) — single-select, drives the assessment table below.
**AVF/AVG assessment table** (confirmed as built): Thrill/Bruit (Present/Weak/Absent),
Access Site Appearance (Normal/Redness/Swelling/Other), Signs of Infection (No/Yes),
Bleeding/Discharge (No/Yes), Aneurysm/Pseudoaneurysm (No/Yes), Cannulation Zone
(Good/Limited/Poor), Access Flow (numeric, mL/min, with an Adequate/Inadequate tag against
a ≥500 mL/min goal) — each row has a conditional "Details (if Abnormal)" text field.
**CVC assessment table** `[DESIGN SPECIFICATION — mockup built this round
(P2-07_Vascular_Access_Assessment.html/png), confirmed by you — see Decision Log]`: per
the Safety Protocol's CVC item list plus one research-derived addition, five rows —
Dressing Intact (Yes/No), **Tenderness/Pain at Exit Site (Yes/No) — placed second, right
after Dressing Intact, since it's typically asked before the dressing is disturbed**,
Exit Site Clean (Yes/No), Signs of Infection/Erythema/Discharge (No/Yes), Catheter Patent
(Yes/No) — each with the same Finding + "Details (if Abnormal)" pattern as the AVF/AVG
table. Tenderness/Pain was added based on the EXITA Study (Kidney International Reports,
2024), a validated clinical scale which found pain/tenderness at the exit site to be one
of the three strongest predictors of exit-site infection — not captured by any of the
original four CVC rows, since it must be asked rather than visually observed. Cannulation
Success and Access Flow are **not** shown on the CVC branch (CVC access does not require
cannulation) — replaced with an explanatory note to that effect.
The right-rail Access Details and Quick Reference cards also adapt for CVC (location
reads "Right Internal Jugular" instead of "Left Forearm," date field reads "insertion"
instead of "created," the Access Flow Goal row is hidden since it's an AVF/AVG-specific
metric) in the mockup — these adaptations are proposed, not confirmed against real
patient data or a Figma export.

## Input Types
Radio selection (Access Type); mixed radio-button rows in the assessment table (varying
option sets per row — Present/Weak/Absent, Normal/Redness/Swelling/Other, No/Yes,
Good/Limited/Poor); numeric entry (Access Flow); free-text (Details-if-abnormal per row,
Additional Observations).

## Mandatory Fields
Access Type is always mandatory (selects which table renders). **AVF/AVG — Critical
(Mandatory):** Signs of Infection, Bleeding/Discharge, Thrill/Bruit, Access Flow
(access-thrombosis/failed-cannulation risk indicators — see the Critical/Non-Critical
Field Classification reference, Shared Platform Conventions). **AVF/AVG — Non-Critical
(Non-Mandatory, skippable-with-reason):** Access Site Appearance, Cannulation Zone,
Aneurysm/Pseudoaneurysm. **CVC — Critical (Mandatory):** Signs of Infection/Erythema/
Discharge, Catheter Patent, Tenderness/Pain at Exit Site (research-derived, EXITA
Study). **CVC — Non-Critical (Non-Mandatory, skippable-with-reason):** Dressing
Intact, Exit Site Clean.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` Signs of Infection = Yes (AVF/AVG) or Signs of
Infection/Erythema/Discharge = Yes (CVC) triggers the shared checklist failure state
(see Shared Platform Conventions) per "avoid cannulating infected sites." Same for
Bleeding/Discharge = Yes (AVF/AVG) and Catheter Patent = No (CVC) — all hard-block, no
override, since these are Critical fields. Non-Critical rows (Access Site Appearance,
Cannulation Zone, Aneurysm/Pseudoaneurysm on AVF/AVG; Dressing Intact, Exit Site Clean
on CVC) left blank follow the Non-Mandatory Field Skip Workflow instead.

## Business Rules
Access Type selection determines which assessment table renders (confirmed branching
behavior, not merely proposed as in the prior round).

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` "Avoid cannulating infected sites" — codified via the shared
checklist failure state (Shared Platform Conventions), with this screen's banner copy
naming the specific abnormal finding.

## Auto-calculations
Access Flow adequacy tag (Adequate ≥ 500 mL/min) is a simple threshold comparison, not a
calculation.

## Decision Trees
```
Select Access Type
  ├── AVF or AVG → render confirmed 7-row table
  │     ├── Signs of Infection = Yes, or Bleeding/Discharge = Yes →
  │     │     shared failure state (Shared Platform Conventions); banner names the
  │     │     specific finding, e.g. "Signs of Infection detected. Do not cannulate
  │     │     this access — escalate before proceeding."
  │     ├── Thrill = Absent or Access Flow < 500 mL/min → escalate (ties to the
  │     │     Pre-Dialysis Complete Validation Matrix's existing "AVF thrill absent" rule)
  │     └── All clear → Action Required banner shows "Access suitable for use"
  └── CVC → render CVC table (mockup built this round)
        ├── Signs of infection/Erythema/Discharge = Yes, or Catheter Patent = No →
        │     shared failure state, banner names the specific finding
        └── All clear → "Access suitable for use"
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/vascular-access` (access_type, table fields per branch,
additional_observations, recorded_by, recorded_at).

## API Responses
`[PROPOSED]` Echo + Action Required status (suitable/blocked) + a `flags` array (which
row failed, severity, technician-entered detail text).

## Database Mapping
`[PROPOSED]` `vascular_access_assessment` (session_id, access_type, thrill_bruit,
access_site_appearance, signs_of_infection, bleeding_discharge, aneurysm, cannulation_zone,
access_flow_ml_min [all nullable, AVF/AVG branch], dressing_intact, **tenderness_pain**,
exit_site_clean, cvc_signs_of_infection, catheter_patent [all nullable, CVC branch,
confirmed this round], additional_observations, recorded_by, recorded_at).

## Audit Events
`access_assessed`, `infection_risk_flagged` (if triggered), `access_suitable_confirmed`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Incomplete table row → inline validation error before Save & Continue.

## Empty States
N/A — form screen.

## Loading States
Skeleton form + skeleton Access Details card in the right rail.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Correct assessment table renders for the selected Access Type; infected/abnormal
findings correctly block or warn before Save & Continue.

## Test Cases
AVF/AVG table renders and validates correctly (confirmed via Figma); CVC table (5 rows,
including Tenderness/Pain) renders and validates correctly — confirmed by you, no longer
open; Access Flow adequacy threshold triggers correctly at the 500 mL/min boundary.

## Future AI Enhancements
None specified in the Figma for this screen.

---

# P2-08 — Machine Safety

## Decision Log (this screen)
**Rewritten this round.** Part 5 (Machine & RO Management) now exists and shows
P5-02 (Daily Machine Quality Control) as the actual once-daily, per-machine QC
checklist — Conductivity, Dialysate Temperature, Blood Leak Detector, Air Detector,
Pressure Monitoring, Heparin Pump, UF Rate Accuracy, Alarm Test, Visual Inspection,
Disinfection Status, Venous Clamp Function, Emergency Supplies (12 items total,
following this session's P5-02 patch) — performed by a Technician or Biomedical
Engineer before that machine's *first* use each day, not re-performed per patient. The
13-item editable checklist previously specified here was **redundant re-entry of the
same checks P5-02 already performs**. The original "Revised" text file's instruction —
*"No QC or RO values may be edited here; all values originate from Part 5"* — was
correct from the start; this screen is rewritten to match it. This closes S12.
**Confirmed by you this round:** Component Verification (the remaining item from the
Safety Protocol's list not yet its own P5-02 row) is folded into the existing rows on
this read-only review card — not added as a new, separately-itemized row here or on
P5-02. This screen's aggregate display already matches that intent (it shows a single
pass-count summary, never itemizes), so no structural change is needed on P2-08 itself
— only the pass-count total below, updated from 9 to 12 to match P5-02's current item
count.

## Screen Objective
Confirm this session's assigned machine has today's Quality Control and Self-Test
already passed, before proceeding — a review/gate, not a re-check.

## Clinical Rationale
Per Safety Protocol §1.A Machine & Equipment: the machine must have passed its full
safety-check sequence before connecting the patient. That sequence is executed once
daily (P5-02, P5-04), not re-executed at each patient's bedside.

## Users
Dialysis Technician (primary, reviews); Nurse, Nephrologist (view).

## Navigation
Vascular Access Assessment (P2-07) → Machine Safety (this screen, step 5 of 9) → Water
Safety (P2-09).

## Wireframe
`[DESIGN SPECIFICATION — rewritten this round, not independently Figma-confirmed for
this exact layout, though every field it displays is Figma-confirmed on P5-02/P5-04]`
```
Title: "P2-08 – Machine Safety"  subtitle: "Confirm today's machine safety checks are
                                  complete before proceeding."
Machine: B-02/HD-01, Fresenius 4008S
"Today's Quality Control (P5-02)"
  Status: [green]Passed  Performed: 28 May 2025, 07:15 AM  By: Rahul Singh
  12/12 checks passed, 0 warnings, 0 failed        [View Full QC Checklist →]
"Today's Self-Test (P5-04)"
  Status: [green]Passed  Performed: 27 May 2025, 06:55 AM  By: Rahul Singh
  10/10 tests passed                                [View Self-Test Report →]
[green banner] "Machine ready for this session."
  — OR, if either is missing/failed —
[red banner] "Today's QC has not been performed for this machine."
  [Run QC Now →] (deep-links to P5-02; does not duplicate its form here)
Footer: [Back]  [Save & Continue →] (disabled unless both show Passed)
```

## UI Component Tree
Header → Patient/Machine Banner → Today's QC Status card → Today's Self-Test Status
card → confirmation/blocking banner → Footer.

## Layout Grid
12-column responsive; two status cards side by side, banner full-width below.

## Field Definitions
**Today's QC Status:** Status (Passed/Failed/Not Yet Performed), Performed date/time,
Performed By, pass-count summary — all **read-only, sourced from P5-02**. **Today's
Self-Test Status:** same pattern, **read-only, sourced from P5-04**.

## Input Types
Entirely read-only display; one conditional action button ("Run QC Now," only shown
if QC is missing, deep-links to P5-02 rather than embedding its form here).

## Mandatory Fields
N/A — nothing is entered on this screen.

## Validation Rules
Save & Continue disabled unless both Today's QC and Today's Self-Test show Passed —
same hard gate as before, now sourced from Part 5 instead of a local re-check.

## Business Rules
This screen never writes to `machine_qc` or `machine_self_test` — those are owned
entirely by P5-02/P5-04. This screen only reads.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED — O2]` HBsAg-positive isolation-equipment policy — still
enforced upstream at assignment (P5-05), not re-checked here.

## Auto-calculations
None — pure read-through of P5-02/P5-04's own already-calculated pass/fail status.

## Decision Trees
Both Passed → green banner, Save & Continue enabled. Either Failed or Not Yet
Performed → red banner, Save & Continue blocked, "Run QC Now" offered if simply not
yet done today (vs. genuinely Failed, which routes to Biomedical Engineer per P5-04's
own decision tree, out of this screen's control).

## API Requests
`[PROPOSED]` `GET /machines/{id}/qc/today`, `GET /machines/{id}/self-test/today` —
both reading Part 5's tables, no Part-2-owned machine-check endpoint remains.

## API Responses
`[PROPOSED]` qc: {status, performed_at, performed_by, summary}, self_test: {status,
performed_at, performed_by, summary}.

## Database Mapping
`[PROPOSED]` No table owned by this screen. Reads `machine_qc` and
`machine_self_test`, both defined and owned under Part 5 (P5-02/P5-04).

## Audit Events
`machine_safety_reviewed`, `run_qc_now_clicked` (if applicable).

## Accessibility
See Shared Platform Conventions.

## Error Handling
QC/Self-Test data fetch failure → toast + last-known cached status with a stale-data
indicator, doesn't silently show a false Passed state.

## Empty States
No QC or Self-Test record exists yet today → red banner, "Run QC Now" prominent.

## Loading States
Skeleton status cards.

## Offline Behavior
Last-synced QC/Self-Test status shown with a visible timestamp — this screen was
always closer to Part 2/3's "upstream read-only" pattern than a technician-entry
screen, now correctly modeled as one.

## Acceptance Criteria
Technician can confirm machine readiness for this specific session in under 5
seconds, without repeating any check already performed once today.

## Test Cases
Save & Continue correctly blocked when either status is Failed/Not Yet Performed;
"Run QC Now" correctly deep-links to P5-02 without duplicating its form; a QC passed
earlier today correctly shows here without re-entry.

## Future AI Enhancements
None specified — this is now a thin review screen, not a natural home for predictive
features (those belong on P5-01/P5-02/P5-04 instead).

---

# P2-09 — Water Safety

## Decision Log (this screen)
**Rewritten again this round, superseding both prior versions.** The full 9-parameter
editable checklist (previous draft) and the day-scoped thin review (previous draft) are
both replaced. Per research findings (chlorine/hardness require at minimum daily,
ideally per-shift, verification — CMS/AAMI practice and the *Indian Journal of
Nephrology*'s own Water Treatment guideline), this screen is now a **shift-scoped**
read-only review of Part 5's new P5-03a (Shift Water Check), not a day-scoped review and
not a local data-entry form. Bacteria/Endotoxin are explicitly out of this screen's
concern entirely — those are monthly lab-cycle items, tracked on Part 5's new P5-03c RO
Microbiological Log, never gated per-session or per-shift.

## Screen Objective
Confirm this shift's RO water chemistry check (chlorine, hardness) has already passed
for the plant this machine draws from, before proceeding — a review/gate, matching the
P2-08 Machine Safety pattern exactly.

## Clinical Rationale
Per Safety Protocol §1.A Water System and CMS/AAMI practice (chlorine/chloramine testing
"before each patient shift"; Indian Journal of Nephrology: "test daily at least for
residual total chlorine and hardness") — this validation happens once per shift at the
plant level (P5-03a), not re-measured per patient.

## Users
Dialysis Technician (primary, reviews); Nurse, Nephrologist (view).

## Navigation
Machine Safety (P2-08) → Water Safety (this screen, step 6 of 9) → Infection Control
(P2-10).

## Wireframe
`[DESIGN SPECIFICATION — supersedes both prior P2-09 drafts]`
```
Title: "P2-09 – Water Safety"  subtitle: "Confirm this shift's RO water chemistry has
                                been verified before proceeding."
RO Plant: RO Plant 1 (Main) — supplying B-02/HD-01     Shift: Morning (07:00 AM)
"This Shift's Water Check (P5-03a)"
  Status: [green]Passed  Performed: 26 May 2025, 06:55 AM  By: Rahul Singh
  Chlorine (Free): 0.00 ppm (≤0.1)   Chloramine: 0.00 ppm (≤0.1)   Hardness: 30 ppm (≤50)
  3/3 within range                                    [View Full Check →]
"Today's RO System Verification (P5-03b)"
  Status: [green]Verified  Performed: 26 May 2025, 07:10 AM  By: Rahul Singh
  8/8 parameters within range                          [View Full Verification →]
[green banner] "RO water quality confirmed for this shift."
  — OR —
[red banner] "This shift's water check has not been completed for this plant."
  [Check Now →] (deep-links to P5-03a)
Footer: [Back]  [Save & Continue →] (disabled unless both show Passed/Verified)
```

## UI Component Tree
Header → Patient/Machine Banner → This Shift's Water Check status card (P5-03a) →
Today's RO System Verification status card (P5-03b) → confirmation/blocking banner →
Footer.

## Layout Grid
12-column responsive; two status cards side by side, banner full-width below — same grid
as P2-08.

## Field Definitions
**This Shift's Water Check:** Status (Passed/Failed/Not Yet Performed), Chlorine (Free)
value + range, Chloramine value + range, Hardness value + range, Performed date/time,
Performed By — all **read-only, sourced from P5-03a**. **Today's RO System
Verification:** Status, pass-count summary, Performed date/time, Performed By — all
**read-only, sourced from P5-03b**.

## Input Types
Entirely read-only display; one conditional action button ("Check Now," shown only if
this shift's check is missing, deep-links to P5-03a).

## Mandatory Fields
N/A — nothing is entered on this screen.

## Validation Rules
Save & Continue disabled unless This Shift's Water Check **and** Today's RO System
Verification both show Passed/Verified.

## Business Rules
This screen never writes to `ro_shift_check` or `ro_quality` — those are owned entirely
by P5-03a/P5-03b. This screen only reads. **[NEW]** Specifically, it reads
`ro_shift_check.shift_check_passed` and `ro_quality.daily_verification_passed` — two
booleans, not a client-side recomputation of every underlying parameter — so this
screen's green/red banner can never drift out of sync with P5-03a/P5-03b's own pass/
fail determination. Bacteria/Endotoxin (monthly, `ro_microbiology`
per P5-03c) are never referenced here — a passing shift check does not imply a passing
monthly microbiology result, and this screen doesn't claim otherwise.

## Clinical Rules
Water must pass its shift-level chemistry check before being used for any patient's
dialysate this shift, per Safety Protocol §1.A.

## Auto-calculations
None — pure read-through of `shift_check_passed` and `daily_verification_passed`,
both already calculated by P5-03a/P5-03b.

## Decision Trees
Both Passed/Verified → green banner, Save & Continue enabled. Either Failed or Not Yet
Performed → red banner, Save & Continue blocked, "Check Now" offered if simply not yet
done this shift (vs. genuinely Failed, which routes per P5-03a/b's own decision tree).

## API Requests
`[PROPOSED]` `GET /ro-plants/{id}/shift-check/current`, `GET /ro-plants/{id}/verification/today`.

## API Responses
`[PROPOSED]` shift_check: {shift_check_passed, chlorine, chloramine, hardness,
performed_at, performed_by}, ro_verification: {daily_verification_passed, performed_at,
performed_by, summary}.

## Database Mapping
`[PROPOSED]` No table owned by this screen. Reads `ro_shift_check` and `ro_quality`,
both defined and owned under Part 5 (P5-03a/P5-03b).

## Audit Events
`water_safety_reviewed`, `check_now_clicked` (if applicable).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Shift-check/verification data fetch failure → toast + last-known cached status with a
stale-data indicator, doesn't silently show a false Passed state.

## Empty States
No shift check exists yet → red banner, "Check Now" prominent.

## Loading States
Skeleton status cards.

## Offline Behavior
Last-synced status shown with a visible timestamp — same upstream read-only pattern as
P2-08.

## Acceptance Criteria
Technician can confirm water readiness for this specific shift in under 5 seconds,
without repeating any check already performed this shift.

## Test Cases
Save & Continue correctly blocked when either status is Failed/Not Yet Performed; "Check
Now" deep-links to P5-03a without duplicating its form; a check passed earlier this
shift correctly shows here without re-entry; a check from a *previous* shift does not
satisfy this screen (shift-scoped, not day-scoped).

## Future AI Enhancements
None — thin review screen, not a home for predictive features.

---

# P2-10 — Infection Control

## Decision Log (this screen)
S15 partially resolved — Figma confirms a fuller checklist than either prior text
source (10 items vs. the Safety Protocol's 5), including Environmental Safety-adjacent
items (Work Area Clean & Disinfected, Dialysis Machine Disinfected, RO System
Disinfection). **Confirmed by you this round**: "Scrub-the-Hub" gets its own distinct,
conditional checklist row (CVC patients only), rather than being folded into the
general "Aseptic Technique for Access" row — see Field Definitions. This screen's
checklist is now 10 items for AVF/AVG patients, 11 for CVC patients.

## Screen Objective
`[FIGMA-DERIVED]` "Ensure infection prevention measures are followed before starting
dialysis" (screen's own subtitle).

## Clinical Rationale
Reduce healthcare-associated infection risk before vascular access is used, per Safety
Protocol §1.A Infection Prevention.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Water Safety (P2-09) → Infection Control (this screen, step 7 of 9) → Safety Validation
(P2-11).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P2-10 – Infection Control"  subtitle: "Ensure infection prevention measures are
                                     followed before starting dialysis."
Step bar (9 steps, step 7 active).
"Infection Control Overview": Check Time[26May2025,07:05AM] Check Performed By[Rahul Singh]
  Hand Hygiene Performed[✓Yes] PPE Used[✓Yes] Compliance[100%]
"Infection Control Checklist" — "Verify all infection control practices have been followed."
Table: Checklist Item | Status | Details/Observations | Action
  Hand Hygiene               | Completed✓     | Performed before patient contact | —
  Personal Protective Equipment(PPE)|Used✓    | Gloves, Mask                     | —
  Work Area Clean & Disinfected|Yes✓          | Chair,bed,trolley,monitor surfaces cleaned|—
  Dialysis Machine Disinfected(Post Check)|Yes✓| External surfaces disinfected   | —
  RO System Disinfection     | Up to Date✓    | Last disinfection on 22May2025   | —
  Dialyzer Reuse(If applicable)|Not Applicable | Single-use dialyzer              | —
  Aseptic Technique for Access|Followed✓      | Aseptic non-touch technique used  | —
  Scrub-the-Hub/CVC Catheter Hub Disinfection[shown only if Access Type=CVC]|Followed✓|Hub scrubbed with antiseptic, friction, separate pad per hub|—
  Sharps Handling             | Safe✓          | Sharps disposed in safety container|—
  Bio-medical Waste Disposal  | Compliant✓     | Bags sealed and labeled           | —
  Isolation Precautions(If applicable)|Not Applicable|No isolation required       | —
"Additional Notes": [textarea:"All infection control practices followed as per
                     protocol." 53/300]
"Action Required" — "Based on checklist status." [green]✓"No action required. All
                     infection control measures are compliant."
Footer: [← Back]  [Save as Draft]  [Save & Continue →]
Right rail: Patient Summary | Infection Control Alerts | Infection Control Reference | Notes(Optional)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 9-Step Progress Bar → Infection Control
Overview panel (5 fields) → Infection Control Checklist table (10 items) → Additional
Notes textarea → Action Required banner → Footer → Right rail (Patient Summary,
Infection Control Alerts, Infection Control Reference: Hand Hygiene/PPE Compliance %,
Machine Disinfection status, Last RO Disinfection date, Notes).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **Overview:** Check Time, Check Performed By, Hand Hygiene Performed
(Yes/No), PPE Used (Yes/No), Compliance (%, calculated). **Checklist (10 items for
AVF/AVG patients, 11 for CVC patients, each Status/Details/Action):** Hand Hygiene,
Personal Protective Equipment (PPE), Work Area Clean & Disinfected, Dialysis Machine
Disinfected (Post Check), RO System Disinfection, Dialyzer Reuse (if applicable — Not
Applicable when single-use), Aseptic Technique for Access, **Scrub-the-Hub / CVC
Catheter Hub Disinfection (conditional — shown only when Access Type = CVC, per P2-07;
confirmed by you this round as its own distinct row, not folded into Aseptic Technique
for Access)**, Sharps Handling, Bio-medical Waste Disposal, Isolation Precautions (if
applicable). **Additional Notes:** free text, 0/300.

This resolves S15's "Environmental Safety" concern (Work Area Clean & Disinfected +
Dialysis Machine Disinfected + RO System Disinfection collectively cover it) and adds
Sharps Handling and Bio-medical Waste Disposal, neither of which were in the Safety
Protocol's own list. The Safety Protocol's "Scrub-the-Hub" CVC-specific item is now
resolved as its own conditional row (see above) — no longer open.

## Input Types
Yes/No or status toggles per checklist row (Completed/Used/Yes/Not Applicable, etc.);
free-text Additional Notes.

## Mandatory Fields
**Critical (Mandatory):** Hand Hygiene, Aseptic Technique for Access, Scrub-the-Hub/CVC
Catheter Hub Disinfection (when applicable), Sharps Handling — each a direct
bloodstream-infection or immediate-harm prevention control (see the Critical/
Non-Critical Field Classification reference, Shared Platform Conventions). **Non-
Critical (Non-Mandatory, skippable-with-reason):** PPE Used, Work Area Clean &
Disinfected, Dialysis Machine Disinfected, RO System Disinfection, Dialyzer Reuse (if
applicable), Bio-medical Waste Disposal, Isolation Precautions (if applicable) — "Not
Applicable" remains an acceptable resolved state for the two conditional rows.

## Validation Rules
Any Critical item not resolved → shared checklist failure state (Shared Platform
Conventions), blocking Save & Continue, no override. Any Non-Critical item left blank
follows the Non-Mandatory Field Skip Workflow instead (warning popup, optional reason,
logged either way, does not block).

## Business Rules
Compliance % (shown as 100% in the example) is a calculated rollup of the checklist —
see Auto-calculations.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Hand Hygiene must be performed immediately before patient
contact; Aseptic Technique mandatory for any access-site contact.

## Auto-calculations
Compliance % = (count of Completed/Used/Yes/Not-Applicable items ÷ total applicable
items [10 for AVF/AVG, 11 for CVC]) × 100.

## Decision Trees
Every Critical item resolved → "No action required" banner, Save & Continue enabled.
Any Critical item unresolved → shared checklist failure state; banner names the
unresolved item(s), e.g. "Hand Hygiene not confirmed. Complete before proceeding." —
hard block, no override, per the Non-Mandatory Field Skip Workflow's principle (Shared
Platform Conventions). A Non-Critical item left blank follows that same Skip Workflow
(warning popup, optional reason, logged either way) rather than blocking here.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/infection-control` (10 checklist fields, additional
notes, recorded_by, recorded_at).

## API Responses
`[PROPOSED]` Echo + compliance % + overall status + a `flags` array naming any
unresolved item.

## Database Mapping
`[PROPOSED]` `infection_control_checklist` (session_id, 10 item results,
**scrub_the_hub_result [nullable, CVC-only]**, compliance_pct, notes, recorded_by,
recorded_at).

## Audit Events
`infection_checklist_started`, `infection_checklist_completed`,
`infection_checklist_item_failed` (if applicable, naming the specific item).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Unresolved checklist item → shared checklist failure state (row turns red, "Escalate"
action button appears).

## Empty States
`[FIGMA-DERIVED]` "No infection control alerts." confirmed empty-state pattern.

## Loading States
Skeleton table while data loads.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
All 10 checklist items resolved (Completed/Used/Yes/Not Applicable) before proceeding.

## Test Cases
Compliance % recalculates correctly; unresolved item blocks Save & Continue; Not
Applicable is accepted as a valid resolved state for Dialyzer Reuse and Isolation
Precautions.

## Future AI Enhancements
Predict readiness delays and highlight abnormal workflow (carried from the Revised text
spec). **[COMPLIANCE ADDITION]** human-in-the-loop labelling applies.

---

# P2-11 — Safety Validation

## Decision Log (this screen)
**No Figma export exists for this screen** — per your instruction, this section is
**synthesized** from the restored Specification-file wireframe, reskinned to match the
design system established by P2-03 (9-step task summary pattern) and P2-08/P2-09/P2-10
(checklist-table pattern). **Finalized this round, per your explicit sign-off** after
the Blocking Issues auto-summary approach (below) and the new Items Skipped This
Session section were added — this screen is now build-ready, no longer a design
proposal pending review. Every element below remains tagged `[SYNTHESIZED]` for
traceability (no Figma export exists), but the open-item status is closed.

## Screen Objective
`[SYNTHESIZED]` Provide a single, explicit gate confirming every pre-dialysis safety
check (Verification, Vitals, Assessment, Access, Machine, Water, Infection) has passed
before Start Dialysis is enabled — matching Module 2 Part 1 §12's Clinical Safety Rules.

## Clinical Rationale
`[SYNTHESIZED]` Final cross-check before patient connection, consolidating the 8 prior
steps into one reviewable summary rather than requiring the technician to revisit each
screen individually.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Infection Control (P2-10) → Safety Validation (this screen, step 8 of 9) → Start
Dialysis Confirmation (P2-12).

## Wireframe
`[SYNTHESIZED — matches the P2-03 task-summary visual pattern and the P2-08/09/10
checklist-table pattern]`
```
Title: "P2-11 – Safety Validation"  subtitle: "Review all pre-dialysis checks before
                                     confirming readiness to start dialysis."
Step bar (9 steps, step 8 active).
"Pre-Dialysis Validation Summary" — "All steps must show Complete before you can validate."
Table: Step | Status | Completed By | Time
  1 Patient Verification        | Completed✓ | Rahul Singh | 06:40 AM
  2 Vitals & Measurements       | Completed✓ | Rahul Singh | 06:42 AM
  3 Patient Assessment          | Completed✓ | Rahul Singh | 06:48 AM
  4 Vascular Access Assessment  | Completed✓ | Rahul Singh | 06:52 AM
  5 Machine Safety              | Completed✓ | Rahul Singh | 06:55 AM
  6 Water Safety                | Completed✓ | Rahul Singh | 07:00 AM
  7 Infection Control           | Completed✓ | Rahul Singh | 07:05 AM
"Blocking Issues" (shown only if any step has a Critical/Mandatory field genuinely
  incomplete):
  [read-only, auto-populated summary of any unresolved Critical item across steps 1-7,
  pulled directly from that step's own record - never free-text re-entry]
"Items Skipped This Session" (shown only if any step has a Non-Critical field that
  was skipped) - [NEW, per the Non-Mandatory Field Skip Workflow]:
  Table: Screen | Field | Reason
    P2-06 Patient Assessment | Loss of Appetite | "Patient declined to answer"
    P2-05 Vitals & Measurements | Pain Score | No reason provided
  This section never blocks Validate & Continue - it's informational, surfacing what
  was skipped and why (or that no reason was given) for whoever reviews this session.
"Validation Result" [green]✓ "All pre-dialysis checks complete. Safe to proceed to
                     Start Dialysis."
Footer: [← Back]  [Save as Draft]  [Validate & Continue →]
Right rail: Patient Summary | Pre-Dialysis Alerts (same feed as P2-03) | Notes(Optional)
```

## UI Component Tree
`[SYNTHESIZED]` Top Bar → Page Header → 9-Step Progress Bar → Validation Summary table
(7 rows, one per prior step) → conditional Blocking Issues panel → Validation Result
banner → Footer (Back, Save as Draft, Validate & Continue) → Right rail (Patient
Summary, Pre-Dialysis Alerts, Notes) — this rail composition matches P2-05 through
P2-10 exactly, for consistency.

## Layout Grid
12-column responsive, matching all other pre-dialysis screens; main form ≈8/12, right
rail ≈4/12.

## Field Definitions
`[SYNTHESIZED]` Per-step: Step Name, Status (Completed/Incomplete/Flagged), Completed
By, Time — pulled read-only from steps 1–7's own records, not re-entered here.
**Blocking Issues (resolved this round): auto-populated read-only summary**, not
free-text technician entry — confirmed as your preferred approach, since the
underlying data already exists on each sub-screen and manual re-entry risked
transcription drift. **Items Skipped This Session (new this round):** a second,
separate read-only table — Screen, Field, Reason (or "No reason provided") — pulled
from `checklist_skip_log` (Non-Mandatory Field Skip Workflow, Shared Platform
Conventions) for every Non-Critical field skipped anywhere in steps 1–7 of this
session. Distinct from Blocking Issues: this section never blocks Validate & Continue,
it's purely informational.

## Input Types
Read-only status table; Validate & Continue button (only enabled when all 7 rows show
Completed); Notes free-text in the right rail.

## Mandatory Fields
All 7 prior steps must show Completed — meaning every Critical/Mandatory field on that
step is resolved. A step with only Non-Critical fields skipped (with or without reason)
still counts as Completed; those skips surface in Items Skipped This Session, not as a
blocker here.

## Validation Rules
`[WORKFLOW-DOC-DERIVED]` Per the Pre-Dialysis Complete Validation Matrix: Identity not
verified → block; Prescription not verified → block; Machine self-test fail → block;
AVF thrill absent → escalate/block; Critical BP → warn & acknowledge/escalate; Infection
checklist incomplete → block. This screen is where these individually-stated rules are
jointly evaluated.

## Business Rules
Any step with a Critical field flagged Incomplete keeps Validate & Continue disabled
and populates Blocking Issues with that step's name + reason. Any step with a
Non-Critical field skipped populates Items Skipped This Session but does not disable
Validate & Continue.

## Clinical Rules
None beyond the aggregation of steps 1–7's own clinical rules.

## Auto-calculations
Overall validation result = AND of all 7 step statuses.

## Decision Trees
```
All 7 steps' Critical fields Completed → "Validate & Continue" enabled → P2-12
  (regardless of any Non-Critical skips, which show in Items Skipped This Session)
Any step's Critical field Incomplete/Flagged → Blocking Issues populated with that
  step + reason → routing back to the specific failed step (e.g., a Machine Safety
  failure routes to P2-08, not just a generic "go back")
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/validate` (reads the 7 prior step statuses, returns
overall pass/fail).

## API Responses
`[PROPOSED]` overall_pass (bool), per-step status array, blocking_issues (auto-generated
text), validated_by, validated_at.

## Database Mapping
`[PROPOSED]` `safety_validation` (session_id, overall_pass, blocking_issues,
validated_by, validated_at) — referencing the 7 prior tables by session_id rather than
duplicating their data. **Items Skipped This Session reads `checklist_skip_log`
directly** (Non-Mandatory Field Skip Workflow, Shared Platform Conventions), filtered
to this session_id — no separate table owned here for that section.

## Audit Events
`safety_validation_attempted`, `safety_validation_passed`, `safety_validation_blocked`
(with the specific failed step + reason).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Any step's data failing to load → toast + that row shows an error state, distinct from
Incomplete.

## Empty States
N/A — all 7 rows are always populated once steps 1–7 exist for the session.

## Loading States
Skeleton table while the 7 step statuses load.

## Offline Behavior
Local draft-save with sync-on-reconnect for the Notes field; the validation table itself
reflects last-synced step data.

## Acceptance Criteria
Technician can confirm all-clear status in one view without revisiting individual
screens, unless a step is actually incomplete.

## Test Cases
All-Critical-complete → Validate & Continue enabled regardless of Non-Critical skips;
any single Critical-incomplete step blocks and routes correctly to that step; Blocking
Issues text accurately reflects the failed step and reason; Items Skipped This Session
accurately lists every Non-Critical skip across all 7 steps, with reason or "No reason
provided" as appropriate; a session with zero skips shows no Items Skipped section at
all (not an empty table).

## Future AI Enhancements
`[SYNTHESIZED, carried from the design pattern used on P2-08/09/10]` Predict readiness
delays and highlight abnormal workflow. **[COMPLIANCE ADDITION]** human-in-the-loop
labelling applies.

---

# P2-12 — Start Dialysis Confirmation

## Decision Log (this screen)
Figma-confirmed — this screen is substantially richer than either prior text source: a
full Pre-Dialysis Checklist Summary table (all 7 prior steps, not just 3 high-level
indicators) plus a password/PIN confirmation step not present in either text file.
**Resolved this round, all three operational-security decisions confirmed by you:**
(1) this is a **PIN, not a password** — the technician's login (username + password) is
set up by the admin; on that technician's first login, they're prompted to set a
short PIN, which is what's used for quick re-authentication on screens like this one.
(2) The proposed **3-attempt lockout** is confirmed as-is. (3) The PIN is **stored
locally in encrypted form** specifically to support offline validation — see Offline
Behavior below.

## Screen Objective
`[FIGMA-DERIVED]` "Final confirmation to start dialysis session" (screen's own
subtitle).

## Clinical Rationale
Provide a final, explicit, credentialed technician confirmation immediately before
dialysis begins, closing the pre-dialysis stage.

## Users
Dialysis Technician (primary, the only role that can actually start dialysis via
password/PIN entry); Nurse, Nephrologist (view).

## Navigation
Safety Validation (P2-11) → Start Dialysis Confirmation (this screen, step 9/final) →
(redirects into During-Dialysis session, out of scope).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P2-12 – Start Dialysis Confirmation"  subtitle: "Final confirmation to start
                                               dialysis session."
Step bar (7 steps, all ✓ — same condensed 7-step bar style as P2-04, step 7/Start
  Dialysis active): Patient Verification✓ Vitals&Measurements✓ Assessment✓
  Access Assessment✓ Safety Checks✓ Validation✓ Start Dialysis(active)
Patient banner: Ramesh Kumar[Active Patient] PID:P10023,58y,Blood Group:O+
  Weight(Dry):68.5kg | Today's Schedule:12Jan2023(2y4m) | Shift:Morning07:00AM
  Bed/Machine: B-02/HD-01
"Pre-Dialysis Checklist Summary" — "All required checks must be completed before
  starting dialysis."                                              [All Clear ✓]
Table: Check Item | Status | Details | Completed By | Time
  Patient Verification    | Completed✓ | Identity and prescription verified | Rahul Singh|06:40AM
  Vitals & Measurements   | Completed✓ | All vitals within acceptable range | Rahul Singh|06:42AM
  Patient Assessment      | Completed✓ | No critical issues                | Rahul Singh|06:45AM
  Vascular Access Assessment|Completed✓| AV Fistula(Left) – Good            | Rahul Singh|06:47AM
  Machine Safety           | Completed✓ | All parameters normal              | Rahul Singh|06:48AM
  Water Safety             | Completed✓ | RO water quality normal             | Rahul Singh|06:49AM
  Infection Control        | Completed✓ | Checklist completed                 | Rahul Singh|06:50AM
  Safety Validation        | Completed✓ | All safety criteria met             | Rahul Singh|06:51AM
"Important Reminders" (amber):        "Confirm to Start Dialysis" (blue):
  • Ensure vascular access is secure and visible.  ☑ "I confirm that all pre-dialysis
  • Monitor patient closely during first 15 minutes.  checks are complete and it is safe
  • Verify UF goal and treatment time as prescribed.  to start dialysis for this patient."
  • Report any discomfort or alarms immediately.    Your PIN: [•••••• 👁]
Footer: [Back]                                        [▷ Start Dialysis]
ℹ "Once started, you will be redirected to the During Dialysis session."
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 7-Step Progress Bar (all complete) → Patient
Banner → Pre-Dialysis Checklist Summary table (8 rows — note: 8, not 7; this table
includes Safety Validation itself as its own row, distinct from P2-11's own 7-row
summary of steps 1–7) → 2-column panel (Important Reminders + Confirm-to-Start-Dialysis
with checkbox + password/PIN field) → Footer (Back, Start Dialysis) → redirect notice.

## Layout Grid
12-column responsive; Checklist Summary table full-width; Reminders/Confirm panel
2-column below it.

## Field Definitions
`[FIGMA-DERIVED]` **Checklist Summary (8 rows):** Patient Verification, Vitals &
Measurements, Patient Assessment, Vascular Access Assessment, Machine Safety, Water
Safety, Infection Control, Safety Validation — each with Status, Details, Completed By,
Time. **Important Reminders (static text, 4 bullets):** vascular access visibility,
15-minute close-monitoring window, UF goal/time verification, alarm-reporting reminder.
**Confirm to Start Dialysis:** a required checkbox attesting completeness/safety, plus a
**PIN field** (masked, with a show/hide toggle) — this is new information not
present in either prior text source: **starting dialysis requires technician
re-authentication via PIN**, not just a button click. Confirmed this round: this is a
short PIN set by the technician on first login, distinct from their system login
password — not a re-entry of the login password itself.

## Input Types
Read-only checklist table; required checkbox (attestation); masked PIN input
with visibility toggle; Back and Start Dialysis buttons (Start Dialysis disabled until
checkbox is checked and PIN is entered).

## Mandatory Fields
All 8 checklist rows Completed (read-only, inherited); attestation checkbox; PIN.

## Validation Rules
`[DESIGN SPECIFICATION — confirmed by you this round]` Start Dialysis
disabled unless: all 8 checklist rows show Completed AND the attestation checkbox is
checked AND the PIN is entered. On submission:

- **Incorrect PIN:** the field border turns red, an inline error appears
  directly below it — "Incorrect password. Try again." (matching this document's
  established plain, non-apologetic error-copy style) — the rest of the form (checklist,
  attestation checkbox) is untouched, so the technician doesn't have to re-confirm
  anything else. The password field clears and refocuses.
- **Lockout policy — confirmed by you this round, no longer proposed:** after **3
  consecutive
  failed attempts**, the Start Dialysis action locks for that technician on that session
  — the button becomes disabled with the message "Too many failed attempts. Ask a
  nurse or nephrologist to unlock." A nurse/nephrologist can unlock by entering their
  own credentials (a distinct, logged action). Every failed attempt and every lockout
  event is audited (see Audit Events) — a lockout does **not** silently retry-forever,
  since this is the single most safety-critical action in the pre-dialysis stage.

## Business Rules
This screen's own gating condition depends entirely on P2-11's Safety Validation
outcome (row 8) plus a fresh technician re-authentication — not merely re-displaying
P2-11's summary.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation. A
consent-revoked patient blocks Technician access to this screen entirely — dialysis
cannot be started by a Technician for this patient until consent is restored; this is
independent of, and in addition to, the existing PIN/lockout gating above.

## Clinical Rules
Important Reminders are static safety guidance, not data-driven from this patient's
specific findings (same 4 bullets regardless of patient).

## Auto-calculations
None.

## Decision Trees
```
Submit PIN
  ├── All 8 rows Completed + checkbox checked + PIN correct →
  │     session status → Started → redirect to During-Dialysis
  ├── PIN incorrect (attempt 1 or 2) → inline red error, field clears, retry allowed
  └── PIN incorrect (3rd consecutive attempt) → Start Dialysis locks for this
        technician/session → requires nurse/nephrologist unlock (own credentials,
        logged separately) → technician may then retry
"Back" → returns to P2-11.
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/start` (attestation=true, pin [sent securely,
not logged in plaintext, verified against the technician's stored PIN hash], started_by).
`[PROPOSED]` `POST /sessions/{id}/start/unlock`
(unlocked_by, unlock reason) for the nurse/nephrologist override path. Authentication
mechanism confirmed this round: a short PIN, set by the technician on first login, not
their system login password.

## API Responses
`[PROPOSED]` session_id, started_by, started_at, machine_id, redirect_target
(During-Dialysis session URL/route); on failure, an attempts_remaining count or a
locked=true flag.

## Database Mapping
`[PROPOSED]` `session` (status transition to 'started', started_by, started_at,
machine_id), linked back to `patient_verification`, `vitals_predialysis`,
`patient_assessment_predialysis`, `vascular_access_assessment`, `machine_qc`,
`ro_quality`, `infection_control_checklist`, and `safety_validation` by session_id, so
the full pre-dialysis record is traceable from this one row. `[PROPOSED]`
`start_dialysis_auth_attempts` (session_id, attempted_by, success, timestamp) to support
the lockout counter and audit trail.

## Audit Events
`dialysis_session_started` — capturing user_id, role, patient_id, machine_id,
safety_validation_id, **authentication method: PIN** (confirmed this round),
timestamp. `start_auth_failed` (per failed attempt), `start_auth_locked` (on the 3rd
failure), `start_auth_unlocked` (nurse/nephrologist override, capturing who unlocked it).

## Accessibility
See Shared Platform Conventions; password/PIN field needs a properly labelled
show/hide toggle for screen-reader users.

## Error Handling
Incorrect PIN → inline red error below the field per Validation Rules above;
rest of the form (checklist, attestation) untouched. 3rd consecutive failure →
lockout state per Validation Rules, requiring nurse/nephrologist unlock.

## Empty States
N/A — all fields pre-populated from prior steps.

## Loading States
Skeleton table while the 8-row summary loads.

## Offline Behavior
**Resolved this round.** Starting dialysis while offline is a meaningful edge case
(the machine is physically present regardless of network state). Per your confirmed
design: the technician's **PIN is stored locally in encrypted form** (set at first
login, synced to the device at that time) specifically to support this — an offline
PIN entry is validated against the locally-stored encrypted PIN, not a live server
call. The attestation checkbox and checklist-completion state were already
locally available from the prior 7 steps' own offline-capable records, so this closes
the full offline-start path: checklist state (local), attestation (local), PIN
validation (local, encrypted) — session-start itself still queues for sync-on-reconnect
like every other state-changing action in this document.

## Acceptance Criteria
Technician cannot start dialysis without all 8 checks complete, attestation, and valid
re-authentication.

## Test Cases
Incomplete checklist blocks Start Dialysis; unchecked attestation blocks; wrong
PIN blocks with inline error; correct submission transitions session status and
redirects correctly; audit event captures PIN as the authentication method; 3 consecutive
failures triggers lockout; PIN validates correctly offline against the locally-stored
encrypted value; nurse/nephrologist unlock restores the ability to retry and
is itself audited.

## Future AI Enhancements
None specified in the Figma for this screen.

---

# Remaining Open Items (everything not yet closed)

This round closed the large majority of what was previously open, based on your
direct, item-by-item comments. What follows is organized by genuine status, not
optimistic rounding — items are only marked Closed where your comment gave an actual
answer, not where I inferred one.

## Closed this round, with your explicit answer

1. Non-Mandatory field skip behavior (queue/checklist screens generally) — **Closed.**
   Every checklist/assessment field across P2-01 through P2-12 is now Critical
   (Mandatory, hard-block, no override) or Non-Critical (Non-Mandatory,
   skippable-with-reason via the new Non-Mandatory Field Skip Workflow). See Shared
   Platform Conventions for the full mechanism, including the backend skip log and the
   daily per-staff Alert/Notification digest to the doctor.
2. P2-01 within-shift tie-breaking — **Closed.** Emergency patients always take
   priority; absent-slot backfill goes to the next arrived+paid patient; manual
   "Mark Emergency" is a standing action available at any time.
3. P2-01 Critical-alert row-level indicator — **Closed, no new UI added.** The Alerts
   card's Critical/Warning/Info severity concept is confirmed; it's technician
   reference only, mainly machine-derived in practice, and the doctor already receives
   lab-derived alerts through a separate module. No row-level indicator needed beyond
   the existing Priority dot.
4. P2-01 refresh interval — **Closed.** Event-driven: refreshes when any session
   completes, not a fixed poll.
5. P2-02 Proceed/View Full Profile role-gating — **Closed.** Proceed is
   Technician-only; View Full Profile is open to all three roles.
6. P2-03 Print Summary role-gating — **Closed.** Nephrologist-only, and hidden
   entirely (not just disabled) from Nurse and Technician views.
7. P2-04 sign-off on the Infection Status Check and Consumables Confirmation cards —
   **Closed.** Both approved as designed, confirmed needed.
8. P2-05 Warning/Critical two-tier threshold model — **Closed** (the model itself).
   Matches your existing doctor-dashboard pattern. The *exact numeric boundaries* per
   vital are a separate, still-open item — see below.
9. P2-05 SpO₂ mandatory status — **Closed, explicitly changed.** Reclassified from
   Non-Mandatory (prior S6 decision) to Mandatory/Critical, per your Critical-field
   instruction. Flagged as an override of the earlier decision, not silent.
10. UF Goal heparin IU→mL conversion — **Closed.** 5,000 Units/mL default vial
    concentration, Volume (mL) = Ordered Dose ÷ Concentration, facility-configurable.
11. UF-rate ceiling hard-block-vs-warning — **Closed.** Critical-tier, hard block, no
    override — resolved by the same no-override principle applied everywhere else,
    not a separate decision.
12. P2-06 mandatory field set — **Closed.** Full Critical/Non-Critical split applied
    (Chest Pain, Bleeding/Bruising, Shortness of Breath, Dizziness, Fever/Chills, Any
    Abnormal Finding, Consciousness, Lung Sounds, Heart Sounds = Critical; the rest =
    Non-Critical).
13. P2-06 escalation for high-severity "Yes" answers — **Mostly closed.** The field can
    no longer be silently skipped (it's Critical/Mandatory) and requires a comment.
    **Residual sub-question, genuinely still open:** whether answering "Yes" to a
    Critical symptom should *also* trigger a real-time nurse/nephrologist notification
    beyond the mandatory comment — your answer confirmed the skip-workflow (a
    different mechanism, for blank fields), not this. Not assumed resolved.
14. P2-07 CVC branch — **Closed.** Table approved, plus the research-derived
    Tenderness/Pain at Exit Site row added (EXITA Study). Field Definitions, Wireframe,
    and Database Mapping all updated.
15. P2-07 right-rail CVC adaptations — **Closed.** Approved as designed.
16. P2-08 Disinfection Status / Component Verification — **Closed.** Folded into the
    existing aggregate pass-count on the read-only review card (now 12/12, matching
    P5-02's current item count), not broken out as separate rows.
17. P2-10 Scrub-the-Hub / CVC hub disinfection — **Closed.** Added as its own
    conditional row (CVC patients only), distinct from the general Aseptic Technique
    for Access row. Screen is now 10 items (AVF/AVG) or 11 (CVC).
18. P2-11 Blocking Issues: auto-summary vs. free text — **Closed.** Auto-summary
    confirmed. New "Items Skipped This Session" section added alongside it, listing
    Non-Critical skips separately and non-blockingly.
19. P2-11 overall synthesis sign-off — **Closed.** Finalized; no longer a design
    proposal pending review.
20. P2-12 lockout attempts — **Closed.** 3 consecutive attempts, as proposed.
21. P2-12 password vs. PIN — **Closed.** Short PIN, set by the technician at first
    login (distinct from their system login password), used for quick
    re-authentication at screens like this one.
22. P2-12 offline authentication — **Closed.** PIN stored locally in encrypted form,
    synced at first-login setup, validated locally when offline.
23. Shared checklist override policy (previously the single biggest open cross-screen
    question) — **Closed, resolved differently than originally proposed.** There is no
    override path anywhere in the final design. A Critical field is never skippable or
    overridable, by anyone, on any screen. A Non-Critical field is skippable by the
    technician alone, via the Skip Workflow. This fully replaces the earlier
    instrument-vs-clinical-judgment override split.

## Still genuinely open — numeric/clinical sign-offs only

24. **Exact Warning/Critical numeric boundaries per vital** (P2-05: BP, Pulse,
    Temperature, SpO₂) — the two-tier *model* is confirmed; placeholder numbers
    (KDOQI-consistent defaults) are in the document, explicitly marked as not your
    real "other dashboard" figures. Needs Dr. Rajapurkar's actual numbers.
25. **UF-rate ceiling exact numeric value** — currently a 13 mL/kg/hr default proposal
    pending Dr. Rajapurkar's sign-off; the hard-block behavior itself is settled
    (#11 above), only the number is open.

## Still genuinely open — not addressed in your comments

26. **P2-02 "Edit Info" role-gating** — your answer covered Proceed and View Full
    Profile; Edit Info wasn't addressed. Not guessed; still open.
27. **P2-06 residual escalation question** — see item 13 above.
28. **Daily digest zero-skip-day behavior** — if a staff member has a fully clean day
    (no skips at all), does the system send nothing, or a positive "0 skips today"
    confirmation? Assumed "send nothing" as the default pending your confirmation;
    flagged in the Non-Mandatory Field Skip Workflow section rather than silently
    decided.

None of the items in the last two groups block using this document as your build
reference — they're narrow, specific numbers or single-field role questions, not
structural gaps.

# Self-check

- Every `[FIGMA-DERIVED]` claim traces to the nine provided images, unchanged from
  prior rounds — this pass did not touch that evidentiary base, only the open-item
  resolutions layered on top of it.
- P2-11 remains explicitly tagged `[SYNTHESIZED]` throughout (no Figma export exists),
  but its open-item status is now Closed per your sign-off — tag and status are two
  different things, both stated accurately rather than one implying the other.
- **This pass's process, and what it caught:** every one of your 27 red-comment
  answers was applied as a direct edit to the specific section it affected, then
  verified present in the file with a targeted search immediately after — not assumed
  written because I'd described it in chat. This discipline caught two real gaps
  during this same pass that would otherwise have shipped inconsistent: P2-05's UF-rate
  escalation paragraph and P2-10's Decision Trees section still had old
  "nurse/nephrologist override" language after the Non-Mandatory Field Skip Workflow
  was written, and P2-07/P2-10's Mandatory Fields sections had never actually been
  updated with the Critical/Non-Critical split despite the classification existing
  elsewhere in this conversation. All four are fixed above.
- A final document-wide search for "override," "acknowledgment," and "nurse/
  nephrologist review" turned up only two remaining matches, both correct as-is: this
  section's own description of the new no-override policy, and P2-12's *unlock*
  mechanism (a distinct, confirmed feature — unlocking a PIN lockout — not a checklist
  override).
- No API path, database column, or audit-log field is asserted as confirmed fact — all
  such content remains tagged `[PROPOSED]` pending engineering sign-off, unchanged from
  prior rounds.
- **Compliance-audit pass (this round):** four items from the Compliance & Architecture
  Audit (against the Kifayti Health Compliance Bible v1.1, DPDP/HIPAA/ABDM sections)
  were resolved per your direct answers and applied as direct edits, each verified
  present with a targeted search immediately after writing it: (1) offline-cache
  encryption statement, (2) the ABDM consent-revocation anonymization rule — added as a
  new Cross-Screen Business Rule and cross-referenced from P2-01, P2-02, P2-03, P2-04,
  and P2-12's own Business Rules sections, not left as a single isolated mention, (3)
  the sensitive-field role-scoping note, added once globally rather than per-field
  since the underlying role gating already existed platform-wide, (4) ABHA display —
  confirmed intentional, no edit made. One residual open item from this pass, not
  silently assumed: Nurse role treatment under the consent-revocation rule (block vs.
  anonymized-access) — flagged in that section, not resolved.
- This is an engineering/documentation cross-check against the specific reference
  material and your direct instructions, not a legal or clinical compliance
  certification.
