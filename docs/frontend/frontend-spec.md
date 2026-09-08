# Frontend Spec — Nuclear Challenge

**Fase 3 do Brownfield Discovery** (`create-front-end-spec`)
**Agente:** @ux-design-expert (Uma)
**Data:** 2026-09-07
**Escopo:** análise do frontend existente, lacunas de design system e débitos de UX/UI

---

> **ERRATA (Fase 6) — LEIA ANTES DE USAR ESTE DOCUMENTO:** a revisão de Fase 6 (`docs/reviews/ux-specialist-review.md`, §0.1 e §5) reabriu o código-fonte e **falsificou seis achados desta Fase 3**. Nenhum texto original foi removido — as correções aparecem como blocos `ERRATA (Fase 6)` junto ao trecho afetado, e as severidades revistas estão marcadas com ~~riscado~~ na tabela do §5. Onde houver conflito, **a Fase 6 prevalece**.
>
> | Achado | Correção da Fase 6 | Onde |
> |---|---|---|
> | **UX-D11** "Zero responsividade" | ❌ **Factualmente errado** — a camada responsiva existe | §2.5, §5, §6 |
> | **UX-D14** "contraste provável falha" | ⚠️ Parcialmente errado — medido, 2 falhas reais | §2.6, §5 |
> | **UX-D15** "alvos <44×44" | ⚠️ Rebaixado — medido, passa AA (2.5.8) | §4.4, §5 |
> | **UX-D08** "sem loading state" | ⚠️ Rebaixado — app não faz chamadas de rede | §2.8, §5 |
> | **UX-D07** "flicker vermelho" | ✅ Confirmado, mas **o mecanismo descrito estava errado** e o risco é maior | §2.6, §5 |
> | **UX-D02** "design system inexistente" | ⚠️ Severidade rebaixada (Crítica → Alta), prioridade mantida | §5 |
> | **UX-D17** `pause`/calendário | ⚠️ Rebaixado a Baixa; calendário é **ativo a preservar** | §5, §6 |
>
> A Fase 6 também **adicionou 4 débitos** que esta Fase 3 não capturou (UX-D22 a UX-D25) — ver §3 da revisão. Total revisto de frontend: **15 débitos validados · 159,5 h**.

---

## 1. Stack de UI

| Camada | Tecnologia | Versão | Situação |
|---|---|---|---|
| Runtime | React + React DOM | ^19.2.8 | Instalado |
| Build | Vite | ^8.2.2 | Instalado, **sem `vite.config.*`** |
| Linguagem | TypeScript | ^7.0.2 | `tsconfig.json` existe; app com `// @ts-nocheck` |
| Ícones | lucide-react | ^1.42.0 | Em uso — 8 ícones (`Shield`, `Volume2`, `VolumeX`, `Droplets`, `Zap`, `HeartPulse`, `Wind`, `FlaskConical`) |
| Gráficos | recharts | ^3.10.1 | Em uso — Bar, Radar, Line, Tooltip, Legend, ResponsiveContainer |
| CSS | Tailwind CSS v4.3.3 **pré-compilado** | — | `public/legacy-assets/index-Bh3JlXdk.css` (17,9 KB), sem toolchain |
| Áudio | Web Audio API (sintetizada) | nativo | Sem arquivos externos |
| Persistência | `window.storage` | — | `localStorage`/`sessionStorage` **proibidos** por contrato |

**Não existe:** Tailwind como dependência, PostCSS, design-token layer, biblioteca de componentes (shadcn/Radix/MUI), CSS Modules, styled-components, Storybook, testing-library, ferramenta de a11y (axe/jest-axe).

---

## 2. Estado Atual

### 2.1 Estrutura de arquivos

```text
index.html                                 → carrega /legacy-assets/*.css e /src/main.jsx
src/
└── main.jsx (9 linhas)                    → importa App de FORA de src/
public/legacy-assets/
└── index-Bh3JlXdk.css                     → bundle Tailwind v4 congelado
Arquivos_Diversos/
├── nuclear-challenge-app.tsx (1.342 linhas)  → o app inteiro, monolito
├── handoff-01..04                            → fonte de verdade do produto
├── usina/ e usina-legacy-backup/             → builds legados (JS/CSS minificados)
```

**Achado crítico:** `src/main.jsx` faz `import App from '../Arquivos_Diversos/nuclear-challenge-app.tsx'`. O único artefato de UI real do projeto vive **fora** de `src/`, em uma pasta de documentos/handoff. Não há `src/App.tsx`, `src/components/`, `src/styles/` nem qualquer módulo de UI dentro da árvore de código.

### 2.2 Componentes UI existentes

Todos definidos no mesmo arquivo monolítico, como `const` de módulo (mais `Boom` como `function` no fim, por hoisting). Nenhum é exportado, testado ou documentado isoladamente.

| # | Componente | Linha | Tipo (Atomic) | Props | Observação |
|---|---|---|---|---|---|
| 1 | `Ambient` | 32 | Overlay | `heat` | Vinheta/scanlines/flicker por faixa de calor; usa `GRAIN` (90 pontos gerados 1× no módulo) |
| 2 | `PreMelt` | 50 | Overlay | `secs` | Contagem regressiva de meltdown, `zIndex 45` |
| 3 | `Screw` | 60 | Átomo | `className` | Decorativo puro (7×7px) |
| 4 | `Plate` | 66 | Molécula/container | `children`, `className`, `glow` | Container universal do painel |
| 5 | `Label` | 75 | Átomo | `children`, `className`, `size=9` | `size` é **prop numérica**, não classe Tailwind |
| 6 | `PauseButton` | 79 | Átomo | `onClick` | Único componente com `aria-label` desde a origem |
| 7 | `Lcd` | 85 | Átomo | `value`, `unit`, `color`, `size=13` | Visor afundado com brilho de fósforo |
| 8 | `Lamp` | 92 | Átomo | `on`, `hue`, `label` | `hue`: red \| amber \| green |
| 9 | `CoreGauge` | 102 | Organismo | `temp`, `delta`, `danger`, `frozen` | SVG 170×120, arco de 240°, ponteiro com contrapeso |
| 10 | `Support` | 137 | Molécula | `label`, `value`, `unit`, `pct`, `I`, `inv`, `warn` | Ícone + rótulo + LCD + barra |
| 11 | `Valve` | 150 | Molécula | `label`, `sub`, `I`, `cd`, `maxCd`, `disabled`, `color`, `onClick` | Recarga esvazia da esquerda |
| 12 | `Boom` | 167 | Organismo/animação | `onDone` | 4 passos temporizados, 50 partículas, 4 s total |

