import React, { useMemo, useState } from 'react';
import { Box, Button } from '../../component-library';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { validateWaterSafety } from './waterSafetyValidation';
import { reviewWaterSafety } from '../../ApiCalls/preDialysisApis';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import OpacityIcon from '@mui/icons-material/Opacity';
import BiotechIcon from '@mui/icons-material/Biotech';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SpeedIcon from '@mui/icons-material/Speed';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const SECTION_TITLE_STYLE = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '8px',
};

const WATER_SYSTEM_INFO = {
  roSystemId: 'RO-01',
  makeModel: 'AquaMed Pro 500',
  installationDate: '10 Jan 2022',
  lastSanitization: '22 May 2025',
  checkTime: '26 May 2025, 07:00 AM',
};

const WATER_QUALITY_CHECKLIST = [
  { id: 'ph', label: 'pH', icon: WaterDropOutlinedIcon, result: '7.1', unit: '—', range: '6.5 – 8.0', method: 'pH Meter', status: 'OK', action: '—' },
  { id: 'tds', label: 'Total Dissolved Solids (TDS)', icon: ScienceOutlinedIcon, result: '45', unit: 'ppm', range: '≤ 500 ppm', method: 'TDS Meter', status: 'OK', action: '—' },
  { id: 'conductivity', label: 'Conductivity', icon: SpeedIcon, result: '22', unit: 'µS/cm', range: '≤ 50 µS/cm', method: 'Conductivity Meter', status: 'OK', action: '—' },
  { id: 'hardness', label: 'Total Hardness', icon: OpacityIcon, result: '30', unit: 'ppm', range: '≤ 50 ppm', method: 'Titration', status: 'OK', action: '—' },
  { id: 'free_chlorine', label: 'Chlorine (Free)', icon: WaterDropOutlinedIcon, result: '0.00', unit: 'ppm', range: '≤ 0.1 ppm', method: 'DPD Colorimetric', status: 'OK', action: '—' },
  { id: 'chloramine', label: 'Chloramine', icon: WaterDropOutlinedIcon, result: '0.00', unit: 'ppm', range: '≤ 0.1 ppm', method: 'Colorimetric', status: 'OK', action: '—' },
  { id: 'bacteria', label: 'Bacteria (HPC)', icon: BiotechIcon, result: '< 10', unit: 'CFU/mL', range: '≤ 100 CFU/mL', method: 'Petrifilm', status: 'OK', action: '—' },
  { id: 'endotoxin', label: 'Endotoxin', icon: BiotechIcon, result: '< 0.01', unit: 'EU/mL', range: '≤ 0.25 EU/mL', method: 'LAL Test', status: 'OK', action: '—' },
  { id: 'turbidity', label: 'Turbidity', icon: DeviceThermostatIcon, result: '0.10', unit: 'NTU', range: '≤ 1.0 NTU', method: 'Turbidity Meter', status: 'OK', action: '—' },
];

