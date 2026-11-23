// Validation logic for P2-11 Safety Validation

export const SAFETY_PRIOR_STEP_KEYS = [
  'step_verification',
  'step_vitals',
  'step_assessment',
  'step_vascular',
  'step_machine',
  'step_water',
  'step_infection',
];

export const SAFETY_STEP_CODES = {
  step_verification: 'P2-04',
  step_vitals: 'P2-05',
  step_assessment: 'P2-06',
  step_vascular: 'P2-07',
  step_machine: 'P2-08',
  step_water: 'P2-09',
  step_infection: 'P2-10',
};

export const isStepCompleted = (status) => {
  const value = String(status || '').toLowerCase();
  return value === 'complete'
    || value === 'completed'
    || value === 'passed'
    || value === 'done'
    || value === 'ok';
};

export const normalizeSafetySteps = (steps = []) => {
  if (!Array.isArray(steps)) return [];
  return steps
    .filter((step) => SAFETY_PRIOR_STEP_KEYS.includes(step.key) || (step.step >= 1 && step.step <= 7))
    .slice(0, 7)
    .map((step, index) => {
      const key = step.key || SAFETY_PRIOR_STEP_KEYS[index];
      // Uncleared P2-07 block forces incomplete even if rollup was previously complete (D17).
      const forcedIncomplete = Boolean(step.reason) && String(step.status || '').toLowerCase() === 'blocked';
      const complete = !forcedIncomplete && (Boolean(step.complete) || isStepCompleted(step.status));
      return {
        id: step.step || step.id || index + 1,
        key,
        code: step.code || SAFETY_STEP_CODES[key] || null,
        name: step.name || step.key || `Step ${index + 1}`,
        status: complete
          ? 'Completed'
          : (forcedIncomplete ? 'Blocked' : (step.status_label || step.status || 'Not started')),
        complete,
        completedBy: step.completed_by_name || step.completedBy || null,
        completedAt: step.completed_at || step.completedAt || step.time || null,
        reason: step.reason || null,
      };
    });
};

export const buildBlockingIssues = (steps = [], apiBlockingIssues = null) => {
  if (Array.isArray(apiBlockingIssues) && apiBlockingIssues.length) {
    return apiBlockingIssues.map((issue) => ({
      step: issue.step,
      key: issue.key,
      code: issue.code,
      name: issue.name,
      reason: issue.reason || `${issue.name || 'Step'} is incomplete.`,
    }));
  }
  const normalized = normalizeSafetySteps(steps);
  return normalized
    .filter((step) => !step.complete && step.status !== 'Completed')
    .map((step) => ({
      step: step.id,
      key: step.key,
      code: step.code,
      name: step.name,
      reason: step.reason || `${step.name} is incomplete.`,
    }));
};

export const isCriticalSkip = (row = {}) => {
  const c = String(row.criticality || '').toLowerCase();
  return c === 'critical' || Boolean(row.doctor_alerted);
};

export const canProceedSafetyValidation = (steps = []) => {
  const normalized = normalizeSafetySteps(steps);
  if (normalized.length < 7) return false;
  return normalized.every((step) => step.complete || step.status === 'Completed');
};

export const validateSafetyValidation = (steps = []) => {
  if (!steps || steps.length === 0) {
    return { isValid: false, blockingIssues: ['No step data available.'] };
  }

  const issues = buildBlockingIssues(steps);
  return {
    isValid: issues.length === 0 && normalizeSafetySteps(steps).length > 0,
    blockingIssues: issues.map((issue) => issue.reason),
  };
};
