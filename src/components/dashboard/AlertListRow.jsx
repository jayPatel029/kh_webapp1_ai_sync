/**
 * Shared alert list row — Comments / Dialysis / Important Alerts pattern.
 * Unread: red dot + soft red background. Whole row click opens when actionable.
 * Trailing icon shows media (image/pdf), graph, or table when applicable.
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
import { isNavigableSystemAlert } from "../../helpers/alertNavigation";
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

export const getAlertMediaUrl = (alert) =>
  alert?.image ||
  alert?.url ||
  alert?.mediaUrl ||
  extractTypeMediaUrl(alert?.type) ||
  "";

export const isGraphAlert = (alert) =>
  alert?.questionId != null &&
  alert?.questionId !== "" &&
  (alert?.isGraph === 1 || alert?.isGraph === "1" || alert?.isGraph === true);

export const isTableAlert = (alert) =>
  alert?.questionId != null &&
  alert?.questionId !== "" &&
  (alert?.isGraph === 0 || alert?.isGraph === "0" || alert?.isGraph === false);

/**
 * Priority: media → graph → table → route → none (informational only).
 * Matches main: reading alerts open viewers; system alerts route; else no-op.
 */
export const resolveAlertRowKind = (alert) => {
  if (getAlertMediaUrl(alert)) return "media";
  if (isGraphAlert(alert)) return "graph";
  if (isTableAlert(alert)) return "table";
  if (isNavigableSystemAlert(alert)) return "route";
  return "none";
};

const iconStyle = {
  fontSize: 20,
  color: THEMED_MODAL.slate,
  marginTop: 1,
};

const AlertTypeIcon = ({ kind, mediaUrl }) => {
  if (kind === "media") {
    if (/\.pdf$/i.test(mediaUrl || "")) {
      return (
        <FaFilePdf
          className="flex-shrink-0 h-4 w-4 mt-0.5 text-red-500"
          title="PDF available"
          aria-label="PDF available"
        />
      );
    }
    return (
      <ImageOutlinedIcon
        className="flex-shrink-0"
        style={iconStyle}
        titleAccess="Image available"
        aria-label="Image available"
      />
    );
  }

  if (kind === "graph") {
    return (
      <InsertChartIcon
        className="flex-shrink-0"
        style={iconStyle}
        titleAccess="Graph available"
        aria-label="Graph available"
      />
    );
  }

  if (kind === "table") {
    return (
      <DatasetLinkedIcon
        className="flex-shrink-0"
        style={iconStyle}
        titleAccess="Table available"
        aria-label="Table available"
      />
    );
  }

  return null;
};

AlertTypeIcon.propTypes = {
  kind: PropTypes.string.isRequired,
  mediaUrl: PropTypes.string,
};

const AlertListRow = ({ alert, patientNameOverride, onRowClick }) => {
  const unread = isAlertRowUnread(alert);
  const kind = resolveAlertRowKind(alert);
  const mediaUrl = getAlertMediaUrl(alert);
  const actionable = kind !== "none" && typeof onRowClick === "function";
  const title =
    alert?.type?.split("https:")[0]?.trim()?.toUpperCase() || "ALERT";
  const patientName =
    (patientNameOverride && String(patientNameOverride).trim()) ||
    getPatientName(alert);

  const handleActivate = () => {
    if (!actionable) return;
    onRowClick(alert, kind);
  };

  return (
    <div
      role={actionable ? "button" : undefined}
      tabIndex={actionable ? 0 : undefined}
      className={`w-full rounded-xl px-4 py-3 shadow-sm transition-colors ${
        actionable ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        border: `1px solid ${unread ? "#fecaca" : THEMED_MODAL.border}`,
        background: unread ? "#fff8f8" : "#fff",
        textAlign: "left",
      }}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (!actionable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      onMouseEnter={(e) => {
        if (!actionable) return;
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
              className={`text-sm font-semibold break-words flex items-start gap-1.5 ${
                patientName ? "mt-0.5" : ""
              }`}
              style={{ color: alert?.color || THEMED_MODAL.danger }}
            >
              <span className="min-w-0 break-words">{title}</span>
              <AlertTypeIcon kind={kind} mediaUrl={mediaUrl} />
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
      </div>
    </div>
  );
};

AlertListRow.propTypes = {
  alert: PropTypes.object.isRequired,
  patientNameOverride: PropTypes.string,
  onRowClick: PropTypes.func,
};

export default AlertListRow;
