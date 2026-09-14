# Workflow @aiox-master - acompanhamento pedagogico em modo YOLO

**Orquestrador:** `@aiox-master`  
**Modo:** YOLO, automatico, sem elicitação humana  
**Fonte funcional principal:** `docs/estrutura-acompanhamento.md`  
**Plano tecnico de apoio:** `docs/plans/plano-implementacao-desempenho-sem-banco.md`  
**Story de persistencia relacionada:** `docs/stories/story-2.1-storage-adapter-dominio.md`  
**Executor de codigo:** `@dev`  
**Revisor de arquitetura:** `@architect`  
**Criador/validador de stories:** `@sm` e `@po`  
**Veredito de qualidade:** `@qa`  
**Operacoes remotas:** somente `@devops`

## 1. Objetivo

Implementar e validar o acompanhamento pedagogico descrito em `docs/estrutura-acompanhamento.md`, preservando as regras atuais do jogo e sem banco de dados.

O resultado deve:

- registrar o desempenho por operador;
- acumular historico global e diario;
- separar acertos e erros por fator/tabuada, operacao e formato da pergunta;
- manter o calendario mensal e a prioridade de estudo coerentes com os dados;
- recuperar os dados depois de recarregar a aplicacao;
- continuar compativel com operadores legados;
- exibir falhas de persistencia sem sobrescrever dados silenciosamente.

O mecanismo persistente oficial e `window.storage`, fornecido pelo ambiente hospedeiro. O workflow nao deve criar banco SQL/NoSQL, endpoint de rede, `localStorage` ou `sessionStorage`.

## 2. Contrato de execucao YOLO

O @aiox-master deve executar as etapas em sequencia, sem pedir confirmacao entre elas.

Regras obrigatorias:

1. Criar um `run_id`, `story_id`, intent sanitizado e teto de custo antes de qualquer dispatch.
2. Executar scan de injecao no intent antes de interpretar caminhos ou comandos.
3. Nao alterar codigo antes do inventario, da baseline e do grafo de dependencias.
4. Delegar cada autoridade ao agente correto; o master coordena e nao falsifica vereditos.
5. Corrigir automaticamente apenas falhas locais dentro da story ativa.
6. Nao contornar gate BLOCK, falha de dados, falha de migracao ou perda de compatibilidade.
7. Nao inventar requisito. Em conflito entre fonte, codigo e story, registrar a evidencia e marcar `BLOCKED` para decisao do agente autorizado.
8. Nao implementar checkpoint de partida em andamento: `docs/estrutura-acompanhamento.md` determina consolidacao no fim da partida.
9. Nao marcar QA como aprovado sem veredito real de `@qa`.
10. Nao executar push, PR, release ou tag; essas operacoes pertencem ao `@devops`.

### Estados de termino

- `DONE`: stories do escopo concluidas, gates verdes, QA aprovado e handoff gravado.
- `PARTIAL`: implementacao local valida, mas existe pendencia nao bloqueante explicitamente registrada.
- `BLOCKED`: conflito, perda de dados, dependencia ausente, gate critica falha ou ferramenta obrigatoria indisponivel.

O workflow nunca termina como sucesso silencioso.

## 3. Artefatos obrigatorios do run

Criar uma pasta em `.aiox/runs/<run_id>/` contendo:

```text
run-manifest.yaml
intent-scan.json
baseline-report.md
dependency-graph.yaml
implementation-log.md
quality-report.md
handoff.yaml
```

Os artefatos nao devem substituir documentos existentes.

## 4. Fase 0 - inicializacao e protecao

Responsavel: `@aiox-master`.

1. Resolver a raiz do projeto e o perfil AIOX.
2. Ler `AGENTS.md` e `.aiox-core/constitution.md`.
3. Registrar branch, estado do worktree e storys ativas.
4. Criar o intent:

   ```text
   Implementar docs/estrutura-acompanhamento.md no sistema existente,
   registrando desempenho por operador e por dia local, sem banco de dados,
   usando o mecanismo de persistencia permitido pelo projeto.
   ```

5. Executar scan de Unicode invisivel, override de sistema, traversal e payload de codigo.
6. Definir o teto de custo do run no manifesto.
7. Se o scan falhar, encerrar `BLOCKED` com evidencia.

