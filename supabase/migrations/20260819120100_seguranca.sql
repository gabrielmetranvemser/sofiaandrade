-- ═══════════════════════════════════════════════════════════════
-- 0002 · SEGURANÇA
--
-- Regra central do projeto: o navegador NUNCA enxerga `grupos.link`.
-- Defesa em três camadas, porque uma só sempre falha:
--   1. RLS na tabela
--   2. privilégio POR COLUNA (revoke em `link`)
--   3. view pública sem a coluna
-- Mesmo que alguém erre a policy, o grant de coluna segura.
-- ═══════════════════════════════════════════════════════════════

alter table public.municipios     enable row level security;
alter table public.grupos         enable row level security;
alter table public.eventos        enable row level security;
alter table public.administradores enable row level security;

-- ───────────────────────────────────────────────────────────────
-- Helper: quem é admin. security definer para não bater na RLS
-- da própria tabela de administradores e virar recursão.
-- ───────────────────────────────────────────────────────────────
create or replace function public.eh_admin()
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

revoke all on function public.eh_admin() from public;
grant execute on function public.eh_admin() to authenticated;

-- ───────────────────────────────────────────────────────────────
-- municipios · leitura livre, escrita só de admin.
-- ───────────────────────────────────────────────────────────────
drop policy if exists municipios_leitura_publica on public.municipios;
create policy municipios_leitura_publica
  on public.municipios for select
  to anon, authenticated
  using (true);

drop policy if exists municipios_escrita_admin on public.municipios;
create policy municipios_escrita_admin
  on public.municipios for all
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

-- ───────────────────────────────────────────────────────────────
-- grupos
-- ───────────────────────────────────────────────────────────────

-- Camada 2: privilégio POR COLUNA.
-- Nem `anon` nem `authenticated` recebem `link`. Nenhum dos dois precisa:
-- o site público lê a view, e o painel lê pelo servidor com service_role.
-- Consequência prática: mesmo com a policy errada, `select link from grupos`
-- devolve "permission denied for column link". É a trava que não depende
-- de ninguém ter escrito a policy certa.
revoke all on table public.grupos from anon, authenticated;
grant select (municipio_slug, ordem, status, fixado)
  on table public.grupos to anon, authenticated;

-- Camada 1: RLS. A linha aparece, mas só nas colunas concedidas acima.
drop policy if exists grupos_leitura_publica on public.grupos;
create policy grupos_leitura_publica
  on public.grupos for select
  to anon, authenticated
  using (status <> 'desativado');

-- Escrita pelo PostgREST só de admin. Na prática o painel escreve pelo
-- servidor com service_role; esta policy é a rede embaixo do trapézio.
drop policy if exists grupos_escrita_admin on public.grupos;
create policy grupos_escrita_admin
  on public.grupos for all
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

-- Camada 3: a view que o site consome.
-- security_invoker = on faz a RLS acima valer para quem consulta.
drop view if exists public.grupos_publicos;
create view public.grupos_publicos
  with (security_invoker = on)
  as select municipio_slug, ordem, status, fixado
     from public.grupos
     where status <> 'desativado';

comment on view public.grupos_publicos is
  'O que o navegador pode ver. Sem `link`, sem `cliques`, sem `observacao`.';

grant select on public.grupos_publicos to anon, authenticated;

-- Status público por município, já resolvido. Poupa o cliente de
-- reimplementar a regra do fixado.
drop view if exists public.municipios_publicos;
create view public.municipios_publicos
  with (security_invoker = on)
  as select
       m.slug,
       m.nome,
       m.latitude,
       m.longitude,
       coalesce(
         (select case
            when bool_or(g.status = 'aberto') then 'aberto'
            when bool_or(g.status = 'cheio')  then 'cheio'
            else 'em_breve'
          end
          from public.grupos g
          where g.municipio_slug = m.slug and g.status <> 'desativado'),
         'em_breve'
       ) as status
     from public.municipios m;

grant select on public.municipios_publicos to anon, authenticated;

-- ───────────────────────────────────────────────────────────────
-- eventos · ninguém lê, ninguém escreve pelo PostgREST.
-- A gravação passa por /api/evento no servidor, com service_role.
-- A leitura é do painel, com service_role.
-- Sem policy = sem acesso para anon e authenticated. É o que queremos.
-- ───────────────────────────────────────────────────────────────
revoke all on table public.eventos from anon, authenticated;

drop policy if exists eventos_leitura_admin on public.eventos;
create policy eventos_leitura_admin
  on public.eventos for select
  to authenticated
  using ((select public.eh_admin()));

grant select on table public.eventos to authenticated;

-- ───────────────────────────────────────────────────────────────
-- administradores · cada admin enxerga a própria linha.
-- Incluir alguém é operação manual, no SQL editor. De propósito.
-- ───────────────────────────────────────────────────────────────
revoke all on table public.administradores from anon, authenticated;

drop policy if exists administradores_le_a_si on public.administradores;
create policy administradores_le_a_si
  on public.administradores for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on table public.administradores to authenticated;
