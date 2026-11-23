/** @jest-environment node */

import { validateVascularAccess, AVF_AVG_CONFIG, CVC_CONFIG } from '../pages/dialysis/vascularAccessValidation';

describe('P2-07 Vascular Access Assessment Logic (Node Environment)', () => {

  it('fails immediately when Access Type is missing', () => {
    const result = validateVascularAccess('', [], {});
    expect(result.isCriticalFailed).toBe(true);
    expect(result.criticalErrors).toContain('Access Type is required');
  });

  it('AVF validates perfectly when all critical fields are fine', () => {
    const formData = {
      signsOfInfection: 'No',
      bleedingDischarge: 'No',
      thrillBruit: 'Present',
      accessFlow: '600',
    };
    const result = validateVascularAccess('AVF', AVF_AVG_CONFIG, formData);

    expect(result.isCriticalFailed).toBe(false);
    expect(result.criticalErrors).toHaveLength(0);
    expect(result.alwaysAlertWarnings).toHaveLength(0);
  });

  it('AVF Blocks when Signs of Infection is Yes (D11)', () => {
    const formData = {
      signsOfInfection: 'Yes',
      bleedingDischarge: 'No',
      thrillBruit: 'Present',
      accessFlow: '600',
    };
    const result = validateVascularAccess('AVF', AVF_AVG_CONFIG, formData);

    expect(result.isCriticalFailed).toBe(true);
    expect(result.criticalErrors[0]).toMatch(/Blocked until cleared/);
  });

  it('AVF Access Flow < 500 is always-alert, not blocking (D13)', () => {
    const formData = {
      signsOfInfection: 'No',
      bleedingDischarge: 'No',
      thrillBruit: 'Present',
      accessFlow: '450',
    };
    const result = validateVascularAccess('AVF', AVF_AVG_CONFIG, formData);

    expect(result.isCriticalFailed).toBe(false);
    expect(result.alwaysAlertWarnings.some((w) => w.includes('Access Flow'))).toBe(true);
  });

  it('CVC validates perfectly when all critical fields are fine', () => {
    const formData = {
      signsOfInfectionCVC: 'No',
      catheterPatent: 'Yes',
      tendernessPain: 'No',
    };
    const result = validateVascularAccess('CVC', CVC_CONFIG, formData);

    expect(result.isCriticalFailed).toBe(false);
    expect(result.criticalErrors).toHaveLength(0);
  });

  it('CVC Blocks when Catheter Patent is No (D11)', () => {
    const formData = {
      signsOfInfectionCVC: 'No',
      catheterPatent: 'No',
      tendernessPain: 'No',
    };
    const result = validateVascularAccess('CVC', CVC_CONFIG, formData);

    expect(result.isCriticalFailed).toBe(true);
    expect(result.criticalErrors[0]).toMatch(/Blocked until cleared/);
  });

  it('Blank Critical fields are listed for popup, not hard-failed (D8)', () => {
    const formData = {
      signsOfInfectionCVC: 'No',
      tendernessPain: 'No',
    };
    const result = validateVascularAccess('CVC', CVC_CONFIG, formData);

    expect(result.isCriticalFailed).toBe(false);
    expect(result.blankCriticalFields.some((f) => f.key === 'catheterPatent')).toBe(true);
    expect(result.validationErrors).toHaveLength(0);
  });

});
