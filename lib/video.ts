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

export type Provedor = 'youtube' | 'vimeo' | 'arquivo'

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
 * ARQUIVO PRÓPRIO (Cloudflare R2, S3, ou qualquer endereço público).
 *
 * O provedor `arquivo` não tem player de terceiro: é um `<video>` do
 * próprio navegador apontando para o arquivo. Vale a pena quando a
 * campanha quer o vídeo sob domínio próprio, sem YouTube no meio —
 * e o R2 é a escolha certa para isso porque não cobra saída de dados,
 * que é justamente o custo que estoura numa página de campanha.
 *
 * ⚠️ SÓ MP4 E WEBM. `.m3u8` (HLS) é recusado de propósito: o Safari
 *    toca nativo, o Chrome não toca sem uma biblioteca de 40 kB, e um
 *    vídeo que funciona no telefone de quem cadastrou e não funciona
 *    no de quem vota é pior que uma recusa clara na hora de salvar.
 *    MP4 com faststart toca em todo lugar e o R2 serve por intervalo
 *    (range), então o navegador começa antes de baixar o arquivo todo.
 */
const EXTENSOES_DE_ARQUIVO = ['.mp4', '.webm'] as const

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

  // ── Arquivo próprio (R2 e afins) ─────────────────────────────
  // Vem por último entre as tentativas de reconhecimento porque é a
  // mais permissiva: qualquer domínio serve, desde que o caminho
  // termine numa extensão que o navegador saiba tocar.
  const caminho = url.pathname.toLowerCase()
  if (EXTENSOES_DE_ARQUIVO.some((ext) => caminho.endsWith(ext))) {
    return {
      provedor: 'arquivo',
      // O nome do arquivo serve de identificador: é estável, é legível
      // no painel, e não expõe o caminho inteiro do balde.
      id: partes[partes.length - 1] ?? texto,
      embed: url.toString(),
      // Sem capa de provedor. O componente resolve mostrando o primeiro
      // quadro do próprio vídeo — ver components/ui/Video.tsx.
      capa: null,
      assistir: url.toString(),
    }
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

/** Quanto de proporção cada enquadramento tem: largura ÷ altura. */
export const RAZAO: Record<FormatoVideo, number> = {
  'em-pe': 9 / 16,
  deitado: 16 / 9,
}

/**
 * O TETO DE ALTURA de cada enquadramento, em CSS.
 *
 * ⚠️ SÃO DOIS VALORES DIFERENTES DE PROPÓSITO. Um vídeo em pé pode ser
 *    mais alto que um deitado sem incomodar — é a forma de um celular
 *    na mão, e é assim que ele foi gravado. Um deitado alto demais vira
 *    uma faixa que empurra o resto da seção para fora da tela.
 *
 *    `svh` e não `vh`: no celular, `vh` conta a tela COM a barra do
 *    navegador recolhida, e o vídeo passa a caber só depois que a
 *    pessoa rola. `rem` no `min` é o teto de tela grande, onde 70% da
 *    altura já é vídeo demais.
 */
export const TETO_ALTURA: Record<FormatoVideo, string> = {
  'em-pe': 'min(74svh, 34rem)',
  deitado: 'min(68svh, 30rem)',
}

/**
 * A LARGURA QUE O VÍDEO VAI OCUPAR, em CSS, derivada da altura.
 *
 * Serve para quem desenha em volta dele: uma moldura que precise
 * ENCOLHER JUNTO com um vídeo em pé, em vez de virar um painel largo
 * com uma tira estreita de vídeo no meio. Ver `Rua` e `Problema`.
 */
export function larguraDoVideo(formato: FormatoVideo, alturaMax?: string): string {
  return `calc(${alturaMax ?? TETO_ALTURA[formato]} * ${RAZAO[formato]})`
}

/** Atalho de leitura. `formato === 'em-pe'` espalhado por seis seções vira ruído. */
export function emPe(formato: FormatoVideo): boolean {
  return formato === 'em-pe'
}

/**
 * O TETO DE ALTURA DE UM VÍDEO EM PÉ QUE DIVIDE A LINHA COM TEXTO.
 *
 * ⚠️ MENOR QUE O TETO NORMAL, e a diferença é o que resolve o buraco
 *    branco. Numa faixa de duas colunas — texto de um lado, vídeo do
 *    outro — quem manda na altura da linha é o mais alto dos dois. Um
 *    bloco de texto de campanha tem 260 a 320 px; o vídeo em pé, no
 *    teto de 34rem, tem 544. A diferença não some: ela vira ar em volta
 *    do texto, e é exatamente isso que se lê como desalinhado.
 *
 *    30rem dão 480 px de altura e 270 de largura — ainda é um celular
 *    na mão, e a sobra cai para menos da metade.
 */
export const TETO_AO_LADO_DO_TEXTO = 'min(64svh, 30rem)'


/**
 * OS AJUSTES DE PLAYER, POR VÍDEO.
 *
 * ⚠️ NEM TODO PROVEDOR OBEDECE A TUDO, e é honesto dizer onde a
 *    promessa vale:
 *
 *    · arquivo próprio (R2) — toca no player do navegador e obedece a
 *      todos: controles, tela cheia e carregamento.
 *    · YouTube — aceita `controls=0` e `fs=0`, mas continua mostrando o
 *      próprio nome e o menu de contexto. Não existe modo "sem marca".
 *    · Vimeo — aceita os dois pelos mesmos parâmetros.
 *
 *    O botão sobre o vídeo é nosso, desenhado por cima do quadro, e por
 *    isso funciona igual nos três.
 */
export interface OpcoesVideo {
  controles?: boolean
  telaCheia?: boolean
  /**
   * 'automatico' toca sozinho ao entrar na tela — e SEMPRE mudo.
   *
   * ⚠️ Não é escolha nossa: desde 2018 todo navegador de peso recusa
   *    autoplay com som, e a chamada falha em silêncio. Fingir que dá
   *    para tocar com áudio produziria um vídeo que simplesmente não
   *    começa, sem erro nenhum para investigar.
   */
  inicio?: 'clique' | 'automatico'
  /** 'ao-clicar' não pede nada ao provedor antes do play. */
  carregamento?: 'ao-clicar' | 'com-previa'
  botaoRotulo?: string
  botaoDestino?: string
}

export const OPCOES_PADRAO: Required<
  Pick<OpcoesVideo, 'controles' | 'telaCheia' | 'carregamento' | 'inicio'>
> = {
  controles: true,
  telaCheia: true,
  carregamento: 'ao-clicar',
  inicio: 'clique',
}

/** Acrescenta ao endereço de embed o que o provedor sabe respeitar. */
export function embedComOpcoes(video: Video, opcoes: OpcoesVideo): string {
  if (video.provedor === 'arquivo') return video.embed

  const url = new URL(video.embed)
  const controles = opcoes.controles ?? OPCOES_PADRAO.controles
  const telaCheia = opcoes.telaCheia ?? OPCOES_PADRAO.telaCheia

  if (!controles) url.searchParams.set('controls', '0')
  if (!telaCheia) url.searchParams.set('fs', '0')
  // Autoplay sem `mute=1` é recusado pelo navegador e o vídeo fica
  // parado numa tela preta. Os dois andam juntos, sempre.
  if (opcoes.inicio === 'automatico') url.searchParams.set('mute', '1')
  return url.toString()
}

/** Lê o que veio do painel sem confiar no formato. */
export function opcoesValidas(bruto: unknown): OpcoesVideo {
  const o = (bruto ?? {}) as Record<string, unknown>
  return {
    controles: o.controles !== false,
    telaCheia: o.telaCheia !== false,
    carregamento: o.carregamento === 'com-previa' ? 'com-previa' : 'ao-clicar',
    inicio: o.inicio === 'automatico' ? 'automatico' : 'clique',
    botaoRotulo: typeof o.botaoRotulo === 'string' ? o.botaoRotulo.trim() : '',
    botaoDestino: typeof o.botaoDestino === 'string' ? o.botaoDestino.trim() : '',
  }
}
