# Workflow AIOX — reconstruir o `nuclear-challenge` em modo YOLO

**Orquestrador:** `@aiox-master`  
**Executor padrão:** automático, sem elicitação humana  
**Fonte de verdade do produto:** `Arquivos_Diversos/handoff-01-genese.md`, `handoff-02-referencia.md`, `handoff-03-roadmap.md` e `handoff-04-codigo.txt`  
**Princípios:** CLI First, Story-Driven Development, No Invention, Quality First e Model Governance.

> Este workflow foi derivado dos artefatos existentes. O repositório não contém um documento com o título literal “Plano AIOX para reconstruir o nuclear-challenge”; por isso os 12 passos abaixo formalizam a reconstrução sem inventar escopo adicional.

## Objetivo

Reconstruir e evoluir o artefato React do simulador educacional de tabuada, preservando a física, o loop pedagógico, o design industrial e as restrições do ambiente, enquanto os módulos pendentes são implementados por ondas, validados e documentados automaticamente.

## Modo YOLO

O `@aiox-master` deve executar as etapas em sequência, disparar agentes especializados quando a autoridade exigir e não pedir confirmação entre etapas.

Regras operacionais:

1. Toda execução começa com um `intent` persistido, um `budget_ceiling_usd` definido e um `story_id` válido.
2. O intent passa por scan de injeção: Unicode invisível, override de sistema, traversal de caminho e payloads de código. Falha rejeita e registra a execução.
3. O workflow pode corrigir automaticamente erros locais, atualizar checklists e repetir uma gate; não pode contornar uma gate BLOCK.
4. Falha repetida, orçamento esgotado, requisito contraditório ou ausência de ferramenta necessária encerra a execução com status `BLOCKED`, evidência e próximo comando sugerido. Não há loop infinito.
5. `@aiox-master` coordena; `@architect` decide arquitetura; `@sm`/`@po` criam stories; `@dev` implementa; `@qa` dá o veredito de qualidade; `@devops` é o único autorizado a push, PR, release ou tag.

## Os 12 passos

### 1. Inicializar e proteger a execução

Criar o diretório de execução, registrar timestamp, commit/estado inicial quando houver Git e gravar o intent sanitizado. Resolver o perfil AIOX e ativar YOLO apenas para esta execução.

**Saída:** `run-manifest` com `run_id`, `story_id`, teto de orçamento, escopo e status.

### 2. Inventariar o brownfield

Ler os quatro handoffs, o `AGENTS.md`, a Constitution e o código-fonte. Catalogar componentes, estados, dependências, persistência (`window.storage`), restrições de Tailwind, áudio e os artefatos ausentes.

**Gate:** nenhum código é alterado antes de o inventário e a lista de riscos existirem.

### 3. Reproduzir a baseline

Executar a validação disponível e registrar o que existe hoje: login, menu, jogo, cinco fases, escolha de contas, válvulas, persistência, ranking, gráficos e análise pedagógica. Separar defeitos comprovados de pendências apenas sugeridas.

**Saída:** relatório baseline com evidências e matriz “pronto / pendente / rejeitado”.

### 4. Fechar o diagnóstico do produto

Converter o roadmap em backlog priorizado. A ordem inicial é: modo de treino dirigido, relatório para responsável/professor, ponderação por dificuldade; depois progressão adaptativa, retomada, instrumentos independentes e multijogador. Soma/subtração só entra após decisão explícita de escopo registrada no artefato.

Não reimplementar eventos de resposta específica, painel com 25 instrumentos, excesso de efeitos, recompensas maiores, auto-submit ou `localStorage`.

### 5. Definir o contrato CLI-first

Antes de qualquer UI, especificar comandos/rotinas observáveis para: executar treino dirigido, gerar relatório, recalcular métricas, migrar dados legados, validar balanceamento e exportar evidências. A interface React apenas consome esses contratos e não controla decisões do workflow.

**Responsável:** `@architect`.  
**Gate:** contrato documentado e rastreável para cada requisito; sem tecnologia nova não validada.

### 6. Criar as stories de reconstrução

`@sm` ou `@po` deve criar uma story por incremento, com acceptance criteria, riscos, dependências, estratégia de teste e File List inicial. Cada story recebe um ID único e fica vinculada ao `run-manifest`.

