/**
 * Design System Tokens Index
 * JavaScript export of design tokens for use in JS/React components
 * 
 * @file src/design-system/tokens/index.js
 * 
 * @example
 * import { colors, spacing, typography } from './design-system/tokens';
 */

// ==================== COLORS ====================
export const colors = {
  // Primary/Brand
  primary: {
    DEFAULT: 'var(--color-primary)',
    dark: 'var(--color-primary-dark)',
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    300: 'var(--color-primary-300)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    800: 'var(--color-primary-800)',
    900: 'var(--color-primary-900)',
  },
  
  accent: 'var(--color-accent)',
  link: 'var(--color-link)',
  
  // Semantic
  success: {
    DEFAULT: 'var(--color-success)',
    light: 'var(--color-success-light)',
    dark: 'var(--color-success-dark)',
  },
  warning: {
    DEFAULT: 'var(--color-warning)',
    light: 'var(--color-warning-light)',
    dark: 'var(--color-warning-dark)',
  },
  danger: {
    DEFAULT: 'var(--color-danger)',
    light: 'var(--color-danger-light)',
    dark: 'var(--color-danger-dark)',
  },
  error: {
    DEFAULT: 'var(--color-error)',
    light: 'var(--color-error-light)',
  },
  info: {
    DEFAULT: 'var(--color-info)',
    light: 'var(--color-info-light)',
    dark: 'var(--color-info-dark)',
  },
  
  // Text
  text: {
    DEFAULT: 'var(--color-text)',
    muted: 'var(--color-text-muted)',
    secondary: 'var(--color-text-secondary)',
    inverse: 'var(--color-text-inverse)',
  },
  
  // Background
  background: {
    DEFAULT: 'var(--color-background)',
    alt: 'var(--color-background-alt)',
  },
  surface: {
    DEFAULT: 'var(--color-surface)',
    alt: 'var(--color-surface-alt)',
  },
  
  // Border
  border: {
    DEFAULT: 'var(--color-border)',
    light: 'var(--color-border-light)',
    input: 'var(--color-border-input)',
    focus: 'var(--color-border-focus)',
  },
  
  // Grayscale
  gray: {
    50: 'var(--color-gray-50)',
    100: 'var(--color-gray-100)',
    200: 'var(--color-gray-200)',
    300: 'var(--color-gray-300)',
    400: 'var(--color-gray-400)',
    500: 'var(--color-gray-500)',
    600: 'var(--color-gray-600)',
    700: 'var(--color-gray-700)',
    800: 'var(--color-gray-800)',
    900: 'var(--color-gray-900)',
  },
  
  // Navy
  navy: {
    50: 'var(--color-navy-50)',
    100: 'var(--color-navy-100)',
    200: 'var(--color-navy-200)',
    300: 'var(--color-navy-300)',
    400: 'var(--color-navy-400)',
    500: 'var(--color-navy-500)',
    600: 'var(--color-navy-600)',
    700: 'var(--color-navy-700)',
    800: 'var(--color-navy-800)',
    900: 'var(--color-navy-900)',
  },
  
  // Pure
  white: 'var(--color-white)',
  black: 'var(--color-black)',
  transparent: 'var(--color-transparent)',
};

// ==================== TYPOGRAPHY ====================
export const typography = {
  fonts: {
    primary: 'var(--font-primary)',
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
    mono: 'var(--font-mono)',
  },
  
  fontSizes: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    md: 'var(--font-size-md)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
    '5xl': 'var(--font-size-5xl)',
    '6xl': 'var(--font-size-6xl)',
  },
  
  fontWeights: {
    light: 'var(--font-weight-light)',
    regular: 'var(--font-weight-regular)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
    extrabold: 'var(--font-weight-extrabold)',
  },
  
  lineHeights: {
    none: 'var(--line-height-none)',
    tight: 'var(--line-height-tight)',
    snug: 'var(--line-height-snug)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
    loose: 'var(--line-height-loose)',
  },
  
  letterSpacings: {
    tighter: 'var(--letter-spacing-tighter)',
    tight: 'var(--letter-spacing-tight)',
    normal: 'var(--letter-spacing-normal)',
    wide: 'var(--letter-spacing-wide)',
    wider: 'var(--letter-spacing-wider)',
    widest: 'var(--letter-spacing-widest)',
  },
};

