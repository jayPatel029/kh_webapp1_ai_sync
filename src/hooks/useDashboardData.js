/**
 * Dashboard Data Hook
 * Fetches and shapes all data needed for Admin / Doctor dashboards.
 * - Parallel API calls via Promise.allSettled
 * - 60-second auto-refetch for alerts
 * - Defensive array extraction (handles double-wrapped API responses)
 * - Error state tracking per data source
 *
 * @file src/hooks/useDashboardData.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Auth & User APIs
import {
  getIdByEmail,
  isDoctorRole,
} from '../ApiCalls/authapis';

// Admin Dashboard APIs
import {
  getTotalUsers,
  getUsersThisWeek,
  getUsersThisWeekSub,
  getAlerts,
  sendAlertEmails,
} from '../ApiCalls/adminDashApis';

// Doctor APIs
import { getDoctorIdByEmail } from '../ApiCalls/doctorApis';
import { getDoctorSortAlerts } from '../ApiCalls/doctorAlert';
import { canReceiveDailyAlerts } from '../ApiCalls/alertsApis';

// Patient APIs
import { getPatients } from '../ApiCalls/patientAPis';
import { isChatAlert } from '../helpers/alertGrouping';

// ─── Helpers ────────────────────────────────────────────────

/** Safely extract an array from an API response that may be double-wrapped.
 *  Handles: raw array, {data: [...]}, {success, data: [...]}, {success, data: {data: [...]}} */
function safeArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    if (Array.isArray(val.data)) return val.data;
    if (val.data && Array.isArray(val.data.data)) return val.data.data;
  }
  return [];
}

/** Extract the value from a settled promise result or return fallback */
function settled(result, fallback = null) {
  return result.status === 'fulfilled' ? result.value : fallback;
}

/** Extract a numeric stat from the adminDashApis helpers (they return raw numbers) */
function safeNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && !isNaN(Number(val))) return Number(val);
  if (val && typeof val === 'object') {
    // Handle {success, data: <number>} wrapper
    if (typeof val.data === 'number') return val.data;
  }
  return 0;
}

const ALERTS_REFETCH_MS = 60_000; // 60 seconds

const stripChatAlerts = (alerts = []) => alerts.filter((alert) => !isChatAlert(alert));

/** Main DoctorContainer parity: hide reading alerts when capability is off. */
const applyDailyAlertsCapabilityFilter = (alerts = [], canReceive) => {
  if (canReceive) return alerts;
  return alerts.filter(
    (alert) => alert?.dailyordia !== 'daily' && alert?.dailyordia !== 'dialysis'
  );
};

/** True when GET /alerts/dailyAlerts succeeds (main treated HTTP 200 as allowed). */
const resolveDailyAlertsCapability = async () => {
  try {
    const result = await canReceiveDailyAlerts();
    if (result?.isAxiosError) return false;
    if (result?.response?.status === 403) return false;
    // axios error objects often have a message / config without success payload
    if (result instanceof Error) return false;
    return true;
  } catch {
    return false;
  }
};

// ─── useAdminDashboardData ──────────────────────────────────

export function useAdminDashboardData() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    adminId: null,
    isDoctor: false,
    roleName: '',
    // Numeric stats (from dedicated count endpoints)
    totalUsers: 0,
    newUsersThisWeek: 0,
    // Alerts
    alerts: [],
  });

  // Ref to track interval so we can clear it on unmount
  const alertIntervalRef = useRef(null);

  // ─── Fetch alerts only (for 60-second polling) ───────────
  const fetchAlerts = useCallback(async (adminId, isDoc, email) => {
    try {
      let alertsRaw = [];

      if (isDoc) {
        // Doctor who is also admin → fetch doctor alerts
        const doctorIdRes = await getDoctorIdByEmail({ email });
        const doctorId = doctorIdRes.success
          ? (doctorIdRes.data?.data ?? doctorIdRes.data)
          : null;
        if (doctorId) {
          const res = await getDoctorSortAlerts(doctorId);
          alertsRaw = stripChatAlerts(res.success ? safeArray(res.data) : []);
        }
      } else if (String(adminId) === '1') {
        // Superadmin: full sorted alerts + escalations via /sortAlerts/1
        const res = await getAlerts();
        alertsRaw = stripChatAlerts(safeArray(res?.data ?? res).reverse());
      } else {
        // Regular admin
        const res = await getAlerts();
        alertsRaw = stripChatAlerts(safeArray(res?.data ?? res).reverse());
      }

      setData((prev) => ({ ...prev, alerts: alertsRaw }));
    } catch (err) {
      console.error('Alert refetch error:', err);
    }
  }, []);

  // ─── Full initial fetch ──────────────────────────────────
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const role = (localStorage.getItem('role') || '').toLowerCase();
    // If user is a dialysis technician, send them to the dialysis dashboard by default
    if (role.includes('dialysis')) {
      navigate('/dialysis/dashboard');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const email = localStorage.getItem('email');

      // Step 1: Get admin ID
      let adminId = localStorage.getItem('id');
      try {
        const idRes = await getIdByEmail({ email });
        if (idRes.success) {
          const resolvedId = idRes.data?.id ?? idRes.data?.data?.id ?? idRes.data;
          if (resolvedId) {
            adminId = resolvedId;
            localStorage.setItem('id', adminId);
          }
        }
      } catch (err) {
        console.error('Error getting admin id:', err);
      }

      // Step 2: Check if also a doctor
      let isDoc = false;
      try {
        const docRes = await isDoctorRole();
        if (docRes.success) {
          const val = docRes.data?.data ?? docRes.data;
          isDoc = val === true || val === 'true';
          localStorage.setItem('isDoctor', isDoc);
        }
      } catch (err) {
        console.error('Error checking isDoctor:', err);
      }

      // Step 3: Fetch only stable admin dashboard metrics
      const [
        totalUsersRes,
        newUsersRes,
        newUsersSubRes,
      ] = await Promise.allSettled([
        getTotalUsers(),
        getUsersThisWeek(),
        getUsersThisWeekSub(),
      ]);

      // Extract numbers (these APIs return raw numbers)
      const totalUsers = safeNumber(settled(totalUsersRes, 0));
      const newUsersWeek = safeNumber(settled(newUsersRes, 0));
      const newUsersWeekSub = safeNumber(settled(newUsersSubRes, 0));

      // Step 4: Fetch alerts (separate so we can refetch on interval)
      let alerts = [];
      try {
        if (isDoc) {
          const doctorIdRes = await getDoctorIdByEmail({ email });
          const doctorId = doctorIdRes.success
            ? (doctorIdRes.data?.data ?? doctorIdRes.data)
            : null;
          if (doctorId) {
            const res = await getDoctorSortAlerts(doctorId);
            alerts = stripChatAlerts(res.success ? safeArray(res.data) : []);
          }
        } else if (String(adminId) === '1') {
          // Superadmin: full sorted alerts + escalations via /sortAlerts/1
          const res = await getAlerts();
          alerts = stripChatAlerts(safeArray(res?.data ?? res).reverse());
        } else {
          const res = await getAlerts();
          alerts = stripChatAlerts(safeArray(res?.data ?? res).reverse());
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }

      setData({
        adminId,
        isDoctor: isDoc,
        roleName: role || '',
        totalUsers,
        newUsersThisWeek: String(adminId) === '1' ? newUsersWeek : newUsersWeekSub,
        alerts,
      });

      // Start alert polling
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = setInterval(() => {
        fetchAlerts(adminId, isDoc, email);
      }, ALERTS_REFETCH_MS);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchAlerts]);

  useEffect(() => {
    fetchData();
    return () => {
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
    };
  }, [fetchData]);

  return { loading, error, data, refetch: fetchData };
}

