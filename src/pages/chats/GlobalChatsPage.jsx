/**
 * GlobalChatsPage
 * Alert-driven chat overview:
 * staff grouped first, then patient tables sourced from chat alerts.
 */

import React, { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronRight, FiUsers, FiSearch } from "react-icons/fi";
import ReactLoading from "react-loading";

import { Box } from "../../component-library";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

import { getPatients } from "../../ApiCalls/patientAPis";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { groupChatAlertsByStaff, groupDoctorAlertsByPatient } from "../../helpers/alertGrouping";

import { ROUTES } from "../../routes/routeConstants";
import "../../design-system/styles/index.css";
import "../../design-system/styles/admin-pages.css";
import "../../components/table/UnifiedListTable.css";

// ── Socket config (follows guide §1 exactly) ──────────────────────────────────
const API_BASE = (
  process.env.REACT_APP_API_SERVER_URL || "https://api.kifaytihealth.com/api1/api"
).replace(/\/$/, "");
const WS_ORIGIN = new URL(API_BASE).origin;        // "https://api.kifaytihealth.com"
const SOCKET_IO_PATH = "/api1/socket.io";

// ── No more Dummy Data ──

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
};

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// ── Sub-components ────────────────────────────────────────────────────────────
const PALETTE = ["#1a73e8","#0f9d58","#f4511e","#7b1fa2","#e65100","#00838f","#37474f","#558b2f"];
const pickColor = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const Avatar = ({ name = "", size = "md", color }) => {
  const cls = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${cls} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white`}
      style={{ background: color || pickColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3 select-none">
    <div className="text-5xl opacity-25">{icon}</div>
    <p className="font-semibold text-gray-500 text-sm">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 max-w-[200px]">{subtitle}</p>}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const GlobalChatsPage = ({ chatType = "admin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminType = chatType === "admin";
  const autoSelectStaffEmail = location.state?.preselectStaffEmail || null;
  const autoSelectPatientId = location.state?.preselectPatientId || null;

  // Column 1: Staff list
  const [staffList, setStaffList]         = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffSearch, setStaffSearch]     = useState("");

  // Column 2: Patient list (for selected staff)
  const [patientList, setPatientList]           = useState([]);
  const [patientSearch, setPatientSearch]       = useState("");

  const [loadingStaff, setLoadingStaff]       = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const allPatientsRef  = useRef([]);
  const autoSelectedStaffRef = useRef(false);

  const [totalMessages, setTotalMessages] = useState(0);
  const [messagesPerStaff, setMessagesPerStaff] = useState({});

  useEffect(() => {
    const init = async () => {
      setLoadingStaff(true);
      setStaffList([]);
      setSelectedStaff(null);
      setPatientList([]);
      autoSelectedStaffRef.current = false;

      try {
        const alertsEndpoint = isAdminType ? '/alerts/byType/admin' : '/alerts/byType/doctor';
        
        const [patientsRes, alertsRes] = await Promise.all([
          getPatients(),
          axiosInstance.get(alertsEndpoint).catch((err) => {
            console.warn(`Endpoint ${alertsEndpoint} failed, attempting fallback...`, err);
            // Fallback for admin if /byType/admin doesn't exist
            if (isAdminType) return axiosInstance.get('/alerts/byType/patient');
            return { data: { alerts: [] } };
          }).catch(() => ({ data: { alerts: [] } })),
        ]);

        const rawAlerts = alertsRes?.data?.alerts || alertsRes?.data || [];
        const chatGroups = groupChatAlertsByStaff(rawAlerts);
        
        // Pick the relevant bucket based on chatType
        const relevantGroups = isAdminType ? chatGroups.admin : chatGroups.doctor;

        allPatientsRef.current = (patientsRes?.data?.data || patientsRes?.data || []).map((p) => {
          const dob = p.dob ? new Date(p.dob) : null;
          const age = dob ? new Date().getFullYear() - dob.getFullYear() : (p.age || "-");
          return {
            id: p.id || p.patient_id || p.patientid,
            name: `${p.firstname || ""} ${p.lastname || ""}`.trim() || `Patient ${p.id}`,
            ailment: p.ailment || p.ailments || p.program || p.disease || "-",
            condition: p.condition || "-",
            age,
            gender: p.gender || "-",
          };
        });

        const patientLookup  = new Map(allPatientsRef.current.map((p) => [String(p.id), p]));
        const normalizedStaff = relevantGroups.map((group) => ({
          ...group,
          role: isAdminType ? "Admin" : (group.role || "Doctor"),
          patients: group.patients.map((patient) => {
            const details = patientLookup.get(String(patient.id)) || {};
            return {
              ...details,
              ...patient,
              name: details.name || patient.name,
              ailment: details.ailment || "-",
              condition: details.condition || "-",
              age: details.age || "-",
              gender: details.gender || "-",
            };
          }),
        }));

        setStaffList(normalizedStaff);
        setMessagesPerStaff(
          normalizedStaff.reduce((acc, staff) => {
            acc[staff.id] = staff.unreadAlerts || staff.totalAlerts || staff.patients.length;
            return acc;
          }, {})
        );
        setTotalMessages(
          normalizedStaff.reduce((sum, staff) => sum + (staff.unreadAlerts || staff.totalAlerts || 0), 0)
        );

        if (normalizedStaff.length > 0) onSelectStaff(normalizedStaff[0]);
      } catch (err) {
        console.error("GlobalChats init error:", err);
      } finally {
        setLoadingStaff(false);
      }
    };

    init();
  }, [chatType, isAdminType]);

  // Handle navigation to chat page
  const handlePatientClick = (patient) => {
    if (!selectedStaff) return;
    const path = isAdminType 
      ? ROUTES.patientAdminChat(patient.id) 
      : ROUTES.patientDoctorChat(patient.id);
    navigate(path, { state: { autoSelectStaffEmail: selectedStaff.email, fromGlobalChats: true } });
  };

  const onSelectStaff = useCallback(
    async (staff) => {
      setSelectedStaff(staff);
      setPatientList([]);
      setLoadingPatients(true);

      try {
        const patientsWithAlerts = [...(staff?.patients || [])].sort(
          (a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0)
        );
        setPatientList(patientsWithAlerts);
      } catch (err) {
        console.error("onSelectStaff error:", err);
      } finally {
        setLoadingPatients(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!autoSelectStaffEmail || autoSelectedStaffRef.current || loadingStaff || staffList.length === 0) {
      return;
    }

    const match = staffList.find(
      (staff) => staff.email?.toLowerCase() === autoSelectStaffEmail.toLowerCase()
    );

    if (match) {
      autoSelectedStaffRef.current = true;
      onSelectStaff(match);
    }
  }, [autoSelectStaffEmail, loadingStaff, onSelectStaff, staffList]);

  useEffect(() => {
    if (!autoSelectPatientId || loadingPatients || !selectedStaff || patientList.length === 0) {
      return;
    }

    const match = patientList.find((patient) => String(patient.id) === String(autoSelectPatientId));
    if (match) {
      handlePatientClick(match);
    }
  }, [autoSelectPatientId, loadingPatients, patientList, selectedStaff]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(staffSearch.toLowerCase())
  );
  const filteredPatients = patientList.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const staffLabel = isAdminType ? "Admins" : "Doctor Team";
  const staffEmoji = isAdminType ? "🛡️" : "👨‍⚕️";
  const pageTitle  = isAdminType ? "Admin Chats" : "Doctor Chats";

  const ROLE_BADGE = {
    Doctor: { bg: "#e8f5e9", text: "#2e7d32", label: "Doctor" },
    "Medical Staff": { bg: "#e3f2fd", text: "#1565c0", label: "Medical Staff" },
    "Dialysis Technician": { bg: "#fce4ec", text: "#880e4f", label: "Dialysis Tech" },
    Admin: { bg: "#f3e5f5", text: "#7b1fa2", label: "Admin" },
    PSadmin: { bg: "#ede7f6", text: "#512da8", label: "PS Admin" },
  };

  const breadcrumbs = [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Chats" },
    { label: pageTitle, active: true },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            onBack={() => startTransition(() => navigate(ROUTES.DASHBOARD))}
          />
        </Box>
        <div className="admin-page-content">
          <div
            className="flex overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white"
            style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
          >
            {/* ══ Column 1: Staff list ══════════════════════════════════════ */}
            <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-[#4164df] text-base" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{staffLabel}</span>
                  {!loadingStaff && (
                    <span className="ml-auto flex items-center gap-1">
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold shadow-sm" title="Total messages">
                        {totalMessages > 0 ? totalMessages : staffList.length}
                      </span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" placeholder={`Search ${staffLabel.toLowerCase()}…`} value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4164df] focus:bg-white transition-all" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingStaff ? (
                  <div className="flex justify-center pt-8"><ReactLoading type="bubbles" color="#4164df" height={40} width={40} /></div>
                ) : filteredStaff.length === 0 ? (
                  <EmptyState icon={staffEmoji} title={`No ${staffLabel.toLowerCase()} found`} />
                ) : (
                  filteredStaff.map((staff) => {
                    const isActive = selectedStaff?.id === staff.id;
                    const badge = ROLE_BADGE[staff.role];
                    return (
                      <button key={staff.id} onClick={() => onSelectStaff(staff)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all duration-150 ${isActive ? "bg-[#e8f0fe] border-l-4 border-l-[#4164df]" : "hover:bg-white border-l-4 border-l-transparent"}`}>
                        <Avatar name={staff.name} color={pickColor(staff.id)} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-[#4164df]" : "text-gray-800"}`}>{staff.name}</p>
                          {badge ? (
                            <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                                  style={{ background: badge.bg, color: badge.text }}>
                              {badge.label}
                            </span>
                          ) : (
                            <p className="text-[10px] text-gray-400 truncate">{staff.email || staff.id}</p>
                          )}
                        </div>
                        {messagesPerStaff[staff.id] > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{messagesPerStaff[staff.id]}</span>
                        )}
                        {isActive && <FiChevronRight className="text-[#4164df] text-xs flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ══ Column 2: Patient Table ══════════════════════════════════ */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-gray-100">
              {selectedStaff ? (
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{selectedStaff.name}'s Patients</h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                      Conversations under this {isAdminType ? "admin" : "doctor"}
                    </p>
                  </div>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="text" placeholder="Search patients…" value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-64 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4164df] focus:bg-white transition-all" />
                  </div>
                </div>
              ) : (
                <div className="h-20 bg-white border-b border-gray-100 flex items-center px-6">
                  <p className="text-sm font-medium text-gray-400">Select a {isAdminType ? "admin" : "doctor"} from the left to view active conversations.</p>
                </div>
              )}
              <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
                {!selectedStaff ? (
                  <div className="h-full rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                    <EmptyState icon="👈" title={`Select a ${isAdminType ? "admin" : "doctor"}`} subtitle={`Choose a staff member on the left to view their patient chat table.`} />
                  </div>
                ) : loadingPatients ? (
                  <div className="flex justify-center pt-16"><ReactLoading type="bubbles" color="#4164df" height={50} width={50} /></div>
                ) : filteredPatients.length === 0 ? (
                  <div className="h-full rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                    <EmptyState icon="🏥" title="No chats found" subtitle={`${selectedStaff.name} has no recorded patient chats yet.`} />
                  </div>
                ) : (
                  <div className="list-table__wrapper">
                    <table className="list-table">
                      <thead className="list-table__header-row">
                        <tr>
                          <th className="list-table__header-cell">Patient Name</th>
                          <th className="list-table__header-cell">Ailment</th>
                          <th className="list-table__header-cell" style={{ width: '33%' }}>Recent Message</th>
                          <th className="list-table__header-cell">Condition</th>
                          <th className="list-table__header-cell" style={{ textAlign: 'right' }}>Date and Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredPatients.map((pat) => (
                          <tr key={pat.id} onClick={() => startTransition(() => handlePatientClick(pat))} className="list-table__row group cursor-pointer">
                            <td className="list-table__cell">
                              <div className="flex items-center gap-3">
                                <Avatar name={pat.name} color={pickColor(String(pat.id))} size="sm" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-gray-800 group-hover:text-[#4164df] transition-colors">{pat.name}</span>
                                  <span className="text-[10px] text-gray-500 font-medium">Age: {pat.age}</span>
                                </div>
                              </div>
                            </td>
                            <td className="list-table__cell">
                              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{pat.ailment}</span>
                            </td>
                            <td className="list-table__cell">
                              <div className="flex items-center gap-2">
                                {pat.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 shadow-sm animate-pulse" title="Unread" />}
                                <p className="text-xs text-gray-500 italic line-clamp-1 max-w-[200px] xl:max-w-xs">
                                  {pat.latestAlert ? `"${pat.latestAlert}"` : pat.lastMessage ? `"${pat.lastMessage}"` : "No message"}
                                </p>
                              </div>
                            </td>
                            <td className="list-table__cell">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                                pat.condition?.toLowerCase() === 'stable' ? 'bg-green-100 text-green-700' :
                                pat.condition?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{pat.condition}</span>
                            </td>
                            <td className="list-table__cell" style={{ textAlign: 'right' }}>
                              {pat.latestAt || pat.lastAt ? (
                                <div className="flex flex-col text-[10px]">
                                  <span className="font-bold text-gray-700">{formatDate(pat.latestAt || pat.lastAt)}</span>
                                  <span className="font-medium text-gray-400">{formatTime(pat.latestAt || pat.lastAt)}</span>
                                </div>
                              ) : <span className="text-xs text-gray-400">-</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default GlobalChatsPage;
