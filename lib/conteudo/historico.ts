import 'server-only'

import { config } from '@/lib/config'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export interface Versao {
  versao: number
  dados: Record<string, unknown>
  autor: string | null
  criadoEm: string
  /** Quais campos essa versão mudou em relação à anterior. */
  mudou: string[]
}

/**
 * Histórico de uma seção, já com o resumo do que mudou.
 *
 * O diff é calculado aqui e não guardado: guardar diff obrigaria a
 * recalcular tudo sempre que o formato mudasse, e o volume é pequeno.
 */
export async function lerHistorico(secao: string, limite = 20): Promise<Versao[]> {
  if (!config.supabaseAtivo) return []
  const sb = criarClienteAdmin()
  if (!sb) return []

  const { data } = await sb
    .from('conteudo_versoes')
    .select('versao, dados, autor, criado_em')
    .eq('secao', secao)
    .order('versao', { ascending: false })
    .limit(limite)

  const linhas = (data ?? []) as {
    versao: number
    dados: Record<string, unknown>
    autor: string | null
    criado_em: string
  }[]

  return linhas.map((linha, i) => {
    const anterior = linhas[i + 1]?.dados ?? {}
    return {
      versao: linha.versao,
      dados: linha.dados,
      autor: linha.autor,
      criadoEm: linha.criado_em,
      mudou: camposDiferentes(anterior, linha.dados),
    }
  })
}

function camposDiferentes(
  antes: Record<string, unknown>,
  depois: Record<string, unknown>,
): string[] {
  const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)])
  const mudou: string[] = []
  for (const c of chaves) {
    if (JSON.stringify(antes[c]) !== JSON.stringify(depois[c])) mudou.push(c)
  }
  return mudou
}
