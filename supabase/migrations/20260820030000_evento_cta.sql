-- ═══════════════════════════════════════════════════════════════
-- 0005 · SEPARA "CLICOU NO CTA" DE "ENTROU NO GRUPO"
--
-- Os botões do hero, topo, flutuante e CTA final não levam a
-- grupo nenhum: eles rolam a tela até a lista. Gravar isso como
-- `clicou_grupo` fazia o painel dizer que o hero converte quando
-- ele só rolou a página — e era justamente a pergunta que o
-- painel existe para responder.
--
-- Agora:
--   clicou_cta    → apertou um botão que leva à lista
--   clicou_grupo  → saiu de fato para o WhatsApp (só o servidor grava)
-- ═══════════════════════════════════════════════════════════════

alter table public.eventos drop constraint if exists eventos_tipo_valido;

alter table public.eventos add constraint eventos_tipo_valido check (tipo in (
  'pagina_vista','rolou_50','rolou_90',
  'buscou_cidade','usou_localizacao',
  'clicou_cta','clicou_grupo','entrou_grupo_indisponivel',
  'abriu_filtro','subiu_foto','gerou_filtro',
  'baixou_filtro','compartilhou_filtro',
  'compartilhou_pagina','clicou_instagram'
));

-- Índice parcial para a tela "qual botão trabalha".
create index if not exists eventos_cta_origem
  on public.eventos (origem, criado_em desc)
  where tipo = 'clicou_cta';

-- ───────────────────────────────────────────────────────────────
-- O funil ganha a etapa intermediária.
--
-- `create or replace view` não renomeia nem reordena coluna — a view
-- precisa cair e nascer de novo. São views de leitura, sem dado
-- próprio: derrubar não perde nada.
-- ───────────────────────────────────────────────────────────────
drop view if exists public.metricas_funil_dia;
create view public.metricas_funil_dia as
select
  (criado_em at time zone 'America/Porto_Velho')::date as dia,
  count(*) filter (where tipo = 'pagina_vista')          as viram_pagina,
  count(*) filter (where tipo = 'rolou_50')              as rolaram_metade,
  count(*) filter (where tipo = 'rolou_90')              as rolaram_fim,
  count(*) filter (where tipo = 'buscou_cidade')         as buscaram_cidade,
  count(*) filter (where tipo = 'usou_localizacao')      as usaram_gps,
  count(*) filter (where tipo = 'clicou_cta')            as clicaram_cta,
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
-- "Qual botão trabalha" passa a comparar as duas pontas:
-- quantos apertaram o botão × quantos realmente entraram.
-- ───────────────────────────────────────────────────────────────
drop view if exists public.metricas_por_origem;
create view public.metricas_por_origem as
select
  coalesce(origem, 'sem_origem')                    as origem,
  count(*) filter (where tipo = 'clicou_cta')       as cliques_no_botao,
  count(*) filter (where tipo = 'clicou_grupo')     as entradas_em_grupo,
  count(distinct sessao) filter (where tipo = 'clicou_grupo') as pessoas
from public.eventos
where tipo in ('clicou_cta','clicou_grupo')
group by 1
order by entradas_em_grupo desc, cliques_no_botao desc;

revoke all on public.metricas_funil_dia, public.metricas_por_origem
  from anon, authenticated;
