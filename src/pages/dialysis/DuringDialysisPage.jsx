import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getDialysisSessionById,
  getDuringDialysisDashboard,
  getIntradialyticVitals,
  createIntradialyticVitals,
  createMachineParameters,
  createSymptom,
  createVascularAccessMonitoring,
  createMedicationAdministration,
  createAlarm,
  getDuringDialysisProgress,
  createTreatmentEvent,
  createIncident,
  endDuringDialysisTreatment,
} from '../../ApiCalls/dialysisSessionApis';
import { getVitalsThresholds } from '../../config/vitalsThresholds';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ParameterSection from '../../components/ParameterSection';
import LineChartDialysis from '../../components/Linechart/Linechart_Dialysis/LineChartDialysis';
import {
  Button as LibraryButton,
  Input as LibraryInput,
  Select as LibrarySelect,
  Textarea as LibraryTextarea,
  Checkbox as LibraryCheckbox,
  Card as LibraryCard,
  CardBody as LibraryCardBody,
} from '../../component-library';
import './duringDialysis.css';

const SCREENS = [
  ['P3-01', 'Treatment Dashboard'], ['P3-02', 'Live Vitals Monitoring'],
  ['P3-03', 'Machine Parameters'], ['P3-04', 'Patient Symptoms & Complications'],
  ['P3-05', 'Vascular Access Monitoring'], ['P3-06', 'Medication Administration'],
  ['P3-07', 'Alarm Management'], ['P3-08', 'Treatment Progress'],
  ['P3-09', 'Incident & Event Reporting'], ['P3-10', 'Treatment Completion'],
];

const writeDraft = (sessionId, value) => {
  try { localStorage.setItem(`during-dialysis-draft:${sessionId}`, JSON.stringify(value)); } catch (_) { /* storage may be unavailable */ }
};
const nowTime = () => new Date().toISOString().slice(0, 16);
const initialPatient = { name: '', pid: '', bed: '', access: '', nephrologist: '', targetWeight: '', dryWeight: '' };
const responseData = (result) => result?.data?.data ?? result?.data ?? {};

function Field({ label, children, required }) {
  return <label className="during-field"><span>{label}{required && <em> *</em>}</span>{children}</label>;
}
function Input(props) { return <LibraryInput size="sm" className="during-input" {...props} />; }
function Select({ children, ...props }) { return <LibrarySelect size="sm" className="during-input" {...props}>{children}</LibrarySelect>; }
function Textarea(props) { return <LibraryTextarea size="sm" className="during-input" {...props} />; }
function Card({ title, children, className = '' }) { return <LibraryCard variant="outline" className={`during-card ${className}`}><LibraryCardBody><h2>{title}</h2>{children}</LibraryCardBody></LibraryCard>; }

function PatientBanner({ patient }) {
  return <div className="during-existing-patient-card">
    <PreDialysisPatientProfileCard patient={patient} isMobile={false} />
  </div>;
}

function Metric({ label, value, hint }) { return <div className="during-metric"><small>{label}</small><strong>{value}</strong>{hint && <span>{hint}</span>}</div>; }

