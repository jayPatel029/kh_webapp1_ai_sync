// Central export barrel for ApiCalls
export * from './adminDashApis';
export * from './ailmentApis';
export * from './alarmsApis';
export { 
  getAlerts as getAlertsNotifications,
  approveAlert,
  approveAllAlerts,
  dissapproveAlert,
  dissapproveAllAlerts,
  createMessageAlert,
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
} from './alertsApis';
export * from './analyticsApis';
export * from './appAlerts';
export * from './appApis';
export * from './bedManagementApis';
export * from './dialysisTechnicianApis';
export * from './authapis';
export * from './chatApis';
export * from './commentApi';
export * from './contactus';
export * from './dataUpload';
export * from './doctorAlert';
export * from './doctorApis';
export * from './GetComments';
export * from './languageApis';
export * from './manageparameters';
export * from './patientAPis';
export * from './prescriptionApis';
export * from './questionApis';
export * from './readingsApis';
export * from './adminPatientApis';
export * from './ailmentPatientApis';
export * from './doctorPatientApis';
export * from './remainingApis';
export * from './immunizationApis';
export * from './clinicApis';
export * from './dialysisSessionApis';
