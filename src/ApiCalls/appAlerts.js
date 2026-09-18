import { server_url } from "../constants/constants";
import axiosInstance from "../helpers/axios/axiosInstance"; 
const insertAlert = async (doctorEmail, patientId, category, mess) => {
    console.log(doctorEmail, patientId, category, mess);
    const { data } = await axiosInstance.post(`${server_url}/app/appAlerts/insertAlert`, {
        doctorEmail: doctorEmail,
        patientId: patientId,
        category: category,
        mess: mess
    });
    return data;
};

/** Alias kept for older call sites — same as insertAlert. */
const insertAlertAppApis = insertAlert;

export { insertAlert, insertAlertAppApis };