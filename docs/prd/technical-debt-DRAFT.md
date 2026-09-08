# Technical Debt Assessment - DRAFT
## Para Revisão dos Especialistas

**Documento:** `docs/prd/technical-debt-DRAFT.md`
**Fase:** Brownfield Discovery — Fase 4 (`consolidate_findings_draft`) · **ciclo de rework pós-Fase 7**
**Autor:** @architect (Aria)
**Versão:** **v2.0** · **Data:** 2026-09-07
**Status:** ⚠️ DRAFT REVISADO — incorpora Fase 6 (@ux-design-expert) e Fase 7 (@qa · NEEDS WORK). Aguarda re-verificação do gate contra o checklist C1-C10 (§5).

---

## Changelog

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| **v1.0** | 2026-09-07 | @architect (Aria) | Consolidação inicial das Fases 1 e 3. **36 débitos.** Fase 2 pulada (sem banco). 10 riscos (R1-R10). 8 perguntas para `@ux-design-expert` + 8 para `@qa`. |
| **v2.0** | 2026-09-07 | @architect (Aria) | **Rework pós-NEEDS WORK da Fase 7.** Nada da v1.0 foi removido. Acréscimos: (a) nova §1.5 com **7 débitos de dados/integridade e testabilidade** (TD-DAT-01..05, TD-QA-01..02) originados dos gaps G1-G7 do `@qa`, **todos reverificados por mim no código-fonte**; (b) §2 substituída pela tabela **recontada de 17 linhas** da Fase 6, com horas e severidades revisadas por Uma; (c) **UX-D07 emendado** — escopo estendido a `rumble` (8,3 Hz) e `grainShift` (3,57 Hz), passo 2 (`matchMedia` no `Boom`) marcado como **obrigatório**, 1,5 h → **1,75 h**; (d) **R5 reescrito** (modo de falha real é degradação silenciosa com destruição de dados, não falha total na inicialização); (e) novo registro **RX-1..RX-8** de riscos cruzados; (f) **duas classes P0 fora da fila** (`P0-SAFETY` e `P0-SAFETY-DATA`); (g) ordem validada 0a→0b→0c→1..9 congelada; (h) mapa **débito → artigo da Constitution**; (i) **contagem corrigida de 36 → 47**; (j) nova §5 com o **checklist de aceite C1-C10**. |

> **Natureza desta revisão:** é um **merge**, não uma reescrita. Todo texto, decisão e numeração da v1.0 permanece. Onde a Fase 6 ou a Fase 7 corrigiram um fato meu, o texto original está preservado com a correção marcada — **a correção documentada tem mais valor probatório que um documento silenciosamente consertado** (princípio adotado do `@qa`, §Errata da Fase 3).

---

## 0. Escopo, insumos e o que este documento é

### 0.1 Insumos consolidados

| Fase | Documento | Agente | Débitos |
|---|---|---|---|
| 1 — Arquitetura de sistema | `docs/architecture/system-architecture.md` | @architect (Aria) | 23 (4 CRITICAL · 6 HIGH · 11 MEDIUM · 2 LOW) |
| 2 — Schema / Banco de dados | — | — | **PULADA** (ver 0.2 e **0.5**) |
| 3 — Frontend spec | `docs/frontend/frontend-spec.md` | @ux-design-expert (Uma) | 21 (5 Crítica · 8 Alta · 6 Média · 2 Baixa) |
| **6 — Revisão de UX** | `docs/reviews/ux-specialist-review.md` | @ux-design-expert (Uma) | **17 validados** (4 novos · 6 severidades ajustadas · 3 autocorreções) · 160,5 h |
| **7 — QA Gate** | `docs/reviews/qa-review.md` | @qa (Quinn) | **7 novos** (G1-G7) · gate **NEEDS WORK** |

**Entrada bruta da v1.0: 44 registros. Saída consolidada da v1.0: 36 débitos únicos** — 8 pares eram o mesmo débito observado de dois ângulos (ver §2.5).

**Saída consolidada da v2.0: 47 débitos únicos** — 23 de sistema + 17 de frontend (recontagem da Fase 6) + 7 de dados/testabilidade (Fase 7). Ver §3.1.

### 0.2 Fase 2 (Database) — pulada por ausência de banco de dados

*(texto da v1.0, preservado integralmente — ver a correção de premissa em §0.5)*

A Fase 2 do workflow (`@data-engineer` → `SCHEMA.md` + `DB-AUDIT.md`) **não foi executada e não deve ser cobrada neste ciclo**. Evidência:

- Não existe diretório `supabase/`, nenhuma migration, nenhum arquivo `.sql`.
- Não existe cliente de banco no `package.json` (as 4 deps de runtime são `react`, `react-dom`, `recharts`, `lucide-react`).
- As chaves `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` são **placeholders vazios do instalador AIOX**, sem uma única linha de código que as consuma (zero ocorrências de `process.env` / `import.meta.env` no app).
- A aplicação faz **zero chamadas de rede**. A "camada de dados" é `window.storage` com dois blobs JSON (`operadores`, `partidas`), documentada em `docs/estrutura-acompanhamento.md`.

**Consequência para este draft:** não há seção de débitos de database e não há perguntas para `@data-engineer` em §4. Os débitos de dados que existem (contrato de `window.storage`, migração retrocompatível de `studyLog`) estão classificados como **Integração/Dados** dentro dos débitos de sistema (TD-SYS-09) e serão revisados por `@qa` na Fase 7, não por um especialista de banco.

> ⚠️ Nota de risco residual: a ausência de banco **não** neutraliza TD-SYS-17 (`SUPABASE_SERVICE_ROLE_KEY` no `.env` de um projeto Vite). O débito é justamente o trilho posto para um erro futuro, não um vazamento presente.

### 0.5 🆕 Correção de premissa da v1.0 — o erro que causou o NEEDS WORK

A decisão de pular a Fase 2/5 estava **correta quanto ao fato** ("não há SGBD") e **incorreta quanto à consequência** que eu derivei dela.

> **Erro da v1.0, na minha assinatura:** eu li *"não há banco de dados"* como *"não há camada de dados a auditar"*, e deleguei os quatro aspectos de dados a um único débito (TD-SYS-09) + duas perguntas ao `@qa`. Um débito e duas perguntas não são uma auditoria.
>
> **O que existia e ficou sem auditor:** dois blobs JSON com **nome de criança como chave primária**, histórico pedagógico longitudinal, uma migração retrocompatível (`mergeStudyLog`) e uma **política de merge de registro com defeito**. Nenhuma das três fases (1, 3, 6) tinha mandato para olhar isso.
>
> **Resultado:** os quatro defeitos mais consequentes do projeto (G1-G4, agora TD-DAT-01..04) estavam invisíveis para as Fases 1, 3, 4 e 6, e dois deles **contradizem critérios de aceitação já escritos** em NC-002 e NC-003.

**`[AUTO-DECISION]` Achado de processo, elevado para além deste projeto:** *a ausência de um SGBD deve **redirecionar** a auditoria de dados, nunca **cancelá-la**.* Quando a Fase 2 for pulada, o workflow deve exigir um substituto explícito — auditoria do contrato de persistência efetivo, seja ele `window.storage`, `localStorage`, arquivo, ou API de host — atribuída nominalmente a um agente. Recomendo registrar isso como emenda ao `brownfield-discovery.yaml` na Fase 10. Razão: sem a emenda, o próximo projeto sem SGBD reproduz o mesmo gap, e desta vez pode não haver um QA que reabra o código.

### 0.3 O que este documento NÃO decide

Fora de escopo desta fase, por definição do workflow: priorização final vinculante, desenho da arquitetura-alvo, assinaturas dos contratos CLI, estimativas comprometidas em horas, criação de stories e qualquer alteração de código. A matriz de §3 é **preliminar** e existe para ser contestada pelos especialistas.

**Emenda v2.0:** as contestações das Fases 6 e 7 **já ocorreram** e estão incorporadas. A ordem de §3.4 deixa de ser preliminar e passa a ser **a ordem validada por três agentes**, sujeita apenas ao congelamento formal da Fase 8. As horas que agora aparecem são **de Uma e de Quinn**, herdadas com atribuição — não são estimativa minha nem compromisso (a decisão `[AUTO-DECISION]` de §5 da v1.0 sobre ordens de grandeza permanece válida para os meus próprios números: eu continuo em S/M/L/XL).

### 0.4 A tese em uma frase

*(v1.0)* O produto está funcionalmente maduro; a **rede de segurança que autorizaria alterá-lo é uma ilusão de conformidade**. Os quatro quality gates executam, passam, e três deles não verificam nada. Todo o resto do assessment deriva disso.

**Emenda v2.0 — a tese tem uma segunda metade, e ela é pior:** não só a rede de segurança é ilusória — **a camada que ela deveria proteger já está perdendo dados hoje**, em silêncio, sem log, sem rollback e sem backup. O produto **apaga dado de criança por acidente e não consegue apagá-lo de propósito**. A ilusão de conformidade não era só sobre o futuro; era sobre o presente.

---

## 1. Débitos de Sistema

Fonte: `docs/architecture/system-architecture.md` §6. Severidade original preservada; elevações por corroboração cruzada estão marcadas com ⬆ e justificadas em §2.5.

**Status v2.0: nenhuma linha desta seção foi alterada.** O `@qa` verificou uma amostra de 15 débitos diretamente no código e **nenhum foi refutado**.

| ID | Débito | Severidade | Área |
|---|---|---|---|
| **TD-SYS-01** ⊕ UX-D04 | Gate de `typecheck` inoperante: `@ts-nocheck` na linha 1 do único arquivo de aplicação, reforçado por `strict:false` e `checkJs:false`. `tsc --noEmit` é matematicamente incapaz de reportar erro — verificação efetiva ≈ 0%. | CRITICAL | Qualidade / Build |
| **TD-SYS-02** | Gate de `lint` cobre ~2% do código: `files: ['src/**/*.jsx','tests/**/*.mjs']` exclui o `.tsx` de 1.342 linhas. Duas regras ativas, zero plugins React/hooks/a11y/security. | CRITICAL | Qualidade |
| **TD-SYS-03** ⊕ UX-D13 | Gate de `test` sem valor comportamental: 2 testes fazem `assert.match` de regex sobre o **texto-fonte**. Zero cobertura de física, geração de operações, pontuação, progressão, persistência ou migração. Sem testing-library, sem teste de componente, sem regressão visual. Frágil a formatação e cego a regressão real. **Provado por mutação na Fase 7** — ver §3.3.1. | CRITICAL | Testes |
| **TD-SYS-04** | Ausência de controle de versão: nenhum `.git/`. Sem histórico, sem rollback, sem branches, sem rastreabilidade story→commit. Impede toda autoridade de `@devops`. **Reconfirmado em 2026-09-07: `.git/` continua ausente.** | CRITICAL | Governança |
| **TD-SYS-05** ⊕ UX-D01 | ⬆ Inversão de fronteira de código: a aplicação inteira vive em `Arquivos_Diversos/` (diretório de arquivo morto), importada por `src/main.jsx` via `../`, e codificada no `tsconfig.include`. Causa raiz mecânica de TD-SYS-02 e TD-SYS-16; impede File List válida em qualquer story. **Elevação sustentada por Uma (§1.2): o produto é inauditável, não só inlintável.** | CRITICAL ⬆ | Arquitetura |
| **TD-SYS-06** ⊕ UX-D12 | Monolito de componente: `App()` com ~1.070 linhas, 42 `useState`, 20 `useEffect`, 4 `useRef` + 12 componentes no mesmo arquivo. Física, jogo, áudio, persistência, ranking e analytics indivisíveis. Três stories concorrentes tocariam o mesmo arquivo — paralelismo bloqueado. | HIGH | Arquitetura |
| **TD-SYS-07** | Ausência de camada de domínio → **contratos CLI impossíveis**. Nenhuma função de regra de negócio isolável. Viola Artigo I (CLI First). **Bloqueia diretamente NC-001 AC-5, NC-002 AC-1 e NC-003 AC-1.** | HIGH | Arquitetura / Constitution |
| **TD-SYS-08** ⊕ UX-D03 | ⬆ Tailwind v4.3.3 congelado como CSS pré-compilado (`public/legacy-assets/index-Bh3JlXdk.css`, 17,9 KB), sem Tailwind, PostCSS ou config no toolchain. Qualquer utility nova **não gera estilo e falha silenciosamente** — sem erro de build, lint ou teste. Verificado: `backdrop-blur` ausente do CSS. **CRITICAL pelo modo de falha (silencioso), não pela extensão** — reformulação de Uma (§1.2), endossada pelo `@qa`. | CRITICAL ⬆ | Build / UI |
| **TD-SYS-09** | `window.storage` sem contrato: API global não-padrão, não-tipada, sem interface, sem fallback e sem mock. Único ponto de I/O; indisponibilidade = falha total na inicialização. Bloqueia testes de persistência e o AC de retrocompatibilidade de NC-003. **Escopo ampliado na v2.0:** o adapter deve **possuir a política de merge do registro** (TD-DAT-01), não apenas `get`/`set` — senão o defeito sobrevive à extração e reaparece em cada call site. **Correção factual:** "indisponibilidade = falha total na inicialização" está **errado** — há `try/catch`; ver R5 reescrito e TD-DAT-02. | HIGH | Integração / Dados |
| **TD-SYS-10** | Artefatos dessincronizados da realidade: NC-001/002/003 e `handoff.yaml` mantêm o bloqueio *"aguardando projeto executável"*, **obsoleto desde 2026-09-07**. O bloqueio real (ausência de domínio isolável e de contrato CLI) não está registrado em lugar nenhum. **v2.0: o bloqueio real ficou ainda maior** — NC-002 depende de uma estrutura de dados que não existe (TD-DAT-03) e NC-003 AC-2 está violado pelo código atual (TD-DAT-01). | HIGH | Governança / Rastreabilidade |
| **TD-SYS-11** ⊕ UX-D21 | Ausência de `vite.config.*` e de `@vitejs/plugin-react`: sem Fast Refresh (recarga total perde o estado da partida a cada edição), sem controle de `base`, sem chunking, sem aliases de import. Artigo VI (Absolute Imports) inaplicável; força `../Arquivos_Diversos/...`. | MEDIUM | Build / DX |
| **TD-SYS-12** | Bundle único de 910.440 bytes sem code splitting. `recharts` e `lucide-react` entram integralmente no caminho crítico, embora os gráficos só apareçam nas telas de análise/ranking. | MEDIUM | Performance |
| **TD-SYS-13** | Balanceamento hardcoded: `DIFF` (5 fases × 12 parâmetros), `VENT_CD`, `BORON_CD`, `FREEZE_MS`, `TITLES`, `CHART_COLORS` literais no código. Viola "Config > Hardcoding"; impede simular balanceamento sem recompilar. | MEDIUM | Configuração |
| **TD-SYS-14** ⊕ UX-D20 | Quatro cópias divergentes do artefato de deploy: `dist/`, `Arquivos_Diversos/usina/`, `usina.zip`, `usina-legacy-backup/` (+ `public/legacy-assets/`). Sem fonte única de verdade; `plano-correcao-pausa.md` já registra tempo perdido servindo a cópia errada. | MEDIUM | Build / Deploy |
| **TD-SYS-15** | `.local-dist-server.cjs` serve JS/CSS como `application/octet-stream` (mapa de MIME cobre só `.html` e `.md`). Módulos ES são recusados por checagem estrita de MIME → **tela branca sem erro de rede**. | MEDIUM | Ferramental |
| **TD-SYS-16** | `.gitignore` não cobre `Arquivos_Diversos/`: ao inicializar o Git, o bundle de 910 KB, o `usina.zip` de 263 KB e os backups legados entram no histórico **permanentemente**. | MEDIUM | Governança |
| **TD-SYS-17** | `SUPABASE_SERVICE_ROLE_KEY` presente no `.env` de um projeto Vite puramente client-side, sem integração alguma. Chave que ignora RLS; um futuro prefixo `VITE_` a embute no bundle público. Trilho de exfiltração já posto. **v2.0: a pressão sobre esse trilho aumentou** — ver RX-8. | MEDIUM | Segurança |
| **TD-SYS-18** ⊕ UX-D09 | ⬆ Zero observabilidade e zero recuperação de erro: sem `ErrorBoundary`, sem logging estruturado, sem Sentry (apesar do `SENTRY_DSN` declarado). Exceção em qualquer dos 20 efeitos → tela branca silenciosa, sem recuperação e sem sinal. **Face de runtime documentada em TD-DAT-05.** | HIGH ⬆ | Observabilidade / UX |
| **TD-SYS-19** | `eslint.config.js` declara apenas `document` e `URL` em `globals`. `window`, `AudioContext`, `Math`, `Date`, `console`, `setTimeout` ausentes — estender o lint ao `.tsx` sem corrigir isto gera avalanche de `no-undef` falsos. **Armadilha embutida na correção de TD-SYS-02.** Confirmado pelo `@qa` no `eslint.config.js`. | MEDIUM | Qualidade |
| **TD-SYS-20** | `React.StrictMode` ativo com 20 efeitos contendo timers e um `AudioContext` sem limpeza no unmount. Risco de timers e nós de áudio duplicados no double-invoke de desenvolvimento. | MEDIUM | Runtime |
| **TD-SYS-21** | Ausência de CI/CD e de deploy automatizado. Publicação é ZIP manual para hospedagem compartilhada; nenhum gate roda automaticamente antes de publicar. | MEDIUM | DevOps |
| **TD-SYS-22** | `dist/default.php` (página padrão da Hostinger) versionado dentro do artefato de build, revelando o provedor de hospedagem e ampliando o pacote publicado. | LOW | Deploy / Segurança |
| **TD-SYS-23** | Majors recentes adotados sem avaliação: TypeScript 7, Vite 8 e ESLint 10 sem nota de migração, ADR ou validação de compatibilidade em qualquer documento. | LOW | Manutenção |

