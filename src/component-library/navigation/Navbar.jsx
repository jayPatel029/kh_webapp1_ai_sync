/**
 * Navbar Component
 * Reusable navigation bar with design system styling
 * 
 * @file src/component-library/navigation/Navbar.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Flex, Box } from '../layout/Layout';

/**
 * Navbar Component
 * 
 * @example
 * <Navbar>
 *   <NavbarBrand>Logo</NavbarBrand>
 *   <NavbarContent>
 *     <NavLink href="/home">Home</NavLink>
 *   </NavbarContent>
 *   <NavbarActions>
 *     <Button>Logout</Button>
 *   </NavbarActions>
 * </Navbar>
 */
export const Navbar = forwardRef(({
  children,
  variant = 'default',
  isSticky = false,
  className,
  ...props
}, ref) => {
  const navbarClasses = clsx(
    'navbar',
    `navbar--${variant}`,
    {
      'navbar--sticky': isSticky,
    },
    className
  );

  return (
    <nav ref={ref} className={navbarClasses} {...props}>
      <Flex align="center" justify="between" className="navbar__container">
        {children}
      </Flex>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

Navbar.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'transparent', 'dark']),
  isSticky: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * NavbarBrand Component
 */
export const NavbarBrand = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('navbar__brand', className)} {...props}>
      {children}
    </div>
  );
});

NavbarBrand.displayName = 'NavbarBrand';

/**
 * NavbarContent Component
 */
export const NavbarContent = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('navbar__content', className)} {...props}>
      <Flex align="center" gap={4}>
        {children}
      </Flex>
    </div>
  );
});

NavbarContent.displayName = 'NavbarContent';

/**
 * NavbarActions Component
 */
export const NavbarActions = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('navbar__actions', className)} {...props}>
      <Flex align="center" gap={3}>
        {children}
      </Flex>
    </div>
  );
});

NavbarActions.displayName = 'NavbarActions';

export default Navbar;
