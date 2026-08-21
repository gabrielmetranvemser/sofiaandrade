export type StatusGrupo = 'aberto' | 'em_breve' | 'cheio' | 'desativado'

export interface Municipio {
  slug: string
  nome: string
  latitude: number
  longitude: number
}

export interface Grupo {
  id: string
  municipio_slug: string
  ordem: number
  /** NUNCA exposto ao navegador. Só existe no servidor. */
  link: string | null
  status: StatusGrupo
  fixado: boolean
  limite_cliques: number | null
  cliques: number
  observacao: string | null
}

/** O que o navegador pode ver. Sem `link`. */
export interface GrupoPublico {
  municipio_slug: string
  ordem: number
  status: StatusGrupo
  fixado: boolean
}

/**
 * Distrito com grupo próprio, pendurado num dos 52.
 *
 * Existe porque a campanha abriu grupo em lugar que não é município —
 * Iata, em Guajará-Mirim, e Rio Pardo, no fim da estrada de Buritis.
 * Cada um tem nome, slug e /g/ próprios, e a pessoa de lá escolhe o
 * seu, não o da sede.
 *
 * NÃO é município e não finge ser: fica fora da contagem dos 52, fora
 * do mapa (distrito não tem contorno na malha do IBGE) e fora da
 * geolocalização, que compara sedes municipais. No mapa aparece como
 * segunda opção DENTRO do bloco do município que o ancora.
 *
 * `ordem` é a do grupo na tabela `grupos`: é assim que o distrito acha
 * a própria linha sem precisar de coluna nova no banco.
 */
export interface Localidade {
  slug: string
  nome: string
  municipioSlug: string
  ordem: number
}

/** Município + estado do seu grupo fixado, pronto para a lista. */
export interface MunicipioComGrupo extends Municipio {
  status: StatusGrupo
  disponivel: boolean
  /** Distritos com grupo próprio dentro deste município. Quase sempre vazio. */
  localidades: LocalidadeComGrupo[]
}

export interface LocalidadeComGrupo extends Localidade {
  status: StatusGrupo
  disponivel: boolean
}

/**
 * O mínimo para uma linha da lista ou um botão do mapa: um nome, um
 * slug para o /g/, e em que pé está o grupo. Município e distrito
 * entram os dois por aqui.
 */
export interface Destino {
  slug: string
  nome: string
  status: StatusGrupo
  disponivel: boolean
  /**
   * Município que ancora este destino. Só distrito preenche, e é ele
   * que a métrica grava: o painel conta por município, e uma linha
   * "iata" ali seria um lugar que a tabela de municípios não conhece.
   */
  municipioSlug?: string
}

export type TipoEvento =
  | 'pagina_vista'
  | 'rolou_50'
  | 'rolou_90'
  | 'buscou_cidade'
  | 'usou_localizacao'
  /** apertou um botão que leva à lista de grupos — NÃO é entrada em grupo */
  | 'clicou_cta'
  /** saiu de fato para o WhatsApp. Só a rota /g/[slug] grava este. */
  | 'clicou_grupo'
  | 'entrou_grupo_indisponivel'
  | 'abriu_filtro'
  | 'subiu_foto'
  | 'gerou_filtro'
  | 'baixou_filtro'
  | 'compartilhou_filtro'
  | 'compartilhou_pagina'
  | 'clicou_instagram'

/** De onde no layout partiu o clique. Responde "qual botão trabalha". */
export type OrigemClique =
  | 'hero'
  | 'topo'
  | 'flutuante'
  | 'lista'
  | 'busca'
  | 'geo'
  | 'mapa'
  | 'cta_final'
  | 'rodape'
  | 'grupos_pagina'
  | 'qr'
  | 'direto'

export interface Evento {
  tipo: TipoEvento
  municipio_slug?: string | null
  grupo_id?: string | null
  origem?: OrigemClique | null
  utm?: string | null
  sessao?: string | null
  dispositivo?: 'celular' | 'desktop' | null
}
