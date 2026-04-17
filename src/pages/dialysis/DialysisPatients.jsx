/**
 * Dialysis Patients Page
 * Shows patients with "Dialysis" ailment.
 *
 * Available to: Manager (dialysis ailment only), Technician, Frontdesk
 *
 * @file src/pages/dialysis/DialysisPatients.jsx
 */

import React, { useState, useMemo } from 'react';
import { Box, Input } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';

// ─── Dummy data (all patients have dialysis as ailment) ────
const DUMMY_PATIENTS = [
  { id: 1, name: 'Ramesh Kumar', age: 58, gender: 'Male', phone: '9876543210', email: 'ramesh.k@mail.com', ailment: 'Dialysis', lastVisit: '17-04-2026' },
  { id: 2, name: 'Sunita Devi', age: 45, gender: 'Female', phone: '9123456780', email: 'sunita.d@mail.com', ailment: 'Dialysis', lastVisit: '16-04-2026' },
  { id: 3, name: 'Ajay Verma', age: 62, gender: 'Male', phone: '9988776655', email: 'ajay.v@mail.com', ailment: 'Dialysis', lastVisit: '15-04-2026' },
  { id: 4, name: 'Meena Sharma', age: 50, gender: 'Female', phone: '9871234560', email: 'meena.s@mail.com', ailment: 'Dialysis', lastVisit: '14-04-2026' },
  { id: 5, name: 'Vikram Singh', age: 70, gender: 'Male', phone: '9009876543', email: 'vikram.s@mail.com', ailment: 'Dialysis', lastVisit: '13-04-2026' },
  { id: 6, name: 'Priya Patel', age: 39, gender: 'Female', phone: '9345678901', email: 'priya.p@mail.com', ailment: 'Dialysis', lastVisit: '12-04-2026' },
  { id: 7, name: 'Ravi Gupta', age: 55, gender: 'Male', phone: '9012345678', email: 'ravi.g@mail.com', ailment: 'Dialysis', lastVisit: '11-04-2026' },
  { id: 8, name: 'Anita Joshi', age: 48, gender: 'Female', phone: '9234567890', email: 'anita.j@mail.com', ailment: 'Dialysis', lastVisit: '10-04-2026' },
];

const DialysisPatients = () => {
  const { isMobile } = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  const patients = useMemo(() => {
    if (!searchQuery.trim()) return DUMMY_PATIENTS;
    const q = searchQuery.toLowerCase();
    return DUMMY_PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const columns = [
    { key: 'name', label: 'Patient Name', type: 'text', width: '180px' },
    { key: 'age', label: 'Age', type: 'text', width: '70px' },
    { key: 'gender', label: 'Sex', type: 'text', width: '80px' },
    { key: 'phone', label: 'Phone', type: 'text', width: '140px' },
    { key: 'email', label: 'Email', type: 'text', width: '200px' },
    { key: 'ailment', label: 'Ailment', type: 'custom', width: '120px',
      render: (_row, value) => (
        <span
          style={{
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {value}
        </span>
      ),
    },
    { key: 'lastVisit', label: 'Last Visit', type: 'text', width: '120px' },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Patients"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Patients', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          <div className="admin-card">
            <div
              className="admin-card__header"
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
                Total Patients: <strong>{patients.length}</strong>
              </span>
              <Input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '280px' }}
              />
            </div>

            <UnifiedListTable
              columns={columns}
              data={patients}
              emptyMessage="No dialysis patients found"
              displayMode="table"
              rowsPerPage={10}
            />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default DialysisPatients;
