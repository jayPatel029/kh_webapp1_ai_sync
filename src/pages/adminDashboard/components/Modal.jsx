/**
 * Disapprove reason modal — simple required textarea.
 * Portaled above BaseModal (z-index > --z-modal).
 *
 * @file src/pages/adminDashboard/components/Modal.jsx
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import {
  dissapproveAlert,
  dissapproveAllAlerts,
} from "../../../ApiCalls/alertsApis";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";

const toolbarBtn =
  "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

const Modal = ({ closeModal, disAll, item, presId, onSuccess }) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitComment = async () => {
    const reason = content.trim();
    if (!reason) {
      setError("Please enter a reason for disapproving.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      if (disAll) {
        await dissapproveAllAlerts(presId, reason);
        onSuccess?.({ type: "all", presId });
      } else {
        await dissapproveAlert(item.id, item.alarmId, reason);
        onSuccess?.({ type: "one", item });
      }
      closeModal();
    } catch (err) {
      console.error("Disapprove failed:", err);
      setError("Failed to disapprove. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <ThemedModalShell
      title="Reason for disapproval"
      onClose={closeModal}
      width="min(520px, 96vw)"
      zIndex={1500}
      bodyClassName="px-5 sm:px-6 py-4"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            className={toolbarBtn}
            style={{
              borderColor: THEMED_MODAL.slate,
              color: THEMED_MODAL.slate,
              background: "#fff",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitComment}
            disabled={submitting}
            className={toolbarBtn}
            style={{
              borderColor: THEMED_MODAL.danger,
              background: THEMED_MODAL.danger,
              color: "#fff",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Submitting…" : "Confirm disapproval"}
          </button>
        </div>
      }
    >
      {item?.desc ? (
        <p className="text-sm mb-3" style={{ color: THEMED_MODAL.slate }}>
          Medication / alarm:{" "}
          <span style={{ color: THEMED_MODAL.ink, fontWeight: 600 }}>
            {item.desc}
          </span>
        </p>
      ) : null}
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: THEMED_MODAL.ink }}
        htmlFor="disapprove-reason"
      >
        Reason
      </label>
      <textarea
        id="disapprove-reason"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError("");
        }}
        placeholder="Enter reason for disapproving…"
        rows={4}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none resize-none"
        style={{
          borderColor: error ? THEMED_MODAL.danger : THEMED_MODAL.border,
          color: THEMED_MODAL.ink,
        }}
      />
      {error ? (
        <p className="text-xs mt-2" style={{ color: THEMED_MODAL.danger }}>
          {error}
        </p>
      ) : null}
    </ThemedModalShell>,
    document.body
  );
};

Modal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  disAll: PropTypes.bool,
  item: PropTypes.object,
  presId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};

export default Modal;
