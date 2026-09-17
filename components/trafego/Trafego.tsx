'use client'

import { useEffect, useRef } from 'react'
import type { TrafegoPublico } from '@/lib/trafego/tipos'
import { salvoAgoraPouco, useConsentimento } from '@/lib/consentimento-cliente'

/**
 * O PIXEL DA META E O GOOGLE TAG MANAGER.
 *
 * Os dois só existem se a tela de Tráfego, no painel, tiver o id. Campo
 * vazio não carrega nada — nem uma tag, nem uma requisição.
 *
 * ⚠️ E SÓ COM AUTORIZAÇÃO, desde 17/09. O GTM (GA4 e Clarity) precisa
 *    de "desempenho" no aviso de cookies; o pixel precisa de
 *    "publicidade". Sem escolha feita, nenhum dos dois carrega — nem a
 *    fila do `fbq` é criada, e sem ela `lib/eventos.ts` também não conta
 *    nada no pixel. O lado do servidor (Conversions API) lê o mesmo
 *    cookie e obedece igual. Ver `lib/consentimento.ts`.
 *
 * ⚠️ `afterInteractive`, e não `beforeInteractive`. Rastreamento não
 *    pode competir com o botão principal pela banda do celular: o teto
 *    desta página é 3 segundos até o CTA ficar clicável em 4G, e um
 *    script de terceiro carregado cedo come esse orçamento inteiro. O
 *    que se perde é a medição dos primeiros ~200ms de quem sai
 *    imediatamente; o que se ganha é a pessoa que fica.
 *
 * ⚠️ O PAGEVIEW NÃO ESTÁ NO CÓDIGO BASE, e isso é o ponto mais
 *    delicado deste arquivo. O trecho que a Meta entrega termina com
 *    `fbq('track','PageView')` — sem id de evento. Um PageView sem id
 *    não pode ser casado com o que o servidor manda, e a Meta contaria
 *    dois. Aqui o disparo é nosso, logo abaixo, com um id que viaja
 *    junto para a rota que fala com a Conversions API.
 *
 *    Consequência prática: se alguém copiar de novo o trecho oficial
 *    da Meta para dentro deste arquivo, ou colar o pixel DENTRO do
 *    GTM, a contagem dobra. É o mesmo motivo do aviso na tela do
 *    painel — pixel no GTM e pixel aqui são dois pixels.
 *
 * ⚠️ `autoConfig` DESLIGADO, e isto foi encontrado medindo, não lendo
 *    documentação. Ligado — que é o padrão — o pixel observa a página
 *    sozinho e dispara eventos que ninguém pediu. Nesta página o
 *    estrago é específico e grande: TODA troca de endereço, inclusive
 *    o `#grupos` de um clique no menu, produzia um PageView extra —
 *    e sem `eventID`, porque não é nosso. Sem id não há como casar com
 *    o do servidor: a Meta contaria cada rolagem até uma âncora como
 *    uma visita nova.
 *
 *    O que se perde desligando é a Correspondência Avançada
 *    Automática, que vasculha formulários atrás de e-mail e telefone
 *    para melhorar a nota de correspondência. Aqui ela não tem o que
 *    achar: esta página não pede e-mail nem telefone em lugar nenhum —
 *    de propósito, é o que a política de privacidade promete. Perde-se
 *    zero, e ganha-se uma contagem em que dá para confiar.
 */
/**
 * ⚠️ O CRIVO QUE IMPEDE EXECUÇÃO DE CÓDIGO ARBITRÁRIO.
 *
 *    Os dois ids abaixo são costurados DENTRO de um `<script>` inline,
 *    dentro de aspas simples. Um valor com uma aspa simples fecha a
 *    string e o que vier depois é JavaScript executado em toda página
 *    do site — comprovado em teste: `123');window.PROVA_XSS=1;fbq('init','123`
 *    gravado no banco executou.
 *
 *    A ação de salvar já valida o formato, e é isso que torna o buraco
 *    difícil de alcançar hoje. Mas validar na ENTRADA é uma promessa
 *    sobre o passado: não cobre o que já está no banco, não cobre
 *    escrita direta no Supabase, e some no dia em que alguém afrouxar a
 *    expressão regular para aceitar um formato novo. O crivo aqui é
 *    sobre o presente — o valor é conferido no instante em que vira
 *    código.
 *
 *    FALHA FECHADO: valor fora do formato não é limpo nem escapado, é
 *    DESCARTADO. Rastreamento que não carrega é um problema visível na
 *    tela de Tráfego; rastreamento que carrega código de terceiro não é
 *    visível em lugar nenhum.
 */
function apenasSeSeguro(valor: string, formato: RegExp): string {
  return formato.test(valor) ? valor : ''
}

