/**
 * @jest-environment node
 */
import {
  verifyPin,
  DEFAULT_CORRECT_PIN,
  MAX_ATTEMPTS,
  canStartChecklist,
  canSubmitStartDialysis,
  normalizeStartChecklist,
} from '../pages/dialysis/startDialysisValidation';

describe('Start Dialysis Confirmation PIN Logic (P2-12)', () => {
  const completeSteps = Array.from({ length: 8 }).map((_, idx) => ({
    step: idx + 1,
    key: `step_${idx + 1}`,
    status: 'complete',
    complete: true,
    name: `Step ${idx + 1}`,
  }));

  it('validates correctly when the correct PIN is provided', () => {
    const result = verifyPin(DEFAULT_CORRECT_PIN, 0);
    expect(result.isValid).toBe(true);
    expect(result.isLocked).toBe(false);
    expect(result.error).toBe('');
  });

  it('rejects incorrect PIN on 1st attempt and increments attempt count', () => {
    const result = verifyPin('9999', 0);
    expect(result.isValid).toBe(false);
    expect(result.attempts).toBe(1);
    expect(result.isLocked).toBe(false);
    expect(result.error).toBe('Incorrect password. Try again.');
  });

  it('locks out after 3 failed attempts', () => {
    const result = verifyPin('9999', 2);
    expect(result.isValid).toBe(false);
    expect(result.attempts).toBe(3);
    expect(result.isLocked).toBe(true);
    expect(result.error).toBe('Too many failed attempts. Ask a nurse or nephrologist to unlock.');
  });

  it('prevents submission if already locked out', () => {
    const result = verifyPin(DEFAULT_CORRECT_PIN, 3);
    expect(result.isValid).toBe(false);
    expect(result.isLocked).toBe(true);
    expect(result.error).toBe('Too many failed attempts. Ask a nurse or nephrologist to unlock.');
  });

  it('requires all 8 checklist rows before start', () => {
    expect(canStartChecklist(completeSteps)).toBe(true);
    expect(canStartChecklist(completeSteps.slice(0, 7))).toBe(false);
    expect(normalizeStartChecklist(completeSteps)).toHaveLength(8);
  });

  it('requires attestation + PIN + unlocked checklist to enable Start', () => {
    expect(canSubmitStartDialysis({
      checklistComplete: true,
      attested: true,
      pin: '1111',
      locked: false,
    })).toBe(true);
    expect(canSubmitStartDialysis({
      checklistComplete: true,
      attested: false,
      pin: '1111',
      locked: false,
    })).toBe(false);
    expect(canSubmitStartDialysis({
      checklistComplete: true,
      attested: true,
      pin: '',
      locked: false,
    })).toBe(false);
    expect(canSubmitStartDialysis({
      checklistComplete: true,
      attested: true,
      pin: '1111',
      locked: true,
    })).toBe(false);
    expect(MAX_ATTEMPTS).toBe(3);
  });
});
