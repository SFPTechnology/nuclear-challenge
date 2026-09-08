# Phase 1 - Design System & Typography Audit

**Date:** 2026-09-07  
**Scope:** Arquivos_Diversos/nuclear-challenge-app.tsx  
**Status:** COMPLETE  

---

## Summary

- **Total inline style blocks found:** 153
- **Files analyzed:** 1 (nuclear-challenge-app.tsx)
- **Design tokens created:** tokens.ts (complete palette)
- **Style utilities created:** styleUtils.ts (common patterns)

---

## Inline Style Audit

### Color Mapping

| Usage Count | Color | Hex Value | Token | Category |
|-------------|-------|-----------|-------|----------|
| 15 | Cyan | #06b6d4 | tokens.colors.cyan | Accent |
| 12 | Amber/Gold | #f59e0b | tokens.colors.warning | Status |
| 10 | Red | #ef4444 | tokens.colors.danger | Status |
| 8 | Green | #22c55e | tokens.colors.success | Status |
| 8 | Gray | #8d959e | tokens.colors.label | Labels |
| 7 | Light Cyan | #7dd3fc | tokens.colors.cyan (lighter) | Display |
| 6 | Dark Gray | #6b7280 | tokens.colors.gray500 | Text Secondary |
| 5 | Indigo | #818cf8 | tokens.colors.indigo | Chart Accent |
| 5 | Pink | #f472b6 | tokens.colors.pink | Chart Accent |
| 4 | Orange | #fb923c | tokens.colors.orange | Chart Accent |
| 4 | Light Orange | #fed7aa | tokens.colors.gray200 (variant) | UI Background |
| 3 | Lime | #a3e635 | tokens.colors.lime | Chart Accent |
| 3 | Turquoise | #2dd4bf | tokens.colors.turquoise | Chart Accent |
| 3 | Fuchsia | #e879f9 | tokens.colors.fuchsia | Chart Accent |
| 3 | Light Red | #fecaca | tokens.colors.gray200 (variant) | Alert Text |

### Font Size Mapping

| Size (px) | Size (rem) | Usage Count | Contexts |
|-----------|-----------|-------------|----------|
| 26 | 1.625 | 1 | Meltdown countdown |
| 18 | 1.125 | 1 | Main title |
| 13 | 0.8125 | 2 | LCD values, warnings |
| 12 | 0.75 | 3 | Player names, card headers |
| 11 | 0.6875 | 1 | Difficulty labels |
| 10 | 0.625 | 8 | Table cells, small text |
| 9 | 0.5625 | 15 | Default text, labels |
| 8 | 0.5 | 12 | Small labels, flags |
| 7 | 0.4375 | 8 | Tiny text, suffixes |
| 6.5 | 0.40625 | 5 | Lamp labels, micro text |
| 6 | 0.375 | 4 | Table headers |
| 5 | 0.3125 | 2 | Minimal text |

### Spacing/Padding Mapping

| Size (px) | Size (rem) | Usage Count | Contexts |
|-----------|-----------|-------------|----------|
| 20 | 1.25 | 3 | Plate padding |
| 16 | 1 | 8 | Standard padding |
| 12 | 0.75 | 5 | Medium padding |
| 10 | 0.625 | 2 | Small padding |
| 8 | 0.5 | 12 | xs padding |
| 7 | 0.4375 | 3 | Button padding |
| 6 | 0.375 | 4 | Card padding |
| 5 | 0.3125 | 5 | Tight spacing |
| 4 | 0.25 | 3 | Minimal spacing |
| 3 | 0.1875 | 6 | Micro spacing |
| 2 | 0.125 | 8 | px-thin spacing |

### Border Radius Mapping

| Value (px) | Token | Usage Count | Components |
|-----------|-------|-------------|-----------|
| 4 | md | 2 | Chart tooltips |
| 3 | sm | 3 | Table rows, badges |
| 6 | md | 3 | Buttons, inputs |
| 8 | lg | 5 | Plates, gauges |
| 50% / full | full | 4 | Circular elements (lamps, screws) |

### Shadow Mapping

