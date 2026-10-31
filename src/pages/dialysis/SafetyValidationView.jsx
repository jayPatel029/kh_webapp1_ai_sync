import { useNavigate, useLocation } from 'react-router-dom';
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';
import { validateSafetyChecklist, getPatientDetails, getPredialysisStatus } from '../../ApiCalls/preDialysisApis';
import { resolveP2SessionId, mapRollupSteps, liveValue } from './p2Runtime';
import { saveP2Draft } from './p2DraftCache';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

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

const SafetyValidationView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(
    () => resolveP2SessionId(propSessionId, location),
    [propSessionId, location],
  );
  const [notes, setNotes] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [validationSteps, setValidationSteps] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.patient || res.data?.data?.patient || res.data?.data || res.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, [patientId]);

  useEffect(() => {
    let mounted = true;
    if (!effectiveSessionId) {
      setLoadError('No dialysis session id. Close and drag the patient to a bed again.');
      setValidationSteps([]);
      return undefined;
    }
    getPredialysisStatus(effectiveSessionId).then((res) => {
      if (!mounted) return;
      if (!res?.success) {
        setLoadError(res?.message || 'Could not load pre-dialysis status.');
        setValidationSteps([]);
        return;
      }
      const mapped = mapRollupSteps(res.data).filter((step) => step.key !== 'step_start');
      setValidationSteps(mapped);
      setLoadError('');
    }).catch(() => {
      if (mounted) setLoadError('Could not load pre-dialysis status.');
    });
    return () => { mounted = false; };
  }, [effectiveSessionId]);

  const isValid = validationSteps.length > 0 && validationSteps.every((step) => step.status === 'Completed');
  const blockingIssues = isValid ? [] : (loadError ? [loadError] : ['Complete all previous pre-dialysis steps before validating.']);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-11 – Safety Validation</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Review all pre-dialysis checks before confirming readiness to start dialysis.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 8 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 8 ? 'step' : undefined}
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
              
              {/* Pre-Dialysis Validation Summary Card */}
              <div style={{ ...CARD_STYLE }}>
                <div className="p-6 pb-2 flex justify-between items-center">
                  <div>
                    <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Pre-Dialysis Validation Summary</h3>
                    <p className="text-sm text-[#475569]">All steps must show Completed before you can validate.</p>
                  </div>
                  {isValid ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                      All Clear
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fef3c7] border border-[#fde68a] text-[#b45309] rounded-full font-semibold text-xs">
                      Pending
                    </div>
                  )}
                </div>

                <div className="w-full text-sm mt-4">
                  {/* Table Header */}
                  <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                    <div className="w-[45%]">Step</div>
                    <div className="w-[20%]">Status</div>
                    <div className="w-[20%]">Completed By</div>
                    <div className="w-[15%]">Time</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col">
                    {validationSteps.length === 0 ? (
                      <div className="px-6 py-6 text-sm text-[#b45309] font-semibold">
                        {loadError || 'No pre-dialysis rollup found for this session.'}
                      </div>
                    ) : null}
                    {validationSteps.map((item, idx) => (
                      <div key={item.key || item.id} className={`flex items-center px-6 py-3.5 ${idx !== validationSteps.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                        <div className="w-[45%] flex items-center gap-3">
                          <span className="font-bold text-[#2563eb] text-sm w-4">{item.id}</span>
                          <span className="font-semibold text-[#334155]">{item.name}</span>
                        </div>
                        
                        <div className="w-[20%] flex items-center">
                          {item.status === 'Completed' ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                              <CheckCircleIcon style={{ fontSize: '14px' }} /> Completed
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#fef3c7] border border-[#fde68a] text-[#b45309] rounded-full font-semibold text-xs">
                              {item.status}
                            </div>
                          )}
                        </div>

                        <div className="w-[20%] text-[#475569]">{liveValue(item.completedBy)}</div>
                        <div className="w-[15%] text-[#475569]">{liveValue(item.time)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blocking Issues Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={SECTION_TITLE_STYLE}>Blocking Issues</h3>
                <p className="text-sm text-[#475569] mb-3">Automatically summarized from any unresolved step above.</p>
                {blockingIssues.length === 0 ? (
                  <p className="text-sm italic text-[#94a3b8]">No blocking issues — all 7 steps completed.</p>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-2">
                    {blockingIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-red-700 font-medium">
                        <WarningAmberOutlinedIcon style={{ fontSize: '16px', color: '#dc2626' }} />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isValid ? (
                <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center gap-3">
                  <CheckCircleIcon style={{ color: '#16a34a', fontSize: '20px' }} />
                  <span className="font-bold text-[#166534] text-sm">All pre-dialysis checks complete. Safe to proceed to Start Dialysis.</span>
                </div>
              ) : (
                <div className="p-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl flex items-center gap-3">
                  <WarningAmberOutlinedIcon style={{ color: '#d97706', fontSize: '20px' }} />
                  <span className="font-bold text-[#b45309] text-sm">Validation is blocked until every previous step is complete in the database.</span>
                </div>
              )}

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Pre-Dialysis Alerts Card */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fef2f2', borderColor: '#fecaca' }}>
                <div className="flex items-center gap-2 mb-3">
                  <WarningAmberOutlinedIcon style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>Pre-Dialysis Alerts</h3>
                </div>
                <p className="text-sm text-[#991b1b] font-semibold">No alert records loaded on this screen. Alerts only appear from the patient record.</p>
              </div>

              {/* Notes (Optional) Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Notes <span className="font-normal text-[#64748b] text-sm">(Optional)</span></h3>
                </div>
                <textarea 
                  className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                  placeholder="No notes added yet."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={async () => { await saveP2Draft(effectiveSessionId, 'P2-11', { notes }); }}
              style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
            >
              Save as Draft
            </Button>
            <Button 
              colorScheme="primary" 
              onClick={async () => {
                if (!effectiveSessionId) {
                  setSubmitError('No dialysis session id.');
                  return;
                }
                setIsSubmitting(true);
                setSubmitError('');
                const res = await validateSafetyChecklist(effectiveSessionId, { notes: notes || '' });
                setIsSubmitting(false);
                if (!res?.success) {
                  setSubmitError(res?.message || 'Safety validation failed.');
                  return;
                }
                if (onNext) onNext();
              }} 
              isDisabled={!isValid || isSubmitting}
              style={{ padding: '10px 32px', borderRadius: '8px', background: isValid ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 600 }}
            >
              Validate & Continue →
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default SafetyValidationView;
