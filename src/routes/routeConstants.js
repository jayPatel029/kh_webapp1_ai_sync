export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  DOCTOR_DASHBOARD: "/dashboard/doctor",

  PATIENTS: "/patients",
  PATIENTS_NEW: "/patients/new",
  PATIENTS_DELETED: "/patients/deleted",
  PATIENTS_LOGS: "/patients/logs",
  USER_PROFILE: "/userProfile",
  userProfile: (id = ":id") => `/userProfile/${id}`,
  patientDetail: (id = ":id") => `/userProfile/${id}`,
  patientAlarms: (id = ":id") => `/userProfile/${id}/alarms`,
  patientParameters: (id = ":id") => `/userProfile/${id}/parameters`,
  patientPrescriptions: (id = ":id") => `/userProfile/${id}/prescriptions`,
  patientLabs: (id = ":id") => `/userProfile/${id}/labs`,
  patientDiet: (id = ":id") => `/userProfile/${id}/diet`,
  patientRequisitions: (id = ":id") => `/userProfile/${id}/requisitions`,
  patientAdminChat: (id = ":id") => `/userProfile/${id}/admin-chat`,
  patientDoctorChat: (id = ":id") => `/userProfile/${id}/doctor-chat`,

  READINGS_DAILY: "/readings/daily",
  READINGS_DIALYSIS: "/readings/dialysis",
  READINGS_IMPORT: "/readings/import",
  READINGS_IMPORT_DAILY: "/readings/import/daily",
  READINGS_IMPORT_DIALYSIS: "/readings/import/dialysis",

  USERS: "/users",
  USERS_ADMINS: "/users/admins",
  USERS_DOCTORS: "/users/doctors",
  USERS_ROLES: "/users/roles",
  roleDetail: (id = ":id") => `/users/roles/${id}`,

  PROGRAMS: "/programs",
  programDetail: (id = ":id") => `/programs/${id}`,
  PROFILE_QUESTIONS: "/profile-questions",
  PROFILE_QUESTIONS_IMPORT: "/profile-questions/import",

  MEDICAL_PRESCRIPTIONS: "/medical/prescriptions",
  MEDICAL_LABS: "/medical/labs",
  MEDICAL_DIET: "/medical/diet",
  MEDICAL_REQUISITIONS: "/medical/requisitions",
  withPatientQuery: (basePath, patientId) =>
    patientId ? `${basePath}?patientId=${patientId}` : basePath,

  CHAT_ADMIN: "/chat/admin",
  CHAT_DOCTOR: "/chat/doctor",
  chatAdmin: (patientId) =>
    patientId ? `/userProfile/${patientId}/admin-chat` : "/chat/admin",
  chatDoctor: (patientId) =>
    patientId ? `/userProfile/${patientId}/doctor-chat` : "/chat/doctor",

  SETTINGS: "/settings",
  SETTINGS_LANGUAGE: "/settings/language",
  SETTINGS_PASSWORD: "/settings/password",
  SETTINGS_PARAMETERS: "/settings/parameters",
  SETTINGS_LOGS: "/settings/logs",
  SETTINGS_LOGS_PATIENT: "/settings/logs/patient",
  SETTINGS_LOGS_DOCTOR: "/settings/logs/doctor",
  SETTINGS_AILMENTS: "/settings/ailments",

  REPORTS: "/reports",
  REPORTS_DOCTOR: "/reports/doctor",
  REPORTS_KFRE: "/reports/kfre",
  reportsKfrePatient: (patientId) =>
    patientId ? `/reports/kfre?patientId=${patientId}` : "/reports/kfre",

  SUPPORT: "/support",
  supportTicket: (id) => (id ? `/support?id=${id}` : "/support"),

  AI_CHAT: "/ai-chat",

  LOGIN: "/login",
  DOCTOR_LOGIN: "/doctorLogin",
  FORGOT_PASSWORD: "/forgotpassword",
  LOGOUT: "/logout",
};

export const ROUTE_NAMES = {
  DASHBOARD: "AdminDashboard",
  CREATE_ADMIN: "CreateAdmin",
  CREATE_DOCTOR: "DoctorManagement",
  MANAGE_ROLES: "UserRoles",
  EDIT_ROLE: "EditRole",
  LANGUAGE_MASTER: "LanguageMaster",
  CHANGE_PASSWORD: "ChangePassword",
  PATIENTS: "Patient",
  PATIENT_LOGS: "Patientlogs",
  PROGRAMS: "UserProgramSelection",
  PROFILE_QUESTIONS: "ProfileQuestions",
  DAILY_READINGS: "DailyReadings",
  DIALYSIS_READINGS: "DialysisReadings",
  PRESCRIPTIONS: "Userprescription",
  LABS: "UserLabReports",
  DIET: "UserDietDetails",
  REQUISITIONS: "UserRequisition",
  ALARMS: "ShowAlarms",
  PARAMETERS: "ManageParameters",
  ADMIN_CHAT: "AdminChat",
  DOCTOR_CHAT: "DoctorChat",
  REPORTS_KFRE: "kfre",
  REPORTS_DOCTOR: "doctorReport",
  AI_CHAT: "aiChat",
  SUPPORT: "ContactUsPage",
  SETTINGS_LOGS: "logs",
};

export const SIDEBAR_ROUTE_CONFIG = [
  { id: "dashboard", label: "Admin Dashboard", href: ROUTES.DASHBOARD, permission: null },
  { id: "patients", label: "Patients", href: ROUTES.PATIENTS, permission: "patients" },
  { id: "profileQuestions", label: "Profile Questions", href: ROUTES.PROFILE_QUESTIONS, permission: "profileQuestions" },
  { id: "dailyReadings", label: "Daily Readings", href: ROUTES.READINGS_DAILY, permission: "dailyReadings" },
  { id: "dialysisReadings", label: "Dialysis Readings", href: ROUTES.READINGS_DIALYSIS, permission: "dialysisReadings" },
  { id: "programs", label: "User Program", href: ROUTES.PROGRAMS, permission: "userProgramSelection" },
  { id: "support", label: "Patient Feedback", href: ROUTES.SUPPORT, permission: "feedback" },
  { id: "settingsLanguage", label: "Language Master", href: ROUTES.SETTINGS_LANGUAGE, permission: "createAdmin" },
  { id: "settingsPassword", label: "Change Password", href: ROUTES.SETTINGS_PASSWORD, permission: "changePassword" },
  { id: "settingsLogs", label: "Audit Logs", href: ROUTES.SETTINGS_LOGS, permission: "changePassword" },
];
