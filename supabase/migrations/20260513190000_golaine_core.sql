-- Golaine : schéma métier + RLS + profil à l'inscription
-- À appliquer dans Supabase : SQL Editor (tout le fichier) ou `supabase db push`

-- ---------------------------------------------------------------------------
-- Profil boutique (1 ligne par compte auth)
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

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null default '',
  segment text not null default 'Nouveau'
    check (segment in ('VIP', 'Régulier', 'Nouveau', 'Inactif')),
  city text not null default '',
  notes text not null default '',
  orders_count integer not null default 0,
  total_spent integer not null default 0,
  last_order_at date,
  created_at timestamptz not null default now()
);

create index if not exists contacts_user_id_created_at_idx
  on public.contacts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id bigint references public.contacts (id) on delete set null,
  client text not null,
  client_sub text not null default '',
  produit text not null,
  adresse text not null default '',
  montant bigint not null default 0,
  status text not null
    check (status in ('en_attente', 'confirmee', 'en_preparation', 'livree', 'annulee')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Rendez-vous
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  client text not null,
  appointment_date date not null,
  appointment_time text not null,
  duration_minutes integer not null default 60,
  type text not null
    check (type in ('livraison', 'rendez-vous', 'appel', 'autre')),
  status text not null
    check (status in ('confirme', 'en_attente', 'annule')),
  notes text not null default '',
  location text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists appointments_user_id_idx
  on public.appointments (user_id);

-- ---------------------------------------------------------------------------
-- Fil d'activité (dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null
    check (activity_type in ('order', 'contact', 'agent', 'success')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_created_idx
  on public.activity_events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Trigger : créer le profil à l'inscription
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Comptes déjà présents dans auth avant cette migration
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

-- ---------------------------------------------------------------------------
-- Activité auto (commandes / contacts)
-- ---------------------------------------------------------------------------
create or replace function public.log_activity_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_events (user_id, activity_type, body)
  values (new.user_id, 'order', 'Nouvelle commande reçue — #' || new.id::text);
  return new;
end;
$$;

drop trigger if exists tr_orders_activity on public.orders;
create trigger tr_orders_activity
  after insert on public.orders
  for each row execute procedure public.log_activity_on_order();

create or replace function public.log_activity_on_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_events (user_id, activity_type, body)
  values (new.user_id, 'contact', new.name || ' a été ajoutée aux contacts');
  return new;
end;
$$;

drop trigger if exists tr_contacts_activity on public.contacts;
create trigger tr_contacts_activity
  after insert on public.contacts
  for each row execute procedure public.log_activity_on_contact();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.orders enable row level security;
alter table public.appointments enable row level security;
alter table public.activity_events enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "contacts_crud_own"
  on public.contacts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "orders_crud_own"
  on public.orders for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "appointments_crud_own"
  on public.appointments for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "activity_select_own"
  on public.activity_events for select to authenticated
  using (user_id = auth.uid());

create policy "activity_insert_own"
  on public.activity_events for insert to authenticated
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants (schéma public — rôle authenticated Supabase)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, delete on public.activity_events to authenticated;
grant usage, select on all sequences in schema public to authenticated;
