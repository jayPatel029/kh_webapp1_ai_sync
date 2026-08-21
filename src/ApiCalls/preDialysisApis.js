/**
 * Pre-Dialysis (Part 2, P2-01 to P2-12) API Module
 *
 * Implements all frontend API calls as specified in:
 * docs/dialysis_docs/2026-07-26-dt-predialysis-backend-guidenotes.md
 */

import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

// Helper for normalizing API response envelope and ApiError shape
function handleResponse(response) {
  return {
    success: true,
    data: response.data?.data !== undefined ? response.data.data : response.data,
    message: response.data?.message,
    status: response.status,
  };
}

function handleError(error) {
  const status = error.response?.status || 500;
  const data = error.response?.data || {};
  return {
    success: false,
    status,
    error_code: data.error_code || 'ERR_NETWORK',
    message: data.message || error.message || 'An error occurred',
    details: data.details || null,
  };
}

// ---------------------------------------------------------------------------
// Queue / Dashboard / Patient Summary (P2-01, P2-02, P2-03)
// ---------------------------------------------------------------------------

/**
 * P2-01: GET /api/dt/sessions/today
 */
export async function getTodaySessions(params = {}, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/sessions/today`, {
      params,
      ...config,
    });
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-01: POST /api/dt/sessions/:id/mark-emergency
 */
export async function markSessionEmergency(sessionId, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/mark-emergency`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-02: GET /api/dt/patients/:id
 */
export async function getPatientDetails(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/patients/${patientId}`, config);
    return handleResponse(response);
  } catch (err) {
    try {
      const response2 = await axiosInstance.get(`${server_url}/dt/patient/${patientId}`, config);
      return handleResponse(response2);
    } catch (_) {
      return handleError(err);
    }
  }
}

/**
 * P2-02: GET /api/dt/patients/:id/prescriptions/latest
 */
export async function getPatientLatestPrescription(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/patients/${patientId}/prescriptions/latest`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-02: GET /api/dt/patients/:id/vitals/latest
 */
export async function getPatientLatestVitals(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/patients/${patientId}/vitals/latest`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-02: GET /api/dt/patients/:id/labs/latest
 */
export async function getPatientLatestLabs(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/patients/${patientId}/labs/latest`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-02: GET /api/dt/patients/:id/alerts
 */
export async function getPatientAlerts(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/patients/${patientId}/alerts`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-02: GET /api/dt/patients/:id/notes
 */
export async function getPatientNotes(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/patients/${patientId}/notes`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-02: POST /api/dt/patients/:id/proceed-predialysis
 */
export async function proceedPatientToPredialysis(patientId, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/patients/${patientId}/proceed-predialysis`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-03: GET /api/dt/sessions/:id/predialysis-status
 */
export async function getPredialysisStatus(sessionId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/sessions/${sessionId}/predialysis-status`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-03: POST /api/dt/sessions/:id/print-summary
 */
export async function printSessionSummary(sessionId, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/print-summary`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

// ---------------------------------------------------------------------------
// Clinical & Safety Entry Screens (P2-04 through P2-12)
// ---------------------------------------------------------------------------

/**
 * P2-04: POST /api/dt/sessions/:id/verification
 */
export async function submitSessionVerification(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/verification`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-04: GET /api/dt/patients/:id/dialyzer-status
 */
export async function getPatientDialyzerStatus(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/patients/${patientId}/dialyzer-status`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-04: POST /api/dt/sessions/:id/consumables
 */
export async function submitSessionConsumables(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/consumables`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-05: POST /api/dt/sessions/:id/vitals
 */
export async function submitSessionVitals(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/vitals`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-06: POST /api/dt/sessions/:id/assessment
 */
export async function submitSessionAssessment(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/assessment`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-07: POST /api/dt/sessions/:id/vascular-access
 */
export async function submitVascularAccess(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/vascular-access`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-08: GET /api/dt/machines/:id/qc/today
 */
export async function getMachineQcToday(machineId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/machines/${machineId}/qc/today`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-08: GET /api/dt/machines/:id/self-test/today
 */
export async function getMachineSelfTestToday(machineId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/machines/${machineId}/self-test/today`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-08: POST /api/dt/sessions/:id/machine-safety/review
 */
export async function reviewMachineSafety(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/machine-safety/review`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-09: GET /api/dt/ro-plants/:id/shift-check/current
 */
export async function getRoPlantShiftCheck(roPlantId, shiftId = 1, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/ro-plants/${roPlantId}/shift-check/current`,
      { params: { shift_id: shiftId }, ...config }
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-09: GET /api/dt/ro-plants/:id/verification/today
 */
export async function getRoPlantVerificationToday(roPlantId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/dt/ro-plants/${roPlantId}/verification/today`,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-09: POST /api/dt/sessions/:id/water-safety/review
 */
export async function reviewWaterSafety(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/water-safety/review`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-10: POST /api/dt/sessions/:id/infection-control
 */
export async function submitInfectionControl(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/infection-control`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-11: POST /api/dt/sessions/:id/validate
 */
export async function validateSafetyChecklist(sessionId, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/validate`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-12: POST /api/dt/sessions/:id/start
 */
export async function startDialysis(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/start`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * P2-12: POST /api/dt/sessions/:id/start/unlock
 */
export async function unlockStartDialysis(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/sessions/${sessionId}/start/unlock`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Logout digest: POST /api/dt/predialysis/logout-digest
 */
export async function sendLogoutDigest(payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/predialysis/logout-digest`,
      payload,
      config
    );
    return handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
}

export default {
  getTodaySessions,
  markSessionEmergency,
  getPatientDetails,
  getPatientLatestPrescription,
  getPatientLatestVitals,
  getPatientLatestLabs,
  getPatientAlerts,
  getPatientNotes,
  proceedPatientToPredialysis,
  getPredialysisStatus,
  printSessionSummary,
  submitSessionVerification,
  getPatientDialyzerStatus,
  submitSessionConsumables,
  submitSessionVitals,
  submitSessionAssessment,
  submitVascularAccess,
  getMachineQcToday,
  getMachineSelfTestToday,
  reviewMachineSafety,
  getRoPlantShiftCheck,
  getRoPlantVerificationToday,
  reviewWaterSafety,
  submitInfectionControl,
  validateSafetyChecklist,
  startDialysis,
  unlockStartDialysis,
  sendLogoutDigest,
};
