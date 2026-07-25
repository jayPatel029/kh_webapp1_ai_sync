/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {},
}));

import {
  CRITICAL_SUBJECTIVE_SYMPTOMS,
  NON_CRITICAL_SUBJECTIVE_SYMPTOMS,
  CRITICAL_OBJECTIVE_FIELDS,
  NON_CRITICAL_OBJECTIVE_FIELDS,
  getKpsDescription,
  validateAssessmentState,
} from '../hooks/usePatientAssessment';

describe('P2-06 Patient Assessment Unit Logic & Validation Rules (Node environment)', () => {
  describe('KPS Description Mapping', () => {
    it('returns the exact clinical description for KPS 70', () => {
      expect(getKpsDescription(70)).toBe(
        'Cares for self; unable to carry on normal activity or to do active work.'
      );
    });

    it('returns description for KPS 100', () => {
      expect(getKpsDescription(100)).toBe(
        'Normal; no complaints; no evidence of disease.'
      );
    });
  });

  describe('Critical Field Classification', () => {
    it('defines exactly 5 Critical Subjective symptoms', () => {
      expect(CRITICAL_SUBJECTIVE_SYMPTOMS).toEqual([
        'shortnessOfBreath',
        'chestPain',
        'feverChills',
        'dizzinessGiddiness',
        'bleedingBruising',
      ]);
    });

    it('defines 4 Critical Objective observation fields', () => {
      expect(CRITICAL_OBJECTIVE_FIELDS).toEqual([
        'consciousness',
        'lungSounds',
        'heartSounds',
        'anyAbnormalFinding',
      ]);
    });
  });

  describe('validateAssessmentState', () => {
    const validSubjective = {
      shortnessOfBreath: 'No',
      chestPain: 'No',
      feverChills: 'No',
      dizzinessGiddiness: 'No',
      bleedingBruising: 'No',
      symptomDetails: {},
    };

    const validObjective = {
      consciousness: 'Oriented',
      lungSounds: 'Clear',
      heartSounds: 'Normal',
      anyAbnormalFinding: 'No',
      abnormalFindingDescription: '',
    };

    it('returns true when all Critical fields are selected and no abnormal findings require details', () => {
      expect(validateAssessmentState(validSubjective, validObjective)).toBe(true);
    });

    it('returns false if a Critical Subjective symptom is missing', () => {
      const invalidSub = { ...validSubjective, shortnessOfBreath: '' };
      expect(validateAssessmentState(invalidSub, validObjective)).toBe(false);
    });

    it('returns false if a symptom is "Yes" but description comment is empty', () => {
      const subWithYes = {
        ...validSubjective,
        chestPain: 'Yes',
        symptomDetails: { chestPain: '' }, // empty
      };

      expect(validateAssessmentState(subWithYes, validObjective)).toBe(false);
    });

    it('returns true if a symptom is "Yes" AND description comment is provided', () => {
      const subWithYes = {
        ...validSubjective,
        chestPain: 'Yes',
        symptomDetails: { chestPain: 'Mild left chest tightness during exertion' },
      };

      expect(validateAssessmentState(subWithYes, validObjective)).toBe(true);
    });

    it('returns false if anyAbnormalFinding is "Yes" but abnormalFindingDescription is empty', () => {
      const objWithAbnormal = {
        ...validObjective,
        anyAbnormalFinding: 'Yes',
        abnormalFindingDescription: '', // empty
      };

      expect(validateAssessmentState(validSubjective, objWithAbnormal)).toBe(false);
    });

    it('returns true if anyAbnormalFinding is "Yes" AND abnormalFindingDescription is provided', () => {
      const objWithAbnormal = {
        ...validObjective,
        anyAbnormalFinding: 'Yes',
        abnormalFindingDescription: 'Mild pitting edema on bilateral ankle.',
      };

      expect(validateAssessmentState(validSubjective, objWithAbnormal)).toBe(true);
    });
  });
});
