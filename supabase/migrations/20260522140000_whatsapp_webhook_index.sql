-- Recherche slot par nom d'instance Evolution (webhook entrant)
create index if not exists whatsapp_slots_instance_name_idx
  on public.whatsapp_slots (instance_name)
  where instance_name is not null;
