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

/** v5 PC-1 objective dropdown option lists. */
export const OBJECTIVE_OPTIONS = {
  generalAppearance: ['Alert', 'Well-appearing', 'Distressed', 'Lethargic', 'Uncomfortable', 'Other'],
  consciousness: ['Alert', 'Oriented', 'Confused', 'Lethargic', 'Unresponsive'],
  edema: ['None', 'Mild (1+)', 'Moderate (2+)', 'Moderate-Severe (3+)', 'Severe (4+)'],
  hydrationStatus: ['Euvolemic', 'Hypovolemic/Dehydrated', 'Hypervolemic/Fluid Overloaded'],
  skinCondition: ['Normal', 'Pale', 'Cyanotic', 'Jaundiced', 'Dry', 'Diaphoretic', 'Rash/Lesions Present', 'Other'],
  jvp: ['Normal', 'Elevated', 'Not Assessable'],
  lungSounds: ['Clear', 'Crackles/Rales', 'Wheezes', 'Diminished', 'Absent', 'Rhonchi'],
  heartSounds: ['Normal (S1/S2)', 'Murmur', 'Irregular Rhythm', 'Muffled/Distant', 'Other'],
  abdomen: ['Soft/Non-tender', 'Distended', 'Tender', 'Rigid', 'Other'],
};

/** Critical fields for Missing Critical Reading popup (v5 D8). */
export const CRITICAL_ASSESSMENT_FIELDS = [
  { key: 'shortnessOfBreath', field_name: 'shortness_of_breath', label: 'Shortness of Breath', group: 'subjective', inputType: 'yn' },
  { key: 'chestPain', field_name: 'chest_pain', label: 'Chest Pain', group: 'subjective', inputType: 'yn' },
  { key: 'feverChills', field_name: 'fever_chills', label: 'Fever / Chills', group: 'subjective', inputType: 'yn' },
  { key: 'dizzinessGiddiness', field_name: 'dizziness_giddiness', label: 'Dizziness / Giddiness', group: 'subjective', inputType: 'yn' },
  { key: 'bleedingBruising', field_name: 'bleeding_bruising', label: 'Bleeding / Bruising', group: 'subjective', inputType: 'yn' },
  { key: 'consciousness', field_name: 'consciousness', label: 'Consciousness', group: 'objective', inputType: 'select', options: OBJECTIVE_OPTIONS.consciousness },
  { key: 'lungSounds', field_name: 'lung_sounds', label: 'Lung Sounds', group: 'objective', inputType: 'select', options: OBJECTIVE_OPTIONS.lungSounds },
  { key: 'heartSounds', field_name: 'heart_sounds', label: 'Heart Sounds', group: 'objective', inputType: 'select', options: OBJECTIVE_OPTIONS.heartSounds },
  { key: 'anyAbnormalFinding', field_name: 'any_abnormal_finding', label: 'Any Abnormal Finding', group: 'objective', inputType: 'yn' },
];

export const OBJECTIVE_OTHER_FIELDS = new Set([
  'generalAppearance',
  'skinCondition',
  'heartSounds',
  'abdomen',
]);

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
  /** Optional free-text when dropdown = Other (D54). */
  otherDetails: {},
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

/** Map stored yes/no (any casing) back to UI radio values. */
function normalizeYnUi(value) {
  if (value === true || value === 1) return 'Yes';
  if (value === false || value === 0) return 'No';
  const s = String(value == null ? '' : value).trim().toLowerCase();
  if (s === 'yes' || s === 'true' || s === '1') return 'Yes';
  if (s === 'no' || s === 'false' || s === '0') return 'No';
  return value == null || value === '' ? '' : String(value);
}

function normalizeSymptomDetails(raw = {}) {
  const reverse = Object.fromEntries(
    Object.entries(SUBJECTIVE_API_KEYS).map(([camel, snake]) => [snake, camel]),
  );
  const out = {};
  Object.entries(raw || {}).forEach(([key, value]) => {
    out[reverse[key] || key] = value == null ? '' : String(value);
  });
  return out;
}

function assessmentFromApi(row) {
  if (!row) return null;
  const source = row.assessment_json && typeof row.assessment_json === 'object'
    ? row.assessment_json
    : row;
  const subjective = {
    ...EMPTY_SUBJECTIVE,
    symptomDetails: normalizeSymptomDetails(source.symptom_details || source.symptomDetails || {}),
  };
  Object.entries(SUBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
    subjective[camel] = normalizeYnUi(pickApiValue(source, camel, snake));
  });
  subjective.anyOtherSymptoms = pickApiValue(source, 'anyOtherSymptoms', 'any_other_symptoms');
  const objective = { ...EMPTY_OBJECTIVE, otherDetails: {} };
  Object.entries(OBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
    const raw = pickApiValue(source, camel, snake);
    objective[camel] = camel === 'anyAbnormalFinding' ? normalizeYnUi(raw) : raw;
  });
  const otherRaw = source.other_details || source.otherDetails || {};
  if (otherRaw && typeof otherRaw === 'object') {
    objective.otherDetails = { ...otherRaw };
  }
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
 * Soft gate for Save & Continue (v5 D8).
 * Blank Critical fields no longer block — Missing Critical Reading popup handles them.
 * Still require comments for answered Yes / Assistive Others qualifier.
 */
