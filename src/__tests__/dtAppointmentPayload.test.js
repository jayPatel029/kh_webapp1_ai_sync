jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: { post: jest.fn() }
}));

import { formatDtAppointmentPayload } from '../ApiCalls/clinicApis';

describe('DT Appointment Payload Formatter', () => {
  test('formats DT appointment payload to match the expected JSON structure when created_by is provided', () => {
    const rawData = {
      organization_id: 1,
      clinic_id: 3,
      patient_id: 42,
      primary_doctor_id: 15,
      appointment_date: '2026-07-15',
      start_time: '09:00',
      end_time: '13:00',
      appointment_type: 'in_clinic',
      reason: 'Routine dialysis session',
      patient_ailments: [
        { id: 2, name: 'Chronic Kidney Disease' },
        { id: 5, name: 'Hypertension' }
      ],
      status: 'SCHEDULED',
      created_by: 7,
      unit_price: '1500',
      discount: '100',
      token_id: 'DT-001',
      isEmergency: false,
      referred_by: 'Dr. Smith',
      meet_link: null
    };

    const formatted = formatDtAppointmentPayload(rawData);

    expect(formatted).toEqual({
      organization_id: 1,
      clinic_id: 3,
      patient_id: 42,
      primary_doctor_id: 15,
      appointment_date: '2026-07-15',
      start_time: '09:00',
      end_time: '13:00',
      appointment_type: 'in_clinic',
      reason: 'Routine dialysis session',
      patient_ailments: [
        { id: 2, name: 'Chronic Kidney Disease' },
        { id: 5, name: 'Hypertension' }
      ],
      status: 'SCHEDULED',
      created_by: 7,
      unit_price: '1500',
      discount: '100',
      token_id: 'DT-001',
      isEmergency: false,
      referred_by: 'Dr. Smith',
      meet_link: null
    });
  });

  test('defaults created_by to null when not provided and not in localStorage to prevent FK constraint failures', () => {
    const rawData = {
      organization_id: 1,
      clinic_id: 3,
      patient_id: 42,
      primary_doctor_id: 15,
    };

    const formatted = formatDtAppointmentPayload(rawData);
    expect(formatted.created_by).toBeNull();
  });

  test('correctly parses comma-separated patient_ailments string into array of objects', () => {
    const rawData = {
      patient_ailments: 'Chronic Kidney Disease, Hypertension'
    };

    const formatted = formatDtAppointmentPayload(rawData);

    expect(formatted.patient_ailments).toEqual([
      { id: 1, name: 'Chronic Kidney Disease' },
      { id: 2, name: 'Hypertension' }
    ]);
  });
});
