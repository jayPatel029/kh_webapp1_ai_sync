import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getDialysisSessionById,
  getDuringDialysisDashboard,
  getIntradialyticVitals,
  createIntradialyticVitals,
  createMachineParameters,
  getMachineParameters,
  createSymptom,
  updateSymptom,
  createVascularAccessMonitoring,
  createMedicationAdministration,
  getDueMedications,
  getPatientAllergies,
  createAlarm,
  updateDuringDialysisAlarm,
  getDuringDialysisProgress,
  createTreatmentEvent,
  createIncident,
  getIncidents,
  endDuringDialysisTreatment,
  getOverdueVitals,
  skipOverdueVital,
  skipAllOverdueVitals,
} from '../../ApiCalls/dialysisSessionApis';
import { getVitalsThresholds } from '../../config/vitalsThresholds';
import { getDialysisSystolicIdByTitle, getSystolicIdByTitle } from '../../ApiCalls/readingsApis';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import LineChartDialysis from '../../components/Linechart/Linechart_Dialysis/LineChartDialysis';
import LineChartDialyisisSys from '../../components/Linechart/Linechart_Dialysis/LineChartDialyisisSys';
import LineChartComponentSys from '../../components/linecomponent-sys-dys/LineChartComponentSys';
import DialysisTable from '../../components/table/DialysisTable';
import Table from '../../components/table/table';
import LineChartComponent from '../../components/Linechart/LineChartComponent';
import {
  Button as LibraryButton,
  Input as LibraryInput,
  Select as LibrarySelect,
  Textarea as LibraryTextarea,
  Checkbox as LibraryCheckbox,
  Card as LibraryCard,
  CardBody as LibraryCardBody,
} from '../../component-library';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
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
const getTechnicianId = () => {
  try {
    const raw = localStorage.getItem('id') || localStorage.getItem('userId') || localStorage.getItem('user_id') || localStorage.getItem('technicianId');
    if (raw) return String(raw);
    const token = localStorage.getItem('token');
    if (token && token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.id || payload.user_id || payload.sub || payload.userId || '');
    }
  } catch (_) { /* ignore */ }
  return '';
};
const formatDueTime = (value) => {
  if (!value) return '—';
  try { return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return String(value); }
};

function Field({ label, icon: Icon, children, required }) {
  return (
    <label className="during-field">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {Icon && <Icon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 16 }} />}
        <span>{label}{required && <em> *</em>}</span>
      </span>
      {children}
    </label>
  );
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

const buildCombinedTitle = (title = '', needle = '', replacement = '') => {
  const idx = title.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return title;
  return title.slice(0, idx) + replacement + title.slice(idx + needle.length);
};

const SystolicDiastolicGraph = ({ question, userId, isDialysis = false, aspect = 2 / 1 }) => {
  const [systolicId, setSystolicId] = useState(question?.id ?? null);
  const [loading, setLoading] = useState(false);
  const title = question?.title || '';
  const isSystolic = title.toLowerCase().includes('systolic');
  const isDiastolic = title.toLowerCase().includes('diastolic');
  useEffect(() => {
    let isMounted = true;
    const fetchSystolicId = async () => {
      if (!isDiastolic || isSystolic) { setSystolicId(question?.id ?? null); return; }
      setLoading(true);
      try {
        const response = isDialysis ? await getDialysisSystolicIdByTitle(title) : await getSystolicIdByTitle(title);
        if (isMounted) setSystolicId(response?.data ?? null);
      } catch { if (isMounted) setSystolicId(null); } finally { if (isMounted) setLoading(false); }
    };
    fetchSystolicId(); return () => { isMounted = false; };
  }, [isDialysis, isDiastolic, isSystolic, question?.id, title]);
  if (isDiastolic && loading) return <div className="text-sm text-muted">Loading...</div>;
  if (isDiastolic && !systolicId) return <div className="text-sm text-muted">No systolic ID found.</div>;
  const chartTitle = isSystolic ? buildCombinedTitle(title, 'systolic', ' and Diastolic') : buildCombinedTitle(title, 'diastolic', ' and Systolic');
  if (isDialysis) return <LineChartDialyisisSys aspect={aspect} questionId={isSystolic ? question?.id : systolicId} user_id={userId} title={chartTitle} unit={question?.unit} />;
  return <LineChartComponentSys aspect={aspect} questionId={isSystolic ? question?.id : systolicId} user_id={userId} title={chartTitle} unit={question?.unit} />;
};

