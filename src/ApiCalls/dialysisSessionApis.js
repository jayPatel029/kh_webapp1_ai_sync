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

export default {
  startDialysisSession,
  getDialysisSessionById,
  submitSessionPreReadings,
  submitSessionReadings,
  getSessionReadings,
  updateSessionParameters,
  submitSessionAction,
  getHemoDialysisParameters,
};
