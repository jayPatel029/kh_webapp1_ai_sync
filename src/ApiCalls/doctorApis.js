import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

export async function registerDoctor(doctorData) {
  try {
    const response = await axiosInstance.post(server_url + "/doctor", doctorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getDoctors() {
  try {
    const response = await axiosInstance.get(server_url + "/doctor/getDoctors");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getDoctorsChat(patientId) {
  try {
    const response = await axiosInstance.get(server_url + "/doctor/getDoctorsChat/"+patientId);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
export async function updateDoctor(doctorId, doctorData) {
  try {
    console.log("update doc", doctorData);
    const response = await axiosInstance.put(server_url + "/doctor/" + doctorId, doctorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function deleteDoctor(doctorId) {
  try {
    const response = await axiosInstance.delete(server_url + "/doctor/" + doctorId);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getDoctorLogs() {
  try {
    const response = await axiosInstance.get(server_url + "/doctor/doctorLogs");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorNameById(id) {
  try {
    const response = await axiosInstance.get(server_url + "/doctor/name/" + id);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorReportLogs() {
  try {
    const response = await axiosInstance.get(server_url + "/doctor/ReportLogs");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorIdByEmail(payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      server_url + "/doctor/byEmail/id",
      payload,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}