const ParameterDetailView = ({ question, userId, isDialysis = false, aspect = 2 / 1, dryWeight = null }) => {
  if (!question) return null;
  const title = question?.title || '';
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, '');
  const isSystolic = title.toLowerCase().includes('systolic');
  const isDiastolic = title.toLowerCase().includes('diastolic');
  const graphNode = isSystolic || isDiastolic ? (
    <SystolicDiastolicGraph question={question} userId={userId} isDialysis={isDialysis} aspect={aspect} />
  ) : isDialysis ? (
    <LineChartDialysis aspect={aspect} questionId={question?.id} user_id={userId} title={title} unit={question?.unit} isPatientProfile={1} />
  ) : (
    <LineChartComponent aspect={aspect} questionId={question?.id} user_id={userId} title={title} unit={question?.unit} isPatientProfile={1} />
  );
  const tableNode = isDialysis ? (
    <DialysisTable questionId={question?.id} user_id={userId} title={title} question={question} isPatientProfile={1} highlightThreshold={normalizedTitle === 'weightafter' ? dryWeight : null} highlightComparator="gt" />
  ) : (
    <Table questionId={question?.id} user_id={userId} title={title} question={question} isPatientProfile={1} />
  );
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 bg-slate-50"><h3 className="text-sm font-semibold text-[#32617d]">Graph</h3></div>
          <div className="p-4">{graphNode}</div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 bg-slate-50"><h3 className="text-sm font-semibold text-[#32617d]">Table</h3></div>
          <div className="p-4">{tableNode}</div>
        </section>
      </div>
      <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Admins can edit chart ranges and enter readings directly from the graph controls.</div>
    </div>
  );
};

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
    const recorded_by = getTechnicianId();
    const recorded_at = new Date().toISOString();
    const result = await createIntradialyticVitals(sessionId, { ...form, observation_time: form.observation_time, bp_systolic: form.systolic_bp, bp_diastolic: form.diastolic_bp, resp_rate: form.respiration, symptoms_ref: form.symptoms, notify_flag: form.notify, recorded_by, recorded_at });
    if (!result.success) { writeDraft(sessionId, { vitals: form }); setError('Saved as a local draft because the session API is unavailable.'); return; }
    const saved = responseData(result);
    onSaved({ ...form, ...saved, recorded_by, recorded_at }); go('P3-01');
  };
  return <><Card title="Record New Vitals"><div className="during-form-grid"><Field label="Observation time" required><Input type="datetime-local" value={form.observation_time} onChange={update('observation_time')} /></Field><Field label="Systolic BP" required><Input type="number" value={form.systolic_bp} onChange={update('systolic_bp')} /></Field><Field label="Diastolic BP" required><Input type="number" value={form.diastolic_bp} onChange={update('diastolic_bp')} /></Field><Field label="Pulse (bpm)" required><Input type="number" value={form.pulse} onChange={update('pulse')} /></Field><Field label="Respiration"><Input type="number" value={form.respiration} onChange={update('respiration')} /></Field><Field label="Temperature (°C)" required><Input type="number" step="0.1" value={form.temperature} onChange={update('temperature')} /></Field><Field label="SpO₂ (%)" required><Input type="number" value={form.spo2} onChange={update('spo2')} /></Field><Field label="Pain score (0–10)"><Input type="number" min="0" max="10" value={form.pain_score} onChange={update('pain_score')} /></Field><Field label="Consciousness"><Select value={form.consciousness} onChange={update('consciousness')}><option value="Alert">Alert</option><option value="Oriented">Oriented</option><option value="Confused">Confused</option><option value="Lethargic">Lethargic</option><option value="Unresponsive">Unresponsive</option></Select></Field></div><Field label="Symptoms"><Select value={form.symptoms} onChange={update('symptoms')}><option value="None">None</option><option value="Hypotension">Hypotension</option><option value="Chest Pain">Chest Pain</option><option value="Muscle Cramps">Muscle Cramps</option><option value="Nausea/Vomiting">Nausea/Vomiting</option><option value="Shortness of Breath">Shortness of Breath</option></Select></Field><Field label="Remarks"><Textarea maxLength="200" value={form.remarks} onChange={update('remarks')} /></Field>{severity && <div className={`during-alert ${severity.toLowerCase()}`}>{severity}: review the entered vital values.</div>}{error && <div className="during-error">{error}</div>}<div className="during-form-actions"><LibraryButton variant="secondary" onClick={() => setForm((current) => ({ ...current, systolic_bp: '', diastolic_bp: '', pulse: '', temperature: '', spo2: '' }))}>Reset</LibraryButton><LibraryButton variant="primary" onClick={save}>Save Vitals</LibraryButton></div><p className="during-muted">Next due: every 30 minutes · {readings.length} readings recorded</p></Card><VitalsTrendChart readings={readings} /></>;
}

