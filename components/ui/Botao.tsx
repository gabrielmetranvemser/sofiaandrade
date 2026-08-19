import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Botão em cápsula. Altura mínima de 48px vem daqui e não é
 * sobrescrevível por acidente: é a regra de alvo de toque do plano.
 */

type Variante = 'primario' | 'secundario' | 'contorno' | 'claro' | 'suave' | 'texto'
type Tamanho = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-azul text-white shadow-suave hover:bg-marinho hover:shadow-media',
  secundario:
    'bg-verde text-white shadow-suave hover:bg-verde/90 hover:shadow-media',
  contorno:
    'border border-current/25 bg-transparent hover:border-current/60 hover:bg-current/5',
  claro:
    'bg-white text-marinho border border-linha shadow-suave hover:border-azul/40 hover:text-azul',
  suave:
    'bg-azul-suave text-azul hover:bg-azul hover:text-white',
  texto:
    'bg-transparent px-0 underline decoration-1 underline-offset-[6px] decoration-current/35 hover:decoration-current',
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'min-h-11 px-5 text-[0.9375rem]',
  md: 'min-h-12 px-6 text-base',
  lg: 'min-h-14 px-8 text-lg',
}

const BASE =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-semibold ' +
  'leading-none tracking-[-0.01em] text-center transition-all duration-300 ease-out ' +
  'disabled:pointer-events-none disabled:opacity-45'

interface Comuns {
  variante?: Variante
  tamanho?: Tamanho
  children: ReactNode
  className?: string
}

export function BotaoLink({
  href,
  variante = 'primario',
  tamanho = 'md',
  className = '',
  children,
  ...resto
}: Comuns & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`} {...resto}>
      {children}
    </Link>
  )
}

export function Botao({
  variante = 'primario',
  tamanho = 'md',
  className = '',
  children,
  ...resto
}: Comuns & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={`${BASE} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...resto}
    >
      {children}
    </button>
  )
}

export function BotaoExterno({
  href,
  variante = 'primario',
  tamanho = 'md',
  className = '',
  children,
  ...resto
}: Comuns & ComponentProps<'a'>) {
  return (
    <a href={href} className={`${BASE} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`} {...resto}>
      {children}
    </a>
  )
}
