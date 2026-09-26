import React, { useEffect, useState } from "react";
import { addComment, getComments } from "../../../ApiCalls/commentApi";
import MyPDFViewer from "../../../components/pdf/MyPDFViewer";
import { useIsMobile } from "../../../components/mobile/useIsMobile";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";

const THEME = {
  ...THEMED_MODAL,
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
    <ThemedModalShell
      title="View & Comment"
      onClose={closeModal}
      width="min(1200px, 96vw)"
      height={isMobile ? "min(95vh, 900px)" : "min(88vh, 820px)"}
      zIndex={60}
      fillBody
      bodyScroll={false}
    >
      <div
        className={`flex-1 min-h-0 flex ${
          isMobile ? "flex-col" : "flex-row"
        }`}
      >
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

        <div
          className={`flex flex-col min-h-0 bg-white ${
            isMobile ? "flex-1" : "w-[42%]"
          }`}
        >
          <div
            className="px-4 py-2 text-xs font-semibold flex-shrink-0"
            style={{
              color: THEME.slate,
              borderBottom: `1px solid ${THEME.border}`,
            }}
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
                        background: isDoctor
                          ? THEME.doctorBg
                          : THEME.patientBg,
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
    </ThemedModalShell>
  );
};

export default ThumbnailModal;