const WaterSafetyView = ({ onBack, onNext }) => {
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState('');
  const [sanitizationNotes, setSanitizationNotes] = useState('');
  const [additionalChecks, setAdditionalChecks] = useState({
    roPressure: '65',
    roFlowRate: '120',
    carbonFilterStatus: 'Good',
    softenerStatus: 'Good',
  });
  const [sanitizationRecord, setSanitizationRecord] = useState({
    type: 'Heat Disinfection',
    nextDueDate: '29 May 2025',
    performedBy: 'Rahul Singh',
  });

  const isFormValid = useMemo(() => {
    return validateWaterSafety(WATER_QUALITY_CHECKLIST, additionalChecks);
  }, [additionalChecks]);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-09 – Water Safety</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Verify RO water quality and dialysis fluid purity before treatment.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          <div style={{ padding: '16px 24px', marginBottom: '24px', overflowX: 'auto', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '780px' }}>
              {PRE_DIALYSIS_STEPS.map((step, idx) => {
                const isPast = step.id < 6;
                const isActive = step.id === 6;

                return (
                  <React.Fragment key={step.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '9999px',
                          background: isPast ? '#10b981' : isActive ? '#2563eb' : '#f1f5f9',
                          color: isPast || isActive ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {isPast ? '✓' : step.id}
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#2563eb' : isPast ? '#10b981' : '#64748b',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.name}
                      </span>
                    </div>
                    {idx < PRE_DIALYSIS_STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background: isPast ? '#10b981' : '#e2e8f0',
                          margin: '0 8px',
                          marginTop: '-16px',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main 12-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left 8/12 Main Content */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Water System Information Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex items-center gap-2 mb-4">
                  <WaterDropOutlinedIcon style={{ color: '#2563eb' }} />
                  <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Water System Information</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">RO System ID</label>
                    <input type="text" readOnly value={WATER_SYSTEM_INFO.roSystemId} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Make / Model</label>
                    <input type="text" readOnly value={WATER_SYSTEM_INFO.makeModel} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Installation Date</label>
                    <input type="text" readOnly value={WATER_SYSTEM_INFO.installationDate} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Last Sanitization</label>
                    <input type="text" readOnly value={WATER_SYSTEM_INFO.lastSanitization} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Check Time</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-2 rounded-md bg-gray-50 text-sm">
                      <span className="flex-1">{WATER_SYSTEM_INFO.checkTime}</span>
                      <CalendarTodayIcon style={{ fontSize: '16px', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Quality Checklist Card */}
              <div style={{ ...CARD_STYLE }}>
                <div className="p-6 pb-2 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <WaterDropOutlinedIcon style={{ color: '#2563eb' }} />
                      <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Water Quality Checklist</h3>
                    </div>
                    <p className="text-sm text-[#475569]">Ensure all water quality parameters are within acceptable limits.</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                    <CheckCircleIcon style={{ fontSize: '14px' }} /> All Parameters OK
                  </div>
                </div>

                <div className="w-full text-sm mt-4">
                  {/* Table Header */}
                  <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                    <div className="w-[30%]">Parameter</div>
                    <div className="w-[12%]">Result</div>
                    <div className="w-[12%]">Unit</div>
                    <div className="w-[18%]">Acceptable Range</div>
                    <div className="w-[18%]">Method</div>
                    <div className="w-[10%]">Status</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col">
                    {WATER_QUALITY_CHECKLIST.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className={`flex items-center px-6 py-3 ${idx !== WATER_QUALITY_CHECKLIST.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                          <div className="w-[30%] flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#eff6ff] text-[#2563eb]">
                              <Icon style={{ fontSize: '14px' }} />
                            </div>
                            <span className="font-semibold text-[#334155]">{item.label}</span>
                          </div>
                          
                          <div className="w-[12%]">
                            <input 
                              type="text" 
                              readOnly 
                              value={item.result} 
                              className="w-16 border border-[#e2e8f0] rounded px-2 py-1 text-sm bg-white font-medium text-[#0f172a] focus:outline-none"
                            />
                          </div>

                          <div className="w-[12%] text-[#475569]">{item.unit}</div>
                          <div className="w-[18%] text-[#475569] font-medium">{item.range}</div>
                          <div className="w-[18%] text-[#475569]">{item.method}</div>
                          
                          <div className="w-[10%] flex items-center">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-md font-semibold text-xs">
                              <CheckCircleIcon style={{ fontSize: '14px' }} /> OK
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="m-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center gap-3">
                  <CheckCircleIcon style={{ color: '#16a34a' }} />
                  <span className="font-bold text-[#166534] text-sm">All water quality parameters are within acceptable range. Water is safe for dialysis.</span>
                </div>
              </div>

              {/* Bottom Split (Additional Checks & Sanitization Record) */}
              <div className="grid grid-cols-2 gap-6">
                {/* Additional Checks */}
                <div style={{ ...CARD_STYLE, padding: '24px' }}>
                  <h3 style={SECTION_TITLE_STYLE}>Additional Checks</h3>
                  <div className="flex flex-col gap-4 mt-4 text-sm">
                    {/* RO Pressure */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#334155] w-1/3">RO Pressure</span>
                      <div className="flex items-center gap-2 w-2/3 justify-end">
                        <input 
                          type="number" 
                          value={additionalChecks.roPressure}
                          onChange={(e) => setAdditionalChecks(prev => ({ ...prev, roPressure: e.target.value }))}
                          className="w-16 border border-[#e2e8f0] rounded px-2 py-1 text-sm text-center"
                        />
                        <span className="text-[#64748b] text-xs">psi</span>
                        <span className="text-[#64748b] text-xs font-medium mr-2">50 – 80 psi</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded text-xs font-semibold">
                          <CheckCircleIcon style={{ fontSize: '14px' }} /> OK
                        </div>
                      </div>
                    </div>

                    {/* RO Flow Rate */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#334155] w-1/3">RO Flow Rate</span>
                      <div className="flex items-center gap-2 w-2/3 justify-end">
                        <input 
                          type="number" 
                          value={additionalChecks.roFlowRate}
                          onChange={(e) => setAdditionalChecks(prev => ({ ...prev, roFlowRate: e.target.value }))}
                          className="w-16 border border-[#e2e8f0] rounded px-2 py-1 text-sm text-center"
                        />
                        <span className="text-[#64748b] text-xs">L/hr</span>
                        <span className="text-[#64748b] text-xs font-medium mr-2">100 – 150 L/hr</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded text-xs font-semibold">
                          <CheckCircleIcon style={{ fontSize: '14px' }} /> OK
                        </div>
                      </div>
                    </div>

                    {/* Carbon Filter Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#334155] w-1/3">Carbon Filter Status</span>
                      <div className="flex items-center gap-2 w-2/3 justify-end">
                        <select 
                          value={additionalChecks.carbonFilterStatus}
                          onChange={(e) => setAdditionalChecks(prev => ({ ...prev, carbonFilterStatus: e.target.value }))}
                          className="border border-[#e2e8f0] rounded px-3 py-1 text-sm bg-white focus:outline-none"
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Replace Soon">Replace Soon</option>
                        </select>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded text-xs font-semibold">
                          <CheckCircleIcon style={{ fontSize: '14px' }} /> OK
                        </div>
                      </div>
                    </div>

                    {/* Softener Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#334155] w-1/3">Softener Status</span>
                      <div className="flex items-center gap-2 w-2/3 justify-end">
                        <select 
                          value={additionalChecks.softenerStatus}
                          onChange={(e) => setAdditionalChecks(prev => ({ ...prev, softenerStatus: e.target.value }))}
                          className="border border-[#e2e8f0] rounded px-3 py-1 text-sm bg-white focus:outline-none"
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Regenerate">Regenerate</option>
                        </select>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded text-xs font-semibold">
                          <CheckCircleIcon style={{ fontSize: '14px' }} /> OK
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sanitization Record */}
                <div style={{ ...CARD_STYLE, padding: '24px' }}>
                  <h3 style={SECTION_TITLE_STYLE}>Sanitization Record</h3>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-[#64748b] mb-1">Last Sanitization Type</label>
                      <select 
                        value={sanitizationRecord.type}
                        onChange={(e) => setSanitizationRecord(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-[#e2e8f0] rounded px-3 py-1.5 text-sm bg-white focus:outline-none"
                      >
                        <option value="Heat Disinfection">Heat Disinfection</option>
                        <option value="Chemical Disinfection">Chemical Disinfection</option>
                        <option value="Ozone Treatment">Ozone Treatment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748b] mb-1">Next Due Date</label>
                      <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-1.5 rounded bg-white text-sm">
                        <span className="flex-1">{sanitizationRecord.nextDueDate}</span>
                        <CalendarTodayIcon style={{ fontSize: '14px', color: '#64748b' }} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[#64748b] mb-1">Performed By</label>
                      <input 
                        type="text" 
                        value={sanitizationRecord.performedBy}
                        onChange={(e) => setSanitizationRecord(prev => ({ ...prev, performedBy: e.target.value }))}
                        className="w-full border border-[#e2e8f0] rounded px-3 py-1.5 text-sm bg-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[#64748b] mb-1">Notes (Optional)</label>
                      <textarea 
                        className="w-full border border-[#e2e8f0] rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none h-16"
                        placeholder="Enter any notes..."
                        value={sanitizationNotes}
                        onChange={(e) => setSanitizationNotes(e.target.value)}
                      />
                      <div className="text-right text-xs text-[#94a3b8]">{sanitizationNotes.length} / 200</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Patient Summary Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={SECTION_TITLE_STYLE}>Patient Summary</h3>
                <div className="flex gap-4 items-center mb-6 mt-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <img src="https://ui-avatars.com/api/?name=Ramesh+Kumar&background=cbd5e1&color=334155" alt="Patient" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#0f172a] text-lg">Ramesh Kumar</h4>
                      <span className="px-2 py-0.5 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-full">Active Patient</span>
                    </div>
                    <p className="text-sm text-[#475569] mt-1">PID: P10023 &nbsp;|&nbsp; 58 Years, Male</p>
                    <p className="text-sm font-semibold text-[#0f172a] mt-1">Blood Group: <span className="font-bold">O+</span></p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-sm border-t border-[#f1f5f9] pt-4">
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Dialysis</span><span className="font-semibold text-[#0f172a]">12 Jan 2023 (2y 4m)</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Schedule</span><span className="font-semibold text-[#0f172a]">Mon, Wed, Fri</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Shift / Time</span><span className="font-semibold text-[#2563eb]">Morning (07:00 AM)</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Machine / Bed</span><span className="font-semibold text-[#2563eb]">B-02 / HD-01</span></div>
                </div>
              </div>

              {/* Water Quality Reference Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Water Quality Reference</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#64748b]">pH</span><span className="font-semibold text-[#0f172a]">6.5 – 8.0</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">TDS</span><span className="font-semibold text-[#0f172a]">≤ 500 ppm</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Conductivity</span><span className="font-semibold text-[#0f172a]">≤ 50 µS/cm</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Total Hardness</span><span className="font-semibold text-[#0f172a]">≤ 50 ppm</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Chlorine (Free)</span><span className="font-semibold text-[#0f172a]">≤ 0.1 ppm</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Bacteria (HPC)</span><span className="font-semibold text-[#0f172a]">≤ 100 CFU/mL</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Endotoxin</span><span className="font-semibold text-[#0f172a]">≤ 0.25 EU/mL</span></div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View AAMI Guidelines →</a>
                </div>
              </div>

              {/* Water Alerts Card */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon style={{ color: '#16a34a' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#166534' }}>Water Alerts</h3>
                </div>
                <span className="text-sm font-semibold text-[#15803d]">No water quality alerts.</span>
              </div>

              {/* Notes (Optional) Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Notes <span className="font-normal text-[#64748b] text-sm">(Optional)</span></h3>
                  <a href="#" className="text-blue-600 text-sm font-semibold">Add Note</a>
                </div>
                <textarea 
                  className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                  placeholder="Enter any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="text-right mt-1 text-xs text-[#94a3b8]">{notes.length} / 300</div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 flex justify-between items-center z-50">
          <Button variant="outline" onClick={onBack} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
            ← Back
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}>
              Save as Draft
            </Button>
            <Button 
              colorScheme="primary" 
              onClick={async () => {
                try {
                  await reviewWaterSafety(1, { ro_plant_id: 'RO-1', shift_id: 1 });
                } catch (_) {}
                if (onNext) onNext();
              }} 
              isDisabled={!isFormValid}
              style={{ padding: '10px 32px', borderRadius: '8px', background: isFormValid ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 600 }}
            >
              Save & Continue →
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default WaterSafetyView;
