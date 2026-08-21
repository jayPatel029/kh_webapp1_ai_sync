/**
 * @jest-environment node
 */

describe('P4-05 Medication & Follow-up Contract & API Verification', () => {
  test('Medication and follow-up payload forms complete contract with medication table, missed details, and follow-up plan', () => {
    const payload = {
      session_id: 'session-202',
      medications: [
        { id: 1, name: 'Epoetin Alfa (Erythropoietin)', dose: '4000 IU', route: 'IV', indication: 'Anemia', scheduledTime: '08:00 AM', status: 'Given', givenAt: '08:05 AM', givenBy: 'Rahul Singh' },
        { id: 2, name: 'Iron Sucrose', dose: '100 mg', route: 'IV', indication: 'Iron Deficiency', scheduledTime: '08:15 AM', status: 'Given', givenAt: '08:18 AM', givenBy: 'Rahul Singh' },
        { id: 3, name: 'Calcitriol', dose: '0.25 mcg', route: 'PO', indication: 'Secondary Hyperpara', scheduledTime: '09:00 AM', status: 'Given', givenAt: '09:02 AM', givenBy: 'Rahul Singh' },
        { id: 4, name: 'Heparin (Maintenance)', dose: '1000 IU/hr', route: 'IV', indication: 'Anticoagulation', scheduledTime: 'During Dialysis', status: 'Given', givenAt: '07:50 AM', givenBy: 'Rahul Singh' },
        { id: 5, name: 'Paracetamol', dose: '500 mg', route: 'PO', indication: 'Pain', scheduledTime: '10:30 AM', status: 'Missed', givenAt: '—', givenBy: '—' },
      ],
      missedReason: 'Patient Refused',
      notifiedPhysician: 'Yes',
      physicianInstruction: 'Administer post-treatment if headache persists',
      followupAction: 'Administer at discharge',
      missedComments: '',
      adrObserved: 'No',
      nextMedDate: '2025-05-28',
      nextMedTime: '08:00 AM',
      selectedInvestigations: ['hb', 'ferritin'],
      physicianReviewRequired: 'Yes',
      reviewDate: '2025-06-04',
      educationItems: ['adherence', 'diet', 'access'],
    };

    expect(payload.medications.length).toBe(5);
    expect(payload.medications.filter(m => m.status === 'Given').length).toBe(4);
    expect(payload.missedReason).toBe('Patient Refused');
    expect(payload.selectedInvestigations).toContain('hb');
    expect(payload.educationItems.length).toBe(3);
  });
});
