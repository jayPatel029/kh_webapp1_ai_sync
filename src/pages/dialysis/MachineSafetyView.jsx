import { useNavigate, useLocation } from 'react-router-dom';
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';
import { reviewMachineSafety, getPatientDetails } from '../../ApiCalls/preDialysisApis';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsPowerOutlinedIcon from '@mui/icons-material/SettingsPowerOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { validateMachineSafety } from './machineSafetyValidation';



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

// Mock data based on P2-08 image
const MACHINE_INFO = {
  machineId: 'B-02',
  model: 'Fresenius 4008S',
  serialNumber: 'SN-4008S-22145',
  location: 'HD-01',
  checkTime: '26 May 2025, 06:55 AM'
};

const SAFETY_CHECKLIST = [
  { id: 'power', label: 'Power On Self Test', icon: SettingsPowerOutlinedIcon, status: 'OK', details: 'Completed Successfully', range: '—', action: '—' },
  { id: 'blood_leak', label: 'Blood Leak Detector', icon: WaterDropOutlinedIcon, status: 'OK', details: 'Pass', range: 'Pass', action: '—' },
  { id: 'air', label: 'Air Detector', icon: AirOutlinedIcon, status: 'OK', details: 'Pass', range: 'Pass', action: '—' },
  { id: 'venous', label: 'Venous Pressure Sensor', icon: MonitorHeartOutlinedIcon, status: 'OK', details: '-12 mmHg', range: '-250 to +250 mmHg', action: '—' },
  { id: 'arterial', label: 'Arterial Pressure Sensor', icon: MonitorHeartOutlinedIcon, status: 'OK', details: '98 mmHg', range: '-300 to +300 mmHg', action: '—' },
  { id: 'tmp', label: 'TMP Sensor', icon: MonitorHeartOutlinedIcon, status: 'OK', details: '52 mmHg', range: '0 - 500 mmHg', action: '—' },
  { id: 'heparin', label: 'Heparin Pump (if applicable)', icon: VaccinesOutlinedIcon, status: 'OK', details: 'Functional', range: 'Accurate delivery', action: '—' },
  { id: 'uf_pump', label: 'UF Pump / System', icon: SettingsPowerOutlinedIcon, status: 'OK', details: 'Functional', range: 'Accurate delivery', action: '—' },
  { id: 'conductivity', label: 'Conductivity Monitor (Dialysate)', icon: ScienceOutlinedIcon, status: 'OK', details: '14.2 mS/cm', range: '13.5 - 15.5 mS/cm', action: '—' },
  { id: 'temperature', label: 'Temperature Monitor (Dialysate)', icon: ThermostatOutlinedIcon, status: 'OK', details: '36.6 °C', range: '35.0 - 37.0 °C', action: '—' },
  { id: 'uf_rate', label: 'UF Rate Test', icon: SettingsPowerOutlinedIcon, status: 'OK', details: '500 mL/hr', range: '±10% accuracy', action: '—' },
  { id: 'emergency', label: 'Emergency Stop Button', icon: ReportProblemOutlinedIcon, status: 'OK', details: 'Functional', range: 'Must be functional', action: '—' },
  { id: 'alarms', label: 'Alarms & Indicators', icon: WarningAmberOutlinedIcon, status: 'OK', details: 'All audible & visible alarms working', range: 'All functional', action: '—' },
];

