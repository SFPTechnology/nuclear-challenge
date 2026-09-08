# Design System - Component Variants & Usage Guide

**Last Updated:** 2026-09-07  
**Design System Version:** 1.0  
**Status:** Complete  

---

## Overview

This document describes all reusable component variants and their token-based styling. Every component uses the centralized design system defined in `tokens.ts` and style utilities from `styleUtils.ts`.

---

## Core Components

### 1. Button Component

**Purpose:** Call-to-action elements with multiple visual states

**Variants:**

#### Primary Button
- **Usage:** Main actions, submissions
- **Background:** tokens.colors.primary
- **Text Color:** tokens.colors.bgPrimary
- **Padding:** tokens.spacing.sm + tokens.spacing.md
- **Border Radius:** tokens.borderRadius.md

```typescript
style={useTokenStyles.button('primary')}
```

#### Secondary Button
- **Usage:** Alternative actions
- **Background:** tokens.colors.gray200
- **Text Color:** tokens.colors.textPrimary
- **Padding:** tokens.spacing.sm + tokens.spacing.md

```typescript
style={useTokenStyles.button('secondary')}
```

#### Danger Button
- **Usage:** Destructive actions, warnings
- **Background:** tokens.colors.danger
- **Text Color:** tokens.colors.bgPrimary
- **Padding:** tokens.spacing.sm + tokens.spacing.md

```typescript
style={useTokenStyles.button('danger')}
```

#### Disabled State
- **Opacity:** 60%
- **Cursor:** not-allowed
- **Background:** tokens.colors.gray400

---

### 2. Text Component

**Purpose:** Semantic typography with consistent styling

**Sizes:**

| Size | Value (rem) | Usage |
|------|-----------|-------|
| xs | 0.75 | Fine print, captions |
| sm | 0.875 | Secondary text |
| base | 1 | Body text |
| lg | 1.125 | Subheadings |
| xl | 1.25 | Headings |

**Weights:**

| Weight | Value | Usage |
|--------|-------|-------|
| normal | 400 | Body text |
| medium | 500 | Emphasis |
| semibold | 600 | Subheadings |
| bold | 700 | Headings, labels |

**Color:**
- Default: tokens.colors.textPrimary
- Secondary: tokens.colors.textSecondary
- Light: tokens.colors.textTertiary
- Inverse: tokens.colors.textInverse

```typescript
// Example usage
style={useTokenStyles.text('lg', 'bold')}
// Result: 1.125rem, 700 weight, primary text color
```

---

### 3. Label Component

**Purpose:** Control labels and annotations

