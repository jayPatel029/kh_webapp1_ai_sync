export const isTruthyFlag = (value) =>
  value === 1 || value === true || value === '1' || String(value).toLowerCase() === 'true';

export const isShiftWaterPassed = (shiftCheck) =>
  isTruthyFlag(shiftCheck?.shift_check_passed) || String(shiftCheck?.status || '').toLowerCase() === 'passed';

export const isRoVerificationPassed = (verification) =>
  isTruthyFlag(verification?.daily_verification_passed)
  || String(verification?.status || '').toLowerCase() === 'verified'
  || String(verification?.status || '').toLowerCase() === 'passed';

export const canProceedWaterSafety = (shiftCheck, verification, roPlantId) => {
  if (!roPlantId || String(roPlantId).trim() === '') return false;
  return isShiftWaterPassed(shiftCheck) && isRoVerificationPassed(verification);
};

// Legacy helper kept for older checklist-style tests/callers.
export const validateWaterSafety = (checklist, additionalChecks = {}) => {
  if (!checklist || checklist.length === 0) return false;

  const checklistPassed = checklist.every((item) => item.status === 'OK' || item.status === 'Passed');
  const pressureOk = additionalChecks.roPressure
    ? Number(additionalChecks.roPressure) >= 50 && Number(additionalChecks.roPressure) <= 80
    : true;
  const flowRateOk = additionalChecks.roFlowRate
    ? Number(additionalChecks.roFlowRate) >= 100 && Number(additionalChecks.roFlowRate) <= 150
    : true;
  const carbonFilterOk = additionalChecks.carbonFilterStatus
    ? additionalChecks.carbonFilterStatus === 'Good'
    : true;
  const softenerOk = additionalChecks.softenerStatus
    ? additionalChecks.softenerStatus === 'Good'
    : true;

  return checklistPassed && pressureOk && flowRateOk && carbonFilterOk && softenerOk;
};
