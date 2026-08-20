-- ═══════════════════════════════════════════════════════════════
-- 0010 · CONTEÚDO EDITÁVEL
--
-- `content/copy.ts` continua sendo a VERDADE PADRÃO. Esta tabela
-- guarda só o que foi editado — override esparso, nunca cópia.
--
-- Banco vazio = site idêntico ao de hoje. Isso é requisito, não
-- consequência: NADA aqui é semeado por migration. Semear congelaria
-- a copy no dia do deploy, e toda melhoria posterior em copy.ts
-- deixaria de aparecer, em silêncio.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.conteudo (
  secao          text primary key,
  dados          jsonb not null default '{}'::jsonb,
  versao         integer not null default 1,
  atualizado_por text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),

  -- Conjunto fechado, espelhando as chaves de content/copy.ts.
  -- Impede que uma ação forjada crie seção fantasma. Seção nova
  -- custa uma linha de migration, o que é raro e é o certo.
  --
  -- ⚠️ 'ctaFinal' está em camelCase porque é VALOR de texto, não
  --    identificador — o Postgres não faz folding aqui. Não
  --    "conserte" para cta_final: quebra o mapeamento direto com a
  --    chave do TypeScript.
  constraint conteudo_secao_conhecida check (secao in (
    'candidata','meta','navegacao','ctas','hero','origem','problema',
    'valores','provas','futuro','grupos','filtro','compartilhar',
    'ctaFinal','rodape','privacidade'
  )),
  constraint conteudo_dados_objeto  check (jsonb_typeof(dados) = 'object'),
  -- Teto por seção. Barra payload absurdo vindo de ação forjada.
  constraint conteudo_dados_tamanho check (pg_column_size(dados) < 262144)
);

comment on table public.conteudo is
  'Override esparso sobre content/copy.ts. Linha ausente = seção 100% padrão.';

-- ───────────────────────────────────────────────────────────────
-- Histórico. Append-only, nunca destrutivo.
--
-- Guarda a imagem NOVA (não a antiga) porque a lista do painel
-- precisa mostrar "o que este salvamento produziu". Desfazer é
-- escrever a versão N de volta, o que gera a versão N+1.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.conteudo_versoes (
  id        bigint generated always as identity primary key,
  secao     text not null references public.conteudo(secao) on delete cascade,
  versao    integer not null,
  dados     jsonb not null,
  autor     text,
  criado_em timestamptz not null default now(),
  unique (secao, versao)
);

create index if not exists conteudo_versoes_secao_data
  on public.conteudo_versoes (secao, criado_em desc);

-- ───────────────────────────────────────────────────────────────
-- ⚠️ SÃO DOIS GATILHOS, e não dá para juntar:
--    `new.versao` só pode ser alterado em BEFORE; a linha só existe
--    para ser copiada em AFTER. Tentar fazer os dois num só custa
--    meia tarde até a ficha cair.
-- ───────────────────────────────────────────────────────────────
create or replace function public.tocar_versao_conteudo()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.versao := old.versao + 1;
  new.atualizado_em := now();
  return new;
end $$;

drop trigger if exists conteudo_bump_versao on public.conteudo;
create trigger conteudo_bump_versao
  before update on public.conteudo
  for each row when (old.dados is distinct from new.dados)
  execute function public.tocar_versao_conteudo();

create or replace function public.registrar_versao_conteudo()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.conteudo_versoes (secao, versao, dados, autor)
  values (new.secao, new.versao, new.dados, new.atualizado_por);
  return null;
end $$;

drop trigger if exists conteudo_versiona_insert on public.conteudo;
create trigger conteudo_versiona_insert
  after insert on public.conteudo
  for each row execute function public.registrar_versao_conteudo();

-- A condição evita versão-lixo quando alguém aperta Salvar duas
-- vezes sem ter mudado nada.
drop trigger if exists conteudo_versiona_update on public.conteudo;
create trigger conteudo_versiona_update
  after update on public.conteudo
  for each row when (old.dados is distinct from new.dados)
  execute function public.registrar_versao_conteudo();

-- ═══════════════════════════════════════════════════════════════
-- SEGURANÇA
--
-- Diferente de `municipios` (leitura pública) DE PROPÓSITO: nada no
-- navegador consulta conteúdo direto. O servidor lê com service_role
-- e entrega já renderizado. Mesmo modelo de `eventos`.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo         enable row level security;
alter table public.conteudo_versoes enable row level security;

revoke all on table public.conteudo         from anon, authenticated;
revoke all on table public.conteudo_versoes from anon, authenticated;

-- Rede embaixo do trapézio para quando o painel migrar de senha
-- única para Supabase Auth.
drop policy if exists conteudo_le_admin on public.conteudo;
create policy conteudo_le_admin on public.conteudo
  for select to authenticated using ((select private.eh_admin()));

drop policy if exists conteudo_insere_admin on public.conteudo;
create policy conteudo_insere_admin on public.conteudo
  for insert to authenticated with check ((select private.eh_admin()));

drop policy if exists conteudo_atualiza_admin on public.conteudo;
create policy conteudo_atualiza_admin on public.conteudo
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Sem policy de DELETE: "voltar ao original" é update … set dados = '{}',
-- não delete. Preserva o histórico.

drop policy if exists conteudo_versoes_le_admin on public.conteudo_versoes;
create policy conteudo_versoes_le_admin on public.conteudo_versoes
  for select to authenticated using ((select private.eh_admin()));

grant select, insert, update on table public.conteudo         to authenticated;
grant select                 on table public.conteudo_versoes to authenticated;
