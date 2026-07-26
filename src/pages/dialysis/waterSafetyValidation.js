// Validation logic for P2-09 Water Safety

export const validateWaterSafety = (checklist, additionalChecks = {}) => {
  if (!checklist || checklist.length === 0) return false;
  
  const checklistPassed = checklist.every(item => item.status === 'OK');
  const pressureOk = additionalChecks.roPressure ? Number(additionalChecks.roPressure) >= 50 && Number(additionalChecks.roPressure) <= 80 : true;
  const flowRateOk = additionalChecks.roFlowRate ? Number(additionalChecks.roFlowRate) >= 100 && Number(additionalChecks.roFlowRate) <= 150 : true;
  const carbonFilterOk = additionalChecks.carbonFilterStatus ? additionalChecks.carbonFilterStatus === 'Good' : true;
  const softenerOk = additionalChecks.softenerStatus ? additionalChecks.softenerStatus === 'Good' : true;

  return checklistPassed && pressureOk && flowRateOk && carbonFilterOk && softenerOk;
};
