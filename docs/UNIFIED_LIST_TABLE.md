# Unified List/Table Component Documentation

## Overview

The Unified List Table component system provides a cohesive, reusable solution for displaying tabular data across the application. All components follow the Figma design system and use consistent styling based on design tokens.

## Components

### 1. UnifiedListTable (Base Component)

The core, fully configurable component that handles all list rendering logic.

```jsx
import { UnifiedListTable } from '../components';

const MyTable = () => {
  const columns = [
    { key: 'name', label: 'Name', type: 'text', width: '200px' },
    { key: 'date', label: 'Date', type: 'date', width: '150px' },
    { key: 'status', label: 'Status', type: 'text', width: '120px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '100px' }
  ];

  const data = [
    { name: 'John Doe', date: '2024-01-15', status: 'Active' },
    { name: 'Jane Smith', date: '2024-01-10', status: 'Pending' }
  ];

  return (
    <UnifiedListTable
      columns={columns}
      data={data}
      onEdit={(row) => console.log('Edit', row)}
      onDelete={(row) => console.log('Delete', row)}
      enableSearch={true}
      searchKeys={['name', 'status']}
    />
  );
};
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array | `[]` | Column definitions array |
| `data` | Array | `[]` | Table data rows |
| `title` | String | `'Data List'` | Table title (currently unused) |
| `onEdit` | Function | `null` | Edit button click handler |
| `onDelete` | Function | `null` | Delete button click handler |
| `onDownload` | Function | `null` | Download button click handler |
| `isLoading` | Boolean | `false` | Loading state |
| `emptyMessage` | String | `'No data found'` | Empty state message |
| `enableSearch` | Boolean | `false` | Enable search/filter |
| `searchKeys` | Array | `[]` | Fields to search in |
| `enablePagination` | Boolean | `false` | Enable pagination |
| `rowsPerPage` | Number | `10` | Rows per page |
| `actionButtons` | Boolean | `true` | Show action buttons |
| `customRowRender` | Function | `null` | Custom row rendering |

**Column Definition:**

```javascript
{
  key: 'fieldName',           // Unique field identifier
  label: 'Display Name',      // Header text
  type: 'text',               // See column types below
  width: '150px',             // Column width
  minWidth: '120px',          // Minimum width (responsive)
  render: (row, value) => {}  // Custom render function (for custom type)
}
```

**Column Types:**

- `text`: Simple text display
- `date`: Formats date strings (YYYY-MM-DD)
- `image`: Displays circular profile images
- `multi-line`: Displays arrays as stacked items
- `actions`: Displays action buttons (edit, delete, download)
- `custom`: Uses custom render function from column definition

---

### 2. PatientListTable

Pre-configured for displaying patient/user data with profile images.

```jsx
import { PatientListTable } from '../components';

const patients = [
  {
    profile: '/images/patient1.jpg',
    name: 'Mukesh',
    number: '1234567890',
    registrationDate: '2024-05-17',
    program: 'Advance',
    medicalTeam: ['Dr. A', 'Dr. B'],
    assignedTo: ['Kifayti', 'Ashutosh']
  }
];

<PatientListTable
  patients={patients}
  onEdit={(patient) => console.log('Edit patient', patient)}
  onDelete={(patient) => console.log('Delete patient', patient)}
/>
```

**Default Columns:**
- Profile (image - circular)
- Name
- Number (phone/ID)
- Registration Date
- Program
- Medical team (multi-line)
- Assigned to (multi-line)
- Actions

---

### 3. ParametersListTable

Pre-configured for displaying health/lab parameters.

```jsx
import { ParametersListTable } from '../components';

const parameters = [
  {
    parameterName: 'Blood Pressure',
    type: 'Vital',
    readingType: 'Numeric',
    lowRange: '90',
    highRange: '120',
    ailments: ['Hypertension', 'Heart Disease']
  }
];

<ParametersListTable
  data={parameters}
  onEdit={(param) => {}}
  onDelete={(param) => {}}
/>
```

**Default Columns:**
- Parameter Name
- Parameter Type
- Reading Type
- Low Range
- High Range
- Related Ailments (multi-line)
- Actions

---

### 4. ReadingsListTable

Pre-configured for displaying reading entries (daily or dialysis).

**Daily Readings:**

```jsx
import { ReadingsListTable } from '../components';

const readings = [
  {
    date: '2024-06-15',
    parameterName: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    status: 'Normal',
    notes: 'Morning reading'
  }
];

<ReadingsListTable
  readings={readings}
  type="daily"
  onEdit={(reading) => {}}
  onDelete={(reading) => {}}
/>
```

**Dialysis Readings:**

```jsx
<ReadingsListTable
  readings={dialysisData}
  type="dialysis"
  onEdit={(reading) => {}}
  onDelete={(reading) => {}}
/>
```

**Daily Columns:**
- Date
- Parameter
- Value
- Unit
- Status
- Notes
- Actions

**Dialysis Columns:**
- Date
- Dialyzer Type
- Duration (hours)
- Blood Flow Rate (ml/min)
- Dialysate Flow
- Pre Weight (kg)
- Post Weight (kg)
- Actions

---

## Features

### Search/Filter

```jsx
<UnifiedListTable
  data={data}
  columns={columns}
  enableSearch={true}
  searchKeys={['name', 'email', 'status']}
