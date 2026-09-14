-- Rebuild operator_mistakes from the immutable answer-event source of truth.
-- 20260914000000 rebuilt table/day aggregates from every answer event, but
-- mistakes were only ever written by finish_game_session. Errors answered in
-- sessions that never finished (or predate mistake tracking) therefore counted
-- in "Prioridade de estudo" / "Mapa das Tabuadas" but were missing from
-- "Contas respondidas incorretamente". Upserts set the derived value, so this
-- migration is safe to re-run.
with answer_events as (
  select
    e.operator_id,
    e.is_correct,
    e.answered_at,
    nullif(btrim(e.question_data ->> 'expression'), '') as expression
  from public.game_answer_events e
  where jsonb_typeof(e.question_data) = 'object'
)
insert into public.operator_mistakes(operator_id, expression, errors, correct, last_seen_at)
select operator_id, expression,
  count(*) filter (where not is_correct)::integer,
  count(*) filter (where is_correct)::integer,
  max(answered_at)
from answer_events
where expression is not null
group by operator_id, expression
on conflict (operator_id, expression) do update
  set errors = excluded.errors, correct = excluded.correct, last_seen_at = excluded.last_seen_at;
