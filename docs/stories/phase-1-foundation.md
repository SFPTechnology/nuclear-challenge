# 📖 Phase 1: Foundation (Sprint 1-2)

**Status:** Ready for Development  
**Assignee:** @dev  
**Duration:** 2 weeks (80 hours)  
**Blockers:** P0-SAFETY, P0-DATA (✅ COMPLETE)

---

## 🎯 Objetivo

Estabelecer fundação técnica: Git, TypeCheck, ESLint, Testes com valor

---

## 📋 Subtasks

### 1.1 - Git Initialization [✅ DONE - Start here]
- **Status:** ⏳ In Progress
- **Duration:** 0.5h
- **Blocker:** NONE

**Checklist:**
- [ ] `git init` (se necessário)
- [ ] Criar `.gitignore` com: node_modules/, dist/, .env, logs
- [ ] Criar branch `main` protegida
- [ ] Initial commit com `.gitignore`
- [ ] Verificar: `git log --oneline` mostra 1+ commits

**Comando:**
```bash
cd projeto/
git init || true
cat > .gitignore << 'EOF'
node_modules/
dist/
.env.local
*.log
.DS_Store
.idea/
.vscode/settings.json
coverage/
EOF
git add .
git commit -m "init: add .gitignore [Phase 1.1]"
```

---

### 1.2 - TypeCheck Activation [⏳ TODO]
- **Status:** Waiting
- **Duration:** 3-4h
- **Dependency:** 1.1 (Git)

**Checklist:**
- [ ] Verificar `tsconfig.json`: `strict: true`, `checkJs: true`
- [ ] Executar `npm run typecheck`
- [ ] Corrigir erros de type (provavelmente 50-100)
  - Use: `npm run typecheck 2>&1 | head -20` para ver primeiros
  - Corrigir em lotes de 10-20
  - Use ferramenta TypeScript VSCode para guia
- [ ] Todos testes continuam passando
- [ ] Zero type errors: `npm run typecheck` retorna exit 0
- [ ] Commit: `fix: activate strict TypeScript checking [TD-SYS-01]`

**Referência:** `.claude/rules/story-lifecycle.md` — Acceptance Criteria

---

### 1.3 - ESLint Full Coverage [⏳ TODO]
- **Status:** Waiting
- **Duration:** 4-6h
- **Dependency:** 1.1, 1.2

**Checklist:**
- [ ] Atualizar `eslint.config.js`:
  - `files: ['src/**/*.{js,jsx,ts,tsx}']` (remover excludes)
  - Adicionar plugins: `react`, `react-hooks`, `jsx-a11y`
- [ ] Executar `npm run lint`
- [ ] Corrigir erros (provavelmente 200-500)
- [ ] `npm run lint` retorna exit 0 com `--max-warnings=0`
- [ ] Commit: `fix: enable ESLint for all source files [TD-SYS-02]`

**Referência:** `docs/DEBT-RESOLUTION-PLAN.md` Phase 1.3

---

### 1.4 - Test Suite Repair [⏳ TODO]
- **Status:** Waiting  
- **Duration:** 6-8h
- **Dependency:** 1.1, 1.2, 1.3

**Checklist:**
- [ ] Auditar `src/**/*.test.{ts,tsx}` — verificam BEHAVIOR real?
- [ ] Reescrever testes frágeis (>30% do suite)
- [ ] Adicionar edge cases
- [ ] Adicionar testes de integração (UI → Storage)
- [ ] `npm run test` passa 100%
- [ ] `npm run test:coverage` ≥ 70%
- [ ] Commit: `test: repair test suite with behavioral coverage [TD-SYS-03]`

**Referência:** `docs/DEBT-RESOLUTION-PLAN.md` Phase 1.4

---

## ✅ Acceptance Criteria

| Critério | Verificação |
|----------|------------|
| Git funcional | `git log` mostra commits iniciais |
| TypeCheck 100% | `npm run typecheck` — exit 0 |
| ESLint 100% | `npm run lint` — exit 0, 0 warnings |
| Testes com valor | `npm run test:coverage` ≥ 70%, todos passam |
| Commits claros | `git log --oneline -5` mostra 4 commits de Phase 1 |

---

## 📝 Notes

- **Goal:** Ativar quality gates para detectar problemas cedo
- **Risk:** Muitos erros de type/lint pode parecer desanimador — é normal
- **Strategy:** Fazer em lotes de 10-20 erros, commit incrementalmente

---

## 🔄 Next Phase

Após Phase 1 complete:
- Branch para Phase 2: `git checkout -b phase-2-architecture`
- Execute: `docs/stories/phase-2-architecture.md`

---

**Criado:** 2026-09-08  
**Versão:** 1.0  
**Status:** Ready for Execution
