# Design Tokens Integration Guide

## Overview

The design tokens have been successfully integrated into the kifayti-webapp1 project across three implementation patterns:

1. **CSS Variables** - For styling in CSS/SCSS files
2. **JavaScript Module** - For programmatic access in React components
3. **Redux Store** - For runtime theming and dynamic color changes

---

## 1. CSS Variables Integration

### File: `src/Styles/variables.css`

All design tokens are exported as CSS custom properties (variables) under the `:root` selector.

#### Usage in CSS/SCSS:

```css
/* In your component CSS */
.button {
  background-color: var(--color-primary);
  color: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-1);
}

.heading {
  font-family: var(--font-primary);
  font-size: var(--typography-h1-font-size);
  font-weight: var(--typography-h1-font-weight);
  line-height: var(--typography-h1-line-height);
}
```

#### Available Variables:

- **Colors** (22 tokens): `--color-primary`, `--color-primary-dark`, `--color-accent`, etc.
- **Typography**: `--typography-h1-font-size`, `--typography-body-large-font-weight`, etc.
- **Spacing** (12 tokens): `--spacing-xs` through `--spacing-xxl`, `--spacing-10`, etc.
- **Radii**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--radius-round`
- **Shadows**: `--shadow-1`, `--shadow-2`

#### Typography Classes:

Utility classes are provided for quick typography application:

```html
<h1 class="typography-h1">Large Heading</h1>
<p class="typography-body">Regular paragraph text</p>
<button class="typography-button">Button Text</button>
```

---

## 2. JavaScript Module Integration

### File: `src/styles/tokens.js`

Export the tokens as a JavaScript object for programmatic access.

#### Basic Usage:

```javascript
import { tokens, getColor, getTypography } from '../styles/tokens';

// Access tokens directly
console.log(tokens.colors.primary); // "#4164df"
console.log(tokens.typography.h1); // { fontFamily: "Sora", ... }

// Use convenience functions
const primaryColor = getColor('primary'); // "#4164df"
const bodyTypography = getTypography('body'); // { fontFamily: "Sora", ... }
const paddingLarge = getSpacing('lg'); // "16px"
const radius = getRadius('md'); // "8px"
```

#### In React Components (Inline Styles):

```jsx
import { tokens, getColor } from '../styles/tokens';

function Button({ children }) {
  const buttonStyle = {
    backgroundColor: getColor('primary'),
    color: getColor('background'),
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    fontFamily: tokens.fonts.primary,
    fontWeight: tokens.fonts.weights.semiBold,
  };

  return <button style={buttonStyle}>{children}</button>;
}
```

#### Typography Helper:

```javascript
import { typographyToCSS } from '../styles/tokens';

const h1Style = typographyToCSS('h1');
// Returns: "font-family: Sora; font-weight: 700; font-size: 24px; line-height: 32px;"
```

---

## 3. Redux Store Integration

### Files:
- `src/redux/themeSlice.js` - Redux slice for theme state
- `src/app/store.js` - Updated store configuration

### Theme Store Structure:

```javascript
{
  theme: {
    currentTheme: 'light',
    tokens: { /* all design tokens */ },
    theme: { /* current theme with any overrides */ },
    customOverrides: {} /* any custom color overrides */
  }
}
```

### Redux Actions Available:

```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  setTheme,
  setTokenOverrides,
  resetTokens,
  updateColor,
  updateColors,
} from '../redux/themeSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { currentTheme, theme } = useSelector((state) => state.theme);

  // Update a single color
  const handleThemeChange = () => {
    dispatch(updateColor({
      colorName: 'primary',
      value: '#FF0000',
    }));
  };

  // Bulk update multiple colors
  const handleBrandingChange = () => {
    dispatch(updateColors({
      primary: '#1a73e8',
      primaryDark: '#0d47a1',
      accent: '#1e88e5',
    }));
  };

  // Reset to default tokens
  const handleReset = () => {
    dispatch(resetTokens());
  };

  return (
    <div style={{ color: theme.colors.text }}>
      Current theme: {currentTheme}
    </div>
  );
}
```

---

## 4. Theme Provider Component

### File: `src/components/ThemeProvider.jsx`

Provides React context for easy theme access throughout the app.

### Setup (in index.js or App wrapper):

```jsx
import { Provider } from 'react-redux';
import { ThemeProvider } from './components/ThemeProvider';
import store from './app/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>
);
```

### Available Hooks:

#### `useTheme()`
Access the complete theme object:

```jsx
import { useTheme } from '../components/ThemeProvider';

function Card() {
  const { theme, currentTheme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    }}>
      Content
    </div>
  );
}
```

#### `useThemeColors()`
Quick access to colors only:

```jsx
import { useThemeColors } from '../components/ThemeProvider';

function Badge({ status }) {
  const colors = useThemeColors();
  
  const bgColor = status === 'success' ? colors.success : colors.danger;
  
  return <span style={{ backgroundColor: bgColor }}>Status</span>;
}
```

#### `useColor(colorName)`
Get a specific color value:

```jsx
import { useColor } from '../components/ThemeProvider';

function Icon() {
  const primaryColor = useColor('primary');
  
  return <svg fill={primaryColor} />;
}
```

#### `useThemeTypography()` & `useThemeSpacing()`
Similar pattern for typography and spacing:

```jsx
import { useThemeTypography, useThemeSpacing } from '../components/ThemeProvider';