function Dashboard({ go, session, readings }) {
  const latest = readings[readings.length - 1] || {};
  const startedAt = session?.started_at ? new Date(session.started_at) : new Date();
  const elapsed = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 60000));
  const total = Number(session?.prescribed_duration_minutes || 240);
  const percent = Math.min(100, Math.round((elapsed / total) * 100));
  return <>
    <div className="during-stats">
      <Card title="Treatment Progress"><div className="during-ring"><strong>{percent}%</strong><span>Completed</span></div><div className="during-grid"><Metric label="Elapsed" value={`${Math.floor(elapsed / 60)}h ${elapsed % 60}m`} /><Metric label="Remaining" value={`${Math.max(0, total - elapsed)} min`} /><Metric label="Expected end" value={new Date(startedAt.getTime() + total * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} /></div></Card>
      <Card title="UF Progress"><div className="during-ring blue"><strong>{latest.uf_removed || '0.00'} L</strong><span>Removed</span></div><div className="during-grid"><Metric label="Target UF" value={session?.target_uf || '—'} /><Metric label="Remaining" value="—" /><Metric label="UF rate" value={latest.uf_rate ? `${latest.uf_rate} mL/kg/hr` : '—'} /></div></Card>
      <Card title="Machine Status"><span className="during-status success">● Running</span><div className="during-grid"><Metric label="Machine" value={session?.machine_model || 'Dialysis machine'} /><Metric label="BFR / DFR" value={`${latest.bfr || '—'} / ${latest.dfr || '—'}`} /></div><div className="during-empty">No active alarms</div></Card>
    </div>
    <Card title="Latest Vitals"><div className="during-grid six"><Metric label="BP" value={latest.systolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : '—'} /><Metric label="Pulse" value={latest.pulse || '—'} /><Metric label="Respiration" value={latest.respiration || '—'} /><Metric label="Temperature" value={latest.temperature || '—'} /><Metric label="SpO₂" value={latest.spo2 || '—'} /><Metric label="Pain" value={latest.pain_score ?? '—'} /></div></Card>
    <Card title="Quick Actions"><div className="during-actions">{[['P3-02', 'Add Vitals'], ['P3-04', 'Add Symptoms'], ['P3-07', 'Alarm Management'], ['P3-06', 'Medication'], ['P3-08', 'Treatment Progress']].map(([id, label]) => <LibraryButton key={id} onClick={() => go(id)} variant="outline" className="during-action"><strong>{label}</strong></LibraryButton>)}</div></Card>
    <div className="during-guidance">Keep monitoring the patient closely. Review alerts and take appropriate action as needed.</div>
  </>;
}

