// Demo patient data used for local UI preview / demo
export const demoPatient = {
  id: 'demo-patient-1',
  name: 'Demo Patient',
  program: 'Standard',
  immunizations: [
    {
      id: 'demo-imm-1',
      vaccine: 'Influenza',
      date: '2025-10-01T09:00:00.000Z',
      notes: 'Annual flu shot',
      administeredBy: 'Dr. Smith',
      verifiedBy: {
        doctor: { value: true, by: 'Dr. Smith', at: '2025-10-02T10:00:00.000Z' },
        patient: { value: false, by: null, at: null },
        dt: { value: false, by: null, at: null },
      },
    },
    {
      id: 'demo-imm-2',
      vaccine: 'Hepatitis B',
      date: '2023-03-15T11:30:00.000Z',
      notes: 'Dose 1 of 3',
      administeredBy: 'Dr. Adams',
      verifiedBy: {
        doctor: { value: true, by: 'Dr. Adams', at: '2023-03-16T08:15:00.000Z' },
        patient: { value: true, by: 'Demo Patient', at: '2023-03-16T09:00:00.000Z' },
        dt: { value: false, by: null, at: null },
      },
    },
    {
      id: 'demo-imm-3',
      vaccine: 'Influenza',
      date: '2024-10-05T10:00:00.000Z',
      notes: 'Last year',
      administeredBy: 'Dr. Lee',
      verifiedBy: {
        doctor: { value: false, by: null, at: null },
        patient: { value: true, by: 'Demo Patient', at: '2024-10-06T09:00:00.000Z' },
        dt: { value: false, by: null, at: null },
      },
    },
  ],
};

export default demoPatient;
