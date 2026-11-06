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
  getVascularAccessMonitoring,
  createMedicationAdministration,
  getMedications,
  getDueMedications,
  getPatientAllergies,
  createAlarm,
  getAlarms,
  updateDuringDialysisAlarm,
  getDuringDialysisProgress,
  createTreatmentEvent,
  createIncident,
  getIncidents,
  updateIncident,
  endDuringDialysisTreatment,
  getOverdueVitals,
  skipOverdueVital,
  skipAllOverdueVitals,
} from '../../ApiCalls/dialysisSessionApis';
import { getDialysisSystolicIdByTitle, getSystolicIdByTitle } from '../../ApiCalls/readingsApis';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import { calculateAge } from '../../hooks/usePatientSummary';
import {
  evaluateBp,
  evaluatePulse,
  evaluateTemp,
  evaluateSpo2,
  evaluateRespRate,
  VITAL_SEVERITY,
} from '../../hooks/useVitalsMeasurements';
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import dialysisMachineImg from '../../assets/dialysis_machine.png';
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
const nowTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const initialPatient = { name: '', pid: '', bed: '', access: '', nephrologist: '', targetWeight: '', dryWeight: '' };
const responseData = (result) => result?.data?.data ?? result?.data ?? {};
const getValidSessionId = (sessionId, currentPatientId) => {
  const activeSessionId = String(sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '').trim();
  if (!activeSessionId || activeSessionId === 'preview' || activeSessionId === 'demo') {
    return null;
  }
  return activeSessionId;
};
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
  const p = patient.patient || patient.data?.patient || patient.data || patient || {};
  const patientName = p.name || p.patient_name || (p.id ? `Patient #${p.id}` : '—');
  const pid = p.patient_code || p.patientCode || p.pid || p.patient_id || p.id || '—';
  const rawGender = p.gender || p.sex || p.patient_gender;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || '—');
  const ageVal = p.age ? String(p.age) : (p.dob ? calculateAge(p.dob) : '—');
  const ageGender = ageVal !== '—' && gender !== '—' ? `${ageVal} Years, ${gender}` : (ageVal !== '—' ? `${ageVal} Years` : gender);
  const bloodGroup = p.bloodGroup || p.blood_group || '—';
  const dateStr = session.date || (session.created_at ? new Date(session.created_at).toLocaleDateString() : '—');
  const shiftStr = session.shift || session.shift_name || p.shift_time || '—';
  const bedStr = session.bed || p.bed_number || p.bed || session.bed_number || '—';
  const accessType = p.vascular_access || p.access || session.access || session.access_type || '—';
  const nephrologist = p.primary_doctor_name || p.nephrologist || session.nephrologist || session.doctor_name || p.doctor_name || '—';
  const prescription = session.prescription || session.dialysis_type || p.dialysis_type || 'Hemodialysis';
  const targetWeight = session.targetWeight || (session.target_weight ? `${session.target_weight} kg` : (session.uf_target ? `${session.uf_target} L` : '—'));
  const dryWeight = p.dryWeight || (p.dry_weight ? `${p.dry_weight} kg` : '—');

  return (
    <div className="during-existing-patient-card">
      <div className="p303-patient-banner">
        <div className="p303-patient-main">
          <div className="p303-patient-avatar">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <span>{patientName !== '—' ? patientName.charAt(0) : '?'}</span>
            )}
          </div>
          <div className="p303-patient-details">
            <div className="p303-patient-title-row">
              <h2>{patientName}</h2>
              <span className="p303-status-active">{patient.status || 'Active'}</span>
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
            </div>
          </div>
        </div>

        <div className="p303-patient-pills">
          <div className="p303-pill-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HealingOutlinedIcon fontSize="small" sx={{ color: '#64748b', fontSize: 14 }} />
              <span className="p303-pill-label">Access Type</span>
            </div>
            <strong className="p303-pill-val">{accessType}</strong>
          </div>
          <div className="p303-pill-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PersonOutlineIcon fontSize="small" sx={{ color: '#64748b', fontSize: 14 }} />
              <span className="p303-pill-label">Nephrologist</span>
            </div>
            <strong className="p303-pill-val">{nephrologist}</strong>
          </div>
          <div className="p303-pill-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChecklistOutlinedIcon fontSize="small" sx={{ color: '#64748b', fontSize: 14 }} />
              <span className="p303-pill-label">Prescription</span>
            </div>
            <strong className="p303-pill-val">{prescription}</strong>
          </div>
          <div className="p303-pill-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SpeedOutlinedIcon fontSize="small" sx={{ color: '#64748b', fontSize: 14 }} />
              <span className="p303-pill-label">Target Weight</span>
            </div>
            <strong className="p303-pill-val">{targetWeight}</strong>
          </div>
          <div className="p303-pill-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldOutlinedIcon fontSize="small" sx={{ color: '#64748b', fontSize: 14 }} />
              <span className="p303-pill-label">Dry Weight</span>
            </div>
            <strong className="p303-pill-val">{dryWeight}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }) { return <div className="during-metric"><small>{label}</small><strong>{value}</strong>{hint && <span>{hint}</span>}</div>; }

function TreatmentProgressRingSVG({ percent = 0, elapsedTime = '—', remainingTime = '—', totalTime = '—' }) {
  const radius = 42;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const validPercent = Math.max(0, Math.min(100, Number.isFinite(Number(percent)) ? Number(percent) : 0));
  const offset = circumference - (validPercent / 100) * circumference;

  return (
    <div className="during-progress-card-body">
      <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#16a34a"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <strong style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{validPercent}%</strong>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Completed</span>
        </div>
      </div>
      <div className="during-progress-metrics-list">
        <div className="during-progress-metric-item">
          <small>Elapsed Time</small>
          <strong style={{ color: '#16a34a' }}>{elapsedTime}</strong>
        </div>
        <div className="during-progress-metric-item">
          <small>Remaining Time</small>
          <strong style={{ color: '#2563eb' }}>{remainingTime}</strong>
        </div>
        <div className="during-progress-metric-item">
          <small>Total Prescribed Time</small>
          <strong style={{ color: '#0f172a' }}>{totalTime}</strong>
        </div>
      </div>
    </div>
  );
}

function UfProgressRingSVG({ removed = 0, target = 0, remaining = 0, rate = '—' }) {
  const numRemoved = Number.isFinite(Number(removed)) ? Number(removed) : 0;
  const numTarget = Number.isFinite(Number(target)) ? Math.max(0, Number(target)) : 0;
  const ratio = numTarget > 0 ? Math.max(0, Math.min(1, numRemoved / numTarget)) : 0;
  const arcLength = Math.PI * 45;
  const strokeDashoffset = arcLength - ratio * arcLength;
  const remainingDisplay = Number.isFinite(Number(remaining)) ? Number(remaining).toFixed(2) : '—';
  const rateDisplay = rate === undefined || rate === null || rate === '' ? '—' : rate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '130px', height: '70px', marginBottom: '8px' }}>
        <svg width="130" height="70" viewBox="0 0 130 70">
          <path d="M 15 65 A 45 45 0 0 1 115 65" fill="none" stroke="#e0f2fe" strokeWidth="12" strokeLinecap="round" />
          <path
            d="M 15 65 A 45 45 0 0 1 115 65"
            fill="none"
            stroke="#0284c7"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, textAlign: 'center' }}>
          <strong style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1 }}>{numRemoved.toFixed(2)} L</strong>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Removed</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginBottom: '6px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Target UF</span>
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>{numTarget > 0 ? `${numTarget.toFixed(2)} L` : '—'}</strong>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Remaining UF</span>
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>{remainingDisplay === '—' ? '—' : `${remainingDisplay} L`}</strong>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
        UF Rate: <strong style={{ color: '#0f172a' }}>{rateDisplay === '—' ? '—' : `${rateDisplay} mL/hr`}</strong>
      </div>
    </div>
  );
}

function trendFromValues(current, previous) {
  if (current === undefined || current === null || previous === undefined || previous === null) return null;
  const a = Number(current);
  const b = Number(previous);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a > b) return 'up';
  if (a < b) return 'down';
  return 'stable';
}

function TrendMark({ trend }) {
  if (trend === 'up') return <span style={{ color: '#16a34a', fontWeight: 800 }}>↗</span>;
  if (trend === 'down') return <span style={{ color: '#dc2626', fontWeight: 800 }}>↘</span>;
  if (trend === 'stable') return <span style={{ color: '#64748b', fontWeight: 800 }}>→</span>;
  return null;
}

