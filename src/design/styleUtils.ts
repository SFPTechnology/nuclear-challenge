/**
 * Style Utilities - Common Pattern Helpers
 *
 * Provides reusable style objects for common component patterns
 * to replace inline style={{}} blocks throughout the app.
 *
 * Usage: import { useTokenStyles } from './styleUtils';
 * Example: style={useTokenStyles.button('primary')}
 */

import { tokens } from './tokens';

/**
 * Style utility functions for common patterns
 */
export const useTokenStyles = {
  /**
   * Button Styles
   * @param variant - 'primary' | 'secondary' | 'danger'
   */
  button: (variant: 'primary' | 'secondary' | 'danger' = 'primary') => ({
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${tokens.transitions.base} ${tokens.transitions.easing.easeInOut}`,
    ...(variant === 'primary' && {
      backgroundColor: tokens.colors.primary,
      color: tokens.colors.bgPrimary,
    }),
    ...(variant === 'secondary' && {
      backgroundColor: tokens.colors.gray200,
      color: tokens.colors.textPrimary,
    }),
    ...(variant === 'danger' && {
      backgroundColor: tokens.colors.danger,
      color: tokens.colors.bgPrimary,
    }),
  }),

  /**
   * Text Styles
   * @param size - 'xs' | 'sm' | 'base' | 'lg' | 'xl'
   * @param weight - 'normal' | 'medium' | 'bold' | 'semibold'
   */
  text: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' = 'base', weight: 'normal' | 'medium' | 'bold' | 'semibold' = 'normal') => ({
    fontSize: tokens.typography.fontSize[size],
    lineHeight: tokens.typography.lineHeight.normal,
    color: tokens.colors.textPrimary,
    fontWeight: tokens.typography.fontWeight[weight],
  }),

  /**
   * Label Styles - For control labels and annotations
   * @param size - font size in pixels (6.5, 8, 9, etc.)
   * @param uppercase - whether to uppercase the text
   */
  label: (size: number = 9, uppercase: boolean = true) => ({
    fontSize: size,
    letterSpacing: '.16em',
    color: tokens.colors.label,
    textShadow: '0 1px 0 rgba(0,0,0,.9)',
    ...(uppercase && { textTransform: 'uppercase' as const }),
    fontWeight: tokens.typography.fontWeight.semibold,
  }),

  /**
   * LCD Display Styles
   * @param color - display color (default: cyan)
   */
  lcd: (color: string = tokens.colors.cyan) => ({
    background: tokens.colors.lcdGradient,
    boxShadow: tokens.shadows.inset,
    borderRadius: tokens.borderRadius.md,
    padding: `2px 6px`,
    fontSize: tokens.typography.fontSize.base,
    fontFamily: 'monospace',
    fontWeight: tokens.typography.fontWeight.bold,
    color,
    textShadow: `0 0 6px ${color}90`,
  }),

  /**
   * Lamp Indicator Styles
   * @param hue - 'red' | 'amber' | 'green'
   * @param isOn - whether the lamp is active
   */
  lamp: (hue: 'red' | 'amber' | 'green' = 'green', isOn: boolean = false) => {
    const colorMap = {
      red: tokens.colors.danger,
      amber: tokens.colors.warning,
      green: tokens.colors.success,
    };
    const color = colorMap[hue];

    return {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: tokens.spacing.xs,
      },
      indicator: {
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: isOn
          ? `radial-gradient(circle at 34% 30%,#ffffff99,${color} 42%,${color}bb 75%,#00000066)`
          : 'radial-gradient(circle at 34% 30%,#4b535c,#23282e 60%,#14181c)',
        boxShadow: isOn
          ? `0 0 9px ${color}, inset 0 -1px 2px rgba(0,0,0,.6)`
          : 'inset 0 -1px 2px rgba(0,0,0,.8)',
        border: '1px solid #12161a',
        animation: isOn ? 'lampPulse 1.1s ease-in-out infinite' : 'none',
      },
      label: {
        fontSize: '6.5px',
        color: isOn ? color : tokens.colors.gray500,
      },
    };
  },

  /**
   * Plate (Metallic Panel) Styles
   * @param glow - optional glow color
   */
  plate: (glow?: string) => ({
    position: 'relative' as const,
    borderRadius: tokens.borderRadius.md,
    background: tokens.colors.metalGradient,
    boxShadow: `${tokens.shadows.raised}${glow ? `, 0 0 14px ${glow}` : ''}`,
    border: tokens.borders.dark,
  }),

  /**
   * Screw decoration
   */
  screw: {
    position: 'absolute' as const,
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 32% 28%,#6b7480,#333940 60%,#191d21)',
    boxShadow: tokens.shadows.screwShine,
  },

  /**
   * Meltdown warning box
   */
  meltdown: {
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    background: tokens.colors.meltdownBg,
    border: tokens.borders.danger,
    borderRadius: tokens.borderRadius.md,
    boxShadow: tokens.shadows.meltdownGlow,
  },

  /**
   * Meltdown countdown text
   */
  meltdownCount: {
    fontSize: tokens.typography.fontSize['4xl'],
    color: tokens.colors.danger,
    fontWeight: tokens.typography.fontWeight.bold,
    fontFamily: 'monospace',
    textShadow: `0 0 12px ${tokens.colors.danger}`,
  },

  /**
   * Meltdown warning label
   */
  meltdownLabel: {
    fontSize: tokens.typography.fontSize.base,
    letterSpacing: tokens.typography.letterSpacing.wider,
    color: '#fecaca',
    fontWeight: tokens.typography.fontWeight.bold,
  },

  /**
   * Ambient glow overlay (base styles)
   */
  ambient: {
    position: 'fixed' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    zIndex: tokens.zIndex.ambient,
  },

  /**
   * Chart tooltip styles
   */
  tooltip: (bgColor: string = '#0a1418', borderColor: string = '#0891b2') => ({
    background: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.micro,
    color: tokens.colors.gray200,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
  }),

  /**
   * Chart axis label styles
   */
  axisLabel: {
    fontSize: tokens.typography.fontSize.micro,
    fill: tokens.colors.label,
  },

  /**
   * Flex container - row
   */
  flexRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: tokens.spacing.md,
  },

  /**
   * Flex container - column
   */
  flexCol: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    gap: tokens.spacing.md,
  },

  /**
   * Grid container - standard
   */
  grid: (columns: number = 2, gap: string = tokens.spacing.md) => ({
    display: 'grid' as const,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
  }),

  /**
   * Position utilities
   */
  position: {
    absolute: { position: 'absolute' as const },
    relative: { position: 'relative' as const },
    fixed: { position: 'fixed' as const },
    sticky: { position: 'sticky' as const },
  },

  /**
   * Visibility utilities
   */
  visibility: {
    hidden: { visibility: 'hidden' as const },
    visible: { visibility: 'visible' as const },
    invisible: { display: 'none' },
  },

  /**
   * Pointer utilities
   */
  pointer: {
    auto: { cursor: 'auto' },
    pointer: { cursor: 'pointer' },
    notAllowed: { cursor: 'not-allowed' },
    grab: { cursor: 'grab' },
  },
};

