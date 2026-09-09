# Story 1.3 — Qualidade real: globals, lint, runner de teste, testes comportamentais e typecheck

Status: Draft — 🔺 **TOP OF QUEUE**

> 🔺 **TOP OF QUEUE (elevada por @po em 2026-09-09, ação A5).** Esta é a **próxima story a ser trabalhada**, à frente de qualquer outra do roadmap. Motivo: é **pré-requisito duro da Story 2.1**, que já está `InProgress` — a toolchain de teste desta story é o único meio de validar as invariantes I1-I8 que a Story 2.1 precisa nos seus ACs. Enquanto esta story ficar em `Draft`, a Story 2.1 não pode ir a `Done` e a Story 2.2 permanece bloqueada em cascata. Requer validação de @po (`Draft → Ready`) com urgência.

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 1 — Quick Wins)
**Prioridade:** P0 (crítica — reconstrói a rede de segurança do projeto) — **P0 / TOP OF QUEUE**: bloqueia Stories 2.1, 2.2 e 3.1
**Débitos endereçados:** TD-SYS-19, TD-SYS-02, TD-QA-01, TD-SYS-03, TD-SYS-01 (nesta ordem obrigatória)
**Esforço estimado:** S (TD-SYS-19) + M (TD-SYS-02) + S (TD-QA-01) + L (TD-SYS-03) + XL (TD-SYS-01)
**Owner:** @dev, com gate final de @qa

## Contexto / Motivação

Esta é a story mais crítica de fundação do epic. O assessment prova, por mutação de código controlada (§Prova empírica de que o gate de teste não protege), que a rede de segurança atual **não existe de fato**:

> "O gate aprova a destruição total do recurso e reprova a formatação correta dele." — mutante A (pausa/retomar quebrados) passa; mutante B (reformatação correta) falha.

Os cinco débitos abaixo formam uma cadeia de dependência sequencial estrita (Plano de Resolução, item 3 — "nesta ordem"):

1. **TD-SYS-19** — `globals` incompletos no ESLint. Correção obrigatória primeiro porque é "armadilha embutida na correção de TD-SYS-02, confirmada pelo `@qa`" — corrigir o lint sem antes corrigir os globals reintroduz o mesmo problema.
2. **TD-SYS-02** — gate de lint cobre ~2% do código (o `.tsx` de 1.342 linhas está excluído via `files` no config), zero plugins React/hooks/a11y/security.
3. **TD-QA-01** — não existe toolchain de teste comportamental. Decisão já adotada pelo `@qa` na Fase 7: **Vitest + `happy-dom`** para componente; `node --test` ou Vitest puro sem DOM para domínio. Trade-off aceito conscientemente: acopla a estratégia de teste ao Vite, considerado aceitável porque o custo de manter duas configs de build hoje é maior que o custo de uma migração hipotética futura.
4. **TD-SYS-03** — os testes atuais usam regex sobre texto-fonte, não testam comportamento. Consequência normativa do assessment: **regex sobre código-fonte fica proibida como evidência de comportamento; os 2 testes de regex atuais são deletados** ao entrar a invariante I6. Definição de pronto: as 8 invariantes executáveis I1-I8 (ver tabela abaixo), não percentual de cobertura.
5. **TD-SYS-01** — `typecheck` cego: `@ts-nocheck` na linha 1 do único arquivo de aplicação, reforçado por `strict:false` e `checkJs:false`. Verificação efetiva ≈ 0%. Este é o item de maior esforço (XL) da Fase 1.

## Escopo

1. Completar os `globals` do ESLint config (TD-SYS-19).
2. Remover a exclusão do `.tsx` principal do `files` do ESLint config; adicionar plugins `eslint-plugin-react-hooks`, `jsx-a11y` e um plugin de segurança básico (TD-SYS-02). Isso também inicia o gate de regressão contínua T6 (ratchet de `@ts-nocheck`: o gate falha se o número de arquivos suprimidos aumentar).
3. Configurar Vitest + `happy-dom` para testes de componente; `node --test` ou Vitest puro sem DOM para testes de domínio (TD-QA-01).
4. Deletar os 2 testes de regex existentes (`tests/pause-contract.test.mjs` e equivalente) e implementar as 8 invariantes executáveis I1-I8 (TD-SYS-03):