function VitalsForm({ sessionId, readings, onSaved, go }) {
  const [form, setForm] = useState({ observation_time: nowTime(), systolic_bp: '', diastolic_bp: '', pulse: '', respiration: '', temperature: '', spo2: '', pain_score: 0, consciousness: 'Alert', symptoms: 'None', remarks: '', notify: false });
  const [error, setError] = useState('');
  const thresholds = useMemo(() => getVitalsThresholds(), []);
  const severity = useMemo(() => {
    const sys = Number(form.systolic_bp); const dia = Number(form.diastolic_bp); const pulse = Number(form.pulse); const spo2 = Number(form.spo2);
    if ((sys && (sys < thresholds.systolic.criticalLow || sys > thresholds.systolic.criticalHigh)) || (dia && (dia < thresholds.diastolic.criticalLow || dia > thresholds.diastolic.criticalHigh)) || (pulse && (pulse < thresholds.pulse.criticalLow || pulse > thresholds.pulse.criticalHigh)) || (spo2 && spo2 < thresholds.spo2.criticalLow)) return 'Critical';
    if ((sys && (sys <= 100 || sys >= 160)) || (dia && (dia <= 55 || dia >= 100)) || (pulse && (pulse <= 59 || pulse >= 101)) || (spo2 && spo2 <= 94)) return 'Warning';
    return '';
  }, [form, thresholds]);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = async () => {
    if (!form.systolic_bp || !form.diastolic_bp || !form.pulse || !form.temperature || !form.spo2) { setError('BP, pulse, temperature and SpO₂ are required.'); return; }
    if (severity === 'Critical') { setError('Critical vital finding must be reviewed before saving.'); return; }
    const result = await createIntradialyticVitals(sessionId, { ...form, observation_time: form.observation_time, bp_systolic: form.systolic_bp, bp_diastolic: form.diastolic_bp, resp_rate: form.respiration, symptoms_ref: form.symptoms, notify_flag: form.notify, recorded_at: new Date().toISOString() });
    if (!result.success) { writeDraft(sessionId, { vitals: form }); setError('Saved as a local draft because the session API is unavailable.'); return; }
    const saved = responseData(result);
    onSaved({ ...form, ...saved, recorded_at: new Date().toISOString() }); go('P3-01');
  };
  return <Card title="Record New Vitals"><div className="during-form-grid"><Field label="Observation time" required><Input type="datetime-local" value={form.observation_time} onChange={update('observation_time')} /></Field><Field label="Systolic BP" required><Input type="number" value={form.systolic_bp} onChange={update('systolic_bp')} /></Field><Field label="Diastolic BP" required><Input type="number" value={form.diastolic_bp} onChange={update('diastolic_bp')} /></Field><Field label="Pulse (bpm)" required><Input type="number" value={form.pulse} onChange={update('pulse')} /></Field><Field label="Respiration"><Input type="number" value={form.respiration} onChange={update('respiration')} /></Field><Field label="Temperature (°C)" required><Input type="number" step="0.1" value={form.temperature} onChange={update('temperature')} /></Field><Field label="SpO₂ (%)" required><Input type="number" value={form.spo2} onChange={update('spo2')} /></Field><Field label="Pain score (0–10)"><Input type="number" min="0" max="10" value={form.pain_score} onChange={update('pain_score')} /></Field><Field label="Consciousness"><Select value={form.consciousness} onChange={update('consciousness')}><option value="Alert">Alert</option><option value="Oriented">Oriented</option><option value="Confused">Confused</option><option value="Lethargic">Lethargic</option><option value="Unresponsive">Unresponsive</option></Select></Field></div><Field label="Symptoms"><Select value={form.symptoms} onChange={update('symptoms')}><option value="None">None</option><option value="Hypotension">Hypotension</option><option value="Chest Pain">Chest Pain</option><option value="Muscle Cramps">Muscle Cramps</option><option value="Nausea/Vomiting">Nausea/Vomiting</option><option value="Shortness of Breath">Shortness of Breath</option></Select></Field><Field label="Remarks"><Textarea maxLength="200" value={form.remarks} onChange={update('remarks')} /></Field>{severity && <div className={`during-alert ${severity.toLowerCase()}`}>{severity}: review the entered vital values.</div>}{error && <div className="during-error">{error}</div>}<div className="during-form-actions"><LibraryButton variant="secondary" onClick={() => setForm((current) => ({ ...current, systolic_bp: '', diastolic_bp: '', pulse: '', temperature: '', spo2: '' }))}>Reset</LibraryButton><LibraryButton variant="primary" onClick={save}>Save Vitals</LibraryButton></div><p className="during-muted">Next due: every 30 minutes · {readings.length} readings recorded</p></Card>;
}

const MACHINE_FIELDS = [['bfr', 'Blood flow rate'], ['dfr', 'Dialysate flow rate'], ['ap', 'Arterial pressure'], ['vp', 'Venous pressure'], ['tmp', 'TMP'], ['conductivity', 'Conductivity'], ['dialysate_temperature', 'Dialysate temperature'], ['uf_rate', 'UF rate'], ['uf_removed', 'UF removed'], ['heparin_rate', 'Heparin infusion rate']];
function MachineForm({ sessionId, go, parameterQuestions = [], patientId }) { const [form, setForm] = useState({}); const [error, setError] = useState(''); const save = async () => { const result = await createMachineParameters(sessionId, { ...form, recorded_at: new Date().toISOString() }); if (!result.success) { setError(responseData(result)?.message || 'Unable to save machine parameters.'); return; } go('P3-01'); }; return <Card title="Machine Parameters"><div className="during-form-grid">{MACHINE_FIELDS.map(([key, label]) => <Field key={key} label={label}><Input type="number" value={form[key] || ''} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} /></Field>)}</div><div className="during-status-grid">{['Power supply', 'Dialysate system', 'Heparin system', 'Air detector', 'Blood leak detector'].map((item) => <LibraryCheckbox key={item} defaultChecked>{item} OK</LibraryCheckbox>)}</div>{parameterQuestions.length > 0 && <div className="during-parameter-history"><h3>Parameter trends</h3>{parameterQuestions.slice(0, 6).map((question) => <ParameterSection key={question.id} title={question.title} isGraph><LineChartDialysis aspect={2} questionId={question.id} user_id={patientId} title={question.title} unit={question.unit} /></ParameterSection>)}</div>}{error && <div className="during-error">{error}</div>}<div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save Parameters</LibraryButton></div></Card>; }

