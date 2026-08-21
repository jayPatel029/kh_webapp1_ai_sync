import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';

const LOCK_SOLUTION_OPTIONS = [
  'Heparin (1000 units/mL)',
  'Heparin (5000 units/mL)',
  'Citrate (4%)',
  'Citrate (30%)',
  'Saline 0.9%',
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

export default function P402VascularAccessHemostasis({
  data = {},
  setData,
  session = {},
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
}) {
  // Extract patient & session details
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
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const bedStr = session.bed || patient.bed || 'B-02';

  // Access Type state (AVF/AVG vs CVC)
  const [accessType, setAccessType] = useState(() => {
    if (data.accessType) return data.accessType;
    if (accessDetail.toLowerCase().includes('cvc') || accessDetail.toLowerCase().includes('catheter')) return 'CVC';
    return 'AVF/AVG';
  });

  // AVF/AVG Form States
  const [arterialNeedleRemoved, setArterialNeedleRemoved] = useState(data.arterialNeedleRemoved || 'Yes');
  const [arterialTimeRemoved, setArterialTimeRemoved] = useState(data.arterialTimeRemoved || '11:18 AM');
  const [arterialBleedDuration, setArterialBleedDuration] = useState(data.arterialBleedDuration || '5');
  const [arterialHemostasis, setArterialHemostasis] = useState(data.arterialHemostasis || 'Yes');
  const [arterialDressing, setArterialDressing] = useState(data.arterialDressing || 'Yes');

  const [venousNeedleRemoved, setVenousNeedleRemoved] = useState(data.venousNeedleRemoved || 'Yes');
  const [venousTimeRemoved, setVenousTimeRemoved] = useState(data.venousTimeRemoved || '11:19 AM');
  const [venousBleedDuration, setVenousBleedDuration] = useState(data.venousBleedDuration || '4');
  const [venousHemostasis, setVenousHemostasis] = useState(data.venousHemostasis || 'Yes');
  const [venousDressing, setVenousDressing] = useState(data.venousDressing || 'Yes');

  const [thrill, setThrill] = useState(data.thrill || 'Present');
  const [bruit, setBruit] = useState(data.bruit || 'Present');
  const [swelling, setSwelling] = useState(data.swelling || 'No');
  const [redness, setRedness] = useState(data.redness || 'No');
  const [painTenderness, setPainTenderness] = useState(data.painTenderness || 'No');
  const [avfComments, setAvfComments] = useState(data.avfComments || '');

  // CVC Form States
  const [catheterFlushed, setCatheterFlushed] = useState(data.catheterFlushed || 'Yes');
  const [lockSolution, setLockSolution] = useState(data.lockSolution || 'Heparin (1000 units/mL)');
  const [volumeInstilled, setVolumeInstilled] = useState(data.volumeInstilled || '1.8');
  const [catheterClamped, setCatheterClamped] = useState(data.catheterClamped || 'Yes');
  const [dressingIntegrity, setDressingIntegrity] = useState(data.dressingIntegrity || 'Intact');
  const [exitSiteCondition, setExitSiteCondition] = useState(data.exitSiteCondition || 'Clean');
  const [exitSiteCleaned, setExitSiteCleaned] = useState(data.exitSiteCleaned || 'Yes');
  const [antimicrobialDressing, setAntimicrobialDressing] = useState(data.antimicrobialDressing || 'Yes');
  const [cvcComments, setCvcComments] = useState(data.cvcComments || '');

  // Photo State
  const [photoAdded, setPhotoAdded] = useState(data.photoAdded || false);

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleSaveContinue = () => {
    const payload = {
      accessType,
      // AVF/AVG
      arterialNeedleRemoved,
      arterialTimeRemoved,
      arterialBleedDuration,
      arterialHemostasis,
      arterialDressing,
      venousNeedleRemoved,
      venousTimeRemoved,
      venousBleedDuration,
      venousHemostasis,
      venousDressing,
      thrill,
      bruit,
      swelling,
      redness,
      painTenderness,
      avfComments,
      // CVC
      catheterFlushed,
      lockSolution,
      volumeInstilled,
      catheterClamped,
      dressingIntegrity,
      exitSiteCondition,
      exitSiteCleaned,
      antimicrobialDressing,
      cvcComments,
      photoAdded,
    };

    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  const isAvfHemostasisSuccess =
    accessType === 'AVF/AVG' && arterialHemostasis === 'Yes' && venousHemostasis === 'Yes';

  return (
    <div className="p402-page-wrapper">
      {/* Page Header (Top-Right controls removed per directive) */}
      <header className="p402-top-bar">
        <div className="p402-top-bar-left">
          <h1>P4-02 – Vascular Access Hemostasis</h1>
          <p>Achieve hemostasis and ensure access site is stable.</p>
        </div>
      </header>

      {/* 10-Step Stepper Bar */}
      <nav className="p402-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 2;
          const isCompleted = s.step < 2;
          return (
            <React.Fragment key={s.step}>
              <div className={`p402-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p402-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p402-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p402-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p402-patient-header-banner">
        <div className="p402-patient-left">
          <div className="p402-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p402-patient-bio">
            <div className="p402-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p402-pill-active">Active</span>
            </div>
            <div className="p402-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p402-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p402-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p402-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p402-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes on Right */}
        <div className="p402-patient-stats">
          <div className="p402-stat-box">
            <CalendarTodayOutlinedIcon className="p402-stat-icon" />
            <span className="p402-stat-lbl">Treatment Start</span>
            <strong className="p402-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p402-stat-box">
            <AccessTimeOutlinedIcon className="p402-stat-icon" />
            <span className="p402-stat-lbl">Treatment End</span>
            <strong className="p402-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p402-stat-box">
            <AccessTimeOutlinedIcon className="p402-stat-icon" />
            <span className="p402-stat-lbl">Duration</span>
            <strong className="p402-stat-val">{durationStr}</strong>
          </div>

          <div className="p402-stat-box">
            <WaterDropOutlinedIcon className="p402-stat-icon" />
            <span className="p402-stat-lbl">UF Removed</span>
            <strong className="p402-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p402-stat-box">
            <HotelOutlinedIcon className="p402-stat-icon" />
            <span className="p402-stat-lbl">Bed</span>
            <strong className="p402-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p402-workspace-grid">
        {/* Left Column Content */}
        <div className="p402-main-form-column">
          {/* Card 1: 1. Access Type Selector */}
          <div className="p402-card">
            <div className="p402-card-title-row">
              <h2>1. Access Type</h2>
            </div>
            <div className="p402-access-selector">
              <button
                type="button"
                className={`p402-access-option ${accessType === 'AVF/AVG' ? 'active' : ''}`}
                onClick={() => {
                  setAccessType('AVF/AVG');
                  updateParentState({ accessType: 'AVF/AVG' });
                }}
              >
                <div className="p402-option-icon">
                  <HealingOutlinedIcon sx={{ color: accessType === 'AVF/AVG' ? '#15803d' : '#64748b' }} />
                </div>
                <strong>AV Fistula / AVG</strong>
                <div className="p402-option-radio">
                  {accessType === 'AVF/AVG' ? (
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  ) : (
                    <span className="p402-radio-empty" />
                  )}
                </div>
              </button>

              <button
                type="button"
                className={`p402-access-option ${accessType === 'CVC' ? 'active' : ''}`}
                onClick={() => {
                  setAccessType('CVC');
                  updateParentState({ accessType: 'CVC' });
                }}
              >
                <div className="p402-option-icon">
                  <VaccinesOutlinedIcon sx={{ color: accessType === 'CVC' ? '#15803d' : '#64748b' }} />
                </div>
                <strong>Central Venous Catheter (CVC)</strong>
                <div className="p402-option-radio">
                  {accessType === 'CVC' ? (
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  ) : (
                    <span className="p402-radio-empty" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* EXCLUSIVE BRANCH 2A: AV Fistula / AVG – Needle Removal & Hemostasis */}
          {accessType === 'AVF/AVG' && (
            <div className="p402-card">
              <div className="p402-card-title-row">
                <h2>2A. AV Fistula / AVG – Needle Removal &amp; Hemostasis</h2>
              </div>

              {/* 3 Sub-Panels Side-by-Side */}
              <div className="p402-subpanel-grid">
                {/* Sub-Panel 1: Arterial Site */}
                <div className="p402-subpanel">
                  <h3>Arterial Site</h3>

                  <div className="p402-form-field">
                    <label>Needle Removed</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${arterialNeedleRemoved === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setArterialNeedleRemoved('Yes');
                          updateParentState({ arterialNeedleRemoved: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${arterialNeedleRemoved === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setArterialNeedleRemoved('No');
                          updateParentState({ arterialNeedleRemoved: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Time Removed</label>
                    <div className="p402-input-icon-wrap">
                      <input
                        type="text"
                        value={arterialTimeRemoved}
                        onChange={(e) => {
                          setArterialTimeRemoved(e.target.value);
                          updateParentState({ arterialTimeRemoved: e.target.value });
                        }}
                      />
                      <AccessTimeOutlinedIcon className="p402-field-icon" />
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Bleeding Duration</label>
                    <div className="p402-addon-input">
                      <input
                        type="text"
                        value={arterialBleedDuration}
                        onChange={(e) => {
                          setArterialBleedDuration(e.target.value);
                          updateParentState({ arterialBleedDuration: e.target.value });
                        }}
                      />
                      <span className="p402-unit-addon">min</span>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Hemostasis Achieved</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${arterialHemostasis === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setArterialHemostasis('Yes');
                          updateParentState({ arterialHemostasis: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${arterialHemostasis === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setArterialHemostasis('No');
                          updateParentState({ arterialHemostasis: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Dressing Applied</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${arterialDressing === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setArterialDressing('Yes');
                          updateParentState({ arterialDressing: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${arterialDressing === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setArterialDressing('No');
                          updateParentState({ arterialDressing: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-Panel 2: Venous Site */}
                <div className="p402-subpanel">
                  <h3>Venous Site</h3>

                  <div className="p402-form-field">
                    <label>Needle Removed</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${venousNeedleRemoved === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setVenousNeedleRemoved('Yes');
                          updateParentState({ venousNeedleRemoved: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${venousNeedleRemoved === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setVenousNeedleRemoved('No');
                          updateParentState({ venousNeedleRemoved: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Time Removed</label>
                    <div className="p402-input-icon-wrap">
                      <input
                        type="text"
                        value={venousTimeRemoved}
                        onChange={(e) => {
                          setVenousTimeRemoved(e.target.value);
                          updateParentState({ venousTimeRemoved: e.target.value });
                        }}
                      />
                      <AccessTimeOutlinedIcon className="p402-field-icon" />
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Bleeding Duration</label>
                    <div className="p402-addon-input">
                      <input
                        type="text"
                        value={venousBleedDuration}
                        onChange={(e) => {
                          setVenousBleedDuration(e.target.value);
                          updateParentState({ venousBleedDuration: e.target.value });
                        }}
                      />
                      <span className="p402-unit-addon">min</span>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Hemostasis Achieved</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${venousHemostasis === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setVenousHemostasis('Yes');
                          updateParentState({ venousHemostasis: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${venousHemostasis === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setVenousHemostasis('No');
                          updateParentState({ venousHemostasis: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Dressing Applied</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${venousDressing === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setVenousDressing('Yes');
                          updateParentState({ venousDressing: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${venousDressing === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setVenousDressing('No');
                          updateParentState({ venousDressing: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-Panel 3: Access Assessment */}
                <div className="p402-subpanel">
                  <h3>Access Assessment</h3>

                  <div className="p402-form-field">
                    <label>Thrill Present</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${thrill === 'Present' ? 'active' : ''}`}
                        onClick={() => {
                          setThrill('Present');
                          updateParentState({ thrill: 'Present' });
                        }}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${thrill === 'Absent' ? 'active-no' : ''}`}
                        onClick={() => {
                          setThrill('Absent');
                          updateParentState({ thrill: 'Absent' });
                        }}
                      >
                        Absent
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Bruit Present</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${bruit === 'Present' ? 'active' : ''}`}
                        onClick={() => {
                          setBruit('Present');
                          updateParentState({ bruit: 'Present' });
                        }}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${bruit === 'Absent' ? 'active-no' : ''}`}
                        onClick={() => {
                          setBruit('Absent');
                          updateParentState({ bruit: 'Absent' });
                        }}
                      >
                        Absent
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Swelling</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${swelling === 'Yes' ? 'active-early' : ''}`}
                        onClick={() => {
                          setSwelling('Yes');
                          updateParentState({ swelling: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${swelling === 'No' ? 'active' : ''}`}
                        onClick={() => {
                          setSwelling('No');
                          updateParentState({ swelling: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Redness</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${redness === 'Yes' ? 'active-early' : ''}`}
                        onClick={() => {
                          setRedness('Yes');
                          updateParentState({ redness: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${redness === 'No' ? 'active' : ''}`}
                        onClick={() => {
                          setRedness('No');
                          updateParentState({ redness: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Pain / Tenderness</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${painTenderness === 'Yes' ? 'active-early' : ''}`}
                        onClick={() => {
                          setPainTenderness('Yes');
                          updateParentState({ painTenderness: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${painTenderness === 'No' ? 'active' : ''}`}
                        onClick={() => {
                          setPainTenderness('No');
                          updateParentState({ painTenderness: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <div className="p402-comments-label">
                      <label>Comments</label>
                      <span className="p402-char-count">{avfComments.length} / 200</span>
                    </div>
                    <Textarea
                      maxLength={200}
                      placeholder="Enter comments..."
                      value={avfComments}
                      onChange={(e) => {
                        setAvfComments(e.target.value);
                        updateParentState({ avfComments: e.target.value });
                      }}
                      style={{ minHeight: 60 }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Green Success Banner for AVF */}
              {isAvfHemostasisSuccess && (
                <div className="p402-success-banner-card">
                  <div className="p402-success-banner-left">
                    <div className="p402-success-icon-wrap">
                      <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                    </div>
                    <div className="p402-success-text">
                      <strong>Hemostasis achieved successfully</strong>
                      <span>Both sites are stable.</span>
                    </div>
                  </div>
                  <div className="p402-success-graphic">
                    <svg viewBox="0 0 54 36" width="50" height="32" fill="none">
                      <path d="M6 18 Q16 10, 28 18 T48 18" stroke="#16a34a" strokeWidth="2.5" fill="none" />
                      <circle cx="16" cy="14" r="3" fill="#16a34a" />
                      <circle cx="36" cy="22" r="3" fill="#16a34a" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXCLUSIVE BRANCH 2B: CVC – Catheter Disconnection */}
          {accessType === 'CVC' && (
            <div className="p402-card">
              <div className="p402-card-title-row">
                <h2>2B. CVC – Catheter Disconnection</h2>
              </div>

              <div className="p402-cvc-wrapper">
                {/* Form fields grid */}
                <div className="p402-cvc-form-grid">
                  <div className="p402-form-field">
                    <label>Catheter Flushed</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${catheterFlushed === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setCatheterFlushed('Yes');
                          updateParentState({ catheterFlushed: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${catheterFlushed === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setCatheterFlushed('No');
                          updateParentState({ catheterFlushed: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Lock Solution Used</label>
                    <select
                      value={lockSolution}
                      onChange={(e) => {
                        setLockSolution(e.target.value);
                        updateParentState({ lockSolution: e.target.value });
                      }}
                    >
                      {LOCK_SOLUTION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p402-form-field">
                    <label>Volume Instilled</label>
                    <div className="p402-addon-input">
                      <input
                        type="text"
                        value={volumeInstilled}
                        onChange={(e) => {
                          setVolumeInstilled(e.target.value);
                          updateParentState({ volumeInstilled: e.target.value });
                        }}
                      />
                      <span className="p402-unit-addon">mL</span>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Catheter Clamped</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${catheterClamped === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setCatheterClamped('Yes');
                          updateParentState({ catheterClamped: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${catheterClamped === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setCatheterClamped('No');
                          updateParentState({ catheterClamped: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Dressing Integrity</label>
                    <div className="p402-toggle-pills">
                      {['Intact', 'Loose', 'Damaged'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`p401-pill-btn ${dressingIntegrity === opt ? 'active' : ''}`}
                          onClick={() => {
                            setDressingIntegrity(opt);
                            updateParentState({ dressingIntegrity: opt });
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Exit Site Condition</label>
                    <div className="p402-toggle-pills">
                      {['Clean', 'Redness', 'Swelling', 'Discharge'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`p401-pill-btn ${exitSiteCondition === opt ? (opt === 'Clean' ? 'active' : 'active-early') : ''}`}
                          onClick={() => {
                            setExitSiteCondition(opt);
                            updateParentState({ exitSiteCondition: opt });
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Exit Site Cleaned</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${exitSiteCleaned === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setExitSiteCleaned('Yes');
                          updateParentState({ exitSiteCleaned: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${exitSiteCleaned === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setExitSiteCleaned('No');
                          updateParentState({ exitSiteCleaned: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field">
                    <label>Antimicrobial Dressing Applied</label>
                    <div className="p402-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${antimicrobialDressing === 'Yes' ? 'active' : ''}`}
                        onClick={() => {
                          setAntimicrobialDressing('Yes');
                          updateParentState({ antimicrobialDressing: 'Yes' });
                        }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${antimicrobialDressing === 'No' ? 'active-no' : ''}`}
                        onClick={() => {
                          setAntimicrobialDressing('No');
                          updateParentState({ antimicrobialDressing: 'No' });
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p402-form-field p402-full-width">
                    <div className="p402-comments-label">
                      <label>Comments</label>
                      <span className="p402-char-count">{cvcComments.length} / 200</span>
                    </div>
                    <Textarea
                      maxLength={200}
                      placeholder="Enter comments..."
                      value={cvcComments}
                      onChange={(e) => {
                        setCvcComments(e.target.value);
                        updateParentState({ cvcComments: e.target.value });
                      }}
                      style={{ minHeight: 60 }}
                    />
                  </div>
                </div>

                {/* Right Helper CVC Care Box */}
                <div className="p402-cvc-care-box">
                  <h3>CVC Care</h3>
                  <div className="p402-cvc-illustration">
                    <svg viewBox="0 0 160 80" width="100%" height="80" fill="none">
                      <path d="M10 40 Q40 10, 80 40 T150 40" stroke="#2563eb" strokeWidth="3" fill="none" />
                      <rect x="70" y="32" width="20" height="16" rx="4" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
                      <circle cx="140" cy="40" r="6" fill="#ef4444" />
                    </svg>
                  </div>
                  <ol className="p402-cvc-steps">
                    <li>1. Flush catheter</li>
                    <li>2. Lock with prescribed solution</li>
                    <li>3. Clamp securely</li>
                    <li>4. Apply sterile dressing</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Rail Column (4 Stacked Cards) */}
        <div className="p402-right-rail">
          {/* Card 1: Hemostasis Summary */}
          <div className="p402-rail-card p402-summary-card">
            <div className="p402-summary-head">
              <div className="p402-summary-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
              </div>
              <div className="p402-summary-text">
                <strong>Hemostasis Achieved</strong>
                <span>Access site is stable.</span>
              </div>
            </div>
            <div className="p402-summary-time">
              <span>Time</span>
              <strong>11:20 AM</strong>
            </div>
          </div>

          {/* Card 2: Access Site Photo (Optional) */}
          <div className="p402-rail-card">
            <div className="p402-rail-header">
              <h3>Access Site Photo (Optional)</h3>
            </div>
            <div className="p402-photo-box">
              <button
                type="button"
                className="p402-photo-btn"
                onClick={() => setPhotoAdded((prev) => !prev)}
              >
                <AddAPhotoOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                <span>{photoAdded ? 'Photo Added (Click to change)' : 'Add photo'}</span>
              </button>
              <span className="p402-photo-hint">JPG, PNG up to 5MB</span>
            </div>
          </div>

          {/* Card 3: Bleeding Duration Summary */}
          <div className="p402-rail-card">
            <div className="p402-rail-header">
              <h3>Bleeding Duration Summary</h3>
            </div>
            <div className="p402-bleed-list">
              <div className="p402-bleed-row">
                <span className="p402-bleed-site">
                  <FiberManualRecordIcon sx={{ fontSize: 12, color: '#ef4444' }} /> Arterial Site
                </span>
                <strong className="p402-bleed-val">{arterialBleedDuration} min</strong>
              </div>
              <div className="p402-bleed-row">
                <span className="p402-bleed-site">
                  <FiberManualRecordIcon sx={{ fontSize: 12, color: '#2563eb' }} /> Venous Site
                </span>
                <strong className="p402-bleed-val">{venousBleedDuration} min</strong>
              </div>
            </div>
          </div>

          {/* Card 4: Key Reminders (Gold Tinted) */}
          <div className="p402-rail-card p402-reminders-card">
            <div className="p402-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p402-reminders-checklist">
              <div className="p402-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Ensure hemostasis before discharge</span>
              </div>
              <div className="p402-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Monitor access site for bleeding</span>
              </div>
              <div className="p402-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Check for thrill and bruit</span>
              </div>
              <div className="p402-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Report any complications</span>
              </div>
              <div className="p402-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Educate patient on care at home</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p402-footer-bar">
        <div className="p402-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p402-footer-right">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleSaveContinue}>
            Save &amp; Continue <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
