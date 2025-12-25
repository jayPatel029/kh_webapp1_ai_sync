import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

export async function createLanguage(languageData) {
  try {
    const response = await axiosInstance.post(server_url + "/languages", languageData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getLanguages() {
  try {
    const response = await axiosInstance.get(server_url + "/languages");
    console.log("fetching langs:",response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.log("error fetching langs:",error);
    return { success: false, data: error.response.data.message };
  }
}

export async function updateLanguage(languageId, languageData) {
  try {
    const response = await axiosInstance.put(server_url + "/languages/" + languageId, languageData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function deleteLanguage(languageId) {
  try {
    const response = await axiosInstance.delete(server_url + "/languages/" + languageId);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
