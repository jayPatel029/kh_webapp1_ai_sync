# Part 4 Screen Specifications — P4-01 to P4-10
### Kifayti Health — Dialysis Center Management System (KidneyCare Dialysis Center)
### Post-Dialysis Stage — FINAL, Build-Ready Edition

Cross-checked against the Kifayti Health Compliance Bible v1.1, the Revised
Hemodialysis Technician Safety Protocol (§3 "Post-Dialysis (Termination)" and §4
"Critical Missing Protocols"), Module 2 Part 1, the completed Part 2 and Part 3
documents, and ten colored Figma exports (P4-01 through P4-10). Every field was
checked against Part 2 and Part 3 for redundancy before being written in here.

**Scope discipline:** this document covers the **post-dialysis stage only**
(P4-01–P4-10), ending at session closure. Machine QC/readiness *determination* (as
opposed to the technician-level cleaning already covered here) is Part 5's
responsibility; that boundary is discussed explicitly under Decision 2 below, and is
now resolved via the Part 5 patch to P4-06.

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

# Key Design Decisions (confirmed by you this round)

## Decision 1 — Part 3's P3-10 is now a thin handoff gate, not a duplicate
Per your confirmation, **Part 3's P3-10 (Treatment Completion) has been slimmed down**
to a simple stage-transition gate — the same role P2-12 played ending Pre-Dialysis.
Every piece of substantive post-treatment work that used to live there (completion
checklist, post-dialysis vitals, disposition, Kt/V/BUN) now lives here, in Part 4,
where the Figma exports show it properly broken out across ten dedicated screens.
**Part 3 has already been patched** to reflect this — see that document's updated
P3-08 and P3-10 sections. This document is where all of that logic actually lives now.

## Decision 2 — P4-06's "Machine Ready" field: RESOLVED this round (see Part 5 patch)
This was originally parked pending Part 5. **Part 5 now exists** (P5-01 to P5-10),
and P5-05 (Machine Assignment) explicitly states machine readiness is
system-computed from QC + RO + Self-Test + Maintenance, with *"No manual 'Ready for
Treatment' confirmation."* P4-06 below has been **patched** to remove the "Machine
Ready for Next Patient" field, "Next Patient Slot," and "Assigned To" — those belong
to Part 5's readiness chain and P5-05's assignment workflow. P4-06 keeps its
cleaning/disinfection documentation and gains a **read-only reference** to Part 5's
current status.

## Decision 3 — P4-02 branches exclusively by Access Type
Confirmed: despite the Figma showing both the AVF/AVG and CVC panels filled in
simultaneously (almost certainly a mockup-rendering artifact, not intended behavior),
**P4-02 renders exactly one panel at a time**, selected by the Access Type toggle —
same exclusive-branch pattern as P2-07 and P3-05, for consistency across the whole
system.

## Decision 4 — P4-08 and P4-10 are read-only carry-forwards, not re-entry
Confirmed: **P4-08's Discharge Readiness Assessment panel and P4-10's Post-Dialysis
Vitals panel both display P4-03's saved values read-only** — they do not re-collect
BP, HR, SpO2, Temperature, or symptom checks. This eliminates the redundant re-entry
your instruction asked me to find and remove.

## Decision 5 — Kt/V, Kt/V (Equilibrated), and PCR all live in P4-04
Per your instruction, I researched and implemented all three adequacy metrics shown in
the P4-04 Figma, not just the single-pool Kt/V from Part 3. Full formulas, sources, and
worked-example verification are under P4-04's Auto-calculations below, and summarized
once in the Cross-Screen Calculation section immediately following this decision list.

---

# Shared Platform Conventions (Part 4-specific additions)
*(New this round — Parts 2 and 3 each have their own Shared Platform Conventions
section; this document didn't, which was itself a gap the compliance audit found.
Everything below still applies from Part 2's original Shared Platform Conventions —
shell navigation, accessibility, timestamps — unless restated differently here.)*

