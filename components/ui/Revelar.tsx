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
    if (reduzido || !('IntersectionObserver' in window)) {
      document
        .querySelectorAll<HTMLElement>('[data-revelar]')
        .forEach((el) => el.setAttribute('data-visivel', 'true'))
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

    const passarAObservar = (raiz: ParentNode) => {
      raiz.querySelectorAll<HTMLElement>('[data-revelar]:not([data-visivel])').forEach((el) => {
        observador.observe(el)
      })
    }

    passarAObservar(document)

    // ⚠️ A consulta única no mount não bastava: qualquer elemento que
    //    entrasse no DOM depois (resultado de busca, item de lista
    //    aberto, etapa do filtro) ficava preso em opacity: 0 para
    //    sempre. Com o conteúdo vindo do admin isso só piora.
    const mutacoes = new MutationObserver((lista) => {
      for (const m of lista) {
        m.addedNodes.forEach((no) => {
          if (no.nodeType !== Node.ELEMENT_NODE) return
          const el = no as HTMLElement
          if (el.matches?.('[data-revelar]')) observador.observe(el)
          passarAObservar(el)
        })
      }
    })
    mutacoes.observe(document.body, { childList: true, subtree: true })

    return () => {
      observador.disconnect()
      mutacoes.disconnect()
    }
  }, [])

  return null
}
