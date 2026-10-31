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
  getPatientAlerts,
  getPatientLatestVitals,
  getPatientNotes,
  getSessionAssessment,
  submitSessionAssessment,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { normalizeAlertsList } from './usePreDialysisDashboard';
import { liveValue, MISSING, unwrapRecord, unwrapList, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';

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
  if (score === '' || score === null || score === undefined) return '';
  return KPS_DESCRIPTIONS[String(score)] || '';
};

const EMPTY_SUBJECTIVE = {
  shortnessOfBreath: '',
  chestPain: '',
  nauseaVomiting: '',
  feverChills: '',
  cough: '',
  dizzinessGiddiness: '',
  muscleCramps: '',
  itching: '',
  headache: '',
  bleedingBruising: '',
  lossOfAppetite: '',
  symptomDetails: {},
  anyOtherSymptoms: '',
};

const EMPTY_OBJECTIVE = {
  generalAppearance: '',
  consciousness: '',
  edema: '',
  hydrationStatus: '',
  skinCondition: '',
  jvp: '',
  lungSounds: '',
  heartSounds: '',
  abdomen: '',
  anyAbnormalFinding: '',
  abnormalFindingDescription: '',
};

const EMPTY_FUNCTIONAL = {
  kps: '',
  assistiveSupport: {
    walker: false,
    wheelchair: false,
    others: false,
    none: false,
  },
  assistiveOthersText: '',
};

const SUBJECTIVE_API_KEYS = {
  shortnessOfBreath: 'shortness_of_breath',
  chestPain: 'chest_pain',
  nauseaVomiting: 'nausea_vomiting',
  feverChills: 'fever_chills',
  cough: 'cough',
  dizzinessGiddiness: 'dizziness_giddiness',
  muscleCramps: 'muscle_cramps',
  itching: 'itching',
  headache: 'headache',
  bleedingBruising: 'bleeding_bruising',
  lossOfAppetite: 'loss_of_appetite',
};

const OBJECTIVE_API_KEYS = {
  generalAppearance: 'general_appearance',
  consciousness: 'consciousness',
  edema: 'edema',
  hydrationStatus: 'hydration_status',
  skinCondition: 'skin_condition',
  jvp: 'jvp',
  lungSounds: 'lung_sounds',
  heartSounds: 'heart_sounds',
  abdomen: 'abdomen',
  anyAbnormalFinding: 'any_abnormal_finding',
  abnormalFindingDescription: 'abnormal_finding_description',
};

export const OPTIONAL_ASSESSMENT_FIELDS = [
  { key: 'nauseaVomiting', group: 'subjective', field_name: 'nausea_vomiting', label: 'Nausea / Vomiting' },
  { key: 'cough', group: 'subjective', field_name: 'cough', label: 'Cough' },
  { key: 'muscleCramps', group: 'subjective', field_name: 'muscle_cramps', label: 'Muscle Cramps' },
  { key: 'itching', group: 'subjective', field_name: 'itching', label: 'Itching' },
  { key: 'headache', group: 'subjective', field_name: 'headache', label: 'Headache' },
  { key: 'lossOfAppetite', group: 'subjective', field_name: 'loss_of_appetite', label: 'Loss of Appetite' },
  { key: 'generalAppearance', group: 'objective', field_name: 'general_appearance', label: 'General Appearance' },
  { key: 'edema', group: 'objective', field_name: 'edema', label: 'Edema' },
  { key: 'hydrationStatus', group: 'objective', field_name: 'hydration_status', label: 'Hydration Status' },
  { key: 'skinCondition', group: 'objective', field_name: 'skin_condition', label: 'Skin Condition' },
  { key: 'jvp', group: 'objective', field_name: 'jvp', label: 'JVP' },
  { key: 'abdomen', group: 'objective', field_name: 'abdomen', label: 'Abdomen' },
  { key: 'kps', group: 'functional', field_name: 'kps', label: 'KPS' },
  { key: 'assistiveSupport', group: 'functional', field_name: 'assistive_support', label: 'Assistive Support' },
];

function pickApiValue(row, camelKey, snakeKey) {
  if (!row) return '';
  const value = row[snakeKey] ?? row[camelKey];
  return value == null ? '' : String(value);
}

function assessmentFromApi(row) {
  if (!row) return null;
  const source = row.assessment_json && typeof row.assessment_json === 'object'
    ? row.assessment_json
    : row;
  const subjective = { ...EMPTY_SUBJECTIVE, symptomDetails: { ...(source.symptom_details || source.symptomDetails || {}) } };
  Object.entries(SUBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
    subjective[camel] = pickApiValue(source, camel, snake);
  });
  subjective.anyOtherSymptoms = pickApiValue(source, 'anyOtherSymptoms', 'any_other_symptoms');
  const objective = { ...EMPTY_OBJECTIVE };
  Object.entries(OBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
    objective[camel] = pickApiValue(source, camel, snake);
  });
  const support = source.assistive_support || source.assistiveSupport || {};
  return {
    subjective,
    objective,
    functional: {
      kps: pickApiValue(source, 'kps', 'kps'),
      assistiveSupport: {
        walker: Boolean(support.walker),
        wheelchair: Boolean(support.wheelchair),
        others: Boolean(support.others),
        none: Boolean(support.none),
      },
      assistiveOthersText: pickApiValue(source, 'assistiveOthersText', 'assistive_others_text'),
    },
  };
}

