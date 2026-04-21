/**
 * AppointmentStatusBadge Component
 * Renders a combined appointment + payment status badge.
 *
 * @file src/components/AppointmentStatusBadge.jsx
 */

import React from 'react';

const APPT_COLORS = {
  SCHEDULED: { bg: '#FEF9C3', text: '#854D0E' },
  BOOKED:    { bg: '#FEF9C3', text: '#854D0E' },
  ARRIVED:   { bg: '#F3E8FF', text: '#6B21A8' },
  IN_PROGRESS:{ bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED: { bg: '#DCFCE7', text: '#166534' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
  MISSED:    { bg: '#FEE2E2', text: '#991B1B' },
};

const PAYMENT_COLORS = {
  PAID:    { bg: '#D1FAE5', text: '#065F46' },
  PARTIAL: { bg: '#FEF3C7', text: '#92400E' },
  UNPAID:  { bg: '#FEE2E2', text: '#991B1B' },
};

const badgeStyle = (colors) => ({
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: colors.bg,
  color: colors.text,
  padding: '3px 10px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  letterSpacing: '0.015em',
});

/**
 * AppointmentStatusBadge
 *
 * @param {object} props
 * @param {string} props.status - Appointment status (SCHEDULED, COMPLETED, etc.)
 * @param {string} [props.paymentStatus] - Payment status (PAID, PARTIAL, UNPAID). If omitted, only appointment badge shown.
 * @param {boolean} [props.showBoth=false] - Whether to show both badges side by side.
 */
const AppointmentStatusBadge = ({ status, paymentStatus, showBoth = false }) => {
  const apptKey = String(status || '').toUpperCase().replace(/\s+/g, '_');
  const payKey  = String(paymentStatus || '').toUpperCase();

  const apptColors    = APPT_COLORS[apptKey]    || { bg: '#FED7AA', text: '#9A3412' };
  const paymentColors = PAYMENT_COLORS[payKey]   || { bg: '#F3F4F6', text: '#374151' };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={badgeStyle(apptColors)}>
        {String(status || '').replace(/_/g, ' ')}
      </span>
      {showBoth && paymentStatus && (
        <span style={{ ...badgeStyle(paymentColors), fontSize: '10px' }}>
          {payKey}
        </span>
      )}
    </div>
  );
};

export default AppointmentStatusBadge;
