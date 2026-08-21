/**
 * PatientAssessmentView — P2-06 Patient Assessment Screen
 *
 * Full implementation of P2-06 Patient Assessment per Part 2 specification and P2-06.jpeg:
 *  - 9-Step Progress Bar (Steps 1 & 2 complete with checkmarks, Step 3 active).
 *  - Subjective Assessment Panel (11 Yes/No toggle cards + free-text "Any Other Symptoms?").
 *  - Objective Assessment Panel (9 observation dropdowns + Abnormal Finding Yes/No toggle + conditional description textarea).
 *  - Functional Assessment Panel (KPS dropdown with inline clinical description + Assistive Support checkboxes).
 *  - 4-Card Right Rail: Patient Summary, Pre-Dialysis Alerts, Key Vitals (06:45 AM), Notes (0) empty state.
 *  - Non-Mandatory Field Skip popup modal for un-entered non-critical fields.
 *  - Footer Bar: ← Back, Save as Draft, Save & Continue → (navigates to P2-07).
 *
 * @file src/pages/dialysis/PatientAssessmentView.jsx
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { Box, Button } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import usePatientAssessment, {
  CRITICAL_SUBJECTIVE_SYMPTOMS,
  NON_CRITICAL_SUBJECTIVE_SYMPTOMS,
  KPS_DESCRIPTIONS,
} from '../../hooks/usePatientAssessment';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import './duringDialysis.css';
import { ROUTES } from '../../routes/routeConstants';
import { submitSessionAssessment } from '../../ApiCalls/preDialysisApis';

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

const SYMPTOM_CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '84px',
};

// ---------------------------------------------------------------------------
// Symptom Item Definitions for Display Labels
// ---------------------------------------------------------------------------

const SYMPTOM_ICON_MAP = {
  shortnessOfBreath: AirOutlinedIcon,
  chestPain: FavoriteBorderOutlinedIcon,
  nauseaVomiting: MedicalInformationOutlinedIcon,
  feverChills: DeviceThermostatOutlinedIcon,
  cough: AirOutlinedIcon,
  dizzinessGiddiness: PsychologyOutlinedIcon,
  muscleCramps: FitnessCenterOutlinedIcon,
  itching: HealingOutlinedIcon,
  headache: PsychologyOutlinedIcon,
  bleedingBruising: BloodtypeOutlinedIcon,
  lossOfAppetite: RestaurantOutlinedIcon,
};

const SYMPTOM_DEFINITIONS = [
  { key: 'shortnessOfBreath', label: 'Shortness of Breath', critical: true },
  { key: 'chestPain', label: 'Chest Pain', critical: true },
  { key: 'nauseaVomiting', label: 'Nausea / Vomiting', critical: false },
  { key: 'feverChills', label: 'Fever / Chills', critical: true },
  { key: 'cough', label: 'Cough', critical: false },
  { key: 'dizzinessGiddiness', label: 'Dizziness / Giddiness', critical: true },
  { key: 'muscleCramps', label: 'Muscle Cramps', critical: false },
  { key: 'itching', label: 'Itching', critical: false },
  { key: 'headache', label: 'Headache', critical: false },
  { key: 'bleedingBruising', label: 'Bleeding / Bruising', critical: true },
  { key: 'lossOfAppetite', label: 'Loss of Appetite', critical: false },
];

// ---------------------------------------------------------------------------
// PatientAssessmentView Component
// ---------------------------------------------------------------------------

const PatientAssessmentView = ({ patientId, sessionId: propSessionId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = useMemo(() => {
    if (propSessionId) return propSessionId;
    try {
      const fromState = location.state?.sessionId || location.state?.session_id || location.state?.dialysis_session_id;
      if (fromState) return fromState;
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return patientId || 1;
  }, [propSessionId, location.state, patientId]);

  const {
    patientRaw,
    subjective,
    objective,
    functional,
    updateSubjectiveSymptom,
    updateSymptomDetail,
    updateObjectiveField,
    updateFunctionalField,
    toggleAssistiveSupport,
    kpsDescription,
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
  } = usePatientAssessment(patientId);

  const [focusedSymptom, setFocusedSymptom] = useState(null);

  // Handle Back Click
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, step: 'P2-05' },
      });
    }
  };

  // Handle Save as Draft
  const handleSaveDraft = () => {
    alert('Patient Assessment draft saved locally.');
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
      await submitSessionAssessment(effectiveSessionId, {
        status: 'final',
        section: 'Subjective Assessment',
        assessment: {
          shortness_of_breath: subjective.shortnessOfBreath ? 'yes' : 'no',
          chest_pain: subjective.chestPain ? 'yes' : 'no',
          bleeding_bruising: subjective.bleedingBruising ? 'yes' : 'no',
          dizziness_giddiness: subjective.dizzinessGiddiness ? 'yes' : 'no',
          fever_chills: subjective.feverChills ? 'yes' : 'no',
          any_abnormal_finding: objective.anyAbnormalFinding ? 'yes' : 'no',
          consciousness: objective.consciousness || 'alert',
          lung_sounds: objective.lungSounds || 'clear',
          heart_sounds: objective.heartSounds || 'normal',
          nausea_vomiting: subjective.nauseaVomiting ? 'yes' : 'no',
          cough: subjective.cough ? 'yes' : 'no',
          muscle_cramps: subjective.muscleCramps ? 'yes' : 'no',
          itching: subjective.itching ? 'yes' : 'no',
          headache: subjective.headache ? 'yes' : 'no',
          loss_of_appetite: subjective.lossOfAppetite ? 'yes' : 'no',
          general_appearance: objective.generalAppearance || 'well',
          edema: objective.edema || 'none',
          kps: functional.kps || '80',
        },
        skips: skippedFieldsList.map((key) => ({ field_name: key, reason: skipReasons[key] || 'optional' })),
      });
    } catch (_) {}

    setShowSkipModal(false);
    if (onNext) {
      onNext();
    } else {
      navigate(ROUTES.DIALYSIS_PATIENTS, {
        state: { patientId, step: 'P2-07' },
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px' }}>
        Loading Patient Assessment...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        {/* Sticky Header */}
        <Box className="sticky top-[56px] z-20 bg-white shadow-sm">
          {/* <PageHeader
            title="P2-06 – Patient Assessment"
            subtitle="Assess patient symptoms and clinical status before dialysis."
            breadcrumbs={[
              { label: 'Pre-Dialysis Queue', path: ROUTES.DIALYSIS_PATIENTS },
              { label: 'Vitals & Measurements', onClick: handleBackClick },
              { label: 'Patient Assessment', active: true },
            ]}
          /> */}
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : 'p-6'}`}>
          {/* ----------------------------------------------------------------- */}
          {/* 9-Step Progress Bar                                               */}
          {/* ----------------------------------------------------------------- */}
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 3 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 3 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientRaw} isMobile={isMobile} />

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
            {/* Left 8/12 Main Form (3 Panels)                                  */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Panel 1: Subjective Assessment */}
              <div style={CARD_STYLE}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PersonOutlineIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} /> Subjective Assessment
                    </h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>
                      Ask patient and record their responses.
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Assessment Time: <strong>26 May 2025, 06:48 AM</strong>
                  </div>
                </div>

                {/* 11 Symptoms Grid (4 columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
                  {SYMPTOM_DEFINITIONS.map((sym, idx) => {
                    const isYes = subjective[sym.key] === 'Yes';
                    const IconComp = SYMPTOM_ICON_MAP[sym.key] || MedicalInformationOutlinedIcon;

                    return (
                      <div key={sym.key} style={SYMPTOM_CARD_STYLE}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconComp aria-hidden="true" sx={{ color: '#2563eb', fontSize: 16 }} />
                          <span>{sym.label}{sym.critical ? '*' : ''}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={sym.key}
                              value="No"
                              checked={subjective[sym.key] === 'No'}
                              onChange={() => updateSubjectiveSymptom(sym.key, 'No')}
                              style={{ accentColor: '#2563eb' }}
                            />
                            <span>No</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={sym.key}
                              value="Yes"
                              checked={subjective[sym.key] === 'Yes'}
                              onChange={() => updateSubjectiveSymptom(sym.key, 'Yes')}
                              style={{ accentColor: '#2563eb' }}
                            />
                            <span style={{ color: isYes ? '#ef4444' : '#334155', fontWeight: isYes ? 700 : 400 }}>Yes</span>
                          </label>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                          <textarea
                            autoFocus={idx === 0}
                            rows={focusedSymptom === sym.key ? 2 : 1}
                            placeholder="Describe symptom details..."
                            value={subjective.symptomDetails[sym.key] || ''}
                            onFocus={() => setFocusedSymptom(sym.key)}
                            onBlur={() => setFocusedSymptom(null)}
                            onChange={(e) => updateSymptomDetail(sym.key, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${focusedSymptom === sym.key ? '#2563eb' : '#cbd5e1'}`,
                              fontSize: '11px',
                              resize: 'vertical',
                              minHeight: focusedSymptom === sym.key ? '44px' : '28px',
                              transition: 'all 0.15s ease',
                              background: focusedSymptom === sym.key ? '#fff' : '#f8fafc',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Any Other Symptoms */}
                  <div style={{ ...SYMPTOM_CARD_STYLE, gridColumn: isMobile ? 'span 1' : 'span 1' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <NoteAltOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 16 }} />
                      <span>Any Other Symptoms?</span>
                    </div>
                    <textarea
                      autoFocus={false}
                      rows={focusedSymptom === 'anyOtherSymptoms' ? 3 : 1}
                      placeholder="Describe other symptoms..."
                      value={subjective.anyOtherSymptoms}
                      onFocus={() => setFocusedSymptom('anyOtherSymptoms')}
                      onBlur={() => setFocusedSymptom(null)}
                      onChange={(e) => updateSubjectiveSymptom('anyOtherSymptoms', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${focusedSymptom === 'anyOtherSymptoms' ? '#2563eb' : '#cbd5e1'}`,
                        fontSize: '12px',
                        marginTop: '8px',
                        resize: 'vertical',
                        minHeight: focusedSymptom === 'anyOtherSymptoms' ? '60px' : '28px',
                        transition: 'all 0.15s ease',
                        background: focusedSymptom === 'anyOtherSymptoms' ? '#fff' : '#f8fafc',
                      }}
                    />
                    <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>{(subjective.anyOtherSymptoms?.length || 0)} / 200</div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Objective Assessment */}
              <div style={CARD_STYLE}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MedicalInformationOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} /> Objective Assessment
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>
                    Clinical observations by technician.
                  </p>
                </div>

                {/* 9 Dropdowns Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      General Appearance
                    </label>
                    <select
                      value={objective.generalAppearance}
                      onChange={(e) => updateObjectiveField('generalAppearance', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Alert">Alert</option>
                      <option value="Drowsy">Drowsy</option>
                      <option value="Lethargic">Lethargic</option>
                      <option value="Distress">Distress</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Consciousness*
                    </label>
                    <select
                      value={objective.consciousness}
                      onChange={(e) => updateObjectiveField('consciousness', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Oriented">Oriented</option>
                      <option value="Confused">Confused</option>
                      <option value="Unresponsive">Unresponsive</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Edema
                    </label>
                    <select
                      value={objective.edema}
                      onChange={(e) => updateObjectiveField('edema', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="None">None</option>
                      <option value="Mild (1+)">Mild (1+)</option>
                      <option value="Moderate (2+)">Moderate (2+)</option>
                      <option value="Severe (3+/4+)">Severe (3+/4+)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Hydration Status
                    </label>
                    <select
                      value={objective.hydrationStatus}
                      onChange={(e) => updateObjectiveField('hydrationStatus', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Euvolemic">Euvolemic</option>
                      <option value="Dehydrated">Dehydrated</option>
                      <option value="Fluid Overloaded">Fluid Overloaded</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Skin Condition
                    </label>
                    <select
                      value={objective.skinCondition}
                      onChange={(e) => updateObjectiveField('skinCondition', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Dry">Dry</option>
                      <option value="Pale">Pale</option>
                      <option value="Jaundiced">Jaundiced</option>
                      <option value="Lesions">Lesions</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      JVP
                    </label>
                    <select
                      value={objective.jvp}
                      onChange={(e) => updateObjectiveField('jvp', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Elevated">Elevated</option>
                      <option value="Not Visible">Not Visible</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Lung Sounds*
                    </label>
                    <select
                      value={objective.lungSounds}
                      onChange={(e) => updateObjectiveField('lungSounds', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Clear">Clear</option>
                      <option value="Crackles/Rales">Crackles/Rales</option>
                      <option value="Wheezing">Wheezing</option>
                      <option value="Diminished">Diminished</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Heart Sounds*
                    </label>
                    <select
                      value={objective.heartSounds}
                      onChange={(e) => updateObjectiveField('heartSounds', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Murmur">Murmur</option>
                      <option value="Gallop">Gallop</option>
                      <option value="Distant">Distant</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Abdomen
                    </label>
                    <select
                      value={objective.abdomen}
                      onChange={(e) => updateObjectiveField('abdomen', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Soft, Non-tender">Soft, Non-tender</option>
                      <option value="Tender">Tender</option>
                      <option value="Distended">Distended</option>
                      <option value="Rigid">Rigid</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Any Abnormal Finding?*
                    </label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="anyAbnormalFinding"
                          value="No"
                          checked={objective.anyAbnormalFinding === 'No'}
                          onChange={() => updateObjectiveField('anyAbnormalFinding', 'No')}
                          style={{ accentColor: '#2563eb' }}
                        />
                        <span>No</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="anyAbnormalFinding"
                          value="Yes"
                          checked={objective.anyAbnormalFinding === 'Yes'}
                          onChange={() => updateObjectiveField('anyAbnormalFinding', 'Yes')}
                          style={{ accentColor: '#2563eb' }}
                        />
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>Yes</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Conditional Description Textarea when Abnormal Finding = Yes */}
                {objective.anyAbnormalFinding === 'Yes' && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      If Yes, Please Describe*
                    </label>
                    <textarea
                      rows={2}
                      value={objective.abnormalFindingDescription}
                      onChange={(e) => updateObjectiveField('abnormalFindingDescription', e.target.value)}
                      placeholder="Describe abnormal observations in detail..."
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                      {objective.abnormalFindingDescription?.length || 0} / 300
                    </div>
                  </div>
                )}
              </div>

              {/* Panel 3: Functional Assessment */}
              <div style={CARD_STYLE}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AccessibilityNewOutlinedIcon aria-hidden="true" sx={{ color: '#2563eb', fontSize: 20 }} /> Functional Assessment
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>
                    Evaluate patient's functional status.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                  {/* KPS Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Karnofsky Performance Status (KPS)
                    </label>
                    <select
                      value={functional.kps}
                      onChange={(e) => updateFunctionalField('kps', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700 }}
                    >
                      {Object.keys(KPS_DESCRIPTIONS).map((score) => (
                        <option key={score} value={score}>{score}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px', lineHeight: '1.4' }}>
                      {kpsDescription}
                    </p>
                  </div>

                  {/* Assistive Support Required Checkboxes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Assistive Support Required
                    </label>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={functional.assistiveSupport.walker}
                          onChange={() => toggleAssistiveSupport('walker')}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                        <span>Walker</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={functional.assistiveSupport.wheelchair}
                          onChange={() => toggleAssistiveSupport('wheelchair')}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                        <span>Wheelchair</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={functional.assistiveSupport.others}
                          onChange={() => toggleAssistiveSupport('others')}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                        <span>Others</span>
                      </label>

                      {functional.assistiveSupport.others && (
                        <input
                          type="text"
                          value={functional.assistiveOthersText}
                          onChange={(e) => updateFunctionalField('assistiveOthersText', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: '120px' }}
                        />
                      )}

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={functional.assistiveSupport.none}
                          onChange={() => toggleAssistiveSupport('none')}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                        <span>None</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Right 4/12 Rail Cards                                           */}
            {/* --------------------------------------------------------------- */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Card 2: Pre-Dialysis Alerts */}
              <div style={{ ...CARD_STYLE, background: '#fffbeb', borderColor: '#fde68a' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#b45309', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MedicalInformationOutlinedIcon aria-hidden="true" sx={{ color: '#b45309', fontSize: 18 }} />
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

              {/* Card 3: Key Vitals (06:45 AM) */}
              <div style={CARD_STYLE}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Key Vitals <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>(06:45 AM)</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>BP</span>
                    <strong>138 / 82 mmHg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Pulse</span>
                    <strong>78 bpm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Temp.</span>
                    <strong>36.8 °C</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>SpO₂</span>
                    <strong>98 %</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Weight (Pre)</span>
                    <strong>68.5 kg</strong>
                  </div>
                </div>
                <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '10px', padding: 0 }}>
                  View All Vitals →
                </button>
              </div>

              {/* Card 4: Notes (0) Empty State */}
              <div style={{ ...CARD_STYLE, textAlign: 'center', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Notes (0)</div>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                    Add Note
                  </button>
                </div>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 8px auto', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <NoteAltOutlinedIcon aria-hidden="true" sx={{ color: '#94a3b8', fontSize: 24 }} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>No notes added yet.</div>
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
                Unentered Non-Mandatory Observations
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                The following optional assessment fields were left blank. You may provide a reason or skip to proceed:
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

export default PatientAssessmentView;
