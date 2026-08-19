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

import { endDuringDialysisTreatment } from '../ApiCalls/dialysisSessionApis';

describe('P3-10 Treatment Completion API Integration', () => {
  test('finalizes dialysis treatment via POST /api/dt/sessions/:id/end-treatment', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          session_id: '123',
          state: 'COMPLETED',
          disposition: 'Discharged'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      confirmed: true,
      disposition: 'Discharged',
      discharge_time: '11:25 AM',
      discharged_by: 'Rahul Singh'
    };

    const res = await endDuringDialysisTreatment('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.state).toBe('COMPLETED');
    expect(res.data.data.disposition).toBe('Discharged');
  });
});
