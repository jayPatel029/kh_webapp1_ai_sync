/**
 * Dialysis Technician Dashboard – Appointment Booking (local state only)
 *
 * @file src/pages/adminDashboard/components/DialysisAppointmentsDashboard.jsx
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
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
} from '../../../component-library';
import UnifiedListTable from '../../../components/table/UnifiedListTable';
import useDialysisAppointments from '../../../hooks/useDialysisAppointments';
import {
  formatShortDate,
  formatTime,
  formatTimeRange,
  toIsoDay,
  toLocalDateTimeInputValue,
} from '../../../utils/appointmentDateUtils';

const AppointmentBookingModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  suggestedSlot,
  mode = 'create',
}) => {
  const [patientName, setPatientName] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const start = initialData?.start || suggestedSlot?.start || null;
    const end = initialData?.end || suggestedSlot?.end || null;

    setPatientName(initialData?.patientName || '');
    setTitle(initialData?.title || '');
    setNotes(initialData?.notes || '');
    setStartValue(start ? toLocalDateTimeInputValue(start) : '');
    setEndValue(end ? toLocalDateTimeInputValue(end) : '');
    setErrorMessage('');
  }, [isOpen, initialData, suggestedSlot]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!patientName || !title || !startValue || !endValue) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    try {
      await onSubmit({
        patientName: patientName.trim(),
        title: title.trim(),
        notes: notes.trim(),
        start: new Date(startValue),
        end: new Date(endValue),
      });
      onClose();
    } catch (err) {
      setErrorMessage(err?.message || 'Unable to save this appointment.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'edit' ? 'Edit appointment' : 'Book appointment'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="dialysis-appointment-form" onSubmit={handleSubmit}>
            <Flex direction="column" gap={4}>
              <FormControl isRequired isInvalid={!!errorMessage && !patientName}>
                <FormLabel>Patient name</FormLabel>
                <Input
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                  placeholder="Enter patient name"
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!errorMessage && !title}>
                <FormLabel>Appointment title</FormLabel>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Dialysis session"
                />
              </FormControl>

              <Flex gap={4} direction="column" className="md:flex-row">
                <FormControl isRequired isInvalid={!!errorMessage && !startValue}>
                  <FormLabel>Start time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={startValue}
                    onChange={(event) => setStartValue(event.target.value)}
                  />
                </FormControl>
                <FormControl isRequired isInvalid={!!errorMessage && !endValue}>
                  <FormLabel>End time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={endValue}
                    onChange={(event) => setEndValue(event.target.value)}
                  />
                </FormControl>
              </Flex>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes for the dialysis team"
                />
              </FormControl>

              {errorMessage && (
                <FormControl isInvalid>
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                </FormControl>
              )}
            </Flex>
          </form>
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="dialysis-appointment-form" variant="brand">
            {mode === 'edit' ? 'Update appointment' : 'Book appointment'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DialysisAppointmentsDashboard = () => {
  const {
    appointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    generateSlotsForRange,
  } = useDialysisAppointments();

  const today = useMemo(() => new Date(), []);
  const rangeStart = useMemo(() => new Date(today), [today]);
  const rangeEnd = useMemo(() => {
    const end = new Date(today);
    end.setDate(end.getDate() + 6);
    return end;
  }, [today]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [suggestedSlot, setSuggestedSlot] = useState(null);

  const { days, slotsByDay } = useMemo(
    () => generateSlotsForRange(rangeStart, rangeEnd),
    [generateSlotsForRange, rangeStart, rangeEnd]
  );

  const openCreateModal = useCallback(() => {
    setEditingAppointment(null);
    setSuggestedSlot(null);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingAppointment(null);
    setSuggestedSlot(null);
  }, []);

  const openEditModal = useCallback((appointment) => {
    setEditingAppointment(appointment);
    setSuggestedSlot(null);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const handleSlotClick = useCallback((slot) => {
    setSuggestedSlot(slot);
    setEditingAppointment(null);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(
    async (data) => {
      if (modalMode === 'edit' && editingAppointment) {
        await updateAppointment(editingAppointment.id, {
          ...data,
          start: data.start,
          end: data.end,
        });
      } else {
        await createAppointment(data);
      }
    },
    [modalMode, editingAppointment, updateAppointment, createAppointment]
  );

  const handleCancelAppointment = useCallback(
    (appointment) => {
      if (appointment.status === 'cancelled') return;
      const confirmed = window.confirm('Cancel this appointment?');
      if (confirmed) {
        cancelAppointment(appointment.id);
      }
    },
    [cancelAppointment]
  );

  const slotRows = useMemo(() => {
    if (!days.length) return [];
    const firstDayKey = toIsoDay(days[0]);
    const baseSlots = slotsByDay[firstDayKey] || [];
    return baseSlots.map((slot, index) => {
      const row = {
        time: formatTimeRange(slot.start, slot.end),
      };
      days.forEach((day) => {
        const key = toIsoDay(day);
        row[key] = slotsByDay[key]?.[index] || null;
      });
      return row;
    });
  }, [days, slotsByDay]);

  const renderSlotCell = useCallback(
    (slot) => {
      if (!slot) {
        return <Text size="xs" className="text-muted">—</Text>;
      }

      if (slot.appointment) {
        const appointment = slot.appointment;
        const startsHere = appointment.start.getTime() === slot.start.getTime();
        return (
          <Box className="flex flex-col gap-1">
            <Flex align="center" gap={2}>
              <StatusBadge status={appointment.status === 'cancelled' ? 'inactive' : 'active'}>
                {appointment.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
              </StatusBadge>
              <Text size="xs" className="text-muted">
                {formatTime(appointment.start)} - {formatTime(appointment.end)}
              </Text>
            </Flex>
            <Text size="sm" weight="semibold">
              {startsHere ? appointment.title : 'In progress'}
            </Text>
            {startsHere && (
              <Text size="xs" className="text-muted">
                {appointment.patientName}
              </Text>
            )}
          </Box>
        );
      }

      if (slot.available) {
        return (
          <Button size="xs" variant="outline" onClick={() => handleSlotClick(slot)}>
            Book
          </Button>
        );
      }

      return <Badge variant="outline" colorScheme="gray">Unavailable</Badge>;
    },
    [handleSlotClick]
  );

  const slotColumns = useMemo(() => {
    const dayColumns = days.map((day) => {
      const key = toIsoDay(day);
      return {
        key,
        label: formatShortDate(day),
        type: 'custom',
        minWidth: '170px',
        sortable: false,
        render: (_, value) => renderSlotCell(value),
      };
    });

    return [
      {
        key: 'time',
        label: 'Time',
        type: 'text',
        width: '140px',
        sortable: false,
      },
      ...dayColumns,
    ];
  }, [days, renderSlotCell]);

  const appointmentColumns = useMemo(
    () => [
      // TODO: Adjust columns per final product requirements
      { key: 'patientName', label: 'Patient', type: 'text', minWidth: '160px', sortable: false },
      { key: 'title', label: 'Appointment', type: 'text', minWidth: '200px', sortable: false },
      { key: 'date', label: 'Date', type: 'date', width: '140px', sortable: false },
      { key: 'time', label: 'Time', type: 'text', width: '160px', sortable: false },
      { key: 'status', label: 'Status', type: 'custom', width: '140px', sortable: false, render: (_, value) => (
        <StatusBadge status={value === 'cancelled' ? 'inactive' : 'active'}>
          {value === 'cancelled' ? 'Cancelled' : 'Scheduled'}
        </StatusBadge>
      ) },
      { key: 'actions', label: 'Actions', type: 'actions', width: '120px', sortable: false },
    ],
    []
  );

  const appointmentRows = useMemo(
    () =>
      appointments.map((appt) => ({
        ...appt,
        date: appt.start,
        time: formatTimeRange(appt.start, appt.end),
      })),
    [appointments]
  );

  return (
    <Box className="flex flex-col gap-6">
      <Flex justify="between" align="center" className="flex-wrap gap-4">
        <Box>
          <Heading as="h2" size="lg">Dialysis Technician Dashboard</Heading>
          <Text size="sm" className="text-muted">
            Manage dialysis appointment bookings for the week.
          </Text>
        </Box>
        <Button variant="brand" onClick={openCreateModal}>
          Book Appointment
        </Button>
      </Flex>

      <Box className="bg-white shadow-md border-t-4 border-primary rounded-xl p-5">
        <Flex justify="between" align="center" className="mb-4 flex-wrap gap-3">
          <Heading as="h3" size="md">Booking schedule</Heading>
          <Badge variant="outline" colorScheme="primary">
            {formatShortDate(rangeStart)} - {formatShortDate(rangeEnd)}
          </Badge>
        </Flex>
        <UnifiedListTable
          columns={slotColumns}
          data={slotRows}
          enablePagination={false}
          enableSearch={false}
          actionButtons={false}
          displayMode="table"
          emptyMessage="No available slots for this range."
        />
      </Box>

      <Box className="bg-white shadow-md border-t-4 border-primary rounded-xl p-5">
        <Flex justify="between" align="center" className="mb-4 flex-wrap gap-3">
          <Heading as="h3" size="md">Upcoming appointments</Heading>
          <Text size="sm" className="text-muted">
            {appointments.length} total
          </Text>
        </Flex>
        <UnifiedListTable
          columns={appointmentColumns}
          data={appointmentRows}
          enablePagination={true}
          rowsPerPage={10}
          rowsPerPageOptions={[10, 25, 50]}
          onEdit={openEditModal}
          onDelete={handleCancelAppointment}
          emptyMessage="No appointments booked yet."
        />
      </Box>

      <AppointmentBookingModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editingAppointment}
        suggestedSlot={suggestedSlot}
        mode={modalMode}
      />
    </Box>
  );
};

export default DialysisAppointmentsDashboard;