import { useNavigate, useLocation } from 'react-router-dom';
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';
import {
  reviewMachineSafety,
  getPatientDetails,
  getMachineQcToday,
  getMachineSelfTestToday,
} from '../../ApiCalls/preDialysisApis';
import { getDialysisSessionById } from '../../ApiCalls/dialysisSessionApis';
import { resolveP2SessionId, liveValue, MISSING } from './p2Runtime';
import { saveP2Draft } from './p2DraftCache';

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

const CHECK_FIELDS = [
  { id: 'self_test', label: 'Power On Self Test', icon: SettingsPowerOutlinedIcon, source: 'self_test' },
  { id: 'qc_status', label: 'Daily Machine QC', icon: ScienceOutlinedIcon, source: 'qc' },
  { id: 'blood_leak', label: 'Blood Leak Detector', icon: WaterDropOutlinedIcon, keys: ['blood_leak', 'blood_leak_detector'] },
  { id: 'air', label: 'Air Detector', icon: AirOutlinedIcon, keys: ['air_detector', 'air'] },
  { id: 'venous', label: 'Venous Pressure Sensor', icon: MonitorHeartOutlinedIcon, keys: ['venous_pressure', 'venous'] },
  { id: 'arterial', label: 'Arterial Pressure Sensor', icon: MonitorHeartOutlinedIcon, keys: ['arterial_pressure', 'arterial'] },
  { id: 'tmp', label: 'TMP Sensor', icon: MonitorHeartOutlinedIcon, keys: ['tmp', 'tmp_sensor'] },
  { id: 'heparin', label: 'Heparin Pump (if applicable)', icon: VaccinesOutlinedIcon, keys: ['heparin_pump', 'heparin'] },
  { id: 'uf_pump', label: 'UF Pump / System', icon: SettingsPowerOutlinedIcon, keys: ['uf_pump', 'uf'] },
  { id: 'conductivity', label: 'Conductivity Monitor (Dialysate)', icon: ScienceOutlinedIcon, keys: ['conductivity'] },
  { id: 'temperature', label: 'Temperature Monitor (Dialysate)', icon: ThermostatOutlinedIcon, keys: ['temperature', 'temp'] },
  { id: 'emergency', label: 'Emergency Stop Button', icon: ReportProblemOutlinedIcon, keys: ['emergency_stop', 'emergency'] },
  { id: 'alarms', label: 'Alarms & Indicators', icon: WarningAmberOutlinedIcon, keys: ['alarms'] },
];

function pickField(row, keys = []) {
  if (!row) return null;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
  }
  return null;
}

function statusFromValue(value, fallbackStatus) {
  if (value === null || value === undefined || value === '') return fallbackStatus || 'Missing';
  const raw = String(value).toLowerCase();
  if (['passed', 'pass', 'ok', '1', 'true'].includes(raw)) return 'OK';
  if (['failed', 'fail', 'not yet performed'].includes(raw)) return 'Failed';
  return String(value);
}