## 5. Fase 1 - inventario e baseline

Responsaveis: `@aiox-master` + `@analyst`.

Ler:

- `docs/estrutura-acompanhamento.md`;
- `docs/plans/plano-implementacao-desempenho-sem-banco.md`;
- `docs/architecture/system-architecture.md`;
- `src/App.tsx`;
- `src/hooks/useTurmaRegistry.ts`;
- `src/utils/studyLog.ts`;
- `src/domain/core/StudyLog.ts`;
- `src/components/AnalisePanel.tsx`;
- `src/components/RankingPanel.tsx`;
- adapters de `src/adapters/` e `src/domain/storage/`;
- testes existentes de storage e dados.

Produzir uma matriz com:

| Area | Evidencia esperada | Estado |
|---|---|---|
| `bump` por resposta | registra hit/miss em sessao | pronto/pendente |
| `stats.tabs` | contagem por fator | pronto/pendente |
| `stats.ops` | multiplicacao/divisao | pronto/pendente |
| `stats.forms` | direto/inverso | pronto/pendente |
| `studyLog` | dia local, tipos e tabelas | pronto/pendente |
| `saveResult` | consolida no fim da partida | pronto/pendente |
| `operadores` | leitura/escrita persistente | pronto/pendente |
| `partidas` | historico resumido | pronto/pendente |
| calendario | acertos/total por dia | pronto/pendente |
| prioridade | ordenacao por erros, taxa e volume | pronto/pendente |
| legado | dados sem `studyLog` continuam validos | pronto/pendente |

Registrar tambem os riscos atuais:

- contratos conflitantes de `window.storage`;
- uso de `window.localStorage` em adapter legado;
- adapters duplicados;
- persistencia direta no `App.tsx`;
- dados da sessao perdidos quando a partida nao chega ao encerramento.

**Gate:** nenhum codigo alterado se o inventario e a baseline nao estiverem salvos.

## 6. Fase 2 - arquitetura e contrato de dados

Responsavel: `@architect`, coordenado por `@aiox-master`.

1. Definir um unico `StorageAdapter` canonico.
2. Encapsular o contrato do host:

   ```ts
   get(key: string, global: boolean): Promise<{ value?: string } | null>;
   set(key: string, value: string, global: boolean): Promise<boolean>;
   ```

3. Definir a API interna assincrona para `read`, `write`, `merge`, `clear`, `getHealth` e `clearError`.
4. Definir o envelope persistido:

   ```ts
   {
     schemaVersion: 1,
     updatedAt: number,
     data: unknown
   }
   ```

5. Definir migracao de registro legado sem envelope para v1.
6. Definir estados `healthy`, `degraded` e `unavailable`.
7. Definir a politica de merge aditivo para campos desconhecidos, `stats` e `studyLog`.
8. Definir que `pause` nunca e outcome persistido.

**Gate BLOCK:** a arquitetura nao pode aceitar dois adapters, acesso direto do componente ao host ou qualquer uso de storage proibido.

## 7. Fase 3 - stories e grafo de dependencias

Responsaveis: `@sm` cria/refina; `@po` valida; `@aiox-master` coordena.

Reusar a Story 2.1 para o trabalho de `StorageAdapter`. Criar somente stories ausentes, sem duplicar escopo.

Stories minimas:

1. **Storage e migracao**
   - adapter unico;
   - schema v1;
   - leitura legada;
   - estado de saude;
   - merge nao destrutivo.
2. **Consolidacao de desempenho**
   - `recordAnswer`/`bump`;
   - `mergeSessionIntoPlayer`;
   - `mergeStudyLog`;
   - registro em data local.
3. **Integracao do ciclo de partida**
   - carregar operadores e partidas;
   - salvar win/lose/quit uma vez;
   - nao salvar pause;
   - impedir sobrescrita apos falha de leitura.
4. **Analise e calendario**
   - exibir registros recuperados;
   - dias vazios;
   - navegacao mensal;
   - percentual e contagem coerentes.
5. **Compatibilidade e qualidade**
   - fixtures legadas;
   - testes de round-trip;
   - testes de falha;
   - gates obrigatorias.

Cada story deve conter acceptance criteria, dependencias, riscos, testes e File List. `@po` move de Draft para Ready antes do desenvolvimento.

Grafo base:

