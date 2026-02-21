import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function addAdminToPatient(id, payload) {
  try {
    const response = await axiosInstance.post(
      `${server_url}/adminPatient/addAdmin/${id}`,
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteAssignedAdmin(id) {
  try {
    const response = await axiosInstance.delete(
      `${server_url}/adminPatient/deleteAdmin/${id}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAdminData(id) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/adminPatient/getAdmin/${id}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
