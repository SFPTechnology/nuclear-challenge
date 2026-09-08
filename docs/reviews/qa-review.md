# QA Review - Technical Debt Assessment

**Documento:** `docs/reviews/qa-review.md`
**Fase:** Brownfield Discovery — Fase 7 (`review_assessment`)
**Agente:** @qa (Quinn)
**Data:** 2026-09-07
**Insumos revisados:** `docs/prd/technical-debt-DRAFT.md` (Fase 4) · `docs/reviews/ux-specialist-review.md` (Fase 6) · `docs/architecture/system-architecture.md` (Fase 1)
**Fase 2/5 (database):** pulada — confirmo a ausência de banco. **Mas ver §Gaps: a ausência de banco não removeu a camada de dados, removeu o auditor dela.**

---

## Gate Status: **NEEDS WORK**

Com **uma exceção explícita e autorizada**: o item **UX-D07 (P0-SAFETY) está ENDOSSADO e liberado para execução imediata**, independentemente deste veredito. Segurança física de usuário não fica refém de um gate de documento. Detalhes em §Dependências Validadas.

**Motivo do NEEDS WORK:** o assessment é de alta qualidade em arquitetura, build, governança e UX — e tem uma **lacuna sistemática e concentrada na camada de persistência**, exatamente a região que ficou sem revisor porque a Fase 2/5 foi pulada. Encontrei **quatro defeitos de dados verificados no código**, dois deles com potencial de **destruição irreversível de dados de criança**, que nenhuma das três fases capturou. Dois deles **contradizem diretamente critérios de aceitação já escritos** em NC-002 e NC-003. Um assessment que vá para a Fase 8 sem eles produzirá um épico que planeja stories estruturalmente impossíveis.

### Método desta revisão

Não emiti veredito lendo os documentos. **Executei os quatro gates e reabri o código**, tentando falsificar as alegações das três fases. Os números abaixo são medidos, não citados.

| Verificação | Resultado |
|---|---|
| `npm run lint` | ✅ passa — **saída vazia** |
| `npm run typecheck` | ✅ passa — **saída vazia** |
| `npm test` | ✅ passa — **2/2, 214 ms** |
| `.git/` | ❌ ausente — TD-SYS-04 confirmado |
| `prefers-reduced-motion` / `matchMedia` no app | **0 / 0 ocorrências** — UX-D07 confirmado |
| `.rumbleHard{animation:rumbleHard .09s infinite}` (L665) | **11,1 Hz confirmado** |
| `aria-*` / `role=` / `tabIndex` / `ErrorBoundary` | **3 / 0 / 0 / 0** — UX-D05 e TD-SYS-18 confirmados |
| Linhas do app / `fontSize` numéricos | **1.342 / 100** — UX-D23 confirmado (Uma mediu 93; são 100) |
| `window.storage` call sites | **4** (L348, 352, 365, 373) — confirmado |

**Nota metodológica:** as três fases são internamente honestas e a Fase 6 é exemplar — Uma reabriu o código e rebaixou **cinco dos seus próprios achados**. Isso é o oposto de viés de confirmação e eleva a confiança em tudo que ela sustentou. Meu NEEDS WORK não é uma reprovação do trabalho; é o registro de que **ninguém auditou a persistência**, e é lá que estão os defeitos que sobraram.

### Prova empírica de que o gate de teste não protege (TD-SYS-03)

A Fase 1 afirma que os testes são "frágeis e não-protetores simultaneamente". Isso é uma alegação forte e eu a testei, aplicando as 5 regex reais de `tests/pause-contract.test.mjs` contra dois mutantes sintéticos (nenhum arquivo do projeto foi alterado):

| Mutante | Comportamento real | Gate diz |
|---|---|---|
| **A** — `pauseGame = () => {}`, `resumeGame = () => setMode('lose')`, `PauseButton = () => null`, com as strings exigidas preservadas em comentários mortos | Pausa **100% quebrada**; retomar **perde a partida** | ✅ **PASSA** |
| **B** — implementação correta, apenas com `pauseGame` reformatado em 3 linhas | **Perfeito** | ❌ **FALHA** |

**Confirmado com evidência executável:** o gate aprova a destruição total do recurso e reprova a formatação correta dele. A Fase 1 estava certa e o §4.2 do DRAFT estava certo ao me proibir de emitir PASS com base nos quatro comandos. **Emitir APPROVED aqui apenas porque `npm test` retorna verde seria, literalmente, o risco R1 se materializando na minha própria assinatura.**

---

## Gaps Identificados

### G1 (CRÍTICO) — `saveResult` reconstrói o operador por whitelist e apaga todo campo desconhecido

**Evidência — `nuclear-challenge-app.tsx` L384-401:**

```js
const p = players[player] || { best: {}, games: 0, ops: 0, hits: 0, streak: 0, rank: 0, wins: 0 };
const up = {
  best: {...}, games: ..., ops: ..., hits: ..., streak: ..., rank: ..., wins: ...,
  stats: mergeStats(p.stats, sess.current),
  studyLog: mergeStudyLog(p.studyLog, sess.current.daily)
};
await persist({ ...players, [player]: up });
```

`up` é um **objeto literal novo**, não um spread de `p`. Todo campo do registro persistido que não esteja nessas 9 chaves é **silenciosamente destruído na primeira partida salva**.

**Por que é grave, e por que ninguém viu:** a Fase 1 elogiou `mergeStudyLog` como retrocompatibilidade correta (§8.3) — e ela é. Mas a retrocompatibilidade é **campo a campo, não do registro**. O registro inteiro é reescrito por whitelist.

**Consequência direta e verificável sobre stories já escritas:**
- **NC-003 AC-2** — *"Dados legados recebem fallback explícito e não são apagados"*: hoje, qualquer campo de fase adicionado por uma versão futura é apagado ao final da próxima partida. O AC é violado **pelo código atual**, não por uma implementação futura ruim.
- **NC-002 AC-4** — *"Dados legados são lidos sem perda"*: idem.

Este é o defeito mais consequente que encontrei. Ele não está entre os 36 e é **pré-requisito de duas das três stories bloqueadas**.

### G2 (CRÍTICO) — Falha de leitura de `window.storage` é silenciosa e leva à sobrescrita destrutiva do blob inteiro

**Evidência — L345-358 e L362-369:**

```js
const loadAll = useCallback(async () => {
  let okStore = true;
  try { const r = await window.storage.get('operadores', true); if (r && r.value) setPlayers(JSON.parse(r.value)); }
  catch (e) { okStore = false; }        // <- capturado
  ...
  return okStore;                        // <- retornado
}, []);
useEffect(() => { loadAll(); }, [loadAll]);   // <- E DESCARTADO
```

`storeErr` (o único sinal de erro da UI) é setado **apenas em falha de escrita** (L366, L375), nunca em falha de leitura.

**Cadeia de falha verificada:** leitura falha (ou retorna JSON corrompido) → exceção capturada → `players` permanece `{}` → a tela de login mostra **"Nenhum operador cadastrado"** (L709), indistinguível de um dispositivo novo → a criança recadastra o nome → `persist({ ...players, [n]: {...} })` grava **`{ n: ... }` por cima do blob `operadores` inteiro** → **o histórico de toda a turma é destruído, sem aviso, sem log, sem rollback (não há Git) e sem backup.**

**Correção de fato na Fase 1 e no DRAFT:** o risco **R5** está descrito como *"Falha total na inicialização se o host não prover `window.storage`"* e a Fase 1 afirma *"Se `window.storage` for `undefined`, a leitura inicial lança"* (§5.1). **Isso é factualmente incorreto** — há `try/catch`. O modo de falha real não é uma tela morta (visível, diagnosticável, sem perda), é **degradação silenciosa seguida de destruição de dados** (invisível, não diagnosticável, com perda). O risco foi descrito no modo de falha **mais benigno** que o real. R5 precisa ser reescrito.

### G3 (ALTO) — `partidas` é um top-40 global por pontuação, não um histórico — NC-002 AC-2 é infactível como escrito

**Evidência — L401:** `persistMatches([...matches, rec].sort((a, b) => b.pts - a.pts).slice(0, 40));`

`partidas` é uma **tabela de recordes**: ordenada por pontos, truncada em 40, **compartilhada por todos os operadores do dispositivo**.

**NC-002 escopo:** *"Usar dados existentes em `stats` e `matches`"* · **AC-2:** *"Não exige coleta de dados além de `stats` e `matches` sem story adicional"* · **Escopo:** *"evolução da taxa de acerto... tempo de prática"*.

Isso não é derivável de `matches`:
- **Não é longitudinal** — ordenado por pontos, não por `ts`. "Evolução ao longo do tempo" não existe nessa estrutura.
- **É enviesado por sobrevivência** — só as 40 melhores partidas do dispositivo sobrevivem. **A criança que mais precisa de acompanhamento é exatamente a que tem zero registros retidos**, porque suas partidas são as de menor pontuação. O relatório para o responsável falharia precisamente no aluno para quem ele existe.
- **É multi-operador** — 40 slots divididos por toda a turma.

