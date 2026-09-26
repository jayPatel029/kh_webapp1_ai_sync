/**
 * Doctor Dashboard
 * Global category tabs (Prescription / Dialysis / Alert / Comments).
 * Red Alerts render inline (AlertListPanel); other categories use modals.
 *
 * @file src/pages/doctorDashboard/DoctorDashboard.jsx
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useDoctorDashboardData } from "../../hooks/useDashboardData";
import {
  getPatientId,
  getPatientName,
  isChatAlert,
  isUnreadAlert,
} from "../../helpers/alertGrouping";
import { getAlertCategory } from "../../helpers/alertNavigation";
import { getDoctorComments } from "../../ApiCalls/GetComments";

import StatCard from "../../components/dashboard/StatCard";
import AlertRow from "../../components/dashboard/AlertRow";
import AlertListPanel from "../../components/dashboard/AlertListPanel";
import PageHeader from "../../components/PageHeader";
import PrescriptionModal from "../adminDashboard/components/ApprovePrescriptionModal";
import CommentContainer from "../adminDashboard/components/CommentContainer";
import PatientDialysisAlertModal from "../adminDashboard/components/PatientDialysisAlertModal";
import DialysisTechModal from "../adminDashboard/components/DialysisTechModal";

import { Heading, Text } from "../../component-library/primitives/Typography";
import { Box, Flex } from "../../component-library";
import { useIsMobile } from "../../components/mobile/useIsMobile";

import "../dashboard/dashboard.css";

/** Theme-aligned colors (main: primary / violet / red / yellow). */
const CATEGORY_META = [
  {
    key: "prescription",
    label: "Prescription",
    color: "#00cccc",
  },
  {
    key: "dialysis",
    label: "Dialysis",
    color: "#6b21a8",
  },
  {
    key: "alert",
    label: "Alert",
    color: "#fd0000",
  },
  {
    key: "comments",
    label: "Comments",
    color: "#d97706",
  },
];

const CATEGORY_ORDER = CATEGORY_META.map((c) => c.key);

const iconStyle = { color: "#32617d" };

const PatientIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={iconStyle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="currentColor" fillOpacity="0.14" />
    <circle cx="12" cy="7" r="3.2" />
  </svg>
);

const NewPatientIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={iconStyle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="currentColor" fillOpacity="0.14" />
    <circle cx="8.5" cy="7" r="3" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const ActiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={iconStyle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.14" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DoctorSkeleton = () => (
  <div className="dashboard-skeleton">
    <div className="dashboard-skeleton__row dashboard-skeleton__row--4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="dashboard-skeleton__card dashboard-skeleton__card--sm" />
      ))}
    </div>
    <div className="dashboard-skeleton__row" style={{ gridTemplateColumns: "1fr" }}>
      <div className="dashboard-skeleton__card dashboard-skeleton__card--lg" />
    </div>
  </div>
);

