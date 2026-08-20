import type { ReactNode } from 'react'

interface Props {
  id?: string
  children: ReactNode
  /**
   * Só cor cheia ou branco. Nada de pastel: fundo lavado tira a força
   * da paleta e deixa a página com cara de apresentação corporativa.
   */
  fundo?: 'branco' | 'areia' | 'azul-profundo' | 'verde' | 'amarelo'
  className?: string
  /** Espaçamento vertical. 'solto' para as seções principais. */
  espaco?: 'normal' | 'solto'
}

const FUNDOS = {
  branco: 'bg-white text-tinta',
  areia: 'bg-areia text-tinta',
  // superfícies cheias: um matiz só, do claro ao escuro
  'azul-profundo': 'fundo-azul-profundo text-white',
  verde: 'fundo-verde text-white',
  // amarelo é chapado — gradiente em amarelo suja para ocre
  amarelo: 'bg-amarelo text-azul-escuro',
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
      {/* A etiqueta é texto pequeno: sobre fundo escuro ela é branca,
          porque amarelo em 13px sobre o verde não passa em contraste.
          O traço, sim, é amarelo — é detalhe, não é leitura. */}
      {etiqueta ? (
        <p
          data-revelar
          className={`etiqueta ${centro ? 'justify-center' : ''} ${
            tom === 'escuro' ? 'text-white' : 'text-azul-escuro'
          }`}
        >
          <span
            className={`inline-block h-px w-8 ${
              tom === 'escuro' ? 'bg-amarelo' : 'bg-azul/45'
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
            tom === 'escuro' ? 'text-white/80' : 'text-grafite'
          } ${centro ? 'mx-auto' : ''}`}
        >
          {intro}
        </p>
      ) : null}
    </header>
  )
}
