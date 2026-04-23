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
import { Box, Flex, Heading, Text } from '../../component-library';
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
import axiosInstance from '../../helpers/axios/axiosInstance';
import { server_url } from '../../constants/constants';
import { groupAlertsByPatient } from '../../helpers/alertGrouping';

// ─── Helpers ───────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
};

const PALETTE = ["#1a73e8", "#0f9d58", "#f4511e", "#7b1fa2", "#e65100", "#00838f", "#37474f", "#558b2f"];
const pickColor = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const Avatar = ({ name = "" }) => (
  <div
    className="h-8 w-8 text-xs rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
    style={{ background: pickColor(String(name)) }}
  >
    {getInitials(name)}
  </div>
);

const AlertColumn = ({ title, badge, badgeColor = "#ef4444", children, loading, empty }) => (
  <div
    className="flex flex-col flex-1 min-w-0 rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden"
    style={{ minHeight: "420px", maxHeight: "calc(100vh - 320px)" }}
  >
    <div
      className="px-5 py-3 flex items-center gap-3 border-b border-gray-100 flex-shrink-0"
      style={{ background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)" }}
    >
      <Heading as="h2" size="md" className="text-[#3F6B85] font-bold flex-1">
        {title}
      </Heading>
      {badge != null && (
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm"
          style={{ background: badgeColor }}
        >
          {badge}
        </span>
      )}
    </div>

    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <Flex justify="center" align="center" className="py-12 text-gray-400">
          <Text size="sm">Loading…</Text>
        </Flex>
      ) : empty ? (
        <Flex justify="center" align="center" className="py-12 text-gray-400 flex-col gap-2">
          <span className="text-3xl opacity-30">🔔</span>
          <Text size="sm">No alerts</Text>
        </Flex>
      ) : (
        children
      )}
    </div>
  </div>
);

const AlertPatientRow = ({ patient, subtitle, unreadCount, date, badgeColor = "#ef4444", onClick }) => (
  <button
    onClick={() => onClick && onClick(patient)}
    className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors group cursor-default"
  >
    <Avatar name={patient.name} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#4164df]">
        {patient.name}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 truncate max-w-[320px] mt-0.5 italic">
          {subtitle}
        </p>
      )}
    </div>
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      {unreadCount > 0 && (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ background: badgeColor }}
        >
          {unreadCount}
        </span>
      )}
      <span className="text-[10px] text-gray-400">{formatDate(date)}</span>
    </div>
  </button>
);

