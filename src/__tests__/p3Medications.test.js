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

import { createMedicationAdministration, getDueMedications } from '../ApiCalls/dialysisSessionApis';

describe('P3-06 Medication Administration API Integration', () => {
  test('creates medication administration via POST /api/dt/sessions/:id/medications', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          medication_id: 'med-555',
          medication: 'Heparin (Loading Dose)',
          dose: '1,000 Units',
          route: 'IV'
        }
      }
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    const payload = {
      medication: 'Heparin (Loading Dose)',
      dose: '1000',
      unit: 'Units',
      route: 'IV'
    };

    const res = await createMedicationAdministration('123', payload);
    expect(res.success).toBe(true);
    expect(res.data.data.medication_id).toBe('med-555');
  });

  test('fetches due medications via GET /api/dt/sessions/:id/medications/due', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [
          { name: 'Heparin', due_time: '10:30 AM' }
        ]
      }
    };
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const res = await getDueMedications('123');
    expect(res.success).toBe(true);
    expect(res.data.data.length).toBe(1);
  });
});
