# Arquitetura de Sistema — Nuclear Challenge

**Documento:** `docs/architecture/system-architecture.md`
**Fase:** Brownfield Discovery — Fase 1 (Data Collection)
**Autor:** @architect (Aria)
**Data:** 2026-09-07
**Status:** Baseline arquitetural — insumo para Fase 4 (`technical-debt-DRAFT.md`)

---

## 0. Sumário Executivo

O Nuclear Challenge é um simulador educacional de tabuada ambientado em uma sala de controle nuclear. Do ponto de vista de produto, o artefato está **funcionalmente maduro**: física de reator, cinco fases, persistência, ranking, gráficos e análise pedagógica já existem e funcionam.

Do ponto de vista de **arquitetura de software**, o projeto está em um estado que classifico como **"produto pronto sobre andaime inexistente"**:

- Toda a aplicação vive em **um único arquivo de 1.342 linhas fora de `src/`** (`Arquivos_Diversos/nuclear-challenge-app.tsx`).
- `src/` contém **apenas 9 linhas** de bootstrap que importam esse arquivo por caminho relativo para fora da raiz de código.
- Os quatro quality gates exigidos pela Constitution (`lint`, `typecheck`, `test`, `build`) **existem como scripts, executam com sucesso, e não validam praticamente nada** — três deles são vacuosos por configuração.
- Não existe repositório Git, não existe CI/CD, não existe camada de domínio testável e não existe o contrato CLI-first exigido pelo Artigo I da Constitution e pelo Passo 5 do workflow de reconstrução.

O risco central não é o código do jogo. É que **a rede de segurança que autorizaria alterá-lo é uma ilusão de conformidade**. Qualquer onda de implementação (NC-001, NC-002, NC-003) executada sobre esta base seria validada por gates que não conseguem detectar regressão.

**Veredito arquitetural:** o bloqueio registrado em `docs/runs/nuclear-challenge-rebuild-2026-09-06/handoff.yaml` ("provide package.json and React project structure") foi **parcialmente resolvido** em 2026-09-07 — o `package.json` existe e o build produz artefato. Porém o desbloqueio foi **infraestrutural, não arquitetural**. As pré-condições reais das ondas 1-4 continuam ausentes.

---

## 1. Stack Tecnológico

### 1.1 Dependências de runtime

| Pacote | Faixa declarada | Versão instalada | Papel | Observação |
|---|---|---|---|---|
| `react` | `^19.2.8` | 19.2.8 | UI runtime | Versão real, resolvida e instalada |
| `react-dom` | `^19.2.8` | 19.2.8 | Renderização DOM | — |
| `recharts` | `^3.10.1` | 3.10.1 | Gráficos (Bar, Radar, Line) | Peso significativo no bundle |
| `lucide-react` | `^1.42.0` | 1.42.0 | Ícones (8 ícones usados) | Import nomeado; tree-shaking depende do bundler |

### 1.2 Dependências de desenvolvimento

| Pacote | Faixa declarada | Versão instalada | Papel |
|---|---|---|---|
| `vite` | `^8.2.2` | 8.2.2 | Dev server + bundler |
| `typescript` | `^7.0.2` | 7.0.2 | Type checking (`tsc --noEmit`) |
| `eslint` | `^10.10.0` | 10.10.0 | Linting |
| `@types/react` | `^19.2.18` | — | Tipos React |
| `@types/react-dom` | `^19.2.7` | — | Tipos React DOM |

### 1.3 Verificação de realidade das versões

A tarefa levantou a hipótese de versões beta ou fictícias. **Verificado e refutado:**

Todas as sete dependências resolvem para versões reais e estão fisicamente presentes em `node_modules/`, com correspondência exata entre `package.json`, `package-lock.json` e o pacote instalado. Não há tag `beta`, `rc`, `next`, `canary` ou `alpha` em nenhuma faixa. Não há `overrides`, `resolutions` ou dependências apontando para git/tarball.

**Porém, três dessas versões representam saltos de major recentes cujo custo arquitetural não foi avaliado em nenhum documento do projeto:**

| Salto | Implicação não avaliada |
|---|---|
| **TypeScript 7.x** | Major com mudanças de compilador. O projeto neutraliza qualquer benefício via `@ts-nocheck` + `strict: false` (ver TD-SYS-03/04). |
| **Vite 8.x** | Major de bundler. O projeto **não possui `vite.config.js`**, operando 100% em defaults implícitos — inclusive a transformação JSX, que ocorre via esbuild sem `@vitejs/plugin-react`. |
| **ESLint 10.x** | Flat config obrigatório. O `eslint.config.js` existente é flat, mas mínimo ao ponto de ser inoperante (ver TD-SYS-05). |

**Conclusão:** o débito não é "versão irreal" nem "versão desatualizada". É **versão moderna com configuração ausente** — o projeto adotou o topo da stack e desligou tudo que a torna útil.

### 1.4 Estilização — o item fora do `package.json`

A aplicação é estilizada com **classes utilitárias Tailwind** (`fixed inset-0 pointer-events-none`, `absolute rounded-full`, etc.), mas **não existe Tailwind no `package.json`**.

O estilo vem de um artefato CSS **pré-compilado e congelado**:

```
public/legacy-assets/index-Bh3JlXdk.css   (17.904 bytes)
/*! tailwindcss v4.3.3 | MIT License */
```

Carregado por `<link rel="stylesheet">` estático em `index.html`, fora do grafo de módulos do Vite.

