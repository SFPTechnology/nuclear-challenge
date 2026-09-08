# 📖 Phase 2: Architecture Refactor (Sprint 3-4)

**Status:** InProgress (Session 2 Progress: 60% complete)  
**Assignee:** @dev  
**Duration:** 2 weeks (60 hours) - ~30 hours used (50%)
**Blockers:** Phase 1 ✅

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

**Wave 1 & 2 — Hooks & Components (Completed)**
- ✅ Extract 3 hooks (useUIState, useAudio, useGameState)
- ✅ Extract Boom component (130 lines)
- ✅ Extract viewport utilities (useDeviceClass, useViewportScale, viewport helpers)
- ✅ Extract LoginPanel component (w/ OperatorExclusionDialog)
- ✅ Extract EndGamePanel component
- ✅ Extract RankingPanel component (210 lines with charts)

**Result:**
- App.tsx reduced from 1.458 → 1.012 lines (446 lines removed, 31% reduction)
- Created 3 new utility files + 5 new panel components
- All 67 tests passing ✅
- **Current status:** 1.012 lines (target: <200 lines)

**Wave 3 Progress — Remaining extractions:**
- [ ] Extract AnalisePanel component (209 lines)
- [ ] Extract NC003Panel component (55 lines)
- [ ] Extract GameOverPanel component (win/lose/quit/pause modes)
- [ ] Reduce App.tsx to core logic + simple routing

**Checklist:**
- [x] Criar 3 hooks customizados (useUIState, useAudio, useGameState)
- [x] App.tsx refatorado para usar hooks
- [x] Testes passam 100% (67/67 ✅)
- [x] Extrair 5 componentes grandes (Boom, RankingPanel, etc.)
- [ ] App.tsx <200 linhas (currently 1.012 → requires AnalisePanel, NC003Panel, GameOverPanel extraction)
- [ ] Commit: `refactor: complete component extraction Phase 2 [TD-SYS-05]`

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
