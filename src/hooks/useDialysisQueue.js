/**
 * useDialysisQueue — P2-01 Queue Business Logic Hook
 *
 * Encapsulates all queue data fetching, sorting, filtering, emergency marking,
 * and KPI computation per the Part 2 pre-dialysis spec.
 *
 * Business rules:
 *  - Only patients with a scheduled appointment for the selected date appear.
 *  - Sort: emergency first → shift order (Morning → Mid-day → Evening) → within-shift by time.
 *  - Absent-slot backfill: patients with arrived=true AND paid=true are eligible.
 *  - Mark Emergency sets is_emergency=true via updateAppointment and triggers re-sort.
 *
 * @file src/hooks/useDialysisQueue.js
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { getPatients } from '../ApiCalls/patientAPis';
import { getAppointments, updateAppointment } from '../ApiCalls/clinicApis';
import { notifyError, notifySuccess } from '../helpers/notify';
import {
  SHIFT_ORDER,
  normalizeStatus,
} from '../pages/dialysis/dialysisQueueConstants';

// ---------------------------------------------------------------------------
// Helpers (pure functions, no React state)
// ---------------------------------------------------------------------------

export const formatToday = () => new Date().toISOString().split('T')[0];

export const calculateAge = (dobString) => {
  if (!dobString) return '—';
  const today = new Date();
  const birthDate = new Date(dobString);
  if (Number.isNaN(birthDate.getTime())) return '—';
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age < 0 ? 0 : age;
};

export const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '—';
  try {
    const parts = String(timeStr).split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const normalizeAppointmentTime = (appointment) => {
  const startTime = appointment?.start_time || appointment?.startTime;
  if (startTime) return formatTime12Hour(startTime);
  if (appointment?.startUTC) {
    const timePart = String(appointment.startUTC).split('T')[1]?.slice(0, 8);
    return formatTime12Hour(timePart);
  }
  return '—';
};

/**
 * Derive shift label from 12-hour formatted time.
 * Spec shifts: Morning (< 11), Mid-day (11–15), Evening (15–19), Night (≥ 19).
 */
export const deriveShiftLabel = (formattedTime) => {
  if (!formattedTime || formattedTime === '—') return 'Pending';
  const [timePart, period] = formattedTime.split(' ');
  const [rawHour] = timePart.split(':').map(Number);
  if (Number.isNaN(rawHour)) return 'Pending';

  let hour = rawHour;
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  if (hour < 11) return 'Morning';
  if (hour < 15) return 'Mid-day';
  if (hour < 19) return 'Evening';
  return 'Night';
};

/**
 * Extract 24-hour numeric time from appointment for numeric comparison.
 * Returns minutes since midnight, or Infinity for unknowns.
 */
export const getMinutesSinceMidnight = (appointment) => {
  const startTime = appointment?.start_time || appointment?.startTime;
  let timeStr = startTime;
  if (!timeStr && appointment?.startUTC) {
    timeStr = String(appointment.startUTC).split('T')[1]?.slice(0, 5);
  }
  if (!timeStr) return Infinity;
  const parts = String(timeStr).split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  if (Number.isNaN(h)) return Infinity;
  return h * 60 + m;
};

export const derivePriority = (appointment) => {
  const raw = appointment || {};
  const status = normalizeStatus(raw.status);
  if (raw.is_emergency || raw.isEmergency || raw.priority === 'HIGH' || raw.severity === 'HIGH') return 'High';
  if (['WAITING', 'IN_PROGRESS', 'ARRIVED'].includes(status)) return 'Medium';
  return 'Low';
};

