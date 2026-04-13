/**
 * Appointment date utilities
 * Lightweight helpers for local Date handling
 *
 * @file src/utils/appointmentDateUtils.js
 */

export const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const daysBetween = (startDate, endDate) => {
  const days = [];
  const cur = startOfDay(startDate);
  const end = startOfDay(endDate);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

export const toLocalDateTimeInputValue = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

export const toIsoDay = (date) => new Date(date).toISOString().slice(0, 10);

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatTimeRange = (start, end) => `${formatTime(start)} - ${formatTime(end)}`;

export const formatShortDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });