/**
 * Bed Management API Helpers
 * @file src/ApiCalls/bedManagementApis.js
 *
 * Handles all bed management operations including:
 * - Fetching bed data
 * - Assigning/unassigning patients to beds
 * - Quarantine bed management
 * - Bed status tracking
 */

import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

/**
 * Fetch all beds with their current status
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getAllBeds(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/beds/all`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Fetch beds filtered by status
 * @param {string} status - OCCUPIED, EMPTY, or QUARANTINE
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getBedsByStatus(status, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/beds/status/${status}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Fetch bed details by ID
 * @param {string|number} bedId - Bed ID
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getBedById(bedId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/beds/${bedId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Assign a patient to a bed
 * @param {Object} payload - {bed_id, patient_id, assignment_notes}
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function assignPatientToBed(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/beds/assign`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Unassign a patient from a bed
 * @param {Object} payload - {bed_id, patient_id}
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function unassignPatientFromBed(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/beds/unassign`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Mark a bed as quarantine
 * @param {string|number} bedId - Bed ID
 * @param {Object} payload - {reason, quarantine_status (true/false), estimated_duration}
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function setQuarantineBed(bedId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/beds/${bedId}/quarantine`,
      payload,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get patient isolation status
 * @param {string|number} patientId - Patient ID
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getPatientIsolationStatus(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/patients/${patientId}/isolation-status`,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get bed assignments for a date range
 * @param {Object} payload - {start_date, end_date}
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getBedAssignmentsByDateRange(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/beds/assignments/date-range`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get patient details (for bed assignment)
 * @param {string|number} patientId - Patient ID
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getPatientDetails(patientId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/patient/getPatient/${patientId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update bed status
 * @param {string|number} bedId - Bed ID
 * @param {Object} payload - {status, notes}
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateBedStatus(bedId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/beds/${bedId}/status`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Transfer a patient from one bed to another
 * @param {Object} payload - {from_bed_id, to_bed_id, patient_id, requested_by}
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function transferPatientBed(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/beds/transfer`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export default {
  getAllBeds,
  getBedsByStatus,
  getBedById,
  assignPatientToBed,
  unassignPatientFromBed,
  setQuarantineBed,
  getPatientIsolationStatus,
  getBedAssignmentsByDateRange,
  getPatientDetails,
  updateBedStatus,
  transferPatientBed,
};
