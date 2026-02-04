/**
 * Textarea Component
 * Primitive textarea with design system styling
 * 
 * @file src/components/primitives/Textarea.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Textarea Component
 * 
 * @example
 * <Textarea placeholder="Enter your message..." rows={4} />
 * <Textarea isInvalid={hasError} />
 */
export const Textarea = forwardRef(({
  variant = 'outline',
  size = 'md',
  isDisabled = false,
  isInvalid = false,
  isReadOnly = false,
  isRequired = false,
  resize = 'vertical',
  className,
  ...props
}, ref) => {
  const textareaClasses = clsx(
    'textarea',
    {
      'textarea--invalid': isInvalid,
    },
    className
  );

  const resizeStyle = {
    resize: resize === 'none' ? 'none' : resize === 'both' ? 'both' : resize === 'horizontal' ? 'horizontal' : 'vertical',
  };

  return (
    <textarea
      ref={ref}
      className={textareaClasses}
      style={resizeStyle}
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      aria-invalid={isInvalid}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  /** Visual variant */
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  /** Size variant */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Disabled state */
  isDisabled: PropTypes.bool,
  /** Invalid/error state */
  isInvalid: PropTypes.bool,
  /** Read-only state */
  isReadOnly: PropTypes.bool,
  /** Required field */
  isRequired: PropTypes.bool,
  /** Resize behavior */
  resize: PropTypes.oneOf(['none', 'vertical', 'horizontal', 'both']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Textarea;
