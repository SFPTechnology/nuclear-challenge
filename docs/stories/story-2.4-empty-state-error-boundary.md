# Story 2.4 — Empty states e ErrorBoundary

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 2 — Fundação)
**Prioridade:** P1 (UX-D10) / P2 (TD-SYS-18)
**Débitos endereçados:** UX-D10, TD-SYS-18
**Esforço estimado:** 10h (UX-D10) + M (TD-SYS-18)
**Owner:** @dev

## Contexto / Motivação

Do assessment (Plano de Resolução, item 7):

- **UX-D10** — sem empty states, apesar de ser um AC explícito de NC-001 e NC-002. Consequência documentada: "professor lê ausência de dado como produto quebrado".
- **TD-SYS-18** — zero observabilidade e zero recuperação de erro no nível de aplicação. A face de runtime deste débito (o que o usuário vê quando algo falha) está documentada em TD-DAT-05, já corrigido no nível de guarda pela Story 0.1 (`storeErr` global). Esta story entrega a correção estrutural completa: um `ErrorBoundary` de aplicação.

Ambos os débitos dependem apenas dos tokens de design (Story 1.2) para consistência visual — não dependem do `StorageAdapter` (Story 2.1), por isso podem avançar em paralelo a ela.

## Escopo

1. Implementar um componente `EmptyState` reutilizável, consumindo tokens de design (Story 1.2), para uso em qualquer tela/listagem sem dados (ex.: turma sem partidas registradas ainda).
2. Implementar `ErrorBoundary` de aplicação (nível React), capturando erros de renderização não tratados e exibindo uma tela de recuperação em vez de tela branca.
3. Conectar o `ErrorBoundary` ao estado `storeErr` global já implementado na Story 0.1, unificando a comunicação de falhas de storage e falhas de renderização em um único padrão visual.

## Critérios de Aceitação

- [ ] `EmptyState` existe como componente reutilizável, com nome acessível e mensagem clara (ex.: "Nenhuma partida registrada ainda"), consumindo tokens de design.
- [ ] `EmptyState` é usado em pelo menos um ponto real do produto onde hoje a ausência de dado é indistinguível de erro (ex.: listagem de resultados vazia).
- [ ] `ErrorBoundary` de aplicação captura erros de renderização e exibe uma tela de recuperação (não tela branca, não crash silencioso).
- [ ] A tela de erro do `ErrorBoundary` reutiliza o padrão visual do `storeErr` global (Story 0.1), evitando dois sistemas de erro divergentes.
- [ ] Nenhuma regressão nas telas existentes.

## Definition of Done

- [ ] `EmptyState` e `ErrorBoundary` implementados, testados e documentados.
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- Risco de escopo: `EmptyState` não deve virar a tela completa de NC-001/002 (escopo de produto) — apenas a primitiva reutilizável, igual à abordagem da Story 2.2 com `MetricBadge`.

## Dependências

- **Depende de:** Story 1.2 (tokens de design), Story 0.1 (`storeErr` global já existente).
- **Não bloqueia** outras stories deste epic.

## File List

- [ ] A definir durante a implementação (componente `EmptyState`, `ErrorBoundary`).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
