# Plano de implementacao: desempenho sem banco de dados

## Objetivo

Implementar a gravacao persistente do desempenho das partidas sem banco de dados e sem `localStorage`/`sessionStorage`, seguindo o modelo de `docs/estrutura-acompanhamento.md`.

O armazenamento oficial sera o servico `window.storage` fornecido pelo ambiente hospedeiro. A aplicacao continuara client-side e gravara dois blobs JSON:

- `operadores`: perfis, historico acumulado, `stats` e `studyLog`;
- `partidas`: historico resumido das partidas finalizadas.

Este plano implementa a persistencia do desempenho no encerramento da partida. Nao implementar checkpoint de partida em andamento sem uma nova decisao de produto.

## Regras para a LLM executora

1. Trabalhar na Story 2.1, `docs/stories/story-2.1-storage-adapter-dominio.md`.
2. Ler antes de editar:
   - `docs/estrutura-acompanhamento.md`;
   - `docs/architecture/system-architecture.md`;
   - `src/App.tsx`;
   - `src/domain/storage/StorageAdapter.ts`;
   - `src/domain/storage/WindowStorageAdapter.ts`;
   - `src/adapters/StorageAdapter.ts`.
3. Nao transportar a logica monolitica para o adapter. O adapter cuida somente de leitura, escrita, merge, migracao e saude.
4. Nao introduzir banco de dados, API de rede, `localStorage`, `sessionStorage` ou dependencias novas sem uma story aprovada.
5. Nao considerar fallback em memoria como persistencia. Fallback em memoria serve apenas para manter a sessao utilizavel e exibir degradacao.
6. Preservar os contratos da UI, dos hooks e do dominio que nao forem diretamente relacionados ao armazenamento.
7. Nao gravar uma partida ao pausar. Pausa altera somente o fluxo da UI; a consolidacao ocorre em vitoria, derrota ou abandono, conforme a documentacao atual.

## Diagnostico que deve orientar a implementacao

O codigo atual possui tres contratos conflitantes:

- `App.tsx` espera `window.storage.get(key, global)` e `window.storage.set(key, value, global)`;
- `WindowStorageAdapter` acessa `window.storage[key]` diretamente;
- `src/adapters/StorageAdapter.ts` usa `window.localStorage`.

Antes de implementar o fluxo, a LLM deve eliminar essa ambiguidade. Deve existir uma unica implementacao canonica e um unico ponto de entrada usado por `App.tsx`.

## Resultado esperado

Ao finalizar uma partida:

1. cada resposta ja registrada na sessao atual e consolidada;
2. o operador correto e atualizado sem apagar campos desconhecidos;
3. `stats.tabs`, `stats.ops`, `stats.forms` e `studyLog` recebem os novos dados;
4. a partida resumida e adicionada em `partidas`;
5. recarregar a aplicacao recupera os dados;
6. a tela de analise, ranking e calendario usam os dados recuperados;
7. falhas de armazenamento ficam visiveis e nao causam sobrescrita destrutiva.

## Plano passo a passo

### Passo 0: validar precondicoes e estado atual

1. Confirmar que a Story 2.1 esta associada ao trabalho e que seus criterios continuam validos.
2. Executar busca de referencias:

   ```text
   rg -n "window\.storage|localStorage|sessionStorage|saveResult|studyLog|operadores|partidas" src tests docs
   ```

3. Registrar no log da story todos os acessos existentes.
4. Nao marcar criterios de aceite antes de o adapter estar integrado em um fluxo real.

### Passo 1: definir o contrato do host

Criar um contrato interno para o servico hospedeiro, sem expor essa API aos componentes:

```ts
type HostStorageResult = { value?: string } | null;

interface HostStorage {
  get(key: string, global: boolean): Promise<HostStorageResult>;
  set(key: string, value: string, global: boolean): Promise<boolean>;
}
```

O adapter deve:

- detectar `window.storage` ausente sem lancar para a UI;
- tratar retorno nulo como chave inexistente;
- tratar JSON invalido como storage degradado;
- nao assumir que `window.storage` e `localStorage` do navegador;
- manter a flag `global` usada pelo host atual.

Se o ambiente de execucao fornecer outro contrato, adaptar somente o gateway do host e manter o contrato do adapter estavel.

### Passo 2: escolher uma implementacao canonica

Unificar `src/adapters/StorageAdapter.ts` e `src/domain/storage/` em uma unica implementacao. A implementacao canonica deve oferecer uma API equivalente a:

