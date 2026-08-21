import React, { useState } from 'react';
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
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import DepartureBoardOutlinedIcon from '@mui/icons-material/DepartureBoardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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

export default function P408PatientDischarge({
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

  // Section 1: Readiness Assessment (Derived from post vitals or defaults)
  const bpStr = data.systolic && data.diastolic ? `${data.systolic} / ${data.diastolic}` : '126 / 78';
  const pulseStr = data.pulse || '82';
  const spo2Str = data.spo2 || '98';
  const tempStr = data.temperature || '36.6';
  const overallCond = data.condition || 'Stable';

  // Section 2: Ambulation Status
  const [ambulationAbility, setAmbulationAbility] = useState(data.ambulationAbility || 'Independent');
  const [assistanceWalker, setAssistanceWalker] = useState(data.assistanceWalker || false);
  const [assistanceWheelchair, setAssistanceWheelchair] = useState(data.assistanceWheelchair || false);
  const [assistanceCaregiver, setAssistanceCaregiver] = useState(data.assistanceCaregiver || false);
  const [assistanceNone, setAssistanceNone] = useState(data.assistanceNone || true);
  const [ambulationComments, setAmbulationComments] = useState(data.ambulationComments || '');

  // Section 3: Patient Education Provided Checklist
  const [eduTopics, setEduTopics] = useState(data.eduTopics || [
    'fluid', 'diet', 'medication', 'access', 'complications', 'when_help', 'next_apt', 'emergency'
  ]);
  const [eduProvidedBy, setEduProvidedBy] = useState(data.eduProvidedBy || 'Rahul Singh (Technician)');

  const toggleEduTopic = (topicKey) => {
    setEduTopics((prev) =>
      prev.includes(topicKey) ? prev.filter((t) => t !== topicKey) : [...prev, topicKey]
    );
  };

  // Section 4: Diet & Fluid Advice
  const [fluidAllowance, setFluidAllowance] = useState(data.fluidAllowance || '1000');
  const [dietType, setDietType] = useState(data.dietType || 'Low Potassium, Low Sodium');
  const [dietInstructions, setDietInstructions] = useState(
    data.dietInstructions || 'Avoid high potassium foods (banana, orange, tomato, potato).'
  );

  // Section 5: Transport & Caregiver
  const [transportMode, setTransportMode] = useState(data.transportMode || 'Family Vehicle');
  const [caregiverName, setCaregiverName] = useState(data.caregiverName || 'Suresh Kumar (Son)');
  const [contactNumber, setContactNumber] = useState(data.contactNumber || '98765 43210');

  // Section 6: Next Appointment
  const [nextApptDate, setNextApptDate] = useState(data.nextApptDate || '2025-05-30');
  const [nextApptTime, setNextApptTime] = useState(data.nextApptTime || '07:45 AM');
  const [nextApptShift, setNextApptShift] = useState(data.nextApptShift || 'Morning Shift');

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleFormSubmit = () => {
    const payload = {
      readinessAssessment: { bp: bpStr, pulse: pulseStr, spo2: spo2Str, temp: tempStr, overall: overallCond, stable: true },
      ambulation: { ability: ambulationAbility, walker: assistanceWalker, wheelchair: assistanceWheelchair, caregiver: assistanceCaregiver, none: assistanceNone, comments: ambulationComments },
      education: { topics: eduTopics, providedBy: eduProvidedBy },
      dietAndFluid: { fluidAllowance, dietType, specialInstructions: dietInstructions },
      transportAndCaregiver: { transportMode, caregiverName, contactNumber },
      nextAppointment: { date: nextApptDate, time: nextApptTime, shift: nextApptShift },
      dischargedAt: '11:45 AM',
      dischargedBy: 'Rahul Singh (Technician)',
    };

    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  return (
    <div className="p408-page-wrapper">
      {/* Top Header Bar */}
      <header className="p408-top-bar">
        <div className="p408-top-bar-left">
          <h1>P4-08 – Patient Discharge</h1>
          <p>Ensure patient is stable and discharged with appropriate instructions and follow-up plan.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p408-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 8;
          const isCompleted = s.step < 8;
          return (
            <React.Fragment key={s.step}>
              <div className={`p408-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p408-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p408-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p408-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p408-patient-header-banner">
        <div className="p408-patient-left">
          <div className="p408-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
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

        {/* 5 Stat Boxes */}
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
            <span className="p408-stat-lbl">Machine</span>
            <strong className="p408-stat-val">{machineModel}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p408-workspace-grid">
        {/* Left Column Content */}
        <div className="p408-main-form-column">
          {/* Top 3-Column Split: Section 1, Section 2, Section 3 */}
          <div className="p408-top-3col-grid">
            {/* Section 1: 1. Discharge Readiness Assessment */}
            <div className="p408-card">
              <div className="p408-card-title-row">
                <MedicalServicesOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <h2>1. Discharge Readiness Assessment</h2>
              </div>

              <div className="p408-readiness-table">
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Blood Pressure (mmHg)</span>
                  <strong>{bpStr}</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Heart Rate (bpm)</span>
                  <strong>{pulseStr}</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> SpO₂ (%)</span>
                  <strong>{spo2Str}</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Temperature (°C)</span>
                  <strong>{tempStr}</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Bleeding from Access Site</span>
                  <strong>No</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Dizziness / Giddiness</span>
                  <strong>No</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Nausea / Vomiting</span>
                  <strong>No</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Shortness of Breath</span>
                  <strong>No</strong>
                </div>
                <div className="p408-readiness-row">
                  <span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Overall Assessment</span>
                  <span className="p408-stable-pill">{overallCond}</span>
                </div>
              </div>

              <div className="p408-ready-status-banner">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <span>Patient is stable for discharge</span>
              </div>
            </div>

            {/* Section 2: 2. Ambulation Status */}
            <div className="p408-card">
              <div className="p408-card-title-row">
                <DirectionsWalkOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h2>2. Ambulation Status</h2>
              </div>

              <div className="p408-form-field">
                <label>Ambulation Ability</label>
                <div className="p408-toggle-3pills">
                  <button
                    type="button"
                    className={`p408-amb-pill ${ambulationAbility === 'Independent' ? 'active' : ''}`}
                    onClick={() => setAmbulationAbility('Independent')}
                  >
                    Independent
                  </button>
                  <button
                    type="button"
                    className={`p408-amb-pill ${ambulationAbility === 'Assisted' ? 'active' : ''}`}
                    onClick={() => setAmbulationAbility('Assisted')}
                  >
                    Assisted
                  </button>
                  <button
                    type="button"
                    className={`p408-amb-pill ${ambulationAbility === 'Unable' ? 'active-no' : ''}`}
                    onClick={() => setAmbulationAbility('Unable')}
                  >
                    Unable
                  </button>
                </div>
              </div>

              <div className="p408-form-field">
                <label>Any Assistance Used?</label>
                <div className="p408-checkbox-stack">
                  <label className="p408-checkbox-row">
                    <Checkbox checked={assistanceWalker} onChange={(e) => setAssistanceWalker(e.target.checked)} />
                    <span>Walker</span>
                  </label>
                  <label className="p408-checkbox-row">
                    <Checkbox checked={assistanceWheelchair} onChange={(e) => setAssistanceWheelchair(e.target.checked)} />
                    <span>Wheelchair</span>
                  </label>
                  <label className="p408-checkbox-row">
                    <Checkbox checked={assistanceCaregiver} onChange={(e) => setAssistanceCaregiver(e.target.checked)} />
                    <span>Caregiver Support</span>
                  </label>
                  <label className="p408-checkbox-row">
                    <Checkbox checked={assistanceNone} onChange={(e) => setAssistanceNone(e.target.checked)} />
                    <span>None</span>
                  </label>
                </div>
              </div>

              <div className="p408-form-field">
                <div className="p408-notes-label"><label>Comments</label><span className="p408-char-count">{ambulationComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={ambulationComments} onChange={(e) => setAmbulationComments(e.target.value)} style={{ minHeight: 45 }} />
              </div>
            </div>

            {/* Section 3: 3. Patient Education Provided */}
            <div className="p408-card">
              <div className="p408-card-title-row">
                <SchoolOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                <h2>3. Patient Education Provided</h2>
              </div>

              <div className="p408-edu-grid">
                {[
                  { key: 'fluid', label: 'Fluid restriction' },
                  { key: 'diet', label: 'Dietary advice' },
                  { key: 'medication', label: 'Medication adherence' },
                  { key: 'access', label: 'Access care & hygiene' },
                  { key: 'complications', label: 'Signs of complications' },
                  { key: 'when_help', label: 'When to seek medical help' },
                  { key: 'next_apt', label: 'Next dialysis appointment' },
                  { key: 'emergency', label: 'Emergency contact information' },
                ].map((topic) => (
                  <label key={topic.key} className="p408-edu-item">
                    <Checkbox checked={eduTopics.includes(topic.key)} onChange={() => toggleEduTopic(topic.key)} />
                    <span>{topic.label}</span>
                  </label>
                ))}
              </div>

              <div className="p408-form-field">
                <label>Education Provided By</label>
                <select value={eduProvidedBy} onChange={(e) => setEduProvidedBy(e.target.value)}>
                  <option value="Rahul Singh (Technician)">Rahul Singh (Technician)</option>
                  <option value="Dr. Neha Sharma (Nephrologist)">Dr. Neha Sharma (Nephrologist)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom 3-Column Split: Section 4, Section 5, Section 6 */}
          <div className="p408-bottom-3col-grid">
            {/* Section 4: 4. Diet & Fluid Advice */}
            <div className="p408-card">
              <div className="p408-card-title-row">
                <RestaurantOutlinedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <h2>4. Diet &amp; Fluid Advice</h2>
              </div>

              <div className="p408-2col-flex">
                <div className="p408-form-field flex-1">
                  <label>Daily Fluid Allowance</label>
                  <div className="p408-addon-input">
                    <input type="text" value={fluidAllowance} onChange={(e) => setFluidAllowance(e.target.value)} />
                    <span className="p408-unit-addon">ml</span>
                  </div>
                </div>

                <div className="p408-form-field flex-2">
                  <label>Diet Type</label>
                  <select value={dietType} onChange={(e) => setDietType(e.target.value)}>
                    <option value="Low Potassium, Low Sodium">Low Potassium, Low Sodium</option>
                    <option value="Standard Renal Diet">Standard Renal Diet</option>
                    <option value="Fluid Restricted Diet">Fluid Restricted Diet</option>
                  </select>
                </div>
              </div>

              <div className="p408-form-field">
                <div className="p408-notes-label"><label>Special Instructions</label><span className="p408-char-count">{dietInstructions.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter instructions..." value={dietInstructions} onChange={(e) => setDietInstructions(e.target.value)} style={{ minHeight: 50 }} />
              </div>
            </div>

            {/* Section 5: 5. Transport & Caregiver */}
            <div className="p408-card">
              <div className="p408-card-title-row">
                <DepartureBoardOutlinedIcon sx={{ color: '#0f766e', fontSize: 18 }} />
                <h2>5. Transport &amp; Caregiver</h2>
              </div>

              <div className="p408-form-field">
                <label>Transport Mode</label>
                <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
                  <option value="Family Vehicle">Family Vehicle</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="Taxi / Cab">Taxi / Cab</option>
                  <option value="Self / Walking">Self / Walking</option>
                </select>
              </div>

              <div className="p408-form-field">
                <label>Caregiver / Accompanied By</label>
                <select value={caregiverName} onChange={(e) => setCaregiverName(e.target.value)}>
                  <option value="Suresh Kumar (Son)">Suresh Kumar (Son)</option>
                  <option value="Sunita Kumar (Wife)">Sunita Kumar (Wife)</option>
                  <option value="None (Self)">None (Self)</option>
                </select>
              </div>

              <div className="p408-form-field">
                <label>Contact Number</label>
                <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
              </div>
            </div>

            {/* Section 6: 6. Next Appointment */}
            <div className="p408-card">
              <div className="p408-card-title-row">
                <EventAvailableOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                <h2>6. Next Appointment</h2>
              </div>

              <div className="p408-form-field">
                <label>Next Dialysis Date</label>
                <input type="date" value={nextApptDate} onChange={(e) => setNextApptDate(e.target.value)} />
              </div>

              <div className="p408-2col-flex">
                <div className="p408-form-field flex-1">
                  <label>Expected Time</label>
                  <input type="text" value={nextApptTime} onChange={(e) => setNextApptTime(e.target.value)} />
                </div>
                <div className="p408-form-field flex-1">
                  <label>Shift</label>
                  <select value={nextApptShift} onChange={(e) => setNextApptShift(e.target.value)}>
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Afternoon Shift">Afternoon Shift</option>
                    <option value="Evening Shift">Evening Shift</option>
                  </select>
                </div>
              </div>

              <div className="p408-appt-confirm-box">
                <CalendarTodayOutlinedIcon sx={{ color: '#b45309', fontSize: 20 }} />
                <div className="p408-appt-confirm-text">
                  <span>Appointment scheduled</span>
                  <strong>for 30 May 2025, 07:45 AM</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (3 Stacked Cards) */}
        <div className="p408-right-rail">
          {/* Card 1: Discharge Summary (Green Tinted) */}
          <div className="p408-rail-card p408-discharge-summary-card">
            <div className="p408-dis-head">
              <div className="p408-dis-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 26 }} />
              </div>
              <div className="p408-dis-text">
                <strong>Ready for Discharge</strong>
                <span>All discharge criteria met.</span>
              </div>
            </div>

            <div className="p408-dis-metrics">
              <div className="p408-dis-row"><span>Total Duration</span><strong>{durationStr}</strong></div>
              <div className="p408-dis-row"><span>UF Removed</span><strong>{ufRemovedStr}</strong></div>
              <div className="p408-dis-row"><span>Post Dialysis BP</span><strong>{bpStr} mmHg</strong></div>
              <div className="p408-dis-row"><span>Post Weight</span><strong>{data.postWeight ? `${data.postWeight} kg` : '65.3 kg'}</strong></div>
              <div className="p408-dis-row"><span>Access Site</span><strong>Clean &amp; Dry</strong></div>
              <div className="p408-dis-row"><span>Overall Condition</span><strong>{overallCond}</strong></div>
            </div>
          </div>

          {/* Card 2: Key Reminders (Gold Tinted) */}
          <div className="p408-rail-card p408-reminders-card">
            <div className="p408-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p408-reminders-checklist">
              <div className="p408-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Reinforce fluid and diet restrictions</span>
              </div>
              <div className="p408-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Take medications as prescribed</span>
              </div>
              <div className="p408-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Monitor access site for signs of infection</span>
              </div>
              <div className="p408-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Seek medical help if unwell</span>
              </div>
              <div className="p408-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Keep next appointment as scheduled</span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="p408-rail-card">
            <div className="p408-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p408-quick-flex">
              <button type="button" className="p408-action-btn">
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Discharge Summary</span>
              </button>
              <button type="button" className="p408-action-btn">
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Send Summary to Nephrologist</span>
              </button>
              <button type="button" className="p408-action-btn">
                <WhatsAppIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                <span>Share with Patient (WhatsApp)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p408-footer-bar">
        <div className="p408-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p408-footer-right">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> Confirm Discharge
          </Button>
        </div>
      </footer>
    </div>
  );
}
