/**
 * Dialysis Appointments Page
 * Modeled after the Appointments Queue page from the reference.
 *
 * Available to: Manager, Technician, Frontdesk
 *
 * API Integration:
 *  - GET  /appointments              → getAppointments()
 *  - POST /appointments              → createAppointment()
 *  - PUT  /appointments/:id          → updateAppointment()
 *  - DELETE /appointments/:id        → deleteAppointment()
 *
 * @file src/pages/dialysis/DialysisAppointments.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Textarea,
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../../ApiCalls/clinicApis';

// ─── Status colors (appointment) ───────────────────────────
const STATUS_COLORS = {
  SCHEDULED: { bg: '#FEF9C3', text: '#854D0E' },
  BOOKED: { bg: '#FEF9C3', text: '#854D0E' },
  ARRIVED: { bg: '#F3E8FF', text: '#6B21A8' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED: { bg: '#DCFCE7', text: '#166534' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
  MISSED: { bg: '#FEE2E2', text: '#991B1B' },
};

const getStatusStyle = (status) => {
  const s = String(status || '').toUpperCase().replace(/\s+/g, '_');
  return STATUS_COLORS[s] || { bg: '#FED7AA', text: '#9A3412' };
};

/**
 * Normalize an appointment row from the backend into the shape the table expects.
 * The backend may return differently-cased fields; we handle both.
 */
const normalizeAppointment = (apt) => ({
  id: apt.id,
  created_date: apt.appointment_date
    ? formatDateDisplay(apt.appointment_date)
    : '—',
  name:
    apt.patient_name ||
    apt.patientName ||
    (apt.patient_id ? `Patient #${apt.patient_id}` : '—'),
  doctor_name:
    apt.doctor_name ||
    apt.doctorName ||
    apt.primary_doctor_name ||
    (apt.primary_doctor_id ? `Doctor #${apt.primary_doctor_id}` : '—'),
  age: apt.age || apt.patient_age || '—',
  gender: apt.gender || apt.patient_gender || '—',
  phoneNumber:
    apt.phoneNumber ||
    apt.phone_number ||
    apt.patient_phone ||
    apt.phone ||
    '—',
  treatment_type: normalizeType(apt.appointment_type || apt.treatment_type),
  booking_time: apt.start_time
    ? formatTime12Hour(apt.start_time)
    : '—',
  status: String(apt.status || 'SCHEDULED').toUpperCase(),
  reason: apt.reason || '',
  patient_ailments: apt.patient_ailments || '',
  // Keep raw fields for editing
  _raw: apt,
});

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch {
    return dateStr;
  }
}

