/**
 * Select Component
 * Primitive select dropdown with design system styling
 * 
 * @file src/components/primitives/Select.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Select Component
 * 
 * @example
 * <Select placeholder="Select option">
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </Select>
 */
export const Select = forwardRef(({
  children,
  variant = 'outline',
  size = 'md',
  placeholder,
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  className,
  ...props
}, ref) => {
  const selectClasses = clsx(
    'select',
    `select--${size}`,
    {
      'select--invalid': isInvalid,
    },
    className
  );

  return (
    <select
      ref={ref}
      className={selectClasses}
      disabled={isDisabled}
      required={isRequired}
      aria-invalid={isInvalid}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  /** Option elements */
  children: PropTypes.node,
  /** Visual variant */
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  /** Size variant */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Disabled state */
  isDisabled: PropTypes.bool,
  /** Invalid/error state */
  isInvalid: PropTypes.bool,
  /** Required field */
  isRequired: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Select;