```text
inventario
   -> contrato/adaptador
   -> modelo/migracao
   -> consolidacao pura
   -> integracao App
   -> analise/calendario
   -> QA e gates
```

Implementacao paralela somente e permitida em arquivos e contratos sem concorrencia.

## 8. Fase 4 - implementacao do modelo e dominio

Responsavel: `@dev`.

Implementar ou ajustar funcoes puras para:

### Registro de resposta

Para cada pergunta respondida:

1. identificar `hit` ou `miss`;
2. incrementar fatores envolvidos em `stats.tabs`;
3. incrementar operacao em `stats.ops`;
4. incrementar formato em `stats.forms`;
5. localizar o dia com `localDay`;
6. incrementar `total`, `hits` ou `misses`;
7. atualizar `types` para operacao e formato;
8. atualizar `tables` para cada fator;
9. atualizar `updatedAt`.

Usar somente:

- `multiplication` e `division` para operacao;
- `direct` e `inverse` para formato;
- `YYYY-MM-DD` baseado no horario local.

### Consolidacao do operador

Ao finalizar a partida:

1. partir do operador persistido;
2. preservar campos desconhecidos;
3. somar `games`, `ops`, `hits` e `wins` conforme outcome;
4. atualizar `best`, `streak` e `rank` sem reduzir valores;
5. combinar `stats` sem zerar historico;
6. combinar `studyLog` de forma aditiva;
7. retornar um novo objeto, sem mutar o registro anterior.

### Historico de partidas

Adicionar em `partidas` somente o resumo ja usado pelo produto, preservando limite e ordenacao existentes. Nao criar novas metricas sem rastreabilidade no documento fonte.

**Gate:** testes unitarios de cada funcao pura passam antes da integracao React.

## 9. Fase 5 - implementacao do adapter e migracao

Responsaveis: `@dev` + revisao de `@architect`.

1. Remover a implementacao que usa `window.localStorage`.
2. Remover a implementacao concorrente ou torna-la inexistente no build.
3. Fazer o adapter ler o retorno do host e decodificar JSON.
4. Aceitar registro legado sem versao.
5. Envelopar novas escritas em schema v1.
6. Bloquear escrita baseada em leitura invalida.
7. Registrar auditoria minima de operacao, resultado e transicao de saude.
8. Permitir fallback em memoria apenas para manter a tela renderizavel, com erro visivel.
9. Nunca reportar persistencia como sucesso quando `set` falhar.

Testar antes de ligar ao `App`:

- chave inexistente;
- host ausente;
- JSON invalido;
- write rejeitado;
- merge com campo desconhecido;
- migracao legado -> v1;
- round-trip v1.

## 10. Fase 6 - integracao do App e ciclo de vida

Responsavel: `@dev`.

Substituir todos os acessos diretos ao host em `App.tsx` pelo adapter.

### Carregamento

1. Ler `operadores`.
2. Migrar e normalizar dados.
3. Usar operador local inicial somente quando nao houver dado.
4. Ler `partidas` separadamente.
5. Expor estado de saude para a UI.

### Salvamento

1. `bump` atualiza a sessao em memoria.
2. `win`, `lose` ou `quit` acionam `saveResult`.
3. `saved.current` impede duplicacao.
4. O adapter le, faz merge e grava `operadores`.
5. O adapter le, adiciona e grava `partidas`.
6. O resultado de cada gravacao e tratado.

### Pausa

- pausar interrompe timers e audio;
- pausar nao chama `saveResult`;
- voltar da analise para a pausa preserva o contexto;
- `RETOMAR` continua retornando ao jogo.

**Gate BLOCK:** qualquer perda de estatistica, duplicacao de partida ou gravacao de pausa interrompe a onda.

## 11. Fase 7 - analise, calendario e prioridade

Responsavel: `@dev` com verificacao de `@ux-design-expert` quando houver alteracao visual.

Confirmar que a tela de analise:

1. le `stats` e `studyLog` do operador atual;
2. diferencia operador sem historico de dados zerados;
3. exibe o calendario com sete colunas;
4. mostra `acertos/total` nos dias ativos;
5. mantém dias vazios visiveis;
6. calcula total e percentual mensal;
7. combina prioridade dos dados acumulados;
8. considera fatores, multiplicacao, divisao, direto e inverso;
9. ordena por mais erros, menor accuracy e maior volume;
10. limita a lista ao comportamento documentado;
11. continua responsiva e acessivel.

