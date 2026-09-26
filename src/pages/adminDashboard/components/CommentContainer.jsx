import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ThumbnailModal from "./ThumbnailModal";
import { insertAlert } from "../../../ApiCalls/appAlerts";
import SendMessage from "./SendMessage";
import { isValidHttpUrl } from "../../../helpers/utils";
import { useIsMobile } from "../../../components/mobile/useIsMobile";
import { ROUTES } from "../../../routes/routeConstants";

/** New-layout theme (dashboard / AlertRow / dialysis modal). */
const THEME = {
  ink: "#32617d",
  slate: "#3F6B85",
  cyan: "#00cccc",
  blue: "#4164df",
  blueHover: "#3554c7",
  border: "#e5eef3",
  danger: "#dc2626",
  type: "#d97706",
};

const formatCommentDate = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return `${d}-${m}-${y}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
};

const CommentContainer = ({ comments, closeModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState("");
  const [comment, setComment] = useState(null);
  const [smessage, setSmessage] = useState(false);
  const { isMobile } = useIsMobile();

  const patientId = comments?.[0]?.userId || comments?.[0]?.patientId;
  const patientName = comments?.[0]?.name || "";

  const openSendMessage = () => setSmessage(true);
  const closeSendMessage = () => setSmessage(false);

  const openThumbnailModal = (img, nextComment) => {
    setComment(nextComment);
    setIsModalOpen(true);
    setImage(img);
  };

  const closeThumbnailModal = async () => {
    setIsModalOpen(false);
  };

  const consultDoctor = async () => {
    if (!patientId) return;
    const doctorEmail = localStorage.getItem("email");
    try {
      await insertAlert(doctorEmail, patientId, "Consult Doctor", "");
      alert("Your Message has been sent for immediate consultation");
    } catch (error) {
      console.log(error);
      alert("something Went wrong please try again");
    }
  };

  const visibleComments = useMemo(() => {
    const list = Array.isArray(comments) ? [...comments] : [];
    return list
      .filter((c) => isValidHttpUrl(c?.url))
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
  }, [comments]);

  const outlineBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    border: `1px solid ${THEME.slate}`,
    color: THEME.slate,
    background: "#fff",
    padding: isMobile ? "0.4rem 0.75rem" : "0.45rem 0.9rem",
    fontSize: isMobile ? "0.7rem" : "0.75rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
    textDecoration: "none",
  };

  const solidBlueBtn = {
    ...outlineBtn,
    border: `1px solid ${THEME.blue}`,
    background: THEME.blue,
    color: "#fff",
  };

  const solidDangerBtn = {
    ...outlineBtn,
    border: `1px solid ${THEME.danger}`,
    background: THEME.danger,
    color: "#fff",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{
          width: isMobile ? "100%" : "min(720px, 96vw)",
          maxHeight: "90vh",
          textAlign: "left",
        }}
      >
        {/* Header — new theme gradient */}
        <div
          className="px-5 sm:px-6 py-4 flex-shrink-0 relative"
          style={{
            background:
              "linear-gradient(135deg, #1e3a5f 0%, #3F6B85 55%, #00cccc 100%)",
          }}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
            aria-label="Close"
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="pr-10 text-left">
            <h2 className="text-white text-lg sm:text-xl font-bold leading-tight">
              Comments
            </h2>
            {patientName ? (
              <p className="text-cyan-100 text-sm font-medium mt-1">
                Patient:{" "}
                <span className="text-white font-bold">{patientName}</span>
              </p>
            ) : null}
            <p className="text-white/70 text-xs mt-1">
              {visibleComments.length} attachment
              {visibleComments.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Actions toolbar — left-aligned */}
        <div
          className="px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-start gap-2 border-b flex-shrink-0"
          style={{ borderColor: THEME.border, background: "#f8fafc" }}
        >
          {patientId ? (
            <Link to={ROUTES.userProfile(patientId)} style={outlineBtn}>
              View Profile
            </Link>
          ) : null}
          <button type="button" onClick={consultDoctor} style={solidDangerBtn}>
            Consult Doctor
          </button>
          <button type="button" onClick={openSendMessage} style={solidBlueBtn}>
            Send Message
          </button>
        </div>

        {isModalOpen && (
          <ThumbnailModal
            closeModal={closeThumbnailModal}
            image={image}
            comment={comment}
          />
        )}
        {smessage && patientId && (
          <SendMessage closeModal={closeSendMessage} patientid={patientId} />
        )}

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {visibleComments.length === 0 ? (
            <p
              className="text-sm py-10"
              style={{ color: THEME.slate, textAlign: "left" }}
            >
              No comments with attachments to show.
            </p>
          ) : (
            <div className="flex w-full flex-col gap-3 items-stretch">
              {visibleComments.map((item, index) => (
                <div
                  key={item.id ?? `${item.url}-${index}`}
                  className="w-full rounded-xl px-4 py-3 shadow-sm transition-colors"
                  style={{
                    border: `1px solid ${THEME.border}`,
                    background: "#fff",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = THEME.cyan;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = THEME.border;
                  }}
                >
                  <div className="flex w-full flex-row items-start justify-between gap-3">
                    <div className="min-w-0 flex-1" style={{ textAlign: "left" }}>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: THEME.type, textAlign: "left" }}
                      >
                        {item.fileType === "Lab"
                          ? "Lab Report"
                          : item.fileType || "Comment"}
                      </p>
                      <p
                        className="text-sm font-semibold break-words"
                        style={{ color: THEME.ink, textAlign: "left" }}
                      >
                        PATIENT COMMENT — &quot;{item.content || "—"}&quot;
                      </p>
                      {item.date ? (
                        <p
                          className="text-xs mt-1"
                          style={{ color: THEME.slate, textAlign: "left" }}
                        >
                          {formatCommentDate(item.date)}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => openThumbnailModal(item.url, item)}
                      style={{ ...solidBlueBtn, marginLeft: "auto", flexShrink: 0 }}
                    >
                      View/Comment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentContainer;
