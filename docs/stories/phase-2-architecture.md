# 📖 Phase 2: Architecture Refactor (Sprint 3-4)

**Status:** InProgress  
**Assignee:** @dev  
**Duration:** 2 weeks (60 hours)  
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

**Extract hooks:**
- `usePhysicsEngine()` ✅ (via usePhysics already extracted)
- `useTurmaRegistry()` ✅ (already extracted)  
- `useUIState()` ✅ **NEW** — 8+ estados de UI (focus, mode, snd, boom, diff, etc.)
- `useAudio()` ✅ **NEW** — Audio synthesis + sound effects
- `useGameState()` ✅ **NEW** — Game logic + physics calculations

**Result:**
- 3 new hooks created and integrated
- App.tsx refactored to use new hooks (reduced 33 lines)
- All 67 tests passing ✅
- App.tsx still > 200 lines (requires component extraction)

**Checklist:**
- [x] Criar 3 hooks customizados (useUIState, useAudio, useGameState)
- [x] App.tsx refatorado para usar hooks
- [x] Testes passam 100% (67/67 ✅)
- [ ] App.tsx <200 linhas (currently 1.424 → requires component extraction)
- [ ] Commit: `refactor: extract specialized hooks & state management [TD-SYS-06]`

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
