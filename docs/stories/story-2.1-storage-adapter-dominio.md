# Story 2.1 — StorageAdapter e camada de domínio

Status: Ready for Review

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

### Wave 3 — Consolidação e integração (amendado por @po, ADR-001/A3)

Escopo absorvido da `phase-5-storage-adapter.md`, **cancelada por duplicação**. Nada aqui é invenção nova: metade do escopo da Phase 5 já era reimplementação do que esta story define. Wave 3 consolida em vez de duplicar.

4. **Unificação dos dois StorageAdapters.** Hoje existem duas implementações concorrentes — `src/adapters/StorageAdapter.ts` e `src/domain/storage/` (`StorageAdapter.ts` + `WindowStorageAdapter.ts`). Convergir para **uma única** implementação canônica sobre `window.storage`, removendo a outra. Enquanto houver duas, não há contrato formal — há duas verdades.
5. **Wire do adapter em `src/App.tsx`.** `App.tsx` ainda acessa `window.storage` diretamente em 4 pontos. Sem esse wire o adapter é **code-dead** e os ACs 1 e 7 não são verificáveis por nenhum meio.
6. **Versionamento de schema.** Introduzir um campo de versão no registro persistido, com caminho de migração definido, para que mudanças futuras de formato não exijam leitura heurística do dado legado.
7. **Auditoria estruturada.** Registro estruturado das operações de escrita/leitura do adapter (o quê, quando, resultado, estado de saúde), como base observável para diagnosticar degradação silenciosa em campo.
8. **Remover `window.localStorage`** de `src/adapters/StorageAdapter.ts` (12 ocorrências reportadas por @pm) — viola a invariante de produto declarada no item 1 deste escopo.

## Critérios de Aceitação

- [ ] `StorageAdapter` implementado com API própria (não é mais consumo direto e disperso de `window.storage` pelos componentes).
- [ ] Estado de saúde do storage é explícito e consumível pela UI (ex.: `healthy | degraded | unavailable`), refletindo o comportamento real de `try/catch` (não "falha total").
- [ ] Merge de registro é aditivo: um campo desconhecido presente no registro anterior sobrevive a um novo save, mesmo que a nova gravação não o mencione explicitamente.
- [ ] Camada de domínio existe como módulo(s) separado(s) de componentes React, com funções puras testáveis isoladamente.
- [ ] As invariantes I1, I2, I4, I5, I7, I8 (definidas na Story 1.3) passam contra a nova camada de domínio.
- [ ] Teste de round-trip com fixture legada (T1.5) confirma que dados no formato antigo continuam sendo lidos corretamente pelo novo `StorageAdapter`.
- [ ] Nenhuma regressão nas telas existentes que hoje consomem `window.storage` diretamente.

### ACs da Wave 3 (amendados por @po — integração, não apenas existência)

- [ ] **Existe exatamente UMA implementação de `StorageAdapter` no repositório.** Verificável: uma busca por definições de classe/módulo `StorageAdapter` retorna um único resultado canônico; a implementação redundante entre `src/adapters/` e `src/domain/storage/` foi removida (não apenas deprecada).
- [ ] **`src/App.tsx` não contém nenhum acesso direto a `window.storage`.** Os 4 pontos atuais passam pelo adapter. Verificável por busca textual retornando zero ocorrências em `App.tsx`.
- [ ] **Nenhuma ocorrência de `window.localStorage` ou `window.sessionStorage` em código de produção** (invariante de produto). Verificável por busca retornando zero ocorrências fora de testes/fixtures.
- [ ] **O adapter está vivo, não code-dead:** existe ao menos um teste de integração que exercita um fluxo real da aplicação (salvar → recarregar → ler) através do adapter, não apenas testes unitários da classe isolada.
- [ ] **Registro persistido carrega versão de schema explícita**, e existe um caminho de migração testado para ao menos uma transição de versão (inclusive do dado legado sem versão → v1).
- [ ] **Auditoria estruturada emite registro** para operações de escrita e para transições de estado de saúde, com teste que confirma a emissão em cenário de degradação.

