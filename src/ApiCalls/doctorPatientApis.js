import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function addDoctorToPatient(id, payload) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/assignedDoctor/addDoctor/${id}`,
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteAssignedDoctor(patientId, doctorId) {
  try {
    const response = await axiosInstance.delete(
      `${server_url}/assignedDoctor/deleteDoctor/${patientId}`,
      { data: { doctor_id: doctorId } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAssignedDoctorData(id) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/assignedDoctor/getDoctor/${id}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
