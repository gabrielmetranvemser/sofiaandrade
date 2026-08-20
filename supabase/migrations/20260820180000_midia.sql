-- ═══════════════════════════════════════════════════════════════
-- 0012 · MÍDIA
--
-- Um SLOT é um lugar da página que aceita imagem, com chave estável
-- (`hero.retrato`, `provas.entrega.1`). Os slots vivem em CÓDIGO
-- (content/slots.ts), não aqui: um slot só existe se algum componente
-- o renderiza. Adicionar slot é mudança de layout. Trocar a imagem do
-- slot é ação do admin. O banco guarda a LIGAÇÃO.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.midia (
  id        uuid primary key default gen_random_uuid(),
  balde     text not null default 'midia',
  caminho   text not null,
  largura   integer not null,
  altura    integer not null,
  bytes     integer not null,
  tem_alpha boolean not null default false,
  blur      text,
  -- sha256 do ORIGINAL: reenviar o mesmo arquivo é no-op.
  hash      text not null,
  texto_alt text,
  criado_em timestamptz not null default now(),

  unique (balde, caminho),
  unique (balde, hash),
  constraint midia_dimensoes  check (largura > 0 and altura > 0),
  -- O blur viaja no HTML a cada render. Se crescer, vira peso morto.
  constraint midia_blur_curto check (blur is null or length(blur) < 4096)
);

comment on column public.midia.hash is
  'Do arquivo ORIGINAL. O caminho no Storage é derivado dele, então trocar a imagem nunca invalida o cache da antiga.';

-- Duas tabelas e não uma: a mesma imagem pode servir vários slots,
-- desfazer é RELIGAR o slot à mídia anterior (o arquivo precisa
-- sobreviver à ligação), e apagar ligação não pode apagar arquivo.
create table if not exists public.midia_slots (
  slot           text primary key,
  midia_id       uuid not null references public.midia(id) on delete restrict,
  texto_alt      text,
  atualizado_em  timestamptz not null default now(),
  atualizado_por text
);

alter table public.midia       enable row level security;
alter table public.midia_slots enable row level security;

revoke all on table public.midia, public.midia_slots from anon, authenticated;

drop policy if exists midia_le_admin on public.midia;
create policy midia_le_admin on public.midia
  for select to authenticated using ((select private.eh_admin()));

drop policy if exists midia_slots_le_admin on public.midia_slots;
create policy midia_slots_le_admin on public.midia_slots
  for select to authenticated using ((select private.eh_admin()));

grant select on table public.midia, public.midia_slots to authenticated;

-- ───────────────────────────────────────────────────────────────
-- Baldes
--
-- Dois, e a razão não é organização: é fronteira de validação.
-- `molduras` guarda imagens COMPOSTAS na foto da pessoa — dimensão
-- exata obrigatória, alpha obrigatório, CNPJ da campanha exigido por
-- lei. Upload errado ali quebra uma funcionalidade para todo mundo,
-- não estraga uma foto.
--
-- Públicos porque são material de campanha público. Balde privado
-- forçaria URL assinada que expira, quebrando o cache do next/image
-- e o robô de prévia do WhatsApp.
-- ───────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('midia',    'midia',    true, 10485760, array['image/webp','image/png','image/jpeg']),
  ('molduras', 'molduras', true,  5242880, array['image/webp','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Escrita: NENHUMA policy. Sem policy = sem acesso para anon e
-- authenticated. Toda escrita passa pelo servidor com service_role,
-- igual a `eventos`. É intencional.
--
-- ⚠️ Leitura: com public = true o Storage serve /object/public/… SEM
--    consultar RLS. A policy abaixo só vale para a API autenticada.
--    Não confunda com proteção.
drop policy if exists midia_leitura_publica on storage.objects;
create policy midia_leitura_publica on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('midia', 'molduras'));
