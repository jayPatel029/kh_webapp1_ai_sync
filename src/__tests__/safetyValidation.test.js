/**
 * @jest-environment node
 */
import {
  validateSafetyValidation,
  canProceedSafetyValidation,
  buildBlockingIssues,
  normalizeSafetySteps,
} from '../pages/dialysis/safetyValidationLogic';

describe('Safety Validation Logic (P2-11)', () => {
  const completeSteps = [
    { step: 1, key: 'step_verification', name: 'Patient Verification', status: 'complete', complete: true },
    { step: 2, key: 'step_vitals', name: 'Vitals & Measurements', status: 'complete', complete: true },
    { step: 3, key: 'step_assessment', name: 'Patient Assessment', status: 'complete', complete: true },
    { step: 4, key: 'step_vascular', name: 'Vascular Access Assessment', status: 'complete', complete: true },
    { step: 5, key: 'step_machine', name: 'Machine Safety', status: 'complete', complete: true },
    { step: 6, key: 'step_water', name: 'Water Safety', status: 'complete', complete: true },
    { step: 7, key: 'step_infection', name: 'Infection Control', status: 'complete', complete: true },
  ];

  it('returns isValid = true and no blocking issues when all 7 steps are Completed', () => {
    const result = validateSafetyValidation(completeSteps);
    expect(result.isValid).toBe(true);
    expect(result.blockingIssues).toHaveLength(0);
    expect(canProceedSafetyValidation(completeSteps)).toBe(true);
  });

  it('returns isValid = false and lists blocking issues if any step is incomplete', () => {
    const incompleteSteps = completeSteps.map((step) => (
      step.key === 'step_machine'
        ? { ...step, status: 'pending', complete: false }
        : step
    ));
    const result = validateSafetyValidation(incompleteSteps);
    expect(result.isValid).toBe(false);
    expect(result.blockingIssues.join(' ')).toMatch(/Machine Safety/i);
    expect(canProceedSafetyValidation(incompleteSteps)).toBe(false);
    expect(buildBlockingIssues(incompleteSteps)[0].code).toBe('P2-08');
  });

  it('returns isValid = false if steps array is empty or null', () => {
    expect(validateSafetyValidation([]).isValid).toBe(false);
    expect(validateSafetyValidation(null).isValid).toBe(false);
    expect(canProceedSafetyValidation([])).toBe(false);
  });

  it('normalizes API step payloads into Completed display status', () => {
    const normalized = normalizeSafetySteps(completeSteps);
    expect(normalized).toHaveLength(7);
    expect(normalized.every((s) => s.status === 'Completed')).toBe(true);
  });
});
