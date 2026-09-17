import 'server-only'

import { config } from './config'
import { criarClienteAdmin } from './supabase/admin'

/**
 * Leitura das métricas para o painel.
 *
 * Sem Supabase conectado, devolve estrutura vazia — o painel mostra
 * a tela montada, com zeros, e a explicação do porquê. Melhor que
 * uma tela quebrada ou um gráfico com dado inventado.
 */

export interface FunilDia {
  dia: string
  viram_pagina: number
  rolaram_metade: number
  rolaram_fim: number
  buscaram_cidade: number
  usaram_gps: number
  clicaram_cta: number
  clicaram_grupo: number
  abriram_filtro: number
  geraram_filtro: number
  salvaram_filtro: number
  compartilharam_pagina: number
  sessoes: number
}

export interface LinhaMunicipioMetrica {
  slug: string
  nome: string
  cliques: number
  pessoas: number
  bateram_na_porta_fechada: number
}

export interface LinhaSimples {
  rotulo: string
  valor: number
  secundario?: number
}

/** Uma origem de clique: quantos apertaram × quantos entraram de fato. */
export interface LinhaOrigem {
  rotulo: string
  cliquesNoBotao: number
  entradas: number
  pessoas: number
}

/**
 * Uma linha de tráfego pago: a campanha, a cidade e as duas pontas do
 * funil. É a tela que responde "o anúncio de Vilhena valeu a pena".
 */
export interface LinhaCampanha {
  utm: string
  municipioSlug: string | null
  municipio: string | null
  visitas: number
  pessoas: number
  entradas: number
}

/**
 * Um dia de tráfego de anúncio numa das duas páginas em que ele pode
 * cair: a home (`anuncio`) ou a página de entrada (`lp`). É a tela da
 * regra de parada de 17/09 — ver a migration 0017.
 */
export interface LinhaEntrada {
  dia: string
  pagina: 'anuncio' | 'lp'
  visitas: number
  tocaram: number
  sairam: number
  naoAbriu: number
}

export interface Metricas {
  ativo: boolean
  funil: FunilDia[]
  porMunicipio: LinhaMunicipioMetrica[]
  porOrigem: LinhaOrigem[]
  porUtm: LinhaSimples[]
  porDispositivo: LinhaSimples[]
  porCampanha: LinhaCampanha[]
  porPaginaDeEntrada: LinhaEntrada[]
}

const VAZIO: Metricas = {
  ativo: false,
  funil: [],
  porMunicipio: [],
  porOrigem: [],
  porUtm: [],
  porDispositivo: [],
  porCampanha: [],
  porPaginaDeEntrada: [],
}

export async function carregarMetricas(): Promise<Metricas> {
  if (!config.supabaseAtivo) return VAZIO
  const sb = criarClienteAdmin()
  if (!sb) return VAZIO

  const [funil, municipios, origens, utms, dispositivos, campanhas, entradas] = await Promise.all([
    sb.from('metricas_funil_dia').select('*').limit(30),
    sb.from('metricas_por_municipio').select('*').limit(60),
    sb.from('metricas_por_origem').select('*'),
    sb.from('metricas_por_utm').select('*').limit(20),
    sb.from('metricas_por_dispositivo').select('*'),
    // 60 linhas: a campanha roda um conjunto por município, e são 52.
    sb.from('metricas_por_campanha').select('*').limit(60),
    // Duas linhas por dia (home e página de entrada), duas semanas.
    sb.from('metricas_pagina_de_entrada').select('*').limit(28),
  ])

  return {
    ativo: true,
    funil: (funil.data ?? []) as FunilDia[],
    porMunicipio: (municipios.data ?? []) as LinhaMunicipioMetrica[],
    porOrigem: (origens.data ?? []).map((r: Record<string, unknown>) => ({
      rotulo: String(r.origem),
      cliquesNoBotao: Number(r.cliques_no_botao ?? 0),
      entradas: Number(r.entradas_em_grupo ?? 0),
      pessoas: Number(r.pessoas ?? 0),
    })),
    porUtm: (utms.data ?? []).map((r: Record<string, unknown>) => ({
      rotulo: String(r.utm),
      valor: Number(r.visitas ?? 0),
      secundario: Number(r.cliques_grupo ?? 0),
    })),
    porDispositivo: (dispositivos.data ?? []).map((r: Record<string, unknown>) => ({
      rotulo: String(r.dispositivo),
      valor: Number(r.pessoas ?? 0),
      secundario: Number(r.cliques_grupo ?? 0),
    })),
    // A view é nova (migration 0016). Enquanto ela não estiver aplicada,
    // `data` vem nulo e a tela mostra o estado vazio — nada quebra.
    porCampanha: (campanhas.data ?? []).map((r: Record<string, unknown>) => ({
      utm: String(r.utm ?? ''),
      municipioSlug: r.municipio_slug ? String(r.municipio_slug) : null,
      municipio: r.municipio ? String(r.municipio) : null,
      visitas: Number(r.visitas ?? 0),
      pessoas: Number(r.pessoas ?? 0),
      entradas: Number(r.entradas ?? 0),
    })),
    // Mesma regra da view acima: sem a migration 0017, vem vazio.
    porPaginaDeEntrada: (entradas.data ?? []).map((r: Record<string, unknown>) => ({
      dia: String(r.dia ?? ''),
      pagina: r.pagina === 'lp' ? 'lp' : 'anuncio',
      visitas: Number(r.visitas ?? 0),
      tocaram: Number(r.tocaram ?? 0),
      sairam: Number(r.sairam_para_whatsapp ?? 0),
      naoAbriu: Number(r.whatsapp_nao_abriu ?? 0),
    })),
  }
}

/** Soma um período do funil, para os cartões do topo. */
export function somarFunil(funil: FunilDia[], dias: number) {
  const recorte = funil.slice(0, dias)
  const soma = (campo: keyof FunilDia) =>
    recorte.reduce((t, d) => t + Number(d[campo] ?? 0), 0)

  const viram = soma('viram_pagina')
  const clicaram = soma('clicaram_grupo')
  const geraram = soma('geraram_filtro')

  return {
    viram,
    rolaramMetade: soma('rolaram_metade'),
    buscaram: soma('buscaram_cidade'),
    clicaramCta: soma('clicaram_cta'),
    clicaram,
    abriramFiltro: soma('abriram_filtro'),
    geraram,
    salvaram: soma('salvaram_filtro'),
    compartilharam: soma('compartilharam_pagina'),
    // A conta que decide se o problema é a copy, o botão ou o grupo.
    taxaClique: viram > 0 ? (clicaram / viram) * 100 : 0,
    taxaFiltro: viram > 0 ? (geraram / viram) * 100 : 0,
  }
}
