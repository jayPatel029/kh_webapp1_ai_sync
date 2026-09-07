# Integration Guide: Unified List Table Component

## Quick Start

Convert any existing table to use the unified component system in 3 steps:

### Step 1: Import the Component

```jsx
// OLD
import SomeTable from './SomeTable';
import AnotherTable from './AnotherTable';

// NEW
import { PatientListTable, ParametersListTable, ReadingsListTable } from '../components';
```

### Step 2: Prepare Your Data

```jsx
// Transform your existing data to match column keys

// For PatientListTable:
const patientData = patients.map(p => ({
  profile: p.profileImageUrl,
  name: p.userName,
  number: p.contact,
  registrationDate: p.createdDate,
  program: p.programName,
  medicalTeam: p.doctors,    // Array
  assignedTo: p.assignedPersons, // Array
}));

// For ParametersListTable:
const parameterData = params.map(p => ({
  parameterName: p.name,
  type: p.parameterType,
  readingType: p.readingType,
  lowRange: p.lowValue,
  highRange: p.highValue,
  ailments: p.relatedAilments, // Array
}));
```

### Step 3: Use the Component

```jsx
<PatientListTable
  patients={patientData}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isLoading={loading}
/>
```

---

## Integration Examples by Page

### ManageParameters

**Current Implementation:**
- Custom table component
- Individual action handlers
- Inline styling

**With Unified Component:**

```jsx
import { ParametersListTable } from '../components';
import { useState, useEffect } from 'react';

function ManageParameters() {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch parameters
    fetchParameters().then(data => {
      const formattedData = data.map(param => ({
        id: param.id,
        parameterName: param.title,
        type: param.parameterType,
        readingType: param.selectReadingType,
        lowRange: param.lowRange,
        highRange: param.highRange,
        ailments: param.ailments || [],
      }));
      setParameters(formattedData);
    });
  }, []);

  const handleEdit = (parameter) => {
    // Open modal to edit
    setIsModalOpen(true);
    setEditId(parameter.id);
  };

  const handleDelete = (parameter) => {
    if (confirm('Delete this parameter?')) {
      deleteParameter(parameter.id).then(() => {
        setParameters(parameters.filter(p => p.id !== parameter.id));
      });
    }
  };

  return (
    <div>
      <h1>Manage Parameters</h1>
      <ParametersListTable
        data={parameters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      {/* Your existing modal can stay the same */}
      {isModalOpen && <ParameterModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
```

---

### Daily Readings

**Current Implementation:**
- Separate DailyReadings page and components
- Custom table styling

**With Unified Component:**

```jsx
import { ReadingsListTable } from '../components';
import { useState, useEffect } from 'react';

function DailyReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id: patientId } = useParams();

  useEffect(() => {
    fetchDailyReadings(patientId).then(data => {
      const formattedData = data.map(reading => ({
        id: reading.id,
        date: reading.readingDate,
        parameterName: reading.parameterName,
        value: reading.parameterValue,
        unit: reading.unit,
        status: getReadingStatus(reading),
        notes: reading.notes || '',
      }));
      setReadings(formattedData);
    });
  }, [patientId]);

  const handleEdit = (reading) => {
    // Open update modal
    setEditingReading(reading);
    setShowUpdateModal(true);
  };

  const handleDelete = (reading) => {
    if (confirm('Delete this reading?')) {
      deleteReading(reading.id).then(() => {
        setReadings(readings.filter(r => r.id !== reading.id));
      });
    }
  };

  return (
    <div>
      <h2>Daily Readings</h2>
      <ReadingsListTable
        readings={readings}
        type="daily"
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      {showUpdateModal && <UpdateReadingModal reading={editingReading} />}
    </div>
  );
}
```

---

### Dialysis Readings

**With Unified Component:**

```jsx
import { ReadingsListTable } from '../components';

function DialysisReadings() {
  const [readings, setReadings] = useState([]);
  const { id: patientId } = useParams();

  useEffect(() => {
    fetchDialysisReadings(patientId).then(data => {
      const formattedData = data.map(reading => ({
        id: reading.id,
        date: reading.sessionDate,
        dialyzerType: reading.dialyzerType,
        duration: reading.durationHours,
        bloodFlowRate: reading.bloodFlowRate,
        dialysateFlowRate: reading.dialysateFlowRate,
        preWeight: reading.weightBefore,
        postWeight: reading.weightAfter,
      }));
      setReadings(formattedData);
    });
  }, [patientId]);

  return (
    <div>
      <h2>Dialysis Readings</h2>
      <ReadingsListTable
        readings={readings}
        type="dialysis"
        onEdit={handleDialysisEdit}
        onDelete={handleDialysisDelete}
      />
    </div>
  );
}
```

---

### User Program Selection

**Current**: Custom list component

**With Unified Component:**

```jsx
import { UnifiedListTable } from '../components';

function UserProgramSelection() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchUserPrograms().then(data => setPrograms(data));
  }, []);

  const columns = [
    { key: 'name', label: 'Program Name', type: 'text', width: '200px' },
    { key: 'description', label: 'Description', type: 'text', width: '300px' },
    { key: 'type', label: 'Type', type: 'text', width: '150px' },
    { key: 'status', label: 'Status', type: 'text', width: '120px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '100px' },
  ];

  return (
    <div>
      <h2>Available Programs</h2>
      <UnifiedListTable
        columns={columns}
        data={programs}
        onEdit={handleSelectProgram}
      />
    </div>
  );
}
```

