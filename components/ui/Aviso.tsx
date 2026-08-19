import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  tom?: 'alerta' | 'info' | 'erro' | 'sucesso'
  className?: string
}

const TONS = {
  alerta: 'bg-amarelo-suave text-marinho ring-amarelo/40',
  info: 'bg-azul-suave text-marinho ring-azul/20',
  erro: 'bg-red-50 text-red-900 ring-red-200',
  sucesso: 'bg-verde-suave text-marinho ring-verde/25',
} as const

const ICONES = {
  alerta: 'M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v2h-2V7Zm0 4h2v6h-2v-6Z',
  erro: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v6h-2V7Zm0 8h2v2h-2v-2Z',
  sucesso: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.4-4.2-4.2 1.4-1.4 2.8 2.8 5.8-5.8 1.4 1.4-7.2 7.2Z',
} as const

export function Aviso({ children, tom = 'alerta', className = '' }: Props) {
  return (
    <div
      role={tom === 'erro' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg px-4 py-3.5 text-base ring-1 ${TONS[tom]} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 opacity-70" fill="currentColor" aria-hidden>
        <path d={ICONES[tom]} />
      </svg>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
