/**
 * Dialysis Billing Page
 * Modeled after the Billing page from the reference.
 *
 * Available to: Manager, Frontdesk
 *
 * @file src/pages/dialysis/DialysisBilling.jsx
 */

import React, { useState, useMemo } from 'react';
import { Box, Input } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';

// ─── Dummy data ────────────────────────────────────────────
const DUMMY_BILLS = [
  { id: 1, appointment_date: '17-04-2026', patient_name: 'Ramesh Kumar', consultation_type: 'In Clinic', service: 'Hemodialysis', total_amt: 3500, received_amt: 3500, pending_amt: 0, payment_action: 'Paid' },
  { id: 2, appointment_date: '17-04-2026', patient_name: 'Sunita Devi', consultation_type: 'In Clinic', service: 'Hemodialysis', total_amt: 3500, received_amt: 3500, pending_amt: 0, payment_action: 'Paid' },
  { id: 3, appointment_date: '17-04-2026', patient_name: 'Ajay Verma', consultation_type: 'In Clinic', service: 'Peritoneal Dialysis', total_amt: 4200, received_amt: 0, pending_amt: 4200, payment_action: 'Pending' },
  { id: 4, appointment_date: '16-04-2026', patient_name: 'Meena Sharma', consultation_type: 'In Clinic', service: 'Hemodialysis', total_amt: 3500, received_amt: 2000, pending_amt: 1500, payment_action: 'Pending' },
  { id: 5, appointment_date: '16-04-2026', patient_name: 'Vikram Singh', consultation_type: 'In Clinic', service: 'Hemodialysis', total_amt: 3500, received_amt: 3500, pending_amt: 0, payment_action: 'Paid' },
  { id: 6, appointment_date: '15-04-2026', patient_name: 'Priya Patel', consultation_type: 'In Clinic', service: 'Peritoneal Dialysis', total_amt: 4200, received_amt: 4200, pending_amt: 0, payment_action: 'Paid' },
  { id: 7, appointment_date: '15-04-2026', patient_name: 'Ravi Gupta', consultation_type: 'In Clinic', service: 'Hemodialysis', total_amt: 3500, received_amt: 0, pending_amt: 3500, payment_action: 'Pending' },
];

const DialysisBilling = () => {
  const { isMobile } = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  const bills = useMemo(() => {
    if (!searchQuery.trim()) return DUMMY_BILLS;
    const q = searchQuery.toLowerCase();
    return DUMMY_BILLS.filter(
      (b) =>
        b.patient_name.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Stats
  const totalRevenue = bills
    .filter((b) => b.payment_action === 'Paid')
    .reduce((sum, b) => sum + b.total_amt, 0);
  const paidBills = bills.filter((b) => b.payment_action === 'Paid').length;
  const pendingBills = bills.filter((b) => b.payment_action === 'Pending').length;

  const columns = [
    { key: 'appointment_date', label: 'Date', type: 'text', width: '110px' },
    { key: 'patient_name', label: 'Patient Name', type: 'text', width: '160px' },
    { key: 'consultation_type', label: 'Type', type: 'text', width: '100px' },
    { key: 'service', label: 'Service', type: 'text', width: '170px' },
    {
      key: 'total_amt',
      label: 'Total Amount',
      type: 'custom',
      width: '120px',
      render: (_row, value) => <span style={{ fontWeight: 600 }}>₹{value}</span>,
    },
    {
      key: 'received_amt',
      label: 'Received',
      type: 'custom',
      width: '110px',
      render: (_row, value) => <span style={{ color: '#16A34A' }}>₹{value}</span>,
    },
    {
      key: 'pending_amt',
      label: 'Pending',
      type: 'custom',
      width: '110px',
      render: (_row, value) => (
        <span style={{ color: value > 0 ? '#DC2626' : '#6B7280' }}>₹{value}</span>
      ),
    },
    {
      key: 'payment_action',
      label: 'Payment Status',
      type: 'custom',
      width: '130px',
      render: (_row, value) => {
        const isPaid = String(value).toLowerCase() === 'paid';
        return (
          <span
            style={{
              backgroundColor: isPaid ? '#DCFCE7' : '#FEE2E2',
              color: isPaid ? '#166534' : '#991B1B',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {value}
          </span>
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
          {/* Stats Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              className="admin-card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Total Revenue</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A' }}>
                ₹{totalRevenue.toLocaleString()}
              </span>
            </div>
            <div
              className="admin-card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Paid Bills</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#1E40AF' }}>
                {paidBills}
              </span>
            </div>
            <div
              className="admin-card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Pending Bills</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626' }}>
                {pendingBills}
              </span>
            </div>
          </div>

          {/* Billing Table */}
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
                Total Bills: <strong>{bills.length}</strong>
              </span>
              <Input
                type="text"
                placeholder="Search by patient or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '280px' }}
              />
            </div>

            <UnifiedListTable
              columns={columns}
              data={bills}
              emptyMessage="No billing records found"
              displayMode="table"
              rowsPerPage={10}
            />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisBilling;