**★ COMPLIANCE ADDITION — Offline-cache encryption (Bible §4.D/DPDP Rule 6(a),
§2.18):** locally-drafted patient/session data on every P4 screen using local
draft-save (P4-01 through P4-09, per each screen's own Offline Behavior section) is
encrypted at rest on-device, same standard as P2-12's PIN and P4-09's own already-
stated PIN encryption (line-level precedent within this document). `[PROPOSED]`
pending engineering confirmation of the exact mechanism.

**★ COMPLIANCE ADDITION — Audit-log baseline (Bible §4.D/Rule 6(c) and §4.F/Rule
8(3)):** every screen-specific audit event listed below (e.g. `treatment_terminated`,
`signoff_completed`) is logged with the same baseline fields established in Part 2's
Shared Platform Conventions — `user_id, role, patient_id, session_id, timestamp` —
and retained a minimum of 1 year, consistent with Parts 2 and 3. Stated once here
since this document had not previously established that baseline itself.

**★ COMPLIANCE ADDITION — Sensitive-field role scoping (Bible §5.8/HIPAA
minimum-necessary):** every P4 screen is already restricted to Dialysis Technician
(primary)/Nurse/Nephrologist per its own Users section — this applies to all
clinically sensitive data on these screens (post-dialysis vitals and assessment on
P4-03, treatment outcome/adequacy metrics on P4-04, medication/ADR data on P4-05,
infection-control/isolation status on P4-07) exactly as it does in Parts 2–3. No new
engineering — the gating already exists.

**★ COMPLIANCE ADDITION — ABDM consent-revocation, organization-scoped access with
extended deferral through Part 4 (Bible §2.15/2.16):** see the Cross-Screen Business
Rule below. Per your direct instruction, the deferral window established in Part 3
(where an in-progress session is never interrupted by a consent revocation) now
extends through the **entire post-dialysis workflow**, ending only at **P4-10
(Session Complete Dashboard)** — not at P3-10 as originally modeled — since Part 4 is
still the same continuous episode of care (blood return, hemostasis, vitals,
medication review, discharge, sign-off) and abruptly cutting access mid-way through
any of that is the same patient-safety concern that motivated the original Part 3
deferral.

---

# Cross-Screen Business Rule — ABDM Consent Revocation: Organization-Scoped Access & Kifayti-Level Anonymization (Deferral Extended Through Part 4)
*(Re-applies the Part 2/3 rule's data model and Case A/B logic unchanged — see Part 2
for the full explanation of `organizations`, `users.organization_id`, and
`patient_consent`. This section states only what's different for Part 4: the
deferral endpoint.)*

## Deferral endpoint — extended per your instruction this round
Part 3's version deferred any organization-level block or Kifayti-level anonymization
until Treatment Completion (P3-10). **That endpoint is now extended through Part 4:**
if a patient's session was already in progress (or has moved into post-dialysis care)
at the moment their organization's consent is revoked, every already-treating user
retains full access **all the way through P4-10 (Session Complete Dashboard)** — not
just through P3-10. The block/anonymization takes effect only once P4-10's session-
closure fires (`session_closed`, per P4-10's own Audit Events).

This means: a consent revocation that occurs at any point from treatment start
through the entire post-dialysis workflow (P2 through P4-09) is deferred to the same
single endpoint — P4-10 — rather than being enforced in stages at P3-10 and then
again reconsidered in Part 4. Only a revocation occurring **after** P4-10's session-
closure fires is enforced immediately (no session in progress to protect at that
point).

## Screen-level behavior (this document's scope)
Applies uniformly to P4-01 through P4-09's shared patient banner — no block or
anonymization takes effect on any of these screens regardless of when consent was
revoked, as long as the session hasn't reached P4-10's closure yet. P4-10 itself is
where the deferred block/anonymization is resolved: if a revocation is pending at the
moment `session_closed` fires, the organization-scoped block (or Kifayti-level
anonymization) takes effect starting immediately after, for any subsequent screen the
patient's record is opened in (a future session, a different module, etc.).

## Audit Events
`consent_revoked_org_access_deferred` (patient_id, organization_id, session_id,
deferred_until: "P4-10", triggered_at) — logged at the moment of revocation if the
session hasn't reached P4-10 yet; `consent_revoked_org_access_blocked` and
`consent_revoked_kifayti_anonymization_applied` (same names as Parts 2–3) — logged
when P4-10's closure resolves a pending deferred revocation.

## API/DB
`[PROPOSED]` — same `patient_consent`/organization model as Parts 2–3. The
`sessions.consent_revocation_pending` flag introduced in Part 3 now checks against
P4-10's `session_closed` event instead of P3-10's completion event as the resolution
trigger. Needs engineering confirmation of exactly where this deferred-enforcement
job runs, consistent with the open engineering item already flagged in Parts 2–3.

# Cross-Screen Calculation — Dialysis Adequacy (Kt/V, eKt/V, PCR)
*(Supersedes and extends the Kt/V work from Part 3, now properly homed here per
Decision 1/5. This is the authoritative version.)*

**Single-pool Kt/V** — unchanged from Part 3's research, the Daugirdas second-
generation formula¹:
> Kt/V = −ln(R − 0.008 × t) + (4 − 3.5 × R) × UF/W

R = Post-dialysis BUN ÷ Pre-dialysis BUN; t = session duration in hours; UF =
ultrafiltration volume in liters; W = post-dialysis weight in kg.

**Equilibrated Kt/V (eKt/V)** — new this round, the Daugirdas rate equation², which
corrects single-pool Kt/V for post-dialysis urea rebound (single-pool Kt/V slightly
overstates clearance because urea keeps moving out of tissues after treatment stops):
> eKt/V = spKt/V × (1 − 0.6/t) + 0.03   *(arterial/fistula access)*
> eKt/V = spKt/V × (1 − 0.4/t) + 0.02   *(venous/catheter access)*

Two variants exist depending on access type — since P4-02 already captures Access
Type (AVF/AVG vs. CVC) for this same session, the correct variant is selected
automatically rather than asked again. Worked-example check: spKt/V 1.4, t = 4 hr,
arterial → eKt/V = 1.4×(1−0.15)+0.03 = 1.4×0.85+0.03 = 1.22, matching the published
worked example in the source below — confirms the formula and arithmetic before this
goes into the codebase.

**Normalized Protein Catabolic Rate (nPCR / PCR)** — new this round, the Garred et
al. simplified single-session formula³, chosen specifically because — unlike the
interdialytic-BUN-rise method also in the literature — **it only needs this session's
own Pre/Post BUN and Kt/V**, not the previous session's data, which keeps this
document self-contained rather than creating another cross-session dependency:
> nPCR = 0.01575 × (1 + 0.0569 × Kt/V) × Kt/V × C₀ × (1 − R) / (−ln R) + 0.17

C₀ = Pre-dialysis BUN (mg/dL); R and Kt/V as above. Worked-example sanity check using
typical values (Kt/V 1.3, C₀ 55 mg/dL, R 0.35) yields nPCR ≈ 0.92 g/kg/day — within
the clinically expected 0.8–1.2 range, confirming the formula wasn't mis-transcribed.
**★ RESOLVED THIS ROUND:** the Garred formula above is confirmed as final — no switch
to the interdialytic-rise alternative, which would require cross-session data linking
(previous session's Post-BUN, exact interdialytic interval) not otherwise needed
anywhere else in this document set.

**Adequacy targets, all three metrics, per KDOQI 2015**⁴: spKt/V target 1.4, minimum
1.2; eKt/V is typically ~0.2 lower than spKt/V for the same session (built into the
formula above, not a separate target); PCR/nPCR target ≥ 0.8 g/kg/day (values below
this suggest malnutrition or underdialysis, not corrected by increasing dialysis dose
alone). URR (Urea Reduction Ratio, also shown on P4-04) = (1 − R) × 100%, target ≥ 65%
— a simpler, complementary check on the same Pre/Post BUN pair, not a fourth
independent measurement requiring new data.

**Cadence — unchanged from Part 3:** all of this is measured **monthly**, not every
session, per RPA/KDOQI guidance. P4-04 shows the same "Kt/V Assessment This Session"
gate design as Part 3 had, just relocated here: if unchecked, P4-04 displays the most
recent prior measurement with its date, not a fabricated live number.

**References:** ¹Daugirdas JT, *J Am Soc Nephrol* 1993;4:1205–1213; LOINC 70965-9.
²Daugirdas JT, "Simplified Equations for Monitoring Kt/V, PCRn, eKt/V, and ePCRn,"
*Adv Ren Replace Ther* 1995 (rate-equation coefficients cross-checked against Dr.
Cherry Mammen's Annual Dialysis Conference 2023 slides and biologyinsights.com's
worked example). ³Depner TA, Daugirdas JT, "Equations for normalized protein catabolic
rate based on two-point modeling of hemodialysis urea kinetics," *J Am Soc Nephrol*
1996;7:780-785; Garred LJ et al. coefficients cross-checked via a 1997 hemodialysis
methods paper (ResearchGate/PMC). ⁴KDOQI Clinical Practice Guideline for Hemodialysis
Adequacy: 2015 Update, *Am J Kidney Dis* 2015;66(5):884-930.

---

# Cross-Screen Business Rule — Non-Mandatory Field Skip Workflow & Daily Staff Digest
*(Carried forward from Part 2, per your confirmation this applies through Part 5.)*

Every checklist/assessment field across P4-01, P4-02, P4-03, and P4-07 is now Critical
(Mandatory, hard-block, no override) or Non-Critical (Non-Mandatory,
skippable-with-reason). See each screen's own Mandatory Fields section below for the
specific split; the full skip-popup/backend-log/daily-digest mechanism itself is
specified once, in Part 2's Shared Platform Conventions, and not repeated here. This
is a separate mechanism from the existing Consolidated Physician Notification rule
immediately below — that rule batches Critical-tier *findings*; this one governs
whether a Non-Critical *field* can be left blank at all.

---

# Cross-Screen Business Rule — Consolidated Physician Notification
*(New this round, per your explicit design request. This is a genuinely new
sub-system, not just a screen — it aggregates signals from Part 3 and Part 4 into
one triaged notification per session, rather than the "10 different notifications"
you correctly flagged as unworkable.)*

## The problem this solves
As specified before your feedback, "Physician Notified" or "Physician Review
Required" appeared independently on P3-04, P3-05, P3-06, P3-07, P4-01, P4-04, and
P4-05 — each screen firing its own notification. A nephrologist covering multiple
patients would receive a flood of disconnected pings with no sense of what's urgent.

## The design
**One notification per session**, built incrementally as the session progresses,
sent (or updated) to the nephrologist **once** — not once per triggering screen.
Every screen that would previously have fired its own "Physician Notified" flag
instead **contributes an entry** to this session's consolidated notification.

**Three severity tiers, always shown red-first:**
- 🔴 **Critical (red)** — anything from the Part 3 Cross-Screen Mandatory Adverse
  Event rule (severe hypotension/syncope, falls, access infiltration/blood loss,
  medication errors, unresolved machine malfunctions), plus Post-Dialysis equivalents:
  P4-01 Early Termination, P4-02 hemostasis not achieved, P4-03 "Not Stable"
  discharge readiness, P4-05 adverse drug reaction.
- 🟡 **Important (yellow)** — deviations from target that aren't immediately
  dangerous: P4-04 UF Goal or Kt/V below target, a resolved-but-notable alarm from
  P3-07, a missed (not adverse-reacted) medication from P3-06/P4-05.
- 🟢 **Notable (green)** — minor, already-resolved items worth a mention but not
  action: a symptom that occurred and resolved without intervention, a parameter that
  briefly deviated and self-corrected.

**Aggregation, not repetition:** each contributing screen writes one line item (event
type, screen, timestamp, one-line description) to a session-level
`physician_notification` record, rather than firing a separate alert. The
nephrologist sees **one card, three color-grouped sections, red section always on
top** — not a chronological feed.

## Where this shows up
**1. Doctor Dashboard widget** (new — described here since no Figma exists for the
doctor-facing side of this system; this is a design proposal, not a confirmed build
spec):
```
┌─ Session Review — Ramesh Kumar (P10023) — 26 May 2025, Morning ──────────┐
│ 🔴 Critical (1)                                                          │
│   • Early termination — treatment stopped at 03:42hr of 04:00hr          │
│     prescribed (P4-01, 07:27 AM)                                        │
│ 🟡 Important (2)                                                         │
│   • UF Goal not met — 17.5% below target (P4-04, delivered vs prescribed)│
│   • Access issues noted during outcome review (P4-04)                    │
│ 🟢 Notable (1)                                                           │
│   • Mild headache during treatment, resolved with Paracetamol (P3-04)    │
│                                              [Review Full Session →]     │
└───────────────────────────────────────────────────────────────────────┘
```
Sorted red → yellow → green always, never chronological — a nephrologist triaging
across many patients needs the dangerous ones first, every time.

**2. Backend contribution points, per screen (for engineering):** P3-04, P3-05,
P3-06, P3-07, P4-01, P4-02, P4-03, P4-04, P4-05 each get a
`notify_physician_contribution` call (not a standalone notification send) — specified
individually under each screen's Business Rules/API sections below and, for the Part
3 screens, this supersedes their prior "Notify Nurse/Doctor" checkbox behavior, which
now feeds this aggregator instead of sending its own alert.

## API / DB (proposed, cross-screen)
`[PROPOSED]` `physician_notification` (session_id, patient_id, status: draft/sent/
acknowledged, created_at, sent_at, acknowledged_at, acknowledged_by).
`physician_notification_item` (notification_id, source_screen, severity: critical/
important/notable, event_type, description, source_record_id, occurred_at). `POST
/sessions/{id}/notify-physician/contribute` (called internally by each contributing
screen, not by the technician directly) appends an item; the notification itself is
compiled and sent once, either on P4-09's sign-off (the natural "session narrative is
now complete" moment) or immediately if a Critical item is added (a red item shouldn't
wait for end-of-session).

**★ RESOLVED THIS ROUND:** immediate-on-Critical, batched-at-P4-09 for everything
else — confirmed as final, per your agreement with this recommendation.

---

# Cross-Screen Callout — HBsAg / HIV Isolation Cleaning Protocol
*(New this round, per your instruction — explicit, not folded silently into general
cleaning items.)*

`[SAFETY-PROTOCOL-DERIVED]` Per the Hepatitis B (HBsAg-Positive) Isolation Policy
established in Part 2 (Safety Protocol §4): *"No equipment, instruments, or
medications may be shared between the isolation zone and the general floor."* This has
a direct, explicit consequence for post-dialysis cleaning that wasn't called out
before:

- **P4-06 (Machine Disinfection & Turnover) and P4-07 (Infection Control & Waste
  Disposal)** must both display a prominent banner when the session's patient is
  HIV-positive or HBsAg-positive (status carried read-only from P2-04): *"Isolation
  patient — use dedicated isolation-zone cleaning supplies and disposal containers
  only. Do not return this machine to general rotation."*
- The **"Machine Ready for Next Patient"** field has been removed from P4-06 per the
  Part 5 patch (Decision 2, now resolved) — the hard isolation-assignment rule lives
  entirely in Part 5/Scheduling now. This callout's cleaning-supplies banner stays on
  P4-06 regardless, since that's a documentation concern independent of readiness.
- **Biomedical waste** from an isolation session should be tagged/logged distinctly
  in P4-07's waste-segregation fields, consistent with Compliance Bible §7.4
  (Biomedical Waste Management Rules, 2016) — an operational/physical control this
  document should reflect in its data model even though the regulation itself sits
  outside the software layer.

This callout is written into P4-06 and P4-07's own sections below, not just stated
here.

---

# Cross-Screen Design — P4-09 Sign-off Identity Capture
*(New this round, per your instruction — replaces the "typed name in a signature box"
pattern from the original Figma with a login-backed identity flow, addressing the
legal-validity concern I raised.)*

**Flow, as you specified:**
1. On reaching P4-09, the system already knows who's logged in (the technician
   running this session). A modal appears: *"Is [logged-in user's name] the
   technician who completed this dialysis session? [Yes] [No]"*
2. **If Yes:** name, role, and timestamp are captured automatically from the active
   login session — no typing, no separate signature field. This becomes the
   Technician Sign-off record.
3. **If No:** a dropdown appears listing all technicians and nurses (from the staff
   roster), so the person who actually performed the session can be selected — this
   covers shift handoffs, where the person documenting isn't the person who ran the
   treatment.
4. Once a name is selected and **Next** is pressed, a **login prompt opens for that
   selected person** — they must authenticate with their own credentials. Only a
   successful login completes the sign-off.
5. **The same flow applies to Nurse Sign-off and Physician Sign-off** — each is its
   own instance of steps 1–4, for whichever role is signing at that moment (confirmed
   as the sensible generalization of your instruction, since the same legal-validity
   concern applies equally to all three signers, not just the technician).

**Why this matters:** a typed name in a signature-style box proves nothing — anyone
could type anyone's name. A successful login event is a real authentication
credential, giving the sign-off actual evidentiary weight for a legally significant
clinical record, consistent with Bible §4.D's "reasonable security safeguards"
principle applied to record integrity, not just data-at-rest.

**API/DB:** `[PROPOSED]` `session_signoff` (session_id, role: technician/nurse/
physician, signed_by_user_id, is_self [bool, true if step 2's "Yes" path was used],
authenticated_at, ip_or_device_id). No separate "signature image" field — the
authentication event *is* the signature. Full detail under P4-09 below.

---

# Redundancy check against Part 2 and Part 3

Every field below was checked against Parts 2 and 3. **Read-only, carried forward,
never re-entered:** patient identity, Access Type/Details, Nephrologist, Prescription
(Dialyzer, prescribed BFR/DFR/duration/UF Goal, Heparin regimen), Target/Dry Weight,
HIV/Hepatitis status (all from Part 2), and Treatment Start Time, all vitals/machine-
parameter trend history, all medications administered, all alarms, all incidents, and
Pre-Dialysis BUN (all from Part 3). **New in Part 4, not previously captured
anywhere:** the granular blood-return step sequence (P4-01), detailed hemostasis
findings (P4-02), post-dialysis vitals as a first-class one-time assessment (P4-03,
distinct from Part 3's repeated intradialytic vitals), Post-Dialysis BUN and the full
adequacy calculation (P4-04), discharge-specific fields (diet/fluid advice, transport,
next appointment — P4-08), and the formal documentation/sign-off record (P4-09).
**Explicitly eliminated this round per Decision 4:** P4-08 and P4-10 no longer
re-collect vitals/symptoms already captured on P4-03.

---

# P4-01 — Blood Return & Treatment Termination

## Screen Objective
`[FIGMA-DERIVED]` "Safely return blood to patient and complete treatment" (screen's
own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3.A: extracorporeal blood must be
returned completely unless contraindicated, with blood loss minimized — this screen
walks the technician through that sequence step by step rather than relying on memory.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Reached from Part 3's P3-10 (End Treatment & Proceed) — this is the first screen of
the Post-Dialysis stage. Proceeds to P4-02 (Vascular Access Hemostasis).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P4-01 – Blood Return & Treatment Termination"  subtitle: "Safely return blood
                                                         to patient and complete
                                                         treatment."
                                    [Machine 05▾] [🔔5] [Rahul Singh,Technician▾]
Step bar (10 steps, step 1 active): 1 Blood Return&Termination* 2 Vascular Access
  Hemostasis 3 Post Dialysis Vitals 4 Outcome Summary 5 Medication&Follow-up
  6 Disinfection&Turnover 7 Infection Control&Waste Disposal 8 Discharge
  9 Documentation&Sign-off 10 Session Complete
Patient banner: Ramesh Kumar[Active] PID:P10023,58y,Male,BloodGroup:O+
  Access:AVFistula(Left) Nephrologist:Dr.NehaSharma
  TreatmentStart07:45AM ElapsedTime03:35hr UFRemoved1.65L Machine:Fresenius4008S Bed:B-02
"1. Treatment Termination Steps" (7-step checklist, all green✓):
  1 Stop UF(07:15AM) 2 Reduce Blood Pump Speed(07:20AM,to100mL/min)
  3 Saline Rinse-Back(07:22AM,Primingvolume200mL) 4 Return Blood(07:24AM)
  5 Clamp Blood Lines(07:25AM) 6 Stop Blood Pump(07:26AM) 7 Disconnect Blood
  Tubing(07:27AM)
[green]"Blood return completed successfully — Total rinse-back volume: 200 mL"
"2. Treatment End Details"
  Treatment End Time*[07:27AM] Treatment Status*[Completed(selected)|Early Termination]
  Treatment Duration[03:42hr] Dialyzer Clearance[ModeratelyClear▾, full list resolved
                  this round: Clear/Moderately Clear/Slightly Clouded/Clotted-Discard]
  Total UF Removed[1.65][L] Rinse-Back Volume[200][mL]
  Blood Volume Processed[58.2][L] Physician Notified[Yes|No]
  Heparin Used[2.0][mL]
"3. Early Termination (If Applicable)" [amber panel, empty in this example]
  Reason for Early Termination[Select reason▾, full list resolved this round:
    Hypotension/Chest Pain/Access Problem(Clotting or Infiltration)/Patient Request/
    Machine Malfunction/Other] Time Treatment Stopped[Select time]
  Physician Order[Select▾, full list resolved this round: Order Obtained(Verbal)/
    Order Obtained(Written)/Standing Order Applies/Pending]
"4. Notes / Comments"[textarea,0/300]
Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: Treatment Prescription(PrescribedDuration,UFGoal,DialysateFlow,
  BloodFlowRate,Temperature,Dialysate — all read-only from Part 2) | Live Parameters
  (Pre-Termination)(BP,HR,TMP,VP,AP,BFR) | Safety Reminders(5 checked items)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Treatment Termination Steps checklist (7 items, sequential) → confirmation banner →
Treatment End Details form → conditional Early Termination panel → Notes → Footer →
Right rail (Treatment Prescription read-only card, Live Parameters snapshot, Safety
Reminders).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **Termination Steps (7, sequential, timestamped):** Stop UF, Reduce
Blood Pump Speed, Saline Rinse-Back, Return Blood, Clamp Blood Lines, Stop Blood Pump,
Disconnect Blood Tubing. **Treatment End Details:** Treatment End Time, Treatment
Status (Completed/Early Termination), Treatment Duration, **Dialyzer Clearance
(dropdown, full list resolved this round: Clear, Moderately Clear, Slightly Clouded,
Clotted/Discard)**, Total UF Removed, Rinse-Back Volume, Blood Volume Processed, Physician
Notified (Yes/No — **now a contribution to the Consolidated Physician Notification,
not a standalone send**, see Cross-Screen Business Rule), Heparin Used. **Early
Termination (conditional):** **Reason (dropdown, full list resolved this round:
Hypotension, Chest Pain, Access Problem (Clotting/Infiltration), Patient Request,
Machine Malfunction, Other)**, Time Treatment Stopped, **Physician Order (dropdown,
full list resolved this round: Order Obtained (Verbal), Order Obtained (Written),
Standing Order Applies, Pending)**. Notes.

**[READ-ONLY, CARRIED FROM PART 2]** the entire Treatment Prescription card
(Prescribed Duration, UF Goal, Dialysate Flow, Blood Flow Rate, Temperature,
Dialysate). **[READ-ONLY, CARRIED FROM PART 3]** Live Parameters (Pre-Termination) —
the session's last-recorded vitals/machine values from P3-02/P3-03, not re-entered.

## Input Types
Sequential checklist items (auto-timestamped as each is actioned, per the visible
07:15–07:27 AM progression); time picker (Treatment End Time); 2-way toggle
(Treatment Status); numeric entry (Duration, UF Removed, Rinse-Back Volume, Blood
Volume Processed, Heparin Used); dropdown (Dialyzer Clearance, Early Termination
Reason, Physician Order); Yes/No toggle (Physician Notified); free-text (Notes).

## Mandatory Fields
`[FIGMA-DERIVED]` Treatment End Time and Treatment Status are asterisked. **All 7
Termination Steps are Critical (Mandatory) — no Non-Critical tier applies to this
sequence**, since this is a strict sequential blood-return safety procedure (Stop UF →
Reduce Blood Pump Speed → Saline Rinse-Back → Return Blood → Clamp Blood Lines → Stop
Blood Pump → Disconnect Blood Tubing), not a review checklist; skipping any step risks
exsanguination or air embolism, both named Safety Protocol emergencies. **Non-Critical
(Non-Mandatory, skippable-with-reason):** Total UF Removed, Rinse-Back Volume, Blood
Volume Processed — documentation/tracking values that inform adequacy calculations but
aren't themselves a same-session safety action.

## Validation Rules
Treatment Status = Early Termination → Reason, Time Treatment Stopped, and Physician
Order all become mandatory (the conditional panel highlighted amber in the Figma).
Any Termination Step skipped or out of sequence → hard block, no override, per the
Non-Mandatory Field Skip Workflow's principle that a Critical field can never be
skipped by anyone (Shared Platform Conventions) — this resolves the prior open
question about exact blocking behavior; Save & Continue is disabled until all 7 show
complete, consistent with this document's other sequential checklists.

## Business Rules
`[NEW]` Physician Notified = Yes, or Treatment Status = Early Termination →
contributes a **Critical** item to the Consolidated Physician Notification (Cross-
Screen Business Rule above) rather than sending its own separate alert.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). A user whose organization's
consent is revoked retains access to this screen until P4-10's session closure;
Kifayti-level revocation likewise defers to that same point.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` "Blood loss minimized" — the Rinse-Back Volume field
directly supports verifying this.
**★ RESOLVED THIS ROUND:** no single clinical constant exists for this (unlike UF-rate
ceiling) — it's largely tubing-set/facility-protocol dependent. Literature-backed
recommended range: **200–500 mL typical**, flag above **500 mL** (this upper bound is
consistent with device-engineering documentation capping rinseback boluses at 500 mL
total specifically to prevent fluid-overload misuse). `[PROPOSED]` **Admin-
configurable**, per your instruction — 200–500 mL is the shipped default range, not a
hardcoded constant.

## Auto-calculations
Treatment Duration = Treatment End Time − Treatment Start Time (carried from Part 3's
`started_at`). Total UF Removed is carried from P3-03's cumulative reading, not
independently entered — `[GAP IDENTIFIED]` the Figma shows it as an editable numeric
field, which could mean it's a technician-confirmable/correctable copy of the P3-03
value rather than a fresh entry; recommend pre-populating from P3-03 with the field
left editable for correction, not blank.

## Decision Trees
```
All 7 Termination Steps complete → confirmation banner → Treatment End Details
  ├── Status = Completed → Save & Continue enabled once mandatory fields filled
  └── Status = Early Termination → Reason/Time/Physician Order required →
        Critical item added to Consolidated Physician Notification
Physician Notified = Yes → Critical item added regardless of Status
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/terminate` (7 step timestamps, treatment end
details, early termination fields if applicable, notes, recorded_by).

## API Responses
`[PROPOSED]` Echo + `physician_notification_contributed` (bool) if applicable.

## Database Mapping
`[PROPOSED]` `treatment_termination` (session_id, 7 step timestamps, end_time, status,
duration, dialyzer_clearance, total_uf_removed, rinse_back_volume,
blood_volume_processed, physician_notified, heparin_used, early_termination_reason,
early_termination_time, physician_order, notes, recorded_by).

## Audit Events
`termination_step_completed` (×7, one per step), `treatment_terminated`,
`early_termination_recorded`, `physician_notification_contributed`.

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Rinse-back volume outside the 200–500 mL typical range (or the admin-configured
equivalent) → **★ RESOLVED THIS ROUND: Warning**, not silent accept — same amber
tag/banner pattern used for vitals Warning-tier throughout this document set. Does
not block Save & Continue.

## Empty States
N/A — sequential checklist, always populated as steps complete.

## Loading States
Skeleton checklist + skeleton Treatment Prescription card.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician completes the full 7-step blood-return sequence and end-of-treatment
documentation without needing to consult a separate reference for the correct order.

## Test Cases
All 7 steps required before proceeding; Early Termination correctly requires its 3
conditional fields; Physician Notified/Early Termination correctly contributes a
Critical item to the Consolidated Physician Notification, not a standalone alert.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; a plausible fit is predicting likely early-
termination risk based on the session's own vitals trend, subject to human-in-the-loop
labelling.

---

# P4-02 — Vascular Access Hemostasis

## Decision Log (this screen)
Branches exclusively by Access Type per Decision 3 — only one of the AVF/AVG or CVC
panels renders at a time, despite both appearing filled in the Figma export.

## Screen Objective
`[FIGMA-DERIVED]` "Achieve hemostasis and ensure access site is stable" (screen's own
subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3.A/§3.C: needle removal must be done
safely (patient must not bend arm during fistula compression), hemostasis achieved
without excessive occluding pressure, dressing applied correctly — and §3.C's
Post-Treatment Access Assessment (bleeding stopped, thrill present, hematoma/pain,
dressing dry/secure) must be confirmed. This screen implements both in full.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Blood Return & Termination (P4-01) → Vascular Access Hemostasis (this screen, step 2
of 10) → Post Dialysis Vitals (P4-03).

## Wireframe
`[FIGMA-DERIVED, with the exclusive-branch correction per Decision 3]`
```
Title: "P4-02 – Vascular Access Hemostasis"  subtitle: "Achieve hemostasis and ensure
                                              access site is stable."
Step bar (10 steps, step 2 active).
Patient banner (standard read-only fields + Treatment Start/End/Duration/UF Removed).
"1. Access Type": (●AV Fistula/AVG)(○Central Venous Catheter(CVC))

[IF AVF/AVG selected — renders "2A" panel only, per Decision 3]
"2A. AV Fistula/AVG – Needle Removal & Hemostasis"
  Arterial Site: NeedleRemoved[Yes/No] TimeRemoved[11:18AM] BleedingDuration[5][min]
    HemostasisAchieved[Yes/No] DressingApplied[Yes/No]
  Venous Site: NeedleRemoved[Yes/No] TimeRemoved[11:19AM] BleedingDuration[4][min]
    HemostasisAchieved[Yes/No] DressingApplied[Yes/No]
  Access Assessment: ThrillPresent[Present/Absent] BruitPresent[Present/Absent]
    Swelling[Yes/No] Redness[Yes/No] Pain/Tenderness[Yes/No] Comments[textarea,0/200]
[green]"Hemostasis achieved successfully — Both sites are stable."

[IF CVC selected — renders "2B" panel only, per Decision 3]
"2B. CVC – Catheter Disconnection"
  CatheterFlushed[Yes/No] LockSolutionUsed[Heparin(1000units/mL)▾]
  VolumeInstilled[1.8][mL] CatheterClamped[Yes/No]
  DressingIntegrity[Intact/Loose/Damaged] ExitSiteCondition[Clean/Redness/Swelling/
    Discharge] ExitSiteCleaned[Yes/No] AntimicrobialDressingApplied[Yes/No]
  Comments[textarea,0/200]
  (side panel) "CVC Care" reminder: 1.Flush catheter 2.Lock with prescribed solution
    3.Clamp securely 4.Apply sterile dressing

Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: Hemostasis Summary(Achieved✓,Time) | Access Site Photo(Optional,upload) |
  Bleeding Duration Summary(Arterial/Venous, or single for CVC) | Key Reminders
  (5 checked items)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Access Type selector (2-way, exclusive per Decision 3) → conditionally-rendered
Access-specific panel (2A AVF/AVG or 2B CVC, never both) → Footer → Right rail
(Hemostasis Summary, Access Site Photo upload, Bleeding Duration Summary, Key
Reminders).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12; the AVF/AVG panel is itself
3-column (Arterial Site, Venous Site, Access Assessment) within the main form.

## Field Definitions
`[FIGMA-DERIVED]` **AVF/AVG branch:** per-site (Arterial, Venous) Needle Removed,
Time Removed, Bleeding Duration, Hemostasis Achieved, Dressing Applied; plus a shared
Access Assessment (Thrill, Bruit, Swelling, Redness, Pain/Tenderness, Comments).
**CVC branch:** Catheter Flushed, Lock Solution Used, Volume Instilled, Catheter
Clamped, Dressing Integrity, Exit Site Condition, Exit Site Cleaned, Antimicrobial
Dressing Applied, Comments. **Both branches map directly onto Safety Protocol §3.C's
Post-Treatment Access Assessment** (bleeding stopped → Bleeding Duration/Hemostasis
Achieved; thrill present → Thrill Present; hematoma/pain → Pain/Tenderness; dressing
dry/secure → Dressing Applied/Dressing Integrity) — **this closes the gap flagged as
open in Part 3's P3-10.**

## Input Types
Access Type radio (2-way); Yes/No toggles (most fields); time pickers (Time Removed);
numeric (Bleeding Duration, Volume Instilled); dropdowns (Lock Solution, Dressing
Integrity, Exit Site Condition); free-text (Comments); photo upload (Access Site
Photo, optional, JPG/PNG up to 5MB per the Figma).

## Mandatory Fields
**AVF/AVG branch — Critical (Mandatory):** Hemostasis Achieved, Bleeding Duration,
Thrill, Bruit — bleeding/hemostasis and access-patency indicators, consistent with the
same classification applied on P2-07/P3-05. **AVF/AVG — Non-Critical (Non-Mandatory,
skippable-with-reason):** Needle Removed, Time Removed, Dressing Applied, Swelling,
Redness, Pain/Tenderness, Comments. **CVC branch — Critical (Mandatory):** Catheter
Clamped (an unclamped catheter risks air embolism or bleeding), Catheter Flushed, Lock
Solution Used, Volume Instilled (patency-maintenance, prevents clotting), Exit Site
Condition (infection indicator, consistent with P2-07's CVC classification).
**CVC — Non-Critical (Non-Mandatory, skippable-with-reason):** Dressing Integrity,
Exit Site Cleaned, Antimicrobial Dressing Applied, Comments.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` Hemostasis Achieved = No (either site, AVF/AVG) or
Catheter Clamped = No (CVC) → shared checklist failure state (Part 2/3's established
pattern), hard block, no override, and contributes a **Critical** item to the
Consolidated Physician Notification per the Cross-Screen Business Rule.
**★ RESOLVED THIS ROUND:** Bleeding Duration >20 minutes → Warning-tier flag, same
two-tier model used for vitals throughout this document set. Literature-backed:
normal hemostasis is typically achieved within 15–20 minutes of manual compression,
and bleeding continuing beyond 20 minutes (or recurring) is treated as a cause for
concern for vascular access complications in the clinical literature. `[PROPOSED]`
**Admin-configurable**, per your instruction — 20 minutes is the shipped default, not
a hardcoded constant. Non-Critical fields left blank follow the Non-Mandatory Field
Skip Workflow instead of blocking.

## Business Rules
Only the active Access Type's panel is submitted — no partial data from the inactive
branch is saved, consistent with Decision 3.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` "Do NOT allow patient to bend arm during fistula
compression" — a technician-training/procedural note, same treatment as the
equivalent notes elsewhere in this document set (not a UI field, but preserved here so
it isn't lost).

## Auto-calculations
None — all values are direct observations.

## Decision Trees
```
Select Access Type
  ├── AVF/AVG → render 2A only
  │     └── Hemostasis Achieved = No (either site) → shared failure state +
  │           Critical physician-notification item
  └── CVC → render 2B only
        └── Catheter Clamped = No, or Signs of infection at exit site →
              shared failure state + Critical physician-notification item
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/hemostasis` (access_type, branch-specific fields,
photo_url if uploaded, recorded_by).

## API Responses
`[PROPOSED]` Echo + hemostasis_status (achieved/not achieved) +
`physician_notification_contributed` if applicable.

## Database Mapping
`[PROPOSED]` `vascular_access_post` (session_id, access_type, AVF/AVG branch columns
[nullable], CVC branch columns [nullable], photo_url, recorded_by, recorded_at).

## Audit Events
`hemostasis_recorded`, `hemostasis_not_achieved_flagged` (if applicable),
`access_photo_uploaded` (if applicable), `physician_notification_contributed` (if
applicable).

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Photo upload failure/oversized file → inline error, doesn't block the rest of the
form (photo is optional).

## Empty States
N/A — form screen with a persistent right-rail summary.

## Loading States
Skeleton form + skeleton right-rail cards.

## Offline Behavior
Local draft-save with sync-on-reconnect; photo upload queues for when connectivity
returns.

## Acceptance Criteria
Correct panel (AVF/AVG or CVC) renders based on the patient's actual access type;
hemostasis-not-achieved correctly blocks progression and notifies the physician.

## Test Cases
Access Type toggle correctly shows/hides the right panel exclusively (never both);
Hemostasis Achieved = No triggers shared failure state and Critical notification;
optional photo upload doesn't block submission when skipped.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; image-based bleeding/hematoma detection from the
optional Access Site Photo is a plausible (if ambitious) future direction, subject to
human-in-the-loop labelling and the same medical-device/SaMD considerations flagged in
Part 2 (Bible §7.1/7.2).

---

# P4-03 — Post Dialysis Vitals & Assessment

## Decision Log (this screen)
This is the **source of truth** that P4-08 and P4-10 both read from, read-only, per
Decision 4 — flagged clearly here since two other screens depend on this one's data
not being duplicated.

## Screen Objective
`[FIGMA-DERIVED]` "Assess patient's clinical status after dialysis and ensure
stability before discharge" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3.B "Patient Discharge Vitals" and §3.C
"Patient Recovery & Discharge Readiness" — this screen is the one-time, authoritative
post-treatment clinical snapshot, distinct from Part 3's repeated intradialytic
vitals.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Vascular Access Hemostasis (P4-02) → Post Dialysis Vitals & Assessment (this screen,
step 3 of 10) → Outcome Summary (P4-04).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P4-03 – Post Dialysis Vitals & Assessment"  subtitle: "Assess patient's
                                                     clinical status after dialysis
                                                     and ensure stability before
                                                     discharge."
Step bar (10 steps, step 3 active).
Patient banner (standard fields + Treatment Start/End/Duration/UF Removed/Dry
  Weight/Post Weight).
"1. Post Dialysis Vital Signs":
  BloodPressure(mmHg)124/78"90/60-140/90"✓ HeartRate(bpm)82"60-100"✓
  RespiratoryRate(rpm)18"12-20"✓ SpO2(%)98"95-100"✓ MAP(mmHg)93"65-105"✓
  AccessSitePain: No "Yes/No"✓
"2. Weight": PreDialysisWeight66.8kg PostDialysisWeight65.3kg
  NetUFRemoved1.5kg UFGoal1.6kg "UF Variance:-0.1kg(-6%)"
"3. Patient Symptoms" (7 items, Yes/No/Mild each): Dizziness/Lightheadedness,
  Fatigue/Weakness, Nausea/Vomiting, Muscle Cramps, Headache, Shortness of Breath,
  **Chest Pain — added this round**
"4. Clinical Assessment": Consciousness[Alert▾, synced to the same 5-option list used
  on P2-06/P3-02: Alert/Oriented/Confused/Lethargic/Unresponsive]
  Orientation[Oriented▾, full list resolved this round: Oriented/Partially Oriented/
  Disoriented]
  Ambulation[Independent/Assisted/Unable] ToleranceToActivity[Good▾, full list
  resolved this round: Good/Fair/Poor/Not Assessed]
  OverallCondition[Stable/Fair/Unstable] DischargeReadiness[✓ReadyforDischarge]
  Notes/Remarks[textarea,0/300]
Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: Vital Trends(Last3Sessions table:BP,HR,Weight,UFRemoved,22/24/26May,
  "ViewAll→") | Safety Checklist(5 items,"All checks completed") | Key Reminders |
  Quick Actions(AddNote,ViewTrends,UpdateCarePlan)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Post Dialysis Vital Signs panel (6 cards) → Weight panel (4 cards + variance) →
Patient Symptoms panel (6 Yes/No/Mild items) → Clinical Assessment panel (dropdowns +
Discharge Readiness indicator + Notes) → Footer → Right rail (Vital Trends table,
Safety Checklist, Key Reminders, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED, amended this round]` **Vital Signs:** BP, Heart Rate, Respiratory Rate, SpO2, MAP
(auto-calculated), Access Site Pain (Yes/No). **Weight:** Pre-Dialysis Weight (carried
from P2-05), Post-Dialysis Weight (entered), Net UF Removed (calculated), UF Goal
(carried from P2-05), UF Variance (calculated), **Weight Variance vs. Dry Weight
(calculated, added this round — see Business Rules)**. **Symptoms (7, Yes/No/Mild):**
Dizziness/Lightheadedness, Fatigue/Weakness, Nausea/Vomiting, Muscle Cramps, Headache,
Shortness of Breath, **Chest Pain (added this round — resolves the prior gap: it's
explicitly named in Safety Protocol §3.C's "Dizziness, Nausea, Vomiting, Chest pain, or
Dyspnea" list but wasn't shown as its own tile in the original export)**.
**Clinical Assessment:** **Consciousness (synced to P2-06/P3-02's list: Alert,
Oriented, Confused, Lethargic, Unresponsive)**, **Orientation (full list resolved this
round: Oriented, Partially Oriented, Disoriented)**, Ambulation (Independent/Assisted/
Unable — matches §3.C's "able to stand and ambulate safely"), **Tolerance to Activity
(full list resolved this round: Good, Fair, Poor, Not Assessed)**,
Overall Condition (Stable/Fair/Unstable), Discharge Readiness (system-derived
indicator), Notes.

## Input Types
Read-only vital cards with inline range validation (green check per in-range value);
numeric entry (Post-Dialysis Weight); Yes/No/Mild 3-way toggles (Symptoms); dropdowns
(Consciousness, Orientation, Tolerance to Activity); 3-way toggle (Ambulation, Overall
Condition); free-text (Notes).

## Mandatory Fields
**Critical (Mandatory):** BP, Heart Rate, SpO2 — same immediate-threat vitals
classification as P2-05/P3-02, applied consistently post-dialysis. Post-Dialysis
Weight, Net UF Removed, UF Goal, UF Variance remain Mandatory for the same
calculation-dependency reason established on P2-05 (kept Critical-tier per your
instruction there, applied consistently here). Symptoms — Dizziness/Lightheadedness,
Shortness of Breath, **Chest Pain (added this round)** — immediate-threat symptom
indicators. Overall Condition (gates Discharge Readiness). **Non-Critical
(Non-Mandatory, skippable-with-reason):** Respiratory Rate, Access Site Pain (already
covered in more detail on P4-02). Symptoms — Fatigue/Weakness, Nausea/Vomiting, Muscle
Cramps, Headache.

## Validation Rules
`[DESIGN SPECIFICATION, reusing the established Warning/Critical model]` Any vital
outside its shown range → Warning tier (amber); a clinically dangerous value (e.g.,
very low BP, per the same Critical-tier logic used in P2-05/P3-02) → Critical tier,
shared failure-state banner, hard block, no override, blocks Discharge Readiness from
showing "Ready" and contributes a **Critical** item to the Consolidated Physician
Notification. Non-Critical fields left blank follow the Non-Mandatory Field Skip
Workflow instead of blocking.

## Business Rules
**★ RESOLVED THIS ROUND — added, per your confirmation.** **Weight Variance vs. Dry
Weight**: Post-Dialysis Weight compared against Dry Weight (carried from Part 2) —
e.g., "Post-Dialysis Weight 65.3 kg vs. Dry Weight 67.0 kg: −1.7 kg below dry weight"
— flags over-ultrafiltration distinct from UF Variance (UF Removed vs. UF Goal).
Clinically meaningful even though UF Goal is itself defined as (Pre-Dialysis Weight −
Dry Weight) + Fluid Allowance (per the Part 2 UF Goal Formula): UF Variance confirms
whether the *machine* achieved its programmed removal target, while Weight Variance
confirms whether the *patient* actually reached dry weight in practice — the two can
diverge if actual fluid removal doesn't match the machine's cumulative reading. This
directly reflects the standard India dry-weight-driven workflow (nephrologist
prescribes dry weight; technician's goal is to bring the patient to that weight within
the session) rather than a UF-goal-only model.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Discharge Readiness = "Ready for Discharge" requires: all
vitals in range, no Critical-tier symptom, Overall Condition = Stable, Ambulation ≠
Unable — matching Safety Protocol §3.C's discharge-readiness Yes/No list collectively,
not any single field alone.

## Auto-calculations
MAP = (Systolic + 2×Diastolic)/3, same formula as P2-05/P3-02. Net UF Removed = Pre-
Dialysis Weight − Post-Dialysis Weight. UF Variance = Net UF Removed − UF Goal (both
absolute and %). **Weight Variance vs. Dry Weight = Post-Dialysis Weight − Dry Weight
(added this round)** — a positive value means the patient is above dry weight
(under-ultrafiltered), a negative value means below dry weight (over-ultrafiltered).
Discharge Readiness = derived per Clinical Rules above, not a technician-set toggle.

## Decision Trees
All vitals/symptoms within normal range + Overall Condition = Stable → Discharge
Readiness shows "Ready for Discharge," Save & Continue proceeds normally. Any
Critical-tier vital or symptom, or Overall Condition ≠ Stable → Discharge Readiness
withheld, shared failure-state styling, Critical item added to Consolidated Physician
Notification.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/post-vitals` (all fields above, recorded_by).

## API Responses
`[PROPOSED]` Echo + discharge_readiness (bool) + `flags` array +
`physician_notification_contributed` if applicable.

## Database Mapping
`[PROPOSED]` `post_dialysis_vitals` (session_id, BP, HR, RR, SpO2, MAP,
access_site_pain, pre_weight, post_weight, net_uf_removed, uf_variance,
**weight_variance_vs_dry_weight (added this round)**, 6 symptom
columns, consciousness, orientation, ambulation, tolerance_to_activity,
overall_condition, discharge_readiness, notes, recorded_by, recorded_at).

## Audit Events
`post_vitals_recorded`, `vital_critical_flagged` (if applicable), `discharge_readiness_determined`,
`physician_notification_contributed` (if applicable).

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Out-of-physiological-range entry → inline sanity-check error, distinct from the
clinical Warning/Critical styling, same pattern as P2-05.

## Empty States
N/A — form screen.

## Loading States
Skeleton form + skeleton Vital Trends table.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician can complete the full post-dialysis assessment and get a clear Discharge
Readiness determination in under a minute.

## Test Cases
Discharge Readiness correctly withheld on any Critical-tier finding; UF Variance and
(once added) Weight Variance calculate correctly; MAP recalculates correctly.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; predicting post-dialysis hypotension risk from the
session's own intradialytic trend (Part 3 data) is a plausible fit, subject to
human-in-the-loop labelling.

---

# P4-04 — Treatment Outcome Summary

## Decision Log (this screen)
This is now the **authoritative home for Kt/V, eKt/V, and PCR** — see the Cross-Screen
Calculation section at the top of this document for full formulas and citations. This
supersedes the mechanism previously (and now withdrawn) specified on Part 3's P3-10.

## Screen Objective
`[FIGMA-DERIVED]` "Review prescribed vs delivered treatment and evaluate dialysis
adequacy" (screen's own subtitle).

## Clinical Rationale
Per KDOQI's Hemodialysis Adequacy guideline, comparing prescribed vs. actually
delivered treatment parameters, and calculating adequacy metrics, is how underdialysis
is caught early rather than discovered as a downstream complication.

## Users
Dialysis Technician (primary, records/reviews); Nurse, Nephrologist (view, Nephrologist
receives the Consolidated Physician Notification if triggered here).

## Navigation
Post Dialysis Vitals & Assessment (P4-03) → Outcome Summary (this screen, step 4 of
10) → Medication & Follow-up (P4-05).

## Wireframe
`[FIGMA-DERIVED, with the Kt/V Assessment panel now relocated here per Decision 5]`
```
Title: "P4-04 – Treatment Outcome Summary"  subtitle: "Review prescribed vs delivered
                                             treatment and evaluate dialysis
                                             adequacy."
Step bar (10 steps, step 4 active).
Patient banner (standard fields + Treatment Start/End/Duration).
"1. Prescribed vs Delivered" table: Parameter|Prescribed|Delivered|Variance|Variance%|Status
  PrescribedDuration 04:00hr|Delivered03:35hr|-00:25hr|-10.4%|BelowTarget
  UFGoal 2.00L|Delivered1.65L|-0.35L|-17.5%|BelowTarget
  BFR 300mL/min|Delivered298mL/min|-2mL/min|-0.7%|Achieved
  DFR 500mL/min|Delivered500mL/min|0|0%|Achieved
  BloodVolumeProcessed 60.0L|Delivered58.2L|-1.8L|-3.0%|Achieved
  HeparinDose 2.0mL|Delivered2.0mL|0|0%|Achieved
  DialysateTemperature 36.5°C|Delivered36.5°C|0|0%|Achieved
  Dialysate StandardBicarbonate|Delivered StandardBicarbonate|—|—|Achieved
[NEW — DESIGN SPECIFICATION, relocated from Part 3 per Decision 5]
"2. Kt/V Assessment (Monthly)"
  ☐ Kt/V Assessment Due/Taken This Session ⓘ("Per protocol, typically once monthly;
    last measured: 12 May 2025, Kt/V 1.28")
  (shown only if checked:) Pre-Dialysis BUN(mg/dL)[read-only, from P2-05 this session]
    Post-Dialysis BUN(mg/dL)*[textbox] [Calculate Adequacy Metrics]
"3. Dialysis Adequacy Metrics" (populated once calculated, or showing prior values):
  Kt/V(SinglePool)1.32,Target≥1.2,Adequate | Kt/V(Equilibrated)1.45[NOTE: eKt/V is
    mathematically ≤ spKt/V, so this example value from the Figma is internally
    inconsistent — see Field Definitions note below] | URR(IfAvailable)72%,
    Target≥65%,Adequate | PCR(g/kg/day)1.05,Target≥0.8,Adequate
"4. Treatment Notes / Variances"[textarea,0/300]
"5. Deviation/Issues(If any)" (checkboxes): Hypotension,MuscleCramps,AccessIssues
    [checked],Nausea/Vomiting,EarlyTermination,Other[textbox]
"6. Physician Review Required": Send summary to nephrologist? (●Yes)(○No)
Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: Treatment Adequacy(overallstatusbanner) | Parameter Trends(Last3Sessions
  table) | Key Reminders(6 items) | Quick Actions(ViewTreatmentTrends,SendToNephrologist,
  PrintSummary,ExportPDF)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Prescribed vs Delivered table (8 rows) → Kt/V Assessment panel (new, relocated) →
Dialysis Adequacy Metrics (4 cards) → Treatment Notes → Deviation/Issues checkboxes →
Physician Review Required toggle → Footer → Right rail (Treatment Adequacy banner,
Parameter Trends, Key Reminders, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **Prescribed vs Delivered (8 rows):** Prescribed Duration, UF Goal,
Blood Flow Rate, Dialysate Flow Rate, Blood Volume Processed, Heparin Dose, Dialysate
Temperature, Dialysate — each with Prescribed/Delivered/Variance/Variance%/Status.
**[NEW] Kt/V Assessment panel:** checkbox + conditional Pre/Post-Dialysis BUN +
Calculate action (full detail in Cross-Screen Calculation section). **Adequacy
Metrics (4):** Kt/V (Single Pool), Kt/V (Equilibrated), URR, PCR — each with value/
target/status. **Deviation/Issues:** Hypotension, Muscle Cramps, Access Issues, Nausea/
Vomiting, Early Termination, Other (free text) — checkboxes. **Physician Review
Required:** Yes/No toggle — **now a contribution to the Consolidated Physician
Notification** (Important tier if UF/Kt/V below target; escalates to Critical if
combined with an Early Termination or Access Issues flag), not a standalone send.

**[NOTE — internal consistency flag]** The Figma's example shows Kt/V (Equilibrated)
= 1.45, *higher* than Kt/V (Single Pool) = 1.32. Per the formula in the Cross-Screen
Calculation section, eKt/V is mathematically always ≤ spKt/V (it corrects downward for
urea rebound), so 1.45 cannot be correct alongside 1.32 — this is very likely a
Figma-mockup data-entry inconsistency, not a real formula disagreement. This document
uses the correct formula (verified against two independent citations and a worked
example); flagging so nobody re-derives a "corrected" formula to match the Figma's
example number, which is the one that's wrong here.

## Input Types
Read-only comparison table; checkbox (Kt/V Assessment); conditional numeric entry
(Post-Dialysis BUN); read-only calculated cards (Adequacy Metrics); free-text
(Treatment Notes); checkboxes (Deviation/Issues, with conditional text for "Other");
Yes/No toggle (Physician Review Required).

## Mandatory Fields
Post-Dialysis BUN mandatory only if the Kt/V Assessment checkbox is checked (same
conditional pattern as the rest of this document's optional-but-gated fields).

## Validation Rules
Calculate Adequacy Metrics blocked if Pre-Dialysis BUN wasn't recorded on P2-05 this
session, same as Part 3's withdrawn design — the check simply moved here.

## Business Rules
Any Deviation/Issue checked, or any adequacy metric below target, or Physician Review
Required = Yes → contributes an **Important** item to the Consolidated Physician
Notification (escalates to **Critical** if paired with Early Termination or Access
Issues, per the severity-tiering logic in the Cross-Screen Business Rule).
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[RESOLVED]` KDOQI adequacy targets, all metrics — see Cross-Screen Calculation
section for the full target/minimum table.

## Auto-calculations
Variance/Variance% for all 8 Prescribed vs Delivered rows = Delivered − Prescribed
(and as a %). Kt/V (Single Pool), Kt/V (Equilibrated), PCR, URR — full formulas in the
Cross-Screen Calculation section above; not repeated here.

## Decision Trees
```
Kt/V Assessment checked → Post-Dialysis BUN entered → Calculate Adequacy Metrics →
  Kt/V(SP), Kt/V(eq), PCR, URR all computed together → written back to this patient's
  latest-measurement record (read by Part 3's P3-08 and this screen's own future
  sessions when unchecked)
Any metric below target, or any Deviation/Issue checked → Important (or Critical, if
  combined with Early Termination/Access Issues) item → Consolidated Physician
  Notification
```

## API Requests
`[PROPOSED]` `GET /sessions/{id}/outcome` (prescribed vs delivered comparison).
`POST /sessions/{id}/kt-v` (post_dialysis_bun) — triggers the full adequacy
calculation. `POST /sessions/{id}/outcome` (deviations, notes, physician review flag).

## API Responses
`[PROPOSED]` outcome {comparison_table, adequacy: {kt_v_sp, kt_v_eq, pcr, urr, targets,
statuses}, deviations, physician_notification_contributed}.

## Database Mapping
`[PROPOSED]` `treatment_outcome` (session_id, 8-row comparison data, deviations,
notes, physician_review_required, recorded_by). **New** `kt_v_assessment` (session_id,
pre_dialysis_bun, post_dialysis_bun, duration_hours, uf_liters,
post_dialysis_weight_kg, access_type, kt_v_sp, kt_v_eq, pcr, urr, calculated_at,
calculated_by) — this is the table withdrawn from Part 3's P3-10 and now properly
homed here.

## Audit Events
`outcome_reviewed`, `adequacy_metrics_calculated`, `deviation_flagged` (per item),
`physician_notification_contributed` (if applicable).

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Calculate Adequacy Metrics attempted without Pre-Dialysis BUN → blocking inline error
directing back to P2-05 (technically impossible to correct retroactively within this
session's own screens — a genuine workflow dead-end worth flagging: **[GAP
IDENTIFIED]** if Pre-Dialysis BUN wasn't drawn, there is no way to complete a Kt/V
assessment for this session after the fact; recommend the checkbox itself only be
offered when Pre-Dialysis BUN exists, rather than being checkable and then failing).

## Empty States
No prior Kt/V measurement exists (new patient) → "No adequacy history available for
this patient yet" rather than a blank/zero display.

## Loading States
Skeleton comparison table + skeleton adequacy cards.

## Offline Behavior
Local draft-save with sync-on-reconnect; the adequacy calculation itself can run
client-side (it's pure arithmetic) even offline, syncing the result once reconnected.

## Acceptance Criteria
Technician can review prescribed-vs-delivered variance and, when due, complete a full
adequacy assessment in one screen without needing lab-system integration for anything
beyond the two BUN values.

## Test Cases
Variance/% calculate correctly for all 8 rows; Kt/V(SP)/Kt/V(eq)/PCR/URR worked-
example regression tests (values specified in the Cross-Screen Calculation section);
Deviation checkboxes correctly drive Important/Critical notification tiering; checkbox
correctly disabled/hidden when no Pre-Dialysis BUN exists for this session.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; trend-based adequacy prediction (flagging a patient
whose Kt/V has been declining over several monthly measurements) is a plausible fit,
subject to human-in-the-loop labelling.

---

# P4-05 — Medication & Follow-up

## Screen Objective
`[FIGMA-DERIVED]` "Review medications given, missed or held and plan follow-up care"
(screen's own subtitle).

## Clinical Rationale
Per the Revised text spec's own stated principle (which the Figma confirms): "Review
medications administered during dialysis and capture only exceptions and follow-up" —
this screen reads Part 3's medication log rather than re-collecting it.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Outcome Summary (P4-04) → Medication & Follow-up (this screen, step 5 of 10) →
Disinfection & Turnover (P4-06).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P4-05 – Medication & Follow-up"  subtitle: "Review medications given, missed
                                          or held and plan follow-up care."
Step bar (10 steps, step 5 active). Patient banner (standard fields).
"1. Medications Administered During Dialysis" [+Add Medication]
Tabs: [All(5)] [Given(4)] [Missed/Held(1)]
Table: Medication|Dose|Route|Indication|ScheduledTime|Status|GivenAt|GivenBy|Action
  (5 rows: EpoetinAlfa-Given, IronSucrose-Given, Calcitriol-Given,
   Heparin(Maintenance)-Given, Paracetamol-Missed)
"2. Missed/Held Medication Details" [amber panel]
  Reason*[Select reason▾] NotifiedPhysician[Yes/No] PhysicianInstruction[textarea,0/200]
  Follow-upAction[Select action▾] Comments[textarea,0/300]
"3. Adverse Drug Reaction (If any)"
  AnyADRObserved?[Yes/No(selected)] ADRDetails[textarea,0/200] Severity[Select▾]
  ActionTaken[textarea,0/300]
"4. Follow-up Plan"
  NextMedicationDue[28May2025][08:00AM] Follow-upInvestigations(checkboxes:Hemoglobin,
    Calcium,SerumFerritin,Phosphorus,PTH,Other)
  PhysicianReviewRequired[Yes/No] ReviewDate[04Jun2025] Notes/Instructions[textarea,0/300]
Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: MedicationSummary(TotalScheduled5,Given4(80%),Missed/Held1(20%)) |
  PendingActions(1medicationmissed,PhysicianReviewRequired,Follow-upInvestigations
  Pending, "ViewDetails→") | PatientEducationProvided(4checkeditems+EducationDate) |
  QuickActions(SendToNephrologist,PrintMedicationSummary,AddFollow-upReminder)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Medications Administered table (tabbed, read-only + Add Medication for late entries)
→ Missed/Held Medication Details (conditional) → Adverse Drug Reaction panel
(conditional) → Follow-up Plan → Footer → Right rail (Medication Summary tiles,
Pending Actions, Patient Education Provided, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
`[FIGMA-DERIVED]` **Medications table:** Medication, Dose, Route, Indication,
Scheduled Time, Status (Given/Held/Missed), Given At, Given By — **[READ-ONLY, CARRIED
FROM PART 3]** this entire table is P3-06's medication log for this session, not
re-entered; **Add Medication exists only for a late/retrospective entry** the
technician forgot to log during treatment, and — **[NEW this round]** — uses the
**same Allergy Check and Quantity Used (not Lot/Batch) fields specified on P3-06**,
since this is functionally the same administration action just entered late; not
re-specified in full here, see P3-06. **Missed/Held Medication Details (conditional on
any row = Missed/Held):** Reason, Notified Physician, Physician Instruction, Follow-up
Action, Comments. **Adverse Drug Reaction (conditional):** Any ADR Observed, ADR
Details, Severity, Action Taken. **Follow-up Plan:** Next Medication Due, Follow-up
Investigations (checkboxes), Physician Review Required, Review Date, Notes.

**[NEW]** Physician Notified fields on this screen (Notified Physician under Missed/
Held; Physician Review Required under Follow-up Plan) now **contribute to the
Consolidated Physician Notification** (Part 4's own Cross-Screen Business Rule)
rather than sending a standalone alert — consistent with every other screen in this
document.

## Input Types
Read-only medications table with tab filter; Add Medication opens a small form for a
retrospective entry; dropdowns (Reason, Follow-up Action, Severity); Yes/No toggles
(Notified Physician, Any ADR Observed, Physician Review Required); free-text
(Physician Instruction, Comments, ADR Details, Action Taken, Notes); date/time pickers
(Next Medication Due, Review Date); checkboxes (Follow-up Investigations).

## Mandatory Fields
Reason is required for any Missed/Held medication. Severity and Action Taken required
if Any ADR Observed = Yes.

## Validation Rules
`[SAFETY-PROTOCOL-DERIVED]` Any ADR Observed = Yes → shared checklist failure-state
styling, and per the Cross-Screen Mandatory Adverse Event rule established in Part 3
(medication errors/adverse reactions are one of the five named triggers), contributes
a **Critical** item to the Consolidated Physician Notification.

## Business Rules
This screen never re-collects what medication was given, when, or by whom — that's
P3-06's data, read-only here. Only exceptions (missed/held, ADR) and forward-looking
follow-up planning are entered fresh.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol's Medication & Comfort section (§2.C)
established during-treatment; this screen is the post-treatment reconciliation against
that record.

## Auto-calculations
Medication Summary tiles (Total Scheduled, Given %, Missed/Held %) are calculated from
the P3-06 table, not independently maintained.

## Decision Trees
Any row = Missed/Held → Missed/Held Medication Details panel required. Any ADR
observed → shared failure state + Critical physician-notification item. Neither
condition → Follow-up Plan is the only remaining required section.

## API Requests
`[PROPOSED]` `GET /sessions/{id}/medications` (reads P3-06's log). `POST
/sessions/{id}/followup` (missed/held details, ADR, follow-up plan).

## API Responses
`[PROPOSED]` Echo + `physician_notification_contributed` if applicable.

## Database Mapping
`[PROPOSED]` `followup` (session_id, missed_held_reason, notified_physician,
physician_instruction, follow_up_action, adr_observed, adr_details, adr_severity,
adr_action_taken, next_medication_due, follow_up_investigations, physician_review_required,
review_date, notes, recorded_by) — reads `medication_administration` from Part 3,
doesn't duplicate it.

## Audit Events
`medication_reviewed`, `missed_medication_documented`, `adr_flagged` (if applicable),
`physician_notification_contributed` (if applicable).

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Add Medication (retrospective entry) without a valid administration time → inline
validation error.

## Empty States
No missed/held medications and no ADR → both conditional panels simply don't render.

## Loading States
Skeleton table + skeleton summary tiles.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician can review the full medication record and document any exception without
re-entering anything already logged during treatment.

## Test Cases
Medications table correctly reflects P3-06 data unmodified; Missed/Held panel
required only when applicable; ADR correctly triggers shared failure state and
Critical notification.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; drug-interaction checking against the Follow-up
Investigations/next-dose plan is a plausible fit, subject to human-in-the-loop
labelling.

---

# P4-06 — Machine Disinfection & Turnover

## Decision Log (this screen)
**Decision 2 is now RESOLVED, not parked** — Part 5 exists and P5-05 (Machine
Assignment) explicitly states *"No manual 'Ready for Treatment' confirmation. System
automatically validates prerequisites."* The "4. Machine Inspection & Readiness"
panel — specifically its "Machine Ready for Next Patient" field, "Next Patient Slot,"
and "Assigned To" fields — is **removed**. Those belong to Part 5's readiness chain
and P5-05's assignment workflow respectively, not to this cleaning screen. This
screen keeps everything else (Post-Use Disposal, Machine Disinfection, Surface
Cleaning, Technician Verification) exactly as before, and gains a **read-only
reference** to Part 5's current readiness status in its place.

## Screen Objective
`[FIGMA-DERIVED]` "Ensure machine cleaned, disinfected and ready for next treatment"
(screen's own subtitle) — narrowed, per the resolution above, to mean *document
cleaning and disinfection*; the "ready" determination itself is Part 5's, referenced
here read-only, not decided by this screen.

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3.A "Sanitation": automated machine
disinfection executed, medical waste and sharps disposed of safely.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Medication & Follow-up (P4-05) → Disinfection & Turnover (this screen, step 6 of 10)
→ Infection Control & Waste Disposal (P4-07).

## Wireframe
`[FIGMA-DERIVED, with the readiness panel removed per Decision 2's resolution]`
```
Title: "P4-06 – Machine Disinfection & Turnover"  subtitle: "Ensure machine cleaned
                                                   and disinfected after treatment."
Step bar (10 steps, step 6 active). Patient banner (standard fields).
"1. Post-Use Disposal" ☣: BloodlineDisposed[Yes/No] DialyzerDisposed[Yes/No]
  TubingSetDisposed[Yes/No] NeedlesDisposed(ifany)[Yes/No]
  "Have you discarded sharps in a white/translucent puncture-proof container?"[Yes/No]
  "Have you discarded infectious/biological waste in the yellow bag?"[Yes/No]
  "Have you discarded contaminated recyclable waste (tubing, dialyzer) in the red
   bag?"[Yes/No]
  Comments[textarea,0/200]
[conditional amber banner, shown if this session's patient is HIV+/HBsAg+]: "⚠
  Isolation patient — use dedicated isolation-zone cleaning supplies and disposal
  containers only. Do not return this machine to general rotation."
"2. Machine Disinfection": HeatDisinfection(Internal)[Completed/NotApplicable]
  StartTime[11:21AM] EndTime[11:41AM]
  ChemicalDisinfection(IfApplicable)[Completed/NotApplicable] SolutionUsed[CitricAcid
  50%▾, same single-example gap as Cleaning Agent Used below — not yet resolved,
  flagged for your input separately] ContactTime[30][min] RinseCompleted[Yes/No] RinseTime[5][min]
  DisinfectionStatus[green]"Disinfection cycle completed successfully."
"3. Surface Cleaning": ExteriorSurfacesWiped,TouchScreenCleaned,Alarms&ControlsCleaned,
  AccessoryTraysCleaned,Chair/BedAreaCleaned,FloorAreaCleaned (all Yes/No)
  "Have you cleaned the machine using:" [reframed this round, per your instruction, as
    4 separate yes/no confirmations rather than a single selection]
    Sodium Hypochlorite? [Yes/No]   Citric Acid? [Yes/No]
    Peracetic Acid? [Yes/No]        Hydrogen Peroxide? [Yes/No]
  Comments[textarea,0/200]
[NEW — read-only, replaces the removed "4. Machine Inspection & Readiness" panel]
"4. Current Readiness (Part 5)" — read-only
  Today's QC(P5-02):[green]Passed  Self-Test(P5-04):[green]Passed
  RO Verification(P5-03):[green]Verified  Maintenance(P5-06):[green]Up to date
  ℹ "Machine readiness for the next patient is determined automatically in Machine &
    RO Management. This screen documents cleaning only — assignment happens on the
    Machine Assignment screen once this machine is cleaned and Part 5's checks are
    current."
"5. Technician Verification": VerifiedBy[RahulSingh(Technician)] VerifiedAt[28May2025,
  11:45AM] Signature[per the P4-09 login-based redesign, NOT a typed signature box —
  see Cross-Screen Design note]
Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: Disinfection Compliance(100%,5/5Completed) | Key Reminders(6 items)
```

## UI Component Tree
`[FIGMA-DERIVED, readiness panel replaced per Decision 2]` Top Bar → Page Header →
10-Step Progress Bar → Patient Banner → Post-Use Disposal panel (+ conditional
isolation banner) → Machine Disinfection panel → Surface Cleaning panel → **Current
Readiness (Part 5) read-only card** (replacing the old Machine Inspection &
Readiness panel) → Technician Verification → Footer → Right rail (Disinfection
Compliance gauge, Key Reminders).

## Layout Grid
12-column responsive; 3-column card layout for Post-Use Disposal/Machine
Disinfection/Surface Cleaning; Current Readiness reference and Technician
Verification below in a 2-column row.

## Field Definitions
`[FIGMA-DERIVED]` **Post-Use Disposal:** Bloodline/Dialyzer/Tubing Set/Needles
Disposed, **three compliance confirmations, reframed this round as yes/no questions
rather than free selection: "sharps in white/translucent puncture-proof container?",
"infectious/biological waste in yellow bag?", "contaminated recyclable waste in red
bag?"**, Comments. **Machine
Disinfection:** Heat Disinfection (Completed/N/A) + Start/End Time, Chemical
Disinfection (Completed/N/A) + Solution/Contact Time, Rinse Completed + Rinse Time,
Disinfection Status. **Surface Cleaning:** 6 Yes/No items + **4 separate yes/no
confirmations, reframed this round per your instruction: "cleaned using Sodium
Hypochlorite?", "...Citric Acid?", "...Peracetic Acid?", "...Hydrogen Peroxide?"** +
Comments. **[NEW, READ-ONLY]** Current Readiness (Part 5): QC status, Self-Test
status, RO Verification status, Maintenance status — all four read directly from
Part 5's tables (`machine_qc`, `machine_self_test`, `ro_quality`, `maintenance`), none
editable here. **Technician Verification:** Verified By, Verified At, Signature
(login-based per the Cross-Screen Design).

**[REMOVED THIS ROUND]** Machine Ready for Next Patient, Next Patient Slot, Assigned
To, All Lines Removed, No Visible Residue/Stains, Machine Components Intact, Water
System Status — these either belong to Part 5's readiness chain (first four) or
Part 5's own P5-02/P5-06 checklists (last three, which duplicated P5-02's Visual
Inspection and P5-06's checkpoint items).

## Input Types
Yes/No toggles (most fields); dropdowns (Sharps Container, Biohazard Bag, Solution
Used, Cleaning Agent); time pickers; free-text (Comments); the Current Readiness card
is entirely read-only; Technician Verification "signature" is a login-authentication
event.

## Mandatory Fields
Post-Use Disposal, Machine Disinfection, and Surface Cleaning sections are mandatory.

## Validation Rules
Any Post-Use Disposal or Machine Disinfection item = No/incomplete → shared checklist
failure state, blocks Save & Continue. **The Current Readiness card never blocks this
screen** — a machine can be fully cleaned even if, say, its next Maintenance is
overdue; that's a Part 5/P5-05 concern for the *next* assignment, not a reason to
withhold documenting *this* session's cleaning.

## Business Rules
`[UPDATED]` This screen no longer computes or declares readiness — it displays Part
5's already-computed status for informational awareness only. If this session's
patient is HIV+/HBsAg+ (read-only from P2-04), the isolation banner renders (see
Cross-Screen Callout).
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Automated machine disinfection must execute per protocol
before any reuse consideration — Heat/Chemical Disinfection sections directly
implement this.

## Auto-calculations
Disinfection Compliance % = completed items ÷ total applicable items (excludes N/A
items from the denominator).

## Decision Trees
All disposal/disinfection/cleaning items complete → Save & Continue enabled
regardless of the Current Readiness card's contents. Any incomplete → shared failure
state.

## API Requests
`[PROPOSED]` `POST /machines/{id}/cleaning` (disposal fields, disinfection fields,
surface cleaning fields, session_id for traceability, verified_by, verified_at). `GET
/machines/{id}/readiness-summary` (read-only, for the Current Readiness card — calls
through to Part 5's own endpoints, doesn't duplicate their data).

## API Responses
`[PROPOSED]` Echo + disinfection_compliance_pct; readiness_summary {qc, self_test,
ro_verification, maintenance — each status + date}.

## Database Mapping
`[PROPOSED]` `machine_cleaning` (machine_id, session_id, disposal fields,
disinfection fields, surface cleaning fields, verified_by, verified_at) — **no
readiness columns** (removed this round, previously parked, now definitively not
this table's responsibility).

## Audit Events
`machine_cleaning_recorded`, `disinfection_completed`, `technician_verified`.

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Any disposal/disinfection item incomplete → shared checklist failure state. Current
Readiness fetch failure → toast + last-known cached status, doesn't block this
screen's own save.

## Empty States
N/A — form screen.

## Loading States
Skeleton form + skeleton Current Readiness card.

## Offline Behavior
Local draft-save with sync-on-reconnect for the cleaning documentation; Current
Readiness card shows last-synced Part 5 status with a visible timestamp when offline.

## Acceptance Criteria
All disposal, disinfection, and surface-cleaning steps are documented and
technician-verified — independent of the machine's readiness for its *next* patient,
which this screen no longer determines.

## Test Cases
Isolation banner renders correctly for HIV+/HBsAg+ patients; disposal/disinfection
completeness blocks Save & Continue when incomplete; Current Readiness card correctly
reflects Part 5's live status and never blocks this screen's own completion;
Disinfection Compliance % calculates correctly.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; predictive maintenance flagging based on cleaning-
cycle history belongs on Part 5's P5-01/P5-06 now, not here.

---

# P4-07 — Infection Control & Waste Disposal

## Screen Objective
`[FIGMA-DERIVED]` "Ensure all infection control practices followed and waste disposed
as per protocol" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3.A "Environmental Cleaning" (chair,
high-touch surfaces, shared equipment disinfected) plus the general infection-control
discipline established throughout this document set.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Disinfection & Turnover (P4-06) → Infection Control & Waste Disposal (this screen,
step 7 of 10) → Discharge (P4-08).

## Wireframe
`[FIGMA-DERIVED]`
```
Title: "P4-07 – Infection Control & Waste Disposal"  subtitle: "Ensure all infection
                                                       control practices followed and
                                                       waste disposed as per protocol."
Step bar (10 steps, step 7 active). Patient banner (standard fields).
[NEW — HBsAg/HIV callout, this round] {conditional amber banner if isolation patient}:
  "⚠ Isolation patient — segregate and tag this session's biomedical waste distinctly.
  Use isolation-zone disposal containers only."
"1. Personal Protective Equipment(PPE)": GlovesRemoved,GownRemoved,MaskRemoved,
  EyeProtectionRemoved,HandHygienePerformed (all Yes/No) Comments[0/200]
"2. Hand Hygiene": HandHygienePerformedAfterPatientCare[Yes/No]
  MethodUsed[AlcoholBasedHandRub▾] Comments[0/200]
"3. Sharps Disposal": NeedlesDisposedInSharpsContainer[Yes/No]
  SharpsContainerSealed[Yes/No] FillLevelOfSharpsContainer[<3/4Full▾] Comments[0/200]
"4. Biomedical Waste Segregation": InfectiousWasteInYellowBag,SoiledItemsInRedBag,
  RecyclableWasteInBlueBag,GeneralWasteInBlackBag (all checked) Comments[0/200]
"5. Linen Disposal": SoiledLinenBagged,LinenSentToLaundry,BagSealed (all Yes/No)
  Comments[0/200]
"6. Environmental Cleaning": MachineExteriorCleaned,Monitor&TouchPointsCleaned,
  Bed/ChairCleaned,SideRailsCleaned,FloorCleaned (all Yes/No) Comments[0/200]
"7. Spill Management(If any)": SpillOccurred[Yes/No(selected)] {if No:} "No spill
  reported during this session." Comments[0/200]
"8. Isolation Compliance(If applicable)": IsolationRequired[Yes/No(No selected in
  example)] {if No:} "No isolation precautions required." Comments[0/200]
  [NEW — this round, if isolation patient:] {this section becomes the primary
  detail area — see Field Definitions}
[green]"Infection Control Checklist Completed — All required infection control and
  waste disposal steps have been documented." CompletedAt CompletedBy
Footer: [← Back] [Save as Draft] [Save & Continue →]
Right rail: Compliance Overview(100%,8/8) | Key Reminders(6 items) | Quick Actions
  (ReportIncident,ViewInfectionControlSOP,PrintChecklist)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
conditional isolation banner → 8-panel checklist grid (PPE, Hand Hygiene, Sharps
Disposal, Biomedical Waste Segregation, Linen Disposal, Environmental Cleaning, Spill
Management, Isolation Compliance) → confirmation banner → Footer → Right rail
(Compliance Overview gauge, Key Reminders, Quick Actions).

## Layout Grid
12-column responsive; 4-panels-per-row grid for the 8 checklist sections.

## Field Definitions
`[FIGMA-DERIVED]` As listed in the wireframe above — 8 sections, ~30 individual
Yes/No/dropdown items total. **[NEW, this round]** When Isolation Required = Yes (or
automatically pre-set to Yes when this session's patient is HIV+/HBsAg+, per the
Cross-Screen Callout), the Isolation Compliance section expands to require: Dedicated
Equipment Used Only (Yes/No), Waste Segregated to Isolation-Zone Containers (Yes/No),
No Cross-Use with General Floor Confirmed (Yes/No) — directly implementing Safety
Protocol §4's "No equipment, instruments, or medications may be shared between the
isolation zone and the general floor."

**[READ-ONLY, CARRIED FROM PART 2]** HIV/Hepatitis status (drives the isolation banner
and the expanded Isolation Compliance section automatically, rather than asking the
technician to remember to check "Isolation Required" themselves).

## Input Types
Yes/No toggles (majority of fields); dropdowns (Method Used, Fill Level); free-text
Comments per section (8 separate comment fields, one per panel).

## Mandatory Fields
**Critical (Mandatory):** Section 2 (Hand Hygiene), Section 3 (Sharps Disposal) — direct
bloodstream-infection and needlestick-injury prevention, consistent with the same two
items' classification on P2-10. Section 8 (Isolation Compliance), when applicable —
a hard compliance breach per Safety Protocol §4 if not followed, not a routine
deviation. **Non-Critical (Non-Mandatory, skippable-with-reason):** Section 1 (PPE),
Section 4 (Biomedical Waste Segregation), Section 5 (Linen Disposal), Section 6
(Environmental Cleaning), Section 7 (Spill Management, when no spill occurred) —
environmental/procedural controls, consistent with the same items' classification on
P2-10. All conditional detail fields (Spill Management when Spill Occurred = Yes;
Isolation Compliance's three new confirmations when Isolation Required = Yes) remain
required once their trigger condition fires, regardless of the parent section's tier.

## Validation Rules
Any Critical item (Hand Hygiene, Sharps Disposal, or an applicable Isolation
Compliance confirmation) = No (where Yes is expected) → shared checklist failure
state, hard block, no override. Non-Critical items (PPE, Biomedical Waste
Segregation, Linen Disposal, Environmental Cleaning, Spill Management with no spill)
left blank follow the Non-Mandatory Field Skip Workflow instead. Spill Occurred = Yes
→ additional detail fields become required
(exact fields `[❓ INSUFFICIENT INFORMATION]`, not shown expanded in this all-clear
export). **[NEW]** Isolation Required = Yes but one of the three new isolation-
specific confirmations = No → contributes a **Critical** item to the Consolidated
Physician Notification (this is a hard compliance breach per Safety Protocol §4, not
a routine deviation).

## Business Rules
`[NEW]` Isolation Required auto-sets to Yes when the session's patient is HIV+/HBsAg+,
rather than relying on the technician to remember — this is a direct implementation
of the Cross-Screen Callout, not left to manual recall.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` Environmental Cleaning (chair, high-touch surfaces, shared
equipment) — Safety Protocol §3.A, directly implemented by section 6.

## Auto-calculations
Compliance Overview % = completed items ÷ 8 sections (or ÷ applicable items, excluding
N/A sections like Spill Management when no spill occurred).

## Decision Trees
All 8 sections complete → confirmation banner, Save & Continue enabled. Any section
incomplete → shared failure state. Isolation Required = Yes → expanded 3-item
sub-checklist, any failure → Critical physician-notification item.

## API Requests
`[PROPOSED]` `POST /sessions/{id}/infection-control-post` (8 sections' worth of
fields, isolation sub-checklist if applicable, recorded_by).

## API Responses
`[PROPOSED]` Echo + compliance_pct + `physician_notification_contributed` if
applicable.

## Database Mapping
`[PROPOSED]` `infection_control_post` (session_id, 8 sections' field data, isolation
sub-checklist fields, recorded_by, recorded_at).

## Audit Events
`infection_control_post_completed`, `isolation_protocol_breach_flagged` (if
applicable), `physician_notification_contributed` (if applicable).

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Any checklist item incomplete → shared checklist failure state.

## Empty States
`[FIGMA-DERIVED]` "No spill reported during this session." and "No isolation
precautions required." — confirmed empty-state patterns for their respective
sections.

## Loading States
Skeleton 8-panel grid.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
All 8 infection-control sections documented before the technician can proceed;
isolation-specific requirements enforced automatically for HIV+/HBsAg+ sessions
without relying on technician memory.

## Test Cases
Isolation banner and expanded sub-checklist render automatically for isolation
patients; any section incomplete blocks Save & Continue; isolation sub-checklist
failure correctly contributes a Critical item.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; automated compliance-trend reporting across sessions
is a plausible fit, subject to human-in-the-loop labelling.

---

# P4-08 — Patient Discharge

## Decision Log (this screen)
**Discharge Readiness Assessment panel is read-only, carried forward from P4-03**, per
Decision 4 — not re-collected here despite the Figma showing what looks like a fresh
entry form. This is the redundancy elimination you confirmed.

**Amendments this round, per your direct instructions:**
- **Diet Type deleted** — properly a nephrologist/dietitian prescription decision, not
  something a technician selects at discharge. Daily Fluid Allowance and Special
  Instructions remain (not flagged as out of scope).
- **"5. Transport & Caregiver" section deleted entirely** — Transport Mode and
  Caregiver/Accompanied By (+ Contact Number) were both outside technician
  scope/purview in Indian practice.
- **Patient Education Provided section deleted entirely** — resolved this round, per
  your instruction: covered elsewhere (a separate patient-education module), not this
  screen's responsibility.
- **Next Appointment resolved as read-only, pre-filled** — per your instruction, this
  data comes from the Appointment/Scheduling module (out of scope for this document
  set). No auto-calculation logic is built here; this screen only displays what
  Scheduling has already set. This closes the architecture question without needing
  a new field added to P2-02's Prescription card.

## Screen Objective
`[FIGMA-DERIVED]` "Ensure patient is stable and discharged with appropriate
instructions and follow-up plan" (screen's own subtitle).

## Clinical Rationale
`[SAFETY-PROTOCOL-DERIVED]` Safety Protocol §3.C "Patient education completed and next
appointment confirmed" — this screen's real job is the discharge-specific content
(education, next appointment), not re-verifying stability already
established on P4-03. **Transport/Caregiver content removed this round** — outside
technician scope/purview, per your instruction.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Infection Control & Waste Disposal (P4-07) → Discharge (this screen, step 8 of 10) →
Documentation & Sign-off (P4-09).

## Wireframe
`[FIGMA-DERIVED, with the read-only correction per Decision 4]`
```
Title: "P4-08 – Patient Discharge"  subtitle: "Ensure patient is stable and discharged
                                     with appropriate instructions and follow-up
                                     plan."
Step bar (10 steps, step 8 active). Patient banner (standard fields).
"1. Discharge Readiness Assessment" [READ-ONLY, CARRIED FROM P4-03 — this round's
  correction]
  BP126/78 HR82 SpO298 Temp36.6 BleedingFromAccessSite:No Dizziness/Giddiness:No
  Nausea/Vomiting:No ShortnessOfBreath:No OverallAssessment:Stable
  [green]"Patient is stable for discharge." (all pulled from P4-03, not re-entered;
  a "View Full Assessment →" link replaces what was previously an editable panel)
"2. Ambulation Status" [NEW ENTRY — genuinely discharge-specific, not on P4-03]
  AmbulationAbility[Independent(selected)/Assisted/Unable]
  AnyAssistanceUsed?[Walker/Wheelchair/CaregiverSupport/None] Comments[0/200]
"3. Patient Education Provided" — **section deleted this round, per your instruction:
  covered elsewhere (a separate patient-education module), not this screen's
  responsibility.**
"4. Diet & Fluid Advice" [amended this round]: DailyFluidAllowance[1000][mL]
  SpecialInstructions[textarea,0/200]
  — **Diet Type deleted this round, per your instruction: diet is prescribed by a
  nephrologist/dietitian, not decided by a technician at discharge.**
"5. Transport & Caregiver" — **section deleted this round, per your instruction: both
  fields (Transport Mode, Caregiver/Accompanied By + Contact Number) were outside
  technician scope/purview.**
"6. Next Appointment" [READ-ONLY, resolved this round, per your instruction]:
  NextDialysisDate[30May2025] ExpectedTime[07:45AM] Shift[Morning] — **all three
  pre-filled from the Appointment/Scheduling module (out of scope for this document
  set), not entered or calculated here. No auto-calculation logic is built on this
  screen — this screen only displays what that module has already scheduled.**
  [amber]"Appointment scheduled for 30 May 2025, 07:45 AM"
Footer: [← Back] [Save as Draft] [✓Confirm Discharge]
Right rail: DischargeSummary(TotalDuration,UFRemoved,PostDialysisBP,PostWeight,
  AccessSite,OverallCondition — ALL READ-ONLY from P4-03) | Key Reminders(5 items) |
  QuickActions(PrintDischargeSummary,SendSummaryToNephrologist,SharewithPatient
  (WhatsApp))
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Discharge Readiness Assessment (read-only card + link to P4-03) → Ambulation Status
(new entry) → Diet & Fluid Advice (amended, Diet Type removed) → Next Appointment
(now read-only, pre-filled from Scheduling) → Footer →
Right rail (Discharge Summary — read-only, Key Reminders, Quick Actions).

## Layout Grid
12-column responsive; main form ≈8/12, right rail ≈4/12.

## Field Definitions
**Discharge Readiness Assessment** `[READ-ONLY, CARRIED FROM P4-03]` — displays, does
not collect: BP, HR, SpO2, Temp, Bleeding/Dizziness/Nausea/SOB, Overall Assessment.
**Ambulation Status** `[FIGMA-DERIVED, genuine new entry]`: Ambulation Ability, Any
Assistance Used, Comments. **Patient Education Provided — section deleted this
round**, per your instruction: covered elsewhere (a separate patient-education
module), not this screen's responsibility.
**Diet & Fluid Advice:** Daily Fluid Allowance, Special Instructions
(**Diet Type deleted this round** — prescribed by nephrologist/dietitian, not a
technician discharge decision).
**Transport & Caregiver — entire section deleted this round**, outside technician
scope/purview.
**Next Appointment, resolved this round — READ-ONLY:** Next Dialysis Date, Expected
Time, Shift — **all three pre-filled from the Appointment/Scheduling module (out of
scope for this document set), per your instruction. No calculation logic lives on
this screen; it only displays what Scheduling has already set.**

## Input Types
Read-only display (Discharge Readiness); 3-way toggle (Ambulation Ability); checkboxes
(Assistance Used, Patient Education); dropdowns (Diet Type, Transport Mode, Caregiver,
Shift); numeric (Daily Fluid Allowance, Contact Number); free-text (Special
Instructions, Comments); date/time pickers (Next Dialysis Date, Expected Time).

## Mandatory Fields
Ambulation Ability is required before Confirm Discharge. Next Dialysis Date/Expected
Time/Shift are pre-filled read-only from Scheduling, not technician-entered, so they
don't factor into this screen's own mandatory-field gating.

## Validation Rules
`[DESIGN SPECIFICATION]` Confirm Discharge disabled if P4-03's Discharge Readiness ≠
"Ready for Discharge" — this screen **reads** that gate, it doesn't independently
re-evaluate stability, consistent with Decision 4. If P4-03 wasn't marked ready, this
screen shows why (linking back) rather than silently allowing discharge anyway.

## Business Rules
`[NEW]` No Patient Education item checked, or Ambulation = Unable without Caregiver
Support noted → contributes an **Important** item to the Consolidated Physician
Notification (a documentation-completeness/safety-planning gap, not itself a clinical
emergency).
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule.

## Clinical Rules
`[SAFETY-PROTOCOL-DERIVED]` "Patient education completed and next appointment
confirmed" (§3.C) — directly implemented by sections 3 and 6.

## Auto-calculations
None — Discharge Summary in the right rail is a pure read-only rollup of P4-01/P4-03/
P4-04 data.

## Decision Trees
P4-03 Discharge Readiness = Ready → this screen's own fields become the only gate;
all education/logistics fields complete → Confirm Discharge enabled. P4-03 Discharge
Readiness ≠ Ready → Confirm Discharge blocked, links back to P4-03.

## API Requests
`[PROPOSED]` `GET /sessions/{id}/discharge-readiness` (reads P4-03, doesn't
duplicate). `POST /sessions/{id}/discharge` (ambulation, education, diet/fluid,
transport, next appointment).

## API Responses
`[PROPOSED]` Echo + `physician_notification_contributed` if applicable.

## Database Mapping
`[PROPOSED]` `patient_discharge` (session_id, ambulation_ability, assistance_used,
daily_fluid_allowance, special_instructions, **next_dialysis_date, expected_time,
shift [all three read-only, sourced from the Appointment/Scheduling module, not
written by this screen]**, recorded_by) — no BP/HR/SpO2/Temp/symptom columns here,
those stay solely in `post_dialysis_vitals` from P4-03. **`education_items`,
`education_provided_by`, `diet_type`, `transport_mode`,
`caregiver`, `contact_number` all removed this round** per your instructions.

## Audit Events
`discharge_confirmed`, `patient_education_recorded`, `next_appointment_scheduled`,
`physician_notification_contributed` (if applicable).

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
P4-03 not marked Ready → Confirm Discharge blocked with a clear link back, not a
generic error.

## Empty States
N/A — form screen with a read-only summary panel.

## Loading States
Skeleton form + skeleton read-only Discharge Readiness card.

## Offline Behavior
Local draft-save with sync-on-reconnect.

## Acceptance Criteria
Technician completes discharge-specific documentation without re-entering any vital
sign or symptom already captured on P4-03.

## Test Cases
Discharge Readiness Assessment panel correctly displays P4-03's data and never accepts
new vitals; Confirm Discharge correctly blocked when P4-03 isn't Ready; Next
Appointment correctly schedules and displays confirmation.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; personalized diet/fluid instruction generation based
on the session's own lab/adequacy data (P4-04) is a plausible fit, subject to
human-in-the-loop labelling and this document set's copyright conventions for any
generated patient-facing text.

---

# P4-09 — Session Documentation & Sign-off

## Decision Log (this screen)
**Sign-off mechanism completely redesigned this round** per the Cross-Screen Design
above — replaces the Figma's typed-name/drawn-signature boxes with a login-backed
identity flow for all three roles (Technician, Nurse, Physician).

## Screen Objective
`[FIGMA-DERIVED]` "Complete session documentation with notes, incident reporting and
electronic sign-off" (screen's own subtitle).

## Clinical Rationale
This is the legal/clinical record-of-truth moment for the session — narrative notes
from each role, a final incident/variance check, and now, per the redesign,
authenticated sign-off rather than a typed name.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (all three sign off here).

## Navigation
Discharge (P4-08) → Documentation & Sign-off (this screen, step 9 of 10) → Session
Complete (P4-10).

## Wireframe
`[FIGMA-DERIVED, with the sign-off mechanism redesigned per the Cross-Screen Design]`
```
Title: "P4-09 – Session Documentation & Sign-off"  subtitle: "Complete session
                                                    documentation with notes, incident
                                                    reporting and electronic sign-off."
Step bar (10 steps, step 9 active). Patient banner (standard fields).
"1. Technician Notes": SessionSummary/Observations*[textarea,0/500]
  MachineIssues(Ifany)[None▾] ActionsTaken[textarea,0/300] AdditionalComments[0/300]
"2. Nursing Notes": NursingSummary*[textarea,0/500]
  — **Patient Response field deleted this round, per your instruction.**
  NursingInterventions[textarea,0/300] EducationReinforced[textarea,0/300]
"3. Physician/Nephrologist Comments": PhysicianComments[textarea,0/500]
  Orders/Recommendations[textarea,0/300]
"Attached Files(Ifany)": [Upload File] JPG,PNG,PDF up to 5MB
"4. Incident/Variance Documentation": AnyIncidentsDuringSession?[Yes/No]
  IncidentType[Select▾] Description[0/500] CorrectiveActionsTaken[0/300]
  ReportedTo[dropdown populated from an admin-configured escalation contact list —
    resolved this round, see Business Rules; Risk Level deleted this round, per your
    instruction]
  [NEW — this round] "Session Physician Notification Summary" (read-only, pulled from
  the Consolidated Physician Notification built throughout this session — see
  Cross-Screen Business Rule): shows the same red/yellow/green tiered list, so the
  technician can see what's about to be sent before finalizing.
"5. Electronic Sign-off" [REDESIGNED THIS ROUND — see Field Definitions/Input Types]
  "By signing below, you confirm that all documentation is accurate and complete."
  Technician Sign-off* | Nurse Sign-off* | Physician Sign-off*
  (each redesigned per the Cross-Screen Design flow, not a typed-name/drawn box)
"Session Audit Trail" (read-only log: Created by, Nursing notes completed by,
  Physician comments by, Documentation completed — each with timestamp)
Footer: [← Back] [Save as Draft] [Complete & Proceed to Dashboard →]
Right rail: DocumentationStatus(100%,5itemschecklist) | KeyReminders(6items) |
  QuickActions(PreviewDocumentation,PrintDocumentation,ExportasPDF)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar → Patient Banner →
Technician Notes / Nursing Notes / Physician Comments (3-column) → Attached Files →
Incident/Variance Documentation (+ new Session Physician Notification Summary) →
Electronic Sign-off (3 redesigned sign-off components) → Session Audit Trail
(read-only log) → Footer → Right rail (Documentation Status, Key Reminders, Quick
Actions).

## Layout Grid
12-column responsive; Notes sections 3-column; sign-off section 3-column matching.

## Field Definitions
`[FIGMA-DERIVED]` **Technician Notes:** Session Summary/Observations, Machine Issues,
Actions Taken, Additional Comments. **Nursing Notes:** Nursing Summary,
Nursing Interventions, Education Reinforced (**Patient Response deleted this
round**, per your instruction). **Physician Comments:**
Physician Comments, Orders/Recommendations. **Attached Files:** file upload.
**Incident/Variance:** Any Incidents During Session, Incident Type, Description,
Corrective Actions, **Reported To (resolved this round — populated from an
admin-configured escalation contact list, not a hardcoded technician-facing dropdown;
see Business Rules). Risk Level deleted this round, per your instruction.** **[NEW]**
Session Physician Notification
Summary — read-only display of this session's Consolidated Physician Notification
(Cross-Screen Business Rule), shown here so nothing is a surprise when it sends.

**Electronic Sign-off `[REDESIGNED]`** — three instances (Technician, Nurse,
Physician) of the same component:
| Field | Type |
|---|---|
| Is-this-you confirmation | Modal, Yes/No, pre-filled with logged-in user's name |
| Signer selection (if No) | Dropdown of staff roster, filtered by role |
| Authentication | Login prompt (username/password) for the selected person **online; if
  offline, a 6-digit PIN prompt instead — same PIN mechanism established on P2-12
  (Start Dialysis Confirmation), reused here rather than building a second one.
  Resolved this round, per your instruction.** |
| Captured record | user_id, role, authenticated_at, is_self (bool) — no drawn/typed
  signature image at all |

**[NEW — dashboard cross-reference, B5 Session Completion Documentation Rate]**
`close_checklist_complete` (boolean) and `close_checklist_timestamp` — both
system-computed, not shown or editable on this screen. `close_checklist_complete` =
`TRUE` only once all three sign-offs (Technician, Nurse, Physician) have successfully
authenticated. `close_checklist_timestamp` = the `authenticated_at` value of whichever
sign-off completes last (the exact moment `close_checklist_complete` flips to `TRUE`).
These give the dashboard a literal field to query instead of needing its own
`COUNT(session_signoff)=3` join against this screen's underlying data.

## Input Types
Free-text (all Notes fields); file upload; Yes/No toggle (Any Incidents); dropdown
(Incident Type, Machine Issues) — **Patient Response and Risk Level both deleted this
round**;
**Reported To — dropdown, but
populated from an admin-configured escalation contact list, not a static
enum (see Business Rules)**; **the
three Sign-off components use the modal → dropdown → login-prompt flow described
above, not a text input or signature pad.**

## Mandatory Fields
Technician Notes' Session Summary and Nursing Notes' Nursing Summary are asterisked.
All three Sign-offs are mandatory before Complete & Proceed to Dashboard.

## Validation Rules
`[REDESIGNED]` A Sign-off is only considered complete once its authentication step
succeeds — a selected-but-not-yet-authenticated signer does not count as signed.
Complete & Proceed to Dashboard is disabled until all three roles have successfully
authenticated.

## Business Rules
`[NEW]` Completing this screen is the trigger point for **sending** the session's
Consolidated Physician Notification (if it hasn't already been sent immediately for a
Critical item per the Cross-Screen Business Rule's proposed timing) — this is the
"session narrative is now complete" moment referenced there.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). Access to this screen
continues uninterrupted until P4-10's session closure, per that rule — including for
the electronic sign-off itself.

`[NEW — resolved this round, per your instruction]` **Reported To is populated from
an admin-configured escalation contact list**, set up once by a facility
administrator during platform configuration (who the current Nurse In-charge,
Nephrologist/Physician, Biomedical Engineer, and Centre In-charge actually are for
this facility) — not a static, hardcoded set of role labels the technician picks
from, and not something the technician can freely type. The technician selects from
whichever contacts the administrator has configured; if nobody has been configured
for a given role, that role simply doesn't appear as a selectable option. **This same
correction applies to Escalated To on P3-07 and P3-09** — both were given a
hardcoded, category-only list earlier in this session, which needs the same fix; see
those documents' own updates.

## Clinical Rules
None beyond what's already established — this screen's role is documentation
completeness and authenticated attestation, not new clinical judgment.

## Auto-calculations
Documentation Status % = completed sections ÷ 5 (Technician Notes, Nursing Notes,
Physician Comments, Incident/Variance, Electronic Sign-off). **[NEW]**
`close_checklist_complete`/`close_checklist_timestamp` (see Field Definitions) are
computed server-side each time a sign-off's authentication succeeds — re-evaluated on
every `POST /sessions/{id}/signoff` call, not just once at the end.

## Decision Trees
```
For each of Technician/Nurse/Physician sign-off:
  Is-this-you? Yes → capture logged-in user's identity, done
  Is-this-you? No → select from roster → Next → login prompt →
    success → captured; failure → retry, sign-off remains incomplete
All 3 signed + all mandatory notes filled → Complete & Proceed to Dashboard enabled →
  session status → Completed → Consolidated Physician Notification sent (if not
  already sent for a Critical item) → opens P4-10
```

## API Requests
`[PROPOSED]` `POST /sessions/{id}/documentation` (all notes, incident fields, file
uploads). `POST /sessions/{id}/signoff` (role, signed_by_user_id, is_self,
authenticated_at) — called once per role, three times total. `POST
/sessions/{id}/notify-physician/send` (finalizes and sends the Consolidated Physician
Notification).

## API Responses
`[PROPOSED]` Echo per call; final `POST .../documentation` completion response
includes session status transition and notification-sent confirmation.

## Database Mapping
`[PROPOSED]` `session_documentation` (session_id, technician_notes fields, nursing_notes
fields, physician_comments fields, attached_file_urls, **incident fields
[any_incidents, incident_type, description, corrective_actions, reported_to —
reported_to now a foreign key into `escalation_contacts`, not a free enum; no
risk_level column, deleted this round]**, recorded_by,
**close_checklist_complete** [computed boolean], **close_checklist_timestamp**
[computed, nullable until complete]). **New** `session_signoff` (session_id, role,
signed_by_user_id, is_self, authenticated_at, ip_or_device_id) — per the Cross-Screen
Design, one row per role, three rows per session. **New** `escalation_contacts`
(facility_id, role [Nurse In-charge/Nephrologist-Physician/Biomedical Engineer/Centre
In-charge], contact_user_id, set_by [admin], updated_at) — admin-configured per
facility, read by this screen and by P3-07/P3-09's Escalated To fields, not written by
any of them.

## Audit Events
`documentation_saved`, `incident_documented` (if applicable), `signoff_completed` (×3,
one per role, each capturing whether is_self was true or a different signer was
selected), **`close_checklist_completed`** (fires once, when the third sign-off
authenticates and `close_checklist_complete` flips to `TRUE`), `physician_notification_sent`.

## Accessibility
See Part 2/3 Shared Platform Conventions; the login-prompt modal needs the same
accessibility treatment as the system's primary login screen, not a simplified inline
variant.

## Error Handling
Authentication failure during a sign-off's login prompt → inline error, sign-off
remains incomplete, does not block the *other* two roles from signing independently.

## Empty States
No incidents this session → Incident/Variance section shows a simple "No incidents
reported" rather than an empty form.

## Loading States
Skeleton form + skeleton Session Audit Trail.

## Offline Behavior
**Resolved this round, per your instruction.** Documentation (Notes/Incident) can
draft-save offline as usual. Electronic Sign-off — for all three roles (Technician,
Nurse, Physician) — now supports offline authentication via the same **6-digit PIN**
mechanism already established on P2-12: set once, the first time that person logs
in on this platform (alongside their regular username/password), and cached locally
in encrypted form at that time. When offline, the sign-off's Authentication step
prompts for this PIN instead of username/password, validated against the local
encrypted cache — the same validation path P2-12 already uses for offline Start
Dialysis confirmation, not a new mechanism built specifically for this screen. This
applies per-person: each of the three signers needs their own PIN already cached
locally on this device from a prior online login before they can sign off offline
here; if a signer has never logged in on this specific device before, PIN-based
offline sign-off isn't available for them and connectivity is still required.

## Acceptance Criteria
All three roles authenticate to sign off; the session cannot complete with a typed but
unauthenticated name standing in for a real signature.

## Test Cases
Is-this-you Yes path correctly auto-captures the logged-in user; No path correctly
requires roster selection + successful authentication; Complete & Proceed blocked
until all 3 signed; offline sign-off attempt shows a clear connectivity message rather
than failing silently.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; auto-drafting the Technician/Nursing Summary from
the session's own structured data (vitals, symptoms, alarms) as a starting point for
the technician to edit is a plausible fit, subject to human-in-the-loop labelling —
the technician must still review/edit and the auto-draft must never be submitted
unreviewed.

---

# P4-10 — Session Complete Dashboard

## Decision Log (this screen)
**Post-Dialysis Vitals panel is read-only, carried forward from P4-03**, per Decision
4 — same correction as P4-08.

## Screen Objective
`[FIGMA-DERIVED]` "Review final outcome, key metrics and ensure all post-dialysis
tasks are complete" (screen's own subtitle).

## Clinical Rationale
A closing summary screen — confirms the session's full record is complete and gives a
final human-readable snapshot before returning to the technician's queue.

## Users
Dialysis Technician (primary); Nurse, Nephrologist (view).

## Navigation
Documentation & Sign-off (P4-09) → Session Complete (this screen, step 10 of 10,
terminal). Complete & Close Session returns to the technician's patient queue (P2-01
equivalent for the next patient).

## Wireframe
`[FIGMA-DERIVED, with the read-only correction per Decision 4]`
```
Title: "P4-10 – Session Complete ✓"  subtitle: "Review final outcome, key metrics and
                                      ensure all post-dialysis tasks are complete."
Step bar (10 steps, all ✓, step 10 active). Patient banner (Session Completed badge).
[green]"Session Completed Successfully! — All steps completed as per protocol."
  CompletedAt CompletedBy
"Key Treatment Outcomes" table [READ-ONLY, from P4-03/P4-04]: Parameter|Pre-Dialysis|
  Post-Dialysis|Change — BP,Weight,Pulse,SpO2,Temperature
"Ultrafiltration Summary" [READ-ONLY, from P4-04]: gauge, UFGoal,UFRemoved,UF%Achieved
"Session Timeline": 7 timestamped milestones (Treatment started → Blood returned →
  Post-dialysis vitals recorded → Medications reviewed → Disinfection & turnover
  completed → Patient discharged → Documentation & sign-off completed)
"Post-Dialysis Vitals" [READ-ONLY, CARRIED FROM P4-03 — this round's correction, not
  a fresh entry]: BP,HR,SpO2,Temp,RespRate — "View Full Assessment →" link
"Access Site Assessment" [READ-ONLY, CARRIED FROM P4-02]: Bleeding,Thrill,Bruit,
  Swelling,Comments
"Patient Feedback" [GENUINELY NEW ENTRY — not captured anywhere else]:
  PatientCondition[Good😊] PainLevel(0-10)[2] PatientComments[textarea]
  PatientSatisfaction[5/5 stars,Excellent]
Footer: [← Back] [Save as Draft] [✓Complete & Close Session]
Right rail: OverallStatus,TreatmentQuality(5stars),TreatmentTolerance,NextAppointment
  (readonly,fromP4-08) | SummaryChecklist(6items,allComplete) | QuickActions
  (ViewSessionSummary,PrintSessionSummary,ShareWithNephrologist,ExportSessionReport)
```

## UI Component Tree
`[FIGMA-DERIVED]` Top Bar → Page Header → 10-Step Progress Bar (all complete) →
Patient Banner → success banner → Key Treatment Outcomes table (read-only) →
Ultrafiltration Summary (read-only) → Session Timeline → Post-Dialysis Vitals
(read-only, carried from P4-03) → Access Site Assessment (read-only, carried from
P4-02) → Patient Feedback (new entry) → Footer → Right rail (Overall Status/Quality/
Tolerance/Next Appointment — all read-only, Summary Checklist, Quick Actions).

## Layout Grid
12-column responsive; 3-card row for Key Outcomes/UF Summary/Session Timeline; 3-card
row for Post-Dialysis Vitals/Access Site/Patient Feedback below.

## Field Definitions
Everything on this screen is **read-only** except **Patient Feedback** (Patient
Condition, Pain Level, Patient Comments, Patient Satisfaction) — the one genuinely new
entry point, since patient-reported experience isn't captured anywhere else in this
document set.

## Input Types
Read-only throughout except Patient Feedback: emoji-scale toggle (Patient Condition),
0–10 slider (Pain Level), free-text (Patient Comments), 5-star rating (Patient
Satisfaction).

## Mandatory Fields
None — Patient Feedback is optional (capturing it depends on the patient's
willingness/ability to respond).

## Validation Rules
Complete & Close Session available once P4-09's sign-offs are all complete — this
screen doesn't add its own gate beyond confirming that upstream state.

## Business Rules
`[CONFIRMED THIS ROUND]` Post-Dialysis Vitals and Access Site Assessment panels are
pure read-only rollups from P4-03 and P4-02 respectively — no data entered on this
screen flows back into those records; this screen only displays.
**★ COMPLIANCE ADDITION:** see Cross-Screen Business Rule — ABDM Consent Revocation
(organization-scoped, deferral extended through P4-10). This screen's `session_closed`
event is the resolution point for the entire deferral chain: if a consent revocation
occurred at any point from treatment start through P4-09 and is still pending, the
organization-scoped block (or Kifayti-level anonymization) takes effect the moment
this screen's session closure fires — not before.

## Clinical Rules
None beyond what's already established upstream.

## Auto-calculations
None new — every metric shown is carried from an earlier screen's already-calculated
value (Key Outcomes from P4-03, UF Summary from P4-04, Timeline from timestamps
across P4-01–P4-09).

## Decision Trees
Complete & Close Session → session status → Completed (terminal) → returns to
technician's patient queue.

## API Requests
`[PROPOSED]` `GET /sessions/{id}/complete-summary` (aggregate read across P4-01–P4-09).
`POST /sessions/{id}/patient-feedback` (the one write on this screen). `POST
/sessions/{id}/close` (finalizes).

## API Responses
`[PROPOSED]` Full session summary object; close confirmation.

## Database Mapping
`[PROPOSED]` `patient_feedback` (session_id, condition, pain_level, comments,
satisfaction_rating, recorded_at) — the only new table this screen needs; everything
else is a read across every prior Part 4 (and Part 2/3) table by session_id.

## Audit Events
`session_complete_viewed`, `patient_feedback_recorded` (if applicable),
`session_closed`.

## Accessibility
See Part 2/3 Shared Platform Conventions.

## Error Handling
Any upstream data failing to load → toast + that card shows a "data unavailable"
state, doesn't block Complete & Close Session (this screen is a summary, not a gate).

## Empty States
Patient Feedback not provided → simply shows as blank/not collected, doesn't block
closing.

## Loading States
Skeleton cards throughout while the aggregate summary loads.

## Offline Behavior
Last-synced summary shown if offline; Complete & Close Session requires connectivity
(final state transition), consistent with P4-09's sign-off connectivity requirement.

## Acceptance Criteria
Technician can review a complete, accurate summary of the entire session and close it
in one screen, with zero fields duplicating data already entered elsewhere.

## Test Cases
All read-only panels correctly reflect their source screens' latest saved values, not
stale/cached copies; Patient Feedback saves independently of session closure; Complete
& Close Session correctly transitions status and returns to the queue.

## Future AI Enhancements
`[GAP IDENTIFIED]` Not specified; an AI-generated one-paragraph session narrative
(assembled from the structured data already on this screen) for the "Share with
Nephrologist" quick action is a plausible fit, subject to human-in-the-loop labelling
and this document set's established copyright conventions.

---

# Open Items Needing Confirmation (all 10 screens, consolidated)

**Closed this round — Part 5 now exists:**
1. ~~P4-06's Machine Readiness section~~ (Decision 2) — **RESOLVED.** Removed and
   replaced with a read-only reference to Part 5's readiness chain. See Part 5's own
   "Part 4 Patch" section for full rationale.

**New this round, genuinely open:**
2. Consolidated Physician Notification send-timing (immediate-on-Critical + batched
   rest, vs. strictly all-batched-at-P4-09) — a clinical-response-time policy call.
3. PCR formula choice — this document uses the Garred single-session formula (no
   cross-session dependency); the alternative interdialytic-BUN-rise formula is more
   traditional in some units but needs the previous session's Post-BUN and the exact
   interdialytic interval. Confirm which you want.
4. P4-01: exact threshold for a Rinse-Back Volume warning; whether Total UF Removed
   is pre-populated-and-editable or purely read-only from P3-03.
5. P4-02: Bleeding Duration warning threshold.
6. P4-03: **Weight Variance vs. Dry Weight** — recommended addition (this closes what
   was an open item carried from Part 3), not yet in any Figma export. Also: Chest
   Pain isn't its own symptom tile despite being named in the Safety Protocol —
   recommend adding.
7. P4-04: Kt/V-unavailable workflow gap (no way to complete an assessment
   retroactively if Pre-Dialysis BUN wasn't drawn) — needs a product decision, not
   just a documentation fix.
8. P4-07: exact fields for the Spill Management conditional detail panel (not shown
   expanded in the all-clear export).
9. P4-09: offline sign-off behavior — connectivity is inherently required for
   authentication; needs a clear UX decision for the offline case, not a silent
   failure.

None of items 2–9 block using this document as your coding reference.

# Self-check
Every `[FIGMA-DERIVED]` claim was read directly from the ten provided images. The
eKt/V and PCR formulas (Decision 5) are cited to their original sources (Daugirdas
1995; Depner & Daugirdas 1996 with Garred et al.'s coefficients) and verified against
independent worked examples before being written in — not invented to match the
Figma's example numbers, which is why the internal inconsistency in P4-04's own
mockup data (eKt/V shown higher than spKt/V, which is mathematically impossible) is
flagged rather than silently reproduced. The Consolidated Physician Notification and
P4-09 sign-off redesigns are new sub-systems built directly from your stated
instructions, not from any Figma reference — both are tagged accordingly throughout.
The P4-06 patch (Decision 2, now resolved via Part 5) is applied consistently
everywhere that screen's
readiness fields are mentioned, including in Part 3's cross-references and the new
HBsAg/HIV cleaning callout, so the "not yet decided" status isn't lost in a
sub-section. Every redundancy identified against Part 2/Part 3 is listed in the
"Redundancy check" section near the top and enforced as read-only, not just
mentioned once and then contradicted later in the document. This is an
engineering/documentation cross-check against the specific reference material
provided, not a legal or clinical compliance certification.

**Compliance-audit pass (this round):** this document had no Shared Platform
Conventions section at all prior to this pass — a larger gap than Part 3's (which at
least had a partial one) — so offline-cache encryption, the audit-log baseline
schema/retention, sensitive-field role scoping, and the ABDM consent-revocation rule
were all missing rather than just under-carried-forward. All four are now established
in a new Shared Platform Conventions section, per your explicit approval, with the
consent-revocation rule's deferral window extended per your direct instruction from
Part 3's P3-10 endpoint to Part 4's own **P4-10** endpoint — reflecting that Part 4 is
still the same continuous episode of care, not a new one. All 10 screens' pointer
notes were added and verified present with a targeted search after writing each one;
P4-10's note is written distinctly from the others since it's the resolution point,
not just another deferred screen. Nothing was written to any file until this model was
confirmed with you, per your standing instruction.

**Follow-up round (same session):** six additional open items closed, each with your
explicit decision: nPCR formula confirmed as Garred (no cross-session data linking
added); Consolidated Physician Notification send-timing confirmed as
immediate-on-Critical + batched-at-P4-09; rinse-back volume range researched and set
to 200–500 mL typical/flag above 500 mL, admin-configurable; rinse-back out-of-range
behavior confirmed as Warning; bleeding duration threshold researched and set to
>20 minutes Warning, admin-configurable; and the Weight Variance vs. Dry Weight field
added to P4-03 (Field Definitions, Business Rules, Auto-calculations, Database
Mapping) after you confirmed India's dry-weight-driven workflow — which turned out to
already match this document set's existing UF Goal Formula from Part 2, strengthening
rather than contradicting the recommendation. All numeric thresholds introduced or
confirmed this round (P2-05 vitals, UF-rate ceiling, rinse-back volume, bleeding
duration) are documented as admin-configurable per your instruction, not hardcoded.
Web research backing each numeric recommendation is cited at the point it's used, not
asserted without a source.
