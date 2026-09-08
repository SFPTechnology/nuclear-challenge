# Epic: Resolução do Débito Técnico — Nuclear Challenge

Status: Draft

**Fonte:** `docs/prd/technical-debt-assessment.md` (Fase 8 do Brownfield Discovery — assessment final, gate APPROVED COM RESSALVAS) + `docs/reports/TECHNICAL-DEBT-REPORT.md` (Fase 9 — relatório executivo)
**Autor:** @pm (Morgan) — Fase 10 do Brownfield Discovery (`plan_remediation` / entrega de epic + stories)
**Data:** 2026-09-07

## Nota de escopo (Artigo IV — No Invention)

Este epic cobre **exclusivamente débito técnico e infraestrutura** — os 47 débitos do assessment (23 de sistema, 17 de frontend/UX, 7 de dados/testabilidade). Ele **não** duplica escopo de produto: as stories de funcionalidade (treino dirigido, relatório pedagógico, taxa ponderada) permanecem em `docs/stories/NC-001-treino-dirigido.md`, `NC-002-relatorio-pedagogico.md` e `NC-003-taxa-ponderada.md`, e continuam bloqueadas (`Status: Blocked`) até que este epic entregue a fundação que elas exigem (camada de domínio, `StorageAdapter`, toolchain de teste). Nenhum requisito abaixo foi inventado — cada item cita o ID de débito correspondente no assessment.

## Objetivo do Epic

Eliminar os riscos irreversíveis identificados no assessment (dano físico a criança, perda de dados de progresso) e reconstruir a "rede de segurança" de qualidade (versionamento, lint, testes, typecheck) que hoje existe apenas na forma, não na função — para que o produto possa evoluir com confiança e desbloquear as stories de produto NC-001/002/003.

Citação do assessment que resume a tese central deste epic:

> "o produto está funcionalmente maduro; a rede de segurança que autorizaria alterá-lo é uma ilusão de conformidade... a camada que essa rede deveria proteger já está perdendo dado de criança hoje, em silêncio, sem log, sem rollback e sem backup." (`technical-debt-assessment.md`, Executive Summary)

## Escopo — 47 débitos agrupados pelas 4 fases do Timeline (relatório executivo)

### Fase 0 — Ações Imediatas de Segurança (~3h / R$ 450)

Risco de dano físico e perda irreversível de dado. Fora da fila normal (P0-SAFETY, P0-SAFETY-DATA).

| Débito | Descrição resumida | Esforço |
|---|---|---|
| TD-SYS-04 | Ausência de Git | S (~0,25h) |
| TD-SYS-16 | `.gitignore` não cobre `Arquivos_Diversos/` | incluído nos ~0,25h |
| UX-D07 | Animações 8,3–11,1 Hz sem `prefers-reduced-motion` — risco fotoconvulsivo/vestibular | S (1,75h) |
| TD-DAT-01 | `saveResult` destrói campo desconhecido por whitelist | S — guarda (~1h, compartilhado com TD-DAT-02/05) |
| TD-DAT-02 | Falha de leitura silenciosa → sobrescrita do blob da turma | S — guarda (idem) |
| TD-DAT-05 | `storeErr` só renderiza no login — perda invisível | S — guarda (idem) |

**→ Story: `story-0.1-seguranca-imediata.md`**

### Fase 1 — Quick Wins (curto prazo, semanas 1-2)

Fundação de qualidade e design: design system, estrutura de arquivos, base de build/lint, e substituição dos testes que não testam nada.

| Débito | Descrição resumida | Esforço |
|---|---|---|
| TD-SYS-05 | Inversão de fronteira de código (app em `Arquivos_Diversos/`) | M |
| TD-SYS-11 | Sem `vite.config` / plugin React / aliases | S |
| TD-SYS-17 | `SUPABASE_SERVICE_ROLE_KEY` no `.env` client-side | S (~0,25h) |
| TD-SYS-10 | Bloqueio de NC-001/002/003 com motivo obsoleto | S — fecho documental |
| UX-D02 | Design system inexistente | L (24h) |
| UX-D23 | 100 `fontSize` em px, 0 `rem`/`em` | M (10h) |
| TD-SYS-19 | `globals` incompletos no ESLint | S |
| TD-SYS-02 | Gate de lint cobre ~2% do código | M |
| TD-QA-01 | Sem toolchain de teste comportamental (Vitest + happy-dom) | S |
| TD-SYS-03 | Testes sem valor comportamental (provado por mutação) | L |
| TD-SYS-01 | `typecheck` cego (`@ts-nocheck`) | XL |