---

## Features Available

All specialized components inherit these features:

### 1. Built-in Search

```jsx
<PatientListTable
  patients={data}
  // Search is already enabled by default
  // Searches in: name, number, program
/>
```

### 2. Action Buttons

```jsx
<PatientListTable
  patients={data}
  onEdit={(row) => console.log('Edit', row)}
  onDelete={(row) => console.log('Delete', row)}
  onDownload={(row) => console.log('Download', row)}
/>
```

### 3. Loading State

```jsx
<PatientListTable
  patients={data}
  isLoading={loading}
/>
```

### 4. Empty State

```jsx
<PatientListTable
  patients={[]}
  emptyMessage="No patients registered yet."
/>
```

---

## Data Transformation Helpers

Create reusable formatters for your pages:

```jsx
// utils/dataFormatters.js

export const formatPatientForTable = (patient) => ({
  profile: patient.profileImageUrl,
  name: patient.firstName + ' ' + patient.lastName,
  number: patient.phoneNumber,
  registrationDate: patient.createdAt,
  program: patient.program?.name,
  medicalTeam: patient.medicalTeam?.map(m => m.name) || [],
  assignedTo: patient.assignedPersons?.map(a => a.name) || [],
});

export const formatReadingForTable = (reading) => ({
  date: reading.recordedDate,
  parameterName: reading.parameter?.name,
  value: reading.value,
  unit: reading.parameter?.unit,
  status: reading.isAbnormal ? 'Abnormal' : 'Normal',
  notes: reading.notes,
});

export const formatParameterForTable = (param) => ({
  parameterName: param.name,
  type: param.type,
  readingType: param.readingType,
  lowRange: param.minValue,
  highRange: param.maxValue,
  ailments: param.ailments?.map(a => a.name) || [],
});

// Usage in your page:
// const tableData = patients.map(formatPatientForTable);
```

---

## Styling Customization

### Override Global Styles

```css
/* In your page's CSS file */

.my-custom-list .list-table__header-row {
  background-color: #your-color;
}

.my-custom-list .list-table__action-btn--edit {
  color: #custom-color;
}
```

Then use the class:

```jsx
<div className="my-custom-list">
  <PatientListTable patients={data} />
</div>
```

### Using CSS Variables

The component uses CSS variables that can be overridden:

```css
:root {
  --color-accent: #your-header-color;
  --color-text-muted: #your-text-color;
  --color-primary: #your-button-color;
}
```

---

## Advanced: Custom Columns

Use `UnifiedListTable` for full control:

```jsx
import { UnifiedListTable } from '../components';

function CustomTable() {
  const columns = [
    {
      key: 'name',
      label: 'Patient Name',
      type: 'text',
      width: '200px',
    },
    {
      key: 'status',
      label: 'Health Status',
      type: 'custom',
      width: '150px',
      render: (row, value) => (
        <div style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value === 'Alert' ? '#ff6b6b' : '#51cf66',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          {value}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      width: '100px',
    },
  ];

  return (
    <UnifiedListTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
```

---

## Migration Checklist

- [ ] Identify all table/list components in your page
- [ ] Create data formatters/transformers
- [ ] Replace component imports
- [ ] Update component usage
- [ ] Test data display
- [ ] Test action handlers (edit, delete)
- [ ] Test search functionality
- [ ] Verify responsive behavior
- [ ] Test loading states
- [ ] Test empty states
- [ ] Update styling (if needed)
- [ ] Test accessibility

---

## Common Issues & Solutions

**Issue: Data not displaying**
- Solution: Ensure data keys match column `key` exactly
- Check data format using browser console

**Issue: Action buttons not working**
- Solution: Verify handlers are passed correctly
- Check console for JavaScript errors

**Issue: Styling looks wrong**
- Solution: Verify design tokens are loaded
- Check for conflicting CSS

**Issue: Search not working**
- Solution: Enable search with `enableSearch={true}`
- Ensure `searchKeys` are set correctly
- Verify data is in correct format

---

## Performance Tips

1. **Use pagination** for large datasets:
   ```jsx
   <UnifiedListTable
     data={largeDataset}
     enablePagination={true}
     rowsPerPage={20}
   />
   ```

2. **Memoize data transformation**:
   ```jsx
   const formattedData = useMemo(
     () => rawData.map(formatPatientForTable),
     [rawData]
   );
   ```

3. **Use `isLoading` state** properly:
   ```jsx
   const [loading, setLoading] = useState(true);
   useEffect(() => {
     fetchData().finally(() => setLoading(false));
   }, []);
   ```

---

## Next Steps

1. Review the complete [API Documentation](./UNIFIED_LIST_TABLE.md)
2. Check out example implementations in your codebase
3. Migrate existing tables page by page
4. Collect feedback from the team

---

## Support

For questions or issues:
- Check the documentation at `docs/UNIFIED_LIST_TABLE.md`
- Review component props and types
- Look for similar implementations in existing pages
