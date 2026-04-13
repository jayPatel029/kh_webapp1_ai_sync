**DialysisBedSeat Component**

A compact, theater-seat-like React component for visualizing dialysis beds in dense grid layouts. Designed for instant scanability and professional medical UX.

**Features**

- ✅ **Compact 80×80px** - Fits 50-100 beds on a single screen
- ✅ **Status colors** - 6 distinct status states with auto text contrast
- ✅ **Badge indicators** - Alert ("!") and running (pulsing dot) overlays
- ✅ **Interaction states** - Hover (scale 1.05), active (scale 0.95)
- ✅ **Animations** - Smooth transitions and pulsing badges
- ✅ **Accessibility** - Keyboard navigation, focus states, high contrast support
- ✅ **Responsive** - Adapts to small screens (72px on mobile)
- ✅ **Dark mode** - Auto text contrast based on background luminance

**Installation**

No external peer dependencies. Uses only React and CSS.

**Usage**

```jsx
import { DialysisBedSeat } from '@/components/DialysisBedSeat';

// Basic usage
<DialysisBedSeat 
  bedId="B101" 
  status="AVAILABLE" 
/>

// With alerts and running indicator
<DialysisBedSeat 
  bedId="B102" 
  status="DIALYSIS_RUNNING" 
  hasAlert={true}
  isRunning={true}
  onClick={() => console.log('Bed clicked')}
/>
```

**Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `bedId` | string | Yes | - | Bed identifier (e.g., "B101", "Room 3 - Bed A") |
| `status` | string | No | 'AVAILABLE' | One of: AVAILABLE, OCCUPIED, DIALYSIS_RUNNING, PAUSED, ALERT, MAINTENANCE |
| `hasAlert` | boolean | No | false | Shows red "!" badge if true. Overrides all status colors. |
| `isRunning` | boolean | No | false | Shows pulsing green dot if true. |
| `onClick` | function | No | null | Click handler for bed selection. |

**Status Colors**

| Status | Hex Color | Meaning |
|--------|-----------|---------|
| AVAILABLE | #E5E7EB | Bed is empty and ready |
| OCCUPIED | #60A5FA | Patient assigned, dialysis not running |
| DIALYSIS_RUNNING | #34D399 | Active dialysis session |
| PAUSED | #F59E0B | Session paused or on hold |
| ALERT | #EF4444 | Critical alert (overrides all states) |
| MAINTENANCE | #6B7280 | Bed unavailable for maintenance |

**Example: Grid Layout (6×12 = 72 beds)**

```jsx
const beds = [
  { bedId: 'B101', status: 'AVAILABLE' },
  { bedId: 'B102', status: 'DIALYSIS_RUNNING', isRunning: true },
  { bedId: 'B103', status: 'ALERT', hasAlert: true },
  // ... 69 more beds
];

<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 80px)',
  gap: '12px'
}}>
  {beds.map(bed => (
    <DialysisBedSeat
      key={bed.bedId}
      bedId={bed.bedId}
      status={bed.status}
      hasAlert={bed.hasAlert}
      isRunning={bed.isRunning}
      onClick={() => selectBed(bed.bedId)}
    />
  ))}
</div>
```

**Interaction States**

- **Hover**: Scale 1.05, subtle box shadow (raised effect)
- **Click/Active**: Scale 0.95 (pressed effect)
- **Focus**: Blue outline (2px) for keyboard navigation
- **Badge Animations**:
  - Alert badge: Pulsing opacity (2s cycle)
  - Running badge: Pulsing scale (2s cycle)

**Features**

**Auto Text Contrast**
- Automatically switches label and icon color to white/dark based on background brightness
- Uses WCAG luminance formula for accessibility

**Badge Indicators**
- **Top-Left Alert Badge**: Red "!" appears when `hasAlert={true}`, overrides status
- **Bottom-Right Running Badge**: Green pulsing dot when `isRunning={true}`

**Accessibility**
- Full keyboard navigation (Tab, Enter, Space)
- ARIA labels and descriptions
- High contrast mode support (@media prefers-contrast: more)
- Reduced motion support (@media prefers-reduced-motion: reduce)
- Dark mode support (@media prefers-color-scheme: dark)

**Size Variants**

| Screen | Size | Grid Columns | Beds per Row |
|--------|------|--------------|--------------|
| Desktop | 80×80px | Auto | Flexible |
| Tablet | 80×80px | Auto | Flexible |
| Mobile | 72×72px | Fixed | 4-5 per row |

**Integration with BedManagementDashboard**

If you want to integrate DialysisBedSeat into the existing BedManagementDashboard:

```jsx
import { DialysisBedSeat } from '@/components/DialysisBedSeat';

// In BedGridHorizontal or create a new BedGridSeat component:
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 80px)', gap: '12px' }}>
  {statusBeds.map((bed) => (
    <DialysisBedSeat
      key={bed.id}
      bedId={`B${bed.bed_number}`}
      status={bed.status}
      hasAlert={bed.hasAlert}
      isRunning={bed.is_running}
      onClick={() => onBedClick(bed)}
    />
  ))}
</div>
```

**Styling Customization**

To override colors globally, modify the `STATUS_COLORS` object in `DialysisBedSeat.jsx` or add CSS custom properties:

```css
/* Override in your theme */
:root {
  --dialysis-bed-available: #E5E7EB;
  --dialysis-bed-occupied: #60A5FA;
  --dialysis-bed-running: #34D399;
  --dialysis-bed-paused: #F59E0B;
  --dialysis-bed-alert: #EF4444;
  --dialysis-bed-maintenance: #6B7280;
}
```

**Performance Considerations**

- Component is lightweight (minimal re-renders)
- Uses `useMemo` for icon color calculation
- CSS animations run on GPU (transform, opacity)
- Suitable for grids of 50-100+ beds without virtualization

**Demo Files**

See `DialysisBedSeat.demo.jsx` for:
- Grid layout (10 beds)
- All status states
- Badge indicators
- Large grid (72 beds)

Run demos in your dev environment to see all states and interactions.

**Checklist for Integration**

- [ ] Import component in your dashboard or bed grid component
- [ ] Pass bed data (bedId, status, hasAlert, isRunning)
- [ ] Wire onClick handler to select/edit beds
- [ ] Test hover and click interactions
- [ ] Verify badge animations fire correctly
- [ ] Test on mobile (72px variant)
- [ ] Verify keyboard navigation
- [ ] Update color scheme if needed
