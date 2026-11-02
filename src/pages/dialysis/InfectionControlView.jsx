/**
 * InfectionControlView — P2-10 Infection Control
 *
 * Session-scoped checklist. Empty until entered. Access type from P2-07.
 *
 * @file src/pages/dialysis/InfectionControlView.jsx
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
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
import useInfectionControl from '../../hooks/useInfectionControl';
import { MISSING, resolveP2SessionId, formatIst, liveValue } from './p2Runtime';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';

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

const CHECKLIST_META = [
  { key: 'hand_hygiene', label: 'Hand Hygiene', icon: CleanHandsOutlinedIcon, type: 'bool', critical: true, helper: 'Performed before patient contact' },
  { key: 'ppe', label: 'Personal Protective Equipment (PPE)', icon: ShieldOutlinedIcon, type: 'bool', critical: false, helper: 'Gloves, mask as required' },
  { key: 'work_area_clean', label: 'Work Area Clean & Disinfected', icon: CleaningServicesOutlinedIcon, type: 'bool', critical: false, helper: 'Chair, bed, trolley, monitor surfaces' },
  { key: 'dialysis_machine_disinfected', label: 'Dialysis Machine Disinfected (Post Check)', icon: LocalHospitalOutlinedIcon, type: 'bool', critical: false, helper: 'External surfaces disinfected' },
  { key: 'ro_system_disinfection', label: 'RO System Disinfection', icon: WaterDropOutlinedIcon, type: 'tri', critical: false, helper: 'If applicable to this session' },
  { key: 'dialyzer_reuse', label: 'Dialyzer Reuse (If applicable)', icon: RepeatOutlinedIcon, type: 'tri', critical: false, helper: 'Single-use or reprocessed per policy' },
  { key: 'aseptic_technique', label: 'Aseptic Technique for Access', icon: HealingOutlinedIcon, type: 'bool', critical: true, helper: 'Aseptic non-touch technique' },
  { key: 'scrub_the_hub', label: 'Scrub-the-Hub / CVC Hub Disinfection', icon: ShieldOutlinedIcon, type: 'scrub', critical: true, helper: 'Hub scrubbed with antiseptic before connection', cvcOnly: true },
  { key: 'sharps_handling', label: 'Sharps Handling', icon: ShieldOutlinedIcon, type: 'bool', critical: true, helper: 'Safety container disposal' },
  { key: 'biomedical_waste', label: 'Bio-medical Waste Disposal', icon: DeleteOutlineIcon, type: 'bool', critical: false, helper: 'Bags sealed and labeled' },
  { key: 'isolation_precautions', label: 'Isolation Precautions (If applicable)', icon: ShieldOutlinedIcon, type: 'tri', critical: false, helper: 'No isolation if not required' },
];

const ACCESS_LABELS = {
  AVF: 'AVF (Arteriovenous Fistula)',
  AVG: 'AVG (Arteriovenous Graft)',
  CVC: 'CVC (Central Venous Catheter)',
};

const InfectionControlView = ({ patientId, sessionId: sessionIdProp, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(
    () => resolveP2SessionId(sessionIdProp, location),
    [sessionIdProp, location]
  );

  const {
    patientRaw,
    accessType,
    items,
    scrubHub,
    notes,
    recordedAt,
    recordedByName,
    criticalInvalid,
    canProceed,
    compliancePct,
    loading,
    saving,
    error,
    setItem,
    setScrubHub,
    setNotes,
    saveDraft,
    submitFinal,
  } = useInfectionControl(patientId, effectiveSessionId);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-09' },
    });
  };

  const goNext = () => {
    if (onNext) {
      onNext();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-11' },
    });
  };

  const goToStep = (step) => {
    if (onNavigateStep) {
      onNavigateStep(step);
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step },
    });
  };

  const handleItemChange = (key, rawValue) => {
    let value = rawValue;
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    setItem(key, value);
  };

  const handleSaveContinue = async () => {
    if (!canProceed || saving) return;
    const saved = await submitFinal();
    if (saved) goNext();
  };

  const visibleChecklist = CHECKLIST_META.filter((meta) => !meta.cvcOnly || accessType === 'CVC');

  const statusLabel = (value) => {
    if (value === null || value === undefined || value === '') return 'Unset';
    if (value === 'not_applicable') return 'N/A';
    if (value === true) return 'Compliant';
    if (value === false) return 'Action';
    return String(value);
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-10 – Infection Control</h1>
          </div>
          <p className="text-sm text-[#475569]">Ensure infection prevention measures are followed before starting dialysis.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 7 ? 'active' : ''}
                  onClick={() => goToStep(step.code)}
                  aria-current={step.id === 7 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientRaw} isMobile={isMobile} />

          {loading ? (
            <div className="mt-6 p-6 rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
              Loading infection control for this session…
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium">
              {error}
            </div>
          ) : null}

          {!loading && !accessType ? (
            <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
              No vascular access type on this session. Complete P2-07 Vascular Access first.
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
              marginTop: '24px',
            }}
          >
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563eb] shadow-sm">
                        <ShieldOutlinedIcon style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[14px]">Infection Control Overview</Text>
                        <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Access type comes from P2-07 for this session</Text>
                      </div>
                    </div>
                    <Badge variant="subtle" colorScheme={compliancePct === 100 ? 'success' : 'warning'} size="md" isPill className="font-bold">
                      {compliancePct}% Protocol Compliance
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Vascular Access Type</FormLabel>
                      <div className="h-9 flex items-center px-3 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-800 font-semibold">
                        {ACCESS_LABELS[accessType] || MISSING}
                      </div>
                    </FormControl>
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Check Time</FormLabel>
                      <div className="h-9 flex items-center px-3 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium">
                        {recordedAt ? formatIst(recordedAt) : MISSING}
                      </div>
                    </FormControl>
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Check Performed By</FormLabel>
                      <div className="h-9 flex items-center px-3 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium">
                        {recordedByName || MISSING}
                      </div>
                    </FormControl>
                  </div>

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

              <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <CleanHandsOutlinedIcon style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[14px]">Infection Control Checklist</Text>
                        <Text as="p" size="xs" className="text-[#64748b] mt-1 font-medium !text-[11px]">Mark each item for this session — critical items must be compliant</Text>
                      </div>
                    </div>
                    {canProceed ? (
                      <Badge variant="subtle" colorScheme="success" size="md" isPill className="shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3">
                        <CheckCircleIcon style={{ fontSize: 13 }} className="mr-1.5 text-emerald-600" /> Ready to Submit
                      </Badge>
                    ) : (
                      <Badge variant="subtle" colorScheme="danger" size="md" isPill className="shrink-0 bg-red-50 border border-red-200 text-red-700 px-3">
                        <WarningAmberOutlinedIcon style={{ fontSize: 13 }} className="mr-1.5 text-red-600" /> {Math.max(criticalInvalid.length, 1)} Required
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="p-4 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {visibleChecklist.map((meta) => {
                      const Icon = meta.icon;
                      const value = meta.type === 'scrub' ? scrubHub : items[meta.key];
                      const isNA = value === 'not_applicable';
                      const isBoolOk = meta.type === 'scrub' ? scrubHub === 'yes' : value === true;
                      const isUnset = value === null || value === undefined || value === '';
                      return (
                        <div
                          key={meta.key}
                          className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                            isUnset
                              ? 'border-slate-200'
                              : isNA
                                ? 'border-slate-200'
                                : isBoolOk
                                  ? 'border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20'
                                  : 'border-red-200 bg-gradient-to-b from-white to-red-50/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                                isUnset || isNA
                                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                                  : isBoolOk
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                    : 'bg-red-50 border-red-200 text-red-600'
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

                          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {meta.type === 'scrub' ? (
                                <div className="inline-flex p-0.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => setScrubHub('yes')}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      scrubHub === 'yes'
                                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ✓ Performed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setScrubHub('no')}
                                    className={`px-2.5 py-1 rounded-md transition-all ${
                                      scrubHub === 'no'
                                        ? 'bg-red-600 text-white shadow-sm font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    ✗ Not Performed
                                  </button>
                                </div>
                              ) : meta.type === 'bool' ? (
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
                              {isUnset ? (
                                <Badge variant="subtle" colorScheme="gray" size="sm" isPill className="font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  Unset
                                </Badge>
                              ) : isNA ? (
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
                      Required Items Unresolved
                    </div>
                    <ul className="list-disc pl-5 text-[11px] text-red-800 space-y-0.5">
                      {criticalInvalid.map((msg) => <li key={msg}>{msg}</li>)}
                    </ul>
                  </div>
                )}
              </Card>

              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Card variant="outline" size="md" className="overflow-hidden flex flex-col shadow-sm">
                  <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                    <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Additional Notes</Text>
                    <Text as="p" size="xs" className="text-[#64748b] mt-1 !text-[11px]">Optional notes for this session (max 200)</Text>
                  </CardHeader>
                  <CardBody className="p-5 flex-1 flex flex-col gap-3">
                    <FormControl>
                      <FormLabel className="!text-[11px] font-semibold tracking-wide uppercase text-[#64748b] !mb-1.5">Session Notes</FormLabel>
                      <Textarea
                        size="sm"
                        resize="none"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                        placeholder="All infection control practices followed as per protocol."
                        className="min-h-[110px] !text-[13px]"
                        maxLength={200}
                      />
                      <div className="text-right text-[11px] font-medium text-[#94a3b8] mt-1">{notes.length} / 200</div>
                    </FormControl>
                  </CardBody>
                </Card>

                <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                  <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-[#f1f5f9]">
                    <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] leading-none !text-[13px]">Action Status & Requirements</Text>
                    <Text as="p" size="xs" className="text-[#64748b] mt-1 !text-[11px]">System validation check</Text>
                  </CardHeader>
                  <CardBody className="p-5">
                    {canProceed ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <CheckCircleIcon style={{ color: '#16a34a', fontSize: 24 }} />
                        <div>
                          <Text as="div" size="sm" weight="bold" className="text-emerald-900 !text-[13px]">No action required</Text>
                          <Text as="div" size="xs" className="text-emerald-700 !text-[11px] mt-0.5">All infection control measures are compliant for this session.</Text>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                        <WarningAmberOutlinedIcon style={{ color: '#d97706', fontSize: 24, marginTop: 2 }} />
                        <div>
                          <Text as="div" size="sm" weight="bold" className="text-amber-900 !text-[13px]">Action required before continuing</Text>
                          <Text as="div" size="xs" className="text-amber-800 !text-[11px] mt-0.5">
                            Resolve every checklist item. Critical items (Hand Hygiene, Aseptic Technique, Sharps, and Scrub-the-hub for CVC) must be compliant.
                          </Text>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </div>

            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card variant="outline" size="md" className="overflow-hidden shadow-sm" style={{ background: canProceed ? '#f0fdf4' : '#fffbe6', borderColor: canProceed ? '#bbf7d0' : '#ffe58f' }}>
                <CardBody className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {canProceed ? (
                      <CheckCircleIcon style={{ color: '#16a34a' }} />
                    ) : (
                      <WarningAmberOutlinedIcon style={{ color: '#d97706' }} />
                    )}
                    <Text as="h3" size="sm" weight="bold" className={canProceed ? 'text-emerald-900 !text-[13px]' : 'text-amber-900 !text-[13px]'}>
                      Infection Control Alert Status
                    </Text>
                  </div>
                  <Text as="span" size="sm" weight="semibold" className={canProceed ? 'text-emerald-700 !text-[12px]' : 'text-amber-800 !text-[12px]'}>
                    {canProceed
                      ? 'No active infection control alerts.'
                      : criticalInvalid.length
                        ? `${criticalInvalid.length} critical requirement(s) pending`
                        : 'Complete every checklist item for this session.'}
                  </Text>
                </CardBody>
              </Card>

              <Card variant="outline" size="md" className="overflow-hidden shadow-sm">
                <CardHeader className="px-5 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <Text as="h3" size="sm" weight="bold" className="text-[#0f172a] !text-[13px]">Infection Prevention Summary</Text>
                </CardHeader>
                <CardBody className="p-5 flex flex-col gap-3">
                  {[
                    ['Hand Hygiene Protocol', statusLabel(items.hand_hygiene)],
                    ['PPE Compliance', statusLabel(items.ppe)],
                    ['Aseptic Technique', statusLabel(items.aseptic_technique)],
                    ['Sharps Handling', statusLabel(items.sharps_handling)],
                    ['Dialysis Machine Surface', statusLabel(items.dialysis_machine_disinfected)],
                    ['Scrub-the-Hub (CVC)', accessType === 'CVC' ? statusLabel(scrubHub === 'yes' ? true : scrubHub === 'no' ? false : scrubHub) : 'N/A'],
                    ['Access Type', liveValue(accessType)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-xs py-1 border-b border-slate-50 last:border-0">
                      <Text as="span" size="xs" className="text-slate-600 !text-[12px] font-medium">{k}</Text>
                      <Text as="span" size="xs" weight="semibold" className={
                        v === 'Compliant' || v === 'N/A'
                          ? 'text-emerald-700 !text-[12px] font-bold'
                          : v === 'Action' || v === 'Unset'
                            ? 'text-red-600 !text-[12px] font-bold'
                            : 'text-slate-700 !text-[12px]'
                      }
                      >
                        {v}
                      </Text>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 flex justify-between items-center z-50">
          <Button variant="outline" onClick={handleBackClick} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
            ← Back
          </Button>
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              isDisabled={saving || !effectiveSessionId}
              onClick={() => saveDraft()}
              style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
            >
              Save as Draft
            </Button>
            <Button
              variant="solid"
              isLoading={saving}
              isDisabled={!canProceed || saving}
              onClick={handleSaveContinue}
              style={{ padding: '10px 32px', borderRadius: '8px', background: canProceed ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 600 }}
            >
              {saving ? 'Submitting…' : 'Save & Continue →'}
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default InfectionControlView;
