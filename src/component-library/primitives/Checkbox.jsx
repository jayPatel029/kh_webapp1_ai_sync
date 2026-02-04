/**
 * Checkbox Component
 * Custom styled checkbox with design system styling
 * 
 * @file src/component-library/primitives/Checkbox.jsx
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
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  colorScheme: PropTypes.string,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isInvalid: PropTypes.bool,
  isRequired: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};

/**
 * CheckboxGroup Component
 * Group of related checkboxes
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
  children: PropTypes.node.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  defaultValue: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  isDisabled: PropTypes.bool,
  spacing: PropTypes.oneOf([0, 1, 2, 3, 4]),
  direction: PropTypes.oneOf(['row', 'column']),
  className: PropTypes.string,
};

export default Checkbox;
