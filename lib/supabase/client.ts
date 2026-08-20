'use client'

import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

/**
 * Cliente de navegador. Só enxerga a view `grupos_publicos`,
 * que não tem o campo `link`. Se raspar, não leva nada.
 *
 * Retorna null enquanto o Supabase não estiver conectado.
 */
export function criarClienteNavegador() {
  if (!config.supabaseAtivo) return null
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
