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

import { createSymptom, updateSymptom } from '../ApiCalls/dialysisSessionApis';

describe('P3-04 Patient Symptoms & Complications API Integration', () => {
  test('logs new intradialytic symptom via POST /api/dt/sessions/:id/symptoms', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          symptom_id: 'symp-999',
          symptom_type: 'Hypotension (Low BP)',
          severity: 'Moderate',
          status: 'Ongoing',
          intervention: 'UF Paused, 100 mL NS given'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      event_time: '10:15 AM',
      symptom_type: 'Hypotension (Low BP)',
      severity: 'Moderate',
      status: 'Ongoing',
      intervention: 'UF Paused, 100 mL NS given'
    };

    const res = await createSymptom('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.symptom_id).toBe('symp-999');
    expect(res.data.data.severity).toBe('Moderate');
  });

  test('updates symptom status via PATCH /api/dt/sessions/:id/symptoms/:symptomId', async () => {
    const mockPatchResponse = {
      data: {
        success: true,
        data: {
          symptom_id: 'symp-999',
          status: 'Resolved'
        }
      }
    };
    axiosInstance.patch.mockResolvedValueOnce(mockPatchResponse);

    const res = await updateSymptom('123', 'symp-999', { status: 'Resolved' });
    expect(res.success).toBe(true);
    expect(res.data.data.status).toBe('Resolved');
  });
});
