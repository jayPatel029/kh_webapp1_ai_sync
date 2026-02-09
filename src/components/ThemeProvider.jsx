/**
 * Theme Provider Component
 * Provides theme context and utilities to the app
 * File: src/components/ThemeProvider.jsx
 */

import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { theme as designSystemTheme } from '../design-system';

/**
 * ThemeProvider Component
 * Wraps the app and provides theme context via Redux
 * Usage: <ThemeProvider><App /></ThemeProvider>
 */
export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { currentTheme, theme, customOverrides } = useSelector(
    (state) => state.theme || { currentTheme: 'light', theme: designSystemTheme, customOverrides: {} }
  );

  const themeContextValue = useMemo(
    () => ({
      currentTheme: currentTheme || 'light',
      theme: theme || designSystemTheme,
      customOverrides: customOverrides || {},
      dispatch,
    }),
    [currentTheme, theme, customOverrides, dispatch]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Theme Context
 * Access theme state from any component using useTheme hook
 */
export const ThemeContext = React.createContext({
  currentTheme: 'light',
  theme: designSystemTheme,
  customOverrides: {},
  dispatch: () => {},
});

/**
 * Hook to access theme context
 * @returns {Object} Theme context object with tokens and utilities
 */
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hook to access theme colors
 * @returns {Object} Colors object from current theme
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme?.colors || {};
};

/**
 * Hook to access theme typography
 * @returns {Object} Typography object from current theme
 */
export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme?.typography || {};
};

/**
 * Hook to access theme spacing
 * @returns {Object} Spacing object from current theme
 */
export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme?.spacing || {};
};

/**
 * Hook to get a specific color value
 * @param {string} colorName - Name of color token
 * @returns {string} Color value or null
 */
export const useColor = (colorName) => {
  const colors = useThemeColors();
  return colors[colorName] || null;
};

export default ThemeProvider;
