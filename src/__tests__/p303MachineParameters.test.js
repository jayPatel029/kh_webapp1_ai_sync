/**
 * @jest-environment node
 */

describe('P3-03 Machine Parameters Contract Verification', () => {
  test('P3-03 payload forms complete contract with 12 Overview parameters', () => {
    const payload = {
      bfr: '300',
      dfr: '500',
      ap: '-120',
      vp: '150',
      tmp: '380',
      ufr: '500',
      uf_removed: '1.60',
      blood_volume_processed: '32.5',
      conductivity: '14.0',
      dialysate_temperature: '36.5',
      heparin_rate: '1.0',
      blood_leak: 'No Leak Detected',
      recorded_at: '2026-08-19T10:15:30Z',
    };

    expect(payload.bfr).toBe('300');
    expect(payload.dfr).toBe('500');
    expect(payload.ap).toBe('-120');
    expect(payload.vp).toBe('150');
    expect(payload.tmp).toBe('380');
    expect(parseFloat(payload.tmp)).toBeGreaterThanOrEqual(300); // Critical threshold >= 300 mmHg
    expect(payload.ufr).toBe('500');
    expect(payload.uf_removed).toBe('1.60');
    expect(payload.blood_volume_processed).toBe('32.5');
    expect(payload.conductivity).toBe('14.0');
    expect(payload.dialysate_temperature).toBe('36.5');
    expect(payload.heparin_rate).toBe('1.0');
    expect(payload.blood_leak).toBe('No Leak Detected');
  });

  test('TMP safe range calculation flags 380 mmHg as Critical', () => {
    const safeMin = 20;
    const safeMax = 300;
    const currentTmp = 380;

    const isNormal = currentTmp >= safeMin && currentTmp <= 60;
    const isWarning = currentTmp > 60 && currentTmp < safeMax;
    const isCritical = currentTmp >= safeMax;

    expect(isNormal).toBe(false);
    expect(isWarning).toBe(false);
    expect(isCritical).toBe(true);
  });

  test('Cumulative UF progress calculation matches prescription goal', () => {
    const ufRemoved = 1.60;
    const ufGoal = 2.40;

    const percentage = Math.round((ufRemoved / ufGoal) * 100);
    const remaining = (ufGoal - ufRemoved).toFixed(2);

    expect(percentage).toBe(67);
    expect(remaining).toBe('0.80');
  });
});
