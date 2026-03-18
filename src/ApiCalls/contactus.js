import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

export const getContactUsById = async (id) => {
  try {
    const response = await axiosInstance.get(`${server_url}/contactus/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const getAllContactUs = async () => {
  try {
    const response = await axiosInstance.get(`${server_url}/contactus`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const insertContactUs = async (phoneno, email, message, patientId = "") => {
  try {
    const response = await axiosInstance.post(`${server_url}/contactus`, {
      phoneno: phoneno,
      email: email,
      message: message,
      patientId: patientId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};

export const deleteContactUs = async (id) => {
  try {
    const response = await axiosInstance.delete(`${server_url}/contactus/${id}`);
    if (response.status === 204) {
      return { success: true, data: "ContactUs deleted successfully" };
    } else {
      return { success: false, data: "Failed to delete ContactUs" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error?.response?.data?.error || error.message };
  }
};
