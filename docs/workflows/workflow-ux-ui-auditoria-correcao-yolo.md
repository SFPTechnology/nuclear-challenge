# Workflow YOLO — Auditoria e correção completa de UX/UI

**Executor:** `@ux` / `aiox-ux-design-expert`  
**Modo:** YOLO, execução autônoma, sem confirmação entre etapas  
**Fonte normativa:** `Arquivos_Diversos/AUDITORIA E CORREÇÃO COMPLETA DE UX-UI.md`  
**Escopo:** aplicação inteira em `src/`, seus estilos, componentes, testes e documentação de evidência

## Objetivo

Executar integralmente a auditoria e correção de UX/UI descrita no documento-fonte, preservando as regras do jogo, os dados, a identidade visual e os contratos existentes. O workflow deve avançar automaticamente, registrar decisões e repetir o ciclo analisar → planejar → implementar → testar → comparar → corrigir → retestar até cada fase atingir um resultado verificável.

## Regras de execução

1. Ler integralmente o documento-fonte antes de alterar qualquer arquivo.
2. Inspecionar a árvore atual e estabelecer baseline de telas, componentes, tokens, estilos, testes e comandos.
3. Não inventar requisitos nem substituir a estética temática do simulador.
4. Não reescrever o projeto do zero, não remover dados e não alterar regras de gameplay.
5. Preferir refatoração incremental e componentes reutilizáveis.
6. Registrar cada alteração com: problema, decisão, arquivos, risco, teste e resultado antes/depois.
7. Manter o alerta de armazenamento durante as fases visuais; não escondê-lo nem alterar sua lógica antes da última fase.
8. Usar apenas os status `APROVADO`, `PARCIAL` e `REPROVADO`; nunca marcar aprovado sem teste.
9. Se surgir risco de perda de dados, mudança de schema, credencial ou alteração irreversível, registrar o bloqueio em vez de mascará-lo. No restante, decidir e prosseguir autonomamente.

## Artefatos obrigatórios

Criar/atualizar durante a execução:

- `docs/ux/ux-ui-yolo-execution-report.md` — relatório final no formato definido pela auditoria;
- `docs/ux/ux-ui-phase-log.md` — log de cada fase, com status e evidências;
- `docs/ux/ux-ui-regression-matrix.md` — matriz ANTES/DEPOIS/RISCO/TESTE/RESULTADO;
- `.ai/decision-log-ux-ui-yolo.md` — decisões autônomas, alternativas descartadas e arquivos alterados;
- `.aiox/ux-ui-yolo-state.yaml` — fase atual, última fase aprovada, pendências e motivo de eventual bloqueio.

Não sobrescrever relatórios históricos; versionar novas execuções por data quando já existirem.

## Pré-voo

Executar, registrar a saída e corrigir bloqueios básicos antes da Fase 1:

