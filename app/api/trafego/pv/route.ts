import { after, NextResponse, type NextRequest } from 'next/server'
import { config } from '@/lib/config'
import { enviarEvento, identidadeDoPedido } from '@/lib/trafego/meta'
import { veioDeOutroSite } from '@/lib/trafego/origem'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * O PAGEVIEW PELO SERVIDOR.
 *
 * ⚠️ ROTA PRÓPRIA, SEPARADA DE `/api/evento`, e a razão é de contagem.
 *    Aquela rota grava no banco: é ela que produz o número de visitas
 *    que a campanha lê no painel. O PageView da Meta precisa sair de
 *    TODA página — inclusive `/filtro`, que não registra visita na
 *    métrica interna de propósito. Fundir as duas obrigaria a escolher
 *    entre perder PageView na Meta ou inflar a visita no painel.
 *
 *    Aqui não há escrita em banco nenhuma. Só o repasse.
 *
 * O corpo carrega o `eventId` que o pixel já usou no navegador — é o
 * que faz a Meta contar UM PageView, e não dois. Ver `lib/trafego/meta.ts`.
 */

const LIMITE_CORPO = 1_024

export async function POST(req: NextRequest) {
  // 204 sempre: o navegador não deve nem saber que houve erro.
  const ok = () => new NextResponse(null, { status: 204 })

  try {
    // Evento vindo de página de terceiro não é evento desta campanha.
    if (veioDeOutroSite(req)) return ok()

    const bruto = await req.text()
    if (bruto.length > LIMITE_CORPO) return ok()

    const corpo = JSON.parse(bruto) as { eventId?: unknown; url?: unknown }
    const eventId = typeof corpo.eventId === 'string' ? corpo.eventId.slice(0, 60) : ''
    if (!eventId) return ok()

    const url = enderecoProprio(corpo.url)

    // ⚠️ `after` E NÃO `await`. A Graph API leva de 100 a 300ms para
    //    responder, e esta rota é chamada no carregamento de toda
    //    página. Segurar a resposta por isso ocuparia conexão do
    //    navegador em concorrência com a própria página. Com `after`,
    //    o 204 sai na hora e a conversa com a Meta acontece depois.
    const identidade = identidadeDoPedido(req)
    after(async () => {
      await enviarEvento({ nome: 'PageView', eventId, url, identidade })
    })

    return ok()
  } catch {
    return ok()
  }
}

/**
 * ⚠️ SÓ URL DO PRÓPRIO SITE. `event_source_url` vai para a Meta e
 *    aparece no Gerenciador de Eventos: aceitar endereço arbitrário do
 *    corpo deixaria qualquer um plantar link de terceiro lá dentro.
 */
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