**Subtotal de sistema (após dedupe e elevação): 6 CRITICAL · 5 HIGH · 10 MEDIUM · 2 LOW = 23.**

---

## 1.5 🆕 Débitos de Dados, Integridade e Testabilidade (Fase 7)

**Origem:** gaps G1-G7 de `docs/reviews/qa-review.md`. **Causa da omissão nas Fases 1/3/4/6:** §0.5.

**Nota de verificação do arquiteto:** eu **não incorporei estes débitos por citação**. Reabri `Arquivos_Diversos/nuclear-challenge-app.tsx` e confirmei cada evidência de linha antes de promovê-los a débito de primeira classe. Os quatro defeitos de dados **existem e estão exatamente onde o `@qa` os localizou**. Registro isso porque a v1.0 falhou justamente por aceitar uma inferência (§0.5) sem ir ao código.

### TD-DAT-01 (G1) — `saveResult` reconstrói o registro por whitelist e destrói campo desconhecido

**Severidade: CRITICAL · Esforço: S (guarda) / M (definitivo) · Prioridade: P0-SAFETY-DATA · Área: Dados / Integridade**

**Evidência verificada — `nuclear-challenge-app.tsx` L384-401:**

```js
const p = players[player] || { best: {}, games: 0, ops: 0, hits: 0, streak: 0, rank: 0, wins: 0 };
const up = {                          // <- objeto literal, NÃO `{ ...p, ... }`
  best: {...}, games, ops, hits, streak, rank, wins,
  stats: mergeStats(p.stats, sess.current),
  studyLog: mergeStudyLog(p.studyLog, sess.current.daily)
};
await persist({ ...players, [player]: up });
```

**Mecanismo:** `up` é um objeto literal novo. Qualquer campo do registro persistido fora dessas 9 chaves é **silenciosamente destruído no primeiro save**.

**Por que a Fase 1 não viu:** eu elogiei `mergeStudyLog` como retrocompatibilidade correta (§8.3 da Fase 1) — **e ela é**. Mas a retrocompatibilidade é **campo a campo, não do registro**. Olhei a função e não o call site. O registro inteiro é reescrito por whitelist um nível acima da função que eu auditei.

**Consequência sobre stories já escritas — este é o ponto que muda o épico:**
- **NC-003 AC-2** (*"Dados legados recebem fallback explícito e não são apagados"*) — **violado pelo código atual**, não por uma implementação futura ruim.
- **NC-002 AC-4** (*"Dados legados são lidos sem perda"*) — idem.

**Remediação:** guarda imediata (0c) = trocar o literal por `{ ...p, ...campos }`. Definitiva = a política de merge passa a **pertencer ao `StorageAdapter`** (TD-SYS-09 ampliado), coberta pela invariante I4 e pelo teste T1.1.

### TD-DAT-02 (G2) — Falha de leitura silenciosa leva à sobrescrita destrutiva do blob inteiro

**Severidade: CRITICAL · Esforço: S (guarda) / M (definitivo) · Prioridade: P0-SAFETY-DATA · Área: Dados / Integridade**

**Evidência verificada — L345-358, L362-369:**

```js
const loadAll = useCallback(async () => {
  let okStore = true;
  try { const r = await window.storage.get('operadores', true); if (r && r.value) setPlayers(JSON.parse(r.value)); }
  catch (e) { okStore = false; }        // capturado
  ...
  return okStore;                        // retornado
}, []);
useEffect(() => { loadAll(); }, [loadAll]);                        // E DESCARTADO
useEffect(() => { if (mode === 'login') loadAll(); }, [mode, ...]); // E DESCARTADO DE NOVO
```

`storeErr` é setado **apenas em falha de escrita** (L366, L375), nunca em falha de leitura. **Verificação adicional minha:** o retorno é descartado em **dois** call sites, não um — e o segundo re-executa a cada retorno ao login, reproduzindo a condição de falha em silêncio a cada ciclo.

**Cadeia de falha verificada:** leitura falha ou JSON corrompido → exceção capturada → `players` permanece `{}` → login exibe **"Nenhum operador cadastrado"** (L709), **indistinguível de um dispositivo novo** → a criança recadastra o nome → `persist({ ...players, [n]: {...} })` grava **`{ n: ... }` por cima do blob `operadores` inteiro** → **o histórico de toda a turma é destruído: sem aviso, sem log, sem rollback (não há Git) e sem backup.**

**Correção factual à minha própria Fase 1:** eu escrevi (§5.1) que *"se `window.storage` for `undefined`, a leitura inicial lança"* e descrevi R5 como *"falha total na inicialização"*. **Isso é factualmente incorreto** — há `try/catch`. Eu descrevi o risco no seu modo de falha **mais benigno**: uma tela morta é visível, diagnosticável e não perde dado. O modo real é **degradação silenciosa seguida de destruição de dados** — invisível, não diagnosticável, com perda. R5 está reescrito em §3.3.

**Remediação:** guarda imediata (0c) = **nunca gravar `operadores` quando `okStore === false`**. Definitiva = `StorageAdapter` com estado de saúde explícito + testes T1.2/T1.3/T1.6.

### TD-DAT-03 (G3) — `partidas` é um top-40 global por pontuação, não um histórico

**Severidade: HIGH · Esforço: M · Prioridade: P1 · Área: Dados / Produto**

**Evidência verificada — L401:** `persistMatches([...matches, rec].sort((a, b) => b.pts - a.pts).slice(0, 40));`

`partidas` é uma **tabela de recordes**: ordenada por pontos, truncada em 40, **compartilhada por todos os operadores do dispositivo**.

**Três razões pelas quais NC-002 é infactível como escrita:**
1. **Não é longitudinal** — ordenada por `pts`, não por `ts`. "Evolução ao longo do tempo" não existe nessa estrutura.
2. **É enviesada por sobrevivência** — sobrevivem só as 40 melhores partidas do dispositivo. **A criança que mais precisa de acompanhamento é exatamente a que tem zero registros retidos**, porque as partidas dela são as de menor pontuação. O relatório ao responsável falharia precisamente no aluno para quem ele existe.
3. **É multi-operador** — 40 slots divididos por toda a turma.

**O dado longitudinal correto existe:** é o `studyLog` por dia, com `mergeStudyLog` — e o **heatmap de calendário da L986**, que Uma identificou (§2.6 da Fase 6) como visualização de "tempo de prática" já construída. **O escopo da NC-002 aponta para a estrutura errada.**

**Gap de método que isto expõe:** nenhuma fase confrontou os **ACs das stories contra o formato real dos dados persistidos**. Isso é uma lacuna do meu §4 da v1.0 — eu perguntei sobre testabilidade da persistência, não sobre a viabilidade dos ACs sobre ela.

**Remediação:** o teste **T5.1** decide (relatório longitudinal com 60 partidas de baixa pontuação de um operador, num dispositivo com 40 de alta pontuação de outros). Se o relatório ficar vazio, o escopo da NC-002 migra de `matches` para `studyLog`. **T5.1 roda antes da Fase 10.**

### TD-DAT-04 (G4) — Nome da criança é chave primária: pseudonimizar é migração de chave

**Severidade: HIGH · Esforço: M · Prioridade: P2 · Área: Dados / Privacidade**

**Evidência verificada — L378-380:** `const n = nameInput.trim().slice(0, 14); if (!players[n]) await persist({ ...players, [n]: {...} })`. O operador é indexado **pelo nome** em `players`; e `rec.n = player` em `partidas`.

**Divergência registrada com a Fase 6:** Uma classificou UX-D24 como P2-UX, 8 h, *"de UI, não de banco"*. A metade da **exclusão de operador (4 h) é de fato UI** — concordo com ela. A metade da **pseudonimização não é**: exige introduzir um `id` estável, migrar `operadores` **e** `partidas`, e manter retrocompatibilidade com registros indexados por nome. **Depende de TD-SYS-09 e usa exatamente o mesmo mecanismo de retrocompatibilidade de NC-003 / TD-DAT-01.** A estimativa de 4 h para essa metade está subdimensionada e o item está no lugar errado da fila.

**Nota de dedupe (regra de §2.5 aplicada):** TD-DAT-04 e UX-D24 **não foram fundidos** e **não são trabalho duplicado**. Evidência física distinta (UX-D24 = ausência de fluxo de remoção + nomes no ranking; TD-DAT-04 = L378-380, indexação por nome) e remediação distinta (UI vs. migração de chave). Contam separadamente, mas a Fase 10 deve emitir **duas sub-stories da mesma família**: `UX-D24a` (exclusão, P2, após o adapter) e `UX-D24b ≡ TD-DAT-04` (pseudonimização, tarde, após TD-SYS-09 e TD-SYS-06).

**Observação que fecha o caso da privacidade:** com TD-DAT-01 e TD-DAT-02 no lugar, o produto **apaga dado de criança por acidente e não consegue apagá-lo de propósito**. É a pior combinação possível dos dois lados da LGPD (art. 14, menores; art. 18 V, eliminação).

### TD-DAT-05 (G7) — `storeErr` só é renderizado na tela de login

**Severidade: MEDIUM · Esforço: S · Prioridade: P0-SAFETY-DATA (parte da guarda 0c) · Área: Observabilidade / Dados**

**Evidência verificada:** `storeErr` aparece em **exatamente três lugares** — L283 (state), L366/L375 (set) e **L725 (render), e só**. L725 está dentro do bloco `if (mode === 'login')`.

**Consequência:** uma falha de escrita em `saveResult` (fim de partida) seta a flag e **não exibe absolutamente nada**. A criança vê o resumo normal e acredita que o progresso foi salvo. O aviso só aparece na próxima ida ao login — quando já é tarde e o contexto se perdeu. **É a face de runtime de TD-SYS-18 e o que torna TD-DAT-02 silencioso.**