function mapKeyVitals(row) {
  if (!row) return null;
  const sys = liveValue(row.bp_systolic);
  const dia = liveValue(row.bp_diastolic);
  return {
    time: formatIst(row.recorded_at || row.updated_at),
    bp: sys !== MISSING && dia !== MISSING ? `${sys} / ${dia} mmHg` : MISSING,
    pulse: liveValue(row.pulse, ' bpm'),
    temperature: liveValue(row.temperature, ' °C'),
    spo2: liveValue(row.spo2, ' %'),
    weightPre: liveValue(row.weight_pre, ' kg'),
  };
}

function mapSessionNotes(payload) {
  const notes = [];
  unwrapList(payload).forEach((row, index) => {
    const time = formatIst(row.updated_at || row.recorded_at);
    [
      ['pre_dialysis_notes', 'Pre-dialysis'],
      ['during_dialysis_notes', 'During dialysis'],
      ['post_dialysis_notes', 'Post-dialysis'],
      ['note', 'Note'],
      ['notes', 'Note'],
    ].forEach(([key, label]) => {
      const text = row[key];
      if (text && String(text).trim()) {
        notes.push({
          id: `${row.id || index}-${key}`,
          label,
          text: String(text),
          time,
        });
      }
    });
  });
  return notes;
}

function optionalFieldValue(field, subjective, objective, functional) {
  if (field.group === 'subjective') return subjective[field.key];
  if (field.group === 'objective') return objective[field.key];
  if (field.key === 'kps') return functional.kps;
  if (field.key === 'assistiveSupport') {
    const support = functional.assistiveSupport || {};
    return support.walker || support.wheelchair || support.others || support.none ? 'set' : '';
  }
  return functional[field.key];
}

function hasSavedAssessment(row) {
  const json = row?.assessment_json;
  if (!json || typeof json !== 'object' || Array.isArray(json)) return false;
  return Object.keys(json).length > 0;
}

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

