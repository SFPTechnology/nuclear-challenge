# Story 0.1 — Segurança imediata: Git, correção de animações e guarda anti-destruição de dados

Status: InProgress

> **Autoridade de status:** o @po validou formalmente esta story em 2026-09-10 e promoveu seu estado de `Draft` para `Ready`. A conclusão continua condicionada à implementação, às evidências e ao veredito independente de @qa.

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 0 — Ações Imediatas de Segurança)
**Prioridade:** P0-SAFETY 🔴 / P0-SAFETY-DATA 🔴 — fora da fila normal
**Débitos endereçados:** TD-SYS-04, TD-SYS-16, UX-D07, TD-DAT-01 (guarda), TD-DAT-02, TD-DAT-05
**Esforço estimado:** ~3h total (0,25h + 1,75h + 1h) ≈ R$ 450
**Owners:** @devops (ação 0a — autoridade exclusiva de Git/repo), @dev (ações 0b e 0c)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - "architecture_review"
  - "code_review"
  - "pattern_validation"
```

**Delimitação factual:** @dev é o executor desta story para a evidência pendente e para qualquer correção de aplicação ainda necessária. A confirmação histórica do commit raiz e de `.gitignore` (0a) permanece sob autoridade exclusiva de @devops. O resultado de QA continua reservado a @qa, sem substituir o quality gate definido pelo template.

## Story

**Como** mantenedor do Nuclear Challenge,
**quero** confirmar as correções de segurança imediata e produzir a evidência publicada ainda pendente,
**para que** a proteção contra animações nocivas e destruição de dados seja verificável antes de liberar trabalho dependente.

## Contexto / Motivação

O assessment técnico (`docs/prd/technical-debt-assessment.md`, §Ações de Execução Pendentes) identifica quatro débitos que qualificam simultaneamente por irreversibilidade × esforço S × dependência arquitetural zero — as únicas quatro exceções à fila normal de priorização:

- **UX-D07** — animações do componente `Boom` entre 3,57 Hz e 11,1 Hz, sem respeitar `prefers-reduced-motion` e sem nenhum mecanismo de escape. Risco fotoconvulsivo/vestibular real em população infantil que não pode se autoproteger (R8).
- **TD-DAT-01** — `saveResult` reconstrói o registro por whitelist (objeto literal, não spread), destruindo qualquer campo desconhecido no primeiro save. Viola NC-003 AC-2 e NC-002 AC-4 **hoje, no código atual** (R11, RX-1).
- **TD-DAT-02** — falha de leitura de `window.storage` é silenciosa (`try/catch` descarta `okStore` em dois call sites); login mostra "nenhum operador" e o recadastro sobrescreve o blob inteiro da turma (R11, RX-1).
- **TD-DAT-05** — `storeErr` só renderiza na tela de login; falha de escrita no fim de partida é invisível para quem já está jogando (R11).

Essas três últimas compõem, juntas, uma única guarda anti-destruição (RX-1). O assessment também determina, via **Emenda 1**, que o Git deve preceder qualquer correção de comportamento visual (o passo de reduzir frequência de animação não é aditivo, precisa de reversão) — daí TD-SYS-04 e TD-SYS-16 (janela única de `.gitignore` antes do primeiro commit) abrirem esta story.

**Nenhuma destas quatro correções tem dependência técnica pendente.** Já estavam autorizadas desde o veredito NEEDS WORK original e continuam não executadas na data do assessment (2026-09-07).

## Reconciliação factual de execução (2026-09-10)

Esta seção registra evidência observável após a criação da story. Ela não altera o escopo, não substitui a validação de aceite e não autoriza marcar requisitos sem evidência.

| Entrega | Evidência verificável | Situação para validação |
|---|---|---|
| 0a — Git e `.gitignore` | Commit raiz `8468f304666a17755125ec4c6ee271b268caf8a0` (`chore: initialize git...`, 2026-09-07) cria `.gitignore`; o arquivo atual cobre `Arquivos_Diversos/`, `usina.zip`, `usina-legacy-backup/` e `dist/`. | Evidência suficiente para os dois primeiros ACs. |
| 0b — UX-D07 | Commit `dbec26eafb2fb755f143ab9ee3eb5fe5a0828924` registra a correção. A árvore atual contém `src/components/Boom.tsx` com `matchMedia('(prefers-reduced-motion: reduce)')` e `src/App.tsx` com a media query e durações de `.34s` para `rumble`/`rumbleHard` (2,94 Hz). O handoff da Fase 0 também registra as quatro animações em 2,94 Hz. | A evidência de código/histórico existe; a evidência T0.1–T0.5 contra artefato publicado não foi localizada. |
| 0c — guarda de dados | `docs/PHASE-0C-IMPLEMENTATION-SUMMARY.md`, `docs/PHASE-0C-VERIFICATION.md` e `.aiox/handoffs/PHASE-0-COMPLETE-HANDOFF.md` registram a entrega. A árvore atual preserva o spread em `saveResult` e as guardas `okStore` em `src/App.tsx`. | Manter os ACs de comportamento e visibilidade para validação contra a árvore atual; não inferir conclusão apenas da documentação histórica. |

**Lacuna de evidência:** não há vídeo T0.1–T0.5 nem registro de hash `artefato servido == build` rastreável no repositório. Portanto, o AC de evidência publicada permanece aberto. A validação também deve confirmar que a renderização global de `storeErr` recebe o estado ativo em todas as telas atuais, pois a estrutura foi posteriormente refatorada.

## Escopo

### 0a — Controle de versão (owner: @devops)
- `git init` no diretório raiz do projeto.
- `.gitignore` cobrindo, no mínimo: `Arquivos_Diversos/` (fecha TD-SYS-16 — janela única antes do 1º commit), `usina.zip`, `usina-legacy-backup/`, `dist/`.
- Primeiro commit realizado antes de qualquer alteração de código das ações 0b/0c.

### 0b — Correção de UX-D07 (owner: @dev)
- Media query `prefers-reduced-motion` + verificação via `matchMedia` no componente `Boom` — **obrigatório, não cortável** (não pode ser condicionado a flag opcional).
- Com `prefers-reduced-motion` ativo, a alternativa estática não pode encurtar o ciclo semântico da explosão: `onDone` deve continuar a ser chamado após **4.000 ms**. A verificação T0.3 deve cobrir este contrato.
- As 4 animações (`rumbleHard`, `glitch`, `rumble`, `grainShift`) reduzidas para **abaixo de 3 Hz no modo padrão** (invariante promovida no assessment: "nenhuma animação acima de 3 Hz no modo padrão").
- Evidência T0.1–T0.5 registrada em vídeo, **contra o artefato publicado, não o dev server** (T0.5 inclui verificação de que o hash do artefato servido é igual ao hash do build, fechando RX-7 no mesmo passo).

### 0c — Guarda anti-destruição de dados (owner: @dev)
- `saveResult` preserva campos desconhecidos do registro (usar spread `{...registroAtual, ...camposNovos}`, não reconstrução por whitelist) — fecha TD-DAT-01 no nível de guarda (a política de merge definitiva fica para a Story 2.1/`StorageAdapter`).
- Não gravar em `operadores` quando a leitura inicial (`okStore`) retornar `false` — fecha TD-DAT-02.
- `storeErr` promovido a estado global, visível em qualquer tela do app, não apenas no login — fecha TD-DAT-05.

## Critérios de Aceitação

- [ ] `.git/` existe no repositório e o primeiro commit está registrado antes de qualquer alteração de 0b/0c.
- [ ] `.gitignore` exclui `Arquivos_Diversos/`, `usina.zip`, `usina-legacy-backup/` e `dist/`.
- [ ] O componente `Boom` consulta `matchMedia('(prefers-reduced-motion: reduce)')` e desativa/reduz as 4 animações citadas quando a preferência está ativa.
- [ ] Com `prefers-reduced-motion` ativo, `Boom` preserva o ciclo semântico e chama `onDone` após 4.000 ms (T0.3).
- [ ] No modo padrão (sem a preferência ativa), nenhuma das 4 animações excede 3 Hz.
- [ ] Vídeo de evidência T0.1-T0.5 gravado contra o artefato publicado (não o dev server), incluindo verificação de hash artefato-servido == hash-do-build (T0.5 / RX-7).
- [x] `saveResult` não descarta nenhum campo pré-existente do registro ao salvar um novo resultado (teste manual: salvar registro com campo sintético desconhecido, confirmar sua permanência após novo save).
- [x] Quando a leitura inicial de `window.storage` falha (`okStore === false`), nenhuma escrita em `operadores` ocorre.
- [x] `storeErr` é visível em qualquer tela do app quando uma falha de leitura/escrita ocorre, não apenas na tela de login.
- [ ] Nenhuma das correções usa `localStorage`/`sessionStorage` (invariante do produto).

## Definition of Done

- [ ] As 4 correções (0a, 0b, 0c) implementadas e commitadas.
- [ ] Evidência em vídeo de T0.1-T0.5 anexada ao repositório ou linkada nesta story.
- [ ] Nenhuma regressão visual ou funcional introduzida nas telas existentes (verificação manual, já que TD-SYS-03/TD-QA-01 — toolchain de teste real — ainda não existem nesta fase).
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação (fluxo SDC padrão).
- [ ] `TECHNICAL-DEBT-REPORT.md` e o assessment não precisam ser reabertos — esta story apenas executa o que já estava autorizado.

## Tasks / Subtasks

- [ ] 1. Confirmar o baseline histórico de 0a. (AC: Git e `.gitignore`)
  - [ ] 1.1 @devops verifica que `8468f30` é o commit raiz e antecede alterações de código de 0b/0c.
  - [ ] 1.2 @devops confirma os quatro alvos exigidos no `.gitignore` atual.
- [ ] 2. Validar acessibilidade e animações do artefato publicado. (AC: `Boom`, 3 Hz, T0.1–T0.5)
  - [ ] 2.1 @dev corrige e testa, com timers controlados, que `prefers-reduced-motion` preserva `onDone` em 4.000 ms; depois confirma `prefers-reduced-motion` e as quatro animações no artefato publicado.
  - [ ] 2.2 @dev produz, anexa ou referencia o vídeo T0.1–T0.5, incluindo T0.5 (`hash artefato servido == hash do build`).
- [x] 3. Validar os cenários de proteção de dados na árvore atual. (AC: `saveResult`, `okStore`, `storeErr`)
  - [x] 3.1 Confirmar a preservação de campo desconhecido após `saveResult`.
  - [x] 3.2 Simular falha de leitura inicial e confirmar que `operadores` não recebe escrita.
  - [x] 3.3 Confirmar a visibilidade de `storeErr` em cada tela aplicável.
- [ ] 4. Registrar as evidências e solicitar os gates. (AC: todos)
  - [x] 4.1 Atualizar apenas os checkboxes sustentados por evidência verificável.
  - [x] 4.2 Atualizar Dev Agent Record e File List com arquivos e resultados efetivamente alterados.
  - [ ] 4.3 Solicitar o quality gate de @architect e registrar o resultado de QA por @qa.

## Dev Notes

### Referências e locais relevantes

- `docs/prd/technical-debt-assessment.md` — origem dos débitos e da ordem obrigatória 0a → 0b/0c.
- `.gitignore` e o commit `8468f304666a17755125ec4c6ee271b268caf8a0` — baseline factual de 0a.
- `src/components/Boom.tsx` e `src/App.tsx` — superfícies atuais relacionadas a 0b e 0c.
- `src/components/GlobalErrorBanner.tsx`, `docs/PHASE-0C-IMPLEMENTATION-SUMMARY.md`, `docs/PHASE-0C-VERIFICATION.md` e `.aiox/handoffs/PHASE-0-COMPLETE-HANDOFF.md` — evidência histórica, que não substitui os cenários de aceite pendentes.

### Restrições técnicas

- Não usar `localStorage` nem `sessionStorage`.
- A evidência T0.1–T0.5 deve ser coletada no artefato publicado, e não no dev server; T0.5 exige igualdade entre os hashes definidos no AC.
- Não concluir nem marcar como comprovado requisito que não possua evidência verificável.

## Testing

- Verificação manual no artefato publicado: preferência reduzida, quatro animações abaixo de 3 Hz no modo padrão e registro T0.1–T0.5.
- Teste automatizado de `Boom` com timers controlados: em reduced-motion, `onDone` ocorre após 4.000 ms, não no atalho anterior de 1.500 ms.
- Cenários manuais de dados: campo desconhecido preservado, bloqueio de escrita quando `okStore === false` e `storeErr` visível nas telas aplicáveis.
- Os comandos automatizados da Story 1.3 não são pré-requisito para registrar a evidência manual desta story; o QA complementar depende da toolchain quando ela estiver disponível.

## Plano de validação antes do aceite

1. **@po:** validar a preparação desta story e promover formalmente para `Ready`, se aceitar o escopo e os critérios preservados.
2. **@devops:** confirmar no histórico que `8468f30` é o commit raiz e que precede qualquer commit de alteração de código de 0b/0c.
3. **@dev:** produzir e anexar/linkar o vídeo T0.1–T0.5 contra o artefato publicado, incluindo T0.5 (hash do artefato servido igual ao hash do build); validar no navegador a preferência reduzida e o limite de 3 Hz.
4. **@dev:** executar os cenários de dados dos ACs: campo desconhecido sobrevive a `saveResult`; falha inicial de leitura bloqueia escrita em `operadores`; erro de storage é mostrado em cada tela aplicável. Atualizar os checkboxes somente com essa evidência.
5. **@qa:** quando a toolchain da Story 1.3 estiver disponível, revisar a evidência automatizada/comportamental complementar. Nesta fase, a verificação manual prevista na story permanece necessária.

## CodeRabbit Integration

**Status:** Não configurado em `.aiox-core/core-config.yaml`; nenhuma configuração `coderabbit_integration.enabled` foi localizada durante esta preparação. Não há gate CodeRabbit a declarar sem configuração de projeto. Os gates e evidências definidos nesta story permanecem obrigatórios.

## Riscos

- **R2 / R8 / R11** (do assessment) são os riscos diretamente mitigados por esta story — todos com probabilidade Média a Média-Alta e impacto Crítico.
- Risco de execução: se 0a não for feito primeiro, a correção de 0b (que altera comportamento visual do produto, não é aditiva) fica sem caminho de reversão — por isso a ordem 0a → 0b/0c é obrigatória (Emenda 1 do assessment).

## Dependências

- Nenhuma. Esta é a primeira story do epic e não depende de nenhuma outra.
- Bloqueia todas as demais stories do epic (nenhuma correção de código subsequente deve ocorrer sem Git ativo).

## File List

- [x] `docs/stories/story-0.1-seguranca-imediata.md` — estrutura do template v2 reconciliada; baseline semântica 0.1.0–0.1.4; validação @po GO e Status `Draft` → `Ready` em 2026-09-10. O contrato T0.3 de `onDone` em 4.000 ms foi explicitado; evidência publicada permanece trabalho de implementação.
- [x] `.gitignore` — criado no commit raiz `8468f30`; cobre os quatro alvos exigidos por 0a.
- [x] `src/components/Boom.tsx` — consulta `prefers-reduced-motion` via `matchMedia` e preserva o encerramento semântico de 4.000 ms na alternativa estática (0b; o caminho anterior sob `Arquivos_Diversos/` foi migrado posteriormente).
- [x] `src/__tests__/boom.test.tsx` — teste comportamental com timers controlados que confirma que `onDone` não ocorre aos 3.999 ms e ocorre aos 4.000 ms em reduced motion.
- [x] `src/App.tsx` — tipagem estrita do fluxo de resultado/storage, `saveResult` via `buildSavedPlayer`, leitura/guardas `okStore` e propagação de `storeErr` (0b/0c).
- [x] `src/components/MenuPanel.tsx`, `src/components/RankingPanel.tsx`, `src/components/AnalisePanel.tsx`, `src/components/NC003Panel.tsx`, `src/components/EndGamePanel.tsx` e `src/components/GamePlayPanel.tsx` — recebem `storeErr` e exibem `GlobalErrorBanner` em cada tela não-login aplicável.
- [x] `src/components/GlobalErrorBanner.tsx` — superfície global de exibição de erro de storage, recebendo o estado ativo dos painéis.
- [x] `src/__tests__/story-0.1-data-safety.test.tsx` — cenários 0c contra o caminho atual: extensão desconhecida preservada por `saveResult`, bloqueio real de escrita após falha de leitura de `window.storage` e banner visível em todas as telas aplicáveis.
- [x] `docs/PHASE-0C-IMPLEMENTATION-SUMMARY.md`, `docs/PHASE-0C-VERIFICATION.md` e `.aiox/handoffs/PHASE-0-COMPLETE-HANDOFF.md` — evidência histórica de entrega e handoff da Fase 0.

- [x] `src/__tests__/story-0.1-data-safety.test.tsx` — regressao atualizada para o `GameRepository`: falha de leitura inicial bloqueia `createOperator` e qualquer escrita de operador.

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-09-07 | 0.1.0 | Criação da story — Fase 10 do Brownfield Discovery. | @pm (Morgan) |
| 2026-09-10 | 0.1.1 | Preparação para validação: reconciliação de commits, árvore atual e evidências históricas; plano de validação, File List e nota de CodeRabbit. Requisitos e ACs foram preservados. | @sm (River) |
| 2026-09-10 | 0.1.2 | Estrutura do template v2 reconciliada: Executor Assignment, Story, Tasks / Subtasks, Dev Notes, Testing, Dev Agent Record e QA Results explicitados. Status permanece `Draft`; T0.1–T0.5 continua sem evidência publicada. | @sm (River) |
| 2026-09-10 | 0.1.3 | Baseline semântica definida para viabilizar futuras transições do ciclo; nenhum critério de aceitação foi marcado como concluído. | @aiox-master (Orion) |
| 2026-09-10 | 0.1.4 | Validated GO (9/10) — Status: Draft → Ready. Explicitado o contrato T0.3: reduced-motion preserva `onDone` após 4.000 ms; evidência publicada permanece pendente de implementação. | @po (Pax) |
| 2026-09-10 | 0.1.5 | Desenvolvimento iniciado (YOLO) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-09-10 | 0.1.6 | 0c revalidado: tipagem de `App.tsx`, preservação de extensão desconhecida, bloqueio de escrita após falha inicial de storage e propagação de `storeErr` para telas não-login, todos cobertos por teste. | @dev (Dex) |
| 2026-09-10 | 0.1.7 | Corrigido loop de reinicialização do efeito de `Boom`: callback estabilizado via ref, temporizadores do caminho normal limpos e teste confirma conclusão em 4.000 ms mesmo com rerenders de partículas. | @dev (Dex) |

| 2026-09-13 | 0.1.8 | Regressao de falha inicial de armazenamento alinhada ao `GameRepository`; criacao de operador bloqueada enquanto `okStore` esta falso. | @dev (Dex) |

## Dev Agent Record

### Agent Model Used

GPT-5.6-Codex (@dev / Dex), modo YOLO.

### Debug Log References

2026-09-13 — A regressao de 0c passou a simular `GameRepository.load`, o caminho ativo. `createPlayer` retorna antes de chamar `createOperator` quando `okStore` e falso. Teste isolado: 3/3 passaram.

2026-09-10 — T0.3 automatizado: `npm test -- --run src/__tests__/boom.test.tsx` passou (2/2). Com e sem `prefers-reduced-motion`, `onDone` não é chamado aos 3.999 ms e é chamado aos 4.000 ms; o cenário normal cobre rerenders contínuos das partículas.

2026-09-10 — os comandos completos `npm run lint`, `npm run typecheck`, `npm test -- --run` e `npm run build` foram iniciados, mas não concluíram no limite operacional de 30 s do ambiente; não foram registrados como aprovados.

2026-09-10 — 0c reexecutado com `npm test -- --run src/__tests__/story-0.1-data-safety.test.tsx`: 3/3 passaram. O teste usa `window.storage` com `get` rejeitado e confirma que nenhuma chamada `set('operadores', ...)` ocorre; também exercita a atualização que `saveResult` usa e todos os painéis não-login com `storeErr` ativo. `npm run lint` e `npm run typecheck` passaram.

### Completion Notes

- A guarda de armazenamento tambem protege a criacao de operador: apos uma falha de leitura inicial, nenhuma escrita remota e tentada ate uma recarga bem-sucedida.

- Corrigido o caminho reduced-motion de `Boom`: o estado visual estático continua a ser exibido aos 500 ms, enquanto `onDone` usa temporizador independente de 4.000 ms. A limpeza dos temporizadores evita a conclusão tardia depois do unmount.
- Corrigido o travamento observado no caminho normal: o efeito de `Boom` não reinicia mais a cada render causado pela animação; o callback mais recente é mantido em ref e todos os quatro temporizadores são cancelados no unmount. Após 4.000 ms a tela retorna ao resultado e fica interativa.
- Adicionado teste comportamental controlado para T0.3. A tarefa 2.1 permanece aberta porque também requer confirmação no artefato publicado; T0.1–T0.5, hash servido == build e os cenários manuais de dados ainda não possuem evidência verificável.
- A story permanece `InProgress`, não `InReview`, pois há tarefas, ACs e gates pendentes.
- A correção de tipagem eliminou os erros de `npm run typecheck` em `src/App.tsx` sem suprimir checagens. A interface de estado de storage legada foi delimitada localmente e os contratos de rota dos painéis passaram a usar `AppMode`.
- Os cenários 3.1–3.3 e os respectivos ACs foram marcados apenas após o teste de comportamento 0c passar. T0.1–T0.5, publicação, hashes e QA independente continuam pendentes.

### File List

Ver seção **File List** desta story. Arquivos alterados nesta etapa: `src/App.tsx`, `src/components/Boom.tsx`, seis painéis de aplicação, `src/__tests__/boom.test.tsx`, `src/__tests__/story-0.1-data-safety.test.tsx` e este registro da story.

## QA Results

### Revisão de gate local completo — 2026-09-10 (@qa / Quinn)

**Veredito: FAIL — fechamento não autorizado; Status permanece `InProgress`.**

- **PASS:** `npm run lint` (exit 0).
- **PASS:** `npm run typecheck` (exit 0).
- **PASS:** `npm test -- --run` — 11 arquivos, 126 testes.
- **PASS:** `npm run build` (exit 0), gerando `dist/assets/index-BqTQ7x--.js` localmente.
- **PASS:** `src/__tests__/boom.test.tsx` — 1/1, `onDone` em 4.000 ms com reduced motion.
- **PASS:** `src/__tests__/story-0.1-data-safety.test.tsx` — 3/3, preservação de campo desconhecido, bloqueio de escrita após falha de leitura e visibilidade de `storeErr`.
- **FAIL:** não há URL de publicação, vídeo T0.1–T0.5 ou comparação verificável `hash artefato servido == hash do build` (T0.5/RX-7). O build local não substitui o artefato publicado.

Os gates locais e os cenários 0c estão verdes; a story permanece `InProgress` e bloqueada somente pela evidência publicada exigida. Nenhum deployment foi alterado nesta revisão.

### Revisão parcial — 2026-09-10 (@qa / Quinn)

**Veredito: FAIL — fechamento não autorizado; Status permanece `InProgress`.**

- **PASS (T0.3 local):** `src/components/Boom.tsx` mantém o estado visual estático aos 500 ms e agenda `onDone` de forma independente para 4.000 ms; ambos os timers são limpos no unmount. `src/__tests__/boom.test.tsx` usa fake timers e comprovou que `onDone` não ocorre aos 3.999 ms e ocorre uma vez aos 4.000 ms. Comando: `npm test -- --run src/__tests__/boom.test.tsx` (1/1 passou).
- **PASS (gates executáveis):** `npm run lint` passou; `npm test -- --run` passou (10 arquivos, 123 testes); `npm run build` passou. O build local gerou `dist/assets/index-Bzj2vd7W.js`, mas isso **não** comprova que esse hash seja o artefato servido.
- **FAIL (evidência de aceite):** não há URL de publicação, vídeo T0.1–T0.5 nem registro verificável de `hash artefato servido == hash do build` (T0.5/RX-7). Um build/preview local não é substituto aceitável.
- **FAIL (quality gate):** `npm run typecheck` concluiu com exit code 1 e erros existentes em `src/App.tsx` (inferências `any`/`never` e incompatibilidades de tipos). A revisão não atribui esses erros à alteração em `Boom.tsx`, mas o comando obrigatório não passa no estado atual.
- **Fora do escopo desta revisão parcial:** os cenários de dados 0c (`saveResult`, bloqueio `okStore` e visibilidade de `storeErr`) não foram reexecutados aqui e continuam sem evidência de aceite atual.

Para nova revisão: publicar o build em um destino rastreável, anexar/linkar a evidência T0.1–T0.5 incluindo os hashes comparados, corrigir o gate de typecheck e executar/registrar os cenários 0c. Este FAIL não altera o status porque a story não está em `InReview`.
