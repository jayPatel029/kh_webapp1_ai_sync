import React, { Suspense, lazy } from "react";
import { Navigate, useParams, useRoutes } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../helpers/ProtectedRoute";
import { ROUTES, ROUTE_NAMES } from "./routeConstants";
import { getPatientRoutes } from "./patientRoutes";
import { getUserRoutes } from "./userRoutes";
import { getMedicalRoutes } from "./medicalRoutes";
import { getSettingsRoutes } from "./settingsRoutes";
import { getReadingRoutes } from "./readingRoutes";
import { getDialysisRoutes } from "./dialysisRoutes";

const Login = lazy(() => import("../pages/login/Login"));
const DoctorLogin = lazy(() => import("../pages/doctorLogin/DoctorLogin"));
const ForgotPassword = lazy(() => import("../pages/forgotpassword"));
const AdminDashboard = lazy(() => import("../pages/adminDashboard/AdminDashboard"));
const DoctorDashboard = lazy(() => import("../pages/doctorDashboard/DoctorDashboard"));
const ContactUsPage = lazy(() => import("../pages/contactus/contactpage"));
const ContactUs = lazy(() => import("../pages/contactus/singleContact"));
const AiChat = lazy(() => import("../pages/AIChat/AiChat"));
const Kfre = lazy(() => import("../pages/kfre/Kfre"));
const KfreSingle = lazy(() => import("../pages/kfre/KfreSingle"));
const DoctorReport = lazy(() => import("../pages/doctorReport/DoctorReport"));
const UserListManage = lazy(() => import("../components/UserListAdmin/UserListManage"));
const UserMedicalTeam = lazy(() => import("../components/UserListAdmin/UserMedicalTeam"));
const PatientAlertsByType = lazy(() => import("../pages/PatientAlertsByType"));
const CommentsDemoPage = lazy(() => import("../pages/CommentsDemoPage"));
const AddPatientFormTestPage = lazy(() => import("../pages/patient/AddPatientFormTestPage"));
const GlobalChatsPage = lazy(() => import("../pages/chats/GlobalChatsPage"));
const ClinicManagement = lazy(() => import("../pages/clinicManagement/ClinicManagement"));

const RouteFallback = () => <div className="p-6">Loading...</div>;

const withSuspense = (node) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;

const RoleGuard = ({ children, allowedRoles }) => {
  const roleName = useSelector((state) => state.permission?.role_name);

  if (!allowedRoles?.length) {
    return children;
  }

  if (allowedRoles.includes(roleName)) {
    return children;
  }

  return <Navigate to={ROUTES.DASHBOARD} replace />;
};

const ProtectedElement = ({ children, routeName, allowedRoles }) => {
  return (
    <ProtectedRoute routeName={routeName}>
      <RoleGuard allowedRoles={allowedRoles}>{children}</RoleGuard>
    </ProtectedRoute>
  );
};

const LegacyParamRedirect = ({ buildTo }) => {
  const params = useParams();
  return <Navigate to={buildTo(params)} replace />;
};

const guard = (node, routeName, allowedRoles) =>
  withSuspense(
    <ProtectedElement routeName={routeName} allowedRoles={allowedRoles}>
      {node}
    </ProtectedElement>
  );