/**
 * ⚠️ OS TERCEIROS CARREGAM DEPOIS, e o motivo está no PageSpeed de 17/09.
 *
 *    GTM (com GA4, Clarity e o que mais estiver no contêiner) e o pixel
 *    da Meta somavam ~520 KB e o grosso do tempo bloqueado da página: na
 *    página de entrada, 590 ms de TBT, quase tudo deles; na home, 330 ms,
 *    disputando a CPU com a foto que é o LCP. Num celular mediano em 4G,
 *    é esse o tempo em que o botão do grupo não responde ao toque.
 *
 *    Agora eles entram no PRIMEIRO SINAL DE GENTE — toque, rolagem,
 *    tecla, mouse — ou cinco segundos depois do `load`, o que vier antes.
 *
 * ⚠️ A META NÃO PERDE NADA COM ISSO, e é por isso que o pixel virou
 *    fila. O `fbq` passa a existir na hora, como o trecho oficial faz
 *    (fila e `init`), só sem baixar o fbevents.js. O PageView e os
 *    eventos do site entram na fila com o `eventID` de sempre, e a cópia
 *    de cada um sai pelo SERVIDOR imediatamente (Conversions API) — é ela
 *    que a campanha usa. Quando o script chega, a fila é enviada e a
 *    Meta deduplica pelo id.
 *
 *    O que muda de verdade: quem sai em menos de cinco segundos sem
 *    tocar em nada não entra no GA4 nem no Clarity. `TERCEIROS_NA_HORA=1`
 *    na Vercel volta ao carregamento imediato.
 */
const ESPERA_SEM_TOQUE_MS = 5_000

const SINAIS_DE_GENTE = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel', 'mousemove'] as const

/**
 * Uma vez por carga de página, mesmo com o StrictMode remontando.
 *
 * Um para cada, e não um só: as autorizações chegam separadas. Quem
 * aceitou só desempenho e depois liga publicidade em "Gerenciar cookies"
 * precisa receber o pixel sem o GTM ser inserido de novo.
 */
let gtmInserido = false
let pixelInserido = false

type FilaDoPixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: unknown
  loaded: boolean
  version: string
}

/**
 * O trecho oficial do pixel, SEM a linha que baixa o fbevents.js.
 *
 * É a mesma fila que a Meta entrega: quem chama `fbq` antes do script
 * chegar é enfileirado, e o script processa a fila ao carregar.
 */
function criarFilaDoPixel(pixelId: string): void {
  const w = window as unknown as { fbq?: FilaDoPixel; _fbq?: FilaDoPixel }
  if (w.fbq) return

  const fila = function (...args: unknown[]) {
    if (fila.callMethod) fila.callMethod(...args)
    else fila.queue.push(args)
  } as FilaDoPixel
  fila.push = fila
  fila.loaded = true
  fila.version = '2.0'
  fila.queue = []
  w.fbq = fila
  if (!w._fbq) w._fbq = fila

  fila('set', 'autoConfig', false, pixelId)
  fila('init', pixelId)
}

