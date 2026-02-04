/**
 * Theme Slice - Redux Toolkit
 * Manages design tokens and theme state for runtime theming
 * File: src/redux/themeSlice.js
 */

import { createSlice } from '@reduxjs/toolkit';
import { tokens, createTheme } from '../Styles/tokens';

const initialState = {
  currentTheme: 'light',
  tokens: tokens,
  theme: createTheme(),
  customOverrides: {},
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Set the current theme
     * @param {Object} state - Redux state
     * @param {Object} action - Action with theme name payload
     */
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
    },

    /**
     * Override specific token values
     * @param {Object} state - Redux state
     * @param {Object} action - Action with overrides object
     */
    setTokenOverrides: (state, action) => {
      state.customOverrides = {
        ...state.customOverrides,
        ...action.payload,
      };
      state.theme = createTheme({
        ...state.customOverrides,
      });
    },

    /**
     * Reset overrides and return to default tokens
     * @param {Object} state - Redux state
     */
    resetTokens: (state) => {
      state.customOverrides = {};
      state.theme = createTheme();
    },

    /**
     * Update a specific color token
     * @param {Object} state - Redux state
     * @param {Object} action - Action with color name and value
     */
    updateColor: (state, action) => {
      const { colorName, value } = action.payload;
      state.customOverrides.colors = {
        ...state.customOverrides.colors,
        [colorName]: value,
      };
      state.theme = createTheme(state.customOverrides);
    },

    /**
     * Bulk update multiple color tokens
     * @param {Object} state - Redux state
     * @param {Object} action - Action with colors object
     */
    updateColors: (state, action) => {
      state.customOverrides.colors = {
        ...state.customOverrides.colors,
        ...action.payload,
      };
      state.theme = createTheme(state.customOverrides);
    },
  },
});

export const {
  setTheme,
  setTokenOverrides,
  resetTokens,
  updateColor,
  updateColors,
} = themeSlice.actions;

export default themeSlice.reducer;
