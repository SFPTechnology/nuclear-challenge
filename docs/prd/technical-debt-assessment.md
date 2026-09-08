# Technical Debt Assessment - FINAL

**Documento:** `docs/prd/technical-debt-assessment.md`
**Fase:** Brownfield Discovery — Fase 8 (`finalize_assessment`)
**Autor:** @architect (Aria)
**Data:** 2026-09-07
**Status:** ✅ **FINAL** — consolida DRAFT v2.0 (Fase 4) + `ux-specialist-review.md` (Fase 6) + `qa-review.md` incluindo a Re-Review (Fase 7). Gate: **APPROVED COM RESSALVAS** (9/10 condições C1-C10 atendidas, 1 parcial — a metade dependente de @ux-design-expert já foi cumprida via errata E1; ver §Proveniência). As 4 ressalvas de higiene H1-H4 do QA estão corrigidas neste documento.

---

## Nota de proveniência (por que este documento existe e o que ele NÃO refaz)

Este é um **documento de síntese**, não uma quarta rodada de análise. Nenhuma evidência de código foi reaberta aqui — a Fase 4 (v1.0 e v2.0) e a Re-Review da Fase 7 já reverificaram cada linha citada (L344-401, L656-679, L725, `eslint.config.js`) e a Re-Review confirmou, de forma independente, que a v2.0 não incorporou nada por citação. O trabalho desta fase é: (1) herdar os 47 débitos sem reabri-los, (2) aplicar as correções de higiene H1-H4, (3) fechar a ordem de execução sem os 7 gaps apontados em H4, e (4) declarar o que continua fora do escopo de discovery.

**Cadeia de agentes:** @architect (Fases 1, 4) → @ux-design-expert (Fases 3, 6, errata E1) → @qa (Fase 7, incluindo Re-Review) → @architect (Fase 8, este documento).

**Nota sobre a Fase 2/5 (banco de dados):** não há SGBD neste projeto — nenhum `supabase/`, nenhuma migration, zero chamadas de rede, `window.storage` com dois blobs JSON como única camada de I/O. A Fase 2/5 foi corretamente pulada quanto ao fato ("não há banco"), mas a v1.0 errou ao tratar isso como "não há dados a auditar". Esse erro de premissa — documentado em detalhe no DRAFT §0.5 — é a causa raiz do primeiro veredito NEEDS WORK e da existência dos 7 débitos TD-DAT-*/TD-QA-* em §Inventário. **Recomendação de processo, elevada além deste projeto:** quando a Fase 2 for pulada por ausência de SGBD, o workflow `brownfield-discovery.yaml` deve exigir um substituto explícito — auditoria nominal do contrato de persistência efetivo (`window.storage`, `localStorage`, arquivo, ou API de host), atribuída a um agente nomeado (ação **W1**, §Ações Pendentes).

---

## Executive Summary

- **Total de débitos: 47** (23 de sistema · 17 de frontend/UX · 7 de dados/testabilidade)
- **Críticos: 10 | Altos: 14 | Médios: 18 | Baixos: 5**
- **Esforço total estimado (apenas frontend/UX, único subconjunto com horas atribuídas por especialista): 160,75 horas** — ver §Nota sobre esforço abaixo. Os débitos de sistema e de dados/testabilidade estão estimados em ordens de grandeza (S/M/L/XL), não em horas, por decisão de arquitetura preservada da v1.0 (compromisso de horas pertence à Fase 10/planejamento de sprint, não ao discovery).
- **Duas classes de prioridade fora da fila normal** (P0-SAFETY, P0-SAFETY-DATA), cobrindo 4 itens com risco de dano físico ou perda irreversível de dado, todos de esforço S e dependência arquitetural zero.
- **Tese central:** o produto está funcionalmente maduro; a rede de segurança que autorizaria alterá-lo é uma ilusão de conformidade (3 dos 4 quality gates não verificam nada, provado por mutação). E — descoberta da Fase 7, que só apareceu por reabertura de código, não por releitura de documento — **a camada que essa rede deveria proteger já está perdendo dado de criança hoje**, em silêncio, sem log, sem rollback e sem backup.

### Nota sobre esforço

O DRAFT trazia duas somas para as horas de frontend sem desambiguação (H3): **160,5 h** era a soma pré-emenda registrada em §0.1 (17 linhas, antes do ajuste do UX-D07); **160,75 h** é a soma pós-emenda, registrada em §2.1, após a Fase 7 ampliar o escopo do UX-D07 em +0,25 h (G8: incluir `rumble` e `grainShift`). **A Re-Review recontou a soma da tabela de 17 linhas de forma independente e confirmou 160,75 h exatos.** Este é o número correto e único a ser citado daqui em diante; **160,5 h fica obsoleto** e não deve aparecer em nenhum artefato posterior (Fase 9 incluída).

---

## Inventário Completo de Débitos

### Sistema (validado por @architect) — 23 débitos

Fonte: `docs/architecture/system-architecture.md` §6 (Fase 1). **Correção de higiene H1:** o DRAFT v2.0 afirmava "nenhuma linha desta seção foi alterada", o que é factualmente falso — TD-SYS-03, 04, 09, 10, 17, 18 e 19 carregam texto novo de v2.0, e a anotação de TD-SYS-09 é uma correção factual material, não cosmética. **Correção adotada aqui:** nenhum débito desta seção foi refutado ou removido pelo `@qa`; **7 receberam anotação de v2.0** (correção de premissa, reconfirmação de evidência ou ampliação de escopo), sem alteração de severidade.

