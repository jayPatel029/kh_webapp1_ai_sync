/**
 * CheckboxMultiSelect Component
 * A reusable multiselect component with checkboxes and selected items display
 * 
 * @file src/component-library/inputs/CheckboxMultiSelect.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * CheckboxMultiSelect Component
 * Displays a list of checkboxes for multi-selection with a preview of selected items
 * 
 * @example
 * <CheckboxMultiSelect
 *   value={selectedReports}
 *   onChange={setSelectedReports}
 *   options={[
 *     { key: 'report1', label: 'Patient Reports' },
 *     { key: 'report2', label: 'Treatment Reports' }
 *   ]}
 *   maxHeight="300px"
 * />
 */
export const CheckboxMultiSelect = ({
  value = [],
  onChange = () => {},
  options = [],
  disabled = false,
  maxHeight = '150px',
  showSelected = true,
  isInvalid = false,
}) => {
  const handleToggle = (key) => {
    if (value.includes(key)) {
      onChange(value.filter(v => v !== key));
    } else {
      onChange([...value, key]);
    }
  };

  const selectedOptions = options.filter(opt => value.includes(opt.key));

  return (
    <div className="checkbox-multiselect">
      {/* Selected items display */}
      {/* {showSelected && selectedOptions.length > 0 && (
        <div className="checkbox-multiselect__selected mb-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Selected:</div>
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map(option => (
              <span
                key={option.key}
                className="inline-flex items-center bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => handleToggle(option.key)}
                  className="ml-2 text-teal-600 hover:text-teal-900"
                  disabled={disabled}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )} */}

      {/* Checkboxes list */}
      <div
        className={`checkbox-multiselect__list border border-gray-200 rounded-lg p-3 overflow-y-auto scrollbar-subtle ${isInvalid ? 'border-red-500' : ''}`}
        style={{ maxHeight }}
      >
        {options.map(option => (
          <label
            key={option.key}
            className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
            style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
          >
            <input
              type="checkbox"
              checked={value.includes(option.key)}
              onChange={() => handleToggle(option.key)}
              className="h-4 w-4 accent-teal-600 rounded flex-shrink-0 mt-0.5"
              disabled={disabled}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
              {option.description && (
                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-sm text-gray-500 p-3 text-center">No options available</div>
      )}
    </div>
  );
};

CheckboxMultiSelect.propTypes = {
  /** Selected option keys */
  value: PropTypes.array,
  /** Callback when selection changes */
  onChange: PropTypes.func,
  /** Options to display: array of { key, label, description? } */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  /** Disable the multiselect */
  disabled: PropTypes.bool,
  /** Max height of the checkbox list */
  maxHeight: PropTypes.string,
  /** Show selected items preview */
  showSelected: PropTypes.bool,
  /** Mark as invalid */
  isInvalid: PropTypes.bool,
};

export default CheckboxMultiSelect;
