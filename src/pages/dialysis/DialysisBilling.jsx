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
import { getAppointments, addAppointmentPayment, getClinics, getOrganizations, getAppointmentById, updateAppointment, consumeAppointmentServices } from '../../ApiCalls/clinicApis';
import { getPatients } from '../../ApiCalls/patientAPis';
import ClinicSelector from '../../components/ClinicSelector';
import OrganizationSelector from '../../components/OrganizationSelector';

const normalizeBillingRow = (apt, patients) => {
  const patientData = patients.find(p => String(p.patient_id || p.id) === String(apt.patient_id));
  
  return {
    id: apt.id,
    appointment_date: apt.appointment_date || (apt.startUTC ? String(apt.startUTC).split('T')[0] : '—'),
    name: apt.patient_name || apt.patientName || patientData?.name || (apt.patient_id ? `Patient #${apt.patient_id}` : '—'),
    age: apt.age || apt.patient_age || patientData?.age || '—',
    sex: apt.gender || apt.patient_gender || patientData?.gender || patientData?.sex || '—',
    mobile_no: apt.phoneNumber || apt.phone_number || apt.patient_phone || apt.phone || patientData?.phone_no || patientData?.mobile_no || '—',
    patient_id: apt.patient_id || apt.patientId,
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
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceTarget, setInvoiceTarget] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [clinics, setClinics] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointments({
        clinicId: selectedClinicId || undefined
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
  }, [selectedClinicId, patients, showToast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [clinicsResult, orgsResult, patientsResult] = await Promise.all([
          getClinics(),
          getOrganizations(),
          getPatients()
        ]);

        if (orgsResult.success) {
          const orgList = Array.isArray(orgsResult.data?.data) ? orgsResult.data.data : (orgsResult.data || []);
          setOrganizations(orgList);
        }

        if (clinicsResult.success) {
          const list = Array.isArray(clinicsResult.data?.data) ? clinicsResult.data.data : (clinicsResult.data || []);
          setClinics(list);
        }

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

  // Handle clinic reset when organization changes
  useEffect(() => {
    if (selectedOrgId && clinics.length > 0) {
      const orgClinics = clinics.filter(c => String(c.organization_id || c.org_id) === String(selectedOrgId));
      if (orgClinics.length > 0) {
        const isCurrentInOrg = orgClinics.some(c => String(c.id) === String(selectedClinicId));
        if (!isCurrentInOrg) {
          setSelectedClinicId(String(orgClinics[0].id));
        }
      } else {
        setSelectedClinicId('');
      }
    } else {
      setSelectedClinicId('');
    }
  }, [selectedOrgId, clinics, selectedClinicId]);

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
  
  const getDerivedPayStatus = (b) => {
    let ps = b.payment_action;
    if (!ps || ps === 'UNDEFINED') ps = getPaymentStatus(b.totalAmount, b.amountPaid);
    return ps;
  };

  const paidCount     = bills.filter((b) => getDerivedPayStatus(b) === 'PAID').length;
  const pendingCount  = bills.filter((b) => {
    const ps = getDerivedPayStatus(b);
    return ps === 'UNPAID' || ps === 'PENDING' || ps === 'PARTIAL';
  }).length;
  const outstanding   = bills.reduce((s, b) => s + Math.max(0, Number(b.totalAmount || 0) - Number(b.amountPaid || 0)), 0);

  // ─── Columns ──────────────────────────────────────────
  const columns = [
    { key: 'appointment_date', label: 'DATE',    type: 'text', width: '110px' },
    { key: 'name',             label: 'PATIENT', type: 'text', width: '150px' },
    { key: 'age',              label: 'AGE',     type: 'text', width: '60px'  },
    { key: 'sex',              label: 'SEX',     type: 'text', width: '80px'  },
    { key: 'mobile_no',        label: 'MOBILE',  type: 'text', width: '120px' },
    { key: 'service',          label: 'SCHEDULE', type: 'text', width: '130px' },
    {
      key: 'services',
      label: 'SERVICES',
      type: 'custom',
      width: '180px',
      render: (row) => {
        const services = row.services || [];
        if (!services.length) return <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No services</span>;

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
      width: '100px',
      render: (_row, value) => <span style={{ fontWeight: 600 }}>₹{Number(value).toLocaleString()}</span>,
    },
    {
      key: 'amountPaid',
      label: 'RECEIVED',
      type: 'custom',
      width: '100px',
      render: (_row, value) => (
        <span style={{ color: '#16A34A', fontWeight: 600 }}>₹{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'pending',
      label: 'PENDING',
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
      label: 'PAYMENT',
      type: 'custom',
      width: '115px',
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
      width: '180px',
      render: (row) => {
        let ps = row.payment_action;
        if (!ps || ps === 'UNDEFINED') ps = getPaymentStatus(row.totalAmount, row.amountPaid);
        return (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '14px',
              marginBottom: '16px',
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
                position: 'relative',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Bills: <strong>{filteredBills.length}</strong>
                </span>
                <OrganizationSelector
                  orgId={selectedOrgId}
                  setOrgId={setSelectedOrgId}
                  organizations={organizations}
                  label=""
                  minW="180px"
                />
                <ClinicSelector
                  clinicId={selectedClinicId}
                  setClinicId={setSelectedClinicId}
                  orgId={selectedOrgId}
                  clinics={clinics}
                  label=""
                  minW="180px"
                />
              </div>
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
