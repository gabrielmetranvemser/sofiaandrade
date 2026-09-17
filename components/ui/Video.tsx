'use client'

import { useEffect, useRef, useState } from 'react'
import {
  embedComOpcoes,
  interpretarVideo,
  larguraDoVideo,
  opcoesValidas,
  RAZAO,
  type FormatoVideo,
  type OpcoesVideo,
} from '@/lib/video'

/**
 * UM VÍDEO, COM FACHADA.
 *
 * Duas decisões carregam este componente inteiro:
 *
 * 1. ELE SOME SOZINHO. Sem link, ou com link que não dá para tocar,
 *    devolve `null`. É o que permitiu subir os oito pontos de vídeo da
 *    página com os campos VAZIOS: enquanto a campanha não cola os
 *    endereços, a página fica exatamente como estava. Nenhum bloco
 *    reservado, nenhum "em breve", nenhum buraco.
 *
 * 2. NADA DE TERCEIRO CARREGA ANTES DO CLIQUE. O que aparece é uma
 *    capa e um botão de play — HTML nosso. O <iframe> só é montado
 *    quando a pessoa decide assistir.
 *
 *    Isso não é purismo. Um <iframe> do YouTube custa cerca de 900 kB
 *    e abre conexão com quatro domínios NO CARREGAMENTO DA PÁGINA,
 *    tenha alguém apertado play ou não. Com oito vídeos na trilha,
 *    seriam oito. A primeira dobra desta página foi desenhada com
 *    orçamento de 3 segundos até o botão principal ficar clicável num
 *    celular mediano em 4G — embed solto joga esse orçamento fora.
 *
 *    O outro lado é a política de privacidade, que afirma que aqui não
 *    se monta perfil de navegação. Com a fachada, quem nunca clica
 *    nunca é visto pelo provedor.
 *
 * ⚠️ MODO CONTROLADO. Passe `aberto`/`onAbrir` quando houver VÁRIOS
 *    vídeos juntos e só um puder tocar por vez (é o caso da trilha, com
 *    oito). Sem essas props ele cuida do próprio estado.
 */

interface Props {
  /** O que a campanha colou no painel. Vazio = componente some. */
  url: string
  formato?: FormatoVideo
  /** Vira o rótulo do botão de play. Importa para leitor de tela. */
  titulo?: string
  className?: string
  /** Controlado: quem manda é o pai. Ver a trilha. */
  aberto?: boolean
  onAbrir?: () => void
  /**
   * O TETO DE ALTURA do quadro, em CSS.
   *
   * ⚠️ EXISTE PORQUE VÍDEO EM PÉ NÃO CABE EM COLUNA LARGA. Com a
   *    proporção 9/16, um bloco de 768px de largura vira 1365px de
   *    altura — uma tela e meia de vídeo entre dois parágrafos. Quem
   *    manda no tamanho aqui é a ALTURA, e a largura é consequência
   *    dela (ver o cálculo em `medida`, abaixo).
   *
   *    Passe um valor quando o lugar pedir outro teto — a fita da
   *    trilha, por exemplo, iguala a altura de todos os cartões para
   *    que deitado e em pé convivam na mesma fila.
   */
  alturaMax?: string
  /**
   * QUEM MANDA NA LARGURA É A COLUNA, e não o teto de altura.
   *
   * ⚠️ EXISTE PARA MATAR A CALHA BRANCA. Por padrão o vídeo em pé
   *    recebe `max-width` derivada do teto de altura e se centra no
   *    lugar que recebeu — o que é certo quando o lugar é largo (um
   *    parágrafo, uma seção inteira) e errado quando a coluna FOI
   *    DESENHADA para ele. Aí o `max-width` sobra: o vídeo fica no
   *    meio de uma coluna do tamanho dele, com duas faixas de ar de
   *    poucos pixels que não se explicam.
   *
   *    Com `preencher`, a largura é 100% da coluna e a altura sai da
   *    proporção. Quem responde pelo tamanho passa a ser a grade —
   *    que é o que faz as bordas baterem com as dos vizinhos.
   */
  preencher?: boolean
  /**
   * Ajustes de player vindos do painel.
   *
   * ⚠️ `unknown` DE PROPÓSITO. O tipo do conteúdo editável alarga todo
   *    literal para `string` — `'ao-clicar'` chega aqui como `string`,
   *    e um tipo estreito recusaria o próprio dado do painel. Quem
   *    aperta a forma é `opcoesValidas`, em tempo de execução, que é
   *    onde a garantia vale: o valor vem do banco, e banco não tem tipo.
   */
  opcoes?: unknown
}

