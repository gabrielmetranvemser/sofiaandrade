import { after, NextResponse, type NextRequest } from 'next/server'
import {
  grupoDeDestino,
  localidadePorSlug,
  municipioPorSlug,
  registrarCliqueNoGrupo,
} from '@/lib/dados'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { config, emSilencioEleitoral } from '@/lib/config'
import { enviarEvento, identidadeDoPedido } from '@/lib/trafego/meta'
import { marcasDoPedido } from '@/lib/campanha/marcas'
import { ehEquipe, ehRobo } from '@/lib/trafego/robo'
import { autorizouPublicidade, COOKIE_CONSENTIMENTO } from '@/lib/consentimento'
import { ORIGENS_CLIQUE, type OrigemClique } from '@/lib/tipos'

/**
 * O REDIRECIONADOR.
 *
 * É a peça de maior valor do projeto: o link `/g/ji-parana` fica no
 * panfleto, no QR do carro de som e no botão da página. Trocar o
 * destino é editar uma linha no painel — nada de republicar site.
 *
 * `force-dynamic` é obrigatório. Se a Vercel cachear esta rota, o
 * clique não conta e o link antigo persiste depois de trocado.
 * Sintoma silencioso, diagnóstico difícil. Está no plano como risco médio.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ORIGENS_VALIDAS = new Set<string>(ORIGENS_CLIQUE)

/**
 * O segundo toque no mesmo grupo, em menos de dez minutos, não conta.
 *
 * ⚠️ NÃO É HIPÓTESE. Entre 15 e 17/09, de 44 pessoas que tocaram para
 *    entrar, 6 tocaram 2 ou 3 vezes seguidas — o WhatsApp demora a abrir
 *    dentro do navegador do Instagram e a pessoa aperta de novo. Cada
 *    toque virava um clique no limite do grupo e um `Lead` com id novo.
 */
const COOKIE_TOQUE = 'sofia_toque'
const JANELA_TOQUE_S = 600

/**
 * Por que este pedido conta — ou não — como entrada.
 *
 * Vai no cabeçalho `x-sofia-contagem` da resposta: `curl -I` num link
 * `/g/` diz na hora se o filtro funcionou, sem precisar abrir o banco.
 */
type Contagem = 'contado' | 'repetido' | 'robo' | 'equipe' | 'desligada'

function motivoParaNaoContar(req: NextRequest): Contagem | null {
  if (config.medicaoDesligada) return 'desligada'
  if (ehRobo(req)) return 'robo'
  if (ehEquipe(req)) return 'equipe'
  return null
}

