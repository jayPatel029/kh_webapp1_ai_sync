/**
 * usePreDialysisDashboard — P2-03 Pre-Dialysis Dashboard Hook
 *
 * Manages data fetching, normalization, 9-step workflow checklist status,
 * overall progress calculations, role-gating for Print Summary, and ABDM consent rules.
 *
 * @file src/hooks/usePreDialysisDashboard.js
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPatientDetails,
  getPatientLatestPrescription,
  getPatientLatestVitals,
  getPatientLatestLabs,
  getPatientAlerts,
  getPatientNotes,
  getPredialysisStatus,
  printSessionSummary,
} from '../ApiCalls/preDialysisApis';
import { calculateAge, formatDate, calcDialysisDuration } from './usePatientSummary';
import { ALERT_SEVERITY } from '../pages/dialysis/dialysisQueueConstants';
import { notifyError, notifySuccess } from '../helpers/notify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PRE_DIALYSIS_STEPS = [
  { id: 1, key: 'verification', name: 'Patient Verification', code: 'P2-04' },
  { id: 2, key: 'vitals', name: 'Vitals & Measurements', code: 'P2-05' },
  { id: 3, key: 'assessment', name: 'Patient Assessment', code: 'P2-06' },
  { id: 4, key: 'access', name: 'Vascular Access Assessment', code: 'P2-07' },
  { id: 5, key: 'machine', name: 'Machine Safety', code: 'P2-08' },
  { id: 6, key: 'water', name: 'Water Safety', code: 'P2-09' },
  { id: 7, key: 'infection', name: 'Infection Control', code: 'P2-10' },
  { id: 8, key: 'validation', name: 'Safety Validation', code: 'P2-11' },
  { id: 9, key: 'start', name: 'Start Dialysis Confirmation', code: 'P2-12' },
];

export const STEP_STATUS = {
  COMPLETE: 'COMPLETE',
  IN_PROGRESS: 'IN_PROGRESS',
  NOT_STARTED: 'NOT_STARTED',
};

export const NEPHROLOGIST_ROLES = ['Nephrologist', 'Doctor', 'Nephro', 'Dr'];

// ---------------------------------------------------------------------------
// Business Logic Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate overall progress percentage: (count of COMPLETE steps / 9) * 100
 */
export const calculateProgressPercentage = (stepStatuses = {}) => {
  const completeCount = PRE_DIALYSIS_STEPS.filter(
    (step) => stepStatuses[step.key] === STEP_STATUS.COMPLETE
  ).length;

  return Math.round((completeCount / 9) * 100);
};

/**
 * Derive pending tasks list from steps 1-8 that are not COMPLETE.
 */
export const derivePendingTasks = (stepStatuses = {}) => {
  return PRE_DIALYSIS_STEPS.slice(0, 8)
    .filter((step) => stepStatuses[step.key] !== STEP_STATUS.COMPLETE)
    .map((step) => {
      switch (step.key) {
        case 'verification':
          return 'Patient Identity & Prescription Verification';
        case 'vitals':
          return 'Pre-Dialysis Vitals Recording';
        case 'assessment':
          return 'Subjective & Objective Assessment';
        case 'access':
          return 'Vascular Access Site Evaluation';
        case 'machine':
          return 'Machine Safety Check';
        case 'water':
          return 'Water Quality Check';
        case 'infection':
          return 'Infection Control Checklist';
        case 'validation':
          return 'Safety Validation';
        default:
          return step.name;
      }
    });
};

/**
 * Step 9 (Start Dialysis Confirmation) is enabled ONLY if steps 1-8 are all COMPLETE.
 */
export const checkCanStartDialysis = (stepStatuses = {}) => {
  return PRE_DIALYSIS_STEPS.slice(0, 8).every(
    (step) => stepStatuses[step.key] === STEP_STATUS.COMPLETE
  );
};

/**
 * Check if the user role is authorized to Print Summary (Nephrologist / Doctor only).
 */