```ts
interface StorageAdapter {
  read<T>(key: string): Promise<T | null>;
  write<T>(key: string, value: T): Promise<boolean>;
  merge<T>(key: string, partial: Partial<T>): Promise<boolean>;
  clear(key: string): Promise<boolean>;
  getHealth(): StorageHealth;
  clearError(): void;
}
```

`read`, `write`, `merge` e `clear` devem ser assincronos porque o host e assincrono.

Remover ou deixar de exportar a implementacao redundante. Ao final, a busca deve encontrar uma unica classe/modulo canonico.

### Passo 3: definir estado de saude

Usar estado observavel, por exemplo:

```ts
type StorageHealth = {
  status: 'healthy' | 'degraded' | 'unavailable';
  lastError?: string;
  lastOperation?: 'read' | 'write' | 'merge' | 'clear';
  changedAt?: number;
};
```

Regras:

- `healthy`: ultima operacao concluida;
- `degraded`: JSON invalido, falha de leitura ou escrita recuperavel;
- `unavailable`: `window.storage` nao existe ou nao responde;
- uma falha de leitura deve impedir escrita baseada em dados possivelmente corrompidos;
- a UI deve receber o estado para exibir `GlobalErrorBanner` ou equivalente.

Nao fingir que uma gravacao ocorreu quando o host retornou falha.

### Passo 4: definir envelope e migracao

Persistir cada chave com envelope versionado:

```ts
type StorageEnvelope<T> = {
  schemaVersion: 1;
  updatedAt: number;
  data: T;
};
```

O leitor deve aceitar:

1. registro legado sem envelope;
2. registro com `schemaVersion: 1`.

Para registro legado:

- interpretar o objeto atual como `data`;
- preencher `stats` ausente com `tabs: {}, ops: {}, forms: {}` quando necessario;
- preencher `studyLog` ausente com `{}`;
- preservar todos os campos desconhecidos;
- nao reescrever automaticamente antes de uma escrita valida, salvo se isso estiver coberto pelo contrato do adapter.

Criar funcoes puras testaveis:

```text
decodeEnvelope(raw)
migrateLegacyRecord(value)
encodeEnvelope(data)
```

### Passo 5: modelar os dados de desempenho

Manter o modelo documentado, sem renomear campos existentes:

```ts
type HitMiss = { h: number; m: number };

type StudyDay = {
  key: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  total: number;
  hits: number;
  misses: number;
  types: {
    multiplication: HitMiss;
    division: HitMiss;
    direct: HitMiss;
    inverse: HitMiss;
  };
  tables: Record<string, { hits: number; misses: number }>;
  updatedAt: number;
};
```

O registro do operador deve preservar:

- `best`;
- `games`;
- `ops`;
- `hits`;
- `streak`;
- `rank`;
- `wins`;
- `stats.tabs`;
- `stats.ops`;
- `stats.forms`;
- `studyLog`;
- quaisquer campos futuros desconhecidos.

### Passo 6: extrair a consolidacao para funcoes puras

Manter `bump` como responsabilidade de registrar a resposta na sessao corrente, mas extrair a consolidacao para modulo de dominio testavel:

```text
recordAnswer(session, question, hit, localDate)
mergeSessionIntoPlayer(player, session)
appendMatch(history, match)
```

Regras de `recordAnswer`:

1. incrementar `h` ou `m` em `stats.tabs` para todos os fatores;
2. incrementar `stats.ops` para multiplicacao ou divisao;
3. incrementar `stats.forms` para direto ou inverso;
4. atualizar o dia local em `session.daily`;
5. incrementar `total`, `hits` ou `misses`;
6. atualizar `types`;
7. atualizar `tables` para cada fator;
8. atualizar `updatedAt`.

Usar `localDay` e nao converter a data para UTC, conforme `docs/estrutura-acompanhamento.md`.

### Passo 7: implementar merge nao destrutivo

Ao salvar um operador:

1. ler o registro persistido atual;
2. migrar o registro se for legado;
3. fazer spread do operador existente;
4. fazer merge especifico de `best`, `stats` e `studyLog`;
5. somar os contadores da sessao;
6. preservar campos desconhecidos;
7. gravar o envelope v1 somente depois da leitura valida.

O merge de `studyLog` deve usar `mergeStudyLog`, mantendo dias anteriores e somando somente o dia/registro da sessao atual.

O merge nao pode substituir o mapa inteiro por um objeto parcial nem zerar estatisticas antigas.

### Passo 8: integrar o adapter no App

Substituir os quatro acessos diretos de `window.storage` em `App.tsx`:

- carregamento de `operadores`;
- carregamento de `partidas`;
- escrita de `operadores`;
- escrita de `partidas`.

O fluxo deve ficar conceitualmente assim:

