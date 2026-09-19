/**
 * AlertRow — single flat alert row (main AdminContainer UserCard shape),
 * styled with the current new-layout theme.
 *
 * @file src/components/dashboard/AlertRow.jsx
 */

import React from "react";
import PropTypes from "prop-types";
import {
  getPatientName,
  isUnreadAlert,
} from "../../helpers/alertGrouping";
import { getAlertCategory } from "../../helpers/alertNavigation";

const formatAlertDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const raw = String(value).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split("-");
      return `${d}-${m}-${y}`;
    }
    return String(value);
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const initialsFromName = (name) => {
  const parts = String(name || "P")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "P";
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
};

const AlertRow = ({ alert, onClick, patientNameOverride }) => {
  const name = patientNameOverride || getPatientName(alert);
  const category = getAlertCategory(alert) || "Alert";
  const unread = isUnreadAlert(alert);
  const avatar = alert?.patientProfilePhoto || alert?.profile_photo || alert?.avatar || "";

  return (
    <button
      type="button"
      onClick={() => onClick?.(alert)}
      className="w-full text-left bg-white border border-[#e5eef3] rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:border-[#00cccc] hover:shadow-md transition-all cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-[#dbeafe] text-[#3F6B85] flex-shrink-0 overflow-hidden flex items-center justify-center font-semibold text-sm">
        {avatar ? (
          <img src={avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          initialsFromName(name)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-1 text-sm">
          <span className="font-semibold text-[#3F6B85]">Category:</span>
          <span className="text-gray-800 truncate">{category}</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1 text-sm mt-0.5">
          <span className="font-semibold text-[#3F6B85]">Name:</span>
          <span className="text-gray-900 truncate">{name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        <span className="text-sm font-medium text-gray-600">
          {formatAlertDate(alert?.date || alert?.created_at || alert?.updated_at)}
        </span>
        {unread ? (
          <span
            className="inline-block w-2.5 h-2.5 rounded-full bg-[#fd0000]"
            title="Unread"
            aria-label="Unread"
          />
        ) : (
          <span className="inline-block w-2.5 h-2.5" aria-hidden />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-[#3F6B85]"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
  );
};

AlertRow.propTypes = {
  alert: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  patientNameOverride: PropTypes.string,
};

export default AlertRow;
