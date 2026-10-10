import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdSend, MdArrowBack } from "react-icons/md";
import ReactLoading from "react-loading";
import {
  getContactUsById,
  getContactUsPatients,
  getContactUsByPatient,
  replyToContactUsPatient,
} from "../../ApiCalls/contactus";
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Component Library
import { Box } from "../../component-library";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "?";

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

const patientLabel = (patient, patientId) =>
  (patient?.name && patient.name.trim()) || `Patient ${patientId}`;

const PatientAvatar = ({ src, name }) =>
  src ? (
    <img src={src} alt={name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#32617d] text-white text-sm font-bold">
      {getInitials(name)}
    </div>
  );

const EmptyState = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-2">
    <p className="font-semibold text-gray-600">{title}</p>
    {subtitle && <p className="text-sm text-gray-400 max-w-xs">{subtitle}</p>}
  </div>
);

export default function ContactUs() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPatientId = searchParams.get("patientId");
  const legacyContactUsId = searchParams.get("id");

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const messagesContainerRef = useRef(null);

  const selectPatient = useCallback(
    (patientId) => {
      setSearchParams(patientId ? { patientId: String(patientId) } : {});
    },
    [setSearchParams]
  );

  const loadPatients = useCallback(async () => {
    const response = await getContactUsPatients();
    if (response.success) {
      setPatients(response.data?.patients || []);
      setPatientsError("");
    } else {
      setPatientsError("Could not load patients. Please refresh the page.");
    }
    setLoadingPatients(false);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Old alert links point at a single ContactUs row (?id=); open that row's patient instead.
  useEffect(() => {
    if (selectedPatientId || !legacyContactUsId) return;
    const resolveLegacyLink = async () => {
      const response = await getContactUsById(legacyContactUsId);
      const patientId = response.success ? response.data?.contactus?.patientId : null;
      setSearchParams(patientId ? { patientId: String(patientId) } : {}, { replace: true });
    };
    resolveLegacyLink();
  }, [selectedPatientId, legacyContactUsId, setSearchParams]);

  useEffect(() => {
    setReply("");
    setSendError("");
    if (!selectedPatientId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessagesError("");
      const response = await getContactUsByPatient(selectedPatientId);
      if (cancelled) return;
      if (response.success) {
        setMessages(response.data?.messages || []);
      } else {
        setMessages([]);
        setMessagesError("Could not load messages. Select the patient again to retry.");
      }
      setLoadingMessages(false);
    };
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const text = reply.trim();
    if (!text || !selectedPatientId || sending) return;

    setSending(true);
    setSendError("");
    const response = await replyToContactUsPatient(selectedPatientId, text);
    if (response.success && response.data?.contactus) {
      setMessages((prev) => [...prev, response.data.contactus]);
      setReply("");
      loadPatients();
    } else {
      setSendError(response.error || "Message could not be sent. Please try again.");
    }
    setSending(false);
  };

  const selectedPatient = patients.find(
    (patient) => String(patient.patientId) === String(selectedPatientId)
  );
  const selectedName = patientLabel(selectedPatient, selectedPatientId);

  const messagesWithSeparators = messages.map((msg, i, arr) => {
    const dateLabel = formatDate(msg.createdAt);
    const prevDateLabel = i > 0 ? formatDate(arr[i - 1].createdAt) : null;
    return { ...msg, dateLabel, showDateSeparator: dateLabel !== prevDateLabel };
  });

  const showList = !isMobile || !selectedPatientId;
  const showThread = !isMobile || Boolean(selectedPatientId);

  const renderMessages = () => {
    if (!selectedPatientId) {
      return (
        <EmptyState
          title="Select a patient"
          subtitle="Choose a patient from the list to view their messages."
        />
      );
    }
    if (loadingMessages) {
      return (
        <div className="flex justify-center pt-10">
          <ReactLoading type="bubbles" color="#32617d" height={60} width={60} />
        </div>
      );
    }
    if (messagesError) return <EmptyState title={messagesError} />;
    if (messagesWithSeparators.length === 0) {
      return <EmptyState title="No messages yet" subtitle="Send a message to start the conversation." />;
    }
    return messagesWithSeparators.map((msg) => {
      const isAdmin = msg.senderType === "admin";
      return (
        <React.Fragment key={msg.id}>
          {msg.showDateSeparator && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{msg.dateLabel}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}
          <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
              <p className="text-[11px] text-gray-500 font-medium px-1 mb-0.5">
                {isAdmin ? msg.senderEmail || "Admin" : selectedName}
              </p>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isAdmin
                    ? "bg-[#32617d] text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                }`}
              >
                {msg.message}
              </div>
              <p className="text-[10px] text-gray-400 px-1 mt-1">{formatTime(msg.createdAt)}</p>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Contact Us"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Contact Us", active: true }
            ]}
            onBack={() => navigate(ROUTES.HOME)}
          />
        </Box>

        <div className="h-[75vh] flex overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
          {/* Patient list */}
          {showList && (
            <aside className={`${isMobile ? "w-full" : "w-72 border-r border-gray-200"} flex flex-col flex-shrink-0`}>
              <div className="px-4 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Patients</h2>
                {patients.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {patients.length} conversation{patients.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingPatients ? (
                  <div className="flex justify-center pt-10">
                    <ReactLoading type="bubbles" color="#32617d" height={48} width={48} />
                  </div>
                ) : patientsError ? (
                  <EmptyState title={patientsError} />
                ) : patients.length === 0 ? (
                  <EmptyState title="No messages yet" subtitle="Patient messages will appear here." />
                ) : (
                  patients.map((patient) => {
                    const isActive = String(patient.patientId) === String(selectedPatientId);
                    const name = patientLabel(patient, patient.patientId);
                    return (
                      <button
                        key={patient.patientId}
                        type="button"
                        onClick={() => selectPatient(patient.patientId)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 border-l-4 transition-colors ${
                          isActive ? "bg-[#eef4f7] border-l-[#32617d]" : "hover:bg-gray-50 border-l-transparent"
                        }`}
                      >
                        <PatientAvatar src={patient.profile_photo} name={name} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {formatDate(patient.lastAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {patient.lastSenderType === "admin" ? "You: " : ""}
                            {patient.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>
          )}

          {/* Conversation */}
          {showThread && (
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
              <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-3 min-h-[60px]">
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => selectPatient(null)}
                    className="text-gray-600 p-1 -ml-1"
                    aria-label="Back to patients"
                  >
                    <MdArrowBack className="text-xl" />
                  </button>
                )}
                {selectedPatientId && (
                  <>
                    <PatientAvatar src={selectedPatient?.profile_photo} name={selectedName} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{selectedName}</p>
                      {selectedPatient?.number && (
                        <p className="text-xs text-gray-400">{selectedPatient.number}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {renderMessages()}
              </div>

              <div className="bg-white border-t border-gray-200 px-4 py-3">
                {sendError && <p className="text-xs text-red-600 mb-2 px-2">{sendError}</p>}
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    placeholder={selectedPatientId ? `Message ${selectedName}…` : "Select a patient first…"}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={!selectedPatientId || sending}
                    className="flex-1 resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#32617d] focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!reply.trim() || !selectedPatientId || sending}
                    className="bg-[#32617d] hover:bg-[#274f65] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full p-2.5 flex items-center justify-center"
                    aria-label="Send"
                  >
                    <MdSend className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Box>

    </ThemeProvider>
  );
}
