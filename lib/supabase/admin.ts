import 'server-only'

import { createClient } from '@supabase/supabase-js'

/**
 * ⚠️ CHAVE service_role. Ignora RLS.
 *
 * O `import 'server-only'` no topo faz o build QUEBRAR se algum
 * componente de cliente importar este arquivo por engano. É a
 * mitigação do risco "service_role vazar pro navegador" do plano.
 *
 * Só pode ser usada em:
 *   app/g/[slug]/route.ts     (ler o link real e contar o clique)
 *   app/api/evento/route.ts   (gravar evento)
 *   app/painel/**             (leitura e escrita administrativa)
 */
export function criarClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !chave) return null

  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-origem': 'sofia2233-admin' } },
  })
}
