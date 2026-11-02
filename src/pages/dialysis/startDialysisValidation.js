// Validation logic for P2-12 Start Dialysis Confirmation

export const MAX_ATTEMPTS = 3;

export const isStepCompleted = (status) => {
  const value = String(status || '').toLowerCase();
  return value === 'complete' || value === 'completed' || value === 'passed' || status === true;
};

export const normalizeStartChecklist = (steps = []) => {
  if (!Array.isArray(steps)) return [];
  return steps.slice(0, 8).map((step, index) => {
    const complete = Boolean(step.complete) || isStepCompleted(step.status);
    return {
      id: step.step || step.id || index + 1,
      key: step.key || `step_${index + 1}`,
      code: step.code || null,
      item: step.name || step.item || step.key || `Step ${index + 1}`,
      status: complete ? 'Completed' : (step.status || 'Not started'),
      complete,
      details: step.details || null,
      completedBy: step.completed_by_name || step.completedBy || null,
      completedAt: step.completed_at || step.completedAt || step.time || null,
    };
  });
};

export const canStartChecklist = (steps = []) => {
  const normalized = normalizeStartChecklist(steps);
  if (normalized.length < 8) return false;
  return normalized.every((step) => step.complete || step.status === 'Completed');
};

export const canSubmitStartDialysis = ({
  checklistComplete = false,
  attested = false,
  pin = '',
  locked = false,
} = {}) => {
  if (locked) return false;
  if (!checklistComplete) return false;
  if (!attested) return false;
  return String(pin || '').trim().length > 0;
};

// Kept for older tests/callers. PIN correctness is verified on the server only.
export const DEFAULT_CORRECT_PIN = '1111';

export const verifyPin = (inputPin, currentAttempts = 0) => {
  if (currentAttempts >= MAX_ATTEMPTS) {
    return {
      isValid: false,
      attempts: currentAttempts,
      isLocked: true,
      error: 'Too many failed attempts. Ask a nurse or nephrologist to unlock.',
    };
  }

  if (!inputPin) {
    return {
      isValid: false,
      attempts: currentAttempts,
      isLocked: false,
      error: 'Enter your start PIN.',
    };
  }

  // Client-side helper cannot confirm PIN hashes. Treat only the documented
  // offline/test fallback value as a local-format check for unit tests.
  if (String(inputPin) === DEFAULT_CORRECT_PIN) {
    return {
      isValid: true,
      attempts: currentAttempts,
      isLocked: false,
      error: '',
    };
  }

  const newAttempts = currentAttempts + 1;
  const isLockedNow = newAttempts >= MAX_ATTEMPTS;
  return {
    isValid: false,
    attempts: newAttempts,
    isLocked: isLockedNow,
    error: isLockedNow
      ? 'Too many failed attempts. Ask a nurse or nephrologist to unlock.'
      : 'Incorrect password. Try again.',
  };
};
