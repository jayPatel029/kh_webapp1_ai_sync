import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getDialysisSessionById,
  getDuringDialysisDashboard,
  getIntradialyticVitals,
  createIntradialyticVitals,
  createMachineParameters,
  getMachineParameters,
  createSymptom,
  getSymptoms,
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
import P303MachineParameters from './P303MachineParameters';
import { ParameterDetailView } from '../userprofile2/UserProfile';
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
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SentimentNeutralOutlinedIcon from '@mui/icons-material/SentimentNeutralOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
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

function PatientBanner({ patient = {}, session = {} }) {
  const patientName = patient.name || patient.patient_name || 'Ramesh Kumar';
  const pid = patient.pid || patient.patient_id || 'P10023';
  const ageGender = patient.age && patient.gender ? `${patient.age} Years, ${patient.gender}` : '58 Years, Male';
  const bloodGroup = patient.bloodGroup || patient.blood_group || 'O+';
  const dateStr = session.date || '26 May 2025 (Mon)';
  const shiftStr = session.shift || 'Morning (07:00 AM)';
  const bedStr = session.bed || patient.bed || 'B-02';
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const accessType = patient.access || session.access || 'AV Fistula (Left)';
  const prescribedBFR = session.prescribedBFR || '300 mL/min';
  const prescribedDFR = session.prescribedDFR || '500 mL/min';
  const ufGoal = session.ufGoal || '2.40 L';
  const elapsedTime = session.elapsedTime || '01:32 Elapsed';

  return (
    <div className="during-existing-patient-card">
      <div className="p303-patient-banner">
        <div className="p303-patient-main">
          <div className="p303-patient-avatar">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <span>{patientName.charAt(0)}</span>
            )}
          </div>
          <div className="p303-patient-details">
            <div className="p303-patient-title-row">
              <h2>{patientName}</h2>
              <span className="p303-status-active">Active</span>
            </div>
            <div className="p303-patient-meta">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p303-dot">•</span>
              <span>{ageGender}</span>
              <span className="p303-dot">•</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p303-patient-submeta">
              <span>Date: <strong>{dateStr}</strong></span>
              <span className="p303-dot">•</span>
              <span>Shift: <strong>{shiftStr}</strong></span>
              <span className="p303-dot">•</span>
              <span>Bed: <strong>{bedStr}</strong></span>
              <span className="p303-dot">•</span>
              <span>Machine: <strong>{machineModel}</strong></span>
            </div>
          </div>
        </div>

        <div className="p303-patient-pills">
          <div className="p303-pill-item">
            <span className="p303-pill-label">Access Type</span>
            <strong className="p303-pill-val">{accessType}</strong>
          </div>
          <div className="p303-pill-item">
            <span className="p303-pill-label">Prescribed BFR</span>
            <strong className="p303-pill-val">{prescribedBFR}</strong>
          </div>
          <div className="p303-pill-item">
            <span className="p303-pill-label">Prescribed DFR</span>
            <strong className="p303-pill-val">{prescribedDFR}</strong>
          </div>
          <div className="p303-pill-item">
            <span className="p303-pill-label">UF Goal</span>
            <strong className="p303-pill-val">{ufGoal}</strong>
          </div>
          <div className="p303-pill-item">
            <span className="p303-pill-label">Session Time</span>
            <strong className="p303-pill-val p303-pill-highlight">{elapsedTime}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }) { return <div className="during-metric"><small>{label}</small><strong>{value}</strong>{hint && <span>{hint}</span>}</div>; }

