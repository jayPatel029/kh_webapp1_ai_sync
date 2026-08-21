import { useNavigate, useLocation } from 'react-router-dom';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
  Switch,
  Badge,
  Textarea,
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
import { submitInfectionControl, getPatientDetails } from '../../ApiCalls/preDialysisApis';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CleanHandsOutlinedIcon from '@mui/icons-material/CleanHandsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const INFECTION_CONTROL_OVERVIEW_FALLBACK = {
  checkTime: '26 May 2025, 07:05 AM',
  checkPerformedBy: 'Rahul Singh',
};

// Checklist meta – controls which input to show & critical flag
const CHECKLIST_META = [
  { key: 'hand_hygiene', label: 'Hand Hygiene', icon: CleanHandsOutlinedIcon, type: 'bool', critical: true, helper: 'Performed before patient contact' },
  { key: 'ppe', label: 'Personal Protective Equipment (PPE)', icon: ShieldOutlinedIcon, type: 'bool', critical: false, helper: 'Gloves, mask as required' },
  { key: 'work_area_clean', label: 'Work Area Clean & Disinfected', icon: CleaningServicesOutlinedIcon, type: 'bool', critical: false, helper: 'Chair, bed, trolley, monitor surfaces' },
  { key: 'dialysis_machine_disinfected', label: 'Dialysis Machine Disinfected (Post Check)', icon: LocalHospitalOutlinedIcon, type: 'bool', critical: false, helper: 'External surfaces disinfected' },
  { key: 'ro_system_disinfection', label: 'RO System Disinfection', icon: WaterDropOutlinedIcon, type: 'tri', critical: false, helper: 'If applicable to this session' },
  { key: 'dialyzer_reuse', label: 'Dialyzer Reuse (If applicable)', icon: RepeatOutlinedIcon, type: 'tri', critical: false, helper: 'Single-use or reprocessed per policy' },
  { key: 'aseptic_technique', label: 'Aseptic Technique for Access', icon: HealingOutlinedIcon, type: 'bool', critical: true, helper: 'Aseptic non-touch technique' },
  { key: 'sharps_handling', label: 'Sharps Handling', icon: ShieldOutlinedIcon, type: 'bool', critical: true, helper: 'Safety container disposal' },
  { key: 'biomedical_waste', label: 'Bio-medical Waste Disposal', icon: DeleteOutlineIcon, type: 'bool', critical: false, helper: 'Bags sealed and labeled' },
  { key: 'isolation_precautions', label: 'Isolation Precautions (If applicable)', icon: ShieldOutlinedIcon, type: 'tri', critical: false, helper: 'No isolation if not required' },
];