**Remediação:** banner de erro **global e persistente**, não restrito ao login. Incluído na guarda 0c porque é o que converte uma perda invisível em uma perda diagnosticável — e sem custo de arquitetura.

### TD-QA-01 (G5) — TD-SYS-03 não tem caminho de execução: falta toolchain de teste comportamental

**Severidade: HIGH · Esforço: S (decisão + setup) · Prioridade: P0 · Área: Testes / Ferramental**

**Evidência:** `package.json` tem exatamente `"test": "node --test tests/*.test.mjs"`. **Não há** `vitest`, `jest`, `jsdom`, `happy-dom`, `@testing-library/*`, nem ferramenta de cobertura.

**Por que é débito próprio e não parte de TD-SYS-03:** o débito não é *"escrever testes"*, é ***"não existe com o que escrevê-los"***. Enquanto o domínio não for extraído (TD-SYS-07), `node --test` cobre funções puras e nada mais; para qualquer teste de componente falta a **decisão de runner** — e ela não havia sido tomada por ninguém. A story de fundação começaria por uma decisão não tomada.

**Decisão adotada (`[AUTO-DECISION]` do `@qa`, que eu endosso como decisão de arquitetura):** **Vitest + `happy-dom`**. Razão: único runner que reusa a resolução de módulos do Vite 8 sem uma segunda configuração de build — num projeto que **nem tem a primeira** (TD-SYS-11) —, roda `.tsx` nativamente, traz cobertura embutida e permite manter `node --test` durante a transição. **Alternativa rejeitada:** Jest, que exigiria transform próprio e duplicaria a config. **Camada de domínio:** `node --test` ou Vitest puro, **sem DOM** — teste de regra de negócio não monta árvore React.

**Trade-off registrado:** Vitest acopla a estratégia de teste ao Vite. Se o build migrar do Vite no futuro, a suíte migra junto. Aceito, porque o custo de duas configs de build **hoje** é maior que o custo de uma migração hipotética, e porque TD-SYS-11 já exige que o Vite seja configurado corretamente de qualquer forma.

### TD-QA-02 (G6) — Não existe baseline de caracterização para o Gold Standard

**Severidade: HIGH · Esforço: M · Prioridade: P1 (pré-requisito duro de TD-SYS-06) · Área: Testes / Arquitetura**

**Evidência:** a Fase 1 §8 lista 10 forças "inegociáveis" e a Fase 6 §4.3 acrescenta 4. **Nenhuma delas está pinada por um teste.** "Não regredir" é hoje uma **afirmação de documento, não uma asserção executável**.

**Por que é item próprio e não consequência de TD-SYS-03** (aceito a distinção do `@qa` e ela é boa): as duas têm **definições de pronto diferentes**. TD-SYS-03 pergunta *"os testes têm valor?"*; TD-QA-02 pergunta *"o que exatamente eu não posso quebrar amanhã?"*. Um pode estar pronto com o outro em aberto.

**Consequência de sequenciamento:** TD-SYS-06 (quebra do monolito, XL) é **a maior operação de risco do plano inteiro** e estava agendada **sem rede de caracterização**. Isso é corrigido na §3.4: TD-QA-02 é pré-requisito explícito de TD-SYS-06.

**Remediação:** T3 — congelar snapshots das 14 forças. Mínimo: as 9 telas de `mode` renderizam sem lançar; `AudioContext` só sob gesto; zero `localStorage`/`sessionStorage`; zero chamadas de rede; `lang="pt-BR"` preservado.

**Subtotal de dados/testabilidade: 2 CRITICAL · 4 HIGH · 1 MEDIUM · 0 LOW = 7.**

> **Não são débitos** (registro para não inflar a contagem): **G8** é correção de escopo de UX-D07 (§2.1), **G9** é verificação técnica de mecanismo (§2.1) e **G10** é higiene de artefato (§3.1).

---

## 2. Débitos de Frontend/UX

> ✅ **v2.0: revisão da Fase 6 INCORPORADA.** A tabela abaixo substitui a da v1.0 e é a de Uma em `ux-specialist-review.md` §1.1, **recontada** (17 linhas — a distribuição declarada no rodapé dela dizia 15; ver G10 em §3.1). As severidades e horas são dela, não minhas. Três achados da Fase 3 foram **rebaixados por ela mesma** com evidência bruta (§2.0) — é o oposto de viés de confirmação e a razão pela qual o `@qa` sustentou o parecer dela integralmente.

### 2.0 🆕 Autocorreções da Fase 6 (registro obrigatório de rastreabilidade)

| Achado da Fase 3 | Status | Evidência que mudou o julgamento |
|---|---|---|
| UX-D11 "Zero responsividade" | ❌ **FACTUALMENTE ERRADO** | Existe camada responsiva: `.nc-viewport`/`.nc-shell`/`--nc-scale` com media queries em 640/1024/1440px (L666-672) e `getDeviceClass` (L189). Uma contou prefixos Tailwind — proxy errado. |
| UX-D14 "contraste provável falha" | ⚠️ **PARCIALMENTE ERRADO** | `#8d959e` mede 4,39–6,53:1 — passa na maioria dos fundos. As falhas reais são `#6b7280` (2,76:1, falha nos 6 fundos) e `#ef4444` (3,54:1 sobre metal claro). |
| UX-D15 "alvos <44×44" | ⚠️ **REBAIXADO** | Medido: teclado ≈119×37px. Falha 2.5.5 (AAA), **passa** 2.5.8 (AA da WCAG 2.2, 24×24). |
| UX-D07 "flicker vermelho" | ✅ **CONFIRMADO E AMPLIADO** | O mecanismo dominante não é o overlay — é `rumbleHard` a 11,1 Hz no viewport inteiro. **Ampliado de novo pela Fase 7:** `rumble` a 8,3 Hz e `grainShift` a 3,57 Hz (§2.1). |

**Ação obrigatória (C10):** `docs/frontend/frontend-spec.md` recebe **errata** registrando os quatro itens — **errata, não reescrita**. Motivo de rastreabilidade: o `frontend-spec.md` é insumo citado deste documento; se continuar afirmando "zero responsividade", a Fase 9 pode recitá-lo para a diretoria.

### 2.1 Débitos exclusivos de frontend — tabela validada da Fase 6 (17 linhas)

| ID | Débito | Severidade | Horas | Prio. UX | Impacto UX |
|---|---|---|---|---|---|
| **UX-D07** | Animações sem `prefers-reduced-motion` — `rumbleHard` 11,1 Hz no viewport inteiro + scanlines de alto contraste + `glitch` 11,1 Hz simultâneos em `heat ≥ 90`; **+ `rumble` 8,3 Hz em `heat > 72` e `grainShift` 3,57 Hz** (emenda da Fase 7) | **CRÍTICA** ⬆ | **1,75** ⬆ | **P0-SAFETY** | Único débito com potencial de **dano físico** (fotoconvulsivo, vestibular, enxaqueca) em criança, sem escape. Ver §2.1.1 |
| **UX-D05** | A11y quase nula — 3 `aria-*`, 0 `role`, 0 `tabIndex`, 0 `aria-hidden` (8 ícones anunciáveis), 1 `outline-none`, 24/27 botões sem nome acessível. **Reverificado na Fase 7: 3/0/0/0** | **CRÍTICA** | 28 (subconj. AA) / +34 AA integral | P1-UX | Produto educacional **inutilizável** por leitor de tela. Exclusão categórica, não degradação |
| **UX-D23** 🆕 | **`fontSize` numéricos em px, 0 `rem`/`em`** + `zoom:var(--nc-scale)` — preferência de tamanho do usuário ignorada. WCAG 1.4.4 e 1.4.10. **Contagem corrigida na Fase 7: são 100, não 93** | **ALTA** | 10 | P1-UX | A falha de a11y **mais completa** do produto: não há caminho de contorno algum |
| **UX-D10** | Sem empty states — análise >10 ops, radar ≥2 operadores, gráficos 3/4/5 com condições próprias; conteúdo some sem explicação | **ALTA** | 10 | P1-UX | AC explícito de NC-001 e NC-002. Professor lê ausência de dado como produto quebrado |
| **UX-D02** | Design system inexistente como sistema — 168 blocos `style={{}}` vs **227** `className` (não 222), cores literais em 1.343 linhas | **ALTA** ⬇ | 24 | P1-UX | Drift visual garantido nas 3 telas novas. **Rebaixada: não bloqueia story, garante degradação** |
| **UX-D06** | Cor como canal semântico único (verde/âmbar/vermelho) — WCAG 1.4.1 | **ALTA** | 12 | P2-UX | Aluno daltônico (~8% dos meninos) perde a partida sem entender por quê. **Contamina a métrica pedagógica** (RX-4) |
| **UX-D24** 🆕 | Sem exclusão de operador e sem pseudonimização — nome de criança + histórico persistem indefinidamente, exibidos em ranking visível à turma. Zero fluxos de remoção | **ALTA** | 8 (4+4; **metade reclassificada** → TD-DAT-04) | P2-UX | Dado pessoal de menor, sem consentimento, sem direito de eliminação, exposto socialmente |
| **UX-D16** | Nenhuma tela existe para NC-001/002/003; sem `ScreenLayout` — 9 telas montam árvore inline | **MÉDIA** | 20 (só primitivas) | P1-UX | Reclassificado: as telas são **escopo de produto**; o débito é a ausência das primitivas |
| **UX-D11** | Responsividade **por escala, não por refluxo** — `zoom:var(--nc-scale)` (0,78–1,18); `play` é coluna única fixa; encolhe alvos a ~29px | **MÉDIA** ⬇ | 16 | P2-UX | **Autocorreção:** a camada responsiva existe. O débito é o mecanismo (`zoom` ≠ refluxo, não atende 1.4.10) |
| **UX-D14** | Contraste — **medido**: `#6b7280` falha nos 6 fundos (2,76–4,10:1); `#ef4444` sobre `#2a3037` = 3,54:1; `#8d959e` = 4,39:1 marginal | **MÉDIA** | 6 | P2-UX | O pior caso é o **vermelho de perigo ilegível** — a cor cuja leitura mais importa |
| **UX-D19** | Foco não gerenciado nas 9 transições de `mode` | **MÉDIA** | 4 | P2-UX | Usuário de teclado jogado ao topo a cada tela. Sub-item natural do pacote UX-D05 |
| **UX-D22** 🆕 | `<style>` reinjetado em 6 raízes de tela (L685, 738, 965, 1137, 1188, 1232) — folha de estilo dentro do render, invisível a lint, minificação e auditoria | **MÉDIA** | 3 | P3-UX | Nenhuma ferramenta enxerga estas 7 keyframes. **É por isso que `prefers-reduced-motion` nunca apareceu em varredura** |
| **UX-D08** | Sem loading state — `loading` no state, 0 `Skeleton`/`Spinner` | **MÉDIA** ⬇ | 3 | P3-UX | **Rebaixada:** zero chamadas de rede; `loadAll()` é local e sub-segundo. O risco real é **falha**, não espera |
| **UX-D18** | Sem medição de performance percebida (LCP/INP/CLS) nem orçamento | **MÉDIA** | 6 | P3-UX | Sem evidência em nenhuma direção. Medir antes de otimizar. **Agrava UX-D07** (RX-5) |
| **UX-D25** 🆕 | Sem legenda de atalhos de teclado — o efeito 3 é o caminho de entrada principal e não é anunciado em lugar algum | **BAIXA** | 3 | P3-UX | Recurso de a11y **já pago** e desperdiçado por falta de 4 linhas de copy |
| **UX-D15** | Alvos de toque — **medido**: teclado ≈119×37px | **BAIXA** ⬇ | 3 | P3-UX | Passa 2.5.8 AA. Falha só 2.5.5 AAA. O risco real é a interação com `zoom` (→29px), que pertence a UX-D11 |
| **UX-D17** | `pause` e calendário sem rastreabilidade — Artigo IV | **BAIXA** ⬇ | 3 | P3-UX | Documentar, não remover. **O calendário (L986) é um heatmap de consistência pronto — insumo de NC-002** |

**Subtotal de frontend (recontado): 2 CRÍTICA · 5 ALTA · 7 MÉDIA · 3 BAIXA = 17 débitos · 160,75 h** (era declarado "15 · 159,5 h" — ver G10 em §3.1; +0,25 h da emenda ao UX-D07; +34 h se WCAG 2.1 AA integral for exigido).

### 2.1.1 🆕 UX-D07 — escopo emendado e congelado (C3)

**Medição completa das animações** (bloco `css` L657-673 + inline), verificada por mim no código:

| Animação | Duração | Frequência | Gatilho | Coberta pelo escopo original? |
|---|---|---|---|---|
| `rumbleHard` (L665 → `.nc-viewport` em L679) | `.09s` | **11,1 Hz** | `heat >= 90` | ✅ sim |
| `glitch` (L45) | `.09s` | **11,1 Hz** | `band === 4` | ✅ sim |
| **`rumble` (L665 → `.nc-viewport` em L679)** | `.12s` | **8,3 Hz** | **`heat > 72`** | ❌ **NÃO — lacuna** |
| **`grainShift` (L42)** | `.28s` | **3,57 Hz** | `g > .05` | ❌ **NÃO — lacuna** |
| `warnPulse` · `vigPulse` · `lampPulse` | `.5s`/`1.4s`/`1.1s` | 2 / 0,7 / 0,9 Hz | — | ➖ abaixo do limiar |

