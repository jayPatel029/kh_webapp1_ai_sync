/**
 * MobileDataCard Component
 * Card representation of a table row for mobile view
 * Matches Figma: Patients.png card items, Alarm details.png etc.
 * 
 * @file src/components/mobile/MobileDataCard.jsx
 */

import React from 'react';
import clsx from 'clsx';
import { Badge, StatusBadge } from '../../component-library';
import './mobile.css';

/**
 * @param {Object} props
 * @param {string} props.avatarUrl - Profile image URL
 * @param {string} props.avatarFallback - Fallback initials
 * @param {string} props.title - Primary title text
 * @param {string} props.subtitle - Secondary text below title
 * @param {Array<{label: string, value: React.ReactNode}>} props.fields - Key-value rows
 * @param {React.ReactNode} props.statusBadge - Status badge element
 * @param {React.ReactNode} props.actions - Action buttons in footer
 * @param {Function} props.onClick - Card click handler
 * @param {string} props.className
 */
export const MobileDataCard = ({
  avatarUrl,
  avatarFallback,
  title,
  subtitle,
  fields = [],
  statusBadge,
  actions,
  onClick,
  className,
}) => {
  return (
    <div
      className={clsx('mobile-data-card', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header with avatar + title */}
      <div className="mobile-data-card__header">
        <div className="mobile-data-card__header-left">
          {(avatarUrl || avatarFallback) && (
            avatarUrl ? (
              <img
                src={avatarUrl}
                alt={title || 'Avatar'}
                className="mobile-data-card__avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                }}
              />
            ) : null
          )}
          {(!avatarUrl && avatarFallback) && (
            <div
              className="mobile-data-card__avatar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {avatarFallback}
            </div>
          )}
          <div className="mobile-data-card__title-group">
            <h3 className="mobile-data-card__title">{title}</h3>
            {subtitle && <p className="mobile-data-card__subtitle">{subtitle}</p>}
          </div>
        </div>
        {statusBadge && <div>{statusBadge}</div>}
      </div>

      {/* Body with key-value fields */}
      {fields.length > 0 && (
        <div className="mobile-data-card__body">
          {fields.map((field, idx) => (
            <div key={idx} className="mobile-data-card__row">
              <span className="mobile-data-card__label">{field.label}</span>
              <span className="mobile-data-card__value">{field.value || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer with actions */}
      {actions && (
        <div className="mobile-data-card__footer">
          <div className="mobile-data-card__actions">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDataCard;
