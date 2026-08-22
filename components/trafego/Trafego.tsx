'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import type { TrafegoPublico } from '@/lib/trafego/tipos'

/**
 * O PIXEL DA META E O GOOGLE TAG MANAGER.
 *
 * Os dois só existem se a tela de Tráfego, no painel, tiver o id. Campo
 * vazio não carrega nada — nem uma tag, nem uma requisição.
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

export function Trafego(props: TrafegoPublico) {
  const metaPixelId = apenasSeSeguro(props.metaPixelId, /^\d{6,20}$/)
  const gtmId = apenasSeSeguro(props.gtmId, /^GTM-[A-Z0-9]{4,12}$/)

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

  useEffect(() => {
    if (!metaPixelId || previa) return
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
  }, [metaPixelId, previa])

  if (previa) return null

  return (
    <>
      {gtmId ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('set','autoConfig',false,'${metaPixelId}');fbq('init','${metaPixelId}');`}
        </Script>
      ) : null}
    </>
  )
}
