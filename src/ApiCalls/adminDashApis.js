import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

const getTotalUsers = async () => {
  try {
    const response = await axiosInstance.get(`${server_url}/users/total`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching total users:", error);
  }
};

const getUsersThisWeekSub = async () => {
  try {
    const response = await axiosInstance.get(
      `${server_url}/users/totalThisWeekSub`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching new users:", error);
  }
};

const getUsersThisWeek = async () => {
  try {
    const response = await axiosInstance.get(
      `${server_url}/users/totalThisWeek`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching new users:", error);
  }
};

const getAlerts = async () => {
  try {
    const email = localStorage.getItem("email");
    const id = await axiosInstance.post(`${server_url}/users/byEmail/id`, {
      email: email,
    });
    var alertData = await axiosInstance.get(
      `${server_url}/sortAlerts/${id.data.id}`
    );
    // console.log(alertData);
    return alertData;
  } catch (error) {
    console.error("Error fetching alerts:", error);
  }
};

const getDoctorAlerts = async () => {
  console.log("Doctor Alerts");
  const email = localStorage.getItem("email");
  console.log("Email", email);
  const res = await axiosInstance.post(`${server_url}/doctor/byEmail/id`, {
    email: email,
  });
  const id = res.data;
  const alertData = await axiosInstance.get(
    `${server_url}/sortAlerts/doctor/${id}`
  );
  console.log("Data", alertData);
  return alertData;
};

const sendAlertEmails = async () => {
  try {
    const response = await axiosInstance.get(`${server_url}/sortAlerts/emails/sendEmails`);
    return response.data;
  } catch (error) {
    console.error("Error sending alert emails:", error);
  }
};

const getSuperAdminAlerts = async (adminId) => {
  try {
    const response = await axiosInstance.get(
      `${server_url}/sortAlerts/superAdminAlerts/${adminId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching super admin alerts:", error);
  }
};

const getAlertsSortedByType = async () => {
  try {
    const response = await axiosInstance.get(`${server_url}/alerts`);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn("Invalid response format for alerts");
      return { success: false, data: {}, message: "Invalid response format" };
    }

    const alerts = response.data;
    
    // Group alerts by type
    const alertsByType = alerts.reduce((acc, alert) => {
      const alertType = alert.type || "unknown";
      
      if (!acc[alertType]) {
        acc[alertType] = [];
      }
      acc[alertType].push(alert);
      
      return acc;
    }, {});

    // Sort alerts within each type by date (newest first)
    Object.keys(alertsByType).forEach((type) => {
      alertsByType[type].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      });
    });

    // Create a summary with counts
    const summary = Object.entries(alertsByType).map(([type, alerts]) => ({
      type,
      count: alerts.length,
      alerts,
    }));

    // Sort summary by count (descending)
    summary.sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: alertsByType,
      summary,
      totalAlerts: alerts.length,
      alertTypes: Object.keys(alertsByType),
    };
  } catch (error) {
    console.error("Error fetching alerts by type:", error);
    return { success: false, error: error.message };
  }
};

export {
  getTotalUsers,
  getUsersThisWeek,
  getAlerts,
  getDoctorAlerts,
  getUsersThisWeekSub,
  sendAlertEmails,
  getSuperAdminAlerts,
  getAlertsSortedByType,
};
