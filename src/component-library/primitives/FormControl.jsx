/**
 * FormControl Component
 * Wrapper for form fields with label, helper text, and error message
 * 
 * @file src/component-library/primitives/FormControl.jsx
 */

import React, { forwardRef, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Form Control Context
 */
const FormControlContext = createContext({});

/**
 * Hook to access form control context
 */
export const useFormControlContext = () => useContext(FormControlContext);

/**
 * FormControl Component
 * 
 * @example
 * <FormControl isRequired isInvalid={hasError}>
 *   <FormLabel>Email</FormLabel>
 *   <Input type="email" />
 *   <FormErrorMessage>Email is required</FormErrorMessage>
 * </FormControl>
 */
export const FormControl = forwardRef(({
  children,
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  isReadOnly = false,
  id,
  className,
  ...props
}, ref) => {
  const controlId = id || React.useId?.() || `field-${Math.random().toString(36).substr(2, 9)}`;

  const contextValue = {
    isDisabled,
    isInvalid,
    isRequired,
    isReadOnly,
    id: controlId,
  };

  const controlClasses = clsx(
    'form-control',
    {
      'form-control--disabled': isDisabled,
      'form-control--invalid': isInvalid,
    },
    className
  );

  return (
    <FormControlContext.Provider value={contextValue}>
      <div ref={ref} role="group" className={controlClasses} {...props}>
        {children}
      </div>
    </FormControlContext.Provider>
  );
});

FormControl.displayName = 'FormControl';

FormControl.propTypes = {
  children: PropTypes.node.isRequired,
  isDisabled: PropTypes.bool,
  isInvalid: PropTypes.bool,
  isRequired: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  id: PropTypes.string,
  className: PropTypes.string,
};

/**
 * FormLabel Component
 */
export const FormLabel = forwardRef(({
  children,
  htmlFor,
  className,
  ...props
}, ref) => {
  const { isRequired, id } = useFormControlContext();

  const labelClasses = clsx(
    'form-label',
    {
      'form-label--required': isRequired,
    },
    className
  );

  return (
    <label
      ref={ref}
      htmlFor={htmlFor || id}
      className={labelClasses}
      {...props}
    >
      {children}
    </label>
  );
});

FormLabel.displayName = 'FormLabel';

FormLabel.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
};

/**
 * FormHelperText Component
 */
export const FormHelperText = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  const { isInvalid } = useFormControlContext();

  if (isInvalid) return null;

  return (
    <div ref={ref} className={clsx('form-helper-text', className)} {...props}>
      {children}
    </div>
  );
});

FormHelperText.displayName = 'FormHelperText';

FormHelperText.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * FormErrorMessage Component
 */
export const FormErrorMessage = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  const { isInvalid } = useFormControlContext();

  if (!isInvalid) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      className={clsx('form-error-message', className)}
      {...props}
    >
      <svg
        className="form-error-message__icon"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </div>
  );
});

FormErrorMessage.displayName = 'FormErrorMessage';

FormErrorMessage.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * RequiredIndicator Component
 */
export const RequiredIndicator = forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={clsx('text-danger', 'ml-1', className)}
      {...props}
    >
      *
    </span>
  );
});

RequiredIndicator.displayName = 'RequiredIndicator';

export default FormControl;
