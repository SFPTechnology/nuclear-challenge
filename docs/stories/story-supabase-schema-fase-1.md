# Story — Schema Supabase Fase 1

## Status

Schema, policies owner-only e RPCs de sessão publicados no Supabase remoto. A integração cliente usa apenas URL/chave pública; a validação de fluxo completo permanece coberta por testes de aplicação.

## Checklist

- [x] Configuração local sem segredos
- [x] Migration inicial versionada
- [x] Constraints, FKs e índices mínimos
- [x] Sessões integrais, snapshots e respostas individuais
- [x] RLS habilitado em todas as tabelas
- [x] Seed sintético idempotente
- [x] Testes SQL de estrutura preparados
- [x] RPC transacional para registrar resposta e snapshot
- [x] Eventos de resposta imutáveis e vinculados ao operador da sessão
- [x] Dry-run legado sem PII e relatório de incompatibilidades
- [x] Runbook de validação, cutover e rollback
- [x] Aprovar D1–D6
- [x] Criar policies de acesso do cliente após aprovação
- [x] Implementar RPCs de criar/retomar/pausar/responder/finalizar/excluir
- [x] Persistir e reidratar contadores, erros e histórico de estudo normalizados
- [x] Validar o schema remoto sem Docker: `supabase migration list --linked` confirma as seis migrations sincronizadas e `supabase db lint --linked` não encontrou erros.

## File List

- `supabase/config.toml`
- `supabase/migrations/20260912000000_initial_schema.sql`
- `supabase/seed.sql`
- `supabase/tests/schema.sql`
- `docs/database-model-supabase.md`
- `supabase/migrations/20260912000001_atomic_game_operations.sql`
- `supabase/migrations/20260912000002_owner_rls_policies.sql`
- `supabase/migrations/20260913000000_game_domain_rpcs.sql`
- `supabase/migrations/20260913000001_persist_study_metrics.sql`
- `supabase/migrations/20260913000002_fix_study_day_metric_persistence.sql`
- `supabase/snapshots/20260913_pre_persist_study_metrics_finish_game_session.sql`
- `src/domain/supabase/GameRepository.ts`
- `src/__tests__/game-repository-hydration.test.ts`
- `scripts/migrate-legacy.mjs`
- `docs/runbook-supabase.md`

## Validação remota sem Docker - 2026-09-13

- As migrations `20260912000000` a `20260913000002` estão versionadas no repositório e aplicadas no projeto remoto vinculado.
- `supabase migration list --linked` confirmou paridade entre as seis migrations locais e remotas.
- `supabase db lint --linked` concluiu com `No schema errors found`. O CLI emitiu apenas um timeout posterior de telemetria PostHog.
- A stack local, `supabase db reset` e `supabase test db` permanecem opcionais para desenvolvimento isolado; não bloqueiam o uso, a autenticação ou o acesso da aplicação ao Supabase remoto.