function VitalsTrendChart({ readings }) {
  if (!readings?.length) return <Card title="Vitals Trend (2h)"><p className="during-muted">No readings in last 2 hours</p></Card>;
  const rows = readings.slice(-12);
  return (
    <Card title="Vitals Trend (2h)">
      <p className="during-muted" style={{ marginBottom: '8px' }}>Source: GET /sessions/:id/vitals-intradialytic?range=2h — {readings.length} point{readings.length !== 1 ? 's' : ''}</p>
      <div className="during-overdue-table-wrap">
        <table className="during-overdue-table">
          <thead><tr><th>Time</th><th>BP</th><th>Pulse</th><th>SpO₂</th><th>Temp</th><th>Recorded by</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.observation_time ? new Date(r.observation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : r.recorded_at ? new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td>{r.bp_systolic ?? r.systolic_bp ? `${r.bp_systolic ?? r.systolic_bp}/${r.bp_diastolic ?? r.diastolic_bp}` : '—'}</td>
                <td>{r.pulse ?? '—'}</td>
                <td>{r.spo2 ?? '—'}</td>
                <td>{r.temperature ?? '—'}</td>
                <td>{r.recorded_by ?? r.recordedBy ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const ParameterTrendsModal = ({ patientId }) => {
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const handler = (e) => setSelected(e.detail?.question || null);
    window.addEventListener('during:open-parameter', handler);
    return () => window.removeEventListener('during:open-parameter', handler);
  }, []);
  if (!selected) return null;
  return (
    <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '820px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: '700', color: '#32617d', fontSize: '1.2rem', margin: 0 }}>{selected.title}</h2>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#666', lineHeight: 1 }}>×</button>
        </div>
        <ParameterDetailView question={selected} userId={patientId} isDialysis={true} aspect={2 / 1} />
      </div>
    </div>
  );
};

const MACHINE_FIELDS = [['bfr', 'Blood flow rate'], ['dfr', 'Dialysate flow rate'], ['ap', 'Arterial pressure'], ['vp', 'Venous pressure'], ['tmp', 'TMP'], ['conductivity', 'Conductivity'], ['dialysate_temperature', 'Dialysate temperature'], ['uf_rate', 'UF rate'], ['uf_removed', 'UF removed'], ['heparin_rate', 'Heparin infusion rate']];
function MachineForm({ sessionId, go, parameterQuestions = [], patientId }) {
  const [form, setForm] = useState({}); const [error, setError] = useState(''); const [history, setHistory] = useState([]); const [loadingHistory, setLoadingHistory] = useState(false);
  useEffect(() => {
    if (!sessionId || sessionId === 'demo') return;
    setLoadingHistory(true);
    getMachineParameters(sessionId, '2h').then((res) => {
      setLoadingHistory(false);
      if (res?.success) {
        const data = responseData(res);
        const items = Array.isArray(data) ? data : data.items || data.history || data.data || [];
        setHistory(items);
      }
    });
  }, [sessionId]);
  const save = async () => {
    const result = await createMachineParameters(sessionId, { ...form, recorded_at: new Date().toISOString() });
    if (!result.success) {
      const d = responseData(result);
      if (d?.error_code) setError(`${d.error_code}: ${d.message || ''}`);
      else setError(d?.message || 'Unable to save machine parameters.');
      return;
    }
    // refresh history after save
    getMachineParameters(sessionId, '2h').then((res) => {
      if (res?.success) {
        const data = responseData(res);
        const items = Array.isArray(data) ? data : data.items || data.history || data.data || [];
        setHistory(items);
      }
    });
    go('P3-01');
  };
  return <Card title="Machine Parameters">
    <div className="during-form-grid">{MACHINE_FIELDS.map(([key, label]) => <Field key={key} label={label}><Input type="number" value={form[key] || ''} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} /></Field>)}</div>
    <div className="during-status-grid">{['Power supply', 'Dialysate system', 'Heparin system', 'Air detector', 'Blood leak detector'].map((item) => <LibraryCheckbox key={item} defaultChecked>{item} OK</LibraryCheckbox>)}</div>
    {parameterQuestions.length > 0 && (
      <div className="space-y-4 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-lg font-bold text-[#32617d] mb-4 text-center">Dialysis Readings</h3>
          <div className="grid grid-cols-3 gap-2">
            {parameterQuestions.slice(0, 6).map((question, idx) => {
              const hasDialysisSystolic = parameterQuestions.some((q) => q.title?.toLowerCase().includes('systolic'));
              if (question.title?.toLowerCase().includes('diastolic') && hasDialysisSystolic) return null;
              return (
                <button
                  key={question.id ?? idx}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-[#4164df] text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => {
                    // Reuse same modal pattern as patient profile: show ParameterDetailView in overlay
                    const event = new CustomEvent('during:open-parameter', { detail: { question } });
                    window.dispatchEvent(event);
                  }}
                  data-parameter-id={question.id}
                >
                  {question.title}
                </button>
              );
            })}
          </div>
        </div>
        <ParameterTrendsModal parameterQuestions={parameterQuestions} patientId={patientId} />
      </div>
    )}
    <div style={{ marginTop: '16px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Recent Machine Readings (2h)</h3>
      {loadingHistory ? <p className="during-muted">Loading history…</p> : history.length ? (
        <div className="during-overdue-table-wrap"><table className="during-overdue-table"><thead><tr><th>Time</th><th>BFR</th><th>TMP</th><th>VP</th></tr></thead><tbody>{history.slice(0,5).map((h, i) => <tr key={i}><td>{h.recorded_at ? new Date(h.recorded_at).toLocaleTimeString() : '—'}</td><td>{h.bfr ?? h.blood_flow_rate ?? '—'}</td><td>{h.tmp ?? '—'}</td><td>{h.vp ?? h.venous_pressure ?? '—'}</td></tr>)}</tbody></table></div>
      ) : <p className="during-muted">No readings in last 2 hours.</p>}
    </div>
    {error && <div className="during-error">{error}</div>}
    <div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save Parameters</LibraryButton></div>
  </Card>;
}

function SimpleLogForm({ title, fields, sessionId, go, criticalCheck, apiCall }) { const [form, setForm] = useState({}); const [error, setError] = useState(''); const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value })); const save = async () => { const missing = fields.filter((f) => f.required && !form[f.key]); if (missing.length) { setError(`Required: ${missing.map((f) => f.label).join(', ')}`); return; } if (criticalCheck?.(form)) { setError('This critical finding requires immediate review and cannot be submitted from this form.'); return; } const result = await apiCall(sessionId, { ...form, recorded_at: new Date().toISOString() }); if (!result.success) { const d = responseData(result); setError(d?.error_code ? `${d.error_code}: ${d.message || ''}` : d?.message || 'Unable to save this record.'); return; } go('P3-01'); }; return <Card title={title}><div className="during-form-grid">{fields.map((field) => <Field key={field.key} label={field.label} required={field.required}>{field.options ? <Select value={form[field.key] || ''} onChange={update(field.key)}><option value="">Select…</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</Select> : <Input type={field.type || 'text'} value={form[field.key] || ''} onChange={update(field.key)} />}</Field>)}</div>{error && <div className="during-error">{error}</div>}<div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save</LibraryButton></div></Card>; }

