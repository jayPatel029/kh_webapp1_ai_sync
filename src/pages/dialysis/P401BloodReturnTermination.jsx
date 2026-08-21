import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons for Header, Sections, and Right Rail
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';

const TERMINATION_STEPS = [
  { id: 1, title: 'Stop UF', subtitle: 'Stop ultrafiltration', defaultTime: '07:15 AM' },
  { id: 2, title: 'Reduce Blood Pump Speed', subtitle: 'Reduce blood pump to 100 mL/min', defaultTime: '07:20 AM' },
  { id: 3, title: 'Saline Rinse-Back', subtitle: 'Priming volume 200 mL', defaultTime: '07:22 AM' },
  { id: 4, title: 'Return Blood', subtitle: 'Return extracorporeal blood', defaultTime: '07:24 AM' },
  { id: 5, title: 'Clamp Blood Lines', subtitle: 'Clamp arterial and venous lines', defaultTime: '07:25 AM' },
  { id: 6, title: 'Stop Blood Pump', subtitle: 'Stop blood pump', defaultTime: '07:26 AM' },
  { id: 7, title: 'Disconnect Blood Tubing', subtitle: 'Disconnect from patient', defaultTime: '07:27 AM' },
];

const CLEARANCE_OPTIONS = ['Clear', 'Moderately Clear', 'Slightly Clouded', 'Clotted/Discard'];
const EARLY_REASON_OPTIONS = [
  'Hypotension',
  'Chest Pain',
  'Access Problem (Clotting/Infiltration)',
  'Patient Request',
  'Machine Malfunction',
  'Other',
];
const PHYSICIAN_ORDER_OPTIONS = [
  'Order Obtained (Verbal)',
  'Order Obtained (Written)',
  'Standing Order Applies',
  'Pending',
];

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