function SimpleLogForm({ title, fields, sessionId, go, criticalCheck, apiCall }) { const [form, setForm] = useState({}); const [error, setError] = useState(''); const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value })); const save = async () => { const missing = fields.filter((f) => f.required && !form[f.key]); if (missing.length) { setError(`Required: ${missing.map((f) => f.label).join(', ')}`); return; } if (criticalCheck?.(form)) { setError('This critical finding requires immediate review and cannot be submitted from this form.'); return; } const result = await apiCall(sessionId, { ...form, recorded_at: new Date().toISOString() }); if (!result.success) { setError(responseData(result)?.message || 'Unable to save this record.'); return; } go('P3-01'); }; return <Card title={title}><div className="during-form-grid">{fields.map((field) => <Field key={field.key} label={field.label} required={field.required}>{field.options ? <Select value={form[field.key] || ''} onChange={update(field.key)}><option value="">Select…</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</Select> : <Input type={field.type || 'text'} value={form[field.key] || ''} onChange={update(field.key)} />}</Field>)}</div>{error && <div className="during-error">{error}</div>}<div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save</LibraryButton></div></Card>; }

function Progress({ session, readings, sessionId, go }) { const [progress, setProgress] = useState({}); const [form, setForm] = useState({ event_time: nowTime(), event_type: '', description: '' }); useEffect(() => { getDuringDialysisProgress(sessionId).then((result) => { if (result.success) setProgress(responseData(result)); }); }, [sessionId]); const latest = readings[readings.length - 1] || {}; const saveEvent = async () => { if (!form.event_type || !form.description) return; const result = await createTreatmentEvent(sessionId, { ...form, recorded_at: new Date().toISOString() }); if (result.success) setForm({ event_time: nowTime(), event_type: '', description: '' }); }; return <><Card title="Treatment Progress"><div className="during-grid six"><Metric label="Session status" value={session?.state || 'RUNNING'} /><Metric label="Vitals readings" value={readings.length} /><Metric label="UF removed" value={progress.uf_achieved ?? latest.uf_removed ?? '—'} /><Metric label="Blood flow" value={progress.blood_processed ?? latest.bfr ?? '—'} /><Metric label="Started" value={session?.started_at ? new Date(session.started_at).toLocaleString() : '—'} /><Metric label="Kt/V" value={progress.kt_v?.value ?? progress.kt_v ?? 'Not available'} /></div></Card><Card title="Add Treatment Event"><div className="during-form-grid"><Field label="Event time" required><Input type="datetime-local" value={form.event_time} onChange={(e) => setForm((v) => ({ ...v, event_time: e.target.value }))} /></Field><Field label="Event type" required><Input value={form.event_type} onChange={(e) => setForm((v) => ({ ...v, event_type: e.target.value }))} /></Field><Field label="Description" required><Textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} /></Field></div><LibraryButton variant="primary" onClick={saveEvent}>Save Event</LibraryButton><LibraryButton variant="outline" onClick={() => go('P3-01')}>Back to Dashboard</LibraryButton></Card></>; }

