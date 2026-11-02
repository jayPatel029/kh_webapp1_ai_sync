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
  Textarea,
} from '../../component-library';
import { FormModal } from '../../component-library/modals/FormModal';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import UnifiedListTable from '../../components/table/UnifiedListTable';
import OrganizationSelector from '../../components/OrganizationSelector';
import ClinicSelector from '../../components/ClinicSelector';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { ROUTES } from '../../routes/routeConstants';
import { useDialysisScope } from './DialysisScope';
import DeleteIcon from '../../assets/Delete.svg';
import EditIcon from '../../assets/Edit.svg';
import {
  listDtPatients,
  ensureDtPatientsFromM1Batch,
  createDtPatient,
  updateDtPatient,
  discontinueDtPatient,
  reactivateDtPatient,
  anonymizeDtPatient,
} from '../../ApiCalls/dtPatientApis';

const ROSTER_STATUSES = ['Waiting', 'Temp', 'Active', 'Discontinued'];
const BOOKABLE_STATUSES = ['Waiting', 'Temp', 'Active'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LAB_OPTIONS = [
  'Positive',
  'Negative',
  'Test in progress awaiting result',
  'Test not done',
];
const DEFAULT_LAB_STATUS = 'Test not done';
const DISCONTINUE_NOTE_MAX_CHARS = 200;
const DISCONTINUE_NOTE_MAX_WORDS = 40;
const TOOLBAR_CONTROL_H = 40;
const TOOLBAR_FILTER_W = 180;
const toolbarSelectWrap = {
  width: TOOLBAR_FILTER_W,
  minWidth: TOOLBAR_FILTER_W,
  height: TOOLBAR_CONTROL_H,
  flex: `0 0 ${TOOLBAR_FILTER_W}px`,
};

function filterWrapClass(active) {
  return `dt-roster-filter ${active ? 'dt-roster-filter--on' : 'dt-roster-filter--off'}`;
}

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
    hiv_status: DEFAULT_LAB_STATUS,
    hepatitis_status: DEFAULT_LAB_STATUS,
    primary_diagnosis: '',
    registered_date: todayIso(),
  };
}

function normalizeFormGender(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (GENDER_OPTIONS.includes(raw)) return raw;
  const lower = raw.toLowerCase();
  if (lower === 'm' || lower === 'male') return 'Male';
  if (lower === 'f' || lower === 'female') return 'Female';
  if (lower === 'o' || lower === 'other') return 'Other';
  return '';
}

function formFromRow(row) {
  return {
    name: row.name || '',
    phone_no: row.phone_no || '',
    gender: normalizeFormGender(row.gender),
    age: row.age == null ? '' : row.age,
    organization_id: row.organization_id ? String(row.organization_id) : '',
    clinic_id: row.clinic_id ? String(row.clinic_id) : '',
    is_infectious: Number(row.is_infectious) === 1,
    hiv_status: row.hiv_status === 'Pending' ? DEFAULT_LAB_STATUS : (row.hiv_status || DEFAULT_LAB_STATUS),
    hepatitis_status: row.hepatitis_status === 'Pending' ? DEFAULT_LAB_STATUS : (row.hepatitis_status || DEFAULT_LAB_STATUS),
    primary_diagnosis: row.primary_diagnosis || '',
    registered_date: String(row.registered_date || todayIso()).slice(0, 10),
  };
}

function HandStopIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" />
      <circle cx="12" cy="12" r="10.2" fill="none" stroke="#E11D48" strokeWidth="2.4" />
      <g fill="#111">
        <rect x="9.05" y="5.55" width="1.55" height="6.1" rx="0.77" />
        <rect x="11.1" y="4.85" width="1.65" height="6.8" rx="0.82" />
        <rect x="13.2" y="5.2" width="1.55" height="6.45" rx="0.77" />
        <rect x="15.2" y="5.95" width="1.45" height="5.7" rx="0.72" />
        <rect x="6.35" y="9.05" width="3.35" height="1.6" rx="0.8" transform="rotate(-32 8.05 9.85)" />
        <path d="M8.35 10.85h8.05c.5 0 .9.4.9.9v2.55c0 1.95-1.5 3.4-3.65 3.4h-2.5c-2.05 0-3.7-1.3-3.7-3.35v-3.5z" />
      </g>
      <line
        x1="5.2"
        y1="5.2"
        x2="18.8"
        y2="18.8"
        stroke="#E11D48"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
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
        width: '36px',
        height: '36px',
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
      {src ? <img src={src} alt="" style={{ width: '22px', height: '22px' }} /> : children}
    </button>
  );
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function formatDiscontinueReason(reason) {
  const raw = String(reason || '').trim();
  if (!raw) return '';
  if (raw === 'Left' || raw === 'Death') return raw;
  const note = /^other\s*:/i.test(raw) ? raw.replace(/^other\s*:/i, '').trim() : raw;
  const display = note ? `Other · ${note}` : 'Other';
  return display.length > 48 ? `${display.slice(0, 45)}…` : display;
}

