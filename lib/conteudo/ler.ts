import 'server-only'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { PADRAO } from '@/content/copy'
import { config } from '@/lib/config'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { mesclar } from './mesclar'
import type { ChaveSecao, Conteudo } from './tipos'

/** Tag única de invalidação. O painel chama updateTag com ela ao salvar. */
export const TAG_CONTEUDO = 'conteudo'

type Overrides = Partial<Record<ChaveSecao, unknown>>

/**
 * Busca no banco, com cache ENTRE requisições.
 *
 * Uma entrada só, com o site inteiro. Cachear por seção daria 20
 * entradas e 20 idas ao banco a frio — pior que uma consulta.
 *
 * O `revalidate` é rede de segurança, não a estratégia: a invalidação
 * de verdade é a tag. Ele existe para o caso da tag se perder (outra
 * região, ou alguém editando direto no SQL editor do Supabase).
 */
const buscarOverrides = unstable_cache(
  async (): Promise<Overrides> => {
    if (!config.supabaseAtivo) return {}
    const sb = criarClienteAdmin()
    if (!sb) return {}

    const { data, error } = await sb.from('conteudo').select('secao, dados')
    if (error || !data) return {}

    const saida: Overrides = {}
    for (const linha of data as { secao: string; dados: unknown }[]) {
      saida[linha.secao as ChaveSecao] = linha.dados
    }
    return saida
  },
  ['conteudo-v1'], // trocar se o formato de armazenamento mudar
  { tags: [TAG_CONTEUDO], revalidate: 3600 },
)

/**
 * O conteúdo do site, já mesclado.
 *
 * `cache()` do React por fora faz a deduplicação POR REQUISIÇÃO: o
 * layout, a página, o generateMetadata e oito componentes pedem, e o
 * banco (ou o cache) é consultado uma vez só. Inverter a ordem dos dois
 * caches perde essa deduplicação.
 *
 * O merge acontece FORA do cache persistido de propósito — nunca gravar
 * um resultado calculado contra um PADRAO que o próximo deploy muda.
 */
export const lerConteudo = cache(async (): Promise<Conteudo> => {
  const overrides = await buscarOverrides()
  return mesclar(PADRAO as unknown as Conteudo, overrides)
})

/**
 * Leitura sem cache, direto do banco. Só para o painel.
 *
 * Se o editor abrisse o formulário pelo cache, veria o valor antigo
 * logo depois de salvar. É um bug fácil de enviar e difícil de explicar.
 */
export async function lerConteudoFresco(): Promise<Conteudo> {
  if (!config.supabaseAtivo) return PADRAO as unknown as Conteudo
  const sb = criarClienteAdmin()
  if (!sb) return PADRAO as unknown as Conteudo

  const { data } = await sb.from('conteudo').select('secao, dados')
  const overrides: Overrides = {}
  for (const linha of (data ?? []) as { secao: string; dados: unknown }[]) {
    overrides[linha.secao as ChaveSecao] = linha.dados
  }
  return mesclar(PADRAO as unknown as Conteudo, overrides)
}
