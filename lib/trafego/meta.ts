import 'server-only'

import { createHash } from 'node:crypto'
import { lerTrafego } from './ler'
import type { Trafego } from './tipos'

/**
 * A CONVERSIONS API DA META — o mesmo evento, pelo servidor.
 *
 * ⚠️ POR QUE ISTO EXISTE, se o pixel já dispara no navegador.
 *
 *    Porque uma parte grande do público desta página não é vista pelo
 *    pixel. Bloqueador de anúncio, iOS com rastreamento negado,
 *    Safari apagando cookie de terceiro em sete dias, rede corporativa
 *    filtrando `connect.facebook.net` — em campanha eleitoral, num
 *    público de 35 a 64 anos que abre o link dentro do WhatsApp, a
 *    perda medida costuma passar de um terço.
 *
 *    O envio pelo servidor não passa por nada disso: sai do nosso
 *    servidor direto para a Graph API. É o que faz a otimização do
 *    anúncio enxergar as conversões que de fato aconteceram.
 *
 * ⚠️ E POR QUE NÃO CONTA DOBRADO. Cada evento carrega um `event_id`
 *    gerado uma vez e usado NOS DOIS CAMINHOS — o pixel manda em
 *    `eventID`, nós mandamos em `event_id`. A Meta junta os dois pelo
 *    par (event_name, event_id) numa janela de 48h e conta um só. É
 *    por isso que o id é gerado no NAVEGADOR e viaja no corpo do
 *    evento: gerar um de cada lado produziria exatamente a contagem
 *    dobrada que o mecanismo existe para evitar.
 *
 *    A exceção é `clicou_grupo`, que só existe no servidor: o clique
 *    termina numa saída para o WhatsApp e o navegador não fica vivo
 *    para disparar nada. Ali não há par, e por isso não há dedução a
 *    fazer — ver `app/g/[slug]/route.ts`.
 */

const TEMPO_LIMITE = 4_000

/** Só o que a Graph API aceita como identidade sem PII. */
export interface Identidade {
  ip: string | null
  agente: string | null
  /** Cookie `_fbp`, escrito pelo próprio pixel. */
  fbp: string | null
  /** Cookie `_fbc`, ou derivado do `fbclid` da URL do anúncio. */
  fbc: string | null
  /** O uuid de sessão do site. Vai hasheado — ver `sha256`. */
  sessao: string | null
}

export interface Resultado {
  ok: boolean
  recebidos?: number
  mensagem?: string
  fbtrace?: string
}

/**
 * Lê a identidade do pedido.
 *
 * ⚠️ NADA AQUI É DADO PESSOAL DECLARADO. Não há e-mail nem telefone
 *    nesta página para coletar, e inventar um campo para pedi-los
 *    seria trocar conversão por atrito. O que sobe é o que qualquer
 *    servidor web já recebe: IP, agente e os dois cookies que o pixel
 *    escreveu no próprio navegador.
 *
 *    `fbc` é o mais valioso dos quatro: ele carrega o `fbclid` do
 *    clique no anúncio, que é o que amarra a conversão à campanha
 *    exata. Sem ele, a Meta sabe que houve conversão mas não de qual
 *    anúncio ela veio.
 */
