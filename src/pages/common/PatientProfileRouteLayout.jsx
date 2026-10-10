import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { Box } from "../../component-library";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";

import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url, adminEmail } from "../../constants/constants";
import { getAllChats, getAllChatsAdmin } from "../../ApiCalls/chatApis";
import { normalizeRole } from "../../helpers/roleUtils";
import { ROUTES } from "../../routes/routeConstants";
import { PatientProfileShellContext } from "./PatientProfileShellContext";

const normEmail = (email) => String(email || "").trim().toLowerCase();
const sameEmail = (a, b) => normEmail(a) !== "" && normEmail(a) === normEmail(b);
const isAdminRole = (role) => ["admin", "psadmin"].includes(normalizeRole(role));

const chatRows = (res) => (res?.success && Array.isArray(res.data) ? res.data : []);
// unreadCount = messages from others in that chat not yet marked read.
const sumUnread = (rows) => rows.reduce((acc, chat) => acc + (Number(chat.unreadCount) || 0), 0);
const isAdminThread = (chat) =>
    sameEmail(chat.user1, adminEmail) || sameEmail(chat.user2, adminEmail) || isAdminRole(chat.role);

const EMPTY_UNREAD = { admin: 0, doctor: 0 };

const PatientProfileRouteLayout = () => {
    const { id: patientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const role = useSelector((state) => state.permission);
    const { isMobile } = useIsMobile();

    const [userData, setUserData] = useState({});
    // "loading" until the current patient's first response; "error" only if that first load fails.
    const [patientStatus, setPatientStatus] = useState("loading");
    const patientRequestRef = useRef(0);
    const [unreadCounts, setUnreadCounts] = useState(EMPTY_UNREAD);
    const unreadRequestRef = useRef(0);

    const refreshPatient = useCallback(async () => {
        const requestId = ++patientRequestRef.current;
        const isCurrent = () => patientRequestRef.current === requestId;
        try {
            const response = await axiosInstance.get(`${server_url}/patient/getPatient/${patientId}`);
            const patient = response.data?.data || {};
            if (isCurrent()) {
                setUserData(patient);
                setPatientStatus("ready");
            }
            return patient;
        } catch (error) {
            console.error("Error fetching patient data:", error);
            if (isCurrent()) setPatientStatus((status) => (status === "ready" ? status : "error"));
            return null;
        }
    }, [patientId]);

    // The layout stays mounted across patients, so drop the previous patient's data first.
    const reloadPatient = useCallback(() => {
        setUserData({});
        setPatientStatus("loading");
        return refreshPatient();
    }, [refreshPatient]);

    useEffect(() => {
        reloadPatient();
    }, [reloadPatient]);

    const refreshUnreadCounts = useCallback(async () => {
        if (!patientId || !normalizeRole(role)) return;
        const requestId = ++unreadRequestRef.current;

        // /chat/admin returns the patient's single shared Admin Team thread.
        let counts;
        if (isAdminRole(role)) {
            // Admins only view doctor↔doctor threads read-only, so only the admin side counts.
            counts = { admin: sumUnread(chatRows(await getAllChatsAdmin(patientId))), doctor: 0 };
        } else {
            const [adminRes, ownRes] = await Promise.all([
                getAllChatsAdmin(patientId),
                getAllChats(patientId),
            ]);
            counts = {
                admin: sumUnread(chatRows(adminRes)),
                doctor: sumUnread(chatRows(ownRes).filter((chat) => !isAdminThread(chat))),
            };
        }

        if (unreadRequestRef.current === requestId) setUnreadCounts(counts);
    }, [patientId, role]);

    useEffect(() => {
        setUnreadCounts(EMPTY_UNREAD);
    }, [patientId]);

    // Re-count on tab switches so messages read in a chat tab drop off the badges.
    useEffect(() => {
        refreshUnreadCounts();
    }, [refreshUnreadCounts, location.pathname]);

    const shellValue = useMemo(
        () => ({
            patientId,
            userData,
            patientStatus,
            refreshPatient,
            reloadPatient,
            role,
            unreadAdminCount: unreadCounts.admin,
            unreadDoctorCount: unreadCounts.doctor,
            refreshUnreadCounts,
            isMobile,
        }),
        [patientId, userData, patientStatus, refreshPatient, reloadPatient, role, unreadCounts, refreshUnreadCounts, isMobile]
    );

    return (
        <ThemeProvider>
            <PatientProfileShellContext.Provider value={shellValue}>
                <Box className="flex-1 flex flex-col min-w-0">
                    <Box className={`sticky ${isMobile ? "top-0" : "top-[112px]"} z-20 bg-white`}>
                        <PageHeader
                            title={
                                <>
                                    {userData?.name || "Patient"}{" "}
                                    <span className="whitespace-nowrap text-lg font-semibold">
                                        (
                                        <button
                                            type="button"
                                            onClick={() => startTransition(() => navigate(ROUTES.patientDetail(patientId)))}
                                            className="text-primary hover:underline cursor-pointer"
                                        >
                                            Profile
                                        </button>
                                        )
                                    </span>
                                </>
                            }
                            className={`${isMobile ? "top-0" : "top-[112px]"}`}
                            variant={isMobile ? "mobile" : "desktop"}
                            breadcrumbs={[]}
                            onBack={() => startTransition(() => navigate(ROUTES.PATIENTS))}
                        />
                        <PatientNavTabs
                            patientId={patientId}
                            userData={userData}
                            unreadAdminCount={unreadCounts.admin}
                            unreadDoctorCount={unreadCounts.doctor}
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
