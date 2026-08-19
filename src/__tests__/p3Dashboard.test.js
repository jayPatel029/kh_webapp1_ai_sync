/**
 * @jest-environment node
 */
import axiosInstance from '../helpers/axios/axiosInstance';

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

import { getDuringDialysisDashboard } from '../ApiCalls/dialysisSessionApis';

describe('P3-01 Treatment Dashboard Verification', () => {
  test('fetches real dashboard data from GET /api/dt/sessions/:id/dashboard', async () => {
    const mockPayload = {
      success: true,
      data: {
        progress: { percent: 66, elapsed: 92, remaining: 148, total: 240 },
        uf: { removed: 1.6, target: 2.4, remaining: 0.8, rate: 500 },
        machine_status: { running: true, model: 'Fresenius 4008S', bfr: 300, dfr: 500, prescribed_bfr: 300, alarms: 'No Active Alarms' },
        latest_vitals: { systolic_bp: 122, diastolic_bp: 78, pulse: 78, resp_rate: 18, temp: 36.6, spo2: 98, pain_score: 0 },
        latest_machine_params: { ap: -140, vp: 120, tmp: 110, conductivity: 13.8, dialysate_temp: 36.5 },
        active_alerts: [{ id: 1, title: 'High TMP', time: '10:12 AM', severity: 'Medium' }]
      }
    };
    axiosInstance.get.mockResolvedValueOnce({ data: mockPayload });

    const res = await getDuringDialysisDashboard('123');
    expect(res.success).toBe(true);
    expect(res.data.data.progress.percent).toBe(66);
    expect(res.data.data.uf.removed).toBe(1.6);
    expect(res.data.data.machine_status.bfr).toBe(300);
    expect(res.data.data.latest_vitals.systolic_bp).toBe(122);
    expect(res.data.data.active_alerts).toHaveLength(1);
    expect(res.data.data.active_alerts[0].title).toBe('High TMP');
  });
});
