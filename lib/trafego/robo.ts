import type { NextRequest } from 'next/server'

/**
 * QUEM NÃO É GENTE, E QUEM É DA CASA.
 *
 * ⚠️ O PAINEL CONTAVA 948 ENTRADAS EM GRUPO QUANDO ERAM 222. A conta
 *    de 17/09 separou duas fontes de clique falso:
 *
 *    · 237 cliques de um robô. Computador, toque 13–15 s depois de a
 *      página carregar, cidades aleatórias, em rajadas minutos depois
 *      de um anúncio ser publicado ou editado. Tudo indica a revisão
 *      automática da Meta.
 *    · 489 cliques da equipe. O mesmo navegador tocando em cinco ou
 *      mais cidades — um deles 288 vezes em 26 dias.
 *
 *    Cada um desses somava no limite de 700 do grupo e mandava um
 *    `Lead` para a Meta. Otimizar anúncio para Lead com esse sinal
 *    ensinaria a campanha a procurar o robô.
 *
 * O filtro fica no servidor, onde o clique é contado. O navegador só
 * ajuda: marca `wd=1` no link quando o toque não foi de um dedo.
 */

/**
 * Robôs, pré-visualizações de link e clientes HTTP.
 *
 * ⚠️ SEM `bot` SOLTO. "CUBOT P40" é celular Android, e o nome do modelo
 *    vai no user-agent — `bot\b` o contaria como robô. Por isso a lista
 *    é explícita e o genérico só pega `bot/`, a forma de quem se declara
 *    ("Googlebot/2.1", "bingbot/2.0").
 *
 * ⚠️ `WhatsApp/` É A PRÉ-VISUALIZAÇÃO, e não a pessoa. Quem toca num
 *    link dentro do WhatsApp abre o navegador do aparelho, que tem
 *    user-agent de navegador. Quem busca o link com "WhatsApp/2.x" é o
 *    servidor montando o cartão da conversa — e contaria uma entrada no
 *    grupo cada vez que alguém colasse `/g/porto-velho` num grupo.
 */
const AGENTE_DE_ROBO = new RegExp(
  [
    'bot/',
    'crawler',
    'spider',
    'facebookexternalhit',
    'facebookcatalog',
    'facebot',
    'meta-external',
    'whatsapp/',
    'telegrambot',
    'twitterbot',
    'slackbot',
    'discordbot',
    'linkedinbot',
    'skypeuripreview',
    'googlebot',
    'adsbot',
    'google-inspectiontool',
    'mediapartners-google',
    'bingbot',
    'bingpreview',
    'yandex',
    'baiduspider',
    'duckduckbot',
    'applebot',
    'petalbot',
    'headlesschrome',
    'lighthouse',
    'pingdom',
    'uptimerobot',
    'curl/',
    'wget/',
    'python-requests',
    'python-urllib',
    'aiohttp',
    'go-http-client',
    'node-fetch',
    'undici',
    'axios/',
    'okhttp',
    'java/',
  ]
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'i',
)

/** O cookie que marca aparelho da equipe. Ver `abrirSessao`. */
export const COOKIE_EQUIPE = 'sofia_interno'

/**
 * Este pedido não é de uma pessoa tocando num botão?
 *
 * Sem user-agent também conta como robô: todo navegador manda um.
 */
export function ehRobo(req: NextRequest): boolean {
  // HEAD é quem confere o link sem abrir: verificador, leitor de QR que
  // pré-carrega, pré-visualização. Pessoa nenhuma faz HEAD.
  if (req.method === 'HEAD') return true

  const agente = req.headers.get('user-agent') ?? ''
  if (!agente.trim() || AGENTE_DE_ROBO.test(agente)) return true

  // Pré-busca especulativa do navegador: a página ainda nem foi aberta.
  const proposito = `${req.headers.get('sec-purpose') ?? ''} ${req.headers.get('purpose') ?? ''} ${req.headers.get('x-purpose') ?? ''} ${req.headers.get('x-moz') ?? ''}`
  if (/prefetch|preview|prerender/i.test(proposito)) return true

  // Marca posta pelo próprio site quando o toque não veio de um dedo.
  // Ver `marcarToqueDeRobo` em lib/eventos.ts.
  return req.nextUrl.searchParams.get('wd') === '1'
}

/** Este pedido vem de um aparelho que já entrou no painel? */
export function ehEquipe(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_EQUIPE)?.value === '1'
}
