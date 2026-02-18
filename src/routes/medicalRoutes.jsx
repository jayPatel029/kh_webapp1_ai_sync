import React, { lazy } from "react";

const Userprescription = lazy(() => import("../pages/Userprescription/Userprescription"));
const UserLabReports = lazy(() => import("../pages/UserLabReports/UserLabReports"));
const UserDietDetails = lazy(() => import("../pages/UserDietDetails/UserDietDetails"));
const UserRequisition = lazy(() => import("../pages/UserRequisition/UserRequisition"));
const AdminChat = lazy(() => import("../pages/adminchat/AdminChat"));
const DoctorChat = lazy(() => import("../pages/doctorChat"));

export const getMedicalRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: "medical",
    children: [
      { path: "prescriptions", element: guard(<Userprescription />, ROUTE_NAMES.PRESCRIPTIONS) },
      { path: "labs", element: guard(<UserLabReports />, ROUTE_NAMES.LABS) },
      { path: "diet", element: guard(<UserDietDetails />, ROUTE_NAMES.DIET) },
      { path: "requisitions", element: guard(<UserRequisition />, ROUTE_NAMES.REQUISITIONS) },
    ],
  },
  {
    path: "chat",
    children: [
      { path: "admin", element: guard(<AdminChat />, ROUTE_NAMES.ADMIN_CHAT) },
      { path: "doctor", element: guard(<DoctorChat />, ROUTE_NAMES.DOCTOR_CHAT) },
    ],
  },
];
