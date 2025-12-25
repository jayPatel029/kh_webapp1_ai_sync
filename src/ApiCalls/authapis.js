import { server_url } from "../constants/constants";
import axiosInstance from "../helpers/axios/axiosInstance";

export async function registerUser(userData) {
  try {
    const response = await axiosInstance.post(
      server_url + "/auth/register",
      userData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function loginUser(userData) {
  try {
    const response = await axiosInstance.post(
      server_url + "/auth/login",
      userData
    );
    return { success: true, data: response?.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}

export async function getUserByEmail(email) {
  try {
    const response = await axiosInstance.get(
      server_url + "/users/email/" + email
    );
    // console.log(response)
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}

export async function getUserByEmailDoctor(email) {
  try {
    const response = await axiosInstance.get(
      server_url + "/users/email/doctor/" + email
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}

export async function getUsers() {
  try {
    const response = await axiosInstance.get(server_url + "/users");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getDoctorsByPatientId() {
  try {
    const response = await axiosInstance.get(
      server_url + "/assignedDoctor/getDoctor/10"
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updateUserByEmail(email, userData) {
  try {
    const response = await axiosInstance.put(
      server_url + "/users/" + email,
      userData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}

export async function deleteUserByEmail(email) {
  try {
    const response = await axiosInstance.delete(server_url + "/users/" + email);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}

export async function getRoles() {
  try {
    const response = await axiosInstance.get(server_url + "/roles");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}

export async function identifyRole() {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axiosInstance.get(
      server_url + "/roles/identifyrole/",
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
}
