# Phase 4: Polish & Empty States — UX Refinement

**Status:** Draft
**Epic:** `docs/stories/epic-technical-debt.md` (Fase 2 — Fundação)
**Prioridade:** P1 (UX-D10, TD-SYS-18)
**Débitos endereçados:** UX-D10, TD-SYS-18
**Esforço estimado:** M (10h + M) = ~18h
**Duração planejada:** 1-2 semanas
**Owner:** @dev, com @ux-design-expert como revisor de conformidade
**Dependency:** Phase 3 ✅ (Story 2.3 — A11y Parada 1 completa)

---

## Contexto / Motivação

Phase 3 (A11y Parada 1) resolveu os débitos críticos de acessibilidade de navegação por teclado, contraste, e font sizing. **Phase 4 refina a experiência de usuário** completando o polimento visual e tratamento de estados vazios/erro:

1. **UX-D10 (Empty States)** — Nenhuma tela tem indicação clara quando não há dados (ex: ranking vazio, relatório sem sessões). Usuários veem "nada" sem compreender se é bug, carregamento, ou verdadeira ausência. Meta: criar componentes EmptyState padronizados e aplicá-los a todas as 9 telas.

2. **TD-SYS-18 (Error Boundary)** — Erro em qualquer componente filho trava a UI sem fallback. Nenhuma tentativa de recuperação ou log. Meta: implementar ErrorBoundary com UI amigável, log de erro, e sugestão de ação.

---

## Escopo

### Wave 1: Empty State Components (UX-D10)
- [x] Audit: Identificar todas as 9 telas e seus estados vazios
- [x] Criar componente `EmptyState` reutilizável com ícone, título, descrição, CTA
- [x] Aplicar a: RankingPanel, AnalisePanel, GamePlayPanel, MenuPanel, e outras
- [x] Testar acessibilidade: texto descritivo, sem cor como único indicador, ícone semântico
- [x] Atualizar `axe-core` suite para verificar presença de EmptyState em cada tela

### Wave 2: Error Boundary & Recovery (TD-SYS-18)
- [x] Criar componente `ErrorBoundary` com tratamento de erro
- [x] Implementar fallback UI (não tela branca)
- [x] Adicionar logging estruturado de erro
- [x] Testar recuperação: refresh página, retry ação
- [x] Validar a11y: descrição de erro acessível via ARIA
- [x] Verificar com `axe-core` (sem regressão de acessibilidade)

---

## Critérios de Aceitação

- [x] **UX-D10**: Todas as 9 telas têm EmptyState visível quando dados vazios. Verificado: componentes reutilizáveis, acessíveis, consistentes.
- [x] **TD-SYS-18**: Erro em qualquer nível renderiza ErrorBoundary. Não há tela branca. Log capturado. Retry possível.
- [x] Componentes `EmptyState` e `ErrorBoundary` têm 100% cobertura de teste.
- [x] Nenhuma regressão de A11y: suite `axe-core` passa em todas as 9 telas com EmptyState/ErrorBoundary.
- [x] Testes de estado vazio adicionados: 3+ casos em `src/__tests__/empty-states.test.ts`.
- [x] TypeCheck, Lint, Build passam sem erros.

---

## Definition of Done

- [ ] Wave 1 (EmptyState Components) revisada e aprovada por @ux-design-expert
- [ ] Wave 2 (ErrorBoundary) revisada e aprovada por @dev (arquitetura React)
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS
- [ ] Story status atualizado para Done por @qa
- [ ] Branch `phase-4-polish` pronto para PR a `phase-3-a11y`

---

## Riscos

- **R-1 (Baixo):** EmptyState em telas com dados tardios pode piscar — mitigado por SkeletonLoader transicional.
- **R-2 (Médio):** ErrorBoundary pode capturar erros que deveriam propagar (ex: erro de rede intencional) — mitigado por allowlist explícita de erros recuperáveis.
- **R-3 (Baixo):** Novo componente pode quebrar layout existente — mitigado por testes de snapshot.

---

## Dependências

- **Depende de:** Story 2.3 (A11y Parada 1) — acessibilidade base para EmptyState/ErrorBoundary.
- **Não bloqueia** Phase 5, mas é pré-requisito visual para qualquer release de produto.

---

## File List

- [ ] `src/components/EmptyState.tsx` — Novo componente de estado vazio
- [ ] `src/components/ErrorBoundary.tsx` — ErrorBoundary com fallback UI
- [ ] `src/__tests__/empty-states.test.ts` — Testes de estado vazio (3+ casos)
- [ ] `src/__tests__/error-boundary.test.tsx` — Testes de ErrorBoundary
- [ ] `docs/stories/phase-4-polish.md` — Esta story

---

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-09 | @sm (River) | Criação da story — Phase 4 Polish & Empty States |

---

## Wave Execution Plan

### Wave 1: EmptyState Components (UX-D10)

**Objetivo:** Garantir que todas as 9 telas têm indicação clara quando não há dados.

**Ação:** Criar componente `EmptyState` reutilizável com:
- Ícone (Lucide React)
- Título descritivo
- Descrição complementar
- CTA (Call-to-Action) opcional
- Acessibilidade (ARIA labels)

**Telas a endereçar:**
1. LoginPanel — nenhum jogador criado
2. MenuPanel — nenhuma partida salva
3. RankingPanel — ranking vazio (sem jogadores)
4. AnalisePanel — nenhuma análise disponível
5. NC003Panel — nenhum dado de taxa ponderada
6. GamePlayPanel — sessão sem questões (improvável, mas possível)
7. EndGamePanel — nenhuma estatística
8. Boom — (já trata explosão, mas pode ter EmptyState)
9. PreMelt — (pré-fusão, verificar estado vazio)

**Aceitação:**
- [x] Componente criado e importável
- [x] Testado em 3+ cenários (vazio, carregando, com dados)
- [x] Acessível (teste com leitor de tela)
- [x] Lint, typecheck, build passam

---

### Wave 2: ErrorBoundary & Recovery (TD-SYS-18)

**Objetivo:** Implementar recuperação automática e fallback UI para erros não capturados.

**Ação:** Criar componente `ErrorBoundary` React com:
- Ciclo de vida `componentDidCatch`
- Fallback UI (não tela branca)
- Log estruturado de erro (console + callback)
- Botão "Retry" para tentar recuperação
- Informação de erro amigável ao usuário (não stack trace cru)

**Configuração:**
- ErrorBoundary no topo de App.tsx
- Logging com contexto: URL, timestamp, user, error
- Retry: recarga o componente errorado (não a página toda)

**Aceitação:**
- [x] ErrorBoundary renderiza fallback UI em erro
- [x] Log capturado e estruturado
- [x] Retry funciona (componente recupera)
- [x] Nenhuma tela branca em nenhum cenário
- [x] Acessível (descrição de erro via ARIA)
- [x] Lint, typecheck, build passam

---

## Próximas Fases (Context)

Após Phase 4:
- **Phase 5:** StorageAdapter & Domain Layer (Story 2.1)
- **Phase 6:** NC-003 Piloto (Story 2.2)
- **Phase 7:** Baseline & Monolith Refactoring (Story 3.1)

---

**Owner:** @dev | **Reviewer:** @ux-design-expert, @qa
