import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function addReading(newData) {
  try {
    const response = await axiosInstance.post(`${server_url}/manageparameters/addReading`, newData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, data: error };
  }
};


export const getAllUserReadingsByPid = async (pid) => {
  try {
    const response = await axiosInstance.get(
      server_url + "/readings/getAllUserReadingsByPid/" + pid
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
