'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { PADRAO } from '@/content/copy'
import { ESQUEMA } from '@/content/esquema'
import { config } from '@/lib/config'
import { hashPadrao } from '@/lib/conteudo/hash'
import { TAG_CONTEUDO } from '@/lib/conteudo/ler'
import { diferenca, validarSecao, type Erros } from '@/lib/conteudo/validar'
import { exigirSessao } from '@/lib/painel/sessao'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export type EstadoConteudo =
  | { ok?: boolean; erro?: string; erros?: Erros; salvoEm?: string }
  | null

export async function salvarSecao(
  _estado: EstadoConteudo,
  dados: FormData,
): Promise<EstadoConteudo> {
  await exigirSessao()

  const secao = String(dados.get('secao') ?? '')
  const esquema = ESQUEMA[secao]
  if (!esquema) return { erro: 'Seção desconhecida.' }

  // ⚠️ O diff é calculado contra o padrão do MOMENTO DO SUBMIT. Se um
  //    deploy mudar copy.ts no meio da edição, um campo não tocado
  //    poderia virar override, ou deixar de ser. O hash pega isso.
  if (String(dados.get('baseHash') ?? '') !== hashPadrao(secao)) {
    return {
      erro: 'O site foi atualizado enquanto você editava. Recarregue a página — o que você digitou ainda não foi salvo.',
    }
  }

  let bruto: unknown
  try {
    bruto = JSON.parse(String(dados.get('dados') ?? '{}'))
  } catch {
    return { erro: 'Não consegui ler o formulário. Recarregue e tente de novo.' }
  }

  const resultado = validarSecao(esquema.campos, bruto)
  if (resultado.erros) {
    return { erro: 'Confira os campos marcados.', erros: resultado.erros }
  }

  if (!config.supabaseAtivo) {
    return { erro: 'Supabase não conectado. Edição indisponível.' }
  }
  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'SUPABASE_SERVICE_ROLE_KEY ausente.' }

  const padrao = (PADRAO as Record<string, unknown>)[secao]
  const override = diferenca(padrao, resultado.ok) ?? {}

  const { error } = await sb
    .from('conteudo')
    .upsert(
      { secao, dados: override, atualizado_por: 'painel' },
      { onConflict: 'secao' },
    )

  if (error) return { erro: error.message }

  // updateTag e não revalidateTag: ele expira na hora e faz a próxima
  // requisição ESPERAR o dado novo, em vez de servir o antigo. É o que
  // se quer quando a pessoa salva e clica em "Ver o site".
  // (Só funciona dentro de Server Action — em Route Handler seria
  // revalidateTag, que no Next 16 exige um perfil de cache.)
  updateTag(TAG_CONTEUDO)
  // Limpa o cache de rota do navegador, que é o que faz o link
  // "Ver o site" mostrar o valor novo.
  revalidatePath('/', 'layout')

  return { ok: true, salvoEm: new Date().toISOString() }
}

/** Devolve a seção ao texto de fábrica. Não apaga o histórico. */
export async function restaurarPadrao(
  _estado: EstadoConteudo,
  dados: FormData,
): Promise<EstadoConteudo> {
  await exigirSessao()

  const secao = String(dados.get('secao') ?? '')
  if (!ESQUEMA[secao]) return { erro: 'Seção desconhecida.' }

  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'Supabase não conectado.' }

  // Zera o override em vez de apagar a linha: a linha carrega o
  // histórico, e `on delete cascade` levaria as versões junto.
  const { error } = await sb
    .from('conteudo')
    .upsert({ secao, dados: {}, atualizado_por: 'painel' }, { onConflict: 'secao' })

  if (error) return { erro: error.message }

  updateTag(TAG_CONTEUDO)
  revalidatePath('/', 'layout')
  return { ok: true }
}

/**
 * Volta uma seção para uma versão anterior.
 *
 * Escrever a versão N de volta gera a versão N+1 — nunca destrutivo,
 * e desfazer o desfazer também funciona.
 */
export async function restaurarVersao(
  _estado: EstadoConteudo,
  dados: FormData,
): Promise<EstadoConteudo> {
  await exigirSessao()

  const secao = String(dados.get('secao') ?? '')
  const versao = Number(dados.get('versao') ?? 0)
  if (!ESQUEMA[secao] || !Number.isInteger(versao) || versao < 1) {
    return { erro: 'Versão inválida.' }
  }

  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'Supabase não conectado.' }

  const { data, error: erroLeitura } = await sb
    .from('conteudo_versoes')
    .select('dados')
    .eq('secao', secao)
    .eq('versao', versao)
    .single()

  if (erroLeitura || !data) return { erro: 'Não encontrei essa versão.' }

  const { error } = await sb
    .from('conteudo')
    .upsert(
      { secao, dados: data.dados, atualizado_por: `painel (restaurou v${versao})` },
      { onConflict: 'secao' },
    )

  if (error) return { erro: error.message }

  updateTag(TAG_CONTEUDO)
  revalidatePath('/', 'layout')
  return { ok: true }
}
