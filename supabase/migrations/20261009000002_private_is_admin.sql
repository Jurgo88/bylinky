-- 002_private_is_admin  –  is_admin() nie je dostupná cez REST API (/rpc)
-- Politiky RLS odkazujú na funkciu cez OID, presun schémy ich nerozbije.

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_admin() set schema private;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;

-- funkcia z nastavenia "automatic RLS" (event trigger) – nemá byť volateľná cez API
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