**Consequência arquitetural direta:** toda classe Tailwind ainda não presente nesse CSS **não gera estilo e falha silenciosamente**. Verificação amostral confirma o comportamento — `pointer-events-none` e `rounded-full` existem no CSS; `backdrop-blur` não existe. Qualquer story futura que introduza uma utility nova produzirá UI quebrada sem erro de build, sem erro de lint e sem falha de teste.

Este é, na minha leitura, o débito de maior probabilidade de causar retrabalho nas ondas 1-3.

---

## 2. Estrutura Atual

### 2.1 Árvore real (código de aplicação)

```
Projeto_Nuclear_Challenge_1/
├── index.html                          # entry Vite → /src/main.jsx + CSS legado estático
├── package.json                        # 4 deps, 5 devDeps, 6 scripts
├── package-lock.json
├── tsconfig.json                       # 10 linhas, strict: false
├── eslint.config.js                    # 25 linhas, 2 regras
├── .env / .env.example                 # 20+ chaves do framework AIOX (nenhuma consumida pelo app)
├── .gitignore                          # NÃO ignora Arquivos_Diversos/
├── .local-dist-server.cjs              # servidor HTTP ad-hoc (porta 4173)
│
├── src/
│   └── main.jsx                        # ← 9 LINHAS. É todo o conteúdo de src/.
│
├── tests/
│   └── pause-contract.test.mjs         # ← 22 linhas, 2 testes de regex sobre texto-fonte
│
├── public/
│   └── legacy-assets/
│       └── index-Bh3JlXdk.css          # Tailwind v4.3.3 pré-compilado, congelado
│
├── Arquivos_Diversos/                  # ← DIRETÓRIO DE ARQUIVO que hospeda código de produção
│   ├── nuclear-challenge-app.tsx       # ← 1.342 linhas. A APLICAÇÃO INTEIRA.
│   ├── handoff-01-genese.md            # gênese, decisões, modelo conceitual (14 KB)
│   ├── handoff-02-referencia.md        # referência técnica (15 KB)
│   ├── handoff-03-roadmap.md           # roadmap, pendências, rejeições (11 KB)
│   ├── handoff-04-codigo.txt           # snapshot de código (83 KB)
│   ├── usina/                          # cópia #2 do artefato de deploy
│   ├── usina.zip                       # cópia #3 (263 KB, pacote de upload)
│   └── usina-legacy-backup/            # cópia #4 (bundle antigo + pause.js abandonado)
│
├── dist/                               # cópia #1 do artefato de deploy (gitignored)
│   ├── index.html
│   ├── default.php                     # ← página padrão da Hostinger, resíduo de host
│   ├── assets/index-Cf-x_gwt.js        # bundle único, 910.440 bytes
│   └── legacy-assets/index-Bh3JlXdk.css
│
└── docs/
    ├── architecture/system-architecture.md   # este documento
    ├── estrutura-acompanhamento.md
    ├── plans/plano-correcao-pausa.md
    ├── plans/plano-dev-pausa-bundle.md
    ├── stories/NC-001…NC-003
    ├── workflows/plano-aiox-reconstruir-nuclear-challenge-yolo.md
    └── runs/nuclear-challenge-rebuild-2026-09-06/  (6 artefatos)
```

### 2.2 A inversão de fronteira

O achado estrutural mais importante do sistema está em `src/main.jsx`:

```jsx
import App from '../Arquivos_Diversos/nuclear-challenge-app.tsx';
```

`src/` — a raiz de código por convenção, o alvo do ESLint, o `include` do tsconfig — contém 9 linhas de bootstrap. O código de produção mora em `Arquivos_Diversos/`, um diretório cujo nome e propósito são **arquivo morto** (handoffs, ZIPs, backups legados, um `usina-legacy-backup/`).

Isso não é apenas estético. É a **causa raiz mecânica** de três outros débitos:

- O ESLint tem `files: ['src/**/*.jsx', 'tests/**/*.mjs']` → o arquivo de 1.342 linhas **está fora do escopo de lint**.
- O `.gitignore` não cobre `Arquivos_Diversos/` → o bundle de 910 KB e o `usina.zip` de 263 KB seriam versionados junto com o código-fonte.
- O ESLint ignora `Arquivos_Diversos/usina/**` mas **não** `Arquivos_Diversos/*.tsx` — a regra de ignore foi escrita pensando no build, não no código.

### 2.3 Composição interna do componente único

`nuclear-challenge-app.tsx` — 1.342 linhas, `// @ts-nocheck` na linha 1.

| Métrica | Valor |
|---|---|
| Componentes de apresentação de topo | 12 (`Ambient`, `PreMelt`, `Screw`, `Plate`, `Label`, `PauseButton`, `Lcd`, `Lamp`, `CoreGauge`, `Support`, `Valve`, `Boom`) |
| Hooks customizados | 2 (`useDeviceClass`, `useViewportScale`) |
| Helpers de domínio no escopo do módulo | 4 (`getDeviceClass`, `localDay`, `emptyStudyDay`, `mergeStudyLog`) |
| Constantes de configuração hardcoded | 6 blocos (`DIFF`, `TITLES`, `DS`, `GRAIN`, `CHART_COLORS`, `VENT_CD`/`BORON_CD`/`FREEZE_MS`) |
| **`export default function App()`** | **linha 272 → 1.342 (~1.070 linhas em um único componente)** |
| `useState` | 42 |
| `useEffect` | 20 |
| `useRef` | 4 |
| Anotações `: any` | 0 (irrelevante — `@ts-nocheck` desliga a verificação inteira) |

**Leitura arquitetural:** 42 unidades de estado e 20 efeitos coabitando um componente significa que **física do reator, geração de operações, pontuação, progressão de fase, áudio, persistência, ranking, análise pedagógica e renderização são o mesmo objeto indivisível**.

