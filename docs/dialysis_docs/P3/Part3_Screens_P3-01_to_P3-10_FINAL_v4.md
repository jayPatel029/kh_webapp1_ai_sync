# Part 3 Screen Specifications — P3-01 to P3-10
### Kifayti Health — Dialysis Center Management System (KidneyCare Dialysis Center)
### During-Dialysis Stage — FINAL, Build-Ready Edition

Cross-checked against the Kifayti Health Compliance Bible v1.1, the Revised
Hemodialysis Technician Safety Protocol (§2 "During Dialysis" and §4 "Critical Missing
Protocols"), Module 2 Part 1 (Technician Workflow Overview), and eleven colored Figma
exports (P3-01, P3-02, two versions of P3-03, P3-04 through P3-10). Every field on every
screen was cross-checked against the completed Part 2 (Pre-Dialysis) document so nothing
already captured there gets re-asked here.

**Scope discipline:** this document covers the **during-dialysis stage only**
(P3-01–P3-10). Post-dialysis (discharge, machine cleaning/turnover, post-dialysis labs)
is out of scope and will be addressed in Part 4.

---

# ⚠ Instructions for AI-Assisted Build

**If this document is handed to an AI platform/agent to generate the actual screens
or code, the following instruction must be followed and is non-negotiable:**

Every tag in this document — `[PROPOSED]`, `[GAP IDENTIFIED]`, `[OPEN]`,
`[OPEN — confirm]`, `[DESIGN SPECIFICATION]`, and any variant of these — marks
content that is a **recommendation awaiting human confirmation, not a finalized
specification.** An AI builder must treat every one of these as a **flag for human
review** and must not silently build, render, or generate code from that content as
if it were settled. Concretely:
- Do **not** proceed to implement a `[PROPOSED]` or `[GAP IDENTIFIED]` item as final
  without first surfacing it to the human reviewer for explicit confirmation.
- Do **not** invent, average, or "best-guess" a numeric value, field, rule, or
  behavior to fill a gap this document has deliberately left open — that defeats the
  purpose of the tag.
- Where a choice must be made to keep moving (e.g., a placeholder is unavoidable),
  the AI must clearly label its own output as a placeholder too, and must not
  present it back to the human as if it came from this specification.
- Content tagged `[FIGMA-DERIVED]` or `[SAFETY-PROTOCOL-DERIVED]` (i.e., traced to an
  actual source) may be treated as confirmed and built as specified.

This applies to every screen in this document without exception.

---

# Key Design Decisions (your instruction: best logical call, grounded in the project files)

## Decision 1 — P3-03 "Machine Parameters": Version 2 is authoritative
Two incompatible Figma designs exist for this screen. **Version 2 (the tabbed
Overview/Pressures/Flows/Dialysate/Ultrafiltration/Advanced Parameters design) is
authoritative; Version 1 (the flat single-page card grid) is discarded.** Reasoning,
grounded in the Safety Protocol rather than a visual preference:

- Safety Protocol §2.A "Checklist (Inspection/Review)" during dialysis requires ongoing
  confirmation of **Circuit Integrity, Equipment Safety, and Active Controls** — the
  last of which explicitly names **air detector, venous clamp, and blood leak detector**
  as items that must be confirmed operational, not just "no active alarms" in general.
  Version 2's right-rail **Machine Status panel** (Power Supply, Dialysate System,
  Heparin System, Air Detector, Blood Leak Detector — each individually OK-checked)
  directly implements this checklist item by item. Version 1 only shows a single
  rolled-up "No Active Alarms" banner, which cannot answer "is the air detector itself
  confirmed operational" as a discrete, auditable fact — a real safety-protocol gap,
  not just a design preference.
- Safety Protocol §2.B "Parameters to Measure & Record" lists 9 distinct machine
  metrics (BFR, DFR, AP, VP, TMP, Conductivity, Dialysate Temperature, UFR, UF Removed)
  plus Heparin Infusion Rate — 10 total. Version 2's tabbed structure has room to
  organize all of these without crowding (and does: Pressures/Flows/Dialysate/
  Ultrafiltration/Advanced Parameters tabs each own a coherent subset). Version 1
  crams a similar count onto one flat page, which works visually but has no natural
  place for the Heparin Pump/Blood Leak Detector status items Version 2 surfaces.
- Version 2's safe-range visualization (colored gauge bars showing where the current
  reading sits within its safe band) gives the technician an at-a-glance severity read
  that Version 1's plain numeric cards don't — directly useful for the shared
  checklist-failure-state pattern this document reuses from Part 2.

**Net effect:** Version 2 is chosen because it's the more complete implementation of an
existing safety-protocol requirement, not an aesthetic pick. Version 1's simpler
numeric-card layout is not lost information — everything in it is a subset of Version
2 — so nothing is being sacrificed by this choice.

## Decision 2 — During-Dialysis navigation: a non-linear hub, not a gated stepper
The eleven images show at least three different, mutually inconsistent step-bar
sequences (some 9 steps, some 10; some include "Symptoms & Complications," some omit it
entirely; step numbers that don't match their position; a garbled label in one export).
Rather than picking one inconsistent bar as "correct," the underlying design intent
needs to be named and fixed:

**Pre-Dialysis (Part 2) is a true linear gate** — each step must complete before the
next unlocks, ending in a one-time Start Dialysis action. **During-Dialysis is
fundamentally not that kind of flow.** Per Safety Protocol §2.B, vitals and machine
parameters are recorded **every 30–60 minutes for the whole session** — the technician
returns to the same screens repeatedly for 3–4+ hours, not once each in sequence.
Symptoms, alarms, and incidents can occur at any point, in any order, or not at all. A
"step 4 of 10, must complete before step 5" gate — the Pre-Dialysis pattern the Figma
exports were apparently copied from — doesn't fit this shape of work, and building it
that way would actually make the screens harder to use correctly, not safer.

**Decision:** During-Dialysis uses **P3-01 (Treatment Dashboard) as a non-linear hub**
— matching its own Figma design exactly (Quick Actions tiles: Add Vitals, Add
Symptoms, Alarm Management, Medication Administration, Treatment Progress — no step
bar at all, confirmed in image 1). The other nine screens are reached from this hub (or
from each other via the shared left-rail During Dialysis nav) and **carry a simple
"you are here" indicator among the 9 screens, not a completion gate** — visiting order
is free, and every screen except Treatment Completion (P3-10) can be revisited any
number of times during the session. The 9-screen indicator sequence, matching the P3
file numbering exactly: Live Vitals Monitoring → Machine Parameters → Patient Symptoms
& Complications → Vascular Access Monitoring → Medication Administration → Alarm
Management → Treatment Progress → Incident & Event Reporting → Treatment Completion.
The confusing carried-over "Patient Verification / Vitals & Measurements / Patient
Assessment" labels seen checked-off at the start of several exports' step bars are
dropped entirely — those already happened once, in Pre-Dialysis, and don't need a
second gate here.

**Practical consequence for every screen below:** "Save & Continue" is relabeled
**"Save & Return to Dashboard"** or simply **"Save"** depending on context (a repeatable
entry screen like Vitals doesn't need a "Continue" destination at all — it needs a fast
way to log an entry and get back to monitoring), except P3-10 (Treatment Completion),
which remains a genuine one-time terminal gate, ending the During-Dialysis stage.

---

# Redundancy check against Part 2 (Pre-Dialysis)

Every field below was checked against the completed P2-01–P2-12 document. **Nothing
already captured in Pre-Dialysis is re-entered here** — it is displayed read-only,
carried forward by session_id. Specifically, these fields are **read-only references on
every During-Dialysis screen's patient banner**, sourced from Part 2, never re-asked:
Patient identity (name, PID, age, blood group), Access Type and Access Details
(location, date created, surgeon/center — from P2-07), Nephrologist name, Prescription
(Dialyzer, prescribed BFR/DFR, prescribed duration, prescribed UF Goal, Heparin
dose/regimen — from P2-04/P2-05), Target/Dry Weight, and HIV/Hepatitis status (from
P2-04). Where a During-Dialysis screen shows one of these values again (e.g., "Access
Type: AV Fistula (Left)" on P3-05), it is explicitly tagged **[READ-ONLY, CARRIED
FROM PART 2]** below, not a new input.

What genuinely is new, time-series data unique to this stage: repeated vitals readings
(P3-02), repeated machine parameter readings (P3-03), intradialytic symptoms as they
occur (P3-04), ongoing vascular access surveillance — a **different** Yes/No item set
than Pre-Dialysis's one-time initial assessment, since it's now watching for
*complications during use* rather than *suitability before use* (P3-05), medications
actually administered during treatment (P3-06), alarms as they occur (P3-07), a
calculated rollup of progress against the Part-2-set targets (P3-08), incidents (P3-09),
and end-of-session discharge data (P3-10).

---

# Shared Platform Conventions (Part 3-specific additions)

Everything in Part 2's Shared Platform Conventions still applies (shell navigation,
accessibility, audit logging/retention, timestamps). Additions specific to
During-Dialysis:

**★ COMPLIANCE ADDITION — carried forward from Part 2's compliance-audit round, not
previously restated here.** The following three items, resolved in Part 2's Shared
Platform Conventions, apply identically to every During-Dialysis screen and are named
explicitly here so they aren't left ambiguous:
- **Offline-cache encryption (Bible §4.D/DPDP Rule 6(a), §2.18):** locally-drafted
  patient/session data on every P3 screen using local draft-save (P3-02, P3-04, P3-05,
  P3-06, P3-07, P3-09, P3-10) is encrypted at rest on-device, same standard as Part 2's
  P2-12 PIN and P2-04–P2-07/P2-10/P2-11 offline cache. `[PROPOSED]` pending engineering
  confirmation.
- **Sensitive-field role scoping (Bible §5.8/HIPAA minimum-necessary):** every P3
  screen is already restricted to Dialysis Technician/Nurse/Nephrologist per its own
  Users section — this applies to all clinically sensitive data on these screens
  (symptoms/complications on P3-04, medication administration on P3-06, incident
  reports on P3-09, and the carried-forward HIV/Hepatitis status in the patient banner)
  exactly as it does in Part 2. No new engineering — the gating already exists.
- **ABDM consent-revocation, organization-scoped access & Kifayti-level anonymization
  (Bible §2.15/2.16):** see the Cross-Screen Business Rule below — every P3 screen's
  patient banner carries the same PII (name, photo, PID, HIV/Hepatitis status) that
  rule governs, including this stage's own deferral behavior for an in-progress
  session.

**Session Timer** `[FIGMA-DERIVED]` — a persistent header element on every P3 screen
("Session Time: 01:32 Elapsed") plus a persistent **End Treatment** button, both visible
regardless of which of the 9 screens the technician is on — confirmed present on P3-01
and P3-02's top bar, and should be treated as shell-level (present on all P3 screens),
not screen-specific.

**Monitoring interval** `[SAFETY-PROTOCOL-DERIVED]` — Safety Protocol §2.B: vitals and
machine parameters recorded **every 30–60 minutes** (P3-02's Figma shows "Every 30 min"
as the facility's chosen interval within that range). The system should prompt/remind
the technician when a reading is due — P3-02 already shows "Next Due: 10:30 AM (Every
30 min)" confirming this is a designed behavior, not proposed.

**Checklist failure-state pattern (from Part 2)** carries forward to any During-Dialysis
screen with a pass/fail item — same red-row/red-banner/named-item mechanics, not
repeated per screen.

**"Never silence alarms" mandate** `[SAFETY-PROTOCOL-DERIVED]` — Safety Protocol §2.C:
alarms must never be dismissed without identifying and correcting the underlying cause.
This is a hard product rule for P3-07: there is no "dismiss" action anywhere in this
document that doesn't require an Action Taken + Resolution Status to be recorded first.

**Non-Mandatory Field Skip Workflow & Daily Staff Digest** `[carried forward from Part
2, per your confirmation this applies to Parts 3–5]` — every checklist/assessment field
across P3-02 through P3-07 is now Critical (Mandatory, hard-block, no override) or
Non-Critical (Non-Mandatory, skippable-with-reason). See each screen's own Mandatory
Fields section below for the specific split; the full skip-popup/backend-log/daily-
digest mechanism itself is specified once, in Part 2's Shared Platform Conventions, and
not repeated here.

---

# Cross-Screen Business Rule — Overdue Vitals Escalation
*(New this round, per your explicit specification. Applies to P3-02's recording
cadence; appears at the shell level, not scoped to a single patient's screen, since
one technician monitors multiple patients' due times simultaneously.)*

## Why this is shell-level, not per-screen
A technician may be on Patient A's P3-02 screen while Patient B's and Patient C's
vitals also come due. The popup this rule describes must be able to interrupt the
technician regardless of which During-Dialysis screen they're currently on, and must
be able to show more than one patient's overdue reading in the same popup. This is
the same "consolidate across sessions, notify once" shape as the Non-Mandatory Field
Skip Workflow's daily digest, just at a much shorter timescale (minutes, not a full
day) and with a live popup rather than a batched end-of-day message.

## State machine, per due reading
1. **Scheduled** — Next Due time is in the future. Normal state.
2. **Overdue (temporary)** — Next Due time has passed, nothing recorded yet, less than
   20 minutes have elapsed since the due time. Compliance % recalculates live to
   reflect this as a tentative miss, but **nothing is yet written permanently** — this
   is a cached/pending state, reversible. The popup (below) shows this reading as a
   line item the moment this state is entered — no additional grace period beyond the
   due time itself.
3. **Resolved-Late** — the technician actually records the vitals reading (even if
   late) before either a Skip or the 20-minute mark. This is **not** treated as a
   miss: Compliance % recalculates normally as a late-but-recorded entry, no permanent
   drop, no nephrologist alert, and the popup line item for this reading disappears
   (resolved by the recording itself, not by a Skip action).
