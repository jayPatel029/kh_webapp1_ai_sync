# Dialysis Parameters Modal - Quick Implementation Guide

## What Was Built

A complete dialysis technician workflow modal with three stages:

```
APPOINTMENT DRAG & DROP          OCCUPIED BED CLICK
         ↓                               ↓
   [Empty Bed]                   [Occupied Bed]
         ↓                               ↓
    [Patient Auto-Assigned]      [Patient Info Shown]
         ↓                               ↓
[Dialysis Modal Opens] ←─────────────────┘
         ↓
    ┌────────────────────────┐
    │ STAGE 1: BEFORE        │
    │ □ Physical exam        │
    │ □ Vital signs          │
    │ □ Blood access         │
    │ □ Medications          │
    │ □ Consent              │
    │ [START DIALYSIS] btn   │
    └────────────────────────┘
         ↓
    ┌────────────────────────┐
    │ STAGE 2: DURING        │
    │ • Blood Flow: ___      │
    │ • Dialysate: ___       │
    │ • Pressures: ___/___   │
    │ • Temp/Conductivity    │
    │ • Notes: [text area]   │
    │ [STOP DIALYSIS] btn    │
    └────────────────────────┘
         ↓
    ┌────────────────────────┐
    │ STAGE 3: AFTER         │
    │ □ Samples collected    │
    │ □ Sent to lab          │
    │ Post-dialysis notes:   │
    │ [text area]            │
    │ [CLOSE SESSION] btn    │
    └────────────────────────┘
```

## Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `Accordion.jsx` | Reusable accordion component | 170 |
| `Accordion.css` | Accordion styling | 90 |
| `DialysisParametersModal.jsx` | Main modal component | 500 |
| `DialysisParametersModal.css` | Modal styling | 140 |
| `BedManagementDashboard.jsx` | Updated with modal integration | Modified |

## How to Use

### 1. Open Modal on Appointment Drop
```jsx
// User drags appointment → drops on empty bed
handleBedDrop = async (e, targetBed) => {
  // 1. Shows option to assign patient
  // 2. Opens DialysisParametersModal with:
  //    - patient_id, patient_name from appointment
  //    - bed info
  // 3. Modal shows Stage 1: Pre-Dialysis
}
```

### 2. Open Modal on Occupied Bed Click
```jsx
// User clicks occupied bed
handleBedClick = (bed) => {
  if (bed.status === 'OCCUPIED' && bed.patient_id) {
    // Opens DialysisParametersModal with:
    // - Existing patient info
    // - Current bed info
    // - Can continue/resume session
  }
}
```

## Modal Props

```jsx
<DialysisParametersModal
  isOpen={boolean}              // Modal visibility
  onClose={function}            // Close handler
  patient={{
    patient_id: string,         // Required
    patient_name: string,       // Display
    appointment_id: string?     // Optional
  }}
  bed={{
    id: string,                 // Required
    bed_number: string          // Display
  }}
  onStageChange={function}      // Optional: Called when stage changes
  isLoading={boolean}           // Optional: Load state
  initialData={{
    params: object,             // Optional: Pre-fetched patient params
    readings: object            // Optional: Pre-fetched readings
  }}
/>
```

## API Payloads

### Before → During (Start Dialysis)
```json
{
  "patient_id": "p123",
  "bed_id": "b1",
  "stage": "before",
  "checklist": {
    "physical_exam_done": true,
    "vital_signs_recorded": true,
    "blood_access_checked": true,
    "medication_given": true,
    "consent_obtained": true
  },
  "notes": "Patient stable, ready for dialysis",
  "timestamp": "2026-04-13T10:30:00Z"
}
```

### During → After (Stop Dialysis)
```json
{
  "patient_id": "p123",
  "bed_id": "b1",
  "stage": "during",
  "readings": {
    "blood_flow_rate": "300",
    "dialysate_flow_rate": "500",
    "arterial_pressure": "-120",
    "venous_pressure": "250",
    "transmembrane_pressure": "180",
    "ultrafiltration_rate": "500",
    "temperature": "37.2",
    "conductivity": "14.0"
  },
  "notes": "Session uneventful, good flow",
  "timestamp": "2026-04-13T14:30:00Z"
}
```

### After Dialysis (Close Session)
```json
{
  "patient_id": "p123",
  "bed_id": "b1",
  "stage": "after",
  "blood_samples": {
    "samples_taken": true,
    "samples_sent_to_lab": true
  },
  "notes": "Patient feeling well. Weight reduced by 2kg. Follow-up needed.",
  "timestamp": "2026-04-13T15:30:00Z"
}
```

## Component Hierarchy

```
BedManagementDashboard
├── [New] DialysisParametersModal
│   └── Accordion (with 3 AccordionItems)
│       ├── AccordionItem: Before Dialysis
│       │   └── FormControl, Checkbox, Textarea
│       ├── AccordionItem: During Dialysis
│       │   └── FormControl, Input (x8), Textarea
│       └── AccordionItem: After Dialysis
│           └── FormControl, Checkbox, Textarea
├── [Existing] AssignmentModal
│   └── FormControl, Input, Textarea, Checkbox
└── [Existing] AppointmentDraggableList
```

## Styling Integration

All components use CSS variables from the design system:

```css
--border-light          /* Light borders */
--bg-light, --bg-lighter /* Background colors */
--text-primary          /* Primary text */
--text-muted            /* Muted text */
--color-info            /* Blue status */
--color-warning         /* Orange status */
--color-success         /* Green status */
--color-danger          /* Red status */
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between focusable elements |
| `Enter` | Toggle accordion item / Submit button |
| `Space` | Toggle accordion item |
| `Esc` | Close modal (if onClose provided) |

## Responsive Breakpoints

- **Desktop (> 768px)**: Full grid layout with 2 columns
- **Tablet/Mobile (≤ 768px)**: Single column layout

## Error Handling

1. **Pre-Dialysis**
   - Cannot proceed without all 5 checklist items ✓
   - Validates when "Start Dialysis" clicked

2. **During Dialysis**
   - All readings stored temporarily
   - Can proceed even with partial readings
   - Notes are optional

3. **Post-Dialysis**
   - Blood sample collection tracked
   - Notes field for observations
   - Closes modal on successful submit

## Feature Highlights

✅ **Smooth Stage Transitions**
- Only show relevant fields per stage
- Progress badges show current stage
- Action buttons contextual to stage

✅ **Data Persistence**
- All data submitted to backend with timestamps
- Prevents accidental loss

✅ **Accessibility**
- ARIA labels on inputs
- Keyboard navigation supported
- Screen reader friendly

✅ **Mobile Responsive**
- Touch-friendly input fields
- Stacked layout on small screens
- Large tap targets for buttons

## Testing Checklist

- [ ] Drag appointment to empty bed → Modal opens
- [ ] Click occupied bed → Modal opens with patient
- [ ] All checklist items required before Start
- [ ] Can enter all readings in During stage
- [ ] Stage progression: Before → During → After
- [ ] Modal closes on Close Session
- [ ] Mobile layout responsive
- [ ] Keyboard navigation works
- [ ] All API calls execute correctly
- [ ] Notifications display properly

---

**Support**: Check DIALYSIS_MODAL_IMPLEMENTATION.md for detailed documentation
