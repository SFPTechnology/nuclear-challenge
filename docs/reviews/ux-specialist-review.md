# UX Specialist Review

**Documento:** `docs/reviews/ux-specialist-review.md`
**Fase:** Brownfield Discovery — Fase 6 (`review_and_validate`)
**Agente:** @ux-design-expert (Uma)
**Data:** 2026-09-07
**Insumo revisado:** `docs/prd/technical-debt-DRAFT.md` (@architect, Fase 4) — 36 débitos
**Origem própria:** `docs/frontend/frontend-spec.md` (Fase 3) — 21 débitos

---

## 0. Método desta revisão e o que mudou

Não revisei o DRAFT relendo a minha própria Fase 3. **Reabri o código** e tentei falsificar os meus próprios achados. Três sobreviveram mais fortes do que entraram, **três não sobreviveram** e foram rebaixados, e quatro débitos novos apareceram — dois deles com peso maior do que itens que eu havia classificado como Alta.

Isso importa para o veredito do @qa na Fase 7: **a Fase 3 continha erros de medição**, e eles estão corrigidos abaixo com a evidência bruta. Um assessment que herdasse a Fase 3 sem esta revisão teria priorizado responsividade (que já existe parcialmente) acima de resize de texto (que está integralmente quebrado).

### 0.1 Correções materiais aos meus próprios achados da Fase 3

| Achado da Fase 3 | Status | Evidência que mudou o julgamento |
|---|---|---|
| UX-D11 "Zero responsividade" | ❌ **FACTUALMENTE ERRADO** | Existe camada responsiva: `.nc-viewport` / `.nc-shell` / `--nc-scale` com media queries em 640/1024/1440px (linhas 666–672) e detecção de dispositivo (`getDeviceClass`, linha 189). Eu contei prefixos Tailwind `sm:`/`md:`/`lg:` e concluí ausência — medi o proxy errado. |
| UX-D14 "contraste provável falha" | ⚠️ **PARCIALMENTE ERRADO** | `#8d959e` mede **4.39–6.53:1** — passa 4.5:1 na maioria dos fundos. As falhas reais são outras três (§1.3). |
| UX-D15 "alvos <44×44 não verificados" | ⚠️ **REBAIXADO** | Medido: teclado ≈ **119×37px**. Falha 2.5.5 (AAA), **passa** 2.5.8 (AA da WCAG 2.2, 24×24). Não é falha de conformidade AA. |
| UX-D07 "flicker vermelho" | ✅ **CONFIRMADO E AMPLIADO** | O mecanismo dominante não é o overlay que descrevi — é `rumbleHard` a **11,1 Hz** aplicado ao viewport inteiro (§2.1). |

---

## 1. Débitos Validados

**Legenda de prioridade (ótica de UX, independente do sequenciamento arquitetural):**
**P0-SAFETY** = risco de dano ao usuário, sai da fila · **P1-UX** = bloqueia ou degrada NC-001/002/003 · **P2-UX** = exclusão ou dano à experiência · **P3-UX** = consistência e higiene.

### 1.1 Débitos exclusivos de frontend (§2.1 do DRAFT)

