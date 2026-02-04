/**
 * Design Tokens Module
 * Exported from Figma design system
 * File: src/styles/tokens.js
 */

export const tokens = {
  colors: {
    primary: "#4164df",
    primaryDark: "#004c6d",
    accent: "#5886a5",
    link: "#6466f2",
    danger: "#de425b",
    success: "#00c008",
    warning: "#ff9800",
    info: "#00cccc",
    overlay: "rgba(234, 234, 234, 0.4)",
    text: "#393939",
    textMuted: "#989898",
    border: "#5886a5",
    borderLight: "#d9d9d9",
    divider: "#989898",
    background: "#ffffff",
    backgroundAlt: "#f5f5f5",
    surface: "#fafafa",
    surfaceAlt: "#efefef",
    error: "#ff5252",
    disabled: "#cccccc",
    placeholder: "#999999",
    black: "#000000",
  },
  fonts: {
    primary: "Sora",
    weights: {
      regular: 400,
      semiBold: 600,
      bold: 700,
    },
  },
  typography: {
    h1: {
      fontFamily: "Sora",
      fontWeight: 700,
      fontSize: "24px",
      lineHeight: "32px",
    },
    h2: {
      fontFamily: "Sora",
      fontWeight: 700,
      fontSize: "21px",
      lineHeight: "28px",
    },
    h3: {
      fontFamily: "Sora",
      fontWeight: 700,
      fontSize: "18px",
      lineHeight: "24px",
    },
    bodyLarge: {
      fontFamily: "Sora",
      fontWeight: 600,
      fontSize: "16px",
      lineHeight: "20px",
    },
    body: {
      fontFamily: "Sora",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "18px",
    },
    button: {
      fontFamily: "Sora",
      fontWeight: 600,
      fontSize: "16px",
      lineHeight: "20px",
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    s10: "10px",
    s15: "15px",
    s30: "30px",
    s42: "42px",
    s48: "48px",
    s50: "50px",
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    pill: "20px",
    round: "50%",
  },
  shadows: {
    shadow1: {
      offsetX: "2px",
      offsetY: "2px",
      blur: "4px",
      spread: "0px",
      color: "rgba(0,0,0,0.1)",
      type: "outset",
      css: "2px 2px 4px 0px rgba(0, 0, 0, 0.1)",
    },
    shadow2: {
      offsetX: "-2px",
      offsetY: "-2px",
      blur: "4px",
      spread: "0px",
      color: "rgba(0,0,0,0.05)",
      type: "inset",
      css: "inset -2px -2px 4px 0px rgba(0, 0, 0, 0.05)",
    },
  },
};

/**
 * Convenience getters for common token values
 */
export const getColor = (colorName) => tokens.colors[colorName] || null;

export const getTypography = (typographyName) =>
  tokens.typography[typographyName] || null;

export const getSpacing = (spacingName) =>
  tokens.spacing[spacingName] || null;

export const getRadius = (radiusName) => tokens.radii[radiusName] || null;

export const getShadow = (shadowName) => tokens.shadows[shadowName] || null;

/**
 * Convert typography token to CSS string
 * @param {string} typographyName - Key from typography object
 * @returns {string} CSS font properties
 */
export const typographyToCSS = (typographyName) => {
  const typography = getTypography(typographyName);
  if (!typography) return "";
  return `font-family: ${typography.fontFamily}; font-weight: ${typography.fontWeight}; font-size: ${typography.fontSize}; line-height: ${typography.lineHeight};`;
};

/**
 * Create a theme object for runtime usage
 * Useful for Redux store or theme context
 * @param {Object} overrides - Optional theme overrides
 * @returns {Object} Complete theme object
 */
export const createTheme = (overrides = {}) => {
  return {
    ...tokens,
    ...overrides,
  };
};

export default tokens;
