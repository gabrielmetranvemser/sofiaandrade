'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { evento } from '@/lib/eventos'
import type { OrigemClique } from '@/lib/tipos'

/**
 * Envelope fino em volta de um CTA de grupo, só para registrar de
 * onde partiu o clique. Mantém o resto do hero como Server Component.
 */
export function CliqueGrupo({
  origem,
  children,
  href = '/#grupos',
  className = '',
}: {
  origem: OrigemClique
  children: ReactNode
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => evento('clicou_grupo', { origem })}
    >
      {children}
    </Link>
  )
}
