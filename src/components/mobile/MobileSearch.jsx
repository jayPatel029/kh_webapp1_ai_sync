/**
 * MobileSearch Component
 * Rounded pill search input for mobile pages
 * 
 * @file src/components/mobile/MobileSearch.jsx
 */

import React from 'react';
import clsx from 'clsx';
import './mobile.css';

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} props.placeholder
 * @param {string} props.className
 */
export const MobileSearch = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className,
  ...props
}) => {
  return (
    <div className={clsx('mobile-search', className)}>
      <svg
        className="mobile-search__icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        className="mobile-search__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default MobileSearch;
