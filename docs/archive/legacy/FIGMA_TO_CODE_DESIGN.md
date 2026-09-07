# Figma Design to Component Implementation

## Figma Source

**File**: Kifayti_operations_file--Copy---Copy
**Node ID**: 55-487
**Design Link**: https://www.figma.com/design/XsOPlQ2RL7YuASAc4abcCl/Kifayti_operations_file--Copy---Copy-?node-id=55-487&m=dev

---

## Design Analysis

### Visual Structure

The Figma design shows a unified table layout with:

1. **Header Section**
   - Background: #5886a5 (Accent blue)
   - Text: White, Font: Sora SemiBold, size 16px
   - Padding: 15px vertical, 20px horizontal
   - Columns: Profile, Name, Number, Registration Date, Program, Medical team, Assigned to, Actions

2. **Data Rows**
   - Background: White
   - Text: #989898 (Muted gray), Font: Sora Regular, size 14px
   - Padding: 15px vertical, 20px horizontal
   - Height: ~59-82px flexible based on content

3. **Profile Images**
   - Size: 56x56px
   - Shape: Circular
   - Border: 2px solid with mask
   - Fallback: Gray background

4. **Action Column**
   - Download icon: 38x38px
   - Opacity: 70%
   - Color: Inherited from text color
   - Interactive: Hover effects (improves to 100% opacity)

---

## Design-to-Code Mapping

### Color Palette

| Design Element | Figma Color | CSS Variable | Fallback |
|---|---|---|---|
| Header Background | #5886a5 | --color-accent | #5886a5 |
| Header Text | #ffffff | --color-text-inverse | #ffffff |
| Data Text | #989898 | --color-text-muted | #989898 |
| Borders | #d9d9d9 | --color-border-light | #d9d9d9 |
| Hover State | rgba(d9d9d9, 0.5) | - | computed |

### Typography

| Element | Font | Weight | Size | Line Height |
|---|---|---|---|---|
| Header | Sora | 600 | 16px | 20px |
| Data Cell | Sora | 400 | 14px | 20px |
| Multi-line | Sora | 400 | 14px | 20px + 10px gap |

### Spacing

| Element | Value | Purpose |
|---|---|---|
| Header Padding | 15px V, 20px H | Vertical and horizontal padding |
| Cell Padding | 15px V, 20px H | Data cell spacing |
| Multi-line Gap | 10px | Gap between multi-line items |
| Image Border-radius | 50% | Circular profile images |
| Container Gap | 20px | Gap between search, table, pagination |

---

## Component Breakdown

### Layout Structure