**Por que a lacuna é a parte mais importante:** `.rumble` também translada o viewport inteiro, a 8,3 Hz, e dispara em `heat > 72` — **faixa muito mais larga e muito mais frequentemente atingida** que `heat >= 90`. Em **tempo de exposição acumulado**, `.rumble` é provavelmente o **maior** contribuinte de risco vestibular do produto, não o menor. A media query cobre ambas sob `prefers-reduced-motion` — mas o argumento decisivo da própria Uma é que quase ninguém no público-alvo tem essa flag ativa. **A lacuna estava exatamente onde o raciocínio dela é mais forte.**

**Ressalva técnica que torna o passo 2 obrigatório (G9, verificada por mim):** `if (boom) return <Boom .../>` está em **L676 — antes de qualquer `{css}`**. Durante o `Boom`, **a folha de estilo não está montada** e nenhuma media query dela se aplica. O flash branco de tela cheia (L179) e as 50 partículas por 4 s ficam **integralmente desprotegidos** por CSS.

> ⛔ **Regra dura para a Fase 10:** o passo 2 (`matchMedia` em JS dentro do `Boom`) **não pode ser cortado por escopo**. Entregar só a media query deixa **a tela de meltdown — o momento de maior estímulo do produto — sem nenhuma proteção**. Esta linha existe para impedir exatamente esse corte.

**Escopo executável congelado (1,75 h):**

| Passo | Trabalho | Horas | Obrigatório? |
|---|---|---|---|
| 1 | Media query `prefers-reduced-motion` no bloco `css` (L656-673): `*{animation-duration:.01ms!important;...}` + `.rumble,.rumbleHard{animation:none!important}` | 0,25 | ✅ |
| 2 | **`Boom` (L167): guarda em JS via `matchMedia`** — suprimir o flash branco (L179-180), reduzir as 50 partículas a estado estático, **preservar `onDone(4000)`** para não quebrar a máquina de estados | 0,5 | ✅ **NÃO CORTÁVEL** (G9) |
| 3 | Reduzir **`rumble`, `rumbleHard`, `glitch` e `grainShift`** para ≥ `.34s` (< 3 Hz) **também no modo padrão** | 0,5 | ✅ (as 4, não 2 — G8) |
| 4 | Verificação manual T0.1-T0.5, com vídeo anexado à story, **contra o artefato publicado** e não o dev server | 0,5 | ✅ |

**Por que o passo 3 é o mais importante e o mais fácil de esquecer:** `prefers-reduced-motion` só protege quem já sabia que precisava de proteção. Uma criança de 8 anos num Chromebook compartilhado da escola nunca ativou essa flag. **Baixar a frequência abaixo de 3 Hz por padrão é o que efetivamente remove o risco.**

⚠️ **Ordem interna crítica (nota de Uma, §3 da Fase 6):** **não extraia a folha de estilo (UX-D22) antes de aplicar a guarda.** A ordem inversa converte uma correção de 1,75 h numa refatoração.

### 2.2 Débitos de frontend absorvidos na seção 1 (não recontar)

| ID original (Fase 3) | Fundido em | Nota |
|---|---|---|
| UX-D01 — UI fora de `src/` | TD-SYS-05 | Elevou TD-SYS-05 a CRITICAL |
| UX-D03 — Tailwind congelado sem toolchain | TD-SYS-08 | Elevou TD-SYS-08 a CRITICAL |
| UX-D04 — `@ts-nocheck` no arquivo de UI | TD-SYS-01 | Mesma linha 1, mesmo arquivo |
| UX-D09 — sem error boundary | TD-SYS-18 | Elevou TD-SYS-18 a HIGH |
| UX-D12 — monolito de 1.342 linhas | TD-SYS-06 | Mesma causa, ângulo de paralelismo de stories |
| UX-D13 — sem testes/catálogo de UI | TD-SYS-03 | Faceta de UI do gate de teste vazio |
| UX-D20 — builds legados duplicados | TD-SYS-14 | Mesmas 4 cópias |
| UX-D21 — sem `vite.config.*` | TD-SYS-11 | Mesma ausência de arquivo |

### 2.3 Invariantes de UI que restringem qualquer remediação

Não são débitos — são **restrições duras** que qualquer proposta precisa respeitar (fonte: `handoff-02-referencia.md` §11 e §7 da frontend-spec):

1. Valores arbitrários do Tailwind **não funcionam** neste setup — `style` inline é solução deliberada, não descuido. A remediação de UX-D02 é fazer o inline **ler de tokens**, não eliminá-lo.
2. `AudioContext` só sob gesto do usuário.
3. `localStorage`/`sessionStorage` proibidos — apenas `window.storage`.
4. `GRAIN` gerado fora do render.
5. Efeito 3 (teclado) sem array de dependências, de propósito.
6. `rankIdx` só sobe.
7. Área de conta com altura estável entre escolha e resposta (evita CLS).
8. Interface em pt-BR.
9. Decisões matemáticas acima de decoração.

> 🆕 **Invariante 10 (v2.0):** **nenhuma animação acima de 3 Hz no modo padrão.** Promovida de remediação a invariante por decisão conjunta de três agentes (§4.4 da Fase 6, endossada pela Fase 7). Uma vez corrigido UX-D07, esta linha impede que o débito volte.
>
> 🆕 **Invariante 11 (v2.0):** **nenhuma escrita em `operadores` quando a leitura inicial falhou.** Mesma lógica: sem esta invariante, TD-DAT-02 é reintroduzível por qualquer refatoração futura de persistência.

### 2.4 Forças a não regredir (Gold Standard)

*(v1.0)* Física de três variáveis; `window.storage` como único mecanismo de persistência; retrocompatibilidade explícita de `studyLog` via `mergeStudyLog`; linguagem visual industrial; ausência total de chamadas de rede (superfície de ataque mínima); componentes de apresentação pequenos e puros (`Screw`, `Plate`, `Lamp`, `Lcd`, `Valve`) — **a decomposição correta já existe nessa camada e é o modelo para extrair o resto**; rejeições registradas no `handoff-03`.

**🆕 Acrescentadas pela Fase 6 (§4.3):**
- **`lang="pt-BR"` no `index.html`** — presente e correto; base de a11y que não precisa ser refeita.
- **A camada `.nc-shell` / `getDeviceClass` / `getViewportScale`** — imperfeita (é escala, não refluxo), mas é trabalho real de responsividade. **Não jogar fora** ao corrigir UX-D11: evoluir de `zoom` para refluxo **preservando** os breakpoints 640/1024/1440 já escolhidos.
- **O heatmap de calendário (L986)** — insumo pronto para NC-002 (e, à luz de TD-DAT-03, provavelmente **a** fonte correta dela).
- **`Screw`, `Plate`, `Label`, `Lamp`, `Lcd`, `Valve`** — prova de que o time sabe decompor.

> ⚠️ **v2.0 — nota que muda o status desta seção inteira:** estas 14 forças **não estão pinadas por nenhum teste** (TD-QA-02). "Não regredir" é hoje afirmação de documento, não asserção executável. **Esta lista é uma promessa até que T3 exista.**

### 2.5 Método de deduplicação e critério de elevação

**Regra de fusão aplicada:** dois registros são o mesmo débito quando compartilham **a mesma evidência física** (arquivo, linha, ausência de arquivo). Registros que compartilham apenas *consequência* foram mantidos separados.

Casos de fronteira decididos explicitamente:

- `[AUTO-DECISION]` **UX-D16 (telas ausentes) NÃO foi fundido em TD-SYS-07 (domínio ausente)** → mantidos separados.
- `[AUTO-DECISION]` **UX-D17 (código sem story) NÃO foi fundido em TD-SYS-10 (story sem código)** → mantidos separados com cross-ref.
- `[AUTO-DECISION]` **Elevação de severidade por corroboração cruzada** aplicada a TD-SYS-05, TD-SYS-08 e TD-SYS-18. *(v1.0: "quando dois agentes divergem, prevalece a maior severidade")*
- `[AUTO-DECISION]` **Severidades da Fase 3 não foram rebaixadas em nenhum caso** *(v1.0 — superado: a Fase 6 rebaixou 6 delas, com evidência, e isso está incorporado em §2.1)*.
- 🆕 `[AUTO-DECISION]` **TD-DAT-04 NÃO foi fundido em UX-D24** → separados com cross-ref explícito e sub-stories nomeadas (`UX-D24a`/`UX-D24b`). Razão: evidência física distinta (ausência de fluxo vs. L378-380) e remediação distinta (UI vs. migração de chave primária). Aplicação literal da regra desta seção.

#### 2.5.1 🆕 Regra de severidade — REFORMULADA (C9, pergunta 7)

> **Regra revogada (v1.0):** *"quando dois agentes independentes divergem, prevalece a maior severidade."*
>
> **Regra em vigor (v2.0):** ***severidade é função do modo de falha e da reversibilidade; prevalece a fase que mediu o modo de falha — para cima ou para baixo.***

**Por que revoguei a minha própria regra:** a formulação da v1.0 é uma **catraca de sentido único**. Ela produz **inflação monotônica de severidade** em qualquer pipeline multi-agente: cada fase nova só pode subir, nunca descer, e ao fim de seis fases tudo é CRITICAL — momento em que a classificação para de informar priorização e vira ruído.

**A prova de que a regra nova não é catraca já existe neste pipeline:** Uma **rebaixou seis achados próprios** (UX-D11, D08, D02, D15, D17, D14) sob a regra nova, com medição bruta. A regra da v1.0 teria **proibido** essas correções — e o assessment teria priorizado responsividade (que existe parcialmente) acima de resize de texto (que está integralmente quebrado). **A minha regra original teria produzido a fila errada.**

**Aplicação retroativa (nada muda, e isso é o teste da regra):** TD-SYS-08 permanece CRITICAL **pelo modo de falha** (silencioso, sem sinal em nenhum gate), não pela extensão — reformulação de Uma. TD-SYS-05 e TD-SYS-18 permanecem elevados por razão arquitetural independente. **As três elevações estavam certas; a minha justificativa é que era estreita.**

---

## 3. Matriz Preliminar

**Legenda de esforço** (ordem de grandeza, não compromisso): **S** ≤ meio dia · **M** 1–3 dias · **L** 1–2 semanas · **XL** > 2 semanas ou incremental contínuo.

**Prioridade (v2.0 — duas classes novas no topo):**
- 🆕 **P0-SAFETY** = risco de **dano físico ao usuário**. Fora da fila.
- 🆕 **P0-SAFETY-DATA** = risco de **destruição irreversível de dado do usuário**. Fora da fila.
- **P0** = pré-requisito de qualquer outro trabalho · **P1** = desbloqueia NC-001/002/003 · **P2** = dano real a usuário ou custo crescente · **P3** = higiene.

> 🆕 **Critério unificador das duas classes P0 fora da fila** *(resposta congelada à pergunta 4.2.1)*: **irreversibilidade × esforço S × dependência arquitetural zero.** Os três simultaneamente. Não é "segurança" nem "dados" — é essa conjunção.
>
> **Exatamente quatro itens qualificam:** UX-D07 (dano físico) · TD-DAT-01 + TD-DAT-02 + TD-DAT-05 (destruição de dado, uma guarda única).
>
> ⛔ **Rejeição explícita:** UX-D05, UX-D23 e TD-SYS-08 **não** furam a fila por este caminho. São graves, são P1, e **têm dependências reais**. O `@qa` verificou os outros 34 débitos da v1.0 e nenhum se qualifica. Esta linha existe para impedir que a exceção vire porta.

