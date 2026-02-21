import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function fetchAilmentId(id) {
  try {
    const response = await axiosInstance.get(`${server_url}/ailmentPatient/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
