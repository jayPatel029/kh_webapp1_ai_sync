import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "../../component-library";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import { PatientProfileShellContext } from "../common/PatientProfileShellContext";
import { getPatientGetPatientByid } from "../../ApiCalls/remainingApis";
import { identifyRole } from "../../ApiCalls/authapis";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import UserProfile from "./UserProfile";

const PatientProfilePage = () => {
  const { id: patientId } = useParams();
  const role = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();

  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPatientGetPatientByid(patientId);
        if (res?.success) setUserData(res.data?.data || {});
      } catch (e) {
        console.error(e);
      }
    };
    if (patientId) fetch();
  }, [patientId]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const roleResult = await identifyRole();
        if (roleResult?.data?.data?.role_name === "Admin") {
          const chatResult = await getAllChatsAdmin(patientId);
          if (chatResult.success) {
            const unread = chatResult.data.filter((c) => c.unreadCount > 0);
            setTotalUnreadCount(unread.reduce((acc, c) => acc + c.unreadCount, 0));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (patientId) fetchUnread();
  }, [patientId]);

  const shellValue = useMemo(() => ({
    patientId,
    userData,
    role,
    unreadAdminCount: totalUnreadCount,
    unreadDoctorCount: totalUnreadCountDoc,
    isMobile,
  }), [patientId, userData, role, totalUnreadCount, totalUnreadCountDoc, isMobile]);

  return (
    <ThemeProvider>
      <PatientProfileShellContext.Provider value={shellValue}>
        <Box className="min-w-0">
          <UserProfile />
        </Box>
      </PatientProfileShellContext.Provider>
    </ThemeProvider>
  );
};

export default PatientProfilePage;
