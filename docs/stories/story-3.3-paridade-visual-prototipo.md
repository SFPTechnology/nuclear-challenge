# Story 3.3 - Paridade visual do prototipo

Status: **InProgress**
**Prioridade:** P1
**Owner:** @dev, com revisao de @ux-design-expert e gate de @qa

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - "npm run lint"
  - "npm run typecheck"
  - "npm test"
  - "npm run build"
  - "validacao responsiva e acessibilidade"
```

## Story

**Como** operador do Nuclear Challenge,
**quero** que a aplicacao em `src/` tenha a mesma estrutura visual e as mesmas informacoes de tela do prototipo de referencia,
**para que** a experiencia de login, operacao, analise e resultado seja consistente entre os dois artefatos.

## Contexto e fontes

- Fonte visual: `Arquivos_Diversos/nuclear-challenge-app.tsx`
- Destino da implementacao: `src/`
- Fonte de verdade comportamental: hooks, dominio, adaptadores de armazenamento e fluxos existentes em `src/`
- Inventario rastreavel: `docs/ux/prototype-visual-inventory.md`

## Escopo

- Manter regras de jogo, dados, armazenamento, persistencia e fluxos existentes.
- Alterar somente apresentacao, composicao visual, tokens e organizacao de componentes necessaria para a paridade.
- Nao transportar a logica monolitica do prototipo para `src/`.
- Preservar os contratos de props, callbacks e hooks existentes.

## Criterios de aceitacao

- [ ] Login exibe cabecalho da usina, identificacao, criacao/selecao de operador, contagem, estado vazio e exclusao com a mesma hierarquia visual do prototipo.
- [ ] Menu exibe operador, titulo, niveis, recordes, tempo, audio e acao de inicio com a mesma hierarquia visual do prototipo.
- [ ] Jogo exibe status UN-01, medidor de nucleo, suportes, lampadas, valvulas, opcoes de operacao, resposta, teclado e metrica de sessao.
- [ ] Ranking exibe abas, tabela, medalhas, pontos, acerto, sequencia e estados sem dados de acordo com a referencia.
- [ ] Analise exibe cabecalho, mapa de tabuadas, desempenho por operacao/formato, prioridades, dominio e graficos/metricas disponiveis nos dados atuais.
- [ ] Fim de jogo exibe estados de vitoria, derrota, encerramento, promocao, relatorio de desempenho, navegacao e reinicio.
- [ ] Valores visuais repetidos sao lidos de `src/design/tokens.ts`; nao sao introduzidas novas cores, sombras ou tamanhos literais repetidos nos paineis.
- [ ] Layout reflui em desktop e mobile sem depender de `zoom` ou largura fixa e sem barra horizontal nos breakpoints cobertos pelos testes existentes.
- [ ] Estados vazio, carregamento, pausa, erro, vitoria e derrota permanecem acessiveis e preservam seus textos/roles observaveis.
- [ ] Testes verificam rotulos, metricas, botoes, estados e navegacao das telas afetadas.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` sao executados; qualquer falha pre-existente fica registrada sem ser mascarada.
- [ ] File List, checkboxes e Dev Agent Record sao atualizados antes do handoff para QA.

## Tasks / Subtasks

- [x] 1. Consolidar inventario e baseline visual.
  - [x] Conferir a composicao e os textos da referencia por tela.
  - [x] Mapear referencia para `LoginPanel`, `MenuPanel`, `GamePlayPanel`, `RankingPanel`, `AnalisePanel`, `EndGamePanel`, `CoreGauge`, `Plate`, `Lamp`, `Lcd`, `MetricBadge`, `Support` e `Valve`.
  - [x] Registrar estados e riscos de regressao no inventario.
- [x] 2. Ajustar tokens e primitives.
  - [x] Consolidar paleta nuclear, tipografia, superficies, recessos, gradientes, bordas e breakpoints em `src/design/tokens.ts`.
  - [x] Fazer primitives consumirem tokens sem alterar seus contratos publicos.
