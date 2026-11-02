/**
 * @jest-environment node
 */
import {
  validateMachineSafety,
  canProceedMachineSafety,
  isMachineCheckPassed,
} from '../pages/dialysis/machineSafetyValidation';

describe('P2-08 Machine Safety Validation Logic', () => {
  it('treats Passed as the only passing status', () => {
    expect(isMachineCheckPassed('Passed')).toBe(true);
    expect(isMachineCheckPassed('passed')).toBe(true);
    expect(isMachineCheckPassed('Failed')).toBe(false);
    expect(isMachineCheckPassed('Not Yet Performed')).toBe(false);
    expect(isMachineCheckPassed('')).toBe(false);
  });

  it('allows continue only when machine is linked and both checks Passed', () => {
    expect(canProceedMachineSafety(
      { status: 'Passed' },
      { status: 'Passed' },
      'HD-01',
    )).toBe(true);
  });

  it('blocks continue when machine id is missing', () => {
    expect(canProceedMachineSafety(
      { status: 'Passed' },
      { status: 'Passed' },
      '',
    )).toBe(false);
  });

  it('blocks continue when QC is not yet performed', () => {
    expect(canProceedMachineSafety(
      { status: 'Not Yet Performed' },
      { status: 'Passed' },
      'HD-01',
    )).toBe(false);
  });

  it('blocks continue when Self-Test failed', () => {
    expect(canProceedMachineSafety(
      { status: 'Passed' },
      { status: 'Failed' },
      'HD-01',
    )).toBe(false);
  });

  it('legacy checklist helper requires every item OK/Passed and rejects empty', () => {
    expect(validateMachineSafety([
      { id: '1', status: 'OK' },
      { id: '2', status: 'Passed' },
    ])).toBe(true);
    expect(validateMachineSafety([
      { id: '1', status: 'OK' },
      { id: '2', status: 'Failed' },
    ])).toBe(false);
    expect(validateMachineSafety([])).toBe(false);
  });
});
