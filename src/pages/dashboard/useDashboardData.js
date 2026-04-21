/**
 * Dashboard API Helpers
 * Centralized data-fetching utilities for the dashboard.
 * Wraps the existing ApiCalls with dashboard-specific logic.
 * 
 * @file src/pages/dashboard/useDashboardData.js
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Auth & User APIs
import { getIdByEmail, isDoctorRole, getUsers, getUsersByRole, getAdmins } from '../../ApiCalls/authapis';

// Admin Dashboard APIs
import {
  getTotalUsers,
  getUsersThisWeek,
  getUsersThisWeekSub,
  getAlerts,
  getSuperAdminAlerts,
} from '../../ApiCalls/adminDashApis';

// Doctor APIs
import { getDoctors, getDoctorIdByEmail } from '../../ApiCalls/doctorApis';
import { getDoctorSortAlerts } from '../../ApiCalls/doctorAlert';

// Patient APIs
import { getPatients } from '../../ApiCalls/patientAPis';

// Appointment APIs
import { getTeleconsultationGetAllAppointmentsById } from '../../ApiCalls/remainingApis';

/**
 * Format a date string to YYYY-MM-DD
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Custom hook: fetches and shapes all data needed for the Admin Dashboard
 */
export function useAdminDashboardData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    adminId: null,
    isDoctor: false,
    // Stats
    totalUsers: 0,
    newUsers: 0,
    doctors: [],
    patients: [],
    frontdeskUsers: [],
    admins: [],
    // Alerts
    alerts: [],
    // Appointments
    appointments: { total: 0, newCount: 0, completed: 0, incomplete: 0 },
  });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const role = localStorage.getItem('role');
    if (role === 'Dialysis Technician') {
      navigate('/patients');
      return;
    }

    try {
      setLoading(true);
      const email = localStorage.getItem('email');

      // Step 1: Get admin ID
      let adminId = localStorage.getItem('id');
      try {
        const idRes = await getIdByEmail({ email });
        if (idRes.success) {
          adminId = idRes.data?.id;
          localStorage.setItem('id', adminId);
        }
      } catch (err) {
        console.error('Error getting admin id:', err);
      }

      // Step 2: Check if also a doctor
      let isDoc = false;
      try {
        const docRes = await isDoctorRole();
        if (docRes.success) {
          isDoc = docRes.data?.data === true;
          localStorage.setItem('isDoctor', isDoc);
        }
      } catch (err) {
        console.error('Error checking isDoctor:', err);
      }

      // Step 3: Parallel fetch all dashboard data
      const [
        totalUsersRes,
        newUsersRes,
        newUsersSubRes,
        doctorsRes,
        patientsRes,
        frontdeskRes,
        adminsRes,
        alertsRes,
        appointmentsRes,
      ] = await Promise.allSettled([
        getTotalUsers(),
        getUsersThisWeek(),
        getUsersThisWeekSub(),
        getDoctors(),
        getPatients(),
        getUsersByRole('Frontdesk'),
        getAdmins(),
        // Alerts: fetch based on role
        (async () => {
          if (isDoc) {
            const doctorIdRes = await getDoctorIdByEmail({ email });
            const doctorId = doctorIdRes.success ? doctorIdRes.data?.data : null;
            if (doctorId) {
              const res = await getDoctorSortAlerts(doctorId);
              return res.success ? (res.data || []) : [];
            }
            return [];
          } else if (String(adminId) === '1') {
            try {
              const superRes = await getSuperAdminAlerts(adminId);
              return superRes?.data || [];
            } catch {
              const res = await getAlerts();
              return (res?.data || []).reverse();
            }
          } else {
            const res = await getAlerts();
            return (res?.data || []).reverse();
          }
        })(),
        // getTeleconsultationGetAllAppointmentsById().catch(() => ({ success: false, data: [] })),
      ]);

      // Extract results safely
      const totalUsers = totalUsersRes.status === 'fulfilled' ? (totalUsersRes.value || 0) : 0;
      const newUsers = newUsersRes.status === 'fulfilled' ? (newUsersRes.value || 0) : 0;
      const newUsersSub = newUsersSubRes.status === 'fulfilled' ? (newUsersSubRes.value || 0) : 0;

      const doctors = doctorsRes.status === 'fulfilled' && doctorsRes.value?.success
        ? (doctorsRes.value.data || [])
        : [];

      const patients = patientsRes.status === 'fulfilled' && patientsRes.value?.success
        ? (patientsRes.value.data || [])
        : [];

      const frontdeskUsers = frontdeskRes.status === 'fulfilled' && frontdeskRes.value?.success
        ? (frontdeskRes.value.data || [])
        : [];

      const admins = adminsRes.status === 'fulfilled' && adminsRes.value?.success
        ? (adminsRes.value.data || [])
        : [];

      const alerts = alertsRes.status === 'fulfilled'
        ? (Array.isArray(alertsRes.value) ? alertsRes.value : [])
        : [];

      // Appointments
      let appointments = { total: 0, newCount: 0, completed: 0, incomplete: 0 };
      if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value?.success) {
        const aptData = appointmentsRes.value.data || [];
        if (Array.isArray(aptData)) {
          appointments.total = aptData.length;
          appointments.completed = aptData.filter(a => a.status === 'completed').length;
          appointments.incomplete = aptData.filter(a => a.status === 'incomplete' || a.status === 'pending').length;
          appointments.newCount = aptData.filter(a => {
            if (!a.createdAt) return false;
            const created = new Date(a.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created >= weekAgo;
          }).length;
        }
      }

      setData({
        adminId,
        isDoctor: isDoc,
        totalUsers,
        newUsers: String(adminId) === '1' ? newUsers : newUsersSub,
        doctors,
        patients,
        frontdeskUsers,
        admins,
        alerts,
        appointments,
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { loading, data, refetch: fetchData };
}

/**
 * Custom hook: fetches and shapes all data needed for the Doctor Dashboard
 */
export function useDoctorDashboardData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    doctorName: '',
    doctorId: null,
    alerts: [],
    patients: [],
    totalPatients: 0,
    newPatients: 0,
    activePatients: 0,
  });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('name') || 'Doctor';

      // Get doctor ID
      const idRes = await getDoctorIdByEmail({ email });
      const doctorId = idRes.success ? idRes.data?.data : null;

      if (!doctorId) {
        console.error('Could not resolve doctor id');
        setLoading(false);
        return;
      }

      // Parallel fetch
      const [alertsRes, patientsRes] = await Promise.allSettled([
        getDoctorSortAlerts(doctorId),
        getPatients(),
      ]);

      const alerts = alertsRes.status === 'fulfilled' && alertsRes.value?.success
        ? (alertsRes.value.data || [])
        : [];

      const patients = patientsRes.status === 'fulfilled' && patientsRes.value?.success
        ? (patientsRes.value.data || [])
        : [];

      // Calculate patient stats
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const newPatients = patients.filter(p => {
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
        activePatients: patients.length, // All patients are considered active
      });
    } catch (error) {
      console.error('Doctor dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { loading, data, refetch: fetchData };
}

/**
 * Helper: Build alert items from raw alerts data for the AlertPanel component
 */
export function buildAlertItems(alerts = [], onAlertClick) {
  // Group alerts by unique person (name)
  const personMap = new Map();
  
  for (const alert of alerts) {
    const name = alert.name || 'Unknown';
    if (!personMap.has(name)) {
      personMap.set(name, {
        id: alert.id || alert.patientId,
        name,
        messages: [],
        latestDate: '',
        unreadCount: 0,
        patientId: alert.patientId,
      });
    }
    const person = personMap.get(name);
    
    // Track messages
    const msg = alert.type || alert.message || '';
    if (msg) person.messages.push(msg);
    
    // Track latest date
    const alertDate = formatDate(alert.date || alert.createdAt);
    if (alertDate > person.latestDate) person.latestDate = alertDate;
    
    // Track unread
    if (alert.isRead === 0 || alert.isRead === false || alert.isOpened === 0) {
      person.unreadCount++;
    }
  }

  return Array.from(personMap.values())
    .sort((a, b) => (b.latestDate || '').localeCompare(a.latestDate || ''))
    .map(person => ({
      id: person.id,
      name: person.name,
      message: person.messages[0] || '',
      date: person.latestDate,
      unreadCount: person.unreadCount,
      onClick: onAlertClick ? () => onAlertClick(person) : undefined,
    }));
}
