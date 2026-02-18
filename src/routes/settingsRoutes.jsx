import React, { lazy } from "react";

const LanguageMaster = lazy(() => import("../pages/language"));
const ChangePassword = lazy(() => import("../pages/changePassword/ChangePassword"));
const ManageParameters = lazy(() => import("../pages/ManageParameters/ManageParameters"));
const Logs = lazy(() => import("../pages/AuditLogs/Logs"));
const LogsPage = lazy(() => import("../pages/AuditLogs/patientLog"));
const DocLogPage = lazy(() => import("../pages/AuditLogs/DoctorLog"));
const AlimentMaster = lazy(() => import("../pages/alimentMaster/AlimentMaster"));

export const getSettingsRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: "settings",
    children: [
      { index: true, element: guard(<ChangePassword />, ROUTE_NAMES.CHANGE_PASSWORD) },
      { path: "language", element: guard(<LanguageMaster />, ROUTE_NAMES.LANGUAGE_MASTER) },
      { path: "password", element: guard(<ChangePassword />, ROUTE_NAMES.CHANGE_PASSWORD) },
      { path: "parameters", element: guard(<ManageParameters />, ROUTE_NAMES.PARAMETERS) },
      { path: "logs", element: guard(<Logs />, ROUTE_NAMES.SETTINGS_LOGS) },
      { path: "logs/patient", element: guard(<LogsPage />, ROUTE_NAMES.PATIENT_LOGS) },
      { path: "logs/doctor", element: guard(<DocLogPage />, ROUTE_NAMES.SETTINGS_LOGS) },
      { path: "ailments", element: guard(<AlimentMaster />, ROUTE_NAMES.CHANGE_PASSWORD) },
    ],
  },
];