**→ Stories: `story-1.1-fronteira-codigo-build.md`, `story-1.2-design-tokens-tipografia.md`, `story-1.3-qualidade-lint-testes-typecheck.md`**

### Fase 2 — Fundação (médio prazo, semanas 3-6)

Camada de dados confiável, primeira tela nova, exclusão de dado de operador, primeiro pacote de acessibilidade.

| Débito | Descrição resumida | Esforço |
|---|---|---|
| TD-SYS-09 | `window.storage` sem contrato (inclui política de merge de TD-DAT-01) | M |
| TD-SYS-07 | Ausência de camada de domínio → contratos CLI impossíveis | L |
| UX-D24 (metade a) | Exclusão de operador (UI) | M (4h da metade a) |
| UX-D16 | Telas de NC-001/002/003 inexistentes; sem primitivas (parcial) | L (20h, parcial) |
| UX-D05 | A11y quase nula | L (28h subconjunto AA) |
| UX-D19 | Foco não gerenciado | S (4h) |
| UX-D06 | Cor como canal semântico único | M (12h) |
| UX-D14 | Contraste insuficiente | S (6h) |
| TD-SYS-08 | Tailwind congelado (utility nova falha em silêncio) | M |
| UX-D10 | Sem empty states | M (10h) |
| TD-SYS-18 | Zero observabilidade / `ErrorBoundary` | M |
| TD-DAT-03 | `partidas` é top-40 global, não histórico — NC-002 AC-2 infactível | M (decisão T5.1) |

**→ Stories: `story-2.1-storage-adapter-dominio.md`, `story-2.2-nc003-piloto-exclusao-operador.md`, `story-2.3-a11y-parada-1.md`, `story-2.4-empty-state-error-boundary.md`, `story-2.5-decisao-t5-1-historico-nc002.md`**

### Fase 3 — Otimização (longo prazo, contínuo)

Quebra do monolito (maior esforço do assessment), pseudonimização, e itens de baixa prioridade (P3).

| Débito | Descrição resumida | Esforço |
|---|---|---|
| TD-QA-02 | Sem baseline de caracterização (pré-requisito duro) | M |
| TD-SYS-06 | Monolito de ~1.070 linhas | XL |
| TD-SYS-20 | `StrictMode` + efeitos sem cleanup (corrigido durante a extração) | M |
| TD-DAT-04 | Pseudonimização (nome como chave primária) | M |
| UX-D11 | Responsividade por `zoom`, não por refluxo | L (16h) |
| UX-D22 | `<style>` reinjetado em 6 telas | S (3h) |
| TD-SYS-13 | Balanceamento hardcoded | M |
| TD-SYS-12 | Bundle único sem code splitting | M |
| TD-SYS-21 | Ausência de CI/CD | M |
| UX-D08 | Sem loading state | S (3h) |
| UX-D18 | Sem medição de performance percebida | M (6h) |
| UX-D15 | Alvos de toque abaixo de AAA | S (3h) |
| UX-D17 | `pause`/calendário sem rastreabilidade | S (3h) |
| UX-D25 | Sem legenda de atalhos de teclado | S (3h) |
| TD-SYS-22 | `dist/default.php` versionado no artefato | S |
| TD-SYS-23 | Majors adotados sem ADR | S |
| TD-SYS-14 | Cópias divergentes do artefato de deploy | M |
| TD-SYS-15 | Servidor local serve JS/CSS como `octet-stream` | S |

**→ Stories: `story-3.1-baseline-caracterizacao-monolito.md`, `story-3.2-pseudonimizacao-refluxo-higiene-final.md`**

## Critérios de Sucesso do Epic

