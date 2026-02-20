/**
 * MobileHeader Component
 * Compact header bar for mobile pages — left nav icon, center title, right action
 * Matches Figma: header.png
 * 
 * @file src/components/mobile/MobileHeader.jsx
 */

import React from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import './mobile.css';

/**
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {Function} props.onBack - Back button handler (defaults to navigate(-1))
 * @param {React.ReactNode} props.rightAction - Right-side action element
 * @param {React.ReactNode} props.leftIcon - Custom left icon (defaults to back arrow)
 * @param {boolean} props.showBack - Whether to show back button (default: true)
 * @param {string} props.className
 */
export const MobileHeader = ({
  title,
  onBack,
  rightAction,
  leftIcon,
  showBack = true,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={clsx('mobile-header', className)}>
      <div className="mobile-header__left">
        {showBack && (
          <button
            className="mobile-header__icon-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            {leftIcon || (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="mobile-header__center">
        <h1 className="mobile-header__title">{title}</h1>
      </div>

      <div className="mobile-header__right">
        {rightAction}
      </div>
    </header>
  );
};

export default MobileHeader;
