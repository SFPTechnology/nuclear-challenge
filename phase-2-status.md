---
name: phase-2-status
description: Decomposition strategy and tracking for App.tsx refactor
metadata:
  type: project
---

## Progress Update (Session 2026-09-08)

**COMPLETED:**
- ✅ Created 3 new hooks: useGameState, useUIState, useAudio
- ✅ Analyzed App.tsx structure (1.457 → 1.424 lines, -33 lines removed)
- ✅ Refactored App.tsx to use new hooks
- ✅ All 67 tests passing
- ✅ Commit: refactor: extract specialized hooks [TD-SYS-06]
- ✅ Updated tsconfig.json with @hooks alias
- ✅ Created COMPONENT-MAP.md with extraction strategy

**NEXT SESSION:**
- Extract 15+ UI components (leaf → container order)
- Reduce App.tsx from 1.424 → <200 lines
- Move styles to src/styles/
- Final commit and move to Phase 3

---

## Phase 2 Execution Plan

### Component Extraction Strategy

**App.tsx (1.457 lines) needs to be reduced to <200 lines by:**

1. Extracting specialized hooks (60-80 lines)
   - `usePhysicsEngine()` — Physics engine state + effects
   - `useTurmaRegistry()` — Turma registry state + effects
   - `useUIState()` — UI state (modals, dropdowns, etc.)

2. Extracting UI components (400-500 lines)
   - Layout: Header, Footer, Navigation
   - Forms: TurmaForm, OperatorForm
   - Lists: TurmaList, TurmaCard, OperatorList
   - Panels: OperatorPanel, PhysicsPanel
   - Modals & Dialogs

3. Moving styles (200-300 lines)
   - From App.tsx → `src/styles/` or scoped CSS modules
   - Tailwind utilities → `src/styles/tokens.css`

### Extraction Phases

**Phase 2.1a - Analyze & Document**
- Read App.tsx fully
- Identify all components, hooks, styles
- Create component dependency map
- Document state flow and effects

**Phase 2.1b - Create Directory Structure**
- Verify `src/{components,domain,hooks,styles}` exist
- Create subdirectories: Turma/, Operator/, Shared/
- Set up `src/domain/models/` and `src/domain/services/`

**Phase 2.2a - Extract Hooks**
- `usePhysicsEngine()` — Physics state + setInterval effects
- `useTurmaRegistry()` — Turma state + API calls
- `useUIState()` — UI state (modals, dropdowns, filters)
- Test each hook independently

**Phase 2.2b - Extract Components**
- Start with leaf components (no dependencies)
- Move progressively to container components
- Update imports in App.tsx as each component moves

**Phase 2.2c - Reduce App.tsx**
- Replace inline component code with extracted components
- Replace state logic with custom hooks
- Verify App.tsx <200 lines
- Clean up imports

### Risk Mitigation

- **Test continuously:** Run `npm test` after each major extraction
- **Git commits:** Atomic commits per component/hook
- **Revert plan:** If stuck, can revert to clean branch and try different strategy
- **Code review:** Use coderabbit before final commit

### Definition of Done

✅ App.tsx <200 lines
✅ 3 hooks extracted and tested
✅ 20-30 components in `src/components/`
✅ All styles in `src/styles/`
✅ All tests passing (100%)
✅ No regressions (visual regression tests)
✅ Commit: `refactor: decompose App.tsx [TD-SYS-05][TD-SYS-06]`
