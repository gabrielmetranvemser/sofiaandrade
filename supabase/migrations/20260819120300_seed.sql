-- ═══════════════════════════════════════════════════════════════
-- 0004 · SEED
--
-- Os 52 municípios de Rondônia e um grupo 'em breve' para cada um.
-- Idempotente: pode rodar de novo sem duplicar nada.
--
-- ⚠️ Coordenadas: testar 5 municípios distantes entre si antes de
--    subir (Porto Velho, Vilhena, Guajará-Mirim, Ji-Paraná, Cabixi).
--    Erro aqui é silencioso — ninguém reclama, a pessoa só não entra.
-- ═══════════════════════════════════════════════════════════════

insert into public.municipios (slug, nome, latitude, longitude) values
  ('alta-floresta-doeste', 'Alta Floresta d''Oeste', -11.928300, -61.995300),
  ('alto-alegre-dos-parecis', 'Alto Alegre dos Parecis', -12.131900, -61.849700),
  ('alto-paraiso', 'Alto Paraíso', -9.713900, -63.318600),
  ('alvorada-doeste', 'Alvorada d''Oeste', -11.762500, -62.283600),
  ('ariquemes', 'Ariquemes', -9.913300, -63.040800),
  ('buritis', 'Buritis', -10.207800, -63.829400),
  ('cabixi', 'Cabixi', -13.496400, -60.552800),
  ('cacaulandia', 'Cacaulândia', -10.335800, -62.913900),
  ('cacoal', 'Cacoal', -11.438600, -61.447200),
  ('campo-novo-de-rondonia', 'Campo Novo de Rondônia', -10.572200, -63.628900),
  ('candeias-do-jamari', 'Candeias do Jamari', -8.786900, -63.700300),
  ('castanheiras', 'Castanheiras', -11.438600, -61.946900),
  ('cerejeiras', 'Cerejeiras', -13.189700, -60.816100),
  ('chupinguaia', 'Chupinguaia', -12.558300, -60.896700),
  ('colorado-do-oeste', 'Colorado do Oeste', -13.117200, -60.545300),
  ('corumbiara', 'Corumbiara', -12.957800, -60.894400),
  ('costa-marques', 'Costa Marques', -12.443600, -64.227800),
  ('cujubim', 'Cujubim', -9.363900, -62.585000),
  ('espigao-doeste', 'Espigão d''Oeste', -11.522500, -61.011400),
  ('governador-jorge-teixeira', 'Governador Jorge Teixeira', -10.604200, -62.731700),
  ('guajara-mirim', 'Guajará-Mirim', -10.782800, -65.339400),
  ('itapua-do-oeste', 'Itapuã do Oeste', -9.195300, -63.178600),
  ('jaru', 'Jaru', -10.438600, -62.466400),
  ('ji-parana', 'Ji-Paraná', -10.885300, -61.951700),
  ('machadinho-doeste', 'Machadinho d''Oeste', -9.443300, -61.980300),
  ('ministro-andreazza', 'Ministro Andreazza', -11.195300, -61.522800),
  ('mirante-da-serra', 'Mirante da Serra', -11.030800, -62.671700),
  ('monte-negro', 'Monte Negro', -10.256900, -63.291400),
  ('nova-brasilandia-doeste', 'Nova Brasilândia d''Oeste', -11.724700, -62.315300),
  ('nova-mamore', 'Nova Mamoré', -10.411400, -65.334700),
  ('nova-uniao', 'Nova União', -10.907500, -62.551400),
  ('novo-horizonte-do-oeste', 'Novo Horizonte do Oeste', -11.708900, -61.995000),
  ('ouro-preto-do-oeste', 'Ouro Preto do Oeste', -10.716700, -62.250000),
  ('parecis', 'Parecis', -12.187500, -61.606900),
  ('pimenta-bueno', 'Pimenta Bueno', -11.672500, -61.193600),
  ('pimenteiras-do-oeste', 'Pimenteiras do Oeste', -13.481100, -61.045300),
  ('porto-velho', 'Porto Velho', -8.761900, -63.903900),
  ('presidente-medici', 'Presidente Médici', -11.175600, -61.901400),
  ('primavera-de-rondonia', 'Primavera de Rondônia', -11.827200, -61.311100),
  ('rio-crespo', 'Rio Crespo', -9.693900, -62.900600),
  ('rolim-de-moura', 'Rolim de Moura', -11.727500, -61.775600),
  ('santa-luzia-doeste', 'Santa Luzia d''Oeste', -11.907500, -61.781700),
  ('sao-felipe-doeste', 'São Felipe d''Oeste', -11.901700, -61.493300),
  ('sao-francisco-do-guapore', 'São Francisco do Guaporé', -12.051700, -63.568600),
  ('sao-miguel-do-guapore', 'São Miguel do Guaporé', -11.692800, -62.712800),
  ('seringueiras', 'Seringueiras', -11.790800, -63.029400),
  ('teixeiropolis', 'Teixeirópolis', -10.915300, -62.254400),
  ('theobroma', 'Theobroma', -10.246900, -62.354200),
  ('urupa', 'Urupá', -11.125800, -62.362800),
  ('vale-do-anari', 'Vale do Anari', -9.862200, -62.180600),
  ('vale-do-paraiso', 'Vale do Paraíso', -10.447200, -62.128900),
  ('vilhena', 'Vilhena', -12.740600, -60.145800)
on conflict (slug) do update
  set nome = excluded.nome,
      latitude = excluded.latitude,
      longitude = excluded.longitude;

-- Um grupo por município, fixado, aguardando o link da campanha.
-- Limite inicial em 700: clique não é entrada, e 1024 chega com o
-- grupo bem vazio. Calibrar depois da primeira semana comparando
-- cliques com o número real de membros.
insert into public.grupos (municipio_slug, ordem, status, fixado, limite_cliques)
select slug, 1, 'em_breve', true, 700
from public.municipios
on conflict (municipio_slug, ordem) do nothing;