| ID | Débito | Severidade | Área |
|---|---|---|---|
| TD-SYS-01 ⊕ UX-D04 | Gate de `typecheck` inoperante: `@ts-nocheck` na linha 1 do único arquivo de aplicação, reforçado por `strict:false` e `checkJs:false`. Verificação efetiva ≈ 0% | CRITICAL | Qualidade / Build |
| TD-SYS-02 | Gate de `lint` cobre ~2% do código: `files` no config exclui o `.tsx` de 1.342 linhas. Zero plugins React/hooks/a11y/security | CRITICAL | Qualidade |
| TD-SYS-03 ⊕ UX-D13 *(v2.0)* | Gate de `test` sem valor comportamental — provado por mutação na Fase 7 (§3.3.1 do DRAFT): o gate aprova a destruição total do recurso e reprova a formatação correta dele | CRITICAL | Testes |
| TD-SYS-04 *(v2.0)* | Ausência de controle de versão. Reconfirmado 2026-09-07: `.git/` continua ausente (verificado de novo na Re-Review da Fase 7) | CRITICAL | Governança |
| TD-SYS-05 ⊕ UX-D01 | Inversão de fronteira de código: app inteira em `Arquivos_Diversos/`. Causa raiz mecânica de TD-SYS-02 e TD-SYS-16 | CRITICAL ⬆ | Arquitetura |
| TD-SYS-06 ⊕ UX-D12 | Monolito de ~1.070 linhas, 42 `useState`, 20 `useEffect` | HIGH | Arquitetura |
| TD-SYS-07 | Ausência de camada de domínio → contratos CLI impossíveis. Bloqueia NC-001 AC-5, NC-002 AC-1, NC-003 AC-1 | HIGH | Arquitetura / Constitution |
| TD-SYS-08 ⊕ UX-D03 | Tailwind congelado como CSS pré-compilado; utility nova falha silenciosamente. CRITICAL pelo modo de falha, não pela extensão | CRITICAL ⬆ | Build / UI |
| TD-SYS-09 *(v2.0)* | `window.storage` sem contrato. **Escopo ampliado:** o adapter deve possuir a política de merge do registro (TD-DAT-01). **Correção factual:** "indisponibilidade = falha total na inicialização" está errada — há `try/catch`; ver R5 reescrito | HIGH | Integração / Dados |
| TD-SYS-10 *(v2.0)* | Bloqueio de NC-001/002/003 com motivo obsoleto. O bloqueio real ficou maior: NC-002 depende de estrutura de dados inexistente (TD-DAT-03) e NC-003 AC-2 é violado pelo código atual (TD-DAT-01) | HIGH | Governança / Rastreabilidade |
| TD-SYS-11 ⊕ UX-D21 | Ausência de `vite.config.*` e plugin React. Artigo VI inaplicável | MEDIUM | Build / DX |
| TD-SYS-12 | Bundle único de 910.440 bytes sem code splitting | MEDIUM | Performance |
| TD-SYS-13 | Balanceamento hardcoded no código | MEDIUM | Configuração |
| TD-SYS-14 ⊕ UX-D20 | Quatro cópias divergentes do artefato de deploy | MEDIUM | Build / Deploy |
| TD-SYS-15 | Servidor local serve JS/CSS como `application/octet-stream` → tela branca sem erro de rede | MEDIUM | Ferramental |
| TD-SYS-16 | `.gitignore` não cobre `Arquivos_Diversos/` — janela única antes do 1º commit | MEDIUM | Governança |
| TD-SYS-17 *(v2.0)* | `SUPABASE_SERVICE_ROLE_KEY` no `.env` de projeto Vite client-side. Pressão sobre esse trilho aumentou (RX-8) | MEDIUM | Segurança |
| TD-SYS-18 ⊕ UX-D09 | Zero observabilidade e zero recuperação de erro. Face de runtime documentada em TD-DAT-05 | HIGH ⬆ | Observabilidade / UX |
| TD-SYS-19 *(v2.0)* | `globals` incompletos no ESLint — armadilha embutida na correção de TD-SYS-02, confirmada pelo `@qa` | MEDIUM | Qualidade |
| TD-SYS-20 | `StrictMode` + 20 efeitos com timers e `AudioContext` sem cleanup | MEDIUM | Runtime |
| TD-SYS-21 | Ausência de CI/CD; publicação por ZIP manual | MEDIUM | DevOps |
| TD-SYS-22 | `dist/default.php` da Hostinger versionado no artefato de build | LOW | Deploy / Segurança |
| TD-SYS-23 | Majors recentes (TS 7, Vite 8, ESLint 10) adotados sem ADR ou nota de migração | LOW | Manutenção |

**Subtotal de sistema: 6 CRITICAL · 5 HIGH · 10 MEDIUM · 2 LOW = 23.**

### Frontend/UX (validado por @ux-design-expert) — 17 débitos

Fonte: `docs/reviews/ux-specialist-review.md` §1.1 (Fase 6), tabela recontada — 17 linhas, não 15 (correção aritmética de G10, confirmada de forma independente pela Re-Review). As severidades e horas são de Uma, herdadas com atribuição. Cinco achados da Fase 3 foram rebaixados por ela mesma com evidência bruta, e um sexto (UX-D14) teve a medição corrigida sem mudança de severidade — ver **correção H2** abaixo.

**Correção de higiene H2 (autocorreções da Fase 6):** o DRAFT divergia internamente sobre o número de autocorreções (3 em alguns trechos, 4 na tabela §2.0, 6 em outros, 5 marcadores ⬇ na tabela). **Número correto, fixado aqui: 5 rebaixamentos de severidade** (UX-D11, UX-D08, UX-D02, UX-D15, UX-D17) **+ 1 correção factual sem mudança de severidade** (UX-D14 — era Média na Fase 3, permanece MÉDIA; o que mudou foi a medição do contraste, não a classificação). Isso importa além da higiene: a v2.0 usava "seis rebaixamentos" como prova de que a nova regra de severidade (§2.5.1, herdada abaixo) não é uma catraca de sentido único. **O argumento sobrevive com 5** — a regra revogada («prevalece a maior severidade») teria de fato proibido essas 5 correções documentadas com medição bruta.