function SymptomForm({ sessionId, go }) {
  const [form, setForm] = useState({ event_time: nowTime(), symptom: '', severity: '', intervention: '' });
  const [error, setError] = useState(''); const [info, setInfo] = useState(''); const [lastId, setLastId] = useState(null);
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));
  const save = async () => {
    if (!form.symptom || !form.severity || !form.intervention) { setError('Symptom, severity and intervention are required.'); return; }
    const res = await createSymptom(sessionId, { ...form, recorded_at: new Date().toISOString() });
    if (!res.success) { const d = responseData(res); setError(d?.error_code ? `${d.error_code}: ${d.message}` : d?.message || 'Unable to save.'); return; }
    const d = responseData(res); const id = d.symptom_id || d.id || d.symptomId; if (id) setLastId(id);
    if (d.auto_incident_created) setInfo(`Incident logged — ID ${d.incident_id}. Review on P3-09.`);
    else setInfo('Symptom recorded.');
  };
  const patch = async (status) => {
    if (!lastId) { setError('No symptom to update — create one first.'); return; }
    const res = await updateSymptom(sessionId, lastId, { status });
    if (!res.success) { const d = responseData(res); setError(d?.message || 'Update failed.'); return; }
    setInfo(`Symptom ${lastId} updated to ${status}.`); go('P3-01');
  };
  return <Card title="Patient Symptoms & Complications">
    <div className="during-form-grid">
      <Field label="Event time" required><Input type="datetime-local" value={form.event_time} onChange={update('event_time')} /></Field>
      <Field label="Symptom / complication" required><Select value={form.symptom} onChange={update('symptom')}><option value="">Select…</option>{['Hypotension','Chest Pain','Syncope/Dizziness','Bleeding','Muscle Cramps','Nausea/Vomiting','Shortness of Breath','Other'].map(o => <option key={o} value={o}>{o}</option>)}</Select></Field>
      <Field label="Severity" required><Select value={form.severity} onChange={update('severity')}><option value="">Select…</option>{['Mild','Moderate','Severe'].map(o => <option key={o} value={o}>{o}</option>)}</Select></Field>
      <Field label="Intervention / action taken" required><Select value={form.intervention} onChange={update('intervention')}><option value="">Select…</option>{['Reassured patient','Reduced UF rate','Notified nurse/physician','Administered medication','Continued monitoring','Other'].map(o => <option key={o} value={o}>{o}</option>)}</Select></Field>
    </div>
    {error && <div className="during-error">{error}</div>}{info && <div className="during-alert warning">{info}</div>}
    <div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save Symptom</LibraryButton>{lastId && <><LibraryButton variant="outline" onClick={() => patch('resolved')}>Mark Resolved</LibraryButton><LibraryButton variant="outline" onClick={() => patch('ongoing')}>Mark Ongoing</LibraryButton></>}</div>
  </Card>;
}

function MedicationForm({ sessionId, go, patientId }) {
  const [form, setForm] = useState({ medication: '', dose: '', route: '', administered_at: nowTime(), status: 'Administered', allergy_override_reason: '' });
  const [error, setError] = useState(''); const [info, setInfo] = useState('');
  const [due, setDue] = useState([]); const [allergies, setAllergies] = useState([]); const [showOverride, setShowOverride] = useState(false);
  useEffect(() => {
    if (!sessionId || sessionId === 'demo') return;
    getDueMedications(sessionId).then((r) => { if (r?.success) { const d = responseData(r); setDue(Array.isArray(d) ? d : d.items || d.medications || []); }});
    const pid = patientId;
    if (pid) getPatientAllergies(pid).then((r) => { if (r?.success) { const d = responseData(r); setAllergies(Array.isArray(d) ? d : d.items || d.allergies || []); }});
  }, [sessionId, patientId]);
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));
  const save = async () => {
    if (!form.medication || !form.dose || !form.route || !form.administered_at) { setError('Medication, dose, route and time are required.'); return; }
    const allergyHit = allergies.some((a) => String(a.allergen || a.name || a.medication || '').toLowerCase() === String(form.medication).toLowerCase());
    if (allergyHit && !form.allergy_override_reason) { setShowOverride(true); setError('ERR_ALLERGY_BLOCK: Allergy match — provide override reason.'); return; }
    const payload = { ...form, recorded_at: new Date().toISOString() };
    if (allergyHit && form.allergy_override_reason) payload.allergy_override = { reason: form.allergy_override_reason };
    const res = await createMedicationAdministration(sessionId, payload);
    if (!res.success) {
      const d = responseData(res);
      if (d?.error_code === 'ERR_ALLERGY_BLOCK') { setShowOverride(true); setError(`${d.error_code}: ${d.message}`); return; }
      if (d?.error_code === 'ERR_MEDICATION_EXPIRED') { setError(`${d.error_code}: ${d.message}`); return; }
      setError(d?.message || 'Unable to save.'); return;
    }
    const d = responseData(res); if (d.auto_incident_created) setInfo(`Incident auto-created (ID ${d.incident_id}) due to adverse reaction.`);
    go('P3-01');
  };
  return <Card title="Medication Administration">
    {due.length > 0 && <div style={{ marginBottom: '12px' }}><strong>Due medications:</strong> {due.map((m) => m.name || m.medication || m.medication_name).join(', ')}</div>}
    {allergies.length > 0 && <div className="during-alert warning" style={{ marginBottom: '12px' }}>Allergies on file: {allergies.map((a) => a.allergen || a.name).join(', ')}</div>}
    <div className="during-form-grid">
      <Field label="Medication" required><Input value={form.medication} onChange={update('medication')} /></Field>
      <Field label="Dose" required><Input value={form.dose} onChange={update('dose')} /></Field>
      <Field label="Route" required><Select value={form.route} onChange={update('route')}><option value="">Select…</option>{['IV','Oral','Subcutaneous','Other'].map(o => <option key={o} value={o}>{o}</option>)}</Select></Field>
      <Field label="Administered at" required><Input type="datetime-local" value={form.administered_at} onChange={update('administered_at')} /></Field>
      <Field label="Administration status" required><Select value={form.status} onChange={update('status')}><option value="Administered">Administered</option><option value="Held">Held</option><option value="Refused">Refused</option></Select></Field>
      {showOverride && <Field label="Allergy override reason" required><Textarea value={form.allergy_override_reason} onChange={update('allergy_override_reason')} placeholder="Required when allergy match" maxLength={300} /></Field>}
    </div>
    {error && <div className="during-error">{error}</div>}{info && <div className="during-alert warning">{info}</div>}
    <div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save Medication</LibraryButton></div>
  </Card>;
}