function formatTime12Hour(timeStr) {
  if (!timeStr) return '—';
  try {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function normalizeType(type) {
  if (!type) return 'In Clinic';
  const lower = String(type).toLowerCase().replace(/[_-]/g, ' ');
  if (lower.includes('online')) return 'Online';
  return 'In Clinic';
}

const DialysisAppointments = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  // ─── Data state ────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Filter state ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  // ─── Create modal state ────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    patient_id: '',
    clinic_id: '',
    appointment_date: today,
    start_time: '',
    end_time: '',
    appointment_type: 'in_clinic',
    reason: '',
    patient_ailments: '',
  });
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch appointments ────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointments();
      if (result.success) {
        const rows = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
          ? result.data
          : [];
        setAppointments(rows.map(normalizeAppointment));
      } else {
        const msg =
          result.data?.message || 'Failed to load appointments';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      const msg = err?.message || 'Network error loading appointments';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ─── Filtered list ─────────────────────────────────────
  const filtered = useMemo(() => {
    let list = appointments;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.phoneNumber.includes(q) ||
          a.doctor_name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [appointments, searchQuery]);

  // ─── Stats ─────────────────────────────────────────────
  const total = filtered.length;
  const pending = filtered.filter((a) =>
    ['BOOKED', 'ARRIVED', 'SCHEDULED'].includes(a.status)
  ).length;
  const completed = filtered.filter((a) => a.status === 'COMPLETED').length;

  // ─── Status update handler ─────────────────────────────
  const handleStatusUpdate = useCallback(
    async (apt, newStatus) => {
      if (
        !window.confirm(
          `Update status of appointment #${apt.id} to "${newStatus}"?`
        )
      )
        return;

      const result = await updateAppointment(apt.id, {
        status: newStatus,
      });
      if (result.success) {
        showToast(`Appointment #${apt.id} updated to ${newStatus}`, 'success');
        fetchAppointments();
      } else {
        showToast(
          result.data?.message || 'Failed to update appointment',
          'error'
        );
      }
    },
    [fetchAppointments, showToast]
  );

  // ─── Cancel handler ────────────────────────────────────
  const handleCancel = useCallback(
    async (apt) => {
      const reason = window.prompt('Cancellation reason (required):');
      if (!reason || !reason.trim()) return;

      const result = await deleteAppointment(apt.id);
      if (result.success) {
        showToast(`Appointment #${apt.id} cancelled`, 'success');
        fetchAppointments();
      } else {
        showToast(
          result.data?.message || 'Failed to cancel appointment',
          'error'
        );
      }
    },
    [fetchAppointments, showToast]
  );

  // ─── Create handler ────────────────────────────────────
  const handleCreate = async () => {
    const errors = {};
    if (!createForm.patient_id) errors.patient_id = 'Patient ID is required';
    if (!createForm.clinic_id) errors.clinic_id = 'Clinic ID is required';
    if (!createForm.appointment_date)
      errors.appointment_date = 'Date is required';

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      setCreateErrorMessage('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    const result = await createAppointment({
      patient_id: Number(createForm.patient_id),
      clinic_id: Number(createForm.clinic_id),
      appointment_date: createForm.appointment_date,
      start_time: createForm.start_time || undefined,
      end_time: createForm.end_time || undefined,
      appointment_type: createForm.appointment_type || undefined,
      reason: createForm.reason || undefined,
      patient_ailments: createForm.patient_ailments || undefined,
    });
    setSubmitting(false);

    if (result.success) {
      showToast('Appointment created successfully!', 'success');
      setIsCreateOpen(false);
      setCreateForm({
        patient_id: '',
        clinic_id: '',
        appointment_date: today,
        start_time: '',
        end_time: '',
        appointment_type: 'in_clinic',
        reason: '',
        patient_ailments: '',
      });
      fetchAppointments();
    } else {
      showToast(
        result.data?.message || 'Failed to create appointment',
        'error'
      );
    }
  };

  // ─── Columns ───────────────────────────────────────────
  const columns = [
    { key: 'created_date', label: 'Date', type: 'text', width: '110px' },
    { key: 'name', label: 'Patient', type: 'text', width: '160px' },
    { key: 'doctor_name', label: 'Doctor', type: 'text', width: '140px' },
    { key: 'age', label: 'Age', type: 'text', width: '60px' },
    { key: 'gender', label: 'Sex', type: 'text', width: '70px' },
    { key: 'phoneNumber', label: 'Mobile No.', type: 'text', width: '130px' },
    {
      key: 'treatment_type',
      label: 'Type',
      type: 'text',
      width: '100px',
    },
    { key: 'booking_time', label: 'Time', type: 'text', width: '100px' },
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      width: '130px',
      render: (_row, value) => {
        const style = getStatusStyle(value);
        return (
          <span
            style={{
              backgroundColor: style.bg,
              color: style.text,
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {String(value || '').replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'custom',
      width: '180px',
      render: (row) => {
        const st = row.status;
        const canAdvance = ['BOOKED', 'SCHEDULED'].includes(st);
        const canCancel = !['COMPLETED', 'CANCELLED'].includes(st);

        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            {canAdvance && (
              <button
                onClick={() => handleStatusUpdate(row, 'ARRIVED')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  background: '#DBEAFE',
                  color: '#1E40AF',
                  cursor: 'pointer',
                }}
              >
                Mark Arrived
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => handleCancel(row)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  background: '#FEE2E2',
                  color: '#991B1B',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Appointments"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Appointments', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          {/* Filter + Stats Bar */}
          <div
            className="admin-card"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Input
                type="text"
                placeholder="Search patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '200px' }}
              />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '150px' }}
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '150px' }}
              />
              <Button
                variant="primary"
                onClick={() => {
                  setCreateForm((prev) => ({
                    ...prev,
                    appointment_date: today,
                  }));
                  setCreateFieldErrors({});
                  setCreateErrorMessage('');
                  setIsCreateOpen(true);
                }}
              >
                + New Appointment
              </Button>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>
                Total: <strong>{total}</strong>
              </span>
              <span style={{ fontSize: '14px', color: '#EA580C' }}>
                Pending: <strong>{pending}</strong>
              </span>
              <span style={{ fontSize: '14px', color: '#16A34A' }}>
                Completed: <strong>{completed}</strong>
              </span>
            </div>
          </div>

          {/* Loading / Error / Table */}
          <div className="admin-card">
            {loading ? (
              <div
                className="flex items-center justify-center"
                style={{ minHeight: '200px' }}
              >
                <p style={{ color: '#6B7280' }}>Loading appointments…</p>
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: '200px', gap: '12px' }}
              >
                <p style={{ color: '#DC2626' }}>{error}</p>
                <Button variant="outline" onClick={fetchAppointments}>
                  Retry
                </Button>
              </div>
            ) : (
              <UnifiedListTable
                columns={columns}
                data={filtered}
                emptyMessage="No dialysis appointments found"
                displayMode="table"
                rowsPerPage={10}
              />
            )}
          </div>
        </div>

        {/* ─── Create Appointment Modal ───────────────── */}
        <FormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          title="New Appointment"
          submitText={submitting ? 'Creating…' : 'Create'}
          size="lg"
          errorMessage={createErrorMessage}
          fieldErrors={createFieldErrors}
          onFieldErrorClear={(field) =>
            setCreateFieldErrors((prev) => ({ ...prev, [field]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl
                  isRequired
                  isInvalid={getFieldProps('patient_id').isInvalid}
                >
                  <FormLabel>Patient ID</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter patient ID"
                    value={createForm.patient_id}
                    {...getFieldProps('patient_id')}
                    onChange={(e) => {
                      setCreateForm((prev) => ({
                        ...prev,
                        patient_id: e.target.value,
                      }));
                      clearFieldError('patient_id');
                    }}
                  />
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={getFieldProps('clinic_id').isInvalid}
                >
                  <FormLabel>Clinic ID</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter clinic ID"
                    value={createForm.clinic_id}
                    {...getFieldProps('clinic_id')}
                    onChange={(e) => {
                      setCreateForm((prev) => ({
                        ...prev,
                        clinic_id: e.target.value,
                      }));
                      clearFieldError('clinic_id');
                    }}
                  />
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={getFieldProps('appointment_date').isInvalid}
                >
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={createForm.appointment_date}
                    {...getFieldProps('appointment_date')}
                    onChange={(e) => {
                      setCreateForm((prev) => ({
                        ...prev,
                        appointment_date: e.target.value,
                      }));
                      clearFieldError('appointment_date');
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    value={createForm.start_time}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        start_time: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    value={createForm.end_time}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        end_time: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <select
                    value={createForm.appointment_type}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        appointment_type: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                    }}
                  >
                    <option value="in_clinic">In Clinic</option>
                    <option value="online">Online</option>
                  </select>
                </FormControl>
              </Box>

              <FormControl className="mt-4">
                <FormLabel>Reason</FormLabel>
                <Textarea
                  placeholder="Reason for appointment"
                  value={createForm.reason}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </FormControl>

              <FormControl className="mt-4">
                <FormLabel>Patient Ailments</FormLabel>
                <Textarea
                  placeholder="Known ailments"
                  value={createForm.patient_ailments}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      patient_ailments: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </FormControl>
            </>
          )}
        </FormModal>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisAppointments;
