import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

export const getContactUsById = async (id) => {
  try {
    const response = await axiosInstance.get(`${server_url}/contactus/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, data: error.message };
  }
};

export const getAllContactUs = async () => {
  try {
    const response = await axiosInstance.get(`${server_url}/contactus`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, data: error.message };
  }
};

export const insertContactUs = async (phoneno, email, message) => {
  try {
    const response = await axiosInstance.post(`${server_url}/contactus`, {
      phoneno,
      email,
      message,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, data: error.message };
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
    return { success: false, data: error.message };
  }
};