const DashboardError = ({ message, onRetry }) => (
  <div className="dashboard-error">
    <svg className="dashboard-error__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <Heading as="h3">Something went wrong</Heading>
    <Text color="muted" size="sm">{message || "Failed to load dashboard data."}</Text>
    {onRetry && (
      <button className="dashboard-error__btn" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

/**
 * Main DoctorContainer UserCard filters (exact type match):
 * - Prescription: type === `New Prescription Alarm for ${name}`
 * - Dialysis: type includes "Dialysis Tech"
 * - Alert: everything else for that patient
 * Comments stay on getDoctorComments (not sortAlerts).
 */
const bucketForSortAlert = (alert) => {
  const type = String(alert?.type || "");
  const name = String(alert?.name || "").trim();

  if (name && type === `New Prescription Alarm for ${name}`) {
    return "prescription";
  }

  if (type.includes("Dialysis Tech")) {
    return "dialysis";
  }

  return "alert";
};

const sortNewestFirst = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b.date || b.created_at || b.sent_at || 0) -
      new Date(a.date || a.created_at || a.sent_at || 0)
  );

const DoctorDashboard = () => {
  const { isMobile } = useIsMobile();
  const { loading, error, data, refetch } = useDoctorDashboardData();

  const [buckets, setBuckets] = useState({
    prescription: [],
    dialysis: [],
    alert: [],
    comments: [],
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientLabel, setSelectedPatientLabel] = useState("");
  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    dialysis: false,
    dialysisTech: false,
  });

  const nameLookup = useMemo(() => {
    const map = {};
    const rows = Array.isArray(data?.patients) ? data.patients : [];
    rows.forEach((patient) => {
      const id = String(patient?.id || patient?.patient_id || patient?.patientid || "");
      if (!id) return;
      const name =
        `${patient?.firstname || ""} ${patient?.lastname || ""}`.trim() ||
        patient?.name ||
        null;
      if (name) map[id] = name;
    });
    return map;
  }, [data?.patients]);

  useEffect(() => {
    let cancelled = false;

    const buildBuckets = async () => {
      const sourceAlerts = Array.isArray(data?.alerts) ? data.alerts : [];
      const nonChat = sourceAlerts.filter((a) => !isChatAlert(a));

      const prescription = [];
      const dialysis = [];
      const alert = [];

      nonChat.forEach((item) => {
        const kind = bucketForSortAlert(item);
        if (kind === "prescription") prescription.push(item);
        else if (kind === "dialysis") dialysis.push(item);
        else alert.push(item);
      });

      // Comments: getDoctorComments filtered by patient names seen in alerts
      const email = localStorage.getItem("email");
      const nameToPatientId = new Map();
      nonChat.forEach((a) => {
        const name = getPatientName(a);
        const pid = getPatientId(a);
        if (name && name !== "Unknown Patient" && !nameToPatientId.has(name)) {
          nameToPatientId.set(name, pid || null);
        }
      });

      const commentRows = [];
      if (email && nameToPatientId.size) {
        await Promise.all(
          [...nameToPatientId.keys()].map(async (name) => {
            try {
              const res = await getDoctorComments(email, name);
              const comments = Array.isArray(res?.comments) ? res.comments : [];
              sortNewestFirst(comments)
                .slice(0, 50)
                .forEach((c) => {
                  commentRows.push({
                    ...c,
                    category: c.fileType || "Comment",
                    type: c.fileType || "Comment",
                    name,
                    patientId: c.userId || nameToPatientId.get(name) || null,
                    date: c.date,
                    isRead: c.isRead === true || c.isRead === 1 ? 1 : 0,
                  });
                });
            } catch {
              /* skip */
            }
          })
        );
      }

      const next = {
        prescription: sortNewestFirst(prescription),
        dialysis: sortNewestFirst(dialysis),
        alert: sortNewestFirst(alert),
        comments: sortNewestFirst(commentRows),
      };

      if (cancelled) return;

      setBuckets(next);

      setActiveCategory((prev) => {
        if (prev && (next[prev] || []).length > 0) return prev;
        const first = CATEGORY_ORDER.find((key) => (next[key] || []).length > 0);
        return first || "alert";
      });
    };

    buildBuckets();
    return () => {
      cancelled = true;
    };
  }, [data?.alerts]);

  const visibleTabs = useMemo(
    () =>
      CATEGORY_META.filter((tab) => {
        const items = buckets[tab.key] || [];
        if (tab.key === "comments") {
          return items.some(
            (c) =>
              c.isRead === 0 || c.isRead === false || c.isRead === "0"
          );
        }
        return items.length > 0;
      }).map((tab) => {
        const items = buckets[tab.key] || [];
        if (tab.key === "comments") {
          const unreadCount = items.filter(
            (c) =>
              c.isRead === 0 || c.isRead === false || c.isRead === "0"
          ).length;
          return {
            ...tab,
            count: unreadCount,
            unread: unreadCount,
          };
        }
        return {
          ...tab,
          count: items.length,
          unread: items.filter(isUnreadAlert).length,
        };
      }),
    [buckets]
  );

  /** Comments tab: one row per patient that has unread comments only. */
  const commentPatientRows = useMemo(() => {
    const map = new Map();
    (buckets.comments || []).forEach((c) => {
      const unread =
        c.isRead === 0 || c.isRead === false || c.isRead === "0";
      if (!unread) return;

      const pid = getPatientId(c);
      const key = String(pid || c.name || "");
      if (!key) return;

      const ts = new Date(c.date || 0).getTime();

      if (!map.has(key)) {
        map.set(key, {
          id: `comment-patient-${key}`,
          patientId: pid || null,
          name: c.name || nameLookup[String(pid)] || `Patient ${key}`,
          category: "Comments",
          type: "Comments",
          date: c.date,
          isRead: 0,
          _commentUnread: 1,
          _latestTs: ts,
        });
        return;
      }

      const row = map.get(key);
      row._commentUnread += 1;
      if (ts >= (row._latestTs || 0)) {
        row._latestTs = ts;
        row.date = c.date;
      }
      if (!row.patientId && pid) row.patientId = pid;
      if (!row.name && c.name) row.name = c.name;
    });

    return [...map.values()].sort(
      (a, b) => (b._latestTs || 0) - (a._latestTs || 0)
    );
  }, [buckets.comments, nameLookup]);

  const activeRows =
    activeCategory === "comments"
      ? commentPatientRows
      : buckets[activeCategory] || [];
  const activeMeta =
    CATEGORY_META.find((c) => c.key === activeCategory) || CATEGORY_META[2];

  // If Comments tab empties after mark-read, move to next non-empty category
  useEffect(() => {
    if (activeCategory !== "comments") return;
    if (commentPatientRows.length > 0) return;
    const first = CATEGORY_ORDER.find(
      (key) => key !== "comments" && (buckets[key] || []).length > 0
    );
    setActiveCategory(first || null);
  }, [activeCategory, commentPatientRows, buckets]);

  const alertsForPatient = useCallback(
    (patientId, categoryKey, patientName) => {
      const pid = String(patientId || "");
      const name = String(patientName || "").trim();
      return (buckets[categoryKey] || []).filter((a) => {
        const aPid = String(getPatientId(a) || "");
        if (pid && aPid && aPid === pid) return true;
        if (name && String(a.name || "").trim() === name) return true;
        return false;
      });
    },
    [buckets]
  );

  const markRowsReadLocally = useCallback(
    (categoryKey, patientId, patientName) => {
      setBuckets((prev) => {
        const list = prev[categoryKey] || [];
        const name = String(patientName || "").trim();
        const nextList = list.map((item) => {
          const aPid = String(getPatientId(item) || "");
          const samePatient =
            (patientId && aPid && aPid === String(patientId)) ||
            (name && String(item.name || "").trim() === name);
          if (!samePatient) return item;
          return { ...item, isRead: 1 };
        });
        return { ...prev, [categoryKey]: nextList };
      });
    },
    []
  );

  const closeModal = useCallback(
    async (type) => {
      // Comments: mark-read happens per opened item in CommentContainer — not on dismiss.
      // Red Alerts: mark-read happens per action in AlertListPanel — not on dismiss.
      if (type === "dialysis" || type === "dialysisTech") {
        markRowsReadLocally("dialysis", selectedPatientId);
      }

      setModals((prev) => ({ ...prev, [type]: false }));
      setSelectedPatientId(null);
      setSelectedPatientLabel("");
    },
    [selectedPatientId, markRowsReadLocally]
  );

  const markAlertReadById = useCallback((alert) => {
    if (alert?.id == null) return;
    setBuckets((prev) => ({
      ...prev,
      alert: (prev.alert || []).map((item) =>
        item.id === alert.id ? { ...item, isRead: 1 } : item
      ),
    }));
  }, []);

  const markPrescriptionResolvedByIds = useCallback((ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    const idSet = new Set(ids.map((id) => String(id)));
    setBuckets((prev) => ({
      ...prev,
      prescription: (prev.prescription || []).filter(
        (item) => !idSet.has(String(item.id))
      ),
    }));
  }, []);

  const markCommentReadById = useCallback((commentId) => {
    if (commentId == null) return;
    setBuckets((prev) => ({
      ...prev,
      comments: (prev.comments || []).map((c) =>
        c.id === commentId ? { ...c, isRead: 1 } : c
      ),
    }));
  }, []);

  const openWorkflowForRow = useCallback(
    (row) => {
      const patientId = getPatientId(row);
      setSelectedPatientId(patientId);
      setSelectedPatientLabel(row?.name || "");

      if (activeCategory === "prescription") {
        const list = patientId
          ? alertsForPatient(patientId, "prescription")
          : [row];
        localStorage.setItem("prescriptionAlerts", JSON.stringify(list));
        setModals((prev) => ({ ...prev, prescription: true }));
        return;
      }

      if (activeCategory === "dialysis") {
        const list = patientId
          ? alertsForPatient(patientId, "dialysis")
          : [row];
        localStorage.setItem("Dialysis_updates", JSON.stringify(list));
        localStorage.setItem("alertAlerts", JSON.stringify(list));
        const hasReadingShape = list.some(
          (a) => a?.dailyordia || a?.questionId
        );
        if (hasReadingShape) {
          setModals((prev) => ({ ...prev, dialysisTech: true }));
        } else {
          setModals((prev) => ({ ...prev, dialysis: true }));
        }
        return;
      }

      if (activeCategory === "comments") {
        setModals((prev) => ({ ...prev, comment: true }));
      }
      // Red Alerts: shown inline in the section — no modal.
    },
    [activeCategory, alertsForPatient]
  );

  const selectedComments = useMemo(() => {
    if (!selectedPatientId && !selectedPatientLabel) return [];
    return alertsForPatient(
      selectedPatientId,
      "comments",
      selectedPatientLabel
    );
  }, [selectedPatientId, selectedPatientLabel, alertsForPatient]);

  const selectedDialysis = useMemo(() => {
    if (!selectedPatientId) return [];
    return alertsForPatient(selectedPatientId, "dialysis");
  }, [selectedPatientId, alertsForPatient]);

  const selectedPatientName = useMemo(() => {
    if (selectedPatientLabel) return selectedPatientLabel;
    if (!selectedPatientId) return "";
    return (
      nameLookup[String(selectedPatientId)] ||
      getPatientName(selectedDialysis[0] || selectedComments[0] || {}) ||
      ""
    );
  }, [
    selectedPatientId,
    selectedPatientLabel,
    nameLookup,
    selectedDialysis,
    selectedComments,
  ]);

  if (loading) {
    return (
      <div className="dashboard">
        <DoctorSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <DashboardError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__content">
        <div className="dashboard__page-header">
          <PageHeader title="Doctor Dashboard" variant="onlyheader" />
          <span className="dashboard__live-dot" title="Live updates" />
        </div>

        <section className="dashboard__section">
          <Heading as="h4" className="dashboard__section-title">
            Welcome, Dr. {data.doctorName}
          </Heading>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <StatCard
              icon={<PatientIcon />}
              label="My Patients"
              value={data.totalPatients}
              color="primary"
              subtitle="Updated just now"
            />
            <StatCard
              icon={<NewPatientIcon />}
              label="New This Week"
              value={data.newPatients}
              color="success"
              subtitle="Updated just now"
            />
            <StatCard
              icon={<ActiveIcon />}
              label="Active Patients"
              value={data.activePatients}
              color="info"
              subtitle="Updated just now"
            />
          </div>
        </section>

        <section className="dashboard__section">
          <Flex justify="between" align="center" className="mb-4 flex-wrap gap-3">
            <Heading as="h2" className="dashboard__section-title" style={{ margin: 0 }}>
              Important Alerts
            </Heading>
            <Text size="sm" color="muted">
              {activeCategory === "comments"
                ? `${activeRows.length} patient${activeRows.length === 1 ? "" : "s"}`
                : `${activeRows.length} item${activeRows.length === 1 ? "" : "s"}`}
              {data.canReceiveDailyAlerts ? "" : " · reading alerts hidden"}
            </Text>
          </Flex>

          {/* Global category tabs — same rectangular card UI as patient stats */}
          {visibleTabs.length === 0 ? (
            <Text size="sm" color="muted" className="mb-5">
              No alerts
            </Text>
          ) : (
            <div
              className="stat-grid mb-5"
              style={{
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : `repeat(${Math.min(visibleTabs.length, 4)}, 1fr)`,
              }}
            >
              {visibleTabs.map((tab) => {
                const isActive = activeCategory === tab.key;
                const count =
                  tab.key === "comments"
                    ? tab.unread
                    : tab.unread > 0
                      ? tab.unread
                      : tab.count;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveCategory(tab.key)}
                    className="stat-card text-left w-full cursor-pointer"
                    style={{
                      border: `1.5px solid ${isActive ? tab.color : "#e5eef3"}`,
                      background: isActive ? `${tab.color}14` : "#fff",
                      borderRadius: "16px",
                      padding: "1rem 1.15rem",
                      boxShadow: isActive
                        ? "0 4px 12px rgba(0,0,0,0.08)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="stat-card__inner">
                      <div
                        className="stat-card__icon"
                        style={{
                          backgroundColor: `${tab.color}18`,
                          color: tab.color,
                          border: `1px solid ${tab.color}40`,
                        }}
                        aria-hidden
                      >
                        <span
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          {tab.label.charAt(0)}
                        </span>
                      </div>
                      <div className="stat-card__text">
                        <span className="stat-card__label">{tab.label}</span>
                        <span
                          className="stat-card__value"
                          style={{ color: isActive ? tab.color : undefined }}
                        >
                          {Number(count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Box
            className={`bg-white rounded-xl border border-[#e5eef3] ${
              isMobile ? "p-3" : "p-4"
            }`}
          >
            {activeCategory === "alert" ? (
              <AlertListPanel
                alerts={buckets.alert}
                nameLookup={nameLookup}
                onMarkRead={markAlertReadById}
              />
            ) : activeRows.length === 0 ? (
              <Flex justify="center" align="center" className="py-12 text-gray-500">
                <Text size="md" color="muted">
                  No {activeMeta.label.toLowerCase()} alerts
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap={3}>
                {activeRows.map((row, index) => {
                  const pid = getPatientId(row);
                  const override = pid ? nameLookup[String(pid)] : row.name;
                  const categoryLabel =
                    activeCategory === "comments"
                      ? `Comments · ${row._commentUnread || 0}`
                      : row.category ||
                        getAlertCategory(row) ||
                        activeMeta.label;
                  return (
                    <AlertRow
                      key={row.id ?? `${activeCategory}-${index}`}
                      alert={{
                        ...row,
                        category: categoryLabel,
                      }}
                      patientNameOverride={override}
                      onClick={() => openWorkflowForRow(row)}
                    />
                  );
                })}
              </Flex>
            )}
          </Box>
        </section>
      </div>

      {modals.prescription && (
        <PrescriptionModal
          closeModal={() => closeModal("prescription")}
          onResolved={markPrescriptionResolvedByIds}
        />
      )}

      {modals.comment && (
        <CommentContainer
          comments={[...selectedComments]}
          closeModal={() => closeModal("comment")}
          onCommentRead={markCommentReadById}
        />
      )}

      {modals.dialysis && (
        <PatientDialysisAlertModal
          alerts={selectedDialysis}
          patientName={selectedPatientName}
          patientId={selectedPatientId}
          onClose={() => closeModal("dialysis")}
        />
      )}

      {modals.dialysisTech && (
        <DialysisTechModal closeModal={() => closeModal("dialysisTech")} />
      )}
    </div>
  );
};

export default DoctorDashboard;
