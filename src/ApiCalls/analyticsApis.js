import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

/**
 * Analytics API wrappers
 * Endpoints under /analytics/* used by chart/report components
 */

export async function getPatientsByAge() {
  try {
    const response = await axiosInstance.get(server_url + "/analytics/getPatientsByAge");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientsByGender() {
  try {
    const response = await axiosInstance.get(server_url + "/analytics/getPatientsByGender");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPercentageReturn() {
  try {
    const response = await axiosInstance.get(server_url + "/analytics/getPercentageReturn");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAdherenceMedicine() {
  try {
    const response = await axiosInstance.get(server_url + "/analytics/getAdherenceMedicine");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientsByDoctorId() {
  try {
    const response = await axiosInstance.get(server_url + "/analytics/getPatientsByDoctorId");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
