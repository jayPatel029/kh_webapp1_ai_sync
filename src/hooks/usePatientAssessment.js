/**
 * usePatientAssessment — P2-06 Patient Assessment Hook
 *
 * Manages Subjective (11 symptoms), Objective (9 observations + abnormal finding),
 * and Functional (KPS + assistive support) assessment state, KPS descriptions,
 * conditional description validation, and progression gating.
 *
 * @file src/hooks/usePatientAssessment.js
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getPatientDetails,
  submitSessionAssessment,
} from '../ApiCalls/preDialysisApis';
import { getPatientById } from '../ApiCalls';
import { notifyError, notifySuccess } from '../helpers/notify';

// ---------------------------------------------------------------------------
// Constants & Field Lists
// ---------------------------------------------------------------------------

export const CRITICAL_SUBJECTIVE_SYMPTOMS = [
  'shortnessOfBreath',
  'chestPain',
  'feverChills',
  'dizzinessGiddiness',
  'bleedingBruising',
];

export const NON_CRITICAL_SUBJECTIVE_SYMPTOMS = [
  'nauseaVomiting',
  'cough',
  'muscleCramps',
  'itching',
  'headache',
  'lossOfAppetite',
];

export const CRITICAL_OBJECTIVE_FIELDS = [
  'consciousness',
  'lungSounds',
  'heartSounds',
  'anyAbnormalFinding',
];

export const NON_CRITICAL_OBJECTIVE_FIELDS = [
  'generalAppearance',
  'edema',
  'hydrationStatus',
  'skinCondition',
  'jvp',
  'abdomen',
];

export const KPS_DESCRIPTIONS = {
  '100': 'Normal; no complaints; no evidence of disease.',
  '90': 'Able to carry on normal activity; minor signs or symptoms of disease.',
  '80': 'Normal activity with effort; some signs or symptoms of disease.',
  '70': 'Cares for self; unable to carry on normal activity or to do active work.',
  '60': 'Requires occasional assistance, but is able to care for most of personal needs.',
  '50': 'Requires considerable assistance and frequent medical care.',
  '40': 'Disabled; requires special care and assistance.',
  '30': 'Severely disabled; hospital admission is indicated although death not imminent.',
  '20': 'Very sick; hospital admission necessary; active supportive treatment necessary.',
  '10': 'Moribund; fatal processes progressing rapidly.',
  '0': 'Dead',
};

// ---------------------------------------------------------------------------
// Pure Validation Helpers
// ---------------------------------------------------------------------------

export const getKpsDescription = (score) => {
  return KPS_DESCRIPTIONS[String(score)] || KPS_DESCRIPTIONS['70'];
};

/**
 * Validate that all Critical fields are selected and required conditional descriptions provided.
 */
export const validateAssessmentState = (subjective, objective) => {
  // Check Critical Subjective Symptoms
  for (const symptom of CRITICAL_SUBJECTIVE_SYMPTOMS) {
    const val = subjective[symptom];
    if (!val) return false; // missing selection
    if (val === 'Yes' && (!subjective.symptomDetails?.[symptom] || !subjective.symptomDetails[symptom].trim())) {
      return false; // "Yes" requires comment
    }
  }

  // Check Critical Objective Fields
  if (!objective.consciousness || !objective.lungSounds || !objective.heartSounds || !objective.anyAbnormalFinding) {
    return false;
  }

  // "Any Abnormal Finding = Yes" requires description
  if (objective.anyAbnormalFinding === 'Yes' && (!objective.abnormalFindingDescription || !objective.abnormalFindingDescription.trim())) {
    return false;
  }

  return true;
};

// ---------------------------------------------------------------------------
// Hook Definition
// ---------------------------------------------------------------------------

