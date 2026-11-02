/**
 * SafetyValidationView — P2-11 Safety Validation
 *
 * Live rollup of steps 1–7. Continue only when all prior steps are complete.
 *
 * @file src/pages/dialysis/SafetyValidationView.jsx
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import useSafetyValidation from '../../hooks/useSafetyValidation';
import { MISSING, resolveP2SessionId, liveValue, formatIst } from './p2Runtime';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

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
    [propSessionId, location]
  );

  const {
    patientRaw,
    alerts,
    steps,
    itemsSkipped,
    notes,
    setNotes,
    blockingIssues,
    canProceed,
    loading,
    saving,
    error,
    saveDraft,
    submitFinal,
  } = useSafetyValidation(patientId, effectiveSessionId);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-10' },
    });
  };

  const goNext = () => {
    if (onNext) {
      onNext();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-12' },
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

  const handleValidateContinue = async () => {
    if (!canProceed || saving) return;
    const ok = await submitFinal();
    if (ok) goNext();
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-11 – Safety Validation</h1>
          </div>
          <p className="text-sm text-[#475569]">Review all pre-dialysis checks before confirming readiness to start dialysis.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 8 ? 'active' : ''}
                  onClick={() => goToStep(step.code)}
                  aria-current={step.id === 8 ? 'step' : undefined}
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
              Loading safety validation for this session…
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium">
              {error}
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
              <div style={{ ...CARD_STYLE }}>
                <div className="p-6 pb-2 flex justify-between items-center">
                  <div>
                    <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Pre-Dialysis Validation Summary</h3>
                    <p className="text-sm text-[#475569]">All steps must show Completed before you can validate.</p>
                  </div>
                  {canProceed ? (
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
                  <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                    <div className="w-[45%]">Step</div>
                    <div className="w-[20%]">Status</div>
                    <div className="w-[20%]">Completed By</div>
                    <div className="w-[15%]">Time</div>
                  </div>

                  <div className="flex flex-col">
                    {!loading && steps.length === 0 ? (
                      <div className="px-6 py-6 text-sm text-[#b45309] font-semibold">
                        No pre-dialysis rollup found for this session.
                      </div>
                    ) : null}
                    {steps.map((item, idx) => (
                      <div
                        key={item.key || item.id}
                        className={`flex items-center px-6 py-3.5 ${idx !== steps.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
                      >
                        <div className="w-[45%] flex items-center gap-3">
                          <span className="font-bold text-[#2563eb] text-sm w-4">{item.id}</span>
                          <button
                            type="button"
                            className="font-semibold text-[#334155] text-left hover:text-[#2563eb]"
                            onClick={() => item.code && goToStep(item.code)}
                          >
                            {item.name}
                          </button>
                        </div>

                        <div className="w-[20%] flex items-center">
                          {item.status === 'Completed' ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                              <CheckCircleIcon style={{ fontSize: '14px' }} /> Completed
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#fef3c7] border border-[#fde68a] text-[#b45309] rounded-full font-semibold text-xs">
                              {liveValue(item.status)}
                            </div>
                          )}
                        </div>

                        <div className="w-[20%] text-[#475569]">{liveValue(item.completedBy)}</div>
                        <div className="w-[15%] text-[#475569]">
                          {item.completedAt ? formatIst(item.completedAt) : MISSING}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={SECTION_TITLE_STYLE}>Blocking Issues</h3>
                <p className="text-sm text-[#475569] mb-3">Automatically summarized from any unresolved step above.</p>
                {blockingIssues.length === 0 ? (
                  <p className="text-sm italic text-[#94a3b8]">No blocking issues — all 7 steps completed.</p>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-2">
                    {blockingIssues.map((issue) => (
                      <button
                        key={`${issue.key}-${issue.reason}`}
                        type="button"
                        className="flex items-center gap-2 text-sm text-red-700 font-medium text-left hover:underline"
                        onClick={() => issue.code && goToStep(issue.code)}
                      >
                        <WarningAmberOutlinedIcon style={{ fontSize: '16px', color: '#dc2626' }} />
                        <span>{issue.reason}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {itemsSkipped.length > 0 ? (
                <div style={{ ...CARD_STYLE, padding: '24px' }}>
                  <h3 style={SECTION_TITLE_STYLE}>Items Skipped This Session</h3>
                  <p className="text-sm text-[#475569] mb-3">Informational only — does not block Validate & Continue.</p>
                  <div className="w-full text-sm">
                    <div className="flex border-b border-[#e2e8f0] py-2 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                      <div className="w-[25%]">Screen</div>
                      <div className="w-[35%]">Field</div>
                      <div className="w-[40%]">Reason</div>
                    </div>
                    {itemsSkipped.map((row, idx) => (
                      <div key={`${row.screen}-${row.field}-${idx}`} className="flex py-2.5 border-b border-[#f1f5f9] last:border-0">
                        <div className="w-[25%] text-[#334155] font-medium">{liveValue(row.screen)}</div>
                        <div className="w-[35%] text-[#475569]">{liveValue(row.field)}</div>
                        <div className="w-[40%] text-[#64748b]">{liveValue(row.reason)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {canProceed ? (
                <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center gap-3">
                  <CheckCircleIcon style={{ color: '#16a34a', fontSize: '20px' }} />
                  <span className="font-bold text-[#166534] text-sm">All pre-dialysis checks complete. Safe to proceed to Start Dialysis.</span>
                </div>
              ) : (
                <div className="p-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl flex items-center gap-3">
                  <WarningAmberOutlinedIcon style={{ color: '#d97706', fontSize: '20px' }} />
                  <span className="font-bold text-[#b45309] text-sm">Validation is blocked until every previous step is complete for this session.</span>
                </div>
              )}
            </div>

            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ ...CARD_STYLE, padding: '24px', background: alerts.length ? '#fef2f2' : '#f8fafc', borderColor: alerts.length ? '#fecaca' : '#e2e8f0' }}>
                <div className="flex items-center gap-2 mb-3">
                  <WarningAmberOutlinedIcon style={{ color: alerts.length ? '#dc2626' : '#64748b' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: alerts.length ? '#991b1b' : '#0f172a' }}>Pre-Dialysis Alerts</h3>
                </div>
                {alerts.length === 0 ? (
                  <p className="text-sm text-[#64748b] font-medium">No active alerts for this patient.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {alerts.slice(0, 6).map((alert, idx) => (
                      <div key={alert.id || idx} className="text-sm text-[#991b1b] font-medium">
                        {liveValue(alert.message || alert.text || alert.title)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Notes <span className="font-normal text-[#64748b] text-sm">(Optional)</span></h3>
                </div>
                <textarea
                  className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                  placeholder="No notes added yet."
                  value={notes}
                  maxLength={200}
                  onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                />
                <div className="text-right text-[11px] text-[#94a3b8] mt-1">{notes.length} / 200</div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 flex justify-between items-center z-50">
          <Button variant="outline" onClick={handleBackClick} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
            ← Back
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              isDisabled={saving || !effectiveSessionId}
              onClick={() => saveDraft()}
              style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
            >
              Save as Draft
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleValidateContinue}
              isDisabled={!canProceed || saving}
              isLoading={saving}
              style={{ padding: '10px 32px', borderRadius: '8px', background: canProceed ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 600 }}
            >
              {saving ? 'Validating…' : 'Validate & Continue →'}
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default SafetyValidationView;
