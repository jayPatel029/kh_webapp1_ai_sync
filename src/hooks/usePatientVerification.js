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
  getPatientDialyzerStatus,
  getPatientStandingOrder,
  getSessionSettings,
  putPatientDryWeight,
  putSessionSettings,
  submitSessionVerification,
  submitSessionConsumables,
} from '../ApiCalls/preDialysisApis';
import { calculateAge, formatDate } from './usePatientSummary';
import { notifyError, notifySuccess } from '../helpers/notify';
import { MISSING, unwrapList, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';

const EMPTY_TODAY_SETTINGS = {
  dialyzer: '',
  bfr_ml_min: '',
  dfr_ml_min: '',
  duration_hours: '',
  dialysate_temp: '',
  na: '',
  k: '',
  bicarbonate: '',
  out_of_range_reason: '',
  source: 'manual',
};

function asInput(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  return String(value);
}

function settingsFromRow(row) {
  if (!row) return { ...EMPTY_TODAY_SETTINGS };
  return {
    dialyzer: asInput(row.dialyzer),
    bfr_ml_min: asInput(row.bfr_ml_min),
    dfr_ml_min: asInput(row.dfr_ml_min),
    duration_hours: asInput(row.duration_hours),
    dialysate_temp: asInput(row.dialysate_temp),
    na: asInput(row.na),
    k: asInput(row.k),
    bicarbonate: asInput(row.bicarbonate),
    out_of_range_reason: asInput(row.out_of_range_reason),
    source: row.source || 'manual',
  };
}

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
  TEST_IN_PROGRESS: 'Test in progress awaiting result',
  TEST_NOT_DONE: 'Test not done',
};

export const INFECTION_STATUS_OPTIONS = [
  INFECTION_STATUS.POSITIVE,
  INFECTION_STATUS.NEGATIVE,
  INFECTION_STATUS.TEST_IN_PROGRESS,
  INFECTION_STATUS.TEST_NOT_DONE,
];

export const isInfectionStatusUnresolved = (status) => (
  status !== INFECTION_STATUS.POSITIVE && status !== INFECTION_STATUS.NEGATIVE
);

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
  if (!isInfectionStatusUnresolved(hivStatus) && !isInfectionStatusUnresolved(hepatitisStatus)) {
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
  if (!value) return INFECTION_STATUS.TEST_NOT_DONE;
  if (value === 'negative' || value === 'neg') return INFECTION_STATUS.NEGATIVE;
  if (value === 'positive' || value === 'pos') return INFECTION_STATUS.POSITIVE;
  if (
    value === 'test in progress awaiting result'
    || value === 'test in progress'
    || value === 'awaiting result'
  ) {
    return INFECTION_STATUS.TEST_IN_PROGRESS;
  }
  if (
    value === 'test not done'
    || value === 'not done'
    || value === 'pending'
  ) {
    return INFECTION_STATUS.TEST_NOT_DONE;
  }
  const exact = INFECTION_STATUS_OPTIONS.find((opt) => opt.toLowerCase() === value);
  return exact || INFECTION_STATUS.TEST_NOT_DONE;
};

