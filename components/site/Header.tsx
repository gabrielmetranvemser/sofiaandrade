'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { candidata, ctas, navegacao } from '@/content/copy'
import { evento } from '@/lib/eventos'

export function Header({ silencio = false }: { silencio?: boolean }) {
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 16)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
      <div className="container-lp">
        <div
          className={`flex h-16 items-center justify-between gap-4 rounded-full px-3 pl-5 transition-all duration-300 ${
            rolou || aberto
              ? 'border border-linha bg-white/90 shadow-suave backdrop-blur-xl'
              : 'border border-transparent bg-white/0'
          }`}
        >
          <Link href="/" className="flex items-center gap-3" aria-label={`${candidata.nome} — início`}>
            {/* LOGO: trocar por <Image> quando a arte chegar */}
            <span className="flex size-10 items-center justify-center rounded-xl bg-azul text-[0.8125rem] font-bold tracking-tight text-white">
              2233
            </span>
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-titulo)] text-[1.0625rem] font-bold tracking-[-0.02em]">
                {candidata.nome}
              </span>
              <span className="block text-[0.6875rem] font-medium tracking-[0.08em] text-grafite">
                {candidata.cargo} · {candidata.estado}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {navegacao.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2.5 text-[0.9375rem] font-medium text-grafite transition-colors hover:bg-azul-suave hover:text-azul"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!silencio ? (
              <Link
                href="/#grupos"
                onClick={() => evento('clicou_grupo', { origem: 'topo' })}
                className="hidden min-h-11 items-center rounded-full bg-azul px-5 text-[0.9375rem] font-semibold text-white shadow-suave transition-colors hover:bg-marinho sm:inline-flex"
              >
                {ctas.grupoCurto}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-mobile"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex size-12 items-center justify-center rounded-full text-marinho transition-colors hover:bg-azul-suave lg:hidden"
            >
              <span className="relative block h-3.5 w-5" aria-hidden>
                <span
                  className={`absolute inset-x-0 h-[2px] rounded-full bg-current transition-all duration-300 ${
                    aberto ? 'top-1/2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 ${
                    aberto ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute inset-x-0 h-[2px] rounded-full bg-current transition-all duration-300 ${
                    aberto ? 'top-1/2 -rotate-45' : 'bottom-0'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {aberto ? (
          <nav
            id="menu-mobile"
            className="mt-2 rounded-2xl border border-linha bg-white p-2 shadow-media lg:hidden"
            aria-label="Menu mobile"
          >
            {navegacao.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className="flex min-h-14 items-center rounded-xl px-4 text-lg font-medium transition-colors hover:bg-azul-suave"
              >
                {item.rotulo}
              </Link>
            ))}
            {!silencio ? (
              <Link
                href="/#grupos"
                onClick={() => {
                  setAberto(false)
                  evento('clicou_grupo', { origem: 'topo' })
                }}
                className="mt-2 flex min-h-14 items-center justify-center rounded-full bg-azul px-6 font-semibold text-white"
              >
                {ctas.grupo}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  )
}
