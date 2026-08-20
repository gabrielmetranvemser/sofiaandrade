import type { ReactNode } from 'react'

interface Props {
  id?: string
  children: ReactNode
  fundo?: 'branco' | 'areia' | 'azul-suave' | 'marinho' | 'verde-suave'
  className?: string
  /** Espaçamento vertical. 'solto' para as seções principais. */
  espaco?: 'normal' | 'solto'
}

const FUNDOS = {
  branco: 'bg-white text-marinho',
  areia: 'bg-areia text-marinho',
  'azul-suave': 'bg-azul-suave text-marinho',
  'verde-suave': 'bg-verde-suave text-marinho',
  marinho: 'bg-marinho text-white',
} as const

export function Secao({
  id,
  children,
  fundo = 'branco',
  className = '',
  espaco = 'normal',
}: Props) {
  return (
    <section
      id={id}
      className={`relative ${FUNDOS[fundo]} ${
        espaco === 'solto' ? 'py-20 md:py-32' : 'py-16 md:py-24'
      } ${className}`}
    >
      <div className="container-lp">{children}</div>
    </section>
  )
}

interface CabecalhoProps {
  etiqueta?: string
  titulo: ReactNode
  intro?: string
  tom?: 'claro' | 'escuro'
  /** Centraliza o bloco. Usado no CTA final e em seções de abertura. */
  centro?: boolean
  className?: string
}

export function CabecalhoSecao({
  etiqueta,
  titulo,
  intro,
  tom = 'claro',
  centro = false,
  className = '',
}: CabecalhoProps) {
  return (
    <header className={`${centro ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      {etiqueta ? (
        <p
          data-revelar
          className={`etiqueta ${centro ? 'justify-center' : ''} ${
            tom === 'escuro' ? 'text-amarelo' : 'text-azul'
          }`}
        >
          <span
            className={`inline-block h-px w-8 ${
              tom === 'escuro' ? 'bg-amarelo/60' : 'bg-azul/40'
            }`}
            aria-hidden
          />
          {etiqueta}
        </p>
      ) : null}

      <h2 data-revelar style={{ ['--atraso' as string]: '70ms' }} className="mt-4 titulo-secao">
        {titulo}
      </h2>

      {intro ? (
        <p
          data-revelar
          style={{ ['--atraso' as string]: '140ms' }}
          className={`mt-5 text-lg md:text-xl ${
            tom === 'escuro' ? 'text-white/75' : 'text-grafite'
          } ${centro ? 'mx-auto' : ''}`}
        >
          {intro}
        </p>
      ) : null}
    </header>
  )
}
