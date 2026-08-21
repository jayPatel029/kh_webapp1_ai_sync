import React, { useState } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
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

const DEFAULT_MEDICATIONS = [
  { id: 1, name: 'Epoetin Alfa (Erythropoietin)', dose: '4000 IU', route: 'IV', indication: 'Anemia', scheduledTime: '08:00 AM', status: 'Given', givenAt: '08:05 AM', givenBy: 'Rahul Singh' },
  { id: 2, name: 'Iron Sucrose', dose: '100 mg', route: 'IV', indication: 'Iron Deficiency', scheduledTime: '08:15 AM', status: 'Given', givenAt: '08:18 AM', givenBy: 'Rahul Singh' },
  { id: 3, name: 'Calcitriol', dose: '0.25 mcg', route: 'PO', indication: 'Secondary Hyperpara', scheduledTime: '09:00 AM', status: 'Given', givenAt: '09:02 AM', givenBy: 'Rahul Singh' },
  { id: 4, name: 'Heparin (Maintenance)', dose: '1000 IU/hr', route: 'IV', indication: 'Anticoagulation', scheduledTime: 'During Dialysis', status: 'Given', givenAt: '07:50 AM', givenBy: 'Rahul Singh' },
  { id: 5, name: 'Paracetamol', dose: '500 mg', route: 'PO', indication: 'Pain', scheduledTime: '10:30 AM', status: 'Missed', givenAt: '—', givenBy: '—' },
];

const INVESTIGATIONS_LIST = [
  { id: 'hb', label: 'Hemoglobin' },
  { id: 'ferritin', label: 'Serum Ferritin' },
  { id: 'pth', label: 'PTH' },
  { id: 'calcium', label: 'Calcium' },
  { id: 'phosphorus', label: 'Phosphorus' },
  { id: 'other', label: 'Other' },
];