| ID | Débito | Área | Impacto | Esforço | Prioridade |
|---|---|---|---|---|---|
| **UX-D07** ⬆ | Animações 8,3–11,1 Hz sem escape — **dano físico a criança** | A11y / Segurança | **CRÍTICA** | S (1,75 h) | **P0-SAFETY** 🔴 |
| **TD-DAT-01** 🆕 | `saveResult` destrói campo desconhecido por whitelist | Dados | **CRITICAL** | S (guarda) | **P0-SAFETY-DATA** 🔴 |
| **TD-DAT-02** 🆕 | Falha de leitura silenciosa → sobrescrita do blob da turma | Dados | **CRITICAL** | S (guarda) | **P0-SAFETY-DATA** 🔴 |
| **TD-DAT-05** 🆕 | `storeErr` só renderiza no login — perda invisível | Observabilidade | MEDIUM | S | **P0-SAFETY-DATA** 🔴 |
| TD-SYS-04 | Ausência de Git — sem rollback para nenhuma correção | Governança | CRITICAL | S | **P0** |
| TD-SYS-16 | `.gitignore` não cobre `Arquivos_Diversos/` — janela única antes do 1º commit | Governança | MEDIUM | S | **P0** |
| TD-SYS-05 ⬆ | UI/app fora de `src/` — causa raiz mecânica de 02 e 16 | Arquitetura | CRITICAL | M | **P0** |
| TD-SYS-19 | `globals` incompletos — armadilha embutida na correção de TD-SYS-02 | Qualidade | MEDIUM | S | **P0** |
| TD-SYS-02 | Lint cobre ~2% do código | Qualidade | CRITICAL | M | **P0** |
| **TD-QA-01** 🆕 | Sem toolchain de teste comportamental (decisão: Vitest + happy-dom) | Testes | HIGH | S | **P0** |
| TD-SYS-03 ⊕ UX-D13 | Testes sem valor comportamental — regex sobre texto-fonte | Testes | CRITICAL | L | **P0** |
| TD-SYS-01 ⊕ UX-D04 | `typecheck` cego (`@ts-nocheck` + `strict:false` + `checkJs:false`) | Qualidade | CRITICAL | XL | **P0** |
| TD-SYS-09 | `window.storage` sem contrato — **agora inclui a política de merge** | Integração/Dados | HIGH | M | **P1** |
| TD-SYS-07 | Sem camada de domínio → contrato CLI impossível (Artigo I) | Arquitetura | HIGH | L | **P1** |
| **TD-QA-02** 🆕 | Sem baseline de caracterização — pré-requisito duro de TD-SYS-06 | Testes/Arquitetura | HIGH | M | **P1** |
| **TD-DAT-03** 🆕 | `partidas` é top-40 global — NC-002 AC-2 infactível como escrito | Dados/Produto | HIGH | M | **P1** |
| TD-SYS-06 ⊕ UX-D12 | Monolito de ~1.070 linhas em um componente | Arquitetura | HIGH | XL | **P1** |
| TD-SYS-10 | Bloqueio de NC-001/002/003 registrado com motivo obsoleto | Governança | HIGH | S | **P1** |
| TD-SYS-08 ⬆ ⊕ UX-D03 | Tailwind congelado — utility nova falha em silêncio | Build/UI | CRITICAL | M | **P1** |
| UX-D02 ⬇ | Design system inexistente — 168 `style` inline com cores literais | UX/Design | ALTA | L | **P1** |
| UX-D23 🆕 | 100 `fontSize` em px, 0 `rem` — resize do usuário impossível | A11y | ALTA | M | **P1** |
| UX-D16 | Telas de NC-001/002/003 inexistentes; sem primitivas compartilhadas | UX/Escopo | MÉDIA | L | **P1** |
| UX-D10 | Sem empty states — AC explícito de NC-001 e NC-002 | UX | ALTA | M | **P1** |
| TD-SYS-11 ⊕ UX-D21 | Sem `vite.config` / plugin React / aliases (Artigo VI) | Build/DX | MEDIUM | S | **P1** |
| UX-D05 | A11y praticamente nula — 3 `aria-*`, 0 `role`, sem `aria-live` | A11y | CRÍTICA | L | **P2** |
| UX-D06 | Cor como canal semântico único — WCAG 1.4.1 | A11y | ALTA | M | **P2** |
| TD-SYS-18 ⬆ ⊕ UX-D09 | Sem `ErrorBoundary`, sem logging, sem Sentry → tela branca | Observabilidade | HIGH | M | **P2** |
| UX-D19 | Foco não gerenciado nas 9 transições de `mode` | A11y | MÉDIA | S | **P2** |
| UX-D14 | Contraste — `#6b7280` e `#ef4444` medidos em falha | A11y | MÉDIA | S | **P2** |
| UX-D24 | Sem exclusão de operador nem pseudonimização (**a**: UI, P2) | Privacidade/UX | ALTA | M | **P2** |
| **TD-DAT-04** 🆕 | Nome é chave primária — pseudonimização é migração (**UX-D24b**) | Dados/Privacidade | HIGH | M | **P2** |
| UX-D11 ⬇ | Responsividade por `zoom`, não por refluxo | UX | MÉDIA | L | **P2** |
| TD-SYS-17 | `SUPABASE_SERVICE_ROLE_KEY` no `.env` de app client-side | Segurança | MEDIUM | S | **P2** |
| TD-SYS-15 | Servidor local serve ES modules como `octet-stream` → tela branca | Ferramental | MEDIUM | S | **P2** |
| TD-SYS-14 ⊕ UX-D20 | Quatro cópias divergentes do artefato de deploy | Build/Deploy | MEDIUM | M | **P2** |
| TD-SYS-20 | `StrictMode` + 20 efeitos com timers + `AudioContext` sem cleanup | Runtime | MEDIUM | M | **P2** |
| TD-SYS-13 | Balanceamento hardcoded (`DIFF`, cooldowns, `FREEZE_MS`) | Configuração | MEDIUM | M | **P3** |
| TD-SYS-12 | Bundle único de 910 KB sem code splitting | Performance | MEDIUM | M | **P3** |
| TD-SYS-21 | Sem CI/CD; publicação por ZIP manual | DevOps | MEDIUM | M | **P3** |
| UX-D22 🆕 | `<style>` dentro do render, replicado em 6 telas | Build/UI | MÉDIA | S | **P3** |
| UX-D08 ⬇ | Sem loading state visível | UX | MÉDIA | S | **P3** |
| UX-D18 | Sem medição nem orçamento de performance percebida | Performance | MÉDIA | M | **P3** |
| UX-D15 ⬇ | Alvos de toque — passa 2.5.8 AA, falha 2.5.5 AAA | A11y | BAIXA | S | **P3** |
| UX-D17 ⬇ | `pause` e calendário sem rastreabilidade — Artigo IV | Rastreabilidade | BAIXA | S | **P3** |
| UX-D25 🆕 | Atalhos de teclado implementados e não anunciados | A11y/UX | BAIXA | S | **P3** |
| TD-SYS-22 | `dist/default.php` da Hostinger no artefato de build | Deploy/Seg. | LOW | S | **P3** |
| TD-SYS-23 | TS 7 / Vite 8 / ESLint 10 adotados sem ADR ou nota de migração | Manutenção | LOW | S | **P3** |

> ⚠ **Anomalia deliberada da v1.0 — UX-D07 (fotossensibilidade)** *(texto original preservado)*: *"É o único item com esforço S e potencial de dano físico a criança. Pela lógica de sequenciamento arquitetural ele cai em P2; pela lógica de risco, uma guarda de `prefers-reduced-motion` é meia hora de trabalho e deveria ser feita agora. Registro a tensão em vez de resolvê-la sozinho."*
>
> ✅ **RESOLVIDA na v2.0.** Uma (§2.1 da Fase 6) e Quinn (§Dependências Validadas da Fase 7) endossaram **fora da fila**, e o argumento decisivo é **técnico, não moral**: a correção vive num bloco `<style>` que já existe, é CSS puro (não toca Tailwind), não atravessa a fronteira de `src/`, não precisa de tokens e não precisa que o monolito seja quebrado. **A fila ordena dependências técnicas; este item não tem nenhuma.** Não é exceção ao método — é o método aplicado corretamente. A tensão que eu registrei era real, e a resposta dos dois especialistas é que eu havia enquadrado a pergunta como um trade-off quando não havia trade-off algum.

### 3.1 Distribuição consolidada

#### 3.1.1 🆕 Correção aritmética herdada (G10)

A tabela §1.1 da Fase 6 tem **17 linhas** (2 CRÍTICA · 5 ALTA · 7 MÉDIA · 3 BAIXA), mas o rodapé dela declarava *"2 · 4 · 6 · 3 = 15 débitos · 159,5 horas"*. Soma real das horas da tabela: **160,5 h**. Não é erro de julgamento e **não altera nenhuma prioridade** — mas é o número que o `TECHNICAL-DEBT-REPORT.md` da Fase 9 levaria à diretoria. **Corrigido aqui na fonte.**

#### 3.1.2 Distribuição v2.0

| Severidade | Sistema (F1/F4) | Frontend (F6, recontado) | Dados/Testes (F7) | **Total** |
|---|---|---|---|---|
| CRITICAL / Crítica | 6 | 2 | **2** (TD-DAT-01, TD-DAT-02) | **10** |
| HIGH / Alta | 5 | 5 | **4** (TD-DAT-03, TD-DAT-04, TD-QA-01, TD-QA-02) | **14** |
| MEDIUM / Média | 10 | 7 | **1** (TD-DAT-05) | **18** |
| LOW / Baixa | 2 | 3 | 0 | **5** |
| **Total** | **23** | **17** | **7** | **47** |

**O total consolidado é 47, não 36.** Trajetória auditável: **36** (v1.0) → **40** (recontagem da Fase 6: 13 → 17 exclusivos de frontend) → **47** (7 débitos da Fase 7). **É 47 que vai para a Fase 9.**

**Prioridade: P0-SAFETY = 1 · P0-SAFETY-DATA = 3 · P0 = 8 · P1 = 12 · P2 = 12 · P3 = 11.** Total 47.

#### 3.1.3 🆕 Mapa débito → artigo da Constitution (C9, pergunta 8)

| Artigo | Princípio | Débitos que o violam |
|---|---|---|
| **I** — CLI First | NON-NEGOTIABLE | TD-SYS-07 (nenhuma função de domínio invocável) |
| **II** — Agent Authority | NON-NEGOTIABLE | *(nenhuma violação identificada)* |
| **III** — Story-Driven Development | MUST | TD-SYS-10 (bloqueio com motivo obsoleto); UX-D17 (código sem story, direção inversa) |
| **IV** — No Invention | MUST | UX-D17 (`pause` e calendário sem rastreabilidade documental) |
| **V** — Quality First | MUST | TD-SYS-01/02/03 (gates vacuosos) · 🆕 **TD-DAT-01 + TD-DAT-02 — a violação mais material do Quality First em todo o assessment: o produto perde dado de usuário** |
| **VI** — Absolute Imports | SHOULD | TD-SYS-11 (sem aliases; força `../Arquivos_Diversos/...`) |

**Por que incluí:** custo marginal quase nulo e é o que torna a Constitution **acionável em vez de decorativa**. Cada gate constitucional futuro passa a ter um débito nomeado para apontar.

### 3.2 Grafo de causalidade consolidado

```text
TD-SYS-04 (sem Git)
   └──> nenhuma correção abaixo tem rollback  ⇒  faça isto primeiro
        TD-SYS-16 (.gitignore) tem janela única: antes do 1º commit

  ╔══════════════════════════════════════════════════════════════════════╗
  ║ FORA DA FILA — irreversibilidade × esforço S × dependência zero      ║
  ║                                                                      ║
  ║  UX-D07 (animações 8,3–11,1 Hz)                                      ║
  ║     └──> dano físico. Dependências técnicas: NENHUMA.                ║
  ║          ⚠ UX-D22 (extrair a folha) DEPOIS, nunca antes.             ║
  ║                                                                      ║
  ║  TD-DAT-01 + TD-DAT-02 + TD-DAT-05 (guarda anti-destruição)          ║
  ║     └──> perda irreversível do histórico da turma.                   ║
  ║          Dependências técnicas: NENHUMA (guarda aditiva).            ║
  ╚══════════════════════════════════════════════════════════════════════╝

TD-SYS-05 ⊕ UX-D01 (código fora de src/)
   ├──> TD-SYS-02 (lint não alcança o arquivo)
   │       └──> TD-SYS-19 (globals incompletos = avalanche de falsos positivos)
   └──> TD-SYS-16 (.gitignore não cobre o diretório)

TD-SYS-06 ⊕ UX-D12 (monolito)
   ├──> TD-SYS-07 (sem domínio → sem contrato CLI)
   │       └──> BLOQUEIA NC-001, NC-002, NC-003
   ├──> TD-SYS-03 (nada isolável para testar)
   │       └──> TD-QA-01 (e não há runner com o que testar)   🆕
   ├──> TD-SYS-13 (config presa dentro do componente)
   └──> UX-D16 (sem ScreenLayout → cada tela nova recomeça do zero)

TD-QA-02 (sem baseline de caracterização)                     🆕
   └──> PRÉ-REQUISITO DURO de TD-SYS-06
        (a maior operação de risco do plano, hoje sem rede)

TD-SYS-08 ⊕ UX-D03 (Tailwind congelado)
   ├──> UX-D02 (inline vira a única saída → 168 blocos de estilo)
   ├──> UX-D11 (breakpoints inertes... — CORRIGIDO: a camada existe; ver §2.0)
   └──> RX-6: a11y Parada 1 NÃO começa antes de TD-SYS-08     🆕

UX-D02 (sem tokens)
   ├──> UX-D06 + UX-D14 (cor e contraste sem fonte única corrigível de uma vez)
   └──> UX-D23 (rem) — normalizar na MESMA entrega                🆕

  🆕 SEGUNDA RAIZ DE DADOS — invisível às Fases 1/3/4/6 (ver §0.5)
TD-SYS-09 (window.storage sem contrato)
   ├──> TD-DAT-01 (merge por whitelist destrói campo desconhecido)
   │       ├──> VIOLA NC-003 AC-2 e NC-002 AC-4 HOJE, no código atual
   │       └──> TD-DAT-04 (migração de chave depende do mesmo mecanismo)
   ├──> TD-DAT-02 (falha de leitura silenciosa → sobrescrita do blob)
   │       └──> agravado por TD-DAT-05 (erro invisível fora do login)
   │            e por TD-SYS-04 (sem rollback) e UX-D24 (sem backup/export)
   └──> TD-DAT-03 (partidas é top-40 global, não histórico)
           └──> NC-002 AC-2 INFACTÍVEL como escrito → decidido por T5.1

TD-SYS-01 + TD-SYS-02 + TD-SYS-03  (gates vacuosos)
   └──> RISCO SISTÊMICO: qualquer alteração acima é aprovada sem verificação real
        └──> 🆕 PROVADO POR MUTAÇÃO na Fase 7 (§3.3.1), não mais inferido
```

**Leitura (v1.0):** o grafo tem **duas raízes independentes** — `TD-SYS-05` (fronteira de código) e `TD-SYS-08` (toolchain de CSS) — e um **amplificador transversal** (`01+02+03`, gates vazios). `TD-SYS-04` é anterior a tudo por ser a única fonte de reversibilidade.

**🆕 Leitura corrigida (v2.0):** o grafo tem **três raízes**, não duas. A terceira é `TD-SYS-09` (contrato de persistência ausente), e ela é a **única que já está causando dano hoje** — as outras duas causam *impedimento*, esta causa *perda*. Ela ficou invisível na v1.0 porque eu a tratei como um débito-folha de integração em vez de uma raiz de subsistema (§0.5). **Adicionalmente, dois itens saem inteiramente do grafo**: UX-D07 e a guarda de dados não têm arestas de entrada — é exatamente por isso que furam a fila.

### 3.3 Riscos consolidados

