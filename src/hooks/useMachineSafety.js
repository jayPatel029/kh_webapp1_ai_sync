/**
 * useMachineSafety — P2-08 Machine Safety Hook
 *
 * Read-only review of today's QC + Self-Test for this session's machine.
 *
 * @file src/hooks/useMachineSafety.js
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPatientDetails,
  getSessionMachineSafety,
  reviewMachineSafety,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { MISSING, unwrapRecord, formatIst } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';
import { canProceedMachineSafety, isMachineCheckPassed } from '../pages/dialysis/machineSafetyValidation';

const EMPTY_CHECK = {
  status: 'Not Yet Performed',
  performed_at: null,
  performed_by: null,
  performed_by_name: null,
  summary: null,
};

function normalizeCheck(row) {
  if (!row || typeof row !== 'object') return { ...EMPTY_CHECK };
  return {
    status: row.status || 'Not Yet Performed',
    performed_at: row.performed_at || null,
    performed_by: row.performed_by ?? null,
    performed_by_name: row.performed_by_name || null,
    summary: row.summary || null,
    check_date: row.check_date || null,
  };
}

export function formatCheckStatus(status) {
  const raw = String(status || '').trim();
  if (!raw) return 'Not Yet Performed';
  if (raw.toLowerCase() === 'passed') return 'Passed';
  if (raw.toLowerCase() === 'failed') return 'Failed';
  return raw;
}

export function performedByLabel(check) {
  if (!check) return MISSING;
  if (check.performed_by_name) return check.performed_by_name;
  if (check.performed_by != null && check.performed_by !== '') return String(check.performed_by);
  return MISSING;
}

export default function useMachineSafety(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [machineId, setMachineId] = useState('');
  const [machine, setMachine] = useState({
    machine_id: null,
    bed_code: null,
    bed_name: null,
    make: null,
    model: null,
    install_date: null,
  });
  const [qc, setQc] = useState({ ...EMPTY_CHECK });
  const [selfTest, setSelfTest] = useState({ ...EMPTY_CHECK });
  const [stepMachine, setStepMachine] = useState('pending');
  const [checkDate, setCheckDate] = useState(MISSING);
  const [loadedAt, setLoadedAt] = useState(MISSING);

  const canProceed = useMemo(
    () => canProceedMachineSafety(qc, selfTest, machineId),
    [qc, selfTest, machineId]
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
        getSessionMachineSafety(activeSessionId),
        loadP2Draft(activeSessionId, 'P2-08'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }

      setPatientRaw(unwrapRecord(patientRes.data, ['patient']) || patientRes.data);

      if (safetyRes?.success && safetyRes.data) {
        const payload = safetyRes.data;
        setMachineId(payload.machine_id || '');
        setMachine(payload.machine || {
          machine_id: payload.machine_id || null,
          bed_code: null,
          bed_name: null,
          make: null,
          model: null,
          install_date: null,
        });
        setQc(normalizeCheck(payload.qc));
        setSelfTest(normalizeCheck(payload.self_test));
        setStepMachine(payload.step_machine || 'pending');
        setCheckDate(payload.check_date || MISSING);
        setLoadedAt(formatIst(new Date()));
      } else if (draft?.payload && typeof draft.payload === 'object') {
        setMachineId(draft.payload.machineId || '');
        setMachine(draft.payload.machine || {
          machine_id: draft.payload.machineId || null,
          bed_code: null,
          bed_name: null,
          make: null,
          model: null,
          install_date: null,
        });
        setQc(normalizeCheck(draft.payload.qc));
        setSelfTest(normalizeCheck(draft.payload.selfTest));
        setStepMachine(draft.payload.stepMachine || 'pending');
        setCheckDate(draft.payload.checkDate || MISSING);
        setLoadedAt(formatIst(draft.savedAt) || formatIst(new Date()));
        if (!safetyRes?.success) {
          setError(safetyRes?.message || 'Could not refresh machine safety. Showing last saved draft.');
        }
      } else {
        setMachineId('');
        setQc({ ...EMPTY_CHECK });
        setSelfTest({ ...EMPTY_CHECK });
        setLoadedAt(formatIst(new Date()));
        if (!safetyRes?.success) {
          setError(safetyRes?.message || 'Could not load machine safety for this session');
        }
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load machine safety';
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
    await saveP2Draft(activeSessionId, 'P2-08', {
      machineId,
      machine,
      qc,
      selfTest,
      stepMachine,
      checkDate,
    });
  }, [activeSessionId, machineId, machine, qc, selfTest, stepMachine, checkDate]);

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
      notifyError(err?.message || 'Could not save machine safety draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSessionId, persistLocalDraft]);

  const submitFinal = useCallback(async () => {
    if (!canProceed) return false;
    if (!activeSessionId) {
      notifyError('No dialysis session to save against.');
      return false;
    }
    if (!machineId) {
      notifyError('No machine is linked to this session.');
      return false;
    }
    setSaving(true);
    try {
      const res = await reviewMachineSafety(activeSessionId, { machine_id: machineId });
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Machine safety could not be confirmed');
        return false;
      }
      await persistLocalDraft();
      setStepMachine('complete');
      notifySuccess('Machine safety confirmed');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Machine safety could not be confirmed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, machineId, persistLocalDraft]);

  const banner = useMemo(() => {
    if (!machineId) {
      return {
        tone: 'block',
        title: 'No machine is linked to this session',
        message: 'Assign a machine to this session before machine safety can be confirmed.',
      };
    }
    if (canProceed) {
      return {
        tone: 'ok',
        title: 'Machine ready for this session.',
        message: 'Today’s QC and Self-Test both passed.',
      };
    }
    const qcPassed = isMachineCheckPassed(qc.status);
    const stPassed = isMachineCheckPassed(selfTest.status);
    if (!qcPassed && String(qc.status || '').toLowerCase().includes('fail')) {
      return {
        tone: 'block',
        title: 'Today’s QC failed for this machine.',
        message: 'Escalate to Biomedical before proceeding.',
      };
    }
    if (!stPassed && String(selfTest.status || '').toLowerCase().includes('fail')) {
      return {
        tone: 'block',
        title: 'Today’s Self-Test failed for this machine.',
        message: 'Escalate to Biomedical before proceeding.',
      };
    }
    if (!qcPassed) {
      return {
        tone: 'block',
        title: 'Today’s QC has not been performed for this machine.',
        message: 'Complete Part 5 Daily Machine QC (P5-02) before continuing.',
      };
    }
    return {
      tone: 'block',
      title: 'Today’s Self-Test has not been performed for this machine.',
      message: 'Complete Part 5 Self-Test (P5-04) before continuing.',
    };
  }, [machineId, canProceed, qc, selfTest]);

  return {
    patientRaw,
    machineId,
    machine,
    qc,
    selfTest,
    stepMachine,
    checkDate,
    loadedAt,
    canProceed,
    banner,
    loading,
    saving,
    error,
    refresh: loadPage,
    saveDraft,
    submitFinal,
  };
}
