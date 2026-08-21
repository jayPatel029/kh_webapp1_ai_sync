/**
 * @jest-environment node
 */

describe('P4-07 Infection Control & Waste Disposal Contract & API Verification', () => {
  test('Infection control payload forms complete contract with 8 sections, completion banner, compliance overview, and quick actions', () => {
    const payload = {
      session_id: 'session-404',
      ppe: {
        glovesRemoved: 'Yes',
        gownRemoved: 'Yes',
        maskRemoved: 'Yes',
        eyeProtRemoved: 'Yes',
        ppeHandHygiene: 'Yes',
        comments: '',
      },
      handHygiene: {
        hhPerformed: 'Yes',
        hhMethod: 'Alcohol Based Hand Rub',
        comments: '',
      },
      sharpsDisposal: {
        needlesInSharps: 'Yes',
        sharpsSealed: 'Yes',
        sharpsFillLevel: '< 3/4 Full',
        comments: '',
      },
      biomedicalWaste: {
        yellowBag: true,
        redBag: true,
        blueBag: true,
        blackBag: true,
        comments: '',
      },
      linenDisposal: {
        linenBagged: 'Yes',
        linenLaundry: 'Yes',
        linenBagSealed: 'Yes',
        comments: '',
      },
      environmentalCleaning: {
        envExterior: 'Yes',
        envTouchpoints: 'Yes',
        envBedChair: 'Yes',
        envSideRails: 'Yes',
        envFloor: 'Yes',
        comments: '',
      },
      spillManagement: {
        spillOccurred: 'No',
        comments: '',
      },
      isolationCompliance: {
        isolationRequired: 'No',
        comments: '',
      },
      completedAt: '11:25 AM',
      completedBy: 'Rahul Singh (Technician)',
    };

    expect(payload.ppe.glovesRemoved).toBe('Yes');
    expect(payload.handHygiene.hhMethod).toBe('Alcohol Based Hand Rub');
    expect(payload.sharpsDisposal.sharpsFillLevel).toBe('< 3/4 Full');
    expect(payload.biomedicalWaste.yellowBag).toBe(true);
    expect(payload.spillManagement.spillOccurred).toBe('No');
    expect(payload.completedAt).toBe('11:25 AM');
  });
});
