/**
 * @jest-environment node
 */
import { validateMachineSafety } from '../pages/dialysis/machineSafetyValidation';

describe('Machine Safety Validation Logic', () => {
  it('returns true when all checklist items have status OK', () => {
    const mockChecklist = [
      { id: '1', status: 'OK' },
      { id: '2', status: 'OK' },
      { id: '3', status: 'OK' },
    ];
    
    expect(validateMachineSafety(mockChecklist)).toBe(true);
  });

  it('returns false when any checklist item has status other than OK', () => {
    const mockChecklist = [
      { id: '1', status: 'OK' },
      { id: '2', status: 'Failed' },
      { id: '3', status: 'OK' },
    ];
    
    expect(validateMachineSafety(mockChecklist)).toBe(false);
  });

  it('returns true for an empty checklist', () => {
    // If no items to check, technically it shouldn't block, 
    // or depending on business logic it might fail. Standard "every" returns true.
    expect(validateMachineSafety([])).toBe(true);
  });
});