const MachineSafetyView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(() => {
    if (propSessionId) return propSessionId;
    try {
      const fromState = location.state?.sessionId || location.state?.session_id || location.state?.dialysis_session_id;
      if (fromState) return fromState;
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return patientId || 1;
  }, [propSessionId, location.state, patientId]);
  const [notes, setNotes] = useState('');
  const [patientData, setPatientData] = useState(null);
  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.patient || res.data?.data?.patient || res.data?.data || res.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, [patientId]);

  // Validate that all statuses are OK (for "Save & Continue" enabled state)
  const isFormValid = useMemo(() => {
    return validateMachineSafety(SAFETY_CHECKLIST);
  }, []);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-08 – Machine Safety</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Verify dialysis machine and associated equipment are safe and ready for use.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 5 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 5 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientData} isMobile={isMobile} />

          {/* Main Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left 8/12 Main Form */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Machine Information Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex items-center gap-2 mb-4">
                  <SettingsPowerOutlinedIcon style={{ color: '#2563eb' }} />
                  <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Machine Information</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Machine ID</label>
                    <input type="text" readOnly value={MACHINE_INFO.machineId} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Model</label>
                    <input type="text" readOnly value={MACHINE_INFO.model} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Serial Number</label>
                    <input type="text" readOnly value={MACHINE_INFO.serialNumber} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Location / Bed</label>
                    <input type="text" readOnly value={MACHINE_INFO.location} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Check Time</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-2 rounded-md bg-gray-50 text-sm">
                      <span className="flex-1">{MACHINE_INFO.checkTime}</span>
                      <CalendarTodayIcon style={{ fontSize: '16px', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine Safety Checklist */}
              <div style={{ ...CARD_STYLE }}>
                <div className="p-6 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <SettingsPowerOutlinedIcon style={{ color: '#2563eb' }} />
                    <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Machine Safety Checklist</h3>
                  </div>
                  <p className="text-sm text-[#475569]">Ensure all components are functional and within acceptable range.</p>
                </div>

                <div className="w-full text-sm mt-4">
                  {/* Header row */}
                  <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                    <div className="w-[30%]">Check Item</div>
                    <div className="w-[15%]">Status</div>
                    <div className="w-[25%]">Details / Reading</div>
                    <div className="w-[20%]">Reference Range</div>
                    <div className="w-[10%]">Action</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col">
                    {SAFETY_CHECKLIST.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className={`flex items-center px-6 py-3 ${idx !== SAFETY_CHECKLIST.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                          <div className="w-[30%] flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#eff6ff] text-[#2563eb]">
                              <Icon style={{ fontSize: '14px' }} />
                            </div>
                            <span className="font-semibold text-[#334155]">{item.label}</span>
                          </div>
                          
                          <div className="w-[15%] flex items-center">
                            {item.status === 'OK' ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-md font-semibold text-xs">
                                <CheckCircleIcon style={{ fontSize: '14px' }} /> OK
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 border border-red-200 text-red-700 rounded-md font-semibold text-xs">
                                Failed
                              </div>
                            )}
                          </div>
                          
                          <div className="w-[25%] text-[#475569] pr-4">{item.details}</div>
                          <div className="w-[20%] text-[#475569]">{item.range}</div>
                          <div className="w-[10%] text-[#94a3b8] font-semibold">{item.action}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="m-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center gap-3">
                  <CheckCircleIcon style={{ color: '#16a34a' }} />
                  <span className="font-bold text-[#166534] text-sm">Machine safety check completed. All parameters are within acceptable range.</span>
                </div>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Machine Details Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded">
                      <SettingsPowerOutlinedIcon style={{ fontSize: '18px', color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Machine Details</h3>
                  </div>
                  <a href="#" className="text-blue-600 text-sm font-semibold">Edit</a>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#64748b]">Manufacturer</span><span className="font-semibold text-[#0f172a]">Fresenius</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Model</span><span className="font-semibold text-[#0f172a]">4008S</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Serial Number</span><span className="font-semibold text-[#0f172a]">SN-4008S-22145</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Installation Date</span><span className="font-semibold text-[#0f172a]">15 Mar 2022</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Preventive Maintenance</span><span className="font-semibold text-[#0f172a]">18 May 2025</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Next Due</span><span className="font-semibold text-[#0f172a]">18 Jun 2025</span></div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View Maintenance History →</a>
                </div>
              </div>

              {/* Machine Alerts */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fffbeb', borderColor: '#fde68a' }}>
                <div className="flex items-center gap-2 mb-4">
                  <WarningAmberOutlinedIcon style={{ color: '#d97706' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#b45309' }}>Machine Alerts</h3>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon style={{ color: '#16a34a', fontSize: '18px' }} />
                  <span className="text-sm font-semibold text-[#0f172a]">No active machine alerts.</span>
                </div>
              </div>

              {/* Notes */}
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
                  await reviewMachineSafety(effectiveSessionId, { machine_id: 'HD-01' });
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

export default MachineSafetyView;
