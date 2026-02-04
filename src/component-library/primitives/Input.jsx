/**
 * Input Component
 * Primitive text input with design system styling
 * 
 * @file src/component-library/primitives/Input.jsx
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
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled', 'main', 'auth']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  isDisabled: PropTypes.bool,
  isInvalid: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isRequired: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * InputGroup Component
 * Wrapper for input with addons or elements
 */
export const InputGroup = forwardRef(({
  children,
  size = 'md',
  className,
  ...props
}, ref) => {
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

  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
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
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};

/**
 * InputLeftElement Component
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
