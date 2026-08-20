-- ═══════════════════════════════════════════════════════════════
-- 0009 · CORRIGE contar_clique
--
-- A versão anterior declarava os parâmetros de saída como `cliques`
-- e `status` — os mesmos nomes das colunas de `grupos`. No corpo,
-- `g.status` ficava ambíguo entre a coluna do registro e o parâmetro
-- de saída, e o Postgres recusava com
--     column reference "status" is ambiguous
-- abortando a transação inteira: o clique não era contado.
--
-- Sintoma no teste: 12 cliques simultâneos, 4 contados.
--
-- Correção: prefixo `r_` nos parâmetros de saída. Nenhum nome de
-- saída pode repetir nome de coluna dentro de uma função plpgsql.
-- ═══════════════════════════════════════════════════════════════

drop function if exists public.contar_clique(uuid);

create function public.contar_clique(p_grupo_id uuid)
returns table (r_cliques integer, r_status text, r_virou boolean)
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

  r_cliques := g.cliques;
  r_status  := g.status;
  r_virou   := v_estourou;
  return next;
end $$;

comment on function public.contar_clique(uuid) is
  'Incrementa o clique e aplica a virada por limite, atomicamente. Só service_role.';

revoke all on function public.contar_clique(uuid) from public, anon, authenticated;
