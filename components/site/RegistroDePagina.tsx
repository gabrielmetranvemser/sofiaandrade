'use client'

import { useEffect } from 'react'
import { evento, observarRolagem } from '@/lib/eventos'
import type { TipoEvento } from '@/lib/tipos'

/**
 * Dispara `pagina_vista` uma vez e liga as marcas de rolagem.
 * Sem cookie, sem identificador persistente, sem banner de consentimento.
 *
 * ⚠️ `?previa=1` DESLIGA O REGISTRO. O painel mostra a página dentro de
 *    um quadro e a recarrega a cada salvamento — sem esta saída, cada
 *    ajuste de vírgula viraria uma "visita" e o funil da campanha
 *    passaria a medir o trabalho da própria equipe. Métrica que conta o
 *    editor é pior que métrica nenhuma: ela parece verdadeira.
 */
export function RegistroDePagina({ tipo = 'pagina_vista' }: { tipo?: TipoEvento }) {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('previa')) return
    evento(tipo)
    return observarRolagem()
  }, [tipo])

  return null
}
