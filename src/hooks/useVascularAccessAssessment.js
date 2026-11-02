/**
 * useVascularAccessAssessment — P2-07 Vascular Access Assessment Hook
 *
 * @file src/hooks/useVascularAccessAssessment.js
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getPatientDetails,
  getPatientAlerts,
  getSessionVascularAccess,
  submitVascularAccess,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { normalizeAlertsList } from './usePreDialysisDashboard';
import { MISSING, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';
import { AVF_AVG_CONFIG, CVC_CONFIG, validateVascularAccess } from '../pages/dialysis/vascularAccessValidation';

export const FIELD_API_KEYS = {
  thrillBruit: 'thrill_bruit',
  accessSiteAppearance: 'access_site_appearance',
  signsOfInfection: 'signs_of_infection',
  bleedingDischarge: 'bleeding_discharge',
  aneurysm: 'aneurysm',
  cannulationZone: 'cannulation_zone',
  accessFlow: 'access_flow_ml_min',
  dressingIntact: 'dressing_intact',
  tendernessPain: 'tenderness_pain',
  exitSiteClean: 'exit_site_clean',
  signsOfInfectionCVC: 'cvc_signs_of_infection',
  catheterPatent: 'catheter_patent',
};

export const OPTIONAL_ACCESS_FIELDS_AVF = [
  { key: 'accessSiteAppearance', field_name: 'access_site_appearance', label: 'Access Site Appearance' },
  { key: 'cannulationZone', field_name: 'cannulation_zone', label: 'Cannulation Zone' },
  { key: 'aneurysm', field_name: 'aneurysm', label: 'Aneurysm / Pseudoaneurysm' },
];

export const OPTIONAL_ACCESS_FIELDS_CVC = [
  { key: 'dressingIntact', field_name: 'dressing_intact', label: 'Dressing Intact' },
  { key: 'exitSiteClean', field_name: 'exit_site_clean', label: 'Exit Site Clean' },
];

const ACCESS_TYPE_LABELS = {
  AVF: 'AV Fistula (AVF)',
  AVG: 'AV Graft (AVG)',
  CVC: 'Central Venous Catheter (CVC)',
};

function resolveAccessType(value) {
  const raw = String(value || '').toLowerCase();
  if (!raw.trim()) return '';
  if (raw.includes('cvc') || raw.includes('catheter')) return 'CVC';
  if (raw.includes('avg') || raw.includes('graft')) return 'AVG';
  if (raw.includes('avf') || raw.includes('fistula')) return 'AVF';
  if (raw === 'avf' || raw === 'avg' || raw === 'cvc') return raw.toUpperCase();
  return '';
}

function normalizeFieldValue(fieldId, value) {
  if (value === undefined || value === null || value === '') return '';
  const raw = String(value).toLowerCase();
  if (fieldId === 'cannulationZone') {
    if (raw === 'adequate' || raw === 'good') return 'Good';
    if (raw === 'limited') return 'Limited';
    if (raw === 'poor') return 'Poor';
  }
  const known = {
    yes: 'Yes',
    no: 'No',
    present: 'Present',
    weak: 'Weak',
    absent: 'Absent',
    normal: 'Normal',
    redness: 'Redness',
    swelling: 'Swelling',
    other: 'Other',
  }[raw];
  return known || String(value).trim();
}

function formFromRow(row) {
  if (!row) return {};
  return Object.entries(FIELD_API_KEYS).reduce((result, [fieldId, apiKey]) => {
    const value = row[apiKey];
    if (value !== undefined && value !== null && value !== '') {
      result[fieldId] = fieldId === 'accessFlow' ? String(value) : normalizeFieldValue(fieldId, value);
    }
    return result;
  }, {});
}

function parseDetails(row) {
  const raw = row?.details_json ?? row?.details ?? {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  return raw && typeof raw === 'object' ? raw : {};
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function useVascularAccessAssessment(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [assessmentTime, setAssessmentTime] = useState(MISSING);
  const [accessDetails, setAccessDetails] = useState({
    accessType: MISSING,
    location: MISSING,
    dateCreated: MISSING,
    surgeon: MISSING,
    lastReviewed: MISSING,
  });

  const [accessType, setAccessType] = useState('');
  const [formData, setFormData] = useState({});
  const [detailsData, setDetailsData] = useState({});
  const [additionalObservations, setAdditionalObservations] = useState('');

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skippedFieldsList, setSkippedFieldsList] = useState([]);
  const [skipReasons, setSkipReasons] = useState({});

  const currentConfig = useMemo(() => {
    if (accessType === 'AVF' || accessType === 'AVG') return AVF_AVG_CONFIG;
    if (accessType === 'CVC') return CVC_CONFIG;
    return [];
  }, [accessType]);

  const optionalFields = useMemo(() => {
    if (accessType === 'CVC') return OPTIONAL_ACCESS_FIELDS_CVC;
    if (accessType === 'AVF' || accessType === 'AVG') return OPTIONAL_ACCESS_FIELDS_AVF;
    return [];
  }, [accessType]);

  const { isCriticalFailed, criticalErrors, validationErrors } = useMemo(
    () => validateVascularAccess(accessType, currentConfig, formData),
    [accessType, currentConfig, formData]
  );

  const canProceed = !isCriticalFailed && validationErrors.length === 0;

  const loadPage = useCallback(async () => {
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
      const [patientRes, accessRes, alertsRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getSessionVascularAccess(activeSessionId),
        getPatientAlerts(patientId),
        loadP2Draft(activeSessionId, 'P2-07'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }

      const patientData = unwrapRecord(patientRes.data, ['patient']) || patientRes.data;
      setPatientRaw(patientData);
      setAlerts(alertsRes?.success ? normalizeAlertsList(alertsRes.data) : []);

      const payload = accessRes?.success ? accessRes.data : null;
      const savedRow = payload?.assessment || null;
      const lastReview = payload?.last_review || null;
      const sessionAccessType = resolveAccessType(payload?.session_access_type);
      const savedAccessType = resolveAccessType(savedRow?.access_type);

      setAccessDetails({
        accessType: ACCESS_TYPE_LABELS[savedAccessType || sessionAccessType || resolveAccessType(lastReview?.access_type)] || MISSING,
        location: MISSING,
        dateCreated: MISSING,
        surgeon: MISSING,
        lastReviewed: formatIst(lastReview?.recorded_at),
      });

      if (savedRow && savedAccessType) {
        setAccessType(savedAccessType);
        setFormData(formFromRow(savedRow));
        setDetailsData(parseDetails(savedRow));
        setAdditionalObservations(savedRow.additional_observations || '');
        setAssessmentTime(formatIst(savedRow.recorded_at) || formatIst(new Date()));
      } else if (draft?.payload && typeof draft.payload === 'object') {
        setAccessType(draft.payload.accessType || '');
        setFormData(draft.payload.formData || {});
        setDetailsData(draft.payload.detailsData || {});
        setAdditionalObservations(draft.payload.additionalObservations || '');
        if (Array.isArray(draft.payload.skippedFieldsList)) setSkippedFieldsList(draft.payload.skippedFieldsList);
        if (draft.payload.skipReasons && typeof draft.payload.skipReasons === 'object') setSkipReasons(draft.payload.skipReasons);
        setAssessmentTime(formatIst(draft.savedAt) || formatIst(new Date()));
      } else {
        setAccessType('');
        setFormData({});
        setDetailsData({});
        setAdditionalObservations('');
        setAssessmentTime(formatIst(new Date()));
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load vascular access assessment';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, patientId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const updateAccessType = (nextType) => {
    setAccessType(nextType);
    setFormData({});
    setDetailsData({});
  };

  const updateField = (id, val) => {
    setFormData((prev) => ({ ...prev, [id]: val }));
  };

  const updateDetails = (id, val) => {
    setDetailsData((prev) => ({ ...prev, [id]: String(val).slice(0, 300) }));
  };

  const updateObservations = (val) => {
    setAdditionalObservations(String(val).slice(0, 300));
  };

  const checkSkippedNonMandatory = () => optionalFields
    .filter((field) => formData[field.key] === '' || formData[field.key] === null || formData[field.key] === undefined)
    .map((field) => field.label);

  const persistLocalDraft = useCallback(async (extra = {}) => {
    if (!activeSessionId) return;
    await saveP2Draft(activeSessionId, 'P2-07', {
      accessType,
      formData,
      detailsData,
      additionalObservations,
      skippedFieldsList,
      skipReasons,
      ...extra,
    });
  }, [activeSessionId, accessType, formData, detailsData, additionalObservations, skippedFieldsList, skipReasons]);

  const buildPayload = useCallback((status, skips = []) => {
    const payload = {
      status,
      access_type: accessType,
      additional_observations: additionalObservations || '',
      details_json: detailsData,
      skips: skips.map((skip) => ({
        field_name: skip.field_name || skip,
        reason: skip.reason || null,
      })),
    };

    if (accessType === 'CVC') {
      payload.dressing_intact = formData.dressingIntact ? String(formData.dressingIntact).toLowerCase() : null;
      payload.tenderness_pain = formData.tendernessPain ? String(formData.tendernessPain).toLowerCase() : null;
      payload.exit_site_clean = formData.exitSiteClean ? String(formData.exitSiteClean).toLowerCase() : null;
      payload.cvc_signs_of_infection = formData.signsOfInfectionCVC ? String(formData.signsOfInfectionCVC).toLowerCase() : null;
      payload.catheter_patent = formData.catheterPatent ? String(formData.catheterPatent).toLowerCase() : null;
    } else {
      payload.thrill_bruit = formData.thrillBruit ? String(formData.thrillBruit).toLowerCase() : null;
      payload.access_site_appearance = formData.accessSiteAppearance ? String(formData.accessSiteAppearance).toLowerCase() : null;
      payload.signs_of_infection = formData.signsOfInfection ? String(formData.signsOfInfection).toLowerCase() : null;
      payload.bleeding_discharge = formData.bleedingDischarge ? String(formData.bleedingDischarge).toLowerCase() : null;
      payload.aneurysm = formData.aneurysm ? String(formData.aneurysm).toLowerCase() : null;
      payload.cannulation_zone = formData.cannulationZone === 'Good'
        ? 'adequate'
        : (formData.cannulationZone ? String(formData.cannulationZone).toLowerCase() : null);
      payload.access_flow_ml_min = optionalNumber(formData.accessFlow);
    }

    return payload;
  }, [accessType, additionalObservations, detailsData, formData]);

  const saveDraft = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to save this draft against.');
      return false;
    }
    setSaving(true);
    try {
      await persistLocalDraft();
      if (!accessType) {
        notifySuccess('Draft saved');
        return true;
      }
      const res = await submitVascularAccess(activeSessionId, buildPayload('draft'));
      if (!res?.success) {
        notifyError(res?.message || 'Could not save vascular access draft');
        return false;
      }
      notifySuccess('Draft saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save vascular access draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, accessType, persistLocalDraft, buildPayload]);

  const submitFinal = useCallback(async (skips = []) => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      const res = await submitVascularAccess(activeSessionId, buildPayload('final', skips));
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Vascular access could not be saved');
        return false;
      }
      await persistLocalDraft({ skippedFieldsList: skips.map((skip) => skip.field_name || skip) });
      notifySuccess('Vascular access assessment saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Vascular access could not be saved');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, buildPayload, persistLocalDraft]);

  return {
    patientRaw,
    accessType,
    formData,
    detailsData,
    additionalObservations,
    currentConfig,
    isCriticalFailed,
    criticalErrors,
    validationErrors,
    canProceed,
    alerts,
    accessDetails,
    assessmentTime,
    updateAccessType,
    updateField,
    updateDetails,
    updateObservations,
    showSkipModal,
    setShowSkipModal,
    skippedFieldsList,
    setSkippedFieldsList,
    skipReasons,
    setSkipReasons,
    checkSkippedNonMandatory,
    optionalFields,
    loading,
    saving,
    error,
    refresh: loadPage,
    saveDraft,
    submitFinal,
  };
}
