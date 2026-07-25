/**
 * Dialysis Queue Constants
 * Shared constants for P2-01 (Today's Patient Queue) and P2-02 (Patient Summary).
 *
 * @file src/pages/dialysis/dialysisQueueConstants.js
 */

/** Roles permitted on P2-01 and P2-02 per the Part 2 spec. */
export const ALLOWED_ROLES = ['Dialysis Technician', 'Doctor', 'Medical Staff'];

/** The only role that can trigger "Proceed to Pre-Dialysis Dashboard". */
export const TECHNICIAN_ROLE = 'Dialysis Technician';

/** Roles that can use the "Mark Emergency" action (Technician + Nurse). */
export const EMERGENCY_ACTION_ROLES = ['Dialysis Technician', 'Medical Staff'];

/** Deterministic sort weights for shifts — Morning first. */
export const SHIFT_ORDER = {
  Morning: 1,
  'Mid-day': 2,
  Evening: 3,
  Night: 4,
  Pending: 99,
};

/** Shift display labels matching the spec's filter dropdown. */
export const SHIFT_LABELS = [
  { value: 'Morning', label: 'Morning 07:00 AM' },
  { value: 'Mid-day', label: 'Mid-day 11:00 AM' },
  { value: 'Evening', label: 'Evening 04:00 PM' },
];

/** Status chip visual styles. */
export const QUEUE_STATUS_STYLES = {
  SCHEDULED: { bg: '#dbeafe', text: '#1d4ed8', label: 'Scheduled' },
  BOOKED: { bg: '#dbeafe', text: '#1d4ed8', label: 'Scheduled' },
  ARRIVED: { bg: '#ede9fe', text: '#7c3aed', label: 'Arrived' },
  WAITING: { bg: '#fff7ed', text: '#d97706', label: 'Pending' },
  IN_PROGRESS: { bg: '#fff7ed', text: '#d97706', label: 'In Progress' },
  COMPLETED: { bg: '#ecfdf5', text: '#16a34a', label: 'Completed' },
  CANCELLED: { bg: '#f3f4f6', text: '#6b7280', label: 'Cancelled' },
  MISSED: { bg: '#fef2f2', text: '#dc2626', label: 'Delayed' },
  PENDING: { bg: '#fef2f2', text: '#dc2626', label: 'Pending' },
};

/** Priority dot colors. */
export const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

/** KPI card tone palettes for queue metric cards. */
export const KPI_TONES = {
  blue: { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
  green: { bg: '#ecfdf5', border: '#bbf7d0', color: '#16a34a' },
  amber: { bg: '#fff7ed', border: '#fed7aa', color: '#d97706' },
  red: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
};

/** P2-02 summary tab names per spec. */
export const SUMMARY_TABS = [
  'Overview',
  'Medical',
  'Dialysis History',
  'Medications',
  'Allergies',
  'Documents',
  'Notes',
];

/** Alert severity levels. */
export const ALERT_SEVERITY = {
  CRITICAL: 'Critical',
  WARNING: 'Warning',
  INFO: 'Info',
};

/**
 * Normalize raw status string to upper-case enum key.
 * Maps CONFIRMED → BOOKED for consistency.
 */
export const normalizeStatus = (status) => {
  const normalized = String(status || 'PENDING').toUpperCase();
  return normalized === 'CONFIRMED' ? 'BOOKED' : normalized;
};

/**
 * Get status chip style for a given raw status.
 */
export const getStatusStyle = (status) =>
  QUEUE_STATUS_STYLES[normalizeStatus(status)] || QUEUE_STATUS_STYLES.PENDING;
