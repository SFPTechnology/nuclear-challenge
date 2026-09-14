# Story 1.3 — Qualidade real: globals, lint, runner de teste, testes comportamentais e typecheck

Status: Draft

> 🔺 **TOP OF QUEUE (elevada por @po em 2026-09-09, ação A5).** Esta é a **próxima story a ser trabalhada**, à frente de qualquer outra do roadmap. Motivo: é **pré-requisito duro da Story 2.1**, que já está `InProgress` — a toolchain de teste desta story é o único meio de validar as invariantes I1-I8 que a Story 2.1 precisa nos seus ACs. Enquanto esta story ficar em `Draft`, a Story 2.1 não pode ir a `Done` e a Story 2.2 permanece bloqueada em cascata. Requer validação de @po (`Draft → Ready`) com urgência.

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 1 — Quick Wins)
**Prioridade:** P0 (crítica — reconstrói a rede de segurança do projeto) — **P0 / TOP OF QUEUE**: bloqueia Stories 2.1, 2.2 e 3.1
**Débitos endereçados:** TD-SYS-19, TD-SYS-02, TD-QA-01, TD-SYS-03, TD-SYS-01 (nesta ordem obrigatória)
**Esforço estimado:** S (TD-SYS-19) + M (TD-SYS-02) + S (TD-QA-01) + L (TD-SYS-03) + XL (TD-SYS-01)
**Owner:** @dev, com gate final de @qa

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - "architecture_review"
  - "code_review"
  - "pattern_validation"