export default function usePatientVerification(patientId, rawSessionId, assignmentHint = null) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [standingOrder, setStandingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dryWeightInput, setDryWeightInput] = useState('');
  const [todaySettings, setTodaySettings] = useState(EMPTY_TODAY_SETTINGS);

  const [identityMatches, setIdentityMatches] = useState(EMPTY_IDENTITY);
  const [verificationMethods, setVerificationMethods] = useState(EMPTY_METHODS);
  const [infectionState, setInfectionState] = useState({
    hivStatus: INFECTION_STATUS.TEST_NOT_DONE,
    hepatitisStatus: INFECTION_STATUS.TEST_NOT_DONE,
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
      const [patientRes, orderRes, settingsRes, dialyzerRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getPatientStandingOrder(patientId),
        getSessionSettings(activeSessionId),
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
      const order = orderRes?.success ? (orderRes.data || null) : null;
      setStandingOrder(order);
      setDryWeightInput(asInput(order?.dry_weight || patientData?.dry_weight));
      const settingsPayload = settingsRes?.success ? settingsRes.data : null;
      const nextSettings = settingsFromRow(settingsPayload?.settings || settingsPayload?.prefill);
      if (settingsPayload?.prefill && !settingsPayload?.settings) nextSettings.source = 'last_session';
      setTodaySettings(nextSettings);

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
        if (draftPayload.dryWeightInput != null) setDryWeightInput(asInput(draftPayload.dryWeightInput));
        if (draftPayload.todaySettings) setTodaySettings((prev) => ({ ...prev, ...draftPayload.todaySettings }));
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
      dryWeight: standingOrder?.dry_weight || p.dry_weight || p.dryWeight || MISSING,
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
  }, [patientRaw, patientId, assignment, standingOrder]);

  const heparinLabel = standingOrder?.heparin?.label || MISSING;
  const dryWeightValid = Number.isFinite(Number(dryWeightInput)) && Number(dryWeightInput) >= 20 && Number(dryWeightInput) <= 200;
  const durationValid = Number.isFinite(Number(todaySettings.duration_hours)) && Number(todaySettings.duration_hours) > 0;

  const handleInfectionEnterNow = (newHiv, newHep) => {
    setInfectionState({
      hivStatus: newHiv || INFECTION_STATUS.TEST_NOT_DONE,
      hepatitisStatus: newHep || INFECTION_STATUS.TEST_NOT_DONE,
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
  const canProceed = identityValid && methodValid && infectionValid && consumablesValid && dryWeightValid && durationValid;

  const currentDraft = useMemo(() => ({
    identityMatches,
    verificationMethods,
    infectionState,
    consumablesState,
    notesText,
    dryWeightInput,
    todaySettings,
  }), [identityMatches, verificationMethods, infectionState, consumablesState, notesText, dryWeightInput, todaySettings]);

  const updateTodaySettings = (updates) => {
    setTodaySettings((prev) => ({ ...prev, ...updates, source: 'manual' }));
  };

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
  }, [activeSessionId, currentDraft, identityValid, identityMatches, infectionState, notesText]);

  const submitFinal = useCallback(async () => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      const dryRes = await putPatientDryWeight(patientId, {
        dry_weight: Number(dryWeightInput),
        session_id: activeSessionId,
      });
      if (!dryRes?.success) {
        notifyError(dryRes?.message || 'Dry weight could not be saved');
        return false;
      }
      setStandingOrder(dryRes.data || standingOrder);

      const settingsRes = await putSessionSettings(activeSessionId, {
        ...todaySettings,
        duration_hours: Number(todaySettings.duration_hours),
        bfr_ml_min: todaySettings.bfr_ml_min === '' ? null : Number(todaySettings.bfr_ml_min),
        dfr_ml_min: todaySettings.dfr_ml_min === '' ? null : Number(todaySettings.dfr_ml_min),
        dialysate_temp: todaySettings.dialysate_temp === '' ? null : Number(todaySettings.dialysate_temp),
        na: todaySettings.na === '' ? null : Number(todaySettings.na),
        k: todaySettings.k === '' ? null : Number(todaySettings.k),
        bicarbonate: todaySettings.bicarbonate === '' ? null : Number(todaySettings.bicarbonate),
      });
      if (!settingsRes?.success) {
        notifyError(settingsRes?.message || 'Today\'s settings could not be saved');
        return false;
      }

      const verificationRes = await submitSessionVerification(activeSessionId, {
        status: 'final',
        identity_matched: identityValid,
        identity_name_match: identityMatches.nameMatched,
        identity_dob_match: identityMatches.dobMatched,
        identity_pid_match: identityMatches.pidMatched,
        identity_phone_match: identityMatches.phoneMatched,
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
    infectionState,
    notesText,
    consumablesState,
    currentDraft,
    patientId,
    dryWeightInput,
    todaySettings,
    standingOrder,
  ]);

  return {
    patientDetails,
    standingOrder,
    heparinLabel,
    dryWeightInput,
    setDryWeightInput,
    todaySettings,
    updateTodaySettings,
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
    dryWeightValid,
    durationValid,
    canProceed,
    loading,
    saving,
    error,
    refresh: loadVerificationData,
    saveDraft,
    submitFinal,
  };
}
