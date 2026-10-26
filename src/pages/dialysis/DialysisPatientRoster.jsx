import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import OrganizationSelector from '../../components/OrganizationSelector';
import ClinicSelector from '../../components/ClinicSelector';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { ROUTES } from '../../routes/routeConstants';
import { getClinics, getOrganizations } from '../../ApiCalls/clinicApis';
import DeleteIcon from '../../assets/Delete.svg';
import {
  listDtPatients,
  ensureDtPatientsFromM1Batch,
  createDtPatient,
  discontinueDtPatient,
  reactivateDtPatient,
  anonymizeDtPatient,
} from '../../ApiCalls/dtPatientApis';

const ROSTER_STATUSES = ['Waiting', 'Temp', 'Active', 'Discontinued'];
const BOOKABLE_STATUSES = ['Waiting', 'Temp', 'Active'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LAB_OPTIONS = ['Pending', 'Positive', 'Negative'];

const STATUS_COLORS = {
  Waiting: { bg: '#DBEAFE', text: '#1E40AF' },
  Temp: { bg: '#FFEDD5', text: '#9A3412' },
  Active: { bg: '#DCFCE7', text: '#166534' },
  Discontinued: { bg: '#F3F4F6', text: '#374151' },
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function emptyForm(orgId, clinicId) {
  return {
    name: '',
    phone_no: '',
    gender: '',
    age: '',
    organization_id: orgId || '',
    clinic_id: clinicId || '',
    is_infectious: false,
    hiv_status: 'Pending',
    hepatitis_status: 'Pending',
    primary_diagnosis: '',
    registered_date: todayIso(),
  };
}

function ActionIconBtn({ title, onClick, disabled, children, src }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: '6px',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        padding: 0,
      }}
    >
      {src ? <img src={src} alt="" style={{ width: '18px', height: '18px' }} /> : children}
    </button>
  );
}

