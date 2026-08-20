import 'server-only'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { config } from '@/lib/config'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { SLOTS_POR_CHAVE } from '@/content/slots'

export const TAG_MIDIA = 'midia'

export interface ImagemDoSlot {
  url: string
  largura: number
  altura: number
  blur: string | null
  alt: string
  temAlpha: boolean
}

export function urlPublica(balde: string, caminho: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base}/storage/v1/object/public/${balde}/${caminho}`
}

const buscar = unstable_cache(
  async (): Promise<Record<string, ImagemDoSlot>> => {
    if (!config.supabaseAtivo) return {}
    const sb = criarClienteAdmin()
    if (!sb) return {}

    const { data } = await sb
      .from('midia_slots')
      .select('slot, texto_alt, midia(balde, caminho, largura, altura, blur, texto_alt, tem_alpha)')

    const saida: Record<string, ImagemDoSlot> = {}
    for (const linha of (data ?? []) as unknown as {
      slot: string
      texto_alt: string | null
      midia: {
        balde: string
        caminho: string
        largura: number
        altura: number
        blur: string | null
        texto_alt: string | null
        tem_alpha: boolean
      } | null
    }[]) {
      if (!linha.midia) continue
      saida[linha.slot] = {
        url: urlPublica(linha.midia.balde, linha.midia.caminho),
        largura: linha.midia.largura,
        altura: linha.midia.altura,
        blur: linha.midia.blur,
        alt: linha.texto_alt ?? linha.midia.texto_alt ?? SLOTS_POR_CHAVE[linha.slot]?.rotulo ?? '',
        temAlpha: linha.midia.tem_alpha,
      }
    }
    return saida
  },
  ['midia-v1'],
  { tags: [TAG_MIDIA], revalidate: 3600 },
)

/** Deduplicado por requisição, igual ao conteúdo. */
export const lerSlots = cache(async () => buscar())
