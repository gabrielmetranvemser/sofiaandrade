'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { PADRAO } from '@/content/copy'
import { ESQUEMA } from '@/content/esquema'
import { config } from '@/lib/config'
import { TAG_CONTEUDO, lerConteudoFresco } from '@/lib/conteudo/ler'
import { escrever } from '@/lib/conteudo/escrever'
import { diferenca, validarSecao } from '@/lib/conteudo/validar'
import { destinosDeVideo } from '@/lib/painel/videos'
import { exigirSessao } from '@/lib/painel/sessao'
import { criarClienteAdmin } from '@/lib/supabase/admin'

/**
 * GRAVA OS VÍDEOS — DE VÁRIAS SEÇÕES DE UMA VEZ.
 *
 * ⚠️ POR QUE UMA AÇÃO PRÓPRIA, e não a de salvar seção.
 *
 *    Os dezessete destinos de vídeo estão espalhados por seis seções.
 *    Quem chega com os arquivos na mão quer preencher tudo numa tela e
 *    apertar salvar UMA vez — obrigar a salvar seção por seção é
 *    devolver ao usuário um problema que é nosso.
 *
 *    O que esta ação faz é agrupar por seção e, para cada uma, seguir
 *    exatamente o mesmo caminho de `salvarSecao`: aplica os caminhos,
 *    valida contra o esquema, calcula o diff contra o padrão e grava.
 *    Nada de atalho — histórico, validação e "voltar ao original"
 *    continuam funcionando igual.
 *
 * ⚠️ SÓ CAMINHO QUE É DESTINO DE VÍDEO DE VERDADE. A lista de destinos
 *    é recalculada AQUI, no servidor, a partir do esquema e do conteúdo
 *    atual — e só ela autoriza uma escrita. Sem isso, este formulário
 *    seria um "escreva qualquer campo em qualquer seção" com nome
 *    bonito: bastaria mandar `caminho: "legal.cnpj"` para reescrever a
 *    identificação eleitoral por uma rota que não confere nada.
 */

export type EstadoVideos = {
  ok?: boolean
  erro?: string
  /** Mensagem por destino, endereçada pelo `id` do destino. */
  erros?: Record<string, string>
  salvos?: number
} | null

interface Envio {
  id: string
  url: string
  formato?: string
  titulo?: string
  opcoes?: Record<string, unknown>
}

export async function salvarVideos(
  _estado: EstadoVideos,
  dados: FormData,
): Promise<EstadoVideos> {
  await exigirSessao()

  let envios: Envio[]
  try {
    envios = JSON.parse(String(dados.get('videos') ?? '[]'))
    if (!Array.isArray(envios)) throw new Error()
  } catch {
    return { erro: 'Não consegui ler o formulário. Recarregue e tente de novo.' }
  }

  if (!config.supabaseAtivo) return { erro: 'Supabase não conectado. Edição indisponível.' }
  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'SUPABASE_SERVICE_ROLE_KEY ausente.' }

  const conteudo = await lerConteudoFresco()
  const destinos = new Map(destinosDeVideo(conteudo).map((d) => [d.id, d]))

  // ── aplica os envios sobre uma cópia do conteúdo, por seção ──
  const porSecao = new Map<string, Record<string, unknown>>()
  for (const envio of envios) {
    const destino = destinos.get(envio.id)
    if (!destino) continue // caminho que não é destino de vídeo: ignorado

    const atual =
      porSecao.get(destino.secao) ??
      ((conteudo as unknown as Record<string, unknown>)[destino.secao] as Record<string, unknown>)

    let proximo = escrever(atual, destino.caminho.split('.'), String(envio.url ?? '').trim())
    if (destino.caminhoFormato && envio.formato) {
      proximo = escrever(proximo, destino.caminhoFormato.split('.'), String(envio.formato))
    }
    // O grupo inteiro de uma vez: a validação percorre o descritor,
    // então chave que o esquema não conhece não sobrevive à passagem.
    if (destino.caminhoTitulo && envio.titulo !== undefined) {
      proximo = escrever(proximo, destino.caminhoTitulo.split('.'), String(envio.titulo))
    }
    if (destino.caminhoOpcoes && envio.opcoes) {
      proximo = escrever(proximo, destino.caminhoOpcoes.split('.'), envio.opcoes)
    }
    porSecao.set(destino.secao, proximo)
  }

  if (porSecao.size === 0) return { ok: true, salvos: 0 }

  // ── valida tudo ANTES de gravar qualquer coisa ──
  // Metade dos vídeos gravados e metade recusada seria o pior dos dois
  // mundos: a tela mostraria erro e o site já teria mudado.
  const erros: Record<string, string> = {}
  const prontos: { secao: string; override: unknown }[] = []

  for (const [secao, valor] of porSecao) {
    const esquema = ESQUEMA[secao]
    if (!esquema) continue

    const resultado = validarSecao(esquema.campos, valor)
    if (resultado.erros) {
      // Traduz o caminho do erro de volta para o destino, senão a
      // mensagem apareceria órfã: quem preencheu não sabe o que é
      // "processos.0.videos.1.url".
      for (const [caminho, mensagem] of Object.entries(resultado.erros)) {
        const destino = [...destinos.values()].find(
          (d) => d.secao === secao && d.caminho === caminho,
        )
        erros[destino?.id ?? `${secao}::${caminho}`] = mensagem
      }
      continue
    }

    const padrao = (PADRAO as Record<string, unknown>)[secao]
    prontos.push({ secao, override: diferenca(padrao, resultado.ok) ?? {} })
  }

  if (Object.keys(erros).length > 0) {
    return { erro: 'Confira os endereços marcados. Nada foi salvo.', erros }
  }

  const { error } = await sb.from('conteudo').upsert(
    prontos.map((p) => ({ secao: p.secao, dados: p.override, atualizado_por: 'painel · vídeos' })),
    { onConflict: 'secao' },
  )
  if (error) return { erro: error.message }

  updateTag(TAG_CONTEUDO)
  revalidatePath('/', 'layout')
  return { ok: true, salvos: envios.filter((e) => destinos.has(e.id)).length }
}
