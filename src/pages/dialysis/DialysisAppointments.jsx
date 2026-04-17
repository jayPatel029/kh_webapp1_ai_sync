/**
 * Dialysis Appointments Page
 * Modeled after the Appointments Queue page from the reference.
 *
 * Available to: Manager, Technician, Frontdesk
 *
 * @file src/pages/dialysis/DialysisAppointments.jsx
 */

import React, { useState, useMemo } from 'react';
import { Box, Input, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';

// ─── Status colors (appointment) ───────────────────────────
const STATUS_COLORS = {
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

// ─── Dummy data ────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];

const DUMMY_APPOINTMENTS = [
  { id: 1, created_date: '17-04-2026', name: 'Ramesh Kumar', doctor_name: 'Dr. Mehta', age: 58, gender: 'Male', phoneNumber: '9876543210', treatment_type: 'In Clinic', booking_time: '09:00 AM', status: 'COMPLETED', payment_action: 'Paid' },
  { id: 2, created_date: '17-04-2026', name: 'Sunita Devi', doctor_name: 'Dr. Mehta', age: 45, gender: 'Female', phoneNumber: '9123456780', treatment_type: 'In Clinic', booking_time: '09:30 AM', status: 'IN_PROGRESS', payment_action: 'Paid' },
  { id: 3, created_date: '17-04-2026', name: 'Ajay Verma', doctor_name: 'Dr. Sharma', age: 62, gender: 'Male', phoneNumber: '9988776655', treatment_type: 'In Clinic', booking_time: '10:00 AM', status: 'ARRIVED', payment_action: 'Pending' },
  { id: 4, created_date: '17-04-2026', name: 'Meena Sharma', doctor_name: 'Dr. Sharma', age: 50, gender: 'Female', phoneNumber: '9871234560', treatment_type: 'In Clinic', booking_time: '10:30 AM', status: 'BOOKED', payment_action: 'Pending' },
  { id: 5, created_date: '16-04-2026', name: 'Vikram Singh', doctor_name: 'Dr. Mehta', age: 70, gender: 'Male', phoneNumber: '9009876543', treatment_type: 'In Clinic', booking_time: '11:00 AM', status: 'COMPLETED', payment_action: 'Paid' },
  { id: 6, created_date: '16-04-2026', name: 'Priya Patel', doctor_name: 'Dr. Sharma', age: 39, gender: 'Female', phoneNumber: '9345678901', treatment_type: 'In Clinic', booking_time: '11:30 AM', status: 'CANCELLED', payment_action: 'Pending' },
  { id: 7, created_date: '15-04-2026', name: 'Ravi Gupta', doctor_name: 'Dr. Mehta', age: 55, gender: 'Male', phoneNumber: '9012345678', treatment_type: 'In Clinic', booking_time: '02:00 PM', status: 'MISSED', payment_action: 'Pending' },
];

const DialysisAppointments = () => {
  const { isMobile } = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const appointments = useMemo(() => {
    if (!searchQuery.trim()) return DUMMY_APPOINTMENTS;
    const q = searchQuery.toLowerCase();
    return DUMMY_APPOINTMENTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.phoneNumber.includes(q) ||
        a.doctor_name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Stats
  const total = appointments.length;
  const pending = appointments.filter((a) => ['BOOKED', 'ARRIVED'].includes(a.status)).length;
  const completed = appointments.filter((a) => a.status === 'COMPLETED').length;

  const columns = [
    { key: 'created_date', label: 'Date', type: 'text', width: '110px' },
    { key: 'name', label: 'Patient', type: 'text', width: '160px' },
    { key: 'doctor_name', label: 'Doctor', type: 'text', width: '140px' },
    { key: 'age', label: 'Age', type: 'text', width: '60px' },
    { key: 'gender', label: 'Sex', type: 'text', width: '70px' },
    { key: 'phoneNumber', label: 'Mobile No.', type: 'text', width: '130px' },
    { key: 'treatment_type', label: 'Type', type: 'text', width: '100px' },
    { key: 'booking_time', label: 'Time', type: 'text', width: '100px' },
    { key: 'payment_action', label: 'Payment', type: 'custom', width: '100px',
      render: (_row, value) => {
        const isPaid = String(value).toLowerCase() === 'paid';
        return (
          <span
            style={{
              color: isPaid ? '#16A34A' : '#DC2626',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            {value}
          </span>
        );
      },
    },
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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

          {/* Appointments Table */}
          <div className="admin-card">
            <UnifiedListTable
              columns={columns}
              data={appointments}
              emptyMessage="No dialysis appointments found"
              displayMode="table"
              rowsPerPage={10}
            />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisAppointments;
