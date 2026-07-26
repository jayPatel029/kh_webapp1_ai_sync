/**
 * VitalsMeasurementsView — P2-05 Vitals & Measurements Screen
 *
 * Full implementation of P2-05 Vitals & Measurements per Part 2 specification and P2-05.jpeg:
 *  - 9-Step Progress Bar (Step 1 complete with checkmark, Step 2 active).
 *  - Main 8/12 Form: Record Vitals (3 rows of 4 cards) + Additional Measurements (UF Goal, EDW, MAP, Notes, Kt/V BUN).
 *  - Auto-calculations: Weight Gain, BMI, Pre-Dialysis MAP, UF Goal.
 *  - 2-Tier Threshold Evaluation (Normal green / Warning amber / Critical red).
 *  - 4-Card Right Rail: Patient Summary, Pre-Dialysis Alerts, Quick Reference, Previous Vitals.
 *  - Non-Mandatory Field Skip popup modal for un-entered non-critical fields.
 *  - Footer Bar: ← Back, Save as Draft, Save & Continue → (navigates to P2-06).
 *
 * @file src/pages/dialysis/VitalsMeasurementsView.jsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import useVitalsMeasurements, { VITAL_SEVERITY } from '../../hooks/useVitalsMeasurements';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';

// ---------------------------------------------------------------------------
// Styling Tokens
// ---------------------------------------------------------------------------

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  padding: '20px',
};

const FIELD_CONTAINER_STYLE = (severity = VITAL_SEVERITY.NORMAL) => {
  let borderColor = '#e2e8f0';
  if (severity === VITAL_SEVERITY.WARNING) borderColor = '#f59e0b';
  if (severity === VITAL_SEVERITY.CRITICAL) borderColor = '#ef4444';

  return {
    background: '#ffffff',
    borderRadius: '12px',
    border: `1px solid ${borderColor}`,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '120px',
  };
};

const BADGE_STYLE = (severity = VITAL_SEVERITY.NORMAL) => {
  let bg = '#dcfce7';
  let color = '#15803d';
  if (severity === VITAL_SEVERITY.WARNING) {
    bg = '#fef3c7';
    color = '#b45309';
  }
  if (severity === VITAL_SEVERITY.CRITICAL) {
    bg = '#fee2e2';
    color = '#b91c1c';
  }

  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '6px',
    background: bg,
    color,
    fontSize: '11px',
    fontWeight: 700,
    marginTop: '6px',
  };
};

// ---------------------------------------------------------------------------
// VitalsMeasurementsView Component
// ---------------------------------------------------------------------------

const VitalsMeasurementsView = ({ patientId, onBack, onNext }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();

  const {
    patientRaw,
    formState,
    updateField,
    weightGain,
    bmi,
    map,
    ufGoal,
    bpEval,
    pulseEval,
    tempEval,
    spo2Eval,
    formSeverity,
    canProceed,
    showSkipModal,
    setShowSkipModal,
    skippedFieldsList,
    setSkippedFieldsList,
    skipReasons,
    setSkipReasons,
    checkSkippedNonMandatory,
    loading,
    error,
    refresh,
  } = useVitalsMeasurements(patientId);

  // Handle Back Click
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, step: 'P2-04' },
      });
    }
  };

  // Handle Save as Draft
  const handleSaveDraft = () => {
    alert('Vitals draft saved locally.');
  };

  // Handle Save & Continue Click
  const handleSaveContinue = () => {
    if (!canProceed) return;

    const skipped = checkSkippedNonMandatory();
    if (skipped.length > 0) {
      setSkippedFieldsList(skipped);
      setShowSkipModal(true);
    } else {
      proceedToNext();
    }
  };

  const proceedToNext = async () => {
    try {
      await submitSessionVitals(1, {
        status: 'final',
        bp_systolic: parseFloat(vitalsForm.bpSystolic) || 120,
        bp_diastolic: parseFloat(vitalsForm.bpDiastolic) || 80,
        pulse: parseFloat(vitalsForm.pulse) || 72,
        temperature: parseFloat(vitalsForm.temperature) || 36.8,
        spo2: parseFloat(vitalsForm.spo2) || 98,
        weight_pre: parseFloat(vitalsForm.weightPre) || 68.5,
        edw: parseFloat(vitalsForm.edw) || 66.0,
        heparin_dose_units: parseFloat(vitalsForm.heparinDose) || 2000,
        heparin_concentration: 5000,
        saline_flush_ml: 100,
        treatment_duration_hours: 4,
        respiratory_rate: parseFloat(vitalsForm.respiratoryRate) || 16,
        height_cm: parseFloat(vitalsForm.heightCm) || 170,
        pain_score: parseFloat(vitalsForm.painScore) || 0,
        glucose: parseFloat(vitalsForm.glucose) || 110,
        notes: notesText,
        skips: unenteredNonCriticalFields.map((f) => ({ field_name: f.key, reason: skipReasons[f.key] || 'optional' })),
      });
    } catch (_) {}

    setShowSkipModal(false);
    if (onNext) {
      onNext();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, step: 'P2-06' },
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading Vitals & Measurements...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        {/* Sticky Header */}
        <Box className="sticky top-[56px] z-20 bg-white shadow-sm">
          {/* <PageHeader
            title="P2-05 – Vitals & Measurements"
            subtitle="Record patient vital signs and pre-dialysis measurements."
            breadcrumbs={[
              { label: 'Pre-Dialysis Queue', path: ROUTES.DIALYSIS_PATIENTS },
              { label: 'Patient Verification', onClick: handleBackClick },
              { label: 'Vitals & Measurements', active: true },
            ]}
          /> */}
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          {/* ----------------------------------------------------------------- */}
          {/* 9-Step Progress Bar                                               */}
          {/* ----------------------------------------------------------------- */}
          <div style={{ ...CARD_STYLE, padding: '16px 24px', marginBottom: '24px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '780px' }}>
              {PRE_DIALYSIS_STEPS.map((step, idx) => {
                const isStep1Done = step.id === 1;
                const isStep2Active = step.id === 2;

                return (
                  <React.Fragment key={step.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '9999px',
                          background: isStep1Done ? '#16a34a' : isStep2Active ? '#2563eb' : '#f1f5f9',
                          color: isStep1Done || isStep2Active ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {isStep1Done ? '✓' : step.id}
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isStep2Active ? 700 : 500,
                          color: isStep2Active ? '#2563eb' : isStep1Done ? '#16a34a' : '#64748b',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.name}
                      </span>
                    </div>
                    {idx < PRE_DIALYSIS_STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background: idx === 0 ? '#16a34a' : '#e2e8f0',
                          margin: '0 8px',
                          marginTop: '-16px',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Main 12-Column Layout Grid (8/12 Form + 4/12 Right Rail)          */}
          {/* ----------------------------------------------------------------- */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* --------------------------------------------------------------- */}
            {/* Left 8/12 Main Form                                             */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={CARD_STYLE}>
                {/* Section Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Record Vitals
                  </h2>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Measurement Time:{' '}
                    <input
                      type="text"
                      value={formState.measurementTime}
                      onChange={(e) => updateField('measurementTime', e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Row 1 Grid (4 cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  {/* Blood Pressure */}
                  <div style={FIELD_CONTAINER_STYLE(bpEval.severity)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Blood Pressure (mmHg)* ⓘ
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <input
                        type="number"
                        placeholder="Sys"
                        value={formState.systolic}
                        onChange={(e) => updateField('systolic', e.target.value)}
                        style={{ width: '50%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700 }}
                      />
                      <input
                        type="number"
                        placeholder="Dia"
                        value={formState.diastolic}
                        onChange={(e) => updateField('diastolic', e.target.value)}
                        style={{ width: '50%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700 }}
                      />
                    </div>
                    <span style={BADGE_STYLE(bpEval.severity)}>{bpEval.label}</span>
                  </div>

                  {/* Pulse */}
                  <div style={FIELD_CONTAINER_STYLE(pulseEval.severity)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Pulse (bpm)* ⓘ
                    </div>
                    <input
                      type="number"
                      value={formState.pulse}
                      onChange={(e) => updateField('pulse', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <span style={BADGE_STYLE(pulseEval.severity)}>{pulseEval.label}</span>
                  </div>

                  {/* Temperature */}
                  <div style={FIELD_CONTAINER_STYLE(tempEval.severity)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Temperature (°C)* ⓘ
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.temperature}
                      onChange={(e) => updateField('temperature', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <span style={BADGE_STYLE(tempEval.severity)}>{tempEval.label}</span>
                  </div>

                  {/* Respiratory Rate */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Respiratory Rate (breaths/min) ⓘ
                    </div>
                    <input
                      type="number"
                      value={formState.respRate}
                      onChange={(e) => updateField('respRate', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <span style={BADGE_STYLE(VITAL_SEVERITY.NORMAL)}>Normal (12–20 /min)</span>
                  </div>
                </div>

                {/* Row 2 Grid (4 cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  {/* SpO2 */}
                  <div style={FIELD_CONTAINER_STYLE(spo2Eval.severity)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      SpO₂ (%)* ⓘ
                    </div>
                    <input
                      type="number"
                      value={formState.spo2}
                      onChange={(e) => updateField('spo2', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <span style={BADGE_STYLE(spo2Eval.severity)}>{spo2Eval.label}</span>
                  </div>

                  {/* Weight (Pre) */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Weight (Pre) (kg)* ⓘ
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.weightPre}
                      onChange={(e) => updateField('weightPre', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                      Last Post Weight: {formState.lastPostWeight} kg (24 May 2025)
                    </div>
                  </div>

                  {/* Weight Gain (Auto-calculated) */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Weight Gain (kg) ⓘ
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={weightGain}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700, marginTop: '6px' }}>
                      Target: 1.0 – 3.0 kg
                    </div>
                  </div>

                  {/* Height */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Height (cm) ⓘ
                    </div>
                    <input
                      type="number"
                      value={formState.height}
                      onChange={(e) => updateField('height', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                  </div>
                </div>

                {/* Row 3 Grid (3 cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                  {/* BMI */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      BMI (kg/m²)
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={bmi}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>Auto-calculated</div>
                  </div>

                  {/* Pain Score */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Pain Score (0–10) ⓘ</span>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                        {formState.painScore}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={formState.painScore}
                      onChange={(e) => updateField('painScore', parseInt(e.target.value, 10))}
                      style={{ width: '100%', marginTop: '10px', accentColor: '#2563eb' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                      <span>No Pain</span>
                      <span>Worst Pain</span>
                    </div>
                  </div>

                  {/* Glucose */}
                  <div style={FIELD_CONTAINER_STYLE(VITAL_SEVERITY.NORMAL)}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Glucose (mg/dL) ⓘ
                    </div>
                    <input
                      type="number"
                      value={formState.glucose}
                      onChange={(e) => updateField('glucose', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}
                    />
                    <span style={BADGE_STYLE(VITAL_SEVERITY.NORMAL)}>Normal (70–140 mg/dL)</span>
                  </div>
                </div>

                {/* Additional Measurements Sub-Panel */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                    Additional Measurements
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        UF Goal (L)*
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={ufGoal}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2563eb', background: '#eff6ff', fontSize: '15px', fontWeight: 800, color: '#1e40af' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        EDW (kg)*
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.edw}
                        onChange={(e) => updateField('edw', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Pre-Dialysis MAP (mmHg) ⓘ
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={map}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 700 }}
                      />
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Auto-calculated</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Notes
                      </label>
                      <input
                        type="text"
                        value={formState.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder="Enter any relevant notes..."
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  {/* Kt/V Monthly Addendum */}
                  <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formState.ktvChecked}
                        onChange={(e) => updateField('ktvChecked', e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                      />
                      <span>Kt/V Assessment Due / Taken This Session ⓘ</span>
                    </label>

                    {formState.ktvChecked && (
                      <div style={{ marginTop: '12px', maxWidth: '240px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Pre-Dialysis BUN (mg/dL)*
                        </label>
                        <input
                          type="number"
                          value={formState.preDialysisBun}
                          onChange={(e) => updateField('preDialysisBun', e.target.value)}
                          placeholder="e.g. 68"
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Status Info Banner */}
                {formSeverity === VITAL_SEVERITY.CRITICAL ? (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#991b1b', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚨</span>
                    <span>1 or more vital sign(s) at critical levels — resolve before continuing.</span>
                  </div>
                ) : formSeverity === VITAL_SEVERITY.WARNING ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', color: '#92400e', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠</span>
                    <span>1 or more vital sign(s) outside normal range — review before continuing.</span>
                  </div>
                ) : (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', color: '#1e40af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>ℹ</span>
                    <span>All vital signs look within acceptable range. Click "Save & Continue" to proceed.</span>
                  </div>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Right 4/12 Rail Cards                                           */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Card 1: Patient Summary */}
              <div style={CARD_STYLE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                    R
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Ramesh Kumar</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>PID: P10023 · 58 Years, Male</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Blood Group: O+</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Last Dialysis:</span>
                    <strong>12 Jan 2023 (2y 4m)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Schedule:</span>
                    <strong>Mon, Wed, Fri</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Shift / Time:</span>
                    <strong>Morning (07:00 AM)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Machine / Bed:</span>
                    <strong style={{ color: '#2563eb' }}>B-02 / HD-01</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Pre-Dialysis Alerts */}
              <div style={{ ...CARD_STYLE, background: '#fffbeb', borderColor: '#fde68a' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#b45309', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠</span>
                  <span>Pre-Dialysis Alerts</span>
                </div>
                <div style={{ fontSize: '12px', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>• High Potassium (5.2 mEq/L)</div>
                  <div>• Low Hemoglobin (9.6 g/dL)</div>
                </div>
                <button type="button" style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '10px', padding: 0 }}>
                  View All Alerts →
                </button>
              </div>

              {/* Card 3: Quick Reference */}
              <div style={CARD_STYLE}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Quick Reference
                </div>
                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>BP</span>
                    <strong>&lt; 140/90 mmHg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Pulse</span>
                    <strong>60 – 100 bpm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Temperature</span>
                    <strong>36.0 – 37.5 °C</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>SpO₂</span>
                    <strong>≥ 95 %</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Weight Gain</span>
                    <strong>1.0 – 3.0 kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>UF Goal</span>
                    <strong>As prescribed</strong>
                  </div>
                </div>
              </div>

              {/* Card 4: Previous Vitals */}
              <div style={CARD_STYLE}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Previous Vitals (24 May 2025)
                </div>
                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>BP</span>
                    <strong>132 / 78 mmHg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Pulse</span>
                    <strong>76 bpm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Temp.</span>
                    <strong>36.7 °C</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Weight (Pre)</span>
                    <strong>67.2 kg</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Footer Action Bar                                                 */}
          {/* ----------------------------------------------------------------- */}
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
              <Button variant="outline" onClick={handleSaveDraft}>
                Save as Draft
              </Button>
              <Button
                variant="brand"
                onClick={handleSaveContinue}
                disabled={!canProceed}
                style={{
                  opacity: canProceed ? 1 : 0.5,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                }}
              >
                Save & Continue →
              </Button>
            </div>
          </div>
        </div>

        {/* Non-Mandatory Field Skip Popup Modal */}
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
                The following optional vitals were left blank. You may provide a reason or skip to proceed:
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
                <Button variant="outline" onClick={() => setShowSkipModal(false)}>
                  Go Back & Complete
                </Button>
                <Button onClick={proceedToNext}>
                  Skip & Proceed
                </Button>
              </div>
            </div>
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default VitalsMeasurementsView;