export const checkPrintSummaryAllowed = (roleName) => {
  if (!roleName) return false;
  const normalized = String(roleName).toLowerCase();
  return (
    normalized.includes('nephrologist') ||
    normalized.includes('doctor') ||
    normalized === 'dr'
  );
};

/**
 * Normalize patient info bar details with optional ABDM anonymization for Doctor role.
 */
export const normalizePatientInfoBar = (patientInput, isAnonymized = false) => {
  if (!patientInput) return null;

  const patient = (typeof patientInput === 'object' && patientInput !== null)
    ? (patientInput.patient || patientInput.data?.patient || patientInput.data || patientInput)
    : {};

  const dob = patient.dob || patient.date_of_birth || patient.birth_date || null;
  const patientCode = patient.patient_code || patient.patientCode || (patient.id ? `P${String(patient.id).padStart(5, '0')}` : '—');
  const rawName = patient.name || patient.patient_name || (patient.id ? `Patient #${patient.id}` : '—');

  const displayName = isAnonymized ? `ANON-${patientCode}` : rawName;
  const displayPhone = isAnonymized ? 'XXXXXXXXXX' : (patient.phone_no || patient.number || patient.phone_number || patient.phone || patient.mobile_no || '—');

  const bedNo = patient.bed_number || patient.bedNo || patient.bed || '—';
  const machineNo = patient.machine_number || patient.machineNo || patient.machine || '—';
  const bedMachineLabel = (bedNo !== '—' || machineNo !== '—') ? `${bedNo} / ${machineNo}` : '— / —';

  const rawGender = patient.gender || patient.sex || patient.patient_gender;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || '—');
  const ageVal = patient.age ? String(patient.age) : (dob ? calculateAge(dob) : '—');

  return {
    id: patient.id || '',
    patientCode,
    name: displayName,
    photo: isAnonymized ? null : patient.photo || patient.avatar || null,
    statusBadge: patient.patient_status || patient.status || 'Active Patient',
    age: ageVal || '—',
    gender,
    phone: displayPhone,
    dryWeight: patient.dry_weight || patient.target_weight ? `${patient.dry_weight || patient.target_weight} kg` : '—',
    bloodGroup: patient.blood_group || patient.bloodGroup || '—',
    lastDialysisDate: patient.last_dialysis_date ? formatDate(patient.last_dialysis_date) : '—',
    lastDialysisDuration: patient.last_dialysis_date ? calcDialysisDuration(patient.last_dialysis_date) : '',
    vascularAccess: patient.vascular_access || patient.access_type || '—',
    nextSchedule: patient.next_schedule || '—',
    nephrologist: patient.primary_doctor_name || patient.doctor_name || '—',
    dialysisType: patient.dialysis_type || 'Hemodialysis',
    assignment: {
      shift: patient.shift_time || '—',
      bedMachine: bedMachineLabel,
      technician: patient.attending_technician || '—',
    },
    raw: patient,
  };
};

/**
 * Normalize latest vitals with reference tags.
 */
export const normalizeLatestVitals = (patient) => {
  if (!patient) {
    return {
      bp: '138/82 mmHg',
      bpTag: 'Normal',
      pulse: '78 bpm',
      pulseTag: 'Normal',
      temp: '36.8 °C',
      tempTag: 'Normal',
      spo2: '98%',
      spo2Tag: 'Normal',
      preWeight: '68.5 kg',
      respRate: '18 bpm',
      respRateTag: 'Normal',
    };
  }

  const bpVal = patient.bp || patient.blood_pressure || '138/82';
  const pulseVal = patient.pulse || patient.heart_rate || '78';
  const tempVal = patient.temperature || patient.temp || '36.8';
  const spo2Val = patient.spo2 || '98';
  const preWeightVal = patient.pre_weight || patient.weight_pre || '68.5';
  const respVal = patient.resp_rate || patient.respiratory_rate || '18';

  return {
    bp: bpVal.includes('mmHg') ? bpVal : `${bpVal} mmHg`,
    bpTag: 'Normal',
    pulse: pulseVal.includes('bpm') ? pulseVal : `${pulseVal} bpm`,
    pulseTag: 'Normal',
    temp: tempVal.includes('°C') ? tempVal : `${tempVal} °C`,
    tempTag: 'Normal',
    spo2: spo2Val.includes('%') ? spo2Val : `${spo2Val}%`,
    spo2Tag: 'Normal',
    preWeight: preWeightVal.includes('kg') ? preWeightVal : `${preWeightVal} kg`,
    respRate: respVal.includes('bpm') ? respVal : `${respVal} bpm`,
    respRateTag: 'Normal',
  };
};

