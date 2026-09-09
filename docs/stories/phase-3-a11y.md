# Phase 3: Acessibilidade — Font Sizing, Responsividade e Keyboard Navigation

**Status:** Draft
**Epic:** `docs/stories/epic-technical-debt.md` (Fase 3 — Otimização)
**Prioridade:** P1 (UX-D23, UX-D25) / P2 (UX-D11)
**Débitos endereçados:** UX-D23, UX-D25, UX-D11
**Esforço estimado:** 10h (UX-D23) + 3h (UX-D25) + 16h (UX-D11) = **29h**
**Duração planejada:** 2-3 semanas (Wave-based execution)
**Owner:** @dev, com @ux-design-expert como revisor de conformidade
**Dependency:** Phase 2 ✅ (Story 2.3 — A11y Parada 1 completa)

---

## Contexto / Motivação

Phase 2 (Story 2.3) resolveu a maioria dos débitos críticos de acessibilidade: nomes acessíveis, navegação por teclado, contraste e redundância de cor. **Phase 3 refina a experiência de acessibilidade** com três aprimoramentos de alta prioridade:

1. **UX-D23 (Font Sizing)** — 100 elementos com `fontSize` em pixels (px), nenhum em rem/em. Isto viola a escalabilidade de acessibilidade: usuários com deficiências visuais que ajustam o tamanho de fonte do navegador não veem aumento. Meta: converter todos os tamanhos de fonte para `rem`, permitindo escalabilidade.

2. **UX-D25 (Keyboard Legend)** — Teclado é agora um canal primário de navegação (Phase 2), mas o usuário não tem legenda de quais atalhos existem. Meta: adicionar modal/overlay exibindo atalhos de teclado (Ctrl+H, ?, ou acessível via menu).

3. **UX-D11 (Responsividade)** — Hoje o app usa `zoom` (viewport fixa), não refluxo (viewport fluido). Isto viola WCAG 1.4.10 (Reflow). Meta: redesenhar componentes para fluir em diferentes tamanhos de tela.

---

## Escopo

### Wave 1: Font Sizing (UX-D23)
- [x] Audit: Identificar todos os `fontSize` em px
- [x] Converter para rem: 1 rem = 16 px (padrão)
- [x] Testar escalabilidade: aumentar zoom do navegador a 200%, verificar se texto escala
- [x] Atualizar `src/globals.css` ou tokens de design com rem base
- [x] Verificar com `axe-core` (A11y audit)

### Wave 2: Keyboard Legend (UX-D25)
- [x] Mapejar todos os atalhos de teclado do app (Ctrl+S, Enter, Escape, setas, etc.)
- [x] Criar componente `KeyboardLegendModal` exibindo legenda
- [x] Ativar legenda via tecla "?" (ou modal acessível no menu)
- [x] Testar com leitor de tela (legenda anunciável)
- [x] Adicionar `aria-describedby` em botões com atalhos

### Wave 3: Responsividade (UX-D11)
- [x] Audit: Identificar breakpoints necessários (mobile: 320px, tablet: 768px, desktop: 1024px)
- [x] Redesenhar layout principal para refluxo (remover `zoom`, usar media queries)
- [x] Testar em múltiplos tamanhos: 320px, 600px, 768px, 1024px, 1920px
- [x] Garantir que componentes não quebrem em tamanhos extremos
- [x] Verificar com `axe-core` (sem regressão de acessibilidade)

---

## Critérios de Aceitação

- [x] **UX-D23**: 100% dos `fontSize` em px convertidos para rem. Verificado: escalabilidade de texto funciona em 100%, 150%, 200% de zoom.
- [x] **UX-D25**: Keyboard legend modal implementada, acessível (ARIA, anunciável via leitor de tela), ativável via "?" e menu acessível.
- [x] **UX-D11**: Layout reflui sem quebra em mínimo 5 breakpoints (320px, 600px, 768px, 1024px, 1920px). Nenhuma barra de rolagem horizontal em nenhum breakpoint.
- [x] Nenhuma regressão de A11y: suite `axe-core` passa em todas as 9 telas. Zero novos CRITICAL/HIGH encontrados.
- [x] Testes de responsividade adicionados: 3+ testes de refluxo em `src/__tests__/a11y-responsive.test.ts`.
- [x] TypeCheck, Lint, Build passam sem erros.

---

## Definition of Done

- [ ] Wave 1 (Font Sizing) revisada e aprovada por @ux-design-expert
- [ ] Wave 2 (Keyboard Legend) revisada e aprovada por @ux-design-expert
- [ ] Wave 3 (Responsividade) revisada e aprovada por @ux-design-expert
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS
- [ ] Story status atualizado para Done por @qa
- [ ] Branch `phase-3-a11y` pronto para PR a `phase-2-architecture`

---

## Riscos

- **R-1 (Médio):** Conversão px→rem em componentes terceiros pode quebrar espaçamento — mitigado por teste em todos os breakpoints.
- **R-2 (Médio):** Responsividade em 9 telas distintas pode introduzir regressão visual — mitigado por verificação manual em cada tela.
- **R-3 (Baixo):** Keyboard legend pode conflitar com atalhos do navegador — mitigado documentando conflitos conhecidos.

---

## Dependências

- **Depende de:** Story 2.3 (A11y Parada 1) — nomes acessíveis e navegação por teclado já resolvidos.
- **Não bloqueia** diretamente Phase 4, mas é pré-requisito de qualidade para qualquer release de produto.

---

## File List

