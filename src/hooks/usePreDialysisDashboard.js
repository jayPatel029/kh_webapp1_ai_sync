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
  getPatientNotes,
  getPredialysisStatus,
  printSessionSummary,
} from '../ApiCalls/preDialysisApis';
import { calculateAge, formatDate, calcDialysisDuration } from './usePatientSummary';
import { ALERT_SEVERITY } from '../pages/dialysis/dialysisQueueConstants';
import { notifyError, notifySuccess } from '../helpers/notify';
import { liveValue, MISSING, mapRollupSteps, ROLLUP_TO_DASHBOARD } from '../pages/dialysis/p2Runtime';

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
  const source = patient?.vitals || patient || {};
  const withUnit = (value, unit) => {
    if (value === null || value === undefined || String(value).trim() === '') return MISSING;
    const text = String(value);
    if (!unit) return text;
    return text.includes(unit.replace(' ', '')) ? text : `${text}${unit}`;
  };
  return {
    bp: withUnit(source.bp || source.blood_pressure, ' mmHg'),
    bpTag: source.bp ? 'Recorded' : 'Missing',
    pulse: withUnit(source.pulse || source.heart_rate, ' bpm'),
    pulseTag: source.pulse || source.heart_rate ? 'Recorded' : 'Missing',
    temp: withUnit(source.temperature || source.temp, ' °C'),
    tempTag: source.temperature || source.temp ? 'Recorded' : 'Missing',
    spo2: withUnit(source.spo2, '%'),
    spo2Tag: source.spo2 ? 'Recorded' : 'Missing',
    preWeight: withUnit(source.pre_weight || source.weight_pre, ' kg'),
    respRate: withUnit(source.resp_rate || source.respiratory_rate, ' bpm'),
    respRateTag: source.resp_rate || source.respiratory_rate ? 'Recorded' : 'Missing',
  };
};

/**
 * Normalize pre-dialysis summary card details.
 */
export const normalizePreDialysisSummary = (prescription, patient) => {
  const rx = prescription?.prescription || prescription || {};
  return {
    targetUfGoal: liveValue(rx.uf_goal || patient?.uf_goal),
    expectedTreatmentTime: liveValue(rx.dialysis_time || rx.dialysisTime),
    bfr: liveValue(rx.blood_flow_rate || rx.bloodFlowRate),
    dfr: liveValue(rx.dialysate_flow_rate || rx.dialysateFlowRate),
    dialysateTemp: liveValue(rx.dialysate_temp),
    na: liveValue(rx.na),
    k: liveValue(rx.k),
    bicarbonate: liveValue(rx.bicarbonate),
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
      date: formatDate(patient.labs_date || new Date().toISOString()),
      severity: ALERT_SEVERITY.CRITICAL,
      message: `Potassium level ${patient.potassium} mEq/L exceeds 5.0 mEq/L`,
    });
  }

  if (patient?.hemoglobin && parseFloat(patient.hemoglobin) < 10) {
    alerts.push({
      id: 'low-hb',
      title: 'Low Hemoglobin',
      date: formatDate(patient.labs_date || new Date().toISOString()),
      severity: ALERT_SEVERITY.WARNING,
      message: `Hemoglobin ${patient.hemoglobin} g/dL below 10.0 g/dL`,
    });
  }

  const weightGain = parseFloat(patient?.interdialytic_weight_gain || patient?.idwg);
  if (!Number.isNaN(weightGain) && weightGain > 0 && patient?.target_uf) {
    const targetUf = parseFloat(patient.target_uf);
    if (!Number.isNaN(targetUf) && weightGain > targetUf) {
      alerts.push({
        id: 'fluid-overload',
        title: 'Fluid Overload Risk',
        date: formatDate(patient.labs_date || new Date().toISOString()),
        severity: ALERT_SEVERITY.CRITICAL,
        message: 'Interdialytic weight gain exceeds target threshold',
      });
    }
  }

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
      author: note.author || note.created_by || MISSING,
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
    if (rawSessionId && String(rawSessionId).trim() !== '' && String(rawSessionId) !== '1') return rawSessionId;
    try {
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return rawSessionId || '';
  }, [rawSessionId]);

  const emptyStepStatuses = {
    verification: STEP_STATUS.NOT_STARTED,
    vitals: STEP_STATUS.NOT_STARTED,
    assessment: STEP_STATUS.NOT_STARTED,
    access: STEP_STATUS.NOT_STARTED,
    machine: STEP_STATUS.NOT_STARTED,
    water: STEP_STATUS.NOT_STARTED,
    infection: STEP_STATUS.NOT_STARTED,
    validation: STEP_STATUS.NOT_STARTED,
    start: STEP_STATUS.NOT_STARTED,
  };

  const [patientRaw, setPatientRaw] = useState(null);
  const [prescriptionRaw, setPrescriptionRaw] = useState(null);
  const [vitalsRaw, setVitalsRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [stepStatuses, setStepStatuses] = useState(emptyStepStatuses);

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

      const vitalsRes = await getPatientLatestVitals(patientId);
      if (vitalsRes?.success) {
        setVitalsRaw(vitalsRes.data?.vitals || vitalsRes.data);
      } else {
        setVitalsRaw(null);
      }

      if (activeSessionId) {
        const statusRes = await getPredialysisStatus(activeSessionId);
        if (statusRes?.success) {
          const next = { ...emptyStepStatuses };
          mapRollupSteps(statusRes.data).forEach((step) => {
            const key = ROLLUP_TO_DASHBOARD[step.key] || step.dashboardKey;
            if (!key) return;
            if (step.status === 'Completed') next[key] = STEP_STATUS.COMPLETE;
            else if (step.status === 'In Progress') next[key] = STEP_STATUS.IN_PROGRESS;
            else next[key] = STEP_STATUS.NOT_STARTED;
          });
          setStepStatuses(next);
        }
      } else {
        setStepStatuses(emptyStepStatuses);
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

  const latestVitals = useMemo(() => normalizeLatestVitals(vitalsRaw || patientRaw), [vitalsRaw, patientRaw]);
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
      author: userRole || MISSING,
      date: formatDate(new Date()),
    };
    setNotes((prev) => [newNote, ...prev]);
  }, [userRole]);

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