export const deriveBed = (appointment) =>
  appointment?.bed_number ||
  appointment?.bedNo ||
  appointment?.bed_id ||
  appointment?.bedId ||
  appointment?.bed?.bed_number ||
  '—';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useDialysisQueue() {
  const [queueRows, setQueueRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBed, setSelectedBed] = useState('ALL');

  // ---- Data fetching ----

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = formatToday();
      const [patientResult, appointmentResult] = await Promise.all([
        getPatients(),
        getAppointments({
          from: `${today}T00:00:00Z`,
          to: `${today}T23:59:59Z`,
        }),
      ]);

      if (!patientResult.success) {
        setError(patientResult.error || 'Failed to fetch patients');
        setLoading(false);
        return;
      }

      const allPatients = Array.isArray(patientResult.data?.data)
        ? patientResult.data.data
        : Array.isArray(patientResult.data)
          ? patientResult.data
          : [];

      const appointmentRows = appointmentResult.success
        ? (Array.isArray(appointmentResult.data?.data)
          ? appointmentResult.data.data
          : Array.isArray(appointmentResult.data)
            ? appointmentResult.data
            : [])
        : [];

      // Build a patient lookup map for O(1) access
      const patientMap = new Map();
      allPatients.forEach((p) => patientMap.set(String(p.id), p));

      // SPEC RULE: Only patients with a scheduled appointment for today appear.
      // Group appointments by patient_id, pick primary appointment per patient.
      const appointmentsByPatient = new Map();
      appointmentRows.forEach((appt) => {
        const pid = String(appt.patient_id || appt.patientId);
        if (!appointmentsByPatient.has(pid)) {
          appointmentsByPatient.set(pid, []);
        }
        appointmentsByPatient.get(pid).push(appt);
      });

      const rows = [];
      appointmentsByPatient.forEach((appointments, pid) => {
        const patient = patientMap.get(pid);
        if (!patient) return; // appointment without patient record — skip

        // Pick primary appointment (most clinically relevant)
        const primaryAppointment = pickPrimaryAppointment(appointments);
        if (!primaryAppointment) return;

        const status = normalizeStatus(primaryAppointment.status || primaryAppointment.appointmentStatus);
        const timeLabel = normalizeAppointmentTime(primaryAppointment);
        const shiftLabel = deriveShiftLabel(timeLabel);
        const priority = derivePriority(primaryAppointment);
        const isEmergency = Boolean(primaryAppointment.is_emergency || primaryAppointment.isEmergency);
        const arrived = Boolean(primaryAppointment.arrived || primaryAppointment.is_arrived);
        const paid = Boolean(primaryAppointment.paid || primaryAppointment.is_paid || primaryAppointment.paymentStatus === 'PAID');

        rows.push({
          id: patient.id,
          patientCode: patient.patient_code || patient.patientCode || `P${String(patient.id).padStart(5, '0')}`,
          name: patient.name || patient.patient_name || `Patient #${patient.id}`,
          age: patient.age || patient.patient_age || calculateAge(patient.dob),
          gender: patient.gender || patient.patient_gender || patient.sex || '—',
          phone: patient.number || patient.phone_number || patient.phone || patient.mobile_no || patient.phone_no || '—',
          status,
          shiftLabel,
          appointmentTime: timeLabel,
          bedLabel: deriveBed(primaryAppointment),
          priority,
          isEmergency,
          arrived,
          paid,
          isBackfillEligible: arrived && paid,
          appointmentId: primaryAppointment.id || primaryAppointment.appointmentId,
          appointment: primaryAppointment,
          raw: patient,
        });
      });

      // SPEC SORT: emergency first → shift order → within-shift by time
      rows.sort((a, b) => {
        // Emergency always first
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;

        // Then shift order
        const shiftA = SHIFT_ORDER[a.shiftLabel] || 99;
        const shiftB = SHIFT_ORDER[b.shiftLabel] || 99;
        if (shiftA !== shiftB) return shiftA - shiftB;

        // Then within-shift by appointment time
        const timeA = getMinutesSinceMidnight(a.appointment);
        const timeB = getMinutesSinceMidnight(b.appointment);
        return timeA - timeB;
      });

      // Assign queue index after sorting
      rows.forEach((row, i) => {
        row.queueIndex = i + 1;
      });

      setQueueRows(rows);
    } catch (err) {
      setError(err.message || 'An error occurred while loading the queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // ---- Mark Emergency ----

  const markEmergency = useCallback(async (appointmentId) => {
    if (!appointmentId) {
      notifyError('Cannot mark emergency: missing appointment reference');
      return false;
    }
    try {
      const result = await updateAppointment(appointmentId, { isEmergency: true });
      if (result.success) {
        notifySuccess('Patient marked as emergency — queue reordered');
        await fetchQueue(); // re-fetch and re-sort
        return true;
      }
      notifyError(result.data?.message || 'Failed to mark emergency');
      return false;
    } catch (err) {
      notifyError(err.message || 'Failed to mark emergency');
      return false;
    }
  }, [fetchQueue]);

  // ---- Filtering ----

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return queueRows.filter((row) => {
      const matchesQuery = !query || [row.name, row.patientCode, row.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesShift = selectedShift === 'ALL' || row.shiftLabel === selectedShift;
      const matchesStatus = selectedStatus === 'ALL' || row.status === selectedStatus;
      const matchesBed = selectedBed === 'ALL' || row.bedLabel === selectedBed;
      return matchesQuery && matchesShift && matchesStatus && matchesBed;
    });
  }, [queueRows, searchQuery, selectedShift, selectedStatus, selectedBed]);

  // ---- Filter options (derived from data) ----

  const shiftOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(queueRows.map((r) => r.shiftLabel).filter((s) => s !== 'Pending')))],
    [queueRows]
  );
  const statusOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(queueRows.map((r) => r.status)))],
    [queueRows]
  );
  const bedOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(queueRows.map((r) => r.bedLabel).filter((b) => b && b !== '—')))],
    [queueRows]
  );

  // ---- KPI metrics ----

  const totalPatients = filteredRows.length;
  const completedCount = filteredRows.filter((r) => r.status === 'COMPLETED').length;
  const inProgressCount = filteredRows.filter((r) => r.status === 'IN_PROGRESS').length;
  const pendingCount = filteredRows.filter((r) =>
    ['PENDING', 'WAITING', 'ARRIVED', 'MISSED', 'SCHEDULED', 'BOOKED'].includes(r.status)
  ).length;

  return {
    // Data
    queueRows: filteredRows,
    allRows: queueRows,
    loading,
    error,

    // Actions
    refresh: fetchQueue,
    markEmergency,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedShift,
    setSelectedShift,
    selectedStatus,
    setSelectedStatus,
    selectedBed,
    setSelectedBed,
    shiftOptions,
    statusOptions,
    bedOptions,

    // KPIs
    totalPatients,
    completedCount,
    inProgressCount,
    pendingCount,
  };
}

// ---------------------------------------------------------------------------
// Internal: pick primary appointment from a list of appointments for one patient
// ---------------------------------------------------------------------------

export function pickPrimaryAppointment(appointments) {
  if (!appointments || !appointments.length) return null;

  const order = {
    IN_PROGRESS: 1,
    WAITING: 2,
    ARRIVED: 3,
    BOOKED: 4,
    SCHEDULED: 5,
    COMPLETED: 6,
    MISSED: 7,
    CANCELLED: 8,
  };

  return [...appointments].sort((a, b) => {
    const statusA = order[normalizeStatus(a.status)] || 99;
    const statusB = order[normalizeStatus(b.status)] || 99;
    if (statusA !== statusB) return statusA - statusB;
    return String(a.start_time || a.startUTC || '').localeCompare(String(b.start_time || b.startUTC || ''));
  })[0];
}
