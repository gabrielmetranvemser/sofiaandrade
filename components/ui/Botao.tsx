import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Botão em cápsula.
 *
 * O amarelo é a cor de AÇÃO da campanha — é ele que aponta para o
 * clique que importa. Sempre com texto azul-escuro por cima: amarelo
 * com texto branco não passa em contraste nenhum.
 *
 * Altura mínima de 48px vem daqui e não é sobrescrevível por acidente:
 * é a regra de alvo de toque do plano.
 */

type Variante = 'acao' | 'azul' | 'verde' | 'contorno' | 'claro' | 'suave' | 'texto'
type Tamanho = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  // ação principal — amarelo da marca, texto azul-escuro (6.4:1)
  acao:
    'bg-amarelo text-azul-escuro shadow-media hover:brightness-105 hover:shadow-alta',
  azul:
    'bg-azul text-white shadow-suave hover:bg-azul-escuro hover:shadow-media',
  verde:
    'bg-verde text-white shadow-suave hover:bg-verde-escuro hover:shadow-media',
  contorno:
    'border border-current/30 bg-transparent hover:border-current/70 hover:bg-current/8',
  claro:
    'bg-white text-azul-escuro border border-linha shadow-suave hover:border-azul/40 hover:text-azul',
  suave:
    'bg-azul-suave text-azul-escuro hover:bg-azul hover:text-white',
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
  variante = 'acao',
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
  variante = 'acao',
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
  variante = 'acao',
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
