/**
 * @jest-environment node
 */
import {
  validateInfectionControl,
  canProceedInfectionControl,
  getCriticalInfectionIssues,
  computeInfectionCompliancePct,
} from '../pages/dialysis/infectionControlValidation';

describe('Infection Control Validation Logic (P2-10)', () => {
  const emptyItems = {
    hand_hygiene: null,
    ppe: null,
    work_area_clean: null,
    dialysis_machine_disinfected: null,
    ro_system_disinfection: null,
    dialyzer_reuse: null,
    aseptic_technique: null,
    sharps_handling: null,
    biomedical_waste: null,
    isolation_precautions: null,
  };

  const completeAvf = {
    hand_hygiene: true,
    ppe: true,
    work_area_clean: true,
    dialysis_machine_disinfected: true,
    ro_system_disinfection: 'not_applicable',
    dialyzer_reuse: 'not_applicable',
    aseptic_technique: true,
    sharps_handling: true,
    biomedical_waste: true,
    isolation_precautions: 'not_applicable',
  };

  it('blocks when checklist is still empty', () => {
    expect(canProceedInfectionControl(emptyItems, 'AVF', null)).toBe(false);
    expect(getCriticalInfectionIssues(emptyItems, 'AVF', null).length).toBeGreaterThan(0);
  });

  it('passes for AVF when every item is resolved and criticals are compliant', () => {
    expect(canProceedInfectionControl(completeAvf, 'AVF', null)).toBe(true);
    expect(computeInfectionCompliancePct(completeAvf, 'AVF', null)).toBe(100);
  });

  it('requires scrub-the-hub for CVC', () => {
    expect(canProceedInfectionControl(completeAvf, 'CVC', null)).toBe(false);
    expect(canProceedInfectionControl(completeAvf, 'CVC', 'no')).toBe(false);
    expect(canProceedInfectionControl(completeAvf, 'CVC', 'yes')).toBe(true);
  });

  it('blocks when access type is missing', () => {
    expect(canProceedInfectionControl(completeAvf, '', null)).toBe(false);
  });

  it('legacy checklist helper still validates status labels', () => {
    const compliantChecklist = [
      { id: 'hand_hygiene', status: 'Completed' },
      { id: 'ppe', status: 'Used' },
      { id: 'work_area', status: 'Yes' },
      { id: 'machine_disinfected', status: 'Yes' },
      { id: 'ro_disinfection', status: 'Up to Date' },
      { id: 'dialyzer_reuse', status: 'Not Applicable' },
      { id: 'aseptic_technique', status: 'Followed' },
      { id: 'sharps_handling', status: 'Safe' },
      { id: 'biomedical_waste', status: 'Compliant' },
      { id: 'isolation_precautions', status: 'Not Applicable' },
    ];
    expect(validateInfectionControl(compliantChecklist)).toBe(true);
    expect(validateInfectionControl([])).toBe(false);
  });
});
