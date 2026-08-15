# Part 2 (Pre-Dialysis) — Change Requirements Document
**Compliance Audit Follow-Up — Kifayti Health Compliance Bible v1.1 (DPDP/HIPAA/ABDM)**

This document lists every change required in `Part2_Screens_P2-01_to_P2-12_FINAL.md`
as a result of the compliance audit, your follow-up instructions on ABDM consent
revocation, and a second round of pre-existing open-item closures (clinical
thresholds + two role/behavior questions). It does **not** modify the original file
— it specifies exactly which screens, which section, and what text to add/change, so
the edits can be applied to the source document directly.

Ten changes total across two rounds: one net-new Cross-Screen Business Rule, two
additions to Shared Platform Conventions, pointer references added to five screens'
Business Rules sections (Round 1), and five clinical-threshold/role-behavior
resolutions (Round 2).

---

# ⚠ How to Use This Document with an AI Platform That Has Already Built Part 2

**This document's "Location" references (e.g. "Shared Platform Conventions, after
the Offline Behavior paragraph") describe the markdown *specification's* structure,
not any built codebase's structure.** An AI that already built the Part 2 screens
must map each item to its own actual files/components/tables before touching
anything — this document cannot do that mapping for it. See the placeholder
Codebase Mapping table below (fill in once, reused for every future change round)
and the prompt at the end of this document.

**Each item below is now tagged:**
- **[BEHAVIOR]** — requires an actual code/logic change in the built application.
- **[DOC-ONLY]** — this item's underlying behavior already exists in the build (per
  this document's own reasoning); the change is a specification-traceability
  addition, not new code. An AI should confirm the behavior already exists rather
  than building it a second time.

Each item also carries a **Verify** line — a quick check to confirm the change was
applied correctly, since none of these came with a formal test case in the original
screen specification.

## Codebase Mapping (fill in once — reused across all change rounds)

| Spec reference | Actual file / component / table in the build |
|---|---|
| P2-01 — Today's Patient Queue | `src/pages/dialysis/DialysisPatients.jsx` (`QueueView`) with queue logic in `src/hooks/useDialysisQueue.js` |
| P2-02 — Patient Summary | `src/pages/dialysis/PatientSummaryView.jsx` with data logic in `src/hooks/usePatientSummary.js` |
| P2-03 — Pre-Dialysis Dashboard | `src/pages/dialysis/PreDialysisDashboardView.jsx` with data/consent logic in `src/hooks/usePreDialysisDashboard.js` |
| P2-04 — Patient Verification | `src/pages/dialysis/PatientVerificationView.jsx` with form logic in `src/hooks/usePatientVerification.js` |
| P2-05 — Vitals & Measurements | `src/pages/dialysis/VitalsMeasurementsView.jsx` with form/calculation logic in `src/hooks/useVitalsMeasurements.js` |
| P2-06 — Patient Assessment | `src/pages/dialysis/PatientAssessmentView.jsx` with form/validation logic in `src/hooks/usePatientAssessment.js` |
| P2-12 — Start Dialysis Confirmation | `src/pages/dialysis/StartDialysisConfirmationView.jsx`, rendered from `src/pages/adminDashboard/components/DialysisParametersModal.jsx` |
| Shared Platform Conventions (offline cache) | `src/cache/pageCache.js` and `src/cache/usePageCache.js`; `src/cache/encryptedPageCache.js` exists but is not imported by the page-cache path, so the P2 offline cache is currently plaintext at rest |
| Shared Platform Conventions (Non-Mandatory Skip Workflow / Daily Digest) | Local skip state/modal handling in `src/hooks/useVitalsMeasurements.js`, `src/hooks/usePatientAssessment.js`, and their views; `src/ApiCalls/preDialysisApis.js::sendLogoutDigest` is only an API wrapper. No frontend daily-digest generation or zero-skip suppression module was found. |
| UF Goal Formula logic | `src/hooks/useVitalsMeasurements.js` (`calculateUFGoal`, `evaluateUfRate`) with thresholds in `src/config/vitalsThresholds.js` |
| `patient_consent` / `organizations` (if they already exist under different names) | `organizations` are fetched through `src/ApiCalls/clinicApis.js` but no local table/model exists; no `patient_consent` API, model, or table was found in this frontend, so consent storage/anonymization is a net-new backend dependency |

