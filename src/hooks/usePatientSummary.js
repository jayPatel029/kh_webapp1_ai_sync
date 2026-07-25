/**
 * usePatientSummary — P2-02 Patient Summary Data Hook
 *
 * Loads and normalizes patient data, prescription, vitals, labs, alerts,
 * and notes for the Patient Summary screen per the Part 2 spec.
 *
 * Data sources:
 *  - Patient: getPatientById()
 *  - Prescription: getHemoDialysisParameters()
 *  - Vitals/Labs/Alerts/Notes: derived from patient record fields
 *
 * The adapter layer is structured so swapping to dedicated endpoints
 * (e.g. GET /patients/{id}/prescriptions/latest) requires changes
 * only in the fetch* functions below.
 *
 * @file src/hooks/usePatientSummary.js
 */

import { useCallback, useState, useEffect } from 'react';
import { getPatientById } from '../ApiCalls/patientAPis';
import { getHemoDialysisParameters } from '../ApiCalls/dialysisSessionApis';
import { notifyError } from '../helpers/notify';
import { ALERT_SEVERITY } from '../pages/dialysis/dialysisQueueConstants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const calculateAge = (dobString) => {
  if (!dobString) return '—';
  const today = new Date();
  const birthDate = new Date(dobString);
  if (Number.isNaN(birthDate.getTime())) return '—';
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age < 0 ? 0 : age;
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Calculate duration since first dialysis in human-readable form.
 */
export const calcDialysisDuration = (firstDate) => {
  if (!firstDate) return '';
  const start = new Date(firstDate);
  if (Number.isNaN(start.getTime())) return '';
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth() + (years * 12);
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y > 0) parts.push(`${y}y`);
  if (m > 0) parts.push(`${m}m`);
  return parts.length ? `(${parts.join(' ')})` : '';
};

/**
 * Derive lab High/Low flags based on common clinical reference ranges.
 */
export const deriveLabFlag = (label, value) => {
  if (!value || value === '—') return '';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '';

  switch (label) {
    case 'Hemoglobin':
      return num < 12 ? 'Low' : '';
    case 'Potassium':
      return num > 5.0 ? 'High' : num < 3.5 ? 'Low' : '';
    case 'Urea':
      return num > 40 ? 'High' : '';
    case 'Creatinine':
      return num > 1.2 ? 'High' : '';
    case 'Albumin':
      return num < 3.5 ? 'Low' : '';
    default:
      return '';
  }
};

/**
 * Derive alert severity from alert text content.
 */
export const deriveAlertSeverity = (alertText) => {
  const lower = String(alertText).toLowerCase();
  if (lower.includes('critical') || lower.includes('high potassium') || lower.includes('fluid overload')) {
    return ALERT_SEVERITY.CRITICAL;
  }
  if (lower.includes('warning') || lower.includes('low hemoglobin') || lower.includes('infection')) {
    return ALERT_SEVERITY.WARNING;
  }
  return ALERT_SEVERITY.INFO;
};

// ---------------------------------------------------------------------------
// Normalization adapters
// ---------------------------------------------------------------------------

/**
 * Normalize raw patient data into the P2-02 summary shape.
 */
export function normalizePatientBanner(patient) {
  const dob = patient.dob || patient.date_of_birth || patient.birth_date || null;
  const rawAilments = patient.ailments || patient.patient_ailments || patient.aliments || patient.medical_history || '';
  const ailment = Array.isArray(rawAilments) ? rawAilments.join(', ') : String(rawAilments || '—');

  return {
    id: patient.id,
    patientCode: patient.patient_code || patient.patientCode || `P${String(patient.id || '').padStart(5, '0')}`,
    name: patient.name || patient.patient_name || `Patient #${patient.id}`,
    age: patient.age || patient.patient_age || calculateAge(dob),
    gender: patient.gender || patient.patient_gender || patient.sex || '—',
    phone: patient.number || patient.phone_number || patient.phone || patient.mobile_no || patient.phone_no || '—',
    diagnosis: patient.primary_diagnosis || patient.diagnosis || ailment || 'CKD - Stage 5D',
    dialysisType: patient.dialysis_type || patient.treatment_type || 'Hemodialysis',
    vascularAccess: patient.vascular_access || patient.access_type || '—',
    nephrologist: patient.primary_doctor_name || patient.doctor_name || patient.nephrologist_name || '—',
    schedule: patient.schedule || patient.dialysis_schedule || patient.frequency || 'Mon, Wed, Fri',
    firstDialysisDate: patient.first_dialysis_date || patient.first_session_date || patient.created_at || null,
    firstDialysisDuration: calcDialysisDuration(patient.first_dialysis_date || patient.first_session_date || patient.created_at),
    raw: patient,
  };
}

/**
 * Normalize prescription parameters from getHemoDialysisParameters.
 */
