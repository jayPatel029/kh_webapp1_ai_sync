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
  Select,
} from '../../../component-library';
import useBedManagement from '../../../hooks/useBedManagement';
import UnifiedListTable from '../../../components/table/UnifiedListTable';
import DialysisParametersModal from './DialysisParametersModal';
import { DialysisBedSeat } from '../../../components/DialysisBedSeat';
import ClinicSelector from '../../../components/ClinicSelector';
import {
  getClinics,
  getClinicBeds,
  getClinicAppointments,
  getAppointments,
  getOrganizations,
} from '../../../ApiCalls/clinicApis';
import OrganizationSelector from '../../../components/OrganizationSelector';
import './BedManagementDashboard.css';

// Bed statuses
// ---------------------------------------------------------------------------
// Bed Status Configuration
// Centralized system for colors, labels, and theme schemes
// ---------------------------------------------------------------------------
const BED_STATUS_CONFIG = {
  AVAILABLE: {
    color: '#10B981', // Emerald 500
    scheme: 'green',
    label: 'Available',
    dotColor: '#10B981'
  },
  EMPTY: {
    color: '#10B981',
    scheme: 'green',
    label: 'Available',
    dotColor: '#10B981'
  },
  OCCUPIED: {
    color: '#3B82F6', // Blue 500
    scheme: 'blue',
    label: 'Occupied',
    dotColor: '#3B82F6'
  },
  QUARANTINE: {
    color: '#F43F5E', // Rose 500 (Better for Isolation/Danger)
    scheme: 'red',
    label: 'Isolated',
    dotColor: '#F43F5E'
  },
  ISOLATED: {
    color: '#F43F5E',
    scheme: 'red',
    label: 'Isolated',
    dotColor: '#F43F5E'
  },
  CLEANING: {
    color: '#F97316', // Orange 500
    scheme: 'orange',
    label: 'Cleaning',
    dotColor: '#F97316'
  },
  MAINTENANCE: {
    color: '#64748B', // Slate 500
    scheme: 'gray',
    label: 'Maintenance',
    dotColor: '#64748B'
  },
  IN_PROGRESS: {
    color: '#8B5CF6', // Violet 500
    scheme: 'purple',
    label: 'In Progress',
    dotColor: '#8B5CF6'
  },
};

/**
 * Robust helper to get status configuration
 * Handles case-insensitivity and provides fallbacks
 */
const getStatusConfig = (status) => {
  const normalizedStatus = String(status || '').toUpperCase();
  return BED_STATUS_CONFIG[normalizedStatus] || {
    color: '#94A3B8',
    scheme: 'gray',
    label: status || 'Unknown',
    dotColor: '#94A3B8'
  };
};

// Legacy support for older code if any
const BED_STATUS_COLOR = Object.keys(BED_STATUS_CONFIG).reduce((acc, key) => {
  acc[key] = BED_STATUS_CONFIG[key].color;
  return acc;
}, {});

// Helper for status dot legend
const StatusDot = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: config.color,
          border: '2.5px solid white',
          boxShadow: `0 0 0 1px ${config.color}`
        }}
      />
      <Text fontSize="xs" fontWeight="600" color="gray.600">{config.label}</Text>
    </div>
  );
};

