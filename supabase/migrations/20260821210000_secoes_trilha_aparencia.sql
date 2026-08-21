-- ═══════════════════════════════════════════════════════════════
-- 0014 · SEÇÕES NOVAS: trilha e aparência
--
-- ⚠️ A LISTA DE SEÇÕES VIVE EM DOIS LUGARES, e este é o segundo. O
--    primeiro é `content/copy.ts`, que é a verdade; aqui a trava só
--    confere que ninguém grave uma seção inventada por ação forjada.
--
--    O custo de ter duas listas apareceu na prática: `trilha` e
--    `aparencia` nasceram no código e o painel recusou o salvamento
--    com "violates check constraint conteudo_secao_conhecida" — uma
--    mensagem de Postgres na cara de quem só queria arrastar um
--    controle de textura.
--
--    Mantive a trava mesmo assim. Ela é a última linha entre um
--    payload adulterado e uma linha órfã no banco, e o preço de
--    esquecê-la é uma migração — não um vazamento.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','aparencia','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','trilha','futuro','grupos','filtro','compartilhar',
  'ctaFinal','rodape','privacidade','exibir'
));
