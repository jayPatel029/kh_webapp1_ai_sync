export const isMachineCheckPassed = (status) => {
  const s = String(status || '').trim().toLowerCase();
  return s === 'passed' || s === 'pass' || s === 'ok' || s === 'complete' || s === 'completed';
};

export const canProceedMachineSafety = (qc, selfTest, machineId) => {
  if (!machineId || String(machineId).trim() === '') return false;
  return isMachineCheckPassed(qc?.status) && isMachineCheckPassed(selfTest?.status);
};

export const validateMachineSafety = (checklist) => {
  if (!Array.isArray(checklist) || checklist.length === 0) return false;
  return checklist.every((item) => item.status === 'OK' || isMachineCheckPassed(item.status));
};
