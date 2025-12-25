import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPermissions } from "../redux/permissionSlice";
import { identifyRole } from "../ApiCalls/authapis";
import { useEffect } from "react";

const ProtectedRoute = ({ routeName, children }) => {
  const navigator = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.permission);
  const token = localStorage.getItem("token");

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
    return <Navigate to="/doctorLogin" />;
  } else {
    switch (routeName) {
      case "CreateAdmin":
        if (role.createAdmin > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "AlimentMaster":
        if (role.ailmentMaster > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "ChangePassword":
        if (role.changePassword > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "DailyReadings":
        if (role.dailyReadings > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "DialysisReadings":
        if (role.dialysisReadings > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "ProfileQuestions":
        if (role.profileQuestions > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "UserProgramSelection":
        if (role.userProgramSelection > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      case "Patient":
        if (role.patients > 0) {
          return children;
        } else {
          navigator("/login");
        }
        break;
      default:
        return children;
    }
  }
};

export default ProtectedRoute;