const InfectionControlView = ({ patientId, sessionId: sessionIdProp, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(() => {
    try {
      const fromProp = sessionIdProp;
      if (fromProp) return fromProp;
      const fromState = location.state?.sessionId || location.state?.session_id || location.state?.dialysis_session_id;
      if (fromState) return fromState;
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return patientId || 1;
  }, [sessionIdProp, location.state, patientId]);
  const [patientData, setPatientData] = useState(null);
  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.patient || res.data?.data?.patient || res.data?.data || res.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, [patientId]);

  const [accessType, setAccessType] = useState('AVF');
  const [items, setItems] = useState({
    hand_hygiene: true,
    ppe: true,
    work_area_clean: true,
    dialysis_machine_disinfected: true,
    ro_system_disinfection: 'not_applicable',
    dialyzer_reuse: 'not_applicable',
    aseptic_technique: true,
    sharps_handling: true,
    biomedical_waste: true,
    isolation_precautions: 'not_applicable',
  });
  const [scrubHub, setScrubHub] = useState('yes');
  const [notes, setNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('All infection control practices followed as per protocol.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Critical validation for final
  const criticalInvalid = useMemo(() => {
    const issues = [];
    if (!items.hand_hygiene) issues.push('Hand hygiene is required on final');
    if (!items.aseptic_technique) issues.push('Aseptic technique is required on final');
    if (!items.sharps_handling) issues.push('Sharps handling is required on final');
    if (accessType === 'CVC' && !(scrubHub === 'yes' || scrubHub === true)) issues.push('Scrub-the-hub must be “yes” for CVC');
    return issues;
  }, [items, accessType, scrubHub]);

  const isFormValid = criticalInvalid.length === 0;

  const compliancePct = useMemo(() => {
    const values = Object.values(items);
    const okCount = values.filter((v) => v === true || v === 'not_applicable').length;
    return Math.round((okCount / values.length) * 100);
  }, [items]);

  const handleItemChange = (key, rawValue) => {
    let value = rawValue;
    // Select tri returns string 'true'/'false'/'not_applicable'
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    setItems((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key) => (e) => {
    setItems((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const buildPayload = () => {
    // tri fields keep 'not_applicable' string else boolean
    const normalize = (v) => (v === 'not_applicable' ? 'not_applicable' : !!v);
    return {
      status: 'final',
      access_type: accessType,
      items: {
        hand_hygiene: !!items.hand_hygiene,
        aseptic_technique: !!items.aseptic_technique,
        sharps_handling: !!items.sharps_handling,
        ppe: !!items.ppe,
        work_area_clean: !!items.work_area_clean,
        dialysis_machine_disinfected: !!items.dialysis_machine_disinfected,
        ro_system_disinfection: normalize(items.ro_system_disinfection),
        dialyzer_reuse: normalize(items.dialyzer_reuse),
        biomedical_waste: !!items.biomedical_waste,
        isolation_precautions: normalize(items.isolation_precautions),
      },
      scrub_the_hub_result: accessType === 'CVC' ? (scrubHub === true ? 'yes' : scrubHub || 'yes') : null,
      notes: notes || additionalNotes || '',
      skips: [],
    };
  };

  const handleSave = async () => {
    setSubmitError('');
    if (!isFormValid) return;
    setIsSubmitting(true);
    const payload = buildPayload();
    const res = await submitInfectionControl(effectiveSessionId, payload);
    setIsSubmitting(false);
    if (!res.success) {
      setSubmitError(res.message || 'Failed to save infection control. Please try again.');
      return;
    }
    if (onNext) onNext();
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-10 – Infection Control</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Take the infection-control checklist and submit for this session.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 7 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 7 ? 'step' : undefined}
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
            {/* Left 8/12 Main Content */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Access & Context Card */}
              <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563eb] shadow-sm">
                        <ShieldOutlinedIcon style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[14px]">Session Access & Protocol Context</Text>
                        <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Select access route to auto-configure required infection protocols</Text>
                      </div>
                    </div>
                    <Badge variant="subtle" colorScheme={compliancePct === 100 ? "success" : "warning"} size="md" isPill className="font-bold">
                      {compliancePct}% Protocol Compliance
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Vascular Access Type <span className="text-red-500">*</span></FormLabel>
                      <Select size="sm" value={accessType} onChange={(e) => setAccessType(e.target.value)} className="font-medium">
                        <option value="AVF">AVF (Arteriovenous Fistula)</option>
                        <option value="CVC">CVC (Central Venous Catheter)</option>
                      </Select>
                      <Text as="span" size="xs" className="text-[#64748b] mt-1 !text-[11px] block">{accessType === 'CVC' ? 'Central venous catheter — Scrub-the-hub required' : 'Arteriovenous fistula'}</Text>
                    </FormControl>
                    {accessType === 'CVC' ? (
                      <FormControl>
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Scrub-the-Hub Protocol <span className="text-red-500">*</span></FormLabel>
                        <Select size="sm" value={scrubHub} onChange={(e) => setScrubHub(e.target.value)} className="font-semibold text-blue-700 bg-blue-50/50 border-blue-200">
                          <option value="yes">✓ Performed (Yes)</option>
                          <option value="no">✗ Not Performed (No)</option>
                        </Select>
                        <Text as="span" size="xs" className="text-blue-600 mt-1 !text-[11px] block font-medium">Scrub hub prior to connection</Text>
                      </FormControl>
                    ) : (
                      <FormControl>
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Scrub-the-Hub Protocol</FormLabel>
                        <div className="h-9 flex items-center px-3 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-500 font-medium">
                          Not Applicable (AVF Route)
                        </div>
                      </FormControl>
                    )}
                    <div>
                      <Text as="div" size="xs" weight="semibold" className="tracking-wide uppercase text-[#64748b] !text-[11px] mb-1.5">Overall Compliance Status</Text>
                      <div className="h-9 flex items-center justify-between px-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs">
                        <span>{compliancePct === 100 ? 'Fully Compliant' : `${compliancePct}% Compliant`}</span>
                        <CheckCircleIcon style={{ fontSize: 16 }} className="text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-600">
                      <span>Checklist Completion</span>
                      <span className="font-bold text-slate-800">{compliancePct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${compliancePct === 100 ? 'bg-emerald-500' : compliancePct >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${compliancePct}%` }}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Infection Control Checklist Card — editable */}
              <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <CleanHandsOutlinedIcon style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[14px]">Infection Control Checklist</Text>
                        <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Verify each safety item — critical items must be compliant before proceeding</Text>
                      </div>
                    </div>
                    {criticalInvalid.length === 0 ? (
                      <Badge variant="subtle" colorScheme="success" size="md" isPill className="shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3">
                        <CheckCircleIcon style={{ fontSize: 13 }} className="mr-1.5 text-emerald-600" /> Ready to Submit
                      </Badge>
                    ) : (
                      <Badge variant="subtle" colorScheme="danger" size="md" isPill className="shrink-0 bg-red-50 border border-red-200 text-red-700 px-3">
                        <WarningAmberOutlinedIcon style={{ fontSize: 13 }} className="mr-1.5 text-red-600" /> {criticalInvalid.length} Required
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="p-4 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {CHECKLIST_META.map((meta) => {
                      const Icon = meta.icon;
                      const value = items[meta.key];
                      const isNA = value === 'not_applicable';
                      const isBoolOk = value === true;
                      const isBoolFail = value === false;
                      return (
                        <div 
                          key={meta.key} 
                          className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                            isNA 
                              ? 'border-slate-200' 
                              : isBoolOk 
                              ? 'border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20' 
                              : 'border-red-200 bg-gradient-to-b from-white to-red-50/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                                  isNA ? 'bg-slate-100 border-slate-200 text-slate-400' : isBoolOk ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'
                                }`}>
                                  <Icon style={{ fontSize: 18 }} />
                                </div>
                                <div className="min-w-0">
                                  <Text as="div" size="sm" weight="bold" className="text-[#0f172a] leading-tight !text-[13px]">
                                    {meta.label}
                                  </Text>
                                  <Text as="div" size="xs" className="text-[#64748b] mt-0.5 !text-[11px] leading-tight line-clamp-1">
                                    {meta.helper}
                                  </Text>
                                </div>
                              </div>
                              {meta.critical && (
                                <span className="inline-flex items-center text-[9px] font-extrabold text-red-700 border border-red-300 bg-red-50 rounded-full px-2 py-0.5 uppercase tracking-wider shrink-0">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {meta.type === 'bool' ? (
                                <div className="inline-flex p-0.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => handleItemChange(meta.key, true)}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      value === true
                                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ✓ Compliant
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleItemChange(meta.key, false)}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      value === false
                                        ? 'bg-red-600 text-white shadow-sm font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ✗ Non-Compliant
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex p-0.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => handleItemChange(meta.key, true)}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      value === true
                                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ✓ Compliant
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleItemChange(meta.key, false)}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      value === false
                                        ? 'bg-red-600 text-white shadow-sm font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ✗ Non-Compliant
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleItemChange(meta.key, 'not_applicable')}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      isNA
                                        ? 'bg-slate-700 text-white shadow-sm font-bold'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ⊝ N/A
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="shrink-0">
                              {isNA ? (
                                <Badge variant="subtle" colorScheme="gray" size="sm" isPill className="font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  <RemoveCircleOutlineIcon style={{ fontSize: 12 }} className="mr-1" /> N/A
                                </Badge>
                              ) : isBoolOk ? (
                                <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircleIcon style={{ fontSize: 12 }} className="mr-1 text-emerald-600" /> Compliant
                                </Badge>
                              ) : (
                                <Badge variant="subtle" colorScheme="danger" size="sm" isPill className="font-bold bg-red-50 text-red-700 border border-red-200">
                                  <WarningAmberOutlinedIcon style={{ fontSize: 12 }} className="mr-1 text-red-600" /> Action
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>

                {criticalInvalid.length > 0 && (
                  <div className="mx-5 my-4 rounded-xl border border-red-200 bg-red-50/80 p-4">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-xs mb-1">
                      <WarningAmberOutlinedIcon style={{ fontSize: 16 }} className="text-red-600" />
                      Required Items Non-Compliant
                    </div>
                    <ul className="list-disc pl-5 text-[11px] text-red-800 space-y-0.5">
                      {criticalInvalid.map((msg) => <li key={msg}>{msg}</li>)}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Bottom Split (Notes & Action Required) — uniform cards */}
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Card variant="outline" size="md" className="overflow-hidden flex flex-col shadow-sm">
                  <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                    <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Additional Notes & Observations</Text>
                    <Text as="p" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Record additional clinical notes for this session</Text>
                  </CardHeader>
                  <CardBody className="p-5 flex-1 flex flex-col gap-3">
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Observations</FormLabel>
                      <Textarea size="sm" resize="none" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Additional observations…" className="min-h-[80px] !text-[13px]" />
                      <div className="text-right text-[11px] font-medium text-[#94a3b8] mt-1">{additionalNotes.length} / 500</div>
                    </FormControl>
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Session Notes</FormLabel>
                      <Textarea size="sm" resize="none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter session notes for submission…" className="min-h-[70px] !text-[13px]" maxLength={500} />
                      <div className="flex justify-between mt-1">
                        <Text as="span" size="xs" className="text-[#94a3b8] !text-[11px]">Included in submission API</Text>
                        <Text as="span" size="xs" className="text-[#94a3b8] !text-[11px]">{notes.length} / 500</Text>
                      </div>
                    </FormControl>
                  </CardBody>
                </Card>

                <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                  <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                    <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Action Status & Requirements</Text>
                    <Text as="p" size="xs" className="text-[#64748b] mt-1 !text-[11px]">System validation check</Text>
                  </CardHeader>
                  <CardBody className="p-5">
                    {criticalInvalid.length === 0 ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <CheckCircleIcon style={{ color: '#16a34a', fontSize: 24 }} />
                        <div>
                          <Text as="div" size="sm" weight="bold" className="text-emerald-900 !text-[13px]">All Clear — Ready for Submission</Text>
                          <Text as="div" size="xs" className="text-emerald-700 !text-[11px] mt-0.5">All critical infection control standards met. Click Save & Continue to proceed.</Text>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                        <WarningAmberOutlinedIcon style={{ color: '#d97706', fontSize: 24, marginTop: 2 }} />
                        <div>
                          <Text as="div" size="sm" weight="bold" className="text-amber-900 !text-[13px]">Action Required Prior to Finalizing</Text>
                          <Text as="div" size="xs" className="text-amber-800 !text-[11px] mt-0.5">Ensure all critical items (Hand Hygiene, Aseptic Technique, Sharps Handling, and CVC Scrub-the-hub) are marked as compliant.</Text>
                        </div>
                      </div>
                    )}
                    {submitError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-800 flex items-center gap-2">
                        <WarningAmberOutlinedIcon style={{ fontSize: 16 }} className="text-red-600 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              <Card variant="outline" size="md" className="overflow-hidden shadow-sm" style={{ background: criticalInvalid.length ? '#fffbe6' : '#f0fdf4', borderColor: criticalInvalid.length ? '#ffe58f' : '#bbf7d0' }}>
                <CardBody className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {criticalInvalid.length ? (
                      <WarningAmberOutlinedIcon style={{ color: '#d97706' }} />
                    ) : (
                      <CheckCircleIcon style={{ color: '#16a34a' }} />
                    )}
                    <Text as="h3" size="sm" weight="bold" className={criticalInvalid.length ? "text-amber-900 !text-[13px]" : "text-emerald-900 !text-[13px]"}>
                      Infection Control Alert Status
                    </Text>
                  </div>
                  <Text as="span" size="sm" weight="semibold" className={criticalInvalid.length ? "text-amber-800 !text-[12px]" : "text-emerald-700 !text-[12px]"}>
                    {criticalInvalid.length ? `${criticalInvalid.length} critical requirement(s) pending` : 'No active infection control alerts.'}
                  </Text>
                </CardBody>
              </Card>

              <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] !text-[13px]">Infection Prevention Summary</Text>
                </CardHeader>
                <CardBody className="p-5 flex flex-col gap-3">
                  {[
                    ['Hand Hygiene Protocol', items.hand_hygiene ? '✓ Compliant' : '✗ Pending'],
                    ['PPE Compliance', items.ppe ? '✓ Compliant' : '✗ Pending'],
                    ['Aseptic Technique', items.aseptic_technique ? '✓ Compliant' : '✗ Pending'],
                    ['Sharps Handling', items.sharps_handling ? '✓ Compliant' : '✗ Pending'],
                    ['Dialysis Machine Surface', items.dialysis_machine_disinfected ? '✓ Disinfected' : 'Pending'],
                    ['Scrub-the-Hub (CVC)', accessType === 'CVC' ? (scrubHub === 'yes' ? '✓ Performed' : '✗ Required') : 'N/A (AVF)'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-xs py-1 border-b border-slate-50 last:border-0">
                      <Text as="span" size="xs" className="text-slate-600 !text-[12px] font-medium">{k}</Text>
                      <Text as="span" size="xs" weight="semibold" className={v.startsWith('✓') ? "text-emerald-700 !text-[12px] font-bold" : v.startsWith('✗') ? "text-red-600 !text-[12px] font-bold" : "text-slate-500 !text-[12px]"}>{v}</Text>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 flex justify-between items-center z-50">
          <Button variant="outline" onClick={onBack} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
            ← Back
          </Button>
          <div className="flex gap-4 items-center">
            {submitError && <Text as="span" size="xs" className="text-red-600 max-w-[240px] truncate hidden sm:block">{submitError}</Text>}
            <Button variant="outline" style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }} onClick={() => setNotes('')}>
              Clear notes
            </Button>
            <Button
              variant="solid"
              isLoading={isSubmitting}
              isDisabled={!isFormValid || isSubmitting}
              onClick={handleSave}
              style={{ padding: '10px 32px', borderRadius: '8px', background: isFormValid ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 600 }}
            >
              {isSubmitting ? 'Submitting…' : 'Save & Continue →'}
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default InfectionControlView;
