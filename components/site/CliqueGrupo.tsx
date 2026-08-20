'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { evento } from '@/lib/eventos'
import type { OrigemClique } from '@/lib/tipos'

/**
 * Envelope fino em volta de um CTA que leva à lista de grupos.
 *
 * Grava `clicou_cta`, NÃO `clicou_grupo`: este botão só rola a tela
 * até a lista. Quem grava a entrada de verdade é a rota /g/[slug],
 * quando a pessoa sai para o WhatsApp. Sem essa separação o painel
 * diria que o hero converte quando ele só rolou a página.
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
      onClick={() => evento('clicou_cta', { origem })}
    >
      {children}
    </Link>
  )
}