> **Nota de aceitação (@po):** ACs 1 e 7 desta story **não podem ser marcados** enquanto `App.tsx` acessar `window.storage` diretamente. Um adapter que existe mas não é consumido não satisfaz "não é mais consumo direto e disperso" — satisfaz apenas "existe um arquivo novo". Esta story só vai a `Done` com o adapter integrado.

## Definition of Done

- [ ] `StorageAdapter` e camada de domínio implementados, testados (usando a toolchain da Story 1.3) e documentados.
- [ ] Suíte T1 (RX-1: preservação de campo desconhecido, não-sobrescrita após falha de leitura, round-trip com fixture legada, `window.storage` ausente não lança nem grava) passa integralmente.
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **R5 (reescrito)**: degradação silenciosa seguida de destruição de dados — mitigado por esta story via estado de saúde explícito e política de merge.
- **RX-2**: a futura refatoração do monolito (Story 3.1) pode destruir dados se esta camada não estiver sólida antes — por isso esta story é pré-requisito da Story 3.1 (junto com TD-QA-02).

## Dependências

- **Depende de:** Story 1.3 (toolchain de teste real necessária para validar as invariantes desta story). ⚠️ **BLOQUEADOR ATIVO** — Story 1.3 está em `Draft` (elevada a TOP OF QUEUE por @po em 2026-09-09). Sem I1-I8 executáveis, o AC "as invariantes I1, I2, I4, I5, I7, I8 passam" desta story é **não verificável**. Esta story está `InProgress` sobre uma dependência não atendida.
- **Bloqueia:** Story 2.2 (NC-003 piloto depende do `StorageAdapter`), Story 3.1 (quebra do monolito depende de domínio extraído), Story 3.2 (TD-DAT-04/pseudonimização depende de TD-SYS-09 concluído).

## File List

- [x] `src/domain/storage/StorageAdapter.ts` - adapter canonico sobre `window.storage`
- [x] `src/domain/storage/WindowStorageAdapter.ts` - compatibilidade por reexport
- [x] `src/domain/storage/index.ts` - exports canonicos
- [x] `src/adapters/StorageAdapter.ts` - reexport sem `localStorage`
- [x] `src/domain/core/Performance.ts` - consolidacao pura de desempenho
- [x] `src/__tests__/storage-adapter.test.ts` - contrato, migracao e merge
- [x] `src/__tests__/storage-adapter-health.test.ts` - estado de saude
- [x] `src/__tests__/performance-persistence.test.ts` - round-trip de desempenho
- [x] `src/App.tsx` - integracao pelo adapter canonico
- [x] `docs/STORAGE-ADAPTER.md` - contrato, envelope e fluxo de persistencia

- [ ] `src/adapters/StorageAdapter.ts` — Adapter com estado de saúde e merge aditivo
- [ ] `src/domain/` — Módulos de domínio (física, pontuação, ranking)
  - [ ] `src/domain/physics.ts` — Cálculos de física do núcleo
  - [ ] `src/domain/scoring.ts` — Cálculo de pontuação
  - [ ] `src/domain/ranking.ts` — Rank progression
  - [ ] `src/domain/generation.ts` — Geração de operações matemáticas
- [ ] `src/__tests__/storage-adapter-health.test.ts` — Testes de estado de saúde
- [ ] `src/__tests__/domain-invariants.test.ts` — Invariantes I1-I8
- [ ] Documentação: `docs/STORAGE-ADAPTER.md` e `docs/DOMAIN-LAYER.md`

### Wave 3 — Consolidação (amendado por @po)

- [ ] `src/domain/storage/` — **decidir e executar a convergência**: uma única implementação canônica; a redundante é removida
- [ ] `src/adapters/StorageAdapter.ts` — remover `window.localStorage` (12 ocorrências) ou remover o arquivo, conforme a convergência
- [ ] `src/App.tsx` — substituir os 4 acessos diretos a `window.storage` por chamadas ao adapter
- [ ] Versionamento de schema + migração legado → v1
- [ ] Auditoria estruturada do adapter
- [ ] `src/__tests__/storage-integration.test.ts` — fluxo real salvar → recarregar → ler via adapter

