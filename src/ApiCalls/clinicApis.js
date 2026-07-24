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
 * @property {string|number} id
 * @property {string|number} [invoiceId]
 * @property {number} [clinicId]
 * @property {number} [patientId]
 * @property {string} [patientName]
 * @property {string} [startUTC]
 * @property {string} [endUTC]
 * @property {string} [bookingType]
 * @property {string} [appointmentStatus]
 * @property {string} [paymentStatus]
 * @property {number} [amountDue]
 * @property {number} [amountPaid]
 * @property {string} [billUrl]
 * @property {string} [receiptUrl]
 * @property {Array} [conflicts]
 * @property {Object} [metadata]
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

// --- Utility ---
const generateIdempotencyKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36).substring(2);

const withIdempotency = (config = {}) => {
  const headers = { ...config.headers };
  // Only inject if neither casing exists
  if (!headers['Idempotency-Key'] && !headers['idempotency-key']) {
    headers['Idempotency-Key'] = generateIdempotencyKey();
  }
  return { ...config, headers };
};

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
   * Associate uploaded files (icon / barcode / qr) with a clinic record.
   * Expected payload shape (examples): { id: clinicId, clinic_icon: '<url>' }
   */
  export async function uploadClinicFiles(payload = {}, config = {}) {
    try {
      const response = await axiosInstance.post(`${server_url}/clinic/uploadFiles`, payload, config);
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
 * Create a new clinic
 * @param {Object} payload 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function createClinic(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/clinics`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update a clinic
 * @param {string|number} clinicId 
 * @param {Object} payload 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateClinic(clinicId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/dt/clinics/${clinicId}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Delete a clinic
 * @param {string|number} clinicId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function deleteClinic(clinicId, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/dt/clinics/${clinicId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

// --- Organizations ---

/**
 * Get all organizations
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any[]}>}
 */
export async function getOrganizations(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/org/`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Get organization by ID
 * @param {string|number} orgId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getOrganizationById(orgId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/org/${orgId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Create a new organization
 * @param {Object} payload 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function createOrganization(payload, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/org/`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Update an organization
 * @param {string|number} orgId 
 * @param {Object} payload 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateOrganization(orgId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/org/${orgId}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Delete an organization
 * @param {string|number} orgId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function deleteOrganization(orgId, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/org/${orgId}`, config);
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
 * Formats incoming DT appointment data into standard JSON payload structure required by backend.
 * 
 * Target structure:
 * {
 *   "organization_id": 1,
 *   "clinic_id": 3,
 *   "patient_id": 42,
 *   "primary_doctor_id": 15,
 *   "appointment_date": "2026-07-15",
 *   "start_time": "09:00",
 *   "end_time": "13:00",
 *   "appointment_type": "in_clinic",
 *   "reason": "Routine dialysis session",
 *   "patient_ailments": [
 *     { "id": 2, "name": "Chronic Kidney Disease" },
 *     { "id": 5, "name": "Hypertension" }
 *   ],
 *   "status": "SCHEDULED",
 *   "created_by": 7,
 *   "unit_price": "1500",
 *   "discount": "100",
 *   "token_id": "DT-001",
 *   "isEmergency": false,
 *   "referred_by": "Dr. Smith",
 *   "meet_link": null
 * }
 */
export function formatDtAppointmentPayload(data = {}) {
  let ailments = [];
  const rawAilments = data.patient_ailments ?? data.patientAilments ?? data.ailments;
  if (Array.isArray(rawAilments)) {
    ailments = rawAilments.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: Number(item.id || idx + 1),
          name: String(item.name || item.title || '').trim(),
        };
      }
      return { id: idx + 1, name: String(item).trim() };
    }).filter(a => a.name);
  } else if (typeof rawAilments === 'string' && rawAilments.trim()) {
    try {
      const parsed = JSON.parse(rawAilments);
      if (Array.isArray(parsed)) {
        ailments = formatDtAppointmentPayload({ patient_ailments: parsed }).patient_ailments;
      } else if (typeof parsed === 'object' && parsed !== null) {
        const list = parsed.ailments || parsed.patientAilments || parsed.patient_ailments || [];
        if (Array.isArray(list)) {
          ailments = formatDtAppointmentPayload({ patient_ailments: list }).patient_ailments;
        }
      }
    } catch (_) {
      ailments = rawAilments
        .split(',')
        .map((s, idx) => ({ id: idx + 1, name: s.trim() }))
        .filter(a => a.name);
    }
  }

  let appointment_date = data.appointment_date || data.appointmentDate || data.date || '';
  let start_time = data.start_time || data.startTime || '';
  let end_time = data.end_time || data.endTime || '';

  if (!appointment_date && data.startUTC) {
    appointment_date = String(data.startUTC).split('T')[0];
  }
  if (!start_time && data.startUTC) {
    const timePart = String(data.startUTC).split('T')[1];
    if (timePart) start_time = timePart.substring(0, 5);
  }
  if (!end_time && data.endUTC) {
    const timePart = String(data.endUTC).split('T')[1];
    if (timePart) end_time = timePart.substring(0, 5);
  }

  if (!start_time) start_time = '09:00';
  if (!end_time) end_time = '13:00';
  if (!appointment_date) {
    appointment_date = new Date().toISOString().split('T')[0];
  }

  const resolveId = (val, fallback = null) => {
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (!isNaN(num) && num > 0) return num;
    }
    return fallback;
  };

  const resolveCreatedBy = (val) => {
    const fromVal = resolveId(val);
    if (fromVal !== null) return fromVal;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('id') || localStorage.getItem('userId') || localStorage.getItem('user_id');
      return resolveId(stored);
    }
    return null;
  };

  return {
    organization_id: resolveId(data.organization_id ?? data.organizationId ?? data.org_id ?? data.orgId),
    clinic_id: resolveId(data.clinic_id ?? data.clinicId),
    patient_id: resolveId(data.patient_id ?? data.patientId),
    primary_doctor_id: resolveId(data.primary_doctor_id ?? data.primaryDoctorId ?? data.doctor_id ?? data.doctorId),
    appointment_date: String(appointment_date),
    start_time: String(start_time),
    end_time: String(end_time),
    appointment_type: String(data.appointment_type || data.appointmentType || data.bookingType || 'in_clinic'),
    reason: String(data.reason || data.title || (data.metadata && data.metadata.notes_brief) || 'Routine dialysis session'),
    patient_ailments: ailments.length > 0 ? ailments : [],
    status: String(data.status || data.appointmentStatus || 'SCHEDULED').toUpperCase(),
    created_by: resolveCreatedBy(data.created_by ?? data.createdBy),
    unit_price: String(data.unit_price ?? data.unitPrice ?? data.amountDue ?? data.total_amount ?? data.totalAmount ?? '0'),
    discount: String(data.discount ?? '0'),
    token_id: String(data.token_id || data.tokenId || ''),
    isEmergency: Boolean(data.isEmergency || data.is_emergency || false),
    referred_by: String(data.referred_by || data.referredBy || ''),
    meet_link: data.meet_link !== undefined ? data.meet_link : (data.meetLink !== undefined ? data.meetLink : null)
  };
}

