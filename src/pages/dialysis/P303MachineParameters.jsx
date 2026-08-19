import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '../../component-library';

// Material UI Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined';

const INITIAL_PARAMETERS = {
  bfr: '300',
  dfr: '500',
  ap: '-120',
  vp: '150',
  tmp: '380',
  ufr: '500',
  uf_removed: '1.60',
  blood_volume_processed: '32.5',
  conductivity: '14.0',
  dialysate_temperature: '36.5',
  heparin_rate: '1.0',
  blood_leak: 'No Leak Detected',
};

const INITIAL_TRENDS = [
  { time: '08:15 AM', bfr: 300, ap: -120, vp: 140, tmp: 280 },
  { time: '08:45 AM', bfr: 300, ap: -125, vp: 145, tmp: 310 },
  { time: '09:15 AM', bfr: 300, ap: -120, vp: 148, tmp: 340 },
  { time: '09:45 AM', bfr: 300, ap: -118, vp: 150, tmp: 365 },
  { time: '10:15 AM', bfr: 300, ap: -120, vp: 150, tmp: 380 },
];

export default function P303MachineParameters({
  sessionId = 'demo',
  session = {},
  patient = {},
  history = [],
  parameterQuestions = [],
  onSave,
  onSaveDraft,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [lastUpdated, setLastUpdated] = useState('10:15:30 AM');
  const [timeframe, setTimeframe] = useState('Last 2 Hours');
  const [notes, setNotes] = useState('');
  const [params, setParams] = useState(INITIAL_PARAMETERS);
  const [systemChecks, setSystemChecks] = useState({
    powerSupply: true,
    dialysateSystem: true,
    heparinSystem: true,
    airDetector: true,
    bloodLeakDetector: true,
  });

  // Dynamic Patient Banner Details
  const patientName = patient.name || patient.patient_name || 'Ramesh Kumar';
  const pid = patient.pid || patient.patient_id || 'P10023';
  const ageGender = patient.age && patient.gender ? `${patient.age} Years, ${patient.gender}` : '58 Years, Male';
  const bloodGroup = patient.bloodGroup || patient.blood_group || 'O+';
  const dateStr = session.date || '26 May 2025 (Mon)';
  const shiftStr = session.shift || 'Morning (07:00 AM)';
  const bedStr = session.bed || patient.bed || 'B-02';
  const machineModel = session.machine || patient.machine || 'Fresenius 4008S';
  const accessType = patient.access || session.access || 'AV Fistula (Left)';
  const prescribedBFR = session.prescribedBFR || '300 mL/min';
  const prescribedDFR = session.prescribedDFR || '500 mL/min';
  const ufGoal = session.ufGoal || '2.40 L';
  const elapsedTime = session.elapsedTime || '01:32 Elapsed';

  // Range Slider Helper Component
  const GaugeSlider = ({ min, max, safeMin, safeMax, value, unit, isWarning, isCritical }) => {
    const valNum = parseFloat(value) || 0;
    const percentage = Math.min(100, Math.max(0, ((valNum - min) / (max - min)) * 100));
    const safeMinPct = ((safeMin - min) / (max - min)) * 100;
    const safeMaxPct = ((safeMax - min) / (max - min)) * 100;

    let barColor = '#2563eb'; // blue default
    if (isCritical) barColor = '#ef4444'; // red
    else if (isWarning) barColor = '#f59e0b'; // amber

    return (
      <div className="p303-gauge-wrap">
        <div className="p303-gauge-track">
          {/* Safe Range Highlight Zone */}
          <div
            className="p303-gauge-safe-zone"
            style={{
              left: `${safeMinPct}%`,
              width: `${safeMaxPct - safeMinPct}%`,
            }}
          />
          {/* Current Value Fill Bar */}
          <div
            className="p303-gauge-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: barColor,
            }}
          />
          {/* Current Value Marker Pin */}
          <div
            className="p303-gauge-pin"
            style={{
              left: `${percentage}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
        <div className="p303-gauge-ticks">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const handleRefresh = () => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const isTmpCritical = parseFloat(params.tmp) >= 300;

  return (
    <div className="p303-container">
      {/* Layout Grid: 8/12 Main Content + 4/12 Right Rail */}
      <div className="p303-layout-grid">
        {/* Left / Main Section */}
        <div className="p303-main-content">
          {/* Tab Bar */}
          <div className="p303-tab-bar">
            {['Overview', 'Pressures', 'Flows', 'Dialysate', 'Ultrafiltration', 'Advanced Parameters'].map((tab) => (
              <button
                type="button"
                key={tab}
                className={`p303-tab-btn ${activeTab === tab ? 'p303-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Overview' ? 'Overview *' : tab}
              </button>
            ))}
          </div>

          {/* Machine Status Notification Banner */}
          <div className={`p303-status-banner ${isTmpCritical ? 'p303-status-banner--critical' : 'p303-status-banner--ok'}`}>
            <div className="p303-status-message">
              {isTmpCritical ? (
                <>
                  <WarningAmberOutlinedIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                  <span>
                    <strong>Machine Status: Running</strong> — 1 parameter Critical (TMP high — {params.tmp} mmHg).
                  </span>
                </>
              ) : (
                <>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  <span>
                    <strong>Machine Status: Running</strong> — All parameters are within acceptable range.
                  </span>
                </>
              )}
            </div>
            <div className="p303-status-actions">
              <span>Last Updated: {lastUpdated}</span>
              <button type="button" className="p303-refresh-btn" onClick={handleRefresh} title="Refresh readings">
                <RefreshIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

          {/* OVERVIEW TAB CONTENT (12 Parameter Cards) */}
          {activeTab === 'Overview' && (
            <div className="p303-cards-grid">
              {/* Card 1: BFR */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <WaterDropOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                    Blood Flow Rate (BFR)
                  </span>
                  <span className="p303-tag p303-tag--target">On Target</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.bfr} <small>mL/min</small>
                  </div>
                  <GaugeSlider min={0} max={500} safeMin={250} safeMax={400} value={params.bfr} />
                  <span className="p303-card-sub">Prescribed: {prescribedBFR}</span>
                </div>
              </div>

              {/* Card 2: DFR */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <WavesOutlinedIcon sx={{ color: '#0284c7', fontSize: 18 }} />
                    Dialysate Flow Rate (DFR)
                  </span>
                  <span className="p303-tag p303-tag--target">On Target</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.dfr} <small>mL/min</small>
                  </div>
                  <GaugeSlider min={0} max={1000} safeMin={400} safeMax={800} value={params.dfr} />
                  <span className="p303-card-sub">Prescribed: {prescribedDFR}</span>
                </div>
              </div>

              {/* Card 3: Arterial Pressure (AP) */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <MonitorHeartOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                    Arterial Pressure (AP)
                  </span>
                  <span className="p303-tag p303-tag--normal">Normal</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.ap} <small>mmHg</small>
                  </div>
                  <GaugeSlider min={-300} max={300} safeMin={-250} safeMax={250} value={params.ap} />
                  <span className="p303-card-sub">Safe Range: -250 to +250 mmHg</span>
                </div>
              </div>

              {/* Card 4: Venous Pressure (VP) */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <CompressOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                    Venous Pressure (VP)
                  </span>
                  <span className="p303-tag p303-tag--normal">Normal</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.vp} <small>mmHg</small>
                  </div>
                  <GaugeSlider min={-100} max={500} safeMin={-100} safeMax={500} value={params.vp} />
                  <span className="p303-card-sub">Safe Range: -100 to +500 mmHg</span>
                </div>
              </div>

              {/* Card 5: Transmembrane Pressure (TMP) */}
              <div className={`p303-card ${isTmpCritical ? 'p303-card--critical' : ''}`}>
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <SpeedOutlinedIcon sx={{ color: isTmpCritical ? '#dc2626' : '#d97706', fontSize: 18 }} />
                    Transmembrane Pressure (TMP)
                  </span>
                  <span className={`p303-tag ${isTmpCritical ? 'p303-tag--critical' : 'p303-tag--normal'}`}>
                    {isTmpCritical ? 'Critical' : 'Normal'}
                  </span>
                </div>
                <div className="p303-card-body">
                  <div className={`p303-card-value ${isTmpCritical ? 'text-red-600' : ''}`}>
                    {params.tmp} <small>mmHg</small>
                  </div>
                  <GaugeSlider min={0} max={800} safeMin={20} safeMax={300} value={params.tmp} isCritical={isTmpCritical} />
                  <span className="p303-card-sub">Safe Range: 20 – 300 mmHg</span>
                </div>
              </div>

              {/* Card 6: Ultrafiltration Rate (UFR) */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <WaterDropOutlinedIcon sx={{ color: '#0284c7', fontSize: 18 }} />
                    Ultrafiltration Rate (UFR)
                  </span>
                  <span className="p303-tag p303-tag--target">On Target</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.ufr} <small>mL/hr</small>
                  </div>
                  <GaugeSlider min={0} max={1000} safeMin={300} safeMax={800} value={params.ufr} />
                  <span className="p303-card-sub">Prescribed: 500 mL/hr</span>
                </div>
              </div>

              {/* Card 7: UF Removed (Cumulative) */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <ScienceOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    UF Removed (Cumulative)
                  </span>
                  <span className="p303-tag p303-tag--info">67% of Goal</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.uf_removed} <small>L</small>
                  </div>
                  <GaugeSlider min={0} max={4.0} safeMin={0} safeMax={2.4} value={params.uf_removed} />
                  <span className="p303-card-sub">
                    Goal: {ufGoal} | Remaining: {(parseFloat(ufGoal) - parseFloat(params.uf_removed)).toFixed(2)} L
                  </span>
                </div>
              </div>

              {/* Card 8: Blood Volume Processed */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <WaterDropOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                    Blood Volume Processed
                  </span>
                  <span className="p303-tag p303-tag--neutral">—</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.blood_volume_processed} <small>L</small>
                  </div>
                  <GaugeSlider min={0} max={64.0} safeMin={0} safeMax={64.0} value={params.blood_volume_processed} />
                  <span className="p303-card-sub">Expected: ~ 64.0 L | 50% Completed</span>
                </div>
              </div>

              {/* Card 9: Dialysate Conductivity */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <ScienceOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                    Dialysate Conductivity
                  </span>
                  <span className="p303-tag p303-tag--normal">Normal</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.conductivity} <small>mS/cm</small>
                  </div>
                  <span className="p303-card-sub">Safe Range: 13.5 – 15.5 mS/cm</span>
                </div>
              </div>

              {/* Card 10: Dialysate Temperature */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <DeviceThermostatOutlinedIcon sx={{ color: '#ea580c', fontSize: 18 }} />
                    Dialysate Temperature
                  </span>
                  <span className="p303-tag p303-tag--normal">Normal</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.dialysate_temperature} <small>°C</small>
                  </div>
                  <span className="p303-card-sub">Safe Range: 35.0 – 37.0 °C</span>
                </div>
              </div>

              {/* Card 11: Heparin Pump */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <VaccinesOutlinedIcon sx={{ color: '#059669', fontSize: 18 }} />
                    Heparin Pump (if applicable)
                  </span>
                  <span className="p303-tag p303-tag--target">Running</span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value">
                    {params.heparin_rate} <small>mL/hr</small>
                  </div>
                  <span className="p303-card-sub">Rate: 1.0 mL/hr</span>
                </div>
              </div>

              {/* Card 12: Blood Leak Detector */}
              <div className="p303-card">
                <div className="p303-card-header">
                  <span className="p303-card-title">
                    <ShieldOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    Blood Leak Detector
                  </span>
                  <span className="p303-tag p303-tag--target">
                    <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} /> OK
                  </span>
                </div>
                <div className="p303-card-body">
                  <div className="p303-card-value p303-card-value--sm">
                    {params.blood_leak}
                  </div>
                  <span className="p303-card-sub">Status: OK</span>
                </div>
              </div>
            </div>
          )}

          {/* OTHER CATEGORY TABS (Pressures, Flows, Dialysate, Ultrafiltration, Advanced Parameters) */}
          {activeTab !== 'Overview' && (
            <div className="p303-category-tab-content">
              <Card variant="outline" className="post-panel">
                <CardBody>
                  <h2 className="p303-tab-title">{activeTab} Category Deep-Dive</h2>
                  {activeTab === 'Pressures' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Arterial Pressure (AP)</h3>
                        <p className="p303-cat-val">{params.ap} mmHg</p>
                        <p className="p303-cat-sub">Min: -130 | Max: -115 | Avg: -122 mmHg</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Venous Pressure (VP)</h3>
                        <p className="p303-cat-val">{params.vp} mmHg</p>
                        <p className="p303-cat-sub">Min: 140 | Max: 155 | Avg: 148 mmHg</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Transmembrane Pressure (TMP)</h3>
                        <p className="p303-cat-val text-red-600">{params.tmp} mmHg (Critical)</p>
                        <p className="p303-cat-sub">Safe limit: 300 mmHg ceiling</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Access Pressure</h3>
                        <p className="p303-cat-val">-110 mmHg</p>
                        <p className="p303-cat-sub">Calculated circuit integrity metric</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Flows' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Blood Flow Rate (BFR)</h3>
                        <p className="p303-cat-val">{params.bfr} mL/min</p>
                        <p className="p303-cat-sub">Prescribed: {prescribedBFR}</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Dialysate Flow Rate (DFR)</h3>
                        <p className="p303-cat-val">{params.dfr} mL/min</p>
                        <p className="p303-cat-sub">Prescribed: {prescribedDFR}</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Access Recirculation %</h3>
                        <p className="p303-cat-val">4.2 %</p>
                        <p className="p303-cat-sub">KDOQI Target: &lt; 10 %</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Dialysate' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Dialysate Conductivity</h3>
                        <p className="p303-cat-val">{params.conductivity} mS/cm</p>
                        <p className="p303-cat-sub">Safe Range: 13.5 – 15.5 mS/cm</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Dialysate Temperature</h3>
                        <p className="p303-cat-val">{params.dialysate_temperature} °C</p>
                        <p className="p303-cat-sub">Safe Range: 35.0 – 37.0 °C</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Sodium / Bicarbonate Conc.</h3>
                        <p className="p303-cat-val">138 / 32 mmol/L</p>
                        <p className="p303-cat-sub">Standard Bath Formula</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Ultrafiltration' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>UF Rate (UFR)</h3>
                        <p className="p303-cat-val">{params.ufr} mL/hr</p>
                        <p className="p303-cat-sub">Prescribed: 500 mL/hr</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>UF Removed (Cumulative)</h3>
                        <p className="p303-cat-val">{params.uf_removed} L</p>
                        <p className="p303-cat-sub">Goal: {ufGoal} (67% Achieved)</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>UF Remaining / Projection</h3>
                        <p className="p303-cat-val">0.80 L</p>
                        <p className="p303-cat-sub">Est. completion: 01:36 hr remaining</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Advanced Parameters' && (
                    <div className="p303-cat-grid">
                      <div className="p303-cat-card">
                        <h3>Heparin Infusion Rate</h3>
                        <p className="p303-cat-val">{params.heparin_rate} mL/hr</p>
                        <p className="p303-cat-sub">Total Infused: 1.5 mL</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Blood Leak Sensor</h3>
                        <p className="p303-cat-val">No Leak</p>
                        <p className="p303-cat-sub">Optical Sensor Status: Normal</p>
                      </div>
                      <div className="p303-cat-card">
                        <h3>Online Clearance (Kt/V Real-Time)</h3>
                        <p className="p303-cat-val">1.18 (Estimated)</p>
                        <p className="p303-cat-sub">Target Kt/V &ge; 1.40</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {/* Bottom Grid: Parameter Trend Chart + Notes / Comments */}
          <div className="p303-bottom-grid">
            {/* Left: Parameter Trend Line Chart */}
            <Card variant="outline" className="post-panel p303-trend-card">
              <CardBody>
                <div className="p303-trend-header">
                  <h3>Parameter Trend (Last 2 Hours)</h3>
                  <div className="p303-trend-controls">
                    <Select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      style={{ width: 140 }}
                    >
                      <option value="Last 2 Hours">Last 2 Hours</option>
                      <option value="Last 4 Hours">Last 4 Hours</option>
                      <option value="Full Session">Full Session</option>
                    </Select>
                  </div>
                </div>

                {/* SVG Trend Line Chart Visualization */}
                <div className="p303-chart-wrapper">
                  <div className="p303-chart-legend">
                    <span className="p303-legend-item"><span className="p303-legend-dot dot-bfr" /> BFR (mL/min)</span>
                    <span className="p303-legend-item"><span className="p303-legend-dot dot-ap" /> AP (mmHg)</span>
                    <span className="p303-legend-item"><span className="p303-legend-dot dot-vp" /> VP (mmHg)</span>
                    <span className="p303-legend-item"><span className="p303-legend-dot dot-tmp" /> TMP (mmHg)</span>
                  </div>

                  <svg viewBox="0 0 600 180" width="100%" height="180" className="p303-svg-chart">
                    {/* Horizontal Grid lines */}
                    <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="110" x2="580" y2="110" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="40" y1="150" x2="580" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Y-Axis Labels */}
                    <text x="30" y="34" textAnchor="end" fontSize="10" fill="#94a3b8">600</text>
                    <text x="30" y="74" textAnchor="end" fontSize="10" fill="#94a3b8">300</text>
                    <text x="30" y="114" textAnchor="end" fontSize="10" fill="#94a3b8">0</text>
                    <text x="30" y="154" textAnchor="end" fontSize="10" fill="#94a3b8">-300</text>

                    {/* BFR Line (Blue constant 300) */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      points="60,70 180,70 300,70 420,70 540,70"
                    />
                    <circle cx="60" cy="70" r="4" fill="#2563eb" />
                    <circle cx="180" cy="70" r="4" fill="#2563eb" />
                    <circle cx="300" cy="70" r="4" fill="#2563eb" />
                    <circle cx="420" cy="70" r="4" fill="#2563eb" />
                    <circle cx="540" cy="70" r="4" fill="#2563eb" />

                    {/* AP Line (Red around -120) */}
                    <polyline
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      points="60,130 180,132 300,130 420,129 540,130"
                    />
                    <circle cx="60" cy="130" r="4" fill="#ef4444" />
                    <circle cx="180" cy="132" r="4" fill="#ef4444" />
                    <circle cx="300" cy="130" r="4" fill="#ef4444" />
                    <circle cx="420" cy="129" r="4" fill="#ef4444" />
                    <circle cx="540" cy="130" r="4" fill="#ef4444" />

                    {/* VP Line (Teal around 150) */}
                    <polyline
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2.5"
                      points="60,95 180,94 300,92 420,90 540,90"
                    />
                    <circle cx="60" cy="95" r="4" fill="#0d9488" />
                    <circle cx="180" cy="94" r="4" fill="#0d9488" />
                    <circle cx="300" cy="92" r="4" fill="#0d9488" />
                    <circle cx="420" cy="90" r="4" fill="#0d9488" />
                    <circle cx="540" cy="90" r="4" fill="#0d9488" />

                    {/* TMP Line (Purple rising to 380) */}
                    <polyline
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2.5"
                      points="60,73 180,68 300,64 420,60 540,56"
                    />
                    <circle cx="60" cy="73" r="4" fill="#8b5cf6" />
                    <circle cx="180" cy="68" r="4" fill="#8b5cf6" />
                    <circle cx="300" cy="64" r="4" fill="#8b5cf6" />
                    <circle cx="420" cy="60" r="4" fill="#8b5cf6" />
                    <circle cx="540" cy="56" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

                    {/* X-Axis Labels */}
                    <text x="60" y="172" textAnchor="middle" fontSize="10" fill="#64748b">08:15 AM</text>
                    <text x="180" y="172" textAnchor="middle" fontSize="10" fill="#64748b">08:45 AM</text>
                    <text x="300" y="172" textAnchor="middle" fontSize="10" fill="#64748b">09:15 AM</text>
                    <text x="420" y="172" textAnchor="middle" fontSize="10" fill="#64748b">09:45 AM</text>
                    <text x="540" y="172" textAnchor="middle" fontSize="10" fill="#64748b">10:15 AM</text>
                  </svg>
                </div>
              </CardBody>
            </Card>

            {/* Right: Notes / Comments */}
            <Card variant="outline" className="post-panel p303-notes-card">
              <CardBody>
                <div className="p303-notes-header">
                  <h3>Notes / Comments</h3>
                  <span className="p303-char-count">{notes.length} / 300</span>
                </div>
                <Textarea
                  maxLength={300}
                  placeholder="Enter any observations about machine performance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: 130 }}
                />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right Rail Column */}
        <div className="p303-right-rail">
          {/* Card 1: Patient Summary */}
          <Card variant="outline" className="post-panel p303-rail-card">
            <CardBody>
              <div className="p303-rail-title">
                <LocalHospitalOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h3>Patient Summary</h3>
              </div>

              <div className="p303-rail-patient-head">
                <div className="p303-rail-avatar">
                  {patient.avatarUrl ? (
                    <img src={patient.avatarUrl} alt={patientName} />
                  ) : (
                    <span>{patientName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <strong className="p303-rail-pname">{patientName}</strong>
                  <span className="p303-status-active-sm">Active Patient</span>
                </div>
              </div>

              <div className="p303-rail-list">
                <div className="p303-rail-item">
                  <span className="p303-rail-label">PID</span>
                  <strong className="p303-rail-val">{pid}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Age &amp; Gender</span>
                  <strong className="p303-rail-val">{ageGender}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Blood Group</span>
                  <strong className="p303-rail-val">{bloodGroup}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Last Dialysis</span>
                  <strong className="p303-rail-val">12 Jan 2023 (2y 4m)</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Schedule</span>
                  <strong className="p303-rail-val">Mon, Wed, Fri</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Shift / Time</span>
                  <strong className="p303-rail-val">{shiftStr}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Machine / Bed</span>
                  <strong className="p303-rail-val">{bedStr} / HD-01</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 2: Machine Status System Checks */}
          <Card variant="outline" className="post-panel p303-rail-card">
            <CardBody>
              <div className="p303-rail-title">
                <ShieldOutlinedIcon sx={{ color: '#059669', fontSize: 18 }} />
                <h3>Machine Status</h3>
                <span className="p303-status-tag-green">Running</span>
              </div>

              <div className="p303-system-checks-list">
                <div className="p303-check-item p303-check-item--main">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span>All systems normal</span>
                </div>

                <div className="p303-check-item">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span className="flex-1">Power Supply</span>
                  <strong className="p303-check-ok">OK</strong>
                </div>

                <div className="p303-check-item">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span className="flex-1">Dialysate System</span>
                  <strong className="p303-check-ok">OK</strong>
                </div>

                <div className="p303-check-item">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span className="flex-1">Heparin System</span>
                  <strong className="p303-check-ok">OK</strong>
                </div>

                <div className="p303-check-item">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span className="flex-1">Air Detector</span>
                  <strong className="p303-check-ok">OK</strong>
                </div>

                <div className="p303-check-item">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span className="flex-1">Blood Leak Detector</span>
                  <strong className="p303-check-ok">OK</strong>
                </div>
              </div>

              <a href="#machine-details" className="p303-rail-link" onClick={(e) => e.preventDefault()}>
                View Machine Details &rarr;
              </a>
            </CardBody>
          </Card>

          {/* Card 3: Active Alerts (1) */}
          <Card variant="outline" className="post-panel p303-rail-card p303-alerts-card">
            <CardBody>
              <div className="p303-rail-title">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <h3>Active Alerts (1)</h3>
                <a href="#alerts" className="p303-rail-link-sm" onClick={(e) => e.preventDefault()}>
                  View All
                </a>
              </div>

              <div className="p303-alert-box">
                <div className="p303-alert-top">
                  <span className="p303-alert-name">
                    <WarningAmberOutlinedIcon sx={{ fontSize: 15, color: '#dc2626' }} /> High TMP
                  </span>
                  <span className="p303-alert-time">10:12 AM</span>
                </div>
                <p className="p303-alert-desc">TMP is {params.tmp} mmHg (Threshold: &gt;300)</p>
                <div className="p303-alert-footer">
                  <span className="p303-alert-badge-critical">Critical</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card 4: Quick Reference */}
          <Card variant="outline" className="post-panel p303-rail-card">
            <CardBody>
              <div className="p303-rail-title">
                <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h3>Quick Reference</h3>
              </div>

              <div className="p303-rail-list">
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Recommended BFR</span>
                  <strong className="p303-rail-val">250–300 mL/min</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">UF Goal</span>
                  <strong className="p303-rail-val">{ufGoal}</strong>
                </div>
                <div className="p303-rail-item">
                  <span className="p303-rail-label">Recirculation Target</span>
                  <strong className="p303-rail-val">&lt; 10 %</strong>
                </div>
              </div>

              <a href="#kdoqi" className="p303-rail-link" onClick={(e) => e.preventDefault()}>
                View KDOQI Guidelines &rarr;
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
