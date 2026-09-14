# Plano de implementação do banco Supabase — Nuclear Challenge

**Status:** Proposta para implementação pelo `@data-engineer` — não executada  
**Data:** 2026-09-12  
**Escopo:** Persistência relacional, migração dos dados existentes e segurança de acesso.  
**Fora do escopo:** Criação de projeto Supabase, migrations SQL, instalação de SDK, alterações de frontend, autenticação de usuários, CI/CD e qualquer alteração de dados de produção.

## 1. Objetivo e conclusão da análise

O Nuclear Challenge é um simulador educacional React que hoje persiste dados no serviço assíncrono `window.storage`. Há dois documentos JSON globais:

- `operadores`: objeto indexado pelo nome visível do operador;
- `partidas`: lista resumida de partidas encerradas.

O objetivo da futura implementação é substituir esses blobs por um modelo PostgreSQL/Supabase com integridade referencial, migração reversível e controle de acesso por linha, sem alterar as regras pedagógicas atuais. O desenho deve ainda preparar a migração de chave primária por nome para identificador pseudonimizado, já exigida pela Story 3.2 (`TD-DAT-04`).

O banco **não deve** ser usado para guardar estado transitório da partida. Respostas continuam acumuladas em memória e somente uma partida encerrada (`win`, `lose` ou `quit`) é persistida; `pause` não cria registro. Esse é o contrato funcional atual documentado em `docs/STORAGE-ADAPTER.md` e `docs/estrutura-acompanhamento.md`.

## 2. Evidências e estado atual (brownfield)

| Área | Estado observado | Fonte |
|---|---|---|
| Aplicação | React 19 + TypeScript + Vite; não há SDK Supabase instalado nem chamadas de rede no código da aplicação. | `package.json`, `src/App.tsx` |
| Persistência | `StorageAdapter` canônico usa `window.storage`, envelope `{ schemaVersion: 1, updatedAt, data }`, saúde `healthy \| degraded \| unavailable`. | `src/domain/storage/StorageAdapter.ts`, `docs/STORAGE-ADAPTER.md` |
| Operador | A chave atual é o nome digitado, limitado a 14 caracteres; o nome é exibido no login, ranking, gráficos e análise. | `src/App.tsx`, `src/components/LoginPanel.tsx`, `src/components/RankingPanel.tsx` |
| Agregados | Cada operador acumula melhores resultados, contadores, estatísticas por tabuada/operação/formato, erros por expressão e `studyLog` diário. | `src/domain/core/Performance.ts`, `docs/estrutura-acompanhamento.md` |
| Partidas | Cada encerramento cria `{ n, d, pts, acc, streak, secs, out, ts }`; a lista atual é ordenada por pontos e limitada a 40 itens. | `src/App.tsx:242-250` |
| Privacidade | Há dado educacional de menores em potencial. A chave primária baseada em nome é dívida ativa; exclusão de operador já existe no fluxo local. | `docs/stories/story-3.2-pseudonimizacao-refluxo-higiene-final.md`, `docs/stories/story-2.2-nc003-piloto-exclusao-operador.md` |

### Regras de negócio que o banco deve preservar

1. Um operador é isolado dos demais: salvar uma partida atualiza somente seu histórico e agregados.
2. Agregados são aditivos: campos legados/desconhecidos não podem ser apagados durante a migração.
3. `best[diff]`, `rank` e `streak` são monotônicos conforme o contrato de domínio atual.
4. `studyLog` usa data **local** `YYYY-MM-DD`; mês é zero-based apenas no payload legado JavaScript, não no banco.
5. Estatísticas distinguem multiplicação/divisão e formatos direto/inverso.
6. Exclusão de operador deve remover os dados do operador sem afetar outros operadores.
7. O histórico legado disponível contém no máximo 40 partidas, ordenadas por pontuação; não se deve alegar que ele é um log cronológico completo.

## 3. Decisões obrigatórias antes de qualquer implementação

Estas decisões não estão nos artefatos atuais. Implementá-las sem validação violaria o princípio de não inventar requisitos.