Nao alterar a escala de cores, os thresholds ou a ordem sem rastreabilidade no documento fonte.

## 12. Fase 8 - testes de aceite

Responsavel: `@qa`, com execucao de `@dev`.

### Dados e migracao

- operador novo inicia com estrutura valida;
- operador legado sem `studyLog` e aceito;
- dados desconhecidos sobrevivem;
- `studyLog` preserva dias anteriores;
- dia local nao sofre deslocamento UTC;
- registro v1 pode ser lido apos recarregar.

### Ciclo de partida

- resposta correta incrementa somente acertos;
- resposta errada incrementa somente erros;
- fatores de uma operacao sao registrados;
- vitoria salva uma vez;
- derrota salva uma vez;
- abandono salva uma vez;
- pausa nao salva;
- retorno da analise para pausa preserva o turno.

### Falhas

- host ausente nao apaga dados em memoria;
- JSON corrompido nao e sobrescrito;
- falha de escrita fica visivel;
- ranking e analise continuam renderizaveis em estado vazio.

### Integracao

Executar pelo menos um fluxo completo:

```text
fixture legada
 -> carregar
 -> jogar respostas
 -> finalizar
 -> gravar
 -> recriar adapter/App
 -> carregar novamente
 -> conferir ranking, analise e calendario
```

## 13. Fase 9 - gates obrigatorias

Executar:

```text
npm run lint
npm run typecheck
npm test -- --run
npm run build
git diff --check
npm run validate:structure
npm run validate:agents
npm run sync:ide:check
```

Executar buscas de invariantes:

```text
rg -n "window\.storage" src/App.tsx
rg -n "window\.localStorage|window\.sessionStorage" src
rg -n "class StorageAdapter|interface IStorageAdapter" src
```

Resultado esperado:

- nenhum acesso direto do `App` ao host;
- nenhum storage proibido em producao;
- uma implementacao canonica;
- suite e build verdes.

Falha corrigivel pode gerar uma rodada automatica limitada a story ativa. Falha repetida por tres rodadas, perda de dados ou conflito de requisito encerra como `BLOCKED`.

## 14. Fase 10 - QA, registro e handoff

1. `@qa` executa os testes e emite `PASS`, `CONCERNS` ou `FAIL`.
2. `@dev` corrige somente findings aplicaveis e repete os gates.
3. Atualizar Tasks/Subtasks, File List, Debug Log, Completion Notes e Change Log das stories.
4. Registrar arquivos alterados e evidencias no `quality-report.md`.
5. Gravar `handoff.yaml` com:

   ```yaml
   run_id: <id>
   status: DONE|PARTIAL|BLOCKED
   stories: []
   gates: []
   qa_verdict: PASS|CONCERNS|FAIL|PENDING
   pending: []
   rollback_notes: []
   next_agent: devops|qa|master
   ```

6. Se houver publicacao remota, entregar ao `@devops`; o master nao publica.

## 15. Criterios finais de aceite

- O modelo de `docs/estrutura-acompanhamento.md` esta implementado sem banco de dados.
- O desempenho e associado ao operador correto.
- O historico acumulado e o registro diario sao preservados.
- `tabs`, `ops`, `forms` e `studyLog` recebem os dados corretos.
- O calendario e a prioridade usam dados persistidos e nao dados temporarios.
- Operadores legados continuam legiveis.
- Campos desconhecidos nao sao apagados.
- `win`, `lose` e `quit` gravam uma unica vez.
- `pause` nao e persistido como partida finalizada.
- Falhas do host sao visiveis e nao geram sobrescrita silenciosa.
- Nao existe `localStorage`/`sessionStorage` em codigo de producao.
- Existe uma implementacao canonica do adapter.
- `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- @qa emitiu veredito.
- O handoff foi gravado.

## 16. Fora de escopo

- banco SQL ou NoSQL;
- backend, API ou sincronizacao em nuvem;
- login remoto;
- checkpoint automatico de partidas incompletas;
- novas metricas nao descritas na fonte;
- mudancas nas regras de jogo, pontuacao ou dificuldade;
- alteracoes visuais sem relacao com os dados de acompanhamento.
