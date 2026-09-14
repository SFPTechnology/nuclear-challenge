-- Persist the detailed session snapshot already produced by the game client.
-- All writes run in finish_game_session's transaction, so a failed write rolls
-- back the terminal session and aggregate progress together.
create or replace function public.json_object_or_empty(p_value jsonb)
returns jsonb language sql immutable set search_path = public as $$
  select case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end;
$$;

create or replace function public.nonnegative_json_int(p_value jsonb, p_key text)
returns integer language sql immutable set search_path = public as $$
  select case
    when jsonb_typeof(p_value) = 'object'
      and coalesce(p_value ->> p_key, '') ~ '^[0-9]{1,9}$'
    then (p_value ->> p_key)::integer
    else 0
  end;
$$;

create or replace function public.persist_metric_counters(
  p_operator_id uuid,
  p_dimension_kind public.metric_dimension_kind,
  p_metrics jsonb
)
returns void language plpgsql security invoker set search_path = public as $$
declare
  metric_key text;
  metric_value jsonb;
begin
  for metric_key, metric_value in
    select key, value from jsonb_each(public.json_object_or_empty(p_metrics))
  loop
    if nullif(btrim(metric_key), '') is null then continue; end if;
    insert into public.operator_metric_counters(operator_id, dimension_kind, dimension_key, hits, misses)
    values (
      p_operator_id,
      p_dimension_kind,
      metric_key,
      public.nonnegative_json_int(metric_value, 'h'),
      public.nonnegative_json_int(metric_value, 'm')
    )
    on conflict (operator_id, dimension_kind, dimension_key) do update
      set hits = public.operator_metric_counters.hits + excluded.hits,
          misses = public.operator_metric_counters.misses + excluded.misses,
          updated_at = timezone('utc', now());
  end loop;
end;
$$;

create or replace function public.persist_study_days(p_operator_id uuid, p_daily jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare
  day_key text;
  day_value jsonb;
  study_day date;
  day_hits integer;
  day_misses integer;
  dimension_kind public.metric_dimension_kind;
  dimension_metrics jsonb;
  metric_key text;
  metric_value jsonb;
begin
  for day_key, day_value in
    select key, value from jsonb_each(public.json_object_or_empty(p_daily))
  loop
    begin
      study_day := day_key::date;
    exception when others then
      continue;
    end;

    day_hits := public.nonnegative_json_int(day_value, 'hits');
    day_misses := public.nonnegative_json_int(day_value, 'misses');
    if day_hits + day_misses = 0 then continue; end if;

    insert into public.operator_study_days(operator_id, study_date, total, hits, misses)
    values (p_operator_id, study_day, day_hits + day_misses, day_hits, day_misses)
    on conflict (operator_id, study_date) do update
      set total = public.operator_study_days.total + excluded.total,
          hits = public.operator_study_days.hits + excluded.hits,
          misses = public.operator_study_days.misses + excluded.misses,
          updated_at = timezone('utc', now());

    for dimension_kind, dimension_metrics in
      select kind, metrics
      from (values
        ('table'::public.metric_dimension_kind, public.json_object_or_empty(day_value -> 'tables')),
        ('operation'::public.metric_dimension_kind, jsonb_build_object(
          'multiplication', coalesce(day_value #> '{types,multiplication}', '{}'::jsonb),
          'division', coalesce(day_value #> '{types,division}', '{}'::jsonb)
        )),
        ('form'::public.metric_dimension_kind, jsonb_build_object(
          'direct', coalesce(day_value #> '{types,direct}', '{}'::jsonb),
          'inverse', coalesce(day_value #> '{types,inverse}', '{}'::jsonb)
        ))
      ) as metric_sets(kind, metrics)
    loop
      for metric_key, metric_value in
        select key, value from jsonb_each(dimension_metrics)
      loop
        if nullif(btrim(metric_key), '') is null then continue; end if;
        insert into public.operator_study_day_metrics(operator_id, study_date, dimension_kind, dimension_key, hits, misses)
        values (
          p_operator_id,
          study_day,
          dimension_kind,
          metric_key,
          public.nonnegative_json_int(metric_value, 'hits'),
          public.nonnegative_json_int(metric_value, 'misses')
        )
        on conflict (operator_id, study_date, dimension_kind, dimension_key) do update
          set hits = public.operator_study_day_metrics.hits + excluded.hits,
              misses = public.operator_study_day_metrics.misses + excluded.misses;
      end loop;
    end loop;
  end loop;
end;
$$;

create or replace function public.finish_game_session(
  p_session_id uuid, p_outcome public.game_session_status, p_points integer, p_accuracy numeric,
  p_best_streak integer, p_duration_seconds integer, p_snapshot jsonb, p_progress jsonb
)
returns public.game_sessions language plpgsql security definer set search_path = public as $$
declare session_row public.game_sessions; k text; v jsonb;
begin
  if p_outcome not in ('win', 'lose', 'quit') then raise exception 'invalid terminal status'; end if;
  update public.game_sessions set status=p_outcome, points=p_points, accuracy=p_accuracy, best_streak=p_best_streak,
    duration_seconds=p_duration_seconds, state_snapshot=p_snapshot, snapshot_version=coalesce(snapshot_version,0)+1, ended_at=timezone('utc',now())
  where id=p_session_id and public.current_user_owns_operator(operator_id) and status in ('in_progress','paused') returning * into session_row;
  if session_row.id is null then raise exception 'session not found or already finished'; end if;
  update public.operator_progress set games=games+1, operations=operations+coalesce((p_progress->>'operations')::int,0),
    hits=hits+coalesce((p_progress->>'hits')::int,0), wins=wins+case when p_outcome='win' then 1 else 0 end,
    best_streak=greatest(best_streak,p_best_streak), rank_index=greatest(rank_index,coalesce((p_progress->>'rankIndex')::int,0)),
    best_by_difficulty=jsonb_set(best_by_difficulty,array[session_row.difficulty::text],to_jsonb(greatest(coalesce((best_by_difficulty->>session_row.difficulty::text)::int,0),p_points)),true)
  where operator_id=session_row.operator_id;
  perform public.persist_metric_counters(session_row.operator_id, 'table', p_snapshot #> '{sessionStats,tabs}');
  perform public.persist_metric_counters(session_row.operator_id, 'operation', p_snapshot #> '{sessionStats,ops}');
  perform public.persist_metric_counters(session_row.operator_id, 'form', p_snapshot #> '{sessionStats,forms}');
  perform public.persist_study_days(session_row.operator_id, p_snapshot #> '{sessionStats,daily}');
  for k,v in select key,value from jsonb_each(public.json_object_or_empty(p_progress->'mistakes')) loop
    if nullif(btrim(k), '') is null then continue; end if;
    insert into public.operator_mistakes(operator_id,expression,errors,correct,last_seen_at) values(session_row.operator_id,k,public.nonnegative_json_int(v, 'errors'),public.nonnegative_json_int(v, 'correct'),timezone('utc',now()))
    on conflict(operator_id,expression) do update set errors=operator_mistakes.errors+excluded.errors, correct=operator_mistakes.correct+excluded.correct,last_seen_at=excluded.last_seen_at;
  end loop;
  return session_row;
end;
$$;

revoke all on function public.json_object_or_empty(jsonb), public.nonnegative_json_int(jsonb,text), public.persist_metric_counters(uuid,public.metric_dimension_kind,jsonb), public.persist_study_days(uuid,jsonb) from public;
grant execute on function public.finish_game_session(uuid,public.game_session_status,integer,numeric,integer,integer,jsonb,jsonb) to authenticated;
