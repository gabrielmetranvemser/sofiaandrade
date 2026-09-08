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
 *
 * ⚠️ `cidadeDoAnuncio` VEM POR PROP, e não do contexto da cidade-alvo,
 *    ainda que na maioria das vezes as duas tenham o mesmo valor. São
 *    perguntas diferentes: o contexto responde "para onde os botões
 *    desta página devem apontar", e esta prop responde "esta visita foi
 *    comprada". A diferença aparece no desvio do redirecionador —
 *    `/grupos?cidade=vilhena&situacao=cheio` — onde os botões devem
 *    mesmo apontar para Vilhena, mas a visita é navegação interna de
 *    alguém que já estava no site. Contá-la como chegada de anúncio
 *    inflaria o denominador do tráfego pago com gente que a campanha
 *    não pagou para trazer. Quem sabe distinguir é a página, e é ela
 *    que decide.
 */
export function RegistroDePagina({
  tipo = 'pagina_vista',
  cidadeDoAnuncio = null,
}: {
  tipo?: TipoEvento
  /** Slug do município, quando a visita chegou por um link de anúncio. */
  cidadeDoAnuncio?: string | null
}) {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('previa')) return
    evento(tipo, cidadeDoAnuncio ? { municipio_slug: cidadeDoAnuncio, origem: 'anuncio' } : {})
    return observarRolagem()
  }, [tipo, cidadeDoAnuncio])

  return null
}