/>
```

### Pagination

```jsx
<UnifiedListTable
  data={data}
  columns={columns}
  enablePagination={true}
  rowsPerPage={15}
/>
```

### Custom Row Rendering

```jsx
<UnifiedListTable
  data={data}
  columns={columns}
  customRowRender={(row, column, renderCell) => {
    if (column.key === 'specialField') {
      return <CustomComponent {...row} />;
    }
    return renderCell(row, column);
  }}
/>
```

### Loading State

```jsx
<UnifiedListTable
  data={data}
  columns={columns}
  isLoading={true}
/>
```

### Empty State

```jsx
<UnifiedListTable
  data={[]}
  columns={columns}
  emptyMessage="No records found. Create one to get started."
/>
```

---

## Styling

### CSS Variables Used

All styling uses CSS custom properties from the design system:

```css
/* Colors */
--color-accent: #5886a5            /* Header background */
--color-text-muted: #989898         /* Data text */
--color-text-inverse: #ffffff       /* Header text */
--color-border-light: #d9d9d9       /* Table borders */
--color-primary: #4164df            /* Action buttons */
--color-danger: #de425b             /* Delete button */

/* Fonts */
--font-family-primary: 'Sora', sans-serif
```

### Customizing Styles

Override CSS classes:

```css
/* Override header background */
.list-table__header-row {
  background-color: #your-color !important;
}

/* Override cell padding */
.list-table__cell {
  padding: 20px !important;
}

/* Override action buttons */
.list-table__action-btn {
  width: 40px !important;
  height: 40px !important;
}
```

---

## Migration Guide

### From Old Table Implementations

**Before (Separate Components):**

```jsx
// pages/dailyReadings/DailyReadings.jsx
import DailyTable from './components/DailyTable';
import DialysisTable from './components/DialysisTable';
import ParametersTable from './components/ParametersTable';

// Each had different styling and props
```

**After (Unified Component):**

```jsx
// Now all use the same unified system
import { ReadingsListTable, ParametersListTable } from '../components';

// All consistent styling and props
<ReadingsListTable type="daily" data={dailyData} />
<ReadingsListTable type="dialysis" data={dialysisData} />
<ParametersListTable data={parameterData} />
```

---

## Examples

### Complete Patient Management Table

```jsx
import { PatientListTable } from '../components';
import { useState, useEffect } from 'react';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleEdit = (patient) => {
    // Open edit modal or navigate to edit page
    console.log('Edit:', patient);
  };

  const handleDelete = (patient) => {
    if (window.confirm(`Delete ${patient.name}?`)) {
      // Call API to delete
      setPatients(patients.filter(p => p.id !== patient.id));
    }
  };

  const handleDownload = (patient) => {
    // Generate and download PDF or CSV
    console.log('Download:', patient);
  };

  useEffect(() => {
    // Fetch patients
    setLoading(true);
    fetchPatients().then(data => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  return (
    <PatientListTable
      patients={patients}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDownload={handleDownload}
      isLoading={loading}
    />
  );
}
```

### Custom Column Rendering

```jsx
import { UnifiedListTable } from '../components';

const columns = [
  { key: 'name', label: 'Name', type: 'text' },
  {
    key: 'status',
    label: 'Status',
    type: 'custom',
    render: (row, value) => (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: value === 'Active' ? '#4CAF50' : '#FFC107',
        color: 'white'
      }}>
        {value}
      </span>
    )
  }
];

<UnifiedListTable columns={columns} data={data} />
```

---

## Accessibility

All components follow WCAG guidelines:

- Semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<th>`, etc.)
- ARIA labels on action buttons
- Keyboard navigation support
- Focus management
- Screen reader friendly

---

## Performance

- Virtual scrolling support (via custom props)
- Memoized computations for search/filter
- Optimized re-renders using React hooks
- Efficient data transformation

---

## Responsive Design

Tables automatically adapt to different screen sizes:

- **Desktop**: Full-width with all columns
- **Tablet**: Adjusted column widths, smaller padding
- **Mobile**: Horizontal scroll, smaller text and buttons

---

## File Locations

- **Component**: `src/components/table/UnifiedListTable.jsx`
- **Styles**: `src/components/table/UnifiedListTable.css`
- **Specialized Wrappers**:
  - `src/components/table/PatientListTable.jsx`
  - `src/components/table/ParametersListTable.jsx`
  - `src/components/table/ReadingsListTable.jsx`
- **Exports**: `src/components/table/index.js`

---

## Support & Issues

For issues or feature requests related to the Unified List Table component, please refer to the project documentation or contact the development team.

---

## Version History

- **v1.0.0** - Initial release with support for:
  - Basic text, date, image, multi-line, and actions columns
  - Search and pagination
  - Patient, Parameters, and Readings specialized components
  - Responsive design
  - Design system integration