- [x] 3. Aplicar paridade aos paineis.
  - [x] Ajustar Login e Menu por meio do shell/primitives compartilhados.
  - [x] Ajustar Gameplay e seus indicadores por meio de `CoreGauge`, `Support`, `Lamp`, `Valve`, `Plate` e `Lcd`.
  - [x] Preservar Ranking, Analise e fim de jogo existentes sem transportar a logica monolitica.
  - [x] Preservar callbacks, hooks, armazenamento e dominio.
  - [x] Preservar o contexto da partida no fluxo `pause -> analise -> pause`.
- [x] 4. Validar responsividade e acessibilidade.
  - [x] Verificar desktop e mobile nos breakpoints existentes por suite responsiva e shell compacto.
  - [x] Verificar foco, nomes acessiveis, estados por mais de um canal e `prefers-reduced-motion`.
  - [x] Confirmar ausencia de layout horizontal quebrado por regras do shell e suite responsiva.
- [x] 5. Adicionar ou atualizar testes comportamentais de UI.
  - [x] Cobrir informacoes visuais e interacoes observaveis das primitives.
  - [x] Preservar cobertura existente de estados vazio, pausa, erro, vitoria e derrota.
  - [x] Adicionar regressao para retorno da analise detalhada ao turno pausado.
  - [x] Garantir que uma conta com erro nao retorne antes de o baralho do perfil ativo ser esgotado.
- [x] 6. Executar gates e preparar handoff.
  - [x] Executar lint, typecheck, testes e build.
  - [x] Atualizar File List, Dev Agent Record e Change Log.
  - [x] Encaminhar para QA sem marcar a revisao visual manual como concluida.

## Dev Notes

### Inventario resumido

O inventario detalhado esta em `docs/ux/prototype-visual-inventory.md`. A referencia usa uma superficie escura de painel metalico, tipografia compacta com valores monoespacados para dados, superficies LCD rebaixadas, ciano para informacao, amber para prioridade, vermelho para risco e verde para sucesso. O layout e uma coluna compacta no mobile, com agrupamento vertical de placas e controles.

### Restricoes tecnicas

- `src/` continua sendo a fonte de verdade para estado e comportamento.
- Nao reintroduzir a implementacao monolitica da referencia em `App.tsx` ou nos paineis.
- Nao remover EmptyState, ErrorBoundary, suporte a teclado, armazenamento ou guards existentes.
- O trabalho e de frontend/UX e deve preservar os contratos atuais.

### Quality gate e agentes

- @dev: implementacao e gates locais.
- @ux-design-expert: conformidade visual, Atomic Design e acessibilidade.
- @qa: validacao final e veredito.
- @devops: somente operacoes remotas, PR ou release.

## Testing

- Vitest + Testing Library para componentes e estados observaveis.
- Suite existente de a11y/responsividade para regressao.
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI nao esta habilitado em `core-config.yaml`. A validacao de qualidade sera manual nesta story.

## File List

