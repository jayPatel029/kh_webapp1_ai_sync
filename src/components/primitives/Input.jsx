/**
 * Input Component
 * Primitive text input with design system styling
 * 
 * @file src/components/primitives/Input.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Input Component
 * 
 * @example
 * <Input placeholder="Enter text" variant="outline" />
 * <Input isInvalid={hasError} errorMessage="Required field" />
 */
export const Input = forwardRef(({
  variant = 'outline',
  size = 'md',
  isDisabled = false,
  isInvalid = false,
  isReadOnly = false,
  isRequired = false,
  className,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'input',
    `input--${size}`,
    `input--${variant}`,
    {
      'input--disabled': isDisabled,
      'input--invalid': isInvalid,
      'input--readonly': isReadOnly,
    },
    className
  );

  return (
    <input
      ref={ref}
      className={inputClasses}
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      aria-invalid={isInvalid}
      aria-disabled={isDisabled}
      {...props}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /** Visual variant */
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled', 'main', 'auth']),
  /** Size variant */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  /** Disabled state */
  isDisabled: PropTypes.bool,
  /** Invalid/error state */
  isInvalid: PropTypes.bool,
  /** Read-only state */
  isReadOnly: PropTypes.bool,
  /** Required field */
  isRequired: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * InputGroup Component
 * Wrapper for input with addons or elements
 * 
 * @example
 * <InputGroup>
 *   <InputLeftElement><SearchIcon /></InputLeftElement>
 *   <Input placeholder="Search..." />
 * </InputGroup>
 */
export const InputGroup = forwardRef(({
  children,
  size = 'md',
  className,
  ...props
}, ref) => {
  // Analyze children to determine what addons/elements are present
  let hasLeftElement = false;
  let hasRightElement = false;
  let hasLeftAddon = false;
  let hasRightAddon = false;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    
    const displayName = child.type?.displayName || child.type?.name || '';
    
    if (displayName === 'InputLeftElement') hasLeftElement = true;
    if (displayName === 'InputRightElement') hasRightElement = true;
    if (displayName === 'InputLeftAddon') hasLeftAddon = true;
    if (displayName === 'InputRightAddon') hasRightAddon = true;
  });

  const groupClasses = clsx(
    'input-group',
    {
      'input-group--has-left': hasLeftElement,
      'input-group--has-right': hasRightElement,
      'input-group--has-addon-left': hasLeftAddon,
      'input-group--has-addon-right': hasRightAddon,
    },
    className
  );

  // Clone children to pass size prop
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
    // Pass size prop to Input children
    if (child.type?.displayName === 'Input' || child.type === Input) {
      return React.cloneElement(child, { size });
    }
    
    return child;
  });

  return (
    <div ref={ref} className={groupClasses} {...props}>
      {enhancedChildren}
    </div>
  );
});

InputGroup.displayName = 'InputGroup';

InputGroup.propTypes = {
  /** Input and elements/addons */
  children: PropTypes.node.isRequired,
  /** Size for all children */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * InputLeftElement Component
 * Icon or element on the left side of input
 */
export const InputLeftElement = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('input-group__element', 'input-group__element--left', className)}
      {...props}
    >
      {children}
    </div>
  );
});

InputLeftElement.displayName = 'InputLeftElement';

/**
 * InputRightElement Component
 * Icon or element on the right side of input
 */
export const InputRightElement = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('input-group__element', 'input-group__element--right', className)}
      {...props}
    >
      {children}
    </div>
  );
});

InputRightElement.displayName = 'InputRightElement';

/**
 * InputLeftAddon Component
 * Text or element addon on the left
 */
export const InputLeftAddon = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('input-group__addon', 'input-group__addon--left', className)}
      {...props}
    >
      {children}
    </div>
  );
});

InputLeftAddon.displayName = 'InputLeftAddon';

/**
 * InputRightAddon Component
 * Text or element addon on the right
 */
export const InputRightAddon = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('input-group__addon', 'input-group__addon--right', className)}
      {...props}
    >
      {children}
    </div>
  );
});

InputRightAddon.displayName = 'InputRightAddon';

export default Input;