function DialysisMachineIllustrationSVG() {
  return (
    <div style={{ width: '74px', height: '106px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img
        src={dialysisMachineImg}
        alt="Fresenius Dialysis Machine"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

function BloodFlowGaugeSVG({ bfr, prescribedBfr }) {
  const hasBfr = bfr !== undefined && bfr !== null && bfr !== '—' && !isNaN(Number(bfr));
  const currentBfr = hasBfr ? Math.max(0, Math.min(600, Number(bfr))) : 0;
  const percent = hasBfr ? (currentBfr / 600) * 100 : 0;
  const bfrDisplay = hasBfr ? currentBfr : '—';
  const prescribedDisplay = prescribedBfr !== undefined && prescribedBfr !== null && prescribedBfr !== '—' ? (String(prescribedBfr).includes('mL') ? prescribedBfr : `${prescribedBfr} mL/min`) : '—';

  return (
    <div className="during-blood-flow-gauge-wrap">
      <div className="during-blood-flow-callout">
        <WaterDropOutlinedIcon sx={{ color: '#dc2626', fontSize: 32 }} />
        <div>
          <strong>{bfrDisplay}</strong>
          {hasBfr && <span> mL/min</span>}
        </div>
      </div>

      <div className="during-blood-flow-bar-container">
        <div className="during-blood-flow-bar-track">
          <div className="during-blood-flow-pin" style={{ left: `${percent}%` }} />
        </div>
        <div className="during-blood-flow-ticks">
          <span>0</span>
          <span>150</span>
          <span>300</span>
          <span>450</span>
          <span>600</span>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <span className="during-status-pill alert" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
          Prescribed: {prescribedDisplay}
        </span>
      </div>
    </div>
  );
}

function TrendBadge({ trend }) {
  if (trend === 'up') return <span className="during-trend up">↑</span>;
  if (trend === 'down') return <span className="during-trend down">↓</span>;
  return <span className="during-trend stable">→</span>;
}

function Dashboard({ go, session, readings, sessionId, patient, onDashboardMeta }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [stale, setStale] = useState(false);

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!sessionId || sessionId === 'demo') {
      setLoading(false);
      return;
    }
    if (!silent) setLoading((prev) => (dashboardData ? prev : true));
    try {
      const res = await getDuringDialysisDashboard(sessionId);
      if (res?.success) {
        const payload = responseData(res);
        setDashboardData(payload);
        setFetchError(null);
        setStale(false);
        setLastUpdatedAt(payload.fetched_at || new Date().toISOString());
      } else {
        setFetchError(res?.data?.message || 'Unable to fetch dashboard update');
        setStale(Boolean(dashboardData));
      }
    } catch (err) {
      setFetchError(err?.message || 'Network error');
      setStale(Boolean(dashboardData));
    } finally {
      setLoading(false);
    }
  }, [sessionId, dashboardData]);

  useEffect(() => {
    let isMounted = true;
    fetchDashboard();
    const interval = setInterval(() => {
      if (isMounted) fetchDashboard({ silent: true });
    }, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const latest = readings[readings.length - 1] || {};
  const startedAtDate = session?.started_at ? new Date(session.started_at) : (session?.created_at ? new Date(session.created_at) : null);
  const elapsedMinutes = startedAtDate ? Math.max(0, Math.round((Date.now() - startedAtDate.getTime()) / 60000)) : 0;
  const totalMinutes = Number(session?.prescribed_duration_minutes || session?.duration_minutes || 240);
  const calcPercent = totalMinutes > 0 ? Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100)) : 0;

  const formatHoursMins = (mins) => {
    if (mins === null || mins === undefined || isNaN(mins)) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const progressData = dashboardData?.progress || {};
  const ufData = dashboardData?.uf || progressData?.uf || {};
  const machineStatus = dashboardData?.machine_status || {};
  const machineLatest = dashboardData?.machine_latest || dashboardData?.latest_machine_params || {};
  const latestVitals = dashboardData?.latest_vitals || {};
  const latestMachineParams = dashboardData?.latest_machine_params || dashboardData?.machine_latest || {};
  const deferredConsent = dashboardData?.deferred_consent || false;

  // API progress.elapsed/remaining/total are hours; prefer formatted fields from API.
  const elapsedHours = typeof progressData.elapsed === 'number' ? progressData.elapsed : (elapsedMinutes / 60);
  const totalHours = typeof progressData.total === 'number'
    ? progressData.total
    : (Number(session?.prescribed_duration_mins || session?.prescribed_duration_minutes) > 0
      ? Number(session.prescribed_duration_mins || session.prescribed_duration_minutes) / 60
      : (totalMinutes / 60));
  const remainingHours = typeof progressData.remaining === 'number'
    ? progressData.remaining
    : Math.max(0, totalHours - elapsedHours);
  const percent = progressData.percent ?? (totalHours > 0 ? Math.min(100, Math.round((elapsedHours / totalHours) * 100)) : calcPercent);
  const formatFromHours = (hours) => {
    if (hours === null || hours === undefined || Number.isNaN(Number(hours))) return '—';
    return formatHoursMins(Math.round(Number(hours) * 60));
  };

  const elapsedTimeStr = progressData.elapsed_formatted || (startedAtDate ? formatFromHours(elapsedHours) : '—');
  const remainingTimeStr = progressData.remaining_formatted || (startedAtDate ? formatFromHours(remainingHours) : '—');
  const totalTimeStr = progressData.total_formatted || (totalHours ? formatFromHours(totalHours) : '—');
  const startedAtStr = progressData.started_at ? new Date(progressData.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (startedAtDate ? startedAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');
  const expectedEndStr = progressData.expected_end ? new Date(progressData.expected_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (startedAtDate && totalHours ? new Date(startedAtDate.getTime() + totalHours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');

  const ufRemovedRaw = ufData.removed ?? machineLatest.uf_removed ?? latest.uf_removed ?? session?.uf_removed;
  const ufRemoved = ufRemovedRaw === undefined || ufRemovedRaw === null || ufRemovedRaw === ''
    ? 0
    : (Number(ufRemovedRaw) > 50 ? Number(ufRemovedRaw) / 1000 : Number(ufRemovedRaw));
  const rawTarget = ufData.target ?? session?.target_uf ?? session?.uf_target ?? session?.uf_goal_ml;
  const parsedTarget = rawTarget === undefined || rawTarget === null || rawTarget === ''
    ? 0
    : (Number(rawTarget) > 50 ? Number(rawTarget) / 1000 : Number(rawTarget));
  const ufTarget = parsedTarget > 0 ? parsedTarget : 0;
  const ufRemaining = ufData.remaining != null && Number(ufData.remaining) >= 0
    ? Number(ufData.remaining)
    : Math.max(0, ufTarget - ufRemoved);
  const ufRate = ufData.rate ?? machineLatest.ufr ?? latest.uf_rate ?? session?.uf_rate ?? '—';

  useEffect(() => {
    if (!onDashboardMeta) return;
    onDashboardMeta({
      elapsedFormatted: elapsedTimeStr,
      alertCount: (dashboardData?.active_alerts || dashboardData?.unresolved?.alarms || []).length,
      lastUpdatedAt,
    });
  }, [onDashboardMeta, elapsedTimeStr, dashboardData, lastUpdatedAt]);

  const bfr = machineLatest.bfr ?? machineStatus.bfr ?? latest.bfr ?? session?.bfr ?? '—';
  const dfr = machineLatest.dfr ?? machineStatus.dfr ?? latest.dfr ?? session?.dfr ?? '—';
  const prescribedBfr = machineStatus.prescribed_bfr ?? session?.prescribed_bfr ?? session?.prescribedBFR ?? '—';
  const machineModel = machineStatus.model || session?.machine_model || session?.machine || '—';
  const dialyzer = machineStatus.dialyzer || session?.dialyzer || '—';
  const isRunning = (dashboardData?.state === 'STARTED' || machineStatus.running !== false) && !!sessionId;

  const vitalsSys = latestVitals.systolic_bp ?? latest.systolic_bp ?? latest.bp_systolic;
  const vitalsDia = latestVitals.diastolic_bp ?? latest.diastolic_bp ?? latest.bp_diastolic;
  const bpVal = vitalsSys && vitalsDia ? `${vitalsSys} / ${vitalsDia} mmHg` : '—';
  const pulseVal = (latestVitals.pulse ?? latest.pulse) ? `${latestVitals.pulse ?? latest.pulse} bpm` : '—';
  const respVal = (latestVitals.resp_rate ?? latest.respiration ?? latest.resp_rate) ? `${latestVitals.resp_rate ?? latest.respiration ?? latest.resp_rate} /min` : '—';
  const tempVal = (latestVitals.temp ?? latest.temperature) ? `${latestVitals.temp ?? latest.temperature} °C` : '—';
  const spo2Val = (latestVitals.spo2 ?? latest.spo2) ? `${latestVitals.spo2 ?? latest.spo2} %` : '—';
  const rawPain = latestVitals.pain_score ?? latest.pain_score;
  const painVal = rawPain !== undefined && rawPain !== null ? `${rawPain} (${Number(rawPain) === 0 ? 'No Pain' : 'Mild'})` : '—';

  const vitalsTimestamp = latestVitals.recorded_at
    ? new Date(latestVitals.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (latest.observation_time || latest.recorded_at)
    ? new Date(latest.observation_time || latest.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  const apRaw = machineLatest.arterial_pressure ?? machineLatest.ap ?? latestMachineParams.ap ?? session?.ap;
  const apVal = apRaw !== undefined && apRaw !== null && apRaw !== '—' ? `${apRaw} mmHg` : '—';

  const vpRaw = machineLatest.venous_pressure ?? machineLatest.vp ?? latestMachineParams.vp ?? session?.vp;
  const vpVal = vpRaw !== undefined && vpRaw !== null && vpRaw !== '—' ? `${vpRaw} mmHg` : '—';

  const tmpRaw = machineLatest.tmp ?? latestMachineParams.tmp ?? session?.tmp;
  const tmpVal = tmpRaw !== undefined && tmpRaw !== null && tmpRaw !== '—' ? `${tmpRaw} mmHg` : '—';

  const condRaw = machineLatest.conductivity ?? latestMachineParams.conductivity ?? session?.conductivity;
  const condVal = condRaw !== undefined && condRaw !== null && condRaw !== '—' ? `${condRaw} mS/cm` : '—';

  const dialTempRaw = machineLatest.dialysate_temp ?? latestMachineParams.dialysate_temp ?? session?.dialysate_temp;
  const dialTempVal = dialTempRaw !== undefined && dialTempRaw !== null && dialTempRaw !== '—' ? `${dialTempRaw} °C` : '—';

  const rawAlerts = dashboardData?.active_alerts || dashboardData?.unresolved?.alarms || [];
  const flagAlerts = (machineLatest.flags_json || []).map((flag, idx) => ({
    id: flag.id || `flag-${flag.field}-${idx}`,
    title: `${(flag.field || 'Parameter').toUpperCase()} Critical Alert`,
    description: `Parameter ${flag.field ? flag.field.toUpperCase() : ''} is ${flag.severity || 'out of safe range'}: ${flag.value}`,
    severity: flag.severity || 'critical',
    created_at: machineLatest.reading_time || machineLatest.recorded_at
  }));
  const activeAlerts = [...rawAlerts, ...flagAlerts];

  const machineParamsTimestamp = (machineLatest.reading_time || machineLatest.recorded_at || latestMachineParams.recorded_at)
    ? new Date(machineLatest.reading_time || machineLatest.recorded_at || latestMachineParams.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  const prevVitals = latestVitals.previous || {};
  const bpTrend = trendFromValues(vitalsSys, prevVitals.systolic_bp);
  const pulseTrend = trendFromValues(latestVitals.pulse ?? latest.pulse, prevVitals.pulse);
  const respTrend = trendFromValues(latestVitals.resp_rate ?? latest.respiration ?? latest.resp_rate, prevVitals.resp_rate);
  const tempTrend = trendFromValues(latestVitals.temp ?? latest.temperature, prevVitals.temp);
  const spo2Trend = trendFromValues(latestVitals.spo2 ?? latest.spo2, prevVitals.spo2);
  const painTrend = trendFromValues(latestVitals.pain_score ?? latest.pain_score, prevVitals.pain_score);
  const lastUpdatedLabel = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  if (loading && !dashboardData) {
    return (
      <div className="during-dashboard-row" aria-busy="true">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} title=" ">
            <div style={{ height: 140, background: '#f1f5f9', borderRadius: 8 }} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {deferredConsent && (
        <div className="during-alert warning" style={{ marginBottom: '16px' }}>
          <strong>Deferred Consent Notice:</strong> Organization consent for this patient was updated mid-session. Care continues uninterrupted until treatment completion (P3-10).
        </div>
      )}

      {(fetchError || stale) && (
        <div className="during-alert warning" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <strong>{stale ? 'Showing last-known dashboard values.' : 'Dashboard refresh failed.'}</strong>
            <span style={{ marginLeft: 8 }}>{fetchError}</span>
            {lastUpdatedLabel && <span style={{ marginLeft: 8, color: '#92400e' }}>Last updated {lastUpdatedLabel}</span>}
          </div>
          <LibraryButton size="sm" variant="outline" onClick={() => fetchDashboard()}>Refresh</LibraryButton>
        </div>
      )}

      {!fetchError && lastUpdatedLabel && (
        <div style={{ marginBottom: 8, fontSize: 11, color: '#64748b', textAlign: 'right' }}>
          Last updated {lastUpdatedLabel}
        </div>
      )}

      {/* Row 1: 4 Cards (Treatment Progress, UF Progress, Machine Status, Active Alerts) */}
      <div className="during-dashboard-row">
        {/* Card 1: Treatment Progress */}
        <Card title="Treatment Progress">
          <TreatmentProgressRingSVG percent={percent} elapsedTime={elapsedTimeStr} remainingTime={remainingTimeStr} totalTime={totalTimeStr} />
          <div className="during-progress-footer-strip">
            <span>Started At: <strong style={{ color: '#0f172a' }}>{startedAtStr}</strong></span>
            <span>Expected End: <strong style={{ color: '#0f172a' }}>{expectedEndStr}</strong></span>
          </div>
        </Card>

        {/* Card 2: UF Progress */}
        <Card title="Ultrafiltration (UF) Progress">
          <UfProgressRingSVG removed={ufRemoved} target={ufTarget} remaining={ufRemaining} rate={ufRate} />
        </Card>

        {/* Card 3: Machine Status */}
        <Card title="Machine Status">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="during-status-pill alert" style={{ background: isRunning ? '#dcfce7' : '#fef3c7', color: isRunning ? '#15803d' : '#b45309', border: '1px solid', borderColor: isRunning ? '#bbf7d0' : '#fde68a', padding: '2px 8px' }}>
              ● {isRunning ? 'Running' : 'Stopped'}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{machineModel}</span>
          </div>

          <div className="during-machine-status-body">
            <DialysisMachineIllustrationSVG />
            <div className="during-machine-details-list">
              <div className="during-machine-detail-row">
                <small>Machine</small>
                <strong>{machineModel}</strong>
              </div>
              <div className="during-machine-detail-row">
                <small>Dialyzer</small>
                <strong>{dialyzer}</strong>
              </div>
              <div className="during-machine-detail-row">
                <small>Blood Flow Rate (BFR)</small>
                <strong>{bfr !== '—' ? `${bfr} mL/min` : '—'}</strong>
              </div>
              <div className="during-machine-detail-row">
                <small>Dialysate Flow Rate (DFR)</small>
                <strong>{dfr !== '—' ? `${dfr} mL/min` : '—'}</strong>
              </div>
            </div>
          </div>

          <div className="during-machine-alert-strip">
            <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
            <div>
              <div style={{ fontWeight: 700 }}>{activeAlerts.length > 0 ? `${activeAlerts.length} Active Alarms` : 'No Active Alarms'}</div>
              <div style={{ fontSize: '10px', color: '#166534' }}>{activeAlerts.length > 0 ? 'Review active alarm details in Alarm Management.' : 'All parameters are within safe limits.'}</div>
            </div>
          </div>
        </Card>

        {/* Card 4: Active Alerts */}
        <Card title="Active Alerts">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', marginTop: '-24px' }}>
            <span style={{ color: activeAlerts.length > 0 ? '#dc2626' : '#64748b', fontWeight: 700, fontSize: '13px' }}>Active Alerts ({activeAlerts.length})</span>
            <button type="button" className="during-card-action-link" onClick={() => go('P3-07')}>View All</button>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="during-empty" style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
              No active alerts. All parameters are within safe limits.
            </div>
          ) : (
            <div className="during-active-alerts-container">
              {activeAlerts.map((alert, idx) => {
                const severity = (alert.severity || alert.level || 'medium').toLowerCase();
                const alertTime = alert.created_at || alert.time ? new Date(alert.created_at || alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <div key={alert.id || idx} className="during-active-alert-row">
                    <div className="during-active-alert-left">
                      <WarningAmberOutlinedIcon sx={{ color: severity === 'high' || severity === 'critical' ? '#dc2626' : '#d97706', fontSize: 18 }} />
                      <div>
                        <div className="during-active-alert-title">{alert.title || alert.alarm_type || alert.name || 'Alert'}</div>
                        <div className="during-active-alert-desc">{alert.description || alert.message || alert.details || 'Parameter out of range.'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{alertTime}</span>
                      <span className="during-status-pill alert" style={{ background: severity === 'high' || severity === 'critical' ? '#fce7f3' : '#fef9c3', color: severity === 'high' || severity === 'critical' ? '#be185d' : '#a16207', border: '1px solid', borderColor: severity === 'high' || severity === 'critical' ? '#fbcfe8' : '#fef08a', padding: '1px 6px', fontSize: '10px' }}>
                        {alert.severity || 'Medium'}
                      </span>
                    </div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', marginTop: '-24px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{vitalsTimestamp}</span>
          </div>

          <div style={{ marginTop: '-4px' }}>
            <div className="during-vitals-list-item">
              <div className="during-vitals-list-left">
                <FavoriteBorderOutlinedIcon fontSize="small" sx={{ color: '#2563eb', fontSize: 16 }} />
                <span>BP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{bpVal}</strong>
                <TrendMark trend={bpTrend} />
              </div>
            </div>

            <div className="during-vitals-list-item">
              <div className="during-vitals-list-left">
                <MonitorHeartOutlinedIcon fontSize="small" sx={{ color: '#2563eb', fontSize: 16 }} />
                <span>Pulse</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{pulseVal}</strong>
                <TrendMark trend={pulseTrend} />
              </div>
            </div>

            <div className="during-vitals-list-item">
              <div className="during-vitals-list-left">
                <AirOutlinedIcon fontSize="small" sx={{ color: '#2563eb', fontSize: 16 }} />
                <span>Resp. Rate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{respVal}</strong>
                <TrendMark trend={respTrend} />
              </div>
            </div>

            <div className="during-vitals-list-item">
              <div className="during-vitals-list-left">
                <DeviceThermostatOutlinedIcon fontSize="small" sx={{ color: '#2563eb', fontSize: 16 }} />
                <span>Temp.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{tempVal}</strong>
                <TrendMark trend={tempTrend} />
              </div>
            </div>

            <div className="during-vitals-list-item">
              <div className="during-vitals-list-left">
                <WaterDropOutlinedIcon fontSize="small" sx={{ color: '#2563eb', fontSize: 16 }} />
                <span>SpO₂</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{spo2Val}</strong>
                <TrendMark trend={spo2Trend} />
              </div>
            </div>

            <div className="during-vitals-list-item">
              <div className="during-vitals-list-left">
                <SentimentNeutralOutlinedIcon fontSize="small" sx={{ color: '#2563eb', fontSize: 16 }} />
                <span>Pain Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{painVal}</strong>
                <TrendMark trend={painTrend} />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button type="button" className="during-card-action-link" onClick={() => go('P3-02')}>
              View All Vitals →
            </button>
          </div>
        </Card>

        {/* Card 2: Key Machine Parameters */}
        <Card title="Key Machine Parameters">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', marginTop: '-24px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{machineParamsTimestamp}</span>
          </div>

          <div style={{ marginTop: '-4px' }}>
            <div className="during-vitals-list-item">
              <span style={{ color: '#475569' }}>Arterial Pressure</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{apVal}</strong>
              </div>
            </div>

            <div className="during-vitals-list-item">
              <span style={{ color: '#475569' }}>Venous Pressure</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{vpVal}</strong>
              </div>
            </div>

            <div className="during-vitals-list-item">
              <span style={{ color: '#475569' }}>Transmembrane Pressure (TMP)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{tmpVal}</strong>
              </div>
            </div>

            <div className="during-vitals-list-item">
              <span style={{ color: '#475569' }}>Dialysate Conductivity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{condVal}</strong>
              </div>
            </div>

            <div className="during-vitals-list-item">
              <span style={{ color: '#475569' }}>Dialysate Temperature</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{dialTempVal}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button type="button" className="during-card-action-link" onClick={() => go('P3-03')}>
              View All Parameters →
            </button>
          </div>
        </Card>

        {/* Card 3: Blood Flow Gauge */}
        <Card title="Blood Flow">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', marginTop: '-24px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{vitalsTimestamp !== '—' ? vitalsTimestamp : machineParamsTimestamp}</span>
          </div>
          <BloodFlowGaugeSVG bfr={bfr} prescribedBfr={prescribedBfr} />
        </Card>

        {/* Card 4: Quick Actions Panel */}
        <Card title="Quick Actions">
          <div style={{ marginTop: '-6px' }}>
            <button type="button" className="during-quick-action-full-tile" onClick={() => go('P3-02')}>
              <div className="during-quick-action-full-tile-left">
                <FavoriteBorderOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                <div className="during-quick-action-full-tile-info">
                  <strong>Add Vitals</strong>
                  <small>Record patient vitals</small>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
            </button>

            <button type="button" className="during-quick-action-full-tile" onClick={() => go('P3-04')}>
              <div className="during-quick-action-full-tile-left">
                <PersonOutlineIcon sx={{ color: '#2563eb' }} fontSize="small" />
                <div className="during-quick-action-full-tile-info">
                  <strong>Add Symptoms</strong>
                  <small>Record patient symptoms</small>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
            </button>

            <button type="button" className="during-quick-action-full-tile" onClick={() => go('P3-07')}>
              <div className="during-quick-action-full-tile-left">
                <NotificationsNoneOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                <div className="during-quick-action-full-tile-info">
                  <strong>Alarm Management</strong>
                  <small>View and manage alarms</small>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
            </button>

            <button type="button" className="during-quick-action-full-tile" onClick={() => go('P3-06')}>
              <div className="during-quick-action-full-tile-left">
                <VaccinesOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                <div className="during-quick-action-full-tile-info">
                  <strong>Medication Administration</strong>
                  <small>Record medication given</small>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
            </button>

            <button type="button" className="during-quick-action-full-tile" onClick={() => go('P3-08')}>
              <div className="during-quick-action-full-tile-left">
                <ChecklistOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                <div className="during-quick-action-full-tile-info">
                  <strong>Treatment Progress</strong>
                  <small>Detailed progress view</small>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
            </button>
          </div>
        </Card>
      </div>

      <div className="during-guidance" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '10px 16px', borderRadius: '10px', fontSize: '12px' }}>
        <InfoOutlinedIcon fontSize="small" sx={{ color: '#2563eb' }} />
        <span>Keep monitoring patient closely. Review alerts and take appropriate actions as needed.</span>
      </div>
    </>
  );
}

function VitalsTrendMultiLineChart({ readings }) {
  const points = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    const rows = [...readings].reverse().slice(-8);
    return rows.map((r) => {
      const timeStr = r.observation_time
        ? (String(r.observation_time).includes(':') && !String(r.observation_time).includes('T')
          ? r.observation_time
          : new Date(r.observation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        : r.recorded_at
          ? new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—';
      return {
        time: timeStr,
        sbp: Number(r.bp_systolic ?? r.systolic_bp),
        dbp: Number(r.bp_diastolic ?? r.diastolic_bp),
        pulse: Number(r.pulse),
        spo2: Number(r.spo2),
      };
    }).filter((p) => Number.isFinite(p.sbp) || Number.isFinite(p.pulse) || Number.isFinite(p.spo2));
  }, [readings]);

  if (!points.length) {
    return (
      <div className="during-empty" style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
        No vitals recorded yet in this window. Save a reading to populate the trend chart.
      </div>
    );
  }

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

function emptyVitalsForm() {
  return {
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
  };
}

function FieldSeverityTag({ evaluation }) {
  if (!evaluation || evaluation.severity === VITAL_SEVERITY.NORMAL) return null;
  const critical = evaluation.severity === VITAL_SEVERITY.CRITICAL;
  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: 10,
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 999,
        background: critical ? '#fee2e2' : '#fef3c7',
        color: critical ? '#b91c1c' : '#b45309',
        border: `1px solid ${critical ? '#fecaca' : '#fde68a'}`,
      }}
    >
      {critical ? 'Critical' : 'Warning'}
    </span>
  );
}

function formatNextDueLabel(nextDue, intervalMinutes = 30) {
  if (!nextDue) return `Next Due: — (Every ${intervalMinutes} min)`;
  try {
    const t = new Date(nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Next Due: ${t} (Every ${intervalMinutes} min)`;
  } catch (_) {
    return `Next Due: ${String(nextDue)} (Every ${intervalMinutes} min)`;
  }
}

function VitalsForm({ sessionId, readings, onSaved, go }) {
  const [form, setForm] = useState(emptyVitalsForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [trendRange, setTrendRange] = useState('2h');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [monitoringMeta, setMonitoringMeta] = useState({
    next_due: null,
    compliance_pct: 100,
    monitoring_interval_minutes: 30,
    active_vital_alerts: [],
  });

  const fieldEvals = useMemo(() => ({
    bp: evaluateBp(form.systolic_bp, form.diastolic_bp),
    pulse: evaluatePulse(form.pulse),
    temp: evaluateTemp(form.temperature),
    spo2: evaluateSpo2(form.spo2),
    resp: form.respiration === '' ? null : evaluateRespRate(form.respiration),
  }), [form]);

  const severity = useMemo(() => {
    const ranks = [fieldEvals.bp, fieldEvals.pulse, fieldEvals.temp, fieldEvals.spo2, fieldEvals.resp]
      .filter(Boolean)
      .map((e) => e.severity);
    if (ranks.includes(VITAL_SEVERITY.CRITICAL)) return 'Critical';
    if (ranks.includes(VITAL_SEVERITY.WARNING)) return 'Warning';
    return '';
  }, [fieldEvals]);

  useEffect(() => {
    if (severity === 'Critical') {
      setForm((prev) => ({ ...prev, notify: true }));
    }
  }, [severity]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const executeSave = async () => {
    const activeSessionId = getValidSessionId(sessionId);
    if (!activeSessionId) {
      const alertMsg = 'No active dialysis session ID found. Please start a session from Patient Profile before saving vitals.';
      setError(alertMsg);
      return false;
    }
    if (!form.systolic_bp || !form.diastolic_bp || !form.pulse || !form.temperature || !form.spo2) {
      setError('BP, Pulse, Temperature, and SpO₂ are required fields.');
      return false;
    }
    setSaving(true);
    setError('');
    const recorded_by = getTechnicianId() || null;
    const recorded_at = new Date().toISOString();
    const observationTime = form.observation_time
      ? (String(form.observation_time).includes('T')
        ? new Date(form.observation_time).toISOString()
        : form.observation_time)
      : recorded_at;
    const payload = {
      observation_time: observationTime,
      bp_systolic: Number(form.systolic_bp),
      bp_diastolic: Number(form.diastolic_bp),
      pulse: Number(form.pulse),
      resp_rate: form.respiration === '' ? null : Number(form.respiration),
      temperature: Number(form.temperature),
      spo2: Number(form.spo2),
      pain_score: Number(form.pain_score),
      consciousness: form.consciousness,
      // DB column is FK/bigint; free-text symptom choice is carried as symptoms_label for remarks/cross-link.
      symptoms_ref: null,
      symptoms_label: form.symptoms,
      remarks: form.remarks,
      notify_flag: form.notify || severity === 'Critical',
      recorded_at,
    };

    const result = await createIntradialyticVitals(activeSessionId, payload);
    setSaving(false);
    if (!result.success) {
      const errMsg = responseData(result)?.message || result?.error || result?.message || 'Failed to save vitals entry.';
      setError(errMsg);
      return false;
    }
    const saved = responseData(result);
    if (saved?.compliance_pct != null || saved?.next_due) {
      setMonitoringMeta((prev) => ({
        ...prev,
        compliance_pct: saved.compliance_pct ?? prev.compliance_pct,
        next_due: saved.next_due ?? prev.next_due,
        monitoring_interval_minutes: saved.monitoring_interval_minutes ?? prev.monitoring_interval_minutes,
      }));
    }
    onSaved({
      ...form,
      ...saved,
      bp_systolic: payload.bp_systolic,
      bp_diastolic: payload.bp_diastolic,
      resp_rate: payload.resp_rate,
      observation_time: observationTime,
      recorded_by: recorded_by || '—',
      recorded_at,
    });
    return { saved, symptoms: form.symptoms };
  };

  const resetForm = () => setForm(emptyVitalsForm());

  const handleSaveOnly = async () => {
    const result = await executeSave();
    if (result) resetForm();
  };

  const handleSaveAndExit = async () => {
    const result = await executeSave();
    if (result) go('P3-01');
  };

  const handleSaveAndContinue = async () => {
    const result = await executeSave();
    if (!result) return;
    // Non-linear hub: stay on P3-02 for the next interval entry, or jump to P3-04 when a symptom was logged.
    if (result.symptoms && result.symptoms !== 'None') {
      go('P3-04');
      return;
    }
    resetForm();
  };

  const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';
  const [fetchedVitals, setFetchedVitals] = useState([]);
  const [loadingVitals, setLoadingVitals] = useState(false);

  const loadVitals = useCallback(async (range = trendRange) => {
    if (!activeSessionId || activeSessionId === 'preview' || activeSessionId === 'demo') return;
    setLoadingVitals(true);
    const res = await getIntradialyticVitals(activeSessionId, range);
    setLoadingVitals(false);
    if (res?.success) {
      const d = responseData(res);
      const items = Array.isArray(d) ? d : (d.readings || d.items || d.vitals || []);
      setFetchedVitals(items);
      setMonitoringMeta((prev) => ({
        ...prev,
        next_due: d.next_due ?? prev.next_due,
        compliance_pct: d.compliance_pct ?? prev.compliance_pct,
        monitoring_interval_minutes: d.monitoring_interval_minutes ?? prev.monitoring_interval_minutes,
        active_vital_alerts: d.active_vital_alerts || prev.active_vital_alerts || [],
      }));
    }
  }, [activeSessionId, trendRange]);

  useEffect(() => {
    loadVitals(trendRange);
  }, [loadVitals, trendRange]);

  // Offline draft for this screen (Part 3 draft-save convention).
  useEffect(() => {
    if (!activeSessionId) return;
    writeDraft(`${activeSessionId}:p302-vitals`, form);
  }, [activeSessionId, form]);

  const historySource = useMemo(() => {
    if (fetchedVitals.length > 0) return fetchedVitals;
    if (readings && readings.length > 0) return readings;
    return [];
  }, [readings, fetchedVitals]);

  const historyRows = useMemo(() => {
    if (!historySource.length) return [];
    const sorted = [...historySource].sort((a, b) => {
      const ta = new Date(a.observation_time || a.recorded_at || 0).getTime();
      const tb = new Date(b.observation_time || b.recorded_at || 0).getTime();
      return tb - ta;
    });
    return showAllHistory ? sorted : sorted.slice(0, 5);
  }, [historySource, showAllHistory]);

  const chartReadings = historySource;
  const vitalAlerts = monitoringMeta.active_vital_alerts || [];
  const nextDueLabel = formatNextDueLabel(
    monitoringMeta.next_due,
    monitoringMeta.monitoring_interval_minutes || 30,
  );
  const complianceLabel = `${Number.isFinite(Number(monitoringMeta.compliance_pct)) ? Math.round(Number(monitoringMeta.compliance_pct)) : 100}%`;

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
                {nextDueLabel}
              </span>
            </div>

            <div className="during-form-grid">
              {/* Row 1: Time, BP, Pulse, Resp Rate */}
              <Field label="Observation Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="datetime-local" value={form.observation_time} onChange={update('observation_time')} />
              </Field>

              <Field
                label={<span>BP (mmHg) <FieldSeverityTag evaluation={fieldEvals.bp} /></span>}
                icon={FavoriteBorderOutlinedIcon}
                required
              >
                <div className="during-bp-split-container">
                  <Input type="number" placeholder="Systolic" value={form.systolic_bp} onChange={update('systolic_bp')} />
                  <span className="during-bp-separator">/</span>
                  <Input type="number" placeholder="Diastolic" value={form.diastolic_bp} onChange={update('diastolic_bp')} />
                </div>
              </Field>

              <Field
                label={<span>Pulse (bpm) <FieldSeverityTag evaluation={fieldEvals.pulse} /></span>}
                icon={MonitorHeartOutlinedIcon}
                required
              >
                <Input type="number" value={form.pulse} onChange={update('pulse')} />
              </Field>

              <Field
                label={<span>Respiratory Rate (/min) <FieldSeverityTag evaluation={fieldEvals.resp} /></span>}
                icon={AirOutlinedIcon}
              >
                <Input type="number" value={form.respiration} onChange={update('respiration')} />
              </Field>

              {/* Row 2: Temp, SpO2, Pain Score, Consciousness */}
              <Field
                label={<span>Temperature (°C) <FieldSeverityTag evaluation={fieldEvals.temp} /></span>}
                icon={DeviceThermostatOutlinedIcon}
                required
              >
                <Input type="number" step="0.1" value={form.temperature} onChange={update('temperature')} />
              </Field>

              <Field
                label={<span>SpO₂ (%) <FieldSeverityTag evaluation={fieldEvals.spo2} /></span>}
                icon={WaterDropOutlinedIcon}
                required
              >
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
                  <option value="Other">Other</option>
                </Select>
              </Field>

              <Field label={`Remarks (${String(form.remarks || '').length}/200)`} icon={NoteAltOutlinedIcon}>
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
                <strong>{severity}:</strong>
                {severity === 'Critical'
                  ? ' High-risk finding flagged. Notify Nurse/Doctor is required and cannot be unchecked.'
                  : ' Review entered vital signs. Warning-tier values are outside the quick-reference range.'}
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
                <LibraryButton variant="outline" onClick={resetForm}>
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
                    const recorder = r.recorded_by || r.recordedBy || '—';

                    return (
                      <tr key={r.id || i} className={isTop ? 'during-vitals-row-latest' : ''}>
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
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                            title="Load into form"
                            onClick={() => setForm((prev) => ({
                              ...prev,
                              observation_time: r.observation_time
                                ? String(r.observation_time).slice(0, 16)
                                : prev.observation_time,
                              systolic_bp: String(r.bp_systolic ?? r.systolic_bp ?? ''),
                              diastolic_bp: String(r.bp_diastolic ?? r.diastolic_bp ?? ''),
                              pulse: String(r.pulse ?? ''),
                              respiration: String(r.resp_rate ?? r.respiration ?? ''),
                              temperature: String(r.temperature ?? ''),
                              spo2: String(r.spo2 ?? ''),
                              pain_score: Number(r.pain_score ?? 0),
                              consciousness: r.consciousness || 'Alert',
                              symptoms: r.symptoms_ref || 'None',
                              remarks: r.remarks || '',
                              notify: Boolean(r.notify_flag),
                            }))}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!historyRows.length && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', color: '#64748b', padding: 16 }}>
                        {loadingVitals ? 'Loading vitals history…' : 'No vitals recorded yet for this session.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className="during-card-action-link"
                onClick={() => {
                  const next = !showAllHistory;
                  setShowAllHistory(next);
                  if (next) {
                    setTrendRange('all');
                    loadVitals('all');
                  }
                }}
              >
                {showAllHistory ? 'Show Recent Vitals ↑' : 'View All Vitals History →'}
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
              <Select
                size="sm"
                style={{ width: '130px' }}
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
              >
                <option value="2h">Last 2 Hours</option>
                <option value="4h">Last 4 Hours</option>
                <option value="all">Session</option>
              </Select>
            </div>

            <VitalsTrendMultiLineChart readings={chartReadings} />

            <div className="during-vitals-mini-cards-grid">
              <div className="during-vitals-mini-card interval">
                <div className="during-vitals-mini-card-icon">
                  <AccessTimeOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" />
                </div>
                <div className="during-vitals-mini-card-info">
                  <small>Monitoring Interval</small>
                  <strong>Every {monitoringMeta.monitoring_interval_minutes || 30} min</strong>
                </div>
              </div>

              <div className="during-vitals-mini-card compliance">
                <div className="during-vitals-mini-card-icon">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} fontSize="small" />
                </div>
                <div className="during-vitals-mini-card-info">
                  <small>Compliance</small>
                  <strong>{complianceLabel}</strong>
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
              {vitalAlerts.length === 0 ? (
                <>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} fontSize="small" />
                  <span>No active vital alerts. All parameters are within acceptable range.</span>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {vitalAlerts.slice(0, 4).map((alert, idx) => (
                    <div key={`${alert.reading_id || idx}-${alert.field}`} style={{ fontSize: 12, color: alert.severity === 'critical' ? '#b91c1c' : '#92400e' }}>
                      <strong>{String(alert.field || 'vital').replace(/_/g, ' ')}</strong>
                      {': '}
                      {alert.severity}
                      {alert.value != null ? ` (${alert.value})` : ''}
                    </div>
                  ))}
                </div>
              )}
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

const SYMPTOM_INTERVENTIONS = [
  'Positioned Patient/Trendelenburg',
  'Reduced or Stopped UF Rate',
  'Administered Saline Bolus',
  'Administered Medication',
  'Notified Nurse/Physician',
  'Reassured Patient',
  'Continued Monitoring',
  'Other',
];

const QUICK_SYMPTOMS = [
  { id: 'hypotension', name: 'Hypotension (Low BP)', icon: FavoriteBorderOutlinedIcon, color: '#ef4444' },
  { id: 'cramps', name: 'Muscle Cramps', icon: HealingOutlinedIcon, color: '#f59e0b' },
  { id: 'nausea', name: 'Nausea / Vomiting', icon: HealingOutlinedIcon, color: '#10b981' },
  { id: 'chest_pain', name: 'Chest Pain', icon: MonitorHeartOutlinedIcon, color: '#ef4444' },
  { id: 'shortness_breath', name: 'Shortness of Breath', icon: AirOutlinedIcon, color: '#2563eb' },
  { id: 'chills', name: 'Chills / Rigors', icon: DeviceThermostatOutlinedIcon, color: '#06b6d4' },
  { id: 'headache', name: 'Headache', icon: PsychologyOutlinedIcon, color: '#8b5cf6' },
  { id: 'bleeding', name: 'Bleeding', icon: WaterDropOutlinedIcon, color: '#dc2626' },
  { id: 'dizziness', name: 'Syncope / Dizziness', icon: WarningAmberOutlinedIcon, color: '#06b6d4' },
  { id: 'itching', name: 'Itching', icon: HealingOutlinedIcon, color: '#f59e0b' },
  { id: 'back_pain', name: 'Back Pain', icon: NoteAltOutlinedIcon, color: '#d97706' },
  { id: 'other', name: 'Other', icon: SettingsOutlinedIcon, color: '#64748b' },
];

function emptySymptomForm() {
  return {
    event_time: nowTime(),
    symptom: '',
    severity: 'Moderate',
    status: 'Ongoing',
    details: '',
    intervention: '',
    additional_notes: '',
    access_site_related: '',
    notify: false,
  };
}

function formatSymptomTime(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (_) { /* ignore */ }
  return String(value);
}

function clinicalGuidanceForSymptom(symptom) {
  const s = String(symptom || '').toLowerCase();
  if (s.includes('hypotension')) {
    return 'If hypotension persists, consider reducing UF rate, increasing Na+ and evaluate dry weight.';
  }
  if (s.includes('chest')) {
    return 'For chest pain: stop UF if needed, give O₂ per protocol, notify nurse/physician immediately, and prepare for cardiac assessment.';
  }
  if (s.includes('syncope') || s.includes('dizziness')) {
    return 'For syncope/dizziness: place patient Trendelenburg, check BP/pulse, pause UF, and notify nurse/physician.';
  }
  if (s.includes('bleed')) {
    return 'For bleeding: apply firm pressure, reinforce dressing, assess access-site vs systemic source, and notify nurse if ongoing.';
  }
  if (s.includes('cramp')) {
    return 'For muscle cramps: reduce UFR, consider saline bolus, stretch/massage limb, and reassess dry weight.';
  }
  if (s.includes('nausea') || s.includes('vomit')) {
    return 'For nausea/vomiting: slow or pause UF, elevate head of bed, consider antiemetic per orders, monitor for IDH.';
  }
  if (s.includes('shortness') || s.includes('breath')) {
    return 'For dyspnea: check for fluid overload or air embolism signs, adjust UF, give O₂ as ordered, escalate promptly.';
  }
  if (s.includes('chill') || s.includes('rigor')) {
    return 'For chills/rigors: check dialysate temperature, rule out pyrogenic reaction/infection, notify nurse/physician.';
  }
  if (s.includes('headache')) {
    return 'For headache: assess BP and disequilibrium risk; slow UF/BFR if indicated and notify nurse if severe.';
  }
  if (s.includes('itch')) {
    return 'For itching: review dialysate composition and allergy history; consider antihistamine per orders.';
  }
  if (s.includes('back')) {
    return 'For back pain: reposition patient, check for dialyzer reaction or hemolysis signs, and escalate if severe.';
  }
  return 'Document symptom details and intervention promptly. Escalate Severe hemodynamically significant events to nursing/physician review.';
}

function SymptomForm({ sessionId, go }) {
  const [form, setForm] = useState(emptySymptomForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [incidentToast, setIncidentToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [symptomsList, setSymptomsList] = useState([]);
  const [selectedQuickTile, setSelectedQuickTile] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [historyLimit, setHistoryLimit] = useState('4');

  const activeSessionId = getValidSessionId(sessionId);
  const isBleeding = String(form.symptom || '').toLowerCase().includes('bleed');

  const fetchSymptoms = useCallback(async () => {
    if (!activeSessionId) return;
    try {
      const res = await getSymptoms(activeSessionId);
      if (res?.success) {
        const d = responseData(res);
        const items = Array.isArray(d) ? d : (d.items || d.symptoms || []);
        setSymptomsList(items);
      }
    } catch (_) { /* ignore */ }
  }, [activeSessionId]);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  useEffect(() => {
    if (!incidentToast) return undefined;
    const timer = setTimeout(() => setIncidentToast(null), 8000);
    return () => clearTimeout(timer);
  }, [incidentToast]);

  const handleTileClick = (item) => {
    setSelectedQuickTile(item.id);
    setForm((prev) => ({
      ...prev,
      symptom: item.name,
      access_site_related: String(item.name).toLowerCase().includes('bleed') ? prev.access_site_related : '',
    }));
    setError('');
  };

  const updateField = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'symptom' && !String(value).toLowerCase().includes('bleed')
        ? { access_site_related: '' }
        : {}),
    }));
  };

  const resetForm = () => {
    setForm(emptySymptomForm());
    setSelectedQuickTile(null);
    setError('');
  };

  const executeSaveSymptom = async () => {
    if (!activeSessionId) {
      setError('No active dialysis session ID found. Please start a session from Patient Profile before recording symptoms.');
      return false;
    }
    if (!form.event_time) {
      setError('Event Time is required.');
      return false;
    }
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
    if (isBleeding && (form.access_site_related === '' || form.access_site_related == null)) {
      setError('Is this access-site related? is required when Symptom is Bleeding.');
      return false;
    }

    setSaving(true);
    setError('');
    setInfo('');

    const payload = {
      symptom: form.symptom,
      event_time: form.event_time,
      severity: form.severity,
      status: form.status || 'Ongoing',
      details: form.details || null,
      intervention: form.intervention,
      additional_notes: form.additional_notes || null,
      notify_flag: Boolean(form.notify),
      access_site_related: isBleeding ? form.access_site_related === 'Yes' : null,
      recorded_at: new Date().toISOString(),
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
      setIncidentToast({
        incidentId: d.incident_id,
        message: `Incident logged — ID ${d.incident_id}. Review on P3-09.`,
      });
      setInfo(`Incident logged automatically — ID ${d.incident_id}.`);
    } else {
      setInfo('Symptom recorded successfully.');
    }

    resetForm();
    fetchSymptoms();
    return true;
  };

  const handleSaveOnly = async () => {
    await executeSaveSymptom();
  };

  const handleSaveDraft = async () => {
    const ok = await executeSaveSymptom();
    if (ok) go('P3-01');
  };

  const handleSaveReturn = async () => {
    const ok = await executeSaveSymptom();
    if (ok) go('P3-01');
  };

  const handleResolveSymptom = async (symptomId) => {
    if (!activeSessionId || !symptomId) return;
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

  const activeSymptoms = useMemo(
    () => (symptomsList || []).filter((s) => String(s.status || 'Ongoing').toLowerCase() === 'ongoing'),
    [symptomsList],
  );

  const historyItems = useMemo(() => {
    if (!symptomsList?.length) return [];
    const mapped = symptomsList.map((s, idx) => ({
      id: s.id || `symp-${idx}`,
      symptom_type: s.symptom || s.symptom_type || 'Symptom',
      time: formatSymptomTime(s.event_time || s.recorded_at),
      status: s.status || 'Resolved',
      intervention: s.intervention || '—',
      severity: s.severity || 'Mild',
    }));
    if (historyLimit === 'all') return mapped;
    return mapped.slice(0, 4);
  }, [symptomsList, historyLimit]);

  const guidance = clinicalGuidanceForSymptom(form.symptom);

  return (
    <>
      {incidentToast && (
        <div className="during-alert warning" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{incidentToast.message}</span>
          <button type="button" className="during-card-action-link" onClick={() => go('P3-09')}>
            View Incident →
          </button>
        </div>
      )}

      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title="Record New Symptom / Complication">
            <div className="during-form-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <Field label="Event Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="datetime-local" value={form.event_time} onChange={updateField('event_time')} />
              </Field>

              <Field label="Symptom / Complication" icon={HealingOutlinedIcon} required>
                <Select value={form.symptom} onChange={updateField('symptom')}>
                  <option value="">Select symptom</option>
                  {QUICK_SYMPTOMS.map((qs) => (
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
                </Select>
              </Field>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Common Symptoms
              </label>
              <div className="during-symptoms-quick-grid">
                {QUICK_SYMPTOMS.map((tile) => {
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

            {isBleeding && (
              <div style={{ marginTop: 12 }}>
                <Field label="Is this access-site related?" required>
                  <Select value={form.access_site_related} onChange={updateField('access_site_related')}>
                    <option value="">Select Yes / No</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </Field>
              </div>
            )}

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
                    {SYMPTOM_INTERVENTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
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
                <LibraryButton type="button" variant="outline" onClick={resetForm}>
                  Reset
                </LibraryButton>
                <LibraryButton type="button" variant="primary" onClick={handleSaveOnly} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Symptom'}
                </LibraryButton>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ minWidth: 0 }}>
          <Card title={<span style={{ color: activeSymptoms.length ? '#dc2626' : '#64748b' }}>Active Symptoms ({activeSymptoms.length})</span>}>
            {activeSymptoms.length === 0 ? (
              <div className="during-empty">No active symptoms this session.</div>
            ) : (
              activeSymptoms.map((item) => (
                <div className="during-active-symptom-box" key={item.id} style={{ marginBottom: 10 }}>
                  <div className="during-active-symptom-header">
                    <div className="during-active-symptom-title">
                      <FavoriteBorderOutlinedIcon sx={{ color: '#ef4444' }} fontSize="small" />
                      <span>{item.symptom || item.symptom_type || 'Symptom'}</span>
                    </div>
                    <span className={`during-severity-badge ${(item.severity || 'moderate').toLowerCase()}`}>
                      {item.severity || 'Moderate'}
                    </span>
                  </div>
                  <div className="during-active-symptom-details">
                    <div>Started: <strong>{formatSymptomTime(item.event_time || item.recorded_at)}</strong></div>
                    <div>Intervention: <strong>{item.intervention || '—'}</strong></div>
                    <div>Status: <strong>{item.status || 'Ongoing'}</strong></div>
                  </div>
                  <button
                    type="button"
                    className="during-active-symptom-update-btn"
                    onClick={() => handleResolveSymptom(item.id)}
                    disabled={updatingId === item.id}
                  >
                    {updatingId === item.id ? 'Updating...' : 'Update → Resolved'}
                  </button>
                </div>
              ))
            )}
          </Card>

          <Card title="Symptom History">
            <div className="during-card-header" style={{ marginTop: '-24px' }}>
              <span />
              <Select
                size="sm"
                style={{ width: '130px' }}
                value={historyLimit}
                onChange={(e) => setHistoryLimit(e.target.value)}
              >
                <option value="4">Last 4 Events</option>
                <option value="all">All Events</option>
              </Select>
            </div>

            {historyItems.length === 0 ? (
              <div className="during-empty" style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                No symptoms recorded for this session.
              </div>
            ) : (
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
            )}
          </Card>

          <div className="during-clinical-guidance-card">
            <div className="during-clinical-guidance-header">
              <SettingsOutlinedIcon fontSize="small" />
              <span>Clinical Guidance</span>
            </div>
            <div className="during-clinical-guidance-text">{guidance}</div>
          </div>
        </div>
      </div>

      <div className="during-bottom-nav-bar">
        <LibraryButton type="button" variant="outline" onClick={() => go('P3-01')}>
          ← Back
        </LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton type="button" variant="outline" onClick={handleSaveDraft} disabled={saving}>
            Save as Draft
          </LibraryButton>
          <LibraryButton type="button" variant="primary" onClick={handleSaveReturn} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Return to Dashboard'}
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

const AVF_AVG_FIELDS = [
  { key: 'needle_position_security', name: 'Needle Position & Security', icon: NoteAltOutlinedIcon, options: ['Secure', 'Loose', 'Dislodged'], normal: 'Secure', critical: true },
  { key: 'bleeding', name: 'Bleeding', icon: WaterDropOutlinedIcon, options: ['None', 'Minimal', 'Excessive'], normal: 'None', critical: true },
  { key: 'swelling', name: 'Swelling', icon: HealingOutlinedIcon, options: ['None', 'Mild', 'Moderate', 'Severe'], normal: 'None', critical: false },
  { key: 'infiltration_extravasation', name: 'Infiltration / Extravasation', icon: WaterDropOutlinedIcon, options: ['No', 'Yes (Mild)', 'Yes (Severe)'], normal: 'No', critical: true },
  { key: 'pain_tenderness', name: 'Pain / Tenderness', icon: WarningAmberOutlinedIcon, options: ['None', 'Mild', 'Moderate', 'Severe'], normal: 'None', critical: false },
  { key: 'thrill', name: 'Thrill (Palpation)', icon: AirOutlinedIcon, options: ['Strong', 'Weak', 'Absent'], normal: 'Strong', critical: true },
  { key: 'bruit', name: 'Bruit (Auscultation)', icon: MonitorHeartOutlinedIcon, options: ['Normal', 'Weak', 'Absent'], normal: 'Normal', critical: true },
  { key: 'blood_flow_adequacy', name: 'Blood Flow Adequacy', icon: MonitorHeartOutlinedIcon, options: ['Adequate', 'Inadequate', 'Not Assessable'], normal: 'Adequate', critical: true },
  { key: 'skin_condition', name: 'Skin Condition', icon: HealingOutlinedIcon, options: ['Normal', 'Redness', 'Warmth', 'Other'], normal: 'Normal', critical: false },
];

const CVC_FIELDS = [
  { key: 'catheter_connection_security', name: 'Catheter Connection Security', icon: NoteAltOutlinedIcon, options: ['Secure', 'Loose', 'Disconnected'], normal: 'Secure', critical: true },
  { key: 'blood_flow_adequacy', name: 'Blood Flow Adequacy', icon: MonitorHeartOutlinedIcon, options: ['Adequate', 'Inadequate', 'Not Assessable'], normal: 'Adequate', critical: true },
  { key: 'bleeding', name: 'Bleeding (at exit/connection)', icon: WaterDropOutlinedIcon, options: ['None', 'Minimal', 'Excessive'], normal: 'None', critical: true },
  { key: 'signs_of_infection', name: 'Signs of Infection / Erythema / Discharge', icon: WarningAmberOutlinedIcon, options: ['No', 'Yes'], normal: 'No', critical: true },
  { key: 'kinking_clamping', name: 'Kinking / Clamping Issues', icon: SettingsOutlinedIcon, options: ['None', 'Present'], normal: 'None', critical: true },
  { key: 'tenderness_pain', name: 'Tenderness / Pain at Exit Site', icon: WarningAmberOutlinedIcon, options: ['No', 'Yes'], normal: 'No', critical: true },
  { key: 'dressing_intact', name: 'Dressing Intact', icon: HealingOutlinedIcon, options: ['Yes', 'No'], normal: 'Yes', critical: false },
  { key: 'exit_site_clean', name: 'Exit Site Clean', icon: HealingOutlinedIcon, options: ['Yes', 'No'], normal: 'Yes', critical: false },
  { key: 'skin_condition', name: 'Skin Condition', icon: HealingOutlinedIcon, options: ['Normal', 'Redness', 'Warmth', 'Other'], normal: 'Normal', critical: false },
];

function emptyAccessFindings(fields) {
  const out = {};
  fields.forEach((f) => {
    out[f.key] = { finding: '', comment: '' };
  });
  return out;
}

function accessHealthScore(overallStatus) {
  const s = String(overallStatus || '').toLowerCase();
  if (s.includes('not functional')) return 12;
  if (s.includes('at risk')) return 62;
  if (s.includes('good') || s.includes('functional')) return 98;
  return 0;
}

function detectAccessFailureFlags(accessCode, items) {
  const flags = [];
  const val = (k) => String(items[k]?.finding || '').toLowerCase();
  if (accessCode === 'CVC') {
    if (val('catheter_connection_security').includes('loose') || val('catheter_connection_security').includes('disconnect')) {
      flags.push('Catheter Connection Security');
    }
    if (val('blood_flow_adequacy').includes('inadequate')) flags.push('Blood Flow Adequacy');
    if (val('bleeding').includes('excessive')) flags.push('Bleeding');
    if (val('signs_of_infection') === 'yes') flags.push('Signs of Infection');
  } else {
    if (val('infiltration_extravasation').includes('yes') || val('infiltration_extravasation').includes('mild') || val('infiltration_extravasation').includes('severe')) {
      flags.push('Infiltration / Extravasation');
    }
    if (val('bleeding').includes('excessive')) flags.push('Bleeding');
    if (val('needle_position_security').includes('dislodg')) flags.push('Needle Position & Security');
    if (val('thrill').includes('absent')) flags.push('Thrill');
    if (val('blood_flow_adequacy').includes('inadequate')) flags.push('Blood Flow Adequacy');
  }
  return flags;
}

function resolveNextAssessmentDue(option) {
  const now = new Date();
  if (option === '1h') {
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  }
  if (option === '2h') {
    now.setHours(now.getHours() + 2);
    return now.toISOString();
  }
  return null;
}

function VascularAccessMonitoringView({ sessionId, go }) {
  const [accessType, setAccessType] = useState('AVF');
  const [assessmentTime, setAssessmentTime] = useState(nowTime());
  const [overallStatus, setOverallStatus] = useState('');
  const [intervention, setIntervention] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [nextDue, setNextDue] = useState('1h');
  const [notify, setNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [incidentToast, setIncidentToast] = useState(null);
  const [summary, setSummary] = useState({
    accessType: '—',
    location: '—',
    dateCreated: '—',
    lastReviewed: '—',
    overall: '—',
  });
  const [healthPct, setHealthPct] = useState(null);

  const accessCode = useMemo(() => {
    const s = String(accessType || '').toUpperCase();
    if (s.includes('CVC')) return 'CVC';
    if (s.includes('AVG') || s.includes('GRAFT')) return 'AVG';
    return 'AVF';
  }, [accessType]);

  const assessmentFields = accessCode === 'CVC' ? CVC_FIELDS : AVF_AVG_FIELDS;
  const [assessmentItems, setAssessmentItems] = useState(() => emptyAccessFindings(AVF_AVG_FIELDS));

  const activeSessionId = getValidSessionId(sessionId);

  useEffect(() => {
    setAssessmentItems(emptyAccessFindings(assessmentFields));
  }, [accessCode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeSessionId) return;
    getVascularAccessMonitoring(activeSessionId).then((res) => {
      if (!res?.success) return;
      const d = responseData(res);
      const latest = d.latest || (Array.isArray(d.items) ? d.items[0] : null) || (Array.isArray(d) ? d[0] : d);
      const pre = d.predialysis_access || null;
      let location = '—';
      let dateCreated = '—';
      if (pre?.details_json) {
        try {
          const details = typeof pre.details_json === 'string' ? JSON.parse(pre.details_json) : pre.details_json;
          location = details.location || details.access_location || details.site || '—';
          dateCreated = details.date_created || details.created_date || '—';
        } catch (_) { /* ignore */ }
      }
      if (pre?.access_type && !latest?.access_type) {
        setAccessType(String(pre.access_type).toUpperCase().includes('CVC') ? 'CVC'
          : String(pre.access_type).toUpperCase().includes('AVG') ? 'AVG' : 'AVF');
      }
      if (latest) {
        if (latest.access_type) setAccessType(String(latest.access_type).toUpperCase());
        if (latest.overall_status) {
          setOverallStatus(latest.overall_status);
          setHealthPct(latest.access_health_pct != null ? Number(latest.access_health_pct) : accessHealthScore(latest.overall_status));
        }
        if (latest.reading_time || latest.recorded_at) {
          const ts = latest.reading_time || latest.recorded_at;
          const dt = new Date(ts);
          if (!Number.isNaN(dt.getTime())) setAssessmentTime(nowTime());
        }
        setSummary((prev) => ({
          ...prev,
          accessType: latest.access_type || pre?.access_type || prev.accessType,
          location,
          dateCreated,
          lastReviewed: formatSymptomTime(latest.reading_time || latest.recorded_at),
          overall: latest.overall_status || '—',
        }));
      } else {
        setSummary((prev) => ({
          ...prev,
          accessType: pre?.access_type || prev.accessType,
          location,
          dateCreated,
          lastReviewed: pre?.recorded_at ? formatSymptomTime(pre.recorded_at) : '—',
        }));
      }
    }).catch(() => {});
  }, [activeSessionId]);

  useEffect(() => {
    if (!incidentToast) return undefined;
    const t = setTimeout(() => setIncidentToast(null), 8000);
    return () => clearTimeout(t);
  }, [incidentToast]);

  const failureFlags = useMemo(
    () => detectAccessFailureFlags(accessCode, assessmentItems),
    [accessCode, assessmentItems],
  );
  const liveHealth = overallStatus ? accessHealthScore(overallStatus) : (healthPct ?? 0);

  const updateFinding = (key, findingVal) => {
    setAssessmentItems((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { comment: '' }), finding: findingVal },
    }));
  };

  const updateComment = (key, commentVal) => {
    setAssessmentItems((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { finding: '' }), comment: commentVal },
    }));
  };

  const executeSave = async () => {
    if (!activeSessionId) {
      setError('No active dialysis session found. Please start a session from Patient Profile before saving access assessment.');
      return false;
    }
    if (!overallStatus) {
      setError('Overall Access Status is required.');
      return false;
    }
    const missing = assessmentFields
      .filter((f) => f.critical)
      .filter((f) => !String(assessmentItems[f.key]?.finding || '').trim())
      .map((f) => f.name);
    if (missing.length) {
      setError(`Critical findings required: ${missing.join(', ')}`);
      return false;
    }

    setSaving(true);
    setError('');
    setInfo('');

    const findings = {};
    Object.entries(assessmentItems).forEach(([key, val]) => {
      if (val?.finding) findings[key] = { finding: val.finding, comment: val.comment || '' };
    });

    const payload = {
      access_type: accessCode,
      assessment_time: assessmentTime,
      overall_status: overallStatus,
      intervention: intervention || null,
      notes: additionalNotes || null,
      next_assessment_due: resolveNextAssessmentDue(nextDue),
      notify_flag: notify,
      findings,
      assessment_items: assessmentItems,
      recorded_at: new Date().toISOString(),
    };

    const res = await createVascularAccessMonitoring(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to save vascular access monitoring assessment.';
      setError(errMsg);
      return false;
    }

    const d = responseData(res);
    if (d?.access_health_pct != null) setHealthPct(Number(d.access_health_pct));
    else setHealthPct(accessHealthScore(overallStatus));
    setSummary((prev) => ({
      ...prev,
      accessType: accessCode,
      overall: overallStatus,
      lastReviewed: formatSymptomTime(new Date().toISOString()),
    }));
    if (d?.auto_incident_created) {
      setIncidentToast({
        incidentId: d.incident_id,
        message: `Incident logged — ID ${d.incident_id}. Review on P3-09.`,
      });
      setInfo(`Access complication flagged. Incident draft ${d.incident_id} created.`);
    } else if (failureFlags.length) {
      setInfo(`Assessment saved with critical findings: ${failureFlags.join(', ')}.`);
    } else {
      setInfo('Vascular Access Assessment saved successfully.');
    }
    return true;
  };

  const handleSaveOnly = async () => { await executeSave(); };
  const handleSaveDraft = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveReturn = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };

  const titleLabel = accessCode === 'CVC'
    ? 'Access Assessment – Central Venous Catheter'
    : accessCode === 'AVG'
      ? 'Access Assessment – AV Graft'
      : 'Access Assessment – AV Fistula';

  return (
    <>
      {incidentToast && (
        <div className="during-alert warning" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{incidentToast.message}</span>
          <button type="button" className="during-card-action-link" onClick={() => go('P3-09')}>
            View Incident →
          </button>
        </div>
      )}

      {failureFlags.length > 0 && (
        <div className="during-alert warning" style={{ marginBottom: 12 }}>
          <strong>Access failure state:</strong> {failureFlags.join(', ')}. Nurse/physician assessment required — no technician override.
        </div>
      )}

      <div className="during-access-top-bar">
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Access Type
          </label>
          <div className="during-access-type-radios">
            {[
              { code: 'AVF', label: 'AV Fistula (AVF)' },
              { code: 'AVG', label: 'AV Graft (AVG)' },
              { code: 'CVC', label: 'Central Venous Catheter (CVC)' },
            ].map((type) => (
              <label key={type.code} className="during-access-type-radio-label">
                <input
                  type="radio"
                  name="accessTypeRadio"
                  checked={accessCode === type.code}
                  onChange={() => setAccessType(type.code)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ minWidth: '220px' }}>
          <Field label="Assessment Time" icon={AccessTimeOutlinedIcon}>
            <Input type="datetime-local" value={assessmentTime} onChange={(e) => setAssessmentTime(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title={titleLabel}>
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
                    const itemState = assessmentItems[field.key] || { finding: '', comment: '' };
                    return (
                      <tr key={field.key}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                            <Icon sx={{ color: '#2563eb', fontSize: 16 }} />
                            <span>
                              {field.name}
                              {field.critical ? <em style={{ color: '#ef4444' }}> *</em> : null}
                            </span>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Overall Access Status <em style={{ color: '#ef4444' }}>*</em>
                </label>
                <div className="during-access-status-segmented-group">
                  {[
                    { value: 'Good / Functional', className: 'good', label: 'Good / Functional' },
                    { value: 'At Risk', className: 'at-risk', label: 'At Risk' },
                    { value: 'Not Functional', className: 'not-functional', label: 'Not Functional' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`during-access-status-btn ${opt.className} ${overallStatus === opt.value ? 'selected' : ''}`}
                      onClick={() => setOverallStatus(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Field label="Intervention / Action Taken" icon={HealingOutlinedIcon}>
                  <Select value={intervention} onChange={(e) => setIntervention(e.target.value)}>
                    <option value="">Select intervention</option>
                    <option value="None required">None required</option>
                    <option value="Needle repositioned">Needle repositioned</option>
                    <option value="Tape reinforced">Tape reinforced</option>
                    <option value="Pressure applied">Pressure applied</option>
                    <option value="UF adjusted">UF adjusted</option>
                    <option value="Physician notified">Physician notified</option>
                    <option value="Other">Other</option>
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
                    <option value="1h">In 1 hour</option>
                    <option value="2h">In 2 hours</option>
                    <option value="end">End of session</option>
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
                type="button"
                variant="outline"
                onClick={() => {
                  setAssessmentItems(emptyAccessFindings(assessmentFields));
                  setOverallStatus('');
                  setIntervention('');
                  setAdditionalNotes('');
                  setAssessmentTime(nowTime());
                  setError('');
                  setInfo('');
                }}
              >
                Reset
              </LibraryButton>
              <LibraryButton type="button" variant="primary" onClick={handleSaveOnly} disabled={saving}>
                {saving ? 'Saving...' : 'Save Assessment'}
              </LibraryButton>
            </div>
          </Card>
        </div>

        <div style={{ minWidth: 0 }}>
          <Card title="Access Summary">
            <div className="during-card-header" style={{ marginTop: '-24px' }}>
              <span />
              <span className="during-status-pill alert">{overallStatus || summary.overall || '—'}</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>Access Type</span>
                <strong>{accessCode || summary.accessType || '—'}</strong>
              </div>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>Location</span>
                <strong>{summary.location || '—'}</strong>
              </div>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>Date Created</span>
                <strong>{summary.dateCreated || '—'}</strong>
              </div>
              <div className="during-access-summary-row">
                <span style={{ color: '#64748b' }}>Last Reviewed</span>
                <strong>{summary.lastReviewed || '—'}</strong>
              </div>
            </div>
          </Card>

          <Card title="Access Health Indicator">
            <AccessHealthGaugeSVG score={liveHealth} />
            <p className="during-muted" style={{ textAlign: 'center', marginTop: 8 }}>
              Based on Overall Access Status
              {overallStatus ? ` (${overallStatus})` : ''}
            </p>
          </Card>

          <div className="during-clinical-guidance-card">
            <div className="during-clinical-guidance-header">
              <SettingsOutlinedIcon fontSize="small" />
              <span>Clinical Guidance</span>
            </div>
            <div className="during-clinical-guidance-text">
              {accessCode === 'CVC'
                ? 'Confirm catheter connections are secure, dressing intact, and flow is adequate. Escalate Loose/Disconnected connections or infection signs immediately.'
                : 'Maintain adequate blood flow (BFR 250-300 mL/min). Inspect access site regularly for early signs of complications.'}
            </div>
          </div>

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

      <div className="during-bottom-nav-bar">
        <LibraryButton type="button" variant="outline" onClick={() => go('P3-01')}>
          ← Back
        </LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton type="button" variant="outline" onClick={handleSaveDraft} disabled={saving}>
            Save as Draft
          </LibraryButton>
          <LibraryButton type="button" variant="primary" onClick={handleSaveReturn} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Return to Dashboard'}
          </LibraryButton>
        </div>
      </div>
    </>
  );
}

const MED_INDICATIONS = [
  'Anemia Management (ESA/Iron)',
  'Anticoagulation',
  'Hypotension/IDH Management',
  'Muscle Cramps',
  'Nausea/Vomiting',
  'Infection/Prophylaxis',
  'Pain Management',
  'Other',
];

const MED_ROUTES = [
  'IV',
  'IV Push',
  'IV Infusion',
  'Subcutaneous (SC)',
  'Oral (PO)',
  'Intradialytic — via dialysate',
];

function emptyMedForm(technicianLabel) {
  return {
    medication: '',
    indication: '',
    dose: '',
    unit: 'mg',
    route: '',
    administered_at: nowTime(),
    administered_by: technicianLabel || '',
    quantity_used: '',
    quantity_unit: 'vial',
    expiry_date: '',
    adverse_reaction: 'No',
    reaction_details: '',
    notes: '',
    allergy_override_confirmed: false,
    allergy_override_reason: '',
  };
}

function isExpiryPast(value) {
  if (!value) return false;
  const exp = new Date(value);
  if (Number.isNaN(exp.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return exp < today;
}

function matchAllergy(allergies, medication) {
  const med = String(medication || '').toLowerCase().trim();
  if (!med) return null;
  return (allergies || []).find((a) => {
    const allergen = String(a.allergen || a.name || a.medication || a.allergy || '').toLowerCase().trim();
    if (!allergen) return false;
    return med.includes(allergen) || allergen.includes(med);
  }) || null;
}

function MedicationAdministrationView({ sessionId, go, patientId }) {
  const technicianId = getTechnicianId();
  const technicianLabel = technicianId || '';
  const [form, setForm] = useState(() => emptyMedForm(technicianLabel));
  const [preVitals, setPreVitals] = useState({ sbp: '', dbp: '', pulse: '', spo2: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [incidentToast, setIncidentToast] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState({
    total_prescribed: 0,
    administered: 0,
    pending: 0,
    missed: 0,
  });
  const [allergies, setAllergies] = useState([]);
  const [history, setHistory] = useState([]);

  const activeSessionId = getValidSessionId(sessionId);

  const refreshLists = useCallback(async () => {
    if (!activeSessionId) return;
    const dueRes = await getDueMedications(activeSessionId);
    if (dueRes?.success) {
      const d = responseData(dueRes);
      setReminders(Array.isArray(d.reminders) ? d.reminders : []);
      if (d.summary) {
        setSummary({
          total_prescribed: Number(d.summary.total_prescribed) || 0,
          administered: Number(d.summary.administered) || 0,
          pending: Number(d.summary.pending) || 0,
          missed: Number(d.summary.missed) || 0,
        });
      }
      if (Array.isArray(d.administered) && d.administered.length) {
        setHistory(d.administered);
      }
    }
    const histRes = await getMedications(activeSessionId);
    if (histRes?.success) {
      const d = responseData(histRes);
      const items = Array.isArray(d) ? d : (d.items || d.medications || d.administered || []);
      setHistory(items);
      setSummary((prev) => ({
        ...prev,
        administered: items.length || prev.administered,
      }));
    }
  }, [activeSessionId]);

  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  useEffect(() => {
    if (!patientId) return;
    getPatientAllergies(patientId).then((res) => {
      if (res?.success) {
        const d = responseData(res);
        setAllergies(Array.isArray(d) ? d : (d.items || d.allergies || []));
      }
    });
  }, [patientId]);

  useEffect(() => {
    if (!incidentToast) return undefined;
    const t = setTimeout(() => setIncidentToast(null), 8000);
    return () => clearTimeout(t);
  }, [incidentToast]);

  const allergyHit = useMemo(
    () => matchAllergy(allergies, form.medication),
    [allergies, form.medication],
  );
  const expiryBlocked = isExpiryPast(form.expiry_date);
  const adverseYes = form.adverse_reaction === 'Yes';

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((v) => ({
      ...v,
      [key]: value,
      ...(key === 'medication'
        ? { allergy_override_confirmed: false, allergy_override_reason: '' }
        : {}),
    }));
  };

  const applyReminder = (rem) => {
    setForm((prev) => ({
      ...prev,
      medication: rem.medication || prev.medication,
      dose: rem.dose != null ? String(rem.dose) : prev.dose,
      unit: rem.dose_unit || prev.unit,
      route: rem.route || prev.route,
      allergy_override_confirmed: false,
      allergy_override_reason: '',
    }));
  };

  const resetForm = () => {
    setForm(emptyMedForm(technicianLabel));
    setPreVitals({ sbp: '', dbp: '', pulse: '', spo2: '' });
    setError('');
    setInfo('');
  };

  const executeSave = async () => {
    if (!activeSessionId) {
      setError('No active dialysis session ID found. Please start a session from Patient Profile before recording medication administration.');
      return false;
    }
    if (!form.medication || !form.dose || !form.route || !form.administered_at || !form.administered_by || !form.quantity_used) {
      setError('Medication, Dose, Route, Administration Time, Administered By, and Quantity Used are required.');
      return false;
    }
    if (expiryBlocked) {
      setError(`Expiry date ${form.expiry_date} is in the past — select a non-expired unit.`);
      return false;
    }
    if (allergyHit && (!form.allergy_override_confirmed || !String(form.allergy_override_reason || '').trim())) {
      setError('Allergy match found — confirm override and provide a reason before saving.');
      return false;
    }
    if (adverseYes && !String(form.reaction_details || '').trim()) {
      setError('Reaction details are required when Any Adverse Reaction is Yes.');
      return false;
    }

    setSaving(true);
    setError('');
    setInfo('');

    const payload = {
      medication: form.medication,
      indication: form.indication || null,
      dose: form.dose,
      dose_unit: form.unit,
      route: form.route,
      administration_time: form.administered_at,
      administered_by: form.administered_by,
      quantity_used: form.quantity_used,
      quantity_unit: form.quantity_unit,
      expiry_date: form.expiry_date || null,
      pre_vitals: {
        bp_systolic: preVitals.sbp || null,
        bp_diastolic: preVitals.dbp || null,
        pulse: preVitals.pulse || null,
        spo2: preVitals.spo2 || null,
      },
      adverse_reaction: adverseYes,
      reaction_details: adverseYes ? form.reaction_details : null,
      notes: form.notes || null,
      allergy_override: allergyHit
        ? {
            confirmed: true,
            matched: true,
            reason: form.allergy_override_reason,
          }
        : undefined,
      allergy_override_reason: allergyHit ? form.allergy_override_reason : null,
      recorded_at: new Date().toISOString(),
    };

    const res = await createMedicationAdministration(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const d = responseData(res);
      const errMsg = d?.message || res?.error || res?.message || 'Failed to record medication administration.';
      setError(errMsg);
      if (d?.allergy_alert?.matched) {
        setInfo(`Allergy alert: ${d.allergy_alert.allergen || 'documented allergen'}`);
      }
      return false;
    }

    const d = responseData(res);
    if (d?.auto_incident_created) {
      setIncidentToast({
        incidentId: d.incident_id,
        message: `Incident logged — ID ${d.incident_id}. Review on P3-09.`,
      });
      setInfo(`Adverse reaction flagged. Incident draft ${d.incident_id} created.`);
    } else {
      setInfo('Medication administration recorded successfully.');
    }
    resetForm();
    await refreshLists();
    return true;
  };

  const handleSaveOnly = async () => { await executeSave(); };
  const handleSaveDraft = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveReturn = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };

  const saveBlocked = expiryBlocked
    || (Boolean(allergyHit) && (!form.allergy_override_confirmed || !String(form.allergy_override_reason || '').trim()));

  const medOptions = useMemo(() => {
    const names = reminders.map((r) => r.medication).filter(Boolean);
    return [...new Set(names)];
  }, [reminders]);

  return (
    <>
      {incidentToast && (
        <div className="during-alert warning" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{incidentToast.message}</span>
          <button type="button" className="during-card-action-link" onClick={() => go('P3-09')}>
            View Incident →
          </button>
        </div>
      )}

      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title="Add Medication Administration">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <Field label="Medication" icon={MedicationOutlinedIcon} required>
                <Input
                  list="p306-med-options"
                  placeholder="Search / enter medication"
                  value={form.medication}
                  onChange={update('medication')}
                />
                <datalist id="p306-med-options">
                  {medOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>

              <Field label="Indication">
                <Select value={form.indication} onChange={update('indication')}>
                  <option value="">Select indication</option>
                  {MED_INDICATIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Dose <em style={{ color: '#ef4444' }}>*</em>
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Input type="number" placeholder="e.g. 500" value={form.dose} onChange={update('dose')} style={{ flex: 1 }} />
                  <Select value={form.unit} onChange={update('unit')} style={{ width: '90px' }}>
                    <option value="mg">mg</option>
                    <option value="units">units</option>
                    <option value="mL">mL</option>
                    <option value="mcg">mcg</option>
                  </Select>
                </div>
              </div>

              <Field label="Route" required>
                <Select value={form.route} onChange={update('route')}>
                  <option value="">Select route</option>
                  {MED_ROUTES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {allergyHit && (
              <div className="during-alert warning" style={{ marginBottom: 12, borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c' }}>
                <strong>⚠ ALLERGY ALERT</strong>
                {' — '}
                Patient has a documented allergy to {allergyHit.allergen || allergyHit.name || 'this medication'}
                {allergyHit.severity || allergyHit.reaction ? `. Reaction: ${allergyHit.severity || allergyHit.reaction}` : '.'}
                <div style={{ marginTop: 8 }}>
                  <LibraryCheckbox
                    isChecked={form.allergy_override_confirmed}
                    onChange={(e) => setForm((prev) => ({ ...prev, allergy_override_confirmed: e.target.checked }))}
                  >
                    I have verified this with the patient/prescriber and confirm this medication should still be given.
                  </LibraryCheckbox>
                  <Field label="Override Reason" required>
                    <Textarea
                      maxLength="300"
                      placeholder="Mandatory reason to proceed despite allergy match"
                      value={form.allergy_override_reason}
                      onChange={update('allergy_override_reason')}
                      disabled={!form.allergy_override_confirmed}
                    />
                  </Field>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <Field label="Administration Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="datetime-local" value={form.administered_at} onChange={update('administered_at')} />
              </Field>

              <Field label="Administered By" icon={PersonOutlinedIcon} required>
                <Input
                  type="text"
                  placeholder="Technician / nurse ID or name"
                  value={form.administered_by}
                  onChange={update('administered_by')}
                />
              </Field>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Quantity Used <em style={{ color: '#ef4444' }}>*</em>
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Input type="number" placeholder="e.g. 1" value={form.quantity_used} onChange={update('quantity_used')} style={{ flex: 1 }} />
                  <Select value={form.quantity_unit} onChange={update('quantity_unit')} style={{ width: '110px' }}>
                    <option value="vial">vial</option>
                    <option value="ampoule">ampoule</option>
                    <option value="mL">mL</option>
                  </Select>
                </div>
              </div>

              <Field label="Expiry Date">
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={update('expiry_date')}
                  style={expiryBlocked ? { borderColor: '#ef4444' } : undefined}
                />
                {expiryBlocked && (
                  <span style={{ color: '#dc2626', fontSize: 11 }}>Expired — save blocked</span>
                )}
              </Field>
            </div>

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
                      <Input type="number" value={preVitals.sbp} onChange={(e) => setPreVitals((v) => ({ ...v, sbp: e.target.value }))} style={{ width: '55px', textAlign: 'center' }} />
                      <span>/</span>
                      <Input type="number" value={preVitals.dbp} onChange={(e) => setPreVitals((v) => ({ ...v, dbp: e.target.value }))} style={{ width: '55px', textAlign: 'center' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Pulse (bpm)</label>
                    <Input type="number" value={preVitals.pulse} onChange={(e) => setPreVitals((v) => ({ ...v, pulse: e.target.value }))} style={{ width: '70px', textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>SpO₂ (%)</label>
                    <Input type="number" value={preVitals.spo2} onChange={(e) => setPreVitals((v) => ({ ...v, spo2: e.target.value }))} style={{ width: '70px', textAlign: 'center' }} />
                  </div>
                </div>
              </div>

              <div
                className="during-med-observation-box"
                style={adverseYes ? { borderColor: '#fecaca', background: '#fef2f2' } : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: adverseYes ? '#dc2626' : '#16a34a', marginBottom: '8px' }}>
                  <HealingOutlinedIcon fontSize="small" />
                  <span>Post Medication Observation</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Any Adverse Reaction?</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button type="button" className={`during-severity-btn ${form.adverse_reaction === 'No' ? 'active-green' : ''}`} onClick={() => setForm((v) => ({ ...v, adverse_reaction: 'No', reaction_details: '' }))} style={{ padding: '4px 12px', fontSize: '11px' }}>No</button>
                      <button type="button" className={`during-severity-btn ${form.adverse_reaction === 'Yes' ? 'active-red' : ''}`} onClick={() => setForm((v) => ({ ...v, adverse_reaction: 'Yes' }))} style={{ padding: '4px 12px', fontSize: '11px' }}>Yes</button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Textarea
                      placeholder="Reaction details (required if Yes)"
                      maxLength="250"
                      value={form.reaction_details}
                      onChange={update('reaction_details')}
                      disabled={!adverseYes}
                      style={{ minHeight: 60 }}
                    />
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
              <LibraryButton type="button" variant="outline" onClick={resetForm}>Reset</LibraryButton>
              <LibraryButton type="button" variant="primary" onClick={handleSaveOnly} disabled={saving || saveBlocked}>
                {saving ? 'Saving...' : 'Save Medication'}
              </LibraryButton>
            </div>
          </Card>

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
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '16px', fontSize: '12px' }}>
                        No medication administrations recorded yet for this session.
                      </td>
                    </tr>
                  ) : (
                    history.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td>{formatSymptomTime(row.administration_time || row.administered_at || row.recorded_at)}</td>
                        <td><strong>{row.medication || row.medication_name || '—'}</strong></td>
                        <td>{row.dose != null ? `${row.dose} ${row.dose_unit || row.unit || ''}`.trim() : '—'}</td>
                        <td>{row.route || '—'}</td>
                        <td>{row.indication || '—'}</td>
                        <td>{row.administered_by || '—'}</td>
                        <td>
                          <span className="during-status-pill alert">
                            {Number(row.adverse_reaction) ? 'Adverse Reaction' : 'Administered'}
                          </span>
                        </td>
                        <td>{row.notes || row.reaction_details || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div style={{ minWidth: 0 }}>
          <Card title="Today's Medications Summary">
            <div className="during-med-summary-grid">
              <div className="during-med-stat-tile prescribed">
                <MedicationOutlinedIcon sx={{ color: '#2563eb' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>{summary.total_prescribed}</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Total Prescribed</span>
                </div>
              </div>
              <div className="during-med-stat-tile administered">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>{summary.administered}</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Administered</span>
                </div>
              </div>
              <div className="during-med-stat-tile pending">
                <AccessTimeOutlinedIcon sx={{ color: '#d97706' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>{summary.pending}</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Pending</span>
                </div>
              </div>
              <div className="during-med-stat-tile missed">
                <WarningAmberOutlinedIcon sx={{ color: '#dc2626' }} />
                <div>
                  <strong style={{ fontSize: '18px', display: 'block' }}>{summary.missed}</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Missed</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Medication Reminders" style={{ marginTop: '16px' }}>
            <div className="during-med-reminders-list">
              {reminders.length === 0 ? (
                <div className="during-empty" style={{ padding: 12 }}>No medication reminders for this session.</div>
              ) : (
                reminders.map((rem) => (
                  <button
                    type="button"
                    key={rem.id || rem.medication}
                    className="during-med-reminder-item"
                    onClick={() => applyReminder(rem)}
                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'transparent', border: 'none' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '12px' }}>{rem.medication}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        Dose: {rem.dose != null ? `${rem.dose} ${rem.dose_unit || ''}`.trim() : '—'}
                        {' | '}
                        Route: {rem.route || '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="during-due-badge">
                        {rem.due_at ? `Due ${formatSymptomTime(rem.due_at)}` : 'Scheduled'}
                      </span>
                      <ChevronRightOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                    </div>
                  </button>
                ))
              )}
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
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
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
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-09')}>
                <div className="during-vitals-qa-tile-left"><WarningAmberOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Incidents</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="during-bottom-nav-bar">
        <LibraryButton type="button" variant="outline" onClick={() => go('P3-01')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton type="button" variant="outline" onClick={handleSaveDraft} disabled={saving || saveBlocked}>Save as Draft</LibraryButton>
          <LibraryButton type="button" variant="primary" onClick={handleSaveReturn} disabled={saving || saveBlocked}>
            {saving ? 'Saving...' : 'Save & Return to Dashboard'}
          </LibraryButton>
        </div>
      </div>
    </>
  );
}

const ALARM_TYPES = [
  'High Arterial Pressure',
  'Low Arterial Pressure',
  'High Venous Pressure',
  'Low Venous Pressure',
  'Air/Foam Detected',
  'Blood Leak Detected',
  'Venous Needle Dislodgement (Suspected)',
  'High Conductivity',
  'Low Conductivity',
  'High Dialysate Temperature',
  'Low Dialysate Temperature',
  'Dialysate Flow Fault',
  'High TMP',
  'UF Rate Deviation/System Fault',
  'Heparin Pump Fault/Occlusion',
  'Power Failure/Interruption',
  'System/Battery Fault',
  'Other',
];

const ALARM_ACTIONS = [
  'Reduced BFR',
  'Increased BFR',
  'Repositioned Patient',
  'Flushed Line',
  'Adjusted UF Rate',
  'Cleared Air/Foam',
  'Reset Alarm After Correction',
  'Notified Nurse/Physician',
  'Notified Biomedical Engineer',
  'Other',
];

const ALARM_RELATED_PARAMS = [
  'Arterial Pressure (AP)',
  'Venous Pressure (VP)',
  'TMP',
  'Blood Flow Rate (BFR)',
  'Dialysate Flow Rate (DFR)',
  'Conductivity',
  'Dialysate Temperature',
  'UF Rate',
  'Air Detector',
  'Blood Leak Detector',
  'Other',
];

const DEFAULT_ESCALATION_ROLES = [
  'Nurse In-charge',
  'Nephrologist/Physician',
  'Biomedical Engineer',
  'Centre In-charge',
];

function emptyAlarmForm(technicianId) {
  return {
    alarm_time: nowTime(),
    alarm_type: '',
    severity: '',
    related_parameter: '',
    alarm_code: '',
    description: '',
    current_value: '',
    threshold: '',
    action_taken: '',
    additional_actions: '',
    resolved_by: technicianId || '',
    resolution_time: '',
    resolution_status: '',
    patient_impact: '',
    escalated_to: '',
    escalation_time: '',
    comments: '',
    notify: false,
  };
}

function formatDurationSeconds(seconds) {
  if (seconds == null || seconds === '' || Number.isNaN(Number(seconds))) return '—';
  const total = Math.max(0, Number(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calcDurationDisplay(alarmTime, resolutionTime) {
  if (!alarmTime || !resolutionTime) return '—';
  const a = new Date(alarmTime);
  const b = new Date(resolutionTime);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '—';
  return formatDurationSeconds(Math.round((b.getTime() - a.getTime()) / 1000));
}

function safetyGuidanceForAlarm(alarmType) {
  const t = String(alarmType || '').toLowerCase();
  if (t.includes('venous') && t.includes('high')) {
    return 'High venous pressure may indicate kinking, clotting, or improper needle position. Resolve promptly to prevent treatment interruption.';
  }
  if (t.includes('arterial') && t.includes('low')) {
    return 'Low arterial pressure may indicate access inflow problems, needle malposition, or hypotension. Check access and patient vitals.';
  }
  if (t.includes('air') || t.includes('foam')) {
    return 'Air/foam detected is an air-embolism risk. Stop blood pump if required by protocol, clamp lines, and escalate immediately.';
  }
  if (t.includes('blood leak')) {
    return 'Blood leak detected may indicate circuit/exsanguination risk. Stop treatment per protocol and escalate immediately.';
  }
  if (t.includes('needle dislodg')) {
    return 'Suspected venous needle dislodgement is an emergency. Secure access, control bleeding, and notify nurse/physician immediately.';
  }
  if (t.includes('tmp')) {
    return 'High TMP may indicate clotting or ultrafiltration problems. Reduce UFR as appropriate and assess circuit integrity.';
  }
  if (t.includes('conductivity') || t.includes('dialysate temperature')) {
    return 'Dialysate composition/temperature faults can cause hemolysis or patient instability. Do not continue until corrected.';
  }
  if (t.includes('power')) {
    return 'Power failure/interruption requires safe machine recovery steps and escalation to biomedical/centre in-charge as needed.';
  }
  return 'Never silence alarms without identifying and correcting the underlying cause. Document action taken and resolution status before saving.';
}

function AlarmManagementView({ sessionId, go }) {
  const technicianId = getTechnicianId();
  const [form, setForm] = useState(() => emptyAlarmForm(technicianId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [incidentToast, setIncidentToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [overview, setOverview] = useState({ total: 0, resolved: 0, active: 0, escalated: 0 });
  const [escalationContacts, setEscalationContacts] = useState([]);

  const activeSessionId = getValidSessionId(sessionId);
  const isResolved = String(form.resolution_status || '').toLowerCase() === 'resolved';
  const durationDisplay = isResolved
    ? calcDurationDisplay(form.alarm_time, form.resolution_time)
    : '—';

  const refreshAlarms = useCallback(async () => {
    if (!activeSessionId) return;
    const res = await getAlarms(activeSessionId);
    if (!res?.success) return;
    const d = responseData(res);
    const items = Array.isArray(d) ? d : (d.items || d.alarms || []);
    setHistory(items);
    setActiveAlarms(Array.isArray(d.active_alarms) ? d.active_alarms : items.filter((a) => String(a.resolution_status || '').toLowerCase() !== 'resolved'));
    if (d.overview) {
      setOverview({
        total: Number(d.overview.total) || 0,
        resolved: Number(d.overview.resolved) || 0,
        active: Number(d.overview.active) || 0,
        escalated: Number(d.overview.escalated) || 0,
      });
    } else {
      setOverview({
        total: items.length,
        resolved: items.filter((a) => String(a.resolution_status || '').toLowerCase() === 'resolved').length,
        active: items.filter((a) => String(a.resolution_status || '').toLowerCase() !== 'resolved').length,
        escalated: items.filter((a) => String(a.resolution_status || '').toLowerCase() === 'escalated' || a.escalated_to).length,
      });
    }
    if (Array.isArray(d.escalation_contacts)) setEscalationContacts(d.escalation_contacts);
  }, [activeSessionId]);

  useEffect(() => {
    refreshAlarms();
  }, [refreshAlarms]);

  useEffect(() => {
    if (!incidentToast) return undefined;
    const t = setTimeout(() => setIncidentToast(null), 8000);
    return () => clearTimeout(t);
  }, [incidentToast]);

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const resetForm = () => {
    setForm(emptyAlarmForm(technicianId));
    setError('');
    setInfo('');
  };

  const canSave = Boolean(form.action_taken && form.resolution_status);

  const executeSave = async () => {
    if (!activeSessionId) {
      setError('No active dialysis session ID found. Please start a session from Patient Profile before saving alarm records.');
      return false;
    }
    if (!form.alarm_time || !form.alarm_type || !form.severity || !form.action_taken || !form.resolved_by || !form.resolution_status) {
      setError('Alarm Time, Alarm Type, Severity, Action Taken, Resolved By, and Resolution Status are required.');
      return false;
    }
    if (isResolved && !form.resolution_time) {
      setError('Resolution Time is required when Resolution Status is Resolved.');
      return false;
    }
    if (!isResolved && (!form.escalated_to || form.escalated_to === '-')) {
      setError('Escalated To is required when Resolution Status is not Resolved.');
      return false;
    }

    setSaving(true);
    setError('');
    setInfo('');

    const payload = {
      alarm_time: form.alarm_time,
      alarm_type: form.alarm_type,
      severity: form.severity,
      related_parameter: form.related_parameter || null,
      alarm_code: form.alarm_code || null,
      description: form.description || null,
      current_value: form.current_value || null,
      threshold: form.threshold || null,
      action_taken: form.action_taken,
      additional_actions: form.additional_actions || null,
      resolved_by: form.resolved_by,
      resolution_time: isResolved ? form.resolution_time : null,
      resolution_status: form.resolution_status,
      patient_impact: form.patient_impact || null,
      escalated_to: !isResolved ? form.escalated_to : (form.escalated_to || null),
      escalation_time: form.escalation_time || null,
      comments: form.comments || null,
      notify_flag: Boolean(form.notify),
      recorded_at: new Date().toISOString(),
    };

    const res = await createAlarm(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      const errMsg = responseData(res)?.message || res?.error || res?.message || 'Failed to save alarm record.';
      setError(errMsg);
      return false;
    }

    const d = responseData(res);
    if (d?.auto_incident_created) {
      setIncidentToast({
        incidentId: d.incident_id,
        message: `Incident logged — ID ${d.incident_id}. Review on P3-09.`,
      });
      setInfo(`Alarm saved and incident draft ${d.incident_id} created.`);
    } else {
      setInfo('Alarm record saved successfully.');
    }
    if (d?.overview) setOverview({
      total: Number(d.overview.total) || 0,
      resolved: Number(d.overview.resolved) || 0,
      active: Number(d.overview.active) || 0,
      escalated: Number(d.overview.escalated) || 0,
    });
    resetForm();
    await refreshAlarms();
    return true;
  };

  const handleSaveOnly = async () => { await executeSave(); };
  const handleSaveDraft = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };
  const handleSaveReturn = async () => { const ok = await executeSave(); if (ok) go('P3-01'); };

  const escalationOptions = escalationContacts.length
    ? escalationContacts.map((c) => ({
      value: String(c.id),
      label: [c.role, c.name].filter(Boolean).join(' — ') || `Contact #${c.id}`,
    }))
    : DEFAULT_ESCALATION_ROLES.map((role) => ({ value: role, label: role }));

  return (
    <>
      {incidentToast && (
        <div className="during-alert warning" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{incidentToast.message}</span>
          <button type="button" className="during-card-action-link" onClick={() => go('P3-09')}>
            View Incident →
          </button>
        </div>
      )}

      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title="Record New Alarm">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Alarm Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="datetime-local" value={form.alarm_time} onChange={update('alarm_time')} />
              </Field>

              <Field label="Alarm Type" required>
                <Select value={form.alarm_type} onChange={update('alarm_type')}>
                  <option value="">Select alarm type</option>
                  {ALARM_TYPES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Severity" required>
                <Select value={form.severity} onChange={update('severity')}>
                  <option value="">Select severity</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </Select>
              </Field>

              <Field label="Related Parameter">
                <Select value={form.related_parameter} onChange={update('related_parameter')}>
                  <option value="">Select parameter</option>
                  {ALARM_RELATED_PARAMS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
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
                <Input type="text" value={form.current_value} onChange={update('current_value')} />
              </Field>
              <Field label="Threshold / Limit">
                <Input type="text" value={form.threshold} onChange={update('threshold')} />
              </Field>
              <Field label="Duration (calculated)">
                <Input type="text" value={durationDisplay} readOnly />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Action Taken" required>
                <Select value={form.action_taken} onChange={update('action_taken')}>
                  <option value="">Select action</option>
                  {ALARM_ACTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Additional Actions">
                <Input type="text" value={form.additional_actions} onChange={update('additional_actions')} />
              </Field>
              <Field label="Resolved By" required>
                <Input type="text" placeholder="Technician / nurse ID or name" value={form.resolved_by} onChange={update('resolved_by')} />
              </Field>
              <Field label="Resolution Time" icon={AccessTimeOutlinedIcon} required={isResolved}>
                <Input type="datetime-local" value={form.resolution_time} onChange={update('resolution_time')} disabled={!isResolved} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Resolution Status" required>
                <Select value={form.resolution_status} onChange={update('resolution_status')}>
                  <option value="">Select status</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Ongoing/Unresolved">Ongoing/Unresolved</option>
                  <option value="Escalated">Escalated</option>
                </Select>
              </Field>
              <Field label="Patient Impact">
                <Select value={form.patient_impact} onChange={update('patient_impact')}>
                  <option value="">Select impact</option>
                  <option value="No Adverse Effect">No Adverse Effect</option>
                  <option value="Mild Discomfort">Mild Discomfort</option>
                  <option value="Treatment Interrupted">Treatment Interrupted</option>
                  <option value="Treatment Terminated Early">Treatment Terminated Early</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>
              <Field label="Escalated To" required={!isResolved && Boolean(form.resolution_status)}>
                <Select value={form.escalated_to} onChange={update('escalated_to')} disabled={isResolved}>
                  <option value="">Select contact / role</option>
                  {escalationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Escalation Time">
                <Input type="datetime-local" value={form.escalation_time} onChange={update('escalation_time')} disabled={isResolved} />
              </Field>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Field label="Comments">
                  <Textarea placeholder="Document cause identification and correction..." maxLength="300" value={form.comments} onChange={update('comments')} />
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
              <LibraryButton type="button" variant="outline" onClick={resetForm}>Reset</LibraryButton>
              <LibraryButton type="button" variant="primary" onClick={handleSaveOnly} disabled={saving || !canSave}>
                {saving ? 'Saving...' : 'Save Alarm'}
              </LibraryButton>
            </div>
          </Card>

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
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '16px', fontSize: '12px' }}>
                        No alarms recorded for this session.
                      </td>
                    </tr>
                  ) : (
                    history.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td>{formatSymptomTime(row.alarm_time || row.recorded_at)}</td>
                        <td><strong>{row.alarm_type || '—'}</strong></td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: (row.severity || '').toLowerCase() === 'high' ? '#dc2626' : (row.severity || '').toLowerCase() === 'moderate' ? '#d97706' : '#2563eb' }}>
                            ● {row.severity || '—'}
                          </span>
                        </td>
                        <td>{row.related_parameter || '—'}</td>
                        <td>{formatDurationSeconds(row.duration_seconds)}</td>
                        <td>{row.action_taken || '—'}</td>
                        <td><span className="during-status-pill alert">{row.resolution_status || '—'}</span></td>
                        <td>{row.resolved_by || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div style={{ minWidth: 0 }}>
          <Card title="Alarm Overview">
            <div className="during-alarm-overview-grid">
              <div className="during-alarm-stat-tile" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                <WarningAmberOutlinedIcon sx={{ color: '#dc2626' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.total}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Total Alarms</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.resolved}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Resolved</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                <AccessTimeOutlinedIcon sx={{ color: '#d97706' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.active}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Active</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                <TrendingUpOutlinedIcon sx={{ color: '#2563eb' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.escalated}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Escalated</span></div>
              </div>
            </div>
          </Card>

          <Card title="Active Alarm (Now)" style={{ marginTop: '16px' }}>
            {activeAlarms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 40, color: '#16a34a', marginBottom: '8px' }} />
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#15803d' }}>No Active Alarms</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>All parameters are within safe limits.</div>
              </div>
            ) : (
              activeAlarms.map((alarm) => (
                <div key={alarm.id} style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <strong>{alarm.alarm_type}</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {formatSymptomTime(alarm.alarm_time)} · {alarm.severity || '—'} · {alarm.resolution_status || 'Ongoing'}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{alarm.action_taken || '—'}</div>
                </div>
              ))
            )}
          </Card>

          <div className="during-safety-guidance-card">
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Safety Guidance</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#713f12' }}>
              {safetyGuidanceForAlarm(form.alarm_type)}
            </div>
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
        <LibraryButton type="button" variant="outline" onClick={() => go('P3-01')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton type="button" variant="outline" onClick={handleSaveDraft} disabled={saving || !canSave}>Save as Draft</LibraryButton>
          <LibraryButton type="button" variant="primary" onClick={handleSaveReturn} disabled={saving || !canSave}>
            {saving ? 'Saving...' : 'Save & Return to Dashboard'}
          </LibraryButton>
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

const PROGRESS_EVENT_TYPE_OPTIONS = [
  'UF Goal Adjusted',
  'Patient Repositioned',
  'Parameter Adjustment',
  'Treatment Note',
  'Progress Note',
  'Other',
];

function TreatmentProgressView({ sessionId, go }) {
  const [comments, setComments] = useState('');
  const [nextReview, setNextReview] = useState('');
  const [notify, setNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [uf, setUf] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    event_type: '',
    description: '',
    event_time: nowTime(),
  });

  const activeSessionId = getValidSessionId(sessionId);

  const refreshProgress = useCallback(async () => {
    if (!activeSessionId) return;
    setLoading(true);
    const res = await getDuringDialysisProgress(activeSessionId);
    setLoading(false);
    if (!res?.success) {
      setError(responseData(res)?.message || res?.error || res?.message || 'Failed to load treatment progress.');
      return;
    }
    const d = responseData(res);
    setProgress(d?.progress || d || null);
    setUf(d?.uf || d?.progress?.uf || null);
    setParameters(Array.isArray(d?.parameters_comparison) ? d.parameters_comparison : []);
    setEvents(Array.isArray(d?.events) ? d.events : []);
    setError('');
  }, [activeSessionId]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const fmtHours = (hours) => {
    if (hours == null || Number.isNaN(Number(hours))) return '—';
    const totalMins = Math.max(0, Math.round(Number(hours) * 60));
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const fmtClock = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(value);
    }
  };

  const fmtNum = (value, digits = 2) => {
    if (value == null || value === '' || Number.isNaN(Number(value))) return '—';
    return Number(value).toFixed(digits).replace(/\.?0+$/, '');
  };

  const elapsedStr = progress?.elapsed_formatted || fmtHours(progress?.elapsed);
  const remainingStr = progress?.remaining_formatted || fmtHours(progress?.remaining);
  const totalStr = progress?.total_formatted || fmtHours(progress?.total);
  const percentCompleted = progress?.percent != null ? Math.round(Number(progress.percent)) : 0;
  const percentRemaining = progress?.total && progress.total > 0
    ? Math.max(0, Math.round(100 - percentCompleted))
    : 0;

  const ufTarget = uf?.target ?? progress?.uf_target ?? progress?.uf?.target ?? null;
  const ufAchieved = uf?.removed ?? progress?.uf_achieved ?? progress?.uf?.removed ?? null;
  const ufPct = uf?.percent_of_goal != null
    ? Math.round(Number(uf.percent_of_goal))
    : (ufTarget && ufAchieved != null && Number(ufTarget) > 0
      ? Math.round((Number(ufAchieved) / Number(ufTarget)) * 100)
      : 0);

  const bloodProcessed = progress?.blood_processed;
  const ktV = progress?.kt_v;
  const ktVValue = ktV && typeof ktV === 'object' ? ktV.value : ktV;
  const ktVDisplay = (ktV && typeof ktV === 'object'
    ? (ktV.display || (ktVValue != null ? String(ktVValue) : 'Not available'))
    : (ktVValue != null ? String(ktVValue) : 'Not available'));
  const ktVStatus = ktVValue == null
    ? 'Not available'
    : (Number(ktVValue) >= 1.2 ? 'Adequate' : 'Below target');

  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const ufBarPct = ufTarget && Number(ufTarget) > 0
    ? Math.min(100, Math.round((Number(ufAchieved || 0) / Number(ufTarget)) * 100))
    : 0;

  const updateEvent = (key) => (e) => setEventForm((v) => ({ ...v, [key]: e.target.value }));

  const handleAddEvent = async () => {
    if (!activeSessionId) {
      setError('No active dialysis session found.');
      return;
    }
    if (!eventForm.event_type) {
      setError('Event type is required.');
      return;
    }
    setAddingEvent(true);
    setError('');
    const res = await createTreatmentEvent(activeSessionId, {
      event_type: eventForm.event_type,
      description: eventForm.description || null,
      event_time: eventForm.event_time || null,
    });
    setAddingEvent(false);
    if (!res.success) {
      setError(responseData(res)?.message || res?.error || res?.message || 'Failed to add event.');
      return;
    }
    setInfo('Event added.');
    setShowAddEvent(false);
    setEventForm({ event_type: '', description: '', event_time: nowTime() });
    await refreshProgress();
  };

  const handleSaveReturn = async () => {
    if (!activeSessionId) {
      go('P3-01');
      return;
    }
    const hasNote = Boolean(comments.trim() || nextReview || notify);
    if (!hasNote) {
      go('P3-01');
      return;
    }
    setSaving(true);
    setError('');
    const res = await createTreatmentEvent(activeSessionId, {
      event_type: 'Progress Note',
      comments: comments.trim() || null,
      next_review_time: nextReview || null,
      notify_flag: notify,
      event_time: nowTime(),
    });
    setSaving(false);
    if (!res.success) {
      setError(responseData(res)?.message || res?.error || res?.message || 'Failed to save progress note.');
      return;
    }
    go('P3-01');
  };

  return (
    <>
      {error && <div className="during-alert warning" style={{ marginBottom: 12 }}>{error}</div>}
      {info && <div className="during-alert" style={{ marginBottom: 12 }}>{info}</div>}
      {loading && !progress && <div style={{ marginBottom: 12, color: '#64748b' }}>Loading treatment progress…</div>}

      <div className="during-progress-rings-grid">
        <ProgressRingGaugeSVG
          title="Elapsed Time"
          value={elapsedStr}
          unit="hr:min"
          sub={totalStr !== '—' ? `of ${totalStr} hr` : 'Prescribed duration unavailable'}
          status={progress?.percent != null ? `${percentCompleted}% Completed` : '—'}
          statusColor="blue"
          percent={percentCompleted}
          strokeColor="#2563eb"
        />
        <ProgressRingGaugeSVG
          title="Remaining Time"
          value={remainingStr}
          unit="hr:min"
          sub="Remaining"
          status={progress?.percent != null ? `${percentRemaining}% Remaining` : '—'}
          statusColor="green"
          percent={percentRemaining}
          strokeColor="#16a34a"
        />
        <ProgressRingGaugeSVG
          title="UF Target"
          value={ufTarget != null ? fmtNum(ufTarget) : '—'}
          unit="L"
          sub="Goal"
          status={ufTarget != null ? 'Set at start' : 'Not set'}
          statusColor="purple"
          percent={ufTarget != null ? 100 : 0}
          strokeColor="#8b5cf6"
        />
        <ProgressRingGaugeSVG
          title="UF Achieved"
          value={ufAchieved != null ? fmtNum(ufAchieved) : '—'}
          unit="L"
          sub="Achieved"
          status={ufTarget != null ? `${ufPct}% of target` : '—'}
          statusColor="blue"
          percent={Math.min(100, ufPct)}
          strokeColor="#2563eb"
        />
        <ProgressRingGaugeSVG
          title="Blood Processed"
          value={bloodProcessed != null ? fmtNum(bloodProcessed) : '—'}
          unit="L"
          sub="Total Processed"
          status={bloodProcessed != null ? 'Live cumulative' : '—'}
          statusColor="green"
          percent={bloodProcessed != null ? Math.min(100, Math.round(Number(bloodProcessed))) : 0}
          strokeColor="#f97316"
        />
        <ProgressRingGaugeSVG
          title="Treatment Efficiency (Kt/V)"
          value={ktVValue != null ? fmtNum(ktVValue, 2) : '—'}
          unit=""
          sub="Prior session"
          status={ktVStatus}
          statusColor="teal"
          percent={ktVValue != null ? Math.min(100, Math.round((Number(ktVValue) / 1.4) * 100)) : 0}
          strokeColor="#0d9488"
        />
      </div>

      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
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
                  {parameters.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                        No machine parameters recorded yet — open P3-03 to log readings.
                      </td>
                    </tr>
                  ) : parameters.map((p) => (
                    <tr key={p.key || p.name} className={p.status === 'Off Target' ? 'during-row-off-target' : undefined}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.current_display || '—'}</td>
                      <td>{p.target_display || p.target || '—'}</td>
                      <td>
                        <span className={`during-status-pill ${p.status === 'Off Target' ? 'alert' : p.status === 'On Target' ? 'ok' : ''}`}>
                          {p.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button type="button" className="during-card-action-link" onClick={() => go('P3-03')}>
                Adjust in Machine Parameters →
              </button>
            </div>
          </Card>

          <Card title="Treatment Interventions / Events" style={{ marginTop: '16px' }}>
            <div className="during-card-header" style={{ marginTop: '-24px', marginBottom: '12px' }}>
              <span />
              <LibraryButton variant="outline" size="sm" onClick={() => { setShowAddEvent((v) => !v); setError(''); }}>
                {showAddEvent ? 'Cancel' : '+ Add Event'}
              </LibraryButton>
            </div>

            {showAddEvent && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr auto', gap: 10, marginBottom: 14, alignItems: 'end' }}>
                <Field label="Event Type" required>
                  <Select value={eventForm.event_type} onChange={updateEvent('event_type')}>
                    <option value="">Select type</option>
                    {PROGRESS_EVENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Description">
                  <Input
                    type="text"
                    maxLength={200}
                    placeholder="Brief description (0/200)"
                    value={eventForm.description}
                    onChange={updateEvent('description')}
                  />
                </Field>
                <Field label="Time" icon={AccessTimeOutlinedIcon}>
                  <Input type="datetime-local" value={eventForm.event_time} onChange={updateEvent('event_time')} />
                </Field>
                <LibraryButton variant="primary" size="sm" onClick={handleAddEvent} disabled={addingEvent}>
                  {addingEvent ? 'Saving…' : 'Add'}
                </LibraryButton>
              </div>
            )}

            <div className="during-events-list">
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '16px 0' }}>
                  No events logged this session.
                </div>
              ) : events.map((ev) => (
                <div key={ev.id} className="during-event-item">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '11px', color: '#64748b' }}>{fmtClock(ev.event_time)}</strong>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{ev.event_type}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{ev.description || '—'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ev.recorded_by_name || '—'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <Field label="Comments">
                <Textarea
                  placeholder="Enter any observations or comments..."
                  maxLength={300}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </Field>
              <div>
                <Field label="Next Review Time" icon={AccessTimeOutlinedIcon}>
                  <Input type="datetime-local" value={nextReview} onChange={(e) => setNextReview(e.target.value)} />
                </Field>
                <div style={{ marginTop: '16px' }}>
                  <LibraryCheckbox isChecked={notify} onChange={(e) => setNotify(e.target.checked)}>
                    Notify Nurse / Doctor
                  </LibraryCheckbox>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ minWidth: 0 }}>
          <Card title="Real-time Summary">
            <div style={{ fontSize: '12px' }}>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Session Start Time</span><strong>{fmtClock(progress?.started_at)}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Planned Duration</span><strong>{totalStr !== '—' ? `${totalStr} hr` : '—'}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Current Time</span><strong>{currentTimeStr}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Elapsed Time</span><strong>{elapsedStr !== '—' ? `${elapsedStr} hr${progress?.percent != null ? ` (${percentCompleted}%)` : ''}` : '—'}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Remaining Time</span><strong>{remainingStr !== '—' ? `${remainingStr} hr${progress?.percent != null ? ` (${percentRemaining}%)` : ''}` : '—'}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>UF Target</span><strong>{ufTarget != null ? `${fmtNum(ufTarget)} L` : '—'}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>UF Achieved</span><strong>{ufAchieved != null ? `${fmtNum(ufAchieved)} L${ufTarget != null ? ` (${ufPct}%)` : ''}` : '—'}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Blood Processed</span><strong>{bloodProcessed != null ? `${fmtNum(bloodProcessed)} L` : '—'}</strong></div>
              <div className="during-access-summary-row"><span style={{ color: '#64748b' }}>Kt/V (Estimated)</span><strong>{ktVDisplay}</strong></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button type="button" className="during-card-action-link" onClick={() => go('P3-03')}>View Parameter Trends →</button>
            </div>
          </Card>

          <Card title="UF Progress" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}>
              <span>UF Achieved {ufAchieved != null ? `${fmtNum(ufAchieved)} L` : '—'}</span>
              <span>Target {ufTarget != null ? `${fmtNum(ufTarget)} L` : '—'}</span>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${ufBarPct}%`, height: '100%', background: '#2563eb', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
              {ufTarget != null ? `${ufPct}% of UF goal` : 'UF goal not set in Part 2'}
            </div>
          </Card>

          <div className="during-safety-guidance-card">
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Clinical Guidance</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#713f12' }}>
              Monitor treatment progress to ensure adequate dose (Kt/V ≥ 1.2) and UF goal achievement. Adjust parameters as per patient tolerance. Mid-session Kt/V shows the most recent completed assessment only — live Kt/V is calculated in Part 4 after blood return.
            </div>
          </div>

          <Card title="Quick Actions" style={{ marginTop: '16px' }}>
            <div className="during-vitals-qa-2x2-grid">
              <button type="button" className="during-vitals-qa-tile" onClick={() => go('P3-03')}>
                <div className="during-vitals-qa-tile-left"><TrendingUpOutlinedIcon sx={{ color: '#2563eb' }} fontSize="small" /><span>Parameter Trends</span></div>
                <ChevronRightOutlinedIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </button>
              <button type="button" className="during-vitals-qa-tile" onClick={() => setShowAddEvent(true)}>
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
        <LibraryButton variant="outline" onClick={() => go('P3-01')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="primary" onClick={handleSaveReturn} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Return to Dashboard'}
          </LibraryButton>
        </div>
      </div>
    </>
  );
}

const INCIDENT_TYPES = [
  'Severe Hypotension/Syncope',
  'Patient Fall',
  'Vascular Access Needle Infiltration/Blood Loss',
  'Medication Error',
  'Machine Malfunction',
  'Other',
];

const INCIDENT_CATEGORIES = ['Clinical', 'Technical', 'Administrative'];

const INCIDENT_CAUSES = [
  'UF Rate Too High',
  'Needle Position Issue',
  'Clotting',
  'Kinked Line',
  'Equipment Malfunction',
  'Patient Movement',
  'Medication Error',
  'Communication Gap',
  'Unknown',
  'Other',
];

const INCIDENT_OUTCOMES = [
  'Stabilized',
  'Resolved - No Harm',
  'Resolved - Required Intervention',
  'Ongoing Monitoring',
  'Transferred/Escalated',
  'Deceased',
  'Other',
];

function toDatetimeLocalValue(value) {
  if (!value) return '';
  try {
    const d = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function emptyIncidentForm(technicianId = '') {
  return {
    event_time: nowTime(),
    incident_type: '',
    category: '',
    severity: '',
    description: '',
    cause: '',
    observed_time: '',
    intervention: '',
    intervention_details: '',
    outcome: '',
    escalated_to: '',
    escalation_time: '',
    further_action: 'No',
    followup: 'No',
    resolved_by: technicianId || '',
    resolution_time: '',
    comments: '',
    notify: false,
  };
}

function IncidentReportingView({ sessionId, go }) {
  const technicianId = getTechnicianId();
  const [form, setForm] = useState(() => emptyIncidentForm(technicianId));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [overview, setOverview] = useState({ total: 0, open: 0, resolved: 0, escalated: 0 });
  const [escalationContacts, setEscalationContacts] = useState([]);

  const activeSessionId = getValidSessionId(sessionId);
  const furtherRequired = form.further_action === 'Yes';

  const refreshIncidents = useCallback(async () => {
    if (!activeSessionId) return;
    const res = await getIncidents(activeSessionId);
    if (!res?.success) return;
    const d = responseData(res);
    const items = Array.isArray(d) ? d : d.incidents || d.items || [];
    setIncidents(items);
    if (d?.overview) {
      setOverview({
        total: Number(d.overview.total) || 0,
        open: Number(d.overview.open) || 0,
        resolved: Number(d.overview.resolved) || 0,
        escalated: Number(d.overview.escalated) || 0,
      });
    } else {
      setOverview({
        total: items.length,
        open: items.filter((i) => ['draft', 'open', 'pending'].includes(String(i.status || '').toLowerCase())).length,
        resolved: items.filter((i) => ['resolved', 'closed'].includes(String(i.status || '').toLowerCase())).length,
        escalated: items.filter((i) => String(i.status || '').toLowerCase() === 'escalated' || i.further_action_required).length,
      });
    }
    if (Array.isArray(d?.escalation_contacts)) setEscalationContacts(d.escalation_contacts);
  }, [activeSessionId]);

  useEffect(() => {
    refreshIncidents();
  }, [refreshIncidents]);

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyIncidentForm(technicianId));
    setError('');
    setInfo('');
  };

  const loadIncidentIntoForm = (inc) => {
    setEditingId(inc.id);
    setForm({
      event_time: toDatetimeLocalValue(inc.event_time) || nowTime(),
      incident_type: inc.incident_type || '',
      category: inc.event_category || '',
      severity: inc.severity || '',
      description: inc.description || '',
      cause: inc.suspected_cause || '',
      observed_time: toDatetimeLocalValue(inc.event_time_observed),
      intervention: inc.intervention || '',
      intervention_details: inc.intervention_details || '',
      outcome: inc.outcome || '',
      escalated_to: inc.escalated_to != null ? String(inc.escalated_to) : '',
      escalation_time: toDatetimeLocalValue(inc.escalation_time),
      further_action: Number(inc.further_action_required) === 1 || String(inc.further_action_required).toLowerCase() === 'yes' ? 'Yes' : 'No',
      followup: Number(inc.follow_up_required) === 1 || String(inc.follow_up_required).toLowerCase() === 'yes' ? 'Yes' : 'No',
      resolved_by: inc.resolved_by != null ? String(inc.resolved_by) : (technicianId || ''),
      resolution_time: toDatetimeLocalValue(inc.resolution_time),
      comments: inc.comments || '',
      notify: Boolean(Number(inc.notify_flag)),
    });
    setInfo(inc.is_auto ? `Completing auto-created draft from ${inc.source_screen || 'another screen'}.` : 'Editing incident.');
    setError('');
  };

  const buildPayload = (asDraft = false) => ({
    event_time: form.event_time,
    incident_type: form.incident_type,
    event_category: form.category,
    severity: form.severity,
    description: form.description || null,
    suspected_cause: form.cause || null,
    event_time_observed: form.observed_time || null,
    intervention: form.intervention || null,
    intervention_details: form.intervention_details || null,
    outcome: form.outcome || null,
    escalated_to: furtherRequired ? form.escalated_to : (form.escalated_to || null),
    escalation_time: furtherRequired ? (form.escalation_time || null) : (form.escalation_time || null),
    further_action_required: form.further_action,
    follow_up_required: form.followup,
    resolved_by: form.resolved_by || null,
    resolution_time: form.resolution_time || null,
    comments: form.comments || null,
    notify_flag: Boolean(form.notify),
    save_as_draft: asDraft,
    recorded_at: new Date().toISOString(),
  });

  const executeSave = async ({ asDraft = false } = {}) => {
    if (!activeSessionId) {
      const alertMsg = 'No active dialysis session ID found. Please start a session from Patient Profile before submitting incident report.';
      setError(alertMsg);
      return false;
    }
    if (!asDraft) {
      if (!form.event_time || !form.incident_type || !form.category || !form.severity || !form.description || !form.intervention || !form.outcome) {
        setError('Event Time, Incident Type, Event Category, Severity, Description, Intervention, and Outcome are required.');
        return false;
      }
      if (furtherRequired && !form.escalated_to) {
        setError('Escalated To is required when Further Action Required is Yes.');
        return false;
      }
      if (furtherRequired && !form.escalation_time) {
        setError('Escalation Time is required when Further Action Required is Yes.');
        return false;
      }
    } else if (!form.incident_type) {
      setError('Incident Type is required to save a draft.');
      return false;
    }

    setSaving(true);
    setError('');
    const payload = buildPayload(asDraft);
    const res = editingId
      ? await updateIncident(activeSessionId, editingId, payload)
      : await createIncident(activeSessionId, payload);
    setSaving(false);

    if (!res.success) {
      setError(responseData(res)?.message || res?.error || res?.message || 'Failed to save incident report.');
      return false;
    }

    const d = responseData(res);
    if (d?.overview) {
      setOverview({
        total: Number(d.overview.total) || 0,
        open: Number(d.overview.open) || 0,
        resolved: Number(d.overview.resolved) || 0,
        escalated: Number(d.overview.escalated) || 0,
      });
    }
    setInfo(asDraft ? 'Incident draft saved.' : 'Incident report saved successfully.');
    resetForm();
    await refreshIncidents();
    return true;
  };

  const handleSaveOnly = async () => { await executeSave({ asDraft: false }); };
  const handleSaveDraft = async () => { const ok = await executeSave({ asDraft: true }); if (ok) go('P3-01'); };
  const handleSaveReturn = async () => { const ok = await executeSave({ asDraft: false }); if (ok) go('P3-01'); };

  const escalationOptions = escalationContacts.length
    ? escalationContacts.map((c) => ({
      value: String(c.id),
      label: [c.role, c.name].filter(Boolean).join(' — ') || `Contact #${c.id}`,
    }))
    : DEFAULT_ESCALATION_ROLES.map((role) => ({ value: role, label: role }));

  const typeOptions = useMemo(() => {
    const current = form.incident_type;
    if (current && !INCIDENT_TYPES.includes(current)) {
      return [current, ...INCIDENT_TYPES];
    }
    return INCIDENT_TYPES;
  }, [form.incident_type]);

  const fmtClock = (value) => {
    if (!value) return '—';
    try {
      return new Date(String(value).replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(value);
    }
  };

  return (
    <>
      <div className="during-symptoms-layout-grid">
        <div style={{ minWidth: 0 }}>
          <Card title={editingId ? 'Complete / Update Incident' : 'Report New Incident / Event'}>
            {editingId && (
              <div className="during-alert" style={{ marginBottom: 12 }}>
                Editing incident #{editingId}.{' '}
                <button type="button" className="during-card-action-link" onClick={resetForm}>Start new instead</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Event Time" icon={AccessTimeOutlinedIcon} required>
                <Input type="datetime-local" value={form.event_time} onChange={update('event_time')} />
              </Field>

              <Field label="Incident Type" required>
                <Select value={form.incident_type} onChange={update('incident_type')}>
                  <option value="">Select type</option>
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Event Category" required>
                <Select value={form.category} onChange={update('category')}>
                  <option value="">Select category</option>
                  {INCIDENT_CATEGORIES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
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
              <Field label="Description of Incident" required>
                <Textarea placeholder="Describe the incident..." maxLength={500} value={form.description} onChange={update('description')} />
              </Field>

              <Field label="Suspected Cause (if known)">
                <Select value={form.cause} onChange={update('cause')}>
                  <option value="">Select cause</option>
                  {INCIDENT_CAUSES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Event Time (Observed)" icon={AccessTimeOutlinedIcon}>
                <Input type="datetime-local" value={form.observed_time} onChange={update('observed_time')} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <Field label="Intervention / Action Taken" required>
                <Select value={form.intervention} onChange={update('intervention')}>
                  <option value="">Select intervention</option>
                  {SYMPTOM_INTERVENTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Intervention Details">
                <Textarea placeholder="Details of action taken..." maxLength={300} value={form.intervention_details} onChange={update('intervention_details')} />
              </Field>

              <Field label="Outcome / Patient Status" required>
                <Select value={form.outcome} onChange={update('outcome')}>
                  <option value="">Select outcome</option>
                  {INCIDENT_OUTCOMES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <Field label="Escalated To" required={furtherRequired}>
                <Select value={form.escalated_to} onChange={update('escalated_to')} disabled={!furtherRequired && !form.escalated_to}>
                  <option value="">—</option>
                  {escalationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Escalation Time" icon={AccessTimeOutlinedIcon} required={furtherRequired}>
                <Input type="datetime-local" value={form.escalation_time} onChange={update('escalation_time')} disabled={!furtherRequired} />
              </Field>

              <Field label="Further Action Required">
                <Select
                  value={form.further_action}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((v) => ({
                      ...v,
                      further_action: val,
                      escalated_to: val === 'Yes' ? v.escalated_to : '',
                      escalation_time: val === 'Yes' ? (v.escalation_time || nowTime()) : '',
                    }));
                  }}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </Field>

              <Field label="Follow-up Required">
                <Select value={form.followup} onChange={update('followup')}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '10px', marginBottom: '12px' }}>
              <Field label="Resolved By">
                <Input type="text" placeholder="Technician / nurse ID or name" value={form.resolved_by} onChange={update('resolved_by')} />
              </Field>

              <Field label="Resolution Time" icon={AccessTimeOutlinedIcon}>
                <Input type="datetime-local" value={form.resolution_time} onChange={update('resolution_time')} />
              </Field>

              <Field label="Comments / Additional Notes">
                <Textarea placeholder="Additional notes..." maxLength={300} value={form.comments} onChange={update('comments')} />
              </Field>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <LibraryCheckbox isChecked={form.notify} onChange={(e) => setForm((v) => ({ ...v, notify: e.target.checked }))}>
                Notify Nurse / Doctor
              </LibraryCheckbox>
              <div style={{ display: 'flex', gap: '10px' }}>
                <LibraryButton variant="outline" onClick={resetForm}>Reset</LibraryButton>
                <LibraryButton variant="primary" onClick={handleSaveOnly} disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Incident' : 'Save Incident')}
                </LibraryButton>
              </div>
            </div>

            {error && <div className="during-error" style={{ marginTop: '12px' }}>{error}</div>}
            {info && <div className="during-alert success" style={{ marginTop: '12px' }}>{info}</div>}
          </Card>
        </div>

        <div style={{ minWidth: 0 }}>
          <Card title="Incident Overview">
            <div className="during-alarm-overview-grid">
              <div className="during-alarm-stat-tile" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                <WarningAmberOutlinedIcon sx={{ color: '#dc2626' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.total}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>This Session</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                <AccessTimeOutlinedIcon sx={{ color: '#d97706' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.open}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Open</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.resolved}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Resolved</span></div>
              </div>
              <div className="during-alarm-stat-tile" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                <TrendingUpOutlinedIcon sx={{ color: '#2563eb' }} />
                <div><strong style={{ fontSize: '18px', display: 'block' }}>{overview.escalated}</strong><span style={{ fontSize: '10px', color: '#64748b' }}>Escalated</span></div>
              </div>
            </div>
          </Card>

          <Card title="Recent Incidents (This Session)" style={{ marginTop: '16px' }}>
            {incidents.length === 0 ? (
              <div className="during-empty" style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                No incidents this session.
              </div>
            ) : (
              <div className="during-med-reminders-list">
                {incidents.map((inc) => (
                  <button
                    key={inc.id}
                    type="button"
                    className="during-med-reminder-item"
                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: editingId === inc.id ? '1px solid #2563eb' : undefined }}
                    onClick={() => loadIncidentIntoForm(inc)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '12px' }}>
                        {inc.incident_type || 'Incident'}
                        {Number(inc.is_auto) === 1 ? ' · Auto' : ''}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {fmtClock(inc.event_time)} • {inc.status || 'draft'}
                        {inc.source_screen ? ` · from ${inc.source_screen}` : ''}
                      </div>
                    </div>
                    <span className="during-status-pill alert" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {inc.severity || '—'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <div className="during-safety-guidance-card">
            <div className="during-clinical-guidance-header" style={{ color: '#ca8a04' }}>
              <SettingsOutlinedIcon fontSize="small" />
              <span>Safety Reminder</span>
            </div>
            <div className="during-clinical-guidance-text" style={{ color: '#713f12' }}>
              Report all incidents immediately and take appropriate action to ensure patient safety. Auto-drafts from P3-04/05/06/07 appear here for completion — click a card to finish Escalation, Outcome, and Follow-up.
            </div>
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
        <LibraryButton variant="outline" onClick={() => go('P3-01')}>← Back</LibraryButton>
        <div style={{ display: 'flex', gap: '12px' }}>
          <LibraryButton variant="outline" onClick={handleSaveDraft} disabled={saving}>Save as Draft</LibraryButton>
          <LibraryButton variant="primary" onClick={handleSaveReturn} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Return to Dashboard'}
          </LibraryButton>
        </div>
      </div>
    </>
  );
}

function TreatmentCompletionView({ sessionId, go, onCompleted, patient }) {
  const navigate = useNavigate();
  const [disposition, setDisposition] = useState('Discharged');
  const [dischargeTime, setDischargeTime] = useState(nowTime());
  const [dischargedBy, setDischargedBy] = useState('Rahul Singh (Technician)');
  const [comments, setComments] = useState('Patient stable. No complaints.');
  const [sessionDate, setSessionDate] = useState(new Date().toLocaleDateString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const activeSessionId = sessionId || localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || '';

  useEffect(() => {
    if (!activeSessionId || activeSessionId === 'preview' || activeSessionId === 'demo') return;
    getDuringDialysisDashboard(activeSessionId).then((res) => {
      if (res?.success) {
        setDashboardData(responseData(res));
      }
    });
  }, [activeSessionId]);

  const checklistItems = [
    'Blood returned to patient',
    'Dialyzer cleared',
    'Needles removed & hemostasis achieved',
    'Access site dressed',
    'Post dialysis vitals recorded',
    'Patient education / instructions given',
    'Machine & station sanitized',
  ];

  const ufData = dashboardData?.uf || {};
  const machineStatus = dashboardData?.machine_status || {};
  const machineLatest = dashboardData?.machine_latest || {};
  const progressData = dashboardData?.progress || {};

  const ufRemoved = ufData.removed !== undefined && ufData.removed !== null ? `${Number(ufData.removed).toFixed(2)} L` : '—';
  const ufTarget = ufData.target ? `${(Number(ufData.target) > 50 ? Number(ufData.target) / 1000 : Number(ufData.target)).toFixed(2)} L` : '—';
  const rawBloodProcessed = machineLatest.blood_volume_processed || machineStatus.blood_processed || progressData.blood_processed || progressData.blood_volume;
  const bloodProcessed = rawBloodProcessed !== undefined && rawBloodProcessed !== null && rawBloodProcessed !== '' ? `${rawBloodProcessed} L` : '—';

  const rawKtV = progressData.kt_v || dashboardData?.kt_v;
  const ktVVal = typeof rawKtV === 'object' && rawKtV !== null
    ? (rawKtV.display || (rawKtV.value !== null && rawKtV.value !== undefined ? String(rawKtV.value) : 'Not available'))
    : (rawKtV !== undefined && rawKtV !== null ? String(rawKtV) : 'Not available');

  const rawBfr = machineLatest.bfr || machineStatus.bfr;
  const avgBfr = rawBfr ? `${rawBfr} mL/min` : '—';

  const outcomes = [
    { label: 'UF Achieved', value: ufRemoved, sub: ufTarget !== '—' ? `Target: ${ufTarget}` : 'Target: —', color: '#8b5cf6', icon: WaterDropOutlinedIcon },
    { label: 'Blood Processed', value: bloodProcessed, sub: 'Adequate', color: '#dc2626', icon: WaterDropOutlinedIcon },
    { label: 'Kt/V (Estimated)', value: ktVVal, sub: 'Read-only', color: '#2563eb', icon: MonitorHeartOutlinedIcon },
    { label: 'Avg Blood Flow (BFR)', value: avgBfr, sub: 'Within range', color: '#d97706', icon: AirOutlinedIcon },
    { label: 'Treatment Efficiency', value: 'Good', sub: 'No issues', color: '#0d9488', icon: CheckCircleOutlinedIcon },
  ];

  const handleCompleteSession = async () => {
    const activeSessionId = getValidSessionId(sessionId);
    if (!activeSessionId) {
      const alertMsg = 'No active dialysis session ID found. Please start a session from Patient Profile before completing treatment.';
      setError(alertMsg);
      alert(alertMsg);
      return;
    }
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
  const pid = String(patientId || patientData?.id || location.state?.patient?.id || location.state?.patientId || localStorage.getItem('lastDialysisPatientId') || '').trim();
  const rawSessionId = embeddedSessionId || resolvedRouteSessionId || location.state?.sessionId || location.state?.session_id || location.state?.sessionID || querySessionId || persistedSessionId || '';
  let cleanSessionId = String(rawSessionId || '').trim();
  if (cleanSessionId && pid && (cleanSessionId === pid || cleanSessionId === `P${pid}` || cleanSessionId.toLowerCase() === pid.toLowerCase())) {
    cleanSessionId = '';
  }
  const sessionId = cleanSessionId;
  const isDemo = sessionId === 'demo' || sessionId === 'preview';
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
  const [dashboardMeta, setDashboardMeta] = useState({ elapsedFormatted: '—', alertCount: 0, lastUpdatedAt: null });
  const handleDashboardMeta = useCallback((meta) => {
    setDashboardMeta((prev) => ({ ...prev, ...meta }));
  }, []);
  const activeScreenLabel = useMemo(() => {
    const found = SCREENS.find(([id]) => id === active);
    return found ? `${found[0]} – ${found[1]}` : 'P3-01 – Treatment Dashboard';
  }, [active]);
  const activeScreenSubtitle = active === 'P3-01'
    ? 'Real-time overview of patient status and treatment progress.'
    : 'During-dialysis monitoring — return to the dashboard anytime from Quick Actions or the screen rail.';
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
  const content = active === 'P3-01' ? <Dashboard go={go} session={session} readings={readings} sessionId={sessionId} patient={patient} onDashboardMeta={handleDashboardMeta} /> : active === 'P3-02' ? <VitalsForm sessionId={sessionId} readings={readings} onSaved={(entry) => setReadings((v) => [...v, entry])} go={go} /> : active === 'P3-03' ? <P303MachineParameters sessionId={sessionId} session={session} patient={patient} parameterQuestions={parameterQuestions} onSave={() => go('P3-01')} onSaveDraft={() => {}} onBack={() => go('P3-01')} /> : active === 'P3-04' ? <SymptomForm sessionId={sessionId} go={go} /> : active === 'P3-05' ? <VascularAccessMonitoringView sessionId={sessionId} go={go} /> : active === 'P3-06' ? <MedicationAdministrationView sessionId={sessionId} go={go} patientId={patientId || patient.id} /> : active === 'P3-07' ? <AlarmManagementView sessionId={sessionId} go={go} /> : active === 'P3-08' ? <TreatmentProgressView sessionId={sessionId} go={go} /> : active === 'P3-09' ? <IncidentReportingView sessionId={sessionId} go={go} /> : <TreatmentCompletionView sessionId={sessionId} go={go} onCompleted={onCompleted} patient={patient} />;
  const alertBadgeCount = Number(dashboardMeta.alertCount) || 0;
  return <div className={`during-page ${embedded ? 'during-page--embedded' : ''}`}>
    {missingBanner}
    <header className="during-page-header">
      <div>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{activeScreenLabel}</h1>
        <p className="during-muted" style={{ margin: '2px 0 0', fontSize: '12px' }}>{activeScreenSubtitle}</p>
      </div>
      <div className="during-page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Select size="sm" style={{ width: '130px', background: '#f8fafc' }} defaultValue="Main Center">
          <option value="Main Center">📍 Main Center</option>
        </Select>
        <button
          type="button"
          style={{ position: 'relative', cursor: 'pointer', padding: '6px', border: 'none', background: 'transparent' }}
          onClick={() => go('P3-07')}
          aria-label="Open alarm management"
        >
          <NotificationsNoneOutlinedIcon sx={{ color: '#475569', fontSize: 22 }} />
          {alertBadgeCount > 0 && (
            <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 800, borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{alertBadgeCount > 9 ? '9+' : alertBadgeCount}</span>
          )}
        </button>
        <div className="during-session-time-card">
          <AccessTimeOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <div>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block', lineHeight: 1 }}>Session Time</span>
            <strong style={{ fontSize: '14px', color: '#0f172a', lineHeight: 1.2 }}>{dashboardMeta.elapsedFormatted || '—'}</strong>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block', lineHeight: 1 }}>Elapsed</span>
          </div>
        </div>
        <LibraryButton variant="outline" size="sm" onClick={() => go('P3-10')} style={{ color: '#2563eb', borderColor: '#cbd5e1', fontWeight: 600 }}>End Treatment</LibraryButton>
      </div>
    </header>
    <nav className="during-stepper" aria-label="During Dialysis screens (you are here indicator)">
      {SCREENS.map(([id, label], index) => <React.Fragment key={id}>
        <button type="button" className={active === id ? 'active' : ''} onClick={() => go(id)} aria-current={active === id ? 'page' : undefined}>
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
