/**
 * Select Component
 * Primitive select dropdown with design system styling
 * 
 * @file src/component-library/primitives/Select.jsx
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
          <div className='text-sm'>{placeholder}</div>
        </option>
      )}
      {children}
    </select>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  placeholder: PropTypes.string,
  isDisabled: PropTypes.bool,
  isInvalid: PropTypes.bool,
  isRequired: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
