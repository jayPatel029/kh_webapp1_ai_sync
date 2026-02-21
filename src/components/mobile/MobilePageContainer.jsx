/**
 * MobilePageContainer Component
 * Top-level wrapper for mobile page layout providing consistent
 * vertical scroll stack structure matching Figma mobile designs.
 * 
 * @file src/components/mobile/MobilePageContainer.jsx
 */

import React from 'react';
import clsx from 'clsx';
import { Box } from '../../component-library';
import './mobile.css';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} props.hasBottomAction - Reserve space for sticky bottom bar
 * @param {string} props.className - Additional classes
 */
export const MobilePageContainer = ({
  children,
  hasBottomAction = false,
  className,
  ...props
}) => {
  return (
    <Box
      className={clsx(
        'mobile-page',
        hasBottomAction && 'mobile-page--has-bottom-action',
        className
      )}
      {...props}
    >
      <Box className="mobile-page__content">
        {children}
      </Box>
    </Box>
  );
};

export default MobilePageContainer;