export default function usePatientAssessment(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [keyVitals, setKeyVitals] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assessmentTime, setAssessmentTime] = useState(MISSING);

  const [subjective, setSubjective] = useState({ ...EMPTY_SUBJECTIVE, symptomDetails: {} });
  const [objective, setObjective] = useState({ ...EMPTY_OBJECTIVE });
  const [functional, setFunctional] = useState({
    ...EMPTY_FUNCTIONAL,
    assistiveSupport: { ...EMPTY_FUNCTIONAL.assistiveSupport },
  });

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skippedFieldsList, setSkippedFieldsList] = useState([]);
  const [skipReasons, setSkipReasons] = useState({});

  const applySaved = useCallback((saved) => {
    if (!saved) return;
    setSubjective({ ...EMPTY_SUBJECTIVE, ...saved.subjective, symptomDetails: { ...(saved.subjective?.symptomDetails || {}) } });
    setObjective({ ...EMPTY_OBJECTIVE, ...saved.objective });
    setFunctional({
      ...EMPTY_FUNCTIONAL,
      ...saved.functional,
      assistiveSupport: {
        ...EMPTY_FUNCTIONAL.assistiveSupport,
        ...(saved.functional?.assistiveSupport || {}),
      },
    });
  }, []);

  const loadAssessmentData = useCallback(async () => {
    if (!activeSessionId) {
      setLoading(false);
      setError('No dialysis session id. Return to Sessions and drag the patient to a bed again.');
      return;
    }
    if (!patientId) {
      setLoading(false);
      setError('No patient id for this session.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [patientRes, assessmentRes, alertsRes, vitalsRes, notesRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getSessionAssessment(activeSessionId),
        getPatientAlerts(patientId),
        getPatientLatestVitals(patientId),
        getPatientNotes(patientId),
        loadP2Draft(activeSessionId, 'P2-06'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }

      setPatientRaw(unwrapRecord(patientRes.data, ['patient']) || patientRes.data);

      const savedRow = assessmentRes?.success ? assessmentRes.data?.assessment : null;
      const savedAssessment = hasSavedAssessment(savedRow) ? assessmentFromApi(savedRow) : null;
      if (savedAssessment) {
        applySaved(savedAssessment);
        setAssessmentTime(formatIst(savedRow?.recorded_at) || formatIst(new Date()));
      } else if (draft?.payload && typeof draft.payload === 'object') {
        applySaved(draft.payload);
        if (Array.isArray(draft.payload.skippedFieldsList)) {
          setSkippedFieldsList(draft.payload.skippedFieldsList);
        }
        if (draft.payload.skipReasons && typeof draft.payload.skipReasons === 'object') {
          setSkipReasons(draft.payload.skipReasons);
        }
        setAssessmentTime(formatIst(draft.savedAt) || formatIst(new Date()));
      } else {
        setSubjective({ ...EMPTY_SUBJECTIVE, symptomDetails: {} });
        setObjective({ ...EMPTY_OBJECTIVE });
        setFunctional({
          ...EMPTY_FUNCTIONAL,
          assistiveSupport: { ...EMPTY_FUNCTIONAL.assistiveSupport },
        });
        setAssessmentTime(formatIst(new Date()));
      }

      setAlerts(alertsRes?.success ? normalizeAlertsList(alertsRes.data) : []);

      const vitalsPayload = vitalsRes?.success && vitalsRes.data?.vitals && typeof vitalsRes.data.vitals === 'object'
        ? vitalsRes.data.vitals
        : null;
      const vitalsBelongToThisSession = Boolean(
        vitalsPayload
        && vitalsPayload.session_id != null
        && String(vitalsPayload.session_id) === String(activeSessionId)
      );
      setKeyVitals(vitalsBelongToThisSession ? mapKeyVitals(vitalsPayload) : null);
      setNotes(notesRes?.success ? mapSessionNotes(notesRes.data) : []);
    } catch (err) {
      const errMsg = err?.message || 'Failed to load patient assessment data';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, patientId, applySaved]);

  useEffect(() => {
    loadAssessmentData();
  }, [loadAssessmentData]);

  const updateSubjectiveSymptom = (key, value) => {
    setSubjective((prev) => ({
      ...prev,
      [key]: key === 'anyOtherSymptoms' ? String(value).slice(0, 200) : value,
    }));
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
      [key]: key === 'abnormalFindingDescription' ? String(value).slice(0, 300) : value,
    }));
  };

  const updateFunctionalField = (key, value) => {
    setFunctional((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleAssistiveSupport = (key) => {
    setFunctional((prev) => {
      const next = { ...prev.assistiveSupport, [key]: !prev.assistiveSupport[key] };
      if (key === 'none' && next.none) {
        next.walker = false;
        next.wheelchair = false;
        next.others = false;
      } else if (key !== 'none' && next[key]) {
        next.none = false;
      }
      return { ...prev, assistiveSupport: next };
    });
  };

  const canProceed = useMemo(
    () => validateAssessmentState(subjective, objective),
    [subjective, objective]
  );

  const checkSkippedNonMandatory = () => OPTIONAL_ASSESSMENT_FIELDS
    .filter((field) => {
      const value = optionalFieldValue(field, subjective, objective, functional);
      return value === '' || value === null || value === undefined;
    })
    .map((field) => field.label);

  const persistLocalDraft = useCallback(async (extra = {}) => {
    if (!activeSessionId) return;
    await saveP2Draft(activeSessionId, 'P2-06', {
      subjective,
      objective,
      functional,
      skippedFieldsList,
      skipReasons,
      ...extra,
    });
  }, [activeSessionId, subjective, objective, functional, skippedFieldsList, skipReasons]);

  const buildPayload = useCallback((status, skips = []) => {
    const assessment = {
      any_other_symptoms: subjective.anyOtherSymptoms || '',
      symptom_details: subjective.symptomDetails || {},
      kps: functional.kps || '',
      assistive_support: functional.assistiveSupport,
      assistive_others_text: functional.assistiveOthersText || '',
    };
    Object.entries(SUBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
      assessment[snake] = subjective[camel] || '';
    });
    Object.entries(OBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
      assessment[snake] = objective[camel] || '';
    });
    return {
      status,
      section: 'Patient Assessment',
      assessment,
      skips: skips.map((skip) => ({
        field_name: skip.field_name || skip,
        reason: skip.reason || null,
      })),
    };
  }, [subjective, objective, functional]);

  const saveDraft = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to save this draft against.');
      return false;
    }
    setSaving(true);
    try {
      await persistLocalDraft();
      const res = await submitSessionAssessment(activeSessionId, buildPayload('draft'));
      if (!res?.success) {
        notifyError(res?.message || 'Could not save assessment draft');
        return false;
      }
      notifySuccess('Draft saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save assessment draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, persistLocalDraft, buildPayload]);

  const submitFinal = useCallback(async (skips = []) => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      const res = await submitSessionAssessment(activeSessionId, buildPayload('final', skips));
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Assessment could not be saved');
        return false;
      }
      await persistLocalDraft({ skippedFieldsList: skips.map((skip) => skip.field_name || skip) });
      notifySuccess('Patient Assessment saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Assessment could not be saved');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, buildPayload, persistLocalDraft]);

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
    alerts,
    keyVitals,
    notes,
    assessmentTime,
    loading,
    saving,
    error,
    refresh: loadAssessmentData,
    saveDraft,
    submitFinal,
  };
}