O dado longitudinal correto **existe** (é o `studyLog` por dia, com `mergeStudyLog`), mas o escopo da NC-002 aponta para `matches`. **A story está escrita contra a estrutura de dados errada.** Isso é gap de assessment: nenhuma fase confrontou os ACs das stories contra o formato real dos dados persistidos.

### G4 (ALTO) — O nome da criança é a chave primária: UX-D24 não é débito de UI

**Evidência — L378-380:** `const n = nameInput.trim().slice(0, 14); if (!players[n]) await persist({ ...players, [n]: {...} })`. O operador é indexado **pelo nome** em `players`, e `rec.n = player` em `partidas`.

Uma classificou UX-D24 como **P2-UX, 8 h, "de UI, não de banco"** (§3). **Discordo em parte, e a parte importa:**

| Sub-item | Uma | Meu veredito |
|---|---|---|
| Fluxo de exclusão de operador (4 h) | UI | ✅ **Concordo** — é UI |
| Apelido/inicial no ranking (4 h) | UI | ❌ **Não** — é **migração de chave primária** |

Pseudonimizar exige introduzir um `id` estável, migrar `operadores` e `partidas`, e manter retrocompatibilidade com registros indexados por nome — ou seja, **depende de TD-SYS-09 (`StorageAdapter`) e cai exatamente no mesmo mecanismo de retrocompatibilidade da NC-003 (G1)**. A estimativa de 4 h para essa metade está subdimensionada e o item está no lugar errado da fila: ele não pode ser feito antes do adaptador.

**Nota sobre a exclusão (LGPD art. 18, V):** ela é de fato UI e barata. Mas com G1 e G2 no lugar, o produto hoje **apaga dado de criança por acidente e não consegue apagá-lo de propósito** — a pior combinação possível dos dois lados.

### G5 (ALTO) — TD-SYS-03 não tem caminho de execução: não existe toolchain capaz de testar comportamento

`package.json` tem exatamente `"test": "node --test tests/*.test.mjs"`. **Não há** `vitest`, `jest`, `jsdom`, `happy-dom`, `@testing-library/*`, nem ferramenta de cobertura. O DRAFT marca TD-SYS-03 como esforço **L** e a pergunta 4.2.2 pede o critério de saída — mas **o débito não é só "escrever testes", é "não existe com o que escrevê-los"**. Enquanto o domínio não for extraído (TD-SYS-07), `node --test` cobre funções puras e nada mais; para qualquer teste de componente, falta a decisão de runner, e ela ainda não foi tomada por ninguém. Isso precisa ser um item explícito, senão a story de fundação começa por uma decisão não tomada.

### G6 (ALTO) — Não existe baseline de caracterização para o Gold Standard

A Fase 1 §8 lista 10 forças "inegociáveis" e a Fase 6 acrescenta 4. **Nenhuma delas está pinada por um teste.** "Não regredir" é hoje uma afirmação de documento, não uma asserção executável. TD-SYS-06 (quebra do monolito, XL) é a maior operação de risco do plano inteiro e está agendada **sem rede de caracterização**. O DRAFT trata isso como consequência de TD-SYS-03; eu trato como item próprio, porque tem um critério de pronto diferente: TD-SYS-03 pergunta "os testes têm valor?", G6 pergunta "o que exatamente eu não posso quebrar amanhã?".

### G7 (MÉDIO) — `storeErr` só é renderizado na tela de login: falha de gravação no fim da partida é invisível

`storeErr` aparece em L283 (state), L366/L375 (set) e **L725 (render) — e só**. L725 está dentro de `if (mode === 'login')`. Uma falha de escrita em `saveResult` (fim de partida) seta a flag e **não exibe absolutamente nada**: a criança vê o resumo normal e acredita que o progresso foi salvo. O aviso só aparecerá na próxima ida ao login. Isso agrava G2 e é a face de runtime de TD-SYS-18.

### G8 (correção de escopo do P0-SAFETY) — a remediação do UX-D07 deixa duas animações acima de 3 Hz de fora

Medi **todas** as animações do bloco `css` (L657-673) e as inline:

| Animação | Duração | Frequência | Gatilho | Coberta pelo passo 3 da Uma? |
|---|---|---|---|---|
| `rumbleHard` (L665, aplicada em L679 ao `.nc-viewport`) | `.09s` | **11,1 Hz** | `heat >= 90` | ✅ sim |
| `glitch` (L45) | `.09s` | **11,1 Hz** | `band === 4` | ✅ sim |
| **`rumble` (L665, `.12s`, aplicada em L679 ao `.nc-viewport`)** | `.12s` | **8,3 Hz** | **`heat > 72`** | ❌ **NÃO** |
| **`grainShift` (L42, `.28s`)** | `.28s` | **3,57 Hz** | `g > .05` | ❌ **NÃO** |
| `warnPulse` (L51) · `vigPulse` (L40) · `lampPulse` (L96) | `.5s`/`1.4s`/`1.1s` | 2 / 0,7 / 0,9 Hz | — | ➖ abaixo do limiar |

O passo 3 da Uma (§2.1) nomeia apenas *"`glitch`/`rumbleHard`"*. Mas `.rumble` **também translada o viewport inteiro**, a 8,3 Hz, e dispara em `heat > 72` — uma **faixa muito mais larga e muito mais frequentemente atingida** do que `heat >= 90`. Em tempo de exposição acumulado, `.rumble` é provavelmente o **maior** contribuinte de risco vestibular do produto, não o menor. `grainShift` a 3,57 Hz também cruza o limiar.

O passo 1 (media query com `.rumble,.rumbleHard{animation:none!important}`) cobre ambos **sob `prefers-reduced-motion`** — mas o argumento decisivo da própria Uma é que quase ninguém no público-alvo tem essa flag ativa. Logo, **a lacuna está exatamente onde o raciocínio dela é mais forte.**

**Correção de escopo requerida (não altera a prioridade nem a ordem de grandeza):** o passo 3 deve cobrir `rumble`, `rumbleHard`, `glitch` **e** `grainShift`. Custo marginal ≈ 0,25 h. Total revisado do UX-D07: **~1,75 h**.

### G9 (verificação técnica) — o mecanismo de correção do UX-D07 está confirmado, com uma ressalva

Verifiquei as três premissas técnicas de Uma:

1. ✅ `{css}` é renderizado nas 6 raízes de tela (L685, 738, 965, 1137, 1188, 1232) e **L1232 é a tela `play`, que carrega `shakeCls`** — a media query alcança o alvo.
2. ✅ `!important` em folha de autor vence declaração inline sem `!important`. As `animation:` inline de L40/42/45/51 são neutralizadas. Correto.
3. ⚠️ **Ressalva:** `if (boom) return <Boom .../>` está em **L676 — antes de qualquer `{css}`**. Durante o `Boom`, **a folha de estilo não está montada** e nenhuma media query dela se aplica. Confirmo o flash branco de tela cheia em L179 (`{step < 1 && <div className="absolute inset-0 bg-white" />}`) mais 50 partículas por 4 s.
   **Consequência:** o **passo 2 da remediação (guarda em JS via `matchMedia` no `Boom`) é obrigatório e não pode ser cortado do escopo.** Se alguém entregar só a media query achando que cobre tudo, a tela de meltdown — o momento de maior estímulo do produto — fica **integralmente desprotegida**.

### G10 (higiene de artefato) — inconsistência aritmética que propagaria para as Fases 8/9

A tabela §1.1 da Fase 6 tem **17 linhas**, com distribuição **2 CRÍTICA · 5 ALTA · 7 MÉDIA · 3 BAIXA**. O rodapé declara *"2 CRÍTICA · 4 ALTA · 6 MÉDIA · 3 BAIXA = 15 débitos · 159,5 horas"* (soma real das horas da tabela: **160,5 h**). Não é erro de julgamento e não muda nenhuma prioridade — mas o total consolidado **não é 36**, e é esse número que o `TECHNICAL-DEBT-REPORT.md` da Fase 9 vai levar para a diretoria. Recontagem em §Parecer Final.

### Áreas não analisadas por nenhuma fase (registro, não acusação)

| Área | Status | Avaliação |
|---|---|---|
| **Contrato de dados persistidos** | ❌ não auditado por ninguém | Origem de G1, G2, G3, G4. **Causa: Fase 2/5 pulada.** Ver §Parecer |
| **ACs das stories vs. dados reais** | ❌ nunca confrontados | Origem de G3 |
| **Toolchain de teste** | ❌ não avaliado | G5 |
| Segurança de dependências (`npm audit`, supply chain) | ❌ não avaliado | Baixo risco: 4 deps de runtime, zero rede. Registrar, não priorizar |
| Licenciamento de terceiros | ❌ não avaliado | Produto educacional distribuído; ruído nesta rodada |
| i18n / conteúdo | ➖ N/A | pt-BR é invariante deliberado |
| Backup / retenção de dados do host | ❌ não avaliado | **Relevante:** G2 destrói dados e não há backup. Ver Testes |

---

## Riscos Cruzados

Riscos que **só existem na interseção** de duas ou mais áreas — nenhum deles é visível a partir de uma única fase.

