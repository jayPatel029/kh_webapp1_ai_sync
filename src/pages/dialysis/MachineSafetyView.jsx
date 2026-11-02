/**
 * MachineSafetyView — P2-08 Machine Safety
 *
 * Read-only review of today's QC + Self-Test for this session's machine.
 *
 * @file src/pages/dialysis/MachineSafetyView.jsx
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SettingsPowerOutlinedIcon from '@mui/icons-material/SettingsPowerOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import useMachineSafety, {
  formatCheckStatus,
  performedByLabel,
} from '../../hooks/useMachineSafety';
import { isMachineCheckPassed } from './machineSafetyValidation';
import { MISSING, resolveP2SessionId, liveValue, formatIst } from './p2Runtime';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const StatusPill = ({ status }) => {
  const passed = isMachineCheckPassed(status);
  const failed = String(status || '').toLowerCase() === 'failed';
  const label = formatCheckStatus(status);
  if (passed) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 700 }}>
        <CheckCircleIcon style={{ fontSize: 14 }} /> {label}
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: failed ? '#fee2e2' : '#fff7ed', color: failed ? '#991b1b' : '#9a3412', fontSize: '12px', fontWeight: 700 }}>
      <WarningAmberOutlinedIcon style={{ fontSize: 14 }} /> {label}
    </span>
  );
};

const CheckCard = ({ title, subtitle, icon: Icon, check }) => (
  <div style={{ ...CARD_STYLE, padding: '20px', flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ fontSize: 18 }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{subtitle}</p>
        </div>
      </div>
      <StatusPill status={check?.status} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ color: '#64748b' }}>Performed</span>
        <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{formatIst(check?.performed_at)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ color: '#64748b' }}>By</span>
        <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{performedByLabel(check)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ color: '#64748b' }}>Summary</span>
        <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{liveValue(check?.summary)}</span>
      </div>
    </div>
  </div>
);

const MachineSafetyView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(
    () => resolveP2SessionId(propSessionId, location),
    [propSessionId, location]
  );

  const {
    patientRaw,
    machineId,
    machine,
    qc,
    selfTest,
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
  } = useMachineSafety(patientId, effectiveSessionId);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-07' },
    });
  };

  const goNext = () => {
    if (onNext) {
      onNext();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-09' },
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
        Loading Machine Safety...
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

  const machineLabel = machineId
    ? `${liveValue(machine?.bed_code)}${machineId ? ` / ${machineId}` : ''}`
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
                  className={step.id === 5 ? 'active' : ''}
                  onClick={() => goToStep(step.code)}
                  aria-current={step.id === 5 ? 'step' : undefined}
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
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Machine Safety</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      Confirm today’s machine safety checks are complete before proceeding.
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                    <div>Check date: <strong style={{ color: '#0f172a' }}>{checkDate || MISSING}</strong></div>
                    <div>Loaded: <strong style={{ color: '#0f172a' }}>{loadedAt || MISSING}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Machine</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{machineLabel}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Model</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{liveValue(machine?.model)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Make</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{liveValue(machine?.make)}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
                <CheckCard
                  title="Today’s Quality Control"
                  subtitle="P5-02 Daily Machine QC"
                  icon={ScienceOutlinedIcon}
                  check={qc}
                />
                <CheckCard
                  title="Today’s Self-Test"
                  subtitle="P5-04 Machine Self-Test"
                  icon={SettingsPowerOutlinedIcon}
                  check={selfTest}
                />
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
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Machine Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Machine ID</span><span style={{ fontWeight: 600 }}>{liveValue(machineId)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Bed</span><span style={{ fontWeight: 600 }}>{liveValue(machine?.bed_code)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Make</span><span style={{ fontWeight: 600 }}>{liveValue(machine?.make)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Model</span><span style={{ fontWeight: 600 }}>{liveValue(machine?.model)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Install Date</span><span style={{ fontWeight: 600 }}>{liveValue(machine?.install_date)}</span></div>
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
                    : 'Save & Continue stays blocked until today’s QC and Self-Test both show Passed for the linked machine.'}
                </div>
                {error ? (
                  <div style={{ marginTop: 10, fontSize: '12px', color: '#b45309' }}>{error}</div>
                ) : null}
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

export default MachineSafetyView;