function Section() {
  const typography = useThemeTypography();
  const spacing = useThemeSpacing();
  
  return (
    <div style={{
      padding: spacing.lg,
      fontSize: typography.body.fontSize,
    }}>
      Content
    </div>
  );
}
```

---

## 5. Color Tokens Reference

All 22 colors are available across all three integration methods:

| Token | Value | Use Case |
|-------|-------|----------|
| `primary` | #4164df | Primary actions, brand color |
| `primaryDark` | #004c6d | Navigation, sidebar backgrounds |
| `accent` | #5886a5 | Secondary UI, table headers |
| `link` | #6466f2 | Hyperlinks, clickable text |
| `danger` | #de425b | Delete, cancel, error states |
| `success` | #00c008 | Approval, positive actions |
| `warning` | #ff9800 | Warnings, caution states |
| `info` | #00cccc | Information, alerts |
| `overlay` | rgba(234,234,234,0.4) | Overlays, modals |
| `text` | #393939 | Primary text color |
| `textMuted` | #989898 | Disabled, muted text |
| `border` | #5886a5 | Borders, dividers |
| `borderLight` | #d9d9d9 | Light borders |
| `divider` | #989898 | Divider lines |
| `background` | #ffffff | Main background |
| `backgroundAlt` | #f5f5f5 | Alternative background |
| `surface` | #fafafa | Surface, card backgrounds |
| `surfaceAlt` | #efefef | Alternative surface |
| `error` | #ff5252 | Error states |
| `disabled` | #cccccc | Disabled elements |
| `placeholder` | #999999 | Placeholder text |
| `black` | #000000 | Black text, strong contrast |

---

## 6. Typography Scale

6 predefined typography styles using the Sora font family:

```javascript
h1:     24px, 700 bold,  32px line-height
h2:     21px, 700 bold,  28px line-height
h3:     18px, 700 bold,  24px line-height
bodyLarge: 16px, 600 semiBold, 20px line-height
body:   14px, 400 regular, 18px line-height
button: 16px, 600 semiBold, 20px line-height
```

---

## 7. Spacing System

12 spacing values for padding, margin, gap:

```javascript
xs: 4px       md: 12px      xl: 20px
sm: 8px       lg: 16px      xxl: 24px
s-10: 10px    s-30: 30px    s-48: 48px
s-15: 15px    s-42: 42px    s-50: 50px
```

---

## 8. Best Practices

### ✅ DO:

1. **Use CSS variables for static styling**: Good for CSS files, performance
2. **Use JS module for component logic**: Useful when styling depends on state
3. **Use hooks for dynamic themes**: Best practice for React components
4. **Centralize color choices**: Always use token names, never hardcode colors
5. **Override via Redux**: Only use custom color overrides, keep base tokens unchanged

### ❌ DON'T:

1. **Hardcode color values**: `color: "#4164df"` ❌ → Use `getColor('primary')` ✅
2. **Duplicate token values**: Create a token once, import everywhere
3. **Create custom colors**: Use existing palette unless brand change is needed
4. **Mix integration methods unnecessarily**: Pick one pattern per feature

---

## 9. Runtime Theming Example

Switch theme at runtime:

```jsx
import { useDispatch } from 'react-redux';
import { updateColors } from '../redux/themeSlice';

function ThemeSwitcher() {
  const dispatch = useDispatch();

  const applyLightTheme = () => {
    dispatch(updateColors({
      background: '#ffffff',
      text: '#393939',
    }));
  };

  const applyDarkTheme = () => {
    dispatch(updateColors({
      background: '#1a1a1a',
      text: '#ffffff',
    }));
  };

  return (
    <>
      <button onClick={applyLightTheme}>Light Theme</button>
      <button onClick={applyDarkTheme}>Dark Theme</button>
    </>
  );
}
```

---

## 10. Migration from Hardcoded Colors

Find and replace patterns:

```javascript
// Before
const buttonStyle = { backgroundColor: '#4164df' };

// After
import { getColor } from '../styles/tokens';
const buttonStyle = { backgroundColor: getColor('primary') };
```

Or use CSS variables:

```css
/* Before */
.button { background-color: #4164df; }

/* After */
.button { background-color: var(--color-primary); }
```

---

## 11. Files Created/Modified

**New Files:**
- ✅ `src/design-tokens.json` - Source token definitions
- ✅ `src/Styles/variables.css` - CSS variables export
- ✅ `src/styles/tokens.js` - JavaScript module export
- ✅ `src/redux/themeSlice.js` - Redux theme state management
- ✅ `src/components/ThemeProvider.jsx` - React context provider and hooks

**Modified Files:**
- ✅ `src/app/store.js` - Added themeSlice reducer
- ✅ `src/App.js` - Imported variables.css

---

## 12. Next Steps

1. **Import variables.css** in global styles (already done in App.js)
2. **Wrap app with ThemeProvider** (optional, for React context usage)
3. **Start using tokens in components**:
   - CSS files: Use `var(--color-primary)` etc.
   - React: Import `tokens` or use `useTheme()` hook
4. **Update existing hardcoded colors** to use token references
5. **Test runtime theming** with Redux actions

---

## 13. Figma Sync

These tokens were extracted from 11 Figma design nodes:
- 55:655, 69:1524, 51:245, 49:135 (Dashboard & Patient Pages)
- 113:990, 113:886, 111:722 (Approval & Alerts)
- 71:2043, 71:2179, 71:2045, 71:2128 (Form & Upload Modals)

To sync with Figma updates, regenerate tokens from design context and update `design-tokens.json`.

---

## Questions or Issues?

Refer to individual file headers for specific implementation details.
