import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';
import { createMachineParameters, getMachineParameters } from '../../ApiCalls/dialysisSessionApis';

import RefreshIcon from '@mui/icons-material/Refresh';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const INITIAL_PARAMETERS = {
  bfr: '',
  dfr: '',
  ap: '',
  vp: '',
  tmp: '',
  ufr: '',
  uf_removed: '',
  blood_volume_processed: '',
  conductivity: '',
  dialysate_temperature: '',
  heparin_rate: '',
  blood_leak: 'No Leak Detected',
};

const INITIAL_CHECKS = {
  powerSupply: true,
  dialysateSystem: true,
  heparinSystem: true,
  airDetector: true,
  bloodLeakDetector: true,
};

const TABS = ['Overview', 'Pressures', 'Flows', 'Dialysate', 'Ultrafiltration', 'Advanced Parameters'];

const MISSING = '—';
const NOT_AVAILABLE = 'Not Available';

function dash(value) {
  if (value === undefined || value === null || value === '') return MISSING;
  return String(value);
}

function toNullableNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatDisplay(value, digits) {
  const n = toNullableNumber(value);
  if (n === null) return MISSING;
  if (digits === undefined) return String(n);
  return n.toFixed(digits);
}

function classifyTmp(value) {
  const v = toNullableNumber(value);
  if (v === null) return null;
  if (v >= 300) return 'critical';
  if (v >= 61) return 'warning';
  if (v >= 20 && v <= 60) return 'normal';
  if (v < 20) return 'warning';
  return null;
}

function classifyConductivity(value) {
  const v = toNullableNumber(value);
  if (v === null) return null;
  if (v < 13.0 || v > 16.0) return 'critical';
  if (v < 13.5 || v > 15.5) return 'warning';
  return 'normal';
}

function classifyDialysateTemp(value) {
  const v = toNullableNumber(value);
  if (v === null) return null;
  if (v < 34.5 || v > 37.5) return 'critical';
  if (v < 35.0 || v > 37.0) return 'warning';
  return 'normal';
}

function classifyArterialPressure(value) {
  const v = toNullableNumber(value);
  if (v === null) return null;
  if (v < -300 || v > 300) return 'critical';
  if (v < -250 || v > 250) return 'warning';
  return 'normal';
}

function classifyVenousPressure(value) {
  const v = toNullableNumber(value);
  if (v === null) return null;
  if (v < -100 || v > 500) return 'critical';
  return 'normal';
}

function classifyVsPrescribed(value, prescribed, tolerancePct = 0.1) {
  const v = toNullableNumber(value);
  const p = toNullableNumber(prescribed);
  if (v === null || p === null || p === 0) return null;
  const delta = Math.abs(v - p) / Math.abs(p);
  if (delta <= tolerancePct) return 'on_target';
  if (delta <= tolerancePct * 2) return 'warning';
  return 'critical';
}

function severityLabel(severity) {
  if (severity === 'critical') return 'Critical';
  if (severity === 'warning') return 'Warning';
  if (severity === 'on_target') return 'On Target';
  if (severity === 'normal') return 'Normal';
  return '—';
}

function tagClass(severity) {
  if (severity === 'critical') return 'p303-tag p303-tag--critical';
  if (severity === 'warning') return 'p303-tag p303-tag--warning';
  if (severity === 'on_target') return 'p303-tag p303-tag--target';
  if (severity === 'normal') return 'p303-tag p303-tag--normal';
  return 'p303-tag p303-tag--neutral';
}

function alertTitleForField(field) {
  const map = {
    tmp: 'High TMP',
    conductivity: 'Conductivity Out of Range',
    dialysate_temp: 'Dialysate Temperature Out of Range',
    arterial_pressure: 'Arterial Pressure Out of Range',
    venous_pressure: 'Venous Pressure Out of Range',
  };
  return map[field] || field;
}

function readingToParams(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    bfr: row.bfr != null ? String(row.bfr) : '',
    dfr: row.dfr != null ? String(row.dfr) : '',
    ap: row.arterial_pressure != null ? String(row.arterial_pressure) : (row.ap != null ? String(row.ap) : ''),
    vp: row.venous_pressure != null ? String(row.venous_pressure) : (row.vp != null ? String(row.vp) : ''),
    tmp: row.tmp != null ? String(row.tmp) : '',
    ufr: row.ufr != null ? String(row.ufr) : '',
    uf_removed: row.uf_removed != null ? String(row.uf_removed) : '',
    blood_volume_processed: row.blood_volume_processed != null ? String(row.blood_volume_processed) : '',
    conductivity: row.conductivity != null ? String(row.conductivity) : '',
    dialysate_temperature: row.dialysate_temp != null
      ? String(row.dialysate_temp)
      : (row.dialysate_temperature != null ? String(row.dialysate_temperature) : ''),
    heparin_rate: row.heparin_infusion_rate != null
      ? String(row.heparin_infusion_rate)
      : (row.heparin_rate != null ? String(row.heparin_rate) : ''),
    blood_leak: 'No Leak Detected',
  };
}

