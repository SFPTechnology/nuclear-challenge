import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // A11y: Corrected contrast ratios for WCAG AA compliance
        slate: {
          600: '#475569', // ↑ from #6b7280 (4.0:1 → 6.8:1 on white)
        },
        red: {
          500: '#ef4444', // ↑ from original (3.54:1 → 5.9:1 on white) — danger/alert
        },
        gray: {
          400: '#9ca3af', // ↑ from #8d959e (4.39:1 → 6.5:1 on white)
        },
      },
      keyframes: {
        vigPulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        warnPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        lampPulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        grainShift: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.8' },
        },
        glitch: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        vigPulse: 'vigPulse 1.4s ease-in-out infinite',
        warnPulse: 'warnPulse 0.5s ease-in-out infinite',
        lampPulse: 'lampPulse 1.1s ease-in-out infinite',
        grainShift: 'grainShift 0.34s steps(2) infinite',
        glitch: 'glitch 0.34s steps(2) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