function AlarmForm({ sessionId, go }) {
  const [form, setForm] = useState({ alarm_time: nowTime(), alarm_type: '', action_taken: '', resolution_status: '', patient_impact: '' });
  const [error, setError] = useState(''); const [lastId, setLastId] = useState(null);
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));
  const save = async () => {
    if (!form.alarm_type || !form.action_taken || !form.resolution_status) { setError('Alarm type, Action Taken and Resolution Status are required (ERR_ALARM_ACTION_REQUIRED).'); return; }
    const res = await createAlarm(sessionId, { ...form, recorded_at: new Date().toISOString() });
    if (!res.success) { const d = responseData(res); setError(d?.error_code ? `${d.error_code}: ${d.message}` : d?.message || 'Unable to save alarm.'); return; }
    const d = responseData(res); const id = d.alarm_id || d.id; if (id) setLastId(id);
    if (d.auto_incident_created) setError(`Incident auto-created (ID ${d.incident_id}) — unresolved or adverse effect.`);
    else go('P3-01');
  };
  const patch = async (resolution_status) => {
    if (!lastId) { setError('No alarm to update — create one first.'); return; }
    const res = await updateDuringDialysisAlarm(sessionId, lastId, { resolution_status });
    if (!res.success) { const d = responseData(res); setError(d?.message || 'Update failed.'); return; }
    go('P3-01');
  };
  return <Card title="Alarm Management">
    <div className="during-form-grid">
      <Field label="Alarm time" required><Input type="datetime-local" value={form.alarm_time} onChange={update('alarm_time')} /></Field>
      <Field label="Alarm type" required><Select value={form.alarm_type} onChange={update('alarm_type')}><option value="">Select…</option>{['Arterial pressure','Venous pressure','TMP','Air detector','Blood leak','Other'].map(o => <option key={o} value={o}>{o}</option>)}</Select></Field>
      <Field label="Action taken" required><Input value={form.action_taken} onChange={update('action_taken')} /></Field>
      <Field label="Resolution status" required><Select value={form.resolution_status} onChange={update('resolution_status')}><option value="">Select…</option><option value="Resolved">Resolved</option><option value="Ongoing">Ongoing</option></Select></Field>
      <Field label="Patient impact" required><Select value={form.patient_impact} onChange={update('patient_impact')}><option value="">Select…</option><option value="No adverse effect">No adverse effect</option><option value="Adverse effect">Adverse effect</option></Select></Field>
    </div>
    {error && <div className="during-error">{error}</div>}
    <div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save Alarm</LibraryButton>{lastId && <LibraryButton variant="outline" onClick={() => patch('Resolved')}>Mark Resolved</LibraryButton>}</div>
  </Card>;
}

function IncidentsView({ sessionId, go }) {
  const [form, setForm] = useState({ event_time: nowTime(), incident_type: '', description: '', escalation: '', outcome: '' });
  const [error, setError] = useState(''); const [list, setList] = useState([]); const [counts, setCounts] = useState(null);
  const fetchList = () => {
    if (!sessionId || sessionId === 'demo') return;
    getIncidents(sessionId).then((r) => {
      if (r?.success) {
        const d = responseData(r);
        const items = Array.isArray(d) ? d : d.items || d.incidents || d.data || [];
        setList(items);
        if (d.counts || d.overview) setCounts(d.counts || d.overview);
      }
    });
  };
  useEffect(fetchList, [sessionId]);
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));
  const save = async () => {
    if (!form.incident_type || !form.description) { setError('Incident type and description are required.'); return; }
    const res = await createIncident(sessionId, { ...form, recorded_at: new Date().toISOString() });
    if (!res.success) { const d = responseData(res); setError(d?.message || 'Unable to save incident.'); return; }
    fetchList(); setForm((v) => ({ ...v, description: '', outcome: '' })); setError('');
  };
  return <>
    <Card title="Incident & Event Reporting — Existing Incidents">
      {counts && <p className="during-muted">Counts: {JSON.stringify(counts)}</p>}
      {list.length ? <div className="during-overdue-table-wrap"><table className="during-overdue-table"><thead><tr><th>Time</th><th>Type</th><th>Description</th></tr></thead><tbody>{list.slice(0,10).map((it, i) => <tr key={i}><td>{it.event_time ? new Date(it.event_time).toLocaleString() : '—'}</td><td>{it.incident_type || it.type || '—'}</td><td>{it.description || '—'}</td></tr>)}</tbody></table></div> : <p className="during-muted">No incidents yet</p>}
    </Card>
    <Card title="Report New Incident">
      <div className="during-form-grid">
        <Field label="Event time" required><Input type="datetime-local" value={form.event_time} onChange={update('event_time')} /></Field>
        <Field label="Incident type" required><Select value={form.incident_type} onChange={update('incident_type')}><option value="">Select…</option>{['Clinical event','Access complication','Medication error','Machine malfunction','Fall','Other'].map(o => <option key={o} value={o}>{o}</option>)}</Select></Field>
        <Field label="Description" required><Textarea value={form.description} onChange={update('description')} /></Field>
        <Field label="Escalation" required><Select value={form.escalation} onChange={update('escalation')}><option value="">Select…</option><option value="Nurse">Nurse</option><option value="Nephrologist">Nephrologist</option><option value="No escalation">No escalation</option></Select></Field>
        <Field label="Outcome" required><Input value={form.outcome} onChange={update('outcome')} /></Field>
      </div>
      {error && <div className="during-error">{error}</div>}
      <div className="during-form-actions"><LibraryButton variant="primary" onClick={save}>Save Incident</LibraryButton><LibraryButton variant="outline" onClick={() => go('P3-01')}>Back to Dashboard</LibraryButton></div>
    </Card>
  </>;
}

