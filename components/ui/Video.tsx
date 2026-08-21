'use client'

import Image from 'next/image'
import { useState } from 'react'
import { interpretarVideo, type FormatoVideo } from '@/lib/video'

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
}

export function Video({
  url,
  formato = 'deitado',
  titulo,
  className = '',
  aberto,
  onAbrir,
}: Props) {
  const [abertoLocal, setAbertoLocal] = useState(false)

  const video = interpretarVideo(url)
  if (!video) return null

  const controlado = aberto !== undefined
  const tocando = controlado ? aberto : abertoLocal
  const abrir = () => (controlado ? onAbrir?.() : setAbertoLocal(true))

  const proporcao = formato === 'em-pe' ? 'aspect-[9/16]' : 'aspect-video'
  const moldura =
    `relative isolate overflow-hidden rounded-2xl bg-azul-noite ${proporcao} ${className}`

  if (tocando) {
    return (
      <div className={moldura}>
        <iframe
          src={video.embed}
          title={titulo ?? 'Vídeo'}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={abrir}
      className={`group toque block w-full cursor-pointer ${moldura}`}
      aria-label={titulo ? `Assistir: ${titulo}` : 'Assistir ao vídeo'}
    >
      {video.capa ? (
        <Image
          src={video.capa}
          alt=""
          fill
          // A capa do YouTube é 480×360 (4:3) com barras pretas em cima
          // e embaixo. `object-cover` com escala corta as barras e
          // devolve o quadro 16:9 real. Sem isso, todo cartaz da página
          // apareceria com duas tarjas pretas.
          className="scale-[1.35] object-cover transition-transform duration-500 group-hover:scale-[1.4]"
          sizes="(max-width: 768px) 100vw, 50vw"
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
    </button>
  )
}
