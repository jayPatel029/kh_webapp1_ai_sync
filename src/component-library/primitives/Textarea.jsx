/**
 * Textarea Component
 * Primitive textarea with design system styling
 * 
 * @file src/component-library/primitives/Textarea.jsx
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
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isDisabled: PropTypes.bool,
  isInvalid: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isRequired: PropTypes.bool,
  resize: PropTypes.oneOf(['none', 'vertical', 'horizontal', 'both']),
  className: PropTypes.string,
};

export default Textarea;
