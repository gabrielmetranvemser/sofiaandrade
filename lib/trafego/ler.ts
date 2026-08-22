import 'server-only'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { config } from '@/lib/config'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { TRAFEGO_VAZIO, type Trafego, type TrafegoPublico } from './tipos'

export const TAG_TRAFEGO = 'trafego'

/**
 * A configuração de rastreamento.
 *
 * ⚠️ ESTA FUNÇÃO DEVOLVE UM SEGREDO. Chamá-la de um componente que
 *    depois passa o objeto inteiro como prop para um Client Component
 *    publicaria o token da Conversions API no HTML — e um token de
 *    CAPI vazado deixa qualquer pessoa escrever conversão falsa no
 *    pixel da campanha, o que envenena a otimização do anúncio antes
 *    de alguém perceber.
 *
 *    Para a fronteira existe `lerTrafegoPublico`, logo abaixo. Use
 *    aquela em tudo que desce para o navegador; esta só onde o dado
 *    não sai do servidor: as duas rotas que falam com a Graph API e a
 *    tela do painel (que mascara antes de renderizar).
 */
const buscar = unstable_cache(
  async (): Promise<Trafego> => {
    if (!config.supabaseAtivo) return TRAFEGO_VAZIO
    const sb = criarClienteAdmin()
    if (!sb) return TRAFEGO_VAZIO

    const { data, error } = await sb.from('trafego').select('*').eq('id', true).maybeSingle()
    if (error || !data) return TRAFEGO_VAZIO

    const l = data as Record<string, unknown>
    const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

    return {
      metaPixelId: texto(l.meta_pixel_id),
      gtmId: texto(l.gtm_id),
      metaDominio: texto(l.meta_dominio),
      capiToken: texto(l.meta_capi_token),
      capiTeste: texto(l.meta_capi_teste),
      apiVersao: texto(l.meta_api_versao) || TRAFEGO_VAZIO.apiVersao,
      capiAtiva: l.capi_ativa !== false,
      atualizadoEm: texto(l.atualizado_em) || null,
      atualizadoPor: texto(l.atualizado_por) || null,
    }
  },
  ['trafego-v1'],
  { tags: [TAG_TRAFEGO], revalidate: 3600 },
)

export const lerTrafego = cache(async () => buscar())

/**
 * O recorte que pode atravessar para o navegador.
 *
 * Três ids que, por natureza, ficam visíveis no HTML de qualquer site
 * que use pixel — não há segredo nenhum aqui, e é por isso que este
 * recorte existe: para que o token NÃO precise passar por perto.
 */
export async function lerTrafegoPublico(): Promise<TrafegoPublico> {
  const t = await lerTrafego()
  return { metaPixelId: t.metaPixelId, gtmId: t.gtmId, metaDominio: t.metaDominio }
}
