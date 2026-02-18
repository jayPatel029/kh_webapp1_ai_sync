import React, { lazy } from "react";

const AdminManagement = lazy(() => import("../pages/adminManagement/AdminManagement"));
const DoctorManagement = lazy(() => import("../pages/adminManagement/DoctorManagement"));
const UserRoles = lazy(() => import("../pages/adminManagement/UserRoles"));
const AddRole = lazy(() => import("../pages/adminManagement/AddRole"));
const EditRole = lazy(() => import("../pages/adminManagement/EditRole"));
const UserProgramSelection = lazy(() => import("../pages/userProgramSelection/UserProgramSelection"));
const UniqueUserProgramSelection = lazy(() => import("../pages/userProgramSelection/UniqueUserProgramSelection"));
const ProfileQuestions = lazy(() => import("../pages/profileQuestion/ProfileQuestions"));

export const getUserRoutes = ({ guard, ROUTE_NAMES }) => [
  {
    path: "users",
    children: [
      { index: true, element: guard(<AdminManagement />, ROUTE_NAMES.CREATE_ADMIN) },
      { path: "admins", element: guard(<AdminManagement />, ROUTE_NAMES.CREATE_ADMIN) },
      { path: "doctors", element: guard(<DoctorManagement />, ROUTE_NAMES.CREATE_DOCTOR) },
      { path: "roles", element: guard(<UserRoles />, ROUTE_NAMES.MANAGE_ROLES) },
      { path: "roles/new", element: guard(<AddRole />, ROUTE_NAMES.MANAGE_ROLES) },
      { path: "roles/:id", element: guard(<EditRole />, ROUTE_NAMES.EDIT_ROLE) },
    ],
  },
  {
    path: "programs",
    children: [
      { index: true, element: guard(<UserProgramSelection />, ROUTE_NAMES.PROGRAMS) },
      { path: ":id", element: guard(<UniqueUserProgramSelection />, ROUTE_NAMES.PROGRAMS) },
    ],
  },
  {
    path: "profile-questions",
    children: [
      { index: true, element: guard(<ProfileQuestions />, ROUTE_NAMES.PROFILE_QUESTIONS) },
    ],
  },
];