| Risco | Áreas Afetadas | Mitigação |
|---|---|---|
| **RX-1 (CRÍTICO) — Destruição irreversível de dados de criança sem rollback.** G2 apaga o blob de operadores por acidente; TD-SYS-04 garante que não há como reverter; TD-SYS-18/G7 garantem que ninguém fica sabendo; UX-D24 garante que não há cópia nem exportação. Quatro débitos "médios" isolados compõem uma **perda total e silenciosa**. | Dados + Governança + Observabilidade + Privacidade (G2, G7, TD-SYS-04, TD-SYS-18, UX-D24) | **Fura a fila junto com UX-D07.** Guarda mínima antes de qualquer refatoração: nunca gravar `operadores` se a leitura inicial falhou (`okStore === false`); banner de erro persistente e global, não só no login. Custo ≈ 1 h |
| **RX-2 (CRÍTICO) — A refatoração do monolito destrói dados e nenhum gate percebe.** TD-SYS-06 (XL) é executada sem caracterização (G6), sob typecheck cego (TD-SYS-01), lint que não alcança o arquivo (TD-SYS-02) e testes de regex (TD-SYS-03). O merge de registros (G1) é a parte mais frágil e a menos visível. | Arquitetura + Testes + Qualidade + Dados (TD-SYS-01/02/03/06, G1, G6) | Round-trip de persistência com fixture legada **antes** da primeira linha de refatoração. É o critério de saída de TD-SYS-03 (ver §Testes) |
| **RX-3 (ALTO) — Épico planeja stories estruturalmente impossíveis.** G3 torna NC-002 AC-2 infactível e G1 torna NC-003 AC-2 falso já hoje. Somado a TD-SYS-10 (bloqueio com motivo obsoleto), a Fase 10 produziria um épico com escopo irreal e a equipe descobriria no meio da implementação. | Governança + Dados + Produto (G1, G3, TD-SYS-10) | Fase 8 reescreve o escopo da NC-002 para `studyLog`; NC-003 ganha o merge não-destrutivo como pré-requisito explícito |
| **RX-4 (ALTO) — Exclusão contamina a métrica pedagógica.** UX-D06 (cor como canal único) + UX-D23 (texto que não escala) fazem a criança daltônica ou com baixa visão **errar por causa da interface**. Esse erro é gravado em `stats` como erro de matemática, e NC-002/NC-003 o reportam ao professor como déficit de aprendizagem. | A11y + Dados + Produto (UX-D06, UX-D23, NC-002, NC-003) | Endosso integral o argumento de Uma (§2.5): não é só exclusão, é **dado inválido**. Itens 6 e 8 da Parada 1 são pré-requisito de confiabilidade da métrica, não só de conformidade |
| **RX-5 (ALTO) — Fadiga de quadros agrava o risco fotossensível.** UX-D18 (sem medição) + TD-SYS-12 (bundle de 910 KB) + as 4 animações simultâneas em `heat >= 90` (G8). Uma já registrou: animação a 11 Hz com quadros perdidos produz padrão temporal **irregular**, mais provocativo que o regular. Em Chromebook de entrada isso é o cenário provável, não o pessimista. | Performance + A11y + Segurança (UX-D07, UX-D18, TD-SYS-12) | Reforça G8: baixar a frequência **por padrão** remove a dependência do desempenho. A correção de segurança não deve depender de o dispositivo conseguir 60 fps |
| **RX-6 (MÉDIO) — Correção de a11y quebra a UI em silêncio.** A Parada 1 de a11y toca a UI extensivamente; TD-SYS-08 faz qualquer utility Tailwind nova falhar sem erro em nenhum gate; UX-D22 esconde o CSS de toda ferramenta de auditoria. | A11y + Build + UI (UX-D05, TD-SYS-08, UX-D22) | Regra dura: **a Parada 1 de a11y não começa antes de TD-SYS-08 resolvido**, ou toda correção usa exclusivamente `style` inline lendo dos tokens (§2.2 da Fase 6) |
| **RX-7 (MÉDIO) — Publicação da cópia errada anula qualquer correção.** Quatro cópias divergentes (TD-SYS-14), sem CI (TD-SYS-21), servidor local que serve módulos ES como `octet-stream` (TD-SYS-15). Aplica-se **inclusive à correção de segurança do UX-D07**: ela pode ser feita corretamente e nunca chegar à sala de aula. | Deploy + Ferramental + Segurança (TD-SYS-14/15/21, UX-D07) | Verificação de publicação obrigatória no fecho do UX-D07 (ver §Testes, T0.5) |
| **RX-8 (BAIXO/CRÍTICO se ocorrer) — Exfiltração via `SUPABASE_SERVICE_ROLE_KEY`.** G3 cria pressão legítima por backend ("os dados longitudinais não cabem no top-40"); o `.env` já oferece o trilho pronto; sem CI ninguém revisa. Probabilidade baixa hoje, **crescente** conforme NC-002 avança. | Segurança + Dados + DevOps (TD-SYS-17, G3, TD-SYS-21) | Remover as 3 chaves Supabase e as demais não consumidas do `.env`/`.env.example` (S, ~0,25 h). Verificado: estão **vazias** — sem vazamento presente. É trilho, não incêndio |

---

## Dependências Validadas

**Veredito geral sobre o sequenciamento:** o grafo de causalidade do §3.2 do DRAFT está **correto** e as duas divergências da Fase 6 estão **certas**. Endosso a ordem com **três emendas**.

### ✅ Endossado — UX-D07 fora da fila (P0-SAFETY)

**Endosso integral**, e o argumento decisivo é o **técnico**, não o moral. Verifiquei em G9 que a correção vive num bloco `<style>` que já existe, não toca Tailwind (é CSS puro), não atravessa a fronteira de `src/`, não precisa de tokens e não precisa que o monolito seja quebrado. **A fila ordena dependências técnicas; este item não tem nenhuma.** Não é exceção ao método — é o método aplicado corretamente.

O argumento da assimetria (1,75 h × convulsão fotoconvulsiva ou crise vestibular em criança de 8 anos) é suficiente por si só, mas eu não precisaria dele: mesmo com prioridade puramente técnica, **um item com dependência zero e esforço S não tem razão para esperar**.

**Duas emendas obrigatórias ao escopo:**
1. **Incluir `rumble` (8,3 Hz, `heat > 72`) e `grainShift` (3,57 Hz)** no passo 3 (G8). Sem isso, a janela de exposição mais longa fica descoberta. +0,25 h.
2. **O passo 2 (`matchMedia` no `Boom`) é obrigatório** — a folha de estilo não está montada durante o `Boom` (G9). Não pode ser cortado por escopo.

### ⚠️ Emenda 1 — Git antes do UX-D07 (divergência de ~15 minutos)

Uma sustenta que a guarda pode preceder TD-SYS-04 porque é "puramente aditiva e trivialmente reversível por deleção" (§2.1, ponto 4). **Concordo quanto ao passo 1. Discordo quanto ao passo 3.**

Reduzir `rumble`/`rumbleHard`/`glitch`/`grainShift` **no modo padrão** não é aditivo: **altera o comportamento visual do produto para todos os usuários** e toca uma força declarada do Gold Standard (Fase 1 §8.4, "linguagem visual industrial"). É uma mudança de acabamento com julgamento estético embutido, feita num arquivo de 1.342 linhas, sob os três gates cegos. É exatamente a classe de mudança que precisa de reversão.

**Ruling:** `git init` + `.gitignore` corrigido (TD-SYS-16) **primeiro** — é S, ~15 minutos, e TD-SYS-16 tem janela única antes do primeiro commit. **Depois, imediatamente, UX-D07**, ainda antes de TD-SYS-05/02/03/01, como Uma pediu. Isto não é uma objeção ao parecer dela: é a alternativa que ela mesma ofereceu, e o custo de adotá-la é **quinze minutos**. Não gasto autoridade de gate para economizar quinze minutos num item de segurança.

### ⚠️ Emenda 2 — RX-1 (guarda anti-destruição) entra junto, como P0-SAFETY-DATA

**Resposta direta à pergunta 4.2.1 do @architect** (*"existe alguma classe de débito que deve furar a fila?"*): **sim, e são exatamente duas classes, não uma.**

| Classe | Critério | Itens |
|---|---|---|
| **Dano físico ao usuário** | irreversível, esforço S, dependência arquitetural zero | UX-D07 |
| **Destruição irreversível de dado do usuário** | irreversível, esforço S, dependência arquitetural zero | **G1 + G2 (guarda mínima)** |

O critério que unifica as duas é **irreversibilidade combinada com custo trivial e dependência nula** — não é "segurança" nem "dados". Uma perda do histórico de uma turma inteira é tão irrecuperável quanto o dano físico e, ao contrário dele, **provavelmente já está acontecendo sem ninguém saber**, porque G7 garante que é silenciosa.

A guarda mínima (≈1 h) é aditiva e não depende de nada: (a) não gravar `operadores` quando `okStore === false`; (b) preservar campos desconhecidos em `saveResult` — trocar o literal por `{ ...p, ...campos }`; (c) tornar `storeErr` global em vez de restrito ao login. **Nenhuma delas exige `StorageAdapter`, extração de domínio ou quebra do monolito.** A solução definitiva (contrato + fixtures + testes) permanece em P1, no lugar certo.

