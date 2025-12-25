import { server_url } from "../constants/constants";
import axiosInstance from "../helpers/axios/axiosInstance"; 
const insertAlert = async (doctorEmail, patientId, category, mess) => {
    console.log(doctorEmail, patientId, category, mess);
    const { data } = await axiosInstance.post(`${server_url}/app/appAlerts/insertAlert`, {
        doctorEmail,
        patientId,
        category,
        mess
    });
    return data;
};


export { insertAlert };