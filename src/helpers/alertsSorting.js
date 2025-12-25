import axiosInstance from "./axios/axiosInstance"; 
import { server_url } from "../constants/constants";
const getPrescriptionDissapprovalAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    const alarmId = result.data[0].alarmId;
    const result2 = await axiosInstance.get(`${server_url}/alarms/byId/${alarmId}`);
    console.log(result2);
    const doctorId = result2.data.data[0].doctorId;
    const patientID = result2.data.data[0].patientid;
    const result3 = await axiosInstance.get(`${server_url}/doctor/name/${doctorId}`);
    const doctorName = result3.data.data;

    const data = {
        id: id,
        name: doctorName,
        type0: type0,
        type: `Prescription Dissapproved by ${doctorName}`,
        date: date,
        redirect: `/ShowAlarms/${patientID}`,
        alarmId: alarmId,
    }

    return data;
};

const doctorMessageToAdminAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    console.log("DCO",result);
    console.log("DCOtype0",type0);
    const doctorName = result.data[0].senderName;
    const message = result.data[0].message;
    const patientId = result.data[0].patientId;
    const data = {
        id: id,
        name: doctorName,
        type0: type0,
        type: `${doctorName}: ${message}`,
        date: date,
        redirect: `/adminChat/${patientId}`
    }

    return data;

};

const newPrescriptionUploadedAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    const alarmId = result.data[0].alarmId;
    const result2 = await axiosInstance.get(`${server_url}/alarms/byId/${alarmId}`);
    const doctorId = result2.data.data[0].doctorId;
    const patientID = result2.data.data[0].patientid;
    const result3 = await axiosInstance.get(`${server_url}/patient/getName/${patientID}`);
    const patientName = result3.data.data;

    const data = {
        id: id,
        name: patientName,
        type0: type0,
        type: `New Prescription Uploaded by ${patientName}`,
        date: date,
        redirect: `/showAlarms/${patientID}`,
        alarmId: alarmId,
        status: result2.data.data[0].status
    }

    return data;

};


const newLabReportUploadedAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    console.log(id)
    const labReportId = result.data[0].labReportId;
    console.log(labReportId);
    const result2 = await axiosInstance.get(`${server_url}/labreport/getLabReport/${labReportId}`);
    const patientID = result2.data.data[0].patient_id;
    const result3 = await axiosInstance.get(`${server_url}/patient/getName/${patientID}`);
    const patientName = result3.data.data;

 

    const data = {
        id: id,
        name: patientName,
        type0: type0,
        type: `New Lab Report Uploaded by ${patientName}`,
        date: date,
        redirect: `/userLabReports/${patientID}`,
        labReportId: labReportId
    }

    return data;
    
    
};

// const newRequisitionUploadedAlert = async (id,date,type0) => {
//     const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
//     const requisitionId = result.data[0].requisitionId;
//     console.log(requisitionId);
//     const result2 = await axiosInstance.get(`${server_url}/requisition/byId/${requisitionId}`);
//     console.log(result2);
//     const patientID = result2.data.data[0].Patient_id;
//     const result3 = await axiosInstance.get(`${server_url}/patient/getName/${patientID}`);
//     const patientName = result3.data.data;

//     const data = {
//         id: id,
//         name: patientName,
//         type0: type0,
//         type: `New Requisition Uploaded by ${patientName}`,
//         date: date,
//         redirect: `/userRequisitions/${patientID}`,
//         requisitionId: requisitionId
//     }

//     return data;

// };

const newEnrollmentAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    const patientID = result.data[0].patientId;
    const result2 = await axiosInstance.get(`${server_url}/patient/getName/${patientID}`);
    const patientName = result2.data.data;

    const data = {
        id: id,
        name: patientName,
        type0: type0,
        type: `New Enrollment by ${patientName}`,
        date: date,
        redirect: `/userProgramSelection`
    }

    return data;
};

const newProgramEnrollmentAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    const patientID = result.data[0].patientId;
    const result2 = await axiosInstance.get(`${server_url}/patient/getName/${patientID}`);
    const patientName = result2.data.data;
    const programName = result.data[0].programName;

    const data = {
        id: id,
        name: patientName,
        type0: type0,
        type: `New Program Enrollment request by ${patientName} in ${programName}`,
        date: date,
        redirect: `/userProgramSelection`
    }
    return data;

}

const MissedPrescriptionAlert = async (id,date,type0) => {
    const result = await axiosInstance.get(`${server_url}/alerts/byId/${id}`);
    const alarmId = result.data[0].alarmId;
    const result2 = await axiosInstance.get(`${server_url}/alarms/byId/${alarmId}`);
    const doctorId = result2.data.data[0].doctorId;
    const patientID = result2.data.data[0].patientid;
    const result3 = await axiosInstance.get(`${server_url}/patient/getName/${patientID}`);
    const patientName = result3.data.data;
    const result4 = await axiosInstance.get(`${server_url}/doctor/name/${doctorId}`);
    const doctorName = result4.data.data;
    const data = {
        id: id,
        name: doctorName,
        type0: type0,
        type: `Missed Prescription Alarm for ${patientName}`,
        date: date,
        redirect: `/ShowAlarms/${patientID}`,
        alarmId: alarmId
    
    }

    return data;


};

const checkIsPatient = async (id) => {
   const patient = await axiosInstance.get(`${server_url}/patient/getPatient/${id}`);
   const adminList = patient.data.program_assigned_to.split(",");


}


const SortAlertsAdmin = (alerts) => {
    var adminAlerts = [];
    for (var i = 0; i < alerts.length; i++) {
        if (alerts[i].category === "Doctor Message To Admin"){
            adminAlerts.push(alerts[i]);
        }
        else if (alerts[i].category === "Prescription Disapproved" || alerts[i].category === "New Program Enrollment" || alerts[i].category == "New Enrollment") {
            const isPatient = checkIsPatient(alerts[i].patientId);
            adminAlerts.push(alerts[i]);
        }
    }

};


const getAlertData = async (id,date,type0,type1) => {
    if (type1 === "Prescription Disapproved"){
        return getPrescriptionDissapprovalAlert(id,date,type0);
    }
    else if (type1 === "New Prescription Alarm"){
        return newPrescriptionUploadedAlert(id,date,type0);
    }
    else if (type1 === "New Lab Report"){
        return newLabReportUploadedAlert(id,date,type0);
    }
    // else if (type1 === "New Requisition"){
    //     return newRequisitionUploadedAlert(id,date,type0);
    // }
    else if (type1 === "Doctor Message To Admin"){
        return doctorMessageToAdminAlert(id,date,type0);
    }
    else if (type1 === "New Enrollment"){
        return newEnrollmentAlert(id,date,type0);
    }
    else if (type1 === "New Program Enrollment"){
        return newProgramEnrollmentAlert(id,date,type0);
    }
    
    else{
        return null;
    }
};

export default getAlertData;
