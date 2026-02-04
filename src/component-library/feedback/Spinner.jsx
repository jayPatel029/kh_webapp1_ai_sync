/**
 * Spinner Component
 * Loading indicator
 * 
 * @file src/component-library/feedback/Spinner.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Spinner Component
 * 
 * @example
 * <Spinner size="md" color="primary" />
 */
export const Spinner = forwardRef(({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  className,
  ...props
}, ref) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const spinnerClasses = clsx(
    'spinner',
    `spinner--${color}`,
    sizeClasses[size],
    className
  );

  return (
    <div ref={ref} className={spinnerClasses} role="status" {...props}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
});

Spinner.displayName = 'Spinner';

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  label: PropTypes.string,
  className: PropTypes.string,
};

export default Spinner;
