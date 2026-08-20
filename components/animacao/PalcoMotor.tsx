'use client'

import { useEffect, useRef } from 'react'

/**
 * Plano B da cena da bandeira.
 *
 * Onde o navegador tem animation-timeline, ele mesmo escreve --palco-p
 * a partir da rolagem e este componente devolve sem fazer nada — nem
 * um listener registrado. É o caminho da maioria.
 *
 * Onde não tem, a cena veio do servidor já empilhada (ver o bloco
 * @supports em globals.css) e aqui ela é reacendida: a classe
 * .palco-viva devolve o sticky e o recorte, e um listener de rolagem
 * escreve a mesma variável que o CSS escreveria. Mesma conta, mesmo
 * resultado, e a reversão sai de graça nos dois caminhos — --palco-p é
 * posição, não linha do tempo, então rolar para cima desfaz sozinho.
 */
export function PalcoMotor() {
  const marca = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const secao = marca.current?.closest<HTMLElement>('[data-palco]')
    if (!secao) return

    if (
      CSS.supports('animation-timeline', 'view()') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const trilho = secao.querySelector<HTMLElement>('.palco-trilho')
    const fixa = secao.querySelector<HTMLElement>('.palco-fixa')
    if (!trilho || !fixa) return

    secao.classList.add('palco-viva')

    let quadro = 0

    const calcular = () => {
      quadro = 0
      const r = trilho.getBoundingClientRect()
      const curso = r.height - window.innerHeight
      if (curso <= 0) return
      const p = Math.min(1, Math.max(0, -r.top / curso))
      fixa.style.setProperty('--palco-p', p.toFixed(4))
    }

    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(calcular)
    }

    calcular()
    window.addEventListener('scroll', agendar, { passive: true })
    window.addEventListener('resize', agendar)

    return () => {
      if (quadro) cancelAnimationFrame(quadro)
      window.removeEventListener('scroll', agendar)
      window.removeEventListener('resize', agendar)
      secao.classList.remove('palco-viva')
    }
  }, [])

  return <span ref={marca} aria-hidden className="hidden" />
}
