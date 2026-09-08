# Story NC-001 — Modo de treino dirigido

Status: Blocked — aguardando projeto executável

## Objetivo

Como aluno, quero praticar exclusivamente as tabuadas apontadas como fracas pela análise, para transformar o diagnóstico em prática.

## Escopo rastreado

- Ler `players[player].stats.tabs`.
- Ordenar fatores por desempenho.
- Reutilizar o gerador de operações com fatores obrigatórios.
- Operar sem reator e sem timer, mantendo uma meta leve de acertos consecutivos conforme o roadmap.

## Critérios de aceitação

- [ ] O modo seleciona fatores fracos a partir de dados existentes.
- [ ] Não usa fatores fora do conjunto selecionado, salvo fallback documentado para dados vazios.
- [ ] Não altera a partida normal nem a física existente.
- [ ] Não usa `localStorage`/`sessionStorage`.
- [ ] CLI/contrato observável definido antes da UI.
- [ ] Testes cobrem ordenação, dados vazios, acerto, erro e atualização de estatísticas.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## File List

- [ ] A definir após provisionamento do projeto executável.
