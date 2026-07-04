import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "../../component-library";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import PageSkeleton from "../../components/PageSkeleton";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";
import { PatientProfileShellContext } from "../common/PatientProfileShellContext";
import { getPatientGetPatientByid } from "../../ApiCalls/remainingApis";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { PAGE_CACHE, usePageCache } from "../../cache";
import UserProfile from "./UserProfile";
import { isRole } from '../../helpers/roleUtils';

const PatientProfilePage = () => {
  const { id: patientId } = useParams();
  const role = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();
  const { fetchWithCache, refreshKey } = usePageCache(PAGE_CACHE.PATIENT_DETAIL);
  const isAdmin = isRole(role, 'Admin');

  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const profileResult = await fetchWithCache(
          `patient-${patientId}`,
          () => getPatientGetPatientByid(patientId, { requestDelayMs: 50 }),
          {
            transform: (apiData) => apiData?.data || {},
          },
        );

        if (profileResult?.success) {
          setUserData(profileResult.data || {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchUnread = async () => {
      if (!isAdmin) {
        setTotalUnreadCount(0);
        return;
      }
      try {
        const chatResult = await fetchWithCache(
          `admin-chats-${patientId}`,
          () => getAllChatsAdmin(patientId),
          {
            ttl: 30 * 1000,
            transform: (apiData) => (Array.isArray(apiData) ? apiData : []),
          },
        );

        if (chatResult.success) {
          const unread = chatResult.data.filter((c) => c.unreadCount > 0);
          setTotalUnreadCount(unread.reduce((acc, c) => acc + c.unreadCount, 0));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchProfile();
    fetchUnread();
  }, [patientId, fetchWithCache, refreshKey, isAdmin]);

  const shellValue = useMemo(() => ({
    patientId,
    userData,
    role,
    unreadAdminCount: totalUnreadCount,
    unreadDoctorCount: totalUnreadCountDoc,
    isMobile,
  }), [patientId, userData, role, totalUnreadCount, totalUnreadCountDoc, isMobile]);

  if (profileLoading) {
    return <PageSkeleton variant="detail" />;
  }

  return (
    <ThemeProvider>
      <PatientProfileShellContext.Provider value={shellValue}>
        <Box className="min-w-0">
          <Box className="flex justify-end mb-4">
            <RefreshButton pageName={PAGE_CACHE.PATIENT_DETAIL.name} />
          </Box>
          <UserProfile />
        </Box>
      </PatientProfileShellContext.Provider>
    </ThemeProvider>
  );
};

export default PatientProfilePage;
