/**
 * FormModal Component
 * Modal wrapper for form submissions
 * 
 * @file src/component-library/modals/FormModal.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import { BaseModal } from './BaseModal';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Typography';
import { Flex, Stack } from '../layout/Layout';

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
  size = 'md',
  ...props
}) => {
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSubmit?.();
  };

  const footer = (
    <Stack spacing={3}>
      {errorMessage && (
        <Text color="danger" size="sm">{errorMessage}</Text>
      )}
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
          {children}
        </Stack>
      </form>
    </BaseModal>
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
  children: PropTypes.node,
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
  /** Modal size */
  size: PropTypes.string,
};

export default FormModal;