| ID | Débito | Severidade | Horas | Prio. UX | Impacto UX |
|---|---|---|---|---|---|
| UX-D07 | Animações sem `prefers-reduced-motion` — `rumbleHard` 11,1 Hz + `glitch` 11,1 Hz + `rumble` 8,3 Hz + `grainShift` 3,57 Hz (escopo emendado pela Fase 7 — G8) | CRÍTICA ⬆ | 1,75 ⬆ | P0-SAFETY | Único débito com potencial de dano físico (fotoconvulsivo, vestibular) em criança, sem escape |
| UX-D05 | A11y quase nula — 3 `aria-*`, 0 `role`, 0 `tabIndex`, 24/27 botões sem nome acessível | CRÍTICA | 28 (subconj. AA) / +34 AA integral | P1-UX | Produto educacional inutilizável por leitor de tela |
| UX-D23 🆕 | `fontSize` numéricos em px, 0 `rem`/`em` — 100 ocorrências (Uma mediu 93; recontado pelo `@qa`) | ALTA | 10 | P1-UX | A falha de a11y mais completa do produto, sem caminho de contorno |
| UX-D10 | Sem empty states — AC explícito de NC-001 e NC-002 | ALTA | 10 | P1-UX | Professor lê ausência de dado como produto quebrado |
| UX-D02 | Design system inexistente — 168 blocos `style={{}}` vs 227 `className`, cores literais | ALTA ⬇ | 24 | P1-UX | Rebaixada: não bloqueia story, garante degradação visual |
| UX-D06 | Cor como canal semântico único — WCAG 1.4.1 | ALTA | 12 | P2-UX | Aluno daltônico perde a partida sem entender por quê; contamina a métrica pedagógica (RX-4) |
| UX-D24 🆕 | Sem exclusão de operador e sem pseudonimização — nome de criança persiste indefinidamente, exposto em ranking | ALTA | 8 (4+4; metade reclassificada → TD-DAT-04) | P2-UX | Dado pessoal de menor sem consentimento nem direito de eliminação |
| UX-D16 | Nenhuma tela existe para NC-001/002/003; sem `ScreenLayout` | MÉDIA | 20 (só primitivas) | P1-UX | Reclassificado: telas são escopo de produto; o débito é a ausência das primitivas |
| UX-D11 | Responsividade por escala (`zoom`), não por refluxo | MÉDIA ⬇ | 16 | P2-UX | Autocorreção: a camada responsiva existe; o débito é o mecanismo, não a ausência |
| UX-D14 | Contraste — medido: `#6b7280` falha nos 6 fundos; `#ef4444` = 3,54:1; `#8d959e` = 4,39:1 marginal | MÉDIA | 6 | P2-UX | O pior caso é o vermelho de perigo ilegível |
| UX-D19 | Foco não gerenciado nas 9 transições de `mode` | MÉDIA | 4 | P2-UX | Sub-item do pacote UX-D05 |
| UX-D22 🆕 | `<style>` reinjetado em 6 raízes de tela — invisível a lint, minificação e auditoria | MÉDIA | 3 | P3-UX | É por isso que `prefers-reduced-motion` nunca apareceu em varredura |
| UX-D08 | Sem loading state | MÉDIA ⬇ | 3 | P3-UX | Rebaixada: zero chamadas de rede; risco real é falha, não espera |
| UX-D18 | Sem medição de performance percebida (LCP/INP/CLS) | MÉDIA | 6 | P3-UX | Agrava UX-D07 (RX-5) |
| UX-D25 🆕 | Sem legenda de atalhos de teclado | BAIXA | 3 | P3-UX | Recurso de a11y já pago e desperdiçado |
| UX-D15 | Alvos de toque — medido: teclado ≈119×37px | BAIXA ⬇ | 3 | P3-UX | Passa 2.5.8 AA; falha só 2.5.5 AAA |
| UX-D17 | `pause` e calendário sem rastreabilidade — Artigo IV | BAIXA ⬇ | 3 | P3-UX | Documentar, não remover — o calendário é insumo de NC-002 |

**Subtotal de frontend: 2 CRÍTICA · 5 ALTA · 7 MÉDIA · 3 BAIXA = 17 débitos · 160,75 h** (correção H3 aplicada — ver §Nota sobre esforço).

*Débitos absorvidos na seção Sistema (não recontar): UX-D01→TD-SYS-05, UX-D03→TD-SYS-08, UX-D04→TD-SYS-01, UX-D09→TD-SYS-18, UX-D12→TD-SYS-06, UX-D13→TD-SYS-03, UX-D20→TD-SYS-14, UX-D21→TD-SYS-11.*

### Dados/Testes (identificado por @qa) — 7 débitos

Origem: gaps G1-G7 de `docs/reviews/qa-review.md` (Fase 7). Causa da omissão nas Fases 1/3/4/6: erro de premissa documentado no DRAFT §0.5 — "não há banco" foi lido como "não há dados a auditar". Cada evidência de código foi reverificada pelo `@architect` no DRAFT v2.0 antes de promover estes gaps a débitos de primeira classe, e a Re-Review da Fase 7 confirmou essa reverificação de forma independente.

| ID | Débito | Severidade | Esforço | Prioridade |
|---|---|---|---|---|
| TD-DAT-01 (G1) | `saveResult` reconstrói o registro por whitelist (objeto literal, não `{...p, ...}`) — destrói campo desconhecido no primeiro save. Viola NC-003 AC-2 e NC-002 AC-4 **hoje, no código atual** | CRITICAL | S (guarda) / M (definitivo) | P0-SAFETY-DATA |
| TD-DAT-02 (G2) | Falha de leitura de `window.storage` é silenciosa (`try/catch` descarta `okStore` em **dois** call sites) → login mostra "nenhum operador" → recadastro sobrescreve o blob inteiro da turma. Corrige o erro factual da Fase 1 sobre R5 | CRITICAL | S (guarda) / M (definitivo) | P0-SAFETY-DATA |
| TD-DAT-03 (G3) | `partidas` é top-40 global por pontuação, não histórico — não é longitudinal, é enviesado por sobrevivência, é multi-operador. NC-002 AC-2 infactível como escrito. Decidido por T5.1 | HIGH | M | P1 |
| TD-DAT-04 (G4) | Nome da criança é chave primária — pseudonimizar é migração de chave, não UI. Depende de TD-SYS-09; sub-story de UX-D24 (`UX-D24b`) | HIGH | M | P2 |
| TD-DAT-05 (G7) | `storeErr` só renderiza na tela de login — falha de escrita no fim de partida é invisível. Face de runtime de TD-SYS-18 | MEDIUM | S | P0-SAFETY-DATA (parte da guarda 0c) |
| TD-QA-01 (G5) | TD-SYS-03 não tem caminho de execução — falta toolchain de teste comportamental. Decisão adotada: Vitest + `happy-dom` | HIGH | S (decisão + setup) | P0 |
| TD-QA-02 (G6) | Não existe baseline de caracterização para o Gold Standard — "não regredir" é afirmação de documento, não asserção executável. Pré-requisito duro de TD-SYS-06 | HIGH | M | P1 |

**Subtotal de dados/testabilidade: 2 CRITICAL · 4 HIGH · 1 MEDIUM · 0 LOW = 7.**

