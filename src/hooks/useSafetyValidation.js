/**
 * useSafetyValidation — P2-11 Safety Validation Hook
 *
 * Live rollup of steps 1–7. Validate & Continue only when all are complete.
 *
 * @file src/hooks/useSafetyValidation.js
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPatientDetails,
  getPatientAlerts,
  getSessionSafetyValidation,
  validateSafetyChecklist,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { normalizeAlertsList } from './usePreDialysisDashboard';
import { MISSING, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';
import {
  buildBlockingIssues,
  canProceedSafetyValidation,
  normalizeSafetySteps,
} from '../pages/dialysis/safetyValidationLogic';

export default function useSafetyValidation(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [itemsSkipped, setItemsSkipped] = useState([]);
  const [notes, setNotes] = useState('');
  const [stepSafety, setStepSafety] = useState('pending');
  const [loadedAt, setLoadedAt] = useState(MISSING);

  const normalizedSteps = useMemo(() => normalizeSafetySteps(steps), [steps]);
  const blockingIssues = useMemo(() => buildBlockingIssues(normalizedSteps), [normalizedSteps]);
  const canProceed = useMemo(
    () => canProceedSafetyValidation(normalizedSteps),
    [normalizedSteps]
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
      const [patientRes, safetyRes, alertsRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getSessionSafetyValidation(activeSessionId),
        getPatientAlerts(patientId),
        loadP2Draft(activeSessionId, 'P2-11'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }
      setPatientRaw(unwrapRecord(patientRes.data, ['patient']) || patientRes.data);
      setAlerts(alertsRes?.success ? normalizeAlertsList(alertsRes.data) : []);

      if (safetyRes?.success && safetyRes.data) {
        const payload = safetyRes.data;
        setSteps(payload.per_step || []);
        setItemsSkipped(payload.items_skipped || []);
        setStepSafety(payload.step_safety || 'pending');
        if (payload.validation?.notes) {
          setNotes(String(payload.validation.notes));
        } else if (draft?.payload?.notes) {
          setNotes(String(draft.payload.notes));
        } else {
          setNotes('');
        }
        setLoadedAt(formatIst(new Date()));
      } else if (draft?.payload) {
        setSteps(draft.payload.steps || []);
        setItemsSkipped(draft.payload.itemsSkipped || []);
        setNotes(draft.payload.notes || '');
        setLoadedAt(formatIst(draft.savedAt) || formatIst(new Date()));
        setError(safetyRes?.message || 'Could not refresh safety validation. Showing last saved draft.');
      } else {
        setSteps([]);
        setItemsSkipped([]);
        setNotes('');
        setLoadedAt(formatIst(new Date()));
        setError(safetyRes?.message || 'Could not load safety validation for this session');
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load safety validation';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, patientId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const persistLocalDraft = useCallback(async () => {
    if (!activeSessionId) return;
    await saveP2Draft(activeSessionId, 'P2-11', {
      notes,
      steps: normalizedSteps,
      itemsSkipped,
      stepSafety,
    });
  }, [activeSessionId, notes, normalizedSteps, itemsSkipped, stepSafety]);

  const saveDraft = useCallback(async () => {
    if (!activeSessionId) {
      notifyError('No dialysis session to save this draft against.');
      return false;
    }
    setSaving(true);
    try {
      await persistLocalDraft();
      notifySuccess('Draft saved');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Could not save safety validation draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, persistLocalDraft]);

  const submitFinal = useCallback(async () => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to validate.');
      return false;
    }
    setSaving(true);
    try {
      const res = await validateSafetyChecklist(activeSessionId, {
        notes: notes ? String(notes).slice(0, 200) : '',
      });
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Safety validation failed');
        return false;
      }
      if (res.data?.overall_pass === false) {
        notifyError('One or more pre-dialysis steps are incomplete');
        await loadPage();
        return false;
      }
      await persistLocalDraft();
      setStepSafety('complete');
      notifySuccess('Safety validation passed');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Safety validation failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, notes, persistLocalDraft, loadPage]);

  return {
    patientRaw,
    alerts,
    steps: normalizedSteps,
    itemsSkipped,
    notes,
    setNotes,
    stepSafety,
    loadedAt,
    blockingIssues,
    canProceed,
    loading,
    saving,
    error,
    refresh: loadPage,
    saveDraft,
    submitFinal,
  };
}
