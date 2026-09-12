import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPermissions } from "../redux/permissionSlice";
import { identifyRole } from "../ApiCalls/authapis";
import { notifyError } from "../helpers/notify";
import { reportError } from "../helpers/errors/reportError";
import { canAccessRoute } from "./permissions";

const ProtectedRoute = ({ routeName, children }) => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.permission);
  const token = localStorage.getItem("token");
  const [isRoleLoading, setIsRoleLoading] = useState(!role?.isLoaded);

  useEffect(() => {
    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[auth] ProtectedRoute redirect: missing token", {
          routeName,
          pathname: window.location.pathname,
        });
      }
      setIsRoleLoading(false);
      return;
    }

    if (role?.isLoaded) {
      setIsRoleLoading(false);
      return;
    }

    async function fetchData() {
      setIsRoleLoading(true);
      try {
        const response = await identifyRole();
        if (response.success) {
          dispatch(setPermissions(response.data.data));
        } else if (process.env.NODE_ENV !== "production") {
          console.warn("[auth] ProtectedRoute identifyRole failed", {
            routeName,
            pathname: window.location.pathname,
            error: response.error,
          });
        }
      } catch (error) {
        reportError(error, { source: 'ProtectedRoute' });
        notifyError(error);
      } finally {
        setIsRoleLoading(false);
      }
    }
    fetchData();
  }, [dispatch, role?.isLoaded, token]);

  if (!token) {
    return <Navigate to="/doctorLogin" replace />;
  }

  if (isRoleLoading && !role?.isLoaded) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!canAccessRoute(role, routeName)) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[auth] ProtectedRoute redirect: insufficient permissions", {
        routeName,
        pathname: window.location.pathname,
        role,
      });
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