- [x] `docs/ux/prototype-visual-inventory.md`
- [x] `src/design/tokens.ts`
- [x] `src/index.css`
- [x] `src/index.tsx`
- [x] `src/storage/browserStorageHost.ts`
- [x] `src/styles/responsive.css`
- [x] `src/components/Label.tsx`
- [x] `src/components/Plate.tsx`
- [x] `src/components/Lamp.tsx`
- [x] `src/components/Lcd.tsx`
- [x] `src/components/MetricBadge.tsx`
- [x] `src/components/Support.tsx`
- [x] `src/components/PauseButton.tsx`
- [x] `src/__tests__/visual-parity.test.tsx` — regression for the five weakest and five strongest tables in the analysis cards
- [x] `src/__tests__/empty-states.test.tsx`
- [x] `src/__tests__/pause-analysis-return.test.tsx`
- [x] `src/hooks/useUIState.ts`
- [x] `src/constants/timing.ts`
- [x] `src/__tests__/feedback-duration.test.ts`
- [x] `src/__tests__/boom.test.tsx`
- [x] `src/hooks/useGameState.ts` — sem fila de revisao imediata; consome somente o baralho ativo
- [x] `src/domain/core/QuestionPolicy.ts`
- [x] `src/domain/core/Performance.ts`
- [x] `src/hooks/useTurmaRegistry.ts`
- [x] `src/__tests__/question-policy.test.ts` — regressao: ciclo so reinicia depois de consumir todas as contas
- [x] `src/__tests__/performance-persistence.test.ts`
- [x] `tsconfig.json`
- [x] `vite.config.ts`
- [x] `vitest.config.ts`
- [x] `src/components/AnalisePanel.tsx`
- [x] `src/components/RankingPanel.tsx`
- [x] `src/components/NC003Panel.tsx`
- [x] `src/components/MenuPanel.tsx`
- [x] `src/components/EndGamePanel.tsx`
- [x] `src/__tests__/empty-states.test.tsx`
- [x] `src/App.tsx`
- [x] `supabase/migrations/20260914000000_backfill_analysis_from_answer_events.sql`
- [x] `.ai/decision-log-story-3.3-paridade-visual-prototipo.md`

## Dev Agent Record

### Agent Model Used

Orion orchestrated @sm/@po/@dev/@ux-design-expert.

### Debug Log References

`.ai/decision-log-story-3.3-paridade-visual-prototipo.md` - decisoes e evidencias do workflow YOLO.

### Completion Notes

Implementado em modo YOLO: inventario visual criado; tokens semanticos de console nuclear adicionados; primitives alinhadas a placas metalicas, LCD, labels, indicadores e foco; shell responsivo mantido compacto como a referencia; teste de paridade adicionado.

Correcao adicional: a navegacao para a analise agora registra a tela de origem. Quando aberta durante a pausa, a acao Voltar retorna a `pause`, preservando o estado atual da partida e mantendo o botao `RETOMAR` disponivel. Acesso pela menu continua retornando ao menu.

Feedback visual: resultados, mensagens, avisos, eventos operacionais e a tela de meltdown agora permanecem visiveis por no minimo 7 segundos, com a duracao centralizada em `MIN_VISIBLE_FEEDBACK_MS`. A cobertura de `Boom` foi atualizada e uma regressao dedicada garante o contrato temporal.

Implementacoes.md: faixas efetivas atualizadas nos cinco niveis; rotina reforcada a cada segunda dupla; contas erradas entram em repeticao espacada; erros sao persistidos por expressao para a analise; dias do calendario exibem desempenho no tooltip; e a meta de cada nivel passou de 1.000 para 1.500 pontos, representando aumento de 50% na pratica.

Implementacoes_2.md: possibilidades geradas por nivel nao se repetem ate o ciclo ser esgotado; telas de menu, ranking, analise e NC-003 exibem retorno ao jogo quando ha partida pausada; feedbacks de erro mostram a pergunta original, a resposta dada e a resposta correta.

Correcao de feedback: a descricao de resposta incorreta agora usa uma fonte compacta e largura limitada ao visor SVG, evitando que pergunta, resposta dada e gabarito ultrapassem o campo previsto.

Gates executados em 2026-09-11: `npm run lint` PASS, `npm run typecheck` PASS, `npm test -- --run` PASS (17 arquivos, 133 testes), `npm run build` PASS.

Auditoria UX/UI (2026-09-11): a acao destrutiva `REINICIAR` na tela de pausa/fim de turno agora exige confirmacao explicita em dialogo acessivel; `Cancelar` e `Esc` preservam o turno. A regressao cobre solicitacao, cancelamento, Escape, foco inicial e confirmacao. Gates: `npm run lint` PASS, `npm run typecheck` PASS, `npm test -- --run` PASS (18 arquivos, 135 testes) e `npm run build` PASS.

