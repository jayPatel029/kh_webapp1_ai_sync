/**
 * Dialysis Patients Page
 * Shows patients with "Dialysis" ailment.
 *
 * Available to: Manager (dialysis ailment only), Technician, Frontdesk
 *
 * @file src/pages/dialysis/DialysisPatients.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Input } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import { getPatients } from '../../ApiCalls/patientAPis';
import { useAdminToast } from '../../components/AdminToast';

const DialysisPatients = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const calculateAgeFromDOB = (dobString) => {
    if (!dobString) return '—';
    const today = new Date();
    const birthDate = new Date(dobString);

    if (isNaN(birthDate.getTime())) return '—';

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 0 ? 0 : age;
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPatients();
      if (result.success) {
        const allPatients = result.data?.data || result.data || [];
        // Map to table shape
        const mapped = allPatients.map(p => {
          const actualAilments = p.ailments || p.patient_ailments || p.aliments || '—';
          return {
            id: p.id,
            name: p.name || p.patient_name || `Patient #${p.id}`,
            age: calculateAgeFromDOB(p.dob) || p.patient_age || p.age || '—',
            gender: p.gender || p.patient_gender || p.sex || '—',
            phone: p.number || p.phone_number || p.phone || p.mobile_no || p.phone_no || '—',
            email: p.email || '—',
            ailment: Array.isArray(actualAilments) ? actualAilments.join(', ') : actualAilments,
            lastVisit: p.last_visit || p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—',
            _raw: p
          };
        });
        setPatients(mapped);
      } else {
        setError(result.error || 'Failed to fetch patients');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const columns = [
    { key: 'name',      label: 'PATIENT NAME', type: 'text', width: '180px' },
    { key: 'age',       label: 'AGE',          type: 'text', width: '70px' },
    { key: 'gender',    label: 'SEX',          type: 'text', width: '80px' },
    { key: 'phone',     label: 'PHONE',        type: 'text', width: '140px' },
    { key: 'email',     label: 'EMAIL',        type: 'text', width: '200px' },
    { key: 'ailment',   label: 'AILMENT',      type: 'custom', width: '150px',
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
    { key: 'lastVisit', label: 'LAST VISIT', type: 'text', width: '120px' },
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
                Total Patients: <strong>{filteredPatients.length}</strong>
              </span>
              <Input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: isMobile ? '100%' : '280px' }}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-10">
                <p style={{ color: '#6B7280' }}>Loading patients...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p style={{ color: '#DC2626' }}>{error}</p>
                <button 
                  onClick={fetchPatients}
                  style={{ padding: '8px 16px', background: '#004c6d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <UnifiedListTable
                columns={columns}
                data={filteredPatients}
                emptyMessage="No dialysis patients found"
                displayMode="table"
                rowsPerPage={10}
              />
            )}
          </div>
        </div>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisPatients;