*(G8 — correção de escopo do UX-D07 — e G9 — verificação técnica do mecanismo de correção — e G10 — higiene aritmética — não são débitos; estão incorporados como correções nas linhas acima e em §Ressalvas.)*

---

## Matriz de Priorização Final

**Legenda de esforço:** S ≤ meio dia · M 1–3 dias · L 1–2 semanas · XL > 2 semanas ou incremental contínuo.

**Prioridade:**
- **P0-SAFETY** = risco de dano físico ao usuário. Fora da fila.
- **P0-SAFETY-DATA** = risco de destruição irreversível de dado do usuário. Fora da fila.
- **P0** = pré-requisito de qualquer outro trabalho · **P1** = desbloqueia NC-001/002/003 · **P2** = dano real a usuário ou custo crescente · **P3** = higiene.

**Critério unificador das duas classes fora da fila:** irreversibilidade × esforço S × dependência arquitetural zero — as três condições simultaneamente. Exatamente quatro itens qualificam: UX-D07 (dano físico) e TD-DAT-01 + TD-DAT-02 + TD-DAT-05 (destruição de dado, uma guarda única). **Rejeição explícita, mantida da v2.0:** UX-D05, UX-D23 e TD-SYS-08 não furam a fila por este caminho — são graves, são P1, e têm dependências reais.

| ID | Débito | Área | Impacto | Esforço | Prioridade |
|---|---|---|---|---|---|
| UX-D07 ⬆ | Animações 8,3–11,1 Hz sem escape — dano físico a criança | A11y / Segurança | CRÍTICA | S (1,75 h) | **P0-SAFETY** 🔴 |
| TD-DAT-01 | `saveResult` destrói campo desconhecido por whitelist | Dados | CRITICAL | S (guarda) | **P0-SAFETY-DATA** 🔴 |
| TD-DAT-02 | Falha de leitura silenciosa → sobrescrita do blob da turma | Dados | CRITICAL | S (guarda) | **P0-SAFETY-DATA** 🔴 |
| TD-DAT-05 | `storeErr` só renderiza no login — perda invisível | Observabilidade | MEDIUM | S | **P0-SAFETY-DATA** 🔴 |
| TD-SYS-04 | Ausência de Git — sem rollback para nenhuma correção | Governança | CRITICAL | S | **P0** |
| TD-SYS-16 | `.gitignore` não cobre `Arquivos_Diversos/` — janela única | Governança | MEDIUM | S | **P0** |
| TD-SYS-05 ⬆ | UI/app fora de `src/` — causa raiz mecânica de 02 e 16 | Arquitetura | CRITICAL | M | **P0** |
| TD-SYS-19 | `globals` incompletos — armadilha embutida na correção de TD-SYS-02 | Qualidade | MEDIUM | S | **P0** |
| TD-SYS-02 | Lint cobre ~2% do código | Qualidade | CRITICAL | M | **P0** |
| TD-QA-01 | Sem toolchain de teste comportamental (decisão: Vitest + happy-dom) | Testes | HIGH | S | **P0** |
| TD-SYS-03 ⊕ UX-D13 | Testes sem valor comportamental — regex sobre texto-fonte | Testes | CRITICAL | L | **P0** |
| TD-SYS-01 ⊕ UX-D04 | `typecheck` cego | Qualidade | CRITICAL | XL | **P0** |
| TD-SYS-09 | `window.storage` sem contrato — agora inclui a política de merge | Integração/Dados | HIGH | M | **P1** |
| TD-SYS-07 | Sem camada de domínio → contrato CLI impossível (Artigo I) | Arquitetura | HIGH | L | **P1** |
| TD-QA-02 | Sem baseline de caracterização — pré-requisito duro de TD-SYS-06 | Testes/Arquitetura | HIGH | M | **P1** |
| TD-DAT-03 | `partidas` é top-40 global — NC-002 AC-2 infactível como escrito | Dados/Produto | HIGH | M | **P1** |
| TD-SYS-06 ⊕ UX-D12 | Monolito de ~1.070 linhas em um componente | Arquitetura | HIGH | XL | **P1** |
| **TD-SYS-10** | Bloqueio de NC-001/002/003 registrado com motivo obsoleto | Governança | HIGH | S | **P1** |
| TD-SYS-08 ⬆ ⊕ UX-D03 | Tailwind congelado — utility nova falha em silêncio | Build/UI | CRITICAL | M | **P1** |
| UX-D02 ⬇ | Design system inexistente | UX/Design | ALTA | L | **P1** |
| UX-D23 🆕 | 100 `fontSize` em px, 0 `rem` | A11y | ALTA | M | **P1** |
| **UX-D16** | Telas de NC-001/002/003 inexistentes; sem primitivas compartilhadas | UX/Escopo | MÉDIA | L | **P1** |
| UX-D10 | Sem empty states | UX | ALTA | M | **P1** |
| TD-SYS-11 ⊕ UX-D21 | Sem `vite.config` / plugin React / aliases | Build/DX | MEDIUM | S | **P1** |
| UX-D05 | A11y praticamente nula | A11y | CRÍTICA | L | **P2** |
| UX-D06 | Cor como canal semântico único | A11y | ALTA | M | **P2** |
| TD-SYS-18 ⬆ ⊕ UX-D09 | Sem `ErrorBoundary`, sem logging, sem Sentry | Observabilidade | HIGH | M | **P2** |
| UX-D19 | Foco não gerenciado | A11y | MÉDIA | S | **P2** |
| UX-D14 | Contraste — `#6b7280` e `#ef4444` medidos em falha | A11y | MÉDIA | S | **P2** |
| UX-D24 | Sem exclusão de operador (metade a: UI, P2) | Privacidade/UX | ALTA | M | **P2** |
| TD-DAT-04 | Nome é chave primária — pseudonimização é migração (UX-D24b) | Dados/Privacidade | HIGH | M | **P2** |
| UX-D11 ⬇ | Responsividade por `zoom`, não por refluxo | UX | MÉDIA | L | **P2** |
| **TD-SYS-17** | `SUPABASE_SERVICE_ROLE_KEY` no `.env` de app client-side | Segurança | MEDIUM | S | **P2** |
| **TD-SYS-15** | Servidor local serve ES modules como `octet-stream` | Ferramental | MEDIUM | S | **P2** |
| **TD-SYS-14** ⊕ UX-D20 | Quatro cópias divergentes do artefato de deploy | Build/Deploy | MEDIUM | M | **P2** |
| **TD-SYS-20** | `StrictMode` + 20 efeitos com timers e `AudioContext` sem cleanup | Runtime | MEDIUM | M | **P2** |
| TD-SYS-13 | Balanceamento hardcoded | Configuração | MEDIUM | M | **P3** |
| TD-SYS-12 | Bundle único de 910 KB sem code splitting | Performance | MEDIUM | M | **P3** |
| TD-SYS-21 | Sem CI/CD; publicação por ZIP manual | DevOps | MEDIUM | M | **P3** |
| UX-D22 🆕 | `<style>` dentro do render, replicado em 6 telas | Build/UI | MÉDIA | S | **P3** |
| UX-D08 ⬇ | Sem loading state visível | UX | MÉDIA | S | **P3** |
| UX-D18 | Sem medição nem orçamento de performance percebida | Performance | MÉDIA | M | **P3** |
| UX-D15 ⬇ | Alvos de toque — passa 2.5.8 AA, falha 2.5.5 AAA | A11y | BAIXA | S | **P3** |
| UX-D17 ⬇ | `pause` e calendário sem rastreabilidade | Rastreabilidade | BAIXA | S | **P3** |
| UX-D25 🆕 | Atalhos de teclado implementados e não anunciados | A11y/UX | BAIXA | S | **P3** |
| TD-SYS-22 | `dist/default.php` da Hostinger no artefato de build | Deploy/Seg. | LOW | S | **P3** |
| TD-SYS-23 | TS 7 / Vite 8 / ESLint 10 adotados sem ADR | Manutenção | LOW | S | **P3** |

