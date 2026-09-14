-- Synthetic development data only. Never apply this seed to production.
insert into public.operator_profiles (id, display_label) values ('00000000-0000-0000-0000-000000000001', 'Operador QA') on conflict (id) do nothing;
insert into public.operator_progress (operator_id) values ('00000000-0000-0000-0000-000000000001') on conflict (operator_id) do nothing;