function Progress({ session, readings, sessionId, go }) { const [progress, setProgress] = useState({}); const [form, setForm] = useState({ event_time: nowTime(), event_type: '', description: '' }); useEffect(() => { getDuringDialysisProgress(sessionId).then((result) => { if (result.success) setProgress(responseData(result)); }); }, [sessionId]); const latest = readings[readings.length - 1] || {}; const saveEvent = async () => { if (!form.event_type || !form.description) return; const result = await createTreatmentEvent(sessionId, { ...form, recorded_at: new Date().toISOString() }); if (result.success) setForm({ event_time: nowTime(), event_type: '', description: '' }); }; return <><Card title="Treatment Progress"><div className="during-grid six"><Metric label="Session status" value={session?.state || 'RUNNING'} /><Metric label="Vitals readings" value={readings.length} /><Metric label="UF removed" value={progress.uf_achieved ?? latest.uf_removed ?? '—'} /><Metric label="Blood flow" value={progress.blood_processed ?? latest.bfr ?? '—'} /><Metric label="Started" value={session?.started_at ? new Date(session.started_at).toLocaleString() : '—'} /><Metric label="Kt/V" value={progress.kt_v?.value ?? progress.kt_v ?? 'Not available'} /></div></Card><Card title="Add Treatment Event"><div className="during-form-grid"><Field label="Event time" required><Input type="datetime-local" value={form.event_time} onChange={(e) => setForm((v) => ({ ...v, event_time: e.target.value }))} /></Field><Field label="Event type" required><Input value={form.event_type} onChange={(e) => setForm((v) => ({ ...v, event_type: e.target.value }))} /></Field><Field label="Description" required><Textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} /></Field></div><LibraryButton variant="primary" onClick={saveEvent}>Save Event</LibraryButton><LibraryButton variant="outline" onClick={() => go('P3-01')}>Back to Dashboard</LibraryButton></Card></>; }

function Completion({ sessionId, go, onCompleted, patient }) {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const end = async () => {
    if (!confirmed) { setError('Confirm that treatment documentation is complete.'); return; }
    const result = await endDuringDialysisTreatment(sessionId, { confirmed: true });
    if (!result.success) { setError(responseData(result)?.message || 'Unable to complete the session.'); return; }
    if (onCompleted) { onCompleted(responseData(result)); return; }
    // Whole-workflow handoff: P3-10 Completion → P4-01 Blood Return & Termination
    navigate(`/dialysis/post/${sessionId}/P4-01`, { state: { sessionId, patient } });
  };
  return <Card title="Treatment Completion"><div className="during-alert warning">Review the treatment record and ensure all required observations, alarms and incidents are documented before ending treatment.</div><LibraryCheckbox isChecked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>I confirm treatment documentation is complete and it is safe to end this session.</LibraryCheckbox>{error && <div className="during-error">{error}</div>}<LibraryButton variant="danger" onClick={end}>End Treatment</LibraryButton></Card>;
}

