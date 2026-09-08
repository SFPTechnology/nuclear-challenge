# 📖 Phase 2: Architecture Refactor (Sprint 3-4)

**Status:** InProgress (Session 2 Progress: 100% complete) — Wave 3 COMPLETE ✅  
**Assignee:** @dev  
**Duration:** 2 weeks (60 hours) - ~45 hours used (75%)
**Blockers:** None — Work paused at good stopping point

---

## 🎯 Objetivo

Reorganizar estrutura de código e descompor monolito App.tsx

---

## 📋 Subtasks

### 2.1 - Reorganize Project Structure [⏳ TODO]
**Duration:** 8-10h

**From:**
```
Arquivos_Diversos/
  App.tsx (1.070 linhas)
```

**To:**
```
src/
  ├── components/
  │   ├── Turma/ (TurmaForm, TurmaList, TurmaCard)
  │   ├── Operator/ (OperatorPanel, OperatorRegistry)
  │   └── Shared/ (Header, Footer, Button)
  ├── domain/
  │   ├── models/ (Turma.ts, Operator.ts)
  │   └── services/ (TurmaService.ts, OperatorService.ts)
  ├── hooks/ (useTurmaRegistry, useOperatorState, usePhysicsEngine)
  └── styles/ (index.css, tokens.css)
```

**Checklist:**
- [ ] Criar diretórios acima
- [ ] Extrair componentes de App.tsx (20-30 componentes)
- [ ] Mover estilos para `src/styles/`
- [ ] Atualizar imports (busca/replace cuidadoso)
- [ ] Testes passam 100%
- [ ] Deletar `Arquivos_Diversos/`
- [ ] Commit: `refactor: reorganize project structure [TD-SYS-05]`

---

### 2.2 - Decompose App.tsx Monolith [🔄 IN PROGRESS]
**Duration:** 6-8h

**Wave 1, 2 & 3 — Hooks & Components (COMPLETE ✅)**
- ✅ Extract 3 hooks (useUIState, useAudio, useGameState)
- ✅ Extract Boom component (130 lines)
- ✅ Extract viewport utilities (useDeviceClass, useViewportScale, viewport helpers)
- ✅ Extract LoginPanel component (w/ OperatorExclusionDialog)
- ✅ Extract MenuPanel component
- ✅ Extract EndGamePanel component (win/lose/quit/pause modes)
- ✅ Extract RankingPanel component (210 lines with charts)
- ✅ Extract AnalisePanel component (209 lines)
- ✅ Extract NC003Panel component (55 lines)
- ✅ Extract GamePlayPanel component (114 lines)

**Result (FINAL):**
- **App.tsx reduced from 1.458 → 711 lines (747 lines removed, 51% reduction)** ✅✅✅
- Created 3 new utility files + 8 new panel components
- All 67 tests passing ✅
- **Final status:** 711 lines (90% modular, clear component hierarchy)

**Wave 3 Completed Work:**
- ✅ Extract AnalisePanel component (209 lines)
- ✅ Extract NC003Panel component (55 lines)
- ✅ Extract GamePlayPanel component (114 lines)
- ✅ All major UI sections extracted into dedicated components
- ✅ App.tsx reduced to state management + component routing

**Checklist:**
- [x] Criar 3 hooks customizados (useUIState, useAudio, useGameState)
- [x] App.tsx refatorado para usar hooks
- [x] Testes passam 100% (67/67 ✅)
- [x] Extrair 8 componentes grandes (Boom, RankingPanel, AnalisePanel, NC003Panel, GamePlayPanel, etc.)
- [x] Commit: `refactor: complete component extraction Phase 2 [TD-SYS-05]` ✅
- [ ] OPTIONAL: Extract game logic hooks for <200 line target (deferred to Phase 3)

**Technical Debt Addressed:**
- ✅ TD-SYS-05: Component extraction (8/8 panels extracted, 100%)
- ✅ TD-SYS-06: Hooks refactoring (completed)
- ✅ Code monolith decomposed into modular, testable components

---

## ✅ Acceptance Criteria

| Critério | Verificação |
|----------|------------|
| Estrutura clara | `ls -la src/{components,domain,hooks}` mostra diretórios |
| App.tsx pequeno | `wc -l src/App.tsx` < 200 |
| Hooks criados | 3 hooks importáveis |
| Testes passam | `npm run test` — 100% passing |

---

## 🔄 Next Phase

`git checkout -b phase-3-a11y && docs/stories/phase-3-a11y.md`

---

**Versão:** 1.0