4. **Skipped (permanent)** — the technician clicks Skip (this item only) or Skip All
   (every item currently in the popup) before recording a reading. Each Skip offers an
   **optional Reason** (0/200 chars, added per your follow-up instruction, consistent
   with the general Non-Mandatory Field Skip Workflow's pattern) — the technician may
   enter one or leave it blank. Either way, this **permanently** commits the
   compliance % drop to the database — no longer reversible — and sends an Alert to
   that patient's assigned/treating nephrologist, tagged as a technician-acknowledged
   skip, with the reason (or "No reason provided") included in the alert content.
5. **Missed-Auto (permanent)** — 20 minutes elapse since the due time with no reading
   recorded and no Skip clicked. The system automatically transitions this reading to
   Missed: same permanent compliance % drop, same nephrologist Alert, but tagged as
   auto-escalated (no technician response) rather than an acknowledged skip — these
   are clinically different situations (a technician who consciously skips a reading
   vs. one who never responded at all, which may itself indicate the technician is
   occupied with something urgent elsewhere) and the nephrologist should be able to
   tell them apart at a glance.

## Popup design
`[DESIGN SPECIFICATION]`
```
"Overdue Vitals" (modal, appears the instant any reading enters state 2 above; stays
  open/reappears as long as at least one item is unresolved)
Table: Patient | Bed | Due Time | Minutes Overdue | [Skip]
  Rajesh Kumar | B-04 | 10:30 AM | 6 min           | [Skip]
  Fatima Sheikh| B-07 | 10:30 AM | 6 min           | [Skip]
  (clicking a row, not the Skip button, navigates to that patient's P3-02 to record
   the actual reading — the row disappears from this popup once recorded)
Footer: [Skip All]   [Dismiss — reopens automatically if items remain unresolved]

On clicking a row's [Skip]:
  Small inline confirm: "Skip [Patient Name]'s 10:30 AM reading?"
    Reason (optional)[textarea, 0/200]   [Cancel]  [Confirm Skip]

On clicking [Skip All]:
  Confirm dialog: "Skip all N overdue readings?"
    Reason (optional, applies to all N)[textarea, 0/200]   [Cancel]  [Confirm Skip All]
  `[DESIGN DECISION, not separately specified]` Skip All uses one shared reason field
  for the whole batch rather than prompting per patient — requiring a reason per item
  during a bulk action would work against the point of a bulk action. Flag if you'd
  rather each item keep its own reason even inside Skip All.
```
Each row's Skip button, and the header Skip All button, trigger state 4 above for the
row(s) affected. Rows resolved by actually recording a reading (state 3) simply
disappear from the table without needing a Skip click.

## Backend logging
`[PROPOSED]` **New** `overdue_vitals_log` (log_id, session_id, patient_id,
technician_user_id, due_time, resolution: Recorded-Late / Skipped / Missed-Auto,
**reason [nullable — populated only when resolution = Skipped; always null for
Missed-Auto, since there was no technician action to attach a reason to]**,
resolved_at, minutes_overdue_at_resolution). One row per due-time event that entered
state 2, regardless of how it resolved — this gives a complete audit trail of every
missed-interval event, not just the ones that became permanent misses.

## Nephrologist alert
`[PROPOSED]` Fired individually, per reading, at the moment state 4 or state 5 is
reached — not batched like the end-of-day staff digest, since a missed vital is more
time-sensitive than a skipped non-critical checklist field. Alert content: patient
name, session, due time, minutes overdue at resolution, the trigger tag
(Technician Skip / Auto-Escalated — No Response), and **the Reason if one was
provided on a Skip ("No reason provided" if left blank; not applicable for
Auto-Escalated)**. Recipient is the patient's assigned/treating nephrologist — read
from the existing patient/care-team assignment, not something this rule defines.

## Audit Events
`vitals_overdue_entered` (session_id, due_time), `vitals_overdue_popup_shown`,
`vitals_skip_clicked` (single or as part of Skip All, **reason_provided: bool**),
`vitals_resolved_late`, `vitals_missed_auto_escalated`, `nephrologist_alert_sent`
(reading which of the two tags fired).

---

# Cross-Screen Business Rule — Mandatory Adverse Event Auto-Incident Trigger

`[SAFETY-PROTOCOL-DERIVED — new cross-screen rule this pass]` Safety Protocol §4
"Mandatory Adverse Event Documentation" names five event categories that **must
trigger an automated incident report**, not rely on the technician remembering to
separately open P3-09 and re-type what they just recorded elsewhere:

| Triggering event | Recorded on | Auto-creates incident on P3-09 |
|---|---|---|
| Severe Intradialytic Hypotension or Syncope | P3-04 (Symptoms), Severity = Severe and Symptom = Hypotension/Syncope-related | Yes |
| Patient fall inside the treatment unit | P3-04, "Other" symptom category tagged as a fall, or a dedicated Incident-only path if no fall option exists on P3-04 | Yes |
| Vascular access needle infiltration or unplanned blood loss | P3-05, Infiltration/Extravasation = Yes(Mild/Severe), or Bleeding = Excessive | Yes |
| Medication errors | P3-06, "Any Adverse Reaction" = Yes, or a wrong-dose/wrong-route correction | Yes |
| Technical machine malfunctions | P3-07, an alarm's Resolution Status ≠ Resolved, or Patient Impact ≠ "No adverse effect" | Yes |

**Behavior:** when one of the trigger conditions above is saved on its source screen, a
draft incident record is created on P3-09 automatically — pre-populated with event
time, type, and the technician's already-entered description/intervention. **UI
treatment on the source screen, confirmed this round:** a toast notification appears
immediately after save — *"Incident logged — [Incident Type], [time]. [View Incident →]"*
— with a direct link that navigates to the newly-created draft on P3-09. The toast is
non-blocking (Save & Continue/Save & Exit remain available without dismissing it
first) but persists longer than a typical confirmation toast (recommend ~8 seconds or
until manually dismissed, not the standard ~3 seconds), since missing it would mean
the technician doesn't realize an incident now needs their review on P3-09. The
technician is not force-routed to P3-09 immediately — they can continue their current
workflow and follow the link when convenient, but the draft incident and its pending
fields (Escalation, Outcome, Follow-up) remain visible on P3-09 and P3-01's Active
Alerts until completed. This directly implements the Safety Protocol's "must trigger an automated
incident report" language, and avoids exactly the kind of redundant re-entry your
instruction asked me to eliminate.

---

# Cross-Screen Business Rule — ABDM Consent Revocation: Organization-Scoped Access & Kifayti-Level Anonymization
*(Re-modeled this round from role-based to organization-scoped, identical to Part 2's
rewritten version of this rule — see that document for the full data-model
explanation. This section states the During-Dialysis-specific addition: how an
in-progress session is handled.)*

## Data model and access logic
Identical to Part 2: `organizations` (including a reserved Kifayti Health record),
`users.organization_id`, and `patient_consent` (patient_id, organization_id, status)
records — one per organization the patient has interacted with, plus one for Kifayti
Health. On every screen, a user is blocked from a patient's record if their own
organization's consent is revoked, regardless of role (Technician, Nurse, or
Nephrologist alike); a Kifayti Health-level revocation triggers the same anonymized
field set as Part 2 (Name, DOB, Address except State, Photo, Phone, Email, Emergency
Contact, ABHA, Aadhaar, PAN, BPL/government ID, Credit/Debit Card, UPI ID),
platform-wide, with clinical/treatment data unaffected.

## ★ During-Dialysis-specific addition: mid-session deferral
Per your direct instruction: **in India, an in-progress dialysis session is not
interrupted by a consent revocation.** This document therefore treats an active
treatment session as a deferral window:
- If a patient's session is **currently in progress** when their organization's
  consent is revoked, all users already treating that patient — regardless of
  organization — retain full access **until the session reaches Treatment Completion
  (P3-10)**. This is a deliberate, safety-motivated exception to the otherwise
  immediate access-block rule, not an oversight.