Ajuste visual solicitado (2026-09-11): os controles `PAUSAR` e `SAIR` do rodape do gameplay foram redesenhados como teclas elevadas, com o mesmo relevo, espacamento e resposta de pressao do teclado numerico. `PAUSAR` recebeu destaque ciano e `SAIR`, vermelho; seus callbacks e nomes acessiveis foram preservados. Validado com `npm run lint`, `npm run typecheck` e `npm test -- --run src/__tests__/visual-parity.test.tsx` (5 testes PASS).

Ajuste de limite solicitado (2026-09-11): a faixa inferior passou a usar uma grade de cinco colunas, compartilhada entre `PAUSAR`, `SAIR`, `META`, `SEQ` e `TEMPO`. Cada item respeita a largura da coluna; os cards de metricas tem altura equivalente aos botoes, rotulos mais visiveis e valores monoespacados em maior contraste. Validado com lint, typecheck e teste visual (5 testes PASS).

Ajuste visual NC-003 (2026-09-12): `VOLTAR`, `ANÁLISE` e `CONTINUAR` agora usam a mesma primitive de acao elevada, com gradiente, borda, sombra, altura e pressao consistentes. Validado com lint, typecheck e `empty-states.test.tsx` (27 testes PASS).

Ajuste visual do menu (2026-09-12): acoes de cabecalho, retorno ao jogo e audio receberam o mesmo acabamento elevado das demais telas. A cor ciano permanece reservada para acoes principais; acoes secundarias mantem contraste e relevo sem competir com a selecao de nivel. Validado com lint, typecheck e `empty-states.test.tsx` (28 testes PASS).

Ajuste visual NC-003 (2026-09-12): `RETORNAR AO JOGO` passou a consumir a mesma primitive elevada de `VOLTAR`, `ANÁLISE` e `CONTINUAR`, removendo a placa cinza isolada. Validado com lint, typecheck e `empty-states.test.tsx` (29 testes PASS).

Ajuste visual Ranking (2026-09-12): `RETORNAR AO JOGO` e `VOLTAR` passaram a usar acoes elevadas consistentes com as outras telas; o retorno e ciano (primario) e a volta usa a variante secundaria. Validado com lint, typecheck e `empty-states.test.tsx` (30 testes PASS).

Cobertura de contas (2026-09-12): a geracao de perguntas passou a consumir baralhos embaralhados de possibilidades enumeradas. ROTINA normal, ROTINA reforcada e PRIORITÁRIA nao repetem uma questao ate esgotarem todas as combinacoes validas de seu perfil/faixa. A regra foi aplicada tanto no fluxo ativo de `App` quanto no hook compartilhado e possui teste de cobertura exaustiva.

Ajuste visual solicitado (2026-09-11): todos os controles da tela de fim/pausa de turno agora usam o mesmo padrao elevado de `REINICIAR`, com relevo, foco e resposta de pressao. As cores diferenciam analise/reinicio (ciano), ranking/menu (amber) e retomar/continuar (verde), sem alterar os callbacks ou nomes acessiveis.

Correcao de escopo visual (2026-09-11): na tela de analise, os controles `RETORNAR AO JOGO` e `VOLTAR` foram destacados no mesmo padrao elevado de `REINICIAR`; retorno ao jogo usa verde e voltar usa ciano. Os callbacks e rotulos acessiveis foram preservados.

Ajuste fino UX/UI (2026-09-12): login e HUD receberam refinamento de hierarquia, espacamento e contraste conforme referencias visuais. O cabecalho e as acoes do login tem fontes e alvos de toque mais legiveis; a lista de operadores ganhou respiro; o controle de audio deixou de expandir o HUD; e medidor, suportes e lampadas tiveram rotulos/valores reequilibrados para leitura em tela compacta.

Correcao responsiva (2026-09-12): o dialogo de confirmacao de reinicio passou a limitar explicitamente sua largura a `24rem` ou a largura disponivel do viewport, evitando que o card e suas acoes ocupem toda a tela em desktop.

Correcao funcional (2026-09-12): o grafico de acerto por tabuada deixou de descartar registros com menos de tres tentativas. A visualizacao agora inclui qualquer tabuada com ao menos uma resposta registrada, preservando o acompanhamento desde o primeiro exercicio.