Não há como testar a fórmula de aquecimento sem montar a árvore React. Não há como validar o gerador de operações sem instanciar um `AudioContext`. Não há como expor um contrato CLI (Constitution Artigo I) porque não existe nenhuma função de domínio isolável para um CLI invocar.

Isto é o bloqueio estrutural real das stories NC-001, NC-002 e NC-003 — todas as três exigem explicitamente "contrato CLI/observável **antes** da UI".

### 2.4 Padrões de código: inventário honesto

**Padrões presentes e consistentes** (reconhecer o que funciona é parte do trabalho):

- Nomenclatura de domínio coerente e em pt-BR no conteúdo de usuário.
- Estilos inline finos para o visual industrial, deliberados e documentados no `handoff-02`.
- Componentes de apresentação puros e pequenos (`Screw`, `Plate`, `Lamp`, `Lcd`) — boa granularidade nessa camada.
- Formato de dados de acompanhamento pedagógico rigorosamente documentado em `docs/estrutura-acompanhamento.md`, com política explícita de retrocompatibilidade para operadores legados.
- Persistência centralizada em duas funções (`saveResult` e o loader inicial), não espalhada.

**Padrões ausentes:**

- Nenhum limite de módulo. Zero arquivos internos além do entrypoint.
- Nenhum tipo. `@ts-nocheck` global em um arquivo com extensão `.tsx`.
- Nenhuma camada de domínio, serviço, hook de dados ou repositório.
- Nenhum `ErrorBoundary`. Uma exceção em qualquer efeito derruba a tela inteira para branco.
- Nenhuma estratégia de logging ou observabilidade.
- Nenhum tratamento de erro para o único ponto de I/O externo (`window.storage`) além de um `try/catch` silencioso na escrita de partidas.
- Nenhuma externalização de configuração — todo o balanceamento do jogo é literal no código.

---

## 3. Gap Analysis — Planejado vs. Implementado

### 3.1 Funcionalidade de produto

| Capacidade | Documentada em | Implementada? | Evidência |
|---|---|---|---|
| Física independente (`heat`, `integrity`, `coolant`) | `handoff-01`, baseline | ✅ Sim | `CoreGauge`, `Support`, estado do `App` |
| Cinco fases com dificuldade escalonada | `handoff-01` | ✅ Sim | Constante `DIFF` (TRAINEE → CHERNOBYL) |
| Multiplicação e divisão, termos ocultos a partir da fase 3 | baseline | ✅ Sim | `DIFF[n].ops`, formatos `direct`/`inverse` |
| Escolha entre contas concorrentes | baseline | ✅ Sim | — |
| Válvulas manuais (vent/boron) com cooldown | `handoff-02` | ✅ Sim | `Valve`, `VENT_CD`, `BORON_CD` |
| Persistência via `window.storage` | baseline | ✅ Sim | Chaves `operadores` e `partidas` |
| Ranking, gráficos, análise pedagógica | baseline | ✅ Sim | recharts: Bar/Radar/Line |
| Registro diário `studyLog` + calendário mensal | `estrutura-acompanhamento.md` | ✅ Sim | `localDay`, `emptyStudyDay`, `mergeStudyLog` |
| Priorização de estudo (até 6 itens) | `estrutura-acompanhamento.md` | ✅ Sim | constante `priority` na tela de análise |
| Fluxo de pausa (`PauseButton`/`pauseGame`/`resumeGame`) | `plano-dev-pausa-bundle.md` | ✅ Sim | Confirmado pelo único teste existente |
| **Modo de treino dirigido (NC-001)** | `handoff-03`, NC-001 | ❌ **Não** | Story `Blocked` |
| **Relatório para responsável/professor (NC-002)** | `handoff-03`, NC-002 | ❌ **Não** | Story `Blocked` |
| **Taxa ponderada por dificuldade (NC-003)** | `handoff-03`, NC-003 | ❌ **Não** | Story `Blocked` |
| Progressão adaptativa (onda 3) | `dependency-graph.yaml` | ❌ Não | `pending` |
| Retomada de sessão interrompida (onda 3) | `dependency-graph.yaml` | ❌ Não | `pending` |
| Instrumentos independentes (onda 4) | `dependency-graph.yaml` | ❌ Não | `pending` |
| Multijogador local (onda 4) | `dependency-graph.yaml` | ❌ Não | `pending` |

**Leitura:** o gap de produto é **estreito e bem delimitado** — o núcleo do jogo está completo. O gap está inteiramente na camada pedagógica/analítica avançada.

### 3.2 Fundação de engenharia — onde o gap real está

`handoff.yaml` declara Wave 0 como `blocked` com três itens. Confrontando com o estado atual:

| Item da Wave 0 | Status declarado (2026-09-06) | Estado real verificado (2026-09-07) | Veredito |
|---|---|---|---|
| `provision-executable-project` | blocked | `package.json` + `tsconfig` + `eslint.config` + build funcional | ⚠️ **Parcial** — provisionado, mas sem `vite.config`, sem plugin React, sem estrutura de módulos |
| `define-cli-contracts` | blocked | Nenhum arquivo CLI, nenhum contrato, nenhum módulo de domínio invocável | ❌ **Não iniciado** |
| `create-data-fixtures` | blocked | Nenhuma fixture; nenhum diretório de fixtures | ❌ **Não iniciado** |

**Conclusão crítica:** as stories NC-001/002/003 permanecem `Blocked` com o motivo textual *"aguardando projeto executável"* — motivo que **está obsoleto desde 2026-09-07**. O bloqueio real mudou de natureza e ninguém atualizou os artefatos:

