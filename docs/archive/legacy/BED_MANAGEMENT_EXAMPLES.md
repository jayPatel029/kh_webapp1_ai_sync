/**
 * Bed Management System - Quick Start Guide & Examples
 * @file docs/BED_MANAGEMENT_EXAMPLES.md
 */

# 🚀 Quick Start Guide - Bed Management System

## 📦 Installation

The bed management system is already integrated into the app. No additional dependencies needed!

## 🎯 Basic Usage

### 1. Display the Dashboard

```jsx
import BedManagementDashboard from './pages/adminDashboard/components/BedManagementDashboard';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Control Panel</h1>
      <BedManagementDashboard />
    </div>
  );
}

export default AdminPanel;
```

### 2. Use the Bed Management Hook

```jsx
import { useBedManagement } from './hooks/useBedManagement';

function CustomBedComponent() {
  const {
    beds,
    bedsByStatus,
    loading,
    error,
    BED_STATUS,
    assignPatient,
    unassignPatient,
  } = useBedManagement();

  const handleAssignClick = async (bedId, patientId) => {
    const result = await assignPatient(bedId, patientId, 'Manual assignment');
    if (result.success) {
      console.log('Patient assigned successfully!');
    } else {
      console.error('Assignment failed:', result.data);
    }
  };

  if (loading) return <div>Loading beds...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Beds: {bedsByStatus[BED_STATUS.EMPTY].length}</h2>
      {beds.map((bed) => (
        <div key={bed.id}>
          <h3>Bed {bed.bed_number}</h3>
          <p>Status: {bed.status}</p>
          <button onClick={() => handleAssignClick(bed.id, 'patient-123')}>
            Assign Patient
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Use Bed Appointments Hook

```jsx
import { useBedAppointments } from './hooks/useBedAppointments';