| ID | Débito | Severidade | Horas | Prioridade | Impacto UX |
|---|---|---|---|---|---|
| **UX-D07** | Animações sem `prefers-reduced-motion` — `rumbleHard` a 11,1 Hz no viewport inteiro + scanlines de alto contraste + `glitch` a 11,1 Hz, todos simultâneos em `heat ≥ 90` | **CRÍTICA** ⬆ (era Alta) | **1,5** | **P0-SAFETY** | Único débito dos 36 com potencial de **dano físico** (vestibular, enxaqueca, desconforto fotossensível) em criança, sem escape. Ver §2.1 |
| **UX-D05** | A11y quase nula — 3 `aria-*`, 0 `role`, 0 `tabIndex`, 0 `aria-hidden` (8 ícones decorativos anunciáveis), 1 `outline-none`, 24/27 botões sem nome acessível | **CRÍTICA** ✅ | **28** (subconjunto AA priorizado) / +34 para AA integral | **P1-UX** | Produto educacional **inutilizável** por leitor de tela. Exclusão categórica, não degradação |
| **UX-D23** 🆕 | **93 `fontSize` numéricos em px, 0 `rem`/`em`** + `zoom:var(--nc-scale)` — preferência de tamanho de fonte do usuário é ignorada. WCAG 1.4.4 (Resize) e 1.4.10 (Reflow) | **ALTA** | **10** | **P1-UX** | Criança com baixa visão e projeção em sala não têm recurso algum. É a falha de a11y **mais completa** do produto: não há caminho de contorno |
| **UX-D10** | Sem empty states — análise >10 ops, radar ≥2 operadores, gráficos 3/4/5 com condições próprias; conteúdo some sem explicação (já confundido com bug) | **ALTA** ✅ | **10** | **P1-UX** | AC explícito de NC-001 e NC-002. Professor interpreta ausência de dado como produto quebrado |
| **UX-D02** | Design system inexistente como sistema — 168 blocos `style={{}}` (confirmado) vs 227 `className` (não 222), cores literais em 1.343 linhas | **ALTA** ⬇ (era Crítica) | **24** | **P1-UX** | Drift visual garantido nas 3 telas novas. **Rebaixei: não bloqueia story, garante degradação.** Ver §2.2 |
| **UX-D06** | Cor como canal semântico único (verde/âmbar/vermelho) — WCAG 1.4.1 | **ALTA** ✅ | **12** | **P2-UX** | Aluno daltônico (~8% dos meninos) perde a partida sem entender por quê. Em produto de avaliação pedagógica, isso contamina a métrica |
| **UX-D24** 🆕 | **Sem exclusão de operador e sem pseudonimização** — nome de criança + histórico de desempenho persistem indefinidamente em `window.storage` de dispositivo compartilhado, exibidos em ranking visível à turma. Zero ocorrências de fluxo de remoção | **ALTA** | **8** | **P2-UX** | Dado pessoal de menor, sem consentimento, sem direito de exclusão, exposto socialmente. Ver §2.7 |
| **UX-D16** | Nenhuma tela existe para NC-001/002/003; sem `ScreenLayout` — 9 telas montam árvore inline | **MÉDIA** ✅ | **20** (só as primitivas compartilhadas) | **P1-UX** | Reclassificado: as telas são **escopo de produto**, não débito. O débito é a ausência das primitivas. Ver §2.4 |
| **UX-D11** | Responsividade **por escala, não por refluxo** — `zoom:var(--nc-scale)` (0,78–1,18) em vez de reflow; `play` é coluna única fixa; encolhe alvos de toque a ~29px | **MÉDIA** ⬇ (era Alta) | **16** | **P2-UX** | **Autocorreção: a camada responsiva existe.** O débito remanescente é o mecanismo (`zoom` não é refluxo e não atende 1.4.10) |
| **UX-D14** | Contraste — **medido**: `#6b7280` falha em todos os fundos (2,76–4,10:1); `#ef4444` sobre metal claro `#2a3037` = **3,54:1**; `#8d959e` sobre `#2a3037` = 4,39:1 | **MÉDIA** ✅ | **6** | **P2-UX** | O pior caso é o **vermelho de perigo** ilegível sobre o metal claro — a cor cuja leitura mais importa |
| **UX-D19** | Foco não gerenciado nas 9 transições de `mode` | **MÉDIA** ✅ | **4** | **P2-UX** | Usuário de teclado é jogado ao topo a cada tela. Sub-item natural do pacote UX-D05 |
| **UX-D22** 🆕 | **`<style>` reinjetado em 6 raízes de tela** (linhas 685, 738, 965, 1137, 1188, 1232) — folha de estilo vive dentro do render, invisível a lint, minificação e auditoria | **MÉDIA** | **3** | **P3-UX** | Nenhuma ferramenta de a11y ou CSS enxerga estas 7 keyframes. **Mas é também o que torna a correção de UX-D07 trivial** |
| **UX-D08** | Sem loading state — `loading` no state, 0 `Skeleton`/`Spinner` | **MÉDIA** ⬇ (era Alta) | **3** | **P3-UX** | **Rebaixei:** a app faz zero chamadas de rede (§0.2 do DRAFT); `loadAll()` é local e sub-segundo. A janela de espera é irrelevante — o risco real é **falha**, coberto por TD-SYS-18 |
| **UX-D18** | Sem medição de performance percebida (LCP/INP/CLS) nem orçamento | **MÉDIA** ✅ | **6** | **P3-UX** | Sem evidência em nenhuma direção. Medir antes de otimizar |
| **UX-D25** 🆕 | **Sem legenda de atalhos de teclado.** O efeito 3 é o caminho de entrada principal (invariante §2.3.5) mas **não é anunciado em lugar algum** da UI | **BAIXA** | **3** | **P3-UX** | Um recurso de a11y já implementado e desperdiçado por falta de 4 linhas de copy |
| **UX-D15** | Alvos de toque — **medido**: teclado ≈119×37px | **BAIXA** ⬇ (era Média) | **3** | **P3-UX** | Passa 2.5.8 AA (24×24). Falha só 2.5.5 AAA. A interação com `zoom` (→29px) é o risco real e pertence a UX-D11 |
| **UX-D17** | `pause` e calendário sem rastreabilidade — Artigo IV | **BAIXA** ⬇ (era Média) | **3** | **P3-UX** | Documentar custa pouco e o risco é de governança, não de usuário. Ver §2.6 |

**Subtotal frontend: 2 CRÍTICA · 4 ALTA · 6 MÉDIA · 3 BAIXA = 15 débitos · 159,5 horas** (subconjunto AA; +34 h para WCAG 2.1 AA integral).

### 1.2 Validação das elevações ⬆ do @architect (pergunta 4.1.1)

| Débito | Elevação do @architect | Meu veredito |
|---|---|---|
| **TD-SYS-05** (UI fora de `src/`) | HIGH → CRITICAL adotando a minha "Crítica" | ✅ **SUSTENTO CRITICAL** — e o motivo é mais forte que o meu original: nenhuma ferramenta de a11y, CSS ou visual regression pode ser apontada para um arquivo fora da árvore de código. É a causa raiz de o produto ser **inauditável**, não só inlintável |
| **TD-SYS-08** (Tailwind congelado) | HIGH → CRITICAL adotando a minha "Crítica" | ⚠️ **SUSTENTO, com reformulação.** Não é "bloqueia o projeto" — é **falha silenciosa**, que é pior: a única classe de débito que produz bug em produção sem sinal em nenhum gate. Mantenha CRITICAL pelo modo de falha, não pela extensão |
| **TD-SYS-18** (sem ErrorBoundary) | MEDIUM → HIGH por corroboração | ✅ **SUSTENTO HIGH.** Tela branca em sala de aula, com professor sem diagnóstico e criança sem recurso, é o pior modo de falha possível para este contexto |