| # | Risco | Prob. | Impacto | Débitos |
|---|---|---|---|---|
| R1 | **Regressão silenciosa aprovada por gates verdes.** Um PASS de QA hoje não significa nada. **🆕 Provado por mutação — §3.3.1.** | **Alta → Confirmada** | Crítico | 01, 02, 03 |
| R2 | **Perda irrecuperável de trabalho** — sem Git, uma edição ruim no arquivo de 1.342 linhas é permanente. | Média | Crítico | 04 |
| R3 | **Ondas 1-3 bloqueadas por impossibilidade estrutural**, com o artefato de bloqueio apontando o motivo errado. | Alta | Alto | 06, 07, 10 |
| R4 | **UI quebrada em silêncio por utility Tailwind ausente** — toda story que toque UI carrega isto, sem sinal em nenhum gate. | Alta | Médio | 08, UX-D02 |
| **R5** 🔄 | **REESCRITO.** ~~"Falha total na inicialização se o host não prover `window.storage`"~~ → **Degradação silenciosa seguida de destruição de dados.** A leitura de `window.storage` está dentro de `try/catch` e o retorno `okStore` é **descartado em dois call sites**. Falha de leitura → `players = {}` → login exibe "Nenhum operador cadastrado", **indistinguível de dispositivo novo** → recadastro → `persist` grava por cima do blob inteiro → **histórico da turma destruído, sem aviso, sem log, sem rollback, sem backup**. O modo real é **invisível e com perda**, não visível e sem perda. | **Média-Alta** | **Crítico** | **09, 18, TD-DAT-02, TD-DAT-05, 04** |
| R6 | **Exposição de credencial com bypass de RLS** se o Supabase for integrado seguindo o `.env` existente. | Baixa | Crítico | 17 |
| R7 | **Publicação da cópia errada do artefato** — já ocorreu uma vez. | Média | Médio | 14, 15, 21 |
| R8 | **Dano físico a usuário infantil** — animações a 8,3–11,1 Hz no viewport inteiro sem escape (WCAG 2.3.1). *Novo na v1.0; **escopo ampliado na v2.0** — `rumble` a 8,3 Hz dispara em `heat > 72`, faixa muito mais larga que `heat >= 90`.* | **Média-Alta** ⬆ | **Crítico** | UX-D07 |
| R9 | **Exclusão de usuário com deficiência** em produto educacional — inutilizável por leitor de tela; estado só por cor. | Alta | Alto | UX-D05, UX-D06, UX-D23 |
| R10 | **Não adoção em sala de aula** por inviabilidade em tablet/Chromebook. | Média | Alto | UX-D11, UX-D15 |
| **R11** 🆕 | **Perda irreversível de dado pedagógico de criança**, por dois mecanismos independentes (merge por whitelist e sobrescrita pós-falha de leitura), **sem sinal, sem rollback e sem backup**. Diferente de R2: R2 é perda do trabalho da *equipe*; R11 é perda do histórico das *crianças*, e provavelmente **já está ocorrendo**. | **Média** | **Crítico** | TD-DAT-01, TD-DAT-02, TD-DAT-05 |

**Observação de método (v1.0):** R8, R9 e R10 só existem porque a Fase 3 foi executada. **🆕 Observação de método (v2.0):** R11 e a reescrita de R5 só existem porque a Fase 7 **reabriu o código em vez de reler os documentos**. Nenhuma releitura deste DRAFT os teria produzido. É a justificativa empírica de por que o gate de QA precisa executar, não revisar.

#### 3.3.1 🆕 Prova empírica de que o gate de teste não protege (TD-SYS-03)

A Fase 1 alegou que os testes são "frágeis e não-protetores simultaneamente". Era uma alegação forte e **não estava provada**. O `@qa` a testou aplicando as 5 regex reais de `tests/pause-contract.test.mjs` contra dois mutantes sintéticos (em cópia no scratchpad; **nenhum arquivo do projeto foi alterado**):

| Mutante | Comportamento real | Gate diz |
|---|---|---|
| **A** — `pauseGame = () => {}`, `resumeGame = () => setMode('lose')`, `PauseButton = () => null`, com as strings exigidas preservadas em comentários mortos | Pausa **100% quebrada**; retomar **perde a partida** | ✅ **PASSA** |
| **B** — implementação correta, `pauseGame` apenas reformatado em 3 linhas | **Perfeito** | ❌ **FALHA** |

**O gate aprova a destruição total do recurso e reprova a formatação correta dele.**

**Consequências normativas, adotadas a partir daqui:**
1. **Regex sobre código-fonte fica proibida como evidência de comportamento.** Não é heurística — é regra de gate.
2. **Os 2 testes de regex atuais são DELETADOS** ao entrar a invariante I6. Mantê-los preserva um falso positivo **e** um falso negativo que penalizará a primeira reformatação do arquivo.
3. TD-SYS-03 deixa de ser uma alegação minha e passa a ser **um fato medido**.

### 3.3.2 🆕 Riscos cruzados (RX-1 a RX-8) — C4

Riscos que **só existem na interseção de duas ou mais áreas**. Nenhum é visível a partir de uma única fase — e é por isso que nenhum aparece na v1.0.

| # | Risco | Áreas / Débitos | Mitigação |
|---|---|---|---|
| **RX-1** 🔴 | **Destruição irreversível de dado de criança sem rollback.** TD-DAT-02 apaga o blob por acidente; TD-SYS-04 garante que não há como reverter; TD-SYS-18/TD-DAT-05 garantem que ninguém fica sabendo; UX-D24 garante que não há cópia nem exportação. **Quatro débitos "médios" isolados compõem uma perda total e silenciosa.** | Dados + Governança + Observabilidade + Privacidade | **Fura a fila junto com UX-D07** (item 0c). Guarda mínima ≈ 1 h: (a) não gravar `operadores` se `okStore === false`; (b) `{ ...p, ...campos }` em `saveResult`; (c) `storeErr` global |
| **RX-2** 🔴 | **A refatoração do monolito destrói dados e nenhum gate percebe.** TD-SYS-06 (XL) executada sem caracterização (TD-QA-02), sob typecheck cego, lint que não alcança o arquivo e testes de regex. O merge de registros (TD-DAT-01) é a parte mais frágil e a menos visível. | Arquitetura + Testes + Qualidade + Dados | Round-trip de persistência com fixture legada **antes da primeira linha de refatoração**. É critério de saída de TD-SYS-03 (T1.5) |
| **RX-3** 🟠 | **Épico planeja stories estruturalmente impossíveis.** TD-DAT-03 torna NC-002 AC-2 infactível; TD-DAT-01 torna NC-003 AC-2 falso **já hoje**; TD-SYS-10 mantém o bloqueio apontando o motivo errado. A equipe descobriria no meio da implementação. | Governança + Dados + Produto | Fase 8 sinaliza migração do escopo de NC-002 para `studyLog` (decidido por T5.1); NC-003 ganha o merge não-destrutivo como pré-requisito explícito |
| **RX-4** 🟠 | **Exclusão contamina a métrica pedagógica.** UX-D06 (cor como canal único) + UX-D23 (texto que não escala) fazem a criança daltônica ou com baixa visão **errar por causa da interface**. O erro é gravado em `stats` como erro de matemática, e NC-002/NC-003 o reportam ao professor como **déficit de aprendizagem**. | A11y + Dados + Produto | Endosso integral do argumento de Uma: **não é só exclusão, é dado inválido.** Itens 6 e 8 da Parada 1 são pré-requisito de **confiabilidade da métrica**, não só de conformidade |
| **RX-5** 🟠 | **Fadiga de quadros agrava o risco fotossensível.** UX-D18 (sem medição) + TD-SYS-12 (bundle de 910 KB) + 4 animações simultâneas em `heat >= 90`. Animação a 11 Hz com quadros perdidos produz padrão temporal **irregular**, mais provocativo que o regular. Em Chromebook de entrada, é o cenário **provável**, não o pessimista | Performance + A11y + Segurança | Reforça o passo 3 do UX-D07: **baixar a frequência por padrão remove a dependência do desempenho.** A correção de segurança não pode depender de o dispositivo conseguir 60 fps |
| **RX-6** 🟡 | **Correção de a11y quebra a UI em silêncio.** A Parada 1 toca a UI extensivamente; TD-SYS-08 faz qualquer utility Tailwind nova falhar sem erro em nenhum gate; UX-D22 esconde o CSS de toda ferramenta de auditoria | A11y + Build + UI | **Regra dura: a Parada 1 de a11y não começa antes de TD-SYS-08 resolvido**, ou toda correção usa exclusivamente `style` inline lendo dos tokens |
| **RX-7** 🟡 | **Publicação da cópia errada anula qualquer correção.** 4 cópias divergentes (TD-SYS-14), sem CI (TD-SYS-21), servidor local que serve ES modules como `octet-stream` (TD-SYS-15). **Aplica-se inclusive ao UX-D07**: pode ser feito corretamente e nunca chegar à sala de aula | Deploy + Ferramental + Segurança | Verificação de publicação **obrigatória** no fecho do UX-D07 (T0.5): hash do artefato servido == hash do build |
| **RX-8** 🔵/🔴 | **Exfiltração via `SUPABASE_SERVICE_ROLE_KEY`.** TD-DAT-03 cria pressão **legítima** por backend ("os dados longitudinais não cabem no top-40"); o `.env` já oferece o trilho pronto; sem CI ninguém revisa. Probabilidade baixa hoje, **crescente** conforme NC-002 avança | Segurança + Dados + DevOps | Remover as 3 chaves Supabase e as demais não consumidas do `.env`/`.env.example` (S, ~0,25 h). **Verificado: estão vazias — sem vazamento presente. É trilho, não incêndio** |

### 3.4 🆕 Ordem de execução validada e congelada (C5)

**Status:** validada por três agentes (@architect Fase 4, @ux-design-expert Fase 6, @qa Fase 7), com **três emendas** da Fase 7 sobre o parecer da Fase 6. **Congelada para a Fase 8.**

| # | Ação | Depende de | Origem / status |
|---|---|---|---|
| **0a** | `git init` + `.gitignore` cobrindo `Arquivos_Diversos/` (TD-SYS-04 + TD-SYS-16) — **~0,25 h** | — | ⚠️ **Emenda 1 da Fase 7** — antecipado |
| **0b** | **UX-D07 P0-SAFETY** — media query + **`matchMedia` no `Boom` (obrigatório)** + **as 4 animações < 3 Hz por padrão** — **~1,75 h** | 0a | ✅ **ENDOSSADO** — liberado apesar do NEEDS WORK |
| **0c** | **Guarda anti-destruição P0-SAFETY-DATA** — TD-DAT-01 + TD-DAT-02 + `storeErr` global (TD-DAT-05) — **~1 h** | 0a | ⚠️ **Emenda 2 da Fase 7** — nova classe |
| 1 | UX-D02 tokens + UX-D23 `rem` (**entrega única**) | 0a | ✅ endossado (divergência da Fase 6 aceita) |
| 2 | TD-SYS-05 fronteira `src/` + TD-SYS-11 `vite.config` | 1 | ✅ endossado |
| 3 | TD-SYS-19 `globals` → TD-SYS-02 lint → **TD-QA-01 runner** → TD-SYS-03 testes → TD-SYS-01 typecheck **(nesta ordem)** | 2 | ✅ endossado |
| 4 | TD-SYS-09 `StorageAdapter` (**incluindo a política de merge de TD-DAT-01**) + **fixtures obrigatórias** + TD-SYS-07 domínio | 3 | ✅ endossado, **escopo ampliado** |
| 5 | **NC-003 piloto** + `MetricBadge` · **exclusão de operador (UX-D24a)** | 4 | ✅ + ⚠️ **Emenda 3 da Fase 7** |
| 6 | A11y Parada 1 (UX-D05, D19, D06, D14) — **só após TD-SYS-08** (RX-6) | 1, 2 | ✅ endossado |
| 7 | UX-D10 `EmptyState` + TD-SYS-18 `ErrorBoundary` | 1 | ✅ endossado |
| 8 | **TD-QA-02 baseline de caracterização** → **TD-SYS-06 quebra do monolito** | 1, 3, 4 | ✅ + 🆕 **pré-requisito duro (RX-2)** |
| 9 | **TD-DAT-04 / UX-D24b pseudonimização** · UX-D11 refluxo · UX-D22 extrair folha · demais P3 | 4, 8 | ⚠️ **Emenda 3 da Fase 7** |

#### As três emendas da Fase 7, e por que eu as aceito

**Emenda 1 — Git antes de UX-D07 (divergência de ~15 minutos).** Uma sustentou que a guarda pode preceder TD-SYS-04 por ser "puramente aditiva e trivialmente reversível por deleção". Isso vale para o **passo 1** (media query nova). **Não vale para o passo 3:** reduzir `rumble`/`rumbleHard`/`glitch`/`grainShift` **no modo padrão** altera o comportamento visual do produto **para todos os usuários** e toca uma força declarada do Gold Standard ("linguagem visual industrial"). É mudança de acabamento com julgamento estético embutido, num arquivo de 1.342 linhas, sob três gates cegos — **exatamente a classe de mudança que precisa de reversão**. **Aceito: `git init` primeiro, ~15 minutos, e é a alternativa que a própria Uma ofereceu.**

**Emenda 2 — a segunda classe fora da fila.** Eu perguntei (4.2.1) se **alguma** classe de débito deve furar a fila. A resposta correta era **duas**, e eu só havia identificado uma. O critério que qualifica UX-D07 — *irreversibilidade × esforço S × dependência zero* — qualifica TD-DAT-01/02 pelos mesmos três eixos. **Aplicar o critério a um item e não ao outro seria incoerência do próprio método.** E há uma assimetria a mais contra os dados: o dano físico é um risco *futuro e probabilístico*; a perda de dados **provavelmente já está ocorrendo**, e TD-DAT-05 garante que ninguém saberia.

