/**
 * PLACEHOLDER DE IMAGEM.
 *
 * Reserva a proporção exata: quando a imagem real chegar, o layout
 * não se mexe um pixel. Nada de espaço reservado quebrado.
 */

interface Props {
  proporcao?: '1/1' | '4/5' | '3/4' | '16/9' | '9/16' | '3/2' | '5/4'
  rotulo?: string
  nota?: string
  tom?: 'claro' | 'escuro' | 'azul'
  className?: string
  /** Raio da borda. 'lg' é o padrão dos cartões do site. */
  raio?: 'md' | 'lg' | 'xl' | '2xl'
}

const TONS = {
  claro: 'bg-areia text-azul/45 border-linha',
  escuro: 'bg-marinho-2 text-white/40 border-white/12',
  azul: 'bg-azul-suave text-azul/50 border-azul/15',
} as const

const RAIOS = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
} as const

export function QuadroImagem({
  proporcao = '4/5',
  rotulo = 'Imagem',
  nota,
  tom = 'claro',
  className = '',
  raio = 'lg',
}: Props) {
  return (
    <div
      className={`relative isolate flex items-center justify-center overflow-hidden border ${TONS[tom]} ${RAIOS[raio]} ${className}`}
      style={{ aspectRatio: proporcao }}
      role="img"
      aria-label={`Espaço reservado para imagem${nota ? `: ${nota}` : ''}`}
    >
      <svg
        className="absolute inset-0 size-full opacity-50"
        aria-hidden
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-1 px-4 text-center">
        <svg viewBox="0 0 24 24" className="size-7 opacity-80" fill="currentColor" aria-hidden>
          <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9.6l3.7-3.4a1 1 0 0 1 1.36 0L13 15l2.4-2.2a1 1 0 0 1 1.35 0L19 14.8V6H5Zm4.5 1.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Z" />
        </svg>
        <span className="text-sm font-semibold tracking-[-0.01em]">{rotulo}</span>
        <span className="text-xs opacity-70">{proporcao.replace('/', ' : ')}</span>
        {nota ? <span className="mt-1 max-w-[24ch] text-xs leading-relaxed opacity-70">{nota}</span> : null}
      </div>
    </div>
  )
}
