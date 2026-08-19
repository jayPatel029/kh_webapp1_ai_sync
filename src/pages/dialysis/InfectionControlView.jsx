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
      const fromState = location.state?.sessionId || location.state?.session_id;
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
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.data || res.data); }).catch(()=>{});
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
              <Card variant="outline" size="md" className="overflow-hidden">
                <CardHeader className="px-5 pt-5 pb-4 bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-sm">
                      <ShieldOutlinedIcon style={{ fontSize: 16 }} />
                    </div>
                    <div>
                      <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Session access & check</Text>
                      <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Select AVF or CVC — CVC adds scrub-the-hub</Text>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-5">
                  <div className="grid grid-cols-3 gap-3">
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Access type <span className="text-red-500">*</span></FormLabel>
                      <Select size="sm" value={accessType} onChange={(e) => setAccessType(e.target.value)}>
                        <option value="AVF">AVF</option>
                        <option value="CVC">CVC</option>
                      </Select>
                      <Text as="span" size="xs" className="text-[#64748b] mt-1 !text-[11px]">{accessType === 'CVC' ? 'Central venous catheter — scrub required' : 'Arteriovenous fistula'}</Text>
                    </FormControl>
                    {accessType === 'CVC' ? (
                      <FormControl>
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Scrub-the-hub <span className="text-red-500">*</span></FormLabel>
                        <Select size="sm" value={scrubHub} onChange={(e) => setScrubHub(e.target.value)}>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </Select>
                      </FormControl>
                    ) : (
                      <FormControl>
                        <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Scrub-the-hub</FormLabel>
                        <div className="h-8 flex items-center px-3 rounded-[var(--radius-md)] border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#475569]">Not applicable — AVF</div>
                      </FormControl>
                    )}
                    <div>
                      <Text as="div" size="xs" weight="semibold" className="tracking-wide uppercase text-[#64748b] !text-[11px] mb-1.5">Compliance</Text>
                      <div className="h-8 flex items-center justify-center rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-3 font-bold text-sm text-[#166534]">{compliancePct}%</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Infection Control Checklist Card — editable */}
              <Card variant="outline" size="md" className="overflow-hidden">
                <CardHeader className="px-5 pt-5 pb-4 bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shadow-sm">
                        <ShieldOutlinedIcon style={{ fontSize: 16 }} />
                      </div>
                      <div>
                        <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Infection Control Checklist</Text>
                        <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Edit each item and submit — critical items must be compliant on final</Text>
                      </div>
                    </div>
                    {criticalInvalid.length === 0 ? (
                      <Badge variant="subtle" colorScheme="success" size="sm" isPill className="shrink-0 bg-white border border-[#bbf7d0]"><CheckCircleIcon style={{ fontSize: 12 }} className="mr-1" /> Ready</Badge>
                    ) : (
                      <Badge variant="subtle" colorScheme="danger" size="sm" isPill className="shrink-0"><WarningAmberOutlinedIcon style={{ fontSize: 12 }} className="mr-1" /> {criticalInvalid.length} required</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="p-0">
                  {/* Table header */}
                  <div className="hidden sm:flex border-b border-[#e2e8f0] px-5 py-2.5 text-[#64748b] font-semibold text-[11px] uppercase tracking-wider">
                    <div className="w-[42%]">Item</div>
                    <div className="w-[28%]">Input</div>
                    <div className="w-[18%]">Status</div>
                    <div className="w-[12%] text-right">Hint</div>
                  </div>

                  <div className="divide-y divide-[#f1f5f9]">
                    {CHECKLIST_META.map((meta) => {
                      const Icon = meta.icon;
                      const value = items[meta.key];
                      const isNA = value === 'not_applicable';
                      const isBoolOk = value === true;
                      const isBoolFail = value === false;
                      return (
                        <div key={meta.key} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                          <div className="sm:w-[42%] flex items-center gap-3 min-w-0">
                            <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${isNA ? 'bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b]' : 'bg-[#eff6ff] border-[#dbeafe] text-[#2563eb]'}`}>
                              <Icon style={{ fontSize: 14 }} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Text as="div" size="sm" weight="semibold" className="text-[#0f172a] leading-none !text-[13px] truncate">{meta.label}</Text>
                                {meta.critical && <span className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50 rounded px-1">CRITICAL</span>}
                              </div>
                              <Text as="div" size="xs" className="text-[#64748b] mt-1 !text-[11px] truncate">{meta.helper}</Text>
                            </div>
                          </div>

                          <div className="sm:w-[28%] flex items-center">
                            {meta.type === 'bool' ? (
                              <div className="flex items-center gap-2">
                                <Switch size="sm" colorScheme="success" isChecked={!!value} onChange={handleSwitchChange(meta.key)} aria-label={meta.label} />
                                <Text as="span" size="xs" weight="semibold" className={`${isBoolOk ? 'text-[#166534]' : 'text-[#64748b]'} !text-[12px]`}>{isBoolOk ? 'Compliant' : 'Not compliant'}</Text>
                              </div>
                            ) : (
                              <Select size="sm" value={String(isNA ? 'not_applicable' : value)} onChange={(e) => handleItemChange(meta.key, e.target.value)} className="min-w-[150px] max-w-[170px]">
                                <option value="true">Compliant</option>
                                <option value="false">Not compliant</option>
                                <option value="not_applicable">Not applicable</option>
                              </Select>
                            )}
                          </div>

                          <div className="sm:w-[18%] flex items-center">
                            {isNA ? (
                              <Badge variant="subtle" colorScheme="gray" size="sm" isPill className="font-semibold"><RemoveCircleOutlineIcon style={{ fontSize: 12 }} className="mr-1" /> N/A</Badge>
                            ) : isBoolOk ? (
                              <Badge variant="subtle" colorScheme="success" size="sm" isPill className="font-bold"><CheckCircleIcon style={{ fontSize: 12 }} className="mr-1" /> OK</Badge>
                            ) : (
                              <Badge variant="subtle" colorScheme="danger" size="sm" isPill className="font-bold"><WarningAmberOutlinedIcon style={{ fontSize: 12 }} className="mr-1" /> Action</Badge>
                            )}
                          </div>

                          <div className="sm:w-[12%] sm:text-right">
                            <Text as="span" size="xs" className="text-[#94a3b8] !text-[11px]">{isNA ? '—' : meta.type === 'bool' ? (isBoolOk ? '—' : 'Fix before final') : '—'}</Text>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>

                {criticalInvalid.length > 0 && (
                  <div className="mx-5 mb-4 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <Text as="div" size="xs" weight="bold" className="text-amber-900 !text-[12px]">Critical on final: hand_hygiene, aseptic_technique, sharps_handling (+ scrub-the-hub for CVC)</Text>
                    <ul className="mt-1 list-disc pl-4 text-[11px] text-amber-800">
                      {criticalInvalid.map((msg) => <li key={msg}>{msg}</li>)}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Bottom Split (Notes & Action Required) — uniform cards */}
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Card variant="outline" size="md" className="overflow-hidden flex flex-col">
                  <CardHeader className="px-5 pt-5 pb-3 bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Additional notes</Text>
                    <Text as="p" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Observations or action taken — sent as <code>notes</code></Text>
                  </CardHeader>
                  <CardBody className="p-5 flex-1 flex flex-col gap-3">
                    <FormControl>
                      <Textarea size="sm" resize="none" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Additional observations…" className="min-h-[84px] !text-[13px]" />
                      <div className="text-right text-[11px] font-medium text-[#94a3b8] mt-1">{additionalNotes.length} / 500</div>
                    </FormControl>
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Session notes (notes)</FormLabel>
                      <Textarea size="sm" resize="none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter notes for this submission…" className="min-h-[72px] !text-[13px]" maxLength={500} />
                      <div className="flex justify-between mt-1">
                        <Text as="span" size="xs" className="text-[#94a3b8] !text-[11px]">Maps to <code>notes</code> in API</Text>
                        <Text as="span" size="xs" className="text-[#94a3b8] !text-[11px]">{notes.length} / 500</Text>
                      </div>
                    </FormControl>
                  </CardBody>
                </Card>

                <Card variant="outline" size="md" className="overflow-hidden">
                  <CardHeader className="px-5 pt-5 pb-3 bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Action required</Text>
                    <Text as="p" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Based on checklist status</Text>
                  </CardHeader>
                  <CardBody className="p-5">
                    {criticalInvalid.length === 0 ? (
                      <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center gap-3">
                        <CheckCircleIcon style={{ color: '#16a34a' }} />
                        <div>
                          <Text as="div" size="sm" weight="bold" className="text-[#166534] !text-[13px]">No action required.</Text>
                          <Text as="div" size="xs" className="text-[#15803d] !text-[11px]">All critical items compliant — ready for final submit.</Text>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                        <WarningAmberOutlinedIcon style={{ color: '#d97706', marginTop: 2 }} />
                        <div>
                          <Text as="div" size="sm" weight="bold" className="text-amber-900 !text-[13px]">Action required before final.</Text>
                          <Text as="div" size="xs" className="text-amber-800 !text-[11px] mt-1">Fix critical items above. Final will be rejected if hand_hygiene / aseptic_technique / sharps_handling (or scrub for CVC) are not compliant.</Text>
                        </div>
                      </div>
                    )}
                    {submitError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">{submitError}</div>
                    )}
                  </CardBody>
                </Card>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Payload preview (dev helper, uniform card) */}
              <Card variant="outline" size="md" className="overflow-hidden hidden lg:block">
                <CardHeader className="px-5 pt-5 pb-3 bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] !text-[13px]">Payload preview</Text>
                  <Text as="p" size="xs" className="text-[#64748b] !text-[11px] mt-1">POST /api/dt/sessions/:id/infection-control</Text>
                </CardHeader>
                <CardBody className="p-0">
                  <pre className="text-[11px] leading-4 p-4 bg-[#0f172a] text-[#e2e8f0] overflow-auto max-h-[280px]">{JSON.stringify(buildPayload(), null, 2)}</pre>
                </CardBody>
              </Card>

              <Card variant="outline" size="md" className="overflow-hidden" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <CardBody className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon style={{ color: '#16a34a' }} />
                    <Text as="h3" size="sm" weight="bold" className="text-[#166534] !text-[13px]">Infection Control Alerts</Text>
                  </div>
                  <Text as="span" size="sm" weight="semibold" className="text-[#15803d] !text-[12px]">{criticalInvalid.length ? `${criticalInvalid.length} critical issue(s) to fix` : 'No infection control alerts.'}</Text>
                </CardBody>
              </Card>

              <Card variant="outline" size="md" className="overflow-hidden">
                <CardHeader className="px-5 pt-5 pb-3">
                  <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] !text-[13px]">Reference</Text>
                </CardHeader>
                <CardBody className="p-5 pt-0 flex flex-col gap-2.5">
                  {[
                    ['Hand Hygiene', items.hand_hygiene ? '100%' : '0%'],
                    ['PPE Compliance', items.ppe ? '100%' : '0%'],
                    ['Machine Disinfection', items.dialysis_machine_disinfected ? 'Compliant' : 'Pending'],
                    ['Scrub Hub (CVC)', accessType === 'CVC' ? (scrubHub === 'yes' ? 'Yes' : 'No') : 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-sm">
                      <Text as="span" size="xs" className="text-[#64748b] !text-[12px]">{k}</Text>
                      <Text as="span" size="xs" weight="semibold" className="text-[#0f172a] !text-[12px]">{v}</Text>
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