**Correção de higiene H4 aplicada:** o DRAFT v2.0 tinha 7 débitos sem linha explícita na ordem de execução (§3.4 do DRAFT), embora todos já tivessem prioridade nesta matriz. **Todos os 47 IDs têm agora linha própria na matriz acima** (marcados **em negrito** onde H4 os apontou como ausentes da sequência: TD-SYS-10, UX-D16, TD-DAT-03, TD-SYS-14, TD-SYS-15, TD-SYS-17, TD-SYS-20). Ver §Plano de Resolução para onde cada um entra na sequência executável.

### Distribuição consolidada (recontada de forma independente pela Re-Review da Fase 7)

| Severidade | Sistema | Frontend | Dados/Testes | **Total** |
|---|---|---|---|---|
| CRITICAL / Crítica | 6 | 2 | 2 | **10** |
| HIGH / Alta | 5 | 5 | 4 | **14** |
| MEDIUM / Média | 10 | 7 | 1 | **18** |
| LOW / Baixa | 2 | 3 | 0 | **5** |
| **Total** | **23** | **17** | **7** | **47** |

**Prioridade:** P0-SAFETY = 1 · P0-SAFETY-DATA = 3 · P0 = 8 · P1 = 12 · P2 = 12 · P3 = 11. Total 47.

**Trajetória auditável:** 36 (v1.0, entrada bruta 44) → 40 (recontagem da Fase 6: 13→17 exclusivos de frontend) → **47** (7 débitos da Fase 7). **É 47 que vai para a Fase 9**, verificado de forma independente pela Re-Review (47 IDs primários únicos contados diretamente na matriz).

### Mapa débito → artigo da Constitution

| Artigo | Princípio | Débitos que o violam |
|---|---|---|
| I — CLI First | NON-NEGOTIABLE | TD-SYS-07 (nenhuma função de domínio invocável) |
| II — Agent Authority | NON-NEGOTIABLE | *(nenhuma violação identificada)* |
| III — Story-Driven Development | MUST | TD-SYS-10 (bloqueio com motivo obsoleto); UX-D17 (código sem story) |
| IV — No Invention | MUST | UX-D17 (`pause` e calendário sem rastreabilidade documental) |
| V — Quality First | MUST | TD-SYS-01/02/03 (gates vacuosos) · **TD-DAT-01 + TD-DAT-02 — a violação mais material do Quality First em todo o assessment: o produto perde dado de usuário** |
| VI — Absolute Imports | SHOULD | TD-SYS-11 (sem aliases; força `../Arquivos_Diversos/...`) |

---

## Plano de Resolução

**Status:** ordem validada por três agentes (@architect Fase 4, @ux-design-expert Fase 6, @qa Fase 7 + Re-Review), com três emendas da Fase 7. **Congelada nesta Fase 8**, com correção H4 aplicada (nenhum item P1/P2 fica sem posição).

| # | Ação | Depende de | Débitos endereçados |
|---|---|---|---|
| **0a** | `git init` + `.gitignore` cobrindo `Arquivos_Diversos/`, `usina.zip`, `usina-legacy-backup/`, `dist/` — ~0,25 h | — | TD-SYS-04, TD-SYS-16 |
| **0b** | UX-D07 P0-SAFETY — media query + `matchMedia` no `Boom` (obrigatório, não cortável) + as 4 animações < 3 Hz por padrão — ~1,75 h | 0a | UX-D07 |
| **0c** | Guarda anti-destruição P0-SAFETY-DATA — preservar campos desconhecidos em `saveResult`, não gravar `operadores` após falha de leitura, `storeErr` global — ~1 h | 0a | TD-DAT-01, TD-DAT-02, TD-DAT-05 |
| 1 | Tokens de design (UX-D02) + `rem`/`em` (UX-D23) — entrega única | 0a | UX-D02, UX-D23 |
| 2 | Fronteira `src/` (TD-SYS-05) + `vite.config` / plugin React / aliases (TD-SYS-11) | 1 | TD-SYS-05, TD-SYS-11 |
| 3 | `globals` (TD-SYS-19) → lint (TD-SYS-02) → **runner de teste** (TD-QA-01) → testes comportamentais (TD-SYS-03) → typecheck (TD-SYS-01), **nesta ordem** | 2 | TD-SYS-19, TD-SYS-02, TD-QA-01, TD-SYS-03, TD-SYS-01 |
| 4 | `StorageAdapter` (TD-SYS-09, incluindo a política de merge de TD-DAT-01) + fixtures obrigatórias + camada de domínio (TD-SYS-07) | 3 | TD-SYS-09, TD-SYS-07 |
| 5 | NC-003 piloto + `MetricBadge` · exclusão de operador (UX-D24a) | 4 | UX-D24 (metade a) |
| 6 | A11y Parada 1 (UX-D05, UX-D19, UX-D06, UX-D14) — só após TD-SYS-08 (RX-6) | 1, 2 e **TD-SYS-08 resolvido** | UX-D05, UX-D19, UX-D06, UX-D14, TD-SYS-08 |
| 7 | `EmptyState` (UX-D10) + `ErrorBoundary` (TD-SYS-18) | 1 | UX-D10, TD-SYS-18 |
| 8 | Baseline de caracterização (TD-QA-02) → quebra do monolito (TD-SYS-06), **nesta ordem, TD-QA-02 é pré-requisito duro** | 1, 3, 4 | TD-QA-02, TD-SYS-06 |
| 9 | Pseudonimização (TD-DAT-04 / UX-D24b) · refluxo (UX-D11) · extrair folha de estilo (UX-D22) · demais P3 (TD-SYS-13, TD-SYS-12, TD-SYS-21, UX-D08, UX-D18, UX-D15, UX-D17, UX-D25, TD-SYS-22, TD-SYS-23) | 4, 8 | TD-DAT-04, UX-D11, UX-D22 + P3 restantes |

