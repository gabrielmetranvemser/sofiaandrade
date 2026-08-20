'use client'

import Image from 'next/image'
import { useConteudo } from '@/lib/conteudo/contexto'

/**
 * A marca da campanha.
 *
 * O `Image` do Next entra onde a arte é raster, com `sizes` certo:
 * os originais têm até 32.508px de largura e o público está em 4G.
 *
 * ⚠️ É Client Component por necessidade, não por escolha: o `Header`
 *    (que é cliente) o importa, então na prática ele já era cliente.
 *    Como o texto alternativo vem do conteúdo editável, precisa do hook.
 */

/**
 * O símbolo: a bandeira da marca.
 *
 * Vem embutido em vetor, e não como PNG, porque o PNG que existia era
 * um recorte do logotipo com o desenho ENCOSTANDO nas bordas do
 * arquivo — no cabeçalho a bandeira aparecia fatiada em cima e
 * embaixo. Recortar mais largo do original não salva: no logotipo o
 * "O" da palavra SOFIA é este símbolo, e as letras vizinhas encostam
 * nele, então qualquer caixa que pegue o anel inteiro leva pedaço do
 * S e do F junto.
 *
 * As proporções e as cores foram MEDIDAS do arquivo da marca, não
 * estimadas. Embutido custa zero requisição e nunca corta.
 */
export function Simbolo({
  className = '',
  url = null,
  prioridade = false,
}: {
  className?: string
  /**
   * Imagem enviada pelo painel (espaço `marca.simbolo`). Quando existe,
   * ela manda; quando não, cai no vetor embutido abaixo.
   *
   * ⚠️ O vetor NÃO é um placeholder à espera de arte: ele é a arte que
   *    funciona. O PNG que existia cortava a bandeira no cabeçalho, e o
   *    original não tem recorte limpo (o "O" de SOFIA é o próprio
   *    símbolo, com as letras vizinhas encostadas). Por isso o padrão é
   *    o desenho em código, e a imagem do painel é a exceção.
   */
  url?: string | null
  prioridade?: boolean
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={512}
        height={379}
        priority={prioridade}
        sizes="64px"
        className={className}
        aria-hidden
      />
    )
  }

  return (
    <svg viewBox="0 0 1352 1000" className={className} role="img" aria-hidden focusable="false">
      <defs>
        <clipPath id="simbolo-caixa">
          <rect width="1352" height="1000" rx="235" ry="235" />
        </clipPath>
      </defs>
      <g clipPath="url(#simbolo-caixa)">
        <rect width="1352" height="1000" fill="#639951" />
        <path d="M676 52 1300 500 676 948 52 500Z" fill="#f8dc4c" />
        <circle cx="676" cy="500" r="292" fill="#2c6db3" />
        {/* A faixa da marca. Ela DESCE da esquerda para a direita, com
            uma subida leve no primeiro terço — o traçado saiu de medir
            o arquivo original coluna por coluna, e não de olhar: o
            centro da faixa vai de 51% da altura em x=5%, sobe até
            46,6% em x=35% e cai para 62,5% em x=90%, com espessura
            constante de 18,8%. Desenhada de memória, ela saiu
            espelhada. */}
        <path
          d="M-40 416 C 180 400, 330 372, 473 372 C 700 372, 900 470, 1392 584 L 1392 772 C 900 658, 700 560, 473 560 C 330 560, 180 588, -40 604 Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  )
}

/** Versão larga, branca. Só sobre fundo escuro. */
export function LogoHorizontal({ className = '' }: { className?: string }) {
  const { candidata } = useConteudo()
  return (
    <Image
      src="/marca/logo-horizontal-branco.png"
      alt={`${candidata.nome} — ${candidata.cargo}`}
      width={900}
      height={145}
      sizes="(max-width: 768px) 80vw, 420px"
      className={className}
    />
  )
}

/**
 * O 2233 na arte oficial da campanha.
 *
 * Uma versão só: a variante `cheio` (com sombra azul) nunca foi usada
 * em lugar nenhum, e o PNG dela ficava 62 kB parado no deploy.
 */
export function Numero({
  className = '',
  prioridade = false,
}: {
  className?: string
  prioridade?: boolean
}) {
  const { candidata } = useConteudo()
  return (
    <Image
      src="/marca/numero-2233-amarelo.png"
      alt={`Número ${candidata.numero}`}
      width={700}
      height={188}
      priority={prioridade}
      sizes="(max-width: 768px) 60vw, 380px"
      className={className}
    />
  )
}
