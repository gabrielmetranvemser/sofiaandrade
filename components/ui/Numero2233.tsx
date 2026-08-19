/**
 * O 2233 como objeto gráfico. É o único elemento que a pessoa precisa
 * lembrar na hora da urna — aparece sempre igual, sempre legível.
 */

interface Props {
  tamanho?: 'sm' | 'md' | 'lg' | 'xl'
  tom?: 'azul' | 'branco' | 'marinho' | 'contorno'
  className?: string
  comLegenda?: boolean
}

const TAMANHOS = {
  sm: 'text-xl px-3 py-1.5 rounded-lg',
  md: 'text-3xl px-4 py-2 rounded-xl',
  lg: 'text-5xl px-6 py-3 rounded-2xl',
  xl: 'text-[clamp(3rem,9vw,5.5rem)] px-8 py-4 rounded-[2rem]',
} as const

const TONS = {
  azul: 'bg-azul text-white',
  branco: 'bg-white text-azul shadow-suave',
  marinho: 'bg-marinho text-white',
  contorno: 'border border-current/25 text-current',
} as const

export function Numero2233({
  tamanho = 'lg',
  tom = 'azul',
  className = '',
  comLegenda = false,
}: Props) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <span
        className={`inline-block font-[family-name:var(--font-titulo)] font-bold leading-none tracking-[-0.04em] tabular-nums ${TAMANHOS[tamanho]} ${TONS[tom]}`}
      >
        2233
      </span>
      {comLegenda ? (
        <span className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
          Deputada Federal
        </span>
      ) : null}
    </div>
  )
}
