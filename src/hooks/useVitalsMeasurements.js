/**
 * useVitalsMeasurements — P2-05 Vitals & Measurements Hook
 *
 * Manages form state, auto-calculations (BMI, Weight Gain, MAP, UF Goal),
 * threshold evaluation (Normal, Warning, Critical), and progression gating for P2-05.
 *
 * @file src/hooks/useVitalsMeasurements.js
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getPatientDetails,
  getPatientLatestVitals,
  getPatientAlerts,
  getPatientLatestPrescription,
  submitSessionVitals,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { getVitalsThresholds, getUfThresholds } from '../config/vitalsThresholds';
import { normalizeAlertsList } from './usePreDialysisDashboard';
import { liveValue, MISSING, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';

export const VITAL_SEVERITY = {
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

export const OPTIONAL_VITAL_FIELDS = [
  { key: 'respRate', field_name: 'respiratory_rate', label: 'Respiratory Rate' },
  { key: 'height', field_name: 'height_cm', label: 'Height' },
  { key: 'painScore', field_name: 'pain_score', label: 'Pain Score' },
  { key: 'glucose', field_name: 'glucose', label: 'Glucose' },
];

const EMPTY_FORM = {
  measurementTime: '',
  systolic: '',
  diastolic: '',
  pulse: '',
  temperature: '',
  respRate: '',
  spo2: '',
  weightPre: '',
  height: '',
  painScore: '',
  glucose: '',
  lastPostWeight: '',
  lastPostWeightAt: '',
  edw: '',
  notes: '',
  ktvChecked: false,
  preDialysisBun: '',
};

function asInput(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  return String(value);
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function pickEdw(patient, prescription) {
  const sources = [
    patient?.dry_weight,
    patient?.dryWeight,
    patient?.edw,
    patient?.target_weight,
    prescription?.edw,
    prescription?.target_weight,
    prescription?.dry_weight,
    prescription?.dryWeight,
  ];
  for (const value of sources) {
    const n = optionalNumber(value);
    if (n != null) return String(n);
  }
  return '';
}

function pickLastPostWeight(patient, previousVitals) {
  const sources = [
    patient?.post_weight_kg,
    patient?.post_weight,
    patient?.last_post_weight,
    previousVitals?.weight_post,
    previousVitals?.post_weight,
    previousVitals?.post_weight_kg,
  ];
  for (const value of sources) {
    const n = optionalNumber(value);
    if (n != null) return String(n);
  }
  return '';
}

function vitalsFromRow(row) {
  if (!row) return {};
  return {
    systolic: asInput(row.bp_systolic),
    diastolic: asInput(row.bp_diastolic),
    pulse: asInput(row.pulse),
    temperature: asInput(row.temperature),
    respRate: asInput(row.respiratory_rate ?? row.respiration),
    spo2: asInput(row.spo2),
    weightPre: asInput(row.weight_pre),
    height: asInput(row.height_cm),
    painScore: row.pain_score === null || row.pain_score === undefined ? '' : Number(row.pain_score),
    glucose: asInput(row.glucose),
    edw: asInput(row.edw),
    notes: row.notes ? String(row.notes) : '',
    ktvChecked: Boolean(row.kt_v_assessment_flag),
    preDialysisBun: asInput(row.pre_dialysis_bun),
  };
}

function mapPreviousVitals(row) {
  if (!row) return null;
  const sys = liveValue(row.bp_systolic);
  const dia = liveValue(row.bp_diastolic);
  return {
    date: formatIst(row.recorded_at || row.updated_at || row.created_at),
    bp: sys !== MISSING && dia !== MISSING ? `${sys} / ${dia} mmHg` : MISSING,
    pulse: liveValue(row.pulse, ' bpm'),
    temperature: liveValue(row.temperature, ' °C'),
    weightPre: liveValue(row.weight_pre, ' kg'),
  };
}

export const calculateWeightGain = (weightPre, lastPostWeight) => {
  const wPre = parseFloat(weightPre);
  const wPost = parseFloat(lastPostWeight);
  if (Number.isNaN(wPre) || Number.isNaN(wPost)) return '0.0';
  const diff = wPre - wPost;
  return diff >= 0 ? diff.toFixed(1) : '0.0';
};

export const calculateBMI = (weight, heightCm) => {
  const w = parseFloat(weight);
  const h = parseFloat(heightCm);
  if (Number.isNaN(w) || Number.isNaN(h) || h <= 0) return '0.0';
  const hMeters = h / 100;
  const bmi = w / (hMeters * hMeters);
  return bmi.toFixed(1);
};

export const calculateMAP = (systolic, diastolic) => {
  const sys = parseFloat(systolic);
  const dia = parseFloat(diastolic);
  if (Number.isNaN(sys) || Number.isNaN(dia)) return 0;
  return Math.round((sys + 2 * dia) / 3);
};

export const calculateUFGoal = (weightPre, edw, fluidAllowance = 0.5) => {
  const wPre = parseFloat(weightPre);
  const dryW = parseFloat(edw);
  if (Number.isNaN(wPre) || Number.isNaN(dryW)) return '0.0';
  const netUf = wPre - dryW;
  const goal = netUf + fluidAllowance;
  return goal >= 0 ? goal.toFixed(1) : '0.0';
};

export const evaluateBp = (systolic, diastolic) => {
  const sys = parseFloat(systolic);
  const dia = parseFloat(diastolic);
  if (Number.isNaN(sys) || Number.isNaN(dia)) {
    return { severity: VITAL_SEVERITY.NORMAL, label: 'Target: < 140/90' };
  }
  const t = getVitalsThresholds();
  const sysCrit = sys < t.systolic.criticalLow || sys > t.systolic.criticalHigh;
  const diaCrit = dia < t.diastolic.criticalLow || dia > t.diastolic.criticalHigh;
  if (sysCrit || diaCrit) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical' };
  const sysWarn = (sys >= t.systolic.warningLow[0] && sys <= t.systolic.warningLow[1]) || (sys >= t.systolic.warningHigh[0] && sys <= t.systolic.warningHigh[1]);
  const diaWarn = (dia >= t.diastolic.warningLow[0] && dia <= t.diastolic.warningLow[1]) || (dia >= t.diastolic.warningHigh[0] && dia <= t.diastolic.warningHigh[1]);
  if (sysWarn || diaWarn) return { severity: VITAL_SEVERITY.WARNING, label: sys >= t.systolic.warningHigh[0] || dia >= t.diastolic.warningHigh[0] ? 'High' : 'Low' };
  if (sys >= 140 || dia >= 90 || sys < 100) {
    return { severity: VITAL_SEVERITY.WARNING, label: sys >= 140 || dia >= 90 ? 'High' : 'Low' };
  }
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (Target: < 140/90)' };
};

export const evaluatePulse = (pulse) => {
  const p = parseFloat(pulse);
  if (Number.isNaN(p)) return { severity: VITAL_SEVERITY.NORMAL, label: '60–100 bpm' };
  const t = getVitalsThresholds().pulse;
  if (p < t.criticalLow || p > t.criticalHigh) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical' };
  if ((p >= t.warningLow[0] && p <= t.warningLow[1]) || (p >= t.warningHigh[0] && p <= t.warningHigh[1])) return { severity: VITAL_SEVERITY.WARNING, label: p > 100 ? 'High' : 'Low' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (60–100 bpm)' };
};

export const evaluateTemp = (temp) => {
  const v = parseFloat(temp);
  if (Number.isNaN(v)) return { severity: VITAL_SEVERITY.NORMAL, label: '36.0–37.5 °C' };
  const t = getVitalsThresholds().temperature;
  if (v < t.criticalLow || v > t.criticalHigh) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical' };
  if ((v >= t.warningLow[0] && v <= t.warningLow[1]) || (v >= t.warningHigh[0] && v <= t.warningHigh[1])) return { severity: VITAL_SEVERITY.WARNING, label: v > 37.5 ? 'High' : 'Low' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (36.0–37.5 °C)' };
};

export const evaluateSpo2 = (spo2) => {
  const s = parseFloat(spo2);
  if (Number.isNaN(s)) return { severity: VITAL_SEVERITY.NORMAL, label: '≥ 95%' };
  const t = getVitalsThresholds().spo2;
  if (s < t.criticalLow) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical (< 90%)' };
  if (s >= t.warning[0] && s <= t.warning[1]) return { severity: VITAL_SEVERITY.WARNING, label: 'Low (90–94%)' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (≥ 95%)' };
};

export const evaluateRespRate = (resp) => {
  const r = parseFloat(resp);
  if (Number.isNaN(r)) return { severity: VITAL_SEVERITY.NORMAL, label: '12–20 /min' };
  const t = getVitalsThresholds().respiration;
  if (r < t.criticalLow || r > t.criticalHigh) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical' };
  if ((r >= t.warningLow[0] && r <= t.warningLow[1]) || (r >= t.warningHigh[0] && r <= t.warningHigh[1])) return { severity: VITAL_SEVERITY.WARNING, label: 'Warning' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (12–20 /min)' };
};

export const evaluateGlucose = (glucose) => {
  const g = parseFloat(glucose);
  if (Number.isNaN(g)) return { severity: VITAL_SEVERITY.NORMAL, label: '70–140 mg/dL' };
  if (g < 70 || g > 140) return { severity: VITAL_SEVERITY.WARNING, label: g > 140 ? 'High' : 'Low' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (70–140 mg/dL)' };
};

export const evaluateUfRate = (ufRate) => {
  const v = parseFloat(ufRate);
  if (Number.isNaN(v)) return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal' };
  const t = getUfThresholds();
  if (v >= t.critical) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical ≥13 mL/kg/hr (hard block)' };
  if (v >= t.warning) return { severity: VITAL_SEVERITY.WARNING, label: 'Warning ≥10 mL/kg/hr' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal' };
};

function highestSeverity(severities) {
  if (severities.includes(VITAL_SEVERITY.CRITICAL)) return VITAL_SEVERITY.CRITICAL;
  if (severities.includes(VITAL_SEVERITY.WARNING)) return VITAL_SEVERITY.WARNING;
  return VITAL_SEVERITY.NORMAL;
}

export default function useVitalsMeasurements(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [previousVitals, setPreviousVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skippedFieldsList, setSkippedFieldsList] = useState([]);
  const [skipReasons, setSkipReasons] = useState({});

  const loadVitalsData = useCallback(async () => {
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
      const [patientRes, vitalsRes, alertsRes, rxRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getPatientLatestVitals(patientId),
        getPatientAlerts(patientId),
        getPatientLatestPrescription(patientId),
        loadP2Draft(activeSessionId, 'P2-05'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }

      const patientData = unwrapRecord(patientRes.data, ['patient']) || patientRes.data;
      setPatientRaw(patientData);

      const vitalsPayload = vitalsRes?.success && vitalsRes.data?.vitals && typeof vitalsRes.data.vitals === 'object'
        ? vitalsRes.data.vitals
        : null;
      const vitalsBelongToThisSession = Boolean(
        vitalsPayload
        && vitalsPayload.session_id != null
        && String(vitalsPayload.session_id) === String(activeSessionId)
      );

      const previousRow = vitalsBelongToThisSession ? null : vitalsPayload;
      setPreviousVitals(mapPreviousVitals(previousRow));
      setAlerts(alertsRes?.success ? normalizeAlertsList(alertsRes.data) : []);

      const prescription = rxRes?.success
        ? (rxRes.data?.prescription || unwrapRecord(rxRes.data, ['prescription']))
        : null;
      const nextForm = {
        ...EMPTY_FORM,
        measurementTime: formatIst(new Date()),
        edw: pickEdw(patientData, prescription),
        lastPostWeight: pickLastPostWeight(patientData, previousRow),
        lastPostWeightAt: previousRow?.recorded_at || patientData?.last_dialysis_date || '',
        ...(vitalsBelongToThisSession ? vitalsFromRow(vitalsPayload) : {}),
      };

      if (draft?.payload && typeof draft.payload === 'object') {
        Object.assign(nextForm, draft.payload);
      }

      setFormState(nextForm);
    } catch (err) {
      const errMsg = err?.message || 'Failed to load pre-dialysis vitals data';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, patientId]);

  useEffect(() => {
    loadVitalsData();
  }, [loadVitalsData]);

  const weightGain = useMemo(() => {
    if (!formState.weightPre || !formState.lastPostWeight) return MISSING;
    return calculateWeightGain(formState.weightPre, formState.lastPostWeight);
  }, [formState.weightPre, formState.lastPostWeight]);

  const bmi = useMemo(() => {
    if (!formState.weightPre || !formState.height) return MISSING;
    return calculateBMI(formState.weightPre, formState.height);
  }, [formState.weightPre, formState.height]);

  const map = useMemo(() => {
    if (!formState.systolic || !formState.diastolic) return MISSING;
    return String(calculateMAP(formState.systolic, formState.diastolic));
  }, [formState.systolic, formState.diastolic]);

  const ufGoal = useMemo(() => {
    if (!formState.weightPre || !formState.edw) return MISSING;
    return calculateUFGoal(formState.weightPre, formState.edw, 0);
  }, [formState.weightPre, formState.edw]);

  const bpEval = useMemo(
    () => evaluateBp(formState.systolic, formState.diastolic),
    [formState.systolic, formState.diastolic]
  );
  const pulseEval = useMemo(() => evaluatePulse(formState.pulse), [formState.pulse]);
  const tempEval = useMemo(() => evaluateTemp(formState.temperature), [formState.temperature]);
  const spo2Eval = useMemo(() => evaluateSpo2(formState.spo2), [formState.spo2]);
  const respEval = useMemo(() => evaluateRespRate(formState.respRate), [formState.respRate]);
  const glucoseEval = useMemo(() => evaluateGlucose(formState.glucose), [formState.glucose]);

  const formSeverity = useMemo(
    () => highestSeverity([
      bpEval.severity,
      pulseEval.severity,
      tempEval.severity,
      spo2Eval.severity,
      formState.respRate ? respEval.severity : VITAL_SEVERITY.NORMAL,
      formState.glucose ? glucoseEval.severity : VITAL_SEVERITY.NORMAL,
    ]),
    [bpEval, pulseEval, tempEval, spo2Eval, respEval, glucoseEval, formState.respRate, formState.glucose]
  );

  const updateField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const mandatoryFilled = Boolean(
    formState.systolic &&
    formState.diastolic &&
    formState.pulse &&
    formState.temperature &&
    formState.spo2 &&
    formState.weightPre &&
    formState.edw &&
    (!formState.ktvChecked || formState.preDialysisBun)
  );

  const canProceed = mandatoryFilled && formSeverity !== VITAL_SEVERITY.CRITICAL;

  const checkSkippedNonMandatory = () => OPTIONAL_VITAL_FIELDS
    .filter((field) => formState[field.key] === '' || formState[field.key] === null || formState[field.key] === undefined)
    .map((field) => field.label);

  const buildPayload = useCallback((status, skips = []) => {
    const payload = {
      status,
      bp_systolic: optionalNumber(formState.systolic),
      bp_diastolic: optionalNumber(formState.diastolic),
      pulse: optionalNumber(formState.pulse),
      temperature: optionalNumber(formState.temperature),
      spo2: optionalNumber(formState.spo2),
      weight_pre: optionalNumber(formState.weightPre),
      edw: optionalNumber(formState.edw),
      respiratory_rate: optionalNumber(formState.respRate),
      height_cm: optionalNumber(formState.height),
      pain_score: optionalNumber(formState.painScore),
      glucose: optionalNumber(formState.glucose),
      notes: formState.notes ? String(formState.notes).slice(0, 200) : '',
      kt_v_assessment_flag: Boolean(formState.ktvChecked),
      pre_dialysis_bun: formState.ktvChecked ? optionalNumber(formState.preDialysisBun) : undefined,
      skips,
    };
    if (weightGain !== MISSING) payload.weight_gain = optionalNumber(weightGain);
    return payload;
  }, [formState, weightGain]);

  const saveDraft = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to save this draft against.');
      return false;
    }
    setSaving(true);
    try {
      await saveP2Draft(activeSessionId, 'P2-05', formState);
      const res = await submitSessionVitals(activeSessionId, buildPayload('draft'));
      if (!res?.success) {
        notifyError(res?.message || 'Could not save vitals draft');
        return false;
      }
      notifySuccess('Draft saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save vitals draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, formState, buildPayload]);

  const submitFinal = useCallback(async (skips = []) => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      const res = await submitSessionVitals(activeSessionId, buildPayload('final', skips));
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Vitals could not be saved');
        return false;
      }
      await saveP2Draft(activeSessionId, 'P2-05', formState);
      notifySuccess('Vitals saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Vitals could not be saved');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, buildPayload, formState]);

  return {
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
    respEval,
    glucoseEval,
    formSeverity,
    canProceed,
    mandatoryFilled,
    showSkipModal,
    setShowSkipModal,
    skippedFieldsList,
    setSkippedFieldsList,
    skipReasons,
    setSkipReasons,
    checkSkippedNonMandatory,
    alerts,
    previousVitals,
    loading,
    saving,
    error,
    refresh: loadVitalsData,
    saveDraft,
    submitFinal,
  };
}