**Nada além dessas duas classes fura a fila.** Rejeito explicitamente qualquer tentativa de promover UX-D05, UX-D23 ou TD-SYS-08 por esse caminho: são graves, são P1, e têm dependências reais.

### ✅ Endossado — tokens (UX-D02 + UX-D23) antes da quebra do monolito

O argumento de Uma (§2.2) é logicamente correto e eu o reforço por um ângulo de teste: a substituição de literais por tokens é uma **transformação mecânica e verificável por varredura** (`grep` por `#[0-9a-f]{6}` deve tender a zero). Feita depois do fatiamento, a mesma varredura passa a ter 18 alvos sem garantia de completude — **o critério de pronto deixa de existir**. Tokens antes é a ordem que preserva a verificabilidade. `tokens.ts` é módulo folha e pode ser criado hoje.

### ✅ Endossado — NC-003 como story-piloto

Concordo, e acrescento a razão de QA que fecha o caso: NC-003 é a única das três que **exercita G1 de frente** — o AC "dados legados recebem fallback explícito e não são apagados" é precisamente o defeito que encontrei. A story-piloto valida a fundação **e** fecha o gap crítico no mesmo trabalho. É a escolha certa por um motivo a mais do que Uma sabia.

### ⚠️ Emenda 3 — reordenar UX-D24 (privacidade)

Uma coloca UX-D24 no item 10 (depois da quebra do monolito). **Divirjo em duas direções:**
- **Exclusão de operador (4 h): antecipar para logo após o `StorageAdapter` (item 5).** É UI simples, é o direito de eliminação da LGPD (art. 18, V), e mitiga parcialmente RX-1 dando ao usuário controle explícito sobre o dado.
- **Pseudonimização (4 h → reestimar): manter tarde, mas reclassificar.** Por G4 é migração de chave primária, não mudança de UI. **Depende de TD-SYS-09** e compartilha mecanismo com NC-003. Não pode ser tratada como item de UI de 4 h.

### Ordem final validada

| # | Ação | Depende de | Status |
|---|---|---|---|
| **0a** | `git init` + `.gitignore` cobrindo `Arquivos_Diversos/` (TD-SYS-04 + TD-SYS-16) | — | ⚠️ **Emenda 1** — antecipado (~15 min) |
| **0b** | **UX-D07 P0-SAFETY** — media query + `matchMedia` no `Boom` + **4 animações < 3 Hz por padrão** (~1,75 h) | 0a | ✅ **ENDOSSADO** — liberado apesar do NEEDS WORK |
| **0c** | **RX-1 guarda anti-destruição** — G1 + G2 + `storeErr` global (~1 h) | 0a | ⚠️ **Emenda 2** — novo P0-SAFETY-DATA |
| 1 | UX-D02 tokens + UX-D23 `rem` | 0a | ✅ endossado (Fase 6) |
| 2 | TD-SYS-05 fronteira `src/` + TD-SYS-11 `vite.config` | 1 | ✅ endossado |
| 3 | TD-SYS-19 `globals` → TD-SYS-02 lint → TD-SYS-03 testes → TD-SYS-01 typecheck **(nesta ordem)** | 2 | ✅ endossado |
| 4 | TD-SYS-09 `StorageAdapter` (**incluindo o merge não-destrutivo de G1**) + fixtures + TD-SYS-07 domínio | 3 | ✅ endossado, escopo ampliado |
| 5 | **NC-003 piloto** + `MetricBadge` · **exclusão de operador (UX-D24a)** | 4 | ✅ + ⚠️ Emenda 3 |
| 6 | A11y Parada 1 (UX-D05, D19, D06, D14) — **após TD-SYS-08** (RX-6) | 1, 2 | ✅ endossado |
| 7 | UX-D10 `EmptyState` + TD-SYS-18 `ErrorBoundary` | 1 | ✅ endossado |
| 8 | TD-SYS-06 quebra do monolito — **só depois de 3 e 4** (RX-2) | 1, 3, 4 | ✅ endossado |
| 9 | UX-D24b pseudonimização · UX-D11 refluxo · P3 | 4, 8 | ⚠️ Emenda 3 |

---

## Testes Requeridos

Todos os testes abaixo são **comportamentais**. Nenhum pode ser satisfeito por `assert.match` sobre texto-fonte — provei em §Gate Status que essa técnica aprova a destruição do recurso e reprova a formatação correta dele. **Regex sobre código-fonte fica proibida como evidência de comportamento** a partir deste gate.

### Decisão de ferramental (fecha G5)

`[AUTO-DECISION]` **Runner: Vitest.** Motivo: é o único que reusa a resolução de módulos do Vite 8 sem uma segunda configuração de build (o projeto nem tem a primeira — TD-SYS-11), roda `.tsx` nativamente, traz cobertura embutida e permite manter `node --test` durante a transição. Alternativa rejeitada: Jest (exigiria transform próprio e duplicaria a config). **Ambiente: `happy-dom`** para componente. **Camada de domínio: `node --test` ou Vitest puro, sem DOM** — o teste de regra de negócio não deve montar árvore React.

### T0 — Fecho do P0-SAFETY (UX-D07) — verificação **manual e registrada**, não automatizada

Não peço teste automatizado aqui: automatizar frequência de animação é caro e a janela é de 1,75 h. Peço **evidência registrada**, com o resultado anexado à story.

| # | Verificação | Critério de aprovação |
|---|---|---|
| T0.1 | Inspeção do CSS publicado: nenhuma `animation-duration` < `.34s` em `rumble`, `rumbleHard`, `glitch`, `grainShift` | 4/4 ≥ `.34s` (< 3 Hz) **no modo padrão** |
| T0.2 | Percorrer as 5 fases com `heat > 72` e `heat >= 90`; gravar vídeo | Nenhuma oscilação de viewport acima de 3 Hz |
| T0.3 | Provocar `Boom` com `prefers-reduced-motion: reduce` ativo (DevTools → Rendering) | Flash branco suprimido; partículas estáticas; **`onDone(4000)` preservado e a máquina de estados chega a `lose`** |
| T0.4 | Repetir T0.2/T0.3 **sem** a preferência ativa | Comportamento seguro **por padrão** — é o ponto do passo 3 |
| T0.5 | **Verificar o artefato publicado, não o dev server** (RX-7) | Hash do CSS/JS servido == hash do build; se `.local-dist-server.cjs` for usado, corrigir os MIME antes (TD-SYS-15) ou usar `vite preview` |

### T1 — Fecho de RX-1 (G1 + G2) — **o primeiro teste automatizado real do projeto**

Rodam contra o duplo em memória do `StorageAdapter`; a guarda de 0c pode ser verificada manualmente antes disso.

| # | Teste | Asserção |
|---|---|---|
| T1.1 | **Preservação de campo desconhecido (G1)** — carregar operador com `{ ...campos conhecidos, campoFuturoX: 42 }`, salvar uma partida | `campoFuturoX === 42` **após** o save. É o AC-2 da NC-003 em forma executável |
| T1.2 | **Não-sobrescrita após falha de leitura (G2)** — adapter cujo `get('operadores')` rejeita; criar novo operador | **Nenhuma chamada a `set('operadores')`**. Este é o teste que impede a destruição do histórico da turma |
| T1.3 | **Não-sobrescrita com JSON corrompido** — `get` retorna `{ value: '{{{' }` | Idem T1.2 + estado de erro sinalizado |
| T1.4 | **Sinalização global de erro (G7)** — `set` rejeita ao fim da partida | Erro visível na tela de resultado, não só no login |
| T1.5 | **Round-trip com fixture legada** — operador sem `studyLog` e sem `stats` (formato documentado em `estrutura-acompanhamento.md`) | Carrega, joga, salva, recarrega: **zero perda de campo**; `mergeStudyLog` cria a estrutura sem destruir a anterior |
| T1.6 | **`window.storage` ausente** — `window.storage === undefined` | App renderiza login com aviso explícito; **não lança**; **não grava** |

**Fixtures obrigatórias** (fecha o item `create-data-fixtures` da Wave 0, nunca iniciado): (a) operador legado pré-`studyLog`; (b) operador legado pré-`stats`; (c) `partidas` com 40 registros no limite do truncamento; (d) blob corrompido; (e) operador com campo futuro desconhecido. **Resposta à pergunta 4.2.6: as fixtures não são opcionais — são o gate.** O `StorageAdapter` sozinho prova que a I/O é mockável; só as fixtures provam que os dados de 2026 ainda são legíveis.

### T2 — Critério mínimo de saída do TD-SYS-03 (**resposta à pergunta 4.2.2**)

**Escolho (b) — cobertura das invariantes — e rejeito explicitamente (c) percentual.** Motivo: percentual de cobertura sobre um monolito de 1.070 linhas mede quanto código foi *executado*, não quanto comportamento foi *verificado*. Neste projeto essa métrica seria a terceira ilusão de conformidade, e eu já reprovei duas hoje.

A opção (a) — "primeiro teste comportamental" — é insuficiente como critério de saída: é um bom primeiro marco, não um gate.

**Definição de pronto de TD-SYS-03 — as 8 invariantes abaixo cobertas por teste comportamental executável:**

