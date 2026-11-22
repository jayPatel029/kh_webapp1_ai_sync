import React, { useMemo, useState } from 'react';
import { Button, Textarea } from '../../component-library';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

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

function yn(v, fallback = '') {
  if (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'yes') return 'Yes';
  if (v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'no') return 'No';
  if (v === 'Completed' || v === 'Not Applicable') return v;
  return v != null && v !== '' ? String(v) : fallback;
}

function isPositiveInfection(raw) {
  const s = String(raw || '').toLowerCase();
  return s.includes('pos') || s === 'reactive' || s === '1' || s === 'true' || s === 'yes';
}

function isIsolationPatient(patient = {}, data = {}) {
  const p = patient.patient || patient;
  const candidates = [
    p.hiv_status, p.hiv, p.hivStatus,
    p.hbsag, p.hbsag_status, p.hepatitis_b, p.hepatitisB, p.hep_b,
    p.infection_status, p.isolation_required,
    data.hiv_status, data.hbsag_status, data.isolation_required,
  ];
  return candidates.some(isPositiveInfection);
}

function resolveLoggedInUser() {
  try {
    const id = localStorage.getItem('id')
      || localStorage.getItem('userId')
      || localStorage.getItem('user_id')
      || localStorage.getItem('technicianId')
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
      || (id ? `User #${id}` : '');
    return { id: id || fromJson.id || null, display: display || '—' };
  } catch {
    return { id: null, display: '—' };
  }
}

function readinessLabel(entry) {
  if (!entry) return { status: 'Unavailable', date: null };
  if (typeof entry === 'string') return { status: entry, date: null };
  return {
    status: entry.status || entry.result || 'Unavailable',
    date: entry.date || entry.checked_at || null,
  };
}

function isDone(v) {
  const s = String(v || '').toLowerCase();
  return s === 'yes' || s === 'completed' || s === 'complete';
}

function isNaValue(v) {
  const s = String(v || '').toLowerCase().replace(/\s+/g, ' ');
  return s === 'n/a' || s === 'na' || s === 'not applicable';
}

function ToggleYesNo({ value, onChange, completedMode = false }) {
  if (completedMode) {
    return (
      <div className="p406-toggle-pills">
        <button type="button" className={`p401-pill-btn ${value === 'Completed' ? 'active' : ''}`} onClick={() => onChange('Completed')}>Completed</button>
        <button type="button" className={`p401-pill-btn ${value === 'Not Applicable' ? 'active-no' : ''}`} onClick={() => onChange('Not Applicable')}>Not Applicable</button>
      </div>
    );
  }
  return (
    <div className="p406-toggle-pills">
      <button type="button" className={`p401-pill-btn ${value === 'Yes' ? 'active' : ''}`} onClick={() => onChange('Yes')}>Yes</button>
      <button type="button" className={`p401-pill-btn ${value === 'No' ? 'active-no' : ''}`} onClick={() => onChange('No')}>No</button>
    </div>
  );
}

function buildP406ApiPayload(form, verified) {
  const disposal = {
    bloodline_disposed: form.bloodlineDisposed || null,
    dialyzer_disposed: form.dialyzerDisposed || null,
    tubing_set_disposed: form.tubingSetDisposed || null,
    needles_disposed: form.needlesDisposed || null,
    sharps_white_container: form.sharpsWhiteContainer || null,
    yellow_bag: form.yellowBag || null,
    red_bag: form.redBag || null,
    comments: form.disposalComments || null,
  };
  const disinfection = {
    heat_disinfection: form.heatDisinfection || null,
    heat_start_time: form.heatStartTime || null,
    heat_end_time: form.heatEndTime || null,
    chemical_disinfection: form.chemicalDisinfection || null,
    solution_used: form.chemicalSolution || null,
    contact_time: form.chemicalContactTime || null,
    rinse_completed: form.rinseCompleted || null,
    rinse_time: form.rinseTime || null,
  };
  const surface_cleaning = {
    exterior_surfaces_wiped: form.exteriorWiped || null,
    touch_screen_cleaned: form.touchscreenCleaned || null,
    alarms_controls_cleaned: form.controlsCleaned || null,
    accessory_trays_cleaned: form.traysCleaned || null,
    chair_bed_area_cleaned: form.chairCleaned || null,
    floor_area_cleaned: form.floorCleaned || null,
    sodium_hypochlorite: form.sodiumHypochlorite || null,
    citric_acid: form.citricAcid || null,
    peracetic_acid: form.peraceticAcid || null,
    hydrogen_peroxide: form.hydrogenPeroxide || null,
    comments: form.surfaceComments || null,
  };
  return {
    disposal,
    disinfection,
    surface_cleaning,
    verified_by: verified.id || verified.display || null,
    verified_at: verified.at,
    verifiedBy: verified.display,
    verifiedAt: verified.at,
  };
}

