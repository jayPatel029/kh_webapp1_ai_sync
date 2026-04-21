/**
 * Dialysis Appointments Page
 * Includes offline booking, payment recording (full/partial), refunds, and invoice previews.
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
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import PaymentModal from '../../components/PaymentModal';
import RefundModal from '../../components/RefundModal';
import InvoicePreview from '../../components/InvoicePreview';
import usePaymentFlow from '../../hooks/usePaymentFlow';
import { getPaymentStatus } from '../../utils/refundCalculator';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../../ApiCalls/clinicApis';

// ─── Status colors ──────────────────────────────────────────
const STATUS_COLORS = {
  SCHEDULED:   { bg: '#FEF9C3', text: '#854D0E' },
  BOOKED:      { bg: '#FEF9C3', text: '#854D0E' },
  ARRIVED:     { bg: '#F3E8FF', text: '#6B21A8' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED:   { bg: '#DCFCE7', text: '#166534' },
  CANCELLED:   { bg: '#F3F4F6', text: '#6B7280' },
  MISSED:      { bg: '#FEE2E2', text: '#991B1B' },
};

const getStatusStyle = (status) => {
  const s = String(status || '').toUpperCase().replace(/\s+/g, '_');
  return STATUS_COLORS[s] || { bg: '#FED7AA', text: '#9A3412' };
};

/** Normalize backend row → table row */
const normalizeAppointment = (apt) => ({
  id: apt.id,
  created_date: apt.appointment_date ? formatDateDisplay(apt.appointment_date) : '—',
  appointment_date: apt.appointment_date,
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
    apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || '—',
  treatment_type: normalizeType(apt.appointment_type || apt.treatment_type),
  booking_time: apt.start_time ? formatTime12Hour(apt.start_time) : '—',
  status: String(apt.status || 'SCHEDULED').toUpperCase(),
  reason: apt.reason || '',
  patient_ailments: apt.patient_ailments || '',
  patient_id: apt.patient_id,
  // Billing fields (client-side)
  totalAmount: apt.totalAmount || apt.total_amt || 0,
  amountPaid: apt.amountPaid || apt.received_amt || 0,
  paymentMethod: apt.paymentMethod || '',
  billPDFUrl: apt.billPDFUrl || null,
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
  } catch { return dateStr; }
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
  } catch { return timeStr; }
}

function normalizeType(type) {
  if (!type) return 'In Clinic';
  const lower = String(type).toLowerCase().replace(/[_-]/g, ' ');
  if (lower.includes('online')) return 'Online';
  return 'In Clinic';
}

// ─── Action Button ──────────────────────────────────────────
const ActionBtn = ({ label, bg, color, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '4px 9px',
      fontSize: '11px',
      fontWeight: 600,
      border: 'none',
      borderRadius: '6px',
      background: disabled ? '#F3F4F6' : bg,
      color: disabled ? '#9CA3AF' : color,
      cursor: disabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      transition: 'opacity 0.15s',
    }}
  >
    {label}
  </button>
);