function StatusBadge({ status, reason }) {
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  const label = status === 'Discontinued' && reason
    ? `Discontinued · ${formatDiscontinueReason(reason)}`
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
      title={status === 'Discontinued' && reason ? String(reason) : undefined}
    >
      {label}
    </span>
  );
}

export default function DialysisPatientRoster() {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const {
    selectedOrgId,
    selectedClinicId,
    organizations,
    clinics,
  } = useDialysisScope();
  const storedOrgId = localStorage.getItem('organization_id') || '';
  const storedClinicId = localStorage.getItem('clinic_id') || '';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(storedOrgId, storedClinicId));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [discontinueRow, setDiscontinueRow] = useState(null);
  const [discontinueReason, setDiscontinueReason] = useState('');
  const [discontinueNote, setDiscontinueNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

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
    loadRoster();
  }, [loadRoster]);

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
    setEditingId(null);
    setForm(emptyForm(selectedOrgId || storedOrgId, selectedClinicId || storedClinicId));
    setFieldErrors({});
    setFormError('');
    setIsAddOpen(true);
  };

  const openEdit = (row) => {
    if (Number(row.anonymized) === 1) {
      setError('Anonymized patients cannot be edited.');
      return;
    }
    setEditingId(row.id);
    setForm(formFromRow(row));
    setFieldErrors({});
    setFormError('');
    setIsAddOpen(true);
  };

  const formPayload = () => ({
    name: String(form.name || '').trim(),
    phone_no: String(form.phone_no || '').replace(/\D/g, ''),
    gender: normalizeFormGender(form.gender),
    age: form.age === '' ? null : Number(form.age),
    organization_id: form.organization_id ? Number(form.organization_id) : null,
    clinic_id: form.clinic_id ? Number(form.clinic_id) : null,
    is_infectious: form.is_infectious ? 1 : 0,
    hiv_status: form.hiv_status,
    hepatitis_status: form.hepatitis_status,
    primary_diagnosis: String(form.primary_diagnosis || '').trim(),
    registered_date: form.registered_date,
  });

  const validateFormClient = () => {
    const next = {};
    if (!String(form.name || '').trim()) next.name = 'Name is required';
    const phone = String(form.phone_no || '').replace(/\D/g, '');
    if (phone.length < 10) next.phone_no = 'Enter a valid 10-digit phone number';
    if (!normalizeFormGender(form.gender)) next.gender = 'Select gender';
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 120) next.age = 'Age must be a number from 0 to 120';
    if (!form.organization_id) next.organization_id = 'Organization is required';
    if (!form.clinic_id) next.clinic_id = 'Clinic is required';
    return next;
  };

  const handleSavePatient = async () => {
    const clientErrors = validateFormClient();
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      setFormError('Fix the highlighted fields and try again.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    setFieldErrors({});
    const result = editingId
      ? await updateDtPatient(editingId, formPayload())
      : await createDtPatient(formPayload());
    setSubmitting(false);
    if (!result.success) {
      setFormError(result.message || (editingId ? 'Could not update patient' : 'Could not add patient'));
      if (result.details && typeof result.details === 'object') {
        setFieldErrors(result.details);
      }
      return;
    }
    setIsAddOpen(false);
    setEditingId(null);
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

  const resetDiscontinue = () => {
    setDiscontinueRow(null);
    setDiscontinueReason('');
    setDiscontinueNote('');
    setActionError('');
  };

  const handleDiscontinueNoteChange = (value) => {
    const next = String(value || '').slice(0, DISCONTINUE_NOTE_MAX_CHARS);
    const words = next.trim().split(/\s+/).filter(Boolean);
    if (words.length > DISCONTINUE_NOTE_MAX_WORDS) {
      setDiscontinueNote(words.slice(0, DISCONTINUE_NOTE_MAX_WORDS).join(' '));
      return;
    }
    setDiscontinueNote(next);
  };

  const handleDiscontinue = async () => {
    if (!discontinueRow || !discontinueReason) {
      setActionError('Select a reason');
      return;
    }
    const note = discontinueNote.trim();
    if (discontinueReason === 'Other') {
      if (!note) {
        setActionError('Enter a reason');
        return;
      }
      if (note.length > DISCONTINUE_NOTE_MAX_CHARS) {
        setActionError(`Keep the reason to ${DISCONTINUE_NOTE_MAX_CHARS} characters or fewer`);
        return;
      }
      if (wordCount(note) > DISCONTINUE_NOTE_MAX_WORDS) {
        setActionError(`Keep the reason to ${DISCONTINUE_NOTE_MAX_WORDS} words or fewer`);
        return;
      }
    }
    setActionBusy(true);
    setActionError('');
    const reasonToSend = discontinueReason === 'Other' ? `Other: ${note}` : discontinueReason;
    const result = await discontinueDtPatient(discontinueRow.id, reasonToSend);
    setActionBusy(false);
    if (!result.success) {
      setActionError(result.message || 'Could not discontinue patient');
      return;
    }
    replaceRow(result.data);
    resetDiscontinue();
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
        key: 'book',
        label: 'BOOK APPOINTMENT',
        type: 'custom',
        render: (row) => (
          BOOKABLE_STATUSES.includes(row.patient_status) && !row.anonymized ? (
            <Button variant="brand" size="sm" onClick={() => goBook(row)}>
              Book Appointment
            </Button>
          ) : (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
          )
        ),
      },
      {
        key: 'lab_report',
        label: 'LAB REPORT',
        type: 'custom',
        render: () => (
          <button type="button" onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'default' }}>
            —
          </button>
        ),
      },
      {
        key: 'prescription',
        label: 'PRESCRIPTION',
        type: 'custom',
        render: () => (
          <button type="button" onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'default' }}>
            —
          </button>
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
          const canReactivate = row.patient_status === 'Discontinued' && row.discontinue_reason === 'Left';
          const canDiscontinue = row.patient_status !== 'Discontinued';
          return (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <ActionIconBtn title="Edit" disabled={actionBusy} src={EditIcon} onClick={() => openEdit(row)} />
              <ActionIconBtn title="Delete" disabled={actionBusy} src={DeleteIcon} onClick={() => handleAnonymize(row)} />
              {canDiscontinue && (
                <ActionIconBtn
                  title="Discontinued"
                  disabled={actionBusy}
                  onClick={() => {
                    setActionError('');
                    setDiscontinueReason('');
                    setDiscontinueNote('');
                    setDiscontinueRow(row);
                  }}
                >
                  <HandStopIcon />
                </ActionIconBtn>
              )}
              {canReactivate && (
                <ActionIconBtn title="Reactivate" disabled={actionBusy} onClick={() => handleReactivate(row)}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
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
        <Box className="sticky z-20 bg-white" style={{ top: 'var(--dt-menu-top, 56px)' }}>
          <PageHeader
            title="Dialysis Patients"
            breadcrumbs={[
              { label: 'Dashboard', path: ROUTES.DIALYSIS_DASHBOARD },
              { label: 'Patients', active: true },
            ]}
            rightAction={
              !isMobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Input
                    type="text"
                    size="md"
                    placeholder="Search patient"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ height: TOOLBAR_CONTROL_H, width: '220px', margin: 0, borderRadius: '9999px', paddingLeft: '16px', paddingRight: '16px' }}
                  />
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={openAdd}
                    style={{ height: TOOLBAR_CONTROL_H, margin: 0, padding: '0 18px', whiteSpace: 'nowrap', borderRadius: '9999px', fontSize: 'var(--font-size-sm)' }}
                  >
                    Add Patient
                  </Button>
                </div>
              ) : null
            }
          />
        </Box>
        <div className={isMobile ? 'px-3 pb-20' : ''} style={{ background: '#f8fafc', width: '100%' }}>
          <div style={{ width: '100%', padding: isMobile ? '12px 0' : '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                <div className={filterWrapClass(statusFilter !== 'ALL')} style={toolbarSelectWrap}>
                  <Select
                    size="md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All statuses</option>
                    {ROSTER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Select>
                </div>
              </div>
              {isMobile && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={openAdd}
                  style={{
                    height: TOOLBAR_CONTROL_H,
                    margin: 0,
                    padding: '0 18px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    width: '100%',
                    borderRadius: '9999px',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Add Patient
                </Button>
              )}
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
          onClose={() => { setIsAddOpen(false); setEditingId(null); }}
          onSubmit={handleSavePatient}
          title={editingId ? 'Edit Patient' : 'Add Patient'}
          submitText={submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Save Patient')}
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
                inputMode="numeric"
                maxLength={15}
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
          onClose={resetDiscontinue}
          onSubmit={handleDiscontinue}
          title="Discontinue patient"
          submitText={actionBusy ? 'Saving…' : 'Discontinue'}
          submitVariant="brand"
          isLoading={actionBusy}
          isSubmitDisabled={
            actionBusy
            || !discontinueReason
            || (discontinueReason === 'Other' && !discontinueNote.trim())
          }
          errorMessage={actionError}
        >
          <FormControl isRequired>
            <FormLabel>Reason</FormLabel>
            <Select
              value={discontinueReason}
              onChange={(e) => {
                const next = e.target.value;
                setDiscontinueReason(next);
                if (next !== 'Other') setDiscontinueNote('');
              }}
              placeholder="Select reason"
            >
              <option value="Death">Death</option>
              <option value="Left">Left / cancelled with us</option>
              <option value="Other">Other</option>
            </Select>
          </FormControl>
          {discontinueReason === 'Other' && (
            <FormControl isRequired style={{ marginTop: '12px' }}>
              <FormLabel>Details</FormLabel>
              <Textarea
                value={discontinueNote}
                onChange={(e) => handleDiscontinueNoteChange(e.target.value)}
                placeholder="Enter the reason"
                rows={3}
                maxLength={DISCONTINUE_NOTE_MAX_CHARS}
                resize="none"
              />
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                {wordCount(discontinueNote)}/{DISCONTINUE_NOTE_MAX_WORDS} words · {discontinueNote.length}/{DISCONTINUE_NOTE_MAX_CHARS} characters
              </div>
            </FormControl>
          )}
        </FormModal>
      </Box>
    </ThemeProvider>
  );
}
