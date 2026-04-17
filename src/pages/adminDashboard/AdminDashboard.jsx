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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Button, Flex, Heading, SortDropdown, Text } from '../../component-library';
import { getIdByEmail, isDoctorRole } from '../../ApiCalls/authapis';
import { getDoctorIdByEmail } from '../../ApiCalls/doctorApis';
import { getDoctorSortAlerts } from '../../ApiCalls/doctorAlert';
import {
  getTotalUsers,
  getUsersThisWeek,
  getAlerts,
  getUsersThisWeekSub,
  getSuperAdminAlerts,
  sendAlertEmails,
} from '../../ApiCalls/adminDashApis';
import PatientAlertsByType from '../PatientAlertsByType';
import { getAlertByType } from '../../ApiCalls/alertsApis';
import { getDoctorComments } from '../../ApiCalls/GetComments';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { usePageCache, PAGE_CACHE } from '../../cache';
import RefreshButton from '../../components/RefreshButton/RefreshButton';
import PageSkeleton from '../../components/PageSkeleton';

// Dashboard components (desktop layout)
import StatCard from '../../components/dashboard/StatCard';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import PageHeader from '../../components/PageHeader';


// Design system primitives
import { Heading as DSHeading, Text as DSText } from '../../component-library/primitives/Typography';

// Styles
import '../dashboard/dashboard.css';

