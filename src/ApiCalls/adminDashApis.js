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

export { getTotalUsers, getUsersThisWeek, getAlerts, getDoctorAlerts ,getUsersThisWeekSub};
