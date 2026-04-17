/**
 * Dialysis Sessions Page
 * Modeled after the Consultation / Session page from the reference.
 *
 * - Manager & Technician: full access (interactive rows)
 * - Frontdesk: limited access (read-only status cols)
 *
 * @file src/pages/dialysis/DialysisSessions.jsx
 */

import React, { useState, useMemo } from 'react';
import { Box, Input, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { useSelector } from 'react-redux';

// ─── Status badge colors (matches Consultation reference) ───
const STATUS_COLORS = {
  BOOKED: { bg: '#FEF9C3', text: '#854D0E' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED: { bg: '#DCFCE7', text: '#166534' },
  ARRIVED: { bg: '#F3E8FF', text: '#6B21A8' },
};

const getStatusStyle = (status) => {
  const s = String(status || '').toUpperCase().replace(/\s+/g, '_');
  return STATUS_COLORS[s] || { bg: '#FED7AA', text: '#9A3412' };
};

// ─── Dummy data ────────────────────────────────────────────
const DUMMY_SESSIONS = [
  { id: 1, queue: 1, name: 'Ramesh Kumar', age: 58, gender: 'Male', mobile_no: '9876543210', type: 'In Clinic', service: 'Hemodialysis', status: 'COMPLETED' },
  { id: 2, queue: 2, name: 'Sunita Devi', age: 45, gender: 'Female', mobile_no: '9123456780', type: 'In Clinic', service: 'Hemodialysis', status: 'IN_PROGRESS' },
  { id: 3, queue: 3, name: 'Ajay Verma', age: 62, gender: 'Male', mobile_no: '9988776655', type: 'In Clinic', service: 'Peritoneal Dialysis', status: 'ARRIVED' },
  { id: 4, queue: 4, name: 'Meena Sharma', age: 50, gender: 'Female', mobile_no: '9871234560', type: 'In Clinic', service: 'Hemodialysis', status: 'BOOKED' },
  { id: 5, queue: 5, name: 'Vikram Singh', age: 70, gender: 'Male', mobile_no: '9009876543', type: 'In Clinic', service: 'Hemodialysis', status: 'BOOKED' },
  { id: 6, queue: 6, name: 'Priya Patel', age: 39, gender: 'Female', mobile_no: '9345678901', type: 'In Clinic', service: 'Peritoneal Dialysis', status: 'COMPLETED' },
];

const DialysisSessions = () => {
  const { isMobile } = useIsMobile();
  const user = useSelector((state) => state.auth?.user);
  const role = useSelector((state) => state.permission);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine sub-role for access control
  const subRole = (
    user?.dialysisCenterRole ||
    user?.dialysis_center_role ||
    user?.roleInDialysis ||
    ''
  ).toLowerCase();
  const isFrontdesk = subRole === 'frontdesk';

  const sessions = useMemo(() => {
    if (!searchQuery.trim()) return DUMMY_SESSIONS;
    const q = searchQuery.toLowerCase();
    return DUMMY_SESSIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.mobile_no.includes(q)
    );
  }, [searchQuery]);

  // Stats
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === 'COMPLETED').length;
  const incomplete = total - completed;

  // Columns — Frontdesk gets fewer columns
  const columns = useMemo(() => {
    const base = [
      { key: 'queue', label: 'Queue No', type: 'text', width: '90px' },
      { key: 'name', label: 'Patient Name', type: 'text', width: '180px' },
      { key: 'age', label: 'Age', type: 'text', width: '70px' },
      { key: 'gender', label: 'Sex', type: 'text', width: '80px' },
      { key: 'mobile_no', label: 'Mobile No.', type: 'text', width: '140px' },
      { key: 'type', label: 'Type', type: 'text', width: '120px' },
      { key: 'service', label: 'Service', type: 'text', width: '170px' },
      {
        key: 'status',
        label: 'Status',
        type: 'custom',
        width: '140px',
        render: (row, value) => {
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

    if (isFrontdesk) {
      // Frontdesk: limited columns — no service, no queue
      return base.filter((c) => ['name', 'mobile_no', 'type', 'status'].includes(c.key));
    }

    return base;
  }, [isFrontdesk]);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Sessions"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Sessions', active: true },
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
                style={{ width: isMobile ? '100%' : '240px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>
                <strong style={{ color: '#16A34A' }}>{total}</strong> Total
              </span>
              <span style={{ fontSize: '14px' }}>
                <strong style={{ color: '#EA580C' }}>{incomplete}</strong> Incomplete
              </span>
              <span style={{ fontSize: '14px' }}>
                <strong style={{ color: '#7C3AED' }}>{completed}</strong> Completed
              </span>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="admin-card">
            <UnifiedListTable
              columns={columns}
              data={sessions}
              emptyMessage="No dialysis sessions found"
              displayMode="table"
              rowsPerPage={10}
            />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisSessions;