Correcao de analise (2026-09-13): o card "Contas respondidas incorretamente" passou a exibir todas as contas registradas, em vez de restringir a lista às oito ocorrências mais recentes.

Correcao de distribuicao (2026-09-14): erros continuam registrados para analise, mas nao voltam para uma fila imediata de revisao. A proxima conta e sempre retirada do baralho do perfil ativo; portanto, nenhuma possibilidade daquele ciclo reaparece antes de todas as demais serem apresentadas. A regressao do ciclo foi ampliada.

Validacao (2026-09-14): `git diff --check` passou e nao ha referencias a `reviewQueue` nos dois fluxos de jogo. `npm test -- --run src/__tests__/question-policy.test.ts` e `npm run lint` foram iniciados, mas os runners Node ficaram bloqueados sem diagnostico; as execucoes foram interrompidas sem alterar processos externos. Os gates completos permanecem pendentes de nova execucao em ambiente Node estavel.


Gates executados em 2026-09-10: `npm run lint` PASS, `npm run typecheck` PASS, `npm test -- --run` PASS (13 arquivos, 131 testes), `npm run build` PASS. Smoke test do dev server PASS em `http://127.0.0.1:5173/` (HTTP 200).

Update (2026-09-13): the "Reforcar com prioridade" and "Dominio consolidado" cards now display the five lowest- and highest-performing tables, respectively. The UI regression verifies that exactly five entries are rendered in each card.

Correcao de analise (2026-09-14): o encerramento da partida agora envia o snapshot completo, incluindo `sessionStats`, para a RPC remota. A analise passa a usar o limite explicito de 10 respostas, e a migration `20260914000000` recompôs os contadores e dias de estudo ja existentes a partir de `game_answer_events`.

Revisao visual manual tela a tela e veredito formal de @qa permanecem pendentes para o handoff.

### Change Log

