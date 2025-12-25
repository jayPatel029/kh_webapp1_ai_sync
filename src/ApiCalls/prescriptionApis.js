import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function getPrescription() {
  try {
    const response = await axiosInstance.get(server_url + "/prescription");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPrescriptionByPatient(patientid) {
  try {
    const response = await axiosInstance.get(
      server_url + "/prescription/getPrescription/" + patientid
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function addPrescription(prescriptionData) {
  try {
    const response = await axiosInstance.post(
      server_url + "/prescription",
      prescriptionData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function deletePrescription(id) {
  try {
    const response = await axiosInstance.delete(
      server_url + "/prescription/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function addPrescriptionById(prescriptionData) {
  console.log("prescriptionData", prescriptionData);
  try {
    const response = await axiosInstance.post(
      server_url + "/prescription/addPrescription",
      prescriptionData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPrescriptionsById(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/prescription/getPrescription/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
