-- Slots WhatsApp (jusqu'à 3 par compte, limités par plan côté app)
create table if not exists public.whatsapp_slots (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_index smallint not null check (slot_index between 1 and 3),
  display_name text not null default '',
  phone text not null default '',
  instance_name text,
  connection_status text not null default 'empty'
    check (connection_status in ('empty', 'pending', 'connected')),
  connected_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, slot_index)
);

create index if not exists whatsapp_slots_user_idx on public.whatsapp_slots (user_id);

alter table public.whatsapp_slots enable row level security;

drop policy if exists "whatsapp_slots_own" on public.whatsapp_slots;
create policy "whatsapp_slots_own"
  on public.whatsapp_slots for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.whatsapp_slots to authenticated;

-- Lignes par défaut pour les comptes existants
insert into public.whatsapp_slots (user_id, slot_index, display_name)
select u.id, s.idx, case s.idx
  when 1 then coalesce(nullif(trim(b.legal_name), ''), 'Numéro 1')
  when 2 then 'Numéro 2'
  else 'Numéro 3'
end
from auth.users u
cross join (values (1), (2), (3)) as s(idx)
left join public.businesses b on b.user_id = u.id
on conflict (user_id, slot_index) do nothing;
