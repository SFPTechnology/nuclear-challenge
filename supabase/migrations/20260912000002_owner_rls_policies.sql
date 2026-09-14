-- Owner-only access policy approved for D1-D6.
-- The service role remains the administrative path; it is never exposed to the browser.

create or replace function public.current_user_owns_operator(p_operator_id uuid)
returns boolean language sql stable security definer
set search_path = public, pg_catalog
set row_security = off
as $$
  select exists (
    select 1 from public.operator_profiles
    where id = p_operator_id
      and auth_user_id = (select auth.uid())
      and deleted_at is null
  );
$$;

revoke all on function public.current_user_owns_operator(uuid) from public;
grant execute on function public.current_user_owns_operator(uuid) to authenticated;

create policy operator_profiles_owner_select on public.operator_profiles for select to authenticated
using (auth_user_id = (select auth.uid()) and deleted_at is null);
create policy operator_profiles_owner_insert on public.operator_profiles for insert to authenticated
with check (auth_user_id = (select auth.uid()) and deleted_at is null);
create policy operator_profiles_owner_update on public.operator_profiles for update to authenticated
using (auth_user_id = (select auth.uid()) and deleted_at is null)
with check (auth_user_id = (select auth.uid()));
create policy operator_profiles_owner_delete on public.operator_profiles for delete to authenticated
using (auth_user_id = (select auth.uid()));

create policy operator_progress_owner_all on public.operator_progress for all to authenticated
using (public.current_user_owns_operator(operator_id)) with check (public.current_user_owns_operator(operator_id));
create policy operator_metric_counters_owner_all on public.operator_metric_counters for all to authenticated
using (public.current_user_owns_operator(operator_id)) with check (public.current_user_owns_operator(operator_id));
create policy operator_study_days_owner_all on public.operator_study_days for all to authenticated
using (public.current_user_owns_operator(operator_id)) with check (public.current_user_owns_operator(operator_id));
create policy operator_study_day_metrics_owner_all on public.operator_study_day_metrics for all to authenticated
using (public.current_user_owns_operator(operator_id)) with check (public.current_user_owns_operator(operator_id));
create policy operator_mistakes_owner_all on public.operator_mistakes for all to authenticated
using (public.current_user_owns_operator(operator_id)) with check (public.current_user_owns_operator(operator_id));
create policy game_sessions_owner_all on public.game_sessions for all to authenticated
using (public.current_user_owns_operator(operator_id)) with check (public.current_user_owns_operator(operator_id));

create policy game_answer_events_owner_select on public.game_answer_events for select to authenticated
using (public.current_user_owns_operator(operator_id));
create policy game_answer_events_owner_insert on public.game_answer_events for insert to authenticated
with check (public.current_user_owns_operator(operator_id));

comment on function public.current_user_owns_operator(uuid) is 'Owner-only RLS helper; administrative service-role access is separate from client access.';
