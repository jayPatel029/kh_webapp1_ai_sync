import React, { lazy } from "react";

const Patient = lazy(() => import("../pages/patient/Patient"));
const UserProfile = lazy(() => import("../pages/userprofile2/UserProfile"));
const AddPatientForm = lazy(() => import("../pages/patient/AddPatientForm"));
const DeletePatient = lazy(() => import("../pages/patient/DeletePatient"));
const DelPatient = lazy(() => import("../pages/patient/delPatient"));
const ShowAlarms = lazy(() => import("../pages/ShowAlarms/ShowAlarms"));
const ManageParameters = lazy(() => import("../pages/ManageParameters/ManageParameters"));
const LogsPage = lazy(() => import("../pages/AuditLogs/patientLog"));

export const getPatientRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: "patients",
    children: [
      { index: true, element: guard(<Patient />, ROUTE_NAMES.PATIENTS) },
      { path: "new", element: guard(<AddPatientForm />, ROUTE_NAMES.PATIENTS) },
      { path: "deleted", element: guard(<DelPatient />, ROUTE_NAMES.PATIENTS) },
      { path: "logs", element: guard(<LogsPage />, ROUTE_NAMES.PATIENT_LOGS) },
      { path: ":id", element: guard(<UserProfile />, ROUTE_NAMES.PATIENTS) },
      { path: ":id/delete", element: guard(<DeletePatient />, ROUTE_NAMES.PATIENTS) },
      { path: ":id/alarms", element: guard(<ShowAlarms />, ROUTE_NAMES.ALARMS) },
      { path: ":id/parameters", element: guard(<ManageParameters />, ROUTE_NAMES.PARAMETERS) },
    ],
  },
];
