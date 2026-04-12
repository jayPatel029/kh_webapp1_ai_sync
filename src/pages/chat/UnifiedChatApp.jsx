import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { MdSend } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import PatientDetailLayout from "../common/PatientDetailLayout";
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
  getAllChats,
  getAllChatsAdmin,
} from "../../ApiCalls/chatApis";
import { createMessageAlert } from "../../ApiCalls/alertsApis";
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

// Per guide §6: Admin/PSadmin are mapped to a shared "SharedAdmin" identity
// in the chat row (messages.sender still holds the real email).
// For SW endpoints (getSWMessages): only true for Admin↔Admin chats.
const isSWChatBetween = (myRole, contactRole) =>
  (myRole === "Admin" || myRole === "PSadmin") &&
  (contactRole === "Admin" || contactRole === "PSadmin");

// Canonical receiver email to use in getChatId / sendMessage.
//
// Problem: If Admin A calls getChatId(adminB_email) and Admin B calls
// getChatId(adminA_email), the backend creates TWO different rows — because
// both JWTs map to SharedAdmin as the sender, making the row direction
// meaningless. The backend can only distinguish these chats by the receiver
// field, so we must ensure BOTH sides pass THE SAME receiver email.
//
// Solution — Admin↔Admin:
//   Use the alphabetically-LARGER email as the canonical receiver.
//   Both admins independently compute [myEmail, contactEmail].sort()[1]
//   and get the same string → getChatId returns ONE chatId for both.
//   Note: The admin with the larger email calls getChatId(ownEmail, pid).
//   This is safe because their JWT becomes SharedAdmin on the server —
//   the stored row is (SharedAdmin, ownEmail), not a literal self-chat.
//
// Solution — Admin↔Doctor:
//   The backend normalizes the admin-side to SharedAdmin in the chat row.
//   If the backend does a bidirectional lookup — (sender=A, receiver=B) OR
//   (sender=B, receiver=A) — both getChatId(adminEmail) and getChatId(doctorEmail)
//   will resolve to the same row. Use standard contact.email for both sides.
//
// Solution — Doctor↔Doctor:
//   No normalization, standard contact.email. No symmetry issue.
const canonicalReceiver = (myRole, contactRole, myEmail, contactEmail) => {
  const iAmAdmin      = myRole === "Admin" || myRole === "PSadmin";
  const contactIsAdmin = contactRole === "Admin" || contactRole === "PSadmin";

  if (iAmAdmin && contactIsAdmin) {
    // Admin↔Admin: pick the alphabetically-larger email as receiver.
    // Both admins independently arrive at the SAME value.
    return [myEmail, contactEmail].sort()[1];
  }

  // All other pairs (Admin↔Doctor, Doctor↔Doctor): use contact's email.
  return contactEmail;
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
      <div className="flex justify-between items-start">
        <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
          {contact.firstname} {contact.lastname}
        </p>
        {contact.lastAt && (
          <span className="text-[9px] text-gray-400 flex-shrink-0 ml-1">{formatTime(contact.lastAt)}</span>
        )}
      </div>
      <RolePill role={contact.role} />
      {contact.lastMessage && (
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{contact.lastMessage}</p>
      )}
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
          }`}
        >
          {message.message}
        </div>
        <p className="text-[10px] text-gray-400 px-1 mt-1">{formatTime(message.sent_at)}</p>
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

  const [role, setRole] = useState("");
  const [sender, setSender] = useState("");
  const [patient, setPatient] = useState({});
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socket = useRef(null);
  const activeChatIdRef = useRef(null);
  const prevChatIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Keep activeChatIdRef in sync for WS handler closure
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── WebSocket: connect once, handle chat:message ──────────────────────────
  // Per guide §4: connect once, join/leave rooms, append on chat:message
  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = io(`${WS_ORIGIN}/chat`, {
      path: SOCKET_IO_PATH,
      auth: { token },
      transports: ["websocket", "polling"],
    });

    ws.on("connect", () => {
      setSocketConnected(true);
      // Re-join the active room on reconnect (guide §5.7)
      if (activeChatIdRef.current) {
        ws.emit("chat:join", { chatId: activeChatIdRef.current });
      }
    });

    ws.on("disconnect", () => setSocketConnected(false));
    ws.on("connect_error", (err) => console.error("[WS] connect_error:", err.message));

    // Guide §5.4: append only if chatId matches open thread, dedupe
    ws.on("chat:message", ({ chatId, sender: msgSender, message, sent_at, patientid }) => {
      if (chatId && activeChatIdRef.current && String(chatId) === String(activeChatIdRef.current)) {
        setMessages((prev) => {
          const dup = prev.some(
            (m) => m.sender === msgSender && m.sent_at === sent_at && m.message === message
          );
          if (dup) return prev;
          return [...prev, { chatId, sender: msgSender, message, sent_at, patientid }];
        });
      }
    });

    ws.on("chat:error", ({ code, message: msg }) =>
      console.error(`[WS] chat:error [${code}]: ${msg}`)
    );

    socket.current = ws;
    return () => {
      // Leave current room and disconnect on unmount
      if (activeChatIdRef.current) ws.emit("chat:leave", { chatId: activeChatIdRef.current });
      ws.disconnect();
    };
  }, []); // once on mount

  // ── Join / leave rooms when activeChatId changes ──────────────────────────
  useEffect(() => {
    if (!socket.current) return;
    const prev = prevChatIdRef.current;
    if (prev && prev !== activeChatId) {
      socket.current.emit("chat:leave", { chatId: prev });
    }
    if (activeChatId && activeChatId !== prev) {
      socket.current.emit("chat:join", { chatId: activeChatId });
    }
    prevChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // ── Data init: load contacts ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingContacts(true);
      setContacts([]);
      setMessages([]);
      setActiveContact(null);
      setActiveChatId(null);

      try {
        // Fetch role, patient info, and chat summaries in parallel
        const [roleRes, patientRes, summariesRes] = await Promise.all([
          identifyRole(),
          getPatientById(patientId),
          chatType === "doctor" ? getAllChats(patientId) : getAllChatsAdmin(patientId),
        ]);

        const userRole = roleRes.data.data.role_name;
        const userEmail = localStorage.getItem("email");
        setRole(userRole);
        setSender(userEmail);
        setPatient(patientRes.data.data[0] || patientRes.data.data);

        const summaries = summariesRes?.success
          ? summariesRes.data.data || summariesRes.data || []
          : [];
        const isAdminRole = userRole === "Admin" || userRole === "PSadmin";

        const findSummary = (email) =>
          summaries.find(
            (s) => s.sender === email || s.receiver === email || s.user_email === email
          );

        const normaliseName = (u) => {
          if (u.firstname) return { firstname: u.firstname, lastname: u.lastname || "" };
          const parts = (u.name || "").trim().split(" ");
          return { firstname: parts[0] || "Staff", lastname: parts.slice(1).join(" ") || "" };
        };

        if (chatType === "doctor") {
          if (isAdminRole) {
            // Admin viewing doctor chat → list doctors (read-only overview)
            const res = await getDoctorsChat(patientId);
            if (res.success) {
              setContacts(
                (res.data.data || []).map((d) => ({
                  email: d.email,
                  ...normaliseName(d),
                  role: "Doctor",
                  profile_photo: d.profile_photo || "",
                }))
              );
            }
          } else {
            // Doctor / Medical Staff: chat with other team members
            const res = await getPatientMedicalTeam(patientId);
            if (res.success) {
              const list = (res.data.data || [])
                .filter((u) => u.email !== userEmail)
                .map((u) => {
                  const summary = findSummary(u.email);
                  return {
                    ...u,
                    ...normaliseName(u),
                    role: u.role || "Doctor",
                    profile_photo: u.photo || u.profile_photo || "",
                    lastMessage: summary?.message || summary?.last_message || "",
                    lastAt: summary?.sent_at || summary?.created_at || "",
                    chatId: summary?.chatid || summary?.chat_id || summary?.chatId || summary?.id,
                  };
                });
              list.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
              setContacts(list);
            }
          }
        } else {
          // Admin Chat
          const res = await getPatientAdminTeam(patientId);
          if (res.success) {
            const list = (res.data.data || [])
              .filter((u) => u.email !== userEmail)
              .map((u) => {
                const summary = findSummary(u.email);
                return {
                  ...u,
                  ...normaliseName(u),
                  role: u.role || "Admin",
                  profile_photo: u.photo || u.profile_photo || "",
                  lastMessage: summary?.message || summary?.last_message || "",
                  lastAt: summary?.sent_at || summary?.created_at || "",
                  chatId: summary?.chatid || summary?.chat_id || summary?.chatId || summary?.id,
                };
              });
            list.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
            setContacts(list);
          }
        }
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    init();
  }, [chatType, patientId]);

  // ── Open chat: REST load history + WS join (guide §5.1–3) ────────────────
  const openChat = useCallback(
    async (contact) => {
      setActiveContact(contact);
      setMessages([]);
      setLoadingMessages(true);

      try {
        const myEmail = localStorage.getItem("email");
        const sw = isSWChatBetween(role, contact.role);
        const iAmAdmin      = role === "Admin" || role === "PSadmin";
        const contactIsAdmin = contact.role === "Admin" || contact.role === "PSadmin";
        const eitherIsAdmin  = iAmAdmin || contactIsAdmin;

        // Get the single canonical receiver email for this pair.
        // See canonicalReceiver() above for full explanation.
        const receiver = canonicalReceiver(role, contact.role, myEmail, contact.email);

        // For any Admin-involved chat: ALWAYS resolve chatId via REST getChatId.
        // Never trust the cached contact.chatId — different API views
        // (/chat/:pid vs /chat/admin/:pid) can see different rows.
        let chatId;
        if (eitherIsAdmin) {
          const idRes = await getChatId(receiver, patientId);
          if (!idRes.success) {
            console.error("[openChat] getChatId failed:", idRes.error);
            return;
          }
          chatId = idRes.data.chatId;
        } else {
          // Doctor↔Doctor: safe to use cached chatId (same summary table)
          chatId = contact.chatId ?? null;
          if (!chatId) {
            const idRes = await getChatId(receiver, patientId);
            if (!idRes.success) return;
            chatId = idRes.data.chatId;
          }
        }

        // Load history via REST — SW endpoint only for Admin↔Admin
        const msgRes = sw ? await getSWMessages(chatId) : await getMessages(chatId);

        if (msgRes.success) {
          setMessages(msgRes.data || []);
          // Setting activeChatId triggers join/leave useEffect → WS chat:join
          setActiveChatId(chatId);
        }
      } catch (err) {
        console.error("openChat error:", err);
      } finally {
        setLoadingMessages(false);
        inputRef.current?.focus();
      }
    },
    [role, patientId]
  );

  // ── Send message: REST POST only (guide §5.5) ─────────────────────────────
  // Do NOT append to messages here — the server broadcasts via WS and we receive it.
  // Use the same canonicalReceiver() as openChat so the POST always lands in the
  // correct chat row (same chatId both parties resolved when opening the chat).
  const handleSend = async () => {
    if (!currentMessage.trim() || !activeContact) return;

    const text = currentMessage.trim();
    setCurrentMessage("");
    inputRef.current?.focus();

    try {
      const myEmail = localStorage.getItem("email");
      const receiver = canonicalReceiver(role, activeContact.role, myEmail, activeContact.email);

      // REST POST — source of truth (guide §5.5)
      const res = await sendMessage({ message: text, receiver, pid: patientId });

      if (res.success) {
        const returnedId = res.data.chatId;
        // If new chat just created, update activeChatId so WS join fires
        if (returnedId && returnedId !== activeChatId) setActiveChatId(returnedId);

        // Alert for doctors
        if (role === "Doctor") {
          createMessageAlert(returnedId, text, patientId).catch(() => {});
        }
        // NOTE: do NOT call setMessages — server echoes via WS chat:message (guide §5.5)
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const sidebarLabel = chatType === "doctor" ? "Medical Team" : "Admin Team";
  const title = chatType === "admin" ? "Admin Chat" : "Doctor Chat";

  const messagesWithSeparators = [...messages]
    .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
    .map((msg, i, arr) => {
      const currDate = formatDate(msg.sent_at);
      const prevDate = i > 0 ? formatDate(arr[i - 1].sent_at) : null;
      return { ...msg, showDateSep: currDate !== prevDate, dateLabel: currDate };
    });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PatientDetailLayout
      title={title}
      patientIdParam="id"
      userData={patient}
      totalUnreadCount={0}
      totalUnreadCountDoc={0}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
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
                  isActive={activeContact?.email === contact.email}
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
            <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
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
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        socketConnected ? "bg-green-400" : "bg-gray-300"
                      }`}
                    />
                    {socketConnected ? "Live" : "Connecting…"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-12 bg-white border-b border-gray-200" />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
            {!activeContact ? (
              <EmptyState
                icon="💬"
                title={`Select a ${chatType === "doctor" ? "team member" : "admin"} to start chatting`}
                subtitle={`Choose someone from the ${sidebarLabel.toLowerCase()} on the left.`}
              />
            ) : loadingMessages ? (
              <div className="flex justify-center pt-10">
                <ReactLoading type="bubbles" color="#3b82f6" height={60} width={60} />
              </div>
            ) : messagesWithSeparators.length === 0 ? (
              <EmptyState
                icon="🌱"
                title="No messages yet"
                subtitle="Send the first message to start the conversation."
              />
            ) : (
              messagesWithSeparators.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  isOwn={msg.sender === sender}
                  showDateSeparator={msg.showDateSep}
                  dateLabel={msg.dateLabel}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
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
                disabled={!activeContact}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!currentMessage.trim() || !activeContact}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-all flex items-center justify-center"
              >
                <MdSend className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PatientDetailLayout>
  );
};

export default UnifiedChatApp;
