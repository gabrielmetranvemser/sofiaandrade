'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Video } from '@/components/ui/Video'
import { emPe, formatoValido } from '@/lib/video'

interface Item {
  id: string
  titulo: string
  url: string
  formato: string
  opcoes?: unknown
}

/**
 * A FITA DE VÍDEOS — um carrossel de verdade, com setas.
 *
 * ⚠️ ISTO JÁ ANDOU COM A ROLAGEM DA PÁGINA e voltou atrás. O mecanismo
 *    era o mesmo de Compromissos: a tela prendia e a fila caminhava de
 *    lado conforme a página descia. Em texto curto aquilo é um efeito;
 *    em vídeo é uma armadilha, por três motivos que aparecem juntos:
 *
 *    · Para VOLTAR ao vídeo anterior é preciso rolar a página para
 *      cima — o gesto de "voltar no conteúdo" e o de "voltar na
 *      página" viram o mesmo gesto, e um desfaz o outro.
 *    · Quem apertou play perde o vídeo de vista ao continuar rolando,
 *      e quem para de rolar para assistir prende a página inteira.
 *    · Quem não quer a seção precisa atravessar oito cartões de
 *      rolagem para chegar aos grupos de WhatsApp, que é o destino que
 *      a página existe para alcançar.
 *
 *    Agora a fita é uma barra rolável comum com encaixe: o dedo
 *    arrasta, as setas andam um cartão por vez, e a rolagem vertical
 *    volta a ser só rolagem vertical.
 *
 * ⚠️ ALTURA IGUAL, LARGURA DIFERENTE. É o que permite deitado e em pé
 *    na mesma fila sem tarja preta e sem degrau: os dois cartões têm a
 *    mesma altura e cada um recebe a largura que a sua proporção pede.
 *    Igualar a LARGURA — o que a fita antiga fazia, com `w-[26rem]`
 *    para todo mundo — é o que produzia o vídeo em pé espremido no
 *    meio de um quadro deitado.
 */

/** O teto de altura dos cartões. Um valor só, e tudo deriva dele. */
const ALTURA = 'min(54svh, 22rem)'

/**
 * ATÉ AQUI A FITA VIRA GRADE.
 *
 * ⚠️ SEIS É O LIMITE, E É UM NÚMERO DE LEITURA, NÃO DE LARGURA. Numa
 *    fila de 1136 px, seis vídeos em pé ficam com 173 px cada — a
 *    largura de uma miniatura, ainda reconhecível. No sétimo o cartão
 *    passa a ser pequeno demais para se saber o que tem dentro antes
 *    de clicar, e aí a barra rolável volta a ser a resposta certa:
 *    melhor mostrar quatro em tamanho de gente e deixar rolar do que
 *    espremer oito.
 */
const MAXIMO_NA_GRADE = 6

/** A largura de um cartão da grade quando sobra espaço (poucos vídeos). */
const LARGURA_MAXIMA_DO_CARTAO = 22