**If any row can't be confidently filled in, the AI should say so and ask rather
than guessing a file path or inventing an implementation approach.**

---

## 1. Shared Platform Conventions — Offline-cache encryption `[BEHAVIOR]`

**Location:** `Shared Platform Conventions`, immediately after the existing "Offline
Behavior" paragraph (which describes local draft-save on P2-04–P2-07/P2-10/P2-11).

**Change type:** ADDED (new paragraph, nothing removed)

**Text to add:**
`[PROPOSED]` **★ COMPLIANCE ADDITION — Bible §4.D/DPDP Rule 6(a) and Bible §2.18:**
locally-drafted patient/session data on every one of these offline-capable screens is
encrypted at rest on-device, using the same encryption standard already applied to
P2-12's stored PIN (not a live-server-only control) — pending engineering
confirmation of the exact mechanism (e.g. platform keystore/keychain-backed
encryption). This closes the gap where only the PIN had an explicit at-rest
encryption statement while offline patient/clinical data did not.

**Reason:** Bible §4.D/DPDP Rule 6(a) and §2.18 require encryption of personal/health
data; the document previously stated this only for P2-12's PIN, leaving offline
patient/session data on six other screens without an explicit encryption statement.

**Verify:** inspect the local storage layer used by P2-04–P2-07/P2-10/P2-11's
draft-save — confirm data at rest is encrypted, not stored in plaintext.

---

## 2. Shared Platform Conventions — Sensitive-field role scoping `[DOC-ONLY]`

**Location:** `Shared Platform Conventions`, immediately after the "Timestamps" bullet.

**Change type:** ADDED (new paragraph, nothing removed)

**Text to add:**
**★ COMPLIANCE ADDITION — Sensitive-field access scoping (Bible §5.8/HIPAA minimum-
necessary):** every screen in this document is already restricted to Technician,
Nurse, and Nephrologist roles only (no broader administrative role reaches P2-01
through P2-12). This role scoping applies to **all** clinically sensitive data
displayed on these screens — lab results (P2-02), assessment findings (P2-06),
vascular-access findings (P2-07), and HIV/Hepatitis status (P2-04, per the existing
Cross-Screen Business Rule) alike — not just the HIV/Hepatitis fields called out
individually elsewhere in this document. Stated once here rather than repeated per
field/screen.

**Reason:** Bible §5.8/HIPAA minimum-necessary. Role gating already exists platform-
wide (verified: every screen's Users section restricts to Technician/Nurse/
Nephrologist) — this is a documentation fix, not new engineering.

**Verify:** confirm the build's existing role checks already cover
Technician/Nurse/Nephrologist-only on every P2 screen. If they don't, this item
becomes `[BEHAVIOR]` — flag back rather than silently building new access control.

---

## 3. New Cross-Screen Business Rule — ABDM Consent Revocation (Organization-Scoped Access & Kifayti-Level Anonymization) `[BEHAVIOR]`

**Location:** insert as a new top-level `#` section, immediately after the existing
`# Cross-Screen Business Rule — HIV / Hepatitis Status Gate` section and before
`# Cross-Screen Calculation — UF Goal Formula`.

**Change type:** ADDED (entirely new section)

**Full text to insert:**

# Cross-Screen Business Rule — ABDM Consent Revocation: Organization-Scoped Access & Kifayti-Level Anonymization
*(Applies to every screen in this document that displays patient-identifying
information — confirmed instances: P2-01 (queue row), P2-02 (Patient Summary
banner), P2-03 (Dashboard banner), P2-04 (Verification banner), P2-12 (Start
Dialysis Confirmation banner), and P2-05 through P2-11 via the shared patient-header
pattern. This model applies at all times — before, during, or after any dialysis
session — and is not specific to the pre-dialysis stage; the identical rule is also
applied in Part 3 (During-Dialysis), with a session-in-progress deferral addition
specific to that document.)*

