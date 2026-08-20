-- ═══════════════════════════════════════════════════════════════
-- 0013 · SEÇÕES `album`, `rua`, `social`, `exibir` — e o conserto de `faixa` e `cena`
--
-- Seção nova custa uma linha de migration de propósito: o conjunto
-- fechado é o que impede uma ação forjada de criar seção fantasma.
--
-- Três seções entram com a estrutura de fotos:
--
--   album   o acervo de família — oito fotos de papel
--   rua     a prova visual da manchete ("eu fui pra rua")
--   social  prova social: comentários, ataques e processos vencidos
--   exibir  os interruptores de visibilidade de cada seção
--
-- ⚠️ E DUAS QUE JÁ DEVIAM ESTAR AQUI. `faixa` e `cena` existem em
--    content/copy.ts e em content/esquema.ts desde que foram criadas,
--    então o painel sempre ofereceu as duas para edição — mas nunca
--    entraram nesta lista. Quem tentasse salvar qualquer uma das duas
--    levava violação de constraint, com a mensagem crua do Postgres.
--    Ninguém tinha editado ainda; por isso passou.
--
-- A lista abaixo é o espelho de PADRAO em content/copy.ts. As duas
-- precisam andar juntas: acrescentar seção no arquivo sem acrescentar
-- aqui produz exatamente o defeito de `faixa` e `cena`.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','futuro','grupos','filtro','compartilhar','ctaFinal',
  'rodape','privacidade','exibir'
));