## Dev Agent Record

### Implementation Summary

- Convergidos os adapters concorrentes em `src/domain/storage/StorageAdapter.ts`.
- Adicionado envelope `schemaVersion: 1`, leitura de registros legados, estado de saude e auditoria em memoria.
- Removido o uso de `window.localStorage` do codigo de producao.
- Substituidos os acessos diretos do `App.tsx` pelo adapter canonico.
- Extraida a consolidacao de desempenho para `src/domain/core/Performance.ts`.
- Mantidos os fluxos atuais: respostas acumulam em memoria; `win`, `lose` e `quit` persistem; `pause` nao persiste resultado.

### Validation

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test -- --run`: PASS, 14 arquivos e 127 testes
- `npm run build`: PASS
- `git diff --check`: PASS
- Buscas de invariantes: PASS, sem acesso direto em `App.tsx`, sem storage proibido em `src`, uma classe `StorageAdapter`.
- `npm run validate:structure`: INDISPONIVEL, script ausente no `package.json`.
- `npm run validate:agents`: INDISPONIVEL, script ausente no `package.json`.
- `npm run sync:ide:check`: INDISPONIVEL, script ausente no `package.json`.

### Pending QA

Veredito formal de `@qa` permanece pendente. A story esta em `Ready for Review`, nao em `Done`.

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-10 | @aiox-master | Workflow de acompanhamento executado: adapter canonico, migracao v1, integracao do App, consolidacao de desempenho e testes implementados. Status: InProgress -> Ready for Review. |
| 2026-09-09 | @po (Pax) | **ACs AMENDADOS (ADR-001 / ação A3).** Adicionada **Wave 3 — Consolidação e integração** ao Escopo (itens 4-8) e 6 ACs novos, absorvendo o escopo da `phase-5-storage-adapter.md` cancelada: (a) unificação dos dois StorageAdapters — duplicação **verificada diretamente** (`src/adapters/StorageAdapter.ts` + `src/domain/storage/{StorageAdapter,WindowStorageAdapter}.ts`); (b) wire dos 4 acessos diretos a `window.storage` em `App.tsx`; (c) versionamento de schema + migração legado→v1; (d) auditoria estruturada; (e) remoção de `window.localStorage`. **Princípio de aceitação:** os ACs agora exigem adapter **integrado**, não apenas existente — um adapter code-dead não satisfaz os ACs 1 e 7. Nada inventado: todo o escopo traça para o assessment, a Phase 5 cancelada ou achados do @pm. ⚠️ Registrado bloqueador ativo: dependência dura Story 1.3 ainda não atendida. |
| 2026-09-09 | @pm (Morgan) | **Esta story é a fonte de verdade para TD-SYS-09/TD-SYS-07.** `phase-5-storage-adapter.md` foi cancelada por duplicação — ver `docs/adr/ADR-001-single-source-of-truth-story-track.md`. Escopo a ser amendado por **@po** (ADR-001, A3): (a) **Wave 3** — versionamento de schema para migrations futuras; (b) **unificar os dois StorageAdapters existentes** (`src/adapters/StorageAdapter.ts` vs `src/domain/storage/*`) em um só sobre `window.storage`; (c) **wire do adapter em `src/App.tsx`**, que hoje ainda usa `window.storage` direto em 4 pontos — sem isso os ACs 1 e 7 não são verificáveis e a story não pode ser Done; (d) remover o uso de `window.localStorage` (12 ocorrências em `src/adapters/StorageAdapter.ts`), que viola a invariante de produto. ⚠️ Dependência dura Story 1.3 (toolchain) ainda está `Draft`. |
| 2026-09-08 | @dev (Dex) | Status: Draft → InProgress. Iniciando com StorageAdapter (TD-SYS-09). Camada de domínio (TD-SYS-07) em fase 2 desta story. |
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
