/**
 * PatientDialysisAlertModal
 * Patient dialysis alerts — same ThemedModalShell size/row/unread pattern
 * as Important Alerts and Comments.
 *
 * @file src/pages/adminDashboard/components/PatientDialysisAlertModal.jsx
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/routeConstants";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";

const formatDate = (iso) => {
  if (!iso) return "—";
  const raw = String(iso).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return `${d}-${m}-${y}`;
  }
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isUnread = (alert) =>
  alert?.isOpened === 0 ||
  alert?.isOpened === "0" ||
  alert?.isOpened === false ||
  alert?.isRead === 0 ||
  alert?.isRead === "0" ||
  alert?.isRead === false;

const toolbarBtn =
  "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

const DialysisAlertRow = ({ alert }) => {
  const unread = isUnread(alert);
  const title =
    alert?.type?.split("https:")[0]?.trim() ||
    alert?.category ||
    "Dialysis alert";

  return (
    <div
      className="w-full rounded-xl px-4 py-3 shadow-sm transition-colors"
      style={{
        border: `1px solid ${unread ? "#fecaca" : THEMED_MODAL.border}`,
        background: unread ? "#fff8f8" : "#fff",
        textAlign: "left",
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
            <p
              className="text-sm font-semibold break-words"
              style={{ color: alert?.color || THEMED_MODAL.danger }}
            >
              {title}
            </p>
            {alert?.category && alert?.type ? (
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: THEMED_MODAL.ink }}
              >
                {alert.category}
              </p>
            ) : null}
            {(alert?.alarmId || alert?.programName) && (
              <p className="text-xs mt-1" style={{ color: THEMED_MODAL.slate }}>
                {[
                  alert.alarmId != null ? `Alarm #${alert.alarmId}` : null,
                  alert.programName ? `Program: ${alert.programName}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
        <p
          className="text-sm font-bold flex-shrink-0"
          style={{ color: THEMED_MODAL.slate }}
        >
          {formatDate(alert.date)}
        </p>
      </div>
    </div>
  );
};

const PatientDialysisAlertModal = ({
  alerts = [],
  patientName,
  patientId,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (patientId) navigate(ROUTES.userProfile(patientId));
    onClose?.();
  };

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
      width="min(1100px, 96vw)"
      maxHeight="90vh"
      toolbar={
        patientId ? (
          <button
            type="button"
            onClick={handleViewProfile}
            className={toolbarBtn}
            style={{
              borderColor: THEMED_MODAL.slate,
              color: THEMED_MODAL.slate,
              background: "#fff",
            }}
          >
            View Profile
          </button>
        ) : null
      }
      bodyClassName="px-4 sm:px-5 py-4"
    >
      {alerts.length === 0 ? (
        <p
          className="text-sm py-10"
          style={{ color: THEMED_MODAL.slate, textAlign: "left" }}
        >
          No dialysis alerts for this patient.
        </p>
      ) : (
        <div className="flex w-full flex-col gap-3 items-stretch">
          {alerts.map((alert, index) => (
            <DialysisAlertRow
              key={alert.id ?? `dialysis-alert-${index}`}
              alert={alert}
            />
          ))}
        </div>
      )}
    </ThemedModalShell>
  );
};

export default PatientDialysisAlertModal;
