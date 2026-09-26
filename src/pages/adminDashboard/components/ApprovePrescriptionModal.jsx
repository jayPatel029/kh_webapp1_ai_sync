/**
 * Approve Prescription modal — same Form/Base modal + 1fr 2fr layout as
 * Add Alarm (prescription on the right), mark-read only after action.
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
import { BaseModal } from "../../../component-library/modals/BaseModal";
import { Box, Flex, Grid, GridItem } from "../../../component-library/layout/Layout";
import { Button } from "../../../component-library/primitives/Button";
import { Text } from "../../../component-library/primitives/Typography";
import MyPDFViewer from "../../../components/pdf/MyPDFViewer";
import DisapproveReasonModal from "./Modal";

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
  try {
    return new Date(value).toDateString();
  } catch {
    return String(value);
  }
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
  const [previewUrl, setPreviewUrl] = useState("");
  const [disapproveCtx, setDisapproveCtx] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("prescriptionAlerts");
      const list = raw ? JSON.parse(raw) : [];
      setAlerts(list);
      const firstUrl = getPrescriptionImageUrl(list[0]);
      if (firstUrl) setPreviewUrl(firstUrl);
    } catch {
      setAlerts([]);
    }
  }, []);

  const groupedData = useMemo(() => groupByPresId(alerts), [alerts]);

  const markAlertsRead = async (items) => {
    const list = (items || []).filter((a) => a?.id != null);
    for (const alert of list) {
      try {
        await updateIsReadAlert({ id: alert.id });
      } catch (err) {
        console.error("mark prescription alert read failed", err);
      }
    }
    onResolved?.(list.map((a) => a.id));
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

  const showPrescriptionPreview = (item) => {
    const url = getPrescriptionImageUrl(item);
    if (!url) {
      window.alert("No prescription image available for this alert.");
      return;
    }
    setPreviewUrl(url);
  };

  const groupKeys = Object.keys(groupedData);
  const previewIsPdf = /\.pdf$/i.test(String(previewUrl || ""));
  const hasPreview = Boolean(previewUrl);

  return (
    <>
      <BaseModal
        isOpen
        onClose={closeModal}
        title="Digitised Prescription Copy"
        size="8xl"
        footer={
          <Flex justify="end">
            <Button variant="danger" onClick={closeModal} isDisabled={busy}>
              Close
            </Button>
          </Flex>
        }
      >
        {groupKeys.length === 0 ? (
          <Text color="muted" size="sm">
            No prescription alerts
          </Text>
        ) : (
          <Grid
            gap={6}
            className="!min-w-full"
            templateColumns={hasPreview ? "minmax(0, 1fr) minmax(0, 1.25fr)" : "1fr"}
          >
            <GridItem colSpan={1} className="min-w-0 max-w-full">
              <Flex direction="column" gap={4} className="w-full">
                {groupKeys.map((presId) => {
                  const items = groupedData[presId];
                  const first = items[0] || {};
                  const imageUrl = getPrescriptionImageUrl(first);
                  const isActivePreview =
                    previewUrl && imageUrl && previewUrl === imageUrl;

                  return (
                    <Box
                      key={presId}
                      className="border border-accent rounded-md overflow-hidden w-full"
                    >
                      <Box className="bg-gray-50 border-b border-accent px-4 py-3 text-left">
                        <Text weight="semibold" size="sm">
                          Prescription on {formatDate(first.date)}
                        </Text>
                        {first.name ? (
                          <Text size="xs" color="muted" className="mt-0.5">
                            {first.name}
                          </Text>
                        ) : null}
                        <Flex
                          gap={2}
                          wrap="wrap"
                          align="center"
                          className="mt-3 w-full"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => showPrescriptionPreview(first)}
                            isDisabled={!imageUrl}
                            className={
                              isActivePreview ? "ring-2 ring-primary" : ""
                            }
                          >
                            View prescription
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            isDisabled={busy}
                            onClick={() => handleApproveAll(presId, items)}
                          >
                            Approve All
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            isDisabled={busy}
                            onClick={() => openDisapproveAll(presId, items)}
                          >
                            Disapprove All
                          </Button>
                        </Flex>
                      </Box>

                      <Flex direction="column" className="w-full divide-y divide-gray-100">
                        {items.map((item, index) => (
                          <Box
                            key={item.id ?? `${presId}-${index}`}
                            className="px-4 py-3 w-full text-left hover:bg-gray-50"
                          >
                            <Text weight="semibold" size="sm" className="break-words">
                              {item.desc || "Alarm"}
                            </Text>

                            <Box className="mt-2 space-y-1">
                              <Text size="xs" color="muted">
                                Frequency
                              </Text>
                              <Text size="sm">
                                {item.timesaday}{" "}
                                {item.timesaday > 1 ? "times" : "time"}{" "}
                                {item.isWeek ? "a day" : "a month"}
                              </Text>
                              {(item.doses || []).length > 0 ? (
                                <Box className="text-sm text-gray-600">
                                  {(item.doses || []).map((dose, i) => (
                                    <div key={`${item.id}-dose-${i}`}>{dose}</div>
                                  ))}
                                </Box>
                              ) : null}
                            </Box>

                            {item.weekdays ? (
                              <Box className="mt-2">
                                <Text size="xs" color="muted">
                                  Days / month
                                </Text>
                                <Text size="sm" className="break-words">
                                  {item.weekdays}
                                </Text>
                              </Box>
                            ) : null}

                            <Flex gap={2} wrap="wrap" className="mt-3">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                isDisabled={busy}
                                onClick={() => handleApprove(item)}
                              >
                                Approve
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                isDisabled={busy}
                                onClick={() => openDisapproveOne(item, presId)}
                              >
                                Disapprove
                              </Button>
                            </Flex>
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            </GridItem>

            {hasPreview ? (
              <GridItem colSpan={1} className="min-w-0">
                <Box className="p-2 max-h-[70vh] overflow-auto sticky top-0">
                  {previewIsPdf ? (
                    <div className="h-full min-h-[320px]">
                      <MyPDFViewer
                        file={previewUrl}
                        onLoadSuccess={() => {}}
                        onLoadError={() => {}}
                      />
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="prescription-view"
                      className="w-full h-auto rounded"
                    />
                  )}
                </Box>
              </GridItem>
            ) : null}
          </Grid>
        )}
      </BaseModal>

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
