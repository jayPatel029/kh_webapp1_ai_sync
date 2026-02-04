/**
 * Switch Component
 * Toggle switch with design system styling
 * 
 * @file src/components/primitives/Switch.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Switch Component
 * 
 * @example
 * <Switch>Enable notifications</Switch>
 * <Switch isChecked={enabled} onChange={setEnabled} colorScheme="success" />
 */
export const Switch = forwardRef(({
  children,
  size = 'md',
  colorScheme = 'primary',
  isChecked,
  isDisabled = false,
  defaultChecked,
  onChange,
  value,
  name,
  id,
  className,
  ...props
}, ref) => {
  const switchClasses = clsx(
    'switch',
    `switch--${size}`,
    colorScheme !== 'primary' && `switch--${colorScheme}`,
    className
  );

  const handleChange = (event) => {
    onChange?.(event);
  };

  return (
    <label className={switchClasses}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="switch__input"
        checked={isChecked}
        defaultChecked={defaultChecked}
        disabled={isDisabled}
        onChange={handleChange}
        value={value}
        name={name}
        id={id}
        aria-checked={isChecked}
        {...props}
      />
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
      {children && <span className="switch__label">{children}</span>}
    </label>
  );
});

Switch.displayName = 'Switch';

Switch.propTypes = {
  /** Label text */
  children: PropTypes.node,
  /** Size variant */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Color scheme */
  colorScheme: PropTypes.oneOf(['primary', 'success', 'danger']),
  /** Controlled checked state */
  isChecked: PropTypes.bool,
  /** Disabled state */
  isDisabled: PropTypes.bool,
  /** Default checked (uncontrolled) */
  defaultChecked: PropTypes.bool,
  /** Change handler */
  onChange: PropTypes.func,
  /** Input value */
  value: PropTypes.string,
  /** Input name */
  name: PropTypes.string,
  /** Input id */
  id: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Switch;
