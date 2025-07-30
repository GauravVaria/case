// src/styles/colors.ts

export const COLORS = {
  // Primary Palette
  PRIMARY_DARK: '#0F3D5C',      // Deep Blue/Teal (from logo)
  PRIMARY_ACCENT: '#B89B5F',    // Gold/Tan (from logo)
  SECONDARY_ACCENT: '#5D7F9B',  // Muted Blue/Grayish-Blue
  LIGHT_BACKGROUND: '#F8F5F0',  // Off-white/Cream
  DARK_TEXT: '#0F3D5C',         // Use primary dark for main text on light backgrounds
  LIGHT_TEXT: '#F8F5F0',        // Use light background for text on dark backgrounds

  // Status/Action Colors
  SUCCESS: '#6CCF81',          // Green for success/paid
  DANGER: '#E57373',           // Red for danger/unpaid/remove
  WARNING: '#FFB300',          // Orange/Yellow for warnings/edits
  INFO: '#5D7F9B',             // Info color, can reuse secondary accent
  NEUTRAL_DARK: '#2C2F3A',     // Dark gray for general backgrounds/divs - Used for main borders
  NEUTRAL_MEDIUM: '#4A4F5B',   // Medium gray for input borders/separators
  NEUTRAL_LIGHT: '#6C757D',    // Lighter gray for subtle elements

  // Shadow Colors (add these back)
  SHADOW_COLOR: 'rgba(0, 0, 0, 0.15)', // A light black for subtle shadows
  SHADOW_DARK: 'rgba(0, 0, 0, 0.3)',   // A darker shadow for more depth
};