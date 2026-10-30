/**
 * Dialysis Billing Page
 * Billing overview with payment status, PDF invoice download, and payment recording.
 *
 * Available to: Manager, Frontdesk
 *
 * @file src/pages/dialysis/DialysisBilling.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Input, Button, Select } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useAdminToast } from '../../components/AdminToast';
import PaymentModal from '../../components/PaymentModal';
import InvoicePreview from '../../components/InvoicePreview';
import usePaymentFlow from '../../hooks/usePaymentFlow';
import { getPaymentStatus } from '../../utils/refundCalculator';
import { getAppointments, addAppointmentPayment, getAppointmentById, updateAppointment, consumeAppointmentServices } from '../../ApiCalls/clinicApis';
import { getPatients } from '../../ApiCalls/patientAPis';
import { useDialysisScope } from './DialysisScope';

function localIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysAgoIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - Number(days || 0));
  return localIsoDate(date);
}

function toIsoDate(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return localIsoDate(d);
}

function formatBillingDate(value) {
  if (!value || value === '—') return '—';
  const iso = toIsoDate(value);
  if (!iso) {
    const raw = String(value).trim();
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getFullYear()}`;
  }
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year}`;
}

const normalizeBillingRow = (apt, patients) => {
  const patientData = patients.find(p => String(p.patient_id || p.id) === String(apt.patient_id));
  
  return {
    id: apt.id,
    appointment_date_iso: toIsoDate(apt.appointment_date || apt.startUTC),
    appointment_date: formatBillingDate(apt.appointment_date || apt.startUTC),
    name: apt.patient_name || apt.patientName || patientData?.name || (apt.patient_id ? `Patient #${apt.patient_id}` : '—'),
    age: apt.age || apt.patient_age || patientData?.age || '—',
    sex: apt.gender || apt.patient_gender || patientData?.gender || patientData?.sex || '—',
    mobile_no: apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || patientData?.phone_no || patientData?.mobile_no || '—',
    patient_id: apt.patient_id || apt.patientId,
    clinic_id: apt.clinic_id || apt.clinicId,
    clinicId: apt.clinic_id || apt.clinicId,
    phoneNumber: apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || patientData?.phone_no || patientData?.mobile_no || '—',
    consultation_type: apt.bookingType || apt.appointment_type || 'In Clinic',
    service: apt.reason || apt.metadata?.notes || 'Dialysis Session',
    totalAmount: Number(apt.totalAmount || apt.total_amt || apt.amountDue || 0),
    amountPaid: Number(apt.amountPaid || apt.received_amt || apt.paidAmount || 0),
    status: String(apt.status || apt.appointmentStatus || 'BOOKED').toUpperCase(),
    billPDFUrl: apt.billPDFUrl || apt.billUrl || null,
    payment_action: String(apt.payment_action || apt.paymentAction || '').toUpperCase(),
    services: apt.services || [],
    _raw: apt
  };
};

const PAYMENT_COLORS = {
  PAID:    { bg: '#DCFCE7', text: '#166534' },
  PENDING: { bg: '#FEE2E2', text: '#991B1B' },
};
const TOOLBAR_CONTROL_H = 40;
const TOOLBAR_FILTER_W = 180;
const TOOLBAR_DATE_W = 160;
const toolbarSelectWrap = {
  width: TOOLBAR_FILTER_W,
  minWidth: TOOLBAR_FILTER_W,
  height: TOOLBAR_CONTROL_H,
  flex: `0 0 ${TOOLBAR_FILTER_W}px`,
};
const toolbarDateWrap = {
  width: TOOLBAR_DATE_W,
  minWidth: TOOLBAR_DATE_W,
  height: TOOLBAR_CONTROL_H,
  flex: `0 0 ${TOOLBAR_DATE_W}px`,
};

function filterWrapClass(active) {
  return `dt-roster-filter ${active ? 'dt-roster-filter--on' : 'dt-roster-filter--off'}`;
}

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
  const { selectedOrgId, selectedClinicId, clinics } = useDialysisScope();

  const [bills, setBills]             = useState([]);
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceTarget, setInvoiceTarget] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState(() => daysAgoIso(15));
  const [toDate, setToDate] = useState(() => localIsoDate());

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointments({
        clinicId: selectedClinicId || undefined,
        orgId: selectedOrgId || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      if (result.success) {
        const list = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
            ? result.data
            : [];
        setBills(list.map(apt => normalizeBillingRow(apt, patients)));
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
  }, [selectedClinicId, selectedOrgId, fromDate, toDate, patients, showToast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const patientsResult = await getPatients();
        if (patientsResult.success) {
          const pList = Array.isArray(patientsResult.data?.data) ? patientsResult.data.data : (patientsResult.data || []);
          setPatients(pList);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

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
    onPaymentAdded: async (appt, amount, method, billPDFUrl) => {
      // 1. Fetch fresh details first to ensure we have current balance
      const freshRes = await getAppointmentById(appt.id);
      const freshAppt = freshRes.success ? (freshRes.data?.data || freshRes.data) : appt;

      // 2. Record the payment
      const result = await addAppointmentPayment(appt.id, {
        amount: Number(amount),
        method: String(method || 'cash').toUpperCase(),
        receiptUrl: billPDFUrl || undefined,
      });

      if (result.success) {
        // 3. If not fully paid, update appointment metadata
        const updatedPaid = Number(freshAppt.amountPaid || freshAppt.received_amt || 0) + Number(amount);
        const totalDue = Number(freshAppt.totalAmount || freshAppt.amountDue || 0);

        if (updatedPaid < totalDue) {
          await updateAppointment(appt.id, {
            metadata: {
              ...(freshAppt.metadata || {}),
              payment_status: 'PENDING',
              last_payment_date: new Date().toISOString(),
              outstanding_balance: totalDue - updatedPaid
            }
          });
        }

        showToast(`Payment of ₹${amount} successful`, 'success');
        fetchBills();
      } else {
        showToast(result.data?.message || 'Failed to process dialysis billing', 'error');
      }
    },
  });

  const getDerivedPayStatus = (b) => {
    let ps = b.payment_action;
    if (!ps || ps === 'UNDEFINED') ps = getPaymentStatus(b.totalAmount, b.amountPaid);
    return ps;
  };

  const filteredBills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bills.filter((b) => {
      if (selectedOrgId) {
        const clinic = clinics.find((c) => String(c.id) === String(b.clinic_id || b.clinicId));
        const rowOrg = b._raw?.organization_id || b._raw?.org_id || clinic?.organization_id || clinic?.org_id;
        if (String(rowOrg || '') !== String(selectedOrgId)) return false;
      }
      if (selectedClinicId && String(b.clinic_id || b.clinicId || '') !== String(selectedClinicId)) {
        return false;
      }
      if (fromDate || toDate) {
        const rowDate = b.appointment_date_iso;
        if (!rowDate) return false;
        if (fromDate && rowDate < fromDate) return false;
        if (toDate && rowDate > toDate) return false;
      }
      if (paymentFilter !== 'ALL') {
        const ps = getDerivedPayStatus(b);
        if (paymentFilter === 'PAID' && ps !== 'PAID') return false;
        if (paymentFilter === 'PENDING' && !(ps === 'UNPAID' || ps === 'PENDING' || ps === 'PARTIAL')) return false;
      }
      if (!q) return true;
      return [b.name, b.service, b.mobile_no, b.patient_id, b.id]
        .filter((value) => value != null && value !== '')
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [bills, searchQuery, selectedOrgId, selectedClinicId, paymentFilter, fromDate, toDate, clinics]);

  // ─── Stats ─────────────────────────────────────────────
  const totalRevenue  = filteredBills.reduce((s, b) => s + Number(b.amountPaid || 0), 0);

  const paidCount     = filteredBills.filter((b) => getDerivedPayStatus(b) === 'PAID').length;
  const pendingCount  = filteredBills.filter((b) => {
    const ps = getDerivedPayStatus(b);
    return ps === 'UNPAID' || ps === 'PENDING' || ps === 'PARTIAL';
  }).length;
  const outstanding   = filteredBills.reduce((s, b) => s + Math.max(0, Number(b.totalAmount || 0) - Number(b.amountPaid || 0)), 0);

  const cellNowrap = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  // ─── Columns ──────────────────────────────────────────
  const columns = [
    { key: 'appointment_date', label: 'DATE', type: 'text', width: '120px', minWidth: '120px' },
    { 
      key: 'patient_details', 
      label: 'PATIENT DETAILS', 
      type: 'custom', 
      width: '240px',
      minWidth: '220px',
      render: (row) => {
        const code = row._raw?.patient_code || row.patient_code || row.patientCode || row.patient_id || '-';
        const name = row.name || '-';
        const age = row.age || '-';
        const gender = row.sex || row.gender || '-';
        const phone = row.mobile_no || row.phone || '-';
        const text = `${code} / ${name} / ${age} / ${gender} / ${phone}`;
        return <div style={{ fontSize: '13px', fontWeight: 600, ...cellNowrap }} title={text}>{text}</div>;
      }
    },
    { key: 'service', label: 'SCHEDULE', type: 'text', width: '170px', minWidth: '160px' },
    {
      key: 'services',
      label: 'SERVICES',
      type: 'custom',
      width: '140px',
      minWidth: '130px',
      render: (row) => {
        const services = row.services || [];
        if (!services.length) return <span style={{ color: '#9CA3AF', fontStyle: 'italic', whiteSpace: 'nowrap' }}>No services</span>;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {services.map((s, idx) => (
              <div key={s.id || idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '10px',
                background: s.status === 'USED' ? '#F0FDF4' : '#F9FAFB',
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${s.status === 'USED' ? '#DCFCE7' : '#F3F4F6'}`
              }}>
                <span style={{
                  color: s.status === 'USED' ? '#166534' : '#374151',
                  textDecoration: s.status === 'USED' ? 'line-through' : 'none',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {s.service_name || s.name || 'Service'}
                </span>
                {s.status !== 'USED' ? (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await consumeAppointmentServices(row.id, { serviceId: s.id });
                        if (res.success) {
                          showToast('Service marked as used', 'success');
                          fetchBills();
                        } else {
                          showToast(res.data?.message || 'Failed to consume service', 'error');
                        }
                      } catch (err) {
                        showToast('Error consuming service', 'error');
                      }
                    }}
                    style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 6px', fontSize: '9px', cursor: 'pointer' }}
                  >
                    Use
                  </button>
                ) : (
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'totalAmount',
      label: 'TOTAL',
      type: 'custom',
      width: '90px',
      minWidth: '90px',
      render: (_row, value) => <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₹{Number(value).toLocaleString()}</span>,
    },
    {
      key: 'amountPaid',
      label: 'RECEIVED',
      type: 'custom',
      width: '90px',
      minWidth: '90px',
      render: (_row, value) => (
        <span style={{ color: '#16A34A', fontWeight: 600, whiteSpace: 'nowrap' }}>₹{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'pending',
      label: 'PENDING',
      type: 'custom',
      width: '90px',
      minWidth: '90px',
      render: (row) => {
        const pending = Math.max(0, Number(row.totalAmount || 0) - Number(row.amountPaid || 0));
        return (
          <span style={{ color: pending > 0 ? '#DC2626' : '#6B7280', fontWeight: pending > 0 ? 600 : 400, whiteSpace: 'nowrap' }}>
            ₹{pending.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'payStatus',
      label: 'PAYMENT',
      type: 'custom',
      width: '100px',
      minWidth: '100px',
      render: (row) => {
        let ps = row.payment_action;
        if (!ps || ps === 'UNDEFINED') ps = getPaymentStatus(row.totalAmount, row.amountPaid);
        if (ps === 'PENDING') ps = 'UNPAID';
        
        const config = 
          ps === 'PAID' ? { label: 'Paid', color: '#10B981' } :
          { label: 'Pending', color: '#EF4444' };

        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (ps !== 'PAID') {
                  openPaymentModal(row);
                }
              }}
              style={{
                background: 'transparent',
                color: config.color,
                border: `1px solid ${config.color}`,
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: ps === 'PAID' ? 'default' : 'pointer',
                minWidth: '80px',
                textTransform: 'uppercase'
              }}
            >
              {config.label}
            </button>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      type: 'custom',
      width: '150px',
      minWidth: '140px',
      render: (row) => {
        let ps = row.payment_action;
        if (!ps || ps === 'UNDEFINED') ps = getPaymentStatus(row.totalAmount, row.amountPaid);
        return (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
            {ps !== 'PAID' && (
              <ActionBtn
                label="Pay"
                bg="#D1FAE5"
                color="#065F46"
                onClick={() => openPaymentModal(row)}
              />
            )}
            <ActionBtn
              label="Invoice"
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
        <Box className="sticky z-20 bg-white" style={{ top: 'var(--dt-menu-top, 56px)' }}>
          <PageHeader
            title="Dialysis Billing"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Billing', active: true },
            ]}
            rightAction={
              !isMobile ? (
                <Input
                  type="text"
                  size="md"
                  placeholder="Search patient"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: TOOLBAR_CONTROL_H, width: '220px', margin: 0, borderRadius: '9999px', paddingLeft: '16px', paddingRight: '16px' }}
                />
              ) : null
            }
          />
        </Box>

        <div className={isMobile ? 'px-3 pb-20' : ''} style={{ background: '#f8fafc', width: '100%' }}>
          <div style={{ width: '100%', padding: isMobile ? '12px 0' : '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '14px',
              }}
            >
              {[
                { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, color: '#16A34A' },
                { label: 'Outstanding',     value: `₹${outstanding.toLocaleString()}`,  color: '#DC2626' },
                { label: 'Paid',            value: paidCount,                           color: '#1E40AF' },
                { label: 'Pending',         value: pendingCount,                        color: '#EF4444' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              className="dt-roster-toolbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <style>{`
                .dt-roster-toolbar .form-control { width: 100%; height: ${TOOLBAR_CONTROL_H}px; margin: 0; }
                .dt-roster-toolbar .custom-select,
                .dt-roster-toolbar .custom-select__trigger { width: 100%; height: ${TOOLBAR_CONTROL_H}px; }
                .dt-roster-toolbar input[type="date"] {
                  width: 100%;
                  height: ${TOOLBAR_CONTROL_H}px;
                  margin: 0;
                  box-sizing: border-box;
                }
                .dt-roster-filter--off .custom-select__trigger {
                  opacity: 0.9;
                  background: #f8fafc;
                  border-color: #cbd5e1;
                }
                .dt-roster-filter--off .custom-select__label,
                .dt-roster-filter--off .custom-select__label--placeholder {
                  color: #64748b;
                  font-weight: 400;
                }
                .dt-roster-filter--off:hover .custom-select__trigger {
                  opacity: 0.8;
                }
                .dt-roster-filter--on .custom-select__trigger {
                  opacity: 1;
                  background: #fff;
                  border-color: #0f766e;
                }
                .dt-roster-filter--on .custom-select__label {
                  color: #0f172a;
                  font-weight: 600;
                }
              `}</style>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: '1 1 auto',
                  minWidth: 0,
                  flexWrap: 'wrap',
                }}
              >
                {isMobile && (
                  <Input
                    type="text"
                    size="md"
                    placeholder="Search patient"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      height: TOOLBAR_CONTROL_H,
                      margin: 0,
                      flex: '1 1 100%',
                      minWidth: '100%',
                      boxSizing: 'border-box',
                      borderRadius: '9999px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                    }}
                  />
                )}
                <div className={filterWrapClass(paymentFilter !== 'ALL')} style={toolbarSelectWrap}>
                  <Select
                    size="md"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                  >
                    <option value="ALL">All payments</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                  </Select>
                </div>
                <div className={filterWrapClass(Boolean(fromDate))} style={toolbarDateWrap}>
                  <Input
                    type="date"
                    size="md"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    aria-label="From date"
                    title="From"
                    style={{ height: TOOLBAR_CONTROL_H, margin: 0, width: '100%' }}
                  />
                </div>
                <div className={filterWrapClass(Boolean(toDate))} style={toolbarDateWrap}>
                  <Input
                    type="date"
                    size="md"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    aria-label="To date"
                    title="To"
                    style={{ height: TOOLBAR_CONTROL_H, margin: 0, width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading billing records…</div>
            ) : error ? (
              <div style={{ padding: '24px', color: '#dc2626' }}>
                {error}
                <div style={{ marginTop: '12px' }}>
                  <Button variant="outline" onClick={fetchBills}>Retry</Button>
                </div>
              </div>
            ) : (
              <>
                <style>{`
                  .dt-billing-table {
                    overflow-x: auto;
                  }
                  .dt-billing-table .list-table {
                    width: 100%;
                    min-width: 1080px;
                    table-layout: fixed;
                  }
                  .dt-billing-table .list-table thead th,
                  .dt-billing-table .list-table__header-cell,
                  .dt-billing-table .list-table__cell {
                    padding: 12px 10px;
                    white-space: nowrap;
                    vertical-align: middle;
                  }
                  .dt-billing-table .list-table__text-cell {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    word-wrap: normal;
                    overflow-wrap: normal;
                    max-width: 100%;
                  }
                `}</style>
                <UnifiedListTable
                  className="dt-billing-table"
                  columns={columns}
                  data={filteredBills}
                  emptyMessage="No billing records found"
                  displayMode="table"
                  rowsPerPage={10}
                />
              </>
            )}
          </div>
        </div>

        {/* ─── Payment Modal ─── */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={closePaymentModal}
          appointmentId={paymentModal.appointment?.id}
          billId={paymentModal.appointment?.invoiceId}
          onSuccess={async (appointmentId, amount, method, receiptUrl) => {
            showToast(`Payment of ₹${amount} recorded`, 'success');
            fetchBills();
          }}
        />

        {/* ─── Invoice Preview ─── */}
        <InvoicePreview
          isOpen={!!invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
          appointmentId={invoiceTarget?.id}
          billId={invoiceTarget?.bill_id || invoiceTarget?.invoice_id}
          appointment={invoiceTarget}
        />

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisBilling;
