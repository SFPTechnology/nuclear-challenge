/**
 * Design System - Centralized Design Tokens
 *
 * All colors, spacing, typography, and UI elements are defined here.
 * Usage: import { tokens } from './tokens';
 * Example: style={{ color: tokens.colors.primary }}
 */

export const tokens = {
  // ============================================================================
  // COLORS - Complete Palette
  // ============================================================================
  colors: {
    // Primary - Blue
    primary: '#3b82f6',        // Main brand color
    primaryLight: '#60a5fa',   // Light variant
    primaryDark: '#1e40af',    // Dark variant

    // Semantic - Status Colors (WCAG AA compliant - 4.5:1 contrast on dark backgrounds)
    success: '#22c55e',        // Green - Success/OK (improved contrast)
    warning: '#f59e0b',        // Amber - Warning/Caution
    danger: '#dc2626',         // Red - Error/Critical (darker for 4.5:1 contrast)
    info: '#3b82f6',           // Blue - Information

    // Cyan/Turquoise - UI Accents
    cyan: '#06b6d4',           // Light cyan accent
    cyanDark: '#0891b2',       // Dark cyan
    turquoise: '#2dd4bf',      // Turquoise accent
    teal: '#14b8a6',           // Teal accent

    // Amber/Gold - Warning variants
    amber: '#f59e0b',          // Primary amber
    amberLight: '#fcd34d',     // Light amber
    amberDark: '#d97706',      // Dark amber

    // Lime - Chart accent
    lime: '#a3e635',           // Lime green

    // Indigo - Secondary
    indigo: '#818cf8',         // Indigo blue
    indigoLight: '#a5b4fc',    // Light indigo

    // Pink - Accent
    pink: '#f472b6',           // Pink
    fuchsia: '#e879f9',        // Fuchsia

    // Orange - Variant
    orange: '#fb923c',         // Orange

    // Neutral - Grays
    gray50: '#f9fafb',         // Lightest gray
    gray100: '#f3f4f6',        // Very light gray
    gray200: '#e5e7eb',        // Light gray
    gray300: '#d1d5db',        // Gray
    gray400: '#9ca3af',        // Medium gray
    gray500: '#6b7280',        // Gray
    gray600: '#4b5563',        // Dark gray
    gray700: '#374151',        // Darker gray
    gray800: '#1f2937',        // Very dark gray
    gray900: '#111827',        // Darkest gray

    // Text Colors (WCAG AA compliant for readability)
    textPrimary: '#111827',    // Primary text (dark)
    textSecondary: '#4b5563',  // Secondary text (darker gray for 4.5:1 contrast)
    textTertiary: '#6b7280',   // Tertiary text (medium gray)
    textInverse: '#ffffff',    // Text on dark backgrounds

    // Background Colors
    bgPrimary: '#ffffff',      // Primary background
    bgSecondary: '#f9fafb',    // Secondary background
    bgTertiary: '#f3f4f6',     // Tertiary background
    bgDark: '#0a1418',         // Dark background
    bgDarker: '#050b0e',       // Darker background

    // UI-specific colors
    metalGradient: 'linear-gradient(160deg,#3a4149 0%,#2b3138 40%,#22272d 70%,#2e343b 100%)',
    bezelGradient: 'linear-gradient(145deg,#4a525b 0%,#2a2f35 45%,#1c2126 100%)',
    glassGradient: 'linear-gradient(160deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 34%,transparent 55%)',
    lcdGradient: 'linear-gradient(180deg,#0a1418,#050b0e)',
    meltdownBg: 'linear-gradient(180deg,#450a0a,#1a0505)',

    // Accent labels
    label: '#8d959e',          // Label text color
  },

  // ============================================================================
  // SPACING - 8px Base Grid System
  // ============================================================================
  spacing: {
    xs: '0.25rem',             // 4px
    sm: '0.5rem',              // 8px
    md: '1rem',                // 16px
    lg: '1.5rem',              // 24px
    xl: '2rem',                // 32px
    '2xl': '2.5rem',           // 40px
    '3xl': '3rem',             // 48px
    '4xl': '3.5rem',           // 56px
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    // Font Sizes (all in rem, base 16px)
    fontSize: {
      xs: '0.75rem',           // 12px
      sm: '0.875rem',          // 14px
      base: '1rem',            // 16px
      lg: '1.125rem',          // 18px
      xl: '1.25rem',           // 20px
      '2xl': '1.5rem',         // 24px
      '3xl': '1.875rem',       // 30px
      '4xl': '2.25rem',        // 36px
      '5xl': '3rem',           // 48px
      // Smaller sizes for specialized UI
      tiny: '0.625rem',        // 10px
      micro: '0.5rem',         // 8px
      mini: '6.5px',           // 6.5px (for labels)
    },

    // Font Weight
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Height
    lineHeight: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    // Letter Spacing
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '.16em',           // Standard label spacing
      wider: '.18em',          // Wider label spacing
      widest: '.25em',         // Widest label spacing
    },

    // Text Shadow
    textShadow: {
      none: 'none',
      sm: '0 1px 0 rgba(0,0,0,.9)',
      md: '0 0 12px rgba(239,68,68)',
      glow: '0 0 6px ',        // Base for glow effects
    },
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    none: '0',
    sm: '0.125rem',            // 2px
    md: '0.375rem',            // 6px
    lg: '0.5rem',              // 8px
    xl: '0.75rem',             // 12px
    '2xl': '1rem',             // 16px
    full: '9999px',            // Circular
  },

  // ============================================================================
  // SHADOWS
  // ============================================================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',

    // Specialized shadows for UI
    inset: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
    raised: '0 1px 0 rgba(255,255,255,.09), 0 3px 6px rgba(0,0,0,.6)',
    screwShine: 'inset 0 -1px 1px rgba(0,0,0,.7)',
    lampOn: 'inset 0 -1px 2px rgba(0,0,0,.6)',
    lampOff: 'inset 0 -1px 2px rgba(0,0,0,.8)',
    glitch: 'box-shadow: 0 0 9px, inset 0 -1px 2px rgba(0,0,0,.6)',
    meltdownGlow: '0 0 26px rgba(239,68,68,.75)',
  },

  // ============================================================================
  // BORDERS
  // ============================================================================
  borders: {
    sm: '1px',
    md: '2px',
    lg: '3px',

    // Common border colors
    dark: '1px solid #171b1f',
    lightGray: '1px solid #d1d5db',
    danger: '2px solid #ef4444',
    amber: '2px solid #f59e0b',
  },

  // ============================================================================
  // Z-INDEX SYSTEM
  // ============================================================================
  zIndex: {
    hidden: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 20,
    sticky: 30,
    overlay: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    notification: 80,
    ambient: 40,
    warning: 45,
  },

  // ============================================================================
  // TRANSITIONS & ANIMATIONS
  // ============================================================================
  transitions: {
    fast: '0.15s',
    base: '0.2s',
    slow: '0.3s',
    slower: '0.5s',
    slowest: '1s',

    // Common easing functions
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
  },

  // ============================================================================
  // OPACITY
  // ============================================================================
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    62: '0.62',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    85: '0.85',
    90: '0.9',
    95: '0.95',
    100: '1',
  },

  // ============================================================================
  // BREAKPOINTS - Responsive Design
  // ============================================================================
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================================================
  // PRESETS - Common Component Styles
  // ============================================================================
  presets: {
    // Plate (metallic panel)
    plate: {
      background: 'linear-gradient(160deg,#3a4149 0%,#2b3138 40%,#22272d 70%,#2e343b 100%)',
      border: '1px solid #171b1f',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 0 rgba(255,255,255,.09), 0 3px 6px rgba(0,0,0,.6)',
    },

    // LCD Display
    lcd: {
      background: 'linear-gradient(180deg,#0a1418,#050b0e)',
      boxShadow: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
      borderRadius: '0.375rem',
      padding: '2px 6px',
    },

    // Meltdown warning
    meltdown: {
      background: 'linear-gradient(180deg,#450a0a,#1a0505)',
      border: '2px solid #ef4444',
      borderRadius: '0.375rem',
      boxShadow: '0 0 26px rgba(239,68,68,.75)',
      padding: '10px 20px',
    },
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type ColorKeys = keyof typeof tokens.colors;
export type SpacingKeys = keyof typeof tokens.spacing;
export type FontSizeKeys = keyof typeof tokens.typography.fontSize;
export type BorderRadiusKeys = keyof typeof tokens.borderRadius;
export type ShadowKeys = keyof typeof tokens.shadows;
export type ZIndexKeys = keyof typeof tokens.zIndex;
export type TokenKeys = keyof typeof tokens;