> Bloqueio anterior: *não existe projeto executável.*
> **Bloqueio atual: existe projeto executável, mas não existe camada de domínio isolável nem contrato CLI — e os três critérios de aceitação "CLI/contrato observável antes da UI" (NC-001 AC-5, NC-002 AC-1, NC-003 AC-1) são impossíveis de satisfazer contra um componente monolítico de 1.070 linhas.**

Esta é a divergência planejado-vs-implementado mais consequente do sistema. Ela está mascarada porque o texto do bloqueio parece ainda válido.

### 3.3 Quality gates — o gap de conformidade

O Passo 11 do workflow e o `AGENTS.md` exigem quatro gates. Todos os quatro **executam e passam**. Análise do que cada um realmente verifica:

| Gate | Comando | Alvo real | Cobertura efetiva |
|---|---|---|---|
| `lint` | `eslint src tests --max-warnings=0` | `src/**/*.jsx` (9 linhas) + `tests/**/*.mjs` (22 linhas) | **~31 de 1.373 linhas ≈ 2%.** O arquivo de 1.342 linhas está fora do padrão `files`. Duas regras ativas (`no-unused-vars`, `no-undef`). Zero regras de React, hooks, acessibilidade ou segurança. |
| `typecheck` | `tsc --noEmit` | `src` + `Arquivos_Diversos/nuclear-challenge-app.tsx` | **~0%.** O arquivo incluído abre com `// @ts-nocheck`. Reforçado por `strict: false`, `checkJs: false`, `skipLibCheck: true`. O gate é matematicamente incapaz de reportar erro. |
| `test` | `node --test tests/*.test.mjs` | 1 arquivo, 2 testes | **0% comportamental.** Ambos os testes fazem `readFile` + `assert.match` com regex sobre o **texto-fonte**. Não montam componente, não executam função, não avaliam estado. Verificam presença de strings. |
| `build` | `vite build` | Bundle único de 910 KB | ✅ Único gate genuinamente funcional — prova que o módulo resolve e transpila. |

O gate de teste merece destaque, porque ilustra o padrão do projeto inteiro:

```js
assert.match(source, /const pauseGame = \(\) => \{ stopAlm\(\); stopGei\(\); setMode\('pause'\); \}/);
```

Este assert quebra se alguém inserir uma quebra de linha, renomear `stopAlm`, ou reformatar o arquivo — mesmo que o comportamento de pausa permaneça perfeito. E **passa** se alguém quebrar completamente a pausa mantendo o texto intacto em outro lugar. É acoplamento a formatação, não a comportamento: **o pior tipo de teste — frágil e não-protetor simultaneamente**.

**Implicação de governança:** o Artigo V (Quality First) e o Passo 11 do workflow são satisfeitos **formalmente e violados materialmente**. Um `@qa` que rode os quatro comandos e veja quatro sucessos emitirá PASS sobre um sistema sem rede de segurança alguma. Este é, na minha avaliação, o risco número 1 do projeto.

---

## 4. Configurações

### 4.1 Build (`vite`)

**Não existe `vite.config.js` / `vite.config.ts`.** O build opera inteiramente em defaults de Vite 8.

Consequências mapeadas:

| Aspecto | Estado | Impacto |
|---|---|---|
| Transformação JSX | esbuild interno, sem `@vitejs/plugin-react` | Build funciona; **Fast Refresh não existe** — toda edição em dev recarrega a página inteira e perde o estado da partida. Custo alto de DX para um jogo com estado profundo. |
| `base` | `/` (default) | Deploy só funciona na raiz do domínio. Deploy em subpasta quebra silenciosamente. |
| Code splitting | Nenhum | Chunk único de 910.440 bytes |
| `build.outDir` | `dist/` | — |
| Aliases de import | Nenhum | Torna o Artigo VI (Absolute Imports) inaplicável; força `../Arquivos_Diversos/...` |
| Variáveis de ambiente | Nenhuma `import.meta.env` consumida | Confirmado por varredura no `.tsx` |

