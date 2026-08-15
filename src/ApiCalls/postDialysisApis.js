import axiosInstance from '../helpers/axios/axiosInstance';
import { server_url } from '../constants/constants';

const p4Path = (path) => `${server_url}/dt${path}`;

async function p4Request(method, path, payload, config = {}) {
  try {
    const response = await axiosInstance[method](p4Path(path), ...(payload === undefined ? [config] : [payload, config]));
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data || error.message };
  }
}

export const terminateSession = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/terminate`, payload, config);
export const saveHemostasis = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/hemostasis`, payload, config);
export const savePostDialysisVitals = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/post-vitals`, payload, config);
export const getTreatmentOutcome = (sessionId, config) => p4Request('get', `/sessions/${sessionId}/outcome`, undefined, config);
export const calculateKtV = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/kt-v`, payload, config);
export const saveTreatmentOutcome = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/outcome`, payload, config);
export const getSessionMedications = (sessionId, config) => p4Request('get', `/sessions/${sessionId}/medications`, undefined, config);
export const saveFollowUp = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/followup`, payload, config);
export const saveMachineCleaning = (machineId, payload, config) => p4Request('post', `/machines/${machineId}/cleaning`, payload, config);
export const getMachineReadinessSummary = (machineId, config) => p4Request('get', `/machines/${machineId}/readiness-summary`, undefined, config);
export const saveInfectionControlPost = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/infection-control-post`, payload, config);
export const getDischargeReadiness = (sessionId, config) => p4Request('get', `/sessions/${sessionId}/discharge-readiness`, undefined, config);
export const saveDischarge = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/discharge`, payload, config);
export const saveSessionDocumentation = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/documentation`, payload, config);
export const saveSessionSignoff = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/signoff`, payload, config);
export const sendPhysicianNotification = (sessionId, payload = {}, config) => p4Request('post', `/sessions/${sessionId}/notify-physician/send`, payload, config);
export const getCompleteSummary = (sessionId, config) => p4Request('get', `/sessions/${sessionId}/complete-summary`, undefined, config);
export const savePatientFeedback = (sessionId, payload, config) => p4Request('post', `/sessions/${sessionId}/patient-feedback`, payload, config);
export const closeSession = (sessionId, payload = {}, config) => p4Request('post', `/sessions/${sessionId}/close`, payload, config);

export default {
  terminateSession,
  saveHemostasis,
  savePostDialysisVitals,
  getTreatmentOutcome,
  calculateKtV,
  saveTreatmentOutcome,
  getSessionMedications,
  saveFollowUp,
  saveMachineCleaning,
  getMachineReadinessSummary,
  saveInfectionControlPost,
  getDischargeReadiness,
  saveDischarge,
  saveSessionDocumentation,
  saveSessionSignoff,
  sendPhysicianNotification,
  getCompleteSummary,
  savePatientFeedback,
  closeSession,
};