```

**Nota de reconciliação:** o template v2 mapeia trabalho de código/lógica com executor `@dev` para quality gate `@architect`; por isso este campo não declara `@qa`. O veredito de QA e a execução dos comandos de qualidade continuam registrados nas seções próprias e não são dispensados por este ajuste.

## Story

**Como** mantenedor do Nuclear Challenge,
**quero** que lint, typecheck e testes comportamentais validem o código de aplicação real,
**para que** regressões de física, progresso, persistência, geração de operações e pausa não sejam aprovadas por gates vacuosos.

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

## Baseline factual reconciliado em 2026-09-10

Esta seção registra a árvore e as configurações verificadas durante a preparação; não conclui nenhum critério de aceitação.

- `package.json` já declara `vitest`, `happy-dom` e `@testing-library/react`; seus scripts atuais são `lint: eslint src --max-warnings=0`, `typecheck: tsc --noEmit` e `test: vitest`.
- `vitest.config.ts` já usa `happy-dom`, `globals: true`, aliases para `src/` e inclui `src/**/*.{test,spec}.{ts,tsx}`. A implementação deve validar/ajustar esta configuração existente, não criar uma segunda toolchain.
- `tsconfig.json` já contém `strict: true`, mas não declara `checkJs: true`; `src/App.tsx` não contém `@ts-nocheck`.
- `eslint.config.js` já cobre `src/**/*.{ts,tsx}`, mas não declara plugins React Hooks, `jsx-a11y` ou segurança. O script de lint executa somente sobre `src/`.
- Há um único teste regex rastreado: `tests/pause-contract.test.mjs`, ainda apontando para `Arquivos_Diversos/nuclear-challenge-app.tsx`. Nenhum segundo equivalente foi localizado; ele não deve ser presumido ou removido sem identificação factual.
- `src/__tests__/core-invariants.test.ts` nomeia I1–I8, mas seus cenários usam valores e objetos locais, sem chamar os contratos reais em `src/App.tsx`, hooks, utilitários ou domínio. Logo, não é evidência suficiente dos ACs comportamentais.

Os requisitos desta story permanecem inalterados. A implementação deve produzir evidência contra o código real e só então atualizar seus checkboxes.

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

## Tasks / Subtasks

- [ ] 1. Confirmar o baseline e respeitar a sequência TD-SYS-19 → TD-SYS-02 → TD-QA-01 → TD-SYS-03 → TD-SYS-01. (AC: todos) [Fonte: `docs/prd/technical-debt-assessment.md` §3.3.1]
  - [ ] 1.1 Inventariar os globals consumidos pelos arquivos sob lint antes de mudar regras. (AC: globals)
  - [ ] 1.2 Confirmar novamente a inexistência de um segundo teste regex antes de remover testes. (AC: deleção de regex)
- [ ] 2. Ajustar o lint da configuração existente. (AC: globals; cobertura lint)
  - [ ] 2.1 Completar globals sem suprimir violações reais.
  - [ ] 2.2 Ativar React Hooks, `jsx-a11y` e segurança básica sobre o código de aplicação.
  - [ ] 2.3 Executar `npm run lint` e corrigir ou registrar os achados sem reduzir o escopo do comando.
- [ ] 3. Consolidar a execução de testes com a configuração Vitest existente. (AC: runner)
  - [ ] 3.1 Validar componentes em `happy-dom` e contratos de domínio sem dependência de DOM quando aplicável.
  - [ ] 3.2 Validar execução finita por `npm test -- --run` e o padrão de inclusão dos testes.
- [ ] 4. Trocar a falsa evidência por testes comportamentais. (AC: regex, I1–I8, mutação)
  - [ ] 4.1 Implementar I6 contra o fluxo real antes de remover `tests/pause-contract.test.mjs`.
  - [ ] 4.2 Reescrever I1–I8 para chamar módulos, hooks ou fluxo de UI responsáveis pela regra; valores sintéticos não substituem o contrato.
  - [ ] 4.3 Reaplicar os mutantes A e B, reverter as alterações controladas e anexar comando, resultado esperado e resultado obtido.
- [ ] 5. Tornar o typecheck efetivo sem supressão. (AC: `@ts-nocheck`, strict/checkJs, T6)
  - [ ] 5.1 Declarar `checkJs: true`, preservar `strict: true` e confirmar a ausência de `@ts-nocheck` em `src/App.tsx`.
  - [ ] 5.2 Implementar e testar o ratchet T6 contra uma baseline versionada.
  - [ ] 5.3 Executar `npm run typecheck`; se houver dívida pré-existente, documentar e priorizar sem mascará-la.
- [ ] 6. Executar gates e preparar o handoff. (AC: todos)
  - [ ] 6.1 Executar `npm run lint`, `npm run typecheck`, `npm test -- --run` e `npm run build`.
  - [ ] 6.2 Atualizar checkboxes, File List, Dev Agent Record e evidência de mutação.
  - [ ] 6.3 Solicitar QA Gate de @qa antes de propor `Done`.

## Dev Notes

### Referências e locais relevantes

- Requisitos e decisão de saída: `docs/prd/technical-debt-assessment.md` §3.3.1 e §4.3 — runner Vitest + `happy-dom`, proibição de regex e invariantes I1–I8.
- Configurações existentes: `eslint.config.js`, `vitest.config.ts`, `tsconfig.json` e scripts de `package.json`.
- Fluxos e contratos atualmente relevantes: `src/App.tsx`, `src/utils/studyLog.ts`, `src/hooks/`, `src/domain/core/` e `src/domain/storage/`.
- Não há orientação adicional atualizada específica para esta correção nos documentos de arquitetura: `docs/architecture/system-architecture.md` descreve a estrutura anterior à migração para `src/` e serve apenas como baseline histórico.

### Restrições técnicas

- O critério de saída de TD-SYS-03 são as invariantes I1–I8, e não cobertura percentual. [Fonte: `docs/prd/technical-debt-assessment.md` §4.3]
- Não reintroduzir `@ts-nocheck`; T6 deve impedir aumento das supressões. [Fonte: `docs/prd/technical-debt-assessment.md` §3.3.1]
- Esta story não autoriza requisito de produto novo, mudança da Story 1.1 ou alteração de `core-config.yaml`.

## Testing

- Componentes: Vitest + `happy-dom` e Testing Library, verificando interações e estado observável.
- Domínio: Vitest sem acoplamento a DOM quando o contrato sob teste não o requer.
- I1–I8: cada teste deve chamar a implementação real; fixtures e asserts devem observar entrada e estado/saída resultante.
- Mutação: registrar os mutantes A e B, o resultado anterior e a inversão exigida (A reprovado, B aprovado), revertendo a alteração controlada após a execução.
- Gates finais: `npm run lint`, `npm run typecheck`, `npm test -- --run` e `npm run build`.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration: Unconfigured**
>
> `coderabbit_integration.enabled` não está declarado em `.aiox-core/core-config.yaml`; por isso não há comando CodeRabbit configurado para esta story. Até decisão de @po/@devops, a revisão será manual pelos quality-gate tools. Esta story não autoriza modificar a configuração global.

**Story Type Analysis**

- **Primary Type:** Architecture
- **Secondary Type(s):** Frontend, Security
- **Complexity:** High — configurações transversais e rede de segurança para múltiplos fluxos.

**Specialized Agent Assignment**

- **Primary Agents:** @dev, @qa
- **Supporting Agents:** @architect (somente se houver decisão de padrão fora do escopo), @devops (somente para PR/CI, se aplicável).

**Quality Gate Tasks**

- [ ] Pre-Commit (@dev): executar quality-gate tools e documentar mutação.
- [ ] Pre-PR (@devops): executar a revisão configurada para PR, se a story alcançar esse estágio.
- [ ] CodeRabbit: não aplicável enquanto a chave estiver ausente; registrar a decisão de @po/@devops, se houver.

**Focus Areas**

- Cobertura real do lint e globals sem falsos positivos.
- Regras de hooks, acessibilidade e segurança sem silenciar violações.
- I1–I8 contra implementações reais e remoção do teste regex legado.
- Ausência de nova supressão TypeScript e eficácia do ratchet T6.

## Riscos

- **R1** (Alta→Confirmada, Crítico): esta story é a mitigação direta e completa de R1.
- Risco de esforço: TD-SYS-01 é XL — pode exigir quebra em sub-tarefas incrementais dentro desta mesma story (arquivo por arquivo) se o volume de erros de tipo for grande. Isso não deve bloquear a entrega dos outros 4 débitos da story.
- Risco de ordem: executar TD-SYS-02 antes de TD-SYS-19, ou TD-SYS-01 antes de TD-SYS-03, reintroduz problemas já documentados no assessment — a ordem desta story não é arbitrária.

## Dependências

- **Depende de:** Story 1.1 (estrutura `src/` estável, necessária para configuração de lint/build).
- **Bloqueia:** Story 2.1 (StorageAdapter — precisa de toolchain de teste real para os testes de round-trip T1 e para as invariantes I1-I8), Story 3.1 (baseline de caracterização T3 pressupõe toolchain funcional), e **em cascata** a Story 2.2 (que depende da 2.1).
- ⚠️ **Inversão de ordem em curso:** a Story 2.1 já está `InProgress` sem que esta story tenha sido concluída. É por isso que esta story foi elevada a TOP OF QUEUE — a ordem do epic não é arbitrária (ver §Riscos, "Risco de ordem").

## File List

### Planejados para implementação por @dev

- [ ] `eslint.config.js` — globals e regras/plugins de lint.
- [ ] `package.json` — scripts/dependências somente se a configuração existente exigir ajuste para os gates.
- [ ] `vitest.config.ts` — validar/ajustar somente a execução necessária.
- [ ] `tsconfig.json` — `checkJs: true` e typecheck efetivo.
- [ ] `tests/pause-contract.test.mjs` — remover depois da substituição comportamental I6.
- [ ] `src/__tests__/core-invariants.test.ts` e/ou testes próximos aos contratos reais — substituir cenários sintéticos pela evidência I1–I8.
- [ ] Arquivo do mecanismo T6 e respectiva chamada em `package.json`, se necessário — caminho a confirmar durante a implementação; não criar sem necessidade comprovada.

### Atualizado nesta preparação

- [x] `docs/stories/story-1.3-qualidade-lint-testes-typecheck.md` — estrutura, planejamento e baseline factual; quality gate reconciliado com o mapeamento do template e Change Log versionado com marcações pendentes.

## Dev Agent Record

### Context Reference

- `docs/stories/epic-technical-debt.md` — requisitos da Story 1.3.
- `docs/prd/technical-debt-assessment.md` §3.3.1 e §4.3 — decisão de runner, proibição de regex e invariantes.
- `package.json`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js` e árvore `src/` — baseline factual de 2026-09-10.

