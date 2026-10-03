import React, { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { io } from "socket.io-client";
import { MdSend } from "react-icons/md";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PatientDetailLayout from "../common/PatientDetailLayout";
import { usePatientProfileShell } from "../common/PatientProfileShellContext";
import {
  getPatientById,
  getPatientMedicalTeam,
  getPatientAdminTeam,
} from "../../ApiCalls/patientAPis";
import { getDoctorsChat } from "../../ApiCalls/doctorApis";
import { identifyRole } from "../../ApiCalls/authapis";
import {
  getChatId,
  getMessages,
  sendMessage,
  getSWMessages,
  getAllSWChats,
} from "../../ApiCalls/chatApis";
import { createMessageAlert } from "../../ApiCalls/alertsApis";
import { adminEmail } from "../../constants/constants";
import { normalizeRole } from "../../helpers/roleUtils";
import { ROUTES } from "../../routes/routeConstants";
import ReactLoading from "react-loading";

// ── Socket.IO config (follows the guide exactly) ─────────────────────────────
const API_BASE = (
  process.env.REACT_APP_API_SERVER_URL || "https://api.kifaytihealth.com/api1/api"
).replace(/\/$/, "");
const WS_ORIGIN = new URL(API_BASE).origin; // "https://api.kifaytihealth.com"
const SOCKET_IO_PATH = "/api1/socket.io";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (firstname = "", lastname = "") => {
  return ((firstname[0] ?? "") + (lastname[0] ?? "")).toUpperCase() || "?";
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

const normEmail = (email) => String(email || "").trim().toLowerCase();
const sameEmail = (a, b) => normEmail(a) !== "" && normEmail(a) === normEmail(b);

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

// Mirrors the backend, which treats exactly "Admin" / "PSadmin" as admins.
const isAdminRole = (role) => ["admin", "psadmin"].includes(normalizeRole(role));

// For SW endpoints (getSWMessages): only true for Admin↔Admin chats.
const isSWChatBetween = (myRole, contactRole) =>
  isAdminRole(myRole) && isAdminRole(contactRole);

// Canonical receiver email to use in getChatId / sendMessage.
//
// The backend stores every Admin/PSadmin as the shared ADMIN_EMAIL in the chat
// row (messages.sender still holds the real email), and findChat() matches the
// pair in either direction.
//
// Admin↔Admin: both JWTs map to the shared admin, so the row can only be told
//   apart by the receiver. Both admins pick the alphabetically-larger email so
//   they resolve the same row.
// Doctor→Admin team: the contact is the shared admin address itself (see
//   ADMIN_TEAM_CONTACT), giving (doctor, ADMIN_EMAIL) — the same row admins open
//   as (ADMIN_EMAIL, doctor). One group thread per doctor per patient.
// Admin→Doctor and Doctor↔Doctor: the contact's email.
const canonicalReceiver = (myRole, contactRole, myEmail, contactEmail) => {
  if (isAdminRole(myRole) && isAdminRole(contactRole)) {
    return [normEmail(myEmail), normEmail(contactEmail)].sort()[1];
  }
  return contactEmail;
};

const ADMIN_TEAM_CONTACT = {
  email: adminEmail,
  firstname: "Admin",
  lastname: "Team",
  role: "Admin",
  isAdminGroup: true,
};

const normaliseName = (u) => {
  if (u.firstname) return { firstname: u.firstname, lastname: u.lastname || "" };
  const parts = (u.name || "").trim().split(" ");
  return { firstname: parts[0] || "Staff", lastname: parts.slice(1).join(" ") || "" };
};

const toContact = (u, fallbackRole) => ({
  ...u,
  ...normaliseName(u),
  role: u.role || fallbackRole,
  profile_photo: u.photo || u.profile_photo || "",
});

const messageKey = (m) => `${normEmail(m.sender)}|${m.sent_at}|${m.message}`;

// Replace our own optimistic copy with the server echo, otherwise append once.
const addIncomingMessage = (prev, incoming) => {
  const localIdx = prev.findIndex(
    (m) => m.clientId && sameEmail(m.sender, incoming.sender) && m.message === incoming.message
  );
  if (localIdx !== -1) {
    const next = [...prev];
    next[localIdx] = incoming;
    return next;
  }
  if (prev.some((m) => messageKey(m) === messageKey(incoming))) return prev;
  return [...prev, incoming];
};

// History is the source of truth; keep anything newer that arrived meanwhile.
const mergeWithHistory = (history, current) => {
  const merged = [...history];
  current.forEach((m) => {
    const alreadyInHistory = m.clientId
      ? merged.some((h) => !h.clientId && sameEmail(h.sender, m.sender) && h.message === m.message)
      : merged.some((h) => messageKey(h) === messageKey(m));
    if (!alreadyInHistory) merged.push(m);
  });
  return merged;
};

// ── Small UI components ───────────────────────────────────────────────────────
const ROLE_COLOURS = {
  Doctor: { bg: "bg-blue-100", text: "text-blue-700" },
  "Medical Staff": { bg: "bg-teal-100", text: "text-teal-700" },
  "Dialysis Technician": { bg: "bg-cyan-100", text: "text-cyan-700" },
  Admin: { bg: "bg-purple-100", text: "text-purple-700" },
  PSadmin: { bg: "bg-indigo-100", text: "text-indigo-700" },
};

const RolePill = ({ role }) => {
  const c = ROLE_COLOURS[role] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
      {role ?? "Staff"}
    </span>
  );
};

const Avatar = ({ src, firstname = "", lastname = "", size = "md" }) => {
  const [imgErr, setImgErr] = useState(false);
  const cls = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (src && !imgErr) {
    return (
      <img
        src={src}
        alt={`${firstname} ${lastname}`}
        className={`${cls} rounded-full object-cover flex-shrink-0`}
        onError={() => setImgErr(true)}
      />
    );
  }
  return (
    <div className={`${cls} rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold`}>
      {getInitials(firstname, lastname)}
    </div>
  );
};

const ContactRow = ({ contact, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all duration-150 ${
      isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50 border-l-4 border-l-transparent"
    }`}
  >
    <Avatar src={contact.profile_photo} firstname={contact.firstname} lastname={contact.lastname} />
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
        {contact.firstname} {contact.lastname}
      </p>
      <RolePill role={contact.role} />
    </div>
  </button>
);

const MessageBubble = ({ message, isOwn, showDateSeparator, dateLabel }) => (
  <>
    {showDateSeparator && (
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">{dateLabel}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    )}
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs lg:max-w-md flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <p className="text-[11px] text-gray-500 px-1 mb-0.5 font-medium">
            {message.firstname ? `${message.firstname} ${message.lastname || ""}` : message.sender}
          </p>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
          } ${message.pending ? "opacity-70" : ""}`}
        >
          {message.message}
        </div>
        <p className="text-[10px] text-gray-400 px-1 mt-1">
          {message.pending ? "Sending…" : formatTime(message.sent_at)}
        </p>
      </div>
    </div>
  </>
);

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
    <div className="text-4xl">{icon}</div>
    <p className="font-semibold text-gray-600">{title}</p>
    {subtitle && <p className="text-sm text-gray-400 max-w-xs">{subtitle}</p>}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const UnifiedChatApp = ({ chatType = "doctor" }) => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Email passed from GlobalChatsPage via navigate(path, { state: { autoSelectStaffEmail } })
  const autoSelectEmail = location.state?.autoSelectStaffEmail ?? null;
  const refreshUnreadCounts = usePatientProfileShell()?.refreshUnreadCounts;

  const [role, setRole] = useState("");
  const [sender, setSender] = useState("");
  const [patient, setPatient] = useState({});
  const [contacts, setContacts] = useState([]);
  const [contactsError, setContactsError] = useState("");
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatError, setChatError] = useState("");
  const [sendError, setSendError] = useState("");
  // Admin "Doctor Chat": read-only doctor↔doctor threads of the selected doctor.
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const autoSelectDoneRef = useRef(false);

  const socket = useRef(null);
  const activeChatIdRef = useRef(null);
  const activeChatIsSWRef = useRef(false);
  const prevChatIdRef = useRef(null);
  // Incremented on every open / patient switch so stale responses are dropped.
  const openRequestRef = useRef(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isReadOnlyView = chatType === "doctor" && isAdminRole(role);

  // Keep activeChatIdRef in sync for WS handler closure
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeThreadId]);

  // ── WebSocket: connect once, handle chat:message ──────────────────────────
  useEffect(() => {
    const ws = io(`${WS_ORIGIN}/chat`, {
      path: SOCKET_IO_PATH,
      // Read on every (re)connect so a refreshed token is picked up.
      auth: (cb) => cb({ token: localStorage.getItem("token") }),
      transports: ["websocket", "polling"],
    });

    let hasConnectedBefore = false;

    const reloadActiveChat = async (chatId) => {
      const fetchHistory = activeChatIsSWRef.current ? getSWMessages : getMessages;
      const res = await fetchHistory(chatId);
      if (!res.success || String(activeChatIdRef.current) !== String(chatId)) return;
      setMessages((prev) => mergeWithHistory(asArray(res.data), prev));
    };

    ws.on("connect", () => {
      setSocketConnected(true);
      const chatId = activeChatIdRef.current;
      if (chatId) {
        ws.emit("chat:join", { chatId });
        // Messages sent while we were disconnected never reach this client.
        if (hasConnectedBefore) reloadActiveChat(chatId);
      }
      hasConnectedBefore = true;
    });

    ws.on("disconnect", () => setSocketConnected(false));
    ws.on("connect_error", (err) => console.error("[WS] connect_error:", err.message));

    ws.on("chat:message", (payload = {}) => {
      const { chatId } = payload;
      if (!chatId || String(chatId) !== String(activeChatIdRef.current)) return;
      // The user is looking at this chat; getMessages is the only call that marks messages read.
      if (!activeChatIsSWRef.current && !sameEmail(payload.sender, localStorage.getItem("email"))) {
        getMessages(chatId);
      }
      setMessages((prev) =>
        addIncomingMessage(prev, {
          chatId,
          sender: payload.sender,
          message: payload.message,
          sent_at: payload.sent_at,
          patientid: payload.patientid,
        })
      );
    });

    ws.on("chat:error", ({ code, message: msg } = {}) =>
      console.error(`[WS] chat:error [${code}]: ${msg}`)
    );

    socket.current = ws;
    return () => {
      if (activeChatIdRef.current) ws.emit("chat:leave", { chatId: activeChatIdRef.current });
      ws.disconnect();
    };
  }, []); // once on mount

  // ── Join / leave rooms when activeChatId changes ──────────────────────────
  useEffect(() => {
    if (!socket.current) return;
    const prev = prevChatIdRef.current;
    if (prev && String(prev) !== String(activeChatId)) {
      socket.current.emit("chat:leave", { chatId: prev });
    }
    if (activeChatId && String(activeChatId) !== String(prev)) {
      socket.current.emit("chat:join", { chatId: activeChatId });
    }
    prevChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const resetActiveChat = () => {
    setActiveContact(null);
    setActiveChatId(null);
    setMessages([]);
    setThreads([]);
    setActiveThreadId(null);
    setChatError("");
    setSendError("");
    setLoadingMessages(false);
  };

  // ── Patient header info (non-blocking) ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getPatientById(patientId)
      .then((res) => {
        if (cancelled || !res?.success) return;
        const data = res.data?.data;
        setPatient((Array.isArray(data) ? data[0] : data) || {});
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [patientId]);

  // ── Data init: load contacts ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    openRequestRef.current += 1;
    autoSelectDoneRef.current = false;
    setLoadingContacts(true);
    setContactsError("");
    setContacts([]);
    resetActiveChat();

    const init = async () => {
      const roleRes = await identifyRole();
      if (cancelled) return;
      const userRole = roleRes?.success ? roleRes.data?.data?.role_name : "";
      if (!userRole) {
        setContactsError("Could not verify your role. Please refresh the page.");
        return;
      }
      const userEmail = localStorage.getItem("email") || "";
      setRole(userRole);
      setSender(userEmail);

      let list = [];
      let failed = false;

      if (chatType === "admin" && !isAdminRole(userRole)) {
        list = [ADMIN_TEAM_CONTACT];
      } else if (chatType === "admin") {
        // Admins reply to the patient's doctors and chat with fellow admins.
        const [doctorsRes, adminsRes] = await Promise.all([
          getPatientMedicalTeam(patientId),
          getPatientAdminTeam(patientId),
        ]);
        failed = !doctorsRes.success && !adminsRes.success;
        list = [
          ...(doctorsRes.success ? asArray(doctorsRes.data).map((u) => toContact(u, "Doctor")) : []),
          ...(adminsRes.success ? asArray(adminsRes.data).map((u) => toContact(u, "Admin")) : []),
        ];
      } else if (isAdminRole(userRole)) {
        const res = await getDoctorsChat(patientId);
        failed = !res.success;
        list = res.success ? asArray(res.data).map((u) => toContact(u, "Doctor")) : [];
      } else {
        const res = await getPatientMedicalTeam(patientId);
        failed = !res.success;
        list = res.success ? asArray(res.data).map((u) => toContact(u, "Doctor")) : [];
      }

      if (cancelled) return;
      if (failed) setContactsError("Could not load contacts. Please refresh the page.");

      const seen = new Set();
      setContacts(
        list.filter((c) => {
          const key = normEmail(c.email);
          if (!key || sameEmail(key, userEmail) || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      );
    };

    init()
      .catch((err) => {
        console.error("Chat init error:", err);
        if (!cancelled) setContactsError("Could not load contacts. Please refresh the page.");
      })
      .finally(() => {
        if (!cancelled) setLoadingContacts(false);
      });

    return () => { cancelled = true; };
  }, [chatType, patientId]);

  // ── Open chat ─────────────────────────────────────────────────────────────
  const openChat = useCallback(
    async (contact) => {
      const requestId = ++openRequestRef.current;
      const isCurrent = () => openRequestRef.current === requestId;

      setActiveContact(contact);
      setActiveChatId(null);
      setMessages([]);
      setThreads([]);
      setActiveThreadId(null);
      setChatError("");
      setSendError("");
      setLoadingMessages(true);

      try {
        if (isReadOnlyView) {
          const res = await getAllSWChats(patientId, contact.email);
          if (!isCurrent()) return;
          if (!res.success) {
            setChatError("Could not load this doctor's conversations.");
            return;
          }
          const list = asArray(res.data).map((row) => ({
            id: row.id,
            name: `${row.firstname || ""} ${row.lastname || ""}`.trim() || row.receiverEmail,
            role: row.role,
            messages: asArray(row.messages),
          }));
          setThreads(list);
          setActiveThreadId(list[0]?.id ?? null);
          return;
        }

        const myEmail = localStorage.getItem("email");
        const receiver = canonicalReceiver(role, contact.role, myEmail, contact.email);
        const idRes = await getChatId(receiver, patientId);
        if (!isCurrent()) return;
        const chatId = idRes.success ? idRes.data?.chatId : null;
        if (!chatId) {
          setChatError("Could not open this chat. Please try again.");
          return;
        }

        const sw = isSWChatBetween(role, contact.role);
        activeChatIsSWRef.current = sw;
        // Join the room before loading history so nothing sent meanwhile is missed.
        setActiveChatId(chatId);

        const msgRes = sw ? await getSWMessages(chatId) : await getMessages(chatId);
        if (!isCurrent()) return;
        if (!msgRes.success) {
          setChatError("Could not load messages. Please try again.");
          return;
        }
        setMessages((prev) => mergeWithHistory(asArray(msgRes.data), prev));
        refreshUnreadCounts?.();
      } catch (err) {
        console.error("openChat error:", err);
        if (isCurrent()) setChatError("Could not open this chat. Please try again.");
      } finally {
        if (isCurrent()) {
          setLoadingMessages(false);
          inputRef.current?.focus();
        }
      }
    },
    [role, patientId, isReadOnlyView, refreshUnreadCounts]
  );

  // ── Auto-select staff when navigated from GlobalChatsPage ─────────────────
  useEffect(() => {
    if (!autoSelectEmail || autoSelectDoneRef.current) return;
    if (loadingContacts || contacts.length === 0) return;
    const match = contacts.find((c) => sameEmail(c.email, autoSelectEmail));
    if (match) {
      autoSelectDoneRef.current = true;
      openChat(match);
    }
  }, [autoSelectEmail, contacts, loadingContacts, openChat]);

  // ── Send message ──────────────────────────────────────────────────────────
  // Shown immediately as "Sending…"; the WS echo replaces it with the stored copy.
  const handleSend = async () => {
    const text = currentMessage.trim();
    if (!text || !activeContact || !activeChatId || isReadOnlyView) return;

    const chatIdAtSend = activeChatId;
    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setCurrentMessage("");
    setSendError("");
    inputRef.current?.focus();
    setMessages((prev) => [
      ...prev,
      { clientId, pending: true, sender, message: text, sent_at: new Date().toISOString() },
    ]);

    try {
      const myEmail = localStorage.getItem("email");
      const receiver = canonicalReceiver(role, activeContact.role, myEmail, activeContact.email);
      const res = await sendMessage({ message: text, receiver, pid: patientId });

      if (!res.success) {
        setMessages((prev) => prev.filter((m) => m.clientId !== clientId));
        if (String(activeChatIdRef.current) === String(chatIdAtSend)) {
          setCurrentMessage((cur) => cur || text);
          setSendError("Message not sent. Please try again.");
        }
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m.clientId === clientId ? { ...m, pending: false } : m))
      );

      const returnedId = res.data?.chatId ?? chatIdAtSend;
      if (chatType === "admin" && !isAdminRole(role)) {
        createMessageAlert(returnedId, text, patientId);
      }
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) => prev.filter((m) => m.clientId !== clientId));
      setSendError("Message not sent. Please try again.");
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const sidebarLabel =
    chatType === "doctor"
      ? isReadOnlyView ? "Doctors" : "Medical Team"
      : isAdminRole(role) ? "Doctors & Admins" : "Admin Team";
  const title = chatType === "admin" ? "Admin Chat" : "Doctor Chat";

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  const visibleMessages = isReadOnlyView ? activeThread?.messages || [] : messages;
  const isOwnMessage = (msg) =>
    isReadOnlyView ? sameEmail(msg.sender, activeContact?.email) : sameEmail(msg.sender, sender);

  const messagesWithSeparators = [...visibleMessages]
    .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
    .map((msg, i, arr) => {
      const currDate = formatDate(msg.sent_at);
      const prevDate = i > 0 ? formatDate(arr[i - 1].sent_at) : null;
      return { ...msg, showDateSep: currDate !== prevDate, dateLabel: currDate };
    });

  const renderMessagesArea = () => {
    if (!activeContact) {
      return (
        <EmptyState
          icon="💬"
          title={
            isReadOnlyView
              ? "Select a doctor to view their conversations"
              : `Select a ${chatType === "doctor" ? "team member" : "contact"} to start chatting`
          }
          subtitle={`Choose someone from the ${sidebarLabel.toLowerCase()} on the left.`}
        />
      );
    }
    if (loadingMessages) {
      return (
        <div className="flex justify-center pt-10">
          <ReactLoading type="bubbles" color="#3b82f6" height={60} width={60} />
        </div>
      );
    }
    if (chatError) {
      return <EmptyState icon="⚠️" title={chatError} subtitle="Select the contact again to retry." />;
    }
    if (isReadOnlyView && threads.length === 0) {
      return (
        <EmptyState
          icon="🗂️"
          title="No conversations yet"
          subtitle="This doctor has no conversations with other team members for this patient."
        />
      );
    }
    if (messagesWithSeparators.length === 0) {
      return (
        <EmptyState
          icon="🌱"
          title="No messages yet"
          subtitle={isReadOnlyView ? undefined : "Send the first message to start the conversation."}
        />
      );
    }
    return messagesWithSeparators.map((msg, i) => (
      <MessageBubble
        key={msg.clientId || `${msg.sender}-${msg.sent_at}-${i}`}
        message={msg}
        isOwn={isOwnMessage(msg)}
        showDateSeparator={msg.showDateSep}
        dateLabel={msg.dateLabel}
      />
    ));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PatientDetailLayout
      title={title}
      patientIdParam="id"
      userData={patient}
      totalUnreadCount={0}
      totalUnreadCountDoc={0}
      onBackClick={() => startTransition(() => navigate(ROUTES.PATIENTS))}
    >
      <div className="h-[80vh] flex overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <aside className="w-72 flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              {sidebarLabel}
            </h2>
            {contacts.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {contacts.length} member{contacts.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="flex justify-center pt-10">
                <ReactLoading type="bubbles" color="#3b82f6" height={48} width={48} />
              </div>
            ) : contactsError ? (
              <EmptyState icon="⚠️" title={contactsError} />
            ) : contacts.length === 0 ? (
              <EmptyState
                icon="👥"
                title={`No ${sidebarLabel.toLowerCase()} found`}
                subtitle="No members are currently assigned to this patient."
              />
            ) : (
              contacts.map((contact, idx) => (
                <ContactRow
                  key={contact.email ?? idx}
                  contact={contact}
                  isActive={sameEmail(activeContact?.email, contact.email)}
                  onClick={() => openChat(contact)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Right: Chat area ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Chat header */}
          {activeContact ? (
            <div className="px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar
                  src={activeContact.profile_photo}
                  firstname={activeContact.firstname}
                  lastname={activeContact.lastname}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {activeContact.firstname} {activeContact.lastname}
                  </p>
                  <div className="flex items-center gap-2">
                    <RolePill role={activeContact.role} />
                    {isReadOnlyView ? (
                      <span className="text-[10px] text-gray-400">Read-only</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            socketConnected ? "bg-green-400" : "bg-gray-300"
                          }`}
                        />
                        {socketConnected ? "Live" : "Connecting…"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isReadOnlyView && threads.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        thread.id === activeThreadId
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      with {thread.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-12 bg-white border-b border-gray-200" />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
            {renderMessagesArea()}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            {isReadOnlyView ? (
              <p className="text-xs text-gray-400 text-center py-2">
                Admins can view doctor conversations but cannot post in them.
              </p>
            ) : (
              <>
                {sendError && <p className="text-xs text-red-600 mb-2 px-2">{sendError}</p>}
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={activeContact ? `Message ${activeContact.firstname}…` : "Select a contact first…"}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={!activeChatId}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!currentMessage.trim() || !activeChatId}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-all flex items-center justify-center"
                  >
                    <MdSend className="text-lg" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PatientDetailLayout>
  );
};

export default UnifiedChatApp;
