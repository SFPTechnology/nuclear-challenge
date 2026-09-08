# Story 0.1 — Segurança imediata: Git, correção de animações e guarda anti-destruição de dados

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 0 — Ações Imediatas de Segurança)
**Prioridade:** P0-SAFETY 🔴 / P0-SAFETY-DATA 🔴 — fora da fila normal
**Débitos endereçados:** TD-SYS-04, TD-SYS-16, UX-D07, TD-DAT-01 (guarda), TD-DAT-02, TD-DAT-05
**Esforço estimado:** ~3h total (0,25h + 1,75h + 1h) ≈ R$ 450
**Owners:** @devops (ação 0a — autoridade exclusiva de Git/repo), @dev (ações 0b e 0c)

## Contexto / Motivação

O assessment técnico (`docs/prd/technical-debt-assessment.md`, §Ações de Execução Pendentes) identifica quatro débitos que qualificam simultaneamente por irreversibilidade × esforço S × dependência arquitetural zero — as únicas quatro exceções à fila normal de priorização:

- **UX-D07** — animações do componente `Boom` entre 3,57 Hz e 11,1 Hz, sem respeitar `prefers-reduced-motion` e sem nenhum mecanismo de escape. Risco fotoconvulsivo/vestibular real em população infantil que não pode se autoproteger (R8).
- **TD-DAT-01** — `saveResult` reconstrói o registro por whitelist (objeto literal, não spread), destruindo qualquer campo desconhecido no primeiro save. Viola NC-003 AC-2 e NC-002 AC-4 **hoje, no código atual** (R11, RX-1).
- **TD-DAT-02** — falha de leitura de `window.storage` é silenciosa (`try/catch` descarta `okStore` em dois call sites); login mostra "nenhum operador" e o recadastro sobrescreve o blob inteiro da turma (R11, RX-1).
- **TD-DAT-05** — `storeErr` só renderiza na tela de login; falha de escrita no fim de partida é invisível para quem já está jogando (R11).

Essas três últimas compõem, juntas, uma única guarda anti-destruição (RX-1). O assessment também determina, via **Emenda 1**, que o Git deve preceder qualquer correção de comportamento visual (o passo de reduzir frequência de animação não é aditivo, precisa de reversão) — daí TD-SYS-04 e TD-SYS-16 (janela única de `.gitignore` antes do primeiro commit) abrirem esta story.

**Nenhuma destas quatro correções tem dependência técnica pendente.** Já estavam autorizadas desde o veredito NEEDS WORK original e continuam não executadas na data do assessment (2026-09-07).

## Escopo

### 0a — Controle de versão (owner: @devops)
- `git init` no diretório raiz do projeto.
- `.gitignore` cobrindo, no mínimo: `Arquivos_Diversos/` (fecha TD-SYS-16 — janela única antes do 1º commit), `usina.zip`, `usina-legacy-backup/`, `dist/`.
- Primeiro commit realizado antes de qualquer alteração de código das ações 0b/0c.

### 0b — Correção de UX-D07 (owner: @dev)
- Media query `prefers-reduced-motion` + verificação via `matchMedia` no componente `Boom` — **obrigatório, não cortável** (não pode ser condicionado a flag opcional).
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
- [ ] No modo padrão (sem a preferência ativa), nenhuma das 4 animações excede 3 Hz.
- [ ] Vídeo de evidência T0.1-T0.5 gravado contra o artefato publicado (não o dev server), incluindo verificação de hash artefato-servido == hash-do-build (T0.5 / RX-7).
- [ ] `saveResult` não descarta nenhum campo pré-existente do registro ao salvar um novo resultado (teste manual: salvar registro com campo sintético desconhecido, confirmar sua permanência após novo save).
- [ ] Quando a leitura inicial de `window.storage` falha (`okStore === false`), nenhuma escrita em `operadores` ocorre.
- [ ] `storeErr` é visível em qualquer tela do app quando uma falha de leitura/escrita ocorre, não apenas na tela de login.
- [ ] Nenhuma das correções usa `localStorage`/`sessionStorage` (invariante do produto).

## Definition of Done

- [ ] As 4 correções (0a, 0b, 0c) implementadas e commitadas.
- [ ] Evidência em vídeo de T0.1-T0.5 anexada ao repositório ou linkada nesta story.
- [ ] Nenhuma regressão visual ou funcional introduzida nas telas existentes (verificação manual, já que TD-SYS-03/TD-QA-01 — toolchain de teste real — ainda não existem nesta fase).
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação (fluxo SDC padrão).
- [ ] `TECHNICAL-DEBT-REPORT.md` e o assessment não precisam ser reabertos — esta story apenas executa o que já estava autorizado.

## Riscos

- **R2 / R8 / R11** (do assessment) são os riscos diretamente mitigados por esta story — todos com probabilidade Média a Média-Alta e impacto Crítico.
- Risco de execução: se 0a não for feito primeiro, a correção de 0b (que altera comportamento visual do produto, não é aditiva) fica sem caminho de reversão — por isso a ordem 0a → 0b/0c é obrigatória (Emenda 1 do assessment).

## Dependências

- Nenhuma. Esta é a primeira story do epic e não depende de nenhuma outra.
- Bloqueia todas as demais stories do epic (nenhuma correção de código subsequente deve ocorrer sem Git ativo).

## File List

- [ ] A definir durante a implementação (ver `.gitignore`, componente `Boom`, função `saveResult`, estado `storeErr`).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
