/**
 * Doctor Dashboard
 * Patient-first alert view for doctors.
 * - Shows only patient alerts (no chat alerts)
 * - Groups alerts by patient
 * - Renders a single doctor category: Alerts
 * - Opens AlertModal using selected patient alerts
 *
 * @file src/pages/doctorDashboard/DoctorDashboard.jsx
 */

import React, { useCallback, useMemo, useState } from "react";

import { useDoctorDashboardData } from "../../hooks/useDashboardData";
import {
  getDashboardAlertSide,
  groupAlertsByPatient,
  isChatAlert,
} from "../../helpers/alertGrouping";

import StatCard from "../../components/dashboard/StatCard";
import PageHeader from "../../components/PageHeader";

import PatientAlertCard from "../adminDashboard/components/PatientAlertCard";
import AlertModal from "../adminDashboard/components/AlertModal";

import { Heading, Text } from "../../component-library/primitives/Typography";

import "../dashboard/dashboard.css";

const CATEGORY_TABS = [{ key: "alert", label: "Alerts" }];

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
  const { loading, error, data, refetch } = useDoctorDashboardData();
  const [activeCategory, setActiveCategory] = useState("alert");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const patientLookup = useMemo(() => {
    const map = new Map();
    const rows = Array.isArray(data?.patients) ? data.patients : [];

    rows.forEach((patient) => {
      const id = String(patient?.id || patient?.patient_id || patient?.patientid || "");
      if (!id) return;

      const name = `${patient?.firstname || ""} ${patient?.lastname || ""}`.trim() || patient?.name || null;
      map.set(id, {
        name,
        avatar: patient?.photo || patient?.profile_photo || patient?.avatar || "",
      });
    });

    return map;
  }, [data?.patients]);

  const groupedDoctorPatients = useMemo(() => {
    const sourceAlerts = Array.isArray(data?.alerts) ? data.alerts : [];

    const patientAlerts = sourceAlerts.filter((alert) => {
      if (isChatAlert(alert)) return false;
      return getDashboardAlertSide(alert) !== "doctor";
    });

    const grouped = groupAlertsByPatient(patientAlerts, { includeChats: false });

    return grouped.patients.map((patient) => {
      const mappedPatient = patientLookup.get(String(patient.id));

      const allAlerts = [
        ...(patient.prescriptionAlerts || []),
        ...(patient.commentAlerts || []),
        ...(patient.alertAlerts || []),
        ...(patient.dialysisAlerts || []),
      ];

      const unreadCount =
        (patient.prescriptionCount || 0) +
        (patient.commentCount || 0) +
        (patient.alertCount || 0) +
        (patient.dialysisCount || 0);

      return {
        ...patient,
        name: mappedPatient?.name || patient.name,
        avatar: patient.avatar || mappedPatient?.avatar || "",
        alertAlerts: allAlerts,
        alertCount: unreadCount || allAlerts.length,
        prescriptionCount: 0,
        commentCount: 0,
        dialysisCount: 0,
      };
    });
  }, [data?.alerts, patientLookup]);

  const visiblePatients = useMemo(() => {
    if (activeCategory !== "alert") return groupedDoctorPatients;
    return groupedDoctorPatients.filter((patient) => (patient.alertCount || 0) > 0);
  }, [activeCategory, groupedDoctorPatients]);

  const handlePatientAction = useCallback((patient, action) => {
    if (action !== "view" && action !== "alert") return;

    localStorage.setItem("alertAlerts", JSON.stringify(patient?.alertAlerts || []));
    setSelectedPatient(patient);
    setIsAlertModalOpen(true);
  }, []);

  const closeAlertModal = useCallback(() => {
    setIsAlertModalOpen(false);
    setSelectedPatient(null);
    refetch();
  }, [refetch]);

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Heading as="h2" className="dashboard__section-title" style={{ margin: 0 }}>
              Important Alerts
            </Heading>
            <Text size="sm" color="muted">
              {visiblePatients.length} patient{visiblePatients.length === 1 ? "" : "s"}
            </Text>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    isActive
                      ? "bg-[#3F6B85] text-white border-[#3F6B85]"
                      : "bg-white text-[#3F6B85] border-[#cfe4ee] hover:border-[#3F6B85]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {visiblePatients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#6B7280" }}>
              <Text size="md" color="muted">No alerts</Text>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {visiblePatients.map((patient) => (
                <React.Fragment key={patient.id}>
                  <PatientAlertCard patient={patient} onAction={handlePatientAction} />
                  <div className="h-[2px] bg-gray-200 my-4" />
                </React.Fragment>
              ))}
            </div>
          )}
        </section>
      </div>

      {isAlertModalOpen && (
        <AlertModal
          key={selectedPatient?.id || "doctor-alert-modal"}
          closeModal={closeAlertModal}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
