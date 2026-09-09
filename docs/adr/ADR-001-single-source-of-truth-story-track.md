# ADR-001 — Single Source of Truth: Epic Story Track substitui o Phase Track

**Status:** ACCEPTED
**Data:** 2026-09-09
**Decisor:** @pm (Morgan) — escalação de @po (Pax)
**Afetados:** @dev, @qa, @po, @sm, @aiox-master
**Escopo:** `docs/stories/` — todo o pipeline de remediação de débito técnico

---

## 1. Contexto

@po escalou um conflito entre `phase-5-storage-adapter.md` (Draft, NO-GO 6/10) e
`story-2.1-storage-adapter-dominio.md` (InProgress desde 2026-09-08). A investigação
confirmou os 7 bloqueadores reportados **e revelou que o conflito não é local à Phase 5**.

### 1.1 Causa raiz: dois sistemas de planejamento paralelos

Existem hoje **dois tracks concorrentes descrevendo o mesmo trabalho**:

| Track | Origem | Autor | Artefatos |
|---|---|---|---|
| **A — Epic Story Track** | Fase 10 do Brownfield Discovery, 2026-09-07 | @pm (Morgan) | `epic-technical-debt.md` + `story-0.1` … `story-3.2` (11 stories, rastreadas aos 47 débitos do assessment) |
| **B — Phase Track** | 2026-09-08/09 | @aiox-master (Orion) | `PHASE-PIPELINE-INDEX.md` + `phase-1` … `phase-5` |

O Track B é um **re-empacotamento parcial** do Track A, sem rastreabilidade ao assessment:

| Phase | Corresponde a | Status Phase | Status Story | Divergente? |
|---|---|---|---|---|
| Phase 3 (a11y) | Story 2.3 | **Done** | — | sim |
| Phase 4 (polish) | Story 2.4 | **Ready** (@dev implementando) | **Draft** | **SIM** |
| Phase 5 (storage) | Story 2.1 | **Draft** (NO-GO) | **InProgress** | **SIM** |

O mesmo trabalho tem dois arquivos, dois status, dois owners e duas listas de arquivos.
Isso é a causa mecânica do conflito escalado — Phase 5 não é um erro isolado de redação,
é o sintoma previsível de uma bifurcação de fonte de verdade.

### 1.2 Bloqueadores confirmados de @po (7/7)

Todos verificados contra o código, todos procedentes. Destaques verificados:
`src/adapters/StorageAdapter.ts` e `src/domain/` existem desde a Phase 0; `zod` está
ausente de `package.json` (deps: react, react-dom, recharts, lucide-react, tailwind).

### 1.3 Bloqueadores adicionais encontrados nesta análise (não reportados)

Estes são **mais graves** que os 7 originais porque afetam código já entregue,
não apenas um documento Draft:

- **B8 — Duas implementações de StorageAdapter coexistem no código.**
  `src/adapters/StorageAdapter.ts` (168 linhas) e `src/domain/storage/StorageAdapter.ts`
  (22 linhas, interface) + `src/domain/storage/WindowStorageAdapter.ts` (73 linhas).
  São contratos diferentes para a mesma responsabilidade.

- **B9 — A violação de `localStorage` já é REAL EM CÓDIGO, não só no doc da Phase 5.**
  `src/adapters/StorageAdapter.ts` usa `window.localStorage` em 12 pontos
  (linhas 14, 16, 32, 49, 61-62, 74-75, 89, 91, 108, 125). @po flagou a Phase 5 por
  *mencionar* localStorage; o adapter entregue na Phase 0 já *o usa*. A invariante de
  produto declarada na Story 2.1 está quebrada no `main` hoje.

- **B10 — Ambos os adapters são código morto.** Nenhum é importado por `src/App.tsx`
  nem por qualquer código de produção. Os únicos importadores são os dois arquivos de
  teste. `App.tsx` (737 linhas) continua acessando `window.storage` diretamente em 4
  pontos. Portanto o AC da Story 2.1 *"não é mais consumo direto e disperso de
  `window.storage` pelos componentes"* **não está atendido**, apesar do Track B declarar
  "Phase 0 ✅ TD-DAT-01/02: StorageAdapter backup/restore".

