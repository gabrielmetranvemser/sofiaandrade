import 'server-only'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { config } from './config'
import { criarClienteAdmin } from './supabase/admin'

/**
 * Quantas pessoas já geraram a foto com o número.
 *
 * O dado já existe: é a contagem de sessões distintas com o evento
 * gerou_filtro. Prova social sem inventar número — e sem pedir nada a
 * ninguém.
 *
 * O PISO é a parte que importa. "3 pessoas já colocaram o 2233 na
 * foto" trabalha CONTRA a campanha: mostra que ninguém está usando.
 * Abaixo do piso a função devolve null e a página não mostra linha
 * nenhuma, em vez de mostrar um número pequeno.
 */
const PISO = 50

async function contar(): Promise<number | null> {
  if (!config.supabaseAtivo) return null
  const sb = criarClienteAdmin()
  if (!sb) return null

  // head:true traz só o total, sem trafegar linha nenhuma. O índice
  // (tipo, criado_em desc) atende o filtro.
  const { count, error } = await sb
    .from('eventos')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'gerou_filtro')

  if (error || count === null) return null
  return count
}

const buscar = unstable_cache(contar, ['apoios-v1'], { revalidate: 300 })

/**
 * Devolve o número, ou null quando ainda não vale mostrar.
 *
 * Cinco minutos de cache: é prova social, não placar. Consultar a cada
 * visita seria uma contagem no banco por pessoa que abre a página, e
 * ninguém repara que o número demorou cinco minutos para subir.
 */
export const lerApoios = cache(async (): Promise<number | null> => {
  const n = await buscar()
  return n !== null && n >= PISO ? n : null
})

/** Formatado no padrão brasileiro: 1.284. */
export function formatarApoios(n: number): string {
  return n.toLocaleString('pt-BR')
}
