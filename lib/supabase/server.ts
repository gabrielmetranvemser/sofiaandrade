import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from '../config'

/**
 * Cliente de servidor com a chave anônima. Respeita RLS.
 * Use para leitura pública em Server Components.
 */
export async function criarClienteServidor() {
  if (!config.supabaseAtivo) return null
  const jar = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (lista: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            lista.forEach(({ name, value, options }) => jar.set(name, value, options))
          } catch {
            // Server Component não pode escrever cookie. O middleware renova.
          }
        },
      },
    },
  )
}
