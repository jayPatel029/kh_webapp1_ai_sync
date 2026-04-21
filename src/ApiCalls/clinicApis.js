import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

/**
 * @typedef {Object} Clinic
 * @property {number} id
 * @property {string} name
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Appointment
 * @property {number} id
 * @property {number} clinic_id
 * @property {number} patient_id
 * @property {string} appointment_date
 * @property {string} start_time
 * @property {string} end_time
 * @property {string} status
 * @property {string} reason
 * @property {string} patient_ailments
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Shift
 * @property {number} id
 * @property {number} clinic_id
 * @property {string} name
 * @property {string} start_time
 * @property {string} end_time
 * @property {string} created_at
 * @property {string} updated_at
 */

// --- Clinics ---

/**
 * Get all clinics
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Clinic[]}>}
 */
export async function getClinics(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/clinics`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get clinic by ID
 * @param {string|number} clinicId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Clinic}>}
 */
export async function getClinicById(clinicId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/clinics/${clinicId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get clinic beds
 * @param {string|number} clinicId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getClinicBeds(clinicId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/clinics/${clinicId}/beds`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get appointments belonging to one clinic
 * @param {string|number} clinicId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Appointment[]}>}
 */
export async function getClinicAppointments(clinicId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/clinics/${clinicId}/appointments`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Appointments ---

/**
 * Find available dialysis slots
 * @param {string|number} clinicId - Required clinic ID
 * @param {string} from - ISO datetime string
 * @param {string} to - ISO datetime string
 * @param {Object} config - Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getAvailableSlots(clinicId, from, to, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/slots`, {
      ...config,
      params: { ...config.params, clinicId, from, to }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get all appointments
 * @param {Object} params - Query params (from, to, patientId, page, limit)
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getAppointments(params = {}, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/appointments`, {
      ...config,
      params: { ...config.params, ...params }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Create a new appointment
 * @param {Object} payload 
 * @param {number} payload.clinicId required unless slotId infers clinic
 * @param {number} payload.patientId required
 * @param {string} [payload.patientName]
 * @param {string} payload.startUTC ISO datetime
 * @param {string} payload.endUTC ISO datetime
 * @param {string} [payload.bookingType] 'online' or 'offline'
 * @param {number} [payload.amountDue]
 * @param {Object} [payload.immediatePayment]
 * @param {number} [payload.slotId]
 * @param {Object} [payload.metadata]
 * @param {Object} config Axios config. Header 'Idempotency-Key' is required.
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function createAppointment(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/appointments`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get appointment by ID
 * @param {string|number} appointmentId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Appointment}>}
 */
export async function getAppointmentById(appointmentId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/appointments/${appointmentId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update an appointment
 * @param {string|number} appointmentId 
 * @param {Object} payload 
 * @param {string} [payload.status]
 * @param {string} [payload.reason]
 * @param {string} [payload.patient_ailments]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateAppointment(appointmentId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/appointments/${appointmentId}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Cancel / delete an appointment
 * @param {string|number} appointmentId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function deleteAppointment(appointmentId, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/dt/appointments/${appointmentId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get appointment detail (including relations)
 * @param {string|number} appointmentId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Appointment}>}
 */
export async function getAppointmentDetails(appointmentId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/appointments/${appointmentId}/details`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Add payment to an appointment
 * @param {string|number} appointmentId 
 * @param {Object} payload 
 * @param {number} payload.amount required
 * @param {string} payload.method required
 * @param {string} [payload.currency] defaults to 'INR'
 * @param {string} [payload.receiptUrl]
 * @param {Object} config Axios config. Header 'Idempotency-Key' is required.
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function addAppointmentPayment(appointmentId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/appointments/${appointmentId}/payments`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Cancel an appointment
 * @param {string|number} appointmentId 
 * @param {Object} payload 
 * @param {string} [payload.reason]
 * @param {number} [payload.refundAmount]
 * @param {string} [payload.refundUrl]
 * @param {Object} config Axios config. Header 'Idempotency-Key' is required.
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function cancelAppointment(appointmentId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/appointments/${appointmentId}/cancel`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Retrieve invoice for an appointment
 * @param {string|number} appointmentId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getAppointmentInvoice(appointmentId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/appointments/${appointmentId}/invoice`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Regenerate invoice
 * @param {string|number} invoiceId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function regenerateInvoice(invoiceId, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/invoices/${invoiceId}/generate`, {}, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Shifts and Staff ---

/**
 * Get all shifts
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Shift[]}>}
 */
export async function getShifts(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/shifts`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Create a new shift
 * @param {Object} payload 
 * @param {number} payload.clinic_id required
 * @param {string} payload.shift_name (or name) required
 * @param {string} payload.time_start (or start_time) required
 * @param {string} payload.time_end (or end_time) required
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any, shift_id?: number}>}
 */
export async function createShift(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/shifts`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get shift by ID
 * @param {string|number} shiftId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: Shift}>}
 */
export async function getShiftById(shiftId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/shifts/${shiftId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Assign staff member to a shift
 * @param {string|number} staffId 
 * @param {Object} payload 
 * @param {number} payload.shift_id required
 * @param {number} [payload.center_id]
 * @param {string} [payload.start_date]
 * @param {string} [payload.end_date]
 * @param {boolean} [payload.on_duty]
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any, assignment_id?: number}>}
 */
export async function assignStaffToShift(staffId, payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/staff/${staffId}/assign-shift`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get all assignments for a staff member
 * @param {string|number} staffId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getStaffSchedule(staffId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/staff/${staffId}/schedule`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export default {
  getClinics,
  getClinicById,
  getClinicBeds,
  getClinicAppointments,
  getAvailableSlots,
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentDetails,
  addAppointmentPayment,
  cancelAppointment,
  getAppointmentInvoice,
  regenerateInvoice,
  getShifts,
  createShift,
  getShiftById,
  assignStaffToShift,
  getStaffSchedule,
};
