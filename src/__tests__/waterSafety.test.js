/**
 * @jest-environment node
 */
import {
  validateWaterSafety,
  canProceedWaterSafety,
  isShiftWaterPassed,
  isRoVerificationPassed,
} from '../pages/dialysis/waterSafetyValidation';

describe('P2-09 Water Safety Validation Logic', () => {
  it('passes only when plant is linked and both shift + daily checks pass', () => {
    expect(canProceedWaterSafety(
      { shift_check_passed: 1 },
      { daily_verification_passed: true },
      'RO-1',
    )).toBe(true);
  });

  it('blocks when RO plant is missing', () => {
    expect(canProceedWaterSafety(
      { shift_check_passed: 1 },
      { daily_verification_passed: 1 },
      '',
    )).toBe(false);
  });

  it('blocks when shift check is not passed', () => {
    expect(isShiftWaterPassed({ shift_check_passed: 0 })).toBe(false);
    expect(canProceedWaterSafety(
      { shift_check_passed: 0 },
      { daily_verification_passed: 1 },
      'RO-1',
    )).toBe(false);
  });

  it('blocks when RO verification is not verified', () => {
    expect(isRoVerificationPassed({ daily_verification_passed: false })).toBe(false);
    expect(canProceedWaterSafety(
      { shift_check_passed: 1 },
      { daily_verification_passed: 0 },
      'RO-1',
    )).toBe(false);
  });

  it('legacy checklist helper still validates pressure/flow ranges', () => {
    const sampleChecklist = [
      { id: 'ph', status: 'OK' },
      { id: 'tds', status: 'OK' },
    ];
    expect(validateWaterSafety(sampleChecklist, {
      roPressure: '65',
      roFlowRate: '120',
      carbonFilterStatus: 'Good',
      softenerStatus: 'Good',
    })).toBe(true);
    expect(validateWaterSafety(sampleChecklist, {
      roPressure: '40',
      roFlowRate: '120',
    })).toBe(false);
    expect(validateWaterSafety([], {})).toBe(false);
  });
});
