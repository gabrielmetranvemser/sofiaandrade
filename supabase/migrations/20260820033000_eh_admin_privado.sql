-- ═══════════════════════════════════════════════════════════════
-- 0006 · TIRA eh_admin() DA API PÚBLICA
--
-- O linter do Supabase apontou: qualquer pessoa podia chamar
-- `/rest/v1/rpc/eh_admin` sem estar logada. O impacto era pequeno
-- (a função só devolve true/false sobre quem está chamando), mas é
-- uma função SECURITY DEFINER pendurada na API aberta, e isso não
-- precisa existir.
--
-- Revogar o EXECUTE não serve: as policies de RLS chamam a função
-- e são avaliadas com as permissões de quem consulta — tirar o
-- EXECUTE quebraria o acesso do próprio admin.
--
-- A saída certa é mudar de endereço: schema `private`, que o
-- PostgREST não expõe. As policies continuam chamando normalmente.
-- ═══════════════════════════════════════════════════════════════

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.eh_admin() from public, anon;
grant execute on function private.eh_admin() to authenticated, service_role;

-- ───────────────────────────────────────────────────────────────
-- Reaponta as policies para o novo endereço.
-- ───────────────────────────────────────────────────────────────
drop policy if exists municipios_escrita_admin on public.municipios;
create policy municipios_escrita_admin
  on public.municipios for all
  to authenticated
  using ((select private.eh_admin()))
  with check ((select private.eh_admin()));

drop policy if exists grupos_escrita_admin on public.grupos;
create policy grupos_escrita_admin
  on public.grupos for all
  to authenticated
  using ((select private.eh_admin()))
  with check ((select private.eh_admin()));

drop policy if exists eventos_leitura_admin on public.eventos;
create policy eventos_leitura_admin
  on public.eventos for select
  to authenticated
  using ((select private.eh_admin()));

-- Agora sim dá para derrubar a versão exposta.
drop function if exists public.eh_admin();