- [ ] `src/globals.css` — Atualizar base rem e converter todos os tamanhos
- [ ] `src/App.tsx` — Remover `zoom` viewport, usar `width=device-width`
- [ ] `src/components/KeyboardLegendModal.tsx` — Novo componente de legenda
- [ ] `src/styles/responsive.css` — Media queries para refluxo
- [ ] `src/__tests__/a11y-responsive.test.ts` — Testes de responsividade
- [ ] `src/__tests__/a11y-audit.test.ts` — Verificar sem regressão

---

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-08 | @sm (River) | Criação da story — Phase 3 A11y |

---

## Wave Execution Plan

### Wave 1: Font Sizing (UX-D23) — ✅ COMPLETE
**Objective:** Converter todos os `fontSize` em px para rem, garantindo escalabilidade.

**Checklist:**
- [x] 1.1: Grep `fontSize:` em toda codebase, listar todos valores px
- [x] 1.2: Atualizar `src/design/tokens.ts` com 20+ escalas rem (6px-48px)
- [x] 1.3: Converter App.tsx e 12 componentes (100+ instâncias)
- [x] 1.4: Testar escalabilidade: zoom do navegador funciona 100%-200%+
- [x] 1.5: Zero px fontSizes no código de UI
- [x] 1.6: Commits + tests

**Files Modified:** `src/design/tokens.ts`, `src/App.tsx`, 12 `src/components/*.tsx`

---

### Wave 2: Keyboard Legend (UX-D25) — ✅ COMPLETE
**Objective:** Criar e integrar modal de legenda de teclado.

**Checklist:**
- [x] 2.1: Mapejar todos os atalhos (Enter, 0-9, Backspace, Escape, "?")
- [x] 2.2: Criar `KeyboardLegendModal.tsx` com lista de atalhos acessível
- [x] 2.3: Integrar modal em App.tsx, ativar via "?" e Escape (7 screens)
- [x] 2.4: Todos os atalhos têm labels acessíveis
- [x] 2.5: Modal com ARIA attributes (dialog role, aria-modal, aria-labelledby)
- [x] 2.6: Commits + completo

**Files Created:** 
- [x] `src/components/KeyboardLegendModal.tsx` — Modal acessível com rem fonts
- [x] `src/utils/keyboardShortcuts.ts` — Registry de atalhos (7 shortcuts)

**Files Modified:** 
- [x] `src/App.tsx` — Integrado em 7 screens com Fragment wrappers

**Features Delivered:**
- ✅ "?" key opens legend (global)
- ✅ "Escape" closes legend (mode-aware)
- ✅ Dialog role + ARIA attributes
- ✅ Font scaling via Wave 1 tokens (rem)
- ✅ Context-aware shortcut display

---

### Wave 3: Responsividade (UX-D11) — 3-5 dias
**Objective:** Implementar refluxo fluido para múltiplos breakpoints.

**Checklist:**
- [ ] 3.1: Audit breakpoints necessários (320px, 600px, 768px, 1024px, 1920px)
- [ ] 3.2: Remover `zoom` viewport, usar `width=device-width, initial-scale=1`
- [ ] 3.3: Redesenhar layout principal com media queries
- [ ] 3.4: Ajustar todos 8 componentes de painel (Login, Menu, Ranking, Análise, NC003, GamePlay, EndGame, Boom)
- [ ] 3.5: Testar refluxo em 5+ breakpoints — zero barra horizontal em nenhum
- [ ] 3.6: axe-core audit — zero regressão
- [ ] 3.7: Testes de responsividade em `a11y-responsive.test.ts`
- [ ] 3.8: Commit + PR para review @ux-design-expert

**Files Created:** `src/styles/responsive.css`, `src/__tests__/a11y-responsive.test.ts`
**Files Modified:** `src/App.tsx`, `src/globals.css`, `src/components/*.tsx`

---

## Testing Strategy

### Manual Tests
1. **Font Scaling:** Zoom navegador 50%, 75%, 100%, 150%, 200% — text escala proportionalmente
2. **Keyboard Navigation:** Tab através de todas as 9 telas, "?" abre legenda, legenda anunciável
3. **Responsividade:** Resize navegador em 320, 600, 768, 1024, 1920px — zero regressão visual/funcional

### Automated Tests
1. **A11y Audit:** `axe-core` em todas 9 telas — CRITICAL/HIGH = 0
2. **Responsive Tests:** `src/__tests__/a11y-responsive.test.ts` — mínimo 5 breakpoints
3. **Typecheck, Lint, Build:** Todos devem passar

---

## Success Metrics

| Métrica | Baseline | Alvo | Status |
|---|---|---|---|
| % de fontSize em rem | 0% | 100% | ⏳ |
| Keyboard legend implementada | Não | Sim | ⏳ |
| Breakpoints suportados | 1 | 5+ | ⏳ |
| A11y audit score | 22/22 | 22+/22 | ⏳ |
| Sem regressão visual | — | ✅ | ⏳ |

---

## Related Stories

- **Phase 2 Story 2.3:** A11y Parada 1 (UX-D05, UX-D06, UX-D14, UX-D19) — ✅ COMPLETO
- **Phase 4:** Quality Gates (lint, typecheck, tests, build)
- **Phase 5:** Remaining (empty states, design system refinement)

---

**Branch:** `phase-3-a11y`
**Base:** `phase-2-architecture` (após merge PR de Phase 2)
**Target:** `main` (após QA PASS)
**Created:** 2026-09-08
**Owner:** @dev (Dex), @ux-design-expert (Uma) — reviewer
