/**
 * MobileFilterRow Component
 * Horizontal scrollable filter chips row matching Figma filter designs
 * 
 * @file src/components/mobile/MobileFilterRow.jsx
 */

import React from 'react';
import clsx from 'clsx';
import './mobile.css';

/**
 * MobileFilterChip - Individual filter chip
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} props.isActive
 * @param {Function} props.onClick
 * @param {React.ReactNode} props.icon
 * @param {number} props.count - Optional badge count
 * @param {string} props.className
 */
export const MobileFilterChip = ({
  label,
  isActive = false,
  onClick,
  icon,
  count,
  className,
}) => {
  return (
    <button
      className={clsx(
        'mobile-filter-chip',
        isActive && 'mobile-filter-chip--active',
        className
      )}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="mobile-filter-chip__icon">{icon}</span>}
      {label}
      {count > 0 && (
        <span className="mobile-filter-chip__count">{count}</span>
      )}
    </button>
  );
};

/**
 * MobileFilterRow - Container for filter chips with horizontal scroll
 * @param {Object} props
 * @param {React.ReactNode} props.children - MobileFilterChip elements
 * @param {string} props.className
 */
export const MobileFilterRow = ({
  children,
  className,
}) => {
  return (
    <div className={clsx('mobile-filter-row', className)}>
      {children}
    </div>
  );
};

export default MobileFilterRow;
