'use client'

import { abrirEscolhasDeCookies } from '@/lib/consentimento-cliente'

/**
 * "Gerenciar cookies": reabre as escolhas do aviso.
 *
 * Retirar uma autorização tem de ser tão fácil quanto dar — é o que a
 * LGPD pede, e é o que o aviso promete. Mora no rodapé de todas as
 * páginas e na política de privacidade.
 */
export function GerenciarCookies({
  rotulo,
  className = '',
}: {
  rotulo: string
  className?: string
}) {
  return (
    <button type="button" onClick={abrirEscolhasDeCookies} className={className}>
      {rotulo}
    </button>
  )
}