**Total: 12 componentes.** Nenhum layout compartilhado (não há `PageLayout`, `Screen`, `Modal`, `Card`). Cada uma das 9 telas monta sua própria árvore inline dentro de `App`.

### 2.3 Design system / tokens

Existe um objeto informal `DS` no módulo (acabamentos), mais uma paleta semântica documentada apenas em prosa no `handoff-02-referencia.md`:

```javascript
const DS = { metal, bezel, recess, raised, glass, brush }  // gradientes e sombras
```

| Cor | Uso semântico documentado |
|---|---|
| `#7dd3fc` / `#06b6d4` | Ciano — interface, rótulos, identidade |
| `#22c55e` / `#4ade80` | Verde — confirmação, faixa segura |
| `#f59e0b` / `#fbbf24` | Âmbar — atenção, prioritária, sequência |
| `#ef4444` / `#f87171` | Vermelho — risco real de perda |
| `#8d959e` / `#6b7280` | Cinza — texto normal |

**Isso não é um design system.** É um objeto de estilos + convenção verbal. Faltam: tokens formais (DTCG/CSS vars), escala tipográfica, escala de espaçamento, escala de raios/sombras nomeada, tokens de motion/duração, tokens semânticos vinculados a estado (`--color-danger`, `--color-safe`), e qualquer forma de tema.

Evidência quantitativa: **168 blocos `style={{ ... }}` inline** contra 222 usos de `className`. Os valores de cor estão hardcoded literalmente ao longo das 1.342 linhas — não há uma única fonte de verdade consultável em runtime.