**Emenda 3 — UX-D24 dividida em duas.** A exclusão de operador (UI, 4 h, LGPD art. 18 V) **antecipa** para logo após o `StorageAdapter` — é barata e dá ao usuário controle explícito, mitigando parcialmente RX-1. A pseudonimização **fica tarde e é reclassificada** como TD-DAT-04: é migração de chave primária, depende de TD-SYS-09 e compartilha mecanismo com NC-003.

---

## 4. Perguntas para Especialistas

> **Status v2.0: todas as 16 perguntas foram respondidas.** As respostas estão em `docs/reviews/ux-specialist-review.md` §2 e `docs/reviews/qa-review.md` §Respostas. As perguntas permanecem aqui **na íntegra**, com a resposta congelada anexada, porque a rastreabilidade pergunta→resposta→decisão é o que permite auditar a Fase 8.

### 4.1 @ux-design-expert (Uma) — Fase 6 ✅ RESPONDIDA

| # | Pergunta (v1.0, resumida) | Resposta congelada |
|---|---|---|
| 1 | As elevações ⬆ de TD-SYS-05/08/18 devem ser revertidas? | **Não reverter.** A "Crítica" da Fase 3 significava "bloqueia trabalho de UI" — a desconfiança era legítima — **mas as três têm justificativa arquitetural independente**. TD-SYS-08 é CRITICAL **pelo modo de falha (silencioso)**, não pela extensão. Ver §2.5.1 para a regra reformulada |
| 2 | UX-D07 fora da fila ou espera a fundação? | **Fora da fila. P0-SAFETY.** Razão decisiva **técnica**, não moral: dependência arquitetural zero. Emendada pela Fase 7 (+2 animações, passo 2 obrigatório, Git antes) |
| 3 | Tokens antes ou depois da quebra do monolito? | **Antes, categoricamente.** Tokens antes = mover 1× (transformação local e mecânica, verificável por varredura). Monolito antes = espalhar 168 blocos por ~18 arquivos e **perder o critério de pronto**. `tokens.ts` é módulo folha: pode ser criado hoje |
| 4 | As primitivas são pré-requisito das 3 telas? Existe piloto? | **Não todas.** `EmptyState` e `MetricBadge` sim; `ScreenLayout`, `LoadingState`, `ErrorState` não bloqueiam. **Piloto = NC-003** — menor superfície, não cria tela, e ainda exercita tokens + domínio isolável + `StorageAdapter` + primeiro teste real. 🆕 **A Fase 7 acrescentou a razão que fecha o caso: NC-003 é a única das três que exercita TD-DAT-01 de frente** |
| 5 | NC-002 adulto: segunda escala ou segundo tema? | **Nem uma nem outra: escala única, dois mapeamentos de papel** (`role.panel` vs `role.report`), unidades em `rem`. Um segundo tema seria erro estrutural — não muda paleta, muda densidade. **Resolve UX-D23 no mesmo trabalho** |
| 6 | UX-D17: documentar ou remover? | **Documentar, não remover** (3 h), e **rebaixar a BAIXA**. O calendário (L986) é um **heatmap de consistência de prática já construído** — insumo direto de NC-002. Removê-lo destruiria trabalho de uma story não implementada |
| 7 | Baseline de a11y realista? | **Subconjunto priorizado (28 h), não AA integral (62 h).** Parada 1 = "não machuca, não exclui": 8 critérios. Parada 2 (diferida): 1.4.10 Reflow, 2.5.5 AAA, landmarks, skip links. **Linha de corte: exclusão categórica vs. atrito** |
| 8 | Dispositivo de referência para UX-D18? | **Dois:** Chromebook de entrada (Celeron N4020, 4 GB) como piso de performance; tablet Android 10" 1280×800 como piso de layout. **Orçamento:** LCP < 2,5 s · INP < 200 ms · CLS < 0,1 · **60 fps sustentados em `heat ≥ 90`** — esta última é a que importa (RX-5). Nota: `getViewportScale()` normaliza por 390×844 (iPhone), que **contradiz o contexto de sala de aula** |

### 4.2 @qa (Quinn) — Fase 7 ✅ RESPONDIDA · Gate: **NEEDS WORK**

> ⚠️ **Aviso da v1.0, preservado e agora validado por mutação:** neste repositório `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` **todos passam**, e três deles não verificam praticamente nada. **O `@qa` recusou emitir PASS com base nos quatro comandos** e registrou: *"emitir APPROVED aqui apenas porque `npm test` retorna verde seria, literalmente, o risco R1 se materializando na minha própria assinatura."* Ver §3.3.1.

| # | Pergunta (v1.0, resumida) | Resposta congelada |
|---|---|---|
| 1 | Existe classe de débito que fura a fila? Quais? | **Duas classes, não uma.** Dano físico (UX-D07) **e** destruição irreversível de dado (TD-DAT-01 + TD-DAT-02). Critério unificador: *irreversibilidade × esforço S × dependência zero*. **Os outros 34 foram verificados e nenhum se qualifica.** Ver §3 |
| 2 | Critério de saída de TD-SYS-03? | **(b) cobertura das invariantes.** **(c) percentual rejeitado explicitamente** — mediria execução, não verificação, e "seria a terceira ilusão de conformidade deste projeto". (a) é marco, não gate. **Definição de pronto = as 8 invariantes I1-I8** (§4.3) |
| 3 | Ordem de correção dos gates? | **Desativação incremental verificável ACEITA — com ratchet monotônico não negociável:** gate que falha se o número de arquivos com `@ts-nocheck` **aumentar**, e `strict: true` obrigatório em todo módulo novo desde o dia 1. **Sem o ratchet, "incremental" vira "nunca"** — é o padrão que já produziu os três gates vacuosos. Ordem TD-SYS-19 → TD-SYS-02 confirmada (a avalanche de `no-undef` é real) |
| 4 | Gaps que eu perdi — privacidade de menores? | **Sim, e mais amplo do que a Fase 6 registrou.** (a) a pseudonimização é **migração de chave primária** (TD-DAT-04), não UI; (b) o risco maior não é retenção, é **destruição acidental** (TD-DAT-01/02); (c) os gaps de dados **invalidam ACs já escritos**. **Causa raiz: §0.5** |
| 5 | Ausência de Git = NEEDS WORK automático? | **Não, e a distinção importa.** TD-SYS-04 não invalida a *análise*. Um NEEDS WORK automático confundiria "documento incompleto" com "repositório inseguro" e enfraqueceria o gate. **O NEEDS WORK é motivado exclusivamente pelos gaps de dados.** Mas TD-SYS-04 é **bloqueio absoluto de qualquer alteração de código**, incluindo UX-D07 (Emenda 1) |
| 6 | `StorageAdapter` é suficiente? | **Não sozinho, e ele precisa ser maior do que eu desenhei.** (a) o adapter deve **possuir a política de merge do registro**, senão TD-DAT-01 sobrevive à extração e reaparece em cada call site; (b) as **fixtures são obrigatórias e são o gate**, não um complemento. *"O adapter prova que a I/O é mockável; só as fixtures provam que os dados de 2026 continuam legíveis."* |
| 7 | Endossa a regra de elevação de severidade? | **Endossa as três elevações, mas REFORMULA a regra.** Ver §2.5.1 — a formulação da v1.0 é catraca de sentido único e produz inflação monotônica. **Regra em vigor: prevalece a fase que mediu o modo de falha, para cima ou para baixo** |
| 8 | Incluir mapa débito → artigo? | **Sim, incluir.** Custo marginal quase nulo e é o que torna a Constitution **acionável em vez de decorativa**. Ver §3.1.3 — com TD-DAT-01/02 registrados como a violação mais material do Artigo V |

**🆕 Endosso da regra de veto de UX (Fase 6 §4.4), com quarta cláusula (C9):**

> **Nenhuma story é aceita sem:**
> **(a)** nome acessível em todo interativo novo;
> **(b)** estado transmitido por pelo menos dois canais;
> **(c)** nenhuma animação acima de 3 Hz;
> **(d)** 🆕 **nenhuma story que toque persistência é aceita sem teste de round-trip com fixture legada (T1.5).**

As três cláusulas de Uma impedem que a dívida de **UI** cresça; a quarta impede que a dívida de **dados** cresça — e é a que faltava. **Isto é critério de gate, não recomendação.**

### 4.3 🆕 Estratégia de teste adotada (C6, C7)

**Toolchain (fecha TD-QA-01):** **Vitest + `happy-dom`** para componente; `node --test` ou Vitest puro **sem DOM** para domínio. Justificativa e trade-off em TD-QA-01.

**Definição de pronto de TD-SYS-03 — as 8 invariantes:**

| # | Invariante | Fonte |
|---|---|---|
| I1 | `rankIdx` nunca decresce (`rank: Math.max(p.rank, rankIdx)`) | Fase 1 §8.6 |
| I2 | Divisão gera fatores corretos e sem resto nas 5 fases | Fase 1 §8.6 |
| I3 | `mergeStudyLog` é aditivo e não destrói dias anteriores | Fase 1 §8.3 |
| **I4** 🆕 | **Merge do registro preserva campos desconhecidos (TD-DAT-01)** | Fase 7 — T1.1 |
| I5 | Física: `heat`, `integrity`, `coolant` evoluem independentemente; as 2 condições de derrota disparam corretamente | Fase 1 §8.1 |
| I6 | Pausa: `mode==='pause'` **não** persiste resultado, e retomar devolve a `play` **com o estado intacto** — o comportamento que o teste-regex atual finge cobrir e que o Mutante A prova estar desprotegido | Fase 1 §3.3 |
| I7 | Geração de operações respeita `DIFF[n].range` e `DIFF[n].ops` nas 5 fases | Fase 1 §3.1 |
| I8 | Pontuação e `best[diff]` são monotônicos por fase | L389 |

**Suítes exigidas:**

- **T0 — fecho do UX-D07:** verificação **manual e registrada** (vídeo anexado à story), não automatizada — automatizar frequência de animação é caro e a janela é de 1,75 h. **T0.5 verifica o artefato publicado, não o dev server** (RX-7).
- **T1 — fecho de RX-1** (o primeiro teste automatizado real do projeto): T1.1 preservação de campo desconhecido · T1.2 não-sobrescrita após falha de leitura · T1.3 idem com JSON corrompido · T1.4 sinalização global de erro · T1.5 round-trip com fixture legada · T1.6 `window.storage === undefined` (renderiza, **não lança, não grava**).
- **Fixtures obrigatórias** (fecha o item `create-data-fixtures` da Wave 0, nunca iniciado): (a) operador legado pré-`studyLog`; (b) pré-`stats`; (c) `partidas` com 40 registros no limite do truncamento; (d) blob corrompido; (e) operador com campo futuro desconhecido. **Não são opcionais — são o gate.**
- **T3 — baseline de caracterização (TD-QA-02):** âncoras de não-regressão das 14 forças, **antes da primeira extração** de TD-SYS-06.
- **T4 — a11y:** `axe-core` nas 9 telas (zero violações críticas/sérias, **não** zero absoluto) · 27/27 nomes acessíveis · cor nunca única (**modelo já existe no código: `st.t` em L678 — `ESTÁVEL`/`ATENÇÃO`/`CRÍTICO`/`MELTDOWN` — replicar em `CoreGauge`, `Lamp`, `Support`**) · contraste ≥ 4,5:1 · **resize a 200% sem truncamento** · foco nas 9 transições.
- **T5 — viabilidade de NC-002 (decide TD-DAT-03):** **T5.1** — relatório longitudinal com 60 partidas de baixa pontuação de um operador, num dispositivo com 40 de alta pontuação de outros. **Se o relatório ficar vazio, `matches` está confirmado como fonte errada e o escopo migra para `studyLog`. Este teste roda ANTES da Fase 10.**
- **T6 — gates de regressão contínua:** `eslint-plugin-react-hooks` **obrigatório** (20 `useEffect` num arquivo, com `saveResult` em L653 dependendo só de `[mode]` — exatamente a classe de defeito que `exhaustive-deps` detecta) · `jsx-a11y` sobre o `.tsx` · **ratchet de `@ts-nocheck`**.

### 4.4 @data-engineer — N/A *(revisto)*

**v1.0:** *"Não há perguntas. A Fase 2 foi pulada por ausência de banco de dados."*

**v2.0 — a conclusão permanece, a justificativa muda.** Continua não havendo perguntas para um especialista de **banco de dados**, porque continua não havendo banco. Mas a auditoria de **dados** que a Fase 2/5 teria feito **era necessária e foi feita tarde, pela Fase 7**, ao custo de um ciclo de rework. Ver §0.5 para o achado de processo. Se a Fase 10 quiser um revisor nomeado para a persistência nas próximas rodadas, `@data-engineer` é o dono natural do contrato do `StorageAdapter` e das fixtures — **não porque haja um SGBD, mas porque há um contrato de dados.**

---

## 5. 🆕 Checklist de Aceite — Condições de Saída C1-C10 (Fase 7 → Fase 8)

**Regra do gate:** atendidas C1-C10, o veredito vira **APPROVED sem nova rodada de revisão de UX ou arquitetura.** Nenhuma condição invalida o trabalho das Fases 1, 4 ou 6 — **são incorporações, não retrabalho.**

