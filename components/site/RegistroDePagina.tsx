'use client'

import { useEffect } from 'react'
import { evento, observarRolagem } from '@/lib/eventos'
import type { TipoEvento } from '@/lib/tipos'

/**
 * Dispara `pagina_vista` uma vez e liga as marcas de rolagem.
 * Sem cookie, sem identificador persistente, sem banner de consentimento.
 */
export function RegistroDePagina({ tipo = 'pagina_vista' }: { tipo?: TipoEvento }) {
  useEffect(() => {
    evento(tipo)
    return observarRolagem()
  }, [tipo])

  return null
}
