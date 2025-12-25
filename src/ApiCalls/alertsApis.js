import axiosInstance from "../helpers/axios/axiosInstance"; 
import { server_url } from "../constants/constants";

const approveAlert = async (alertId,alarmId) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/approveAlert`,{
            id: alertId,
            alarmId: alarmId
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const approveAllAlerts = async (presId) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/approveAllAlerts`,{
            presId: presId
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

const dissapproveAlert = async (alertId,alarmId,reason) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/disapproveAlert`,{
            id: alertId,
            alarmId: alarmId,
            reason: reason
        });
        return response.data;
    } catch (error) {
        return error;
    }

}

const dissapproveAllAlerts = async (presId,reason) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/disapproveAllAlerts`,{
            presId: presId,
            reason: reason
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

const createMessageAlert = async (chatId,message,pid) =>{
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/doctorMessageToAdmin`,{
            chatId: chatId,
            message: message,
            pid: pid

        });
        return response.data;
        
    } catch (error) {
        console.log(error);
        
    }
}

export { approveAlert,approveAllAlerts,dissapproveAlert,dissapproveAllAlerts,createMessageAlert };