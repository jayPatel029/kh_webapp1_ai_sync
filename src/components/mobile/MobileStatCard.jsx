/**
 * MobileStatCard Component
 * Summary stat card matching Figma: Dashboard.png stat cards
 * Icon circle + label + large numeric value + optional color indicator
 * 
 * @file src/components/mobile/MobileStatCard.jsx
 */

import React from 'react';
import clsx from 'clsx';
import './mobile.css';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.label - Stat label text
 * @param {string|number} props.value - Numeric value to display
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'accent'} props.colorScheme
 * @param {string} props.trend - Optional trend text (e.g., "+12%")
 * @param {'up'|'down'} props.trendDirection
 * @param {Function} props.onClick
 * @param {string} props.className
 */
export const MobileStatCard = ({
  icon,
  label,
  value,
  colorScheme = 'primary',
  trend,
  trendDirection,
  onClick,
  className,
}) => {
  return (
    <div
      className={clsx('mobile-stat-card', onClick && 'mobile-stat-card--clickable', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <div className={clsx('mobile-stat-card__icon', `mobile-stat-card__icon--${colorScheme}`)}>
          {icon}
        </div>
      )}
      <div className="mobile-stat-card__content">
        <span className="mobile-stat-card__label">{label}</span>
        <span className="mobile-stat-card__value">{value}</span>
        {trend && (
          <span className={clsx(
            'mobile-stat-card__indicator',
            trendDirection === 'up' && 'mobile-stat-card__indicator--up',
            trendDirection === 'down' && 'mobile-stat-card__indicator--down'
          )}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : ''} {trend}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * MobileStatsGrid - Container for stat cards
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'vertical'|'horizontal'} props.direction
 * @param {string} props.className
 */
export const MobileStatsGrid = ({
  children,
  direction = 'vertical',
  className,
}) => {
  return (
    <div className={clsx(
      'mobile-stats',
      direction === 'horizontal' && 'mobile-stats--horizontal',
      className
    )}>
      {children}
    </div>
  );
};

export default MobileStatCard;
