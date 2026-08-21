import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';
import { calculateKtV, getTreatmentOutcome, saveTreatmentOutcome } from '../../ApiCalls/postDialysisApis';

// Material UI Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
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

const PRESCRIBED_VS_DELIVERED_ROWS = [
  { id: 'duration', param: 'Prescribed Duration', icon: AccessTimeOutlinedIcon, rx: '04:00 hr', del: '03:35 hr', varStr: '-00:25 hr', varPct: '-10.4%', status: 'Below Target' },
  { id: 'uf', param: 'UF Goal', icon: WaterDropOutlinedIcon, rx: '2.00 L', del: '1.65 L', varStr: '-0.35 L', varPct: '-17.5%', status: 'Below Target' },
  { id: 'bfr', param: 'Blood Flow Rate (BFR)', icon: ElectricBoltOutlinedIcon, rx: '300 mL/min', del: '298 mL/min', varStr: '-2 mL/min', varPct: '-0.7%', status: 'Achieved' },
  { id: 'dfr', param: 'Dialysate Flow Rate (DFR)', icon: WavesOutlinedIcon, rx: '500 mL/min', del: '500 mL/min', varStr: '0 mL/min', varPct: '0%', status: 'Achieved' },
  { id: 'bvp', param: 'Blood Volume Processed', icon: BloodtypeOutlinedIcon, rx: '60.0 L', del: '58.2 L', varStr: '-1.8 L', varPct: '-3.0%', status: 'Achieved' },
  { id: 'heparin', param: 'Heparin Dose', icon: VaccinesOutlinedIcon, rx: '2.0 mL', del: '2.0 mL', varStr: '0 mL', varPct: '0%', status: 'Achieved' },
  { id: 'temp', param: 'Dialysate Temperature', icon: ThermostatOutlinedIcon, rx: '36.5 °C', del: '36.5 °C', varStr: '0 °C', varPct: '0%', status: 'Achieved' },
  { id: 'dialysate', param: 'Dialysate', icon: ScienceOutlinedIcon, rx: 'Standard Bicarbonate', del: 'Standard Bicarbonate', varStr: '—', varPct: '—', status: 'Achieved' },
];

const DEVIATIONS_LIST = [
  { id: 'hypotension', label: 'Hypotension' },
  { id: 'cramps', label: 'Muscle cramps' },
  { id: 'access', label: 'Access issues' },
  { id: 'nausea', label: 'Nausea / Vomiting' },
  { id: 'early_term', label: 'Early termination' },
  { id: 'other', label: 'Other' },
];

