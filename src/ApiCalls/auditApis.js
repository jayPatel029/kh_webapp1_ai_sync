import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function getAuditEvents(actorKind, limit = 2000) {
  try {
    const response = await axiosInstance.get(server_url + "/audit/events", {
      params: { actorKind, limit },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      data: error.response?.data || error.message,
    };
  }
}
