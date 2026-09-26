/**
 * BaseModal Component
 * A reusable modal wrapper that uses design system primitives
 * 
 * @file src/component-library/modals/BaseModal.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '../primitives/Modal';
import { Heading } from '../primitives/Typography';

/**
 * BaseModal Component
 * A standardized modal that provides consistent styling across the app
 * 
 * @example
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Modal Title"
 *   size="md"
 * >
 *   <p>Modal content goes here</p>
 * </BaseModal>
 */
export const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  contentStyle,
  contentClassName,
  bodyStyle,
  bodyClassName,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      {...props}
    >
      <ModalOverlay />
      <ModalContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          ...contentStyle,
        }}
        className={contentClassName}
      >
        {showCloseButton && <ModalCloseButton />}
        {title && (
          <ModalHeader flexShrink={0}>
            <Heading as="h3" size="lg" className="pr-10">
              {title}
            </Heading>
          </ModalHeader>
        )}
        <ModalBody 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            minHeight: 0,
            ...bodyStyle,
          }}
          className={`scrollbar-subtle ${bodyClassName || ''}`.trim()}
        >
          {children}
        </ModalBody>
        {footer && (
          <ModalFooter flexShrink={0}>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

BaseModal.propTypes = {
  /** Whether modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.node,
  /** Modal body content */
  children: PropTypes.node,
  /** Footer content (buttons, etc.) */
  footer: PropTypes.node,
  /** Modal size */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'full']),
  /** Show close button in header */
  showCloseButton: PropTypes.bool,
  /** Close on overlay click */
  closeOnOverlayClick: PropTypes.bool,
  /** Close on Escape key */
  closeOnEsc: PropTypes.bool,
};

export default BaseModal;
