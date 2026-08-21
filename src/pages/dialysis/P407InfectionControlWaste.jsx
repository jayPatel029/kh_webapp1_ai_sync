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
import CleanHandsOutlinedIcon from '@mui/icons-material/CleanHandsOutlined';
import SanitizerOutlinedIcon from '@mui/icons-material/SanitizerOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

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

export default function P407InfectionControlWaste({
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

  // 1. PPE State
  const [glovesRemoved, setGlovesRemoved] = useState(data.glovesRemoved || 'Yes');
  const [gownRemoved, setGownRemoved] = useState(data.gownRemoved || 'Yes');
  const [maskRemoved, setMaskRemoved] = useState(data.maskRemoved || 'Yes');
  const [eyeProtRemoved, setEyeProtRemoved] = useState(data.eyeProtRemoved || 'Yes');
  const [ppeHandHygiene, setPpeHandHygiene] = useState(data.ppeHandHygiene || 'Yes');
  const [ppeComments, setPpeComments] = useState(data.ppeComments || '');

  // 2. Hand Hygiene State
  const [hhPerformed, setHhPerformed] = useState(data.hhPerformed || 'Yes');
  const [hhMethod, setHhMethod] = useState(data.hhMethod || 'Alcohol Based Hand Rub');
  const [hhComments, setHhComments] = useState(data.hhComments || '');

  // 3. Sharps Disposal State
  const [needlesInSharps, setNeedlesInSharps] = useState(data.needlesInSharps || 'Yes');
  const [sharpsSealed, setSharpsSealed] = useState(data.sharpsSealed || 'Yes');
  const [sharpsFillLevel, setSharpsFillLevel] = useState(data.sharpsFillLevel || '< 3/4 Full');
  const [sharpsComments, setSharpsComments] = useState(data.sharpsComments || '');

  // 4. Waste Segregation State
  const [wasteComments, setWasteComments] = useState(data.wasteComments || '');

  // 5. Linen Disposal State
  const [linenBagged, setLinenBagged] = useState(data.linenBagged || 'Yes');
  const [linenLaundry, setLinenLaundry] = useState(data.linenLaundry || 'Yes');
  const [linenBagSealed, setLinenBagSealed] = useState(data.linenBagSealed || 'Yes');
  const [linenComments, setLinenComments] = useState(data.linenComments || '');

  // 6. Environmental Cleaning State
  const [envExterior, setEnvExterior] = useState(data.envExterior || 'Yes');
  const [envTouchpoints, setEnvTouchpoints] = useState(data.envTouchpoints || 'Yes');
  const [envBedChair, setEnvBedChair] = useState(data.envBedChair || 'Yes');
  const [envSideRails, setEnvSideRails] = useState(data.envSideRails || 'Yes');
  const [envFloor, setEnvFloor] = useState(data.envFloor || 'Yes');
  const [envComments, setEnvComments] = useState(data.envComments || '');

  // 7. Spill Management State
  const [spillOccurred, setSpillOccurred] = useState(data.spillOccurred || 'No');
  const [spillComments, setSpillComments] = useState(data.spillComments || '');

  // 8. Isolation Compliance State
  const [isolationRequired, setIsolationRequired] = useState(data.isolationRequired || 'No');
  const [isolationComments, setIsolationComments] = useState(data.isolationComments || '');

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleFormSubmit = () => {
    const payload = {
      ppe: { glovesRemoved, gownRemoved, maskRemoved, eyeProtRemoved, ppeHandHygiene, comments: ppeComments },
      handHygiene: { hhPerformed, hhMethod, comments: hhComments },
      sharpsDisposal: { needlesInSharps, sharpsSealed, sharpsFillLevel, comments: sharpsComments },
      biomedicalWaste: { yellowBag: true, redBag: true, blueBag: true, blackBag: true, comments: wasteComments },
      linenDisposal: { linenBagged, linenLaundry, linenBagSealed, comments: linenComments },
      environmentalCleaning: { envExterior, envTouchpoints, envBedChair, envSideRails, envFloor, comments: envComments },
      spillManagement: { spillOccurred, comments: spillComments },
      isolationCompliance: { isolationRequired, comments: isolationComments },
      completedAt: '11:25 AM',
      completedBy: 'Rahul Singh (Technician)',
    };

    updateParentState(payload);
    if (onSave) onSave(payload);
  };

  return (
    <div className="p407-page-wrapper">
      {/* Top Header Bar */}
      <header className="p407-top-bar">
        <div className="p407-top-bar-left">
          <h1>P4-07 – Infection Control &amp; Waste Disposal</h1>
          <p>Ensure all infection control practices followed and waste disposed as per protocol.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p407-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 7;
          const isCompleted = s.step < 7;
          return (
            <React.Fragment key={s.step}>
              <div className={`p407-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p407-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p407-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p407-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p407-patient-header-banner">
        <div className="p407-patient-left">
          <div className="p407-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p407-patient-bio">
            <div className="p407-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p407-pill-active">Active</span>
            </div>
            <div className="p407-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p407-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p407-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p407-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p407-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes */}
        <div className="p407-patient-stats">
          <div className="p407-stat-box">
            <CalendarTodayOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Treatment Start</span>
            <strong className="p407-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p407-stat-box">
            <AccessTimeOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Treatment End</span>
            <strong className="p407-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p407-stat-box">
            <AccessTimeOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Duration</span>
            <strong className="p407-stat-val">{durationStr}</strong>
          </div>

          <div className="p407-stat-box">
            <WaterDropOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">UF Removed</span>
            <strong className="p407-stat-val">{ufRemovedStr}</strong>
          </div>

          <div className="p407-stat-box">
            <HotelOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Bed</span>
            <strong className="p407-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p407-workspace-grid">
        {/* Left Column Content */}
        <div className="p407-main-form-column">
          {/* Row 1: Cards 1 to 4 */}
          <div className="p407-cards-4col-grid">
            {/* Card 1: PPE */}
            <div className="p407-card">
              <div className="p407-card-head theme-blue">
                <CleanHandsOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                <h2>1. Personal Protective Equipment (PPE)</h2>
              </div>
              <div className="p407-checklist">
                {[
                  { label: 'Gloves removed safely', val: glovesRemoved, set: setGlovesRemoved },
                  { label: 'Gown removed', val: gownRemoved, set: setGownRemoved },
                  { label: 'Mask removed', val: maskRemoved, set: setMaskRemoved },
                  { label: 'Eye protection removed', val: eyeProtRemoved, set: setEyeProtRemoved },
                  { label: 'Hand hygiene performed', val: ppeHandHygiene, set: setPpeHandHygiene },
                ].map((item, idx) => (
                  <div key={idx} className="p407-check-row">
                    <span className="p407-check-lbl"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> {item.label}</span>
                    <div className="p407-toggle-pills">
                      <button type="button" className={`p401-pill-btn ${item.val === 'Yes' ? 'active' : ''}`} onClick={() => item.set('Yes')}>Yes</button>
                      <button type="button" className={`p401-pill-btn ${item.val === 'No' ? 'active-no' : ''}`} onClick={() => item.set('No')}>No</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{ppeComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={ppeComments} onChange={(e) => setPpeComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            {/* Card 2: Hand Hygiene */}
            <div className="p407-card">
              <div className="p407-card-head theme-purple">
                <SanitizerOutlinedIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
                <h2>2. Hand Hygiene</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Hand hygiene performed after patient care</span>
                  <div className="p407-toggle-pills">
                    <button type="button" className={`p401-pill-btn ${hhPerformed === 'Yes' ? 'active' : ''}`} onClick={() => setHhPerformed('Yes')}>Yes</button>
                    <button type="button" className={`p401-pill-btn ${hhPerformed === 'No' ? 'active-no' : ''}`} onClick={() => setHhPerformed('No')}>No</button>
                  </div>
                </div>
              </div>
              <div className="p407-form-field">
                <label>Method Used</label>
                <select value={hhMethod} onChange={(e) => setHhMethod(e.target.value)}>
                  <option value="Alcohol Based Hand Rub">Alcohol Based Hand Rub</option>
                  <option value="Soap and Water">Soap and Water</option>
                  <option value="Antiseptic Solution">Antiseptic Solution</option>
                </select>
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{hhComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={hhComments} onChange={(e) => setHhComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            {/* Card 3: Sharps Disposal */}
            <div className="p407-card">
              <div className="p407-card-head theme-red">
                <VaccinesOutlinedIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                <h2>3. Sharps Disposal</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Needles disposed in sharps container</span>
                  <div className="p407-toggle-pills">
                    <button type="button" className={`p401-pill-btn ${needlesInSharps === 'Yes' ? 'active' : ''}`} onClick={() => setNeedlesInSharps('Yes')}>Yes</button>
                    <button type="button" className={`p401-pill-btn ${needlesInSharps === 'No' ? 'active-no' : ''}`} onClick={() => setNeedlesInSharps('No')}>No</button>
                  </div>
                </div>
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Sharps container sealed</span>
                  <div className="p407-toggle-pills">
                    <button type="button" className={`p401-pill-btn ${sharpsSealed === 'Yes' ? 'active' : ''}`} onClick={() => setSharpsSealed('Yes')}>Yes</button>
                    <button type="button" className={`p401-pill-btn ${sharpsSealed === 'No' ? 'active-no' : ''}`} onClick={() => setSharpsSealed('No')}>No</button>
                  </div>
                </div>
              </div>
              <div className="p407-form-field">
                <label>Fill Level of Sharps Container</label>
                <select value={sharpsFillLevel} onChange={(e) => setSharpsFillLevel(e.target.value)}>
                  <option value="< 3/4 Full">&lt; 3/4 Full</option>
                  <option value="Full (Replaced)">Full (Replaced)</option>
                  <option value="Half Full">Half Full</option>
                </select>
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{sharpsComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={sharpsComments} onChange={(e) => setSharpsComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            {/* Card 4: Biomedical Waste Segregation */}
            <div className="p407-card">
              <div className="p407-card-head theme-gold">
                <DeleteSweepOutlinedIcon sx={{ fontSize: 18, color: '#b45309' }} />
                <h2>4. Biomedical Waste Segregation</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row-static"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Infectious waste in yellow bag</div>
                <div className="p407-check-row-static"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Soiled items in red bag</div>
                <div className="p407-check-row-static"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Recyclable waste in blue bag</div>
                <div className="p407-check-row-static"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> General waste in black bag</div>
              </div>
              <div className="p407-form-field" style={{ marginTop: 'auto' }}>
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{wasteComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={wasteComments} onChange={(e) => setWasteComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>
          </div>

          {/* Row 2: Cards 5 to 8 */}
          <div className="p407-cards-4col-grid">
            {/* Card 5: Linen Disposal */}
            <div className="p407-card">
              <div className="p407-card-head theme-green">
                <BedOutlinedIcon sx={{ fontSize: 18, color: '#15803d' }} />
                <h2>5. Linen Disposal</h2>
              </div>
              <div className="p407-checklist">
                {[
                  { label: 'Soiled linen bagged', val: linenBagged, set: setLinenBagged },
                  { label: 'Linen sent to laundry', val: linenLaundry, set: setLinenLaundry },
                  { label: 'Bag sealed', val: linenBagSealed, set: setLinenBagSealed },
                ].map((item, idx) => (
                  <div key={idx} className="p407-check-row">
                    <span className="p407-check-lbl">{item.label}</span>
                    <div className="p407-toggle-pills">
                      <button type="button" className={`p401-pill-btn ${item.val === 'Yes' ? 'active' : ''}`} onClick={() => item.set('Yes')}>Yes</button>
                      <button type="button" className={`p401-pill-btn ${item.val === 'No' ? 'active-no' : ''}`} onClick={() => item.set('No')}>No</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p407-form-field" style={{ marginTop: 'auto' }}>
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{linenComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={linenComments} onChange={(e) => setLinenComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            {/* Card 6: Environmental Cleaning */}
            <div className="p407-card">
              <div className="p407-card-head theme-teal">
                <CleaningServicesOutlinedIcon sx={{ fontSize: 18, color: '#0f766e' }} />
                <h2>6. Environmental Cleaning</h2>
              </div>
              <div className="p407-checklist">
                {[
                  { label: 'Machine exterior cleaned', val: envExterior, set: setEnvExterior },
                  { label: 'Monitor & touch points cleaned', val: envTouchpoints, set: setEnvTouchpoints },
                  { label: 'Bed / Chair cleaned', val: envBedChair, set: setEnvBedChair },
                  { label: 'Side rails cleaned', val: envSideRails, set: setEnvSideRails },
                  { label: 'Floor cleaned', val: envFloor, set: setEnvFloor },
                ].map((item, idx) => (
                  <div key={idx} className="p407-check-row">
                    <span className="p407-check-lbl">{item.label}</span>
                    <div className="p407-toggle-pills">
                      <button type="button" className={`p401-pill-btn ${item.val === 'Yes' ? 'active' : ''}`} onClick={() => item.set('Yes')}>Yes</button>
                      <button type="button" className={`p401-pill-btn ${item.val === 'No' ? 'active-no' : ''}`} onClick={() => item.set('No')}>No</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{envComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={envComments} onChange={(e) => setEnvComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            {/* Card 7: Spill Management */}
            <div className="p407-card">
              <div className="p407-card-head theme-amber">
                <OpacityOutlinedIcon sx={{ fontSize: 18, color: '#c2410c' }} />
                <h2>7. Spill Management (If any)</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Spill Occurred</span>
                  <div className="p407-toggle-pills">
                    <button type="button" className={`p401-pill-btn ${spillOccurred === 'Yes' ? 'active-early' : ''}`} onClick={() => setSpillOccurred('Yes')}>Yes</button>
                    <button type="button" className={`p401-pill-btn ${spillOccurred === 'No' ? 'active' : ''}`} onClick={() => setSpillOccurred('No')}>No</button>
                  </div>
                </div>
              </div>
              <div className="p407-info-box-sm">No spill reported during this session.</div>
              <div className="p407-form-field" style={{ marginTop: 'auto' }}>
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{spillComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={spillComments} onChange={(e) => setSpillComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            {/* Card 8: Isolation Compliance */}
            <div className="p407-card">
              <div className="p407-card-head theme-blue">
                <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />
                <h2>8. Isolation Compliance (If applicable)</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Isolation Required</span>
                  <div className="p407-toggle-pills">
                    <button type="button" className={`p401-pill-btn ${isolationRequired === 'Yes' ? 'active-early' : ''}`} onClick={() => setIsolationRequired('Yes')}>Yes</button>
                    <button type="button" className={`p401-pill-btn ${isolationRequired === 'No' ? 'active' : ''}`} onClick={() => setIsolationRequired('No')}>No</button>
                  </div>
                </div>
              </div>
              <div className="p407-info-box-sm">No isolation precautions required.</div>
              <div className="p407-form-field" style={{ marginTop: 'auto' }}>
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{isolationComments.length}/200</span></div>
                <Textarea maxLength={200} placeholder="Enter comments..." value={isolationComments} onChange={(e) => setIsolationComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>
          </div>

          {/* Bottom Completion Banner Box */}
          <div className="p407-completion-banner-card">
            <div className="p407-banner-left">
              <div className="p407-banner-icon-wrap">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 22 }} />
              </div>
              <div className="p407-banner-text">
                <strong>Infection Control Checklist Completed</strong>
                <span>All required infection control and waste disposal steps have been documented.</span>
              </div>
            </div>
            <div className="p407-banner-meta">
              <div className="p407-meta-item">
                <span>Completed At</span>
                <strong>11:25 AM</strong>
              </div>
              <div className="p407-meta-item">
                <span>Completed By</span>
                <strong>Rahul Singh (Technician)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (3 Stacked Cards) */}
        <div className="p407-right-rail">
          {/* Card 1: Compliance Overview */}
          <div className="p407-rail-card">
            <div className="p407-rail-header">
              <h3>Compliance Overview</h3>
            </div>
            <div className="p407-compliance-body">
              <div className="p407-donut-wrap">
                <svg viewBox="0 0 100 100" width="84" height="84">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#16a34a" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
                  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">100%</text>
                </svg>
              </div>
              <div className="p407-compliance-legend">
                <div className="p407-comp-row">
                  <span className="p407-dot-green" /> Completed <strong>8 / 8</strong>
                </div>
                <div className="p407-comp-row">
                  <span className="p407-dot-amber" /> Pending <strong>0 / 8</strong>
                </div>
                <div className="p407-comp-row">
                  <span className="p407-dot-red" /> Not Completed <strong>0 / 8</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Key Reminders (Gold Tinted) */}
          <div className="p407-rail-card p407-reminders-card">
            <div className="p407-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p407-reminders-checklist">
              <div className="p407-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Always perform hand hygiene</span>
              </div>
              <div className="p407-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Dispose sharps immediately</span>
              </div>
              <div className="p407-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Segregate waste correctly</span>
              </div>
              <div className="p407-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Clean all equipment &amp; surfaces</span>
              </div>
              <div className="p407-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Document any incidents/spills</span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="p407-rail-card">
            <div className="p407-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p407-quick-flex">
              <button type="button" className="p407-action-btn">
                <ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Report Incident</span>
              </button>
              <button type="button" className="p407-action-btn">
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Infection Control SOP</span>
              </button>
              <button type="button" className="p407-action-btn">
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Checklist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p407-footer-bar">
        <div className="p407-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p407-footer-right">
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
