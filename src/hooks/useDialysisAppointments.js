/**
 * Dialysis appointment booking hook (local state only)
 *
 * @file src/hooks/useDialysisAppointments.js
 */

import { useCallback, useMemo, useState } from 'react';
import { addMinutes, daysBetween, overlaps, startOfDay } from '../utils/appointmentDateUtils';

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

export default function useDialysisAppointments(initial = {}) {
  const [appointments, setAppointments] = useState(initial.appointments || []);
  const [settings, setSettings] = useState(initial.settings || DEFAULT_SETTINGS);

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
    (data) => {
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

      const newAppointment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: data.title || 'Dialysis Appointment',
        patientName: data.patientName || 'Unnamed Patient',
        notes: data.notes || '',
        start,
        end,
        status: 'scheduled',
        createdAt: new Date(),
      };

      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    },
    [appointments, settings.allowOverlapping, findConflictsInternal]
  );

  const updateAppointment = useCallback(
    (id, updates) => {
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

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, ...updates } : appt))
      );
    },
    [appointments, settings.allowOverlapping, findConflictsInternal]
  );

  const cancelAppointment = useCallback((id) => {
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === id ? { ...appt, status: 'cancelled' } : appt))
    );
  }, []);

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
    settings,
    setSettings,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    isSlotAvailable,
    generateSlotsForRange,
  };
}