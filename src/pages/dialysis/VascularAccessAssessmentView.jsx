/**
 * VascularAccessAssessmentView — P2-07 Vascular Access Assessment
 *
 * @file src/pages/dialysis/VascularAccessAssessmentView.jsx
 */

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button } from '../../component-library';
import AutoCollapseTextarea from '../../components/AutoCollapseTextarea';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import useVascularAccessAssessment from '../../hooks/useVascularAccessAssessment';
import { MISSING, resolveP2SessionId } from './p2Runtime';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';

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

const ACCESS_TYPE_OPTIONS = [
  { key: 'AVF', label: 'AV Fistula (AVF)' },
  { key: 'AVG', label: 'AV Graft (AVG)' },
  { key: 'CVC', label: 'Central Venous Catheter (CVC)' },
];

const VascularAccessAssessmentView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(() => {
    return resolveP2SessionId(propSessionId, location);
  }, [propSessionId, location.state, patientId]);

  const {
    patientRaw,
    accessType,
    formData,
    detailsData,
    additionalObservations,
    currentConfig,
    criticalErrors,
    canProceed,
    alerts,
    accessDetails,
    assessmentTime,
    updateAccessType,
    updateField,
    updateDetails,
    updateObservations,
    showSkipModal,
    setShowSkipModal,
    skippedFieldsList,
    setSkippedFieldsList,
    skipReasons,
    setSkipReasons,
    checkSkippedNonMandatory,
    optionalFields,
    loading,
    saving,
    error,
    refresh,
    saveDraft,
    submitFinal,
  } = useVascularAccessAssessment(patientId, effectiveSessionId);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, sessionId: effectiveSessionId, step: 'P2-06' },
      });
    }
  };

  const goNext = () => {
    if (onNext) {
      onNext();
      return;
    }
    navigate(ROUTES.DIALYSIS_PATIENTS, {
      state: { patientId, sessionId: effectiveSessionId, step: 'P2-08' },
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

  const buildSkips = (labels) => labels.map((label) => {
    const field = optionalFields.find((item) => item.label === label);
    const reason = skipReasons[label];
    return {
      field_name: field?.field_name || label,
      reason: reason && String(reason).trim() ? String(reason).trim() : null,
    };
  });

  const handleSaveContinue = async () => {
    if (!canProceed || saving) return;
    const skipped = checkSkippedNonMandatory();
    if (skipped.length > 0) {
      setSkippedFieldsList(skipped);
      setShowSkipModal(true);
      return;
    }
    const saved = await submitFinal([]);
    if (saved) goNext();
  };

  const proceedToNext = async () => {
    if (!canProceed || saving) return;
    const saved = await submitFinal(buildSkips(skippedFieldsList));
    if (!saved) return;
    setShowSkipModal(false);
    goNext();
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading Vascular Access Assessment...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '15px' }}>
          {error}
        </p>
        <Button variant="outline" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 4 ? 'active' : ''}
                  onClick={() => goToStep(step.code)}
                  aria-current={step.id === 4 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientRaw} isMobile={isMobile} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-start mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Access Type</h3>
                  <div className="flex items-center gap-2 text-sm text-[#475569]">
                    <span>Assessment Time</span>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-1 rounded-md bg-[#f8fafc]">
                      <span>{assessmentTime && assessmentTime !== MISSING ? assessmentTime : MISSING}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {ACCESS_TYPE_OPTIONS.map((type) => {
                    const isSelected = accessType === type.key;
                    return (
                      <label key={type.key} className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-[#e2e8f0] hover:bg-gray-50'}`}>
                        <input
                          type="radio"
                          name="accessType"
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => updateAccessType(type.key)}
                        />
                        <span className={`text-sm ${isSelected ? 'font-semibold text-blue-700' : 'text-[#334155]'}`}>{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

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

                  {accessType === 'CVC' && (
                    <p style={{ margin: '0 24px 16px', fontSize: '12px', color: '#64748b' }}>
                      Cannulation and Access Flow do not apply to catheter access.
                    </p>
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
                                      onChange={() => updateField(field.id, opt)}
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
                                onChange={(e) => updateField(field.id, e.target.value)}
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
                            maxLength={300}
                            value={detailsData[field.id] || ''}
                            onChange={(e) => updateDetails(field.id, e.target.value)}
                            placeholder={field.type === 'number' ? 'Add notes...' : 'Describe if abnormal...'}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-6 w-full" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ ...CARD_STYLE, padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Additional Observations</h4>
                  <p className="text-sm text-[#475569] mb-4">Any additional notes or concerns.</p>
                  <textarea
                    className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none flex-1"
                    rows={3}
                    value={additionalObservations}
                    onChange={(e) => updateObservations(e.target.value)}
                  />
                  <div className="text-right mt-1 text-xs text-[#94a3b8]">{additionalObservations.length} / 300</div>
                </div>

                <div style={{ ...CARD_STYLE, padding: '24px', flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Action Required</h4>
                  <p className="text-sm text-[#475569] mb-4">Based on assessment findings.</p>
                  {canProceed ? (
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

            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded">
                      <TimelineIcon style={{ fontSize: '18px', color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Access Details</h3>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#64748b]">Access Type</span><span className="font-semibold text-[#0f172a]">{accessDetails.accessType}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">{accessType === 'CVC' ? 'Location' : 'Location'}</span><span className="font-semibold text-[#0f172a]">{accessDetails.location}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">{accessType === 'CVC' ? 'Date of Insertion' : 'Date Created'}</span><span className="font-semibold text-[#0f172a]">{accessDetails.dateCreated}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Surgeon / Center</span><span className="font-semibold text-[#0f172a]">{accessDetails.surgeon}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Reviewed</span><span className="font-semibold text-[#0f172a]">{accessDetails.lastReviewed}</span></div>
                </div>
              </div>

              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fffbeb', borderColor: '#fde68a' }}>
                <div className="flex items-center gap-2 mb-4">
                  <WarningAmberIcon style={{ color: '#b45309' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#b45309' }}>Pre-Dialysis Alerts</h3>
                </div>
                <div className="flex flex-col gap-2 text-sm text-[#92400e]">
                  {alerts.length === 0 ? (
                    <div>No active alerts</div>
                  ) : alerts.map((alert) => (
                    <div key={alert.id}>
                      • {alert.title}
                      {alert.message && alert.message !== MISSING ? ` — ${alert.message}` : ''}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goToStep('P2-03')}
                  style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '10px', padding: 0 }}
                >
                  View All Alerts →
                </button>
              </div>

              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Quick Reference</h3>
                <div className="flex flex-col gap-3 text-sm mt-4">
                  {accessType !== 'CVC' && (
                    <div className="flex justify-between"><span className="text-[#64748b]">Access Flow Goal</span><span className="font-semibold text-[#0f172a]">≥ 500 mL/min</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-[#64748b]">Minimum Blood Flow (BFR)</span><span className="font-semibold text-[#0f172a]">250–300 mL/min</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Recirculation Target</span><span className="font-semibold text-[#0f172a]">&lt; 10 %</span></div>
                </div>
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

        {showSkipModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
            }}
          >
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '90%' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Unentered Non-Mandatory Fields
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                The following optional access fields were left blank. You may provide a reason or skip to proceed:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {skippedFieldsList.map((field) => (
                  <div key={field}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      {field} (Optional Reason)
                    </label>
                    <input
                      type="text"
                      placeholder="Reason for skipping..."
                      value={skipReasons[field] || ''}
                      onChange={(e) => setSkipReasons((prev) => ({ ...prev, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setShowSkipModal(false)} disabled={saving}>
                  Go Back & Complete
                </Button>
                <Button onClick={proceedToNext} disabled={saving}>
                  {saving ? 'Saving…' : 'Skip & Proceed'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default VascularAccessAssessmentView;