### 4.2 TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "allowJs": true, "checkJs": false, "jsx": "react-jsx",
    "module": "ESNext", "moduleResolution": "Bundler",
    "noEmit": true, "skipLibCheck": true, "strict": false
  },
  "include": ["src", "Arquivos_Diversos/nuclear-challenge-app.tsx"]
}
```

Três observações arquiteturais:

1. O `include` **codifica a inversão de fronteira em configuração** — o tsconfig admite formalmente que o código de produção vive fora de `src`. Esse é o ponto onde a anomalia deixou de ser acidental e virou contrato.
2. `strict: false` + `checkJs: false` + `@ts-nocheck` formam **três camadas independentes** desligando a verificação. Remover apenas uma não recupera nada.
3. Não há `lib`, `target`, `types` nem `esModuleInterop` explícitos — todos herdam defaults do TypeScript 7, cujo comportamento não foi validado neste projeto.

### 4.3 Lint (`eslint.config.js`)

```js
files: ['src/**/*.jsx', 'tests/**/*.mjs']
ignores: ['dist/**', 'release/**', 'Arquivos_Diversos/usina/**', 'node_modules/**']
rules: { 'no-unused-vars': 'error', 'no-undef': 'error' }
globals: { document: 'readonly', URL: 'readonly' }
```

- O padrão `files` **exclui `.tsx`** — logo exclui a aplicação.
- `ignores` mira `Arquivos_Diversos/usina/**` (artefato de build) mas não `Arquivos_Diversos/*.tsx` (código-fonte). A intenção era ignorar build; o efeito colateral é que o código de produção não é ignorado *nem incluído* — simplesmente não casa com nenhum `files`.
- `globals` declara apenas `document` e `URL`. `window`, `AudioContext`, `Date`, `Math`, `console` e `setTimeout` não estão declarados — o que só não gera erro de `no-undef` porque o arquivo que os usa não é lintado. **Estender o lint ao `.tsx` sem antes corrigir `globals` produzirá uma avalanche de falsos positivos.** Registro isto porque é a armadilha imediata de quem tentar corrigir TD-SYS-05 isoladamente.
- Zero plugins: sem `eslint-plugin-react`, `react-hooks`, `jsx-a11y` ou `security`. Em um componente com 20 `useEffect`, a ausência de `react-hooks/exhaustive-deps` é a lacuna mais cara.

### 4.4 Ambiente (`.env` / `.env.example`)

Os dois arquivos são **funcionalmente idênticos** — a única diferença é o comentário de cabeçalho. Nenhum valor real está preenchido; nenhum segredo está exposto no momento.

`.gitignore` cobre corretamente `.env`, `.env.local`, `.env.*.local`, `*.key`, `*.pem`.

Ambos declaram **20+ chaves pertencentes ao framework AIOX**, não à aplicação:

`DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `EXA_API_KEY`, `CONTEXT7_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, **`SUPABASE_SERVICE_ROLE_KEY`**, `GITHUB_TOKEN`, `CLICKUP_API_KEY`, `N8N_API_KEY`, `N8N_WEBHOOK_URL`, `SENTRY_DSN`, `RAILWAY_TOKEN`, `VERCEL_TOKEN`.

**Zero delas são consumidas pela aplicação** — varredura confirma ausência total de `process.env` e `import.meta.env` no código do jogo.

Duas implicações de segurança que sinalizo explicitamente:

- **`SUPABASE_SERVICE_ROLE_KEY` em um projeto Vite é uma armadilha de exfiltração.** A service_role key ignora RLS por completo. Se alguém futuramente a expuser via prefixo `VITE_` para "conectar o Supabase", ela é embutida no bundle público e entregue a todo navegador. O trilho para esse erro já está posto pela mera presença da chave no `.env` de um projeto frontend.
- `SENTRY_DSN` declarado sem qualquer integração significa que **o projeto não tem observabilidade de produção** apesar de ter o slot para ela.

### 4.5 Deploy

Não há `Dockerfile`, workflow de GitHub Actions, `vercel.json`, `netlify.toml` ou qualquer script de deploy.

O mecanismo real é **empacotamento manual em ZIP e upload para hospedagem compartilhada**, inferido de duas evidências convergentes:

1. `Arquivos_Diversos/usina.zip` (263 KB) — o pacote de upload.
2. `dist/default.php` — a **página padrão da Hostinger** (referencia `hpanel.hostinger.com`), arrastada para dentro do artefato de build.

Servidor local: `.local-dist-server.cjs`, HTTP puro na porta 4173, com verificação de path traversal correta (`file.startsWith(root)`).

**Bug funcional no servidor local.** O mapa de MIME types cobre apenas `.html` e `.md`:

```js
const types = { '.html': 'text/html; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
```

`dist/index.html` carrega `<script type="module" crossorigin src="/assets/index-Cf-x_gwt.js">`. Módulos ES estão sujeitos a **checagem estrita de MIME**: o navegador recusa executar um módulo servido como `application/octet-stream`. O CSS sofre o mesmo destino. Este servidor serve a página e **não executa a aplicação** — falha que se manifesta como tela em branco, sem erro de rede, e que consumirá tempo de diagnóstico de quem confiar nele.

---

## 5. Pontos de Integração

### 5.1 Integração ativa: `window.storage`

A **única** dependência externa em runtime.

| Aspecto | Detalhe |
|---|---|
| Interface | `window.storage.get(key, bool)` / `window.storage.set(key, value, bool)` — assíncronas |
| Chaves | `operadores` (perfis + stats + studyLog), `partidas` (histórico de partidas) |
| Formato | JSON serializado manualmente |
| Call sites | 4, nas linhas 348, 352, 365, 373 |
| Origem da API | **Não identificada.** Não é `localStorage`, não é padrão web, não é fornecida por nenhuma dependência do `package.json` |
| Fallback | **Nenhum.** Se `window.storage` for `undefined`, a leitura inicial lança |
| Tipagem | Nenhuma. Nenhum `declare global` compensando o `@ts-nocheck` |
| Abstração | Nenhuma. Acesso direto ao global a partir do componente |

`localStorage` e `sessionStorage` estão **corretamente ausentes** (0 ocorrências) — restrição do `handoff-03` respeitada e explicitamente reafirmada em NC-001 AC-4.

**Avaliação arquitetural:** a restrição de negócio é legítima e deve ser preservada. O problema é a **implementação sem contrato**. Uma API global não-padrão, não-tipada, sem interface, sem fallback e sem mock é simultaneamente:
- o maior risco de disponibilidade do sistema (host indisponível = aplicação morta na inicialização);
- o maior bloqueador de testabilidade (impossível testar persistência sem um duplo);
- o obstáculo direto ao AC de retrocompatibilidade de NC-003 ("dados legados recebem fallback explícito e não são apagados").

Uma interface `StorageAdapter` (contrato + implementação `window.storage` + implementação em memória para testes) é a menor mudança que desbloqueia simultaneamente NC-001, NC-002 e NC-003. Recomendo tratá-la como o primeiro item da Wave 0 revisada.

### 5.2 Integração ativa: Web Audio API

```js
new (window.AudioContext || window.webkitAudioContext)()
```

Inicializada sob gesto do usuário (`initA`), com `resume()` para estado `suspended` — **padrão correto** para políticas de autoplay. Fallback `webkitAudioContext` presente. Nenhuma limpeza de `AudioContext` no unmount observada; com `React.StrictMode` ativo no `main.jsx` e 20 efeitos com timers, há risco real de duplicação de timers e nós de áudio no double-invoke de desenvolvimento.

### 5.3 Integrações declaradas e não implementadas

| Integração | Onde declarada | Estado |
|---|---|---|
| Supabase | `.env` (3 chaves) | ❌ Sem cliente, sem dependência, sem uso |
| Sentry | `.env` (`SENTRY_DSN`) | ❌ Sem SDK |
| Railway / Vercel | `.env` (tokens) | ❌ Sem config de deploy |
| N8N | `.env` (key + webhook) | ❌ Sem uso |
| GitHub | `.env` (`GITHUB_TOKEN`) | ❌ Sem repositório Git |

**Zero chamadas de rede** na aplicação — nenhum `fetch`, nenhum `XMLHttpRequest`. O jogo é 100% client-side com persistência delegada ao host. Isto é uma **força arquitetural**: a superfície de ataque em runtime é mínima e não há dados trafegando. As chaves no `.env` são resíduo do instalador AIOX, não requisito de produto.

---

## 6. Débitos Técnicos Identificados

Severidade: **CRITICAL** (bloqueia desenvolvimento seguro) · **HIGH** (bloqueia ondas planejadas) · **MEDIUM** (custo crescente) · **LOW** (higiene).

| ID | Débito | Severidade | Área |
|---|---|---|---|
| **TD-SYS-01** | Gate de `typecheck` inoperante: `@ts-nocheck` na linha 1 do único arquivo de aplicação, reforçado por `strict:false` e `checkJs:false`. `tsc --noEmit` é incapaz de reportar erro — verificação de tipos efetiva ≈ 0%. | CRITICAL | Qualidade / Build |
| **TD-SYS-02** | Gate de `lint` cobre ~2% do código: `files: ['src/**/*.jsx','tests/**/*.mjs']` exclui o `.tsx` de 1.342 linhas. Duas regras ativas, zero plugins React/hooks/a11y/security. | CRITICAL | Qualidade |
| **TD-SYS-03** | Gate de `test` sem valor comportamental: 2 testes fazem `assert.match` de regex sobre texto-fonte. Zero cobertura de física, geração de operações, pontuação, progressão, persistência ou migração. Frágil a formatação e cego a regressão real. | CRITICAL | Testes |
| **TD-SYS-04** | Ausência de controle de versão: nenhum `.git/`. Sem histórico, sem rollback, sem branches, sem rastreabilidade de story→commit. Viola o Passo 12 do workflow e impede toda autoridade de `@devops`. | CRITICAL | Governança |
| **TD-SYS-05** | Inversão de fronteira de código: aplicação inteira em `Arquivos_Diversos/` (diretório de arquivo morto), importada por `src/main.jsx` via `../`. Codificada no `tsconfig.include`. Causa raiz mecânica de TD-SYS-02 e TD-SYS-16. | HIGH | Arquitetura |
| **TD-SYS-06** | Monolito de componente: `App()` com ~1.070 linhas, 42 `useState`, 20 `useEffect`, 4 `useRef`. Física, jogo, áudio, persistência, ranking e analytics indivisíveis. | HIGH | Arquitetura |
| **TD-SYS-07** | Ausência de camada de domínio → **contratos CLI impossíveis**. Nenhuma função de regra de negócio isolável. Viola Artigo I (CLI First) e Passo 5 do workflow. **Bloqueia diretamente NC-001 AC-5, NC-002 AC-1 e NC-003 AC-1.** | HIGH | Arquitetura / Constitution |
| **TD-SYS-08** | Tailwind v4.3.3 congelado como CSS pré-compilado (`public/legacy-assets/`), sem Tailwind no toolchain. Qualquer utility nova não gera estilo e **falha silenciosamente** — sem erro de build, lint ou teste. Verificado: `backdrop-blur` ausente do CSS. | HIGH | Build / UI |
| **TD-SYS-09** | `window.storage` sem contrato: API global não-padrão, não-tipada, sem interface, sem fallback e sem mock. Único ponto de I/O; indisponibilidade = falha total na inicialização. Bloqueia testes de persistência e o AC de retrocompatibilidade de NC-003. | HIGH | Integração / Dados |
| **TD-SYS-10** | Artefatos de projeto dessincronizados da realidade: NC-001/002/003 e `handoff.yaml` mantêm bloqueio *"aguardando projeto executável"*, obsoleto desde 2026-09-07. O bloqueio real (ausência de domínio/contrato CLI) não está registrado em lugar nenhum. | HIGH | Governança / Rastreabilidade |
| **TD-SYS-11** | Ausência de `vite.config.js` e de `@vitejs/plugin-react`: sem Fast Refresh (recarga total perde estado da partida a cada edição), sem controle de `base`, sem chunking, sem aliases. Artigo VI (Absolute Imports) inaplicável. | MEDIUM | Build / DX |
| **TD-SYS-12** | Bundle único de 910.440 bytes sem code splitting. recharts e lucide-react entram integralmente no caminho crítico, embora os gráficos só sejam usados nas telas de análise/ranking. | MEDIUM | Performance |
| **TD-SYS-13** | Balanceamento hardcoded: `DIFF` (5 fases × 12 parâmetros), `VENT_CD`, `BORON_CD`, `FREEZE_MS`, `TITLES`, `CHART_COLORS` literais no código. Viola "Config > Hardcoding". Impede o "simular balanceamento" do Passo 10 sem recompilar. | MEDIUM | Configuração |
| **TD-SYS-14** | Quatro cópias divergentes do artefato de deploy: `dist/`, `Arquivos_Diversos/usina/`, `usina.zip`, `usina-legacy-backup/`. Sem fonte única de verdade; `plano-correcao-pausa` já registra tempo perdido servindo a cópia errada. | MEDIUM | Build / Deploy |
| **TD-SYS-15** | `.local-dist-server.cjs` serve JS/CSS como `application/octet-stream` (mapa de MIME só cobre `.html` e `.md`). Módulos ES são recusados por checagem estrita de MIME → tela branca sem erro de rede. | MEDIUM | Ferramental |
| **TD-SYS-16** | `.gitignore` não cobre `Arquivos_Diversos/`: ao inicializar o Git, o bundle de 910 KB, o `usina.zip` de 263 KB e os backups legados entram no histórico permanentemente. | MEDIUM | Governança |
| **TD-SYS-17** | `SUPABASE_SERVICE_ROLE_KEY` presente no `.env` de um projeto Vite puramente client-side, sem integração alguma. Chave que ignora RLS; um futuro prefixo `VITE_` a embute no bundle público. Trilho de exfiltração já posto. | MEDIUM | Segurança |
| **TD-SYS-18** | Zero observabilidade: sem `ErrorBoundary`, sem logging estruturado, sem Sentry (apesar do `SENTRY_DSN` declarado). Exceção em qualquer dos 20 efeitos → tela branca silenciosa. Viola "Observability Second" do `AGENTS.md`. | MEDIUM | Observabilidade |
| **TD-SYS-19** | `eslint.config.js` declara apenas `document` e `URL` em `globals`. `window`, `AudioContext`, `Math`, `Date`, `console`, `setTimeout` ausentes — estender o lint ao `.tsx` sem corrigir isto gera avalanche de `no-undef` falsos. Armadilha embutida na correção de TD-SYS-02. | MEDIUM | Qualidade |
| **TD-SYS-20** | `React.StrictMode` ativo com 20 efeitos contendo timers e um `AudioContext` sem limpeza no unmount. Risco de timers/nós de áudio duplicados no double-invoke de desenvolvimento. | MEDIUM | Runtime |
| **TD-SYS-21** | Ausência de CI/CD e de deploy automatizado. Publicação é ZIP manual para hospedagem compartilhada; nenhum gate é executado automaticamente antes de publicar. | MEDIUM | DevOps |
| **TD-SYS-22** | `dist/default.php` (página padrão da Hostinger) versionado dentro do artefato de build, revelando o provedor de hospedagem e adicionando superfície desnecessária ao pacote publicado. | LOW | Deploy / Segurança |
| **TD-SYS-23** | Majors recentes adotados sem avaliação: TypeScript 7, Vite 8 e ESLint 10 sem nenhuma nota de migração, ADR ou validação de compatibilidade em qualquer documento do projeto. | LOW | Manutenção |