function Completion({ sessionId, go, onCompleted }) { const [confirmed, setConfirmed] = useState(false); const [error, setError] = useState(''); const end = async () => { if (!confirmed) { setError('Confirm that treatment documentation is complete.'); return; } const result = await endDuringDialysisTreatment(sessionId, { confirmed: true }); if (!result.success) { setError(responseData(result)?.message || 'Unable to complete the session.'); return; } if (onCompleted) onCompleted(responseData(result)); else go('P3-01'); }; return <Card title="Treatment Completion"><div className="during-alert warning">Review the treatment record and ensure all required observations, alarms and incidents are documented before ending treatment.</div><LibraryCheckbox isChecked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>I confirm treatment documentation is complete and it is safe to end this session.</LibraryCheckbox>{error && <div className="during-error">{error}</div>}<LibraryButton variant="danger" onClick={end}>End Treatment</LibraryButton></Card>; }

function DuringDialysisPage({ embedded = false, sessionId: embeddedSessionId, patientData, parameterQuestions = [], patientId, onCompleted }) {
  const { sessionId: routeSessionId, screenId = 'P3-01' } = useParams(); const location = useLocation(); const navigate = useNavigate(); const sessionId = embeddedSessionId || routeSessionId || location.state?.sessionId || 'demo';
  const [active, setActive] = useState(screenId); const [session, setSession] = useState({}); const [readings, setReadings] = useState([]); const patient = useMemo(() => ({ ...initialPatient, ...(patientData || location.state?.patient || {}), name: patientData?.name || patientData?.patient_name || location.state?.patient?.name || location.state?.patient?.patient_name || initialPatient.name }), [patientData, location.state]);
  useEffect(() => { let mounted = true; if (sessionId !== 'demo') Promise.all([getDialysisSessionById(sessionId), getDuringDialysisDashboard(sessionId), getIntradialyticVitals(sessionId)]).then(([s, dashboard, vitals]) => { if (!mounted) return; const sessionData = responseData(s); if (s?.success) setSession({ ...sessionData, dashboard: responseData(dashboard) }); if (vitals?.success) { const data = responseData(vitals); setReadings(Array.isArray(data) ? data : data.readings || []); } }); return () => { mounted = false; }; }, [sessionId]);
  const go = (id) => { setActive(id); if (!embedded) navigate(`/dialysis/during/${sessionId}/${id}`, { replace: true, state: { sessionId, patient } }); };
  const content = active === 'P3-01' ? <Dashboard go={go} session={session} readings={readings} /> : active === 'P3-02' ? <VitalsForm sessionId={sessionId} readings={readings} onSaved={(entry) => setReadings((v) => [...v, entry])} go={go} /> : active === 'P3-03' ? <MachineForm sessionId={sessionId} go={go} parameterQuestions={parameterQuestions} patientId={patientId || patient.id} /> : active === 'P3-04' ? <SimpleLogForm title="Patient Symptoms & Complications" apiCall={createSymptom} sessionId={sessionId} go={go} fields={[{ key: 'event_time', label: 'Event time', required: true, type: 'datetime-local' }, { key: 'symptom', label: 'Symptom / complication', required: true, options: ['Hypotension', 'Chest Pain', 'Syncope/Dizziness', 'Bleeding', 'Muscle Cramps', 'Nausea/Vomiting', 'Shortness of Breath', 'Other'] }, { key: 'severity', label: 'Severity', required: true, options: ['Mild', 'Moderate', 'Severe'] }, { key: 'intervention', label: 'Intervention / action taken', required: true, options: ['Reassured patient', 'Reduced UF rate', 'Notified nurse/physician', 'Administered medication', 'Continued monitoring', 'Other'] }]} /> : active === 'P3-05' ? <SimpleLogForm title="Vascular Access Monitoring" apiCall={createVascularAccessMonitoring} sessionId={sessionId} go={go} fields={[{ key: 'access_type', label: 'Access type', required: true, options: ['AV Fistula', 'AV Graft', 'Central Venous Catheter'] }, { key: 'needle_security', label: 'Needle / catheter security', required: true, options: ['Secure', 'Loose', 'Dislodged'] }, { key: 'bleeding', label: 'Bleeding', required: true, options: ['None', 'Minimal', 'Excessive'] }, { key: 'infiltration', label: 'Infiltration / extravasation', required: true, options: ['No', 'Yes (Mild)', 'Yes (Severe)'] }, { key: 'blood_flow', label: 'Blood flow adequacy', required: true, options: ['Adequate', 'Inadequate', 'Not assessable'] }, { key: 'overall_status', label: 'Overall access status', required: true, options: ['Good / Functional', 'At Risk', 'Not Functional'] }]} criticalCheck={(f) => f.needle_security === 'Dislodged' || f.bleeding === 'Excessive' || f.infiltration?.startsWith('Yes') || f.blood_flow === 'Inadequate'} /> : active === 'P3-06' ? <SimpleLogForm title="Medication Administration" apiCall={createMedicationAdministration} sessionId={sessionId} go={go} fields={[{ key: 'medication', label: 'Medication', required: true }, { key: 'dose', label: 'Dose', required: true }, { key: 'route', label: 'Route', required: true, options: ['IV', 'Oral', 'Subcutaneous', 'Other'] }, { key: 'administered_at', label: 'Administered at', required: true, type: 'datetime-local' }, { key: 'status', label: 'Administration status', required: true, options: ['Administered', 'Held', 'Refused'] }]} /> : active === 'P3-07' ? <SimpleLogForm title="Alarm Management" apiCall={createAlarm} sessionId={sessionId} go={go} fields={[{ key: 'alarm_time', label: 'Alarm time', required: true, type: 'datetime-local' }, { key: 'alarm_type', label: 'Alarm type', required: true, options: ['Arterial pressure', 'Venous pressure', 'TMP', 'Air detector', 'Blood leak', 'Other'] }, { key: 'action_taken', label: 'Action taken', required: true }, { key: 'resolution_status', label: 'Resolution status', required: true, options: ['Resolved', 'Ongoing'] }, { key: 'patient_impact', label: 'Patient impact', required: true, options: ['No adverse effect', 'Adverse effect'] }]} criticalCheck={(f) => f.resolution_status !== 'Resolved' || f.patient_impact === 'Adverse effect'} /> : active === 'P3-08' ? <Progress session={session} readings={readings} sessionId={sessionId} go={go} /> : active === 'P3-09' ? <SimpleLogForm title="Incident & Event Reporting" apiCall={createIncident} sessionId={sessionId} go={go} fields={[{ key: 'event_time', label: 'Event time', required: true, type: 'datetime-local' }, { key: 'incident_type', label: 'Incident type', required: true, options: ['Clinical event', 'Access complication', 'Medication error', 'Machine malfunction', 'Fall', 'Other'] }, { key: 'description', label: 'Description', required: true }, { key: 'escalation', label: 'Escalation', required: true, options: ['Nurse', 'Nephrologist', 'No escalation'] }, { key: 'outcome', label: 'Outcome', required: true }]} /> : <Completion sessionId={sessionId} go={go} onCompleted={onCompleted} />;
  return <div className={`during-page ${embedded ? 'during-page--embedded' : ''}`}>
    <header className="during-page-header">
      <div>
        <h1>During Dailysis</h1>
      </div>
      <div className="during-page-header-actions">
        <span className="during-session-state">Session active</span>
        <LibraryButton variant="danger" size="sm" onClick={() => go('P3-10')}>End Treatment</LibraryButton>
      </div>
    </header>
    <nav className="during-stepper" aria-label="Session Monitoring screens">
      {SCREENS.map(([id, label], index) => <React.Fragment key={id}>
        <button type="button" className={active === id ? 'active' : ''} onClick={() => go(id)} aria-current={active === id ? 'step' : undefined}>
          <span className="during-step-number">{index + 1}</span><span>{label}</span>
        </button>
        {index < SCREENS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
      </React.Fragment>)}
    </nav>
    <PatientBanner patient={patient} />
    <main className="during-content">{content}</main>
  </div>;
}

export default DuringDialysisPage;
