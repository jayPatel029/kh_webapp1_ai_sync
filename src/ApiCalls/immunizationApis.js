import { getPatientById, updatePatient } from './patientAPis';

/**
 * Immunization API helpers (frontend wrappers).
 * These use the existing patient endpoints to store an `immunizations` array
 * on the patient record (backend must support storing arbitrary fields on patient).
 */

export async function getImmunizations(patientId) {
  try {
    const res = await getPatientById(patientId);
    if (res?.success && res?.data) {
      const patientData = res.data.data || res.data;
      return { success: true, data: patientData.immunizations || [] };
    }
    return { success: false, data: [] };
  } catch (error) {
    return { success: false, error: error?.message || error };
  }
}

export async function saveImmunizations(patientId, immunizations = [], extraData = {}) {
  try {
    const payload = { id: patientId, immunizations, ...extraData };
    const res = await updatePatient(payload);
    if (res?.success) return { success: true, data: res.data };
    return { success: false, data: res?.data || null };
  } catch (error) {
    return { success: false, error: error?.response?.data || error.message };
  }
}
