import React, { useState } from 'react';
import { Button, Checkbox, Textarea } from '../../component-library';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

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

function displayOrDash(v) {
  if (v === undefined || v === null || v === '') return '—';
  return String(v);
}

function formatApptDate(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString();
  } catch {
    return String(raw);
  }
}

function buildP408ApiPayload(form) {
  const assistance = [];
  if (form.assistanceWalker) assistance.push('Walker');
  if (form.assistanceWheelchair) assistance.push('Wheelchair');
  if (form.assistanceCaregiver) assistance.push('Caregiver Support');
  if (form.assistanceNone) assistance.push('None');
  return {
    ambulation_ability: form.ambulationAbility || null,
    ambulationAbility: form.ambulationAbility || null,
    assistance_used: assistance.join(', ') || null,
    assistanceUsed: assistance.join(', ') || null,
    assistance_walker: form.assistanceWalker,
    assistance_wheelchair: form.assistanceWheelchair,
    assistance_caregiver: form.assistanceCaregiver,
    assistance_none: form.assistanceNone,
    daily_fluid_allowance: form.fluidAllowance === '' ? null : form.fluidAllowance,
    special_instructions: form.specialInstructions || null,
    ambulation: {
      ability: form.ambulationAbility || null,
      walker: form.assistanceWalker,
      wheelchair: form.assistanceWheelchair,
      caregiver: form.assistanceCaregiver,
      none: form.assistanceNone,
      comments: form.ambulationComments || null,
    },
    dietAndFluid: {
      fluidAllowance: form.fluidAllowance,
      specialInstructions: form.specialInstructions,
    },
  };
}

