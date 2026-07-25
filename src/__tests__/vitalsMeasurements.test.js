/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {},
}));

import {
  VITAL_SEVERITY,
  calculateWeightGain,
  calculateBMI,
  calculateMAP,
  calculateUFGoal,
  evaluateBp,
  evaluatePulse,
  evaluateTemp,
  evaluateSpo2,
} from '../hooks/useVitalsMeasurements';

describe('P2-05 Vitals & Measurements Unit Logic & Threshold Rules (Node environment)', () => {
  describe('Auto-Calculations', () => {
    it('calculates Weight Gain correctly: Weight(Pre) - Last Post Weight', () => {
      expect(calculateWeightGain('68.5', '67.0')).toBe('1.5');
      expect(calculateWeightGain('70.2', '67.0')).toBe('3.2');
      expect(calculateWeightGain('', '67.0')).toBe('0.0');
    });

    it('calculates BMI correctly: Weight(kg) / (Height(m))^2', () => {
      expect(calculateBMI('68.5', '170')).toBe('23.7');
      expect(calculateBMI('80.0', '180')).toBe('24.7');
      expect(calculateBMI('', '170')).toBe('0.0');
    });

    it('calculates Pre-Dialysis MAP correctly: (Systolic + 2 * Diastolic) / 3', () => {
      expect(calculateMAP('138', '82')).toBe(101);
      expect(calculateMAP('120', '80')).toBe(93);
      expect(calculateMAP('', '')).toBe(0);
    });

    it('calculates UF Goal correctly: (Weight Pre - EDW) + Heparin/Saline Allowance', () => {
      expect(calculateUFGoal('68.5', '67.0', 0.5)).toBe('2.0');
      expect(calculateUFGoal('70.0', '67.0', 0.5)).toBe('3.5');
      expect(calculateUFGoal('', '67.0')).toBe('0.0');
    });
  });

  describe('Clinical Threshold Evaluators', () => {
    describe('evaluateBp', () => {
      it('evaluates normal BP < 140/90', () => {
        const res = evaluateBp('138', '82');
        expect(res.severity).toBe(VITAL_SEVERITY.NORMAL);
      });

      it('evaluates Warning tier BP (140-160 or 90-100)', () => {
        const resHigh = evaluateBp('145', '92');
        expect(resHigh.severity).toBe(VITAL_SEVERITY.WARNING);
        expect(resHigh.label).toBe('High');
      });

      it('evaluates Critical tier BP (> 160 or > 100 or < 90)', () => {
        const resCritical = evaluateBp('170', '105');
        expect(resCritical.severity).toBe(VITAL_SEVERITY.CRITICAL);
        expect(resCritical.label).toBe('Critical');
      });
    });

    describe('evaluatePulse', () => {
      it('evaluates normal pulse 60-100', () => {
        expect(evaluatePulse('78').severity).toBe(VITAL_SEVERITY.NORMAL);
      });

      it('evaluates Warning tier pulse (50-59 or 101-110)', () => {
        expect(evaluatePulse('105').severity).toBe(VITAL_SEVERITY.WARNING);
      });

      it('evaluates Critical tier pulse (< 50 or > 110)', () => {
        expect(evaluatePulse('120').severity).toBe(VITAL_SEVERITY.CRITICAL);
        expect(evaluatePulse('45').severity).toBe(VITAL_SEVERITY.CRITICAL);
      });
    });

    describe('evaluateTemp', () => {
      it('evaluates normal temperature 36.0-37.5 °C', () => {
        expect(evaluateTemp('36.8').severity).toBe(VITAL_SEVERITY.NORMAL);
      });

      it('evaluates Warning tier temperature (37.6-38.0)', () => {
        expect(evaluateTemp('37.8').severity).toBe(VITAL_SEVERITY.WARNING);
      });

      it('evaluates Critical tier temperature (>= 38.1 or < 35.5)', () => {
        expect(evaluateTemp('38.5').severity).toBe(VITAL_SEVERITY.CRITICAL);
      });
    });

    describe('evaluateSpo2', () => {
      it('evaluates normal SpO2 >= 95%', () => {
        expect(evaluateSpo2('98').severity).toBe(VITAL_SEVERITY.NORMAL);
      });

      it('evaluates Warning tier SpO2 (90-94%)', () => {
        expect(evaluateSpo2('92').severity).toBe(VITAL_SEVERITY.WARNING);
      });

      it('evaluates Critical tier SpO2 (< 90%)', () => {
        expect(evaluateSpo2('88').severity).toBe(VITAL_SEVERITY.CRITICAL);
      });
    });
  });
});
