/**
 * Approve Prescription modal — ThemedModalShell, nested prescription viewer,
 * mark-read only after approve / disapprove.
 *
 * @file src/pages/adminDashboard/components/ApprovePrescriptionModal.jsx
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  approveAlert,
  approveAllAlerts,
  updateIsReadAlert,
} from "../../../ApiCalls/alertsApis";
import { getPatientId } from "../../../helpers/alertGrouping";
import ThemedModalShell, {
  THEMED_MODAL,
} from "../../../components/modals/ThemedModalShell";
import SimpleModal from "./SimpleModal";
import DisapproveReasonModal from "./Modal";

const actionBtn =
  "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap";

const getPrescriptionImageUrl = (item) =>
  item?.presImg ||
  item?.Prescription ||
  item?.prescriptionImage ||
  item?.prescription_image ||
  item?.image ||
  item?.url ||
  "";

const formatDate = (value) => {
  if (!value) return "—";
  const raw = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return `${d}-${m}-${y}`;
  }
  return String(value);
};

const groupByPresId = (list) => {
  const groups = {};
  (list || []).forEach((item) => {
    const key = String(
      item?.presId ?? item?.prescriptionId ?? item?.prescription_id ?? "unknown"
    );
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

const PrescriptionModal = ({ closeModal, onResolved }) => {
  const [alerts, setAlerts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerPatientId, setViewerPatientId] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [disapproveCtx, setDisapproveCtx] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("prescriptionAlerts");
      setAlerts(raw ? JSON.parse(raw) : []);
    } catch {
      setAlerts([]);
    }
  }, []);

  const groupedData = useMemo(() => groupByPresId(alerts), [alerts]);
  const patientId = useMemo(() => {
    const first = alerts[0];
    return first ? getPatientId(first) || first.patientId : null;
  }, [alerts]);

  const markAlertsRead = async (items) => {
    const list = (items || []).filter((a) => a?.id != null);
    for (const alert of list) {
      try {
        await updateIsReadAlert({ id: alert.id });
      } catch (err) {
        console.error("mark prescription alert read failed", err);
      }
    }
    const ids = list.map((a) => a.id);
    onResolved?.(ids);
  };

  const removeAlertsByPredicate = useCallback(
    (predicate) => {
      setAlerts((prev) => {
        const next = prev.filter((a) => !predicate(a));
        localStorage.setItem("prescriptionAlerts", JSON.stringify(next));
        if (next.length === 0) {
          queueMicrotask(() => closeModal());
        }
        return next;
      });
    },
    [closeModal]
  );

  const handleApprove = async (item) => {
    if (!item || busy) return;
    setBusy(true);
    try {
      await approveAlert(item.id, item.alarmId);
      await markAlertsRead([item]);
      removeAlertsByPredicate((a) => a.id === item.id);
    } catch (err) {
      console.error("Approve failed:", err);
      window.alert("Failed to approve. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleApproveAll = async (presId, items) => {
    if (busy) return;
    setBusy(true);
    try {
      await approveAllAlerts(presId);
      await markAlertsRead(items);
      removeAlertsByPredicate(
        (a) =>
          String(a.presId ?? a.prescriptionId ?? a.prescription_id) ===
          String(presId)
      );
    } catch (err) {
      console.error("Approve all failed:", err);
      window.alert("Failed to approve all. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const openDisapproveOne = (item, presId) => {
    setDisapproveCtx({ disAll: false, item, presId });
  };

  const openDisapproveAll = (presId, items) => {
    setDisapproveCtx({
      disAll: true,
      item: items?.[0] || null,
      presId,
      items,
    });
  };

  const handleDisapproveSuccess = async ({ type, item, presId }) => {
    if (type === "one" && item) {
      await markAlertsRead([item]);
      removeAlertsByPredicate((a) => a.id === item.id);
      return;
    }
    if (type === "all") {
      const group =
        disapproveCtx?.items ||
        alerts.filter(
          (a) =>
            String(a.presId ?? a.prescriptionId ?? a.prescription_id) ===
            String(presId)
        );
      await markAlertsRead(group);
      removeAlertsByPredicate(
        (a) =>
          String(a.presId ?? a.prescriptionId ?? a.prescription_id) ===
          String(presId)
      );
    }
  };

  const openPrescriptionViewer = (item) => {
    const url = getPrescriptionImageUrl(item);
    if (!url) {
      window.alert("No prescription image available for this alert.");
      return;
    }
    setViewerUrl(url);
    setViewerPatientId(item?.patientId || patientId);
    setShowViewer(true);
  };

  const groupKeys = Object.keys(groupedData);

  return (
    <>
      <ThemedModalShell
        title="Prescription alerts"
        subtitle="Approve or disapprove digitised prescription alarms"
        onClose={closeModal}
        width="min(1100px, 96vw)"
        maxHeight="90vh"
        bodyClassName="px-4 sm:px-5 py-4"
      >
        {groupKeys.length === 0 ? (
          <p
            className="text-sm py-10"
            style={{ color: THEMED_MODAL.slate, textAlign: "left" }}
          >
            No prescription alerts
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {groupKeys.map((presId) => {
              const items = groupedData[presId];
              const first = items[0] || {};
              const hasImage = Boolean(getPrescriptionImageUrl(first));
              return (
                <div
                  key={presId}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: THEMED_MODAL.border }}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3"
                    style={{ background: "#f8fafc" }}
                  >
                    <div className="text-left min-w-0">
                      <p
                        className="text-sm font-bold"
                        style={{ color: THEMED_MODAL.ink }}
                      >
                        Prescription on {formatDate(first.date)}
                      </p>
                      {first.name ? (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: THEMED_MODAL.slate }}
                        >
                          {first.name}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPrescriptionViewer(first)}
                        className={actionBtn}
                        style={{
                          borderColor: THEMED_MODAL.blue,
                          color: THEMED_MODAL.blue,
                          background: "#eff2ff",
                          opacity: hasImage ? 1 : 0.55,
                        }}
                        title={
                          hasImage
                            ? "View prescription"
                            : "No prescription image"
                        }
                      >
                        View prescription
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleApproveAll(presId, items)}
                        className={actionBtn}
                        style={{
                          borderColor: THEMED_MODAL.cyan,
                          background: THEMED_MODAL.cyan,
                          color: "#fff",
                        }}
                      >
                        Approve All
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openDisapproveAll(presId, items)}
                        className={actionBtn}
                        style={{
                          borderColor: THEMED_MODAL.danger,
                          background: THEMED_MODAL.danger,
                          color: "#fff",
                        }}
                      >
                        Disapprove All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                          <th
                            className="text-left px-4 py-2 font-semibold hidden lg:table-cell"
                            style={{ color: THEMED_MODAL.slate }}
                          >
                            Alarm description
                          </th>
                          <th
                            className="text-left px-4 py-2 font-semibold hidden lg:table-cell"
                            style={{ color: THEMED_MODAL.slate }}
                          >
                            Frequency
                          </th>
                          <th
                            className="text-left px-4 py-2 font-semibold hidden lg:table-cell"
                            style={{ color: THEMED_MODAL.slate }}
                          >
                            Days / month
                          </th>
                          <th
                            className="text-left px-4 py-2 font-semibold hidden lg:table-cell"
                            style={{ color: THEMED_MODAL.slate }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr
                            key={item.id ?? `${presId}-${index}`}
                            className="border-t flex flex-col lg:table-row"
                            style={{ borderColor: THEMED_MODAL.border }}
                          >
                            <td className="px-4 py-3 text-left align-top">
                              <span
                                className="lg:hidden block text-xs font-semibold mb-1"
                                style={{ color: THEMED_MODAL.slate }}
                              >
                                Alarm description
                              </span>
                              <span style={{ color: THEMED_MODAL.ink }}>
                                {item.desc || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-left align-top">
                              <span
                                className="lg:hidden block text-xs font-semibold mb-1"
                                style={{ color: THEMED_MODAL.slate }}
                              >
                                Frequency
                              </span>
                              <div
                                className="font-semibold"
                                style={{ color: THEMED_MODAL.ink }}
                              >
                                {item.timesaday}{" "}
                                {item.timesaday > 1 ? "times" : "time"}{" "}
                                {item.isWeek ? "a day" : "a month"}
                              </div>
                              {(item.doses || []).map((dose, i) => (
                                <div
                                  key={`${item.id}-dose-${i}`}
                                  style={{ color: THEMED_MODAL.slate }}
                                >
                                  {dose}
                                </div>
                              ))}
                            </td>
                            <td className="px-4 py-3 text-left align-top">
                              <span
                                className="lg:hidden block text-xs font-semibold mb-1"
                                style={{ color: THEMED_MODAL.slate }}
                              >
                                Days / month
                              </span>
                              <span style={{ color: THEMED_MODAL.ink }}>
                                {item.weekdays || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span
                                className="lg:hidden block text-xs font-semibold mb-1"
                                style={{ color: THEMED_MODAL.slate }}
                              >
                                Actions
                              </span>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handleApprove(item)}
                                  className={actionBtn}
                                  style={{
                                    borderColor: THEMED_MODAL.cyan,
                                    background: THEMED_MODAL.cyan,
                                    color: "#fff",
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    openDisapproveOne(item, presId)
                                  }
                                  className={actionBtn}
                                  style={{
                                    borderColor: THEMED_MODAL.danger,
                                    background: THEMED_MODAL.danger,
                                    color: "#fff",
                                  }}
                                >
                                  Disapprove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ThemedModalShell>

      {showViewer && (
        <SimpleModal
          closeModal={() => setShowViewer(false)}
          image={viewerUrl}
          patientId={viewerPatientId}
        />
      )}

      {disapproveCtx && (
        <DisapproveReasonModal
          closeModal={() => setDisapproveCtx(null)}
          disAll={disapproveCtx.disAll}
          item={disapproveCtx.item}
          presId={disapproveCtx.presId}
          onSuccess={handleDisapproveSuccess}
        />
      )}
    </>
  );
};

PrescriptionModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onResolved: PropTypes.func,
};

export default PrescriptionModal;