export default function P408PatientDischarge({
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

  const startTimeStr = session.started_at || session.start_time || data.started_at || '—';
  const endTimeStr = data.endTime || session.ended_at || session.end_time || '—';
  const durationStr = data.treatmentDuration || session.treatmentDuration || session.duration || '—';
  const ufRemovedStr = data.totalUfRemoved != null && data.totalUfRemoved !== ''
    ? `${data.totalUfRemoved} L`
    : (session.totalUfRemoved != null ? `${session.totalUfRemoved} L` : '—');
  const machineModel = session.machine_name || session.machine || patient.machine || '—';
  const bedStr = session.bed || session.bed_number || patient.bed || '—';

  const vitals = data.post_vitals || {};
  const symptoms = data.symptoms || vitals.symptoms || {};
  const systolic = data.bp_systolic ?? data.systolic ?? vitals.bp_systolic;
  const diastolic = data.bp_diastolic ?? data.diastolic ?? vitals.bp_diastolic;
  const pulse = data.pulse ?? vitals.pulse;
  const spo2 = data.spo2 ?? vitals.spo2;
  const temperature = data.temperature ?? vitals.temperature;
  const postWeight = data.post_weight ?? data.postWeight ?? vitals.post_weight;
  const overallCond = data.overall_condition ?? data.condition ?? vitals.overall_condition;
  const ready = data.ready === true
    || data.discharge_readiness === true
    || data.discharge_readiness === 1
    || vitals.discharge_readiness === true
    || vitals.discharge_readiness === 1;

  const bpStr = systolic != null && diastolic != null && systolic !== '' && diastolic !== ''
    ? `${systolic} / ${diastolic}`
    : '—';

  const nextAppt = data.next_appointment || data.nextAppointment || {};
  const nextDate = nextAppt.next_dialysis_date || nextAppt.date || data.next_dialysis_date || null;
  const nextTime = nextAppt.expected_time || nextAppt.time || data.expected_time || null;
  const nextShift = nextAppt.shift || data.shift || null;

  const [ambulationAbility, setAmbulationAbility] = useState(
    data.ambulationAbility || data.ambulation_ability || '',
  );
  const [assistanceWalker, setAssistanceWalker] = useState(Boolean(data.assistanceWalker));
  const [assistanceWheelchair, setAssistanceWheelchair] = useState(Boolean(data.assistanceWheelchair));
  const [assistanceCaregiver, setAssistanceCaregiver] = useState(Boolean(data.assistanceCaregiver));
  const [assistanceNone, setAssistanceNone] = useState(Boolean(data.assistanceNone));
  const [ambulationComments, setAmbulationComments] = useState(data.ambulationComments || '');
  const [fluidAllowance, setFluidAllowance] = useState(
    data.fluidAllowance != null ? String(data.fluidAllowance) : (data.daily_fluid_allowance != null ? String(data.daily_fluid_allowance) : ''),
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    data.specialInstructions || data.special_instructions || data.dietInstructions || '',
  );
  const [formError, setFormError] = useState('');

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (!ready) {
      setFormError('P4-03 discharge readiness is not Ready — complete Post Dialysis Vitals first.');
      return;
    }
    if (!ambulationAbility) {
      setFormError('Ambulation Ability is required before Confirm Discharge.');
      return;
    }
    if (
      ambulationAbility === 'Unable'
      && !assistanceCaregiver
      && !assistanceWalker
      && !assistanceWheelchair
    ) {
      setFormError('Ambulation = Unable requires assistance (Caregiver Support recommended).');
      return;
    }

    const form = {
      ambulationAbility,
      assistanceWalker,
      assistanceWheelchair,
      assistanceCaregiver,
      assistanceNone,
      ambulationComments,
      fluidAllowance,
      specialInstructions: [specialInstructions, ambulationComments].filter(Boolean).join('\n') || specialInstructions,
    };
    const apiPayload = buildP408ApiPayload(form);
    updateParentState({ ...form, ...apiPayload });
    if (onSave) {
      const ok = await onSave(apiPayload);
      if (ok === false) return;
    }
  };

  return (
    <div className="p408-page-wrapper">
      <header className="p408-top-bar">
        <div className="p408-top-bar-left">
          <h1>P4-08 – Patient Discharge</h1>
          <p>Ensure patient is stable and discharged with appropriate instructions and follow-up plan.</p>
        </div>
      </header>

      <nav className="p408-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 8;
          const isCompleted = s.step < 8;
          return (
            <React.Fragment key={s.step}>
              <div className={`p408-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p408-stepper-circle">{isCompleted ? '✓' : s.step}</div>
                <span className="p408-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p408-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p408-patient-header-banner">
        <div className="p408-patient-left">
          <div className="p408-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p408-patient-avatar-fallback" aria-hidden="true">
                {(patientName || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="p408-patient-bio">
            <div className="p408-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p408-pill-active">Active</span>
            </div>
            <div className="p408-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p408-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p408-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p408-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p408-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>
        <div className="p408-patient-stats">
          <div className="p408-stat-box">
            <CalendarTodayOutlinedIcon className="p408-stat-icon" />
            <span className="p408-stat-lbl">Treatment Start</span>
            <strong className="p408-stat-val">{startTimeStr}</strong>
          </div>
          <div className="p408-stat-box">
            <AccessTimeOutlinedIcon className="p408-stat-icon" />
            <span className="p408-stat-lbl">Treatment End</span>
            <strong className="p408-stat-val">{endTimeStr}</strong>
          </div>
          <div className="p408-stat-box">
            <AccessTimeOutlinedIcon className="p408-stat-icon" />
            <span className="p408-stat-lbl">Duration</span>
            <strong className="p408-stat-val">{durationStr}</strong>
          </div>
          <div className="p408-stat-box">
            <WaterDropOutlinedIcon className="p408-stat-icon" />
            <span className="p408-stat-lbl">UF Removed</span>
            <strong className="p408-stat-val">{ufRemovedStr}</strong>
          </div>
          <div className="p408-stat-box">
            <HotelOutlinedIcon className="p408-stat-icon" />
            <span className="p408-stat-lbl">Machine / Bed</span>
            <strong className="p408-stat-val">{machineModel} / {bedStr}</strong>
          </div>
        </div>
      </div>

      {!ready && (
        <div className="during-error" style={{ margin: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
          <span>
            Confirm Discharge is blocked until P4-03 marks the patient Ready for Discharge.
            {onViewAssessment ? ' Use View Full Assessment to return to Post Dialysis Vitals.' : ''}
          </span>
        </div>
      )}

      <div className="p408-workspace-grid">
        <div className="p408-main-form-column">
          <div className="p408-top-3col-grid">
            <div className="p408-card">
              <div className="p408-card-title-row">
                <MedicalServicesOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <h2>1. Discharge Readiness Assessment</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 0 }}>
                Read-only — carried forward from P4-03. Vitals and symptoms are not re-entered here.
              </p>
              <div className="p408-readiness-table">
                <div className="p408-readiness-row"><span>Blood Pressure (mmHg)</span><strong>{bpStr}</strong></div>
                <div className="p408-readiness-row"><span>Heart Rate (bpm)</span><strong>{displayOrDash(pulse)}</strong></div>
                <div className="p408-readiness-row"><span>SpO₂ (%)</span><strong>{displayOrDash(spo2)}</strong></div>
                <div className="p408-readiness-row"><span>Temperature (°C)</span><strong>{displayOrDash(temperature)}</strong></div>
                <div className="p408-readiness-row"><span>Bleeding from Access Site</span><strong>{displayOrDash(data.bleeding_from_access)}</strong></div>
                <div className="p408-readiness-row"><span>Dizziness / Giddiness</span><strong>{displayOrDash(data.dizziness || symptoms.dizziness || symptoms['Dizziness / Lightheadedness'])}</strong></div>
                <div className="p408-readiness-row"><span>Nausea / Vomiting</span><strong>{displayOrDash(data.nausea || symptoms.nausea || symptoms['Nausea / Vomiting'])}</strong></div>
                <div className="p408-readiness-row"><span>Shortness of Breath</span><strong>{displayOrDash(data.shortness_of_breath || symptoms.shortness_breath || symptoms['Shortness of Breath'])}</strong></div>
                <div className="p408-readiness-row">
                  <span>Overall Assessment</span>
                  <span className="p408-stable-pill">{displayOrDash(overallCond)}</span>
                </div>
              </div>
              {ready ? (
                <div className="p408-ready-status-banner">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <span>Patient is stable for discharge</span>
                </div>
              ) : (
                <div className="during-error" style={{ marginTop: 8 }}>
                  Not ready for discharge — return to P4-03.
                </div>
              )}
              {onViewAssessment && (
                <button type="button" className="p408-action-btn" style={{ marginTop: 10 }} onClick={onViewAssessment}>
                  <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>View Full Assessment →</span>
                </button>
              )}
            </div>

            <div className="p408-card">
              <div className="p408-card-title-row">
                <DirectionsWalkOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h2>2. Ambulation Status *</h2>
              </div>
              <div className="p408-form-field">
                <label>Ambulation Ability</label>
                <div className="p408-toggle-3pills">
                  {['Independent', 'Assisted', 'Unable'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`p408-amb-pill ${ambulationAbility === opt ? (opt === 'Unable' ? 'active-no' : 'active') : ''}`}
                      onClick={() => {
                        setAmbulationAbility(opt);
                        updateParentState({ ambulationAbility: opt });
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p408-form-field">
                <label>Any Assistance Used?</label>
                <div className="p408-checkbox-stack">
                  {[
                    ['Walker', assistanceWalker, setAssistanceWalker, 'assistanceWalker'],
                    ['Wheelchair', assistanceWheelchair, setAssistanceWheelchair, 'assistanceWheelchair'],
                    ['Caregiver Support', assistanceCaregiver, setAssistanceCaregiver, 'assistanceCaregiver'],
                    ['None', assistanceNone, setAssistanceNone, 'assistanceNone'],
                  ].map(([label, checked, setter, key]) => (
                    <label className="p408-checkbox-row" key={key}>
                      <Checkbox
                        checked={checked}
                        onChange={(e) => {
                          setter(e.target.checked);
                          updateParentState({ [key]: e.target.checked });
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p408-form-field">
                <div className="p408-notes-label"><label>Comments</label><span className="p408-char-count">{ambulationComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={ambulationComments} onChange={(e) => setAmbulationComments(e.target.value)} style={{ minHeight: 45 }} />
              </div>
            </div>

            <div className="p408-card">
              <div className="p408-card-title-row">
                <RestaurantOutlinedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <h2>3. Diet &amp; Fluid Advice</h2>
              </div>
              <div className="p408-form-field">
                <label>Daily Fluid Allowance</label>
                <div className="p408-addon-input">
                  <input type="number" value={fluidAllowance} onChange={(e) => setFluidAllowance(e.target.value)} />
                  <span className="p408-unit-addon">ml</span>
                </div>
              </div>
              <div className="p408-form-field">
                <div className="p408-notes-label"><label>Special Instructions</label><span className="p408-char-count">{specialInstructions.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter instructions..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} style={{ minHeight: 50 }} />
              </div>
              <p style={{ color: '#64748b', fontSize: 12 }}>
                Diet type is prescribed by nephrologist/dietitian and is not collected on this screen.
              </p>
            </div>
          </div>

          <div className="p408-bottom-3col-grid">
            <div className="p408-card" style={{ gridColumn: '1 / -1' }}>
              <div className="p408-card-title-row">
                <EventAvailableOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                <h2>4. Next Appointment</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 0 }}>
                Read-only — pre-filled from Scheduling. This screen does not edit appointments.
              </p>
              <div className="p408-readiness-table">
                <div className="p408-readiness-row"><span>Next Dialysis Date</span><strong>{formatApptDate(nextDate)}</strong></div>
                <div className="p408-readiness-row"><span>Expected Time</span><strong>{displayOrDash(nextTime)}</strong></div>
                <div className="p408-readiness-row"><span>Shift</span><strong>{displayOrDash(nextShift)}</strong></div>
              </div>
              {nextDate ? (
                <div className="p408-appt-confirm-box">
                  <CalendarTodayOutlinedIcon sx={{ color: '#b45309', fontSize: 20 }} />
                  <div className="p408-appt-confirm-text">
                    <span>Appointment scheduled</span>
                    <strong>for {formatApptDate(nextDate)}{nextTime ? `, ${nextTime}` : ''}</strong>
                  </div>
                </div>
              ) : (
                <div className="p408-info-box-sm" style={{ marginTop: 8 }}>No upcoming appointment found in Scheduling.</div>
              )}
            </div>
          </div>
        </div>

        <div className="p408-right-rail">
          <div className="p408-rail-card p408-discharge-summary-card">
            <div className="p408-dis-head">
              <div className="p408-dis-icon">
                {ready ? (
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 26 }} />
                ) : (
                  <WarningAmberOutlinedIcon sx={{ color: '#b45309', fontSize: 26 }} />
                )}
              </div>
              <div className="p408-dis-text">
                <strong>{ready ? 'Ready for Discharge' : 'Not Ready'}</strong>
                <span>{ready ? 'P4-03 readiness gate passed.' : 'Complete P4-03 readiness first.'}</span>
              </div>
            </div>
            <div className="p408-dis-metrics">
              <div className="p408-dis-row"><span>Total Duration</span><strong>{durationStr}</strong></div>
              <div className="p408-dis-row"><span>UF Removed</span><strong>{ufRemovedStr}</strong></div>
              <div className="p408-dis-row"><span>Post Dialysis BP</span><strong>{bpStr === '—' ? '—' : `${bpStr} mmHg`}</strong></div>
              <div className="p408-dis-row"><span>Post Weight</span><strong>{postWeight != null && postWeight !== '' ? `${postWeight} kg` : '—'}</strong></div>
              <div className="p408-dis-row"><span>Access Site</span><strong>{displayOrDash(accessDetail)}</strong></div>
              <div className="p408-dis-row"><span>Overall Condition</span><strong>{displayOrDash(overallCond)}</strong></div>
            </div>
          </div>

          <div className="p408-rail-card p408-reminders-card">
            <div className="p408-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p408-reminders-checklist">
              <div className="p408-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Reinforce fluid restrictions</span></div>
              <div className="p408-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Take medications as prescribed</span></div>
              <div className="p408-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Monitor access site for infection</span></div>
              <div className="p408-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Seek medical help if unwell</span></div>
              <div className="p408-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Keep next appointment as scheduled</span></div>
            </div>
          </div>

          <div className="p408-rail-card">
            <div className="p408-rail-header"><h3>Quick Actions</h3></div>
            <div className="p408-quick-flex">
              <button type="button" className="p408-action-btn" disabled>
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Discharge Summary</span>
              </button>
              <button type="button" className="p408-action-btn" disabled>
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Send Summary to Nephrologist</span>
              </button>
              <button type="button" className="p408-action-btn" disabled>
                <WhatsAppIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                <span>Share with Patient (WhatsApp)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p408-footer-bar">
        <div className="p408-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p408-footer-right">
          {(formError || apiError) && (
            <div className="during-error" style={{ marginRight: 12 }}>{formError || apiError}</div>
          )}
          <Button type="button" variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit} disabled={!ready}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> Confirm Discharge
          </Button>
        </div>
      </footer>
    </div>
  );
}