| ID | Decisão necessária | Opções que precisam de decisão de produto/arquitetura | Impacto bloqueado |
|---|---|---|---|
| D1 | Dono dos dados e modelo de acesso | (a) dispositivo individual autenticado anonimamente; (b) responsável/professor autenticado; (c) conta institucional/turma. | RLS, Auth, ranking e migração. |
| D2 | Escopo do ranking remoto | Privado ao dono, compartilhado em um grupo autorizado, ou removido do acesso remoto inicial. | Políticas `SELECT` de operadores e partidas. |
| D3 | Identidade de menores | Definir se o rótulo exibido é apelido não identificável ou dado pessoal; definir responsável pelo reidentificador. | Colunas de perfil, retenção, exclusão e aviso de privacidade. |
| D4 | Retenção de partidas | Preservar a regra atual de no máximo 40 partidas por operador ou autorizar histórico longitudinal completo. | Job/trigger de retenção, custo e relatórios NC-002. |
| D5 | Estratégia de adoção | Migração única assistida, período de dupla escrita, ou somente novos dados no Supabase. | Plano de cutover e rollback. |
| D6 | Regra de fase/dificuldade | Confirmar se o registro de fase por operação é necessário agora para NC-003 ou ficará para story específica. | Granularidade de eventos; não antecipar telemetria. |

**Recomendação de sequência:** decidir D1–D3 em workshop com `@pm`, `@architect`, responsável pelo produto e, se aplicável, encarregado de dados; D4–D6 entram na story de implementação aprovada por `@po`. Nenhuma chave `service_role` pode ser exposta ao bundle web.

## 4. Arquitetura de dados proposta

### 4.1 Limites de responsabilidade

```text
React/UI
  -> repositório de persistência (contrato equivalente ao StorageAdapter)
  -> Supabase Data API / funções RPC transacionais quando necessário
  -> PostgreSQL + RLS

Auth (decisão D1) -> JWT -> RLS em todas as tabelas expostas
```

O repositório futuro deve manter o estado de saúde e o comportamento de erro visível hoje providos pelo `StorageAdapter`; trocar `window.storage` por Supabase não autoriza falha silenciosa nem sobrescrita após falha de leitura.

### 4.2 Entidades e relacionamento lógico

```text
auth.users (Supabase Auth; conforme D1)
  └── operator_profiles (1:N somente se o modelo permitir vários operadores por dono)
        ├── operator_progress (1:1)
        ├── operator_metric_counters (1:N)
        ├── operator_study_days (1:N)
        ├── operator_mistakes (1:N)
        └── game_sessions (1:N)
```

Não incluir `turmas`, professores, responsáveis, organizações, Realtime ou dados por resposta nesta primeira migration. O código usa o termo `turma` em um hook, mas não há entidade ou requisito de produto que defina sua semântica. Essas entidades só devem ser adicionadas após D1/D2 e uma story rastreável.

### 4.3 Dicionário de tabelas proposto