**Distribuição:** 4 CRITICAL · 6 HIGH · 11 MEDIUM · 2 LOW.

### 6.1 Grafo de causalidade dos débitos

Os débitos não são independentes. O agrupamento abaixo importa mais que a lista, porque determina a ordem de ataque:

```
TD-SYS-05 (código fora de src/)
   ├──> TD-SYS-02 (lint não alcança o arquivo)
   └──> TD-SYS-16 (.gitignore não cobre o diretório)

TD-SYS-06 (monolito de 1.070 linhas)
   ├──> TD-SYS-07 (sem domínio → sem contrato CLI)
   │       └──> BLOQUEIA NC-001, NC-002, NC-003
   ├──> TD-SYS-03 (nada isolável para testar)
   └──> TD-SYS-13 (config presa dentro do componente)

TD-SYS-01 + TD-SYS-02 + TD-SYS-03  (gates vacuosos)
   └──> RISCO SISTÊMICO: qualquer alteração é aprovada sem verificação real

TD-SYS-04 (sem Git)
   └──> Sem rollback para qualquer uma das correções acima
```

**Recomendação de sequenciamento** (para a Fase 8, não decisão desta fase): TD-SYS-04 primeiro — sem rollback, nenhuma outra correção é segura. Depois TD-SYS-16 (antes do primeiro commit, ou o lixo entra no histórico para sempre). Depois TD-SYS-05, que desbloqueia mecanicamente TD-SYS-02. Só então atacar TD-SYS-06/07 pela extração incremental de domínio, com TD-SYS-09 (`StorageAdapter`) como primeira extração — é a que desbloqueia as três stories simultaneamente.

