/**
 * usePreDialysisDashboard — P2-03 Pre-Dialysis Dashboard Hook
 *
 * Loads live patient, session, vitals, prescription, alerts, and notes.
 * Does not invent clinical values; missing fields stay as —.
 *
 * @file src/hooks/usePreDialysisDashboard.js
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPatientDetails,
  getSessionSettings,
  getPatientLatestVitals,
  getPatientNotes,
  getPatientAlerts,
  getPredialysisStatus,
  printSessionSummary,
} from '../ApiCalls/preDialysisApis';
import { getDialysisSessionById, updateSessionParameters } from '../ApiCalls/dialysisSessionApis';
import { getBedById } from '../ApiCalls/bedManagementApis';
import { calculateAge, formatDate, calcDialysisDuration } from './usePatientSummary';
import { ALERT_SEVERITY } from '../pages/dialysis/dialysisQueueConstants';
import { notifyError, notifySuccess } from '../helpers/notify';
import {
  liveValue,
  MISSING,
  mapRollupSteps,
  ROLLUP_TO_DASHBOARD,
  unwrapList,
  unwrapRecord,
  formatIst,
} from '../pages/dialysis/p2Runtime';

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

const EMPTY_STEP_STATUSES = {
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

export const calculateProgressPercentage = (stepStatuses = {}) => {
  const completeCount = PRE_DIALYSIS_STEPS.filter(
    (step) => stepStatuses[step.key] === STEP_STATUS.COMPLETE
  ).length;

  return Math.round((completeCount / 9) * 100);
};

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

export const checkCanStartDialysis = (stepStatuses = {}) => {
  return PRE_DIALYSIS_STEPS.slice(0, 8).every(
    (step) => stepStatuses[step.key] === STEP_STATUS.COMPLETE
  );
};

export const checkPrintSummaryAllowed = (roleName) => {
  if (!roleName) return false;
  const normalized = String(roleName).toLowerCase();
  return (
    normalized.includes('nephrologist') ||
    normalized.includes('doctor') ||
    normalized === 'dr'
  );
};

const parseJsonValue = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string') return raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed);
      } catch (_) {
        return parsed;
      }
    }
    return parsed;
  } catch (_) {
    return raw;
  }
};

const normalizeNoteRecord = (note, fallbackId, fallbackDate) => {
  if (note === null || note === undefined || note === '') return null;
  if (typeof note === 'string') {
    const text = note.trim();
    if (!text) return null;
    return {
      id: fallbackId,
      text,
      author: MISSING,
      date: formatIst(fallbackDate),
    };
  }
  const text = String(note.text || note.note || note.content || note.pre_dialysis_notes || '').trim();
  if (!text) return null;
  return {
    id: note.id || fallbackId,
    text,
    author: note.author || note.created_by || note.user_role || MISSING,
    date: formatIst(note.date || note.created_at || note.updated_at || fallbackDate),
  };
};

export const normalizeNotesList = (payload, sessionId) => {
  const parsedRoot = parseJsonValue(payload);
  const collected = [];

  const pushNote = (note, fallbackId, fallbackDate) => {
    const normalized = normalizeNoteRecord(note, fallbackId, fallbackDate);
    if (normalized) collected.push(normalized);
  };

  if (Array.isArray(parsedRoot)) {
    parsedRoot.forEach((note, index) => pushNote(note, `${sessionId || 'note'}-${index}`, null));
    return collected;
  }

  const rows = unwrapList(parsedRoot);
  if (rows.length > 0) {
    rows.forEach((row, index) => {
      const parsedNotes = parseJsonValue(row?.pre_dialysis_notes || row?.notes);
      if (Array.isArray(parsedNotes)) {
        parsedNotes.forEach((note, noteIndex) => {
          pushNote(note, `${row.id || sessionId || index}-${noteIndex}`, row.updated_at);
        });
        return;
      }
      if (parsedNotes) {
        pushNote(parsedNotes, `${row.id || sessionId || index}-pre`, row.updated_at);
        return;
      }
      pushNote(row, row?.id || `${sessionId || 'note'}-${index}`, row?.updated_at || row?.created_at);
    });
    return collected;
  }

  if (parsedRoot && typeof parsedRoot === 'object') {
    pushNote(parsedRoot, sessionId || 'note', parsedRoot.updated_at || parsedRoot.created_at);
  }

  return collected;
};

export const normalizeAlertsList = (payload) => {
  return unwrapList(payload)
    .filter((row) => {
      const status = String(row?.status || '').toUpperCase();
      return !status || status === 'ACTIVE';
    })
    .map((row, index) => {
      const severityRaw = String(row.severity || row.level || '').toLowerCase();
      let severity = ALERT_SEVERITY.INFO;
      if (severityRaw.includes('crit') || severityRaw === 'high' || severityRaw === 'error') {
        severity = ALERT_SEVERITY.CRITICAL;
      } else if (severityRaw.includes('warn') || severityRaw === 'medium') {
        severity = ALERT_SEVERITY.WARNING;
      } else if (severityRaw.includes('info') || severityRaw === 'low') {
        severity = ALERT_SEVERITY.INFO;
      }

      return {
        id: row.id || `alert-${index}`,
        title: row.title || row.alert_type || MISSING,
        date: formatIst(row.created_at || row.updated_at || row.alert_date),
        severity,
        message: row.message || row.description || row.details || MISSING,
      };
    });
};

export const normalizePatientInfoBar = (patientInput, isAnonymized = false, assignment = {}) => {
  if (!patientInput) return null;

  const patient = (typeof patientInput === 'object' && patientInput !== null)
    ? (patientInput.patient || patientInput.data?.patient || patientInput.data || patientInput)
    : {};

  const dob = patient.dob || patient.date_of_birth || patient.birth_date || null;
  const rawId = patient.id || patient.patient_id || '';
  const patientCode = patient.patient_code || patient.patientCode || (rawId ? `P${String(rawId).padStart(5, '0')}` : MISSING);
  const rawName = patient.name || patient.patient_name || MISSING;

  const displayName = isAnonymized ? `ANON-${patientCode}` : rawName;
  const displayPhone = isAnonymized
    ? 'XXXXXXXXXX'
    : (patient.phone_no || patient.number || patient.phone_number || patient.phone || patient.mobile_no || MISSING);

  const bedNo = assignment.bedNumber || patient.bed_number || patient.bedNo || patient.bed || MISSING;
  const machineNo = assignment.machineNumber || patient.machine_number || patient.machineNo || patient.machine || MISSING;
  const bedMachineLabel = (bedNo !== MISSING || machineNo !== MISSING) ? `${bedNo} / ${machineNo}` : `${MISSING} / ${MISSING}`;

  const rawGender = patient.gender || patient.sex || patient.patient_gender;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || MISSING);
  const ageVal = patient.age ? String(patient.age) : (dob ? calculateAge(dob) : MISSING);
  const dryWeightValue = patient.dry_weight || patient.target_weight || patient.edw;

  return {
    id: rawId,
    patientCode,
    name: displayName,
    photo: isAnonymized ? null : patient.photo || patient.avatar || null,
    statusBadge: patient.patient_status || patient.status || MISSING,
    status: patient.patient_status || patient.status || MISSING,
    age: ageVal || MISSING,
    gender,
    phone: displayPhone,
    dryWeight: dryWeightValue ? `${dryWeightValue} kg` : MISSING,
    bloodGroup: patient.blood_group || patient.bloodGroup || MISSING,
    lastDialysisDate: patient.last_dialysis_date ? formatDate(patient.last_dialysis_date) : MISSING,
    lastDialysisDuration: patient.last_dialysis_date ? calcDialysisDuration(patient.last_dialysis_date) : '',
    vascularAccess: patient.vascular_access || patient.access_type || MISSING,
    nextSchedule: patient.next_schedule || MISSING,
    nextScheduleDate: patient.next_schedule_date || patient.next_schedule || MISSING,
    nextScheduleTime: patient.next_schedule_time || patient.shift_time || MISSING,
    nephrologist: patient.primary_doctor_name || patient.doctor_name || MISSING,
    dialysisType: patient.dialysis_type || MISSING,
    assignment: {
      shift: assignment.shift || patient.shift_time || patient.shift_name || MISSING,
      bedMachine: bedMachineLabel,
      technician: assignment.technician || patient.attending_technician || MISSING,
    },
    raw: patient,
  };
};

export const normalizeLatestVitals = (vitalsInput) => {
  const source = unwrapRecord(vitalsInput, ['vitals']) || {};
  const systolic = source.bp_systolic ?? source.systolic_bp_mm_hg ?? source.systolic;
  const diastolic = source.bp_diastolic ?? source.diastolic_bp_mm_hg ?? source.diastolic;
  const bp = (systolic !== undefined && systolic !== null && systolic !== '' && diastolic !== undefined && diastolic !== null && diastolic !== '')
    ? `${systolic}/${diastolic}`
    : (source.bp || source.blood_pressure || source.pre_bp || null);
  const pulse = source.pulse ?? source.heart_rate ?? source.pre_hr;
  const temp = source.temperature ?? source.temp;
  const spo2 = source.spo2;
  const preWeight = source.weight_pre ?? source.pre_weight ?? source.weight;
  const respRate = source.respiratory_rate ?? source.resp_rate;

  const withUnit = (value, unit) => {
    if (value === null || value === undefined || String(value).trim() === '') return MISSING;
    const text = String(value);
    if (!unit) return text;
    return text.includes(unit.trim()) ? text : `${text}${unit}`;
  };

  return {
    bp: withUnit(bp, ' mmHg'),
    bpTag: bp ? 'Recorded' : 'Missing',
    pulse: withUnit(pulse, ' bpm'),
    pulseTag: pulse ? 'Recorded' : 'Missing',
    temp: withUnit(temp, ' °C'),
    tempTag: temp ? 'Recorded' : 'Missing',
    spo2: withUnit(spo2, '%'),
    spo2Tag: spo2 ? 'Recorded' : 'Missing',
    preWeight: withUnit(preWeight, ' kg'),
    respRate: withUnit(respRate, ' bpm'),
    respRateTag: respRate ? 'Recorded' : 'Missing',
  };
};

export const normalizePreDialysisSummary = (settingsPayload, vitalsPayload) => {
  const settings = settingsPayload?.settings || settingsPayload?.prefill || settingsPayload || null;
  const ufGoal = vitalsPayload?.uf_goal_ml;
  if (!settings || typeof settings !== 'object') {
    return {
      targetUfGoal: liveValue(ufGoal),
      expectedTreatmentTime: MISSING,
      bfr: MISSING,
      dfr: MISSING,
      dialysateTemp: MISSING,
      na: MISSING,
      k: MISSING,
      bicarbonate: MISSING,
      hasPrescription: false,
    };
  }
  return {
    targetUfGoal: liveValue(ufGoal),
    expectedTreatmentTime: liveValue(settings.duration_hours, ' h'),
    bfr: liveValue(settings.bfr_ml_min, ' mL/min'),
    dfr: liveValue(settings.dfr_ml_min, ' mL/min'),
    dialysateTemp: liveValue(settings.dialysate_temp, ' °C'),
    na: liveValue(settings.na),
    k: liveValue(settings.k),
    bicarbonate: liveValue(settings.bicarbonate),
    hasPrescription: Boolean(settings.duration_hours),
  };
};

const mapRollupToDashboardStatuses = (payload) => {
  const next = { ...EMPTY_STEP_STATUSES };
  mapRollupSteps(payload).forEach((step) => {
    const key = ROLLUP_TO_DASHBOARD[step.key] || step.dashboardKey;
    if (!key || !(key in next)) return;
    if (step.status === 'Completed') next[key] = STEP_STATUS.COMPLETE;
    else if (step.status === 'In Progress') next[key] = STEP_STATUS.IN_PROGRESS;
    else next[key] = STEP_STATUS.NOT_STARTED;
  });
  return next;
};

export default function usePreDialysisDashboard(patientId, userRole = 'Dialysis Technician', rawSessionId, assignmentHint = null) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [prescriptionRaw, setPrescriptionRaw] = useState(null);
  const [vitalsRaw, setVitalsRaw] = useState(null);
  const [alertsRaw, setAlertsRaw] = useState([]);
  const [sessionNotesRaw, setSessionNotesRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [stepStatuses, setStepStatuses] = useState(EMPTY_STEP_STATUSES);
  const [serverProgressPct, setServerProgressPct] = useState(null);
  const [serverCanStart, setServerCanStart] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assignment, setAssignment] = useState(assignmentHint || {});

  const loadDashboardData = useCallback(async () => {
    if (!activeSessionId) {
      setLoading(false);
      setError('No dialysis session id. Drag the patient to a bed again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const statusRes = await getPredialysisStatus(activeSessionId);
      if (!statusRes?.success) {
        setError(statusRes?.message || 'Failed to load pre-dialysis status');
        setPatientRaw(null);
        return;
      }

      const statusPayload = unwrapRecord(statusRes.data) || statusRes.data || {};
      const resolvedPatientId = statusPayload.patient_id || patientId;
      setStepStatuses(mapRollupToDashboardStatuses(statusPayload));
      setServerProgressPct(
        statusPayload.progress_pct === null || statusPayload.progress_pct === undefined
          ? null
          : Number(statusPayload.progress_pct)
      );
      setServerCanStart(
        typeof statusPayload.start_dialysis_enabled === 'boolean'
          ? statusPayload.start_dialysis_enabled
          : null
      );

      if (!resolvedPatientId) {
        setError('This session has no patient id.');
        setPatientRaw(null);
        return;
      }

      const [
        patientRes,
        rxRes,
        vitalsRes,
        alertsRes,
        notesRes,
        sessionRes,
      ] = await Promise.all([
        getPatientDetails(resolvedPatientId),
        getSessionSettings(activeSessionId),
        getPatientLatestVitals(resolvedPatientId),
        getPatientAlerts(resolvedPatientId),
        getPatientNotes(resolvedPatientId),
        getDialysisSessionById(activeSessionId),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }

      const patientData = unwrapRecord(patientRes.data, ['patient']) || patientRes.data;
      setPatientRaw(patientData);

      setPrescriptionRaw(rxRes?.success ? rxRes.data : null);
      const vitalsPayload = vitalsRes?.success
        ? unwrapRecord(vitalsRes.data, ['vitals']) || vitalsRes.data
        : null;
      const vitalsBelongToThisSession = Boolean(
        vitalsPayload
        && vitalsPayload.session_id != null
        && String(vitalsPayload.session_id) === String(activeSessionId)
      );
      setVitalsRaw(vitalsBelongToThisSession ? vitalsPayload : null);
      setAlertsRaw(alertsRes?.success ? unwrapList(alertsRes.data) : []);

      const session = sessionRes?.success ? unwrapRecord(sessionRes.data) || sessionRes.data : null;
      setSessionNotesRaw(session?.pre_dialysis_notes || null);

      const currentNotes = normalizeNotesList(session?.pre_dialysis_notes, activeSessionId);
      const historyNotes = normalizeNotesList(notesRes?.success ? notesRes.data : [], activeSessionId)
        .filter((note) => !currentNotes.some((current) => current.id === note.id && current.text === note.text));
      setNotes([...currentNotes, ...historyNotes]);

      let nextAssignment = {
        bedNumber: assignmentHint?.bedNumber || null,
        machineNumber: assignmentHint?.machineNumber || null,
        shift: assignmentHint?.shift || null,
        technician: assignmentHint?.technician || null,
      };

      if (session?.bed_id && (!nextAssignment.bedNumber || !nextAssignment.machineNumber)) {
        const bedRes = await getBedById(session.bed_id);
        if (bedRes?.success) {
          const bed = unwrapRecord(bedRes.data) || bedRes.data;
          nextAssignment = {
            bedNumber: nextAssignment.bedNumber || bed?.bed_number || bed?.name || session.bed_id,
            machineNumber: nextAssignment.machineNumber || bed?.machine_id || bed?.machine_number || null,
            shift: nextAssignment.shift || bed?.shift_name || bed?.shift || null,
            technician: nextAssignment.technician || bed?.technician_name || null,
          };
        } else if (!nextAssignment.bedNumber) {
          nextAssignment.bedNumber = session.bed_id;
        }
      }

      setAssignment(nextAssignment);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err?.message || 'Failed to load pre-dialysis dashboard data');
      setPatientRaw(null);
    } finally {
      setLoading(false);
    }
  }, [
    activeSessionId,
    patientId,
    assignmentHint?.bedNumber,
    assignmentHint?.machineNumber,
    assignmentHint?.shift,
    assignmentHint?.technician,
  ]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const isConsentRevoked = Boolean(
    patientRaw?.consent_status === 'Revoked' || patientRaw?.consentRevoked
  );

  const isDoctorRole = checkPrintSummaryAllowed(userRole);
  const isTechnicianBlocked = isConsentRevoked && !isDoctorRole;

  const printSummaryAllowed = checkPrintSummaryAllowed(userRole);
  const overallProgress = serverProgressPct != null && !Number.isNaN(serverProgressPct)
    ? Math.round(serverProgressPct)
    : calculateProgressPercentage(stepStatuses);
  const pendingTasks = derivePendingTasks(stepStatuses);
  const canStartDialysis = serverCanStart == null ? checkCanStartDialysis(stepStatuses) : serverCanStart;

  const patientInfo = useMemo(
    () => normalizePatientInfoBar(patientRaw, isConsentRevoked && isDoctorRole, assignment),
    [patientRaw, isConsentRevoked, isDoctorRole, assignment]
  );

  const latestVitals = useMemo(() => normalizeLatestVitals(vitalsRaw), [vitalsRaw]);
  const preDialysisSummary = useMemo(
    () => normalizePreDialysisSummary(prescriptionRaw, vitalsRaw),
    [prescriptionRaw, vitalsRaw]
  );
  const alerts = useMemo(() => normalizeAlertsList(alertsRaw), [alertsRaw]);

  const updateStepStatus = useCallback((stepKey, status) => {
    setStepStatuses((prev) => ({
      ...prev,
      [stepKey]: status,
    }));
  }, []);

  const addNote = useCallback(async (text) => {
    if (!text || !text.trim()) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save this note against.');
      return false;
    }

    setSavingNote(true);
    try {
      const existing = normalizeNotesList(sessionNotesRaw, activeSessionId);
      const nextNotes = [
        {
          text: text.trim(),
          author: userRole || MISSING,
          created_at: new Date().toISOString(),
        },
        ...existing.map((note) => ({
          text: note.text,
          author: note.author,
          created_at: note.date,
        })),
      ];
      const saveRes = await updateSessionParameters(activeSessionId, {
        preDialysisNotes: nextNotes,
      });
      if (!saveRes?.success) {
        notifyError(saveRes?.data?.message || saveRes?.message || 'Could not save note');
        return false;
      }
      setSessionNotesRaw(nextNotes);
      setNotes((prev) => {
        const saved = normalizeNotesList(nextNotes, activeSessionId);
        const rest = prev.filter((note) => !saved.some((item) => item.text === note.text && item.author === note.author));
        return [...saved, ...rest];
      });
      notifySuccess('Note saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save note');
      return false;
    } finally {
      setSavingNote(false);
    }
  }, [activeSessionId, sessionNotesRaw, userRole]);

  const printSummary = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to print.');
      return false;
    }
    setPrinting(true);
    try {
      const res = await printSessionSummary(activeSessionId);
      if (!res?.success) {
        notifyError(res?.message || 'Print summary failed');
        return false;
      }
      window.print();
      return true;
    } catch (err) {
      notifyError(err?.message || 'Print summary failed');
      return false;
    } finally {
      setPrinting(false);
    }
  }, [activeSessionId]);

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
    savingNote,
    printing,
    error,
    lastRefreshed,
    refresh: loadDashboardData,
    updateStepStatus,
    addNote,
    printSummary,
  };
}
