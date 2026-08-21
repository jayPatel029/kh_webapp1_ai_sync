import React from 'react';
import { Button, Card, CardBody, Input, Select, Textarea } from '../../component-library';
import { savePatientFeedback, closeSession } from '../../ApiCalls/postDialysisApis';

// Material UI Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StarIcon from '@mui/icons-material/Star';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

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

export default function P410SessionComplete({
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
  const ufGoalStr = session.ufGoal ? `${session.ufGoal} L` : '1.70 L';
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const bedStr = session.bed || patient.bed || 'B-02';

  const bpPost = data.systolic && data.diastolic ? `${data.systolic} / ${data.diastolic}` : '126 / 78';
  const weightPost = data.postWeight ? `${data.postWeight}` : '65.30';
  const pulsePost = data.pulse || '82';
  const spo2Post = data.spo2 || '98';
  const tempPost = data.temperature || '36.6';

  const handleFormSubmit = async () => {
    const payload = {
      completedAt: '28 May 2025, 11:20 AM',
      completedBy: 'Rahul Singh (Technician)',
      overallStatus: 'Completed',
      treatmentQuality: 'Excellent',
      treatmentTolerance: 'Good',
      nextAppointment: '30 May 2025, 07:45 AM',
      sessionCompleted: true,
      feedbackCondition: data.feedbackCondition || 'Good',
      painLevel: data.painLevel || 2,
      patientComments: data.patientComments || 'Feeling better today. No discomfort.',
      satisfaction: data.satisfaction || 5,
    };

    const sessionId = session.id || session.session_id || 'demo';
    if (sessionId !== 'demo') {
      await savePatientFeedback(sessionId, payload);
      await closeSession(sessionId, payload);
    }

    if (onSave) onSave(payload);
  };

  return (
    <div className="p410-page-wrapper">
      {/* Top Header Bar */}
      <header className="p410-top-bar">
        <div className="p410-top-bar-left">
          <h1>
            P4-10 – Session Complete <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
          </h1>
          <p>Review final outcome, key metrics and ensure all post-dialysis tasks are complete.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar (All Completed) */}
      <nav className="p410-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 10;
          return (
            <React.Fragment key={s.step}>
              <div className={`p410-stepper-item ${isActive ? 'active' : 'completed'}`}>
                <div className="p410-stepper-circle">
                  {s.step === 10 ? '10' : '✓'}
                </div>
                <span className="p410-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p410-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p410-patient-header-banner">
        <div className="p410-patient-left">
          <div className="p410-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
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
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes */}
        <div className="p410-patient-stats">
          <div className="p410-stat-box">
            <CalendarTodayOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Treatment Start</span>
            <strong className="p410-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p410-stat-box">
            <AccessTimeOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Treatment End</span>
            <strong className="p410-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p410-stat-box">
            <AccessTimeOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Duration</span>
            <strong className="p410-stat-val">{durationStr}</strong>
          </div>

          <div className="p410-stat-box">
            <WaterDropOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">UF Removed</span>
            <strong className="p410-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p410-stat-box">
            <HotelOutlinedIcon className="p410-stat-icon" />
            <span className="p410-stat-lbl">Machine</span>
            <strong className="p410-stat-val">{machineModel}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p410-workspace-grid">
        {/* Left Column Content */}
        <div className="p410-main-form-column">
          {/* Row 1 Cards: Celebration + Key Outcomes + UF Summary */}
          <div className="p410-row1-grid">
            {/* Card 1: Celebration Banner Card */}
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
                    <strong>28 May 2025, 11:20 AM</strong>
                  </div>
                </div>

                <div className="p410-celeb-meta-item">
                  <span className="p410-user-icon-badge">👤</span>
                  <div>
                    <span>Completed By</span>
                    <strong>Rahul Singh (Technician)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Key Treatment Outcomes Table */}
            <div className="p410-card">
              <div className="p410-card-title-row">
                <h2>Key Treatment Outcomes</h2>
              </div>

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
                      <td>148 / 86</td>
                      <td>{bpPost}</td>
                      <td><span className="p410-chg-green">↓ 22 / 8</span></td>
                    </tr>
                    <tr>
                      <td>Weight (kg)</td>
                      <td>66.95</td>
                      <td>{weightPost}</td>
                      <td><span className="p410-chg-green">↓ 1.65</span></td>
                    </tr>
                    <tr>
                      <td>Pulse (bpm)</td>
                      <td>88</td>
                      <td>{pulsePost}</td>
                      <td><span className="p410-chg-green">↓ 6</span></td>
                    </tr>
                    <tr>
                      <td>SpO₂ (%)</td>
                      <td>98</td>
                      <td>{spo2Post}</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>Temperature (°C)</td>
                      <td>36.7</td>
                      <td>{tempPost}</td>
                      <td><span className="p410-chg-green">↓ 0.1</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 3: Ultrafiltration Summary Gauge */}
            <div className="p410-card">
              <div className="p410-card-title-row">
                <h2>Ultrafiltration Summary</h2>
              </div>

              <div className="p410-uf-gauge-wrapper">
                <svg viewBox="0 0 100 60" width="140" height="85">
                  <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 10,50 A 40,40 0 0,1 88,38" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
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
                  <span className="p410-achieved-badge">✓ 97%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 Cards: Timeline + Post Vitals + Access Assessment */}
          <div className="p410-row2-grid">
            {/* Card 4: Session Timeline */}
            <div className="p410-card">
              <div className="p410-card-title-row">
                <h2>Session Timeline</h2>
              </div>

              <div className="p410-timeline-list">
                {[
                  { time: '07:45 AM', label: 'Treatment started' },
                  { time: '10:55 AM', label: 'Blood returned & terminated' },
                  { time: '11:00 AM', label: 'Post-dialysis vitals recorded' },
                  { time: '11:05 AM', label: 'Medications reviewed' },
                  { time: '11:10 AM', label: 'Disinfection & machine turnover completed' },
                  { time: '11:15 AM', label: 'Patient discharged' },
                  { time: '11:20 AM', label: 'Documentation & sign-off completed' },
                ].map((t, idx) => (
                  <div key={idx} className="p410-timeline-row">
                    <span className="p410-tl-dot">✓</span>
                    <span className="p410-tl-time">{t.time}</span>
                    <span className="p410-tl-label">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Post-Dialysis Vitals */}
            <div className="p410-card">
              <div className="p410-card-title-row">
                <FavoriteBorderOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <h2>Post-Dialysis Vitals</h2>
              </div>

              <div className="p410-vitals-list">
                <div className="p410-vital-row"><span>Blood Pressure</span><strong>{bpPost} mmHg</strong></div>
                <div className="p410-vital-row"><span>Heart Rate</span><strong>{pulsePost} bpm</strong></div>
                <div className="p410-vital-row"><span>SpO₂</span><strong>{spo2Post} %</strong></div>
                <div className="p410-vital-row"><span>Temperature</span><strong>{tempPost} °C</strong></div>
                <div className="p410-vital-row"><span>Respiratory Rate</span><strong>16 /min</strong></div>
              </div>
            </div>

            {/* Card 6: Access Site Assessment */}
            <div className="p410-card">
              <div className="p410-card-title-row">
                <ShieldOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h2>Access Site Assessment</h2>
              </div>

              <div className="p410-access-grid">
                <div className="p410-access-row"><span>Bleeding</span><span className="p410-check-text">✓ None</span></div>
                <div className="p410-access-row"><span>Thrill</span><span className="p410-check-text">✓ Present</span></div>
                <div className="p410-access-row"><span>Bruit</span><span className="p410-check-text">✓ Present</span></div>
                <div className="p410-access-row"><span>Swelling</span><span className="p410-check-text">✓ None</span></div>
              </div>

              <div className="p410-form-field">
                <label>Comments</label>
                <div className="p410-comment-readonly">Access site clean and dry. No complications.</div>
              </div>
            </div>
          </div>

          {/* Row 3 Card: Patient Feedback (Full Width) */}
          <div className="p410-card p410-feedback-card">
            <div className="p410-card-title-row">
              <StarIcon sx={{ color: '#eab308', fontSize: 18 }} />
              <h2>Patient Feedback</h2>
            </div>

            <div className="p410-feedback-grid">
              <div className="p410-fb-col">
                <span className="p410-fb-lbl">Patient Condition</span>
                <div className="p410-fb-val flex-center">
                  <SentimentSatisfiedAltOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  <strong>Good</strong>
                </div>
              </div>

              <div className="p410-fb-col">
                <span className="p410-fb-lbl">Pain Level (0-10)</span>
                <div className="p410-pain-pill-box">
                  <strong>2 / 10</strong>
                </div>
              </div>

              <div className="p410-fb-col flex-2">
                <span className="p410-fb-lbl">Patient Comments</span>
                <div className="p410-comment-readonly">Feeling better today. No discomfort.</div>
              </div>

              <div className="p410-fb-col">
                <span className="p410-fb-lbl">Patient Satisfaction</span>
                <div className="p410-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} sx={{ color: '#eab308', fontSize: 18 }} />
                  ))}
                  <strong>5/5</strong>
                  <span className="p410-sat-txt">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (3 Stacked Cards) */}
        <div className="p410-right-rail">
          {/* Card 1: Session Complete (Green Tinted Card) */}
          <div className="p410-rail-card p410-complete-summary-card">
            <div className="p410-comp-head">
              <div className="p410-comp-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 26 }} />
              </div>
              <div className="p410-comp-text">
                <strong>Session Complete</strong>
                <span>All tasks completed successfully.</span>
              </div>
            </div>

            <div className="p410-comp-metrics">
              <div className="p410-comp-row"><span>Overall Status</span><span className="p410-pill-completed">Completed</span></div>
              <div className="p410-comp-row">
                <span>Treatment Quality</span>
                <div className="p410-mini-stars">
                  {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} sx={{ color: '#eab308', fontSize: 13 }} />)}
                  <strong>Excellent</strong>
                </div>
              </div>
              <div className="p410-comp-row"><span>Treatment Tolerance</span><span className="p410-tol-good">🙂 Good</span></div>
              <div className="p410-comp-row"><span>Next Appointment</span><strong>📅 30 May 2025 07:45 AM</strong></div>
            </div>
          </div>

          {/* Card 2: Summary Checklist */}
          <div className="p410-rail-card">
            <div className="p410-rail-header">
              <h3>Summary Checklist</h3>
            </div>
            <div className="p410-summary-chk-list">
              <div className="p410-chk-item"><span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> All Treatment Steps</span><span className="p410-chk-complete">Complete</span></div>
              <div className="p410-chk-item"><span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Disinfection &amp; Turnover</span><span className="p410-chk-complete">Complete</span></div>
              <div className="p410-chk-item"><span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Infection Control</span><span className="p410-chk-complete">Complete</span></div>
              <div className="p410-chk-item"><span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Discharge</span><span className="p410-chk-complete">Complete</span></div>
              <div className="p410-chk-item"><span><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /> Documentation &amp; Sign-off</span><span className="p410-chk-complete">Complete</span></div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="p410-rail-card">
            <div className="p410-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p410-quick-flex">
              <button type="button" className="p410-action-btn">
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Session Summary</span>
              </button>
              <button type="button" className="p410-action-btn">
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Session Summary</span>
              </button>
              <button type="button" className="p410-action-btn">
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Share with Nephrologist</span>
              </button>
              <button type="button" className="p410-action-btn">
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export Session Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p410-footer-bar">
        <div className="p410-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p410-footer-right">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> Complete &amp; Close Session
          </Button>
        </div>
      </footer>
    </div>
  );
}