export const validateAssessmentState = (subjective, objective, functional = null) => {
  const allSubjective = [...CRITICAL_SUBJECTIVE_SYMPTOMS, ...NON_CRITICAL_SUBJECTIVE_SYMPTOMS];
  for (const symptom of allSubjective) {
    const val = subjective[symptom];
    if (String(val).toLowerCase() === 'yes') {
      const detail = subjective.symptomDetails?.[symptom];
      if (!detail || !String(detail).trim()) return false;
    }
  }

  if (
    String(objective.anyAbnormalFinding).toLowerCase() === 'yes'
    && (!objective.abnormalFindingDescription || !String(objective.abnormalFindingDescription).trim())
  ) {
    return false;
  }

  if (functional?.assistiveSupport?.others) {
    if (!functional.assistiveOthersText || !String(functional.assistiveOthersText).trim()) {
      return false;
    }
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
    setObjective({
      ...EMPTY_OBJECTIVE,
      ...saved.objective,
      otherDetails: { ...(saved.objective?.otherDetails || {}) },
    });
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

  const updateObjectiveOtherDetail = (key, text) => {
    setObjective((prev) => ({
      ...prev,
      otherDetails: {
        ...(prev.otherDetails || {}),
        [key]: String(text || '').slice(0, 200),
      },
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
    () => validateAssessmentState(subjective, objective, functional),
    [subjective, objective, functional]
  );

  const blankCriticalFields = useMemo(() => (
    CRITICAL_ASSESSMENT_FIELDS.filter((field) => {
      const value = field.group === 'subjective' ? subjective[field.key] : objective[field.key];
      return value === '' || value === null || value === undefined;
    })
  ), [subjective, objective]);

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

  const buildPayload = useCallback((status, skips = [], criticalSkips = [], overrides = {}) => {
    const subj = { ...subjective, ...(overrides.subjective || {}) };
    if (overrides.subjective?.symptomDetails) {
      subj.symptomDetails = {
        ...(subjective.symptomDetails || {}),
        ...overrides.subjective.symptomDetails,
      };
    }
    const obj = {
      ...objective,
      ...(overrides.objective || {}),
      otherDetails: {
        ...(objective.otherDetails || {}),
        ...((overrides.objective && overrides.objective.otherDetails) || {}),
      },
    };
    const ynApi = (value) => {
      const s = String(value || '').trim().toLowerCase();
      if (s === 'yes') return 'yes';
      if (s === 'no') return 'no';
      return value || '';
    };
    const symptomDetails = {};
    Object.entries(subj.symptomDetails || {}).forEach(([camel, text]) => {
      const snake = SUBJECTIVE_API_KEYS[camel] || camel;
      if (text != null && String(text).trim() !== '') {
        symptomDetails[snake] = String(text).trim();
      }
    });
    const assessment = {
      any_other_symptoms: subj.anyOtherSymptoms || '',
      symptom_details: symptomDetails,
      kps: functional.kps || '',
      assistive_support: functional.assistiveSupport,
      assistive_others_text: functional.assistiveOthersText || '',
      other_details: obj.otherDetails || {},
    };
    Object.entries(SUBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
      assessment[snake] = ynApi(subj[camel]);
    });
    Object.entries(OBJECTIVE_API_KEYS).forEach(([camel, snake]) => {
      const raw = obj[camel] || '';
      assessment[snake] = camel === 'anyAbnormalFinding' ? ynApi(raw) : raw;
    });
    const allowedSkip = new Set(OPTIONAL_ASSESSMENT_FIELDS.map((f) => f.field_name));
    return {
      status,
      section: 'Patient Assessment',
      assessment,
      skips: skips
        .map((skip) => ({
          field_name: skip.field_name || skip,
          reason: skip.reason || null,
        }))
        .filter((skip) => allowedSkip.has(String(skip.field_name))),
      critical_skips: criticalSkips,
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

  const submitFinal = useCallback(async (skips = [], criticalSkips = [], overrides = {}) => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      if (overrides.subjective) {
        setSubjective((prev) => ({
          ...prev,
          ...overrides.subjective,
          symptomDetails: {
            ...(prev.symptomDetails || {}),
            ...(overrides.subjective.symptomDetails || {}),
          },
        }));
      }
      if (overrides.objective) {
        setObjective((prev) => ({
          ...prev,
          ...overrides.objective,
          otherDetails: {
            ...(prev.otherDetails || {}),
            ...(overrides.objective.otherDetails || {}),
          },
        }));
      }
      const res = await submitSessionAssessment(
        activeSessionId,
        buildPayload('final', skips, criticalSkips, overrides),
      );
      if (!res?.success) {
        const code = res?.error_code;
        const msg = res?.message
          || (code === 'ERR_COMMENT_REQUIRED' ? 'A Yes answer needs a comment before continuing.' : null)
          || (code === 'ERR_CRITICAL_FIELD_REQUIRED' ? 'Enter or Skip each Critical field in the popup.' : null)
          || code
          || 'Assessment could not be saved';
        notifyError(msg);
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
    updateObjectiveOtherDetail,
    updateFunctionalField,
    toggleAssistiveSupport,
    kpsDescription: getKpsDescription(functional.kps),
    canProceed,
    blankCriticalFields,
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