export default function P406MachineDisinfectionTurnover({
  data = {},
  setData,
  session = {},
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
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
  const bedStr = session.bed || session.bed_number || patient.bed || '—';
  const machineId = patient.machine_id || session.machine_id || session.machineId || data.machine_id || null;
  const machineModel = session.machine_name || session.machine || patient.machine || machineId || '—';

  const isolation = isIsolationPatient(patient, data);
  const readiness = data.readiness_summary || {};
  const qc = readinessLabel(readiness.qc);
  const selfTest = readinessLabel(readiness.self_test);
  const ro = readinessLabel(readiness.ro_verification);
  const maintenance = readinessLabel(readiness.maintenance);

  const loggedIn = resolveLoggedInUser();
  const verifiedAtDefault = data.verifiedAt || data.verified_at || new Date().toISOString().slice(0, 16);

  const priorDisposal = data.disposal || {};
  const priorDisinfection = data.disinfection || {};
  const priorSurface = data.surface_cleaning || data.surfaceCleaning || {};

  const [bloodlineDisposed, setBloodlineDisposed] = useState(yn(data.bloodlineDisposed ?? priorDisposal.bloodline_disposed));
  const [dialyzerDisposed, setDialyzerDisposed] = useState(yn(data.dialyzerDisposed ?? priorDisposal.dialyzer_disposed));
  const [tubingSetDisposed, setTubingSetDisposed] = useState(yn(data.tubingSetDisposed ?? priorDisposal.tubing_set_disposed));
  const [needlesDisposed, setNeedlesDisposed] = useState(yn(data.needlesDisposed ?? priorDisposal.needles_disposed));
  const [sharpsWhiteContainer, setSharpsWhiteContainer] = useState(yn(data.sharpsWhiteContainer ?? priorDisposal.sharps_white_container));
  const [yellowBag, setYellowBag] = useState(yn(data.yellowBag ?? priorDisposal.yellow_bag));
  const [redBag, setRedBag] = useState(yn(data.redBag ?? priorDisposal.red_bag));
  const [disposalComments, setDisposalComments] = useState(data.disposalComments || priorDisposal.comments || '');

  const [heatDisinfection, setHeatDisinfection] = useState(
    yn(data.heatDisinfection ?? priorDisinfection.heat_disinfection),
  );
  const [heatStartTime, setHeatStartTime] = useState(data.heatStartTime || priorDisinfection.heat_start_time || '');
  const [heatEndTime, setHeatEndTime] = useState(data.heatEndTime || priorDisinfection.heat_end_time || '');
  const [chemicalDisinfection, setChemicalDisinfection] = useState(
    yn(data.chemicalDisinfection ?? priorDisinfection.chemical_disinfection),
  );
  const [chemicalSolution, setChemicalSolution] = useState(data.chemicalSolution || priorDisinfection.solution_used || '');
  const [chemicalContactTime, setChemicalContactTime] = useState(data.chemicalContactTime || priorDisinfection.contact_time || '');
  const [rinseCompleted, setRinseCompleted] = useState(yn(data.rinseCompleted ?? priorDisinfection.rinse_completed));
  const [rinseTime, setRinseTime] = useState(data.rinseTime || priorDisinfection.rinse_time || '');

  const [exteriorWiped, setExteriorWiped] = useState(yn(data.exteriorWiped ?? priorSurface.exterior_surfaces_wiped));
  const [touchscreenCleaned, setTouchscreenCleaned] = useState(yn(data.touchscreenCleaned ?? priorSurface.touch_screen_cleaned));
  const [controlsCleaned, setControlsCleaned] = useState(yn(data.controlsCleaned ?? priorSurface.alarms_controls_cleaned));
  const [traysCleaned, setTraysCleaned] = useState(yn(data.traysCleaned ?? priorSurface.accessory_trays_cleaned));
  const [chairCleaned, setChairCleaned] = useState(yn(data.chairCleaned ?? priorSurface.chair_bed_area_cleaned));
  const [floorCleaned, setFloorCleaned] = useState(yn(data.floorCleaned ?? priorSurface.floor_area_cleaned));
  const [sodiumHypochlorite, setSodiumHypochlorite] = useState(yn(data.sodiumHypochlorite ?? priorSurface.sodium_hypochlorite));
  const [citricAcid, setCitricAcid] = useState(yn(data.citricAcid ?? priorSurface.citric_acid));
  const [peraceticAcid, setPeraceticAcid] = useState(yn(data.peraceticAcid ?? priorSurface.peracetic_acid));
  const [hydrogenPeroxide, setHydrogenPeroxide] = useState(yn(data.hydrogenPeroxide ?? priorSurface.hydrogen_peroxide));
  const [surfaceComments, setSurfaceComments] = useState(data.surfaceComments || priorSurface.comments || '');

  const [authConfirmed, setAuthConfirmed] = useState(Boolean(data.hasSignature || data.authConfirmed));
  const [formError, setFormError] = useState('');

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const checklistForPct = useMemo(() => ([
    bloodlineDisposed, dialyzerDisposed, tubingSetDisposed, needlesDisposed,
    sharpsWhiteContainer, yellowBag, redBag,
    heatDisinfection, chemicalDisinfection, rinseCompleted,
    exteriorWiped, touchscreenCleaned, controlsCleaned, traysCleaned, chairCleaned, floorCleaned,
  ]), [
    bloodlineDisposed, dialyzerDisposed, tubingSetDisposed, needlesDisposed,
    sharpsWhiteContainer, yellowBag, redBag,
    heatDisinfection, chemicalDisinfection, rinseCompleted,
    exteriorWiped, touchscreenCleaned, controlsCleaned, traysCleaned, chairCleaned, floorCleaned,
  ]);

  const compliance = useMemo(() => {
    const applicable = checklistForPct.filter((v) => v != null && v !== '' && !isNaValue(v));
    if (!applicable.length) return { pct: 0, done: 0, total: 0 };
    const done = applicable.filter((v) => isDone(v)).length;
    return {
      pct: Math.round((done / applicable.length) * 100),
      done,
      total: applicable.length,
    };
  }, [checklistForPct]);

  const disinfectionOk = (isDone(heatDisinfection) || isNaValue(heatDisinfection))
    && (isDone(chemicalDisinfection) || isNaValue(chemicalDisinfection))
    && isDone(rinseCompleted)
    && heatDisinfection !== ''
    && chemicalDisinfection !== '';

  const handleFormSubmit = async () => {
    setFormError('');
    if (!machineId) {
      setFormError('No machine is linked to this session — cannot record cleaning.');
      return;
    }
    const requiredYes = [
      bloodlineDisposed, dialyzerDisposed, tubingSetDisposed, needlesDisposed,
      sharpsWhiteContainer, yellowBag, redBag,
      exteriorWiped, touchscreenCleaned, controlsCleaned, traysCleaned, chairCleaned, floorCleaned,
    ];
    if (requiredYes.some((v) => !isDone(v))) {
      setFormError('Complete all Post-Use Disposal and Surface Cleaning items (Yes) before continuing.');
      return;
    }
    if (!disinfectionOk) {
      setFormError('Complete Machine Disinfection (Heat/Chemical Completed or N/A, Rinse = Yes).');
      return;
    }
    const agents = [sodiumHypochlorite, citricAcid, peraceticAcid, hydrogenPeroxide];
    if (agents.some((v) => v !== 'Yes' && v !== 'No')) {
      setFormError('Answer all four cleaning-agent confirmations (Yes/No).');
      return;
    }
    if (!agents.some((v) => v === 'Yes')) {
      setFormError('Select at least one cleaning agent used.');
      return;
    }
    if (!authConfirmed) {
      setFormError('Confirm technician verification with your logged-in identity before continuing.');
      return;
    }

    const form = {
      bloodlineDisposed, dialyzerDisposed, tubingSetDisposed, needlesDisposed,
      sharpsWhiteContainer, yellowBag, redBag, disposalComments,
      heatDisinfection, heatStartTime, heatEndTime,
      chemicalDisinfection, chemicalSolution, chemicalContactTime,
      rinseCompleted, rinseTime,
      exteriorWiped, touchscreenCleaned, controlsCleaned, traysCleaned, chairCleaned, floorCleaned,
      sodiumHypochlorite, citricAcid, peraceticAcid, hydrogenPeroxide, surfaceComments,
    };
    const verified = {
      id: loggedIn.id,
      display: loggedIn.display,
      at: new Date().toISOString(),
    };
    const apiPayload = buildP406ApiPayload(form, verified);
    updateParentState({
      ...form,
      ...apiPayload,
      authConfirmed: true,
      disinfectionCompliancePct: compliance.pct,
      machine_id: machineId,
    });
    if (onSave) {
      const ok = await onSave({ ...apiPayload, session_id: session.id || session.session_id || data.session_id, machine_id: machineId });
      if (ok === false) return;
    }
  };

  const statusTone = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('pass') || s.includes('verif') || s.includes('up to date') || s.includes('ok')) return 'good';
    if (s.includes('unavail') || s.includes('unknown')) return 'muted';
    return 'warn';
  };

  return (
    <div className="p406-page-wrapper">
      <header className="p406-top-bar">
        <div className="p406-top-bar-left">
          <h1>P4-06 – Machine Disinfection &amp; Turnover</h1>
          <p>Ensure machine cleaned and disinfected after treatment.</p>
        </div>
      </header>

      <nav className="p406-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 6;
          const isCompleted = s.step < 6;
          return (
            <React.Fragment key={s.step}>
              <div className={`p406-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p406-stepper-circle">{isCompleted ? '✓' : s.step}</div>
                <span className="p406-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p406-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p406-patient-header-banner">
        <div className="p406-patient-left">
          <div className="p406-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p406-patient-avatar-fallback" aria-hidden="true">
                {(patientName || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="p406-patient-bio">
            <div className="p406-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p406-pill-active">Active</span>
            </div>
            <div className="p406-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p406-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p406-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p406-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p406-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>
        <div className="p406-patient-stats">
          <div className="p406-stat-box">
            <CalendarTodayOutlinedIcon className="p406-stat-icon" />
            <span className="p406-stat-lbl">Treatment Start</span>
            <strong className="p406-stat-val">{startTimeStr}</strong>
          </div>
          <div className="p406-stat-box">
            <AccessTimeOutlinedIcon className="p406-stat-icon" />
            <span className="p406-stat-lbl">Treatment End</span>
            <strong className="p406-stat-val">{endTimeStr}</strong>
          </div>
          <div className="p406-stat-box">
            <AccessTimeOutlinedIcon className="p406-stat-icon" />
            <span className="p406-stat-lbl">Duration</span>
            <strong className="p406-stat-val">{durationStr}</strong>
          </div>
          <div className="p406-stat-box">
            <WaterDropOutlinedIcon className="p406-stat-icon" />
            <span className="p406-stat-lbl">UF Removed</span>
            <strong className="p406-stat-val">{ufRemovedStr}</strong>
          </div>
          <div className="p406-stat-box">
            <HotelOutlinedIcon className="p406-stat-icon" />
            <span className="p406-stat-lbl">Machine / Bed</span>
            <strong className="p406-stat-val">{machineModel} / {bedStr}</strong>
          </div>
        </div>
      </div>

      {isolation && (
        <div className="during-error" style={{ margin: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
          <span>
            Isolation patient — use dedicated isolation-zone cleaning supplies and disposal containers only.
            Do not return this machine to general rotation.
          </span>
        </div>
      )}

      <div className="p406-workspace-grid">
        <div className="p406-main-form-column">
          <div className="p406-top-3col-grid">
            <div className="p406-card">
              <div className="p406-card-title-row"><h2>1. Post-Use Disposal</h2></div>
              <div className="p406-checklist-grid">
                {[
                  ['Bloodline Disposed', bloodlineDisposed, setBloodlineDisposed],
                  ['Dialyzer Disposed', dialyzerDisposed, setDialyzerDisposed],
                  ['Tubing Set Disposed', tubingSetDisposed, setTubingSetDisposed],
                  ['Needles Disposed (if any)', needlesDisposed, setNeedlesDisposed],
                  ['Sharps discarded in white/translucent puncture-proof container?', sharpsWhiteContainer, setSharpsWhiteContainer],
                  ['Infectious/biological waste discarded in yellow bag?', yellowBag, setYellowBag],
                  ['Contaminated recyclable waste discarded in red bag?', redBag, setRedBag],
                ].map(([label, value, setter]) => (
                  <div className="p406-check-row" key={label}>
                    <span className="p406-check-lbl">{label}</span>
                    <ToggleYesNo value={value} onChange={(v) => { setter(v); updateParentState({ [label]: v }); }} />
                  </div>
                ))}
              </div>
              <div className="p406-form-field">
                <div className="p406-notes-label">
                  <label>Comments</label>
                  <span className="p406-char-count">{disposalComments.length} / 200</span>
                </div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={disposalComments} onChange={(e) => { setDisposalComments(e.target.value); updateParentState({ disposalComments: e.target.value }); }} style={{ minHeight: 45 }} />
              </div>
            </div>

            <div className="p406-card">
              <div className="p406-card-title-row"><h2>2. Machine Disinfection</h2></div>
              <div className="p406-disinfection-subblock">
                <div className="p406-subhead-row">
                  <span className="p406-subhead-title">Heat Disinfection (Internal)</span>
                  <ToggleYesNo completedMode value={heatDisinfection} onChange={setHeatDisinfection} />
                </div>
                {heatDisinfection === 'Completed' && (
                  <div className="p406-2col-time">
                    <div className="p406-form-field">
                      <label>Start Time</label>
                      <input type="time" value={heatStartTime} onChange={(e) => setHeatStartTime(e.target.value)} />
                    </div>
                    <div className="p406-form-field">
                      <label>End Time</label>
                      <input type="time" value={heatEndTime} onChange={(e) => setHeatEndTime(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p406-disinfection-subblock">
                <div className="p406-subhead-row">
                  <span className="p406-subhead-title">Chemical Disinfection (If Applicable)</span>
                  <ToggleYesNo completedMode value={chemicalDisinfection} onChange={setChemicalDisinfection} />
                </div>
                {chemicalDisinfection === 'Completed' && (
                  <div className="p406-2col-flex">
                    <div className="p406-form-field flex-2">
                      <label>Solution Used</label>
                      <select value={chemicalSolution} onChange={(e) => setChemicalSolution(e.target.value)}>
                        <option value="">Select solution</option>
                        <option value="Citric Acid 50%">Citric Acid 50%</option>
                        <option value="Peracetic Acid 3.5%">Peracetic Acid 3.5%</option>
                        <option value="Sodium Hypochlorite">Sodium Hypochlorite</option>
                      </select>
                    </div>
                    <div className="p406-form-field flex-1">
                      <label>Contact Time</label>
                      <div className="p406-addon-input">
                        <input type="number" value={chemicalContactTime} onChange={(e) => setChemicalContactTime(e.target.value)} />
                        <span className="p406-unit-addon">min</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p406-2col-flex">
                <div className="p406-form-field flex-1">
                  <label>Rinse Completed</label>
                  <ToggleYesNo value={rinseCompleted} onChange={setRinseCompleted} />
                </div>
                <div className="p406-form-field flex-1">
                  <label>Rinse Time</label>
                  <div className="p406-addon-input">
                    <input type="number" value={rinseTime} onChange={(e) => setRinseTime(e.target.value)} />
                    <span className="p406-unit-addon">min</span>
                  </div>
                </div>
              </div>
              {disinfectionOk ? (
                <div className="p406-success-disinfection-banner">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <span>Disinfection cycle completed successfully.</span>
                </div>
              ) : (
                <div className="during-error" style={{ marginTop: 8 }}>
                  Disinfection incomplete — finish Heat/Chemical (or mark N/A) and Rinse = Yes.
                </div>
              )}
            </div>

            <div className="p406-card">
              <div className="p406-card-title-row"><h2>3. Surface Cleaning</h2></div>
              <div className="p406-checklist-grid">
                {[
                  ['Exterior Surfaces Wiped', exteriorWiped, setExteriorWiped],
                  ['Touch Screen Cleaned', touchscreenCleaned, setTouchscreenCleaned],
                  ['Alarms & Controls Cleaned', controlsCleaned, setControlsCleaned],
                  ['Accessory Trays Cleaned', traysCleaned, setTraysCleaned],
                  ['Chair / Bed Area Cleaned', chairCleaned, setChairCleaned],
                  ['Floor Area Cleaned', floorCleaned, setFloorCleaned],
                ].map(([label, value, setter]) => (
                  <div className="p406-check-row" key={label}>
                    <span className="p406-check-lbl">{label}</span>
                    <ToggleYesNo value={value} onChange={setter} />
                  </div>
                ))}
              </div>
              <div className="p406-form-field" style={{ marginTop: 12 }}>
                <label>Have you cleaned the machine using:</label>
                <div className="p406-checklist-grid">
                  {[
                    ['Sodium Hypochlorite?', sodiumHypochlorite, setSodiumHypochlorite],
                    ['Citric Acid?', citricAcid, setCitricAcid],
                    ['Peracetic Acid?', peraceticAcid, setPeraceticAcid],
                    ['Hydrogen Peroxide?', hydrogenPeroxide, setHydrogenPeroxide],
                  ].map(([label, value, setter]) => (
                    <div className="p406-check-row" key={label}>
                      <span className="p406-check-lbl">{label}</span>
                      <ToggleYesNo value={value} onChange={setter} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p406-form-field">
                <div className="p406-notes-label">
                  <label>Comments</label>
                  <span className="p406-char-count">{surfaceComments.length} / 200</span>
                </div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={surfaceComments} onChange={(e) => setSurfaceComments(e.target.value)} style={{ minHeight: 45 }} />
              </div>
            </div>
          </div>

          <div className="p406-bottom-2col-grid">
            <div className="p406-card">
              <div className="p406-card-title-row"><h2>4. Current Readiness (Part 5)</h2></div>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 0 }}>
                Machine readiness for the next patient is determined automatically in Machine &amp; RO Management.
                This screen documents cleaning only.
              </p>
              <div className="p406-checklist-grid">
                {[
                  ["Today's QC (P5-02)", qc],
                  ['Self-Test (P5-04)', selfTest],
                  ['RO Verification (P5-03)', ro],
                  ['Maintenance (P5-06)', maintenance],
                ].map(([label, entry]) => (
                  <div className="p406-check-row" key={label}>
                    <span className="p406-check-lbl">{label}</span>
                    <strong className={`p406-status-pill ${statusTone(entry.status)}`}>
                      {entry.status}{entry.date ? ` · ${entry.date}` : ''}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="p406-standby-info-box" style={{ marginTop: 12 }}>
                <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <span>Readiness never blocks this cleaning screen — assignment happens in Part 5 once cleaning is recorded.</span>
              </div>
            </div>

            <div className="p406-card p406-card-verification">
              <div className="p406-card-title-row"><h2>5. Technician Verification</h2></div>
              <div className="p406-verification-grid">
                <div className="p406-verification-inputs">
                  <div className="p406-form-field">
                    <label>Verified By</label>
                    <input type="text" value={loggedIn.display} readOnly />
                  </div>
                  <div className="p406-form-field">
                    <label>Verified At</label>
                    <input type="text" value={verifiedAtDefault} readOnly />
                  </div>
                </div>
                <div className="p406-signature-box">
                  <label>Authentication</label>
                  <label className="p406-edu-checkbox" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={authConfirmed}
                      onChange={(e) => {
                        setAuthConfirmed(e.target.checked);
                        updateParentState({ authConfirmed: e.target.checked });
                      }}
                    />
                    <span>
                      <VerifiedUserOutlinedIcon sx={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                      I confirm cleaning documentation as the logged-in technician ({loggedIn.display}).
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p406-right-rail">
          <div className="p406-rail-card">
            <div className="p406-rail-header"><h3>Disinfection Compliance</h3></div>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <strong style={{ fontSize: 36 }}>{compliance.pct}%</strong>
              <div style={{ color: '#64748b' }}>{compliance.done}/{compliance.total || 0} completed</div>
            </div>
          </div>

          <div className="p406-rail-card p406-pending-card">
            <div className="p406-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p406-pending-list">
              <div className="p406-pending-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Dispose bloodlines, dialyzer, tubing, needles</span></div>
              <div className="p406-pending-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Complete heat or chemical disinfection + rinse</span></div>
              <div className="p406-pending-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Wipe exterior, screen, controls, trays, chair, floor</span></div>
              <div className="p406-pending-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Confirm cleaning agent(s) used</span></div>
              {isolation && (
                <div className="p406-pending-row"><WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 16 }} /><span>Isolation supplies only for this patient</span></div>
              )}
              <div className="p406-pending-row"><InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 16 }} /><span>Part 5 decides next-patient readiness</span></div>
            </div>
          </div>
        </div>
      </div>

      <footer className="p406-footer-bar">
        <div className="p406-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p406-footer-right">
          {(formError || apiError) && (
            <div className="during-error" style={{ marginRight: 12 }}>{formError || apiError}</div>
          )}
          <Button type="button" variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            Save &amp; Continue <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
