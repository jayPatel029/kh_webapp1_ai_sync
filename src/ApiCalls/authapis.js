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

export async function changePassword(payload) {
  try {
    const response = await axiosInstance.post(
      server_url + "/auth/changePassword",
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPrivateAuth() {
  try {
    const response = await axiosInstance.get(server_url + "/auth/private");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function createRole(roleData) {
  try {
    const response = await axiosInstance.post(server_url + "/roles", roleData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getRoleByName(roleName) {
  try {
    const response = await axiosInstance.get(server_url + "/roles/byName/" + roleName);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateRoleByName(roleName, roleData) {
  try {
    const response = await axiosInstance.put(
      server_url + "/roles/byName/" + roleName,
      roleData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteRoleByName(roleName) {
  try {
    const response = await axiosInstance.delete(server_url + "/roles/byName/" + roleName);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function isDoctorRole() {
  try {
    const response = await axiosInstance.get(server_url + "/roles/isDoctor");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAdmins() {
  try {
    const response = await axiosInstance.get(server_url + "/users/admins");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUsersByRole(role) {
  try {
    const response = await axiosInstance.get(server_url + "/users/byRole/" + role);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUsersAssignedToPatient(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/users/assignedToPatient/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorsAssignedToPatient(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/users/docAssignedToPatient/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function isUserDoctor() {
  try {
    const response = await axiosInstance.get(server_url + "/users/isDoctor");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getIdByEmail(payload, config = {}) {
  try {
    const response = await axiosInstance.post(
      server_url + "/users/byEmail/id",
      payload,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