export function Video({
  url,
  formato = 'deitado',
  titulo,
  className = '',
  aberto,
  onAbrir,
  alturaMax,
  preencher = false,
  opcoes: opcoesBrutas,
}: Props) {
  const [abertoLocal, setAbertoLocal] = useState(false)
  const [naTela, setNaTela] = useState(false)
  /** A caixa está a menos de ~uma tela de distância? Ver o efeito abaixo. */
  const [perto, setPerto] = useState(false)
  const [mudo, setMudo] = useState(true)
  const caixa = useRef<HTMLDivElement>(null)

  const video = interpretarVideo(url)
  const opcoes = opcoesValidas(opcoesBrutas)
  const controlado = aberto !== undefined
  // ⚠️ AUTOPLAY NÃO VALE NA TRILHA. Lá o pai decide quem toca, e só um
  //    por vez; vários vídeos pedindo o palco ao mesmo tempo fariam a
  //    fita trocar sozinha enquanto a pessoa lê.
  const automatico = opcoes.inicio === 'automatico' && !controlado

  // ⚠️ SÓ QUANDO ENTRA NA TELA, e não no carregamento da página. Um
  //    vídeo tocando três dobras abaixo consome rede e bateria sem
  //    ninguém ver — e na trilha seriam oito ao mesmo tempo.
  useEffect(() => {
    if (!automatico) return
    const el = caixa.current
    if (!el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setNaTela(true)
          observador.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [automatico])

  // ⚠️ A PRÉVIA DE ARQUIVO PRÓPRIO SÓ BAIXA PERTO DA TELA. Com
  //    `preload="metadata"` desde o carregamento, o vídeo da história
  //    (72 MB, três dobras abaixo) começava a pedir pedaços ao CDN na
  //    abertura da home — banda de 4G gasta antes de a pessoa rolar, e um
  //    erro no console quando a conexão falhava (PageSpeed de 17/09).
  //    A 200 px da tela, e não mais longe: na home o vídeo da história
  //    fica em y≈1.200 no celular, e uma margem de 600 px já o alcançava
  //    na abertura da página, sem ninguém rolar.
  useEffect(() => {
    if (perto) return
    const el = caixa.current
    if (!el || !('IntersectionObserver' in window)) {
      setPerto(true)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setPerto(true)
          observador.disconnect()
        }
      },
      { rootMargin: '200px 200px' },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [perto])

  if (!video) return null

  const temBotao = Boolean(opcoes.botaoRotulo && opcoes.botaoDestino)
  const tocando = (controlado ? aberto : abertoLocal) || (automatico && naTela)
  const abrir = () => (controlado ? onAbrir?.() : setAbertoLocal(true))

  // ── O TAMANHO DO QUADRO ──────────────────────────────────────
  //
  // ⚠️ A CONTA COMEÇA NA ALTURA, e não na largura. Só assim os dois
  //    enquadramentos do acervo cabem no mesmo desenho de página:
  //
  //    · deitado, o teto quase nunca pega — a largura do lugar chega
  //      antes, e o vídeo se comporta como sempre se comportou.
  //    · em pé, o teto é a única coisa que impede o bloco de virar uma
  //      torre. 34rem de altura dão 19rem de largura, que é a medida de
  //      um celular na mão — que é exatamente o que o vídeo mostra.
  //
  //    `max-width` traduz o teto de altura em largura porque é a
  //    largura que o navegador resolve primeiro: com `aspect-ratio`, a
  //    altura é derivada. Limitar `max-height` direto deixaria a caixa
  //    larga e o vídeo com tarja dos dois lados dentro dela.
  //
  //    `mx-auto` fecha o assunto: sobrando espaço, o vídeo fica no meio
  //    do lugar que recebeu, em vez de encostado à esquerda.
  const medida = {
    aspectRatio: String(RAZAO[formato]),
    ...(preencher ? {} : { maxWidth: larguraDoVideo(formato, alturaMax) }),
  }
  const moldura =
    `relative isolate mx-auto w-full overflow-hidden rounded-2xl bg-azul-noite ${className}`

  if (tocando) {
    // ── Arquivo próprio (R2 e afins): player do navegador ──
    // Sem iframe e sem biblioteca. `controls` porque é o player nativo
    // e ele já traz barra, volume e tela cheia — reimplementar isso
    // seria trocar algo acessível de fábrica por algo nosso e pior.
    if (video.provedor === 'arquivo') {
      return (
        <div ref={caixa} className={moldura} style={medida}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={video.embed}
            title={titulo ?? 'Vídeo'}
            className="absolute inset-0 size-full bg-black object-contain"
            controls={opcoes.controles}
            controlsList={opcoes.telaCheia ? undefined : 'nofullscreen'}
            disablePictureInPicture={!opcoes.telaCheia}
            autoPlay
            // Autoplay com som é recusado pelo navegador e a chamada
            // falha calada — o vídeo ficaria parado no primeiro quadro.
            muted={automatico && mudo}
            loop={automatico}
            playsInline
            preload="metadata"
          />
          {automatico && mudo ? <BotaoDeSom onLigar={() => setMudo(false)} /> : null}
          {temBotao ? <BotaoNoVideo opcoes={opcoes} /> : null}
        </div>
      )
    }

    return (
      <div ref={caixa} className={moldura} style={medida}>
        <iframe
          src={embedComOpcoes(video, opcoes)}
          title={titulo ?? 'Vídeo'}
          className="absolute inset-0 size-full"
          allow={`accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture${
            opcoes.telaCheia ? '; fullscreen' : ''
          }`}
          allowFullScreen={opcoes.telaCheia}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {temBotao ? <BotaoNoVideo opcoes={opcoes} /> : null}
      </div>
    )
  }

  return (
    <button
      ref={caixa as unknown as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={abrir}
      style={medida}
      className={`group toque block cursor-pointer ${moldura}`}
      aria-label={titulo ? `Assistir: ${titulo}` : 'Assistir ao vídeo'}
    >
      {/* ⚠️ A CAPA DE UM ARQUIVO PRÓPRIO É O PRÓPRIO VÍDEO, parado no
          primeiro quadro. YouTube e Vimeo entregam miniatura; o R2
          entrega bytes. A alternativa seria pedir à campanha uma imagem
          de capa para cada vídeo — mais um campo, mais um upload, mais
          uma coisa para esquecer.

          `preload="metadata"` mais o fragmento `#t=0.1` fazem o
          navegador buscar só o cabeçalho e um quadro por requisição de
          intervalo: alguns kB, não o arquivo inteiro. `muted` e
          `playsInline` são o que impede o iOS de assumir o controle da
          tela ao encostar no elemento. */}
      {video.provedor === 'arquivo' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={perto ? `${video.embed}#t=0.1` : undefined}
          className="absolute inset-0 size-full object-cover"
          preload={perto && opcoes.carregamento === 'com-previa' ? 'metadata' : 'none'}
          muted
          playsInline
          tabIndex={-1}
          aria-hidden
        />
      ) : video.capa ? (
        /* ⚠️ <img> COMUM, E NÃO next/image, DE PROPÓSITO.
           Passar a miniatura pelo otimizador exige declarar o domínio
           em next.config — e quando não bate, o Next não degrada: ele
           LANÇA, e a página inteira da campanha vira tela de erro.
           Foi o que aconteceu no primeiro vídeo do YouTube cadastrado.

           Amarrar o conteúdo do painel à configuração de build é a
           própria armadilha: cada provedor novo viraria um deploy. E o
           ganho seria mínimo — a miniatura já chega otimizada, com
           15 kB, da CDN do provedor.

           `object-cover` com escala corta as barras pretas: a capa do
           YouTube é 480×360 (4:3) e o quadro é 16:9. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.capa}
          alt=""
          loading={opcoes.carregamento === 'com-previa' ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 size-full scale-[1.35] object-cover transition-transform duration-500 group-hover:scale-[1.4]"
          aria-hidden
        />
      ) : null}

      {/* Escurece o suficiente para o play ler sobre qualquer quadro. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-azul-noite/80 via-azul-noite/20 to-azul-noite/30"
      />

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-amarelo shadow-alta transition-transform duration-300 ease-mola group-hover:scale-110 md:size-20">
          <svg viewBox="0 0 24 24" className="ml-1 size-7 text-azul-escuro md:size-9" fill="currentColor" aria-hidden>
            <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>
      </span>

      {titulo ? (
        <span className="absolute inset-x-0 bottom-0 p-5 text-left text-base font-medium text-white md:text-lg">
          {titulo}
        </span>
      ) : null}

      {temBotao ? <BotaoNoVideo opcoes={opcoes} /> : null}
    </button>
  )
}

/**
 * O convite para ligar o som.
 *
 * ⚠️ EXISTE PORQUE O AUTOPLAY É MUDO POR LEI DO NAVEGADOR. Sem este
 *    botão, um vídeo que começa sozinho e sem som parece quebrado — a
 *    pessoa vê a boca mexendo e não entende. Com ele, o mudo vira uma
 *    escolha visível em vez de um defeito.
 *
 *    Só aparece no arquivo próprio: ali o elemento é nosso e dá para
 *    tirar o mudo. No YouTube e no Vimeo, quem liga o som é o player
 *    deles — por isso a tela do painel avisa para não desligar os
 *    controles quando o início é automático.
 */
function BotaoDeSom({ onLigar }: { onLigar: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onLigar()
      }}
      className="toque absolute top-4 left-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-black/60 px-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-black/80"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4Zm11.5 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 15.5 12Zm-2 8.7a8 8 0 0 0 0-17.4v2.06a6 6 0 0 1 0 13.28v2.06Z" />
      </svg>
      Ligar o som
    </button>
  )
}

/**
 * O botão sobre o vídeo.
 *
 * ⚠️ É UM <a> DENTRO DE UM <button> quando o vídeo ainda está fechado —
 *    aninhamento que o HTML não permite. Por isso ele NÃO é filho do
 *    botão de play: fica em posição absoluta por cima, com `z-10`, e o
 *    `stopPropagation` impede que tocar nele também dispare o play.
 *
 *    Só destino interno (`/#grupos`). Deixar sair para fora do site
 *    seria transformar um campo do painel em redirecionamento aberto.
 */
function BotaoNoVideo({ opcoes }: { opcoes: OpcoesVideo }) {
  const destino = opcoes.botaoDestino ?? ''
  if (!destino.startsWith('/') && !destino.startsWith('#')) return null

  return (
    <a
      href={destino}
      onClick={(e) => e.stopPropagation()}
      className="toque absolute right-4 bottom-4 z-10 inline-flex min-h-11 items-center rounded-full bg-amarelo px-5 text-sm font-semibold text-azul-escuro shadow-alta transition-transform duration-300 hover:scale-105"
    >
      {opcoes.botaoRotulo}
    </a>
  )
}