1. Zero riscos P0-SAFETY / P0-SAFETY-DATA ativos após a Fase 0 (UX-D07, TD-DAT-01/02/05 corrigidos e verificados contra o artefato publicado, não o dev server — T0).
2. Repositório Git existente, com `.gitignore` cobrindo artefatos gerados, antes de qualquer outra correção de código (TD-SYS-04/16).
3. As 8 invariantes executáveis (I1-I8) definidas no assessment passam em CI local via Vitest + happy-dom (fecha TD-SYS-03, TD-QA-01).
4. `typecheck` executa sem `@ts-nocheck` no arquivo de aplicação principal, com `strict: true` (fecha TD-SYS-01).
5. Lint cobre 100% do código de aplicação, com plugins React/hooks/a11y ativos (fecha TD-SYS-02/19).
6. `StorageAdapter` com contrato formal, política de merge não destrutiva e estado de saúde explícito (fecha TD-SYS-09, TD-DAT-01 definitivo).
7. Bloqueio de NC-001/002/003 atualizado com o motivo real (TD-SYS-07, TD-DAT-03, TD-SYS-09), removendo o motivo obsoleto de TD-SYS-10.
8. Suíte de acessibilidade `axe-core` executando nas 9 telas, sem regressão de nomes acessíveis (T4), condicionada à resolução prévia de TD-SYS-08 (RX-6).
9. Nenhuma story nova aceita sem: nome acessível em todo interativo novo; estado transmitido por ao menos dois canais; nenhuma animação acima de 3 Hz; teste de round-trip com fixture legada para qualquer story que toque persistência (regra de veto de UX + 4ª cláusula, herdada do assessment).
10. Decisão T5.1 registrada antes da Fase 10 de planejamento de sprint, determinando se NC-002 usa `matches` ou migra para `studyLog` (fecha TD-DAT-03).

## Timeline (ordens de grandeza — herdado do relatório executivo, não é compromisso de sprint)

| Fase | Prazo | Esforço/nota |
|---|---|---|
| Fase 0 — Ações Imediatas de Segurança | Hoje (~3h) | R$ 450 — sem dependência técnica pendente |
| Fase 1 — Quick Wins | Semanas 1-2 | Fundação de qualidade e design |
| Fase 2 — Fundação | Semanas 3-6 | StorageAdapter, domínio, NC-003 piloto, a11y Parada 1 |
| Fase 3 — Otimização | Contínuo | Quebra do monolito (XL) + pseudonimização + P3s |

## Budget de Referência (herdado do relatório executivo — `TECHNICAL-DEBT-REPORT.md`)

| Item | Valor |
|---|---|
| Base de custo | R$ 150/hora |
| Fase 0 (riscos irreversíveis) | ~3h ≈ **R$ 450** |
| Frontend/UX quantificado (17 débitos, único subconjunto com horas firmes) | 160,75h ≈ **R$ 24.112,50** |
| Sistema + Dados/Testes (30 débitos, estimativa em ordem de grandeza, piso direcional) | ≥ 540h ≈ **R$ 81.000+ (piso, não teto)** |
| **Investimento total estimado (piso, todos os 47 débitos)** | **a partir de R$ 100.000** — a refinar em planejamento de sprint |

> Nota: os valores de sistema/dados são piso direcional, não cotação — os dois itens XL (TD-SYS-01 typecheck, TD-SYS-06 monolito) são historicamente os que mais estouram estimativa em projetos deste porte, conforme o próprio relatório executivo adverte.

## Risco e Avaliação (herdado do assessment — não reaberto)

- **R1 (Alta→Confirmada, Crítico):** regressão silenciosa aprovada por gates verdes — provado por mutação. Mitigado pela Story 1.3.
- **R2 (Média, Crítico):** perda irrecuperável de trabalho sem Git. Mitigado pela Story 0.1.
- **R11 (Média, Crítico):** perda irreversível de dado pedagógico de criança por dois mecanismos independentes, provavelmente já em curso. Mitigado pela Story 0.1.
- **R8 (Média-Alta, Crítico):** dano físico a usuário infantil por animações sem escape. Mitigado pela Story 0.1.
- **RX-2 (Crítico):** a refatoração do monolito pode destruir dados sem que nenhum gate perceba — mitigado exigindo TD-QA-02 (baseline de caracterização) como pré-requisito duro da Story 3.1.
- **RX-3 (Alto):** o próprio épico de produto (NC-002 AC-2, NC-003 AC-2) planeja stories estruturalmente impossíveis com os dados atuais — mitigado pela decisão T5.1 (Story 2.5), que deve concluir antes de qualquer replanejamento de NC-002.
- **RX-6 (Médio):** correção de acessibilidade pode quebrar a UI em silêncio (Tailwind congelado). Mitigado por regra dura: a11y Parada 1 (Story 2.3) não inicia antes de TD-SYS-08 resolvido (Story 1.1... nota: TD-SYS-08 está coberto na Story 1.1 como dependência de bloqueio da Story 2.3 — ver seção de dependências abaixo).