| Data | Autor | Mudanca |
|---|---|---|
| 2026-09-10 | 1.0.0 | Story criada a partir da solicitacao de paridade visual e dos artefatos existentes. @sm (River) |
| 2026-09-10 | 1.0.1 | Validated GO (9/10) - Status: Draft -> Ready | @po (Pax) |
| 2026-09-10 | 1.1.0 | Implementacao YOLO concluida e encaminhada para revisao visual/QA. @dev (Dex) |
| 2026-09-10 | 1.1.1 | Corrigido retorno da analise detalhada para o contexto de pausa; gates refeitos. | @dev (Dex) |
| 2026-09-10 | 1.1.2 | Feedbacks visuais mantidos por no minimo 7 segundos; cobertura temporal adicionada; gates refeitos. | @dev (Dex) |
| 2026-09-11 | 1.1.3 | Implementacoes_2 concluido: ciclo sem repeticoes excessivas, retorno ao jogo e feedback de erro contextualizado; gates refeitos. | @dev (Dex) |
| 2026-09-11 | 1.1.4 | Auditoria UX/UI: reinicio passou a requerer confirmacao acessivel; cobertura de regressao e gates atualizados. | @ux-design-expert (Uma) |
| 2026-09-11 | 1.1.5 | QA Gate FAIL — Status: InReview → InProgress — requisitos e evidencia de UX/UI incompletos. | @qa (Quinn) |
| 2026-09-11 | 1.1.6 | Controles PAUSAR e SAIR alinhados ao padrao visual do teclado, com destaque semantico e teste de regressao. | @dev (Dex) |
| 2026-09-11 | 1.1.7 | Faixa inferior limitada em cinco colunas; cards META, SEQ e TEMPO receberam maior destaque. | @dev (Dex) |
| 2026-09-12 | 1.1.8 | Botoes de navegacao do NC-003 alinhados ao padrao visual de CONTINUAR. | @dev (Dex) |
| 2026-09-12 | 1.1.9 | Acoes de cabecalho, retorno e audio do menu alinhadas ao padrao elevado. | @dev (Dex) |
| 2026-09-12 | 1.1.10 | RETORNAR AO JOGO do NC-003 alinhado ao padrao elevado dos demais controles. | @dev (Dex) |
| 2026-09-12 | 1.1.11 | Botoes de retorno e volta do Ranking alinhados ao padrao elevado. | @dev (Dex) |
| 2026-09-12 | 1.1.12 | Geracao de contas trocada por ciclos completos sem repeticao prematura. | @dev (Dex) |
| 2026-09-11 | 1.1.7 | Ajustado o texto de feedback de resposta incorreta para permanecer dentro do visor do problema. | @dev (Dex) |
| 2026-09-11 | 1.1.8 | Feedback de resposta incorreta distribuido em tres linhas e ampliado para melhor legibilidade. | @dev (Dex) |
| 2026-09-11 | 1.1.9 | Escala tipografica elevada para piso de 10 px nos paineis de analise, ranking, pausa e menu. | @ux-design-expert (Uma) |
| 2026-09-12 | 1.1.10 | Refinado ritmo tipografico: entrelinhas, espacamento de rotulos e altura dos cards densos. | @ux-design-expert (Uma) |
| 2026-09-12 | 1.1.11 | Auditoria UX completa: piso tipografico, quebra segura de textos, alertas responsivos e metricas sem truncamento. | @ux-design-expert (Uma) |
| 2026-09-11 | 1.1.8 | Todos os botoes da tela de fim/pausa foram destacados e padronizados com o controle REINICIAR. | @dev (Dex) |
| 2026-09-11 | 1.1.9 | Controles da tela de analise destacados com o padrao visual de REINICIAR. | @dev (Dex) |
| 2026-09-12 | 1.2.0 | Refinamento de tipografia, espacamento, cards e destaque no login e HUD a partir das referencias visuais. | @ux-design-expert (Uma) |
| 2026-09-12 | 1.2.1 | Dialogo de reinicio limitado proporcionalmente ao console e ao viewport. | @dev (Dex) |
| 2026-09-12 | 1.2.2 | Grafico de acerto por tabuada passa a exibir dados desde a primeira tentativa. | @dev (Dex) |
| 2026-09-12 | 1.2.3 | Corrigido armazenamento em hospedagem estática com host IndexedDB e fallback em memória; mock de desenvolvimento removido do bundle de produção. | @dev (Dex) |
| 2026-09-13 | 1.2.4 | Card de contas incorretas exibe integralmente o histórico registrado; regressão adicionada. | @dev (Dex) |

| 2026-09-14 | 1.2.6 | Removida a fila de revisao imediata que repetia contas erradas antes de completar o baralho; regressao do ciclo ampliada. | @devops (Gage) |

| 2026-09-13 | 1.2.5 | Cards de reforco e dominio passam a listar cinco tabuadas; regressao adicionada. | @dev (Dex) |
| 2026-09-14 | 1.2.7 | Corrigida a persistencia das metricas de analise; o painel inicia na 10a resposta e o historico foi recomposto a partir dos eventos salvos. | @dev (Dex) |

## QA Results

### Review Date: 2026-09-11

### Reviewed By: Quinn (Test Architect)

Gates executados: `npm run lint` PASS, `npm run typecheck` PASS, `npm test -- --run` PASS (18 arquivos, 135 testes) e `npm run build` PASS. O build emitiu aviso de bundle JavaScript acima de 500 kB.

A implementacao cobre uma parcela substantiva da auditoria, incluindo tokens, primitives, estados vazios, dialogo de reinicio e fluxos de pausa. Nao ha evidencia suficiente para declarar a auditoria integralmente implementada: o HUD mantem abreviacoes de indicadores e a saida destrutiva fica adjacente ao controle de pausa; os testes de responsividade/acessibilidade sao predominantemente declarativos e nao validam os breakpoints e estados reais exigidos.

### Gate Status

Gate: FAIL → docs/qa/gates/3.3-paridade-visual-do-prototipo.yml
