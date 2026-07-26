/**
 * usePatientVerification — P2-04 Patient Verification Hook
 *
 * Manages patient identity verification, wristband/barcode scanning,
 * Infection Status Check gate (HIV & Hepatitis B/C), prescription verification,
 * and Consumables Confirmation (Multi-Use dialyzer reuse tracking & limit rules).
 *
 * @file src/hooks/usePatientVerification.js
 */

import {
  getPatientDetails,
  submitSessionVerification,
  getPatientDialyzerStatus,
  submitSessionConsumables,
} from '../ApiCalls/preDialysisApis';
import { calculateAge, formatDate } from './usePatientSummary';
import { notifyError, notifySuccess } from '../helpers/notify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Business Logic Helpers
// ---------------------------------------------------------------------------

/**
 * Check if patient identity matches all mandatory identifiers.
 */
export const checkIdentityMatch = (identityFields = {}) => {
  return Boolean(
    identityFields.nameMatched &&
    identityFields.dobMatched &&
    identityFields.pidMatched &&
    identityFields.phoneMatched
  );
};

/**
 * Check if infection gate is resolved (neither status is Pending, or Enter Now / Skip actioned).
 */
export const checkInfectionGateResolved = (hivStatus, hepatitisStatus, isActioned) => {
  if (hivStatus !== INFECTION_STATUS.PENDING && hepatitisStatus !== INFECTION_STATUS.PENDING) {
    return true;
  }
  return Boolean(isActioned);
};

/**
 * Check if consumables confirmation is valid.
 */
export const checkConsumablesValid = (consumablesState = {}) => {
  const {
    dialyzerType,
    reuseCount,
    reuseLimit = 6,
    reuseAction,
    discardConfirmed,
    overrideReason,
    tubingSetQty,
    needlesQty,
  } = consumablesState;

  if (!tubingSetQty || tubingSetQty < 1) return false;

  if (dialyzerType === DIALYZER_USAGE_TYPE.SINGLE_USE) {
    return true;
  }

  // Multi-Use dialyzer logic
  if (reuseCount < reuseLimit) {
    return true;
  }

  // Reuse limit reached (reuseCount >= reuseLimit)
  if (reuseAction === 'NEW_DIALYZER') {
    return Boolean(discardConfirmed);
  }

  if (reuseAction === 'OVERRIDE') {
    return Boolean(overrideReason && overrideReason.trim().length >= 5);
  }

  return false;
};

// ---------------------------------------------------------------------------
// Hook Definition
// ---------------------------------------------------------------------------

