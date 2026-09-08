---
name: nuclear-challenge-pipeline
description: 4-phase technical debt resolution pipeline for Nuclear Challenge App
metadata:
  type: project
---

## Nuclear Challenge App — 4-Phase Technical Debt Resolution

**Current Date:** 2026-09-08
**Active Phase:** Phase 2 (Architecture)
**Branch:** `phase-2-architecture`

### Pipeline Phases

| Phase | Name | Status | Est. Duration | Target |
|-------|------|--------|---------------|--------|
| 1 | Foundation | ✅ DONE | 8-10h | Stabilize, update dependencies, fix tests |
| 2 | Architecture | 🔄 IN PROGRESS | 14-18h | Decompose App.tsx (1.457→<200 lines), extract 3 hooks |
| 3 | Accessibility | ⏳ BLOCKED | 12-16h | A11y remediation, WCAG 2.1 AA compliance |
| 4 | Quality Gates | ⏳ BLOCKED | 8-10h | Final QA, CI/CD validation |

### Phase 2 Tasks

**2.1 - Reorganize Project Structure** (8-10h)
- Create `src/{components,domain,hooks,styles}` hierarchy
- Extract 20-30 components from App.tsx
- Move styles to `src/styles/`
- Status: **PENDING**

**2.2 - Decompose App.tsx Monolith** (6-8h)
- Create 3 hooks: `usePhysicsEngine()`, `useTurmaRegistry()`, `useUIState()`
- Reduce App.tsx to <200 lines
- Move effects to appropriate hooks
- Status: **PENDING**

### Current Code State

- **App.tsx size:** 1.457 lines (target: <200)
- **Components extracted:** 0/20-30
- **Hooks created:** 0/3
- **Tests passing:** 100% (Phase 1 baseline)

### Key Files

- Story: `docs/stories/phase-2-architecture.md`
- Main code: `src/App.tsx` (1.457 lines)
- Legacy: `Arquivos_Diversos/` (to be deleted after 2.1)
- Hooks dir: `src/hooks/` (empty, ready for 3 new hooks)
- Components dir: `src/components/` (structure ready)

### Next Steps After Phase 2

→ Switch to `phase-3-a11y` branch
→ Execute Phase 3: Accessibility remediation (WCAG 2.1 AA)
→ Then Phase 4: Quality gates and CI/CD