**Nota de correção:** TD-SYS-08 (Tailwind congelado) não está listado na tabela da Fase 1 acima por omissão do agrupamento original de fases do relatório executivo (que o classifica em "Impacto no Negócio", não na tabela de fases); ele é tratado tecnicamente dentro da Story 2.3 como pré-requisito duro (RX-6), citado explicitamente na tabela de débitos da Fase 2. Nenhuma severidade ou prioridade foi alterada — apenas o agrupamento por fase segue a Matriz de Priorização Final (P1) do assessment, que classifica TD-SYS-08 em P1, coerente com sua posição na Fase 1/2 de transição.

## Ordem de Execução e Dependências (grafo de causalidade — herdado do Plano de Resolução)

```
Story 0.1 (Git + UX-D07 + guarda de dados)
   └─→ Story 1.1 (fronteira src/ + build + TD-SYS-17 + fecho TD-SYS-10)
         ├─→ Story 1.2 (tokens de design + rem/em)
         │      └─→ Story 2.3 (a11y Parada 1) [requer também TD-SYS-08 resolvido em 1.1]
         │      └─→ Story 2.4 (empty state + error boundary)
         └─→ Story 1.3 (globals → lint → runner de teste → testes comportamentais → typecheck)
               └─→ Story 2.1 (StorageAdapter + domínio)
                     ├─→ Story 2.2 (NC-003 piloto + exclusão de operador)
                     └─→ Story 3.1 (baseline de caracterização → quebra do monolito) [requer também 1.3]
                           └─→ Story 3.2 (pseudonimização + refluxo + higiene P3)
Story 2.5 (decisão T5.1) — paralela, requer apenas 0.1 e a toolchain de 1.3 (TD-QA-01)
```

## Stories deste Epic

| ID | Título | Fase | Débitos endereçados | Esforço | Status |
|---|---|---|---|---|---|
| story-0.1 | Segurança imediata — Git, UX-D07, guarda anti-destruição | 0 | TD-SYS-04, TD-SYS-16, UX-D07, TD-DAT-01 (guarda), TD-DAT-02, TD-DAT-05 | S (~3h) | Draft |
| story-1.1 | Fronteira de código, build e higiene de configuração | 1 | TD-SYS-05, TD-SYS-11, TD-SYS-17, TD-SYS-10 (fecho) | M | Draft |
| story-1.2 | Design tokens e tipografia acessível | 1 | UX-D02, UX-D23 | L (34h) | Draft |
| story-1.3 | Qualidade real — lint, runner de teste, testes comportamentais, typecheck | 1 | TD-SYS-19, TD-SYS-02, TD-QA-01, TD-SYS-03, TD-SYS-01 | L/XL | Draft |
| story-2.1 | StorageAdapter e camada de domínio | 2 | TD-SYS-09, TD-SYS-07 | L | Draft |
| story-2.2 | NC-003 piloto e exclusão de dados do operador | 2 | UX-D24 (metade a), UX-D16 (parcial) | M | Draft |
| story-2.3 | Acessibilidade — Parada 1 | 2 | UX-D05, UX-D19, UX-D06, UX-D14, TD-SYS-08 | L (50h) | Draft |
| story-2.4 | Empty states e ErrorBoundary | 2 | UX-D10, TD-SYS-18 | M (10h + M) | Draft |
| story-2.5 | Decisão T5.1 — viabilidade de histórico para NC-002 | 2 | TD-DAT-03 | M | Draft |
| story-3.1 | Baseline de caracterização e quebra do monolito | 3 | TD-QA-02, TD-SYS-06, TD-SYS-20 | XL | Draft |
| story-3.2 | Pseudonimização, refluxo e higiene final (P3) | 3 | TD-DAT-04, UX-D11, UX-D22, TD-SYS-12/13/14/15/21/22/23, UX-D08/15/17/18/25 | L | Draft |

## Fora de Escopo deste Epic

- As 3 ações de execução já mencionadas no assessment como "pendentes fora do discovery" (0a, 0b, 0c) **são** o conteúdo da Story 0.1 — não estão fora de escopo, apenas eram pendentes de autorização, que este epic formaliza.
- **W1** (emenda ao `brownfield-discovery.yaml` sobre auditoria de dados quando não há SGBD) é uma ação de framework, não de produto — segue como ação separada de @pm/@aiox-master, fora deste epic.
- Escopo de produto (funcionalidades de NC-001/002/003) permanece nas stories de produto existentes.

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação do epic — Fase 10 do Brownfield Discovery, a partir do assessment final (Fase 8) e do relatório executivo (Fase 9) |
