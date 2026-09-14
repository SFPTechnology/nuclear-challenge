create extension if not exists pgcrypto;

create type public.game_session_status as enum ('in_progress', 'paused', 'win', 'lose', 'quit');
create type public.metric_dimension_kind as enum ('table', 'operation', 'form');

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

create table public.operator_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  display_label text not null check (length(trim(display_label)) between 1 and 14),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.operator_progress (
  operator_id uuid primary key references public.operator_profiles(id) on delete cascade,
  best_by_difficulty jsonb not null default '{}'::jsonb,
  games integer not null default 0 check (games >= 0),
  operations integer not null default 0 check (operations >= 0),
  hits integer not null default 0 check (hits >= 0 and hits <= operations),
  best_streak integer not null default 0 check (best_streak >= 0),
  rank_index integer not null default 0 check (rank_index >= 0),
  wins integer not null default 0 check (wins >= 0 and wins <= games),
  schema_version integer not null default 1 check (schema_version > 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.operator_metric_counters (
  operator_id uuid not null references public.operator_profiles(id) on delete cascade,
  dimension_kind public.metric_dimension_kind not null,
  dimension_key text not null check (length(trim(dimension_key)) > 0),
  hits integer not null default 0 check (hits >= 0), misses integer not null default 0 check (misses >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (operator_id, dimension_kind, dimension_key)
);

create table public.operator_study_days (
  operator_id uuid not null references public.operator_profiles(id) on delete cascade,
  study_date date not null, total integer not null default 0 check (total >= 0),
  hits integer not null default 0 check (hits >= 0), misses integer not null default 0 check (misses >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (operator_id, study_date), check (total = hits + misses)
);

create table public.operator_study_day_metrics (
  operator_id uuid not null, study_date date not null,
  dimension_kind public.metric_dimension_kind not null, dimension_key text not null check (length(trim(dimension_key)) > 0),
  hits integer not null default 0 check (hits >= 0), misses integer not null default 0 check (misses >= 0),
  primary key (operator_id, study_date, dimension_kind, dimension_key),
  foreign key (operator_id, study_date) references public.operator_study_days(operator_id, study_date) on delete cascade
);

create table public.operator_mistakes (
  operator_id uuid not null references public.operator_profiles(id) on delete cascade,
  expression text not null check (length(trim(expression)) > 0), errors integer not null default 0 check (errors >= 0),
  correct integer not null default 0 check (correct >= 0), last_seen_at timestamptz,
  primary key (operator_id, expression)
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(), operator_id uuid not null references public.operator_profiles(id) on delete cascade,
  difficulty smallint not null check (difficulty between 1 and 5), status public.game_session_status not null default 'in_progress',
  points integer not null default 0 check (points >= 0), accuracy numeric(5,2) check (accuracy between 0 and 100),
  best_streak integer not null default 0 check (best_streak >= 0), duration_seconds integer not null default 0 check (duration_seconds >= 0),
  state_snapshot jsonb, snapshot_version integer check (snapshot_version is null or snapshot_version > 0),
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz, legacy_timestamp timestamptz, legacy_source_index integer check (legacy_source_index is null or legacy_source_index >= 0)
);

create table public.game_answer_events (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.game_sessions(id) on delete cascade,
  operator_id uuid not null references public.operator_profiles(id) on delete cascade, sequence_number integer not null check (sequence_number >= 0),
  question_data jsonb not null, is_correct boolean not null, answered_at timestamptz not null default timezone('utc', now()), resulting_state jsonb,
  unique (session_id, sequence_number)
);

create table public.legacy_migration_audit (
  id uuid primary key default gen_random_uuid(), migration_batch_id uuid not null, source_schema_version integer, source_digest text,
  counts jsonb not null default '{}'::jsonb, started_at timestamptz not null default timezone('utc', now()), completed_at timestamptz,
  status text not null check (status in ('started', 'completed', 'failed')), error_summary text
);

create index game_sessions_operator_ended_idx on public.game_sessions (operator_id, ended_at desc);
create index game_sessions_operator_points_idx on public.game_sessions (operator_id, points desc);
create index game_sessions_operator_status_updated_idx on public.game_sessions (operator_id, status, updated_at desc);
create index metric_counters_operator_dimension_idx on public.operator_metric_counters (operator_id, dimension_kind);
create index study_days_operator_date_idx on public.operator_study_days (operator_id, study_date desc);
create index mistakes_operator_errors_idx on public.operator_mistakes (operator_id, errors desc, last_seen_at desc);
create index answer_events_session_sequence_idx on public.game_answer_events (session_id, sequence_number);

create trigger operator_profiles_updated_at before update on public.operator_profiles for each row execute function public.set_updated_at();
create trigger game_sessions_updated_at before update on public.game_sessions for each row execute function public.set_updated_at();

alter table public.operator_profiles enable row level security;
alter table public.operator_progress enable row level security;
alter table public.operator_metric_counters enable row level security;
alter table public.operator_study_days enable row level security;
alter table public.operator_study_day_metrics enable row level security;
alter table public.operator_mistakes enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_answer_events enable row level security;
alter table public.legacy_migration_audit enable row level security;

comment on table public.operator_profiles is 'Internal UUID identity; auth ownership and client policies require D1 approval.';
comment on table public.legacy_migration_audit is 'Administrative-only migration audit; never expose through the client.';