export default function P404TreatmentOutcomeSummary({
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
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const bedStr = session.bed || patient.bed || 'B-02';

  // States for Kt/V Calculation & Adequacy
  const [preBun, setPreBun] = useState(data.preBun || data.pre_bun || '65');
  const [postBun, setPostBun] = useState(data.postBun || data.post_bun || '18');
  const [ktvSingle, setKtvSingle] = useState(data.ktvSingle || data.ktv_single || '1.32');
  const [ktvEquil, setKtvEquil] = useState(data.ktvEquil || data.ktv_equil || '1.45');
  const [urrVal, setUrrVal] = useState(data.urr || '72');
  const [pcrVal, setPcrVal] = useState(data.pcr || '1.05');
  const [isCalculating, setIsCalculating] = useState(false);

  // State for Deviations
  const [selectedDeviations, setSelectedDeviations] = useState(
    data.selectedDeviations || ['access']
  );
  const [otherDeviationNotes, setOtherDeviationNotes] = useState(
    data.otherDeviationNotes || ''
  );

  // Physician review state
  const [physicianReview, setPhysicianReview] = useState(
    data.physicianReview || 'Yes'
  );

  // Treatment notes
  const [outcomeNotes, setOutcomeNotes] = useState(data.outcomeNotes || '');

  const updateParentState = (updates) => {
    if (setData) {
      setData((old) => ({ ...old, ...updates }));
    }
  };

  const handleCalculateKtV = async () => {
    const sessionId = session.id || session.session_id || 'demo';
    setIsCalculating(true);
    const res = await calculateKtV(sessionId, {
      pre_bun: parseFloat(preBun),
      post_bun: parseFloat(postBun),
      weight: parseFloat(data.postWeight || 65.3),
      duration: data.treatmentDuration || '03:35 hr',
      uf_removed: parseFloat(data.totalUfRemoved || 1.65),
    });
    setIsCalculating(false);
    if (res.success && res.data) {
      const d = res.data.data || res.data;
      const newKtvSingle = d.ktvSingle || d.single_pool_kt_v || ktvSingle;
      const newKtvEquil = d.ktvEquil || d.equilibrated_kt_v || ktvEquil;
      const newUrr = d.urr || urrVal;
      const newPcr = d.pcr || pcrVal;
      setKtvSingle(newKtvSingle);
      setKtvEquil(newKtvEquil);
      setUrrVal(newUrr);
      setPcrVal(newPcr);
      updateParentState({
        preBun,
        postBun,
        ktvSingle: newKtvSingle,
        ktvEquil: newKtvEquil,
        urr: newUrr,
        pcr: newPcr,
      });
    }
  };

  const handleDeviationToggle = (devId) => {
    setSelectedDeviations((prev) => {
      const next = prev.includes(devId)
        ? prev.filter((id) => id !== devId)
        : [...prev, devId];
      updateParentState({ selectedDeviations: next });
      return next;
    });
  };

  const handleFormSubmit = async () => {
    const payload = {
      preBun,
      postBun,
      prescribedVsDelivered: PRESCRIBED_VS_DELIVERED_ROWS,
      adequacyMetrics: {
        ktvSinglePool: ktvSingle,
        ktvEquilibrated: ktvEquil,
        urr: urrVal,
        pcr: pcrVal,
      },
      selectedDeviations,
      otherDeviationNotes,
      physicianReview,
      outcomeNotes,
    };

    updateParentState(payload);
    const sessionId = session.id || session.session_id || 'demo';
    if (sessionId !== 'demo') {
      await saveTreatmentOutcome(sessionId, payload);
    }
    if (onSave) onSave(payload);
  };

  return (
    <div className="p404-page-wrapper">
      {/* Top Header Bar */}
      <header className="p404-top-bar">
        <div className="p404-top-bar-left">
          <h1>P4-04 – Treatment Outcome Summary</h1>
          <p>Review prescribed vs delivered treatment and evaluate dialysis adequacy.</p>
        </div>
      </header>

      {/* 10-Step Progress Stepper Bar */}
      <nav className="p404-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 4;
          const isCompleted = s.step < 4;
          return (
            <React.Fragment key={s.step}>
              <div className={`p404-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p404-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p404-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p404-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Patient Profile Header Banner */}
      <div className="p404-patient-header-banner">
        <div className="p404-patient-left">
          <div className="p404-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt={patientName}
              />
            )}
          </div>
          <div className="p404-patient-bio">
            <div className="p404-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p404-pill-active">Active</span>
            </div>
            <div className="p404-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p404-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p404-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p404-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p404-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        {/* 5 Stat Boxes */}
        <div className="p404-patient-stats">
          <div className="p404-stat-box">
            <CalendarTodayOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Treatment Start</span>
            <strong className="p404-stat-val">{startTimeStr}</strong>
          </div>

          <div className="p404-stat-box">
            <AccessTimeOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Treatment End</span>
            <strong className="p404-stat-val">{endTimeStr}</strong>
          </div>

          <div className="p404-stat-box">
            <AccessTimeOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Duration</span>
            <strong className="p404-stat-val">{durationStr}</strong>
          </div>

          <div className="p404-stat-box">
            <WaterDropOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Machine</span>
            <strong className="p404-stat-val">{machineModel}</strong>
          </div>

          <div className="p404-stat-box">
            <HotelOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Bed</span>
            <strong className="p404-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid: 8/12 Main Left + 4/12 Right Rail */}
      <div className="p404-workspace-grid">
        {/* Left Form Column */}
        <div className="p404-main-form-column">
          {/* Section 1: 1. Prescribed vs Delivered */}
          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>1. Prescribed vs Delivered</h2>
            </div>

            <div className="p404-rx-table-wrap">
              <table className="p404-rx-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Prescribed</th>
                    <th>Delivered</th>
                    <th>Variance</th>
                    <th>Variance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PRESCRIBED_VS_DELIVERED_ROWS.map((r) => {
                    const IconComponent = r.icon;
                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="p404-param-cell">
                            <IconComponent sx={{ color: '#2563eb', fontSize: 16 }} />
                            <span>{r.param}</span>
                          </div>
                        </td>
                        <td><strong>{r.rx}</strong></td>
                        <td><strong>{r.del}</strong></td>
                        <td className={r.varStr.startsWith('-') ? 'p404-neg-var' : ''}>
                          {r.varStr}
                        </td>
                        <td className={r.varPct.startsWith('-') ? 'p404-neg-var' : ''}>
                          {r.varPct}
                        </td>
                        <td>
                          <span className={`p404-status-badge ${r.status === 'Achieved' ? 'achieved' : 'below'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: 2. Dialysis Adequacy Metrics */}
          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>2. Dialysis Adequacy Metrics</h2>
            </div>

            <div className="p404-adequacy-grid">
              {/* Card 1: Kt/V Single Pool */}
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">Kt/V (Single Pool)</span>
                <strong className="p404-adeq-val">1.32</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 1.2</span>
                  <span className="p404-adeq-badge">Adequate</span>
                </div>
              </div>

              {/* Card 2: Kt/V Equilibrated */}
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">Kt/V (Equilibrated)</span>
                <strong className="p404-adeq-val">1.45</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 1.2</span>
                  <span className="p404-adeq-badge">Adequate</span>
                </div>
              </div>

              {/* Card 3: URR */}
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">URR (If Available)</span>
                <strong className="p404-adeq-val">72%</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 65%</span>
                  <span className="p404-adeq-badge">Adequate</span>
                </div>
              </div>

              {/* Card 4: PCR */}
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">PCR (g/kg/day)</span>
                <strong className="p404-adeq-val">1.05</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 0.8</span>
                  <span className="p404-adeq-badge">Adequate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 3. Treatment Notes / Variances */}
          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>3. Treatment Notes / Variances</h2>
            </div>
            <div className="p404-notes-field">
              <Textarea
                maxLength={300}
                placeholder="Enter any deviations, issues or other observations..."
                value={outcomeNotes}
                onChange={(e) => {
                  setOutcomeNotes(e.target.value);
                  updateParentState({ outcomeNotes: e.target.value });
                }}
                style={{ minHeight: 70 }}
              />
              <span className="p404-char-count">{outcomeNotes.length} / 300</span>
            </div>
          </div>

          {/* Sections 4, 5, 6 in Middle Grid */}
          <div className="p404-row-sections-456">
            {/* Card 4: Parameter Trends */}
            <div className="p404-card p404-trends-card">
              <div className="p404-card-title-row flex-between">
                <h2>4. Parameter Trends (Last 3 Sessions)</h2>
                <a href="#view-all" className="p404-link-sm" onClick={(e) => e.preventDefault()}>View All</a>
              </div>

              <div className="p404-trends-table-wrap">
                <table className="p404-trends-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>24 May</th>
                      <th>26 May</th>
                      <th>28 May (Today)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>UF Removed (L)</td>
                      <td>1.70</td>
                      <td>1.60</td>
                      <td>1.65</td>
                    </tr>
                    <tr>
                      <td>Kt/V (Single Pool)</td>
                      <td>1.28</td>
                      <td>1.31</td>
                      <td>1.32</td>
                    </tr>
                    <tr>
                      <td>URR (%)</td>
                      <td>70</td>
                      <td>71</td>
                      <td>72</td>
                    </tr>
                    <tr>
                      <td>Post Weight (kg)</td>
                      <td>66.2</td>
                      <td>65.5</td>
                      <td>65.3</td>
                    </tr>
                    <tr>
                      <td>IDWG (kg)</td>
                      <td>2.1</td>
                      <td>2.0</td>
                      <td>2.1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 5 & 6 Stacked Column */}
            <div className="p404-stacked-col">
              {/* Card 5: Deviation / Issues */}
              <div className="p404-card">
                <div className="p404-card-title-row">
                  <h2>5. Deviation / Issues (If any)</h2>
                </div>
                <div className="p404-deviations-grid">
                  {DEVIATIONS_LIST.map((dev) => (
                    <label key={dev.id} className="p404-dev-checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedDeviations.includes(dev.id)}
                        onChange={() => handleDeviationToggle(dev.id)}
                      />
                      <span>{dev.label}</span>
                      {dev.id === 'other' && selectedDeviations.includes('other') && (
                        <input
                          type="text"
                          className="p404-other-input"
                          placeholder="Specify issue..."
                          value={otherDeviationNotes}
                          onChange={(e) => {
                            setOtherDeviationNotes(e.target.value);
                            updateParentState({ otherDeviationNotes: e.target.value });
                          }}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Card 6: Physician Review Required */}
              <div className="p404-card">
                <div className="p404-card-title-row">
                  <h2>6. Physician Review Required</h2>
                </div>
                <div className="p404-physician-review-box">
                  <span className="p404-review-lbl">Send summary to nephrologist</span>
                  <div className="p404-radio-group">
                    <label className="p404-radio-item">
                      <input
                        type="radio"
                        name="physicianReview"
                        value="Yes"
                        checked={physicianReview === 'Yes'}
                        onChange={() => {
                          setPhysicianReview('Yes');
                          updateParentState({ physicianReview: 'Yes' });
                        }}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="p404-radio-item">
                      <input
                        type="radio"
                        name="physicianReview"
                        value="No"
                        checked={physicianReview === 'No'}
                        onChange={() => {
                          setPhysicianReview('No');
                          updateParentState({ physicianReview: 'No' });
                        }}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (3 Cards) */}
        <div className="p404-right-rail">
          {/* Card 1: Treatment Adequacy */}
          <div className="p404-rail-card p404-adeq-summary-card">
            <div className="p404-adeq-head">
              <div className="p404-adeq-icon">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
              </div>
              <div className="p404-adeq-text">
                <strong>Adequate</strong>
                <span>Treatment delivered as per prescription.</span>
              </div>
            </div>

            <div className="p404-adeq-metric-row">
              <div className="p404-adeq-submetric">
                <span className="p404-sub-label">Kt/V (Single Pool)</span>
                <div className="p404-sub-val-row">
                  <strong>1.32</strong>
                  <span className="p404-adeq-pill">Adequate</span>
                </div>
                <span className="p404-sub-target">Target &ge; 1.2</span>
              </div>

              <div className="p404-adeq-submetric">
                <span className="p404-sub-label">URR (If Available)</span>
                <div className="p404-sub-val-row">
                  <strong>72%</strong>
                  <span className="p404-adeq-pill">Adequate</span>
                </div>
                <span className="p404-sub-target">Target &ge; 65%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Key Reminders (Gold Tinted) */}
          <div className="p404-rail-card p404-reminders-card">
            <div className="p404-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p404-reminders-checklist">
              <div className="p404-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Review variance and ensure adequacy</span>
              </div>
              <div className="p404-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>UF goal not met (17.5% below target)</span>
              </div>
              <div className="p404-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Access flow monitored</span>
              </div>
              <div className="p404-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Kt/V within target range</span>
              </div>
              <div className="p404-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Follow up if symptoms reported</span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="p404-rail-card">
            <div className="p404-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p404-quick-actions-grid">
              <button type="button" className="p404-action-btn">
                <ShowChartOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Treatment Trends</span>
              </button>
              <button type="button" className="p404-action-btn">
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Send to Nephrologist</span>
              </button>
              <button type="button" className="p404-action-btn">
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Summary</span>
              </button>
              <button type="button" className="p404-action-btn">
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="p404-footer-bar">
        <div className="p404-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p404-footer-right">
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
