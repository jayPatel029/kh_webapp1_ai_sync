import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";


export async function postAppapisAlarmsDeleteAlarm(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/alarms/deleteAlarm", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisAlarmsFetchAlarms(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/alarms/fetchAlarms", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisAlarmsInsertAlarm(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/alarms/insertAlarm", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisAppAlertsInsertAlert(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/appAlerts/insertAlert", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDailyHealthFetchDailyParametersById(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dailyHealth/fetchDailyParametersById", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDailyHealthGetDailyHealthParams(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dailyHealth/getDailyHealthParams", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDailyHealthSubmitDailyHealthParams(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dailyHealth/submitDailyHealthParams", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDeleteAccountDeletionRequest(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/deleteAccountDeletionRequest", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDeleteUserRequest(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/deleteUserRequest", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDialysisHealthFetchDialysisParametersById(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dialysisHealth/fetchDialysisParametersById", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDialysisHealthGetDialysisHealthParams(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dialysisHealth/getDialysisHealthParams", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDialysisHealthSubmitDialysisHealthParams(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dialysisHealth/submitDialysisHealthParams", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDietdetailsAddDietComment(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dietdetails/addDietComment", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDietdetailsFetchDietComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dietdetails/fetchDietComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisDietdetailsGetPatientDiet(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/dietdetails/getPatientDiet", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisGetAilmentList(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/getAilmentList", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisGetAilmentsList(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/getAilmentsList", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisGetDoctorMessages(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/getDoctorMessages", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisGetProfileDetails(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/getProfileDetails", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getAppapisGetUnreadDoctorCmts(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/app_apis/getUnreadDoctorCmts", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisIsAccountDeletionRequest(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/isAccountDeletionRequest", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisLogin(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/login", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisLoginv2(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/loginv2", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisMarkCommentsAsRead(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/markCommentsAsRead", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisPrescriptionAddPrescription(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/prescription/addPrescription", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisPrescriptionAddPrescriptionComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/prescription/addPrescriptionComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisPrescriptionDeletePrescription(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/prescription/deletePrescription", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisPrescriptionFetchPrescription(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/prescription/fetchPrescription", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisPrescriptionFetchPrescriptionComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/prescription/fetchPrescriptionComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisPushTokenUpdate(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/pushTokenUpdate", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisQuestionsAnswerQuestions(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/questions/answerQuestions", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisQuestionsGetQuestions(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/questions/getQuestions", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisRegisterGetDoctorCode(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/register/getDoctorCode", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisReportAddLabReport(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/report/addLabReport", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisReportAddReportComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/report/addReportComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisReportDeleteReport(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/report/deleteReport", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisReportFetchReportComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/report/fetchReportComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisReportsUserLabReports(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/reports/userLabReports", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisRequisitionAddRequisitionComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/requisition/addRequisitionComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisRequisitionFetchRequisition(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/requisition/fetchRequisition", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisRequisitionFetchRequisitionComments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/requisition/fetchRequisitionComments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisSendPushNotification(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/sendPushNotification", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisUpdateUserAilments(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/updateUserAilments", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postAppapisUserFeedback(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/app_apis/userFeedback", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
