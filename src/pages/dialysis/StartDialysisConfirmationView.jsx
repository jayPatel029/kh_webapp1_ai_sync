/**
 * StartDialysisConfirmationView — P2-12 Start Dialysis Confirmation
 *
 * Live 8-step readiness + attestation + server-verified PIN.
 *
 * @file src/pages/dialysis/StartDialysisConfirmationView.jsx
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import useStartDialysisConfirmation from '../../hooks/useStartDialysisConfirmation';
import { MISSING, resolveP2SessionId, liveValue, formatIst } from './p2Runtime';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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

const StartDialysisConfirmationView = ({
  patientId,
  sessionId: propSessionId,
  machineId: propMachineId,
  onBack,
  onNext,
  onNavigateStep,
}) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(
    () => resolveP2SessionId(propSessionId, location),
    [propSessionId, location]
  );

  const {
    patientRaw,
    checklist,
    checklistComplete,
    machineId,
    bed,
    locked,
    attemptsRemaining,
    attested,
    setAttested,
    pin,
    setPin,
    showPin,
    setShowPin,
    unlockReason,
    setUnlockReason,
    submitError,
    canSubmit,
    loading,
    saving,
    error,
    saveDraft,
    submitStart,
    submitUnlock,
  } = useStartDialysisConfirmation(patientId, effectiveSessionId, propMachineId);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
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

  const handleStartDialysis = async () => {
    const startedId = await submitStart();
    if (!startedId) return;
    try {
      localStorage.setItem('lastDialysisSessionId', String(startedId));
      sessionStorage.setItem('lastDialysisSessionId', String(startedId));
      if (patientId) {
        localStorage.setItem('lastDialysisPatientId', String(patientId));
        sessionStorage.setItem('lastDialysisPatientId', String(patientId));
      }
    } catch (_) {}
    if (onNext) {
      onNext(startedId);
      return;
    }
    navigate(`/dialysis/during/${startedId}/P3-01`, {
      state: { patientId, sessionId: startedId },
    });
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[90px]">
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-12 – Start Dialysis Confirmation</h1>
          </div>
          <p className="text-sm text-[#475569]">Final confirmation to start dialysis session.</p>
          {(machineId || bed?.code) ? (
            <p className="text-xs text-[#64748b] mt-1">
              Bed/Machine: {liveValue(bed?.code)} / {liveValue(machineId)}
            </p>
          ) : null}
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 9 ? 'active' : ''}
                  onClick={() => goToStep(step.code)}
                  aria-current={step.id === 9 ? 'step' : undefined}
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
              Loading start readiness for this session…
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium">
              {error}
            </div>
          ) : null}

          <div style={{ ...CARD_STYLE, marginBottom: '24px', marginTop: '24px' }}>
            <div className="p-6 pb-2 flex justify-between items-center">
              <div>
                <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Pre-Dialysis Checklist Summary</h3>
                <p className="text-sm text-[#475569]">All required checks must be completed before starting dialysis.</p>
              </div>
              {checklistComplete ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                  <CheckCircleIcon style={{ fontSize: '14px' }} /> All Clear
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fef3c7] border border-[#fde68a] text-[#b45309] rounded-full font-semibold text-xs">
                  <WarningAmberOutlinedIcon style={{ fontSize: '14px' }} /> Pending Checks
                </div>
              )}
            </div>

            <div className="w-full text-sm mt-4">
              <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                <div className="w-[30%]">Check Item</div>
                <div className="w-[15%]">Status</div>
                <div className="w-[30%]">Details</div>
                <div className="w-[15%]">Completed By</div>
                <div className="w-[10%]">Time</div>
              </div>

              <div className="flex flex-col">
                {!loading && checklist.length === 0 ? (
                  <div className="p-6 text-sm text-[#b45309] font-semibold">
                    No pre-dialysis readiness data for this session.
                  </div>
                ) : null}
                {checklist.map((row, idx) => (
                  <div
                    key={row.key || row.id}
                    className={`flex items-center px-6 py-3 ${idx !== checklist.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
                  >
                    <div className="w-[30%] font-semibold text-[#334155]">
                      <button
                        type="button"
                        className="text-left hover:text-[#2563eb]"
                        onClick={() => row.code && goToStep(row.code)}
                      >
                        {row.item}
                      </button>
                    </div>
                    <div className="w-[15%] flex items-center">
                      {row.status === 'Completed' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                          <CheckCircleIcon style={{ fontSize: '14px' }} /> Completed
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#fef3c7] border border-[#fde68a] text-[#b45309] rounded-full font-semibold text-xs">
                          <WarningAmberOutlinedIcon style={{ fontSize: '14px' }} /> {liveValue(row.status)}
                        </div>
                      )}
                    </div>
                    <div className="w-[30%] text-[#475569]">{liveValue(row.details)}</div>
                    <div className="w-[15%] text-[#475569]">{liveValue(row.completedBy)}</div>
                    <div className="w-[10%] text-[#475569]">
                      {row.completedAt ? formatIst(row.completedAt) : MISSING}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`grid gap-6 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div style={{ ...CARD_STYLE, padding: '24px', background: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="flex items-center gap-2 mb-3">
                <WarningAmberOutlinedIcon style={{ color: '#d97706' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#b45309' }}>Important Reminders</h3>
              </div>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-sm text-[#78350f]">
                <li>Ensure vascular access is secure and visible.</li>
                <li>Monitor patient closely during first 15 minutes.</li>
                <li>Verify UF goal and treatment time as prescribed.</li>
                <li>Report any discomfort or alarms immediately.</li>
              </ul>
            </div>

            <div style={{ ...CARD_STYLE, padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Confirm to Start Dialysis
              </h3>

              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={attested}
                  disabled={locked || !checklistComplete}
                  onChange={(e) => setAttested(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-[#334155] leading-relaxed">
                  I confirm that all pre-dialysis checks are complete and it is safe to start dialysis for this patient.
                </span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1">Your PIN</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    disabled={locked || !checklistComplete}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••"
                    className={`w-full border ${submitError ? 'border-red-500 bg-red-50' : 'border-[#e2e8f0] bg-white'} rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-blue-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <VisibilityOffIcon style={{ fontSize: '18px' }} /> : <VisibilityIcon style={{ fontSize: '18px' }} />}
                  </button>
                </div>

                {!locked && attemptsRemaining < 3 ? (
                  <p className="text-xs text-[#b45309] mt-1.5 font-medium">
                    Attempts remaining: {attemptsRemaining}
                  </p>
                ) : null}

                {submitError ? (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <WarningAmberOutlinedIcon style={{ fontSize: '14px' }} />
                    {submitError}
                  </p>
                ) : null}
              </div>

              {locked ? (
                <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50">
                  <p className="text-xs text-red-800 font-semibold mb-2">
                    Too many failed attempts. Ask a nurse or nephrologist to unlock.
                  </p>
                  <input
                    type="text"
                    value={unlockReason}
                    onChange={(e) => setUnlockReason(e.target.value)}
                    placeholder="Unlock reason (optional)"
                    className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm mb-2"
                  />
                  <Button
                    variant="outline"
                    isDisabled={saving}
                    onClick={() => submitUnlock()}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
                  >
                    Request Unlock
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748b] mb-4">
            <InfoOutlinedIcon style={{ fontSize: '16px', color: '#2563eb' }} />
            <span>Once started, you will be redirected to the During Dialysis session.</span>
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
              onClick={handleStartDialysis}
              isDisabled={!canSubmit || saving}
              isLoading={saving}
              style={{
                padding: '10px 32px',
                borderRadius: '8px',
                background: canSubmit ? '#2563eb' : '#94a3b8',
                color: '#fff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <PlayArrowIcon style={{ fontSize: '18px' }} /> Start Dialysis
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default StartDialysisConfirmationView;
