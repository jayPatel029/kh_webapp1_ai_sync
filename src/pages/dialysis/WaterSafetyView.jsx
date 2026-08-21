import { useNavigate, useLocation } from 'react-router-dom';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  Textarea,
  Badge,
  FormControl,
  FormLabel,
  Text,
} from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';
import { validateWaterSafety } from './waterSafetyValidation';
import { reviewWaterSafety, getPatientDetails } from '../../ApiCalls/preDialysisApis';

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
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

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

const WaterSafetyView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
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
  const [patientData, setPatientData] = useState(null);
  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.patient || res.data?.data?.patient || res.data?.data || res.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, [patientId]);
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
          
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 6 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 6 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientData} isMobile={isMobile} />

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

              {/* Bottom Split (Additional Checks & Sanitization Record) — component-library uniform */}
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Additional Checks */}
                <Card variant="outline" size="md" className="overflow-hidden flex flex-col">
                  <CardHeader className="px-5 pt-5 pb-4 bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-sm">
                          <SpeedIcon style={{ fontSize: 16 }} />
                        </div>
                        <div>
                          <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Additional Checks</Text>
                          <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">RO performance &amp; filtration</Text>
                        </div>
                      </div>
                      <Badge variant="subtle" colorScheme="success" size="sm" isPill className="shrink-0 bg-white border border-[#bbf7d0] !text-[#15803d] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mr-1.5 inline-block" aria-hidden /> 4 / 4 OK
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardBody className="p-0 divide-y divide-[#f1f5f9] flex-1">
                    {/* RO Pressure */}
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#475569] shrink-0">
                        <SpeedIcon style={{ fontSize: 14 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text as="div" size="sm" weight="semibold" className="text-[#0f172a] leading-none !text-[13px]">RO Pressure</Text>
                        <Text as="div" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Range <span className="font-semibold text-[#334155]">50 – 80 psi</span></Text>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <InputGroup size="sm" className="w-[92px]">
                          <Input
                            type="number"
                            size="sm"
                            value={additionalChecks.roPressure}
                            onChange={(e) => setAdditionalChecks(prev => ({ ...prev, roPressure: e.target.value }))}
                            className="text-center font-semibold !text-[13px]"
                            aria-label="RO Pressure"
                          />
                          <InputRightAddon className="!text-[11px] font-semibold text-[#64748b] bg-[#f8fafc]">psi</InputRightAddon>
                        </InputGroup>
                        <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold">
                          <CheckCircleIcon style={{ fontSize: 12 }} className="mr-1" /> OK
                        </Badge>
                      </div>
                    </div>
                    {/* RO Flow Rate */}
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#475569] shrink-0">
                        <OpacityIcon style={{ fontSize: 14 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text as="div" size="sm" weight="semibold" className="text-[#0f172a] leading-none !text-[13px]">RO Flow Rate</Text>
                        <Text as="div" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Range <span className="font-semibold text-[#334155]">100 – 150 L/hr</span></Text>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <InputGroup size="sm" className="w-[106px]">
                          <Input
                            type="number"
                            size="sm"
                            value={additionalChecks.roFlowRate}
                            onChange={(e) => setAdditionalChecks(prev => ({ ...prev, roFlowRate: e.target.value }))}
                            className="text-center font-semibold !text-[13px]"
                            aria-label="RO Flow Rate"
                          />
                          <InputRightAddon className="!text-[11px] font-semibold text-[#64748b] bg-[#f8fafc]">L/hr</InputRightAddon>
                        </InputGroup>
                        <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold">
                          <CheckCircleIcon style={{ fontSize: 12 }} className="mr-1" /> OK
                        </Badge>
                      </div>
                    </div>
                    {/* Carbon Filter Status */}
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#475569] shrink-0">
                        <FilterAltOutlinedIcon style={{ fontSize: 14 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text as="div" size="sm" weight="semibold" className="text-[#0f172a] leading-none !text-[13px]">Carbon Filter</Text>
                        <Text as="div" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Replace per schedule</Text>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          size="sm"
                          value={additionalChecks.carbonFilterStatus}
                          onChange={(e) => setAdditionalChecks(prev => ({ ...prev, carbonFilterStatus: e.target.value }))}
                          className="min-w-[132px]"
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Replace Soon">Replace Soon</option>
                        </Select>
                        <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold">
                          <CheckCircleIcon style={{ fontSize: 12 }} className="mr-1" /> OK
                        </Badge>
                      </div>
                    </div>
                    {/* Softener Status */}
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#475569] shrink-0">
                        <TuneOutlinedIcon style={{ fontSize: 14 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text as="div" size="sm" weight="semibold" className="text-[#0f172a] leading-none !text-[13px]">Softener Status</Text>
                        <Text as="div" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Regeneration cycle</Text>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          size="sm"
                          value={additionalChecks.softenerStatus}
                          onChange={(e) => setAdditionalChecks(prev => ({ ...prev, softenerStatus: e.target.value }))}
                          className="min-w-[132px]"
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Regenerate">Regenerate</option>
                        </Select>
                        <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold">
                          <CheckCircleIcon style={{ fontSize: 12 }} className="mr-1" /> OK
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Sanitization Record */}
                <Card variant="outline" size="md" className="overflow-hidden flex flex-col">
                  <CardHeader className="px-5 pt-5 pb-4 bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center text-[#0f766e] shadow-sm">
                        <CleaningServicesOutlinedIcon style={{ fontSize: 16 }} />
                      </div>
                      <div>
                        <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Sanitization Record</Text>
                        <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Last cycle &amp; next due</Text>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <FormControl>
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Last type</FormLabel>
                        <Select
                          size="sm"
                          value={sanitizationRecord.type}
                          onChange={(e) => setSanitizationRecord(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="Heat Disinfection">Heat Disinfection</option>
                          <option value="Chemical Disinfection">Chemical Disinfection</option>
                          <option value="Ozone Treatment">Ozone Treatment</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Next due</FormLabel>
                        <div className="flex items-center gap-2 bg-white border border-[var(--color-accent)] rounded-[var(--radius-md)] px-3 h-8">
                          <CalendarTodayIcon style={{ fontSize: 14, color: '#64748b' }} />
                          <span className="flex-1 text-[13px] font-semibold text-[#0f172a]">{sanitizationRecord.nextDueDate}</span>
                          <Badge variant="subtle" colorScheme="warning" size="sm" className="font-bold !text-[10px]">DUE</Badge>
                        </div>
                      </FormControl>
                    </div>
                    <FormControl className="mt-3">
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Performed by</FormLabel>
                      <InputGroup size="sm">
                        <Input
                          size="sm"
                          value={sanitizationRecord.performedBy}
                          onChange={(e) => setSanitizationRecord(prev => ({ ...prev, performedBy: e.target.value }))}
                          placeholder="Technician name"
                          className="!pl-8 !text-[13px]"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none z-10">
                          <PersonOutlineOutlinedIcon style={{ fontSize: 16 }} />
                        </span>
                      </InputGroup>
                    </FormControl>
                    <FormControl className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !m-0">Notes <span className="normal-case font-normal text-[#94a3b8]">(optional)</span></FormLabel>
                        <Text as="span" size="xs" className="!text-[11px] font-medium text-[#94a3b8]">{sanitizationNotes.length} / 200</Text>
                      </div>
                      <Textarea
                        size="sm"
                        resize="none"
                        placeholder="Add observations from this cycle…"
                        value={sanitizationNotes}
                        onChange={(e) => setSanitizationNotes(e.target.value)}
                        maxLength={200}
                        className="min-h-[68px] !text-[13px]"
                      />
                    </FormControl>
                  </CardBody>
                  <CardFooter className="mx-5 mb-5 mt-0 p-0 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 flex items-center justify-between">
                    <Text as="span" size="xs" weight="semibold" className="tracking-wide uppercase text-[#64748b] !text-[11px]">Compliance</Text>
                    <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold">
                      <CheckCircleIcon style={{ fontSize: 14, color: '#16a34a' }} className="mr-1" /> Cycle logged &amp; up to date
                    </Badge>
                  </CardFooter>
                </Card>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
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
                {/* <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View AAMI Guidelines →</a>
                </div> */}
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
                  await reviewWaterSafety(effectiveSessionId, { ro_plant_id: 'RO-1', shift_id: 1 });
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
