import 'server-only'

import municipiosJson from '@/data/municipios-ro.json'
import gruposLocaisJson from '@/data/grupos.local.json'
import { config } from './config'
import { criarClienteAdmin } from './supabase/admin'
import type { Grupo, Municipio, MunicipioComGrupo, StatusGrupo } from './tipos'

/**
 * Acesso a dados. Uma porta só.
 *
 * Enquanto NEXT_PUBLIC_SUPABASE_URL estiver vazio, tudo vem de
 * data/*.json e o site funciona inteiro. Quando o Supabase entrar,
 * nenhum componente muda: só estas funções passam a consultar o banco.
 */

export const MUNICIPIOS = (municipiosJson as Municipio[])
  .slice()
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

const GRUPOS_LOCAIS = gruposLocaisJson as Grupo[]

export function municipioPorSlug(slug: string): Municipio | undefined {
  return MUNICIPIOS.find((m) => m.slug === slug)
}

/** Todos os grupos, com link. NUNCA devolver isto para o cliente. */
export async function listarGrupos(): Promise<Grupo[]> {
  if (!config.supabaseAtivo) return GRUPOS_LOCAIS

  const sb = criarClienteAdmin()
  if (!sb) return GRUPOS_LOCAIS

  const { data, error } = await sb
    .from('grupos')
    .select('*')
    .order('municipio_slug')
    .order('ordem')

  if (error || !data) return GRUPOS_LOCAIS
  return data as Grupo[]
}

/**
 * O grupo para onde a pessoa deve ir agora, num município.
 *
 * Regra do plano, seção 7:
 *   1. o grupo `fixado` manda, se estiver aberto
 *   2. se estourou o limite de cliques, ele vira `cheio` e o próximo assume
 *   3. na falta de fixado, o menor `ordem` aberto
 */
export async function grupoDeDestino(slug: string): Promise<Grupo | null> {
  const todos = await listarGrupos()
  const doMunicipio = todos
    .filter((g) => g.municipio_slug === slug && g.status !== 'desativado')
    .sort((a, b) => a.ordem - b.ordem)

  if (doMunicipio.length === 0) return null

  const disponivel = (g: Grupo) =>
    g.status === 'aberto' &&
    Boolean(g.link) &&
    (g.limite_cliques === null || g.cliques < g.limite_cliques)

  const fixado = doMunicipio.find((g) => g.fixado)
  if (fixado && disponivel(fixado)) return fixado

  const proximo = doMunicipio.find(disponivel)
  if (proximo) return proximo

  // Nada aberto: devolve o fixado (ou o primeiro) só para a página
  // saber qual status mostrar — "cheio" e "em breve" são mensagens
  // diferentes e a pessoa merece a certa.
  return fixado ?? doMunicipio[0]
}

/** Status público de cada município. Sem link. Isto pode ir pro navegador. */
export async function listarMunicipiosComStatus(): Promise<MunicipioComGrupo[]> {
  const grupos = await listarGrupos()

  const porMunicipio = new Map<string, StatusGrupo>()
  for (const m of MUNICIPIOS) porMunicipio.set(m.slug, 'em_breve')

  for (const slug of porMunicipio.keys()) {
    const doMunicipio = grupos
      .filter((g) => g.municipio_slug === slug && g.status !== 'desativado')
      .sort((a, b) => a.ordem - b.ordem)
    if (doMunicipio.length === 0) continue

    const temAberto = doMunicipio.some(
      (g) =>
        g.status === 'aberto' &&
        Boolean(g.link) &&
        (g.limite_cliques === null || g.cliques < g.limite_cliques),
    )
    if (temAberto) {
      porMunicipio.set(slug, 'aberto')
      continue
    }
    const fixado = doMunicipio.find((g) => g.fixado) ?? doMunicipio[0]
    porMunicipio.set(slug, fixado.status === 'aberto' ? 'cheio' : fixado.status)
  }

  return MUNICIPIOS.map((m) => {
    const status = porMunicipio.get(m.slug) ?? 'em_breve'
    return { ...m, status, disponivel: status === 'aberto' }
  })
}

/** Conta o clique e aplica a virada automática por limite. */
export async function registrarCliqueNoGrupo(grupo: Grupo): Promise<void> {
  if (!config.supabaseAtivo) return
  const sb = criarClienteAdmin()
  if (!sb) return

  const cliques = grupo.cliques + 1
  const estourou = grupo.limite_cliques !== null && cliques >= grupo.limite_cliques

  await sb
    .from('grupos')
    .update({
      cliques,
      status: estourou ? 'cheio' : grupo.status,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', grupo.id)

  // Estourou o fixado: o próximo da fila assume sozinho.
  if (estourou && grupo.fixado) {
    const { data: proximos } = await sb
      .from('grupos')
      .select('id')
      .eq('municipio_slug', grupo.municipio_slug)
      .eq('status', 'aberto')
      .gt('ordem', grupo.ordem)
      .order('ordem')
      .limit(1)

    if (proximos && proximos.length > 0) {
      await sb.from('grupos').update({ fixado: false }).eq('id', grupo.id)
      await sb.from('grupos').update({ fixado: true }).eq('id', proximos[0].id)
    }
  }
}
