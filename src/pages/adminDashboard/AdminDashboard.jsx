/**
 * Admin Dashboard — Redesigned
 *
 * Displays:
 *   1. Top row   → Stat cards grid (Total Users, Doctors, Patients, etc.)
 *   2. Bottom    → 2-column Alerts section (Doctor alerts + Admin alerts)
 *
 * Features:
 *   - Animated count-up for every metric
 *   - Skeleton loading state
 *   - 60-second auto-refetch for alerts
 *   - Role-based alert tabs (All / Doctor / Admin)
 *   - "Send Alert Emails" button with loading + toast
 *   - Responsive grid (4→2→1 cols)
 *   - Error boundary with retry
 *
 * @file src/pages/adminDashboard/AdminDashboard.jsx
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useAdminDashboardData } from '../../hooks/useDashboardData';

// Dashboard components
import StatCard from '../../components/dashboard/StatCard';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import PageHeader from '../../components/PageHeader';

// Design system primitives
import { Heading, Text } from '../../component-library/primitives/Typography';

// Styles
import '../dashboard/dashboard.css';

// ─── SVG Icons ──────────────────────────────────────────────

const iconStyle = { color: '#32617d' };

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={iconStyle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path fill="currentColor" fillOpacity="0.16" d="M3 17a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3H3v-3Z" />
    <circle cx="10" cy="7" r="3.2" />
    <path d="M17 10.2a3 3 0 1 0 0-6" />
    <path d="M19 20v-2a3.5 3.5 0 0 0-2.4-3.3" />
  </svg>
);

const WeeklyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={iconStyle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" fill="currentColor" fillOpacity="0.14" />
    <path d="M8 2v4M16 2v4M3 9h18" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const SubscriptionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={iconStyle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" fill="currentColor" fillOpacity="0.14" />
    <path d="M8 11h8M8 15h5" />
  </svg>
);

// ─── Dashboard Skeleton ─────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="dashboard-skeleton">
    <div className="dashboard-skeleton__row dashboard-skeleton__row--4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="dashboard-skeleton__card dashboard-skeleton__card--sm" />
      ))}
    </div>
    <div className="dashboard-skeleton__row dashboard-skeleton__row--4">
      {[5, 6, 7, 8].map((i) => (
        <div key={i} className="dashboard-skeleton__card dashboard-skeleton__card--sm" />
      ))}
    </div>
    <div className="dashboard-skeleton__row dashboard-skeleton__row--2">
      {[9, 10].map((i) => (
        <div key={i} className="dashboard-skeleton__card dashboard-skeleton__card--lg" />
      ))}
    </div>
  </div>
);

// ─── Error State ────────────────────────────────────────────

const DashboardError = ({ message, onRetry }) => (
  <div className="dashboard-error">
    <svg className="dashboard-error__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <Heading as="h3">Something went wrong</Heading>
    <Text color="muted" size="sm">{message || 'Failed to load dashboard data.'}</Text>
    {onRetry && (
      <button className="dashboard-error__btn" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

// ─── AdminDashboard ─────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useAdminDashboardData();

  // Navigate to patient profile on alert click
  const handleAlertClick = useCallback(
    (alert) => {
      if (alert.patientId) {
        navigate(`/userProfile/${alert.patientId}`);
      }
    },
    [navigate]
  );

  // ─── Compute derived stats ───────────────────────────────
  const stats = useMemo(() => {
    return {
      totalUsers: data.totalUsers,
      newUsersThisWeek: data.newUsersThisWeek,
      weeklySubscriptions: data.newUsersThisWeek,
    };
  }, [data]);

  // ─── Split alerts ────────────────────────────────────────
  const { doctorAlerts, adminAlerts } = useMemo(() => {
    const doctorAlerts = [];
    const adminAlerts = [];

    for (const a of data.alerts) {
      const type = (a.type || a.message || '').toLowerCase();
      if (
        type.includes('prescription') ||
        type.includes('comment') ||
        type.includes('doctor') ||
        type.includes('report')
      ) {
        doctorAlerts.push(a);
      } else {
        adminAlerts.push(a);
      }
    }

    return { doctorAlerts, adminAlerts };
  }, [data.alerts]);

  // ─── Render ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardSkeleton />
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
        {/* <div className="dashboard__page-header"> */}
          <PageHeader title="Admin Dashboard" variant="onlyheader" />
          {/* <span className="dashboard__live-dot" title="Live updates" /> */}
        {/* </div> */}

        {/* ─── User Stats Section ──────────────────────────── */}
        <section className="dashboard__section">
          <Heading as="h4" className="dashboard__section-title">
            Overview
          </Heading>
          <div className="stat-grid">
            <StatCard
              icon={<UsersIcon />}
              label="Total Users"
              value={stats.totalUsers}
              color="primary"
              // subtitle="Updated just now"
            />
            <StatCard
              icon={<WeeklyIcon />}
              label="Users Joined This Week"
              value={stats.newUsersThisWeek}
              // color="info"
              // subtitle="Updated just now"
            />
            <StatCard
              icon={<SubscriptionsIcon />}
              label="Weekly Subscriptions"
              value={stats.weeklySubscriptions}
              // color="success"
              // subtitle="Updated just now"
            />
          </div>
        </section>

        {/* ─── Alerts Section ──────────────────────────────── */}
        <section className="dashboard__section">
          <Heading as="h2" className="dashboard__section-title">
            Alerts
          </Heading>
          <div className="alerts-grid">
            <AlertsPanel
              title="Doctor Alerts"
              alerts={doctorAlerts}
              onAlertClick={handleAlertClick}
              showRoleTabs={false}
              showSendEmails={true}
              // maxHeight="400px"
            />
            <AlertsPanel
              title="General Alerts"
              alerts={adminAlerts}
              onAlertClick={handleAlertClick}
              showRoleTabs={false}
              showSendEmails={false}
              // maxHeight="400px"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
