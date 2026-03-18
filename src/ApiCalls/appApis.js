import { server_url } from "../constants/constants";
import axiosInstance from "../helpers/axios/axiosInstance";

const appBase = `${server_url}/app`;

const ok = (response) => ({ success: true, data: response.data });
const fail = (error) => ({ success: false, data: error.response?.data || error.message });

async function appPost(path, payload, config = {}) {
	try {
		const response = await axiosInstance.post(`${appBase}${path}`, payload, config);
		return ok(response);
	} catch (error) {
		return fail(error);
	}
}

async function appGet(path, config = {}) {
	try {
		const response = await axiosInstance.get(`${appBase}${path}`, config);
		return ok(response);
	} catch (error) {
		return fail(error);
	}
}

export const appDeleteAlarm = (payload, config = {}) => appPost("/alarms/deleteAlarm", payload, config);
export const appFetchAlarms = (payload, config = {}) => appPost("/alarms/fetchAlarms", payload, config);
export const appInsertAlarm = (payload, config = {}) => appPost("/alarms/insertAlarm", payload, config);

export const appFetchDailyParametersById = (payload, config = {}) => appPost("/dailyHealth/fetchDailyParametersById", payload, config);
export const appGetDailyHealthParams = (payload, config = {}) => appPost("/dailyHealth/getDailyHealthParams", payload, config);
export const appSubmitDailyHealthParams = (payload, config = {}) => appPost("/dailyHealth/submitDailyHealthParams", payload, config);

export const appDeleteAccountDeletionRequest = (payload, config = {}) => appPost("/deleteAccountDeletionRequest", payload, config);
export const appDeleteUserRequest = (payload, config = {}) => appPost("/deleteUserRequest", payload, config);

export const appFetchDialysisParametersById = (payload, config = {}) => appPost("/dialysisHealth/fetchDialysisParametersById", payload, config);
export const appGetDialysisHealthParams = (payload, config = {}) => appPost("/dialysisHealth/getDialysisHealthParams", payload, config);
export const appSubmitDialysisHealthParams = (payload, config = {}) => appPost("/dialysisHealth/submitDialysisHealthParams", payload, config);

export const appAddDietComment = (payload, config = {}) => appPost("/dietdetails/addDietComment", payload, config);
export const appFetchDietComments = (payload, config = {}) => appPost("/dietdetails/fetchDietComments", payload, config);
export const appGetPatientDiet = (payload, config = {}) => appPost("/dietdetails/getPatientDiet", payload, config);

export const appGetAilmentList = (payload, config = {}) => appPost("/getAilmentList", payload, config);
export const appGetAilmentsList = (payload, config = {}) => appPost("/getAilmentsList", payload, config);
export const appGetDoctorMessages = (payload, config = {}) => appPost("/getDoctorMessages", payload, config);
export const appGetProfileDetails = (payload, config = {}) => appPost("/getProfileDetails", payload, config);
export const appGetUnreadDoctorCmts = (config = {}) => appGet("/getUnreadDoctorCmts", config);

export const appIsAccountDeletionRequest = (payload, config = {}) => appPost("/isAccountDeletionRequest", payload, config);
export const appLogin = (payload, config = {}) => appPost("/login", payload, config);
export const appLoginV2 = (payload, config = {}) => appPost("/loginv2", payload, config);
export const appMarkCommentsAsRead = (payload, config = {}) => appPost("/markCommentsAsRead", payload, config);

export const appPrescriptionAdd = (payload, config = {}) => appPost("/prescription/addPrescription", payload, config);
export const appPrescriptionDelete = (payload, config = {}) => appPost("/prescription/deletePrescription", payload, config);
export const appPrescriptionAddComments = (payload, config = {}) => appPost("/prescription/addPrescriptionComments", payload, config);
export const appPrescriptionFetch = (payload, config = {}) => appPost("/prescription/fetchPrescription", payload, config);
export const appPrescriptionFetchComments = (payload, config = {}) => appPost("/prescription/fetchPrescriptionComments", payload, config);

export const appPushTokenUpdate = (payload, config = {}) => appPost("/pushTokenUpdate", payload, config);
export const appAnswerQuestions = (payload, config = {}) => appPost("/questions/answerQuestions", payload, config);
export const appGetQuestions = (payload, config = {}) => appPost("/questions/getQuestions", payload, config);
export const appRegisterGetDoctorCode = (payload, config = {}) => appPost("/register/getDoctorCode", payload, config);

export const appAddLabReport = (payload, config = {}) => appPost("/report/addLabReport", payload, config);
export const appAddReportComments = (payload, config = {}) => appPost("/report/addReportComments", payload, config);
export const appDeleteReport = (payload, config = {}) => appPost("/report/deleteReport", payload, config);
export const appFetchReportComments = (payload, config = {}) => appPost("/report/fetchReportComments", payload, config);
export const appUserLabReports = (payload, config = {}) => appPost("/reports/userLabReports", payload, config);

export const appAddRequisitionComments = (payload, config = {}) => appPost("/requisition/addRequisitionComments", payload, config);
export const appFetchRequisition = (payload, config = {}) => appPost("/requisition/fetchRequisition", payload, config);
export const appFetchRequisitionComments = (payload, config = {}) => appPost("/requisition/fetchRequisitionComments", payload, config);

export const appSendPushNotification = (payload, config = {}) => appPost("/sendPushNotification", payload, config);
export const appUpdateUserAilments = (payload, config = {}) => appPost("/updateUserAilments", payload, config);
export const appUserFeedback = (payload, config = {}) => appPost("/userFeedback", payload, config);