const AlertInventoryRow = ({ alert }) => {
  const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH' || alert.type === 'EXPIRY';
  const badgeColor = isCritical ? '#ef4444' : '#f59e0b';

  return (
    <div className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-orange-50 transition-colors group">
      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
        📦
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#ea580c]">
          {alert.type === 'LOW_STOCK' ? 'Low Stock Alert' : (alert.type === 'EXPIRY' ? 'Expiry Alert' : 'Inventory Alert')}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {alert.message || `Item ID: ${alert.item_id}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ background: badgeColor }}
        >
          {isCritical ? 'CRITICAL' : 'WARNING'}
        </span>
        <span className="text-[10px] text-gray-400">{formatDate(alert.created_at || alert.updated_at)}</span>
      </div>
    </div>
  );
};
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
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '12px',
        fontSize: '24px',
        opacity: 0.15,
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
      {label}
    </span>
    <span
      style={{
        fontSize: '22px',
        fontWeight: 800,
        color: color || '#1F2937',
        lineHeight: 1.1,
      }}
    >
      {value}
    </span>
    {subtext && (
      <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>{subtext}</span>
    )}
  </div>
);

const DialysisDashboard = () => {
  const { isMobile } = useIsMobile();
  const { showToast, ToastContainer } = useAdminToast();
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('role');
  const isTechnician = userRole === 'Dialysis Technician';

  // ─── Alerts Data ───────────────────────────────────────
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [technicianAlerts, setTechnicianAlerts] = useState([]);

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
      const [apptResult, bedResult, alertResult, stockResult, dialyzerResult, patRes] =
        await Promise.allSettled([
          getAppointments(),
          getAllBeds(),
          getInventoryAlerts({ params: { status: 'ACTIVE' } }),
          getInventoryStock(),
          getInventoryDialyzers(),
          axiosInstance.get(`${server_url}/alerts/byType/patient`)
        ]);

      const appointments =
        apptResult.status === 'fulfilled' ? unwrapArray(apptResult.value) : [];
      const beds =
        bedResult.status === 'fulfilled' ? unwrapArray(bedResult.value) : [];
      const alerts =
        alertResult.status === 'fulfilled'
          ? unwrapArray(alertResult.value)
          : [];
      setInventoryAlerts(alerts);

      const stockRows =
        stockResult.status === 'fulfilled'
          ? unwrapArray(stockResult.value)
          : [];
      const dialyzers =
        dialyzerResult.status === 'fulfilled'
          ? unwrapArray(dialyzerResult.value)
          : [];

      const rawPatient = patRes.status === 'fulfilled' ? (patRes.value.data || []) : [];
      const patGrouped = groupAlertsByPatient(rawPatient, { includeChats: false });
      const dialysisPatients = patGrouped.patients.filter(p => p.dialysisCount > 0);
      setTechnicianAlerts(dialysisPatients);

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
            title={isTechnician ? "Dialysis Technician Dashboard" : "Dialysis Manager Dashboard"}
            breadcrumbs={[
              { label: 'Dashboard', path: '/' },
              { label: isTechnician ? "Dialysis Technician Dashboard" : "Dialysis Manager Dashboard", active: true },
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
                      marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                    Today's Appointments
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(3, 1fr)',
                      gap: '12px',
                  }}
                >
                  <StatCard
                    label="Total Today"
                    value={stats.totalAppointments}
                    color="#1E40AF"
                      icon=""
                  />
                  <StatCard
                    label="Scheduled / Arrived"
                    value={stats.scheduledAppointments}
                    color="#EA580C"
                      icon=""
                  />
                  <StatCard
                    label="Completed"
                    value={stats.completedAppointments}
                    color="#16A34A"
                      icon=""
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
                      marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                    Bed Occupancy
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr 1fr'
                      : 'repeat(4, 1fr)',
                      gap: '12px',
                  }}
                >
                  <StatCard
                    label="Total Beds"
                    value={stats.totalBeds}
                    color="#1F2937"
                      icon=""
                  />
                  <StatCard
                    label="Occupied"
                    value={stats.occupiedBeds}
                    color="#DC2626"
                      icon=""
                  />
                  <StatCard
                    label="Available"
                    value={stats.emptyBeds}
                    color="#16A34A"
                      icon=""
                  />
                  <StatCard
                    label="Quarantine"
                    value={stats.quarantineBeds}
                    color="#EA580C"
                      icon=""
                  />
                </div>
              </div>

              {/* ─── Inventory Alerts ─────────────────── */}
                {!isTechnician && (
                  <div style={{ marginBottom: '12px' }}>
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Inventory Alerts
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                          ? '1fr'
                          : 'repeat(3, 1fr)',
                        gap: '12px',
                      }}
                    >
                      <StatCard
                        label="Active Alerts"
                        value={stats.activeAlerts}
                        color={stats.activeAlerts > 0 ? '#DC2626' : '#16A34A'}
                        icon=""
                        subtext={
                          stats.activeAlerts === 0 ? 'All clear!' : 'Needs attention'
                        }
                      />
                      <StatCard
                        label="Low Stock"
                        value={stats.lowStockAlerts}
                        color="#EA580C"
                        icon=""
                      />
                      <StatCard
                        label="Expiry Warnings"
                        value={stats.expiryAlerts}
                        color="#991B1B"
                        icon=""
                      />
                    </div>
                  </div>
                )}

              {/* ─── Dialyzers ────────────────────────── */}
                {!isTechnician && (
                  <div style={{ marginBottom: '12px' }}>
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Dialyzers
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                          ? '1fr'
                          : 'repeat(3, 1fr)',
                        gap: '12px',
                      }}
                    >
                      <StatCard
                        label="Total Registered"
                        value={stats.totalDialyzers}
                        color="#1E40AF"
                        icon=""
                      />
                      <StatCard
                        label="Active"
                        value={stats.activeDialyzers}
                        color="#16A34A"
                        icon=""
                      />
                      <StatCard
                        label="Blocked (Limit Reached)"
                        value={stats.blockedDialyzers}
                        color="#DC2626"
                        icon=""
                      />
                    </div>
                </div>
                )}

                {/* ─── Alerts Section ─────────────────────── */}
                <Box className="mt-8 mb-4">
                  <div
                    className="grid gap-5"
                    style={{ gridTemplateColumns: (isMobile || isTechnician) ? "1fr" : "1fr 1fr" }}
                  >
                    {/* Left: Inventory Alerts (Manager) */}
                    {!isTechnician && (
                      <AlertColumn
                        title="Inventory Alerts"
                        badge={inventoryAlerts.length || null}
                        badgeColor="#ea580c"
                        loading={loading}
                        empty={!loading && inventoryAlerts.length === 0}
                      >
                        {inventoryAlerts.map((alert) => (
                          <AlertInventoryRow key={alert.id} alert={alert} />
                        ))}
                      </AlertColumn>
                    )}

                    {/* Right: Technician Alerts */}
                    <AlertColumn
                      title="Technician Alerts"
                      badge={technicianAlerts.reduce((s, p) => s + p.dialysisCount, 0) || technicianAlerts.length || null}
                      badgeColor="#ef4444"
                      loading={loading}
                      empty={!loading && technicianAlerts.length === 0}
                    >
                      {technicianAlerts.map((patient) => (
                        <AlertPatientRow
                          key={patient.id}
                          patient={patient}
                          subtitle={patient.dialysisAlerts[0]?.category || "Dialysis alert"}
                          unreadCount={patient.dialysisCount}
                          date={patient.latestAlertAt}
                          badgeColor="#ef4444"
                        />
                      ))}
                    </AlertColumn>
                  </div>
                </Box>
            </>
          )}
        </div>

        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
};

export default DialysisDashboard;