```
┌─────────────────────────────────────────┐
│  .list-table__container                 │
│  ┌─────────────────────────────────────┐│
│  │ .list-table__search-bar (optional)  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  .list-table__wrapper               ││
│  │  ┌───────────────────────────────┐  ││
│  │  │ .list-table                   │  ││
│  │  │  ┌─────────────────────────┐  │  ││
│  │  │  │ thead (Header Row)      │  │  ││
│  │  │  │ .list-table__header-row │  │  ││
│  │  │  └─────────────────────────┘  │  ││
│  │  │  ┌─────────────────────────┐  │  ││
│  │  │  │ tbody (Data Rows)       │  │  ││
│  │  │  │ .list-table__row        │  │  ││
│  │  │  │ .list-table__cell       │  │  ││
│  │  │  └─────────────────────────┘  │  ││
│  │  └───────────────────────────────┘  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ .list-table__pagination (optional)  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ .list-table__info                   ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Figma Components to React Components

| Figma Element | React Component | CSS Class | Purpose |
|---|---|---|---|
| Main table | `<table>` | `.list-table` | Container |
| Header row | `<thead><tr>` | `.list-table__header-row` | Column headers |
| Header cell | `<th>` | `.list-table__header-cell` | Header column |
| Data row | `<tbody><tr>` | `.list-table__row` | Data row |
| Data cell | `<td>` | `.list-table__cell` | Cell content |
| Profile image | `<div><img>` | `.list-table__image` | Circular image |
| Multi-line cell | `<div>` | `.list-table__multiline-cell` | Multiple items |
| Actions | `<div><button>` | `.list-table__action-btn` | Action buttons |

---

## CSS Implementation Details

### Header Row

```css
.list-table__header-row {
  background-color: var(--color-accent, #5886a5);  /* From Figma */
  color: var(--color-text-inverse, #ffffff);       /* White text */
  font-weight: 600;                                 /* SemiBold */
  text-align: left;
}

.list-table__header-cell {
  padding: 15px 20px;                               /* Figma spacing */
  font-size: 16px;                                  /* Figma size */
  font-family: 'Sora', sans-serif;                  /* Figma font */
  color: var(--color-text-inverse, #ffffff);
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);    /* Subtle separator */
}
```

### Data Cells

```css
.list-table__cell {
  padding: 15px 20px;                               /* Same as header */
  vertical-align: top;
  text-align: left;
  height: 60px;                                     /* Figma row height */
  overflow: hidden;
}

.list-table__text-cell {
  color: var(--color-text-muted, #989898);          /* Figma data color */
  font-size: 14px;                                  /* Figma size */
  font-weight: 400;                                 /* Regular */
  line-height: 1.5;
  font-family: 'Sora', sans-serif;
}
```

### Image Cells

```css
.list-table__image-wrapper {
  width: 56px;                                      /* Figma size */
  height: 56px;                                     /* Square initially */
  border-radius: 50%;                               /* Circular */
  overflow: hidden;
  background-color: var(--color-surface, #fafafa);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border-light, #d9d9d9);
}

.list-table__image {
  width: 100%;                                      /* Fill container */
  height: 100%;
  object-fit: cover;                                /* Crop to fit */
  object-position: center;
}
```

### Multi-line Cells

```css
.list-table__multiline-cell {
  display: flex;
  flex-direction: column;
  gap: 10px;                                        /* Figma gap */
  color: var(--color-text-muted, #989898);
}

.list-table__multiline-item {
  line-height: 1.4;
  word-wrap: break-word;
}
```

### Action Buttons

```css
.list-table__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;                                      /* Based on 38px Figma */
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  color: var(--color-text-muted, #989898);
  opacity: 0.7;                                     /* Figma opacity */
}

.list-table__action-btn:hover {
  background-color: var(--color-surface-alt, #efefef);
  color: var(--color-text, #393939);
  opacity: 1;                                       /* Full opacity on hover */
}
```

---

## Data Transformation Example

### Figma Design Sample Data

From the design screenshot:

```javascript
// Patient Row 1
{
  profile: 'Stalin (profile image)',
  name: 'Mukesh',
  number: '1234567890',
  registrationDate: '2024-05-17',
  program: 'Advance',
  medicalTeam: ['Kausthab Gharat', 'Ashutosh Pandey'],
  assignedTo: ['Kifayti', 'Kausthab', 'Ashutosh'],
}

// Patient Row 2
{
  profile: 'Aadhya (profile image)',
  name: 'Aadhya',
  number: '0987654321',
  registrationDate: '2024-04-12',
  program: 'Advance',
  medicalTeam: ['Kausthab Gharat', 'Ashutosh Pandey'],
  assignedTo: ['Kifayti', 'Ashutosh'],
}
```

---

## Responsive Adaptations

### Desktop (1024px+)

- All columns visible
- Full padding: 15px V, 20px H
- Action buttons: 36x36px
- Font sizes: 16px (header), 14px (data)

### Tablet (768px - 1024px)

```css
@media (max-width: 1024px) {
  .list-table__cell {
    padding: 12px 15px;           /* Reduced padding */
  }
  
  .list-table__header-cell {
    padding: 12px 15px;
    font-size: 14px;              /* Slightly smaller */
  }
  
  .list-table__image-wrapper {
    width: 48px;                  /* Slightly smaller */
    height: 48px;
  }
}
```

### Mobile (< 768px)

```css
@media (max-width: 768px) {
  .list-table__container {
    padding: 15px;                /* Reduced container padding */
    gap: 15px;
  }
  
  .list-table__cell {
    padding: 10px 12px;           /* Minimal padding */
    font-size: 13px;
  }
  
  .list-table__image-wrapper {
    width: 40px;                  /* Much smaller */
    height: 40px;
  }
  
  .list-table__action-btn {
    width: 32px;                  /* Smaller buttons */
    height: 32px;
  }
}
```

---

## Integration Points

### With Existing Design System

The component uses the project's existing design tokens from `src/Styles/variables.css`:

```css
/* Design tokens applied */
--color-accent: #5886a5              /* Used for header */
--color-text-muted: #989898          /* Used for data text */
--color-text-inverse: #ffffff        /* Used for header text */
--color-border-light: #d9d9d9        /* Used for borders */
--color-primary: #4164df             /* Used for buttons */
--color-danger: #de425b              /* Used for delete action */
```

### With Component Library

```jsx
// Uses Box and Flex from component library
<Box className="list-table__container">
  <Flex className="list-table__search-bar">
    {/* Search input */}
  </Flex>
</Box>
```

### With Redux (Optional)

Can be integrated with Redux for state management:

```jsx
const dispatch = useDispatch();
const { data, loading, error } = useSelector(state => state.table);

useEffect(() => {
  dispatch(fetchTableData());  // Redux action
}, [dispatch]);

<UnifiedListTable data={data} isLoading={loading} />
```

---

## Browser Support

The component uses modern CSS and JavaScript features:

- CSS Grid: ✓
- CSS Flexbox: ✓
- CSS Custom Properties: ✓
- ES6+ JavaScript: ✓
- React Hooks: ✓

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancements

Potential features based on Figma design feedback:

1. **Sorting**: Add column header click to sort
2. **Filtering**: Advanced filter panel
3. **Selection**: Checkbox for row selection
4. **Expansion**: Expandable rows for details
5. **Grouping**: Group rows by category
6. **Export**: Export data to CSV/PDF
7. **Sticky Header**: Sticky header when scrolling
8. **Virtual Scrolling**: For large datasets

---

## Quality Checklist

- [x] Figma design accurately translated
- [x] All colors match design system tokens
- [x] Typography matches Figma specs
- [x] Spacing follows Figma measurements
- [x] Responsive design implemented
- [x] Accessibility standards met
- [x] Performance optimized
- [x] Documentation complete
- [x] Example integrations provided
- [x] Browser compatibility verified

---

## Version History

**v1.0.0** - Initial implementation
- Translated from Figma design node 55-487
- 8 column layout support
- Multiple cell types (text, date, image, multi-line, actions)
- Responsive design
- Search and pagination
- Design system integration
