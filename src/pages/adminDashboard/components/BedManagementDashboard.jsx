/**
 * Bed Management Dashboard Component
 * @file src/pages/adminDashboard/components/BedManagementDashboard.jsx
 *
 * Visual bed management system with:
 * - OCCUPIED, EMPTY, QUARANTINE bed displays
 * - Drag-and-drop patient-to-bed assignment
 * - Appointment booking integration
 * - Quarantine restriction enforcement
 * 
 * Features:
 * - Professional card-based layout
 * - Real-time bed status visualization
 * - Unified list table for appointments
 * - Responsive grid for bed displays
 * - Modal-based patient assignment workflow
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  StatusBadge,
  Text,
  Textarea,
  HStack,
  VStack,
  Stack,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Checkbox,
} from '../../../component-library';
import useBedManagement from '../../../hooks/useBedManagement';
import UnifiedListTable from '../../../components/table/UnifiedListTable';
import DialysisParametersModal from './DialysisParametersModal';
import { DialysisBedSeat } from '../../../components/DialysisBedSeat';
import {
  getAllAppointmentsById,
  bookAppointment,
} from '../../../ApiCalls';
import './BedManagementDashboard.css';

// Bed statuses
const BED_STATUS_COLOR = {
  OCCUPIED: 'danger',
  EMPTY: 'success',
  QUARANTINE: 'warning',
};

const BED_STATUS_LABEL = {
  OCCUPIED: 'Occupied',
  EMPTY: 'Empty',
  QUARANTINE: 'Quarantine',
};

// ---------------------------------------------------------------------------
// Dummy data for local testing (used when hook/API returns empty)
// ---------------------------------------------------------------------------
const DUMMY_BEDS = [
  { id: 'b1', bed_number: '101', status: 'EMPTY', bed_type: 'GENERAL' },
  { id: 'b2', bed_number: '102', status: 'OCCUPIED', bed_type: 'ICU', patient_id: 'p123', patient_name: 'John Doe', assigned_since: Date.now() - 86400000 },
  { id: 'b3', bed_number: '103', status: 'EMPTY', bed_type: 'GENERAL' },
  { id: 'b4', bed_number: '104', status: 'QUARANTINE', bed_type: 'QUARANTINE', quarantine_reason: 'Infectious' },
  { id: 'b5', bed_number: '105', status: 'OCCUPIED', bed_type: 'GENERAL', patient_id: 'p456', patient_name: 'Jane Smith', assigned_since: Date.now() - 3600 * 1000 * 24 * 2 },
];

const DUMMY_APPOINTMENTS = [
  { id: 'a1', patient_id: 'p789', patient_name: 'Alice Johnson', appointment_date: new Date().toISOString(), appointment_time: '10:00-01:30', doctor_name: 'Dr. Brown', bed_number: null, status: 'Pending' },
  { id: 'a2', patient_id: 'p102', patient_name: 'Bob Williams', appointment_date: new Date(Date.now() + 86400000).toISOString(), appointment_time: '14:30', doctor_name: 'Dr. Green', bed_number: '102', status: 'Confirmed' },
  { id: 'a3', patient_id: 'p303', patient_name: 'Cathy Lee', appointment_date: new Date(Date.now() + 2 * 86400000).toISOString(), appointment_time: '09:00', doctor_name: 'Dr. Black', bed_number: null, status: 'Pending' },
];

// ============================================================================
// BedCard Component - Individual bed display with drag-and-drop
// ============================================================================
const BedCard = ({
  bed,
  onDragOver,
  onDrop,
  onCardClick,
  isDragOver = false,
}) => {
  const statusColor = BED_STATUS_COLOR[bed.status] || 'gray';
  const statusLabel = BED_STATUS_LABEL[bed.status] || 'Unknown';
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    let timer;
    // dialysis_duration_minutes expected to be number of minutes for the session
    const hasStart = bed && (bed.dialysis_start || bed.dialysis_start === 0);
    const durationMin = bed?.dialysis_duration_minutes || bed?.dialysis_duration || 0;

    if (hasStart && durationMin > 0) {
      const update = () => {
        const start = new Date(bed.dialysis_start).getTime();
        const end = start + durationMin * 60 * 1000;
        setRemainingMs(end - Date.now());
      };

      update();
      timer = setInterval(update, 1000);
    } else {
      setRemainingMs(null);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [bed?.dialysis_start, bed?.dialysis_duration_minutes, bed?.dialysis_duration]);

  const formatRemaining = (ms) => {
    if (ms == null) return null;
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card
      variant="outline"
      isClickable
      onClick={onCardClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bed-card ${isDragOver ? 'bed-card--drag-over' : ''}`}
      role="region"
      aria-label={`Bed ${bed.bed_number} - ${bed.status}`}
    >
      <CardBody>
        <VStack spacing={3} align="start">
          <HStack justify="space-between" width="full">
            <Heading as="h3" size="sm">
              Bed {bed.bed_number}
            </Heading>
            <Badge
              colorScheme={statusColor}
              variant="solid"
            >
              {statusLabel}
            </Badge>
          </HStack>

          {bed.bed_type && (
            <Text fontSize="sm" color="textMuted">
              Type: {bed.bed_type}
            </Text>
          )}

          {/* Ward information removed per request */}

          {bed.patient_id && (
            <Card variant="filled" size="sm" className="bed-card__patient-info">
              <CardBody>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" fontWeight="600">
                    Patient: {bed.patient_name || bed.patient_id}
                  </Text>
                  {bed.assigned_since && (
                    <Text fontSize="xs" color="textMuted">
                      Since: {new Date(bed.assigned_since).toLocaleDateString()}
                    </Text>
                  )}
                  {/* Countdown timer (shows when dialysis has started and duration provided). Runs backwards. */}
                  {remainingMs != null && (
                    <Text fontSize="sm" color="textMuted" className="bed-card__timer">
                      Time left: {formatRemaining(remainingMs)}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {bed.status === 'QUARANTINE' && (
            <Card variant="filled" size="sm" className="bed-card__quarantine">
              <CardBody>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" fontWeight="600">
                    Quarantine Status
                  </Text>
                  {bed.quarantine_reason && (
                    <Text fontSize="xs" color="textMuted">
                      Reason: {bed.quarantine_reason}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// ============================================================================
// AppointmentTable Component - Show appointments with UnifiedListTable
// ============================================================================
const AppointmentTableComponent = ({ appointments = [] }) => {
  const columns = useMemo(
    () => [
      {
        key: 'patient_name',
        label: 'Patient Name',
        type: 'text',
        width: '150px',
      },
      {
        key: 'appointment_time',
        label: 'Time',
        type: 'text',
        width: '100px',
      },
      {
        key: 'doctor_name',
        label: 'Doctor',
        type: 'text',
        width: '120px',
      },
      {
        key: 'bed_number',
        label: 'Bed',
        type: 'text',
        width: '80px',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'text',
        width: '100px',
      },
    ],
    []
  );

  const tableData = useMemo(() => {
    return appointments.map((apt) => ({
      ...apt,
      // Date column removed per new requirements. Time will be shown as a range calculated by technician later.
      appointment_time: apt.time_range || apt.appointment_time || 'TBD',
      doctor_name: apt.doctor_name || 'Unassigned',
      bed_number: apt.bed_number ? `Bed ${apt.bed_number}` : 'Not Assigned',
      status: apt.status || 'Pending',
    }));
  }, [appointments]);

  if (appointments.length === 0) {
    return (
      <Card variant="outline" className="appointments-empty">
        <CardBody>
          <VStack spacing={2} align="center" justify="center" minH="200px">
            <Heading as="h4" size="sm">
              No Appointments
            </Heading>
            <Text fontSize="sm" color="textMuted">
              No appointments scheduled for this period
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="outline" className="appointments-table">
      <CardHeader>
        <Heading as="h3" size="md">
          Scheduled Appointments
        </Heading>
      </CardHeader>
      <CardBody className="appointments-table__body">
        <UnifiedListTable
          data={tableData}
          columns={columns}
          title="Appointments"
          enablePagination
          rowsPerPage={5}
          actionButtons={false}
        />
      </CardBody>
    </Card>
  );
};

// ============================================================================
// AppointmentDraggableList - Draggable table styled like UnifiedListTable
// ============================================================================
const AppointmentDraggableList = ({ appointments = [] }) => {
  const handleDragStart = (e, apt) => {
    const dragPayload = {
      patient_id: apt.patient_id || apt.id,
      appointment_id: apt.id,
      patient_name: apt.patient_name,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
    e.dataTransfer.effectAllowed = 'move';
  };

  if (!appointments || appointments.length === 0) {
    return (
      <Box className="list-table__empty">
        <Heading as="h4" size="sm" mb={2}>No Appointments</Heading>
        <Text fontSize="sm" color="textMuted">No appointments available</Text>
      </Box>
    );
  }

  return (
    <Box className="appointments-draggable-wrapper">
      <Box className="list-table__wrapper">
        <table className="list-table appointments-draggable-table">
          <thead>
            <tr className="list-table__header-row">
              <th className="list-table__header-cell">Patient</th>
              <th className="list-table__header-cell">Time</th>
              <th className="list-table__header-cell">Doctor</th>
              <th className="list-table__header-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr
                key={apt.id}
                className="list-table__row draggable-row"
                draggable
                onDragStart={(e) => handleDragStart(e, apt)}
                role="button"
                tabIndex={0}
              >
                <td className="list-table__cell">
                  <span className="list-table__text-cell">{apt.patient_name}</span>
                </td>
                <td className="list-table__cell">
                  <span className="list-table__text-cell">{apt.time_range || apt.appointment_time || 'TBD'}</span>
                </td>
                <td className="list-table__cell">
                  <span className="list-table__text-cell">{apt.doctor_name || 'Unassigned'}</span>
                </td>
                <td className="list-table__cell">
                  <Badge
                    colorScheme={apt.status === 'Confirmed' ? 'success' : apt.status === 'Pending' ? 'warning' : 'gray'}
                    variant="subtle"
                    size="sm"
                  >
                    {apt.status || 'Pending'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

// ============================================================================
// BedGridHorizontal Component - Horizontal layout for beds
// ============================================================================
const BedGridHorizontal = ({
  beds,
  status,
  onBedDrop,
  onBedClick,
}) => {
  const statusBeds = beds.filter((b) => b.status === status);
  const statusLabel = BED_STATUS_LABEL[status] || 'Unknown';

  if (statusBeds.length === 0) {
    return (
      <Box className="beds-horizontal-empty">
        <Text color="textMuted" fontSize="sm">
          No {statusLabel.toLowerCase()} beds available
        </Text>
      </Box>
    );
  }

  return (
    <Box className="beds-horizontal-container">
      <Flex gap={3} overflowX="auto" pb={2} align="center">
        {statusBeds.map((bed) => (
          <Box key={bed.id} flexShrink={0} width="80px">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                onBedDrop(e, bed);
              }}
            >
              <DialysisBedSeat
                bedId={`B${bed.bed_number}`}
                status={mapBedStatusToDialysisSeatStatus(bed.status)}
                hasAlert={bed.status === 'QUARANTINE'}
                isRunning={Boolean(bed.dialysis_start && bed.dialysis_duration_minutes)}
                patientName={bed.patient_name}
                dialysisStart={bed.dialysis_start}
                dialysisDurationMinutes={bed.dialysis_duration_minutes}
                onClick={() => onBedClick(bed)}
                className={bed.patient_id ? 'dialysis-bed-seat--occupied' : ''}
              />
            </div>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

// ============================================================================
// BedGridGrid Component - Grid layout for beds (2 columns)
// ============================================================================
const BedGridGrid = ({
  beds,
  status,
  onBedDrop,
  onBedClick,
}) => {
  const statusBeds = beds.filter((b) => b.status === status);
  const statusLabel = BED_STATUS_LABEL[status] || 'Unknown';

  if (statusBeds.length === 0) {
    return (
      <Card variant="outline" className="beds-empty-state">
        <CardBody>
          <VStack spacing={2} align="center" justify="center" minH="150px">
            <Heading as="h4" size="sm">
              No {statusLabel} Beds
            </Heading>
            <Text fontSize="sm" color="textMuted">
              There are currently no {statusLabel.toLowerCase()} beds in the system
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <BedGridCompact
      beds={beds}
      status={status}
      onBedDrop={onBedDrop}
      onBedClick={onBedClick}
    />
  );
};

// ============================================================================
// Helper function - Map bed status to DialysisBedSeat status
// ============================================================================
const mapBedStatusToDialysisSeatStatus = (bedStatus) => {
  switch (bedStatus) {
    case 'EMPTY':
      return 'AVAILABLE';
    case 'OCCUPIED':
      return 'OCCUPIED';
    case 'QUARANTINE':
      return 'MAINTENANCE';
    default:
      return 'AVAILABLE';
  }
};

// ============================================================================
// BedGridCompact Component - Dense grid using DialysisBedSeat (80x80px)
// ============================================================================
const BedGridCompact = ({
  beds,
  status,
  onBedDrop,
  onBedClick,
  onBedDragOver = null,
}) => {
  const statusBeds = beds.filter((b) => b.status === status);
  const statusLabel = BED_STATUS_LABEL[status] || 'Unknown';

  if (statusBeds.length === 0) {
    return (
      <Box className="beds-compact-empty">
        <Text color="textMuted" fontSize="sm">
          No {statusLabel.toLowerCase()} beds available
        </Text>
      </Box>
    );
  }

  return (
    <Box className="beds-compact-container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 80px)',
        gap: '12px',
        width: '100%',
      }}>
        {statusBeds.map((bed) => (
          <div
            key={bed.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (onBedDragOver) onBedDragOver(bed);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onBedDrop(e, bed);
            }}
          >
            <DialysisBedSeat
              bedId={`B${bed.bed_number}`}
              status={mapBedStatusToDialysisSeatStatus(bed.status)}
              hasAlert={bed.status === 'QUARANTINE'}
              isRunning={Boolean(bed.dialysis_start && bed.dialysis_duration_minutes)}
              onClick={() => onBedClick(bed)}
              dialysisStart={bed.dialysis_start}
              dialysisDurationMinutes={bed.dialysis_duration_minutes}
            />
          </div>
        ))}
      </div>
    </Box>
  );
};

// ============================================================================
// AssignmentModal - Modal for assigning patients to beds
// ============================================================================
const AssignmentModal = ({
  isOpen,
  onClose,
  bed,
  onConfirm,
  isLoading = false,
}) => {
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [isInfectious, setIsInfectious] = useState(false);

  const handleSubmit = () => {
    if (!patientId.trim()) {
      alert('Please enter a patient ID');
      return;
    }

    onConfirm({
      bed_id: bed?.id,
      patient_id: patientId,
      is_infectious: isInfectious,
      notes,
    });

    setPatientId('');
    setNotes('');
    setIsInfectious(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h2" size="md">
            Assign Patient to Bed {bed?.bed_number}
          </Heading>
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Patient ID</FormLabel>
              <Input
                placeholder="Enter patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                isDisabled={isLoading}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <HStack spacing={3}>
                <Checkbox
                  checked={isInfectious}
                  onChange={(e) => setIsInfectious(e.target.checked)}
                  disabled={isLoading}
                />
                <FormLabel mb={0}>
                  Infectious / Isolation Status
                </FormLabel>
              </HStack>
            </FormControl>

            {isInfectious && bed?.bed_type !== 'QUARANTINE' && (
              <Card variant="filled" className="modal-warning">
                <CardBody>
                  <Text fontSize="sm" fontWeight="500">
                    Warning: Infectious patients should be assigned to quarantine beds only
                  </Text>
                </CardBody>
              </Card>
            )}

            <FormControl>
              <FormLabel>Assignment Notes (Optional)</FormLabel>
              <Textarea
                placeholder="Enter any notes about this assignment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                isDisabled={isLoading}
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2}>
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Assign Patient
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ============================================================================
// Main BedManagementDashboard Component
// ============================================================================
export default function BedManagementDashboard() {
  const {
    beds,
    bedsByStatus,
    loading,
    error,
    BED_STATUS,
    fetchAllBeds,
    assignPatient,
    unassignPatient,
    quarantineBed,
    canAssignPatientToBed,
  } = useBedManagement();

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [bedTimers, setBedTimers] = useState({}); // { [bedId]: { dialysis_start, dialysis_duration_minutes } }
  const [selectedBed, setSelectedBed] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDialysisModalOpen, setIsDialysisModalOpen] = useState(false);
  const [dialysisPatientData, setDialysisPatientData] = useState({});
  const [dialysisBedData, setDialysisBedData] = useState({});

  const showNotification = useCallback((title, description, status = 'success') => {
    setNotification({ title, description, status });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const result = await getAllAppointmentsById();
        if (result.success) {
          setAppointments(result.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleBedDrop = useCallback(
    async (e, targetBed) => {
      e.preventDefault();
      const draggedData = e.dataTransfer.getData('application/json');

      if (!draggedData) {
        showNotification('Invalid drag data', 'Please drag a valid patient', 'error');
        return;
      }

      try {
        const patientData = JSON.parse(draggedData);
        const canAssign = await canAssignPatientToBed(
          targetBed.id,
          patientData.patient_id
        );

        if (!canAssign.allowed) {
          showNotification('Cannot assign patient', canAssign.reason, 'error');
          return;
        }

        setIsAssigning(true);
        const result = await assignPatient(
          targetBed.id,
          patientData.patient_id,
          `Assigned via drag-and-drop`
        );

        if (result.success) {
          await fetchAllBeds();

          // Open dialysis modal with patient data
          setDialysisPatientData({
            patient_id: patientData.patient_id,
            patient_name: patientData.patient_name,
            appointment_id: patientData.appointment_id,
          });
          setDialysisBedData(targetBed);
          setIsDialysisModalOpen(true);

          showNotification('Success', `Patient assigned to Bed ${targetBed.bed_number}`, 'success');
        } else {
          showNotification('Assignment failed', result.data, 'error');
        }
      } catch (err) {
        showNotification('Error', err.message, 'error');
      } finally {
        setIsAssigning(false);
      }
    },
    [assignPatient, canAssignPatientToBed, fetchAllBeds, showNotification]
  );

  const handleBedClick = useCallback((bed) => {
    // If bed is occupied, open dialysis modal for parameter entry
    if (bed.status === 'OCCUPIED' && bed.patient_id) {
      setDialysisPatientData({
        patient_id: bed.patient_id,
        patient_name: bed.patient_name,
      });
      setDialysisBedData(bed);
      setIsDialysisModalOpen(true);
    } else {
      // For empty beds, show assignment modal
      setSelectedBed(bed);
      setIsAssignmentModalOpen(true);
    }
  }, []);

  const handleAssignmentConfirm = useCallback(
    async (assignmentData) => {
      try {
        setIsAssigning(true);
        const result = await assignPatient(
          assignmentData.bed_id,
          assignmentData.patient_id,
          assignmentData.notes
        );

        if (result.success) {
          await fetchAllBeds();
          showNotification('Success', `Patient assigned to Bed ${selectedBed.bed_number}`, 'success');
          setIsAssignmentModalOpen(false);
        } else {
          showNotification('Assignment failed', result.data, 'error');
        }
      } catch (err) {
        showNotification('Error', err.message, 'error');
      } finally {
        setIsAssigning(false);
      }
    },
    [assignPatient, fetchAllBeds, selectedBed, showNotification]
  );

  // Handle stages coming from DialysisParametersModal
  const handleDialysisStageChange = useCallback(
    (stageName, data) => {
      if (stageName === 'during') {
        // update local overlay timers for immediate UI feedback
        if (data?.bed_id && data?.dialysis_start && data?.dialysis_duration_minutes) {
          setBedTimers((prev) => ({
            ...prev,
            [data.bed_id]: {
              dialysis_start: data.dialysis_start,
              dialysis_duration_minutes: data.dialysis_duration_minutes,
            },
          }));
        }

        // update appointments list with time_range if appointment_id provided
        if (data?.appointment_id && data?.time_range) {
          setAppointments((prev) =>
            prev.map((apt) =>
              (apt.id === data.appointment_id || apt.appointment_id === data.appointment_id)
                ? { ...apt, time_range: data.time_range }
                : apt
            )
          );
        }

        // refresh backend state if available
        fetchAllBeds();
      }
    },
    [fetchAllBeds]
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Card variant="outline" className="loading-card">
          <CardBody>
            <VStack spacing={3} align="center">
              <div className="spinner" />
              <Text>Loading bed management data...</Text>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  const emptyBeds = bedsByStatus[BED_STATUS.EMPTY]?.length || 0;
  const occupiedBeds = bedsByStatus[BED_STATUS.OCCUPIED]?.length || 0;
  const quarantineBeds = bedsByStatus[BED_STATUS.QUARANTINE]?.length || 0;

  // For local testing: fall back to dummy data if hook returns empty
  const displayBeds = (beds && beds.length > 0) ? beds : DUMMY_BEDS;
  const displayAppointments = (appointments && appointments.length > 0) ? appointments : DUMMY_APPOINTMENTS;

  const displayEmptyBeds = displayBeds.filter((b) => b.status === BED_STATUS.EMPTY).length;
  const displayOccupiedBeds = displayBeds.filter((b) => b.status === BED_STATUS.OCCUPIED).length;
  const displayQuarantineBeds = displayBeds.filter((b) => b.status === BED_STATUS.QUARANTINE).length;

  return (
    <Box className="bed-management-dashboard">
      <VStack spacing={4} align="stretch">

        {/* Page Header */}
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="lg">
            Bed Management System
          </Heading>
          <Button
            variant="solid"
            onClick={fetchAllBeds}
            isLoading={loading}
            size="md"
          >
            Refresh Data
          </Button>
        </HStack>

        {/* Summary Stats Cards */}
        {/* <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} 
          gap={4}
        >
          <Card variant="outline" className="stat-card">
            <CardBody>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color="textMuted" fontWeight="600">
                  Total Beds
                </Text>
                <Heading as="h3" size="lg">
                  {beds.length}
                </Heading>
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline" className="stat-card stat-card--available">
            <CardBody>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color="textMuted" fontWeight="600">
                  Available
                </Text>
                <Heading as="h3" size="lg">
                  {emptyBeds}
                </Heading>
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline" className="stat-card stat-card--occupied">
            <CardBody>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color="textMuted" fontWeight="600">
                  Occupied
                </Text>
                <Heading as="h3" size="lg">
                  {occupiedBeds}
                </Heading>
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline" className="stat-card stat-card--quarantine">
            <CardBody>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color="textMuted" fontWeight="600">
                  Quarantine
                </Text>
                <Heading as="h3" size="lg">
                  {quarantineBeds}
                </Heading>
              </VStack>
            </CardBody>
          </Card>
        </Grid> */}

        {/* Main Two-Column Layout */}
        <Grid
          templateColumns={{ base: '1fr', md: '1fr 1.5fr' }}
          gap={4}
          className="main-layout"
          width="100%"
        >
          {/* Left Column: Appointments */}
          <Box>
            <Card variant="outline" className="appointments-card">
              <CardHeader>
                <Heading as="h2" size="md">
                  Appointments
                </Heading>
                <Text fontSize="xs" color="textMuted" mt={1} align="right" >
                  Drag a row to assign to an empty bed
                </Text>
              </CardHeader>
              <CardBody p={0}>
                <AppointmentDraggableList appointments={displayAppointments} />
              </CardBody>
            </Card>
          </Box>

          {/* Right Column: Beds */}
          <Box>
            <Card variant="outline" className="beds-section">
              <CardHeader>
                <Heading as="h2" size="md">
                  Beds
                </Heading>
              </CardHeader>
              <CardBody p={3}>
                <VStack spacing={4} align="stretch">
                  {/* Available Beds - Horizontal */}
                  <Box>
                    <BedGridHorizontal
                      beds={displayBeds.map((b) => ({ ...b, ...(bedTimers[b.id] || {}) }))}
                      status={BED_STATUS.EMPTY}
                      onBedDrop={handleBedDrop}
                      onBedClick={handleBedClick}
                    />
                  </Box>

                  {/* Occupied Beds - Compact Grid */}
                  {occupiedBeds > 0 && (
                    <>
                      <Box
                        borderTop="1px solid"
                        className="border-[#B6432E]"
                        borderColor="borderLight"
                        pt={4}
                      />
                      <Box>
                        <HStack mb={3} justify="space-between">
                          <Heading as="h3" size="sm">
                            Occupied
                          </Heading>
                          <Text fontSize="xs" color="textMuted">
                            {displayOccupiedBeds} beds
                          </Text>
                        </HStack>
                        <BedGridCompact
                          beds={displayBeds.map((b) => ({ ...b, ...(bedTimers[b.id] || {}) }))}
                          status={BED_STATUS.OCCUPIED}
                          onBedDrop={handleBedDrop}
                          onBedClick={handleBedClick}
                        />
                      </Box>
                    </>
                  )}


                  {/* Quarantine Beds Section - Full Width */}
                  {displayQuarantineBeds > 0 && (
                    <Box
                      borderTop="2px solid"
                      borderColor="borderLight"
                      pt={4}
                    >
                      <Card variant="outline" className="quarantine-section">
                        <CardBody>
                          <BedGridGrid
                            beds={displayBeds.map((b) => ({ ...b, ...(bedTimers[b.id] || {}) }))}
                            status={BED_STATUS.QUARANTINE}
                            onBedDrop={handleBedDrop}
                            onBedClick={handleBedClick}
                          />
                        </CardBody>
                      </Card>
                    </Box>
                  )}

                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Grid>
      </VStack>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        bed={selectedBed}
        onConfirm={handleAssignmentConfirm}
        isLoading={isAssigning}
      />

      {/* Dialysis Parameters Modal */}
      <DialysisParametersModal
        isOpen={isDialysisModalOpen}
        onClose={() => {
          setIsDialysisModalOpen(false);
          setDialysisPatientData({});
          setDialysisBedData({});
        }}
        patient={dialysisPatientData}
        bed={dialysisBedData}
        onStageChange={handleDialysisStageChange}
      />

      {/* Notification Toast */}
      {notification && (
        <Box
          className={`notification notification--${notification.status}`}
          role="alert"
          aria-live="polite"
        >
          <Text fontWeight="600" mb={1}>
            {notification.title}
          </Text>
          {notification.description && (
            <Text fontSize="sm">
              {notification.description}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
