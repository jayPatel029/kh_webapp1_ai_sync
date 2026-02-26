import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPermissions } from "../redux/permissionSlice";
import { identifyRole } from "../ApiCalls/authapis";
import { notifyError } from "../helpers/notify";
import { reportError } from "../helpers/errors/reportError";

const ProtectedRoute = ({ routeName, children }) => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.permission);
  const token = localStorage.getItem("token");

  const permissionMap = {
    CreateAdmin: "createAdmin",
    AlimentMaster: "ailmentMaster",
    ChangePassword: "changePassword",
    DailyReadings: "dailyReadings",
    DialysisReadings: "dialysisReadings",
    ProfileQuestions: "profileQuestions",
    UserProgramSelection: "userProgramSelection",
    Patient: "patients",
    UserRoles: "manageRoles",
    DoctorManagement: "createDoctor",
    ShowAlarms: "patients",
    ManageParameters: "patients",
    Userprescription: "patients",
    UserLabReports: "patients",
    UserDietDetails: "patients",
    UserRequisition: "patients",
    AdminChat: "patients",
    DoctorChat: "patients",
    LanguageMaster: "createAdmin",
    ContactUsPage: "feedback",
    logs: "changePassword",
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await identifyRole();
        if (response.success) {
          dispatch(setPermissions(response.data.data));
        }
      } catch (error) {
        reportError(error, { source: 'ProtectedRoute' });
        notifyError(error);
      }
    }
    fetchData();
  }, []);

  if (!token) {
    return <Navigate to="/doctorLogin" replace />;
  }

  const permissionKey = permissionMap[routeName];

  // allow Admin and PSadmin to access patient-related routes even when permission bits are 0
  const roleName = role?.role_name;
  const isAdminRole = roleName === "Admin" || roleName === "PSadmin";

  // bypass permission check for patient routes for admin roles
  if (permissionKey === "patients" && isAdminRole) {
    return children;
  }

  if (permissionKey && !(role?.[permissionKey] > 0)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
