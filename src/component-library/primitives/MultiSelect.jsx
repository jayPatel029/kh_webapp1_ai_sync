/**
 * MultiSelect Component
 * Enhanced multi-select dropdown with checkboxes for each option
 * Styled to match the default select component
 * 
 * @file src/component-library/primitives/MultiSelect.jsx
 */

import React, { forwardRef, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
// import './multiselect.css';

import "../../design-system/styles/multiselect.css"; // Importing design system styles

/**
 * MultiSelect Component
 * 
 * @example
 * <MultiSelect placeholder="Select options" value={selected} onChange={handleChange}>
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 *   <option value="3">Option 3</option>
 * </MultiSelect>
 */
export const MultiSelect = forwardRef(({
    children,
    size = 'md',
    placeholder = 'Select options',
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
    value = [],
    onChange,
    className,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Parse children to extract options
    const options = React.Children.toArray(children).filter(
        child => child.type === 'option'
    );

    const updateMenuPosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const maxHeight = 320;
        const spaceBelow = window.innerHeight - rect.bottom - 12;
        const spaceAbove = rect.top - 12;
        const openUpward = spaceBelow < Math.min(maxHeight, 200) && spaceAbove > spaceBelow;
        const available = Math.max(160, openUpward ? spaceAbove : spaceBelow);
        setMenuStyle({
            position: 'fixed',
            left: rect.left,
            width: Math.max(rect.width, 200),
            maxHeight: Math.min(maxHeight, available),
            zIndex: 100000,
            ...(openUpward
                ? { bottom: window.innerHeight - rect.top + 8 }
                : { top: rect.bottom + 8 }),
        });
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) {
            setMenuStyle(null);
            return undefined;
        }
        updateMenuPosition();
        const onReposition = () => updateMenuPosition();
        window.addEventListener('resize', onReposition);
        window.addEventListener('scroll', onReposition, true);
        return () => {
            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);
        };
    }, [isOpen, updateMenuPosition]);

    // Close on outside click (trigger + portaled menu)
    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = (event) => {
            const inTrigger = containerRef.current?.contains(event.target);
            const inMenu = dropdownRef.current?.contains(event.target);
            if (!inTrigger && !inMenu) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    // Handle option toggle
    const handleToggleOption = (optionValue) => {
        const stringValue = String(optionValue);
        const isSelected = value.some(v => String(v) === stringValue);
        
        const newValue = isSelected
            ? value.filter(v => String(v) !== stringValue)
            : [...value, optionValue];

        if (onChange) {
            onChange(newValue);
        }
    };

    // Handle select all/none
    const handleSelectAll = (e) => {
        e.stopPropagation();
        const allValues = options.map(opt => opt.props.value);
        const isCurrentlyAllSelected = value.length === options.length;

        if (onChange) {
            onChange(isCurrentlyAllSelected ? [] : allValues);
        }
    };

    // Check if all items are selected
    const isAllSelected = value.length === options.length && options.length > 0;

    // Get display text
    const getDisplayText = () => {
        if (value.length === 0) return placeholder;
        if (value.length === 1) {
            const selected = options.find(opt => String(opt.props.value) === String(value[0]));
            return selected?.props.children || value[0];
        }
        return `${value.length} selected`;
    };

    // Get selected count
    const selectedCount = value.length;

    const containerClasses = clsx(
        'multi-select',
        `multi-select--${size}`,
        {
            'multi-select--disabled': isDisabled,
            'multi-select--invalid': isInvalid,
            'multi-select--open': isOpen,
        },
        className
    );

    return (
        <div
            ref={containerRef}
            className={containerClasses}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="multiselect-listbox"
            aria-disabled={isDisabled}
            aria-invalid={isInvalid}
        >
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                className="multi-select__trigger"
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                disabled={isDisabled}
                required={isRequired}
            >
                <div className="multi-select__content">
                    <span className="multi-select__label">
                        {getDisplayText()}
                    </span>
                    {/* {selectedCount > 0 && (
                        <span className="multi-select__count">{selectedCount}</span>
                    )} */}
                </div>
                <div className="multi-select__chevron" />
            </button>

            {/* Dropdown portaled to body — avoids modal overflow clipping */}
            {isOpen && !isDisabled && menuStyle && createPortal(
                <div
                    ref={dropdownRef}
                    className="multi-select__dropdown multi-select__dropdown--portal"
                    id="multiselect-listbox"
                    role="listbox"
                    aria-label="Multi-select options"
                    style={menuStyle}
                >
                    {options.length > 0 ? (
                        <>
                            {/* Select All Option */}
                            <label
                                className="multi-select__option multi-select__option--select-all"
                                role="option"
                                aria-selected={isAllSelected}
                            >
                                <input
                                    type="checkbox"
                                    className="multi-select__checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    disabled={isDisabled}
                                />
                                <span className="multi-select__option-text">
                                    Select all
                                </span>
                            </label>

                            {/* Divider */}
                            <div className="multi-select__divider" />

                            {/* Individual Options */}
                            {options.map((option) => (
                                <label
                                    key={option.props.value}
                                    className="multi-select__option"
                                    role="option"
                                    aria-selected={value.some(v => String(v) === String(option.props.value))}
                                >
                                    <input
                                        type="checkbox"
                                        className="multi-select__checkbox"
                                        checked={value.some(v => String(v) === String(option.props.value))}
                                        onChange={() => handleToggleOption(option.props.value)}
                                        disabled={isDisabled}
                                    />
                                    <span className="multi-select__option-text">
                                        {option.props.children}
                                    </span>
                                </label>
                            ))}
                        </>
                    ) : (
                        <div className="multi-select__empty">No options available</div>
                    )}
                </div>,
                document.body,
            )}

            {/* Hidden select for accessibility and form submission */}
            <select
                ref={ref}
                className="multi-select__native"
                multiple
                value={value}
                onChange={(e) => {
                    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                    if (onChange) onChange(selectedValues);
                }}
                disabled={isDisabled}
                required={isRequired}
                aria-hidden="true"
                tabIndex="-1"
                {...props}
            >
                {children}
            </select>
        </div>
    );
});

MultiSelect.displayName = 'MultiSelect';

MultiSelect.propTypes = {
    children: PropTypes.node,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    placeholder: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    isInvalid: PropTypes.bool,
    isRequired: PropTypes.bool,
    className: PropTypes.string,
};

export default MultiSelect;