export default function P401BloodReturnTermination({
  data = {},
  setData,
  session = {},
  readings = [],
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
}) {
  // Extraction of session & patient details for dynamic pre-fill
  const p = patient.patient || patient;
  const patientName = p.name || p.patient_name || (p.id ? `Patient #${p.id}` : '—');
  const pid = p.patient_code || p.patientCode || p.pid || p.patient_id || (p.id ? `P${p.id}` : '—');
  const rawGender = p.gender || p.sex;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || '—');
  const ageVal = p.age ? String(p.age) : '—';
  const ageGender = ageVal !== '—' && gender !== '—' ? `${ageVal} Years, ${gender}` : (ageVal !== '—' ? `${ageVal} Years` : gender);
  const bloodGroup = p.bloodGroup || p.blood_group || '—';
  const accessType = p.vascular_access || p.access || session.access || '—';
  const nephrologist = p.primary_doctor_name || p.nephrologist || session.nephrologist || p.doctor_name || '—';

  const startTimeStr = session.started_at || session.start_time || '07:45 AM';
  const elapsedTimeStr = session.elapsedTime || '03:35 hr';
  const ufRemovedStr = session.totalUfRemoved || '1.65 L';
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const bedStr = session.bed || patient.bed || 'B-02';

  // Prescription Data (Carried read-only)
  const prescription = session.prescription || session.dashboard?.prescription || {
    prescribedDuration: '04:00 hr',
    ufGoal: '2.0 L',
    dfr: '500 mL/min',
    bfr: '300 mL/min',
    temperature: '36.5 °C',
    dialysate: 'Standard Bicarbonate',
  };

  // Live Parameters snapshot (Pre-Termination)
  const lastReading = readings && readings.length > 0 ? readings[readings.length - 1] : null;
  const liveParams = session.liveParams || session.dashboard?.liveParams || {
    bp: lastReading?.systolic ? `${lastReading.systolic} / ${lastReading.diastolic} mmHg` : '128 / 76 mmHg',
    hr: lastReading?.pulse ? `${lastReading.pulse} bpm` : '78 bpm',
    tmp: session.tmp ? `${session.tmp} mmHg` : '68 mmHg',
    vp: session.vp ? `${session.vp} mmHg` : '-122 mmHg',
    ap: session.ap ? `${session.ap} mmHg` : '-180 mmHg',
    bfr: session.bfr ? `${session.bfr} mL/min` : '100 mL/min',
  };

  // Checklist Step State
  const [completedSteps, setCompletedSteps] = useState(() => {
    const initial = {};
    TERMINATION_STEPS.forEach((s) => {
      initial[s.id] = {
        completed: data.steps?.[s.title]?.completed ?? true,
        timestamp: data.steps?.[s.title]?.timestamp || s.defaultTime,
      };
    });
    return initial;
  });

  // Form Fields State
  const [endTime, setEndTime] = useState(data.endTime || '07:27 AM');
  const [status, setStatus] = useState(data.status || 'Completed');
  const [treatmentDuration, setTreatmentDuration] = useState(data.treatmentDuration || '03:42 hr');
  const [dialyzerClearance, setDialyzerClearance] = useState(data.dialyzerClearance || 'Moderately Clear');
  const [totalUfRemoved, setTotalUfRemoved] = useState(data.totalUfRemoved || '1.65');
  const [rinseBackVolume, setRinseBackVolume] = useState(data.rinseBackVolume || '200');
  const [bloodVolumeProcessed, setBloodVolumeProcessed] = useState(data.bloodVolumeProcessed || '58.2');
  const [physicianNotified, setPhysicianNotified] = useState(data.physicianNotified || 'Yes');
  const [heparinUsed, setHeparinUsed] = useState(data.heparinUsed || '2.0');

  // Early Termination Panel State
  const [earlyReason, setEarlyReason] = useState(data.earlyReason || '');
  const [earlyTime, setEarlyTime] = useState(data.earlyTime || '');
  const [physicianOrder, setPhysicianOrder] = useState(data.physicianOrder || '');

  // Notes
  const [terminationNotes, setTerminationNotes] = useState(data.terminationNotes || '');

  // Toggle checklist step completion
  const handleToggleStep = (stepId, title) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setCompletedSteps((prev) => {
      const current = prev[stepId];
      const updated = {
        completed: !current?.completed,
        timestamp: !current?.completed ? nowStr : current.timestamp || '07:27 AM',
      };
      const nextState = { ...prev, [stepId]: updated };

      if (setData) {
        const stepsMap = {};
        TERMINATION_STEPS.forEach((s) => {
          stepsMap[s.title] = nextState[s.id];
        });
        setData((old) => ({ ...old, steps: stepsMap }));
      }
      return nextState;
    });
  };

  // Sync component form state up to parent data state
  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const allStepsDone = TERMINATION_STEPS.every((s) => completedSteps[s.id]?.completed);

  const handleFormSubmit = () => {
    const payload = {
      endTime,
      status,
      treatmentDuration,
      dialyzerClearance,
      totalUfRemoved,
      rinseBackVolume,
      bloodVolumeProcessed,
      physicianNotified,
      heparinUsed,
      earlyReason,
      earlyTime,
      physicianOrder,
      terminationNotes,
      steps: completedSteps,
    };
    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  return (
    <div className="p401-page-wrapper">
      {/* Top Header Bar */}
      <header className="p401-top-bar">
        <div className="p401-top-bar-left">
          <h1>P4-01 – Blood Return &amp; Treatment Termination</h1>
          <p>Safely return blood to patient and complete treatment.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p401-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 1;
          const isCompleted = s.step < 1;
          return (
            <React.Fragment key={s.step}>
              <div className={`p401-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p401-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p401-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p401-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p401-patient-header-banner">
        <div className="p401-patient-left">
          <div className="p401-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p401-patient-bio">
            <div className="p401-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p401-pill-active">Active</span>
            </div>
            <div className="p401-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p401-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p401-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p401-patient-subrow2">
              <span>Access: <strong>{accessType}</strong></span>
              <span className="p401-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes on Right of Patient Banner */}
        <div className="p401-patient-stats">
          <div className="p401-stat-box">
            <CalendarTodayOutlinedIcon className="p401-stat-icon" />
            <span className="p401-stat-lbl">Treatment Start</span>
            <strong className="p401-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p401-stat-box">
            <AccessTimeOutlinedIcon className="p401-stat-icon" />
            <span className="p401-stat-lbl">Elapsed Time</span>
            <strong className="p401-stat-val">{elapsedTimeStr}</strong>
          </div>

          <div className="p401-stat-box">
            <WaterDropOutlinedIcon className="p401-stat-icon" />
            <span className="p401-stat-lbl">UF Removed</span>
            <strong className="p401-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p401-stat-box">
            <PrintOutlinedIcon className="p401-stat-icon" />
            <span className="p401-stat-lbl">Machine</span>
            <strong className="p401-stat-val">{machineModel}</strong>
          </div>

          <div className="p401-stat-box">
            <HotelOutlinedIcon className="p401-stat-icon" />
            <span className="p401-stat-lbl">Bed</span>
            <strong className="p401-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left Content + 4/12 Right Rail */}
      <div className="p401-workspace-grid">
        {/* Left Form Content */}
        <div className="p401-main-form-column">
          {/* Row 1: Side-by-Side Cards Grid (Card 1 & Card 2) */}
          <div className="p401-cards-side-by-side">
            {/* Card 1: 1. Treatment Termination Steps */}
            <div className="p401-card">
              <div className="p401-card-title-row">
                <h2>1. Treatment Termination Steps</h2>
              </div>

              <div className="p401-steps-list">
                {TERMINATION_STEPS.map((step) => {
                  const isDone = completedSteps[step.id]?.completed;
                  const time = completedSteps[step.id]?.timestamp || step.defaultTime;
                  return (
                    <div
                      key={step.id}
                      className={`p401-step-item ${isDone ? 'checked' : ''}`}
                      onClick={() => handleToggleStep(step.id, step.title)}
                    >
                      <div className="p401-step-circle-badge">{step.id}</div>
                      <div className="p401-step-text">
                        <strong>{step.title}</strong>
                        <span>{step.subtitle}</span>
                      </div>
                      <div className="p401-step-status-pill">
                        {isDone ? (
                          <span className="p401-completed-badge">
                            <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} /> Completed {time}
                          </span>
                        ) : (
                          <span className="p401-pending-pill">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Green Success Banner at Bottom of Card 1 */}
              {allStepsDone && (
                <div className="p401-success-banner-card">
                  <div className="p401-success-banner-left">
                    <div className="p401-success-icon-wrap">
                      <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                    </div>
                    <div className="p401-success-text">
                      <strong>Blood return completed successfully</strong>
                      <span>Total rinse-back volume: {rinseBackVolume} mL</span>
                    </div>
                  </div>
                  <div className="p401-success-graphic">
                    <svg viewBox="0 0 48 36" width="44" height="32" fill="none">
                      <rect x="14" y="6" width="20" height="24" rx="4" stroke="#16a34a" strokeWidth="2" fill="#dcfce7" />
                      <line x1="24" y1="2" x2="24" y2="6" stroke="#16a34a" strokeWidth="2" />
                      <path d="M24 30 V34 H36 V32" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="24" cy="18" r="4" fill="#16a34a" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: 2. Treatment End Details */}
            <div className="p401-card">
              <div className="p401-card-title-row">
                <h2>2. Treatment End Details</h2>
              </div>

              <div className="p401-form-grid-2col">
                {/* Field 1: Treatment End Time */}
                <div className="p401-form-field">
                  <label>Treatment End Time <span className="p401-req">*</span></label>
                  <div className="p401-input-icon-wrap">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        updateParentState({ endTime: e.target.value });
                      }}
                    />
                    <AccessTimeOutlinedIcon className="p401-field-icon" />
                  </div>
                </div>

                {/* Field 2: Treatment Status Toggle */}
                <div className="p401-form-field">
                  <label>Treatment Status <span className="p401-req">*</span></label>
                  <div className="p401-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${status === 'Completed' ? 'active' : ''}`}
                      onClick={() => {
                        setStatus('Completed');
                        updateParentState({ status: 'Completed' });
                      }}
                    >
                      {status === 'Completed' && <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />} Completed
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${status === 'Early Termination' ? 'active-early' : ''}`}
                      onClick={() => {
                        setStatus('Early Termination');
                        updateParentState({ status: 'Early Termination' });
                      }}
                    >
                      Early Termination
                    </button>
                  </div>
                </div>

                {/* Field 3: Treatment Duration */}
                <div className="p401-form-field">
                  <label>Treatment Duration</label>
                  <input
                    type="text"
                    value={treatmentDuration}
                    readOnly
                    className="p401-disabled-input"
                  />
                </div>

                {/* Field 4: Dialyzer Clearance */}
                <div className="p401-form-field">
                  <label>Dialyzer Clearance</label>
                  <select
                    value={dialyzerClearance}
                    onChange={(e) => {
                      setDialyzerClearance(e.target.value);
                      updateParentState({ dialyzerClearance: e.target.value });
                    }}
                  >
                    {CLEARANCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Field 5: Total UF Removed */}
                <div className="p401-form-field">
                  <label>Total UF Removed</label>
                  <div className="p401-addon-input">
                    <input
                      type="text"
                      value={totalUfRemoved}
                      onChange={(e) => {
                        setTotalUfRemoved(e.target.value);
                        updateParentState({ totalUfRemoved: e.target.value });
                      }}
                    />
                    <span className="p401-unit-addon">L</span>
                  </div>
                </div>

                {/* Field 6: Rinse-Back Volume */}
                <div className="p401-form-field">
                  <label>Rinse-Back Volume</label>
                  <div className="p401-addon-input">
                    <input
                      type="text"
                      value={rinseBackVolume}
                      onChange={(e) => {
                        setRinseBackVolume(e.target.value);
                        updateParentState({ rinseBackVolume: e.target.value });
                      }}
                    />
                    <span className="p401-unit-addon">mL</span>
                  </div>
                </div>

                {/* Field 7: Blood Volume Processed */}
                <div className="p401-form-field">
                  <label>Blood Volume Processed</label>
                  <div className="p401-addon-input">
                    <input
                      type="text"
                      value={bloodVolumeProcessed}
                      onChange={(e) => {
                        setBloodVolumeProcessed(e.target.value);
                        updateParentState({ bloodVolumeProcessed: e.target.value });
                      }}
                    />
                    <span className="p401-unit-addon">L</span>
                  </div>
                </div>

                {/* Field 8: Physician Notified Toggle */}
                <div className="p401-form-field">
                  <label>Physician Notified</label>
                  <div className="p401-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${physicianNotified === 'Yes' ? 'active' : ''}`}
                      onClick={() => {
                        setPhysicianNotified('Yes');
                        updateParentState({ physicianNotified: 'Yes' });
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${physicianNotified === 'No' ? 'active-no' : ''}`}
                      onClick={() => {
                        setPhysicianNotified('No');
                        updateParentState({ physicianNotified: 'No' });
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Field 9: Heparin Used */}
                <div className="p401-form-field">
                  <label>Heparin Used</label>
                  <div className="p401-addon-input">
                    <input
                      type="text"
                      value={heparinUsed}
                      onChange={(e) => {
                        setHeparinUsed(e.target.value);
                        updateParentState({ heparinUsed: e.target.value });
                      }}
                    />
                    <span className="p401-unit-addon">mL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 3. Early Termination (If Applicable) */}
          <div className={`p401-card p401-early-panel ${status === 'Early Termination' ? 'highlight' : ''}`}>
            <div className="p401-card-title-row">
              <h2 className="p401-early-title">3. Early Termination (If Applicable)</h2>
            </div>

            <div className="p401-form-grid-3col">
              {/* Early Field 1: Reason */}
              <div className="p401-form-field">
                <label>Reason for Early Termination</label>
                <select
                  value={earlyReason}
                  onChange={(e) => {
                    setEarlyReason(e.target.value);
                    updateParentState({ earlyReason: e.target.value });
                  }}
                >
                  <option value="">Select reason</option>
                  {EARLY_REASON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Early Field 2: Time Stopped */}
              <div className="p401-form-field">
                <label>Time Treatment Stopped</label>
                <div className="p401-input-icon-wrap">
                  <input
                    type="text"
                    placeholder="Select time"
                    value={earlyTime}
                    onChange={(e) => {
                      setEarlyTime(e.target.value);
                      updateParentState({ earlyTime: e.target.value });
                    }}
                  />
                  <AccessTimeOutlinedIcon className="p401-field-icon" />
                </div>
              </div>

              {/* Early Field 3: Physician Order */}
              <div className="p401-form-field">
                <label>Physician Order</label>
                <select
                  value={physicianOrder}
                  onChange={(e) => {
                    setPhysicianOrder(e.target.value);
                    updateParentState({ physicianOrder: e.target.value });
                  }}
                >
                  <option value="">Select</option>
                  {PHYSICIAN_ORDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: 4. Notes / Comments */}
          <div className="p401-card">
            <div className="p401-notes-header">
              <h2>4. Notes / Comments</h2>
              <span className="p401-char-count">{terminationNotes.length} / 300</span>
            </div>

            <Textarea
              maxLength={300}
              placeholder="Enter any additional notes..."
              value={terminationNotes}
              onChange={(e) => {
                setTerminationNotes(e.target.value);
                updateParentState({ terminationNotes: e.target.value });
              }}
              style={{ minHeight: 90 }}
            />
          </div>
        </div>

        {/* Right Rail Column */}
        <div className="p401-right-rail">
          {/* Card 1: Treatment Prescription */}
          <div className="p401-rail-card">
            <div className="p401-rail-header">
              <h3>Treatment Prescription</h3>
            </div>
            <div className="p401-rail-list">
              <div className="p401-rail-row">
                <span className="p401-rail-key">Prescribed Duration</span>
                <strong className="p401-rail-val">{prescription.prescribedDuration}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">UF Goal</span>
                <strong className="p401-rail-val">{prescription.ufGoal}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">Dialysate Flow</span>
                <strong className="p401-rail-val">{prescription.dfr}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">Blood Flow Rate</span>
                <strong className="p401-rail-val">{prescription.bfr}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">Temperature</span>
                <strong className="p401-rail-val">{prescription.temperature}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">Dialysate</span>
                <strong className="p401-rail-val">{prescription.dialysate}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Live Parameters (Pre-Termination) */}
          <div className="p401-rail-card">
            <div className="p401-rail-header">
              <h3>Live Parameters (Pre-Termination)</h3>
            </div>
            <div className="p401-rail-list">
              <div className="p401-rail-row">
                <span className="p401-rail-key">
                  <MonitorHeartOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} /> BP
                </span>
                <strong className="p401-rail-val">{liveParams.bp}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">
                  <FavoriteBorderOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} /> HR
                </span>
                <strong className="p401-rail-val">{liveParams.hr}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">
                  <SpeedOutlinedIcon sx={{ fontSize: 16, color: '#d97706' }} /> TMP
                </span>
                <strong className="p401-rail-val">{liveParams.tmp}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">
                  <WavesOutlinedIcon sx={{ fontSize: 16, color: '#0284c7' }} /> VP
                </span>
                <strong className="p401-rail-val">{liveParams.vp}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">
                  <ShowChartOutlinedIcon sx={{ fontSize: 16, color: '#7c3aed' }} /> AP
                </span>
                <strong className="p401-rail-val">{liveParams.ap}</strong>
              </div>
              <div className="p401-rail-row">
                <span className="p401-rail-key">
                  <WaterDropOutlinedIcon sx={{ fontSize: 16, color: '#dc2626' }} /> BFR
                </span>
                <strong className="p401-rail-val">{liveParams.bfr}</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Safety Reminders (Gold Tinted) */}
          <div className="p401-rail-card p401-reminders-card">
            <div className="p401-rail-header">
              <ShieldOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Safety Reminders</h3>
            </div>
            <div className="p401-reminders-checklist">
              <div className="p401-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Ensure all blood is returned</span>
              </div>
              <div className="p401-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Verify patient is stable</span>
              </div>
              <div className="p401-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Check for any alarms</span>
              </div>
              <div className="p401-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Clamp lines before disconnect</span>
              </div>
              <div className="p401-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Maintain aseptic technique</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p401-footer-bar">
        <div className="p401-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p401-footer-right">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            Save &amp; Continue <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
