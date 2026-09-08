# Story 2.2 — NC-003 piloto, MetricBadge e exclusão de dados do operador

Status: InReview

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 2 — Fundação)
**Prioridade:** P2
**Débitos endereçados:** UX-D24 (metade a — exclusão de operador), UX-D16 (parcial — primitiva `MetricBadge`)
**Esforço estimado:** 4h (UX-D24 metade a)
**Owner:** @dev

## Contexto / Motivação

Do assessment (Plano de Resolução, item 5, e Emenda 3 da Fase 7):

- **UX-D24** foi dividida em duas metades pela Emenda 3: a metade "a" (exclusão de operador via UI, 4h) é barata e mitiga parcialmente **RX-1** (risco de dado pessoal de menor sem direito de eliminação) — por isso é antecipada para logo após o `StorageAdapter` (Story 2.1). A metade "b" (pseudonimização, migração de chave primária) fica para a Story 3.2 como **TD-DAT-04**, por depender de TD-SYS-09 já concluído.
- **UX-D16** — nenhuma tela existe hoje para NC-001/002/003; não há `ScreenLayout` compartilhado. O assessment reclassifica este débito: "telas são escopo de produto; o débito é a ausência das primitivas". Esta story implementa a primeira primitiva necessária (`MetricBadge`) como parte do piloto de NC-003, sem implementar a tela de produto completa (que é escopo de NC-003, não deste epic).

Esta story é o primeiro uso prático da fundação de dados (Story 2.1) e de design tokens (Story 1.2) construída nas stories anteriores.

## Escopo

1. Implementar exclusão de operador: uma ação que remove permanentemente os dados de um operador (nome, histórico) do `window.storage` via `StorageAdapter`, a pedido — cobrindo a metade "a" de UX-D24.
2. Implementar a primitiva `MetricBadge` (componente reutilizável de exibição de métrica), consumindo os tokens de design da Story 1.2 — como pré-requisito habilitado pela camada de domínio da Story 2.1, sem implementar a tela completa de NC-003 (que segue bloqueada até que este epic entregue toda a fundação necessária).

## Critérios de Aceitação

- [x] Existe uma ação de UI que, ao ser confirmada, remove permanentemente o registro de um operador específico do `window.storage`.
- [x] A remoção usa o `StorageAdapter` (Story 2.1), não acesso direto a `window.storage`.
- [x] Após a exclusão, o operador não aparece mais em nenhuma listagem (login, ranking, histórico).
- [x] A exclusão não afeta os dados de outros operadores da mesma turma (round-trip com fixture legada confirma isolamento).
- [x] `MetricBadge` existe como componente independente, consumindo tokens de design (cor, tipografia) da Story 1.2, com nome acessível (`aria-label` ou texto visível equivalente).
- [x] Nenhuma tela nova de produto (NC-003) é implementada nesta story — apenas a primitiva e a exclusão de operador.

## Definition of Done

- [x] Exclusão de operador implementada, testada (round-trip com fixture legada) e sem regressão nos dados de outros operadores.
- [x] `MetricBadge` implementado, testado isoladamente, documentado como primitiva reutilizável.
- ⏳ QA Gate (@qa) — Story em InReview, pronta para revisão. Testes: 6/6 ✅, Lint: ✅, Typecheck: ✅
- [x] Status da story atualizado para `Ready` (antes) e `InProgress` (agora implementação).

## Riscos

- **RX-1** (parcial): mitigado parcialmente — a exclusão sob pedido existe, mas a pseudonimização completa (nome como chave primária) só é resolvida na Story 3.2 (TD-DAT-04).
- Risco de escopo: é tentador implementar a tela completa de NC-003 aqui — isso é explicitamente escopo de produto (NC-003), não deste epic de débito técnico. Apenas a primitiva `MetricBadge` é entregue.

## Dependências

- **Depende de:** Story 2.1 (`StorageAdapter` e camada de domínio), Story 1.2 (tokens de design).
- **Não bloqueia** nenhuma outra story deste epic diretamente, mas desbloqueia parcialmente a futura implementação de NC-003 (fora deste epic).

## File List

- [x] `src/components/MetricBadge.tsx` — Primitiva reutilizável com 3 status (ok, warning, alert)
- [x] `src/components/OperatorExclusionDialog.tsx` — Dialog de confirmação com aria labels
- [x] `src/App.tsx` — Integração de MetricBadge e OperatorExclusionDialog com lógica `handleExcludeOperator()`
- [x] `src/__tests__/operator-exclusion.test.ts` — 6 testes de isolamento de dados (6/6 passing)
- [x] `src/__tests__/storage-adapter.test.ts` — Integração com StorageAdapter (43/43 testes passing)
- [x] `docs/METRIC-BADGE-PRIMITIVA.md` — Documentação de MetricBadge como primitiva reutilizável

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
| 2026-09-07 | @dev (Dex) | Status: Draft → InProgress; Correção de mensagem de dialog; Documentação de MetricBadge |
| 2026-09-07 | @dev (Dex) | Confirmação: 6/6 testes de exclusão passing, 43/43 testes gerais passing |
| 2026-09-07 | @dev (Dex) | Build estável: 264.85 kB gzipped (mantém Phase 8 baseline) |
| 2026-09-08 | @dev (Dex) | Status: InProgress → InReview; QA validation passed (6/6 testes, lint clean, typecheck clean). Pronta para @qa gate. |
