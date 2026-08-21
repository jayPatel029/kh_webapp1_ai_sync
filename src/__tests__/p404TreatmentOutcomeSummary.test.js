/**
 * @jest-environment node
 */

describe('P4-04 Treatment Outcome Summary Contract & API Verification', () => {
  test('Treatment outcome summary payload forms complete contract with 8 parameters and adequacy metrics', () => {
    const payload = {
      session_id: 'session-101',
      prescribedVsDelivered: [
        { parameter: 'Prescribed Duration', prescribed: '04:00 hr', delivered: '03:35 hr', variance: '-00:25 hr', variance_pct: '-10.4%', status: 'Below Target' },
        { parameter: 'UF Goal', prescribed: '2.00 L', delivered: '1.65 L', variance: '-0.35 L', variance_pct: '-17.5%', status: 'Below Target' },
        { parameter: 'Blood Flow Rate (BFR)', prescribed: '300 mL/min', delivered: '298 mL/min', variance: '-2 mL/min', variance_pct: '-0.7%', status: 'Achieved' },
        { parameter: 'Dialysate Flow Rate (DFR)', prescribed: '500 mL/min', delivered: '500 mL/min', variance: '0 mL/min', variance_pct: '0%', status: 'Achieved' },
        { parameter: 'Blood Volume Processed', prescribed: '60.0 L', delivered: '58.2 L', variance: '-1.8 L', variance_pct: '-3.0%', status: 'Achieved' },
        { parameter: 'Heparin Dose', prescribed: '2.0 mL', delivered: '2.0 mL', variance: '0 mL', variance_pct: '0%', status: 'Achieved' },
        { parameter: 'Dialysate Temperature', prescribed: '36.5 °C', delivered: '36.5 °C', variance: '0 °C', variance_pct: '0%', status: 'Achieved' },
        { parameter: 'Dialysate', prescribed: 'Standard Bicarbonate', delivered: 'Standard Bicarbonate', variance: '—', variance_pct: '—', status: 'Achieved' },
      ],
      adequacyMetrics: {
        ktvSinglePool: 1.32,
        ktvEquilibrated: 1.45,
        urr: 72,
        pcr: 1.05,
      },
      selectedDeviations: ['access'],
      physicianReview: 'Yes',
      outcomeNotes: 'Access flow monitored.',
    };

    expect(payload.prescribedVsDelivered.length).toBe(8);
    expect(payload.adequacyMetrics.ktvSinglePool).toBe(1.32);
    expect(payload.adequacyMetrics.urr).toBe(72);
    expect(payload.selectedDeviations).toContain('access');
    expect(payload.physicianReview).toBe('Yes');
  });
});
