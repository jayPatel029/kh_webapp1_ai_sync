/**
 * @jest-environment node
 */
import { normalizePreDialysisProfileData } from '../components/PreDialysisPatientProfileCard';
import { normalizePatientInfoBar } from '../hooks/usePreDialysisDashboard';
import { normalizePatientBanner } from '../hooks/usePatientSummary';

describe('Patient Banner API Data Only (No Ramesh Kumar / Hardcoded Fallbacks)', () => {
  const mockApiResponse = {
    success: true,
    data: {
      patient: {
        id: 21,
        patient_code: 'FE0821435901',
        name: 'Anita Desai (FE0821435901)',
        gender: 'F',
        age: 49,
        dob: null,
        email: null,
        phone_no: '9888435900',
        address: null,
        city: null,
        pincode: null,
        clinic_id: 7,
        organization_id: 2,
        is_infectious: 0,
        patient_ailments: null,
        registered_date: '2026-08-21T00:00:00.000Z',
        district: null,
        economic_status: null,
        primary_diagnosis: null,
        abha_id: null,
        abha_verified: 0,
        bpl_verified: 0,
        patient_status: 'Active',
        status_change_date: null,
        death_cause: null,
        transfer_to_facility_id: null,
        transfer_direction: null,
        created_at: '2026-08-21T16:02:23.000Z',
        updated_at: '2026-08-21T16:02:23.000Z',
        hiv_status: 'Negative',
        hepatitis_status: 'Negative',
        consent_status: 'Active',
        anonymized: 0,
      },
      hiv_status: 'Negative',
      hepatitis_status: 'Negative',
      has_active_prescription_today: null,
    },
  };

  it('correctly unwraps nested patient object and renders Anita Desai in normalizePreDialysisProfileData', () => {
    const profile = normalizePreDialysisProfileData(mockApiResponse.data);

    expect(profile.name).toBe('Anita Desai (FE0821435901)');
    expect(profile.patientCode).toBe('FE0821435901');
    expect(profile.gender).toBe('Female');
    expect(profile.age).toBe('49');
    expect(profile.phone).toBe('9888435900');
    expect(profile.name).not.toContain('Ramesh');
    expect(profile.patientCode).not.toBe('P10023');
    expect(profile.dryWeight).toBe('—');
    expect(profile.nephrologist).toBe('—');
  });

  it('correctly unwraps nested patient object in normalizePatientInfoBar', () => {
    const info = normalizePatientInfoBar(mockApiResponse.data);

    expect(info.name).toBe('Anita Desai (FE0821435901)');
    expect(info.patientCode).toBe('FE0821435901');
    expect(info.gender).toBe('Female');
    expect(info.age).toBe('49');
    expect(info.phone).toBe('9888435900');
    expect(info.name).not.toContain('Ramesh');
    expect(info.nephrologist).toBe('—');
  });

  it('correctly unwraps nested patient object in normalizePatientBanner', () => {
    const banner = normalizePatientBanner(mockApiResponse.data);

    expect(banner.name).toBe('Anita Desai (FE0821435901)');
    expect(banner.patientCode).toBe('FE0821435901');
    expect(banner.gender).toBe('Female');
    expect(banner.age).toBe('49');
    expect(banner.phone).toBe('9888435900');
    expect(banner.name).not.toContain('Ramesh');
    expect(banner.nephrologist).toBe('—');
  });
});
