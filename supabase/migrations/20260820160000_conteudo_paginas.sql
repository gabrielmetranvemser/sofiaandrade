-- ═══════════════════════════════════════════════════════════════
-- 0011 · SEÇÃO `paginas`
--
-- A metadata de /filtro, /grupos e /politica-de-privacidade estava
-- hardcoded em cada `export const metadata`: mudar o título da aba
-- ou o texto do cartão do WhatsApp exigia deploy.
--
-- Seção nova custa uma linha de migration de propósito — o conjunto
-- fechado é o que impede uma ação forjada de criar seção fantasma.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','meta','paginas','navegacao','ctas','hero','origem','problema',
  'valores','provas','futuro','grupos','filtro','compartilhar',
  'ctaFinal','rodape','privacidade'
));
