# 🏥 Bed Management Dashboard - Implementation Guide

## Overview
A complete visual bed management system with drag-and-drop functionality for patient-to-bed assignment, appointment tracking, and quarantine bed management.

## ✅ Features Implemented

### 1. **API Layer** (`src/ApiCalls/bedManagementApis.js`)
- `getAllBeds()` - Fetch all beds with statuses
- `getBedsByStatus(status)` - Filter beds by status (OCCUPIED, EMPTY, QUARANTINE)
- `getBedById(bedId)` - Get individual bed details
- `assignPatientToBed(payload)` - Assign patient to bed with validation
- `unassignPatientFromBed(payload)` - Remove patient from bed
- `setQuarantineBed(bedId, payload)` - Mark bed as quarantine
- `getPatientDetails(patientId)` - Get patient info including isolation status
- `updateBedStatus(bedId, payload)` - Update bed status
- `getBedAssignmentsByDateRange(payload)` - Get assignments for date range

### 2. **Custom Hook** (`src/hooks/useBedManagement.js`)
Provides state management and business logic:
- `beds` - Array of all beds
- `bedsByStatus` - Organized beds by status
- `loading` - Loading state
- `error` - Error messages
- `assignPatient(bedId, patientId, notes)` - Assign with quarantine validation
- `unassignPatient(bedId, patientId)` - Unassign patient
- `quarantineBed(bedId, reason, duration)` - Mark bed as quarantine
- `canAssignPatientToBed(bedId, patientId)` - Validate assignment before action

### 3. **Main Dashboard Component** (`src/pages/adminDashboard/components/BedManagementDashboard.jsx`)

#### Features:
- **Summary Cards**: Display total, available, occupied, and quarantine bed counts
- **Tabbed Interface**: Switch between All, Empty, Occupied, and Quarantine beds
- **Real-time Grid Display**: Visual representation of all beds with status colors
- **Appointment Table**: Shows all appointments with columns for patient, date, time, doctor, bed, status
- **Drag-and-Drop**: Drag patients to beds for quick assignment
- **Modal Assignment**: Alternative UI for patient-to-bed assignment
- **Quarantine Validation**: Prevents infectious patients from normal beds

#### Sub-Components:
- **BedCard**: Individual bed display with patient info
- **BedGridByStatus**: Grid layout for beds organized by status
- **AppointmentTableComponent**: Appointment display table
- **AssignmentModal**: Modal for manual bed assignment

### 4. **Draggable Patient Component** (`src/components/BedManagement/DraggablePatient.jsx`)
- Draggable patient element with infectious status indicator
- Broadcasts patient data via drag event
- Visual feedback during drag operations

### 5. **Test Suite** (`src/__tests__/bedManagementApis.test.js`)
Comprehensive tests for all API endpoints:
- ✅ Test 1: Fetch All Beds
- ✅ Test 2: Fetch Beds by Status
- ✅ Test 3: Fetch Bed by ID
- ✅ Test 4: Get Patient Details
- ✅ Test 5: Assign Patient to Bed
- ✅ Test 6: Unassign Patient from Bed
- ✅ Test 7: Quarantine Bed
- ✅ Test 8: Quarantine Validation (Infectious → Normal Bed rejection)
- ✅ Test 9: Update Bed Status

## 🛡️ Security & Validation Features

### Quarantine Management
- **Infectious Patient Validation**: System checks if patient is infectious
- **Bed Type Matching**: Infectious patients can only be assigned to QUARANTINE type beds
- **Cross-Contamination Prevention**: Non-infectious patients cannot share quarantine beds with infectious ones
- **Clear Status Indicators**: Quarantine beds are visually distinct with warning icons

### Error Handling
- API errors are caught and displayed to users
- Graceful fallbacks for failed assignments
- Toast notifications for real-time user feedback

## 📊 Data Models

### Bed Object
```javascript
{
  id: string,
  bed_number: string,
  status: 'OCCUPIED' | 'EMPTY' | 'QUARANTINE',
  bed_type: 'NORMAL' | 'QUARANTINE',
  patient_id: string | null,
  patient_name: string,
  ward: string,
  assigned_since: ISO8601Date,
  quarantine_reason: string,
  quarantine_status: boolean,
}
```

### Patient Object
```javascript
{
  id: string,
  name: string,
  patient_code: string,
  is_infectious: boolean,
  patient_details: {
    age: number,
    disease: string,
  }
}
```

### Appointment Object
```javascript
{
  id: string,
  patient_name: string,
  patient_id: string,
  doctor_name: string,
  doctor_id: string,
  appointment_date: ISO8601Date,
  appointment_time: string,
  bed_number: string,
  bed_id: string,
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED',
}
```

## 🎯 Usage

### 1. Display Dashboard in Admin Panel
```jsx
import BedManagementDashboard from './pages/adminDashboard/components/BedManagementDashboard';

function AdminPanel() {
  return <BedManagementDashboard />;
}
```

### 2. Use Hook for Custom Components
```jsx
import useBedManagement from './hooks/useBedManagement';

function CustomBedComponent() {
  const { beds, assignPatient, unassignPatient, BED_STATUS } = useBedManagement();
  
  // Your custom logic here
}
```