## Data model this rule depends on
- **`organizations`:** every organization operating on Kifayti (e.g. "NephroPlus,"
  an independent nephrologist's practice) plus one reserved record for **Kifayti
  Health itself** as the platform/data fiduciary. A facility (the existing "Main
  Center" selector in Shared Platform Conventions) belongs to one organization; an
  organization may operate multiple facilities.
- **`users.organization_id`:** every user — Technician, Nurse, or Nephrologist alike
  — belongs to exactly one organization. A user is not assumed to belong to the
  dialysis center's own organization by default; the treating nephrologist, for
  example, may belong to a different organization than the facility they're
  operating in.
- **`patient_consent` (patient_id, organization_id, status: Active/Revoked):** one
  record per patient per organization the patient has ever interacted with, **plus**
  one record for Kifayti Health itself. Revoking consent for one organization does
  not affect consent status for any other.

## Trigger and effect — two distinct cases
**Case A — Organization-level revocation (any organization other than Kifayti
Health):** The patient revokes consent for a specific organization (e.g. they leave
NephroPlus for a different provider, but stay on Kifayti). Effect: every user whose
`organization_id` matches the revoked organization loses access to this patient's
record — regardless of role (Technician, Nurse, or Nephrologist alike). Users from
any other organization with still-Active consent are **unaffected** and retain full,
un-anonymized access. No anonymization occurs in this case; data remains fully
intact for every organization that still has active consent.

**Case B — Kifayti Health-level revocation:** The patient revokes consent for
Kifayti Health itself (the data fiduciary). Effect: the full PII field set is
anonymized **irreversibly and platform-wide**, for every organization's view, since
Kifayti no longer holds a consent basis to process identifiable data at all.
Longitudinal clinical/disease data (diagnoses, session history, lab results, vitals)
is **not** included in this anonymization set and remains visible to any
organization whose own consent record is still Active — consistent with the F2
right-to-deletion scope already recorded in the Decision Log Index.

**Anonymized field set (Case B only):** Name, Date of Birth, Address (all
components except State), Photo, Phone Number, Email ID, Emergency Contact details,
ABHA number, Aadhaar number, PAN number, Below-Poverty-Line card number (or any
other government ID number), Credit Card / Debit Card information, and UPI ID.

## Access logic, applied on every screen render
For the current logged-in user, on any screen showing this patient:
1. Look up `patient_consent` for (this patient, `current_user.organization_id`).
2. If **Revoked** → block this user's access to this patient's record entirely, on
   every screen in this document, regardless of role. Show: "This patient has
   revoked consent for [organization name]. This record is no longer accessible to
   your organization."
3. If **Active** → proceed to step 4.
4. Check `patient_consent` for (this patient, Kifayti Health). If **Revoked** →
   render the patient banner/header with the anonymized field set in place of the
   real PII (clinical data displays normally). If **Active** → render normally, full
   PII shown.

## Screen-level behavior (this document's scope)
- **P2-01 (Queue):** a patient whose organization-consent is revoked for the
  *current user's* organization is removed entirely from that user's queue view.
  Users from organizations with active consent see the row normally (or anonymized,
  per Case B).
- **P2-02, P2-03, P2-04, P2-12 (patient banner screens) and P2-05–P2-11 (shared
  header):** same organization-scoped block / Kifayti-level anonymization logic
  applies uniformly; no screen-specific exceptions.

## Audit Events
`consent_revoked_org_access_blocked` (patient_id, organization_id, user_id, role,
screen_id, attempted_at), `consent_revoked_kifayti_anonymization_applied`
(patient_id, fields_anonymized[], triggered_at).

## API/DB
`[PROPOSED]` — anonymization and consent-record management are data-layer
operations owned by another module (likely Registration/Patient Master, not this
document); these screens' read APIs must resolve `current_user.organization_id`
against `patient_consent` (per-organization and per-Kifayti) on every GET that
returns patient data, gating render per the logic above. Needs engineering
confirmation of exactly where consent-record management and the anonymization job
itself run.

**Reason:** Bible §2.15/2.16 (ABDM consent lifecycle and revocation propagation),
re-modeled per your direct instruction from an initial role-based draft to an
organization-scoped model matching real-world multi-organization treatment
relationships (e.g. NephroPlus dialysis center + an independently-affiliated
nephrologist).

**Verify:** create/simulate a `patient_consent` row with status Revoked for one
organization; confirm a logged-in user from that organization is blocked on every
P2 screen while a user from a different, still-Active organization sees the record
normally. Separately, simulate a Kifayti Health-level revocation and confirm the
anonymized field set renders in place of real PII platform-wide, with clinical data
unaffected.

---

## 4. Screen-level pointer references (5 screens) `[DOC-ONLY]`

Each of the following screens needs one sentence added to its own `## Business Rules`
section, pointing to the new Cross-Screen Business Rule above. **None of these
require new code** — they only need the reference text added; the actual behavior
comes entirely from item 3. If item 3 is already correctly implemented and applies
uniformly (per its own "no screen-specific exceptions" note), these five additions
are pure documentation and an AI builder should not treat them as five separate
code changes.

### P2-01 — Today's Patient Queue
**Location:** end of `## Business Rules`, after the existing queue-ordering/manual-
override paragraph.
**Change type:** ADDED
**Text to add:**
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
above (organization-scoped model). A patient row is removed from the current user's
queue view if their organization's consent is revoked, regardless of role;
unaffected for users of any other organization with active consent. Kifayti-level
revocation shows the anonymized identifier in place of name/photo, platform-wide.

### P2-02 — Patient Summary
**Location:** end of `## Business Rules`, replacing the existing placeholder line
`[COMPLIANCE ADDITION] Bible §2.15/2.16 — add explicit consent-revoked display rule
(still open generally, see P2-04).`
**Change type:** MODIFIED
**Text to add (replacing the placeholder):**
**★ COMPLIANCE ADDITION — resolved.** Bible §2.15/2.16: see Cross-Screen Business
Rule — ABDM Consent Revocation, above (organization-scoped model). Access to this
screen is blocked for any user whose organization's consent is revoked, regardless
of role. If Kifayti-level consent is revoked, the patient banner's PII fields
(name, photo, phone, etc.) show as anonymized platform-wide, while
prescription/vitals/labs content is unaffected.

### P2-03 — Pre-Dialysis Dashboard
**Location:** end of `## Business Rules`, after the task-card status paragraph.
**Change type:** ADDED
**Text to add:**
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped model). A user whose organization's consent is revoked is
blocked from this Dashboard entirely, regardless of role; Kifayti-level revocation
shows the anonymized patient banner platform-wide, with task-card clinical content
unaffected.

### P2-04 — Patient Verification
**Location:** end of `## Business Rules`, after the paragraph citing the Indian
Journal of Nephrology's protocol-deviation principle.
**Change type:** ADDED
**Text to add:**
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped model). A user whose organization's consent is revoked is
blocked from this Verification screen entirely (identity/prescription verification
cannot proceed), regardless of role; Kifayti-level revocation shows the anonymized
patient banner platform-wide, with the verification checklist itself unaffected.

