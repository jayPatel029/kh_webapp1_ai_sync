/**
 * Select Component
 * Custom styled select dropdown with design system styling
 * Renders a custom dropdown panel (matching MultiSelect style) for single selection.
 * Keeps native onChange(e) API — e.target.value works as expected.
 *
 * @file src/component-library/primitives/Select.jsx
 */

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import '../../design-system/styles/custom-select.css';

/**
 * Select Component
 *
 * @example
 * <Select placeholder="Select option" value={val} onChange={(e) => setVal(e.target.value)}>
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
  isMulti = false,
  className,
  value,
  defaultValue,
  onChange,
  name,
  id,
  ...props
}, ref) => {
  // ─── Hooks called unconditionally at top level ───
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hiddenRef = useRef(null);

  // Merge forwarded ref with local hidden ref
  const setHiddenRef = useCallback((node) => {
    hiddenRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // Parse <option> children
  const options = React.Children.toArray(children).filter(
    (child) => child.type === 'option' && child.props.value !== ''
  );

  // Determine current value (controlled or uncontrolled)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Display text
  const getDisplayText = () => {
    if (!currentValue && currentValue !== 0) return placeholder || 'None selected';
    const match = options.find((o) => String(o.props.value) === String(currentValue));
    return match ? match.props.children : currentValue;
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Select an option (for single-select)
  const handleSelect = (optValue) => {
    if (!isControlled) setInternalValue(optValue);

    // Fire onChange with a synthetic-like event so e.target.value works
    if (onChange) {
      const syntheticEvent = {
        target: { value: optValue, name: name || '', id: id || '' },
        currentTarget: { value: optValue, name: name || '', id: id || '' },
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }

    setIsOpen(false);
  };

  // ─── Multi-select: fall back to native behaviour ───
  if (isMulti) {
    const selectClasses = clsx('select', `select--${size}`, { 'select--invalid': isInvalid }, className);
    return (
      <select
        ref={ref}
        className={selectClasses}
        disabled={isDisabled}
        required={isRequired}
        aria-invalid={isInvalid}
        multiple
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        name={name}
        id={id}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {children}
      </select>
    );
  }

  // ─── Single-select: custom dropdown ───
  const containerClasses = clsx(
    'custom-select',
    `custom-select--${size}`,
    {
      'custom-select--disabled': isDisabled,
      'custom-select--invalid': isInvalid,
      'custom-select--open': isOpen,
    },
    className,
  );

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Trigger */}
      <button
        type="button"
        className="custom-select__trigger"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={isInvalid || undefined}
      >
        <span className={clsx('custom-select__label', { 'custom-select__label--placeholder': !currentValue })}>
          {getDisplayText()}
        </span>
        <span className="custom-select__chevron" />
      </button>

      {/* Dropdown */}
      {isOpen && !isDisabled && (
        <ul className="custom-select__dropdown" role="listbox">
          {options.map((option) => {
            const isSelected = String(option.props.value) === String(currentValue);
            return (
              <li
                key={option.props.value}
                className={clsx('custom-select__option', { 'custom-select__option--selected': isSelected })}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.props.value)}
              >
                <span className="custom-select__option-text">{option.props.children}</span>
              </li>
            );
          })}
          {options.length === 0 && (
            <li className="custom-select__empty">No options</li>
          )}
        </ul>
      )}

      {/* Hidden native select for form submission & accessibility */}
      <select
        ref={setHiddenRef}
        className="custom-select__native"
        tabIndex={-1}
        aria-hidden="true"
        disabled={isDisabled}
        required={isRequired}
        name={name}
        id={id}
        value={currentValue}
        onChange={() => {}}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
    </div>
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
  isMulti: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
