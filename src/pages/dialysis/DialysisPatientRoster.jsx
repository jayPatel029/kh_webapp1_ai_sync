import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import OrganizationSelector from '../../components/OrganizationSelector';
import ClinicSelector from '../../components/ClinicSelector';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { ROUTES } from '../../routes/routeConstants';
import { getClinics, getOrganizations } from '../../ApiCalls/clinicApis';
import { listDtPatients, ensureDtPatientsFromM1Batch } from '../../ApiCalls/dtPatientApis';

export default function DialysisPatientRoster() {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const storedOrgId = localStorage.getItem('organization_id') || '';
  const storedClinicId = localStorage.getItem('clinic_id') || '';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(storedOrgId);
  const [selectedClinicId, setSelectedClinicId] = useState(storedClinicId);

  const loadLookups = useCallback(async () => {
    try {
      const [orgsResult, clinicsResult] = await Promise.all([
        getOrganizations(),
        getClinics(),
      ]);
      if (orgsResult.success) {
        const orgList = Array.isArray(orgsResult.data?.data)
          ? orgsResult.data.data
          : (orgsResult.data || []);
        setOrganizations(Array.isArray(orgList) ? orgList : []);
      }
      if (clinicsResult.success) {
        const clinicList = Array.isArray(clinicsResult.data?.data)
          ? clinicsResult.data.data
          : (clinicsResult.data || []);
        setClinics(Array.isArray(clinicList) ? clinicList : []);
      }
    } catch (err) {
      console.warn('Could not load org/clinic filters:', err);
    }
  }, []);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const extras = {
        organization_id: storedOrgId || undefined,
        clinic_id: storedClinicId || undefined,
      };
      const batch = await ensureDtPatientsFromM1Batch(undefined, extras);
      if (!batch.success) {
        setError(batch.message || 'Failed to sync Module 1 patients');
      }
      const list = await listDtPatients();
      if (!list.success) {
        setError(list.message || 'Failed to load dialysis patients');
        setRows([]);
        return;
      }
      const items = list.data?.items || list.data || [];
      setRows(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err.message || 'Failed to load patients');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [storedOrgId, storedClinicId]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  useEffect(() => {
    if (!selectedOrgId) {
      setSelectedClinicId('');
      return;
    }
    const orgClinics = clinics.filter(
      (c) => String(c.organization_id || c.org_id) === String(selectedOrgId),
    );
    if (!orgClinics.length) {
      setSelectedClinicId('');
      return;
    }
    const clinicStillValid = orgClinics.some((c) => String(c.id) === String(selectedClinicId));
    if (!clinicStillValid) setSelectedClinicId('');
  }, [selectedOrgId, clinics, selectedClinicId]);

  const orgNameById = useMemo(() => {
    const map = {};
    organizations.forEach((org) => {
      map[String(org.id)] = org.name || `Org #${org.id}`;
    });
    return map;
  }, [organizations]);

  const clinicNameById = useMemo(() => {
    const map = {};
    clinics.forEach((clinic) => {
      map[String(clinic.id)] = clinic.clinic_name || clinic.name || `Clinic #${clinic.id}`;
    });
    return map;
  }, [clinics]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (selectedOrgId && String(row.organization_id || '') !== String(selectedOrgId)) {
        return false;
      }
      if (selectedClinicId && String(row.clinic_id || '') !== String(selectedClinicId)) {
        return false;
      }
      if (!q) return true;
      return [row.name, row.id, row.m1_patient_id, row.phone_no, row.email]
        .filter((value) => value != null && value !== '')
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [rows, searchQuery, selectedOrgId, selectedClinicId]);

  const goBook = (row) => {
    navigate(ROUTES.DIALYSIS_APPOINTMENTS, {
      state: {
        bookFromPatient: true,
        dtPatient: row,
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'PATIENT',
        type: 'custom',
        render: (row) => (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.name || '—'}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              DT #{row.id}
              {row.m1_patient_id ? ` · M1 #${row.m1_patient_id}` : ' · DT only'}
            </div>
          </div>
        ),
      },
      {
        key: 'phone_no',
        label: 'PHONE',
        type: 'custom',
        render: (row) => <span>{row.phone_no || '—'}</span>,
      },
      {
        key: 'gender',
        label: 'GENDER / AGE',
        type: 'custom',
        render: (row) => (
          <span>
            {row.gender || '—'}
            {row.age != null ? ` · ${row.age}` : ''}
          </span>
        ),
      },
      {
        key: 'organization_id',
        label: 'ORG / CLINIC',
        type: 'custom',
        render: (row) => (
          <span style={{ fontSize: '13px', color: '#334155' }}>
            {row.organization_id
              ? (orgNameById[String(row.organization_id)] || `Org ${row.organization_id}`)
              : 'No org'}
            {' · '}
            {row.clinic_id
              ? (clinicNameById[String(row.clinic_id)] || `Clinic ${row.clinic_id}`)
              : 'No clinic'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'ACTIONS',
        type: 'custom',
        render: (row) => (
          <Button variant="brand" size="sm" onClick={() => goBook(row)}>
            Book Appointment
          </Button>
        ),
      },
    ],
    [orgNameById, clinicNameById],
  );

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Patients"
            breadcrumbs={[
              { label: 'Dashboard', path: ROUTES.DIALYSIS_DASHBOARD },
              { label: 'Patients', active: true },
            ]}
          />
        </Box>
        <div className={isMobile ? 'px-3 pb-20' : ''} style={{ background: '#f8fafc' }}>
          <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                <OrganizationSelector
                  orgId={selectedOrgId}
                  setOrgId={(val) => {
                    setSelectedOrgId(val);
                    setSelectedClinicId('');
                  }}
                  organizations={organizations}
                  label=""
                  minW="180px"
                  placeholder="All organizations"
                />
              </div>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                <ClinicSelector
                  orgId={selectedOrgId}
                  clinicId={selectedClinicId}
                  setClinicId={setSelectedClinicId}
                  clinics={clinics}
                  label=""
                  minW="180px"
                  placeholder="All clinics"
                />
              </div>
              <Input
                type="text"
                placeholder="Search name, phone, or id…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px', width: '280px' }}
              />
              <Button variant="outline" size="sm" onClick={loadRoster}>
                Refresh
              </Button>
            </div>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading patients…</div>
            ) : error ? (
              <div style={{ padding: '24px', color: '#dc2626' }}>
                {error}
                <div style={{ marginTop: '12px' }}>
                  <Button variant="outline" onClick={loadRoster}>Retry</Button>
                </div>
              </div>
            ) : (
              <UnifiedListTable
                columns={columns}
                data={filtered}
                emptyMessage={
                  selectedOrgId || selectedClinicId
                    ? 'No patients for this organization/clinic.'
                    : 'No patients yet. Module 1 patients are copied here on first load.'
                }
                displayMode="table"
                rowsPerPage={15}
              />
            )}
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
}