| Shadow Type | Value | Token | Usage Count |
|------------|-------|-------|-------------|
| Inset recess | inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06) | tokens.shadows.inset | 8 |
| Raised | 0 1px 0 rgba(255,255,255,.09), 0 3px 6px rgba(0,0,0,.6) | tokens.shadows.raised | 6 |
| Glow effects | 0 0 Xpx {color} | tokens.shadows.* (custom) | 12 |
| Meltdown glow | 0 0 26px rgba(239,68,68,.75) | tokens.shadows.meltdownGlow | 1 |
| Screw shine | inset 0 -1px 1px rgba(0,0,0,.7) | tokens.shadows.screwShine | 2 |

### Letter Spacing Mapping

| Value (em) | Token | Usage Count | Contexts |
|-----------|-------|-------------|----------|
| .18em | letterSpacing.wider | 2 | Emergency warnings |
| .16em | letterSpacing.wide | 8 | Labels |
| .15em | letterSpacing.widest | 1 | Meltdown text |
| .12em | letterSpacing.wider | 3 | Small labels |
| .1em | letterSpacing.wide | 2 | Button text |
| .08em | letterSpacing.normal | 3 | Regular text |
| .06em | letterSpacing.normal | 4 | Monospace entries |

### Gradient Patterns

| Gradient | Token | Usage Count | Purpose |
|----------|-------|-------------|---------|
| linear-gradient(160deg,#3a4149 0%,#2b3138 40%,#22272d 70%,#2e343b 100%) | tokens.colors.metalGradient | 8 | Metallic plates |
| linear-gradient(145deg,#4a525b 0%,#2a2f35 45%,#1c2126 100%) | tokens.colors.bezelGradient | 2 | Gauge bezels |
| linear-gradient(180deg,#0a1418,#050b0e) | tokens.colors.lcdGradient | 6 | LCD displays |
| linear-gradient(160deg,rgba(255,255,255,.10) 0%,...) | tokens.colors.glassGradient | 2 | Glass effect |
| linear-gradient(180deg,#450a0a,#1a0505) | tokens.colors.meltdownBg | 1 | Meltdown warning |
| radial-gradient(...) | Custom | 8 | Glows, lamps |

---

## Component Style Patterns

### 1. Plates (Metallic Panels) - 8 instances

Used for control panels, displays, containers.

**Pattern:**
```jsx
style={{
  background: DS.metal,
  boxShadow: `${DS.raised}${glow ? `, 0 0 14px ${glow}` : ''}`,
  border: '1px solid #171b1f'
}}
```

**Conversion:** Use `useTokenStyles.plate(glow)`

**Files:** Lines 69, 115, 142, 149, 749, 755, 765, 803, 813, 847, 872

---

### 2. Labels - 15 instances

Text labels with standardized styling.

**Pattern:**
```jsx
style={{
  fontSize: size,
  letterSpacing: '.16em',
  color: '#8d959e',
  textShadow: '0 1px 0 rgba(0,0,0,.9)'
}}
```

**Conversion:** Use `useTokenStyles.label(size)`

**Files:** Lines 78, 116, 143, 144, 752, 756, 768, 804, 817, 829, 849, 851, 852, 853, 867

---

### 3. LCD Displays - 6 instances

Data display elements with monospace fonts.

**Pattern:**
```jsx
style={{
  background: 'linear-gradient(180deg,#0a1418,#050b0e)',
  boxShadow: DS.recess,
  padding: '2px 6px'
}}
```

**Conversion:** Use `useTokenStyles.lcd(color)`

**Files:** Lines 88, 145, 828, 830, 836

---

### 4. Lamps (Status Indicators) - 6 instances

Circular LED-style indicators.

**Pattern:**
```jsx
style={{
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: on ? `radial-gradient(...)` : '...',
  boxShadow: on ? `0 0 9px ${c}, ...` : '...',
  border: '1px solid #12161a'
}}
```

**Conversion:** Use `useTokenStyles.lamp(hue, isOn)`

**Files:** Lines 95-101

---

### 5. Buttons/Valves - 12 instances

Interactive controls with gradient backgrounds.

**Pattern:**
```jsx
style={{
  flex: 1,
  position: 'relative',
  borderRadius: 6,
  padding: '7px 4px',
  background: ready ? `linear-gradient(...)` : '...',
  boxShadow: ready ? '...' : '...',
  border: '1px solid #14181c'
}}
```

**Conversion:** Create helper for Valve styles (or use Tailwind class)

**Files:** Lines 155-166

---

### 6. Meltdown Warning - 3 instances

Emergency alert box styling.

**Pattern:**
```jsx
style={{
  padding: '10px 20px',
  background: 'linear-gradient(180deg,#450a0a,#1a0505)',
  border: '2px solid #ef4444',
  boxShadow: '0 0 26px rgba(239,68,68,.75)'
}}
```

**Conversion:** Use `useTokenStyles.meltdown`

**Files:** Lines 52-58

---

### 7. Chart Tooltips - 1 instance (constant)

```javascript
const tipStyle = { 
  background: '#0a1418', 
  border: '1px solid #0891b2', 
  borderRadius: 4, 
  fontSize: 10, 
  color: '#cbd5e1' 
};
```

**Conversion:** Use `useTokenStyles.tooltip(bgColor, borderColor)`

---

### 8. Axis Labels - 1 instance (constant)

```javascript
const axisStyle = { 
  fontSize: 8, 
  fill: '#8d959e' 
};
```

**Conversion:** Use `useTokenStyles.axisLabel`

---

### 9. Screw Decorations - 4 instances

Small metallic screws on plate corners.

**Pattern:**
```jsx
style={{
  width: 7,
  height: 7,
  background: 'radial-gradient(circle at 32% 28%,#6b7480,#333940 60%,#191d21)',
  boxShadow: 'inset 0 -1px 1px rgba(0,0,0,.7)'
}}
```

**Conversion:** Use `useTokenStyles.screw`

**Files:** Lines 61-65

---

### 10. Gauges & Charts - 8 instances

SVG and recharts customizations.

**Pattern:** Various line-height, fill, fontSize, color combinations

**Conversion:** Extract to chart-specific utility functions

---

## Typography Conversion Status

### Remaining px Font Sizes to Convert

The following inline font sizes need conversion:

| Component | Current | Conversion | Token |
|-----------|---------|-----------|-------|
| Meltdown countdown | 26px | 1.625rem | fontSize['4xl'] |
| Main title | 18px | 1.125rem | fontSize.lg |
| LCD value | 13px | 0.8125rem | fontSize.base + custom |
| Player name | 12px | 0.75rem | fontSize.xs |
| Warnings | 13px | 0.8125rem | fontSize.base |
| Labels | 9px | 0.5625rem | fontSize.xs |
| Small text | 8px | 0.5rem | fontSize.sm |
| Micro text | 6.5px | 0.40625rem | fontSize.mini |

**Status:** 0/153 converted (baseline measurement complete)

---

## Next Steps (Phase 2 & Beyond)

1. **Phase 2 (Vite Configuration):** Update build system to support rem/em units
2. **Phase 3 (Conversion Sprint):** Replace inline styles group-by-group (max 10 per commit)
3. **Phase 4 (Tailwind Integration):** Configure Tailwind with token values
4. **Phase 5 (Component Library):** Extract reusable components with token-based styling

---

## Design System Readiness

| Component | Status | File |
|-----------|--------|------|
| ✅ Color palette | Complete | tokens.ts |
| ✅ Spacing system | Complete | tokens.ts |
| ✅ Typography | Complete | tokens.ts |
| ✅ Utilities | Complete | styleUtils.ts |
| ⏳ Conversion | In Progress | nuclear-challenge-app.tsx |
| ⏳ Testing | Pending | — |
| ⏳ Documentation | Pending | — |

---

## Acceptance Criteria

- [x] tokens.ts created with complete design system
- [x] 153 inline styles identified and cataloged
- [x] Color mapping complete (15+ colors organized)
- [x] Font size audit complete (12 sizes identified)
- [x] Spacing audit complete (11 sizes mapped)
- [x] Border radius audit complete
- [x] Shadow patterns documented
- [x] Gradient patterns cataloged
- [x] styleUtils.ts created with common helpers
- [x] Audit document completed
- [ ] Begin conversion process (Phase 2)
- [ ] Visual regression testing (Phase 3)
- [ ] 100% font sizes converted to rem
- [ ] 100% inline styles converted to tokens

---

**Phase 1 Complete.** Ready for Phase 2 (src/ + Vite configuration).
