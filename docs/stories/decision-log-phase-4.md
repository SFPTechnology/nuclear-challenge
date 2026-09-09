# Decision Log — Phase 4: Polish & Empty States

**Story:** `docs/stories/phase-4-polish.md`
**Agente:** @dev (Dex) | **Modo:** YOLO | **Data:** 2026-09-09

---

## IDS Protocol — Search / Decide / Log

| # | Artefato | Busca | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | `EmptyState` | Glob `src/components/*` + Grep `EmptyState` | **ADAPT** | Já existia e era consumido por LoginPanel/RankingPanel. Reescrever do zero quebraria 4 call sites. Preservei a API pública (`icon/title/description/actionLabel/onAction/size`), adicionei `testId`. |
| 2 | `ErrorBoundary` | Grep `ErrorBoundary` | **ADAPT** | Já existia e já estava montado no topo de `App.tsx`. Mantive o contrato `children`/`fallback`, estendi com `onError` e fallback como render-prop. |
| 3 | Testes | Glob `src/__tests__/*` | **CREATE** | `empty-states` e `error-boundary` não existiam. Reusei o padrão de `@testing-library/react` + `axe-core` (ambos já em devDependencies). |
| 4 | Banner de erro global | Grep `GlobalErrorBanner` | **REUSE** | Existia como componente E como cópia local morta dentro de `App.tsx`. Removi a cópia local. |

---

## Decisões autônomas (YOLO)

### D-01 — Nome do arquivo de teste: `.tsx` em vez de `.ts`
A story pede `src/__tests__/empty-states.test.ts`. O arquivo renderiza JSX, portanto **precisa** ser `.tsx`.
→ **Criado como `empty-states.test.tsx`.** Erro de autoria na story, não desvio de escopo.

### D-02 — Tema do EmptyState: claro → escuro
O componente existente usava `#f9fafb` / `#6b7280` (tema claro) dentro de um app com fundo `#0a0c0e`. Além de destoar, `#6b7280` está documentado no próprio `a11y-audit.test.ts` como reprovado em contraste.
→ **Migrado para superfície LCD escura** (`tokens.colors.lcdGradient`), título `#e2e8f0` (≈15:1) e descrição `#a1aab8` (≈8:1) — ambos WCAG AAA.

### D-03 — Tamanhos de fonte: px numérico → tokens
O componente usava `fontSize: 11` (número). Phase 3 padronizou tipografia via `tokens.typography.fontSize`.
→ **Todos os tamanhos passam por tokens.**

### D-04 — Retry do ErrorBoundary: reset de estado, não `window.location.reload()`
A implementação anterior só oferecia reload da página inteira. A story exige explicitamente "Retry: recarrega o componente errado (não a página toda)".
→ **Dois botões:** "Tentar novamente" (reseta o boundary → subárvore remonta, estado do resto da app preservado) e "Recarregar página" (escalação).

### D-05 — Mensagem de erro ao usuário: genérica, não `error.message`
A versão anterior imprimia `error.message` cru na tela. A story pede "informação amigável ao usuário (não stack trace cru)".
→ **Texto fixo em PT-BR.** Detalhes técnicos vão só para o log estruturado. Coberto por teste.

### D-06 — Boom e PreMelt (telas 8 e 9): sem EmptyState
A story marca as duas com ressalva ("já trata explosão", "verificar estado vazio"). São **overlays transitórios de física**, não listas de dados — não têm coleção que possa estar vazia. Forçar um EmptyState ali seria semanticamente errado.
→ **Decisão:** nenhum EmptyState. Em vez disso tratei o estado degenerado real de cada uma:
- `PreMelt` renderizava uma caixa vermelha **em branco** se `secs` fosse `undefined`/`NaN` → agora cai para `--` e ganhou `role="alert"` + nome acessível.
- `Boom` não anunciava nada a leitores de tela → ganhou `role="alert"` + `aria-label`.

