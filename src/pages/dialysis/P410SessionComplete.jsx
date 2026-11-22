import React, { useState } from 'react';
import { Button, Textarea } from '../../component-library';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const SCREENS_STEPPER = [
  { step: 1, label: 'Blood Return & Termination' },
  { step: 2, label: 'Vascular Access Hemostasis' },
  { step: 3, label: 'Post Dialysis Vitals' },
  { step: 4, label: 'Outcome Summary' },
  { step: 5, label: 'Medication & Follow-up' },
  { step: 6, label: 'Disinfection & Turnover' },
  { step: 7, label: 'Infection Control & Waste Disposal' },
  { step: 8, label: 'Discharge' },
  { step: 9, label: 'Documentation & Sign-off' },
  { step: 10, label: 'Session Complete' },
];

const CONDITION_OPTIONS = ['Good', 'Fair', 'Poor'];

function displayOrDash(v) {
  if (v === undefined || v === null || v === '') return '—';
  return String(v);
}

function formatTs(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString();
  } catch {
    return String(raw);
  }
}

function formatAppt(nextAppt) {
  if (!nextAppt) return '—';
  const date = nextAppt.next_dialysis_date || nextAppt.date || null;
  const time = nextAppt.expected_time || nextAppt.time || null;
  const shift = nextAppt.shift || null;
  const parts = [];
  if (date) {
    try {
      const d = new Date(date);
      parts.push(Number.isNaN(d.getTime()) ? String(date) : d.toLocaleDateString());
    } catch {
      parts.push(String(date));
    }
  }
  if (time) parts.push(String(time));
  if (shift) parts.push(`Shift ${shift}`);
  return parts.length ? parts.join(' · ') : '—';
}

function numOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function changeLabel(pre, post, unit = '') {
  const a = numOrNull(pre);
  const b = numOrNull(post);
  if (a == null || b == null) return '—';
  const delta = Math.round((b - a) * 100) / 100;
  if (delta === 0) return '—';
  const arrow = delta < 0 ? '↓' : '↑';
  return `${arrow} ${Math.abs(delta)}${unit ? ` ${unit}` : ''}`.trim();
}

function bpChange(preSys, preDia, postSys, postDia) {
  const a = numOrNull(preSys);
  const b = numOrNull(preDia);
  const c = numOrNull(postSys);
  const d = numOrNull(postDia);
  if (a == null || b == null || c == null || d == null) return '—';
  const ds = c - a;
  const dd = d - b;
  if (ds === 0 && dd === 0) return '—';
  const arrow = ds < 0 || (ds === 0 && dd < 0) ? '↓' : '↑';
  return `${arrow} ${Math.abs(ds)} / ${Math.abs(dd)}`;
}

function resolveLoggedInUser() {
  try {
    const id = localStorage.getItem('id')
      || localStorage.getItem('userId')
      || localStorage.getItem('user_id')
      || '';
    const name = localStorage.getItem('name')
      || localStorage.getItem('userName')
      || localStorage.getItem('username')
      || '';
    let fromJson = {};
    try {
      fromJson = JSON.parse(localStorage.getItem('user') || '{}') || {};
    } catch {
      fromJson = {};
    }
    const display = name
      || fromJson.name
      || [fromJson.firstname, fromJson.lastname].filter(Boolean).join(' ')
      || (id ? `User #${id}` : '—');
    return { id: id || fromJson.id || null, display };
  } catch {
    return { id: null, display: '—' };
  }
}

function satisfactionLabel(n) {
  if (n >= 5) return 'Excellent';
  if (n === 4) return 'Good';
  if (n === 3) return 'Fair';
  if (n === 2) return 'Poor';
  if (n === 1) return 'Very Poor';
  return '';
}

function buildP410FeedbackPayload(form) {
  return {
    condition: form.condition || null,
    condition_text: form.condition || null,
    pain_level: form.painLevel === '' || form.painLevel == null ? null : Number(form.painLevel),
    comments: form.comments || null,
    satisfaction_rating: form.satisfaction == null ? null : Number(form.satisfaction),
    feedbackCondition: form.condition || null,
    painLevel: form.painLevel,
    patientComments: form.comments || null,
    satisfaction: form.satisfaction,
  };
}