**Resposta direta à pergunta 1:** a minha "Crítica" da Fase 3 significava **"bloqueia trabalho de UI"**, não "bloqueia o projeto" — o @architect estava certo em desconfiar. **Mas não reverta**, porque nos três casos a razão *arquitetural* independente já justifica CRITICAL/HIGH. As elevações estão certas; a minha justificativa original é que era estreita.

### 1.3 Contrastes medidos (evidência para UX-D14)

Razões calculadas contra os fundos reais do painel (`#0a1418`, `#171b1f`, `#2a3037`, `#050b0e`, `#23282e`, `#1f242a`):

| Cor | Pior caso | Veredito AA (4.5:1) |
|---|---|---|
| `#6b7280` cinza-500 | **2,76:1** | ❌ **Falha em todos os 6 fundos** |
| `#ef4444` vermelho (perigo) | **3,54:1** | ❌ Falha sobre `#2a3037` e `#23282e` |
| `#8d959e` cinza-400 | 4,39:1 | ⚠️ Falha marginal só sobre `#2a3037` |
| `#f87171`, `#7dd3fc`, `#22c55e`, `#f59e0b`, `#fbbf24`, `#4ade80`, `#cbd5e1`, `#e2e8f0` | ≥ 3,95:1 | ✅ Passam (exceto `#ef4444`) |

**Leitura:** a paleta é majoritariamente saudável. Existem exatamente **duas correções de cor** a fazer (`#6b7280` e `#ef4444` sobre metal claro), não uma varredura. Isso derruba a estimativa de UX-D14 de "auditoria completa" para 6 horas.

---

## 2. Respostas ao Architect (§4.1 do DRAFT)

### 2.1 — Pergunta 2: UX-D07 vs. sequenciamento. **A tensão.**

> *"Ela deve ser executada fora da fila de priorização, como correção de segurança imediata, ou você aceita que ela espere a fundação?"*

**Parecer explícito: SIM — fora da fila. P0-SAFETY, executada antes de TD-SYS-04 (Git), inclusive.**

Vou defender isso com números, e vou começar pelo argumento **contra** mim mesma, porque o @architect merece a versão honesta.

**O que a WCAG 2.3.1 literalmente diz, e onde o meu texto da Fase 3 exagerou.**
O overlay que descrevi como "flicker vermelho de tela cheia" é `rgba(239,68,68,.06)` com `glitch` animando opacidade de `.35` a `.9` (linha 45). Alfa efetivo: **0,021 → 0,054**. A variação de luminância relativa resultante é de ~2–3% — **abaixo** do limiar de 10% do *general flash threshold*. E `rgb(239,68,68)` tem saturação R/(R+G+B) = **0,637**, abaixo do 0,8 exigido pelo *red flash threshold*. **Estritamente, esse overlay isolado não viola a 2.3.1.** Registro isso porque um veredito de segurança construído sobre uma medição errada não sobrevive à primeira contestação, e eu prefiro que ele sobreviva.

**O que a reabertura do código encontrou, e que é pior.**

| Linha | Mecanismo | Frequência | Efeito |
|---|---|---|---|
| 1232 + 665 + 679 | `rumbleHard` aplicado ao **`.nc-viewport` inteiro** quando `heat ≥ 90` | `.09s` = **11,1 Hz** | Translação ±3px **com rotação** ±0,25° de toda a tela |
| 41 | Scanlines `rgba(0,0,0,.30)` em faixas de 1px/3px, `opacity .6` na banda 4 | estático | Padrão listrado de alto contraste com **>5 pares claro-escuro** |
| 45 | `glitch` | `.09s` = **11,1 Hz** | Overlay vermelho pulsante |
| 42 | `grainShift` sobre 90 partículas | `.28s` = 3,6 Hz | Ruído deslocando-se |

Os quatro ocorrem **simultaneamente**, por construção, exatamente no momento de maior tensão do jogo. O elemento crítico é a **combinação 1 + 2**: um padrão listrado de alto contraste com mais de cinco pares claro-escuro, **oscilando a 11,1 Hz**. A WCAG 2.3.1 cobre padrões, não só flashes, e 11 Hz cai dentro da faixa de 3–55 Hz de maior risco fotoconvulsivo — a banda de 15–25 Hz é a mais perigosa, mas 11 Hz não é segura. Somado a isso, uma tela inteira rodando e transladando a 11 Hz é um gatilho vestibular direto, independente de epilepsia.

**Por que isso sai da fila, e não é apenas "P1 alto".**

