/**
 * useInfectionControl — P2-10 Infection Control Hook
 *
 * Session-scoped checklist entry. Empty until the technician marks each item.
 * Access type comes from P2-07 / dialysis_sessions, not re-entered here.
 *
 * @file src/hooks/useInfectionControl.js
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPatientDetails,
  getSessionInfectionControl,
  submitInfectionControl,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { MISSING, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';
import {
  INFECTION_ITEM_KEYS,
  TRI_ITEM_KEYS,
  canProceedInfectionControl,
  computeInfectionCompliancePct,
  getCriticalInfectionIssues,
  isInfectionItemCompliant,
  isNaInfectionValue,
  isScrubHubPassed,
  normalizeAccessType,
} from '../pages/dialysis/infectionControlValidation';

export const EMPTY_ITEMS = INFECTION_ITEM_KEYS.reduce((acc, key) => {
  acc[key] = null;
  return acc;
}, {});

function normalizeItemValue(key, value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 1 || value === 'true') return true;
  if (value === false || value === 0 || value === 'false') return false;
  if (isNaInfectionValue(value)) return 'not_applicable';
  if (TRI_ITEM_KEYS.includes(key) && isInfectionItemCompliant(value)) return true;
  return value;
}

function itemsFromChecklist(checklist) {
  const raw = checklist?.items_json || checklist?.items || {};
  const next = { ...EMPTY_ITEMS };
  INFECTION_ITEM_KEYS.forEach((key) => {
    next[key] = normalizeItemValue(key, raw[key]);
  });
  return next;
}

export default function useInfectionControl(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accessType, setAccessType] = useState('');
  const [items, setItems] = useState({ ...EMPTY_ITEMS });
  const [scrubHub, setScrubHub] = useState(null);
  const [notes, setNotes] = useState('');
  const [stepInfection, setStepInfection] = useState('pending');
  const [recordedAt, setRecordedAt] = useState(null);
  const [recordedByName, setRecordedByName] = useState('');
  const [loadedAt, setLoadedAt] = useState(MISSING);

  const criticalInvalid = useMemo(
    () => getCriticalInfectionIssues(items, accessType, scrubHub),
    [items, accessType, scrubHub]
  );

  const canProceed = useMemo(
    () => canProceedInfectionControl(items, accessType, scrubHub),
    [items, accessType, scrubHub]
  );

  const compliancePct = useMemo(
    () => computeInfectionCompliancePct(items, accessType, scrubHub),
    [items, accessType, scrubHub]
  );

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
      const [patientRes, safetyRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getSessionInfectionControl(activeSessionId),
        loadP2Draft(activeSessionId, 'P2-10'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }
      setPatientRaw(unwrapRecord(patientRes.data, ['patient']) || patientRes.data);

      if (safetyRes?.success && safetyRes.data) {
        const payload = safetyRes.data;
        const nextAccess = normalizeAccessType(payload.access_type || payload.session_access_type);
        setAccessType(nextAccess);
        setStepInfection(payload.step_infection || 'pending');

        if (payload.checklist) {
          setItems(itemsFromChecklist(payload.checklist));
          const scrub = payload.checklist.scrub_the_hub_result;
          setScrubHub(
            scrub == null || scrub === ''
              ? null
              : (isScrubHubPassed(scrub) ? 'yes' : String(scrub).toLowerCase() === 'no' ? 'no' : scrub)
          );
          setNotes(payload.checklist.notes || '');
          setRecordedAt(payload.checklist.recorded_at || null);
          setRecordedByName(payload.checklist.recorded_by_name || '');
        } else if (draft?.payload && typeof draft.payload === 'object') {
          setAccessType(normalizeAccessType(draft.payload.accessType) || nextAccess);
          setItems({ ...EMPTY_ITEMS, ...(draft.payload.items || {}) });
          setScrubHub(draft.payload.scrubHub ?? null);
          setNotes(draft.payload.notes || '');
        } else {
          setItems({ ...EMPTY_ITEMS });
          setScrubHub(null);
          setNotes('');
          setRecordedAt(null);
          setRecordedByName('');
        }
        setLoadedAt(formatIst(new Date()));
      } else if (draft?.payload && typeof draft.payload === 'object') {
        setAccessType(normalizeAccessType(draft.payload.accessType));
        setItems({ ...EMPTY_ITEMS, ...(draft.payload.items || {}) });
        setScrubHub(draft.payload.scrubHub ?? null);
        setNotes(draft.payload.notes || '');
        setLoadedAt(formatIst(draft.savedAt) || formatIst(new Date()));
        setError(safetyRes?.message || 'Could not refresh infection control. Showing last saved draft.');
      } else {
        setItems({ ...EMPTY_ITEMS });
        setScrubHub(null);
        setNotes('');
        setLoadedAt(formatIst(new Date()));
        if (!safetyRes?.success) {
          setError(safetyRes?.message || 'Could not load infection control for this session');
        }
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load infection control';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, patientId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const setItem = useCallback((key, value) => {
    setItems((prev) => ({ ...prev, [key]: value }));
  }, []);

  const persistLocalDraft = useCallback(async () => {
    if (!activeSessionId) return;
    await saveP2Draft(activeSessionId, 'P2-10', {
      accessType,
      items,
      scrubHub,
      notes,
      stepInfection,
    });
  }, [activeSessionId, accessType, items, scrubHub, notes, stepInfection]);

  const buildPayload = useCallback((status) => {
    const boolOrNull = (v) => {
      if (v === null || v === undefined || v === '') return null;
      return !!v;
    };
    const triOrNull = (v) => {
      if (v === null || v === undefined || v === '') return null;
      if (v === 'not_applicable') return 'not_applicable';
      return !!v;
    };
    return {
      status,
      access_type: accessType || undefined,
      items: {
        hand_hygiene: boolOrNull(items.hand_hygiene),
        aseptic_technique: boolOrNull(items.aseptic_technique),
        sharps_handling: boolOrNull(items.sharps_handling),
        ppe: boolOrNull(items.ppe),
        work_area_clean: boolOrNull(items.work_area_clean),
        dialysis_machine_disinfected: boolOrNull(items.dialysis_machine_disinfected),
        ro_system_disinfection: triOrNull(items.ro_system_disinfection),
        dialyzer_reuse: triOrNull(items.dialyzer_reuse),
        biomedical_waste: boolOrNull(items.biomedical_waste),
        isolation_precautions: triOrNull(items.isolation_precautions),
      },
      scrub_the_hub_result: normalizeAccessType(accessType) === 'CVC'
        ? (scrubHub == null || scrubHub === ''
          ? null
          : (isScrubHubPassed(scrubHub) ? 'yes' : 'no'))
        : null,
      notes: notes ? String(notes).slice(0, 200) : '',
      skips: [],
    };
  }, [accessType, items, scrubHub, notes]);

  const saveDraft = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to save this draft against.');
      return false;
    }
    setSaving(true);
    try {
      const res = await submitInfectionControl(activeSessionId, buildPayload('draft'));
      if (!res?.success) {
        notifyError(res?.message || 'Could not save infection control draft');
        return false;
      }
      await persistLocalDraft();
      notifySuccess('Draft saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save infection control draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, buildPayload, persistLocalDraft]);

  const submitFinal = useCallback(async () => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    setSaving(true);
    try {
      const res = await submitInfectionControl(activeSessionId, buildPayload('final'));
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Infection control could not be saved');
        return false;
      }
      await persistLocalDraft();
      setStepInfection('complete');
      setRecordedAt(new Date().toISOString());
      notifySuccess('Infection control saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Infection control could not be saved');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, buildPayload, persistLocalDraft]);

  return {
    patientRaw,
    accessType,
    items,
    scrubHub,
    notes,
    stepInfection,
    recordedAt,
    recordedByName,
    loadedAt,
    criticalInvalid,
    canProceed,
    compliancePct,
    loading,
    saving,
    error,
    setItem,
    setScrubHub,
    setNotes,
    refresh: loadPage,
    saveDraft,
    submitFinal,
  };
}
