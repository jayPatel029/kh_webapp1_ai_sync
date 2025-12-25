import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";
export async function uploadFile(formData) {
  try {
    const response = await axiosInstance.post(server_url + "/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("dataRe",response.data)
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Error uploading file:", error);
    return {success: false, data: error.message};
  }
}
