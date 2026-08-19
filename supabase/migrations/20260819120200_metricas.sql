-- ═══════════════════════════════════════════════════════════════
-- 0003 · MÉTRICAS
--
-- Views de leitura para o painel. Todas consumidas pelo servidor
-- com service_role. Nenhuma exposta ao anon.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- Funil por dia. Uma linha por dia, uma coluna por etapa.
-- É a tela que responde "o problema é a copy, o botão ou o grupo?".
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_funil_dia as
select
  (criado_em at time zone 'America/Porto_Velho')::date as dia,
  count(*) filter (where tipo = 'pagina_vista')          as viram_pagina,
  count(*) filter (where tipo = 'rolou_50')              as rolaram_metade,
  count(*) filter (where tipo = 'rolou_90')              as rolaram_fim,
  count(*) filter (where tipo = 'buscou_cidade')         as buscaram_cidade,
  count(*) filter (where tipo = 'usou_localizacao')      as usaram_gps,
  count(*) filter (where tipo = 'clicou_grupo')          as clicaram_grupo,
  count(*) filter (where tipo = 'abriu_filtro')          as abriram_filtro,
  count(*) filter (where tipo = 'gerou_filtro')          as geraram_filtro,
  count(*) filter (where tipo in ('baixou_filtro','compartilhou_filtro')) as salvaram_filtro,
  count(*) filter (where tipo = 'compartilhou_pagina')   as compartilharam_pagina,
  count(distinct sessao)                                  as sessoes
from public.eventos
group by 1
order by 1 desc;

-- ───────────────────────────────────────────────────────────────
-- Cliques em grupo por município. Ordenado. Diz onde a campanha pegou.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_municipio as
select
  m.slug,
  m.nome,
  count(e.id) filter (where e.tipo = 'clicou_grupo')               as cliques,
  count(distinct e.sessao) filter (where e.tipo = 'clicou_grupo')  as pessoas,
  count(e.id) filter (where e.tipo = 'entrou_grupo_indisponivel')  as bateram_na_porta_fechada,
  max(e.criado_em) filter (where e.tipo = 'clicou_grupo')          as ultimo_clique
from public.municipios m
left join public.eventos e on e.municipio_slug = m.slug
group by m.slug, m.nome
order by cliques desc, m.nome;

-- ───────────────────────────────────────────────────────────────
-- Qual botão trabalha e qual é enfeite.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_origem as
select
  coalesce(origem, 'sem_origem') as origem,
  count(*)                        as cliques,
  count(distinct sessao)          as pessoas
from public.eventos
where tipo = 'clicou_grupo'
group by 1
order by cliques desc;

-- ───────────────────────────────────────────────────────────────
-- Tráfego pago: visita por UTM.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_utm as
select
  coalesce(utm, 'organico')  as utm,
  count(*)                    as visitas,
  count(distinct sessao)      as pessoas,
  count(*) filter (where tipo = 'clicou_grupo') as cliques_grupo
from public.eventos
group by 1
order by visitas desc;

-- ───────────────────────────────────────────────────────────────
-- Celular vs desktop.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_dispositivo as
select
  coalesce(dispositivo, 'desconhecido') as dispositivo,
  count(distinct sessao)                 as pessoas,
  count(*) filter (where tipo = 'clicou_grupo')  as cliques_grupo,
  count(*) filter (where tipo = 'gerou_filtro')  as filtros_gerados
from public.eventos
group by 1
order by pessoas desc;

-- ───────────────────────────────────────────────────────────────
-- Painel de grupos: linha por município já com o que a tela mostra.
-- ───────────────────────────────────────────────────────────────
create or replace view public.painel_grupos as
select
  m.slug           as municipio_slug,
  m.nome           as municipio,
  g.id,
  g.ordem,
  g.link,
  g.status,
  g.fixado,
  g.limite_cliques,
  g.cliques,
  g.observacao,
  g.atualizado_em,
  case
    when g.limite_cliques is null then null
    else round((g.cliques::numeric / g.limite_cliques) * 100, 1)
  end as pct_do_limite
from public.municipios m
left join public.grupos g on g.municipio_slug = m.slug
order by m.nome, g.ordem;

-- Nenhuma destas views é para o navegador.
revoke all on public.metricas_funil_dia,
              public.metricas_por_municipio,
              public.metricas_por_origem,
              public.metricas_por_utm,
              public.metricas_por_dispositivo,
              public.painel_grupos
  from anon, authenticated;