export function normalizePrescription(params) {
  if (!params || (Array.isArray(params) && params.length === 0)) {
    return null;
  }

  // params may be an array of parameter objects or a single object
  const data = Array.isArray(params) ? params[0] : params;
  if (!data) return null;

  return {
    dialyzer: data.dialyzer || data.dialyzer_type || data.Dialyzer || '—',
    bloodFlowRate: data.blood_flow_rate || data.bloodFlowRate || data['Blood Flow Rate'] || '—',
    dialysateFlowRate: data.dialysate_flow_rate || data.dialysateFlowRate || data['Dialysate Flow Rate'] || '—',
    dialysisTime: data.dialysis_time || data.dialysisTime || data['Dialysis Time'] || '—',
    heparin: data.heparin || data.Heparin || '—',
    lastUpdated: formatDate(data.updated_at || data.updatedAt || data.created_at),
    updatedBy: data.updated_by_name || data.updatedBy || data.doctor_name || '—',
  };
}

/**
 * Extract vitals from patient record.
 */
export function normalizeVitals(patient) {
  return {
    bp: patient.bp || patient.blood_pressure || patient.latest_bp || '—',
    pulse: patient.pulse || patient.heart_rate || patient.latest_pulse || '—',
    temperature: patient.temperature || patient.temp || patient.latest_temp || '—',
    spo2: patient.spo2 || patient.oxygen_saturation || patient.latest_spo2 || '—',
    preWeight: patient.pre_weight || patient.weight_pre || patient.weight || '—',
    postWeight: patient.post_weight || patient.weight_post || '—',
    date: formatDate(patient.vitals_date || patient.updated_at),
  };
}

/**
 * Extract labs from patient record with High/Low flags.
 */
export function normalizeLabs(patient) {
  const labs = [
    { label: 'Hemoglobin', value: patient.hemoglobin || patient.hb || '—', unit: 'g/dL' },
    { label: 'Potassium', value: patient.potassium || patient.k_plus || '—', unit: 'mEq/L' },
    { label: 'Urea', value: patient.urea || '—', unit: 'mg/dL' },
    { label: 'Creatinine', value: patient.creatinine || '—', unit: 'mg/dL' },
    { label: 'Albumin', value: patient.albumin || '—', unit: 'g/dL' },
  ];

  return {
    items: labs.map((lab) => ({
      ...lab,
      flag: deriveLabFlag(lab.label, lab.value),
    })),
    date: formatDate(patient.labs_date || patient.updated_at),
  };
}

/**
 * Derive alerts from patient data with severity.
 */
export function normalizeAlerts(patient) {
  const alerts = [];

  if (patient.alert_text || patient.alert) {
    const text = patient.alert_text || patient.alert;
    alerts.push({ text, severity: deriveAlertSeverity(text) });
  }

  if (patient.infection_status) {
    alerts.push({
      text: `Infection status: ${patient.infection_status}`,
      severity: ALERT_SEVERITY.WARNING,
    });
  }

  // Derive alerts from lab values
  const hb = parseFloat(patient.hemoglobin || patient.hb);
  if (!Number.isNaN(hb) && hb < 12) {
    alerts.push({ text: 'Low Hemoglobin', severity: ALERT_SEVERITY.WARNING });
  }

  const k = parseFloat(patient.potassium || patient.k_plus);
  if (!Number.isNaN(k) && k > 5.0) {
    alerts.push({ text: 'High Potassium', severity: ALERT_SEVERITY.CRITICAL });
  }

  return alerts;
}

/**
 * Extract notes from patient record.
 */
export function normalizeNotes(patient) {
  const rawNotes = patient.notes || patient.remarks || patient.reason || '';
  if (!rawNotes) return [];

  // If notes is a string, wrap in a single entry
  if (typeof rawNotes === 'string') {
    return rawNotes ? [{
      text: rawNotes,
      author: patient.primary_doctor_name || patient.doctor_name || '—',
      date: formatDate(patient.updated_at),
    }] : [];
  }

  // If notes is an array, normalize each
  if (Array.isArray(rawNotes)) {
    return rawNotes.map((note) => ({
      text: typeof note === 'string' ? note : (note.text || note.content || ''),
      author: note.author || note.created_by || '—',
      date: formatDate(note.date || note.created_at),
    }));
  }

  return [];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function usePatientSummary(patientId) {
  const [patientBanner, setPatientBanner] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [labs, setLabs] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [patientResult, prescriptionResult] = await Promise.all([
        getPatientById(patientId),
        getHemoDialysisParameters(patientId),
      ]);

      if (!patientResult.success) {
        setError(patientResult.error || 'Failed to load patient data');
        setLoading(false);
        return;
      }

      const patient = patientResult.data?.data || patientResult.data || {};

      setPatientBanner(normalizePatientBanner(patient));
      setVitals(normalizeVitals(patient));
      setLabs(normalizeLabs(patient));
      setAlerts(normalizeAlerts(patient));
      setNotes(normalizeNotes(patient));

      if (prescriptionResult.success) {
        const prescData = prescriptionResult.data?.data || prescriptionResult.data;
        setPrescription(normalizePrescription(prescData));
      } else {
        setPrescription(null);
      }
    } catch (err) {
      setError(err.message || 'An error occurred loading patient summary');
      notifyError(err.message || 'Failed to load patient summary');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /** Spec: Proceed disabled when no active prescription exists for today. */
  const hasActivePrescription = Boolean(prescription);

  return {
    patientBanner,
    prescription,
    vitals,
    labs,
    alerts,
    notes,
    hasActivePrescription,
    loading,
    error,
    refresh: fetchSummary,
  };
}
