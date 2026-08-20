-- ═══════════════════════════════════════════════════════════════
-- 0007 · TIRA A SOBREPOSIÇÃO DE POLICIES
--
-- As policies de admin foram criadas com `for all`, que inclui
-- SELECT. Como já existe a policy de leitura pública valendo para
-- `authenticated`, o Postgres avaliava DUAS policies permissivas em
-- todo SELECT — e a de admin chama eh_admin(), que bate na tabela
-- de administradores.
--
-- O admin não precisa de policy para ler: a de leitura pública já
-- resolve. A de admin passa a cobrir só escrita.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists municipios_escrita_admin on public.municipios;

create policy municipios_insere_admin on public.municipios
  for insert to authenticated with check ((select private.eh_admin()));
create policy municipios_atualiza_admin on public.municipios
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy municipios_apaga_admin on public.municipios
  for delete to authenticated using ((select private.eh_admin()));

drop policy if exists grupos_escrita_admin on public.grupos;

create policy grupos_insere_admin on public.grupos
  for insert to authenticated with check ((select private.eh_admin()));
create policy grupos_atualiza_admin on public.grupos
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy grupos_apaga_admin on public.grupos
  for delete to authenticated using ((select private.eh_admin()));
