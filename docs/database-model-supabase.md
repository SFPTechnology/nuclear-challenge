# Modelo físico Supabase

A migration inicial em `supabase/migrations/20260912000000_initial_schema.sql` é a fonte de verdade do schema. Ela cobre perfis pseudonimizados, agregados, métricas normalizadas, dias de estudo, erros, ciclo completo de sessões e eventos imutáveis de respostas.

D1–D6 continuam pendentes no plano. RLS está habilitado em todas as tabelas e o acesso permanece deny-by-default até a decisão de identidade/propriedade. A auditoria é administrativa e não deve ser exposta pela Data API.

O seed contém somente dados sintéticos. Não há retenção automática, Realtime, credenciais, projeto remoto ou migração de dados reais.

Com Supabase CLI instalado e o projeto vinculado, validar remotamente com `supabase migration list --linked` e `supabase db lint --linked`. Esses comandos não exigem Docker Desktop. `supabase start`, `supabase db reset` e `supabase test db` são opcionais para uma instância local isolada. A migration não contém comandos destrutivos; qualquer alteração futura no schema remoto requer snapshot/backup aprovado antes de `supabase db push`.
