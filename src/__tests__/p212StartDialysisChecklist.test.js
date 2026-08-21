/**
 * @jest-environment node
 */

jest.mock('../helpers/axios/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import {
  getPredialysisStatus,
  getPatientDetails,
  getPatientLatestVitals,
} from '../ApiCalls/preDialysisApis';
import axiosInstance from '../helpers/axios/axiosInstance';

describe('P2-12 Start Dialysis Checklist Summary API Wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches predialysis status for given session ID via API', async () => {
    const mockStatusData = {
      sessionId: 42,
      steps: {
        verification: 'COMPLETE',
        vitals: 'COMPLETE',
        assessment: 'COMPLETE',
        access: 'COMPLETE',
        machine: 'COMPLETE',
        water: 'COMPLETE',
        infection: 'COMPLETE',
        validation: 'COMPLETE',
      },
    };

    axiosInstance.get.mockResolvedValueOnce({
      status: 200,
      data: { success: true, data: mockStatusData },
    });

    const result = await getPredialysisStatus(42);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('/dt/sessions/42/predialysis-status'),
      expect.anything()
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockStatusData);
  });

  it('fetches patient details and latest vitals for checklist summary details', async () => {
    const mockPatient = {
      id: 101,
      name: 'Anil Gupta',
      vascular_access: 'AV Fistula (Right)',
      attending_technician: 'Sanjay Verma',
    };

    const mockVitals = {
      bp: '124/80',
      pulse: '76',
      weight_pre: '70.2',
    };

    axiosInstance.get
      .mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: mockPatient },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: mockVitals },
      });

    const patientRes = await getPatientDetails(101);
    const vitalsRes = await getPatientLatestVitals(101);

    expect(patientRes.success).toBe(true);
    expect(patientRes.data.name).toBe('Anil Gupta');

    expect(vitalsRes.success).toBe(true);
    expect(vitalsRes.data.bp).toBe('124/80');
  });
});