/**
 * Merge style objects safely
 */
export const mergeStyles = (...styles: (Record<string, any> | undefined)[]): Record<string, any> => {
  return styles.reduce<Record<string, any>>((acc, style) => {
    if (style) {
      Object.assign(acc, style);
    }
    return acc;
  }, {});
};

/**
 * Create a responsive style helper
 */
export const createResponsiveStyle = (mobile: Record<string, any>, tablet?: Record<string, any>, desktop?: Record<string, any>) => {
  // Note: For runtime responsiveness, use CSS media queries or Tailwind classes instead
  // This helper documents the pattern
  return {
    mobile,
    tablet: tablet || mobile,
    desktop: desktop || tablet || mobile,
  };
};

/**
 * Calculate dynamic color based on value (for gradients, status colors, etc.)
 */
export const getColorByValue = (value: number, min: number = 0, max: number = 100): string => {
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));

  if (percent < 0.33) {
    return tokens.colors.success; // Green
  } else if (percent < 0.66) {
    return tokens.colors.warning; // Amber
  } else {
    return tokens.colors.danger; // Red
  }
};

/**
 * Generate CSS Grid layout from token spacing
 */
export const createGridLayout = (columns: number, gap: keyof typeof tokens.spacing = 'md') => ({
  display: 'grid' as const,
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: tokens.spacing[gap],
});

/**
 * Create centering utilities
 */
export const centerContent = {
  flexCenter: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gridCenter: {
    display: 'grid' as const,
    placeItems: 'center' as const,
  },
};

export default useTokenStyles;
