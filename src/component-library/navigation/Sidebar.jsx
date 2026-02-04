/**
 * Sidebar Component
 * Reusable sidebar navigation with design system styling
 * 
 * @file src/component-library/navigation/Sidebar.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Box, Stack, Flex } from '../layout/Layout';

/**
 * Sidebar Component
 * 
 * @example
 * <Sidebar>
 *   <SidebarHeader>Logo</SidebarHeader>
 *   <SidebarContent>
 *     <SidebarItem icon={<Icon />} href="/dashboard">Dashboard</SidebarItem>
 *   </SidebarContent>
 * </Sidebar>
 */
export const Sidebar = forwardRef(({
  children,
  variant = 'default',
  isCollapsed = false,
  isMobile = false,
  className,
  ...props
}, ref) => {
  const sidebarClasses = clsx(
    'sidebar',
    `sidebar--${variant}`,
    {
      'sidebar--collapsed': isCollapsed,
      'sidebar--mobile': isMobile,
    },
    className
  );

  return (
    <aside ref={ref} className={sidebarClasses} {...props}>
      <Stack spacing={0} className="sidebar__inner">
        {children}
      </Stack>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

Sidebar.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'brand', 'dark']),
  isCollapsed: PropTypes.bool,
  isMobile: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * SidebarHeader Component
 */
export const SidebarHeader = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('sidebar__header', className)} {...props}>
      {children}
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

/**
 * SidebarContent Component
 */
export const SidebarContent = forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <nav ref={ref} className={clsx('sidebar__content', className)} {...props}>
      <ul className="sidebar__list">
        {children}
      </ul>
    </nav>
  );
});

SidebarContent.displayName = 'SidebarContent';

/**
 * SidebarItem Component
 */
export const SidebarItem = forwardRef(({
  children,
  icon,
  isActive = false,
  href,
  onClick,
  className,
  ...props
}, ref) => {
  const itemClasses = clsx(
    'sidebar__item',
    {
      'sidebar__item--active': isActive,
    },
    className
  );

  const content = (
    <Flex align="center" gap={3}>
      {icon && <span className="sidebar__icon">{icon}</span>}
      <span className="sidebar__label">{children}</span>
    </Flex>
  );

  if (href) {
    return (
      <li ref={ref} className={itemClasses} {...props}>
        <a href={href} className="sidebar__link">
          {content}
        </a>
      </li>
    );
  }

  return (
    <li ref={ref} className={itemClasses} onClick={onClick} {...props}>
      {content}
    </li>
  );
});

SidebarItem.displayName = 'SidebarItem';

SidebarItem.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  isActive: PropTypes.bool,
  href: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

/**
 * SidebarGroup Component
 */
export const SidebarGroup = forwardRef(({
  children,
  title,
  isCollapsible = false,
  isOpen = true,
  onToggle,
  className,
  ...props
}, ref) => {
  const groupClasses = clsx(
    'sidebar__group',
    {
      'sidebar__group--collapsed': !isOpen,
    },
    className
  );

  return (
    <div ref={ref} className={groupClasses} {...props}>
      {title && (
        <div 
          className="sidebar__group-title"
          onClick={isCollapsible ? onToggle : undefined}
        >
          <span>{title}</span>
          {isCollapsible && (
            <span className={clsx('sidebar__group-arrow', { 'rotate-180': isOpen })}>
              ▼
            </span>
          )}
        </div>
      )}
      {isOpen && (
        <ul className="sidebar__group-items">
          {children}
        </ul>
      )}
    </div>
  );
});

SidebarGroup.displayName = 'SidebarGroup';

SidebarGroup.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  isCollapsible: PropTypes.bool,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string,
};

export default Sidebar;
