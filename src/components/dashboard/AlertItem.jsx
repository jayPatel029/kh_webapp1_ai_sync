/**
 * AlertItem Component
 * Individual alert row with avatar, name, message type badge, and date.
 *
 * @file src/components/dashboard/AlertItem.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../component-library/primitives/Badge';

// ─── Helpers ────────────────────────────────────────────────

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || '?').toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Map alert type keywords to badge color schemes */
function getAlertBadge(type = '') {
  const t = type.toLowerCase();
  if (t.includes('prescription')) return { label: 'Prescription', color: 'info' };
  if (t.includes('reading') || t.includes('parameter')) return { label: 'Reading', color: 'warning' };
  if (t.includes('enrollment') || t.includes('program')) return { label: 'Enrollment', color: 'success' };
  if (t.includes('comment')) return { label: 'Comment', color: 'primary' };
  if (t.includes('report')) return { label: 'Report', color: 'navy' };
  return { label: type || 'Alert', color: 'gray' };
}

// ─── AlertItem ──────────────────────────────────────────────

const AlertItem = ({ alert, onClick }) => {
  const { name, type, message, date, isRead, patientId } = alert;
  const initials = getInitials(name);
  const badge = getAlertBadge(type || message);
  const formattedDate = formatDate(date || alert.createdAt);
  const isUnread = isRead === 0 || isRead === false || alert.isOpened === 0;

  return (
    <div
      className={`alert-item ${isUnread ? 'alert-item--unread' : ''}`}
      onClick={() => onClick?.(alert)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(alert);
        }
      }}
    >
      <div className="alert-item__avatar" aria-hidden="true">
        {initials}
      </div>

      <div className="alert-item__body">
        <div className="alert-item__top">
          <span className="alert-item__name">{name || 'Unknown'}</span>
          <Badge
            variant="subtle"
            colorScheme={badge.color}
            size="sm"
            className="alert-item__badge"
          >
            {badge.label}
          </Badge>
        </div>
        {(type || message) && (
          <span className="alert-item__message">
            {type || message}
          </span>
        )}
      </div>

      <div className="alert-item__meta">
        <span className="alert-item__date">{formattedDate}</span>
        {isUnread && <span className="alert-item__dot" aria-label="Unread" />}
      </div>
    </div>
  );
};

AlertItem.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    type: PropTypes.string,
    message: PropTypes.string,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    isRead: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    isOpened: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClick: PropTypes.func,
};

export default AlertItem;
