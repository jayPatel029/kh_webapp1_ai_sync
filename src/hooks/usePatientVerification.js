/**
 * usePatientVerification — P2-04 Patient Verification Hook
 *
 * Loads live patient, prescription, and dialyzer data for this session.
 * Does not invent clinical values; missing fields stay as —.
 *
 * @file src/hooks/usePatientVerification.js
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getPatientDetails,
  getPatientLatestPrescription,
  getPatientDialyzerStatus,
  submitSessionVerification,
  submitSessionConsumables,
} from '../ApiCalls/preDialysisApis';
import { calculateAge, formatDate } from './usePatientSummary';
import { notifyError, notifySuccess } from '../helpers/notify';
import { liveValue, MISSING, unwrapList, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';

// Parked: no dialysis standing-order table exists yet (old `prescriptions` is a PDF/note).
// P2-04 must not block Continue on a missing prescription until that source is built.
export const PRESCRIPTION_GATE_ENABLED = false;

export const VERIFICATION_STEPS_7 = [
  { id: 1, key: 'verification', name: 'Patient Verification', code: 'P2-04' },
  { id: 2, key: 'vitals', name: 'Vitals & Measurements', code: 'P2-05' },
  { id: 3, key: 'assessment', name: 'Assessment', code: 'P2-06' },
  { id: 4, key: 'access', name: 'Access Assessment', code: 'P2-07' },
  { id: 5, key: 'checks', name: 'Safety Checks', code: 'P2-08_10' },
  { id: 6, key: 'validation', name: 'Validation', code: 'P2-11' },
  { id: 7, key: 'start', name: 'Start Dialysis', code: 'P2-12' },
];

export const INFECTION_STATUS = {
  NEGATIVE: 'Negative',
  POSITIVE: 'Positive',
  PENDING: 'Pending',
};

export const DIALYZER_USAGE_TYPE = {
  SINGLE_USE: 'Single-Use',
  MULTI_USE: 'Multi-Use',
};

const EMPTY_IDENTITY = {
  nameMatched: false,
  dobMatched: false,
  pidMatched: false,
  phoneMatched: false,
};

const EMPTY_METHODS = {
  patientConfirmed: false,
  idCardVerified: false,
  wristbandVerified: false,
};

const EMPTY_CONSUMABLES = {
  dialyzerType: null,
  dialyzerModel: '',
  dialyzerId: '',
  reuseCount: 0,
  reuseLimit: 6,
  lastUsed: '',
  reuseAction: null,
  discardConfirmed: false,
  overrideReason: '',
  tubingSetQty: '',
  needlesQty: '',
  salineQty: '',
};

export const checkIdentityMatch = (identityFields = {}) => {
  const matchedCount = ['nameMatched', 'dobMatched', 'pidMatched', 'phoneMatched']
    .filter((key) => Boolean(identityFields[key])).length;
  return matchedCount >= 2;
};

export const checkInfectionGateResolved = (hivStatus, hepatitisStatus, isActioned) => {
  if (hivStatus !== INFECTION_STATUS.PENDING && hepatitisStatus !== INFECTION_STATUS.PENDING) {
    return true;
  }
  return Boolean(isActioned);
};

export const checkConsumablesValid = (consumablesState = {}) => {
  const {
    dialyzerType,
    reuseCount,
    reuseLimit = 6,
    reuseAction,
    discardConfirmed,
    overrideReason,
    tubingSetQty,
  } = consumablesState;

  if (!dialyzerType) return false;
  const tubing = Number(tubingSetQty);
  if (!Number.isFinite(tubing) || tubing < 1) return false;

  if (dialyzerType === DIALYZER_USAGE_TYPE.SINGLE_USE) {
    return true;
  }

  if (Number(reuseCount) < Number(reuseLimit)) {
    return true;
  }

  if (reuseAction === 'NEW_DIALYZER') {
    return Boolean(discardConfirmed);
  }

  if (reuseAction === 'OVERRIDE') {
    return Boolean(overrideReason && overrideReason.trim().length >= 5);
  }

  return false;
};

const normalizeInfectionStatus = (raw) => {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return INFECTION_STATUS.PENDING;
  if (value === 'negative' || value === 'neg') return INFECTION_STATUS.NEGATIVE;
  if (value === 'positive' || value === 'pos') return INFECTION_STATUS.POSITIVE;
  if (value === 'pending') return INFECTION_STATUS.PENDING;
  return INFECTION_STATUS.PENDING;
};

const pickPrescription = (payload) => {
  if (!payload) return null;
  if (payload.prescription !== undefined) return payload.prescription || null;
  const nested = unwrapRecord(payload, ['prescription']);
  if (nested && (nested.has_active_prescription_today === false || nested.prescription === null)) {
    return nested.prescription || null;
  }
  if (nested && (nested.id || nested.uf_goal || nested.blood_flow_rate || nested.Prescription)) {
    return nested;
  }
  return null;
};

export default function usePatientVerification(patientId, rawSessionId, assignmentHint = null) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [prescriptionRaw, setPrescriptionRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [identityMatches, setIdentityMatches] = useState(EMPTY_IDENTITY);
  const [verificationMethods, setVerificationMethods] = useState(EMPTY_METHODS);
  const [infectionState, setInfectionState] = useState({
    hivStatus: INFECTION_STATUS.PENDING,
    hepatitisStatus: INFECTION_STATUS.PENDING,
    actioned: false,
    skipped: false,
  });
  const [consumablesState, setConsumablesState] = useState(EMPTY_CONSUMABLES);
  const [notesText, setNotesText] = useState('');
  const [assignment, setAssignment] = useState(assignmentHint || {});

  const loadVerificationData = useCallback(async () => {
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
      const [patientRes, rxRes, dialyzerRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getPatientLatestPrescription(patientId),
        getPatientDialyzerStatus(patientId),
        loadP2Draft(activeSessionId, 'P2-04'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }

      const patientData = unwrapRecord(patientRes.data, ['patient']) || patientRes.data;
      setPatientRaw(patientData);
      setPrescriptionRaw(rxRes?.success ? rxRes.data : null);

      const hivFromPatient = normalizeInfectionStatus(
        patientData?.hiv_status || patientRes.data?.hiv_status
      );
      const hepFromPatient = normalizeInfectionStatus(
        patientData?.hepatitis_status || patientRes.data?.hepatitis_status
      );
      setInfectionState({
        hivStatus: hivFromPatient,
        hepatitisStatus: hepFromPatient,
        actioned: false,
        skipped: false,
      });

      const dialyzers = unwrapList(dialyzerRes?.success ? (dialyzerRes.data?.dialyzers || dialyzerRes.data) : []);
      const limits = unwrapList(dialyzerRes?.success ? dialyzerRes.data?.reuse_limits : []);
      const activeDialyzer = dialyzers[0] || null;
      const matchedLimit = limits.find((row) => (
        row.dialyzer_model && activeDialyzer?.dialyzer_model
        && String(row.dialyzer_model) === String(activeDialyzer.dialyzer_model)
      ));
      setConsumablesState({
        ...EMPTY_CONSUMABLES,
        dialyzerType: activeDialyzer
          ? (Number(activeDialyzer.reuse_count) > 1 ? DIALYZER_USAGE_TYPE.MULTI_USE : DIALYZER_USAGE_TYPE.SINGLE_USE)
          : null,
        dialyzerModel: activeDialyzer?.dialyzer_model || '',
        dialyzerId: activeDialyzer?.dialyzer_id || '',
        reuseCount: Number(activeDialyzer?.reuse_count || 0),
        reuseLimit: Number(matchedLimit?.max_reuse_count || 6),
        lastUsed: activeDialyzer?.last_used_at ? formatIst(activeDialyzer.last_used_at) : '',
      });

      setAssignment({
        bedNumber: assignmentHint?.bedNumber || null,
        machineNumber: assignmentHint?.machineNumber || null,
        shift: assignmentHint?.shift || null,
        technician: assignmentHint?.technician || null,
      });

      const draftPayload = draft?.payload;
      if (draftPayload) {
        if (draftPayload.identityMatches) setIdentityMatches((prev) => ({ ...prev, ...draftPayload.identityMatches }));
        if (draftPayload.verificationMethods) setVerificationMethods((prev) => ({ ...prev, ...draftPayload.verificationMethods }));
        if (draftPayload.infectionState) setInfectionState((prev) => ({ ...prev, ...draftPayload.infectionState }));
        if (draftPayload.consumablesState) setConsumablesState((prev) => ({ ...prev, ...draftPayload.consumablesState }));
        if (typeof draftPayload.notesText === 'string') setNotesText(draftPayload.notesText);
      } else {
        setIdentityMatches(EMPTY_IDENTITY);
        setVerificationMethods(EMPTY_METHODS);
        setNotesText('');
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load patient verification data';
      setError(errMsg);
      notifyError(errMsg);
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
    loadVerificationData();
  }, [loadVerificationData]);

  const patientDetails = useMemo(() => {
    if (!patientRaw) return null;
    const p = patientRaw.patient || patientRaw;
    const rawId = p.id || p.patient_id || patientId || '';
    const patientCode = p.patient_code || p.patientCode || (rawId ? `P${String(rawId).padStart(5, '0')}` : MISSING);
    const dob = p.dob || p.date_of_birth || p.birth_date || null;
    const rawGender = p.gender || p.sex;
    const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || MISSING);
    const age = p.age ? String(p.age) : (dob ? calculateAge(dob) : MISSING);
    const bedNo = assignment.bedNumber || p.bed_number || MISSING;
    const machineNo = assignment.machineNumber || p.machine_number || MISSING;

    return {
      id: rawId,
      patientCode,
      name: p.name || p.patient_name || MISSING,
      dobFormatted: dob ? formatDate(dob) : MISSING,
      hasDob: Boolean(dob),
      age,
      gender,
      phone: p.phone_no || p.number || p.phone || p.phone_number || p.mobile_no || MISSING,
      bloodGroup: p.blood_group || p.bloodGroup || MISSING,
      dryWeight: p.dry_weight || p.dryWeight || MISSING,
      status: p.patient_status || p.status || MISSING,
      schedule: p.last_dialysis_date ? formatDate(p.last_dialysis_date) : MISSING,
      shift: assignment.shift || p.shift_time || MISSING,
      bedMachine: `${bedNo} / ${machineNo}`,
      dialysisType: p.dialysis_type || MISSING,
      nephrologist: p.primary_doctor_name || p.doctor_name || MISSING,
      vascularAccess: p.vascular_access || p.access_type || MISSING,
      assignment: {
        shift: assignment.shift || p.shift_time || MISSING,
        bedMachine: `${bedNo} / ${machineNo}`,
        technician: assignment.technician || MISSING,
      },
    };
  }, [patientRaw, patientId, assignment]);

  const prescriptionDetails = useMemo(() => {
    const rx = pickPrescription(prescriptionRaw);
    if (!rx) {
      return {
        hasPrescription: false,
        valid: false,
        physician: MISSING,
        prescriptionDate: MISSING,
        dialysisType: MISSING,
        prescribedDuration: MISSING,
        bfr: MISSING,
        dfr: MISSING,
        dialysateTemp: MISSING,
        ufGoal: MISSING,
        heparin: MISSING,
        dialysateComposition: {
          potassium: MISSING,
          calcium: MISSING,
          sodium: MISSING,
          bicarbonate: MISSING,
        },
      };
    }
    return {
      hasPrescription: true,
      valid: true,
      physician: liveValue(rx.doctor_name || rx.physician || rx.prescriptionGivenBy),
      prescriptionDate: rx.updated_at || rx.Date || rx.created_at ? formatDate(rx.updated_at || rx.Date || rx.created_at) : MISSING,
      dialysisType: liveValue(rx.dialysis_type),
      prescribedDuration: liveValue(rx.dialysis_time || rx.duration || rx.prescribed_duration_mins),
      bfr: liveValue(rx.blood_flow_rate || rx.bfr),
      dfr: liveValue(rx.dialysate_flow_rate || rx.dfr),
      dialysateTemp: liveValue(rx.dialysate_temp),
      ufGoal: liveValue(rx.uf_goal || rx.uf_goal_ml || rx.target_uf),
      heparin: liveValue(rx.heparin),
      dialysateComposition: {
        potassium: liveValue(rx.potassium || rx.k),
        calcium: liveValue(rx.calcium),
        sodium: liveValue(rx.sodium || rx.na),
        bicarbonate: liveValue(rx.bicarbonate || rx.hco3),
      },
    };
  }, [prescriptionRaw]);

  const handleInfectionEnterNow = (newHiv, newHep) => {
    setInfectionState({
      hivStatus: newHiv || INFECTION_STATUS.PENDING,
      hepatitisStatus: newHep || INFECTION_STATUS.PENDING,
      actioned: true,
      skipped: false,
    });
    notifySuccess('Infection status updated for this session');
  };

  const handleInfectionSkip = () => {
    setInfectionState((prev) => ({
      ...prev,
      actioned: true,
      skipped: true,
    }));
    notifySuccess('Skip recorded — nephrologist will be alerted on save');
  };

  const updateConsumables = (updates) => {
    setConsumablesState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const identityValid = checkIdentityMatch(identityMatches);
  const methodValid = Boolean(
    verificationMethods.patientConfirmed ||
    verificationMethods.idCardVerified ||
    verificationMethods.wristbandVerified
  );
  const infectionValid = checkInfectionGateResolved(
    infectionState.hivStatus,
    infectionState.hepatitisStatus,
    infectionState.actioned
  );
  const consumablesValid = checkConsumablesValid(consumablesState);
  const prescriptionValid = Boolean(prescriptionDetails.valid);
  const canProceed = identityValid && methodValid && infectionValid && consumablesValid && (
    PRESCRIPTION_GATE_ENABLED ? prescriptionValid : true
  );

  const currentDraft = useMemo(() => ({
    identityMatches,
    verificationMethods,
    infectionState,
    consumablesState,
    notesText,
  }), [identityMatches, verificationMethods, infectionState, consumablesState, notesText]);

  const saveDraft = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to save this draft against.');
      return false;
    }
    setSaving(true);
    try {
      await saveP2Draft(activeSessionId, 'P2-04', currentDraft);
      const res = await submitSessionVerification(activeSessionId, {
        status: 'draft',
        identity_matched: identityValid,
        identity_name_match: identityMatches.nameMatched,
        identity_dob_match: identityMatches.dobMatched,
        identity_pid_match: identityMatches.pidMatched,
        identity_phone_match: identityMatches.phoneMatched,
        ...(PRESCRIPTION_GATE_ENABLED || prescriptionValid ? { prescription_valid: prescriptionValid } : {}),
        hiv_status: infectionState.hivStatus,
        hepatitis_status: infectionState.hepatitisStatus,
        hiv_skipped: infectionState.skipped,
        hepatitis_skipped: infectionState.skipped,
        notes: notesText,
      });
      if (!res?.success) {
        notifyError(res?.message || 'Could not save verification draft');
        return false;
      }
      notifySuccess('Draft saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save verification draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, currentDraft, identityValid, identityMatches, prescriptionValid, infectionState, notesText]);

  const submitFinal = useCallback(async () => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      const verificationRes = await submitSessionVerification(activeSessionId, {
        status: 'final',
        identity_matched: identityValid,
        identity_name_match: identityMatches.nameMatched,
        identity_dob_match: identityMatches.dobMatched,
        identity_pid_match: identityMatches.pidMatched,
        identity_phone_match: identityMatches.phoneMatched,
        ...(PRESCRIPTION_GATE_ENABLED || prescriptionValid ? { prescription_valid: prescriptionValid } : {}),
        hiv_status: infectionState.hivStatus,
        hepatitis_status: infectionState.hepatitisStatus,
        hiv_skipped: infectionState.skipped,
        hepatitis_skipped: infectionState.skipped,
        notes: notesText,
      });
      if (!verificationRes?.success) {
        notifyError(verificationRes?.message || 'Verification could not be saved');
        return false;
      }

      let reuseAction = 'none';
      if (consumablesState.reuseAction === 'NEW_DIALYZER') reuseAction = 'confirmed_new';
      if (consumablesState.reuseAction === 'OVERRIDE') reuseAction = 'overridden';

      const consumablesRes = await submitSessionConsumables(activeSessionId, {
        dialyzer_type: consumablesState.dialyzerType === DIALYZER_USAGE_TYPE.MULTI_USE ? 'MULTI_USE' : 'SINGLE_USE',
        dialyzer_id: consumablesState.dialyzerId || null,
        reuse_action: reuseAction,
        old_dialyzer_discard_confirmed: Boolean(consumablesState.discardConfirmed),
        override_reason: consumablesState.overrideReason || '',
        tubing_set_qty: Number(consumablesState.tubingSetQty) || null,
        needles_qty: consumablesState.needlesQty === '' ? null : Number(consumablesState.needlesQty),
      });
      if (!consumablesRes?.success) {
        notifyError(consumablesRes?.message || 'Consumables could not be saved');
        return false;
      }

      await saveP2Draft(activeSessionId, 'P2-04', currentDraft);
      notifySuccess('Verification saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Verification could not be saved');
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    canProceed,
    activeSessionId,
    identityValid,
    identityMatches,
    prescriptionValid,
    infectionState,
    notesText,
    consumablesState,
    currentDraft,
  ]);

  return {
    patientDetails,
    prescriptionDetails,
    identityMatches,
    setIdentityMatches,
    verificationMethods,
    setVerificationMethods,
    infectionState,
    consumablesState,
    updateConsumables,
    handleInfectionEnterNow,
    handleInfectionSkip,
    notesText,
    setNotesText,
    identityValid,
    infectionValid,
    consumablesValid,
    prescriptionValid,
    canProceed,
    loading,
    saving,
    error,
    refresh: loadVerificationData,
    saveDraft,
    submitFinal,
  };
}
