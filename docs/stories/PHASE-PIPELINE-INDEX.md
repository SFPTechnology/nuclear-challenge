# 📊 Debt Resolution Pipeline - Complete Index

**Status:** Phase 0 ✅ | Phase 1-4 Ready | Phase 5 Backlog  
**Total Effort:** 140+ hours across 5 phases  
**Timeline:** 8-12 weeks (3 devs or 12+ weeks 1 dev)

---

## 🎯 Quick Navigation

| Phase | Title | Duration | Status | Story File |
|-------|-------|----------|--------|-----------|
| **0** | P0-SAFETY & P0-DATA | 4h | ✅ DONE | `git commit dbec26e` |
| **1** | Foundation | 2 weeks | ⏳ READY | `phase-1-foundation.md` |
| **2** | Architecture | 2 weeks | ✅ DONE | `phase-2-architecture.md` |
| **3** | A11y | 2-3 weeks | 📋 READY | `phase-3-a11y.md` |
| **4** | Quality Gates | 1 week | 📋 PENDING | `phase-4-gates.md` (TODO) |
| **5** | Remaining | 3-4 weeks | 📚 BACKLOG | `phase-5-remaining.md` (TODO) |

---

## ✅ Phase 0: P0-SAFETY & P0-DATA (COMPLETED)

**Commit:** `dbec26e`

**Completed:**
- ✅ UX-D07: `prefers-reduced-motion` implemented
- ✅ TD-DAT-01/02: StorageAdapter backup/restore

**Files Modified:**
- `src/App.tsx` — Boom component with reduced-motion support
- `src/adapters/StorageAdapter.ts` — Backup/restore methods

---

## ⏳ Phase 1: Foundation (START HERE)

**Story:** `docs/stories/phase-1-foundation.md`  
**Duration:** 2 weeks (80 hours)  
**Dependency:** None (Phase 0 ✅)

**Tasks:**
1. **1.1** Git Initialization (0.5h)
2. **1.2** TypeCheck Activation (3-4h)
3. **1.3** ESLint Full Coverage (4-6h)  
4. **1.4** Test Suite Repair (6-8h)

**Outcome:**
- Git functional
- TypeCheck 100% (zero errors)
- ESLint 100% (zero warnings)
- Tests with behavioral coverage (>70%)

**How to Start:**
```bash
# Branch
git checkout -b phase-1-foundation

# Read full task
cat docs/stories/phase-1-foundation.md

# Start 1.1 - Git Initialization
```

---

## 📋 Phase 2: Architecture (AFTER PHASE 1)

**Story:** `docs/stories/phase-2-architecture.md`  
**Duration:** 2 weeks (60 hours)  
**Dependency:** Phase 1 ✅

**Tasks:**
1. **2.1** Reorganize Project Structure (8-10h)
2. **2.2** Decompose App.tsx Monolith (6-8h)

**Outcome:**
- Clear src/ structure
- App.tsx < 200 lines
- 3 specialized hooks
- 20+ extracted components

---

## 📋 Phase 3: A11y (AFTER PHASE 2) — READY

**Story:** `docs/stories/phase-3-a11y.md`  
**Duration:** 2-3 weeks (29 hours)  
**Dependency:** Phase 2 ✅

**Waves:**
1. **Wave 1: Font Sizing** (10h) — UX-D23
   - Convert 100% of fontSize from px → rem
   - Ensure text scaling works at 100%, 150%, 200% zoom
   
2. **Wave 2: Keyboard Legend** (3h) — UX-D25
   - Create keyboard shortcut legend modal
   - Accessible via "?" or menu
   - Full screen reader support
   
3. **Wave 3: Responsivity** (16h) — UX-D11
   - Implement reflow design (remove zoom-based layout)
   - Support 320px to 1920px breakpoints
   - Zero horizontal scrolling on any viewport