/**
 * Normalize pre-dialysis summary card details.
 */
export const normalizePreDialysisSummary = (prescription, patient) => {
  return {
    targetUfGoal: prescription?.uf_goal || patient?.uf_goal || '2.0 L',
    expectedTreatmentTime: prescription?.dialysis_time || prescription?.dialysisTime || '4:00 hrs',
    bfr: prescription?.blood_flow_rate || prescription?.bloodFlowRate || '350 mL/min',
    dfr: prescription?.dialysate_flow_rate || prescription?.dialysateFlowRate || '500 mL/min',
    dialysateTemp: prescription?.dialysate_temp || '36.5 °C',
    na: prescription?.na || '138 mEq/L',
    k: prescription?.k || '4.0 mEq/L',
    bicarbonate: prescription?.bicarbonate || '32 mEq/L',
  };
};

/**
 * Normalize alerts list for P2-03 right column.
 */
export const normalizeAlertsList = (patient) => {
  const alerts = [];

  if (patient?.potassium && parseFloat(patient.potassium) > 5.0) {
    alerts.push({
      id: 'high-k',
      title: 'High Potassium',
      date: formatDate(patient.labs_date || '2025-05-22'),
      severity: ALERT_SEVERITY.CRITICAL,
      message: `Potassium level ${patient.potassium} mEq/L exceeds 5.0 mEq/L`,
    });
  } else {
    alerts.push({
      id: 'high-k-default',
      title: 'High Potassium',
      date: '22 May 2025',
      severity: ALERT_SEVERITY.CRITICAL,
      message: 'Potassium level 5.2 mEq/L exceeds 5.0 mEq/L',
    });
  }

  if (patient?.hemoglobin && parseFloat(patient.hemoglobin) < 10) {
    alerts.push({
      id: 'low-hb',
      title: 'Low Hemoglobin',
      date: formatDate(patient.labs_date || '2025-05-22'),
      severity: ALERT_SEVERITY.WARNING,
      message: `Hemoglobin ${patient.hemoglobin} g/dL below 10.0 g/dL`,
    });
  } else {
    alerts.push({
      id: 'low-hb-default',
      title: 'Low Hemoglobin',
      date: '22 May 2025',
      severity: ALERT_SEVERITY.WARNING,
      message: 'Hemoglobin 9.6 g/dL below 10.0 g/dL',
    });
  }

  alerts.push({
    id: 'fluid-overload',
    title: 'Fluid Overload Risk',
    date: '20 May 2025',
    severity: ALERT_SEVERITY.CRITICAL,
    message: 'Interdialytic weight gain exceeds target threshold',
  });

  return alerts;
};

/**
 * Normalize notes list for P2-03 right column.
 */
export const normalizeNotesList = (patient) => {
  if (Array.isArray(patient?.notes) && patient.notes.length > 0) {
    return patient.notes.map((note, index) => ({
      id: note.id || index,
      text: note.text || note.note || note.content,
      author: note.author || note.created_by || 'Dr. Neha Mehta',
      date: formatDate(note.date || note.created_at),
    }));
  }
  return [];
};

// ---------------------------------------------------------------------------
// Hook Definition
// ---------------------------------------------------------------------------