**Itens endereçados fora da sequência numerada, com mecanismo nomeado (fecha H4):**

| ID | Onde é endereçado | Mecanismo |
|---|---|---|
| **TD-SYS-10** | Item 0a em diante; fecho formal no handoff da story de fundação (§Ações Pendentes, item 10 do fluxo original) | Correção do bloqueio obsoleto de NC-001/002/003 é sinalização documental, não trabalho de código — atualizada assim que a story de fundação existir |
| **TD-DAT-03** | Decidido por **T5.1** antes da Fase 10, independente da sequência 0-9 | Teste que decide se o escopo de NC-002 migra de `matches` para `studyLog`; roda em paralelo à sequência, não depende de nenhum item dela |
| **UX-D16** | Item 4 (domínio) habilita; item 5 (NC-003 piloto) implementa a primeira tela; primitivas restantes (`ScreenLayout`, `LoadingState`, `ErrorState`) entram conforme cada tela nova as exigir | Não bloqueia o restante da sequência — apenas `EmptyState` e `MetricBadge` são pré-requisito duro (já cobertos nos itens 5 e 7) |
| **TD-SYS-14** | Item 9 (higiene de deploy), mas a verificação de publicação correta (RX-7) é obrigatória **já no fecho de 0b** (T0.5: hash do artefato servido == hash do build) | Duas camadas: correção estrutural tardia (consolidar 1 cópia canônica) + verificação pontual antecipada por segurança |
| **TD-SYS-15** | Item 9, mas se o servidor local for usado para verificar 0b/0c antes disso, a correção de MIME é pré-requisito pontual dessa verificação | Mesma lógica de TD-SYS-14: verificação pontual pode adiantar a correção estrutural |
| **TD-SYS-17** | Item 9 (P2, remoção das chaves não consumidas do `.env`) | Ação isolada de ~0,25 h, sem dependência técnica — pode ser adiantada a qualquer momento após 0a sem risco |
| **TD-SYS-20** | Item 8, no mesmo trabalho da quebra do monolito (a extração dos `useEffect` é o momento natural de corrigir cleanup) | Corrigir isoladamente antes da extração seria retrabalho — a correção correta nasce da própria decomposição |

### As três emendas da Fase 7 (herdadas sem alteração)

**Emenda 1 — Git antes de UX-D07.** O passo 1 da correção (media query nova) é aditivo e poderia preceder o Git. O passo 3 (reduzir frequência das 4 animações no modo padrão) altera comportamento visual do produto para todos os usuários e toca uma força do Gold Standard ("linguagem visual industrial") — não é aditivo, precisa de reversão. `git init` primeiro custa ~15 minutos.

**Emenda 2 — segunda classe fora da fila (P0-SAFETY-DATA).** O critério que qualifica UX-D07 — irreversibilidade × esforço S × dependência zero — qualifica TD-DAT-01/02 pelos mesmos três eixos. Assimetria adicional contra os dados: o dano físico é risco futuro e probabilístico; a perda de dados provavelmente já está ocorrendo, e TD-DAT-05 garante que ninguém saberia.

**Emenda 3 — UX-D24 dividida em duas.** Exclusão de operador (UI, 4h) antecipa para logo após o `StorageAdapter` (item 5) — barata, mitiga parcialmente RX-1. Pseudonimização fica tarde e é reclassificada como TD-DAT-04 — migração de chave primária, depende de TD-SYS-09.

### Timeline (ordens de grandeza, não compromisso)

- **Imediato (hoje, ~3h):** 0a + 0b + 0c — remove os dois riscos irreversíveis (dano físico, perda de dado).
- **Curto prazo (semanas 1-2):** itens 1-3 — fundação de qualidade e design system.
- **Médio prazo (semanas 3-6):** itens 4-7 — StorageAdapter, domínio, NC-003 piloto, a11y Parada 1.
- **Longo prazo (contínuo, incremental):** itens 8-9 — quebra do monolito (XL, pré-requisito de caracterização) e P3s.

---

## Riscos e Mitigações