export function FitaDeVideos({ itens }: { itens: readonly Item[] }) {
  const [aberto, setAberto] = useState<string | null>(null)
  const pista = useRef<HTMLOListElement>(null)
  const [pode, setPode] = useState({ antes: false, depois: false })

  /**
   * ⚠️ DOIS MODOS, E O QUE DECIDE É O ENQUADRAMENTO MAIS O NÚMERO.
   *
   *    GRADE — todos em pé e no máximo seis. Os cartões dividem a
   *    largura da seção em partes iguais e a fila termina exatamente na
   *    borda direita. Era esse o defeito relatado: com quatro vídeos em
   *    pé, a barra rolável colocava quatro cartões de 198 px à
   *    esquerda e deixava 284 px de azul vazio à direita, com as duas
   *    setas apagadas por cima — a seção prometia mais conteúdo e não
   *    tinha.
   *
   *    BARRA ROLÁVEL — o resto: sete ou mais, qualquer vídeo deitado,
   *    ou a mistura dos dois. Deitado, quatro cartões numa fila de 1136
   *    dariam 269 px de largura por 151 de altura, que é miniatura de
   *    galeria, não vídeo de campanha. E na mistura a grade é
   *    impossível: colunas iguais com proporções diferentes produzem
   *    exatamente o cartão espremido que a fita existe para evitar.
   */
  const todosEmPe = itens.every((i) => emPe(formatoValido(i.formato)))
  const grade = todosEmPe && itens.length <= MAXIMO_NA_GRADE

  // As setas não podem mentir: apagadas quando não há para onde ir.
  // A folga de 2px é porque `scrollLeft` é fracionário em tela com
  // densidade alta e o fim da barra quase nunca é um inteiro exato.
  const medir = useCallback(() => {
    const el = pista.current
    if (!el) return
    setPode({
      antes: el.scrollLeft > 2,
      depois: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    })
  }, [])

  useEffect(() => {
    const el = pista.current
    if (!el) return
    medir()
    el.addEventListener('scroll', medir, { passive: true })
    // Girar o telefone muda quantos cartões cabem, e com eles o fim da
    // barra. Sem observar o tamanho, a seta da direita fica acesa numa
    // fita que já acabou.
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => {
      el.removeEventListener('scroll', medir)
      observador.disconnect()
    }
  }, [medir, itens.length])

  const andar = (direcao: 1 | -1) => {
    const el = pista.current
    if (!el) return
    // Um cartão por clique, medido no cartão que está lá — e não um
    // número fixo, porque a largura muda com o formato do vídeo.
    const cartao = el.querySelector('li')
    const passo = cartao ? cartao.getBoundingClientRect().width + 20 : el.clientWidth * 0.8
    const parado =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direcao * passo, behavior: parado ? 'auto' : 'smooth' })
  }

  // ── GRADE ────────────────────────────────────────────────────────
  if (grade) {
    return (
      <div className="container-lp mt-8">
        <ol
          aria-label="Vídeos da trilha"
          style={{
            ['--colunas' as string]: itens.length,
            // O teto existe para o caso de poucos vídeos: com dois, a
            // coluna de 1fr daria 558 px de largura e um vídeo em pé de
            // 992 de altura — uma tela inteira por cartão. Com o teto, a
            // fila fica no tamanho de sempre e se centra na seção.
            maxWidth: `calc(${itens.length} * ${LARGURA_MAXIMA_DO_CARTAO}rem + ${
              itens.length - 1
            } * 1.25rem)`,
          }}
          className="mx-auto grid grid-cols-2 gap-5 sm:grid-cols-3 lg:[grid-template-columns:repeat(var(--colunas),minmax(0,1fr))]"
        >
          {itens.map((item) => (
            <li key={item.id}>
              <Video
                url={item.url}
                formato={formatoValido(item.formato)}
                // Sem teto de altura e sem `max-width`: aqui quem manda
                // no tamanho é a coluna, e a altura é consequência dela.
                // É o que faz a fila terminar na borda da seção.
                preencher
                opcoes={item.opcoes as never}
                titulo={item.titulo}
                aberto={aberto === item.id}
                onAbrir={() => setAberto(item.id)}
              />
            </li>
          ))}
        </ol>
      </div>
    )
  }

  // ── BARRA ROLÁVEL ────────────────────────────────────────────────
  return (
    <div className="container-lp mt-8">
      {itens.length > 1 ? (
        <div className="mb-4 flex justify-end gap-2">
          <Seta sentido="anterior" ativa={pode.antes} onClick={() => andar(-1)} />
          <Seta sentido="proximo" ativa={pode.depois} onClick={() => andar(1)} />
        </div>
      ) : null}

      <ol
        ref={pista}
        // Foco de teclado porque é uma região rolável: sem `tabIndex`,
        // quem navega pelo teclado alcança as setas mas não a barra, e
        // as teclas de direção não têm onde agir.
        tabIndex={0}
        aria-label="Vídeos da trilha"
        className="fita-desliza items-center gap-5 pb-2"
      >
        {itens.map((item) => {
          const formato = formatoValido(item.formato)
          const razao = formato === 'em-pe' ? 9 / 16 : 16 / 9
          return (
            <li
              key={item.id}
              // A largura sai da altura comum. `max-w` é o freio do
              // celular: em pé cabe, mas um cartão deitado de 58svh
              // pediria quase o dobro da tela.
              style={{ width: `calc(${ALTURA} * ${razao})` }}
              className="max-w-[86vw] shrink-0 snap-start"
            >
              <Video
                url={item.url}
                formato={formato}
                alturaMax={ALTURA}
                opcoes={item.opcoes as never}
                titulo={item.titulo}
                aberto={aberto === item.id}
                onAbrir={() => setAberto(item.id)}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/**
 * Uma seta.
 *
 * ⚠️ `disabled` DE VERDADE, e não só apagada. Seta acesa que não anda
 *    é pior que seta ausente — a pessoa clica, nada acontece, e ela
 *    conclui que a página está quebrada.
 */
function Seta({
  sentido,
  ativa,
  onClick,
}: {
  sentido: 'anterior' | 'proximo'
  ativa: boolean
  onClick: () => void
}) {
  const proximo = sentido === 'proximo'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ativa}
      aria-label={proximo ? 'Próximos vídeos' : 'Vídeos anteriores'}
      className="toque flex size-11 items-center justify-center rounded-full border border-white/25 text-white transition-all duration-300 hover:border-amarelo hover:bg-amarelo hover:text-azul-escuro disabled:pointer-events-none disabled:opacity-25"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={proximo ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'} />
      </svg>
    </button>
  )
}
