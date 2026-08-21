import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons for Vitals, Assessment & Rail
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import AccessibleOutlinedIcon from '@mui/icons-material/AccessibleOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import SickOutlinedIcon from '@mui/icons-material/SickOutlined';
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

const SYMPTOMS_LIST = [
  { id: 'dizziness', name: 'Dizziness / Lightheadedness', icon: PsychologyOutlinedIcon },
  { id: 'fatigue', name: 'Fatigue / Weakness', icon: AccessibleOutlinedIcon },
  { id: 'nausea', name: 'Nausea / Vomiting', icon: SickOutlinedIcon },
  { id: 'cramps', name: 'Muscle Cramps', icon: HealingOutlinedIcon },
  { id: 'headache', name: 'Headache', icon: PsychologyOutlinedIcon },
  { id: 'shortness_breath', name: 'Shortness of Breath', icon: AirOutlinedIcon },
];

export default function P403PostDialysisVitals({
  data = {},
  setData,
  session = {},
  readings = [],
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
}) {
  // Extract patient & session metadata
  const p = patient.patient || patient;
  const patientName = p.name || p.patient_name || (p.id ? `Patient #${p.id}` : '—');
  const pid = p.patient_code || p.patientCode || p.pid || p.patient_id || (p.id ? `P${p.id}` : '—');
  const rawGender = p.gender || p.sex;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || '—');
  const ageVal = p.age ? String(p.age) : '—';
  const ageGender = ageVal !== '—' && gender !== '—' ? `${ageVal} Years, ${gender}` : (ageVal !== '—' ? `${ageVal} Years` : gender);
  const bloodGroup = p.bloodGroup || p.blood_group || '—';
  const accessDetail = p.vascular_access || p.access || session.access || '—';
  const nephrologist = p.primary_doctor_name || p.nephrologist || session.nephrologist || p.doctor_name || '—';

  const startTimeStr = session.started_at || session.start_time || '07:45 AM';
  const endTimeStr = session.endTime || '11:20 AM';
  const durationStr = session.treatmentDuration || '03:35 hr';
  const ufRemovedStr = session.totalUfRemoved ? `${session.totalUfRemoved} L` : '1.65 L';
  const dryWeightStr = patient.dryWeight ? `${patient.dryWeight} kg` : '67.0 kg';

  // Section 1: Vital Signs Form States
  const [systolic, setSystolic] = useState(data.systolic || '124');
  const [diastolic, setDiastolic] = useState(data.diastolic || '78');
  const [pulse, setPulse] = useState(data.pulse || '82');
  const [rr, setRr] = useState(data.rr || '18');
  const [spo2, setSpo2] = useState(data.spo2 || '98');
  const [accessSitePain, setAccessSitePain] = useState(data.accessSitePain || 'No');

  // MAP Auto-Calculation
  const calculatedMap = (() => {
    const sysNum = parseFloat(systolic);
    const diaNum = parseFloat(diastolic);
    if (!isNaN(sysNum) && !isNaN(diaNum)) {
      return Math.round((sysNum + 2 * diaNum) / 3);
    }
    return 93;
  })();

  // Section 2: Weight States
  const preWeight = data.preWeight || '66.8';
  const [postWeight, setPostWeight] = useState(data.postWeight || '65.3');
  const ufGoal = session.ufGoal ? parseFloat(session.ufGoal) : 1.6;

  const netUfRemoved = (() => {
    const preNum = parseFloat(preWeight);
    const postNum = parseFloat(postWeight);
    if (!isNaN(preNum) && !isNaN(postNum)) {
      return (preNum - postNum).toFixed(1);
    }
    return '1.5';
  })();

  const ufVarianceObj = (() => {
    const netNum = parseFloat(netUfRemoved);
    if (!isNaN(netNum) && ufGoal > 0) {
      const diff = (netNum - ufGoal).toFixed(1);
      const pct = Math.round(((netNum - ufGoal) / ufGoal) * 100);
      return { diff: diff > 0 ? `+${diff}` : diff, pct: pct > 0 ? `+${pct}` : pct };
    }
    return { diff: '-0.1', pct: '-6' };
  })();

  // Section 3: Patient Symptoms State
  const [symptoms, setSymptoms] = useState(() => {
    if (data.symptoms && Object.keys(data.symptoms).length > 0) return data.symptoms;
    const initial = {};
    SYMPTOMS_LIST.forEach((s) => {
      initial[s.name] = 'No';
    });
    return initial;
  });

  // Section 4: Clinical Assessment States
  const [consciousness, setConsciousness] = useState(data.consciousness || 'Alert');
  const [orientation, setOrientation] = useState(data.orientation || 'Oriented');
  const [ambulation, setAmbulation] = useState(data.ambulation || 'Independent');
  const [tolerance, setTolerance] = useState(data.tolerance || 'Good');
  const [condition, setCondition] = useState(data.condition || 'Stable');
  const [vitalsNotes, setVitalsNotes] = useState(data.vitalsNotes || '');

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleSymptomToggle = (symptomName, value) => {
    setSymptoms((prev) => {
      const next = { ...prev, [symptomName]: value };
      updateParentState({ symptoms: next });
      return next;
    });
  };

  const isReadyForDischarge =
    condition === 'Stable' && ambulation !== 'Unable' && parseFloat(systolic) >= 90;

  const handleFormSubmit = () => {
    const payload = {
      systolic,
      diastolic,
      pulse,
      rr,
      spo2,
      map: calculatedMap.toString(),
      accessSitePain,
      preWeight,
      postWeight,
      netUfRemoved,
      ufGoal: ufGoal.toString(),
      ufVariance: `${ufVarianceObj.diff} kg (${ufVarianceObj.pct}%)`,
      symptoms,
      consciousness,
      orientation,
      ambulation,
      tolerance,
      condition,
      isReadyForDischarge,
      vitalsNotes,
    };

    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  return (
    <div className="p403-page-wrapper">
      {/* Top Header Bar */}
      <header className="p403-top-bar">
        <div className="p403-top-bar-left">
          <h1>P4-03 – Post Dialysis Vitals &amp; Assessment</h1>
          <p>Assess patient's clinical status after dialysis and ensure stability before discharge.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p403-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 3;
          const isCompleted = s.step < 3;
          return (
            <React.Fragment key={s.step}>
              <div className={`p403-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p403-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p403-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p403-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner (6 Stat Boxes) */}
      <div className="p403-patient-header-banner">
        <div className="p403-patient-left">
          <div className="p403-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p403-patient-bio">
            <div className="p403-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p403-pill-active">Active</span>
            </div>
            <div className="p403-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p403-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p403-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p403-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p403-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 6 Stat Boxes */}
        <div className="p403-patient-stats">
          <div className="p403-stat-box">
            <CalendarTodayOutlinedIcon className="p403-stat-icon" />
            <span className="p403-stat-lbl">Treatment Start</span>
            <strong className="p403-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p403-stat-box">
            <AccessTimeOutlinedIcon className="p403-stat-icon" />
            <span className="p403-stat-lbl">Treatment End</span>
            <strong className="p403-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p403-stat-box">
            <AccessTimeOutlinedIcon className="p403-stat-icon" />
            <span className="p403-stat-lbl">Duration</span>
            <strong className="p403-stat-val">{durationStr}</strong>
          </div>

          <div className="p403-stat-box">
            <WaterDropOutlinedIcon className="p403-stat-icon" />
            <span className="p403-stat-lbl">UF Removed</span>
            <strong className="p403-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p403-stat-box">
            <ScaleOutlinedIcon className="p403-stat-icon" />
            <span className="p403-stat-lbl">Dry Weight</span>
            <strong className="p403-stat-val">{dryWeightStr}</strong>
          </div>

          <div className="p403-stat-box">
            <ScaleOutlinedIcon className="p403-stat-icon" />
            <span className="p403-stat-lbl">Post Weight</span>
            <strong className="p403-stat-val">{postWeight} kg</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p403-workspace-grid">
        {/* Left Form Column */}
        <div className="p403-main-form-column">
          {/* Section 1: 1. Post Dialysis Vital Signs (6 Cards Grid) */}
          <div className="p403-card">
            <div className="p403-card-title-row">
              <h2>1. Post Dialysis Vital Signs</h2>
            </div>

            <div className="p403-vitals-grid">
              {/* Card 1: Blood Pressure */}
              <div className="p403-vital-card">
                <div className="p403-vital-card-head">
                  <MonitorHeartOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                  <span>Blood Pressure (mmHg)</span>
                </div>
                <div className="p403-vital-value">
                  {systolic} / {diastolic}
                </div>
                <div className="p403-vital-card-foot">
                  <span>90/60 - 140/90</span>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                </div>
              </div>

              {/* Card 2: Heart Rate */}
              <div className="p403-vital-card">
                <div className="p403-vital-card-head">
                  <FavoriteBorderOutlinedIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  <span>Heart Rate (bpm)</span>
                </div>
                <div className="p403-vital-value">{pulse}</div>
                <div className="p403-vital-card-foot">
                  <span>60 - 100</span>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                </div>
              </div>

              {/* Card 3: Respiratory Rate */}
              <div className="p403-vital-card">
                <div className="p403-vital-card-head">
                  <AirOutlinedIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                  <span>Respiratory Rate (rpm)</span>
                </div>
                <div className="p403-vital-value">{rr}</div>
                <div className="p403-vital-card-foot">
                  <span>12 - 20</span>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                </div>
              </div>

              {/* Card 4: SpO2 */}
              <div className="p403-vital-card">
                <div className="p403-vital-card-head">
                  <WaterDropOutlinedIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                  <span>SpO₂ (%)</span>
                </div>
                <div className="p403-vital-value">{spo2}</div>
                <div className="p403-vital-card-foot">
                  <span>95 - 100</span>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                </div>
              </div>

              {/* Card 5: MAP */}
              <div className="p403-vital-card">
                <div className="p403-vital-card-head">
                  <SpeedOutlinedIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                  <span>MAP (mmHg)</span>
                </div>
                <div className="p403-vital-value">{calculatedMap}</div>
                <div className="p403-vital-card-foot">
                  <span>65 - 105</span>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                </div>
              </div>

              {/* Card 6: Access Site Pain */}
              <div className="p403-vital-card">
                <div className="p403-vital-card-head">
                  <AdjustOutlinedIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                  <span>Access Site Pain</span>
                </div>
                <div className="p403-vital-value">{accessSitePain}</div>
                <div className="p403-vital-card-foot">
                  <span>Yes / No</span>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 & 3 Side-by-Side Grid (Weight & Patient Symptoms) */}
          <div className="p403-row-weight-symptoms">
            {/* Card 2: 2. Weight */}
            <div className="p403-card p403-card-weight">
              <div className="p403-card-title-row">
                <h2>2. Weight</h2>
              </div>

              <div className="p403-weight-grid-2col">
                <div className="p403-weight-field">
                  <label>Pre-Dialysis Weight</label>
                  <div className="p403-weight-display">{preWeight} kg</div>
                </div>

                <div className="p403-weight-field">
                  <label>Post-Dialysis Weight</label>
                  <input
                    type="text"
                    className="p403-post-weight-input"
                    value={postWeight}
                    onChange={(e) => {
                      setPostWeight(e.target.value);
                      updateParentState({ postWeight: e.target.value });
                    }}
                  />
                </div>

                <div className="p403-weight-field">
                  <label>Net UF Removed</label>
                  <div className="p403-weight-display">{netUfRemoved} kg</div>
                </div>

                <div className="p403-weight-field">
                  <label>UF Goal</label>
                  <div className="p403-weight-display">{ufGoal} kg</div>
                </div>
              </div>

              {/* Blue UF Variance Pill Banner */}
              <div className="p403-uf-variance-banner">
                <span>UF Variance: <strong>{ufVarianceObj.diff} kg ({ufVarianceObj.pct}%)</strong></span>
              </div>
            </div>

            {/* Card 3: 3. Patient Symptoms */}
            <div className="p403-card p403-card-symptoms">
              <div className="p403-card-title-row">
                <h2>3. Patient Symptoms</h2>
              </div>

              <div className="p403-symptoms-grid">
                {SYMPTOMS_LIST.map((symptom) => {
                  const IconComp = symptom.icon;
                  const currentVal = symptoms[symptom.name] || 'No';
                  return (
                    <div key={symptom.id} className="p403-symptom-tile">
                      <div className="p403-symptom-head">
                        <IconComp sx={{ color: '#8b5cf6', fontSize: 18 }} />
                        <span>{symptom.name}</span>
                      </div>
                      <div className="p403-symptom-pills">
                        {['Yes', 'No', 'Mild'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`p403-sym-pill ${currentVal === opt ? (opt === 'No' ? 'active-no' : 'active-yes') : ''}`}
                            onClick={() => handleSymptomToggle(symptom.name, opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: 4. Clinical Assessment */}
          <div className="p403-card">
            <div className="p403-card-title-row">
              <h2>4. Clinical Assessment</h2>
            </div>

            <div className="p403-assessment-form-grid">
              {/* Field 1: Consciousness */}
              <div className="p403-form-field">
                <label>Consciousness</label>
                <select
                  value={consciousness}
                  onChange={(e) => {
                    setConsciousness(e.target.value);
                    updateParentState({ consciousness: e.target.value });
                  }}
                >
                  {['Alert', 'Oriented', 'Confused', 'Lethargic', 'Unresponsive'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 2: Orientation */}
              <div className="p403-form-field">
                <label>Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => {
                    setOrientation(e.target.value);
                    updateParentState({ orientation: e.target.value });
                  }}
                >
                  {['Oriented', 'Partially Oriented', 'Disoriented'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Ambulation */}
              <div className="p403-form-field p403-full-col">
                <label>Ambulation</label>
                <div className="p403-toggle-pills">
                  {['Independent', 'Assisted', 'Unable'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`p401-pill-btn ${ambulation === opt ? (opt === 'Independent' ? 'active' : 'active-early') : ''}`}
                      onClick={() => {
                        setAmbulation(opt);
                        updateParentState({ ambulation: opt });
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Tolerance to Activity */}
              <div className="p403-form-field">
                <label>Tolerance to Activity</label>
                <select
                  value={tolerance}
                  onChange={(e) => {
                    setTolerance(e.target.value);
                    updateParentState({ tolerance: e.target.value });
                  }}
                >
                  {['Good', 'Fair', 'Poor', 'Not Assessed'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 5: Overall Condition */}
              <div className="p403-form-field p403-full-col">
                <label>Overall Condition</label>
                <div className="p403-toggle-pills">
                  {['Stable', 'Fair', 'Unstable'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`p401-pill-btn ${condition === opt ? (opt === 'Stable' ? 'active' : 'active-early') : ''}`}
                      onClick={() => {
                        setCondition(opt);
                        updateParentState({ condition: opt });
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Discharge Readiness Banner Box */}
            <div className={`p403-readiness-box ${isReadyForDischarge ? 'ready' : 'warning'}`}>
              <div className="p403-readiness-icon-wrap">
                {isReadyForDischarge ? (
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                ) : (
                  <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 22 }} />
                )}
              </div>
              <strong className="p403-readiness-title">
                {isReadyForDischarge ? 'Ready for Discharge' : 'Review required before discharge.'}
              </strong>
            </div>

            {/* Notes / Remarks */}
            <div className="p403-notes-section">
              <div className="p403-notes-label">
                <label>Notes / Remarks</label>
                <span className="p403-char-count">{vitalsNotes.length} / 300</span>
              </div>
              <Textarea
                maxLength={300}
                placeholder="Enter any additional notes..."
                value={vitalsNotes}
                onChange={(e) => {
                  setVitalsNotes(e.target.value);
                  updateParentState({ vitalsNotes: e.target.value });
                }}
                style={{ minHeight: 70 }}
              />
            </div>
          </div>
        </div>

        {/* Right Rail Column (4 Stacked Cards) */}
        <div className="p403-right-rail">
          {/* Card 1: Vital Trends (Last 3 Sessions) */}
          <div className="p403-rail-card">
            <div className="p403-rail-header">
              <h3>Vital Trends (Last 3 Sessions)</h3>
              <a href="#view-all" className="p403-link-sm" onClick={(e) => e.preventDefault()}>View All</a>
            </div>

            <div className="p403-trends-table-wrap">
              <table className="p403-trends-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>22 May</th>
                    <th>24 May</th>
                    <th>26 May</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>BP (mmHg)</td>
                    <td>128/76</td>
                    <td>126/78</td>
                    <td>124/78</td>
                  </tr>
                  <tr>
                    <td>HR (bpm)</td>
                    <td>80</td>
                    <td>84</td>
                    <td>82</td>
                  </tr>
                  <tr>
                    <td>Weight (kg)</td>
                    <td>66.5</td>
                    <td>66.2</td>
                    <td>65.3</td>
                  </tr>
                  <tr>
                    <td>UF Removed (L)</td>
                    <td>1.6</td>
                    <td>1.7</td>
                    <td>1.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Safety Checklist */}
          <div className="p403-rail-card">
            <div className="p403-rail-header">
              <h3>Safety Checklist</h3>
            </div>
            <div className="p403-safety-list">
              <div className="p403-safety-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Vitals within acceptable range</span>
              </div>
              <div className="p403-safety-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>No active bleeding</span>
              </div>
              <div className="p403-safety-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Patient able to ambulate</span>
              </div>
              <div className="p403-safety-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>No severe symptoms reported</span>
              </div>
              <div className="p403-safety-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Patient education provided</span>
              </div>
            </div>
            <div className="p403-safety-foot">
              <span>All checks completed</span>
            </div>
          </div>

          {/* Card 3: Key Reminders (Gold Tinted) */}
          <div className="p403-rail-card p403-reminders-card">
            <div className="p403-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p403-reminders-checklist">
              <div className="p403-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Ensure patient remains hydrated as advised</span>
              </div>
              <div className="p403-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Monitor access site for bleeding</span>
              </div>
              <div className="p403-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Report any abnormal symptoms</span>
              </div>
              <div className="p403-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Next dialysis on: <strong>28 May 2025 (Wed)</strong></span>
              </div>
            </div>
          </div>

          {/* Card 4: Quick Actions */}
          <div className="p403-rail-card">
            <div className="p403-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p403-quick-actions-flex">
              <button type="button" className="p403-action-btn">
                <NoteAltOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Add Note</span>
              </button>
              <button type="button" className="p403-action-btn">
                <ShowChartOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Trends</span>
              </button>
              <button type="button" className="p403-action-btn">
                <AutorenewOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Update Care Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p403-footer-bar">
        <div className="p403-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p403-footer-right">
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