| Tabela | Chave e colunas essenciais | Finalidade / restrições |
|---|---|---|
| `operator_profiles` | `id uuid PK`; `auth_user_id uuid` (FK para `auth.users`, nulidade definida por D1); `display_label text`; `created_at`, `updated_at`, `deleted_at` | Substitui o nome como chave primária. O ID é a referência interna; o rótulo existe para a UI e deve ser minimizado. `display_label` não deve ser usado em FKs nem em políticas. Índice único deve ser definido apenas dentro do escopo de proprietário/grupo decidido em D1/D2 — nunca globalmente por suposição. |
| `operator_progress` | `operator_id uuid PK/FK`; `best_by_difficulty jsonb`; `games`, `operations`, `hits`, `best_streak`, `rank_index`, `wins`; `schema_version`; `updated_at` | Snapshot 1:1 dos agregados compatíveis com a UI atual. Check constraints para contadores não negativos e `hits <= operations`; dificuldade/rank devem respeitar os intervalos atuais depois de formalizados no domínio. `jsonb` permanece somente para o mapa variável `best[diff]`, não para todo o operador. |
| `operator_metric_counters` | `operator_id FK`; `dimension_kind` (`table`, `operation`, `form`); `dimension_key`; `hits`, `misses`; `updated_at`; PK composta `(operator_id, dimension_kind, dimension_key)` | Normaliza `stats.tabs`, `stats.ops` e `stats.forms`. Check: `hits, misses >= 0`. Os valores de `dimension_key` permitidos devem refletir exatamente o domínio existente (`2..15`, multiplicação/divisão, direto/inverso), sem criar categorias novas. |
| `operator_study_days` | `operator_id FK`; `study_date date`; `total`, `hits`, `misses`; `updated_at`; PK `(operator_id, study_date)` | Substitui `studyLog[YYYY-MM-DD]`. Ano/mês/dia/weekday são derivados de `study_date` em consultas; não persistir a representação zero-based do JavaScript. Check: `total = hits + misses` e valores não negativos. |
| `operator_study_day_metrics` | `operator_id`, `study_date` (FK composta); `dimension_kind` (`operation`, `form`, `table`); `dimension_key`; `hits`, `misses`; PK composta incluindo dimensão | Normaliza `studyLog[date].types` e `.tables`; permite reconstruir calendário e prioridades sem JSON aninhado. |
| `operator_mistakes` | `operator_id FK`; `expression` (ou futura chave canônica validada pelo domínio); `errors`, `correct`, `last_seen_at`; PK `(operator_id, expression)` | Migra `stats.mistakes`. Não armazenar resposta digitada nem eventos individuais: o produto atual só conserva a expressão e contadores. |
| `game_sessions` | `id uuid PK`; `operator_id FK`; `difficulty`; `points`; `accuracy`; `best_streak`; `duration_seconds`; `outcome`; `ended_at`; `legacy_timestamp`; `legacy_source_index` | Representa cada item de `partidas`. Checks: dificuldade 1–5, `accuracy` 0–100, duração/score/streak não negativos, `outcome ∈ {win, lose, quit}`. `legacy_source_index` torna a migração idempotente; não é requisito de produto e pode ser removido depois de auditoria aprovada. |
| `legacy_migration_audit` | `id`; `migration_batch_id`; `source_schema_version`; `source_digest`; `counts`; `started_at`, `completed_at`, `status`, `error_summary` | Auditoria técnica da migração, sem guardar o blob completo nem nomes em logs. Acesso apenas administrativo por função segura. |

### 4.4 Índices mínimos a validar com plano de consulta

1. `game_sessions (operator_id, ended_at desc)` para histórico individual e evolução.
2. `game_sessions (operator_id, points desc)` para preservar a seleção legada das 40 melhores.
3. `operator_metric_counters (operator_id, dimension_kind)` para análise por tabuada/operação/formato.
4. `operator_study_days (operator_id, study_date desc)` para calendário mensal.
5. `operator_mistakes (operator_id, errors desc, last_seen_at desc)` para a lista de reforço.

Não criar índices por antecipação. O `@data-engineer` deve conferir os planos com dados sintéticos representativos antes de adicionar outros.

## 5. Mapeamento do legado para o modelo alvo

| Origem atual | Destino | Regra de migração |
|---|---|---|
| Chave `operadores[nome]` | `operator_profiles.id` + `display_label` | Gerar UUID estável por lote; guardar a relação nome→UUID somente no canal de migração protegido e pelo prazo aprovado em D3. Nunca usar o nome como PK novo. |
| `best` | `operator_progress.best_by_difficulty` | Copiar sem recalcular; validar chaves de dificuldade válidas e registrar exceções. |
| `games`, `ops`, `hits`, `streak`, `rank`, `wins` | `operator_progress` | Mapear para nomes explícitos; verificar contadores e invariantes antes do commit. |
| `stats.tabs`, `stats.ops`, `stats.forms` | `operator_metric_counters` | Expandir cada par `{ h, m }` em uma linha, preservando totais. |
| `stats.mistakes` | `operator_mistakes` | Mapear `errors`, `correct`, `lastSeen`; `lastSeen` vira timestamp. |
| `studyLog[date]` | `operator_study_days` + `operator_study_day_metrics` | Converter a chave local para `date`; reconstruir totais e métricas. Validar que data/contadores batem. |
| `partidas[]` (`n`, `d`, `pts`, `acc`, `streak`, `secs`, `out`, `ts`) | `game_sessions` | Resolver `n` para UUID; preservar `ts` como `legacy_timestamp/ended_at`; manter a ordem e o limite recebido, sem inferir partidas inexistentes. |
| Campos desconhecidos no payload | Inventário de incompatibilidades | Não descartar silenciosamente. Classificar: suportado, preservado em área de compatibilidade temporária, ou bloqueado para decisão. |

