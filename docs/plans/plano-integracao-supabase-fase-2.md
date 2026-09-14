# Plano de implementação — Integração Supabase e repositório de domínio

**Destinatário:** `@aiox-master` (execução e orquestração)
**Escopo:** resolver a pendência da integração completa entre o Nuclear Challenge e o schema Supabase já versionado.
**Status:** plano de execução
**Pré-condições:** `supabase test db` 19/19; `supabase db lint` sem erros; policies owner-only aprovadas.

## 1. Problema a resolver

O aplicativo ainda usa `storageAdapter` para ler e escrever os blobs globais `operadores` e `partidas`. O schema Supabase, porém, separa perfis, progresso, métricas, dias, erros, sessões e respostas. A integração não pode serializar os blobs diretamente em uma tabela nem usar `service_role` no bundle.

O resultado esperado é um repositório de domínio que preserve as regras pedagógicas existentes e use o Supabase como fonte única de verdade após o cutover:

- usuário autenticado acessa apenas seus operadores;
- `display_label` é apelido não identificável;
- sessão é criada antes da primeira questão;
- pausa e snapshot são persistidos;
- cada resposta é um evento imutável;
- conclusão atualiza sessão, progresso, métricas, estudo e erros atomicamente;
- histórico novo é completo, sem limite automático de 40 itens;
- falhas de leitura/escrita permanecem observáveis e não sobrescrevem dados.

## 2. Artefatos de referência obrigatórios

- `docs/plans/plano-supabase-banco-de-dados.md`
- `docs/STORAGE-ADAPTER.md`
- `docs/estrutura-acompanhamento.md`
- `src/domain/storage/StorageAdapter.ts`
- `src/domain/core/Performance.ts`
- `src/App.tsx`
- `supabase/migrations/20260912000000_initial_schema.sql`
- `supabase/migrations/20260912000001_atomic_game_operations.sql`
- `supabase/migrations/20260912000002_owner_rls_policies.sql`
- `supabase/tests/schema.sql`

## 3. Sequência de execução

### Etapa A — Preparação e segurança

- Confirmar que `@supabase/supabase-js` está em `package.json` e lockfile.
- Criar `src/vite-env.d.ts` ou equivalente para declarar somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Criar o cliente em módulo único, usando `createClient` apenas com URL e chave publicável.
- Falhar de forma explícita quando as variáveis públicas não existirem; não criar fallback persistente local.
- Garantir por busca e build que não há referência a `SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE_KEY`, `SECRET_KEY` ou JWT privilegiado em `src/`, `public/` e `dist/`.
- Remover credenciais reais de arquivos de ambiente usados pelo frontend; manter `.env.example` apenas com placeholders.

### Etapa B — Contrato de domínio

Criar tipos e comandos internos para evitar que componentes React conheçam tabelas:

- `OperatorRepository`: listar/criar/selecionar/excluir operador e carregar agregado.
- `GameSessionRepository`: criar, carregar, pausar, atualizar snapshot e finalizar sessão.
- `recordAnswer`: registrar uma resposta com sequência, questão normalizada, correção e estado posterior.
- `PerformanceRepository`: aplicar alterações de progresso, métricas, estudo e erros.
- `loadOperatorView`: reconstruir o formato de leitura necessário para ranking/análise/calendário.

O contrato deve preservar a semântica de saúde (`healthy`, `degraded`, `unavailable`) e distinguir:

- ausência legítima de dados;
- sessão expirada/não autenticada;
- falha de rede/API;
- violação de RLS/constraint;
- conflito de sequência ou sessão não retomável.

### Etapa C — Operações transacionais no banco

Adicionar migrations somente quando uma operação não puder ser garantida por uma única chamada segura:

- RPC para criação/retomada de sessão pertencente ao usuário;
- RPC para registrar resposta, atualizar snapshot e aplicar agregados relacionados em uma transação;
- RPC para pausar sessão e salvar snapshot;
- RPC para finalizar a sessão com `win`, `lose` ou `quit`;
- procedimento de exclusão transacional do operador, respeitando cascata e auditoria exigida.

As RPCs devem validar `auth.uid()`, operador pertencente ao usuário, status permitido, sequência monotônica e consistência entre `session_id`/`operator_id`. Não aceitar SQL dinâmico com entrada do usuário. Não expor funções administrativas ao papel `authenticated`.

### Etapa D — Implementação do repositório Supabase

- Substituir o adapter provisório por implementação real baseada nas tabelas/RPCs.
- Nunca mapear `operadores` ou `partidas` como blobs no Supabase.
- Usar consultas com colunas explícitas, filtros por operador e paginação quando aplicável.
- Usar `operator_profiles.id` como identidade interna; nunca usar nome/apelido em FK.
- Reconstruir a visão de ranking/análise a partir das tabelas normalizadas, mantendo os mesmos valores pedagógicos.
- Fazer cache somente em memória; não usar `localStorage`, `sessionStorage`, IndexedDB ou `window.storage` como fallback após cutover.
- Manter erros visíveis pela UI e bloquear escrita após falha de leitura quando houver risco de sobrescrita.

### Etapa E — Autenticação e bootstrap do usuário

