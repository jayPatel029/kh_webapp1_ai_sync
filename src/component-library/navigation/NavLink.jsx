/**
 * NavLink Component
 * Styled navigation link
 * 
 * @file src/component-library/navigation/NavLink.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * NavLink Component
 * 
 * @example
 * <NavLink href="/home" isActive={true}>Home</NavLink>
 */
export const NavLink = forwardRef(({
  children,
  href,
  isActive = false,
  isDisabled = false,
  className,
  ...props
}, ref) => {
  const linkClasses = clsx(
    'nav-link',
    {
      'nav-link--active': isActive,
      'nav-link--disabled': isDisabled,
    },
    className
  );

  return (
    <a
      ref={ref}
      href={href}
      className={linkClasses}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled}
      {...props}
    >
      {children}
    </a>
  );
});

NavLink.displayName = 'NavLink';

NavLink.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
  isActive: PropTypes.bool,
  isDisabled: PropTypes.bool,
  className: PropTypes.string,
};

export default NavLink;
