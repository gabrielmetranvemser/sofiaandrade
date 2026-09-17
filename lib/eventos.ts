'use client'

import { useEffect, useState } from 'react'
import type { Evento, TipoEvento } from './tipos'
import { utmDeParametros } from './campanha/marcas'
import { EVENTO_META, EVENTOS_PADRAO_META } from './trafego/tipos'

const CHAVE_SESSAO = 'sofia2233.sessao'

/**
 * Identificador aleatório por navegador. Sem nome, sem telefone, sem IP.
 * Serve só para não contar a mesma pessoa cinco vezes.
 * Fica em sessionStorage: morre quando a aba fecha, o que nos mantém
 * fora da exigência de banner de consentimento.
 */
export function idSessao(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = sessionStorage.getItem(CHAVE_SESSAO)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(CHAVE_SESSAO, id)
    }
    return id
  } catch {
    return ''
  }
}

/**
 * O id de sessão para usar DENTRO de um render.
 *
 * ⚠️ Nunca chame idSessao() direto no corpo de um componente. Ele lê
 *    sessionStorage, que não existe no servidor: o HTML sai com "s="
 *    vazio e o cliente monta "s=<uuid>". O React reclama de hidratação
 *    e — o que importa mais — o link SERVIDO fica sem sessão, então um
 *    clique dado antes da hidratação não conta como PESSOA na métrica,
 *    só como clique.
 *
 * Aqui o primeiro render devolve string vazia nos dois lados, e o id
 * entra depois que a página monta. Bate com o servidor e o link é
 * honesto: antes da hidratação, sessão não existe mesmo.
 */
export function useSessao(): string {
  const [sessao, setSessao] = useState('')
  useEffect(() => setSessao(idSessao()), [])
  return sessao
}

/** Monta o caminho do redirecionador com a origem e, se já houver, a sessão. */
export function caminhoDoGrupo(slug: string, origem: string, sessao: string): string {
  return `/g/${slug}?de=${origem}${sessao ? `&s=${sessao}` : ''}`
}

/** Navegador pilotado por automação (Selenium, Puppeteer, Playwright…)? */
function navegadorAutomatizado(): boolean {
  try {
    return navigator.webdriver === true
  } catch {
    return false
  }
}

/**
 * Marca o link de `/g/` como toque de robô, no instante do clique.
 *
 * ⚠️ O ROBÔ QUE INFLOU OS CLIQUES RODAVA JAVASCRIPT e tocava nos botões
 *    14 segundos depois de a página abrir. Clique disparado por código
 *    chega com `isTrusted` falso; navegador de automação expõe
 *    `navigator.webdriver`. Qualquer um dos dois põe `wd=1` no endereço
 *    e o redirecionador deixa de contar — o link continua funcionando.
 *
 *    Chamar no `onClick` de todo `<a>` que aponta para `/g/`. O navegador
 *    só lê o `href` depois do evento, então a troca vale para este toque.
 */
export function marcarToqueDeRobo(ancora: HTMLAnchorElement, confiavel: boolean): void {
  if (confiavel && !navegadorAutomatizado()) return
  if (!ancora.pathname.startsWith('/g/') || ancora.search.includes('wd=1')) return
  ancora.search += `${ancora.search ? '&' : '?'}wd=1`
}

export function dispositivo(): 'celular' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia('(max-width: 768px)').matches ? 'celular' : 'desktop'
}

/**
 * O rótulo da campanha, lido da URL desta página.
 *
 * A montagem vive em `lib/campanha/marcas.ts` porque o servidor precisa
 * dela também, e as duas cópias já divergiram uma vez — ver o comentário
 * de `CHAVES_UTM`.
 */
export function utmDaUrl(): string | null {
  if (typeof window === 'undefined') return null
  return utmDeParametros(new URLSearchParams(window.location.search))
}

