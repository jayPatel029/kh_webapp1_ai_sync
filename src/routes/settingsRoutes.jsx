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
            title="Patient users"
            subtitle="Actions made by patients"
            filename="patient_user_logs.csv"
          />,
          ROUTE_NAMES.PATIENT_LOGS
        ),
      },
      {
        path: "logs/doctor",
        element: guard(
          <ActorLogPage
            actorKind="doctor"
            title="Doctor users"
            subtitle="Actions made by doctors and medical staff"
            filename="doctor_user_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      {
        path: "logs/dt",
        element: guard(
          <ActorLogPage
            actorKind="dt"
            title="Dialysis technicians"
            subtitle="Actions made by dialysis technicians"
            filename="dt_user_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      {
        path: "logs/admin",
        element: guard(
          <ActorLogPage
            actorKind="admin"
            title="Admin users"
            subtitle="Actions made by clinic admins"
            filename="admin_user_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      {
        path: "logs/records/patient",
        element: guard(
          <ActorLogPage
            recordType="patient"
            title="Patient records"
            subtitle="Changes made to patient profiles, labs, and prescriptions"
            filename="patient_record_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      {
        path: "logs/records/doctor",
        element: guard(
          <ActorLogPage
            recordType="doctor"
            title="Doctor records"
            subtitle="Changes made to doctor profiles"
            filename="doctor_record_logs.csv"
          />,
          ROUTE_NAMES.SETTINGS_LOGS
        ),
      },
      { path: "logs/report", element: <Navigate to={ROUTES.SETTINGS_LOGS} replace /> },
      { path: "ailments", element: guard(<AlimentMaster />, ROUTE_NAMES.AILMENTS) },
    ],
  },
];
