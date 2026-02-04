/**
 * ConfirmModal Component
 * Modal for confirmation dialogs with Yes/No or custom actions
 * 
 * @file src/component-library/modals/ConfirmModal.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import { BaseModal } from './BaseModal';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Typography';
import { Flex } from '../layout/Layout';

/**
 * ConfirmModal Component
 * 
 * @example
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onConfirm={handleConfirm}
 *   title="Confirm Delete"
 *   message="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   confirmVariant="danger"
 * />
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  cancelVariant = 'outline',
  isLoading = false,
  size = 'sm',
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const footer = (
    <Flex justify="end" gap={3}>
      <Button
        variant={cancelVariant}
        onClick={onClose}
        isDisabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </Flex>
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
      {message && <Text>{message}</Text>}
    </BaseModal>
  );
};

ConfirmModal.propTypes = {
  /** Whether modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Confirm handler */
  onConfirm: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string,
  /** Confirmation message */
  message: PropTypes.node,
  /** Confirm button text */
  confirmText: PropTypes.string,
  /** Cancel button text */
  cancelText: PropTypes.string,
  /** Confirm button variant */
  confirmVariant: PropTypes.string,
  /** Cancel button variant */
  cancelVariant: PropTypes.string,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Modal size */
  size: PropTypes.string,
};

export default ConfirmModal;