const getLegacyRedirectRoutes = () => [
  { path: "", element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  { path: "create-admin", element: <Navigate to={ROUTES.USERS_ADMINS} replace /> },
  { path: "createDoctor", element: <Navigate to={ROUTES.USERS_DOCTORS} replace /> },
  { path: "create-doctor", element: <Navigate to={ROUTES.USERS_DOCTORS} replace /> },
  { path: "manageRoles", element: <Navigate to={ROUTES.USERS_ROLES} replace /> },
  { path: "add-role", element: <Navigate to={ROUTES.USERS_ROLES} replace /> },
  {
    path: "edit-role/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.roleDetail(id)} />,
  },
  { path: "ailments", element: <Navigate to={ROUTES.SETTINGS_AILMENTS} replace /> },
  { path: "userProgramSelection", element: <Navigate to={ROUTES.PROGRAMS} replace /> },
  {
    path: "userProgramSelection/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.programDetail(id)} />,
  },
  { path: "profileQuestions", element: <Navigate to={ROUTES.PROFILE_QUESTIONS} replace /> },
  { path: "ProfileQuestionCsv", element: <Navigate to={ROUTES.PROFILE_QUESTIONS_IMPORT} replace /> },

  { path: "patient", element: <Navigate to={ROUTES.PATIENTS} replace /> },
  { path: "Addpatient", element: <Navigate to={ROUTES.PATIENTS} replace /> },
  { path: "DeletedPatient", element: <Navigate to={ROUTES.PATIENTS_DELETED} replace /> },
  {
    path: "Deletepatient/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => `${ROUTES.patientDetail(id)}/delete`} />,
  },
  {
    path: "patients/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.patientDetail(id)} />,
  },
  {
    path: "showalarms/:pid",
    element: <LegacyParamRedirect buildTo={({ pid }) => ROUTES.patientAlarms(pid)} />,
  },
  {
    path: "ShowAlarms/:pid",
    element: <LegacyParamRedirect buildTo={({ pid }) => ROUTES.patientAlarms(pid)} />,
  },
  {
    path: "manageparameters/:pid",
    element: <LegacyParamRedirect buildTo={({ pid }) => ROUTES.patientParameters(pid)} />,
  },
  { path: "Patientlogs", element: <Navigate to={ROUTES.SETTINGS_LOGS_PATIENT} replace /> },
  { path: "Doclogs", element: <Navigate to={ROUTES.SETTINGS_LOGS_DOCTOR} replace /> },

  { path: "dailyReadings", element: <Navigate to={ROUTES.READINGS_DAILY} replace /> },
  { path: "dialysisReadings", element: <Navigate to={ROUTES.READINGS_DIALYSIS} replace /> },
  { path: "dailyReadingsCsv", element: <Navigate to={ROUTES.READINGS_IMPORT_DAILY} replace /> },
  { path: "DialysisReadingsCsv", element: <Navigate to={ROUTES.READINGS_IMPORT_DIALYSIS} replace /> },

  {
    path: "Userprescription/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.patientPrescriptions(id)} />,
  },
  { path: "Userprescription", element: <Navigate to={ROUTES.PATIENTS} replace /> },
  {
    path: "Userlabreports/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.patientLabs(id)} />,
  },
  { path: "Userlabreports", element: <Navigate to={ROUTES.PATIENTS} replace /> },
  {
    path: "UserDietDetails/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.patientDiet(id)} />,
  },
  {
    path: "Userrequisition/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.patientRequisitions(id)} />,
  },
  { path: "Userrequisition", element: <Navigate to={ROUTES.PATIENTS} replace /> },
  {
    path: "adminChat/:pid",
    element: <LegacyParamRedirect buildTo={({ pid }) => ROUTES.patientAdminChat(pid)} />,
  },
  {
    path: "doctorChat/:pid",
    element: <LegacyParamRedirect buildTo={({ pid }) => ROUTES.patientDoctorChat(pid)} />,
  },

  {
    path: "medical/prescriptions",
    element: <Navigate to={ROUTES.PATIENTS} replace />,
  },
  {
    path: "medical/labs",
    element: <Navigate to={ROUTES.PATIENTS} replace />,
  },
  {
    path: "medical/diet",
    element: <Navigate to={ROUTES.PATIENTS} replace />,
  },
  {
    path: "medical/requisitions",
    element: <Navigate to={ROUTES.PATIENTS} replace />,
  },
  {
    path: "chat/admin",
    element: <Navigate to={ROUTES.PATIENTS} replace />,
  },
  {
    path: "chat/doctor",
    element: <Navigate to={ROUTES.PATIENTS} replace />,
  },

  { path: "changePassword", element: <Navigate to={ROUTES.SETTINGS_PASSWORD} replace /> },
  { path: "languageMaster", element: <Navigate to={ROUTES.SETTINGS_LANGUAGE} replace /> },
  { path: "logs", element: <Navigate to={ROUTES.SETTINGS_LOGS} replace /> },
  { path: "alimentMaster", element: <Navigate to={ROUTES.SETTINGS_AILMENTS} replace /> },

  { path: "kfre", element: <Navigate to={ROUTES.REPORTS_KFRE} replace /> },
  {
    path: "kfre/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.reportsKfrePatient(id)} />,
  },
  { path: "doctorReport", element: <Navigate to={ROUTES.REPORTS_DOCTOR} replace /> },

  { path: "contactuspage", element: <Navigate to={ROUTES.SUPPORT} replace /> },
  {
    path: "contactus/:id",
    element: <LegacyParamRedirect buildTo={({ id }) => ROUTES.supportTicket(id)} />,
  },

  { path: "aiChat", element: <Navigate to={ROUTES.AI_CHAT} replace /> },
  { path: "doctorDashboard", element: <Navigate to={ROUTES.DOCTOR_DASHBOARD} replace /> },
  { path: "labReports", element: <Navigate to={ROUTES.READINGS_DAILY} replace /> },
  { path: "logout", element: <Navigate to={ROUTES.DOCTOR_LOGIN} replace /> },
];

function AppRoutes() {
  const routes = useRoutes([
    {
      path: ROUTES.LOGIN,
      element: withSuspense(<Login />),
    },
    {
      path: ROUTES.DOCTOR_LOGIN,
      element: withSuspense(<DoctorLogin />),
    },
    {
      path: ROUTES.FORGOT_PASSWORD,
      element: withSuspense(<ForgotPassword />),
    },
    {
      path: ROUTES.TEST,
      element: withSuspense(<AddPatientFormTestPage />),
    },
    {
      path: ROUTES.HOME,
      element: <MainLayout />,
      children: [
        { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
        {
          path: "dashboard",
          children: [
            {
              index: true,
              element: guard(
                <AdminDashboard />,
                ROUTE_NAMES.DASHBOARD,
                ["Admin", "PSadmin", "Doctor", "Dialysis Technician", "Medical Staff"]
              ),
            },
            {
              path: "doctor",
              element: guard(<DoctorDashboard />, "DoctorDashboard", ["Doctor", "Dialysis Technician"]),
            },
          ],
        },

        ...getPatientRoutes({ guard, ROUTE_NAMES }),
        ...getReadingRoutes({ guard, ROUTE_NAMES }),
        ...getUserRoutes({ guard, ROUTE_NAMES }),
        ...getMedicalRoutes({ guard, ROUTE_NAMES }),
        ...getSettingsRoutes({ guard, ROUTE_NAMES }),
        ...getDialysisRoutes({ guard, ROUTE_NAMES }),

        {
          path: "clinic",
          element: guard(
            <ClinicManagement />,
            ROUTE_NAMES.CLINIC_MANAGEMENT,
            ["Admin", "PSadmin"]
          ),
        },

        {
          path: "reports",
          children: [
            { index: true, element: guard(<DoctorReport />, ROUTE_NAMES.REPORTS_DOCTOR) },
            { path: "doctor", element: guard(<DoctorReport />, ROUTE_NAMES.REPORTS_DOCTOR) },
            { path: "kfre", element: guard(<Kfre />, ROUTE_NAMES.REPORTS_KFRE) },
            { path: "kfre/single", element: guard(<KfreSingle />, ROUTE_NAMES.REPORTS_KFRE) },
          ],
        },

        {
          path: "support",
          children: [
            { index: true, element: guard(<ContactUsPage />, ROUTE_NAMES.SUPPORT) },
            { path: "thread", element: guard(<ContactUs />, ROUTE_NAMES.SUPPORT) },
          ],
        },

        { path: "ai-chat", element: guard(<AiChat />, ROUTE_NAMES.AI_CHAT) },

        { path: "alerts", element: guard(<PatientAlertsByType />, "PatientAlertsByType") },

        { path: "commentsdemo", element: withSuspense(<CommentsDemoPage />) },

        {
          path: "chats",
          children: [
            { index: true, element: <Navigate to={ROUTES.GLOBAL_CHATS_ADMIN} replace /> },
            {
              path: "admin",
              element: guard(
                <GlobalChatsPage chatType="admin" />,
                ROUTE_NAMES.GLOBAL_ADMIN_CHATS,
                ["Admin", "PSadmin"]
              ),
            },
            {
              path: "doctor",
              element: guard(
                <GlobalChatsPage chatType="doctor" />,
                ROUTE_NAMES.GLOBAL_DOCTOR_CHATS,
                ["Admin", "PSadmin"]
              ),
            },
          ],
        },

        { path: "patients/:id/medical-team", element: guard(<UserMedicalTeam />, "UserMedicalTeam") },
        { path: "patients/:id/user-management", element: guard(<UserListManage />, "UserListManage") },

        ...getLegacyRedirectRoutes(),

        { path: "*", element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      ],
    },
  ]);

  return routes;
}

export default AppRoutes;
