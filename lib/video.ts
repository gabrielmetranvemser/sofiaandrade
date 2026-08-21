/**
 * INTERPRETAÇÃO DE ENDEREÇO DE VÍDEO.
 *
 * A campanha cola um link do YouTube ou do Vimeo no painel. Este
 * arquivo é o único lugar que sabe transformar esse link em algo que
 * um <iframe> entende — e é usado nos DOIS lados: pela validação, no
 * servidor, na hora de salvar; e pelo componente, no navegador, na
 * hora de tocar.
 *
 * Uma fonte só, pela mesma razão que `content/slots.ts` é uma fonte só
 * para imagem: se a validação aceitasse um formato que o player não
 * toca, o painel diria "salvo" e a página mostraria um quadro preto.
 *
 * ⚠️ POR QUE `-nocookie` E `dnt=1`
 *    A política de privacidade da página afirma, em voz alta, que aqui
 *    não se monta perfil de navegação. Embed de terceiro contradiz isso
 *    quando carrega junto com a página. Duas defesas: nada é requisitado
 *    antes de a pessoa clicar em play (ver components/ui/Video.tsx), e
 *    quando ela clica, o domínio é o que não escreve cookie de anúncio.
 */

export type Provedor = 'youtube' | 'vimeo'

export interface Video {
  provedor: Provedor
  /** O identificador no provedor. Nunca a URL inteira. */
  id: string
  /** O `src` do iframe, já com autoplay — só monta depois do clique. */
  embed: string
  /** Capa oficial do provedor, ou null quando ele não serve uma. */
  capa: string | null
  /** Para onde mandar quem preferir assistir na fonte. */
  assistir: string
}

/**
 * Aceita as formas que uma pessoa realmente cola:
 *   youtube.com/watch?v=ID   ·   youtu.be/ID
 *   youtube.com/shorts/ID    ·   youtube.com/embed/ID
 *   vimeo.com/ID             ·   player.vimeo.com/video/ID
 *   vimeo.com/ID/HASH        (vídeo não listado com senha de link)
 *
 * Devolve null para qualquer outra coisa — inclusive string vazia. É
 * esse null que faz o bloco de vídeo sumir da página enquanto o link
 * não chega.
 */
export function interpretarVideo(bruto: unknown): Video | null {
  if (typeof bruto !== 'string') return null
  const texto = bruto.trim()
  if (!texto) return null

  let url: URL
  try {
    url = new URL(texto)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const partes = url.pathname.split('/').filter(Boolean)

  // ── YouTube ──────────────────────────────────────────────────
  if (host === 'youtu.be') {
    return youtube(partes[0])
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (partes[0] === 'watch') return youtube(url.searchParams.get('v'))
    if (partes[0] === 'shorts' || partes[0] === 'embed' || partes[0] === 'live') {
      return youtube(partes[1])
    }
    return null
  }

  // ── Vimeo ────────────────────────────────────────────────────
  if (host === 'vimeo.com') {
    // /123456789 ou /123456789/a1b2c3 (o hash do não listado)
    if (/^\d+$/.test(partes[0] ?? '')) return vimeo(partes[0], partes[1])
    return null
  }
  if (host === 'player.vimeo.com' && partes[0] === 'video') {
    return vimeo(partes[1], url.searchParams.get('h') ?? undefined)
  }

  return null
}

/** O id do YouTube tem 11 caracteres do alfabeto de URL. */
function youtube(id: string | null | undefined): Video | null {
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null
  return {
    provedor: 'youtube',
    id,
    embed:
      `https://www.youtube-nocookie.com/embed/${id}` +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1',
    // hqdefault existe para TODO vídeo. maxresdefault não: em vídeo
    // enviado abaixo de 720p ele devolve 404, e o next/image transforma
    // isso num erro de build de imagem em produção.
    capa: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    assistir: `https://www.youtube.com/watch?v=${id}`,
  }
}

function vimeo(id: string | null | undefined, hash?: string): Video | null {
  if (!id || !/^\d+$/.test(id)) return null
  const seguro = hash && /^[A-Za-z0-9]+$/.test(hash) ? hash : null
  const query = `autoplay=1&dnt=1${seguro ? `&h=${seguro}` : ''}`
  return {
    provedor: 'vimeo',
    id,
    embed: `https://player.vimeo.com/video/${id}?${query}`,
    // O Vimeo só entrega miniatura por chamada de API autenticada. Sem
    // capa, o componente cai no cartaz desenhado em código — que é
    // melhor que uma requisição de servidor a cada render da home.
    capa: null,
    assistir: `https://vimeo.com/${id}${seguro ? `/${seguro}` : ''}`,
  }
}

/** Os dois enquadramentos que o acervo da campanha tem de verdade. */
export type FormatoVideo = 'deitado' | 'em-pe'

export function formatoValido(v: unknown): FormatoVideo {
  return v === 'em-pe' ? 'em-pe' : 'deitado'
}