- Implementar sessão Auth antes de acessar tabelas protegidas.
- Criar fluxo de estado `loading`, `authenticated` e `unauthenticated`.
- Criar perfil com `auth_user_id = auth.uid()` e apelido validado de 1–14 caracteres.
- Não permitir que o cliente escolha outro `auth_user_id`.
- Tratar logout, sessão expirada e troca de usuário limpando apenas estado em memória.

### Etapa F — Integração do fluxo de jogo

Alterar o fluxo na ordem funcional definida pela emenda do plano:

1. autenticar;
2. carregar/criar operador;
3. criar `game_sessions` antes da primeira questão;
4. registrar cada resposta por `recordAnswer`;
5. persistir snapshot nas transições relevantes;
6. persistir `paused` ao pausar;
7. recarregar e retomar a mesma sessão;
8. finalizar a sessão existente ao vencer, perder ou sair;
9. atualizar telas de análise/ranking a partir do repositório.

Remover gradualmente as chamadas diretas a `storageAdapter.read/write` para dados funcionais. `window.storage` só poderá existir em testes legados isolados até o cutover aprovado; depois deve ser eliminado do caminho de produção.

### Etapa G — Migração assistida do legado

- Manter `scripts/migrate-legacy.mjs` como dry-run sem PII.
- Adicionar modo de conversão apenas para snapshot anonimizado fornecido explicitamente.
- Gerar UUID determinístico por lote e manter mapa nome→UUID somente em memória/armazenamento administrativo protegido.
- Preservar agregados mapeáveis e registrar campos desconhecidos em relatório.
- Não fabricar `game_sessions` em andamento, snapshots ou `game_answer_events`: o legado não os possui.
- Inserir dados idempotentemente com lote/auditoria e reconciliar contagens antes de qualquer cutover.
- Bloquear migração se houver nome ambíguo, operador sem ID, sessão órfã ou divergência de totais.

### Etapa H — Cutover e limpeza

- Executar dry-run e testes de integração com fixture anonimizada.
- Aprovar reconciliação antes de dados reais.
- Ativar o repositório Supabase como fonte única de verdade.
- Desabilitar o host persistente legado no caminho de produção.
- Remover variáveis/código de transição após janela de estabilidade documentada.
- Não executar `supabase db push` em projeto remoto sem credenciais e autorização explícitas.

## 4. Testes obrigatórios

### Banco

```powershell
supabase db reset --local --yes
supabase test db
supabase db lint
```

Adicionar casos SQL para:

- usuário A não ler/escrever dados do usuário B;
- operador sem proprietário não ser acessível pelo cliente;
- resposta imutável;
- sequência duplicada rejeitada;
- resposta de operador diferente da sessão rejeitada;
- pausa e snapshot persistidos;
- exclusão em cascata isolada;
- auditoria inacessível a `authenticated`.

### Aplicação

- autenticação e bootstrap de operador;
- save/reload;
- criação de sessão antes da questão;
- resposta individual preservada;
- pausa → reload → retomada;
- win/lose/quit finalizando a mesma sessão;
- ranking/análise/calendário reconstruídos;
- falha de rede não sobrescreve dados;
- ausência de qualquer escrita persistente no navegador após cutover;
- bundle sem `service_role`/segredos.

## 5. Critérios de aceite

- [ ] Nenhum componente funcional depende de blob global para persistência Supabase.
- [ ] Todas as escritas usam o usuário autenticado e passam por RLS/RPC.
- [ ] O fluxo sessão → resposta → pausa → reload → retomada → encerramento funciona.
- [ ] Cada resposta nova é armazenada uma única vez e permanece imutável.
- [ ] Progresso, métricas, estudo, erros, snapshot e sessão são consistentes após falha/retry.
- [ ] Operadores de usuários diferentes permanecem isolados.
- [ ] `window.storage`, `localStorage` e `sessionStorage` não são fontes persistentes após cutover.
- [ ] Nenhum segredo privilegiado aparece no código, build ou artefato público.
- [ ] Migração legada não fabrica respostas/snapshots ausentes e produz relatório de exceções.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `supabase test db` e `supabase db lint` passam.
- [ ] Story de implementação e File List são atualizadas pelo agente responsável.

## 6. Riscos e limites

- Não liberar ranking compartilhado sem nova decisão de produto.
- Não adicionar turma, professor, organização, Realtime ou telemetria por resposta.
- Não migrar dados reais neste plano sem snapshot protegido, autorização e reconciliação.
- Não usar `service_role` no navegador, em `VITE_*`, no repositório ou no bundle.
- Não considerar o seed sintético como dado de produção.
- Se a stack local auxiliar permanecer instável, validar o banco isoladamente e registrar o diagnóstico; isso não autoriza ignorar testes de integração.

## 7. Handoff para `@aiox-master`

Orquestrar as etapas na ordem A→H, delegando banco a `@data-engineer`, código a `@dev`, testes/veredicto a `@qa` e operações remotas a `@devops`. O workflow deve parar com status bloqueado se faltar story aprovada, ambiente/Auth configurado, fixture anonimizada ou qualquer gate obrigatório.
