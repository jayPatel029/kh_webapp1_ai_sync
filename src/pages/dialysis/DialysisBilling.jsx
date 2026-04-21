/**
 * Dialysis Billing Page
 * Billing overview with payment status, PDF invoice download, and payment recording.
 *
 * Available to: Manager, Frontdesk
 *
 * @file src/pages/dialysis/DialysisBilling.jsx
 */

import React, { useState, useMemo } from 'react';
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

// ─── Dummy data (replace with API when available) ──────────
const INITIAL_BILLS = [
  { id: 1, appointment_date: '17-04-2026', name: 'Ramesh Kumar',  patient_id: 101, phoneNumber: '9876543210', consultation_type: 'In Clinic', service: 'Hemodialysis',        totalAmount: 3500, amountPaid: 3500, status: 'COMPLETED' },
  { id: 2, appointment_date: '17-04-2026', name: 'Sunita Devi',   patient_id: 102, phoneNumber: '9876543211', consultation_type: 'In Clinic', service: 'Hemodialysis',        totalAmount: 3500, amountPaid: 3500, status: 'COMPLETED' },
  { id: 3, appointment_date: '17-04-2026', name: 'Ajay Verma',    patient_id: 103, phoneNumber: '9876543212', consultation_type: 'In Clinic', service: 'Peritoneal Dialysis', totalAmount: 4200, amountPaid: 0,    status: 'BOOKED'    },
  { id: 4, appointment_date: '16-04-2026', name: 'Meena Sharma',  patient_id: 104, phoneNumber: '9876543213', consultation_type: 'In Clinic', service: 'Hemodialysis',        totalAmount: 3500, amountPaid: 2000, status: 'ARRIVED'   },
  { id: 5, appointment_date: '16-04-2026', name: 'Vikram Singh',  patient_id: 105, phoneNumber: '9876543214', consultation_type: 'In Clinic', service: 'Hemodialysis',        totalAmount: 3500, amountPaid: 3500, status: 'COMPLETED' },
  { id: 6, appointment_date: '15-04-2026', name: 'Priya Patel',   patient_id: 106, phoneNumber: '9876543215', consultation_type: 'In Clinic', service: 'Peritoneal Dialysis', totalAmount: 4200, amountPaid: 4200, status: 'COMPLETED' },
  { id: 7, appointment_date: '15-04-2026', name: 'Ravi Gupta',    patient_id: 107, phoneNumber: '9876543216', consultation_type: 'In Clinic', service: 'Hemodialysis',        totalAmount: 3500, amountPaid: 0,    status: 'BOOKED'    },
];

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

  const [bills, setBills]             = useState(INITIAL_BILLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  // ─── Payment flow ──────────────────────────────────────
  const {
    paymentModal,
    openPaymentModal,
    closePaymentModal,
    updatePaymentField,
    submitPayment,
  } = usePaymentFlow({
    onPaymentAdded: (apptId, amount, method, billPDFUrl) => {
      setBills((prev) =>
        prev.map((b) =>
          b.id === apptId
            ? { ...b, amountPaid: Number(b.amountPaid) + Number(amount), paymentMethod: method, billPDFUrl: billPDFUrl || b.billPDFUrl }
            : b
        )
      );
      showToast(`Payment of ₹${amount} recorded`, 'success');
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

            <UnifiedListTable
              columns={columns}
              data={filteredBills}
              emptyMessage="No billing records found"
              displayMode="table"
              rowsPerPage={10}
            />
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