| # | Risco | Prob. | Impacto | Débitos | Mitigação |
|---|---|---|---|---|---|
| R1 | Regressão silenciosa aprovada por gates verdes — provado por mutação | Alta → Confirmada | Crítico | TD-SYS-01/02/03 | Deleção dos testes de regex; 8 invariantes I1-I8 executáveis |
| R2 | Perda irrecuperável de trabalho da equipe — sem Git | Média | Crítico | TD-SYS-04 | 0a imediato |
| R3 | Ondas 1-3 bloqueadas por impossibilidade estrutural, com bloqueio apontando motivo errado | Alta | Alto | TD-SYS-06/07/10 | Atualizar bloqueio na Fase 10; sequência 3-4-8 |
| R4 | UI quebrada em silêncio por utility Tailwind ausente | Alta | Médio | TD-SYS-08, UX-D02 | Item 1 (tokens) antes de qualquer nova UI |
| R5 (reescrito) | Degradação silenciosa seguida de destruição de dados — não "falha total na inicialização" (erro factual corrigido da Fase 1) | Média-Alta | Crítico | TD-SYS-09, TD-SYS-18, TD-DAT-02, TD-DAT-05, TD-SYS-04 | 0c + `StorageAdapter` com estado de saúde explícito |
| R6 | Exposição de credencial com bypass de RLS se Supabase for integrado seguindo o `.env` existente | Baixa | Crítico | TD-SYS-17 | Remover as 3 chaves não consumidas do `.env` |
| R7 | Publicação da cópia errada do artefato — já ocorreu uma vez | Média | Médio | TD-SYS-14/15/21 | Verificação de publicação obrigatória (T0.5) |
| R8 | Dano físico a usuário infantil — animações 8,3-11,1 Hz sem escape | Média-Alta ⬆ | Crítico | UX-D07 | 0b imediato |
| R9 | Exclusão de usuário com deficiência em produto educacional | Alta | Alto | UX-D05, UX-D06, UX-D23 | Item 6 (a11y Parada 1) |
| R10 | Não adoção em sala de aula por inviabilidade em tablet/Chromebook | Média | Alto | UX-D11, UX-D15 | Item 9 (refluxo) |
| R11 | Perda irreversível de dado pedagógico de criança, por dois mecanismos independentes — provavelmente já ocorrendo | Média | Crítico | TD-DAT-01, TD-DAT-02, TD-DAT-05 | 0c imediato |

### Riscos cruzados (RX-1 a RX-8)

Riscos visíveis apenas na interseção de duas ou mais áreas — nenhum aparece a partir de uma única fase de análise.

| # | Risco | Áreas / Débitos | Mitigação |
|---|---|---|---|
| RX-1 🔴 | Destruição irreversível de dado de criança sem rollback — quatro débitos "médios" isolados compõem uma perda total e silenciosa | Dados + Governança + Observabilidade + Privacidade | Fura a fila junto com UX-D07 (item 0c). Guarda mínima ≈1h |
| RX-2 🔴 | A refatoração do monolito (TD-SYS-06) destrói dados e nenhum gate percebe | Arquitetura + Testes + Qualidade + Dados | Round-trip com fixture legada (T1.5) antes da primeira linha; TD-QA-02 pré-requisito duro |
| RX-3 🟠 | Épico planeja stories estruturalmente impossíveis (NC-002 AC-2, NC-003 AC-2) | Governança + Dados + Produto | Fase 8 sinaliza migração de escopo (T5.1); NC-003 ganha merge não-destrutivo como pré-requisito |
| RX-4 🟠 | Exclusão de a11y contamina a métrica pedagógica — erro de UI é gravado como erro de matemática | A11y + Dados + Produto | Itens 6 e 8 da a11y são pré-requisito de confiabilidade da métrica, não só de conformidade |
| RX-5 🟠 | Fadiga de quadros agrava o risco fotossensível em dispositivos de entrada | Performance + A11y + Segurança | Baixar frequência por padrão (0b, passo 3) remove dependência do desempenho |
| RX-6 🟡 | Correção de a11y quebra a UI em silêncio (Tailwind congelado + CSS invisível a lint) | A11y + Build + UI | Regra dura: a11y Parada 1 não começa antes de TD-SYS-08 resolvido |
| RX-7 🟡 | Publicação da cópia errada anula qualquer correção, inclusive UX-D07 | Deploy + Ferramental + Segurança | Verificação de publicação obrigatória no fecho do UX-D07 (T0.5) |
| RX-8 🔵/🔴 | Exfiltração via `SUPABASE_SERVICE_ROLE_KEY` — pressão crescente conforme NC-002 avança | Segurança + Dados + DevOps | Remover as 3 chaves não consumidas do `.env` (~0,25h) |

### Prova empírica de que o gate de teste não protege (TD-SYS-03)

O `@qa` testou a alegação da Fase 1 aplicando as 5 regex reais de `tests/pause-contract.test.mjs` contra dois mutantes sintéticos (cópia em scratchpad, nenhum arquivo do projeto alterado):

| Mutante | Comportamento real | Gate diz |
|---|---|---|
| A — pausa e retomar quebrados, strings preservadas em comentários mortos | Pausa 100% quebrada; retomar perde a partida | ✅ PASSA |
| B — implementação correta, apenas reformatada | Perfeito | ❌ FALHA |

**O gate aprova a destruição total do recurso e reprova a formatação correta dele.** Consequência normativa adotada: regex sobre código-fonte fica proibida como evidência de comportamento; os 2 testes de regex atuais são deletados ao entrar a invariante I6.

---

## Critérios de Sucesso

**Regra de severidade em vigor (revoga a regra original da v1.0):** *severidade é função do modo de falha e da reversibilidade; prevalece a fase que mediu o modo de falha — para cima ou para baixo.* A regra anterior ("prevalece a maior severidade entre agentes divergentes") era uma catraca de sentido único que teria proibido os 5 rebaixamentos documentados com evidência bruta da Fase 6 — ver correção H2.

**Definição de pronto de TD-SYS-03 — 8 invariantes executáveis (não percentual de cobertura):**

| # | Invariante | Fonte |
|---|---|---|
| I1 | `rankIdx` nunca decresce | Fase 1 §8.6 |
| I2 | Divisão gera fatores corretos e sem resto nas 5 fases | Fase 1 §8.6 |
| I3 | `mergeStudyLog` é aditivo e não destrói dias anteriores | Fase 1 §8.3 |
| I4 | Merge do registro preserva campos desconhecidos (fecha TD-DAT-01) | Fase 7 — T1.1 |
| I5 | Física: `heat`, `integrity`, `coolant` evoluem independentemente | Fase 1 §8.1 |
| I6 | Pausa não persiste resultado; retomar devolve estado intacto | Fase 1 §3.3 |
| I7 | Geração de operações respeita `DIFF[n].range`/`ops` nas 5 fases | Fase 1 §3.1 |
| I8 | Pontuação e `best[diff]` são monotônicos por fase | L389 |

**Toolchain adotado (fecha TD-QA-01):** Vitest + `happy-dom` para componente; `node --test` ou Vitest puro sem DOM para domínio. Trade-off aceito: acopla a estratégia de teste ao Vite — aceitável porque o custo de duas configs de build hoje é maior que o custo de uma migração hipotética futura.

