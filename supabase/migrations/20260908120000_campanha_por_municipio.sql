-- ═══════════════════════════════════════════════════════════════
-- 0016 · TRÁFEGO POR MUNICÍPIO
--
-- A campanha passou a rodar um conjunto de anúncios por cidade,
-- cada um apontando para `…/?cidade=<slug>`. Isso cria duas
-- perguntas que o painel ainda não sabia responder:
--
--   1. quantas pessoas o anúncio de Vilhena trouxe?
--   2. dessas, quantas entraram no grupo de Vilhena?
--
-- Sem as duas juntas não existe taxa de conversão por município —
-- e é ela que decide onde a verba continua e onde ela para.
--
-- Nenhuma coluna nova: `origem`, `utm` e `municipio_slug` já
-- existem. O que faltava era o evento de chegada carregar a cidade
-- (agora carrega, ver components/site/RegistroDePagina.tsx) e o
-- evento de saída carregar o UTM (agora carrega, ver proxy.ts e
-- app/g/[slug]/route.ts).
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- Uma linha por campanha × município.
--
-- `where utm is not null` é o recorte: esta view é sobre tráfego
-- PAGO. Visita orgânica não tem rótulo de campanha e não deve
-- diluir a conta de quem custou dinheiro.
--
-- `entradas` conta `clicou_grupo` do MESMO utm e do MESMO
-- município. Como o cookie de chegada carrega o utm até a saída,
-- as duas pontas do funil finalmente falam o mesmo idioma — antes
-- a entrada em grupo chegava sem utm nenhum e caía toda na linha
-- "orgânico", com o número parecendo certo.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_campanha as
select
  e.utm,
  e.municipio_slug,
  m.nome                                                        as municipio,
  count(*) filter (where e.tipo = 'pagina_vista')               as visitas,
  count(distinct e.sessao)                                      as pessoas,
  count(*) filter (where e.tipo = 'clicou_grupo')               as entradas,
  count(*) filter (where e.tipo = 'entrou_grupo_indisponivel')  as porta_fechada,
  max(e.criado_em)                                              as ultimo
from public.eventos e
left join public.municipios m on m.slug = e.municipio_slug
where e.utm is not null
  -- ⚠️ SÓ OS TIPOS QUE ESTA TELA CONTA. `rolou_50` e `clicou_cta`
  --    também carregam utm, mas nunca carregam município — e a
  --    agrupação por (utm, município) os jogaria todos numa linha
  --    fantasma "sem cidade", com zero visitas e zero entradas, ao lado
  --    das linhas de verdade. Linha que não soma nada e ainda ocupa o
  --    topo da lista é ruído com aparência de dado.
  and e.tipo in ('pagina_vista', 'clicou_grupo', 'entrou_grupo_indisponivel')
group by e.utm, e.municipio_slug, m.nome
order by entradas desc, visitas desc;

-- A tela de tráfego pago varre por utm; sem isto é sequencial na
-- tabela inteira de eventos, que é a que mais cresce no projeto.
create index if not exists eventos_utm_data
  on public.eventos (utm, criado_em desc)
  where utm is not null;

-- Como todas as outras: leitura de painel, com service_role.
revoke all on public.metricas_por_campanha from anon, authenticated;
