/**
 * @jest-environment node
 */
import { validateWaterSafety } from '../pages/dialysis/waterSafetyValidation';

describe('Water Safety Validation Logic (P2-09)', () => {
  const sampleChecklist = [
    { id: 'ph', status: 'OK' },
    { id: 'tds', status: 'OK' },
    { id: 'conductivity', status: 'OK' },
  ];

  it('returns true when checklist is OK and additional checks are within range', () => {
    const additional = {
      roPressure: '65',
      roFlowRate: '120',
      carbonFilterStatus: 'Good',
      softenerStatus: 'Good',
    };
    expect(validateWaterSafety(sampleChecklist, additional)).toBe(true);
  });

  it('returns false if any checklist item fails', () => {
    const failedChecklist = [
      { id: 'ph', status: 'OK' },
      { id: 'tds', status: 'Failed' },
    ];
    const additional = {
      roPressure: '65',
      roFlowRate: '120',
    };
    expect(validateWaterSafety(failedChecklist, additional)).toBe(false);
  });

  it('returns false if RO pressure is out of range (< 50 or > 80)', () => {
    const additionalLow = { roPressure: '40', roFlowRate: '120' };
    const additionalHigh = { roPressure: '90', roFlowRate: '120' };
    expect(validateWaterSafety(sampleChecklist, additionalLow)).toBe(false);
    expect(validateWaterSafety(sampleChecklist, additionalHigh)).toBe(false);
  });

  it('returns false if RO flow rate is out of range (< 100 or > 150)', () => {
    const additionalLow = { roPressure: '65', roFlowRate: '80' };
    const additionalHigh = { roPressure: '65', roFlowRate: '180' };
    expect(validateWaterSafety(sampleChecklist, additionalLow)).toBe(false);
    expect(validateWaterSafety(sampleChecklist, additionalHigh)).toBe(false);
  });

  it('returns false if checklist is missing or empty', () => {
    expect(validateWaterSafety(null, {})).toBe(false);
    expect(validateWaterSafety([], {})).toBe(false);
  });
});
