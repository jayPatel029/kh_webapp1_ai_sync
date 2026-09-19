/**
 * Doctor Dashboard
 * Flat two-column alerts inbox (Doctor | Patient) — same presentation as admin,
 * current new-layout theme.
 *
 * @file src/pages/doctorDashboard/DoctorDashboard.jsx
 */

import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useDoctorDashboardData } from "../../hooks/useDashboardData";
import {
  isChatAlert,
  partitionDashboardAlerts,
} from "../../helpers/alertGrouping";
import { openAlertDestination } from "../../helpers/alertNavigation";

import StatCard from "../../components/dashboard/StatCard";
import FlatAlertsInbox from "../../components/dashboard/FlatAlertsInbox";
import PageHeader from "../../components/PageHeader";

import { Heading, Text } from "../../component-library/primitives/Typography";

import "../dashboard/dashboard.css";

const shouldExcludeFromPatientColumn = (alert) => {
  const category = String(alert?.category || "").trim();
  return (
    category === "Prescription Approved" ||
    category === "New Prescription Alarm"
  );
};

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
  const { loading, error, data, refetch } = useDoctorDashboardData();

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

  const { doctorAlerts, patientAlerts } = useMemo(() => {
    const sourceAlerts = Array.isArray(data?.alerts) ? data.alerts : [];
    const nonChat = sourceAlerts.filter((alert) => !isChatAlert(alert));
    const partitions = partitionDashboardAlerts(nonChat);

    return {
      doctorAlerts: [...(partitions.doctor || [])],
      patientAlerts: [...(partitions.patient || []), ...(partitions.other || [])].filter(
        (alert) => !shouldExcludeFromPatientColumn(alert)
      ),
    };
  }, [data?.alerts]);

  const handleAlertClick = useCallback(
    async (alert) => {
      await openAlertDestination(alert, navigate);
      refetch();
    },
    [navigate, refetch]
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
          <FlatAlertsInbox
            doctorAlerts={doctorAlerts}
            patientAlerts={patientAlerts}
            loading={false}
            onAlertClick={handleAlertClick}
            nameLookup={nameLookup}
          />
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;
