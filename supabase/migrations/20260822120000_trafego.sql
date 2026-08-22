-- ═══════════════════════════════════════════════════════════════
-- 0015 · TRÁFEGO — Meta Pixel, Conversions API e GTM
--
-- ⚠️ POR QUE UMA TABELA PRÓPRIA, E NÃO MAIS UMA SEÇÃO EM `conteudo`.
--
--    Porque aqui mora um SEGREDO. O token da Conversions API dá a
--    quem o tiver o direito de escrever eventos no pixel da campanha,
--    e `conteudo` é versionado: cada salvamento copia a linha inteira
--    para `conteudo_versoes`, para sempre. O token entraria no
--    histórico em texto puro e continuaria lá depois de trocado —
--    justamente o que não se faz com credencial.
--
--    Aqui não há gatilho de versão. Trocar o token apaga o anterior,
--    que é o comportamento certo para uma credencial.
--
-- ⚠️ UMA LINHA SÓ, e a trava é o tipo da chave primária: `id` é
--    boolean com `check (id)`, então o único valor aceito é `true`.
--    É a forma mais barata de dizer "singleton" em Postgres — sem
--    isso, um upsert errado criaria uma segunda configuração de
--    tráfego e o site passaria a escolher uma delas por sorte.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.trafego (
  id                       boolean primary key default true check (id),

  -- Público: desce para o navegador dentro do script do pixel.
  meta_pixel_id            text,
  -- Público: o container do Tag Manager.
  gtm_id                   text,
  -- Público: vira <meta name="facebook-domain-verification">.
  meta_dominio             text,

  -- ⚠️ SEGREDO. Nunca atravessa a fronteira servidor→navegador.
  --    Só `lib/trafego/ler.ts` o lê, e só para falar com a Graph API.
  meta_capi_token          text,
  -- Código de teste do Gerenciador de Eventos. Com ele preenchido os
  -- eventos aparecem em "Eventos de teste" e NÃO contam como
  -- conversão — por isso ele precisa ser esvaziado depois do teste.
  meta_capi_teste          text,
  -- A versão da Graph API. Editável de propósito: a Meta aposenta
  -- versão a cada ~2 anos, e quando a atual morrer o conserto não
  -- pode depender de um deploy.
  meta_api_versao          text not null default 'v21.0',
  -- Interruptor geral do envio pelo servidor.
  capi_ativa               boolean not null default true,

  atualizado_por           text,
  atualizado_em            timestamptz not null default now()
);

comment on table public.trafego is
  'Configuração de rastreamento. Uma linha só. Contém credencial: nunca exponha ao navegador.';

-- ───────────────────────────────────────────────────────────────
-- SEGURANÇA — mesmo modelo de `conteudo`: nada no navegador consulta
-- esta tabela. O servidor lê com service_role.
-- ───────────────────────────────────────────────────────────────

alter table public.trafego enable row level security;

revoke all on table public.trafego from anon, authenticated;

drop policy if exists trafego_le_admin on public.trafego;
create policy trafego_le_admin on public.trafego
  for select to authenticated using ((select private.eh_admin()));

drop policy if exists trafego_insere_admin on public.trafego;
create policy trafego_insere_admin on public.trafego
  for insert to authenticated with check ((select private.eh_admin()));

drop policy if exists trafego_atualiza_admin on public.trafego;
create policy trafego_atualiza_admin on public.trafego
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

grant select, insert, update on table public.trafego to authenticated;