// ==================== SPACING ====================
export const spacing = {
  px: 'var(--space-px)',
  0: 'var(--space-0)',
  0.5: 'var(--space-0-5)',
  1: 'var(--space-1)',
  1.5: 'var(--space-1-5)',
  2: 'var(--space-2)',
  2.5: 'var(--space-2-5)',
  3: 'var(--space-3)',
  3.5: 'var(--space-3-5)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  7: 'var(--space-7)',
  8: 'var(--space-8)',
  9: 'var(--space-9)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  14: 'var(--space-14)',
  16: 'var(--space-16)',
  20: 'var(--space-20)',
  24: 'var(--space-24)',
  // Semantic
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
  xxl: 'var(--space-xxl)',
};

// ==================== RADII ====================
export const radii = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  base: 'var(--radius-base)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  '3xl': 'var(--radius-3xl)',
  full: 'var(--radius-full)',
  pill: 'var(--radius-pill)',
};

// ==================== SHADOWS ====================
export const shadows = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  base: 'var(--shadow-base)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  inner: 'var(--shadow-inner)',
  outline: 'var(--shadow-outline)',
  none: 'var(--shadow-none)',
  button: 'var(--shadow-button)',
  card: 'var(--shadow-card)',
  cardHover: 'var(--shadow-card-hover)',
};

// ==================== Z-INDEX ====================
export const zIndices = {
  hide: 'var(--z-hide)',
  auto: 'var(--z-auto)',
  base: 'var(--z-base)',
  docked: 'var(--z-docked)',
  dropdown: 'var(--z-dropdown)',
  sticky: 'var(--z-sticky)',
  banner: 'var(--z-banner)',
  overlay: 'var(--z-overlay)',
  modal: 'var(--z-modal)',
  popover: 'var(--z-popover)',
  toast: 'var(--z-toast)',
  tooltip: 'var(--z-tooltip)',
};

// ==================== TRANSITIONS ====================
export const transitions = {
  property: {
    common: 'var(--transition-property-common)',
    colors: 'var(--transition-property-colors)',
    dimensions: 'var(--transition-property-dimensions)',
    position: 'var(--transition-property-position)',
    background: 'var(--transition-property-background)',
  },
  duration: {
    ultraFast: 'var(--transition-duration-ultra-fast)',
    faster: 'var(--transition-duration-faster)',
    fast: 'var(--transition-duration-fast)',
    normal: 'var(--transition-duration-normal)',
    slow: 'var(--transition-duration-slow)',
    slower: 'var(--transition-duration-slower)',
    ultraSlow: 'var(--transition-duration-ultra-slow)',
  },
  easing: {
    easeIn: 'var(--transition-easing-ease-in)',
    easeOut: 'var(--transition-easing-ease-out)',
    easeInOut: 'var(--transition-easing-ease-in-out)',
  },
};

// ==================== BREAKPOINTS ====================
export const breakpoints = {
  sm: 'var(--breakpoint-sm)',
  '2sm': 'var(--breakpoint-2sm)',
  md: 'var(--breakpoint-md)',
  lg: 'var(--breakpoint-lg)',
  xl: 'var(--breakpoint-xl)',
  '2xl': 'var(--breakpoint-2xl)',
  '3xl': 'var(--breakpoint-3xl)',
};

// Breakpoint values for JS comparisons
export const breakpointValues = {
  sm: 320,
  '2sm': 380,
  md: 768,
  lg: 960,
  xl: 1200,
  '2xl': 1600,
  '3xl': 1920,
};

// ==================== COMPLETE THEME OBJECT ====================
export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  zIndices,
  transitions,
  breakpoints,
  breakpointValues,
};

export default theme;