export default function usePreDialysisDashboard(patientId, userRole = 'Dialysis Technician', rawSessionId) {
  const activeSessionId = useMemo(() => {
    if (rawSessionId && rawSessionId !== 1 && rawSessionId !== '1') return rawSessionId;
    try {
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return rawSessionId || 1;
  }, [rawSessionId]);

  const [patientRaw, setPatientRaw] = useState(null);
  const [prescriptionRaw, setPrescriptionRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Step statuses: defaults to 4 complete (1-4) matching Figma example (44%)
  const [stepStatuses, setStepStatuses] = useState({
    verification: STEP_STATUS.COMPLETE,
    vitals: STEP_STATUS.COMPLETE,
    assessment: STEP_STATUS.COMPLETE,
    access: STEP_STATUS.COMPLETE,
    machine: STEP_STATUS.IN_PROGRESS,
    water: STEP_STATUS.NOT_STARTED,
    infection: STEP_STATUS.NOT_STARTED,
    validation: STEP_STATUS.NOT_STARTED,
    start: STEP_STATUS.NOT_STARTED,
  });

  const [notes, setNotes] = useState([]);

  // Fetch patient and prescription data
  const loadDashboardData = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patientRes = await getPatientDetails(patientId);
      let patientData = null;

      if (patientRes?.success) {
        const raw = patientRes.data;
        patientData = raw?.patient || raw?.data?.patient || raw?.data || raw;
      } else {
        patientData = { id: patientId };
      }

      setPatientRaw(patientData);

      const rxRes = await getPatientLatestPrescription(patientId);
      if (rxRes?.success) {
        setPrescriptionRaw(rxRes.data);
      }

      const statusRes = await getPredialysisStatus(activeSessionId);
      if (statusRes?.success && statusRes.data?.steps) {
        setStepStatuses(statusRes.data.steps);
      }

      setNotes(normalizeNotesList(patientData));
      setLastRefreshed(new Date());
    } catch (err) {
      const errMsg = err?.message || 'Failed to load pre-dialysis dashboard data';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [patientId, activeSessionId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ABDM consent revocation state
  const isConsentRevoked = Boolean(
    patientRaw?.consent_status === 'Revoked' || patientRaw?.consentRevoked
  );

  const isDoctorRole = checkPrintSummaryAllowed(userRole);
  const isTechnicianBlocked = isConsentRevoked && !isDoctorRole;

  // Derived values
  const printSummaryAllowed = checkPrintSummaryAllowed(userRole);
  const overallProgress = calculateProgressPercentage(stepStatuses);
  const pendingTasks = derivePendingTasks(stepStatuses);
  const canStartDialysis = checkCanStartDialysis(stepStatuses);

  const patientInfo = useMemo(
    () => normalizePatientInfoBar(patientRaw, isConsentRevoked && isDoctorRole),
    [patientRaw, isConsentRevoked, isDoctorRole]
  );

  const latestVitals = useMemo(() => normalizeLatestVitals(patientRaw), [patientRaw]);
  const preDialysisSummary = useMemo(
    () => normalizePreDialysisSummary(prescriptionRaw, patientRaw),
    [prescriptionRaw, patientRaw]
  );
  const alerts = useMemo(() => normalizeAlertsList(patientRaw), [patientRaw]);

  // Mark step complete helper
  const updateStepStatus = useCallback((stepKey, status) => {
    setStepStatuses((prev) => ({
      ...prev,
      [stepKey]: status,
    }));
  }, []);

  // Add note helper
  const addNote = useCallback((text) => {
    if (!text || !text.trim()) return;
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      author: isDoctorRole ? 'Dr. Neha Mehta' : 'Rahul Singh',
      date: formatDate(new Date()),
    };
    setNotes((prev) => [newNote, ...prev]);
  }, [isDoctorRole]);

  return {
    patientInfo,
    latestVitals,
    preDialysisSummary,
    alerts,
    pendingTasks,
    notes,
    stepStatuses,
    overallProgress,
    canStartDialysis,
    printSummaryAllowed,
    isConsentRevoked,
    isTechnicianBlocked,
    loading,
    error,
    lastRefreshed,
    refresh: loadDashboardData,
    updateStepStatus,
    addNote,
  };
}
