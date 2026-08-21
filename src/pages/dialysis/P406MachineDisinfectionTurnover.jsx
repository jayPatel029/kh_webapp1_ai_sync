import React, { useState, useRef } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';

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

export default function P406MachineDisinfectionTurnover({
  data = {},
  setData,
  session = {},
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
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const bedStr = session.bed || patient.bed || 'B-02';

  // Section 1: Post-Use Disposal State
  const [bloodlineDisposed, setBloodlineDisposed] = useState(data.bloodlineDisposed || 'Yes');
  const [dialyzerDisposed, setDialyzerDisposed] = useState(data.dialyzerDisposed || 'Yes');
  const [tubingSetDisposed, setTubingSetDisposed] = useState(data.tubingSetDisposed || 'Yes');
  const [needlesDisposed, setNeedlesDisposed] = useState(data.needlesDisposed || 'Yes');
  const [sharpsContainer, setSharpsContainer] = useState(data.sharpsContainer || '');
  const [biohazardBag, setBiohazardBag] = useState(data.biohazardBag || '');
  const [disposalComments, setDisposalComments] = useState(data.disposalComments || '');

  // Section 2: Machine Disinfection State
  const [heatDisinfection, setHeatDisinfection] = useState(data.heatDisinfection || 'Completed');
  const [heatStartTime, setHeatStartTime] = useState(data.heatStartTime || '11:21 AM');
  const [heatEndTime, setHeatEndTime] = useState(data.heatEndTime || '11:41 AM');

  const [chemicalDisinfection, setChemicalDisinfection] = useState(data.chemicalDisinfection || 'Completed');
  const [chemicalSolution, setChemicalSolution] = useState(data.chemicalSolution || 'Citric Acid 50%');
  const [chemicalContactTime, setChemicalContactTime] = useState(data.chemicalContactTime || '30');

  const [rinseCompleted, setRinseCompleted] = useState(data.rinseCompleted || 'Yes');
  const [rinseTime, setRinseTime] = useState(data.rinseTime || '5');

  // Section 3: Surface Cleaning State
  const [exteriorWiped, setExteriorWiped] = useState(data.exteriorWiped || 'Yes');
  const [touchscreenCleaned, setTouchscreenCleaned] = useState(data.touchscreenCleaned || 'Yes');
  const [controlsCleaned, setControlsCleaned] = useState(data.controlsCleaned || 'Yes');
  const [traysCleaned, setTraysCleaned] = useState(data.traysCleaned || 'Yes');
  const [chairCleaned, setChairCleaned] = useState(data.chairCleaned || 'Yes');
  const [floorCleaned, setFloorCleaned] = useState(data.floorCleaned || 'Yes');
  const [cleaningAgent, setCleaningAgent] = useState(data.cleaningAgent || '');
  const [surfaceComments, setSurfaceComments] = useState(data.surfaceComments || '');

  // Section 4: Machine Inspection & Readiness State
  const [allLinesRemoved, setAllLinesRemoved] = useState(data.allLinesRemoved || 'Yes');
  const [noResidue, setNoResidue] = useState(data.noResidue || 'Yes');
  const [componentsIntact, setComponentsIntact] = useState(data.componentsIntact || 'Yes');
  const [waterSystemStatus, setWaterSystemStatus] = useState(data.waterSystemStatus || 'OK');
  const [readyForNextPatient, setReadyForNextPatient] = useState(data.readyForNextPatient || 'Yes');

  const [nextPatientDate, setNextPatientDate] = useState(data.nextPatientDate || '2025-05-28');
  const [nextPatientTime, setNextPatientTime] = useState(data.nextPatientTime || '01:30 PM');
  const [assignedPatient, setAssignedPatient] = useState(data.assignedPatient || '');

  // Section 5: Technician Verification State
  const [verifiedBy, setVerifiedBy] = useState(data.verifiedBy || 'Rahul Singh (Technician)');
  const [verifiedAt, setVerifiedAt] = useState(data.verifiedAt || '28 May 2025, 11:45 AM');
  const [hasSignature, setHasSignature] = useState(data.hasSignature || true);

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleFormSubmit = () => {
    const payload = {
      bloodlineDisposed,
      dialyzerDisposed,
      tubingSetDisposed,
      needlesDisposed,
      sharpsContainer,
      biohazardBag,
      disposalComments,
      heatDisinfection,
      heatStartTime,
      heatEndTime,
      chemicalDisinfection,
      chemicalSolution,
      chemicalContactTime,
      rinseCompleted,
      rinseTime,
      exteriorWiped,
      touchscreenCleaned,
      controlsCleaned,
      traysCleaned,
      chairCleaned,
      floorCleaned,
      cleaningAgent,
      surfaceComments,
      allLinesRemoved,
      noResidue,
      componentsIntact,
      waterSystemStatus,
      readyForNextPatient,
      nextPatientDate,
      nextPatientTime,
      assignedPatient,
      verifiedBy,
      verifiedAt,
      hasSignature,
    };

    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  return (
    <div className="p406-page-wrapper">
      {/* Top Header Bar */}
      <header className="p406-top-bar">
        <div className="p406-top-bar-left">
          <h1>P4-06 – Machine Disinfection &amp; Turnover</h1>
          <p>Ensure machine cleaned, disinfected and ready for next treatment.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p406-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 6;
          const isCompleted = s.step < 6;
          return (
            <React.Fragment key={s.step}>
              <div className={`p406-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p406-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p406-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p406-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p406-patient-header-banner">
        <div className="p406-patient-left">
          <div className="p406-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
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

        {/* 5 Stat Boxes */}
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
            <span className="p406-stat-lbl">Machine</span>
            <strong className="p406-stat-val">{machineModel}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p406-workspace-grid">
        {/* Left Column Content */}
        <div className="p406-main-form-column">
          {/* Top 3-Column Split: Section 1, Section 2, Section 3 */}
          <div className="p406-top-3col-grid">
            {/* Section 1: 1. Post-Use Disposal (Has Biohazard Icon) */}
            <div className="p406-card">
              <div className="p406-card-title-row flex-between">
                <h2>1. Post-Use Disposal</h2>
                <span className="p406-biohazard-icon" title="Biohazard Hazard">☣️</span>
              </div>

              <div className="p406-checklist-grid">
                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Bloodline Disposed
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${bloodlineDisposed === 'Yes' ? 'active' : ''}`}
                      onClick={() => setBloodlineDisposed('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${bloodlineDisposed === 'No' ? 'active-no' : ''}`}
                      onClick={() => setBloodlineDisposed('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Dialyzer Disposed
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${dialyzerDisposed === 'Yes' ? 'active' : ''}`}
                      onClick={() => setDialyzerDisposed('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${dialyzerDisposed === 'No' ? 'active-no' : ''}`}
                      onClick={() => setDialyzerDisposed('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Tubing Set Disposed
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${tubingSetDisposed === 'Yes' ? 'active' : ''}`}
                      onClick={() => setTubingSetDisposed('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${tubingSetDisposed === 'No' ? 'active-no' : ''}`}
                      onClick={() => setTubingSetDisposed('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Needles Disposed (if any)
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${needlesDisposed === 'Yes' ? 'active' : ''}`}
                      onClick={() => setNeedlesDisposed('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${needlesDisposed === 'No' ? 'active-no' : ''}`}
                      onClick={() => setNeedlesDisposed('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Sharps Container Used
                  </span>
                  <select
                    value={sharpsContainer}
                    onChange={(e) => setSharpsContainer(e.target.value)}
                  >
                    <option value="">Select container</option>
                    <option value="Container A (Yellow)">Container A (Yellow)</option>
                    <option value="Container B (Red)">Container B (Red)</option>
                  </select>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Biohazard Waste Bag Used
                  </span>
                  <select
                    value={biohazardBag}
                    onChange={(e) => setBiohazardBag(e.target.value)}
                  >
                    <option value="">Select bag</option>
                    <option value="Yellow Biohazard Bag 50L">Yellow Biohazard Bag 50L</option>
                    <option value="Red Biohazard Bag 30L">Red Biohazard Bag 30L</option>
                  </select>
                </div>
              </div>

              <div className="p406-form-field">
                <div className="p406-notes-label">
                  <label>Comments</label>
                  <span className="p406-char-count">{disposalComments.length} / 200</span>
                </div>
                <Textarea
                  maxLength={200}
                  placeholder="Enter comments..."
                  value={disposalComments}
                  onChange={(e) => setDisposalComments(e.target.value)}
                  style={{ minHeight: 45 }}
                />
              </div>
            </div>

            {/* Section 2: 2. Machine Disinfection */}
            <div className="p406-card">
              <div className="p406-card-title-row">
                <h2>2. Machine Disinfection</h2>
              </div>

              {/* Heat Disinfection */}
              <div className="p406-disinfection-subblock">
                <div className="p406-subhead-row">
                  <span className="p406-subhead-title">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Heat Disinfection (Internal)
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${heatDisinfection === 'Completed' ? 'active' : ''}`}
                      onClick={() => setHeatDisinfection('Completed')}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${heatDisinfection === 'Not Applicable' ? 'active-no' : ''}`}
                      onClick={() => setHeatDisinfection('Not Applicable')}
                    >
                      Not Applicable
                    </button>
                  </div>
                </div>

                <div className="p406-2col-time">
                  <div className="p406-form-field">
                    <label>Start Time</label>
                    <input
                      type="text"
                      value={heatStartTime}
                      onChange={(e) => setHeatStartTime(e.target.value)}
                    />
                  </div>
                  <div className="p406-form-field">
                    <label>End Time</label>
                    <input
                      type="text"
                      value={heatEndTime}
                      onChange={(e) => setHeatEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Chemical Disinfection */}
              <div className="p406-disinfection-subblock">
                <div className="p406-subhead-row">
                  <span className="p406-subhead-title">
                    <span style={{ color: '#8b5cf6' }}>☤</span> Chemical Disinfection (If Applicable)
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${chemicalDisinfection === 'Completed' ? 'active' : ''}`}
                      onClick={() => setChemicalDisinfection('Completed')}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${chemicalDisinfection === 'Not Applicable' ? 'active-no' : ''}`}
                      onClick={() => setChemicalDisinfection('Not Applicable')}
                    >
                      Not Applicable
                    </button>
                  </div>
                </div>

                <div className="p406-2col-flex">
                  <div className="p406-form-field flex-2">
                    <label>Solution Used</label>
                    <select
                      value={chemicalSolution}
                      onChange={(e) => setChemicalSolution(e.target.value)}
                    >
                      <option value="Citric Acid 50%">Citric Acid 50%</option>
                      <option value="Peracetic Acid 3.5%">Peracetic Acid 3.5%</option>
                      <option value="Sodium Hypochlorite">Sodium Hypochlorite</option>
                    </select>
                  </div>
                  <div className="p406-form-field flex-1">
                    <label>Contact Time</label>
                    <div className="p406-addon-input">
                      <input
                        type="text"
                        value={chemicalContactTime}
                        onChange={(e) => setChemicalContactTime(e.target.value)}
                      />
                      <span className="p406-unit-addon">min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rinse Completed */}
              <div className="p406-2col-flex">
                <div className="p406-form-field flex-1">
                  <label>Rinse Completed</label>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${rinseCompleted === 'Yes' ? 'active' : ''}`}
                      onClick={() => setRinseCompleted('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${rinseCompleted === 'No' ? 'active-no' : ''}`}
                      onClick={() => setRinseCompleted('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-form-field flex-1">
                  <label>Rinse Time</label>
                  <div className="p406-addon-input">
                    <input
                      type="text"
                      value={rinseTime}
                      onChange={(e) => setRinseTime(e.target.value)}
                    />
                    <span className="p406-unit-addon">min</span>
                  </div>
                </div>
              </div>

              {/* Disinfection Status Banner */}
              <div className="p406-success-disinfection-banner">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <span>Disinfection cycle completed successfully.</span>
              </div>
            </div>

            {/* Section 3: 3. Surface Cleaning */}
            <div className="p406-card">
              <div className="p406-card-title-row">
                <h2>3. Surface Cleaning</h2>
              </div>

              <div className="p406-checklist-grid">
                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Exterior Surfaces Wiped
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${exteriorWiped === 'Yes' ? 'active' : ''}`}
                      onClick={() => setExteriorWiped('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${exteriorWiped === 'No' ? 'active-no' : ''}`}
                      onClick={() => setExteriorWiped('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Touch Screen Cleaned
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${touchscreenCleaned === 'Yes' ? 'active' : ''}`}
                      onClick={() => setTouchscreenCleaned('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${touchscreenCleaned === 'No' ? 'active-no' : ''}`}
                      onClick={() => setTouchscreenCleaned('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Alarms &amp; Controls Cleaned
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${controlsCleaned === 'Yes' ? 'active' : ''}`}
                      onClick={() => setControlsCleaned('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${controlsCleaned === 'No' ? 'active-no' : ''}`}
                      onClick={() => setControlsCleaned('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Accessory Trays Cleaned
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${traysCleaned === 'Yes' ? 'active' : ''}`}
                      onClick={() => setTraysCleaned('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${traysCleaned === 'No' ? 'active-no' : ''}`}
                      onClick={() => setTraysCleaned('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Chair / Bed Area Cleaned
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${chairCleaned === 'Yes' ? 'active' : ''}`}
                      onClick={() => setChairCleaned('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${chairCleaned === 'No' ? 'active-no' : ''}`}
                      onClick={() => setChairCleaned('No')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p406-check-row">
                  <span className="p406-check-lbl">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Floor Area Cleaned
                  </span>
                  <div className="p406-toggle-pills">
                    <button
                      type="button"
                      className={`p401-pill-btn ${floorCleaned === 'Yes' ? 'active' : ''}`}
                      onClick={() => setFloorCleaned('Yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`p401-pill-btn ${floorCleaned === 'No' ? 'active-no' : ''}`}
                      onClick={() => setFloorCleaned('No')}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              <div className="p406-form-field">
                <label>Cleaning Agent Used</label>
                <select
                  value={cleaningAgent}
                  onChange={(e) => setCleaningAgent(e.target.value)}
                >
                  <option value="">Select cleaning agent</option>
                  <option value="70% Isopropyl Alcohol">70% Isopropyl Alcohol</option>
                  <option value="Bleach Solution 1:10">Bleach Solution 1:10</option>
                  <option value="Quaternary Ammonium Wipes">Quaternary Ammonium Wipes</option>
                </select>
              </div>

              <div className="p406-form-field">
                <div className="p406-notes-label">
                  <label>Comments</label>
                  <span className="p406-char-count">{surfaceComments.length} / 200</span>
                </div>
                <Textarea
                  maxLength={200}
                  placeholder="Enter comments..."
                  value={surfaceComments}
                  onChange={(e) => setSurfaceComments(e.target.value)}
                  style={{ minHeight: 45 }}
                />
              </div>
            </div>
          </div>

          {/* Bottom 2-Column Split: Section 4 & Section 5 */}
          <div className="p406-bottom-2col-grid">
            {/* Section 4: 4. Machine Inspection & Readiness */}
            <div className="p406-card">
              <div className="p406-card-title-row">
                <h2>4. Machine Inspection &amp; Readiness</h2>
              </div>

              <div className="p406-inspection-2col">
                {/* Left Toggle List */}
                <div className="p406-inspection-left">
                  <div className="p406-check-row">
                    <span className="p406-check-lbl">All Lines Removed</span>
                    <div className="p406-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${allLinesRemoved === 'Yes' ? 'active' : ''}`}
                        onClick={() => setAllLinesRemoved('Yes')}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${allLinesRemoved === 'No' ? 'active-no' : ''}`}
                        onClick={() => setAllLinesRemoved('No')}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p406-check-row">
                    <span className="p406-check-lbl">No Visible Residue / Stains</span>
                    <div className="p406-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${noResidue === 'Yes' ? 'active' : ''}`}
                        onClick={() => setNoResidue('Yes')}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${noResidue === 'No' ? 'active-no' : ''}`}
                        onClick={() => setNoResidue('No')}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p406-check-row">
                    <span className="p406-check-lbl">Machine Components Intact</span>
                    <div className="p406-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${componentsIntact === 'Yes' ? 'active' : ''}`}
                        onClick={() => setComponentsIntact('Yes')}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${componentsIntact === 'No' ? 'active-no' : ''}`}
                        onClick={() => setComponentsIntact('No')}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p406-check-row">
                    <span className="p406-check-lbl">Water System Status</span>
                    <select
                      value={waterSystemStatus}
                      onChange={(e) => setWaterSystemStatus(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="Warning">Warning</option>
                      <option value="Error">Error</option>
                    </select>
                  </div>

                  <div className="p406-check-row">
                    <span className="p406-check-lbl">Machine Ready for Next Patient</span>
                    <div className="p406-toggle-pills">
                      <button
                        type="button"
                        className={`p401-pill-btn ${readyForNextPatient === 'Yes' ? 'active' : ''}`}
                        onClick={() => setReadyForNextPatient('Yes')}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`p401-pill-btn ${readyForNextPatient === 'No' ? 'active-no' : ''}`}
                        onClick={() => setReadyForNextPatient('No')}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Patient Assignment & Info Banner */}
                <div className="p406-inspection-right">
                  <div className="p406-form-field">
                    <label>Next Patient Slot</label>
                    <div className="p406-date-time-flex">
                      <input
                        type="date"
                        value={nextPatientDate}
                        onChange={(e) => setNextPatientDate(e.target.value)}
                      />
                      <input
                        type="text"
                        value={nextPatientTime}
                        onChange={(e) => setNextPatientTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p406-form-field">
                    <label>Assigned To (If known)</label>
                    <select
                      value={assignedPatient}
                      onChange={(e) => setAssignedPatient(e.target.value)}
                    >
                      <option value="">Select patient</option>
                      <option value="P10024 - Suresh Patel">P10024 - Suresh Patel</option>
                      <option value="P10025 - Anita Verma">P10025 - Anita Verma</option>
                    </select>
                  </div>

                  <div className="p406-standby-info-box">
                    <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    <span>Ensure machine is in standby mode until next treatment.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: 5. Technician Verification (Cream/Gold Tinted Card) */}
            <div className="p406-card p406-card-verification">
              <div className="p406-card-title-row">
                <h2>5. Technician Verification</h2>
              </div>

              <div className="p406-verification-grid">
                <div className="p406-verification-inputs">
                  <div className="p406-form-field">
                    <label>Verified By</label>
                    <input
                      type="text"
                      value={verifiedBy}
                      onChange={(e) => setVerifiedBy(e.target.value)}
                    />
                  </div>

                  <div className="p406-form-field">
                    <label>Verified At</label>
                    <input
                      type="text"
                      value={verifiedAt}
                      onChange={(e) => setVerifiedAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p406-signature-box">
                  <label>Signature</label>
                  <div className="p406-signature-pad">
                    <span className="p406-signature-script">Rahul Singh</span>
                    <button
                      type="button"
                      className="p406-sig-clear-btn"
                      onClick={() => setHasSignature(false)}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (3 Stacked Cards) */}
        <div className="p406-right-rail">
          {/* Card 1: Machine Readiness Status */}
          <div className="p406-rail-card p406-readiness-summary-card">
            <div className="p406-readiness-head">
              <div className="p406-readiness-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 26 }} />
              </div>
              <div className="p406-readiness-text">
                <strong>Ready for Next Use</strong>
                <span>All cleaning and disinfection steps completed.</span>
              </div>
            </div>

            <div className="p406-readiness-meta">
              <div className="p406-meta-row">
                <span>Completed At</span>
                <strong>11:45 AM</strong>
              </div>
              <div className="p406-meta-row">
                <span>Completed By</span>
                <strong>Rahul Singh (Technician)</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Disinfection Compliance (Donut Progress SVG) */}
          <div className="p406-rail-card">
            <div className="p406-rail-header">
              <h3>Disinfection Compliance</h3>
            </div>

            <div className="p406-compliance-body">
              <div className="p406-donut-wrap">
                <svg viewBox="0 0 100 100" width="84" height="84">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#16a34a" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
                  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">100%</text>
                </svg>
              </div>

              <div className="p406-compliance-legend">
                <div className="p406-comp-row">
                  <span className="p406-dot-green" /> Completed
                  <strong>5 / 5</strong>
                </div>
                <div className="p406-comp-row">
                  <span className="p406-dot-amber" /> Pending
                  <strong>0</strong>
                </div>
                <div className="p406-comp-row">
                  <span className="p406-dot-gray" /> Not Applicable
                  <strong>0</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Key Reminders (Gold Tinted) */}
          <div className="p406-rail-card p406-reminders-card">
            <div className="p406-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p406-reminders-checklist">
              <div className="p406-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Dispose all single-use items properly</span>
              </div>
              <div className="p406-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Complete disinfection cycle</span>
              </div>
              <div className="p406-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Wipe all external surfaces</span>
              </div>
              <div className="p406-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Ensure machine is dry and ready</span>
              </div>
              <div className="p406-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Document any issues in comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p406-footer-bar">
        <div className="p406-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p406-footer-right">
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
