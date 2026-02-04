/**
 * Toast Component
 * Notification toast for temporary messages
 * 
 * @file src/component-library/feedback/Toast.jsx
 */

import React, { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Flex, Box } from '../layout/Layout';

/**
 * Toast Component
 * 
 * @example
 * <Toast status="success" title="Saved!" duration={3000} onClose={handleClose} />
 */
export const Toast = forwardRef(({
  status = 'info',
  title,
  description,
  duration = 5000,
  isClosable = true,
  onClose,
  position = 'top-right',
  className,
  ...props
}, ref) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const toastClasses = clsx(
    'toast',
    `toast--${status}`,
    `toast--${position}`,
    className
  );

  const statusIcons = {
    info: '💡',
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  const toastContent = (
    <div ref={ref} role="alert" className={toastClasses} {...props}>
      <Flex align="start" gap={3}>
        <span className="toast__icon">{statusIcons[status]}</span>
        <Box className="toast__content">
          {title && <div className="toast__title">{title}</div>}
          {description && <div className="toast__description">{description}</div>}
        </Box>
        {isClosable && (
          <button
            type="button"
            className="toast__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </Flex>
    </div>
  );

  return createPortal(toastContent, document.body);
});

Toast.displayName = 'Toast';

Toast.propTypes = {
  status: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.node,
  description: PropTypes.node,
  duration: PropTypes.number,
  isClosable: PropTypes.bool,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['top', 'top-right', 'top-left', 'bottom', 'bottom-right', 'bottom-left']),
  className: PropTypes.string,
};

export default Toast;
