-- ═══════════════════════════════════════════════════════════════
-- 0001 · ESQUEMA
-- Sofia Andrade 2233 — LP de campanha
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────────
-- municipios · os 52 de Rondônia. Tabela estável, quase só leitura.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.municipios (
  slug       text primary key,
  nome       text not null,
  latitude   numeric(9,6) not null,
  longitude  numeric(9,6) not null,
  criado_em  timestamptz not null default now(),

  constraint municipios_slug_formato check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint municipios_lat_valida  check (latitude between -90 and 90),
  constraint municipios_lon_valida  check (longitude between -180 and 180)
);

comment on table public.municipios is
  'Os 52 municípios de Rondônia. Coordenadas usadas para achar a sede mais próxima no aparelho da pessoa.';

-- ───────────────────────────────────────────────────────────────
-- grupos · vários por município, numerados por ordem.
-- O campo `link` é o segredo do projeto: se vazar, raspam os 52.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.grupos (
  id             uuid primary key default gen_random_uuid(),
  municipio_slug text not null references public.municipios(slug) on delete cascade,
  ordem          smallint not null default 1,
  link           text,
  status         text not null default 'em_breve',
  fixado         boolean not null default false,
  limite_cliques integer,
  cliques        integer not null default 0,
  observacao     text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),

  constraint grupos_status_valido
    check (status in ('aberto','em_breve','cheio','desativado')),
  constraint grupos_ordem_positiva
    check (ordem >= 1),
  constraint grupos_cliques_nao_negativo
    check (cliques >= 0),
  constraint grupos_limite_positivo
    check (limite_cliques is null or limite_cliques > 0),
  -- Um grupo só pode ficar 'aberto' se tiver link de WhatsApp de verdade.
  -- Isto é o que impede o redirecionador de mandar a pessoa para lugar nenhum.
  constraint grupos_aberto_exige_link
    check (status <> 'aberto' or link ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9]+'),

  unique (municipio_slug, ordem)
);

comment on column public.grupos.link is
  'NUNCA exposto ao navegador. Lido só no servidor, em /g/[slug], com service_role.';
comment on column public.grupos.limite_cliques is
  'Clique não é entrada. Começar em ~700 e calibrar comparando com membros reais.';

-- Só um fixado por município.
create unique index if not exists grupos_um_fixado_por_municipio
  on public.grupos (municipio_slug)
  where fixado;

-- FK indexada: acelera o join e o ON DELETE CASCADE.
create index if not exists grupos_municipio_ordem
  on public.grupos (municipio_slug, ordem);

-- ───────────────────────────────────────────────────────────────
-- eventos · o funil inteiro numa tabela só.
-- Genérica de propósito: tipo novo não pede migration nova.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.eventos (
  id             bigint generated always as identity primary key,
  tipo           text not null,
  municipio_slug text,
  grupo_id       uuid,
  origem         text,
  utm            text,
  sessao         text,
  dispositivo    text,
  criado_em      timestamptz not null default now(),

  constraint eventos_tipo_valido check (tipo in (
    'pagina_vista','rolou_50','rolou_90',
    'buscou_cidade','usou_localizacao',
    'clicou_grupo','entrou_grupo_indisponivel',
    'abriu_filtro','subiu_foto','gerou_filtro',
    'baixou_filtro','compartilhou_filtro',
    'compartilhou_pagina','clicou_instagram'
  )),
  constraint eventos_dispositivo_valido
    check (dispositivo is null or dispositivo in ('celular','desktop'))
);

comment on table public.eventos is
  'Sem nome, sem telefone, sem IP. `sessao` é aleatório e some quando a aba fecha.';

-- Sem FK em grupo_id de propósito: evento é histórico e precisa
-- sobreviver ao grupo ser apagado no painel.

create index if not exists eventos_tipo_data
  on public.eventos (tipo, criado_em desc);

create index if not exists eventos_municipio_data
  on public.eventos (municipio_slug, criado_em desc)
  where municipio_slug is not null;

-- Índice parcial: o painel pergunta "qual botão trabalha" só sobre cliques.
create index if not exists eventos_clique_origem
  on public.eventos (origem, criado_em desc)
  where tipo = 'clicou_grupo';

create index if not exists eventos_data
  on public.eventos (criado_em desc);

-- ───────────────────────────────────────────────────────────────
-- administradores · quem pode entrar no painel.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.administradores (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  nome      text,
  criado_em timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────────
-- atualizado_em automático
-- ───────────────────────────────────────────────────────────────
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists grupos_atualizado_em on public.grupos;
create trigger grupos_atualizado_em
  before update on public.grupos
  for each row execute function public.tocar_atualizado_em();