1. **Assimetria de custo.** O custo de errar para o lado da cautela é **1,5 hora**. O custo de errar para o outro lado é uma convulsão fotoconvulsiva ou uma crise vestibular em uma criança de 8 anos, em sala de aula, com um professor que não sabe que o software causou. Não existe cálculo de priorização em que 1,5 hora de trabalho perde para esse desfecho. Nenhum item entre os 36 tem essa assimetria.
2. **A dependência arquitetural não existe.** Esta é a razão técnica decisiva, e ela desfaz a premissa da pergunta. As 7 keyframes estão **todas em um único bloco `<style>`** nas linhas 656–673. A guarda é uma media query nesse mesmo bloco:
   ```css
   @media (prefers-reduced-motion: reduce){
     *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
     .rumble,.rumbleHard{animation:none!important}
   }
   ```
   `!important` em folha de autor vence declarações inline sem `!important` — portanto isso neutraliza também os `animation:` inline das linhas 40, 42, 45 e 51, que são o grosso do risco. **Uma inserção, num bloco que já existe, sem tocar em nenhuma das duas raízes do grafo de causalidade (TD-SYS-05 e TD-SYS-08).** A correção não passa por Tailwind (é CSS puro), não passa pela fronteira de `src/` (é o mesmo arquivo), não precisa de tokens e não precisa que o monolito seja quebrado. **Ela é ortogonal a toda a fundação.** O argumento de sequenciamento simplesmente não se aplica a ela.
3. **Ela não é refeita depois.** A preocupação legítima do @architect com ordenação — "mover 168 blocos de estilo duas vezes" — não vale aqui: a media query migra intacta para `src/styles/` quando a fundação chegar. Zero retrabalho.
4. **Sem Git é aceitável neste caso.** Sei que isso confronta TD-SYS-04 como P0 absoluto. Sustento mesmo assim: a mudança é **puramente aditiva** (uma media query nova, nenhuma linha existente alterada) e trivialmente reversível por deleção. O argumento de "sem rollback nada é seguro" tem força proporcional ao risco de regressão da mudança — e aqui ele é próximo de zero. Se o @qa discordar, a alternativa é fazer Git primeiro e a guarda imediatamente depois; **ainda assim antes de TD-SYS-05, 02, 03 e 01.**

**O que exatamente executar (1,5 h):**

| Passo | Trabalho | Horas |
|---|---|---|
| 1 | Media query `prefers-reduced-motion` no bloco `css` (linhas 656–673) — neutraliza as 7 keyframes e os 4 `animation:` inline | 0,25 |
| 2 | `Boom` (linha 167): guarda em JS via `matchMedia` — suprimir o flash branco de tela cheia (linha 179–180), reduzir 50 partículas a estado estático, preservar `onDone(4000)` para não quebrar a máquina de estados | 0,5 |
| 3 | Reduzir `glitch`/`rumbleHard` de `.09s` para ≥ `.34s` (< 3 Hz) **também no modo padrão** — abaixo do limiar da 2.3.1 mesmo sem preferência declarada, porque a maioria das crianças nunca configurou `prefers-reduced-motion` no dispositivo da escola | 0,25 |
| 4 | Verificação manual nas 5 fases em `heat ≥ 90` + `Boom` | 0,5 |

O **passo 3 é o mais importante e o mais fácil de esquecer.** `prefers-reduced-motion` só protege quem já sabia que precisava de proteção. Uma criança de 8 anos num Chromebook compartilhado da escola nunca ativou essa flag. Uma guarda que depende exclusivamente da preferência do sistema **protege quase ninguém no público-alvo real deste produto**. Baixar a frequência abaixo de 3 Hz por padrão é o que efetivamente remove o risco.

**Resumo do parecer:** eleve UX-D07 a **CRÍTICA** por severidade e a **P0-SAFETY** por prioridade, fora da fila de sequenciamento. Não é uma exceção ao método de priorização — é o reconhecimento de que a fila ordena *dependências técnicas*, e este item não tem nenhuma.

### 2.2 — Pergunta 3: UX-D02, tokens e a restrição do Tailwind

**Confirmo a sua leitura**, com uma correção de escopo: manter `style` inline lendo de `src/styles/tokens.ts`, **sem introduzir arbitrary values** enquanto TD-SYS-08 não estiver resolvido. O inline aqui é decisão deliberada e correta (invariante §2.3.1), não descuido.

**Ordem em relação a TD-SYS-06 (quebra do monolito): tokens ANTES.** Categoricamente.

O seu receio é mover 168 blocos duas vezes. Ele se inverte:

- **Tokens antes → mover 1×.** A substituição de literais por referências é uma transformação **local e mecânica** (`color:'#8d959e'` → `color:tokens.color.textMuted`), que não depende de onde o bloco vive. Feita no monolito, os 168 blocos viajam já corrigidos quando o arquivo for fatiado.
- **Monolito antes → mover 2× e perder a fonte única.** Fatiar primeiro **espalha os 168 blocos por ~18 arquivos**, e a varredura de literais passa a ser 18 varreduras sem garantia de completude — exatamente o drift que UX-D02 descreve, agora institucionalizado pela estrutura de diretórios.

Além disso, `tokens.ts` é um **módulo folha, sem dependências**: pode ser criado hoje, no estado atual do repositório, sem esperar TD-SYS-05 (fronteira de `src/`). É o segundo item com dependência zero, depois de UX-D07.

