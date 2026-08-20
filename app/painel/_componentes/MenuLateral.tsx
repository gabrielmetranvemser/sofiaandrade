'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { sair } from '../acoes'

/**
 * Menu lateral do painel.
 *
 * Cinco destinos, não mais. O antigo tinha três abas horizontais e
 * NENHUM indicador de onde você estava — nenhum `usePathname`, nenhum
 * `aria-current`. Aqui o item ativo é visível e anunciado.
 *
 * No celular vira uma gaveta: o painel é usado no telefone de um
 * coordenador em carreata, não só no desktop do escritório.
 */

export interface ItemMenu {
  href: string
  rotulo: string
  icone: string
}

export const ITENS: ItemMenu[] = [
  { href: '/painel', rotulo: 'Início', icone: 'M4 12 12 4l8 8v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z' },
  { href: '/painel/textos', rotulo: 'Textos', icone: 'M4 5h16v2H4V5Zm0 4h16v2H4V9Zm0 4h11v2H4v-2Zm0 4h11v2H4v-2Z' },
  { href: '/painel/grupos', rotulo: 'Grupos', icone: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 6.3 12.9l-2.1-2.1a5 5 0 1 0-8.4 0l-2.1 2.1A8 8 0 0 1 12 4Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z' },
  { href: '/painel/metricas', rotulo: 'Métricas', icone: 'M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z' },
]

export function MenuLateral({ children }: { children: React.ReactNode }) {
  const caminho = usePathname()
  const [aberto, setAberto] = useState(false)

  const ativo = (href: string) =>
    href === '/painel' ? caminho === '/painel' : caminho.startsWith(href)

  const lista = (
    <nav className="flex flex-col gap-1" aria-label="Seções do painel">
      {ITENS.map((item) => {
        const on = ativo(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            onClick={() => setAberto(false)}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium transition-colors ${
              on ? 'bg-azul text-white' : 'text-grafite hover:bg-azul-suave hover:text-azul-escuro'
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
              <path d={item.icone} />
            </svg>
            {item.rotulo}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Barra do celular */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-linha bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-linha"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
          </svg>
        </button>
        <span className="font-[family-name:var(--font-titulo)] font-bold tracking-[-0.02em]">
          Painel
        </span>
      </div>

      {aberto ? (
        <div className="border-b border-linha bg-white p-3 lg:hidden">
          {lista}
          <form action={sair} className="mt-1 border-t border-linha pt-1">
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[0.9375rem] font-medium text-grafite"
            >
              Sair
            </button>
          </form>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-linha bg-white p-4 lg:flex">
          <Link href="/painel" className="mb-6 flex items-center gap-3 px-1">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-azul text-[0.8125rem] font-bold text-white">
              2233
            </span>
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-titulo)] text-[0.9375rem] font-bold tracking-[-0.02em]">
                Painel
              </span>
              <span className="block text-xs text-grafite">Sofia Andrade</span>
            </span>
          </Link>

          {lista}

          <div className="mt-auto space-y-1 border-t border-linha pt-4">
            <Link
              href="/"
              target="_blank"
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium text-grafite transition-colors hover:bg-areia"
            >
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
                <path d="M14 3v2h3.6l-8.3 8.3 1.4 1.4L19 6.4V10h2V3h-7ZM5 5h5v2H7v10h10v-3h2v5H5V5Z" />
              </svg>
              Ver o site
            </Link>
            {/* Sair é ação, não destino — fica separado, depois da linha. */}
            <form action={sair}>
              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[0.9375rem] font-medium text-grafite transition-colors hover:bg-areia"
              >
                <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
                  <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3Zm6.6 3.6L15.2 8l3 3H9v2h9.2l-3 3 1.4 1.4L22 12l-5.4-5.4Z" />
                </svg>
                Sair
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </>
  )
}