/**
 * Um identificador por disparo, usado nos DOIS caminhos do mesmo
 * evento: o pixel manda em `eventID`, o servidor manda em `event_id`,
 * e a Meta reconhece que são a mesma coisa.
 *
 * ⚠️ GERADO NO NAVEGADOR, e é aqui que a deduplicação vive ou morre.
 *    Se cada lado gerasse o seu, a Meta veria dois eventos distintos e
 *    a campanha passaria a contar o dobro de conversões — com o
 *    agravante de parecer certo: o número sobe, ninguém desconfia, e a
 *    otimização do anúncio persegue um alvo que não existe.
 */
function novoIdDeEvento(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID()
  } catch {
    /* navegador antigo ou contexto inseguro */
  }
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Conta o evento para o pixel da Meta, se ele estiver carregado.
 *
 * Silencioso por natureza: sem pixel configurado no painel, `fbq` não
 * existe e a função não faz nada — que é o estado normal enquanto a
 * campanha não roda anúncio.
 */
function contarNoPixel(tipo: TipoEvento, eventId: string, extra: Record<string, unknown>): void {
  const nome = EVENTO_META[tipo]
  if (!nome) return

  const w = window as unknown as { fbq?: (...a: unknown[]) => void }
  if (typeof w.fbq !== 'function') return

  // `track` só aceita a lista fechada de nomes da Meta; qualquer outro
  // precisa de `trackCustom`, e mandar um nome nosso em `track` faz o
  // evento ser descartado em silêncio do outro lado.
  const metodo = EVENTOS_PADRAO_META.has(nome) ? 'track' : 'trackCustom'
  try {
    w.fbq(metodo, nome, extra, { eventID: eventId })
  } catch {
    /* rastreamento nunca quebra a página */
  }
}

/**
 * Dispara um evento. Nunca lança, nunca bloqueia a navegação.
 * Usa sendBeacon quando existe — sobrevive ao unload da página,
 * que é exatamente o caso do clique que leva pro WhatsApp.
 *
 * Vai para dois lugares ao mesmo tempo: a métrica própria da campanha,
 * em `/api/evento`, e — quando há pixel configurado — a Meta, pelos
 * dois caminhos ao mesmo tempo (navegador e servidor), amarrados pelo
 * `eventId`.
 */
export function evento(
  tipo: TipoEvento,
  extra: Omit<Evento, 'tipo' | 'sessao' | 'dispositivo' | 'utm'> = {},
): void {
  if (typeof window === 'undefined') return
  // Automação não vira visita no painel nem evento na Meta.
  if (navegadorAutomatizado()) return

  const eventId = novoIdDeEvento()

  const corpo: Evento & { eventId: string; pagina: string } = {
    tipo,
    ...extra,
    utm: utmDaUrl(),
    sessao: idSessao(),
    dispositivo: dispositivo(),
    eventId,
    pagina: window.location.href,
  }

  contarNoPixel(tipo, eventId, {
    municipio: extra.municipio_slug ?? undefined,
    origem: extra.origem ?? undefined,
  })

  try {
    const dados = JSON.stringify(corpo)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/evento', new Blob([dados], { type: 'application/json' }))
      return
    }
    void fetch('/api/evento', {
      method: 'POST',
      body: dados,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    })
  } catch {
    // Métrica nunca pode quebrar a página.
  }
}

/** Marca de rolagem: dispara rolou_50 e rolou_90 uma vez cada. */
export function observarRolagem(): () => void {
  if (typeof window === 'undefined') return () => {}
  const disparados = new Set<TipoEvento>()

  const aoRolar = () => {
    const alturaDoc = document.documentElement.scrollHeight - window.innerHeight
    if (alturaDoc <= 0) return
    const pct = (window.scrollY / alturaDoc) * 100
    if (pct >= 50 && !disparados.has('rolou_50')) {
      disparados.add('rolou_50')
      evento('rolou_50')
    }
    if (pct >= 90 && !disparados.has('rolou_90')) {
      disparados.add('rolou_90')
      evento('rolou_90')
      window.removeEventListener('scroll', aoRolar)
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true })
  return () => window.removeEventListener('scroll', aoRolar)
}