| # | Invariante | Fonte |
|---|---|---|
| I1 | `rankIdx` nunca decresce (`rank: Math.max(p.rank, rankIdx)`) | Fase 1 §8.6 |
| I2 | Divisão gera fatores corretos e sem resto nas 5 fases | Fase 1 §8.6 |
| I3 | `mergeStudyLog` é aditivo e não destrói dias anteriores | Fase 1 §8.3 |
| I4 | **Merge do registro preserva campos desconhecidos (G1)** | **Novo — T1.1** |
| I5 | Física: `heat`, `integrity`, `coolant` evoluem independentemente; as 2 condições de derrota disparam corretamente | Fase 1 §8.1 |
| I6 | Pausa: `mode==='pause'` **não** persiste resultado, e retomar devolve a `play` **com o estado intacto** — o comportamento que o teste-regex atual finge cobrir e que o Mutante A prova estar desprotegido | Fase 1 §3.3 |
| I7 | Geração de operações respeita `DIFF[n].range` e `DIFF[n].ops` nas 5 fases | Fase 1 §3.1 |
| I8 | Pontuação e `best[diff]` são monotônicos por fase | L389 |

**Os 2 testes de regex atuais são DELETADOS** ao entrar I6. Mantê-los é preservar um falso positivo — e, pelo Mutante B, um falso negativo que penalizará a primeira reformatação do arquivo.

### T3 — Baseline de caracterização antes de TD-SYS-06 (fecha G6, mitiga RX-2)

Antes da primeira extração do monolito, congelar snapshots das 14 forças do Gold Standard (Fase 1 §8 + Fase 6 §4.3). Não são testes de qualidade — são **âncoras de não-regressão**: mesma entrada, mesma saída, antes e depois do fatiamento. Mínimo: as 9 telas de `mode` renderizam sem lançar; `AudioContext` só é criado sob gesto; zero `localStorage`/`sessionStorage`; zero chamadas de rede; `lang="pt-BR"` preservado.

### T4 — Fecho da a11y (Parada 1) e de UX-D23

| # | Verificação | Critério |
|---|---|---|
| T4.1 | Automatizado (`axe-core` sobre as 9 telas) | Zero violações **críticas/sérias** dos critérios da Parada 1. Não exigir zero absoluto |
| T4.2 | Nome acessível | 27/27 botões |
| T4.3 | Cor não é canal único | Toda faixa de estado tem ícone **ou** rótulo textual. **Modelo já existe no código: `st.t` em L678 (`ESTÁVEL`/`ATENÇÃO`/`CRÍTICO`/`MELTDOWN`) — replicar em `CoreGauge`, `Lamp`, `Support`** |
| T4.4 | Contraste | `#6b7280` e `#ef4444` corrigidos; ≥ 4,5:1 nos 6 fundos reais medidos por Uma (§1.3) |
| T4.5 | **Resize (UX-D23)** | Fonte do navegador a 200%: nenhum texto truncado ou sobreposto nas 9 telas. **É o teste que expõe a interação com `zoom:var(--nc-scale)`** |
| T4.6 | Teclado | As 9 transições de `mode` movem o foco; nenhuma armadilha de foco |

### T5 — Fecho da viabilidade de NC-002 (fecha G3, mitiga RX-3)

| # | Teste | Asserção |
|---|---|---|
| T5.1 | **Relatório longitudinal com 60 partidas de baixa pontuação** de um operador, num dispositivo com 40 partidas de alta pontuação de outros | O relatório **não fica vazio**. Se ficar, `matches` está confirmado como fonte errada e o escopo da NC-002 deve migrar para `studyLog` — **este teste é o que decide, e deve rodar antes da Fase 10** |
| T5.2 | Estados vazios (UX-D10) | Operador zerado: toda seção exibe `EmptyState` explicando o que falta. AC de NC-001 e NC-002 |
| T5.3 | Múltiplos operadores | Nenhum bloco exibe dado sem rótulo de operador e fase (AC-3 da NC-002) |

### T6 — Gates de regressão contínua (após TD-SYS-02/01)

`eslint-plugin-react-hooks` obrigatório (20 `useEffect` num arquivo, com `saveResult` em L653 dependendo só de `[mode]` — é exatamente a classe de defeito que `exhaustive-deps` detecta) · `jsx-a11y` sobre o `.tsx` · **ratchet de `@ts-nocheck`**: gate que falha se o número de arquivos suprimidos aumentar (ver resposta 4.2.3).

---

## Respostas às Perguntas do @architect (§4.2)

**1. Classe de débito que fura a fila.** Duas classes, não uma: **dano físico** (UX-D07) e **destruição irreversível de dado do usuário** (G1+G2, guarda mínima). Critério unificador: *irreversibilidade × esforço S × dependência arquitetural zero*. Nada mais entre os 36 se qualifica — verifiquei os outros 34.

**2. Critério de saída de TD-SYS-03.** **(b), cobertura das invariantes.** Rejeito (c) percentual: mediria execução, não verificação, e seria a terceira ilusão de conformidade deste projeto. (a) é marco, não gate. As 8 invariantes de T2 são a definição de pronto.

**3. Ordem de correção dos gates.** **Aceito desativação incremental verificável** — com uma condição não negociável: **ratchet monotônico**. Um gate que falha se o número de arquivos com `@ts-nocheck` aumentar, e que exige `strict: true` em todo módulo novo desde o primeiro dia. Sem o ratchet, "incremental" vira "nunca" — é o padrão que já produziu os três gates vacuosos. Também confirmo a ordem: **TD-SYS-19 (`globals`) antes de TD-SYS-02 (lint)**; verifiquei o `eslint.config.js` e a avalanche de `no-undef` é real (`window`, `AudioContext`, `Math`, `Date`, `console`, `setTimeout` ausentes).

**4. Gaps que você perdeu — privacidade de menores.** **Sim, e é mais amplo do que a Fase 6 registrou.** Uma acertou ao identificar UX-D24 e ao dizer que o risco existe sem banco. Mas: (a) por G4 a pseudonimização é **migração de chave primária**, não mudança de UI, e depende de TD-SYS-09; (b) o risco maior não é retenção indevida, é **destruição acidental** (G1, G2) — hoje o produto *apaga sem querer e não consegue apagar de propósito*; (c) além da privacidade, os gaps de dados G1/G2/G3 invalidam ACs já escritos. **Causa raiz: pular a Fase 2/5 foi correto quanto a "não há banco" e incorreto quanto a "não há camada de dados a auditar".**

**5. Ausência de Git = NEEDS WORK automático?** **Não, e a distinção importa.** TD-SYS-04 não invalida a *análise* — o assessment é um documento e está tecnicamente correto nesse ponto. Um NEEDS WORK automático por ausência de Git confundiria "o documento está incompleto" com "o repositório está inseguro" e enfraqueceria o gate. **Meu NEEDS WORK é motivado exclusivamente pelos gaps de dados (G1-G4).** Dito isso: TD-SYS-04 é **bloqueio absoluto de qualquer alteração de código**, incluindo o UX-D07 (Emenda 1), e permanece o item 0a.

**6. `StorageAdapter` é suficiente?** **Não sozinho — e ele precisa ser maior do que você desenhou.** Duas ampliações: (a) o adapter deve **possuir a política de merge do registro**, não só `get`/`set` — senão G1 sobrevive à extração e reaparece em cada call site; (b) as **fixtures são obrigatórias e são o gate**, não um complemento. O adapter prova que a I/O é mockável; só as fixtures provam que os dados de 2026 continuam legíveis. T1.1 é o AC-2 da NC-003 em forma executável.

**7. Validação das elevações ⬆.** **Endosso as três (TD-SYS-05, 08, 18), mas reformulo a regra.** "Quando dois agentes divergem, prevalece a maior severidade" é uma catraca de sentido único: produz inflação monotônica de severidade em qualquer pipeline multi-agente. A regra correta é a que **Uma já aplicou na prática**: *severidade é função do modo de falha e da reversibilidade; prevalece a fase que mediu o modo de falha, para cima ou para baixo*. Prova de que ela não é catraca: Uma **rebaixou cinco achados próprios** (UX-D11, D08, D02, D15, D17) sob a mesma regra. É essa formulação que peço na Fase 8. Aplicando-a: TD-SYS-08 é CRITICAL **pelo modo de falha** (silencioso, sem sinal em nenhum gate), como Uma reformulou — não pela extensão.

**8. Escopo do veredito — mapa débito → artigo.** **Sim, inclua.** Custo marginal quase nulo e é o que torna a Constitution acionável em vez de decorativa: Artigo I ← TD-SYS-07 · Artigo III ← TD-SYS-10 · Artigo IV ← UX-D17 · Artigo V ← TD-SYS-01/02/03 (**e agora G1/G2**, que são a violação mais material do Quality First: o produto perde dado de usuário) · Artigo VI ← TD-SYS-11.

**Endosso da regra de veto de UX (Fase 6 §4.4):** **sim, vira critério de gate.** Com uma quarta cláusula: **nenhuma story que toque persistência é aceita sem teste de round-trip com fixture legada** (T1.5). As três cláusulas de Uma impedem que a dívida de UI cresça; a quarta impede que a dívida de dados cresça — e é a que faltava.