- The moment the session completes (P3-10's stage-transition gate fires), the
  organization-scoped access block takes effect: any user from the revoked
  organization loses access to this patient's record going forward, starting with the
  Post-Dialysis stage (Part 4) and any later interaction.
- A Kifayti Health-level revocation's anonymization, if triggered mid-session, follows
  the same deferral: the anonymization visually/functionally applies once the session
  completes, not while treatment is actively in progress, for the same patient-safety
  reason (a technician should not lose the ability to identify the patient they are
  actively treating).
- This deferral applies **only** to a session already in progress at the moment of
  revocation. A new session cannot be started for a patient whose current
  organization-consent is already revoked (see P3-10/P2-12's existing gating) — the
  deferral is about not interrupting care already underway, not about allowing new
  sessions to bypass the block.

## Screen-level behavior (this document's scope)
Applies uniformly to P3-01 through P3-10's shared patient banner. No screen blocks or
anonymizes mid-session per the deferral above; P3-10 (Treatment Completion) is where
the block/anonymization logic actually takes effect once the session ends, handing off
a "consent-revoked" flag state to whatever screen the patient's record is next opened
in (Part 4 onward).

## Audit Events
`consent_revoked_org_access_deferred` (patient_id, organization_id, session_id,
deferred_until_session_complete: true, triggered_at) — logged at the moment of
revocation if a session is in progress; `consent_revoked_org_access_blocked` and
`consent_revoked_kifayti_anonymization_applied` (same names as Part 2) — logged at the
moment the deferred block/anonymization actually takes effect, i.e. at session
completion.

## API/DB
`[PROPOSED]` — same `patient_consent`/organization model as Part 2. Additionally needs
a `sessions.consent_revocation_pending` (boolean) or equivalent flag, set at the moment
of revocation if `sessions.status = In Progress`, checked and resolved at P3-10's
completion transition. Needs engineering confirmation of exactly where this deferred-
enforcement job runs.

## Still open
None from this rule — both prior open items (Nurse role treatment, mid-session
handling) are resolved by the organization-scoped model and the deferral rule above.

---

# P3-01 — Treatment Dashboard

## Screen Objective
`[FIGMA-DERIVED]` "Real-time overview of patient status and treatment progress"
(screen's own subtitle). Non-linear hub for the During-Dialysis stage — see Decision 2.

## Clinical Rationale
Gives the technician a single glanceable view of everything that matters right now
(elapsed/remaining time, UF progress, machine status, active alerts) without navigating
into a specific sub-screen, so monitoring can happen at a glance during the 3–4 hour
session rather than requiring active navigation every time.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P2-12 (Start Dialysis) at session start, and from the left-rail "During
Dialysis" nav item at any time thereafter. Quick Actions tiles link directly to
P3-02 (Add Vitals), P3-04 (Add Symptoms), P3-07 (Alarm Management), P3-06 (Medication
Administration), P3-08 (Treatment Progress) — confirmed five tiles in the Figma, not all
nine sub-screens are one tap away from here (Vascular Access Monitoring, Incident
Reporting, and Treatment Completion are reached via the left rail or from within another
screen, not a dashboard tile).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-01 – Treatment Dashboard"  subtitle: "Real-time overview of patient status
                                       and treatment progress."
                          [Main Center▾] [🔔5] [Session Time 01:32 Elapsed] [End Treatment]
Patient banner: [photo] Ramesh Kumar [Active] | PID:P10023,58y,Male,BloodGroup:O+
  Date:26May2025(Mon) | Shift:Morning(07:00AM) | Bed:B-02
  Access Type:AVFistula(Left) | Nephrologist:Dr.NehaSharma | Prescription:StandardHD
  Target Weight:68.0kg | Dry Weight:67.0kg
Row1: [Treatment Progress card: 66% Completed ring, Elapsed01:32,Remaining00:48,
       TotalPrescribed04:00, StartedAt06:45AM,ExpectedEnd10:45AM]
      [UF Progress card: 1.60L Removed ring, TargetUF2.40L,RemainingUF0.80L,UFRate500mL/hr]
      [Machine Status card: Running badge, Machine FreseniusModel,Dialyzer,BFR,DFR,
       "No Active Alarms" banner]
      [Active Alerts(2) card: High TMP(10:12AM,Medium), UF Behind Target(10:15AM,Low)]
Row2: [Latest Vitals card: BP,Pulse,RespRate,Temp,SpO2,PainScore, "View All Vitals→"]
      [Key Machine Parameters card: AP,VP,TMP,DialysateConductivity,DialysateTemp,
       "View All Parameters→"]
      [Blood Flow card: 300mL/min gauge, "Prescribed:300mL/min"]
      [Quick Actions: AddVitals,AddSymptoms,AlarmManagement,MedicationAdministration,
       TreatmentProgress]
Footer info bar: "Keep monitoring patient closely. Review alerts and take appropriate
                  actions as needed."
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar (facility selector, bell, Session Timer, End Treatment) →
Patient Banner (identity + read-only Part-2 carried fields) → 4-card row (Treatment
Progress ring, UF Progress ring, Machine Status, Active Alerts) → 3-card row (Latest
Vitals, Key Machine Parameters, Blood Flow gauge) → Quick Actions panel (5 tiles) →
Footer guidance banner.

## Layout Grid
12-column responsive; two stacked rows of cards above a Quick Actions panel; Active
Alerts card spans the right column across both rows in the actual export.

## Field Definitions
`[FIGMA-DERIVED]` **Treatment Progress:** % Completed (ring), Elapsed Time, Remaining
Time, Total Prescribed Time, Started At, Expected End. **UF Progress:** Removed (ring,
L), Target UF, Remaining UF, UF Rate. **Machine Status:** Running/Stopped badge,
Machine model, Dialyzer, Blood Flow Rate, Dialysate Flow Rate, alarm summary banner.
**Active Alerts:** alert name, time, severity badge (per-alert). **Latest Vitals:** BP,
Pulse, Resp Rate, Temp, SpO2, Pain Score, each with a trend arrow. **Key Machine
Parameters:** Arterial Pressure, Venous Pressure, TMP, Dialysate Conductivity,
Dialysate Temperature, each with a trend arrow. **Blood Flow:** live value (mL/min)
against a 0–600 gauge, Prescribed reference value.

**[READ-ONLY, CARRIED FROM PART 2]** Access Type, Nephrologist, Prescription name,
Target Weight, Dry Weight — all sourced from P2-04/P2-05/P2-07, not re-entered.

## Input Types
Entirely read-only display + 5 Quick Action tap targets. No direct data entry on this
screen — it aggregates.

## Mandatory Fields
N/A — aggregation/display screen.

## Validation Rules
N/A on this screen directly; End Treatment button routes to P3-10 (Treatment
Completion), which carries the actual validation gate.

## Business Rules
Treatment Progress %, UF Progress, and Expected End are calculated fields (see
Auto-calculations) — not independently entered anywhere.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped). A user whose organization's consent is
revoked is blocked from this Dashboard, regardless of role; Kifayti-level revocation
shows the anonymized patient banner, with treatment-progress data unaffected.
Mid-session, access continues uninterrupted until Treatment Completion (P3-10), per
that rule's deferral clause.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` The footer guidance banner ("Keep monitoring patient
closely...") reflects the ongoing-surveillance nature of this stage per Safety Protocol
§2.A "Surveillance: Patient and access site remain clearly visible at all times."

## Auto-calculations
Treatment Progress % = Elapsed Time ÷ Total Prescribed Time (from P2-04's prescribed
duration) × 100. Remaining Time = Total Prescribed Time − Elapsed Time. UF Progress =
cumulative UF Removed (summed from P3-03 machine readings) against the Target UF
(carried from P2-05's UF Goal, per the Cross-Screen Calculation in Part 2). Expected
End = Started At + Total Prescribed Time.

## Decision Trees
Quick Action tapped → opens the corresponding sub-screen. End Treatment tapped →
routes to P3-10, which independently gates whether the session can actually complete
(see P3-10 below) — tapping End Treatment here does not itself end the session.

## API Requests
`[PROPOSED]` `GET /sessions/{id}/dashboard` — aggregate read combining the latest
vitals, latest machine parameters, active alerts, and progress calculations. Needs
engineering confirmation, likely backed by a polling interval or a push/websocket
update given the "real-time" framing in the screen's own subtitle.

## API Responses
`[PROPOSED]` Nested object: progress {elapsed, remaining, total, percent}, uf {removed,
target, remaining, rate}, machine_status {running, model, dialyzer, bfr, dfr, alarms},
latest_vitals {...}, latest_machine_params {...}, active_alerts [...].

## Database Mapping
`[PROPOSED]` No new table — this screen is a read-only rollup across `session`,
`vitals_intradialytic` (P3-02), `machine_parameters_intradialytic` (P3-03), and `alarm_log`
(P3-07).

## Audit Events
`treatment_dashboard_viewed`, `quick_action_clicked` (with target screen),
`end_treatment_clicked`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Live-data fetch failure → cards show a stale-data indicator with last-known values and
a manual refresh option, rather than blocking the screen entirely (this is a monitoring
hub, it should degrade gracefully, not go blank).

## Empty States
`[FIGMA-DERIVED]` "No Active Alarms — All parameters are within safe limits." confirmed
empty-state pattern for the Machine Status card.

## Loading States
Skeleton cards matching the 2-row layout.

## Offline Behavior
Last-synced values shown with a clear "last updated" timestamp; Quick Actions still
navigate (the destination screens have their own offline draft-save behavior per Part
2's established pattern).

## Acceptance Criteria
Technician can assess overall treatment status (on-track vs. needs attention) within 5
seconds of viewing this screen.

## Test Cases
Progress %/UF Progress recalculate correctly as new P3-02/P3-03 entries are saved;
Active Alerts card updates when a new alarm is logged on P3-07; Quick Actions route to
the correct screen; End Treatment routes to P3-10 without itself ending the session.

## Future AI Enhancements
`[GAP IDENTIFIED]` No content specified in the Figma; recommend, consistent with Part
2's pattern: predictive flagging of likely intradialytic hypotension based on UF rate
and current vitals trend — subject to the same human-in-the-loop labelling requirement
used throughout this document set.

---

# P3-02 — Live Vitals Monitoring

## Screen Objective
`[FIGMA-DERIVED]` "Record and monitor patient vital signs at scheduled intervals"
(screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §2.B: Blood Pressure, Heart Rate, and
Temperature/SpO2 (if indicated) must be recorded every 30–60 minutes throughout
treatment to detect intradialytic complications early.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01's "Add Vitals" quick action, or directly from the left-rail During
Dialysis nav. Not a linear "next screen" destination — see Decision 2. "Save & Continue"
button (confirmed present in the Figma) saves the entry and returns to the dashboard or
proceeds to another repeatable screen at the technician's choice, not a fixed next step.

## Wireframe
`[FIGMA-DERIVED]`
```
Breadcrumb: During Dialysis > P3-02 Live Vitals Monitoring
Title: "P3-02 – Live Vitals Monitoring"  subtitle: "Record and monitor patient vital
                                          signs at scheduled intervals."
                          [Main Center▾][🔔5][Session Time01:32 Elapsed][End Treatment]
Patient banner (same read-only fields as P3-01).
"Record New Vitals"                          Next Due:10:30AM(Every30min)
  Observation Time[10:00AM] BP(mmHg)*[122/78] Pulse(bpm)*[78] Respiratory Rate(/min)[18]
  Temperature(°C)[36.6] SpO2(%)[98] Pain Score(0-10)ⓘ[0] Consciousness[Alert▾]
  Symptoms[None▾] Remarks[textarea,0/200]
  ☐ Notify Nurse/Doctor ⓘ
  [Reset]  [Save Vitals]
"Vitals History" table: Time|BP|Pulse|RR|Temp|SpO2|PainScore|Consciousness|RecordedBy|edit
  (5 rows shown, most recent highlighted)                    [View All Vitals History→]
Footer: [←Back] [Save & Exit] [Save & Continue→]
Right rail: "Vitals Trend"(multi-line chart:SBP,DBP,Pulse,SpO2, "Last2Hours▾") |
  MonitoringInterval(Every30min) | Compliance(100%) | Alerts&Notifications
  ("No active vital alerts. All parameters are within acceptable range.") | Quick Actions
  (AddSymptoms,AddMedication,AlarmManagement,TreatmentProgress)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Breadcrumb → Page Header → Patient Banner → Record New
Vitals form (2-row field grid + Symptoms/Remarks + Notify checkbox + Reset/Save) →
Vitals History table (5 most recent + View All link) → Footer (Back, Save & Exit, Save
& Continue) → Right rail (Vitals Trend chart, Monitoring Interval, Compliance %,
Alerts, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` Observation Time, BP (Systolic/Diastolic), Pulse, Respiratory Rate,
Temperature, SpO2, Pain Score (0–10), **Consciousness (dropdown: Alert/Oriented/
Confused/Lethargic/Unresponsive — resolved this round via research, synced to P2-06's
now-researched version; only "Alert" was ever shown selected in this export)**,
Symptoms (dropdown, links toward P3-04),
Remarks (free text, 0/200), Notify Nurse/Doctor (checkbox).

**[READ-ONLY, CARRIED FROM PART 2]** none directly on the form itself — the patient
banner carries the usual read-only set.

## Input Types
Time picker (Observation Time); numeric entry (BP, Pulse, RR, Temp, SpO2); numeric/slider
(Pain Score, matching P2-05's slider pattern); dropdowns (Consciousness, Symptoms);
free-text (Remarks); checkbox (Notify).

## Mandatory Fields
**Critical (Mandatory):** BP (Systolic/Diastolic), Pulse, Temperature, SpO₂ — the
Figma export only asterisks BP and Pulse, but per the same Critical/Non-Critical Field
Classification reference used in Part 2 (Shared Platform Conventions), Temperature and
SpO₂ are also Critical here, consistent with P2-05's reclassification of SpO₂ from
Non-Mandatory to Mandatory. This screen previously described itself as matching
P2-05's *original* S6 resolution (RR/SpO₂ non-mandatory) — that resolution was
superseded on P2-05 itself, and this screen is updated to match rather than left
referencing a decision that no longer holds. **Non-Critical (Non-Mandatory,
skippable-with-reason):** Respiratory Rate, Pain Score.

## Validation Rules
`[DESIGN SPECIFICATION — reusing the P2-05 Warning/Critical model, not independently
Figma-confirmed for this screen]` Same two-tier out-of-range behavior as P2-05: a value
outside the Quick Reference range shows an amber "Warning" tag; a clinically dangerous
value shows a red "Critical" tag and triggers the shared checklist failure-state
banner — hard block, no override, same as P2-05 (Shared Platform Conventions,
Non-Mandatory Field Skip Workflow). Reusing the same mechanism here (rather than
inventing a second one) means a technician sees identical color/behavior conventions
whether they're on P2-05 or P3-02.

## Business Rules
Each save appends a new row to Vitals History — this screen does not "complete" the
way a Pre-Dialysis gate did; it accumulates entries all session.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Recording cadence is every 30–60 minutes; "Next Due" field
implements this directly, and Compliance % (100% in the example) measures how
consistently that cadence was met. **Overdue behavior resolved this round** — see the
new Cross-Screen Business Rule — Overdue Vitals Escalation.

## Auto-calculations
Compliance % = (number of on-time recordings ÷ number of due recordings) × 100, based
on the Monitoring Interval and session elapsed time. **Resolved this round:** once a
due time passes, the displayed % immediately recalculates to reflect the reading as a
tentative miss (Overdue Vitals Escalation rule, state 2) — this is a live/cached
adjustment, not yet persisted. It reverts to normal if the technician records the
reading late (state 3), or becomes a permanent drop only once Skipped or Auto-Escalated
(states 4/5).

## Decision Trees
Save Vitals → entry appended to history, Compliance % recalculated, Vitals Trend chart
updated → technician chooses Save & Exit (return to dashboard) or Save & Continue
(proceed to another screen) — genuinely a free choice per Decision 2, not a gate.
Critical-tier value → shared failure-state banner, Notify Nurse/Doctor checkbox
**auto-checked and permanently disabled — confirmed this round, cannot be unchecked
under any circumstances for a Critical reading**, consistent with the "never silence"
principle applied by analogy from P3-07.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/vitals-intradialytic` (all fields + recorded_by,
recorded_at). `GET /sessions/{id}/vitals-intradialytic?range=2h` for the trend chart.
**[NEW]** `GET /technicians/{id}/overdue-vitals` (powers the consolidated popup across
all of that technician's active sessions). `POST /overdue-vitals/{log_id}/skip`
(reason [optional]) and `POST /overdue-vitals/skip-all` (technician_id, log_ids[],
reason [optional, applies to all log_ids in this call]) — both permanently commit
the compliance drop and fire the nephrologist alert per the Overdue Vitals Escalation
rule.

## API Responses
`[PROPOSED]` Echo + a `flags` array (Warning/Critical per field) + updated compliance_pct.

## Database Mapping
`[PROPOSED]` `vitals_intradialytic` (session_id, observation_time, bp_systolic,
bp_diastolic, pulse, resp_rate, temperature, spo2, pain_score, consciousness, symptoms_ref,
remarks, notify_flag, recorded_by, recorded_at) — a distinct table from Part 2's
`vitals_predialysis`, since these are repeated readings, not a single pre-treatment
baseline. **Overdue readings write to `overdue_vitals_log` instead** — see the new
Cross-Screen Business Rule — Overdue Vitals Escalation, not duplicated here.

## Audit Events
`vitals_recorded`, `vital_warning_flagged`, `vital_critical_flagged`,
`nurse_doctor_notified` (if the checkbox is used, **or auto-checked on a Critical
reading**), plus the full set of overdue-vitals
events specified once in the Cross-Screen Business Rule — Overdue Vitals Escalation
(`vitals_overdue_entered`, `vitals_overdue_popup_shown`, `vitals_skip_clicked`,
`vitals_resolved_late`, `vitals_missed_auto_escalated`, `nephrologist_alert_sent`).

## Accessibility
See Shared Platform Conventions.

## Error Handling
**Resolved this round.** Missed-interval behavior is now fully specified — see the new
Cross-Screen Business Rule — Overdue Vitals Escalation: a consolidated popup fires the
instant a reading becomes overdue, with per-item Skip and Skip All, and a 20-minute
no-response auto-escalation, both permanently logging a compliance drop and alerting
the treating nephrologist.

## Empty States
`[FIGMA-DERIVED]` "No active vital alerts. All parameters are within acceptable range."
confirmed empty-state pattern.

## Loading States
Skeleton form + skeleton trend chart.

## Offline Behavior
Local draft-save with sync-on-reconnect, consistent with Part 2's technician-entry
screens.

## Acceptance Criteria
Technician can log a full vitals reading in under 30 seconds during an active
monitoring round.

## Test Cases
Warning/Critical tags trigger correctly at their thresholds; Compliance % reflects
on-time vs. late recordings; Vitals Trend chart updates immediately after Save;
Symptoms dropdown selection correctly cross-links to a P3-04 entry (see Cross-Screen
Business Rule). **Overdue Vitals Escalation:** a reading recorded before 20 minutes
overdue never triggers a permanent compliance drop or nephrologist alert; a Skip (or
Skip All covering this item) triggers both immediately, tagged as technician-
acknowledged; 20 minutes of no response triggers both automatically, tagged as
auto-escalated; the popup correctly consolidates overdue items across more than one
of the same technician's active sessions at once; clicking a popup row (not its Skip
button) navigates to that patient's P3-02 and the row disappears once recorded.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified in the Figma; Module 2 Part 1 §15 names "Predict
intradialytic hypotension" as a general future direction — this is the natural home
for that prediction, subject to human-in-the-loop labelling.

---

# P3-03 — Machine Parameters

*(Version 2 authoritative per Decision 1 above — the tabbed design with the Machine
Status system-checks panel. Version 1 discarded.)*

## Decision Log — amendment this round
**TMP (Transmembrane Pressure) Safe Range corrected** from 0–500 mmHg to **20–300
mmHg**. **Warning/Critical thresholds confirmed this round, via internet research**
(your instruction): **Normal 20–60 mmHg** (matches real-world routine-practice data),
**Warning 61–299 mmHg**, **Critical ≥300 mmHg** (the safety-ceiling figure
independently cited across every source checked). Researched
against three independent sources: a 2026 data-driven engineering study of real-world
TMP across four dialysis centers (standard HD typically 20–60 mmHg, values above 300
mmHg "rare," above 400 mmHg "not observed under routine conditions"); a clinical
renal-replacement-membrane reference stating a membrane must be changed above 300
mmHg; and a patient-facing clinical source independently citing 100–300 mmHg as the
normal operating range with 300 mmHg as a safety limit. **This changes the example
value's status: 380 mmHg is now correctly Critical, not Warning** — an earlier
correction round had moved it from "Normal" to "Warning," which was an improvement at
the time but is now superseded now that a firm 300 mmHg Critical ceiling is set; 380
exceeds that ceiling and must show Critical, matching the shared red failure-state
styling used elsewhere in this document, not the amber Warning styling. This also
still resolves the original internal inconsistency in the export, which showed a
"Slight High TMP" alert in the right-rail Active Alerts card *while the main TMP
parameter card itself said "Normal"* for the same 380 mmHg reading — the Active
Alerts wording should now read simply "High TMP" (dropping "Slight," since Critical is
not a slight deviation) at Critical severity, not Low/informational.

## Screen Objective
`[FIGMA-DERIVED]` "Monitor dialysis machine performance and key parameters in
real-time" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §2.A/§2.B: ongoing confirmation that
circuit integrity, equipment safety, and active controls (air detector, venous clamp,
blood leak detector) remain sound throughout treatment, alongside the required 30–60
minute machine-metric recording.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01 or the left-rail nav; not a linear gate — see Decision 2.

## Wireframe
`[FIGMA-DERIVED, Version 2]`
```
Title: "P3-03 – Machine Parameters"  subtitle: "Monitor dialysis machine performance
                                      and key parameters in real-time."
                          [Main Center▾][🔔5][Rahul Singh,Technician▾]
Patient banner: ...same read-only fields... + Prescribed BFR,Prescribed DFR,UF Goal,
                 Session Time Elapsed
Tab bar: [Overview*][Pressures][Flows][Dialysate][Ultrafiltration][Advanced Parameters]
[red] Machine Status: Running — "1 parameter Critical (TMP high — 380 mmHg)."
                                            Last Updated:10:15:30AM [↻]
Row1: BFR(300mL/min,OnTarget,slider0-500,Prescribed:300) DFR(500mL/min,OnTarget,
      slider0-1000,Prescribed:500) AP(-120mmHg,Normal,slider-300to300,SafeRange:-250to+250)
      VP(150mmHg,Normal,slider-100to500,SafeRange:-100to+500)
Row2: TMP(380mmHg,Critical,slider0-800,SafeRange:20-300) `[AMENDED — see Decision Log]`
      UFR(500mL/hr,OnTarget,
      slider0-1000,Prescribed:500) UFRemoved(Cumulative)(1.60L,67%ofGoal,Goal2.40L,
      Remaining0.80L) BloodVolumeProcessed(32.5L,Expected~64.0L,50%Completed)
Row3: DialysateConductivity(14.0mS/cm,Normal,SafeRange13.5-15.5) DialysateTemperature
      (36.5°C,Normal,SafeRange35.0-37.0) HeparinPump(ifapplicable)(1.0mL/hr,Running)
      BloodLeakDetector(NoLeakDetected,Status:OK)
"Parameter Trend(Last2Hours)": multi-line chart BFR,AP,VP,TMP  ["Last2Hours▾"]
"Notes/Comments"[textarea,0/300]
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: PatientSummary | MachineStatus(AllsystemsnormalcheckedlistPowerSupply,
  DialysateSystem,HeparinSystem,AirDetector,BloodLeakDetector, "ViewMachineDetails→") |
  ActiveAlerts(1)(HighTMP,10:12AM,Critical) | QuickReference(RecommendedBFR,UFGoal,
  RecirculationTarget, "ViewKDOQIGuidelines→")
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Tab Bar (6 tabs) →
Machine Status confirmation banner → 3-row parameter-card grid (12 cards total across
Overview tab) → Parameter Trend chart → Notes textarea → Footer → Right rail (Patient
Summary, Machine Status system-checks, Active Alerts, Quick Reference).

## Layout Grid
12-column responsive; 4-cards-per-row grid within the Overview tab; main form ≈8/12,
right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **Overview tab (12 parameters):** Blood Flow Rate, Dialysate Flow
Rate, Arterial Pressure, Venous Pressure, Transmembrane Pressure, Ultrafiltration Rate,
UF Removed (Cumulative), Blood Volume Processed, Dialysate Conductivity, Dialysate
Temperature, Heparin Pump rate, Blood Leak Detector status — each with current
value/safe-range bar/status tag. **Machine Status system checks (right rail):** Power
Supply, Dialysate System, Heparin System, Air Detector, Blood Leak Detector — each
OK/not-OK. **Other 5 tabs — `[INFERRED — best-reasonable-inference, not Figma-
confirmed, per your instruction]`:** each tab shows the relevant Overview parameters
in more detail (individual trend graph, session min/max/avg — not just the Overview's
single-value card), plus, where noted, one or two standard parameters a modern HD
machine typically reports in that category but which weren't part of the Overview's
12. These additions are flagged separately from the regrouped Overview parameters,
since they're a genuine inference beyond "just reorganize what's already confirmed."
  - **Pressures:** Arterial Pressure, Venous Pressure, Transmembrane Pressure (all
    from Overview, detailed view) + **Access Pressure** (inferred addition — commonly
    tracked alongside AP/VP on modern machines, not confirmed present on this one).
  - **Flows:** Blood Flow Rate, Dialysate Flow Rate (from Overview, detailed view) +
    **Recirculation %** (inferred addition — a standard derived access-adequacy metric).
  - **Dialysate:** Dialysate Conductivity, Dialysate Temperature (from Overview,
    detailed view) + **Sodium/Bicarbonate concentration** (inferred addition —
    reported by many, not all, machines; mark unavailable if this machine doesn't
    support it).
  - **Ultrafiltration:** UF Rate, UF Removed (Cumulative), % of Goal (from Overview,
    detailed view) + **UF Remaining, projected time-to-goal at current rate**
    (inferred addition, computed from existing values, no new instrument reading).
  - **Advanced Parameters:** Heparin Pump rate, Blood Leak Detector (from Overview,
    detailed view) + **online clearance/Kt/V real-time estimate, if the machine
    supports it** (inferred addition — a genuinely advanced/optional capability,
    consistent with this tab's name; mark unavailable if unsupported rather than
    fabricate a value).

## Input Types
Read-only live-value cards with safe-range slider visualization (all instrument-read
per F8's "manually fed" clarification from Part 2 — technician transcribes readings);
Notes free-text.

## Mandatory Fields
None — this is primarily a read-only monitoring screen, auto-fed from the machine;
Notes is optional. **Note on Critical/Non-Critical Field Classification (Shared
Platform Conventions):** doesn't apply here the same way as an entry checklist —
nothing is technician-entered to skip. All 12 Overview parameters are effectively
Critical in the sense that an out-of-range reading always triggers the failure state
below (no tier distinction needed, since there's no skip decision to make on
auto-fed data).

## Validation Rules
Any parameter outside its safe range → shared checklist failure state (Part 2's Shared
Platform Conventions) — hard block, no override — the parameter's slider/status tag
turns red, banner names the specific out-of-range parameter.

## Business Rules
UF Removed (Cumulative) and Blood Volume Processed accumulate across the session from
successive readings — not independently re-entered each time, calculated (see
Auto-calculations).
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` "Never silence alarms without identifying and correcting
the underlying cause" applies directly to any Machine Status system-check showing
not-OK.

## Auto-calculations
UF Removed (Cumulative) = running sum of UFR readings × time since last reading. %
of Goal = UF Removed ÷ Target UF (carried from P2-05). Blood Volume Processed =
running sum of BFR × elapsed time. % Completed (blood volume) = Blood Volume Processed
÷ Expected total (calculated from prescribed BFR × prescribed duration).

## Decision Trees
All parameters within range + all Machine Status checks OK → confirmation banner stays
green. Any parameter out of range or any system check fails → shared checklist failure
state; per Part 2's Shared Platform Conventions note, recommend **no-override** for
this screen (instrument readings, same tier as P2-08/P2-09) — any failure here should
require a nurse/nephrologist to physically assess the machine, not a technician
acknowledgment click.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/machine-parameters` (12 parameter readings + Notes,
recorded_by, recorded_at). `GET /sessions/{id}/machine-parameters?range=2h` for the
trend chart.

## API Responses
`[PROPOSED]` Echo + cumulative UF Removed/Blood Volume Processed + a `flags` array +
Machine Status system-check results.

## Database Mapping
`[PROPOSED]` `machine_parameters_intradialytic` (session_id, timestamp, all 12 readings,
recorded_by), `machine_status_check_intradialytic` (session_id, timestamp, 5
system-check results).

## Audit Events
`machine_parameters_recorded`, `machine_parameter_failed` (if applicable, naming the
parameter), `machine_system_check_failed` (if applicable, naming the system).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Out-of-range parameter or failed system check → shared checklist failure state.

## Empty States
`[FIGMA-DERIVED]` The right-rail Active Alerts card shows a populated example in this
export (Slight High TMP) rather than an empty state — recommend reusing the "No active
machine alerts" pattern from P2-08 when nothing is active.

## Loading States
Skeleton parameter cards + skeleton trend chart.

## Offline Behavior
Last-synced readings shown with a visible timestamp, consistent with Part 2's
instrument-read-screen pattern (P2-08/P2-09).

## Acceptance Criteria
Technician can confirm all 12 parameters and all 5 system checks are within range in
under 15 seconds during a monitoring round.

## Test Cases
Out-of-range parameter triggers shared failure state; cumulative UF Removed/Blood
Volume Processed calculate correctly across multiple saved readings; each of the 5
non-Overview tabs correctly displays its detailed/trend view for the regrouped
parameters, and correctly shows "Not Available" (not a fabricated value) for any
inferred addition the machine doesn't actually support.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified in the Figma; a natural candidate given Module 2 Part
1 §15's "detect vascular access dysfunction" and general predictive-maintenance themes
— subject to human-in-the-loop labelling.

---

# P3-04 — Patient Symptoms & Complications

## Screen Objective
`[FIGMA-DERIVED]` "Document any intradialytic symptoms or complications and actions
taken" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §2.C "Patient Symptoms": hypotension/
hypertension, cramps, nausea/vomiting, chest/back pain, headache, dyspnea, chills,
fever, allergic reaction indicators, disequilibrium, and hemolysis signs must all be
actively monitored for and documented as they occur.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01's "Add Symptoms" quick action, from P3-02's Symptoms dropdown, or
the left-rail nav — not a linear gate.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-04 – Patient Symptoms & Complications"  subtitle: "Document any
                                                    intradialytic symptoms or
                                                    complications and actions taken."
Patient banner (standard read-only fields).
"Record New Symptom / Complication"
  Event Time*[10:15AM] Symptom/Complication*[Select symptom▾] Severity*[Mild|Moderate|Severe]
  Status[Ongoing▾]
"Common Symptoms" (12 tap-tiles with icons): Hypotension(LowBP), Muscle Cramps,
  Nausea/Vomiting, Chest Pain, Shortness of Breath, Chills/Rigors, Headache, Bleeding,
  Syncope/Dizziness, Itching, Back Pain, Other
Details[textarea,0/300]              Intervention/Action Taken*[Select intervention▾]
                                      Additional Notes[textarea,0/200]
☐ Notify Nurse/Doctor ⓘ                          [Reset]  [Save Symptom]
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: ActiveSymptoms(1)(Hypotension,Started10:00AM,Moderate,BP88/54mmHg,
  Intervention:UFPaused+100mLNSgiven,Status:Ongoing,[Update]) | SymptomHistory
  (Last4Events, each with time,resolved-badge,intervention) | ClinicalGuidance
  ("If hypotension persists, consider reducing UF rate, increasing Na+ and evaluate
  dry weight." "View Guidelines→")
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Record New Symptom form
(Event Time/Symptom/Severity/Status row → 12-tile Common Symptoms quick-select grid →
Details + Intervention + Additional Notes → Notify checkbox → Reset/Save) → Footer →
Right rail (Active Symptoms card with Update action, Symptom History, Clinical
Guidance).

## Layout Grid
12-column responsive; 6-tiles-per-row Common Symptoms grid; main form ≈8/12, right
rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` Event Time, Symptom/Complication (dropdown or one of the 12 quick-
select tiles — Hypotension, Muscle Cramps, Nausea/Vomiting, Chest Pain, Shortness of
Breath, Chills/Rigors, Headache, Bleeding, Syncope/Dizziness, Itching, Back Pain,
Other), Severity (Mild/Moderate/Severe), Status (Ongoing/Resolved — dropdown),
Details (free text, 0/300), **Intervention/Action Taken (dropdown, full list resolved
this round: Positioned Patient/Trendelenburg, Reduced or Stopped UF Rate,
Administered Saline Bolus, Administered Medication, Notified Nurse/Physician,
Reassured Patient, Continued Monitoring, Other)**, Additional Notes
(free text, 0/200), Notify Nurse/Doctor (checkbox).

**[NEW — resolved this round]** When Symptom = Bleeding, a conditional follow-up
field appears: **"Is this access-site related?" (Yes/No, required when Bleeding is
selected)** — resolves the previously-open Bleeding→event_type ambiguity. This does
not apply to any other symptom; it's specific to Bleeding since that's the one symptom
name in this list that doesn't itself indicate whether it's access-related or
systemic/GI.

**[NEW — dashboard cross-reference]** `event_type` — system-computed, not directly
editable, derived at save time via a fixed lookup: Hypotension → **IDH**; Chest Pain,
Syncope/Dizziness → **Cardiac Event**; **Bleeding with "Is this access-site related?"
= Yes → Access Complication; Bleeding with that toggle = No → Other**; Muscle Cramps,
Nausea/Vomiting, Shortness of Breath, Chills/Rigors, Headache, Itching, Back Pain,
Other → **Other**.

## Input Types
Time picker; searchable dropdown or tile-tap (Symptom); 3-way severity toggle; status
dropdown; free-text (Details, Additional Notes); intervention dropdown; checkbox.

## Mandatory Fields
`[FIGMA-DERIVED]` Event Time, Symptom/Complication, Severity, and Intervention/Action
Taken are asterisked; Status, Details, Additional Notes are not. **"Is this
access-site related?" is mandatory whenever Symptom = Bleeding** (added this round —
resolves the event_type mapping ambiguity, see Field Definitions). **Note on the
Critical/Non-Critical Field Classification and Skip Workflow (Shared Platform
Conventions):** this screen doesn't structurally fit that model — it's an
event-logging form (technician records a symptom *as it happens*, choosing from 12
tap-tiles), not a checklist reviewing every possible symptom every session the way
P2-06 does. There's no "leave blank" case to gate; a symptom either gets logged or
doesn't occur. The Critical/Non-Critical distinction for symptom *types* already lives
in this table's `event_type` mapping (Hypotension→IDH, Chest Pain→Cardiac Event, etc.,
specified earlier for dashboard reporting) rather than in a separate mandatory-field
split here.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED — cross-referenced to the Mandatory Adverse Event trigger
above]` Severity = Severe on a hemodynamically significant symptom (Hypotension, Chest
Pain, Syncope/Dizziness, Bleeding) → triggers the Cross-Screen Mandatory Adverse Event
Auto-Incident rule, pre-populating a P3-09 draft. This is new logic added this round,
not shown as such in the Figma, but directly required by Safety Protocol §4.

## Business Rules
Multiple symptoms can be active simultaneously (the Active Symptoms right-rail card is
a list, not a single slot); each has its own Update action rather than requiring a
whole new form submission to change status from Ongoing to Resolved.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.

## Clinical Rules
`[FIGMA-DERIVED]` Clinical Guidance panel shows symptom-specific guidance text
("If hypotension persists, consider reducing UF rate, increasing Na+...") — confirmed
dynamic/contextual to the symptom being recorded, not static boilerplate.

## Auto-calculations
None directly on-screen; Active Symptoms count badge (right rail) is a simple count of
Status=Ongoing entries. **[NEW]** `event_type` (see Field Definitions) is computed
server-side at save time via the fixed symptom→category lookup — never displayed as an
editable field, exists purely to feed the dashboard's B1/B2 metrics via a `UNION`
across this table, `vascular_access_monitoring` (P3-05), and `alarm_log` (P3-07).

## Decision Trees
```
Select/tap a symptom → choose Severity
  ├── Severe + hemodynamically significant → Mandatory Adverse Event auto-incident
  │     trigger fires (see Cross-Screen Business Rule) → P3-09 draft created
  ├── Any severity → Intervention required before Save
  └── Save → appended to Symptom History; if Status=Ongoing, also appears in the
        Active Symptoms card until updated to Resolved
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/symptoms` (all fields + recorded_by, recorded_at).
`PATCH /sessions/{id}/symptoms/{symptom_id}` for the Update action (status change).

## API Responses
`[PROPOSED]` Echo + `auto_incident_created` (bool + incident_id if the trigger fired).

## Database Mapping
`[PROPOSED]` `symptom_intradialytic` (session_id, event_time, symptom, severity,
status, details, intervention, additional_notes, notify_flag, recorded_by, recorded_at,
resolved_at nullable, **access_site_related** [nullable bool, only populated when
Symptom=Bleeding], **event_type** [computed, enum: IDH/Cardiac Event/Access
Complication/Other — see
Field Definitions]).

## Audit Events
`symptom_recorded`, `symptom_updated` (status change), `severe_symptom_flagged`,
`auto_incident_triggered` (linking to the P3-09 record created).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Missing Intervention on a required-field save → inline validation error.

## Empty States
**Resolved** — "No active symptoms this session," consistent with this document's
established empty-state convention. No explicit empty state was captured for this in this
export (the example shows one active symptom); recommend the same pattern as P2-06/
P3-02's "No active alerts" convention.

## Loading States
Skeleton form + skeleton Active Symptoms/History cards.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician can log a new symptom and its intervention in under 45 seconds, and update
an ongoing symptom's status in under 10 seconds.

## Test Cases
Severe + significant symptom triggers the auto-incident rule and correctly pre-
populates P3-09; Update action correctly transitions Ongoing → Resolved; multiple
concurrent active symptoms display correctly.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; a natural fit for "predict intradialytic hypotension"
(Module 2 Part 1 §15), subject to human-in-the-loop labelling.

---

# P3-05 — Vascular Access Monitoring

## Decision Log (this screen)
This is a genuinely **different** field set than P2-07's Vascular Access Assessment,
not a duplicate — P2-07 assessed *suitability before cannulation*; this screen monitors
*the access site during active use*. Confirmed via the Figma: this export shows AVF-
specific ongoing-surveillance items (Needle Position/Security, Infiltration/
Extravasation, Blood Flow Adequacy) that have no equivalent on P2-07.

## Screen Objective
`[FIGMA-DERIVED]` "Monitor vascular access site for patency, function and
complications" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §2.C "Vascular Access Surveillance":
needle dislodgement/infiltration, bleeding/swelling/access pain, and catheter
connection defects must be actively watched for throughout treatment, distinct from
the one-time pre-cannulation check in Part 2.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01/left-rail nav; not a linear gate.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-05 – Vascular Access Monitoring"  subtitle: "Monitor vascular access site
                                              for patency, function and complications."
Patient banner (standard read-only fields).
"Access Type": (●AVFistula(AVF)) (○AVGraft(AVG)) (○CentralVenousCatheter(CVC))
                                                      AssessmentTime:26May2025,10:20AM
"Access Assessment – AV Fistula (Left)" — "Evaluate access site during treatment."
Table: AssessmentItem|Findings|Details/Comments(if abnormal)
  NeedlePosition&Security      | Secure/Loose/Dislodged        | Describe if abnormal
  Bleeding                     | None/Minimal/Excessive        | Describe if abnormal
  Swelling                     | None/Mild/Moderate/Severe     | Describe if abnormal
  Infiltration/Extravasation   | No/Yes(Mild)/Yes(Severe)      | Describe if yes
  Pain/Tenderness              | None/Mild/Moderate/Severe     | Describe if present
  Thrill(Palpation)            | Strong/Weak/Absent            | Describe if abnormal
  Bruit(Auscultation)          | Normal/Weak/Absent            | Describe if abnormal
  Blood Flow Adequacy          | Adequate/Inadequate/NotAssessable | Describe if abnormal
  Skin Condition                | Normal/Redness/Warmth/Other  | Describe if abnormal
"Overall Access Status*": (●Good/Functional)(○AtRisk)(○NotFunctional)
"Intervention/Action Taken"[Select▾]        "Next Assessment Due"[Select time▾]
"Additional Notes"[textarea,0/200]          ☐ Notify Nurse/Doctor ⓘ
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: AccessSummary(Good/Functional,AccessType,Location,DateCreated,LastReviewed,
  "ViewAccessHistory→") | AccessHealthIndicator(95%Good gauge,"Based on current
  assessment") | ClinicalGuidance("Maintain adequate blood flow(BFR250-300mL/min).
  Inspect access site regularly for early signs of complications." "ViewGuidelines→") |
  QuickActions(RecordSymptoms,RecordVitals,AlarmManagement,TreatmentProgress)
```
`[DESIGN SPECIFICATION — confirmed this round, adapted from P2-07's CVC fields]`
```
"Access Assessment – Central Venous Catheter (Right IJ)" — "Evaluate catheter during
  treatment."
Table: Assessment Item | Findings | Details/Comments (if abnormal)
  Catheter Connection Security | Secure/Loose/Disconnected  | Describe if abnormal
  Blood Flow Adequacy          | Adequate/Inadequate/NotAssessable | Describe if abnormal
  Bleeding (at exit/connection)| None/Minimal/Excessive     | Describe if abnormal
  Signs of Infection/Erythema/Discharge | No/Yes            | Describe if yes
  Kinking/Clamping Issues      | None/Present               | Describe if present
  Tenderness/Pain at Exit Site | No/Yes                     | Describe if yes
  Dressing Intact              | Yes/No                     | Describe if abnormal
  Exit Site Clean              | Yes/No                     | Describe if abnormal
  Skin Condition                | Normal/Redness/Warmth/Other | Describe if abnormal
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Access Type selector
(3-way, same pattern as P2-07) → Access Assessment table (9 rows for AVF/AVG) →
Overall Access Status (3-way) → Intervention + Next Assessment Due + Notes + Notify →
Footer → Right rail (Access Summary, Access Health Indicator gauge, Clinical Guidance,
Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **AVF/AVG assessment table (9 rows, confirmed):** Needle Position &
Security, Bleeding, Swelling, Infiltration/Extravasation, Pain/Tenderness, Thrill
(Palpation), Bruit (Auscultation), Blood Flow Adequacy, Skin Condition — each Finding +
Details-if-abnormal. **Overall Access Status:** Good/Functional, At Risk, Not
Functional. **CVC branch, confirmed this round** — adapted from P2-07's already-
confirmed CVC fields (Dressing Intact, Tenderness/Pain, Exit Site Clean, Signs of
Infection, Catheter Patent), plus during-dialysis-specific additions this screen needs
that P2-07's pre-treatment check doesn't (the catheter isn't yet connected to
bloodlines at P2-07's stage): Catheter Connection Security, Blood Flow Adequacy,
Bleeding, Signs of Infection/Erythema/Discharge, Kinking/Clamping Issues,
Tenderness/Pain at Exit Site, Dressing Intact, Exit Site Clean, Skin Condition — 9
rows, matching the AVF/AVG table's row count.

**[READ-ONLY, CARRIED FROM PART 2]** Access Type default selection, Access Summary's
Location/Date Created (from P2-07's Access Details).

**[NEW — dashboard cross-reference]** `event_type` — system-computed, not shown or
editable on this screen, set to **Access Complication** on any row where
Infiltration/Extravasation = Yes (either severity), Bleeding = Excessive, Thrill =
Absent, or Blood Flow Adequacy = Inadequate; left null on routine "all clear"
assessment rows, since most monitoring rounds aren't complications.

## Input Types
Radio (Access Type); mixed radio rows in the table (varying option sets per row);
free-text (Details-if-abnormal, Additional Notes); 3-way Overall Access Status;
dropdowns (Intervention, Next Assessment Due); checkbox (Notify).

## Mandatory Fields
Overall Access Status is always mandatory (drives the status determination).
**Critical (Mandatory):** Bleeding, Infiltration/Extravasation, Thrill (Palpation),
Bruit (Auscultation), Blood Flow Adequacy, **Needle Position & Security** — the Safety
Protocol names "Air Embolism & Severe Needle Dislodgement" together as a single
Emergency Preparedness Standard, so needle security is classified Critical here. Each
of these six is a named Mandatory Adverse Event trigger, a named Emergency
Preparedness Standard, or an access-thrombosis/failed-perfusion indicator, consistent
with the same classification applied to P2-07's AVF/AVG table (Shared Platform
Conventions, Critical/Non-Critical Field Classification reference). **Non-Critical
(Non-Mandatory, skippable-with-reason):** Swelling, Pain/Tenderness, Skin Condition —
contributory findings, not independently emergency-defining. The 9 rows were
previously described as "implicitly required but not individually asterisked" — this
replaces that ambiguity with an explicit split. **CVC branch, confirmed this round —
Critical (Mandatory):** Catheter Connection Security (Air Embolism & Severe
Dislodgement Emergency Preparedness Standard applies equally to a catheter connection
coming loose), Blood Flow Adequacy, Bleeding, Signs of Infection/Erythema/Discharge,
Kinking/Clamping Issues (flow/safety risk specific to catheters), Tenderness/Pain at
Exit Site (EXITA Study, consistent with P2-07's CVC classification). **CVC — Non-
Critical (Non-Mandatory, skippable-with-reason):** Dressing Intact, Exit Site Clean,
Skin Condition.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` Infiltration/Extravasation = Yes (either severity),
Bleeding = Excessive, or Needle Position & Security showing dislodgement → shared
checklist failure state, hard block, no override, and per the Cross-Screen Mandatory
Adverse Event rule, auto-creates a P3-09 draft incident. **CVC branch: Catheter
Connection Security showing Loose/Disconnected, Blood Flow Adequacy = Inadequate,
Bleeding = Excessive, or Signs of Infection = Yes → same shared failure state, hard
block, auto-incident trigger.** Non-Critical rows (both branches) left blank follow
the Non-Mandatory Field Skip Workflow instead.

## Business Rules
Access Health Indicator (95% in the example) is a calculated composite score, not an
independent entry — see Auto-calculations.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Needle dislodgement/infiltration and bleeding/swelling are
explicitly named surveillance targets in Safety Protocol §2.C — codified as the two
highest-priority rows in this table.

## Auto-calculations
**Access Health Indicator % — resolved this round, via research.** No validated
formula exists in the clinical literature for converting a single exam's categorical
findings into a percentage — real vascular-access scoring systems (e.g., AAPR ratios,
stenosis risk scores) are built from continuous physiological sensor data and
longitudinal outcomes, not a single assessment's Yes/No/Absent findings. Rather than
invent a 9-row weighted formula that would carry false clinical precision, the gauge
is **derived directly from Overall Access Status** (the field this screen already has
a technician/nurse clinically determine): Good/Functional = 95–100% (exact value
within that band reserved for a future weighting refinement, not invented now), At
Risk = 50–75%, Not Functional = 0–25%. This means the gauge visualizes a real clinical
judgment rather than independently recalculating one from raw findings.
`[NEW]` `event_type` (see Field Definitions) is computed server-side at save time
from the 4 complication-trigger findings — feeds the dashboard's B1/B2 metrics via a
`UNION` across this table, `symptom_intradialytic` (P3-04), and `alarm_log` (P3-07).

## Decision Trees
```
Select Access Type → render AVF/AVG table or CVC table (both confirmed, 9 rows each)
  ├── AVF/AVG: Infiltration/Extravasation = Yes, or Bleeding = Excessive →
  │     shared failure state + auto-incident trigger (Cross-Screen Business Rule)
  ├── AVF/AVG: Thrill = Absent or Blood Flow Adequacy = Inadequate → escalate (same
  │     principle as the Pre-Dialysis "AVF thrill absent" rule, now applied during
  │     treatment)
  ├── CVC: Catheter Connection Security = Loose/Disconnected, Blood Flow Adequacy =
  │     Inadequate, or Signs of Infection = Yes → same shared failure state +
  │     auto-incident trigger
  └── All clear (either branch) → Overall Access Status = Good/Functional available
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/vascular-access-monitoring` (access_type, 9-row
findings, overall_status, intervention, next_assessment_due, notes, recorded_by,
recorded_at).

## API Responses
`[PROPOSED]` Echo + access_health_pct + `flags` array + `auto_incident_created` if
applicable.

## Database Mapping
`[PROPOSED]` `vascular_access_monitoring` (session_id, timestamp, access_type, 9 finding
columns [AVF/AVG branch], **9 CVC-branch finding columns [catheter_connection_security,
blood_flow_adequacy, bleeding, signs_of_infection, kinking_clamping,
tenderness_pain, dressing_intact, exit_site_clean, skin_condition]**, overall_status,
intervention, next_assessment_due, notes, recorded_by,
**event_type** [computed, nullable, enum: Access Complication — see Field
Definitions]).

## Audit Events
`access_monitored`, `access_complication_flagged` (naming the specific finding),
`auto_incident_triggered` (if applicable).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Overall Access Status not selected → inline validation error before Save.

## Empty States
N/A — form screen with a persistent right-rail summary, not a list.

## Loading States
Skeleton form + skeleton Access Health gauge.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician can complete a full access re-check in under 60 seconds during a monitoring
round.

## Test Cases
CVC branch renders and validates correctly (9 rows, confirmed this round);
infiltration/excessive-bleeding correctly triggers shared failure state and
auto-incident, on both branches; Access Health Indicator recalculates per entry.

## Future AI Enhancements
`[GAP IDENTIFIED]` Module 2 Part 1 §15's "detect vascular access dysfunction" maps
directly to this screen — natural home for that prediction, subject to human-in-the-
loop labelling.

---

# P3-06 — Medication Administration

## Screen Objective
`[FIGMA-DERIVED]` "Record medications given to the patient during dialysis treatment"
(screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §2.C "Medication & Comfort": intradialytic
medications (ESA, Iron, Antibiotics, Midodrine, and others per prescription) and any
adverse drug reactions must be documented as administered.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01's "Add Medication" quick action or left-rail nav; not a linear gate.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-06 – Medication Administration"  subtitle: "Record medications given to the
                                             patient during dialysis treatment."
Patient banner (standard read-only fields).
"Add Medication Administration"
  Medication*[Search medication▾] Indication[Select indication▾] Dose*[e.g.500][mg▾]
  Route*[Select route▾]
  [NEW — this round] {appears immediately after Medication is selected, before the
  rest of the form}: if the selected medication matches the patient's documented
  allergy list (read-only, from the patient table per the established S4 pattern):
  [red banner] "⚠ ALLERGY ALERT — Patient has a documented allergy to
  [medication/allergen]. Reaction: [severity/type if on record]."
    ☐ I have verified this with the patient/prescriber and confirm this medication
      should still be given. Reason*[textarea, mandatory to proceed]
  Administration Time*[10:25AM] Administered By*[RahulSingh(Technician)▾]
  Quantity Used*[e.g.1][vial/ampoule/mL▾] Expiry Date[DD MMM YYYY]
  [green]"Pre Medication Vitals": BP(mmHg)[118/76] Pulse(bpm)[78] SpO2(%)[98]
  [green]"Post Medication Observation": AnyAdverseReaction?[No|Yes]
    ReactionDetails[textarea,0/250]
  AdditionalNotes[textarea,0/250]
  [Reset]  [Save Medication]
"Medication Administration History" table: Time|Medication|Dose|Route|Indication|
  AdministeredBy|Status|Notes|edit             (3 rows shown)  [ViewFullMedicationHistory→]
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: TodaysMedicationsSummary(3TotalPrescribed,2Administered,1Pending,0Missed) |
  MedicationReminders(HeparinLoadingDose Due10:30AM,EpoetinAlfa Due11:30AM,
  IronSucrose Due12:00PM, "ViewAllReminders→") | ClinicalGuidelines("Ensure correct
  medication,dose,route and time. Monitor for any adverse reactions during and after
  administration." "ViewGuidelines→") | QuickActions(ViewPrescription,RecordVitals,
  AddSymptom,TreatmentProgress)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Add Medication
Administration form (Medication/Indication/Dose/Route row → Administration
Time/Administered By/Lot/Expiry row → Pre Medication Vitals sub-panel → Post Medication
Observation sub-panel → Additional Notes → Reset/Save) → Medication Administration
History table → Footer → Right rail (Today's Medications Summary tiles, Medication
Reminders, Clinical Guidelines, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12; Pre/Post Medication sub-panels
are 2-column within the main form.

## Field Definitions
`[FIGMA-DERIVED, amended this round]` Medication (searchable dropdown), **Indication
(dropdown, full list resolved this round: Anemia Management (ESA/Iron),
Anticoagulation, Hypotension/IDH Management, Muscle Cramps, Nausea/Vomiting,
Infection/Prophylaxis, Pain Management, Other)**, Dose (numeric + unit dropdown, e.g.
mg/units/mL), **Route (dropdown, full list resolved this round: IV (confirmed
example), IV Push, IV Infusion, Subcutaneous (SC), Oral (PO), Intradialytic — via
dialysate)**,
Administration Time, Administered By (dropdown, technician/nurse names), **Quantity
Used** (numeric + unit — vial/ampoule/mL, **replaces the previously-specified
Lot/Batch No. field per your instruction**: this system tracks consumption quantity
for inventory purposes, not lot-level traceability, for medications), Expiry Date,
**Pre Medication Vitals:** BP, Pulse, SpO2 (a mini-snapshot, not the full P3-02 form),
**Post Medication Observation:** Any Adverse Reaction (Yes/No), Reaction Details
(conditional), Additional Notes.

**[NEW — DESIGN SPECIFICATION, this round]** **Allergy Check**: fires automatically
the moment a Medication is selected, before the rest of the form is enterable. Cross-
references the selected medication (and known cross-sensitivities, e.g., certain
antibiotic classes) against the patient's documented allergy list. If a match is
found: a red alert banner names the allergen and any recorded reaction severity; the
technician cannot proceed without either (a) selecting a different medication, or
(b) checking an explicit override confirmation **and** providing a mandatory reason —
there is no silent "acknowledge and continue" path. Sourced from the same patient-
table allergy data established in Part 2 (S4) — not re-entered here, and not a new
data-entry field, only a new **check**.

**[READ-ONLY, CARRIED FROM PART 2]** none directly — this screen's "Today's
Medications Summary" Total Prescribed count is sourced from the prescription
(P2-04), not re-entered. Patient allergy list (for the new Allergy Check above) is
also read-only, carried from Part 2/the Telemedicine Prescription module.

## Input Types
Searchable dropdown (Medication); dropdowns (Indication, Route, Administered By, dose
unit, quantity unit); numeric (Dose, Quantity Used, Pre-Medication Vitals); time
picker (Administration Time); date picker (Expiry Date); free-text (Reaction Details,
Additional Notes, allergy-override Reason); Yes/No toggle (Adverse Reaction);
checkbox (allergy override confirmation).

## Mandatory Fields
`[AMENDED]` Medication, Dose, Route, Administration Time, Administered By, **Quantity
Used** are asterisked; Indication, Expiry Date, Pre-Medication Vitals, Additional
Notes are not. **If an allergy match fires, the override checkbox + Reason become
mandatory before Save Medication is enabled** — this is a hard block, not a warning
the technician can click past. **Note on Critical/Non-Critical Field Classification
(Shared Platform Conventions):** the existing mandatory set here already matches that
methodology without needing a change — every already-mandatory field (Medication,
Dose, Route, Time, Administered By, Quantity) is a medication-safety-critical data
point (a partial administration record is itself a medication error), and the
already-non-mandatory fields (Indication, Expiry Date, Pre-Medication Vitals,
Additional Notes) are contextual/contributory, consistent with Non-Critical. These
four are treated as Non-Critical, skippable-with-reason per the Non-Mandatory Field
Skip Workflow, rather than left as plain "not required."

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` Any Adverse Reaction = Yes → shared checklist failure-state
styling on the Post Medication Observation panel, and per the Cross-Screen Mandatory
Adverse Event rule, auto-creates a P3-09 draft incident (medication errors/adverse
reactions are explicitly named in Safety Protocol §4). **[NEW]** Allergy match with no
override → Save Medication blocked entirely, per Field Definitions above. **Expired
Expiry Date → Save Medication blocked entirely, confirmed this round, no override
path** — see Error Handling.

## Business Rules
Today's Medications Summary counts (Total Prescribed, Administered, Pending, Missed)
are calculated by comparing the prescription's medication list against what's been
logged here — see Auto-calculations. A medication due but not logged by its expected
time should surface as "Pending" then eventually "Missed," not silently disappear.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.
**[NEW]** Every saved entry's Quantity Used triggers an inventory deduction in Part 6
for that medication SKU — this is the natural, already-existing data point for that
hook, requiring no new field beyond the Lot/Batch-to-Quantity swap made this round.
**[NEW]** An allergy override (technician proceeded despite a documented allergy
match) contributes a **Critical** item to the Consolidated Physician Notification
(Part 4's Cross-Screen Business Rule) — the physician should always know this
happened, regardless of outcome.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Pre/Post Medication vitals snapshots directly implement
"Monitor for any adverse reactions during and after administration" from the Clinical
Guidelines panel. **[NEW, research-derived]** Checking documented allergy status
before administering any medication is treated as a core "right" of medication
administration in nursing/patient-safety literature (comparable in importance to the
5/6/10 Rights of Medication Administration) — this is why the check is a hard block,
not an advisory banner.

## Auto-calculations
Total Prescribed = count of medications on the active prescription for this session.
Administered = count of saved entries with a completed administration_time. Pending =
Total Prescribed − Administered, where due time hasn't passed yet. Missed = Pending
entries where due time has passed without an entry.

## Decision Trees
```
Medication selected
  ├── Allergy match found → red alert; Save Medication blocked until override
  │     checkbox + Reason provided → if overridden, Critical physician-notification
  │     item created
  └── No allergy match → proceed normally
Save Medication
  ├── Adverse Reaction = Yes → shared failure state + auto-incident trigger
  │     (Cross-Screen Business Rule)
  └── No reaction → entry appended to History, Today's Medications Summary
        recalculated, Medication Reminders list updates
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/medications` (medication, indication, dose,
dose_unit, route, administration_time, administered_by, quantity_used, quantity_unit,
expiry_date, pre_vitals, adverse_reaction, reaction_details, notes,
allergy_override {matched, reason} if applicable, recorded_by). `GET
/sessions/{id}/medications/due` for the Reminders panel, sourced from the
prescription. `GET /patients/{id}/allergies` for the Allergy Check (read-only).
`[NEW]` `POST /inventory/{sku}/deduct` fires as a side-effect of a successful save,
using quantity_used — called by the backend, not the technician directly.

## API Responses
`[PROPOSED]` Echo + updated summary counts + `auto_incident_created` if applicable +
`allergy_alert` {matched: bool, allergen, severity} + `inventory_deducted` {sku,
quantity} confirmation.

## Database Mapping
`[PROPOSED]` `medication_administration` (session_id, medication, indication, dose,
dose_unit, route, administration_time, administered_by, **quantity_used,
quantity_unit** [replaces lot_batch per this round's change], expiry_date, pre_vitals
{bp, pulse, spo2}, adverse_reaction, reaction_details, notes, **allergy_override_reason**
[nullable], recorded_at) — quantity_used is what Part 6 reads for its deduction, not
a separately maintained inventory-transaction record on this table.

## Audit Events
`medication_administered`, `adverse_reaction_flagged`, `auto_incident_triggered` (if
applicable), `medication_missed` (system-generated, not technician-initiated),
**`allergy_alert_shown`, `allergy_override_confirmed`** (with reason — this is the
audit trail entry the Critical physician-notification item links back to).

## Accessibility
See Shared Platform Conventions.

## Error Handling
**Resolved this round.** Expired Expiry Date entered → **hard block, confirmed** —
Save Medication is disabled entirely, no override path exists. The Expiry Date field
shows a red error state with copy naming the expiration, and the technician must
select a different (non-expired) lot/unit before proceeding — there is no way to
administer an expired medication through this screen.

## Empty States
N/A — table screen; "no medications prescribed" state not captured in this export.

## Loading States
Skeleton form + skeleton History table + skeleton Reminders list.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician can log a medication administration, including pre/post vitals, in under 45
seconds.

## Test Cases
Adverse reaction triggers shared failure state and auto-incident; Missed status
correctly appears once due time passes without an entry; expired-date entry is
blocked (pending confirmation). **Allergy match correctly blocks Save Medication
until override + reason provided; override correctly creates a Critical physician-
notification item and an audit trail entry; Quantity Used correctly triggers a Part 6
inventory deduction for the matching SKU.**

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; a plausible candidate is a drug-interaction/duplicate-
dose check against the medication history, subject to human-in-the-loop labelling.

---

# P3-07 — Alarm Management

## Decision Log — amendments this round
**Alarm origin clarified:** alarms on this screen are technician-logged after
observing the physical machine's alarm, not a live machine-integration feed — Alarm
Time (time picker) and Alarm Type (dropdown) are both manually set, matching the same
"manually fed / technician transcribes" pattern already established for P3-03. **Full
Alarm Type taxonomy added** (see Field Definitions) — only "High Venous Pressure" was
ever confirmed in the export; the rest is research-derived from standard HD machine
alarm categories, explicitly flagged as such. **Duration changed from manual entry to
calculated** (Resolution Time − Alarm Time), which required making Resolution Time
itself conditionally mandatory when Resolution Status = Resolved.

## Screen Objective
`[FIGMA-DERIVED]` "Monitor, document and manage dialysis machine alarms" (screen's own
subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §2.C "Technical & Alarm Management" and the
explicit mandate: *"Never silence alarms without identifying and correcting the
underlying cause."* This screen is where that mandate is enforced procedurally.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01's "Alarm Management" quick action or left-rail nav; not a linear
gate — alarms occur unpredictably, this screen is visited as many times as alarms fire.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-07 – Alarm Management"  subtitle: "Monitor, document and manage dialysis
                                    machine alarms."
Patient banner (standard read-only fields).
"Record New Alarm"
  AlarmTime*[10:32AM] AlarmType*[HighVenousPressure▾] Severity*[High▾, red X icon]
  RelatedParameter[VenousPressure(VP)▾] AlarmCode(ifany)[A-204]
  AlarmDescription[textbox:"Venous pressure exceeds upper limit"]
  CurrentValue[245][mmHg] Threshold/Limit[>230mmHg] Duration[02:15][min, read-only,
           calculated from Resolution Time − Alarm Time]
  ActionTaken*[ReducedBFR▾] AdditionalActions[textbox:"Repositioned patient,flushed line"]
  ResolvedBy*[RahulSingh(Technician)▾] ResolutionTime*[10:37AM, mandatory when
           Resolution Status=Resolved — see Mandatory Fields]
  ResolutionStatus*[Resolved✓,green] PatientImpact[NoAdverseEffect▾] EscalatedTo[—▾]
  EscalationTime[Select time▾]
  Comments[textarea:"Venous pressure normalized after reducing BFR and flushing
           line." 74/300]
  ☐ Notify Nurse/Doctor ⓘ                          [Reset]  [Save Alarm]
"Alarm History(This Session)" table: Time|AlarmType|Severity|Parameter|Duration|
  ActionTaken|Status|ResolvedBy|view    (4 rows shown)   [ViewFullAlarmHistory→]
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: AlarmOverview(3TotalAlarmsThisSession,3Resolved,0ActiveNow,0Escalated) |
  ActiveAlarm(Now)("No Active Alarms — All parameters are within safe limits.") |
  SafetyGuidance("High venous pressure may indicate kinking,clotting,or improper
  needle position. Resolve promptly to prevent treatment interruption." "ViewGuidelines→") |
  QuickActions(ViewMachineParameters,SymptomLog,TreatmentProgress,IncidentReporting)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Record New Alarm form
(4-field row → Alarm Description + Current Value/Threshold/Duration row → Action
Taken/Additional Actions/Resolved By/Resolution Time row → Resolution Status/Patient
Impact/Escalated To/Escalation Time row → Comments + Notify → Reset/Save) → Alarm
History table → Footer → Right rail (Alarm Overview tiles, Active Alarm status, Safety
Guidance, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` Alarm Time, **Alarm Type (dropdown — full taxonomy proposed this
round, via research; only "High Venous Pressure" was ever confirmed in the export,
everything else below is grounded in standard HD machine alarm categories, not
Figma-confirmed):**
- **Blood Circuit:** High Arterial Pressure, Low Arterial Pressure, High Venous
  Pressure (confirmed example), Low Venous Pressure, Air/Foam Detected, Blood Leak
  Detected, Venous Needle Dislodgement (Suspected)
- **Dialysate Circuit:** High Conductivity, Low Conductivity, High Dialysate
  Temperature, Low Dialysate Temperature, Dialysate Flow Fault
- **Ultrafiltration:** High TMP, UF Rate Deviation/System Fault
- **Anticoagulation:** Heparin Pump Fault/Occlusion
- **Power/System:** Power Failure/Interruption, System/Battery Fault
- **Other** (free text) — fallback for anything not covered above

Note: several of these map directly to Safety Protocol-named emergencies already
established elsewhere in this document — Air/Foam Detected and Venous Needle
Dislodgement both correspond to "Air Embolism & Severe Needle Dislodgement";
Blood Leak Detected corresponds to "Exsanguination or Complete Circuit Blood Leak";
Power Failure/Interruption corresponds to "Total Unit Power Failure" — consistent
with, not contradicting, the Critical/Non-Critical Field Classification's treatment
of every P3-07 alarm as Critical-tier by definition.
Severity (dropdown w/ icon — High/Moderate/Low, matching the Alarm History's colored
dots), Related Parameter (dropdown, cross-references P3-03's parameter list), Alarm
Code, Alarm Description, Current Value, Threshold/Limit, Duration (minutes),
**Action Taken (dropdown, full list resolved this round: Reduced BFR, Increased BFR,
Repositioned Patient, Flushed Line, Adjusted UF Rate, Cleared Air/Foam, Reset Alarm
After Correction, Notified Nurse/Physician, Notified Biomedical Engineer, Other)**,
Additional Actions (free text), Resolved By (dropdown), Resolution
Time, **Resolution Status (dropdown, full list resolved this round — directly
answers your earlier question about which alarms this applies to: Resolved,
Ongoing/Unresolved, Escalated — Resolution Time is mandatory only for the Resolved
value; Resolved confirmed green in the example)**, **Patient
Impact (dropdown, full list resolved this round: No Adverse Effect, Mild Discomfort,
Treatment Interrupted, Treatment Terminated Early, Other)**, **Escalated To
(dropdown — corrected this round: populated from an admin-configured escalation
contact list, set up by a facility administrator during platform configuration
[roles: Nurse In-charge, Nephrologist/Physician, Biomedical Engineer, Centre
In-charge], not a hardcoded enum the technician picks from — see the
`escalation_contacts` table, Database Mapping; "—" when not escalated)**, Escalation Time,
Comments (free text, 0/300), Notify Nurse/Doctor (checkbox). **Duration — resolved
this round: read-only, calculated as Resolution Time − Alarm Time, no longer a
manually-entered field.**

**[NEW — dashboard cross-reference]** `event_type` — system-computed, not shown or
editable on this screen, always set to **Machine Alarm** — every row in this table is,
by definition, an alarm; no mapping logic is needed here, unlike P3-04/P3-05.

## Input Types
Time pickers (Alarm Time, Resolution Time, Escalation Time); dropdowns (Alarm Type,
Severity, Related Parameter, Action Taken, Resolved By, Resolution Status, Patient
Impact, Escalated To); numeric (Current Value); **read-only calculated field
(Duration — resolved this round, no longer manual numeric entry)**; free-text (Alarm
Description, Additional Actions, Comments); checkbox (Notify).

## Mandatory Fields
`[FIGMA-DERIVED]` Alarm Time, Alarm Type, Severity, Action Taken, Resolved By,
Resolution Status are asterisked; Related Parameter, Alarm Code, Additional Actions,
Patient Impact, Escalated To, Comments are not — **except** Escalated To becomes
conditionally mandatory when Resolution Status ≠ Resolved (see Validation Rules).
**[NEW — resolved this round]** Resolution Time becomes conditionally mandatory when
Resolution Status = Resolved — required to compute Duration; without this connected
fix, marking Duration as auto-calculated would have been unenforceable, since
Resolution Time itself wasn't previously required.
**Note on Critical/Non-Critical Field Classification (Shared Platform Conventions):**
every alarm reaching this screen is Critical-tier by definition — the screen only
exists because something triggered it — so there's no Non-Critical alarm-record field
to make skippable; the existing mandatory set (documenting what was done and its
resolution) is already the correct Critical-tier requirement, not something needing a
tier split.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` **Never-silence-alarms enforcement:** Save Alarm is
disabled until both Action Taken and Resolution Status are populated — there is no
path to log an alarm as simply "dismissed." If Resolution Status is anything other than
Resolved (e.g., Ongoing/Escalated), Escalated To becomes mandatory — an unresolved
alarm cannot be saved without naming who it was escalated to. **If Resolution Status =
Resolved, Resolution Time becomes mandatory** (resolved this round, needed to compute
Duration). Per the Cross-Screen
Mandatory Adverse Event rule, Resolution Status ≠ Resolved, or Patient Impact ≠ "No
adverse effect," auto-creates a P3-09 draft incident.

## Business Rules
Alarm Overview tiles (Total/Resolved/Active/Escalated) are calculated counts across
this session's Alarm History — not independently maintained.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion —
worth noting alarm handling is the screen where that deferral matters most, since it's
the clearest example of why access must not be cut mid-treatment.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Safety Guidance panel is alarm-type-specific (shown here
for High Venous Pressure) — confirmed dynamic/contextual, same pattern as P3-04's
Clinical Guidance.

## Auto-calculations
**Duration — resolved this round.** Auto-calculates as Resolution Time − Alarm Time,
read-only, no longer manually entered — this required also making Resolution Time
conditionally mandatory (see Mandatory Fields), since Duration can't compute without
it. **[NEW]** `event_type` is set server-side to the fixed constant
`'Machine Alarm'` on every insert — feeds the dashboard's B1/B2 metrics via a `UNION`
across this table, `symptom_intradialytic` (P3-04), and `vascular_access_monitoring`
(P3-05).

## Decision Trees
```
Save Alarm
  ├── Resolution Status = Resolved + Action Taken populated → saved normally,
  │     Alarm Overview counts update
  ├── Resolution Status ≠ Resolved → Escalated To becomes mandatory; on save, Active
  │     Alarm (Now) panel shows this alarm until its status changes to Resolved
  └── Patient Impact ≠ "No adverse effect", or Resolution Status ≠ Resolved →
        auto-incident trigger fires (Cross-Screen Business Rule)
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/alarms` (all fields + recorded_by). `PATCH
/sessions/{id}/alarms/{alarm_id}` to update Resolution Status on an ongoing alarm.

## API Responses
`[PROPOSED]` Echo + updated Alarm Overview counts + `auto_incident_created` if
applicable.

## Database Mapping
`[PROPOSED]` `alarm_log` (session_id, alarm_time, **alarm_type [enum — see Field
Definitions for the full researched taxonomy, replacing free selection]**, severity,
related_parameter, alarm_code, description, current_value, threshold, duration,
action_taken, additional_actions, resolved_by, resolution_time, resolution_status,
patient_impact, **escalated_to [foreign key into `escalation_contacts`, admin-
configured — see Part 4's P4-09 for the shared table definition, not repeated here]**,
escalation_time, comments, notify_flag, recorded_by,
**event_type** [computed, constant: 'Machine Alarm' — see Field Definitions]).

## Audit Events
`alarm_recorded`, `alarm_escalated`, `alarm_resolved`, `auto_incident_triggered` (if
applicable).

## Accessibility
See Shared Platform Conventions.

## Error Handling
Attempting to save without Action Taken/Resolution Status → blocking inline error, per
the never-silence-alarms rule — this is one of the few hard, no-exceptions blocks in
this entire document.

## Empty States
`[FIGMA-DERIVED]` "No Active Alarms — All parameters are within safe limits."
confirmed empty-state pattern (same copy as P3-01/P3-03's Machine Status card, reused
consistently).

## Loading States
Skeleton form + skeleton Alarm History table.

## Offline Behavior
Local draft-save with sync-on-reconnect — though a real alarm is a live, urgent event,
so offline entry should be treated as a fallback, not the expected path; sync priority
should be highest for this table among all Part 3 screens — **[GAP IDENTIFIED, worth
engineering attention]**.

## Acceptance Criteria
Technician cannot save an alarm record without documenting what was done about it,
enforced by the UI, not just written policy.

## Test Cases
Save blocked without Action Taken/Resolution Status; Escalated To becomes required
when Resolution Status ≠ Resolved; Patient-Impact/unresolved-status correctly triggers
the auto-incident rule; Alarm Overview counts recalculate correctly.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; predictive alarm-pattern detection (e.g., recurring
clotting alarms across sessions) is a plausible future direction, subject to human-in-
the-loop labelling.

---

# P3-08 — Treatment Progress

## Screen Objective
`[FIGMA-DERIVED]` "Monitor and track dialysis treatment progress and key parameters"
(screen's own subtitle).

## Clinical Rationale
Provides a consolidated, calculated view of how the session is tracking against its
Part-2-set targets (UF Goal, treatment duration, Kt/V adequacy) — a rollup screen, not
a new data-entry surface, similar in spirit to P3-01 but with more clinical depth and
an events log.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01's "Treatment Progress" quick action or left-rail nav; not a linear
gate — revisited throughout the session to check status.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-08 – Treatment Progress"  subtitle: "Monitor and track dialysis treatment
                                      progress and key parameters."
Patient banner (standard read-only fields).
"Treatment Progress Overview" — 6 ring gauges:
  ElapsedTime(02:35hr:min,of04:00hr,65%Completed) RemainingTime(01:25hr:min,35%Remaining)
  UFTarget(2.5L,Goal,"Set at start") UFAchieved(1.65L,66%oftarget,Achieved)
  BloodProcessed(58.2L,TotalProcessed,Adequate) TreatmentEfficiency(Kt/V)(1.32,Calculated,
    Adequate)
"Treatment Parameters" table: Parameter|CurrentValue|Prescription/Target|Status
  (7 rows: BFR,DFR,UFRate,TMP,VenousPressure,ArterialPressure,DialysateConductivity —
   all "On Target")
"Treatment Interventions/Events" list [+AddEvent]: timestamped entries
  (e.g."09:15AM UF goal adjusted — Adjusted UF goal from 2.5L to 2.5L, RahulSingh")
"Comments"[textarea,0/300]                  "Next Review Time"[11:15AM] ☐NotifyNurse/Doctor
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: Real-timeSummary(SessionStartTime,PlannedDuration,CurrentTime,ElapsedTime,
  RemainingTime,UFTarget,UFAchieved,BloodProcessed,Kt/V(Estimated), "ViewParameterTrends→") |
  ProgressChart(UFAchievedvsUFTarget line chart, "ViewFullTrends→") | ClinicalGuidance
  ("Monitor treatment progress to ensure adequate dose(Kt/V≥1.2)and UF goal achievement.
  Adjust parameters as per patient tolerance." "ViewGuidelines→") | QuickActions
  (ParameterTrends,InterventionLog,AlarmHistory,IncidentReporting)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Treatment Progress Overview
(6 ring-gauge cards) → Treatment Parameters table (7 rows) → Treatment
Interventions/Events log (+ Add Event) → Comments + Next Review Time + Notify → Footer
→ Right rail (Real-time Summary, Progress Chart, Clinical Guidance, Quick Actions).

## Layout Grid
12-column responsive; 6 ring gauges in a single row (or wrapped 3+3); main form ≈8/12,
right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` Elapsed Time, Remaining Time, UF Target, UF Achieved, Blood
Processed, Treatment Efficiency (Kt/V) — all calculated, not entered (see
Auto-calculations). Treatment Parameters table: Blood Flow Rate, Dialysate Flow Rate,
UF Rate, Transmembrane Pressure, Venous Pressure, Arterial Pressure, Dialysate
Conductivity — Current Value pulled live from P3-03, Prescription/Target from P2-04/
P2-05, Status calculated. Treatment Interventions/Events: free-form timestamped log
entries (Add Event). Comments, Next Review Time, Notify Nurse/Doctor.

**[READ-ONLY, CARRIED FROM PART 2]** every "Prescription/Target" column value in the
Treatment Parameters table, and UF Target — none of these are re-entered, they're the
same values set in P2-04/P2-05. **[UPDATED THIS ROUND]** Kt/V (Estimated) on this
screen is read-only and always shows the **most recently completed** measurement — the
actual calculation now happens in Part 4 (P4-04, Treatment Outcome Summary), after
blood return, using this session's own final Post-Dialysis BUN. Mid-session, this
screen can only ever show a *prior* session's Kt/V, never a live number for the
session in progress — that calculation isn't possible until the session ends and P4-04
runs it.

## Input Types
Read-only calculated cards/table (Overview, Parameters); Add Event opens a small
**resolved, reasonable minimal form**: Event Type (dropdown, reusing this
screen's own event categories), Description (free text, 0/200), Time (auto-set to
now, editable) — not shown expanded in the export, so this is inferred, not
confirmed; free-text
(Comments); time picker (Next Review Time); checkbox (Notify).

## Mandatory Fields
None on this rollup screen — Comments/Next Review Time/Add Event are all optional.

## Validation Rules
Any Treatment Parameters row showing off-target → shared checklist failure-state
styling (row highlights, consistent with the rest of this document), cross-referencing
back to P3-03 rather than duplicating validation logic.

## Business Rules
This screen never collects a parameter directly — it always reads from P3-02 (vitals),
P3-03 (machine parameters), and the Part 2 prescription. Add Event is the only true
data-entry action here, for narrative/context events like "UF goal adjusted" or
"Patient repositioned" that don't fit neatly into P3-04 (Symptoms), P3-06
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.
(Medications), or P3-07 (Alarms).

## Clinical Rules
KDOQI's 2015 Hemodialysis Adequacy guideline recommends a **target** single-pool Kt/V
of 1.4 per session for thrice-weekly patients, with a **minimum delivered** spKt/V of
1.2 — the full formula, citations, and monthly-cadence rationale are now specified
once, in Part 4's P4-04, rather than duplicated here.

## Auto-calculations
Elapsed/Remaining Time — same as P3-01. UF Achieved — same cumulative calculation as
P3-03's UF Removed. Blood Processed — same as P3-03's Blood Volume Processed. **Kt/V
(Estimated)** — no calculation happens on this screen; see Part 4, P4-04 for the full
Daugirdas formula (single-pool and equilibrated) and PCR calculation.

## Decision Trees
Add Event → appended to Treatment Interventions/Events log, timestamped and attributed
to the technician. Off-target parameter → shared failure-state styling on that row,
linking back to P3-03 for resolution rather than dual-editing here.

## API Requests
`[PROPOSED]` `GET /sessions/{id}/progress` (aggregate read, same pattern as P3-01's
dashboard endpoint, including kt_v: {value, measured_at} sourced from the patient's
most recent completed `kt_v_assessment` record, wherever session that came from).
`POST /sessions/{id}/events` for Add Event.

## API Responses
`[PROPOSED]` progress {elapsed, remaining, uf_target, uf_achieved, blood_processed,
kt_v {value, measured_at}}, parameters_comparison [...], events [...].

## Database Mapping
`[PROPOSED]` No new primary table beyond `treatment_event_log` (session_id, event_time,
event_type, description, recorded_by) for Add Event — the `kt_v_assessment` table now
lives under Part 4's P4-04, this screen only reads the patient's latest record from it.

## Audit Events
`treatment_progress_viewed`, `event_added`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
**Resolved.** Kt/V calculation unavailable (no lab data integrated) → shows "Not
available" rather than a fabricated or zero value. The formula decision this was
pending on is done (Daugirdas equation, confirmed and relocated to P4-04) — this
tag is now just stating the display behavior, not waiting on anything further.

## Empty States
Treatment Interventions/Events empty state (no events logged yet) — **Resolved** — "No events logged this session," consistent with the rest of this
document's empty-state conventions. Not captured in this export.

## Loading States
Skeleton ring gauges + skeleton table + skeleton event log.

## Offline Behavior
Last-synced values shown with a visible timestamp, consistent with the rollup/
read-mostly nature of this screen.

## Acceptance Criteria
Technician can assess whether the session is on-track against its Part-2-set targets
within 10 seconds of opening this screen.

## Test Cases
Ring gauges recalculate correctly as new P3-02/P3-03 data arrives; Add Event correctly
appends to the log; off-target parameter row correctly flags.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; predictive "will this session hit its UF goal at the
current rate" projection is a plausible fit here, subject to human-in-the-loop
labelling.

---

# P3-09 — Incident & Event Reporting

## Screen Objective
`[FIGMA-DERIVED]` "Document any incident, adverse event or unusual occurrence during
dialysis" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §4 "Mandatory Adverse Event
Documentation" — this is the screen that rule points to. See the Cross-Screen Business
Rule at the top of this document for how P3-04/05/06/07 auto-populate drafts here
rather than requiring duplicate manual entry.

## Users
Dialysis Technician (primary, can create/edit); Nurse, Nephrologist (view, can
escalate/resolve).

## Navigation
Reached from P3-01/left-rail nav, or automatically opened/flagged when the
Cross-Screen Mandatory Adverse Event rule fires from another screen.

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P3-09 – Incident & Event Reporting"  subtitle: "Document any incident, adverse
                                              event or unusual occurrence during
                                              dialysis."
Patient banner (standard read-only fields).
"Report New Incident / Event"
  EventTime*[10:35AM] IncidentType*[Hypotension▾] EventCategory*[Clinical▾]
  Severity*[Low|Moderate|High]
  DescriptionofIncident*[textarea:"Patient developed hypotension(BP dropped to
    82/48mmHg)with dizziness and nausea." 92/500]
  SuspectedCause(ifknown)[UFratetoohigh▾]        EventTime(Observed)[10:30AM]
  Intervention/ActionTaken*[UFratereduced▾]
  InterventionDetails[textarea:"UF rate reduced from 800 to 500mL/hr. NS100mLbolus
    given." 63/300]
  Outcome/PatientStatus*[Stabilized▾]
  EscalatedTo[NurseIn-charge▾]  EscalationTime[10:38AM]
  FurtherActionRequired[No▾]    Follow-upRequired[Yes▾]
  ResolvedBy[RahulSingh(Technician)▾]  ResolutionTime[10:55AM]
  Comments/AdditionalNotes[textarea:"BP stabilized to110/64mmHg. Patient comfortable
    and resting." 64/300]
  ☑NotifyNurse/Doctor ⓘ                            [Reset]  [Save Incident]
"Recent Incidents(ThisSession)": (3 cards, each with time,type,severitybadge,
  resolved-time)                                              [ViewAll→]
Footer: [←Back] [Save as Draft] [Save & Continue→]
Right rail: IncidentOverview(2ThisSession,1Open,1Resolved,0Escalated) |
  SafetyReminder("Report all incidents immediately and take appropriate action to
  ensure patient safety." "ViewReportingGuidelines→") | QuickActions(ViewPatientSummary,
  AlarmHistory,TreatmentProgress,VascularAccessDetails)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → Patient Banner → Report New Incident form
(Event Time/Incident Type/Event Category/Severity row → Description → Suspected
Cause/Event Time Observed → Intervention/Action Taken + Details → Outcome/Patient
Status → Escalated To/Escalation Time → Further Action/Follow-up → Resolved By/
Resolution Time → Comments + Notify → Reset/Save) → Recent Incidents cards → Footer →
Right rail (Incident Overview tiles, Safety Reminder, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` Event Time, **Incident Type (dropdown, full list resolved this
round — matches this screen's own 5 named Safety Protocol §4 triggers exactly:
Severe Hypotension/Syncope, Patient Fall, Vascular Access Needle Infiltration/Blood
Loss, Medication Error, Machine Malfunction, Other)**, **Event Category (dropdown,
full list resolved this round: Clinical, Technical, Administrative — Clinical was the
only value shown in the export)**,
Severity (Low/Moderate/High), Description of Incident (free text, 0/500), **Suspected
Cause (dropdown, full list resolved this round: UF Rate Too High, Needle Position
Issue, Clotting, Kinked Line, Equipment Malfunction, Patient Movement, Medication
Error, Communication Gap, Unknown, Other)**, Event Time (Observed — distinct from
Event Time, allowing a
retrospective log), **Intervention/Action Taken (dropdown — reuses the same list
resolved for P3-04, for consistency across the document: Positioned Patient/
Trendelenburg, Reduced or Stopped UF Rate, Administered Saline Bolus, Administered
Medication, Notified Nurse/Physician, Reassured Patient, Continued Monitoring,
Other)**, Intervention Details (free
text, 0/300), **Outcome/Patient Status (dropdown, full list resolved this round:
Stabilized, Resolved - No Harm, Resolved - Required Intervention, Ongoing Monitoring,
Transferred/Escalated, Deceased, Other)**, **Escalated To (dropdown — corrected this
round, same fix as P3-07: populated from the same admin-configured
`escalation_contacts` table, not a hardcoded enum; "—" when not escalated)**, Escalation
Time, Further Action Required (Yes/No), Follow-up Required (Yes/No), Resolved By
(dropdown), Resolution Time, Comments/Additional Notes (free text, 0/300), Notify
Nurse/Doctor (checkbox, confirmed checked in this export).

**[NEW — pre-population fields per the Cross-Screen Business Rule]** `source_screen`
and `source_record_id` (hidden/system fields, not shown in the Figma) — when this
record is auto-created from P3-04/05/06/07, these link back to the triggering record so
the technician isn't asked to re-describe an event they already documented elsewhere.

## Input Types
Time pickers (Event Time, Event Time Observed, Escalation Time, Resolution Time);
dropdowns (Incident Type, Event Category, Suspected Cause, Intervention/Action Taken,
Outcome/Patient Status, Escalated To, Further Action Required, Follow-up Required,
Resolved By); 3-way severity toggle; free-text (Description, Intervention Details,
Comments); checkbox (Notify).

## Mandatory Fields
`[FIGMA-DERIVED]` Event Time, Incident Type, Event Category, Severity, Description of
Incident, Intervention/Action Taken, Outcome/Patient Status are asterisked; the rest
are not, **except** Escalated To/Escalation Time become conditionally mandatory when
Further Action Required = Yes.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` This screen is the terminus of the Cross-Screen Mandatory
Adverse Event rule — no additional gating beyond the standard mandatory-field set,
since the safety-critical response already happened on the triggering screen
(P3-04/05/06/07); this screen's job is complete documentation, not a second safety
gate.

## Business Rules
When auto-created from another screen, Event Time, Description, and
Intervention/Action Taken pre-populate from the source record (see Field Definitions);
the technician reviews and completes Escalation/Outcome/Follow-up rather than
re-entering the clinical narrative.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion; the incident record itself (clinical narrative)
is not anonymized, only the patient banner's PII fields.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Directly implements Safety Protocol §4's five named
mandatory-documentation triggers (severe hypotension/syncope, falls, needle
infiltration/blood loss, medication errors, machine malfunctions) via the Cross-Screen
Business Rule.

## Auto-calculations
Incident Overview tiles (This Session/Open/Resolved/Escalated) are calculated counts
across Recent Incidents.

## Decision Trees
```
Incident manually created, OR auto-created via Cross-Screen Business Rule trigger
  ├── Further Action Required = Yes → Escalated To/Escalation Time become mandatory
  └── Save → appended to Recent Incidents; Incident Overview counts update;
        if source_record_id is set, the triggering screen's record is linked/marked
        as "incident filed" — **UI treatment confirmed: a toast with a direct link
        appeared on the source screen at creation time (see Cross-Screen Business
        Rule — Mandatory Adverse Event Auto-Incident Trigger); this is that same
        auto-incident, now being completed here**
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/incidents` (all fields, optionally including
source_screen/source_record_id when auto-created).

## API Responses
`[PROPOSED]` Echo + updated Incident Overview counts.

## Database Mapping
`[PROPOSED]` `incident_report` (session_id, event_time, incident_type, event_category,
severity, description, suspected_cause, event_time_observed, intervention,
intervention_details, outcome, **escalated_to [foreign key into `escalation_contacts`,
same admin-configured table as P3-07/P4-09]**, escalation_time, further_action_required,
follow_up_required, resolved_by, resolution_time, comments, notify_flag, source_screen
nullable, source_record_id nullable, recorded_by, recorded_at).

## Audit Events
`incident_created` (manual or auto, distinguished by a flag), `incident_escalated`,
`incident_resolved`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Further Action Required = Yes without Escalated To → inline validation error.

## Empty States
**Resolved** — "No incidents this session." Not captured in this export
(the example shows 2 incidents); recommend consistent with this document's other
empty-state copy.

## Loading States
Skeleton form + skeleton Recent Incidents cards.

## Offline Behavior
Local draft-save with sync-on-reconnect; same high-priority-sync recommendation as
P3-07, given the safety-reporting stakes.

## Acceptance Criteria
Every Safety-Protocol-named mandatory-documentation trigger produces a filed incident
report, whether created manually or automatically — none should be silently missed.

## Test Cases
Auto-creation from each of P3-04/05/06/07's trigger conditions correctly pre-populates
this form; Further Action Required = Yes correctly requires Escalated To; Incident
Overview counts recalculate correctly.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; incident-pattern analysis across sessions (e.g.,
recurring hypotension for a given patient) is a plausible future direction, subject to
human-in-the-loop labelling.

---

# P3-10 — Treatment Completion (Slimmed — patched this round)

## Decision Log (this screen)
**Restructured per your instruction.** This screen previously duplicated what Part 4
(P4-01 through P4-10) now does in far more depth — a 7-item completion checklist,
full Post Dialysis Vitals, Patient Disposition, and a Kt/V/BUN calculation. All of
that has been **removed from this screen and now lives in Part 4**, where it belongs
(P4-01–P4-03 for blood return/hemostasis/vitals, P4-04 for Kt/V and adequacy). This
screen is now a genuine one-time terminal gate — the exact role P2-12 played ending
Pre-Dialysis — nothing more. The **Post-Dialysis BUN and Kt/V Assessment fields added
to this screen in the previous round are withdrawn**; the corresponding addendum on
P2-05 (Pre-Dialysis BUN) stays in place, since Pre-Dialysis BUN is still needed — it
now feeds P4-04's calculation instead of this screen's.

## Screen Objective
`[FIGMA-DERIVED]` "Finalize dialysis session, review outcomes and log completion"
(screen's own subtitle) — narrowed, per the restructuring above, to mean *end the
During-Dialysis stage and hand off to Post-Dialysis*, not *complete all post-treatment
documentation*.

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3 "POST-DIALYSIS (Termination)" governs
blood return, hemostasis, discharge vitals, and disposition — but per this
restructuring, **this document's role stops at handing off to Part 4**, which now owns
implementing §3 in full. This screen's only remaining job is confirming the technician
is ready to leave the During-Dialysis stage.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from P3-01's End Treatment button, or from any screen's left-rail nav.
Complete Session routes into **Part 4, P4-01 (Blood Return & Treatment Termination)**
— not a terminal screen for the whole patient journey, just for this document.

## Wireframe
`[FIGMA-DERIVED, simplified]`
```
Title: "P3-10 – End Treatment"  subtitle: "Confirm treatment is ending and proceed to
                                 post-dialysis documentation."
Patient banner (standard read-only fields).
[amber, if any During-Dialysis screen has an unresolved item] "Before ending treatment,
  review: [list of unresolved alarms/incidents/symptoms, each linking back to its
  source screen]"
"Ready to End Treatment?"
  Session Duration So Far: 03:35 hr    UF Removed So Far: 1.65 L
  ☑ I confirm the patient's blood return and treatment termination are ready to begin.
Footer: [← Back]  [End Treatment & Proceed to Post-Dialysis →]
```

## UI Component Tree
`[FIGMA-DERIVED, simplified]` Top Bar → Page Header → Patient Banner → unresolved-items
summary (conditional) → confirmation checkbox → Footer (Back, End Treatment & Proceed).

## Layout Grid
12-column responsive, single-column form — this screen no longer needs the 2-column
main-form/right-rail layout the detailed version had.

## Field Definitions
Session Duration So Far, UF Removed So Far (both read-only, live from P3-08/P3-03) —
confirmation checkbox. **[REMOVED THIS ROUND]** Completion Checklist, Post Dialysis
Vitals, Patient Disposition, Kt/V Assessment — all moved to Part 4.

## Input Types
Read-only summary fields; confirmation checkbox; Back/End Treatment buttons.

## Mandatory Fields
Confirmation checkbox must be checked.

## Validation Rules
`[DESIGN SPECIFICATION]` End Treatment & Proceed disabled until the checkbox is
checked. Unlike the prior version, **no longer blocks on a 7-item checklist** — that
gating now happens naturally across P4-01 through P4-03 instead.

## Business Rules
This screen no longer collects clinical data — it's a pure stage-transition gate,
consistent with P2-12's role for Pre-Dialysis → During-Dialysis.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(extended to Part 3, now organization-scoped — see that section). A user whose
organization's consent is revoked is blocked from this screen, regardless of role;
Kifayti-level revocation shows the anonymized patient banner. Mid-session, per the
rule's deferral clause, access continues uninterrupted until Treatment Completion.

## Clinical Rules
None directly — inherited from whichever During-Dialysis screen contributed an
unresolved-item summary, if any.

## Auto-calculations
Session Duration So Far, UF Removed So Far — same live calculations as P3-01/P3-08,
just read here.

## Decision Trees
Confirmation checked → End Treatment & Proceed → session status transitions to
"Terminating" (a new intermediate status, distinct from "Running" and the eventual
"Completed" set on Part 4's own terminal screen) → opens P4-01.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/end-treatment` (confirmed_by, confirmed_at) — much
lighter than the previous version's payload.

## API Responses
`[PROPOSED]` session_id, status: "terminating", redirect_target: P4-01.

## Database Mapping
`[PROPOSED]` `session` (status → 'terminating', end_treatment_confirmed_by,
end_treatment_confirmed_at). The `kt_v_assessment` table proposed here last round is
**withdrawn** — see the equivalent table now proposed under Part 4's P4-04.

## Audit Events
`end_treatment_confirmed`.

## Accessibility
See Shared Platform Conventions.

## Error Handling
Unresolved-item summary fetch failure → toast, doesn't block proceeding (this is an
informational aid, not a gate).

## Empty States
No unresolved items → the amber summary panel simply doesn't render.

## Loading States
Skeleton summary fields.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician can end treatment and move into Post-Dialysis documentation in under 10
seconds when there's nothing outstanding to review.

## Test Cases
Unresolved-item summary correctly lists and links back to source screens; End
Treatment blocked until checkbox is checked; session status transitions correctly.

## Future AI Enhancements
None specified.

---

# Open Items Needing Confirmation (all 10 screens, consolidated)

**From the two key decisions at the top of this document:**
1. **P3-03 Version 2 chosen as authoritative** — confirmed by you to be a "best logical
   decision" call; the five tabs beyond Overview (Pressures/Flows/Dialysate/
   Ultrafiltration/Advanced Parameters) have inferred-not-confirmed content.
2. **Non-linear hub navigation model adopted** — confirmed by you; "Save & Continue"
   label wording on each screen should be reviewed against this model during build
   (some screens' buttons may need relabeling to "Save & Return to Dashboard" per
   Decision 2, not literally "Continue" to a fixed next screen).

**Cross-screen:**
3. ~~Auto-incident trigger's exact UI treatment on the *source* screen
   (P3-04/05/06/07)~~ — **RESOLVED.** A toast notification with a direct link to the
   newly-created P3-09 draft, non-blocking, persists ~8 seconds (longer than a
   standard confirmation toast, so it isn't missed). Technician isn't force-routed —
   they can continue their current workflow and follow the link when convenient.

**Per-screen, genuinely new this pass:**
4. ~~P3-02: overdue-vitals escalation behavior and its time threshold~~ — **RESOLVED.**
   Full mechanism specified: 5-state escalation (Scheduled/Overdue/Resolved-Late/
   Skipped/Missed-Auto), consolidated cross-session popup with Skip/Skip All + optional
   reason, permanent compliance-% drop and nephrologist alert on Skip or 20-minute
   no-response timeout. See the new Cross-Screen Business Rule — Overdue Vitals
   Escalation.
5. ~~P3-02: auto-check-and-disable Notify checkbox on Critical reading~~ — **RESOLVED.**
   Confirmed: auto-checks and permanently locks, cannot be unchecked.
6. ~~P3-03: content of the 5 non-Overview tabs~~ — **RESOLVED, inferred per your
   instruction.** Each tab shows the relevant Overview parameters in detail plus one
   or two standard additions (Access Pressure, Recirculation %, Sodium/Bicarbonate,
   projected time-to-UF-goal, online clearance/Kt/V estimate) — all explicitly tagged
   inferred, not Figma-confirmed, with "Not Available" required rather than a
   fabricated value where a machine doesn't support an inferred addition.
7. ~~P3-03: TMP exact Warning/Critical thresholds~~ — **RESOLVED via research.**
   Normal 20–60 mmHg, Warning 61–299 mmHg, Critical ≥300 mmHg — this also corrected
   the worked example (380 mmHg) from Warning to Critical throughout the screen.
8. ~~P3-04: Bleeding symptom → event_type mapping~~ — **RESOLVED.** A conditional
   "Is this access-site related?" toggle appears when Symptom = Bleeding; Yes routes
   to Access Complication, No stays Other.
9. ~~P3-05: CVC branch~~ — **RESOLVED.** Built as a during-dialysis adaptation of
   P2-07's confirmed CVC fields, plus catheter-specific monitoring additions
   (Catheter Connection Security, Kinking/Clamping Issues) — 9 rows, 6 Critical/3
   Non-Critical, matching the AVF/AVG table's structure.
10. ~~P3-05: Access Health Indicator's exact scoring formula~~ — **RESOLVED via
    research.** No validated per-exam percentage formula exists in the literature;
    the gauge is derived directly from Overall Access Status (Good=95–100%, At
    Risk=50–75%, Not Functional=0–25%) rather than an independently invented 9-row
    weighted formula.
11. ~~P3-06: expired-lot handling~~ — **RESOLVED.** Hard block, confirmed — Save
    Medication is disabled entirely for an expired Expiry Date, no override path.
12. ~~P3-07: whether Duration should be calculated from timestamps rather than
    manually entered~~ — **RESOLVED.** Auto-calculates as Resolution Time − Alarm
    Time, read-only. This surfaced a connected gap fixed at the same time: Resolution
    Time itself wasn't previously mandatory, so it's now conditionally mandatory
    whenever Resolution Status = Resolved.
12a. ~~P3-07: Alarm Type's full option list~~ — **newly discovered and RESOLVED in
    the same pass.** Only "High Venous Pressure" was ever confirmed in the export;
    no other alarm type was ever named anywhere in the source material, despite the
    field being a dropdown. A full researched taxonomy (17 types across Blood
    Circuit/Dialysate Circuit/Ultrafiltration/Anticoagulation/Power-System, plus
    Other) is now specified, grounded in standard HD machine alarm categories, not
    Figma-confirmed. Also clarified: alarms here are technician-logged after
    observing the physical machine, not a live machine-integration feed — same
    "manually fed" pattern as P3-03.
13. ~~P3-08/P3-10: Kt/V calculation method~~ — **RESOLVED, then relocated.** The
    Daugirdas formula work still stands, but per your instruction the whole mechanism
    (Post-Dialysis BUN entry, Calculate Kt/V action, and now also Kt/V-Equilibrated and
    PCR) has moved to **Part 4, P4-04** — see that document. P3-08 now only displays
    the patient's most recent completed measurement, read-only.
14. ~~P3-10: missing Post-Treatment Access Assessment~~ — **CLOSED.** Part 4's P4-02
    (Vascular Access Hemostasis) implements Safety Protocol §3.C in full.
15. ~~P3-10: Weight Variance vs. Dry Weight~~ — **relocated to Part 4**, see that
    document's open items for its current status.
16. ~~P3-10: Completion Checklist~~ — **superseded.** P3-10 no longer has a completion
    checklist; that responsibility moved to Part 4's P4-01–P4-03 in full.

**Cross-document dependency — still applies:**
17. The **Pre-Dialysis BUN** field added to P2-05 (Part 2) remains necessary — it now
    feeds Part 4's P4-04 calculation instead of P3-10's (withdrawn) one. No further
    action needed here; this note is kept for traceability.

None of items 3–10 block using this document as your coding reference — consistent
with the Part 2 pattern, they're specific implementation questions now written down
instead of discovered mid-sprint.

# Self-check
Every `[FIGMA-DERIVED]` claim was read directly from the eleven provided images.
Decisions 1 and 2 are both grounded in specific, cited Safety Protocol clauses (§2.A's
Active Controls checklist; §2.B's repeated-interval monitoring cadence), not aesthetic
preference — the reasoning for each is stated in full at the top of this document, not
asserted without support. The Cross-Screen Mandatory Adverse Event rule quotes Safety
Protocol §4 directly and maps each of its five named triggers to a specific field
condition on a specific screen, rather than a vague "sometimes this creates an
incident." Every field checked against Part 2 for redundancy is listed explicitly under
"Redundancy check against Part 2" and tagged **[READ-ONLY, CARRIED FROM PART 2]**
wherever it recurs on a screen, rather than silently re-specified as a fresh input. No
API path, database column, or audit-log field is asserted as confirmed fact — all such
content remains tagged `[PROPOSED]`. The Kt/V formula (item 10) is the peer-reviewed
Daugirdas second-generation equation, verified against Daugirdas' original 1993 paper,
its LOINC registration, and the two calculators you named — not an invented
approximation — and its worked-example numbers were checked against Omnicalculator's
own published example before being written into this document as a regression test.
This is an engineering/documentation cross-check
against the specific reference material provided, not a legal or clinical compliance
certification.

**Compliance-audit pass (this round):** three gaps found by the Compliance &
Architecture Audit (against the Kifayti Health Compliance Bible v1.1, DPDP/HIPAA/ABDM
sections) — offline-cache encryption, sensitive-field role scoping, and ABDM
consent-revocation anonymization — were all traced to the same root cause: Part 3's
Shared Platform Conventions named only a partial carry-forward list from Part 2 and
predated Part 2's own compliance-audit resolutions. All three are now named explicitly
in Part 3's Shared Platform Conventions, and the consent-revocation rule is fully
extended (not just pointed-to) as its own Cross-Screen Business Rule, cross-referenced
from all 10 screens' Business Rules sections, each verified present with a targeted
search after writing it. One new question this pass surfaced that Part 2's version of
the rule didn't need to answer: how to handle a consent revocation during an active
treatment session (P3 has no equivalent of Part 2's "not yet started" state).

**Follow-up round (same session):** per your direct instruction, the consent-revocation
rule was entirely re-modeled from role-based to organization-scoped — identical change
to Part 2's — plus a During-Dialysis-specific deferral rule: an in-progress session is
never interrupted by a consent revocation (organization-scoped block or Kifayti-level
anonymization alike); the effect is deferred until Treatment Completion (P3-10), then
applies going forward from Part 4 onward. This resolves both open items from the prior
round (Nurse role treatment, mid-session handling) rather than leaving either open —
mid-session handling specifically was answered by you directly, not inferred. All 10
screens' pointer notes and the Cross-Screen Business Rule itself were rewritten to
match, each verified present with a targeted search after writing it, and nothing was
written to any output file until this model was confirmed with you, per your standing
instruction.
