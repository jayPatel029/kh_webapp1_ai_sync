/**
 * SortDropdown Component
 * Styled sort/filter dropdown that matches the lab reports redesign.
 *
 * @file src/component-library/primitives/SortDropdown.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import sortIcon from '../../assets/Sort_Amount_Up.svg';

export const SortDropdown = forwardRef(({
  value = '',
  onChange,
  options = [],
  placeholder = 'Sort by',
  icon = <img src={sortIcon} alt="Sort" />,
  iconAlt,
  label,
  className,
  disabled = false,
  name,
  ...props
}, ref) => {
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  const hasIcon = Boolean(icon);
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <img src={icon} alt={iconAlt || label || placeholder} />;
    }
    return icon;
  };

  return (
    <div
      className={clsx('sort-dropdown', {
        'sort-dropdown--with-icon': hasIcon,
      }, className)}
    >
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label={label || placeholder}
        className="sort-dropdown__select"
        {...props}
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map(({ value: optionValue, label: optionLabel }) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>

      <div className="sort-dropdown__content" aria-hidden="true">
        {hasIcon && (
          <span className="sort-dropdown__icon">
            {renderIcon()}
          </span>
        )}
        <span className="sort-dropdown__label">{displayLabel}</span>
        <span className="sort-dropdown__chevron" aria-hidden="true">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
});

SortDropdown.displayName = 'SortDropdown';

SortDropdown.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
  placeholder: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  iconAlt: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  name: PropTypes.string,
};

export default SortDropdown;