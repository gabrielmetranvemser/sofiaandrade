'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento } from '@/lib/eventos'

/**
 * O botão que segue a pessoa. Aparece depois do hero e some quando
 * a seção de grupos entra em tela — se o alvo já está visível,
 * o flutuante vira estorvo.
 *
 * A origem 'flutuante' no evento é o que responde, em duas semanas,
 * se ele trabalha ou é enfeite.
 */
export function BotaoFlutuante({
  silencio = false,
  destino = '/#grupos',
}: {
  silencio?: boolean
  /** Muda para /grupos quando a seção de grupos está desligada. */
  destino?: string
}) {
  const { ctas } = useConteudo()
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (silencio) return

    const alvo = document.getElementById('grupos')
    let gruposNaTela = false

    const observador = alvo
      ? new IntersectionObserver(
          ([e]) => {
            gruposNaTela = e.isIntersecting
            setVisivel(window.scrollY > 560 && !gruposNaTela)
          },
          { threshold: 0.12 },
        )
      : null
    if (alvo && observador) observador.observe(alvo)

    const aoRolar = () => setVisivel(window.scrollY > 560 && !gruposNaTela)
    window.addEventListener('scroll', aoRolar, { passive: true })
    aoRolar()

    return () => {
      window.removeEventListener('scroll', aoRolar)
      observador?.disconnect()
    }
  }, [silencio])

  if (silencio) return null

  return (
    <div
      // pb inclui a área segura do iPhone: sem isso o botão fica
      // debaixo do indicador de home e o toque cai no gesto do sistema
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pt-4 transition-all duration-500 md:inset-x-auto md:right-6 md:bottom-6 md:p-0 ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
    >
      <Link
        href={destino}
        onClick={() => evento('clicou_cta', { origem: 'flutuante' })}
        className="toque flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-verde px-7 font-semibold text-white shadow-alta transition-all duration-300 hover:brightness-110 md:w-auto"
      >
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Z" />
        </svg>
        <span>{ctas.grupoCurto}</span>
      </Link>
    </div>
  )
}
