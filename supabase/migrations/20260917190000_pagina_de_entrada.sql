-- ═══════════════════════════════════════════════════════════════
-- 0017 · PÁGINA DE ENTRADA
--
-- Em 17/09 o tráfego de anúncio com cidade deixou de cair na home e
-- passou a cair na página de entrada (`/grupos?cidade=`). A troca tem
-- uma regra de parada: se a página nova converter menos que a home,
-- volta. Para isso o painel precisa responder, por dia:
--
--   · quantas pessoas de celular o anúncio trouxe para cada página;
--   · quantas tocaram para entrar no grupo;
--   · quantas saíram de fato para o WhatsApp, e quantas travaram.
--
-- Também libera a seção `entrada` no painel, para a campanha editar os
-- textos da página nova sem deploy.
--
-- Nenhuma coluna nova. A página em que o anúncio caiu já vem em
-- `origem` do `pagina_vista` (`anuncio` = home, `lp` = entrada), e os
-- dois desfechos depois do toque são tipos novos de evento.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- Os dois tipos novos.
--
--   saiu_para_whatsapp  → depois do toque, a página saiu da tela
--   whatsapp_nao_abriu  → seis segundos depois, continuava na tela
--
-- ⚠️ ANTES DO DEPLOY DO CÓDIGO. Sem eles na lista, o insert falha em
--    silêncio (a rota de eventos engole o erro de propósito) e os
--    primeiros dias da página nova ficam sem o dado que decide se ela
--    fica.
-- ───────────────────────────────────────────────────────────────
alter table public.eventos drop constraint if exists eventos_tipo_valido;

alter table public.eventos add constraint eventos_tipo_valido check (tipo in (
  'pagina_vista','rolou_50','rolou_90',
  'buscou_cidade','usou_localizacao',
  'clicou_cta','clicou_grupo','entrou_grupo_indisponivel',
  'abriu_filtro','subiu_foto','gerou_filtro',
  'baixou_filtro','compartilhou_filtro',
  'compartilhou_pagina','clicou_instagram',
  'saiu_para_whatsapp','whatsapp_nao_abriu'
));

-- ───────────────────────────────────────────────────────────────
-- A seção `entrada` no painel.
--
-- ⚠️ SEM ISTO O PAINEL RECUSA O SALVAMENTO com "violates check
--    constraint conteudo_secao_conhecida" — foi exatamente o que
--    aconteceu com `trilha` e `aparencia` (ver migration 0014). A lista
--    abaixo é a de 0014 mais `entrada`.
-- ───────────────────────────────────────────────────────────────
alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','aparencia','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','trilha','futuro','grupos','entrada','filtro','compartilhar',
  'ctaFinal','rodape','privacidade','exibir'
));

-- ───────────────────────────────────────────────────────────────
-- Uma linha por dia × página em que o anúncio caiu.
--
-- ⚠️ SÓ CELULAR, e não é descuido. É onde está o anúncio, e é o que
--    separa gente do robô que inflou os números até 16/09 — ele usava
--    computador. Os eventos novos já chegam filtrados (ver
--    lib/trafego/robo.ts); o histórico, não.
--
-- ⚠️ SESSÃO, E NÃO EVENTO. A mesma pessoa que volta do WhatsApp gera um
--    segundo `pagina_vista`; contar eventos dobraria o denominador de
--    quem mais se interessou. A chegada é o PRIMEIRO `pagina_vista` da
--    sessão com cidade de anúncio.
--
-- O toque é o `clicou_grupo` gravado pelo redirecionador na mesma
-- sessão. Toque dado antes de a página terminar de carregar chega sem
-- sessão e fica de fora — a taxa aqui é, se algo, um pouco menor que a
-- real.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_pagina_de_entrada as
with chegadas as (
  select distinct on (e.sessao)
    e.sessao,
    e.origem                                                  as pagina,
    (e.criado_em at time zone 'America/Porto_Velho')::date    as dia
  from public.eventos e
  where e.tipo = 'pagina_vista'
    and e.origem in ('anuncio', 'lp')
    and e.sessao is not null
    and e.dispositivo = 'celular'
  order by e.sessao, e.criado_em
),
desfechos as (
  select
    e.sessao,
    bool_or(e.tipo = 'clicou_grupo')        as tocou,
    bool_or(e.tipo = 'saiu_para_whatsapp')  as saiu,
    bool_or(e.tipo = 'whatsapp_nao_abriu')  as travou
  from public.eventos e
  join chegadas c on c.sessao = e.sessao
  where e.tipo in ('clicou_grupo', 'saiu_para_whatsapp', 'whatsapp_nao_abriu')
  group by e.sessao
)
select
  c.dia,
  c.pagina,
  count(*)                                              as visitas,
  count(*) filter (where d.tocou)                       as tocaram,
  count(*) filter (where d.saiu)                        as sairam_para_whatsapp,
  count(*) filter (where d.travou)                      as whatsapp_nao_abriu,
  round(100.0 * count(*) filter (where d.tocou) / nullif(count(*), 0), 1) as taxa
from chegadas c
left join desfechos d on d.sessao = c.sessao
group by c.dia, c.pagina
order by c.dia desc, c.pagina;

-- A view junta por sessão; sem isto é varredura na tabela inteira a
-- cada abertura do painel.
create index if not exists eventos_sessao_data
  on public.eventos (sessao, criado_em)
  where sessao is not null;

-- Como todas as outras: leitura de painel, com service_role.
revoke all on public.metricas_pagina_de_entrada from anon, authenticated;
