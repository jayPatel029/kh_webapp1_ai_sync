import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./routeConstants";

const Patient = lazy(() => import("../pages/patient/Patient"));
const UserProfile = lazy(() => import("../pages/userprofile2/UserProfile"));
const DeletePatient = lazy(() => import("../pages/patient/DeletePatient"));
const DelPatient = lazy(() => import("../pages/patient/delPatient"));
const ShowAlarms = lazy(() => import("../pages/ShowAlarms/ShowAlarms"));
const ManageParameters = lazy(() => import("../pages/ManageParameters/ManageParameters"));
const Userprescription = lazy(() => import("../pages/Userprescription/Userprescription"));
const UserLabReports = lazy(() => import("../pages/UserLabReports/UserLabReports"));
const UserDietDetails = lazy(() => import("../pages/UserDietDetails/UserDietDetails"));
const UserRequisition = lazy(() => import("../pages/UserRequisition/UserRequisition"));
const AdminChat = lazy(() => import("../pages/adminchat/AdminChat"));
const DoctorChat = lazy(() => import("../pages/doctorChat"));
const LogsPage = lazy(() => import("../pages/AuditLogs/patientLog"));
const PatientProfileRouteLayout = lazy(() => import("../pages/common/PatientProfileRouteLayout"));


export const getPatientRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: "patients",
    children: [
      { index: true, element: guard(<Patient />, ROUTE_NAMES.PATIENTS) },
      // { path: "new", element: guard(<AddPatientForm />, ROUTE_NAMES.PATIENTS) },  // replaced by modal inside Patient page
      { path: "new", element: <Navigate to={ROUTES.PATIENTS} replace /> },
      { path: "deleted", element: guard(<DelPatient />, ROUTE_NAMES.PATIENTS) },
      { path: "logs", element: guard(<LogsPage />, ROUTE_NAMES.PATIENT_LOGS) },
      { path: ":id/delete", element: guard(<DeletePatient />, ROUTE_NAMES.PATIENTS) },
    ],
  },
  {
    path: "userProfile/:id",
    element: (
      <React.Suspense fallback={<div className="p-6">Loading Profile...</div>}>
        <PatientProfileRouteLayout />
      </React.Suspense>
    ),
    children: [
      { index: true, element: guard(<UserProfile />, ROUTE_NAMES.PATIENTS) },
      { path: "alarms", element: guard(<ShowAlarms />, ROUTE_NAMES.ALARMS) },
      { path: "parameters", element: guard(<ManageParameters />, ROUTE_NAMES.PARAMETERS) },
      { path: "prescriptions", element: guard(<Userprescription />, ROUTE_NAMES.PRESCRIPTIONS) },
      { path: "labs", element: guard(<UserLabReports />, ROUTE_NAMES.LABS) },
      { path: "diet", element: guard(<UserDietDetails />, ROUTE_NAMES.DIET) },
      { path: "requisitions", element: guard(<UserRequisition />, ROUTE_NAMES.REQUISITIONS) },
      { path: "admin-chat", element: guard(<AdminChat />, ROUTE_NAMES.ADMIN_CHAT) },
      { path: "doctor-chat", element: guard(<DoctorChat />, ROUTE_NAMES.DOCTOR_CHAT) },
    ],
  },
];
