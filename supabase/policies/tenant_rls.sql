-- Exemple de politiques RLS multi-tenant (Phase 4) — à adapter au schéma réel.
-- Hypothèse : colonne `tenant_id` uuid sur chaque table métier.

-- alter table public.contacts enable row level security;
--
-- create policy "tenant_isolation_select" on public.contacts
--   for select using (tenant_id = auth.jwt() ->> 'tenant_id'::text);
