import React from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPermissions } from "../redux/permissionSlice";
import { identifyRole } from "../ApiCalls/authapis";
import { useEffect } from "react";

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
        console.error(error.message);
      }
    }
    fetchData();
  }, []);

  if (!token) {
    return <Navigate to="/doctorLogin" replace />;
  }

  const permissionKey = permissionMap[routeName];

  if (permissionKey && !(role?.[permissionKey] > 0)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