// ─── useDoctorDashboardData ─────────────────────────────────

export function useDoctorDashboardData() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    doctorName: '',
    doctorId: null,
    alerts: [],
    patients: [],
    totalPatients: 0,
    newPatients: 0,
    activePatients: 0,
    canReceiveDailyAlerts: false,
  });

  const alertIntervalRef = useRef(null);
  const dailyCapabilityRef = useRef(false);

  const fetchAlerts = useCallback(async (doctorId) => {
    try {
      const res = await getDoctorSortAlerts(doctorId);
      let alerts = stripChatAlerts(res.success ? safeArray(res.data) : []);

      // Fallback to /api/alerts when doctor endpoint is empty/unavailable
      if (!alerts.length) {
        const allAlertsRes = await getAlerts();
        alerts = stripChatAlerts(safeArray(allAlertsRes?.data ?? allAlertsRes));
      }

      alerts = applyDailyAlertsCapabilityFilter(alerts, dailyCapabilityRef.current);

      setData((prev) => ({ ...prev, alerts }));
    } catch (err) {
      console.error('Doctor alert refetch error:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const email = localStorage.getItem('email');
      const name =
        localStorage.getItem('firstname') ||
        localStorage.getItem('name') ||
        'Doctor';

      // Get doctor ID
      const idRes = await getDoctorIdByEmail({ email });
      const doctorId = idRes.success
        ? (idRes.data?.data ?? idRes.data)
        : null;

      if (!doctorId) {
        console.error('Could not resolve doctor id');
        setError('Could not resolve doctor identity');
        setLoading(false);
        return;
      }

      const canReceive = await resolveDailyAlertsCapability();
      dailyCapabilityRef.current = canReceive;

      // Parallel fetch
      const [alertsRes, allAlertsRes, patientsRes] = await Promise.allSettled([
        getDoctorSortAlerts(doctorId),
        getAlerts(),
        getPatients(),
      ]);

      const alertsRaw = settled(alertsRes);
      const doctorAlerts = alertsRaw?.success ? stripChatAlerts(safeArray(alertsRaw.data)) : [];
      const allAlertsRaw = settled(allAlertsRes);
      const fallbackAlerts = stripChatAlerts(safeArray(allAlertsRaw?.data ?? allAlertsRaw));
      let alerts = doctorAlerts.length ? doctorAlerts : fallbackAlerts;
      alerts = applyDailyAlertsCapabilityFilter(alerts, canReceive);

      const patientsRaw = settled(patientsRes);
      const patients = patientsRaw?.success ? safeArray(patientsRaw.data) : [];

      // Calculate patient stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const newPatients = patients.filter((p) => {
        if (!p.registered_date) return false;
        return new Date(p.registered_date) >= weekAgo;
      }).length;

      setData({
        doctorName: name,
        doctorId,
        alerts,
        patients,
        totalPatients: patients.length,
        newPatients,
        activePatients: patients.length,
        canReceiveDailyAlerts: canReceive,
      });

      // Start alert polling
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = setInterval(() => {
        fetchAlerts(doctorId);
      }, ALERTS_REFETCH_MS);
    } catch (err) {
      console.error('Doctor dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchAlerts]);

  useEffect(() => {
    fetchData();
    return () => {
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
    };
  }, [fetchData]);

  return { loading, error, data, refetch: fetchData };
}

// ─── sendAlertEmails wrapper ────────────────────────────────

export { sendAlertEmails };