---

## 7. Riscos Arquiteturais Prioritários

| # | Risco | Probabilidade | Impacto | Débitos |
|---|---|---|---|---|
| R1 | **Regressão silenciosa aprovada por gates verdes.** Os quatro gates passam sobre um sistema sem verificação real; um PASS de QA não significa nada hoje. | Alta | Crítico | 01, 02, 03 |
| R2 | **Perda irrecuperável de trabalho.** Sem Git, sem rollback, sem histórico. Uma edição ruim no arquivo de 1.342 linhas é permanente. | Média | Crítico | 04 |
| R3 | **Ondas 1-3 bloqueadas por impossibilidade estrutural, não por falta de esforço.** Os ACs de contrato CLI não podem ser satisfeitos contra um monolito — e o artefato de bloqueio aponta o motivo errado. | Alta | Alto | 06, 07, 10 |
| R4 | **UI quebrada silenciosamente por utility Tailwind ausente.** Toda story que toque UI carrega este risco, sem sinal de erro em nenhum gate. | Alta | Médio | 08 |
| R5 | **Falha total na inicialização** se o host não prover `window.storage`. Sem fallback e sem mensagem de erro. | Média | Alto | 09, 18 |
| R6 | **Exposição de credencial com bypass de RLS** se o Supabase for integrado seguindo o `.env` existente. | Baixa | Crítico | 17 |
| R7 | **Publicação da cópia errada do artefato.** Quatro cópias divergentes; já ocorreu uma vez (`plano-correcao-pausa.md`). | Média | Médio | 14, 15, 21 |

