/**
 * Typography Components
 * Text and Heading primitives with design system styling
 * 
 * @file src/components/primitives/Typography.jsx
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
 * <Text as="span" weight="bold">Bold span</Text>
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
  /** Text content */
  children: PropTypes.node,
  /** HTML element to render */
  as: PropTypes.oneOf(['p', 'span', 'div', 'label', 'small', 'strong', 'em', 'abbr']),
  /** Size variant */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']),
  /** Font weight */
  weight: PropTypes.oneOf(['light', 'regular', 'medium', 'semibold', 'bold']),
  /** Text color */
  color: PropTypes.oneOf(['muted', 'secondary', 'primary', 'success', 'warning', 'danger', 'error', 'info', 'inverse']),
  /** Text alignment */
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  /** Truncate with ellipsis */
  isTruncated: PropTypes.bool,
  /** Number of lines before truncating (1-3) */
  noOfLines: PropTypes.oneOf([1, 2, 3]),
  /** Additional CSS classes */
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
  // Default size based on heading level
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
  /** Heading content */
  children: PropTypes.node,
  /** HTML heading element */
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  /** Size variant (overrides element default) */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']),
  /** Text color */
  color: PropTypes.oneOf(['muted', 'secondary', 'primary', 'success', 'warning', 'danger', 'info', 'inverse']),
  /** Text alignment */
  align: PropTypes.oneOf(['left', 'center', 'right']),
  /** Truncate with ellipsis */
  isTruncated: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * Link Component
 * 
 * @example
 * <Link href="/about">About Us</Link>
 * <Link href="https://example.com" isExternal>External Link</Link>
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
  /** Link content */
  children: PropTypes.node,
  /** Link URL */
  href: PropTypes.string.isRequired,
  /** Open in new tab */
  isExternal: PropTypes.bool,
  /** Link color */
  color: PropTypes.oneOf(['link', 'muted']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * Code Component
 * 
 * @example
 * <Code>const x = 1;</Code>
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
  /** Code content */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * Label Component
 * 
 * @example
 * <Label htmlFor="email" isRequired>Email Address</Label>
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
  /** Label content */
  children: PropTypes.node,
  /** Associated input id */
  htmlFor: PropTypes.string,
  /** Show required indicator */
  isRequired: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Text;
