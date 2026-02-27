/**
 * FormModal Component
 * Modal wrapper for form submissions
 * 
 * @file src/component-library/modals/FormModal.jsx
 */

import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BaseModal } from './BaseModal';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Typography';
import { Flex, Stack } from '../layout/Layout';

const FormModalValidationContext = createContext({
  fieldErrors: {},
  hasError: () => false,
  getErrorMessage: () => '',
  clearFieldError: () => {},
  getFieldProps: () => ({}),
});

export const useFormModalValidation = () => useContext(FormModalValidationContext);

/**
 * FormModal Component
 * 
 * @example
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   title="Add Reading"
 *   submitText="Submit"
 * >
 *   <FormControl>
 *     <FormLabel>Date</FormLabel>
 *     <Input type="date" />
 *   </FormControl>
 * </FormModal>
 */
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitVariant = 'secondary',
  cancelVariant = 'danger',
  isLoading = false,
  isSubmitDisabled = false,
  errorMessage,
  fieldErrors = {},
  onFieldErrorClear,
  size = 'md',
  ...props
}) => {
  const normalizeErrorMessage = (fieldError) => {
    if (typeof fieldError === 'string') return fieldError;
    if (fieldError) return 'Invalid value';
    return '';
  };

  const validationApi = useMemo(() => ({
    fieldErrors,
    hasError: (fieldName) => Boolean(fieldErrors?.[fieldName]),
    getErrorMessage: (fieldName) => normalizeErrorMessage(fieldErrors?.[fieldName]),
    clearFieldError: (fieldName) => onFieldErrorClear?.(fieldName),
    getFieldProps: (fieldName) => ({
      isInvalid: Boolean(fieldErrors?.[fieldName]),
      'aria-invalid': Boolean(fieldErrors?.[fieldName]),
    }),
  }), [fieldErrors, onFieldErrorClear]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSubmit?.();
  };

  const footer = (
    <Stack spacing={3}>
      {/* {errorMessage && (
        <Text color="danger" size="sm">{errorMessage}</Text>
      )} */}
      <Flex justify="end" gap={4}>
        <Button
          variant={cancelVariant}
          onClick={onClose}
          isDisabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={submitVariant}
          onClick={handleSubmit}
          isLoading={isLoading}
          isDisabled={isSubmitDisabled}
        >
          {submitText}
        </Button>
      </Flex>
    </Stack>
  );

  return (
    <FormModalValidationContext.Provider value={validationApi}>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        footer={footer}
        size={size}
        {...props}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {typeof children === 'function' ? children(validationApi) : children}
          </Stack>
        </form>
      </BaseModal>
    </FormModalValidationContext.Provider>
  );
};

FormModal.propTypes = {
  /** Whether modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Submit handler */
  onSubmit: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string,
  /** Form fields */
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  /** Submit button text */
  submitText: PropTypes.string,
  /** Cancel button text */
  cancelText: PropTypes.string,
  /** Submit button variant */
  submitVariant: PropTypes.string,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Disable submit button */
  isSubmitDisabled: PropTypes.bool,
  /** Error message to display */
  errorMessage: PropTypes.string,
  /** Field-level errors map e.g. { email: 'Invalid email' } */
  fieldErrors: PropTypes.object,
  /** Callback when a field error should be cleared */
  onFieldErrorClear: PropTypes.func,
  /** Modal size */
  size: PropTypes.string,
};

export default FormModal;
