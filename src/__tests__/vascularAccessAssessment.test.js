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
    expect(result.validationErrors).toHaveLength(0);
  });

  it('AVF Blocks progression when Signs of Infection is Yes', () => {
    const formData = {
      signsOfInfection: 'Yes',
      bleedingDischarge: 'No',
      thrillBruit: 'Present',
      accessFlow: '600',
    };
    const result = validateVascularAccess('AVF', AVF_AVG_CONFIG, formData);
    
    expect(result.isCriticalFailed).toBe(true);
    expect(result.criticalErrors).toContain('Signs of Infection detected. Do not cannulate this access — escalate before proceeding.');
  });

  it('AVF Access Flow shows Adequacy based on 500 mL/min threshold', () => {
    const formData = {
      signsOfInfection: 'No',
      bleedingDischarge: 'No',
      thrillBruit: 'Present',
      accessFlow: '450', // Low flow
    };
    const result = validateVascularAccess('AVF', AVF_AVG_CONFIG, formData);
    
    expect(result.isCriticalFailed).toBe(true);
    expect(result.criticalErrors).toContain('Access Flow < 500 mL/min. Escalate before proceeding.');
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
    expect(result.validationErrors).toHaveLength(0);
  });

  it('CVC Blocks progression when Catheter Patent is No', () => {
    const formData = {
      signsOfInfectionCVC: 'No',
      catheterPatent: 'No',
      tendernessPain: 'No',
    };
    const result = validateVascularAccess('CVC', CVC_CONFIG, formData);
    
    expect(result.isCriticalFailed).toBe(true);
    expect(result.criticalErrors).toContain('Catheter Patent is No. Escalate before proceeding.');
  });

  it('Fails validation if a critical field is completely missing', () => {
    const formData = {
      signsOfInfectionCVC: 'No',
      // catheterPatent is missing
      tendernessPain: 'No',
    };
    const result = validateVascularAccess('CVC', CVC_CONFIG, formData);
    
    expect(result.isCriticalFailed).toBe(true); // Missing critical fails
    expect(result.validationErrors).toContain('Required: Catheter Patent');
  });

});