export default function P405MedicationFollowUp({
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

  // Active filter tab state
  const [activeTab, setActiveTab] = useState('All');

  // Medication list state
  const [medications, setMedications] = useState(
    data.medications || DEFAULT_MEDICATIONS
  );

  // Section 2: Missed / Held Details State
  const [missedReason, setMissedReason] = useState(data.missedReason || '');
  const [notifiedPhysician, setNotifiedPhysician] = useState(data.notifiedPhysician || 'Yes');
  const [physicianInstruction, setPhysicianInstruction] = useState(data.physicianInstruction || '');
  const [followupAction, setFollowupAction] = useState(data.followupAction || '');
  const [missedComments, setMissedComments] = useState(data.missedComments || '');

  // Section 3: Adverse Drug Reaction (ADR) State
  const [adrObserved, setAdrObserved] = useState(data.adrObserved || 'No');
  const [adrDetails, setAdrDetails] = useState(data.adrDetails || '');
  const [adrSeverity, setAdrSeverity] = useState(data.adrSeverity || '');
  const [adrActionTaken, setAdrActionTaken] = useState(data.adrActionTaken || '');

  // Section 4: Follow-up Plan State
  const [nextMedDate, setNextMedDate] = useState(data.nextMedDate || '2025-05-28');
  const [nextMedTime, setNextMedTime] = useState(data.nextMedTime || '08:00 AM');
  const [selectedInvestigations, setSelectedInvestigations] = useState(
    data.selectedInvestigations || ['hb', 'ferritin']
  );
  const [otherInvestigationText, setOtherInvestigationText] = useState(data.otherInvestigationText || '');
  const [physicianReviewRequired, setPhysicianReviewRequired] = useState(data.physicianReviewRequired || 'Yes');
  const [reviewDate, setReviewDate] = useState(data.reviewDate || '2025-06-04');
  const [followupNotes, setFollowupNotes] = useState(data.followupNotes || '');

  // Patient Education Provided State
  const [educationItems, setEducationItems] = useState(
    data.educationItems || ['adherence', 'diet', 'access']
  );
  const [educationDateTime, setEducationDateTime] = useState(
    data.educationDateTime || '28 May 2025, 11:22 AM'
  );

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleInvestigationToggle = (invId) => {
    setSelectedInvestigations((prev) => {
      const next = prev.includes(invId)
        ? prev.filter((id) => id !== invId)
        : [...prev, invId];
      updateParentState({ selectedInvestigations: next });
      return next;
    });
  };

  const handleEducationToggle = (eduId) => {
    setEducationItems((prev) => {
      const next = prev.includes(eduId)
        ? prev.filter((id) => id !== eduId)
        : [...prev, eduId];
      updateParentState({ educationItems: next });
      return next;
    });
  };

  // Filtered meds based on tab
  const filteredMeds = medications.filter((m) => {
    if (activeTab === 'Given') return m.status === 'Given';
    if (activeTab === 'Missed/Held') return m.status === 'Missed' || m.status === 'Held';
    return true;
  });

  const totalScheduled = medications.length;
  const givenCount = medications.filter((m) => m.status === 'Given').length;
  const missedCount = medications.filter((m) => m.status === 'Missed' || m.status === 'Held').length;

  const handleFormSubmit = () => {
    const payload = {
      medications,
      missedReason,
      notifiedPhysician,
      physicianInstruction,
      followupAction,
      missedComments,
      adrObserved,
      adrDetails,
      adrSeverity,
      adrActionTaken,
      nextMedDate,
      nextMedTime,
      selectedInvestigations,
      otherInvestigationText,
      physicianReviewRequired,
      reviewDate,
      followupNotes,
      educationItems,
      educationDateTime,
    };

    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  return (
    <div className="p405-page-wrapper">
      {/* Top Header Bar */}
      <header className="p405-top-bar">
        <div className="p405-top-bar-left">
          <h1>P4-05 – Medication &amp; Follow-up</h1>
          <p>Review medications given, missed or held and plan follow-up care.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p405-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 5;
          const isCompleted = s.step < 5;
          return (
            <React.Fragment key={s.step}>
              <div className={`p405-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p405-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p405-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p405-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p405-patient-header-banner">
        <div className="p405-patient-left">
          <div className="p405-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p405-patient-bio">
            <div className="p405-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p405-pill-active">Active</span>
            </div>
            <div className="p405-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p405-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p405-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p405-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p405-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes */}
        <div className="p405-patient-stats">
          <div className="p405-stat-box">
            <CalendarTodayOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Treatment Start</span>
            <strong className="p405-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p405-stat-box">
            <AccessTimeOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Treatment End</span>
            <strong className="p405-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p405-stat-box">
            <AccessTimeOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Duration</span>
            <strong className="p405-stat-val">{durationStr}</strong>
          </div>

          <div className="p405-stat-box">
            <WaterDropOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">UF Removed</span>
            <strong className="p405-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p405-stat-box">
            <HotelOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Bed</span>
            <strong className="p405-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p405-workspace-grid">
        {/* Left Column Content */}
        <div className="p405-main-form-column">
          {/* Section 1: 1. Medications Administered During Dialysis */}
          <div className="p405-card">
            <div className="p405-card-header-flex">
              <h2>1. Medications Administered During Dialysis</h2>
              <Button type="button" size="sm" variant="outline" className="p405-add-med-btn">
                <AddOutlinedIcon sx={{ fontSize: 16 }} /> Add Medication
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="p405-tabs-row">
              <button
                type="button"
                className={`p405-tab ${activeTab === 'All' ? 'active' : ''}`}
                onClick={() => setActiveTab('All')}
              >
                All ({totalScheduled})
              </button>
              <button
                type="button"
                className={`p405-tab ${activeTab === 'Given' ? 'active' : ''}`}
                onClick={() => setActiveTab('Given')}
              >
                Given ({givenCount})
              </button>
              <button
                type="button"
                className={`p405-tab ${activeTab === 'Missed/Held' ? 'active' : ''}`}
                onClick={() => setActiveTab('Missed/Held')}
              >
                Missed/Held ({missedCount})
              </button>
            </div>

            {/* Medications Table */}
            <div className="p405-table-wrap">
              <table className="p405-meds-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dose</th>
                    <th>Route</th>
                    <th>Indication</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Given At</th>
                    <th>Given By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="p405-med-cell">
                          {m.status === 'Given' ? (
                            <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                          ) : (
                            <CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 16 }} />
                          )}
                          <strong>{m.name}</strong>
                        </div>
                      </td>
                      <td>{m.dose}</td>
                      <td>{m.route}</td>
                      <td>{m.indication}</td>
                      <td>{m.scheduledTime}</td>
                      <td>
                        <span className={`p405-status-pill ${m.status.toLowerCase()}`}>
                          {m.status}
                        </span>
                      </td>
                      <td>{m.givenAt}</td>
                      <td>{m.givenBy}</td>
                      <td>
                        <button type="button" className="p405-action-icon-btn" title="Edit">
                          <EditOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend Footer */}
            <div className="p405-table-legend">
              <span className="p405-legend-item"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Given</span>
              <span className="p405-legend-item"><span className="p405-dot-held" /> Held</span>
              <span className="p405-legend-item"><CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 14 }} /> Missed</span>
            </div>
          </div>

          {/* Bottom 3-Column Split: Sections 2, 3, 4 */}
          <div className="p405-bottom-3col-grid">
            {/* Section 2: 2. Missed / Held Medication Details (Light Pink Card) */}
            <div className="p405-card p405-card-missed">
              <div className="p405-card-title-row">
                <h2>2. Missed / Held Medication Details</h2>
              </div>

              <div className="p405-form-field">
                <label>Reason *</label>
                <select
                  value={missedReason}
                  onChange={(e) => {
                    setMissedReason(e.target.value);
                    updateParentState({ missedReason: e.target.value });
                  }}
                >
                  <option value="">Select reason</option>
                  <option value="Patient Refused">Patient Refused</option>
                  <option value="Low Blood Pressure">Low Blood Pressure</option>
                  <option value="Physician Hold">Physician Hold</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div className="p405-form-field">
                <label>Notified Physician</label>
                <div className="p405-toggle-pills">
                  <button
                    type="button"
                    className={`p401-pill-btn ${notifiedPhysician === 'Yes' ? 'active' : ''}`}
                    onClick={() => {
                      setNotifiedPhysician('Yes');
                      updateParentState({ notifiedPhysician: 'Yes' });
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`p401-pill-btn ${notifiedPhysician === 'No' ? 'active-no' : ''}`}
                    onClick={() => {
                      setNotifiedPhysician('No');
                      updateParentState({ notifiedPhysician: 'No' });
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="p405-form-field">
                <div className="p405-notes-label">
                  <label>Physician Instruction</label>
                  <span className="p405-char-count">{physicianInstruction.length} / 200</span>
                </div>
                <Textarea
                  maxLength={200}
                  placeholder="Enter instructions..."
                  value={physicianInstruction}
                  onChange={(e) => {
                    setPhysicianInstruction(e.target.value);
                    updateParentState({ physicianInstruction: e.target.value });
                  }}
                  style={{ minHeight: 50 }}
                />
              </div>

              <div className="p405-form-field">
                <label>Follow-up Action</label>
                <select
                  value={followupAction}
                  onChange={(e) => {
                    setFollowupAction(e.target.value);
                    updateParentState({ followupAction: e.target.value });
                  }}
                >
                  <option value="">Select action</option>
                  <option value="Reschedule for next session">Reschedule for next session</option>
                  <option value="Administer at discharge">Administer at discharge</option>
                  <option value="Discontinue">Discontinue</option>
                </select>
              </div>

              <div className="p405-form-field">
                <div className="p405-notes-label">
                  <label>Comments</label>
                  <span className="p405-char-count">{missedComments.length} / 300</span>
                </div>
                <Textarea
                  maxLength={300}
                  placeholder="Enter comments..."
                  value={missedComments}
                  onChange={(e) => {
                    setMissedComments(e.target.value);
                    updateParentState({ missedComments: e.target.value });
                  }}
                  style={{ minHeight: 50 }}
                />
              </div>
            </div>

            {/* Section 3: 3. Adverse Drug Reaction (If any) */}
            <div className="p405-card">
              <div className="p405-card-title-row">
                <h2>3. Adverse Drug Reaction (If any)</h2>
              </div>

              <div className="p405-form-field">
                <label>Any ADR Observed?</label>
                <div className="p405-toggle-pills">
                  <button
                    type="button"
                    className={`p401-pill-btn ${adrObserved === 'Yes' ? 'active-early' : ''}`}
                    onClick={() => {
                      setAdrObserved('Yes');
                      updateParentState({ adrObserved: 'Yes' });
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`p401-pill-btn ${adrObserved === 'No' ? 'active' : ''}`}
                    onClick={() => {
                      setAdrObserved('No');
                      updateParentState({ adrObserved: 'No' });
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="p405-form-field">
                <div className="p405-notes-label">
                  <label>ADR Details</label>
                  <span className="p405-char-count">{adrDetails.length} / 200</span>
                </div>
                <Textarea
                  maxLength={200}
                  placeholder="Enter reaction details..."
                  value={adrDetails}
                  onChange={(e) => {
                    setAdrDetails(e.target.value);
                    updateParentState({ adrDetails: e.target.value });
                  }}
                  style={{ minHeight: 50 }}
                />
              </div>

              <div className="p405-form-field">
                <label>Severity</label>
                <select
                  value={adrSeverity}
                  onChange={(e) => {
                    setAdrSeverity(e.target.value);
                    updateParentState({ adrSeverity: e.target.value });
                  }}
                >
                  <option value="">Select severity</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div className="p405-form-field">
                <div className="p405-notes-label">
                  <label>Action Taken</label>
                  <span className="p405-char-count">{adrActionTaken.length} / 300</span>
                </div>
                <Textarea
                  maxLength={300}
                  placeholder="Enter action taken..."
                  value={adrActionTaken}
                  onChange={(e) => {
                    setAdrActionTaken(e.target.value);
                    updateParentState({ adrActionTaken: e.target.value });
                  }}
                  style={{ minHeight: 50 }}
                />
              </div>
            </div>

            {/* Section 4: 4. Follow-up Plan */}
            <div className="p405-card">
              <div className="p405-card-title-row">
                <h2>4. Follow-up Plan</h2>
              </div>

              <div className="p405-form-field">
                <label>Next Medication Due</label>
                <div className="p405-date-time-flex">
                  <input
                    type="date"
                    value={nextMedDate}
                    onChange={(e) => {
                      setNextMedDate(e.target.value);
                      updateParentState({ nextMedDate: e.target.value });
                    }}
                  />
                  <input
                    type="text"
                    value={nextMedTime}
                    onChange={(e) => {
                      setNextMedTime(e.target.value);
                      updateParentState({ nextMedTime: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="p405-form-field">
                <label>Follow-up Investigations</label>
                <div className="p405-investigations-grid">
                  {INVESTIGATIONS_LIST.map((inv) => (
                    <label key={inv.id} className="p405-inv-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedInvestigations.includes(inv.id)}
                        onChange={() => handleInvestigationToggle(inv.id)}
                      />
                      <span>{inv.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p405-form-field">
                <label>Physician Review Required</label>
                <div className="p405-toggle-pills">
                  <button
                    type="button"
                    className={`p401-pill-btn ${physicianReviewRequired === 'Yes' ? 'active' : ''}`}
                    onClick={() => {
                      setPhysicianReviewRequired('Yes');
                      updateParentState({ physicianReviewRequired: 'Yes' });
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`p401-pill-btn ${physicianReviewRequired === 'No' ? 'active-no' : ''}`}
                    onClick={() => {
                      setPhysicianReviewRequired('No');
                      updateParentState({ physicianReviewRequired: 'No' });
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              {physicianReviewRequired === 'Yes' && (
                <div className="p405-form-field">
                  <label>Review Date</label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => {
                      setReviewDate(e.target.value);
                      updateParentState({ reviewDate: e.target.value });
                    }}
                  />
                </div>
              )}

              <div className="p405-form-field">
                <div className="p405-notes-label">
                  <label>Notes / Instructions</label>
                  <span className="p405-char-count">{followupNotes.length} / 300</span>
                </div>
                <Textarea
                  maxLength={300}
                  placeholder="Enter notes for follow-up..."
                  value={followupNotes}
                  onChange={(e) => {
                    setFollowupNotes(e.target.value);
                    updateParentState({ followupNotes: e.target.value });
                  }}
                  style={{ minHeight: 50 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (4 Stacked Cards) */}
        <div className="p405-right-rail">
          {/* Card 1: Medication Summary */}
          <div className="p405-rail-card">
            <div className="p405-rail-header">
              <h3>Medication Summary</h3>
            </div>
            <div className="p405-summary-rows">
              <div className="p405-summary-row">
                <div className="p405-sum-left">
                  <VaccinesOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                  <span>Total Scheduled</span>
                </div>
                <strong>{totalScheduled}</strong>
              </div>
              <div className="p405-summary-row">
                <div className="p405-sum-left">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <span>Given</span>
                </div>
                <strong>{givenCount} ({Math.round((givenCount / totalScheduled) * 100)}%)</strong>
              </div>
              <div className="p405-summary-row">
                <div className="p405-sum-left">
                  <CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                  <span>Missed / Held</span>
                </div>
                <strong>{missedCount} ({Math.round((missedCount / totalScheduled) * 100)}%)</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Pending Actions (Gold Tinted) */}
          <div className="p405-rail-card p405-pending-card">
            <div className="p405-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Pending Actions</h3>
            </div>
            <div className="p405-pending-list">
              <div className="p405-pending-row">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 16 }} />
                <span>1 medication missed</span>
              </div>
              <div className="p405-pending-row">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 16 }} />
                <span>Physician review required</span>
              </div>
              <div className="p405-pending-row">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 16 }} />
                <span>Follow-up investigations pending</span>
              </div>
            </div>
            <button type="button" className="p405-view-details-btn">
              View Details
            </button>
          </div>

          {/* Card 3: Patient Education Provided */}
          <div className="p405-rail-card">
            <div className="p405-rail-header">
              <h3>Patient Education Provided</h3>
            </div>
            <div className="p405-edu-list">
              {[
                { id: 'adherence', label: 'Medication adherence' },
                { id: 'diet', label: 'Diet & fluid restrictions' },
                { id: 'access', label: 'Access care' },
                { id: 'seek_help', label: 'When to seek help' },
              ].map((item) => (
                <label key={item.id} className="p405-edu-checkbox">
                  <input
                    type="checkbox"
                    checked={educationItems.includes(item.id)}
                    onChange={() => handleEducationToggle(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="p405-edu-time-box">
              <label>Education Date &amp; Time</label>
              <input
                type="text"
                value={educationDateTime}
                onChange={(e) => {
                  setEducationDateTime(e.target.value);
                  updateParentState({ educationDateTime: e.target.value });
                }}
              />
            </div>
          </div>

          {/* Card 4: Quick Actions */}
          <div className="p405-rail-card">
            <div className="p405-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p405-quick-flex">
              <button type="button" className="p405-action-btn">
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Send to Nephrologist</span>
              </button>
              <button type="button" className="p405-action-btn">
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Medication Summary</span>
              </button>
              <button type="button" className="p405-action-btn">
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Add Follow-up Reminder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p405-footer-bar">
        <div className="p405-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p405-footer-right">
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
