'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { SLOTS_POR_CHAVE } from '@/content/slots'
import { config } from '@/lib/config'
import { TAG_MIDIA } from '@/lib/midia/ler'
import { ErroImagem, processarImagem } from '@/lib/midia/processar'
import { exigirSessao } from '@/lib/painel/sessao'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export type EstadoMidia = { ok?: boolean; erro?: string } | null

export async function enviarImagem(
  _estado: EstadoMidia,
  dados: FormData,
): Promise<EstadoMidia> {
  await exigirSessao()

  const chave = String(dados.get('slot') ?? '')
  const slot = SLOTS_POR_CHAVE[chave]
  if (!slot) return { erro: 'Espaço de imagem desconhecido.' }

  const arquivo = dados.get('arquivo')
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: 'Escolha um arquivo.' }
  }

  if (!config.supabaseAtivo) return { erro: 'Supabase não conectado.' }
  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'SUPABASE_SERVICE_ROLE_KEY ausente.' }

  let img
  try {
    img = await processarImagem(arquivo, slot)
  } catch (e) {
    return { erro: e instanceof ErroImagem ? e.message : 'Não consegui processar essa imagem.' }
  }

  const balde = slot.balde ?? 'midia'

  const { error: erroUpload } = await sb.storage
    .from(balde)
    .upload(img.caminho, img.buffer, {
      contentType: 'image/webp',
      // Seguro PORQUE o caminho é o hash do conteúdo.
      cacheControl: '31536000',
      upsert: true,
    })
  if (erroUpload) return { erro: `Falha ao enviar: ${erroUpload.message}` }

  // Reenviar o mesmo arquivo é no-op — daí o onConflict no hash.
  const { data: midia, error: erroMidia } = await sb
    .from('midia')
    .upsert(
      {
        balde,
        caminho: img.caminho,
        largura: img.largura,
        altura: img.altura,
        bytes: img.bytes,
        tem_alpha: img.temAlpha,
        blur: img.blur,
        hash: img.hash,
        texto_alt: String(dados.get('alt') ?? '').trim() || slot.rotulo,
      },
      { onConflict: 'balde,hash' },
    )
    .select('id')
    .single()

  if (erroMidia || !midia) return { erro: erroMidia?.message ?? 'Falha ao registrar a imagem.' }

  const { error: erroSlot } = await sb.from('midia_slots').upsert(
    {
      slot: chave,
      midia_id: midia.id,
      texto_alt: String(dados.get('alt') ?? '').trim() || null,
      atualizado_por: 'painel',
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: 'slot' },
  )
  if (erroSlot) return { erro: erroSlot.message }

  updateTag(TAG_MIDIA)
  revalidatePath('/', 'layout')
  // ⚠️ O CARTÃO DO LINK É UMA ROTA À PARTE, e `revalidatePath('/')`
  //    não a alcança: /opengraph-image não está dentro da árvore da
  //    página, é um arquivo gerado que o WhatsApp busca sozinho.
  //    Sem esta linha, trocar a imagem no painel só apareceria na
  //    próxima revalidação — até uma hora depois, sem nada na tela
  //    explicando a espera.
  revalidatePath('/opengraph-image')
  return { ok: true }
}

/**
 * Tira a imagem do espaço E apaga o arquivo.
 *
 * ⚠️ Apagar só a ligação não basta. O balde é público e o caminho é o
 *    hash, então a URL viveria para sempre. Para uma campanha que
 *    precise retirar uma foto por questão jurídica, isso não é detalhe.
 */
export async function removerImagem(
  _estado: EstadoMidia,
  dados: FormData,
): Promise<EstadoMidia> {
  await exigirSessao()

  const chave = String(dados.get('slot') ?? '')
  if (!SLOTS_POR_CHAVE[chave]) return { erro: 'Espaço desconhecido.' }

  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'Supabase não conectado.' }

  const { data: ligacao } = await sb
    .from('midia_slots')
    .select('midia_id, midia(balde, caminho)')
    .eq('slot', chave)
    .single()

  await sb.from('midia_slots').delete().eq('slot', chave)

  const m = ligacao?.midia as unknown as { balde: string; caminho: string } | null
  if (ligacao?.midia_id && m) {
    // Só apaga o arquivo se nenhum outro espaço ainda o usa.
    const { count } = await sb
      .from('midia_slots')
      .select('slot', { count: 'exact', head: true })
      .eq('midia_id', ligacao.midia_id)

    if (!count) {
      await sb.storage.from(m.balde).remove([m.caminho])
      await sb.from('midia').delete().eq('id', ligacao.midia_id)
    }
  }

  updateTag(TAG_MIDIA)
  revalidatePath('/', 'layout')
  // ⚠️ O CARTÃO DO LINK É UMA ROTA À PARTE, e `revalidatePath('/')`
  //    não a alcança: /opengraph-image não está dentro da árvore da
  //    página, é um arquivo gerado que o WhatsApp busca sozinho.
  //    Sem esta linha, trocar a imagem no painel só apareceria na
  //    próxima revalidação — até uma hora depois, sem nada na tela
  //    explicando a espera.
  revalidatePath('/opengraph-image')
  return { ok: true }
}