**Consequência para o gate:** com os tokens no lugar, as duas correções de contraste do §1.3 (`#6b7280`, `#ef4444`) passam a ser **duas linhas alteradas**, não uma varredura. UX-D14 depende de UX-D02 para ser barato.

### 2.3 — Pergunta 5: NC-002 é público adulto — segunda escala ou segundo tema?

**Nem uma coisa nem outra: uma escala tipográfica única com dois pontos de entrada semânticos.** Um segundo tema seria erro estrutural — não há mudança de *paleta*, há mudança de *densidade*.

A causa real do problema está no UX-D23, que descobri nesta revisão: existem **93 `fontSize` numéricos e zero `rem`**. Criar uma "segunda escala" sobre essa base multiplicaria o defeito por dois. A resposta correta é normalizar primeiro:

```text
size/
  scale/     xs .75rem · sm .875rem · base 1rem · lg 1.25rem · xl 1.5rem · 2xl 2rem
  role/
    panel/   label → xs · lcd → sm · gauge-read → lg     (aluno, imersivo, denso)
    report/  label → sm · body → base · metric → xl      (adulto, legibilidade > imersão)
```

Uma escala, dois mapeamentos de papel. `ReportSection` consome `role.report`, o painel consome `role.panel`. Trocar a densidade é trocar o mapeamento, não a escala — e o `prop size={9}` do `Label` (que hoje é número mágico) vira `size="xs"`.

**Ganho colateral:** ao expressar a escala em `rem`, o UX-D23 é resolvido pelo mesmo trabalho. Recomendo **fundir UX-D23 dentro da entrega de UX-D02** — o custo marginal é pequeno e separá-los garante que o `rem` nunca aconteça.

**Decida agora, como você pediu:** escala única, dois papéis, unidades em `rem`. Essa é a estrutura dos tokens.

### 2.4 — Pergunta 4: UX-D16 — as primitivas são pré-requisito das 3 telas?

**Não todas. E sim, existe uma story-piloto.**

| Primitiva | Pré-requisito de | Veredito |
|---|---|---|
| `EmptyState` | NC-001, NC-002 | ✅ **Sim** — é AC explícito nas duas |
| `MetricBadge` | NC-003 | ✅ **Sim** — o AC "ranking e gráficos identificam quando a métrica é ponderada" *é* o badge |
| `LiveAnnouncer` | UX-D05 | ⚠️ Não bloqueia as telas; bloqueia a conformidade |
| `ScreenLayout` | — | ❌ **Não bloqueia.** É economia de duplicação, não capacidade |
| `LoadingState` | — | ❌ Não bloqueia (ver rebaixamento de UX-D08) |
| `ErrorState` | — | ❌ Pertence a TD-SYS-18 |

**Story-piloto recomendada: NC-003 (badge de métrica ponderada).**

É a de menor superfície das três: não cria tela nova, **anexa-se ao `ranking`/`analise` que já existem**, reusa `Plate`/`Label`/`Lcd` sem modificação, e precisa de exatamente uma primitiva nova (`MetricBadge`, ~4 h). Ao mesmo tempo exercita a cadeia inteira de fundação de ponta a ponta: consome tokens (§2.2), exige uma função de domínio isolável para o cálculo ponderado — que é precisamente a primeira extração pedida por TD-SYS-07 e o primeiro teste comportamental real de TD-SYS-03 — e força o `StorageAdapter` a lidar com registros legados sem campo de fase.

É a menor story que valida a fundação inteira. **NC-001 é a pior escolha para piloto**: exige tela nova completa, `EmptyState`, e uma variante de progresso.

### 2.5 — Pergunta 7: baseline de a11y realista

**Subconjunto priorizado, não WCAG 2.1 AA integral.** AA integral neste código é ~62 h e produziria uma story impossível de fechar; o subconjunto abaixo é 28 h e captura a quase totalidade do dano real.

**Parada 1 — "Não machuca, não exclui" (28 h, alvo desta rodada):**

| # | Critério | WCAG | Horas | Débito |
|---|---|---|---|---|
| 1 | Movimento reduzido + frequência < 3 Hz por padrão | 2.3.1 | 1,5 | UX-D07 |
| 2 | Nome acessível nos 27 botões + `aria-hidden` nos 8 ícones | 4.1.2 | 6 | UX-D05 |
| 3 | Foco visível em todos os interativos; remover `outline-none` sem substituto | 2.4.7 | 4 | UX-D05 |
| 4 | Foco movido e anunciado nas 9 transições de `mode` | 2.4.3 | 4 | UX-D19 |
| 5 | `aria-live` para estado crítico (`polite`; `assertive` só no meltdown) | 4.1.3 | 8 | UX-D05 |
| 6 | Cor nunca é canal único — ícone + rótulo textual por faixa | 1.4.1 | 12 | UX-D06 |
| 7 | Corrigir os 2 contrastes medidos | 1.4.3 | 2 | UX-D14 |
| 8 | Texto em `rem`; suportar 200% de resize | 1.4.4 | 10 | UX-D23 |

*(soma > 28 h porque os itens 6, 7 e 8 são contabilizados nos seus próprios débitos; o pacote UX-D05 isolado são 28 h — itens 2, 3 e 5 mais os `role` estruturais.)*