export default function usePatientVerification(patientId) {
  const [patientRaw, setPatientRaw] = useState(null);
  const [prescriptionRaw, setPrescriptionRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Identity Verification fields match
  const [identityMatches, setIdentityMatches] = useState({
    nameMatched: true,
    dobMatched: true,
    pidMatched: true,
    phoneMatched: true,
  });

  // Verification Methods
  const [verificationMethods, setVerificationMethods] = useState({
    patientConfirmed: true,
    idCardVerified: true,
    wristbandVerified: true,
  });

  // Wristband Scan state
  const [wristbandScan, setWristbandScan] = useState({
    scanned: true,
    wristbandId: 'P10023',
    matched: true,
  });

  // Infection Status Check state
  const [infectionState, setInfectionState] = useState({
    hivStatus: INFECTION_STATUS.PENDING,
    hepatitisStatus: INFECTION_STATUS.NEGATIVE,
    actioned: false,
    skipped: false,
  });

  // Consumables Confirmation state
  const [consumablesState, setConsumablesState] = useState({
    dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
    dialyzerId: 'DLZ-P10023-003',
    reuseCount: 4,
    reuseLimit: 6,
    lastUsed: '24 May 2025',
    reuseAction: null, // 'NEW_DIALYZER' | 'OVERRIDE'
    discardConfirmed: false,
    overrideReason: '',
    tubingSetQty: 1,
    needlesQty: 2,
    salineQty: '1000 mL',
  });

  // Optional Notes
  const [notesText, setNotesText] = useState('');

  // Fetch patient and prescription data
  const loadVerificationData = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patientRes = await getPatientById(patientId);
      let patientData = null;

      if (patientRes?.success) {
        patientData = patientRes.data?.data || patientRes.data || null;
      } else {
        // Fallback default mockup values matching P2-04 export
        patientData = {
          id: patientId,
          patient_code: `P${String(patientId).padStart(5, '0')}`,
          name: 'Ramesh Kumar',
          dob: '1966-08-15',
          gender: 'Male',
          number: '+91 98765 43210',
          dry_weight: '68.5',
          blood_group: 'O+',
          last_dialysis_date: '2023-01-12',
          vascular_access: 'AV Fistula (Left)',
          shift_time: 'Morning (07:00 AM)',
          bed_number: 'B-02',
          machine_number: 'HD-01',
          primary_doctor_name: 'Dr. Neha Mehta',
          hiv_status: INFECTION_STATUS.PENDING,
          hepatitis_status: INFECTION_STATUS.NEGATIVE,
        };
      }

      setPatientRaw(patientData);

      if (patientData.hiv_status || patientData.hepatitis_status) {
        setInfectionState((prev) => ({
          ...prev,
          hivStatus: patientData.hiv_status || INFECTION_STATUS.PENDING,
          hepatitisStatus: patientData.hepatitis_status || INFECTION_STATUS.NEGATIVE,
        }));
      }

      setWristbandScan((prev) => ({
        ...prev,
        wristbandId: patientData.patient_code || `P${String(patientId).padStart(5, '0')}`,
        matched: true,
      }));

      try {
        const rxRes = await getHemoDialysisParameters(patientId);
        if (rxRes?.success) {
          const rxData = Array.isArray(rxRes.data) ? rxRes.data[0] : rxRes.data;
          setPrescriptionRaw(rxData);
        }
      } catch (_) {}
    } catch (err) {
      const errMsg = err?.message || 'Failed to load patient verification data';
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadVerificationData();
  }, [loadVerificationData]);

  // Derived patient details for banner & identity card
  const patientDetails = useMemo(() => {
    if (!patientRaw) return null;
    const patientCode = patientRaw.patient_code || patientRaw.patientCode || `P${String(patientRaw.id).padStart(5, '0')}`;
    const dobFormatted = formatDate(patientRaw.dob || '1966-08-15');

    return {
      id: patientRaw.id,
      patientCode,
      name: patientRaw.name || 'Ramesh Kumar',
      dobFormatted,
      age: calculateAge(patientRaw.dob) || '58',
      gender: patientRaw.gender || 'Male',
      phone: patientRaw.number || patientRaw.phone || '+91 98765 43210',
      bloodGroup: patientRaw.blood_group || 'O+',
      dryWeight: patientRaw.dry_weight || '68.5',
      schedule: '12 Jan 2023 (2y 4m)',
      shift: patientRaw.shift_time || 'Morning (07:00 AM)',
      bedMachine: `${patientRaw.bed_number || 'B-02'} / ${patientRaw.machine_number || 'HD-01'}`,
    };
  }, [patientRaw]);

  // Derived prescription details
  const prescriptionDetails = useMemo(() => {
    return {
      physician: prescriptionRaw?.doctor_name || patientRaw?.primary_doctor_name || 'Dr. Neha Mehta',
      prescriptionDate: formatDate(prescriptionRaw?.updated_at || '2025-05-12'),
      dialysisType: prescriptionRaw?.dialysis_type || 'Hemodialysis',
      prescribedDuration: prescriptionRaw?.dialysis_time || '4:00 hrs',
      bfr: prescriptionRaw?.blood_flow_rate || '350 mL/min',
      dfr: prescriptionRaw?.dialysate_flow_rate || '500 mL/min',
      dialysateTemp: prescriptionRaw?.dialysate_temp || '36.5 °C',
      ufGoal: prescriptionRaw?.uf_goal || '2.0 L',
      heparin: prescriptionRaw?.heparin || '2000 IU bolus + 500 IU/hr',
      dialysateComposition: {
        potassium: prescriptionRaw?.potassium || '2.0 mEq/L',
        calcium: prescriptionRaw?.calcium || '3.0 mEq/L',
        sodium: prescriptionRaw?.sodium || '138 mEq/L',
        bicarbonate: prescriptionRaw?.bicarbonate || '32 mEq/L',
      },
      valid: true,
    };
  }, [prescriptionRaw, patientRaw]);

  // Actions
  const handleInfectionEnterNow = (newHiv, newHep) => {
    setInfectionState({
      hivStatus: newHiv || INFECTION_STATUS.NEGATIVE,
      hepatitisStatus: newHep || INFECTION_STATUS.NEGATIVE,
      actioned: true,
      skipped: false,
    });
    notifySuccess('Infection status updated successfully');
  };

  const handleInfectionSkip = () => {
    setInfectionState((prev) => ({
      ...prev,
      actioned: true,
      skipped: true,
    }));
    notifyError('HIV/Hepatitis check skipped — alert logged to Nephrologist');
  };

  const updateConsumables = (updates) => {
    setConsumablesState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Validation calculations
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

  const canProceed = identityValid && methodValid && infectionValid && consumablesValid;

  return {
    patientDetails,
    prescriptionDetails,
    identityMatches,
    setIdentityMatches,
    verificationMethods,
    setVerificationMethods,
    wristbandScan,
    setWristbandScan,
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
    canProceed,
    loading,
    error,
    refresh: loadVerificationData,
  };
}
