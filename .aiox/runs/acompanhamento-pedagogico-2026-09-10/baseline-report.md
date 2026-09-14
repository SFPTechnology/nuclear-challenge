# Baseline - acompanhamento pedagogico

## Estado inicial

- Worktree possui alteracoes pre-existentes; nenhuma foi revertida.
- Aplicacao grava diretamente em `window.storage` dentro de `src/App.tsx`.
- `src/adapters/StorageAdapter.ts` usa `window.localStorage` e nao e usado pelo App.
- `src/domain/storage/WindowStorageAdapter.ts` usa contrato diferente, baseado em `window.storage[key]`.
- `bump` acumula respostas na sessao atual.
- `saveResult` consolida em `win`, `lose` e `quit`; `pause` nao e salvo.
- `docs/estrutura-acompanhamento.md` define `stats`, `studyLog`, calendario, prioridade e compatibilidade legada.

## Riscos confirmados

1. Tres contratos de storage coexistem.
2. Persistencia direta impede testar o fluxo real via adapter.
3. `localStorage` viola a restricao do produto.
4. Ausencia do host pode deixar dados somente em memoria.
5. A Story 2.1 esta `InProgress` e registra dependencia documental da Story 1.3 como bloqueador ativo.

## Matriz de baseline

| Area | Estado |
|---|---|
| Registro de hit/miss | existente em sessao |
| `stats.tabs`, `stats.ops`, `stats.forms` | existente |
| `studyLog` por data local | existente |
| Consolidacao ao finalizar | existente |
| Adapter canonico integrado | pendente |
| Schema/migracao v1 | pendente |
| Estado de saude consumivel | parcial |
| Round-trip via adapter real | pendente |
| Calendario e prioridade | existentes, requerem regressao apos integracao |
