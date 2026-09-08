# Story 2.1 — StorageAdapter e camada de domínio

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 2 — Fundação)
**Prioridade:** P1
**Débitos endereçados:** TD-SYS-09, TD-SYS-07
**Esforço estimado:** M (TD-SYS-09) + L (TD-SYS-07)
**Owner:** @dev, com @architect como revisor de design (arquitetura de integração é escopo de @architect; implementação detalhada é de @dev)

## Contexto / Motivação

Do assessment (`technical-debt-assessment.md`, Plano de Resolução, item 4):

- **TD-SYS-09** — `window.storage` é consumido hoje sem nenhum contrato formal. A v2.0 do assessment ampliou o escopo deste débito: o adapter deve possuir **a política de merge do registro** (fechando TD-DAT-01 de forma definitiva — a guarda mínima já foi entregue na Story 0.1, mas a correção arquitetural completa é aqui). Correção factual importante herdada do assessment: "indisponibilidade = falha total na inicialização" está **errada** — há `try/catch`; o comportamento real (degradação silenciosa, não falha total) deve ser tratado explicitamente com estado de saúde visível (R5 reescrito).
- **TD-SYS-07** — ausência de camada de domínio torna contratos CLI impossíveis, o que **viola o Artigo I da Constitution (CLI First, NON-NEGOTIABLE)** e bloqueia mecanicamente NC-001 AC-5, NC-002 AC-1 e NC-003 AC-1.

Esta é a story de fundação de dados do epic — desbloqueia diretamente a Story 2.2 (NC-003 piloto) e é pré-requisito duro (junto com TD-QA-02, Story 3.1) para qualquer refatoração segura do monolito.

## Escopo

1. Criar `StorageAdapter` com contrato formal de leitura/escrita sobre `window.storage`, incluindo:
   - Estado de saúde explícito (não apenas sucesso/falha binário — refletir degradação silenciosa real, corrigindo a premissa factual errada de "falha total").
   - Política de merge não destrutiva para o registro de resultados (spread de campos desconhecidos preservados — fecha TD-DAT-01 definitivamente, superando a guarda mínima da Story 0.1).
   - Nenhum uso de `localStorage`/`sessionStorage` (invariante do produto, mantida).
2. Criar camada de domínio (funções puras, testáveis, invocáveis fora de componentes React) cobrindo as operações centrais do jogo (física, geração de operações, cálculo de pontuação, ranking) — desacoplando lógica de negócio da camada de apresentação.
3. Expor essas funções de domínio de forma que um contrato CLI seja **possível** (não implementar necessariamente uma CLI nesta story, mas remover o bloqueio arquitetural que hoje o impede — fecha a violação do Artigo I).

## Critérios de Aceitação

- [ ] `StorageAdapter` implementado com API própria (não é mais consumo direto e disperso de `window.storage` pelos componentes).
- [ ] Estado de saúde do storage é explícito e consumível pela UI (ex.: `healthy | degraded | unavailable`), refletindo o comportamento real de `try/catch` (não "falha total").
- [ ] Merge de registro é aditivo: um campo desconhecido presente no registro anterior sobrevive a um novo save, mesmo que a nova gravação não o mencione explicitamente.
- [ ] Camada de domínio existe como módulo(s) separado(s) de componentes React, com funções puras testáveis isoladamente.
- [ ] As invariantes I1, I2, I4, I5, I7, I8 (definidas na Story 1.3) passam contra a nova camada de domínio.
- [ ] Teste de round-trip com fixture legada (T1.5) confirma que dados no formato antigo continuam sendo lidos corretamente pelo novo `StorageAdapter`.
- [ ] Nenhuma regressão nas telas existentes que hoje consomem `window.storage` diretamente.

## Definition of Done

- [ ] `StorageAdapter` e camada de domínio implementados, testados (usando a toolchain da Story 1.3) e documentados.
- [ ] Suíte T1 (RX-1: preservação de campo desconhecido, não-sobrescrita após falha de leitura, round-trip com fixture legada, `window.storage` ausente não lança nem grava) passa integralmente.
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **R5 (reescrito)**: degradação silenciosa seguida de destruição de dados — mitigado por esta story via estado de saúde explícito e política de merge.
- **RX-2**: a futura refatoração do monolito (Story 3.1) pode destruir dados se esta camada não estiver sólida antes — por isso esta story é pré-requisito da Story 3.1 (junto com TD-QA-02).

## Dependências

- **Depende de:** Story 1.3 (toolchain de teste real necessária para validar as invariantes desta story).
- **Bloqueia:** Story 2.2 (NC-003 piloto depende do `StorageAdapter`), Story 3.1 (quebra do monolito depende de domínio extraído), Story 3.2 (TD-DAT-04/pseudonimização depende de TD-SYS-09 concluído).

## File List

- [ ] A definir durante a implementação (`StorageAdapter`, módulos de domínio).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