Stories mínimas da primeira onda:

- treino dirigido baseado em `stats.tabs`;
- relatório consolidado baseado em `stats` e `matches`;
- taxa ponderada pela dificuldade com retrocompatibilidade.

### 7. Planejar ondas e atribuir agentes

Montar o grafo de dependências e executar em ondas:

| Onda | Conteúdo | Dependência |
|---|---|---|
| 0 | baseline, contratos, schemas e migração segura | passos 1–6 |
| 1 | treino dirigido + métricas ponderadas | onda 0 |
| 2 | relatório pedagógico | dados da onda 1 |
| 3 | progressão adaptativa e retomada | decisão de qualidade da onda 2 |
| 4 | instrumentos independentes e multijogador, somente se stories forem aprovadas | onda 3 |

Implementação paralela só é permitida para stories sem arquivos ou contratos concorrentes.

### 8. Implementar incrementalmente

`@dev` implementa uma story por vez, preservando as invariantes do handoff: pt-BR, fatores corretos para divisão, não regressão de `rankIdx`, `window.storage`, AudioContext iniciado por gesto, estilos finos inline e decisões matemáticas acima de decoração.

Após cada alteração: atualizar a File List e o checklist da story, executar a validação focada e registrar o diff.

### 9. Validar dados e compatibilidade

Executar fixtures para operadores novos e legados. Confirmar que campos novos de fase/dificuldade têm fallback seguro, que o ranking antigo continua legível, que o relatório não mistura contextos sem identificá-los e que nenhuma operação credita o dividendo como fator.

**Gate BLOCK:** perda de dados, migração destrutiva, regressão de persistência ou métrica sem origem rastreável.

### 10. Testar jogo, pedagogia e balanceamento

Automatizar casos para geração de operações, antirrepetição, faixas por fase, termos ocultos, surges, pontuação, vitória/derrota, válvulas, recargas, integridade, coolant, meltdown e promoções. Rodar simulações de balanceamento para detectar se a prioritária torna a rotina inútil ou se válvulas permitem ignorar matemática.

Valores não validados do handoff devem permanecer marcados como hipótese até os testes produzirem evidência.

### 11. Passar pelas gates de qualidade e observabilidade

Executar, no mínimo:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Executar também `npm run validate:structure`, `npm run validate:agents`, `npm run sync:ide:check` e as validações específicas disponíveis. `@qa` emite o veredito; CodeRabbit não pode ter issue CRITICAL. Falha gera correção automática limitada à story e nova rodada de gate.

### 12. Consolidar, sincronizar e entregar

Atualizar story, File List, checklist, decisões, riscos e relatório final. Sincronizar projeções a partir de `squads/` quando houver artefatos de squad. Produzir handoff para o próximo executor com `run_id`, stories concluídas, evidências, pendências e rollback.

Somente `@devops` pode publicar branch, PR, tag ou release. Sem Git, a execução entrega os artefatos locais e registra que publicação externa não foi realizada.

## Critério de conclusão

O workflow termina como `DONE` apenas quando todas as stories do escopo estão `Done` ou `Ready for Review`, as gates passam, o checklist e a File List estão atualizados e o handoff foi gravado. Caso contrário, termina `BLOCKED` ou `PARTIAL`, nunca como sucesso silencioso.

## Artefatos mínimos da execução

```text
run-manifest.yaml
intent-scan.json
baseline-report.md
dependency-graph.yaml
docs/stories/<story-id>.md
quality-report.md
handoff.yaml
```

Os arquivos de execução devem ser gravados em uma pasta de run dedicada e não substituir os handoffs originais. O código continua sendo o artefato integral versionado conforme a estratégia do projeto.

## Matriz de rastreabilidade

| Regra | Evidência usada |
|---|---|
| Física independente e duas condições de derrota | `handoff-01-genese.md` |
| Componentes, estados, APIs e armadilhas | `handoff-02-referencia.md` |
| Pendências, prioridades e rejeições | `handoff-03-roadmap.md` |
| Implementação existente | `handoff-04-codigo.txt` |
| Stories, autoridade, qualidade e orçamento | `AGENTS.md` + `.aiox-core/constitution.md` |