function inserirScript(src: string): void {
  const script = document.createElement('script')
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

/** O trecho oficial do GTM, no momento em que ele deve rodar. */
function iniciarGtm(gtmId: string): void {
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  inserirScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`)
}

export function Trafego({
  adiar = true,
  ...props
}: TrafegoPublico & {
  /** Carregar GTM e pixel só no primeiro sinal de gente. Ver acima. */
  adiar?: boolean
}) {
  const metaPixelId = apenasSeSeguro(props.metaPixelId, /^\d{6,20}$/)
  const gtmId = apenasSeSeguro(props.gtmId, /^GTM-[A-Z0-9]{4,12}$/)

  // `undefined` no servidor e na hidratação, `null` sem escolha: nos dois
  // casos, nada carrega. Ver `useConsentimento`.
  const consentimento = useConsentimento()
  const comGtm = Boolean(gtmId && consentimento?.desempenho)
  const comPixel = Boolean(metaPixelId && consentimento?.publicidade)

  /**
   * Já contamos esta carga de página?
   *
   * ⚠️ SEM ISTO, UMA VISITA VIRA DUAS. O efeito abaixo roda de novo a
   *    cada remontagem — em desenvolvimento o StrictMode do React
   *    monta tudo duas vezes de propósito. Cada repetição geraria um
   *    id NOVO, então a Meta não teria como reconhecer a segunda como
   *    cópia: seriam dois PageView legítimos aos olhos dela. O ref
   *    sobrevive à remontagem porque não é estado de render.
   *
   * ⚠️ E POR QUE UMA VEZ POR CARGA, E NÃO POR TELA. Esta foi a
   *    descoberta que só apareceu medindo o tráfego de verdade.
   *
   *    Na navegação interna — de / para /grupos, sem recarregar — o
   *    próprio pixel da Meta dispara um PageView por conta dele, SEM
   *    `eventID`, e ainda descarta o nosso logo em seguida por
   *    considerá-lo repetido. O resultado seria o pior dos dois
   *    mundos: no navegador conta o dele, que não tem id; no servidor
   *    chega o nosso, que tem — e sem par, a Meta conta os dois.
   *
   *    Disparar só na carga inicial elimina a ambiguidade: ali o
   *    nosso é o único, com id nos dois lados. Nas telas seguintes
   *    fica valendo o PageView do próprio pixel, só pelo navegador.
   *
   *    O que se perde é a cobertura de servidor da SEGUNDA tela em
   *    diante, e é um preço pequeno: PageView não é a conversão desta
   *    página — `Lead` é, e esse continua saindo pelos dois caminhos,
   *    com id, sempre. Entre medir a menos e medir a mais, medir a
   *    menos é o erro que não faz a campanha gastar errado.
   */
  const jaContada = useRef(false)

  // ⚠️ A PRÉVIA DO PAINEL NÃO CONTA. Ela recarrega a página a cada
  //    salvamento dentro de um quadro — sem esta saída, cada vírgula
  //    ajustada viraria uma visita no Gerenciador de Eventos, e o
  //    público de remarketing da campanha encheria de gente da própria
  //    equipe. Mesma razão que já vale para a métrica interna.
  const previa =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('previa')

  // ⚠️ ANTES DO EFEITO DO PAGEVIEW, e a ordem importa: efeitos rodam na
  //    ordem em que são declarados. A fila do pixel precisa existir quando
  //    o PageView for disparado logo abaixo — senão ele esperaria o script
  //    de verdade, que agora só chega no primeiro toque.
  useEffect(() => {
    if (previa || (!comGtm && !comPixel)) return
    if (comPixel) criarFilaDoPixel(metaPixelId)
    if ((!comGtm || gtmInserido) && (!comPixel || pixelInserido)) return

    let relogio: ReturnType<typeof setTimeout> | undefined

    const carregar = () => {
      desligar()
      if (comGtm && !gtmInserido) {
        gtmInserido = true
        iniciarGtm(gtmId)
      }
      if (comPixel && !pixelInserido) {
        pixelInserido = true
        inserirScript('https://connect.facebook.net/en_US/fbevents.js')
      }
    }

    const depoisDoLoad = () => {
      relogio = setTimeout(carregar, ESPERA_SEM_TOQUE_MS)
    }

    function desligar() {
      for (const sinal of SINAIS_DE_GENTE) window.removeEventListener(sinal, carregar)
      window.removeEventListener('load', depoisDoLoad)
      if (relogio) clearTimeout(relogio)
    }

    // ⚠️ AUTORIZAÇÃO DADA AGORA, NO AVISO, CARREGA NA HORA. O toque no
    //    botão foi o sinal de gente — só que aconteceu antes de haver
    //    quem o escutasse. Esperar outro deixaria a primeira tela de quem
    //    aceitou sem PageView, e muita gente aceita e já toca no grupo.
    if (!adiar || salvoAgoraPouco()) {
      carregar()
      return
    }

    for (const sinal of SINAIS_DE_GENTE) {
      window.addEventListener(sinal, carregar, { passive: true })
    }
    if (document.readyState === 'complete') depoisDoLoad()
    else window.addEventListener('load', depoisDoLoad, { once: true })

    return desligar
  }, [metaPixelId, gtmId, comGtm, comPixel, previa, adiar])

  // Sem autorização de publicidade, sem PageView. Com ela dada no meio da
  // visita, o PageView sai nessa hora — é a mesma visita, agora autorizada.
  useEffect(() => {
    if (!comPixel || previa) return
    if (jaContada.current) return
    jaContada.current = true

    // Um id por visualização, usado nos dois lados.
    const eventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `pv-${Date.now()}-${Math.random().toString(36).slice(2)}`

    // ⚠️ ESPERA O `fbq` EXISTIR. Com `afterInteractive`, o trecho do
    //    pixel roda DEPOIS da hidratação — este efeito quase sempre
    //    chega primeiro. Um `if (!fbq) return` seco perderia o
    //    PageView da primeira tela, que é a mais importante de todas.
    //    A espera é curta e termina sozinha: dez tentativas de 200ms.
    let tentativas = 0
    let relogio: ReturnType<typeof setInterval> | null = null
    let cancelado = false

    const disparar = () => {
      const w = window as unknown as { fbq?: (...a: unknown[]) => void }
      if (typeof w.fbq !== 'function') return false
      w.fbq('track', 'PageView', {}, { eventID: eventId })

      // O mesmo id pelo servidor. Rota própria, sem banco: a métrica
      // interna do painel já conta visita por outro caminho, e gravar
      // aqui de novo dobraria o número que a campanha lê.
      try {
        void fetch('/api/trafego/pv', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ eventId, url: window.location.href }),
          keepalive: true,
        })
      } catch {
        // Rastreamento nunca pode quebrar a página.
      }
      return true
    }

    if (!disparar()) {
      relogio = setInterval(() => {
        if (cancelado || disparar() || ++tentativas >= 10) {
          if (relogio) clearInterval(relogio)
        }
      }, 200)
    }

    return () => {
      cancelado = true
      if (relogio) clearInterval(relogio)
    }
  }, [comPixel, previa])

  // ⚠️ SEM O `<noscript>` DO GTM. Sem JavaScript o aviso de cookies não
  //    aparece, ninguém autoriza nada — e o iframe do GTM carregaria
  //    mesmo assim. Tudo o que este componente faz está nos efeitos.
  return null
}