function OverdueVitalsModal({ items, open, onClose, onSkip, onSkipAll, onRowNavigate }) {
  const [activeId, setActiveId] = useState(null);
  const [reason, setReason] = useState('');
  const [skipAllReason, setSkipAllReason] = useState('');
  const [showSkipAllConfirm, setShowSkipAllConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!open || !items?.length) return null;
  const handleSkip = async (item) => {
    const id = item.log_id ?? item.id ?? item.overdue_id;
    if (activeId !== id) { setActiveId(id); setReason(''); return; }
    setSaving(true);
    const ok = await onSkip(id, reason);
    setSaving(false);
    if (ok) { setActiveId(null); setReason(''); }
  };
  const handleSkipAll = async () => {
    if (!showSkipAllConfirm) { setShowSkipAllConfirm(true); return; }
    setSaving(true);
    const ok = await onSkipAll(skipAllReason);
    setSaving(false);
    if (ok) { setShowSkipAllConfirm(false); setSkipAllReason(''); }
  };
  return (
    <div className="during-overdue-overlay" role="dialog" aria-modal="true" aria-label="Overdue Vitals">
      <div className="during-overdue-modal">
        <div className="during-overdue-header">
          <h3>Overdue Vitals</h3>
          <span className="during-overdue-count">{items.length} overdue</span>
        </div>
        <p className="during-muted">Vitals recording is overdue for the patients below. Record the vitals or skip with a reason. Skipping permanently reduces compliance and alerts the nephrologist.</p>
        <div className="during-overdue-table-wrap">
          <table className="during-overdue-table">
            <thead><tr><th>Patient</th><th>Bed</th><th>Due Time</th><th>Overdue</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => {
                const id = it.log_id ?? it.id ?? it.overdue_id;
                const isActive = activeId === id;
                return (
                  <React.Fragment key={String(id)}>
                    <tr className="during-overdue-row" onClick={() => onRowNavigate(it)} style={{ cursor: 'pointer' }}>
                      <td>{it.patient_name || it.patientName || it.name || `Patient ${it.patient_id}`}</td>
                      <td>{it.bed || it.bed_id || it.bedId || '—'}</td>
                      <td>{formatDueTime(it.due_time || it.dueTime)}</td>
                      <td>{it.minutes_overdue ?? it.minutesOverdue ?? it.overdue_minutes ?? '—'} min</td>
                      <td><LibraryButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleSkip(it); }} disabled={saving}>{isActive ? 'Confirm Skip' : 'Skip'}</LibraryButton></td>
                    </tr>
                    {isActive && (
                      <tr className="during-overdue-reason-row">
                        <td colSpan={5}>
                          <div className="during-overdue-reason">
                            <span>Skip {it.patient_name || 'patient'}&apos;s {formatDueTime(it.due_time || it.dueTime)} reading?</span>
                            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional, 0/200)" maxLength={200} />
                            <div className="during-overdue-reason-actions">
                              <LibraryButton variant="outline" size="sm" onClick={() => { setActiveId(null); setReason(''); }} disabled={saving}>Cancel</LibraryButton>
                              <LibraryButton variant="primary" size="sm" onClick={() => handleSkip(it)} disabled={saving}>{saving ? 'Skipping…' : 'Confirm Skip'}</LibraryButton>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="during-overdue-footer">
          {!showSkipAllConfirm ? (
            <LibraryButton variant="danger" size="sm" onClick={handleSkipAll} disabled={saving || !items.length}>Skip All ({items.length})</LibraryButton>
          ) : (
            <div className="during-overdue-skipall-confirm">
              <span>Skip all {items.length} overdue readings?</span>
              <Textarea value={skipAllReason} onChange={(e) => setSkipAllReason(e.target.value)} placeholder="Reason (optional, applies to all, 0/200)" maxLength={200} />
              <div className="during-overdue-reason-actions">
                <LibraryButton variant="outline" size="sm" onClick={() => { setShowSkipAllConfirm(false); setSkipAllReason(''); }} disabled={saving}>Cancel</LibraryButton>
                <LibraryButton variant="danger" size="sm" onClick={handleSkipAll} disabled={saving}>{saving ? 'Skipping…' : 'Confirm Skip All'}</LibraryButton>
              </div>
            </div>
          )}
          <LibraryButton variant="outline" size="sm" onClick={onClose}>Dismiss</LibraryButton>
        </div>
        <p className="during-muted" style={{ fontSize: '11px', marginTop: '8px' }}>Clicking a row opens that patient&apos;s P3-02 to record vitals. Dismiss reopens automatically while items remain overdue.</p>
      </div>
    </div>
  );
}

function DuringDialysisPage({ embedded = false, sessionId: embeddedSessionId, patientData, parameterQuestions = [], patientId, onCompleted }) {
  const { sessionId: routeSessionId, screenId: paramScreenId } = useParams(); const location = useLocation(); const navigate = useNavigate();
  // Canonical parse: /dialysis/during/:sessionId/:screenId — but /dialysis/during/P3-02 (no sessionId) puts screenId in :sessionId
  const isScreenId = (v) => /^P[34]-/.test(String(v || ''));
  let resolvedRouteSessionId = routeSessionId;
  let resolvedScreenId = paramScreenId;
  if (isScreenId(routeSessionId) && !isScreenId(paramScreenId)) {
    resolvedScreenId = routeSessionId;
    resolvedRouteSessionId = '';
  }
  const screenId = resolvedScreenId || 'P3-01';
  // Query param support: ?sessionId=123 or ?session_id=123
  const querySessionId = (() => { try { const sp = new URLSearchParams(location.search); return sp.get('sessionId') || sp.get('session_id') || sp.get('sessionID') || ''; } catch { return ''; } })();
  // persisted id: sessionStorage is per-tab (fresh), localStorage is cross-tab fallback for hard reload / stage-bar nav
  const persistedSessionId = (() => { try { return sessionStorage.getItem('lastDialysisSessionId') || localStorage.getItem('lastDialysisSessionId') || ''; } catch { return ''; } })();
  const rawSessionId = embeddedSessionId || resolvedRouteSessionId || location.state?.sessionId || location.state?.session_id || location.state?.sessionID || querySessionId || persistedSessionId || '';
  const sessionId = String(rawSessionId || '').trim();
  const isDemo = sessionId === 'demo';
  const hasSession = !!sessionId && !isDemo;
  const missingSession = !hasSession && !embedded;
  // persist for refresh / back navigation — only when we have a real session
  useEffect(() => {
    if (hasSession) {
      try {
        sessionStorage.setItem('lastDialysisSessionId', sessionId);
        localStorage.setItem('lastDialysisSessionId', sessionId);
        const pid = String(patientId || patientData?.id || location.state?.patient?.id || location.state?.patientId || '');
        if (pid) { localStorage.setItem('lastDialysisPatientId', pid); sessionStorage.setItem('lastDialysisPatientId', pid); }
        const pData = patientData || location.state?.patient;
        if (pData) localStorage.setItem('lastDialysisPatientData', JSON.stringify(pData));
      } catch {}
    }
  }, [sessionId, hasSession, patientId, patientData, location.state]);
  const [active, setActive] = useState(screenId);
  // keep active tab in sync with URL
  useEffect(() => { setActive(screenId); }, [screenId]);
  const [session, setSession] = useState({}); const [readings, setReadings] = useState([]); const patient = useMemo(() => ({ ...initialPatient, ...(patientData || location.state?.patient || {}), name: patientData?.name || patientData?.patient_name || location.state?.patient?.name || location.state?.patient?.patient_name || initialPatient.name }), [patientData, location.state]);
  const technicianId = useMemo(() => getTechnicianId(), []);
  const [overdue, setOverdue] = useState([]); const [overdueOpen, setOverdueOpen] = useState(false);
  useEffect(() => {
    let mounted = true;
    if (!hasSession) return () => { mounted = false; };
    Promise.all([getDialysisSessionById(sessionId), getDuringDialysisDashboard(sessionId), getIntradialyticVitals(sessionId)]).then(([s, dashboard, vitals]) => { if (!mounted) return; const sessionData = responseData(s); if (s?.success) setSession({ ...sessionData, dashboard: responseData(dashboard) }); if (vitals?.success) { const data = responseData(vitals); setReadings(Array.isArray(data) ? data : data.readings || []); } });
    return () => { mounted = false; };
  }, [sessionId, hasSession]);
  useEffect(() => {
    if (!technicianId) return;
    let mounted = true; let timer;
    const fetchOverdue = async () => {
      const res = await getOverdueVitals(technicianId);
      if (!mounted) return;
      if (res?.success) {
        const data = responseData(res);
        const items = Array.isArray(data) ? data : data.items || data.overdue || data.data || [];
        setOverdue(items);
        if (items.length > 0) setOverdueOpen(true);
        else setOverdueOpen(false);
      } else if (res?.data?.error_code === 'ERR_FORBIDDEN_ROLE') {
        // Technician can only view own overdue list — suppress polling if forbidden
        setOverdue([]); setOverdueOpen(false);
      }
    };
    fetchOverdue();
    timer = setInterval(fetchOverdue, 60000);
    return () => { mounted = false; clearInterval(timer); };
  }, [technicianId]);
  const refreshOverdue = async () => {
    if (!technicianId) return;
    const res = await getOverdueVitals(technicianId);
    if (res?.success) {
      const data = responseData(res);
      const items = Array.isArray(data) ? data : data.items || data.overdue || data.data || [];
      setOverdue(items); setOverdueOpen(items.length > 0);
    }
  };
  const handleSkip = async (logId, reason) => {
    const res = await skipOverdueVital(logId, reason ? { reason } : {});
    if (res?.success) { await refreshOverdue(); return true; }
    return false;
  };
  const handleSkipAll = async (reason) => {
    if (!technicianId || !overdue.length) return false;
    const logIds = overdue.map((it) => it.log_id ?? it.id ?? it.overdue_id).filter(Boolean);
    const res = await skipAllOverdueVitals({ technician_id: Number(technicianId) || technicianId, log_ids: logIds, ...(reason ? { reason } : {}) });
    if (res?.success) { await refreshOverdue(); return true; }
    return false;
  };
  const handleOverdueRowNavigate = (item) => {
    const targetSession = String(item.session_id ?? item.sessionId ?? sessionId);
    const target = `/dialysis/during/${targetSession}/P3-02`;
    if (targetSession === String(sessionId)) { go('P3-02'); }
    else { navigate(target, { state: { sessionId: targetSession } }); }
    setOverdueOpen(false);
  };
  const go = (id) => { setActive(id); if (!embedded && hasSession) navigate(`/dialysis/during/${sessionId}/${id}`, { replace: true, state: { sessionId, patient } }); else if (!embedded) setActive(id); };
  const missingBanner = missingSession ? <div className="during-card" style={{borderColor:'#f59e0b',background:'#fffbeb'}}><h2 style={{color:'#92400e',margin:'0 0 6px'}}>No active session</h2><p className="during-muted">No session ID in URL (<code>/dialysis/during/:sessionId/:screenId</code>), state, or <code>?sessionId=</code>. P3-02…P3-10 are still navigable for preview, but saves will be disabled until a session is opened from <code>/dialysis/patients</code> → Start Dialysis. Stale localStorage is no longer used to silently load a previous patient's session.</p><p className="during-muted">Tried: embedded={String(embedded)}, route :sessionId={String(routeSessionId||'')}, query ?sessionId={String(querySessionId||'')}, state {String(location.state?.sessionId||'')}</p></div> : null;
  const content = active === 'P3-01' ? <Dashboard go={go} session={session} readings={readings} /> : active === 'P3-02' ? <VitalsForm sessionId={sessionId || 'preview'} readings={readings} onSaved={(entry) => setReadings((v) => [...v, entry])} go={go} /> : active === 'P3-03' ? <MachineForm sessionId={sessionId || 'preview'} go={go} parameterQuestions={parameterQuestions} patientId={patientId || patient.id} /> : active === 'P3-04' ? <SymptomForm sessionId={sessionId || 'preview'} go={go} /> : active === 'P3-05' ? <SimpleLogForm title="Vascular Access Monitoring" apiCall={createVascularAccessMonitoring} sessionId={sessionId || 'preview'} go={go} fields={[{ key: 'access_type', label: 'Access type', required: true, options: ['AV Fistula', 'AV Graft', 'Central Venous Catheter'] }, { key: 'needle_security', label: 'Needle / catheter security', required: true, options: ['Secure', 'Loose', 'Dislodged'] }, { key: 'bleeding', label: 'Bleeding', required: true, options: ['None', 'Minimal', 'Excessive'] }, { key: 'infiltration', label: 'Infiltration / extravasation', required: true, options: ['No', 'Yes (Mild)', 'Yes (Severe)'] }, { key: 'blood_flow', label: 'Blood flow adequacy', required: true, options: ['Adequate', 'Inadequate', 'Not assessable'] }, { key: 'overall_status', label: 'Overall access status', required: true, options: ['Good / Functional', 'At Risk', 'Not Functional'] }]} criticalCheck={(f) => f.needle_security === 'Dislodged' || f.bleeding === 'Excessive' || f.infiltration?.startsWith('Yes') || f.blood_flow === 'Inadequate'} /> : active === 'P3-06' ? <MedicationForm sessionId={sessionId || 'preview'} go={go} patientId={patientId || patient.id} /> : active === 'P3-07' ? <AlarmForm sessionId={sessionId || 'preview'} go={go} /> : active === 'P3-08' ? <Progress session={session} readings={readings} sessionId={sessionId || 'preview'} go={go} /> : active === 'P3-09' ? <IncidentsView sessionId={sessionId || 'preview'} go={go} /> : <Completion sessionId={sessionId || 'preview'} go={go} onCompleted={onCompleted} patient={patient} />;
  return <div className={`during-page ${embedded ? 'during-page--embedded' : ''}`}>
    {missingBanner}
    <header className="during-page-header">
      <div>
        <h1>During Dailysis</h1>
      </div>
      <div className="during-page-header-actions">
        <span className="during-session-state">{hasSession ? `Session ${sessionId} active` : 'No session — preview'}</span>
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
    <OverdueVitalsModal
      items={overdue}
      open={overdueOpen}
      onClose={() => setOverdueOpen(false)}
      onSkip={handleSkip}
      onSkipAll={handleSkipAll}
      onRowNavigate={handleOverdueRowNavigate}
    />
    <main className="during-content">{content}</main>
  </div>;
}

export default DuringDialysisPage;