```text
App -> StorageAdapter.read('operadores')
App -> StorageAdapter.read('partidas')
App -> StorageAdapter.merge/write('operadores', envelope)
App -> StorageAdapter.write('partidas', envelope)
```

Nao permitir que componentes React conhecam detalhes de `window.storage`.

Manter as regras atuais:

- `pause` nao chama `saveResult`;
- `win`, `lose` e `quit` chamam `saveResult` uma unica vez;
- `saved.current` continua impedindo duplicacao;
- falha de persistencia atualiza `storeErr`/estado de saude.

### Passo 9: tratar operador e historico inicial

No carregamento:

1. ler `operadores` pelo adapter;
2. migrar dados legados;
3. usar o operador `LOCAL` apenas como estado inicial quando nao existir nenhum operador;
4. nao sobrescrever dados existentes por causa de uma leitura vazia ou falha;
5. carregar `partidas` separadamente;
6. exibir erro de storage quando a indisponibilidade impedir persistencia.

O operador inicial em memoria nao deve ser apresentado como salvo se a escrita falhar.

### Passo 10: decidir explicitamente sobre partidas interrompidas

Aplicar a regra atual: o registro permanente e consolidado no encerramento da partida.

Nao implementar salvamento por resposta, `beforeunload` ou checkpoint nesta entrega. Se o produto exigir recuperacao de uma partida fechada, criar antes uma nova story contendo:

- chave para sessao ativa;
- politica de expiracao;
- recuperacao ou descarte;
- risco de gravar respostas parciais;
- testes de reload e crash.

### Passo 11: adicionar testes

Criar testes unitarios para:

1. leitura de envelope v1;
2. leitura de registro legado sem versao;
3. migracao preservando campos desconhecidos;
4. escrita e leitura round-trip;
5. merge aditivo de `studyLog`;
6. merge de `stats.tabs`, `stats.ops` e `stats.forms`;
7. `window.storage` ausente;
8. JSON corrompido;
9. falha de escrita;
10. bloqueio de escrita apos falha de leitura;
11. `saveResult` gravando apenas uma vez;
12. pausa nao gravando resultado;
13. ranking e analise lendo dados depois de recarregar.

Criar pelo menos um teste de integracao real:

```text
fixture legada -> adapter.read -> migracao -> saveResult -> adapter.write -> novo adapter.read -> dados preservados
```

Nao limitar os testes a regex sobre o codigo-fonte.

### Passo 12: executar verificacoes e atualizar a story

Executar:

```text
npm run lint
npm run typecheck
npm test -- --run
npm run build
git diff --check
```

Tambem executar buscas de invariantes:

```text
rg -n "window\.storage" src/App.tsx
rg -n "window\.localStorage|window\.sessionStorage" src
rg -n "class StorageAdapter|interface IStorageAdapter" src
```

Resultados esperados:

- zero acesso direto a `window.storage` em `App.tsx`;
- zero `localStorage`/`sessionStorage` em producao;
- uma implementacao canonica de adapter;
- suite completa verde.

Atualizar somente as secoes de trabalho permitidas da Story 2.1:

- Tasks/Subtasks;
- File List;
- Dev Agent Record;
- Debug Log References;
- Completion Notes;
- Change Log;
- Status conforme o workflow.

Nao marcar QA como concluido sem veredito de @qa.

## Criterios finais de aceite

- O desempenho e gravado no host `window.storage`, sem banco de dados.
- O modelo de `docs/estrutura-acompanhamento.md` e preservado.
- Dados legados continuam legiveis.
- Campos desconhecidos nao sao apagados.
- O calendario e a analise exibem dados apos recarregar a aplicacao.
- Ranking e historico continuam isolados por operador.
- Pausar nao cria uma partida finalizada nem altera os dados persistidos.
- Falhas de armazenamento sao visiveis e nao causam sobrescrita silenciosa.
- Nao existe uso de `localStorage`/`sessionStorage` em producao.
- Os gates de lint, typecheck, testes e build passam.

## Fora de escopo

- banco de dados SQL ou NoSQL;
- API de backend ou sincronizacao em nuvem;
- login remoto;
- checkpoint automatico de partida em andamento;
- alteracao das regras de pontuacao;
- alteracao do layout da analise;
- novas metricas nao previstas em `docs/estrutura-acompanhamento.md`.

## Entregaveis esperados

1. Um adapter canonico integrado ao `App`.
2. Funcoes de migracao e merge testaveis.
3. Testes unitarios e de integracao do armazenamento.
4. Documentacao do contrato e do schema v1.
5. Story 2.1 atualizada com evidencias e lista de arquivos.