- **B11 — Inversão de dependência já executada.** `story-2.2` está **InReview**, mas seu
  bloqueador duro `story-2.1` está apenas **InProgress**. O piloto NC-003 foi para review
  sem a fundação que ele declara exigir.

- **B12 — Story 1.3 (toolchain real de lint/test/typecheck) está `Draft`.** A Story 2.1
  declara dependência dura dela ("toolchain de teste real necessária para validar as
  invariantes desta story") e começou mesmo assim. As invariantes I1-I8 não têm como ser
  validadas com credibilidade.

- **B13 — O próprio `PHASE-PIPELINE-INDEX.md` está obsoleto.** Ele descreve
  "Phase 4 = Quality Gates" e "Phase 5 = Remaining/backlog (23 débitos)", que não
  correspondem a `phase-4-polish.md` nem a `phase-5-storage-adapter.md`. O índice
  aponta para arquivos que não existem (`phase-4-gates.md`, `phase-5-remaining.md`).

---

## 2. Decisão

**Opção 3 (estratégia própria), que engloba a Opção 1.**

### D1 — O Epic Story Track (`epic-technical-debt.md` + `story-N.M`) é a ÚNICA fonte de verdade.

Rastreabilidade aos 47 débitos do `technical-debt-assessment.md` é requisito
constitucional (Artigo IV — No Invention). Só o Track A a possui.

### D2 — `phase-5-storage-adapter.md` é CANCELADO. Não será reescrito.

A Opção 2 (reescrever Phase 5 compatível com Story 2.1) foi **rejeitada**: produziria
um documento cujo conteúdo, após remover as invenções (Zod, `localStorage`, retry/backoff,
aggregates `Player`/`StudySession`/`RankingRecord`), seria idêntico à Story 2.1. Manter
dois arquivos para um trabalho é exatamente a causa raiz — reescrever perpetua o defeito.

### D3 — Phase 4 termina em voo; o Phase Track é aposentado a partir da Phase 5.

@dev está implementando Phase 4 agora e @po já aprovou 10/10. Abortar em voo custa mais
do que ganha. Phase 4 conclui, passa pelo QA Gate, e então é **reconciliada** para
`story-2.4` (que passa de `Draft` para o status real resultante do gate).
`phase-1`, `phase-2`, `phase-3`, `phase-4` viram artefatos **históricos** (read-only).

### D4 — Escopo novo e legítimo da Phase 5 → Wave 3 da Story 2.1, sujeito a rastreabilidade.

Triagem do conteúdo da Phase 5:

| Item Phase 5 | Veredito | Razão |
|---|---|---|
| Contrato formal read/write/delete/health | **Já na Story 2.1** | AC 1 e 2 |
| Merge não-destrutivo | **Já na Story 2.1** | AC 3 |
| Camada de domínio | **Já na Story 2.1** | AC 4 |
| Validação de schema via Zod | **REJEITADO** | Dependência não aprovada; sem débito de origem |
| Retry + exponential backoff | **REJEITADO** | `window.storage` é um objeto síncrono em memória; retry é ruído sem falha transiente |
| Fallback em memória | **REJEITADO** | Duplica o estado de saúde `degraded` da Story 2.1 |
| Aggregates OO (`Player`/`StudySession`/`RankingRecord`) | **REJEITADO** | Sem rastreabilidade; conflita com "funções puras" da Story 2.1 |
| Auditoria estruturada de mudanças | **BACKLOG** | Candidato a TD-SYS-18 (observabilidade), não a esta story |
| **Versionamento de schema para migrations** | **ACEITO** | Única ideia genuinamente nova e defensável; entra como Wave 3 |
| Alvos de performance (write <50ms, read <10ms p95) | **REJEITADO** | Inventado; sem baseline. Ver Story 3.1 (caracterização) |

### D5 — Unificação dos dois adapters é adicionada ao escopo da Story 2.1 (B8/B9/B10).

Um único adapter, sobre `window.storage`, importado por `App.tsx`. O
`src/adapters/StorageAdapter.ts` baseado em `localStorage` é removido ou migrado.
**Sem isso, a Story 2.1 não pode ser dada como Done** — hoje seus ACs 1 e 7 não são
verificáveis porque o adapter não está no caminho de execução.

### D6 — Nenhuma story de produto é desbloqueada por esta decisão.

NC-001/002/003 permanecem `Blocked`. A Phase 5 propunha desbloqueá-las; isso está
**revogado**. O desbloqueio ocorre quando Story 2.1 atingir `Done` com D5 satisfeito.

---

## 3. Ações (owner, ordem)

| # | Ação | Owner | Quando |
|---|---|---|---|
| A1 | Marcar `phase-5-storage-adapter.md` como `Cancelled`, apontando para este ADR | @pm | **feito** |
| A2 | Corrigir `PHASE-PIPELINE-INDEX.md`: mapa Phase↔Story, track aposentado | @pm | **feito** |
| A3 | Amendar Story 2.1: Wave 3 (schema versioning) + D5 (unificar adapters, wire em `App.tsx`) nos ACs | **@po** | antes de 2.1 sair de InProgress |
| A4 | Reverter `story-2.2` de `InReview` para `Blocked`/`Draft` até 2.1 estar `Done` (B11) | **@po** | imediato |
| A5 | Elevar `story-1.3` (toolchain) — é pré-requisito duro de 2.1 e está `Draft` (B12) | **@po/@sm** | imediato |
| A6 | Ao concluir Phase 4 + QA Gate, reconciliar resultado em `story-2.4` | @qa → @po | após gate da Phase 4 |
| A7 | Registrar B9 (uso de `localStorage` em produção) como correção obrigatória na Story 2.1 | @dev | dentro de 2.1 |

---

## 4. Impacto no Roadmap

| Antes (Phase Track) | Depois (Story Track) | Delta |
|---|---|---|
| Phase 5 = Storage, 35h, 2-3 sem, owner @data-engineer | Story 2.1 (já InProgress) + Wave 3 | Escopo **não cresce 35h**; cresce ~6-8h (Wave 3 + unificação de adapters). Os outros 27h eram duplicação. |
| Phase 6 = NC-003 Piloto (Story 2.2) | Story 2.2 — **regride** para bloqueada (A4) | Atraso real, mas o "avanço" anterior era ilusório |
| Phase 7 = Monolito (Story 3.1) | Story 3.1 — inalterada | Continua exigindo baseline de caracterização (RX-2) |
| Phase 8 = Pseudonimização (Story 3.2) | Story 3.2 — inalterada | Depende de TD-SYS-09 concluído de verdade |

**Efeito líquido no cronograma:** aproximadamente **neutro a positivo**. A eliminação
da duplicação Phase 5/Story 2.1 recupera mais tempo do que as regressões de A4/A5
consomem. O custo real não é de calendário — é de *reconhecer* que Phase 0 e Story 2.2
estavam contabilizadas como mais completas do que estão.

---

## 5. Riscos da decisão

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| RD-1 | Regredir 2.2 de InReview desmotiva / parece retrabalho | Média | Baixo | O trabalho de 2.2 não é descartado, só re-sequenciado após 2.1 |
| RD-2 | Wire do adapter em `App.tsx` (737 linhas, monolito) causa regressão de dados | **Alta** | **Alto** | É exatamente o RX-2/R5 do assessment. Exige o teste de round-trip com fixture legada (T1.5) **antes** do wire. Não fazer sem a toolchain da Story 1.3 (A5) |
| RD-3 | Aposentar o Phase Track perde contexto já registrado nele | Baixa | Baixo | Arquivos permanecem no repo como histórico read-only; index mantém o mapa Phase↔Story |
| RD-4 | Novo track paralelo é criado de novo no futuro | Média | Alto | D1 é explícito; qualquer novo `phase-*.md` deve ser rejeitado no gate de @po |

---

## 6. Precedente

**Nenhum agente cria uma trilha de planejamento paralela ao epic ativo.** Novo escopo
entra como Wave/story dentro do epic existente, com rastreabilidade a um ID de débito
ou requisito. Documentos de planejamento sem ID de origem violam o Artigo IV
(No Invention) e devem receber NO-GO no gate de @po.
