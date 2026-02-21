/**
 * MobileBottomAction Component
 * Sticky bottom action bar for mobile pages
 * Matches Figma: Bottom menu.png, Options pannel.png
 * Respects safe-area-inset-bottom for notched devices
 * 
 * @file src/components/mobile/MobileBottomAction.jsx
 */

import React from 'react';
import clsx from 'clsx';
import './mobile.css';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Action buttons/elements
 * @param {string} props.className
 */
export const MobileBottomAction = ({
  children,
  className,
}) => {
  return (
    <div className={clsx('mobile-bottom-action', className)}>
      {children}
    </div>
  );
};

export default MobileBottomAction;
