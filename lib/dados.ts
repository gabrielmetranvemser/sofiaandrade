import 'server-only'

import municipiosJson from '@/data/municipios-ro.json'
import localidadesJson from '@/data/localidades-ro.json'
import gruposLocaisJson from '@/data/grupos.local.json'
import { config } from './config'
import { criarClienteAdmin } from './supabase/admin'
import type {
  Grupo,
  Localidade,
  LocalidadeComGrupo,
  Municipio,
  MunicipioComGrupo,
  StatusGrupo,
} from './tipos'

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

/**
 * Os distritos com grupo próprio. Ver o comentário de `Localidade`:
 * não entram na contagem dos 52 nem no mapa, mas têm /g/ próprio.
 */
export const LOCALIDADES = (localidadesJson as Localidade[])
  .slice()
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

export function municipioPorSlug(slug: string): Municipio | undefined {
  return MUNICIPIOS.find((m) => m.slug === slug)
}

export function localidadePorSlug(slug: string): Localidade | undefined {
  return LOCALIDADES.find((l) => l.slug === slug)
}

/** O grupo desta linha é de um distrito, e não da sede? */
function ehDeLocalidade(g: Grupo): boolean {
  return LOCALIDADES.some((l) => l.municipioSlug === g.municipio_slug && l.ordem === g.ordem)
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

const disponivel = (g: Grupo) =>
  g.status === 'aberto' &&
  Boolean(g.link) &&
  (g.limite_cliques === null || g.cliques < g.limite_cliques)

/**
 * O grupo para onde a pessoa deve ir agora, num município ou distrito.
 *
 * Regra do plano, seção 7:
 *   1. o grupo `fixado` manda, se estiver aberto
 *   2. se estourou o limite de cliques, ele vira `cheio` e o próximo assume
 *   3. na falta de fixado, o menor `ordem` aberto
 *
 * Distrito é caso à parte: `/g/iata` tem uma linha só, a dele, e não
 * cai para a sede. Do outro lado, a sede também não herda o grupo do
 * distrito — quem clicou em Guajará-Mirim quer Guajará-Mirim, e mandar
 * essa pessoa para o grupo do Iata seria trocar o destino por baixo do
 * pano. O que existe é a escolha, e ela é oferecida na lista e no mapa.
 */
export async function grupoDeDestino(slug: string): Promise<Grupo | null> {
  const todos = await listarGrupos()

  const localidade = localidadePorSlug(slug)
  if (localidade) {
    const grupo = todos.find(
      (g) => g.municipio_slug === localidade.municipioSlug && g.ordem === localidade.ordem,
    )
    return grupo && grupo.status !== 'desativado' ? grupo : null
  }

  const doMunicipio = todos
    .filter((g) => g.municipio_slug === slug && g.status !== 'desativado' && !ehDeLocalidade(g))
    .sort((a, b) => a.ordem - b.ordem)

  if (doMunicipio.length === 0) return null

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

  /** O estado que a lista mostra para um punhado de grupos do mesmo lugar. */
  function statusDoConjunto(doLugar: Grupo[]): StatusGrupo {
    if (doLugar.length === 0) return 'em_breve'
    if (doLugar.some(disponivel)) return 'aberto'
    // Aberto no banco mas indisponível aqui só acontece por limite de
    // cliques estourado: para quem lê a lista, isso é "cheio".
    const fixado = doLugar.find((g) => g.fixado) ?? doLugar[0]
    return fixado.status === 'aberto' ? 'cheio' : fixado.status
  }

  const vivos = grupos.filter((g) => g.status !== 'desativado')

  return MUNICIPIOS.map((m) => {
    // O grupo do distrito fica FORA da conta da sede: são dois destinos
    // independentes que por acaso dividem o mesmo pedaço do mapa.
    const daSede = vivos
      .filter((g) => g.municipio_slug === m.slug && !ehDeLocalidade(g))
      .sort((a, b) => a.ordem - b.ordem)

    const localidades: LocalidadeComGrupo[] = LOCALIDADES.filter(
      (l) => l.municipioSlug === m.slug,
    ).map((l) => {
      const status = statusDoConjunto(
        vivos.filter((g) => g.municipio_slug === l.municipioSlug && g.ordem === l.ordem),
      )
      return { ...l, status, disponivel: status === 'aberto' }
    })

    const status = statusDoConjunto(daSede)
    return { ...m, status, disponivel: status === 'aberto', localidades }
  })
}

/**
 * Conta o clique e aplica a virada por limite.
 *
 * Delega para a função `contar_clique` no banco, que faz tudo dentro de
 * uma transação com a linha travada. Antes isto era ler-modificar-escrever
 * em JS: dois cliques simultâneos liam o mesmo valor e contavam um só —
 * exatamente o cenário de uma carreata com o mesmo QR circulando.
 */
export async function registrarCliqueNoGrupo(grupo: Grupo): Promise<void> {
  if (!config.supabaseAtivo) return
  const sb = criarClienteAdmin()
  if (!sb) return

  const { error } = await sb.rpc('contar_clique', { p_grupo_id: grupo.id })

  if (error) {
    // Métrica nunca pode impedir a pessoa de entrar no grupo.
    console.error('[contar_clique]', error.message)
  }
}