// Additional components for mobile/legacy layout
import PatientAlertCard from './components/PatientAlertCard';
import PrescriptionModal from './components/ApprovePrescriptionModal';
import CommentContainer from './components/CommentContainer';
import AlertModal from './components/AlertModal';
import DiaAlertModal from './components/DialysisTechModal';

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
  const { isMobile } = useIsMobile();
  const roleName = useSelector((state) => {
    // alert(JSON.stringify(state));
    return state.permission?.role_name;
  });
  
  const isDialysisTechnician = roleName === 'Dialysis Technician' || localStorage.getItem('role') === 'Dialysis Technician';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    weeklySubscriptions: 0,
    newUsers: 0,
  });
  const [alertTypeFilter, setAlertTypeFilter] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [ready, setReady] = useState(false);
  const [allAlerts, setAllAlerts] = useState([]);
  const [modals, setModals] = useState({
    prescription: false,
    comment: false,
    alert: false,
    dialysis: false,
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.DASHBOARD);

  const handleAlertClick = useCallback(
    (alert) => {
      if (alert.patientId) {
        navigate(`/userProfile/${alert.patientId}`);
      }
    },
    [navigate]
  );

  const handleSendAlertEmails = async () => {
    setSendingEmails(true);
    try {
      await sendAlertEmails();
      alert('Alert emails sent successfully!');
    } catch (e) {
      console.error('Error sending emails:', e);
      alert('Failed to send alert emails.');
    } finally {
      setSendingEmails(false);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      const adminId = localStorage.getItem('id');
      const isDoc = localStorage.getItem('isDoctor') === 'true';

      // Fetch Stats (cached)
      const statsResult = await fetchWithCache('dashboardStats', async () => {
        const [total, newU, newUSub] = await Promise.all([
          getTotalUsers(),
          getUsersThisWeek(),
          getUsersThisWeekSub(),
        ]);
        return {
          success: true,
          data: {
            totalUsers: total || 0,
            newUsers: adminId === '1' ? (newU || 0) : (newUSub || 0),
          },
        };
      });
      if (statsResult.success) {
        const { totalUsers = 0, newUsers = 0 } = statsResult.data;
        setStats({
          totalUsers,
          newUsersThisWeek: newUsers,
          weeklySubscriptions: newUsers,
          newUsers,
        });
      }

      // Fetch Alerts (cached) - Only for doctors and super admins
      const alertsResult = await fetchWithCache('dashboardAlerts', async () => {
        let alerts = [];
        if (isDoc) {
          const doctorIdRes = await getDoctorIdByEmail({ email });
          const doctorId = doctorIdRes.success ? doctorIdRes.data?.data : null;
          if (doctorId) {
            const alertsRes = await getDoctorSortAlerts(doctorId);
            alerts = alertsRes.success ? alertsRes.data || [] : [];
          }
        } else if (adminId === '1') {
          try {
            const superRes = await getSuperAdminAlerts(adminId);
            alerts = superRes?.data || [];
          } catch {
            const alertsRes = await getAlerts();
            alerts = (alertsRes.data || []).reverse();
          }
        }
        // Regular admins do not receive alerts
        return { success: true, data: alerts };
      });
      let alerts = alertsResult.success ? alertsResult.data : [];
      setAllAlerts(alerts);

      // Group by patient
      const patientMap = new Map();
      for (const alert of alerts) {
        const pId = alert.patientId;
        if (!pId) continue;
        if (!patientMap.has(pId)) {
          patientMap.set(pId, {
            id: pId,
            name: alert.name || 'Unknown Patient',
            avatar: alert.patientProfilePhoto,
            prescriptionAlerts: [],
            commentAlerts: [],
            alertAlerts: [],
            dialysisAlerts: [],
            prescriptionCount: 0,
            commentCount: 0,
            alertCount: 0,
            dialysisCount: 0,
          });
        }
        const pData = patientMap.get(pId);
        const type = (alert.type || '').toLowerCase();
        const category = (alert.category || '').toLowerCase();
        if (type.includes('prescription') || category.includes('prescription')) {
          pData.prescriptionAlerts.push(alert);
          pData.prescriptionCount++;
        } else if (type.includes('dialysis tech') || category.includes('dialysis tech')) {
          pData.dialysisAlerts.push(alert);
          pData.dialysisCount++;
        } else {
          pData.alertAlerts.push(alert);
          if (alert.isRead === 0 || alert.isRead === false) {
            pData.alertCount++;
          }
        }
      }

      if (isDoc) {
        const patientPromises = Array.from(patientMap.values()).map(async (p) => {
          try {
            const commentRes = await getDoctorComments(email, p.name);
            const comments = commentRes.comments || [];
            p.commentAlerts = comments.sort((a, b) => new Date(b.date) - new Date(a.date));
            p.commentCount = comments.filter(c => !c.isRead).length;
          } catch (e) {
            console.error(`Error fetching comments for ${p.name}:`, e);
          }
        });
        await Promise.all(patientPromises);
      }

      setPatients(Array.from(patientMap.values()));
      setAllPatients(Array.from(patientMap.values()));
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [fetchWithCache]);

  const refetch = fetchDashboardData;

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      if (isDialysisTechnician) {
        setLoading(false);
        setReady(true);
        return;
      }
      const email = localStorage.getItem('email');
      try {
        const idRes = await getIdByEmail({ email });
        if (idRes.success) {
          localStorage.setItem('id', idRes.data?.id);
        }
      } catch (err) {
        console.error('Error getting admin id:', err);
      }
      try {
        const docRes = await isDoctorRole();
        if (docRes.success) {
          localStorage.setItem('isDoctor', docRes.data?.data);
        }
      } catch (err) {
        console.error('Error checking isDoctor:', err);
      }
      fetchDashboardData();
    };
    init();
  }, [navigate, fetchDashboardData, refreshKey, isDialysisTechnician]);

  const handleAction = (patient, type) => {
    setSelectedPatient(patient);
    if (type === 'prescription') {
      localStorage.setItem('prescriptionAlerts', JSON.stringify(patient.prescriptionAlerts));
    } else if (type === 'alert') {
      localStorage.setItem('alertAlerts', JSON.stringify(patient.alertAlerts));
    } else if (type === 'dialysis') {
      localStorage.setItem('Dialysis_updates', JSON.stringify(patient.dialysisAlerts));
    }
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
    if (type === 'alert' || type === 'comment') {
      fetchDashboardData();
    }
  };

  const handleAlertTypeFilter = async (type) => {
    setAlertTypeFilter(type);
    if (!type) {
      setPatients(allPatients);
      return;
    }
    try {
      const res = await getAlertByType(type);
      const filtered = res?.data || [];
      const patientMap = new Map();
      for (const alert of filtered) {
        const pId = alert.patientId;
        if (!pId) continue;
        if (!patientMap.has(pId)) {
          patientMap.set(pId, {
            id: pId,
            name: alert.name || 'Unknown Patient',
            avatar: alert.patientProfilePhoto,
            prescriptionAlerts: [], commentAlerts: [],
            alertAlerts: [], dialysisAlerts: [],
            prescriptionCount: 0, commentCount: 0,
            alertCount: 0, dialysisCount: 0,
          });
        }
        const pData = patientMap.get(pId);
        const t = (alert.type || '').toLowerCase();
        if (t.includes('prescription')) { pData.prescriptionAlerts.push(alert); pData.prescriptionCount++; }
        else if (t.includes('dialysis')) { pData.dialysisAlerts.push(alert); pData.dialysisCount++; }
        else { pData.alertAlerts.push(alert); if (!alert.isRead) pData.alertCount++; }
      }
      setPatients(Array.from(patientMap.values()));
    } catch (e) {
      console.error('Error filtering by type:', e);
    }
  };

  const { doctorAlerts, adminAlerts } = useMemo(() => {
    const d = [];
    const a = [];
    for (const a2 of allAlerts) {
      const type = (a2.type || a2.message || '').toLowerCase();
      if (type.includes('prescription') || type.includes('comment') || type.includes('doctor') || type.includes('report')) {
        d.push(a2);
      } else {
        a.push(a2);
      }
    }
    return { doctorAlerts: d, adminAlerts: a };
  }, [allAlerts]);


  // render
  if (error) {
    return (
      <div className="dashboard">
        <DashboardError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!isMobile) {
    if (loading) {
      return (
        <div className="dashboard">
          <DashboardSkeleton />
        </div>
      );
    }

    return (
      <div className="dashboard">
        <PageHeader title="Admin Dashboard" rightAction={<RefreshButton pageName={PAGE_CACHE.DASHBOARD.name} />} />
        <section className="dashboard__section">
          <Flex justify="between" align="center" className="mb-4">
            <Heading as="h4" className="dashboard__section-title">
              Overview
            </Heading>
            <Button onClick={() => window.open('https://eprescription.kifaytihealth.com/', '_blank')}>
              Eprescription
            </Button>
          </Flex>
          <div className="stat-grid">
            <StatCard
              icon={<UsersIcon />}
              label="Total Users"
              value={stats.totalUsers}
              color="primary"
            />
            <StatCard
              icon={<WeeklyIcon />}
              label="Users Joined This Week"
              value={stats.newUsersThisWeek}
            />
            <StatCard
              icon={<SubscriptionsIcon />}
              label="Weekly Subscriptions"
              value={stats.weeklySubscriptions}
            />
          </div>
        </section>
        {localStorage.getItem('isDoctor') === 'true' && (
          <section className="dashboard__section">
            <Heading as="h2" className="dashboard__section-title">
              Alerts
            </Heading>
            <div className="alerts-grid">
              <PatientAlertsByType
                title="Patient Alerts"
                alerts={allAlerts}
              />
            </div>
          </section>
        )}
      </div>
    );
  }

  // mobile layout
  return (
    <Box className={`flex-1 flex flex-col min-h-0 bg-white ${isMobile ? 'px-3 pt-2' : ''}`}>
      {/* Main Content Scrollable Area */}
      <Box className="flex-1 overflow-y-auto">

        {/* Header */}
        <Flex
          align="center"
          justify="between"
          className={`border-b-2 border-[#00cccc] ${isMobile ? 'pb-3 mb-4' : 'pb-6 mb-8'}`}
        >
          <Heading as="h1" size={isMobile ? 'lg' : '2xl'} className="text-[#3F6B85] mt-3">
            My Dashboard
          </Heading>
          <Flex align="center" gap={3}>
            {isMobile && (
              <Flex gap={2} align="center">
                <Box
                  className="flex items-center gap-1 px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-primary-light, #dbeafe)' }}
                >
                  <Text size="xs" weight="bold" className="text-primary">{stats.totalUsers}</Text>
                  <Text size="xs" className="text-primary">Total</Text>
                </Box>
                <Box
                  className="flex items-center gap-1 px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-success-light, #d1fae5)' }}
                >
                  <Text size="xs" weight="bold" className="text-success">{stats.newUsers}</Text>
                  <Text size="xs" className="text-success">New</Text>
                </Box>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Desktop stats summary */}
        {!isMobile && (
          <Flex gap={4} className="mb-6">
            <Box className="flex-1 p-4 rounded-xl  ">
              <Text size="sm" className="text-muted">Total Patients</Text>
              <Text size="2xl" weight="bold" className="text-accent">{stats.totalUsers}</Text>
            </Box>
            <Box className="flex-1 p-4 rounded-xl ">
              <Text size="sm" className="text-muted">New This Week</Text>
              <Text size="2xl" weight="bold" className="text-success">{stats.newUsers}</Text>
            </Box>
          </Flex>
        )}

        {/* Alerts Section */}
        <Box className={isMobile ? 'pb-20' : 'pb-8'}>
          <Flex justify="between" align="center" className={isMobile ? 'mb-3' : 'mb-6'}>
            <Heading as="h2" size={isMobile ? 'md' : 'xl'} className="text-black font-bold">
              Important Alerts
            </Heading>
            <Flex gap={2} align="center">
              <SortDropdown
                value={alertTypeFilter}
                onChange={(e) => handleAlertTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'prescription', label: 'Prescription' },
                  { value: 'daily', label: 'Daily Readings' },
                  { value: 'dialysis', label: 'Dialysis' },
                  { value: 'lab', label: 'Lab Reports' },
                  { value: 'enrollment', label: 'Enrollment' },
                  { value: 'contact', label: 'Contact' },
                ]}
                className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}  rounded-lg bg-white text-gray-700`}
              />
              {alertTypeFilter && (
                <button
                  onClick={() => handleAlertTypeFilter('')}
                  className="text-lg text-[#5886a5] underline hover:text-[#4164df]"
                >
                  Clear
                </button>
              )}
            </Flex>
          </Flex>

          {loading && !ready ? (
            <PageSkeleton variant="dashboard" />
          ) : patients.length === 0 ? (
            <Flex justify="center" align="center" className="py-12 text-gray-500">
              <Text size="md">No alerts at this time</Text>
            </Flex>
          ) : (
            <Flex direction={isMobile ? 'column' : 'row'} gap={6}>
              <Box className="flex-1">
                <Heading as="h3" size={isMobile ? 'sm' : 'lg'} className="mb-3">Admin Alerts</Heading>
                <Flex direction="column" gap={0}>
                  {patients
                    .filter(p => (p.prescriptionCount === 0 && p.commentCount === 0))
                    .map((patient) => (
                      <React.Fragment key={`admin-${patient.id}`}>
                        <PatientAlertCard patient={patient} onAction={handleAction} />
                        <Box className={`h-[2px] bg-gray-200 ${isMobile ? 'my-3' : 'my-6'}`} />
                      </React.Fragment>
                    ))}
                </Flex>
              </Box>
              <Box className="flex-1">
                <Heading as="h3" size={isMobile ? 'sm' : 'lg'} className="mb-3">Doctor Alerts</Heading>
                <Flex direction="column" gap={0}>
                  {patients
                    .filter(p => (p.prescriptionCount > 0 || p.commentCount > 0))
                    .map((patient) => (
                      <React.Fragment key={`doctor-${patient.id}`}>
                        <PatientAlertCard patient={patient} onAction={handleAction} />
                        <Box className={`h-[2px] bg-gray-200 ${isMobile ? 'my-3' : 'my-6'}`} />
                      </React.Fragment>
                    ))}
                </Flex>
              </Box>
            </Flex>
          )}
        </Box>
      </Box>

      {/* Modals */}
      {modals.prescription && (
        <PrescriptionModal closeModal={() => closeModal('prescription')} />
      )}
      {modals.comment && (
        <CommentContainer
          comments={selectedPatient?.commentAlerts || []}
          closeModal={() => closeModal('comment')}
        />
      )}
      {modals.alert && (
        <AlertModal closeModal={() => closeModal('alert')} />
      )}
      {modals.dialysis && (
        <DiaAlertModal closeModal={() => closeModal('dialysis')} />
      )}
    </Box>
  );
};

export default AdminDashboard;