function toqueRepetido(req: NextRequest, grupoId: string): boolean {
  const valor = req.cookies.get(COOKIE_TOQUE)?.value
  if (!valor) return false
  // O id do grupo é uuid: tem hífen, nunca ponto.
  const [id, quando] = valor.split('.')
  return id === grupoId && Date.now() / 1000 - Number(quando) < JANELA_TOQUE_S
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params
  // Distrito com grupo próprio (/g/iata) entra por aqui igual a
  // município. O que muda é a métrica: o evento é gravado no município
  // que ancora o grupo, senão o painel passa a ter linha para um lugar
  // que não existe na tabela de municípios. Quem separa os dois lá é o
  // `grupo_id`, que é diferente.
  const localidade = localidadePorSlug(slug)
  const municipio = municipioPorSlug(localidade?.municipioSlug ?? slug)

  // Lugar que não existe: manda para a lista, nunca erro 404 seco.
  if (!municipio) {
    return NextResponse.redirect(new URL('/grupos?nao-encontrado=1', req.url), 307)
  }

  // ⚠️ CONFORMIDADE. Esconder o CTA na página não basta: o link
  //    /g/ji-parana está impresso em panfleto e colado em QR de carro
  //    de som. Sem esta trava, alguém entra no grupo às 2h do dia da
  //    votação porque escaneou um adesivo. A checagem tem que estar
  //    aqui, no redirecionador, não só no layout.
  if (emSilencioEleitoral()) {
    const destino = new URL('/grupos', req.url)
    destino.searchParams.set('silencio', '1')
    return NextResponse.redirect(destino, 307)
  }

  const deParam = req.nextUrl.searchParams.get('de')
  const origem: OrigemClique = ORIGENS_VALIDAS.has(deParam ?? '')
    ? (deParam as OrigemClique)
    : 'direto'

  // De qual anúncio esta pessoa veio. A URL deste redirecionador não
  // carrega UTM nenhum — quem a montou foi um botão da própria página —
  // então a resposta está no cookie escrito na chegada. Ver `proxy.ts`.
  const marcas = marcasDoPedido(req)

  const grupo = await grupoDeDestino(slug)
  const podeEntrar =
    grupo?.status === 'aberto' &&
    Boolean(grupo.link) &&
    (grupo.limite_cliques === null || grupo.cliques < grupo.limite_cliques)

  // Robô, equipe e servidor de teste seguem o mesmo caminho de quem é
  // gente — o link funciona igual para eles —, só não deixam rastro.
  const semContagem = motivoParaNaoContar(req)

  // Sem grupo aberto: volta para a lista com a mensagem certa.
  // "cheio" e "em breve" são situações diferentes e a pessoa merece
  // saber qual das duas é.
  if (!grupo || !podeEntrar) {
    if (!semContagem) {
      await gravarEvento({
        tipo: 'entrou_grupo_indisponivel',
        municipio_slug: municipio.slug,
        grupo_id: grupo?.id ?? null,
        origem,
        req,
        utm: marcas?.utm ?? null,
      })
    }

    const destino = new URL('/grupos', req.url)
    // O lugar que a pessoa pediu, e não a sede: `/grupos` abre o painel
    // com esta cidade, e o painel do Iata precisa dizer a situação do
    // Iata — não oferecer o grupo de Guajará-Mirim no lugar dele.
    destino.searchParams.set('cidade', localidade?.slug ?? municipio.slug)
    destino.searchParams.set('situacao', grupo?.status ?? 'em_breve')
    const desvio = NextResponse.redirect(destino, 307)
    desvio.headers.set('x-sofia-contagem', semContagem ?? 'indisponivel')
    return desvio
  }

  const contagem: Contagem = semContagem ?? (toqueRepetido(req, grupo.id) ? 'repetido' : 'contado')

  // ⚠️ DIAGNÓSTICO TEMPORÁRIO — tirar depois de 24/09/2026. O robô que
  //    inflou os cliques usava computador, e ninguém sabe ainda com
  //    que user-agent. Uma semana de log da Vercel com os cliques de
  //    computador basta para achar a assinatura e pôr na lista de
  //    lib/trafego/robo.ts. Celular não entra: é gente, e é muito.
  const agente = req.headers.get('user-agent') ?? ''
  if (!/Mobile|Android|iPhone/i.test(agente)) {
    console.info(
      '[g] clique de computador',
      JSON.stringify({ slug, origem, contagem, agente: agente.slice(0, 300) }),
    )
  }

  if (contagem !== 'contado') {
    const resposta = NextResponse.redirect(grupo.link!, 307)
    resposta.headers.set('cache-control', 'no-store, max-age=0')
    resposta.headers.set('x-sofia-contagem', contagem)
    return resposta
  }

  // Conta o clique e aplica a virada automática por limite.
  await Promise.all([
    registrarCliqueNoGrupo(grupo),
    gravarEvento({
      tipo: 'clicou_grupo',
      municipio_slug: municipio.slug,
      grupo_id: grupo.id,
      origem,
      req,
      utm: marcas?.utm ?? null,
    }),
  ])

  // ── A CONVERSÃO, para a Meta ────────────────────────────────
  //
  // ⚠️ ESTE É O ÚNICO EVENTO SEM PAR NO NAVEGADOR, e não é escolha:
  //    daqui a resposta é um 307 para o WhatsApp. A página é
  //    descarregada, e o pixel não sobrevive para disparar nada. Todo
  //    site que manda gente para fora tem esse buraco; é exatamente
  //    para ele que a Conversions API existe.
  //
  //    Como não há par, também não há deduplicação a fazer — o id é
  //    gerado aqui mesmo, e serve só para a Meta reconhecer uma
  //    retentativa como repetição, e não como segunda conversão.
  //
  // ⚠️ `after` E NÃO `await`: o que está entre a pessoa e o grupo é
  //    esta função. Esperar 300ms da Graph API antes de redirecionar
  //    seria cobrar da pessoa o preço da nossa medição — e no celular,
  //    em 4G ruim, é assim que se perde alguém no meio do caminho.
  //
  // ⚠️ SÓ COM AUTORIZAÇÃO DE PUBLICIDADE no aviso de cookies. O clique
  //    continua contando no grupo e no painel logo acima; o que não sai
  //    sem autorização é o envio à Meta, com endereço de rede e cookies
  //    do pixel. É a conversão da campanha, e é justamente o que o aviso
  //    promete não mandar sem um "sim".
  if (autorizouPublicidade(req.cookies.get(COOKIE_CONSENTIMENTO)?.value)) {
    const identidade = identidadeDoPedido(req, req.nextUrl.searchParams.get('s'))
    const eventId = `grupo-${grupo.id}-${identidade.sessao ?? 'sem-sessao'}-${Date.now()}`
    after(async () => {
      await enviarEvento({
        nome: 'Lead',
        eventId,
        url: new URL(req.nextUrl.pathname + req.nextUrl.search, config.siteUrl).toString(),
        identidade,
        dados: { municipio: municipio.slug, origem, conteudo: 'grupo-whatsapp' },
      })
    })
  }

  const resposta = NextResponse.redirect(grupo.link!, 307)
  resposta.headers.set('cache-control', 'no-store, max-age=0')
  resposta.headers.set('x-sofia-contagem', contagem)
  // Só em `/g`: é o único lugar que precisa ler, e não viaja com as
  // outras páginas.
  resposta.cookies.set(COOKIE_TOQUE, `${grupo.id}.${Math.floor(Date.now() / 1000)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/g',
    maxAge: JANELA_TOQUE_S,
  })
  return resposta
}

async function gravarEvento({
  tipo,
  municipio_slug,
  grupo_id,
  origem,
  req,
  utm,
}: {
  tipo: string
  municipio_slug: string
  grupo_id: string | null
  origem: OrigemClique
  req: NextRequest
  /** O rótulo da campanha, vindo do cookie de chegada. */
  utm: string | null
}) {
  // Id de sessão que o navegador passou em `?s=`. É o mesmo aleatório
  // dos outros eventos, sem nome, sem telefone, sem IP — serve só para
  // o painel conseguir dizer PESSOAS, e não só cliques. Clique de QR
  // impresso não tem sessão, e aí fica null mesmo: é a verdade.
  const s = req.nextUrl.searchParams.get('s')
  const sessao = s && /^[0-9a-f-]{16,40}$/i.test(s) ? s : null

  if (!config.supabaseAtivo) return
  const sb = criarClienteAdmin()
  if (!sb) return

  const ua = req.headers.get('user-agent') ?? ''

  try {
    await sb.from('eventos').insert({
      tipo,
      municipio_slug,
      grupo_id,
      origem,
      utm,
      sessao,
      dispositivo: /Mobile|Android|iPhone/i.test(ua) ? 'celular' : 'desktop',
    })
  } catch {
    // Métrica nunca pode impedir a pessoa de entrar no grupo.
  }
}
