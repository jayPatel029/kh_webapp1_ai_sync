/**
 * Checkbox Component
 * Custom styled checkbox with design system styling
 * 
 * @file src/components/primitives/Checkbox.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Checkbox Component
 * 
 * @example
 * <Checkbox>Remember me</Checkbox>
 * <Checkbox isChecked={checked} onChange={handleChange}>Accept terms</Checkbox>
 */
export const Checkbox = forwardRef(({
  children,
  size = 'md',
  colorScheme = 'primary',
  isChecked,
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  defaultChecked,
  onChange,
  value,
  name,
  id,
  className,
  ...props
}, ref) => {
  const checkboxClasses = clsx(
    'checkbox',
    `checkbox--${size}`,
    {
      'checkbox--invalid': isInvalid,
    },
    className
  );

  return (
    <label className={checkboxClasses}>
      <input
        ref={ref}
        type="checkbox"
        className="checkbox__input"
        checked={isChecked}
        defaultChecked={defaultChecked}
        disabled={isDisabled}
        required={isRequired}
        onChange={onChange}
        value={value}
        name={name}
        id={id}
        aria-invalid={isInvalid}
        {...props}
      />
      <span className="checkbox__control" />
      {children && <span className="checkbox__label">{children}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  /** Label text */
  children: PropTypes.node,
  /** Size variant */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Color scheme */
  colorScheme: PropTypes.string,
  /** Controlled checked state */
  isChecked: PropTypes.bool,
  /** Disabled state */
  isDisabled: PropTypes.bool,
  /** Invalid/error state */
  isInvalid: PropTypes.bool,
  /** Required field */
  isRequired: PropTypes.bool,
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

/**
 * CheckboxGroup Component
 * Group of related checkboxes
 * 
 * @example
 * <CheckboxGroup value={selected} onChange={setSelected}>
 *   <Checkbox value="1">Option 1</Checkbox>
 *   <Checkbox value="2">Option 2</Checkbox>
 * </CheckboxGroup>
 */
export const CheckboxGroup = forwardRef(({
  children,
  value = [],
  defaultValue = [],
  onChange,
  isDisabled = false,
  spacing = 2,
  direction = 'column',
  className,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined && onChange !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (event) => {
    const { value: checkboxValue, checked } = event.target;
    
    let newValue;
    if (checked) {
      newValue = [...currentValue, checkboxValue];
    } else {
      newValue = currentValue.filter(v => v !== checkboxValue);
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const groupClasses = clsx(
    'd-flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    `gap-${spacing}`,
    className
  );

  // Clone children to pass controlled props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      isChecked: currentValue.includes(child.props.value),
      onChange: handleChange,
      isDisabled: isDisabled || child.props.isDisabled,
    });
  });

  return (
    <div ref={ref} role="group" className={groupClasses} {...props}>
      {enhancedChildren}
    </div>
  );
});

CheckboxGroup.displayName = 'CheckboxGroup';

CheckboxGroup.propTypes = {
  /** Checkbox children */
  children: PropTypes.node.isRequired,
  /** Controlled value (array of checked values) */
  value: PropTypes.arrayOf(PropTypes.string),
  /** Default value (uncontrolled) */
  defaultValue: PropTypes.arrayOf(PropTypes.string),
  /** Change handler */
  onChange: PropTypes.func,
  /** Disable all checkboxes */
  isDisabled: PropTypes.bool,
  /** Spacing between checkboxes */
  spacing: PropTypes.oneOf([0, 1, 2, 3, 4]),
  /** Layout direction */
  direction: PropTypes.oneOf(['row', 'column']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Checkbox;
