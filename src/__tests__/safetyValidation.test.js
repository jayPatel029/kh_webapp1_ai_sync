/**
 * @jest-environment node
 */
import { validateSafetyValidation } from '../pages/dialysis/safetyValidationLogic';

describe('Safety Validation Logic (P2-11)', () => {
  const completeSteps = [
    { id: 1, name: 'Patient Verification', status: 'Completed' },
    { id: 2, name: 'Vitals & Measurements', status: 'Completed' },
    { id: 3, name: 'Patient Assessment', status: 'Completed' },
    { id: 4, name: 'Vascular Access Assessment', status: 'Completed' },
    { id: 5, name: 'Machine Safety', status: 'Completed' },
    { id: 6, name: 'Water Safety', status: 'Completed' },
    { id: 7, name: 'Infection Control', status: 'Completed' },
  ];

  it('returns isValid = true and no blocking issues when all 7 steps are Completed', () => {
    const result = validateSafetyValidation(completeSteps);
    expect(result.isValid).toBe(true);
    expect(result.blockingIssues).toHaveLength(0);
  });

  it('returns isValid = false and lists blocking issues if any step is incomplete', () => {
    const incompleteSteps = [
      ...completeSteps.slice(0, 4),
      { id: 5, name: 'Machine Safety', status: 'Incomplete' },
      ...completeSteps.slice(5),
    ];
    const result = validateSafetyValidation(incompleteSteps);
    expect(result.isValid).toBe(false);
    expect(result.blockingIssues).toContain('Machine Safety is incomplete.');
  });

  it('returns isValid = false if steps array is empty or null', () => {
    expect(validateSafetyValidation([]).isValid).toBe(false);
    expect(validateSafetyValidation(null).isValid).toBe(false);
  });
});