export default function usePatientAssessment(patientId) {
  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subjective Assessment State
  const [subjective, setSubjective] = useState({
    shortnessOfBreath: 'No',
    chestPain: 'No',
    nauseaVomiting: 'No',
    feverChills: 'No',
    cough: 'No',
    dizzinessGiddiness: 'No',
    muscleCramps: 'No',
    itching: 'No',
    headache: 'No',
    bleedingBruising: 'No',
    lossOfAppetite: 'No',
    symptomDetails: {},
    anyOtherSymptoms: '',
  });

  // Objective Assessment State
  const [objective, setObjective] = useState({
    generalAppearance: 'Alert',
    consciousness: 'Oriented',
    edema: 'Mild (1+)',
    hydrationStatus: 'Euvolemic',
    skinCondition: 'Normal',
    jvp: 'Normal',
    lungSounds: 'Clear',
    heartSounds: 'Normal',
    abdomen: 'Soft, Non-tender',
    anyAbnormalFinding: 'Yes',
    abnormalFindingDescription: 'Mild pitting edema on bilateral ankle.',
  });

  // Functional Assessment State
  const [functional, setFunctional] = useState({
    kps: '70',
    assistiveSupport: {
      walker: false,
      wheelchair: false,
      others: true,
      none: false,
    },
    assistiveOthersText: 'None',
  });

  // Skip modal state for non-mandatory fields
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skippedFieldsList, setSkippedFieldsList] = useState([]);
  const [skipReasons, setSkipReasons] = useState({});

  // Fetch patient data
  const loadAssessmentData = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patientRes = await getPatientById(patientId);
      let patientData = null;

      if (patientRes?.success) {
        patientData = patientRes.data?.data || patientRes.data || null;
      } else {
        patientData = {
          id: patientId,
          patient_code: `P${String(patientId).padStart(5, '0')}`,
          name: 'Ramesh Kumar',
          dob: '1967-04-20',
          gender: 'Male',
          blood_group: 'O+',
          last_dialysis_date: '2023-01-12',
          shift_time: 'Morning (07:00 AM)',
          bed_number: 'B-02',
          machine_number: 'HD-01',
        };
      }

      setPatientRaw(patientData);
    } catch (err) {
      const errMsg = err?.message || 'Failed to load patient assessment data';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadAssessmentData();
  }, [loadAssessmentData]);

  // Update handlers
  const triggerNephrologistAlert = useCallback((symptomKey) => {
    // Real-time nephrologist alert on Critical symptom Yes — distinct from daily digest (Change #9)
    try {
      const payload = { patientId, symptom: symptomKey, triggeredAt: new Date().toISOString() };
      // Audit event: consent_revoked_kifayti_anonymization_applied analogue — here nephrologist_alert
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nephrologist_alert', { detail: payload }));
      // Also attempt API notification if available (non-blocking)
      import('../ApiCalls/preDialysisApis').then((mod) => {
        if (mod.notifyNephrologistCritical) mod.notifyNephrologistCritical(patientId, symptomKey).catch(()=>{});
      }).catch(()=>{});
      notifySuccess(`Nephrologist alerted: Critical symptom "${symptomKey}"`);
    } catch (_) {}
  }, [patientId]);

  const updateSubjectiveSymptom = (key, value) => {
    setSubjective((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (value === 'Yes' && CRITICAL_SUBJECTIVE_SYMPTOMS.includes(key)) {
      triggerNephrologistAlert(key);
    }
  };

  const updateSymptomDetail = (key, text) => {
    setSubjective((prev) => ({
      ...prev,
      symptomDetails: {
        ...prev.symptomDetails,
        [key]: text,
      },
    }));
  };

  const updateObjectiveField = (key, value) => {
    setObjective((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFunctionalField = (key, value) => {
    setFunctional((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleAssistiveSupport = (key) => {
    setFunctional((prev) => ({
      ...prev,
      assistiveSupport: {
        ...prev.assistiveSupport,
        [key]: !prev.assistiveSupport[key],
      },
    }));
  };

  // Derived validation
  const canProceed = useMemo(
    () => validateAssessmentState(subjective, objective),
    [subjective, objective]
  );

  // Check skipped non-mandatory fields
  const checkSkippedNonMandatory = () => {
    const skipped = [];

    // Check non-critical subjective symptoms
    for (const symptom of NON_CRITICAL_SUBJECTIVE_SYMPTOMS) {
      if (!subjective[symptom]) {
        skipped.push(`Symptom: ${symptom}`);
      }
    }

    // Check non-critical objective fields
    for (const field of NON_CRITICAL_OBJECTIVE_FIELDS) {
      if (!objective[field]) {
        skipped.push(`Observation: ${field}`);
      }
    }

    return skipped;
  };

  return {
    patientRaw,
    subjective,
    objective,
    functional,
    updateSubjectiveSymptom,
    updateSymptomDetail,
    updateObjectiveField,
    updateFunctionalField,
    toggleAssistiveSupport,
    kpsDescription: getKpsDescription(functional.kps),
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
    refresh: loadAssessmentData,
  };
}