### P2-12 — Start Dialysis Confirmation
**Location:** end of `## Business Rules`, after the paragraph describing this screen's
gating dependency on P2-11.
**Change type:** ADDED
**Text to add:**
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped model). A user whose organization's consent is revoked is
blocked from starting dialysis for this patient entirely, regardless of role, until
consent is restored; this is independent of, and in addition to, the existing
PIN/lockout gating above.

---

# Addendum — Round 2 (5 additional changes)

These five items closed a separate batch of pre-existing open decisions (clinical
thresholds and two role/behavior questions) — unrelated to the ABDM consent-
revocation work above, but resolved in the same review session per your direct
answers, including two rounds of web research you requested.

## 6. P2-05 — Vitals Warning/Critical thresholds, resolved and made admin-configurable `[BEHAVIOR]`

**Location:** P2-05, `## Validation Rules`, replacing the placeholder paragraph
beginning `[PROPOSED — needs Dr. Rajapurkar's final numeric sign-off]`.

**Change type:** MODIFIED

**Text to add (replacing the placeholder):**
**★ RESOLVED THIS ROUND — literature-backed values, admin-configurable, not
awaiting Dr. Rajapurkar's sign-off per your instruction.** Critical-tier boundaries
are sourced from a hemodialysis-specific clinical trial protocol's defined abnormal
vital-sign values; Warning-tier boundaries are a proposed buffer zone (not
independently sourced) between Normal and Critical, approved by you as final:
- **Systolic BP:** Warning 90–100 or 160–180 mmHg; Critical <90 or >180 mmHg.
- **Diastolic BP:** Warning 50–55 or 100–110 mmHg; Critical <50 or >110 mmHg.
- **Pulse:** Warning 50–59 or 101–110 bpm; Critical <50 or >110 bpm.
- **Temperature:** Warning 36.3–36.5°C or 37.5–38°C; Critical <36.3°C or >38°C.
- **SpO₂:** Warning 90–94%; Critical <90%.
- **Respiration (optional field):** Warning 12–13 or 18–20 breaths/min; Critical
  <12 or >20 breaths/min.

