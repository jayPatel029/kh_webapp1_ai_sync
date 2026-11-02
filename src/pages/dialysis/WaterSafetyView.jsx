/**
 * WaterSafetyView — P2-09 Water Safety
 *
 * Read-only review of this shift's RO water check + today's RO verification.
 *
 * @file src/pages/dialysis/WaterSafetyView.jsx
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import useWaterSafety, {
  formatPpm,
  performedByLabel,
} from '../../hooks/useWaterSafety';
import {
  isRoVerificationPassed,
  isShiftWaterPassed,
} from './waterSafetyValidation';
import { MISSING, resolveP2SessionId, liveValue, formatIst } from './p2Runtime';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const StatusPill = ({ ok, label }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '999px',
      background: ok ? '#dcfce7' : '#fff7ed',
      color: ok ? '#166534' : '#9a3412',
      fontSize: '12px',
      fontWeight: 700,
    }}
  >
    {ok ? <CheckCircleIcon style={{ fontSize: 14 }} /> : <WarningAmberOutlinedIcon style={{ fontSize: 14 }} />}
    {label}
  </span>
);

const WaterSafetyView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(
    () => resolveP2SessionId(propSessionId, location),
    [propSessionId, location]
  );

  const {
    patientRaw,
    roPlantId,
    plantSource,
    shiftId,
    machineId,
    bed,
    shiftCheck,
    verification,
    checkDate,
    loadedAt,
    canProceed,
    banner,
    loading,
    saving,
    error,
    refresh,
    saveDraft,
    submitFinal,
  } = useWaterSafety(patientId, effectiveSessionId);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-08' },
    });
  };

  const goNext = () => {
    if (onNext) {
      onNext();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-10' },
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

  const handleSaveContinue = async () => {
    if (!canProceed || saving) return;
    const saved = await submitFinal();
    if (saved) goNext();
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading Water Safety...
      </div>
    );
  }

  if (error && !patientRaw) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '15px' }}>{error}</p>
        <Button variant="outline" onClick={refresh}>Retry</Button>
      </div>
    );
  }

  const shiftOk = isShiftWaterPassed(shiftCheck);
  const verifyOk = isRoVerificationPassed(verification);
  const plantLabel = roPlantId
    ? `${roPlantId}${machineId ? ` — supplying ${liveValue(bed?.code)} / ${machineId}` : ''}`
    : MISSING;

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 6 ? 'active' : ''}
                  onClick={() => goToStep(step.code)}
                  aria-current={step.id === 6 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientRaw} isMobile={isMobile} />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ ...CARD_STYLE, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Water Safety</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      Confirm this shift’s RO water chemistry has been verified before proceeding.
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                    <div>Check date: <strong style={{ color: '#0f172a' }}>{checkDate || MISSING}</strong></div>
                    <div>Loaded: <strong style={{ color: '#0f172a' }}>{loadedAt || MISSING}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>RO Plant</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{plantLabel}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Shift</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{liveValue(shiftId)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Plant Source</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{liveValue(plantSource)}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
                <div style={{ ...CARD_STYLE, padding: '20px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaterDropOutlinedIcon style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>This Shift’s Water Check</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>P5-03a Shift Water Check</p>
                      </div>
                    </div>
                    <StatusPill ok={shiftOk} label={shiftCheck.status || 'Not Yet Performed'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Performed</span><span style={{ fontWeight: 600 }}>{formatIst(shiftCheck.performed_at)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>By</span><span style={{ fontWeight: 600 }}>{performedByLabel(shiftCheck)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Chlorine (Free)</span><span style={{ fontWeight: 600 }}>{formatPpm(shiftCheck.chlorine)} (≤0.1)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Chloramine</span><span style={{ fontWeight: 600 }}>{formatPpm(shiftCheck.chloramine)} (≤0.1)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Hardness</span><span style={{ fontWeight: 600 }}>{formatPpm(shiftCheck.hardness, 0)} (≤50)</span></div>
                  </div>
                </div>

                <div style={{ ...CARD_STYLE, padding: '20px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ScienceOutlinedIcon style={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Today’s RO Verification</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>P5-03b RO System Verification</p>
                      </div>
                    </div>
                    <StatusPill ok={verifyOk} label={verification.status || 'Not Yet Performed'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Performed</span><span style={{ fontWeight: 600 }}>{formatIst(verification.performed_at)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>By</span><span style={{ fontWeight: 600 }}>{performedByLabel(verification)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Summary</span><span style={{ fontWeight: 600 }}>{liveValue(verification.pass_count)}</span></div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...CARD_STYLE,
                  padding: '16px 18px',
                  background: banner.tone === 'ok' ? '#f0fdf4' : '#fef2f2',
                  borderColor: banner.tone === 'ok' ? '#bbf7d0' : '#fecaca',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                {banner.tone === 'ok' ? (
                  <CheckCircleIcon style={{ color: '#16a34a', marginTop: 2 }} />
                ) : (
                  <WarningAmberOutlinedIcon style={{ color: '#dc2626', marginTop: 2 }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, color: banner.tone === 'ok' ? '#166534' : '#991b1b', fontSize: '14px' }}>
                    {banner.title}
                  </div>
                  <div style={{ color: banner.tone === 'ok' ? '#15803d' : '#b91c1c', fontSize: '13px', marginTop: 4 }}>
                    {banner.message}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...CARD_STYLE, padding: '20px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Supply Context</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>RO Plant</span><span style={{ fontWeight: 600 }}>{liveValue(roPlantId)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Bed</span><span style={{ fontWeight: 600 }}>{liveValue(bed?.code)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Machine</span><span style={{ fontWeight: 600 }}>{liveValue(machineId)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Shift ID</span><span style={{ fontWeight: 600 }}>{liveValue(shiftId)}</span></div>
                </div>
              </div>

              <div style={{ ...CARD_STYLE, padding: '20px', background: '#fffbeb', borderColor: '#fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <WarningAmberOutlinedIcon style={{ color: '#b45309' }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#b45309' }}>Gate Status</h3>
                </div>
                <div style={{ fontSize: '13px', color: '#92400e' }}>
                  {canProceed
                    ? 'Both checks passed. Save & Continue is enabled.'
                    : 'Save & Continue stays blocked until this shift’s water check and today’s RO verification both pass.'}
                </div>
                {error ? <div style={{ marginTop: 10, fontSize: '12px', color: '#b45309' }}>{error}</div> : null}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '20px',
              marginTop: '32px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Button variant="outline" onClick={handleBackClick}>
              ← Back
            </Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={saveDraft} disabled={saving}>
                {saving ? 'Saving…' : 'Save as Draft'}
              </Button>
              <Button
                variant="brand"
                onClick={handleSaveContinue}
                disabled={!canProceed || saving}
                style={{
                  opacity: canProceed && !saving ? 1 : 0.5,
                  cursor: canProceed && !saving ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Saving…' : 'Save & Continue →'}
              </Button>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default WaterSafetyView;
