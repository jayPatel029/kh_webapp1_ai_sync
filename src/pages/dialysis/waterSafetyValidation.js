export const isTruthyFlag = (value) =>
  value === 1
  || value === true
  || value === '1'
  || ['true', 'yes', 'pass', 'passed', 'ok', 'verified'].includes(String(value).toLowerCase());

export const isShiftWaterPassed = (shiftCheck) =>
  isTruthyFlag(shiftCheck?.shift_check_passed)
  || ['passed', 'pass', 'ok'].includes(String(shiftCheck?.status || '').toLowerCase());

export const isRoVerificationPassed = (verification) =>
  isTruthyFlag(verification?.daily_verification_passed)
  || ['verified', 'passed', 'pass', 'ok'].includes(String(verification?.status || '').toLowerCase());

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
