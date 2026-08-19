import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons for Right Rail & Section Headers
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import bloodReturnDiagram from '../../assets/blood_return_diagram.svg';

const TERMINATION_STEPS = [
  { id: 1, label: 'Stop UF', description: 'Halt ultrafiltration pump operation', defaultTime: '07:15 AM' },
  { id: 2, label: 'Reduce Blood Pump Speed', description: 'Set blood flow rate to 100 mL/min', defaultTime: '07:20 AM' },
  { id: 3, label: 'Saline Rinse-Back', description: 'Initiate saline infusion (Priming vol: 200 mL)', defaultTime: '07:22 AM' },
  { id: 4, label: 'Return Blood', description: 'Flush remaining blood back into arterial & venous lines', defaultTime: '07:24 AM' },
  { id: 5, label: 'Clamp Blood Lines', description: 'Clamp arterial and venous lines securely', defaultTime: '07:25 AM' },
  { id: 6, label: 'Stop Blood Pump', description: 'Turn off blood pump module completely', defaultTime: '07:26 AM' },
  { id: 7, label: 'Disconnect Blood Tubing', description: 'Disconnect blood tubing from patient access site', defaultTime: '07:27 AM' },
];

const CLEARANCE_OPTIONS = ['Clear', 'Moderately Clear', 'Slightly Clouded', 'Clotted/Discard'];
const EARLY_REASON_OPTIONS = [
  'Hypotension',
  'Chest Pain',
  'Access Problem (Clotting/Infiltration)',
  'Patient Request',
  'Machine Malfunction',
  'Other',
];
const PHYSICIAN_ORDER_OPTIONS = [
  'Order Obtained (Verbal)',
  'Order Obtained (Written)',
  'Standing Order Applies',
  'Pending',
];

const getCurrentFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getCurrentDateTimeInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function P401BloodReturnTermination({
  data = {},
  setData,
  session = {},
  readings = [],
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
}) {
  // Extract initial or fallback values from props & dynamic session APIs
  const prescription = session.prescription || session.dashboard?.prescription || {
    prescribedDuration: '04:00 hr',
    ufGoal: '2.00 L',
    dfr: '500 mL/min',
    bfr: '300 mL/min',
    temperature: '36.5 °C',
    dialysate: 'Std Bicarbonate (K+ 2.0)',
  };

  const liveParams = session.liveParams || session.dashboard?.liveParams || {
    bp: readings?.[readings.length - 1]?.systolic ? `${readings[readings.length - 1].systolic}/${readings[readings.length - 1].diastolic} mmHg` : '118/76 mmHg',
    hr: readings?.[readings.length - 1]?.pulse ? `${readings[readings.length - 1].pulse} bpm` : '74 bpm',
    tmp: session.tmp ? `${session.tmp} mmHg` : '110 mmHg',
    vp: session.vp ? `${session.vp} mmHg` : '120 mmHg',
    ap: session.ap ? `${session.ap} mmHg` : '-140 mmHg',
    bfr: session.bfr ? `${session.bfr} mL/min` : '300 mL/min',
  };

  // Form State
  const [steps, setSteps] = useState(() => {
    if (data.steps && Object.keys(data.steps).length > 0) return data.steps;
    // Default prefilled steps for smooth flow if already complete or fresh
    const initialSteps = {};
    TERMINATION_STEPS.forEach((step) => {
      initialSteps[step.label] = {
        completed: false,
        timestamp: '',
      };
    });
    return initialSteps;
  });

  const [endTime, setEndTime] = useState(data.endTime || getCurrentDateTimeInput());
  const [status, setStatus] = useState(data.status || 'Completed');
  const [treatmentDuration, setTreatmentDuration] = useState(data.treatmentDuration || '03:42 hr');
  const [dialyzerClearance, setDialyzerClearance] = useState(data.dialyzerClearance || 'Clear');
  const [totalUfRemoved, setTotalUfRemoved] = useState(data.totalUfRemoved || session.totalUfRemoved || '1.65');
  const [rinseBackVolume, setRinseBackVolume] = useState(data.rinseBackVolume || '200');
  const [bloodVolumeProcessed, setBloodVolumeProcessed] = useState(data.bloodVolumeProcessed || '58.2');
  const [physicianNotified, setPhysicianNotified] = useState(data.physicianNotified || 'No');
  const [heparinUsed, setHeparinUsed] = useState(data.heparinUsed || '2.0');

  // Early Termination Fields
  const [earlyReason, setEarlyReason] = useState(data.earlyReason || '');
  const [earlyTime, setEarlyTime] = useState(data.earlyTime || '');
  const [physicianOrder, setPhysicianOrder] = useState(data.physicianOrder || '');
  const [terminationNotes, setTerminationNotes] = useState(data.terminationNotes || '');

  // Safety Reminders checked state
  const [safetyReminders, setSafetyReminders] = useState({
    returnAllBlood: true,
    checkAccess: true,
    asepticTechnique: true,
    clampLines: true,
    verifyVitals: true,
  });

  // Automatically compute treatment duration when End Time or Session Start Time changes
  useEffect(() => {
    const startTimeStr = session.started_at || session.start_time || '07:45 AM';
    if (endTime && startTimeStr) {
      try {
        const endD = new Date(endTime);
        if (!isNaN(endD.getTime())) {
          // If startTime is a time string like "07:45 AM"
          const parts = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (parts) {
            let h = parseInt(parts[1], 10);
            const m = parseInt(parts[2], 10);
            const ampm = parts[3];
            if (ampm && ampm.toUpperCase() === 'PM' && h < 12) h += 12;
            if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
            const startD = new Date(endD);
            startD.setHours(h, m, 0, 0);

            const diffMs = endD.getTime() - startD.getTime();
            if (diffMs > 0) {
              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              setTreatmentDuration(`${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')} hr`);
            }
          }
        }
      } catch (_) {
        /* fallback to default if parsing error */
      }
    }
  }, [endTime, session.started_at, session.start_time]);

  // Sync back to parent data state
  const updateParentState = (patch) => {
    const payload = {
      steps,
      endTime,
      status,
      treatmentDuration,
      dialyzerClearance,
      totalUfRemoved,
      rinseBackVolume,
      bloodVolumeProcessed,
      physicianNotified,
      heparinUsed,
      earlyReason,
      earlyTime,
      physicianOrder,
      terminationNotes,
      ...patch,
    };
    if (setData) {
      setData((prev) => ({ ...prev, ...payload }));
    }
  };

  const handleStepToggle = (stepLabel, stepIndex) => {
    // Check sequential rule: cannot check step N unless step N-1 is checked
    if (stepIndex > 0) {
      const prevStepLabel = TERMINATION_STEPS[stepIndex - 1].label;
      if (!steps[prevStepLabel]?.completed) {
        alert(`Step ${stepIndex + 1} cannot be completed before Step ${stepIndex} (${prevStepLabel}) is checked!`);
        return;
      }
    }

    const currentVal = Boolean(steps[stepLabel]?.completed);
    const newVal = !currentVal;
    const timeStr = newVal ? getCurrentFormattedTime() : '';

    const newSteps = {
      ...steps,
      [stepLabel]: {
        completed: newVal,
        timestamp: timeStr,
      },
    };

    setSteps(newSteps);
    updateParentState({ steps: newSteps });
  };

  const handleQuickCheckAllSteps = () => {
    const updated = {};
    TERMINATION_STEPS.forEach((s) => {
      updated[s.label] = {
        completed: true,
        timestamp: steps[s.label]?.timestamp || getCurrentFormattedTime(),
      };
    });
    setSteps(updated);
    updateParentState({ steps: updated });
  };

  const allStepsCompleted = TERMINATION_STEPS.every((s) => steps[s.label]?.completed);

  const numRinseVol = Number(rinseBackVolume);
  const isRinseVolOut = numRinseVol > 0 && (numRinseVol < 200 || numRinseVol > 500);

  return (
    <div className="p401-container">
      {/* Header Visual Procedure Diagram */}
      <div className="p401-diagram-banner">
        <div className="p401-diagram-header">
          <div className="p401-diagram-title">
            <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <span>Blood Return &amp; Rinse-Back Standard Operating Procedure</span>
          </div>
          <button type="button" className="p401-quick-fill-btn" onClick={handleQuickCheckAllSteps}>
            Mark All Steps Complete (Protocol Auto-Timestamp)
          </button>
        </div>
        <div className="p401-diagram-body">
          <img
            src={bloodReturnDiagram}
            alt="Blood Return & Rinse-Back Procedure Diagram"
            className="p401-diagram-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/blood_return_diagram.svg';
            }}
          />
        </div>
      </div>

      <div className="p401-main-grid">
        {/* Left Column — Steps & End Details */}
        <div className="p401-left-content">
          {/* Section 1: Treatment Termination Steps */}
          <Card variant="outline" className="post-panel p401-panel">
            <CardBody>
              <div className="p401-panel-header">
                <h2>1. Treatment Termination Steps</h2>
                <span className="p401-mandatory-badge">* All 7 Steps Mandatory</span>
              </div>

              <div className="p401-checklist-wrap">
                {TERMINATION_STEPS.map((step, idx) => {
                  const isChecked = Boolean(steps[step.label]?.completed);
                  const stepTime = steps[step.label]?.timestamp || step.defaultTime;
                  return (
                    <div
                      key={step.id}
                      className={`p401-step-row ${isChecked ? 'p401-step-row--checked' : ''}`}
                      onClick={() => handleStepToggle(step.label, idx)}
                    >
                      <div className="p401-step-checkbox">
                        <Checkbox
                          isChecked={isChecked}
                          onChange={() => handleStepToggle(step.label, idx)}
                        />
                      </div>
                      <div className="p401-step-number">{step.id}</div>
                      <div className="p401-step-info">
                        <strong className="p401-step-title">{step.label}</strong>
                        <span className="p401-step-desc">{step.description}</span>
                      </div>
                      <div className="p401-step-status">
                        {isChecked ? (
                          <span className="p401-time-badge">
                            <CheckCircleOutlinedIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                            Completed ({stepTime})
                          </span>
                        ) : (
                          <span className="p401-pending-badge">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {allStepsCompleted && (
                <div className="post-success p401-success-banner">
                  <CheckCircleOutlinedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                  <span>
                    <strong>Blood return completed successfully</strong> — Total rinse-back volume: {rinseBackVolume} mL.
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Section 2: Treatment End Details */}
          <Card variant="outline" className="post-panel p401-panel">
            <CardBody>
              <h2>2. Treatment End Details</h2>
              <div className="post-grid p401-form-grid">
                <label className="post-field">
                  <span>Treatment End Time <em>*</em></span>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      updateParentState({ endTime: e.target.value });
                    }}
                  />
                </label>

                <label className="post-field">
                  <span>Treatment Status <em>*</em></span>
                  <Select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      updateParentState({ status: e.target.value });
                    }}
                  >
                    <option value="Completed">Completed</option>
                    <option value="Early Termination">Early Termination</option>
                  </Select>
                </label>

                <label className="post-field">
                  <span>Treatment Duration (Auto)</span>
                  <Input value={treatmentDuration} readOnly className="p401-readonly-input" />
                </label>

                <label className="post-field">
                  <span>Dialyzer Clearance</span>
                  <Select
                    value={dialyzerClearance}
                    onChange={(e) => {
                      setDialyzerClearance(e.target.value);
                      updateParentState({ dialyzerClearance: e.target.value });
                    }}
                  >
                    {CLEARANCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="post-field">
                  <span>Total UF Removed (L)</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={totalUfRemoved}
                    onChange={(e) => {
                      setTotalUfRemoved(e.target.value);
                      updateParentState({ totalUfRemoved: e.target.value });
                    }}
                  />
                </label>

                <label className="post-field">
                  <span>Rinse-Back Volume (mL)</span>
                  <Input
                    type="number"
                    value={rinseBackVolume}
                    onChange={(e) => {
                      setRinseBackVolume(e.target.value);
                      updateParentState({ rinseBackVolume: e.target.value });
                    }}
                  />
                </label>

                <label className="post-field">
                  <span>Blood Volume Processed (L)</span>
                  <Input
                    type="number"
                    step="0.1"
                    value={bloodVolumeProcessed}
                    onChange={(e) => {
                      setBloodVolumeProcessed(e.target.value);
                      updateParentState({ bloodVolumeProcessed: e.target.value });
                    }}
                  />
                </label>

                <label className="post-field">
                  <span>Physician Notified</span>
                  <div className="post-toggle">
                    <Button
                      type="button"
                      size="sm"
                      variant={physicianNotified === 'Yes' ? 'primary' : 'outline'}
                      onClick={() => {
                        setPhysicianNotified('Yes');
                        updateParentState({ physicianNotified: 'Yes' });
                      }}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={physicianNotified === 'No' ? 'primary' : 'outline'}
                      onClick={() => {
                        setPhysicianNotified('No');
                        updateParentState({ physicianNotified: 'No' });
                      }}
                    >
                      No
                    </Button>
                  </div>
                </label>

                <label className="post-field">
                  <span>Heparin Used (mL)</span>
                  <Input
                    type="number"
                    step="0.1"
                    value={heparinUsed}
                    onChange={(e) => {
                      setHeparinUsed(e.target.value);
                      updateParentState({ heparinUsed: e.target.value });
                    }}
                  />
                </label>
              </div>

              {isRinseVolOut && (
                <div className="post-warning p401-warning-banner">
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  <span>
                    <strong>Rinse-back volume warning:</strong> Typical volume is 200–500 mL. Recorded: {rinseBackVolume} mL. Verify bolus volume to avoid fluid overload.
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Section 3: Early Termination (Conditional Panel) */}
          {status === 'Early Termination' && (
            <Card variant="outline" className="post-panel p401-panel p401-amber-panel">
              <CardBody>
                <div className="p401-amber-header">
                  <WarningAmberOutlinedIcon sx={{ color: '#b45309', fontSize: 20 }} />
                  <h3>3. Early Termination Details</h3>
                </div>
                <div className="post-grid p401-form-grid">
                  <label className="post-field">
                    <span>Reason for Early Termination <em>*</em></span>
                    <Select
                      value={earlyReason}
                      onChange={(e) => {
                        setEarlyReason(e.target.value);
                        updateParentState({ earlyReason: e.target.value });
                      }}
                    >
                      <option value="">Select Reason...</option>
                      {EARLY_REASON_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className="post-field">
                    <span>Time Treatment Stopped <em>*</em></span>
                    <Input
                      type="time"
                      value={earlyTime}
                      onChange={(e) => {
                        setEarlyTime(e.target.value);
                        updateParentState({ earlyTime: e.target.value });
                      }}
                    />
                  </label>

                  <label className="post-field">
                    <span>Physician Order <em>*</em></span>
                    <Select
                      value={physicianOrder}
                      onChange={(e) => {
                        setPhysicianOrder(e.target.value);
                        updateParentState({ physicianOrder: e.target.value });
                      }}
                    >
                      <option value="">Select Order Status...</option>
                      {PHYSICIAN_ORDER_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  </label>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Section 4: Notes / Comments */}
          <Card variant="outline" className="post-panel p401-panel">
            <CardBody>
              <div className="p401-notes-header">
                <h2>4. Notes / Comments</h2>
                <span className="p401-char-count">{terminationNotes.length}/300</span>
              </div>
              <Textarea
                maxLength={300}
                placeholder="Enter any relevant clinical observations, patient comments, or rinse-back notes..."
                value={terminationNotes}
                onChange={(e) => {
                  setTerminationNotes(e.target.value);
                  updateParentState({ terminationNotes: e.target.value });
                }}
              />
            </CardBody>
          </Card>
        </div>

        {/* Right Rail Column — Treatment Prescription, Live Params, Safety Reminders */}
        <div className="p401-right-rail">
          {/* Card 1: Treatment Prescription (Read-Only) */}
          <Card variant="outline" className="post-panel p401-rail-card">
            <CardBody>
              <div className="p401-rail-title">
                <AccessTimeOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h3>Treatment Prescription</h3>
                <span className="p401-readonly-badge">Read-Only</span>
              </div>
              <div className="p401-rail-list">
                <div className="p401-rail-item">
                  <span className="p401-rail-label">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
                    Prescribed Duration
                  </span>
                  <strong className="p401-rail-val">{prescription.prescribedDuration}</strong>
                </div>

                <div className="p401-rail-item">
                  <span className="p401-rail-label">
                    <WaterDropOutlinedIcon sx={{ fontSize: 14, color: '#0284c7' }} />
                    UF Goal
                  </span>
                  <strong className="p401-rail-val">{prescription.ufGoal}</strong>
                </div>

                <div className="p401-rail-item">
                  <span className="p401-rail-label">
                    <SpeedOutlinedIcon sx={{ fontSize: 14, color: '#2563eb' }} />
                    Dialysate Flow (DFR)
                  </span>
                  <strong className="p401-rail-val">{prescription.dfr}</strong>
                </div>

                <div className="p401-rail-item">
                  <span className="p401-rail-label">
                    <SpeedOutlinedIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                    Blood Flow Rate (BFR)
                  </span>
                  <strong className="p401-rail-val">{prescription.bfr}</strong>
                </div>

                <div className="p401-rail-item">
                  <span className="p401-rail-label">
                    <DeviceThermostatOutlinedIcon sx={{ fontSize: 14, color: '#ea580c' }} />
                    Dialysate Temp
                  </span>
                  <strong className="p401-rail-val">{prescription.temperature}</strong>
                </div>

                <div className="p401-rail-item">
                  <span className="p401-rail-label">
                    <VaccinesOutlinedIcon sx={{ fontSize: 14, color: '#7c3aed' }} />
                    Dialysate Composition
                  </span>
                  <strong className="p401-rail-val">{prescription.dialysate}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 2: Live Parameters (Pre-Termination) */}
          <Card variant="outline" className="post-panel p401-rail-card">
            <CardBody>
              <div className="p401-rail-title">
                <MonitorHeartOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                <h3>Live Parameters (Pre-Term)</h3>
                <span className="p401-live-tag">P3 Snapshot</span>
              </div>
              <div className="p401-rail-grid">
                <div className="p401-param-box">
                  <span className="p401-param-label">
                    <MonitorHeartOutlinedIcon sx={{ fontSize: 13, color: '#ef4444' }} /> BP
                  </span>
                  <strong className="p401-param-val">{liveParams.bp}</strong>
                </div>

                <div className="p401-param-box">
                  <span className="p401-param-label">
                    <FavoriteBorderOutlinedIcon sx={{ fontSize: 13, color: '#dc2626' }} /> HR
                  </span>
                  <strong className="p401-param-val">{liveParams.hr}</strong>
                </div>

                <div className="p401-param-box">
                  <span className="p401-param-label">
                    <CompressOutlinedIcon sx={{ fontSize: 13, color: '#2563eb' }} /> TMP
                  </span>
                  <strong className="p401-param-val">{liveParams.tmp}</strong>
                </div>

                <div className="p401-param-box">
                  <span className="p401-param-label">
                    <GrainOutlinedIcon sx={{ fontSize: 13, color: '#0284c7' }} /> VP
                  </span>
                  <strong className="p401-param-val">{liveParams.vp}</strong>
                </div>

                <div className="p401-param-box">
                  <span className="p401-param-label">
                    <GrainOutlinedIcon sx={{ fontSize: 13, color: '#0284c7' }} /> AP
                  </span>
                  <strong className="p401-param-val">{liveParams.ap}</strong>
                </div>

                <div className="p401-param-box">
                  <span className="p401-param-label">
                    <SpeedOutlinedIcon sx={{ fontSize: 13, color: '#16a34a' }} /> BFR
                  </span>
                  <strong className="p401-param-val">{liveParams.bfr}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 3: Safety Reminders */}
          <Card variant="outline" className="post-panel p401-rail-card">
            <CardBody>
              <div className="p401-rail-title">
                <ShieldOutlinedIcon sx={{ color: '#059669', fontSize: 18 }} />
                <h3>Safety Reminders</h3>
              </div>
              <div className="p401-reminders-list">
                <label className="p401-reminder-item">
                  <Checkbox
                    isChecked={safetyReminders.returnAllBlood}
                    onChange={(e) => setSafetyReminders({ ...safetyReminders, returnAllBlood: e.target.checked })}
                  />
                  <span>Confirm all blood is returned to patient before line disconnection.</span>
                </label>

                <label className="p401-reminder-item">
                  <Checkbox
                    isChecked={safetyReminders.checkAccess}
                    onChange={(e) => setSafetyReminders({ ...safetyReminders, checkAccess: e.target.checked })}
                  />
                  <span>Check vascular access for bleeding, infiltration, or dislodgement.</span>
                </label>

                <label className="p401-reminder-item">
                  <Checkbox
                    isChecked={safetyReminders.asepticTechnique}
                    onChange={(e) => setSafetyReminders({ ...safetyReminders, asepticTechnique: e.target.checked })}
                  />
                  <span>Maintain strict aseptic technique throughout line disconnection.</span>
                </label>

                <label className="p401-reminder-item">
                  <Checkbox
                    isChecked={safetyReminders.clampLines}
                    onChange={(e) => setSafetyReminders({ ...safetyReminders, clampLines: e.target.checked })}
                  />
                  <span>Clamp blood lines immediately after rinse-back completion.</span>
                </label>

                <label className="p401-reminder-item">
                  <Checkbox
                    isChecked={safetyReminders.verifyVitals}
                    onChange={(e) => setSafetyReminders({ ...safetyReminders, verifyVitals: e.target.checked })}
                  />
                  <span>Verify post-dialysis vitals stability before allowing sitting/standing.</span>
                </label>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
