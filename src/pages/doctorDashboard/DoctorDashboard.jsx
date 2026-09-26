/**
 * Doctor Dashboard
 * Main DoctorContainer workflow (patient cards + typed action buttons + modals)
 * with the current new-layout theme. Admin dashboard stays on flat inbox.
 *
 * @file src/pages/doctorDashboard/DoctorDashboard.jsx
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDoctorDashboardData } from "../../hooks/useDashboardData";
import {
  groupAlertsByPatient,
  isChatAlert,
} from "../../helpers/alertGrouping";
import { ROUTES } from "../../routes/routeConstants";
import { getDoctorComments } from "../../ApiCalls/GetComments";

import StatCard from "../../components/dashboard/StatCard";
import PageHeader from "../../components/PageHeader";
import PatientAlertCard from "../adminDashboard/components/PatientAlertCard";
import AlertModal from "../adminDashboard/components/AlertModal";
import PrescriptionModal from "../adminDashboard/components/ApprovePrescriptionModal";
import CommentContainer from "../adminDashboard/components/CommentContainer";
import PatientDialysisAlertModal from "../adminDashboard/components/PatientDialysisAlertModal";
import DialysisTechModal from "../adminDashboard/components/DialysisTechModal";

import { Heading, Text } from "../../component-library/primitives/Typography";
import { Box, Flex } from "../../component-library";
import { useIsMobile } from "../../components/mobile/useIsMobile";

import "../dashboard/dashboard.css";

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

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { loading, error, data, refetch } = useDoctorDashboardData();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    alert: false,
    dialysis: false,
    dialysisTech: false,
  });

  const patientLookup = useMemo(() => {
    const map = new Map();
    const rows = Array.isArray(data?.patients) ? data.patients : [];

    rows.forEach((patient) => {
      const id = String(patient?.id || patient?.patient_id || patient?.patientid || "");
      if (!id) return;
      const name =
        `${patient?.firstname || ""} ${patient?.lastname || ""}`.trim() ||
        patient?.name ||
        null;
      map.set(id, {
        name,
        avatar: patient?.photo || patient?.profile_photo || patient?.avatar || "",
      });
    });

    return map;
  }, [data?.patients]);

  useEffect(() => {
    let cancelled = false;

    const buildPatients = async () => {
      const sourceAlerts = Array.isArray(data?.alerts) ? data.alerts : [];
      const nonChat = sourceAlerts.filter((alert) => !isChatAlert(alert));
      const grouped = groupAlertsByPatient(nonChat, { includeChats: false });

      const email = localStorage.getItem("email");
      const enriched = await Promise.all(
        grouped.patients.map(async (patient) => {
          const mapped = patientLookup.get(String(patient.id));
          let next = {
            ...patient,
            name: mapped?.name || patient.name,
            avatar: patient.avatar || mapped?.avatar || "",
          };

          // Main DoctorContainer: enrich comments from comments API by patient name
          if (email && next.name) {
            try {
              const commentRes = await getDoctorComments(email, next.name);
              const comments = Array.isArray(commentRes?.comments)
                ? commentRes.comments
                : [];
              if (comments.length) {
                const ordered = [...comments].sort(
                  (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
                );
                const unreadCount = ordered.filter((c) => !c.isRead).length;
                next = {
                  ...next,
                  commentAlerts: ordered,
                  commentCount: unreadCount || ordered.length,
                };
              }
            } catch {
              /* keep alert-derived comments */
            }
          }

          return next;
        })
      );

      if (!cancelled) setPatients(enriched);
    };

    buildPatients();
    return () => {
      cancelled = true;
    };
  }, [data?.alerts, patientLookup]);

  const closeModal = useCallback(
    (type) => {
      setModals((prev) => ({ ...prev, [type]: false }));
      setSelectedPatient(null);
      refetch();
    },
    [refetch]
  );

  const handlePatientAction = useCallback(
    (patient, type) => {
      if (type === "view") {
        if (patient?.id) navigate(ROUTES.userProfile(patient.id));
        return;
      }

      setSelectedPatient(patient);

      if (type === "prescription") {
        localStorage.setItem(
          "prescriptionAlerts",
          JSON.stringify(patient.prescriptionAlerts || [])
        );
        setModals((prev) => ({ ...prev, prescription: true }));
        return;
      }

      if (type === "comment") {
        setModals((prev) => ({ ...prev, comment: true }));
        return;
      }

      if (type === "dialysis") {
        // Prefer props-based modal; also stash for DialysisTechModal parity with main
        localStorage.setItem(
          "Dialysis_updates",
          JSON.stringify(patient.dialysisAlerts || [])
        );
        localStorage.setItem(
          "alertAlerts",
          JSON.stringify(patient.dialysisAlerts || [])
        );
        // Use PatientDialysisAlertModal when alerts look like category rows;
        // DialysisTechModal mirrors main reading-alert UX when dailyordia present.
        const hasReadingShape = (patient.dialysisAlerts || []).some(
          (a) => a?.dailyordia || a?.questionId
        );
        if (hasReadingShape) {
          setModals((prev) => ({ ...prev, dialysisTech: true }));
        } else {
          setModals((prev) => ({ ...prev, dialysis: true }));
        }
        return;
      }

      if (type === "alert") {
        localStorage.setItem(
          "alertAlerts",
          JSON.stringify(patient.alertAlerts || [])
        );
        setModals((prev) => ({ ...prev, alert: true }));
      }
    },
    [navigate]
  );

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
          <Flex
            justify="between"
            align="center"
            className="mb-4 flex-wrap gap-3"
          >
            <Heading as="h2" className="dashboard__section-title" style={{ margin: 0 }}>
              Important Alerts
            </Heading>
            <Text size="sm" color="muted">
              {patients.length} patient{patients.length === 1 ? "" : "s"}
              {data.canReceiveDailyAlerts ? "" : " · reading alerts hidden"}
            </Text>
          </Flex>

          <Box
            className={`bg-white rounded-xl border border-[#e5eef3] ${
              isMobile ? "px-3" : "px-2"
            }`}
          >
            {patients.length === 0 ? (
              <Flex justify="center" align="center" className="py-12 text-gray-500">
                <Text size="md" color="muted">
                  No alerts
                </Text>
              </Flex>
            ) : (
              patients.map((patient) => (
                <React.Fragment key={patient.id}>
                  <PatientAlertCard
                    patient={patient}
                    onAction={handlePatientAction}
                  />
                </React.Fragment>
              ))
            )}
          </Box>
        </section>
      </div>

      {modals.prescription && (
        <PrescriptionModal closeModal={() => closeModal("prescription")} />
      )}

      {modals.comment && (
        <CommentContainer
          comments={selectedPatient?.commentAlerts || []}
          closeModal={() => closeModal("comment")}
        />
      )}

      {modals.alert && (
        <AlertModal
          key={selectedPatient?.id || "doctor-alert-modal"}
          closeModal={() => closeModal("alert")}
        />
      )}

      {modals.dialysis && (
        <PatientDialysisAlertModal
          alerts={selectedPatient?.dialysisAlerts || []}
          patientName={selectedPatient?.name}
          patientId={selectedPatient?.id}
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
