/**
 * Button Component
 * Primitive button with design system styling
 * 
 * @file src/component-library/primitives/Button.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Simple Spinner Component for loading states
 */
const Spinner = ({ size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={clsx('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Button Component
 * 
 * @example
 * <Button variant="primary" size="md">Click Me</Button>
 * <Button variant="outline" leftIcon={<Icon />}>With Icon</Button>
 */
export const Button = forwardRef(({
  children,
  variant = 'solid',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  loadingText,
  type = 'button',
  className,
  ...props
}, ref) => {
  const disabled = isDisabled || isLoading;

  // Map 'primary' to 'solid' for backward compatibility
  const effectiveVariant = variant === 'primary' ? 'solid' : variant;

  const buttonClasses = clsx(
    'btn',
    `btn--${size}`,
    `btn--${effectiveVariant}`,
    {
      'btn--loading': isLoading,
      'btn--disabled': disabled,
      'btn--full-width': isFullWidth,
    },
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled}
      aria-disabled={disabled}
      aria-busy={isLoading}
      {...props}
    >
      <span className={clsx('btn__content', { 'opacity-0': isLoading && !loadingText })}>
        {leftIcon && (
          <span className="btn__icon btn__icon--left">
            {leftIcon}
          </span>
        )}
        
        {isLoading && loadingText ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="xs" />
            {loadingText}
          </span>
        ) : (
          children
        )}
        
        {rightIcon && (
          <span className="btn__icon btn__icon--right">
            {rightIcon}
          </span>
        )}
      </span>

      {isLoading && !loadingText && (
        <span className="btn__spinner">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'solid',
    'primary', // Deprecated, maps to solid
    'secondary',
    'outline',
    'ghost',
    'glass',
    'link',
    'danger',
    'danger-outline',
    'success',
    'warning',
    'brand',
    'dark-brand',
    'light-brand',
    'gray',
    'navy',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isFullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  loadingText: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

/**
 * IconButton Component
 * Button variant optimized for icons only
 */
export const IconButton = forwardRef(({
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      className={clsx('btn--icon', className)}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  'aria-label': PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  variant: PropTypes.string,
  className: PropTypes.string,
};

/**
 * ButtonGroup Component
 * Group related buttons together
 */
export const ButtonGroup = forwardRef(({
  children,
  isAttached = false,
  spacing = 2,
  className,
  ...props
}, ref) => {
  const groupClasses = clsx(
    'btn-group',
    {
      'btn-group--attached': isAttached,
    },
    !isAttached && `gap-${spacing}`,
    className
  );

  return (
    <div ref={ref} role="group" className={groupClasses} {...props}>
      {children}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

ButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  isAttached: PropTypes.bool,
  spacing: PropTypes.oneOf([0, 1, 2, 3, 4]),
  className: PropTypes.string,
};

export default Button;
