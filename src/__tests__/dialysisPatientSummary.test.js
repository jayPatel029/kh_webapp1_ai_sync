/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {}
}));

import {
  calculateAge,
  formatDate,
  calcDialysisDuration,
  deriveLabFlag,
  deriveAlertSeverity,
  normalizePatientBanner,
  normalizePrescription,
  normalizeVitals,
  normalizeLabs,
  normalizeAlerts,
  normalizeNotes,
} from '../hooks/usePatientSummary';

describe('P2-02 Patient Summary Unit Logic & Normalization Rules (Node environment)', () => {
  describe('calculateAge', () => {
    it('calculates age from DOB string correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 45;
      const dob = `${birthYear}-05-20`;
      expect(calculateAge(dob)).toBe(45);
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates to DD-MMM-YYYY en-GB format', () => {
      expect(formatDate('2023-01-12')).toBe('12 Jan 2023');
      expect(formatDate('2026-05-24T12:00:00Z')).toBe('24 May 2026');
    });

    it('returns fallback dash for invalid dates', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate('')).toBe('—');
    });
  });

  describe('calcDialysisDuration', () => {
    it('calculates years and months since first dialysis session', () => {
      const firstDate = '2023-01-12';
      const duration = calcDialysisDuration(firstDate);
      expect(duration).toContain('y');
    });
  });

  describe('deriveLabFlag', () => {
    it('derives correct Low flag for Hemoglobin < 12', () => {
      expect(deriveLabFlag('Hemoglobin', '9.5')).toBe('Low');
      expect(deriveLabFlag('Hemoglobin', '13.0')).toBe('');
    });

    it('derives correct High flag for Potassium > 5.0', () => {
      expect(deriveLabFlag('Potassium', '5.4')).toBe('High');
      expect(deriveLabFlag('Potassium', '4.0')).toBe('');
    });

    it('handles empty value cleanly', () => {
      expect(deriveLabFlag('Potassium', '—')).toBe('');
      expect(deriveLabFlag('Potassium', '')).toBe('');
    });
  });

  describe('deriveAlertSeverity', () => {
    it('derives Critical for high-risk text', () => {
      expect(deriveAlertSeverity('High Potassium detected')).toBe('Critical');
      expect(deriveAlertSeverity('Fluid Overload Risk')).toBe('Critical');
    });

    it('derives Warning for medium-risk text', () => {
      expect(deriveAlertSeverity('Low Hemoglobin warning')).toBe('Warning');
    });

    it('defaults to Info for other alerts', () => {
      expect(deriveAlertSeverity('Routine session alerts')).toBe('Info');
    });
  });

  describe('normalizePatientBanner', () => {
    it('maps all demographics and clinical metadata correctly', () => {
      const patient = {
        id: 42,
        name: 'Ramesh Kumar',
        patient_code: 'P10023',
        dob: '1968-04-20',
        gender: 'Male',
        number: '9876543210',
        primary_diagnosis: 'CKD - Stage 5D',
        dialysis_type: 'Hemodialysis',
        vascular_access: 'AV Fistula (Left)',
        primary_doctor_name: 'Dr. Neha Mehta',
        schedule: 'Mon, Wed, Fri',
        first_dialysis_date: '2023-01-12',
      };

      const banner = normalizePatientBanner(patient);

      expect(banner.id).toBe(42);
      expect(banner.patientCode).toBe('P10023');
      expect(banner.name).toBe('Ramesh Kumar');
      expect(banner.age).toBeDefined();
      expect(banner.gender).toBe('Male');
      expect(banner.phone).toBe('9876543210');
      expect(banner.diagnosis).toBe('CKD - Stage 5D');
      expect(banner.dialysisType).toBe('Hemodialysis');
      expect(banner.vascularAccess).toBe('AV Fistula (Left)');
      expect(banner.nephrologist).toBe('Dr. Neha Mehta');
      expect(banner.schedule).toBe('Mon, Wed, Fri');
      expect(banner.firstDialysisDate).toBe('2023-01-12');
      expect(banner.firstDialysisDuration).toContain('y');
    });
  });

  describe('normalizePrescription', () => {
    it('extracts prescription parameters cleanly', () => {
      const params = [
        {
          dialyzer: 'Fresenius FX 80',
          blood_flow_rate: '350',
          dialysate_flow_rate: '500',
          dialysis_time: '4:00',
          heparin: '2000 IU bolus',
          updated_at: '2026-05-24T12:00:00Z',
          updated_by_name: 'Dr. Neha Mehta',
        },
      ];

      const normalized = normalizePrescription(params);

      expect(normalized.dialyzer).toBe('Fresenius FX 80');
      expect(normalized.bloodFlowRate).toBe('350');
      expect(normalized.dialysateFlowRate).toBe('500');
      expect(normalized.dialysisTime).toBe('4:00');
      expect(normalized.heparin).toBe('2000 IU bolus');
      expect(normalized.lastUpdated).toBe('24 May 2026');
      expect(normalized.updatedBy).toBe('Dr. Neha Mehta');
    });
  });

  describe('normalizeVitals', () => {
    it('normalizes BP, pulse, temp, spo2 and pre/post weight', () => {
      const patient = {
        bp: '138/82',
        pulse: '78',
        temperature: '36.8',
        spo2: '98',
        pre_weight: '68.5',
        post_weight: '', // Empty weight post
        vitals_date: '2026-05-24T12:00:00Z',
      };

      const vitals = normalizeVitals(patient);

      expect(vitals.bp).toBe('138/82');
      expect(vitals.pulse).toBe('78');
      expect(vitals.temperature).toBe('36.8');
      expect(vitals.spo2).toBe('98');
      expect(vitals.preWeight).toBe('68.5');
      expect(vitals.postWeight).toBe('—'); // Fallback to dash
      expect(vitals.date).toBe('24 May 2026');
    });
  });

  describe('normalizeLabs', () => {
    it('normalizes lab items with flags', () => {
      const patient = {
        hemoglobin: '9.6',
        potassium: '5.2',
        urea: '168',
        creatinine: '9.8',
        albumin: '3.6',
        labs_date: '2026-05-24T12:00:00Z',
      };

      const labs = normalizeLabs(patient);

      expect(labs.date).toBe('24 May 2026');
      expect(labs.items).toHaveLength(5);
      expect(labs.items.find(i => i.label === 'Hemoglobin').flag).toBe('Low');
      expect(labs.items.find(i => i.label === 'Potassium').flag).toBe('High');
      expect(labs.items.find(i => i.label === 'Creatinine').flag).toBe('High');
      expect(labs.items.find(i => i.label === 'Albumin').flag).toBe('');
    });
  });

  describe('normalizeAlerts', () => {
    it('gathers all derived and patient-provided alerts', () => {
      const patient = {
        alert_text: 'Fluid Overload Risk',
        infection_status: 'Hepatitis B Negative',
        hemoglobin: '9.6', // Low Hemoglobin alert derived
        potassium: '5.2', // High Potassium alert derived
      };

      const alerts = normalizeAlerts(patient);

      expect(alerts).toHaveLength(4);
      expect(alerts.find(a => a.text === 'Fluid Overload Risk').severity).toBe('Critical');
      expect(alerts.find(a => a.text === 'Low Hemoglobin').severity).toBe('Warning');
      expect(alerts.find(a => a.text === 'High Potassium').severity).toBe('Critical');
    });
  });

  describe('normalizeNotes', () => {
    it('handles single string notes mapping cleanly', () => {
      const patient = {
        notes: 'Patient feels tired post dialysis.',
        primary_doctor_name: 'Dr. Neha Mehta',
        updated_at: '2026-05-24T12:00:00Z',
      };

      const notes = normalizeNotes(patient);

      expect(notes).toHaveLength(1);
      expect(notes[0].text).toBe('Patient feels tired post dialysis.');
      expect(notes[0].author).toBe('Dr. Neha Mehta');
      expect(notes[0].date).toBe('24 May 2026');
    });
  });
});