```bash
rg --files src docs Arquivos_Diversos
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Catalogar todas as telas e estados: login, menu, seleção de nível, gameplay, pausa, resultado, análise, ranking, partidas, gráficos, mapas, estados vazios, erro, carregamento, disabled e selecionado. Registrar a baseline sem alterar o código.

## Execução fase a fase

Executar as fases abaixo estritamente na ordem. Em cada fase: inspecionar, fazer plano mínimo, implementar, testar, comparar com a baseline, registrar o resultado e só então avançar.

### Fase 1 — Legibilidade

Corrigir texto truncado, contraste insuficiente, densidade e leitura em todas as telas. Preservar o conteúdo e a linguagem do produto.

### Fase 2 — Tipografia

Padronizar escala, pesos, line-height, labels, números e hierarquia. Evitar fonte minúscula em métricas e mensagens importantes.

### Fase 3 — Espaçamento e grid

Padronizar padding, margens, gutters, alturas de controles e alinhamentos. Eliminar elementos comprimidos, encostados ou desalinhados.

### Fase 4 — Hierarquia visual

Garantir que cada tela tenha foco claro e uma ação principal dominante. Reduzir competição entre ações secundárias.

### Fase 5 — Botões e ações

Consolidar variantes reutilizáveis (primary, secondary, tertiary, danger, ghost e icon). Implementar estados default, hover, active, focus, disabled e loading sem alterar regras de negócio.

### Fase 6 — Navegação

Padronizar o significado de Voltar, Retornar ao jogo, Menu, Sair, Trocar, Cancelar e Reiniciar. Separar ações destrutivas de ações positivas e adicionar confirmação quando o fluxo existente exigir.

### Fase 7 — Cards e componentes

Consolidar padrões reutilizáveis (Card, MetricCard, StatusBadge, TabNavigation, EmptyState, ProgressBar, StatRow, Alert, Modal e ConfirmDialog), reutilizando componentes estáveis antes de criar novos.

### Fase 8 — Gameplay e HUD

Melhorar a leitura do velocímetro, temperatura, integridade, refrigeração, potência, boro e estado. Manter o HUD e a temática do reator; não alterar cálculos ou mecânicas.

### Fase 9 — Teclado e interação

Corrigir área de resposta, teclado numérico, foco, toque, pressed, disabled e feedback de confirmação. Garantir que controles de pausar e sair não sejam confundidos.

### Fase 10 — Feedback pedagógico

Tornar erro, pergunta, resposta do usuário e resposta correta inequívocos usando somente dados existentes. Melhorar a lista de contas a reforçar sem inventar novas regras.

### Fase 11 — Telas de desempenho

Organizar pausa, resultado e análise em blocos escaneáveis. Destacar pontuação, recorde, operações, acertos, erros, taxa, sequência e integridade.

### Fase 12 — Ranking

Corrigir densidade, hierarquia, leitura e comportamento das abas Geral, Partidas e Gráficos. Tratar explicitamente ausência de dados.

### Fase 13 — Partidas

Melhorar a apresentação dos registros e o empty state, mantendo os dados persistidos e o CTA coerente com a navegação atual.

### Fase 14 — Gráficos

Cada bloco deve renderizar gráfico ou empty state explicado. Corrigir escalas, legendas e leitura sem inserir dados fictícios.

### Fase 15 — Mapa das tabuadas

Preservar o mapa e melhorar células, espaçamento, contraste, percentual e estados sem alterar os cálculos.

### Fase 16 — Empty states

Eliminar regiões vazias sem explicação. Usar ícone, título, explicação curta e CTA apenas quando houver suporte funcional.

### Fase 17 — Acessibilidade

Executar auditoria WCAG: contraste, foco, teclado, semântica, uso exclusivo de cor, labels e áreas de toque preferencialmente de 44×44 px. Registrar violações e correções.

### Fase 18 — Responsividade

Testar 320, 360, 390, 412, 480, 768 px e desktop. Corrigir clipping, overflow, quebras, modais, gráficos, teclado, safe areas e controles inferiores.

### Fase 19 — Polimento visual

Aplicar microinterações discretas, tokens consistentes e acabamento final. Evitar blur pesado, sombras excessivas, animações contínuas e DOM redundante.

### Fase 20 — Regressão

Executar todos os fluxos funcionais: iniciar partida, escolher nível, responder certo/errado, teclado, pausar, retomar, reiniciar, análise, ranking, partidas, gráficos, trocar operador, sair e retornar. Testar estados normal, vazio, dados, erro, disabled, selecionado, loading e pós-interação.

## Última tarefa — armazenamento

Somente após as 20 fases anteriores estarem testadas:

1. investigar a origem do alerta de armazenamento;
2. identificar se a causa é host, API, sessão, cache, PWA, permissão ou sincronização;
3. preservar dados e evitar qualquer sobrescrita destrutiva;
4. corrigir de forma segura somente se o contrato existente permitir;
5. revisar a UX do alerta para estados como Salvando, Salvo, Offline, Falha ao sincronizar, Tentando reconectar e Reconectado;
6. garantir ação recuperável para o usuário e ausência de perda silenciosa.

Não usar `localStorage`/`sessionStorage`, não remover o banner como maquiagem e não alterar schema sem aprovação formal de arquitetura.

## Gates após cada fase

Rodar o conjunto proporcional de testes e, ao final de cada ciclo relevante:

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Além dos comandos, verificar console sem erros novos, ausência de overflow inesperado, interação acessível e preservação de funcionalidades. Reprovar a fase e corrigir antes de prosseguir se qualquer gate falhar.

## Encerramento

O @ux encerra somente quando:

- as 20 fases e a tarefa final de armazenamento têm status verificável;
- a matriz de regressão está preenchida;
- o relatório final segue as 20 seções exigidas no documento-fonte;
- os arquivos alterados estão listados;
- lint, typecheck, testes e build passam;
- não há funcionalidade removida, dado oculto, erro novo no console ou overflow não justificado;
- pendências e limitações estão explicitamente registradas.

O relatório final deve declarar o status geral e separar claramente o que foi corrigido, o que ficou parcial e o que permanece reprovado. Não declarar conclusão apenas por terminar alterações visuais.
