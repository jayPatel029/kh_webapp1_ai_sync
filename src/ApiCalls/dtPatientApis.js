import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

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

export async function listDtPatients(config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dt/patients`, config);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
}

export async function ensureDtPatientFromM1(m1PatientId, extras = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/patients/ensure-from-m1`,
      { m1_patient_id: m1PatientId, ...extras },
      config,
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
}

export async function ensureDtPatientsFromM1Batch(m1PatientIds, extras = {}, config = {}) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/dt/patients/ensure-from-m1/batch`,
      {
        ...(Array.isArray(m1PatientIds) && m1PatientIds.length ? { m1_patient_ids: m1PatientIds } : {}),
        ...extras,
      },
      config,
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
}
