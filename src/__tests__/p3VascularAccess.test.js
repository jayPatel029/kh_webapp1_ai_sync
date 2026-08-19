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

import { createVascularAccessMonitoring } from '../ApiCalls/dialysisSessionApis';

describe('P3-05 Vascular Access Monitoring API Integration', () => {
  test('creates new vascular access assessment via POST /api/dt/sessions/:id/vascular-access-monitoring', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          access_id: 'access-101',
          access_type: 'AV Fistula (AVF)',
          overall_status: 'Good / Functional',
          recorded_by: 'Rahul Singh'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      access_type: 'AV Fistula (AVF)',
      overall_status: 'Good / Functional',
      recorded_by: 'Rahul Singh'
    };

    const res = await createVascularAccessMonitoring('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.overall_status).toBe('Good / Functional');
  });
});