`[PROPOSED]` **Admin-configurable, per your instruction:** every threshold above is
editable by an authorized admin role (facility-level setting, not hardcoded), with
the values above as the shipped default. Needs a small settings surface — likely
under a Thresholds/Alarm Settings panel — not yet designed as its own screen in this
document; flagging so it isn't lost, since this is a new capability, not just a
numeric change.

**Reason:** Closes the last un-sourced clinical placeholder in the document. Per
your instruction, adopted directly rather than waiting on Dr. Rajapurkar's sign-off;
web-researched and cited (hemodialysis-specific clinical trial protocol defining
abnormal vital-sign values).

**Verify:** enter a systolic BP of 85 mmHg on P2-05 and confirm Critical-tier
styling + hard block fires; enter 95 mmHg and confirm Warning-tier (amber) fires,
non-blocking. Confirm the values are read from an editable config, not a hardcoded
constant, by checking whether an admin-role setting can change them.

---

## 7. UF Goal Formula — UF-rate ceiling resolved and made admin-configurable `[BEHAVIOR]`

**Location:** Cross-Screen Calculation — UF Goal Formula, the "UF Rate validation"
bullet.

**Change type:** MODIFIED

**Text to add (replacing the prior "no single international ceiling" framing):**
**★ RESOLVED THIS ROUND, per your instruction — adopted without waiting for Dr.
Rajapurkar's sign-off.** A 2016 study of over 118,000 patients found roughly 31%
higher mortality above 13 mL/kg/hr and about 22% higher above 10 mL/kg/hr compared
to lower rates — this is also the basis for a CMS quality measure capping
ultrafiltration rate at 13 mL/kg/hr. **Final two-tier model: Warning at ≥10
mL/kg/hr, Critical (hard block) at ≥13 mL/kg/hr.** `[PROPOSED]` **Admin-configurable**
per your instruction, same as the P2-05 vitals thresholds — 13/10 mL/kg/hr are the
shipped defaults, not hardcoded constants.

**Reason:** Same as item 6 — literature/CMS-backed, adopted directly per your
instruction, made admin-configurable.

**Verify:** construct a prescription where the calculated UF rate lands at exactly
13 mL/kg/hr and confirm hard block; at 11 mL/kg/hr confirm Warning; at 9 mL/kg/hr
confirm no flag. Confirm the ceiling is admin-editable, not hardcoded.

---

## 8. P2-02 — "Edit Info" role-gating resolved `[BEHAVIOR — likely small]`

**Location:** P2-02, `## Users`, replacing the `[OPEN — residual]` sentence about
Edit Info.

**Change type:** MODIFIED

**Text to add:**
**★ RESOLVED THIS ROUND:** "Edit Info" is also **open to all three roles**
(Technician, Nurse, Nephrologist) — same as View Full Profile, not restricted like
Proceed.

**Reason:** Closes the one button whose role-gating your original answer didn't
cover (Proceed and View Full Profile were both already confirmed).

**Verify:** log in as a Nurse and a Nephrologist separately, confirm "Edit Info" is
clickable/enabled for both on P2-02, same as it already is for Technician.

---

## 9. P2-06 — Real-time nephrologist alert on Critical symptom `[BEHAVIOR]`

**Location:** P2-06, `## Clinical Rules`, appended after the existing
mandatory-comment rule.

**Change type:** MODIFIED

**Text to add:**
**★ RESOLVED THIS ROUND:** answering "Yes" to a Critical symptom also triggers a
**real-time alert to the nephrologist**, in addition to the existing mandatory
comment requirement — a documented Critical finding is not just logged, it's
actively pushed, distinct from the daily digest mechanism (which covers skips, not
same-session acute findings).

**Reason:** Closes the residual escalation question — your answer confirmed the
skip-workflow only, not whether a filled-in "Yes" to a Critical symptom should also
notify in real time. You confirmed yes.

**Verify:** answer "Yes" to Chest Pain on P2-06, provide the required comment, and
confirm the nephrologist assigned to this patient receives a real-time alert
(not just the mandatory comment being saved).

---

## 10. Daily Staff Digest — zero-skip-day behavior confirmed `[BEHAVIOR — likely small]`

**Location:** Non-Mandatory Field Skip Workflow (Shared Platform Conventions), the
`[OPEN — confirm]` bullet about a fully clean day.

**Change type:** MODIFIED