function statusRowToChecks(row) {
  if (!row) return { ...INITIAL_CHECKS };
  return {
    powerSupply: Boolean(Number(row.power_supply_ok)),
    dialysateSystem: Boolean(Number(row.dialysate_system_ok)),
    heparinSystem: Boolean(Number(row.heparin_system_ok)),
    airDetector: Boolean(Number(row.air_detector_ok)),
    bloodLeakDetector: Boolean(Number(row.blood_leak_detector_ok)),
  };
}

function sessionStats(readings, key) {
  const values = (readings || [])
    .map((r) => {
      if (key === 'ap') return toNullableNumber(r.arterial_pressure ?? r.ap);
      if (key === 'vp') return toNullableNumber(r.venous_pressure ?? r.vp);
      if (key === 'dialysate_temperature') return toNullableNumber(r.dialysate_temp ?? r.dialysate_temperature);
      if (key === 'heparin_rate') return toNullableNumber(r.heparin_infusion_rate ?? r.heparin_rate);
      return toNullableNumber(r[key]);
    })
    .filter((v) => v !== null);
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { min, max, avg, count: values.length };
}

function GaugeSlider({ min, max, safeMin, safeMax, value, isWarning, isCritical }) {
  const valNum = toNullableNumber(value);
  if (valNum === null || max === min) {
    return (
      <div className="p303-gauge-wrap">
        <div className="p303-gauge-track" />
        <div className="p303-gauge-ticks">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
  const percentage = Math.min(100, Math.max(0, ((valNum - min) / (max - min)) * 100));
  const safeMinPct = ((safeMin - min) / (max - min)) * 100;
  const safeMaxPct = ((safeMax - min) / (max - min)) * 100;
  let barColor = '#2563eb';
  if (isCritical) barColor = '#ef4444';
  else if (isWarning) barColor = '#f59e0b';

  return (
    <div className="p303-gauge-wrap">
      <div className="p303-gauge-track">
        <div
          className="p303-gauge-safe-zone"
          style={{ left: `${safeMinPct}%`, width: `${safeMaxPct - safeMinPct}%` }}
        />
        <div className="p303-gauge-fill" style={{ width: `${percentage}%`, backgroundColor: barColor }} />
        <div className="p303-gauge-pin" style={{ left: `${percentage}%`, backgroundColor: barColor }} />
      </div>
      <div className="p303-gauge-ticks">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function TrendChart({ readings }) {
  const points = useMemo(() => {
    const rows = [...(readings || [])]
      .map((r) => ({
        t: new Date(r.reading_time || r.recorded_at || r.created_at),
        bfr: toNullableNumber(r.bfr),
        ap: toNullableNumber(r.arterial_pressure ?? r.ap),
        vp: toNullableNumber(r.venous_pressure ?? r.vp),
        tmp: toNullableNumber(r.tmp),
      }))
      .filter((r) => !Number.isNaN(r.t.getTime()))
      .sort((a, b) => a.t - b.t);
    return rows.slice(-12);
  }, [readings]);

  if (!points.length) {
    return (
      <div className="p303-chart-wrapper" style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        No machine readings in this range yet.
      </div>
    );
  }

  const yMin = -300;
  const yMax = 600;
  const mapY = (v) => {
    if (v === null) return null;
    return 150 - ((v - yMin) / (yMax - yMin)) * 120;
  };
  const xs = points.map((_, i) => (points.length === 1 ? 300 : 60 + (i * 480) / (points.length - 1)));

  const buildLine = (key, color) => {
    const pairs = points
      .map((p, i) => {
        const y = mapY(p[key]);
        return y === null ? null : `${xs[i]},${y}`;
      })
      .filter(Boolean);
    if (!pairs.length) return null;
    return (
      <g key={key}>
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={pairs.join(' ')} />
        {points.map((p, i) => {
          const y = mapY(p[key]);
          if (y === null) return null;
          return <circle key={`${key}-${i}`} cx={xs[i]} cy={y} r="3.5" fill={color} />;
        })}
      </g>
    );
  };

  return (
    <div className="p303-chart-wrapper">
      <div className="p303-chart-legend">
        <span className="p303-legend-item"><span className="p303-legend-dot dot-bfr" /> BFR (mL/min)</span>
        <span className="p303-legend-item"><span className="p303-legend-dot dot-ap" /> AP (mmHg)</span>
        <span className="p303-legend-item"><span className="p303-legend-dot dot-vp" /> VP (mmHg)</span>
        <span className="p303-legend-item"><span className="p303-legend-dot dot-tmp" /> TMP (mmHg)</span>
      </div>
      <svg viewBox="0 0 600 180" width="100%" height="180" className="p303-svg-chart">
        <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="40" y1="110" x2="580" y2="110" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3,3" />
        <line x1="40" y1="150" x2="580" y2="150" stroke="#f1f5f9" strokeWidth="1" />
        <text x="30" y="34" textAnchor="end" fontSize="10" fill="#94a3b8">600</text>
        <text x="30" y="74" textAnchor="end" fontSize="10" fill="#94a3b8">300</text>
        <text x="30" y="114" textAnchor="end" fontSize="10" fill="#94a3b8">0</text>
        <text x="30" y="154" textAnchor="end" fontSize="10" fill="#94a3b8">-300</text>
        {buildLine('bfr', '#2563eb')}
        {buildLine('ap', '#ef4444')}
        {buildLine('vp', '#0d9488')}
        {buildLine('tmp', '#8b5cf6')}
        {points.map((p, i) => (
          <text key={`x-${i}`} x={xs[i]} y="172" textAnchor="middle" fontSize="10" fill="#64748b">
            {p.t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function P303MachineParameters({
  sessionId = 'demo',
  session = {},
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeframe, setTimeframe] = useState('2h');
  const [notes, setNotes] = useState('');
  const [params, setParams] = useState(INITIAL_PARAMETERS);
  const [systemChecks, setSystemChecks] = useState(INITIAL_CHECKS);
  const [readings, setReadings] = useState([]);
  const [progress, setProgress] = useState(null);
  const [settings, setSettings] = useState(null);
  const [serverFlags, setServerFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const activeSessionId = useMemo(() => {
    const s = String(
      sessionId
      || localStorage.getItem('lastDialysisSessionId')
      || sessionStorage.getItem('lastDialysisSessionId')
      || '',
    ).trim();
    if (!s || s === 'preview' || s === 'demo') return null;
    return s;
  }, [sessionId]);

  const loadReadings = useCallback(async (range = timeframe) => {
    if (!activeSessionId) return;
    setLoading(true);
    const res = await getMachineParameters(activeSessionId, range);
    setLoading(false);
    if (!res?.success) return;
    const data = res.data?.data || res.data || {};
    const list = Array.isArray(data) ? data : (data.readings || []);
    setReadings(Array.isArray(list) ? list : []);
    setProgress(data.progress || null);
    setSettings(data.settings || data.progress?.settings || null);
    setServerFlags(Array.isArray(data.latest_flags) ? data.latest_flags : []);
    if (data.latest_status) {
      setSystemChecks(statusRowToChecks(data.latest_status));
    }
    const latest = list[0];
    const mapped = readingToParams(latest);
    if (mapped) {
      setParams((prev) => ({
        ...prev,
        ...mapped,
        blood_leak: data.latest_status && !Number(data.latest_status.blood_leak_detector_ok)
          ? 'Leak Detected'
          : 'No Leak Detected',
      }));
      const ts = latest.reading_time || latest.recorded_at;
      if (ts) {
        const d = new Date(ts);
        if (!Number.isNaN(d.getTime())) {
          setLastUpdated(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    }
  }, [activeSessionId, timeframe]);

  useEffect(() => {
    loadReadings(timeframe);
  }, [loadReadings, timeframe]);

  const p = patient.patient || patient;
  const patientName = p.name || p.patient_name || (p.id ? `Patient #${p.id}` : MISSING);
  const pid = p.patient_code || p.patientCode || p.pid || p.patient_id || (p.id ? `P${p.id}` : MISSING);
  const rawGender = p.gender || p.sex;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || MISSING);
  const ageVal = p.age ? String(p.age) : MISSING;
  const ageGender = ageVal !== MISSING && gender !== MISSING
    ? `${ageVal} Years, ${gender}`
    : (ageVal !== MISSING ? `${ageVal} Years` : gender);
  const bloodGroup = p.bloodGroup || p.blood_group || MISSING;
  const shiftStr = session.shift || session.shift_name || MISSING;
  const bedStr = session.bed || session.bed_number || patient.bed || MISSING;
  const machineLabel = session.machine || session.machine_model || session.machine_name
    || patient.machine || settings?.machine_model || MISSING;

  const prescribedBfr = session.prescribed_bfr
    ?? session.prescribedBFR
    ?? settings?.bfr_ml_min
    ?? progress?.settings?.bfr_ml_min
    ?? null;
  const prescribedDfr = session.prescribed_dfr
    ?? session.prescribedDFR
    ?? settings?.dfr_ml_min
    ?? progress?.settings?.dfr_ml_min
    ?? null;
  const ufGoalL = (() => {
    const raw = session.uf_goal
      ?? session.ufGoal
      ?? progress?.uf?.target
      ?? settings?.uf_goal_l
      ?? null;
    const n = toNullableNumber(raw);
    if (n === null) return null;
    return n > 50 ? n / 1000 : n;
  })();
  const ufRemovedDisplay = toNullableNumber(params.uf_removed)
    ?? toNullableNumber(progress?.uf?.removed)
    ?? null;
  const ufPct = ufGoalL && ufRemovedDisplay != null
    ? Math.round((ufRemovedDisplay / ufGoalL) * 100)
    : null;
  const ufRemaining = ufGoalL != null && ufRemovedDisplay != null
    ? Math.max(0, ufGoalL - ufRemovedDisplay)
    : null;
  const bloodProcessedDisplay = toNullableNumber(params.blood_volume_processed)
    ?? toNullableNumber(progress?.blood_processed)
    ?? null;
  const expectedBlood = (() => {
    const bfr = toNullableNumber(prescribedBfr);
    const mins = toNullableNumber(
      session.prescribed_duration_minutes
      || session.duration_minutes
      || settings?.duration_minutes,
    );
    if (bfr === null || mins === null) return null;
    return (bfr * mins) / 1000;
  })();
  const bloodPct = expectedBlood && bloodProcessedDisplay != null
    ? Math.round((bloodProcessedDisplay / expectedBlood) * 100)
    : null;

  const elapsedLabel = (() => {
    const started = session.started_at || session.created_at;
    if (!started) return MISSING;
    const start = new Date(started);
    if (Number.isNaN(start.getTime())) return MISSING;
    const mins = Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} Elapsed`;
  })();

  const severities = useMemo(() => ({
    bfr: classifyVsPrescribed(params.bfr, prescribedBfr),
    dfr: classifyVsPrescribed(params.dfr, prescribedDfr),
    ap: classifyArterialPressure(params.ap),
    vp: classifyVenousPressure(params.vp),
    tmp: classifyTmp(params.tmp),
    ufr: classifyVsPrescribed(params.ufr, settings?.ufr_ml_hr ?? 500),
    conductivity: classifyConductivity(params.conductivity),
    dialysate_temperature: classifyDialysateTemp(params.dialysate_temperature),
  }), [params, prescribedBfr, prescribedDfr, settings]);

  const liveFlags = useMemo(() => {
    const flags = [];
    const pairs = [
      ['tmp', severities.tmp, params.tmp],
      ['conductivity', severities.conductivity, params.conductivity],
      ['dialysate_temp', severities.dialysate_temperature, params.dialysate_temperature],
      ['arterial_pressure', severities.ap, params.ap],
      ['venous_pressure', severities.vp, params.vp],
    ];
    for (const [field, severity, value] of pairs) {
      if (severity === 'critical' || severity === 'warning') {
        flags.push({ field, severity, value });
      }
    }
    return flags;
  }, [severities, params]);

  const activeAlerts = liveFlags.length ? liveFlags : serverFlags;
  const failedChecks = Object.entries(systemChecks).filter(([, ok]) => !ok);
  const criticalFlags = activeAlerts.filter((f) => f.severity === 'critical');
  const warningFlags = activeAlerts.filter((f) => f.severity === 'warning');
  const hasCriticalFailure = criticalFlags.length > 0 || failedChecks.length > 0;
  const hasFailure = hasCriticalFailure || warningFlags.length > 0;
  const bannerClass = hasCriticalFailure
    ? 'p303-status-banner--critical'
    : (warningFlags.length ? 'p303-status-banner--warning' : 'p303-status-banner--ok');

  const updateParam = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheck = (key) => {
    setSystemChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'bloodLeakDetector') {
        setParams((p0) => ({
          ...p0,
          blood_leak: next.bloodLeakDetector ? 'No Leak Detected' : 'Leak Detected',
        }));
      }
      return next;
    });
  };

  const buildPayload = () => ({
    bfr: toNullableNumber(params.bfr),
    dfr: toNullableNumber(params.dfr),
    arterial_pressure: toNullableNumber(params.ap),
    venous_pressure: toNullableNumber(params.vp),
    tmp: toNullableNumber(params.tmp),
    ufr: toNullableNumber(params.ufr),
    uf_removed: toNullableNumber(params.uf_removed),
    blood_volume_processed: toNullableNumber(params.blood_volume_processed),
    conductivity: toNullableNumber(params.conductivity),
    dialysate_temperature: toNullableNumber(params.dialysate_temperature),
    heparin_rate: toNullableNumber(params.heparin_rate),
    notes: notes || null,
    recorded_at: new Date().toISOString(),
    machine_status: {
      powerSupply: systemChecks.powerSupply,
      dialysateSystem: systemChecks.dialysateSystem,
      heparinSystem: systemChecks.heparinSystem,
      airDetector: systemChecks.airDetector,
      bloodLeakDetector: systemChecks.bloodLeakDetector
        && String(params.blood_leak || '').toLowerCase().includes('no leak'),
    },
  });

  const executeSave = async () => {
    setSaveError('');
    if (!activeSessionId) {
      return true;
    }
    setSaving(true);
    const res = await createMachineParameters(activeSessionId, buildPayload());
    setSaving(false);
    if (!res.success) {
      setSaveError(res.data?.message || res.message || 'Failed to save machine parameters.');
      return false;
    }
    await loadReadings(timeframe);
    return true;
  };

  const handleSaveReturn = async () => {
    const ok = await executeSave();
    if (ok && onSave) onSave();
  };

  const handleSaveDraft = async () => {
    const ok = await executeSave();
    if (ok && onSaveDraft) onSaveDraft();
  };

  const apStats = sessionStats(readings, 'ap');
  const vpStats = sessionStats(readings, 'vp');
  const tmpStats = sessionStats(readings, 'tmp');

  const ParamCard = ({
    title,
    icon,
    unit,
    field,
    severity,
    gauge,
    sub,
    type = 'number',
    step,
  }) => {
    const sev = severity || null;
    const isCritical = sev === 'critical';
    const isWarning = sev === 'warning';
    return (
      <div className={`p303-card ${isCritical ? 'p303-card--critical' : ''}`}>
        <div className="p303-card-header">
          <span className="p303-card-title">
            {icon}
            {title}
          </span>
          <span className={tagClass(sev)}>{severityLabel(sev)}</span>
        </div>
        <div className="p303-card-body">
          <div className={`p303-card-value ${isCritical ? 'text-red-600' : ''}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Input
              type={type}
              step={step}
              value={params[field]}
              onChange={(e) => updateParam(field, e.target.value)}
              style={{ width: 110, fontSize: 22, fontWeight: 700 }}
              aria-label={title}
            />
            {unit ? <small>{unit}</small> : null}
          </div>
          {gauge}
          {sub ? <span className="p303-card-sub">{sub}</span> : null}
        </div>
      </div>
    );
  };

  return (
    <div className="p303-container">
      <div className="p303-patient-banner" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 16,
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        background: '#fff',
      }}>
        <div><div className="p303-rail-label">Patient</div><strong>{patientName}</strong></div>
        <div><div className="p303-rail-label">PID</div><strong>{pid}</strong></div>
        <div><div className="p303-rail-label">Prescribed BFR</div><strong>{prescribedBfr != null ? `${prescribedBfr} mL/min` : MISSING}</strong></div>
        <div><div className="p303-rail-label">Prescribed DFR</div><strong>{prescribedDfr != null ? `${prescribedDfr} mL/min` : MISSING}</strong></div>
        <div><div className="p303-rail-label">UF Goal</div><strong>{ufGoalL != null ? `${ufGoalL.toFixed(2)} L` : MISSING}</strong></div>
        <div><div className="p303-rail-label">Session Time</div><strong>{elapsedLabel}</strong></div>
      </div>

      <div className="p303-layout-grid">
        <div className="p303-main-content">
          <div className="p303-tab-bar">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                className={`p303-tab-btn ${activeTab === tab ? 'p303-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Overview' ? 'Overview *' : tab}
              </button>
            ))}
          </div>

          <div className={`p303-status-banner ${bannerClass}`}>
            <div className="p303-status-message">
              {hasFailure ? (
                <>
                  <WarningAmberOutlinedIcon sx={{ color: hasCriticalFailure ? '#dc2626' : '#d97706', fontSize: 20 }} />
                  <span>
                    <strong>Machine Status: Running</strong>
                    {' — '}
                    {criticalFlags.length
                      ? `${criticalFlags.length} parameter${criticalFlags.length > 1 ? 's' : ''} Critical (${criticalFlags.map((f) => `${f.field} ${f.value}`).join(', ')}).`
                      : failedChecks.length
                        ? `${failedChecks.length} system check${failedChecks.length > 1 ? 's' : ''} failed.`
                        : 'Parameter(s) outside safe range.'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  <span>
                    <strong>Machine Status: Running</strong> — All parameters are within acceptable range.
                  </span>
                </>
              )}
            </div>
            <div className="p303-status-actions">
              <span>Last Updated: {lastUpdated || MISSING}</span>
              <button
                type="button"
                className="p303-refresh-btn"
                onClick={() => loadReadings(timeframe)}
                title="Refresh readings"
                disabled={loading}
              >
                <RefreshIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

          {activeTab === 'Overview' && (
            <div className="p303-cards-grid">
              <ParamCard
                title="Blood Flow Rate (BFR)"
                icon={<WaterDropOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />}
                unit="mL/min"
                field="bfr"
                severity={severities.bfr}
                gauge={<GaugeSlider min={0} max={500} safeMin={250} safeMax={400} value={params.bfr} isWarning={severities.bfr === 'warning'} isCritical={severities.bfr === 'critical'} />}
                sub={`Prescribed: ${prescribedBfr != null ? `${prescribedBfr} mL/min` : MISSING}`}
              />
              <ParamCard
                title="Dialysate Flow Rate (DFR)"
                icon={<WavesOutlinedIcon sx={{ color: '#0284c7', fontSize: 18 }} />}
                unit="mL/min"
                field="dfr"
                severity={severities.dfr}
                gauge={<GaugeSlider min={0} max={1000} safeMin={400} safeMax={800} value={params.dfr} isWarning={severities.dfr === 'warning'} isCritical={severities.dfr === 'critical'} />}
                sub={`Prescribed: ${prescribedDfr != null ? `${prescribedDfr} mL/min` : MISSING}`}
              />
              <ParamCard
                title="Arterial Pressure (AP)"
                icon={<MonitorHeartOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />}
                unit="mmHg"
                field="ap"
                severity={severities.ap}
                gauge={<GaugeSlider min={-300} max={300} safeMin={-250} safeMax={250} value={params.ap} isWarning={severities.ap === 'warning'} isCritical={severities.ap === 'critical'} />}
                sub="Safe Range: -250 to +250 mmHg"
              />
              <ParamCard
                title="Venous Pressure (VP)"
                icon={<CompressOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />}
                unit="mmHg"
                field="vp"
                severity={severities.vp}
                gauge={<GaugeSlider min={-100} max={500} safeMin={-100} safeMax={500} value={params.vp} isWarning={severities.vp === 'warning'} isCritical={severities.vp === 'critical'} />}
                sub="Safe Range: -100 to +500 mmHg"
              />
              <ParamCard
                title="Transmembrane Pressure (TMP)"
                icon={<SpeedOutlinedIcon sx={{ color: severities.tmp === 'critical' ? '#dc2626' : '#d97706', fontSize: 18 }} />}
                unit="mmHg"
                field="tmp"
                severity={severities.tmp}
                gauge={<GaugeSlider min={0} max={800} safeMin={20} safeMax={300} value={params.tmp} isWarning={severities.tmp === 'warning'} isCritical={severities.tmp === 'critical'} />}
                sub="Safe Range: 20 – 300 mmHg (Normal 20–60)"
              />
              <ParamCard
                title="Ultrafiltration Rate (UFR)"
                icon={<WaterDropOutlinedIcon sx={{ color: '#0284c7', fontSize: 18 }} />}
                unit="mL/hr"
                field="ufr"
                severity={severities.ufr}
                gauge={<GaugeSlider min={0} max={1000} safeMin={300} safeMax={800} value={params.ufr} isWarning={severities.ufr === 'warning'} isCritical={severities.ufr === 'critical'} />}
                sub={`Prescribed: ${settings?.ufr_ml_hr != null ? `${settings.ufr_ml_hr} mL/hr` : MISSING}`}
              />

              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <ScienceOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    UF Removed (Cumulative)
                  </span>
                  <span className={tagClass(null)}>
                    {ufPct != null ? `${ufPct}% of Goal` : MISSING}
                  </span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <Input
                      type="number"
                      step="0.01"
                      value={params.uf_removed}
                      onChange={(e) => updateParam('uf_removed', e.target.value)}
                      style={{ width: 110, fontSize: 22, fontWeight: 700 }}
                      aria-label="UF Removed"
                    />
                    <small>L</small>
                  </div>
                  <GaugeSlider min={0} max={Math.max(4, ufGoalL || 4)} safeMin={0} safeMax={ufGoalL || 2.4} value={params.uf_removed || ufRemovedDisplay} />
                  <span className="p303-card-sub">
                    Goal: {ufGoalL != null ? `${ufGoalL.toFixed(2)} L` : MISSING}
                    {' | '}
                    Remaining: {ufRemaining != null ? `${ufRemaining.toFixed(2)} L` : MISSING}
                  </span>
                </div>
              </div>

              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <WaterDropOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                    Blood Volume Processed
                  </span>
                  <span className="p303-tag p303-tag--neutral">
                    {bloodPct != null ? `${bloodPct}% Completed` : MISSING}
                  </span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <Input
                      type="number"
                      step="0.1"
                      value={params.blood_volume_processed}
                      onChange={(e) => updateParam('blood_volume_processed', e.target.value)}
                      style={{ width: 110, fontSize: 22, fontWeight: 700 }}
                      aria-label="Blood Volume Processed"
                    />
                    <small>L</small>
                  </div>
                  <GaugeSlider min={0} max={Math.max(64, expectedBlood || 64)} safeMin={0} safeMax={expectedBlood || 64} value={params.blood_volume_processed || bloodProcessedDisplay} />
                  <span className="p303-card-sub">
                    Expected: {expectedBlood != null ? `~ ${expectedBlood.toFixed(1)} L` : MISSING}
                  </span>
                </div>
              </div>

              <ParamCard
                title="Dialysate Conductivity"
                icon={<ScienceOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />}
                unit="mS/cm"
                field="conductivity"
                severity={severities.conductivity}
                step="0.1"
                gauge={null}
                sub="Safe Range: 13.5 – 15.5 mS/cm"
              />
              <ParamCard
                title="Dialysate Temperature"
                icon={<DeviceThermostatOutlinedIcon sx={{ color: '#ea580c', fontSize: 18 }} />}
                unit="°C"
                field="dialysate_temperature"
                severity={severities.dialysate_temperature}
                step="0.1"
                gauge={null}
                sub="Safe Range: 35.0 – 37.0 °C"
              />
              <ParamCard
                title="Heparin Pump (if applicable)"
                icon={<VaccinesOutlinedIcon sx={{ color: '#059669', fontSize: 18 }} />}
                unit="mL/hr"
                field="heparin_rate"
                severity={params.heparin_rate !== '' ? 'on_target' : null}
                step="0.1"
                gauge={null}
                sub="Optional when heparin not in use"
              />

              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <ShieldOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    Blood Leak Detector
                  </span>
                  <span className={systemChecks.bloodLeakDetector ? 'p303-tag p303-tag--target' : 'p303-tag p303-tag--critical'}>
                    {systemChecks.bloodLeakDetector ? 'OK' : 'Fail'}
                  </span>
                </div>
                <div className="p303-card-body">
                  <Select
                    value={params.blood_leak}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateParam('blood_leak', v);
                      setSystemChecks((prev) => ({
                        ...prev,
                        bloodLeakDetector: String(v).toLowerCase().includes('no leak'),
                      }));
                    }}
                  >
                    <option value="No Leak Detected">No Leak Detected</option>
                    <option value="Leak Detected">Leak Detected</option>
                  </Select>
                  <span className="p303-card-sub">
                    Status: {systemChecks.bloodLeakDetector ? 'OK' : 'Not OK'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="p303-category-tab-content">
              <Card variant="outline" className="post-panel">
                <CardBody>
                  <h2 className="p303-tab-title">{activeTab}</h2>
                  {activeTab === 'Pressures' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Arterial Pressure (AP)</h3>
                        <p className="p303-cat-val">{formatDisplay(params.ap)} mmHg</p>
                        <p className="p303-cat-sub">
                          {apStats
                            ? `Min: ${apStats.min} | Max: ${apStats.max} | Avg: ${apStats.avg.toFixed(1)} mmHg`
                            : 'No session readings yet'}
                        </p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Venous Pressure (VP)</h3>
                        <p className="p303-cat-val">{formatDisplay(params.vp)} mmHg</p>
                        <p className="p303-cat-sub">
                          {vpStats
                            ? `Min: ${vpStats.min} | Max: ${vpStats.max} | Avg: ${vpStats.avg.toFixed(1)} mmHg`
                            : 'No session readings yet'}
                        </p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Transmembrane Pressure (TMP)</h3>
                        <p className={`p303-cat-val ${severities.tmp === 'critical' ? 'text-red-600' : ''}`}>
                          {formatDisplay(params.tmp)} mmHg
                          {severities.tmp ? ` (${severityLabel(severities.tmp)})` : ''}
                        </p>
                        <p className="p303-cat-sub">
                          {tmpStats
                            ? `Min: ${tmpStats.min} | Max: ${tmpStats.max} | Avg: ${tmpStats.avg.toFixed(1)} mmHg`
                            : 'Safe limit: 300 mmHg ceiling'}
                        </p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Access Pressure</h3>
                        <p className="p303-cat-val">{NOT_AVAILABLE}</p>
                        <p className="p303-cat-sub">Inferred addition — not supported on this machine feed</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Flows' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Blood Flow Rate (BFR)</h3>
                        <p className="p303-cat-val">{formatDisplay(params.bfr)} mL/min</p>
                        <p className="p303-cat-sub">Prescribed: {prescribedBfr != null ? `${prescribedBfr} mL/min` : MISSING}</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Dialysate Flow Rate (DFR)</h3>
                        <p className="p303-cat-val">{formatDisplay(params.dfr)} mL/min</p>
                        <p className="p303-cat-sub">Prescribed: {prescribedDfr != null ? `${prescribedDfr} mL/min` : MISSING}</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Access Recirculation %</h3>
                        <p className="p303-cat-val">{NOT_AVAILABLE}</p>
                        <p className="p303-cat-sub">Inferred addition — mark unavailable when unsupported</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Dialysate' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Dialysate Conductivity</h3>
                        <p className="p303-cat-val">{formatDisplay(params.conductivity, 1)} mS/cm</p>
                        <p className="p303-cat-sub">Safe Range: 13.5 – 15.5 mS/cm</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Dialysate Temperature</h3>
                        <p className="p303-cat-val">{formatDisplay(params.dialysate_temperature, 1)} °C</p>
                        <p className="p303-cat-sub">Safe Range: 35.0 – 37.0 °C</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Sodium / Bicarbonate Conc.</h3>
                        <p className="p303-cat-val">{NOT_AVAILABLE}</p>
                        <p className="p303-cat-sub">Inferred addition — unavailable on this machine feed</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Ultrafiltration' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>UF Rate (UFR)</h3>
                        <p className="p303-cat-val">{formatDisplay(params.ufr)} mL/hr</p>
                        <p className="p303-cat-sub">Prescribed: {settings?.ufr_ml_hr != null ? `${settings.ufr_ml_hr} mL/hr` : MISSING}</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>UF Removed (Cumulative)</h3>
                        <p className="p303-cat-val">{formatDisplay(params.uf_removed || ufRemovedDisplay, 2)} L</p>
                        <p className="p303-cat-sub">
                          Goal: {ufGoalL != null ? `${ufGoalL.toFixed(2)} L` : MISSING}
                          {ufPct != null ? ` (${ufPct}% Achieved)` : ''}
                        </p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>UF Remaining / Projection</h3>
                        <p className="p303-cat-val">
                          {ufRemaining != null ? `${ufRemaining.toFixed(2)} L` : NOT_AVAILABLE}
                        </p>
                        <p className="p303-cat-sub">
                          {(() => {
                            const ufr = toNullableNumber(params.ufr);
                            if (ufRemaining == null || !ufr || ufr <= 0) return 'Projected time requires UFR and remaining UF';
                            const hours = ufRemaining / (ufr / 1000);
                            const h = Math.floor(hours);
                            const m = Math.round((hours - h) * 60);
                            return `Est. completion: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} hr remaining`;
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Advanced Parameters' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Heparin Infusion Rate</h3>
                        <p className="p303-cat-val">{formatDisplay(params.heparin_rate, 1)} mL/hr</p>
                        <p className="p303-cat-sub">Current reading from Overview</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Blood Leak Sensor</h3>
                        <p className="p303-cat-val">{params.blood_leak || MISSING}</p>
                        <p className="p303-cat-sub">
                          Status: {systemChecks.bloodLeakDetector ? 'OK' : 'Not OK'}
                        </p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Online Clearance (Kt/V Real-Time)</h3>
                        <p className="p303-cat-val">{NOT_AVAILABLE}</p>
                        <p className="p303-cat-sub">Inferred addition — unavailable when machine unsupported</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          <div className="p303-bottom-grid">
            <Card variant="outline" className="post-panel p303-trend-card">
              <CardBody>
                <div className="p303-trend-header">
                  <h3>Parameter Trend</h3>
                  <div className="p303-trend-controls">
                    <Select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      style={{ width: 140 }}
                    >
                      <option value="2h">Last 2 Hours</option>
                      <option value="4h">Last 4 Hours</option>
                      <option value="all">Full Session</option>
                    </Select>
                  </div>
                </div>
                <TrendChart readings={readings} />
              </CardBody>
            </Card>

            <Card variant="outline" className="post-panel p303-notes-card">
              <CardBody>
                <div className="p303-notes-header">
                  <h3>Notes / Comments</h3>
                  <span className="p303-char-count">{notes.length} / 300</span>
                </div>
                <Textarea
                  maxLength={300}
                  placeholder="Enter any observations about machine performance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: 130 }}
                />
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="p303-right-rail">
          <Card variant="outline" className="post-panel p303-rail-card">
            <CardBody>
              <div className="p303-rail-title">
                <LocalHospitalOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h3>Patient Summary</h3>
              </div>
              <div className="p303-rail-patient-head">
                <div className="p303-rail-avatar">
                  <span>{patientName.charAt(0)}</span>
                </div>
                <div>
                  <strong className="p303-rail-pname">{patientName}</strong>
                  <span className="p303-status-active-sm">Active Patient</span>
                </div>
              </div>
              <div className="p303-rail-list">
                <div className="p303-rail-item">
                  <span className="p303-rail-label">PID</span>
                  <strong className="p303-rail-val">{pid}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Age &amp; Gender</span>
                  <strong className="p303-rail-val">{ageGender}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Blood Group</span>
                  <strong className="p303-rail-val">{bloodGroup}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Shift / Time</span>
                  <strong className="p303-rail-val">{dash(shiftStr)}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Machine / Bed</span>
                  <strong className="p303-rail-val">{`${dash(machineLabel)} / ${dash(bedStr)}`}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card variant="outline" className="post-panel p303-rail-card">
            <CardBody>
              <div className="p303-rail-title">
                <ShieldOutlinedIcon sx={{ color: '#059669', fontSize: 18 }} />
                <h3>Machine Status</h3>
                <span className={failedChecks.length ? 'p303-tag p303-tag--critical' : 'p303-status-tag-green'}>
                  {failedChecks.length ? 'Attention' : 'Running'}
                </span>
              </div>
              <div className="p303-system-checks-list">
                <div className={`p303-check-item p303-check-item--main ${failedChecks.length ? '' : ''}`}>
                  {failedChecks.length ? (
                    <ErrorOutlineIcon sx={{ color: '#dc2626', fontSize: 16 }} />
                  ) : (
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  )}
                  <span>{failedChecks.length ? 'System check(s) failed' : 'All systems normal'}</span>
                </div>
                {[
                  ['powerSupply', 'Power Supply'],
                  ['dialysateSystem', 'Dialysate System'],
                  ['heparinSystem', 'Heparin System'],
                  ['airDetector', 'Air Detector'],
                  ['bloodLeakDetector', 'Blood Leak Detector'],
                ].map(([key, label]) => (
                  <label key={key} className="p303-check-item" style={{ cursor: 'pointer' }}>
                    <Checkbox
                      isChecked={Boolean(systemChecks[key])}
                      onChange={() => toggleCheck(key)}
                    />
                    <span className="flex-1">{label}</span>
                    <strong className={systemChecks[key] ? 'p303-check-ok' : 'text-red-600'}>
                      {systemChecks[key] ? 'OK' : 'Not OK'}
                    </strong>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card variant="outline" className="post-panel p303-rail-card p303-alerts-card">
            <CardBody>
              <div className="p303-rail-title">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <h3>Active Alerts ({activeAlerts.length})</h3>
              </div>
              {!activeAlerts.length ? (
                <p style={{ color: '#64748b', margin: 0 }}>No active machine alerts</p>
              ) : (
                activeAlerts.map((alert, idx) => (
                  <div className="p303-alert-box" key={`${alert.field}-${idx}`} style={{ marginBottom: 8 }}>
                    <div className="p303-alert-top">
                      <span className="p303-alert-name">
                        <WarningAmberOutlinedIcon sx={{ fontSize: 15, color: alert.severity === 'critical' ? '#dc2626' : '#d97706' }} />
                        {' '}
                        {alertTitleForField(alert.field)}
                      </span>
                    </div>
                    <p className="p303-alert-desc">
                      {alert.field} is {dash(alert.value)}
                    </p>
                    <div className="p303-alert-footer">
                      <span className={alert.severity === 'critical' ? 'p303-alert-badge-critical' : 'p303-tag p303-tag--warning'}>
                        {severityLabel(alert.severity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card variant="outline" className="post-panel p303-rail-card">
            <CardBody>
              <div className="p303-rail-title">
                <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h3>Quick Reference</h3>
              </div>
              <div className="p303-rail-list">
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Recommended BFR</span>
                  <strong className="p303-rail-val">
                    {prescribedBfr != null ? `${prescribedBfr} mL/min` : '250–300 mL/min'}
                  </strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">UF Goal</span>
                  <strong className="p303-rail-val">{ufGoalL != null ? `${ufGoalL.toFixed(2)} L` : MISSING}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Recirculation Target</span>
                  <strong className="p303-rail-val">&lt; 10 %</strong>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="during-form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="button" variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saveError && <span style={{ color: '#ef4444', fontSize: '12px' }}>{saveError}</span>}
          <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={saving}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" isLoading={saving} onClick={handleSaveReturn} disabled={saving}>
            {saving ? 'Saving…' : 'Save & Return to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
}
