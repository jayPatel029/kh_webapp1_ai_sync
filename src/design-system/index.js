/**
 * Design System Index
 * Main entry point for the design system
 * 
 * @file src/design-system/index.js
 * 
 * @example
 * import { theme, colors, spacing } from './design-system';
 */

// Export all tokens
export {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  zIndices,
  transitions,
  breakpoints,
  breakpointValues,
  theme,
} from './tokens';

// Re-export theme as default
export { default } from './tokens';

/**
 * CSS Variables Import
 * 
 * Import the CSS to get all design system styles:
 * import './design-system/styles/index.css';
 * 
 * Or import individual style modules:
 * import './design-system/styles/variables.css';
 * import './design-system/styles/button.css';
 * import './design-system/styles/input.css';
 */