// ═══════════════════════════════════════════════════════════
const DialysisAppointments = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  // ─── Data state ───────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ─── Filter state ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate]     = useState(today);

  // ─── Create modal state ───────────────────────────────
  const [isCreateOpen, setIsCreateOpen]       = useState(false);
  const [createStep, setCreateStep]           = useState(1);
  const [slots, setSlots]                     = useState([]);
  const [createForm, setCreateForm]           = useState({
    patient_id:       '',
    clinic_id:        '',
    appointment_date: today,
    start_time:       '',
    end_time:         '',
    appointment_type: 'in_clinic',
    reason:           '',
    patient_ailments: '',
    total_amount:     '',
    payment_option:   'full',
    payment_method:   'cash',
    amount_paid:      '',
    receipt_file:     null,
  });
  const [createFieldErrors, setCreateFieldErrors]   = useState({});
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [submitting, setSubmitting]                  = useState(false);

  // ─── Invoice preview state ────────────────────────────
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  // ─── Fetch appointments ───────────────────────────────
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
        const msg = result.data?.message || 'Failed to load appointments';
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

  // ─── Mock Fetch Slots ────────────────────────────────
  useEffect(() => {
    if (createForm.clinic_id && createForm.appointment_date) {
      // Mocking clinic active slots
      setSlots(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM']);
    } else {
      setSlots([]);
    }
  }, [createForm.clinic_id, createForm.appointment_date]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ─── Payment flow hook ────────────────────────────────
  const {
    paymentModal,
    openPaymentModal,
    closePaymentModal,
    updatePaymentField,
    submitPayment,
    refundModal,
    openRefundModal,
    closeRefundModal,
    processRefund,
    downloadInvoicePDF,
    pdfLoading,
  } = usePaymentFlow({
    onPaymentAdded: (apptId, amount, method, billPDFUrl) => {
      // Update local state to reflect new payment
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === apptId
            ? {
                ...a,
                amountPaid: (Number(a.amountPaid) + Number(amount)),
                paymentMethod: method,
                billPDFUrl: billPDFUrl || a.billPDFUrl,
              }
            : a
        )
      );
      showToast(`Payment of ₹${amount} recorded successfully`, 'success');
    },
    onRefundProcessed: async (apptId, refundAmount, refundPDFUrl) => {
      // Delete from backend then refresh
      const result = await deleteAppointment(apptId);
      if (result.success) {
        showToast(
          `Appointment cancelled. Refund of ₹${refundAmount} processed.`,
          'success'
        );
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to cancel appointment', 'error');
      }
    },
  });

  // ─── Filtered list ────────────────────────────────────
  const filtered = useMemo(() => {
    let list = appointments;
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
  const total     = filtered.length;
  const pending   = filtered.filter((a) => ['BOOKED', 'ARRIVED', 'SCHEDULED'].includes(a.status)).length;
  const completed = filtered.filter((a) => a.status === 'COMPLETED').length;
  const unpaidCount = filtered.filter((a) =>
    getPaymentStatus(a.totalAmount, a.amountPaid) !== 'PAID'
  ).length;

  // ─── Status update ────────────────────────────────────
  const handleStatusUpdate = useCallback(
    async (apt, newStatus) => {
      if (!window.confirm(`Update appointment #${apt.id} to "${newStatus}"?`)) return;
      const result = await updateAppointment(apt.id, { status: newStatus });
      if (result.success) {
        showToast(`Appointment #${apt.id} → ${newStatus}`, 'success');
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to update', 'error');
      }
    },
    [fetchAppointments, showToast]
  );

  // ─── Simple cancel (no refund) ────────────────────────
  const handleSimpleCancel = useCallback(
    async (apt) => {
      const reason = window.prompt('Cancellation reason (required):');
      if (!reason || !reason.trim()) return;
      const result = await deleteAppointment(apt.id);
      if (result.success) {
        showToast(`Appointment #${apt.id} cancelled`, 'success');
        fetchAppointments();
      } else {
        showToast(result.data?.message || 'Failed to cancel', 'error');
      }
    },
    [fetchAppointments, showToast]
  );

  // ─── Create handler ───────────────────────────────────
  const handleNextStep1 = () => {
    const errors = {};
    if (!createForm.patient_id)       errors.patient_id = 'Patient ID is required';
    if (!createForm.clinic_id)        errors.clinic_id = 'Clinic ID is required';
    if (!createForm.appointment_date) errors.appointment_date = 'Date is required';
    if (!createForm.start_time)       errors.start_time = 'Slot is required';
    if (!createForm.total_amount)     errors.total_amount = 'Bill Amount is required';

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      setCreateErrorMessage('Please fill all required fields in Step 1');
      return;
    }
    setCreateFieldErrors({});
    setCreateErrorMessage('');
    
    // Default full payment logic for Next step
    let initialPaid = createForm.amount_paid;
    if (createForm.payment_option === 'full') {
      initialPaid = createForm.total_amount;
    }
    setCreateForm(prev => ({ ...prev, amount_paid: initialPaid }));
    
    setCreateStep(2);
  };

  const handleCreate = async () => {
    if (createStep === 1) {
      handleNextStep1();
      return;
    }

    setSubmitting(true);
    // Submit bill & appointment
    // Assume end_time is calculated or optional
    const start_time_24 = createForm.start_time.includes('PM') && !createForm.start_time.startsWith('12') 
        ? `${parseInt(createForm.start_time.split(':')[0]) + 12}:${createForm.start_time.split(':')[1].replace(' PM','')}`
        : createForm.start_time.replace(/( AM| PM)/, '');

    const result = await createAppointment({
      patient_id:       Number(createForm.patient_id),
      clinic_id:        Number(createForm.clinic_id),
      appointment_date: createForm.appointment_date,
      start_time:       start_time_24,
      appointment_type: createForm.appointment_type || undefined,
      reason:           createForm.reason     || undefined,
      patient_ailments: createForm.patient_ailments || undefined,
      total_amount:     Number(createForm.total_amount) || 0,
      amount_paid:      Number(createForm.amount_paid) || 0,
      payment_method:   createForm.payment_method,
    });
    setSubmitting(false);

    if (result.success) {
      showToast('Appointment and Bill saved successfully!', 'success');
      
      const newAppt = result.data?.data || result.data || {
        id: Math.random().toString(36).substring(7), // fallback ID if missing
        patient_id: createForm.patient_id,
        appointment_date: createForm.appointment_date,
        totalAmount: createForm.total_amount,
        amountPaid: createForm.amount_paid,
        paymentMethod: createForm.payment_method,
      };

      setIsCreateOpen(false);
      setCreateStep(1);
      setCreateForm({
        patient_id: '', clinic_id: '', appointment_date: today,
        start_time: '', end_time: '', appointment_type: 'in_clinic',
        reason: '', patient_ailments: '', total_amount: '',
        payment_option: 'full', payment_method: 'cash', 
        amount_paid: '', receipt_file: null,
      });
      fetchAppointments();
      
      // Step 3 automatically opening the saved bill / invoice PDF
      setInvoiceTarget(normalizeAppointment(newAppt));
    } else {
      showToast(result.data?.message || 'Failed to create appointment', 'error');
    }
  };

  // ─── Columns ──────────────────────────────────────────
  const columns = [
    { key: 'created_date',    label: 'Date',      type: 'text', width: '110px' },
    { key: 'name',            label: 'Patient',   type: 'text', width: '150px' },
    { key: 'doctor_name',     label: 'Doctor',    type: 'text', width: '130px' },
    { key: 'age',             label: 'Age',       type: 'text', width: '55px'  },
    { key: 'phoneNumber',     label: 'Mobile',    type: 'text', width: '120px' },
    { key: 'treatment_type',  label: 'Type',      type: 'text', width: '90px'  },
    { key: 'booking_time',    label: 'Time',      type: 'text', width: '95px'  },
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      width: '140px',
      render: (row, value) => {
        const payStatus = getPaymentStatus(row.totalAmount, row.amountPaid);
        return (
          <AppointmentStatusBadge
            status={value}
            paymentStatus={payStatus}
            showBoth={row.totalAmount > 0}
          />
        );
      },
    },
    {
      key: 'amountPaid',
      label: 'Billing',
      type: 'custom',
      width: '110px',
      render: (row) => {
        const paid  = Number(row.amountPaid || 0);
        const total = Number(row.totalAmount || 0);
        const payStatus = getPaymentStatus(total, paid);
        const color = payStatus === 'PAID' ? '#16A34A' : payStatus === 'PARTIAL' ? '#D97706' : '#DC2626';
        return (
          <span style={{ fontSize: '13px', fontWeight: 600, color }}>
            {total > 0 ? `₹${paid} / ₹${total}` : paid > 0 ? `₹${paid}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'custom',
      width: '240px',
      render: (row) => {
        const st         = row.status;
        const canAdvance = ['BOOKED', 'SCHEDULED'].includes(st);
        const canCancel  = !['COMPLETED', 'CANCELLED'].includes(st);
        const hasPayment = Number(row.amountPaid || 0) > 0;
        const payStatus  = getPaymentStatus(row.totalAmount, row.amountPaid);
        const needsPayment = st !== 'CANCELLED' && payStatus !== 'PAID';

        return (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {canAdvance && (
              <ActionBtn
                label="✓ Arrived"
                bg="#DBEAFE"
                color="#1E40AF"
                onClick={() => handleStatusUpdate(row, 'ARRIVED')}
              />
            )}

            {needsPayment && (
              <ActionBtn
                label="₹ Pay"
                bg="#D1FAE5"
                color="#065F46"
                onClick={() => openPaymentModal(row)}
              />
            )}

            <ActionBtn
              label="🧾 Invoice"
              bg="#EFF6FF"
              color="#1D4ED8"
              onClick={() => setInvoiceTarget(row)}
            />

            {canCancel && (
              <ActionBtn
                label={hasPayment ? '↩ Refund' : '✕ Cancel'}
                bg="#FEE2E2"
                color="#991B1B"
                onClick={() =>
                  hasPayment ? openRefundModal(row, 'full') : handleSimpleCancel(row)
                }
              />
            )}
          </div>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────
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
          {/* ─── Filter + Stats Bar ─── */}
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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                type="text"
                placeholder="Search patient…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '190px' }}
              />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '145px' }}
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '145px' }}
              />
              <Button
                variant="primary"
                onClick={() => {
                  setCreateStep(1);
                  setCreateForm((prev) => ({ 
                      ...prev, 
                      appointment_date: today,
                      payment_option: 'full',
                      receipt_file: null,
                  }));
                  setCreateFieldErrors({});
                  setCreateErrorMessage('');
                  setIsCreateOpen(true);
                }}
              >
                + New Appointment
              </Button>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px' }}>
                Total: <strong>{total}</strong>
              </span>
              <span style={{ fontSize: '13px', color: '#EA580C' }}>
                Pending: <strong>{pending}</strong>
              </span>
              <span style={{ fontSize: '13px', color: '#16A34A' }}>
                Completed: <strong>{completed}</strong>
              </span>
              {unpaidCount > 0 && (
                <span style={{ fontSize: '13px', color: '#DC2626' }}>
                  Unpaid/Partial: <strong>{unpaidCount}</strong>
                </span>
              )}
            </div>
          </div>

          {/* ─── Table ─── */}
          <div className="admin-card">
            {loading ? (
              <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                <p style={{ color: '#6B7280' }}>Loading appointments…</p>
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: '200px', gap: '12px' }}
              >
                <p style={{ color: '#DC2626' }}>{error}</p>
                <Button variant="outline" onClick={fetchAppointments}>Retry</Button>
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

        {/* ─── Create Appointment Modal ─── */}
        <FormModal
          isOpen={isCreateOpen}
          onClose={() => { setIsCreateOpen(false); setCreateStep(1); }}
          onSubmit={handleCreate}
          title={createStep === 1 ? "New Appointment (1/2)" : "Billing Details (2/2)"}
          submitText={createStep === 1 ? 'Next' : (submitting ? 'Saving...' : 'Save Bill')}
          size="lg"
          errorMessage={createErrorMessage}
          fieldErrors={createFieldErrors}
          onFieldErrorClear={(field) =>
            setCreateFieldErrors((prev) => ({ ...prev, [field]: undefined }))
          }
        >
          {({ getFieldProps, clearFieldError }) => (
            <>
              {createStep === 1 && (
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient ID */}
                  <FormControl isRequired isInvalid={getFieldProps('patient_id').isInvalid}>
                    <FormLabel>Patient ID</FormLabel>
                    <Input
                      type="number"
                      placeholder="Patient ID (auto-fetched or enter)"
                      value={createForm.patient_id}
                      {...getFieldProps('patient_id')}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, patient_id: e.target.value }));
                        clearFieldError('patient_id');
                      }}
                    />
                  </FormControl>

                  {/* Clinic ID */}
                  <FormControl isRequired isInvalid={getFieldProps('clinic_id').isInvalid}>
                    <FormLabel>Clinic ID</FormLabel>
                    <Input
                      type="number"
                      placeholder="Clinic ID"
                      value={createForm.clinic_id}
                      {...getFieldProps('clinic_id')}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, clinic_id: e.target.value }));
                        clearFieldError('clinic_id');
                      }}
                    />
                  </FormControl>

                  {/* Date */}
                  <FormControl isRequired isInvalid={getFieldProps('appointment_date').isInvalid}>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={createForm.appointment_date}
                      {...getFieldProps('appointment_date')}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, appointment_date: e.target.value }));
                        clearFieldError('appointment_date');
                      }}
                    />
                  </FormControl>

                  {/* Slot (Start Time) */}
                  <FormControl isRequired isInvalid={getFieldProps('start_time').isInvalid}>
                    <FormLabel>Available Slots</FormLabel>
                    <select
                      value={createForm.start_time}
                      {...getFieldProps('start_time')}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, start_time: e.target.value }));
                        clearFieldError('start_time');
                      }}
                      style={{
                        width: '100%', padding: '8px 12px',
                        borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px',
                      }}
                    >
                      <option value="">{slots.length ? 'Select a slot' : 'No slots available'}</option>
                      {slots.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </FormControl>

                  {/* Type */}
                  <FormControl>
                    <FormLabel>Appointment Type</FormLabel>
                    <select
                      value={createForm.appointment_type}
                      onChange={(e) => setCreateForm((p) => ({ ...p, appointment_type: e.target.value }))}
                      style={{
                        width: '100%', padding: '8px 12px',
                        borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px',
                      }}
                    >
                      <option value="in_clinic">In Clinic</option>
                    </select>
                  </FormControl>

                  {/* Total Amount */}
                  <FormControl isRequired isInvalid={getFieldProps('total_amount').isInvalid}>
                    <FormLabel>Total Bill Amount (₹)</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g. 3500"
                      value={createForm.total_amount}
                      {...getFieldProps('total_amount')}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, total_amount: e.target.value }));
                        clearFieldError('total_amount');
                      }}
                    />
                  </FormControl>
                  
                  <Box className="md:col-span-2">
                    <FormControl className="mt-2">
                      <FormLabel>Reason & Services</FormLabel>
                      <Textarea
                        placeholder="Reason for appointment / Services"
                        value={createForm.reason}
                        onChange={(e) => setCreateForm((p) => ({ ...p, reason: e.target.value }))}
                        rows={2}
                      />
                    </FormControl>

                    <FormControl className="mt-4">
                      <FormLabel>Patient Ailments</FormLabel>
                      <Textarea
                        placeholder="Known ailments"
                        value={createForm.patient_ailments}
                        onChange={(e) => setCreateForm((p) => ({ ...p, patient_ailments: e.target.value }))}
                        rows={2}
                      />
                    </FormControl>
                  </Box>
                </Box>
              )}

              {createStep === 2 && (
                <Box className="flex flex-col gap-6">
                  <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Billing Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span>Patient ID:</span> <strong>{createForm.patient_id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '4px' }}>
                      <span>Total Amount:</span> <strong style={{ color: '#111827', fontSize: '16px' }}>₹{createForm.total_amount}</strong>
                    </div>
                  </div>

                  {/* Payment Option */}
                  <FormControl>
                    <FormLabel>Payment Selection</FormLabel>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="radio"
                          name="payment_option"
                          value="full"
                          checked={createForm.payment_option === 'full'}
                          onChange={() => setCreateForm(p => ({ ...p, payment_option: 'full', amount_paid: p.total_amount }))}
                        />
                        Full Payment
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="radio"
                          name="payment_option"
                          value="partial"
                          checked={createForm.payment_option === 'partial'}
                          onChange={() => setCreateForm(p => ({ ...p, payment_option: 'partial', amount_paid: '' }))}
                        />
                        Partial / Later
                      </label>
                    </div>
                  </FormControl>

                  {/* Amount Paid */}
                  <FormControl>
                    <FormLabel>Amount to Pay Now (₹)</FormLabel>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={createForm.amount_paid}
                      onChange={(e) => setCreateForm((p) => ({ ...p, amount_paid: e.target.value }))}
                      disabled={createForm.payment_option === 'full'}
                      style={{ backgroundColor: createForm.payment_option === 'full' ? '#F3F4F6' : '#fff' }}
                    />
                  </FormControl>

                  {/* Payment Method */}
                  <FormControl>
                    <FormLabel>Payment Method</FormLabel>
                    <select
                      value={createForm.payment_method}
                      onChange={(e) => setCreateForm((p) => ({ ...p, payment_method: e.target.value }))}
                      style={{
                        width: '100%', padding: '8px 12px',
                        borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px',
                      }}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </FormControl>

                  {/* Receipt Upload */}
                  <FormControl>
                    <FormLabel>Upload Receipt / Proof (Optional)</FormLabel>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setCreateForm((p) => ({ ...p, receipt_file: e.target.files[0] }))}
                    />
                  </FormControl>
                </Box>
              )}
            </>
          )}
        </FormModal>

        {/* ─── Payment Modal ─── */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={closePaymentModal}
          appointment={paymentModal.appointment}
          amount={paymentModal.amount}
          method={paymentModal.method}
          error={paymentModal.error}
          submitting={paymentModal.submitting}
          onAmountChange={(v) => updatePaymentField('amount', v)}
          onMethodChange={(v) => updatePaymentField('method', v)}
          onSubmit={submitPayment}
        />

        {/* ─── Refund Modal ─── */}
        <RefundModal
          isOpen={refundModal.isOpen}
          onClose={closeRefundModal}
          appointment={refundModal.appointment}
          refundData={refundModal.refundData}
          submitting={refundModal.submitting}
          error={refundModal.error}
          onConfirm={processRefund}
        />

        {/* ─── Invoice Preview ─── */}
        <InvoicePreview
          isOpen={!!invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
          appointment={invoiceTarget}
        />

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisAppointments;
