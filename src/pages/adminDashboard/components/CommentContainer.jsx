import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ThumbnailModal from "./ThumbnailModal";
import { insertAlert } from "../../../ApiCalls/appAlerts";
import SendMessage from "./SendMessage";
import { isValidHttpUrl } from "../../../helpers/utils";
import { useIsMobile } from "../../../components/mobile/useIsMobile";
import { ROUTES } from "../../../routes/routeConstants";

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

  const actionBtn =
    "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 overflow-y-auto p-2 sm:p-4">
      <div
        className={`relative bg-white shadow-md border-t-4 border-primary rounded-xl z-50 overflow-y-auto w-full ${
          isMobile ? "max-h-[95vh] p-4" : "max-w-5xl max-h-[92vh] p-6"
        }`}
      >
        {/* Close icon — top right */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
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

        {/* Header */}
        <div className="pr-10 border-b border-[#e5eef3] pb-4 mb-4">
          <h2 className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-[#3F6B85] text-left`}>
            Comments
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-start gap-2">
            {patientId ? (
              <Link
                to={ROUTES.userProfile(patientId)}
                className={`${actionBtn} border-[#00cccc] text-[#00cccc] hover:bg-[#e6fafa]`}
              >
                View Profile
              </Link>
            ) : null}
            <button
              type="button"
              onClick={consultDoctor}
              className={`${actionBtn} border-red-600 bg-red-600 text-white hover:bg-red-700`}
            >
              Consult Doctor
            </button>
            <button
              type="button"
              onClick={openSendMessage}
              className={`${actionBtn} border-[#00cccc] bg-[#00cccc] text-white hover:bg-[#00b3b3]`}
            >
              Send Message
            </button>
          </div>
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

        {/* Comment rows */}
        {visibleComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-left py-8">
            No comments with attachments to show.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleComments.map((item, index) => (
              <div
                key={item.id ?? `${item.url}-${index}`}
                className="border border-[#e5eef3] rounded-xl px-4 py-3 shadow-sm hover:border-[#00cccc]/60 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-1">
                      {item.fileType === "Lab" ? "Lab Report" : item.fileType || "Comment"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      PATIENT COMMENT — &quot;{item.content || "—"}&quot;
                    </p>
                    {item.date ? (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCommentDate(item.date)}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => openThumbnailModal(item.url, item)}
                    className={`${actionBtn} shrink-0 border-[#00cccc] bg-[#00cccc] text-white hover:bg-[#00b3b3] sm:self-center`}
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
  );
};

export default CommentContainer;
