/**
 * Dialysis Patients Page
 * Patient summary experience for dialysis patients with preserved timeline/calendar flows.
 *
 * Available to: Manager (dialysis ailment only), Technician, Frontdesk
 *
 * @file src/pages/dialysis/DialysisPatients.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Input, Button } from '../../component-library';
import { BaseModal } from '../../component-library/modals/BaseModal';
import DialysisAppointmentsDashboard from '../adminDashboard/components/DialysisAppointmentsDashboard';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import PatientAppointmentTimeline from '../../components/PatientAppointmentTimeline';
import { getPatients } from '../../ApiCalls/patientAPis';
import { useAdminToast } from '../../components/AdminToast';
import { ROUTES } from '../../routes/routeConstants';

const SUMMARY_TABS = ['Overview', 'Medical', 'Dialysis History', 'Medications', 'Allergies', 'Documents', 'Notes'];

const formatDateValue = (value, empty = '—') => {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calculateAgeFromDOB = (dobString) => {
  if (!dobString) return '—';
  const today = new Date();
  const birthDate = new Date(dobString);
  if (Number.isNaN(birthDate.getTime())) return '—';

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age < 0 ? 0 : age;
};

const normalizePatient = (patient) => {
  const rawAilments = patient.ailments || patient.patient_ailments || patient.aliments || patient.medical_history || '';
  const ailment = Array.isArray(rawAilments) ? rawAilments.join(', ') : String(rawAilments || '—');
  const dob = patient.dob || patient.date_of_birth || patient.birth_date || null;
  const age = patient.age || patient.patient_age || calculateAgeFromDOB(dob);

  return {
    id: patient.id,
    patientCode: patient.patient_code || patient.patientCode || `P${String(patient.id || '').padStart(5, '0')}`,
    name: patient.name || patient.patient_name || `Patient #${patient.id}`,
    age: age || '—',
    gender: patient.gender || patient.patient_gender || patient.sex || '—',
    bloodGroup: patient.blood_group || patient.bloodGroup || patient.blood_type || '—',
    phone: patient.number || patient.phone_number || patient.phone || patient.mobile_no || patient.phone_no || '—',
    email: patient.email || '—',
    ailment,
    diagnosis: patient.primary_diagnosis || patient.diagnosis || ailment || 'CKD - Stage 5D',
    dialysisType: patient.dialysis_type || patient.treatment_type || 'Hemodialysis',
    vascularAccess: patient.vascular_access || patient.access_type || '—',
    nephrologist: patient.primary_doctor_name || patient.doctor_name || patient.nephrologist_name || '—',
    schedule: patient.schedule || patient.dialysis_schedule || patient.frequency || 'Mon, Wed, Fri',
    firstDialysis: patient.first_dialysis_date || patient.first_session_date || patient.created_at || null,
    lastVisit: patient.last_visit || patient.updated_at || patient.created_at || null,
    notes: patient.notes || patient.remarks || patient.reason || '',
    vitals: {
      bp: patient.bp || patient.blood_pressure || patient.latest_bp || '—',
      pulse: patient.pulse || patient.heart_rate || patient.latest_pulse || '—',
      temperature: patient.temperature || patient.temp || patient.latest_temp || '—',
      spo2: patient.spo2 || patient.oxygen_saturation || patient.latest_spo2 || '—',
      preWeight: patient.pre_weight || patient.weight_pre || patient.weight || '—',
      postWeight: patient.post_weight || patient.weight_post || '—',
    },
    labs: [
      { label: 'Hemoglobin', value: patient.hemoglobin || patient.hb || '—', flag: patient.hemoglobin ? 'Low' : '' },
      { label: 'Potassium', value: patient.potassium || patient.k_plus || '—', flag: patient.potassium ? 'High' : '' },
      { label: 'Urea', value: patient.urea || '—', flag: patient.urea ? 'High' : '' },
      { label: 'Creatinine', value: patient.creatinine || '—', flag: patient.creatinine ? 'High' : '' },
      { label: 'Albumin', value: patient.albumin || '—', flag: patient.albumin ? 'Low' : '' },
    ],
    alerts: [
      patient.alert_text || patient.alert || null,
      ailment && ailment !== '—' ? `Primary diagnosis: ${ailment}` : null,
      patient.infection_status ? `Infection status: ${patient.infection_status}` : null,
    ].filter(Boolean),
    raw: patient,
  };
};

const MetricCard = ({ value, label, tone }) => {
  const tones = {
    blue: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
    green: { bg: '#ecfdf5', border: '#bbf7d0', color: '#15803d' },
    amber: { bg: '#fff7ed', border: '#fed7aa', color: '#d97706' },
    red: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  };
  const palette = tones[tone] || tones.blue;

  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: '18px',
        padding: '18px',
        minHeight: '102px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 800, color: palette.color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{label}</div>
    </div>
  );
};

const SummaryCard = ({ title, subtitle, children, actionLabel, onAction }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '20px',
      padding: '22px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
      height: '100%',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' }}>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{title}</div>
        {subtitle ? <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>{subtitle}</div> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          {actionLabel} →
        </button>
      ) : null}
    </div>
    {children}
  </div>
);

const KeyValueRows = ({ rows }) => (
  <div style={{ display: 'grid', gap: '12px' }}>
    {rows.map((row) => (
      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', fontSize: '14px' }}>
        <span style={{ color: '#475569' }}>{row.label}</span>
        <span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>{row.value || '—'}</span>
      </div>
    ))}
  </div>
);

const DialysisPatients = () => {
  const { isMobile } = useIsMobile();
  const { ToastContainer } = useAdminToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPatients();
      if (result.success) {
        const allPatients = result.data?.data || result.data || [];
        setPatients(Array.isArray(allPatients) ? allPatients.map(normalizePatient) : []);
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
    const query = searchQuery.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((patient) =>
      [patient.name, patient.patientCode, patient.phone, patient.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [patients, searchQuery]);

  const selectedPatient = useMemo(() => {
    const routePatientId =
      location.state?.patientId ||
      location.state?.selectedPatientId ||
      location.state?.appointment?.patient_id ||
      location.state?.patient?.id;

    if (routePatientId) {
      const found = patients.find((patient) => String(patient.id) === String(routePatientId));
      if (found) return found;
    }

    if (selectedPatientId) {
      const found = patients.find((patient) => String(patient.id) === String(selectedPatientId));
      if (found) return found;
    }

    return filteredPatients[0] || patients[0] || null;
  }, [filteredPatients, location.state, patients, selectedPatientId]);

  const selectedSummary = useMemo(() => {
    if (!selectedPatient) return null;

    const appointmentState = location.state?.appointment || {};
    const mergedAlerts = [
      appointmentState.reason ? `Appointment note: ${appointmentState.reason}` : null,
      ...selectedPatient.alerts,
    ].filter(Boolean);

    return {
      ...selectedPatient,
      schedule: appointmentState.shiftLabel || selectedPatient.schedule,
      firstDialysis: selectedPatient.firstDialysis,
      lastVisit: appointmentState.appointment_date || selectedPatient.lastVisit,
      notes: appointmentState.reason || selectedPatient.notes || 'No summary notes recorded for this patient yet.',
      alerts: mergedAlerts.length ? mergedAlerts : ['No critical alerts recorded'],
    };
  }, [location.state, selectedPatient]);

  const otherPatients = useMemo(() => {
    if (!selectedSummary) return filteredPatients.slice(0, 6);
    return filteredPatients.filter((patient) => String(patient.id) !== String(selectedSummary.id)).slice(0, 6);
  }, [filteredPatients, selectedSummary]);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Patient Summary"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Today Queue', path: ROUTES.DIALYSIS_APPOINTMENTS },
              { label: 'Patient Summary', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`} style={{ background: '#f8fafc' }}>
          <div style={{ maxWidth: '1320px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row' }}>
              <Button variant="ghost" onClick={() => navigate(ROUTES.DIALYSIS_APPOINTMENTS)} style={{ justifyContent: 'flex-start', color: '#2563eb', fontWeight: 700 }}>
                ← Back to Queue
              </Button>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button variant="outline" onClick={() => setIsDashboardOpen(true)}>Overall Calendar View</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!selectedSummary) return;
                    setSelectedPatientId(selectedSummary.id);
                    setIsTimelineOpen(true);
                  }}
                >
                  Appointment Timeline
                </Button>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                border: '1px solid #dbeafe',
                borderRadius: '28px',
                padding: isMobile ? '20px' : '28px',
                boxShadow: '0 18px 40px rgba(37, 99, 235, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '34px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {selectedSummary?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: isMobile ? '28px' : '34px', lineHeight: 1.1, color: '#0f172a', fontWeight: 800 }}>
                          {selectedSummary?.name || 'Select a patient'}
                        </h2>
                        {selectedSummary?.patientCode ? (
                          <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '9999px', padding: '6px 12px', fontSize: '13px', fontWeight: 700 }}>
                            PID: {selectedSummary.patientCode}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#475569', fontSize: '14px' }}>
                        <span>{selectedSummary?.age || '—'} Years</span>
                        <span>{selectedSummary?.gender || '—'}</span>
                        <span>{selectedSummary?.bloodGroup || '—'}</span>
                        <span>{selectedSummary?.phone || '—'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))' }}>
                      {[
                        { label: 'Nephrologist', value: selectedSummary?.nephrologist || '—' },
                        { label: 'Primary Diagnosis', value: selectedSummary?.diagnosis || '—' },
                        { label: 'Dialysis Type', value: selectedSummary?.dialysisType || '—' },
                        { label: 'Vascular Access', value: selectedSummary?.vascularAccess || '—' },
                      ].map((item) => (
                        <div key={item.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px 16px' }}>
                          <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>{item.label}</div>
                          <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700, marginTop: '6px' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ minWidth: isMobile ? '100%' : '240px', display: 'grid', gap: '12px' }}>
                  <div style={{ background: '#ecfdf5', color: '#15803d', borderRadius: '9999px', padding: '8px 14px', justifySelf: isMobile ? 'start' : 'end', fontWeight: 700, fontSize: '13px' }}>
                    Active Patient
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px 18px', display: 'grid', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>First Dialysis</span>
                      <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{formatDateValue(selectedSummary?.firstDialysis)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Regular Schedule</span>
                      <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{selectedSummary?.schedule || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
              <MetricCard value={patients.length} label="Total Patients" tone="blue" />
              <MetricCard value={selectedSummary ? 1 : 0} label="Current Summary" tone="green" />
              <MetricCard value={selectedSummary?.alerts?.length || 0} label="Attention Items" tone="amber" />
              <MetricCard value={selectedSummary?.lastVisit ? formatDateValue(selectedSummary.lastVisit, '—') : '—'} label="Last Visit" tone="red" />
            </div>

            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #dbe2ea', overflowX: 'auto', paddingBottom: '2px' }}>
              {SUMMARY_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === tab ? '#2563eb' : '#475569',
                    fontWeight: activeTab === tab ? 700 : 500,
                    padding: '12px 0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="admin-card flex items-center justify-center" style={{ minHeight: '320px' }}>
                <p style={{ color: '#6B7280' }}>Loading patient summary...</p>
              </div>
            ) : error ? (
              <div className="admin-card flex flex-col items-center justify-center" style={{ minHeight: '320px', gap: '14px' }}>
                <p style={{ color: '#DC2626' }}>{error}</p>
                <Button variant="outline" onClick={fetchPatients}>Retry</Button>
              </div>
            ) : !selectedSummary ? (
              <div className="admin-card flex flex-col items-center justify-center" style={{ minHeight: '320px', gap: '14px' }}>
                <p style={{ color: '#475569' }}>No dialysis patient available to summarize.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '18px' }}>
                  <SummaryCard title="Current Prescription">
                    <KeyValueRows
                      rows={[
                        { label: 'Primary Diagnosis', value: selectedSummary.diagnosis },
                        { label: 'Dialysis Type', value: selectedSummary.dialysisType },
                        { label: 'Vascular Access', value: selectedSummary.vascularAccess },
                        { label: 'Schedule', value: selectedSummary.schedule },
                        { label: 'Last Updated', value: formatDateValue(selectedSummary.lastVisit) },
                      ]}
                    />
                  </SummaryCard>

                  <SummaryCard title="Latest Vitals" subtitle={formatDateValue(selectedSummary.lastVisit, 'No date')}>
                    <KeyValueRows
                      rows={[
                        { label: 'BP', value: selectedSummary.vitals.bp },
                        { label: 'Pulse', value: selectedSummary.vitals.pulse },
                        { label: 'Temperature', value: selectedSummary.vitals.temperature },
                        { label: 'SpO2', value: selectedSummary.vitals.spo2 },
                        { label: 'Weight (Pre)', value: selectedSummary.vitals.preWeight },
                        { label: 'Weight (Post)', value: selectedSummary.vitals.postWeight },
                      ]}
                    />
                  </SummaryCard>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '18px' }}>
                  <SummaryCard title="Recent Labs" subtitle={formatDateValue(selectedSummary.lastVisit, 'No date')}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedSummary.labs.map((lab) => (
                        <div key={lab.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}>{lab.label}</div>
                            <div style={{ color: '#475569', fontSize: '13px' }}>{lab.value}</div>
                          </div>
                          {lab.flag ? (
                            <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '9999px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
                              {lab.flag}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </SummaryCard>

                  <SummaryCard title="Alerts" actionLabel="View Timeline" onAction={() => setIsTimelineOpen(true)}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedSummary.alerts.map((alert, index) => (
                        <div key={`${alert}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center' }}>
                          <span style={{ color: '#991b1b', fontWeight: 600, fontSize: '14px' }}>{alert}</span>
                          <span style={{ color: '#fb7185', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDateValue(selectedSummary.lastVisit, 'Today')}</span>
                        </div>
                      ))}
                    </div>
                  </SummaryCard>
                </div>

                <SummaryCard title="Notes">
                  <div style={{ color: '#334155', fontSize: '14px', lineHeight: 1.7 }}>
                    {selectedSummary.notes || 'No summary notes recorded for this patient yet.'}
                  </div>
                  <div style={{ marginTop: '12px', color: '#64748b', fontSize: '12px' }}>
                    Added on {formatDateValue(selectedSummary.lastVisit, '—')}
                  </div>
                </SummaryCard>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.6fr) minmax(280px, 0.8fr)', gap: '18px' }}>
                  <SummaryCard title="Other Dialysis Patients" subtitle="Existing patient browsing is preserved here.">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <div style={{ color: '#475569', fontSize: '14px' }}>Total Patients: <strong>{filteredPatients.length}</strong></div>
                      <Input
                        type="text"
                        placeholder="Search by name, code, phone, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: isMobile ? '100%' : '320px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {(otherPatients.length ? otherPatients : filteredPatients.slice(0, 6)).map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => setSelectedPatientId(patient.id)}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '16px',
                            background: '#fff',
                            padding: '14px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
                            <div style={{ marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
                              {patient.patientCode} · {patient.gender} · {patient.phone}
                            </div>
                          </div>
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>Open →</span>
                        </button>
                      ))}
                    </div>
                  </SummaryCard>

                  <SummaryCard title="Actions">
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <Button variant="outline" onClick={() => navigate(ROUTES.userProfile(selectedSummary.id), { state: selectedSummary.raw })}>
                        Edit Info
                      </Button>
                      <Button variant="outline" onClick={() => navigate(ROUTES.userProfile(selectedSummary.id), { state: selectedSummary.raw })}>
                        View Full Profile
                      </Button>
                      <Button variant="brand" onClick={() => navigate(ROUTES.DIALYSIS_SESSIONS, { state: { patientId: selectedSummary.id, patient: selectedSummary.raw } })}>
                        Proceed to Pre-Dialysis Dashboard →
                      </Button>
                    </div>
                  </SummaryCard>
                </div>
              </>
            )}
          </div>
        </div>

        <BaseModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          title="Dialysis Booking Dashboard"
          size="full"
        >
          <DialysisAppointmentsDashboard clinicId={1} />
        </BaseModal>

        <BaseModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          title={`${selectedSummary?.name || 'Patient'} - Appointment Timeline`}
          size="xl"
        >
          {selectedSummary?.id ? <PatientAppointmentTimeline patientId={selectedSummary.id} /> : null}
        </BaseModal>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisPatients;