// Labels mapping is now part of getStatusConfig, but keeping this for any legacy lookups
const BED_STATUS_LABEL = Object.keys(BED_STATUS_CONFIG).reduce((acc, key) => {
  acc[key] = BED_STATUS_CONFIG[key].label;
  return acc;
}, {});

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
  const config = getStatusConfig(bed.status);
  const statusScheme = config.scheme;
  const statusLabel = config.label;
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
              colorScheme={statusScheme}
              variant="solid"
              borderRadius="full"
              px={2}
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
                  {bed.heparin && (
                    <Text fontSize="sm" color="textMuted">
                      <span style={{ fontWeight: 600 }}>Heparin:</span>{' '}
                      {bed.heparin.dose_iu || bed.heparin.dose || bed.heparin.doseIU || '—'} IU
                      {bed.heparin.per_kg ? ` (${bed.heparin.per_kg} IU/kg)` : ''}
                      {bed.heparin.ailment ? ` • ${bed.heparin.ailment}` : ''}
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
const AppointmentDraggableList = ({ appointments = [], onSlotClick = null }) => {
  const handleDragStart = (e, apt) => {
    const status = String(apt.status).toLowerCase();
    // Only allow waiting appointments to be assigned to a bed
    const canAssign = ['waiting'].includes(status);

    if (!canAssign) {
      e.preventDefault();
      return;
    }

    // Parse patient_ailments which may be a JSON string
    let parsedAilments = '';
    let parsedObj = null;
    try {
      if (typeof apt.patient_ailments === 'string' && apt.patient_ailments.trim().startsWith('{')) {
        parsedObj = JSON.parse(apt.patient_ailments);
      }
    } catch (err) { parsedObj = null; }

    if (parsedObj) {
      parsedAilments = parsedObj.ailments || parsedObj.patientAilments || parsedObj.patient_ailments || '';
    } else if (apt.patient_ailments) {
      parsedAilments = String(apt.patient_ailments);
    }

    const inferredInfectious = (String(parsedAilments || '').toLowerCase().includes('infectious')) || (apt.is_infectious);

    const dragPayload = {
      patient_id: apt.patient_id || apt.id,
      appointment_id: apt.id,
      patient_name: apt.patient_name || (parsedObj && parsedObj.patientName) || `Patient #${apt.patient_id || apt.id}`,
      is_infectious: inferredInfectious,
      raw_ailments: parsedAilments,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
    e.dataTransfer.effectAllowed = 'move';
  };

  if (!appointments || appointments.length === 0) {
    return (
      <Box className="list-table__empty">
        <Heading as="h4" size="sm" mb={2}>No Appointments</Heading>
        <Text fontSize="sm" color="textMuted">No appointments available for this clinic</Text>
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
              <th className="list-table__header-cell">Status</th>
              <th className="list-table__header-cell">Ailments</th>
              <th className="list-table__header-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(appointments) ? appointments : []).map((apt) => {
              // derive display name and ailments (patient_ailments may be JSON)
              let displayName = apt.patient_name || `Patient #${apt.patient_id || apt.id}`;
              let displayAilments = apt.patient_ailments || '';
              try {
                if (typeof apt.patient_ailments === 'string' && apt.patient_ailments.trim().startsWith('{')) {
                  const parsed = JSON.parse(apt.patient_ailments);
                  displayName = displayName === 'Patient #' + (apt.patient_id || apt.id) ? (parsed.patientName || displayName) : displayName;
                  displayAilments = parsed.ailments || parsed.patientAilments || parsed.patient_ailments || displayAilments;
                }
              } catch (err) { /* ignore */ }

              const isEligible = String(apt.status).toLowerCase() === 'waiting';
              const isInfectious = String(displayAilments || '').toLowerCase().includes('infectious') || apt.is_infectious;

              const rowStyle = isInfectious ? { background: '#FEF2F2' } : {};

              return (
                <tr
                  key={apt.id}
                  className={`list-table__row draggable-row ${!isEligible ? 'draggable-row--disabled' : ''}`}
                  style={rowStyle}
                  draggable={isEligible}
                  onDragStart={(e) => handleDragStart(e, apt)}
                  role="button"
                  tabIndex={0}
                >
                  <td className="list-table__cell">
                    <VStack align="start" spacing={0}>
                      <span className="list-table__text-cell" style={{ fontWeight: 600 }}>{displayName}</span>
                      <Text fontSize="xs" color="textMuted">ID: {apt.patient_id}</Text>
                    </VStack>
                  </td>
                  <td className="list-table__cell">
                    <Badge
                      colorScheme={isEligible ? 'success' : apt.status === 'in_progress' ? 'info' : 'gray'}
                      variant="subtle"
                      size="sm"
                    >
                      {apt.status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </td>
                  <td className="list-table__cell">
                    {isInfectious && (
                      <Badge colorScheme="danger" variant="solid" size="xs" mb={1}>
                        INFECTIOUS
                      </Badge>
                    )}
                    <span className="list-table__text-cell text-xs">{displayAilments || 'None'}</span>
                  </td>
                  <td className="list-table__cell">
                    {isEligible ? (
                      <Text fontSize="xs" color="success" fontWeight="500">Ready</Text>
                    ) : (
                      <Text fontSize="xs" color="textMuted">N/A</Text>
                    )}
                  </td>
                </tr>
              );
            })}
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
  const statusBeds = beds.filter((b) => {
    const normalizedBedStatus = String(b.status || '').toUpperCase();
    const normalizedTargetStatus = String(status || '').toUpperCase();
    return normalizedBedStatus === normalizedTargetStatus;
  });
  const config = getStatusConfig(status);
  const statusLabel = config.label;

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
  const statusBeds = beds.filter((b) => {
    const normalizedBedStatus = String(b.status || '').toUpperCase();
    const normalizedTargetStatus = String(status || '').toUpperCase();
    return normalizedBedStatus === normalizedTargetStatus;
  });
  const config = getStatusConfig(status);
  const statusLabel = config.label;

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
  const normalized = String(bedStatus || '').toUpperCase();
  switch (normalized) {
    case 'EMPTY':
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'OCCUPIED':
      return 'OCCUPIED';
    case 'QUARANTINE':
    case 'ISOLATED':
      return 'QUARANTINE';
    case 'CLEANING':
      return 'CLEANING';
    case 'MAINTENANCE':
      return 'MAINTENANCE';
    default:
      return 'AVAILABLE';
  }
};

// ============================================================================
// BedGridCompact Component - Dense grid using DialysisBedSeat (80x80px)
// ============================================================================
const BedGridCompact = ({
  beds = [],
  status,
  onBedDrop,
  onBedClick,
  onBedDragOver = null,
}) => {
  const statusBeds = (Array.isArray(beds) ? beds : []).filter((b) => {
    const normalizedBedStatus = String(b.status || '').toUpperCase();
    const normalizedTargetStatus = String(status || '').toUpperCase();
    return normalizedBedStatus === normalizedTargetStatus;
  });
  const config = getStatusConfig(status);
  const statusLabel = config.label;

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
        gap: '24px',
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
export default function BedManagementDashboard(props) {
  const {
    beds,
    bedsByStatus,
    loading: bedsLoading,
    error,
    BED_STATUS,
    clinicId,
    setClinicId,
    fetchAllBeds,
    assignPatient,
    unassignPatient,
    transferPatient,
    quarantineBed,
    canAssignPatientToBed,
  } = useBedManagement();

  const [clinics, setClinics] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [selectedBed, setSelectedBed] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDialysisModalOpen, setIsDialysisModalOpen] = useState(false);
  const [dialysisPatientData, setDialysisPatientData] = useState({});
  const [dialysisBedData, setDialysisBedData] = useState({});

  const showNotification = useCallback((title, description, status = 'success') => {
    setNotification({ title, description, status });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Fetch Clinics & Orgs for selector
  useEffect(() => {
    const fetchInitialData = async () => {
      setClinicsLoading(true);
      try {
        const [clinicsResult, orgsResult] = await Promise.all([
          getClinics(),
          getOrganizations()
        ]);

        if (orgsResult.success) {
          const orgList = Array.isArray(orgsResult.data?.data) ? orgsResult.data.data : (orgsResult.data || []);
          setOrganizations(orgList);
        }

        if (clinicsResult.success) {
          const rawData = clinicsResult.data || [];
          const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);
          setClinics(dataList);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setClinicsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Reset clinic when org changes and auto-select first clinic of new org
  useEffect(() => {
    if (selectedOrgId && clinics.length > 0) {
      const orgClinics = clinics.filter(c => String(c.organization_id || c.org_id) === String(selectedOrgId));
      if (orgClinics.length > 0) {
        // If current clinic is not in the new org's list, reset to first clinic of new org
        const isCurrentInOrg = orgClinics.some(c => String(c.id) === String(clinicId));
        if (!isCurrentInOrg) {
          setClinicId(String(orgClinics[0].id));
        }
      } else {
        setClinicId('');
      }
    } else {
      setClinicId('');
    }
  }, [selectedOrgId, clinics, setClinicId, clinicId]);

  // Fetch Appointments for clinic (filter for arrived)
  const loadAppointments = useCallback(async (cid) => {
    if (!cid) return;
    setAppointmentsLoading(true);
    try {
      // Use getAppointments with filters
      const result = await getAppointments({
        clinicId: cid,
        status: 'WAITING'
      });

      if (result.success) {
        // The API returns { page, limit, data: [...] }
        const appointmentList = result.data?.data || (Array.isArray(result.data) ? result.data : []);
        setAppointments(appointmentList);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadAppointments(clinicId);
    }
  }, [clinicId, loadAppointments]);

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

        // If patient marked infectious and target bed is not quarantine, require explicit confirmation and reason
        if (patientData.is_infectious && String(targetBed.status).toUpperCase() !== 'QUARANTINE') {
          const confirmed = window.confirm('Patient appears to be infectious. Assigning to a normal bed is not recommended. Do you want to proceed?');
          if (!confirmed) {
            showNotification('Assignment cancelled', 'Assignment aborted by user due to infectious status', 'info');
            return;
          }

          const reason = window.prompt('Provide a reason for assigning this infectious patient to a normal bed (required):');
          if (!reason || !reason.trim()) {
            showNotification('Assignment cancelled', 'A reason is required to assign infectious patients to normal beds', 'error');
            return;
          }

          // attach reason to notes parameter when assigning
          patientData._assignment_reason = reason.trim();
        }

        // Bed logic: section 2.3 - cannot assign to cleaning
        if (targetBed.status === 'CLEANING') {
          showNotification('Bed Unavailable', 'This bed is currently being cleaned.', 'error');
          return;
        }

        const canAssign = await canAssignPatientToBed(
          targetBed.id,
          patientData.patient_id
        );

        if (!canAssign.allowed) {
          showNotification('Cannot assign patient', canAssign.reason, 'error');
          return;
        }

        setIsAssigning(true);
        const notesForAssign = patientData._assignment_reason ? patientData._assignment_reason : `Assigned via clinic command center drag-drop`;
        const result = await assignPatient(
          targetBed.id,
          patientData.patient_id,
          patientData.appointment_id,
          notesForAssign
        );

        if (result.success) {
          // Section 2.5: Transitions Appt -> Session (RUNNING)
          // Open dialysis modal with patient data and selected bed
          setDialysisPatientData({
            patient_id: patientData.patient_id,
            patient_name: patientData.patient_name,
            appointment_id: patientData.appointment_id,
          });
          setDialysisBedData(targetBed);
          setIsDialysisModalOpen(true);

          showNotification('Success', `Patient assigned to Bed ${targetBed.bed_number}`, 'success');
          loadAppointments(clinicId);
          fetchAllBeds(); // Refresh beds to show occupation
        } else {
          showNotification('Assignment failed', result.data || 'Unknown error', 'error');
        }
      } catch (err) {
        showNotification('Error', err.message, 'error');
      } finally {
        setIsAssigning(false);
      }
    },
    [assignPatient, canAssignPatientToBed, clinicId, loadAppointments, showNotification]
  );

  const handleBedClick = useCallback((bed) => {
    if (bed.status === 'CLEANING') {
      showNotification('Bed is Cleaning', `Last cleaned: ${bed.last_cleaned_at ? new Date(bed.last_cleaned_at).toLocaleTimeString() : 'N/A'}`, 'info');
      return;
    }

    // If bed is occupied, open dialysis modal for session tracking
    if (bed.status === 'OCCUPIED' && bed.patient_id) {
      setDialysisPatientData({
        patient_id: bed.patient_id,
        patient_name: bed.patient_name,
        appointment_id: bed.appointment_id,
      });
      setDialysisBedData(bed);
      setIsDialysisModalOpen(true);
    } else if (bed.status === 'EMPTY' || bed.status === 'AVAILABLE' || bed.status === 'QUARANTINE') {
      // For empty or quarantine beds, show assignment modal
      setSelectedBed(bed);
      setIsAssignmentModalOpen(true);
    }
  }, [showNotification]);

  const handleAssignmentConfirm = useCallback(
    async (assignmentData) => {
      try {
        setIsAssigning(true);
        const result = await assignPatient(
          assignmentData.bed_id,
          assignmentData.patient_id,
          null, // explicit manual assignment has no appointment_id in this simplified modal
          assignmentData.notes
        );

        if (result.success) {
          showNotification('Success', `Patient assigned to Bed ${selectedBed.bed_number}`, 'success');
          setIsAssignmentModalOpen(false);
          loadAppointments(clinicId);
        } else {
          showNotification('Assignment failed', result.data, 'error');
        }
      } catch (err) {
        showNotification('Error', err.message, 'error');
      } finally {
        setIsAssigning(false);
      }
    },
    [assignPatient, clinicId, loadAppointments, selectedBed, showNotification]
  );

  const handleDialysisStageChange = useCallback(
    (stageName, data) => {
      // Refresh both beds and appointments
      fetchAllBeds();
      loadAppointments(clinicId);

      if (stageName === 'completed') {
        showNotification('Session Finished', 'Dialysis session completed and bed released for cleaning.', 'success');
      }
    },
    [clinicId, fetchAllBeds, loadAppointments, showNotification]
  );

  if (bedsLoading && clinics.length === 0) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Card variant="outline" className="loading-card">
          <CardBody>
            <VStack spacing={3} align="center">
              <div className="spinner" />
              <Text>Synchronizing Clinic Data...</Text>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  const selectedClinic = (Array.isArray(clinics) ? clinics : []).find(c => c.id === Number(clinicId));

  return (
    <Box className="bed-management-dashboard">
      <VStack spacing={4} align="stretch">

        {/* Command Center Header */}
        <HStack
          justify="space-between"
          align="center"
          bg="white"
          borderRadius="xl"
          shadow="sm"
          p={4}
          position="relative"
          zIndex={100}
        >
          <HStack spacing={8} flexWrap="wrap">
            <OrganizationSelector
              className='mt-6'
              orgId={selectedOrgId}
              setOrgId={setSelectedOrgId}
              organizations={organizations}
              label="ORG"
            />
            <ClinicSelector
              clinicId={clinicId}
              setClinicId={setClinicId}
              orgId={selectedOrgId}
              clinics={clinics}
            />

            {/* <Button
              variant="outline"
              onClick={() => {
                fetchAllBeds();
                loadAppointments(clinicId);
              }}
              isLoading={bedsLoading || appointmentsLoading}
              size="md"
              className="mt-6 min-w-fit"
              leftIcon={<span className="refresh-icon">↻</span>}
            >
              Sync
            </Button> */}
          </HStack>
        </HStack>

        {/* Capacity Summary */}
        {/* <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} 
          gap={4}
        >
          <Card variant="outline" className="stat-card">
            <CardBody>
              <HStack justify="space-between">
                <VStack spacing={0} align="start">
                  <Text fontSize="xs" color="textMuted" fontWeight="600">TOTAL BEDS</Text>
                  <Heading as="h3" size="lg">{beds.length}</Heading>
                </VStack>
                <div className="stat-icon stat-icon--total" />
              </HStack>
            </CardBody>
          </Card>

          <Card variant="outline" className="stat-card">
            <CardBody>
              <HStack justify="space-between">
                <VStack spacing={0} align="start">
                  <Text fontSize="xs" color="textMuted" fontWeight="600">AVAILABLE</Text>
                  <Heading as="h3" size="lg" color="success.500">{bedsByStatus[BED_STATUS.EMPTY]?.length || 0}</Heading>
                </VStack>
                <div className="stat-icon stat-icon--available" />
              </HStack>
            </CardBody>
          </Card>

          <Card variant="outline" className="stat-card">
            <CardBody>
              <HStack justify="space-between">
                <VStack spacing={0} align="start">
                  <Text fontSize="xs" color="textMuted" fontWeight="600">IN SESSION</Text>
                  <Heading as="h3" size="lg" color="brand.500">{bedsByStatus[BED_STATUS.OCCUPIED]?.length || 0}</Heading>
                </VStack>
                <div className="stat-icon stat-icon--occupied" />
              </HStack>
            </CardBody>
          </Card>

          <Card variant="outline" className="stat-card">
            <CardBody>
              <HStack justify="space-between">
                <VStack spacing={0} align="start">
                  <Text fontSize="xs" color="textMuted" fontWeight="600">CLEANING</Text>
                  <Heading as="h3" size="lg" color="info.500">{bedsByStatus[BED_STATUS.CLEANING]?.length || 0}</Heading>
                </VStack>
                <div className="stat-icon stat-icon--cleaning" />
              </HStack>
            </CardBody>
          </Card>
        </Grid> */}

        {/* Main Workspace */}
        <Grid
          templateColumns={{ base: '1fr', lg: '350px 1fr' }}
          gap={6}
          className="main-layout"
          width="100%"
        >
          {/* Appointment Queue Panel */}
          <Box>
            <Card variant="outline" height="100%" borderRadius="xl" overflow="hidden">
              <CardHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Heading as="h3" size="sm">Appointment Queue</Heading>
                    <Text fontSize="xs" color="textMuted">Drag to assign bed</Text>
                  </VStack>
                  <Badge variant="solid" colorScheme="brand" borderRadius="full">
                    {(Array.isArray(appointments) ? appointments : []).filter(a => {
                      const s = String(a.status).toLowerCase();
                      return s === 'waiting';
                    }).length} READY
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody p={0}>
                {appointmentsLoading ? (
                  <Flex p={8} justify="center"><div className="spinner-small" /></Flex>
                ) : (
                  <AppointmentDraggableList appointments={appointments} />
                )}
              </CardBody>
            </Card>
          </Box>

          {/* Bed Map Panel */}
          <Box>
            <Card variant="outline" borderRadius="xl" shadow="sm">
              <CardHeader borderBottom="1px solid" borderColor="gray.100">
                <HStack justify="space-between">
                  <Heading as="h3" size="sm">Clinical Bed Map</Heading>
                  <HStack spacing={4} flexWrap="wrap">
                    <StatusDot status="AVAILABLE" />
                    <StatusDot status="OCCUPIED" />
                    <StatusDot status="QUARANTINE" />
                    <StatusDot status="CLEANING" />
                    <StatusDot status="MAINTENANCE" />
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody p={6}>
                <VStack spacing={8} align="stretch">

                  {/* Normal / Available Section */}
                  <Box
                    p={4}
                    borderRadius="xl"
                    style={{
                      borderRadius: '12px',
                      padding: '4px',
                      border: `2.5px solid ${getStatusConfig('AVAILABLE').color}`,
                      background: 'transparent'
                    }}
                  >
                    <Heading as="h4" size="xs" mb={4} color="gray.600" textTransform="uppercase" letterSpacing="wider">
                      Standard Units
                    </Heading>
                    <BedGridCompact
                      beds={beds}
                      status={BED_STATUS.EMPTY}
                      onBedDrop={handleBedDrop}
                      onBedClick={handleBedClick}
                    />
                  </Box>

                  {/* Occupied Section */}
                  <Box
                    p={4}
                    borderRadius="xl"
                    style={{
                      borderRadius: '12px',
                      padding: '4px',
                      border: `2.5px solid ${getStatusConfig('OCCUPIED').color}`,
                      background: 'transparent'
                    }}
                  >
                    <Heading as="h4" size="xs" mb={4} color="gray.600" textTransform="uppercase" letterSpacing="wider">
                      Active Sessions
                    </Heading>
                    <BedGridCompact
                      beds={beds}
                      status={BED_STATUS.OCCUPIED}
                      onBedDrop={handleBedDrop}
                      onBedClick={handleBedClick}
                    />
                  </Box>

                  {/* Special Management: Isolated & Cleaning */}
                  <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={6}>
                    <Box
                      p={4}
                      borderRadius="xl"
                      style={{
                        borderRadius: '12px',
                        padding: '4px',
                        border: `2.5px solid ${getStatusConfig('QUARANTINE').color}`,
                        background: 'transparent'
                      }}
                    >
                      <Heading as="h4" size="xs" mb={3} color="gray.600">ISO / QUARANTINE</Heading>
                      <BedGridCompact
                        beds={beds}
                        status={BED_STATUS.QUARANTINE}
                        onBedDrop={handleBedDrop}
                        onBedClick={handleBedClick}
                      />
                    </Box>

                    <Box
                      p={4}
                      borderRadius="xl"
                      style={{
                        borderRadius: '12px',
                        padding: '4px',
                        border: `2.5px solid ${getStatusConfig('CLEANING').color}`,
                        background: 'transparent'
                      }}
                    >
                      <Heading as="h4" size="xs" mb={3} color="gray.600">CLEANING COOLDOWN</Heading>
                      <BedGridCompact
                        beds={beds}
                        status={BED_STATUS.CLEANING}
                        onBedDrop={handleBedDrop}
                        onBedClick={handleBedClick}
                      />
                    </Box>
                  </Grid>

                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Grid>
      </VStack>

      {/* Modals & Notifications */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        bed={selectedBed}
        onConfirm={handleAssignmentConfirm}
        isLoading={isAssigning}
      />

      <DialysisParametersModal
        isOpen={isDialysisModalOpen}
        onClose={() => {
          setIsDialysisModalOpen(false);
          setDialysisPatientData({});
          setDialysisBedData({});
          fetchAllBeds(); // final refresh
        }}
        patient={dialysisPatientData}
        bed={dialysisBedData}
        onStageChange={handleDialysisStageChange}
      />

      {notification && (
        <Box className={`notification toast--${notification.status}`} role="alert">
          <VStack align="start" spacing={0}>
            <Text fontWeight="700">{notification.title}</Text>
            <Text fontSize="xs">{notification.description}</Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
}