**Errata da Fase 3:** confirmo o pedido de Uma (§6). `docs/frontend/frontend-spec.md` precisa de errata registrando os quatro achados corrigidos (UX-D11, D14, D15, D07). Motivo de rastreabilidade: o `frontend-spec.md` é insumo citado do DRAFT; se ele continuar afirmando "zero responsividade", a Fase 9 pode recitá-lo. **Errata, não reescrita** — a correção documentada tem mais valor probatório que um documento silenciosamente consertado.

---

## Parecer Final

### **NEEDS WORK** — retornar à Fase 4/8 para incorporação, com liberação parcial de segurança

**O que está certo e não deve ser refeito.** Os 40 débitos são reais — verifiquei uma amostra de 15 diretamente no código e **nenhum foi refutado**. O grafo de causalidade está correto. As três elevações ⬆ estão certas. As duas divergências da Fase 6 (UX-D07 fora da fila, tokens antes do monolito) estão certas e endossadas. A Fase 6 é o melhor artefato deste pipeline: Uma reabriu o código, **falsificou cinco dos seus próprios achados** e registrou a medição que enfraquecia o seu próprio argumento de segurança antes que eu pudesse encontrá-la — foi por isso que o parecer dela sobreviveu à minha contestação. **Nada disso precisa ser refeito.**

**Por que mesmo assim é NEEDS WORK.** Encontrei quatro defeitos de dados verificados no código (G1-G4), dois com potencial de destruição irreversível de histórico de crianças, e dois que **contradizem critérios de aceitação já escritos** em NC-002 e NC-003. Não são refinamentos: se a Fase 8 congelar a priorização sem eles, a Fase 10 produzirá um épico que planeja stories estruturalmente impossíveis (RX-3) e uma refatoração XL sobre um mecanismo de persistência que apaga dados em silêncio (RX-2).

**A causa é sistêmica e vale registrar.** Todos os quatro gaps estão na mesma região: **a camada de persistência**. A Fase 2/5 foi pulada — corretamente, porque não há banco. Mas "não há banco" foi lido como "não há dados a auditar", e há: dois blobs JSON com nome de criança como chave primária, histórico pedagógico, migração retrocompatível e uma política de merge com defeito. **A conclusão para o workflow, não só para este projeto: a ausência de um SGBD deve redirecionar a auditoria de dados, nunca cancelá-la.** É o achado de processo desta fase.

**Liberação imediata, apesar do veredito.** Segurança não espera documento:

| Item | Esforço | Autorizado |
|---|---|---|
| **0a** — `git init` + `.gitignore` (TD-SYS-04 + TD-SYS-16) | ~0,25 h | ✅ **AGORA** |
| **0b** — **UX-D07 P0-SAFETY**, escopo emendado por G8/G9 | ~1,75 h | ✅ **AGORA** |
| **0c** — **RX-1 guarda anti-destruição** (G1 + G2 + `storeErr` global) | ~1 h | ✅ **AGORA** |

**Três horas de trabalho que removem o risco de dano físico a uma criança e o risco de destruição do histórico de uma turma.** Não dependem da Fase 8, não dependem do épico e não dependem deste gate. Recomendo executá-las hoje.

### Condições de saída para APPROVED (Fase 8)

| # | Condição | Fecha |
|---|---|---|
| C1 | Incorporar **G1, G2, G3, G4** como débitos de primeira classe com ID próprio, severidade e posição na fila | Gaps críticos de dados |
| C2 | **Reescrever o risco R5** — o modo de falha é degradação silenciosa com destruição de dados, não falha total na inicialização | Erro factual da Fase 1 §5.1 |
| C3 | Corrigir o escopo do **UX-D07** para incluir `rumble` (8,3 Hz) e `grainShift` (3,57 Hz); marcar o passo 2 (`Boom`/`matchMedia`) como **obrigatório** | G8, G9 |
| C4 | Registrar **RX-1 a RX-8** no registro de riscos | Riscos cruzados |
| C5 | Congelar a ordem validada (**0a → 0b → 0c → 1…9**) com as três emendas | Dependências |
| C6 | Adotar o critério de saída de TD-SYS-03 = **8 invariantes de T2**, com deleção dos 2 testes de regex, e registrar a decisão de runner (Vitest + happy-dom) | G5, pergunta 2 |
| C7 | Adicionar **G6 (baseline de caracterização)** como pré-requisito explícito de TD-SYS-06 | RX-2 |
| C8 | Sinalizar à Fase 10 que o **escopo da NC-002 depende do resultado de T5.1** e que **NC-003 AC-2 está violado pelo código atual (G1)** | RX-3 |
| C9 | Incluir o mapa **débito → artigo da Constitution** e adotar a **regra de veto de UX + 4ª cláusula de persistência** como gate | Perguntas 7 e 8 |
| C10 | Corrigir a contagem consolidada e emitir **errata** no `frontend-spec.md` | G10, pedido da Fase 6 |

Atendidas C1-C10, o gate vira **APPROVED** sem nova rodada de revisão de UX ou arquitetura — **nenhuma das condições invalida o trabalho das Fases 1, 4 ou 6.** São incorporações, não retrabalho.

### Contagem consolidada revisada

| Severidade | Sistema (F1/F4) | Frontend (F6, recontado) | QA (F7) | **Total** |
|---|---|---|---|---|
| CRITICAL / Crítica | 6 | 2 | **2** (G1, G2) | **10** |
| HIGH / Alta | 5 | 5 | **4** (G3, G4, G5, G6) | **14** |
| MEDIUM / Média | 10 | 7 | **1** (G7) | **18** |
| LOW / Baixa | 2 | 3 | 0 | **5** |
| **Total** | **23** | **17** | **7** | **47** |

*(G8, G9 e G10 não são débitos — são correção de escopo, verificação técnica e higiene de artefato.)*

**O total consolidado é 47, não 36.** A Fase 6 já havia elevado 36 → 40 (a tabela §1.1 tem 17 linhas, não 15 — G10); esta fase acrescenta 7. **É este o número que deve ir para o `TECHNICAL-DEBT-REPORT.md` da Fase 9.**

---

## Decisões Autônomas Registradas

- `[AUTO-DECISION]` Veredito = **NEEDS WORK** apesar dos 4 gates verdes (razão: provei por mutação que o gate de teste aprova a destruição total do recurso e reprova a formatação correta dele; APPROVED com base nos comandos seria o risco R1 se materializando na assinatura do QA — precisamente o que as Fases 1 e 4 me alertaram para não fazer).
- `[AUTO-DECISION]` **UX-D07 liberado para execução imediata apesar do NEEDS WORK** (razão: um gate de documento não é motivo legítimo para reter uma correção de dano físico de 1,75 h com dependência arquitetural zero; o veredito governa o artefato, não a segurança do usuário).
- `[AUTO-DECISION]` **Git antecipado ao UX-D07**, divergindo de Uma (razão: o passo 3 dela altera o comportamento visual **por padrão** e toca uma força do Gold Standard — não é aditivo e precisa de reversão. Custo da emenda: ~15 min, dentro da alternativa que ela própria ofereceu).
- `[AUTO-DECISION]` **Segunda classe P0-SAFETY-DATA criada** para G1+G2 (razão: o critério que qualifica UX-D07 é *irreversibilidade × esforço S × dependência zero*, e G1/G2 satisfazem os três. Aplicar o critério a um item e não ao outro seria incoerência do próprio método).
- `[AUTO-DECISION]` Critério de saída de TD-SYS-03 = **invariantes, não percentual** (razão: cobertura sobre monolito mede execução, não verificação — seria a terceira ilusão de conformidade deste projeto).
- `[AUTO-DECISION]` **Vitest + happy-dom** como toolchain de teste (razão: único runner que reusa a resolução de módulos do Vite 8 sem uma segunda config de build, num projeto que nem tem a primeira; Jest exigiria transform próprio).
- `[AUTO-DECISION]` Regra de elevação de severidade **reformulada** de "prevalece a maior" para "prevalece a fase que mediu o modo de falha, para cima ou para baixo" (razão: a formulação original é catraca de sentido único e produz inflação monotônica; Uma já aplicava a regra correta na prática ao rebaixar cinco achados próprios).
- `[AUTO-DECISION]` `npm audit`, licenciamento e retenção no host **registrados como não avaliados e não priorizados** (razão: 4 deps de runtime e zero chamadas de rede tornam o risco baixo; inflar escopo aqui diluiria os gaps críticos de dados).
- `[AUTO-DECISION]` Contagem consolidada recalculada para **47** (razão: a tabela §1.1 da Fase 6 tem 17 linhas contra 15 declaradas; o número errado seria herdado pelo relatório executivo da Fase 9).
- `[AUTO-DECISION]` Mutação executada em **cópia sintética no scratchpad**, jamais nos arquivos do projeto (razão: `@qa` revisa, não altera código — Artigo III e limite de autoridade do agente).
- `[AUTO-DECISION]` Nenhum código, config ou artefato do projeto foi alterado; nenhuma operação Git executada (razão: autoridade de `@dev` e `@devops`).

---