function StatusBadge({ status, reason }) {
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  const label = status === 'Discontinued' && reason
    ? `Discontinued · ${reason === 'Left' ? 'Left' : reason}`
    : (status || 'Waiting');
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default function DialysisPatientRoster() {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const storedOrgId = localStorage.getItem('organization_id') || '';
  const storedClinicId = localStorage.getItem('clinic_id') || '';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(storedOrgId);
  const [selectedClinicId, setSelectedClinicId] = useState(storedClinicId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(storedOrgId, storedClinicId));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [discontinueRow, setDiscontinueRow] = useState(null);
  const [discontinueReason, setDiscontinueReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

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
      if (statusFilter !== 'ALL' && String(row.patient_status || '') !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return [row.name, row.id, row.m1_patient_id, row.phone_no, row.email, row.patient_status]
        .filter((value) => value != null && value !== '')
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [rows, searchQuery, selectedOrgId, selectedClinicId, statusFilter]);

  const goBook = useCallback((row) => {
    navigate(ROUTES.DIALYSIS_APPOINTMENTS, {
      state: {
        bookFromPatient: true,
        dtPatient: row,
      },
    });
  }, [navigate]);

  const openAdd = () => {
    setForm(emptyForm(selectedOrgId || storedOrgId, selectedClinicId || storedClinicId));
    setFieldErrors({});
    setFormError('');
    setIsAddOpen(true);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setFormError('');
    const result = await createDtPatient({
      name: form.name,
      phone_no: form.phone_no,
      gender: form.gender,
      age: form.age === '' ? null : Number(form.age),
      organization_id: form.organization_id ? Number(form.organization_id) : null,
      clinic_id: form.clinic_id ? Number(form.clinic_id) : null,
      is_infectious: form.is_infectious ? 1 : 0,
      hiv_status: form.hiv_status,
      hepatitis_status: form.hepatitis_status,
      primary_diagnosis: form.primary_diagnosis,
      registered_date: form.registered_date,
    });
    setSubmitting(false);
    if (!result.success) {
      setFormError(result.message || 'Could not add patient');
      if (result.details && typeof result.details === 'object') {
        setFieldErrors(result.details);
      }
      return;
    }
    setIsAddOpen(false);
    await loadRoster();
  };

  const replaceRow = (updated) => {
    if (!updated?.id) return;
    setRows((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
  };

  const handleAnonymize = async (row) => {
    if (!window.confirm('Remove name, phone, email, and address for this patient? Appointments stay. This cannot be undone.')) {
      return;
    }
    setActionBusy(true);
    const result = await anonymizeDtPatient(row.id);
    setActionBusy(false);
    if (!result.success) {
      setError(result.message || 'Could not delete personal data');
      return;
    }
    replaceRow(result.data);
  };

  const handleReactivate = async (row) => {
    setActionBusy(true);
    const result = await reactivateDtPatient(row.id);
    setActionBusy(false);
    if (!result.success) {
      setError(result.message || 'Could not reactivate patient');
      return;
    }
    replaceRow(result.data);
  };

  const handleDiscontinue = async () => {
    if (!discontinueRow || !discontinueReason) {
      setActionError('Select a reason');
      return;
    }
    setActionBusy(true);
    setActionError('');
    const result = await discontinueDtPatient(discontinueRow.id, discontinueReason);
    setActionBusy(false);
    if (!result.success) {
      setActionError(result.message || 'Could not discontinue patient');
      return;
    }
    replaceRow(result.data);
    setDiscontinueRow(null);
    setDiscontinueReason('');
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'PATIENT',
        type: 'custom',
        render: (row) => (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>
              {row.anonymized ? 'Anonymized' : (row.name || '—')}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              DT #{row.id}
              {row.anonymized ? '' : (row.m1_patient_id ? ` · M1 #${row.m1_patient_id}` : ' · DT only')}
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
        key: 'patient_status',
        label: 'STATUS',
        type: 'custom',
        render: (row) => (
          <StatusBadge status={row.patient_status} reason={row.discontinue_reason} />
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
        render: (row) => {
          if (row.anonymized) {
            return <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>;
          }
          const canBook = BOOKABLE_STATUSES.includes(row.patient_status);
          const canReactivate = row.patient_status === 'Discontinued' && row.discontinue_reason === 'Left';
          const canDiscontinue = row.patient_status !== 'Discontinued';
          return (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              {canBook && (
                <ActionIconBtn title="Book appointment" disabled={actionBusy} onClick={() => goBook(row)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </ActionIconBtn>
              )}
              {canReactivate && (
                <ActionIconBtn title="Reactivate" disabled={actionBusy} onClick={() => handleReactivate(row)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
                  </svg>
                </ActionIconBtn>
              )}
              <ActionIconBtn title="Delete" disabled={actionBusy} src={DeleteIcon} onClick={() => handleAnonymize(row)} />
              {canDiscontinue && (
                <ActionIconBtn
                  title="Discontinued"
                  disabled={actionBusy}
                  onClick={() => {
                    setActionError('');
                    setDiscontinueReason('');
                    setDiscontinueRow(row);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8" />
                  </svg>
                </ActionIconBtn>
              )}
            </div>
          );
        },
      },
    ],
    [orgNameById, clinicNameById, goBook, actionBusy],
  );

  const gridCols = isMobile ? '1fr' : '1fr 1fr';

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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <OrganizationSelector
                  orgId={selectedOrgId}
                  setOrgId={(val) => {
                    setSelectedOrgId(val);
                    setSelectedClinicId('');
                  }}
                  organizations={organizations}
                  label=""
                  minW="160px"
                  placeholder="All organizations"
                />
              </div>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <ClinicSelector
                  orgId={selectedOrgId}
                  clinicId={selectedClinicId}
                  setClinicId={setSelectedClinicId}
                  clinics={clinics}
                  label=""
                  minW="160px"
                  placeholder="All clinics"
                />
              </div>
              <Input
                type="text"
                placeholder="Search name, phone, or id…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px', width: '220px', margin: 0, flexShrink: 0 }}
              />
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: '150px' }}>
                <Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All statuses</option>
                  {ROSTER_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={loadRoster} style={{ height: '40px', margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Refresh
              </Button>
              <Button variant="brand" size="sm" onClick={openAdd} style={{ height: '40px', margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Add Patient
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
                  selectedOrgId || selectedClinicId || statusFilter !== 'ALL'
                    ? 'No patients for this filter.'
                    : 'No patients yet. Click Add Patient to create one.'
                }
                displayMode="table"
                rowsPerPage={15}
              />
            )}
          </div>
        </div>

        <FormModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleCreate}
          title="Add Patient"
          submitText={submitting ? 'Saving…' : 'Save Patient'}
          submitVariant="brand"
          isLoading={submitting}
          isSubmitDisabled={submitting}
          errorMessage={formError}
          fieldErrors={fieldErrors}
          onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: undefined }))}
          size="xl"
        >
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '14px' }}>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.name)}>
              <FormLabel>Name</FormLabel>
              <Input
                value={form.name}
                onChange={(e) => setFormField('name', e.target.value)}
                placeholder="Patient name"
              />
              <FormErrorMessage>{fieldErrors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.phone_no)}>
              <FormLabel>Phone</FormLabel>
              <Input
                value={form.phone_no}
                onChange={(e) => setFormField('phone_no', e.target.value)}
                placeholder="10-digit phone"
              />
              <FormErrorMessage>{fieldErrors.phone_no}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.gender)}>
              <FormLabel>Gender</FormLabel>
              <Select
                value={form.gender}
                onChange={(e) => setFormField('gender', e.target.value)}
                placeholder="Select gender"
              >
                {GENDER_OPTIONS.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </Select>
              <FormErrorMessage>{fieldErrors.gender}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.age)}>
              <FormLabel>Age</FormLabel>
              <Input
                type="number"
                min="0"
                max="120"
                value={form.age}
                onChange={(e) => setFormField('age', e.target.value)}
                placeholder="Age"
              />
              <FormErrorMessage>{fieldErrors.age}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.organization_id)}>
              <FormLabel>Organization</FormLabel>
              <OrganizationSelector
                orgId={form.organization_id}
                setOrgId={(val) => {
                  setFormField('organization_id', val);
                  setFormField('clinic_id', '');
                }}
                organizations={organizations}
                label=""
                minW="100%"
                placeholder="Select organization"
              />
              <FormErrorMessage>{fieldErrors.organization_id}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(fieldErrors.clinic_id)}>
              <FormLabel>Clinic</FormLabel>
              <ClinicSelector
                orgId={form.organization_id}
                clinicId={form.clinic_id}
                setClinicId={(val) => setFormField('clinic_id', val)}
                clinics={clinics}
                label=""
                minW="100%"
                placeholder="Select clinic"
              />
              <FormErrorMessage>{fieldErrors.clinic_id}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Registered date</FormLabel>
              <Input
                type="date"
                value={form.registered_date}
                onChange={(e) => setFormField('registered_date', e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>HIV status</FormLabel>
              <Select
                value={form.hiv_status}
                onChange={(e) => setFormField('hiv_status', e.target.value)}
              >
                {LAB_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Hepatitis status</FormLabel>
              <Select
                value={form.hepatitis_status}
                onChange={(e) => setFormField('hepatitis_status', e.target.value)}
              >
                {LAB_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Primary diagnosis</FormLabel>
              <Input
                value={form.primary_diagnosis}
                onChange={(e) => setFormField('primary_diagnosis', e.target.value)}
                placeholder="Optional"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Infectious</FormLabel>
              <Checkbox
                isChecked={form.is_infectious}
                onChange={(e) => setFormField('is_infectious', e.target.checked)}
              >
                Isolation / infectious
              </Checkbox>
            </FormControl>
          </div>
        </FormModal>

        <FormModal
          isOpen={Boolean(discontinueRow)}
          onClose={() => { setDiscontinueRow(null); setDiscontinueReason(''); setActionError(''); }}
          onSubmit={handleDiscontinue}
          title="Discontinue patient"
          submitText={actionBusy ? 'Saving…' : 'Discontinue'}
          submitVariant="brand"
          isLoading={actionBusy}
          isSubmitDisabled={actionBusy || !discontinueReason}
          errorMessage={actionError}
        >
          <FormControl isRequired>
            <FormLabel>Reason</FormLabel>
            <Select
              value={discontinueReason}
              onChange={(e) => setDiscontinueReason(e.target.value)}
              placeholder="Select reason"
            >
              <option value="Death">Death</option>
              <option value="Left">Left / cancelled with us</option>
            </Select>
          </FormControl>
        </FormModal>
      </Box>
    </ThemeProvider>
  );
}