function TreatmentProgressRingSVG({ percent = 0 }) {
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const validPercent = Math.max(0, Math.min(100, Number(percent) || 0));
  const offset = circumference - (validPercent / 100) * circumference;

  return (
    <div className="during-svg-ring-container">
      <div className="during-svg-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="during-svg-ring-content">
          <strong>{validPercent}%</strong>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

function UfProgressRingSVG({ removed = 0, target = 1 }) {
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const numRemoved = Number(removed) || 0;
  const numTarget = Math.max(0.1, Number(target) || 1);
  const ratio = Math.max(0, Math.min(1, numRemoved / numTarget));
  const offset = circumference - ratio * circumference;

  return (
    <div className="during-svg-ring-container">
      <div className="during-svg-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#dbeafe"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#0284c7"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="during-svg-ring-content">
          <strong style={{ color: '#0284c7' }}>{numRemoved.toFixed(2)} L</strong>
          <span>Removed</span>
        </div>
      </div>
    </div>
  );
}

function BloodFlowGaugeSVG({ bfr = 300, prescribedBfr = 300 }) {
  const currentBfr = Math.max(0, Math.min(600, Number(bfr) || 0));
  const prescribed = Math.max(0, Math.min(600, Number(prescribedBfr) || 300));
  const angle = (currentBfr / 600) * 180 - 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = 80 + 55 * Math.cos(rad);
  const needleY = 80 + 55 * Math.sin(rad);

  const prescribedAngle = (prescribed / 600) * 180 - 180;
  const prescribedRad = (prescribedAngle * Math.PI) / 180;
  const tickX1 = 80 + 44 * Math.cos(prescribedRad);
  const tickY1 = 80 + 44 * Math.sin(prescribedRad);
  const tickX2 = 80 + 64 * Math.cos(prescribedRad);
  const tickY2 = 80 + 64 * Math.sin(prescribedRad);

  return (
    <div className="during-gauge-wrap">
      <svg width="160" height="95" viewBox="0 0 160 95">
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke="#2563eb"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="188.5"
          strokeDashoffset={188.5 - (currentBfr / 600) * 188.5}
        />
        <line
          x1={tickX1}
          y1={tickY1}
          x2={tickX2}
          y2={tickY2}
          stroke="#dc2626"
          strokeWidth="3"
        />
        <circle cx="80" cy="80" r="6" fill="#1e293b" />
        <line
          x1="80"
          y1="80"
          x2={needleX}
          y2={needleY}
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="during-gauge-value-callout">
        <strong>{currentBfr}</strong>
        <span>mL/min</span>
      </div>
      <div className="during-gauge-prescribed">
        Prescribed: {prescribed} mL/min
      </div>
    </div>
  );
}

function TrendBadge({ trend }) {
  if (trend === 'up') return <span className="during-trend up">↑</span>;
  if (trend === 'down') return <span className="during-trend down">↓</span>;
  return <span className="during-trend stable">→</span>;
}

function Dashboard({ go, session, readings, sessionId, patient }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!sessionId || sessionId === 'demo') {
      setLoading(false);
      return;
    }
    try {
      const res = await getDuringDialysisDashboard(sessionId);
      if (res?.success) {
        setDashboardData(responseData(res));
        setFetchError(null);
      } else {
        setFetchError(res?.data?.message || 'Unable to fetch dashboard update');
      }
    } catch (err) {
      setFetchError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    let isMounted = true;
    fetchDashboard();
    const interval = setInterval(() => {
      if (isMounted) fetchDashboard();
    }, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchDashboard]);

  const latest = readings[readings.length - 1] || {};
  const startedAtDate = session?.started_at ? new Date(session.started_at) : new Date();
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - startedAtDate.getTime()) / 60000));
  const totalMinutes = Number(session?.prescribed_duration_minutes || 240);
  const calcPercent = Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100));

  const formatHoursMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const progressData = dashboardData?.progress || {};
  const ufData = dashboardData?.uf || {};
  const machineStatus = dashboardData?.machine_status || {};
  const latestVitals = dashboardData?.latest_vitals || {};
  const latestMachineParams = dashboardData?.latest_machine_params || {};
  const activeAlerts = dashboardData?.active_alerts || dashboardData?.unresolved?.alarms || [];
  const deferredConsent = dashboardData?.deferred_consent || false;

  const percent = progressData.percent ?? calcPercent;
  const elapsedTimeStr = progressData.elapsed_formatted || formatHoursMins(progressData.elapsed ?? elapsedMinutes);
  const remainingTimeStr = progressData.remaining_formatted || formatHoursMins(progressData.remaining ?? Math.max(0, totalMinutes - elapsedMinutes));
  const totalTimeStr = progressData.total_formatted || formatHoursMins(progressData.total ?? totalMinutes);
  const startedAtStr = progressData.started_at ? new Date(progressData.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : startedAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const expectedEndStr = progressData.expected_end ? new Date(progressData.expected_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(startedAtDate.getTime() + totalMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const ufRemoved = Number(ufData.removed ?? latest.uf_removed ?? 0.0);
  const ufTarget = Number(ufData.target ?? session?.target_uf ?? 2.4);
  const ufRemaining = Number(ufData.remaining ?? Math.max(0, ufTarget - ufRemoved));
  const ufRate = ufData.rate ?? latest.uf_rate ?? 500;

  const bfr = machineStatus.bfr ?? latest.bfr ?? 300;
  const dfr = machineStatus.dfr ?? latest.dfr ?? 500;
  const prescribedBfr = machineStatus.prescribed_bfr ?? 300;
  const machineModel = machineStatus.model || session?.machine_model || 'Fresenius 4008S';
  const dialyzer = machineStatus.dialyzer || session?.dialyzer || 'F6HPS';
  const isRunning = machineStatus.running !== false;
  const alarmSummary = machineStatus.alarms || (activeAlerts.length > 0 ? `${activeAlerts.length} Active Alarms` : 'No Active Alarms');

  const bpVal = latestVitals.systolic_bp ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}` : (latest.systolic_bp || latest.bp_systolic) ? `${latest.systolic_bp || latest.bp_systolic}/${latest.diastolic_bp || latest.bp_diastolic}` : '—';
  const pulseVal = latestVitals.pulse ?? latest.pulse ?? '—';
  const respVal = latestVitals.resp_rate ?? latest.respiration ?? latest.resp_rate ?? '—';
  const tempVal = latestVitals.temp ?? latest.temperature ?? '—';
  const spo2Val = latestVitals.spo2 ?? latest.spo2 ?? '—';
  const painVal = latestVitals.pain_score ?? latest.pain_score ?? '—';

  const apVal = latestMachineParams.ap ?? '—';
  const vpVal = latestMachineParams.vp ?? '—';
  const tmpVal = latestMachineParams.tmp ?? '—';
  const condVal = latestMachineParams.conductivity ?? '—';
  const dialTempVal = latestMachineParams.dialysate_temp ?? '—';

  return (
    <>
      {deferredConsent && (
        <div className="during-alert warning" style={{ marginBottom: '16px' }}>
          <strong>Deferred Consent Notice:</strong> Organization consent for this patient was updated mid-session. Care continues uninterrupted until treatment completion (P3-10).
        </div>
      )}

      {/* Row 1: 4 Cards (Treatment Progress, UF Progress, Machine Status, Active Alerts) */}
      <div className="during-dashboard-row">
        {/* Card 1: Treatment Progress */}
        <Card title="Treatment Progress">
          <TreatmentProgressRingSVG percent={percent} />
          <div className="during-grid">
            <Metric label="Elapsed" value={elapsedTimeStr} />
            <Metric label="Remaining" value={remainingTimeStr} />
            <Metric label="Prescribed" value={totalTimeStr} />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>Started: <strong>{startedAtStr}</strong></span>
            <span>Expected End: <strong>{expectedEndStr}</strong></span>
          </div>
        </Card>

        {/* Card 2: UF Progress */}
        <Card title="UF Progress">
          <UfProgressRingSVG removed={ufRemoved} target={ufTarget} />
          <div className="during-grid">
            <Metric label="Target UF" value={`${ufTarget.toFixed(2)} L`} />
            <Metric label="Remaining" value={`${ufRemaining.toFixed(2)} L`} />
            <Metric label="UF Rate" value={`${ufRate} mL/hr`} />
          </div>
        </Card>

        {/* Card 3: Machine Status */}
        <Card title="Machine Status">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className={`during-status ${isRunning ? 'success' : 'warning'}`}>
              ● {isRunning ? 'Running' : 'Stopped'}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{machineModel}</span>
          </div>
          <div className="during-grid" style={{ marginBottom: '12px' }}>
            <Metric label="Dialyzer" value={dialyzer} />
            <Metric label="BFR / DFR" value={`${bfr} / ${dfr}`} hint="mL/min" />
          </div>
          <div className="during-empty">
            {alarmSummary}
          </div>
        </Card>

        {/* Card 4: Active Alerts (Right Column) */}
        <Card title="Active Alerts">
          <div className="during-active-alerts-header">
            <span className="during-active-alerts-badge">{activeAlerts.length} Active</span>
            <LibraryButton variant="outline" size="sm" onClick={() => go('P3-07')}>
              Manage
            </LibraryButton>
          </div>
          {activeAlerts.length === 0 ? (
            <div className="during-empty">
              No active alarms. All parameters within safe limits.
            </div>
          ) : (
            <div>
              {activeAlerts.slice(0, 3).map((alert, idx) => {
                const severity = (alert.severity || alert.level || 'medium').toLowerCase();
                return (
                  <div key={alert.id || idx} className={`during-alert-item ${severity}`}>
                    <div>
                      <div className="during-alert-item-title">{alert.title || alert.name || alert.alarm_type}</div>
                      <div className="during-alert-item-time">{alert.time || alert.created_at || '10:12 AM'}</div>
                    </div>
                    <span className={`during-severity-badge ${severity}`}>
                      {alert.severity || 'Medium'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: 4 Cards (Latest Vitals, Key Machine Parameters, Blood Flow Gauge, Quick Actions) */}
      <div className="during-dashboard-row">
        {/* Card 1: Latest Vitals */}
        <Card title="Latest Vitals">
          <div className="during-card-header" style={{ marginTop: '-24px' }}>
            <span />
            <button type="button" className="during-card-action-link" onClick={() => go('P3-02')}>
              View All Vitals →
            </button>
          </div>
          <div className="during-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <Metric label="BP (mmHg)" value={<>{bpVal} <TrendBadge trend="stable" /></>} />
            <Metric label="Pulse (bpm)" value={<>{pulseVal} <TrendBadge trend="up" /></>} />
            <Metric label="Respiration" value={<>{respVal} <TrendBadge trend="stable" /></>} />
            <Metric label="Temp (°C)" value={<>{tempVal} <TrendBadge trend="stable" /></>} />
            <Metric label="SpO₂ (%)" value={<>{spo2Val} <TrendBadge trend="up" /></>} />
            <Metric label="Pain Score" value={<>{painVal} <TrendBadge trend="stable" /></>} />
          </div>
        </Card>

        {/* Card 2: Key Machine Parameters */}
        <Card title="Key Machine Parameters">
          <div className="during-card-header" style={{ marginTop: '-24px' }}>
            <span />
            <button type="button" className="during-card-action-link" onClick={() => go('P3-03')}>
              View All Parameters →
            </button>
          </div>
          <div className="during-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <Metric label="Arterial Press (AP)" value={<>{apVal} <TrendBadge trend="stable" /></>} hint="mmHg" />
            <Metric label="Venous Press (VP)" value={<>{vpVal} <TrendBadge trend="stable" /></>} hint="mmHg" />
            <Metric label="TMP" value={<>{tmpVal} <TrendBadge trend="stable" /></>} hint="mmHg" />
            <Metric label="Conductivity" value={<>{condVal} <TrendBadge trend="stable" /></>} hint="mS/cm" />
            <Metric label="Dialysate Temp" value={<>{dialTempVal} <TrendBadge trend="stable" /></>} hint="°C" />
          </div>
        </Card>

        {/* Card 3: Blood Flow Gauge */}
        <Card title="Blood Flow">
          <BloodFlowGaugeSVG bfr={bfr} prescribedBfr={prescribedBfr} />
        </Card>

        {/* Card 4: Quick Actions Panel (Right-Hand Side) */}
        <Card title="Quick Actions">
          <div className="during-quick-actions-grid">
            <button type="button" className="during-quick-action-tile" onClick={() => go('P3-02')}>
              <div className="during-quick-action-icon">
                <MonitorHeartOutlinedIcon fontSize="small" />
              </div>
              <span>Add Vitals</span>
            </button>
            <button type="button" className="during-quick-action-tile" onClick={() => go('P3-04')}>
              <div className="during-quick-action-icon">
                <HealingOutlinedIcon fontSize="small" />
              </div>
              <span>Add Symptoms</span>
            </button>
            <button type="button" className="during-quick-action-tile" onClick={() => go('P3-07')}>
              <div className="during-quick-action-icon">
                <WarningAmberOutlinedIcon fontSize="small" />
              </div>
              <span>Alarm Management</span>
            </button>
            <button type="button" className="during-quick-action-tile" onClick={() => go('P3-06')}>
              <div className="during-quick-action-icon">
                <VaccinesOutlinedIcon fontSize="small" />
              </div>
              <span>Medication Administration</span>
            </button>
            <button type="button" className="during-quick-action-tile" onClick={() => go('P3-08')}>
              <div className="during-quick-action-icon">
                <ChecklistOutlinedIcon fontSize="small" />
              </div>
              <span>Treatment Progress</span>
            </button>
          </div>
        </Card>
      </div>

      <div className="during-guidance">
        Keep monitoring patient closely. Review alerts and take appropriate actions as needed.
      </div>
    </>
  );
}

function VitalsTrendMultiLineChart({ readings }) {
  const points = useMemo(() => {
    const defaultTimes = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'];
    const defaultSbp = [124, 120, 118, 126, 122];
    const defaultDbp = [80, 76, 74, 78, 78];
    const defaultPulse = [82, 80, 76, 79, 78];
    const defaultSpo2 = [97, 97, 98, 98, 98];

    if (!readings || readings.length === 0) {
      return defaultTimes.map((time, idx) => ({
        time,
        sbp: defaultSbp[idx],
        dbp: defaultDbp[idx],
        pulse: defaultPulse[idx],
        spo2: defaultSpo2[idx],
      }));
    }

    const rows = readings.slice(-5);
    return rows.map((r, idx) => {
      const timeStr = r.observation_time
        ? (r.observation_time.includes(':') && !r.observation_time.includes('T') ? r.observation_time : new Date(r.observation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        : r.recorded_at
        ? new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : defaultTimes[idx] || '—';
      return {
        time: timeStr,
        sbp: Number((r.bp_systolic ?? r.systolic_bp ?? defaultSbp[idx]) || 120),
        dbp: Number((r.bp_diastolic ?? r.diastolic_bp ?? defaultDbp[idx]) || 76),
        pulse: Number((r.pulse ?? defaultPulse[idx]) || 78),
        spo2: Number((r.spo2 ?? defaultSpo2[idx]) || 98),
      };
    });
  }, [readings]);

  const width = 380;
  const height = 170;
  const paddingLeft = 30;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const getY = (val) => {
    const minVal = 0;
    const maxVal = 150;
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return height - paddingBottom - (clamped / maxVal) * graphHeight;
  };

  const getX = (idx) => {
    if (points.length <= 1) return paddingLeft + graphWidth / 2;
    return paddingLeft + (idx / (points.length - 1)) * graphWidth;
  };

  const makePathD = (key) => {
    return points
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p[key])}`)
      .join(' ');
  };

  return (
    <div>
      <div className="during-vitals-trend-legend">
        <div className="during-vitals-trend-legend-item">
          <span className="during-vitals-trend-legend-dot" style={{ background: '#2563eb' }} />
          <span>SBP</span>
        </div>
        <div className="during-vitals-trend-legend-item">
          <span className="during-vitals-trend-legend-dot" style={{ background: '#06b6d4' }} />
          <span>DBP</span>
        </div>
        <div className="during-vitals-trend-legend-item">
          <span className="during-vitals-trend-legend-dot" style={{ background: '#ef4444' }} />
          <span>Pulse</span>
        </div>
        <div className="during-vitals-trend-legend-item">
          <span className="during-vitals-trend-legend-dot" style={{ background: '#8b5cf6' }} />
          <span>SpO₂ (%)</span>
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {[0, 30, 60, 90, 120, 150].map((gridVal) => (
          <g key={gridVal}>
            <line
              x1={paddingLeft}
              y1={getY(gridVal)}
              x2={width - paddingRight}
              y2={getY(gridVal)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={getY(gridVal) + 4}
              textAnchor="end"
              fontSize="9"
              fill="#94a3b8"
            >
              {gridVal}
            </text>
          </g>
        ))}

        <path d={makePathD('sbp')} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={makePathD('dbp')} fill="none" stroke="#06b6d4" strokeWidth="2" />
        <path d={makePathD('pulse')} fill="none" stroke="#ef4444" strokeWidth="2" />
        <path d={makePathD('spo2')} fill="none" stroke="#8b5cf6" strokeWidth="2" />

        {points.map((p, idx) => {
          const cx = getX(idx);
          return (
            <g key={idx}>
              <circle cx={cx} cy={getY(p.sbp)} r="3.5" fill="#2563eb" />
              <text x={cx} y={getY(p.sbp) - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e40af">
                {p.sbp}
              </text>

              <circle cx={cx} cy={getY(p.dbp)} r="3.5" fill="#06b6d4" />
              <text x={cx} y={getY(p.dbp) - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0e7490">
                {p.dbp}
              </text>

              <circle cx={cx} cy={getY(p.pulse)} r="3.5" fill="#ef4444" />
              <text x={cx} y={getY(p.pulse) + 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#b91c1c">
                {p.pulse}
              </text>

              <circle cx={cx} cy={getY(p.spo2)} r="3.5" fill="#8b5cf6" />
              <text x={cx} y={getY(p.spo2) + 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#6d28d9">
                {p.spo2}
              </text>

              <text x={cx} y={height - 6} textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">
                {p.time}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function VitalsForm({ sessionId, readings, onSaved, go }) {
  const [form, setForm] = useState({
    observation_time: '10:00 AM',
    systolic_bp: '122',
    diastolic_bp: '78',
    pulse: '78',
    respiration: '18',
    temperature: '36.6',
    spo2: '98',
    pain_score: 0,
    consciousness: 'Alert',
    symptoms: 'None',
    remarks: '',
    notify: false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const thresholds = useMemo(() => getVitalsThresholds(), []);

  const severity = useMemo(() => {
    const sys = Number(form.systolic_bp);
    const dia = Number(form.diastolic_bp);
    const pulse = Number(form.pulse);
    const spo2 = Number(form.spo2);
    if (
      (sys && (sys < thresholds.systolic.criticalLow || sys > thresholds.systolic.criticalHigh)) ||
      (dia && (dia < thresholds.diastolic.criticalLow || dia > thresholds.diastolic.criticalHigh)) ||
      (pulse && (pulse < thresholds.pulse.criticalLow || pulse > thresholds.pulse.criticalHigh)) ||
      (spo2 && spo2 < thresholds.spo2.criticalLow)
    )
      return 'Critical';
    if (
      (sys && (sys <= 100 || sys >= 160)) ||
      (dia && (dia <= 55 || dia >= 100)) ||
      (pulse && (pulse <= 59 || pulse >= 101)) ||
      (spo2 && spo2 <= 94)
    )
      return 'Warning';
    return '';
  }, [form, thresholds]);

  useEffect(() => {
    if (severity === 'Critical') {
      setForm((prev) => ({ ...prev, notify: true }));
    }
  }, [severity]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const executeSave = async () => {
    if (!form.systolic_bp || !form.diastolic_bp || !form.pulse || !form.temperature || !form.spo2) {
      setError('BP, Pulse, Temperature, and SpO₂ are required fields.');
      return false;
    }
    setSaving(true);
    setError('');
    const recorded_by = getTechnicianId() || 'Rahul Singh';
    const recorded_at = new Date().toISOString();
    const payload = {
      ...form,
      observation_time: form.observation_time,
      bp_systolic: Number(form.systolic_bp),
      bp_diastolic: Number(form.diastolic_bp),
      pulse: Number(form.pulse),
      resp_rate: Number(form.respiration),
      temperature: Number(form.temperature),
      spo2: Number(form.spo2),
      pain_score: Number(form.pain_score),
      symptoms_ref: form.symptoms,
      notify_flag: form.notify || severity === 'Critical',
      recorded_by,
      recorded_at,
    };

    const result = await createIntradialyticVitals(sessionId, payload);
    setSaving(false);
    if (!result.success) {
      const errMsg = responseData(result)?.message || result?.error || result?.message || 'Failed to save vitals entry.';
      setError(errMsg);
      return false;
    }
    const saved = responseData(result);
    onSaved({ ...form, ...saved, recorded_by, recorded_at });
    return true;
  };

  const handleSaveOnly = async () => {
    await executeSave();
  };

  const handleSaveAndExit = async () => {
    const ok = await executeSave();
    if (ok) go('P3-01');
  };

  const handleSaveAndContinue = async () => {
    const ok = await executeSave();
    if (ok) go('P3-03');
  };

  const historyRows = useMemo(() => {
    if (readings && readings.length > 0) return readings.slice(-5).reverse();
    return [
      { observation_time: '10:00 AM', bp_systolic: 122, bp_diastolic: 78, pulse: 78, resp_rate: 18, temperature: 36.6, spo2: 98, pain_score: 0, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
      { observation_time: '09:30 AM', bp_systolic: 126, bp_diastolic: 78, pulse: 79, resp_rate: 18, temperature: 36.5, spo2: 98, pain_score: 0, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
      { observation_time: '09:00 AM', bp_systolic: 118, bp_diastolic: 74, pulse: 76, resp_rate: 18, temperature: 36.6, spo2: 98, pain_score: 1, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
      { observation_time: '08:30 AM', bp_systolic: 120, bp_diastolic: 76, pulse: 80, resp_rate: 18, temperature: 36.5, spo2: 97, pain_score: 1, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
      { observation_time: '08:00 AM', bp_systolic: 124, bp_diastolic: 80, pulse: 82, resp_rate: 18, temperature: 36.5, spo2: 97, pain_score: 1, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
    ];
  }, [readings]);

  return (
    <>
      {/* Top Breadcrumbs */}
      <div className="during-breadcrumb">
        <span>During Dialysis</span>
        <span>&gt;</span>
        <span className="current">P3-02 Live Vitals Monitoring</span>
      </div>

      <div className="during-vitals-layout-grid">
        {/* Left Main Column: Form + History Table */}
        <div style={{ minWidth: 0 }}>
          <Card title="Record New Vitals">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-24px', marginBottom: '16px' }}>
              <span />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>
                Next Due: 10:30 AM (Every 30 min)
              </span>
            </div>

            <div className="during-form-grid">
              {/* Row 1: Time, BP, Pulse, Resp Rate */}
              <Field label="Observation Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="text" value={form.observation_time} onChange={update('observation_time')} />
              </Field>

              <Field label="BP (mmHg)" icon={FavoriteBorderOutlinedIcon} required>
                <div className="during-bp-split-container">
                  <Input type="number" placeholder="122" value={form.systolic_bp} onChange={update('systolic_bp')} />
                  <span className="during-bp-separator">/</span>
                  <Input type="number" placeholder="78" value={form.diastolic_bp} onChange={update('diastolic_bp')} />
                </div>
              </Field>

              <Field label="Pulse (bpm)" icon={MonitorHeartOutlinedIcon} required>
                <Input type="number" value={form.pulse} onChange={update('pulse')} />
              </Field>

              <Field label="Respiratory Rate (/min)" icon={AirOutlinedIcon}>
                <Input type="number" value={form.respiration} onChange={update('respiration')} />
              </Field>

              {/* Row 2: Temp, SpO2, Pain Score, Consciousness */}
              <Field label="Temperature (°C)" icon={DeviceThermostatOutlinedIcon} required>
                <Input type="number" step="0.1" value={form.temperature} onChange={update('temperature')} />
              </Field>

              <Field label="SpO₂ (%)" icon={WaterDropOutlinedIcon} required>
                <Input type="number" value={form.spo2} onChange={update('spo2')} />
              </Field>

              <Field label="Pain Score (0-10) ⓘ" icon={SentimentNeutralOutlinedIcon}>
                <Input type="number" min="0" max="10" value={form.pain_score} onChange={update('pain_score')} />
              </Field>

              <Field label="Consciousness" icon={PsychologyOutlinedIcon}>
                <Select value={form.consciousness} onChange={update('consciousness')}>
                  <option value="Alert">Alert</option>
                  <option value="Oriented">Oriented</option>
                  <option value="Confused">Confused</option>
                  <option value="Lethargic">Lethargic</option>
                  <option value="Unresponsive">Unresponsive</option>
                </Select>
              </Field>
            </div>

            {/* Row 3: Symptoms & Remarks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginTop: '4px' }}>
              <Field label="Symptoms" icon={HealingOutlinedIcon}>
                <Select value={form.symptoms} onChange={update('symptoms')}>
                  <option value="None">None</option>
                  <option value="Hypotension">Hypotension</option>
                  <option value="Chest Pain">Chest Pain</option>
                  <option value="Muscle Cramps">Muscle Cramps</option>
                  <option value="Nausea/Vomiting">Nausea/Vomiting</option>
                  <option value="Shortness of Breath">Shortness of Breath</option>
                </Select>
              </Field>

              <Field label="Remarks" icon={NoteAltOutlinedIcon}>
                <Textarea
                  placeholder="Enter remarks (if any)"
                  maxLength="200"
                  value={form.remarks}
                  onChange={update('remarks')}
                />
              </Field>
            </div>

            {severity && (
              <div className={`during-alert ${severity.toLowerCase()}`}>
                <strong>{severity}:</strong> Review entered vital signs. High-risk finding flagged.
              </div>
            )}
            {error && <div className="during-error">{error}</div>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <LibraryCheckbox
                isChecked={form.notify}
                onChange={(e) => setForm((prev) => ({ ...prev, notify: e.target.checked }))}
                isDisabled={severity === 'Critical'}
              >
                Notify Nurse / Doctor ⓘ
              </LibraryCheckbox>

              <div className="during-form-actions">
                <LibraryButton
                  variant="outline"
                  onClick={() =>
                    setForm({
                      observation_time: nowTime(),
                      systolic_bp: '',
                      diastolic_bp: '',
                      pulse: '',
                      respiration: '',
                      temperature: '',
                      spo2: '',
                      pain_score: 0,
                      consciousness: 'Alert',
                      symptoms: 'None',
                      remarks: '',
                      notify: false,
                    })
                  }
                >
                  Reset
                </LibraryButton>
                <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Vitals'}
                </LibraryButton>
              </div>
            </div>
          </Card>

          {/* Vitals History Table */}
          <Card title="Vitals History">
            <div className="during-overdue-table-wrap">
              <table className="during-vitals-history-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>BP (mmHg)</th>
                    <th>Pulse (bpm)</th>
                    <th>RR (/min)</th>
                    <th>Temp (°C)</th>
                    <th>SpO₂ (%)</th>
                    <th>Pain Score</th>
                    <th>Consciousness</th>
                    <th>Recorded By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((r, i) => {
                    const isTop = i === 0;
                    const sys = r.bp_systolic ?? r.systolic_bp ?? '—';
                    const dia = r.bp_diastolic ?? r.diastolic_bp ?? '—';
                    const bpText = sys !== '—' ? `${sys} / ${dia}` : '—';
                    const timeText = r.observation_time
                      ? (r.observation_time.includes(':') && !r.observation_time.includes('T') ? r.observation_time : new Date(r.observation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                      : '—';
                    const consciousText = r.consciousness || 'Alert';
                    const recorder = r.recorded_by || r.recordedBy || 'Rahul Singh';

                    return (
                      <tr key={i} className={isTop ? 'during-vitals-row-latest' : ''}>
                        <td style={{ fontWeight: isTop ? 700 : 500 }}>{timeText}</td>
                        <td>{bpText}</td>
                        <td>{r.pulse ?? '—'}</td>
                        <td>{r.resp_rate ?? r.respiration ?? '—'}</td>
                        <td>{r.temperature ?? '—'}</td>
                        <td>{r.spo2 ?? '—'}</td>
                        <td>{r.pain_score ?? 0}</td>
                        <td>
                          <span className={`during-status-pill ${consciousText.toLowerCase() === 'alert' ? 'alert' : 'oriented'}`}>
                            {consciousText}
                          </span>
                        </td>
                        <td>{recorder}</td>
                        <td style={{ textStyle: 'right' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                            title="Edit entry"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link" onClick={() => {}}>
                View All Vitals History →
              </button>
            </div>
          </Card>
        </div>

        {/* Right Main Column: Vitals Trend + Mini Cards + Alerts + Quick Actions */}
        <div style={{ minWidth: 0 }}>
          {/* Card 1: Vitals Trend Multi-Line Chart */}
          <Card title="Vitals Trend">
            <div className="during-vitals-trend-card-header" style={{ marginTop: '-24px' }}>
              <span />
              <Select size="sm" style={{ width: '130px' }} defaultValue="2h">
                <option value="2h">Last 2 Hours</option>
                <option value="4h">Last 4 Hours</option>
              </Select>
            </div>

            <VitalsTrendMultiLineChart readings={readings} />

            <div className="during-vitals-mini-cards-grid">
              <div className="during-vitals-mini-card interval">
                <div className="during-vitals-mini-card-icon">
                  <AccessTimeOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                </div>
                <div className="during-vitals-mini-card-info">
                  <small>Monitoring Interval</small>
                  <strong>Every 30 min</strong>
                </div>
              </div>

              <div className="during-vitals-mini-card compliance">
                <div className="during-vitals-mini-card-icon">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} fontSize="small" />
                </div>
                <div className="during-vitals-mini-card-info">
                  <small>Compliance</small>
                  <strong>100%</strong>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Alerts & Notifications */}
          <div className="during-vital-alerts-card">
            <div className="during-vital-alerts-header">
              <NotificationsNoneOutlinedIcon fontSize="small" />
              <span>Alerts & Notifications</span>
            </div>
            <div className="during-vital-alerts-content">
              <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} fontSize="small" />
              <span>No active vital alerts. All parameters are within acceptable range.</span>
            </div>
          </div>

          {/* Card 3: Quick Actions 2x2 Grid */}
          <Card title="Quick Actions">
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-04')}>
                <div className="during-vitals-qa-tile-left">
                  <PersonOutlineIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Add Symptoms</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>

              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-06')}>
                <div className="during-vitals-qa-tile-left">
                  <MedicationOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Add Medication</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>

              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-07')}>
                <div className="during-vitals-qa-tile-left">
                  <WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Alarm Management</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>

              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-08')}>
                <div className="during-vitals-qa-tile-left">
                  <ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Treatment Progress</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-01')}>
          ← Back
        </LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>
            Save & Exit
          </LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>
            Save & Continue →
          </LibraryButton>
        </div>
      </div>
    </>
  );
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

function StepIndicatorBar({ activeStep = 4 }) {
  const steps = [
    { num: 1, label: 'Patient Verification', id: 'P3-01' },
    { num: 2, label: 'Vitals & Measurements', id: 'P3-02' },
    { num: 3, label: 'Patient Assessment', id: 'P3-03' },
    { num: 4, label: 'Symptoms & Complications', id: 'P3-04' },
    { num: 5, label: 'Vascular Access Assessment', id: 'P3-05' },
    { num: 6, label: 'Machine Parameters', id: 'P3-06' },
    { num: 7, label: 'Medication Administration', id: 'P3-07' },
    { num: 8, label: 'Alarm Management', id: 'P3-08' },
    { num: 9, label: 'Treatment Progress', id: 'P3-09' },
    { num: 10, label: 'Treatment Completion', id: 'P3-10' },
  ];

  return (
    <div className="during-step-progress-bar">
      {steps.map((s) => {
        const isCompleted = s.num < activeStep;
        const isActive = s.num === activeStep;
        return (
          <div key={s.num} className={`during-step-item ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
            <div className="during-step-circle">
              {isCompleted ? '✓' : s.num}
            </div>
            <span className="during-step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function SymptomForm({ sessionId, go }) {
  const [form, setForm] = useState({
    event_time: '10:15 AM',
    symptom: '',
    severity: 'Moderate',
    status: 'Ongoing',
    details: '',
    intervention: '',
    additional_notes: '',
    notify: false,
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [saving, setSaving] = useState(false);
  const [symptomsList, setSymptomsList] = useState([]);
  const [selectedQuickTile, setSelectedQuickTile] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const quickSymptoms = [
    { id: 'hypotension', name: 'Hypotension (Low BP)', icon: FavoriteBorderOutlinedIcon, color: '#ef4444', defaultIntervention: 'UF Paused, 100 mL NS given' },
    { id: 'cramps', name: 'Muscle Cramps', icon: HealingOutlinedIcon, color: '#f59e0b', defaultIntervention: 'Saline 100 mL given' },
    { id: 'nausea', name: 'Nausea / Vomiting', icon: HealingOutlinedIcon, color: '#10b981', defaultIntervention: 'Ondansetron 4 mg IV' },
    { id: 'chest_pain', name: 'Chest Pain', icon: MonitorHeartOutlinedIcon, color: '#ef4444', defaultIntervention: 'O2 Therapy 2L/min, EKG requested' },
    { id: 'shortness_breath', name: 'Shortness of Breath', icon: AirOutlinedIcon, color: '#2563eb', defaultIntervention: 'UF Rate reduced, O2 2L/min' },
    { id: 'chills', name: 'Chills / Rigors', icon: DeviceThermostatOutlinedIcon, color: '#06b6d4', defaultIntervention: 'Blanket provided, Temp monitored' },
    { id: 'headache', name: 'Headache', icon: PsychologyOutlinedIcon, color: '#8b5cf6', defaultIntervention: 'Paracetamol 500 mg' },
    { id: 'bleeding', name: 'Bleeding', icon: WaterDropOutlinedIcon, color: '#dc2626', defaultIntervention: 'Pressure applied, Gauze reinforced' },
    { id: 'dizziness', name: 'Syncope / Dizziness', icon: WarningAmberOutlinedIcon, color: '#06b6d4', defaultIntervention: 'Trendelenburg position, BP checked' },
    { id: 'itching', name: 'Itching', icon: HealingOutlinedIcon, color: '#f59e0b', defaultIntervention: 'Antihistamine administered' },
    { id: 'back_pain', name: 'Back Pain', icon: NoteAltOutlinedIcon, color: '#d97706', defaultIntervention: 'Repositioned, Pillow support' },
    { id: 'other', name: 'Other', icon: SettingsOutlinedIcon, color: '#64748b', defaultIntervention: 'Technician review' },
  ];

  const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';

  // Fetch session symptoms on load
  const fetchSymptoms = useCallback(async () => {
    if (!activeSessionId || activeSessionId === 'demo') return;
    try {
      const res = await getSymptoms(activeSessionId);
      if (res?.success) {
        const d = responseData(res);
        const items = Array.isArray(d) ? d : d.items || d.symptoms || [];
        setSymptomsList(items);
      }
    } catch (_) { /* ignore */ }
  }, [activeSessionId]);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  const handleTileClick = (item) => {
    setSelectedQuickTile(item.id);
    setForm((prev) => ({
      ...prev,
      symptom: item.name,
      intervention: item.defaultIntervention,
    }));
  };

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const executeSaveSymptom = async () => {
    if (!form.symptom) {
      setError('Please select a symptom or complication.');
      return false;
    }
    if (!form.severity) {
      setError('Please select a severity level.');
      return false;
    }
    if (!form.intervention) {
      setError('Please select an intervention or action taken.');
      return false;
    }

    setSaving(true);
    setError('');
    const recorded_at = new Date().toISOString();
    const recorded_by = getTechnicianId() || 'Rahul Singh';

    const payload = {
      event_time: form.event_time,
      symptom_type: form.symptom,
      severity: form.severity,
      status: form.status,
      details: form.details,
      intervention: form.intervention,
      additional_notes: form.additional_notes,
      notify_flag: form.notify,
      recorded_by,
      recorded_at,
    };

    const res = await createSymptom(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to record symptom.';
      setError(errMsg);
      return false;
    }

    const d = responseData(res);
    if (d?.auto_incident_created) {
      setInfo(`Incident logged automatically — ID ${d.incident_id}. Review on P3-09.`);
    } else {
      setInfo('Symptom recorded successfully.');
    }

    fetchSymptoms();
    return true;
  };

  const handleSaveOnly = async () => {
    await executeSaveSymptom();
  };

  const handleSaveAndExit = async () => {
    const ok = await executeSaveSymptom();
    if (ok) go('P3-01');
  };

  const handleSaveAndContinue = async () => {
    const ok = await executeSaveSymptom();
    if (ok) go('P3-05');
  };

  const handleResolveSymptom = async (symptomId) => {
    setUpdatingId(symptomId);
    const res = await updateSymptom(activeSessionId, symptomId, { status: 'Resolved' });
    setUpdatingId(null);
    if (!res.success) {
      setError('Unable to update symptom status.');
      return;
    }
    setInfo('Symptom marked as Resolved.');
    fetchSymptoms();
  };

  const activeSymptomItem = symptomsList.find((s) => (s.status || 'Ongoing').toLowerCase() === 'ongoing') || {
    id: 'symp-101',
    symptom_type: 'Hypotension (Low BP)',
    severity: 'Moderate',
    event_time: '10:00 AM',
    bp: '88/54 mmHg',
    intervention: 'UF Paused, 100 mL NS given',
    status: 'Ongoing',
  };

  const historyItems = useMemo(() => {
    const defaultHistory = [
      { id: 'symp-01', symptom_type: 'Muscle Cramps', time: '09:20 AM', status: 'Resolved', intervention: 'Saline 100 mL given', severity: 'Mild' },
      { id: 'symp-02', symptom_type: 'Nausea / Vomiting', time: '08:45 AM', status: 'Resolved', intervention: 'Ondansetron 4 mg IV', severity: 'Moderate' },
      { id: 'symp-03', symptom_type: 'Hypotension (Low BP)', time: '08:10 AM', status: 'Resolved', intervention: 'UF Paused, NS 200 mL', severity: 'Severe' },
      { id: 'symp-04', symptom_type: 'Headache', time: '07:50 AM', status: 'Resolved', intervention: 'Paracetamol 500 mg', severity: 'Mild' },
    ];
    if (!symptomsList || symptomsList.length === 0) return defaultHistory;
    return symptomsList.slice(-4).reverse().map((s, idx) => ({
      id: s.id || `symp-${idx}`,
      symptom_type: s.symptom_type || s.symptom || 'Symptom',
      time: s.event_time || (s.recorded_at ? new Date(s.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
      status: s.status || 'Resolved',
      intervention: s.intervention || 'Monitored',
      severity: s.severity || 'Mild',
    }));
  }, [symptomsList]);

  return (
    <>
      <div className="during-symptoms-layout-grid">
        {/* Left Column: Form Card */}
        <div style={{ minWidth: 0 }}>
          <Card title="Record New Symptom / Complication">
            <div className="during-form-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <Field label="Event Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="text" value={form.event_time} onChange={updateField('event_time')} />
              </Field>

              <Field label="Symptom / Complication" icon={HealingOutlinedIcon} required>
                <Select value={form.symptom} onChange={updateField('symptom')}>
                  <option value="">Select symptom</option>
                  {quickSymptoms.map((qs) => (
                    <option key={qs.id} value={qs.name}>
                      {qs.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Severity" required>
                <div className="during-severity-segmented-group">
                  {['Mild', 'Moderate', 'Severe'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      className={`during-severity-btn ${sev.toLowerCase()} ${form.severity === sev ? 'selected' : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, severity: sev }))}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Status">
                <Select value={form.status} onChange={updateField('status')}>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Improving">Improving</option>
                  <option value="Worsening">Worsening</option>
                </Select>
              </Field>
            </div>

            {/* Common Symptoms Quick Selection Grid */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Common Symptoms
              </label>
              <div className="during-symptoms-quick-grid">
                {quickSymptoms.map((tile) => {
                  const Icon = tile.icon;
                  const isSelected = form.symptom === tile.name || selectedQuickTile === tile.id;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      className={`during-symptom-quick-tile ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleTileClick(tile)}
                    >
                      <div className="during-symptom-quick-tile-icon">
                        <Icon sx={{ color: tile.color, fontSize: 18 }} />
                      </div>
                      <span className="during-symptom-quick-tile-label">{tile.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Details & Intervention */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <Field label="Details" icon={NoteAltOutlinedIcon}>
                <Textarea
                  placeholder="Describe symptoms in detail..."
                  maxLength="300"
                  value={form.details}
                  onChange={updateField('details')}
                  style={{ height: '110px' }}
                />
                <span style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', display: 'block', marginTop: '2px' }}>
                  {form.details.length} / 300
                </span>
              </Field>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Field label="Intervention / Action Taken" icon={HealingOutlinedIcon} required>
                  <Select value={form.intervention} onChange={updateField('intervention')}>
                    <option value="">Select intervention</option>
                    <option value="UF Paused, 100 mL NS given">UF Paused, 100 mL NS given</option>
                    <option value="Saline 100 mL given">Saline 100 mL given</option>
                    <option value="Ondansetron 4 mg IV">Ondansetron 4 mg IV</option>
                    <option value="UF Paused, NS 200 mL">UF Paused, NS 200 mL</option>
                    <option value="Paracetamol 500 mg">Paracetamol 500 mg</option>
                    <option value="O2 therapy 2L/min">O2 therapy 2L/min</option>
                    <option value="Trendelenburg position">Trendelenburg position</option>
                    <option value="Continued monitoring">Continued monitoring</option>
                  </Select>
                </Field>

                <Field label="Additional Notes">
                  <Textarea
                    placeholder="Enter any additional notes..."
                    maxLength="200"
                    value={form.additional_notes}
                    onChange={updateField('additional_notes')}
                    style={{ height: '60px' }}
                  />
                  <span style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', display: 'block', marginTop: '2px' }}>
                    {form.additional_notes.length} / 200
                  </span>
                </Field>
              </div>
            </div>

            {error && <div className="during-error">{error}</div>}
            {info && <div className="during-alert warning">{info}</div>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <LibraryCheckbox
                isChecked={form.notify}
                onChange={(e) => setForm((prev) => ({ ...prev, notify: e.target.checked }))}
              >
                Notify Nurse / Doctor ⓘ
              </LibraryCheckbox>

              <div className="during-form-actions">
                <LibraryButton
                  variant="outline"
                  onClick={() =>
                    setForm({
                      event_time: '10:15 AM',
                      symptom: '',
                      severity: 'Moderate',
                      status: 'Ongoing',
                      details: '',
                      intervention: '',
                      additional_notes: '',
                      notify: false,
                    })
                  }
                >
                  Reset
                </LibraryButton>
                <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Symptom'}
                </LibraryButton>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Active Symptoms + Symptom History + Clinical Guidance */}
        <div style={{ minWidth: 0 }}>
          {/* Card 1: Active Symptoms */}
          <Card title={<span style={{ color: '#dc2626' }}>Active Symptoms (1)</span>}>
            <div className="during-card-header" style={{ marginTop: '-24px' }}>
              <span />
              <button type="button" className="during-card-action-link">
                View All
              </button>
            </div>

            {activeSymptomItem ? (
              <div className="during-active-symptom-box">
                <div className="during-active-symptom-header">
                  <div className="during-active-symptom-title">
                    <FavoriteBorderOutlinedIcon sx={{ color: '#ef4444' }} fontSize="small" />
                    <span>{activeSymptomItem.symptom_type}</span>
                  </div>
                  <span className={`during-severity-badge ${(activeSymptomItem.severity || 'moderate').toLowerCase()}`}>
                    {activeSymptomItem.severity || 'Moderate'}
                  </span>
                </div>
                <div className="during-active-symptom-details">
                  <div>Started: <strong>{activeSymptomItem.event_time || '10:00 AM'}</strong></div>
                  {activeSymptomItem.bp && <div>BP: <strong>{activeSymptomItem.bp}</strong></div>}
                  <div>Intervention: <strong>{activeSymptomItem.intervention}</strong></div>
                  <div>Status: <strong>{activeSymptomItem.status}</strong></div>
                </div>
                <button
                  type="button"
                  className="during-active-symptom-update-btn"
                  onClick={() => handleResolveSymptom(activeSymptomItem.id)}
                  disabled={updatingId === activeSymptomItem.id}
                >
                  {updatingId === activeSymptomItem.id ? 'Updating...' : 'Update'}
                </button>
              </div>
            ) : (
              <div className="during-empty">No active ongoing symptoms recorded.</div>
            )}
          </Card>

          {/* Card 2: Symptom History */}
          <Card title="Symptom History">
            <div className="during-card-header" style={{ marginTop: '-24px' }}>
              <span />
              <Select size="sm" style={{ width: '130px' }} defaultValue="4">
                <option value="4">Last 4 Events</option>
                <option value="all">All Events</option>
              </Select>
            </div>

            <div className="during-symptom-history-list">
              {historyItems.map((item, idx) => (
                <div key={item.id || idx} className="during-symptom-history-item">
                  <div className="during-symptom-history-header">
                    <div className="during-symptom-history-title">
                      <span>{item.symptom_type}</span>
                    </div>
                    <span className={`during-severity-badge ${(item.severity || 'mild').toLowerCase()}`}>
                      {item.severity}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>
                    {item.time} | <strong>{item.status}</strong>
                  </div>
                  <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>
                    {item.intervention}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">
                View Full History →
              </button>
            </div>
          </Card>

          {/* Card 3: Clinical Guidance */}
          <div className="during-clinical-guidance-card">
            <div className="during-clinical-guidance-header">
              <SettingsOutlinedIcon fontSize="small" />
              <span>Clinical Guidance</span>
            </div>
            <div className="during-clinical-guidance-text">
              If hypotension persists, consider reducing UF rate, increasing Na+ and evaluate dry weight.
            </div>
            <button type="button" className="during-card-action-link">
              View Guidelines →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-03')}>
          ← Back
        </LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>
            Save as Draft
          </LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>
            Save & Continue →
          </LibraryButton>
        </div>
      </div>
    </>
  );
}

function AccessHealthGaugeSVG({ score = 95 }) {
  const radius = 52;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 95));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="during-health-gauge-container">
      <svg width="150" height="85" viewBox="0 0 150 85">
        <path
          d="M 15 75 A 60 60 0 0 1 135 75"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M 15 75 A 60 60 0 0 1 135 75"
          fill="none"
          stroke="#16a34a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{ marginTop: '-42px', textAlign: 'center' }}>
        <strong style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{clampedScore}%</strong>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>Good</div>
      </div>
      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '12px' }}>Based on current assessment</span>
    </div>
  );
}

function VascularAccessMonitoringView({ sessionId, go }) {
  const [accessType, setAccessType] = useState('AV Fistula (AVF)');
  const [assessmentTime, setAssessmentTime] = useState('26 May 2025, 10:20 AM');
  const [overallStatus, setOverallStatus] = useState('Good / Functional');
  const [intervention, setIntervention] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [nextDue, setNextDue] = useState('11:00 AM (In 1 hour)');
  const [notify, setNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [assessmentItems, setAssessmentItems] = useState({
    needle_security: { finding: 'Secure', comment: '' },
    bleeding: { finding: 'None', comment: '' },
    swelling: { finding: 'None', comment: '' },
    infiltration: { finding: 'No', comment: '' },
    pain: { finding: 'None', comment: '' },
    thrill: { finding: 'Strong', comment: '' },
    bruit: { finding: 'Normal', comment: '' },
    blood_flow: { finding: 'Adequate', comment: '' },
    skin_condition: { finding: 'Normal', comment: '' },
  });

  const assessmentFields = [
    { key: 'needle_security', name: 'Needle Position & Security', icon: NoteAltOutlinedIcon, options: ['Secure', 'Loose', 'Dislodged'], normal: 'Secure' },
    { key: 'bleeding', name: 'Bleeding', icon: WaterDropOutlinedIcon, options: ['None', 'Minimal', 'Excessive'], normal: 'None' },
    { key: 'swelling', name: 'Swelling', icon: HealingOutlinedIcon, options: ['None', 'Mild', 'Moderate', 'Severe'], normal: 'None' },
    { key: 'infiltration', name: 'Infiltration / Extravasation', icon: WaterDropOutlinedIcon, options: ['No', 'Yes (Mild)', 'Yes (Severe)'], normal: 'No' },
    { key: 'pain', name: 'Pain / Tenderness', icon: WarningAmberOutlinedIcon, options: ['None', 'Mild', 'Moderate', 'Severe'], normal: 'None' },
    { key: 'thrill', name: 'Thrill (Palpation)', icon: AirOutlinedIcon, options: ['Strong', 'Weak', 'Absent'], normal: 'Strong' },
    { key: 'bruit', name: 'Bruit (Auscultation)', icon: MonitorHeartOutlinedIcon, options: ['Normal', 'Weak', 'Absent'], normal: 'Normal' },
    { key: 'blood_flow', name: 'Blood Flow Adequacy', icon: MonitorHeartOutlinedIcon, options: ['Adequate', 'Inadequate', 'Not Assessable'], normal: 'Adequate' },
    { key: 'skin_condition', name: 'Skin Condition', icon: HealingOutlinedIcon, options: ['Normal', 'Redness', 'Warmth', 'Other'], normal: 'Normal' },
  ];

  const updateFinding = (key, findingVal) => {
    setAssessmentItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], finding: findingVal },
    }));
  };

  const updateComment = (key, commentVal) => {
    setAssessmentItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], comment: commentVal },
    }));
  };

  const executeSave = async () => {
    setSaving(true);
    setError('');

    const recorded_at = new Date().toISOString();
    const recorded_by = getTechnicianId() || 'Rahul Singh';

    const payload = {
      access_type: accessType,
      assessment_time: assessmentTime,
      overall_status: overallStatus,
      intervention,
      additional_notes: additionalNotes,
      next_assessment_due: nextDue,
      notify_flag: notify,
      assessment_items: assessmentItems,
      recorded_by,
      recorded_at,
    };

    const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';
    const res = await createVascularAccessMonitoring(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to save vascular access monitoring assessment.';
      setError(errMsg);
      return false;
    }

    setInfo('Vascular Access Assessment saved successfully.');
    return true;
  };

  const handleSaveOnly = async () => {
    await executeSave();
  };

  const handleSaveAndExit = async () => {
    const ok = await executeSave();
    if (ok) go('P3-01');
  };

  const handleSaveAndContinue = async () => {
    const ok = await executeSave();
    if (ok) go('P3-06');
  };

  return (
    <>
      {/* Top Controls: Access Type Radio Bar & Assessment Time */}
      <div className="during-access-top-bar">
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Access Type
          </label>
          <div className="during-access-type-radios">
            {['AV Fistula (AVF)', 'AV Graft (AVG)', 'Central Venous Catheter (CVC)'].map((type) => (
              <label key={type} className="during-access-type-radio-label">
                <input
                  type="radio"
                  name="accessTypeRadio"
                  checked={accessType === type}
                  onChange={() => setAccessType(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ minWidth: '220px' }}>
          <Field label="Assessment Time" icon={AccessTimeOutlinedIcon}>
            <Input type="text" value={assessmentTime} onChange={(e) => setAssessmentTime(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="during-symptoms-layout-grid">
        {/* Left Column: Assessment Matrix Card */}
        <div style={{ minWidth: 0 }}>
          <Card title="Access Assessment – AV Fistula (Left)">
            <p className="during-muted" style={{ marginTop: '-12px', marginBottom: '16px' }}>
              Evaluate access site during treatment.
            </p>

            <div className="during-overdue-table-wrap">
              <table className="during-access-assessment-table">
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>Assessment Item</th>
                    <th style={{ width: '42%' }}>Findings</th>
                    <th style={{ width: '26%' }}>Details / Comments (if abnormal)</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentFields.map((field) => {
                    const Icon = field.icon;
                    const itemState = assessmentItems[field.key] || { finding: field.normal, comment: '' };

                    return (
                      <tr key={field.key}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                            <Icon sx={{ color: '#2563eb', fontSize: 16 }} />
                            <span>{field.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="during-finding-radio-group">
                            {field.options.map((opt) => {
                              const isSelected = itemState.finding === opt;
                              const isNormal = opt === field.normal;

                              return (
                                <label key={opt} className="during-finding-radio-item">
                                  <input
                                    type="radio"
                                    name={`finding_${field.key}`}
                                    checked={isSelected}
                                    onChange={() => updateFinding(field.key, opt)}
                                  />
                                  {isSelected && isNormal ? (
                                    <span className="during-status-pill alert">{opt}</span>
                                  ) : (
                                    <span>{opt}</span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <Input
                            type="text"
                            placeholder="Describe if abnormal"
                            value={itemState.comment}
                            onChange={(e) => updateComment(field.key, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Lower Form Section: Overall Access Status + Intervention + Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Overall Access Status <em style={{ color: '#ef4444' }}>*</em>
                </label>
                <div className="during-access-status-segmented-group">
                  <button
                    type="button"
                    className={`during-[#access-status-btn] good ${overallStatus === 'Good / Functional' ? 'selected' : ''}`}
                    onClick={() => setOverallStatus('Good / Functional')}
                  >
                    ✔ Good / Functional
                  </button>
                  <button
                    type="button"
                    className={`during-access-status-btn at-risk ${overallStatus === 'At Risk' ? 'selected' : ''}`}
                    onClick={() => setOverallStatus('At Risk')}
                  >
                    ⚠️ At Risk
                  </button>
                  <button
                    type="button"
                    className={`during-access-status-btn not-functional ${overallStatus === 'Not Functional' ? 'selected' : ''}`}
                    onClick={() => setOverallStatus('Not Functional')}
                  >
                    🚫 Not Functional
                  </button>
                </div>
              </div>

              <div>
                <Field label="Intervention / Action Taken" icon={HealingOutlinedIcon}>
                  <Select value={intervention} onChange={(e) => setIntervention(e.target.value)}>
                    <option value="">Select intervention</option>
                    <option value="None required">None required</option>
                    <option value="Needle repositioned">Needle repositioned</option>
                    <option value="Tape reinforced">Tape reinforced</option>
                    <option value="Heparin lock flushed">Heparin lock flushed</option>
                    <option value="Pressure applied">Pressure applied</option>
                    <option value="Physician notified">Physician notified</option>
                  </Select>
                </Field>

                <div style={{ marginTop: '10px' }}>
                  <Field label="Additional Notes">
                    <Textarea
                      placeholder="Enter any additional notes..."
                      maxLength="200"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div>
                <Field label="Next Assessment Due" icon={AccessTimeOutlinedIcon}>
                  <Select value={nextDue} onChange={(e) => setNextDue(e.target.value)}>
                    <option value="11:00 AM (In 1 hour)">11:00 AM (In 1 hour)</option>
                    <option value="12:00 PM (In 2 hours)">12:00 PM (In 2 hours)</option>
                    <option value="End of session">End of session</option>
                  </Select>
                </Field>

                <div style={{ marginTop: '18px' }}>
                  <LibraryCheckbox
                    isChecked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                  >
                    Notify Nurse / Doctor ⓘ
                  </LibraryCheckbox>
                </div>
              </div>
            </div>

            {error && <div className="during-error" style={{ marginTop: '14px' }}>{error}</div>}
            {info && <div className="during-alert success" style={{ marginTop: '14px' }}>{info}</div>}

            <div className="during-form-actions" style={{ marginTop: '16px' }}>
              <LibraryButton
                variant="outline"
                onClick={() => {
                  setOverallStatus('Good / Functional');
                  setIntervention('');
                  setAdditionalNotes('');
                }}
              >
                Reset
              </LibraryButton>
              <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>
                {saving ? 'Saving...' : 'Save Assessment'}
              </LibraryButton>
            </div>
          </Card>
        </div>

        {/* Right Column: Access Summary + Access Health Indicator + Guidance + Quick Actions */}
        <div style={{ minWidth: 0 }}>
          {/* Card 1: Access Summary */}
          <Card title="Access Summary">
            <div className="during-card-header" style={{ marginTop: '-24px' }}>
              <span />
              <span className="during-status-pill alert">Good / Functional</span>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>🔗 Access Type</span>
                <strong>AV Fistula (Left)</strong>
              </div>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>📍 Location</span>
                <strong>Left Forearm</strong>
              </div>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>📅 Date Created</span>
                <strong>15 Mar 2022</strong>
              </div>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>⏱ Last Reviewed</span>
                <strong>12 May 2025</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button type="button" className="during-card-action-link">
                View Access History →
              </button>
            </div>
          </Card>

          {/* Card 2: Access Health Indicator */}
          <Card title="Access Health Indicator">
            <AccessHealthGaugeSVG score={95} />
          </Card>

          {/* Card 3: Clinical Guidance */}
          <div className="during-clinical-guidance-card">
            <div className="during-clinical-guidance-header">
              <SettingsOutlinedIcon fontSize="small" />
              <span>Clinical Guidance</span>
            </div>
            <div className="during-clinical-guidance-text">
              Maintain adequate blood flow (BFR 250-300 mL/min). Inspect access site regularly for early signs of complications.
            </div>
            <button type="button" className="during-card-action-link">
              View Guidelines →
            </button>
          </div>

          {/* Card 4: Quick Actions Grid */}
          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-04')}>
                <div className="during-vitals-qa-tile-left">
                  <HealingOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Record Symptoms</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>

              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-02')}>
                <div className="during-vitals-qa-tile-left">
                  <MonitorHeartOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Record Vitals</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>

              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-07')}>
                <div className="during-vitals-qa-tile-left">
                  <WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Alarm Management</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>

              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-08')}>
                <div className="during-vitals-qa-tile-left">
                  <ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                  <span>Treatment Progress</span>
                </div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-04')}>
          ← Back
        </LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>
            Save as Draft
          </LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>
            Save & Continue →
          </LibraryButton>
        </div>
      </div>
    </>
  );
}

function MedicationAdministrationView({ sessionId, go, patientId }) {
  const [form, setForm] = useState({
    medication: '',
    indication: '',
    dose: '',
    unit: 'mg',
    route: 'IV',
    administered_at: nowTime(),
    administered_by: 'Rahul Singh (Technician)',
    lot_number: '',
    expiry_date: '',
    adverse_reaction: 'No',
    reaction_details: '',
    notes: '',
  });

  const [preVitals, setPreVitals] = useState({ sbp: '118', dbp: '76', pulse: '78', spo2: '98' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [dueMeds, setDueMeds] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [history, setHistory] = useState([
    { id: 1, time: '09:05 AM', medication: 'Heparin (Loading Dose)', dose: '1,000 Units', route: 'IV', indication: 'Anticoagulation', by: 'Rahul Singh', status: 'Administered', notes: 'No adverse reaction' },
    { id: 2, time: '09:45 AM', medication: 'Iron Sucrose', dose: '100 mg', route: 'IV', indication: 'Iron Deficiency', by: 'Rahul Singh', status: 'Administered', notes: 'Tolerated well' },
    { id: 3, time: '—', medication: 'Epoetin Alfa', dose: '4,000 Units', route: 'IV', indication: 'Anemia (CKD)', by: '—', status: 'Pending', notes: 'Due at 11:30 AM' },
  ]);

  const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';

  useEffect(() => {
    if (!activeSessionId || activeSessionId === 'preview') return;
    getDueMedications(activeSessionId).then((res) => {
      if (res?.success) {
        const d = responseData(res);
        setDueMeds(Array.isArray(d) ? d : d.items || d.medications || []);
      }
    });
    if (patientId) {
      getPatientAllergies(patientId).then((res) => {
        if (res?.success) {
          const d = responseData(res);
          setAllergies(Array.isArray(d) ? d : d.items || d.allergies || []);
        }
      });
    }
  }, [sessionId, patientId]);

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const executeSave = async () => {
    if (!form.medication || !form.dose || !form.route) {
      setError('Medication, dose, and route are required.');
      return false;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      pre_vitals: preVitals,
      recorded_at: new Date().toISOString(),
    };

    const res = await createMedicationAdministration(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to record medication administration.';
      setError(errMsg);
      return false;
    }

    setInfo('Medication administration recorded successfully.');
    setHistory((prev) => [
      {
        id: Date.now(),
        time: form.administered_at,
        medication: form.medication,
        dose: `${form.dose} ${form.unit}`,
        route: form.route,
        indication: form.indication || '—',
        by: form.administered_by,
        status: 'Administered',
        notes: form.notes || (form.adverse_reaction === 'Yes' ? form.reaction_details : 'No adverse reaction'),
      },
      ...prev,
    ]);
    return true;
  };

  const handleSaveOnly = async () => { await executeSave(); };
  const handleSaveAndExit = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveAndContinue = async () => { const ok = await executeSave(); if (ok) go('P3-07'); };

  return (
    <>
      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title="Add Medication Administration">
            {/* Form grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <Field label="Medication *" icon={MedicationOutlinedIcon}>
                <Select value={form.medication} onChange={update('medication')}>
                  <option value="">Search medication</option>
                  <option value="Heparin (Loading Dose)">Heparin (Loading Dose)</option>
                  <option value="Iron Sucrose">Iron Sucrose</option>
                  <option value="Epoetin Alfa">Epoetin Alfa</option>
                  <option value="Normal Saline 0.9%">Normal Saline 0.9%</option>
                  <option value="Ondansetron">Ondansetron</option>
                  <option value="Paracetamol">Paracetamol</option>
                </Select>
              </Field>

              <Field label="Indication">
                <Select value={form.indication} onChange={update('indication')}>
                  <option value="">Select indication</option>
                  <option value="Anticoagulation">Anticoagulation</option>
                  <option value="Iron Deficiency">Iron Deficiency</option>
                  <option value="Anemia (CKD)">Anemia (CKD)</option>
                  <option value="Volume Expansion">Volume Expansion</option>
                  <option value="Nausea / Vomiting">Nausea / Vomiting</option>
                </Select>
              </Field>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Dose *</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Input type="text" placeholder="e.g. 500" value={form.dose} onChange={update('dose')} style={{ flex: 1 }} />
                  <Select value={form.unit} onChange={update('unit')} style={{ width: '80px' }}>
                    <option value="mg">mg</option>
                    <option value="Units">Units</option>
                    <option value="mL">mL</option>
                    <option value="mcg">mcg</option>
                  </Select>
                </div>
              </div>

              <Field label="Route *">
                <Select value={form.route} onChange={update('route')}>
                  <option value="IV">IV</option>
                  <option value="IV Bolus">IV Bolus</option>
                  <option value="IV Infusion">IV Infusion</option>
                  <option value="Subcutaneous">Subcutaneous</option>
                  <option value="Oral">Oral</option>
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <Field label="Administration Time *" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.administered_at} onChange={update('administered_at')} />
              </Field>

              <Field label="Administered By *" icon={PersonOutlinedIcon}>
                <Select value={form.administered_by} onChange={update('administered_by')}>
                  <option value="Rahul Singh (Technician)">Rahul Singh (Technician)</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                </Select>
              </Field>

              <Field label="Lot / Batch No.">
                <Input type="text" placeholder="Enter lot / batch no." value={form.lot_number} onChange={update('lot_number')} />
              </Field>

              <Field label="Expiry Date">
                <Input type="text" placeholder="DD MMM YYYY" value={form.expiry_date} onChange={update('expiry_date')} />
              </Field>
            </div>

            {/* Sub-panels Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="during-med-vitals-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: '8px' }}>
                  <MonitorHeartOutlinedIcon fontSize="small" />
                  <span>Pre Medication Vitals</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>BP (mmHg)</label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <Input type="text" value={preVitals.sbp} onChange={(e) => setPreVitals((v) => ({ ...v, sbp: e.target.value }))} style={{ width: '45px', textAlign: 'center' }} />
                      <span>/</span>
                      <Input type="text" value={preVitals.dbp} onChange={(e) => setPreVitals((v) => ({ ...v, dbp: e.target.value }))} style={{ width: '45px', textAlign: 'center' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Pulse (bpm)</label>
                    <Input type="text" value={preVitals.pulse} onChange={(e) => setPreVitals((v) => ({ ...v, pulse: e.target.value }))} style={{ width: '60px', textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>SpO₂ (%)</label>
                    <Input type="text" value={preVitals.spo2} onChange={(e) => setPreVitals((v) => ({ ...v, spo2: e.target.value }))} style={{ width: '60px', textAlign: 'center' }} />
                  </div>
                </div>
              </div>

              <div className="during-med-observation-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>
                  <HealingOutlinedIcon fontSize="small" />
                  <span>Post Medication Observation</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Any Adverse Reaction?</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button type="button" className={`during-severity-btn ${form.adverse_reaction === 'No' ? 'active-green' : ''}`} onClick={() => setForm((v) => ({ ...v, adverse_reaction: 'No' }))} style={{ padding: '4px 12px', fontSize: '11px' }}>No</button>
                      <button type="button" className={`during-severity-btn ${form.adverse_reaction === 'Yes' ? 'active-red' : ''}`} onClick={() => setForm((v) => ({ ...v, adverse_reaction: 'Yes' }))} style={{ padding: '4px 12px', fontSize: '11px' }}>Yes</button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input type="text" placeholder="Describe reaction (if any)" value={form.reaction_details} onChange={update('reaction_details')} />
                  </div>
                </div>
              </div>
            </div>

            <Field label="Additional Notes">
              <Textarea placeholder="Enter any additional notes..." maxLength="250" value={form.notes} onChange={update('notes')} />
            </Field>

            {error && <div className="during-error" style={{ marginTop: '12px' }}>{error}</div>}
            {info && <div className="during-alert success" style={{ marginTop: '12px' }}>{info}</div>}

            <div className="during-form-actions" style={{ marginTop: '16px' }}>
              <LibraryButton variant="outline" onClick={() => setForm({ medication: '', indication: '', dose: '', unit: 'mg', route: 'IV', administered_at: nowTime(), administered_by: 'Rahul Singh (Technician)', lot_number: '', expiry_date: '', adverse_reaction: 'No', reaction_details: '', notes: '' })}>Reset</LibraryButton>
              <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>{saving ? 'Saving...' : 'Save Medication'}</LibraryButton>
            </div>
          </Card>

          {/* History Card */}
          <Card title="Medication Administration History" style={{ marginTop: '16px' }}>
            <div className="during-overdue-table-wrap">
              <table className="during-overdue-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Medication</th>
                    <th>Dose</th>
                    <th>Route</th>
                    <th>Indication</th>
                    <th>Administered By</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{row.time}</td>
                      <td><strong>{row.medication}</strong></td>
                      <td>{row.dose}</td>
                      <td>{row.route}</td>
                      <td>{row.indication}</td>
                      <td>{row.by}</td>
                      <td>
                        <span className={`during-status-pill ${row.status === 'Administered' ? 'alert' : ''}`} style={row.status === 'Pending' ? { background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' } : {}}>
                          {row.status}
                        </span>
                      </td>
                      <td>{row.notes}</td>
                      <td><EditOutlinedIcon sx={{ fontSize: 16, color: '#64748b', cursor: 'pointer' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">View Full Medication History →</button>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ minWidth: 0 }}>
          <Card title="Today's Medications Summary">
            <div className="during-med-summary-grid">
              <div className="during-med-stat-tile prescribed">
                <MedicationOutlinedIcon sx={{ color: '#2563eb' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>3</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Total Prescribed</span>
                </div>
              </div>
              <div className="during-med-stat-tile administered">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>2</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Administered</span>
                </div>
              </div>
              <div className="during-med-stat-tile pending">
                <AccessTimeOutlinedIcon sx={{ color: '#d97706' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>1</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Pending</span>
                </div>
              </div>
              <div className="during-med-stat-tile missed">
                <WarningAmberOutlinedIcon sx={{ color: '#dc2626' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>0</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Missed</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Medication Reminders" style={{ marginTop: '16px' }}>
            <div className="during-med-reminders-list">
              <div className="during-med-reminder-item">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>Heparin (Loading Dose)</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Dose: 1,000 Units | Route: IV</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="during-due-badge">Due at 10:30 AM</span>
                  <ChevronRightOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                </div>
              </div>

              <div className="during-med-reminder-item">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>Epoetin Alfa</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Dose: 4,000 Units | Route: IV</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="during-due-badge">Due at 11:30 AM</span>
                  <ChevronRightOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                </div>
              </div>

              <div className="during-med-reminder-item">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>Iron Sucrose</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Dose: 100 mg | Route: IV</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="during-due-badge">Due at 12:00 PM</span>
                  <ChevronRightOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">View All Reminders →</button>
            </div>
          </Card>

          <div className="during-clinical-guidance-card" style={{ background: '#fcf5ff', borderColor: '#f3e8ff' }}>
            <div className="during-clinical-guidance-header" style={{ color: '#7e22ce' }}>
              <MedicationOutlinedIcon fontSize="small" />
              <span>Clinical Guidelines</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#581c87' }}>
              Ensure correct medication, dose, route and time. Monitor for any adverse reactions during and after administration.
            </div>
            <button type="button" className="during-card-action-link">View Guidelines →</button>
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile">
                <div className="during-vitals-qa-tile-left"><NoteAltOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>View Prescription</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-02')}>
                <div className="during-vitals-qa-tile-left"><MonitorHeartOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Record Vitals</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-04')}>
                <div className="during-vitals-qa-tile-left"><HealingOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Add Symptom</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-08')}>
                <div className="during-vitals-qa-tile-left"><ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Treatment Progress</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-05')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>Save as Draft</LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>Save & Continue →</LibraryButton>
        </div>
      </div>
    </>
  );
}

function AlarmManagementView({ sessionId, go }) {
  const [form, setForm] = useState({
    alarm_time: nowTime(),
    alarm_type: 'High Venous Pressure',
    severity: 'High',
    related_parameter: 'Venous Pressure (VP)',
    alarm_code: 'A-204',
    description: 'Venous pressure exceeds upper limit',
    current_value: '245',
    threshold: '> 230 mmHg',
    duration: '02:15',
    action_taken: 'Reduced BFR',
    additional_actions: 'Repositioned patient, flushed line',
    resolved_by: 'Rahul Singh (Technician)',
    resolution_time: '10:37 AM',
    resolution_status: 'Resolved',
    patient_impact: 'No adverse effect',
    escalated_to: '-',
    escalation_time: '',
    comments: 'Venous pressure normalized after reducing BFR and flushing line.',
    notify: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [history, setHistory] = useState([
    { id: 1, time: '10:32 AM', type: 'High Venous Pressure', severity: 'High', parameter: 'Venous Pressure (VP)', duration: '02:15 min', action: 'Reduced BFR, Flushed Line', status: 'Resolved', by: 'Rahul Singh' },
    { id: 2, time: '09:48 AM', type: 'Low Arterial Pressure', severity: 'Moderate', parameter: 'Arterial Pressure (AP)', duration: '01:40 min', action: 'Adjusted Needle Position', status: 'Resolved', by: 'Rahul Singh' },
    { id: 3, time: '09:15 AM', type: 'Air in Blood Line', severity: 'High', parameter: 'Air Detector', duration: '00:45 min', action: 'Cleared Air, Restarted Pump', status: 'Resolved', by: 'Rahul Singh' },
    { id: 4, time: '08:22 AM', type: 'Conductivity High', severity: 'Low', parameter: 'Conductivity', duration: '00:30 min', action: 'Checked Dialysate Concentrate', status: 'Resolved', by: 'Rahul Singh' },
  ]);

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const executeSave = async () => {
    if (!form.alarm_type || !form.action_taken || !form.resolved_by) {
      setError('Alarm type, action taken, and resolved by are required.');
      return false;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      recorded_at: new Date().toISOString(),
    };

    const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';
    const res = await createAlarm(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to save alarm record.';
      setError(errMsg);
      return false;
    }

    setInfo('Alarm record saved successfully.');
    setHistory((prev) => [
      {
        id: Date.now(),
        time: form.alarm_time,
        type: form.alarm_type,
        severity: form.severity,
        parameter: form.related_parameter,
        duration: form.duration ? `${form.duration} min` : '—',
        action: form.action_taken,
        status: form.resolution_status,
        by: form.resolved_by,
      },
      ...prev,
    ]);
    return true;
  };

  const handleSaveOnly = async () => { await executeSave(); };
  const handleSaveAndExit = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveAndContinue = async () => { const ok = await executeSave(); if (ok) go('P3-08'); };

  return (
    <>
      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title="Record New Alarm">
            {/* Form grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Alarm Time *" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.alarm_time} onChange={update('alarm_time')} />
              </Field>

              <Field label="Alarm Type *">
                <Select value={form.alarm_type} onChange={update('alarm_type')}>
                  <option value="High Venous Pressure">High Venous Pressure</option>
                  <option value="Low Arterial Pressure">Low Arterial Pressure</option>
                  <option value="Air in Blood Line">Air in Blood Line</option>
                  <option value="Conductivity High">Conductivity High</option>
                  <option value="High TMP">High TMP</option>
                  <option value="Blood Leak">Blood Leak</option>
                </Select>
              </Field>

              <Field label="Severity *">
                <Select value={form.severity} onChange={update('severity')}>
                  <option value="High">🔴 High</option>
                  <option value="Moderate">🟡 Moderate</option>
                  <option value="Low">🔵 Low</option>
                </Select>
              </Field>

              <Field label="Related Parameter">
                <Select value={form.related_parameter} onChange={update('related_parameter')}>
                  <option value="Venous Pressure (VP)">Venous Pressure (VP)</option>
                  <option value="Arterial Pressure (AP)">Arterial Pressure (AP)</option>
                  <option value="Air Detector">Air Detector</option>
                  <option value="Conductivity">Conductivity</option>
                  <option value="TMP">TMP</option>
                </Select>
              </Field>

              <Field label="Alarm Code (if any)">
                <Input type="text" value={form.alarm_code} onChange={update('alarm_code')} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <Field label="Alarm Description">
                <Input type="text" value={form.description} onChange={update('description')} />
              </Field>

              <Field label="Current Value">
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Input type="text" value={form.current_value} onChange={update('current_value')} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>mmHg</span>
                </div>
              </Field>

              <Field label="Threshold / Limit">
                <Input type="text" value={form.threshold} onChange={update('threshold')} />
              </Field>

              <Field label="Duration">
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Input type="text" value={form.duration} onChange={update('duration')} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>min</span>
                </div>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Action Taken *">
                <Select value={form.action_taken} onChange={update('action_taken')}>
                  <option value="Reduced BFR">Reduced BFR</option>
                  <option value="Adjusted Needle Position">Adjusted Needle Position</option>
                  <option value="Cleared Air, Restarted Pump">Cleared Air, Restarted Pump</option>
                  <option value="Checked Dialysate Concentrate">Checked Dialysate Concentrate</option>
                  <option value="Flushed Line">Flushed Line</option>
                </Select>
              </Field>

              <Field label="Additional Actions">
                <Input type="text" value={form.additional_actions} onChange={update('additional_actions')} />
              </Field>

              <Field label="Resolved By *">
                <Select value={form.resolved_by} onChange={update('resolved_by')}>
                  <option value="Rahul Singh (Technician)">Rahul Singh (Technician)</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                </Select>
              </Field>

              <Field label="Resolution Time" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.resolution_time} onChange={update('resolution_time')} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Resolution Status *">
                <Select value={form.resolution_status} onChange={update('resolution_status')}>
                  <option value="Resolved">✔ Resolved</option>
                  <option value="Pending">⏱ Pending</option>
                  <option value="Escalated">⚠️ Escalated</option>
                </Select>
              </Field>

              <Field label="Patient Impact">
                <Select value={form.patient_impact} onChange={update('patient_impact')}>
                  <option value="No adverse effect">No adverse effect</option>
                  <option value="Mild discomfort">Mild discomfort</option>
                  <option value="Treatment delayed">Treatment delayed</option>
                </Select>
              </Field>

              <Field label="Escalated To">
                <Select value={form.escalated_to} onChange={update('escalated_to')}>
                  <option value="-">-</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                  <option value="Senior Nurse">Senior Nurse</option>
                </Select>
              </Field>

              <Field label="Escalation Time">
                <Input type="text" placeholder="Select time" value={form.escalation_time} onChange={update('escalation_time')} />
              </Field>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Field label="Comments">
                  <Textarea placeholder="Venous pressure normalized after reducing BFR..." maxLength="300" value={form.comments} onChange={update('comments')} />
                </Field>
              </div>
              <div style={{ width: '220px', paddingTop: '24px' }}>
                <LibraryCheckbox isChecked={form.notify} onChange={(e) => setForm((v) => ({ ...v, notify: e.target.checked }))}>
                  Notify Nurse / Doctor ⓘ
                </LibraryCheckbox>
              </div>
            </div>

            {error && <div className="during-error" style={{ marginTop: '12px' }}>{error}</div>}
            {info && <div className="during-alert success" style={{ marginTop: '12px' }}>{info}</div>}

            <div className="during-form-actions" style={{ marginTop: '16px' }}>
              <LibraryButton variant="outline" onClick={() => setForm({ alarm_time: nowTime(), alarm_type: 'High Venous Pressure', severity: 'High', related_parameter: 'Venous Pressure (VP)', alarm_code: 'A-204', description: '', current_value: '', threshold: '', duration: '', action_taken: '', additional_actions: '', resolved_by: 'Rahul Singh (Technician)', resolution_time: '', resolution_status: 'Resolved', patient_impact: 'No adverse effect', escalated_to: '-', escalation_time: '', comments: '', notify: false })}>Reset</LibraryButton>
              <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>{saving ? 'Saving...' : 'Save Alarm'}</LibraryButton>
            </div>
          </Card>

          {/* Alarm History Table */}
          <Card title="Alarm History (This Session)" style={{ marginTop: '16px' }}>
            <div className="during-overdue-table-wrap">
              <table className="during-overdue-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Alarm Type</th>
                    <th>Severity</th>
                    <th>Parameter</th>
                    <th>Duration</th>
                    <th>Action Taken</th>
                    <th>Status</th>
                    <th>Resolved By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{row.time}</td>
                      <td><strong>{row.type}</strong></td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: row.severity === 'High' ? '#dc2626' : row.severity === 'Moderate' ? '#d97706' : '#2563eb' }}>
                          ● {row.severity}
                        </span>
                      </td>
                      <td>{row.parameter}</td>
                      <td>{row.duration}</td>
                      <td>{row.action}</td>
                      <td><span className="during-status-pill alert">{row.status}</span></td>
                      <td>{row.by}</td>
                      <td><VisibilityOutlinedIcon sx={{ fontSize: 16, color: '#64748b', cursor: 'pointer' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">View Full Alarm History →</button>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ minWidth: 0 }}>
          <Card title="Alarm Overview">
            <div className="during-alarm-overview-grid">
              <div className="during-alarm-stat-tile" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                <WarningAmberOutlinedIcon sx={{ color: '#dc2626' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>3</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Total Alarms</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>3</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Resolved</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                <AccessTimeOutlinedIcon sx={{ color: '#d97706' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>0</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Active</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                <TrendingUpOutlinedIcon sx={{ color: '#2563eb' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>0</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Escalated</span></div>
              </div>
            </div>
          </Card>

          <Card title="Active Alarm (Now)" style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 40, color: '#16a34a', marginBottom: '8px' }} />
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#15803d' }}>No Active Alarms</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>All parameters are within safe limits.</div>
            </div>
          </Card>

          <div className="during-safety-guidance-card">
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Safety Guidance</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#713f12' }}>
              High venous pressure may indicate kinking, clotting, or improper needle position. Resolve promptly to prevent treatment interruption.
            </div>
            <button type="button" className="during-card-action-link">View Guidelines →</button>
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-03')}>
                <div className="during-vitals-qa-tile-left"><MonitorHeartOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>View Machine Parameters</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-04')}>
                <div className="during-vitals-qa-tile-left"><HealingOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Symptom Log</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-08')}>
                <div className="during-vitals-qa-tile-left"><ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Treatment Progress</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-09')}>
                <div className="during-vitals-qa-tile-left"><WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Incident Reporting</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-06')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>Save as Draft</LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>Save & Continue →</LibraryButton>
        </div>
      </div>
    </>
  );
}

function ProgressRingGaugeSVG({ title, value, unit, sub, status, statusColor, percent = 65, strokeColor = '#2563eb' }) {
  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="during-progress-ring-card">
      <div className="during-progress-ring-card-title">{title}</div>
      <div style={{ position: 'relative', width: '76px', height: '76px' }}>
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 38 38)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{value}</strong>
          <span style={{ fontSize: '9px', color: '#64748b' }}>{unit}</span>
        </div>
      </div>
      <div className="during-progress-ring-card-sub">{sub}</div>
      <div className={`during-progress-ring-card-status ${statusColor}`}>{status}</div>
    </div>
  );
}

function TreatmentProgressView({ sessionId, go }) {
  const [comments, setComments] = useState('');
  const [nextReview, setNextReview] = useState('11:15 AM');
  const [notify, setNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [parameters] = useState([
    { name: 'Blood Flow Rate (BFR)', val: '300 mL/min', target: '300 - 350 mL/min', status: 'On Target' },
    { name: 'Dialysate Flow Rate (DFR)', val: '500 mL/min', target: '500 mL/min', status: 'On Target' },
    { name: 'UF Rate', val: '620 mL/hr', target: '500 - 800 mL/hr', status: 'On Target' },
    { name: 'TMP', val: '68 mmHg', target: '< 120 mmHg', status: 'On Target' },
    { name: 'Venous Pressure (VP)', val: '160 mmHg', target: '< 250 mmHg', status: 'On Target' },
    { name: 'Arterial Pressure (AP)', val: '-180 mmHg', target: '-50 to -250 mmHg', status: 'On Target' },
    { name: 'Dialysate Conductivity', val: '13.8 mS/cm', target: '13.6 - 14.2 mS/cm', status: 'On Target' },
  ]);

  const [events, setEvents] = useState([
    { id: 1, time: '09:15 AM', title: 'UF goal adjusted', details: 'Adjusted UF goal from 2.5 L to 2.5 L', by: 'Rahul Singh' },
    { id: 2, time: '08:40 AM', title: 'Patient repositioned', details: 'Due to back discomfort', by: 'Rahul Singh' },
    { id: 3, time: '08:10 AM', title: 'UF rate reduced', details: 'Reduced UF rate from 700 to 600 mL/hr', by: 'Rahul Singh' },
  ]);

  const executeSave = async () => {
    setSaving(true);
    setError('');

    const payload = {
      comments,
      next_review_time: nextReview,
      notify_flag: notify,
      recorded_at: new Date().toISOString(),
    };

    const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';
    const res = await createTreatmentEvent(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to save treatment progress event.';
      setError(errMsg);
      return false;
    }

    setInfo('Treatment Progress record saved successfully.');
    return true;
  };

  const handleSaveAndExit = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveAndContinue = async () => { const ok = await executeSave(); if (ok) go('P3-09'); };

  return (
    <>
      {/* 6 Circular Progress Rings Header Grid */}
      <div className="during-progress-rings-grid">
        <ProgressRingGaugeSVG title="Elapsed Time" value="02:35" unit="hr:min" sub="of 04:00 hr" status="65% Completed" statusColor="blue" percent={65} strokeColor="#2563eb" />
        <ProgressRingGaugeSVG title="Remaining Time" value="01:25" unit="hr:min" sub="Remaining" status="35% Remaining" statusColor="green" percent={35} strokeColor="#16a34a" />
        <ProgressRingGaugeSVG title="UF Target" value="2.5" unit="L" sub="Goal" status="Set at start" statusColor="purple" percent={100} strokeColor="#8b5cf6" />
        <ProgressRingGaugeSVG title="UF Achieved" value="1.65" unit="L" sub="Achieved" status="66% of target" statusColor="blue" percent={66} strokeColor="#2563eb" />
        <ProgressRingGaugeSVG title="Blood Processed" value="58.2" unit="L" sub="Total Processed" status="Adequate" statusColor="green" percent={80} strokeColor="#f97316" />
        <ProgressRingGaugeSVG title="Treatment Efficiency (Kt/V)" value="1.32" unit="" sub="Calculated" status="Adequate" statusColor="teal" percent={85} strokeColor="#0d9488" />
      </div>

      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          {/* Treatment Parameters Table */}
          <Card title="Treatment Parameters">
            <div className="during-overdue-table-wrap">
              <table className="during-overdue-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Current Value</th>
                    <th>Prescription / Target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((p) => (
                    <tr key={p.name}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.val}</td>
                      <td>{p.target}</td>
                      <td><span className="during-status-pill alert">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Treatment Interventions / Events */}
          <Card title="Treatment Interventions / Events" style={{ marginTop: '16px' }}>
            <div className="during-card-header" style={{ marginTop: '-24px', marginBottom: '12px' }}>
              <span />
              <LibraryButton variant="outline" size="sm">+ Add Event</LibraryButton>
            </div>
            <div className="during-events-list">
              {events.map((ev) => (
                <div key={ev.id} className="during-event-item">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '11px', color: '#64748b' }}>{ev.time}</strong>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{ev.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{ev.details}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ev.by}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">View Full Trends →</button>
            </div>
          </Card>

          {/* Comments & Next Review Time */}
          <Card style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <Field label="Comments">
                <Textarea placeholder="Enter any observations or comments..." maxLength="300" value={comments} onChange={(e) => setComments(e.target.value)} />
              </Field>
              <div>
                <Field label="Next Review Time" icon={AccessTimeOutlinedIcon}>
                  <Input type="text" value={nextReview} onChange={(e) => setNextReview(e.target.value)} />
                </Field>
                <div style={{ marginTop: '16px' }}>
                  <LibraryCheckbox isChecked={notify} onChange={(e) => setNotify(e.target.checked)}>
                    Notify Nurse / Doctor ⓘ
                  </LibraryCheckbox>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ minWidth: 0 }}>
          <Card title="Real-time Summary">
            <div style={{ fontSize: '12px' }}>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Session Start Time</span><strong>07:45 AM</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Planned Duration</span><strong>04:00 hr</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Current Time</span><strong>10:20 AM</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Elapsed Time</span><strong>02:35 hr (65%)</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Remaining Time</span><strong>01:25 hr (35%)</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>UF Target</span><strong>2.5 L</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>UF Achieved</span><strong>1.65 L (66%)</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Blood Processed</span><strong>58.2 L</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Kt/V (Estimated)</span><strong>1.32</strong></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">View Parameter Trends →</button>
            </div>
          </Card>

          {/* Progress Line Chart Card */}
          <Card title="Progress Chart" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>
              <span>— UF Achieved (L)</span>
              <span>-- UF Target (L)</span>
            </div>
            <div style={{ width: '100%', height: '100px' }}>
              <svg width="100%" height="100%" viewBox="0 0 240 90" preserveAspectRatio="none">
                <line x1="20" y1="80" x2="230" y2="80" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M 20 80 Q 120 40 230 20" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 20 80 Q 120 50 230 35 L 230 80 L 20 80 Z" fill="rgba(37,99,235,0.1)" />
                <path d="M 20 80 Q 120 50 230 35" fill="none" stroke="#2563eb" strokeWidth="2" />
                <circle cx="230" cy="35" r="4" fill="#2563eb" />
              </svg>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button type="button" className="during-card-action-link">View Full Trends →</button>
            </div>
          </Card>

          <div className="during-safety-guidance-card">
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Clinical Guidance</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#713f12' }}>
              Monitor treatment progress to ensure adequate dose (Kt/V ≥ 1.2) and UF goal achievement. Adjust parameters as per patient tolerance.
            </div>
            <button type="button" className="during-card-action-link">View Guidelines →</button>
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-03')}>
                <div className="during-vitals-qa-tile-left"><TrendingUpOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Parameter Trends</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-04')}>
                <div className="during-vitals-qa-tile-left"><NoteAltOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Intervention Log</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-07')}>
                <div className="during-vitals-qa-tile-left"><WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Alarm History</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-09')}>
                <div className="during-vitals-qa-tile-left"><WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Incident Reporting</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-07')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>Save as Draft</LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>Save & Continue →</LibraryButton>
        </div>
      </div>
    </>
  );
}

function IncidentReportingView({ sessionId, go }) {
  const [form, setForm] = useState({
    event_time: nowTime(),
    incident_type: 'Hypotension',
    category: 'Clinical',
    severity: 'Moderate',
    description: 'Patient developed hypotension (BP dropped to 82/48 mmHg) with dizziness and nausea.',
    cause: 'UF rate too high',
    observed_time: '10:30 AM',
    intervention: 'UF rate reduced',
    intervention_details: 'UF rate reduced from 800 to 500 mL/hr. NS 100 mL bolus given.',
    outcome: 'Stabilized',
    escalated_to: 'Nurse In-charge',
    escalation_time: '10:38 AM',
    further_action: 'No',
    followup: 'Yes',
    resolved_by: 'Rahul Singh (Technician)',
    resolution_time: '10:55 AM',
    comments: 'BP stabilized to 110/64 mmHg. Patient comfortable and resting.',
    notify: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [incidents, setIncidents] = useState([
    { id: 1, time: '10:35 AM', type: 'Hypotension', status: 'Resolved at 10:55 AM', severity: 'Moderate' },
    { id: 2, time: '09:15 AM', type: 'Air in Blood Line', status: 'Resolved at 09:25 AM', severity: 'Low' },
    { id: 3, time: '08:20 AM', type: 'Machine Alarm', status: 'Resolved at 08:28 AM', severity: 'Low' },
  ]);

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const executeSave = async () => {
    if (!form.incident_type || !form.description || !form.intervention) {
      setError('Incident type, description, and intervention are required.');
      return false;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      recorded_at: new Date().toISOString(),
    };

    const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';
    const res = await createIncident(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to save incident report.';
      setError(errMsg);
      return false;
    }

    setInfo('Incident report saved successfully.');
    setIncidents((prev) => [
      {
        id: Date.now(),
        time: form.event_time,
        type: form.incident_type,
        status: `Resolved at ${form.resolution_time || 'now'}`,
        severity: form.severity,
      },
      ...prev,
    ]);
    return true;
  };

  const handleSaveOnly = async () => { await executeSave(); };
  const handleSaveAndExit = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveAndContinue = async () => { const ok = await executeSave(); if (ok) go('P3-10'); };

  return (
    <>
      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title="Report New Incident / Event">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Event Time *" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.event_time} onChange={update('event_time')} />
              </Field>

              <Field label="Incident Type *">
                <Select value={form.incident_type} onChange={update('incident_type')}>
                  <option value="Hypotension">Hypotension</option>
                  <option value="Cramps">Cramps</option>
                  <option value="Air Leak">Air Leak</option>
                  <option value="Clotting">Clotting</option>
                  <option value="Infiltration">Infiltration</option>
                  <option value="Equipment Failure">Equipment Failure</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>

              <Field label="Event Category *">
                <Select value={form.category} onChange={update('category')}>
                  <option value="Clinical">Clinical</option>
                  <option value="Technical">Technical</option>
                  <option value="Procedural">Procedural</option>
                  <option value="Operational">Operational</option>
                </Select>
              </Field>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Severity *</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['Low', 'Moderate', 'High'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      className={`during-severity-btn ${form.severity === sev ? (sev === 'Low' ? 'active-green' : sev === 'Moderate' ? 'active-amber' : 'active-red') : ''}`}
                      onClick={() => setForm((v) => ({ ...v, severity: sev }))}
                      style={{ flex: 1, padding: '6px 0', fontSize: '11px' }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <Field label="Description of Incident *">
                <Textarea placeholder="Patient developed hypotension..." maxLength="500" value={form.description} onChange={update('description')} />
              </Field>

              <Field label="Suspected Cause (if known)">
                <Select value={form.cause} onChange={update('cause')}>
                  <option value="UF rate too high">UF rate too high</option>
                  <option value="Access dysfunction">Access dysfunction</option>
                  <option value="Dialysate temperature">Dialysate temperature</option>
                  <option value="Unknown">Unknown</option>
                </Select>
              </Field>

              <Field label="Event Time (Observed)" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.observed_time} onChange={update('observed_time')} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <Field label="Intervention / Action Taken *">
                <Select value={form.intervention} onChange={update('intervention')}>
                  <option value="UF rate reduced">UF rate reduced</option>
                  <option value="Saline bolus given">Saline bolus given</option>
                  <option value="Needle repositioned">Needle repositioned</option>
                  <option value="Treatment paused">Treatment paused</option>
                </Select>
              </Field>

              <Field label="Intervention Details">
                <Textarea placeholder="UF rate reduced from 800 to 500 mL/hr..." maxLength="300" value={form.intervention_details} onChange={update('intervention_details')} />
              </Field>

              <Field label="Outcome / Patient Status *">
                <Select value={form.outcome} onChange={update('outcome')}>
                  <option value="Stabilized">Stabilized</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Under Observation">Under Observation</option>
                  <option value="Transferred">Transferred</option>
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Escalated To">
                <Select value={form.escalated_to} onChange={update('escalated_to')}>
                  <option value="Nurse In-charge">Nurse In-charge</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                  <option value="Technical Lead">Technical Lead</option>
                </Select>
              </Field>

              <Field label="Escalation Time" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.escalation_time} onChange={update('escalation_time')} />
              </Field>

              <Field label="Further Action Required">
                <Select value={form.further_action} onChange={update('further_action')}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </Field>

              <Field label="Follow-up Required">
                <Select value={form.followup} onChange={update('followup')}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '10px', marginBottom: '12px' }}>
              <Field label="Resolved By">
                <Select value={form.resolved_by} onChange={update('resolved_by')}>
                  <option value="Rahul Singh (Technician)">Rahul Singh (Technician)</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                </Select>
              </Field>

              <Field label="Resolution Time" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={form.resolution_time} onChange={update('resolution_time')} />
              </Field>

              <div>
                <Field label="Comments / Additional Notes">
                  <Textarea placeholder="BP stabilized to 110/64 mmHg..." maxLength="300" value={form.comments} onChange={update('comments')} />
                </Field>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <LibraryCheckbox isChecked={form.notify} onChange={(e) => setForm((v) => ({ ...v, notify: e.target.checked }))}>
                Notify Nurse / Doctor ⓘ
              </LibraryCheckbox>
              <div style={{ display: 'flex', gap: '10px' }}>
                <LibraryButton variant="outline" onClick={() => setForm({ event_time: nowTime(), incident_type: 'Hypotension', category: 'Clinical', severity: 'Moderate', description: '', cause: 'UF rate too high', observed_time: '', intervention: '', intervention_details: '', outcome: 'Stabilized', escalated_to: 'Nurse In-charge', escalation_time: '', further_action: 'No', followup: 'Yes', resolved_by: 'Rahul Singh (Technician)', resolution_time: '', comments: '', notify: true })}>Reset</LibraryButton>
                <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>{saving ? 'Saving...' : 'Save Incident'}</LibraryButton>
              </div>
            </div>

            {error && <div className="during-error" style={{ marginTop: '12px' }}>{error}</div>}
            {info && <div className="during-alert success" style={{ marginTop: '12px' }}>{info}</div>}
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ minWidth: 0 }}>
          <Card title="Incident Overview">
            <div className="during-alarm-overview-grid">
              <div className="during-alarm-stat-tile" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                <WarningAmberOutlinedIcon sx={{ color: '#dc2626' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>2</strong><span style={{ fontSize: '10px', color: '#64748b' }}>This Session</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                <AccessTimeOutlinedIcon sx={{ color: '#d97706' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>1</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Open</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>1</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Resolved</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                <TrendingUpOutlinedIcon sx={{ color: '#2563eb' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>0</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Escalated</span></div>
              </div>
            </div>
          </Card>

          <Card title="Recent Incidents (This Session)" style={{ marginTop: '16px' }}>
            <div className="during-card-header" style={{ marginTop: '-24px', marginBottom: '12px' }}>
              <span />
              <button type="button" className="during-card-action-link">View All</button>
            </div>
            <div className="during-med-reminders-list">
              {incidents.map((inc) => (
                <div key={inc.id} className="during-med-reminder-item">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px' }}>{inc.time} — {inc.type}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{inc.status}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="during-status-pill alert" style={{ background: inc.severity === 'Moderate' ? '#fffbeb' : '#f0fdf4', color: inc.severity === 'Moderate' ? '#b45309' : '#15803d' }}>
                      {inc.severity}
                    </span>
                    <ChevronRightOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="during-safety-guidance-card">
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Safety Reminder</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#713f12' }}>
              Report all incidents immediately and take appropriate action to ensure patient safety.
            </div>
            <button type="button" className="during-card-action-link">View Reporting Guidelines →</button>
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-01')}>
                <div className="during-vitals-qa-tile-left"><PersonOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>View Patient Summary</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-07')}>
                <div className="during-vitals-qa-tile-left"><WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Alarm History</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-08')}>
                <div className="during-vitals-qa-tile-left"><ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Treatment Progress</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-05')}>
                <div className="during-vitals-qa-tile-left"><HealingOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Vascular Access Details</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-08')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit} disabled={saving}>Save as Draft</LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveAndContinue} disabled={saving}>Save & Continue →</LibraryButton>
        </div>
      </div>
    </>
  );
}

function TreatmentCompletionView({ sessionId, go, onCompleted, patient }) {
  const navigate = useNavigate();
  const [disposition, setDisposition] = useState('Discharged');
  const [dischargeTime, setDischargeTime] = useState('11:25 AM');
  const [dischargedBy, setDischargedBy] = useState('Rahul Singh (Technician)');
  const [comments, setComments] = useState('Patient stable. No complaints.');
  const [sessionDate, setSessionDate] = useState('26 May 2025');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const checklistItems = [
    'Blood returned to patient',
    'Dialyzer cleared',
    'Needles removed & hemostasis achieved',
    'Access site dressed',
    'Post dialysis vitals recorded',
    'Patient education / instructions given',
    'Machine & station sanitized',
  ];

  const outcomes = [
    { label: 'UF Achieved', value: '1.65 L', sub: '66% of target', color: '#8b5cf6', icon: WaterDropOutlinedIcon },
    { label: 'Blood Processed', value: '58.2 L', sub: 'Adequate', color: '#dc2626', icon: WaterDropOutlinedIcon },
    { label: 'Kt/V (Estimated)', value: '1.32', sub: 'Adequate', color: '#2563eb', icon: MonitorHeartOutlinedIcon },
    { label: 'Avg Blood Flow (BFR)', value: '285 mL/min', sub: 'Within range', color: '#d97706', icon: AirOutlinedIcon },
    { label: 'Treatment Efficiency', value: 'Good', sub: 'No issues', color: '#0d9488', icon: CheckCircleOutlinedIcon },
  ];

  const handleCompleteSession = async () => {
    setSaving(true);
    setError('');

    const payload = {
      confirmed: true,
      disposition,
      discharge_time: dischargeTime,
      discharged_by: dischargedBy,
      comments,
      recorded_at: new Date().toISOString(),
    };

    const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';
    const res = await endDuringDialysisTreatment(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to complete treatment session.';
      setError(errMsg);
      return;
    }

    setInfo('Treatment Session completed successfully!');
    if (onCompleted) {
      onCompleted(responseData(res));
      return;
    }
    // Workflow handoff: P3-10 Completion -> P4-01 Blood Return & Termination
    navigate(`/dialysis/post/${sessionId}/P4-01`, { state: { sessionId, patient } });
  };

  const handleSaveAndExit = () => {
    writeDraft(sessionId, {
      completion_draft: {
        disposition,
        discharge_time: dischargeTime,
        discharged_by: dischargedBy,
        comments,
      },
    });
    go('P3-01');
  };

  return (
    <>
      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          {/* Overview Banner Card */}
          <Card title="Treatment Completion Overview">
            <div className="during-completion-banner">
              <div className="during-completion-banner-left">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 32 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#15803d' }}>
                    Treatment Completed Successfully
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Session completed as per prescription.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Session Start Time</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>07:45 AM</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Session End Time</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>11:20 AM</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Total Duration</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>03:35 hr</strong>
              </div>
              <div>
                <Field label="Session Date" icon={AccessTimeOutlinedIcon}>
                  <Input type="text" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          {/* Key Outcome Summary 5 Cards Row */}
          <Card title="Key Outcome Summary" style={{ marginTop: '16px' }}>
            <div className="during-completion-outcomes-row">
              {outcomes.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="during-completion-outcome-card">
                    <Icon sx={{ color: item.color, fontSize: 24 }} />
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{item.label}</span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.value}</strong>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a' }}>{item.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Lower Section 3 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
            {/* Col 1: Completion Checklist */}
            <Card title="Completion Checklist">
              <div style={{ marginTop: '-12px' }}>
                {checklistItems.map((item) => (
                  <div key={item} className="during-checklist-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{item}</span>
                    </div>
                    <span className="during-status-pill alert" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '1px 6px' }}>
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Col 2: Post Dialysis Vitals & Comments */}
            <Card title="Post Dialysis Vitals & Comments">
              <div style={{ fontSize: '11px', marginBottom: '12px' }}>
                <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>BP</span><strong>118 / 74 mmHg</strong></div>
                <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Pulse</span><strong>78 bpm</strong></div>
                <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>SpO₂</span><strong>98 %</strong></div>
                <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Temperature</span><strong>36.6 °C</strong></div>
                <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Weight</span><strong>66.4 kg</strong></div>
              </div>
              <Field label="Comments">
                <Textarea placeholder="Patient stable. No complaints." maxLength="300" value={comments} onChange={(e) => setComments(e.target.value)} />
              </Field>
            </Card>

            {/* Col 3: Patient Disposition */}
            <Card title="Patient Disposition">
              <div className="during-disposition-radio-group">
                {['Discharged', 'Referred to Doctor', 'Admitted', 'Others'].map((opt) => (
                  <label key={opt} className="during-finding-radio-item" style={{ fontSize: '12px' }}>
                    <input
                      type="radio"
                      name="patientDispositionRadio"
                      checked={disposition === opt}
                      onChange={() => setDisposition(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              <Field label="Discharge Time" icon={AccessTimeOutlinedIcon}>
                <Input type="text" value={dischargeTime} onChange={(e) => setDischargeTime(e.target.value)} />
              </Field>

              <div style={{ marginTop: '10px' }}>
                <Field label="Discharged By" icon={PersonOutlinedIcon}>
                  <Select value={dischargedBy} onChange={(e) => setDischargedBy(e.target.value)}>
                    <option value="Rahul Singh (Technician)">Rahul Singh (Technician)</option>
                    <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                  </Select>
                </Field>
              </div>
            </Card>
          </div>

          {error && <div className="during-error" style={{ marginTop: '14px' }}>{error}</div>}
          {info && <div className="during-alert success" style={{ marginTop: '14px' }}>{info}</div>}
        </div>

        {/* Right Column */}
        <div style={{ minWidth: 0 }}>
          <Card title="Session Summary">
            <div style={{ fontSize: '12px' }}>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>⏱ Planned Duration</span><strong>04:00 hr</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>⏱ Actual Duration</span><strong>03:35 hr (89%)</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>💧 UF Goal</span><strong>2.5 L</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>📈 UF Achieved</span><strong>1.65 L (66%)</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>⚙ Blood Processed</span><strong>58.2 L</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>📊 Kt/V (Estimated)</span><strong>1.32</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>⚠️ Alarms</span><strong>3 (Resolved)</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>⚠️ Incidents</span><strong>2 (1 Resolved)</strong></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link">View Full Session Report →</button>
            </div>
          </Card>

          <div className="during-clinical-guidance-card" style={{ background: '#fffdf0', borderColor: '#fef08a' }}>
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Post Dialysis Guidance</span>
            </div>
            <div className="during-guidance-bullet-list">
              <div className="during-guidance-bullet-item"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /><span>Drink advised fluids as recommended.</span></div>
              <div className="during-guidance-bullet-item"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /><span>Monitor BP and weight daily.</span></div>
              <div className="during-guidance-bullet-item"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /><span>Report any dizziness, swelling or breathlessness.</span></div>
              <div className="during-guidance-bullet-item"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /><span>Next dialysis on: 28 May 2025 (Wed)</span></div>
            </div>
            <button type="button" className="during-card-action-link">View Patient Instructions →</button>
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile">
                <div className="during-vitals-qa-tile-left"><NoteAltOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Print Summary</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile">
                <div className="during-vitals-qa-tile-left"><ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Share Report</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile">
                <div className="during-vitals-qa-tile-left"><AccessTimeOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Schedule Next Session</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile">
                <div className="during-vitals-qa-tile-left"><HealingOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Add Follow-up Note</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="during-bottom-nav-bar">
        <LibraryButton variant="outline" onClick={() => go('P3-09')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveAndExit}>Save as Draft</LibraryButton>
          <LibraryButton variant="primary" onClick={handleCompleteSession} disabled={saving} style={{ background: '#2563eb', borderColor: '#2563eb' }}>
            ✔ Complete Session
          </LibraryButton>
        </div>
      </div>
    </>
  );
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
  const content = active === 'P3-01' ? <Dashboard go={go} session={session} readings={readings} sessionId={sessionId} patient={patient} /> : active === 'P3-02' ? <VitalsForm sessionId={sessionId} readings={readings} onSaved={(entry) => setReadings((v) => [...v, entry])} go={go} /> : active === 'P3-03' ? <P303MachineParameters sessionId={sessionId} session={session} patient={patient} parameterQuestions={parameterQuestions} onSave={() => go('P3-04')} onSaveDraft={() => {}} onBack={() => go('P3-02')} /> : active === 'P3-04' ? <SymptomForm sessionId={sessionId} go={go} /> : active === 'P3-05' ? <VascularAccessMonitoringView sessionId={sessionId} go={go} /> : active === 'P3-06' ? <MedicationAdministrationView sessionId={sessionId} go={go} patientId={patientId || patient.id} /> : active === 'P3-07' ? <AlarmManagementView sessionId={sessionId} go={go} /> : active === 'P3-08' ? <TreatmentProgressView sessionId={sessionId} go={go} /> : active === 'P3-09' ? <IncidentReportingView sessionId={sessionId} go={go} /> : <TreatmentCompletionView sessionId={sessionId} go={go} onCompleted={onCompleted} patient={patient} />;
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
    <PatientBanner patient={patient} session={session} />
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
