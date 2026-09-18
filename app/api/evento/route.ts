import { after, NextResponse, type NextRequest } from 'next/server'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { config } from '@/lib/config'
import { enviarEvento, identidadeDoPedido } from '@/lib/trafego/meta'
import { EVENTO_META } from '@/lib/trafego/tipos'
import { veioDeOutroSite } from '@/lib/trafego/origem'
import { marcasDoPedido } from '@/lib/campanha/marcas'
import { ehEquipe, ehRobo } from '@/lib/trafego/robo'
import { autorizouPublicidade, COOKIE_CONSENTIMENTO } from '@/lib/consentimento'
import { ORIGENS_CLIQUE, type TipoEvento } from '@/lib/tipos'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Recebe os eventos do navegador. Endpoint público de propósito —
 * é chamado por sendBeacon, que não carrega cabeçalho customizado.
 *
 * O que protege aqui não é autenticação, é o formato: só os tipos
 * da lista branca entram, nada de campo livre, tamanho limitado.
 * O pior que alguém consegue fazer é inflar métrica própria.
 */

// `clicou_grupo` NÃO está aqui de propósito: quem grava esse evento é
// a rota /g/[slug], no servidor, quando a pessoa realmente sai para o
// WhatsApp. Aceitar do navegador criaria contagem dobrada.
const TIPOS = new Set([
  'pagina_vista', 'rolou_50', 'rolou_90',
  'buscou_cidade', 'usou_localizacao',
  'clicou_cta', 'entrou_grupo_indisponivel',
  'abriu_filtro', 'subiu_foto', 'gerou_filtro',
  'baixou_filtro', 'compartilhou_filtro',
  'compartilhou_pagina', 'clicou_instagram',
  'saiu_para_whatsapp', 'whatsapp_nao_abriu',
  'clicou_bio',
])

// ⚠️ VEM DE `lib/tipos.ts`, e não é uma cópia escrita à mão. A cópia
//    que estava aqui tinha esquecido `'mapa'` — todo toque no mapa de
//    Rondônia chegava com origem nula, sem erro nenhum, e a tela "qual
//    botão trabalha" jurava que o mapa nunca tinha sido usado.
const ORIGENS = new Set<string>(ORIGENS_CLIQUE)

const LIMITE_CORPO = 3_072

function texto(v: unknown, max = 120): string | null {
  if (typeof v !== 'string') return null
  const limpo = v.trim().slice(0, max)
  return limpo.length ? limpo : null
}

export async function POST(req: NextRequest) {
  // 204 em qualquer falha: o navegador não deve nem saber que houve erro.
  const ok = () => new NextResponse(null, { status: 204 })

  // ⚠️ ANTES DE LER O CORPO, e antes do repasse à Meta. Robô, aparelho
  //    da equipe e servidor de teste não viram visita no painel nem
  //    PageView na campanha — ver lib/trafego/robo.ts.
  if (config.medicaoDesligada || ehRobo(req) || ehEquipe(req)) return ok()

  try {
    const bruto = await req.text()
    if (bruto.length > LIMITE_CORPO) return ok()

    const corpo = JSON.parse(bruto) as Record<string, unknown>
    if (!TIPOS.has(String(corpo.tipo))) return ok()

    // ── O mesmo evento, também para a Meta ──────────────────────
    //
    // ⚠️ ANTES DA GRAVAÇÃO NO BANCO, e de propósito: `after` só
    //    agenda, não executa, então o repasse não depende de o
    //    Supabase estar de pé. Métrica interna e rastreamento de
    //    anúncio são dois sistemas, e a queda de um não pode levar o
    //    outro junto — é o anúncio que está gastando dinheiro.
    repassarParaMeta(req, corpo)

    if (!config.supabaseAtivo) {
      // Fase local: sem banco, o evento vai para o log do servidor.
      // Serve para conferir a instrumentação antes de ligar o Supabase.
      if (process.env.NODE_ENV === 'development') {
        console.log('[evento]', corpo.tipo, corpo.origem ?? '', corpo.municipio_slug ?? '')
      }
      return ok()
    }

    const sb = criarClienteAdmin()
    if (!sb) return ok()

    const origem = texto(corpo.origem, 24)
    const dispositivo = texto(corpo.dispositivo, 12)
    const rotulo = texto(corpo.rotulo, 60)

    // ⚠️ O NAVEGADOR MANDA O UTM DA PÁGINA EM QUE ESTÁ, e ele some na
    //    primeira navegação interna: quem chega pelo anúncio na home e
    //    depois abre `/grupos` deixa a origem para trás. Sem esta
    //    linha, metade dos eventos de uma mesma visita paga entraria no
    //    painel como orgânica. O cookie de chegada é a memória disso.
    const marcas = marcasDoPedido(req)

    await sb.from('eventos').insert({
      tipo: String(corpo.tipo),
      municipio_slug: texto(corpo.municipio_slug, 64),
      grupo_id: texto(corpo.grupo_id, 40),
      origem: origem && ORIGENS.has(origem) ? origem : null,
      utm: texto(corpo.utm, 200) ?? marcas?.utm ?? null,
      sessao: texto(corpo.sessao, 40),
      dispositivo:
        dispositivo === 'celular' || dispositivo === 'desktop' ? dispositivo : null,
      // ⚠️ SÓ ENTRA QUANDO EXISTE, e a condição é um seguro contra a
      //    ordem do deploy. `rotulo` é coluna nova (migration 0019);
      //    num servidor que subiu antes de ela ser aplicada, mandar a
      //    chave faz o PostgREST recusar o insert INTEIRO — e o `catch`
      //    logo abaixo engole o erro de propósito, porque métrica nunca
      //    pode derrubar a página. O resultado seria o site inteiro
      //    parar de gravar evento, em silêncio, até alguém estranhar o
      //    painel zerado.
      //
      //    Fora da bio ninguém manda `rotulo`, então nesse cenário o
      //    que se perde é só o clique da bio — e não o funil todo.
      ...(rotulo ? { rotulo } : {}),
    })

    return ok()
  } catch {
    return ok()
  }
}

