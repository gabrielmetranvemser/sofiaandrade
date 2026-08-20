-- ═══════════════════════════════════════════════════════════════
-- 0008 · CONTAGEM DE CLIQUE ATÔMICA
--
-- `registrarCliqueNoGrupo` fazia ler-modificar-escrever em JS:
--
--     const cliques = grupo.cliques + 1
--     update grupos set cliques = <cliques>
--
-- Dois cliques simultâneos leem o mesmo valor e gravam o mesmo
-- número — conta um. Numa carreata com 300 pessoas escaneando o
-- mesmo QR, o limite de 700 demora demais a ser atingido e o grupo
-- estoura de gente antes de virar.
--
-- Esta função faz o incremento e a virada dentro de UMA transação,
-- com a linha travada. Também resolve a virada do fixado, que hoje
-- são dois UPDATEs soltos em que o erro do primeiro é ignorado.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.contar_clique(p_grupo_id uuid)
returns table (cliques integer, status text, virou boolean)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  g            public.grupos%rowtype;
  v_estourou   boolean := false;
  v_proximo_id uuid;
begin
  -- Trava a linha até o fim da transação. É isto que torna a conta correta.
  select * into g from public.grupos where id = p_grupo_id for update;
  if not found then
    return;
  end if;

  update public.grupos
     set cliques = public.grupos.cliques + 1
   where id = p_grupo_id
   returning * into g;

  v_estourou := g.limite_cliques is not null and g.cliques >= g.limite_cliques;

  if v_estourou and g.status = 'aberto' then
    update public.grupos set status = 'cheio' where id = p_grupo_id
      returning * into g;

    -- Se o que estourou era o fixado, o próximo aberto assume sozinho.
    if g.fixado then
      select id into v_proximo_id
        from public.grupos
       where municipio_slug = g.municipio_slug
         and status = 'aberto'
         and ordem > g.ordem
       order by ordem
       limit 1;

      if v_proximo_id is not null then
        update public.grupos set fixado = false where id = p_grupo_id;
        update public.grupos set fixado = true  where id = v_proximo_id;
      end if;
    end if;
  end if;

  return query select g.cliques, g.status, v_estourou;
end $$;

comment on function public.contar_clique(uuid) is
  'Incrementa o clique e aplica a virada por limite, atomicamente. Só service_role.';

-- Só o servidor chama, com service_role. Ninguém mais.
revoke all on function public.contar_clique(uuid) from public, anon, authenticated;
