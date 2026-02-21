import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function getPatients() {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getPatients"
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function AddPatient(patientData) {
  try {
    console.log("hey")
    const response = await axiosInstance.post(
      server_url + "/patient" + "/AddPatient",
      patientData
    );
    console.log("response from AddPatient : ", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updatePatientProgram(patientId, programData) {
  try {
    const response = await axiosInstance.put(
      server_url + "/patient" + "/updateProgram/" + patientId,
      programData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPatientByIdad(patientId) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getPatient/" + patientId
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPatientById(patientId) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getName/" + patientId
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}


export async function getPatientMedicalTeam(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getMedicalTeam/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPatientAdminTeam(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getAdminTeam/" + id
    );
    console.log("response from getPatientAdminTeam : ", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
export async function getDialysisUpdates() {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const response = await axiosInstance.get(
      server_url + "/patientdata/canReceive",
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
      }
    );
    console.log("response from canExportPatient : ", response);
    if (response.status === 403) {
      return { success: false };
    } else if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function canExportPatient() {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const response = await axiosInstance.get(
      server_url + "/patientdata/canexport",
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
      }
    );
    console.log("response from canExportPatient : ", response);
    if (response.status === 403) {
      return { success: false };
    } else if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function exportPatientData() {
  try {
    const response = await axiosInstance.get(server_url + "/patientdata/export");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function exportPatientDataById(id) {
  try {
    const response = await axiosInstance.get(server_url + "/patientdata/export/" + id);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function extractTextFromCsv(payload) {
  try {
    const response = await axiosInstance.post(
      server_url + "/patientdata/extractTextFromCsv",
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function extractTextFromPdf(payload) {
  try {
    const response = await axiosInstance.post(
      server_url + "/patientdata/extractTextFromPdf",
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getKfreDetails(payload) {
  try {
    const response = await axiosInstance.post(
      server_url + "/patientdata/kfredetails",
      payload
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deletePatient(id) {
  try {
    const response = await axiosInstance.delete(server_url + "/patient/deletePatient/" + id);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientAilments(id) {
  try {
    const response = await axiosInstance.get(server_url + "/patient/getAilments/" + id);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDeletedPatients() {
  try {
    const response = await axiosInstance.get(server_url + "/patient/getDeletdPatients");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientLog() {
  try {
    const response = await axiosInstance.get(server_url + "/patient/patientLog");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function removeAdminFromPatient(id) {
  try {
    const response = await axiosInstance.delete(server_url + "/patient/removeAdmin/" + id);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateAdmin(id, payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updateAdmin/" + id, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateAilments(payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updateAilments", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateDryWeight(payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updateDryWeight", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateGFR(payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updateGFR", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateMedical(id, payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updateMedical/" + id, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updatePatient(payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updatePatient", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function updateProgram(payload) {
  try {
    const response = await axiosInstance.put(server_url + "/patient/updateProgram", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