**Suítes de fecho exigidas:**
- **T0** — UX-D07, verificação manual registrada (vídeo), contra o artefato publicado, não o dev server.
- **T1** — RX-1, primeiro teste automatizado real do projeto: preservação de campo desconhecido, não-sobrescrita após falha de leitura, round-trip com fixture legada, `window.storage` ausente não lança nem grava.
- **T3** — baseline de caracterização das 14 forças do Gold Standard, antes da primeira extração de TD-SYS-06.
- **T4** — a11y: `axe-core` nas 9 telas, 27/27 nomes acessíveis, contraste ≥4,5:1, resize a 200% sem truncamento.
- **T5.1** — decide viabilidade de NC-002: relatório longitudinal com 60 partidas de baixa pontuação vs. 40 de alta pontuação de outros operadores. Se vazio, escopo migra de `matches` para `studyLog`. **Roda antes da Fase 10.**
- **T6** — gates de regressão contínua: `eslint-plugin-react-hooks`, `jsx-a11y`, ratchet de `@ts-nocheck` (gate falha se o número de arquivos suprimidos aumentar).

**Regra de veto de UX + 4ª cláusula (adotada como critério de gate, não recomendação):** nenhuma story é aceita sem (a) nome acessível em todo interativo novo; (b) estado transmitido por pelo menos dois canais; (c) nenhuma animação acima de 3 Hz; (d) nenhuma story que toque persistência sem teste de round-trip com fixture legada (T1.5).

**Invariantes de UI que restringem qualquer remediação (não são débitos):**
1. Valores arbitrários do Tailwind não funcionam — `style` inline é solução deliberada; a remediação de UX-D02 é fazer o inline ler de tokens, não eliminá-lo.
2. `AudioContext` só sob gesto do usuário.
3. `localStorage`/`sessionStorage` proibidos — apenas `window.storage`.
4. Efeito 3 (teclado) sem array de dependências, de propósito.
5. `rankIdx` só sobe.
6. Interface em pt-BR.
7. **Nenhuma animação acima de 3 Hz no modo padrão** (promovida de remediação a invariante).
8. **Nenhuma escrita em `operadores` quando a leitura inicial falhou** (promovida de remediação a invariante).

---

## Ações de Execução Pendentes (fora do escopo de discovery)

Nenhuma delas é documentação. Nenhuma depende deste gate — as três primeiras já estavam autorizadas desde o veredito NEEDS WORK original e continuam não executadas na data deste documento.

| # | Ação | Executor | Autoridade | Status verificado (Re-Review, 2026-09-07) |
|---|---|---|---|---|
| **0a** | `git init` + `.gitignore` cobrindo `Arquivos_Diversos/`, `usina.zip`, `usina-legacy-backup/`, `dist/` — janela única antes do 1º commit (TD-SYS-04 + TD-SYS-16) | **@devops** | Git/repo é autoridade exclusiva de @devops | ❌ `.git/` ainda ausente. **Bloqueia 0b e 0c** |
| **0b** | UX-D07 — media query + `matchMedia` no `Boom` (não cortável) + `rumble`, `rumbleHard`, `glitch`, `grainShift` ≥ `.34s` por padrão + evidência T0.1-T0.5 com vídeo, contra o artefato publicado (~1,75 h) | **@dev** | Alteração de código | ❌ não executado |
| **0c** | Guarda anti-destruição — preservar campos desconhecidos em `saveResult`; não gravar `operadores` se `okStore === false`; `storeErr` global (~1 h) | **@dev** | Alteração de código | ❌ não executado |
| **T5.1** | Teste que decide o escopo de NC-002 (`matches` vs. `studyLog`) — antes da Fase 10 | **@dev** + **@qa** | Requer 0a e a toolchain de TD-QA-01 | pendente |
| **W1** | Emenda ao `brownfield-discovery.yaml`: ausência de SGBD redireciona a auditoria de dados, não a cancela — com revisor nomeado | **@pm** / **@aiox-master** | Framework | pendente (Fase 10) |

**Nota de escopo, herdada da Re-Review da Fase 7 e reafirmada aqui:** este assessment aprova o **artefato de discovery** — completude, correção factual e rastreabilidade da análise. **Não aprova o estado do produto**, que continua com os dois defeitos de dados críticos vivos no código e sem controle de versão. Três horas de trabalho (0a + 0b + 0c) removem os dois riscos irreversíveis (dano físico a uma criança, destruição do histórico de uma turma) e não dependem de nenhuma story, épico ou gate futuro.

---

## Ressalvas de Higiene Absorvidas (H1-H4)

Registro de fecho — nenhuma destas alterou severidade, prioridade ou ordem; todas corrigem números ou afirmações que a Fase 9 poderia recitar incorretamente para a diretoria.

- **H1** — corrigida: a afirmação "nenhuma linha da seção Sistema foi alterada" (falsa) foi substituída por "nenhum débito foi refutado ou removido; 7 receberam anotação de v2.0" (ver §Inventário, Sistema).
- **H2** — corrigida: fixado em "5 rebaixamentos de severidade + 1 correção factual sem mudança de severidade" (ver §Inventário, Frontend/UX).
- **H3** — corrigida: 160,75 h é o número único e correto a partir deste documento; 160,5 h (soma pré-emenda) está obsoleto e não deve ser citado adiante (ver §Nota sobre esforço).
- **H4** — corrigida: os 7 débitos sem linha própria na ordem de execução (TD-DAT-03, TD-SYS-10, UX-D16, TD-SYS-14/15/17/20) agora têm posição explícita na Matriz de Priorização Final e mecanismo nomeado no Plano de Resolução.

---

*— Aria, arquitetando o futuro*
*Fase 8 do Brownfield Discovery · 47 débitos consolidados (10 CRITICAL · 14 HIGH · 18 MEDIUM · 5 LOW) · 11 riscos + 8 riscos cruzados · ordem 0a→9 congelada, sem gaps · 4 ressalvas de higiene (H1-H4) absorvidas*
*Insumos: `technical-debt-DRAFT.md` v2.0 (@architect) · `ux-specialist-review.md` (@ux-design-expert, Fase 6) · `qa-review.md` incluindo Re-Review (@qa, Fase 7) · errata E1 confirmada em `frontend-spec.md`*
*Gate de origem: APPROVED COM RESSALVAS · 3 ações de execução (não documentação) seguem pendentes fora deste discovery*