**Parada 2 — diferir explicitamente:** 1.4.10 Reflow (depende de UX-D11), 2.5.5 alvos 44×44 (é AAA), navegação por landmarks, skip links, todo o nível AAA.

**Justificativa da linha de corte:** os itens 1–8 são os que produzem **exclusão categórica ou dano**. O resto produz atrito. Em produto educacional infantil, a diferença entre "difícil de usar" e "impossível de usar" é a única fronteira que justifica bloquear entrega. E registro o argumento não-técnico: um produto usado em escola pública brasileira está sob a LBI (Lei 13.146/2015) e o eMAG. O item 6 tem peso extra aqui — se a criança daltônica erra por não distinguir a faixa, o produto **corrompe a própria métrica pedagógica** que NC-002 e NC-003 vão reportar ao professor. Não é só exclusão: é dado inválido.

### 2.6 — Pergunta 6: UX-D17 — `pause` e calendário

**Concordo: documentar, não remover.** E rebaixo de MÉDIA para **BAIXA** — é débito de governança, sem impacto sobre usuário.

**Sobre o calendário, especificamente: preservar, e ele é mais valioso do que a Fase 3 registrou.** Reabri a implementação (linha 986): é uma grade de dias com célula colorida por acurácia (`colOf(accuracy)`) e `minHeight:35`. Isso é um **heatmap de consistência de prática** — exatamente a visualização de "tempo de prática" que NC-002 pede ao responsável, já construída. Removê-lo seria destruir um insumo de uma story ainda não implementada.

**Recomendação:** uma story de documentação (3 h) que registre ambos no `handoff` e adicione `pause` e `calendarCursor` ao mapa de `mode`. Ao documentar o calendário, registre-o explicitamente como **candidato a reuso em NC-002** — assim a story de NC-002 encontra a peça em vez de reconstruí-la.

### 2.7 — Pergunta 8: dispositivo de referência para UX-D18

**Chromebook de entrada, e o alvo já está codificado no produto.**

`getViewportScale()` (linha 250) normaliza por `390 × 844` — o retrato de um iPhone 12/13. Esse é o **alvo real de design implícito**, e ele contradiz o contexto de sala de aula que o próprio produto assume.

Recomendo dois dispositivos, não um:

| Papel | Dispositivo | Por quê |
|---|---|---|
| **Piso de performance** | Chromebook de entrada (Celeron N4020, 4 GB) | É o hardware dominante em programas públicos brasileiros e o pior caso realista para o `Boom` de 4 s e o tique de 60 ms |
| **Piso de layout** | Tablet Android 10", 1280×800, retrato e paisagem | Paisagem é o modo que a coluna única nunca tratou; expõe UX-D11 e UX-D15 juntos |

**Orçamento proposto:** LCP < 2,5 s · INP < 200 ms no teclado · CLS < 0,1 · **60 fps sustentados durante `heat ≥ 90`** — esta última é a métrica que importa, porque é onde `rumbleHard` + scanlines + 90 partículas de grão + `vigPulse` rodam juntos. Se houver queda de frames aí, ela agrava UX-D07: animação a 11 Hz com frames perdidos produz padrão temporal irregular, que é **mais** provocativo que o regular, não menos.

**Ordem:** medir antes de otimizar. Não há evidência em nenhuma direção, e TD-SYS-12 (bundle de 910 KB) pode ser irrelevante num contexto de rede local ou decisivo num Wi-Fi escolar saturado — sem número, é palpite.

### 2.8 — Pergunta 1: elevações ⬆

Respondida em §1.2. **Sustento as três.** A minha "Crítica" da Fase 3 de fato significava "bloqueia trabalho de UI", mas as três têm justificativa arquitetural independente que sustenta a elevação. Não reverta.

---

## 3. Débitos Adicionados

Quatro débitos que nem a Fase 1 nem a Fase 3 capturaram.

### UX-D23 — Tipografia em px absoluto impede resize do usuário
**Severidade: ALTA · 10 h · P1-UX**
**Evidência:** 93 `fontSize` numéricos, **0 ocorrências de `rem` ou `em`** em 1.343 linhas. Agravado por `zoom:var(--nc-scale)`, que reescala tudo por conta própria e ignora a preferência do usuário.
**Por que é grave:** WCAG 1.4.4 exige 200% de resize sem perda. Aqui não há **nenhum** caminho: nem a preferência do navegador, nem a do sistema, nem o zoom do usuário sobrevivem ao `zoom` fixo. Criança com baixa visão e projeção em sala de aula ficam sem recurso. É mais completa que UX-D14 (contraste ruim ainda é legível de perto; texto de 9px que não escala, não).
**Remediação:** normalizar para `rem` dentro da entrega de UX-D02 (§2.3).