export function identidadeDoPedido(req: Request, sessao?: string | null): Identidade {
  const cabecalhos = req.headers
  const cookies = analisarCookies(cabecalhos.get('cookie'))

  // O primeiro da lista é o cliente; os seguintes são proxies.
  const encaminhado = cabecalhos.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = encaminhado || cabecalhos.get('x-real-ip') || null

  let fbc = cookies._fbc ?? null
  if (!fbc) {
    // Primeiro clique no anúncio: a pessoa chega com `fbclid` na URL e
    // o cookie ainda não existe. O formato é o que a Meta especifica —
    // versão, subdomínio, instante e o id do clique.
    const fbclid = new URL(req.url).searchParams.get('fbclid')
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`
  }

  return {
    ip,
    agente: cabecalhos.get('user-agent'),
    fbp: cookies._fbp ?? null,
    fbc,
    sessao: sessao ?? null,
  }
}

function analisarCookies(bruto: string | null): Record<string, string> {
  const saida: Record<string, string> = {}
  if (!bruto) return saida
  for (const parte of bruto.split(';')) {
    const i = parte.indexOf('=')
    if (i < 1) continue
    const nome = parte.slice(0, i).trim()
    const valor = parte.slice(i + 1).trim()
    if (nome) saida[nome] = decodeURIComponent(valor)
  }
  return saida
}

/** A Meta exige `external_id` hasheado, minúsculo e sem espaço. */
function sha256(v: string): string {
  return createHash('sha256').update(v.trim().toLowerCase()).digest('hex')
}

export interface EventoMeta {
  nome: string
  /** O MESMO id que o pixel usou. Sem ele, a Meta conta duas vezes. */
  eventId: string
  /** A URL da página onde aconteceu. */
  url: string
  identidade: Identidade
  dados?: Record<string, unknown>
  /** Segundos desde a época. Padrão: agora. */
  quando?: number
}

/**
 * Envia um evento. NUNCA lança e NUNCA bloqueia — quem chama já
 * respondeu para o navegador.
 */
export async function enviarEvento(evento: EventoMeta): Promise<Resultado> {
  const cfg = await lerTrafego()
  return enviarComConfig(cfg, evento)
}

export async function enviarComConfig(cfg: Trafego, evento: EventoMeta): Promise<Resultado> {
  if (!cfg.capiAtiva) return { ok: false, mensagem: 'Envio pelo servidor desligado.' }
  if (!cfg.metaPixelId) return { ok: false, mensagem: 'Sem ID de pixel.' }
  if (!cfg.capiToken) return { ok: false, mensagem: 'Sem token da Conversions API.' }

  const { identidade: id } = evento

  // ⚠️ CHAVE AUSENTE É OMITIDA, e não mandada como null ou "". A Graph
  //    API responde 400 para user_data com campo vazio, e um 400 aqui
  //    derruba o evento inteiro — não só o campo.
  const userData: Record<string, unknown> = {}
  if (id.ip) userData.client_ip_address = id.ip
  if (id.agente) userData.client_user_agent = id.agente
  if (id.fbp) userData.fbp = id.fbp
  if (id.fbc) userData.fbc = id.fbc
  if (id.sessao) userData.external_id = sha256(id.sessao)

  const corpo: Record<string, unknown> = {
    data: [
      {
        event_name: evento.nome,
        event_time: evento.quando ?? Math.floor(Date.now() / 1000),
        event_id: evento.eventId,
        event_source_url: evento.url,
        action_source: 'website',
        user_data: userData,
        ...(evento.dados && Object.keys(evento.dados).length
          ? { custom_data: evento.dados }
          : {}),
      },
    ],
  }

  // Com código de teste os eventos vão para a aba "Eventos de teste" do
  // Gerenciador e NÃO contam como conversão. É o que permite conferir
  // a instrumentação sem sujar a otimização da campanha — e é por isso
  // que a tela do painel insiste em esvaziar o campo depois.
  if (cfg.capiTeste) corpo.test_event_code = cfg.capiTeste

  const endereco =
    `https://graph.facebook.com/${cfg.apiVersao}/${cfg.metaPixelId}/events` +
    `?access_token=${encodeURIComponent(cfg.capiToken)}`

  try {
    const resposta = await fetch(endereco, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(TEMPO_LIMITE),
      cache: 'no-store',
    })

    const json = (await resposta.json().catch(() => null)) as {
      events_received?: number
      fbtrace_id?: string
      error?: { message?: string; error_user_msg?: string }
    } | null

    if (!resposta.ok) {
      return {
        ok: false,
        mensagem:
          json?.error?.error_user_msg ??
          json?.error?.message ??
          `A Meta respondeu ${resposta.status}.`,
        fbtrace: json?.fbtrace_id,
      }
    }

    return { ok: true, recebidos: json?.events_received ?? 1, fbtrace: json?.fbtrace_id }
  } catch (e) {
    const motivo = e instanceof Error ? e.message : 'falha de rede'
    return { ok: false, mensagem: `Não consegui falar com a Meta: ${motivo}` }
  }
}
