import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getContactUsByPatient,
  replyToContactUsPatient,
} from "../../../ApiCalls/contactus";
import PageHeader from "../../../components/PageHeader";
import ThemeProvider from "../../../components/ThemeProvider";
import { ROUTES } from "../../../routes/routeConstants";
import dummyadmin from "../../../assets/dummyadmin.png";

// Component Library
import { Box } from "../../../component-library";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${time}`;
};

export default function ContactUsThread() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    if (!patientId) {
      navigate(ROUTES.SUPPORT, { replace: true });
      return;
    }
    const fetchMessages = async () => {
      setLoading(true);
      const response = await getContactUsByPatient(patientId);
      if (response.success) {
        setPatient(response.data?.patient || null);
        setMessages(response.data?.messages || []);
        setError("");
      } else {
        setError("Could not load messages. Please refresh the page.");
      }
      setLoading(false);
    };
    fetchMessages();
  }, [patientId, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || sending) return;

    setSending(true);
    setSendError("");
    const response = await replyToContactUsPatient(patientId, text);
    if (response.success && response.data?.contactus) {
      setMessages((prev) => [response.data.contactus, ...prev]);
      setReply("");
    } else {
      setSendError(response.error || "Message could not be sent. Please try again.");
    }
    setSending(false);
  };

  const patientName = patient?.name || `Patient ${patientId}`;

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Contact Us"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Contact Us", path: ROUTES.SUPPORT },
              { label: patientName, active: true }
            ]}
            onBack={() => navigate(ROUTES.SUPPORT)}
          />
        </Box>

        {/* Patient Details */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__header-title">Patient Details</h2>
          </div>
          <div className="admin-card__body">
            <div className="flex items-center gap-4 p-4">
              <img
                src={patient?.profile_photo || dummyadmin}
                alt={patientName}
                className="admin-avatar admin-avatar--lg"
              />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-800 truncate">{patientName}</p>
                <p className="text-sm text-gray-500">Phone No.: {patient?.number || "-"}</p>
                <p className="text-sm text-gray-500">Messages: {messages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__header-title">Messages</h2>
          </div>
          <div className="admin-card__body">
            <form onSubmit={handleSend} className="p-4 space-y-3 border-b border-gray-100">
              {sendError && <div className="admin-message admin-message--error">{sendError}</div>}
              <textarea
                placeholder={`Write a message to ${patientName}...`}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                disabled={sending || Boolean(error)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#32617d] disabled:opacity-50"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!reply.trim() || sending || Boolean(error)}
                  className="px-6 py-2 bg-[#32617d] text-white rounded-lg text-sm font-semibold hover:bg-[#274f65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>

            {loading ? (
              <p className="p-4 text-sm text-gray-500">Loading messages...</p>
            ) : error ? (
              <div className="admin-message admin-message--error">{error}</div>
            ) : messages.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No messages yet.</p>
            ) : (
              <ul>
                {messages.map((message) => {
                  const isAdmin = message.senderType === "admin";
                  return (
                    <li
                      key={message.id}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      style={{ borderLeft: `4px solid ${isAdmin ? "#32617d" : "transparent"}` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className={`admin-badge ${isAdmin ? "admin-badge--teal" : "admin-badge--gray"}`}>
                          {isAdmin ? `Admin${message.senderEmail ? ` · ${message.senderEmail}` : ""}` : "Patient"}
                        </span>
                        <span className="text-xs text-gray-500">{formatDateTime(message.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Box>

    </ThemeProvider>
  );
}