## 6. Segurança, privacidade e RLS

### 6.1 Princípios obrigatórios

1. Habilitar RLS em **todas** as tabelas expostas pela Data API e criar políticas explícitas para `SELECT`, `INSERT`, `UPDATE` e `DELETE` antes de liberar o cliente.
2. Aplicar princípio do menor privilégio; `service_role` e chaves secretas ficam somente em ambiente servidor/função segura, nunca em `VITE_*`, código React, repositório ou artefato estático.
3. Usar somente chave publicável no navegador, acompanhada de RLS e JWT válido.
4. Separar acesso operacional do acesso de manutenção/migração. O migrador não pode ser uma tela pública do aplicativo.
5. Garantir exclusão em cascata ou procedimento transacional equivalente para perfil, agregados, dias, métricas, erros e sessões; confirmar a regra de exclusão física versus retenção legal em D3.
6. Não habilitar Realtime nesta fase. Não existe requisito atual de sincronização em tempo real e ele ampliaria superfície de autorização.

As práticas 1–3 seguem a orientação oficial de RLS e proteção de chaves do Supabase: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e [proteção de dados](https://supabase.com/docs/guides/database/secure-data).

### 6.2 Matriz de política a definir após D1/D2

| Recurso | Dono autenticado | Outro cliente | Papel administrativo seguro |
|---|---|---|---|
| Perfil e agregados próprios | leitura/escrita conforme vínculo `auth.uid()` | negado | permitido sob procedimento auditado |
| Métricas, dias, erros e sessões próprios | leitura/escrita conforme vínculo | negado | permitido sob procedimento auditado |
| Ranking | **depende de D2** | **depende de D2** | consulta agregada mínima, se necessária |
| Auditoria de migração | negado | negado | permitido |

Caso D1 escolha login anônimo, registrar a limitação: um usuário anônimo é autenticado, mas perde a conta se sair, limpar dados do navegador ou trocar de dispositivo. Esse modo só é aceitável se o produto aceitar essa propriedade e se políticas distinguirem adequadamente o claim de anonimato. Referência: [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous).

## 7. Plano de implementação por fases

### Fase 0 — Governança e precondições

- Criar/validar story de banco vinculada a este plano; `@po/@sm` define acceptance criteria e dependências.
- Resolver D1–D6 e registrar ADR para D1–D3.
- Confirmar responsável por dados, ambiente alvo (dev/staging/produção), região, retenção e processo de exclusão.
- Inventariar `window.storage` em ambiente representativo, sem copiar dados reais para logs, fixtures públicas ou `seed.sql`.
- Congelar um snapshot de teste anonimizado e um hash/contagem do legado para reconciliação.

**Gate de saída:** decisões aprovadas, origem do dado conhecida, nenhum segredo exposto no frontend e estratégia de rollback acordada.

### Fase 1 — Base Supabase reproduzível

- Inicializar a estrutura local do Supabase e versionar somente configuração não secreta, migrations, testes SQL e seeds sintéticos.
- Adotar migrations SQL como única fonte de verdade do esquema; mudanças manuais remotas devem ser convertidas em migration antes de continuar.
- Criar ambientes separados, no mínimo desenvolvimento e produção; nunca aplicar seed de teste em produção.
- Criar tabelas, constraints, índices mínimos, funções utilitárias estritamente necessárias e RLS na mesma migration.

O fluxo recomendado pelo Supabase é migration versionada, teste local com `supabase db reset` e deploy por `supabase db push`; a documentação alerta que seeds são para desenvolvimento/teste, não produção. Ver [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) e [workflow local](https://supabase.com/docs/guides/local-development/cli-workflows).

**Gate de saída:** `db reset` reproduz o schema local, testes de RLS passam e o schema remoto de desenvolvimento está sincronizado por migrations.

### Fase 2 — Contrato de acesso e integração controlada

- Definir interface de repositório de persistência independente da UI, preservando semântica de leitura, escrita, saúde e erro do `StorageAdapter`.
- Implementar a escolha de Auth aprovada em D1 antes da primeira chamada Data API protegida.
- Implementar operações transacionais/RPC somente onde a consistência exigir atualizar progresso, métricas diárias e sessão em conjunto; não dividir uma conclusão de partida em escritas que possam deixar dados parcialmente consolidados.
- Atualizar UI somente depois de testes de domínio, repositório e integração; manter o texto pt-BR e erro observável já existentes.
- Se D5 definir dupla escrita, estabelecer comparador de dados e regra explícita de precedência. A dupla escrita deve ser temporária, instrumentada e removida por migration/story de cutover.

**Gate de saída:** salvar → recarregar → ler percorre o novo repositório, uma falha não sobrescreve dados, e os testes cobrem operador isolado, pausa sem persistência e exclusão.

### Fase 3 — Migração assistida e reconciliação

1. Executar dry-run apenas contra snapshot anonimizado.
2. Validar formato do envelope legado e calcular contagens/hash de origem.
3. Criar lote de migração, gerar IDs pseudonimizados e inserir em transação ou em unidades idempotentes com chave de origem.
4. Reconciliar, por operador: campos agregados, número de linhas por dimensão, dias de estudo, erros e partidas disponíveis.
5. Executar testes funcionais de ranking, análise, calendário, prioridade, exclusão e recarga.
6. Obter aprovação humana da reconciliação antes do cutover de dados reais.
7. Manter backup protegido e com prazo de expiração aprovado; só então desativar a fonte antiga conforme D5.

**Critério quantitativo mínimo:** zero operadores sem ID resolvido; zero sessões órfãs; igualdade dos totais mapeáveis (`games`, `ops`, `hits`, `wins`, métricas, dias e itens de partidas) entre origem e destino. Qualquer divergência bloqueia o cutover e entra no relatório de exceção.

### Fase 4 — Operação, observabilidade e encerramento

- Monitorar erros de autenticação, negações RLS, falhas de repositório, duração de consultas e divergências durante a janela aprovada.
- Documentar runbook de rollback, restauração, exclusão de operador e rotação de credenciais.
- Remover acessos, códigos e variáveis de transição depois da confirmação do período de estabilidade.
- Revisar a Story 3.2: a migração só satisfaz TD-DAT-04 se a chave por nome tiver sido realmente eliminada de todas as relações e telas que identificam registros internamente.

## 8. Estratégia de testes e critérios de aceite

| Camada | Casos mínimos |
|---|---|
| Migrations | aplicação do zero; upgrade de versão anterior; rollback definido/testado quando aplicável; `db reset` reproduzível. |
| Constraints | valores negativos, acurácia fora de 0–100, dificuldade inválida, FK órfã e duplicidade de métrica/dia rejeitados. |
| RLS | allow/deny para `SELECT`, `INSERT`, `UPDATE`, `DELETE` sob cada papel definido em D1/D2; nenhum acesso cruzado de operador. O Supabase recomenda testes SQL de políticas com `supabase test db`. |
| Migração | envelope v1, payload sem envelope, `studyLog` ausente, `stats` parcial, campos desconhecidos, nomes duplicados/ambíguos e partidas sem operador resolvível. |
| Regressão funcional | save/reload; pausa não persiste; vitória/derrota/quit persistem; ranking; análise por tabuada/operação/formato; calendário e prioridade; exclusão isolada. |
| Segurança | busca que prove ausência de `service_role` no código cliente e artefatos; verificação de RLS habilitado em todas as tabelas expostas. |
| Desempenho | medir planos de consulta dos cinco acessos prioritários com volume sintético acordado; só criar índices adicionais quando a medição justificar. |

Além dos testes de banco, a implementação deve executar os gates do repositório: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. A story deve ter checklist e File List atualizados antes do handoff.

## 9. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| RLS definida antes de escolher dono/grupo | exposição de dados de menores ou bloqueio total do produto | D1/D2 são gates; testar allow/deny por papel. |
| Nome legado ambíguo ou usado como identidade | associação incorreta de histórico | mapa controlado de migração, relatório de exceção e aprovação humana; não deduplicar automaticamente. |
| Perda de granularidade ao migrar blobs | análises e prioridades divergentes | reconciliação por agregados/dia/dimensão, testes com fixture legada. |
| Dados parcialmente gravados no fim da partida | histórico inconsistente | operação transacional/RPC ou outra unidade atômica validada pelo `@data-engineer`. |
| Exposição de chave privilegiada | bypass de RLS e exfiltração | segredo somente em servidor; revisão de variáveis e build. |
| Realtime prematuro | superfície de acesso maior e custo sem requisito | não habilitar nesta fase. |
| Crescimento indefinido de sessões | custo e consultas degradadas | decidir D4 antes de definir retenção; preservar semântica de 40 itens enquanto não houver autorização para expandir. |
| Cutover irreversível | perda de dados | backup protegido, dry-run, lote idempotente, reconciliação e rollback aprovados. |

## 10. Handoff para `@data-engineer`

### Entregáveis esperados da implementação

1. ADRs/decisões D1–D6 vinculadas à story aprovada.
2. Diretório `supabase/` com configuração sem segredo, migrations numeradas, testes SQL/RLS e seed apenas sintético.
3. Documento de modelo físico com tipos PostgreSQL, constraints, FKs, índices e políticas RLS efetivamente criadas.
4. Ferramenta/procedimento de migração assistida, idempotente e sem logar PII.
5. Relatório de dry-run e reconciliação, incluindo exceções e aprovação do cutover.
6. Runbook operacional de backup, rollback, exclusão e incidente de acesso.
7. Atualização da story e File List; evidências dos quality gates do projeto e dos testes Supabase.

### Fora de autorização deste plano

- Não criar contas/projetos Supabase nem configurar credenciais.
- Não migrar dados reais.
- Não decidir modelo de identidade, turma, ranking compartilhado ou retenção sem os responsáveis de produto/arquitetura.
- Não adicionar tabelas de professor, turma, organização, mensagens, Realtime ou telemetria por resposta sem requisito rastreável.

## 11. Referências do repositório

- `docs/estrutura-acompanhamento.md` — formato pedagógico e política de compatibilidade.
- `docs/STORAGE-ADAPTER.md` — contrato de armazenamento e quando uma partida é persistida.
- `src/App.tsx` — leitura/escrita atuais, criação/exclusão de operador e `saveResult`.
- `src/domain/core/Performance.ts` — consolidação dos agregados.
- `src/domain/storage/StorageAdapter.ts` — envelope, saúde e comportamento em falhas.
- `docs/stories/story-2.1-storage-adapter-dominio.md` — fundação de dados atual.
- `docs/stories/story-2.2-nc003-piloto-exclusao-operador.md` — exclusão de operador.
- `docs/stories/story-3.2-pseudonimizacao-refluxo-higiene-final.md` — pseudonimização prevista.

## 12. Emenda obrigatória — persistência integral no banco

Esta emenda substitui qualquer trecho anterior deste plano que limite a persistência a partidas encerradas, aceite `window.storage` como armazenamento após o cutover, mantenha o teto legado de 40 partidas como regra futura ou descarte respostas individuais.

### Compromisso de fonte única de verdade

Após o cutover aprovado, o Supabase/PostgreSQL deve armazenar todo dado funcional do Nuclear Challenge:

1. perfis e identificadores pseudonimizados dos operadores;
2. progresso e todos os agregados de desempenho;
3. métricas por tabuada, operação, formato, dia e expressão;
4. histórico completo de partidas, sem limite automático de 40 registros;
5. sessão criada antes da primeira questão, inclusive status `in_progress` e `paused`;
6. snapshot versionado do estado funcional necessário para retomar uma sessão;
7. cada resposta, com ordem, dados da questão definidos pelo domínio, correção e horário;
8. auditoria de migração, exclusão e operações administrativas necessárias.

`window.storage`, `localStorage`, `sessionStorage`, caches persistentes do navegador e arquivos locais não podem funcionar como cópia persistente, fallback ou fonte alternativa desses dados após a migração. Só pode permanecer em memória o estado efêmero de apresentação sem valor de negócio, como foco, modal aberto, animação e dimensões transitórias da viewport.

### Complemento ao modelo físico

O `@data-engineer` deve alterar `game_sessions` para representar o ciclo completo da partida, com `status` (`in_progress`, `paused`, `win`, `lose`, `quit`), timestamps de criação/atualização/finalização e `state_snapshot jsonb` versionado. O snapshot deve cobrir apenas estado funcional de retomada — questão e candidatos, progresso, física, cronômetro e campos de domínio necessários — nunca detalhes do DOM.

Deve ser adicionada a tabela `game_answer_events`, com `id uuid PK`, `session_id FK`, `operator_id FK`, `sequence_number`, dados normalizados da questão conforme o contrato de domínio, `is_correct`, `answered_at` e, se exigido para retomada determinística, estado posterior versionado. A combinação `(session_id, sequence_number)` deve ser única. Cada evento deve ser imutável; correções são novos fatos/auditorias, não alteração silenciosa de uma resposta existente.

Índices mínimos adicionais a validar com dados sintéticos: `game_sessions (operator_id, status, updated_at desc)` para recuperação e `game_answer_events (session_id, sequence_number)` para reconstrução ordenada da sessão.

### Alterações obrigatórias nas fases e nos testes

- A Fase 1 deve criar `game_sessions` e `game_answer_events` já na migration inicial, com FKs, constraints e RLS.
- A Fase 2 deve: criar a sessão antes da primeira questão; registrar cada resposta; atualizar o snapshot a cada transição funcional relevante; salvar `paused` na pausa; e finalizar a mesma sessão ao vencer, perder ou encerrar.
- A operação que registra resposta e atualiza agregados, dia de estudo, erros, snapshot e sessão deve ser transacional/RPC quando necessário para impedir estados parcialmente consolidados.
- O gate de integração passa a exigir: criar sessão → responder → pausar → recarregar → retomar → encerrar, usando exclusivamente o repositório Supabase.
- A suíte de regressão deve provar persistência de pausa e de todas as respostas, além de ausência de qualquer escrita persistente no navegador após cutover.
- O legado não contém snapshots ou respostas individuais. A migração deve registrar essa lacuna de forma auditável, sem fabricar eventos; a garantia de dados integrais vale para todos os dados produzidos a partir do início do novo fluxo.

### Retenção

A decisão D4 passa a definir somente o prazo e procedimento de retenção aprovados para sessões e respostas. Até existir política formal, a implementação deve persistir todos os registros novos e não executar limpeza automática. Qualquer retenção futura deve ser implementada no banco, auditada e compatível com a decisão de privacidade D3.

## 13. Change log

### Decisões aprovadas pelo proprietário

- D1: usuários autenticados; cada usuário é proprietário dos operadores vinculados ao próprio `auth.uid()`.
- D2: ranking remoto privado nesta fase.
- D3: `display_label` é apenas apelido não identificável; o UUID interno é a identidade persistida.
- D4: sem retenção automática até política formal.
- D5: adoção assistida, com dry-run, reconciliação e aprovação humana antes do cutover.
- D6: fase por operação fica fora desta migration.

A migration `20260912000002_owner_rls_policies.sql` implementa a política owner-only. Não há acesso público nem exposição de `service_role`.

| Data | Autor | Alteração |
|---|---|---|
| 2026-09-12 | @analyst (Atlas) | Análise brownfield e plano de implementação Supabase criado; nenhuma implementação ou alteração de dados realizada. |
| 2026-09-12 | @analyst (Atlas) | Emenda: Supabase definido como fonte única de verdade para todos os dados funcionais, incluindo sessões em andamento, snapshots de retomada e respostas individuais. |
