'use client'

import { useEffect } from 'react'

/**
 * Revelação no scroll com IntersectionObserver, um observador só para
 * a página inteira. Marca [data-visivel] nos elementos [data-revelar].
 *
 * Por que não uma biblioteca: cada kb conta num 4G de Rondônia, e o
 * teto do plano é 3 segundos até o botão principal ficar clicável.
 *
 * Também remove a classe .sem-js do html — sem JS, tudo aparece.
 */
export function Revelar() {
  useEffect(() => {
    document.documentElement.classList.remove('sem-js')

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alvos = document.querySelectorAll<HTMLElement>('[data-revelar]')

    if (reduzido || !('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.setAttribute('data-visivel', 'true'))
      return
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.setAttribute('data-visivel', 'true')
            observador.unobserve(entrada.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )

    alvos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
  }, [])

  return null
}
