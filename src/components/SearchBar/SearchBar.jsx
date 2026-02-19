import React from 'react';
import './SearchBar.css';

/**
 * Unified SearchBar Component
 * A reusable search bar component that matches the Figma design
 * 
 * @component
 * @param {string} placeholder - Placeholder text for the search input
 * @param {string} value - Current value of the search input
 * @param {function} onChange - Callback function when input changes
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 * 
 * @example
 * <SearchBar
 *   placeholder="Search by name..."
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 * />
 */
const SearchBar = ({
  placeholder = "Search by name...",
  value = "",
  onChange = () => {},
  className = "",
  style = {},
  disabled = false,
  autoFocus = false,
}) => {
  return (
    <div className={`search-bar-container ${className}`} style={style}>
      <div className="search-bar-icon-wrapper">
        <svg
          className="search-bar-icon"
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
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        className="search-bar-input"
      />
    </div>
  );
};

export default SearchBar;
