import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function insertAlarm(alarmData) {
  try {
    const response = await axiosInstance.post(
      server_url + "/alarms",
      alarmData
    );
    const alarmId = response.data.data;
    if (alarmData.type === "Prescription") {
      const alertData = {
        alarmId: alarmId,
      };
      try {
        const response = await axiosInstance.post(
          server_url + "/alerts/newPrescriptionAlarm",
          alertData
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.log(error);
        return { success: false, data: error.response.data.message };
      }
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getAllAlarms() {
  try {
    const response = await axiosInstance.get(server_url + "/alarms");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updateAlarm(alarmId, alarmData) {
  try {
    const response = await axiosInstance.put(
      server_url + "/alarms/" + alarmId,
      alarmData
    );
    if (alarmData.type === "Prescription") {
      const alertData = {
        alarmId: alarmId,
      };
      try {
        const response = await axiosInstance.post(
          server_url + "/alerts/newPrescriptionAlarm",
          alertData
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.log(error);
        return { success: false, data: error.response.data.message };
      }
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updateReason(alarmId, status, reason, patientId) {
  if (status === "approved") {
    const alertData = {
      alarmId: alarmId,
      status: "Approved",
      patientId,
    };
    try {
      const response = await axiosInstance.put(
        server_url + "/alerts/approveOrDisapprovePrescription",
        alertData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.log(error);
      return { success: false, data: error.response.data.message };
    }
  } else {
    const alarmData = {
      reason: reason,
    };
    const alertData = {
      alarmId: alarmId,
      status: "Rejected",
      patientId,
    };

    try {
      console.log("alarm rejected !!");
      const response = await axiosInstance.put(
        server_url + "/alarms/updateReason/" + alarmId,
        alarmData
      );
      console.log("alertData", alertData);
      const response2 = await axiosInstance.put(
        server_url + "/alerts/approveOrDisapprovePrescription",
        alertData
      );
      console.log(response2);
      return { success: true, data: response.data };
    } catch (error) {
      console.log(error);
      return { success: false, data: error.response.data.message };
    }
  }
}

export async function deleteAlarm(alarmId) {
  try {
    const response = await axiosInstance.delete(
      server_url + "/alarms/" + alarmId
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
