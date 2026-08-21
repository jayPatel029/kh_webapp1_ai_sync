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
  submitSessionVitals,
} from '../ApiCalls/preDialysisApis';
import { getPatientById, getHemoDialysisParameters } from '../ApiCalls';
import { formatDate } from './usePatientSummary';
import { notifyError } from '../helpers/notify';
import { getVitalsThresholds, getUfThresholds } from '../config/vitalsThresholds';

// ---------------------------------------------------------------------------
// Constants & Threshold Enums
// ---------------------------------------------------------------------------

export const VITAL_SEVERITY = {
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

// ---------------------------------------------------------------------------
// Pure Calculation Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate Weight Gain (kg) = Weight (Pre) - Last Post Weight
 */
export const calculateWeightGain = (weightPre, lastPostWeight) => {
  const wPre = parseFloat(weightPre);
  const wPost = parseFloat(lastPostWeight);
  if (Number.isNaN(wPre) || Number.isNaN(wPost)) return '0.0';
  const diff = wPre - wPost;
  return diff >= 0 ? diff.toFixed(1) : '0.0';
};

/**
 * Calculate BMI (kg/m²) = Weight (kg) / (Height (m))^2
 */
export const calculateBMI = (weight, heightCm) => {
  const w = parseFloat(weight);
  const h = parseFloat(heightCm);
  if (Number.isNaN(w) || Number.isNaN(h) || h <= 0) return '0.0';
  const hMeters = h / 100;
  const bmi = w / (hMeters * hMeters);
  return bmi.toFixed(1);
};

/**
 * Calculate Pre-Dialysis MAP (mmHg) = (Systolic + 2 * Diastolic) / 3
 */
export const calculateMAP = (systolic, diastolic) => {
  const sys = parseFloat(systolic);
  const dia = parseFloat(diastolic);
  if (Number.isNaN(sys) || Number.isNaN(dia)) return 0;
  return Math.round((sys + 2 * dia) / 3);
};

/**
 * Calculate UF Goal (L) = (Weight Pre - EDW) + Heparin/Saline Allowance (default 0.5 L)
 */
export const calculateUFGoal = (weightPre, edw, fluidAllowance = 0.5) => {
  const wPre = parseFloat(weightPre);
  const dryW = parseFloat(edw);
  if (Number.isNaN(wPre) || Number.isNaN(dryW)) return '0.0';
  const netUf = wPre - dryW;
  const goal = netUf + fluidAllowance;
  return goal >= 0 ? goal.toFixed(1) : '0.0';
};

// ---------------------------------------------------------------------------
// Clinical Threshold Evaluators — admin-configurable via src/config/vitalsThresholds.js
// Resolved per Change Requirements #6: literature-backed defaults, editable by admin.
// ---------------------------------------------------------------------------

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
  if (Number.isNaN(r)) return { severity: VITAL_SEVERITY.NORMAL, label: '12–20 bpm' };
  const t = getVitalsThresholds().respiration;
  if (r < t.criticalLow || r > t.criticalHigh) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical' };
  if ((r >= t.warningLow[0] && r <= t.warningLow[1]) || (r >= t.warningHigh[0] && r <= t.warningHigh[1])) return { severity: VITAL_SEVERITY.WARNING, label: 'Warning' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal (12–20 bpm)' };
};

export const evaluateUfRate = (ufRate) => {
  const v = parseFloat(ufRate);
  if (Number.isNaN(v)) return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal' };
  const t = getUfThresholds();
  if (v >= t.critical) return { severity: VITAL_SEVERITY.CRITICAL, label: 'Critical ≥13 mL/kg/hr (hard block)' };
  if (v >= t.warning) return { severity: VITAL_SEVERITY.WARNING, label: 'Warning ≥10 mL/kg/hr' };
  return { severity: VITAL_SEVERITY.NORMAL, label: 'Normal' };
};

// ---------------------------------------------------------------------------
// Hook Definition
// ---------------------------------------------------------------------------

export default function useVitalsMeasurements(patientId) {
  const [patientRaw, setPatientRaw] = useState(null);
  const [prescriptionRaw, setPrescriptionRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    measurementTime: '26 May 2025, 06:42 AM',
    systolic: '138',
    diastolic: '82',
    pulse: '78',
    temperature: '36.8',
    respRate: '18',
    spo2: '98',
    weightPre: '68.5',
    height: '170',
    painScore: 2,
    glucose: '124',
    lastPostWeight: '67.0',
    edw: '67.0',
    notes: '',
    ktvChecked: false,
    preDialysisBun: '',
  });

  // Skip modal state for non-mandatory fields
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skippedFieldsList, setSkippedFieldsList] = useState([]);
  const [skipReasons, setSkipReasons] = useState({});

  // Fetch patient and prescription data
  const loadVitalsData = useCallback(async () => {
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
        const raw = patientRes.data;
        patientData = raw?.patient || raw?.data?.patient || raw?.data || raw || {};
      } else {
        patientData = { id: patientId };
      }

      setPatientRaw(patientData);

      try {
        const rxRes = await getHemoDialysisParameters(patientId);
        if (rxRes?.success) {
          const rxData = Array.isArray(rxRes.data) ? rxRes.data[0] : rxRes.data;
          setPrescriptionRaw(rxData);
          if (rxData?.target_weight || rxData?.edw) {
            setFormState((prev) => ({
              ...prev,
              edw: String(rxData.target_weight || rxData.edw),
            }));
          }
        }
      } catch (_) {}
    } catch (err) {
      const errMsg = err?.message || 'Failed to load pre-dialysis vitals data';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadVitalsData();
  }, [loadVitalsData]);

  // Derived Calculations
  const weightGain = useMemo(
    () => calculateWeightGain(formState.weightPre, formState.lastPostWeight),
    [formState.weightPre, formState.lastPostWeight]
  );

  const bmi = useMemo(
    () => calculateBMI(formState.weightPre, formState.height),
    [formState.weightPre, formState.height]
  );

  const map = useMemo(
    () => calculateMAP(formState.systolic, formState.diastolic),
    [formState.systolic, formState.diastolic]
  );

  const ufGoal = useMemo(
    () => calculateUFGoal(formState.weightPre, formState.edw),
    [formState.weightPre, formState.edw]
  );

  // Derived Threshold Evaluators
  const bpEval = useMemo(
    () => evaluateBp(formState.systolic, formState.diastolic),
    [formState.systolic, formState.diastolic]
  );

  const pulseEval = useMemo(
    () => evaluatePulse(formState.pulse),
    [formState.pulse]
  );

  const tempEval = useMemo(
    () => evaluateTemp(formState.temperature),
    [formState.temperature]
  );

  const spo2Eval = useMemo(
    () => evaluateSpo2(formState.spo2),
    [formState.spo2]
  );

  // Overall form clinical severity tier
  const formSeverity = useMemo(() => {
    if (
      bpEval.severity === VITAL_SEVERITY.CRITICAL ||
      pulseEval.severity === VITAL_SEVERITY.CRITICAL ||
      tempEval.severity === VITAL_SEVERITY.CRITICAL ||
      spo2Eval.severity === VITAL_SEVERITY.CRITICAL
    ) {
      return VITAL_SEVERITY.CRITICAL;
    }
    if (
      bpEval.severity === VITAL_SEVERITY.WARNING ||
      pulseEval.severity === VITAL_SEVERITY.WARNING ||
      tempEval.severity === VITAL_SEVERITY.WARNING ||
      spo2Eval.severity === VITAL_SEVERITY.WARNING
    ) {
      return VITAL_SEVERITY.WARNING;
    }
    return VITAL_SEVERITY.NORMAL;
  }, [bpEval, pulseEval, tempEval, spo2Eval]);

  // Form field update handler
  const updateField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mandatory fields check
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

  // Critical tier blocks proceed
  const canProceed = mandatoryFilled && formSeverity !== VITAL_SEVERITY.CRITICAL;

  // Check skipped non-mandatory fields
  const checkSkippedNonMandatory = () => {
    const skipped = [];
    if (!formState.respRate) skipped.push('Respiratory Rate');
    if (!formState.height) skipped.push('Height');
    if (formState.painScore === null || formState.painScore === undefined) skipped.push('Pain Score');
    if (!formState.glucose) skipped.push('Glucose');
    return skipped;
  };

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
    refresh: loadVitalsData,
  };
}
