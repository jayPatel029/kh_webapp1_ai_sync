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
  deleteAppointment as deleteAppointmentApi 
} from '../ApiCalls/clinicApis';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(options.settings || DEFAULT_SETTINGS);

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
          title: apt.reason || apt.title || 'Dialysis Appointment',
          patientName: apt.patient_name || apt.patientName || `Patient #${apt.patient_id}`,
          start: new Date(apt.start_time ? `${apt.appointment_date}T${apt.start_time}` : apt.appointment_date),
          end: new Date(apt.end_time ? `${apt.appointment_date}T${apt.end_time}` : apt.appointment_date),
          status: String(apt.status || 'scheduled').toLowerCase(),
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

      // API Call
      const payload = {
        patient_id: data.patient_id || data.patientId || 1, // fallback to avoid crash
        clinic_id: data.clinic_id || data.clinicId || 1, // fallback
        appointment_date: start.toISOString().split('T')[0],
        start_time: start.toTimeString().split(' ')[0],
        end_time: end.toTimeString().split(' ')[0],
        reason: data.title || data.reason,
        status: 'SCHEDULED',
      };

      const result = await createAppointmentApi(payload);
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

  const cancelAppointment = useCallback(async (id) => {
    const result = await deleteAppointmentApi(id);
    if (result.success) {
      await fetchAppointments();
    } else {
      throw new Error(result.data?.message || 'Failed to cancel appointment');
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

          const appointment = appointments.find(
            (appt) => appt.status === 'scheduled' && overlaps(appt.start, appt.end, slotStart, slotEnd)
          );

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

  return {
    appointments: sortedAppointments,
    loading,
    error,
    settings,
    setSettings,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    isSlotAvailable,
    generateSlotsForRange,
  };
}