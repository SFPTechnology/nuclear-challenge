begin;

create extension if not exists pgtap;

select plan(30);

select has_table('public', 'operator_profiles', 'operator_profiles exists');
select has_table('public', 'operator_progress', 'operator_progress exists');
select has_table('public', 'operator_metric_counters', 'operator_metric_counters exists');
select has_table('public', 'operator_study_days', 'operator_study_days exists');
select has_table('public', 'operator_study_day_metrics', 'operator_study_day_metrics exists');
select has_table('public', 'operator_mistakes', 'operator_mistakes exists');
select has_table('public', 'game_sessions', 'game_sessions exists');
select has_table('public', 'game_answer_events', 'game_answer_events exists');
select has_table('public', 'legacy_migration_audit', 'legacy_migration_audit exists');

select col_is_pk('public', 'operator_profiles', 'id', 'operator_profiles.id is the primary key');
select col_is_pk('public', 'operator_progress', 'operator_id', 'operator_progress.operator_id is the primary key');
select col_is_pk('public', 'game_sessions', 'id', 'game_sessions.id is the primary key');

select fk_ok(
  'public', 'operator_progress', 'operator_id',
  'public', 'operator_profiles', 'id',
  'operator_progress references operator_profiles'
);
select fk_ok(
  'public', 'game_sessions', 'operator_id',
  'public', 'operator_profiles', 'id',
  'game_sessions references operator_profiles'
);
select fk_ok(
  'public', 'game_answer_events', 'session_id',
  'public', 'game_sessions', 'id',
  'game_answer_events references game_sessions'
);

select ok((select relrowsecurity from pg_class where oid = 'public.operator_profiles'::regclass), 'operator_profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.game_sessions'::regclass), 'game_sessions has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.game_answer_events'::regclass), 'game_answer_events has RLS enabled');
select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'legacy_migration_audit'
  ),
  'migration audit has no client policy before D1-D2 approval'
);

select has_function('public', 'create_operator', array['text'], 'operator bootstrap RPC exists');
select has_function('public', 'start_game_session', array['uuid', 'smallint', 'jsonb'], 'session start RPC exists');
select has_function('public', 'save_game_snapshot', array['uuid', 'jsonb', 'boolean'], 'snapshot RPC exists');
select has_function('public', 'record_game_answer', array['uuid', 'uuid', 'integer', 'jsonb', 'boolean', 'jsonb'], 'answer event RPC exists');
select has_function('public', 'finish_game_session', array['uuid', 'game_session_status', 'integer', 'numeric', 'integer', 'integer', 'jsonb', 'jsonb'], 'finish RPC exists');
select has_function('public', 'delete_operator', array['uuid'], 'operator delete RPC exists');
select has_function('public', 'nonnegative_json_int', array['jsonb', 'text'], 'safe JSON counter parser exists');
select has_function('public', 'persist_metric_counters', array['uuid', 'metric_dimension_kind', 'jsonb'], 'metric persistence helper exists');
select has_function('public', 'persist_study_days', array['uuid', 'jsonb'], 'study day persistence helper exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='operator_profiles' and policyname='operator_profiles_owner_select'), 'operator profile select is owner-only');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='game_answer_events' and policyname='game_answer_events_owner_select'), 'answer event select is owner-only');

select * from finish();
rollback;
