/**
 * useIsMobile Hook
 * Responsive breakpoint detection hook using design system breakpoints
 * 
 * @file src/components/mobile/useIsMobile.js
 */

import { useState, useEffect, useCallback } from 'react';

// Design system breakpoints from src/Styles/variables.css
const BREAKPOINTS = {
  sm: 320,
  '2sm': 380,
  md: 768,
  lg: 960,
  xl: 1200,
};

/**
 * Hook to detect mobile viewport
 * Uses md breakpoint (768px) as the mobile/desktop threshold
 * 
 * @param {number} breakpoint - Custom breakpoint in px (default: 768)
 * @returns {{ isMobile: boolean, isTablet: boolean, isDesktop: boolean, width: number }}
 * 
 * @example
 * const { isMobile, isTablet } = useIsMobile();
 * if (isMobile) return <MobileView />;
 */
export const useIsMobile = (breakpoint = BREAKPOINTS.md) => {
  const getWidth = () =>
    typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.xl;

  const [width, setWidth] = useState(getWidth);

  const handleResize = useCallback(() => {
    setWidth(getWidth());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return {
    isMobile: width < breakpoint,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    width,
  };
};

export default useIsMobile;
