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

import { createAlarm, updateDuringDialysisAlarm } from '../ApiCalls/dialysisSessionApis';

describe('P3-07 Alarm Management API Integration', () => {
  test('creates new alarm record via POST /api/dt/sessions/:id/alarms', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          alarm_id: 'alarm-888',
          alarm_type: 'High Venous Pressure',
          resolution_status: 'Resolved'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      alarm_type: 'High Venous Pressure',
      action_taken: 'Reduced BFR',
      resolved_by: 'Rahul Singh'
    };

    const res = await createAlarm('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.alarm_id).toBe('alarm-888');
  });

  test('updates alarm resolution status via PATCH /api/dt/sessions/:id/alarms/:alarmId', async () => {
    const mockPatchResponse = {
      data: {
        success: true,
        data: {
          alarm_id: 'alarm-888',
          resolution_status: 'Resolved'
        }
      }
    };
    axiosInstance.patch.mockResolvedValueOnce(mockPatchResponse);

    const res = await updateDuringDialysisAlarm('123', 'alarm-888', { resolution_status: 'Resolved' });
    expect(res.success).toBe(true);
    expect(res.data.data.resolution_status).toBe('Resolved');
  });
});
