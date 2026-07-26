/**
 * @jest-environment node
 */
import { validateInfectionControl } from '../pages/dialysis/infectionControlValidation';

describe('Infection Control Validation Logic (P2-10)', () => {
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

  it('returns true when all checklist items have compliant statuses', () => {
    expect(validateInfectionControl(compliantChecklist)).toBe(true);
  });

  it('returns false if any checklist item has a non-compliant status', () => {
    const nonCompliantChecklist = [
      ...compliantChecklist.slice(0, 4),
      { id: 'ro_disinfection', status: 'Failed' },
      ...compliantChecklist.slice(5),
    ];
    expect(validateInfectionControl(nonCompliantChecklist)).toBe(false);
  });

  it('returns false if checklist is null or empty', () => {
    expect(validateInfectionControl(null)).toBe(false);
    expect(validateInfectionControl([])).toBe(false);
  });
});