| # | Invariante | Fonte |
|---|---|---|
| I1 | `rankIdx` nunca decresce | Fase 1 §8.6 |
| I2 | Divisão gera fatores corretos e sem resto nas 5 fases | Fase 1 §8.6 |
| I3 | `mergeStudyLog` é aditivo e não destrói dias anteriores | Fase 1 §8.3 |
| I4 | Merge do registro preserva campos desconhecidos (fecha TD-DAT-01 definitivo) | Fase 7 — T1.1 |
| I5 | Física: `heat`, `integrity`, `coolant` evoluem independentemente | Fase 1 §8.1 |
| I6 | Pausa não persiste resultado; retomar devolve estado intacto | Fase 1 §3.3 |
| I7 | Geração de operações respeita `DIFF[n].range`/`ops` nas 5 fases | Fase 1 §3.1 |
| I8 | Pontuação e `best[diff]` são monotônicos por fase | L389 |

5. Remover `@ts-nocheck` do arquivo de aplicação principal; ativar `strict: true` e `checkJs: true` no `tsconfig` (TD-SYS-01).

## Critérios de Aceitação

- [ ] ESLint config com `globals` completos, sem falsos negativos de variável indefinida.
- [ ] O `.tsx` principal (1.342 linhas) está sob cobertura do lint; plugins `eslint-plugin-react-hooks` e `jsx-a11y` ativos e sem erros CRITICAL/HIGH pendentes.
- [ ] Vitest + `happy-dom` configurado e executando; `node --test` (ou Vitest sem DOM) configurado para domínio.
- [ ] Os 2 testes de regex antigos foram deletados.
- [ ] As 8 invariantes I1-I8 estão implementadas como testes executáveis e passam.
- [ ] Reaplicação do teste de mutação do assessment (mutante A: pausa/retomar quebrados; mutante B: reformatação correta) confirma que o novo gate **reprova A e aprova B** — inversão do resultado documentado no assessment.
- [ ] `@ts-nocheck` removido do arquivo de aplicação principal.
- [ ] `tsconfig` com `strict: true` e `checkJs: true`; `npm run typecheck` executa sem erro ou com lista de erros pré-existentes documentada e priorizada para correção incremental (aceitável se o volume for muito grande, desde que documentado — não é razão para reintroduzir `@ts-nocheck`).
- [ ] Gate de ratchet T6 configurado: falha se o número de arquivos com `@ts-nocheck` aumentar em relação ao commit anterior.

## Definition of Done

- [ ] `npm run lint`, `npm test` e `npm run typecheck` executam e passam (ou com erros pré-existentes documentados e não crescentes).
- [ ] Evidência de reaplicação do teste de mutação anexada à story (prova de que a inversão ocorreu).
- [ ] QA Gate (@qa) executado e com verdicto PASS/CONCERNS antes de mover para Done.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **R1** (Alta→Confirmada, Crítico): esta story é a mitigação direta e completa de R1.
- Risco de esforço: TD-SYS-01 é XL — pode exigir quebra em sub-tarefas incrementais dentro desta mesma story (arquivo por arquivo) se o volume de erros de tipo for grande. Isso não deve bloquear a entrega dos outros 4 débitos da story.
- Risco de ordem: executar TD-SYS-02 antes de TD-SYS-19, ou TD-SYS-01 antes de TD-SYS-03, reintroduz problemas já documentados no assessment — a ordem desta story não é arbitrária.

## Dependências

- **Depende de:** Story 1.1 (estrutura `src/` estável, necessária para configuração de lint/build).
- **Bloqueia:** Story 2.1 (StorageAdapter — precisa de toolchain de teste real para os testes de round-trip T1 e para as invariantes I1-I8), Story 3.1 (baseline de caracterização T3 pressupõe toolchain funcional), e **em cascata** a Story 2.2 (que depende da 2.1).
- ⚠️ **Inversão de ordem em curso:** a Story 2.1 já está `InProgress` sem que esta story tenha sido concluída. É por isso que esta story foi elevada a TOP OF QUEUE — a ordem do epic não é arbitrária (ver §Riscos, "Risco de ordem").

## File List

- [ ] A definir durante a implementação (`eslint.config.js`, `vitest.config.*`, `tsconfig.json`, arquivos de teste).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
| 2026-09-09 | @po (Pax) | **Elevada a TOP OF QUEUE (ação A5).** @pm flagou que esta story é pré-requisito **duro** da Story 2.1 — a toolchain é o único meio de validar as invariantes I1-I8 exigidas nos ACs da 2.1. Manter esta story em `Draft` enquanto a 2.1 está `InProgress` é uma inversão de ordem que o próprio assessment adverte contra. Prioridade reafirmada P0 e marcada como próxima da fila; dependência de bloqueio documentada em cascata (2.1 → 2.2). Status permanece `Draft` porque a transição `Draft → Ready` exige validação formal (`*validate-story-draft`) — a elevação é de **urgência/posição na fila**, não um atalho de gate. |
