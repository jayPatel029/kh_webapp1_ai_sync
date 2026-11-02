/**
 * useStartDialysisConfirmation — P2-12 Start Dialysis Confirmation Hook
 *
 * Live 8-step readiness + attestation + server-verified PIN start.
 *
 * @file src/hooks/useStartDialysisConfirmation.js
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPatientDetails,
  getSessionStartReadiness,
  startDialysis,
  unlockStartDialysis,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { MISSING, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';
import {
  MAX_ATTEMPTS,
  canStartChecklist,
  canSubmitStartDialysis,
  normalizeStartChecklist,
} from '../pages/dialysis/startDialysisValidation';

export default function useStartDialysisConfirmation(patientId, rawSessionId, propMachineId = '') {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [machineId, setMachineId] = useState(propMachineId || '');
  const [bed, setBed] = useState(null);
  const [locked, setLocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [attested, setAttested] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [loadedAt, setLoadedAt] = useState(MISSING);

  const checklist = useMemo(() => normalizeStartChecklist(steps), [steps]);
  const checklistComplete = useMemo(() => canStartChecklist(checklist), [checklist]);
  const canSubmit = useMemo(
    () => canSubmitStartDialysis({
      checklistComplete,
      attested,
      pin,
      locked,
    }),
    [checklistComplete, attested, pin, locked]
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
      const [patientRes, readinessRes, draft] = await Promise.all([
        getPatientDetails(patientId),
        getSessionStartReadiness(activeSessionId),
        loadP2Draft(activeSessionId, 'P2-12'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }
      setPatientRaw(unwrapRecord(patientRes.data, ['patient']) || patientRes.data);

      if (readinessRes?.success && readinessRes.data) {
        const payload = readinessRes.data;
        setSteps(payload.per_step || []);
        setMachineId(payload.machine_id || propMachineId || '');
        setBed(payload.bed || null);
        setLocked(Boolean(payload.locked));
        setAttemptsRemaining(
          payload.attempts_remaining == null ? MAX_ATTEMPTS : Number(payload.attempts_remaining)
        );
        if (draft?.payload?.attested) setAttested(Boolean(draft.payload.attested));
        setLoadedAt(formatIst(new Date()));
      } else if (draft?.payload) {
        setSteps(draft.payload.steps || []);
        setAttested(Boolean(draft.payload.attested));
        setMachineId(draft.payload.machineId || propMachineId || '');
        setLoadedAt(formatIst(draft.savedAt) || formatIst(new Date()));
        setError(readinessRes?.message || 'Could not refresh start readiness. Showing last saved draft.');
      } else {
        setSteps([]);
        setLoadedAt(formatIst(new Date()));
        setError(readinessRes?.message || 'Could not load start readiness for this session');
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load start dialysis confirmation';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, patientId, propMachineId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const persistLocalDraft = useCallback(async () => {
    if (!activeSessionId) return;
    await saveP2Draft(activeSessionId, 'P2-12', {
      attested,
      machineId,
      steps: checklist,
    });
  }, [activeSessionId, attested, machineId, checklist]);

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
      notifyError(err?.message || 'Could not save start confirmation draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, persistLocalDraft]);

  const submitStart = useCallback(async () => {
    if (!canSubmit || saving) return null;
    if (!activeSessionId) {
      setSubmitError('No dialysis session id.');
      return null;
    }
    setSaving(true);
    setSubmitError('');
    try {
      const res = await startDialysis(activeSessionId, {
        attestation: attested,
        pin: String(pin).trim(),
        machine_id: machineId || undefined,
      });

      if (!res?.success) {
        if (res?.status === 423 || res?.error_code === 'ERR_START_LOCKED') {
          setLocked(true);
          setAttemptsRemaining(0);
          setSubmitError(res.message || 'Start Dialysis is locked after 3 PIN failures. A nurse or nephrologist must unlock.');
          setPin('');
          return null;
        }
        if (res?.details?.attempts_remaining != null) {
          setAttemptsRemaining(Number(res.details.attempts_remaining));
        }
        setSubmitError(res?.message || 'Incorrect PIN. Try again.');
        setPin('');
        return null;
      }

      await persistLocalDraft();
      notifySuccess('Dialysis session started');
      return res.data?.session_id || activeSessionId;
    } catch (err) {
      setSubmitError(err?.message || 'Could not start dialysis');
      return null;
    } finally {
      setSaving(false);
    }
  }, [canSubmit, saving, activeSessionId, attested, pin, machineId, persistLocalDraft]);

  const submitUnlock = useCallback(async () => {
    if (!activeSessionId) return false;
    setSaving(true);
    try {
      const res = await unlockStartDialysis(activeSessionId, {
        unlock_reason: unlockReason || 'Nurse/nephrologist unlock',
      });
      if (!res?.success) {
        notifyError(res?.message || 'Unlock failed');
        return false;
      }
      setLocked(false);
      setAttemptsRemaining(MAX_ATTEMPTS);
      setSubmitError('');
      notifySuccess('Start Dialysis unlocked');
      await loadPage();
      return true;
    } catch (err) {
      notifyError(err?.message || 'Unlock failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, unlockReason, loadPage]);

  return {
    patientRaw,
    checklist,
    checklistComplete,
    machineId,
    bed,
    locked,
    attemptsRemaining,
    attested,
    setAttested,
    pin,
    setPin,
    showPin,
    setShowPin,
    unlockReason,
    setUnlockReason,
    submitError,
    canSubmit,
    loading,
    saving,
    error,
    loadedAt,
    refresh: loadPage,
    saveDraft,
    submitStart,
    submitUnlock,
  };
}
