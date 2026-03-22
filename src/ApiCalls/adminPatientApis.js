import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function addAdminToPatient(id, payload) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/assignedAdmin/addAdmin/${id}`,
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteAssignedAdmin(patientId, adminId) {
  try {
    const response = await axiosInstance.delete(
      `${server_url}/assignedAdmin/deleteAdmin/${patientId}`,
      { data: { admin_id: adminId } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAdminData(id) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/assignedAdmin/getAdmin/${id}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAssignedAdminData(id) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/assignedAdmin/getAdmin/${id}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
