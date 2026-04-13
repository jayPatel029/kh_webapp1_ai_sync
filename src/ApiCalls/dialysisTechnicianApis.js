import { appFetchDialysisParametersById, appGetDialysisHealthParams, appSubmitDialysisHealthParams } from './appApis';
import { postTeleconsultationBookAppointment, getTeleconsultationGetAllAppointmentsById } from './remainingApis';

/**
 * Consolidated API helpers for Dialysis Technician related features
 * - Dialysis health params (app/dialysisHealth/*)
 * - Appointment booking / retrieval (teleconsultation/*)
 *
 * This module re-exports existing ApiCalls where available and provides
 * a small placeholder for UI-only concepts (e.g. badges) when no server
 * API exists in the codebase.
 */

// Dialysis health
export const fetchDialysisParametersById = (payload, config = {}) =>
  appFetchDialysisParametersById(payload, config);

export const getDialysisHealthParams = (payload, config = {}) =>
  appGetDialysisHealthParams(payload, config);

export const submitDialysisHealthParams = (payload, config = {}) =>
  appSubmitDialysisHealthParams(payload, config);

// Appointments (teleconsultation)
export const bookAppointment = (payload, config = {}) =>
  postTeleconsultationBookAppointment(payload, config);

export const getAllAppointmentsById = (config = {}) =>
  getTeleconsultationGetAllAppointmentsById(config);

// Badge / UI-only data: no server API found in repository for "badge details".
// Return a helpful not-implemented response so callers can handle it gracefully.
export async function getBadgeDetails(/* payload, config */) {
  return { success: false, data: 'No badge API found in repository; implement server endpoint or supply endpoint path' };
}

// Example request bodies (from Insomnia):
// bookAppointment: { patient_id, doctor_id, service_id, appointment_date, appointment_time, vitals }
// fetchDialysisParametersById: POST to /api/app/dialysisHealth/fetchDialysisParametersById (body as required by server)
// submitDialysisHealthParams: POST to /api/app/dialysisHealth/submitDialysisHealthParams (may accept image uploads per Insomnia metadata)

export default {
  fetchDialysisParametersById,
  getDialysisHealthParams,
  submitDialysisHealthParams,
  bookAppointment,
  getAllAppointmentsById,
  getBadgeDetails,
};
