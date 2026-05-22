-- Extension schéma Golaine : profil détaillé, entreprise, produits, conversations, agent, notifications
-- Peut être exécuté après 20260513190000_golaine_core.sql, ou seul si la table profiles n'existe pas encore.

-- ---------------------------------------------------------------------------
-- Table profiles (base — idempotent si core déjà appliqué)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  plan_tier text not null default 'Starter'
    check (plan_tier in ('Starter', 'Pro', 'Business')),
  messages_used_month integer not null default 0,
  messages_limit_month integer not null default 1500,
  image_analyses_used_month integer not null default 0,
  image_analyses_limit_month integer not null default 50,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Profil utilisateur (colonnes supplémentaires)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists phone text not null default '';

alter table public.profiles
  add column if not exists locale text not null default 'fr'
    check (locale in ('fr', 'en', 'wo'));

alter table public.profiles
  add column if not exists timezone text not null default 'Africa/Dakar';

alter table public.profiles
  add column if not exists avatar_url text;

-- ---------------------------------------------------------------------------
-- Entreprise (1 ligne / compte boutique)
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  legal_name text not null default '',
  description text not null default '',
  address text not null default '',
  sector text not null default '',
  website text not null default '',
  logo_url text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Produits (catalogue « Mes produits »)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  price numeric(14, 2) not null default 0,
  category text not null default '',
  stock integer not null default 0,
  image text not null default '',
  status text not null default 'actif'
    check (status in ('actif', 'inactif')),
  assigned_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products (user_id);

-- ---------------------------------------------------------------------------
-- Conversations WhatsApp (fil + messages)
-- ---------------------------------------------------------------------------
create table if not exists public.conversation_threads (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_name text not null default '',
  contact_phone text not null default '',
  last_message text not null default '',
  last_message_at timestamptz,
  unread_count integer not null default 0,
  status text not null default 'active'
    check (status in ('active', 'closed')),
  avatar_initials text not null default '',
  gradient_key text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists conversation_threads_user_idx
  on public.conversation_threads (user_id, last_message_at desc nulls last);

create table if not exists public.conversation_messages (
  id bigserial primary key,
  thread_id bigint not null references public.conversation_threads (id) on delete cascade,
  sender text not null check (sender in ('client', 'agent')),
  body text not null,
  sent_at timestamptz not null default now()
);

create index if not exists conversation_messages_thread_idx
  on public.conversation_messages (thread_id, sent_at desc);

-- ---------------------------------------------------------------------------
-- Agent IA (configuration par compte)
-- ---------------------------------------------------------------------------
create table if not exists public.agent_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  slot_name text not null default '',
  agent_name text not null default '',
  phone text not null default '',
  status text not null default 'inactive'
    check (status in ('connected', 'inactive')),
  system_prompt text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Intégration WhatsApp (état connexion)
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  connected boolean not null default false,
  phone_masked text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Préférences notifications (JSON extensible)
-- ---------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prefs jsonb not null default '{"orders": true, "whatsapp": true, "report": true, "stock": true, "contacts": false, "products": false}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Facturation / historique (lignes facture)
-- ---------------------------------------------------------------------------
create table if not exists public.billing_invoices (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount_fcfa bigint not null default 0,
  status text not null default 'Payé' check (status in ('Payé', 'En attente', 'Échoué')),
  invoiced_at date not null default (current_date),
  created_at timestamptz not null default now()
);

create index if not exists billing_invoices_user_idx on public.billing_invoices (user_id, invoiced_at desc);

-- ---------------------------------------------------------------------------
-- Trigger inscription : lignes satellites
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, plan_tier)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'business_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'Utilisateur'
    ),
    'Starter'
  );
  insert into public.businesses (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.notification_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.agent_settings (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.whatsapp_connections (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Comptes existants : créer les lignes manquantes
insert into public.profiles (id, display_name, plan_tier)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'business_name',
    split_part(coalesce(u.email, ''), '@', 1),
    'Utilisateur'
  ),
  'Starter'
from auth.users u
on conflict (id) do nothing;

insert into public.businesses (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

insert into public.notification_preferences (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

insert into public.agent_settings (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

insert into public.whatsapp_connections (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.conversation_threads enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.agent_settings enable row level security;
alter table public.whatsapp_connections enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.billing_invoices enable row level security;

create policy "businesses_own"
  on public.businesses for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "products_own"
  on public.products for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "conversation_threads_own"
  on public.conversation_threads for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "conversation_messages_own"
  on public.conversation_messages for all to authenticated
  using (
    exists (
      select 1 from public.conversation_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.conversation_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

create policy "agent_settings_own"
  on public.agent_settings for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "whatsapp_connections_own"
  on public.whatsapp_connections for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notification_prefs_own"
  on public.notification_preferences for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "billing_invoices_own"
  on public.billing_invoices for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.conversation_threads to authenticated;
grant select, insert, update, delete on public.conversation_messages to authenticated;
grant select, insert, update, delete on public.agent_settings to authenticated;
grant select, insert, update, delete on public.whatsapp_connections to authenticated;
grant select, insert, update, delete on public.notification_preferences to authenticated;
grant select, insert, update, delete on public.billing_invoices to authenticated;
grant usage, select on all sequences in schema public to authenticated;
