import React, { useEffect, useState } from "react";
import { addComment, getComments } from "../../../ApiCalls/commentApi";
import MyPDFViewer from "../../../components/pdf/MyPDFViewer";
import { useIsMobile } from "../../../components/mobile/useIsMobile";

/** New-layout theme (matches CommentContainer). */
const THEME = {
  ink: "#32617d",
  slate: "#3F6B85",
  cyan: "#00cccc",
  blue: "#4164df",
  border: "#e5eef3",
  doctorBg: "#eef2ff",
  doctorBorder: "#c7d2fe",
  patientBg: "#e6fafa",
  patientBorder: "#a5f3fc",
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const dateObject = new Date(dateString);
  const offsetInMinutes = 330;
  const istDateObject = new Date(
    dateObject.getTime() + offsetInMinutes * 60000
  );

  const day = istDateObject.getDate();
  const month = istDateObject.toLocaleString("default", { month: "short" });
  const year = istDateObject.getFullYear();

  let hours = istDateObject.getHours();
  const minutes = istDateObject.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

const ThumbnailModal = ({ closeModal, image, comment }) => {
  const [newComment, setNewComment] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isMobile } = useIsMobile();

  const fileType =
    comment?.fileType === "Lab" ? "Lab Report" : comment?.fileType || "File";

  useEffect(() => {
    const data = {
      fileId: comment?.fileId || 0,
      fileType: comment?.fileType || 0,
    };
    getComments(data)
      .then((res) => {
        setPrevComments(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
        setPrevComments([]);
      });
  }, [refreshKey, comment?.fileId, comment?.fileType]);

  useEffect(() => {
    setLoading(true);
    if (image) setLoading(false);
  }, [image]);

  const isPdf = /\.pdf$/i.test(String(image || ""));

  const uploadComment = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || submitting) return;

    // comments.userId is patient integer id — not doctor email (docId carries email).
    const patientUserId =
      comment?.userId ?? comment?.patientId ?? comment?.userid ?? null;
    if (patientUserId == null || Number.isNaN(Number(patientUserId))) {
      console.error("Cannot add comment: missing patient userId on comment", comment);
      alert("Unable to post comment — patient id is missing.");
      return;
    }

    try {
      setSubmitting(true);
      await addComment(
        trimmedComment,
        comment.fileId,
        comment.fileType,
        Number(patientUserId),
        1
      );
      setNewComment("");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onComposeKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      uploadComment();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{
          width: isMobile ? "100%" : "min(1200px, 96vw)",
          height: isMobile ? "min(95vh, 900px)" : "min(88vh, 820px)",
          textAlign: "left",
        }}
      >
        {/* Header — white + inset teal separator */}
        <div className="px-5 sm:px-6 pt-3.5 pb-0 flex-shrink-0 relative bg-white">
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ color: THEME.slate }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
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

          <div className="pr-10 text-left pb-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: THEME.cyan }}
            >
              {fileType}
            </p>
            <h2
              className="text-lg font-bold leading-tight mt-0.5"
              style={{ color: THEME.ink }}
            >
              View &amp; Comment
            </h2>
          </div>
          <div
            aria-hidden
            style={{
              height: 3,
              marginLeft: isMobile ? 12 : 10,
              marginRight: isMobile ? 12 : 10,
              background: THEME.cyan,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Body: split on desktop, stack on mobile */}
        <div
          className={`flex-1 min-h-0 flex ${
            isMobile ? "flex-col" : "flex-row"
          }`}
        >
          {/* File preview — scrollable, fits images/PDFs in pane */}
          <div
            className={`flex flex-col min-h-0 ${
              isMobile ? "h-[42%] border-b" : "w-[58%] border-r"
            }`}
            style={{ borderColor: THEME.border, background: "#f8fafc" }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3">
              {loading ? (
                <div className="h-full min-h-[200px] flex items-center justify-center">
                  <p className="text-sm" style={{ color: THEME.slate }}>
                    Loading…
                  </p>
                </div>
              ) : isPdf ? (
                <div
                  className="w-full h-full min-h-0"
                  style={{ minHeight: isMobile ? 220 : 360 }}
                >
                  <MyPDFViewer file={image} fitWidth />
                </div>
              ) : (
                <div className="w-full overflow-x-hidden">
                  <img
                    src={image || ""}
                    alt={fileType}
                    className="rounded-lg shadow-sm block mx-auto"
                    style={{
                      maxWidth: "100%",
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Comments panel */}
          <div
            className={`flex flex-col min-h-0 bg-white ${
              isMobile ? "flex-1" : "w-[42%]"
            }`}
          >
            <div
              className="px-4 py-2 text-xs font-semibold flex-shrink-0"
              style={{ color: THEME.slate, borderBottom: `1px solid ${THEME.border}` }}
            >
              Conversation
              {prevComments.length > 0 ? (
                <span className="ml-1 font-normal opacity-70">
                  ({prevComments.length})
                </span>
              ) : null}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
              {prevComments.length === 0 ? (
                <p className="text-sm py-6" style={{ color: THEME.slate }}>
                  No comments yet. Add the first one below.
                </p>
              ) : (
                prevComments.map((item) => {
                  const isDoctor = Boolean(item.isDoctor);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 ${
                        isDoctor ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: isDoctor ? THEME.blue : THEME.cyan,
                        }}
                        title={isDoctor ? "Doctor" : "Patient"}
                      >
                        {isDoctor ? "D" : "P"}
                      </div>
                      <div
                        className="max-w-[85%] rounded-xl px-3 py-2 text-left shadow-sm"
                        style={{
                          background: isDoctor ? THEME.doctorBg : THEME.patientBg,
                          border: `1px solid ${
                            isDoctor ? THEME.doctorBorder : THEME.patientBorder
                          }`,
                        }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                          style={{ color: isDoctor ? THEME.blue : THEME.cyan }}
                        >
                          {isDoctor ? "Doctor" : "Patient"}
                        </p>
                        <p
                          className="text-sm font-medium break-words"
                          style={{ color: THEME.ink }}
                        >
                          {item.content}
                        </p>
                        <p
                          className="text-[10px] mt-1"
                          style={{ color: THEME.slate }}
                        >
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Compose */}
            <div
              className="flex-shrink-0 px-4 py-3 border-t"
              style={{ borderColor: THEME.border, background: "#f8fafc" }}
            >
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: THEME.slate }}
                htmlFor="thumbnail-new-comment"
              >
                Add a comment
              </label>
              <textarea
                id="thumbnail-new-comment"
                className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
                style={{
                  border: `1px solid ${THEME.border}`,
                  color: THEME.ink,
                  minHeight: "44px",
                }}
                rows={2}
                value={newComment}
                placeholder="Write a reply…"
                onChange={(e) => {
                  setNewComment(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={onComposeKeyDown}
                onFocus={(e) => {
                  e.target.style.borderColor = THEME.blue;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = THEME.border;
                }}
              />
              <div className="flex items-center justify-between mt-2 gap-2">
                <span className="text-[10px]" style={{ color: THEME.slate }}>
                  Ctrl+Enter to send
                </span>
                <button
                  type="button"
                  onClick={uploadComment}
                  disabled={submitting || !newComment.trim()}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: THEME.blue }}
                >
                  {submitting ? "Sending…" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailModal;
