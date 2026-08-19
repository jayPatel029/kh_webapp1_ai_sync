import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Button } from '../../component-library';
import AutoCollapseTextarea from '../../components/AutoCollapseTextarea';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';
import { AVF_AVG_CONFIG, CVC_CONFIG, validateVascularAccess } from './vascularAccessValidation';
import { submitVascularAccess, getPatientDetails } from '../../ApiCalls/preDialysisApis';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HealingIcon from '@mui/icons-material/Healing';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import TimelineIcon from '@mui/icons-material/Timeline';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './duringDialysis.css';

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

const ICON_MAP = {
  signsOfInfection: ShieldOutlinedIcon,
  bleedingDischarge: BloodtypeIcon,
  thrillBruit: HealingIcon,
  accessFlow: SpeedIcon,
  accessSiteAppearance: VisibilityOutlinedIcon,
  cannulationZone: GpsFixedIcon,
  aneurysm: TimelineIcon,
  signsOfInfectionCVC: ShieldOutlinedIcon,
  catheterPatent: CheckCircleOutlineIcon,
  tendernessPain: WarningAmberIcon,
  dressingIntact: MedicalServicesOutlinedIcon,
  exitSiteClean: VisibilityOutlinedIcon,
};

const FIELD_API_KEYS = {
  thrillBruit: 'thrill_bruit',
  accessSiteAppearance: 'access_site_appearance',
  signsOfInfection: 'signs_of_infection',
  bleedingDischarge: 'bleeding_discharge',
  aneurysm: 'aneurysm',
  cannulationZone: 'cannulation_zone',
  accessFlow: 'access_flow_ml_min',
  dressingIntact: 'dressing_intact',
  tendernessPain: 'tenderness_pain',
  exitSiteClean: 'exit_site_clean',
  signsOfInfectionCVC: 'cvc_signs_of_infection',
  catheterPatent: 'catheter_patent',
};

const readFirstValue = (source, keys = []) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
};

const resolveAccessType = (patient = {}) => {
  const raw = String(readFirstValue(patient, ['access_type', 'vascular_access', 'accessType', 'vascularAccess'])).toLowerCase();
  if (raw.includes('cvc') || raw.includes('catheter')) return 'CVC';
  if (raw.includes('avg') || raw.includes('graft')) return 'AVG';
  if (raw.includes('avf') || raw.includes('fistula')) return 'AVF';
  return '';
};

const normalizeFieldValue = (fieldId, value) => {
  if (value === undefined || value === null || value === '') return value;
  const raw = String(value).toLowerCase();
  if (fieldId === 'cannulationZone') {
    if (raw === 'adequate' || raw === 'good') return 'Good';
    if (raw === 'limited') return 'Limited';
    if (raw === 'poor') return 'Poor';
  }
  const option = String(value).trim();
  const known = {
    yes: 'Yes',
    no: 'No',
    present: 'Present',
    weak: 'Weak',
    absent: 'Absent',
    normal: 'Normal',
    redness: 'Redness',
    swelling: 'Swelling',
    other: 'Other',
  }[raw];
  return known || option;
};

const getAssessmentSource = (patient = {}) => patient?.vascular_access_assessment || patient?.vascularAccessAssessment || patient;

const hydrateAssessment = (patient = {}) => {
  const source = getAssessmentSource(patient);
  return Object.entries(FIELD_API_KEYS).reduce((result, [fieldId, apiKey]) => {
    const value = source?.[apiKey];
    if (value !== undefined && value !== null && value !== '') {
      result[fieldId] = fieldId === 'accessFlow' ? String(value) : normalizeFieldValue(fieldId, value);
    }
    return result;
  }, {});
};

const resolveSessionId = (explicitSessionId, patient = {}) => explicitSessionId || readFirstValue(patient, [
  'session_id',
  'dialysis_session_id',
  'active_session_id',
  'current_session_id',
  'sessionId',
  'dialysisSessionId',
]);

