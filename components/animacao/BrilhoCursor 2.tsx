'use client'

import { useEffect, useRef } from 'react'

/**
 * Brilho que segue o ponteiro no elemento em volta.
 *
 * Monta-se como filho do bloco que deve brilhar — o alvo é o
 * parentElement. Assim o consumidor não precisa de ref, e o bloco
 * continua sendo Server Component: só este pedacinho é cliente.
 *
 * Duas guardas antes de registrar qualquer coisa:
 *  · (pointer: fine) — no celular não existe cursor, então não existe
 *    listener, não existe rAF e o custo é exatamente zero
 *  · prefers-reduced-motion — quem pediu para parar, para
 *
 * O retângulo do alvo fica em cache. Ler getBoundingClientRect a cada
 * pointermove força recálculo de layout dezenas de vezes por segundo,
 * que é o tipo de coisa que só aparece no celular de quem não tem M1.
 */
export function BrilhoCursor() {
  const marca = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const alvo = marca.current?.parentElement
    if (!alvo) return

    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    let caixa = alvo.getBoundingClientRect()
    let quadro = 0
    let x = 0
    let y = 0

    const remedir = () => {
      caixa = alvo.getBoundingClientRect()
    }

    const aplicar = () => {
      quadro = 0
      alvo.style.setProperty('--cx', `${x}px`)
      alvo.style.setProperty('--cy', `${y}px`)
    }

    const mover = (e: PointerEvent) => {
      x = e.clientX - caixa.left
      y = e.clientY - caixa.top
      if (!quadro) quadro = requestAnimationFrame(aplicar)
    }

    const entrar = () => {
      remedir()
      alvo.style.setProperty('--brilho-op', '1')
    }

    const sair = () => alvo.style.setProperty('--brilho-op', '0')

    alvo.addEventListener('pointermove', mover, { passive: true })
    alvo.addEventListener('pointerenter', entrar)
    alvo.addEventListener('pointerleave', sair)
    window.addEventListener('scroll', remedir, { passive: true })
    window.addEventListener('resize', remedir)

    return () => {
      if (quadro) cancelAnimationFrame(quadro)
      alvo.removeEventListener('pointermove', mover)
      alvo.removeEventListener('pointerenter', entrar)
      alvo.removeEventListener('pointerleave', sair)
      window.removeEventListener('scroll', remedir)
      window.removeEventListener('resize', remedir)
      alvo.style.removeProperty('--brilho-op')
    }
  }, [])

  return <span ref={marca} aria-hidden className="hidden" />
}