---

## 8. Forças Arquiteturais a Preservar

A Fase 4 deve tratar o seguinte como **linha de base inegociável** (Gold Standard — nunca perder capacidade):

1. **Física independente de três variáveis** (`heat`, `integrity`, `coolant`) com duas condições de derrota — núcleo pedagógico validado, documentado no `handoff-01`.
2. **`window.storage` como único mecanismo de persistência.** A proibição de `localStorage`/`sessionStorage` é restrição deliberada de produto. Abstrair sim; substituir não.
3. **Retrocompatibilidade explícita de dados.** `mergeStudyLog` e a política de `studyLog` ausente em operadores legados estão corretas e documentadas. Nenhuma migração destrutiva.
4. **Estilos inline finos e linguagem visual industrial** — decisão de design deliberada (`handoff-02`), não descuido.
5. **pt-BR em todo conteúdo de usuário.**
6. **Não-regressão de `rankIdx`** e fatores corretos para divisão — invariantes matemáticas do `handoff-08`/passo 8.
7. **`AudioContext` iniciado por gesto do usuário** — padrão web correto, já implementado.
8. **Ausência total de chamadas de rede.** Superfície de ataque mínima; preservar como propriedade arquitetural.
9. **Componentes de apresentação pequenos e puros** (`Screw`, `Plate`, `Lamp`, `Lcd`, `Valve`) — a decomposição correta já existe nesta camada e serve de modelo para a extração do restante.
10. **Rejeições do `handoff-03`** — não reintroduzir eventos de resposta específica, painel de 25 instrumentos, excesso de efeitos, recompensas maiores, auto-submit ou `localStorage`.

---

## 9. Decisões Autônomas Registradas

Conforme o protocolo de elicitação autônoma desta execução:

- `[AUTO-DECISION]` Escopo do documento → **sistema + fundação de engenharia**, não apenas inventário de stack (razão: a Fase 1 alimenta o `technical-debt-DRAFT.md` da Fase 4; um inventário sem análise de gates produziria um draft cego ao risco dominante).
- `[AUTO-DECISION]` Versões "hipotéticas vs. reais" → **verificadas contra `node_modules/` e `package-lock.json`**, não assumidas (razão: a tarefa levantou a hipótese explicitamente; Artigo IV — No Invention exige evidência, não suposição).
- `[AUTO-DECISION]` `Arquivos_Diversos/nuclear-challenge-app.tsx` tratado como **código de produção**, não como arquivo morto (razão: `src/main.jsx` e `tsconfig.include` o referenciam diretamente; o caminho de execução é o fato, o nome do diretório é a anomalia).
- `[AUTO-DECISION]` Cobertura de gates **medida**, não descrita (razão: "os gates passam" e "os gates verificam" são afirmações distintas; a diferença é o achado central deste documento).
- `[AUTO-DECISION]` Sequenciamento de correções incluído apenas como **recomendação não-vinculante** na seção 6.1 (razão: a decisão de priorização pertence à Fase 8 e ao `@pm` na Fase 10; suprimi-la inteiramente desperdiçaria a análise de causalidade já feita).
- `[AUTO-DECISION]` Nenhum código, config ou artefato foi alterado (razão: `@architect` analisa e recomenda; a Fase 1 é coleta de dados e a implementação pertence ao `@dev` sob story válida — Artigo III).

---

## 10. Handoff para as Próximas Fases

| Fase | Agente | Entrada fornecida por este documento |
|---|---|---|
| **2 — Schema/DB** | `@data-engineer` | Não há banco de dados. A "camada de dados" é `window.storage` com dois blobs JSON (`operadores`, `partidas`). Modelo detalhado em `docs/estrutura-acompanhamento.md`. Foco recomendado: contrato do `StorageAdapter` (TD-SYS-09) e estratégia de migração retrocompatível para NC-003. |
| **3 — Frontend Spec** | `@ux-design-expert` | TD-SYS-08 (Tailwind congelado) é restrição dura sobre qualquer proposta de UI. TD-SYS-06 define o custo de qualquer alteração de tela. Diretrizes de UX vigentes em `docs/estrutura-acompanhamento.md` §"Diretrizes de UX/UI". |
| **4 — Debt Draft** | `@architect` | Seção 6 (23 débitos), 6.1 (grafo de causalidade) e 7 (7 riscos) são a entrada direta. |
| **7 — QA Gate** | `@qa` | ⚠️ **Ler antes de emitir veredito:** os quatro gates passam sem verificar nada (TD-SYS-01/02/03). Um PASS baseado apenas na execução dos comandos seria factualmente incorreto neste projeto. |
| **10 — Epic** | `@pm` | O bloqueio de NC-001/002/003 mudou de natureza e os artefatos não foram atualizados (TD-SYS-10). Recomendo uma story de fundação — extração de domínio + `StorageAdapter` + gates reais — como pré-requisito das três. |

**Fora do escopo desta fase (não decidido aqui):** priorização final de débitos, desenho da arquitetura-alvo, definição das assinaturas dos contratos CLI, esforço/estimativas, e qualquer alteração de código ou configuração.

---

*— Aria, arquitetando o futuro 🏗️*
