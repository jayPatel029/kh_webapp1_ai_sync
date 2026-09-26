/**
 * PatientDialysisAlertModal
 * Displays patient-type dialysis alerts from /alerts/byType/patient.
 *
 * Alert shape:
 * { id, date, isOpened, type, category, patientId, alarmId, programName, ... }
 *
 * @file src/pages/adminDashboard/components/PatientDialysisAlertModal.jsx
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../helpers/axios/axiosInstance";
import { server_url } from "../../../constants/constants";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";

// ── helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Group rows by category for a tidier display
const groupByCategory = (alerts) => {
  const map = new Map();
  alerts.forEach((a) => {
    const key = a.category || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(a);
  });
  return [...map.entries()];
};

const CATEGORY_META = {
  "Patient has not answered dialysis alarm for 3 or more days": {
    color: "#ef4444",
    bg: "#fff1f2",
    borderColor: "#fecaca",
    icon: "⚠️",
    short: "Missed Dialysis Alarm",
  },
  "New Program Enrollment": {
    color: "#0891b2",
    bg: "#ecfeff",
    borderColor: "#a5f3fc",
    icon: "🏥",
    short: "Program Enrollment",
  },
};

const getMeta = (category) =>
  CATEGORY_META[category] || {
    color: "#64748b",
    bg: "#f8fafc",
    borderColor: "#e2e8f0",
    icon: "🔔",
    short: category,
  };

// ── AlertRow ─────────────────────────────────────────────────────────────────

const AlertRow = ({ alert, index, onMarkRead }) => {
  const isUnread = alert.isOpened === 0 || alert.isOpened === "0" || alert.isOpened === false;
  const meta = getMeta(alert.category);

  return (
    <div
      className={`flex items-start gap-3 px-5 py-3 border-b last:border-0 transition-colors ${
        isUnread ? "bg-red-50/60" : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 flex-shrink-0">
        {isUnread ? (
          <span className="w-2 h-2 rounded-full bg-red-500 block animate-pulse" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-200 block" />
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 leading-snug">
          {meta.icon} {alert.category}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
          {alert.alarmId && (
            <span className="text-[10px] text-gray-400 font-medium">
              Alarm ID: <span className="text-gray-600 font-semibold">#{alert.alarmId}</span>
            </span>
          )}
          {alert.programName && (
            <span className="text-[10px] text-gray-400 font-medium">
              Program: <span className="text-cyan-600 font-semibold">{alert.programName}</span>
            </span>
          )}
          <span className="text-[10px] text-gray-400 font-medium">
            Alert ID: <span className="text-gray-500">#{alert.id}</span>
          </span>
        </div>
      </div>

      {/* Date + status */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] font-semibold text-gray-500">{formatDate(alert.date)}</span>
        {isUnread ? (
          <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">
            Unread
          </span>
        ) : (
          <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
            Seen
          </span>
        )}
      </div>
    </div>
  );
};

// ── CategorySection ───────────────────────────────────────────────────────────

const CategorySection = ({ category, alerts, onMarkRead }) => {
  const [open, setOpen] = useState(true);
  const meta = getMeta(category);
  const unread = alerts.filter(
    (a) => a.isOpened === 0 || a.isOpened === "0" || a.isOpened === false
  ).length;

  return (
    <div
      className="rounded-xl overflow-hidden border mb-3"
      style={{ borderColor: meta.borderColor }}
    >
      {/* Category header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:brightness-95"
        style={{ background: meta.bg }}
      >
        <span className="text-base">{meta.icon}</span>
        <span className="flex-1 text-sm font-bold" style={{ color: meta.color }}>
          {category}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
            style={{ background: meta.color }}
          >
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </span>
          {unread > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              {unread} unread
            </span>
          )}
          <span
            className="text-xs transition-transform duration-200"
            style={{
              color: meta.color,
              display: "inline-block",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </span>
        </div>
      </button>

      {/* Alert rows */}
      {open && (
        <div className="divide-y divide-gray-100 bg-white">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onMarkRead={onMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

const PatientDialysisAlertModal = ({ alerts = [], patientName, patientId, onClose }) => {
  const navigate = useNavigate();
  const [marking, setMarking] = useState(false);

  const unreadAlerts = alerts.filter(
    (a) => a.isOpened === 0 || a.isOpened === "0" || a.isOpened === false
  );

  const handleMarkAllRead = async () => {
    if (!unreadAlerts.length) return;
    setMarking(true);
    try {
      await Promise.allSettled(
        unreadAlerts.map((a) =>
          axiosInstance.patch(`${server_url}/alerts/${a.id}/open`).catch(() => {})
        )
      );
    } catch (_) {
      // best-effort
    } finally {
      setMarking(false);
      onClose();
    }
  };

  const handleViewProfile = () => {
    if (patientId) navigate(`/patients/${patientId}`);
    onClose();
  };

  const grouped = groupByCategory(alerts);
  const totalUnread = unreadAlerts.length;

  return (
    <ThemedModalShell
      title="Dialysis Alerts"
      subtitle={
        patientName ? (
          <>
            Patient:{" "}
            <span className="font-bold" style={{ color: THEMED_MODAL.ink }}>
              {patientName}
            </span>
          </>
        ) : null
      }
      onClose={onClose}
      width="min(680px, 96vw)"
      maxHeight="88vh"
      toolbar={
        <>
          {patientId ? (
            <button
              type="button"
              onClick={handleViewProfile}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                color: THEMED_MODAL.slate,
                borderColor: THEMED_MODAL.slate,
              }}
            >
              View Profile
            </button>
          ) : null}
          {totalUnread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={marking}
              className="text-xs font-semibold text-green-700 border border-green-500 px-3 py-1.5 rounded-lg hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
            >
              {marking ? "Marking…" : "Mark all read"}
            </button>
          )}
        </>
      }
      footer={
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{alerts.length}</span>{" "}
          alerts ·{" "}
          <span className="font-semibold text-red-500">{totalUnread}</span> unread
          ·{" "}
          <span className="font-semibold text-green-600">
            {alerts.length - totalUnread}
          </span>{" "}
          seen
        </span>
      }
      bodyClassName="px-4 py-4"
    >
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <p className="text-sm font-medium">
            No dialysis alerts for this patient
          </p>
        </div>
      ) : (
        grouped.map(([category, catAlerts]) => (
          <CategorySection
            key={category}
            category={category}
            alerts={catAlerts}
          />
        ))
      )}
    </ThemedModalShell>
  );
};

export default PatientDialysisAlertModal;