### UX-D24 — Dado pessoal de criança sem exclusão nem pseudonimização
**Severidade: ALTA · 8 h · P2-UX**
**Evidência:** nome do operador + histórico completo de desempenho persistem em `window.storage` indefinidamente. **Zero ocorrências** de fluxo de exclusão/remoção de operador. O ranking exibe nomes reais a toda a turma no dispositivo compartilhado.
**Por que é grave:** é dado pessoal de menor, coletado sem consentimento, sem direito de eliminação (LGPD art. 18, V; art. 14 trata especificamente de menores), exposto socialmente num ranking que compara crianças pelo nome. O dano de UX é próprio e independente do jurídico: um ranking nominal público é um desincentivo direto para a criança que mais precisa praticar.
**Remediação:** fluxo de exclusão de operador (4 h) + opção de apelido/inicial no ranking (4 h).
**Nota para @qa:** isto responde parcialmente à sua pergunta 4.2.4 do @architect ("há risco de privacidade de dados de menores?"). **Sim, e ele é de UI, não de banco** — não existe banco, e o risco existe assim mesmo.

### UX-D22 — Folha de estilo dentro do render, replicada em 6 telas
**Severidade: MÉDIA · 3 h · P3-UX**
**Evidência:** o elemento `<style>` (`const css`, linhas 656–673, 7 keyframes + camada responsiva) é renderizado nas raízes de 6 telas: linhas 685, 738, 965, 1137, 1188, 1232.
**Por que importa:** nenhum linter de CSS, minificador, ferramenta de a11y ou auditoria enxerga essas regras — elas são string dentro de JSX. É a razão pela qual `prefers-reduced-motion` nunca apareceu em nenhuma varredura automatizada. Reinjeção duplicada a cada troca de `mode`.
**Ironia útil:** é também o que torna UX-D07 corrigível em 15 minutos. **Não extraia essa folha antes de aplicar a guarda de movimento** — a ordem inversa converte uma correção de 1,5 h numa refatoração.

### UX-D25 — Atalhos de teclado implementados e não anunciados
**Severidade: BAIXA · 3 h · P3-UX**
**Evidência:** o efeito 3 (linha ~580) instala o listener global de teclado — caminho de entrada principal e invariante do projeto — mas nenhuma tela menciona sua existência.
**Por que importa:** é um recurso de acessibilidade **já pago** e desperdiçado por ausência de copy. Custa uma legenda.

---

## 4. Recomendações de Design

### 4.1 Sequência recomendada (ótica de UX)

Divergindo do §3 do DRAFT em dois pontos, e apenas dois:

| # | Ação | Horas | Depende de | Divergência do DRAFT |
|---|---|---|---|---|
| **0** | **UX-D07 — guarda de movimento + frequência < 3 Hz** | 1,5 | **nada** | 🔴 **P2 → P0-SAFETY.** Sai da fila (§2.1) |
| 1 | TD-SYS-04 Git + TD-SYS-16 `.gitignore` | — | — | ✅ concordo |
| 2 | **UX-D02 tokens + UX-D23 `rem`** | 34 | nada | 🟡 **antes** da quebra do monolito (§2.2) |
| 3 | TD-SYS-05 fronteira `src/` + TD-SYS-11 `vite.config` | — | 1 | ✅ concordo |
| 4 | TD-SYS-02/19/03/01 gates reais | — | 3 | ✅ concordo |
| 5 | TD-SYS-09 `StorageAdapter` + TD-SYS-07 domínio | — | 4 | ✅ concordo |
| 6 | **NC-003 como story-piloto + `MetricBadge`** | 4 | 5 | 🟡 piloto explícito (§2.4) |
| 7 | UX-D05 + UX-D19 + UX-D06 + UX-D14 — a11y parada 1 | 44 | 2 | ✅ concordo |
| 8 | UX-D10 `EmptyState` + TD-SYS-18 `ErrorBoundary` | 10 | 2 | ✅ concordo |
| 9 | TD-SYS-06 quebra do monolito | — | 2, 4 | ✅ concordo |
| 10 | UX-D24 privacidade + UX-D11 refluxo + resto P3 | 40 | 9 | — |

**Apenas duas divergências reais:** UX-D07 sai da fila; tokens vêm antes do monolito. Todo o resto do sequenciamento do @architect está correto e eu o endosso.

### 4.2 Princípios para as 3 telas novas

1. **Densidade por papel, não por tema** — `role.panel` (aluno) vs `role.report` (adulto) sobre uma escala única (§2.3).
2. **Todo dado carrega seu contexto** — o AC "não mistura contextos sem rotulagem" de NC-002 é regra de UI: operador e fase visíveis em cada bloco, sem exceção.
3. **Estado vazio é conteúdo, não ausência** — todo `EmptyState` diz *o que falta* e *o que fazer* ("jogue uma partida para liberar a análise"), nunca some em silêncio.
4. **Transparência pedagógica sem julgamento** — NC-001 explica *por que* aqueles fatores foram escolhidos, sem vocabulário de deficiência ("vamos treinar o 7" e não "você é fraco no 7").
5. **Métrica ponderada é sempre explícita** — badge + legenda com a fórmula; registro legado marcado como "anterior à ponderação", nunca como erro.
6. **Cor sempre acompanhada** — ícone ou rótulo textual (`SEGURO`/`ATENÇÃO`/`CRÍTICO`) em toda faixa de estado.

### 4.3 Forças a proteger explicitamente

Confirmo as do §2.4 do DRAFT e acrescento três descobertas desta revisão:

- **`lang="pt-BR"` no `index.html`** — presente e correto. Base de a11y que não precisa ser refeita.
- **A camada `.nc-shell` / `getDeviceClass` / `getViewportScale`** — imperfeita (é escala, não refluxo), mas é trabalho real de responsividade. **Não a jogue fora** ao corrigir UX-D11: evolua de `zoom` para refluxo preservando os breakpoints de 640/1024/1440 já escolhidos.
- **O heatmap de calendário (linha 986)** — insumo pronto para NC-002 (§2.6).
- **`Screw`, `Plate`, `Label`, `Lamp`, `Lcd`, `Valve`** — a decomposição correta já existe nessa camada. É o modelo para extrair o resto, e é a prova de que o time sabe fazer isso.

### 4.4 Regra de veto de UX (para a Fase 8)

Uma única regra que eu peço que entre no assessment final: **nenhuma story que toque a UI é aceita sem (a) nome acessível em todo interativo novo, (b) estado transmitido por pelo menos dois canais, (c) nenhuma animação acima de 3 Hz.** Os três são baratos no momento da escrita e caros na varredura posterior — é exatamente a dívida que os 36 itens deste documento representam, e é assim que ela para de crescer.

---

## 5. Decisões Autônomas Registradas

- `[AUTO-DECISION]` UX-D07 elevado a CRÍTICA/P0-SAFETY (razão: o @architect pediu posição explícita; a assimetria 1,5 h × dano físico e a ausência total de dependência arquitetural — a correção vive num bloco `<style>` já existente — tornam o argumento de sequenciamento inaplicável).
- `[AUTO-DECISION]` Registrada a medição que **enfraquece** a minha própria alegação de 2.3.1 quanto ao overlay isolado, e substituída pelo mecanismo real (`rumbleHard` a 11,1 Hz + scanlines) (razão: um veredito de segurança sobre medição errada não sobrevive a contestação na Fase 7).
- `[AUTO-DECISION]` Adicionado o passo 3 da remediação — reduzir frequência abaixo de 3 Hz **no modo padrão** (razão: `prefers-reduced-motion` protege apenas quem já configurou o dispositivo; no público real deste produto, isso é aproximadamente ninguém).
- `[AUTO-DECISION]` UX-D11 rebaixado de Alta para Média e reescopado (razão: a alegação "zero responsividade" é falsa — medi prefixos Tailwind, não responsividade; a camada existe nas linhas 666–672).
- `[AUTO-DECISION]` UX-D08 rebaixado de Alta para Média (razão: zero chamadas de rede; `loadAll()` é local; o risco real é falha, não espera, e pertence a TD-SYS-18).
- `[AUTO-DECISION]` UX-D02 rebaixado de Crítica para Alta, mantendo P1 (razão: não bloqueia story literalmente; garante degradação. Severidade e prioridade são eixos distintos).
- `[AUTO-DECISION]` UX-D15 rebaixado a Baixa e UX-D14 reescopado com medições (razão: 119×37px passa 2.5.8 AA; `#8d959e` mede 4,39–6,53:1 e majoritariamente passa — as falhas reais são `#6b7280` e `#ef4444`).
- `[AUTO-DECISION]` UX-D17 rebaixado a Baixa e o calendário marcado para preservação como insumo de NC-002 (razão: é um heatmap de consistência já construído).
- `[AUTO-DECISION]` UX-D23 recomendado para fusão dentro da entrega de UX-D02 (razão: custo marginal pequeno; separá-los garante que a normalização em `rem` nunca aconteça).
- `[AUTO-DECISION]` NC-003 designada story-piloto (razão: menor superfície de UI que ainda exercita tokens + domínio isolável + `StorageAdapter` + primeiro teste comportamental real).
- `[AUTO-DECISION]` Baseline de a11y = subconjunto priorizado de 8 critérios (28 h), não AA integral (62 h) (razão: a fronteira defensável é exclusão categórica vs atrito).
- `[AUTO-DECISION]` Nenhum código, config ou artefato foi alterado; nenhuma operação Git executada (razão: Fase 6 é revisão; Artigo III e autoridade de `@devops`).

---

## 6. Handoff para @qa (Fase 7)

| Item | O que preciso que você decida |
|---|---|
| **UX-D07** | A sua pergunta 4.2.1 do @architect ("existe classe de débito que fura a fila?") tem a minha resposta em §2.1: **sim, exatamente uma, e é esta.** Preciso do seu endosso para que a Fase 8 a congele como P0-SAFETY |
| **UX-D24** | A sua pergunta 4.2.4 sobre privacidade de menores tem resposta afirmativa e ela é de UI (§3). Avalie se isso muda o seu veredito |
| **Erros da Fase 3** | Três achados meus foram rebaixados por medição incorreta (§0.1). Se você exige rastreabilidade de correção de artefato anterior, o `frontend-spec.md` precisa de errata |
| **Regra de veto de UX** | §4.4 — se você a endossar, ela vira critério de gate para toda story de UI, não recomendação |

**Distribuição de frontend após esta revisão:** 2 CRÍTICA · 4 ALTA · 6 MÉDIA · 3 BAIXA = **15 débitos** (era 13) · **159,5 horas** · +34 h se WCAG 2.1 AA integral for exigido.

---

*— Uma, projetando para quem usa 🎨*
*Fase 6 · 15 débitos de frontend validados · 4 adicionados · 6 severidades ajustadas · 8 perguntas respondidas*
