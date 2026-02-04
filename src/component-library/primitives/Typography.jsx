/**
 * Typography Components
 * Text and Heading primitives with design system styling
 * 
 * @file src/component-library/primitives/Typography.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Text Component
 * 
 * @example
 * <Text>Regular paragraph text</Text>
 * <Text size="lg" color="muted">Large muted text</Text>
 */
export const Text = forwardRef(({
  children,
  as: Component = 'p',
  size = 'md',
  weight,
  color,
  align,
  isTruncated = false,
  noOfLines,
  className,
  ...props
}, ref) => {
  const textClasses = clsx(
    'text',
    `text--${size}`,
    weight && `text--${weight}`,
    color && `text--${color}`,
    align && `text--${align}`,
    {
      'text--truncate': isTruncated,
      [`text--clamp-${noOfLines}`]: noOfLines && noOfLines <= 3,
    },
    className
  );

  return (
    <Component ref={ref} className={textClasses} {...props}>
      {children}
    </Component>
  );
});

Text.displayName = 'Text';

Text.propTypes = {
  children: PropTypes.node,
  as: PropTypes.oneOf(['p', 'span', 'div', 'label', 'small', 'strong', 'em', 'abbr']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']),
  weight: PropTypes.oneOf(['light', 'regular', 'medium', 'semibold', 'bold']),
  color: PropTypes.oneOf(['muted', 'secondary', 'primary', 'success', 'warning', 'danger', 'error', 'info', 'inverse']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  isTruncated: PropTypes.bool,
  noOfLines: PropTypes.oneOf([1, 2, 3]),
  className: PropTypes.string,
};

/**
 * Heading Component
 * 
 * @example
 * <Heading as="h1">Page Title</Heading>
 * <Heading as="h2" size="lg">Section Title</Heading>
 */
export const Heading = forwardRef(({
  children,
  as: Component = 'h2',
  size,
  color,
  align,
  isTruncated = false,
  className,
  ...props
}, ref) => {
  const defaultSizes = {
    h1: '4xl',
    h2: '3xl',
    h3: '2xl',
    h4: 'xl',
    h5: 'lg',
    h6: 'md',
  };

  const resolvedSize = size || defaultSizes[Component] || 'xl';

  const headingClasses = clsx(
    'heading',
    `heading--${Component}`,
    color && `text--${color}`,
    align && `text--${align}`,
    {
      'text--truncate': isTruncated,
    },
    className
  );

  return (
    <Component ref={ref} className={headingClasses} {...props}>
      {children}
    </Component>
  );
});

Heading.displayName = 'Heading';

Heading.propTypes = {
  children: PropTypes.node,
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']),
  color: PropTypes.oneOf(['muted', 'secondary', 'primary', 'success', 'warning', 'danger', 'info', 'inverse']),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  isTruncated: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Link Component
 */
export const Link = forwardRef(({
  children,
  href,
  isExternal = false,
  color = 'link',
  className,
  ...props
}, ref) => {
  const externalProps = isExternal ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {};

  const linkClasses = clsx(
    'link',
    color === 'muted' && 'link--muted',
    isExternal && 'link--external',
    className
  );

  return (
    <a
      ref={ref}
      href={href}
      className={linkClasses}
      {...externalProps}
      {...props}
    >
      {children}
    </a>
  );
});

Link.displayName = 'Link';

Link.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string.isRequired,
  isExternal: PropTypes.bool,
  color: PropTypes.oneOf(['link', 'muted']),
  className: PropTypes.string,
};

/**
 * Code Component
 */
export const Code = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <code ref={ref} className={clsx('code', className)} {...props}>
      {children}
    </code>
  );
});

Code.displayName = 'Code';

Code.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Label Component
 */
export const Label = forwardRef(({
  children,
  htmlFor,
  isRequired = false,
  className,
  ...props
}, ref) => {
  const labelClasses = clsx(
    'label',
    {
      'label--required': isRequired,
    },
    className
  );

  return (
    <label ref={ref} htmlFor={htmlFor} className={labelClasses} {...props}>
      {children}
    </label>
  );
});

Label.displayName = 'Label';

Label.propTypes = {
  children: PropTypes.node,
  htmlFor: PropTypes.string,
  isRequired: PropTypes.bool,
  className: PropTypes.string,
};

export default Text;
