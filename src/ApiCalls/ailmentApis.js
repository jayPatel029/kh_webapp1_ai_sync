import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

export async function getAilments() {
  try {
    const response = await axiosInstance.get(server_url + "/ailment");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function addAilment(data) {
  try {
    const response = await axiosInstance.post(server_url + "/ailment/addAilment", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function deleteAilment(id) {
  try {
    const response = await axiosInstance.delete(server_url + "/ailment/deleteAilment/" + id);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updateAilment(id, data) {
  try {
    const response = await axiosInstance.put(server_url + "/ailment/updateAilment/" + id , data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