*— Quinn, guardiã da qualidade 🛡️*
*Fase 7 · 4 gates executados · 15 débitos verificados no código · 10 gaps identificados · 8 riscos cruzados · 47 débitos consolidados*
*Gate: **NEEDS WORK** · UX-D07 + RX-1 **liberados para execução imediata***

---
---

# Re-Review — Fechamento do Gate

**Data:** 2026-09-07 · **Agente:** @qa (Quinn) · **Insumo:** `docs/prd/technical-debt-DRAFT.md` **v2.0**
**Objeto:** verificação das 10 condições de saída C1-C10 emitidas no veredito NEEDS WORK acima.

## Método desta re-review

O @architect alegou 9/10 condições atendidas. **Não aceitei a alegação — verifiquei o artefato e o código.** Onde a v2.0 afirma ter contado, eu recontei; onde afirma ter reverificado o código, eu reabri o código. Esta é a mesma disciplina que produziu G1-G4 na primeira rodada, e ela é o motivo pelo qual a §5 do DRAFT (autoavaliação do próprio autor) não pode ser o gate.

| Verificação executada | Resultado |
|---|---|
| Versão/changelog no topo do DRAFT | ✅ **v2.0**, changelog com 10 acréscimos (a)-(j) declarados |
| Contagem de IDs únicos na matriz §3 | ✅ **47 IDs primários únicos**, medidos — 23 TD-SYS (01..23, nenhum faltando) + 17 UX-D + 7 TD-DAT/TD-QA |
| Distribuição de prioridade da matriz | ✅ **1 + 3 + 8 + 12 + 12 + 11 = 47** — bate com o declarado em §3.1.2, sem arredondamento |
| Soma das horas da tabela §2.1 (17 linhas) | ✅ **160,75 h exatos** — bate com o declarado (160,5 + 0,25 da emenda ao UX-D07) |
| Distribuição de severidade de frontend | ✅ **2 CRÍTICA · 5 ALTA · 7 MÉDIA · 3 BAIXA = 17** — a recontagem de G10 foi de fato aplicada |
| `.git/` no repositório | ❌ **ainda ausente** — 0a **não executado**. Não é falha do DRAFT (é ação de @devops), mas invalida qualquer alegação de "resolvido" |
| `docs/frontend/frontend-spec.md` — errata | ❌ **ausente**. L310 ainda declara *"Zero responsividade: 0 breakpoints"* — a afirmação factualmente errada segue viva no insumo citado |
| Código L344-401 (evidências de TD-DAT-01/02/03/04) | ✅ **inalterado e confirmado**: `up` continua objeto literal; `okStore` continua descartado; `sort(b.pts-a.pts).slice(0,40)` intacto; `players[n]` indexado por nome |
| Alegação nova do @architect (`loadAll` descartado em **dois** call sites) | ✅ **confirmada** — L359 e L360. Achado próprio dele, correto, e **agrava G2**: o segundo efeito reexecuta a cada retorno ao login |

**Nota:** o @architect não incorporou por citação. As três evidências de código que ele diz ter reaberto estão de fato onde ele diz, e ele encontrou um agravante que eu não tinha registrado. Isso é o padrão certo e merece registro.

## Checklist C1-C10

| # | Condição | Veredito | Justificativa verificada |
|---|---|---|---|
| **C1** | G1-G4 como débitos de primeira classe, com ID, severidade e posição na fila | ✅ **ATENDIDA — com excedente** | Não foram 4, foram **7**: TD-DAT-01..05 + TD-QA-01..02 (§1.5). Cada um tem ID, severidade, esforço, prioridade, evidência de linha e remediação. Todos os 7 aparecem na matriz §3 com prioridade atribuída. Promover G5/G6/G7 a débito (e não a "observação") foi decisão correta: a Fase 10 planeja a partir de IDs, não de prosa |
| **C2** | Reescrever R5 | ✅ **ATENDIDA** | §3.3 R5 marcado 🔄, texto original **tachado e preservado**, modo de falha real descrito (degradação silenciosa → sobrescrita). O erro da Fase 1 §5.1 é assumido nominalmente em TD-DAT-02, e a correção também foi propagada para TD-SYS-09 em §1. **Excedente:** R11 criado, separando corretamente perda-de-trabalho-da-equipe (R2) de perda-de-histórico-de-criança (R11) |
| **C3** | Escopo do UX-D07 — incluir `rumble` e `grainShift`; passo 2 obrigatório | ✅ **ATENDIDA** | §2.1.1 traz a tabela das 4 animações com frequências e gatilhos, o passo 3 cobre as **4** (não 2), o passo 2 está marcado **"NÃO CORTÁVEL (G9)"** com regra dura para a Fase 10, e 1,5 h → **1,75 h** propagado para §2.1, §3, §3.4 e §7.1. A ressalva de G9 (folha não montada durante o `Boom`, L676) está transcrita como justificativa, não como ornamento |
| **C4** | Registrar RX-1 a RX-8 | ✅ **ATENDIDA** | §3.3.2, tabela dedicada, **8 linhas**, com áreas e mitigação por risco. Preservados em adição a R1-R11, não em substituição |
| **C5** | Congelar a ordem 0a → 0b → 0c → 1…9 com as três emendas | ✅ **ATENDIDA** *(com ressalva H4)* | §3.4 congelada, as três emendas justificadas item a item — inclusive a de 15 minutos (Git antes do passo 3), que ele aceitou pelo argumento certo ("não é aditivo") e não por deferência. Ressalva de completude em H4 abaixo |
| **C6** | Critério de saída de TD-SYS-03 = 8 invariantes + deleção dos regex + runner | ✅ **ATENDIDA** | §4.3 traz I1-I8 com I4 (merge não-destrutivo) integrada; §3.3.1 normatiza **"regex sobre código-fonte fica proibida como evidência de comportamento"** como regra de gate e a deleção dos 2 testes como consequência 2; TD-QA-01 registra Vitest + happy-dom **com o trade-off de acoplamento ao Vite explicitado**. Endossar a decisão como autoridade de arquitetura, em vez de herdá-la, foi o tratamento correto |
| **C7** | Baseline de caracterização como pré-requisito explícito de TD-SYS-06 | ✅ **ATENDIDA** | TD-QA-02 existe como débito próprio (§1.5), o grafo §3.2 o mostra como pré-requisito duro, e o item 8 de §3.4 o ordena **antes** da quebra do monolito. A distinção que eu pedi ("os testes têm valor?" vs. "o que não posso quebrar amanhã?") está preservada como razão, não colada como rótulo |
| **C8** | Sinalizar à Fase 10 a dependência de T5.1 e a violação de NC-003 AC-2 | ✅ **ATENDIDA** | Sinalizado em quatro lugares independentes: TD-DAT-01, TD-DAT-03, RX-3 e §7.2 (três sinalizações obrigatórias nomeadas para @pm). **T5.1 marcado para rodar antes da Fase 10**, como pedido |
| **C9** | Mapa débito → artigo + regra de veto com a 4ª cláusula | ✅ **ATENDIDA** | §3.1.3 cobre os 6 artigos (com "nenhuma violação" declarado para o II, o que é a resposta honesta); §4.2 fecha com as 4 cláusulas e a frase **"Isto é critério de gate, não recomendação"**. A regra de severidade também foi revogada e substituída em §2.5.1, como eu pedi na pergunta 7 |
| **C10** | Corrigir a contagem consolidada **e** emitir errata no `frontend-spec.md` | ⚠️ **ATENDIDA PARCIALMENTE** | **Primeira metade: atendida e verificada por recontagem independente** — 47 IDs únicos, 160,75 h, distribuição batendo, trajetória auditável 36 → 40 → 47 registrada. **Segunda metade: não atendida.** `docs/frontend/frontend-spec.md` L310 **ainda afirma "Zero responsividade: 0 breakpoints"** — exatamente o texto que a errata existe para corrigir. A delegação a @ux-design-expert é legítima quanto à autoridade (o artefato é dela, o conteúdo são autocorreções dela) e eu a **aceito como fundamento**, mas fundamento legítimo não converte pendente em atendido |

**Placar: 9 atendidas · 1 parcial · 0 não atendidas.**

## Ressalvas (higiene de artefato — classe G10, não bloqueiam o gate)

Nenhuma destas altera prioridade, severidade ou ordem. Todas alteram **números ou afirmações que a Fase 9 pode recitar para a diretoria** — que é precisamente o motivo pelo qual G10 existiu.

