/**
 * Dialysis Dashboard (Manager only)
 *
 * Live dashboard pulling aggregate stats from multiple APIs:
 *  - GET /appointments          → today's appointment count
 *  - GET /beds/all              → bed occupancy stats
 *  - GET /inventory/alerts      → active alert count
 *  - GET /inventory/stock       → stock snapshot
 *  - GET /inventory/dialyzers   → dialyzer availability
 *
 * @file src/pages/dialysis/DialysisDashboard.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '../../component-library';
import PageHeader from '../../components/PageHeader';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { useAdminToast } from '../../components/AdminToast';
import { getAppointments } from '../../ApiCalls/clinicApis';
import { getAllBeds } from '../../ApiCalls/bedManagementApis';
import {
  getInventoryAlerts,
  getInventoryStock,
  getInventoryDialyzers,
} from '../../ApiCalls/inventoryApis';

// ─── Helpers ───────────────────────────────────────────────
function unwrapArray(result) {
  if (!result.success) return [];
  if (Array.isArray(result.data?.data)) return result.data.data;
  if (Array.isArray(result.data)) return result.data;
  return [];
}

// ─── Stat Card ─────────────────────────────────────────────
const StatCard = ({ label, value, color, icon, subtext }) => (
  <div
    className="admin-card"
    style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        fontSize: '32px',
        opacity: 0.15,
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
      {label}
    </span>
    <span
      style={{
        fontSize: '28px',
        fontWeight: 700,
        color: color || '#1F2937',
        lineHeight: 1.2,
      }}
    >
      {value}
    </span>
    {subtext && (
      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{subtext}</span>
    )}
  </div>
);

const DialysisDashboard = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();
  const [loading, setLoading] = useState(true);

  // ─── Stats ─────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    emptyBeds: 0,
    quarantineBeds: 0,
    activeAlerts: 0,
    lowStockAlerts: 0,
    expiryAlerts: 0,
    totalStockItems: 0,
    lowStockItems: 0,
    totalDialyzers: 0,
    activeDialyzers: 0,
    blockedDialyzers: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      // Fire all requests in parallel
      const [apptResult, bedResult, alertResult, stockResult, dialyzerResult] =
        await Promise.allSettled([
          getAppointments(),
          getAllBeds(),
          getInventoryAlerts({ params: { status: 'ACTIVE' } }),
          getInventoryStock(),
          getInventoryDialyzers(),
        ]);

      const appointments =
        apptResult.status === 'fulfilled' ? unwrapArray(apptResult.value) : [];
      const beds =
        bedResult.status === 'fulfilled' ? unwrapArray(bedResult.value) : [];
      const alerts =
        alertResult.status === 'fulfilled'
          ? unwrapArray(alertResult.value)
          : [];
      const stockRows =
        stockResult.status === 'fulfilled'
          ? unwrapArray(stockResult.value)
          : [];
      const dialyzers =
        dialyzerResult.status === 'fulfilled'
          ? unwrapArray(dialyzerResult.value)
          : [];

      // Compute stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointments.filter(
        (a) =>
          a.appointment_date === today ||
          (a.appointment_date && a.appointment_date.startsWith(today))
      );

      setStats({
        totalAppointments: todayAppts.length,
        scheduledAppointments: todayAppts.filter((a) =>
          ['SCHEDULED', 'BOOKED', 'ARRIVED'].includes(
            String(a.status || '').toUpperCase()
          )
        ).length,
        completedAppointments: todayAppts.filter(
          (a) => String(a.status || '').toUpperCase() === 'COMPLETED'
        ).length,

        totalBeds: beds.length,
        occupiedBeds: beds.filter(
          (b) => String(b.status || '').toUpperCase() === 'OCCUPIED'
        ).length,
        emptyBeds: beds.filter(
          (b) => String(b.status || '').toUpperCase() === 'EMPTY'
        ).length,
        quarantineBeds: beds.filter(
          (b) => String(b.status || '').toUpperCase() === 'QUARANTINE'
        ).length,

        activeAlerts: alerts.length,
        lowStockAlerts: alerts.filter(
          (a) => String(a.type || '').toUpperCase() === 'LOW_STOCK'
        ).length,
        expiryAlerts: alerts.filter(
          (a) => String(a.type || '').toUpperCase() === 'EXPIRY'
        ).length,

        totalStockItems: stockRows.length,
        lowStockItems: stockRows.filter(
          (s) => s.quantity !== undefined && s.quantity <= (s.reorder_level || 10)
        ).length,

        totalDialyzers: dialyzers.length,
        activeDialyzers: dialyzers.filter(
          (d) => String(d.status || '').toUpperCase() === 'ACTIVE'
        ).length,
        blockedDialyzers: dialyzers.filter(
          (d) => String(d.status || '').toUpperCase() === 'BLOCKED'
        ).length,
      });
    } catch (err) {
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Dialysis Dashboard"
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: 'Dialysis Dashboard', active: true },
            ]}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
          {loading ? (
            <div
              className="admin-card flex items-center justify-center"
              style={{ minHeight: '300px' }}
            >
              <p style={{ color: '#6B7280', fontSize: '16px' }}>
                Loading dashboard…
              </p>
            </div>
          ) : (
            <>
              {/* ─── Today's Appointments ─────────────── */}
              <div style={{ marginBottom: '12px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  📅 Today's Appointments
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(3, 1fr)',
                    gap: '14px',
                  }}
                >
                  <StatCard
                    label="Total Today"
                    value={stats.totalAppointments}
                    color="#1E40AF"
                    icon="📋"
                  />
                  <StatCard
                    label="Scheduled / Arrived"
                    value={stats.scheduledAppointments}
                    color="#EA580C"
                    icon="⏳"
                  />
                  <StatCard
                    label="Completed"
                    value={stats.completedAppointments}
                    color="#16A34A"
                    icon="✅"
                  />
                </div>
              </div>

              {/* ─── Bed Occupancy ────────────────────── */}
              <div style={{ marginBottom: '12px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  🛏️ Bed Occupancy
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr 1fr'
                      : 'repeat(4, 1fr)',
                    gap: '14px',
                  }}
                >
                  <StatCard
                    label="Total Beds"
                    value={stats.totalBeds}
                    color="#1F2937"
                    icon="🛏️"
                  />
                  <StatCard
                    label="Occupied"
                    value={stats.occupiedBeds}
                    color="#DC2626"
                    icon="🔴"
                  />
                  <StatCard
                    label="Available"
                    value={stats.emptyBeds}
                    color="#16A34A"
                    icon="🟢"
                  />
                  <StatCard
                    label="Quarantine"
                    value={stats.quarantineBeds}
                    color="#EA580C"
                    icon="⚠️"
                  />
                </div>
              </div>

              {/* ─── Inventory Alerts ─────────────────── */}
              <div style={{ marginBottom: '12px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  🔔 Inventory Alerts
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(3, 1fr)',
                    gap: '14px',
                  }}
                >
                  <StatCard
                    label="Active Alerts"
                    value={stats.activeAlerts}
                    color={stats.activeAlerts > 0 ? '#DC2626' : '#16A34A'}
                    icon="🔔"
                    subtext={
                      stats.activeAlerts === 0 ? 'All clear!' : 'Needs attention'
                    }
                  />
                  <StatCard
                    label="Low Stock"
                    value={stats.lowStockAlerts}
                    color="#EA580C"
                    icon="📉"
                  />
                  <StatCard
                    label="Expiry Warnings"
                    value={stats.expiryAlerts}
                    color="#991B1B"
                    icon="⏰"
                  />
                </div>
              </div>

              {/* ─── Dialyzers ────────────────────────── */}
              <div style={{ marginBottom: '12px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  💊 Dialyzers
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(3, 1fr)',
                    gap: '14px',
                  }}
                >
                  <StatCard
                    label="Total Registered"
                    value={stats.totalDialyzers}
                    color="#1E40AF"
                    icon="💊"
                  />
                  <StatCard
                    label="Active"
                    value={stats.activeDialyzers}
                    color="#16A34A"
                    icon="✅"
                  />
                  <StatCard
                    label="Blocked (Limit Reached)"
                    value={stats.blockedDialyzers}
                    color="#DC2626"
                    icon="🚫"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisDashboard;
