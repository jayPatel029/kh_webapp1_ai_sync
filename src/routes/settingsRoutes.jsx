import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./routeConstants";

const LanguageMaster = lazy(() => import("../pages/language"));
const ChangePassword = lazy(() => import("../pages/changePassword/ChangePassword"));
const ManageParameters = lazy(() => import("../pages/ManageParameters/ManageParameters"));
const Logs = lazy(() => import("../pages/AuditLogs/Logs"));
const ActorLogPage = lazy(() => import("../pages/AuditLogs/ActorLog"));
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
      {
        path: "logs/patient",
        element: guard(
          <ActorLogPage
            actorKind="patient"
            title="Patient Logs"
            subtitle="Actions taken by patients"
            filename="patient_logs.csv"
          />,
          ROUTE_NAMES.PATIENT_LOGS
        ),
      },
      {
        path: "logs/doctor",
        element: guard(
          <ActorLogPage
            actorKind="doctor"
            title="Doctor Logs"
            subtitle="Actions by doctors and medical staff"
            filename="doctor_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      {
        path: "logs/dt",
        element: guard(
          <ActorLogPage
            actorKind="dt"
            title="DT Logs"
            subtitle="Actions by dialysis technicians"
            filename="dt_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      {
        path: "logs/admin",
        element: guard(
          <ActorLogPage
            actorKind="admin"
            title="Admin Logs"
            subtitle="Actions by clinic admins"
            filename="admin_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      { path: "logs/report", element: <Navigate to={ROUTES.SETTINGS_LOGS} replace /> },
      { path: "ailments", element: guard(<AlimentMaster />, ROUTE_NAMES.AILMENTS) },
    ],
  },
];