**Characteristics:**
- Font Size: 6-9px (customizable)
- Weight: semibold
- Letter Spacing: .16em (wide)
- Color: tokens.colors.label (#8d959e)
- Text Shadow: 0 1px 0 rgba(0,0,0,.9)
- Text Transform: uppercase (optional)

```typescript
style={useTokenStyles.label(9, true)} // size=9, uppercase=true
```

**Variants:**

| Size | Usage | Font Size |
|------|-------|-----------|
| 6 | Tiny labels | 6px |
| 6.5 | Lamp labels | 6.5px |
| 7 | Small controls | 7px |
| 8 | Button labels | 8px |
| 9 | Standard labels | 9px |

---

### 4. LCD Display Component

**Purpose:** Digital readout elements for numeric data

**Characteristics:**
- Background: tokens.colors.lcdGradient
- Box Shadow: tokens.shadows.inset
- Border Radius: tokens.borderRadius.md
- Padding: 2px 6px
- Font: monospace, bold
- Glow Effect: 0 0 6px {color}90

**Colors (glow effects):**

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | #7dd3fc | Default/normal |
| Amber | #f59e0b | Warning |
| Red | #ef4444 | Critical |
| Green | #22c55e | Success |

```typescript
style={useTokenStyles.lcd(tokens.colors.cyan)}
// Produces LCD with cyan glow effect
```

---

### 5. Lamp (Status Indicator) Component

**Purpose:** Visual status indicators (on/off, alert levels)

**Characteristics:**
- Size: 12×12 px
- Border Radius: 50% (circular)
- Border: 1px solid #12161a
- Animation: lampPulse (1.1s) when active

**Hue Variants:**

| Hue | Color | Hex | Usage |
|-----|-------|-----|-------|
| red | Danger | #ef4444 | Critical status |
| amber | Warning | #f59e0b | Caution/attention |
| green | Success | #22c55e | Normal/OK |

**States:**

| State | Background | Box Shadow | Animation |
|-------|-----------|-----------|-----------|
| On | radial-gradient (lit) | Bright glow | lampPulse |
| Off | radial-gradient (dark) | inset only | none |

```typescript
// Lamp with label
const lampStyles = useTokenStyles.lamp('amber', isWarning)
// Returns: { container, indicator, label }
```

---

### 6. Plate (Metallic Panel) Component

**Purpose:** Elevated panel containers with 3D metallic effect

**Characteristics:**
- Background: tokens.colors.metalGradient
- Box Shadow: tokens.shadows.raised (base) + optional glow
- Border: 1px solid #171b1f
- Border Radius: tokens.borderRadius.md
- Decorations: 4 screws (top-left, top-right, bottom-left, bottom-right)
- Glass overlay: tokens.colors.glassGradient
- Brush texture: repeating-linear-gradient

**Glow Effects:**

| State | Glow Color | Usage |
|-------|-----------|-------|
| none | none | Normal |
| danger | rgba(239,68,68,.35) | Critical |
| warning | rgba(245,158,11,.28) | Warning |
| info | rgba(6,182,212,.35) | Information |

```typescript
style={useTokenStyles.plate('rgba(6,182,212,.35)')}
```

---

### 7. Gauge Component

**Purpose:** Analog display for continuous values

**Characteristics:**
- Bezel Background: tokens.colors.bezelGradient
- Gauge Face: radial-gradient (dark)
- Scale Lines: 12 major, 24 minor
- Needle: White (#f4f4f5) with gray counter-weight
- Display Text: Monospace, bold
- Values: Temperature range 280–700°C

**Color Zones:**

| Temp Range | Color | Hex | Zone |
|-----------|-------|-----|------|
| 280–400 | Green | #34d399 | Safe |
| 400–620 | Amber | #f59e0b | Caution |
| 620–700 | Red | #ef4444 | Danger |
| Frozen | Cyan | #38bdf8 | Frozen |

---

### 8. Chart Component

**Purpose:** Data visualization (bar, radar, line charts)

**Tooltip Style:**
- Background: #0a1418
- Border: 1px solid #0891b2
- Border Radius: 4px
- Font Size: 10px
- Color: #cbd5e1

```typescript
style={useTokenStyles.tooltip('#0a1418', '#0891b2')}
```

**Axis Label Style:**
- Font Size: 8px
- Color: #8d959e
- Font Weight: normal

```typescript
style={useTokenStyles.axisLabel}
```

**Chart Colors (series):**

| Index | Color | Hex | Usage |
|-------|-------|-----|-------|
| 0 | Cyan | #06b6d4 | Primary |
| 1 | Amber | #f59e0b | Secondary |
| 2 | Lime | #a3e635 | Tertiary |
| 3 | Pink | #f472b6 | Quaternary |
| 4 | Indigo | #818cf8 | Quinary |
| 5 | Orange | #fb923c | Senary |
| 6 | Turquoise | #2dd4bf | Septenary |
| 7 | Fuchsia | #e879f9 | Octonary |

---

### 9. Meltdown Warning Component

**Purpose:** Emergency alert for critical system states

**Characteristics:**
- Background: tokens.colors.meltdownBg
- Border: 2px solid #ef4444
- Border Radius: tokens.borderRadius.md
- Box Shadow: tokens.shadows.meltdownGlow
- Padding: tokens.spacing.md + tokens.spacing.lg

**Text Elements:**

| Part | Font Size | Color | Properties |
|------|-----------|-------|-----------|
| Title | 13px | #fecaca | bold, letter-spacing .18em |
| Countdown | 26px | #f87171 | bold, monospace, text-shadow |
| Subtitle | 9px | #fca5a5 | letter-spacing .12em |

**Animation:**
- Pulse scale: 1.0 → 1.06 → 1.0
- Duration: 0.5s
- Easing: ease-in-out
- Iteration: infinite

```typescript
style={useTokenStyles.meltdown}
```

---

### 10. Error Banner Component

**Purpose:** Global error notification for storage/system failures

**Characteristics:**
- Background: linear-gradient(to bottom, rgba(239,68,68,.15), transparent)
- Border Bottom: 1px solid rgba(239,68,68,.5)
- Position: fixed, top, z-index: 100
- Padding: 8px 12px

**Text:**
- Title: 10px, #fecaca, bold
- Subtitle: 8px, #fed7aa, margin-top: 2px

---

## Layout Components

### 11. Flex Row

**Purpose:** Horizontal layout container

```typescript
style={useTokenStyles.flexRow}
// display: flex, flexDirection: row, alignItems: center, gap: md
```

### 12. Flex Column

**Purpose:** Vertical layout container

```typescript
style={useTokenStyles.flexCol}
// display: flex, flexDirection: column, alignItems: stretch, gap: md
```

### 13. Grid Layout

**Purpose:** Multi-column grid layout

```typescript
style={useTokenStyles.grid(2, tokens.spacing.md)}
// gridTemplateColumns: repeat(2, 1fr), gap: md
```

---

## Utility Styles

### Position Utilities

```typescript
useTokenStyles.position.absolute   // position: absolute
useTokenStyles.position.relative   // position: relative
useTokenStyles.position.fixed      // position: fixed
useTokenStyles.position.sticky     // position: sticky
```

### Visibility Utilities

```typescript
useTokenStyles.visibility.hidden    // visibility: hidden
useTokenStyles.visibility.visible   // visibility: visible
useTokenStyles.visibility.invisible // display: none
```

### Pointer Utilities

```typescript
useTokenStyles.pointer.auto         // cursor: auto
useTokenStyles.pointer.pointer      // cursor: pointer
useTokenStyles.pointer.notAllowed   // cursor: not-allowed
useTokenStyles.pointer.grab         // cursor: grab
```

### Centering Utilities

```typescript
useTokenStyles.centerContent.flexCenter   // flex with center alignment
useTokenStyles.centerContent.gridCenter   // grid with place-items: center
```

---

## Spacing Reference

All spacing values follow an 8px base grid:

| Token | Value | Pixels |
|-------|-------|--------|
| xs | 0.25rem | 4px |
| sm | 0.5rem | 8px |
| md | 1rem | 16px |
| lg | 1.5rem | 24px |
| xl | 2rem | 32px |
| 2xl | 2.5rem | 40px |
| 3xl | 3rem | 48px |
| 4xl | 3.5rem | 56px |

---

## Color Palette Reference

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| primary | #3b82f6 | Main actions |
| success | #10b981 | Positive feedback |
| warning | #f59e0b | Caution/alerts |
| danger | #ef4444 | Errors/critical |
| info | #3b82f6 | Information |

### UI Backgrounds

| Name | Hex | Usage |
|------|-----|-------|
| bgPrimary | #ffffff | Main background |
| bgSecondary | #f9fafb | Secondary areas |
| bgTertiary | #f3f4f6 | Tertiary areas |
| bgDark | #0a1418 | Dark panels |
| bgDarker | #050b0e | Darkest panels |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| textPrimary | #111827 | Main text |
| textSecondary | #6b7280 | Secondary text |
| textTertiary | #9ca3af | Tertiary text |
| textInverse | #ffffff | Text on dark |

### Grayscale

| Shade | Hex | Usage |
|-------|-----|-------|
| gray50 | #f9fafb | Lightest |
| gray100 | #f3f4f6 | Very light |
| gray200 | #e5e7eb | Light |
| gray300 | #d1d5db | Medium-light |
| gray400 | #9ca3af | Medium |
| gray500 | #6b7280 | Medium-dark |
| gray600 | #4b5563 | Dark |
| gray700 | #374151 | Darker |
| gray800 | #1f2937 | Very dark |
| gray900 | #111827 | Darkest |

---

## Shadow Reference

| Shadow | Value | Usage |
|--------|-------|-------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle depth |
| md | 0 4px 6px rgba(0,0,0,0.1) | Standard |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Prominent |
| xl | 0 20px 25px rgba(0,0,0,0.1) | Maximum |
| inset | inset 0 3px 8px ... | Recessed |
| raised | 0 1px 0 rgba(255,255,255,.09), 0 3px 6px ... | Elevated |

---

## Border Radius Reference

| Token | Value | Usage |
|-------|-------|-------|
| none | 0 | Sharp corners |
| sm | 0.125rem (2px) | Subtle rounding |
| md | 0.375rem (6px) | Standard rounding |
| lg | 0.5rem (8px) | Moderate rounding |
| xl | 0.75rem (12px) | Generous rounding |
| 2xl | 1rem (16px) | Large rounding |
| full | 9999px | Circular |

---

## Z-Index System

| Layer | Value | Usage |
|-------|-------|-------|
| hidden | -1 | Behind content |
| base | 0 | Normal content |
| docked | 10 | Fixed navigation |
| dropdown | 20 | Dropdown menus |
| sticky | 30 | Sticky headers |
| overlay | 40 | Overlays, ambient |
| modal | 50 | Modal dialogs |
| popover | 60 | Popovers |
| tooltip | 70 | Tooltips |
| notification | 80 | Toast notifications |
| warning | 45 | Warning alerts |

---

## Animation Reference

### Keyframe Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| lampPulse | 1.1s | ease-in-out | Status lights |
| vigPulse | 1.4s | ease-in-out | Ambient glow |
| grainShift | 0.34s | steps(2) | Grain overlay |
| glitch | 0.34s | steps(2) | Glitch effect |
| warnPulse | 0.5s | ease-in-out | Warnings |

### Transitions

| Duration | Token | Usage |
|----------|-------|-------|
| 0.15s | fast | Quick responses |
| 0.2s | base | Standard transitions |
| 0.3s | slow | Prominent changes |
| 0.5s | slower | Gradual animations |
| 1s | slowest | Long animations |

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| xs | 320px | Mobile (small) |
| sm | 640px | Mobile (large) |
| md | 768px | Tablet |
| lg | 1024px | Desktop (small) |
| xl | 1280px | Desktop (medium) |
| 2xl | 1536px | Desktop (large) |

---

## Migration Checklist

When converting existing inline styles:

- [ ] Identify color values → map to tokens.colors.*
- [ ] Identify font sizes → convert px to rem and map to tokens.typography.fontSize.*
- [ ] Identify spacing → map to tokens.spacing.*
- [ ] Identify border-radius → map to tokens.borderRadius.*
- [ ] Identify shadows → map to tokens.shadows.*
- [ ] Identify gradients → reference tokens.colors.*Gradient
- [ ] Extract to useTokenStyles helper → use pre-built patterns
- [ ] Test visual rendering → verify no layout shifts
- [ ] Test responsive → verify across breakpoints
- [ ] Commit changes → atomic, focused commits

---

## Usage Examples

### Example 1: Converting Button Style

**Before:**
```jsx
<button style={{
  padding: '7px 10px',
  fontSize: 13,
  background: 'linear-gradient(180deg,#0e7490,#0c4a5e)',
  color: '#e0f2fe',
  border: '1px solid #083344',
  borderRadius: 4,
  fontWeight: 'bold'
}}>ENTRAR</button>
```

**After:**
```jsx
import { useTokenStyles, tokens } from './styleUtils';

<button style={mergeStyles(
  useTokenStyles.button('primary'),
  {
    fontSize: tokens.typography.fontSize.sm,
    letterSpacing: tokens.typography.letterSpacing.normal
  }
)}>ENTRAR</button>
```

### Example 2: Label Component

**Before:**
```jsx
<div style={{
  fontSize: 9,
  letterSpacing: '.16em',
  color: '#8d959e',
  textShadow: '0 1px 0 rgba(0,0,0,.9)',
  fontWeight: 600,
  textTransform: 'uppercase'
}}>
  OPERADOR
</div>
```

**After:**
```jsx
import { useTokenStyles } from './styleUtils';

<div style={useTokenStyles.label(9)}>OPERADOR</div>
```

### Example 3: LCD Display

**Before:**
```jsx
<div style={{
  background: 'linear-gradient(180deg,#0a1418,#050b0e)',
  boxShadow: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
  borderRadius: 4,
  padding: '2px 6px'
}}>
  <span style={{
    fontSize: 13,
    color: '#7dd3fc',
    textShadow: '0 0 6px #7dd3fc90'
  }}>{value}</span>
</div>
```

**After:**
```jsx
import { useTokenStyles } from './styleUtils';

<div style={useTokenStyles.lcd(tokens.colors.cyan)}>
  <span>{value}</span>
</div>
```

---

## Performance Considerations

1. **Memoization:** Style objects are computed at render time. For performance-critical components, consider memoizing with `useMemo()`
2. **CSS-in-JS:** Future versions may migrate to CSS modules or Tailwind for smaller bundle sizes
3. **Token Updates:** Changing a token value propagates to all components using it
4. **Dynamic Colors:** Use `getColorByValue()` helper for gradual color transitions

---

## Best Practices

1. **Always use tokens** - Never hardcode color values, font sizes, or spacing
2. **Use helpers** - `useTokenStyles` provides common patterns; reuse them
3. **Group related styles** - Keep layout styles separate from color/typography
4. **Semantic naming** - Use meaningful class names and variable names
5. **Document patterns** - Add comments when creating new style patterns
6. **Test responsiveness** - Verify layouts at all breakpoints

---

**Design System v1.0 — Projeto Nuclear Challenge**  
Updated: 2026-09-07