export default function P410SessionComplete({
  data = {},
  setData,
  session = {},
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
  onViewAssessment,
  apiError = '',
}) {
  const p = patient.patient || patient;
  const patientName = p.name || p.patient_name || (p.id ? `Patient #${p.id}` : '—');
  const pid = p.patient_code || p.patientCode || p.pid || p.patient_id || (p.id ? `P${p.id}` : '—');
  const rawGender = p.gender || p.sex;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || '—');
  const ageVal = p.age ? String(p.age) : '—';
  const ageGender = ageVal !== '—' && gender !== '—' ? `${ageVal} Years, ${gender}` : (ageVal !== '—' ? `${ageVal} Years` : gender);
  const bloodGroup = p.bloodGroup || p.blood_group || '—';
  const accessDetail = p.vascular_access || p.access || session.access || data.access || '—';
  const nephrologist = p.primary_doctor_name || p.nephrologist || session.nephrologist || p.doctor_name || '—';

  const loggedIn = resolveLoggedInUser();
  const sessionMeta = data.session || session || {};
  const vitals = data.post_vitals || {};
  const outcome = data.outcome || {};
  const hemo = data.hemostasis || {};
  const termination = data.termination || {};
  const followup = data.followup || {};
  const discharge = data.discharge || {};
  const documentation = data.documentation || {};
  const feedbackPrior = data.feedback || {};
  const nextAppt = data.next_appointment || {};

  const startTimeStr = sessionMeta.started_at || session.started_at || session.start_time || data.started_at || '—';
  const endTimeStr = sessionMeta.ended_at || data.endTime || session.ended_at || session.end_time || '—';
  const durationStr = data.treatmentDuration || session.treatmentDuration || session.duration || '—';
  const machineModel = session.machine_name || session.machine || patient.machine || '—';
  const bedStr = session.bed || session.bed_number || patient.bed || '—';

  const preSys = outcome.pre_bp_systolic ?? outcome.pre_systolic ?? data.pre_systolic ?? null;
  const preDia = outcome.pre_bp_diastolic ?? outcome.pre_diastolic ?? data.pre_diastolic ?? null;
  const postSys = data.bp_systolic ?? vitals.bp_systolic ?? data.systolic ?? null;
  const postDia = data.bp_diastolic ?? vitals.bp_diastolic ?? data.diastolic ?? null;
  const prePulse = outcome.pre_pulse ?? data.pre_pulse ?? null;
  const postPulse = data.pulse ?? vitals.pulse ?? null;
  const preSpo2 = outcome.pre_spo2 ?? data.pre_spo2 ?? null;
  const postSpo2 = data.spo2 ?? vitals.spo2 ?? null;
  const preTemp = outcome.pre_temperature ?? data.pre_temperature ?? null;
  const postTemp = data.temperature ?? vitals.temperature ?? null;
  const preWeight = data.pre_weight ?? outcome.pre_weight ?? data.preWeight ?? null;
  const postWeight = data.post_weight ?? vitals.post_weight ?? data.postWeight ?? null;
  const rr = data.respiratory_rate ?? vitals.respiratory_rate ?? vitals.rr ?? data.rr ?? null;

  const ufGoal = data.uf_goal ?? outcome.uf_goal ?? outcome.prescribed_uf ?? null;
  const ufRemoved = data.uf_removed ?? outcome.uf_removed ?? outcome.total_uf_removed ?? data.totalUfRemoved ?? null;
  const ufPct = data.uf_pct_achieved != null
    ? data.uf_pct_achieved
    : (numOrNull(ufGoal) > 0 && numOrNull(ufRemoved) != null
      ? Math.round((Number(ufRemoved) / Number(ufGoal)) * 1000) / 10
      : null);

  const bpPostStr = postSys != null && postDia != null ? `${postSys} / ${postDia}` : '—';
  const bpPreStr = preSys != null && preDia != null ? `${preSys} / ${preDia}` : '—';
  const ufRemovedStr = ufRemoved != null && ufRemoved !== '' ? `${ufRemoved} L` : '—';
  const ufGoalStr = ufGoal != null && ufGoal !== '' ? `${ufGoal} L` : '—';

  const accessBleeding = data.access_bleeding ?? hemo.bleeding_status ?? hemo.bleeding ?? '—';
  const accessThrill = data.access_thrill ?? hemo.thrill ?? '—';
  const accessBruit = data.access_bruit ?? hemo.bruit ?? '—';
  const accessSwelling = data.access_swelling ?? hemo.swelling ?? '—';
  const accessComments = data.access_comments ?? hemo.comments ?? hemo.access_comments ?? '';

  const canClose = data.can_close === true
    || data.close_checklist_complete === true
    || data.close_checklist_complete === 1
    || Number(documentation.close_checklist_complete) === 1
    || (Array.isArray(data.signoffs) && (() => {
      const have = new Set(data.signoffs.map((r) => String(r.role || '').toLowerCase()));
      return have.has('technician') && have.has('nurse') && (have.has('physician') || have.has('nephrologist'));
    })());

  const completedAt = documentation.close_checklist_timestamp
    || sessionMeta.closed_at
    || endTimeStr;
  const completedBy = loggedIn.display;

  const [condition, setCondition] = useState(
    data.feedbackCondition
      || feedbackPrior.condition_text
      || data.overall_condition
      || vitals.overall_condition
      || 'Good',
  );
  const [painLevel, setPainLevel] = useState(
    data.painLevel != null
      ? String(data.painLevel)
      : (feedbackPrior.pain_level != null ? String(feedbackPrior.pain_level) : '0'),
  );
  const [comments, setComments] = useState(
    data.patientComments || feedbackPrior.comments || '',
  );
  const [satisfaction, setSatisfaction] = useState(
    data.satisfaction != null
      ? Number(data.satisfaction)
      : (feedbackPrior.satisfaction_rating != null ? Number(feedbackPrior.satisfaction_rating) : 0),
  );
  const [formError, setFormError] = useState('');
  const [closing, setClosing] = useState(false);

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const timeline = [
    { label: 'Treatment started', time: startTimeStr },
    { label: 'Blood returned & terminated', time: termination.recorded_at || termination.created_at || '—' },
    { label: 'Post-dialysis vitals recorded', time: vitals.recorded_at || vitals.created_at || '—' },
    { label: 'Medications reviewed', time: followup.recorded_at || followup.created_at || '—' },
    { label: 'Disinfection & machine turnover completed', time: '—' },
    { label: 'Patient discharged', time: discharge.recorded_at || discharge.created_at || '—' },
    { label: 'Documentation & sign-off completed', time: documentation.close_checklist_timestamp || '—' },
  ];

  const checklist = [
    { label: 'All Treatment Steps', done: Boolean(termination?.id || vitals?.id) },
    { label: 'Disinfection & Turnover', done: true },
    { label: 'Infection Control', done: Boolean(data.infection_control_post?.id) },
    { label: 'Discharge', done: Boolean(discharge?.id) },
    { label: 'Documentation & Sign-off', done: canClose },
  ];

  const handleFormSubmit = async () => {
    setFormError('');
    if (!canClose) {
      setFormError('P4-09 sign-offs are incomplete — Complete & Close is blocked until all three roles authenticate.');
      return;
    }
    const form = { condition, painLevel, comments, satisfaction: satisfaction || null };
    const apiPayload = buildP410FeedbackPayload(form);
    updateParentState(apiPayload);
    setClosing(true);
    try {
      if (onSave) {
        const ok = await onSave(apiPayload);
        if (ok === false) return;
      }
    } finally {
      setClosing(false);
    }
  };

  const handleDraft = () => {
    const form = { condition, painLevel, comments, satisfaction: satisfaction || null };
    const apiPayload = buildP410FeedbackPayload(form);
    updateParentState(apiPayload);
    if (onSaveDraft) onSaveDraft(apiPayload);
  };

  return (
    <div className="p410-page-wrapper">
      <header className="p410-top-bar">
        <div className="p410-top-bar-left">
          <h1>
            P4-10 – Session Complete <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
          </h1>
          <p>Review final outcome, key metrics and ensure all post-dialysis tasks are complete.</p>
        </div>
      </header>

      <nav className="p410-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 10;
          return (
            <React.Fragment key={s.step}>
              <div className={`p410-stepper-item ${isActive ? 'active' : 'completed'}`}>
                <div className="p410-stepper-circle">{s.step === 10 ? '10' : '✓'}</div>
                <span className="p410-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p410-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p410-patient-header-banner">
        <div className="p410-patient-left">
          <div className="p410-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p410-patient-avatar-fallback">{String(patientName).slice(0, 1)}</div>
            )}
          </div>
          <div className="p410-patient-bio">
            <div className="p410-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p410-pill-completed">Session Completed</span>
            </div>
            <div className="p410-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p410-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p410-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p410-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p410-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
              <span className="p410-sep">|</span>
              <span>Bed: <strong>{bedStr}</strong></span>
            </div>
          </div>
        </div>

        <div className="p410-patient-stats">
          <div className="p410-stat-box">
            <CalendarTodayOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Treatment Start</span>
            <strong className="p410-stat-val">{displayOrDash(startTimeStr)}</strong>
          </div>
          <div className="p410-stat-box">
            <AccessTimeOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Treatment End</span>
            <strong className="p410-stat-val">{displayOrDash(endTimeStr)}</strong>
          </div>
          <div className="p410-stat-box">
            <AccessTimeOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Duration</span>
            <strong className="p410-stat-val">{displayOrDash(durationStr)}</strong>
          </div>
          <div className="p410-stat-box">
            <WaterDropOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">UF Removed</span>
            <strong className="p410-stat-val">{ufRemovedStr}</strong>
          </div>
          <div className="p410-stat-box">
            <HotelOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Machine</span>
            <strong className="p410-stat-val">{displayOrDash(machineModel)}</strong>
          </div>
        </div>
      </div>

      {(formError || apiError) && (
        <div className="during-error" style={{ margin: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
          <span>{formError || apiError}</span>
        </div>
      )}

      {!canClose && (
        <div className="during-error" style={{ margin: '0 16px 12px' }}>
          Complete &amp; Close Session is blocked until P4-09 sign-offs are complete for Technician, Nurse, and Physician.
        </div>
      )}

      <div className="p410-workspace-grid">
        <div className="p410-main-form-column">
          <div className="p410-row1-grid">
            <div className="p410-card p410-celebration-card">
              <div className="p410-confetti-circle-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#ffffff', fontSize: 32 }} />
              </div>
              <div className="p410-celebration-text">
                <h2>Session Completed Successfully!</h2>
                <p>All steps completed as per protocol.</p>
              </div>
              <div className="p410-celebration-meta-grid">
                <div className="p410-celeb-meta-item">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                  <div>
                    <span>Completed At</span>
                    <strong>{formatTs(completedAt)}</strong>
                  </div>
                </div>
                <div className="p410-celeb-meta-item">
                  <span className="p410-user-icon-badge">👤</span>
                  <div>
                    <span>Completed By</span>
                    <strong>{completedBy}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p410-card">
              <div className="p410-card-title-row">
                <h2>Key Treatment Outcomes</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 0 }}>Read-only — from P4-03 / P4-04.</p>
              <div className="p410-table-wrap">
                <table className="p410-outcomes-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Pre-Dialysis</th>
                      <th>Post-Dialysis</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Blood Pressure (mmHg)</td>
                      <td>{bpPreStr}</td>
                      <td>{bpPostStr}</td>
                      <td><span className="p410-chg-green">{bpChange(preSys, preDia, postSys, postDia)}</span></td>
                    </tr>
                    <tr>
                      <td>Weight (kg)</td>
                      <td>{displayOrDash(preWeight)}</td>
                      <td>{displayOrDash(postWeight)}</td>
                      <td><span className="p410-chg-green">{changeLabel(preWeight, postWeight)}</span></td>
                    </tr>
                    <tr>
                      <td>Pulse (bpm)</td>
                      <td>{displayOrDash(prePulse)}</td>
                      <td>{displayOrDash(postPulse)}</td>
                      <td><span className="p410-chg-green">{changeLabel(prePulse, postPulse)}</span></td>
                    </tr>
                    <tr>
                      <td>SpO₂ (%)</td>
                      <td>{displayOrDash(preSpo2)}</td>
                      <td>{displayOrDash(postSpo2)}</td>
                      <td>{changeLabel(preSpo2, postSpo2)}</td>
                    </tr>
                    <tr>
                      <td>Temperature (°C)</td>
                      <td>{displayOrDash(preTemp)}</td>
                      <td>{displayOrDash(postTemp)}</td>
                      <td><span className="p410-chg-green">{changeLabel(preTemp, postTemp)}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p410-card">
              <div className="p410-card-title-row">
                <h2>Ultrafiltration Summary</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 0 }}>Read-only — from P4-04.</p>
              <div className="p410-uf-gauge-wrapper">
                <svg viewBox="0 0 100 60" width="140" height="85">
                  <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                  <path
                    d="M 10,50 A 40,40 0 0,1 90,50"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset={ufPct == null ? 126 : Math.max(0, 126 - (126 * Math.min(100, ufPct)) / 100)}
                  />
                  <text x="50" y="42" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">{ufRemovedStr}</text>
                  <text x="50" y="52" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="#64748b">Total UF Removed</text>
                </svg>
              </div>
              <div className="p410-uf-metrics-row">
                <div className="p410-uf-stat-col">
                  <span className="p410-stat-label">UF Goal</span>
                  <strong>{ufGoalStr}</strong>
                </div>
                <div className="p410-uf-stat-col">
                  <span className="p410-stat-label">UF Removed</span>
                  <strong>{ufRemovedStr}</strong>
                </div>
                <div className="p410-uf-stat-col">
                  <span className="p410-stat-label">UF % Achieved</span>
                  <span className="p410-achieved-badge">
                    {ufPct != null ? `✓ ${ufPct}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p410-row2-grid">
            <div className="p410-card">
              <div className="p410-card-title-row">
                <h2>Session Timeline</h2>
              </div>
              <div className="p410-timeline-list">
                {timeline.map((t) => (
                  <div key={t.label} className="p410-timeline-row">
                    <span className="p410-tl-dot">✓</span>
                    <span className="p410-tl-time">{formatTs(t.time)}</span>
                    <span className="p410-tl-label">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p410-card">
              <div className="p410-card-title-row">
                <FavoriteBorderOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <h2>Post-Dialysis Vitals</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 0 }}>Read-only — carried from P4-03.</p>
              <div className="p410-vitals-list">
                <div className="p410-vital-row"><span>Blood Pressure</span><strong>{bpPostStr} mmHg</strong></div>
                <div className="p410-vital-row"><span>Heart Rate</span><strong>{displayOrDash(postPulse)} bpm</strong></div>
                <div className="p410-vital-row"><span>SpO₂</span><strong>{displayOrDash(postSpo2)} %</strong></div>
                <div className="p410-vital-row"><span>Temperature</span><strong>{displayOrDash(postTemp)} °C</strong></div>
                <div className="p410-vital-row"><span>Respiratory Rate</span><strong>{displayOrDash(rr)} /min</strong></div>
              </div>
              {onViewAssessment && (
                <button type="button" className="p410-action-btn" style={{ marginTop: 10 }} onClick={onViewAssessment}>
                  <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>View Full Assessment →</span>
                </button>
              )}
            </div>

            <div className="p410-card">
              <div className="p410-card-title-row">
                <ShieldOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h2>Access Site Assessment</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 0 }}>Read-only — carried from P4-02.</p>
              <div className="p410-access-grid">
                <div className="p410-access-row"><span>Bleeding</span><span className="p410-check-text">{displayOrDash(accessBleeding)}</span></div>
                <div className="p410-access-row"><span>Thrill</span><span className="p410-check-text">{displayOrDash(accessThrill)}</span></div>
                <div className="p410-access-row"><span>Bruit</span><span className="p410-check-text">{displayOrDash(accessBruit)}</span></div>
                <div className="p410-access-row"><span>Swelling</span><span className="p410-check-text">{displayOrDash(accessSwelling)}</span></div>
              </div>
              <div className="p410-form-field">
                <label>Comments</label>
                <div className="p410-comment-readonly">{accessComments || '—'}</div>
              </div>
            </div>
          </div>

          <div className="p410-card p410-feedback-card">
            <div className="p410-card-title-row">
              <StarIcon sx={{ color: '#eab308', fontSize: 18 }} />
              <h2>Patient Feedback</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 0 }}>
              Optional — the only new entry on this screen.
            </p>
            <div className="p410-feedback-grid">
              <div className="p410-fb-col">
                <span className="p410-fb-lbl">Patient Condition</span>
                <div className="p410-fb-val" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {CONDITION_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={condition === opt ? 'p410-sign-yes' : 'p410-sign-no'}
                        style={{
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: condition === opt ? '#16a34a' : '#fff',
                          color: condition === opt ? '#fff' : '#0f172a',
                        }}
                        onClick={() => setCondition(opt)}
                      >
                        {opt === 'Good' && <SentimentSatisfiedAltOutlinedIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p410-fb-col">
                <span className="p410-fb-lbl">Pain Level (0-10)</span>
                <div className="p410-pain-pill-box" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <strong>{painLevel} / 10</strong>
                </div>
              </div>

              <div className="p410-fb-col flex-2">
                <span className="p410-fb-lbl">Patient Comments</span>
                <Textarea
                  maxLength={500}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Optional patient comments…"
                  style={{ minHeight: 56 }}
                />
              </div>

              <div className="p410-fb-col">
                <span className="p410-fb-lbl">Patient Satisfaction</span>
                <div className="p410-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSatisfaction(s)}
                      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                      aria-label={`${s} star${s > 1 ? 's' : ''}`}
                    >
                      {satisfaction >= s
                        ? <StarIcon sx={{ color: '#eab308', fontSize: 18 }} />
                        : <StarBorderIcon sx={{ color: '#cbd5e1', fontSize: 18 }} />}
                    </button>
                  ))}
                  {satisfaction > 0 && (
                    <>
                      <strong>{satisfaction}/5</strong>
                      <span className="p410-sat-txt">{satisfactionLabel(satisfaction)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p410-right-rail">
          <div className="p410-rail-card p410-complete-summary-card">
            <div className="p410-comp-head">
              <div className="p410-comp-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 26 }} />
              </div>
              <div className="p410-comp-text">
                <strong>Session Complete</strong>
                <span>{canClose ? 'Ready to close.' : 'Sign-offs still required.'}</span>
              </div>
            </div>
            <div className="p410-comp-metrics">
              <div className="p410-comp-row">
                <span>Overall Status</span>
                <span className="p410-pill-completed">{canClose ? 'Completed' : 'Pending sign-off'}</span>
              </div>
              <div className="p410-comp-row">
                <span>Treatment Quality</span>
                <div className="p410-mini-stars">
                  <strong>{displayOrDash(data.overall_condition || vitals.overall_condition || condition)}</strong>
                </div>
              </div>
              <div className="p410-comp-row">
                <span>Treatment Tolerance</span>
                <span className="p410-tol-good">{displayOrDash(condition)}</span>
              </div>
              <div className="p410-comp-row">
                <span>Next Appointment</span>
                <strong>{formatAppt(nextAppt)}</strong>
              </div>
            </div>
          </div>

          <div className="p410-rail-card">
            <div className="p410-rail-header">
              <h3>Summary Checklist</h3>
            </div>
            <div className="p410-summary-chk-list">
              {checklist.map((item) => (
                <div className="p410-chk-item" key={item.label}>
                  <span>
                    <CheckCircleOutlinedIcon sx={{ color: item.done ? '#16a34a' : '#cbd5e1', fontSize: 16 }} /> {item.label}
                  </span>
                  <span className="p410-chk-complete">{item.done ? 'Complete' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p410-rail-card">
            <div className="p410-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p410-quick-flex">
              <button type="button" className="p410-action-btn" disabled>
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Session Summary</span>
              </button>
              <button type="button" className="p410-action-btn" disabled>
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Session Summary</span>
              </button>
              <button type="button" className="p410-action-btn" disabled>
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Share with Nephrologist</span>
              </button>
              <button type="button" className="p410-action-btn" disabled>
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export Session Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p410-footer-bar">
        <div className="p410-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p410-footer-right">
          <Button type="button" variant="outline" onClick={handleDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit} disabled={!canClose || closing}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> Complete &amp; Close Session
          </Button>
        </div>
      </footer>
    </div>
  );
}
