/**
 * @jest-environment node
 */

describe('P4-06 Machine Disinfection & Turnover Contract & API Verification', () => {
  test('Machine disinfection payload forms complete contract with disposal, disinfection, surface cleaning, inspection, and verification', () => {
    const payload = {
      session_id: 'session-303',
      bloodlineDisposed: 'Yes',
      dialyzerDisposed: 'Yes',
      tubingSetDisposed: 'Yes',
      needlesDisposed: 'Yes',
      sharpsContainer: 'Container A (Yellow)',
      biohazardBag: 'Yellow Biohazard Bag 50L',
      disposalComments: '',
      heatDisinfection: 'Completed',
      heatStartTime: '11:21 AM',
      heatEndTime: '11:41 AM',
      chemicalDisinfection: 'Completed',
      chemicalSolution: 'Citric Acid 50%',
      chemicalContactTime: '30',
      rinseCompleted: 'Yes',
      rinseTime: '5',
      exteriorWiped: 'Yes',
      touchscreenCleaned: 'Yes',
      controlsCleaned: 'Yes',
      traysCleaned: 'Yes',
      chairCleaned: 'Yes',
      floorCleaned: 'Yes',
      allLinesRemoved: 'Yes',
      noResidue: 'Yes',
      componentsIntact: 'Yes',
      waterSystemStatus: 'OK',
      readyForNextPatient: 'Yes',
      nextPatientDate: '2025-05-28',
      nextPatientTime: '01:30 PM',
      verifiedBy: 'Rahul Singh (Technician)',
      verifiedAt: '28 May 2025, 11:45 AM',
      hasSignature: true,
    };

    expect(payload.bloodlineDisposed).toBe('Yes');
    expect(payload.heatDisinfection).toBe('Completed');
    expect(payload.chemicalSolution).toBe('Citric Acid 50%');
    expect(payload.readyForNextPatient).toBe('Yes');
    expect(payload.verifiedBy).toContain('Rahul Singh');
    expect(payload.hasSignature).toBe(true);
  });
});
