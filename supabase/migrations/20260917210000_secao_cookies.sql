-- ═══════════════════════════════════════════════════════════════
-- 0018 · SEÇÃO `cookies` NO PAINEL
--
-- O aviso de cookies (17/09) tem os textos editáveis em
-- Painel ▸ Aviso de cookies. Sem a seção nesta lista, salvar dá
-- "violates check constraint conteudo_secao_conhecida" — ver 0014.
-- A lista abaixo é a de 0017 mais `cookies`.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','aparencia','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','trilha','futuro','grupos','entrada','filtro','compartilhar',
  'ctaFinal','rodape','privacidade','cookies','exibir'
));
