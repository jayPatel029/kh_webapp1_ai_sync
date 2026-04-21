import React, { useEffect, useMemo, useState, startTransition } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { Box } from "../../component-library";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";

import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { ROUTES } from "../../routes/routeConstants";
import { PatientProfileShellContext } from "./PatientProfileShellContext";

const PatientProfileRouteLayout = () => {
    const { id: patientId } = useParams();
    const navigate = useNavigate();
    const role = useSelector((state) => state.permission);
    const { isMobile } = useIsMobile();

    const [userData, setUserData] = useState({});
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await axiosInstance.get(`${server_url}/patient/getPatient/${patientId}`);
                setUserData(response.data.data || {});
            } catch (error) {
                console.error("Error fetching patient data:", error);
            }
        };

        fetchPatientData();
    }, [patientId]);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const chatResult = await getAllChatsAdmin(patientId);
                if (chatResult.success) {
                    const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
                    setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
                }
            } catch (error) {
                console.error("Error fetching unread messages:", error);
            }
        };

        fetchUnreadMessages();
    }, [patientId]);

    const shellValue = useMemo(
        () => ({
            patientId,
            userData,
            role,
            unreadAdminCount: totalUnreadCount,
            unreadDoctorCount: totalUnreadCountDoc,
            isMobile,
        }),
        [patientId, userData, role, totalUnreadCount, totalUnreadCountDoc, isMobile]
    );

    return (
        <ThemeProvider>
            <PatientProfileShellContext.Provider value={shellValue}>
                <Box className="flex-1 flex flex-col min-w-0">
                    <Box className={`sticky ${isMobile ? "top-0" : "top-[112px]"} z-20 bg-white`}>
                        <PageHeader
                            title={userData?.name || "Patient"}
                            className={`${isMobile ? "top-0" : "top-[112px]"}`}
                            variant={isMobile ? "mobile" : "desktop"}
                            breadcrumbs={[
                                { label: "Patient  /", path: ROUTES.patientDetail(patientId), active: false },
                                // { label: userData?.name || "Patient", active: true },
                            ]}
                            onBack={() => startTransition(() => navigate(ROUTES.PATIENTS))}
                        />
                        <PatientNavTabs
                            patientId={patientId}
                            userData={userData}
                            unreadAdminCount={totalUnreadCount}
                            unreadDoctorCount={totalUnreadCountDoc}
                            role={role}
                            className={isMobile ? "px-4" : "px-8"}
                        />
                    </Box>

                    <Outlet />
                </Box>
            </PatientProfileShellContext.Provider>
        </ThemeProvider>
    );
};

export default PatientProfileRouteLayout;