**Text to add:**
**★ CONFIRMED THIS ROUND:** a zero-skip (fully clean) day suppresses the digest
entirely — no message sent, no positive "0 skips today" confirmation. Your
assumption was correct.

**Reason:** Closes the last open Skip Workflow question; no behavior change from the
original assumed default, just removes the open-question framing.

**Verify:** simulate a technician's shift with zero skips logged; confirm no digest
message is generated or sent at end of day.

---



## Summary table

| # | Location | Change type | Screens affected |
|---|---|---|---|
| 1 | Shared Platform Conventions | ADDED | Platform-wide (affects P2-04–P2-07, P2-10, P2-11 offline behavior) |
| 2 | Shared Platform Conventions | ADDED | Platform-wide |
| 3 | New Cross-Screen Business Rule | ADDED | P2-01–P2-12 (all screens with patient PII) |
| 4a | P2-01 Business Rules | ADDED | P2-01 |
| 4b | P2-02 Business Rules | MODIFIED (replaces placeholder) | P2-02 |
| 4c | P2-03 Business Rules | ADDED | P2-03 |
| 4d | P2-04 Business Rules | ADDED | P2-04 |
| 4e | P2-12 Business Rules | ADDED | P2-12 |
| 6 | P2-05 Validation Rules | MODIFIED (replaces placeholder) | P2-05 |
| 7 | UF Goal Formula (Cross-Screen Calculation) | MODIFIED | P2-05, P2-04 (prescription display) |
| 8 | P2-02 Users | MODIFIED | P2-02 |
| 9 | P2-06 Clinical Rules | MODIFIED | P2-06 |
| 10 | Shared Platform Conventions (Skip Workflow) | MODIFIED | Platform-wide |

**Not requiring changes:** P2-05, P2-06, P2-07, P2-08, P2-09, P2-10, P2-11 — these
inherit the Cross-Screen Business Rule automatically via the shared patient-header
pattern (per item 3's scope note) and don't need their own pointer sentence, since
none of them has an existing screen-specific `## Business Rules` discussion of patient
identity/PII the way P2-01–P2-04 and P2-12 do.

**Outstanding item (engineering, not product/policy):** exactly where consent-record
management and the anonymization job run (which backend service, real-time vs.
scheduled) — flagged in item 3's API/DB note, not resolved here since it isn't a
product decision.

**New outstanding item from Round 2:** the admin-configurable Thresholds/Alarm
Settings panel (items 6, 7) is a new capability this document flags but doesn't
design as its own screen — it needs a UI home, not yet specified.

---

# Idempotency Guard

Before applying any item in this document, check whether it may already be
partially or fully present in the build — from a prior run of this same document,
an earlier manual implementation, or overlap with other work. If a change appears
already applied, confirm rather than re-applying it (duplicate encryption wrappers,
duplicate consent-check middleware, or duplicate digest-suppression logic are worse
than a missed change, since they can silently break existing behavior).

---

# Prompt for the AI Platform

*(Paste this before the document content when handing it to an AI that has already
built the Part 2 screens.)*

```
You previously built the Part 2 (Pre-Dialysis) screens for Kifayti Health from a
markdown specification. I'm giving you a Change Requirements Document listing 10
required changes to that specification.

Before making any change to the actual codebase:
1. First fill in the Codebase Mapping table near the top of the document — for
   each row, state the actual file/component/table in YOUR build that corresponds
   to it. If you cannot confidently identify one, say so and ask me rather than
   guessing.
2. Each item is tagged [BEHAVIOR] (requires a real code/logic change) or
   [DOC-ONLY] (the behavior should already exist — confirm it does rather than
   building it again). Respect this distinction; don't write new code for a
   [DOC-ONLY] item without first confirming the existing behavior is actually
   missing.
3. Before applying each item, check the Idempotency Guard section — this change
   (or something equivalent) may already be partially present. Confirm before
   re-applying.
4. Apply changes one item at a time, in the order given, and summarize what you
   changed after each one — don't batch all 10 silently.
5. After applying each item, run (or describe) the check listed under "Verify"
   for that item, and report the result.
6. Do not treat any `[PROPOSED]` tag anywhere in this document as a finalized
   decision — flag it back to me instead of implementing it as final.
7. If an item's "Location" reference doesn't map cleanly onto anything in your
   build (the structure may have diverged since you first built these screens),
   stop and ask rather than inventing a plausible-sounding place to put it.
```
