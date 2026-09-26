/**
 * Shared alert list row — Comments / Dialysis / Important Alerts pattern.
 * Unread: red dot + soft red background. Actions on the right.
 *
 * @file src/components/dashboard/AlertListRow.jsx
 */

import React from "react";
import PropTypes from "prop-types";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { FaFilePdf } from "react-icons/fa6";
import { getPatientName } from "../../helpers/alertGrouping";
import { THEMED_MODAL } from "../modals/ThemedModalShell";

const formatAlertDate = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return `${d}-${m}-${y}`;
  }
  return String(value);
};

export const isAlertRowUnread = (alert) =>
  alert?.isRead === 0 ||
  alert?.isRead === "0" ||
  alert?.isRead === false ||
  alert?.isRead === "false" ||
  alert?.isOpened === 0 ||
  alert?.isOpened === "0" ||
  alert?.isOpened === false;

const extractTypeMediaUrl = (type) => {
  if (!type || typeof type !== "string") return "";
  const match = type.match(/https?:\/\/\S+/i);
  return match ? match[0] : "";
};

const getAlertMediaUrl = (alert) =>
  alert?.image ||
  alert?.url ||
  alert?.mediaUrl ||
  extractTypeMediaUrl(alert?.type) ||
  "";

const isGraphAlert = (alert) =>
  alert?.questionId != null &&
  alert?.questionId !== "" &&
  (alert?.isGraph === 1 || alert?.isGraph === "1" || alert?.isGraph === true);

const isTableAlert = (alert) =>
  alert?.questionId != null &&
  alert?.questionId !== "" &&
  (alert?.isGraph === 0 || alert?.isGraph === "0" || alert?.isGraph === false);

const actionBtn =
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap";

const AlertListRow = ({
  alert,
  patientNameOverride,
  onOpenDestination,
  onOpenMedia,
  onOpenGraph,
  onOpenTable,
  onDelete,
  showNavigableOpen = true,
}) => {
  const unread = isAlertRowUnread(alert);
  const mediaUrl = getAlertMediaUrl(alert);
  const title =
    alert?.type?.split("https:")[0]?.trim()?.toUpperCase() || "ALERT";
  const isPdf = /\.pdf$/i.test(mediaUrl);
  const patientName =
    (patientNameOverride && String(patientNameOverride).trim()) ||
    getPatientName(alert);

  return (
    <div
      className="w-full rounded-xl px-4 py-3 shadow-sm transition-colors"
      style={{
        border: `1px solid ${unread ? "#fecaca" : THEMED_MODAL.border}`,
        background: unread ? "#fff8f8" : "#fff",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = THEMED_MODAL.cyan;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = unread
          ? "#fecaca"
          : THEMED_MODAL.border;
      }}
    >
      <div className="flex w-full flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-2">
          <span
            className="mt-1.5 inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: unread ? "#fd0000" : "#cbd5e1" }}
            title={unread ? "Unread" : "Read"}
            aria-label={unread ? "Unread" : "Read"}
          />
          <div className="min-w-0 flex-1 text-left">
            {patientName ? (
              <p
                className="text-sm font-bold break-words"
                style={{ color: THEMED_MODAL.ink }}
              >
                {patientName}
              </p>
            ) : null}
            <p
              className={`text-sm font-semibold break-words ${
                patientName ? "mt-0.5" : ""
              }`}
              style={{ color: alert?.color || THEMED_MODAL.danger }}
            >
              {title}
            </p>
            {alert?.category ? (
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: THEMED_MODAL.slate }}
              >
                {alert.category}
              </p>
            ) : null}
            {alert?.date ? (
              <p
                className="text-xs mt-1"
                style={{ color: THEMED_MODAL.slate }}
              >
                {formatAlertDate(alert.date)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 flex-wrap flex-shrink-0">
          {showNavigableOpen && onOpenDestination ? (
            <button
              type="button"
              onClick={() => onOpenDestination(alert)}
              className={actionBtn}
              style={{
                background: THEMED_MODAL.cyan,
                borderColor: THEMED_MODAL.cyan,
                color: "#fff",
              }}
              title="Open related page"
            >
              Open
            </button>
          ) : null}

          {mediaUrl && onOpenMedia ? (
            <button
              type="button"
              onClick={() => onOpenMedia(mediaUrl)}
              className={actionBtn}
              style={{
                borderColor: THEMED_MODAL.blue,
                color: THEMED_MODAL.blue,
                background: "#eff2ff",
              }}
              title={isPdf ? "Open document" : "Open image"}
            >
              {isPdf ? (
                <FaFilePdf className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <ImageOutlinedIcon style={{ fontSize: 16 }} />
              )}
              {isPdf ? "View file" : "View image"}
            </button>
          ) : null}

          {isGraphAlert(alert) && onOpenGraph ? (
            <button
              type="button"
              onClick={() => onOpenGraph(alert)}
              className={actionBtn}
              style={{
                borderColor: THEMED_MODAL.slate,
                color: THEMED_MODAL.slate,
                background: "#fff",
              }}
              title="Open graph"
            >
              <InsertChartIcon style={{ fontSize: 18 }} />
              Graph
            </button>
          ) : null}

          {isTableAlert(alert) && onOpenTable ? (
            <button
              type="button"
              onClick={() => onOpenTable(alert)}
              className={actionBtn}
              style={{
                borderColor: THEMED_MODAL.slate,
                color: THEMED_MODAL.slate,
                background: "#fff",
              }}
              title="Open table"
            >
              <DatasetLinkedIcon style={{ fontSize: 18 }} />
              Table
            </button>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(alert)}
              className="text-xs text-red-400 hover:text-red-600 px-1 transition-colors"
              title="Delete alert"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

AlertListRow.propTypes = {
  alert: PropTypes.object.isRequired,
  patientNameOverride: PropTypes.string,
  onOpenDestination: PropTypes.func,
  onOpenMedia: PropTypes.func,
  onOpenGraph: PropTypes.func,
  onOpenTable: PropTypes.func,
  onDelete: PropTypes.func,
  showNavigableOpen: PropTypes.bool,
};

export default AlertListRow;
