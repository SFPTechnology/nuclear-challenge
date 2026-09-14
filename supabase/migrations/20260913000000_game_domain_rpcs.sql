-- Browser-safe domain operations. Every function derives ownership from auth.uid().
create or replace function public.create_operator(p_display_label text)
returns public.operator_profiles language plpgsql security definer set search_path = public as $$
declare profile public.operator_profiles;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  insert into public.operator_profiles(auth_user_id, display_label)
  values (auth.uid(), trim(p_display_label)) returning * into profile;
  insert into public.operator_progress(operator_id) values (profile.id);
  return profile;
end; $$;

create or replace function public.start_game_session(p_operator_id uuid, p_difficulty smallint, p_snapshot jsonb default null)
returns public.game_sessions language plpgsql security definer set search_path = public as $$
declare session_row public.game_sessions;
begin
  if not public.current_user_owns_operator(p_operator_id) then raise exception 'operator not found'; end if;
  insert into public.game_sessions(operator_id, difficulty, state_snapshot, snapshot_version)
  values (p_operator_id, p_difficulty, p_snapshot, case when p_snapshot is null then null else 1 end)
  returning * into session_row;
  return session_row;
end; $$;

create or replace function public.save_game_snapshot(p_session_id uuid, p_snapshot jsonb, p_paused boolean default false)
returns public.game_sessions language plpgsql security definer set search_path = public as $$
declare session_row public.game_sessions;
begin
  update public.game_sessions set state_snapshot = p_snapshot, snapshot_version = coalesce(snapshot_version, 0) + 1,
    status = case when p_paused then 'paused'::public.game_session_status else 'in_progress'::public.game_session_status end
  where id = p_session_id and public.current_user_owns_operator(operator_id) and status in ('in_progress', 'paused')
  returning * into session_row;
  if session_row.id is null then raise exception 'session not found or not resumable'; end if;
  return session_row;
end; $$;

create or replace function public.record_game_answer(
  p_session_id uuid, p_operator_id uuid, p_sequence_number integer,
  p_question_data jsonb, p_is_correct boolean, p_resulting_state jsonb default null
)
returns public.game_answer_events language plpgsql security definer set search_path = public as $$
declare event_row public.game_answer_events;
begin
  if not public.current_user_owns_operator(p_operator_id) then raise exception 'operator not found'; end if;
  insert into public.game_answer_events(session_id, operator_id, sequence_number, question_data, is_correct, resulting_state)
  values (p_session_id, p_operator_id, p_sequence_number, p_question_data, p_is_correct, p_resulting_state)
  returning * into event_row;
  perform public.save_game_snapshot(p_session_id, p_resulting_state, false);
  return event_row;
end; $$;

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
  for k,v in select key,value from jsonb_each(coalesce(p_progress->'mistakes','{}'::jsonb)) loop
    insert into public.operator_mistakes(operator_id,expression,errors,correct,last_seen_at) values(session_row.operator_id,k,coalesce((v->>'errors')::int,0),coalesce((v->>'correct')::int,0),timezone('utc',now()))
    on conflict(operator_id,expression) do update set errors=operator_mistakes.errors+excluded.errors, correct=operator_mistakes.correct+excluded.correct,last_seen_at=excluded.last_seen_at;
  end loop;
  return session_row;
end; $$;

create or replace function public.delete_operator(p_operator_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.operator_profiles where id=p_operator_id and auth_user_id=auth.uid();
  if not found then raise exception 'operator not found'; end if;
end; $$;

revoke all on function public.create_operator(text), public.start_game_session(uuid,smallint,jsonb), public.save_game_snapshot(uuid,jsonb,boolean), public.record_game_answer(uuid,uuid,integer,jsonb,boolean,jsonb), public.finish_game_session(uuid,public.game_session_status,integer,numeric,integer,integer,jsonb,jsonb), public.delete_operator(uuid) from public;
grant execute on function public.create_operator(text), public.start_game_session(uuid,smallint,jsonb), public.save_game_snapshot(uuid,jsonb,boolean), public.record_game_answer(uuid,uuid,integer,jsonb,boolean,jsonb), public.finish_game_session(uuid,public.game_session_status,integer,numeric,integer,integer,jsonb,jsonb), public.delete_operator(uuid) to authenticated;