function AppointmentPanel() {
  const {
    appointments,
    loading,
    bookNewAppointment,
    getUpcomingAppointments,
    getAppointmentStats,
  } = useBedAppointments();

  const stats = getAppointmentStats();
  const upcoming = getUpcomingAppointments();

  return (
    <div>
      <h2>Appointment Statistics</h2>
      <p>Total: {stats.total}</p>
      <p>Scheduled: {stats.scheduled}</p>
      <p>With Bed: {stats.withBedAssignment}</p>

      <h3>Upcoming (Next 7 Days)</h3>
      <ul>
        {upcoming.map((apt) => (
          <li key={apt.id}>
            {apt.patient_name} - {apt.appointment_date} at {apt.appointment_time}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Create Draggable Patient List

```jsx
import { DraggablePatient } from './components/BedManagement';

function PatientList({ patients }) {
  return (
    <div>
      <h3>Patients (Drag to assign to bed)</h3>
      {patients.map((patient) => (
        <DraggablePatient
          key={patient.id}
          patient={patient}
          onDragStart={(data) => {
            console.log('Dragging:', data);
          }}
        />
      ))}
    </div>
  );
}
```

## 🔄 Workflow Examples

### Complete Bed Assignment Flow

```javascript
async function assignPatientFlow(bedId, patientId) {
  try {
    // 1. Get bed details
    const bedResult = await getBedById(bedId);
    if (!bedResult.success) throw new Error('Bed not found');
    const bed = bedResult.data;

    // 2. Get patient details
    const patientResult = await getPatientDetails(patientId);
    if (!patientResult.success) throw new Error('Patient not found');
    const patient = patientResult.data;

    // 3. Validate assignment
    if (patient.is_infectious && bed.bed_type !== 'QUARANTINE') {
      throw new Error('Cannot assign infectious patient to normal bed');
    }

    // 4. Perform assignment
    const assignResult = await assignPatientToBed({
      bed_id: bedId,
      patient_id: patientId,
      assignment_notes: 'Routine assignment',
    });

    if (!assignResult.success) throw new Error('Assignment failed');

    // 5. Update UI or fetch fresh data
    console.log('✅ Patient assigned successfully!');
    return { success: true, bed, patient };
  } catch (error) {
    console.error('❌ Assignment failed:', error.message);
    return { success: false, error: error.message };
  }
}
```

### Unassign and Re-assign Patient

```javascript
async function reassignPatient(currentBedId, currentPatientId, newBedId) {
  try {
    // 1. Unassign from current bed
    const unassignResult = await unassignPatientFromBed({
      bed_id: currentBedId,
      patient_id: currentPatientId,
    });

    if (!unassignResult.success) throw new Error('Unassignment failed');

    // 2. Assign to new bed
    const assignResult = await assignPatientToBed({
      bed_id: newBedId,
      patient_id: currentPatientId,
      assignment_notes: 'Patient transfer',
    });

    if (!assignResult.success) throw new Error('Assignment failed');

    console.log('✅ Patient transferred successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
    return { success: false, error: error.message };
  }
}
```

### Quarantine Bed Management

```javascript
async function handleInfectiousPatient(patientId, reason) {
  try {
    // 1. Get an available quarantine bed
    const quarantineBedsResult = await getBedsByStatus('QUARANTINE');
    if (!quarantineBedsResult.success || !quarantineBedsResult.data.length) {
      // Create/mark a bed as quarantine
      const emptyBeds = await getBedsByStatus('EMPTY');
      if (!emptyBeds.data.length) throw new Error('No beds available');

      const bedToQuarantine = emptyBeds.data[0];
      await setQuarantineBed(bedToQuarantine.id, {
        reason: 'Infectious patient admission',
        quarantine_status: true,
        estimated_duration: '14 days',
      });

      // 2. Assign patient to quarantined bed
      await assignPatientToBed({
        bed_id: bedToQuarantine.id,
        patient_id: patientId,
        assignment_notes: `Quarantine: ${reason}`,
      });
    } else {
      // 2. Use existing quarantine bed
      const quarantineBed = quarantineBedsResult.data[0];
      await assignPatientToBed({
        bed_id: quarantineBed.id,
        patient_id: patientId,
        assignment_notes: `Quarantine: ${reason}`,
      });
    }

    console.log('✅ Infectious patient assigned to quarantine!');
    return { success: true };
  } catch (error) {
    console.error('❌ Quarantine assignment failed:', error.message);
    return { success: false, error: error.message };
  }
}
```

### Get Bed Statistics

```javascript
async function getBedStatistics() {
  try {
    const allBeds = await getAllBeds();
    if (!allBeds.success) throw new Error('Failed to fetch beds');

    const beds = allBeds.data;
    const stats = {
      total: beds.length,
      empty: beds.filter((b) => b.status === 'EMPTY').length,
      occupied: beds.filter((b) => b.status === 'OCCUPIED').length,
      quarantine: beds.filter((b) => b.status === 'QUARANTINE').length,
      occupancyRate: (
        (beds.filter((b) => b.status === 'OCCUPIED').length / beds.length) *
        100
      ).toFixed(2),
      byWard: {},
    };

    // Group by ward
    beds.forEach((bed) => {
      if (!stats.byWard[bed.ward]) {
        stats.byWard[bed.ward] = { total: 0, occupied: 0 };
      }
      stats.byWard[bed.ward].total++;
      if (bed.status === 'OCCUPIED') {
        stats.byWard[bed.ward].occupied++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting bed statistics:', error);
    return null;
  }
}

// Usage
const stats = await getBedStatistics();
console.log(`Occupancy: ${stats.occupancyRate}%`);
console.log('Beds by Ward:', stats.byWard);
```

## 🧪 Testing Examples

### Test Infectious Patient Validation

```javascript
async function testInfectiousPatientValidation() {
  try {
    // Get a normal bed
    const normalBeds = await getBedsByStatus('EMPTY');
    const normalBed = normalBeds.data.find((b) => b.bed_type !== 'QUARANTINE');

    // Try to assign infectious patient
    const result = await assignPatientToBed({
      bed_id: normalBed.id,
      patient_id: 'infectious-patient-1',
      assignment_notes: 'Should fail',
    });

    if (!result.success) {
      console.log('✅ Correctly rejected infectious patient to normal bed');
      console.log(`Reason: ${result.data}`);
    } else {
      console.log('❌ SECURITY ERROR: Infectious patient assigned to normal bed!');
    }
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run test
testInfectiousPatientValidation();
```

## 📊 Component Structure

```
BedManagementDashboard
├── Summary Cards (Total, Empty, Occupied, Quarantine)
├── Tabs Container
│   ├── Tab: All Beds
│   │   ├── BedGridByStatus (EMPTY)
│   │   ├── BedGridByStatus (OCCUPIED)
│   │   └── BedGridByStatus (QUARANTINE)
│   ├── Tab: Empty
│   │   └── BedGridByStatus (EMPTY)
│   ├── Tab: Occupied
│   │   └── BedGridByStatus (OCCUPIED)
│   └── Tab: Quarantine
│       └── BedGridByStatus (QUARANTINE)
├── BedGridByStatus
│   └── Grid of BedCard components
├── BedCard (Drag-drop target)
│   ├── Bed info (number, type, ward)
│   ├── Patient info (if occupied)
│   ├── Quarantine badge (if quarantine)
│   └── Drag handlers
├── AppointmentTableComponent
│   └── UnifiedListTable with appointment columns
└── AssignmentModal (Drag-drop alternative)
    ├── Patient ID input
    ├── Infectious status checkbox
    ├── Assignment notes
    └── Confirm/Cancel buttons
```

## 🎨 UI Customization

### Change Color Theme

```jsx
// In BedManagementDashboard.jsx
const BED_STATUS_COLOR = {
  OCCUPIED: 'blue',      // Change to 'red', 'green', etc.
  EMPTY: 'gray',
  QUARANTINE: 'orange',
};
```

### Customize Bed Card Display

```jsx
// Modify BedCard component to add custom fields:
<VStack>
  <HStack justify="space-between">
    <Heading>{bed.bed_number}</Heading>
    {bed.custom_field && <Badge>{bed.custom_field}</Badge>}
  </HStack>
  {/* Add more fields as needed */}
</VStack>
```

### Change Grid Layout

```jsx
// In BedGridByStatus:
<Grid
  templateColumns="repeat(auto-fill, minmax(400px, 1fr))"  // Larger cards
  gap={6}
>
```

## 🚨 Error Handling Best Practices

```javascript
async function safeBedAssignment(bedId, patientId) {
  try {
    // Validate inputs
    if (!bedId || !patientId) {
      throw new Error('Invalid bed or patient ID');
    }

    // Check resource availability
    const bed = await getBedById(bedId);
    if (!bed.success) {
      throw new Error('Bed not found');
    }

    // Perform action with timeout
    const result = await Promise.race([
      assignPatientToBed({ bed_id: bedId, patient_id: patientId }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      ),
    ]);

    if (!result.success) {
      throw new Error(result.data);
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Assignment error:', error);
    // Show user-friendly message
    showErrorToast(error.message);
    return { success: false, error: error.message };
  }
}
```

## 📝 Notes

- All API calls return `{ success: boolean, data: any }`
- Dragon-and-drop is automatically prevented for incompatible assignments
- Test suite should be run before backend implementation
- Quarantine validation is enforced at both UI and API levels
