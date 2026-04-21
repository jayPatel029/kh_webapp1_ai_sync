import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  StatusBadge,
} from '../../../component-library';
import UnifiedListTable from '../../../components/table/UnifiedListTable';
import useDialysisAppointments from '../../../hooks/useDialysisAppointments';
import { formatTimeRange } from '../../../utils/appointmentDateUtils';

const UpcomingAppointmentsPanel = ({ rowsPerPage = 10 }) => {
  const { appointments, cancelAppointment } = useDialysisAppointments();

  const arrivedAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'arrived'),
    [appointments]
  );

  const appointmentRows = useMemo(
    () =>
      arrivedAppointments.map((appt) => ({
        ...appt,
        date: appt.start,
        time: formatTimeRange(appt.start, appt.end),
      })),
    [arrivedAppointments]
  );

  const appointmentColumns = useMemo(
    () => [
      { key: 'patientName', label: 'Patient', type: 'text', minWidth: '160px', sortable: false },
      { key: 'title', label: 'Appointment', type: 'text', minWidth: '200px', sortable: false },
      { key: 'date', label: 'Date', type: 'date', width: '140px', sortable: false },
      { key: 'time', label: 'Time', type: 'text', width: '160px', sortable: false },
      {
        key: 'status', label: 'Status', type: 'custom', width: '140px', sortable: false, render: (row) => {
          const v = row?.status;
          const label = v ? String(v).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '-';
          return (
            <StatusBadge status={v === 'cancelled' ? 'inactive' : 'active'}>
              {label}
            </StatusBadge>
          );
        }
      },
      { key: 'actions', label: 'Actions', type: 'actions', width: '120px', sortable: false },
    ],
    []
  );

  const handleDragStart = useCallback((e, appt) => {
    const dragPayload = {
      patient_id: appt.patient_id || appt.id,
      appointment_id: appt.id,
      patient_name: appt.patientName || appt.patient_name,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleCancelAppointment = useCallback(
    (appointment) => {
      if (appointment.status === 'cancelled') return;
      const confirmed = window.confirm('Cancel this appointment?');
      if (confirmed) cancelAppointment(appointment.id);
    },
    [cancelAppointment]
  );

  return (
    <Box className="bg-white shadow-md border-t-4 border-primary rounded-xl p-5">
      <Flex justify="between" align="center" className="mb-4 flex-wrap gap-3">
        <Heading as="h3" size="md">Upcoming appointments</Heading>
        <Text size="sm" className="text-muted">
          {arrivedAppointments.length} total (Drag to assign bed)
        </Text>
      </Flex>

      <UnifiedListTable
        columns={appointmentColumns}
        data={appointmentRows}
        enablePagination={true}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onDelete={handleCancelAppointment}
        emptyMessage="No arrived appointments available."
        rowProps={(row) => ({
          draggable: true,
          onDragStart: (e) => handleDragStart(e, row),
          className: 'list-table__row--draggable',
        })}
      />
    </Box>
  );
};

export default UpcomingAppointmentsPanel;