| # | Condição | Fecha | Status nesta revisão | Onde |
|---|---|---|---|---|
| **C1** | Incorporar **G1-G4** como débitos de primeira classe, com ID próprio, severidade e posição na fila | Gaps críticos de dados | ✅ **ATENDIDA** — TD-DAT-01..04 (+ TD-DAT-05, TD-QA-01, TD-QA-02: os 7 gaps, não só os 4) | §1.5, §3 |
| **C2** | **Reescrever o risco R5** — degradação silenciosa com destruição de dados, não falha total na inicialização | Erro factual da Fase 1 §5.1 | ✅ **ATENDIDA** — R5 reescrito, erro original preservado e assumido; R11 acrescentado | §3.3, TD-DAT-02 |
| **C3** | Corrigir o escopo do **UX-D07**: incluir `rumble` (8,3 Hz) e `grainShift` (3,57 Hz); marcar o passo 2 (`Boom`/`matchMedia`) como **obrigatório** | G8, G9 | ✅ **ATENDIDA** — 4 animações, passo 2 marcado NÃO CORTÁVEL, 1,5 h → 1,75 h | §2.1.1 |
| **C4** | Registrar **RX-1 a RX-8** no registro de riscos | Riscos cruzados | ✅ **ATENDIDA** — tabela dedicada, além de R1-R11 | §3.3.2 |
| **C5** | Congelar a ordem validada (**0a → 0b → 0c → 1…9**) com as três emendas | Dependências | ✅ **ATENDIDA** — ordem congelada e as 3 emendas justificadas item a item | §3.4 |
| **C6** | Critério de saída de TD-SYS-03 = **8 invariantes**, com deleção dos 2 testes de regex, e registro do runner (Vitest + happy-dom) | G5, pergunta 2 | ✅ **ATENDIDA** — I1-I8, deleção normatizada, TD-QA-01 com trade-off registrado | §3.3.1, §4.3 |
| **C7** | Adicionar **baseline de caracterização** como pré-requisito explícito de TD-SYS-06 | RX-2 | ✅ **ATENDIDA** — TD-QA-02 como débito próprio; item 8 da ordem torna-o pré-requisito duro | §1.5, §3.4 |
| **C8** | Sinalizar à Fase 10 que o **escopo de NC-002 depende de T5.1** e que **NC-003 AC-2 está violado pelo código atual** | RX-3 | ✅ **ATENDIDA** — sinalizado em TD-DAT-01, TD-DAT-03, RX-3 e §6 (handoff) | §1.5, §6 |
| **C9** | Incluir o mapa **débito → artigo** e adotar a **regra de veto de UX + 4ª cláusula** como gate | Perguntas 7 e 8 | ✅ **ATENDIDA** — mapa em §3.1.3; regra de veto com 4 cláusulas como critério de gate | §3.1.3, §4.2 |
| **C10** | Corrigir a contagem consolidada e emitir **errata** no `frontend-spec.md` | G10, pedido da Fase 6 | ⚠️ **PARCIAL** — contagem corrigida (36 → 47) e trajetória auditável registrada. **A errata em `docs/frontend/frontend-spec.md` é ação sobre outro artefato e está pendente** — ver §6 | §2.0, §3.1 |

> ⚠️ **Único item em aberto: a errata do `frontend-spec.md` (C10, segunda metade).** Não a escrevi neste ciclo por uma razão de autoridade, não de esforço: `frontend-spec.md` é artefato da **Fase 3, de propriedade do `@ux-design-expert`**, e as quatro correções a registrar são **autocorreções de Uma**. Um arquiteto reescrevendo o achado de outro agente no artefato dele destruiria exatamente a rastreabilidade que a errata existe para criar. **Ação: `@ux-design-expert` emite a errata (≈0,25 h) antes do fecho da Fase 8.** Conteúdo exato já consolidado em §2.0 desta revisão — é transcrição, não novo julgamento.

---

## 6. Decisões Autônomas Registradas

**Da v1.0 (mantidas, com status atualizado):**

- `[AUTO-DECISION]` Regra de dedupe = **mesma evidência física**, não mesma consequência → 8 fusões (razão: fundir por consequência colapsaria débitos com remediações independentes). **Status: mantida e reaplicada** a TD-DAT-04 vs. UX-D24 em §2.5.
- `[AUTO-DECISION]` Elevação de severidade quando a Fase 3 classificou acima da Fase 1 → TD-SYS-05, 08, 18. **Status: as três elevações confirmadas por dois agentes; a REGRA que as gerou foi revogada** — ver §2.5.1.
- `[AUTO-DECISION]` Nenhuma severidade da Fase 3 foi rebaixada. **Status: superada** — a Fase 6 rebaixou seis, com evidência bruta, e estava certa. A minha decisão era correta **para a Fase 4** (rebaixar antes da revisão do especialista inverteria o workflow) e **incorreta como regra permanente**.
- `[AUTO-DECISION]` Esforço em **ordens de grandeza S/M/L/XL**, não em horas (razão: estimativa comprometida pertence à Fase 10). **Status: mantida** para os meus números; as horas que aparecem em §2.1 são de Uma e de Quinn, herdadas **com atribuição**.
- `[AUTO-DECISION]` Três riscos novos (R8, R9, R10). **Status: mantida; R11 acrescentado e R5 reescrito.**
- `[AUTO-DECISION]` A tensão de UX-D07 foi **registrada como pergunta**, não resolvida (razão: decisão de risco sobre criança exige validação multi-agente). **Status: a decisão de não decidir sozinho foi validada pelo resultado** — os dois especialistas convergiram, ampliaram o escopo em duas animações que eu não havia medido e detectaram que a folha de estilo não está montada durante o `Boom`. Decidir sozinho na Fase 4 teria produzido uma correção **incompleta e falsamente tranquilizadora**.
- `[AUTO-DECISION]` Nenhum código, config ou artefato alterado; nenhuma operação Git executada. **Status: mantida nesta revisão** — ver §7.

**🆕 Novas na v2.0:**

- `[AUTO-DECISION]` **Todos os 7 gaps (G1-G7) promovidos a débitos de primeira classe**, não só os 4 críticos/altos de dados que o C1 exigia (razão: TD-DAT-05, TD-QA-01 e TD-QA-02 têm remediação, esforço e critério de pronto próprios; deixá-los como "observações" os faria desaparecer na Fase 10, que planeja a partir de IDs, não de prosa).
- `[AUTO-DECISION]` **G8, G9 e G10 NÃO promovidos a débito** (razão: são correção de escopo, verificação técnica e higiene aritmética. Contá-los inflaria o número que vai à diretoria e diluiria os 47 reais — exatamente o erro de contagem que o G10 aponta, cometido na direção oposta).
- `[AUTO-DECISION]` **Regra de severidade revogada e substituída** por "prevalece a fase que mediu o modo de falha, para cima ou para baixo" (razão: a minha formulação original é catraca de sentido único e produz inflação monotônica; **e ela teria proibido as seis autocorreções de Uma**, produzindo a fila errada. Revogar a própria regra é mais barato agora que na quinta fase de um pipeline).
- `[AUTO-DECISION]` **Segunda classe de prioridade `P0-SAFETY-DATA` criada** (razão: coerência do método — o critério *irreversibilidade × esforço S × dependência zero* qualifica TD-DAT-01/02 pelos mesmos três eixos que qualificam UX-D07. Aplicar o critério a um item e não ao outro seria arbitrário).
- `[AUTO-DECISION]` **Rejeição explícita registrada na matriz** de que UX-D05, UX-D23 e TD-SYS-08 furem a fila (razão: sem essa linha, "P0-SAFETY" vira porta de entrada para qualquer item grave, e a fila perde o significado em duas sprints. A exceção precisa de fronteira escrita para permanecer exceção).
- `[AUTO-DECISION]` **`TD-SYS-09` reconhecido como TERCEIRA RAIZ do grafo**, não débito-folha (razão: é a única raiz que causa **perda** e não apenas **impedimento**; tratá-la como folha em §3.2 da v1.0 foi o erro estrutural que escondeu TD-DAT-01..03).
- `[AUTO-DECISION]` **Duas invariantes de UI acrescentadas** (nº 10: nenhuma animação > 3 Hz no modo padrão; nº 11: nenhuma escrita em `operadores` após falha de leitura) (razão: corrigir um débito sem promovê-lo a invariante permite que ele seja reintroduzido pela próxima refatoração. A correção sem a invariante é dívida com data de retorno).
- `[AUTO-DECISION]` **Vitest + happy-dom endossado como decisão de arquitetura**, não apenas herdado do `@qa` (razão: seleção de toolchain é autoridade do `@architect`; verifiquei a justificativa — Vite 8 já é o build e não há segunda config — e registrei o trade-off de acoplamento em TD-QA-01. Herdar sem verificar seria delegar autoridade de design).
- `[AUTO-DECISION]` **Achado de processo elevado a emenda de workflow** (§0.5): a ausência de SGBD **redireciona** a auditoria de dados, não a cancela (razão: sem a emenda, o próximo projeto sem banco reproduz este gap — e pode não ter um QA que reabra o código).
- `[AUTO-DECISION]` **Cada evidência de código do `@qa` foi reverificada por mim** antes de virar débito (L345-401, 656-679, 725) (razão: a v1.0 falhou por aceitar uma inferência sem ir ao código (§0.5); repetir o padrão na revisão que corrige o padrão seria indefensável. **Todas confirmadas**, e encontrei um agravante próprio: o retorno de `loadAll` é descartado em **dois** call sites, não um).
- `[AUTO-DECISION]` **Errata do `frontend-spec.md` NÃO escrita por mim** (razão: é artefato de propriedade do `@ux-design-expert` e o conteúdo são autocorreções dela; um arquiteto reescrevendo o achado de outro agente destruiria a rastreabilidade que a errata existe para criar. Delegada em §5 e §7, com o conteúdo já consolidado em §2.0 para que seja transcrição, não novo julgamento).
- `[AUTO-DECISION]` Nenhum código, config ou artefato de projeto foi alterado neste ciclo de rework; **nenhuma operação Git executada** (razão: `@architect` analisa e recomenda — Artigo II e a autoridade exclusiva de `@dev`/`@devops`. As três ações liberadas em §7 são **recomendações para `@dev`**, não trabalho meu).

---

## 7. Handoff

### 7.1 ⛔ Liberação imediata de segurança — 3 horas, independente deste gate

O `@qa` autorizou explicitamente três ações **apesar do veredito NEEDS WORK**, e eu as endosso integralmente. **Segurança não espera documento.**

| Item | Ação | Esforço | Executor | Autorizado |
|---|---|---|---|---|
| **0a** | `git init` + `.gitignore` cobrindo `Arquivos_Diversos/`, `usina.zip`, `usina-legacy-backup/`, `dist/` (TD-SYS-04 + TD-SYS-16) | ~0,25 h | **@devops** (autoridade exclusiva de Git/repo) | ✅ **AGORA** |
| **0b** | **UX-D07** — media query + **`matchMedia` no `Boom` (não cortável)** + **`rumble`, `rumbleHard`, `glitch`, `grainShift` ≥ `.34s` por padrão** + verificação T0.1-T0.5 com vídeo | ~1,75 h | **@dev** | ✅ **AGORA**, após 0a |
| **0c** | **Guarda anti-destruição** — (a) não gravar `operadores` se `okStore === false`; (b) `{ ...p, ...campos }` em `saveResult`; (c) `storeErr` global e persistente | ~1 h | **@dev** | ✅ **AGORA**, após 0a |

⚠️ **TD-SYS-16 tem janela única: o `.gitignore` precisa estar correto ANTES do primeiro commit.** Depois disso, o bundle de 910 KB e o `usina.zip` de 263 KB entram no histórico **permanentemente**.

**Três horas que removem o risco de dano físico a uma criança e o risco de destruição do histórico de uma turma.** Não dependem da Fase 8, não dependem do épico e não dependem de nenhum gate.

### 7.2 Fluxo de fases

| Fase | Agente | Ação esperada |
|---|---|---|
| **5 — Revisão de DB** | — | **Pulada.** Sem banco de dados (§0.2). **Consequência documentada em §0.5 — a auditoria de dados que ela teria feito foi executada tarde, pela Fase 7.** |
| **6 — Revisão de UX** | `@ux-design-expert` | ✅ **CONCLUÍDA** — `ux-specialist-review.md`. 🔸 **Pendência residual: errata em `docs/frontend/frontend-spec.md`** registrando as quatro autocorreções (C10, conteúdo em §2.0). ~0,25 h |
| **7 — QA Gate** | `@qa` | ✅ **CONCLUÍDA** — `qa-review.md`, veredito **NEEDS WORK** + liberação de 0a/0b/0c. 🔸 **Re-verificação contra C1-C10 (§5) pendente** |
| **8 — Assessment final** | `@architect` | Congelar a priorização de §3.4 e produzir `technical-debt-assessment.md` **a partir desta v2.0**, após C1-C10 = ✅ e a errata emitida |
| **9 — Relatório executivo** | `@analyst` | `TECHNICAL-DEBT-REPORT.md`. ⚠️ **O número é 47, não 36 nem 40** (§3.1.2). Mensagem executiva central: *o produto está maduro, a rede de segurança é ilusória, e a camada de dados já está perdendo histórico de crianças — 3 horas de trabalho removem os dois riscos irreversíveis* |
| **10 — Épico** | `@pm` | Story de fundação (Git + fronteira `src/` + `StorageAdapter` **com política de merge** + fixtures + gates reais). ⚠️ **Três sinalizações obrigatórias:** (1) **NC-003 AC-2 está violado pelo código atual** — a story-piloto fecha o AC e o defeito no mesmo trabalho; (2) **o escopo de NC-002 depende do resultado de T5.1** e provavelmente migra de `matches` para `studyLog` + o heatmap da L986; (3) **atualizar o bloqueio obsoleto** de NC-001/002/003 (TD-SYS-10). Avaliar também a emenda de §0.5 ao `brownfield-discovery.yaml` |

---

*— Aria, arquitetando o futuro 🏗️*
*Revisão v2.0 da Fase 4 · **47 débitos consolidados** (10 CRITICAL · 14 HIGH · 18 MEDIUM · 5 LOW) · 11 riscos + 8 riscos cruzados · ordem 0a→9 congelada · C1-C10: 9 ✅ / 1 ⚠️ delegada*
*Gaps G1-G7 do `@qa` **reverificados no código** antes da incorporação · duas classes fora da fila · 3 h de correção de segurança liberadas para execução imediata*
