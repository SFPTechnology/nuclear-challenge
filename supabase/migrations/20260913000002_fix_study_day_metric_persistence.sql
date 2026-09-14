-- Fix the PL/pgSQL variable/column ambiguity in the prior helper before it is
-- used by finish_game_session. This only replaces function code; no data is
-- transformed or deleted.
create or replace function public.persist_study_days(p_operator_id uuid, p_daily jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare
  day_key text;
  day_value jsonb;
  study_day date;
  day_hits integer;
  day_misses integer;
  current_dimension_kind public.metric_dimension_kind;
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

    for current_dimension_kind, dimension_metrics in
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
          current_dimension_kind,
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