const MachineSafetyView = ({ patientId, sessionId: propSessionId, machineId: propMachineId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(
    () => resolveP2SessionId(propSessionId, location),
    [propSessionId, location],
  );
  const [notes, setNotes] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [machineId, setMachineId] = useState(propMachineId || '');
  const [machineInfo, setMachineInfo] = useState({
    machineId: MISSING,
    model: MISSING,
    serialNumber: MISSING,
    location: MISSING,
    checkTime: MISSING,
    manufacturer: MISSING,
    installationDate: MISSING,
    lastPm: MISSING,
    nextDue: MISSING,
  });
  const [checklist, setChecklist] = useState([]);
  const [warning, setWarning] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMsg, setDraftMsg] = useState('');

  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => {
      if (mounted && res?.success) {
        setPatientData(res.data?.patient || res.data?.data?.patient || res.data?.data || res.data);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, [patientId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setWarning('');
      let resolvedMachineId = propMachineId || '';
      if (effectiveSessionId) {
        const sessionRes = await getDialysisSessionById(effectiveSessionId);
        if (sessionRes?.success) {
          const session = sessionRes.data?.data || sessionRes.data || {};
          resolvedMachineId = resolvedMachineId || session.machine_id || session.machineId || '';
          if (mounted) {
            setMachineInfo((prev) => ({
              ...prev,
              machineId: liveValue(resolvedMachineId),
              location: liveValue(session.bed_code || session.bed_id),
              model: liveValue(session.machine_model),
              serialNumber: liveValue(session.machine_serial || session.serial_number),
              manufacturer: liveValue(session.machine_manufacturer),
            }));
          }
        }
      }
      if (mounted) setMachineId(resolvedMachineId);
      if (!resolvedMachineId) {
        if (mounted) {
          setChecklist([]);
          setWarning('No machine is linked to this session. Machine QC cannot be loaded.');
        }
        return;
      }
      const [qcRes, stRes] = await Promise.all([
        getMachineQcToday(resolvedMachineId),
        getMachineSelfTestToday(resolvedMachineId),
      ]);
      const qc = qcRes?.success ? (qcRes.data?.qc || qcRes.data) : null;
      const selfTest = stRes?.success ? (stRes.data?.self_test || stRes.data) : null;
      const qcStatus = String(qc?.status || '').toLowerCase();
      const stStatus = String(selfTest?.status || '').toLowerCase();
      const hasTodayCheck = qcStatus === 'passed' && stStatus === 'passed';
      if (!hasTodayCheck && mounted) {
        setWarning('No passed machine QC / self-test recorded for today. Continue is blocked until both pass.');
      }
      const rows = CHECK_FIELDS.map((field) => {
        if (field.source === 'self_test') {
          return {
            ...field,
            status: statusFromValue(selfTest?.status, 'Missing'),
            details: liveValue(selfTest?.summary || selfTest?.status),
            range: 'Passed today',
            action: MISSING,
          };
        }
        if (field.source === 'qc') {
          return {
            ...field,
            status: statusFromValue(qc?.status, 'Missing'),
            details: liveValue(qc?.summary || qc?.status),
            range: 'Passed today',
            action: MISSING,
          };
        }
        const reading = pickField(qc, field.keys) ?? pickField(selfTest, field.keys);
        return {
          ...field,
          status: reading == null ? 'Missing' : statusFromValue(reading),
          details: liveValue(reading),
          range: MISSING,
          action: MISSING,
        };
      });
      if (mounted) {
        setChecklist(rows);
        setMachineInfo((prev) => ({
          ...prev,
          checkTime: liveValue(qc?.performed_at || selfTest?.performed_at || qc?.check_date),
          lastPm: liveValue(qc?.last_pm || qc?.last_preventive_maintenance),
          nextDue: liveValue(qc?.next_due),
        }));
      }
    };
    load().catch(() => {
      if (mounted) setWarning('Could not load machine QC for today.');
    });
    return () => { mounted = false; };
  }, [effectiveSessionId, propMachineId]);

  const isFormValid = Boolean(effectiveSessionId && machineId && !warning);

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
                    <input type="text" readOnly value={machineInfo.machineId} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Model</label>
                    <input type="text" readOnly value={machineInfo.model} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Serial Number</label>
                    <input type="text" readOnly value={machineInfo.serialNumber} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Location / Bed</label>
                    <input type="text" readOnly value={machineInfo.location} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Check Time</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-2 rounded-md bg-gray-50 text-sm">
                      <span className="flex-1">{machineInfo.checkTime}</span>
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
                    {checklist.length === 0 ? (
                      <div className="px-6 py-6 text-sm text-[#b45309] font-semibold">
                        {warning || 'No machine safety readings are recorded for today.'}
                      </div>
                    ) : null}
                    {checklist.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className={`flex items-center px-6 py-3 ${idx !== checklist.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
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

                {warning ? (
                  <div className="m-6 p-4 bg-[#fffbeb] border border-[#fde68a] rounded-lg flex items-center gap-3">
                    <WarningAmberOutlinedIcon style={{ color: '#d97706' }} />
                    <span className="font-bold text-[#b45309] text-sm">{warning}</span>
                  </div>
                ) : (
                  <div className="m-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center gap-3">
                    <CheckCircleIcon style={{ color: '#16a34a' }} />
                    <span className="font-bold text-[#166534] text-sm">Today's machine QC and self-test both passed.</span>
                  </div>
                )}
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
                  <div className="flex justify-between"><span className="text-[#64748b]">Manufacturer</span><span className="font-semibold text-[#0f172a]">{machineInfo.manufacturer}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Model</span><span className="font-semibold text-[#0f172a]">{machineInfo.model}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Serial Number</span><span className="font-semibold text-[#0f172a]">{machineInfo.serialNumber}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Installation Date</span><span className="font-semibold text-[#0f172a]">{machineInfo.installationDate}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Preventive Maintenance</span><span className="font-semibold text-[#0f172a]">{machineInfo.lastPm}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Next Due</span><span className="font-semibold text-[#0f172a]">{machineInfo.nextDue}</span></div>
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
                  <span className="text-sm font-semibold text-[#0f172a]">{warning || 'No active machine alerts.'}</span>
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
          {submitError ? <span className="text-sm text-red-600 font-semibold mr-4">{submitError}</span> : null}
          {draftMsg ? <span className="text-sm text-slate-500 mr-4">{draftMsg}</span> : null}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={async () => {
                await saveP2Draft(effectiveSessionId, 'P2-08', { notes, machineId });
                setDraftMsg('Draft saved on this device.');
              }}
              style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
            >
              Save as Draft
            </Button>
            <Button 
              colorScheme="primary" 
              onClick={async () => {
                if (!effectiveSessionId || !machineId) {
                  setSubmitError('Session and machine id are required.');
                  return;
                }
                setIsSubmitting(true);
                setSubmitError('');
                const res = await reviewMachineSafety(effectiveSessionId, { machine_id: machineId, notes });
                setIsSubmitting(false);
                if (!res?.success) {
                  setSubmitError(res?.message || 'Machine QC must pass before continuing.');
                  return;
                }
                if (onNext) onNext();
              }} 
              isDisabled={!isFormValid || isSubmitting}
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
