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

import { createIncident, getIncidents } from '../ApiCalls/dialysisSessionApis';

describe('P3-09 Incident & Event Reporting API Integration', () => {
  test('creates new incident report via POST /api/dt/sessions/:id/incidents', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          incident_id: 'inc-707',
          incident_type: 'Hypotension',
          severity: 'Moderate',
          outcome: 'Stabilized'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      incident_type: 'Hypotension',
      description: 'Patient developed hypotension',
      intervention: 'UF rate reduced'
    };

    const res = await createIncident('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.incident_id).toBe('inc-707');
  });

  test('fetches session incidents list via GET /api/dt/sessions/:id/incidents', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [
          { incident_id: 'inc-707', incident_type: 'Hypotension', severity: 'Moderate' }
        ]
      }
    };
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const res = await getIncidents('123');
    expect(res.success).toBe(true);
    expect(res.data.data.length).toBe(1);
  });
});
