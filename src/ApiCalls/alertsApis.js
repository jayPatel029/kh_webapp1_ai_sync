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

const getAlerts = async () => {
    try {
        const response = await axiosInstance.get(`${server_url}/alerts`);
        return response.data;
    } catch (error) {
        return error;
    }
}

const approveOrDisapprovePrescription = async (payload) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/approveOrDisapprovePrescription`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const getAlertByCategory = async () => {
    try {
        const response = await axiosInstance.get(`${server_url}/alerts/byCategory`);
        return response.data;
    } catch (error) {
        return error;
    }
}

const getAlertById = async (id) => {
    try {
        const response = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
        return response.data;
    } catch (error) {
        return error;
    }
}

const getAlertByType = async (type) => {
    try {
        const response = await axiosInstance.get(`${server_url}/alerts/byType/${type}`);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createChangeInProgramAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/changeInProgram`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createContactUsAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/contactUs`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const canReceiveDailyAlerts = async () => {
    try {
        const response = await axiosInstance.get(`${server_url}/alerts/dailyAlerts`);
        return response.data;
    } catch (error) {
        return error;
    }
}

const deleteAlertById = async (id) => {
    try {
        const response = await axiosInstance.delete(`${server_url}/alerts/delete/${id}`);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createDeleteAccountAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/deleteAccount`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const deletePatientAlert = async (id, payload) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/deletePatientAlert/${id}`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createNewEnrollmentAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/newEnrollment`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createNewLabReportAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/newLabReport`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createNewPrescriptionAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/newPrescription`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createNewPrescriptionAlarmAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/newPrescriptionAlarm`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createNewProgramEnrollmentAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/newProgramEnrollment`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createNewRequisitionAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/newRequisition`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createPrescriptionDisapprovedAlarmAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/prescriptionDisapprovedAlarm`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const createPrescriptionNotViewedAlert = async (payload) => {
    try {
        const response = await axiosInstance.post(`${server_url}/alerts/prescriptionNotViewed`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

const updateIsReadAlert = async (payload) => {
    try {
        const response = await axiosInstance.put(`${server_url}/alerts/updateIsRead`, payload);
        return response.data;
    } catch (error) {
        return error;
    }
}

export {
    approveAlert,
    approveAllAlerts,
    dissapproveAlert,
    dissapproveAllAlerts,
    createMessageAlert,
    getAlerts,
    approveOrDisapprovePrescription,
    getAlertByCategory,
    getAlertById,
    getAlertByType,
    createChangeInProgramAlert,
    createContactUsAlert,
    canReceiveDailyAlerts,
    deleteAlertById,
    createDeleteAccountAlert,
    deletePatientAlert,
    createNewEnrollmentAlert,
    createNewLabReportAlert,
    createNewPrescriptionAlert,
    createNewPrescriptionAlarmAlert,
    createNewProgramEnrollmentAlert,
    createNewRequisitionAlert,
    createPrescriptionDisapprovedAlarmAlert,
    createPrescriptionNotViewedAlert,
    updateIsReadAlert
};