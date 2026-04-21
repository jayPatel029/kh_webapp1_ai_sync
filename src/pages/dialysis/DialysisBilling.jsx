/**
 * Dialysis Billing Page
 * Billing overview with payment status, PDF invoice download, and payment recording.
 *
 * Available to: Manager, Frontdesk
 *
 * @file src/pages/dialysis/DialysisBilling.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Input, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import PaymentModal from '../../components/PaymentModal';
import InvoicePreview from '../../components/InvoicePreview';
import usePaymentFlow from '../../hooks/usePaymentFlow';
import { getPaymentStatus } from '../../utils/refundCalculator';
import { getAppointments, addAppointmentPayment } from '../../ApiCalls/clinicApis';

const normalizeBillingRow = (apt) => ({
  id: apt.id,
  appointment_date: apt.appointment_date || (apt.startUTC ? String(apt.startUTC).split('T')[0] : '—'),
  name: apt.patient_name || apt.patientName || (apt.patient_id ? `Patient #${apt.patient_id}` : '—'),
  patient_id: apt.patient_id || apt.patientId,
  phoneNumber: apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || '—',
  consultation_type: apt.bookingType || apt.appointment_type || 'In Clinic',
  service: apt.reason || apt.metadata?.notes || 'Dialysis Session',
  totalAmount: Number(apt.totalAmount || apt.total_amt || apt.amountDue || 0),
  amountPaid: Number(apt.amountPaid || apt.received_amt || apt.paidAmount || 0),
  status: String(apt.status || apt.appointmentStatus || 'BOOKED').toUpperCase(),
  billPDFUrl: apt.billPDFUrl || apt.billUrl || null,
});

const PAYMENT_COLORS = {
  PAID:    { bg: '#DCFCE7', text: '#166534' },
  PARTIAL: { bg: '#FEF9C3', text: '#854D0E' },
  UNPAID:  { bg: '#FEE2E2', text: '#991B1B' },
};

const ActionBtn = ({ label, bg, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '4px 10px',
      fontSize: '11px',
      fontWeight: 600,
      border: 'none',
      borderRadius: '6px',
      background: bg,
      color,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </button>
);

const DialysisBilling = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();

  const [bills, setBills]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointments();
      if (result.success) {
        const list = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
            ? result.data
            : [];
        setBills(list.map(normalizeBillingRow));
      } else {
        const msg = result.data?.message || 'Failed to load billing records';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      const msg = err?.message || 'Network error while loading billing records';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // ─── Payment flow ──────────────────────────────────────
  const {
    paymentModal,
    openPaymentModal,
    closePaymentModal,
    updatePaymentField,
    submitPayment,
  } = usePaymentFlow({
    onPaymentAdded: async (apptId, amount, method, billPDFUrl) => {
      const result = await addAppointmentPayment(apptId, {
        amount: Number(amount),
        method: String(method || 'cash').toUpperCase(),
        receiptUrl: billPDFUrl || undefined,
      });

      if (result.success) {
        showToast(`Payment of ₹${amount} recorded`, 'success');
        fetchBills();
      } else {
        showToast(result.data?.message || 'Failed to record payment', 'error');
      }
    },
  });

  // ─── Filtered bills ────────────────────────────────────
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;
    const q = searchQuery.toLowerCase();
    return bills.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.service?.toLowerCase().includes(q)
    );
  }, [bills, searchQuery]);

  // ─── Stats ─────────────────────────────────────────────
  const totalRevenue  = bills.reduce((s, b) => s + Number(b.amountPaid || 0), 0);
  const paidCount     = bills.filter((b) => getPaymentStatus(b.totalAmount, b.amountPaid) === 'PAID').length;
  const partialCount  = bills.filter((b) => getPaymentStatus(b.totalAmount, b.amountPaid) === 'PARTIAL').length;
  const unpaidCount   = bills.filter((b) => getPaymentStatus(b.totalAmount, b.amountPaid) === 'UNPAID').length;
  const outstanding   = bills.reduce((s, b) => s + Math.max(0, Number(b.totalAmount || 0) - Number(b.amountPaid || 0)), 0);

  // ─── Columns ──────────────────────────────────────────
  const columns = [
    { key: 'appointment_date', label: 'Date',    type: 'text', width: '110px' },
    { key: 'name',             label: 'Patient', type: 'text', width: '150px' },
    { key: 'service',          label: 'Service', type: 'text', width: '160px' },
    {
      key: 'totalAmount',
      label: 'Total',
      type: 'custom',
      width: '100px',
      render: (_row, value) => <span style={{ fontWeight: 600 }}>₹{Number(value).toLocaleString()}</span>,
    },
    {
      key: 'amountPaid',
      label: 'Received',
      type: 'custom',
      width: '100px',
      render: (_row, value) => (
        <span style={{ color: '#16A34A', fontWeight: 600 }}>₹{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'pending',
      label: 'Pending',
      type: 'custom',
      width: '100px',
      render: (row) => {
        const pending = Math.max(0, Number(row.totalAmount || 0) - Number(row.amountPaid || 0));
        return (
          <span style={{ color: pending > 0 ? '#DC2626' : '#6B7280', fontWeight: pending > 0 ? 600 : 400 }}>
            ₹{pending.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'payStatus',
      label: 'Pay Status',
      type: 'custom',
      width: '115px',
      render: (row) => {
        const ps = getPaymentStatus(row.totalAmount, row.amountPaid);
        const colors = PAYMENT_COLORS[ps] || PAYMENT_COLORS.UNPAID;
        return (
          <span
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {ps}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'custom',
      width: '200px',
      render: (row) => {
        const ps = getPaymentStatus(row.totalAmount, row.amountPaid);
        return (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {ps !== 'PAID' && (
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
            title="Dialysis Billing"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Billing', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          {/* ─── Stats Cards ─── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            {[
              { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, color: '#16A34A' },
              { label: 'Outstanding',     value: `₹${outstanding.toLocaleString()}`,  color: '#DC2626' },
              { label: 'Paid',            value: paidCount,                           color: '#1E40AF' },
              { label: 'Partial',         value: partialCount,                        color: '#D97706' },
              { label: 'Unpaid',          value: unpaidCount,                         color: '#991B1B' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="admin-card"
                style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{label}</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* ─── Billing Table ─── */}
          <div className="admin-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                Bills: <strong>{filteredBills.length}</strong>
              </span>
              <Input
                type="text"
                placeholder="Search patient or service…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '280px' }}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center" style={{ minHeight: '180px' }}>
                <p style={{ color: '#6B7280' }}>Loading billing records…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: '180px', gap: '12px' }}>
                <p style={{ color: '#DC2626' }}>{error}</p>
                <Button variant="outline" onClick={fetchBills}>Retry</Button>
              </div>
            ) : (
              <UnifiedListTable
                columns={columns}
                data={filteredBills}
                emptyMessage="No billing records found"
                displayMode="table"
                rowsPerPage={10}
              />
            )}
          </div>
        </div>

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

export default DialysisBilling;
