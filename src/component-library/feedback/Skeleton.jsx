/**
 * Skeleton Component
 * Loading placeholder
 * 
 * @file src/component-library/feedback/Skeleton.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Skeleton Component
 * 
 * @example
 * <Skeleton height="20px" width="100%" />
 * <SkeletonText noOfLines={3} />
 * <SkeletonCircle size="40px" />
 */
export const Skeleton = forwardRef(({
  height,
  width,
  borderRadius,
  isLoaded = false,
  children,
  className,
  ...props
}, ref) => {
  if (isLoaded) {
    return children || null;
  }

  const skeletonClasses = clsx('skeleton', className);

  const style = {
    height,
    width,
    borderRadius,
  };

  return (
    <div ref={ref} className={skeletonClasses} style={style} {...props} />
  );
});

Skeleton.displayName = 'Skeleton';

Skeleton.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderRadius: PropTypes.string,
  isLoaded: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * SkeletonText Component
 * Multi-line text skeleton
 */
export const SkeletonText = forwardRef(({
  noOfLines = 3,
  spacing = 2,
  skeletonHeight = '16px',
  className,
  ...props
}, ref) => {
  const lines = Array.from({ length: noOfLines }, (_, i) => (
    <Skeleton
      key={i}
      height={skeletonHeight}
      width={i === noOfLines - 1 ? '80%' : '100%'}
      className="skeleton-text__line"
    />
  ));

  return (
    <div ref={ref} className={clsx('skeleton-text', `gap-${spacing}`, className)} {...props}>
      {lines}
    </div>
  );
});

SkeletonText.displayName = 'SkeletonText';

SkeletonText.propTypes = {
  noOfLines: PropTypes.number,
  spacing: PropTypes.number,
  skeletonHeight: PropTypes.string,
  className: PropTypes.string,
};

/**
 * SkeletonCircle Component
 * Circular skeleton for avatars
 */
export const SkeletonCircle = forwardRef(({
  size = '40px',
  className,
  ...props
}, ref) => {
  return (
    <Skeleton
      ref={ref}
      height={size}
      width={size}
      borderRadius="50%"
      className={clsx('skeleton-circle', className)}
      {...props}
    />
  );
});

SkeletonCircle.displayName = 'SkeletonCircle';

SkeletonCircle.propTypes = {
  size: PropTypes.string,
  className: PropTypes.string,
};

export default Skeleton;
