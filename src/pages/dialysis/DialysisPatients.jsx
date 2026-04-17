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

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPatients();
      if (result.success) {
        const allPatients = result.data?.data || result.data || [];
        // Filter for patients with "Dialysis" in ailments or reason if provided by backend
        // For now, if we don't have a specific field, we show all since this is the Dialysis view
        // But the requirement says "only patient with dialysis in ailement"
        const dialysisPatients = allPatients.filter(p => {
          const ailments = String(p.ailments || p.patient_ailments || '').toLowerCase();
          return ailments.includes('dialysis');
        });
        
        // Map to table shape
        const mapped = dialysisPatients.map(p => ({
          id: p.id,
          name: p.name || p.patient_name || `Patient #${p.id}`,
          age: p.age || p.patient_age || '—',
          gender: p.gender || p.patient_gender || '—',
          phone: p.phone || p.phone_number || '—',
          email: p.email || '—',
          ailment: 'Dialysis',
          lastVisit: p.last_visit || p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—',
          _raw: p
        }));
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