const formatAssessmentTime = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const VascularAccessAssessmentView = ({ patientId, sessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(() => {
    try {
      const fromProp = sessionId;
      if (fromProp) return fromProp;
      const fromState = location.state?.sessionId || location.state?.session_id;
      if (fromState) return fromState;
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return patientId || 1;
  }, [sessionId, location.state, patientId]);
  const [accessType, setAccessType] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentTime, setAssessmentTime] = useState(() => new Date());
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return undefined;
    }
    let mounted = true;
    setLoading(true);
    setLoadError('');
    getPatientDetails(patientId)
      .then((res) => {
        if (!mounted) return;
        if (!res?.success) {
          setLoadError(res?.message || 'Unable to load patient details.');
          return;
        }
        const data = res.data?.data || res.data || {};
        const derivedAccessType = resolveAccessType(data);
        const source = getAssessmentSource(data);
        setPatientData(data);
        setAccessType(derivedAccessType);
        setFormData(hydrateAssessment(data));
        setDetailsData(source?.details || {});
        setAdditionalObservations(source?.additional_observations || '');
        setAssessmentTime(source?.recorded_at || source?.assessed_at || new Date());
      })
      .catch((error) => {
        if (mounted) setLoadError(error?.message || 'Unable to load patient details.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [patientId]);
  const [formData, setFormData] = useState({});
  const [detailsData, setDetailsData] = useState({});
  const [additionalObservations, setAdditionalObservations] = useState('');

  // Auto-calculation and Validation
  const currentConfig = useMemo(() => {
    if (accessType === 'AVF' || accessType === 'AVG') return AVF_AVG_CONFIG;
    if (accessType === 'CVC') return CVC_CONFIG;
    return [];
  }, [accessType]);

  const { isCriticalFailed, criticalErrors, validationErrors } = useMemo(() => {
    return validateVascularAccess(accessType, currentConfig, formData);
  }, [accessType, currentConfig, formData]);

  const isFormValid = !isCriticalFailed && validationErrors.length === 0;

  const handleFieldChange = (id, val) => {
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleDetailsChange = (id, val) => {
    setDetailsData(prev => ({ ...prev, [id]: val }));
  };

  const navigateToStep = (stepCode) => {
    if (stepCode === 'P2-07') return;
    if (onNavigateStep) {
      onNavigateStep(stepCode);
    } else if (stepCode === 'P2-06' && onBack) {
      onBack();
    } else if (stepCode === 'P2-08' && onNext) {
      onNext();
    }
  };

  const buildSubmissionPayload = () => {
    const payload = {
      status: 'final',
      access_type: accessType,
      additional_observations: additionalObservations,
      skips: [],
    };

    if (accessType === 'CVC') {
      payload.dressing_intact = String(formData.dressingIntact || '').toLowerCase();
      payload.tenderness_pain = String(formData.tendernessPain || '').toLowerCase();
      payload.exit_site_clean = String(formData.exitSiteClean || '').toLowerCase();
      payload.cvc_signs_of_infection = String(formData.signsOfInfectionCVC || '').toLowerCase();
      payload.catheter_patent = String(formData.catheterPatent || '').toLowerCase();
    } else {
      payload.thrill_bruit = String(formData.thrillBruit || '').toLowerCase();
      payload.access_site_appearance = String(formData.accessSiteAppearance || '').toLowerCase();
      payload.signs_of_infection = String(formData.signsOfInfection || '').toLowerCase();
      payload.bleeding_discharge = String(formData.bleedingDischarge || '').toLowerCase();
      payload.aneurysm = String(formData.aneurysm || '').toLowerCase();
      payload.cannulation_zone = formData.cannulationZone === 'Good'
        ? 'adequate'
        : String(formData.cannulationZone || '').toLowerCase();
      payload.access_flow_ml_min = formData.accessFlow === '' || formData.accessFlow === undefined
        ? null
        : Number(formData.accessFlow);
    }

    return payload;
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header section similar to image (P2-07-3) */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-07 – Vascular Access Assessment</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Assess vascular access site for patency and safety before cannulation.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 4 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 4 ? 'step' : undefined}
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
              
              {/* Access Type Selection */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-start mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Access Type</h3>
                  <div className="flex items-center gap-2 text-sm text-[#475569]">
                    <span>Assessment Time</span>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-1 rounded-md bg-[#f8fafc]">
                      <span>26 May 2025, 06:52 AM</span>
                      <CalendarTodayIcon style={{ fontSize: '16px', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  {['AV Fistula (AVF)', 'AV Graft (AVG)', 'Central Venous Catheter (CVC)'].map(type => {
                    const typeKey = type.includes('AVF') ? 'AVF' : type.includes('AVG') ? 'AVG' : 'CVC';
                    const isSelected = accessType === typeKey;
                    return (
                      <label key={type} className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-[#e2e8f0] hover:bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="accessType" 
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          checked={isSelected}
                          onChange={() => {
                            setAccessType(typeKey);
                            setFormData({});
                            setDetailsData({});
                          }}
                        />
                        <span className={`text-sm ${isSelected ? 'font-semibold text-blue-700' : 'text-[#334155]'}`}>{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Access Assessment */}
              {accessType && (
                <div style={{ ...CARD_STYLE }}>
                  <div style={{ padding: '24px 24px 16px' }}>
                    <h3 style={{ ...SECTION_TITLE_STYLE, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <HealingIcon style={{ fontSize: '20px', color: '#2563eb' }} />
                      Access Assessment
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      Examine access site and function.
                    </p>
                  </div>
                  
                  {criticalErrors.length > 0 && (
                    <div style={{ margin: '0 24px 16px', padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
                      <p style={{ color: '#b91c1c', fontWeight: 700, fontSize: '13px', margin: '0 0 8px' }}>Action Required / Escalation</p>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b', fontSize: '12px' }}>
                        {criticalErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '14px', padding: '0 24px 24px' }}>
                    {currentConfig.map((field) => {
                      const Icon = ICON_MAP[field.id] || InfoOutlinedIcon;
                      return (
                        <div key={field.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '9999px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon style={{ fontSize: '17px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                              {field.label}{field.critical ? '*' : ''}
                            </span>
                            <InfoOutlinedIcon style={{ fontSize: '14px', color: '#94a3b8' }} />
                          </div>

                          {field.type === 'radio' && (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {field.options.map((opt) => {
                                const isSelected = formData[field.id] === opt;
                                return (
                                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input
                                      type="radio"
                                      name={field.id}
                                      value={opt}
                                      checked={isSelected}
                                      onChange={() => handleFieldChange(field.id, opt)}
                                      style={{ accentColor: '#2563eb' }}
                                    />
                                    <span style={{ color: isSelected ? '#0f172a' : '#475569', fontWeight: isSelected ? 700 : 400 }}>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {field.type === 'number' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <input
                                type="number"
                                value={formData[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', width: '96px', fontSize: '13px' }}
                              />
                              <span style={{ color: '#64748b', fontSize: '12px' }}>mL/min</span>
                              {field.id === 'accessFlow' && formData[field.id] && (
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: Number(formData[field.id]) >= 500 ? '#dcfce7' : '#fee2e2', color: Number(formData[field.id]) >= 500 ? '#166534' : '#991b1b' }}>
                                  {Number(formData[field.id]) >= 500 ? 'Adequate (≥ 500 mL/min)' : 'Low (< 500 mL/min)'}
                                </span>
                              )}
                            </div>
                          )}

                          <AutoCollapseTextarea
                            aria-label={`${field.label} details`}
                            autoFocus={field.id === currentConfig[0]?.id}
                            maxLength={300}
                            value={detailsData[field.id] || ''}
                            onChange={(e) => handleDetailsChange(field.id, e.target.value)}
                            placeholder={field.type === 'number' ? 'Add notes...' : 'Describe if abnormal...'}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom split: Additional Observations & Action Required */}
              <div className="flex gap-6 w-full">
                <div style={{ ...CARD_STYLE, padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Additional Observations</h4>
                  <p className="text-sm text-[#475569] mb-4">Any additional notes or concerns.</p>
                  <textarea 
                    className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none flex-1"
                    rows={3} 
                    value={additionalObservations}
                    onChange={(e) => setAdditionalObservations(e.target.value)}
                  />
                  <div className="text-right mt-1 text-xs text-[#94a3b8]">{additionalObservations.length} / 300</div>
                </div>

                <div style={{ ...CARD_STYLE, padding: '24px', flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Action Required</h4>
                  <p className="text-sm text-[#475569] mb-4">Based on assessment findings.</p>
                  {isFormValid ? (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 flex items-start gap-3">
                      <CheckCircleIcon style={{ color: '#16a34a', marginTop: '2px' }} />
                      <div>
                        <p className="font-bold text-[#166534] text-sm">Access suitable for use.</p>
                        <p className="text-[#15803d] text-sm mt-1">Proceed to next step.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <WarningAmberIcon style={{ color: '#dc2626', marginTop: '2px' }} />
                      <div>
                        <p className="font-bold text-red-700 text-sm">Assessment Incomplete/Failed</p>
                        <p className="text-red-600 text-sm mt-1">Please review the critical fields.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Access Details Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded">
                      <TimelineIcon style={{ fontSize: '18px', color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Access Details</h3>
                  </div>
                  <a href="#" className="text-blue-600 text-sm font-semibold">Edit</a>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#64748b]">Access Type</span><span className="font-semibold text-[#0f172a]">AV Fistula (Left)</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Location</span><span className="font-semibold text-[#0f172a]">Left Forearm</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Date Created</span><span className="font-semibold text-[#0f172a]">15 Mar 2022</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Surgeon / Center</span><span className="font-semibold text-[#0f172a]">City Vascular Center</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Reviewed</span><span className="font-semibold text-[#0f172a]">12 May 2025</span></div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View Access History →</a>
                </div>
              </div>

              {/* Pre-Dialysis Alerts */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fef2f2', borderColor: '#fecaca' }}>
                <div className="flex items-center gap-2 mb-4">
                  <WarningAmberIcon style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>Pre-Dialysis Alerts</h3>
                </div>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-sm text-[#991b1b] font-semibold">
                  <li>High Potassium (5.2 mEq/L)</li>
                  <li>Low Hemoglobin (9.6 g/dL)</li>
                </ul>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View All Alerts →</a>
                </div>
              </div>

              {/* Quick Reference */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fffbeb', borderColor: '#fde68a' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', mb: '16px' }}>Quick Reference</h3>
                <div className="flex flex-col gap-3 text-sm mt-4">
                  <div className="flex justify-between"><span className="text-[#64748b]">Access Flow Goal</span><span className="font-semibold text-[#0f172a]">≥ 500 mL/min</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Minimum Blood Flow (BFR)</span><span className="font-semibold text-[#0f172a]">250–300 mL/min</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Recirculation Target</span><span className="font-semibold text-[#0f172a]">&lt; 10 %</span></div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View KDOQI Guidelines →</a>
                </div>
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
                  await submitVascularAccess(effectiveSessionId, {
                    status: 'final',
                    access_type: accessType,
                    thrill_bruit: String(formData.thrillBruit || '').toLowerCase(),
                    access_site_appearance: String(formData.accessSiteAppearance || '').toLowerCase(),
                    signs_of_infection: String(formData.signsOfInfection || '').toLowerCase(),
                    bleeding_discharge: String(formData.bleedingDischarge || '').toLowerCase(),
                    aneurysm: String(formData.aneurysm || '').toLowerCase(),
                    cannulation_zone: String(formData.cannulationZone || '').toLowerCase(),
                    access_flow_ml_min: parseFloat(formData.accessFlow) || 600,
                    additional_observations: additionalObservations || '',
                    skips: [],
                  });
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

export default VascularAccessAssessmentView;
