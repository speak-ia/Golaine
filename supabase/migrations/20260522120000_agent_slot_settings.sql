-- Configuration Agent IA par slot WhatsApp (1 à 3)
create table if not exists public.agent_slot_settings (
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_index smallint not null check (slot_index between 1 and 3),
  agent_name text not null default '',
  notification_phone text not null default '',
  language text not null default 'fr'
    check (language in ('fr', 'en', 'wo', 'ar')),
  timezone text not null default 'Africa/Dakar',
  system_prompt text not null default '',
  welcome_message text not null default '',
  auto_response boolean not null default true,
  working_hours_enabled boolean not null default false,
  work_start time not null default '08:00',
  work_end time not null default '20:00',
  fallback_to_human boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot_index)
);

create index if not exists agent_slot_settings_user_idx
  on public.agent_slot_settings (user_id);

alter table public.agent_slot_settings enable row level security;

drop policy if exists "agent_slot_settings_own" on public.agent_slot_settings;
create policy "agent_slot_settings_own"
  on public.agent_slot_settings for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.agent_slot_settings to authenticated;

-- Lignes par défaut pour comptes existants (alignées sur whatsapp_slots)
insert into public.agent_slot_settings (user_id, slot_index)
select w.user_id, w.slot_index
from public.whatsapp_slots w
on conflict (user_id, slot_index) do nothing;
