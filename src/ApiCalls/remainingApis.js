import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

// Auto-generated wrappers for documented endpoints not yet covered in existing ApiCalls modules.

export async function getHealth(config = {}) {
  try {
    const baseUrl = server_url.replace(/\/api$/, "");
    const response = await axiosInstance.get(baseUrl + "/health", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postDailyAlertsAddDailyReadingsAlerts(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/dailyAlerts/AddDailyReadingsAlerts", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postDailyAlertsAddDialysisReadingsAlerts(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/dailyAlerts/AddDialysisReadingsAlerts", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postDailyAlertsUpdateIsRead(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/dailyAlerts/updateIsRead", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteDietdetailsDeleteDietDetailsByid(id, payload, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/dietdetails/deleteDietDetails/${id}`, payload ? { ...config, data: payload } : config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDietdetailsGetPatientDietDetailsAdminByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/dietdetails/getPatientDietDetailsAdmin/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postDietdetailsInsertDietDetails(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/dietdetails/insertDietDetails", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postDietdetailsInsertDietDetailsAdmin(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/dietdetails/insertDietDetailsAdmin", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorAnalyticsGetAdherenceMedicine(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/doctorAnalytics/getAdherenceMedicine", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorAnalyticsGetPatientsByAge(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/doctorAnalytics/getPatientsByAge", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorAnalyticsGetPatientsByDoctorId(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/doctorAnalytics/getPatientsByDoctorId", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorAnalyticsGetPatientsByGender(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/doctorAnalytics/getPatientsByGender", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getDoctorAnalyticsGetPercentageReturn(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/doctorAnalytics/getPercentageReturn", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingDialysisAdd(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadingDialysis/add", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingDialysisDelete(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadingDialysis/delete", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingDialysisGet(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/graphReadingDialysis/get", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingDialysisGetGraph(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/graphReadingDialysis/getGraph", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingDialysisUpdate(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadingDialysis/update", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingsAdd(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadings/add", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingsAddDiaSys(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadings/add/dia/sys", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingsAddSys(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadings/add/sys", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingsDelete(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadings/delete", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingsGet(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/graphReadings/get", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingsGetDiaSys(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/graphReadings/get/dia/sys", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingsGetDiaSysidBydiastolicTitle(diastolicTitle, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/graphReadings/get/dia/sysid/${diastolicTitle}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingsGetSys(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/graphReadings/get/sys", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getGraphReadingsGetSysidBydiastolicTitle(diastolicTitle, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/graphReadings/get/sysid/${diastolicTitle}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postGraphReadingsUpdate(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/graphReadings/update", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteLabreportByid(id, payload, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/labreport/${id}`, payload ? { ...config, data: payload } : config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportBypatient(patient, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/labreport/${patient}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postLabreportAddBulkIndividual(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/labreport/addBulkIndividual", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postLabreportAddLabReading(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/labreport/addLabReading", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postLabreportConfirm(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/labreport/confirm", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteLabreportDeleteLabReadingByid(id, payload, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/labreport/deleteLabReading/${id}`, payload ? { ...config, data: payload } : config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteLabreportDeleteLabReportByid(id, payload, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/labreport/deleteLabReport/${id}`, payload ? { ...config, data: payload } : config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postLabreportExtract(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/labreport/extract", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportGetColumnNames(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/labreport/getColumnNames", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportGetLabReportByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/labreport/getLabReport/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportGetLabReportsByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/labreport/getLabReports/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportLabReadings(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/labreport/LabReadings", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportLabReadings2(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/labreport/LabReadings", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportRange(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/labreport/range", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getLabreportResponses(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/labreport/responses", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function putLabreportUpdateLabReadingTitleByreadingId(readingId, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/labreport/updateLabReadingTitle/${readingId}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postMailSentotp(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/mail/sentotp", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postMailVerifyOtp(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/mail/verifyOtp", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postModuleRoutesConnectDoctor(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/moduleRoutes/connectDoctor", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postModuleRoutesConnectPatient(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/moduleRoutes/connectPatient", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getModuleRoutesGetLabR(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/moduleRoutes/getLabR", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getModuleRoutesGetPresc(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/moduleRoutes/getPresc", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getModuleRoutesGetVitals(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/moduleRoutes/getVitals", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postNotifsPushNotifs(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/notifs/pushNotifs", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postPatientAddPatient(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/patient/AddPatient", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientGetAdminTeamByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/patient/getAdminTeam/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientGetMedicalTeamByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/patient/getMedicalTeam/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientGetNameByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/patient/getName/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientGetPatientByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/patient/getPatient/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getPatientGetPatients(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/patient/getPatients", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getRequisitionByIdByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/requisition/byId/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getRequisitionGetRequisitionByid(id, config = {}) {
  try {
    const response = await axiosInstance.get(`${server_url}/requisition/getRequisition/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postTeleconsultationBookAppointment(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/teleconsultation/bookAppointment", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getTeleconsultationGetAllAppointmentsById(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/teleconsultation/getAllAppointmentsById", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getTempRoutesBp(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/tempRoutes/bp", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postTempRoutesBp(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/tempRoutes/bp", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function deleteTempRoutesBpByid(id, payload, config = {}) {
  try {
    const response = await axiosInstance.delete(`${server_url}/tempRoutes/bp/${id}`, payload ? { ...config, data: payload } : config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function putTempRoutesBpByid(id, payload, config = {}) {
  try {
    const response = await axiosInstance.put(`${server_url}/tempRoutes/bp/${id}`, payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getTempRoutesBpLimits(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/tempRoutes/bp/limits", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postTempRoutesBpLimits(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/tempRoutes/bp/limits", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function putTempRoutesBpLimits(payload, config = {}) {
  try {
    const response = await axiosInstance.put(server_url + "/tempRoutes/bp/limits", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUserRangeGetRange(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/userRange/getRange", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUserRangeGetRangeDiaSys(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/userRange/getRange/dia/sys", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUserRangeGetRangeSys(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/userRange/getRange/sys", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postUserRangeSetRange(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/userRange/setRange", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postUserRangeSetRangeDiaSys(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/userRange/setRange/dia/sys", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postUserRangeSetRangeSys(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/userRange/setRange/sys", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUserRangeDialysisGetRange(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/userRangeDialysis/getRange", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postUserRangeDialysisSetRange(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/userRangeDialysis/setRange", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function getUserResponsesGetResponses(config = {}) {
  try {
    const response = await axiosInstance.get(server_url + "/userResponses/getResponses", config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export async function postUserResponsesSave(payload, config = {}) {
  try {
    const response = await axiosInstance.post(server_url + "/userResponses/save", payload, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}