### 3. Drag-and-Drop Assignment
```jsx
import DraggablePatient from './components/BedManagement/DraggablePatient';

function PatientList({ patients }) {
  const handleDragStart = (patientData) => {
    console.log('Dragging patient:', patientData);
  };

  return (
    <div>
      {patients.map(patient => (
        <DraggablePatient
          key={patient.id}
          patient={patient}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}
```

## 🧪 Running Tests

Before implementing API endpoints, test the current setup:

```bash
# Terminal 1: Start your backend server
npm start

# Terminal 2: Run the test suite
npm test -- bedManagementApis.test.js

# Or run tests in Node.js directly
node src/__tests__/bedManagementApis.test.js
```

### Test Output Example
```
═══════════════════════════════════════════════════════════════
           💉 BED MANAGEMENT API TEST SUITE 💉              
═══════════════════════════════════════════════════════════════

⚠️  IMPORTANT: Ensure these conditions before running:
   1. Backend server is running
   2. Database has sample data
   3. You are connected to the correct server

📋 TEST 1: Fetch All Beds
Endpoint: GET /api/beds/all
✅ Success! Got beds:
   Total beds: 20
   Sample bed: {...}

[... more tests ...]

✅ Passed: 7  |  ❌ Failed: 1  |  ⚠️  Inconclusive: 1
```

## 🔧 Backend API Requirements

Your backend should implement these endpoints:

### GET /api/beds/all
Returns array of all beds
```json
{
  "success": true,
  "data": [
    {
      "id": "bed-1",
      "bed_number": "101",
      "status": "EMPTY",
      "bed_type": "NORMAL",
      "patient_id": null,
      "ward": "ICU"
    }
  ]
}
```

### GET /api/beds/status/:status
Returns beds filtered by status (OCCUPIED, EMPTY, QUARANTINE)

### POST /api/beds/assign
Assign patient to bed
```json
{
  "bed_id": "bed-1",
  "patient_id": "patient-123",
  "assignment_notes": "Routine assignment"
}
```

Must validate:
- Bed is not already occupied
- Infectious patients go to QUARANTINE beds only
- Returns error if validation fails

### POST /api/beds/unassign
Remove patient from bed
```json
{
  "bed_id": "bed-1",
  "patient_id": "patient-123"
}
```

### POST /api/beds/:bedId/quarantine
Mark bed as quarantine
```json
{
  "reason": "COVID-19 positive",
  "quarantine_status": true,
  "estimated_duration": "7 days"
}
```

### GET /api/patients/:patientId
Get patient details including isolation status
```json
{
  "success": true,
  "data": {
    "id": "patient-123",
    "name": "John Doe",
    "patient_code": "P-123",
    "is_infectious": false,
    "patient_details": {
      "age": 65,
      "disease": "Chronic Kidney Disease"
    }
  }
}
```

## 📝 Customization

### Change Color Scheme
Edit `BED_STATUS_COLOR` in `BedManagementDashboard.jsx`:
```javascript
const BED_STATUS_COLOR = {
  OCCUPIED: 'used',     // Change these color names
  EMPTY: 'available',
  QUARANTINE: 'warning',
};
```

### Change Grid Layout
Modify grid template in `BedGridByStatus`:
```javascript
<Grid
  templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
  gap={4}
>
```

### Add More Appointment Columns
Edit columns array in `AppointmentTableComponent`:
```javascript
const columns = [
  // Add new columns here
  {
    Header: 'Custom Column',
    accessor: 'field_name',
  },
];
```

## ⚡ Performance Optimization

1. **Memoization**: Components use `useMemo` for expensive calculations
2. **Lazy Loading**: Beds are fetched on component mount
3. **Incremental Updates**: Only affected beds are re-rendered after assignment
4. **API Caching**: Consider adding caching layer for patient details

## 🐛 Troubleshooting

### Drag-and-drop not working
- Ensure `onDragOver` preventDefault is called
- Check that patient data is correctly serialized as JSON
- Verify bed drop handler is properly connected

### Assignments fail silently
- Check browser console for errors
- Ensure backend endpoints exist
- Verify patient/bed IDs are correct

### Appointments not showing
- Check that `getAllAppointmentsById` API is working
- Verify appointment data structure matches expectations
- Check browser network tab for API failures

## 🚀 Next Steps

1. **Implement Backend Endpoints** - All API endpoints in your server
2. **Add Patient Search** - Search/filter patients before drag-drop
3. **Add Bed Filters** - Filter by ward, bed type, etc.
4. **Add Bulk Operations** - Assign multiple patients at once
5. **Add Reporting** - Generate bed occupancy reports
6. **Add Notifications** - Send alerts for quarantine expirations
7. **Add Audit Logging** - Track all bed assignments

## 📚 Files Reference

```
src/
├── ApiCalls/
│   └── bedManagementApis.js              # API helpers
├── hooks/
│   └── useBedManagement.js               # State management hook
├── components/
│   └── BedManagement/
│       ├── DraggablePatient.jsx          # Draggable patient element
│       └── index.js                      # Component exports
├── pages/adminDashboard/components/
│   └── BedManagementDashboard.jsx        # Main dashboard
└── __tests__/
    └── bedManagementApis.test.js         # API tests
```

## 📞 Support

For issues or questions:
1. Check test suite for API connectivity
2. Review browser console for error messages
3. Check network tab for API response details
4. Verify backend server is running
5. Ensure patient/bed IDs exist in database
