import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

// Get daily readings
export const getDailyReadings = async () => {
  try {
    const response = await axiosInstance.get(server_url + "/readings/getDailyReadings");
    console.log("data",response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

// Add daily reading
export const addDailyReading = async (data) => {
  try {
    const response = await axiosInstance.post(
      server_url + "/readings/addDailyReadings",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

// Modify daily reading range
export const modifyDailyReadingRange = async (data) => {
  try {
    const response = await axiosInstance.post(
      server_url + "/readings/modifyDailyReadingsRange",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

// Get dialysis readings
export const getDialysisReadings = async () => {
  try {
    const response = await axiosInstance.get(
      server_url + "/readings/getDialysisReadings"
    );
    console.log(response.data)
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

// Add dialysis reading
export const addDialysisReading = async (data) => {
  try {
    const response = await axiosInstance.post(
      server_url + "/readings/addDialysisReadings",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

// Modify dialysis reading range
export const modifyDialysisReadingRange = async (data) => {
  try {
    const response = await axiosInstance.post(
      server_url + "/readings/modifyDialysisReadingsRange",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const deleteDailyReading = async (id) => {
  try {
    const response = await axiosInstance.delete(
      server_url + "/readings/deleteDailyReading/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const deleteDialysisReading = async (id) => {
  try {
    const response = await axiosInstance.delete(
      server_url + "/readings/deleteDialysisReading/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const updateDailyReading = async (data) => {
  try {
    const response = await axiosInstance.put(
      server_url + "/readings/updateDailyReading/",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const updateDialysisReading = async (data) => {
  try {
    const response = await axiosInstance.put(
      server_url + "/readings/updateDialysisReading/",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const postBulkDailyReadings = async (data) => {
  try {
    const response = await axiosInstance.post(
      server_url + "/readings/postBulkDailyReadings",
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const getSystolicIdByTitle = async (questionTitle) => {
  try {
    const response = await axiosInstance.get(
      `${server_url}/readings/get/sysid/${questionTitle}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const getDialysisSystolicIdByTitle = async (questionTitle) => {
  try {
    const response = await axiosInstance.get(
      `${server_url}/readings/get/dia/sysid/${questionTitle}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};