/**
 * Create a new appointment
 * @param {Object} payload 
 * @param {Object} config Axios config. Header 'Idempotency-Key' is required (auto-generated if missing).
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function createAppointment(payload, config = {}) {
  try {
    const finalConfig = withIdempotency(config);
    const idempotencyKey = finalConfig.headers['Idempotency-Key'] || finalConfig.headers['idempotency-key'];

    const formattedPayload = formatDtAppointmentPayload(payload);

    if (idempotencyKey) {
      formattedPayload.idempotencyKey = idempotencyKey;
    }
    if (payload.patientId !== undefined) formattedPayload.patientId = payload.patientId;
    if (payload.clinicId !== undefined) formattedPayload.clinicId = payload.clinicId;
    if (payload.slotId !== undefined) formattedPayload.slotId = payload.slotId;
    if (payload.startUTC !== undefined) formattedPayload.startUTC = payload.startUTC;
    if (payload.endUTC !== undefined) formattedPayload.endUTC = payload.endUTC;
    if (payload.amountDue !== undefined) formattedPayload.amountDue = payload.amountDue;
    if (payload.currency !== undefined) formattedPayload.currency = payload.currency;
    if (payload.immediatePayment !== undefined) formattedPayload.immediatePayment = payload.immediatePayment;
    if (payload.bookingType !== undefined) formattedPayload.bookingType = payload.bookingType;
    if (payload.services !== undefined) formattedPayload.services = payload.services;

    if (Array.isArray(payload.sessions)) {
      formattedPayload.sessions = payload.sessions.map(s => ({
        ...formatDtAppointmentPayload({ ...payload, ...s }),
        startUTC: s.startUTC,
        endUTC: s.endUTC,
        slotId: s.slotId
      }));
    }
    if (payload.recurrence) formattedPayload.recurrence = payload.recurrence;
    if (payload.metadata) formattedPayload.metadata = payload.metadata;
    if (payload.automation) formattedPayload.automation = payload.automation;
    if (payload.paySessions) formattedPayload.paySessions = payload.paySessions;

    const response = await axiosInstance.post(`${server_url}/dt/appointments`, formattedPayload, finalConfig);
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
 * @param {Object} config Axios config. Header 'Idempotency-Key' is required (auto-generated if missing).
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function addAppointmentPayment(appointmentId, payload, config = {}) {
  try {
    const finalConfig = withIdempotency(config);
    const response = await axiosInstance.post(`${server_url}/dt/appointments/${appointmentId}/payments`, payload, finalConfig);
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
 * @param {Object} config Axios config. Header 'Idempotency-Key' is required (auto-generated if missing).
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function cancelAppointment(appointmentId, payload, config = {}) {
  try {
    const finalConfig = withIdempotency(config);
    const response = await axiosInstance.post(`${server_url}/dt/appointments/${appointmentId}/cancel`, payload, finalConfig);
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

/**
 * Retrieve a bill from the primary billing module
 * @param {string|number} billId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getBillingBillById(billId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/billing/bills/${billId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Retrieve a consolidated bill with all appointments and services
 * @param {string|number} billId 
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getBillDetails(billId, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/bills/${billId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

/**
 * Mark services for an appointment as consumed
 * @param {string|number} appointmentId 
 * @param {Object} payload 
 * @param {number} [payload.serviceId] optional specific service ID
 * @param {Object} config Axios config
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function consumeAppointmentServices(appointmentId, payload = {}, config = {}) {
  try {
    const response = await axiosInstance.post(`${server_url}/dt/appointments/${appointmentId}/consume`, payload, config);
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

export async function createBill(payload, config = {}) {
  try {
    const configWithIdempotency = withIdempotency(config);
    const response = await axiosInstance.post(`${server_url}/dt/bills`, payload, configWithIdempotency);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export default {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getClinicBeds,
  getClinicAppointments,
  getAvailableSlots,
  getAppointments,
  createAppointment,
  formatDtAppointmentPayload,
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
  getBillDetails,
  getBillingBillById,
  consumeAppointmentServices,
  createBill,
};
