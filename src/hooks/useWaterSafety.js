/**
 * useWaterSafety — P2-09 Water Safety Hook
 *
 * Read-only review of this shift's RO water check + today's RO verification.
 *
 * @file src/hooks/useWaterSafety.js
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPatientDetails,
  getSessionWaterSafety,
  reviewWaterSafety,
} from '../ApiCalls/preDialysisApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import { MISSING, unwrapRecord, formatIst, liveValue } from '../pages/dialysis/p2Runtime';
import { loadP2Draft, saveP2Draft } from '../pages/dialysis/p2DraftCache';
import {
  canProceedWaterSafety,
  isRoVerificationPassed,
  isShiftWaterPassed,
} from '../pages/dialysis/waterSafetyValidation';

const EMPTY_SHIFT = {
  shift_check_passed: false,
  chlorine: null,
  chloramine: null,
  hardness: null,
  performed_at: null,
  performed_by: null,
  performed_by_name: null,
  status: 'Not Yet Performed',
  shift_id: null,
};

const EMPTY_VERIFY = {
  daily_verification_passed: false,
  pass_count: null,
  performed_at: null,
  performed_by: null,
  performed_by_name: null,
  status: 'Not Yet Performed',
};

function normalizeShift(row) {
  if (!row || typeof row !== 'object') return { ...EMPTY_SHIFT };
  return {
    ...EMPTY_SHIFT,
    ...row,
    status: row.status || (isShiftWaterPassed(row) ? 'Passed' : (row.performed_at ? 'Failed' : 'Not Yet Performed')),
  };
}

function normalizeVerification(row) {
  if (!row || typeof row !== 'object') return { ...EMPTY_VERIFY };
  return {
    ...EMPTY_VERIFY,
    ...row,
    status: row.status || (isRoVerificationPassed(row) ? 'Verified' : (row.performed_at ? 'Failed' : 'Not Yet Performed')),
  };
}

export function performedByLabel(row) {
  if (!row) return MISSING;
  if (row.performed_by_name) return row.performed_by_name;
  if (row.performed_by != null && row.performed_by !== '') return String(row.performed_by);
  return MISSING;
}

export function formatPpm(value, digits = 2) {
  if (value === null || value === undefined || value === '') return MISSING;
  const n = Number(value);
  if (!Number.isFinite(n)) return liveValue(value);
  return `${n.toFixed(digits)} ppm`;
}

export default function useWaterSafety(patientId, rawSessionId) {
  const activeSessionId = rawSessionId && String(rawSessionId).trim() !== '' ? String(rawSessionId) : '';

  const [patientRaw, setPatientRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [roPlantId, setRoPlantId] = useState('');
  const [plantSource, setPlantSource] = useState('missing');
  const [shiftId, setShiftId] = useState(null);
  const [machineId, setMachineId] = useState('');
  const [bed, setBed] = useState(null);
  const [shiftCheck, setShiftCheck] = useState({ ...EMPTY_SHIFT });
  const [verification, setVerification] = useState({ ...EMPTY_VERIFY });
  const [stepWater, setStepWater] = useState('pending');
  const [checkDate, setCheckDate] = useState(MISSING);
  const [loadedAt, setLoadedAt] = useState(MISSING);

  const canProceed = useMemo(
    () => canProceedWaterSafety(shiftCheck, verification, roPlantId),
    [shiftCheck, verification, roPlantId]
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
        getSessionWaterSafety(activeSessionId),
        loadP2Draft(activeSessionId, 'P2-09'),
      ]);

      if (!patientRes?.success) {
        setError(patientRes?.message || 'Patient data is not available for this session');
        setPatientRaw(null);
        return;
      }
      setPatientRaw(unwrapRecord(patientRes.data, ['patient']) || patientRes.data);

      if (safetyRes?.success && safetyRes.data) {
        const payload = safetyRes.data;
        setRoPlantId(payload.ro_plant_id || '');
        setPlantSource(payload.plant_source || 'missing');
        setShiftId(payload.shift_id || null);
        setMachineId(payload.machine_id || '');
        setBed(payload.bed || null);
        setShiftCheck(normalizeShift(payload.shift_check));
        setVerification(normalizeVerification(payload.verification));
        setStepWater(payload.step_water || 'pending');
        setCheckDate(payload.check_date || MISSING);
        setLoadedAt(formatIst(new Date()));
      } else if (draft?.payload && typeof draft.payload === 'object') {
        setRoPlantId(draft.payload.roPlantId || '');
        setPlantSource(draft.payload.plantSource || 'missing');
        setShiftId(draft.payload.shiftId || null);
        setMachineId(draft.payload.machineId || '');
        setBed(draft.payload.bed || null);
        setShiftCheck(normalizeShift(draft.payload.shiftCheck));
        setVerification(normalizeVerification(draft.payload.verification));
        setStepWater(draft.payload.stepWater || 'pending');
        setCheckDate(draft.payload.checkDate || MISSING);
        setLoadedAt(formatIst(draft.savedAt) || formatIst(new Date()));
        if (!safetyRes?.success) {
          setError(safetyRes?.message || 'Could not refresh water safety. Showing last saved draft.');
        }
      } else {
        setRoPlantId('');
        setShiftCheck({ ...EMPTY_SHIFT });
        setVerification({ ...EMPTY_VERIFY });
        setLoadedAt(formatIst(new Date()));
        if (!safetyRes?.success) {
          setError(safetyRes?.message || 'Could not load water safety for this session');
        }
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to load water safety';
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
    await saveP2Draft(activeSessionId, 'P2-09', {
      roPlantId,
      plantSource,
      shiftId,
      machineId,
      bed,
      shiftCheck,
      verification,
      stepWater,
      checkDate,
    });
  }, [activeSessionId, roPlantId, plantSource, shiftId, machineId, bed, shiftCheck, verification, stepWater, checkDate]);

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
      notifyError(err?.message || 'Could not save water safety draft');
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
    if (!roPlantId) {
      notifyError('No RO plant is linked for this session.');
      return false;
    }
    setSaving(true);
    try {
      const payload = { ro_plant_id: roPlantId };
      if (shiftId != null && shiftId !== '') payload.shift_id = shiftId;
      const res = await reviewWaterSafety(activeSessionId, payload);
      if (!res?.success) {
        notifyError(res?.message || res?.error_code || 'Water safety could not be confirmed');
        return false;
      }
      await persistLocalDraft();
      setStepWater('complete');
      notifySuccess('Water safety confirmed');
      return true;
    } catch (err) {
      notifyError(err?.message || 'Water safety could not be confirmed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [canProceed, activeSessionId, roPlantId, shiftId, persistLocalDraft]);

  const banner = useMemo(() => {
    if (!roPlantId) {
      return {
        tone: 'block',
        title: 'No RO plant is linked for this session',
        message: 'Assign an RO plant before water safety can be confirmed.',
      };
    }
    if (canProceed) {
      return {
        tone: 'ok',
        title: 'RO water quality confirmed for this shift.',
        message: 'Shift water check and today’s RO verification both passed.',
      };
    }
    if (!isShiftWaterPassed(shiftCheck)) {
      const failed = String(shiftCheck.status || '').toLowerCase() === 'failed';
      return {
        tone: 'block',
        title: failed
          ? 'This shift’s water check failed for this plant.'
          : 'This shift’s water check has not been completed for this plant.',
        message: failed
          ? 'Escalate per Part 5 water workflow before proceeding.'
          : 'Complete Part 5 Shift Water Check (P5-03a) before continuing.',
      };
    }
    return {
      tone: 'block',
      title: 'Today’s RO system verification has not passed.',
      message: 'Complete Part 5 RO System Verification (P5-03b) before continuing.',
    };
  }, [roPlantId, canProceed, shiftCheck]);

  return {
    patientRaw,
    roPlantId,
    plantSource,
    shiftId,
    machineId,
    bed,
    shiftCheck,
    verification,
    stepWater,
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
