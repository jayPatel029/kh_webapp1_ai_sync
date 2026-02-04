/**
 * Badge Component
 * Small label for highlighting information
 * 
 * @file src/components/primitives/Badge.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Badge Component
 * 
 * @example
 * <Badge colorScheme="success">Active</Badge>
 * <Badge variant="outline" colorScheme="danger">Error</Badge>
 * <Badge variant="solid" colorScheme="primary">New</Badge>
 */
export const Badge = forwardRef(({
  children,
  variant = 'subtle',
  colorScheme = 'gray',
  size = 'md',
  isPill = false,
  className,
  ...props
}, ref) => {
  const badgeClasses = clsx(
    'badge',
    `badge--${size}`,
    `badge--${variant}`,
    `badge--${colorScheme}`,
    {
      'badge--pill': isPill,
    },
    className
  );

  return (
    <span ref={ref} className={badgeClasses} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

Badge.propTypes = {
  /** Badge content */
  children: PropTypes.node,
  /** Visual variant */
  variant: PropTypes.oneOf(['subtle', 'solid', 'outline']),
  /** Color scheme */
  colorScheme: PropTypes.oneOf([
    'gray',
    'primary',
    'brand',
    'success',
    'green',
    'warning',
    'orange',
    'danger',
    'red',
    'info',
    'blue',
    'navy',
  ]),
  /** Size variant */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Pill shape (fully rounded) */
  isPill: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * StatusBadge Component
 * Badge with dot indicator for status
 * 
 * @example
 * <StatusBadge status="online">Online</StatusBadge>
 * <StatusBadge status="offline">Offline</StatusBadge>
 */
export const StatusBadge = forwardRef(({
  children,
  status = 'default',
  className,
  ...props
}, ref) => {
  const statusColorMap = {
    online: 'success',
    active: 'success',
    success: 'success',
    offline: 'gray',
    inactive: 'gray',
    pending: 'warning',
    warning: 'warning',
    error: 'danger',
    danger: 'danger',
    default: 'gray',
  };

  const colorScheme = statusColorMap[status] || 'gray';

  return (
    <span
      ref={ref}
      className={clsx('badge', 'badge--md', `badge--${colorScheme}`, 'd-inline-flex', 'items-center', 'gap-2', className)}
      {...props}
    >
      <span className={clsx('badge', 'badge--dot', `badge--${colorScheme}`, 'badge--solid')} />
      {children}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

StatusBadge.propTypes = {
  /** Badge content */
  children: PropTypes.node,
  /** Status type */
  status: PropTypes.oneOf([
    'online',
    'active',
    'success',
    'offline',
    'inactive',
    'pending',
    'warning',
    'error',
    'danger',
    'default',
  ]),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Badge;
