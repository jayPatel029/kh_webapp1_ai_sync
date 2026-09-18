/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {},
}));

import {
  PRE_DIALYSIS_STEPS,
  STEP_STATUS,
  calculateProgressPercentage,
  derivePendingTasks,
  checkCanStartDialysis,
  checkPrintSummaryAllowed,
  normalizePatientInfoBar,
  normalizeLatestVitals,
  normalizePreDialysisSummary,
  normalizeAlertsList,
  normalizeNotesList,
} from '../hooks/usePreDialysisDashboard';

describe('P2-03 Pre-Dialysis Dashboard Unit Logic & Rules (Node environment)', () => {
  describe('PRE_DIALYSIS_STEPS constant', () => {
    it('defines exactly 9 steps in authoritative sequence', () => {
      expect(PRE_DIALYSIS_STEPS).toHaveLength(9);
      expect(PRE_DIALYSIS_STEPS[0].name).toBe('Patient Verification');
      expect(PRE_DIALYSIS_STEPS[1].name).toBe('Vitals & Measurements');
      expect(PRE_DIALYSIS_STEPS[2].name).toBe('Patient Assessment');
      expect(PRE_DIALYSIS_STEPS[3].name).toBe('Vascular Access Assessment');
      expect(PRE_DIALYSIS_STEPS[4].name).toBe('Machine Safety');
      expect(PRE_DIALYSIS_STEPS[5].name).toBe('Water Safety');
      expect(PRE_DIALYSIS_STEPS[6].name).toBe('Infection Control');
      expect(PRE_DIALYSIS_STEPS[7].name).toBe('Safety Validation');
      expect(PRE_DIALYSIS_STEPS[8].name).toBe('Start Dialysis Confirmation');
    });
  });

  describe('calculateProgressPercentage', () => {
    it('calculates 44% for 4 completed steps out of 9 (matching Figma export)', () => {
      const statuses = {
        verification: STEP_STATUS.COMPLETE,
        vitals: STEP_STATUS.COMPLETE,
        assessment: STEP_STATUS.COMPLETE,
        access: STEP_STATUS.COMPLETE,
        machine: STEP_STATUS.IN_PROGRESS,
        water: STEP_STATUS.NOT_STARTED,
        infection: STEP_STATUS.NOT_STARTED,
        validation: STEP_STATUS.NOT_STARTED,
        start: STEP_STATUS.NOT_STARTED,
      };

      expect(calculateProgressPercentage(statuses)).toBe(44);
    });

    it('returns 0% when no steps are complete', () => {
      expect(calculateProgressPercentage({})).toBe(0);
    });

    it('returns 100% when all 9 steps are complete', () => {
      const allComplete = PRE_DIALYSIS_STEPS.reduce((acc, step) => {
        acc[step.key] = STEP_STATUS.COMPLETE;
        return acc;
      }, {});

      expect(calculateProgressPercentage(allComplete)).toBe(100);
    });
  });

  describe('checkCanStartDialysis (Step 9 Gating)', () => {
    it('disables Start Dialysis when any of steps 1-8 are incomplete', () => {
      const statuses = {
        verification: STEP_STATUS.COMPLETE,
        vitals: STEP_STATUS.COMPLETE,
        assessment: STEP_STATUS.COMPLETE,
        access: STEP_STATUS.COMPLETE,
        machine: STEP_STATUS.IN_PROGRESS, // step 5 incomplete
        water: STEP_STATUS.NOT_STARTED,
        infection: STEP_STATUS.NOT_STARTED,
        validation: STEP_STATUS.NOT_STARTED,
        start: STEP_STATUS.NOT_STARTED,
      };

      expect(checkCanStartDialysis(statuses)).toBe(false);
    });

    it('enables Start Dialysis when all steps 1-8 are complete', () => {
      const steps1to8Complete = {
        verification: STEP_STATUS.COMPLETE,
        vitals: STEP_STATUS.COMPLETE,
        assessment: STEP_STATUS.COMPLETE,
        access: STEP_STATUS.COMPLETE,
        machine: STEP_STATUS.COMPLETE,
        water: STEP_STATUS.COMPLETE,
        infection: STEP_STATUS.COMPLETE,
        validation: STEP_STATUS.COMPLETE,
        start: STEP_STATUS.NOT_STARTED,
      };

      expect(checkCanStartDialysis(steps1to8Complete)).toBe(true);
    });
  });

  describe('derivePendingTasks', () => {
    it('returns incomplete tasks from steps 1-8', () => {
      const statuses = {
        verification: STEP_STATUS.COMPLETE,
        vitals: STEP_STATUS.COMPLETE,
        assessment: STEP_STATUS.COMPLETE,
        access: STEP_STATUS.COMPLETE,
        machine: STEP_STATUS.IN_PROGRESS,
        water: STEP_STATUS.NOT_STARTED,
        infection: STEP_STATUS.NOT_STARTED,
        validation: STEP_STATUS.NOT_STARTED,
        start: STEP_STATUS.NOT_STARTED,
      };

      const pending = derivePendingTasks(statuses);

      expect(pending).toHaveLength(4);
      expect(pending).toContain('Machine Safety Check');
      expect(pending).toContain('Water Quality Check');
      expect(pending).toContain('Infection Control Checklist');
      expect(pending).toContain('Safety Validation');
    });

    it('returns empty array when steps 1-8 are all complete', () => {
      const allComplete = PRE_DIALYSIS_STEPS.reduce((acc, step) => {
        acc[step.key] = STEP_STATUS.COMPLETE;
        return acc;
      }, {});

      expect(derivePendingTasks(allComplete)).toHaveLength(0);
    });
  });

  describe('checkPrintSummaryAllowed (Role-gating)', () => {
    it('allows Nephrologist and Doctor roles', () => {
      expect(checkPrintSummaryAllowed('Nephrologist')).toBe(true);
      expect(checkPrintSummaryAllowed('Doctor')).toBe(true);
      expect(checkPrintSummaryAllowed('Dr')).toBe(true);
      expect(checkPrintSummaryAllowed('Senior Nephrologist')).toBe(true);
    });

    it('denies Dialysis Technician and Nurse roles', () => {
      expect(checkPrintSummaryAllowed('Dialysis Technician')).toBe(false);
      expect(checkPrintSummaryAllowed('Technician')).toBe(false);
      expect(checkPrintSummaryAllowed('Nurse')).toBe(false);
      expect(checkPrintSummaryAllowed(null)).toBe(false);
      expect(checkPrintSummaryAllowed('')).toBe(false);
    });
  });

  describe('normalizePatientInfoBar', () => {
    it('normalizes patient details and assignment in B-02 / HD-01 format', () => {
      const patient = {
        id: 10023,
        patient_code: 'P10023',
        name: 'Ramesh Kumar',
        dob: '1967-04-20',
        gender: 'Male',
        number: '+91 98765 43210',
        dry_weight: '68.5',
        blood_group: 'O+',
        last_dialysis_date: '2023-01-12',
        vascular_access: 'AV Fistula (Left)',
        next_schedule: 'Today 26 May, 07:00 AM Shift 1',
        primary_doctor_name: 'Dr. Neha Mehta',
        dialysis_type: 'Hemodialysis',
        shift_time: '07:00 AM',
        bed_number: 'B-02',
        machine_number: 'HD-01',
        attending_technician: 'Rahul Singh',
      };

      const info = normalizePatientInfoBar(patient);

      expect(info.patientCode).toBe('P10023');
      expect(info.name).toBe('Ramesh Kumar');
      expect(info.dryWeight).toBe('68.5 kg');
      expect(info.bloodGroup).toBe('O+');
      expect(info.vascularAccess).toBe('AV Fistula (Left)');
      expect(info.assignment.bedMachine).toBe('B-02 / HD-01');
      expect(info.assignment.technician).toBe('Rahul Singh');
    });

    it('anonymizes patient identity when ABDM consent is revoked and viewed by Doctor', () => {
      const patient = {
        id: 10023,
        patient_code: 'P10023',
        name: 'Ramesh Kumar',
        number: '+91 98765 43210',
      };

      const info = normalizePatientInfoBar(patient, true);

      expect(info.name).toBe('ANON-P10023');
      expect(info.phone).toBe('XXXXXXXXXX');
      expect(info.photo).toBeNull();
    });
  });

  describe('normalizeLatestVitals', () => {
    it('normalizes vitals with Normal tags', () => {
      const patient = {
        bp: '138/82',
        pulse: '78',
        temperature: '36.8',
        spo2: '98',
        pre_weight: '68.5',
        resp_rate: '18',
      };

      const vitals = normalizeLatestVitals(patient);

      expect(vitals.bp).toBe('138/82 mmHg');
      expect(vitals.bpTag).toBe('Normal');
      expect(vitals.pulse).toBe('78 bpm');
      expect(vitals.temp).toBe('36.8 °C');
      expect(vitals.spo2).toBe('98%');
      expect(vitals.preWeight).toBe('68.5 kg');
      expect(vitals.respRate).toBe('18 bpm');
    });
  });

  describe('normalizePreDialysisSummary', () => {
    it('normalizes target UF goal and dialysate parameters', () => {
      const prescription = {
        uf_goal: '2.0 L',
        dialysis_time: '4:00 hrs',
        blood_flow_rate: '350 mL/min',
        dialysate_flow_rate: '500 mL/min',
        dialysate_temp: '36.5 °C',
        na: '138 mEq/L',
        k: '4.0 mEq/L',
        bicarbonate: '32 mEq/L',
      };

      const summary = normalizePreDialysisSummary(prescription, null);

      expect(summary.targetUfGoal).toBe('2.0 L');
      expect(summary.expectedTreatmentTime).toBe('4:00 hrs');
      expect(summary.bfr).toBe('350 mL/min');
      expect(summary.dfr).toBe('500 mL/min');
      expect(summary.na).toBe('138 mEq/L');
    });
  });

  describe('normalizeAlertsList & normalizeNotesList', () => {
    it('returns structured alerts list only when thresholds are exceeded', () => {
      const alerts = normalizeAlertsList({ potassium: '5.2', hemoglobin: '9.6' });
      expect(alerts).toHaveLength(2);
      expect(alerts.find((a) => a.title === 'High Potassium').severity).toBe('Critical');
      expect(alerts.find((a) => a.title === 'Low Hemoglobin').severity).toBe('Warning');
    });

    it('returns no demo alerts when lab values are within range', () => {
      expect(normalizeAlertsList({ potassium: '4.2', hemoglobin: '11.0' })).toEqual([]);
    });

    it('returns empty notes array when no notes exist', () => {
      expect(normalizeNotesList({})).toEqual([]);
    });
  });
});