### Agent Model Used

Não iniciado.

### Debug Log References

Não iniciado.

### Completion Notes

Não iniciado. Esta preparação não alterou código nem configuração de aplicação.

### File List

Ver seção **File List** desta story.

## QA Results

Não executado. Reservado para o veredito formal de @qa após a implementação e os gates.

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-09-07 | Pendente — versão inicial não registrada | Criação da story — Fase 10 do Brownfield Discovery. | @pm (Morgan) |
| 2026-09-09 | Pendente — baseline semântica não registrada | Elevada a TOP OF QUEUE (ação A5); urgência/posição na fila não altera o status, que permanece `Draft` até validação formal. | @po (Pax) |
| 2026-09-10 | Pendente — baseline semântica não registrada | Reestruturada para nova validação: Story, executor/quality gate/tools, Tasks/Subtasks, Dev Notes, Testing, CodeRabbit, Dev Agent Record, QA Results e File List. Baseline factual preservado; status mantido `Draft` enquanto a Story 1.1 permanece `Draft`. | @sm (River) |
| 2026-09-10 | Pendente — baseline semântica não registrada | Quality gate ajustado de `@qa` para `@architect`, conforme o mapeamento do template v2 para trabalho de código/lógica. O veredito de QA permanece registrado separadamente; requer confirmação do @po se houver conflito de governança. | @sm (River) |
