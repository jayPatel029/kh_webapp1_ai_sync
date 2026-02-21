import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

// --- Doctor Alerts (SortAlerts/doctor) ---

export async function getDoctorSortAlerts(doctorId, config = {}) {
  try {
    const response = await axiosInstance.get(
      `${server_url}/SortAlerts/doctor/${doctorId}`,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}