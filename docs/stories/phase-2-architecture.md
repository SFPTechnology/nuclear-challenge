# 📖 Phase 2: Architecture Refactor (Sprint 3-4)

**Status:** Ready for Development  
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

### 2.2 - Decompose App.tsx Monolith [⏳ TODO]
**Duration:** 6-8h

**Extract hooks:**
- `usePhysicsEngine()` — 10+ estados relacionados a física
- `useTurmaRegistry()` — 15+ estados relacionados a turma  
- `useUIState()` — 8+ estados de UI

**Result:**
- App.tsx reduzido para <200 linhas
- Componente Boom com ~50 linhas
- Todos useEffect movidos para hooks apropriados

**Checklist:**
- [ ] Criar 3 hooks customizados
- [ ] Mover estados relacionados
- [ ] App.tsx <200 linhas
- [ ] Testes passam 100%
- [ ] Commit: `refactor: extract specialized hooks [TD-SYS-06]`

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
