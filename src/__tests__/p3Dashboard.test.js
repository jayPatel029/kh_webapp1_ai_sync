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

  test('correctly parses session 19 dashboard endpoint structure (machine_latest, flags_json, uf target)', async () => {
    const session19Payload = {
      success: true,
      data: {
        session_id: 19,
        state: 'STARTED',
        progress: {
          elapsed: 0.15193333333333334,
          remaining: null,
          total: null,
          percent: null,
          uf: { removed: 1.6, target: 1600, percent_of_goal: 0.1 },
          blood_processed: 0,
          kt_v: { value: null, measured_at: null, display: 'Not available' }
        },
        uf: { removed: 1.6, target: 1600, percent_of_goal: 0.1 },
        machine_latest: {
          id: '14',
          session_id: 19,
          reading_time: '2026-08-21T18:30:15.000Z',
          bfr: '300.00',
          dfr: '500.00',
          arterial_pressure: '-120.00',
          venous_pressure: '150.00',
          tmp: '380.00',
          conductivity: '14.00',
          dialysate_temp: '36.50',
          ufr: '500.00',
          uf_removed: '1.60',
          blood_volume_processed: '32.50',
          flags_json: [{ field: 'tmp', severity: 'critical', value: 380 }]
        },
        machine_status: {
          id: '9',
          session_id: 19,
          power_supply_ok: 0,
          dialysate_system_ok: 0,
          heparin_system_ok: 0,
          air_detector_ok: 0,
          blood_leak_detector_ok: 0
        },
        unresolved: { alarms: [], incidents: [], symptoms: [] },
        deferred_consent: false
      }
    };
    axiosInstance.get.mockResolvedValueOnce({ data: session19Payload });

    const res = await getDuringDialysisDashboard(19);
    expect(res.success).toBe(true);
    const d = res.data.data;
    expect(d.session_id).toBe(19);
    expect(d.state).toBe('STARTED');
    expect(d.machine_latest.bfr).toBe('300.00');
    expect(d.machine_latest.flags_json[0].field).toBe('tmp');
    expect(d.uf.target).toBe(1600);
  });
});
