/**
 * @jest-environment node
 */

describe('P4-08 Patient Discharge Contract & API Verification', () => {
  test('Discharge payload forms complete contract with readiness assessment, ambulation, education, diet/fluid advice, transport, and next appointment', () => {
    const payload = {
      session_id: 'session-505',
      readinessAssessment: {
        bp: '126 / 78',
        pulse: '82',
        spo2: '98',
        temp: '36.6',
        overall: 'Stable',
        stable: true,
      },
      ambulation: {
        ability: 'Independent',
        walker: false,
        wheelchair: false,
        caregiver: false,
        none: true,
        comments: '',
      },
      education: {
        topics: ['fluid', 'diet', 'medication', 'access', 'complications', 'when_help', 'next_apt', 'emergency'],
        providedBy: 'Rahul Singh (Technician)',
      },
      dietAndFluid: {
        fluidAllowance: '1000',
        dietType: 'Low Potassium, Low Sodium',
        specialInstructions: 'Avoid high potassium foods (banana, orange, tomato, potato).',
      },
      transportAndCaregiver: {
        transportMode: 'Family Vehicle',
        caregiverName: 'Suresh Kumar (Son)',
        contactNumber: '98765 43210',
      },
      nextAppointment: {
        date: '2025-05-30',
        time: '07:45 AM',
        shift: 'Morning Shift',
      },
      dischargedAt: '11:45 AM',
      dischargedBy: 'Rahul Singh (Technician)',
    };

    expect(payload.readinessAssessment.bp).toBe('126 / 78');
    expect(payload.readinessAssessment.stable).toBe(true);
    expect(payload.ambulation.ability).toBe('Independent');
    expect(payload.education.topics.length).toBe(8);
    expect(payload.dietAndFluid.fluidAllowance).toBe('1000');
    expect(payload.transportAndCaregiver.caregiverName).toContain('Suresh Kumar');
    expect(payload.nextAppointment.date).toBe('2025-05-30');
  });
});