**Debts Addressed:**
- UX-D23: Font sizing (px → rem)
- UX-D25: Keyboard legend
- UX-D11: Responsivity (reflow, breakpoints)
- *Also validated:* UX-D05, UX-D06, UX-D14, UX-D19 (from Phase 2 Story 2.3)

---

## 📋 Phase 4: Quality Gates (AFTER PHASE 3)

**Duration:** 1 week (20 hours)  
**Dependency:** Phase 3 ✅

**Tasks:**
1. Pre-flight checks:
   - `npm run typecheck` ✅
   - `npm run lint` ✅  
   - `npm run test` ✅
   - `npm run test:coverage` ✅
   - `npm run build` ✅

2. Zero issues → Ready for production

**Outcome:**
- All quality gates active
- Zero defects in critical areas
- Product safe to launch

---

## 📚 Phase 5: Remaining (BACKLOG)

**Duration:** 3-4 weeks (varies)  
**Dependency:** Phase 4 ✅

**23 Remaining Debts (prioritized):**

| Priority | ID | Débito | Esforço |
|----------|---|---|---|
| 1 | UX-D10 | Empty states | 10h |
| 2 | UX-D02 | Design system | 24h |
| 3 | UX-D16 | Screen layouts | 20h |
| 4 | TD-SYS-18 | Observability | M |
| 5 | UX-D11 | Responsividade | 16h |

**Full list:** `docs/DEBT-RESOLUTION-PLAN.md` Phase 5

---

## 💰 Investment Summary

| Phase | Duration | Investimento |
|-------|----------|--------------|
| 0 | 4h | R$ 600 ✅ |
| 1 | 2 sem | R$ 2.100 |
| 2 | 2 sem | R$ 2.400 |
| 3 | 3 sem | R$ 4.200 |
| 4 | 1 sem | R$ 450 |
| 5 | 3-4 sem | ~R$ 90.000 |
| **TOTAL** | **11-13 sem** | **≥ R$ 100.000+** |

---

## 🚀 How to Execute

### Week 1-2: Phase 1
```bash
git checkout -b phase-1-foundation
cat docs/stories/phase-1-foundation.md
# Follow 4 subtasks in order
```

### Week 3-4: Phase 2
```bash
git checkout -b phase-2-architecture
cat docs/stories/phase-2-architecture.md
# Follow 2 subtasks in order
```

### Week 5-7: Phase 3
```bash
git checkout -b phase-3-a11y
cat docs/stories/phase-3-a11y.md
# Follow 3 subtasks in order
```

### Week 8: Phase 4
```bash
git checkout -b phase-4-gates
# Run: npm run typecheck lint test build
```

### Week 9+: Phase 5
```bash
git checkout -b phase-5-remaining
# Pick from priority list above
```

---

## ✅ Success Criteria (End of Phase 4)

```
✅ P0-SAFETY resolved (no seizure risk)
✅ P0-DATA resolved (no data loss)
✅ Git functional (all changes tracked)
✅ TypeCheck 100% (zero type errors)
✅ ESLint 100% (zero violations)
✅ Tests with value (behavioral coverage >80%)
✅ Code structure clear (components <200 LOC)
✅ A11y foundation (WCAG 2.1 AA baseline)
✅ Quality gates active (all checks passing)
```

---

## 📖 Full Documentation

- **Detailed plan:** `docs/DEBT-RESOLUTION-PLAN.md`
- **Workshop tools:** `.aiox-core/development/workflows/workshop-*.yaml`
- **Each phase:** `docs/stories/phase-{N}-*.md`

---

## 🎯 Next Action

**START HERE:**

```bash
# Read Phase 1 full task
cat docs/stories/phase-1-foundation.md

# Create branch
git checkout -b phase-1-foundation

# Execute Subtask 1.1 (Git Initialization)
```

---

**Pipeline created:** 2026-09-08  
**Status:** Phase 0 Complete, Phase 1-4 Ready, Phase 5 Backlog  
**Owner:** @dev (Dex)  
**Orchestrator:** Orion (@aiox-master)
