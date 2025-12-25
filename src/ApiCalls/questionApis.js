import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function createQuestion(questionData) {
  console.log("in create ques");
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    console.log("sending this data: ",questionData);
    const response = await axiosInstance.post(server_url + "/questions", questionData, {
      headers: {
        Authorization: `Bearer ${token}`, // Send token in headers
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
 
export async function getQuestions() {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const response = await axiosInstance.get(server_url + "/questions", {
      headers: {
        Authorization: `Bearer ${token}`, // Send token in headers
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updateQuestion(id, questionData) {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const response = await axiosInstance.put(
      server_url + "/questions/" + id,
      questionData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function deleteQuestion(id) {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const response = await axiosInstance.delete(server_url + "/questions/" + id, {
      headers: {
        Authorization: `Bearer ${token}`, // Send token in headers
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