**Restrição herdada (armadilha #1 do handoff):** valores arbitrários do Tailwind não funcionam neste setup. Foi por isso que a equipe adotou props numéricas (`size`) e `style` inline. A restrição é real e deve ser respeitada até que o toolchain do Tailwind seja reintroduzido.

### 2.4 Padrões de layout

Máquina de estados de tela via `mode` (9 valores):

| `mode` | Tela | Conteúdo |
|---|---|---|
| `login` | Cadastro | Input de nome + lista de operadores + atalho ranking |
| `menu` | Ficha do operador | 5 fases com recorde (★), botões ANÁLISE/RANKING/TROCAR |
| `play` | Painel de controle | Ver ordem vertical abaixo |
| `pause` | Pausa | Overlay (não documentado nos handoffs 1–4) |
| `win` / `lose` / `quit` | Relatório de partida | Relatório + promoção (só `win` e fase < 5) |
| `ranking` | Ranking | Abas GERAL, PARTIDAS, GRÁFICOS |
| `analise` | Análise pedagógica | Só renderiza acima de 10 operações |

Ordem vertical fixa da tela `play`:

```text
cabeçalho (UN-01, título, som, status)
CoreGauge
3 × Support (integridade, refrigerante, potência)
6 × Lamp
3 × Valve (alívio, boro, SCRAM)
área de conta: PAR DE CARTÕES  ou  ANEL + visor + OK   ← alterna, altura estável
teclado numérico 3×4
rodapé: SAIR, META, SEQ, TEMPO
```

O padrão "área de conta com altura estável" é uma decisão de UX correta e deve ser preservada: evita salto de layout (CLS) entre a fase de escolha e a fase de resposta.

### 2.5 Responsividade

**Zero breakpoints no código do app.** Contagem em `nuclear-challenge-app.tsx`: `sm:` = 0, `md:` = 0, `lg:` = 0. O CSS pré-compilado contém media queries em 40/48/64/80/96rem, mas nenhuma classe do app as aciona.

O layout é uma coluna única de largura fixa, projetada para retrato/desktop estreito. Não há tratamento para landscape em tablet, telas grandes ou telefones muito estreitos. Em um produto educacional que provavelmente será usado em sala de aula (tablets, Chromebooks, projeção), isso é um risco de adoção.

> **ERRATA (Fase 6) — UX-D11:** a afirmação **"Zero breakpoints no código do app"** está **factualmente errada** e a conclusão de "zero responsividade" não se sustenta. Ver `docs/reviews/ux-specialist-review.md` §0.1 e §4.3.
>
> **Erro de método:** contei prefixos Tailwind (`sm:`/`md:`/`lg:`) como *proxy* de responsividade. Como o Tailwind está pré-compilado e congelado (UX-D03), esse proxy não mede nada — **medi o instrumento errado**. A implementação real de responsividade não usa Tailwind.
>
> **O que existe de fato** em `nuclear-challenge-app.tsx`: a camada `.nc-viewport` / `.nc-shell` com a variável `--nc-scale`, **media queries próprias em 640 / 1024 / 1440px** (linhas 666–672, dentro do bloco `<style>` do §UX-D22) e detecção de dispositivo via `getDeviceClass` (linha 189) + `getViewportScale` (linha 250, normalizada por 390×844). É trabalho real de responsividade e **não deve ser jogado fora**.
>
> **O débito remanescente é outro, e menor:** responsividade **por escala, não por refluxo** — `zoom:var(--nc-scale)` (0,78–1,18) reescala em vez de reagrupar, o que não atende WCAG 1.4.10 (Reflow) e encolhe alvos de toque a ~29px no piso da escala. Severidade **Alta → Média**, 16 h, P2-UX. Correção = evoluir de `zoom` para refluxo **preservando os breakpoints 640/1024/1440 já escolhidos**.
>
> **Consequência para o assessment:** um assessment que herdasse esta Fase 3 sem a revisão teria priorizado responsividade (que já existe parcialmente) acima de resize de texto (UX-D23, que está integralmente quebrado e a Fase 3 não viu).

### 2.6 Acessibilidade (a11y)

Auditoria por varredura em `nuclear-challenge-app.tsx`:

| Marcador | Ocorrências | Leitura |
|---|---|---|
| `aria-*` | 3 | Apenas `PauseButton` e as 2 setas do calendário |
| `role=` | 0 | Nenhum papel ARIA explícito |
| `alt=` | 0 | (não há `<img>`; SVG sem `<title>`) |
| `tabIndex` | 0 | Sem gestão de foco |
| `<button>` | 27 | 24 sem nome acessível verificado |
| `focus:` | 1 | Praticamente sem estilo de foco visível |
| `outline-none` | 1 | Remove indicador de foco em pelo menos um elemento |
| `prefers-reduced-motion` | 0 | Nenhum respeito a redução de movimento |
| `onKeyDown` | 1 | Listener global de teclado (efeito 3), não por componente |

Riscos concretos:

- **CoreGauge, Lamp, Support, Lcd são SVG/divs puramente visuais.** Toda a informação de estado do jogo (temperatura, integridade, alarme) é transmitida apenas por cor, posição e brilho. Um leitor de tela não recebe nada. Não há `role="status"`/`aria-live` para anunciar mudança de fase, erro, meltdown iminente ou vitória.
- **Cor como único canal semântico.** Verde/âmbar/vermelho carregam sozinhos o significado de "seguro/atenção/risco". Falha WCAG 1.4.1 (Use of Color) e prejudica daltônicos — em um público-alvo infantil, isso é significativo.
- **Animações intensas sem escape.** `Boom` (flash branco, 50 partículas), `Ambient` (flicker vermelho ≥90 de heat, scanlines pulsantes) e `lampPulse` rodam sem checar `prefers-reduced-motion`. Flicker vermelho de tela cheia é um risco de fotossensibilidade (WCAG 2.3.1) em um app usado por crianças.

  > **ERRATA (Fase 6) — UX-D07:** o achado está **confirmado e elevado (Alta → CRÍTICA, P0-SAFETY)**, mas **o mecanismo que descrevi acima está errado**. Ver `docs/reviews/ux-specialist-review.md` §2.1.
  >
  > **Onde a Fase 3 exagerou:** o "flicker vermelho de tela cheia" é `rgba(239,68,68,.06)` com `glitch` variando opacidade de `.35` a `.9` — alfa efetivo **0,021 → 0,054**, ~2–3% de variação de luminância, **abaixo** do limiar de 10% do *general flash threshold*; e `rgb(239,68,68)` tem saturação 0,637, **abaixo** do 0,8 do *red flash threshold*. **Isolado, esse overlay não viola a 2.3.1.**
  >
  > **O mecanismo real, medido, é pior:** `rumbleHard` aplicado ao **`.nc-viewport` inteiro** a `.09s` = **11,1 Hz** (translação ±3px **com rotação** ±0,25°), simultâneo às scanlines `rgba(0,0,0,.30)` — padrão listrado de alto contraste com **>5 pares claro-escuro** — mais `glitch` a 11,1 Hz e `grainShift` a 3,6 Hz, todos juntos em `heat ≥ 90`. Combinação 1+2 = padrão de alto contraste oscilando a 11 Hz (faixa de risco fotoconvulsivo) + gatilho vestibular direto.
  >
  > **Correção de remediação:** `prefers-reduced-motion` **não basta** neste público — criança em Chromebook escolar compartilhado nunca configurou a flag. Exigir **também** frequência < 3 Hz **no modo padrão**. Custo total: 1,5 h, com **dependência arquitetural zero** (media query no bloco `<style>` que já existe) — por isso sai da fila de sequenciamento.

- **Foco não gerenciado nas transições de `mode`.** Ao trocar de tela, o foco não é movido nem anunciado.
- **Contraste não verificado.** Texto `#8d959e` sobre fundos metálicos escuros e `Label` com `letterSpacing .16em` em `size=9` (≈9px) muito provavelmente falham WCAG 1.4.3 (4.5:1) e 1.4.4 (resize).

  > **ERRATA (Fase 6) — UX-D14:** "não verificado" foi resolvido por **medição**, e a suspeita estava **parcialmente errada**. Ver `docs/reviews/ux-specialist-review.md` §1.3.
  >
  > | Cor | Pior caso (6 fundos reais) | Veredito AA |
  > |---|---|---|
  > | `#8d959e` (o que eu acusei) | 4,39–6,53:1 | ⚠️ Falha **marginal só** sobre `#2a3037` |
  > | `#6b7280` cinza-500 | **2,76:1** | ❌ Falha nos **6** fundos |
  > | `#ef4444` vermelho de perigo | **3,54:1** | ❌ Falha sobre `#2a3037` e `#23282e` |
  >
  > A paleta é **majoritariamente saudável**: existem exatamente **duas** correções de cor a fazer (`#6b7280` e `#ef4444`), não uma varredura. O pior caso é o **vermelho de perigo ilegível sobre o metal claro** — a cor cuja leitura mais importa —, que a Fase 3 não apontou. Estimativa cai de "auditoria completa" para **6 h** (2 h se feito depois dos tokens de UX-D02).
  >
  > **Nota separada sobre a segunda metade da frase original:** a suspeita de falha em **1.4.4 (resize)** estava certa, mas por razão diferente e muito mais grave — **93 `fontSize` em px e 0 `rem`/`em`**, agravados por `zoom:var(--nc-scale)`. Isso virou um débito próprio na Fase 6: **UX-D23 (ALTA, 10 h, P1-UX)**, que a Fase 3 não registrou.

### 2.7 Consistência visual

O acabamento industrial é coerente e é a identidade do produto — mérito real. Porém a consistência é **mantida por disciplina humana, não por sistema**: as mesmas cores e sombras são reescritas literalmente em dezenas de lugares. Não há garantia mecânica de que um novo componente use os mesmos valores, e não há Storybook nem catálogo visual para comparar.

### 2.8 Performance percebida

| Aspecto | Situação |
|---|---|
| Loading inicial | Estado `loading` existe (2 ocorrências) mas **não há componente de skeleton/spinner** — 0 `Skeleton`, 0 `Spinner` |
| Estado de erro | Só `storeErr` (aviso âmbar de falha de persistência). Não há error boundary, nem estado de erro por tela |
| Estado vazio | Regras espalhadas ("análise só acima de 10 operações", "radar só com ≥2 operadores", "gráficos 3/4/5 têm condições") — o handoff registra que gráficos "sumindo" já foi confundido com bug. Não há empty state explicativo |
| CLS | Bom no `play` (área de conta com altura estável); não avaliado nas demais telas |
| Re-render | Efeito 3 roda sem array de dependências **de propósito** — necessário para digitação. Consequência: listener recriado a cada render. Não regredir, mas medir |
| Física de animação | Agulha a 60 ms, tique de 1 s, `Boom` de 4 s — nenhum medido em dispositivo de baixo custo |

> **ERRATA (Fase 6) — UX-D08:** a linha "Loading inicial" acima descreve o fato corretamente (0 `Skeleton`, 0 `Spinner`), mas **a severidade Alta que dela derivei está errada — rebaixada para Média, P3-UX, 3 h**. Ver `docs/reviews/ux-specialist-review.md` §0.1 e §5.
>
> **Motivo:** a aplicação faz **zero chamadas de rede** (`technical-debt-DRAFT.md` §0.2). `loadAll()` é leitura local de `window.storage`, sub-segundo. A janela de espera que eu presumi — "tela em branco ou congelada", "usuário não sabe se travou" — **praticamente não existe**. O risco real nesse caminho não é *espera*, é **falha**, e ele já está coberto por **TD-SYS-18 (ErrorBoundary)**.
>
> **Consequência:** `LoadingState` **deixa de ser pré-requisito** das telas NC-001/002/003 (ver revisão §2.4). Não bloqueia nenhuma story.

> **ERRATA (Fase 6) — UX-D18, dispositivo de referência:** a linha "nenhum medido em dispositivo de baixo custo" recebeu alvo concreto na revisão (§2.7): **piso de performance** = Chromebook de entrada (Celeron N4020, 4 GB); **piso de layout** = tablet Android 10" 1280×800 em retrato **e paisagem**. Orçamento: LCP < 2,5 s · INP < 200 ms · CLS < 0,1 · **60 fps sustentados em `heat ≥ 90`** — esta última é a que importa, porque queda de frames a 11 Hz produz padrão temporal **irregular**, que agrava UX-D07 em vez de aliviá-lo.

---

## 3. Fluxos de Usuário Planejados (baseado nas stories)

As três stories NC-001/002/003 estão todas `Blocked — aguardando projeto executável`. Todas exigem, por contrato (`CLI First`, passo 5 do workflow), que o **contrato observável seja definido antes da UI**. Portanto os fluxos abaixo são a especificação de consumo, não de decisão.

### 3.1 NC-001 — Modo de treino dirigido

**Persona:** aluno. **Objetivo:** praticar apenas as tabuadas apontadas como fracas.

```text
menu → [novo botão TREINO DIRIGIDO]
     → tela de treino (sem reator, sem timer)
        · leitura de players[player].stats.tabs
        · fatores ordenados por desempenho
        · operação gerada com fatores obrigatórios
        · meta leve de acertos consecutivos (não pontuação, não fase)
     → feedback por resposta (acerto / erro com a conta correta)
     → resumo de sessão → volta ao menu
```

Requisitos de UI derivados dos ACs:

- Precisa de um **estado vazio real**: "sem dados suficientes ainda — jogue uma partida" (AC de fallback documentado para dados vazios).
- **Sem reator e sem timer** ⇒ o painel completo NÃO se aplica. É uma tela nova, mais calma, que reaproveita `Plate`, `Label`, `Lcd` e o teclado 3×4, mas descarta `CoreGauge`, `Ambient`, `Valve`, `Lamp` e todo o alarme sonoro.
- Precisa comunicar **por que** aqueles fatores foram escolhidos (transparência pedagógica), sem julgar o aluno.
- A meta de acertos consecutivos precisa de um indicador de progresso — candidato natural a reuso de `Support` (barra) ou uma variante nova.

### 3.2 NC-002 — Relatório para responsável/professor

**Persona:** responsável ou professor (**não é o aluno** — público adulto, contexto diferente).

```text
menu ou ranking → [novo acesso RELATÓRIO]
     → visão consolidada a partir de stats + matches
        · evolução da taxa de acerto (linha)
        · tabuadas dominadas vs pendentes
        · tempo de prática
        · comparação direto vs inverso
     → identificação explícita de operador e fase em cada bloco
```

Requisitos de UI derivados dos ACs:

- **"Não mistura contextos sem rotulagem"** é um AC de UI, não de dados: todo gráfico e número precisa carregar rótulo visível de operador e fase.
- Público adulto ⇒ densidade informacional maior, legibilidade acima de imersão. A estética de sala de controle pode ser mantida como moldura, mas os números precisam de tipografia maior que os `size=9` do painel.
- Precisa de estado vazio para "sem dados" (AC explícito de teste).
- Reaproveita recharts, que já está no projeto.

### 3.3 NC-003 — Taxa de acerto ponderada por dificuldade

**Persona:** professor. **Objetivo:** comparar desempenho sem que partidas fáceis distorçam o ranking.

```text
ranking / relatório → métricas exibidas
     · índice ponderado pela dificuldade da fase
     · registros legados (sem campo de fase) com fallback explícito
     · ranking e gráficos IDENTIFICAM quando a métrica é ponderada
```

Requisitos de UI derivados dos ACs:

- **"Ranking e gráficos identificam quando a métrica é ponderada"** é puramente de UI: exige um badge/afixo consistente (ex.: sufixo "POND." ou ícone) e uma legenda explicando a fórmula.
- Registros legados precisam de marcação visual distinta ("dado anterior à ponderação"), sem parecer erro.
- Alternância entre métrica bruta e ponderada deve ser um controle explícito, não uma troca silenciosa.

### 3.4 Fluxos existentes (preservar, não regredir)

```text
login → menu → play(fase 1..5) → win → continueGame → play(fase+1)
                              ↘ lose (meltdown ou integridade)
                              ↘ quit
        ↘ ranking (GERAL | PARTIDAS | GRÁFICOS)
        ↘ analise (só acima de 10 operações)
```

---

## 4. Design System Recomendado

Proposta mínima viável, alinhada às restrições reais do projeto (sem tecnologia nova não validada, passo 5/gate do workflow).

### 4.1 Camada de tokens (prioridade 1)

Extrair `DS` + a paleta semântica para um módulo único de tokens em `src/styles/tokens.ts`, exposto também como CSS custom properties. Estrutura sugerida:

```text
color/
  base/       ciano-300, ciano-500, verde-500, ambar-500, vermelho-500, cinza-400, cinza-500
  semantic/   identity, safe, attention, danger, text-muted, text-strong
  surface/    metal, bezel, glass, recess-shadow, raised-shadow, brush
size/         label-9, lcd-13, gauge-read, report-body (público adulto ≠ público aluno)
space/        escala 2/4/6/8/12/16
motion/       instant-80, quick-400, boom-1200, boom-total-4000
              + regra global: todas respeitam prefers-reduced-motion
```

Não introduzir Tailwind arbitrary values enquanto não houver toolchain — manter `style` inline **lendo dos tokens**, não de literais.

### 4.2 Biblioteca de componentes (prioridade 2)

Mover os 12 componentes para `src/components/` com um arquivo por componente, mantendo a ordem de declaração segura (`Ambient`/`PreMelt` antes de `App`, `Boom` pode ficar por último). Adicionar:

| Novo componente | Motivo |
|---|---|
| `ScreenLayout` | Elimina a duplicação de cabeçalho/rodapé nas 9 telas |
| `EmptyState` | ACs de NC-001 e NC-002 exigem dados vazios tratados |
| `LoadingState` | O estado `loading` existe sem representação visual |
| `ErrorBoundary` + `ErrorState` | Hoje só há `storeErr` |
| `MetricBadge` | AC de NC-003 (identificar métrica ponderada) |
| `ReportSection` | Densidade adulta para NC-002 |
| `LiveAnnouncer` (`aria-live`) | Sem isso, o jogo é inacessível a leitor de tela |

> **ERRATA (Fase 6) — UX-D16 / UX-D08:** esta lista trata as 7 primitivas como se fossem igualmente pré-requisito das telas novas. **Não são.** Ver `docs/reviews/ux-specialist-review.md` §2.4.
>
> | Primitiva | Bloqueia? |
> |---|---|
> | `EmptyState` | ✅ **Sim** — AC explícito de NC-001 e NC-002 |
> | `MetricBadge` | ✅ **Sim** — o AC de NC-003 *é* o badge |
> | `LiveAnnouncer` | ⚠️ Não bloqueia as telas; bloqueia a **conformidade** (UX-D05) |
> | `ScreenLayout` | ❌ **Não bloqueia** — é economia de duplicação, não capacidade |
> | `LoadingState` | ❌ **Não bloqueia** — ver errata de UX-D08 no §2.8 |
> | `ErrorBoundary` / `ErrorState` | ❌ Pertence a **TD-SYS-18**, não a esta camada |
>
> Correlato: **UX-D16 rebaixado Média → Média com reclassificação de natureza** — as 3 telas são **escopo de produto**, não débito; o débito é só a ausência das primitivas compartilhadas (20 h). **Story-piloto designada: NC-003** — menor superfície, anexa-se a `ranking`/`analise` que já existem, e ainda assim exercita tokens + domínio isolável + `StorageAdapter` de ponta a ponta. **NC-001 é a pior escolha para piloto.**

### 4.3 Regras de acessibilidade a adotar

1. Todo estado crítico (heat, integridade, meltdown, acerto/erro) ganha texto equivalente via `aria-live="polite"` — e `assertive` só para meltdown.
2. Cor nunca é canal único: cada faixa recebe também ícone ou rótulo textual (`SEGURO`/`ATENÇÃO`/`CRÍTICO`).
3. `prefers-reduced-motion: reduce` desliga flicker, scanlines, `lampPulse` e reduz `Boom` a um estado estático.
4. Foco visível obrigatório em todos os 27 botões; remover o `outline-none` sem substituto.
5. Foco movido para o `<h1>`/região principal a cada troca de `mode`.
6. Contraste mínimo 4.5:1 para texto informativo; `Label` decorativo pode ser 3:1 desde que a informação exista em outro lugar.
7. Teclado físico já é caminho principal (efeito 3) — formalizar como recurso a11y documentado, com legenda de atalhos visível.

### 4.4 Responsividade a adotar

- Container fluido com `max-width` em vez de largura fixa.
- Três alvos: telefone retrato (mínimo 360px), tablet retrato (alvo primário de sala de aula), desktop.
- `play` mantém coluna única; `ranking`, `analise` e o futuro relatório NC-002 ganham grid de 2 colunas a partir de 48rem.
- Teclado 3×4 com alvos de toque ≥44×44px (WCAG 2.5.5) — hoje não verificado.

> **ERRATA (Fase 6) — UX-D11 / UX-D15, esta seção inteira:** as quatro recomendações acima foram escritas sob a premissa errada de que **não havia responsividade alguma**. Ver `docs/reviews/ux-specialist-review.md` §0.1, §1.1 e §4.3.
>
> - **"Container fluido com `max-width` em vez de largura fixa"** e **"três alvos"** — já existem parcialmente: `.nc-shell` com `--nc-scale` e media queries em **640/1024/1440px**. A recomendação correta não é *criar* a camada, é **evoluir `zoom` → refluxo preservando os breakpoints já escolhidos**.
> - **"alvos de toque ≥44×44px (WCAG 2.5.5) — hoje não verificado"** → **verificado e rebaixado**. Medição: teclado ≈ **119×37px**. Isso **passa** o SC 2.5.8 (24×24, AA da WCAG 2.2) e falha apenas o 2.5.5 (**AAA**). **Não é falha de conformidade AA** — severidade Média → **Baixa**, 3 h, P3-UX.
> - **O risco real de alvo de toque não é o tamanho base, é a interação com `zoom`:** no piso da escala (0,78) o alvo cai para **~29px**. Esse risco pertence a **UX-D11**, não a UX-D15 — e some junto com a migração para refluxo.
> - **Nota de escopo:** 2.5.5 (AAA) e 1.4.10 (Reflow) foram **explicitamente diferidos** para a Parada 2 do baseline de a11y (revisão §2.5). A Parada 1 (28 h) não os inclui.

---

## 5. Débitos Identificados

Severidade: **Crítica** (bloqueia stories ou viola gate), **Alta** (dano real a usuário/qualidade), **Média** (custo de manutenção), **Baixa** (polimento).

| ID | Débito | Severidade | Impacto UX |
|---|---|---|---|
| UX-D01 | Código de UI vive fora de `src/` — `main.jsx` importa `../Arquivos_Diversos/nuclear-challenge-app.tsx` | Crítica | Nenhuma story pode declarar File List válida; build/lint/typecheck não cobrem a UI; o app não é versionável como artefato de produto |
| UX-D02 | Ausência total de design system formal: cores e sombras hardcoded em 168 blocos `style` inline | ~~Crítica~~ → **Alta** ⬇ *(errata F6)* | Qualquer mudança de acabamento exige varredura manual; drift visual garantido conforme novas telas (NC-001/002/003) forem criadas |
| UX-D03 | Sem toolchain de CSS: Tailwind v4 pré-compilado e congelado em `public/legacy-assets/`, sem `tailwind.config`, `postcss.config` nem dependência no `package.json` | Crítica | Qualquer classe Tailwind nova é silenciosamente inerte; desenvolvedor descobre só em runtime |
| UX-D04 | `// @ts-nocheck` no topo do único arquivo de UI; nenhum componente tipado | Crítica | `npm run typecheck` passa sem validar nada da UI — gate de qualidade falso-positivo |
| UX-D05 | Acessibilidade praticamente inexistente: 3 `aria-*` em 1.342 linhas, 0 `role`, 0 `tabIndex`, 1 `focus:`, 1 `outline-none` | Crítica | Produto educacional inutilizável por leitor de tela e hostil a navegação por teclado assistida |
| UX-D06 | Estado do jogo comunicado só por cor (verde/âmbar/vermelho) — WCAG 1.4.1 | Alta | Aluno daltônico não distingue seguro de crítico; perde a partida sem entender por quê |
| UX-D07 | Animações intensas sem `prefers-reduced-motion`: flicker vermelho de tela cheia (heat ≥90), scanlines, flash branco do `Boom` — risco WCAG 2.3.1 | ~~Alta~~ → **CRÍTICA / P0-SAFETY** ⬆ *(errata F6)* | Risco de fotossensibilidade e desconforto em público infantil; sem escape possível |
| UX-D08 | Sem estados de loading: `loading` existe no state, 0 `Skeleton`/`Spinner` no código | ~~Alta~~ → **Média** ⬇ *(errata F6)* | Tela em branco ou congelada durante `loadAll()`; usuário não sabe se travou |
| UX-D09 | Sem tratamento de erro além do aviso `storeErr`; nenhum error boundary | Alta | Exceção em qualquer componente derruba o app inteiro para tela branca, sem recuperação |
| UX-D10 | Sem empty states: regras de exibição condicionais (análise >10 ops, radar ≥2 operadores, gráficos 3/4/5) fazem conteúdo "sumir" sem explicação — já confundido com bug segundo o handoff | Alta | Professor/aluno interpreta ausência de dado como falha do produto |
| UX-D11 | ~~Zero responsividade: 0 breakpoints `sm:`/`md:`/`lg:` no app; layout de coluna fixa~~ → **FACTUALMENTE ERRADO.** Débito real: responsividade **por escala, não por refluxo** — `zoom:var(--nc-scale)` (0,78–1,18) em vez de reflow; `play` é coluna única fixa; encolhe alvos a ~29px | ~~Alta~~ → **Média** ⬇ *(errata F6)* | ~~Inviável em tablet landscape e Chromebook~~ → A camada `.nc-shell` + media queries 640/1024/1440 **existe**. O que falha é 1.4.10 (Reflow), não a ausência de responsividade |
| UX-D12 | Monolito de 1.342 linhas com 12 componentes e ~40 estados em um único arquivo | Alta | Três stories concorrentes (NC-001/002/003) tocariam o mesmo arquivo; paralelismo bloqueado pelo passo 7 do workflow |
| UX-D13 | Nenhum componente exportado, testado ou catalogado; sem Storybook nem testes de UI (`npm test` roda só `tests/*.test.mjs`) | Alta | Regressão visual indetectável; ACs de teste das stories só cobrem lógica, não interface |
| UX-D14 | ~~Contraste não verificado: `#8d959e` sobre metal escuro~~ → **MEDIDO.** `#8d959e` = 4,39–6,53:1 (passa quase sempre). Falhas reais: `#6b7280` = **2,76:1** (6/6 fundos) e `#ef4444` = **3,54:1** sobre metal claro | Média ✅ *(mantida, reescopada — errata F6)* | ~~Provável falha 1.4.3/1.4.4~~ → O pior caso é o **vermelho de perigo ilegível**. Duas cores a corrigir, não uma varredura (6 h) |
| UX-D15 | ~~Alvos de toque não verificados (teclado 3×4, `Valve`, `Lamp`) contra o mínimo de 44×44px~~ → **MEDIDO:** teclado ≈ **119×37px** | ~~Média~~ → **Baixa** ⬇ *(errata F6)* | ~~Erros de toque em tablet~~ → **Passa** 2.5.8 (AA); falha só 2.5.5 (**AAA**). O risco real é a queda a ~29px sob `zoom` e pertence a UX-D11 |
| UX-D16 | Gap de escopo: nenhuma tela existe para NC-001 (treino dirigido), NC-002 (relatório) e NC-003 (badge de métrica ponderada) | Média | 3 telas/superfícies novas a projetar do zero, sem layout compartilhado disponível |
| UX-D17 | `mode === 'pause'` e o calendário (`calendarCursor`) existem no código mas não constam dos handoffs 1–4 nem das stories | ~~Média~~ → **Baixa** ⬇ *(errata F6)* | Funcionalidade sem rastreabilidade — viola Artigo IV (No Invention); ~~precisa ser documentada ou removida via story~~ → **documentar, nunca remover**: o calendário (linha 986) é um **heatmap de consistência de prática** já construído — insumo pronto para NC-002. Risco é de governança, não de usuário |
| UX-D18 | Nenhuma medição de performance percebida (LCP, INP, CLS) nem orçamento definido | Média | Efeito 3 sem array de dependências e tiques de 60 ms podem degradar em hardware escolar barato — sem evidência |
| UX-D19 | Foco não gerenciado nas 9 transições de `mode` | Média | Usuário de teclado é jogado para o topo do documento a cada tela |
| UX-D20 | Builds legados duplicados (`Arquivos_Diversos/usina/`, `usina-legacy-backup/`, `usina.zip`, `public/legacy-assets/`) com CSS/JS minificados | Baixa | Ambiguidade sobre qual é a fonte de verdade visual; risco de alguém editar o artefato errado |
| UX-D21 | Sem `vite.config.*` — sem aliases de import, sem configuração de assets/base path | Baixa | Imports relativos frágeis (`../Arquivos_Diversos/...`), violando o Artigo VI (Absolute Imports) |

**Resumo:** 5 críticos, 8 altos, 6 médios, 2 baixos — 21 débitos.

> **ERRATA (Fase 6) — contagem e débitos ausentes.** O resumo acima **não vale mais**. Ver `docs/reviews/ux-specialist-review.md` §1.1, §3 e §5.
>
> **Ajustes de severidade (6):** UX-D07 ⬆ Alta → CRÍTICA/P0-SAFETY · UX-D02 ⬇ Crítica → Alta (prioridade P1 mantida — severidade e prioridade são eixos distintos) · UX-D08 ⬇ Alta → Média · UX-D11 ⬇ Alta → Média · UX-D15 ⬇ Média → Baixa · UX-D17 ⬇ Média → Baixa. UX-D14 mantida em Média, mas reescopada por medição.
>
> **Quatro débitos que esta Fase 3 não capturou:**
>
> | ID | Débito | Sev. | h |
> |---|---|---|---|
> | **UX-D23** | **93 `fontSize` em px, 0 `rem`/`em`** + `zoom:var(--nc-scale)` — resize do usuário é impossível. WCAG 1.4.4/1.4.10. É a falha de a11y **mais completa** do produto: não há caminho de contorno | ALTA | 10 |
> | **UX-D24** | **Dado pessoal de menor sem exclusão nem pseudonimização** — nome + histórico em `window.storage` indefinidamente, ranking nominal público em dispositivo compartilhado. Zero fluxo de remoção. LGPD art. 14 e 18-V | ALTA | 8 |
> | **UX-D22** | `<style>` reinjetado em **6 raízes de tela** (linhas 685, 738, 965, 1137, 1188, 1232) — invisível a lint, minificação e auditoria. **É a razão pela qual `prefers-reduced-motion` nunca apareceu em varredura automatizada** | MÉDIA | 3 |
> | **UX-D25** | Atalhos de teclado implementados (efeito 3) e **não anunciados** em lugar algum da UI | BAIXA | 3 |
>
> **Contagem revista de frontend (Fase 6): 2 CRÍTICA · 4 ALTA · 6 MÉDIA · 3 BAIXA = 15 débitos validados · 159,5 h** (+34 h se WCAG 2.1 AA integral for exigido). A diferença para os 21 desta Fase 3 vem de itens absorvidos por débitos de sistema (`TD-SYS-*`) no DRAFT do @architect e de reclassificações — não de itens descartados.

---

## 6. Sequência recomendada de remediação

Sem inventar escopo: cada item abaixo é pré-condição de um AC já escrito nas stories ou de um gate já definido no workflow.

| Ordem | Ação | Desbloqueia |
|---|---|---|
| 1 | Mover a UI para `src/` (UX-D01) + `vite.config` com alias (UX-D21) | File List de qualquer story; passo 8 do workflow |
| 2 | Restaurar toolchain de CSS ou congelar oficialmente a estratégia inline (UX-D03) | Qualquer tela nova |
| 3 | Extrair tokens de `DS` + paleta (UX-D02) | Consistência de NC-001/002/003 |
| 4 | Remover `@ts-nocheck` incrementalmente e tipar props (UX-D04) | Gate `npm run typecheck` real |
| 5 | Quebrar o monolito em `src/components/` (UX-D12) | Paralelismo do passo 7 |
| 6 | `LoadingState`, `ErrorBoundary`, `EmptyState` (UX-D08/09/10) | ACs de dados vazios em NC-001 e NC-002 |
| 7 | Camada de a11y: `aria-live`, foco, `prefers-reduced-motion`, cor+ícone (UX-D05/06/07/19) | Conformidade WCAG do produto educacional |
| 8 | Responsividade em três alvos (UX-D11/D15) | Uso em sala de aula |
| 9 | Documentar ou remover `pause`/calendário via story (UX-D17) | Artigo IV — No Invention |

> **ERRATA (Fase 6) — a sequência acima foi substituída.** Ver `docs/reviews/ux-specialist-review.md` §4.1. Três correções materiais:
>
> 1. **Falta o passo 0.** UX-D07 (guarda de movimento + frequência < 3 Hz, 1,5 h) **sai da fila inteira** como P0-SAFETY, antes até do Git (TD-SYS-04). Motivo: **dependência arquitetural zero** — a correção é uma media query num bloco `<style>` que já existe, não passa por Tailwind, nem pela fronteira `src/`, nem por tokens, nem pela quebra do monolito. A fila ordena dependências técnicas; este item não tem nenhuma. Aqui a ordem 7 ("camada de a11y") é tarde demais para ele.
> 2. **Tokens (UX-D02 + UX-D23) vêm ANTES da quebra do monolito**, não depois — a ordem 3 → 5 acima está certa por acidente, mas o motivo importa: fatiar primeiro **espalha os 168 blocos por ~18 arquivos** e transforma uma varredura em dezoito. `tokens.ts` é módulo folha, sem dependências: pode ser criado hoje.
> 3. **A ordem 8 muda de natureza.** Não é "criar responsividade" — é **migrar `zoom` → refluxo preservando os breakpoints 640/1024/1440 existentes**. E UX-D15 sai daí (é AAA, diferido).
>
> Corolário de ordem descoberto na Fase 6: **não extraia a folha de estilo (UX-D22) antes de aplicar a guarda de movimento (UX-D07)** — a ordem inversa converte uma correção de 1,5 h numa refatoração.

---

## 7. Invariantes a preservar (não regredir)

Do `handoff-02-referencia.md`, seção 11 — qualquer trabalho de UX/UI deve respeitar:

1. Tailwind arbitrário não funciona — usar `style` inline (agora lendo de tokens) para tamanhos finos.
2. `AudioContext` exige gesto do usuário — `initA()` em cliques.
3. Proibido `localStorage`/`sessionStorage` — apenas `window.storage`.
4. `GRAIN` gerado fora do render, senão os pontos saltam.
5. Efeito de teclado (efeito 3) sem array de dependências — de propósito.
6. `rankIdx` só sobe.
7. Área de conta com altura estável entre escolha e resposta.
8. Interface em pt-BR.
9. Decisões matemáticas acima de decoração.

---

*Documento gerado na Fase 3 do Brownfield Discovery. Alimenta a Fase 4 (`technical-debt-DRAFT.md`, @architect) e a Fase 6 (`ux-specialist-review.md`).*

---

## Registro de Errata

| # | Aplicada em | Achado | Natureza da correção | Origem |
|---|---|---|---|---|
| 1 | Topo do documento | Índice geral das erratas | Aviso de precedência: Fase 6 prevalece | review §0.1 |
| 2 | §2.5 | **UX-D11** "Zero breakpoints / zero responsividade" | ❌ **Factualmente errado** — proxy de medição errado (contei prefixos Tailwind congelados). Camada `.nc-shell`/`--nc-scale` + media queries 640/1024/1440 existe. Alta → Média | review §0.1, §4.3 |
| 3 | §2.6 | **UX-D07** "flicker vermelho de tela cheia" | ✅ Confirmado, **mecanismo corrigido** — o overlay isolado *não* viola 2.3.1; o risco real é `rumbleHard` a 11,1 Hz + scanlines. Alta → CRÍTICA/P0-SAFETY | review §2.1 |
| 4 | §2.6 | **UX-D14** "contraste não verificado" | ⚠️ Parcialmente errado — `#8d959e` passa; falham `#6b7280` e `#ef4444`. Reescopado, Média mantida | review §1.3 |
| 5 | §2.8 | **UX-D08** "sem loading state" | ⚠️ Rebaixado — zero chamadas de rede; risco real é falha (TD-SYS-18). Alta → Média | review §0.1, §5 |
| 6 | §2.8 | **UX-D18** dispositivo de referência | Complemento — Chromebook N4020 + tablet 10"; 60 fps em `heat ≥ 90` | review §2.7 |
| 7 | §4.2 | **UX-D16** primitivas como pré-requisito | Reclassificado — só `EmptyState` e `MetricBadge` bloqueiam; NC-003 é a story-piloto | review §2.4 |
| 8 | §4.4 | **UX-D15** "alvos <44×44 não verificados" | ⚠️ Rebaixado — medido 119×37px, passa 2.5.8 (AA), falha só AAA. Média → Baixa | review §0.1 |
| 9 | §5 (tabela) | 6 severidades revistas | Marcadas com ~~riscado~~ preservando o valor original da Fase 3 | review §1.1, §5 |
| 10 | §5 (resumo) | Contagem 21 → 15 · +4 débitos novos | UX-D22, UX-D23, UX-D24, UX-D25 ausentes da Fase 3 | review §3 |
| 11 | §5 (tabela) | **UX-D17** `pause`/calendário | Rebaixado a Baixa; calendário é **ativo a preservar** (insumo de NC-002), nunca remover | review §2.6 |
| 12 | §6 | Sequência de remediação | Passo 0 ausente (UX-D07 fora da fila); tokens antes do monolito; UX-D22 depois de UX-D07 | review §4.1 |

**Método:** nenhuma linha original foi apagada. Correções são aditivas (blocos `ERRATA` e ~~riscado~~), preservando a rastreabilidade do raciocínio da Fase 3 para auditoria do @qa na Fase 7.

*— Errata registrada por Uma (@ux-design-expert) em 2026-09-07, ação E1 do QA gate.*
