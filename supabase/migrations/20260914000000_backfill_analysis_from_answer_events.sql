-- Rebuild analysis aggregates from the immutable answer-event source of truth.
-- Upserts set the derived value (rather than adding to it), so this migration
-- is safe to re-run manually if an interrupted deployment ever needs recovery.
with answer_events as (
  select
    e.operator_id,
    e.is_correct,
    (e.answered_at at time zone 'America/Sao_Paulo')::date as study_date,
    e.question_data
  from public.game_answer_events e
  where jsonb_typeof(e.question_data) = 'object'
), dimensions as (
  select operator_id, is_correct, 'operation'::public.metric_dimension_kind as dimension_kind,
    nullif(question_data ->> 'operation', '') as dimension_key
  from answer_events
  union all
  select operator_id, is_correct, 'form'::public.metric_dimension_kind,
    nullif(question_data ->> 'hidden', '')
  from answer_events
  union all
  select e.operator_id, e.is_correct, 'table'::public.metric_dimension_kind, nullif(factor.value, '')
  from answer_events e
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(e.question_data -> 'factors') = 'array' then e.question_data -> 'factors' else '[]'::jsonb end
  ) as factor(value)
)
insert into public.operator_metric_counters(operator_id, dimension_kind, dimension_key, hits, misses)
select operator_id, dimension_kind, dimension_key,
  count(*) filter (where is_correct)::integer,
  count(*) filter (where not is_correct)::integer
from dimensions
where dimension_key is not null
group by operator_id, dimension_kind, dimension_key
on conflict (operator_id, dimension_kind, dimension_key) do update
  set hits = excluded.hits, misses = excluded.misses, updated_at = timezone('utc', now());

with answer_events as (
  select e.operator_id, e.is_correct, (e.answered_at at time zone 'America/Sao_Paulo')::date as study_date
  from public.game_answer_events e
)
insert into public.operator_study_days(operator_id, study_date, total, hits, misses)
select operator_id, study_date, count(*)::integer,
  count(*) filter (where is_correct)::integer,
  count(*) filter (where not is_correct)::integer
from answer_events
group by operator_id, study_date
on conflict (operator_id, study_date) do update
  set total = excluded.total, hits = excluded.hits, misses = excluded.misses, updated_at = timezone('utc', now());

with answer_events as (
  select
    e.operator_id,
    e.is_correct,
    (e.answered_at at time zone 'America/Sao_Paulo')::date as study_date,
    e.question_data
  from public.game_answer_events e
  where jsonb_typeof(e.question_data) = 'object'
), dimensions as (
  select e.operator_id, e.study_date, e.is_correct, 'table'::public.metric_dimension_kind as dimension_kind, factor.value as dimension_key
  from answer_events e
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(e.question_data -> 'factors') = 'array' then e.question_data -> 'factors' else '[]'::jsonb end
  ) as factor(value)
  union all
  select operator_id, study_date, is_correct, 'operation'::public.metric_dimension_kind,
    case question_data ->> 'operation' when '×' then 'multiplication' when '*' then 'multiplication' when '÷' then 'division' when '/' then 'division' end
  from answer_events
  union all
  select operator_id, study_date, is_correct, 'form'::public.metric_dimension_kind,
    case question_data ->> 'hidden' when 'result' then 'direct' when 'left' then 'inverse' when 'right' then 'inverse' end
  from answer_events
)
insert into public.operator_study_day_metrics(operator_id, study_date, dimension_kind, dimension_key, hits, misses)
select operator_id, study_date, dimension_kind, dimension_key,
  count(*) filter (where is_correct)::integer,
  count(*) filter (where not is_correct)::integer
from dimensions
where nullif(dimension_key, '') is not null
group by operator_id, study_date, dimension_kind, dimension_key
on conflict (operator_id, study_date, dimension_kind, dimension_key) do update
  set hits = excluded.hits, misses = excluded.misses;
