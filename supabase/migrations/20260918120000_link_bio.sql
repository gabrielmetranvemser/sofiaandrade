-- ═══════════════════════════════════════════════════════════════
-- 0019 · LINK DA BIO
--
-- `/bio` é a página curta que fica na bio do Instagram: uma tarja, um
-- título e uma lista de botões que a campanha monta no painel — grupo
-- da cidade, filtro do 2233, site, Instagram, pedir material, e o que
-- mais precisar na semana.
--
-- Três coisas entram aqui, e as três precisam estar no banco ANTES do
-- deploy do código:
--
--   1. a seção `bio` no painel, senão salvar os botões é recusado;
--   2. o tipo de evento `clicou_bio`, senão o toque não é gravado;
--   3. a coluna `rotulo`, que é o que responde QUAL botão foi tocado.
--
-- ⚠️ A ORDEM IMPORTA, e já custou caro neste projeto: a rota de
--    eventos engole erro de insert de propósito (métrica nunca pode
--    quebrar a página), então um tipo que falta no check some sem
--    ruído nenhum — e o que se perde são justamente os primeiros dias
--    da coisa nova, que são os que decidem se ela fica.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. A seção do painel.
--
-- A lista abaixo é a da migration 0018 mais `bio`.
-- ───────────────────────────────────────────────────────────────
alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','aparencia','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','trilha','futuro','grupos','entrada','bio','filtro','compartilhar',
  'ctaFinal','rodape','privacidade','cookies','exibir'
));

-- ───────────────────────────────────────────────────────────────
-- 2. O tipo de evento.
--
-- ⚠️ NÃO É `clicou_cta`, e a separação é o que salva as duas contas.
--    `clicou_cta` quer dizer "apertou um botão que leva ao grupo" e é
--    o numerador da tela "qual botão trabalha". Metade dos botões da
--    bio não leva a grupo nenhum — leva ao Instagram, a um pedido de
--    material, a outra página. Somados ali dentro, fariam a taxa dos
--    botões de grupo despencar sem que botão nenhum tivesse piorado.
-- ───────────────────────────────────────────────────────────────
alter table public.eventos drop constraint if exists eventos_tipo_valido;

alter table public.eventos add constraint eventos_tipo_valido check (tipo in (
  'pagina_vista','rolou_50','rolou_90',
  'buscou_cidade','usou_localizacao',
  'clicou_cta','clicou_grupo','entrou_grupo_indisponivel',
  'abriu_filtro','subiu_foto','gerou_filtro',
  'baixou_filtro','compartilhou_filtro',
  'compartilhou_pagina','clicou_instagram',
  'saiu_para_whatsapp','whatsapp_nao_abriu',
  'clicou_bio'
));

-- ───────────────────────────────────────────────────────────────
-- 3. QUAL item, quando o tipo sozinho não diz.
--
-- ⚠️ POR QUE NÃO COUBE EM `origem`. `origem` é uma lista fechada de
--    LUGARES do layout — hero, topo, flutuante, cta_final — conferida
--    contra um enum do código. Os botões da bio são criados e apagados
--    pela campanha sem deploy: um enum não acompanha isso, e forçá-los
--    ali significaria um deploy por botão novo.
--
-- ⚠️ TEXTO LIVRE COM TETO, e ele é o texto do botão. Vem da mesma
--    peneira dos outros campos na rota de eventos (aparado em 60,
--    parametrizado pelo cliente do Supabase) e o painel só o exibe.
--    Nulo em todo evento que não é da bio, que é a quase totalidade.
-- ───────────────────────────────────────────────────────────────
alter table public.eventos add column if not exists rotulo text;

comment on column public.eventos.rotulo is
  'Qual item, quando o tipo não diz: hoje, o texto do botão da bio.';

-- ───────────────────────────────────────────────────────────────
-- 4. Qual botão da bio a pessoa usa.
--
-- ⚠️ AGRUPA PELO TEXTO, e o texto muda quando alguém edita o botão no
--    painel. É a escolha certa mesmo assim: o id do item é opaco
--    ("bio-03") e não diz nada a quem lê a tela, e um botão que teve o
--    texto trocado é, para efeito de leitura, outro botão — foi essa a
--    mudança que a campanha quis medir. Quando a linha se parte em
--    duas, a data da última ajuda a entender por quê.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_bio as
select
  coalesce(nullif(trim(rotulo), ''), 'sem nome') as botao,
  count(*)                                       as toques,
  count(distinct sessao)                         as pessoas,
  max(criado_em)                                 as ultimo
from public.eventos
where tipo = 'clicou_bio'
group by 1
order by toques desc, botao;

-- ───────────────────────────────────────────────────────────────
-- 5. O que a bio entrega, por dia.
--
-- ⚠️ SESSÃO, E NÃO EVENTO — mesma regra da view da página de entrada.
--    Quem volta do WhatsApp gera um segundo `pagina_vista`, e contar
--    eventos dobraria o denominador com quem mais se interessou.
--
-- ⚠️ O DESFECHO É POR SESSÃO, e é o único jeito de fechar esta conta.
--    Sem cidade no endereço, o botão do grupo cai na busca, e o
--    `clicou_grupo` que vem depois é gravado com a origem da busca —
--    não com `bio`. Contar por origem perderia a maior parte das
--    entradas que a bio trouxe. Pela sessão, quem chegou pela bio e
--    entrou num grupo aparece, tenha passado por onde tiver passado.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_bio_dia as
with chegadas as (
  select distinct on (e.sessao)
    e.sessao,
    (e.criado_em at time zone 'America/Porto_Velho')::date as dia
  from public.eventos e
  where e.tipo = 'pagina_vista'
    and e.origem = 'bio'
    and e.sessao is not null
  order by e.sessao, e.criado_em
),
desfechos as (
  select
    e.sessao,
    bool_or(e.tipo = 'clicou_bio')     as tocou,
    bool_or(e.tipo = 'clicou_grupo')   as entrou_no_grupo,
    bool_or(e.tipo = 'abriu_filtro')   as abriu_o_filtro
  from public.eventos e
  join chegadas c on c.sessao = e.sessao
  where e.tipo in ('clicou_bio', 'clicou_grupo', 'abriu_filtro')
  group by e.sessao
)
select
  c.dia,
  count(*)                                          as visitas,
  count(*) filter (where d.tocou)                   as tocaram,
  count(*) filter (where d.entrou_no_grupo)         as entraram_no_grupo,
  count(*) filter (where d.abriu_o_filtro)          as abriram_o_filtro,
  round(100.0 * count(*) filter (where d.tocou) / nullif(count(*), 0), 1) as taxa
from chegadas c
left join desfechos d on d.sessao = c.sessao
group by c.dia
order by c.dia desc;

-- A tela abre pelos toques da bio; sem isto é varredura na tabela
-- inteira de eventos a cada abertura.
create index if not exists eventos_bio_rotulo
  on public.eventos (rotulo, criado_em desc)
  where tipo = 'clicou_bio';

-- Como todas as outras: leitura de painel, com service_role.
revoke all on public.metricas_bio, public.metricas_bio_dia from anon, authenticated;
