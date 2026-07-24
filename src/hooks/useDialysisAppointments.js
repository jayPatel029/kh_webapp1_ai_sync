/**
 * Dialysis appointment booking hook - Integrated with clinicApis
 *
 * @file src/hooks/useDialysisAppointments.js
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { addMinutes, daysBetween, overlaps, startOfDay } from '../utils/appointmentDateUtils';
import { 
  getAppointments, 
  createAppointment as createAppointmentApi, 
  updateAppointment as updateAppointmentApi, 
  cancelAppointment as cancelAppointmentApi,
  addAppointmentPayment as addAppointmentPaymentApi,
  getAvailableSlots
} from '../ApiCalls/clinicApis';

const STATUS_FLOW = {
  scheduled: 'arrived',
  booked: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed',
};

const normalizeStatus = (status) => {
  const normalized = String(status || 'scheduled').toLowerCase();
  if (normalized === 'confirmed') return 'booked';
  return normalized;
};

const DEFAULT_SETTINGS = {
  slotDurationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  minNoticeMinutes: 30,
  workingHours: { startHour: 8, endHour: 18 },
  allowOverlapping: false,
};

const isWithinWorkingHours = (start, end, workingHours) => {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const minMinutes = workingHours.startHour * 60;
  const maxMinutes = workingHours.endHour * 60;
  return startMinutes >= minMinutes && endMinutes <= maxMinutes;
};

export default function useDialysisAppointments(options = {}) {
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]); // In‑memory payments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(options.settings || DEFAULT_SETTINGS);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [dashboardAppointments, setDashboardAppointments] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppointments();
      if (result.success) {
        // Map backend fields to the hook's expected format if necessary
        const mapped = (result.data?.data || result.data || []).map(apt => ({
          ...apt,
          id: apt.id,
          title: apt.reason || apt.metadata?.notes || apt.title || 'Dialysis Appointment',
          patientName: apt.patient_name || apt.patientName || `Patient #${apt.patient_id}`,
          start: new Date(
            apt.startUTC ||
            (apt.start_time ? `${apt.appointment_date}T${apt.start_time}` : apt.appointment_date)
          ),
          end: new Date(
            apt.endUTC ||
            (apt.end_time ? `${apt.appointment_date}T${apt.end_time}` : apt.appointment_date)
          ),
          status: normalizeStatus(apt.status || apt.appointmentStatus),
        }));
        setAppointments(mapped);
      } else {
        setError(result.data?.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const findConflictsInternal = useCallback(
    (list, start, end, excludeId = null) => {
      const s = new Date(start);
      const e = new Date(end);
      return list.filter(
        (appointment) =>
          appointment.status === 'scheduled' &&
          appointment.id !== excludeId &&
          overlaps(appointment.start, appointment.end, s, e)
      );
    },
    []
  );

  const createAppointment = useCallback(
    async (data) => {
      if (data.start && data.end) {
        const start = new Date(data.start);
        const end = new Date(data.end);
        if (start >= end) {
          throw new Error('Start time must be before end time.');
        }

        if (!settings.allowOverlapping) {
          const conflicts = findConflictsInternal(appointments, start, end);
          if (conflicts.length) {
            const err = new Error('Conflicts found for this time slot.');
            err.conflicts = conflicts;
            throw err;
          }
        }
      }

      const result = await createAppointmentApi(data);
      if (result.success) {
        await fetchAppointments();
        return result.data;
      } else {
        throw new Error(result.data?.message || 'Failed to create appointment');
      }
    },
    [appointments, settings.allowOverlapping, findConflictsInternal, fetchAppointments]
  );

  const updateAppointment = useCallback(
    async (id, updates) => {
      const nextStart = updates.start ? new Date(updates.start) : null;
      const nextEnd = updates.end ? new Date(updates.end) : null;

      if (nextStart && nextEnd && nextStart >= nextEnd) {
        throw new Error('Start time must be before end time.');
      }

      if (!settings.allowOverlapping && (nextStart || nextEnd)) {
        const current = appointments.find((appt) => appt.id === id);
        const start = nextStart || current?.start;
        const end = nextEnd || current?.end;
        const conflicts = findConflictsInternal(appointments, start, end, id);
        if (conflicts.length) {
          const err = new Error('Conflicts found for this time slot.');
          err.conflicts = conflicts;
          throw err;
        }
      }

      // API Call
      const payload = {};
      if (updates.status) payload.status = updates.status.toUpperCase();
      if (updates.title || updates.reason) payload.reason = updates.title || updates.reason;

      const result = await updateAppointmentApi(id, payload);
      if (result.success) {
        await fetchAppointments();
      } else {
        throw new Error(result.data?.message || 'Failed to update appointment');
      }
    },
    [appointments, settings.allowOverlapping, findConflictsInternal, fetchAppointments]
  );

  const cancelAppointment = useCallback(async (id, reason = 'Cancelled from sessions dashboard') => {
    const result = await cancelAppointmentApi(id, { reason, refund: false, refundAmount: 0 });
    if (result.success) {
      await fetchAppointments();
    } else {
      throw new Error(result.data?.message || 'Failed to cancel appointment');
    }
  }, [fetchAppointments]);

  // Cancel with refund handling via API
  const cancelAppointmentWithRefund = useCallback(async (id, reason = 'Cancelled with refund', method = 'cash') => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) throw new Error('Appointment not found');
    const refundAmount = Number(appt.amountPaid || appt.received_amt || appt.paidAmount || 0);
    const result = await cancelAppointmentApi(id, {
      reason,
      refund: refundAmount > 0,
      refundAmount,
      method,
    });
    if (result.success) {
      setPayments((prev) => [
        ...prev,
        {
          id: `refund-${Date.now()}`,
          appointmentId: id,
          amount: -refundAmount,
          method,
          timestamp: new Date(),
        },
      ]);
      await fetchAppointments();
    } else {
      throw new Error(result.data?.message || 'Failed to cancel appointment');
    }
  }, [appointments, fetchAppointments]);

  // Add a payment to an existing appointment via API
  const addPayment = useCallback(async (appointmentId, amount, method = 'cash', receiptUrl = null) => {
    const result = await addAppointmentPaymentApi(appointmentId, {
      amount: Number(amount),
      method,
      receiptUrl,
    });
    if (result.success) {
      setPayments((prev) => [
        ...prev,
        {
          id: result.data?.paymentId || `pay-${Date.now()}`,
          appointmentId,
          amount: Number(amount),
          method,
          timestamp: new Date(),
        },
      ]);
      await fetchAppointments();
      return result.data;
    } else {
      throw new Error(result.data?.message || 'Failed to add payment');
    }
  }, [fetchAppointments]);

  const isSlotAvailable = useCallback(
    (start, end) => {
      const now = new Date();
      if (start.getTime() - now.getTime() < settings.minNoticeMinutes * 60000) {
        return false;
      }

      if (!isWithinWorkingHours(start, end, settings.workingHours)) {
        return false;
      }

      const bufferedStart = addMinutes(start, -settings.bufferBeforeMinutes);
      const bufferedEnd = addMinutes(end, settings.bufferAfterMinutes);

      if (!settings.allowOverlapping) {
        const conflicts = findConflictsInternal(appointments, bufferedStart, bufferedEnd);
        if (conflicts.length) return false;
      }

      return true;
    },
    [appointments, settings, findConflictsInternal]
  );

  const generateSlotsForRange = useCallback(
    (rangeStartDate, rangeEndDate) => {
      const days = daysBetween(startOfDay(rangeStartDate), startOfDay(rangeEndDate));
      const slotsByDay = {};

      for (const day of days) {
        const slots = [];
        const { startHour, endHour } = settings.workingHours;
        let cursor = new Date(day);
        cursor.setHours(startHour, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(endHour, 0, 0, 0);

        while (cursor < dayEnd) {
          const slotStart = new Date(cursor);
          const slotEnd = addMinutes(slotStart, settings.slotDurationMinutes);

          if (slotEnd > dayEnd) break;

          const appointment = appointments.find((appt) => {
            const activeStatuses = ['scheduled', 'booked', 'arrived', 'in_progress'];
            return activeStatuses.includes(appt.status) && overlaps(appt.start, appt.end, slotStart, slotEnd);
          });

          const available = !appointment && isSlotAvailable(slotStart, slotEnd);

          slots.push({
            start: new Date(slotStart),
            end: new Date(slotEnd),
            available,
            appointment: appointment || null,
          });

          cursor = slotEnd;
        }

        slotsByDay[day.toISOString().slice(0, 10)] = slots;
      }

      return { days, slotsByDay };
    },
    [appointments, settings, isSlotAvailable]
  );

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [appointments]);

  const advanceAppointmentStatus = useCallback(
    async (id) => {
      const current = appointments.find((appt) => appt.id === id);
      if (!current) throw new Error('Appointment not found');
      const nextStatus = STATUS_FLOW[current.status];
      if (!nextStatus) return;
      await updateAppointment(id, { status: nextStatus });
    },
    [appointments, updateAppointment]
  );

  const fetchSlots = useCallback(async (clinicId, from, to) => {
    setSlotsLoading(true);
    try {
      const result = await getAvailableSlots(clinicId, from, to);
      if (result.success) {
        setAvailableSlots(result.data?.data || result.data?.slots || []);
        setDashboardAppointments(result.data?.appointments || []);
      } else {
        console.warn('Failed to fetch slots:', result.data?.message);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  return {
    appointments: sortedAppointments,
    loading,
    error,
    settings,
    setSettings,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    advanceAppointmentStatus,
    cancelAppointment,
    cancelAppointmentWithRefund,
    addPayment,
    payments,
    isSlotAvailable,
    generateSlotsForRange,
    availableSlots,
    dashboardAppointments,
    slotsLoading,
    fetchSlots,
  };
}