/**
 * Repasse para a Conversions API.
 *
 * O `eventId` vem do navegador, que já contou o mesmo evento no pixel
 * com ele — ver `lib/eventos.ts`. É esse par que faz a Meta reconhecer
 * os dois como um só. Sem `eventId` no corpo, não repassa: mandar sem
 * id seria escolher contar dobrado.
 */
function repassarParaMeta(req: NextRequest, corpo: Record<string, unknown>): void {
  // ⚠️ SÓ O REPASSE É BARRADO, e a gravação no banco segue. São dois
  //    prejuízos de tamanho diferente: métrica interna suja se conserta
  //    olhando a tabela; pixel envenenado gasta verba de anúncio
  //    perseguindo conversão que não existiu.
  if (veioDeOutroSite(req)) return
  // Sem autorização de publicidade no aviso de cookies, nada vai para a
  // Meta. A métrica própria segue: não usa cookie e não identifica
  // ninguém — ver a seção "O que medimos" da política de privacidade.
  if (!autorizouPublicidade(req.cookies.get(COOKIE_CONSENTIMENTO)?.value)) return

  const nome = EVENTO_META[String(corpo.tipo) as TipoEvento]
  if (!nome) return

  const eventId = typeof corpo.eventId === 'string' ? corpo.eventId.slice(0, 60) : ''
  if (!eventId) return

  const identidade = identidadeDoPedido(req, texto(corpo.sessao, 40))
  const url = enderecoProprio(corpo.pagina)

  const dados: Record<string, unknown> = {}
  const municipio = texto(corpo.municipio_slug, 64)
  const origem = texto(corpo.origem, 24)
  const rotulo = texto(corpo.rotulo, 60)
  if (municipio) dados.municipio = municipio
  if (origem) dados.origem = origem
  if (rotulo) dados.rotulo = rotulo

  // ⚠️ O MESMO PAR DO NAVEGADOR, e tem de ser o mesmo: os dois caminhos
  //    descrevem o MESMO evento, amarrados pelo `eventId`, e a Meta
  //    junta os dois. Divergir aqui faria a conversão chegar ora como
  //    "grupo-whatsapp", ora como "link-da-bio", conforme o lado que
  //    chegasse primeiro. Ver `contarNoPixel`, em lib/eventos.ts.
  if (corpo.tipo === 'clicou_bio') {
    dados.content_category = 'link-da-bio'
    if (rotulo) dados.content_name = rotulo
  }

  after(async () => {
    await enviarEvento({ nome, eventId, url, identidade, dados })
  })
}

/** `event_source_url` aparece no Gerenciador. Só endereço nosso entra. */
function enderecoProprio(bruto: unknown): string {
  if (typeof bruto !== 'string') return config.siteUrl
  try {
    const url = new URL(bruto)
    const meu = new URL(config.siteUrl)
    return url.host === meu.host ? url.toString().slice(0, 500) : config.siteUrl
  } catch {
    return config.siteUrl
  }
}
