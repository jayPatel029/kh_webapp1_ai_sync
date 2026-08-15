import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

/**
 * @typedef {Object} DialysisSession
 * @property {number} id
 * @property {number} patient_id
 * @property {number} bed_id
 * @property {number|null} appointment_id
 * @property {string} state RUNNING | PAUSED | COMPLETED | ABORTED
 * @property {string} started_at
 * @property {string} updated_at
 */

/**
 * Start a new dialysis session
 * @param {Object} payload 
 * @param {number} payload.patient_id required
 * @param {number} payload.bed_id required
 * @param {number} [payload.appointment_id]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {session_id: number}}>}
 */
export async function startDialysisSession(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dialysis/sessions/start`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get dialysis session details
 * @param {string|number} sessionId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: DialysisSession}>}
 */
export async function getDialysisSessionById(sessionId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/dialysis/sessions/${sessionId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Submit pre-dialysis readings
 * @param {string|number} sessionId 
 * @param {Object} payload 
 * @param {number} [payload.weight_kg]
 * @param {number} [payload.systolic_bp_mm_hg]
 * @param {number} [payload.diastolic_bp_mm_hg]
 * @param {Object} [payload.labs]
 * @param {string} [payload.access_assessment]
 * @param {string} [payload.notes]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function submitSessionPreReadings(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dialysis/sessions/${sessionId}/pre-readings`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Submit telemetry/readings during session
 * @param {string|number} sessionId 
 * @param {Object} payload 
 * @param {string} [payload.timestamp]
 * @param {Object} [payload.reading] Single reading
 * @param {Object[]} [payload.readings] Bulk readings
 * @param {string} [payload.reading_json]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {reading_id?: number}}>}
 */
export async function submitSessionReadings(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dialysis/sessions/${sessionId}/readings`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Retrieve all telemetry readings for a session
 * @param {string|number} sessionId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getSessionReadings(sessionId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/dialysis/sessions/${sessionId}/readings`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update session notes and inventory items
 * @param {string|number} sessionId 
 * @param {Object} payload 
 * @param {string} [payload.preDialysisNotes]
 * @param {string} [payload.duringDialysisNotes]
 * @param {string} [payload.postDialysisNotes]
 * @param {Object[]} [payload.inventoryItemsUsed]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateSessionParameters(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.patch(`${server_url}/dt/dialysis/sessions/${sessionId}/parameters`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Change session lifecycle state
 * @param {string|number} sessionId 
 * @param {Object} payload 
 * @param {string} payload.action pause | resume | stop | abort
 * @param {string} [payload.reason]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: {state: string}}>}
 */
export async function submitSessionAction(sessionId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/dialysis/sessions/${sessionId}/actions`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getHemoDialysisParameters(pid) {
  try {
    const response = await axiosInstance.get(`${server_url}/questions/dialysisParameter/Hemo%20dialysis?user=${pid}`);
    return { success: true, data: response.data?.data || response.data || [] };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// Part 3 (During-Dialysis) API. These endpoints intentionally live beside the
// legacy telemetry API because the backend stores P3 records in separate tables.
async function p3Request(method, path, payload, config = {}) {
  try {
    const response = await axiosInstance[method](path, ...(payload === undefined ? [config] : [payload, config]));
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

const p3Path = (path) => `${server_url}/dt${path}`;

export const getDuringDialysisDashboard = (sessionId, config) =>
  p3Request('get', p3Path(`/sessions/${sessionId}/dashboard`), undefined, config);
export const createIntradialyticVitals = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/vitals-intradialytic`), payload, config);
export const getIntradialyticVitals = (sessionId, range = '2h', config) =>
  p3Request('get', p3Path(`/sessions/${sessionId}/vitals-intradialytic?range=${encodeURIComponent(range)}`), undefined, config);
export const getOverdueVitals = (technicianId, config) =>
  p3Request('get', p3Path(`/technicians/${technicianId}/overdue-vitals`), undefined, config);
export const skipOverdueVital = (logId, payload = {}, config) =>
  p3Request('post', p3Path(`/overdue-vitals/${logId}/skip`), payload, config);
export const skipAllOverdueVitals = (payload, config) =>
  p3Request('post', p3Path('/overdue-vitals/skip-all'), payload, config);
export const createMachineParameters = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/machine-parameters`), payload, config);
export const getMachineParameters = (sessionId, range = '2h', config) =>
  p3Request('get', p3Path(`/sessions/${sessionId}/machine-parameters?range=${encodeURIComponent(range)}`), undefined, config);
export const createSymptom = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/symptoms`), payload, config);
export const updateSymptom = (sessionId, symptomId, payload, config) =>
  p3Request('patch', p3Path(`/sessions/${sessionId}/symptoms/${symptomId}`), payload, config);
export const createVascularAccessMonitoring = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/vascular-access-monitoring`), payload, config);
export const createMedicationAdministration = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/medications`), payload, config);
export const getDueMedications = (sessionId, config) =>
  p3Request('get', p3Path(`/sessions/${sessionId}/medications/due`), undefined, config);
export const getPatientAllergies = (patientId, config) =>
  p3Request('get', p3Path(`/patients/${patientId}/allergies`), undefined, config);
export const createAlarm = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/alarms`), payload, config);
export const updateDuringDialysisAlarm = (sessionId, alarmId, payload, config) =>
  p3Request('patch', p3Path(`/sessions/${sessionId}/alarms/${alarmId}`), payload, config);
export const getDuringDialysisProgress = (sessionId, config) =>
  p3Request('get', p3Path(`/sessions/${sessionId}/progress`), undefined, config);
export const createTreatmentEvent = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/events`), payload, config);
export const createIncident = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/incidents`), payload, config);
export const getIncidents = (sessionId, config) =>
  p3Request('get', p3Path(`/sessions/${sessionId}/incidents`), undefined, config);
export const endDuringDialysisTreatment = (sessionId, payload, config) =>
  p3Request('post', p3Path(`/sessions/${sessionId}/end-treatment`), payload, config);

export default {
  startDialysisSession,
  getDialysisSessionById,
  submitSessionPreReadings,
  submitSessionReadings,
  getSessionReadings,
  updateSessionParameters,
  submitSessionAction,
  getHemoDialysisParameters,
  getDuringDialysisDashboard,
  createIntradialyticVitals,
  getIntradialyticVitals,
  getOverdueVitals,
  skipOverdueVital,
  skipAllOverdueVitals,
  createMachineParameters,
  getMachineParameters,
  createSymptom,
  updateSymptom,
  createVascularAccessMonitoring,
  createMedicationAdministration,
  getDueMedications,
  getPatientAllergies,
  createAlarm,
  updateDuringDialysisAlarm,
  getDuringDialysisProgress,
  createTreatmentEvent,
  createIncident,
  getIncidents,
  endDuringDialysisTreatment,
};
