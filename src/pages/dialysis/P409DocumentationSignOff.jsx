import React, { useState } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';
import {
  saveSessionDocumentation,
  saveSessionSignoff,
  sendPhysicianNotification,
} from '../../ApiCalls/postDialysisApis';

// Material UI Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';

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

export default function P409DocumentationSignOff({
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

  // Section 1: Technician Notes State
  const [techSummary, setTechSummary] = useState(
    data.techSummary || 'Treatment completed without complications. Patient was stable throughout the session.'
  );
  const [machineIssues, setMachineIssues] = useState(data.machineIssues || 'None');
  const [techActions, setTechActions] = useState(data.techActions || '');
  const [techComments, setTechComments] = useState(data.techComments || '');

  // Section 2: Nursing Notes State
  const [nurseSummary, setNurseSummary] = useState(
    data.nurseSummary || 'Hemostasis achieved. No bleeding from access site. Patient tolerated treatment well.'
  );
  const [patientResponse, setPatientResponse] = useState(data.patientResponse || 'Tolerated Well');
  const [nurseInterventions, setNurseInterventions] = useState(data.nurseInterventions || '');
  const [eduReinforced, setEduReinforced] = useState(data.eduReinforced || 'Fluid restriction and low potassium diet.');

  // Section 3: Physician Comments State
  const [physicianComments, setPhysicianComments] = useState(
    data.physicianComments || 'Patient stable. Continue current plan. Review in next visit.'
  );
  const [physicianOrders, setPhysicianOrders] = useState(data.physicianOrders || 'No change in prescription.');

  // Section 4: Incident Documentation State
  const [incidentOccurred, setIncidentOccurred] = useState(data.incidentOccurred || 'No');
  const [incidentType, setIncidentType] = useState(data.incidentType || '');
  const [incidentDescription, setIncidentDescription] = useState(data.incidentDescription || '');
  const [correctiveActions, setCorrectiveActions] = useState(data.correctiveActions || '');
  const [reportedTo, setReportedTo] = useState(data.reportedTo || '');
  const [riskLevel, setRiskLevel] = useState(data.riskLevel || '');

  // Section 5: Electronic Sign-offs State
  const [techSigned, setTechSigned] = useState(data.techSigned || true);
  const [nurseSigned, setNurseSigned] = useState(data.nurseSigned || true);
  const [physicianSigned, setPhysicianSigned] = useState(data.physicianSigned || true);

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleRoleSignoff = async (role, signedBy) => {
    const sessionId = session.id || session.session_id || 'demo';
    const payload = {
      role,
      signed_by: signedBy,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    if (role === 'technician') setTechSigned(true);
    if (role === 'nurse') setNurseSigned(true);
    if (role === 'physician') setPhysicianSigned(true);
    updateParentState({ [`${role}Signed`]: true });

    if (sessionId !== 'demo') {
      await saveSessionSignoff(sessionId, payload);
    }
  };

  const handleNotifyPhysician = async () => {
    const sessionId = session.id || session.session_id || 'demo';
    if (sessionId !== 'demo') {
      await sendPhysicianNotification(sessionId, {
        notification_type: 'post_session_summary',
        notes: physicianComments,
        orders: physicianOrders,
      });
    }
  };

  const handleFormSubmit = async () => {
    const payload = {
      technicianNotes: { summary: techSummary, machineIssues, actions: techActions, comments: techComments },
      nursingNotes: { summary: nurseSummary, patientResponse, interventions: nurseInterventions, education: eduReinforced },
      physicianComments: { comments: physicianComments, orders: physicianOrders },
      incidentDocumentation: { occurred: incidentOccurred, type: incidentType, description: incidentDescription, correctiveActions, reportedTo, riskLevel },
      electronicSignoffs: {
        technician: { signedBy: 'Rahul Singh', timestamp: '28 May 2025, 11:25 AM', signed: techSigned },
        nurse: { signedBy: 'Priya Sharma', timestamp: '28 May 2025, 11:28 AM', signed: nurseSigned },
        physician: { signedBy: 'Neha Sharma', timestamp: '28 May 2025, 11:32 AM', signed: physicianSigned },
      },
    };

    updateParentState(payload);
    const sessionId = session.id || session.session_id || 'demo';
    if (sessionId !== 'demo') {
      await saveSessionDocumentation(sessionId, payload);
      await sendPhysicianNotification(sessionId, { notification_type: 'batch_post_session' });
    }
    if (onSave) onSave(payload);
  };

  return (
    <div className="p409-page-wrapper">
      {/* Top Header Bar */}
      <header className="p409-top-bar">
        <div className="p409-top-bar-left">
          <h1>P4-09 – Session Documentation &amp; Sign-off</h1>
          <p>Complete session documentation with notes, incident reporting and electronic sign-off.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p409-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 9;
          const isCompleted = s.step < 9;
          return (
            <React.Fragment key={s.step}>
              <div className={`p409-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p409-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p409-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p409-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p409-patient-header-banner">
        <div className="p409-patient-left">
          <div className="p409-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p409-patient-bio">
            <div className="p409-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p409-pill-active">Active</span>
            </div>
            <div className="p409-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p409-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p409-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p409-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p409-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes */}
        <div className="p409-patient-stats">
          <div className="p409-stat-box">
            <CalendarTodayOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Treatment Start</span>
            <strong className="p409-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p409-stat-box">
            <AccessTimeOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Treatment End</span>
            <strong className="p409-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p409-stat-box">
            <AccessTimeOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Duration</span>
            <strong className="p409-stat-val">{durationStr}</strong>
          </div>

          <div className="p409-stat-box">
            <WaterDropOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">UF Removed</span>
            <strong className="p409-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p409-stat-box">
            <HotelOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Machine</span>
            <strong className="p409-stat-val">{machineModel}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p409-workspace-grid">
        {/* Left Column Content */}
        <div className="p409-main-form-column">
          {/* Top 3-Column Split: Section 1, Section 2&3, Section 4 */}
          <div className="p409-top-3col-grid">
            {/* Section 1: 1. Technician Notes */}
            <div className="p409-card">
              <div className="p409-card-title-row">
                <DescriptionOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h2>1. Technician Notes</h2>
              </div>

              <div className="p409-form-field">
                <div className="p409-notes-label">
                  <label>Session Summary / Observations <span className="p409-req">*</span></label>
                  <span className="p409-char-count">{techSummary.length}/500</span>
                </div>
                <Textarea maxLength={500} value={techSummary} onChange={(e) => setTechSummary(e.target.value)} style={{ minHeight: 65 }} />
              </div>

              <div className="p409-form-field">
                <label>Machine Issues (If any)</label>
                <select value={machineIssues} onChange={(e) => setMachineIssues(e.target.value)}>
                  <option value="None">None</option>
                  <option value="Minor Alarm Resolved">Minor Alarm Resolved</option>
                  <option value="Pressure Fluctuation">Pressure Fluctuation</option>
                </select>
              </div>

              <div className="p409-form-field">
                <div className="p409-notes-label"><label>Actions Taken</label><span className="p409-char-count">{techActions.length}/300</span></div>
                <Textarea maxLength={300} placeholder="Enter actions taken..." value={techActions} onChange={(e) => setTechActions(e.target.value)} style={{ minHeight: 40 }} />
              </div>

              <div className="p409-form-field">
                <div className="p409-notes-label"><label>Additional Comments</label><span className="p409-char-count">{techComments.length}/300</span></div>
                <Textarea maxLength={300} placeholder="Enter additional comments..." value={techComments} onChange={(e) => setTechComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>

              <div className="p409-attach-box">
                <label>Attached Files (If any)</label>
                <div className="p409-upload-btn-wrap">
                  <button type="button" className="p409-upload-btn">
                    <UploadFileOutlinedIcon sx={{ fontSize: 16 }} /> Upload File
                  </button>
                  <span className="p409-upload-hint">JPG, PNG, PDF up to 5 MB</span>
                </div>
              </div>
            </div>

            {/* Middle Column: Section 2 (Nursing Notes) & Section 3 (Physician Comments) */}
            <div className="p409-mid-col-stack">
              {/* Section 2: 2. Nursing Notes */}
              <div className="p409-card">
                <div className="p409-card-title-row">
                  <LocalHospitalOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <h2>2. Nursing Notes</h2>
                </div>

                <div className="p409-form-field">
                  <div className="p409-notes-label">
                    <label>Nursing Summary <span className="p409-req">*</span></label>
                    <span className="p409-char-count">{nurseSummary.length}/500</span>
                  </div>
                  <Textarea maxLength={500} value={nurseSummary} onChange={(e) => setNurseSummary(e.target.value)} style={{ minHeight: 50 }} />
                </div>

                <div className="p409-form-field">
                  <label>Patient Response</label>
                  <select value={patientResponse} onChange={(e) => setPatientResponse(e.target.value)}>
                    <option value="Tolerated Well">Tolerated Well</option>
                    <option value="Mild Discomfort">Mild Discomfort</option>
                    <option value="Hypotension Resolved">Hypotension Resolved</option>
                  </select>
                </div>

                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Nursing Interventions</label><span className="p409-char-count">{nurseInterventions.length}/300</span></div>
                  <Textarea maxLength={300} placeholder="Enter nursing interventions..." value={nurseInterventions} onChange={(e) => setNurseInterventions(e.target.value)} style={{ minHeight: 35 }} />
                </div>

                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Education Reinforced</label><span className="p409-char-count">{eduReinforced.length}/300</span></div>
                  <Textarea maxLength={300} value={eduReinforced} onChange={(e) => setEduReinforced(e.target.value)} style={{ minHeight: 35 }} />
                </div>
              </div>

              {/* Section 3: 3. Physician / Nephrologist Comments */}
              <div className="p409-card">
                <div className="p409-card-title-row">
                  <PersonOutlineOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                  <h2>3. Physician / Nephrologist Comments</h2>
                </div>

                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Physician Comments</label><span className="p409-char-count">{physicianComments.length}/500</span></div>
                  <Textarea maxLength={500} value={physicianComments} onChange={(e) => setPhysicianComments(e.target.value)} style={{ minHeight: 45 }} />
                </div>

                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Orders / Recommendations</label><span className="p409-char-count">{physicianOrders.length}/300</span></div>
                  <Textarea maxLength={300} value={physicianOrders} onChange={(e) => setPhysicianOrders(e.target.value)} style={{ minHeight: 40 }} />
                </div>
              </div>
            </div>

            {/* Section 4: 4. Incident / Variance Documentation */}
            <div className="p409-card">
              <div className="p409-card-title-row">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <h2>4. Incident / Variance Documentation</h2>
              </div>

              <div className="p409-form-field">
                <label>Any Incidents During Session?</label>
                <div className="p409-radio-row">
                  <label className="p409-radio-lbl">
                    <input type="radio" name="incident" value="Yes" checked={incidentOccurred === 'Yes'} onChange={() => setIncidentOccurred('Yes')} /> Yes
                  </label>
                  <label className="p409-radio-lbl">
                    <input type="radio" name="incident" value="No" checked={incidentOccurred === 'No'} onChange={() => setIncidentOccurred('No')} /> No
                  </label>
                </div>
              </div>

              <div className="p409-form-field">
                <label>Incident Type</label>
                <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                  <option value="">Select incident type</option>
                  <option value="Hypotension Event">Hypotension Event</option>
                  <option value="Machine Error">Machine Error</option>
                  <option value="Vascular Access Issue">Vascular Access Issue</option>
                </select>
              </div>

              <div className="p409-form-field">
                <div className="p409-notes-label"><label>Description</label><span className="p409-char-count">{incidentDescription.length}/500</span></div>
                <Textarea maxLength={500} placeholder="Enter incident details..." value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} style={{ minHeight: 45 }} />
              </div>

              <div className="p409-form-field">
                <div className="p409-notes-label"><label>Corrective Actions Taken</label><span className="p409-char-count">{correctiveActions.length}/300</span></div>
                <Textarea maxLength={300} placeholder="Enter corrective actions..." value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)} style={{ minHeight: 40 }} />
              </div>

              <div className="p409-form-field">
                <label>Reported To</label>
                <select value={reportedTo} onChange={(e) => setReportedTo(e.target.value)}>
                  <option value="">Select</option>
                  <option value="Dr. Neha Sharma (Nephrologist)">Dr. Neha Sharma (Nephrologist)</option>
                  <option value="Nurse Supervisor">Nurse Supervisor</option>
                </select>
              </div>

              <div className="p409-form-field">
                <label>Risk Level</label>
                <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                  <option value="">Select risk level</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Split Layout: Section 5 Electronic Sign-off & Audit Trail */}
          <div className="p409-bottom-split">
            {/* Section 5: 5. Electronic Sign-off */}
            <div className="p409-card flex-2">
              <div className="p409-sign-head-row">
                <h2>5. Electronic Sign-off</h2>
                <span className="p409-sign-sub">By signing below, you confirm that all documentation is accurate and complete.</span>
              </div>

              <div className="p409-sign-grid">
                {/* Technician Sign-off */}
                <div className="p409-sign-box">
                  <div className="p409-sign-lbl-row">
                    <label>Technician Sign-off <span className="p409-req">*</span></label>
                    {techSigned && <button type="button" className="p409-clear-link" onClick={() => setTechSigned(false)}>Clear</button>}
                  </div>
                  <div className="p409-sig-canvas">
                    <span className="p409-sig-script">Rahul Singh</span>
                  </div>
                  <div className="p409-sig-meta">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} />
                    <span>28 May 2025, 11:25 AM</span>
                  </div>
                </div>

                {/* Nurse Sign-off */}
                <div className="p409-sign-box">
                  <div className="p409-sign-lbl-row">
                    <label>Nurse Sign-off <span className="p409-req">*</span></label>
                    {nurseSigned && <button type="button" className="p409-clear-link" onClick={() => setNurseSigned(false)}>Clear</button>}
                  </div>
                  <div className="p409-sig-canvas">
                    <span className="p409-sig-script">Priya Sharma</span>
                  </div>
                  <div className="p409-sig-meta">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} />
                    <span>28 May 2025, 11:28 AM</span>
                  </div>
                </div>

                {/* Physician Sign-off */}
                <div className="p409-sign-box">
                  <div className="p409-sign-lbl-row">
                    <label>Physician Sign-off <span className="p409-req">*</span></label>
                    {physicianSigned && <button type="button" className="p409-clear-link" onClick={() => setPhysicianSigned(false)}>Clear</button>}
                  </div>
                  <div className="p409-sig-canvas">
                    <span className="p409-sig-script">Neha Sharma</span>
                  </div>
                  <div className="p409-sig-meta">
                    <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} />
                    <span>28 May 2025, 11:32 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail Box */}
            <div className="p409-audit-trail-card flex-1">
              <h3>Session Audit Trail</h3>
              <div className="p409-audit-timeline">
                <div className="p409-audit-item">
                  <span>Created by Rahul Singh (Technician)</span>
                  <strong>28 May 2025, 11:20 AM</strong>
                </div>
                <div className="p409-audit-item">
                  <span>Nursing notes completed by Priya Sharma</span>
                  <strong>28 May 2025, 11:28 AM</strong>
                </div>
                <div className="p409-audit-item">
                  <span>Physician comments by Dr. Neha Sharma</span>
                  <strong>28 May 2025, 11:32 AM</strong>
                </div>
                <div className="p409-audit-item">
                  <span>Documentation completed</span>
                  <strong>28 May 2025, 11:32 AM</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (3 Stacked Cards) */}
        <div className="p409-right-rail">
          {/* Card 1: Documentation Status */}
          <div className="p409-rail-card">
            <div className="p409-rail-header">
              <h3>Documentation Status</h3>
            </div>
            <div className="p409-compliance-body">
              <div className="p409-donut-wrap">
                <svg viewBox="0 0 100 100" width="84" height="84">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#16a34a" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
                  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">100%</text>
                </svg>
              </div>
              <div className="p409-doc-status-text">
                <strong>All documentation completed</strong>
              </div>
            </div>

            <div className="p409-doc-checklist">
              <div className="p409-doc-check-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Technician Notes</div>
              <div className="p409-doc-check-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Nursing Notes</div>
              <div className="p409-doc-check-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Physician Comments</div>
              <div className="p409-doc-check-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Incident Documentation (If any)</div>
              <div className="p409-doc-check-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Electronic Sign-offs</div>
            </div>
          </div>

          {/* Card 2: Key Reminders (Gold Tinted) */}
          <div className="p409-rail-card p409-reminders-card">
            <div className="p409-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p409-reminders-checklist">
              <div className="p409-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Ensure all fields are completed</span>
              </div>
              <div className="p409-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Report any incidents or variances</span>
              </div>
              <div className="p409-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Obtain all required sign-offs</span>
              </div>
              <div className="p409-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Documentation is legally binding</span>
              </div>
              <div className="p409-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Maintain patient confidentiality</span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="p409-rail-card">
            <div className="p409-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p409-quick-flex">
              <button type="button" className="p409-action-btn">
                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Preview Documentation</span>
              </button>
              <button type="button" className="p409-action-btn">
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Documentation</span>
              </button>
              <button type="button" className="p409-action-btn">
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export as PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p409-footer-bar">
        <div className="p409-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p409-footer-right">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            Complete &amp; Proceed to Dashboard <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
