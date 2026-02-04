/**
 * Modal Component
 * Overlay dialog for focused interactions
 * 
 * @file src/components/primitives/Modal.jsx
 */

import React, { forwardRef, createContext, useContext, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Modal Context
 */
const ModalContext = createContext({});

/**
 * Hook to access modal context
 */
export const useModalContext = () => useContext(ModalContext);

/**
 * Modal Component
 * 
 * @example
 * <Modal isOpen={isOpen} onClose={onClose}>
 *   <ModalOverlay />
 *   <ModalContent>
 *     <ModalHeader>Title</ModalHeader>
 *     <ModalBody>Content</ModalBody>
 *     <ModalFooter>
 *       <Button onClick={onClose}>Close</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 */
export const Modal = ({
  children,
  isOpen = false,
  onClose,
  size = 'md',
  isCentered = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  blockScrollOnMount = true,
  returnFocusOnClose = true,
  initialFocusRef,
  finalFocusRef,
}) => {
  // Handle escape key
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && closeOnEsc) {
      onClose?.();
    }
  }, [closeOnEsc, onClose]);

  // Block scroll when modal is open
  useEffect(() => {
    if (isOpen && blockScrollOnMount) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, blockScrollOnMount]);

  // Handle escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Focus management
  useEffect(() => {
    if (isOpen && initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  const contextValue = {
    isOpen,
    onClose,
    size,
    isCentered,
    closeOnOverlayClick,
  };

  return createPortal(
    <ModalContext.Provider value={contextValue}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {children}
      </div>
    </ModalContext.Provider>,
    document.body
  );
};

Modal.propTypes = {
  /** Modal children */
  children: PropTypes.node.isRequired,
  /** Open state */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Size variant */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'full']),
  /** Center modal vertically */
  isCentered: PropTypes.bool,
  /** Close on overlay click */
  closeOnOverlayClick: PropTypes.bool,
  /** Close on escape key */
  closeOnEsc: PropTypes.bool,
  /** Block scroll when open */
  blockScrollOnMount: PropTypes.bool,
  /** Return focus on close */
  returnFocusOnClose: PropTypes.bool,
  /** Ref to element to focus on open */
  initialFocusRef: PropTypes.object,
  /** Ref to element to focus on close */
  finalFocusRef: PropTypes.object,
};

/**
 * ModalOverlay Component
 */
export const ModalOverlay = forwardRef(({
  className,
  ...props
}, ref) => {
  const { onClose, closeOnOverlayClick } = useModalContext();

  const handleClick = (event) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };

  return (
    <div
      ref={ref}
      className={clsx('modal__overlay', className)}
      onClick={handleClick}
      {...props}
    />
  );
});

ModalOverlay.displayName = 'ModalOverlay';

/**
 * ModalContent Component
 */
export const ModalContent = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  const { size } = useModalContext();

  return (
    <div
      ref={ref}
      className={clsx('modal__content', `modal__content--${size}`, className)}
      role="document"
      {...props}
    >
      {children}
    </div>
  );
});

ModalContent.displayName = 'ModalContent';

ModalContent.propTypes = {
  /** Content children */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * ModalHeader Component
 */
export const ModalHeader = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <header
      ref={ref}
      id="modal-title"
      className={clsx('modal__header', className)}
      {...props}
    >
      {children}
    </header>
  );
});

ModalHeader.displayName = 'ModalHeader';

ModalHeader.propTypes = {
  /** Header content */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * ModalBody Component
 */
export const ModalBody = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('modal__body', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ModalBody.displayName = 'ModalBody';

ModalBody.propTypes = {
  /** Body content */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * ModalFooter Component
 */
export const ModalFooter = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <footer
      ref={ref}
      className={clsx('modal__footer', className)}
      {...props}
    >
      {children}
    </footer>
  );
});

ModalFooter.displayName = 'ModalFooter';

ModalFooter.propTypes = {
  /** Footer content */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * ModalCloseButton Component
 */
export const ModalCloseButton = forwardRef(({
  className,
  'aria-label': ariaLabel = 'Close modal',
  ...props
}, ref) => {
  const { onClose } = useModalContext();

  return (
    <button
      ref={ref}
      type="button"
      className={clsx('modal__close', className)}
      onClick={onClose}
      aria-label={ariaLabel}
      {...props}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
});

ModalCloseButton.displayName = 'ModalCloseButton';

ModalCloseButton.propTypes = {
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Accessible label */
  'aria-label': PropTypes.string,
};

export default Modal;