- **H1 — Afirmação autocontraditória em §1.** A linha *"Status v2.0: nenhuma linha desta seção foi alterada"* é falsa: **TD-SYS-03, 04, 09, 10, 17, 18 e 19 carregam texto novo de v2.0**, e o de TD-SYS-09 é uma correção factual material ("indisponibilidade = falha total na inicialização **está errado**"). A intenção era boa (sinalizar que nada foi refutado); a redação diz outra coisa. **Correção:** trocar por *"nenhum débito desta seção foi refutado ou removido; 7 receberam anotação de v2.0"*.
- **H2 — Contagem de autocorreções da Fase 6 diverge em quatro lugares.** §0.1 diz **3**; §2 (intro) diz **três**; a tabela §2.0 tem **4 linhas**; §2.5.1, §6 (×2) dizem **seis**; a tabela §2.1 tem **5 marcadores ⬇**. **O número correto é 5 rebaixamentos** (UX-D11, D08, D02, D15, D17) **+ 1 correção factual sem mudança de severidade** (UX-D14 era Média na Fase 3 e continua MÉDIA — foi a *medição* que mudou, não a severidade). Isso importa além da higiene: **§2.5.1 usa "seis rebaixamentos" como prova empírica de que a nova regra de severidade não é catraca.** O argumento sobrevive com 5 — mas um argumento de método não deve se apoiar em número errado.
- **H3 — Duas somas de horas de frontend coexistem sem desambiguação.** §0.1 registra **160,5 h** (pré-emenda) e §2.1 registra **160,75 h** (pós-emenda ao UX-D07). Ambas estão certas nos seus quadros; o documento não diz qual é qual. A Fase 9 pode citar a errada.
- **H4 — Sete débitos não têm linha própria na ordem congelada de §3.4.** Verifiquei ID a ID: faltam **TD-DAT-03** e **TD-SYS-10** (ambos P1/HIGH), **UX-D16** (P1) e **TD-SYS-14, 15, 17, 20** (P2). Os dois primeiros estão de fato endereçados fora da tabela (TD-DAT-03 por T5.1 antes da Fase 10; TD-SYS-10 pela sinalização a @pm em §7.2), e o item 9 absorve os P3 — mas **um item P1 sem linha na fila é um item que a Fase 10 não vê**. Pedido: acrescentar linhas explícitas ou uma nota "endereçados fora da sequência, com o mecanismo nomeado".

## Veredito Final

### ✅ **APPROVED COM RESSALVAS** — liberado para a Fase 8

**Fundamento.** As nove condições substantivas (C1-C9) estão atendidas **no conteúdo, não na citação** — verifiquei cada uma no artefato e recontei todos os números aritméticos que elas produzem. A décima está atendida na metade que dependia do @architect e pendente na metade que, por autoridade, não podia ser feita por ele.

**Por que uma condição parcial não sustenta um segundo NEEDS WORK.** Meu NEEDS WORK foi motivado *"exclusivamente pelos gaps de dados G1-G4"* — está escrito no §Parecer Final acima, e eu me prendo ao que escrevi. Os quatro gaps estão incorporados como TD-DAT-01..04, com evidência reverificada no código pelo próprio autor, posição na fila, invariantes que impedem reintrodução (nº 10 e nº 11 em §2.3) e testes que os fecham (I4, T1.1-T1.6, T5.1). **A causa do veredito original foi removida.** Reprovar de novo por uma errata de 0,25 h em outro artefato, cujo conteúdo já está transcrito e cujo dono é outro agente, seria transformar o gate num instrumento de retenção — o oposto do que ele é.

**O que eleva este rework acima de "condições cumpridas".** Três coisas que eu não pedi e que melhoram o assessment: (a) o @architect **reabriu o código antes de promover meus gaps a débitos**, e encontrou um agravante próprio (o retorno de `loadAll` descartado em **dois** call sites); (b) **revogou a própria regra de severidade** da v1.0 em vez de defendê-la, e registrou que ela teria produzido a fila errada; (c) reclassificou **TD-SYS-09 como terceira raiz do grafo** e nomeou a distinção que faltava — as outras duas raízes causam *impedimento*, esta causa *perda*. O item (c) é a formulação que eu deveria ter escrito na primeira rodada e não escrevi.

**Escopo do que estou aprovando.** Aprovo o **artefato de discovery** — a completude, a correção factual e a rastreabilidade de `technical-debt-DRAFT.md` v2.0 como insumo das Fases 8/9/10. **Não estou aprovando o estado do produto**, que continua com os quatro defeitos de dados vivos no código e sem controle de versão. A distinção é a mesma que fiz na resposta 5 da rodada anterior e continua valendo.

**Condição única de fecho da Fase 8:** a errata de C10 deve ser emitida por @ux-design-expert **antes** de `technical-debt-assessment.md` ser produzido — não como novo gate, mas porque o `frontend-spec.md` é insumo citado e, sem ela, a Fase 9 pode recitar "zero responsividade" para a diretoria. As ressalvas H1-H4 são absorvidas na mesma passada.

## Ações de execução pendentes (fora do escopo deste discovery)

Nenhuma delas é documentação. Nenhuma depende deste gate — **as três primeiras já estavam autorizadas desde o veredito anterior e continuam não executadas.**

| # | Ação | Executor | Autoridade | Verificado hoje |
|---|---|---|---|---|
| **0a** | `git init` + `.gitignore` cobrindo `Arquivos_Diversos/`, `usina.zip`, `usina-legacy-backup/`, `dist/` — **janela única antes do 1º commit (TD-SYS-16)** | **@devops** | Git/repo é autoridade exclusiva de @devops | ❌ `.git/` **ainda ausente**. Bloqueia 0b e 0c |
| **0b** | **UX-D07** — media query + `matchMedia` no `Boom` (**não cortável**) + `rumble`, `rumbleHard`, `glitch`, `grainShift` ≥ `.34s` **por padrão** + evidência T0.1-T0.5 com vídeo, **contra o artefato publicado** (~1,75 h) | **@dev** | Alteração de código | ❌ não executado |
| **0c** | **Guarda anti-destruição** — (a) não gravar `operadores` se `okStore === false`; (b) `{ ...p, ...campos }` em `saveResult`; (c) `storeErr` global e persistente (~1 h) | **@dev** | Alteração de código | ❌ não executado — `up` segue objeto literal, `okStore` segue descartado em L359 **e** L360 |
| **E1** | **Errata em `docs/frontend/frontend-spec.md`** (4 autocorreções, conteúdo já transcrito em §2.0 do DRAFT) — ~0,25 h | **@ux-design-expert** | Artefato de propriedade dela | ❌ L310 ainda afirma "Zero responsividade" |
| **E2** | Absorver **H1-H4** no `technical-debt-assessment.md` | **@architect** | Fase 8 | — |
| **T5.1** | Executar o teste que decide o escopo de NC-002 (`matches` vs. `studyLog`) — **antes da Fase 10** | **@dev** + **@qa** | Requer 0a e a toolchain de TD-QA-01 | pendente |
| **W1** | Emenda ao `brownfield-discovery.yaml`: ausência de SGBD **redireciona** a auditoria de dados, não a cancela — com revisor nomeado | **@pm** / **@aiox-master** | Framework | pendente (Fase 10) |

⚠️ **0a é bloqueante de 0b e 0c e continua sem executor acionado.** Três horas de trabalho seguem separando o produto de dois riscos irreversíveis — dano físico a uma criança e destruição do histórico de uma turma. **Este re-review aprova um documento; ele não removeu nenhum dos dois riscos.**

## Decisões Autônomas Registradas (re-review)

- `[AUTO-DECISION]` Veredito = **APPROVED COM RESSALVAS**, não NEEDS WORK (razão: a causa declarada do veredito original — os gaps de dados G1-G4 — foi integralmente removida e reverificada no código; a única condição parcial é a metade de C10 que pertence, por autoridade, a outro agente, e cujo conteúdo já está transcrito. Manter NEEDS WORK usaria o gate para reter, não para proteger).
- `[AUTO-DECISION]` C10 classificada como **parcial e não como atendida**, apesar de a delegação ser legítima (razão: o texto da condição pede a errata emitida; `frontend-spec.md` L310 ainda diz "Zero responsividade". Fundamento legítimo para não fazer não é o mesmo que feito — e registrar isso é o que impede que a pendência evapore na Fase 8).
- `[AUTO-DECISION]` H1-H4 registradas como **ressalvas, não condições** (razão: nenhuma altera severidade, prioridade ou ordem; todas alteram números que a Fase 9 pode recitar. São da mesma classe de G10 — corrigir na fonte custa minutos, herdar custa credibilidade com a diretoria).
- `[AUTO-DECISION]` **Recontei todos os números da v2.0 em vez de aceitar a §5** (razão: a §5 é a autoavaliação do autor do artefato; um gate que aceita a autoavaliação do revisado não é um gate. Todos os totais bateram — e o fato de baterem é a evidência, não a afirmação de que bateriam).
- `[AUTO-DECISION]` Aprovação **do artefato de discovery, explicitamente não do estado do produto** (razão: os quatro defeitos de dados seguem vivos no código e `.git/` segue ausente. Deixar a distinção implícita permitiria ler "APPROVED" como "resolvido" — que é exatamente o tipo de ilusão de conformidade que este assessment inteiro documenta).
- `[AUTO-DECISION]` Nenhum código, config ou artefato de projeto alterado nesta re-review; nenhuma operação Git executada; apenas esta seção anexada a `qa-review.md` (razão: autoridade de @dev/@devops e limite de escrita do @qa).

---

*— Quinn, guardiã da qualidade 🛡️*
*Re-review da Fase 7 · C1-C10 verificadas no artefato e no código · 47 IDs e 160,75 h recontados de forma independente · 4 ressalvas de higiene*
*Gate: **APPROVED COM RESSALVAS** · Fase 8 liberada · **0a/0b/0c e a errata E1 seguem pendentes de execução***
