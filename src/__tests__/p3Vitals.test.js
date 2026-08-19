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

import { createIntradialyticVitals, getIntradialyticVitals } from '../ApiCalls/dialysisSessionApis';

describe('P3-02 Live Vitals Monitoring API Integration', () => {
  test('creates new intradialytic vitals reading via POST /api/dt/sessions/:id/vitals-intradialytic', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: 'vital-99',
          observation_time: '10:00 AM',
          bp_systolic: 122,
          bp_diastolic: 78,
          pulse: 78,
          resp_rate: 18,
          temperature: 36.6,
          spo2: 98,
          pain_score: 0,
          consciousness: 'Alert',
          symptoms_ref: 'None',
          recorded_by: 'Rahul Singh'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      observation_time: '10:00 AM',
      bp_systolic: 122,
      bp_diastolic: 78,
      pulse: 78,
      resp_rate: 18,
      temperature: 36.6,
      spo2: 98,
      pain_score: 0,
      consciousness: 'Alert',
      symptoms_ref: 'None',
      recorded_by: 'Rahul Singh'
    };

    const res = await createIntradialyticVitals('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.bp_systolic).toBe(122);
    expect(res.data.data.consciousness).toBe('Alert');
  });

  test('fetches intradialytic vitals 2h history via GET /api/dt/sessions/:id/vitals-intradialytic?range=2h', async () => {
    const mockHistory = {
      data: {
        success: true,
        data: [
          { observation_time: '08:00 AM', bp_systolic: 124, bp_diastolic: 80, pulse: 82, resp_rate: 18, temperature: 36.5, spo2: 97, pain_score: 1, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
          { observation_time: '08:30 AM', bp_systolic: 120, bp_diastolic: 76, pulse: 80, resp_rate: 18, temperature: 36.5, spo2: 97, pain_score: 1, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
          { observation_time: '09:00 AM', bp_systolic: 118, bp_diastolic: 74, pulse: 76, resp_rate: 18, temperature: 36.6, spo2: 98, pain_score: 1, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
          { observation_time: '09:30 AM', bp_systolic: 126, bp_diastolic: 78, pulse: 79, resp_rate: 18, temperature: 36.5, spo2: 98, pain_score: 0, consciousness: 'Alert', recorded_by: 'Rahul Singh' },
          { observation_time: '10:00 AM', bp_systolic: 122, bp_diastolic: 78, pulse: 78, resp_rate: 18, temperature: 36.6, spo2: 98, pain_score: 0, consciousness: 'Alert', recorded_by: 'Rahul Singh' }
        ]
      }
    };
    axiosInstance.get.mockResolvedValueOnce(mockHistory);

    const res = await getIntradialyticVitals('123', '2h');
    expect(res.success).toBe(true);
    expect(res.data.data).toHaveLength(5);
    expect(res.data.data[4].bp_systolic).toBe(122);
  });
});