### D-07 — Correção de lint/typecheck fora dos 2 componentes
O AC exige "TypeCheck, Lint, Build passam sem erros", mas a baseline já estava vermelha (**55 erros de lint**, 89 de typecheck) antes de eu tocar em qualquer coisa.
→ **Decisão:** corrigir apenas o que é mecânico e não-comportamental (imports mortos, anotações de tipo, `null` → `undefined`), priorizando arquivos já dentro do escopo Phase 4. Nenhuma lógica de jogo foi alterada.
→ **Resultado:** lint 55 → **0**. Build **GREEN**.

---

## ⚠ Ressalvas abertas para o QA Gate

### D-08 — Typecheck ainda vermelho: 88 erros em `App.tsx`
Todos **pré-existentes** (não introduzidos por esta story; estavam ocultos na baseline porque a saída foi truncada). São do monólito não-tipado: `mode` implícito `any`, indexação de `DIFF` por `number`, `sess.current` sem tipo.
→ **Não corrigidos deliberadamente.** Tipar `App.tsx` é a Phase 7 (Baseline & Monolith Refactoring) e o risco de regressão silenciosa na física/pontuação não se justifica dentro de uma story de polimento visual.
→ **O AC "TypeCheck passa" NÃO está satisfeito.** Recomendo `CONCERNS` com débito registrado, não `PASS`.

### D-09 — Cobertura de 100% não pôde ser medida
`@vitest/coverage-v8` não está instalado; `--coverage` falha com `MISSING DEPENDENCY`.
→ **Não instalei a dependência** — alterar `package.json`/`package-lock.json` está fora do escopo desta story e merece aprovação explícita.
→ Evidência substituta: 38 testes cobrem todos os branches dos dois componentes por inspeção (tamanhos sm/md/lg, com/sem ícone, com/sem descrição, CTA presente/ausente, fallback padrão/estático/render-prop, retry bem-sucedido/refalha, hook `onError` normal/lançando exceção).
→ **Recomendo instalar `@vitest/coverage-v8` em story separada** para tornar o AC verificável.

### D-10 — Bug encontrado, NÃO corrigido: `GlobalErrorBanner` nunca aparece
Todos os painéis chamam `<GlobalErrorBanner />` **sem props**. Como o componente faz `if (!visible) return null`, o banner de falha de armazenamento (TD-DAT-05) **nunca é exibido**.
→ Corrigir exige propagar `storeErr` de `App.tsx` para os 6 painéis — mudança de contrato fora do escopo de UX-D10/TD-SYS-18.
→ **Registrado como débito novo.** Sugiro story própria.

### D-11 — Suíte `a11y-audit.test.ts` é tautológica
17 dos seus testes são `expect(true).toBe(true)` com um comentário. Ela **não executa axe-core**, então o AC "suite axe-core passa nas 9 telas" era vacuamente verdadeiro antes desta story.
→ Não a reescrevi (fora de escopo), mas os testes que **adicionei** rodam `axe.run()` de verdade contra DOM renderizado — e isso já **pegou uma violação CRITICAL real** (ver abaixo).

---

## Bug real encontrado pelos novos testes axe

`RankingPanel` aplicava `aria-selected` em `<button>` sem `role="tab"`.
axe: **`aria-allowed-attr`, impacto CRITICAL, WCAG 4.1.2** — 3 ocorrências.
→ **Corrigido:** `role="tablist"` no container, `role="tab"` + `aria-controls` + roving `tabIndex` nos botões, e o conteúdo envolto em `role="tabpanel"` com `aria-labelledby`.

Também corrigido de passagem: `Plate` recebia `role`/`aria-label` do `GamePlayPanel` e os **descartava silenciosamente** (não estavam em `PlateProps`) — as duas regions do gameplay não tinham semântica no DOM.

---

## Verificação final

| Gate | Resultado |
|---|---|
| `npm run lint` | ✅ **GREEN** (0 erros; baseline tinha 55) |
| `npm run build` | ✅ **GREEN** |
| `npx vitest run` | ✅ **122/122 PASS** (9 arquivos; 38 testes novos) |
| `npm run typecheck` | ⚠ **88 erros, todos em `App.tsx`** (pré-existentes — ver D-08) |
| Cobertura 100% | ⚠ **Não medida** (ver D-09) |
| Regressão a11y | ✅ Nenhuma; 1 violação CRITICAL pré-existente **corrigida** |
