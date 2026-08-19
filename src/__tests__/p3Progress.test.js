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

import { createTreatmentEvent, getDuringDialysisProgress } from '../ApiCalls/dialysisSessionApis';

describe('P3-08 Treatment Progress API Integration', () => {
  test('creates treatment event via POST /api/dt/sessions/:id/events', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          event_id: 'ev-333',
          comments: 'UF rate reduced',
          recorded_at: new Date().toISOString()
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const res = await createTreatmentEvent('123', { comments: 'UF rate reduced' });
    expect(res.success).toBe(true);
    expect(res.data.data.event_id).toBe('ev-333');
  });

  test('fetches session progress via GET /api/dt/sessions/:id/progress', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          uf_achieved: 1.65,
          blood_processed: 58.2,
          kt_v: 1.32
        }
      }
    };
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const res = await getDuringDialysisProgress('123');
    expect(res.success).toBe(true);
    expect(res.data.data.kt_v).toBe(1.32);
  });
});
