create or replace function public.prevent_answer_mutation()
returns trigger language plpgsql security invoker set search_path = public as $$
begin raise exception 'game_answer_events are immutable'; end; $$;

create trigger game_answer_events_immutable
before update or delete on public.game_answer_events
for each row execute function public.prevent_answer_mutation();

create or replace function public.ensure_answer_operator()
returns trigger language plpgsql security invoker set search_path = public as $$
declare session_operator uuid;
begin
  select operator_id into session_operator from public.game_sessions where id = new.session_id;
  if session_operator is null or session_operator <> new.operator_id then
    raise exception 'answer operator does not match session operator';
  end if;
  return new;
end; $$;

create trigger game_answer_events_operator_match
before insert on public.game_answer_events
for each row execute function public.ensure_answer_operator();

create or replace function public.record_game_answer(
  p_session_id uuid, p_operator_id uuid, p_sequence_number integer,
  p_question_data jsonb, p_is_correct boolean, p_resulting_state jsonb default null
)
returns public.game_answer_events
language plpgsql security invoker set search_path = public as $$
declare event_row public.game_answer_events;
begin
  insert into public.game_answer_events(session_id, operator_id, sequence_number, question_data, is_correct, resulting_state)
  values (p_session_id, p_operator_id, p_sequence_number, p_question_data, p_is_correct, p_resulting_state)
  returning * into event_row;
  update public.game_sessions set state_snapshot = p_resulting_state, snapshot_version = coalesce(snapshot_version, 1)
  where id = p_session_id and operator_id = p_operator_id and status in ('in_progress', 'paused');
  if not found then raise exception 'session not found or not resumable'; end if;
  return event_row;
end; $$;

revoke all on function public.record_game_answer(uuid, uuid, integer, jsonb, boolean, jsonb) from public;

