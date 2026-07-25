/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {},
}));

import {
  VERIFICATION_STEPS_7,
  INFECTION_STATUS,
  DIALYZER_USAGE_TYPE,
  checkIdentityMatch,
  checkInfectionGateResolved,
  checkConsumablesValid,
} from '../hooks/usePatientVerification';

describe('P2-04 Patient Verification Unit Logic & Rules (Node environment)', () => {
  describe('VERIFICATION_STEPS_7 constant', () => {
    it('defines exactly 7 steps in the condensed sequence', () => {
      expect(VERIFICATION_STEPS_7).toHaveLength(7);
      expect(VERIFICATION_STEPS_7[0].name).toBe('Patient Verification');
      expect(VERIFICATION_STEPS_7[1].name).toBe('Vitals & Measurements');
      expect(VERIFICATION_STEPS_7[2].name).toBe('Assessment');
      expect(VERIFICATION_STEPS_7[3].name).toBe('Access Assessment');
      expect(VERIFICATION_STEPS_7[4].name).toBe('Safety Checks');
      expect(VERIFICATION_STEPS_7[5].name).toBe('Validation');
      expect(VERIFICATION_STEPS_7[6].name).toBe('Start Dialysis');
    });
  });

  describe('checkIdentityMatch', () => {
    it('returns true when all 4 mandatory identifiers match', () => {
      const matches = {
        nameMatched: true,
        dobMatched: true,
        pidMatched: true,
        phoneMatched: true,
      };

      expect(checkIdentityMatch(matches)).toBe(true);
    });

    it('returns false when any identifier fails to match', () => {
      const matches = {
        nameMatched: true,
        dobMatched: false, // mismatch
        pidMatched: true,
        phoneMatched: true,
      };

      expect(checkIdentityMatch(matches)).toBe(false);
    });
  });

  describe('checkInfectionGateResolved', () => {
    it('returns true when neither HIV nor Hepatitis status is Pending', () => {
      expect(
        checkInfectionGateResolved(
          INFECTION_STATUS.NEGATIVE,
          INFECTION_STATUS.NEGATIVE,
          false
        )
      ).toBe(true);
    });

    it('returns false when status is Pending and neither Enter Now nor Skip has been actioned', () => {
      expect(
        checkInfectionGateResolved(
          INFECTION_STATUS.PENDING,
          INFECTION_STATUS.NEGATIVE,
          false
        )
      ).toBe(false);
    });

    it('returns true when status was Pending but has been actioned (Enter Now or Skip)', () => {
      expect(
        checkInfectionGateResolved(
          INFECTION_STATUS.PENDING,
          INFECTION_STATUS.NEGATIVE,
          true // actioned/skipped
        )
      ).toBe(true);
    });
  });

  describe('checkConsumablesValid (Multi-Use Dialyzer Reuse Rules)', () => {
    it('returns true for Single-Use dialyzer', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.SINGLE_USE,
        tubingSetQty: 1,
      };

      expect(checkConsumablesValid(state)).toBe(true);
    });

    it('returns true for Multi-Use dialyzer below reuse limit (4 of 6 uses)', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
        reuseCount: 4,
        reuseLimit: 6,
        tubingSetQty: 1,
      };

      expect(checkConsumablesValid(state)).toBe(true);
    });

    it('blocks when Multi-Use dialyzer is at/above limit (6 of 6 uses) without action', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
        reuseCount: 6,
        reuseLimit: 6,
        reuseAction: null,
        tubingSetQty: 1,
      };

      expect(checkConsumablesValid(state)).toBe(false);
    });

    it('blocks NEW_DIALYZER selection if physical discard confirmation checkbox is unchecked', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
        reuseCount: 6,
        reuseLimit: 6,
        reuseAction: 'NEW_DIALYZER',
        discardConfirmed: false, // unchecked
        tubingSetQty: 1,
      };

      expect(checkConsumablesValid(state)).toBe(false);
    });

    it('allows NEW_DIALYZER selection when physical discard confirmation checkbox is checked', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
        reuseCount: 6,
        reuseLimit: 6,
        reuseAction: 'NEW_DIALYZER',
        discardConfirmed: true, // checked
        tubingSetQty: 1,
      };

      expect(checkConsumablesValid(state)).toBe(true);
    });

    it('blocks OVERRIDE selection if override reason is empty or under 5 characters', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
        reuseCount: 6,
        reuseLimit: 6,
        reuseAction: 'OVERRIDE',
        overrideReason: 'Too short',
        tubingSetQty: 1,
      };

      // Reason must be >= 5 chars
      expect(checkConsumablesValid({ ...state, overrideReason: 'ab' })).toBe(false);
    });

    it('allows OVERRIDE selection when mandatory reason is provided', () => {
      const state = {
        dialyzerType: DIALYZER_USAGE_TYPE.MULTI_USE,
        reuseCount: 6,
        reuseLimit: 6,
        reuseAction: 'OVERRIDE',
        overrideReason: 'Physician approved extra session due to emergency replacement delay',
        tubingSetQty: 1,
      };

      expect(checkConsumablesValid(state)).toBe(true);
    });
  });
});
