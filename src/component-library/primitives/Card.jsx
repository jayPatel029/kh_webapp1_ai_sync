/**
 * Card Component
 * Container for content with elevation
 * 
 * @file src/component-library/primitives/Card.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Card Component
 * 
 * @example
 * <Card variant="elevated">
 *   <CardHeader>Title</CardHeader>
 *   <CardBody>Content goes here</CardBody>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 */
export const Card = forwardRef(({
  children,
  variant = 'elevated',
  size = 'md',
  isClickable = false,
  isSelected = false,
  className,
  onClick,
  ...props
}, ref) => {
  const cardClasses = clsx(
    'card',
    `card--${size}`,
    `card--${variant}`,
    {
      'card--clickable': isClickable || onClick,
      'card--selected': isSelected,
      'card--static': !isClickable && !onClick,
    },
    className
  );

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={onClick}
      role={isClickable || onClick ? 'button' : undefined}
      tabIndex={isClickable || onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

Card.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['elevated', 'outline', 'filled', 'unstyled']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isClickable: PropTypes.bool,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

/**
 * CardHeader Component
 */
export const CardHeader = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('card__header', className)} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * CardBody Component
 */
export const CardBody = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('card__body', className)} {...props}>
      {children}
    </div>
  );
});

CardBody.displayName = 'CardBody';

CardBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * CardFooter Component
 */
export const CardFooter = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('card__footer', className)} {...props}>
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;
