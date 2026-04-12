/**
 * GlobalChatsPage
 * Admin-level overview of all chats: Staff → Patient → Messages (3-column).
 * WebSocket guide compliance:
 *   - REST: GET /chat/message/:id (history), POST /chat/message/ (send), POST /chat/getId
 *   - WebSocket: chat:join / chat:leave / chat:message (receive only)
 *   - NO manual setMessages on send — rely on WS echo
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { MdSend, MdPerson } from "react-icons/md";
import { FiChevronRight, FiUsers, FiSearch } from "react-icons/fi";
import ReactLoading from "react-loading";

import { Box } from "../../component-library";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";

import { getPatients } from "../../ApiCalls/patientAPis";
import { getAdmins, identifyRole } from "../../ApiCalls/authapis";
import { getDoctors } from "../../ApiCalls/doctorApis";
import {
  getAllChats,
  getAllChatsAdmin,
  getMessages,
  getSWMessages,
  sendMessage,
} from "../../ApiCalls/chatApis";

import { ROUTES } from "../../routes/routeConstants";
import "../../design-system/styles/index.css";
import "../../design-system/styles/admin-pages.css";

// ── Socket config (follows guide §1 exactly) ──────────────────────────────────
const API_BASE = (
  process.env.REACT_APP_API_SERVER_URL || "https://api.kifaytihealth.com/api1/api"
).replace(/\/$/, "");
const WS_ORIGIN = new URL(API_BASE).origin;        // "https://api.kifaytihealth.com"
const SOCKET_IO_PATH = "/api1/socket.io";

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

// Per guide §6: Admin/PSadmin share identity on the chat row.
// Admin↔Admin chats use SW endpoints; any Doctor-involved chat uses normal endpoints.
const isSWChatBetween = (myRole, staffRole) =>
  (myRole === "Admin" || myRole === "PSadmin") &&
  (staffRole === "Admin" || staffRole === "PSadmin");

// Stable composite key so both admin ends resolve the same chatId
const compositeReceiver = (emailA, emailB) => [emailA, emailB].sort().join("_");

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
  const isAdminType = chatType === "admin";

  const [myRole, setMyRole]     = useState("");
  const [mySender, setMySender] = useState("");

  // Column 1
  const [staffList, setStaffList]         = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffSearch, setStaffSearch]     = useState("");

  // Column 2
  const [patientList, setPatientList]           = useState([]);
  const [selectedPatient, setSelectedPatient]   = useState(null);
  const [patientSearch, setPatientSearch]       = useState("");

  // Column 3
  const [messages, setMessages]             = useState([]);
  const [activeChatId, setActiveChatId]     = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");

  const [loadingStaff, setLoadingStaff]       = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socket          = useRef(null);
  const activeChatIdRef = useRef(null);
  const prevChatIdRef   = useRef(null);
  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);
  const allPatientsRef  = useRef([]);
  // Keep myRole and mySender accessible in callbacks without stale closures
  const myRoleRef   = useRef(myRole);
  const mySenderRef = useRef(mySender);

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);
  useEffect(() => { mySenderRef.current = mySender; }, [mySender]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── WebSocket: connect once (guide §4) ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = io(`${WS_ORIGIN}/chat`, {
      path: SOCKET_IO_PATH,
      auth: { token },
      transports: ["websocket", "polling"],
    });

    ws.on("connect", () => {
      setSocketConnected(true);
      // Rejoin room on reconnect (guide §5.7)
      if (activeChatIdRef.current) ws.emit("chat:join", { chatId: activeChatIdRef.current });
    });
    ws.on("disconnect", () => setSocketConnected(false));
    ws.on("connect_error", (err) => console.error("[WS] connect_error:", err.message));

    // Guide §5.4: append only if chatId matches, dedupe
    ws.on("chat:message", ({ chatId, sender: msgSender, message, sent_at }) => {
      if (chatId && activeChatIdRef.current && String(chatId) === String(activeChatIdRef.current)) {
        setMessages((prev) => {
          const dup = prev.some(
            (m) => m.sender === msgSender && m.sent_at === sent_at && m.message === message
          );
          return dup ? prev : [...prev, { chatId, sender: msgSender, message, sent_at }];
        });
      }
    });

    ws.on("chat:error", ({ code, message: msg }) =>
      console.error(`[WS] chat:error [${code}]: ${msg}`)
    );

    socket.current = ws;
    return () => {
      if (activeChatIdRef.current) ws.emit("chat:leave", { chatId: activeChatIdRef.current });
      ws.disconnect();
    };
  }, []);

  // ── Join / leave rooms when activeChatId changes ──────────────────────────
  useEffect(() => {
    if (!socket.current) return;
    const prev = prevChatIdRef.current;
    if (prev && prev !== activeChatId) socket.current.emit("chat:leave", { chatId: prev });
    if (activeChatId && activeChatId !== prev) socket.current.emit("chat:join", { chatId: activeChatId });
    prevChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // ── Init: load identity + staff list + all patients ───────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingStaff(true);
      setStaffList([]);
      setSelectedStaff(null);
      setPatientList([]);
      setSelectedPatient(null);
      setMessages([]);
      setActiveChatId(null);

      try {
        const [roleRes, patientsRes] = await Promise.all([identifyRole(), getPatients()]);

        const role   = roleRes?.data?.data?.role_name || "";
        const sender = localStorage.getItem("email") || "";
        setMyRole(role);
        setMySender(sender);

        allPatientsRef.current = (patientsRes?.data?.data || patientsRes?.data || []).map((p) => ({
          id: p.id || p.patient_id || p.patientid,
          name: `${p.firstname || ""} ${p.lastname || ""}`.trim() || `Patient ${p.id}`,
        }));

        if (isAdminType) {
          const adminsRes = await getAdmins();
          setStaffList(
            (adminsRes?.data?.data || adminsRes?.data || []).map((u) => ({
              email: u.email,
              name: `${u.firstname || u.name || ""} ${u.lastname || ""}`.trim() || u.email,
              role: u.role_name || "Admin",
            }))
          );
        } else {
          const MEDICAL_ROLES = ["Doctor", "Medical Staff", "Dialysis Technician"];
          const roleOrder = { Doctor: 0, "Medical Staff": 1, "Dialysis Technician": 2 };
          const docsRes = await getDoctors();
          const docs = (docsRes?.data?.data || docsRes?.data || [])
            .filter((d) => !d.role || MEDICAL_ROLES.includes(d.role))
            .map((d) => ({
              email: d.email,
              name: (d.name || `${d.firstname || ""} ${d.lastname || ""}`).trim() || d.email,
              role: d.role || "Doctor",
            }));
          docs.sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9) || a.name.localeCompare(b.name));
          setStaffList(docs);
        }
      } catch (err) {
        console.error("GlobalChats init error:", err);
      } finally {
        setLoadingStaff(false);
      }
    };

    init();
  }, [chatType, isAdminType]);

  // ── Column 2: Load patients for a staff member ────────────────────────────
  const onSelectStaff = useCallback(
    async (staff) => {
      setSelectedStaff(staff);
      setSelectedPatient(null);
      setMessages([]);
      setActiveChatId(null);
      setPatientList([]);
      setLoadingPatients(true);

      try {
        const role   = myRoleRef.current;
        const sender = mySenderRef.current;
        const sw     = isSWChatBetween(role, staff.role);
        const patientsWithChats = [];

        await Promise.all(
          allPatientsRef.current.map(async (pat) => {
            try {
              // REST: GET chat summaries for this patient
              const res = isAdminType
                ? await getAllChatsAdmin(pat.id)
                : await getAllChats(pat.id);

              const chats = res?.data?.data || res?.data || [];

              let match;
              if (sw) {
                // Admin↔Admin: look for composite receiver key
                const compKey = compositeReceiver(sender, staff.email);
                match = chats.find((c) => c.receiver === compKey || (c.receiver && c.receiver.includes(staff.email)));
              } else {
                match = chats.find(
                  (c) => c.sender === staff.email || c.receiver === staff.email || c.user_email === staff.email
                );
              }

              if (match) {
                patientsWithChats.push({
                  ...pat,
                  chatId: match.chatid || match.chat_id || match.chatId || match.id,
                  lastMessage: match.message || match.last_message || "",
                  lastAt: match.sent_at || match.created_at || "",
                });
              }
            } catch {
              // skip silently
            }
          })
        );

        patientsWithChats.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
        setPatientList(patientsWithChats);
      } catch (err) {
        console.error("onSelectStaff error:", err);
      } finally {
        setLoadingPatients(false);
      }
    },
    [isAdminType]
  );

  // ── Column 3: Load history via REST, then WS join fires automatically ─────
  const onSelectPatient = useCallback(
    async (patient) => {
      setSelectedPatient(patient);
      setMessages([]);
      setLoadingMessages(true);

      try {
        if (patient.chatId) {
          const role = myRoleRef.current;
          const sw   = selectedStaff ? isSWChatBetween(role, selectedStaff.role) : false;

          // REST: GET /chat/message/:chatId or /chat/messageSW/:chatId
          const msgRes = sw
            ? await getSWMessages(patient.chatId)
            : await getMessages(patient.chatId);

          if (msgRes.success) {
            setMessages(msgRes.data || []);
            // Triggers join/leave useEffect → WS chat:join (guide §5.3)
            setActiveChatId(patient.chatId);
          }
        }
      } catch (err) {
        console.error("onSelectPatient error:", err);
      } finally {
        setLoadingMessages(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [selectedStaff]
  );

  // ── Send: REST POST only — WS echo handles UI update (guide §5.5) ─────────
  const handleSend = async () => {
    if (!currentMessage.trim() || !selectedStaff || !selectedPatient) return;
    const text = currentMessage.trim();
    setCurrentMessage("");
    inputRef.current?.focus();

    try {
      const sw = isSWChatBetween(myRole, selectedStaff.role);
      const receiver = sw
        ? compositeReceiver(mySender, selectedStaff.email)
        : selectedStaff.email;

      // REST POST — source of truth (guide §5.5)
      const res = await sendMessage({ message: text, receiver, pid: String(selectedPatient.id) });

      if (res.success) {
        const returnedId = res.data.chatId;
        // If new chat was just created, update activeChatId to trigger WS join
        if (returnedId && returnedId !== activeChatId) setActiveChatId(returnedId);
        // DO NOT call setMessages — server broadcasts via WS and we receive it in chat:message handler
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(staffSearch.toLowerCase())
  );
  const filteredPatients = patientList.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const messagesWithSeparators = [...messages]
    .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
    .map((msg, i, arr) => {
      const currDate = formatDate(msg.sent_at);
      const prevDate = i > 0 ? formatDate(arr[i - 1].sent_at) : null;
      return { ...msg, showDateSep: currDate !== prevDate, dateLabel: currDate };
    });

  const staffLabel = isAdminType ? "Admins" : "Medical Team";
  const staffEmoji = isAdminType ? "🛡️" : "👨‍⚕️";
  const pageTitle  = isAdminType ? "Admin Chats" : "Doctor Chats";

  const ROLE_BADGE = {
    Doctor: { bg: "#e8f5e9", text: "#2e7d32", label: "Doctor" },
    "Medical Staff": { bg: "#e3f2fd", text: "#1565c0", label: "Medical Staff" },
    "Dialysis Technician": { bg: "#fce4ec", text: "#880e4f", label: "Dialysis Tech" },
  };

  const staffByRole = !isAdminType && staffSearch === ""
    ? filteredStaff.reduce((acc, s) => {
        const key = s.role || "Doctor";
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
      }, {})
    : null;

  const breadcrumbs = [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Chats" },
    { label: pageTitle, active: true },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            onBack={() => navigate(ROUTES.DASHBOARD)}
          />
        </Box>

        <div className="admin-page-content">
          <div
            className="flex overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white"
            style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
          >

            {/* ══ Column 1: Staff list ══════════════════════════════════════ */}
            <div className="w-64 flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-[#4164df] text-base" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {staffLabel}
                  </span>
                  {!loadingStaff && (
                    <span className="ml-auto text-[10px] bg-[#e8f0fe] text-[#4164df] px-2 py-0.5 rounded-full font-semibold">
                      {staffList.length}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder={`Search ${staffLabel.toLowerCase()}…`}
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4164df] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingStaff ? (
                  <div className="flex justify-center pt-8">
                    <ReactLoading type="bubbles" color="#4164df" height={40} width={40} />
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <EmptyState icon={staffEmoji} title={`No ${staffLabel.toLowerCase()} found`} />
                ) : staffByRole ? (
                  Object.entries(staffByRole).map(([roleKey, members]) => (
                    <div key={roleKey}>
                      <div className="px-4 py-1.5 bg-gray-100 border-b border-gray-200">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {roleKey} ({members.length})
                        </span>
                      </div>
                      {members.map((staff) => {
                        const isActive = selectedStaff?.email === staff.email;
                        const badge = ROLE_BADGE[staff.role];
                        return (
                          <button
                            key={staff.email}
                            onClick={() => onSelectStaff(staff)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all duration-150 ${
                              isActive
                                ? "bg-[#e8f0fe] border-l-4 border-l-[#4164df]"
                                : "hover:bg-white border-l-4 border-l-transparent"
                            }`}
                          >
                            <Avatar name={staff.name} color={pickColor(staff.email)} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${isActive ? "text-[#4164df]" : "text-gray-800"}`}>
                                {staff.name}
                              </p>
                              {badge && (
                                <span
                                  className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                                  style={{ background: badge.bg, color: badge.text }}
                                >
                                  {badge.label}
                                </span>
                              )}
                            </div>
                            {isActive && <FiChevronRight className="text-[#4164df] text-xs flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  filteredStaff.map((staff) => {
                    const isActive = selectedStaff?.email === staff.email;
                    const badge = !isAdminType ? ROLE_BADGE[staff.role] : null;
                    return (
                      <button
                        key={staff.email}
                        onClick={() => onSelectStaff(staff)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all duration-150 ${
                          isActive
                            ? "bg-[#e8f0fe] border-l-4 border-l-[#4164df]"
                            : "hover:bg-white border-l-4 border-l-transparent"
                        }`}
                      >
                        <Avatar name={staff.name} color={pickColor(staff.email)} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-[#4164df]" : "text-gray-800"}`}>
                            {staff.name}
                          </p>
                          {badge ? (
                            <span
                              className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                              style={{ background: badge.bg, color: badge.text }}
                            >
                              {badge.label}
                            </span>
                          ) : (
                            <p className="text-[10px] text-gray-400 truncate">{staff.email}</p>
                          )}
                        </div>
                        {isActive && <FiChevronRight className="text-[#4164df] text-xs flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ══ Column 2: Patient list ════════════════════════════════════ */}
            <div className="w-60 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <MdPerson className="text-indigo-500 text-base" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Patients</span>
                  {selectedStaff && !loadingPatients && (
                    <span className="ml-auto text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                      {patientList.length}
                    </span>
                  )}
                </div>
                {selectedStaff && (
                  <div className="relative">
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search patients…"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {!selectedStaff ? (
                  <EmptyState
                    icon="👈"
                    title="Select a staff member"
                    subtitle={`Choose a ${isAdminType ? "admin" : "doctor"} on the left to view their patients.`}
                  />
                ) : loadingPatients ? (
                  <div className="flex justify-center pt-8">
                    <ReactLoading type="bubbles" color="#6366f1" height={40} width={40} />
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <EmptyState icon="🏥" title="No chats found" subtitle="This staff member has no recorded chats yet." />
                ) : (
                  filteredPatients.map((pat) => {
                    const isActive = selectedPatient?.id === pat.id;
                    return (
                      <button
                        key={pat.id}
                        onClick={() => onSelectPatient(pat)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all duration-150 ${
                          isActive
                            ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                            : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        <Avatar name={pat.name} color={pickColor(String(pat.id))} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                            {pat.name}
                          </p>
                          {pat.lastMessage && (
                            <p className="text-[10px] text-gray-400 truncate">{pat.lastMessage}</p>
                          )}
                        </div>
                        {isActive && <FiChevronRight className="text-indigo-500 text-xs flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ══ Column 3: Messages ════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              {/* Chat header */}
              {selectedStaff && selectedPatient ? (
                <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100 shadow-sm">
                  <Avatar name={selectedStaff.name} color={pickColor(selectedStaff.email)} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{selectedStaff.name}</p>
                    <p className="text-[10px] text-gray-400">{selectedStaff.email}</p>
                  </div>
                  <div className="mx-3 text-gray-300 text-sm font-light">→</div>
                  <Avatar name={selectedPatient.name} color={pickColor(String(selectedPatient.id))} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">{selectedPatient.name}</p>
                    <p className="text-[10px] text-gray-400">Patient</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-green-400" : "bg-gray-300"}`} />
                    {socketConnected ? "Live" : "Connecting…"}
                  </div>
                </div>
              ) : (
                <div className="h-14 bg-white border-b border-gray-100 flex items-center px-5">
                  <p className="text-xs text-gray-400">
                    {!selectedStaff
                      ? `Select a ${isAdminType ? "admin" : "doctor"} and a patient to view messages`
                      : "Select a patient to view messages"}
                  </p>
                </div>
              )}

              {/* Messages scroll area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {!selectedStaff || !selectedPatient ? (
                  <EmptyState
                    icon="💬"
                    title="No conversation selected"
                    subtitle={`Pick a ${isAdminType ? "admin" : "doctor"} from column 1, then a patient from column 2.`}
                  />
                ) : loadingMessages ? (
                  <div className="flex justify-center pt-10">
                    <ReactLoading type="bubbles" color="#4164df" height={60} width={60} />
                  </div>
                ) : messagesWithSeparators.length === 0 ? (
                  <EmptyState icon="🌱" title="No messages yet" subtitle="This chat thread has no messages yet." />
                ) : (
                  messagesWithSeparators.map((msg, i) => {
                    const isOwn = msg.sender === mySender;
                    return (
                      <React.Fragment key={i}>
                        {msg.showDateSep && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium">{msg.dateLabel}</span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                        <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs lg:max-w-md flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                            {!isOwn && (
                              <p className="text-[11px] text-gray-500 px-1 mb-0.5 font-medium">
                                {msg.firstname ? `${msg.firstname} ${msg.lastname || ""}` : msg.sender}
                              </p>
                            )}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isOwn
                                  ? "bg-[#4164df] text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                              }`}
                            >
                              {msg.message}
                            </div>
                            <p className="text-[10px] text-gray-400 px-1 mt-1">{formatTime(msg.sent_at)}</p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      selectedStaff && selectedPatient
                        ? `Message ${selectedStaff.name}…`
                        : "Select a staff member and patient first…"
                    }
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={!selectedStaff || !selectedPatient}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4164df] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!currentMessage.trim() || !selectedStaff || !selectedPatient}
                    className="bg-[#4164df] hover:bg-[#3152c7] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-all flex items-center justify-center"
                  >
                    <MdSend className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default GlobalChatsPage;
